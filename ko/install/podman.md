---
summary: "루트리스 Podman 컨테이너에서 OpenClaw 실행"
read_when:
  - Docker 대신 Podman을 사용하여 컨테이너화된 게이트웨이를 원하는 경우
title: "Podman"
---

# Podman

현재 비루트 사용자가 관리하는 루트리스 Podman 컨테이너에서 OpenClaw Gateway를 실행합니다.

의도된 모델:

- Podman이 게이트웨이 컨테이너를 실행합니다.
- 호스트 `openclaw` CLI가 제어 평면입니다.
- 지속 상태는 기본적으로 `~/.openclaw` 아래 호스트에 있습니다.
- 일상 관리는 `sudo -u openclaw`, `podman exec` 또는 별도의 서비스 사용자 대신 `openclaw --container <name> ...`를 사용합니다.

## 사전 요구 사항

- 루트리스 모드의 **Podman**
- 호스트에 설치된 **OpenClaw CLI**
- **선택적:** Quadlet 관리 자동 시작을 원하면 `systemd --user`
- **선택적:** 헤드리스 호스트에서 부팅 지속성을 위해 `loginctl enable-linger "$(whoami)"`를 원하는 경우에만 `sudo`

## 빠른 시작

<Steps>
  <Step title="일회성 설정">
    저장소 루트에서 `./scripts/podman/setup.sh`를 실행합니다.
  </Step>

  <Step title="Gateway 컨테이너 시작">
    `./scripts/run-openclaw-podman.sh launch`로 컨테이너를 시작합니다.
  </Step>

  <Step title="컨테이너 내에서 온보딩 실행">
    `./scripts/run-openclaw-podman.sh launch setup`을 실행한 다음 `http://127.0.0.1:18789/`를 엽니다.
  </Step>

  <Step title="호스트 CLI에서 실행 중인 컨테이너 관리">
    `OPENCLAW_CONTAINER=openclaw`를 설정한 다음 호스트에서 일반 `openclaw` 명령을 사용합니다.
  </Step>
</Steps>

설정 세부 사항:

- `./scripts/podman/setup.sh`는 기본적으로 루트리스 Podman 저장소에 `openclaw:local`을 빌드하거나 `OPENCLAW_IMAGE` / `OPENCLAW_PODMAN_IMAGE`를 설정한 경우 사용합니다.
- 없는 경우 `gateway.mode: "local"`이 포함된 `~/.openclaw/openclaw.json`을 생성합니다.
- 없는 경우 `OPENCLAW_GATEWAY_TOKEN`이 포함된 `~/.openclaw/.env`를 생성합니다.
- 수동 실행의 경우 헬퍼는 `~/.openclaw/.env`에서 Podman 관련 키의 소규모 허용 목록만 읽고 컨테이너에 명시적 런타임 환경 변수를 전달합니다. 전체 환경 파일을 Podman에 넘기지 않습니다.

Quadlet 관리 설정:

```bash
./scripts/podman/setup.sh --quadlet
```

Quadlet은 systemd 사용자 서비스에 의존하기 때문에 Linux 전용 옵션입니다.

`OPENCLAW_PODMAN_QUADLET=1`을 설정할 수도 있습니다.

선택적 빌드/설정 환경 변수:

- `OPENCLAW_IMAGE` 또는 `OPENCLAW_PODMAN_IMAGE` -- `openclaw:local`을 빌드하는 대신 기존/가져온 이미지 사용
- `OPENCLAW_DOCKER_APT_PACKAGES` -- 이미지 빌드 중 추가 apt 패키지 설치
- `OPENCLAW_EXTENSIONS` -- 빌드 시 확장 종속성 미리 설치

컨테이너 시작:

```bash
./scripts/run-openclaw-podman.sh launch
```

스크립트는 `--userns=keep-id`를 사용하여 현재 uid/gid로 컨테이너를 시작하고 OpenClaw 상태를 컨테이너에 바인드 마운트합니다.

온보딩:

```bash
./scripts/run-openclaw-podman.sh launch setup
```

그런 다음 `http://127.0.0.1:18789/`를 열고 `~/.openclaw/.env`의 토큰을 사용합니다.

