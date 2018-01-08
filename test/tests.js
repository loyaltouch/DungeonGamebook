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

QUnit.test("set flag", assert =>{
  let g = new Game();
  g.members.you.vit_now = 12;
  g.members.you.dex = 9;
  g.dump = g.save_to_dump();
  g.set_flags([
    ["=", "you", "vit_now", 7],
    ["+", "you", "dex_max", 2]
    ]);
  assert.equal(g.dump.you.vit_now, 7, "体力を7にセット");
  assert.equal(g.dump.you.dex_max, 11, "技量に2加算");
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

QUnit.test("condition tag test hit", assert =>{
  let g = new Game();
  
  let input = {};
  input.flag = {};
  input.flag.X = 3;
  
  let target = {};
  target.message = "あいうえお";
  target.set = [["=", "flag", "A", 2], ["=", "flag", "B", 3]];
  target.if = [
    ["=", "flag", "X", 3, {
      message: "かきくけこ",
      set: [["+", "flag", "A", 4], ["=", "item", "りんご", 6]],
      select: ["箱を開ける", "106"]
    }]
    ];
  g.parse_condition(input, target);
  const target_set = JSON.stringify(target.set);
  const result_set = JSON.stringify([
    ["=", "flag", "A", 2],
    ["=", "flag", "B", 3],
    ["+", "flag", "A", 4],
    ["=", "item", "りんご", 6]
    ]);

  const select_set = JSON.stringify(target.select);
  const result_select_set = JSON.stringify(["箱を開ける", "106"]);

  assert.equal(target.message, "あいうえおかきくけこ", "ifフラグでmessage書き換え");
  assert.equal(target_set, result_set, "ifフラグでset書き換え");
  assert.equal(select_set, result_select_set, "ifフラグでselect書き換え");
});

QUnit.test("condition tag test nohit", assert =>{
  let g = new Game();
  
  let input = {};
  input.flag = {};
  input.flag.X = 4;
  
  let target = {};
  target.message = "あいうえお";
  target.set = [["=", "flag", "A", 2], ["=", "flag", "B", 3]];
  target.if = [
    ["=", "flag", "X", 3, {
      message: "かきくけこ",
      set: [["+", "flag", "A", 4], ["=", "item", "りんご", 6]],
    }]
    ];
  g.parse_condition(input, target);
  const target_set = JSON.stringify(target.set);
  const result_set = JSON.stringify([
    ["=", "flag", "A", 2],
    ["=", "flag", "B", 3]
    ]);

  assert.equal(target.message, "あいうえお", "ifフラグでmessage書き換え");
  assert.equal(target_set, result_set, "ifフラグでset書き換え");
});

QUnit.test("condition tag test else", assert =>{
  let g = new Game();
  
  let input = {};
  input.flag = {};
  input.flag.X = 4;
  
  let target = {};
  target.message = "あいうえお";
  target.set = [["=", "flag", "A", 2], ["=", "flag", "B", 3]];
  target.if = [
    ["=", "flag", "X", 3, {
      message: "かきくけこ",
      set: [["+", "flag", "A", 4], ["=", "item", "りんご", 6]]
    }],
    [0, 0, 0, 0, {
      message: "さしすせそ",
      set: [["=", "you", "vit_now", 12]]
    }]
    ];
  g.parse_condition(input, target);
  const target_set = JSON.stringify(target.set);
  const result_set = JSON.stringify([
    ["=", "flag", "A", 2],
    ["=", "flag", "B", 3],
    ["=", "you", "vit_now", 12]
    ]);

  assert.equal(target.message, "あいうえおさしすせそ", "ifフラグでmessage書き換え");
  assert.equal(target_set, result_set, "ifフラグでset書き換え");
});

QUnit.test("condition tag test The nonexistent flag is treated as 0", assert =>{
  let g = new Game();
  
  let input = {};
  input.flag = {};
  
  let target = {};
  target.message = "あいうえお";
  target.set = [["=", "flag", "A", 2], ["=", "flag", "B", 3]];
  target.if = [
    ["=", "flag", "X", 3, {
      message: "かきくけこ",
      set: [["+", "flag", "A", 4], ["=", "item", "りんご", 6]]
    }],
    ["=", "flag", "X", 0, {
      message: "なにぬねの",
      set: [["+", "flag", "B", 9]]
    }],
    [0, 0, 0, 0, {
      message: "さしすせそ",
      set: [["=", "you", "vit_now", 12]]
    }]
    ];
  g.parse_condition(input, target);
  const target_set = JSON.stringify(target.set);
  const result_set = JSON.stringify([
    ["=", "flag", "A", 2],
    ["=", "flag", "B", 3],
    ["+", "flag", "B", 9]
    ]);

  assert.equal(target.message, "あいうえおなにぬねの", "ifフラグでmessage書き換え");
  assert.equal(target_set, result_set, "ifフラグでset書き換え");
});

QUnit.test("1 Dice", (assert)=>{
  let g = new Game();
  for(let i = 0; i < 20; i++){
    let result = g.randi(6);
    assert.equal(1 <= result && result <= 6, true, `結果は[${result}]`);
  }
});

QUnit.test("2 Dice", (assert)=>{
  let g = new Game();
  for(let i = 0; i < 20; i++){
    let result = g.rand();
    assert.equal(2 <= result && result <= 12, true, `結果は[${result}]`);
  }
});

// シナリオファイルのリンク作成箇所のテスト
// シナリオファイルの「select」キーの中身を受け取り
// - label : 奇数項目
// - func : "do_select" 固定
// - link : 偶数項目
// というオブジェクトのセットを作る
QUnit.test("build select objects from scenario data", (assert)=>{
  let g = new Game();
  const data = {
    "select": ["ひとつめ", "1_1", "ふたつめ", "1_2"]
  };
  g.set_scene(data);
  assert.equal("ひとつめ", g.select[0].label, "select[0] label");
  assert.equal("do_select", g.select[0].func, "select[0] func");
  assert.equal("1_1", g.select[0].link, "select[0] link");
  assert.equal("ふたつめ", g.select[1].label, "select[1] label");
  assert.equal("do_select", g.select[1].func, "select[1] func");
  assert.equal("1_2", g.select[1].link, "select[1] link");
});

// シナリオファイルのリンク作成箇所のテスト2
// 「next」キーが存在すると
// - label : "≫次へ" 固定
// - func : "do_select" 固定
// - link : 値
// というオブジェクトのセット
// 「prev」キーが存在すると
// - label : "≫戻る" 固定
// - func : "do_select" 固定
// - link : 値
// というオブジェクトのセット
QUnit.test("build select objects(next,prev) from scenario data", (assert)=>{
  let g = new Game();
  const data = {
    "next": "1_3",
    "prev": "1_4"
  };
  g.set_scene(data);
  assert.equal("≫次へ", g.select[0].label, "select[0] label");
  assert.equal("do_select", g.select[0].func, "select[0] func");
  assert.equal("1_3", g.select[0].link, "select[0] link");
  assert.equal("≫戻る", g.select[1].label, "select[1] label");
  assert.equal("do_select", g.select[1].func, "select[1] func");
  assert.equal("1_4", g.select[1].link, "select[1] link");
});

// シナリオファイルのリンク作成箇所のテスト3
// 「shop」キーが存在すると
// - label : {売り物名}(銀貨{価格}枚)
// - func : "do_buy" 固定
// - link : {売り物名}
// というオブジェクトのセット
QUnit.test("build shop objects from scenario data", (assert)=>{
  let g = new Game();
  g.scene = "1_0";
  g.items.ナイフ.count = 1;
  g.items.棍棒.count = 1;
  g.equip_weapon("ナイフ");
  const data = {
    "shop": ["ナイフ", "棍棒"]
  };
  // 最初は店売りの選択肢を展開
  g.set_scene(data);
  assert.equal("ナイフを買う(銀貨10枚)", g.select[0].label, "select[0] label");
  assert.equal("do_buy", g.select[0].func, "select[0] func");
  assert.equal("ナイフ", g.select[0].link, "select[0] link");
  assert.equal("棍棒を買う(銀貨2枚)", g.select[1].label, "select[1] label");
  assert.equal("do_buy", g.select[1].func, "select[1] func");
  assert.equal("棍棒", g.select[1].link, "select[1] link");
  assert.equal("持ち物を売る", g.select[2].label, "select[2] label");
  assert.equal("do_buy", g.select[2].func, "select[2] func");
  assert.equal("sell", g.select[2].link, "select[2] link");

  // 次に「売る」を選択する
  g.do_buy("sell");

  // 売り物の選択肢を展開
  assert.equal("棍棒を売る(銀貨2枚)", g.select[0].label, "select[0] label(sell)");
  assert.equal("do_sell", g.select[0].func, "select[0] func(sell)");
  assert.equal("棍棒", g.select[0].link, "select[0] link(sell)");
  assert.equal("≫戻る", g.select[1].label, "select[1] label(sell)");
  assert.equal("do_select", g.select[1].func, "select[1] func(sell)");
  assert.equal("1_0", g.select[1].link, "select[1] link(sell)");
});


