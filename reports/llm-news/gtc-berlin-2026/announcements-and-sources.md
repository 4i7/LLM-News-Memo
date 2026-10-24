---
type: Reference
title: NVIDIA GTC Berlin 2026 — Announcements, Status and Source Matrix
description: Official source map, release-vs-preview distinction, numeric claims, evidence strength and future verification for conference news.
status: current
scope: llm-news
created: 2026-10-24
review_after: 2026-11-24
tags: [nvidia, gtc-berlin, source-map, release-status, model-cards]
---

# GTC Berlin 2026 — 公式発表と根拠・提供状況マトリクス

[総合資料](README.md) · [設計レビュー](architecture.md)

## 凡例

- **GA**: 一般提供中と明記されている。**Preview/Early access**: 利用者・機能・サポート制限が存在し得る。
- **Available**: 発表元が提供可能と説明。配布地域・SKU・licensingの実態は個別確認。
- **Planned**: 目標・予定。**Research/PoC**: 技術実証/研究であり一般提供ではない。
- 各行の「検証済」は**一次資料内に記載がある**意味で、性能が独立再現された意味ではない。
- 初回ニュース発表の日と現行docsの更新日は別。各URLは2026-10-24に照合した一次資料。

| No. | 発表/主題 | 2026-10-24の根拠上の状態 | 主な数値・制約 | 原典 |
|---|---|---|---|---|
| 01 | **OpenShell Reference Architecture** | 10/21正式発表・reference architecture available | DPU/Sentryのms quarantineは公表値、独立実測未確認 | [S01] |
| 02 | **OpenShell software** | 公開GitHub repository | runtime sandbox/policyとinfrastructure reference designは区別 | [S02] |
| 03 | **DSX POD** | 10/21発表・partners early 2027予定 | 6か月→最短14日はready site条件 | [S03] |
| 04 | **DSX MaxLPS** | 10/21公表・PoC/partners adoption/exploration | 同等tokensで最大30%電力節減（ベンダー主張） | [S04] |
| 05 | **DSX Flex** | 10/21公表・grid response trial | simulated eventで最大40% draw down | [S04] |
| 06 | **DSX Sim + SimReady Central** | 10/21公表・digital twin assets | 発表は実地施工の代替検査にあらず | [S04] |
| 07 | **DSX OS additions** | Config Manager/Rack Management/Readinessはdeveloper preview | software release別にversion/OSS公開を確認 | [S04] |
| 08 | **NVIDIA Minerva** | **10/22**発表・AIOps platform | telemetry・goodput/uptime/yield、運用値は要実測 | [S05] |
| 09 | **Nemotron 3.5 Super VL** | 10/21 available（HF/ModelScope/NIM等） | weightとAPI/ライセンスの違いを確認 | [S06] |
| 10 | **Nemotron 3.5 Bolt E4B 4GB** | 10/21時点で10/23 availability予定と公表 | 新規checkpointの実配布時刻・licenseを別途確認 | [S06] |
| 11 | **Nemotron Retriever** | HF/NIM等でavailableと公表 | embedding/reranking/parsingを混同しない | [S06] |
| 12 | **Kumo Structured / Kumo Engine** | models/libraryを発表、HF/NIM等で利用可能と公表 | Tabular/Relational/Time Series/Forecastを区別 | [S06][S07] |
| 13 | **Agent Knowledge Foundation / Toolkit** | existing toolkit拡張・コンポーネント発表 | cuDF/cuGraph/cuML/cuOpt/cuVS/Auto-Ontology等 | [S07] |
| 14 | **Confidential Bare Metal** | 10/21 new deployment approach | service/SKUごとのattestation・GA確認必要 | [S08][S09] |
| 15 | **Google Cloud A5X** | **11月GA予定**（10/21 announcement） | 80k/site、960k/multisiteは拡張設計・計画 | [S09] |
| 16 | **GDC air-gapped NVIDIA HGX B300** | Google CloudがGAと公表 | Gemini 3.5 Flash、enterprise search機能は段階別 | [S09] |
| 17 | **RTX Spark / DGX Spark / DGX Station** | hardware/OSごとに異なる | RTX Windows、DGX Linux、Station Windowsは12月予定 | [S10] |
| 18 | **Cosmos 3.5 / Data Factory** | model/tools発表、HF/GitHub等でavailabilityと公表 | simulation≠安全認証/実機成果 | [S06][S11] |
| 19 | **Alpamayo 2 Edge** | 10月後半download予定と公表 | DRIVE AGX Thor最適化 | [S06] |
| 20 | **BioNeMo RFD4-Proteina** | モデルをNIM/HF/GitHub等で提供と公表 | benchmark上13倍高速は特定200aa条件 | [S06] |
| 21 | **Ising** | quantum用model群の公開を発表 | qubit calibration/decoding。量子優位の実証でない | [S06] |
| 22 | **Factory Operations Blueprint (FOX)** | GitHub early access | OT systemへのwrite操作には別の権限制御要 | [S11] |
| 23 | **cuDSS** | **10/21 GA** | Applied Materials最大10x、COMSOL 4x等は個別baseline | [S12] |
| 24 | **Cloud partners and sovereign AI** | パートナーの計画/稼働/共同検討が混在 | partner数≠production deployment数 | [S13] |
| 25 | **NVIDIA/Nokia telecom edge AI** | carrier integrationを発表 | 通信網分散推論はlatency/bandwidth/economicsが支配 | [S14] |

