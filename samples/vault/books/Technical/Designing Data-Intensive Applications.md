---
tags:
  - Technical
  - Databases
  - Distributed Systems
  - rating:5
  - read:2024
---

# Designing Data-Intensive Applications

**Author:** Martin Kleppmann

## Overview

The definitive guide to building reliable, scalable, and maintainable data systems. Covers replication, sharding, transactions, stream processing, and the deeper truths of distributed computing.

## Key Takeaways

- Reliability, Scalability, and Maintainability are the three pillars of data systems
- Eventual consistency vs. ACID transactions: know when to use which
- Event sourcing and CQRS as patterns for building auditable, scalable systems
- The fundamental difficulty of consensus in distributed systems
- Batch processing and stream processing are more similar than they appear

## Memorable Quote

> Data is the record of facts. But data systems are the interpretive apparatus that decides what those facts mean.

## How I Apply It

My criteria for choosing between DynamoDB and Aurora became much clearer. I now start from "what do I need to guarantee?" not "what does my team already know?"
