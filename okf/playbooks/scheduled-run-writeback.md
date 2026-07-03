---
type: Playbook
title: Scheduled Run Writeback
description: Runtime protocol for LLM Midday Brief and LLM Night Lite scheduled tasks.
resource: https://github.com/4i7/LLM-News-Memo
tags: [schedule, writeback, github-connector, duplicate-control]
timestamp: 2026-07-03T15:20:00+09:00
---

# Scope

This playbook applies to both scheduled tasks:

- `LLM News 昼` / `LLM Midday Brief`
- `LLM News 夜` / `LLM Night Lite`

# Runtime protocol

At the start of every scheduled run, fetch from `4i7/LLM-News-Memo`:

1. `okf/index.md`
2. `okf/concepts/llm-news-shared-ledger.md`
3. `okf/playbooks/scheduled-run-writeback.md`
4. `state/llm-news-ledger-manifest.json`
5. `state/llm-news-ledger-template.md`
6. `state/llm-news-ledger.md`

Do **not** full-fetch `state/llm-news-seen.jsonl` during scheduled runs. It is legacy bootstrap/import data only.

Then:

1. Create candidate topics with `topic_key`, `canonical_title`, `aliases`, `organizations`, `products`, and `sources`.
2. For each candidate, search `4i7/LLM-News-Memo` for exact or near-exact matches using:
   - `topic_key`
   - `canonical_title`
   - high-signal aliases
   - source URLs
3. Fetch only the matching small topic JSON files under `topics/**/*.json`.
4. If no topic file matches, optionally use bounded search or small line-range fetches against `state/llm-news-seen.jsonl` for legacy imported topics. Never full-fetch or rewrite that file.
5. Classify each candidate as `NEW`, `FOLLOW_UP`, `DUPLICATE`, `ONGOING_NO_NEWS`, or `UNCONFIRMED_SIGNAL`.
6. Include only `NEW`, strong `FOLLOW_UP`, and high-signal labeled `UNCONFIRMED_SIGNAL` in the main report.
7. For any known topic in the main report, label it `続報:` and include `前回からの差分: ...`.

# Writeback protocol

Before final output:

1. For each selected `NEW` topic, create one small JSON file at:

   ```text
   topics/<topic_key>.json
   ```

2. For each selected `FOLLOW_UP`, fetch the matching topic JSON file, merge the delta, and update only that topic file.
3. For important duplicate/watch decisions, create a small run event file instead of editing a global ledger.
4. Create one small run event JSONL file under:

   ```text
   runs/YYYY-MM-DD/<run-name>-<slug>.jsonl
   ```

5. Update `state/llm-news-ledger.md` only if the human-readable summary needs a compact adjustment.
6. Do not update, append to, or rewrite `state/llm-news-seen.jsonl` from scheduled runs.
7. If a topic-file SHA conflict occurs, re-fetch that topic file, merge again, and retry once.

# Failure behavior

- If required OKF or manifest files cannot be read, state `LEDGER_READ_FAILED` in `GitHub ledger 状態`.
- If a topic JSON file or run event cannot be parsed, state `LEDGER_PARSE_FAILED` and do not claim dedupe succeeded for that item.
- If topic-file or run-event writeback fails, state `LEDGER_WRITE_FAILED`; still produce the report, but say the ledger was not fully updated.
- Do not write fallback state to another repository.
- Do not use `4i7/knowledge-distiller` for this workflow.
- Do not treat files in `archive/` as current state.
- Do not use full-file reconstruction of `state/llm-news-seen.jsonl` as a writeback mechanism.
