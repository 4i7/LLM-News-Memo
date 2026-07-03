# Agent Editing Rules

This repo is a narrow shared ledger for `LLM Midday Brief` and `LLM Night Lite`.

Before editing, read:

1. `okf/index.md`
2. `okf/playbooks/editing-ledger.md`
3. `okf/playbooks/scheduled-run-writeback.md`
4. `state/llm-news-ledger-template.md`

Keep `state/llm-news-seen.jsonl` as the canonical machine state. The OKF files explain how to edit and consume the ledger; they do not replace the JSONL schema.

Do not rewrite history, rename JSON keys, localize JSON keys, convert JSONL into Markdown, or delete existing records unless the user explicitly requests cleanup.

If you change edit rules, schedule behavior, or the meaning of fields, update the OKF playbook and `okf/log.md` in the same commit.
