---
title: "Kubernetes"
description: "Kustomize를 사용하여 Kubernetes 클러스터에 OpenClaw Gateway 배포"
---

# Kubernetes에서의 OpenClaw

Kubernetes에서 OpenClaw를 실행하기 위한 최소한의 시작점입니다. 프로덕션 준비 배포가 아닙니다. 핵심 리소스를 다루며 환경에 맞게 조정하도록 설계되었습니다.

## Helm이 아닌 이유?

OpenClaw는 일부 구성 파일이 있는 단일 컨테이너입니다. 흥미로운 커스터마이즈는 에이전트 콘텐츠(마크다운 파일, 스킬, 구성 재정의)에 있지 인프라 템플릿이 아닙니다. Kustomize는 Helm 차트의 오버헤드 없이 오버레이를 처리합니다. 배포가 더 복잡해지면 이러한 매니페스트 위에 Helm 차트를 레이어링할 수 있습니다.

## 필요 사항

- 실행 중인 Kubernetes 클러스터 (AKS, EKS, GKE, k3s, kind, OpenShift 등)
- 클러스터에 연결된 `kubectl`
- 최소 하나의 모델 제공자의 API 키

## 빠른 시작

```bash
# 제공자로 교체: ANTHROPIC, GEMINI, OPENAI 또는 OPENROUTER
export &lt;PROVIDER&gt;_API_KEY="..."
./scripts/k8s/deploy.sh

kubectl port-forward svc/openclaw 18789:18789 -n openclaw
open http://localhost:18789
```

Control UI에 대한 구성된 공유 시크릿을 검색합니다. 이 배포 스크립트는 기본적으로 토큰 인증을 생성합니다:

```bash
kubectl get secret openclaw-secrets -n openclaw -o jsonpath='{.data.OPENCLAW_GATEWAY_TOKEN}' | base64 -d
```

로컬 디버깅을 위해 `./scripts/k8s/deploy.sh --show-token`은 배포 후 토큰을 출력합니다.

## Kind로 로컬 테스트

