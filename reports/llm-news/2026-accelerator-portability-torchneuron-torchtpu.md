---
type: Curated Report
title: PyTorch Accelerator Portability in 2026 — TorchNeuron, TorchTPU, CUDA
description: Implementation-level comparison of Trainium and TPU native PyTorch backends, migration paths, limitations, benchmarking, security and cost.
status: current
scope: llm-news
created: 2026-10-24
source_window: 2026-04-07..2026-10-24
review_after: 2026-11-24
tags: [llm-news, pytorch, trainium, tpu, cuda, torchtpu, torchneuron, inference]
---

# PyTorchのGPU依存低減 — TorchNeuron / TorchTPU技術比較（2026年10月版）

[技術資料一覧](technical-dossiers-index.md) / [GTC Berlin総合資料](gtc-berlin-2026/README.md)

> 調査日: 2026-10-24 JST。**PyTorchプログラムが変更なしでコンパイル・正しく動作するか、性能が良いか、依存から自由になれるか**は別の問題である。移植性を「API移植性」「operator互換」「compiler/kernel性能」「分散処理」「運用/TCO」に分解して評価する。

## 1. 結論

2026年10月20日のPyTorch Conference期にAWSとGoogleは、異なるアクセラレータをPyTorchの**native device**として使いやすくする開発を具体化した。

- **AWS TorchNeuron**: Trainium2/3用、PyTorch PrivateUse1を通して`neuron` deviceを登録。eager、`torch.compile`、`torch.distributed`、`torch.profiler`、Neuron Kernel Interface (NKI)を提供。public beta。[P1][P2]
- **Google TorchTPU**: TPU向けに`torch_tpu`をOSS公開。eager、DeferAndFuse、`torch.compile`、PyTorch/ATen→StableHLO/XLA、Pallas kernel、vLLM/SGLang/TorchTitanのecosystemを整備。[P3][P4]
- **CUDAは消えない**: NVIDIA依存にはPyTorch device API以外にもCUDA拡張、cuDNN/cuBLAS/NCCL、Triton custom kernels、graph/runtime、事前調整済みtraining stackがある。native deviceでの基本実行は、これらの完全相互運用を意味しない。

## 2. 名称・提供状況の混同防止

| 用語 | 実体 | 状態 |
|---|---|---|
| PyTorch | framework全体 | 既存のupstream |
| PrivateUse1 | custom deviceの拡張点 | PyTorchによる汎用機構 |
| TorchNeuron / `torch-neuronx` | AWS Trainium2/3用backend | **public beta** 2026-10-20告知、10/15付release noteあり |
| AWS Neuron SDK | Trainium toolchain/driver/runtimeの総称 | TorchNeuronはその一部 |
| TorchTPU / `torch_tpu` | Google TPU native PyTorch backend | 10/20 OSS公開 |
| vLLM TorchTPU | vLLM用TPU platform plugin | 別repository・個別のsupport matrix |
| SGLang TorchTPU | SGLang用TPU backend | 別repository |
| llm-d | fleet-level inference orchestration/routing | backendとは別のrouting/serving software |
| TorchTitan | PyTorch distributed training reference | backendと統合されるframework |

### 既存設計に対する位置づけ

従来のPyTorch-on-XLA等が存在しても、TorchTPUの価値は「TPUが初めて使える」ことではなく、**標準PyTorch APIに直接近づけたdeviceとecosystemの導入**にある。同様にTrainiumは従来のNeuron toolchainが既に存在し、TorchNeuronは新しいnative path。

## 3. コンパイル経路の比較

```text
PyTorch model / nn.Module / training loop
       │
       ├── CUDA GPU             ATen / CUDA / compiler + vendor kernels
       │
       ├── TorchNeuron          PrivateUse1 -> eager OR torch.compile
       │                        Dynamo/FX/AOTAutograd -> Torch-MLIR
       │                        -> StableHLO -> Neuron compiler -> NEFF
       │
       └── TorchTPU             PyTorch ATen -> native TPU runtime
                                eager / DeferAndFuse / torch.compile
                                -> StableHLO / XLA + Pallas kernels
```

**TorchNeuron eager**: 個々のopを実行し、必要に応じてNEFF生成・HBM間の中間結果受け渡し。初回compileとkernel launch costが存在。adaptive eagerは複数op融合による負担軽減を狙うexperimental機能。[P1][P2]

**TorchTPU**: eagerデバッグとcompiled executionの2系統。DeferAndFuseでopをまとめる道を採る。shape動的変化によるXLA再コンパイルの抑制は重要な開発課題。[P3][P5]

**固定shapeと可変長**: 長いcontext、prefill/decode、可変batchでshapeが頻繁に変わるLLMでは、最初の1回だけの正解実行では性能判断ができない。padding/bucketing、KV caching、prefix reuseを含めて測る。

