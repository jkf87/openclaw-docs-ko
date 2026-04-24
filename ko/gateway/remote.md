---
summary: "SSH 터널(Gateway WS)과 tailnet을 사용하는 원격 접근"
read_when:
  - 원격 gateway 설정을 실행하거나 트러블슈팅할 때
title: "원격 접근"
---

# 원격 접근 (SSH, 터널, tailnet)

이 저장소는 전용 호스트(데스크톱/서버)에서 하나의 Gateway(마스터)를 실행하고
클라이언트를 여기에 연결하는 방식으로 "SSH 기반 원격"을 지원합니다.

- **오퍼레이터 (사용자 / macOS 앱)**: SSH 터널링이 범용 폴백입니다.
- **노드 (iOS/Android 및 향후 기기)**: Gateway **WebSocket**에 연결합니다 (LAN/tailnet
  또는 필요 시 SSH 터널).

## 핵심 아이디어

- Gateway WebSocket은 구성된 포트(기본값 18789)의 **loopback**에 바인딩됩니다.
- 원격 사용 시에는 해당 loopback 포트를 SSH로 포워딩합니다 (또는 tailnet/VPN을
  사용하여 터널링을 최소화).

## 일반적인 VPN/tailnet 설정 (에이전트가 어디에 사는가)

**Gateway 호스트**를 "에이전트가 사는 곳"이라고 생각하십시오. 이 호스트가 세션,
인증 프로파일, 채널, 상태를 소유합니다. 랩톱/데스크톱(및 노드)은 이 호스트에
연결합니다.

### 1) Tailnet 내 상시 가동 Gateway (VPS 또는 홈 서버)

영속적인 호스트에서 Gateway를 실행하고 **Tailscale** 또는 SSH로 접근합니다.

- **최고의 UX:** `gateway.bind: "loopback"`을 유지하고 Control UI에 **Tailscale
  Serve**를 사용하십시오.
- **폴백:** loopback을 유지하고, 접근이 필요한 모든 머신에서 SSH 터널을 사용하십시오.
- **예시:** [exe.dev](/install/exe-dev) (간편한 VM) 또는 [Hetzner](/install/hetzner)
  (프로덕션 VPS).

랩톱이 자주 슬립 모드에 들어가지만 에이전트를 상시 가동하고 싶을 때 이상적입니다.

### 2) 홈 데스크톱이 Gateway를 실행하고 랩톱이 원격 제어

랩톱은 에이전트를 **실행하지 않습니다**. 대신 원격으로 연결합니다:

- macOS 앱의 **Remote over SSH** 모드 사용 (Settings → General → "OpenClaw runs").
- 앱이 터널을 열고 관리하므로 WebChat + 헬스 체크가 "그냥 동작합니다".

Runbook: [macOS 원격 접근](/platforms/mac/remote).

### 3) 랩톱이 Gateway를 실행하고 다른 머신에서 원격 접근

Gateway는 로컬에 두되 안전하게 노출합니다:

- 다른 머신에서 랩톱으로 SSH 터널링을 하거나,
- Control UI에 Tailscale Serve를 사용하고 Gateway는 loopback 전용으로 유지합니다.

가이드: [Tailscale](/gateway/tailscale) 및 [웹 개요](/web/).

## 명령 흐름 (무엇이 어디서 실행되는가)

하나의 gateway 서비스가 상태와 채널을 소유합니다. 노드는 주변 장치입니다.

흐름 예시 (Telegram → 노드):

- Telegram 메시지가 **Gateway**에 도착합니다.
- Gateway가 **에이전트**를 실행하고 노드 툴을 호출할지 결정합니다.
- Gateway가 Gateway WebSocket을 통해 **노드**를 호출합니다 (`node.*` RPC).
- 노드가 결과를 반환하면, Gateway가 Telegram으로 응답을 되돌려 보냅니다.

참고 사항:

- **노드는 gateway 서비스를 실행하지 않습니다.** 격리된 프로파일을 의도적으로
  실행하는 경우가 아니라면 호스트당 하나의 gateway만 실행해야 합니다
  ([다중 gateway](/gateway/multiple-gateways) 참조).
- macOS 앱의 "node 모드"는 Gateway WebSocket을 통한 노드 클라이언트일 뿐입니다.

## SSH 터널 (CLI + 툴)

원격 Gateway WS로의 로컬 터널 생성:

```bash
ssh -N -L 18789:127.0.0.1:18789 user@host
```

터널이 활성화되면:

- `openclaw health`와 `openclaw status --deep`이 `ws://127.0.0.1:18789`를 통해
  원격 gateway에 도달합니다.
- `openclaw gateway status`, `openclaw gateway health`, `openclaw gateway probe`,
  `openclaw gateway call`도 필요 시 `--url`을 통해 포워딩된 URL을 대상으로 할
  수 있습니다.

