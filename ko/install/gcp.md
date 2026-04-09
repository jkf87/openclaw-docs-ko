---
summary: "내구성 있는 상태를 갖춘 GCP Compute Engine VM (Docker)에서 24/7 OpenClaw Gateway 실행"
read_when:
  - GCP에서 24/7 OpenClaw를 실행하려는 경우
  - 자체 VM에서 프로덕션 수준의 상시 가동 Gateway를 원하는 경우
  - 지속성, 바이너리 및 재시작 동작에 대한 완전한 제어를 원하는 경우
title: "GCP"
---

# GCP Compute Engine에서의 OpenClaw (Docker, 프로덕션 VPS 가이드)

## 목표

내구성 있는 상태, 베이킹된 바이너리 및 안전한 재시작 동작을 갖춘 Docker를 사용하여 GCP Compute Engine VM에서 영구적인 OpenClaw Gateway를 실행합니다.

"월 ~$5-12에 24/7 OpenClaw"를 원한다면 이것이 Google Cloud에서 신뢰할 수 있는 설정입니다.
가격은 머신 유형 및 지역에 따라 다릅니다. 작업 부하에 맞는 가장 작은 VM을 선택하고 OOM이 발생하면 확장합니다.

## 수행 작업 (간단한 용어)

- GCP 프로젝트 생성 및 결제 활성화
- Compute Engine VM 생성
- Docker 설치 (격리된 앱 런타임)
- Docker에서 OpenClaw Gateway 시작
- 호스트에서 `~/.openclaw` + `~/.openclaw/workspace` 지속 (재시작/재빌드 후에도 유지)
- SSH 터널을 통해 노트북에서 Control UI 액세스

해당 마운트된 `~/.openclaw` 상태에는 `openclaw.json`, 에이전트별 `agents/<agentId>/agent/auth-profiles.json` 및 `.env`가 포함됩니다.

Gateway는 다음을 통해 액세스할 수 있습니다:

- 노트북에서 SSH 포트 포워딩
- 방화벽 및 토큰을 직접 관리하는 경우 직접 포트 노출

이 가이드는 GCP Compute Engine에서 Debian을 사용합니다.
Ubuntu도 작동합니다. 패키지를 적절히 매핑합니다.
일반 Docker 흐름은 [Docker](/install/docker)를 참조하십시오.

---

## 빠른 경로 (숙련된 운영자)

1. GCP 프로젝트 생성 + Compute Engine API 활성화
2. Compute Engine VM 생성 (e2-small, Debian 12, 20GB)
3. VM에 SSH 접속
4. Docker 설치
5. OpenClaw 저장소 복제
6. 지속 호스트 디렉터리 생성
7. `.env` 및 `docker-compose.yml` 구성
8. 필요한 바이너리 베이킹, 빌드 및 실행

---

## 필요 사항

- GCP 계정 (e2-micro 무료 티어 사용 가능)
- gcloud CLI 설치 (또는 Cloud Console 사용)
- 노트북에서 SSH 액세스
- SSH + 복사/붙여넣기에 대한 기본적인 편안함
- 약 20-30분
- Docker 및 Docker Compose
- 모델 인증 자격 증명
- 선택적 제공자 자격 증명
  - WhatsApp QR
  - Telegram 봇 토큰
  - Gmail OAuth

---

