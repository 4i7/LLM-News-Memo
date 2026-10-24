---
type: "Curated Report"
title: "Sovereign AI and Confidential Computing — 2026 Technical Architecture"
description: "Evidence-backed deployment reference for connected, disconnected, air-gapped and confidential AI with Microsoft, Google and NVIDIA release/status distinctions."
status: current
scope: llm-news
created: 2026-10-24
source_window: "2026-04-22..2026-10-24"
review_after: 2026-11-24
tags: [llm-news, sovereign-ai, confidential-computing, airgap, azure-local, google-distributed-cloud, nvidia, security]
---

# Sovereign AI／Confidential Computing 技術資料 — 2026年10月版

> **最終確認：2026-10-24 JST。** 目的は「重要なモデル・企業情報を組織の管理下で利用できるAI」を、**法的なデータ所在**、**運用・鍵の支配権**、**ネットワーク分離**、**実行中の秘密保護**、**agentの行動権限**の別々の要件として設計・比較すること。提供状況は2026年10月20–21日の公式発表と公表ドキュメントに基づく。[M1][G1][G2][N1]

関連：[技術資料索引](technical-dossiers-index.md) ／ [NVIDIA GTC Berlin 2026](gtc-berlin-2026/README.md) ／ [Agentic AI Security Casebook](2026-agentic-security-casebook.md)

## 1. 結論：Sovereign AIには少なくとも5つの独立した制御軸がある

| 軸 | 何を守るか | 必要となる証拠 | 代表的な誤解 |
|---|---|---|---|
| **Data residency** | data/backup/metadata/processingの配置 | region、保存先、subprocessor、egress実測 | 「東京regionなら全データが国内」 |
| **Operational sovereignty** | 誰がadmin、更新、復旧、支払停止を操作できるか | operator identity、JIT、監査、災害時の権限 | 「顧客の鍵がある=vendor管理不可」 |
| **Network isolation / air gap** | public internetに接続せずサービスを継続できるか | packet capture、DNS/PKI/NTP、update route、独立control plane | 「private endpointは物理air gap」 |
| **Confidential Computing** | host/cloud operator等から**実行中**のdata/modelを守る | TEE attestation、key release policy、threat model | 「encryption at restがあればRAMも安全」 |
| **Agent authorization** | modelが呼ぶtool/API・行動・情報流出を制御 | policy engine、per-run identity、OS/DPU log、revocation | 「Confidential VMならagentの逸脱も防げる」 |

この5軸は代替関係ではない。**GDC air-gappedでも内部特権者対策が別途必要**で、**Confidential G4がGAでもネットワークが切断されているわけではない**。OpenShell等のtool sandboxも保護目的が異なる。

## 2. 最新の公式発表：何が利用でき、何がまだ予定か

