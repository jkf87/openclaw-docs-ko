---
summary: "노드: canvas/camera/screen/device/notifications/system에 대한 페어링, 기능, 권한 및 CLI 헬퍼"
read_when:
  - Pairing iOS/Android nodes to a gateway
  - Using node canvas/camera for agent context
  - Adding new node commands or CLI helpers
title: "노드"
---

# 노드

**노드**는 `role: "node"`를 사용하여 게이트웨이 **WebSocket** (운영자와 동일한 포트)에 연결하고 `node.invoke`를 통해 명령 표면(예: `canvas.*`, `camera.*`, `device.*`, `notifications.*`, `system.*`)을 노출하는 동반 기기(macOS/iOS/Android/헤드리스)입니다. 프로토콜 세부 정보: [게이트웨이 프로토콜](/gateway/protocol).

레거시 전송: [브리지 프로토콜](/gateway/bridge-protocol) (TCP JSONL; 현재 노드에서는 역사적 참고용).

macOS는 **노드 모드**로도 실행할 수 있습니다: 메뉴바 앱이 게이트웨이 WS 서버에 노드로 연결하고 로컬 canvas/camera 명령을 노드로 노출합니다 (따라서 `openclaw nodes …`가 이 Mac에서 작동합니다).

참고:

- 노드는 **주변 기기**이며 게이트웨이가 아닙니다. 게이트웨이 서비스를 실행하지 않습니다.
- Telegram/WhatsApp/등의 메시지는 노드가 아닌 **게이트웨이**에 도달합니다.
- 문제 해결 실행 지침서: [/nodes/troubleshooting](/nodes/troubleshooting)

## 페어링 + 상태

**WS 노드는 기기 페어링을 사용합니다.** 노드는 `connect` 중에 기기 ID를 제시합니다. 게이트웨이는 `role: node`에 대한 기기 페어링 요청을 생성합니다. 기기 CLI(또는 UI)를 통해 승인하십시오.

빠른 CLI:

```bash
openclaw devices list
openclaw devices approve <requestId>
openclaw devices reject <requestId>
openclaw nodes status
openclaw nodes describe --node <idOrNameOrIp>
```

노드가 변경된 인증 세부 정보(역할/범위/공개 키)로 재시도하면 이전 대기 중인 요청이 대체되고 새 `requestId`가 생성됩니다. 승인 전에 `openclaw devices list`를 다시 실행하십시오.

참고:

- `nodes status`는 기기 페어링 역할에 `node`가 포함된 경우 노드를 **페어링됨**으로 표시합니다.
- 기기 페어링 레코드는 내구성 있는 승인된 역할 계약입니다. 토큰 교체는 해당 계약 내에서 유지됩니다. 페어링 승인이 부여하지 않은 다른 역할로 페어링된 노드를 업그레이드할 수 없습니다.
- `node.pair.*` (CLI: `openclaw nodes pending/approve/reject/rename`)는 별도의 게이트웨이 소유 노드 페어링 저장소입니다. WS `connect` 핸드셰이크를 게이팅하지 **않습니다**.
- 승인 범위는 대기 중인 요청의 선언된 명령을 따릅니다:
  - 명령 없는 요청: `operator.pairing`
  - 비실행 노드 명령: `operator.pairing` + `operator.write`
  - `system.run` / `system.run.prepare` / `system.which`: `operator.pairing` + `operator.admin`

## 원격 노드 호스트 (system.run)

게이트웨이가 한 머신에서 실행되고 다른 머신에서 명령을 실행하려는 경우 **노드 호스트**를 사용하십시오. 모델은 여전히 **게이트웨이**와 통신합니다. `host=node`가 선택된 경우 게이트웨이는 `exec` 호출을 **노드 호스트**로 전달합니다.

### 실행 위치

- **게이트웨이 호스트**: 메시지 수신, 모델 실행, 도구 호출 라우팅.
- **노드 호스트**: 노드 머신에서 `system.run`/`system.which` 실행.
- **승인**: `~/.openclaw/exec-approvals.json`을 통해 노드 호스트에서 적용됩니다.

승인 참고:

- 승인 기반 노드 실행은 정확한 요청 컨텍스트를 바인딩합니다.
- 직접 셸/런타임 파일 실행의 경우, OpenClaw는 또한 하나의 구체적인 로컬 파일 피연산자를 최선으로 바인딩하고 실행 전에 해당 파일이 변경되면 실행을 거부합니다.
- OpenClaw가 인터프리터/런타임 명령에 대해 정확히 하나의 구체적인 로컬 파일을 식별할 수 없는 경우, 전체 런타임 커버리지를 가장하는 대신 승인 기반 실행이 거부됩니다. 더 광범위한 인터프리터 시맨틱을 위해서는 샌드박싱, 별도의 호스트 또는 명시적 신뢰 허용 목록/전체 워크플로우를 사용하십시오.

### 노드 호스트 시작 (포그라운드)

노드 머신에서:

```bash
openclaw node run --host <gateway-host> --port 18789 --display-name "Build Node"
```

### SSH 터널을 통한 원격 게이트웨이 (루프백 바인딩)

게이트웨이가 루프백에 바인딩된 경우 (`gateway.bind=loopback`, 로컬 모드 기본값),
원격 노드 호스트는 직접 연결할 수 없습니다. SSH 터널을 만들고 노드 호스트를 터널의 로컬 끝으로 연결하십시오.

예시 (노드 호스트 → 게이트웨이 호스트):

```bash
# 터미널 A (실행 유지): 로컬 18790 → 게이트웨이 127.0.0.1:18789 포워드
ssh -N -L 18790:127.0.0.1:18789 user@gateway-host

# 터미널 B: 게이트웨이 토큰을 내보내고 터널을 통해 연결
export OPENCLAW_GATEWAY_TOKEN="<gateway-token>"
openclaw node run --host 127.0.0.1 --port 18790 --display-name "Build Node"
```

참고:

- `openclaw node run`은 토큰 또는 비밀번호 인증을 지원합니다.
- 환경 변수가 선호됩니다: `OPENCLAW_GATEWAY_TOKEN` / `OPENCLAW_GATEWAY_PASSWORD`.
- 구성 폴백은 `gateway.auth.token` / `gateway.auth.password`입니다.
- 로컬 모드에서 노드 호스트는 의도적으로 `gateway.remote.token` / `gateway.remote.password`를 무시합니다.
- 원격 모드에서 `gateway.remote.token` / `gateway.remote.password`는 원격 우선 순위 규칙에 따라 적합합니다.
- 활성 로컬 `gateway.auth.*` SecretRef가 구성되어 있지만 확인되지 않은 경우, 노드 호스트 인증이 실패합니다.
- 노드 호스트 인증 확인은 `OPENCLAW_GATEWAY_*` 환경 변수만 지원합니다.

### 노드 호스트 시작 (서비스)

```bash
openclaw node install --host <gateway-host> --port 18789 --display-name "Build Node"
openclaw node restart
```

### 페어링 + 이름 지정

게이트웨이 호스트에서:

```bash
openclaw devices list
openclaw devices approve <requestId>
openclaw nodes status
```

노드가 변경된 인증 세부 정보로 재시도하면 `openclaw devices list`를 다시 실행하고 현재 `requestId`를 승인하십시오.

이름 지정 옵션:

- `openclaw node run` / `openclaw node install`의 `--display-name` (노드의 `~/.openclaw/node.json`에 저장).
- `openclaw nodes rename --node <id|name|ip> --name "Build Node"` (게이트웨이 재정의).

### 명령 허용 목록 설정

실행 승인은 **노드 호스트별**입니다. 게이트웨이에서 허용 목록 항목을 추가하십시오:

```bash
openclaw approvals allowlist add --node <id|name|ip> "/usr/bin/uname"
openclaw approvals allowlist add --node <id|name|ip> "/usr/bin/sw_vers"
```

승인은 `~/.openclaw/exec-approvals.json`의 노드 호스트에 저장됩니다.

### 노드에 실행 연결

기본값 구성 (게이트웨이 구성):

```bash
openclaw config set tools.exec.host node
openclaw config set tools.exec.security allowlist
openclaw config set tools.exec.node "<id-or-name>"
```

또는 세션별:

```
/exec host=node security=allowlist node=<id-or-name>
```

설정하면 `host=node`인 모든 `exec` 호출이 노드 호스트에서 실행됩니다 (노드 허용 목록/승인 적용).

