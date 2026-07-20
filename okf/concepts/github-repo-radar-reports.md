---
type: Concept
title: GitHub Repo Radar Reports
description: Storage and editing contract for curated GitHub repository retrospectives kept outside the canonical LLM News ledger.
okf_version: "0.2"
resource: https://github.com/4i7/LLM-News-Memo/tree/main/reports/github-repo-radar
tags: [github, repo-radar, reports, windows-11, okf]
timestamp: 2026-07-20T18:00:00+09:00
---

# Purpose

`reports/github-repo-radar/` stores curated, human-readable retrospectives derived from GitHub Repo Radar runs.

These reports preserve durable conclusions such as:

- which repositories remain practically useful;
- what paid product, subscription, service, or repeated manual work they may replace;
- what setup and rollback burden they carry;
- which candidates should be installed, tested, watched, or rejected;
- what user feedback changed the ranking criteria.

# Boundary from the LLM News ledger

GitHub Repo Radar reports are not LLM News duplicate-control state.

They must not be written into:

- `topics/**/*.json`;
- `runs/**/*.jsonl`;
- `state/llm-news-seen.jsonl`;
- `state/llm-news-ledger.md`.

The LLM News schedules must not read these reports as seen-topic state or attempt to update them during normal news writeback.

# Required report properties

A durable retrospective should include:

1. scope and source window;
2. explicit selection criteria;
3. a small high-value set rather than every discovered repository;
4. immediate benefit and avoided expense or time;
5. Windows 11 and special-hardware fit;
6. setup, risk, and rollback notes;
7. rejected or watch-only patterns;
8. a review date or review trigger;
9. a statement that the report is separate from canonical news state.

# Evidence discipline

- Distinguish facts observed in repository documentation from inferred user value.
- Do not invent exact monetary savings without evidence.
- Do not claim current compatibility when it has not been checked recently.
- Prefer repository README, release assets, source files, issue activity, and documented rollback behavior.
- Treat portable builds as lower-risk evaluation routes, not proof of software safety.

# User-fit interpretation

`Diolinux/PhotoGIMP` is a structural reference only. It demonstrates immediate, visible, low-cost transformation of an existing free application. It does not imply a preference for image editing.

Apply the same value pattern across Windows utilities, file handling, documents, media, diagnostics, backup, networking, local privacy, development, and other legitimate desktop workflows.

# Update model

- Add new dated reports rather than silently rewriting old reports when the source window changes materially.
- A retrospective may be updated in place for corrections, broken links, status changes, or a clearer ranking, provided the commit message states the reason.
- Record changes to this contract in `okf/log.md`.
- Keep the report corpus compact; consolidation is preferred over daily archival of full Radar output.