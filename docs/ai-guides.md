# AI Context Pack — AI Guides

This guide explains how to use AI Context Pack with each supported AI assistant.

---

# Chat vs Project / Notebook

AI Context Pack supports two major workflows.

| | Chat | Project / Notebook |
|---|---|---|
| Setup | Paste every time | Upload once |
| Context Lifetime | Current conversation | Persistent |
| Best For | Temporary tasks | Long-term knowledge |
| Updating Notes | Re-export and paste | Re-export and replace file |

---

## When to Use Chat

Use Chat when:

- Notes change frequently
- You want quick answers
- You only need the context once
- You are experimenting

Examples:

- ChatGPT Chat
- Claude Chat
- Gemini Chat

---

## When to Use Project / Notebook

Use Projects or Notebooks when:

- The same notes are used repeatedly
- You have a stable knowledge base
- You want persistent context
- You want to avoid pasting large packs repeatedly

Examples:

- ChatGPT Projects
- Claude Project
- Gemini Notebook
- NotebookLM

---

# ChatGPT

## Chat

1. Run **Context Pack**
2. Select:

```text
ChatGPT → Chat
```

3. Click **Export**
4. The pack is copied to your clipboard
5. Open ChatGPT
6. Paste (`Cmd/Ctrl+V`)

AI Context Pack automatically adds ChatGPT-specific instructions.

---

## Projects

1. Run **Context Pack**
2. Select:

```text
ChatGPT → Projects
```

3. Click **Export**
4. Save the generated file
5. Open ChatGPT
6. Open your Project
7. Go to **Sources**
8. Click **Add Source**
9. Upload the file

The notes become permanent project knowledge.

---

## Good Use Cases

### Study Notes

Ask:

> Explain this topic step-by-step.

### Reading Notes

Ask:

> What themes appear across these notes?

### Travel Notes

Ask:

> Build a 10-day itinerary from my notes.

---

## Tip

Enable:

```text
Open AI Website After Export
```

to launch ChatGPT automatically.

---

# Claude

## Chat

1. Run **Context Pack**
2. Select:

```text
Claude → Chat
```

3. Click **Export**
4. Paste into Claude

Large packs may appear as:

```text
PASTED
```

This is normal.

Claude still reads the content.

---

## Project

1. Run **Context Pack**
2. Select:

```text
Claude → Project
```

3. Click **Export**
4. Save the file
5. Open Claude
6. Open a Project
7. Upload the generated file

The pack becomes part of project knowledge.

---

## Good Use Cases

### Research

Ask:

> Compare competing viewpoints in these notes.

### Reading Collections

Ask:

> Identify recurring themes across all notes.

### Writing

Ask:

> Turn these notes into a structured article.

---

## Why Claude?

Claude excels at:

- Long-context analysis
- Comparative reasoning
- Evidence gathering
- Structured explanations

---

## Tip

Enable:

```text
Open AI Website After Export
```

to launch Claude automatically.

---

# Gemini

## Chat

1. Run **Context Pack**
2. Select:

```text
Gemini → Chat
```

3. Click **Export**
4. Paste into Gemini

---

## Notebook

1. Run **Context Pack**
2. Select:

```text
Gemini → Notebook
```

3. Click **Export**
4. Save the file
5. Open Gemini
6. Create or open a Notebook
7. Upload the file

The pack becomes notebook knowledge.

---

## Good Use Cases

### Large Vaults

Ask:

> Summarize all destinations in my travel notes.

### Research Collections

Ask:

> Identify patterns across hundreds of notes.

### Knowledge Surveys

Ask:

> What topics appear most frequently?

---

## Why Gemini?

Gemini is especially useful for:

- Very large context windows
- Broad summarization
- Knowledge exploration

---

## Tip

Enable:

```text
Open AI Website After Export
```

to launch Gemini automatically.

---

# Claude Code

Claude Code is designed for software development workflows.

---

## Workflow

1. Run **Context Pack**
2. Select:

```text
Agents → Claude Code
```

3. Click **Export**
4. Copy the generated pack
5. Open Claude Code
6. Paste the pack into your session

---

## Best Sources

- Specifications
- Architecture notes
- Design decisions
- Technical documentation
- ADRs

---

## Example Questions

### Architecture

Ask:

> Generate a project structure from these specifications.

### Implementation

Ask:

> Implement the data model described in these notes.

### Planning

Ask:

> Create a prioritized task list.

### Review

Ask:

> Identify unresolved design decisions.

---

## Recommended Mode

```text
Development
```

Development mode adds instructions optimized for engineering workflows.

---

# NotebookLM

NotebookLM works differently from conversational AI.

Instead of pasting context into chat, you upload knowledge sources.

---

## Workflow

1. Run **Context Pack**
2. Select:

```text
Agents → NotebookLM
```

3. Click **Export**
4. Save the file

Example:

```text
pack-recipes-notebooklm-20260605.md
```

5. Open NotebookLM

https://notebooklm.google.com

6. Create a notebook
7. Click **Add Source**
8. Upload the generated file

---

## Example Questions

### Recipes

Ask:

> What can I make with pork and vegetables?

### Travel

Ask:

> Compare all destinations in my notes.

### Books

Ask:

> Summarize the key ideas across these books.

### Study Notes

Ask:

> Generate a study guide from these notes.

---

## Why NotebookLM?

NotebookLM is ideal when:

- Sources should remain separate
- Citations matter
- You want notebook-style exploration
- You want source-grounded answers

---

# Recommended Combinations

| Goal | AI | Mode |
|---|---|---|
| Learning a subject | ChatGPT | Learning |
| Deep research | Claude | Research |
| Large knowledge base | Gemini Notebook | Research |
| Software development | Claude Code | Development |
| Source-grounded exploration | NotebookLM | None |
| Documentation writing | Claude | Writing |
| Blog writing | ChatGPT | Writing |
| Technical specifications | Claude Code | Development |

---

# Sample Vault Workflows

## Paintings Vault

```text
Masterpieces of the World
        ↓
Create AI MOC
        ↓
Generate Context Pack
        ↓
Upload to ChatGPT Projects
```

Ask:

> Compare Impressionism and Baroque.

---

## Travel Vault

```text
Travel Folder
        ↓
Context Pack
        ↓
Gemini Notebook
```

Ask:

> Which destination is best for a first-time solo traveler?

---

## Project Specifications

```text
linkbox-spec
        ↓
Context Pack
        ↓
Claude Code
```

Ask:

> Generate the implementation roadmap.

---

# Related Documentation

- README.md
- docs/features.md
- docs/changelog.md
