---
type: Curated Report
title: NVIDIA GTC Berlin 2026 — Technical Dossier
description: "Source-checked technical map of NVIDIA GTC Berlin 2026, October 20–22: architectures, software, status, operational constraints and evidence."
status: current
scope: llm-news
created: 2026-10-24
source_window: 2026-10-20..2026-10-24
review_after: 2026-11-24
tags: [llm-news, nvidia, gtc-berlin, agents, gpu, infrastructure, security, models, sovereignty]
---

# NVIDIA GTC Berlin 2026 — 技術総合資料

> 調査基準日：2026-10-24 JST。対象は10月20日のworkshops、21日のkeynote、22日の技術発表。これは**キーノートだけの要約ではなく、会期全体の技術的統合資料**である。個別分野の設計・評価基準・一次ソースは[技術解剖](architecture.md)、全発表の公開状況・根拠は[発表/ソース・マトリクス](announcements-and-sources.md)を参照。両ページを合わせて読む。

## 0. 事実と評価の表記

- **[公式]**: NVIDIAや提携企業による正式発表。機能の発表事実は確実だが、効果の数値は発表主体の主張。
- **[公開]**: 一般に参照できるweight/repository/APIやGAを原典で確認できた状態。*参照アーキテクチャの公開*は、全対応製品の入手可能・量産を意味しない。
- **[予定]**: 発売、提供地域、導入数量など将来の目標。
- **[検証待ち]**: 公正な比較条件、第三者再現、運用実績が未提示。
- **[分析]**: 本資料による技術的解釈。事実と混同しない。

## 1. イベントの位置づけと要旨

- **日付**: Workshops 10/20、Conference 10/21–22、Jensen Huang keynote 10/21 11:00–13:00 CEST（18:00–20:00 JST）、ベルリン。
- セッションはagentic AI、AI safety、CUDA、open models、robotics、industrial AI、AI infrastructureなど100件超。[E1][E2]
- 中核の構図は **「tokensを生むAI factory」+「長時間稼働するagents」+「産業/物理AI」**。発表は新GPUの性能競争単独ではなく、モデル、harness、tools、企業データ、隔離、電力、冷却、資金回収までのシステム設計に広がった。[E3]
- GTC以前から存在したVera Rubin・Blackwell・Nemotron・Omniverseのすべてをこの会期に初登場した製品として扱わない。**10/21の新規性**はOpenShell Reference Architecture、DSX POD、DSX関連拡張、Nemotron 3.5/Kumoなどの新公開内容と具体化にある。

## 2. 全体アーキテクチャ：5つの層

```text
[Business/application]  金融・開発・製造・ロボット・科学
            ↑
[Agent stack]            Models + harness/tools + knowledge + sandbox/control
            ↑
[AI compute]             Vera Rubin NVL72 + Vera CPU + BlueField-4 + networking
            ↑
[AI factory operations]  DSX POD / DSX OS / MaxLPS / Flex / Sim / Minerva
            ↑
[Physical plant]         電力網・配電・液冷/放熱・施設・製造/調達
```

重要な区別：OpenShellは**agentが許可外の行動を起こすことを制限する実行基盤**、Confidential Computingは**モデル・データを実行環境の他の権限主体から保護する基盤**。目的・信頼境界が異なる。DSXは**設備と計算の統合設計**であり、3つを一語で「セキュアGPU」とまとめない。[E4][E7]

## 3. OpenShell Reference Architecture：agentの安全境界

**公式発表（10/21）**。既存のOpenShell softwareに、CPU・DPU・クラウド・edgeを組み合わせた参照設計が追加された。[E4]

| 層 | 役割 | 越境させない対象 |
|---|---|---|
| Vera Rubin NVL72 | モデルのtraining/post-training/inference | モデル内部の生成結果は権限制御の代用品ではない |
| Vera CPU | agent harness、tool実行、OS/container | ローカルプロセス・ファイル・認証情報 |
| OpenShell secure runtime | sandbox内の資源操作をpolicyで制御 | filesystem、network、system calls等 |
| BlueField-4 + NVIDIA Sentry / DOCA | 独立した監視とhardware-level enforcement | エージェントが自分の監視基盤を書き換えるリスク |
| 監視・ID基盤、企業policy | 承認、監査、権限失効 | 誰がどのagentに何を許可したか |

