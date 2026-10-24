---
type: Technical Appendix
title: GTC Berlin 2026 — System Architecture and Verification Playbook
description: Detailed subsystem map, trust boundaries, failure modes, test design and procurement criteria for the GTC Berlin 2026 announcements.
status: current
scope: llm-news
created: 2026-10-24
review_after: 2026-11-24
tags: [nvidia, agent-security, dsx, openshell, design-review, verification]
---

# GTC Berlin 2026 — アーキテクチャ・設計審査・検証手順

[技術総合資料に戻る](README.md) / [一次資料・発表状況](announcements-and-sources.md)

## A. 何を設計したのか

GTCの主要な変更は「モデル + 周辺ツール」の発想から、次の独立した故障境界を持つ**agent production system**へ移行した点にある。

```text
  User / Enterprise policy / Approval / Revocation
                 │
  Agent orchestration / Harness / Observability
                 │
     ┌───────────┼───────────┐
     │           │           │
 Models      Knowledge    Tools & Skills
 Rubin       Retriever   browser / SCM / shell / API
             Kumo/cuVS       │
     └───────────┼───────────┘
          OpenShell sandbox
          CPU syscall/file/net policy
                 │
     BlueField-4 DPU + Sentry
     out-of-band monitor/enforcement
                 │
   Confidential Computing and attestation
                 │
   Vera CPU ─ Rubin GPUs ─ network/storage
                 │
    DSX POD / OS / Sim / Flex / MaxLPS
                 │
           Facility & power grid
```

図は各要素の**論理的な責任範囲**。実装上すべての構成要素が一つのstackに物理的に直列配置されるわけではない。とくにConfidential Computingは下の階層だけを「監視」するものではなく、CPU/GPU/メモリを含む計算環境のattestationと隔離を横断的に提供する。

ソース: https://nvidianews.nvidia.com/news/openshell-reference-architecture / https://blogs.nvidia.com/blog/enterprise-platforms-agent-toolkit/ / https://blogs.nvidia.com/blog/confidential-computing-model-builders-infrastructure/

## B. OpenShellの設計レビュー

### B1. 4つの信頼境界

1. **User → agent**: principalのID、委任範囲、許可期限、承認条件と取消。
2. **Agent → tools**: 許可したtool・引数・ファイル・credentialのみアクセス可能か。
3. **Sandbox → network/host**: OSとnetworkによる独立制御。text instructionによる禁止だけでは不可。
4. **Host → DPU/Sentry**: agentが侵害したhost rootから監視/停止ロジックを保護できるか。

### B2. 脅威モデル

| 攻撃・故障 | 問題になる境界 | 測定すべき防御 |
|---|---|---|
| Prompt injectionが指示を変更 | User/agent | tool scopeをpromptと独立に検証 |
| Tool引数への悪意あるURL/command | Agent/tool | capability allowlist、sink制限 |
| Token/secretの漏出 | Agent/identity | secret broker、per-run scoped token、即時失効 |
| Unauthorized egress / SSRF | Sandbox/network | 強制egress policy、DNS/IP/service identityも検査 |
| Host root compromise | Host/DPU | DPU監視基盤の独立性、tamper alarm |
| Inter-agent communication | Agent/channel | run間共有領域・暗黙の掲示板を禁止/追跡 |
| Transcript/log manipulation | Agent/monitor | append-only remote telemetryと署名/整合性検証 |
| Agentの無限再試行 | Agent/policy | wall-time、tool-call、token budget、safe stop |

**検証原則**: 許可境界の内側の有用性と、境界の外側への拒否が両立すること。拒否されたというLLMの説明だけでは不十分。OS/network/IAM auditで実際の操作を突き合わせる。

### B3. OpenShell採用判定

- `policy version`、`run_id`、`human owner`、`model version`、`tool call id`が1つのevent sequenceとして辿れる。
- 失効要求→host→DPU→tool providerで撤回された時刻を測れる。
- DPU停止でもagentに自由な外部通信が許されない（実装依存のfail closedを検証）。
- kernel-level rejection、tool-level rejection、human approvalの各層の結果を混同しない。
- Secret exfilテストは無害なダミーtoken/許可済みテスト環境だけで実施する。
- 攻撃成功/失敗だけでなく`false denial rate`、`median tool overhead`、`p99 tool latency`、`time to quarantine`を測る。

