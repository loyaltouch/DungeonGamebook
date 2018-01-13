/** 
 * 敵や味方など、キャラクターのクラス
 *
 * @class Chara
 */
class Chara{
  /**
   * コンストラクター
   *
   * @method Chara
   * @param {String} id 変数などで使うキャラの識別名
   * @param {String} name キャラの表示名
   * @param {Number} vit 体力の初期値および最大値
   * @param {Number} dex 技量値
   * @param {Number} lck 運の初期値および最大値
   */
  constructor(id, name, vit, dex, lck){
    this.id = id;
    this.name = name;
    this.vit_max = this.vit_now = vit;
    this.dex = dex;
    this.lck_max = this.lck_now = lck;
    this.equip = { name: "(なし)", type: 1, value: 0, prise: 0 };
  }

  /**
   * 現在の装備と技量点から攻撃点を求める
   * 
   * @method get_dex
   * @return {Number} 攻撃点
   */
  get_dex(){
    return this.dex + this.equip.value;
  }

  /**
   * 引数値分回復する
   * 原体力点以上は回復しない
   * また、引数がマイナスでもダメージを受けない
   * 
   * @method cure
   * @param {Number} value 回復量
   */
  cure(value){
    if(value > 0){
      this.vit_now += value;
      if(this.vit_now > this.vit_max){
        this.vit_now = this.vit_max;
      }
    }
  }

  /**
   * 引数値分ダメージを受ける
   * 引数がマイナスでも回復しない
   * 
   * @method damage
   * @param {Integer} value ダメージ量
   */
  damage(value){
    if(value > 0){
      this.vit_now -= value;
    }
  }
}

/**
 * シナリオjsonでは記述が難しい複雑な関数を
 * jsで定義するクラス
 * 
 * @class Macro
 */
class Macro{
  get_apple(g, text){
    let value = +text;
    g.local[0] = value;
    if(value > 0 && g.items.りんご.count + value <= 5){
      return "1_4_1";
    }else if(value > 0 && g.items.りんご.count + value > 5){
      return "1_4_2";
    }else{
      return "1_4_3";
    }
  }
}

/**
 * ゲームのメインロジックを提供するクラス
 *
 * @class Game
 */
class Game{

  /**
   * コンストラクター
   * @method Game
   */
  constructor(){
    this.items = get_item_data();
    this.members = {};
    this.global = {};
    this.local = [];
    this.select = [];
    this.message = "";
    this.scene = "start";
    this.initiative = null;
    this.macro = new Macro();
    this.startup();
  }

