$(()=>{
  window._g = new Game();
  $("#do_next").click(do_next);
  $("#message").text(window._g.members.あなた.name);
});

function do_next(){
  $.get("scenario/start.json", (data)=>{
    window._g.parse(data);
    reflesh();
  });
}

function reflesh(){
  let tagged = window._g.message.replace(/\n/g, "<br />");
  $("#message").html(tagged);
}
