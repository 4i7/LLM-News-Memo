---
type: Playbook
title: Editing the LLM News Ledger
description: Minimal rules for agents that edit the shared ledger repository.
resource: https://github.com/4i7/LLM-News-Memo
tags: [agent-editing, jsonl, okf, ledger-maintenance]
timestamp: 2026-07-03T15:00:00+09:00
---

# Read Order

1. Read [`AGENTS.md`](../../AGENTS.md).
2. Read [`okf/index.md`](../index.md).
3. Read [`state/llm-news-ledger-template.md`](../../state/llm-news-ledger-template.md).
4. Read the current [`state/llm-news-seen.jsonl`](../../state/llm-news-seen.jsonl).

# Edit Rules

- Preserve JSONL validity: one complete JSON object per non-empty line.
- Preserve all existing records unless the user explicitly requests cleanup.
- Do not change field names or localize JSON keys.
- Do not convert JSONL into Markdown or fenced code blocks.
- Add one `topic` record per canonical story.
- Merge duplicate evidence into `aliases`, `known_facts`, `reinclude_only_if`, `sources`, or `notes`.
- Keep `archive/` as import evidence only.
- Keep records short enough for scheduled tasks to read every run.

# When Adding A Topic

Use the existing schema from `state/llm-news-ledger-template.md`.

Minimum checks:

- `topic_key` is stable and unique.
- `canonical_title` is short.
- `aliases` include likely duplicate names.
- `known_facts` only includes already covered facts.
- `reinclude_only_if` lists concrete future hard-delta conditions.
- `notes` records import source or uncertainty.
- `confidence` reflects source quality, not enthusiasm.

# When Updating A Known Topic

Update only the fields needed for the new hard delta:

- `last_seen_jst`
- `last_report`
- `coverage_status`
- `known_facts`
- `reinclude_only_if`
- `sources`
- `notes`

Do not create a second topic for the same story.

# Validation

Before committing:

- Parse `state/llm-news-seen.jsonl` as JSONL.
- Confirm exactly one `meta` record.
- Confirm all `topic_key` values are unique.
- Run `git diff --check`.
- If OKF files changed, confirm every non-reserved `.md` file under `okf/` has YAML frontmatter with `type`.