  /**
   * シーン遷移の際に呼び出される関数<br>
   * 遷移の直前にセーブ用データをダンプし、ローカル変数をリセットする
   *
   * <ol>
   * <li>startup : データ初期化(最初に戻る)
   * <li>セーブ用データのダンプ
   * <li>if : if条件による条件分岐
   * <li>set : ダンプに対して各種フラグを設定し、ステータスに反映
   * <li>message : 本文の反映
   * <li>image : 画像の反映
   * <li>select : 選択肢の反映
   * <li>next : 特殊選択肢「≫次へ」の反映
   * <li>prev : 特殊選択肢「≫戻る」の反映
   * <li>input : 入力欄の有効化／無効化
   * <li>「あなた」の体力が0以下なら選択肢を無効化してゲームオーバーに遷移
   * <li>ローカルフラグの初期化
   * </ol>
   *
   * @method set_scene
   * @param {Object} data シナリオjsonをパースしたデータ
   */
  set_scene(data){
    // 各種変数の初期化
    this.select = [];
    this.input = "";
    
    // 初期化処理
    if(data.startup){
      this.startup();
    }

    // セーブ用データの確保
    this.dump = this.save_to_dump();

    // 条件ロジック
    if(data.if){
      this.parse_condition(this.dump, data);
    }
    
    // 各種フラグ処理の確認
    if(data.set){
      this.set_flags(data.set);
      // ステータスに反映
      this.load_from_dump(this.dump);
    }

    // 運勢値リセット(祭壇への祈り)の処理
    if(data.setluck){
      this.members.you.lck_max = this.members.you.lck_now = data.setluck;
    }

    // メッセージのパース
    if(data.message){
      this.message = this.rep_val(data.message);
    }

    // 画像データのパース
    if(data.image){
      this.image = data.image;
    }

    // 敵データのパース
    if(data.enemy){
      this.encounter(data.enemy);
    }

    // 戦闘終了判定のパース
    if(data.end){
      this.end = data.end;
    }

    // 店売り機能のパース
    if(data.shop){
      for(let i = 0; i < data.shop.length; i++){
        this.select.push({label: `${data.shop[i]}を買う(銀貨${this.items[data.shop[i]].prise}枚)`, func: "do_buy", link: data.shop[i]});
      }
      this.select.push({label: "持ち物を売る", func: "do_buy", link: "sell"});
    }
    
    // 選択肢のパース
    if(data.select){
      for(let i = 0; i < data.select.length; i += 2){
        this.select.push(this.make_sel(data.select[i], data.select[i + 1]));
      }
    }

    // 「次へ」選択肢のパース
    if(data.next){
      this.select.push(this.make_sel("≫次へ", data.next));
    }

    // 「戻る」選択肢のパース
    if(data.prev){
      this.select.push(this.make_sel("≫戻る", data.prev));
    }

    // 入力欄のパース
    if(data.input){
      this.input = data.input;
    }

    // シナリオ内運試しのパース
    if(data.lucky){
      this.select.push({
        label: "運試しをする",
        func: "do_luck_test",
        link: ""
      });
      this.luck_success = data.lucky[0];
      this.luck_failure = data.lucky[1];
    }

    // ゲームオーバーの確認
    this.check_game_over();

    // ローカルフラグはすべて初期化
    for(let i = 0; i < this.local.length; i++){
      this.local[i] = 0;
    }
  }

  /**
   * ifタグがtrueだった場合、メッセージ・フラグ・選択肢を更新
   *
   * @method parse_condition
   * @param {Object} input 入力データ
   * @param {Object} target 更新対象のデータ
   */
  parse_condition(input, target){
    for(let cond of target.if){
      if(this.check_condition(input, cond)){
        // メッセージ追記
        if(cond[4].message){
          if(target.message){
            target.message += cond[4].message;
          }else{
            target.message = cond[4].message;
          }
        }
        // フラグ設定追加
        if(cond[4].set){
          if(target.set){
            cond[4].set.forEach(item =>{
              target.set.push(item);
            });
          }else{
            target.set = cond[4].set;
          }
        }
        // 選択肢追加
        if(cond[4].select){
          if(target.select){
            for(let ii in cond[4].select){
              target.select.push(cond[4].select[ii]);
            }
          }else{
            target.select = cond[4].select;
          }
        }
        // 敵データの更新
        if(cond[4].enemy){
          target.enemy = cond[4].enemy;
        }
        return;
      }
    }
  }

  check_condition(input, cond){
    let judge = 0;
    if(input[cond[1]] && input[cond[1]][cond[2]]){
      judge = input[cond[1]][cond[2]];
    }
    if(cond[0] == 0){
      return true;
    }else if(cond[0] == "="){
      return judge == cond[3];
    }else if(cond[0] == ">"){
      return judge > cond[3];
    }else if(cond[0] == "<"){
      return judge < cond[3];
    }
    return false;
  }

  set_flags(data){
    data.forEach(entry =>{
      // フラグを数値に変換
      let reped = this.rep_val(entry[3]);
      let value = +reped;
      
      // 最初の項目はフラグに対する操作
      if(entry[0] == "+"){
        this.dump[entry[1]][entry[2]] = (this.dump[entry[1]][entry[2]] || 0) + value;
      }else if(entry[0] == "="){
        this.dump[entry[1]][entry[2]] = value;
      }
    });
  }

  check_game_over(){
    if(this.members.you.vit_now <= 0){
      this.message += "\nあなたは死亡した…\n";
      this.select = [this.make_sel("≫終わり", "start")];
      this.input = false;
      this.buttle = false;
      this.target = null;
    }
  }