NVIDIAは許可境界越えの際にミリ秒単位で隔離・停止できると説明。**これはベンダー主張であり任意の侵害を完全遮断する証明ではない**。[E4] OpenShellの公開実装ではsandboxとpolicy、kernelレベルの制御を説明する。[E5]

**導入時の必須評価**: (a) 権限変更の認証と伝播、(b) tool呼び出しとkernel/networkのlog相関、(c) container escapeやDPU障害時のfail closed、(d) secretsの有効期限、(e) Sentry停止操作の独立性、(f) データ流出の許可経路。GPU性能だけでは有効性を判断できない。

OpenShell Reference Architectureは公式には「available」だが、特定の製品SKUやcloudでBlueField-4 enforcementをすぐ利用できるかは各提供者・契約・platform versionの確認が必要。**参照設計のavailable≠全機能の一般提供**。

## 4. DSX POD：AI factoryを工場で組み立てる

**[公式] 10/21発表、[予定] partnersによる2027年初頭からの提供。** [E6]

- コンテナ内でVera Rubin、ラック間配線、電源分配、液冷配管、ネットワーク機器を統合・工場検証して輸送する**reference design**。
- NVIDIAは**設置準備済みサイト**で従来約6か月から最短14日へのdeployment time短縮を主張。
- 対象外: 新規送電線の建設、系統接続認可、許認可、土地・変電所確保、長期建設とcapital finance。「14日でゼロからデータセンターが完成」ではない。
- 評価KPI: `time_to_first_production_token`, onsite engineering hours, factory acceptance test pass rate, early failure, commissioning issues, serviceability, power density, PUE/WUE, cost per produced token。

**設計面の論点**: 工場内の並列化は現地建設のクリティカルパスを縮められる。一方、物流・輸送振動・環境条件・保守スペース・交換部品と現場標準の共通化が新しいリスク。

## 5. DSX：電力・冷却・digital twin・運用

同日の[E8]でDSXの構成要素を明文化。

| 仕組み | 技術的意味 | 状態・留意点 |
|---|---|---|
| **DSX Reference Design** | compute/network/storage/power/coolingの共同設計 | ベンダー参照設計 |
| **DSX MaxLPS** | 供給電力予算内で動的に電力配分しtoken outputを最大化 | 「同じtokensに最大30%少ない電力」は条件付きの公式主張 |
| **DSX Flex** | 電力網イベント・価格・電源条件に応じ負荷を調整 | grid-side availabilityとworkload SLOに依存 |
| **DSX Sim / SimReady Central** | 配電・冷却・音響などをデジタルツインで事前検証 | model validationや実測とのキャリブレーションが必要 |
| **DSX OS** | 構成/ラック管理/cluster readinessとfault handlingを自動化 | 新しいConfig Manager等の一部はdeveloper preview |
| **DSX Exchange** | 設備系データと計算資源を連結 | 運用統合の技術群 |

**冷却**: 密閉型液冷回路+dry cooler。条件次第で施設側の蒸発冷却用水をほぼゼロに近づける構想。2GWの仮想導入で**5400万L/日**の節水を主張。ただし地域気候によって補助的な機械冷却が必要なため**世界の全立地で水消費ゼロではない**。[E8]

**PoCと製品性能を分離**:
- Lambda HGX B200で**固定電力予算内token throughput +24%、運用GPU容量+19%**。
- Nscale Iceland 4 GB300 NVL72 racks、**264 kW**の条件で**inference throughput +49%、管理GPU容量+37%**。
- grid eventの模擬試験ではcluster消費電力最大40%削減を確認。これは通常時の性能改善ではなく需要応答機能。[E8]
これらを同条件の一般的な「NVIDIA GPU+49%」として外挿しない。

## 6. 10/22追加：MinervaとAI factory yield

**[公式] 10/22発表**。MinervaはGPU・NVMe・network・job telemetryを統合し、目的別AI modelで異常検知・原因分析を行うAIOps。[E9] DSX OSのラック/cluster準備・管理機能とは役割が重なる部分はあっても同一製品ではない。

