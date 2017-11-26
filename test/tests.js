QUnit.test("hello test", (assert)=>{
  assert.ok(1 == "1", "Passed!!");
});

QUnit.test("Character", (assert)=>{
  let c = new Chara("id", "太郎", 3, 2, 1);
  assert.equal(c.id, "id", "test id");
  assert.equal(c.name, "太郎", "test name");
  assert.equal(c.vit_max, 3, "test vit_max");
  assert.equal(c.vit_now, 3, "test vit_now");
  assert.equal(c.dex, 2, "test dex");
  assert.equal(c.lck_max, 1, "test lck_max");
  assert.equal(c.lck_now ,1, "test lck_now");
});

QUnit.test("Game", (assert)=>{
  let g = new Game();
  assert.ok(g.items,　"アイテムデータ作成");
  assert.ok(g.members, "メンバーデータ作成");
});

QUnit.test("get_inventory", assert =>{
  let g = new Game();
  let weapons = g.get_inventory(1);
  assert.ok(weapons.length, 8, "武器の数");
});

QUnit.test("message", assert =>{
  let g = new Game();
  g.local[0] = 2;
  let data = {};
  data.message = "あいうえお${0}かきくけこ";
  g.set_scene(data);
  assert.ok(g.message, "あいうえお2かきくけこ", "メッセージ置き換え");

  g.local[1] = 5;
  data.message = "さしすせそ${0}たちつてと${1}";
  g.set_scene(data);
  assert.ok(g.message, "さしすせそ${0}たちつてと5", "メッセージ置き換え");
});

