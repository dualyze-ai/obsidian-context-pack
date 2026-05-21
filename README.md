# Context Pack for NotebookLM

> Build clean Context Packs from your Obsidian vault for NotebookLM.

by [dualyzeAI](https://dualyzeai.com)

---

## The problem

When you paste raw Obsidian notes into NotebookLM, the results are noisy. Broken `[[wikilinks]]`, frontmatter YAML, `![[embedded images]]`, `%%comments%%`, and `#inline-tags` all end up in the source — and NotebookLM treats them as meaningful content. The answers you get reflect that noise.

## What this plugin does

**Export** cleans up your notes and packages them into a ZIP file ready for NotebookLM upload.

**Context Pack** bundles related notes into a single formatted `.md` file, organized by folder, tag, or MOC. Each note section includes its vault folder path (📁) so NotebookLM understands the hierarchy of your knowledge.

Both features run the same formatter: frontmatter is removed, wikilinks are resolved, embeds and comments are stripped, and blank lines are collapsed.

---

## Try it with sample data

Six pre-built Context Packs are included so you can test NotebookLM import immediately — no vault setup required.

**English**

| Pack | Notes | Download |
|---|---|---|
| 🍳 Recipes | 20 notes | [pack-recipes.md](samples/output/pack-recipes.md) |
| ✈️ Travel notes | 20 notes | [pack-travel.md](samples/output/pack-travel.md) |
| 📚 Book summaries | 20 notes | [pack-books.md](samples/output/pack-books.md) |

**日本語**

| パック | ノート数 | ダウンロード |
|---|---|---|
| 🍳 レシピ集 | 20件 | [pack-recipes-jp.md](samples/output/pack-recipes-jp.md) |
| ✈️ 旅行記録 | 20件 | [pack-travel-jp.md](samples/output/pack-travel-jp.md) |
| 📚 読書メモ | 20件 | [pack-books-jp.md](samples/output/pack-books-jp.md) |

**How to use:**
1. Download a `.md` file from the links above
2. Open [NotebookLM](https://notebooklm.google.com) → New notebook
3. Click **Add source** → **Upload file** → select the `.md` file
4. Ask anything — for example:
   - *"What recipes can I make in under 30 minutes?"* (recipes)
   - *"Recommend highlights for a trip to Europe"* (travel)
   - *"Summarize the best books for startups"* (books)

The sample vault source files are in [`samples/vault/`](samples/vault/) (English) and [`samples/vault-jp/`](samples/vault-jp/) (Japanese).

---

## サンプルデータで試す

すぐにNotebookLMへのインポートを試せるContext Packを用意しています。

**日本語**

| パック | ノート数 | ダウンロード |
|---|---|---|
| 🍳 料理レシピ | 20件 | [pack-recipes-jp.md](samples/output/pack-recipes-jp.md) |
| ✈️ 旅行記録 | 20件 | [pack-travel-jp.md](samples/output/pack-travel-jp.md) |
| 📚 読書メモ | 20件 | [pack-books-jp.md](samples/output/pack-books-jp.md) |

**English**

| Pack | Notes | Download |
|---|---|---|
| 🍳 Recipes | 20 notes | [pack-recipes.md](samples/output/pack-recipes.md) |
| ✈️ Travel notes | 20 notes | [pack-travel.md](samples/output/pack-travel.md) |
| 📚 Book summaries | 20 notes | [pack-books.md](samples/output/pack-books.md) |

**使い方：**
1. 上記リンクから `.md` ファイルをダウンロード
2. [NotebookLM](https://notebooklm.google.com) を開いてノートブックを新規作成
3. **ソースを追加** → **ファイルをアップロード** → ダウンロードした `.md` を選択
4. 質問してみましょう。例：
   - *「30分以内で作れる料理を教えて」*（レシピ）
   - *「ヨーロッパ旅行のおすすめスポットは？」*（旅行）
   - *「スタートアップに役立つ本をまとめて」*（読書）

サンプルVaultのソースファイルは [`samples/vault/`](samples/vault/)（英語）・[`samples/vault-jp/`](samples/vault-jp/)（日本語）にあります。

---

## Installation

### Via BRAT (recommended until community review)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Open BRAT settings → Add Beta Plugin
3. Enter: `https://github.com/dualyzeAI/obsidian-context-pack`

### Community store

Coming soon.

---

## Usage

Commands are available via the **Command Palette** (`Cmd/Ctrl + P`) and the **ribbon icon** (📦) in the left sidebar.

| Command | How to trigger | Description |
|---|---|---|
| Create Context Pack from folder | Ribbon icon / right-click folder | Bundles all notes in a folder into one `.md` |
| Create Context Pack from tag | Command palette | Bundles notes matching a tag |
| Create Context Pack from MOC | Right-click file | Follows `[[links]]` in the current note |
| Export vault for NotebookLM | Command palette | Exports as a ZIP of individual files |
| Export current note | Right-click file | Exports only the open note |

**Right-click menus** are available in the file explorer:
- Right-click a **folder** → *Pack this folder as Context Pack*
- Right-click a **file** → *Export this note* / *Create Context Pack from this MOC*

---

## Settings

| Setting | Description | Default |
|---|---|---|
| Target folder | Folder to export. Empty = full vault | — |
| Output folder | Where to save ZIPs | Vault root |
| Flatten folder structure | Merge all notes into one folder in the ZIP | Off |
| Include frontmatter title | Convert `title` and `tags` to plain text at top of note | On |
| Open folder after export | Open output folder when done (desktop only) | Off |
| Custom replacement rules | User-defined find/replace rules (plain text or regex) | — |

---

## License

MIT

---

Made by [dualyzeAI](https://dualyzeai.com)
