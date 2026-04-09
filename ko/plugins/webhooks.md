---
summary: "Webhooks 플러그인: 신뢰할 수 있는 외부 자동화를 위한 인증된 TaskFlow 수신"
read_when:
  - 외부 시스템에서 TaskFlow를 트리거하거나 구동하고 싶을 때
  - 번들 webhooks 플러그인을 구성할 때
title: "Webhooks 플러그인"
---

# Webhooks (플러그인)

Webhooks 플러그인은 외부 자동화를 OpenClaw TaskFlow에 바인딩하는 인증된 HTTP 라우트를 추가합니다.

커스텀 플러그인을 먼저 작성하지 않고 Zapier, n8n, CI 작업, 또는 내부 서비스와 같은 신뢰할 수 있는 시스템이 관리되는 TaskFlow를 생성하고 구동하도록 하려면 이것을 사용하십시오.

## 실행 위치

Webhooks 플러그인은 게이트웨이 프로세스 내에서 실행됩니다.

게이트웨이가 다른 머신에서 실행된다면 해당 게이트웨이 호스트에 플러그인을 설치 및 구성한 다음 게이트웨이를 재시작하십시오.

## 라우트 구성

`plugins.entries.webhooks.config` 아래에 구성을 설정하십시오:

```json5
{
  plugins: {
    entries: {
      webhooks: {
        enabled: true,
        config: {
          routes: {
            zapier: {
              path: "/plugins/webhooks/zapier",
              sessionKey: "agent:main:main",
              secret: {
                source: "env",
                provider: "default",
                id: "OPENCLAW_WEBHOOK_SECRET",
              },
              controllerId: "webhooks/zapier",
              description: "Zapier TaskFlow bridge",
            },
          },
        },
      },
    },
  },
}
```

라우트 필드:

- `enabled`: 선택 사항, 기본값 `true`
- `path`: 선택 사항, 기본값 `/plugins/webhooks/<routeId>`
- `sessionKey`: 바인딩된 TaskFlow를 소유하는 필수 세션
- `secret`: 필수 공유 시크릿 또는 SecretRef
- `controllerId`: 생성된 관리 흐름의 선택적 컨트롤러 id
- `description`: 선택적 운영자 메모

지원되는 `secret` 입력:

- 일반 문자열
- `source: "env" | "file" | "exec"`가 있는 SecretRef

시크릿 기반 라우트가 시작 시 시크릿을 해결할 수 없으면 플러그인은 해당 라우트를 건너뛰고 깨진 엔드포인트를 노출하는 대신 경고를 기록합니다.

## 보안 모델

각 라우트는 구성된 `sessionKey`의 TaskFlow 권한으로 신뢰 받아 작동합니다.

즉, 라우트는 해당 세션이 소유한 TaskFlow를 검사하고 변경할 수 있으므로, 다음을 수행해야 합니다:

- 라우트당 강력한 고유 시크릿 사용
- 인라인 일반 텍스트 시크릿보다 시크릿 참조 선호
- 라우트를 워크플로우에 맞는 가장 좁은 세션에 바인딩
- 필요한 특정 웹훅 경로만 노출

플러그인은 다음을 적용합니다:

- 공유 시크릿 인증
- 요청 본문 크기 및 타임아웃 가드
- 고정 창 속도 제한
- 진행 중 요청 제한
- `api.runtime.taskFlow.bindSession(...)`을 통한 소유자 바인딩 TaskFlow 접근

## 요청 형식

다음과 함께 `POST` 요청을 보내십시오:

- `Content-Type: application/json`
- `Authorization: Bearer <secret>` 또는 `x-openclaw-webhook-secret: <secret>`

예시:

```bash
curl -X POST https://gateway.example.com/plugins/webhooks/zapier \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_SHARED_SECRET' \
  -d '{"action":"create_flow","goal":"Review inbound queue"}'
```

## 지원되는 액션

플러그인은 현재 다음 JSON `action` 값을 수락합니다:

- `create_flow`
- `get_flow`
- `list_flows`
- `find_latest_flow`
- `resolve_flow`
- `get_task_summary`
- `set_waiting`
- `resume_flow`
- `finish_flow`
- `fail_flow`
- `request_cancel`
- `cancel_flow`
- `run_task`

### `create_flow`

라우트의 바인딩된 세션을 위한 관리 TaskFlow를 생성합니다.

예시:

```json
{
  "action": "create_flow",
  "goal": "Review inbound queue",
  "status": "queued",
  "notifyPolicy": "done_only"
}
```

### `run_task`

기존 관리 TaskFlow 내에 관리 자식 태스크를 생성합니다.

허용된 런타임:

- `subagent`
- `acp`

예시:

```json
{
  "action": "run_task",
  "flowId": "flow_123",
  "runtime": "acp",
  "childSessionKey": "agent:main:acp:worker",
  "task": "Inspect the next message batch"
}
```

## 응답 형태

성공 응답:

```json
{
  "ok": true,
  "routeId": "zapier",
  "result": {}
}
```

거부된 요청:

```json
{
  "ok": false,
  "routeId": "zapier",
  "code": "not_found",
  "error": "TaskFlow not found.",
  "result": {}
}
```

플러그인은 의도적으로 웹훅 응답에서 소유자/세션 메타데이터를 제거합니다.

## 관련 문서

- [플러그인 런타임 SDK](/plugins/sdk-runtime)
- [훅 및 웹훅 개요](/automation/hooks)
- [CLI 웹훅](/cli/webhooks)
