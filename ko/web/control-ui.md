---
summary: "게이트웨이용 브라우저 기반 Control UI (채팅, 노드, 구성)"
read_when:
  - You want to operate the Gateway from a browser
  - You want Tailnet access without SSH tunnels
title: "Control UI"
---

# Control UI (브라우저)

Control UI는 게이트웨이에서 제공하는 작은 **Vite + Lit** 단일 페이지 앱입니다:

- 기본값: `http://<host>:18789/`
- 선택적 접두사: `gateway.controlUi.basePath` 설정 (예: `/openclaw`)

동일한 포트의 **게이트웨이 WebSocket에 직접** 연결합니다.

## 빠른 열기 (로컬)

게이트웨이가 동일한 컴퓨터에서 실행 중인 경우 다음을 여십시오:

- [http://127.0.0.1:18789/](http://127.0.0.1:18789/) (또는 [http://localhost:18789/](http://localhost:18789/))

페이지 로드에 실패하면 먼저 게이트웨이를 시작하십시오: `openclaw gateway`.

인증은 WebSocket 핸드셰이크 중에 다음을 통해 제공됩니다:

- `connect.params.auth.token`
- `connect.params.auth.password`
- `gateway.auth.allowTailscale: true`인 경우 Tailscale Serve 아이덴티티 헤더
- `gateway.auth.mode: "trusted-proxy"`인 경우 trusted-proxy 아이덴티티 헤더

대시보드 설정 패널은 현재 브라우저 탭 세션과 선택된 게이트웨이 URL에 대한 토큰을 유지합니다. 비밀번호는 유지되지 않습니다. 온보딩은 일반적으로 첫 번째 연결에서 공유 비밀 인증을 위한 게이트웨이 토큰을 생성하지만 `gateway.auth.mode`가 `"password"`인 경우 비밀번호 인증도 작동합니다.

## 기기 페어링 (첫 번째 연결)

새 브라우저 또는 기기에서 Control UI에 연결하면 게이트웨이는 **일회성 페어링 승인**을 요구합니다 — `gateway.auth.allowTailscale: true`로 동일한 Tailnet에 있더라도.

**표시 내용:** "disconnected (1008): pairing required"

**기기를 승인하려면:**

```bash
# 대기 중인 요청 나열
openclaw devices list

# 요청 ID로 승인
openclaw devices approve <requestId>
```

브라우저가 변경된 인증 세부 정보 (역할/범위/공개 키)로 페어링을 다시 시도하면 이전 대기 중인 요청이 대체되고 새 `requestId`가 생성됩니다. 승인 전에 `openclaw devices list`를 다시 실행하십시오.

승인되면 기기가 기억되며 `openclaw devices revoke --device <id> --role <role>`로 취소하지 않는 한 재승인이 필요하지 않습니다. 토큰 교체 및 취소에 대해서는 [기기 CLI](/cli/devices)를 참조하십시오.

**참고:**

- 직접 로컬 루프백 브라우저 연결 (`127.0.0.1` / `localhost`)은 자동 승인됩니다.
- 동일한 머신에서 발생하더라도 Tailnet 및 LAN 브라우저 연결은 여전히 명시적 승인이 필요합니다.
- 각 브라우저 프로필은 고유한 기기 ID를 생성하므로 브라우저를 전환하거나 브라우저 데이터를 지우면 재페어링이 필요합니다.

## 언어 지원

Control UI는 첫 번째 로드 시 브라우저 로케일에 따라 자동으로 현지화될 수 있습니다.
나중에 재정의하려면 **개요 -> 게이트웨이 액세스 -> 언어**를 여십시오. 로케일 선택기는 모양 아래가 아닌 게이트웨이 액세스 카드에 있습니다.

- 지원되는 로케일: `en`, `zh-CN`, `zh-TW`, `pt-BR`, `de`, `es`, `ja-JP`, `ko`, `fr`, `tr`, `uk`, `id`, `pl`
- 영어 이외의 번역은 브라우저에서 지연 로드됩니다.
- 선택된 로케일은 브라우저 저장소에 저장되어 이후 방문 시 재사용됩니다.
- 누락된 번역 키는 영어로 폴백됩니다.

## 현재 할 수 있는 것

- 게이트웨이 WS를 통해 모델과 채팅 (`chat.history`, `chat.send`, `chat.abort`, `chat.inject`)
- 채팅에서 도구 호출 + 라이브 도구 출력 카드 스트리밍 (에이전트 이벤트)
- 채널: 내장 및 번들/외부 플러그인 채널 상태, QR 로그인 및 채널별 구성 (`channels.status`, `web.login.*`, `config.patch`)
- 인스턴스: 존재 목록 + 새로 고침 (`system-presence`)
- 세션: 목록 + 세션별 모델/생각/빠른/상세/추론 재정의 (`sessions.list`, `sessions.patch`)
- Dreams: 꿈꾸기 상태, 활성화/비활성화 토글 및 Dream Diary 읽기 (`doctor.memory.status`, `doctor.memory.dreamDiary`, `config.patch`)
- Cron 작업: 목록/추가/편집/실행/활성화/비활성화 + 실행 기록 (`cron.*`)
- 스킬: 상태, 활성화/비활성화, 설치, API 키 업데이트 (`skills.*`)
- 노드: 목록 + 기능 (`node.list`)
- Exec 승인: `exec host=gateway/node`에 대한 게이트웨이 또는 노드 허용 목록 + ask 정책 편집 (`exec.approvals.*`)
- 구성: `~/.openclaw/openclaw.json` 보기/편집 (`config.get`, `config.set`)
- 구성: 유효성 검사를 통한 적용 + 재시작 (`config.apply`) 및 마지막 활성 세션 깨우기
- 디버그: 상태/상태/모델 스냅샷 + 이벤트 로그 + 수동 RPC 호출 (`status`, `health`, `models.list`)
- 로그: 필터/내보내기를 사용한 게이트웨이 파일 로그의 실시간 테일 (`logs.tail`)
- 업데이트: 재시작 보고서와 함께 패키지/git 업데이트 + 재시작 실행 (`update.run`)

## 채팅 동작

- `chat.send`는 **비차단**입니다: 즉시 `{ runId, status: "started" }`로 확인하고 응답은 `chat` 이벤트를 통해 스트리밍됩니다.
- 동일한 `idempotencyKey`로 다시 전송하면 실행 중에는 `{ status: "in_flight" }`를 반환하고 완료 후에는 `{ status: "ok" }`를 반환합니다.
- 채팅 헤더 모델과 생각 선택기는 `sessions.patch`를 통해 즉시 활성 세션을 패치합니다. 이는 일회성 전송 옵션이 아닌 영구적인 세션 재정의입니다.
- 중지:
  - **Stop** 클릭 (`chat.abort` 호출)
  - `/stop` 입력 (또는 `stop`, `stop action`, `stop run`, `stop openclaw`, `please stop` 같은 대역 외 중단 문구)
  - `chat.abort`는 해당 세션의 모든 활성 실행을 중단하는 `{ sessionKey }` (no `runId`)를 지원합니다

## Tailnet 액세스 (권장)

### 통합 Tailscale Serve (선호)

게이트웨이를 루프백에 유지하고 Tailscale Serve가 HTTPS로 프록시하도록 하십시오:

```bash
openclaw gateway --tailscale serve
```

열기:

- `https://<magicdns>/` (또는 구성된 `gateway.controlUi.basePath`)

### Tailnet 바인드 + 토큰

```bash
openclaw gateway --bind tailnet --token "$(openssl rand -hex 32)"
```

그런 다음 열기:

- `http://<tailscale-ip>:18789/` (또는 구성된 `gateway.controlUi.basePath`)

UI 설정에 매칭 공유 비밀을 붙여넣으십시오 (`connect.params.auth.token` 또는 `connect.params.auth.password`로 전송됨).

## 안전하지 않은 HTTP

일반 HTTP(`http://<lan-ip>` 또는 `http://<tailscale-ip>`)를 통해 대시보드를 여는 경우 브라우저는 **비보안 컨텍스트**에서 실행되어 WebCrypto를 차단합니다. 기본적으로 OpenClaw는 기기 아이덴티티 없이 Control UI 연결을 **차단**합니다.

문서화된 예외:

- `gateway.controlUi.allowInsecureAuth=true`로 localhost 전용 안전하지 않은 HTTP 호환성
- `gateway.auth.mode: "trusted-proxy"`를 통한 성공적인 운영자 Control UI 인증
- 긴급 `gateway.controlUi.dangerouslyDisableDeviceAuth=true`

**권장 수정:** HTTPS (Tailscale Serve) 사용 또는 로컬에서 UI 열기:

- `https://<magicdns>/` (Serve)
- `http://127.0.0.1:18789/` (게이트웨이 호스트에서)

**안전하지 않은 인증 토글 동작:**

```json5
{
  gateway: {
    controlUi: { allowInsecureAuth: true },
    bind: "tailnet",
    auth: { mode: "token", token: "replace-me" },
  },
}
```

`allowInsecureAuth`는 로컬 호환성 토글입니다:

- 비보안 HTTP 컨텍스트에서 기기 아이덴티티 없이 localhost Control UI 세션이 진행되도록 허용합니다.
- 페어링 확인을 우회하지 않습니다.
- 원격 (localhost 이외) 기기 아이덴티티 요구 사항을 완화하지 않습니다.

**긴급 전용:**

```json5
{
  gateway: {
    controlUi: { dangerouslyDisableDeviceAuth: true },
    bind: "tailnet",
    auth: { mode: "token", token: "replace-me" },
  },
}
```

`dangerouslyDisableDeviceAuth`는 Control UI 기기 아이덴티티 확인을 비활성화하며 심각한 보안 다운그레이드입니다. 긴급 사용 후 빠르게 되돌리십시오.

HTTPS 설정 지침은 [Tailscale](/gateway/tailscale)을 참조하십시오.

## UI 빌드

게이트웨이는 `dist/control-ui`에서 정적 파일을 제공합니다. 다음으로 빌드하십시오:

```bash
pnpm ui:build # 첫 번째 실행 시 UI 의존성을 자동으로 설치합니다
```

선택적 절대 기본 (고정 에셋 URL이 필요한 경우):

```bash
OPENCLAW_CONTROL_UI_BASE_PATH=/openclaw/ pnpm ui:build
```

로컬 개발 (별도 개발 서버):

```bash
pnpm ui:dev # 첫 번째 실행 시 UI 의존성을 자동으로 설치합니다
```

그런 다음 UI를 게이트웨이 WS URL (예: `ws://127.0.0.1:18789`)로 지정하십시오.

## 디버깅/테스트: 개발 서버 + 원격 게이트웨이

Control UI는 정적 파일입니다. WebSocket 대상은 구성 가능하며 HTTP origin과 다를 수 있습니다. Vite 개발 서버는 로컬에서 원하지만 게이트웨이는 다른 곳에서 실행될 때 유용합니다.

1. UI 개발 서버 시작: `pnpm ui:dev`
2. 다음과 같은 URL 열기:

```text
http://localhost:5173/?gatewayUrl=ws://<gateway-host>:18789
```

선택적 일회성 인증 (필요한 경우):

```text
http://localhost:5173/?gatewayUrl=wss://<gateway-host>:18789#token=<gateway-token>
```

참고:

- `gatewayUrl`은 로드 후 localStorage에 저장되고 URL에서 제거됩니다.
- `token`은 가능하면 URL 프래그먼트 (`#token=...`)를 통해 전달해야 합니다. 프래그먼트는 서버로 전송되지 않아 요청 로그 및 Referer 누출을 방지합니다.
- 비루프백 Control UI 배포는 `gateway.controlUi.allowedOrigins`를 명시적으로 설정해야 합니다 (전체 origin). 여기에는 원격 개발 설정이 포함됩니다.

예시:

```json5
{
  gateway: {
    controlUi: {
      allowedOrigins: ["http://localhost:5173"],
    },
  },
}
```

원격 액세스 설정 세부 정보: [원격 액세스](/gateway/remote).

## 관련

- [대시보드](/web/dashboard) — 게이트웨이 대시보드
- [웹챗](/web/webchat) — 브라우저 기반 채팅 인터페이스
- [TUI](/web/tui) — 터미널 사용자 인터페이스
- [상태 확인](/gateway/health) — 게이트웨이 상태 모니터링
