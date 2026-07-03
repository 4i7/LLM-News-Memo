---
type: Knowledge Bundle
title: LLM News Memo OKF Bundle
description: Agent-readable editing contract for the LLM News shared ledger.
okf_version: "0.2"
resource: https://github.com/4i7/LLM-News-Memo
tags: [llm-news, ledger, schedules, duplicate-control, okf]
timestamp: 2026-07-03T15:20:00+09:00
---

# Purpose

This Open Knowledge Format bundle documents how agents should read and edit `4i7/LLM-News-Memo`.

The current canonical duplicate-control state is sharded:

- `topics/**/*.json` contains one small topic record per canonical story.
- `runs/**/*.jsonl` contains small per-run event logs.
- `state/llm-news-seen.jsonl` is a legacy bootstrap/import seed. It must not be full-fetched or rewritten during scheduled runs.

OKF is the companion knowledge layer: it explains the contract, editing rules, and scheduled-task behavior.

# Start Here

Read these before editing or running scheduled writeback:

- [Shared Ledger Concept](concepts/llm-news-shared-ledger.md)
- [Scheduled Run Writeback Playbook](playbooks/scheduled-run-writeback.md)
- [Ledger Editing Playbook](playbooks/editing-ledger.md)
- [`state/llm-news-ledger-template.md`](../state/llm-news-ledger-template.md)
- [`state/llm-news-ledger-manifest.json`](../state/llm-news-ledger-manifest.json)

# Rules

- `topics/**/*.json` and `runs/**/*.jsonl` are current duplicate-control state.
- `state/llm-news-ledger-template.md` is the schema and update contract.
- `state/llm-news-ledger.md` is the human-readable summary.
- `state/llm-news-seen.jsonl` is legacy import/bootstrap data only. Do not rewrite it from scheduled tasks.
- `archive/` contains import evidence only, not current state.
- `okf/` explains how agents should preserve and update the ledger.

# Failure principle

If a scheduled task cannot safely update the ledger, it must report the failure explicitly. It must not pretend dedupe or writeback succeeded.
