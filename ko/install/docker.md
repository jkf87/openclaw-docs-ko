---
summary: "OpenClaw를 위한 선택적 Docker 기반 설정 및 온보딩"
read_when:
  - 로컬 설치 대신 컨테이너화된 게이트웨이를 원하는 경우
  - Docker 흐름을 검증하는 경우
title: "Docker"
---

# Docker (선택적)

Docker는 **선택 사항**입니다. 컨테이너화된 게이트웨이를 원하거나 Docker 흐름을 검증하려는 경우에만 사용하십시오.

## Docker가 적합한가요?

- **예**: 격리되고 일회용 게이트웨이 환경을 원하거나 로컬 설치 없이 호스트에서 OpenClaw를 실행하려는 경우.
- **아니요**: 자신의 머신에서 실행 중이며 가장 빠른 개발 루프를 원하는 경우. 대신 일반 설치 흐름을 사용하십시오.
- **샌드박싱 참고**: 에이전트 샌드박싱도 Docker를 사용하지만 전체 게이트웨이를 Docker에서 실행할 **필요는 없습니다**. [샌드박싱](/gateway/sandboxing)을 참조하십시오.

## 사전 요구 사항

- Docker Desktop (또는 Docker Engine) + Docker Compose v2
- 이미지 빌드를 위한 최소 2 GB RAM (`pnpm install`은 종료 코드 137로 1 GB 호스트에서 OOM 종료될 수 있음)
- 이미지 및 로그를 위한 충분한 디스크 공간
- VPS/공용 호스트에서 실행 중인 경우
  [네트워크 노출을 위한 보안 강화](/gateway/security/) 검토,
  특히 Docker `DOCKER-USER` 방화벽 정책.

## 컨테이너화된 Gateway

