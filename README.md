# LLM News Memo

Dedicated shared ledger repository for scheduled LLM News reports.

This repository is intentionally narrow in scope:

- `LLM Midday Brief`
- `LLM Night Lite`
- duplicate control
- topic treatment rules
- machine-readable seen-topic state

Do not put unrelated project knowledge, codebase notes, Hermes skills, LLM-Wiki material, or general development notes here.

## Files

| Path | Role |
|---|---|
| `state/llm-news-seen.jsonl` | Canonical machine-readable duplicate ledger. One JSON object per line. |
| `state/llm-news-ledger.md` | Human-readable summary and treatment policy. |
| `state/llm-news-ledger-template.md` | Schema and update contract for scheduled tasks. |
| `archive/` | User-provided import snapshots for audit/re-import only; not the canonical scheduled-task state. |

## Operating principle

This repository is not a full news archive. It is a deduplication and topic-treatment control layer. Raw files under `archive/` are preserved only as import evidence.

A story already present in `state/llm-news-seen.jsonl` must not be reintroduced as a main report item unless there is a concrete hard delta.
