# OKF Update Log

## 2026-07-03

* **Creation**: Added OKF bundle for agent editing rules, scheduled-run writeback behavior, and Web ChatGPT schedule update prompt.
* **Storage protocol v2**: Switched scheduled writeback away from monolithic `state/llm-news-seen.jsonl` rewrites. Current duplicate-control state is sharded into `topics/**/*.json` plus `runs/**/*.jsonl`, with `state/llm-news-seen.jsonl` retained as legacy bootstrap/import evidence only.
* **Recovery**: Added `anthropic/claude-science/in-house-drug-development/2026-07-03` as a topic file and recorded a run event after a failed `LLM Night Lite` monolithic JSONL writeback.
