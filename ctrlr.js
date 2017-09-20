$(()=>{
  window._g = new Game();
  $(".icheck").click((target) =>{
    let name = $(target)[0].target.value;
    select_checked(name);
  });
  do_select("start");
});


// 実行処理
function do_select(scene){
  $.get(`scenario/${scene}.json`, (data)=>{
    window._g.parse(data);
    reflesh();
  });
}

function do_equip(){
  if(window.icheck){
    window._g.equip_weapon(window.icheck);
    reflesh();
  }
}

function do_feed(){
  if(window.icheck){
    window._g.feed(window.icheck);
    reflesh();
  }
}


// ボタンのon/off
function select_checked(name){
  let iname = $(`#${name}_name`).text();
  let item = window._g.items[iname];
  if(item){
    let itype = item.type;
    command_on_off(itype);
    window.icheck = iname;
  }
}

function command_on_off(type){
  if(type == 1){
    // 武器選択中
    $("#select_equip").prop("disabled", false);
    $("#select_food").prop("disabled", true);
  }else if(type == 2){
    // 食料選択中
    $("#select_equip").prop("disabled", true);
    $("#select_food").prop("disabled", false);
  }else{
    $("#select_equip").prop("disabled", true);
    $("#select_food").prop("disabled", true);
  }
}

function reflesh(){
  let g = window._g;
  // ステータス欄の再描画
  reflesh_status(g.members.you);

  // アイテム欄の再描画
  reflesh_items(1);
  reflesh_items(2);
  reflesh_items(0);
  let item_selected = $("input[name=item_select]:checked").val();
  window.icheck = $(`#${item_selected}_name`).text();

  // 画像欄の再描画
  reflesh_image(g.image);

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
  $(`#${member.id}_vit_max`).text(member.vit_max);
  $(`#${member.id}_vit_now`).text(member.vit_now);
  $(`#${member.id}_lck_max`).text(member.lck_max);
  $(`#${member.id}_lck_now`).text(member.lck_now);
  $(`#${member.id}_dex_max`).text(member.get_dex());
}

function reflesh_items(type){
  let items = window._g.items;
  let rows = 1;
  // アイテムの個数分走査
  let item_list = window._g.get_inventory(type);
  for(let i = 0; i < item_list.length; i++){
    $(`#items_${type}_${rows}_name`).text(item_list[i]);
    $(`#items_${type}_${rows}_count`).text(items[item_list[i]].count);
    // 装備欄の再描画
    if(item_list[i] == window._g.equip){
      $(`#items_${type}_${rows}_equiped`).text("★");
    }else{
      $(`#items_${type}_${rows}_equiped`).text("");
    }
    rows++;
  }

  // 表示欄の個数分表示クリア
  for(;rows <= 3; rows++){
    $(`#items_${type}_${rows}_name`).text("");
    $(`#items_${type}_${rows}_count`).text("");
    $(`#items_${type}_${rows}_equiped`).text("");
  }
}

function reflesh_image(data){
  if(data && data.length >= 2){
    let x = data[0];
    let y = data[1];
    let canvas = document.getElementById("canvas").getContext("2d");
    canvas.strokeStyle = "black";
    canvas.fillStyle = "white";
    canvas.fillRect(0, 0, 100, 100);
    canvas.beginPath();
    canvas.strokeRect(5, 5, x * 20, y * 20);
  }
}

function build_li(label, link){
  return `<li><a href="#" onclick="do_select('${link}')">${label}</a></li>`;
}
