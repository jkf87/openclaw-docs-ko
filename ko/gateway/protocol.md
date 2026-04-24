---
summary: "Gateway WebSocket protocol: handshake, frames, 버전 관리"
read_when:
  - Gateway WS 클라이언트를 구현하거나 업데이트할 때
  - Protocol 불일치 또는 연결 실패를 디버깅할 때
  - Protocol schema/model을 재생성할 때
title: "Gateway protocol"
sidebarTitle: "Gateway protocol"
---

# Gateway protocol (WebSocket)

Gateway WS protocol은 OpenClaw의 **단일 control plane + 노드 전송**입니다.
모든 클라이언트(CLI, 웹 UI, macOS 앱, iOS/Android 노드, 헤드리스 노드)는
WebSocket을 통해 연결하며 handshake 시점에 **role**과 **scope**를 선언합니다.

## 전송

- WebSocket, JSON 페이로드를 포함한 텍스트 프레임.
- 첫 번째 프레임은 **반드시** `connect` 요청이어야 합니다.
- Pre-connect 프레임은 64 KiB로 제한됩니다. 성공적인 handshake 이후, 클라이언트는
  `hello-ok.policy.maxPayload` 및 `hello-ok.policy.maxBufferedBytes` 제한을
  따라야 합니다. 진단이 활성화된 경우, 과도한 크기의 인바운드 프레임과 느린
  아웃바운드 버퍼는 게이트웨이가 영향받는 프레임을 닫거나 삭제하기 전에
  `payload.large` 이벤트를 발생시킵니다. 이러한 이벤트는 크기, 제한, surface, 안전한
  이유 코드를 보관합니다. 메시지 본문, 첨부 파일 내용, 원시 프레임 본문, 토큰,
  쿠키, 시크릿 값은 보관하지 않습니다.

## Handshake (connect)

Gateway → Client (pre-connect challenge):

```json
{
  "type": "event",
  "event": "connect.challenge",
  "payload": { "nonce": "…", "ts": 1737264000000 }
}
```

Client → Gateway:

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

Gateway → Client:

```json
{
  "type": "res",
  "id": "…",
  "ok": true,
  "payload": {
    "type": "hello-ok",
    "protocol": 3,
    "server": { "version": "…", "connId": "…" },
    "features": { "methods": ["…"], "events": ["…"] },
    "snapshot": { "…": "…" },
    "policy": {
      "maxPayload": 26214400,
      "maxBufferedBytes": 52428800,
      "tickIntervalMs": 15000
    }
  }
}
```

`server`, `features`, `snapshot`, `policy`는 모두 스키마
(`src/gateway/protocol/schema/frames.ts`)에서 필수입니다. `canvasHostUrl`은
선택 사항입니다. `auth`는 사용 가능한 경우 협상된 role/scope를 보고하며,
gateway가 발급한 경우 `deviceToken`을 포함합니다.

device token이 발급되지 않은 경우에도, `hello-ok.auth`는 여전히 협상된 권한을
보고할 수 있습니다:

```json
{
  "auth": {
    "role": "operator",
    "scopes": ["operator.read", "operator.write"]
  }
}
```

device token이 발급된 경우, `hello-ok`에는 다음도 포함됩니다:

```json
{
  "auth": {
    "deviceToken": "…",
    "role": "operator",
    "scopes": ["operator.read", "operator.write"]
  }
}
```

신뢰된 부트스트랩 핸드오프 중에는, `hello-ok.auth`가 `deviceTokens`에 추가적인
제한된 role 항목을 포함할 수도 있습니다:

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

내장 node/operator 부트스트랩 흐름에서는, 기본 node 토큰이 `scopes: []`로
유지되며 핸드오프된 operator 토큰도 부트스트랩 operator 허용 목록
(`operator.approvals`, `operator.read`, `operator.talk.secrets`,
`operator.write`)으로 제한됩니다. 부트스트랩 scope 검사는 role-prefix 기반으로
유지됩니다: operator 항목은 operator 요청만 충족하며, operator가 아닌 role은
여전히 자체 role prefix 아래의 scope를 필요로 합니다.

### 노드 예시

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

- **요청(Request)**: `{type:"req", id, method, params}`
- **응답(Response)**: `{type:"res", id, ok, payload|error}`
- **이벤트(Event)**: `{type:"event", event, payload, seq?, stateVersion?}`

부수 효과가 있는 메서드는 **idempotency key**를 필요로 합니다(스키마 참조).

## Role + scope

### Role

- `operator` = control plane 클라이언트(CLI/UI/자동화).
- `node` = capability 호스트(camera/screen/canvas/system.run).

### Scope (operator)

공통 scope:

- `operator.read`
- `operator.write`
- `operator.admin`
- `operator.approvals`
- `operator.pairing`
- `operator.talk.secrets`

`includeSecrets: true`와 함께 사용하는 `talk.config`는 `operator.talk.secrets`
(또는 `operator.admin`)이 필요합니다.

