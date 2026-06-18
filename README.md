# AI Context Pack

Turn your Obsidian vault into an AI-ready knowledge workspace.

Create AI Briefs, AI MOCs, Context Packs, Knowledge Books, and Notion Workspaces — all from one Workspace View.

![AI Workspace View](https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/ai-workspace-overview.jpeg)

---

## New in v4.0: AI Workspace View

Manage all AI outputs for each folder from a single dashboard.

Track status, open outputs, refresh workspaces, and see what is missing — all in one place.

```text
AI Workspace
├ AI Brief           ✓
├ AI MOC             ✓
├ Context Pack       ✗ Not created
├ Knowledge Book     ✗ Not created
└ Notion Workspace   ✗ Not created
```

![AI Workspace Demo](https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/ai-workspace-demo.gif)

---

## New in v4.1.0: Notion Workspace Export

Export an entire workspace as a Notion-ready ZIP.

Import it into Notion to create a shareable workspace containing:

- AI Briefs
- AI MOCs
- Source Notes
- Images

Build in Obsidian. Share in Notion.

---

## What Can I Do?

✅ Manage AI Workspaces

✅ Generate AI Briefs

✅ Create AI MOCs

✅ Export Context Packs

✅ Generate Knowledge Books (EPUB)

✅ Export entire workspaces to Notion

✅ Share AI-ready knowledge outside Obsidian

✅ Track Workspace Completion

✅ Refresh Outputs When Notes Change

---

## Core Workflow

```text
Obsidian Notes
      ↓
AI Workspace
      ↓
AI Brief + AI MOC
      ↓
Context Pack / Knowledge Book / Notion Workspace ZIP
      ↓
ChatGPT / Claude / Gemini / NotebookLM / Notion
```

---

## Core Features

**AI Workspace View** — Track and manage all AI outputs per folder from one panel.

**AI Brief** — Analyze a folder: topic clusters, knowledge map, and suggested prompts.

**AI MOC** — Structured Map of Content from your AI Brief, ready to export.

**Context Pack** — Clean Markdown bundle for ChatGPT, Claude, Gemini, NotebookLM, and Claude Code.

**Knowledge Book (EPUB)** — Structured EPUB with cover and TOC. Read in Kindle, Apple Books, or Kobo.

**Notion Workspace ZIP** — Export an entire workspace as a Notion-ready ZIP. Import into Notion to create a shareable workspace with AI Briefs, AI MOCs, source notes, and images. Perfect for team sharing, project documentation, and knowledge publishing.

---

## Quick Start

1. Install AI Context Pack
2. Open AI Workspace View
3. Add a Folder Workspace
4. Click **Generate Workspace** (creates AI Brief + AI MOC)
5. Export a **Context Pack** or create a **Knowledge Book**
6. Click **Notion ZIP** to export the workspace for Notion

---

## Tutorial

Learn the complete workflow from notes to AI-ready outputs.

👉 [Tutorial: Create Your First AI Workspace](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/tutorials/tutorial-en-workspace.md)

**Alice:** How do I get started?

**Bob:** Add a folder as a Workspace, then click Generate Workspace. It creates an AI Brief and AI MOC automatically.

**Alice:** Can I share this workspace with my team?

**Bob:** Sure. Click **Notion ZIP**.

**Alice:** What happens next?

**Bob:** AI Context Pack creates a Notion-ready workspace ZIP. Import it into Notion and you'll get AI Briefs, AI MOCs, notes, and images as pages.

---

## Screenshots

![AI Workspace View](https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/ai-workspace-overview.jpeg)

*AI Workspace View — track all outputs from one place*

<div align="center">
<img src="https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/ai-brief-overview.png" width="90%">
<p><em>AI Brief — understand your vault before exporting</em></p>
</div>

<div align="center">
<img src="https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/ai-moc-overview.png" width="90%">
<p><em>AI MOC — organize insights into a navigable structure</em></p>
</div>

---

## Example Use Cases

**Research** — Notes → AI Brief → ChatGPT. Ask deep questions about your research.

**Learning** — Study notes → Knowledge Book → Kindle. Read your notes as a structured book.

**Project** — Docs → Context Pack → Claude Code. Package specs for AI-assisted development.

**Team sharing** — Workspace → Notion ZIP → Notion. Share AI-ready knowledge with your team.

---

## Installation

### Community Plugins (Recommended)

1. Open **Settings → Community plugins → Browse**
2. Search for **AI Context Pack**
3. Install and enable

### Manual Installation