`yield`を単なるGPU利用率としない。ジョブが要求SLOを満たして生成した**有効成果（goodput、完了job、token、稼働時間）**を、電力と支出を伴う総能力に対して測る。訓練が99%進行して失敗すれば見かけの利用率が高くても有効yieldは低い。

**推奨運用指標**: `accepted_tokens_per_MWh`, `p95_latency`, `time_to_first_token`, `job_completion_rate`, `fault_detection_latency`, `MTTR`, `cooling_water_l_per_MWh`。公開数字が将来の実環境SLOを保証するものではない。

## 7. Open modelsと企業Knowledge Foundation

10/21の公開内容をモデル種別で整理。**weights公開、モデルによるAPI提供、将来ダウンロード可能を同列に扱わない**。[E10]

| カテゴリ | 製品/モデル | 主な用途 | 公表状態 |
|---|---|---|---|
| Language/vision | Nemotron 3.5 Super VL | 画像とテキストを使うagent reasoning | HF/ModelScope/partner/NIMでavailable |
| Compact language | Nemotron 3.5 Bolt E4B 4GB | 制約環境での効率的なagent処理 | 10/23公開予定と発表（10/24時点の実配布は別途検証） |
| Retrieval | Nemotron Retriever | embedding、reranking、document parsing | HF/NIM等でavailable |
| Structured data | Kumo Structured: Tabular/Relational/Time Series/Forecast、Kumo Engine | 予測・異常・推薦・関係データ | model/engineの入手性と利用許諾を個別確認 |
| World modeling | Cosmos 3.5 | robot/車両の環境表現・simulation | HF/GitHubで公開と発表 |
| Automotive | Alpamayo 2 Edge | DRIVE AGX Thor上の運転環境理解と動作計画 | 10月後半公開予定 |
| Molecular design | BioNeMo RFD4-Proteina | target binder・タンパク質構造設計 | NIM/HF/GitHubと発表 |
| Quantum | NVIDIA Ising | qubit calibration、error correction | GitHub/HF/build.nvidia.comと発表 |

**Kumoの意味**: LLMに巨大な表をそのまま投入する代わりに、専門モデルがtable/relation/time seriesの予測値を生成してagentが利用する。一般的なRAG（文書検索）と異なる: `retrieve evidence`だけでなく`predict values/outcomes`が必要。

**Agent Knowledge Foundation**: cuDF（DataFrame）、cuGraph（graph）、cuML（ML）、cuOpt（optimization）、cuVS（vector search）、Auto-Ontology（業務概念へのmap）とRetriever/Kumoを束ね、企業の既存データに接続するsoftware layer。[E11] これは**すべてを単一のLLMへ格納する方式ではない**。外部データと業務権限を保ったまま検索・予測をtoolとして付加する。

**Agent Toolkit**: model、harness、tool/skill、knowledge、sandboxを接続。OpenShell（runtime boundary）、NemoClaw（agent blueprint）、NeMo Relay/Compass（tooling）を別コンポーネントとして扱う。[E11]

## 8. Confidential Bare Metal：OpenShellとは異なる機密境界

- **[公式]** Confidential Bare Metalはthird-party cloud/neocloudのdedicated machineで、model weightsと学習/推論データをplatform operatorから守るための仕組み。[E12]
- 暗号化、hardware-rooted boot、attestation、platform integrity、access restrictionの組合せを使用。
- **保護対象**: model intellectual property、user data、prompt/activation、runtime integrity。
- **OpenShell保護対象**: agentによる不適切なfile/network/tool操作。
- 安全なagentを作るには双方が必要になるが、一方だけで完全な信頼性は得られない。
- いつ何がGAかはcloud instance別。Google CloudのA4/A4X MaxとNVIDIA全体の構想を区別。[E13]

## 9. Cloud/Local/Sovereign deployment

**Google Cloud A5X**: Vera Rubin NVL72、ConnectX-9、Virgo Network、液冷とGKEの組合せ。Googleは**11月の一般提供予定**、単一サイト最大80,000 GPUs、複数サイト最大960,000 GPUsを**拡張設計・計画**と説明。[E13] 「96万GPUすでに稼働」は誤り。

