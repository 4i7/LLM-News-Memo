---
type: Prompt
title: Web ChatGPT Schedule Update Prompt
description: Copy-paste prompt for updating LLM News daytime and nighttime scheduled task instructions.
resource: https://github.com/4i7/LLM-News-Memo/tree/main/okf/prompts/web-chatgpt-schedule-update.md
tags: [chatgpt, schedules, prompt, okf, llm-news]
timestamp: 2026-07-03T15:00:00+09:00
---

# Prompt

Copy this into Web ChatGPT after opening the account that owns the scheduled tasks.

```text
目的:
LLM News 昼 と LLM News 夜 のスケジュール実行時命令を更新してください。今すぐニュース本文を実行するのではなく、今後の scheduled run が 4i7/LLM-News-Memo の Open Knowledge Format bundle と JSONL ledger を読んで重複管理・writeback できるように、両方のスケジュール命令だけを編集してください。

対象スケジュール:
- LLM News 昼 / LLM Midday Brief
- LLM News 夜 / LLM Night Lite

GitHub connector で読む正規 repo:
- 4i7/LLM-News-Memo

最初に必ず読むファイル:
1. okf/index.md
2. okf/concepts/llm-news-shared-ledger.md
3. okf/playbooks/scheduled-run-writeback.md
4. state/llm-news-ledger-template.md
5. state/llm-news-ledger.md
6. state/llm-news-seen.jsonl

スケジュール命令に追加・反映する内容:
- Open Knowledge Format bundle は編集作法と運用ルールの説明であり、canonical machine state は state/llm-news-seen.jsonl のまま。
- state/llm-news-seen.jsonl は JSONL として扱う。空でない各行を1つの JSON object として parse する。
- JSON key は変更しない。日本語化しない。JSONL を Markdown table や fenced code block に変換しない。
- archive/ は import evidence であり、現在の重複判定 state として使わない。
- candidate news は topic_key, canonical_title, aliases, organizations, products, sources を使って既存 topic と照合する。
- 各 candidate を NEW / FOLLOW_UP / DUPLICATE / ONGOING_NO_NEWS / UNCONFIRMED_SIGNAL に分類する。
- main report に入れてよいのは NEW、強い FOLLOW_UP、高シグナルで明示ラベル付きの UNCONFIRMED_SIGNAL のみ。
- 既存 topic を main report に入れる場合は必ず「続報:」として扱い、「前回からの差分: ...」を具体的に書く。具体的に書けない場合は DUPLICATE または ONGOING_NO_NEWS。
- publication 前に state/llm-news-seen.jsonl を再取得し、最新 SHA に対して selected topics を merge して GitHub に writeback する。
- state/llm-news-ledger.md も人間向け summary として更新する。
- writeback 時は既存 record を保持し、必要な topic record だけ追加・更新する。削除や大規模整理はユーザー明示依頼がある場合だけ。
- GitHub read 失敗時は GitHub ledger 状態 に LEDGER_READ_FAILED と書き、ledger-based dedupe が成功したふりをしない。
- JSONL parse 失敗時は LEDGER_PARSE_FAILED と書く。
- writeback 失敗時は LEDGER_WRITE_FAILED と書き、ニュース報告は出してよいが ledger 未更新を明記する。
- 4i7/knowledge-distiller はこの workflow で使わない。
- 他 repo への fallback write はしない。

両スケジュールの命令を更新したら、最後に以下だけ報告してください:
1. 更新したスケジュール名
2. 命令内に参照として入れた GitHub repo とファイル一覧
3. canonical state が state/llm-news-seen.jsonl のままであること
4. writeback failure を成功扱いしないルールを入れたこと
```

# Notes

This prompt intentionally asks Web ChatGPT to edit schedule instructions only. It does not ask for an immediate news run.
