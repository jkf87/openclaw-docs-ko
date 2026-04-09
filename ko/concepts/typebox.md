---
summary: "게이트웨이 프로토콜의 단일 진실의 원천으로서의 TypeBox 스키마"
read_when:
  - 프로토콜 스키마 또는 코드젠 업데이트 시
title: "TypeBox"
---

# 프로토콜 진실의 원천으로서의 TypeBox

마지막 업데이트: 2026-01-10

TypeBox는 TypeScript 우선 스키마 라이브러리입니다. 이를 사용하여 **게이트웨이 WebSocket 프로토콜** (핸드셰이크, 요청/응답, 서버 이벤트)을 정의합니다. 해당 스키마는 **런타임 유효성 검사**, **JSON 스키마 내보내기**, macOS 앱을 위한 **Swift 코드젠**을 구동합니다. 단일 진실의 원천; 나머지는 모두 생성됩니다.

상위 수준 프로토콜 컨텍스트를 원하면 [게이트웨이 아키텍처](/concepts/architecture)로 시작하십시오.

## 멘탈 모델 (30초)

모든 게이트웨이 WS 메시지는 세 가지 프레임 중 하나입니다:

- **요청**: `{ type: "req", id, method, params }`
- **응답**: `{ type: "res", id, ok, payload | error }`
- **이벤트**: `{ type: "event", event, payload, seq?, stateVersion? }`

첫 번째 프레임은 반드시 `connect` 요청이어야 합니다. 그 후 클라이언트는 메서드를 호출하고 (예: `health`, `send`, `chat.send`) 이벤트를 구독할 수 있습니다 (예: `presence`, `tick`, `agent`).

연결 흐름 (최소):

```
클라이언트                  게이트웨이
  |---- req:connect -------->|
  |<---- res:hello-ok --------|
  |<---- event:tick ----------|
  |---- req:health ---------->|
  |<---- res:health ----------|
```

일반적인 메서드 + 이벤트:

| 카테고리   | 예시                                                       | 참고                              |
| ---------- | ---------------------------------------------------------- | --------------------------------- |
| 코어       | `connect`, `health`, `status`                              | `connect`가 먼저여야 합니다       |
| 메시징     | `send`, `agent`, `agent.wait`, `system-event`, `logs.tail` | 부작용에는 `idempotencyKey` 필요  |
| 채팅       | `chat.history`, `chat.send`, `chat.abort`                  | WebChat이 이것을 사용합니다       |
| 세션       | `sessions.list`, `sessions.patch`, `sessions.delete`       | 세션 관리                         |
| 자동화     | `wake`, `cron.list`, `cron.run`, `cron.runs`               | wake + cron 제어                  |
| 노드       | `node.list`, `node.invoke`, `node.pair.*`                  | 게이트웨이 WS + 노드 액션         |
| 이벤트     | `tick`, `presence`, `agent`, `chat`, `health`, `shutdown`  | 서버 푸시                         |

권위 있는 광고된 **탐색** 인벤토리는 `src/gateway/server-methods-list.ts` (`listGatewayMethods`, `GATEWAY_EVENTS`)에 있습니다.

## 스키마가 있는 위치

- 소스: `src/gateway/protocol/schema.ts`
- 런타임 유효성 검사기 (AJV): `src/gateway/protocol/index.ts`
- 광고된 기능/탐색 레지스트리: `src/gateway/server-methods-list.ts`
- 서버 핸드셰이크 + 메서드 디스패치: `src/gateway/server.impl.ts`
- 노드 클라이언트: `src/gateway/client.ts`
- 생성된 JSON 스키마: `dist/protocol.schema.json`
- 생성된 Swift 모델: `apps/macos/Sources/OpenClawProtocol/GatewayModels.swift`

## 현재 파이프라인

- `pnpm protocol:gen`
  - JSON 스키마 (draft-07)를 `dist/protocol.schema.json`에 씁니다
