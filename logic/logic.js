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
}

class Game{
  constructor(){
    this.items = get_item_data();
    this.members = {};
    var you = new Chara("you", "あなた", 12, 7, 9);
    you.equip = this.items.ナイフ;
    this.members.you = you;
    this.next = "start";
    this.message = "";
  }
  
  parse(json){
    let data = JSON.parse(json);
    this.message = data.message;

    this.next = "";
    if(data.next){
      this.next = data.next;
    }

    this.select = [];
    if(data.select){
      for(let i = 0; i < data.select.length; i += 2){
        let entry = {label: data.select[i], link: data.select[i + 1]};
        this.select.push(entry);
      }
    }
  }

  safe_get_item(item_name){
    if(this.items[item_name]){
      return this.items[item_name];
    }else{
      return this.items[0];
    }
  }
}