Plugin이 등록한 gateway RPC 메서드는 자체 operator scope를 요구할 수 있지만,
예약된 코어 admin prefix(`config.*`, `exec.approvals.*`, `wizard.*`,
`update.*`)는 항상 `operator.admin`으로 해석됩니다.

메서드 scope는 첫 번째 게이트일 뿐입니다. `chat.send`를 통해 도달하는 일부
슬래시 명령은 그 위에 더 엄격한 명령 수준 검사를 적용합니다. 예를 들어,
영구적인 `/config set` 및 `/config unset` 쓰기는 `operator.admin`이 필요합니다.

`node.pair.approve`에도 기본 메서드 scope 위에 추가 승인 시점 scope 검사가
있습니다:

- 명령 없는 요청: `operator.pairing`
- 비 exec 노드 명령이 포함된 요청: `operator.pairing` + `operator.write`
- `system.run`, `system.run.prepare`, `system.which`를 포함하는 요청:
  `operator.pairing` + `operator.admin`

### Caps/commands/permissions (node)

노드는 연결 시점에 capability claim을 선언합니다:

- `caps`: 상위 수준 capability 카테고리.
- `commands`: invoke를 위한 명령 허용 목록.
- `permissions`: 세분화된 토글(예: `screen.record`, `camera.capture`).

Gateway는 이를 **claim**으로 취급하며 서버 측 허용 목록을 적용합니다.

## Presence

- `system-presence`는 device identity로 키가 지정된 항목을 반환합니다.
- Presence 항목에는 `deviceId`, `roles`, `scopes`가 포함되어, UI가 **operator**와
  **node** 양쪽으로 연결된 디바이스에 대해서도 디바이스당 단일 행을 표시할 수
  있도록 합니다.

## 브로드캐스트 이벤트 scope 게이팅

서버가 푸시하는 WebSocket 브로드캐스트 이벤트는 pairing-scope 또는 node 전용
세션이 세션 콘텐츠를 수동적으로 수신하지 않도록 scope로 게이트됩니다.

- **Chat, agent, tool-result 프레임**(스트리밍되는 `agent` 이벤트 및 tool
  호출 결과 포함)은 최소 `operator.read`가 필요합니다. `operator.read`가 없는
  세션은 이러한 프레임을 완전히 건너뜁니다.
- **Plugin이 정의한 `plugin.*` 브로드캐스트**는 plugin이 등록한 방식에 따라
  `operator.write` 또는 `operator.admin`으로 게이트됩니다.
- **상태 및 전송 이벤트**(`heartbeat`, `presence`, `tick`, 연결/연결 해제
  라이프사이클 등)는 전송 상태가 모든 인증된 세션에 대해 관찰 가능하도록
  제한 없이 유지됩니다.
- **알 수 없는 브로드캐스트 이벤트 패밀리**는 등록된 핸들러가 명시적으로
  완화하지 않는 한 기본적으로 scope로 게이트됩니다(fail-closed).

각 클라이언트 연결은 자체 클라이언트별 시퀀스 번호를 유지하므로, 서로 다른
클라이언트가 이벤트 스트림의 서로 다른 scope 필터링된 하위 집합을 볼 때에도
브로드캐스트는 해당 소켓에서 단조 순서를 보존합니다.

## 공통 RPC 메서드 패밀리

공개 WS surface는 위의 handshake/auth 예시보다 더 넓습니다. 이는 생성된
덤프가 아닙니다 — `hello-ok.features.methods`는 `src/gateway/server-methods-list.ts`와
로드된 plugin/channel 메서드 export를 기반으로 구축된 보수적인 탐색 목록입니다.
`src/gateway/server-methods/*.ts`의 완전한 열거가 아닌 feature discovery로
취급하십시오.

