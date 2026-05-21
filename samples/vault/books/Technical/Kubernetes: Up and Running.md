---
tags:
  - Technical
  - Infrastructure
  - Containers
  - Kubernetes
  - rating:4
  - read:2023
---

# Kubernetes: Up and Running

**Author:** Brendan Burns, Joe Beda & Kelsey Hightower

## Overview

A comprehensive Japanese-language guide to Kubernetes, covering Pods, Services, Deployments, Ingress, and more. Thorough explanations with practical examples for both beginners and practitioners.

## Key Takeaways

- Pods are the smallest deployable unit — one or more containers sharing a network namespace
- Deployments manage replica count and rolling updates declaratively
- Services provide stable endpoints for ephemeral Pods
- ConfigMaps and Secrets decouple configuration from application code
- Always set resource requests and limits to protect node stability

## Memorable Quote

> Kubernetes does not hide complexity — it makes the inherent complexity of infrastructure expressible and manageable.

## How I Apply It

This book made EKS comprehensible. In production, I've found that resource settings and Liveness/Readiness Probes are the first things that bite you if done wrong.
