---
summary: "macOS에서 게이트웨이 런타임 (외부 launchd 서비스)"
read_when:
  - OpenClaw.app 패키징 시
  - macOS 게이트웨이 launchd 서비스 디버깅 시
  - macOS용 게이트웨이 CLI 설치 시
title: "macOS에서 게이트웨이"
---

# macOS에서 게이트웨이 (외부 launchd)

OpenClaw.app은 더 이상 Node/Bun 또는 게이트웨이 런타임을 번들로 제공하지 않습니다. macOS 앱은 **외부** `openclaw` CLI 설치를 기대하고, 게이트웨이를 자식 프로세스로 생성하지 않으며, 사용자별 launchd 서비스를 관리하여 게이트웨이를 실행 상태로 유지합니다 (또는 이미 실행 중인 로컬 게이트웨이가 있으면 연결합니다).

## CLI 설치 (로컬 모드에 필요)

Mac의 기본 런타임은 Node 24입니다. 호환성을 위해 현재 `22.14+`인 Node 22 LTS도 작동합니다. 그런 다음 `openclaw`를 전역으로 설치하십시오:

```bash
npm install -g openclaw@<version>
```

macOS 앱의 **Install CLI** 버튼은 앱이 내부적으로 사용하는 동일한 전역 설치 흐름을 실행합니다. npm을 먼저 선호하고, 그 다음 pnpm, 그런 다음 유일하게 감지된 패키지 관리자가 bun인 경우 bun을 사용합니다. Node는 권장 게이트웨이 런타임으로 유지됩니다.

## Launchd (LaunchAgent로서의 게이트웨이)

레이블:

- `ai.openclaw.gateway` (또는 `ai.openclaw.<profile>`; 레거시 `com.openclaw.*` 유지될 수 있음)

Plist 위치 (사용자별):

- `~/Library/LaunchAgents/ai.openclaw.gateway.plist`
  (또는 `~/Library/LaunchAgents/ai.openclaw.<profile>.plist`)

관리자:

- macOS 앱은 로컬 모드에서 LaunchAgent 설치/업데이트를 소유합니다.
- CLI도 설치할 수 있습니다: `openclaw gateway install`.

동작:

- "OpenClaw Active"가 LaunchAgent를 활성화/비활성화합니다.
- 앱 종료로 게이트웨이가 중지되지 **않습니다** (launchd가 계속 실행).
- 구성된 포트에서 게이트웨이가 이미 실행 중이면 앱은 새 게이트웨이를 시작하는 대신 연결합니다.

로깅:

- launchd stdout/err: `/tmp/openclaw/openclaw-gateway.log`

## 버전 호환성

macOS 앱은 게이트웨이 버전을 자체 버전과 비교합니다. 호환되지 않으면 전역 CLI를 앱 버전과 일치하도록 업데이트하십시오.

## 스모크 체크

```bash
openclaw --version

OPENCLAW_SKIP_CHANNELS=1 \
OPENCLAW_SKIP_CANVAS_HOST=1 \
openclaw gateway --port 18999 --bind loopback
```

그런 다음:

```bash
openclaw gateway call health --url ws://127.0.0.1:18999 --timeout 3000
```