## 4. 移植例と落とし穴

### 4.1 純粋なPyTorch model

```python
import torch

# 有効なbackendがインストールされ、対応インスタンスで実行する前提。
# サンプルは概念例。device discovery、依存版は環境により異なる。
device = torch.device("neuron")  # AWS TorchNeuron
# device = torch.device("tpu")   # Google TorchTPU

model = MyModule().to(device)
x = sample_input.to(device)
with torch.no_grad():
    output = model(x)
```

このコードは*GPU/TPUのどちらでも直ちに実行成功することを保証しない*。パッケージの互換version、OS/driver、認識device、supported opsが必要。

### 4.2 compile

```python
# TorchNeuron 公式docsでの指定例。入力shapeを固定してベンチマーク。
compiled = torch.compile(model, backend="neuron", dynamic=False)
```

TorchTPUのcompileには対応PyTorch、`torch_tpu`のruntime、TPU-specific compiler環境が必要。単純に`backend="neuron"`を`tpu`へ置換すれば全部済むという主張はしない。

### 4.3 Operator・精度・layout

AWS repoの2026-10時点の制約[P2]:
- `torch.compile`はstatic shapes（`dynamic=False`）。shape変更で別compileが必要。
- contiguous tensor前提のpathがあり、非contiguousは追加copy。
- `float64`処理が`float32`になり得る。高精度科学計算では結果を検算。
- `int64`はop次第。FlexAttention等は部分対応。
- 初回compile時間、fallback、TorchAO等の未対応機能。adaptive eagerはexperimental。

Googleの場合も「Native PyTorch」が全ATen/op、すべての量子化・自作CUDA kernel、全platformで等価という意味ではない。**support matrixはproduct/release/TPU世代別に調べる**。[P4][P6]

### 4.4 CUDA専用コード

```python
# 移植しやすい: 標準torch.nn, tensor, supported ATen
# 移植が難しい: CUDA C++ extension, GPU-inline PTX,
#               特定Triton kernel, NCCL前提の通信、
#               CUDA Graphとmemory-layout想定
```

変換候補はAWS NKI、Google Pallas/Helionなど。ただしkernel書き換え・tiling・alignment tuning・性能回帰試験が必要になる。

## 5. Trainium/TorchNeuronを調べる順序

1. target instancesがTrn2/Trn3かを確認。
2. OS/platformを確認。AWS release notesではUbuntu 24.04/26.04、指定Python/PyTorch/Neuron SDKのversion一致が必要。[P7]
3. `torch-neuronx`のrelease notesと対応operatorsを確認。
4. trainingかservingかを分ける。vLLM NeuronとvLLM Omni Neuronは別のplugin。
5. minimal modelを実行しforward/backward correctnessを照合する。
6. compilation/cache、static sequence buckets、precision、distributed world sizeを固定してtimingを計測。
7. unsupported ops/CPU fallbackごとのwall time、`torch.profiler` + Neuron Explorerでhotspotを調べる。
8. CIでfailure caseと同じテストを繰り返す。

PyTorch公式発表には、10万件のHugging Faceモデルに対する代表構成のbroad sweep（利用量の99.9%を覆盖するとの会社説明）がある。ただし**100,000件すべてが任意設定でproduction-grade性能を出す**という証明ではない。[P1]

## 6. TPU/TorchTPUを調べる順序

1. TPU世代 v5e/v5p/v6e/v7（Ironwood）を特定。各プロジェクトのvalidated hardwareを確認。
2. `google-pytorch/torch_tpu`のREADME、Python/PyTorch/driver版本、installを確認。[P4]
3. eagerで正確性とprofileを確かめ、その後compile/batchingを検証。
4. inferenceでは`vllm-torchtpu`または`sglang-torchtpu`のsupport matrixを利用。普通のvLLMで動いたという一般化は不可。[P6][P8]
5. long context/prefix cachingの性能、prefill/decode分離、個別kernelの導入前後を測る。
6. distributed trainingはTorchTitan/FSDP、FP8/bfloat16等、checkpoint/optimizer correctnessを検証。
7. GKE/llm-dのfleet routingによる改善と、TPU kernel単体の改善を分離する。

Google公式記事はIronwood 8,192基規模での検証とQwen3 8Bで最大52% MFUと説明。特定のmodel・hardware・training設定での**メーカー/提携企業公表値**。すべてのモデルで同じMFUを期待してはいけない。[P3]

## 7. CUDA/NVIDIAとの競争をどう測るか

**比較対象はdeviceではなく1件の有効taskを終了させるtotal cost。**

