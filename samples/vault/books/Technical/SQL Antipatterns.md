---
tags:
  - Technical
  - Databases
  - SQL
  - rating:5
  - read:2023
---

# SQL Antipatterns

**Author:** Bill Karwin

## Overview

24 common SQL and schema design mistakes — with clear explanations of why they fail and what to do instead. Equally valuable for developers and DBAs.

## Key Takeaways

- Naive Tree: use closure tables instead of adjacency lists for hierarchical data
- Multi-Column Attributes: never pack multiple values into a single column
- Index Shotgun: don't add indexes indiscriminately — measure their effect
- SQL Injection: always use parameterized queries — no exceptions
- EAV Pattern: ultra-flexible schemas create unmaintainable messes

## Memorable Quote

> Every antipattern was once someone's well-intentioned solution to a real problem.

## How I Apply It

Reviewing my past code, I found several of these patterns in production. I've since used this book as a design review checklist on every new project.
