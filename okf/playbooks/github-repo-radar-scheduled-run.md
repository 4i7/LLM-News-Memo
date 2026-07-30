---
type: Playbook
title: GitHub Repo Radar Scheduled Run
description: Plugin-backed execution and writeback contract for the daily Windows 11 repository discovery task.
okf_version: "0.2"
resource: https://github.com/4i7/LLM-News-Memo
tags: [github, repo-radar, windows-11, scheduled-task, plugin]
timestamp: 2026-07-30T12:21:00+09:00
---

# Purpose

Run a daily GitHub Repository Radar that finds repositories with immediate, concrete value on an ordinary Windows 11 PC.

The priority is practical leverage rather than novelty: avoided purchases, subscriptions, paid plugins, cloud services, repetitive work, migration effort, or troubleshooting time.

# Mandatory GitHub plugin usage

For every run, use the connected GitHub plugin for repository discovery, repository inspection, release and issue checks, deduplication reads, and curated-report writeback involving `4i7/LLM-News-Memo`.

Do not claim that GitHub, the report corpus, or starred repositories were inaccessible until a relevant GitHub plugin action has actually been attempted.

Before discovery, fetch with the GitHub plugin:

1. `okf/index.md`
2. `okf/concepts/github-repo-radar-reports.md`
3. `reports/github-repo-radar/2026-07-retrospective.md`
4. `reports/github-repo-radar/2026-07-late-retrospective.md`

Use these reports to build the deduplication set. They are curated report memory and are not part of the canonical LLM News topic ledger.

# Candidate requirements

A high-priority candidate should:

- work directly on Windows 11 through a normal installer, portable executable, PowerShell, Python, Node.js, Rust, .NET, browser extension, or a common free application;
- require no specialized external hardware;
- avoid mandatory enterprise infrastructure, major paid cloud services, or recurring API fees;
- be testable on a normal desktop within minutes or hours;
- provide a finished user workflow rather than only a library, architecture demo, template, or framework;
- have credible current Windows support, usable release artifacts, and documented or understandable rollback;
- remain useful even if its application category were replaced with another category.

Penalize WSL, Docker, local servers, databases, or model downloads when a simpler native route exists.

# Value signals

Prefer repositories that:

- replace or approximate a paid application, plugin, subscription, or service;
- convert an awkward free application into a polished practical substitute;
- supply curated configuration, presets, shortcuts, plugins, frontends, wrappers, compatibility fixes, or shell integration;
- restore removed Windows or application behavior;
- provide local-first, offline, private, portable, or reversible alternatives;
- materially improve document handling, OCR, backup, recovery, search, clipboard use, window management, automation, diagnostics, networking, media, development, or general productivity.

`Diolinux/PhotoGIMP` is a structural value example only. Do not treat image editing as a user preference or recurring search anchor.

# Category balance

Rotate across:

- Windows quality-of-life and Explorer integration;
- application transformation and enhancement;
- direct money-saving replacements;
- documents, PDF, OCR, search, and information handling;
- media and creative workflows;
- development tools with immediate operational benefit;
- defensive diagnostics and read-only reverse engineering;
- useful categories not listed above.

At least half of selected candidates should normally be non-LLM desktop, document, system, productivity, media, or Windows utilities. Select no more than two LLM, MCP, Claude, Codex, agent, or model-routing candidates unless clearly superior.

# Search and evidence procedure

1. Read prior reports and construct a deduplication set of selected, rejected, renamed, forked, and already explained repositories and use cases.
2. Search multiple popularity ranges, including small, medium, established, and unbounded repositories.
3. Inspect both recent updates and mature maintained projects.
4. Use the GitHub plugin to inspect README files, release artifacts, release recency, actual repository files, issue activity, supported Windows versions, installation methods, and rollback implications.
5. Reject README-only shells, generated demonstrations, unverified binary mirrors, abandoned forks with doubtful compatibility, and projects without a credible end-user path.
6. Separate observed repository facts from inferred user value.
7. Do not invent exact currency savings.

# Scoring

Score out of 100 using:

- Immediate utility: 25
- Direct or near-direct monetary saving: 20
- Setup-to-benefit ratio: 15
- Windows 11 practicality: 15
- Friction reduction or transformation value: 10
- Reliability, reversibility, and compatibility: 10
- Non-obviousness: 5

Apply the task’s established bonuses for credible paid replacement, sub-15-minute visible benefit, improving free software, and curated workflows. Apply penalties for specialized hardware, paid infrastructure, complex server stacks, framework-only value, indirect Windows support, destructive installation, and topical overfitting.

# Safety boundary

Do not provide operational guidance for unauthorized access, credential abuse, exploit deployment, service abuse, billing or paywall bypass, DRM bypass, anti-cheat evasion, account automation abuse, online-game cheating, malware deployment, token theft, piracy, or Terms-of-Service evasion.

Prefer defensive, local, reversible, and legitimate tools.

# Output

Write the report in Japanese with the heading:

`# GitHub Repo Radar — YYYY-MM-DD`

Include:

1. Summary
2. Highest-value discoveries
3. Useful but secondary discoveries
4. Interesting but not immediately useful
5. Money-saving assessment
6. Exclusion log
7. Deduplication log
8. Search coverage
9. Failure modes
10. GitHub plugin status

For each selected repository include repository name, URL, score, category, recognition, Windows compatibility, hardware requirement, dependency, setup burden, time to first benefit, immediate value, avoided expense, baseline comparison, evidence, risks, rollback, and recommended action.

Prefer three to seven strong candidates. Returning zero is acceptable. Do not pad.

# Curated-report writeback

Do not write every daily report into the repository.

After a meaningful source window—normally seven to fourteen new runs—or after a major compatibility, license, maintenance, or safety change:

1. use the GitHub plugin to create a new compact retrospective under `reports/github-repo-radar/`;
2. update `okf/index.md` with a link;
3. record the change in `okf/log.md`;
4. preserve the boundary from canonical LLM News state;
5. report the actual commit SHA returned by the GitHub plugin.

If GitHub reads or writes fail, report the exact failed action. Do not claim plugin-backed deduplication or writeback succeeded.
