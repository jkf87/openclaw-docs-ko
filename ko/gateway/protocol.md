---
summary: "게이트웨이 WebSocket 프로토콜: 핸드셰이크, 프레임, 버전 관리"
read_when:
  - 게이트웨이 WS 클라이언트 구현 또는 업데이트 시
  - 프로토콜 불일치 또는 연결 실패 디버깅 시
  - 프로토콜 스키마/모델 재생성 시
title: "게이트웨이 프로토콜"
---

# 게이트웨이 프로토콜 (WebSocket)

게이트웨이 WS 프로토콜은 OpenClaw의 **단일 컨트롤 플레인 + 노드 전송**입니다. 모든 클라이언트(CLI, 웹 UI, macOS 앱, iOS/Android 노드, 헤드리스 노드)는 WebSocket을 통해 연결하고 핸드셰이크 시 **역할** + **범위**를 선언합니다.

## 전송

- WebSocket, JSON 페이로드가 있는 텍스트 프레임.
- 첫 번째 프레임은 **반드시** `connect` 요청이어야 합니다.

## 핸드셰이크 (connect)

게이트웨이 → 클라이언트 (사전 연결 챌린지):

```json
{
  "type": "event",
  "event": "connect.challenge",
  "payload": { "nonce": "…", "ts": 1737264000000 }
}
```

클라이언트 → 게이트웨이:

```json
{
  "type": "req",
  "id": "…",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "cli",
      "version": "1.2.3",
      "platform": "macos",
      "mode": "operator"
    },
    "role": "operator",
    "scopes": ["operator.read", "operator.write"],
    "caps": [],
    "commands": [],
    "permissions": {},
    "auth": { "token": "…" },
    "locale": "en-US",
    "userAgent": "openclaw-cli/1.2.3",
    "device": {
      "id": "device_fingerprint",
      "publicKey": "…",
      "signature": "…",
      "signedAt": 1737264000000,
      "nonce": "…"
    }
  }
}
```

게이트웨이 → 클라이언트:

```json
{
  "type": "res",
  "id": "…",
  "ok": true,
  "payload": { "type": "hello-ok", "protocol": 3, "policy": { "tickIntervalMs": 15000 } }
}
```

기기 토큰이 발급되면 `hello-ok`에도 포함됩니다:

```json
{
  "auth": {
    "deviceToken": "…",
    "role": "operator",
    "scopes": ["operator.read", "operator.write"]
  }
}
```

신뢰할 수 있는 부트스트랩 핸드오프 중에 `hello-ok.auth`에는 `deviceTokens`에 추가적인 경계 있는 역할 항목이 포함될 수 있습니다:

```json
{
  "auth": {
    "deviceToken": "…",
    "role": "node",
    "scopes": [],
    "deviceTokens": [
      {
        "deviceToken": "…",
        "role": "operator",
        "scopes": ["operator.approvals", "operator.read", "operator.talk.secrets", "operator.write"]
      }
    ]
  }
}
```

### 노드 예제

```json
{
  "type": "req",
  "id": "…",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "ios-node",
      "version": "1.2.3",
      "platform": "ios",
      "mode": "node"
    },
    "role": "node",
    "scopes": [],
    "caps": ["camera", "canvas", "screen", "location", "voice"],
    "commands": ["camera.snap", "canvas.navigate", "screen.record", "location.get"],
    "permissions": { "camera.capture": true, "screen.record": false },
    "auth": { "token": "…" },
    "locale": "en-US",
    "userAgent": "openclaw-ios/1.2.3",
    "device": {
      "id": "device_fingerprint",
      "publicKey": "…",
      "signature": "…",
      "signedAt": 1737264000000,
      "nonce": "…"
    }
  }
}
```

## 프레이밍

- **요청**: `{type:"req", id, method, params}`
- **응답**: `{type:"res", id, ok, payload|error}`
- **이벤트**: `{type:"event", event, payload, seq?, stateVersion?}`

부작용이 있는 메서드는 **멱등성 키**가 필요합니다 (스키마 참조).

## 역할 + 범위

### 역할

- `operator` = 컨트롤 플레인 클라이언트 (CLI/UI/자동화).
- `node` = 기능 호스트 (카메라/화면/캔버스/system.run).

### 범위 (오퍼레이터)

일반적인 범위:

