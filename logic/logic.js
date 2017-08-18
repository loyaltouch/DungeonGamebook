class Chara{
  constructor(name, vit, dex, lck){
    this.name = name;
    this.vit = vit;
    this.dex = dex;
    this.lck = lck;
  }
}

class Game{
  constructor(){
    this.members = {};
    var you = new Chara("あなた", 12, 7, 9);
    this.members.あなた = you;
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
}