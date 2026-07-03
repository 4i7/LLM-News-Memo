---
type: Reference
title: LLM News Shared Ledger
description: Canonical duplicate-control state for LLM News scheduled reports.
resource: https://github.com/4i7/LLM-News-Memo/tree/main/state
tags: [llm-news, duplicate-control, jsonl, schedule-state]
timestamp: 2026-07-03T15:00:00+09:00
---

# Contract

The ledger prevents `LLM Midday Brief` and `LLM Night Lite` from re-reporting old LLM/AI news as new.

Canonical files:

| Path | Role |
|---|---|
| [`state/llm-news-seen.jsonl`](../../state/llm-news-seen.jsonl) | Canonical machine-readable state. One JSON object per line. |
| [`state/llm-news-ledger-template.md`](../../state/llm-news-ledger-template.md) | Schema and update contract. |
| [`state/llm-news-ledger.md`](../../state/llm-news-ledger.md) | Human-readable summary and policy. |
| [`archive/`](../../archive/) | Import snapshots only. Do not use as current state. |

# Record Semantics

Each `topic` record is one canonical story. A new source, summary article, social post, or discussion is not a new topic unless it adds a hard factual delta.

Repeat coverage requires:

- report label `続報:`
- a concrete sentence beginning `前回からの差分:`
- updated JSONL state after publication

If the delta sentence cannot be written, classify the candidate as `DUPLICATE` or `ONGOING_NO_NEWS`.

# Relationship To OKF

This OKF bundle is documentation for agents. It does not change the JSONL schema. Agents should use OKF to understand how to edit, then write the canonical state files exactly as specified in `state/llm-news-ledger-template.md`.