클러스터가 없는 경우 [Kind](https://kind.sigs.k8s.io/)로 로컬에서 생성합니다:

```bash
./scripts/k8s/create-kind.sh           # docker 또는 podman 자동 감지
./scripts/k8s/create-kind.sh --delete  # 해체
```

그런 다음 `./scripts/k8s/deploy.sh`로 평소대로 배포합니다.

## 단계별

### 1) 배포

**옵션 A** — 환경에서 API 키 (한 단계):

```bash
# 제공자로 교체: ANTHROPIC, GEMINI, OPENAI 또는 OPENROUTER
export &lt;PROVIDER&gt;_API_KEY="..."
./scripts/k8s/deploy.sh
```

스크립트는 API 키와 자동 생성된 게이트웨이 토큰이 포함된 Kubernetes Secret을 생성한 다음 배포합니다. Secret이 이미 존재하는 경우 현재 게이트웨이 토큰과 변경되지 않는 제공자 키를 보존합니다.

**옵션 B** — Secret을 별도로 생성:

```bash
export &lt;PROVIDER&gt;_API_KEY="..."
./scripts/k8s/deploy.sh --create-secret
./scripts/k8s/deploy.sh
```

로컬 테스트를 위해 토큰이 stdout에 출력되길 원한다면 두 명령 중 하나와 함께 `--show-token`을 사용합니다.

### 2) 게이트웨이 액세스

```bash
kubectl port-forward svc/openclaw 18789:18789 -n openclaw
open http://localhost:18789
```

## 배포 내용

```
네임스페이스: openclaw (OPENCLAW_NAMESPACE를 통해 구성 가능)
├── Deployment/openclaw        # 단일 파드, 초기화 컨테이너 + 게이트웨이
├── Service/openclaw           # 포트 18789의 ClusterIP
├── PersistentVolumeClaim      # 에이전트 상태 및 구성을 위한 10Gi
├── ConfigMap/openclaw-config  # openclaw.json + AGENTS.md
└── Secret/openclaw-secrets    # 게이트웨이 토큰 + API 키
```

## 커스터마이즈

### 에이전트 지침

`scripts/k8s/manifests/configmap.yaml`의 `AGENTS.md`를 편집하고 재배포합니다:

```bash
./scripts/k8s/deploy.sh
```

### 게이트웨이 구성

`scripts/k8s/manifests/configmap.yaml`의 `openclaw.json`을 편집합니다. 전체 참조는 [Gateway 구성](/gateway/configuration)을 참조하십시오.

### 제공자 추가

추가 키를 내보내고 재실행합니다:

```bash
export ANTHROPIC_API_KEY="..."
export OPENAI_API_KEY="..."
./scripts/k8s/deploy.sh --create-secret
./scripts/k8s/deploy.sh
```

기존 제공자 키는 덮어쓰지 않는 한 Secret에 유지됩니다.

또는 Secret을 직접 패치합니다:

```bash
kubectl patch secret openclaw-secrets -n openclaw \
  -p '{"stringData":{"&lt;PROVIDER&gt;_API_KEY":"..."}}'
kubectl rollout restart deployment/openclaw -n openclaw
```

### 사용자 정의 네임스페이스

```bash
OPENCLAW_NAMESPACE=my-namespace ./scripts/k8s/deploy.sh
```

### 사용자 정의 이미지

`scripts/k8s/manifests/deployment.yaml`의 `image` 필드를 편집합니다:

```yaml
image: ghcr.io/openclaw/openclaw:latest # 또는 https://github.com/openclaw/openclaw/releases의 특정 버전 고정
```

### 포트 포워딩 이상으로 노출

기본 매니페스트는 파드 내부에서 게이트웨이를 루프백에 바인딩합니다. 이는 `kubectl port-forward`와 함께 작동하지만 파드 IP에 도달해야 하는 Kubernetes `Service` 또는 Ingress 경로에서는 작동하지 않습니다.

Ingress 또는 로드 밸런서를 통해 게이트웨이를 노출하려는 경우:

- `scripts/k8s/manifests/configmap.yaml`의 게이트웨이 바인드를 `loopback`에서 배포 모델과 일치하는 비루프백 바인드로 변경합니다
- 게이트웨이 인증을 활성화 상태로 유지하고 적절한 TLS 종료 진입점을 사용합니다
- 지원되는 웹 보안 모델을 사용하여 원격 액세스를 위한 Control UI를 구성합니다 (예: 필요한 경우 HTTPS/Tailscale Serve 및 명시적 허용된 오리진)

## 재배포

```bash
./scripts/k8s/deploy.sh
```

이는 모든 매니페스트를 적용하고 구성 또는 시크릿 변경 사항을 적용하기 위해 파드를 재시작합니다.

## 해체

```bash
./scripts/k8s/deploy.sh --delete
```

이는 PVC를 포함한 네임스페이스 및 그 안의 모든 리소스를 삭제합니다.

## 아키텍처 참고 사항

- 게이트웨이는 기본적으로 파드 내부에서 루프백에 바인딩되므로 포함된 설정은 `kubectl port-forward`용입니다
- 클러스터 범위 리소스 없음 — 모든 것이 단일 네임스페이스에 있습니다
- 보안: `readOnlyRootFilesystem`, `drop: ALL` 기능, 비루트 사용자 (UID 1000)
- 기본 구성은 Control UI를 더 안전한 로컬 액세스 경로로 유지합니다: 루프백 바인딩 및 `http://127.0.0.1:18789`에 대한 `kubectl port-forward`
- 로컬호스트 액세스를 벗어나는 경우 지원되는 원격 모델을 사용합니다: HTTPS/Tailscale과 적절한 게이트웨이 바인드 및 Control UI 오리진 설정
- 시크릿은 임시 디렉터리에서 생성되어 클러스터에 직접 적용됩니다. 저장소 체크아웃에는 시크릿 자료가 기록되지 않습니다

## 파일 구조

```
scripts/k8s/
├── deploy.sh                   # 네임스페이스 + 시크릿 생성, kustomize를 통해 배포
├── create-kind.sh              # 로컬 Kind 클러스터 (docker/podman 자동 감지)
└── manifests/
    ├── kustomization.yaml      # Kustomize 기반
    ├── configmap.yaml          # openclaw.json + AGENTS.md
    ├── deployment.yaml         # 보안 강화가 포함된 파드 스펙
    ├── pvc.yaml                # 10Gi 지속 스토리지
    └── service.yaml            # 18789의 ClusterIP
```
