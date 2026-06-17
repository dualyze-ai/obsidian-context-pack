# Tutorial: Create Your First AI Workspace

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

**Alice:** Done. I can see it now — it says 20 notes and shows AI Brief, AI MOC, Context Pack, and Knowledge Book. It shows 0/4 outputs ready.

**Bob:** Those are your four outputs. Right now they're all "Not created." Click **Generate Workspace** to generate them for the first time.

---

**Alice:** It ran. AI Brief and AI MOC are green, but Context Pack and Knowledge Book still say "Not created." It shows "2/4 outputs ready."

**Bob:** That's correct. Generate Workspace creates AI Brief and AI MOC automatically. For the other two, scroll down to **Generate Outputs** and click **Export Pack** for the Context Pack, or **Create EPUB** for the Knowledge Book.

**Bob:** And one more thing — Generate Workspace is only needed the first time. After that, you'll use Refresh Workspace whenever your notes change.

**Alice:** I clicked Export Pack and a dialog appeared — "Select output target." There are tabs for ChatGPT, Claude, Gemini, and Agents.

**Bob:** Choose the AI tool you want to use. Each target formats the Context Pack with instructions specific to that tool. If you're not sure, just pick ChatGPT. You can export again for a different target any time.

**Alice:** Got it. I selected ChatGPT and clicked Export. Now the Context Pack says "Ready." I clicked Create EPUB too. Now it says "4/4 outputs ready."

**Bob:** Perfect. You can click **Open** next to any output to see what was generated.

**Alice:** The AI Brief is really interesting — it found clusters I didn't notice, like "Historic Sites" and "Local Food."

**Bob:** Think of AI Brief as an executive summary of your folder. It maps the structure of your knowledge before you export anything. The AI MOC turns those clusters into a navigable index. The Context Pack is what you actually give to an AI tool.

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

## What Alice built

After this tutorial, Alice has:

- one Folder Workspace for `travel/`
- an AI Brief with topic clusters and a knowledge map
- an AI MOC organized for export
- a Context Pack ready for ChatGPT, Claude, or Gemini
- a Knowledge Book for reading in Kindle or Apple Books
- a repeatable workflow for keeping AI-ready knowledge up to date