<AccordionGroup>
  <Accordion title="시스템 및 identity">
    - `health`는 캐시되거나 새로 probe된 gateway health 스냅샷을 반환합니다.
    - `diagnostics.stability`는 최근의 제한된 진단 안정성 recorder를 반환합니다. 이벤트 이름, 개수, 바이트 크기, 메모리 판독, queue/session 상태, channel/plugin 이름, session id 같은 운영 메타데이터를 보관합니다. chat 텍스트, webhook 본문, tool 출력, 원시 요청 또는 응답 본문, 토큰, 쿠키, 시크릿 값은 보관하지 않습니다. Operator read scope가 필요합니다.
    - `status`는 `/status` 스타일 gateway 요약을 반환하며; 민감한 필드는 admin scope의 operator 클라이언트에만 포함됩니다.
    - `gateway.identity.get`은 relay 및 pairing 흐름에서 사용되는 gateway 디바이스 identity를 반환합니다.
    - `system-presence`는 연결된 operator/node 디바이스에 대한 현재 presence 스냅샷을 반환합니다.
    - `system-event`는 시스템 이벤트를 추가하고 presence context를 업데이트/브로드캐스트할 수 있습니다.
    - `last-heartbeat`는 가장 최근에 지속된 heartbeat 이벤트를 반환합니다.
    - `set-heartbeats`는 gateway의 heartbeat 처리를 토글합니다.
  </Accordion>

  <Accordion title="모델 및 사용량">
    - `models.list`는 런타임에서 허용된 모델 카탈로그를 반환합니다.
    - `usage.status`는 provider 사용량 window/남은 할당량 요약을 반환합니다.
    - `usage.cost`는 날짜 범위에 대해 집계된 비용 사용량 요약을 반환합니다.
    - `doctor.memory.status`는 활성 기본 agent workspace에 대한 vector-memory / embedding 준비 상태를 반환합니다.
    - `sessions.usage`는 세션별 사용량 요약을 반환합니다.
    - `sessions.usage.timeseries`는 하나의 세션에 대한 타임시리즈 사용량을 반환합니다.
    - `sessions.usage.logs`는 하나의 세션에 대한 사용량 로그 항목을 반환합니다.
  </Accordion>

  <Accordion title="Channel 및 로그인 헬퍼">
    - `channels.status`는 내장 + 번들된 channel/plugin 상태 요약을 반환합니다.
    - `channels.logout`은 channel이 로그아웃을 지원하는 경우 특정 channel/계정을 로그아웃합니다.
    - `web.login.start`는 현재 QR 가능 웹 channel provider에 대한 QR/웹 로그인 흐름을 시작합니다.
    - `web.login.wait`는 해당 QR/웹 로그인 흐름이 완료될 때까지 대기하고 성공 시 channel을 시작합니다.
    - `push.test`는 등록된 iOS 노드에 테스트 APNs push를 보냅니다.
    - `voicewake.get`은 저장된 wake-word 트리거를 반환합니다.
    - `voicewake.set`은 wake-word 트리거를 업데이트하고 변경을 브로드캐스트합니다.
  </Accordion>

  <Accordion title="메시징 및 로그">
    - `send`는 chat runner 외부의 channel/계정/스레드 대상 전송을 위한 직접 아웃바운드 전달 RPC입니다.
    - `logs.tail`은 cursor/limit 및 max-byte 제어와 함께 구성된 gateway 파일 로그 tail을 반환합니다.
  </Accordion>

  <Accordion title="Talk 및 TTS">
    - `talk.config`는 유효한 Talk 구성 페이로드를 반환합니다; `includeSecrets`는 `operator.talk.secrets`(또는 `operator.admin`)이 필요합니다.
    - `talk.mode`는 WebChat/Control UI 클라이언트에 대한 현재 Talk 모드 상태를 설정/브로드캐스트합니다.
    - `talk.speak`는 활성 Talk speech provider를 통해 음성을 합성합니다.
    - `tts.status`는 TTS 활성화 상태, 활성 provider, fallback provider, provider 구성 상태를 반환합니다.
    - `tts.providers`는 가시적인 TTS provider 인벤토리를 반환합니다.
    - `tts.enable` 및 `tts.disable`은 TTS 환경설정 상태를 토글합니다.
    - `tts.setProvider`는 선호하는 TTS provider를 업데이트합니다.
    - `tts.convert`는 일회성 텍스트 음성 변환을 실행합니다.
  </Accordion>

  <Accordion title="Secret, configuration, update, wizard">
    - `secrets.reload`는 활성 SecretRef를 재해석하고 전체 성공 시에만 런타임 시크릿 상태를 교체합니다.
    - `secrets.resolve`는 특정 명령/대상 세트에 대한 command-target 시크릿 할당을 해석합니다.
    - `config.get`은 현재 구성 스냅샷과 hash를 반환합니다.
    - `config.set`은 검증된 구성 페이로드를 씁니다.
    - `config.patch`는 부분 구성 업데이트를 병합합니다.
    - `config.apply`는 전체 구성 페이로드를 검증 + 교체합니다.
    - `config.schema`는 Control UI 및 CLI 툴링에서 사용되는 라이브 configuration schema 페이로드를 반환합니다: schema, `uiHints`, 버전, 생성 메타데이터, 런타임이 로드할 수 있는 경우 plugin + channel schema 메타데이터를 포함합니다. 스키마에는 UI에서 사용하는 동일한 레이블과 도움말 텍스트에서 파생된 `title` / `description` 필드 메타데이터가 포함되며, 일치하는 필드 문서가 존재하는 경우 중첩된 object, wildcard, array-item, `anyOf` / `oneOf` / `allOf` 합성 분기를 포함합니다.
    - `config.schema.lookup`은 하나의 configuration 경로에 대한 경로 범위 lookup 페이로드를 반환합니다: 정규화된 경로, 얕은 스키마 노드, 매칭된 hint + `hintPath`, UI/CLI 드릴다운을 위한 즉시 하위 요약. Lookup 스키마 노드는 사용자 대상 문서와 일반적인 검증 필드(`title`, `description`, `type`, `enum`, `const`, `format`, `pattern`, 숫자/문자열/배열/객체 경계, `additionalProperties`, `deprecated`, `readOnly`, `writeOnly` 같은 플래그)를 유지합니다. 하위 요약은 `key`, 정규화된 `path`, `type`, `required`, `hasChildren`, 매칭된 `hint` / `hintPath`를 노출합니다.
    - `update.run`은 gateway 업데이트 흐름을 실행하고 업데이트 자체가 성공한 경우에만 재시작을 예약합니다.
    - `wizard.start`, `wizard.next`, `wizard.status`, `wizard.cancel`은 WS RPC를 통해 온보딩 wizard를 노출합니다.
  </Accordion>

  <Accordion title="Agent 및 workspace 헬퍼">
    - `agents.list`는 구성된 agent 항목을 반환합니다.
    - `agents.create`, `agents.update`, `agents.delete`는 agent 레코드와 workspace 배선을 관리합니다.
    - `agents.files.list`, `agents.files.get`, `agents.files.set`은 agent에 노출된 부트스트랩 workspace 파일을 관리합니다.
    - `agent.identity.get`은 agent 또는 세션에 대한 유효한 assistant identity를 반환합니다.
    - `agent.wait`는 실행이 완료될 때까지 대기하고 사용 가능한 경우 최종 스냅샷을 반환합니다.
  </Accordion>

  <Accordion title="세션 제어">
    - `sessions.list`는 현재 세션 인덱스를 반환합니다.
    - `sessions.subscribe` 및 `sessions.unsubscribe`는 현재 WS 클라이언트에 대한 세션 변경 이벤트 구독을 토글합니다.
    - `sessions.messages.subscribe` 및 `sessions.messages.unsubscribe`는 하나의 세션에 대한 transcript/메시지 이벤트 구독을 토글합니다.
    - `sessions.preview`는 특정 세션 키에 대한 제한된 transcript 미리보기를 반환합니다.
    - `sessions.resolve`는 세션 대상을 해석하거나 정규화합니다.
    - `sessions.create`는 새 세션 항목을 만듭니다.
    - `sessions.send`는 기존 세션에 메시지를 보냅니다.
    - `sessions.steer`는 활성 세션에 대한 interrupt-and-steer 변형입니다.
    - `sessions.abort`는 세션에 대한 활성 작업을 중단합니다.
    - `sessions.patch`는 세션 메타데이터/재정의를 업데이트합니다.
    - `sessions.reset`, `sessions.delete`, `sessions.compact`는 세션 유지 관리를 수행합니다.
    - `sessions.get`은 전체 저장된 세션 행을 반환합니다.
    - Chat 실행은 여전히 `chat.history`, `chat.send`, `chat.abort`, `chat.inject`를 사용합니다. `chat.history`는 UI 클라이언트에 대해 표시 정규화됩니다: 인라인 directive 태그가 가시 텍스트에서 제거되고, 일반 텍스트 tool-call XML 페이로드(`<tool_call>...</tool_call>`, `<function_call>...</function_call>`, `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>`, 잘린 tool-call 블록 포함)와 누출된 ASCII/전각 모델 제어 토큰이 제거되며, 정확히 `NO_REPLY` / `no_reply` 같은 순수 silent-token assistant 행이 생략되고, 과도한 크기의 행은 placeholder로 교체될 수 있습니다.
  </Accordion>

  <Accordion title="디바이스 pairing 및 디바이스 토큰">
    - `device.pair.list`는 대기 중이고 승인된 페어링된 디바이스를 반환합니다.
    - `device.pair.approve`, `device.pair.reject`, `device.pair.remove`는 디바이스 pairing 레코드를 관리합니다.
    - `device.token.rotate`는 승인된 role 및 scope 범위 내에서 페어링된 디바이스 토큰을 회전합니다.
    - `device.token.revoke`는 페어링된 디바이스 토큰을 취소합니다.
  </Accordion>

  <Accordion title="노드 pairing, invoke, 대기 중인 작업">
    - `node.pair.request`, `node.pair.list`, `node.pair.approve`, `node.pair.reject`, `node.pair.verify`는 노드 pairing 및 부트스트랩 검증을 다룹니다.
    - `node.list` 및 `node.describe`는 알려진/연결된 노드 상태를 반환합니다.
    - `node.rename`은 페어링된 노드 레이블을 업데이트합니다.
    - `node.invoke`는 연결된 노드에 명령을 전달합니다.
    - `node.invoke.result`는 invoke 요청에 대한 결과를 반환합니다.
    - `node.event`는 노드에서 발생한 이벤트를 gateway로 다시 전달합니다.
    - `node.canvas.capability.refresh`는 scope가 지정된 canvas-capability 토큰을 새로 고칩니다.
    - `node.pending.pull` 및 `node.pending.ack`는 연결된 노드 queue API입니다.
    - `node.pending.enqueue` 및 `node.pending.drain`은 오프라인/연결 해제된 노드에 대한 durable 대기 작업을 관리합니다.
  </Accordion>

  <Accordion title="승인(Approval) 패밀리">
    - `exec.approval.request`, `exec.approval.get`, `exec.approval.list`, `exec.approval.resolve`는 일회성 exec 승인 요청과 대기 중인 승인 조회/재생을 다룹니다.
    - `exec.approval.waitDecision`은 대기 중인 하나의 exec 승인을 기다리고 최종 결정(또는 타임아웃 시 `null`)을 반환합니다.
    - `exec.approvals.get` 및 `exec.approvals.set`은 gateway exec 승인 정책 스냅샷을 관리합니다.
    - `exec.approvals.node.get` 및 `exec.approvals.node.set`은 node relay 명령을 통해 node-local exec 승인 정책을 관리합니다.
    - `plugin.approval.request`, `plugin.approval.list`, `plugin.approval.waitDecision`, `plugin.approval.resolve`는 plugin이 정의한 승인 흐름을 다룹니다.
  </Accordion>

  <Accordion title="자동화, skill, tool">
    - 자동화: `wake`는 즉시 또는 다음 heartbeat에서 wake text 주입을 예약합니다; `cron.list`, `cron.status`, `cron.add`, `cron.update`, `cron.remove`, `cron.run`, `cron.runs`는 예약된 작업을 관리합니다.
    - Skill 및 tool: `commands.list`, `skills.*`, `tools.catalog`, `tools.effective`.
  </Accordion>
