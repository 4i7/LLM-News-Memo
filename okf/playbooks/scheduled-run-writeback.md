---
type: Playbook
title: Scheduled Run Writeback
description: Runtime protocol for LLM Midday Brief and LLM Night Lite scheduled tasks.
resource: https://github.com/4i7/LLM-News-Memo
tags: [schedule, writeback, github-connector, duplicate-control]
timestamp: 2026-07-03T15:00:00+09:00
---

# Scope

This playbook applies to both scheduled tasks:

- `LLM News 昼` / `LLM Midday Brief`
- `LLM News 夜` / `LLM Night Lite`

# Runtime Protocol

At the start of every scheduled run, fetch from `4i7/LLM-News-Memo`:

1. `okf/index.md`
2. `okf/concepts/llm-news-shared-ledger.md`
3. `okf/playbooks/scheduled-run-writeback.md`
4. `state/llm-news-ledger-template.md`
5. `state/llm-news-ledger.md`
6. `state/llm-news-seen.jsonl`

Then:

1. Parse every non-empty line in `state/llm-news-seen.jsonl` as one JSON object.
2. Build duplicate keys from `topic_key`, `canonical_title`, `aliases`, `organizations`, `products`, and `sources`.
3. Classify each candidate as `NEW`, `FOLLOW_UP`, `DUPLICATE`, `ONGOING_NO_NEWS`, or `UNCONFIRMED_SIGNAL`.
4. Include only `NEW`, strong `FOLLOW_UP`, and high-signal labeled `UNCONFIRMED_SIGNAL` in the main report.
5. For any known topic in the main report, label it `続報:` and include `前回からの差分: ...`.
6. Before final output, re-fetch `state/llm-news-seen.jsonl`, merge selected topics, and write the complete JSONL back to GitHub.
7. Update `state/llm-news-ledger.md` as the human-readable summary.

# Failure Behavior

- If ledger read fails, state `LEDGER_READ_FAILED` in `GitHub ledger 状態`.
- If JSONL parse fails, state `LEDGER_PARSE_FAILED` and do not claim dedupe succeeded.
- If writeback fails, state `LEDGER_WRITE_FAILED`; still produce the report, but say the ledger was not updated.
- Do not write fallback state to another repository.
- Do not use `4i7/knowledge-distiller` for this workflow.
- Do not treat files in `archive/` as current state.
