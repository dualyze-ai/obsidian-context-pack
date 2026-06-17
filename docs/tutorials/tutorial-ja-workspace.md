# チュートリアル：はじめての AI Workspace を作る

*Alice は旅行ノートのフォルダを持っています。Bob が AI Workspace に変える方法を案内します。*

---

Alice は Obsidian に旅行のノートをまとめています：

```text
travel/
├── Rome.md
├── Paris.md
├── Singapore.md
└── Tokyo.md
```

**Alice：** `travel/` フォルダにノートがたくさんあります。AI で使うにはどうすればいいですか？

**Bob：** リボンのブリーフケースアイコンから AI Workspace パネルを開いてください。**+ Add Workspace** をクリックして、`travel/` フォルダを選びます。

**Alice：** できました。20 notes と表示されて、AI Brief・AI MOC・Context Pack・Knowledge Book が見えています。

**Bob：** それが4つの出力です。今はすべて「Not created」の状態です。**Refresh Workspace** をクリックすると生成が始まります。

---

**Alice：** 動きました。全部緑になって「4/4 outputs ready」と表示されています。

**Bob：** そうです。AI Context Pack がノートを分析して、4つの出力を作りました。それぞれの **Open** ボタンを押すと内容を確認できます。

**Alice：** AI Brief が面白いです。「Historic Sites」や「Local Food」というクラスターが自動で見つかっています。

**Bob：** それが AI Brief の目的です。エクスポートする前にノートの構造をマッピングします。AI MOC はそのクラスターをナビゲーションしやすい索引に変えたものです。Context Pack は AI ツールに渡すファイルです。

---

**Alice：** Context Pack を ChatGPT や Claude にアップロードすればいいんですか？

**Bob：** そうです。Context Pack はクリーンな Markdown ファイルです。Obsidian のウィキリンクやフロントマターはすべて取り除かれています。ChatGPT にアップロードしたり、Claude Project に追加したり、NotebookLM のノートブックに入れたりして使えます。

**Alice：** Knowledge Book はどう使いますか？

**Bob：** Kindle や Apple Books で開きます。AI Brief のクラスターから目次が作られ、ノートが章になった構造的な EPUB です。表紙もついています。

---

**Alice：** フォルダに新しいノートを追加したらどうなりますか？

**Bob：** Workspace View で出力が「Outdated」と表示されます。**Refresh Workspace** をもう一度クリックするだけで最新の状態に更新されます。

**Alice：** 最初からやり直さなくていいんですね。

**Bob：** そうです。ワークフローはいつも同じです。ノートを書いて、Refresh して、出力を使う。Workspace View が何を更新すべきか教えてくれます。

---

## Alice が作ったもの

このチュートリアルを終えた Alice には：

- `travel/` フォルダの Workspace
- トピッククラスターとナレッジマップ付きの AI Brief
- エクスポート用に整理された AI MOC
- ChatGPT・Claude・Gemini に渡せる Context Pack
- Kindle や Apple Books で読める Knowledge Book
- AI 対応ナレッジを常に最新に保つ繰り返し可能なワークフロー

が揃っています。
