class Chara{
  constructor(id, name, vit, dex, lck){
    this.id = id;
    this.name = name;
    this.vit_max = this.vit_now = vit;
    this.dex = dex;
    this.lck_max = this.lck_now = lck;
    this.equip = { name: "素手", type: 1, value: 0, prise: 0 };
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
  get_apple(g, text, value){
    if(value > 0 && g.items.りんご.count + value <= 5){
      g.items.りんご.count += value;
      g.message = "あなたはりんごを" + value + "個得た";
      g.select = [{
      label: "<<戻る",
      link: "1_4"
      }];
    }else if(value > 0 && g.items.りんご.count + value > 5){
      g.members.you.damage(2);
      g.message = "あなたはりんごを" + value + "個取ろうとした。\nその瞬間、木の上からりんごが大量に降ってきてあなたに降り注いだ！\nあなたは2ダメージ";
      g.select = [{
      label: "<<戻る",
      link: "1_4"
      }];
      g.check_game_over();
    }else{
      g.message = "何も起きなかった";
      g.select = [{
      label: "<<戻る",
      link: "1_4"
      }];
    }
  }
}

class Game{
  constructor(){
    this.items = get_item_data();
    this.members = {};
    this.flags = {};
    this.message = "";
    this.scene = "start";
    this.macro = new Macro();
  }

  parse(json){
    let data = JSON.parse(json);

    // 初期化処理
    if(data.startup){
      var you = new Chara("you", "あなた", 12, 7, 9);
      this.members.you = you;
      this.equip_weapon("ナイフ");
    }

    // メッセージのパース
    this.message = data.message;

    // 画像データのパース
    this.image = data.image;

    // その他の選択肢のパース
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

    // 入力欄のパース
    this.input = "";
    if(data.input){
      this.input = data.input;
    }
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
        dex_max: you.dex_max,
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
    dump.flag = this.flags;
    dump.scene = this.scene;
    return dump;
  }

  load_from_dump(dump){
    let you = this.members.you;
    ["vit_max", "vit_now", "dex_max", "lck_max", "lck_now"].forEach(status =>{
      if(!isNaN(dump.you[status])){
        you[status] = dump.you[status];
      }
    });
    this.equip_weapon(dump.you.equip);

    for(let item_name in dump.item){
      if(this.items[item_name]){
        this.items[item_name].count = dump.item[item_name];
      }
    }

    this.flags = dump.flag;
    this.scene = dump.scene;
  }
}