- `pnpm protocol:gen:swift`
  - Swift 게이트웨이 모델 생성
- `pnpm protocol:check`
  - 두 생성기를 실행하고 출력이 커밋됐는지 확인합니다

## 런타임에서 스키마 사용 방법

- **서버 측**: 모든 인바운드 프레임은 AJV로 유효성 검사됩니다. 핸드셰이크는 `ConnectParams`와 일치하는 파라미터를 가진 `connect` 요청만 허용합니다.
- **클라이언트 측**: JS 클라이언트는 이벤트 및 응답 프레임을 사용하기 전에 유효성 검사합니다.
- **기능 탐색**: 게이트웨이는 `listGatewayMethods()`와 `GATEWAY_EVENTS`에서 `hello-ok`에 보수적인 `features.methods` 및 `features.events` 목록을 보냅니다.
- 그 탐색 목록은 `coreGatewayHandlers`의 모든 호출 가능한 도우미의 생성된 덤프가 아닙니다. 일부 도우미 RPC는 광고된 기능 목록에 열거되지 않고 `src/gateway/server-methods/*.ts`에 구현됩니다.

## 예시 프레임

연결 (첫 번째 메시지):

```json
{
  "type": "req",
  "id": "c1",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "openclaw-macos",
      "displayName": "macos",
      "version": "1.0.0",
      "platform": "macos 15.1",
      "mode": "ui",
      "instanceId": "A1B2"
    }
  }
}
```

Hello-ok 응답:

```json
{
  "type": "res",
  "id": "c1",
  "ok": true,
  "payload": {
    "type": "hello-ok",
    "protocol": 3,
    "server": { "version": "dev", "connId": "ws-1" },
    "features": { "methods": ["health"], "events": ["tick"] },
    "snapshot": {
      "presence": [],
      "health": {},
      "stateVersion": { "presence": 0, "health": 0 },
      "uptimeMs": 0
    },
    "policy": { "maxPayload": 1048576, "maxBufferedBytes": 1048576, "tickIntervalMs": 30000 }
  }
}
```

요청 + 응답:

```json
{ "type": "req", "id": "r1", "method": "health" }
```

```json
{ "type": "res", "id": "r1", "ok": true, "payload": { "ok": true } }
```

이벤트:

```json
{ "type": "event", "event": "tick", "payload": { "ts": 1730000000 }, "seq": 12 }
```

## 최소 클라이언트 (Node.js)

가장 작은 유용한 흐름: 연결 + health.

```ts
import { WebSocket } from "ws";

const ws = new WebSocket("ws://127.0.0.1:18789");

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "req",
      id: "c1",
      method: "connect",
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "cli",
          displayName: "example",
          version: "dev",
          platform: "node",
          mode: "cli",
        },
      },
    }),
  );
});

ws.on("message", (data) => {
  const msg = JSON.parse(String(data));
  if (msg.type === "res" && msg.id === "c1" && msg.ok) {
    ws.send(JSON.stringify({ type: "req", id: "h1", method: "health" }));
  }
  if (msg.type === "res" && msg.id === "h1") {
    console.log("health:", msg.payload);
    ws.close();
  }
});
```

## 메서드 추가 예시: 처음부터 끝까지

예시: `{ ok: true, text }`를 반환하는 새로운 `system.echo` 요청 추가.

1. **스키마 (진실의 원천)**

`src/gateway/protocol/schema.ts`에 추가:

```ts
export const SystemEchoParamsSchema = Type.Object(
  { text: NonEmptyString },
  { additionalProperties: false },
);

export const SystemEchoResultSchema = Type.Object(
  { ok: Type.Boolean(), text: NonEmptyString },
  { additionalProperties: false },
);
```

`ProtocolSchemas`에 추가하고 타입 내보내기:

```ts
  SystemEchoParams: SystemEchoParamsSchema,
  SystemEchoResult: SystemEchoResultSchema,
```