**Google Distributed Cloud**: B300 GA、Gemini 3.5 Flashをair-gapped環境で使う構想、検索はpreviewなど機能ごとに段階が異なる。[E13]

**Local AI**: RTX Spark Windows、DGX Spark Linux、DGX Station Linux（Windows版は12月予定）。DGX Spark 64GBは10/23発売案内、Syncの8台連携・Model Launcher等は時点を区別。[E14] `RTX Spark`と`DGX Spark`は別カテゴリ。消費者向けPCがサーバ級Rubinを代替するわけではない。

## 10. Physical AI・industrial/robotics・science

- **Cosmos 3.5 / Cosmos Data Factory**: 動画/世界モデルの学習・評価・シミュレーション、仮想データのcurationとgeneration。simulationでの成功は実世界の安全性証明ではない。[E10]
- **Alpamayo 2 Edge**: 自動運転でリアルタイムscene understandingとmotion planningを端末側実行する方向。車両安全認証とmodel availabilityを分離。[E10]
- **Factory Operations Blueprint (FOX)**: 工場管理agentと検査/障害診断等のspecialist agentsを結び、CAD/PLM/IT/OT情報を利用。GitHub early access。工場OTのwrite privilegeは観測ツールと分離し承認必須。[E15]
- **cuDSS**: 大規模疎行列を解くGPUライブラリが10/21 GA。Applied Materialsの最大10x、ZEISS SMT/COMSOLの4x、Dassaultの8–10x等は**各顧客固有のCPU baselineと問題条件**による。[E16]
- BioNeMo RFD4-Proteinaは設計候補を生成するモデルであって、wet-lab検証と臨床的有効性を自動保証しない。
- Isingは量子装置の古典側リアルタイム校正・error correctionの支援。量子優位を達成したという発表ではない。

## 11. 供給網・ネットワーク・通信・産業投資

- Vera Rubinのデバイス性能・NVLink/Spectrum-X/ConnectXとDSXは別の供給・運用層。
- NVIDIA/telecom企業はGPU計算資源をmetro/edgeへ配備し、推論をデータ発生場所に近づける構想を公表（latency、データ主権、電力のトレードオフ）。
- 10/21発表の補助材料として、NVIDIAによる欧州AI partnersや製造設備・基板/光インターコネクトの拡張構想がある。[E3][E17]
- **供給能力拡張やパートナー名簿は、顧客契約・稼働数・利用料金・実測性能の証明ではない**。

## 12. ベンチマーク・提供可否をどう評価するか

**再現条件の最小セット**: workload/model version、input/output tokens、concurrency、batch、latency SLO（p50/p95）、GPU SKU/count、CPU/DPUs、memory容量、precision/quantization、interconnect、power cap、cooling、compiler版本、測定期間、既存キャッシュ、課金単価/施設償却。

| 主張 | 比較対象/条件 | 読み違い防止 |
|---|---|---|
| DSX POD「14日」 | ready siteでの現地deployment | 系統接続・建設全体の期間ではない |
| DSX MaxLPS「30%節電」 | 同tokens・動的予算配分 | 全負荷での常時30%ではない |
| DSX「節水5400万L/日」 | 特定の2GW条件と冷却方式比較 | 気候依存、ゼロ取水を保証しない |
| OpenShell「msで隔離」 | NVIDIA Sentry reference design | 任意攻撃への完全な耐性試験ではない |
| Vera Rubin「30x throughput/MW」 | NVIDIA選定baseline | 同一モデル、SLO、価格の比較要 |
| cuDSS「最大10x」 | 特定simulation app | 全アプリでの平均改善ではない |

## 13. 即時の技術判断

