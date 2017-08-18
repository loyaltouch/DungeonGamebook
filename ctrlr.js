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

function reflesh(){
  let g = window._g;
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

function build_li(label, link){
  return "<li><a href='#' onclick='do_select(\"" + link + "\")'>" + label + "</a></li>";
}