| 技術 / 企業 | 2026-10-24時点 | 技術・提供範囲 | 重要な制約 |
|---|---|---|---|
| Microsoft **Sovereign Public Cloud** | 既存portfolio | Azure sovereign controls、Customer Lockbox、JIT、Data Guardian、Production Touch Ledger | residency・operator controlはサービス/regionと段階別 [M1] |
| Microsoft **Sovereign Control Panel** | **Igniteでpublic preview予定** | sovereign posture/portabilityを可視化 | 本番で全業務systemを自動移行するわけではない [M1] |
| Microsoft **Azure Local disconnected operations** | 対象契約/適格要件で提供。connected→disconnected transitionはpublic preview予定 | local control plane、VM/Kubernetes、限定Arc機能 | eligible agreement、専用管理cluster、余剰容量が必要 [M1][M2] |
| **GitHub Enterprise Local** | **IgniteでGA予定** | Azure Local上の検証済みGitHub Enterprise Server appliance | 2026-10-24にGAしたと断定しない [M1] |
| Microsoft **Foundry Local on Azure Local** | **IgniteでGA予定** | local inference、agentic retrieval、on-premモデル群 | GPU、AKS、Gateway API、certificate、モデル容量等の要件 [M1][M3] |
| Microsoft **Managed HSM External Key Management** | **GA** | key-encryption-key（KEK）を顧客/第三者HSMに保持 | end-to-end SLA対象外の部分、Secure Key Release不可 [M1][M4] |
| Microsoft **Confidential VMs on Azure Local** | **GA** | local machineにおけるhardware-based isolation / attestation | secure enclaveのみですべてのagent行動を統制できない [M1] |
| Google **GDC air-gapped / HGX B300** | GDCで**GA**（HGX B300） | customer siteでGoogle管理技術を分離運用 [G1][G3] | disconnected用の運用・調達・update作業が必要 |
| Google **Gemini 3.5 Flash on GDC air-gapped** | **GA**（10/20のGDCブログ） | local multimodal inference [G3] | model license、提供地域/資格を個別確認 |
| Google **Gemini Enterprise Search on GDC** | **Preview** | multimodal RAG・local indexing/search [G1][G3][G4] | Gemini本体のGAとsearchのPreviewを混同しない |
| Google **Confidential G4 (RTX PRO 6000 Blackwell)** | **GA**、36 zones [G5] | Compute Engine VM/GKE GPU Confidential Computing | air-gappedではなくcloud TEE |
| Google **A4 Confidential GPU** | 提供中 [G1] | HGX B200 + Intel TDX | 対応instance/driverについて条件を照合 |
| Google **A4X Max Confidential Bare Metal** | 新たな選択肢として導入発表 [G1][N1] | NVIDIA GB300 NVL72、nonvirtualized confidential | 一般GAを資料から勝手に推定しない |
| NVIDIA **Confidential Bare Metal** | **2026-10-21公式発表** | 専用bare metalにhardware-rooted isolationとattestation | providerごとのrolloutと測定・認証を確認 [N1] |
| NVIDIA **OpenShell/Sentry** | reference architectureを発表 | agentのtool boundaryとout-of-band enforcement | secret encryption/TEE自体ではない [N2] |

**GA / Preview / Plannedの区別は導入時に再検証**。本資料の発表時点以降に提供範囲が変わる可能性がある。

## 3. 全体システム：情報と権限の流れ

```text
User / Organization policy / Role-based approval
           │
           ├──> Identity federation / just-in-time admin / workload identity
           │
       Agent harness + model
           │
   ┌───────┴───────────┐
   │                   │
   local RAG/index      tool execution (shell / SCM / HTTP / ERP)
   │                   │
   vector + tables      independent sandbox, allowlist, audit
   │                   │
   └───────┬───────────┘
           │
    Model serving runtime
     │           │
  encrypted    policy-controlled
  storage      network egress
     │           │
     └──────┬────┘
          TEE / attestation / key broker
             │
    GPU/CPU/network/storage at customer site
         OR confidential public cloud
```

**この図は論理構成案**。Microsoft、Google、NVIDIAが単一の製品として上記の全構成を提供するという意味ではない。

データの経路はprompt・retrieval結果だけではない。**embedding、log、trace、model weights、checkpoint、index、backup、telemetry、support bundle、crash dumps、キーmetadata**をdata-flow inventoryに含める。

## 4. Azure Local・Foundry Localを利用する設計

### 4.1 境界と機能

Azure Local disconnected operationsはAzure Public Cloudへ接続せず、local control planeでVM・containerと一部Arcサービスを操作できる仕組み。[M2] これを「通常のAzure全サービスをofflineで動かせる」と解釈しない。

```text
  Org users / AD / local DNS & PKI
               │
   Azure Local local management plane
       │               │
   AKS Arc           VM / data stores
       │               │
   Foundry Local     GitHub Enterprise Local (GA planned)
       │               │
  inference/RAG      repositories + local coding agent
       └───────┬───────┘
            local audit & backup
```

Foundry Local要件の例は対応Azure Localバージョン、AKS Arc（Kubernetes 1.29+）、Istio/Gateway API Inference Extension、cert-manager/trust-manager、モデルcache PVC、GPU等。[M3] これらを入れずに「modelを1クリックでLAN内に置ける」ようにはならない。

### 4.2 事前作業