  /**
   * 戦闘開始
   *
   * @param {Object} data 敵データ
   */
  encounter(data){
    this.buttle = true;
    let enemy = new Chara("enemy", data.name, data.vit, data.dex, 0);
    this.members.enemy = enemy;
    this.message = `${enemy.name}と戦闘開始！\n`;
    this.init_turn();
  }

  /**
   * ターン開始
   */
  init_turn(){
    this.target = null;
    this.select = [{
      label: "戦う",
      func: "do_attack",
      link: ""
    }];
  }

  /**
   * 攻撃開始
   *
   * @method do_attack
   */
  do_attack(){
    // 攻撃者決定
    let you_dex = this.members.you.get_dex() + this.rand();
    let enm_dex = this.members.enemy.get_dex() + this.rand();

    this.target = this.members.enemy;
    if(you_dex < enm_dex){
      this.target = this.members.you;
    }

    this.message = `あなたの攻撃力 = ${you_dex}\n${this.members.enemy.name}の攻撃力 = ${enm_dex}\nダメージを受けるのは : ${this.target.name}\n`;
    this.damage = 2;
    this.select = [
      {
      label: "≫次へ",
      func: "next_turn",
      link: ""
      },
      {
      label: "運試しをする",
      func: "do_luck_test",
      link: ""
      }
    ];
  }

  /**
   * 次のターンに行くかどうかの判定
   *
   * @method next_turn
   */
  next_turn(){
    // ダメージの決定
    this.target.vit_now -= this.damage;
    this.message += this.damage + "ダメージ\n";
    if(this.members.enemy.vit_now <= 0){
      this.message += "あなたの勝利！";
      this.select = [this.make_sel("≫次へ", this.end)];
      this.buttle = false;
    }else{
      this.init_turn();
      this.check_game_over();
    }
  }

  /**
   * シナリオ内での運試し
   * 運試し成功の場合
   * 
   *
   */
  scenario_luck_test(){
    if(this.luck_test()){
      this.select = [this.make_sel("≫次へ", this.luck_success)];
    }else{
      this.select = [this.make_sel("≫次へ", this.luck_failure)];
    }
  }

  /**
   *  戦闘中での運試し
   *
   */
  buttle_luck_test(){
    if(this.luck_test()){
      if(this.target == this.members.you){
        this.damage = 1;
      }else{
        this.damage = 3;
      }
    }else{
      if(this.target == this.members.you){
        this.damage = 3;
      }else{
        this.damage = 1;
      }
    }
    this.select = [{
      label: "≫次へ",
      func: "next_turn",
      link: ""
    }];
  }

  /**
   * 運試し
   * 運試しを行うたびに、運は1点減少する
   * ただし、運は2未満にはならない
   *
   * @return {boolean} 運試し成功/失敗
   */
  luck_test(){
    let luck_result = this.rand();
    let result = this.members.you.lck_now >= luck_result;
    this.message = `あなたの運 = ${this.members.you.lck_now}\n判定値 = ${luck_result}\n運試し`;
    if(result){
      this.message += "成功\n";
    }else{
      this.message += "失敗\n";
    }
    if(this.members.you.lck_now > 2){
      this.members.you.lck_now--;
    }
    return result;
  }

  equip_weapon(item_name){
    this.equip = item_name;
    this.members.you.equip = this.safe_get_item(item_name, 1);
  }

  do_buy(item_name){
    this.select = [];
    if(item_name == "sell"){
      this.build_sell_selection();
    }else{
      if(this.items.銀貨.count >= this.items[item_name].prise){
        this.items[item_name].count++;
        this.items.銀貨.count -= this.items[item_name].prise;
        this.message = `${item_name}を手に入れた\n`;
      }else{
        this.message = "お金が足りない\n";
      }
      this.select.push(this.make_sel("≫戻る", this.scene));
    }
  }
  
