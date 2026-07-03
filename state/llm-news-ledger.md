# LLM News Shared Ledger

Shared duplicate-control ledger for the scheduled `LLM Midday Brief` and `LLM Night Lite` tasks.

The canonical machine-readable state is `state/llm-news-seen.jsonl`. The update contract and record schema are in `state/llm-news-ledger-template.md`.

## Current status

| Field | Value |
|---|---|
| Schema version | 1 |
| Repository | `4i7/LLM-News-Memo` |
| Seen JSONL | `state/llm-news-seen.jsonl` |
| Topic records | 37 |
| Imported history export | `archive/llm-news-history-export-2026-07-03.jsonl` |
| Imported canonical archive | `archive/llm-news-canonical-2026-06-27-to-2026-07-03.jsonl` |
| Last manual import | 2026-07-03T14:19:10+09:00 |

## Important limitation

The imported records are reconstructed from visible ChatGPT conversation history and prior brief outputs. They are for duplicate prevention and treatment control, not fresh web verification. Re-verify important claims from primary sources or reputable reporting before reusing them in a new public-facing brief.

## Core rule

A topic already present in `llm-news-seen.jsonl` must not be reintroduced as a main news item unless there is a concrete hard delta.

A valid repeat item must be labeled `続報:` and must include a short sentence beginning with:

> `前回からの差分:`

If that sentence cannot be written concretely, the item is `DUPLICATE` or `ONGOING_NO_NEWS`, not a main item.

## Covered topics snapshot

