---
type: Knowledge Bundle
title: LLM News Memo OKF Bundle
description: Agent-readable editing contract for the LLM News shared ledger.
okf_version: "0.1"
resource: https://github.com/4i7/LLM-News-Memo
tags: [llm-news, ledger, schedules, duplicate-control, okf]
timestamp: 2026-07-03T15:00:00+09:00
---

# Purpose

This Open Knowledge Format bundle documents how agents should read and edit `4i7/LLM-News-Memo`.

The canonical data remains [`state/llm-news-seen.jsonl`](../state/llm-news-seen.jsonl). OKF is the companion knowledge layer: it explains the contract, the editing rules, and the scheduled-task writeback behavior in Markdown with YAML frontmatter.

# Start Here

Read these concepts before editing:

- [Shared Ledger Concept](concepts/llm-news-shared-ledger.md)
- [Ledger Editing Playbook](playbooks/editing-ledger.md)
- [Scheduled Run Writeback Playbook](playbooks/scheduled-run-writeback.md)
- [Web ChatGPT Schedule Update Prompt](prompts/web-chatgpt-schedule-update.md)

# Rules

- `state/llm-news-seen.jsonl` is canonical machine state.
- `state/llm-news-ledger-template.md` is the JSONL schema and update contract.
- `state/llm-news-ledger.md` is the human-readable summary.
- `archive/` contains import evidence only, not current state.
- `okf/` explains how agents should preserve and update the ledger.

# Citations

[1] [Open Knowledge Format v0.1 draft spec](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
[2] [Google Cloud OKF announcement](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
