# LLM News Shared Ledger

Shared duplicate-control ledger for the scheduled `LLM Midday Brief` and `LLM Night Lite` tasks.

## Current status

| Field | Value |
|---|---|
| Storage schema | 2 |
| Repository | `4i7/LLM-News-Memo` |
| Storage mode | sharded topic records |
| Topic records | `topics/**/*.json` |
| Run events | `runs/**/*.jsonl` |
| Manifest | `state/llm-news-ledger-manifest.json` |
| Legacy bootstrap seed | `state/llm-news-seen.jsonl` |
| Template | `state/llm-news-ledger-template.md` |
| Last protocol update | 2026-07-03T15:20:00+09:00 |

## Why the storage model changed

The previous protocol required scheduled tasks to fetch, reconstruct, and rewrite `state/llm-news-seen.jsonl`. That is unsafe once the JSONL grows large enough to hit connector output limits.

The current protocol avoids that failure mode:

- new topics create one small `topics/**/*.json` file;
- follow-ups update only the matching topic file;
- each scheduled run creates one small `runs/**/*.jsonl` event file;
- `state/llm-news-seen.jsonl` remains as legacy bootstrap/import evidence, not the scheduled writeback target.

## Core rule

A topic already present in the sharded ledger must not be reintroduced as a main news item unless there is a concrete hard delta.

A valid repeat item must be labeled `続報:` and must include a short sentence beginning with:

> `前回からの差分:`

If that sentence cannot be written concretely, the item is `DUPLICATE` or `ONGOING_NO_NEWS`, not a main item.

## Recently recovered writeback

| Topic key | Canonical title | Last report | Treatment |
|---|---|---|---|
| `anthropic/claude-science/in-house-drug-development/2026-07-03` | Anthropic Claude Science in-house drug development plan | LLM Night Lite | Recovered after failed monolithic JSONL writeback. Repeat only for official details, target diseases, wet lab/partner/clinical/manufacturing specifics, or material Claude Science product changes. |

## Required scheduled-task behavior

Each scheduled LLM News task must do the following:

1. Read `okf/index.md`, `okf/concepts/llm-news-shared-ledger.md`, `okf/playbooks/scheduled-run-writeback.md`, `state/llm-news-ledger-manifest.json`, `state/llm-news-ledger-template.md`, and this file.
2. Search candidate topics against `topics/**/*.json`, source URLs, aliases, and canonical titles.
3. Fetch only matching small topic files.
4. Use bounded search/line fetch against `state/llm-news-seen.jsonl` only if needed for legacy imported topics.
5. Do not full-fetch or rewrite `state/llm-news-seen.jsonl`.
6. Classify every candidate as `NEW`, `FOLLOW_UP`, `DUPLICATE`, `ONGOING_NO_NEWS`, or `UNCONFIRMED_SIGNAL`.
7. Include only `NEW`, strong `FOLLOW_UP`, and high-signal labeled `UNCONFIRMED_SIGNAL` in the main report.
8. Before emitting the final report, update/create relevant topic files and create a run event file.
9. If GitHub ledger read/write fails, explicitly state the failure in `GitHub ledger 状態` and do not pretend that historical duplicate checking succeeded.

## File ownership

- `topics/**/*.json` is the canonical per-topic state.
- `runs/**/*.jsonl` is the per-run event log.
- `state/llm-news-ledger.md` is the human-readable summary.
- `state/llm-news-seen.jsonl` is legacy bootstrap/import evidence.
- `archive/` is import evidence only.
- Do not use `4i7/knowledge-distiller` for this workflow.
