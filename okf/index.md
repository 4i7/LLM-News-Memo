---
type: Knowledge Bundle
title: LLM News Memo OKF Bundle
description: Agent-readable editing contract for the LLM News shared ledger and explicitly separated curated reports.
okf_version: "0.2"
resource: https://github.com/4i7/LLM-News-Memo
tags: [llm-news, ledger, schedules, duplicate-control, reports, okf]
timestamp: 2026-07-20T18:00:00+09:00
---

# Purpose

This Open Knowledge Format bundle documents how agents should read and edit `4i7/LLM-News-Memo`.

The current canonical duplicate-control state is sharded:

- `topics/**/*.json` contains one small topic record per canonical story.
- `runs/**/*.jsonl` contains small per-run event logs.
- `state/llm-news-seen.jsonl` is a legacy bootstrap/import seed. It must not be full-fetched or rewritten during scheduled runs.

OKF is the companion knowledge layer: it explains the contract, editing rules, scheduled-task behavior, and boundaries for explicitly requested curated reports.

# Start Here

Read these before editing or running scheduled writeback:

- [Shared Ledger Concept](concepts/llm-news-shared-ledger.md)
- [Scheduled Run Writeback Playbook](playbooks/scheduled-run-writeback.md)
- [Ledger Editing Playbook](playbooks/editing-ledger.md)
- [`state/llm-news-ledger-template.md`](../state/llm-news-ledger-template.md)
- [`state/llm-news-ledger-manifest.json`](../state/llm-news-ledger-manifest.json)

For curated GitHub utility reports, also read:

- [GitHub Repo Radar Reports](concepts/github-repo-radar-reports.md)
- [July 2026 GitHub Repo Radar Retrospective](../reports/github-repo-radar/2026-07-retrospective.md)

# Rules

- `topics/**/*.json` and `runs/**/*.jsonl` are current duplicate-control state.
- `state/llm-news-ledger-template.md` is the schema and update contract.
- `state/llm-news-ledger.md` is the human-readable LLM News summary.
- `state/llm-news-seen.jsonl` is legacy import/bootstrap data only. Do not rewrite it from scheduled tasks.
- `archive/` contains import evidence only, not current state.
- `reports/` contains explicitly requested curated material and is not canonical LLM News state.
- `okf/` explains how agents should preserve and update both the ledger contract and report boundaries.

# Failure principle

If a scheduled task cannot safely update the ledger, it must report the failure explicitly. It must not pretend dedupe or writeback succeeded.

Scheduled LLM News tasks must not use `reports/` as duplicate-control input or modify reports as part of routine writeback.