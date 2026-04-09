---
title: "원격 액세스"
description: "SSH 터널(게이트웨이 WS) 및 tailnet을 사용한 원격 액세스"
---

# 원격 액세스 (SSH, 터널, tailnet)

이 리포지토리는 전용 호스트(데스크톱/서버)에서 단일 게이트웨이(마스터)를 실행하고 클라이언트를 연결하여 "SSH를 통한 원격"을 지원합니다.

- **오퍼레이터(사용자 / macOS 앱)**: SSH 터널링이 범용 폴백입니다.
- **노드(iOS/Android 및 미래 기기)**: 필요에 따라 LAN/tailnet 또는 SSH 터널로 게이트웨이 **WebSocket**에 연결합니다.

## 핵심 아이디어

- 게이트웨이 WebSocket은 구성된 포트(기본값 18789)에서 **루프백**에 바인딩됩니다.
- 원격 사용을 위해 SSH를 통해 해당 루프백 포트를 포워딩합니다(또는 tailnet/VPN을 사용하여 덜 터널링합니다).

## 일반적인 VPN/tailnet 설정 (에이전트가 있는 곳)

**게이트웨이 호스트**를 "에이전트가 있는 곳"으로 생각하십시오. 세션, 인증 프로필, 채널, 상태를 소유합니다.
노트북/데스크톱(및 노드)이 해당 호스트에 연결합니다.

### 1) tailnet의 항상 켜진 게이트웨이 (VPS 또는 홈 서버)

영구 호스트에서 게이트웨이를 실행하고 **Tailscale** 또는 SSH를 통해 도달합니다.

- **최고 UX:** `gateway.bind: "loopback"`을 유지하고 Control UI에 **Tailscale Serve**를 사용합니다.
- **폴백:** 액세스가 필요한 모든 머신에서 루프백 + SSH 터널을 유지합니다.
- **예제:** [exe.dev](/install/exe-dev) (간편 VM) 또는 [Hetzner](/install/hetzner) (프로덕션 VPS).

노트북이 자주 슬립 상태가 되지만 에이전트를 항상 켜두고 싶을 때 이상적입니다.

### 2) 홈 데스크톱이 게이트웨이를 실행하고 노트북이 원격 제어

노트북은 에이전트를 실행하지 **않습니다**. 원격으로 연결합니다:

- macOS 앱의 **SSH를 통한 원격** 모드를 사용합니다 (설정 → 일반 → "OpenClaw 실행").
- 앱은 터널을 열고 관리하므로 WebChat + 헬스 체크가 "즉시 작동"합니다.

실행 안내서: [macOS 원격 액세스](/platforms/mac/remote).

### 3) 노트북이 게이트웨이를 실행하고 다른 머신에서 원격 액세스

게이트웨이를 로컬에 유지하되 안전하게 노출합니다:

- 다른 머신에서 노트북으로 SSH 터널을 사용하거나,
- Tailscale Serve로 Control UI를 서빙하고 게이트웨이를 루프백 전용으로 유지합니다.

가이드: [Tailscale](/gateway/tailscale) 및 [웹 개요](/web).

## 명령 흐름 (무엇이 어디서 실행되는가)

하나의 게이트웨이 서비스가 상태 + 채널을 소유합니다. 노드는 주변 장치입니다.

흐름 예제 (Telegram → 노드):

- Telegram 메시지가 **게이트웨이**에 도착합니다.
- 게이트웨이는 **에이전트**를 실행하고 노드 도구를 호출할지 여부를 결정합니다.
- 게이트웨이는 게이트웨이 WebSocket(`node.*` RPC)을 통해 **노드**를 호출합니다.
- 노드는 결과를 반환하고; 게이트웨이는 Telegram으로 다시 응답합니다.

참고:

- **노드는 게이트웨이 서비스를 실행하지 않습니다.** 격리된 프로필을 의도적으로 실행하지 않는 한 호스트당 하나의 게이트웨이만 실행해야 합니다 ([멀티 게이트웨이](/gateway/multiple-gateways) 참조).
- macOS 앱 "노드 모드"는 게이트웨이 WebSocket을 통한 노드 클라이언트입니다.

## SSH 터널 (CLI + 도구)

원격 게이트웨이 WS로 로컬 터널을 생성합니다:

```bash
ssh -N -L 18789:127.0.0.1:18789 user@host
```

터널이 활성 상태에서:

- `openclaw health`와 `openclaw status --deep`이 이제 `ws://127.0.0.1:18789`를 통해 원격 게이트웨이에 도달합니다.
- `openclaw gateway status`, `openclaw gateway health`, `openclaw gateway probe`, `openclaw gateway call`은 필요할 때 `--url`을 통해 포워딩된 URL을 대상으로 할 수 있습니다.

참고: `18789`를 구성된 `gateway.port`(또는 `--port`/`OPENCLAW_GATEWAY_PORT`)로 교체합니다.
참고: `--url`을 전달하면 CLI는 구성이나 환경 자격 증명으로 폴백하지 않습니다. `--token` 또는 `--password`를 명시적으로 포함합니다.

## CLI 원격 기본값

CLI 명령이 기본적으로 사용하도록 원격 대상을 유지할 수 있습니다:

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

게이트웨이가 루프백 전용인 경우 URL을 `ws://127.0.0.1:18789`로 유지하고 먼저 SSH 터널을 엽니다.

## 자격 증명 우선순위

