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

QUnit.test("replace massage with local flag", assert =>{
  let g = new Game();
  g.local[0] = 2;
  let data = {};
  data.message = "あいうえお${0}かきくけこ";
  g.set_scene(data);
  assert.equal(g.message, "あいうえお2かきくけこ", "${0}の置き換え");

  g.local[1] = 5;
  data.message = "さしすせそ${0}たちつてと${1}";
  g.set_scene(data);
  assert.equal(g.message, "さしすせそ0たちつてと5", "代入されていない変数は0で置き換えられる");

  g.local[0] = 8;
  data.message = "なに${0}ぬねの${10}";
  g.set_scene(data);
  assert.equal(g.message, "なに8ぬねの${10}", "${0～9}の範囲外は置き換えない");

  g.local[0] = 8;
  g.local[1] = 7;
  g.local[2] = 6;
  g.set_scene(data);
  assert.equal(g.local[0], 0, "ローカル変数はset_sceneのあと0に初期化");
  assert.equal(g.local[1], 0, "ローカル変数はset_sceneのあと0に初期化");
  assert.equal(g.local[2], 0, "ローカル変数はset_sceneのあと0に初期化");
});

QUnit.test("replace massage with global flag", assert =>{
  let g = new Game();
  g.global.A = 8;
  
  let data = {};
  data.message = "あいうえお${A}かきくけこ";
  g.set_scene(data);
  assert.equal(g.message, "あいうえお8かきくけこ", "${A}の置き換え");

  g.global.C = 12;
  data.message = "さしすせそ${B}たちつてと${C}";
  g.set_scene(data);
  assert.equal(g.message, "さしすせそ${B}たちつてと12", "代入されていない変数は置き換えられない");

  assert.equal(g.global.A, 8, "グローバル変数はset_sceneのあとに初期化しない");
  assert.equal(g.global.B, undefined, "グローバル変数はset_sceneのあとに初期化しない");
  assert.equal(g.global.C, 12, "グローバル変数はset_sceneのあとに初期化しない");
});
