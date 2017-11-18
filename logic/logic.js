class Chara{
  constructor(id, name, vit, dex, lck){
    this.id = id;
    this.name = name;
    this.vit_max = this.vit_now = vit;
    this.dex = dex;
    this.lck_max = this.lck_now = lck;
    this.equip = { type: 1, value: 0, prise: 0 };
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

class Game{
  constructor(){
    this.items = get_item_data();
    this.members = {};
    this.next = "start";
    this.message = "";
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
    this.input = false;
    if(data.input){
      this.input = true;
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
    if(this.items[item_name] && this.items[item_name].type == type){
      return this.items[item_name];
    }else{
      return this.items[0];
    }
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
}
