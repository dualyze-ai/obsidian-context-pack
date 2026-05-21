# Context Pack for NotebookLM

> Build clean Context Packs from your Obsidian vault for NotebookLM.

by [dualyzeAI](https://dualyzeai.com)

---

## The problem

When you paste raw Obsidian notes into NotebookLM, the results are noisy. Broken `[[wikilinks]]`, frontmatter YAML, `![[embedded images]]`, `%%comments%%`, and `#inline-tags` all end up in the source — and NotebookLM treats them as meaningful content. The answers you get reflect that noise.

## What this plugin does

**Export** cleans up your notes and packages them into a ZIP file ready for NotebookLM upload.

**Context Pack** bundles related notes into a single formatted `.md` file, organized by folder, tag, or MOC. NotebookLM takes one source at a time, so bundling related notes significantly improves answer quality.

Both features run the same formatter: frontmatter is removed, wikilinks are resolved, embeds and comments are stripped, and blank lines are collapsed.

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

All commands are available via the Command Palette (`Cmd/Ctrl + P`).

| Command | Description |
|---|---|
| Export vault for NotebookLM | Exports the target folder (or full vault) as a ZIP |
| Export current note for NotebookLM | Exports only the open note |
| Create Context Pack from folder | Bundles all notes in a folder into one `.md` file |
| Create Context Pack from tag | Bundles notes matching a tag |
| Create Context Pack from MOC | Follows `[[links]]` in the current note (1 level deep) |

---

## Settings

| Setting | Description | Default |
|---|---|---|
| Target folder | Folder to export. Empty = full vault | — |
| Output folder | Where to save ZIPs | Vault root |
| Flatten folder structure | Merge all notes into one folder in the ZIP | Off |
| Include frontmatter title | Convert `title` and `tags` to plain text at top of note | On |
| Open folder after export | Open output folder when done (desktop only) | Off |
| Context Pack output folder | Where to save Context Pack files | Same as output folder |
| Custom replacement rules | User-defined find/replace rules (plain text or regex) | — |

---

## License

MIT

---

Made by [dualyzeAI](https://dualyzeai.com)