</AccordionGroup>

### 공통 이벤트 패밀리

- `chat`: `chat.inject` 및 기타 transcript 전용 chat 이벤트 같은 UI chat
  업데이트.
- `session.message` 및 `session.tool`: 구독된 세션에 대한 transcript/이벤트
  스트림 업데이트.
- `sessions.changed`: 세션 인덱스 또는 메타데이터 변경.
- `presence`: 시스템 presence 스냅샷 업데이트.
- `tick`: 주기적 keepalive / liveness 이벤트.
- `health`: gateway health 스냅샷 업데이트.
- `heartbeat`: heartbeat 이벤트 스트림 업데이트.
- `cron`: cron 실행/작업 변경 이벤트.
- `shutdown`: gateway 종료 알림.
- `node.pair.requested` / `node.pair.resolved`: 노드 pairing 라이프사이클.
- `node.invoke.request`: 노드 invoke 요청 브로드캐스트.
- `device.pair.requested` / `device.pair.resolved`: 페어링된 디바이스
  라이프사이클.
- `voicewake.changed`: wake-word 트리거 구성 변경.
- `exec.approval.requested` / `exec.approval.resolved`: exec 승인 라이프사이클.
- `plugin.approval.requested` / `plugin.approval.resolved`: plugin 승인
  라이프사이클.

