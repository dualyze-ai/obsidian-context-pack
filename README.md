# AI Context Pack

**Turn your Obsidian vault into an AI-ready knowledge workspace.**

Manage → Analyze → Organize → Export → Ask → Read

<div align="center">
<img src="docs/ai-workspace-overview.png" width="100%">
</div>

---

## What is AI Context Pack?

AI Context Pack transforms your Obsidian notes into reusable AI knowledge.

Create AI Briefs, AI MOCs, Context Packs, and Knowledge Books — then manage everything from a single Workspace View.

---

## New in v4.0: AI Workspace View

<div align="center">
<img src="docs/ai-workspace-view.png" width="90%">
</div>

Manage all AI-ready outputs for each folder in one place.

- Track completion status across all workspaces
- Open generated files directly from the view
- Refresh workspaces with a single click
- See what is missing or outdated at a glance

This turns AI Context Pack from a simple export tool into an AI-ready knowledge workspace for Obsidian.

---

## Core Workflow

```text
Obsidian Notes
      ↓
AI Workspace
      ↓
AI Brief          ← analyze your knowledge
      ↓
AI MOC            ← organize it
      ↓
Context Pack      ← export for AI
      ↓
Knowledge Book    ← export for reading

      ↓
ChatGPT / Claude / Gemini / NotebookLM / Kindle
```

---

## Features

### AI Workspace View

Manage AI-ready outputs for each folder from a single panel.

Track progress, open generated files, and refresh workspaces with one click.

---

### AI Brief Generator

Analyze a folder and generate a structured knowledge overview.

Identifies topic clusters, knowledge maps, relationship maps, and suggested AI prompts — before you export anything.

<div align="center">
<img src="docs/ai-brief-overview.png" width="90%">
</div>

---

### AI MOC Generator

Generate a Map of Content from your AI Brief or any note.

Turns discovered clusters into a structured, navigable knowledge layer.

<div align="center">
<img src="docs/ai-moc-overview.png" width="90%">
</div>

---

### Context Pack Export

Package notes into a single, clean Markdown file optimized for AI assistants.

Supports ChatGPT, Claude, Gemini, NotebookLM, and Claude Code. All Obsidian-specific syntax is cleaned automatically.

<div align="center">
<img src="docs/context-pack-overview.png" width="90%">
</div>

---

### Knowledge Book (EPUB)

Generate a structured EPUB book from your notes and AI Brief.

Includes a cover page, hierarchical table of contents, and embedded images. Read in Kindle, Apple Books, or Kobo.

![Knowledge Book cover](https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/knowledge-book-cover-europe.jpg)

---

## Quick Start

1. Install AI Context Pack from Community Plugins
2. Open the AI Workspace panel from the ribbon
3. Add a folder as a workspace
4. Click **Generate Workspace** to create an AI Brief and AI MOC
5. Click **Export Pack** or **Create EPUB** to generate your outputs

---

## Screenshots

<div align="center">
<img src="docs/ai-brief-overview.png" width="90%">
<p><em>AI Brief — analyze your vault before exporting</em></p>
</div>

<div align="center">
<img src="docs/ai-moc-overview.png" width="90%">
<p><em>AI MOC — organize insights into a navigable structure</em></p>
</div>

<img src="https://raw.githubusercontent.com/dualyze-ai/obsidian-context-pack/main/docs/images/knowledge-book-toc-europe.png" width="65%">

*Knowledge Book — table of contents generated from AI Brief clusters*

---

## Example Use Cases

### Research Workspace

Research notes → AI Brief → Context Pack → ChatGPT

Use AI Brief to understand your research, then export a Context Pack to ask deep questions.

### Learning Workspace

Study notes → AI Brief → Knowledge Book → Kindle

Turn your study notes into a structured EPUB book you can read anywhere.

### Project Workspace

Project documentation → Context Pack → Claude

Package your specs, architecture notes, and documentation for Claude Code.

---

## Supported AI Assistants

