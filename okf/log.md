# OKF Update Log

## 2026-07-20

* **Curated reports boundary**: Added `reports/` as an explicitly requested human-readable knowledge layer that remains separate from canonical LLM News duplicate-control state.
* **GitHub Repo Radar retrospective**: Added `reports/github-repo-radar/2026-07-retrospective.md`, consolidating durable Windows 11 utility recommendations, risk tiers, and review triggers from prior Radar runs.
* **OKF contract**: Added `okf/concepts/github-repo-radar-reports.md` to define evidence, update, safety, and storage rules for Repo Radar retrospectives.
* **Scheduled-task isolation**: Clarified that LLM News schedules must not read curated reports as seen-topic state or modify them during routine writeback.

## 2026-07-03

* **Creation**: Added OKF bundle for agent editing rules, scheduled-run writeback behavior, and Web ChatGPT schedule update prompt.
* **Storage protocol v2**: Switched scheduled writeback away from monolithic `state/llm-news-seen.jsonl` rewrites. Current duplicate-control state is sharded into `topics/**/*.json` plus `runs/**/*.jsonl`, with `state/llm-news-seen.jsonl` retained as legacy bootstrap/import evidence only.
* **Recovery**: Added `anthropic/claude-science/in-house-drug-development/2026-07-03` as a topic file and recorded a run event after a failed `LLM Night Lite` monolithic JSONL writeback.