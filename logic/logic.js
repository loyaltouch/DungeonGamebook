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
  }
  
  parse(json){
    let data = JSON.parse(json);
    this.message = data.message;
  }
}