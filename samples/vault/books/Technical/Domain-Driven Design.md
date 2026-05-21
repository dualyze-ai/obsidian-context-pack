---
tags:
  - Technical
  - Software Design
  - Architecture
  - rating:4
  - read:2024
---

# Domain-Driven Design

**Author:** Eric Evans

## Overview

The original DDD text — a framework for modeling complex software systems around the business domain. Core concepts: Ubiquitous Language, Bounded Contexts, Entities, Value Objects, and Aggregates.

## Key Takeaways

- Ubiquitous Language: developers and domain experts share a single vocabulary — no translations needed
- Bounded Contexts: draw explicit boundaries around each domain model to prevent concept bleed
- Entity vs. Value Object: does this thing have identity across time, or is it defined only by its attributes?
- Aggregates: the unit of consistency — changes happen within an aggregate, never across boundaries
- Anti-corruption Layer: prevent external system concepts from polluting your domain model

## Memorable Quote

> The task of confronting the complexity of a domain and expressing that in a model is the central challenge of software design.

## How I Apply It

When designing microservice boundaries in AWS, the Bounded Context concept is invaluable. It gives you a principled answer to "where do I draw the line?"