### 노드 헬퍼 메서드

- 노드는 `skills.bins`를 호출하여 자동 허용 검사를 위한 현재 skill 실행 파일
  목록을 가져올 수 있습니다.

### Operator 헬퍼 메서드

- Operator는 `commands.list`(`operator.read`)를 호출하여 agent의 런타임 명령
  인벤토리를 가져올 수 있습니다.
  - `agentId`는 선택 사항입니다; 기본 agent workspace를 읽으려면 생략하십시오.
  - `scope`는 주 `name`이 대상으로 하는 surface를 제어합니다:
    - `text`는 선행 `/` 없이 주 텍스트 명령 토큰을 반환합니다
    - `native` 및 기본 `both` 경로는 사용 가능한 경우 provider 인식 native
      이름을 반환합니다
  - `textAliases`는 `/model` 및 `/m` 같은 정확한 슬래시 별칭을 전달합니다.
  - `nativeName`은 존재하는 경우 provider 인식 native 명령 이름을 전달합니다.
  - `provider`는 선택 사항이며 native 이름 지정 및 native plugin 명령 가용성에만
    영향을 미칩니다.
  - `includeArgs=false`는 응답에서 직렬화된 인수 메타데이터를 생략합니다.
- Operator는 `tools.catalog`(`operator.read`)를 호출하여 agent에 대한 런타임
  tool 카탈로그를 가져올 수 있습니다. 응답에는 그룹화된 tool과 provenance
  메타데이터가 포함됩니다:
  - `source`: `core` 또는 `plugin`
  - `pluginId`: `source="plugin"`일 때 plugin 소유자
  - `optional`: plugin tool이 선택 사항인지 여부
- Operator는 `tools.effective`(`operator.read`)를 호출하여 세션에 대한
  런타임 유효 tool 인벤토리를 가져올 수 있습니다.
  - `sessionKey`가 필요합니다.
  - Gateway는 호출자가 제공한 auth 또는 전달 context를 수락하는 대신 세션에서
    서버 측으로 신뢰된 런타임 context를 도출합니다.
  - 응답은 세션 범위이며, core, plugin, channel tool을 포함하여 활성 대화가
    현재 사용할 수 있는 것을 반영합니다.