  build_sell_selection(){
    this.select = [];
    let sellable = false;
    for(const item_name in this.items){
      const item = this.items[item_name];
      if(item.type == 1 && item.count > 0 && item_name != this.members.you.equip.name){
        this.select.push({
        label: `${item_name}を売る(銀貨${item.prise}枚)`,
        func: "do_sell",
        link: item_name
        });
        sellable = true;
      }
    }
    if(!sellable){
      this.message = "装備していない武器がないので、売ることができない\n";
    }
    this.select.push(this.make_sel("≫戻る", this.scene));
  }

  do_sell(item_name){
    this.items[item_name].count--;
    this.items.銀貨.count += this.items[item_name].prise;
    this.message = `${item_name}を売った\n`;
    this.select = [];
    this.select.push(this.make_sel("≫戻る", this.scene));
  }

  safe_get_item(item_name, type){
    let result = this.items[0];
    if(this.items[item_name] && this.items[item_name].type == type){
      result =  this.items[item_name];
    }
    result.name = item_name;
    return result;
  }

  feed(item_name){
    let item = this.safe_get_item(item_name, 2);
    if(item.type == 2 && item.count > 0){
      item.count--;
      this.members.you.cure(999);
    }
  }

  get_inventory(type){
    let items = this.items;
    let result = [];
    for(let iname in items){
      if(items[iname].type == type && items[iname].count > 0){
        result.push(iname);
      }
    }
    return result;
  }

  save_to_dump(){
    const you = this.members.you;
    let dump = {
      you:{
        vit_max: you.vit_max,
        vit_now: you.vit_now,
        dex_max: you.dex,
        lck_max: you.lck_max,
        lck_now: you.lck_now,
        equip: you.equip.name
      }
    };
    dump.item = {};
    for(let item_name in this.items){
      if(this.items[item_name].count > 0){
        dump.item[item_name] = this.items[item_name].count;
      }
    }
    dump.flag = this.global;
    dump.scene = this.scene;
    return dump;
  }

  load_from_dump(dump){
    if(dump.you){
      this.load_you(dump.you);
    }
    if(dump.item){
      this.load_item(dump.item);
    }
    if(dump.flag){
      this.global = dump.flag;
    }
    if(dump.scene){
      this.scene = dump.scene;
    }
  }

  load_you(data){
    let you = this.members.you;
    ["vit_max", "vit_now", "dex", "lck_max", "lck_now"].forEach(status =>{
      if(!isNaN(data[status])){
        you[status] = data[status];
      }
    });
    if(data.equip){
      this.equip_weapon(data.equip);
    }
  }

  load_item(data){
    for(let item_name in data){
      if(this.items[item_name]){
        this.items[item_name].count = data[item_name];
      }
    }
  }

  startup(){
    var you = new Chara("you", "あなた", 12, 7, 9);
    this.members.you = you;
    this.equip_weapon("ナイフ");
    this.members.enemy = {};
  }

  rand(){
    return this.randi(6) + this.randi(6);
  }

  randi(max){
    return Math.floor(Math.random() * max) + 1;
  }

  rep_val(text){
    try{
      return text.replace(/\$\{(.)\}/g, (hit0, hit1) =>{
        // ${n}ローカルフラグの置き換え
        if(hit1.match(/^[0123456789]$/)){
          return this.local[hit1];
        }
        // ${x}グローバルフラグの置き換え
        return this.global[hit1] || hit0;
      });
    }catch(e){
      // 変換できない場合、値をそのまま返す
      return text;
    }
  }

  /**
   * 選択リンク用のオブジェクトを生成する。オブジェクトは
   * <ul>
   * <li>label : 表示名
   * <li>func : "do_select" 固定
   * <li>link : 遷移先のシナリオファイル名
   * </ul>
   * の構造である。なお、各値は${...}を展開する
   *
   * @method make_sel
   * @param {String} label 表示名
   * @param {String} link 遷移先
   * @return {Object} 生成したリンク用オブジェクト
   */
  make_sel(label, link){
    return {
      label: this.rep_val(label),
      func: "do_select",
      link: this.rep_val(link)
    };
  }
}
