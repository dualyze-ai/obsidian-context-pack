# AI Context Pack

Turn your Obsidian vault into an AI-ready knowledge workspace.

Manage AI Briefs, AI MOCs, Context Packs, and Knowledge Books from one place.

**Manage → Analyze → Organize → Export → Ask → Read**

![AI Workspace View](docs/images/ai-workspace-overview.jpeg)

---

## What is AI Context Pack?

AI Context Pack transforms your Obsidian notes into reusable AI knowledge.

Create AI Briefs, AI MOCs, Context Packs, and Knowledge Books, then manage everything from a single Workspace View.

Compatible with:

- ChatGPT
- Claude
- Gemini
- NotebookLM

---

## New in v4.0: AI Workspace View

Manage AI-ready outputs for each folder from a single dashboard.

Track completion status, open generated outputs, refresh workspaces, and see what is missing.

- Workspace progress tracking
- AI Brief management
- AI MOC management
- Context Pack management
- Knowledge Book management
- Refresh Workspace
- Refresh All

---

## What Can I Do?

✅ Manage AI Workspaces

✅ Generate AI Briefs

✅ Create AI MOCs

✅ Export Context Packs

✅ Generate Knowledge Books (EPUB)

✅ Track Workspace Completion

✅ Refresh Outputs When Notes Change

---

## Core Workflow

```text
Obsidian Notes
      ↓
AI Workspace
      ↓
AI Brief
      ↓
AI MOC
      ↓
Context Pack
      ↓
Knowledge Book
      ↓
ChatGPT / Claude / Gemini / NotebookLM
```

---

## Core Features

**AI Workspace View** — Track and manage all AI outputs per folder from one panel.

**AI Brief** — Analyze a folder: topic clusters, knowledge map, and suggested prompts.

**AI MOC** — Structured Map of Content from your AI Brief, ready to export.

**Context Pack** — Clean Markdown bundle for ChatGPT, Claude, Gemini, NotebookLM, and Claude Code.

**Knowledge Book (EPUB)** — Structured EPUB with cover and TOC. Read in Kindle, Apple Books, or Kobo.

---

## Quick Start

1. Install AI Context Pack
2. Create a Folder Workspace
3. Generate an AI Brief
4. Generate an AI MOC
5. Export a Context Pack or create a Knowledge Book

---

## Screenshots

![AI Workspace View](docs/images/ai-workspace-overview.jpeg)

*AI Workspace View — manage all outputs from one place*

<div align="center">
<img src="docs/ai-brief-overview.png" width="90%">
<p><em>AI Brief — understand your vault before exporting</em></p>
</div>

<div align="center">
<img src="docs/ai-moc-overview.png" width="90%">
<p><em>AI MOC — organize insights into a navigable structure</em></p>
</div>

---

## Example Use Cases

### Research Workspace

Research notes → AI Brief → ChatGPT

Use AI Brief to understand your research, then export a Context Pack to ask deep questions.

### Learning Workspace

Study notes → Knowledge Book → Kindle

Turn your study notes into a structured EPUB you can read anywhere.

### Project Workspace

Project documentation → Context Pack → Claude

Package specs, architecture notes, and documentation for Claude or Claude Code.

### Personal Knowledge Base

Vault → Workspace View → Long-term AI Knowledge

Track the completeness of your entire knowledge base and keep AI outputs up to date as your notes evolve.

---

## Tutorial: Create Your First AI Workspace

*Alice has a folder of travel notes. Bob shows her how to turn it into an AI Workspace.*

---

Alice has been collecting travel notes in Obsidian:

```text
travel/
├── Rome.md
├── Paris.md
├── Singapore.md
└── Tokyo.md
```

**Alice:** I have a lot of notes in my `travel/` folder. How do I use them with AI?

**Bob:** Open the AI Workspace panel from the ribbon — it's the briefcase icon. Then click **+ Add Workspace** and select your `travel/` folder.

**Alice:** Done. I can see it now — it says 20 notes and shows AI Brief, AI MOC, Context Pack, and Knowledge Book.

**Bob:** Those are your four outputs. Right now they're all "Not created." Click **Refresh Workspace** to generate them.

---

**Alice:** Wow, it ran. Everything is green now — "4/4 outputs ready."

**Bob:** Exactly. AI Context Pack analyzed your notes and built all four outputs. Click **Open** next to any of them to see what was generated.

**Alice:** The AI Brief is really interesting — it found clusters I didn't notice, like "Historic Sites" and "Local Food."

**Bob:** That's the point of AI Brief. It maps the structure of your knowledge before you export anything. The AI MOC turns those clusters into a navigable index. The Context Pack is what you actually give to an AI tool.

---

**Alice:** So I can just upload the Context Pack to ChatGPT or Claude?

**Bob:** Exactly. The Context Pack is a clean Markdown file — all Obsidian wikilinks and frontmatter are stripped. Upload it to ChatGPT, drop it in a Claude Project, or add it to a NotebookLM notebook. The AI gets focused context from your notes.

**Alice:** And the Knowledge Book?

**Bob:** Open it in Kindle or Apple Books. It's a structured EPUB — cover page, table of contents from the AI Brief clusters, and your notes as chapters.

---

**Alice:** What happens when I add new notes to the folder?

**Bob:** The Workspace View will show the outputs as "Outdated." Just click **Refresh Workspace** again and everything updates.

**Alice:** So I never have to redo anything from scratch?

**Bob:** Right. The workflow is always the same: write notes, refresh, use the outputs. The Workspace View shows you what needs updating.

---

After this tutorial, Alice has:

- one Folder Workspace for `travel/`
- an AI Brief with topic clusters and a knowledge map
- an AI MOC organized for export
- a Context Pack ready for ChatGPT, Claude, or Gemini
- a Knowledge Book for reading in Kindle or Apple Books
- a repeatable workflow for keeping AI-ready knowledge up to date

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

```text
DualyzeAI
      ↓
Obsidian
      ↓
AI Context Pack
      ↓
ChatGPT / Claude / Gemini / NotebookLM
```

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
<img src="docs/ai-brief-overview.png" width="90%">
</div>

*AI Brief summarizes the structure, coverage, and major themes of a selected folder.*

<div align="center">
<img src="docs/ai-brief-knowledge-map.png" width="90%">
</div>

*Knowledge Map generated from a 20-note vault (excerpt).*

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

<div align="center">
<img src="docs/ai-moc-overview.png" width="90%">
</div>

*AI MOC turns discovered clusters into a structured navigation layer.*

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
4. Open the `.epub` file in Kindle, Apple Books, or another EPUB reader.

![Knowledge Book cover](https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/knowledge-book-cover-europe.jpg)

<img src="https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/knowledge-book-toc-europe.png" width="65%">

![Knowledge Book page](https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/knowledge-book-page-europe.jpg)

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

<div align="center">
<img src="docs/context-pack-overview.png" width="90%">
</div>

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

Know when:

- Notes were updated since the last export
- New matching notes were added
- Files were deleted or renamed

Re-export only when needed.

</details>

<details>
<summary>Daily Notes Pack</summary>

Create AI-ready packs from daily notes.

- Date range selection
- Weekly summaries
- Tag exclusion
- Auto-detection of Daily Notes folders

</details>

<details>
<summary>Settings</summary>

Key settings:

- **Output folder** — where AI Briefs, MOCs, and Context Packs are saved
- **EPUB sort strategy** — how notes are ordered in Knowledge Books
- **Enable Mermaid** — include Knowledge Map diagrams in AI Brief
- **AI Brief language** — English or Japanese output

</details>

---

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/dualyze-ai/obsidian-context-pack).

## License

MIT