`host=auto`는 자체적으로 노드를 암묵적으로 선택하지 않지만 `auto`에서 명시적 `host=node` 호출이 허용됩니다. 세션의 기본값으로 노드 실행을 원하면 `tools.exec.host=node` 또는 `/exec host=node ...`를 명시적으로 설정하십시오.

관련:

- [노드 호스트 CLI](/cli/node)
- [실행 도구](/tools/exec)
- [실행 승인](/tools/exec-approvals)

## 명령 호출

하위 수준 (원시 RPC):

```bash
openclaw nodes invoke --node <idOrNameOrIp> --command canvas.eval --params '{"javaScript":"location.href"}'
```

일반적인 "에이전트에게 MEDIA 첨부 파일 제공" 워크플로우를 위한 더 높은 수준의 헬퍼가 있습니다.

## 스크린샷 (canvas 스냅샷)

노드가 캔버스(WebView)를 표시 중인 경우, `canvas.snapshot`이 `{ format, base64 }`를 반환합니다.

CLI 헬퍼 (임시 파일에 쓰고 `MEDIA:<path>` 출력):

```bash
openclaw nodes canvas snapshot --node <idOrNameOrIp> --format png
openclaw nodes canvas snapshot --node <idOrNameOrIp> --format jpg --max-width 1200 --quality 0.9
```

### Canvas 컨트롤

```bash
openclaw nodes canvas present --node <idOrNameOrIp> --target https://example.com
openclaw nodes canvas hide --node <idOrNameOrIp>
openclaw nodes canvas navigate https://example.com --node <idOrNameOrIp>
openclaw nodes canvas eval --node <idOrNameOrIp> --js "document.title"
```

참고:

- `canvas present`는 URL 또는 로컬 파일 경로(`--target`)를 허용하며, 배치를 위한 선택적 `--x/--y/--width/--height`도 사용할 수 있습니다.
- `canvas eval`은 인라인 JS(`--js`) 또는 위치 인수를 허용합니다.

### A2UI (Canvas)

```bash
openclaw nodes canvas a2ui push --node <idOrNameOrIp> --text "Hello"
openclaw nodes canvas a2ui push --node <idOrNameOrIp> --jsonl ./payload.jsonl
openclaw nodes canvas a2ui reset --node <idOrNameOrIp>
```

참고:

- A2UI v0.8 JSONL만 지원됩니다 (v0.9/createSurface는 거부됨).

## 사진 + 비디오 (노드 카메라)

사진 (`jpg`):

```bash
openclaw nodes camera list --node <idOrNameOrIp>
openclaw nodes camera snap --node <idOrNameOrIp>            # 기본값: 양쪽 방향 (MEDIA 줄 2개)
openclaw nodes camera snap --node <idOrNameOrIp> --facing front
```

비디오 클립 (`mp4`):

```bash
openclaw nodes camera clip --node <idOrNameOrIp> --duration 10s
openclaw nodes camera clip --node <idOrNameOrIp> --duration 3000 --no-audio
```

참고:

- `canvas.*` 및 `camera.*`를 위해 노드가 **포그라운드** 상태여야 합니다 (백그라운드 호출은 `NODE_BACKGROUND_UNAVAILABLE`을 반환).
- 클립 길이는 과도한 base64 페이로드를 방지하기 위해 현재 `<= 60초`로 제한됩니다.
- Android는 가능한 경우 `CAMERA`/`RECORD_AUDIO` 권한을 요청합니다. 거부된 권한은 `*_PERMISSION_REQUIRED`로 실패합니다.

## 화면 녹화 (노드)

지원되는 노드는 `screen.record` (mp4)를 노출합니다. 예시:

```bash
openclaw nodes screen record --node <idOrNameOrIp> --duration 10s --fps 10
openclaw nodes screen record --node <idOrNameOrIp> --duration 10s --fps 10 --no-audio
```

참고:

- `screen.record` 가용성은 노드 플랫폼에 따라 다릅니다.
- 화면 녹화는 `<= 60초`로 제한됩니다.
- `--no-audio`는 지원되는 플랫폼에서 마이크 캡처를 비활성화합니다.
- 여러 화면이 있는 경우 `--screen <index>`로 디스플레이를 선택하십시오.

## 위치 (노드)

노드는 설정에서 위치가 활성화된 경우 `location.get`을 노출합니다.

CLI 헬퍼:

```bash
openclaw nodes location get --node <idOrNameOrIp>
openclaw nodes location get --node <idOrNameOrIp> --accuracy precise --max-age 15000 --location-timeout 10000
```

참고:

- 위치는 **기본적으로 꺼짐** 상태입니다.
- "항상"은 시스템 권한이 필요합니다. 백그라운드 가져오기는 최선 방식으로 작동합니다.
- 응답에는 위도/경도, 정확도(미터), 타임스탬프가 포함됩니다.

## SMS (Android 노드)

Android 노드는 사용자가 **SMS** 권한을 부여하고 기기가 전화 통신을 지원하는 경우 `sms.send`를 노출할 수 있습니다.

하위 수준 호출:

```bash
openclaw nodes invoke --node <idOrNameOrIp> --command sms.send --params '{"to":"+15555550123","message":"Hello from OpenClaw"}'
```

참고:

- 기능이 알려지기 전에 Android 기기에서 권한 프롬프트를 수락해야 합니다.
- 전화 통신이 없는 Wi-Fi 전용 기기는 `sms.send`를 알리지 않습니다.

## Android 기기 + 개인 데이터 명령

Android 노드는 해당 기능이 활성화된 경우 추가 명령 패밀리를 알릴 수 있습니다.

사용 가능한 패밀리:

- `device.status`, `device.info`, `device.permissions`, `device.health`
- `notifications.list`, `notifications.actions`
- `photos.latest`
- `contacts.search`, `contacts.add`
- `calendar.events`, `calendar.add`
- `callLog.search`
- `sms.search`
- `motion.activity`, `motion.pedometer`

호출 예시:

```bash
openclaw nodes invoke --node <idOrNameOrIp> --command device.status --params '{}'
openclaw nodes invoke --node <idOrNameOrIp> --command notifications.list --params '{}'
openclaw nodes invoke --node <idOrNameOrIp> --command photos.latest --params '{"limit":1}'
```

참고:

- 동작 명령은 사용 가능한 센서에 따라 기능 게이팅됩니다.

## 시스템 명령 (노드 호스트 / mac 노드)

macOS 노드는 `system.run`, `system.notify`, `system.execApprovals.get/set`을 노출합니다.
헤드리스 노드 호스트는 `system.run`, `system.which`, `system.execApprovals.get/set`을 노출합니다.

예시:

```bash
openclaw nodes notify --node <idOrNameOrIp> --title "Ping" --body "Gateway ready"
openclaw nodes invoke --node <idOrNameOrIp> --command system.which --params '{"name":"git"}'
```

참고:

- `system.run`은 페이로드에 stdout/stderr/종료 코드를 반환합니다.
- 셸 실행은 이제 `host=node`인 `exec` 도구를 통해 처리됩니다. `nodes`는 명시적 노드 명령을 위한 직접 RPC 표면으로 유지됩니다.
- `nodes invoke`는 `system.run` 또는 `system.run.prepare`를 노출하지 않습니다. 이들은 실행 경로에만 유지됩니다.
- 실행 경로는 승인 전에 표준 `systemRunPlan`을 준비합니다. 승인이 부여되면 게이트웨이는 나중에 호출자가 편집한 명령/cwd/세션 필드가 아닌 저장된 플랜을 전달합니다.
- `system.notify`는 macOS 앱의 알림 권한 상태를 준수합니다.
- 인식되지 않는 노드 `platform` / `deviceFamily` 메타데이터는 `system.run` 및 `system.which`를 제외하는 보수적인 기본 허용 목록을 사용합니다. 알 수 없는 플랫폼에 이러한 명령이 의도적으로 필요한 경우 `gateway.nodes.allowCommands`를 통해 명시적으로 추가하십시오.
- `system.run`은 `--cwd`, `--env KEY=VAL`, `--command-timeout`, `--needs-screen-recording`을 지원합니다.
- 셸 래퍼(`bash|sh|zsh ... -c/-lc`)의 경우, 요청 범위 `--env` 값이 명시적 허용 목록(`TERM`, `LANG`, `LC_*`, `COLORTERM`, `NO_COLOR`, `FORCE_COLOR`)으로 축소됩니다.
- 허용 목록 모드에서 항상 허용 결정의 경우, 알려진 디스패치 래퍼(`env`, `nice`, `nohup`, `stdbuf`, `timeout`)는 래퍼 경로 대신 내부 실행 파일 경로를 유지합니다. 언래핑이 안전하지 않은 경우 허용 목록 항목이 자동으로 유지되지 않습니다.
- 허용 목록 모드의 Windows 노드 호스트에서 `cmd.exe /c`를 통한 셸 래퍼 실행은 승인이 필요합니다 (허용 목록 항목만으로는 래퍼 형식을 자동 허용하지 않음).
- `system.notify`는 `--priority <passive|active|timeSensitive>` 및 `--delivery <system|overlay|auto>`를 지원합니다.
- 노드 호스트는 `PATH` 재정의를 무시하고 위험한 시작/셸 키(`DYLD_*`, `LD_*`, `NODE_OPTIONS`, `PYTHON*`, `PERL*`, `RUBYOPT`, `SHELLOPTS`, `PS4`)를 제거합니다. 추가 PATH 항목이 필요한 경우 `--env`를 통해 `PATH`를 전달하는 대신 노드 호스트 서비스 환경을 구성하거나 표준 위치에 도구를 설치하십시오.
- macOS 노드 모드에서 `system.run`은 macOS 앱의 실행 승인(설정 → 실행 승인)으로 게이팅됩니다.
  Ask/허용 목록/전체는 헤드리스 노드 호스트와 동일하게 작동합니다. 거부된 프롬프트는 `SYSTEM_RUN_DENIED`를 반환합니다.
