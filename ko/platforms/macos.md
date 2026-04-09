---
summary: "OpenClaw macOS 동반 앱 (메뉴 바 + 게이트웨이 브로커)"
read_when:
  - macOS 앱 기능 구현 시
  - macOS에서 게이트웨이 라이프사이클 또는 노드 브리징 변경 시
title: "macOS 앱"
---

# OpenClaw macOS 동반 앱 (메뉴 바 + 게이트웨이 브로커)

macOS 앱은 OpenClaw의 **메뉴 바 동반 앱**입니다. 권한을 소유하고, 게이트웨이를 로컬에서 관리/연결하며 (launchd 또는 수동), macOS 기능을 노드로 에이전트에 노출합니다.

## 기능

- 메뉴 바에 기본 알림 및 상태를 표시합니다.
- TCC 프롬프트를 소유합니다 (알림, 접근성, 화면 녹화, 마이크, 음성 인식, 자동화/AppleScript).
- 게이트웨이를 실행하거나 연결합니다 (로컬 또는 원격).
- macOS 전용 도구를 노출합니다 (Canvas, 카메라, 화면 녹화, `system.run`).
- **원격** 모드에서 로컬 노드 호스트 서비스를 시작하고 (launchd), **로컬** 모드에서 중지합니다.
- 선택적으로 UI 자동화를 위한 **PeekabooBridge**를 호스팅합니다.
- 요청 시 npm, pnpm, 또는 bun을 통해 전역 CLI (`openclaw`)를 설치합니다 (앱은 npm을 먼저 선호하고, 그 다음 pnpm, 그 다음 bun; Node는 권장 게이트웨이 런타임으로 유지됨).

## 로컬 vs 원격 모드

- **로컬** (기본값): 앱이 실행 중인 로컬 게이트웨이에 연결합니다. 없으면 `openclaw gateway install`을 통해 launchd 서비스를 활성화합니다.
- **원격**: 앱이 SSH/Tailscale을 통해 게이트웨이에 연결하고 로컬 프로세스를 시작하지 않습니다. 앱은 로컬 **노드 호스트 서비스**를 시작하여 원격 게이트웨이가 이 Mac에 도달할 수 있도록 합니다. 앱은 게이트웨이를 자식 프로세스로 생성하지 않습니다. 게이트웨이 검색은 이제 원시 tailnet IP보다 Tailscale MagicDNS 이름을 선호하므로 tailnet IP가 변경될 때 Mac 앱이 더 안정적으로 복구됩니다.

## Launchd 제어

앱은 `ai.openclaw.gateway`로 레이블된 사용자별 LaunchAgent를 관리합니다 (`--profile`/`OPENCLAW_PROFILE` 사용 시 `ai.openclaw.<profile>`; 레거시 `com.openclaw.*`는 여전히 언로드됨).

```bash
launchctl kickstart -k gui/$UID/ai.openclaw.gateway
launchctl bootout gui/$UID/ai.openclaw.gateway
```

명명된 프로필 실행 시 레이블을 `ai.openclaw.<profile>`로 교체하십시오.

LaunchAgent가 설치되지 않은 경우 앱에서 활성화하거나 `openclaw gateway install`을 실행하십시오.

## 노드 기능 (mac)

macOS 앱은 자신을 노드로 표시합니다. 일반적인 명령:

- Canvas: `canvas.present`, `canvas.navigate`, `canvas.eval`, `canvas.snapshot`, `canvas.a2ui.*`
- 카메라: `camera.snap`, `camera.clip`
- 화면: `screen.record`
- 시스템: `system.run`, `system.notify`

노드는 에이전트가 허용된 내용을 결정할 수 있도록 `permissions` 맵을 보고합니다.

노드 서비스 + 앱 IPC:

- 헤드리스 노드 호스트 서비스가 실행 중인 경우 (원격 모드), 게이트웨이 WS에 노드로 연결합니다.
- `system.run`은 로컬 Unix 소켓을 통해 macOS 앱 (UI/TCC 컨텍스트)에서 실행됩니다. 프롬프트 + 출력은 앱 내에 유지됩니다.

다이어그램 (SCI):

```
Gateway -> Node Service (WS)
                 |  IPC (UDS + token + HMAC + TTL)
                 v
             Mac App (UI + TCC + system.run)
```

## 실행 승인 (system.run)

`system.run`은 macOS 앱의 **Exec approvals** (설정 → Exec approvals)로 제어됩니다. 보안 + 요청 + 허용 목록은 Mac의 로컬에 저장됩니다:

```
~/.openclaw/exec-approvals.json
```

예시:

```json
{
  "version": 1,
  "defaults": {
    "security": "deny",
    "ask": "on-miss"
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "allowlist": [{ "pattern": "/opt/homebrew/bin/rg" }]
    }
  }
}
```

참고:

- `allowlist` 항목은 확인된 바이너리 경로에 대한 글로브 패턴입니다.
- 쉘 제어 또는 확장 구문 (`&&`, `||`, `;`, `|`, `` ` ``, `$`, `<`, `>`, `(`, `)`)이 포함된 원시 쉘 명령 텍스트는 허용 목록 미스로 처리되며 명시적인 승인 (또는 쉘 바이너리 허용 목록)이 필요합니다.
- 프롬프트에서 "항상 허용"을 선택하면 해당 명령이 허용 목록에 추가됩니다.
- `system.run` 환경 재정의는 필터링되며 (`PATH`, `DYLD_*`, `LD_*`, `NODE_OPTIONS`, `PYTHON*`, `PERL*`, `RUBYOPT`, `SHELLOPTS`, `PS4` 삭제) 앱 환경과 병합됩니다.
- 쉘 래퍼 (`bash|sh|zsh ... -c/-lc`)의 경우 요청 범위 환경 재정의는 작은 명시적 허용 목록 (`TERM`, `LANG`, `LC_*`, `COLORTERM`, `NO_COLOR`, `FORCE_COLOR`)으로 축소됩니다.
- 허용 목록 모드에서 항상 허용 결정의 경우 알려진 디스패치 래퍼 (`env`, `nice`, `nohup`, `stdbuf`, `timeout`)는 래퍼 경로 대신 내부 실행 파일 경로를 유지합니다. 래핑 해제가 안전하지 않은 경우 허용 목록 항목이 자동으로 유지되지 않습니다.

## 딥 링크

앱은 로컬 작업을 위해 `openclaw://` URL 스킴을 등록합니다.

### `openclaw://agent`

게이트웨이 `agent` 요청을 트리거합니다.

```bash
open 'openclaw://agent?message=Hello%20from%20deep%20link'
```

쿼리 매개변수:

- `message` (필수)
- `sessionKey` (선택 사항)
- `thinking` (선택 사항)
- `deliver` / `to` / `channel` (선택 사항)
- `timeoutSeconds` (선택 사항)
- `key` (선택 사항 무인 모드 키)

보안:

- `key` 없이는 앱이 확인을 위한 프롬프트를 표시합니다.
- `key` 없이는 앱이 확인 프롬프트에 대한 짧은 메시지 제한을 적용하고 `deliver` / `to` / `channel`을 무시합니다.
- 유효한 `key`가 있으면 실행이 무인으로 이루어집니다 (개인 자동화용).

## 온보딩 흐름 (일반적)

1. **OpenClaw.app**을 설치하고 시작합니다.
2. 권한 체크리스트를 완료합니다 (TCC 프롬프트).
3. **로컬** 모드가 활성화되어 있고 게이트웨이가 실행 중인지 확인합니다.
4. 터미널 접근을 원하면 CLI를 설치합니다.

## 상태 디렉터리 배치 (macOS)

OpenClaw 상태 디렉터리를 iCloud 또는 다른 클라우드 동기화 폴더에 두지 마십시오. 동기화 지원 경로는 세션 및 자격 증명에 대한 파일 잠금/동기화 경쟁을 가끔 발생시키고 지연을 추가할 수 있습니다.

다음과 같은 로컬 비동기화 상태 경로를 선호합니다:

```bash
OPENCLAW_STATE_DIR=~/.openclaw
```

`openclaw doctor`가 다음 경로 아래 상태를 감지하면:

- `~/Library/Mobile Documents/com~apple~CloudDocs/...`
- `~/Library/CloudStorage/...`

경고를 표시하고 로컬 경로로 다시 이동할 것을 권장합니다.

## 빌드 및 개발 워크플로 (네이티브)

- `cd apps/macos && swift build`
- `swift run OpenClaw` (또는 Xcode)
- 앱 패키지: `scripts/package-mac-app.sh`

## 게이트웨이 연결 디버깅 (macOS CLI)

앱을 시작하지 않고 macOS 앱이 사용하는 동일한 게이트웨이 WebSocket 핸드셰이크 및 검색 로직을 실행하려면 디버그 CLI를 사용하십시오.

```bash
cd apps/macos
swift run openclaw-mac connect --json
swift run openclaw-mac discover --timeout 3000 --json
```

연결 옵션:

- `--url <ws://host:port>`: 구성 재정의
- `--mode <local|remote>`: 구성에서 확인 (기본값: 구성 또는 로컬)
- `--probe`: 새로운 상태 프로브 강제
- `--timeout <ms>`: 요청 타임아웃 (기본값: `15000`)
- `--json`: 비교를 위한 구조화된 출력

검색 옵션:

- `--include-local`: "로컬"로 필터링될 게이트웨이 포함
- `--timeout <ms>`: 전체 검색 창 (기본값: `2000`)
- `--json`: 비교를 위한 구조화된 출력

팁: `openclaw gateway discover --json`과 비교하여 macOS 앱의 검색 파이프라인 (`local.`과 구성된 광역 도메인, 광역 및 Tailscale Serve 대체)이 Node CLI의 `dns-sd` 기반 검색과 다른지 확인하십시오.

## 원격 연결 배관 (SSH 터널)

macOS 앱이 **원격** 모드로 실행되면 로컬 UI 구성 요소가 로컬호스트에 있는 것처럼 원격 게이트웨이와 통신할 수 있도록 SSH 터널을 엽니다.

### 제어 터널 (게이트웨이 WebSocket 포트)

- **목적:** 상태 확인, 상태, Web Chat, 구성, 기타 제어 플레인 호출.
- **로컬 포트:** 게이트웨이 포트 (기본값 `18789`), 항상 안정적.
- **원격 포트:** 원격 호스트의 동일 게이트웨이 포트.
- **동작:** 임의의 로컬 포트 없음; 앱은 기존의 정상 터널을 재사용하거나 필요한 경우 재시작합니다.
- **SSH 형태:** BatchMode + ExitOnForwardFailure + keepalive 옵션이 있는 `ssh -N -L <local>:127.0.0.1:<remote>`.
- **IP 보고:** SSH 터널은 루프백을 사용하므로 게이트웨이는 노드 IP를 `127.0.0.1`로 봅니다. 실제 클라이언트 IP가 표시되도록 하려면 **직접 (ws/wss)** 전송을 사용하십시오 ([macOS 원격 접근](/platforms/mac/remote) 참조).

설정 단계는 [macOS 원격 접근](/platforms/mac/remote)을 참조하십시오. 프로토콜 세부 사항은 [게이트웨이 프로토콜](/gateway/protocol)을 참조하십시오.

## 관련 문서

- [게이트웨이 런북](/gateway)
- [게이트웨이 (macOS)](/platforms/mac/bundled-gateway)
- [macOS 권한](/platforms/mac/permissions)
- [Canvas](/platforms/mac/canvas)