- Operator는 `skills.status`(`operator.read`)를 호출하여 agent에 대한 가시적인
  skill 인벤토리를 가져올 수 있습니다.
  - `agentId`는 선택 사항입니다; 기본 agent workspace를 읽으려면 생략하십시오.
  - 응답에는 자격, 누락된 요구 사항, 구성 검사, 원시 시크릿 값을 노출하지 않는
    위생 처리된 설치 옵션이 포함됩니다.
- Operator는 ClawHub 탐색 메타데이터를 위해 `skills.search` 및
  `skills.detail`(`operator.read`)을 호출할 수 있습니다.
- Operator는 `skills.install`(`operator.admin`)을 두 가지 모드로 호출할 수
  있습니다:
  - ClawHub 모드: `{ source: "clawhub", slug, version?, force? }`는 기본 agent
    workspace `skills/` 디렉토리에 skill 폴더를 설치합니다.
  - Gateway 설치 프로그램 모드: `{ name, installId, dangerouslyForceUnsafeInstall?, timeoutMs? }`는
    gateway 호스트에서 선언된 `metadata.openclaw.install` 액션을 실행합니다.
- Operator는 `skills.update`(`operator.admin`)를 두 가지 모드로 호출할 수
  있습니다:
  - ClawHub 모드는 기본 agent workspace에서 하나의 추적된 slug 또는 모든 추적된
    ClawHub 설치를 업데이트합니다.
  - Config 모드는 `enabled`, `apiKey`, `env` 같은 `skills.entries.<skillKey>`
    값에 패치합니다.

## Exec 승인

- exec 요청이 승인을 필요로 할 때, gateway는 `exec.approval.requested`를
  브로드캐스트합니다.
- Operator 클라이언트는 `exec.approval.resolve`를 호출하여 해결합니다
  (`operator.approvals` scope 필요).
- `host=node`의 경우, `exec.approval.request`는 `systemRunPlan`(정규 `argv`/`cwd`/`rawCommand`/세션
  메타데이터)을 포함해야 합니다. `systemRunPlan`이 누락된 요청은 거부됩니다.
- 승인 후, 전달된 `node.invoke system.run` 호출은 해당 정규 `systemRunPlan`을
  권한 있는 명령/cwd/세션 context로 재사용합니다.
- 호출자가 prepare와 최종 승인된 `system.run` 전달 사이에 `command`,
  `rawCommand`, `cwd`, `agentId`, `sessionKey`를 변경하면, gateway는 변경된
  페이로드를 신뢰하는 대신 실행을 거부합니다.

## Agent 전달 fallback

- `agent` 요청은 아웃바운드 전달을 요청하기 위해 `deliver=true`를 포함할 수
  있습니다.
- `bestEffortDeliver=false`는 엄격한 동작을 유지합니다: 해석되지 않거나 내부
  전용 전달 대상은 `INVALID_REQUEST`를 반환합니다.
- `bestEffortDeliver=true`는 외부 전달 가능한 경로를 해석할 수 없을 때(예: 내부/webchat
  세션 또는 모호한 다중 channel 구성) 세션 전용 실행으로의 fallback을
  허용합니다.

## 버전 관리

- `PROTOCOL_VERSION`은 `src/gateway/protocol/schema/protocol-schemas.ts`에
  있습니다.
- 클라이언트는 `minProtocol` + `maxProtocol`을 전송합니다; 서버는 불일치를
  거부합니다.
- 스키마 + 모델은 TypeBox 정의에서 생성됩니다:
  - `pnpm protocol:gen`
  - `pnpm protocol:gen:swift`
  - `pnpm protocol:check`

### 클라이언트 상수

`src/gateway/client.ts`의 참조 클라이언트는 다음 기본값을 사용합니다. 값은
protocol v3에서 안정적이며 서드파티 클라이언트에 대한 예상 baseline입니다.

| 상수                                          | 기본값                                                       | 소스                                                       |
| --------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `PROTOCOL_VERSION`                            | `3`                                                          | `src/gateway/protocol/schema/protocol-schemas.ts`          |
| 요청 타임아웃 (RPC당)                         | `30_000` ms                                                  | `src/gateway/client.ts` (`requestTimeoutMs`)               |
| Preauth / connect-challenge 타임아웃           | `10_000` ms                                                  | `src/gateway/handshake-timeouts.ts` (clamp `250`–`10_000`) |
| 초기 재연결 backoff                            | `1_000` ms                                                   | `src/gateway/client.ts` (`backoffMs`)                      |
| 최대 재연결 backoff                            | `30_000` ms                                                  | `src/gateway/client.ts` (`scheduleReconnect`)              |
| 디바이스 토큰 종료 후 빠른 재시도 clamp         | `250` ms                                                     | `src/gateway/client.ts`                                    |
| `terminate()` 전 강제 중지 유예                | `250` ms                                                     | `FORCE_STOP_TERMINATE_GRACE_MS`                            |
| `stopAndWait()` 기본 타임아웃                  | `1_000` ms                                                   | `STOP_AND_WAIT_TIMEOUT_MS`                                 |
| 기본 tick 간격 (`hello-ok` 이전)               | `30_000` ms                                                  | `src/gateway/client.ts`                                    |
| Tick 타임아웃 종료                             | 무음이 `tickIntervalMs * 2`를 초과하면 코드 `4000`            | `src/gateway/client.ts`                                    |
| `MAX_PAYLOAD_BYTES`                           | `25 * 1024 * 1024` (25 MB)                                   | `src/gateway/server-constants.ts`                          |

