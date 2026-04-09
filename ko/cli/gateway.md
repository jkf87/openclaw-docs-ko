---
summary: "OpenClaw Gateway CLI (`openclaw gateway`) — 게이트웨이 실행, 쿼리, 탐색"
read_when:
  - CLI에서 Gateway 실행 (개발 또는 서버)
  - Gateway 인증, 바인드 모드, 연결 디버깅
  - Bonjour를 통한 게이트웨이 탐색 (로컬 + 광역 DNS-SD)
title: "gateway"
---

# Gateway CLI

Gateway는 OpenClaw의 WebSocket 서버 (채널, 노드, 세션, 훅)입니다.

이 페이지의 하위 명령은 `openclaw gateway …` 아래에 있습니다.

관련 문서:

- [/gateway/bonjour](/gateway/bonjour)
- [/gateway/discovery](/gateway/discovery)
- [/gateway/configuration](/gateway/configuration)

## Gateway 실행

로컬 Gateway 프로세스 실행:

```bash
openclaw gateway
```

포그라운드 별칭:

```bash
openclaw gateway run
```

참고사항:

- 기본적으로 Gateway는 `~/.openclaw/openclaw.json`에 `gateway.mode=local`이 설정되어 있지 않으면 시작을 거부합니다. 임시/개발 실행에는 `--allow-unconfigured`를 사용하세요.
- `openclaw onboard --mode local` 및 `openclaw setup`은 `gateway.mode=local`을 작성해야 합니다. 파일이 존재하지만 `gateway.mode`가 누락된 경우 암묵적으로 로컬 모드를 가정하는 대신 손상되거나 덮어쓰여진 구성으로 처리하고 수리하세요.
- 파일이 존재하고 `gateway.mode`가 누락된 경우 Gateway는 이를 의심스러운 구성 손상으로 처리하고 대신 로컬을 추측하는 것을 거부합니다.
- 인증 없이 루프백 이상의 바인딩은 차단됩니다 (안전 가드레일).
- `SIGUSR1`은 승인된 경우 (`commands.restart`가 기본적으로 활성화됨; 수동 재시작을 차단하려면 `commands.restart: false`로 설정하고 게이트웨이 툴/구성 적용/업데이트는 허용 유지) 인프로세스 재시작을 트리거합니다.
- `SIGINT`/`SIGTERM` 핸들러는 게이트웨이 프로세스를 중지하지만 사용자 정의 터미널 상태를 복원하지 않습니다. CLI를 TUI 또는 원시 모드 입력으로 래핑하는 경우 종료 전에 터미널을 복원하세요.

### 옵션

- `--port <port>`: WebSocket 포트 (기본값은 구성/env에서 옴; 보통 `18789`).
- `--bind <loopback|lan|tailnet|auto|custom>`: 리스너 바인드 모드.
- `--auth <token|password>`: 인증 모드 재정의.
- `--token <token>`: 토큰 재정의 (프로세스에 `OPENCLAW_GATEWAY_TOKEN`도 설정).
- `--password <password>`: 비밀번호 재정의. 경고: 인라인 비밀번호는 로컬 프로세스 목록에 노출될 수 있습니다.
- `--password-file <path>`: 파일에서 게이트웨이 비밀번호 읽기.
- `--tailscale <off|serve|funnel>`: Tailscale을 통해 Gateway 노출.
- `--tailscale-reset-on-exit`: 종료 시 Tailscale serve/funnel 구성 재설정.
- `--allow-unconfigured`: 구성에 `gateway.mode=local` 없이 게이트웨이 시작 허용. 이것은 임시/개발 부트스트랩에만 시작 가드를 우회하며 구성 파일을 작성하거나 수리하지 않습니다.
- `--dev`: 누락된 경우 개발 구성 + 워크스페이스 생성 (BOOTSTRAP.md 건너뜀).
- `--reset`: 개발 구성 + 자격 증명 + 세션 + 워크스페이스 재설정 (`--dev` 필요).
- `--force`: 시작 전에 선택된 포트의 기존 리스너 종료.
- `--verbose`: 상세 로그.
- `--cli-backend-logs`: 콘솔에서 CLI 백엔드 로그만 표시 (stdout/stderr 활성화).
- `--ws-log <auto|full|compact>`: WebSocket 로그 스타일 (기본값 `auto`).
- `--compact`: `--ws-log compact`의 별칭.
- `--raw-stream`: jsonl에 원시 모델 스트림 이벤트 기록.
- `--raw-stream-path <path>`: 원시 스트림 jsonl 경로.

