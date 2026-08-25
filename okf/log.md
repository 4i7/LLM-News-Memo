# OKF Update Log

## 2026-08-25

* **Late-August Repo Radar retrospective**: Added `reports/github-repo-radar/2026-08-late-retrospective.md`, consolidating the 2026-08-19 through 2026-08-25 source window into durable Tier A, conditional, watch-only, safety, and compact-toolkit conclusions.
* **Durable additions**: Preserved high-value conclusions for mise, Zotero, RapidCRC Unicode, Pot, Gaphor, and Nushell, with conditional retention for Notepad++, darktable, FreeCAD, Qalculate, TagSpaces, TortoiseGit, Sigil, and Far Manager.
* **Index update**: Added direct OKF navigation to the new late-August retrospective while keeping Repo Radar reports separate from canonical LLM News duplicate-control state.

## 2026-08-18

* **Mid-August Repo Radar retrospective**: Added `reports/github-repo-radar/2026-08-mid-retrospective.md`, consolidating the 2026-08-12 through 2026-08-18 source window into durable Tier A, conditional, watch-only, safety, and compact-toolkit conclusions.
* **Durable additions**: Preserved high-value conclusions for Sniffnet, DriverStoreExplorer, SoundSwitch, Syncthing Tray, RSS Guard, Ferdium, and DBeaver, with conditional retention for ScreenToGif, scrcpy, TotalRegistry, TrafficMonitor, Caesium, Audacity, gsudo, and zoxide.
* **Index update**: Added direct OKF navigation to the new mid-August retrospective while keeping Repo Radar reports separate from canonical LLM News duplicate-control state.

## 2026-08-11

* **Early-August Repo Radar retrospective**: Added `reports/github-repo-radar/2026-08-early-retrospective.md`, consolidating the post-July source window through 2026-08-11 into durable Tier A, conditional, watch-only, safety, and compact-toolkit conclusions.
* **Durable additions**: Preserved high-value conclusions for DevToys, CrystalDiskInfo, ONLYOFFICE Desktop Editors, ULogViewer, EverythingToolbar, WinDirStat, and Rufus, with conditional retention for PeaZip, massCode, electerm, Files, ImageGlass, Focra, HandBrake, and Sunshine.
* **Index update**: Added direct OKF navigation to the new early-August retrospective while keeping Repo Radar reports separate from canonical LLM News duplicate-control state.

## 2026-07-30

* **Late-July Repo Radar retrospective**: Added `reports/github-repo-radar/2026-07-late-retrospective.md`, consolidating the 2026-07-21 through 2026-07-30 runs into durable Tier A, conditional, watch-only, safety, and compact-toolkit conclusions.
* **Plugin-backed continuity**: Recorded that future GitHub Repo Radar runs should use the connected GitHub plugin to read the curated reports before discovery and write substantial retrospective updates only after a meaningful source window.
* **Index update**: Added direct OKF navigation to both July Repo Radar retrospectives.

## 2026-07-20

* **Curated reports boundary**: Added `reports/` as an explicitly requested human-readable knowledge layer that remains separate from canonical LLM News duplicate-control state.
* **GitHub Repo Radar retrospective**: Added `reports/github-repo-radar/2026-07-retrospective.md`, consolidating durable Windows 11 utility recommendations, risk tiers, and review triggers from prior Radar runs.
* **OKF contract**: Added `okf/concepts/github-repo-radar-reports.md` to define evidence, update, safety, and storage rules for Repo Radar retrospectives.
* **Scheduled-task isolation**: Clarified that LLM News schedules must not read curated reports as seen-topic state or modify them during routine writeback.

## 2026-07-03

* **Creation**: Added OKF bundle for agent editing rules, scheduled-run writeback behavior, and Web ChatGPT schedule update prompt.
* **Storage protocol v2**: Switched scheduled writeback away from monolithic `state/llm-news-seen.jsonl` rewrites. Current duplicate-control state is sharded into `topics/**/*.json` plus `runs/**/*.jsonl`, with `state/llm-news-seen.jsonl` retained as legacy bootstrap/import evidence only.
* **Recovery**: Added `anthropic/claude-science/in-house-drug-development/2026-07-03` as a topic file and recorded a run event after a failed `LLM Night Lite` monolithic JSONL writeback.
