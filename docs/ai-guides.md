# AI Context Pack — AI Guides

## Chat vs Project / Notebook

| | Chat | Project / Notebook |
|---|---|---|
| **How to use** | Copy → paste each time | Upload once, reuse |
| **Best for** | One-off queries, frequently updated notes | Same notes queried repeatedly |
| **On note update** | Re-export → re-paste | Re-export → replace the file |

---

## ChatGPT

### Chat

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **ChatGPT → Chat**
3. Click **Export** — the pack is copied to your clipboard
4. Open [ChatGPT](https://chat.openai.com/) and paste (`Cmd/Ctrl+V`)

### Projects

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **ChatGPT → Projects**
3. Click **Export** — a file is saved
4. Open [ChatGPT](https://chat.openai.com/) → your project → **Sources** tab → **Add source** → upload the file
5. Query the project — no need to paste context each time

### Sample queries — Travel notes

| Question | What you get |
|---|---|
| *"Which destination is best for a first solo trip on a mid-range budget?"* | Ranked recommendations from your notes |
| *"Plan a 10-day Europe itinerary covering Paris, Barcelona, and Rome"* | Day-by-day itinerary with travel order |
| *"Create a packing checklist based on the climates and cultures in these notes"* | Tailored checklist per destination |

### Sample queries — Paintings (AI MOC)

| Question | What you get |
|---|---|
| *"Compare how Impressionism and Baroque each use light"* | Side-by-side analysis drawing on Monet, Caravaggio, and Rembrandt |
| *"Which artist in these notes would be most accessible to someone seeing art for the first time?"* | Recommendation with reasoning from your notes |
| *"Give me a one-sentence description of each artist's signature style"* | Quick-reference summary for all 12 artists |

> **Tip:** Turn on **Open AI website after export** in settings to open ChatGPT automatically after exporting.

---

## Claude

### Chat

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **Claude → Chat**
3. Click **Export** — the pack is copied to your clipboard
4. Open [Claude](https://claude.ai/) and paste (`Cmd/Ctrl+V`)

When the pack is large, Claude shows it as a **PASTED** block — this is normal. The content is included and Claude will read it in full.

### Project

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **Claude → Project**
3. Click **Export** — a file is saved
4. Open [Claude](https://claude.ai/) → your project → right panel **Files** → **+** → **Upload from device**
5. Query the project — the pack is always available as project knowledge

Claude handles packs up to ~180K tokens and excels at analysis, structured reasoning, and detailed comparisons.

### Sample queries — Book notes

| Question | What you get |
|---|---|
| *"Which books in my notes would you recommend I read next, and why?"* | Ranked recommendations based on your highlights |
| *"What themes appear most often across my reading notes?"* | Cross-book pattern analysis |
| *"Summarize the key arguments from each book in one sentence"* | Concise per-book summaries |
| *"Which ideas from these books could apply to my work?"* | Practical connections drawn from your notes |

> **Tip:** Turn on **Open AI website after export** in settings to open Claude automatically after exporting.

---

## Gemini

### Chat

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **Gemini → Chat**
3. Click **Export** — the pack is copied to your clipboard
4. Open [Gemini](https://gemini.google.com/) and paste (`Cmd/Ctrl+V`)

### Notebook (NotebookLM)

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **Gemini → Notebook**
3. Click **Export** — a file is saved
4. Open [NotebookLM](https://notebooklm.google.com) → your notebook → **+ Add source** → upload the file
5. Query the notebook — the pack is always available as a knowledge source

Gemini supports packs up to ~800K tokens — ideal for large note collections.

### Sample queries — Travel notes

| Question | What you get |
|---|---|
| *"Give me an overview of all the destinations in my notes"* | Full summary across all travel notes |
| *"Which trips had the most budget tips? Summarize them"* | Budget advice extracted from your notes |
| *"Find any recurring recommendations across multiple destinations"* | Cross-destination patterns |

> **Tip:** Turn on **Open AI website after export** in settings to open Gemini automatically after exporting.

---

## Claude Code

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **Agents → Claude Code**
3. Click **Export** — the pack is copied to your clipboard
4. Open your project in Claude Code and paste the pack as context

Common Instructions with Claude Code-specific additions are prepended automatically — treating the pack as project knowledge, following coding conventions, and asking before making assumptions.

Claude Code handles packs up to ~50K tokens, ideal for project specs, architecture notes, and decision records.

### Sample queries — Project specs

| Question | What you get |
|---|---|
| *"Based on these specs, scaffold the initial project structure"* | File and folder layout matching the spec |
| *"Implement the data model described in the notes"* | TypeScript types and storage logic |
| *"What open questions need to be resolved before we start building?"* | Summary of unresolved items |
| *"Generate a task list from these specs"* | Prioritized implementation checklist |

> **Tip:** Pack a single folder (e.g. `linkbox-spec/`) to keep the context focused on one feature area.

---

## NotebookLM

1. Run **Context Pack** on a folder or tag
2. In the output selector, choose **Agents → NotebookLM**
3. Click **Export** — a `pack-recipes-notebooklm-20240101.md` file is saved
4. Open [NotebookLM](https://notebooklm.google.com) → **New notebook** → **Add source** → **Upload file** → select the file
5. Start asking questions

### Sample queries — Recipes

| Question | What you get |
|---|---|
| *"What can I make for dinner tonight using pork and vegetables?"* | Suggestions filtered from your notes |
| *"Which recipes take under 30 minutes?"* | Quick-cook recipes from your collection |
| *"Compare the ingredients in carbonara and gratin"* | Side-by-side breakdown |
| *"Give me a shopping list for making nikujaga for 4 people"* | Ingredient list pulled directly from your note |

> **Tip:** The more notes you include in the pack, the richer the answers. Try packing your entire recipe folder at once.