서버는 `hello-ok`에서 유효한 `policy.tickIntervalMs`, `policy.maxPayload`,
`policy.maxBufferedBytes`를 알립니다; 클라이언트는 pre-handshake 기본값이
아닌 해당 값을 존중해야 합니다.

## 인증(Auth)

- 공유 시크릿 gateway auth는 구성된 auth 모드에 따라 `connect.params.auth.token`
  또는 `connect.params.auth.password`를 사용합니다.
- Tailscale Serve(`gateway.auth.allowTailscale: true`) 또는 비-loopback
  `gateway.auth.mode: "trusted-proxy"` 같은 identity 기반 모드는
  `connect.params.auth.*` 대신 요청 헤더에서 connect auth 검사를 충족합니다.
- Private ingress `gateway.auth.mode: "none"`은 공유 시크릿 connect auth를
  완전히 건너뜁니다; 공용/신뢰할 수 없는 ingress에서 해당 모드를 노출하지
  마십시오.
- Pairing 후, Gateway는 연결 role + scope에 대해 범위가 지정된 **디바이스
  토큰**을 발급합니다. `hello-ok.auth.deviceToken`에 반환되며 향후 연결을 위해
  클라이언트가 영구 저장해야 합니다.
- 클라이언트는 성공적인 connect 후 주 `hello-ok.auth.deviceToken`을 영구
  저장해야 합니다.
- 해당 **저장된** 디바이스 토큰으로 재연결하면 해당 토큰에 대해 저장된 승인된
  scope 세트도 재사용되어야 합니다. 이는 이미 부여된 read/probe/status 접근을
  보존하고 재연결이 더 좁은 암시적 admin 전용 scope로 조용히 축소되는 것을
  피합니다.
- 클라이언트 측 connect auth 조립(`src/gateway/client.ts`의
  `selectConnectAuth`):
  - `auth.password`는 직교적이며 설정된 경우 항상 전달됩니다.
  - `auth.token`은 우선순위 순서로 채워집니다: 명시적 공유 토큰이 먼저, 그 다음
    명시적 `deviceToken`, 그 다음 저장된 디바이스별 토큰(`deviceId` + `role`로
    키가 지정됨).
  - `auth.bootstrapToken`은 위 중 어느 것도 `auth.token`을 해석하지 않은 경우에만
    전송됩니다. 공유 토큰 또는 해석된 디바이스 토큰이 있으면 이를 억제합니다.
  - 일회성 `AUTH_TOKEN_MISMATCH` 재시도에서 저장된 디바이스 토큰의 자동 승격은
    **신뢰된 엔드포인트로만** 제한됩니다 — loopback 또는 pinned `tlsFingerprint`가
    있는 `wss://`. Pinning 없는 공개 `wss://`는 자격이 없습니다.
- 추가 `hello-ok.auth.deviceTokens` 항목은 부트스트랩 핸드오프 토큰입니다.
  connect가 `wss://` 또는 loopback/로컬 pairing 같은 신뢰된 전송에서 부트스트랩
  auth를 사용한 경우에만 영구 저장하십시오.
- 클라이언트가 **명시적인** `deviceToken` 또는 명시적인 `scopes`를 제공하는
  경우, 호출자가 요청한 해당 scope 세트가 권한을 유지합니다; 캐시된 scope는
  클라이언트가 저장된 디바이스별 토큰을 재사용할 때만 재사용됩니다.
- 디바이스 토큰은 `device.token.rotate` 및 `device.token.revoke`를 통해
  회전/취소할 수 있습니다(`operator.pairing` scope 필요).
- 토큰 발급/회전은 해당 디바이스의 pairing 항목에 기록된 승인된 role 세트로
  제한됩니다; 토큰을 회전해도 pairing 승인이 부여하지 않은 role로 디바이스를
  확장할 수 없습니다.
- 페어링된 디바이스 토큰 세션의 경우, 호출자에게 `operator.admin`이 없으면
  디바이스 관리는 self-scope입니다: 비-admin 호출자는 **자신의** 디바이스 항목만
  제거/취소/회전할 수 있습니다.
- `device.token.rotate`는 또한 호출자의 현재 세션 scope에 대해 요청된 operator
  scope 세트를 검사합니다. 비-admin 호출자는 이미 보유한 것보다 더 넓은
  operator scope 세트로 토큰을 회전할 수 없습니다.
- 인증 실패에는 `error.details.code`와 복구 힌트가 포함됩니다:
  - `error.details.canRetryWithDeviceToken` (boolean)
  - `error.details.recommendedNextStep` (`retry_with_device_token`, `update_auth_configuration`, `update_auth_credentials`, `wait_then_retry`, `review_auth_configuration`)