1. **適格性**: disconnected operationsが対象となる契約、support plan、規制・業務上の要件を確認。[M2]
2. **管理系**: AD/ID、FQDN、DNS、PKI、certificate refresh、local monitoring/patching、管理clusterを用意。
3. **ネットワーク**: local control plane、model serving、code repository、registry、backupをsegment。インターネット許可を止めても内部からsecurity patchを調達するtransfer手順が必要。
4. **Capacity**: 通常のmodelとembedding/retrievalを同時実行するGPU memory、Kubernetes overhead、p99 latency、powerを計算。
5. **引継ぎ**: Azure/SaaS依存の管理機能、停止時の回復、vendor support、license verificationとrollbackをdocument化。

### 4.3 External key managementの意味

Azure Managed HSMのEKMは**外部HSMにKEKを保持し、対象Azure serviceのencryption at restを守る**。[M4] これはCPU/GPU RAMを機密化したり、agentのネットワーク先を制限したりする機能ではない。

Microsoft文書は、外部HSM/Proxy停止時には接続先serviceへ影響があり、**Secure Key Release（SKR）、external key backup/restore、geo-replicationは非対応**と明記。法令上必要な場合に採用し、単純により安全な上位版とはみなさない。[M4]

## 5. Google Distributed Cloud air-gapped

GDCには**air-gapped**（目的に応じ物理的/論理的にpublic internetから切り離して運用）と**connected**（customer hardware上でGoogle-managed software lifecycle）の別の形式がある。[G2]

10/20の公式発表[G3]では、GDC air-gapped上でHGX B300のGA、Gemini 3.5 FlashのGA、enterprise searchのPreviewをそれぞれ区別している。2026-10-21のGTC発表[G1]も、この違いを再確認。

**local RAG構成**:

```text
 approved document ingest -> local parser/OCR/media pipeline
           ↓
 local embedding model -> local index/vector store
           ↓
 local search/rerank -> locally-hosted Gemini or open-weight LLM
           ↓
 citations + business role filter -> analyst
```

RAG用モデルの実行をlocalにしても、**index生成元document、metadata、prompt log、UI analytics、retrieval cacheが外へ出ればair-gap要件は破綻**する。モデル更新、security bulletin、offline code signingも手順が必要。

Googleの「managed search」もPreviewであるため、indexingの整合性、tenant isolation、RBAC、data deletion propagation、disaster recoveryを検証してから導入判断する。[G4]

## 6. Confidential Computing / GPU confidential mode

### 6.1 何が守れるか

通常の暗号化:
- **At rest**: disk、object storage、backupの暗号化。
- **In transit**: 通信区間、device間linkのTLS/transport protection。
- **In use**: accelerator/CPUの実行時のmodel weights、prompt、activation、KV cacheなどへのhost管理者のアクセスを抑止するhardware isolation。

Confidential VM/Container/Bare Metalは**どのhost/hypervisor/cloud-adminを信頼しないか**という境界で選ぶ。[N1][G5]

### 6.2 Remote attestationと鍵の公開

```text
 image+kernel+driver+policy+hardware measurements
                  │
           attestation report
                  │
      verifier checks evidence, version,
          signer, TCB status, policy
                  │
             key broker
      release key ONLY if attested
                  │
          decrypt protected input
             inside TEE
```

これは理想化した**設計例**。実際のattestation対象（GPU firmware、CPU TEE、driver、container measurement）、鍵管理、revocation、パッチ反映のタイミングは各platformの実装とservice規約を確認する。**attestation可能＝model outputが正しい**ではない。

### 6.3 2026-10-21 Google Confidential G4 GA

GoogleはRTX PRO 6000 Blackwell Server Edition GPUのConfidential G4を、Compute Engine VM/GKE nodes向けに**36 zonesでGA**と発表。[G5] 代表的なモデルで通常G4に比べ**throughput低下3.5%未満**とのメーカー測定。別顧客からの引用にはlatency約5.2%増の例もある。**指標・負荷・計測主体が異なるので混同しない**。

**重要な制限**: GPUのconfidential modeがkernel/driverやhostのすべての脆弱性、agentの不適切なtool call、内側のmalicious codeを解決するわけではない。

### 6.4 NVIDIA Confidential Bare Metal

NVIDIAは10/21にConfidential Bare Metalを正式発表。Confidential Containers/VMsと並ぶ第三のdeployment optionと説明。[N1]