참고: `18789`를 구성된 `gateway.port`(또는 `--port`/`OPENCLAW_GATEWAY_PORT`)로
교체하십시오.
참고: `--url`을 전달하면 CLI는 구성 또는 환경 자격 증명으로 폴백하지 않습니다.
`--token` 또는 `--password`를 명시적으로 포함해야 합니다. 명시적 자격 증명
누락은 오류입니다.

## CLI 원격 기본값

CLI 명령이 기본적으로 사용할 원격 타깃을 영구화할 수 있습니다:

```json5
{
  gateway: {
    mode: "remote",
    remote: {
      url: "ws://127.0.0.1:18789",
      token: "your-token",
    },
  },
}
```

gateway가 loopback 전용일 때는 URL을 `ws://127.0.0.1:18789`로 유지하고 먼저
SSH 터널을 여십시오.

## 자격 증명 우선순위

Gateway 자격 증명 해석은 call/probe/status 경로와 Discord exec-approval
모니터링에서 하나의 공유 계약을 따릅니다. Node-host도 동일한 기본 계약을
사용하되, 로컬 모드 예외가 하나 있습니다 (의도적으로 `gateway.remote.*`를
무시합니다):

- 명시적 자격 증명(`--token`, `--password`, 또는 툴 `gatewayToken`)은 명시적
  인증을 허용하는 call 경로에서 항상 우선합니다.
- URL 재정의 안전성:
  - CLI URL 재정의(`--url`)는 암묵적 구성/환경 자격 증명을 재사용하지
    **않습니다**.
  - 환경 URL 재정의(`OPENCLAW_GATEWAY_URL`)는 환경 자격 증명만 사용할 수
    있습니다 (`OPENCLAW_GATEWAY_TOKEN` / `OPENCLAW_GATEWAY_PASSWORD`).
- 로컬 모드 기본값:
  - token: `OPENCLAW_GATEWAY_TOKEN` -> `gateway.auth.token` -> `gateway.remote.token`
    (remote 폴백은 로컬 인증 토큰 입력이 설정되지 않은 경우에만 적용)
  - password: `OPENCLAW_GATEWAY_PASSWORD` -> `gateway.auth.password` ->
    `gateway.remote.password` (remote 폴백은 로컬 인증 패스워드 입력이 설정되지
    않은 경우에만 적용)
- 원격 모드 기본값:
  - token: `gateway.remote.token` -> `OPENCLAW_GATEWAY_TOKEN` -> `gateway.auth.token`
  - password: `OPENCLAW_GATEWAY_PASSWORD` -> `gateway.remote.password` ->
    `gateway.auth.password`
- Node-host 로컬 모드 예외: `gateway.remote.token` / `gateway.remote.password`는
  무시됩니다.
- 원격 probe/status 토큰 검사는 기본적으로 엄격합니다: 원격 모드를 대상으로
  할 때 `gateway.remote.token`만 사용합니다 (로컬 토큰 폴백 없음).
- Gateway 환경 재정의는 `OPENCLAW_GATEWAY_*`만 사용합니다.

## SSH를 통한 채팅 UI

WebChat은 더 이상 별도의 HTTP 포트를 사용하지 않습니다. SwiftUI 채팅 UI는
Gateway WebSocket에 직접 연결됩니다.

- `18789`를 SSH로 포워딩한 후 (위 참조), 클라이언트를 `ws://127.0.0.1:18789`에
  연결하십시오.
- macOS에서는 터널을 자동으로 관리하는 앱의 "Remote over SSH" 모드를
  선호하십시오.

## macOS 앱 "Remote over SSH"

macOS 메뉴 바 앱은 동일한 설정을 엔드투엔드로 구동할 수 있습니다 (원격 상태
점검, WebChat, Voice Wake 포워딩).

Runbook: [macOS 원격 접근](/platforms/mac/remote).

## 보안 규칙 (원격/VPN)

짧게 말해: 바인드가 꼭 필요하다고 확신하지 않는 한 **Gateway를 loopback
전용으로 유지하십시오**.

- **Loopback + SSH/Tailscale Serve**가 가장 안전한 기본값입니다 (공개 노출 없음).
- 평문 `ws://`는 기본적으로 loopback 전용입니다. 신뢰할 수 있는 사설 네트워크의
  경우, 클라이언트 프로세스에서 `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1`을
  긴급 탈출(break-glass) 수단으로 설정하십시오.
- **비-loopback 바인드**(`lan`/`tailnet`/`custom`, 또는 loopback을 사용할 수
  없을 때의 `auto`)는 gateway 인증을 사용해야 합니다: token, password, 또는
  `gateway.auth.mode: "trusted-proxy"`가 설정된 ID 인식 리버스 프록시.
