# Agent Editing Rules

This repo is a narrow shared ledger for `LLM Midday Brief` and `LLM Night Lite`.

Before editing, read:

1. `okf/index.md`
2. `okf/playbooks/editing-ledger.md`
3. `okf/playbooks/scheduled-run-writeback.md`
4. `state/llm-news-ledger-template.md`
5. `state/llm-news-ledger-manifest.json`

## Current storage model

Canonical duplicate-control state is sharded:

- `topics/**/*.json` contains one small JSON topic record per canonical story.
- `runs/**/*.jsonl` contains small per-run event logs.
- `state/llm-news-seen.jsonl` is a legacy bootstrap/import file. Scheduled tasks must not full-fetch or rewrite it.

The OKF files explain how to edit and consume the ledger; they do not replace the JSON schemas.

Do not rewrite history, rename JSON keys, localize JSON keys, convert JSON/JSONL into Markdown, or delete existing records unless the user explicitly requests cleanup.

If you change edit rules, schedule behavior, or the meaning of fields, update the OKF playbook and `okf/log.md` in the same commit.