**目的**: cloud/neocloudの専用bare-metalを利用するmodel builderが、dedicated machine上で自分のhost software stackを運用しながら、模型の重みやデータを第三者cloud operatorから守ること。

比較は**GPU暗号化対応の有無だけでなく、trust-root、measurements、remote verifier、key release、firmware updates、failure modeとside-channelを含む**。信頼境界の違いを確認せず「virtualizationを使わない方が常に安全」と断定しない。

## 7. Agent securityとの分離

| 守る対象 | 必要なcontrol | Confidential GPUだけで十分か |
|---|---|---|
| クラウドoperatorからモデル/入力を隠す | TEE + attestation + keys | 適切な脅威モデルでは有効 |
| agentが外部サイトへ秘密を送信するのを止める | egress filter、tool policy、sandbox | **いいえ** |
| agentが許可外fileに書くのを止める | filesystem MAC/IAM/per-run identity | **いいえ** |
| local環境でinternet停止時も推論継続 | local control planeとoffline operations | **いいえ** |
| cloudのmetadataや支援者アクセスの統制 | residency、JIT、Customer Lockbox、監査 | **いいえ** |

NVIDIAのOpenShellはagent runtime/securityの別レイヤー。[N2] *機密計算*は不正な参照主体から秘密情報を守るが、**正当なTEE内のモデルが誤った判断を下すこと自体**を止める機能ではない。

## 8. 調達・構築意思決定マトリクス

| 業務要件 | 優先すべき方式 | 注意 |
|---|---|---|
| 地域限定のデータ保管が主 | Sovereign Public Cloud / data boundary | backup、telemetry、support accessの範囲を確認 |
| 24/7 offline、管理planeもLANのみ | Azure Local disconnected or GDC air-gapped | service coverage、update/DR/operator人員、契約適格性 |
| 外部cloudの計算力が必要、weights/IPは機密 | Confidential GPU VM/Confidential Bare Metal | attestationとkey-brokerを必ずPoC |
| 開発codeもlocalで管理 | GitHub Enterprise Local + local inference | 2026-10-24時点GA予定の機能あり |
| 機密文書のsemantic search | GDC enterprise search preview or Foundry Local agentic retrieval | Preview・GAの異同、RBACとindex deletion |
| オープンモデルの完全なoffline利用 | local inference with authorized model weights | license、dependency mirror、tokenizer、model distributionの明示 |
| 複数entity共同で機密モデルを学習 | Confidential Space等のmulti-party secure computing | 信頼モデル、attestation、data-use contractが必要 |

**どれが常に最良かは決められない**。許可されるtrust boundary、run cost、運用負担、DRにより正解が変わる。

## 9. 導入可否を証明する試験計画

**A. Data-flow & air-gap**: 90分通常運転+障害試験でfirewall/DNS/netflowを取得。allowlisted transfer route以外のexternal egressがない。support bundle、log sink、NTP、package updateを忘れない。

**B. RBAC & operator access**: local adminとvendor supportを別principalsとしてJIT申請→監査→取り消しまでテスト。特権者がaudit logを改変できないようにする。

**C. Attestation**: 正常imageと1要素だけ変更した失効/古いTCBのimageを比較。前者のみkey brokerが鍵を解放。Verifierがoffline利用できるか、TCB updateのtrust chainを検証。

**D. Model correctness**: 同じcheckpoint/precision/seed/context長でpublic cloud、confidential instance、local GPUの出力一致率とp95/99、throughput、cold startを測る。Confidential G4のベンダー3.5%は自分のSLOでの保証ではない。

**E. RAG permission**: low-privilege userにhigher-privilege documentがembedding/index経由で漏れないか、削除した文書が検索結果/citation/cacheから消えるかを確認。

**F. Isolation/DR**: internet遮断状態での管理plane/restart/backup/restore、証明書期限切れ・HSM障害・disk full・GPU driver mismatch。復旧時の操作権限とRTO/RPOを測定。

**G. Agent authorization**: 読取専用agentにwrite toolを要求させ、OS/IAMとagent harness双方で拒否を確認。情報流出はダミーdataと管理下のtest domainのみで検証。

### 成否基準の例