Download the [latest release](https://github.com/dualyze-ai/obsidian-context-pack/releases/latest) and copy `main.js`, `manifest.json`, and `styles.css` to:

```text
.obsidian/plugins/context-pack-for-notebooklm/
```

### Sample Vaults

| Vault | Notes | Download |
|---|---|---|
| 🇺🇸 English | 86 notes | [vault-sample-en.zip](https://s3.ap-northeast-1.amazonaws.com/assets.dualyzeai.com/obsidian-context-pack/vault-sample-en.zip) |
| 🇯🇵 Japanese | 86件 | [vault-sample-jp.zip](https://s3.ap-northeast-1.amazonaws.com/assets.dualyzeai.com/obsidian-context-pack/vault-sample-jp.zip) |

---

## Part of the Dualyze Ecosystem

| Tool | Role |
|---|---|
| [DualyzeAI](https://dualyzeai.com) | Compare & Analyze |
| Obsidian | Save & Organize |
| AI Context Pack | Package & Prepare |
| Dualyze Notes | Capture & Sync |
| Dualyze Structure | Structure & Visualize |

---

## Details

<details>
<summary>AI Brief — full details</summary>

AI Brief analyzes a folder and generates:

- **Executive Insight** — one-paragraph knowledge summary
- **Topic Clusters** — groups of related notes with representative examples
- **Knowledge Map** — Mermaid diagram showing cluster relationships
- **Relationship Map** — similarity scores between individual notes
- **Knowledge Health** — orphan notes, duplicate candidates, connectivity score
- **Suggested Prompts** — ready-to-use AI prompts for your content

AI Brief is saved as a Markdown file with frontmatter, making it reusable across all workflows.

<div align="center">
<img src="https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/ai-brief-overview.png" width="90%">
</div>

</details>

<details>
<summary>AI MOC — full details</summary>

AI MOC (Map of Content) is generated from an AI Brief or any note.

It follows wikilinks outward to build a structured navigation layer:

```text
Root Note
    │
    ├── Core Concepts
    │       └── Related Notes
    │
    └── Referenced By
```

AI MOC can be used directly as Context Pack source material.

</details>

<details>
<summary>Notion Workspace Export — full details</summary>

Export an entire Obsidian workspace as a Notion-ready ZIP.

**What's included:**

- `README.md` — import guide and workspace overview
- `AI Brief.md` — workspace analysis
- `AI MOC.md` — structured map of content
- `Notes/` — all source notes with Obsidian syntax converted
- `assets/` — local images collected from notes

**Obsidian syntax conversions:**

- `![[image.jpg]]` → `![image](../assets/image.jpg)` (copied to assets)
- `![alt](https://...)` → kept as-is (no download needed)
- `[[page]]` → `[page](page.md)`
- `[[page|alias]]` → `[alias](page.md)`
- Frontmatter stripped

**How to import into Notion:**

1. Open Notion
2. Go to **Settings → Import**
3. Choose **ZIP**
4. Upload the generated ZIP

</details>

<details>
<summary>Knowledge Book (EPUB) — full details</summary>

Knowledge Books are generated from an AI Brief and its source notes.

Structure:

- Cover page with title, cover image (if found), note count, and date
- AI Brief as a preface (diagnostic sections removed)
- Hierarchical table of contents from AI Brief clusters
- Source notes as book chapters
- Embedded images from note content

Supported readers: Kindle, Apple Books, Kobo, Calibre, and any EPUB reader.

#### How to create a Knowledge Book

1. Generate an AI Brief from a folder.
2. Right-click the generated AI Brief.
3. Choose **Create Knowledge Book (EPUB)**.

![Knowledge Book cover](https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/knowledge-book-cover-europe.jpg)

</details>

<details>
<summary>Context Pack format</summary>

Context Packs are single Markdown files that bundle related notes.

Each pack includes:

- A structured header with source, date, and note count
- Clean note content (frontmatter stripped, Obsidian syntax removed)
- AI-specific instructions for the selected output target
- Token count estimate

Source options: folder, tag, MOC, AI MOC, selected notes, daily notes.

</details>

<details>
<summary>Supported AI Assistants</summary>

| AI | Chat | Project / Notebook |
|---|---|---|
| ChatGPT | ✓ | ✓ Projects |
| Claude | ✓ | ✓ Project |
| Gemini | ✓ | ✓ Notebook |
| Claude Code | ✓ | — |
| NotebookLM | — | ✓ |

</details>

<details>
<summary>Project Knowledge Packs — freshness tracking</summary>

Track which notes were sent to ChatGPT Projects, Claude Projects, Gemini, or NotebookLM.

Know when notes were updated, new notes added, or files renamed. Re-export only when needed.

</details>

<details>
<summary>Daily Notes Pack</summary>

Create AI-ready packs from daily notes with date range selection, weekly summaries, and tag exclusion.

</details>

---

## Changelog

### v4.1.0

**New**

- Notion Workspace Export — export entire workspaces as Notion-ready ZIP files
- Notion Workspace ZIP output tracking in AI Workspace View (5/5 outputs)
- Image handling: local images copied to assets, URL images kept as-is

### v4.0.0 – v4.0.3

- AI Workspace View — manage all outputs per folder from one panel
- Generate Workspace (AI Brief + AI MOC in one click)
- Refresh Workspace — detect and update outdated outputs
- Knowledge Book (EPUB) generation from AI Workspace
- Context Pack export from AI Workspace
- i18n: English + Japanese throughout

👉 [Full changelog](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/changelog.md)

---

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/dualyze-ai/obsidian-context-pack).

## License

MIT