- `operator.read`
- `operator.write`
- `operator.admin`
- `operator.approvals`
- `operator.pairing`
- `operator.talk.secrets`

`includeSecrets: true`가 있는 `talk.config`는 `operator.talk.secrets`(또는 `operator.admin`)가 필요합니다.

### 기능/명령/권한 (노드)

노드는 연결 시 기능 클레임을 선언합니다:

- `caps`: 고수준 기능 카테고리.
- `commands`: invoke를 위한 명령 허용 목록.
- `permissions`: 세분화된 토글 (예: `screen.record`, `camera.capture`).

게이트웨이는 이를 **클레임**으로 취급하고 서버 측 허용 목록을 강제합니다.

## 현재 상태 (Presence)

- `system-presence`는 기기 신원으로 키가 지정된 항목을 반환합니다.
- 현재 상태 항목에는 `deviceId`, `roles`, `scopes`가 포함되어 기기가 **오퍼레이터**와 **노드** 모두로 연결하는 경우에도 UI가 기기당 단일 행을 표시할 수 있습니다.

## 일반적인 RPC 메서드 패밀리

### 시스템 및 신원

- `health` — 캐시된 또는 새로 프로브된 게이트웨이 헬스 스냅샷을 반환합니다.
- `status` — `/status` 스타일 게이트웨이 요약을 반환합니다.
- `gateway.identity.get` — 릴레이 및 페어링 흐름에서 사용되는 게이트웨이 기기 신원을 반환합니다.
- `system-presence` — 연결된 오퍼레이터/노드 기기의 현재 현재 상태 스냅샷을 반환합니다.
- `system-event` — 시스템 이벤트를 추가하고 현재 상태 컨텍스트를 업데이트/브로드캐스트할 수 있습니다.
- `last-heartbeat` — 최신 지속된 하트비트 이벤트를 반환합니다.
- `set-heartbeats` — 게이트웨이에서 하트비트 처리를 토글합니다.

### 모델 및 사용량

- `models.list` — 런타임 허용 모델 카탈로그를 반환합니다.
- `usage.status` — 프로바이더 사용 창/남은 할당량 요약을 반환합니다.
- `usage.cost` — 날짜 범위에 대한 집계 비용 사용 요약을 반환합니다.
- `sessions.usage` — 세션별 사용 요약을 반환합니다.

### 채널 및 로그인 도우미

- `channels.status` — 내장 + 번들 채널/플러그인 상태 요약을 반환합니다.
- `channels.logout` — 채널이 로그아웃을 지원하는 경우 특정 채널/계정을 로그아웃합니다.
- `web.login.start` — 현재 QR 가능 웹 채널 프로바이더를 위한 QR/웹 로그인 흐름을 시작합니다.
- `web.login.wait` — QR/웹 로그인 흐름이 완료되기를 기다리고 성공 시 채널을 시작합니다.
- `push.test` — 등록된 iOS 노드에 테스트 APNs 푸시를 전송합니다.

### 메시징 및 로그

- `send` — 채팅 러너 외부에서 채널/계정/스레드 대상 전송을 위한 직접 아웃바운드 전달 RPC입니다.
- `logs.tail` — 커서/제한 및 최대 바이트 제어와 함께 구성된 게이트웨이 파일 로그 tail을 반환합니다.

### Talk 및 TTS

- `talk.config` — 효과적인 Talk 구성 페이로드를 반환합니다.
- `talk.speak` — 활성 Talk 음성 프로바이더를 통해 음성을 합성합니다.
- `tts.status` — TTS 활성화 상태, 활성 프로바이더, 폴백 프로바이더, 프로바이더 구성 상태를 반환합니다.
- `tts.convert` — 일회성 텍스트 음성 변환을 실행합니다.

### 시크릿, 구성, 업데이트 및 마법사

- `secrets.reload` — 활성 SecretRef를 다시 해결하고 완전한 성공 시에만 런타임 시크릿 상태를 교환합니다.
- `config.get` — 현재 구성 스냅샷과 해시를 반환합니다.
- `config.set` — 유효성이 검사된 구성 페이로드를 씁니다.
- `config.patch` — 부분 구성 업데이트를 병합합니다.
- `config.apply` — 유효성 검사 + 전체 구성 페이로드를 교체합니다.
- `config.schema` — Control UI 및 CLI 도구에서 사용하는 라이브 구성 스키마 페이로드를 반환합니다.
- `update.run` — 게이트웨이 업데이트 흐름을 실행하고 업데이트 자체가 성공했을 때만 재시작을 예약합니다.

