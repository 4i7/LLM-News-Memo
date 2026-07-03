# LLM News Ledger Template and Update Contract

This document defines the stable shared-memory format for `LLM Midday Brief` and `LLM Night Lite`.

## Current storage model

The ledger now uses sharded small files to avoid connector output limits and unsafe full-file rewrites.

| Path | Role |
|---|---|
| `topics/**/*.json` | Canonical per-topic records. One small JSON file per canonical story. |
| `runs/**/*.jsonl` | Per-run event logs. Small append-style files created per scheduled run. |
| `state/llm-news-ledger-manifest.json` | Storage-mode manifest and path contract. |
| `state/llm-news-ledger.md` | Human-readable summary and policy file. |
| `state/llm-news-seen.jsonl` | Legacy bootstrap/import seed. Do not full-fetch or rewrite from scheduled runs. |
| `okf/` | Open Knowledge Format companion bundle for agent editing rules and scheduled-run behavior. |

## Non-negotiable rules

1. Preserve JSON and JSONL validity.
2. Preserve all existing records unless the user explicitly requests cleanup.
3. Do not change field names.
4. Do not localize JSON keys.
5. Do not convert JSON/JSONL into Markdown tables or fenced code blocks.
6. Do not claim ledger-based duplicate checking succeeded when required files could not be fetched or parsed.
7. When reusing a known topic, require a concrete `前回からの差分:` sentence.
8. If no hard delta exists, classify the topic as `DUPLICATE` or `ONGOING_NO_NEWS`.
9. Do not rewrite `state/llm-news-seen.jsonl` from scheduled runs.
10. If writeback fails, still produce the news report but clearly state `LEDGER_WRITE_FAILED`.

## Topic record schema

Each topic file is a single JSON object.

```json
{
  "record_type": "topic",
  "schema_version": 2,
  "topic_key": "organization/product/event-type/YYYY-MM-DD",
  "canonical_title": "Short stable title",
  "aliases": ["alias 1", "alias 2"],
  "organizations": ["Organization"],
  "products": ["Product"],
  "event_type": "model_release|availability_restore|pricing|benchmark|tooling_model_integration|policy_corporate|safety_security_report|science_life_sciences_follow_up|outage|rumor|other",
  "first_seen_jst": "YYYY-MM-DDTHH:mm:ss+09:00",
  "last_seen_jst": "YYYY-MM-DDTHH:mm:ss+09:00",
  "last_report": "LLM Midday Brief|LLM Night Lite",
  "coverage_status": "covered|covered_watch|watch_only|duplicate|superseded",
  "treatment": "How future runs should treat this story.",
  "known_facts": ["Fact already covered."],
  "reinclude_only_if": ["Hard-delta condition."],
  "sources": ["https://..."],
  "seed_basis": "scheduled_run|available_task_history_summary|manual_recovery_from_failed_scheduled_run|manual_user_instruction",
  "confidence": 0.0,
  "notes": ""
}
```

## Run event schema

Each run event file is JSONL. Each non-empty line is one JSON object.

```json
{
  "record_type": "run_event",
  "schema_version": 2,
  "run_name": "LLM Midday Brief|LLM Night Lite",
  "run_time_jst": "YYYY-MM-DDTHH:mm:ss+09:00",
  "classification": "NEW|FOLLOW_UP|DUPLICATE|ONGOING_NO_NEWS|UNCONFIRMED_SIGNAL",
  "topic_key": "organization/product/event-type/YYYY-MM-DD",
  "topic_record_path": "topics/...json",
  "notes": ""
}
```

## Topic-key rules

`topic_key` must be stable, lowercase where practical, and specific enough to avoid merging unrelated stories.

Recommended form:

```text
organization/product-or-model/event-type/YYYY-MM-DD
```

## Candidate classification rules

| Classification | Meaning | Main report eligibility |
|---|---|---|
| `NEW` | No matching topic or alias exists in sharded state. | Eligible |
| `FOLLOW_UP` | Matching known topic exists, but there is a hard delta. | Eligible only with `続報:` and `前回からの差分:` |
| `DUPLICATE` | Same topic, no hard delta. | Not eligible |
| `ONGOING_NO_NEWS` | Still discussed, but no new factual development. | Not eligible except compact watch log |
| `UNCONFIRMED_SIGNAL` | Rumor/community signal that may matter. | Eligible only if clearly labeled and high-signal |

## Hard delta definition

A meaningful delta includes at least one of:

- New official confirmation, blog post, release note, model card, pricing page, benchmark page, safety report, license, API availability, weights availability, deprecation notice, outage resolution, restriction, or policy change.
- New credible reporting that adds previously unknown factual information.
- New reproducible technical finding from a credible developer/researcher.
- Major adoption or breakage signal that changes practical interpretation.
- Significant correction to an earlier understanding.

Not a hard delta by itself:

- Another summary article repeating the same facts.
- Users still arguing on X, Reddit, HN, or Discord.
- Generic benchmark screenshots without methodology or reproducibility.
- Vague rumors, engagement bait, or memes.
- Search results surfacing the same story again because it is popular.

## Scheduled-task writeback protocol

Before emitting the final scheduled report:

1. Search for matching topic files under `topics/**/*.json`.
2. Fetch and update only the relevant topic file for a `FOLLOW_UP`.
3. Create one topic file for a `NEW` story.
4. Create one small run event JSONL file under `runs/YYYY-MM-DD/`.
5. Optionally update `state/llm-news-ledger.md` as a compact human summary.
6. Do not full-fetch, append to, or rewrite `state/llm-news-seen.jsonl`.
7. If a SHA conflict occurs on a topic file, re-fetch, merge again, and retry once.
8. If writeback still fails, state `LEDGER_WRITE_FAILED` in the final report.

## Maintenance principle

This ledger is not a news archive. It is a deduplication and treatment-control layer.

Keep records short, stable, sharded, and operational.