호스트 CLI 기본값:

```bash
export OPENCLAW_CONTAINER=openclaw
```

그러면 다음과 같은 명령들이 해당 컨테이너 내에서 자동으로 실행됩니다:

```bash
openclaw dashboard --no-open
openclaw gateway status --deep   # 추가 서비스 스캔 포함
openclaw doctor
openclaw channels login
```

macOS에서 Podman 머신은 브라우저가 게이트웨이에 비로컬로 보이게 할 수 있습니다.
실행 후 Control UI에서 장치 인증 오류가 보고되면 [Podman + Tailscale](#podman--tailscale)의 Tailscale 가이던스를 사용합니다.

<a id="podman--tailscale"></a>

## Podman + Tailscale

HTTPS 또는 원격 브라우저 액세스를 위해 기본 Tailscale 문서를 따르십시오.

Podman 특정 참고 사항:

- Podman publish 호스트를 `127.0.0.1`로 유지합니다.
- `openclaw gateway --tailscale serve`보다 호스트 관리 `tailscale serve`를 선호합니다.
- macOS에서 로컬 브라우저 장치 인증 컨텍스트가 신뢰할 수 없는 경우 임시 로컬 터널 해결 방법 대신 Tailscale 액세스를 사용합니다.

참조:

- [Tailscale](/gateway/tailscale)
- [Control UI](/web/control-ui)

## Systemd (Quadlet, 선택적)

`./scripts/podman/setup.sh --quadlet`을 실행한 경우 설정은 다음 위치에 Quadlet 파일을 설치합니다:

```bash
~/.config/containers/systemd/openclaw.container
```

유용한 명령어:

- **시작:** `systemctl --user start openclaw.service`
- **중지:** `systemctl --user stop openclaw.service`
- **상태:** `systemctl --user status openclaw.service`
- **로그:** `journalctl --user -u openclaw.service -f`

Quadlet 파일 편집 후:

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw.service
```

SSH/헤드리스 호스트에서 부팅 지속성을 위해 현재 사용자에 대한 링거를 활성화합니다:

```bash
sudo loginctl enable-linger "$(whoami)"
```

## 구성, 환경 변수 및 스토리지

- **구성 디렉터리:** `~/.openclaw`
- **작업 공간 디렉터리:** `~/.openclaw/workspace`
- **토큰 파일:** `~/.openclaw/.env`
- **실행 헬퍼:** `./scripts/run-openclaw-podman.sh`

실행 스크립트와 Quadlet은 호스트 상태를 컨테이너에 바인드 마운트합니다:

- `OPENCLAW_CONFIG_DIR` -> `/home/node/.openclaw`
- `OPENCLAW_WORKSPACE_DIR` -> `/home/node/.openclaw/workspace`

기본적으로 이것들은 익명 컨테이너 상태가 아닌 호스트 디렉터리이므로
`openclaw.json`, 에이전트별 `auth-profiles.json`, 채널/제공자 상태,
세션 및 작업 공간은 컨테이너 교체 후에도 살아남습니다.
Podman 설정은 컨테이너의 비루프백 바인드와 함께 로컬 대시보드가 작동하도록 게시된 게이트웨이 포트의 `127.0.0.1` 및 `localhost`에 대해 `gateway.controlUi.allowedOrigins`도 시드합니다.

수동 실행기에 유용한 환경 변수:

- `OPENCLAW_PODMAN_CONTAINER` -- 컨테이너 이름 (기본값 `openclaw`)
- `OPENCLAW_PODMAN_IMAGE` / `OPENCLAW_IMAGE` -- 실행할 이미지
- `OPENCLAW_PODMAN_GATEWAY_HOST_PORT` -- 컨테이너 `18789`에 매핑되는 호스트 포트
- `OPENCLAW_PODMAN_BRIDGE_HOST_PORT` -- 컨테이너 `18790`에 매핑되는 호스트 포트
- `OPENCLAW_PODMAN_PUBLISH_HOST` -- 게시된 포트의 호스트 인터페이스; 기본값은 `127.0.0.1`
- `OPENCLAW_GATEWAY_BIND` -- 컨테이너 내부의 게이트웨이 바인드 모드; 기본값은 `lan`
- `OPENCLAW_PODMAN_USERNS` -- `keep-id` (기본값), `auto` 또는 `host`

수동 실행기는 컨테이너/이미지 기본값을 확정하기 전에 `~/.openclaw/.env`를 읽으므로 그곳에 유지할 수 있습니다.

기본값이 아닌 `OPENCLAW_CONFIG_DIR` 또는 `OPENCLAW_WORKSPACE_DIR`을 사용하는 경우 `./scripts/podman/setup.sh`와 이후 `./scripts/run-openclaw-podman.sh launch` 명령 모두에 동일한 변수를 설정합니다. 저장소 로컬 실행기는 셸 간에 사용자 정의 경로 재정의를 지속하지 않습니다.

Quadlet 참고 사항:

- 생성된 Quadlet 서비스는 의도적으로 고정되고 강화된 기본 형태를 유지합니다: `127.0.0.1` 게시 포트, 컨테이너 내부에 `--bind lan`, `keep-id` 사용자 네임스페이스.
- `OPENCLAW_NO_RESPAWN=1`, `Restart=on-failure` 및 `TimeoutStartSec=300`을 고정합니다.
- `127.0.0.1:18789:18789` (게이트웨이)와 `127.0.0.1:18790:18790` (브리지)를 모두 게시합니다.
- `OPENCLAW_GATEWAY_TOKEN`과 같은 값을 위해 런타임 `EnvironmentFile`로 `~/.openclaw/.env`를 읽지만 수동 실행기의 Podman 특정 재정의 허용 목록을 소비하지 않습니다.
- 사용자 정의 게시 포트, 게시 호스트 또는 다른 컨테이너 실행 플래그가 필요한 경우 수동 실행기를 사용하거나 `~/.config/containers/systemd/openclaw.container`를 직접 편집한 다음 서비스를 다시 로드하고 재시작합니다.

## 유용한 명령어

- **컨테이너 로그:** `podman logs -f openclaw`
- **컨테이너 중지:** `podman stop openclaw`
- **컨테이너 제거:** `podman rm -f openclaw`
- **호스트 CLI에서 대시보드 URL 열기:** `openclaw dashboard --no-open`
- **호스트 CLI를 통한 헬스/상태:** `openclaw gateway status --deep` (RPC 프로브 + 추가 서비스 스캔)

## 문제 해결

- **구성 또는 작업 공간에서 권한 거부 (EACCES):** 컨테이너는 기본적으로 `--userns=keep-id` 및 `--user <your uid>:<your gid>`로 실행됩니다. 호스트 구성/작업 공간 경로가 현재 사용자 소유인지 확인합니다.
- **게이트웨이 시작 차단 (`gateway.mode=local` 누락):** `~/.openclaw/openclaw.json`이 존재하고 `gateway.mode="local"`을 설정하는지 확인합니다. `scripts/podman/setup.sh`가 없는 경우 이를 생성합니다.
- **컨테이너 CLI 명령이 잘못된 대상에 도달:** `openclaw --container <name> ...`을 명시적으로 사용하거나 셸에서 `OPENCLAW_CONTAINER=<name>`을 내보냅니다.
- **`openclaw update`가 `--container`와 함께 실패:** 예상된 동작입니다. 이미지를 재빌드/가져온 다음 컨테이너 또는 Quadlet 서비스를 재시작합니다.
- **Quadlet 서비스가 시작되지 않음:** `systemctl --user daemon-reload`, 그런 다음 `systemctl --user start openclaw.service`를 실행합니다. 헤드리스 시스템에서는 `sudo loginctl enable-linger "$(whoami)"`도 필요할 수 있습니다.
- **SELinux가 바인드 마운트를 차단:** 기본 마운트 동작을 그대로 두십시오. 실행기는 SELinux가 강제 적용 또는 허용 모드일 때 Linux에서 자동으로 `:Z`를 추가합니다.

## 관련 항목

- [Docker](/install/docker)
- [게이트웨이 백그라운드 프로세스](/gateway/background-process)
- [게이트웨이 문제 해결](/gateway/troubleshooting)