### 에이전트 및 워크스페이스 도우미

- `agents.list` — 구성된 에이전트 항목을 반환합니다.
- `agents.create`, `agents.update`, `agents.delete` — 에이전트 레코드 및 워크스페이스 연결을 관리합니다.
- `agents.files.list`, `agents.files.get`, `agents.files.set` — 에이전트에 노출된 부트스트랩 워크스페이스 파일을 관리합니다.
- `agent.wait` — 실행이 완료되기를 기다리고 사용 가능한 경우 터미널 스냅샷을 반환합니다.

### 세션 제어

- `sessions.list` — 현재 세션 인덱스를 반환합니다.
- `sessions.subscribe` / `sessions.unsubscribe` — 현재 WS 클라이언트에 대한 세션 변경 이벤트 구독을 토글합니다.
- `sessions.messages.subscribe` / `sessions.messages.unsubscribe` — 하나의 세션에 대한 트랜스크립트/메시지 이벤트 구독을 토글합니다.
- `sessions.send` — 기존 세션에 메시지를 전송합니다.
- `sessions.abort` — 세션의 활성 작업을 중단합니다.
- `chat.history`, `chat.send`, `chat.abort`, `chat.inject` — 채팅 실행.

### 기기 페어링 및 기기 토큰

- `device.pair.list` — 보류 중 및 승인된 페어링된 기기를 반환합니다.
- `device.pair.approve`, `device.pair.reject`, `device.pair.remove` — 기기 페어링 레코드를 관리합니다.
- `device.token.rotate` — 승인된 역할 및 범위 경계 내에서 페어링된 기기 토큰을 순환합니다.
- `device.token.revoke` — 페어링된 기기 토큰을 취소합니다.

### 노드 페어링, invoke, 보류 중인 작업

- `node.pair.request`, `node.pair.list`, `node.pair.approve`, `node.pair.reject`, `node.pair.verify` — 노드 페어링 및 부트스트랩 확인을 다룹니다.
- `node.list`, `node.describe` — 알려진/연결된 노드 상태를 반환합니다.
- `node.invoke` — 연결된 노드에 명령을 전달합니다.
- `node.pending.pull`, `node.pending.ack` — 연결된 노드 큐 API.

### 승인 패밀리

- `exec.approval.request`, `exec.approval.get`, `exec.approval.list`, `exec.approval.resolve` — 일회성 exec 승인 요청 + 보류 중인 승인 조회/재생을 다룹니다.
- `exec.approvals.get`, `exec.approvals.set` — 게이트웨이 exec 승인 정책 스냅샷을 관리합니다.

### 기타 주요 패밀리

- 자동화:
  - `wake` — 즉각적인 또는 다음 하트비트 깨우기 텍스트 주입을 예약합니다
  - `cron.list`, `cron.status`, `cron.add`, `cron.update`, `cron.remove`, `cron.run`, `cron.runs`
- skills/도구: `skills.*`, `tools.catalog`, `tools.effective`

### 일반적인 이벤트 패밀리

- `chat` — UI 채팅 업데이트.
- `session.message`, `session.tool` — 구독된 세션의 트랜스크립트/이벤트 스트림 업데이트.
- `sessions.changed` — 세션 인덱스 또는 메타데이터 변경됨.
- `presence` — 시스템 현재 상태 스냅샷 업데이트.
- `tick` — 주기적인 킵얼라이브/활성 이벤트.
- `health` — 게이트웨이 헬스 스냅샷 업데이트.
- `heartbeat` — 하트비트 이벤트 스트림 업데이트.
- `shutdown` — 게이트웨이 종료 알림.
- `node.pair.requested` / `node.pair.resolved` — 노드 페어링 라이프사이클.
- `exec.approval.requested` / `exec.approval.resolved` — exec 승인 라이프사이클.

## Exec 승인

- exec 요청에 승인이 필요하면 게이트웨이는 `exec.approval.requested`를 브로드캐스트합니다.
- 오퍼레이터 클라이언트는 `exec.approval.resolve`를 호출하여 해결합니다 (`operator.approvals` 범위 필요).
- `host=node`의 경우 `exec.approval.request`에는 `systemRunPlan`이 포함되어야 합니다. `systemRunPlan`이 없는 요청은 거부됩니다.

