$(()=>{
  window._g = new Game();
  $(".icheck").click((target) =>{
    let name = $(target)[0].target.value;
    select_checked(name);
  });
  $(".menu_slider").click(()=>{
    $("#menu_content").slideToggle();
  });
  $("#menu_content").hide();
  do_select("start");
});

/*
==============================================
  ボタン押下時の処理
==============================================
 */

// 選択リンク実行
function do_select(scene){
  $.ajax({
    url: `scenario/${scene}.json`,
    cache: false
  }).done(json =>{
    let data = JSON.parse(json);
    window._g.scene = scene;
    window._g.set_scene(data);
    reflesh();
  });
}

// 装備ボタン実行
function do_equip(){
  if(window.icheck){
    window._g.equip_weapon(window.icheck);
    reflesh();
  }
}

// 食事ボタン実行
function do_feed(){
  if(window.icheck){
    window._g.feed(window.icheck);
    reflesh();
  }
}

// ダンプ出力ボタン実行
function do_save(){
  $("#dump_text").val(JSON.stringify(window._g.dump));
}

// ダンプ入力ボタン実行
function do_load(){
  const dump = JSON.parse($("#dump_text").val());
  window._g.load_from_dump(dump);
  do_select(window._g.scene);
}

// 自由入力ボタン実行
function do_input(){
  let g = window._g;
  let text = $("#input_field").val();
  let scene = g.macro[g.input](g, text);
  do_select(scene);
  reflesh();
}

// 運試し実行
function do_luck_test(){
  let g = window._g;
  if(g.buttle){
  }else{
    g.scenario_luck_test();
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

  // 敵の再描画
  if(g.buttle){
    $("#enemy").show();
    reflesh_status(g.members.enemy);
  }else{
    $("#enemy").hide();
  }

  // 戦うリンクの再描画
  set_visibility("attack", g.attack);
  set_visibility("lucky", g.lucky);
  set_visibility("turn", g.turn);
  
  // 選択欄の再描画
  $("#select").html("");
  if(g.select){
    for(let i = 0; i < g.select.length; i++){
      $("#select").append(build_li(g.select[i].label, g.select[i].link));
    }
  }
  
  // 入力欄の再描画
  if(g.input){
    $("#input_section").show();
  }else{
    $("#input_field").val("");
    $("#input_section").hide();
  }
}

function set_visibility(tag_id, flag){
  if(flag){
    $(`#${tag_id}`).show();
  }else{
    $(`#${tag_id}`).hide();
  }
}

function reflesh_status(member){
  $(`#${member.id}_name`).text(member.name);
  $(`#${member.id}_vit_max`).text(member.vit_max);
  $(`#${member.id}_vit_now`).text(member.vit_now);
  $(`#${member.id}_dex_max`).text(member.get_dex());
  $(`#${member.id}_lck_max`).text(member.lck_max);
  $(`#${member.id}_lck_now`).text(member.lck_now);
}

function reflesh_enemy(data){
  if(data.buttle){
    $("#enemy").show();
  }else{
    $("#enemy").hide();
  }
  $("#enemy_name").text(data.members.enemy.name);
  reflesh_status(data.members.enemy);
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
  let canvas = document.getElementById("canvas").getContext("2d");
  canvas.strokeStyle = "black";
  canvas.fillStyle = "white";
  canvas.fillRect(0, 0, 180, 180);
  if(data){
    reflesh_room_image(canvas, data.room);
  }
}

/**
 * @param data 部屋描画パラメータの説明
 * 最初の2項目は、外周の横・縦長さ
 * 残りの項目は、[x座標,y座標,{0:横方向 1:縦方向}]の順番で
 * 壁の位置を描画
 */
function reflesh_room_image(canvas, data){
  try{
    // 最初の２つは外壁の描画
    canvas.strokeStyle = "black";
    canvas.fillStyle = "#dddddd";
    let x = data[0];
    let y = data[1];
    canvas.beginPath();
    canvas.fillRect(5, 5, x * 20, y * 20);
    canvas.strokeRect(5, 5, x * 20, y * 20);
    // 扉を描画
    let i = 0;
    for(i = 2; i < data.length; i++){
      let xx = data[i][0];
      let yy = data[i][1];
      let d = data[i][2];
      if(d == 0){
        // 横方向の扉
        canvas.moveTo(xx * 20 + 15, yy * 20);
        canvas.lineTo(xx * 20 + 15, yy * 20 + 10);
      }else{
        // 縦方向の扉
        canvas.moveTo(xx * 20 , yy * 20 + 15);
        canvas.lineTo(xx * 20 + 10, yy * 20 + 15);
      }
    }
    canvas.closePath();
    canvas.stroke();
  }catch(e){}
}

/*
==============================================
  UTILITY
==============================================
 */

function build_li(label, link){
  return `<li><a href="#" onclick="do_select('${link}')">${label}</a></li>`;
}