## 실행 중인 Gateway 쿼리

모든 쿼리 명령은 WebSocket RPC를 사용합니다.

출력 모드:

- 기본: 사람이 읽을 수 있음 (TTY에서 색상).
- `--json`: 기계 판독 가능한 JSON (스타일링/스피너 없음).
- `--no-color` (또는 `NO_COLOR=1`): 사람이 읽는 레이아웃을 유지하면서 ANSI 비활성화.

공유 옵션 (지원되는 경우):

- `--url <url>`: Gateway WebSocket URL.
- `--token <token>`: Gateway 토큰.
- `--password <password>`: Gateway 비밀번호.
- `--timeout <ms>`: 타임아웃/예산 (명령마다 다름).
- `--expect-final`: "최종" 응답 대기 (에이전트 호출).

참고: `--url`을 설정하면 CLI는 구성 또는 환경 자격 증명으로 폴백하지 않습니다. `--token` 또는 `--password`를 명시적으로 전달하세요. 명시적 자격 증명 누락은 오류입니다.

### `gateway health`

```bash
openclaw gateway health --url ws://127.0.0.1:18789
```

### `gateway usage-cost`

세션 로그에서 사용 비용 요약 가져오기.

```bash
openclaw gateway usage-cost
openclaw gateway usage-cost --days 7
openclaw gateway usage-cost --json
```

옵션:

- `--days <days>`: 포함할 일 수 (기본값 `30`).

### `gateway status`

`gateway status`는 Gateway 서비스 (launchd/systemd/schtasks)와 선택적 RPC 프로브를 표시합니다.

```bash
openclaw gateway status
openclaw gateway status --json
openclaw gateway status --require-rpc
```

옵션:

- `--url <url>`: 명시적 프로브 대상 추가. 구성된 원격 + 로컬호스트는 여전히 프로브됩니다.
- `--token <token>`: 프로브를 위한 토큰 인증.
- `--password <password>`: 프로브를 위한 비밀번호 인증.
- `--timeout <ms>`: 프로브 타임아웃 (기본값 `10000`).
- `--no-probe`: RPC 프로브 건너뜀 (서비스 전용 뷰).
- `--deep`: 시스템 수준 서비스도 스캔.
- `--require-rpc`: RPC 프로브 실패 시 0이 아닌 종료. `--no-probe`와 결합할 수 없음.

참고사항:

- `gateway status`는 로컬 CLI 구성이 누락되거나 유효하지 않아도 진단을 위해 사용 가능합니다.
- `gateway status`는 가능한 경우 프로브 인증을 위해 구성된 인증 SecretRef를 확인합니다.
- 이 명령 경로에서 필수 인증 SecretRef가 확인되지 않은 경우 프로브 연결/인증이 실패할 때 `gateway status --json`은 `rpc.authWarning`을 보고합니다.
- 프로브가 성공하면 확인되지 않은 인증 ref 경고는 억제됩니다.
- 스크립트 및 자동화에서 리스닝 서비스로 충분하지 않고 Gateway RPC 자체가 정상이어야 할 때 `--require-rpc`를 사용하세요.
- `--deep`은 추가 launchd/systemd/schtasks 설치에 대한 최선의 스캔을 추가합니다.
- 사람이 읽을 수 있는 출력에는 확인된 파일 로그 경로와 프로파일 또는 상태 디렉터리 드리프트 진단에 도움이 되는 CLI 대 서비스 구성 경로/유효성 스냅샷이 포함됩니다.
- Linux systemd 설치에서 서비스 인증 드리프트 검사는 단위에서 `Environment=` 및 `EnvironmentFile=` 값을 모두 읽습니다 (`%h`, 인용된 경로, 여러 파일, 선택적 `-` 파일 포함).
- 드리프트 검사는 병합된 런타임 env를 사용하여 `gateway.auth.token` SecretRef를 확인합니다.
- 토큰 인증이 효과적으로 활성화되지 않은 경우 토큰 드리프트 검사는 구성 토큰 확인을 건너뜁니다.

### `gateway probe`

`gateway probe`는 "모든 것을 디버그" 명령입니다. 항상 다음을 프로브합니다:

- 구성된 원격 게이트웨이 (설정된 경우), 그리고
- 로컬호스트 (루프백) **원격이 구성된 경우에도**.

`--url`을 전달하면 해당 명시적 대상이 두 대상 앞에 추가됩니다. 사람이 읽을 수 있는 출력은 다음과 같이 대상에 레이블을 붙입니다:

- `URL (explicit)`
- `Remote (configured)` 또는 `Remote (configured, inactive)`
- `Local loopback`

여러 게이트웨이에 도달 가능한 경우 모두 출력합니다. 여러 게이트웨이는 격리된 프로파일/포트를 사용할 때 지원되지만 (예: 구조 봇) 대부분의 설치는 여전히 단일 게이트웨이를 실행합니다.

```bash
openclaw gateway probe
openclaw gateway probe --json
```

해석:

- `Reachable: yes`는 하나 이상의 대상이 WebSocket 연결을 수락했음을 의미합니다.
- `RPC: ok`는 세부 RPC 호출 (`health`/`status`/`system-presence`/`config.get`)도 성공했음을 의미합니다.
- `RPC: limited - missing scope: operator.read`는 연결이 성공했지만 세부 RPC가 범위 제한됨을 의미합니다. 이것은 완전한 실패가 아닌 **저하된** 도달 가능성으로 보고됩니다.
- 종료 코드는 프로브된 대상에 도달할 수 없는 경우에만 0이 아닙니다.

JSON 참고사항 (`--json`):

- 최상위:
  - `ok`: 하나 이상의 대상에 도달 가능.
  - `degraded`: 하나 이상의 대상에 범위 제한된 세부 RPC가 있음.
  - `primaryTargetId`: 이 순서로 활성 우승자로 처리할 최상의 대상: 명시적 URL, SSH 터널, 구성된 원격, 그 다음 로컬 루프백.
  - `warnings[]`: `code`, `message`, 선택적 `targetIds`가 있는 최선의 경고 레코드.
  - `network`: 현재 구성 및 호스트 네트워킹에서 파생된 로컬 루프백/tailnet URL 힌트.
  - `discovery.timeoutMs` 및 `discovery.count`: 이 프로브 패스에 사용된 실제 탐색 예산/결과 수.
- 대상별 (`targets[].connect`):
  - `ok`: 연결 + 저하 분류 후 도달 가능성.
  - `rpcOk`: 전체 세부 RPC 성공.
  - `scopeLimited`: 누락된 운영자 범위로 인해 세부 RPC가 실패함.

일반 경고 코드:

- `ssh_tunnel_failed`: SSH 터널 설정 실패; 명령이 직접 프로브로 폴백됨.
- `multiple_gateways`: 하나 이상의 대상에 도달 가능; 구조 봇과 같이 격리된 프로파일을 의도적으로 실행하지 않는 한 이례적.
- `auth_secretref_unresolved`: 실패한 대상에 대해 구성된 인증 SecretRef를 확인할 수 없었음.
- `probe_scope_limited`: WebSocket 연결은 성공했지만 누락된 `operator.read`로 인해 세부 RPC가 제한됨.

#### SSH를 통한 원격 (Mac 앱 패리티)

macOS 앱 "SSH를 통한 원격" 모드는 로컬 포트 포워드를 사용하여 원격 게이트웨이 (루프백에만 바인딩될 수 있음)가 `ws://127.0.0.1:<port>`에서 도달 가능하게 합니다.

CLI 동등:

```bash
openclaw gateway probe --ssh user@gateway-host
```

옵션:

- `--ssh <target>`: `user@host` 또는 `user@host:port` (포트 기본값 `22`).
- `--ssh-identity <path>`: ID 파일.
- `--ssh-auto`: 확인된 탐색 엔드포인트 (`local.` 더하기 구성된 광역 도메인, 있는 경우)에서 첫 번째 발견된 게이트웨이 호스트를 SSH 대상으로 선택. TXT 전용 힌트는 무시됨.

구성 (선택 사항, 기본값으로 사용):

- `gateway.remote.sshTarget`
- `gateway.remote.sshIdentity`

### `gateway call <method>`

저수준 RPC 도우미.

```bash
openclaw gateway call status
openclaw gateway call logs.tail --params '{"sinceMs": 60000}'
```

옵션:

- `--params <json>`: 매개변수를 위한 JSON 객체 문자열 (기본값 `{}`)
- `--url <url>`
- `--token <token>`
- `--password <password>`
- `--timeout <ms>`
- `--expect-final`
- `--json`