公式の「ミリ秒単位で隔離」はsystem全体の`revocation_complete_at`の第三者測定が出るまでは宣伝上の上限・典型値とみなさない。

### B4. confidential computeと組み合わせる場合

守りたい機密情報（GPU HBMのweights、data、prompt）を定義。attestation reportを検証する検証者・key release policy・service operator権限を明文化する。DPUによるegress blockingはmodel weight暗号化と別の機構なので、両方の証跡を要求する。

## C. AI factory: Design -> Commission -> Operate

| 段階 | ツール群 | 主要artifact | Exit条件 |
|---|---|---|---|
| Planning | DSX Reference, Sim/SimReady | facility model、network topology、power budget | digital twinとsite条件が一致 |
| Factory assembly | DSX POD | FAT（factory acceptance test）、配線・配管・asset BOM | 出荷時検査合格 |
| Onsite commissioning | POD + DSX OS | SAT、leak/power/network failover、cluster readiness | 最初のproduction jobが成功 |
| Runtime optimization | DSX MaxLPS / Flex | workload scheduling、power forecast、grid signal | latency/goodput guardrails維持 |
| Fault management | DSX OS + Minerva | telemetry、fault localization、MTTR | error budget内に回復 |

### C1. POD「14日」の母数

6か月→14日という値は**site ready以降のdeployment stage**での比較。早期のplanning、土地、permit、電力系統、冷却機器調達などを足した`total_project_lead_time`とは別。

`end_to_end_lead_time = permitting + grid_ready + equipment_procurement + factory_integration + transport + site_commissioning`

同時並行の段階があるため厳密には単純和ではなくcritical-path schedulingで評価する。公開数値の切り出し方だけで比較しない。

### C2. 電力最適化の数学的確認

- `Power cap (MW)` は上限であり、日々の平均消費電力量(`MWh`)と同義でない。
- `token throughput / power cap` と `tokens / measured electrical energy` は別指標。
- `goodput`: latency/quality/error基準を満たす有効出力。
- `MaxLPS`の宣伝値を再現する場合は**同じmodel・traffic・p95 SLA・precision・cache hit rate**を固定。

例: 同一トラフィックで本来100MWh→70MWhなら30%節電、同じ上限100MWで出力が増える実験は*節電*ではなく*有効稼働能力向上*である。各PoCの改善値を加算して二重カウントしない。

### C3. 冷却

Facility WUE（water use effectiveness）は`facility water liters / IT kWh`で追跡。近ゼロの蒸発冷却水と、製造・間接発電で消費される水を同一視しない。45℃のcoolant対応という記述は地域気候とdry cooler余裕度を保証しない。最悪気象日と冗長構成で設計審査する。

### C4. Reliability experiments

- 1rack突然停止、GPU故障、NVLink degradation、RDMA/network path degrade、NVMe latency spike
- power demand response中の高優先度推論SLO維持、long-running training checkpoint品質
- cold restart・rollback・capacity failover・firmware/driver interop
- time to detect（TTD）、time to mitigate、job recovery point、token loss、energy consumed per successful job
- Minervaのalertにalert fatigue/false positiveがないか

## D. Agent Knowledge Foundation: RAGとpredictive toolingの違い

**普通の文書RAG**: `documents -> parse -> embed -> retrieve -> LLM answer`

**Structured intelligence**: `tables / relationships / time-series -> ontology mapping -> Kumo scoring / cuDF cuGraph cuML -> LLM plans action`

企業内の権限はコンテキストに埋め込むだけでは不十分。row/column-level ACL、PII masking、retention、source lineage、query auditをtool boundaryで適用する。

### D1. 代表的ワークフロー

```text
「今週、どの部品が欠品しそうか」
  agent
  -> authorized read: inventory, supplier, shipments
  -> Auto-Ontology: material/site/supplier relation
  -> Kumo Time Series / Relational: risk estimate
  -> cuOpt: candidate replenishment schedule
  -> human approval: 発注/変更は別権限
  -> transaction log: action and impact
```

実装は製品の例を組み合わせた**概念上のワークフロー**であり、NVIDIAがこのシーケンスを正式に保証したわけではない。