```ts
export type SystemEchoParams = Static<typeof SystemEchoParamsSchema>;
export type SystemEchoResult = Static<typeof SystemEchoResultSchema>;
```

2. **유효성 검사**

`src/gateway/protocol/index.ts`에서 AJV 유효성 검사기 내보내기:

```ts
export const validateSystemEchoParams = ajv.compile<SystemEchoParams>(SystemEchoParamsSchema);
```

3. **서버 동작**

`src/gateway/server-methods/system.ts`에 핸들러 추가:

```ts
export const systemHandlers: GatewayRequestHandlers = {
  "system.echo": ({ params, respond }) => {
    const text = String(params.text ?? "");
    respond(true, { ok: true, text });
  },
};
```

`src/gateway/server-methods.ts`에 등록하고 (이미 `systemHandlers` 병합),
`src/gateway/server-methods-list.ts`의 `listGatewayMethods` 입력에 `"system.echo"` 추가.

메서드가 운영자 또는 노드 클라이언트에서 호출 가능한 경우, 범위 강제 및 `hello-ok` 기능 광고가 정렬 상태를 유지하도록 `src/gateway/method-scopes.ts`에서도 분류하십시오.

4. **재생성**

```bash
pnpm protocol:check
```

5. **테스트 + 문서**

`src/gateway/server.*.test.ts`에 서버 테스트를 추가하고 문서에 메서드를 언급하십시오.

## Swift 코드젠 동작

Swift 생성기는 다음을 내보냅니다:

- `req`, `res`, `event`, `unknown` 케이스가 있는 `GatewayFrame` 열거형
- 강하게 타입이 지정된 페이로드 구조체/열거형
- `ErrorCode` 값 및 `GATEWAY_PROTOCOL_VERSION`

알 수 없는 프레임 타입은 순방향 호환성을 위해 원시 페이로드로 보존됩니다.

## 버전 관리 + 호환성

- `PROTOCOL_VERSION`은 `src/gateway/protocol/schema.ts`에 있습니다.
- 클라이언트는 `minProtocol` + `maxProtocol`을 보냅니다. 서버는 불일치를 거부합니다.
- Swift 모델은 이전 클라이언트를 중단하지 않기 위해 알 수 없는 프레임 타입을 유지합니다.

## 스키마 패턴 및 규칙

- 대부분의 객체는 엄격한 페이로드를 위해 `additionalProperties: false`를 사용합니다.
- `NonEmptyString`은 ID 및 메서드/이벤트 이름의 기본값입니다.
- 최상위 `GatewayFrame`은 `type`에 **판별자**를 사용합니다.
- 부작용이 있는 메서드는 일반적으로 파라미터에 `idempotencyKey`가 필요합니다 (예: `send`, `poll`, `agent`, `chat.send`).
- `agent`는 런타임 생성 오케스트레이션 컨텍스트를 위한 선택적 `internalEvents`를 허용합니다 (예: 서브에이전트/cron 태스크 완료 핸드오프). 이를 내부 API 표면으로 처리하십시오.

## 라이브 스키마 JSON

생성된 JSON 스키마는 리포의 `dist/protocol.schema.json`에 있습니다. 게시된 원시 파일은 일반적으로 다음에서 사용 가능합니다:

- [https://raw.githubusercontent.com/openclaw/openclaw/main/dist/protocol.schema.json](https://raw.githubusercontent.com/openclaw/openclaw/main/dist/protocol.schema.json)

## 스키마 변경 시

1. TypeBox 스키마를 업데이트합니다.
2. `src/gateway/server-methods-list.ts`에 메서드/이벤트를 등록합니다.
3. 새 RPC에 운영자 또는 노드 범위 분류가 필요한 경우 `src/gateway/method-scopes.ts`를 업데이트합니다.
4. `pnpm protocol:check`를 실행합니다.
5. 재생성된 스키마 + Swift 모델을 커밋합니다.
