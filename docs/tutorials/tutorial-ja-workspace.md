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

**Alice：** できました。20 notes と表示されて、AI Brief・AI MOC・Context Pack・Knowledge Book が見えています。「0/4 outputs ready」と表示されています。

**Bob：** それが4つの出力です。今はすべて「Not created」の状態です。**Generate Workspace** をクリックすると初回生成が始まります。

---

**Alice：** 動きました。AI Brief と AI MOC は緑になりましたが、Context Pack と Knowledge Book はまだ「Not created」のままです。「2/4 outputs ready」と表示されています。

**Bob：** それが正しい動作です。Generate Workspace は AI Brief と AI MOC を自動で作成します。残り2つは下の **Generate Outputs** から個別に作成します。**Export Pack** で Context Pack、**Create EPUB** で Knowledge Book を生成できます。

**Bob：** もう一つ補足です。Generate Workspace が必要なのは初回だけです。ノートを更新したあとは、**Refresh Workspace** を使います。

**Alice：** Export Pack をクリックしたら「Select output target」というダイアログが出ました。ChatGPT・Claude・Gemini・Agents というタブがあります。

**Bob：** 使いたい AI ツールを選んでください。それぞれのターゲットに合わせた指示が Context Pack に追加されます。迷ったら ChatGPT を選べば大丈夫です。あとで別のターゲット向けに再エクスポートすることもできます。

**Alice：** ChatGPT を選んで Export しました。Context Pack が「Ready」になりました。Create EPUB もクリックして、「4/4 outputs ready」になりました。

**Bob：** 完璧です。それぞれの **Open** ボタンを押すと内容を確認できます。

**Alice：** AI Brief が面白いです。「Historic Sites」や「Local Food」というクラスターが自動で見つかっています。

**Bob：** AI Brief はフォルダのエグゼクティブサマリーと考えてください。エクスポートする前にノートの構造をマッピングします。AI MOC はそのクラスターをナビゲーションしやすい索引に変えたものです。Context Pack は AI ツールに渡すファイルです。

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

---

**Alice：** このワークスペースをチームと共有できますか？

**Bob：** できます。**Notion ZIP** をクリックしてください。

**Alice：** その後どうなりますか？

**Bob：** AI Context Pack が Notion 対応のワークスペース ZIP を作成します。Notion にインポートすると、AI Brief・AI MOC・ノート・画像がページとして展開されます。

**Alice：** Notion の API キーなどは必要ですか？

**Bob：** 設定は不要です。Notion を開いて **Settings → Import** から **ZIP** を選び、ファイルをアップロードするだけです。

---

## Alice が作ったもの

このチュートリアルを終えた Alice には：

- `travel/` フォルダの Workspace
- トピッククラスターとナレッジマップ付きの AI Brief
- エクスポート用に整理された AI MOC
- ChatGPT・Claude・Gemini に渡せる Context Pack
- Kindle や Apple Books で読める Knowledge Book
- チームと共有できる Notion Workspace ZIP
- AI 対応ナレッジを常に最新に保つ繰り返し可能なワークフロー

が揃っています。