| 指標 | 測定方法 | 必須条件 |
|---|---|---|
| Load/compile latency | cold start、cold/warm cacheを別に測定 | 同じモデル、version、shape |
| Token performance | prefill/decode tokens/s、TTFT、ITL、goodput | p95 latency SLO、batch、context長 |
| Correctness | token/embedding誤差、training loss収束 | precision・seed・sampling固定 |
| Reliability | job completion、worker failure recovery、checkpoint | 同じ期間・failure injection |
| Distributed efficiency | scaling curvesとstraggler影響 | network topology, world size |
| Porting effort | conversion工数 + unsupported ops + custom kernel | 技術者作業時間を記録 |
| Energy/cost | accepted tokens/ kWh、運用$ / million tokens | 利用料・予約割引・電力/施設費 |
| Dependency risk | driver compatibility、toolchain lock-in、再現性 | release cadence、license、upstream acceptance |

`Cost per successful agent task = (serving time + tool overhead + retries + orchestration + hardware finance) / successful tasks`

単純な`$/GPU-hour`比較や理論TFLOPSだけでは、long-horizon agentのコストは評価できない。GPU以外のtool/CPU処理が多ければ相対優位は変動する。

## 8. Vendor lock-inの実態

移植性を下げるものはCUDA APIそのものだけではない:
- 機種ごとのkernel実装とmemory tiling
- driver/compiler lockstep
- serving engineのbackend plugin/CI
- 分散通信用fabric、collectivesの実装
- graph compile cacheとcheckpoint format
- model/quantization/precisionの実装差
- cloud IAM、network、pricing、capacity reservation

**PrivateUse1は入口のAPI移植性**を改善するが、**optimized kernelsと供給網の競争**を消し去るものではない。backendごとのOSS公開とupstreamへのテスト追加は、長期的な移植の実務コストを下げる材料になる。

## 9. どれを採用するか

| 目的 | 比較すべき候補 | 判断材料 |
|---|---|---|
| GPUでの既存production維持 | CUDA + current PyTorch | 移植費と現行SLO |
| AWS Trainium採用検討 | TorchNeuron + Neuron SDK | ops coverage、cache、Trn2/3 availability |
| Cloud TPU採用 | TorchTPU + vLLM/SGLang TPU | Model/hardware support matrices |
| ハイブリッドcluster | llm-d/Kubernetes/portable model definitions | routing・identity・data movement |
| 長期モデル学習 | TorchTitan + backend別kernel | convergence・checkpoint・network |
| オンプレ/ローカル推論 | 対応hardwareでのnative runtime | weights license、memory、OS、cost |

**最小PoC**: 同一公開modelを3候補で動かす。1) 30-min correctness smoke、2) 5入力長×4並列数、3) 20回繰返しcold/warm、4) 30-min sustained serving、5) forced failure recovery。比較tableを保存し、「ベンダー説明」と「自分の計測」を分離する。

## 10. 更新・監視

- TorchNeuron beta→GA、`dynamic=True`、非contiguous、float64、TorchAO、fallback削減。
- TorchTPU supported op数、XLA recompilation、vLLM/SGLang support matrix、TPU v5/6/7各々の不具合修正。
- GPU対TPU対Trainiumでの**同条件での独立agent workload**性能。
- 何が実際の公開sourceになっているか（単に公開予定だったかではない）。
- 2026年11月以降の価格・予約capacity/トラブルを再確認。

## 11. 根拠・リンク

[P1] PyTorch Blog, TorchNeuron overview, 2026-10-19/20:
https://pytorch.org/blog/introducing-torchneuron-native-pytorch-backend-for-aws-trainium/

[P2] TorchNeuron public repository (README / API compatibility):
https://github.com/aws-neuron/torch-neuronx

[P3] Google Cloud TorchTPU OSS launch, 2026-10-20:
https://cloud.google.com/blog/topics/ai-infrastructure/torchtpu-is-now-open-source-run-native-pytorch-on-tpus/

[P4] TorchTPU source:
https://github.com/google-pytorch/torch_tpu

[P5] Google architecture background, 2026-04-07:
https://developers.googleblog.com/torchtpu-running-pytorch-natively-on-tpus-at-google-scale/

[P6] vLLM TorchTPU explanation and verified scope:
https://vllm-project.github.io/2026/10/20/vllm-torchtpu.html

[P7] AWS TorchNeuron release notes (release noted 2026-10-15):
https://github.com/aws-neuron/torch-neuronx/blob/main/release-notes/2.33.0.md

[P8] vLLM backend source:
https://github.com/vllm-project/vllm-torchtpu

[P9] Google developers vLLM/SGLang release:
https://developers.googleblog.com/announcing-new-vllm-and-sglang-inference-engines-on-tpu/

本資料はnews ledgerとは独立したcurated report。`topics/amazon/torchneuron/tooling_model_integration/2026-10-19.json`のduplicate policyは変更しない。