## 公表数値の比較条件（要読）

| Claim | 数値 | 母数・比較条件 | 確認すべきもの |
|---|---|---|---|
| POD deployment | 6か月→14日 | **準備済み施設への搬入・commissioning** | site ready定義、輸送、total capex |
| DSX cooling water | 5,400万L/日 | 2GW相当、蒸発冷却方式との試算比較 | WUE・現地気象・機械冷却 |
| MaxLPS token efficiency | 最大30%省電力 | tokens output同等の条件 | latency/concurrency/precision |
| Lambda PoC | throughput +24%、GPU capacity +19% | HGX B200、一定power budget | baselineと試験期間 |
| Nscale PoC | throughput +49%、capacity +37% | Iceland、GB300 NVL72×4rack、264kW cap | workloadとSLA |
| DSX Flex simulated | 最大40% draw reduction | 模擬系統イベント、Blackwell Ultra cluster | latency影響、復帰負荷 |
| Sentry quarantine | ms order | NVIDIA reference design | DPU failure, credential revocation, end-to-end timing |
| cuDSS customer results | 最大10x / 4x / 8–10x | 異なる工学solverとCPU baseline | tolerance/error、solver size、hardware |

## GTC内の関連するが日付を分けるべき項目

- 10/17: RTX Spark laptopの先行発売に関する記事。10/21 keynote時点の新発売ではない。[S10][S15]
- 10/20: workshops、PyTorch Conference発表（TorchNeuron/TorchTPU）は**GTC keynote発表ではない**。関連のsoftware portabilityテーマとして別資料化。
- 10/21: keynote、OpenShell、DSX、open models、Confidential Bare Metal、cuDSSなど。
- 10/22: Minerva、Cosmos technical follow-up、金融機関・公共機関への導入紹介など。[S05][S16]
- 2027: DSX PODのpartnership delivery plan。実際の出荷事実ではない。

## 一次資料（直接参照先）

[S01] https://nvidianews.nvidia.com/news/openshell-reference-architecture

[S02] https://github.com/NVIDIA/OpenShell

[S03] https://nvidianews.nvidia.com/news/nvidia-introduces-dsx-pod-ai-factories-to-accelerate-europes-infrastructure-deployment

[S04] https://nvidianews.nvidia.com/news/european-ecosystem-builds-worlds-most-efficient-ai-factories-with-nvidia-dsx

[S05] https://blogs.nvidia.com/blog/minerva-platform-infrastructure/

[S06] https://blogs.nvidia.com/blog/open-models-europe-industry/

[S07] https://blogs.nvidia.com/blog/enterprise-platforms-agent-toolkit/

[S08] https://blogs.nvidia.com/blog/confidential-computing-model-builders-infrastructure/

[S09] https://cloud.google.com/blog/topics/ai-infrastructure/google-cloud-infrastructure-at-nvidia-gtc-berlin-2026

[S10] https://blogs.nvidia.com/blog/local-ai-gtc-rtx-dgx-spark-station-sync/

[S11] https://blogs.nvidia.com/blog/europe-industrial-leaders-engineering-manufacturing/

[S12] https://blogs.nvidia.com/blog/cudss-generally-available-engineering-scientific-simulation/

[S13] https://blogs.nvidia.com/gtc-berlin-2026-news/

[S14] https://nvidianews.nvidia.com/news/?c=21926

[S15] https://blogs.nvidia.com/blog/gtc-berlin-2026-keynote/

[S16] https://nvidianews.nvidia.com/online-press-kit/gtc-berlin-2026-news

### 原典の読み方と更新

各性能数値は「公式に発表された数値」として保存。独立した実測レポートが後日現れた場合、**測定環境・対象SKU・latency SLO・統計量**を併記した比較表を追加する。リンクが生きているだけでmodel release、device GA、cloud GAを認定しない。

現存ニュースのduplicate controlは`topics/`と`runs/`であり、ここはそれを置き換えない。