<Steps>
  <Step title="이미지 빌드">
    저장소 루트에서 설정 스크립트를 실행합니다:

    ```bash
    ./scripts/docker/setup.sh
    ```

    이를 통해 게이트웨이 이미지를 로컬에서 빌드합니다. 대신 미리 빌드된 이미지를 사용하려면:

    ```bash
    export OPENCLAW_IMAGE="ghcr.io/openclaw/openclaw:latest"
    ./scripts/docker/setup.sh
    ```

    미리 빌드된 이미지는
    [GitHub Container Registry](https://github.com/openclaw/openclaw/pkgs/container/openclaw)에서 제공됩니다.
    일반 태그: `main`, `latest`, `<version>` (예: `2026.2.26`).

  </Step>

  <Step title="온보딩 완료">
    설정 스크립트는 온보딩을 자동으로 실행합니다. 다음을 수행합니다:

    - 제공자 API 키 요청
    - 게이트웨이 토큰 생성 및 `.env`에 쓰기
    - Docker Compose를 통해 게이트웨이 시작

    설정 중에 사전 시작 온보딩 및 구성 쓰기는 `openclaw-gateway`를 통해 직접 실행됩니다. `openclaw-cli`는 게이트웨이 컨테이너가 이미 존재한 후 실행하는 명령용입니다.

  </Step>

  <Step title="Control UI 열기">
    브라우저에서 `http://127.0.0.1:18789/`를 열고 설정에서 구성된 공유 시크릿을 붙여넣습니다. 설정 스크립트는 기본적으로 `.env`에 토큰을 씁니다. 컨테이너 구성을 비밀번호 인증으로 전환한 경우 해당 비밀번호를 사용합니다.

    URL을 다시 보려면:

    ```bash
    docker compose run --rm openclaw-cli dashboard --no-open
    ```

  </Step>

  <Step title="채널 구성 (선택적)">
    CLI 컨테이너를 사용하여 메시징 채널을 추가합니다:

    ```bash
    # WhatsApp (QR)
    docker compose run --rm openclaw-cli channels login

    # Telegram
    docker compose run --rm openclaw-cli channels add --channel telegram --token "<token>"

    # Discord
    docker compose run --rm openclaw-cli channels add --channel discord --token "<token>"
    ```

    문서: [WhatsApp](/channels/whatsapp), [Telegram](/channels/telegram), [Discord](/channels/discord)

  </Step>
</Steps>

### 수동 흐름

설정 스크립트 대신 각 단계를 직접 실행하려면:

```bash
docker build -t openclaw:local -f Dockerfile .
docker compose run --rm --no-deps --entrypoint node openclaw-gateway \
  dist/index.js onboard --mode local --no-install-daemon
docker compose run --rm --no-deps --entrypoint node openclaw-gateway \
  dist/index.js config set --batch-json '[{"path":"gateway.mode","value":"local"},{"path":"gateway.bind","value":"lan"},{"path":"gateway.controlUi.allowedOrigins","value":["http://localhost:18789","http://127.0.0.1:18789"]}]'
docker compose up -d openclaw-gateway
```

<Note>
저장소 루트에서 `docker compose`를 실행합니다. `OPENCLAW_EXTRA_MOUNTS` 또는 `OPENCLAW_HOME_VOLUME`을 활성화한 경우 설정 스크립트는 `docker-compose.extra.yml`을 씁니다. `-f docker-compose.yml -f docker-compose.extra.yml`로 포함합니다.
</Note>

<Note>
`openclaw-cli`는 `openclaw-gateway`의 네트워크 네임스페이스를 공유하므로 사후 시작 도구입니다. `docker compose up -d openclaw-gateway` 전에 `--no-deps --entrypoint node`로 `openclaw-gateway`를 통해 온보딩 및 설정 시간 구성 쓰기를 실행합니다.
</Note>

### 환경 변수

설정 스크립트는 다음 선택적 환경 변수를 허용합니다:

| 변수                           | 목적                                                                |
| ------------------------------ | ------------------------------------------------------------------- |
| `OPENCLAW_IMAGE`               | 로컬 빌드 대신 원격 이미지 사용                                     |
| `OPENCLAW_DOCKER_APT_PACKAGES` | 빌드 중 추가 apt 패키지 설치 (공백으로 구분)                        |
| `OPENCLAW_EXTENSIONS`          | 빌드 시 확장 종속성 미리 설치 (공백으로 구분된 이름)               |
| `OPENCLAW_EXTRA_MOUNTS`        | 추가 호스트 바인드 마운트 (쉼표로 구분된 `source:target[:opts]`)   |
| `OPENCLAW_HOME_VOLUME`         | 명명된 Docker 볼륨에 `/home/node` 지속                             |
| `OPENCLAW_SANDBOX`             | 샌드박스 부트스트랩에 옵트인 (`1`, `true`, `yes`, `on`)            |
| `OPENCLAW_DOCKER_SOCKET`       | Docker 소켓 경로 재정의                                             |

### 헬스 체크

컨테이너 프로브 엔드포인트 (인증 필요 없음):

```bash
curl -fsS http://127.0.0.1:18789/healthz   # 활성 상태
curl -fsS http://127.0.0.1:18789/readyz     # 준비 상태
```

Docker 이미지에는 `/healthz`를 핑하는 내장 `HEALTHCHECK`가 포함됩니다.
체크가 계속 실패하면 Docker는 컨테이너를 `unhealthy`로 표시하고
오케스트레이션 시스템이 재시작하거나 교체할 수 있습니다.

인증된 심층 헬스 스냅샷:

```bash
docker compose exec openclaw-gateway node dist/index.js health --token "$OPENCLAW_GATEWAY_TOKEN"
```

### LAN 대 루프백

`scripts/docker/setup.sh`는 기본적으로 `OPENCLAW_GATEWAY_BIND=lan`으로 설정하여 Docker 포트 게시로 `http://127.0.0.1:18789`에 대한 호스트 액세스가 작동합니다.

- `lan` (기본값): 호스트 브라우저와 호스트 CLI가 게시된 게이트웨이 포트에 도달할 수 있습니다.
- `loopback`: 컨테이너 네트워크 네임스페이스 내의 프로세스만 게이트웨이에 직접 도달할 수 있습니다.

<Note>
`0.0.0.0` 또는 `127.0.0.1`과 같은 호스트 별칭이 아닌 `gateway.bind`에서 바인드 모드 값(`lan` / `loopback` / `custom` / `tailnet` / `auto`)을 사용합니다.
</Note>

### 저장소 및 지속성

Docker Compose는 `OPENCLAW_CONFIG_DIR`을 `/home/node/.openclaw`에, `OPENCLAW_WORKSPACE_DIR`을 `/home/node/.openclaw/workspace`에 바인드 마운트하므로 해당 경로는 컨테이너 교체 후에도 살아남습니다.

해당 마운트된 구성 디렉터리는 OpenClaw가 다음을 보관하는 곳입니다:

- 동작 구성을 위한 `openclaw.json`
- 저장된 제공자 OAuth/API 키 인증을 위한 `agents/<agentId>/agent/auth-profiles.json`
- `OPENCLAW_GATEWAY_TOKEN`과 같은 환경 변수로 지원되는 런타임 시크릿을 위한 `.env`

VM 배포의 전체 지속성 세부 정보는
[Docker VM 런타임 - 지속 위치](/install/docker-vm-runtime#what-persists-where)를 참조하십시오.

**디스크 증가 핫스팟:** `media/`, 세션 JSONL 파일, `cron/runs/*.jsonl`,
`/tmp/openclaw/` 아래의 롤링 파일 로그를 주시하십시오.

### 셸 헬퍼 (선택적)

더 쉬운 일상적 Docker 관리를 위해 `ClawDock`을 설치하십시오:

```bash
mkdir -p ~/.clawdock && curl -sL https://raw.githubusercontent.com/openclaw/openclaw/main/scripts/clawdock/clawdock-helpers.sh -o ~/.clawdock/clawdock-helpers.sh
echo 'source ~/.clawdock/clawdock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

이전 `scripts/shell-helpers/clawdock-helpers.sh` raw 경로에서 ClawDock을 설치했다면 위의 설치 명령을 다시 실행하여 로컬 헬퍼 파일이 새 위치를 추적하도록 하십시오.

그런 다음 `clawdock-start`, `clawdock-stop`, `clawdock-dashboard` 등을 사용합니다. 모든 명령은 `clawdock-help`를 실행하십시오.
전체 헬퍼 가이드는 [ClawDock](/install/clawdock)을 참조하십시오.

<AccordionGroup>
  <Accordion title="Docker 게이트웨이를 위한 에이전트 샌드박스 활성화">
    ```bash
    export OPENCLAW_SANDBOX=1
    ./scripts/docker/setup.sh
    ```

    사용자 정의 소켓 경로 (예: 루트리스 Docker):

    ```bash
    export OPENCLAW_SANDBOX=1
    export OPENCLAW_DOCKER_SOCKET=/run/user/1000/docker.sock
    ./scripts/docker/setup.sh
    ```

    스크립트는 샌드박스 사전 요구 사항이 통과된 후에만 `docker.sock`을 마운트합니다.
    샌드박스 설정을 완료할 수 없는 경우 스크립트는 `agents.defaults.sandbox.mode`를 `off`로 재설정합니다.

  </Accordion>

  <Accordion title="자동화 / CI (비대화형)">
    `-T`로 Compose 의사 TTY 할당 비활성화:

    ```bash
    docker compose run -T --rm openclaw-cli gateway probe
    docker compose run -T --rm openclaw-cli devices list --json
    ```

  </Accordion>

  <Accordion title="공유 네트워크 보안 참고 사항">
    `openclaw-cli`는 `network_mode: "service:openclaw-gateway"`를 사용하므로 CLI
    명령이 `127.0.0.1`을 통해 게이트웨이에 도달할 수 있습니다. 이를 공유
    신뢰 경계로 취급합니다. compose 구성은 `openclaw-cli`에서 `NET_RAW`/`NET_ADMIN`을 제거하고
    `no-new-privileges`를 활성화합니다.
  </Accordion>

  <Accordion title="권한 및 EACCES">
    이미지는 `node` (uid 1000)로 실행됩니다. `/home/node/.openclaw`에서 권한 오류가 발생하면
    호스트 바인드 마운트가 uid 1000 소유인지 확인합니다:

    ```bash
    sudo chown -R 1000:1000 /path/to/openclaw-config /path/to/openclaw-workspace
    ```

  </Accordion>

  <Accordion title="빠른 재빌드">
    종속성 레이어가 캐시되도록 Dockerfile을 정렬합니다. 이를 통해 락파일이 변경되지 않는 한
    `pnpm install` 재실행을 피할 수 있습니다:

    ```dockerfile
    FROM node:24-bookworm
    RUN curl -fsSL https://bun.sh/install | bash
    ENV PATH="/root/.bun/bin:${PATH}"
    RUN corepack enable
    WORKDIR /app
    COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
    COPY ui/package.json ./ui/package.json
    COPY scripts ./scripts
    RUN pnpm install --frozen-lockfile
    COPY . .
    RUN pnpm build
    RUN pnpm ui:install
    RUN pnpm ui:build
    ENV NODE_ENV=production
    CMD ["node","dist/index.js"]
    ```

  </Accordion>

  <Accordion title="고급 컨테이너 옵션">
    기본 이미지는 보안 우선이며 비루트 `node`로 실행됩니다. 더 기능이 풍부한 컨테이너:

    1. **`/home/node` 지속**: `export OPENCLAW_HOME_VOLUME="openclaw_home"`
    2. **시스템 종속성 베이킹**: `export OPENCLAW_DOCKER_APT_PACKAGES="git curl jq"`
    3. **Playwright 브라우저 설치**:
       ```bash
       docker compose run --rm openclaw-cli \
         node /app/node_modules/playwright-core/cli.js install chromium
       ```
    4. **브라우저 다운로드 지속**: `PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright` 설정 및
       `OPENCLAW_HOME_VOLUME` 또는 `OPENCLAW_EXTRA_MOUNTS` 사용.

  </Accordion>

  <Accordion title="OpenAI Codex OAuth (헤드리스 Docker)">
    마법사에서 OpenAI Codex OAuth를 선택하면 브라우저 URL이 열립니다. Docker 또는 헤드리스 설정에서는
    도착한 전체 리디렉션 URL을 복사하여 마법사에 붙여넣어 인증을 완료합니다.
  </Accordion>

  <Accordion title="기본 이미지 메타데이터">
    기본 Docker 이미지는 `node:24-bookworm`을 사용하며 `org.opencontainers.image.base.name`,
    `org.opencontainers.image.source` 등을 포함한 OCI 기본 이미지 어노테이션을 게시합니다. 자세한 내용은
    [OCI 이미지 어노테이션](https://github.com/opencontainers/image-spec/blob/main/annotations.md)을 참조하십시오.
  </Accordion>
</AccordionGroup>

### VPS에서 실행 중인가요?

바이너리 베이킹, 지속성 및 업데이트를 포함한 공유 VM 배포 단계는
[Hetzner (Docker VPS)](/install/hetzner) 및
[Docker VM 런타임](/install/docker-vm-runtime)을 참조하십시오.

## 에이전트 샌드박스

`agents.defaults.sandbox`가 활성화되면 게이트웨이는 에이전트 도구 실행
(셸, 파일 읽기/쓰기 등)을 격리된 Docker 컨테이너 내에서 실행하는 반면
게이트웨이 자체는 호스트에 있습니다. 이를 통해 전체 게이트웨이를 컨테이너화하지 않고도
신뢰할 수 없거나 멀티 테넌트 에이전트 세션 주위에 단단한 벽을 제공합니다.

샌드박스 범위는 에이전트별(기본값), 세션별 또는 공유일 수 있습니다. 각 범위는
`/workspace`에 마운트된 자체 작업 공간을 가집니다. 허용/거부 도구 정책,
네트워크 격리, 리소스 제한 및 브라우저 컨테이너를 구성할 수도 있습니다.

전체 구성, 이미지, 보안 참고 사항 및 멀티 에이전트 프로파일은 다음을 참조하십시오:

- [샌드박싱](/gateway/sandboxing) -- 완전한 샌드박스 참조
- [OpenShell](/gateway/openshell) -- 샌드박스 컨테이너에 대한 대화형 셸 액세스
- [멀티 에이전트 샌드박스 및 도구](/tools/multi-agent-sandbox-tools) -- 에이전트별 재정의

### 빠른 활성화

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // off | non-main | all
        scope: "agent", // session | agent | shared
      },
    },
  },
}
```

기본 샌드박스 이미지 빌드:

```bash
scripts/sandbox-setup.sh
```

## 문제 해결

<AccordionGroup>
  <Accordion title="이미지 누락 또는 샌드박스 컨테이너가 시작되지 않음">
    [`scripts/sandbox-setup.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/sandbox-setup.sh)로
    샌드박스 이미지를 빌드하거나 `agents.defaults.sandbox.docker.image`를 사용자 정의 이미지로 설정합니다.
    컨테이너는 요청 시 세션별로 자동 생성됩니다.
  </Accordion>

  <Accordion title="샌드박스에서 권한 오류">
    `docker.user`를 마운트된 작업 공간 소유권과 일치하는 UID:GID로 설정하거나
    작업 공간 폴더를 chown합니다.
  </Accordion>

  <Accordion title="샌드박스에서 사용자 정의 도구를 찾을 수 없음">
    OpenClaw는 `sh -lc` (로그인 셸)로 명령을 실행하며, 이는 `/etc/profile`을 소스하고
    PATH를 재설정할 수 있습니다. `docker.env.PATH`를 설정하여 사용자 정의 도구 경로를
    앞에 추가하거나 Dockerfile의 `/etc/profile.d/` 아래에 스크립트를 추가합니다.
  </Accordion>

  <Accordion title="이미지 빌드 중 OOM 종료 (종료 코드 137)">
    VM에는 최소 2 GB RAM이 필요합니다. 더 큰 머신 클래스를 사용하고 재시도합니다.
  </Accordion>

  <Accordion title="Control UI에서 Unauthorized 또는 페어링 필요">
    새로운 대시보드 링크를 가져와 브라우저 장치를 승인합니다:

    ```bash
    docker compose run --rm openclaw-cli dashboard --no-open
    docker compose run --rm openclaw-cli devices list
    docker compose run --rm openclaw-cli devices approve <requestId>
    ```

    자세한 내용: [대시보드](/web/dashboard), [장치](/cli/devices).

  </Accordion>

  <Accordion title="Gateway 대상이 ws://172.x.x.x를 표시하거나 Docker CLI에서 페어링 오류">
    게이트웨이 모드 및 바인드 재설정:

    ```bash
    docker compose run --rm openclaw-cli config set --batch-json '[{"path":"gateway.mode","value":"local"},{"path":"gateway.bind","value":"lan"}]'
    docker compose run --rm openclaw-cli devices list --url ws://127.0.0.1:18789
    ```

  </Accordion>
</AccordionGroup>

## 관련 항목

- [설치 개요](/install/) — 모든 설치 방법
- [Podman](/install/podman) — Docker의 Podman 대안
- [ClawDock](/install/clawdock) — Docker Compose 커뮤니티 설정
- [업데이트](/install/updating) — OpenClaw를 최신 상태로 유지
- [구성](/gateway/configuration) — 설치 후 게이트웨이 구성
