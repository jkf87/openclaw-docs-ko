---
title: "Hetzner"
description: "내구성 있는 상태와 베이킹된 바이너리를 갖춘 저렴한 Hetzner VPS (Docker)에서 24/7 OpenClaw Gateway 실행"
---

# Hetzner에서의 OpenClaw (Docker, 프로덕션 VPS 가이드)

## 목표

내구성 있는 상태, 베이킹된 바이너리 및 안전한 재시작 동작을 갖춘 Docker를 사용하여 Hetzner VPS에서 영구적인 OpenClaw Gateway를 실행합니다.

"~$5에 24/7 OpenClaw"를 원한다면 이것이 가장 간단하고 신뢰할 수 있는 설정입니다.
Hetzner 가격은 변경됩니다. 가장 작은 Debian/Ubuntu VPS를 선택하고 OOM이 발생하면 확장합니다.

보안 모델 참고 사항:

- 회사 공유 에이전트는 모든 사람이 동일한 신뢰 경계에 있고 런타임이 비즈니스 전용인 경우 괜찮습니다.
- 엄격한 분리를 유지합니다: 전용 VPS/런타임 + 전용 계정; 해당 호스트에 개인 Apple/Google/브라우저/비밀번호 관리자 프로파일 없음.
- 사용자가 서로에게 적대적인 경우 게이트웨이/호스트/OS 사용자별로 분리합니다.

[보안](/gateway/security) 및 [VPS 호스팅](/vps)을 참조하십시오.

## 수행 작업 (간단한 용어)

- 소형 Linux 서버 임대 (Hetzner VPS)
- Docker 설치 (격리된 앱 런타임)
- Docker에서 OpenClaw Gateway 시작
- 호스트에서 `~/.openclaw` + `~/.openclaw/workspace` 지속 (재시작/재빌드 후에도 유지)
- SSH 터널을 통해 노트북에서 Control UI 액세스

해당 마운트된 `~/.openclaw` 상태에는 `openclaw.json`, 에이전트별 `agents/&lt;agentId&gt;/agent/auth-profiles.json` 및 `.env`가 포함됩니다.

Gateway는 다음을 통해 액세스할 수 있습니다:

- 노트북에서 SSH 포트 포워딩
- 방화벽 및 토큰을 직접 관리하는 경우 직접 포트 노출

이 가이드는 Hetzner에서 Ubuntu 또는 Debian을 가정합니다.
다른 Linux VPS를 사용하는 경우 패키지를 적절히 매핑합니다.
일반 Docker 흐름은 [Docker](/install/docker)를 참조하십시오.

---

## 빠른 경로 (숙련된 운영자)

1. Hetzner VPS 프로비저닝
2. Docker 설치
3. OpenClaw 저장소 복제
4. 지속 호스트 디렉터리 생성
5. `.env` 및 `docker-compose.yml` 구성
6. 이미지에 필요한 바이너리 베이킹
7. `docker compose up -d`
8. 지속성 및 Gateway 액세스 확인

---

## 필요 사항

- 루트 액세스가 있는 Hetzner VPS
- 노트북에서 SSH 액세스
- SSH + 복사/붙여넣기에 대한 기본적인 편안함
- 약 20분
- Docker 및 Docker Compose
- 모델 인증 자격 증명
- 선택적 제공자 자격 증명
  - WhatsApp QR
  - Telegram 봇 토큰
  - Gmail OAuth

---