게이트웨이 자격 증명 해결은 호출/프로브/상태 경로 및 Discord exec 승인 모니터링에 걸쳐 하나의 공유 계약을 따릅니다:

- 명시적 자격 증명(`--token`, `--password`, 또는 도구 `gatewayToken`)은 명시적 인증을 허용하는 호출 경로에서 항상 이깁니다.
- URL 재정의 안전:
  - CLI URL 재정의(`--url`)는 암묵적 구성/환경 자격 증명을 재사용하지 않습니다.
  - 환경 URL 재정의(`OPENCLAW_GATEWAY_URL`)는 환경 자격 증명만 사용할 수 있습니다.
- 로컬 모드 기본값:
  - 토큰: `OPENCLAW_GATEWAY_TOKEN` → `gateway.auth.token` → `gateway.remote.token`
  - 비밀번호: `OPENCLAW_GATEWAY_PASSWORD` → `gateway.auth.password` → `gateway.remote.password`
- 원격 모드 기본값:
  - 토큰: `gateway.remote.token` → `OPENCLAW_GATEWAY_TOKEN` → `gateway.auth.token`
  - 비밀번호: `OPENCLAW_GATEWAY_PASSWORD` → `gateway.remote.password` → `gateway.auth.password`

## SSH를 통한 채팅 UI

WebChat은 더 이상 별도의 HTTP 포트를 사용하지 않습니다. SwiftUI 채팅 UI는 게이트웨이 WebSocket에 직접 연결됩니다.

- SSH를 통해 `18789`를 포워딩하고 (위 참조), 클라이언트를 `ws://127.0.0.1:18789`에 연결합니다.
- macOS에서는 터널을 자동으로 관리하는 앱의 "SSH를 통한 원격" 모드를 선호합니다.

## 보안 규칙 (원격/VPN)

요약: 바인드가 필요한지 확인하지 않는 한 **게이트웨이를 루프백 전용으로 유지**합니다.

- **루프백 + SSH/Tailscale Serve**가 가장 안전한 기본값입니다 (공개 노출 없음).
- 일반 텍스트 `ws://`는 기본적으로 루프백 전용입니다.
- **비루프백 바인드**(`lan`/`tailnet`/`custom`, 또는 루프백을 사용할 수 없을 때 `auto`)는 게이트웨이 인증을 사용해야 합니다: 토큰, 비밀번호, 또는 `gateway.auth.mode: "trusted-proxy"`가 있는 신원 인식 역방향 프록시.
- **Tailscale Serve**는 `gateway.auth.allowTailscale: true`일 때 신원 헤더를 통해 Control UI/WebSocket 트래픽을 인증할 수 있습니다.
- **신뢰할 수 있는 프록시** 인증은 비루프백 신원 인식 프록시 설정 전용입니다.

심층 분석: [보안](/gateway/security).

### macOS: LaunchAgent를 통한 영구 SSH 터널

#### 1단계: SSH 구성 추가

`~/.ssh/config`를 편집합니다:

```ssh
Host remote-gateway
    HostName &lt;REMOTE_IP&gt;
    User &lt;REMOTE_USER&gt;
    LocalForward 18789 127.0.0.1:18789
    IdentityFile ~/.ssh/id_rsa
```

#### 2단계: SSH 키 복사 (일회성)

```bash
ssh-copy-id -i ~/.ssh/id_rsa &lt;REMOTE_USER&gt;@&lt;REMOTE_IP&gt;
```

#### 3단계: 게이트웨이 토큰 구성

재시작 후에도 지속되도록 구성에 토큰을 저장합니다:

```bash
openclaw config set gateway.remote.token "&lt;your-token&gt;"
```

#### 4단계: LaunchAgent 생성

`~/Library/LaunchAgents/ai.openclaw.ssh-tunnel.plist`로 저장합니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
&lt;plist version="1.0"&gt;
&lt;dict&gt;
    &lt;key&gt;Label&lt;/key&gt;
    &lt;string&gt;ai.openclaw.ssh-tunnel&lt;/string&gt;
    &lt;key&gt;ProgramArguments&lt;/key&gt;
    &lt;array&gt;
        &lt;string&gt;/usr/bin/ssh&lt;/string&gt;
        &lt;string&gt;-N&lt;/string&gt;
        &lt;string&gt;remote-gateway&lt;/string&gt;
    &lt;/array&gt;
    &lt;key&gt;KeepAlive&lt;/key&gt;
    &lt;true/&gt;
    &lt;key&gt;RunAtLoad&lt;/key&gt;
    &lt;true/&gt;
&lt;/dict&gt;
&lt;/plist&gt;
```

#### 5단계: LaunchAgent 로드

```bash
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.openclaw.ssh-tunnel.plist
```

터널은 로그인 시 자동으로 시작하고, 충돌 시 재시작하며, 포워딩된 포트를 활성 상태로 유지합니다.

#### 문제 해결

터널이 실행 중인지 확인합니다:

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

| 구성 항목 | 역할 |
| --------- | ---- |
| `LocalForward 18789 127.0.0.1:18789` | 로컬 포트 18789를 원격 포트 18789로 전달 |
| `ssh -N` | 원격 명령 실행 없이 SSH (포트 포워딩만) |
| `KeepAlive` | 충돌 시 터널 자동 재시작 |
| `RunAtLoad` | 로그인 시 LaunchAgent가 로드될 때 터널 시작 |
