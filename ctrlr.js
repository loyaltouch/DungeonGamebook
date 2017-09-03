$(()=>{
  window._g = new Game();
  reflesh();
});

function do_select(scene){
  $.get("scenario/" + scene + ".json", (data)=>{
    window._g.parse(data);
    reflesh();
  });
}

function do_equip(id){
  let item_name = $("#items_1_" + id + "_name").text();
  if(item_name){
    window._g.equip_weapon(item_name);
    reflesh();
  }
}

function reflesh(){
  let g = window._g;
  // ステータス欄の再描画
  reflesh_status(g.members.you);

  // アイテム欄の再描画
  $("#equip_name").text(g.equip);
  reflesh_items(1);
  reflesh_items(2);
  reflesh_items(0);
  
  // 本文の再描画
  let tagged = g.message.replace(/\n/g, "<br />");
  $("#message").html(tagged);

  // 選択欄の再描画
  $("#select").html("");
  if(g.next){
    $("#select").append(build_li("≫次へ", g.next));
  }
  if(g.select){
    for(let i = 0; i < g.select.length; i++){
      $("#select").append(build_li(g.select[i].label, g.select[i].link));
    }
  }
}

function reflesh_status(member){
  $("#" + member.id + "_vit_max").text(member.vit_max);
  $("#" + member.id + "_vit_now").text(member.vit_now);
  $("#" + member.id + "_lck_max").text(member.lck_max);
  $("#" + member.id + "_lck_now").text(member.lck_now);
  $("#" + member.id + "_dex_max").text(member.get_dex());
}

function reflesh_items(type){
  let items = window._g.items;
  let rows = 1;
  for(let name in items){
    if(items[name].type == type){
      if(items[name].count > 0){
        $("#items_" + type + "_" + rows + "_name").text(name);
        $("#items_" + type + "_" + rows + "_count").text(items[name].count);
        rows++;
      }
    }
  }
}

function build_li(label, link){
  return "<li><a href='#' onclick='do_select(\"" + link + "\")'>" + label + "</a></li>";
}
