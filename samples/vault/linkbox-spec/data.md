---
tags:
  - spec
---

# Data

Each saved link is an object:

```ts
interface Link {
  id: string;      // nanoid
  url: string;
  title: string;   // user-provided or auto-fetched from <title>
  tag: string;     // single tag, optional
  savedAt: string; // ISO date
}
```

Stored as a JSON array in `localStorage["linkbox"]`.