<Steps>
  <Step title="gcloud CLI 설치 (또는 Console 사용)">
    **옵션 A: gcloud CLI** (자동화에 권장)

    [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)에서 설치

    초기화 및 인증:

    ```bash
    gcloud init
    gcloud auth login
    ```

    **옵션 B: Cloud Console**

    [https://console.cloud.google.com](https://console.cloud.google.com)의 웹 UI를 통해 모든 단계를 수행할 수 있습니다.

  </Step>

  <Step title="GCP 프로젝트 생성">
    **CLI:**

    ```bash
    gcloud projects create my-openclaw-project --name="OpenClaw Gateway"
    gcloud config set project my-openclaw-project
    ```

    [https://console.cloud.google.com/billing](https://console.cloud.google.com/billing)에서 결제를 활성화합니다 (Compute Engine에 필요).

    Compute Engine API 활성화:

    ```bash
    gcloud services enable compute.googleapis.com
    ```

    **Console:**

    1. IAM & Admin > Create Project로 이동
    2. 이름을 지정하고 생성
    3. 프로젝트에 대한 결제 활성화
    4. APIs & Services > Enable APIs > "Compute Engine API" 검색 > 활성화

  </Step>

  <Step title="VM 생성">
    **머신 유형:**

    | 유형      | 사양                     | 비용               | 참고 사항                                            |
    | --------- | ------------------------ | ------------------ | ---------------------------------------------------- |
    | e2-medium | 2 vCPU, 4GB RAM          | ~월 $25            | 로컬 Docker 빌드에 가장 신뢰할 수 있음              |
    | e2-small  | 2 vCPU, 2GB RAM          | ~월 $12            | Docker 빌드에 최소 권장 사항                         |
    | e2-micro  | 2 vCPU (공유), 1GB RAM   | 무료 티어 사용 가능 | Docker 빌드 OOM (종료 코드 137)으로 자주 실패        |

    **CLI:**

    ```bash
    gcloud compute instances create openclaw-gateway \
      --zone=us-central1-a \
      --machine-type=e2-small \
      --boot-disk-size=20GB \
      --image-family=debian-12 \
      --image-project=debian-cloud
    ```

    **Console:**

    1. Compute Engine > VM instances > Create instance로 이동
    2. 이름: `openclaw-gateway`
    3. 지역: `us-central1`, 존: `us-central1-a`
    4. 머신 유형: `e2-small`
    5. 부트 디스크: Debian 12, 20GB
    6. 생성

  </Step>

  <Step title="VM에 SSH 접속">
    **CLI:**

    ```bash
    gcloud compute ssh openclaw-gateway --zone=us-central1-a
    ```

    **Console:**

    Compute Engine 대시보드에서 VM 옆의 "SSH" 버튼을 클릭합니다.

    참고: SSH 키 전파는 VM 생성 후 1-2분이 걸릴 수 있습니다. 연결이 거부되면 기다렸다가 재시도합니다.

  </Step>

  <Step title="Docker 설치 (VM에서)">
    ```bash
    sudo apt-get update
    sudo apt-get install -y git curl ca-certificates
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    ```

    그룹 변경이 적용되도록 로그아웃 후 다시 로그인합니다:

    ```bash
    exit
    ```

    그런 다음 다시 SSH 접속:

    ```bash
    gcloud compute ssh openclaw-gateway --zone=us-central1-a
    ```

    확인:

    ```bash
    docker --version
    docker compose version
    ```

  </Step>

  <Step title="OpenClaw 저장소 복제">
    ```bash
    git clone https://github.com/openclaw/openclaw.git
    cd openclaw
    ```

    이 가이드는 바이너리 지속성을 보장하기 위해 사용자 정의 이미지를 빌드하는 것으로 가정합니다.

  </Step>

  <Step title="지속 호스트 디렉터리 생성">
    Docker 컨테이너는 임시입니다.
    모든 장기 상태는 호스트에 있어야 합니다.

    ```bash
    mkdir -p ~/.openclaw
    mkdir -p ~/.openclaw/workspace
    ```

  </Step>

  <Step title="환경 변수 구성">
    저장소 루트에 `.env`를 생성합니다.

    ```bash
    OPENCLAW_IMAGE=openclaw:latest
    OPENCLAW_GATEWAY_TOKEN=change-me-now
    OPENCLAW_GATEWAY_BIND=lan
    OPENCLAW_GATEWAY_PORT=18789

    OPENCLAW_CONFIG_DIR=/home/$USER/.openclaw
    OPENCLAW_WORKSPACE_DIR=/home/$USER/.openclaw/workspace

    GOG_KEYRING_PASSWORD=change-me-now
    XDG_CONFIG_HOME=/home/node/.openclaw
    ```

    강력한 시크릿 생성:

    ```bash
    openssl rand -hex 32
    ```

    **이 파일을 커밋하지 마십시오.**

    이 `.env` 파일은 `OPENCLAW_GATEWAY_TOKEN`과 같은 컨테이너/런타임 환경 변수용입니다.
    저장된 제공자 OAuth/API 키 인증은 마운트된
    `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`에 있습니다.

  </Step>

  <Step title="Docker Compose 구성">
    `docker-compose.yml`을 생성하거나 업데이트합니다.

    ```yaml
    services:
      openclaw-gateway:
        image: ${OPENCLAW_IMAGE}
        build: .
        restart: unless-stopped
        env_file:
          - .env
        environment:
          - HOME=/home/node
          - NODE_ENV=production
          - TERM=xterm-256color
          - OPENCLAW_GATEWAY_BIND=${OPENCLAW_GATEWAY_BIND}
          - OPENCLAW_GATEWAY_PORT=${OPENCLAW_GATEWAY_PORT}
          - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
          - GOG_KEYRING_PASSWORD=${GOG_KEYRING_PASSWORD}
          - XDG_CONFIG_HOME=${XDG_CONFIG_HOME}
          - PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
        volumes:
          - ${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
          - ${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
        ports:
          # 권장: VM에서 Gateway를 루프백 전용으로 유지하고 SSH 터널을 통해 액세스합니다.
          # 공개적으로 노출하려면 `127.0.0.1:` 접두사를 제거하고 방화벽을 적절히 설정합니다.
          - "127.0.0.1:${OPENCLAW_GATEWAY_PORT}:18789"
        command:
          [
            "node",
            "dist/index.js",
            "gateway",
            "--bind",
            "${OPENCLAW_GATEWAY_BIND}",
            "--port",
            "${OPENCLAW_GATEWAY_PORT}",
            "--allow-unconfigured",
          ]
    ```

    `--allow-unconfigured`는 부트스트랩 편의를 위한 것일 뿐, 적절한 게이트웨이 구성의 대체가 아닙니다. 여전히 인증(`gateway.auth.token` 또는 비밀번호)을 설정하고 배포에 안전한 바인드 설정을 사용합니다.

  </Step>

  <Step title="공유 Docker VM 런타임 단계">
    일반적인 Docker 호스트 흐름을 위해 공유 런타임 가이드를 사용합니다:

    - [이미지에 필요한 바이너리 베이킹](/install/docker-vm-runtime#bake-required-binaries-into-the-image)
    - [빌드 및 실행](/install/docker-vm-runtime#build-and-launch)
    - [지속 위치](/install/docker-vm-runtime#what-persists-where)
    - [업데이트](/install/docker-vm-runtime#updates)

  </Step>

  <Step title="GCP 특정 실행 참고 사항">
    GCP에서 `pnpm install --frozen-lockfile` 중에 `Killed` 또는 종료 코드 137로 빌드가 실패하면 VM의 메모리가 부족합니다. 최소 `e2-small`을 사용하거나 더 신뢰할 수 있는 첫 번째 빌드를 위해 `e2-medium`을 사용합니다.

    LAN에 바인딩할 때(`OPENCLAW_GATEWAY_BIND=lan`), 계속하기 전에 신뢰할 수 있는 브라우저 오리진을 구성합니다:

    ```bash
    docker compose run --rm openclaw-cli config set gateway.controlUi.allowedOrigins '["http://127.0.0.1:18789"]' --strict-json
    ```

    게이트웨이 포트를 변경한 경우 `18789`를 구성된 포트로 교체합니다.

  </Step>

  <Step title="노트북에서 액세스">
    Gateway 포트를 전달하는 SSH 터널 생성:

    ```bash
    gcloud compute ssh openclaw-gateway --zone=us-central1-a -- -L 18789:127.0.0.1:18789
    ```

    브라우저에서 열기:

    `http://127.0.0.1:18789/`

    깨끗한 대시보드 링크 재출력:

    ```bash
    docker compose run --rm openclaw-cli dashboard --no-open
    ```

    UI에서 공유 시크릿 인증을 요청하면 구성된 토큰 또는 비밀번호를 Control UI 설정에 붙여넣습니다. 이 Docker 흐름은 기본적으로 토큰을 씁니다. 컨테이너 구성을 비밀번호 인증으로 전환한 경우 해당 비밀번호를 사용합니다.

    Control UI에 `unauthorized` 또는 `disconnected (1008): pairing required`가 표시되면 브라우저 장치를 승인합니다:

    ```bash
    docker compose run --rm openclaw-cli devices list
    docker compose run --rm openclaw-cli devices approve <requestId>
    ```

    공유 지속성 및 업데이트 참조가 필요한 경우
    [Docker VM 런타임](/install/docker-vm-runtime#what-persists-where) 및 [Docker VM 런타임 업데이트](/install/docker-vm-runtime#updates)를 참조하십시오.

  </Step>
</Steps>

---

## 문제 해결

**SSH 연결 거부됨**

SSH 키 전파는 VM 생성 후 1-2분이 걸릴 수 있습니다. 기다렸다가 재시도합니다.

**OS 로그인 문제**

OS 로그인 프로파일 확인:

```bash
gcloud compute os-login describe-profile
```

계정에 필요한 IAM 권한(Compute OS Login 또는 Compute OS Admin Login)이 있는지 확인합니다.

**메모리 부족 (OOM)**

Docker 빌드가 `Killed` 및 종료 코드 137로 실패하면 VM이 OOM 종료된 것입니다. e2-small(최소) 또는 e2-medium(신뢰할 수 있는 로컬 빌드에 권장)으로 업그레이드합니다:

```bash
# VM을 먼저 중지
gcloud compute instances stop openclaw-gateway --zone=us-central1-a

# 머신 유형 변경
gcloud compute instances set-machine-type openclaw-gateway \
  --zone=us-central1-a \
  --machine-type=e2-small

# VM 시작
gcloud compute instances start openclaw-gateway --zone=us-central1-a
```

---

## 서비스 계정 (보안 모범 사례)

개인 사용의 경우 기본 사용자 계정으로 충분합니다.

자동화 또는 CI/CD 파이프라인의 경우 최소 권한을 가진 전용 서비스 계정을 생성합니다:

1. 서비스 계정 생성:

   ```bash
   gcloud iam service-accounts create openclaw-deploy \
     --display-name="OpenClaw Deployment"
   ```

2. Compute Instance Admin 역할(또는 더 좁은 사용자 정의 역할) 부여:

   ```bash
   gcloud projects add-iam-policy-binding my-openclaw-project \
     --member="serviceAccount:openclaw-deploy@my-openclaw-project.iam.gserviceaccount.com" \
     --role="roles/compute.instanceAdmin.v1"
   ```

자동화에 Owner 역할을 사용하지 마십시오. 최소 권한 원칙을 사용합니다.

IAM 역할 세부 정보는 [https://cloud.google.com/iam/docs/understanding-roles](https://cloud.google.com/iam/docs/understanding-roles)를 참조하십시오.

---

## 다음 단계

- 메시징 채널 설정: [채널](/channels/)
- 로컬 장치를 노드로 페어링: [노드](/nodes/)
- Gateway 구성: [Gateway 구성](/gateway/configuration)
