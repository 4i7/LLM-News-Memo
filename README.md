# LLM News Memo

Dedicated shared ledger repository for scheduled LLM News reports, with a small separate area for explicitly requested curated reports.

The canonical ledger remains intentionally narrow in scope:

- `LLM Midday Brief`
- `LLM Night Lite`
- duplicate control
- topic treatment rules
- machine-readable seen-topic state

Do not put unrelated project knowledge, codebase notes, Hermes skills, LLM-Wiki material, or general development notes into the canonical LLM News state.

## Files

| Path | Role |
|---|---|
| `state/llm-news-seen.jsonl` | Legacy machine-readable import/bootstrap ledger. |
| `state/llm-news-ledger.md` | Human-readable LLM News summary and treatment policy. |
| `state/llm-news-ledger-template.md` | Schema and update contract for scheduled tasks. |
| `topics/` | Current sharded canonical story records. |
| `runs/` | Current per-run event logs. |
| `archive/` | User-provided import snapshots for audit/re-import only; not canonical scheduled-task state. |
| `reports/` | Explicitly requested curated reports kept separate from canonical LLM News duplicate state. |
| `okf/` | Open Knowledge Format bundle explaining agent editing rules, scheduled-run writeback, and report boundaries. |
| `AGENTS.md` | Short editing rules for AI agents touching this repo. |

## Operating principle

This repository is not a full news archive. Its primary function is deduplication and topic-treatment control for scheduled LLM News reports. Raw files under `archive/` are preserved only as import evidence.

A story already present in the canonical topic state must not be reintroduced as a main report item unless there is a concrete hard delta.

Curated material under `reports/` is a separate human-readable knowledge layer. Scheduled LLM News tasks must not use it as duplicate-control state or write to it during normal ledger updates.

Agents should read `okf/index.md` before editing. OKF documents explain the workflow; they do not replace canonical JSON or JSONL state.