- `AUTH_TOKEN_MISMATCH`에 대한 클라이언트 동작:
  - 신뢰된 클라이언트는 캐시된 디바이스별 토큰으로 하나의 제한된 재시도를
    시도할 수 있습니다.
  - 해당 재시도가 실패하면, 클라이언트는 자동 재연결 루프를 중지하고 operator
    조치 안내를 노출해야 합니다.

## 디바이스 identity + pairing

- 노드는 키페어 지문에서 파생된 안정적인 디바이스 identity(`device.id`)를
  포함해야 합니다.
- Gateway는 디바이스 + role당 토큰을 발급합니다.
- 로컬 자동 승인이 활성화되지 않은 한 새 디바이스 ID에는 pairing 승인이
  필요합니다.
- Pairing 자동 승인은 직접 로컬 loopback 연결을 중심으로 합니다.
- OpenClaw에는 신뢰된 공유 시크릿 헬퍼 흐름을 위한 좁은 백엔드/컨테이너
  로컬 자기 연결 경로도 있습니다.
- 같은 호스트의 tailnet 또는 LAN 연결은 여전히 pairing에 대해 원격으로
  취급되며 승인이 필요합니다.
- 모든 WS 클라이언트는 `connect` 중에 `device` identity를 포함해야 합니다
  (operator + node). Control UI는 다음 모드에서만 생략할 수 있습니다:
  - localhost 전용 비보안 HTTP 호환성을 위한 `gateway.controlUi.allowInsecureAuth=true`.
  - 성공적인 `gateway.auth.mode: "trusted-proxy"` operator Control UI 인증.
  - `gateway.controlUi.dangerouslyDisableDeviceAuth=true`(비상 수단, 심각한
    보안 다운그레이드).
- 모든 연결은 서버가 제공한 `connect.challenge` nonce에 서명해야 합니다.

### 디바이스 auth 마이그레이션 진단

여전히 pre-challenge 서명 동작을 사용하는 레거시 클라이언트의 경우, `connect`는
이제 안정적인 `error.details.reason`과 함께 `error.details.code` 아래에
`DEVICE_AUTH_*` 상세 코드를 반환합니다.

일반적인 마이그레이션 실패:

| 메시지                     | details.code                     | details.reason           | 의미                                                 |
| --------------------------- | -------------------------------- | ------------------------ | ---------------------------------------------------- |
| `device nonce required`     | `DEVICE_AUTH_NONCE_REQUIRED`     | `device-nonce-missing`   | 클라이언트가 `device.nonce`를 생략(또는 공백 전송). |
| `device nonce mismatch`     | `DEVICE_AUTH_NONCE_MISMATCH`     | `device-nonce-mismatch`  | 클라이언트가 오래된/잘못된 nonce로 서명.            |
| `device signature invalid`  | `DEVICE_AUTH_SIGNATURE_INVALID`  | `device-signature`       | 서명 페이로드가 v2 페이로드와 일치하지 않음.         |
| `device signature expired`  | `DEVICE_AUTH_SIGNATURE_EXPIRED`  | `device-signature-stale` | 서명된 타임스탬프가 허용된 편차를 벗어남.            |
| `device identity mismatch`  | `DEVICE_AUTH_DEVICE_ID_MISMATCH` | `device-id-mismatch`     | `device.id`가 공개 키 지문과 일치하지 않음.          |
| `device public key invalid` | `DEVICE_AUTH_PUBLIC_KEY_INVALID` | `device-public-key`      | 공개 키 형식/정규화 실패.                            |

마이그레이션 대상:

- 항상 `connect.challenge`를 기다리십시오.
- 서버 nonce를 포함하는 v2 페이로드에 서명하십시오.
- `connect.params.device.nonce`에 동일한 nonce를 보내십시오.
- 선호하는 서명 페이로드는 `v3`이며, 디바이스/클라이언트/role/scope/토큰/nonce
  필드 외에 `platform` 및 `deviceFamily`를 바인딩합니다.
- 레거시 `v2` 서명은 호환성을 위해 계속 허용되지만, 페어링된 디바이스 메타데이터
  pinning은 여전히 재연결 시 명령 정책을 제어합니다.

## TLS + pinning

- TLS는 WS 연결에 지원됩니다.
- 클라이언트는 선택적으로 gateway 인증서 지문을 pinning할 수 있습니다(`gateway.tls`
  구성 및 `gateway.remote.tlsFingerprint` 또는 CLI `--tls-fingerprint` 참조).

## 범위

이 protocol은 **전체 gateway API**(status, channel, model, chat, agent,
session, node, 승인 등)를 노출합니다. 정확한 surface는
`src/gateway/protocol/schema.ts`의 TypeBox 스키마로 정의됩니다.

## 관련 문서

- [Bridge protocol](/gateway/bridge-protocol)
- [Gateway runbook](/gateway/)