## 버전 관리

- `PROTOCOL_VERSION`은 `src/gateway/protocol/schema.ts`에 있습니다.
- 클라이언트는 `minProtocol` + `maxProtocol`을 전송하며 서버는 불일치를 거부합니다.
- 스키마 + 모델은 TypeBox 정의에서 생성됩니다:
  - `pnpm protocol:gen`
  - `pnpm protocol:gen:swift`
  - `pnpm protocol:check`

## 인증

- 공유 시크릿 게이트웨이 인증은 구성된 인증 모드에 따라 `connect.params.auth.token` 또는 `connect.params.auth.password`를 사용합니다.
- Tailscale Serve(`gateway.auth.allowTailscale: true`) 또는 비루프백 `gateway.auth.mode: "trusted-proxy"`와 같은 신원 포함 모드는 `connect.params.auth.*` 대신 요청 헤더에서 연결 인증 체크를 충족합니다.
- 개인 인그레스 `gateway.auth.mode: "none"`은 공유 시크릿 연결 인증을 완전히 건너뜁니다; 해당 모드를 공용/신뢰할 수 없는 인그레스에 노출하지 마십시오.
- 페어링 후 게이트웨이는 연결 역할 + 범위로 범위가 지정된 **기기 토큰**을 발급합니다.
- 클라이언트는 성공적인 연결 후 기본 `hello-ok.auth.deviceToken`을 유지해야 합니다.
- 인증 실패에는 복구 힌트와 함께 `error.details.code`가 포함됩니다.

## 기기 신원 + 페어링

- 노드는 키페어 지문에서 파생된 안정적인 기기 신원(`device.id`)을 포함해야 합니다.
- 게이트웨이는 기기 + 역할별로 토큰을 발급합니다.
- 로컬 자동 승인이 활성화되지 않는 한 새 기기 ID에는 페어링 승인이 필요합니다.
- 모든 WS 클라이언트는 `connect` 중에 `device` 신원을 포함해야 합니다 (오퍼레이터 + 노드).
- 모든 연결은 서버에서 제공한 `connect.challenge` nonce에 서명해야 합니다.

### 기기 인증 마이그레이션 진단

레거시 클라이언트를 위한 마이그레이션 실패 코드:

| 메시지 | details.code | details.reason | 의미 |
| ------ | ------------ | -------------- | ---- |
| `device nonce required` | `DEVICE_AUTH_NONCE_REQUIRED` | `device-nonce-missing` | 클라이언트가 `device.nonce`를 생략했습니다. |
| `device nonce mismatch` | `DEVICE_AUTH_NONCE_MISMATCH` | `device-nonce-mismatch` | 클라이언트가 오래된/잘못된 nonce로 서명했습니다. |
| `device signature invalid` | `DEVICE_AUTH_SIGNATURE_INVALID` | `device-signature` | 서명 페이로드가 v2 페이로드와 일치하지 않습니다. |
| `device signature expired` | `DEVICE_AUTH_SIGNATURE_EXPIRED` | `device-signature-stale` | 서명된 타임스탬프가 허용된 스큐를 벗어났습니다. |

마이그레이션 대상:

- 항상 `connect.challenge`를 기다립니다.
- 서버 nonce를 포함하는 v2 페이로드에 서명합니다.
- `connect.params.device.nonce`에 동일한 nonce를 전송합니다.
- `platform`과 `deviceFamily`를 바인딩하는 `v3` 서명 페이로드가 선호됩니다.

## TLS + 핀닝

- TLS는 WS 연결에 지원됩니다.
- 클라이언트는 선택적으로 게이트웨이 인증서 지문을 핀할 수 있습니다 (`gateway.tls` 구성 플러스 `gateway.remote.tlsFingerprint` 또는 CLI `--tls-fingerprint` 참조).

## 범위

이 프로토콜은 **전체 게이트웨이 API**(상태, 채널, 모델, 채팅, 에이전트, 세션, 노드, 승인 등)를 노출합니다. 정확한 표면은 `src/gateway/protocol/schema.ts`의 TypeBox 스키마에 의해 정의됩니다.
