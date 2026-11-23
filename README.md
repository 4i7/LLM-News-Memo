# LLM News Memo

Dedicated shared ledger repository for scheduled LLM News reports, with a small separate area for explicitly requested curated reports.

The canonical ledger remains intentionally narrow in scope:

- `LLM Midday Brief`
- `LLM Night Lite`
- duplicate control
- topic treatment rules
- machine-readable seen-topic state

Do not put unrelated project knowledge, codebase notes, Hermes skills, LLM-Wiki material, or general development notes into the canonical LLM News state.

## Web knowledge browser

**HTML閲覧サイト:** [LLM News Memo Knowledge Browser](https://4i7.github.io/LLM-News-Memo/)

Denno-Watchと同様、GitHub Pages上で検索・絞り込み・詳細閲覧を行えます。ブラウザから直接確認できる内容は以下の4種です。

- **トピック** — `topics/**/*.json` の既報事実・運用上の扱い・続報の掲載条件・出典。
- **実行ログ** — `runs/**/*.jsonl` の行単位のNEW / FOLLOW_UP / DUPLICATE / ONGOING_NO_NEWS / UNCONFIRMED_SIGNAL分類。既存トピックへのリンクも表示。
- **レポート** — `reports/**/*.md` の本文をHTMLとして表示。通常のニュース重複排除には使用しません。
- **ガイド** — `okf/**/*.md` と人間向け台帳要約を表示。

`main` の対象ファイルへ変更が入るたび、[`knowledge-browser-pages.yml`](.github/workflows/knowledge-browser-pages.yml) がカタログを再構築しGitHub Pagesにデプロイします。新規ファイルも再帰探索で自動収録されるため、手作業で一覧を書き足す必要はありません。サイトは **読み取り専用** で、正本のJSON/JSONL/Markdownは変更しません。

- 初回公開時はGitHub Actionsのデプロイ完了後に上記URLが有効になります。
- カタログには現在のsharded topic / runと公開レポート・ガイドだけを取り込みます。過去の`archive/`および`state/llm-news-seen.jsonl`は閲覧カタログに含めず、既存のdedupe処理にも介入しません。
- 手元で生成するには `python -m pip install -r tools/requirements-site.txt` の後に `python tools/build_site_catalog.py --output site/catalog.json` を実行します。生成物`site/catalog.json`は公開時に作られるビルド成果物です。

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