- 헤드리스 노드 호스트에서 `system.run`은 실행 승인(`~/.openclaw/exec-approvals.json`)으로 게이팅됩니다.

## 실행 노드 바인딩

여러 노드가 사용 가능한 경우 실행을 특정 노드에 바인딩할 수 있습니다.
이렇게 하면 `exec host=node`의 기본 노드가 설정됩니다 (에이전트별로 재정의 가능).

전역 기본값:

```bash
openclaw config set tools.exec.node "node-id-or-name"
```

에이전트별 재정의:

```bash
openclaw config get agents.list
openclaw config set agents.list[0].tools.exec.node "node-id-or-name"
```

모든 노드를 허용하도록 설정 해제:

```bash
openclaw config unset tools.exec.node
openclaw config unset agents.list[0].tools.exec.node
```

## 권한 맵

노드는 권한 이름(예: `screenRecording`, `accessibility`)을 키로 하여 불리언 값(`true` = 부여됨)을 갖는 `permissions` 맵을 `node.list` / `node.describe`에 포함할 수 있습니다.

## 헤드리스 노드 호스트 (크로스 플랫폼)

OpenClaw는 게이트웨이 WebSocket에 연결하고 `system.run` / `system.which`를 노출하는 **헤드리스 노드 호스트** (UI 없음)를 실행할 수 있습니다. Linux/Windows에서 또는 서버와 함께 최소 노드를 실행하는 데 유용합니다.

시작하기:

```bash
openclaw node run --host <gateway-host> --port 18789
```

참고:

- 페어링은 여전히 필요합니다 (게이트웨이에 기기 페어링 프롬프트가 표시됨).
- 노드 호스트는 노드 ID, 토큰, 표시 이름, 게이트웨이 연결 정보를 `~/.openclaw/node.json`에 저장합니다.
- 실행 승인은 `~/.openclaw/exec-approvals.json`을 통해 로컬에서 적용됩니다
  ([실행 승인](/tools/exec-approvals) 참조).
- macOS에서 헤드리스 노드 호스트는 기본적으로 로컬에서 `system.run`을 실행합니다. `system.run`을 동반 앱 실행 호스트를 통해 라우팅하려면 `OPENCLAW_NODE_EXEC_HOST=app`을 설정하십시오. 앱 호스트를 요구하고 사용할 수 없는 경우 실패하게 하려면 `OPENCLAW_NODE_EXEC_FALLBACK=0`을 추가하십시오.
- 게이트웨이 WS가 TLS를 사용하는 경우 `--tls` / `--tls-fingerprint`를 추가하십시오.

## Mac 노드 모드

- macOS 메뉴바 앱은 게이트웨이 WS 서버에 노드로 연결합니다 (따라서 `openclaw nodes …`가 이 Mac에서 작동합니다).
- 원격 모드에서 앱은 게이트웨이 포트에 대한 SSH 터널을 열고 `localhost`에 연결합니다.
