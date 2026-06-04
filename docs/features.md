# AI Context Pack — Features

## Usage

This plugin adds **two ribbon icons** to the left sidebar:

| Icon | Function |
|------|----------|
| <img src="icon-package.png" width="16"> | Context Pack / Export menu — folder, tag, MOC, and ZIP export |
| <img src="icon-calendar-arrow-down.png" width="16"> | Daily Notes Pack — open the date range picker |

All commands are also available from the **Command Palette** (`Cmd/Ctrl+P`) and **right-click menus** in the file explorer.

---

## Context Pack

Bundles multiple notes into one `.md` file. After building the pack, the **output target selector** appears — choose your AI destination.

| Trigger | Source |
|---|---|
| Ribbon → Context Pack (choose folder) | All notes in a selected folder |
| Ribbon → Context Pack (choose tag) | All notes with a selected tag |
| Right-click file → Create Context Pack from this MOC | Notes linked from the current file |
| Command: Create Context Pack from MOC | Same as above |

The pack is saved as `pack-folder-chatgpt-20240101.md` (named by source, AI target, and date).

---

## Output Target Selector

After building a pack, choose where to send it:

| Tab | Options |
|---|---|
| ChatGPT | Chat / Projects |
| Claude | Chat / Project |
| Gemini | Chat / Notebook |
| Agents | Claude Code / NotebookLM |

**Projects / Project / Notebook** — exports a file ready to upload as a knowledge source. Includes Project Knowledge Instructions automatically.

**Chat** — copies to clipboard for immediate use.

---

## Export (ZIP)

Exports notes as individual cleaned-up `.md` files in a ZIP.

| Trigger | Source |
|---|---|
| Ribbon → Export entire vault (ZIP) | Entire vault |
| Ribbon → Export folder (ZIP) | Selected folder |
| Ribbon → Export by tag (ZIP) | Notes with selected tag |
| Right-click folder → Export this folder (ZIP) | That folder |
| Right-click file → Export this note (.md) | Single note |

---

## MOC (Map of Content)

A **MOC** is an Obsidian convention: a note that works like a table of contents, containing wikilinks to a group of related notes. These commands generate a MOC automatically from a folder or tag.

| Trigger | Source |
|---|---|
| Ribbon → Create MOC (from tag) | All notes with selected tag |
| Right-click folder → Create MOC from this folder | All notes in folder |

Once you have a MOC, run **Create Context Pack from this MOC** to pack exactly those linked notes.

---

## AI MOC — Generate a MOC from any note

<div align="center">
<img src="demo-output.gif" width="100%">
</div>

**AI MOC** builds a Map of Content by following `[[wikilinks]]` outward — automatically discovering connections and organizing them into a structured hierarchy.

```
Root Note
    │
    ├── Core Concepts (notes directly linked from root)
    │       └── Related Notes (notes linked from those)
    │
    └── Referenced By (notes that link back to root)
```

### Usage

| Trigger | Action |
|---|---|
| Right-click any `.md` file → **Create AI MOC from this note** | Opens dialog with that note pre-selected |
| Ribbon → **Create MOC (from note)** | Opens dialog |
| Command Palette → **Create AI MOC from note** | Opens dialog |

### Dialog options

| Option | Default | Description |
|---|---|---|
| Root Note | — | Starting note for link traversal |
| Scope: Direct Links | | Collect only notes directly linked from root (depth 1) |
| Scope: Related Notes | ✓ | Also collect notes linked from those notes (depth 2) |
| Backlinks in MOC | ✓ | Include notes that link to the root |
| Backlinks in Context Pack | | Include backlink notes in the generated Context Pack |
| Generate Context Pack | ✓ | Build a Context Pack from all collected notes at the same time |

### Example — Paintings vault

With `Masterpieces of the World` as the root note:

```markdown
# [[Masterpieces of the World]]

## Core Concepts
- [[Impressionism]]
- [[Renaissance]]
- [[Baroque]]
- [[Modern Art]]

## Related Notes
- [[Claude Monet]]
- [[Leonardo da Vinci]]
- [[Rembrandt]]
- … (12 artists total)

## Referenced By
- [[Museum Guide]]
- [[Art for Beginners]]
```

---

## Mode Selector — Purpose-Aware Context Packs

The **Mode selector** appears in the output modal. Choose a mode to append purpose-specific instructions to the prompt automatically.

| Mode | Best for | Added instructions |
|------|---------|-------------------|
| **None** | General use | No additions |
| **Research** | Fact-checking, comparative analysis | Prioritize evidence, distinguish facts from inference, cite source notes |
| **Learning** | Study notes, tutorials | Step-by-step explanations, examples, define technical terms |
| **Writing** | Articles, documentation | Consistent style, structural suggestions, reader perspective |
| **Development** | Code, specs, architecture | Actionable steps, concrete changes over vague suggestions, explain deviations from existing specs |

### Combinations

| Target AI | Mode | Use case |
|-----------|------|---------|
| Claude | Research | Deep analysis of your reading notes |
| ChatGPT | Learning | Turn your study notes into a tutor session |
| Claude Code | Development | Implement features from your spec notes |
| Gemini | Research | Survey a large note collection for evidence |

Set a default mode in **Settings → AI Context Pack → Default Mode**.

> Mode is not applied when exporting to NotebookLM.

---

## Daily Notes Pack

Click the **calendar-arrow-down** ribbon icon to open the date range picker.

**Presets:** This week / Last week / Last 7 days / Last 14 days / Last 30 days / Custom

**Folder auto-detection** tries the following sources in order:
1. Obsidian built-in Daily Notes plugin settings
2. Japanese Calendar plugin settings
3. Periodic Notes plugin settings
4. Vault scan — finds the folder containing the most `YYYY-MM-DD.md` files

**Exclude tags** — comma-separated list of tags to exclude (e.g. `#private, #draft`).

**Weekly summary** — adds a summary header (`# Weekly Summary: 2026 Week 22`) before the daily notes content.

### Commands

| Command | Description |
|---------|-------------|
| Daily Notes: Create pack (default range) | Uses the default range from settings |
| Daily Notes: Create pack (choose range) | Opens the date range picker modal |
| Daily Notes: Create weekly summary pack | Packs this week's notes with a summary header |

---

## Settings

| Setting | Description | Default |
|---|---|---|
| Output folder | Where to save ZIP exports | Vault root |
| Flatten folder structure | Merge all files into one folder in the ZIP | Off |
| Include frontmatter title | Convert `title:` and `tags:` to plain text at the top of each note | On |
| Open folder after export | Auto-open the output folder when done (desktop only) | Off |
| Custom replacement rules | Find/replace rules applied before export (plain text or regex) | — |

### Output settings

| Setting | Description | Default |
|---|---|---|
| Show output selector | Choose the output target each time | On |
| Default output target | Used when the selector is off | NotebookLM (text) |
| Show token count | Display estimated token count in the selector | On |
| Warn when over limit | Warn when the pack exceeds the AI's recommended token limit | On |
| Open AI website after export | Open the AI site after clipboard copy | Off |
| Include Common Instructions by default | Prepend Common Instructions to every pack | On |
| Common Instructions | Editable base instructions prepended to every pack. Use `{source}` for folder/tag name, `{count}` for note count | — |

### Daily Notes mode settings

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-detect Daily Notes | Auto-detect folder and format from plugin settings | On |
| Daily Notes folder | Folder path (manual, when auto-detect is off) | — |
| Date format | moment.js format | YYYY-MM-DD |
| Default range | Preset period for quick pack | Last 7 days |
| Exclude tags | Tags to skip (comma-separated) | — |
| Sort order | Oldest first / Newest first | Oldest first |