| AI | Chat | Project / Notebook |
|---|---|---|
| ChatGPT | ✓ | ✓ Projects |
| Claude | ✓ | ✓ Project |
| Gemini | ✓ | ✓ Notebook |
| Claude Code | ✓ | — |
| NotebookLM | — | ✓ |

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

---

## Sample Vaults

Try the plugin without preparing your own vault.

| Vault | Notes | Topics | Download |
|---|---|---|---|
| 🇺🇸 English | 86 notes | recipes / travel / books / paintings | [vault-sample-en.zip](https://s3.ap-northeast-1.amazonaws.com/assets.dualyzeai.com/obsidian-context-pack/vault-sample-en.zip) |
| 🇯🇵 Japanese | 86件 | 料理 / 旅行 / 読書 / 絵画 | [vault-sample-jp.zip](https://s3.ap-northeast-1.amazonaws.com/assets.dualyzeai.com/obsidian-context-pack/vault-sample-jp.zip) |

---

## Part of the Dualyze Ecosystem

```text
DualyzeAI → Obsidian → AI Context Pack → ChatGPT / Claude / Gemini / NotebookLM
```

| Tool | Role |
|---|---|
| DualyzeAI | Compare & Analyze |
| Obsidian | Save & Organize |
| AI Context Pack | Package & Prepare |
| ChatGPT / Claude / Gemini / NotebookLM | Research Deeper |

→ [Learn more about DualyzeAI](https://dualyzeai.com)

---

## Documentation

- [AI Brief Workflow](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/ai-brief-workflow.md)
- [Project Knowledge Packs](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/project-knowledge-packs.md)
- [AI Guides](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/ai-guides.md)
- [Features](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/features.md)
- [Changelog](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/changelog.md)

### Tutorials

- [How Alice Turned 20 Art Notes into an AI Knowledge Base](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/tutorials/tutorial-en-paintings.md)
- [Japanese Tutorial](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/tutorials/tutorial-ja-paintings.md)

---

## Advanced Features

<details>
<summary>AI Brief — details</summary>

AI Brief analyzes a folder and generates:

- **Executive Insight** — one-paragraph summary of the knowledge base
- **Topic Clusters** — groups of related notes with representative examples
- **Knowledge Map** — Mermaid diagram showing relationships between clusters
- **Relationship Map** — similarity scores between individual notes
- **Knowledge Health** — orphan notes, duplicate candidates, connectivity score
- **Suggested Prompts** — ready-to-use AI prompts for your content

AI Brief is stored as a Markdown file with frontmatter, making it reusable across workflows.

</details>

<details>
<summary>AI MOC — details</summary>

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

AI MOC is optimized for use as Context Pack source material.

</details>

<details>
<summary>Context Pack format</summary>

Context Packs are single Markdown files that bundle related notes.

Each pack includes:

- A structured header with source, date, and note count
- Clean note content (frontmatter stripped, Obsidian syntax removed)
- AI-specific instructions based on the selected output target
- Token count estimate

Source options: folder, tag, MOC, AI MOC, selected notes, daily notes.

</details>

<details>
<summary>Knowledge Book (EPUB) — details</summary>

Knowledge Books are generated from an AI Brief and its source notes.

Structure:

- Cover page with title, cover image (if found), note count, and date
- AI Brief as a preface (with diagnostic sections removed)
- Hierarchical table of contents from AI Brief clusters
- Source notes as book chapters
- Embedded images from note content

Supported readers: Kindle, Apple Books, Kobo, Calibre, and any EPUB reader.

</details>

<details>
<summary>Project Knowledge Packs — freshness tracking</summary>

Track which notes were sent to ChatGPT Projects, Claude Projects, Gemini, or NotebookLM.

Know when:

- Notes were updated since the last export
- New matching notes were added
- Files were deleted or renamed

Re-export only when needed.

→ [Learn more](https://github.com/dualyze-ai/obsidian-context-pack/blob/main/docs/project-knowledge-packs.md)

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