`Availability`: 目標SLOを満たす実測uptime; `Security`: unauthorized action success=0 in scoped test; `Confidentiality`: unauthorized key-release=0; `Auditability`: every privileged action assigned to run_id/owner; `Performance`: p95 task latencyとvalid tasks/$; `Resilience`: offline operationとRTO/RPOの達成。

ゼロ件の試験結果はすべての未知の攻撃に対する安全性を証明しない。test scopeと欠測を明記する。

## 10. 誤解しやすい組合せ

- **GDC Gemini 3.5 Flash GA / Enterprise Search Preview**: 同じGDC上でも提供状況が異なる。
- **Microsoft GitHub Enterprise Local GA予定 / Foundry Local GA予定**: 2026-10-20の発表はIgnite予定。2026-10-24にすでにGAと書かない。
- **Microsoft Managed HSM EKM GA**: data-at-restの外部KEK管理。TEE secure key releaseと同じではない。
- **Google Confidential G4 GA**: cloud GPU TEE。local air-gapped deploymentとは別。
- **Confidential Bare Metal architecture**: 新発表・導入計画を、全providerでの無条件GAとみなさない。
- **Sovereign region**: operatorの法的主体、keys、backup、loggingを確認しなければ完全なデータ主権とは言えない。
- **Customer-controlled weights**: model license、training data権利、tokenizer/runtime source配布の制約を別途確認する。

## 11. 更新判断

2026年11月のMicrosoft IgniteでGitHub Enterprise Local・Foundry LocalのGA実際のstatus、Azure Local disconnected transitionのPreview化、Google GDC searchのPreview→GA、Confidential Bare Metal SKUの配備とattestation API公開、Confidential G4の独立性能検証を更新トリガーとする。

## 12. Sources（一次情報と技術ドキュメント）

[M1] Microsoft, *Advancing digital sovereignty with greater control and choice*, 2026-10-20:
https://blogs.microsoft.com/blog/2026/10/20/advancing-digital-sovereignty-with-greater-control-and-choice/

[M2] Microsoft Learn, *Disconnected operations for Azure Local overview*:
https://learn.microsoft.com/en-us/azure/azure-local/manage/disconnected-operations-overview

[M3] Microsoft Learn, *Requirements for Foundry Local on Azure Local*:
https://learn.microsoft.com/en-us/azure/azure-sovereign-clouds/private/foundry-local/concept-requirements

[M4] Microsoft Learn, *What is Managed HSM external key management?*:
https://learn.microsoft.com/en-us/azure/key-vault/managed-hsm/external-key-management-overview

[G1] Google Cloud, *Google Cloud and NVIDIA expand co-engineering collaboration*, 2026-10-21:
https://cloud.google.com/blog/topics/ai-infrastructure/google-cloud-infrastructure-at-nvidia-gtc-berlin-2026

[G2] Google Cloud, *GDC at Next 26* (two deployment models), 2026-04-22:
https://cloud.google.com/blog/topics/hybrid-cloud/google-distributed-cloud-at-next26

[G3] Google Cloud, *The latest Google Distributed Cloud innovations*, 2026-10-20:
https://cloud.google.com/blog/topics/hybrid-cloud/new-innovations-in-google-distributed-cloud

[G4] Google Cloud, *Managed RAG Search inside the sovereign perimeter*, 2026-10-20:
https://cloud.google.com/blog/topics/hybrid-cloud/managed-rag-search-inside-the-sovereign-perimeter-gemini-on-gdc-enterprise-search/

[G5] Google Cloud, *Confidential G4 GPUs are GA*, 2026-10-21:
https://cloud.google.com/blog/topics/ai-infrastructure/confidential-g4-gpus-are-ga/

[N1] NVIDIA, *Confidential Computing Expands*, 2026-10-21:
https://blogs.nvidia.com/blog/confidential-computing-model-builders-infrastructure/

[N2] NVIDIA, *OpenShell Reference Architecture*, 2026-10-21:
https://nvidianews.nvidia.com/news/openshell-reference-architecture

---

**文書の役割**: `reports/llm-news/`配下のcurated技術資料。日次briefの既知topic判定は`topics/**/*.json`と`runs/**/*.jsonl`が行う。本資料はduplicate-control stateを更新しない。
