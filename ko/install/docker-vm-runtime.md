---
summary: "장기 실행 OpenClaw Gateway 호스트를 위한 공유 Docker VM 런타임 단계"
read_when:
  - Docker를 사용하여 클라우드 VM에 OpenClaw를 배포하는 경우
  - 공유 바이너리 베이킹, 지속성 및 업데이트 흐름이 필요한 경우
title: "Docker VM 런타임"
---

# Docker VM 런타임

GCP, Hetzner 및 유사한 VPS 제공자와 같은 VM 기반 Docker 설치를 위한 공유 런타임 단계입니다.

## 이미지에 필요한 바이너리 베이킹

실행 중인 컨테이너 내에 바이너리를 설치하는 것은 함정입니다.
런타임에 설치된 모든 것은 재시작 시 손실됩니다.

스킬에 필요한 모든 외부 바이너리는 이미지 빌드 시에 설치해야 합니다.

아래 예제는 세 가지 일반적인 바이너리만 보여줍니다:

- Gmail 액세스를 위한 `gog`
- Google Places를 위한 `goplaces`
- WhatsApp을 위한 `wacli`

이것은 예제일 뿐이며 완전한 목록이 아닙니다.
동일한 패턴을 사용하여 필요한 만큼 많은 바이너리를 설치할 수 있습니다.

나중에 추가 바이너리에 의존하는 새 스킬을 추가하는 경우:

1. Dockerfile 업데이트
2. 이미지 재빌드
3. 컨테이너 재시작

**Dockerfile 예제**

```dockerfile
FROM node:24-bookworm

RUN apt-get update && apt-get install -y socat && rm -rf /var/lib/apt/lists/*

# 예제 바이너리 1: Gmail CLI
RUN curl -L https://github.com/steipete/gog/releases/latest/download/gog_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/gog

# 예제 바이너리 2: Google Places CLI
RUN curl -L https://github.com/steipete/goplaces/releases/latest/download/goplaces_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/goplaces

# 예제 바이너리 3: WhatsApp CLI
RUN curl -L https://github.com/steipete/wacli/releases/latest/download/wacli_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/wacli

# 동일한 패턴을 사용하여 아래에 더 많은 바이너리 추가

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node","dist/index.js"]
```

<Note>
위의 다운로드 URL은 x86_64(amd64)용입니다. ARM 기반 VM(예: Hetzner ARM, GCP Tau T2A)의 경우 각 도구의 릴리즈 페이지에서 적절한 ARM64 변형으로 다운로드 URL을 교체합니다.
</Note>

## 빌드 및 실행

```bash
docker compose build
docker compose up -d openclaw-gateway
```

`pnpm install --frozen-lockfile` 중에 `Killed` 또는 종료 코드 137로 빌드가 실패하면 VM의 메모리가 부족합니다.
재시도 전에 더 큰 머신 클래스를 사용하십시오.

바이너리 확인:

```bash
docker compose exec openclaw-gateway which gog
docker compose exec openclaw-gateway which goplaces
docker compose exec openclaw-gateway which wacli
```

예상 출력:

```
/usr/local/bin/gog
/usr/local/bin/goplaces
/usr/local/bin/wacli
```

Gateway 확인:

```bash
docker compose logs -f openclaw-gateway
```

예상 출력:

```
[gateway] listening on ws://0.0.0.0:18789
```

## 지속 위치

OpenClaw는 Docker에서 실행되지만 Docker는 단일 진실 공급원이 아닙니다.
모든 장기 상태는 재시작, 재빌드 및 재부팅을 견뎌야 합니다.

| 구성 요소           | 위치                              | 지속 메커니즘          | 참고 사항                                                         |
| ------------------- | --------------------------------- | ---------------------- | ------------------------------------------------------------- |
| Gateway 구성        | `/home/node/.openclaw/`           | 호스트 볼륨 마운트     | `openclaw.json`, `.env` 포함                                  |
| 모델 인증 프로파일  | `/home/node/.openclaw/agents/`    | 호스트 볼륨 마운트     | `agents/<agentId>/agent/auth-profiles.json` (OAuth, API 키)  |
| 스킬 구성           | `/home/node/.openclaw/skills/`    | 호스트 볼륨 마운트     | 스킬 수준 상태                                                |
| 에이전트 작업 공간  | `/home/node/.openclaw/workspace/` | 호스트 볼륨 마운트     | 코드 및 에이전트 아티팩트                                     |
| WhatsApp 세션       | `/home/node/.openclaw/`           | 호스트 볼륨 마운트     | QR 로그인 보존                                                |
| Gmail 키링          | `/home/node/.openclaw/`           | 호스트 볼륨 + 비밀번호 | `GOG_KEYRING_PASSWORD` 필요                                   |
| 외부 바이너리       | `/usr/local/bin/`                 | Docker 이미지          | 빌드 시에 베이킹해야 함                                       |
| Node 런타임         | 컨테이너 파일 시스템              | Docker 이미지          | 모든 이미지 빌드마다 재빌드됨                                 |
| OS 패키지           | 컨테이너 파일 시스템              | Docker 이미지          | 런타임에 설치하지 마십시오                                    |
| Docker 컨테이너     | 임시                              | 재시작 가능            | 삭제해도 안전                                                 |

## 업데이트

VM에서 OpenClaw를 업데이트하려면:

```bash
git pull
docker compose build
docker compose up -d
```
