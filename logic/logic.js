class Chara{
  constructor(id, name, vit, dex, lck){
    this.id = id;
    this.name = name;
    this.vit_max = this.vit_now = vit;
    this.dex = dex;
    this.lck_max = this.lck_now = lck;
    this.equip = { name: "(なし)", type: 1, value: 0, prise: 0 };
  }

  get_dex(){
    return this.dex + this.equip.value;
  }

  cure(value){
    if(value > 0){
      this.vit_now += value;
      if(this.vit_now > this.vit_max){
        this.vit_now = this.vit_max;
      }
    }
  }

  damage(value){
    if(value > 0){
      this.vit_now -= value;
    }
  }
}

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

class Game{
  constructor(){
    this.items = get_item_data();
    this.members = {};
    this.global = {};
    this.local = [];
    this.message = "";
    this.scene = "start";
    this.macro = new Macro();
    this.startup();
  }

  set_scene(data){
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

    // メッセージのパース
    if(data.message){
      let message2 = data.message.replace(/\$\{(.)\}/g, (hit0, hit1) =>{
        // ${n}ローカルフラグの置き換え
        if(hit1.match(/^[0123456789]$/)){
          return this.local[hit1];
        }
        // ${x}グローバルフラグの置き換え
        return this.global[hit1] || hit0;
      });
      this.message = message2;
    }

    // 画像データのパース
    if(data.image){
      this.image = data.image;
    }

    // 選択肢のパース
    this.select = [];
    if(data.select){
      for(let i = 0; i < data.select.length; i += 2){
        let entry = {label: data.select[i], link: data.select[i + 1]};
        this.select.push(entry);
      }
    }

    // 「次へ」選択肢のパース
    if(data.next){
      this.select.push({label: "≫次へ", link: data.next});
    }

    // 「戻る」選択肢のパース
    if(data.prev){
      this.select.push({label: "≫戻る", link: data.prev});
    }

    // 入力欄のパース
    this.input = "";
    if(data.input){
      this.input = data.input;
    }

    // ゲームオーバーの確認
    this.check_game_over();

    // ローカルフラグはすべて初期化
    for(let i = 0; i < this.local.length; i++){
      this.local[i] = 0;
    }
  }

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
            target.select.push(cond[4].select);
          }else{
            target.select = cond[4].select;
          }
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
      let value = +entry[3];
      let matched = /^\$\{(.)\}$/.test(entry[3]);
      if(matched){
        if(matched[1].match(/^[0123456789]$/)){
          value = +this.local[matched[1]];
        }else{
          value = +this.global[matched[1]];
        }
      }
      
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
      this.select = [{label: "≫終わり", link: "start"}];
      this.input = false
    }
  }

  equip_weapon(item_name){
    this.equip = item_name;
    this.members.you.equip = this.safe_get_item(item_name, 1);
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
  }
}