### D2. 検証項目

検索にはRecall@k、nDCG、MRRとhard negatives、表形式予測にはAUC/PR-AUC、MAPE/MASE、calibration、時間分割データ漏洩の検査。end-to-end agentにはaction correctness、permission violations、cost/task、latencyとfalse-positive interventionsを要求。

## E. Open models / physical / scientific results

- Nemotron VL/Boltの公開形態とBOMを整理。weights`available`にはlicense、tokenizer、model card、training recipe、API runtimeを個別に付帯させる。
- Cosmosの世界モデルの評価は動画の見た目で済ませず、時間整合性・物理制約・OOD・接触 dynamics・rollout stabilityを測る。
- Alpamayo 2 Edgeは車載推論の**リアルタイム保証・安全監視・障害時挙動**をモデルスコアから切り離す。
- BioNeMo RFD4-Proteinaではin silico成功率→wet-lab hit rate→binding affinity→安全性を段階別に測る。公開の13x生成速度は臨床開発が13x速いという意味ではない。
- Isingは古典制御/quantum error correctionの用途。latency、calibration drift、decoder error rate、ハードウェア別transferabilityを測る。
- cuDSSによるspare solver高速化はmatrix sparsity pattern、conditioning、precision、solver toleranceで変化する。結果の残差・収束性が同等か比較する。

## F. 経済性・導入意思決定

| コスト | 数式的な扱い | よくある抜け |
|---|---|---|
| Compute capex | GPU/CPU/DPU + network + racks + storage + power/cooling | 供給・交換部品 |
| Facility capex | 土地/建設/系統接続 | 送電接続の遅延 |
| Fixed opex | financing, software, staff, maintenance | 利率・保険・予備機 |
| Variable opex | 電気、水、クラウド・transit、データ処理 | PUE/WUEを無視 |
| Output denominator | successful tokens or completed agent tasks | 失敗jobやcached tokenの二重計上 |

`cost_per_valid_task = (capex_amortized + operating_cost + retries + failed_runs) / successful_business_tasks`

token当たり価格の改善と企業タスク完了率の改善が一致するかは、workloadごとに測定する。

## G. 重要な未検証事項・次回レビュー

- OpenShell/Sentryの製品ごとの可用性、システム侵入後のfail-closed実証、独立red-team。
- DSX PODの初回出荷・現地導入14日達成・total project cost。
- DSX MaxLPSおよびFlexの比較条件、SLOとの同時達成、コスト/ワット最適化。
- Nemotron 3.5 Boltの10/23公開実態、model card/licenseの更新。
- Google A5Xの11月GAと960,000 GPU計画の実進捗。
- Minervaの実導入実績、対象telemetryと誤検知・復旧時間。
- enterprise/industrial agentのOT write policyと監査証跡。
- 実際のconfidential attestation API、key provisioning、remote verifierの公開状況。

## H. Source checklist

- OpenShell announcement: https://nvidianews.nvidia.com/news/openshell-reference-architecture
- OpenShell code: https://github.com/NVIDIA/OpenShell
- DSX platform announcement: https://nvidianews.nvidia.com/news/european-ecosystem-builds-worlds-most-efficient-ai-factories-with-nvidia-dsx
- DSX POD: https://nvidianews.nvidia.com/news/nvidia-introduces-dsx-pod-ai-factories-to-accelerate-europes-infrastructure-deployment
- Minerva: https://blogs.nvidia.com/blog/minerva-platform-infrastructure/
- Knowledge Foundation: https://blogs.nvidia.com/blog/enterprise-platforms-agent-toolkit/
- Models: https://blogs.nvidia.com/blog/open-models-europe-industry/
- Confidential: https://blogs.nvidia.com/blog/confidential-computing-model-builders-infrastructure/
- Cloud counterpart: https://cloud.google.com/blog/topics/ai-infrastructure/google-cloud-infrastructure-at-nvidia-gtc-berlin-2026
- Full conference log: https://blogs.nvidia.com/gtc-berlin-2026-news/

この文書は設計審査用の解釈を含む。測定・導入済みの事実と、試験提案を区別し、報告時点では独立検証したと主張しない。LLM Newsの重複排除stateを変更しない。