1. **VPS 프로비저닝**

   Hetzner에서 Ubuntu 또는 Debian VPS를 생성합니다.
   
       루트로 연결:
   
       ```bash
       ssh root@YOUR_VPS_IP
       ```
   
       이 가이드는 VPS가 상태 유지인 것으로 가정합니다.
       일회용 인프라로 취급하지 마십시오.


  2. **Docker 설치 (VPS에서)**

   ```bash
       apt-get update
       apt-get install -y git curl ca-certificates
       curl -fsSL https://get.docker.com | sh
       ```
   
       확인:
   
       ```bash
       docker --version
       docker compose version
       ```


  3. **OpenClaw 저장소 복제**

   ```bash
       git clone https://github.com/openclaw/openclaw.git
       cd openclaw
       ```
   
       이 가이드는 바이너리 지속성을 보장하기 위해 사용자 정의 이미지를 빌드하는 것으로 가정합니다.


  4. **지속 호스트 디렉터리 생성**

   Docker 컨테이너는 임시입니다.
       모든 장기 상태는 호스트에 있어야 합니다.
   
       ```bash
       mkdir -p /root/.openclaw/workspace
   
       # 컨테이너 사용자에게 소유권 설정 (uid 1000):
       chown -R 1000:1000 /root/.openclaw
       ```


  5. **환경 변수 구성**

   저장소 루트에 `.env`를 생성합니다.
   
       ```bash
       OPENCLAW_IMAGE=openclaw:latest
       OPENCLAW_GATEWAY_TOKEN=change-me-now
       OPENCLAW_GATEWAY_BIND=lan
       OPENCLAW_GATEWAY_PORT=18789
   
       OPENCLAW_CONFIG_DIR=/root/.openclaw
       OPENCLAW_WORKSPACE_DIR=/root/.openclaw/workspace
   
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
       `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-profiles.json`에 있습니다.


  6. **Docker Compose 구성**

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
             # 권장: VPS에서 Gateway를 루프백 전용으로 유지하고 SSH 터널을 통해 액세스합니다.
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


  7. **공유 Docker VM 런타임 단계**

   일반적인 Docker 호스트 흐름을 위해 공유 런타임 가이드를 사용합니다:
   
       - [이미지에 필요한 바이너리 베이킹](/install/docker-vm-runtime#bake-required-binaries-into-the-image)
       - [빌드 및 실행](/install/docker-vm-runtime#build-and-launch)
       - [지속 위치](/install/docker-vm-runtime#what-persists-where)
       - [업데이트](/install/docker-vm-runtime#updates)


  8. **Hetzner 특정 액세스**

   공유 빌드 및 실행 단계 후 노트북에서 터널을 연결합니다:
   
       ```bash
       ssh -N -L 18789:127.0.0.1:18789 root@YOUR_VPS_IP
       ```
   
       열기:
   
       `http://127.0.0.1:18789/`
   
       구성된 공유 시크릿을 붙여넣습니다. 이 가이드는 기본적으로 게이트웨이 토큰을 사용합니다. 비밀번호 인증으로 전환한 경우 해당 비밀번호를 사용합니다.


공유 지속성 맵은 [Docker VM 런타임](/install/docker-vm-runtime#what-persists-where)에 있습니다.

## 코드로서의 인프라 (Terraform)

인프라 코드 워크플로우를 선호하는 팀을 위해 커뮤니티에서 유지 관리하는 Terraform 설정이 다음을 제공합니다:

- 원격 상태 관리가 포함된 모듈식 Terraform 구성
- cloud-init을 통한 자동화된 프로비저닝
- 배포 스크립트 (부트스트랩, 배포, 백업/복원)
- 보안 강화 (방화벽, UFW, SSH 전용 액세스)
- 게이트웨이 액세스를 위한 SSH 터널 구성

**저장소:**

- 인프라: [openclaw-terraform-hetzner](https://github.com/andreesg/openclaw-terraform-hetzner)
- Docker 구성: [openclaw-docker-config](https://github.com/andreesg/openclaw-docker-config)

이 접근 방식은 재현 가능한 배포, 버전 관리 인프라 및 자동화된 재해 복구를 통해 위의 Docker 설정을 보완합니다.

> **참고:** 커뮤니티에서 유지 관리합니다. 문제나 기여는 위의 저장소 링크를 참조하십시오.

## 다음 단계

- 메시징 채널 설정: [채널](/channels)
- Gateway 구성: [Gateway 구성](/gateway/configuration)
- OpenClaw를 최신 상태로 유지: [업데이트](/install/updating)