- `gateway.remote.token` / `.password`는 클라이언트 자격 증명 소스입니다. 이들
  자체로는 서버 인증을 구성하지 **않습니다**.
- 로컬 call 경로는 `gateway.auth.*`가 설정되지 않은 경우에만 `gateway.remote.*`를
  폴백으로 사용할 수 있습니다.
- `gateway.auth.token` / `gateway.auth.password`가 SecretRef를 통해 명시적으로
  구성되었지만 해석되지 않는 경우, 해석은 실패-클로즈드됩니다 (원격 폴백
  마스킹 없음).
- `gateway.remote.tlsFingerprint`는 `wss://` 사용 시 원격 TLS 인증서를
  고정(pin)합니다.
- **Tailscale Serve**는 `gateway.auth.allowTailscale: true`일 때 ID 헤더를 통해
  Control UI/WebSocket 트래픽을 인증할 수 있습니다. HTTP API 엔드포인트는
  해당 Tailscale 헤더 인증을 사용하지 **않으며**, 대신 gateway의 일반 HTTP
  인증 모드를 따릅니다. 이 토큰 없는 흐름은 gateway 호스트가 신뢰된다고
  가정합니다. 모든 곳에서 공유 비밀 인증을 원하면 `false`로 설정하십시오.
- **Trusted-proxy** 인증은 비-loopback ID 인식 프록시 설정 전용입니다.
  동일 호스트 loopback 리버스 프록시는 `gateway.auth.mode: "trusted-proxy"`를
  만족하지 않습니다.
- 브라우저 제어를 오퍼레이터 접근처럼 취급하십시오: tailnet 전용 + 의도적인
  노드 페어링.

심층 가이드: [보안](/gateway/security/).

### macOS: LaunchAgent를 통한 영속 SSH 터널

원격 gateway에 연결하는 macOS 클라이언트의 경우, 가장 간편한 영속 설정은
SSH `LocalForward` 구성 항목과 재부팅 및 크래시에도 터널을 유지하는
LaunchAgent를 함께 사용하는 것입니다.

#### 1단계: SSH 구성 추가

`~/.ssh/config`를 편집합니다:

```ssh
Host remote-gateway
    HostName <REMOTE_IP>
    User <REMOTE_USER>
    LocalForward 18789 127.0.0.1:18789
    IdentityFile ~/.ssh/id_rsa
```

`<REMOTE_IP>`와 `<REMOTE_USER>`를 자신의 값으로 교체하십시오.

#### 2단계: SSH 키 복사 (일회성)

```bash
ssh-copy-id -i ~/.ssh/id_rsa <REMOTE_USER>@<REMOTE_IP>
```

#### 3단계: gateway 토큰 구성

재시작 간에도 유지되도록 토큰을 구성에 저장합니다:

```bash
openclaw config set gateway.remote.token "<your-token>"
```

#### 4단계: LaunchAgent 생성

이 내용을 `~/Library/LaunchAgents/ai.openclaw.ssh-tunnel.plist`로 저장합니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>ai.openclaw.ssh-tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/ssh</string>
        <string>-N</string>
        <string>remote-gateway</string>
    </array>
    <key>KeepAlive</key>
    <true/>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

#### 5단계: LaunchAgent 로드

```bash
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.openclaw.ssh-tunnel.plist
```

터널은 로그인 시 자동으로 시작되고, 크래시 시 재시작되며, 포워딩된 포트를
계속 유지합니다.

참고: 이전 설정에서 남은 `com.openclaw.ssh-tunnel` LaunchAgent가 있다면
언로드하고 삭제하십시오.

#### 트러블슈팅

터널 실행 여부 확인:

```bash
ps aux | grep "ssh -N remote-gateway" | grep -v grep
lsof -i :18789
```

터널 재시작:

```bash
launchctl kickstart -k gui/$UID/ai.openclaw.ssh-tunnel
```

터널 중지:

```bash
launchctl bootout gui/$UID/ai.openclaw.ssh-tunnel
```

| 구성 항목                            | 동작                                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| `LocalForward 18789 127.0.0.1:18789` | 로컬 포트 18789를 원격 포트 18789로 포워딩                        |
| `ssh -N`                             | 원격 명령을 실행하지 않는 SSH (포트 포워딩 전용)                  |
| `KeepAlive`                          | 크래시 시 터널을 자동으로 재시작                                  |
| `RunAtLoad`                          | 로그인 시 LaunchAgent가 로드될 때 터널 시작                       |

## 관련 문서

- [Tailscale](/gateway/tailscale)
- [인증](/gateway/authentication)
- [원격 gateway 설정](/gateway/remote-gateway-readme)