| Topic key | Canonical title | Coverage |
|---|---|---|
| `openai/gpt-5.6-sol-terra-luna/limited-preview/2026-06-27` | GPT-5.6 Sol/Terra/Luna limited preview | covered |
| `anthropic/mythos-5/partial-restore/2026-06-27` | Anthropic Mythos 5 partial or limited restore | covered_watch |
| `anthropic/fable-5/global-restore/2026-07-01` | Anthropic Claude Fable 5 global restore | covered_watch |
| `github/copilot/kimi-k2.7-code-browser-tools-credit-limits/2026-07-02` | GitHub Copilot Kimi K2.7 Code, browser tools, and AI credit limits | covered |
| `huggingface/metacognition-benchmark/2026-07-02` | Hugging Face metacognition benchmark | covered |
| `dukaanbench/benchmark/published/2026-06-27` | DukaanBench newly published | covered |
| `eu/austria-anthropic-attraction-policy/2026-06-28` | Austria urging EU to attract Anthropic | covered |
| `glm-5.2/cyber-capability-report/2026-06-28` | GLM-5.2 cyber-capability report | covered |
| `history/anthropic-fable-5-api-spec/covered-through-2026-07-03` | Claude Fable 5 API仕様 | covered |
| `history/anthropic-fable-mythos-api-tools/covered-through-2026-07-03` | Claude Fable/Mythos API rate limit・tooling 更新 | covered |
| `history/anthropic-fable-mythos-safeguards/covered-through-2026-07-03` | Fable/Mythos safeguards 更新 | covered |
| `history/chatgpt-dictation-improvements/covered-through-2026-07-03` | ChatGPT dictation 改善 | covered |
| `history/ftc-ai-bias-safeguards/covered-through-2026-07-03` | FTC AI bias safeguards 方針案 | covered |
| `history/glm-5-2-official-release/covered-through-2026-07-03` | GLM-5.2 一次情報整理 | covered |
| `history/google-meta-gemini-capacity/covered-through-2026-07-03` | Google/Meta Gemini capacity 制限報道 継続 | covered |
| `history/hf-dev-tooling-roundup/covered-through-2026-07-03` | Hugging Face 最近の開発系記事 | covered |
| `history/hf-every-eval-ever/covered-through-2026-07-03` | Hugging Face Every Eval Ever 統合 | covered |
| `history/microsoft-frontier-company/covered-through-2026-07-03` | Microsoft Frontier Company | covered |
| `history/open-weight-access-reaction/covered-through-2026-07-03` | Open-weight 側への関心継続 | covered |
| `history/openai-gpt-5-6-cerebras/covered-through-2026-07-03` | GPT-5.6 Sol on Cerebras | covered |
| `history/openai-gpt-5-6-safety-card/covered-through-2026-07-03` | GPT-5.6 safety card | covered |
| `history/openai-public-stake-proposal/covered-through-2026-07-03` | OpenAI 5% public stake 案 | covered |
| `history/us-frontier-model-review/covered-through-2026-07-03` | 米政府承認付き frontier model リリース | covered |
| `archive/openai-gpt-4.5-sunset-in-chatgpt/covered-through-2026-07-03` | OpenAI GPT-4.5 sunset in ChatGPT | covered_watch |
| `archive/openai-agents-transforming-work-codex-internal-usage-report/covered-through-2026-07-03` | OpenAI agents transforming work / Codex internal usage report | covered_watch |
| `archive/openai-jalape-o-custom-inference-chip-with-broadcom/covered-through-2026-07-03` | OpenAI Jalapeño custom inference chip with Broadcom | covered_watch |
| `archive/qualcomm-ai-datacenter-strategy-and-hexagon-npu-inference/covered-through-2026-07-03` | Qualcomm AI datacenter strategy and Hexagon NPU inference | covered |
| `archive/anthropic-claude-tag/covered-through-2026-07-03` | Anthropic Claude Tag | covered_watch |
| `archive/anthropic-claude-sonnet-5-release-and-pricing/covered-through-2026-07-03` | Anthropic Claude Sonnet 5 release and pricing | covered_watch |
| `archive/claude-sonnet-5-in-github-copilot/covered-through-2026-07-03` | Claude Sonnet 5 in GitHub Copilot | covered_watch |
| `archive/github-desktop-3.6-worktrees-and-copilot-assisted-authoring/covered-through-2026-07-03` | GitHub Desktop 3.6 Worktrees and Copilot-assisted authoring | covered_watch |
| `archive/jetbrains-ai-assistant-first-class-github-copilot-agent-integration/covered-through-2026-07-03` | JetBrains AI Assistant first-class GitHub Copilot Agent integration | covered_watch |
| `archive/hugging-face-jobs-with-vllm-openai-compatible-endpoint/covered-through-2026-07-03` | Hugging Face Jobs with vLLM OpenAI-compatible endpoint | covered_watch |
| `archive/anthropic-claude-science/covered-through-2026-07-03` | Anthropic Claude Science | covered_watch |
| `archive/nvidia-ai-factory-ai-compute-at-scale-capital-partners/covered-through-2026-07-03` | NVIDIA AI factory / AI compute at scale capital partners | covered_watch |
| `archive/venice-ai-series-a-and-privacy-first-multi-model-gateway-positioning/covered-through-2026-07-03` | Venice AI Series A and privacy-first multi-model gateway positioning | covered_watch |
| `archive/hugging-face-gemma-4-cerebras-real-time-voice-ai/covered-through-2026-07-03` | Hugging Face Gemma 4 + Cerebras real-time voice AI | covered_watch |

## Required update behavior for scheduled tasks

1. Fetch `state/llm-news-ledger-template.md`, `state/llm-news-ledger.md`, and `state/llm-news-seen.jsonl` from `4i7/LLM-News-Memo`.
2. Parse every non-empty line in `llm-news-seen.jsonl` as exactly one JSON object.
3. Build the duplicate ledger from `topic_key`, `canonical_title`, `aliases`, `organizations`, `products`, and `sources`.
4. Classify every candidate as `NEW`, `FOLLOW_UP`, `DUPLICATE`, `ONGOING_NO_NEWS`, or `UNCONFIRMED_SIGNAL`.
5. Include only `NEW`, strong `FOLLOW_UP`, and high-signal labeled `UNCONFIRMED_SIGNAL` in the main report.
6. Before emitting the final report, update `llm-news-seen.jsonl` and this MD file based on selected topics and duplicate decisions.
7. If GitHub ledger read/write fails, explicitly state the failure in `GitHub ledger 状態` and do not pretend historical duplicate checking succeeded.
