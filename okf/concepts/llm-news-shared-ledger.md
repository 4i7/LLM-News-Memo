---
type: Reference
title: LLM News Shared Ledger
description: Canonical duplicate-control state for LLM News scheduled reports.
resource: https://github.com/4i7/LLM-News-Memo
tags: [llm-news, duplicate-control, jsonl, schedule-state]
timestamp: 2026-07-03T15:20:00+09:00
---

# Contract

The ledger prevents `LLM Midday Brief` and `LLM Night Lite` from re-reporting old LLM/AI news as new.

# Current canonical state

| Path | Role |
|---|---|
| `topics/**/*.json` | Canonical per-topic records. One small JSON file per canonical story. |
| `runs/**/*.jsonl` | Per-run event logs. One small JSONL file per run or selected topic group. |
| `state/llm-news-ledger-manifest.json` | Storage-mode manifest and path contract. |
| `state/llm-news-ledger-template.md` | Schema and update contract. |
| `state/llm-news-ledger.md` | Human-readable summary and policy. |
| `state/llm-news-seen.jsonl` | Legacy bootstrap/import seed. Search or bounded fetch only; do not full-fetch or rewrite in scheduled runs. |
| `archive/` | Import snapshots only. Do not use as current state. |

# Record semantics

Each `topic` record is one canonical story. A new source, summary article, social post, or discussion is not a new topic unless it adds a hard factual delta.

Repeat coverage requires:

- report label `続報:`
- a concrete sentence beginning `前回からの差分:`
- an updated topic JSON file after publication
- a run event JSONL file recording the selection

If the delta sentence cannot be written, classify the candidate as `DUPLICATE` or `ONGOING_NO_NEWS`.

# Why sharded storage exists

Scheduled tasks must not rewrite a growing monolithic JSONL file. GitHub contents updates require full-file replacement, and connector output limits can make full reconstruction unsafe.

Therefore, scheduled runs update only small topic files and create small run event files.

# Relationship to OKF

This OKF bundle is documentation for agents. It does not change JSON keys. Agents should use OKF to understand how to edit, then write the canonical sharded state exactly as specified in `state/llm-news-ledger-template.md`.