참고사항:

- `--params`는 유효한 JSON이어야 합니다.
- `--expect-final`은 주로 최종 페이로드 전에 중간 이벤트를 스트리밍하는 에이전트 스타일 RPC에 사용됩니다.

## Gateway 서비스 관리

```bash
openclaw gateway install
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw gateway uninstall
```

명령 옵션:

- `gateway status`: `--url`, `--token`, `--password`, `--timeout`, `--no-probe`, `--require-rpc`, `--deep`, `--json`
- `gateway install`: `--port`, `--runtime <node|bun>`, `--token`, `--force`, `--json`
- `gateway uninstall|start|stop|restart`: `--json`

참고사항:

- `gateway install`은 `--port`, `--runtime`, `--token`, `--force`, `--json`을 지원합니다.
- 토큰 인증에 토큰이 필요하고 `gateway.auth.token`이 SecretRef 관리인 경우 `gateway install`은 SecretRef가 확인 가능한지 검증하지만 확인된 토큰을 서비스 환경 메타데이터에 유지하지 않습니다.
- 토큰 인증에 토큰이 필요하고 구성된 토큰 SecretRef가 확인되지 않으면 설치가 실패 처리됩니다.
- `gateway run`의 비밀번호 인증에는 인라인 `--password`보다 `OPENCLAW_GATEWAY_PASSWORD`, `--password-file`, 또는 SecretRef 기반 `gateway.auth.password`를 선호하세요.
- 추론된 인증 모드에서 셸 전용 `OPENCLAW_GATEWAY_PASSWORD`는 설치 토큰 요구 사항을 완화하지 않습니다. 관리 서비스를 설치할 때 지속 가능한 구성 (`gateway.auth.password` 또는 구성 `env`)을 사용하세요.
- `gateway.auth.token`과 `gateway.auth.password`가 모두 구성되고 `gateway.auth.mode`가 설정되지 않은 경우 모드가 명시적으로 설정될 때까지 설치가 차단됩니다.
- 라이프사이클 명령은 스크립팅을 위해 `--json`을 허용합니다.

## 게이트웨이 탐색 (Bonjour)

`gateway discover`는 게이트웨이 비콘 (`_openclaw-gw._tcp`)을 스캔합니다.

- 멀티캐스트 DNS-SD: `local.`
- 유니캐스트 DNS-SD (광역 Bonjour): 도메인을 선택하고 (예: `openclaw.internal.`) 분할 DNS + DNS 서버를 설정하세요. [/gateway/bonjour](/gateway/bonjour) 참조

기본적으로 Bonjour 탐색이 활성화된 게이트웨이만 비콘을 알립니다.

광역 탐색 레코드에는 다음이 포함됩니다 (TXT):

- `role` (게이트웨이 역할 힌트)
- `transport` (전송 힌트, 예: `gateway`)
- `gatewayPort` (WebSocket 포트, 보통 `18789`)
- `sshPort` (선택 사항; 없는 경우 클라이언트 기본 SSH 대상은 `22`)
- `tailnetDns` (MagicDNS 호스트명, 사용 가능한 경우)
- `gatewayTls` / `gatewayTlsSha256` (TLS 활성화 + 인증서 지문)
- `cliPath` (광역 존에 작성된 원격 설치 힌트)

### `gateway discover`

```bash
openclaw gateway discover
```

옵션:

- `--timeout <ms>`: 명령별 타임아웃 (탐색/확인); 기본값 `2000`.
- `--json`: 기계 판독 가능한 출력 (스타일링/스피너도 비활성화).

예시:

```bash
openclaw gateway discover --timeout 4000
openclaw gateway discover --json | jq '.beacons[].wsUrl'
```

참고사항:

- CLI는 `local.`과 광역 도메인이 활성화된 경우 구성된 광역 도메인을 스캔합니다.
- JSON 출력의 `wsUrl`은 `lanHost` 또는 `tailnetDns`와 같은 TXT 전용 힌트가 아닌 확인된 서비스 엔드포인트에서 파생됩니다.
- `local.` mDNS에서 `sshPort` 및 `cliPath`는 `discovery.mdns.mode`가 `full`인 경우에만 방송됩니다. 광역 DNS-SD는 여전히 `cliPath`를 작성하며 `sshPort`는 거기서도 선택 사항입니다.