| 利用者 | 試す価値のあるもの | まず測ること |
|---|---|---|
| agent開発/enterprise IT | OpenShell + knowledge tools | policy escape resistance、監査、rollback |
| LLM model運用 | NIM/Nemotron/Kumo/Retriever | 実行コスト、license、RAG品質、domain drift |
| cloud/AI factory運営 | DSX Sim/MaxLPS/OS、Minerva | tokens/MWh、commissioning、goodput、運用障害 |
| 機密研究/企業 | Confidential Bare Metal + attestation | cloud管理者を含むtrust boundary |
| local developer | RTX/DGX Spark | memory、model load、tool latency、同時実行 |
| 産業/科学技術 | FOX、cuDSS、Cosmos | 実データ/実機での誤動作率、solverの正確性 |

## 14. 未確認・誤解しやすい事項

1. OpenShellソフトウェアが公開されていることとBlueField-4 Sentryの完全なハードウェア構成が誰でも直ちに配備できることは別。
2. Vera Rubinプラットフォームのデモ/パートナー計画と任意地域での即時GAは別。
3. Open-weightとはOSや使い方を無制限に許す標準OSSライセンスと同義ではない。model card/license単位で確認。
4. DSXの効果値はベンダー・パートナー測定。施設ごとの電力予算と気候・SLOを無視して外挿しない。
5. 10/22発表のMinervaを10/21 keynoteの新規発表と混同しない。
6. partner listは**working with / exploring / integrating**を混在させる。production deploymentとは限らない。

## 15. 関連技術資料と記録境界

- [発表/ソース・マトリクス](announcements-and-sources.md): 一次ソース、公開/予定/GA、数値の裏付け。
- [技術解剖・設計レビュー](architecture.md): 詳細アーキテクチャ、failure mode、評価試験、実装チェックリスト。
- [Agent security casebook](../2026-agentic-security-casebook.md): 過去incidentと防御層を接続。
- [Accelerator portability](../2026-accelerator-portability-torchneuron-torchtpu.md): PyTorchの実行移植性とNVIDIAのsoftware lock-inを別角度から比較。

**本資料はcurated researchであり、LLM Midday/Nightの重複排除stateではない**。canonical stateは`topics/**/*.json`と`runs/**/*.jsonl`である。10/21の既存DSX recordは`topics/nvidia/dsx-pod/modular-ai-factory/2026-10-21.json`。OpenShell topicの未保存をこの資料が自動修復したことにはしない。

## 16. 主要一次資料

[E1] https://www.nvidia.com/en-eu/gtc/keynote/
[E2] https://www.nvidia.com/en-eu/gtc/session-catalog/
[E3] https://blogs.nvidia.com/blog/gtc-berlin-2026-keynote/
[E4] https://nvidianews.nvidia.com/news/openshell-reference-architecture
[E5] https://github.com/NVIDIA/OpenShell
[E6] https://nvidianews.nvidia.com/news/nvidia-introduces-dsx-pod-ai-factories-to-accelerate-europes-infrastructure-deployment
[E7] https://blogs.nvidia.com/blog/confidential-computing-model-builders-infrastructure/
[E8] https://nvidianews.nvidia.com/news/european-ecosystem-builds-worlds-most-efficient-ai-factories-with-nvidia-dsx
[E9] https://blogs.nvidia.com/blog/minerva-platform-infrastructure/
[E10] https://blogs.nvidia.com/blog/open-models-europe-industry/
[E11] https://blogs.nvidia.com/blog/enterprise-platforms-agent-toolkit/
[E12] https://blogs.nvidia.com/blog/confidential-computing-model-builders-infrastructure/
[E13] https://cloud.google.com/blog/topics/ai-infrastructure/google-cloud-infrastructure-at-nvidia-gtc-berlin-2026
[E14] https://blogs.nvidia.com/blog/local-ai-gtc-rtx-dgx-spark-station-sync/
[E15] https://blogs.nvidia.com/blog/europe-industrial-leaders-engineering-manufacturing/
[E16] https://blogs.nvidia.com/blog/cudss-generally-available-engineering-scientific-simulation/
[E17] https://blogs.nvidia.com/gtc-berlin-2026-news/

次回レビュー条件: 2026年11月のGoogle Cloud A5X GA、2027年のDSX POD初回納入、OpenShell/Sentryの実測security report、Nemotron/Kumoのmodel card/license更新、MinervaのGA/測定方式変更。
