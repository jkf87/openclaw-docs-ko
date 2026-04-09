---
summary: "게이트웨이에서 OpenAI 호환 /v1/chat/completions HTTP 엔드포인트 노출"
read_when:
  - OpenAI Chat Completions를 기대하는 도구 통합 시
title: "OpenAI Chat Completions"
---

# OpenAI Chat Completions (HTTP)

OpenClaw의 게이트웨이는 소형 OpenAI 호환 Chat Completions 엔드포인트를 서빙할 수 있습니다.

이 엔드포인트는 **기본적으로 비활성화되어 있습니다**. 먼저 구성에서 활성화하십시오.

- `POST /v1/chat/completions`
- 게이트웨이와 동일한 포트 (WS + HTTP 멀티플렉스): `http://<gateway-host>:<port>/v1/chat/completions`

게이트웨이의 OpenAI 호환 HTTP 표면이 활성화되면 다음도 서빙합니다:

- `GET /v1/models`
- `GET /v1/models/{id}`
- `POST /v1/embeddings`
- `POST /v1/responses`

내부적으로 요청은 일반 게이트웨이 에이전트 실행으로 실행되므로(`openclaw agent`와 동일한 코드 경로), 라우팅/권한/구성이 게이트웨이와 일치합니다.

## 인증

게이트웨이 인증 구성을 사용합니다.

일반적인 HTTP 인증 경로:

- 공유 시크릿 인증 (`gateway.auth.mode="token"` 또는 `"password"`):
  `Authorization: Bearer <token-or-password>`
- 신뢰할 수 있는 신원 포함 HTTP 인증 (`gateway.auth.mode="trusted-proxy"`):
  구성된 신원 인식 프록시를 통해 라우팅하고 필요한 신원 헤더를 주입합니다
- 개인 인그레스 열린 인증 (`gateway.auth.mode="none"`):
  인증 헤더 불필요

참고 사항:

- `gateway.auth.mode="token"`인 경우 `gateway.auth.token`(또는 `OPENCLAW_GATEWAY_TOKEN`)을 사용합니다.
- `gateway.auth.mode="password"`인 경우 `gateway.auth.password`(또는 `OPENCLAW_GATEWAY_PASSWORD`)를 사용합니다.
- `gateway.auth.mode="trusted-proxy"`인 경우 HTTP 요청은 구성된 비루프백 신뢰할 수 있는 프록시 소스에서 와야 합니다.
- `gateway.auth.rateLimit`이 구성되고 너무 많은 인증 실패가 발생하면 엔드포인트는 `Retry-After`와 함께 `429`를 반환합니다.

## 보안 경계 (중요)

이 엔드포인트를 게이트웨이 인스턴스의 **전체 오퍼레이터 액세스** 표면으로 취급하십시오.

- 여기서 HTTP bearer 인증은 좁은 사용자별 범위 모델이 아닙니다.
- 이 엔드포인트의 유효한 게이트웨이 토큰/비밀번호는 소유자/오퍼레이터 자격 증명처럼 취급해야 합니다.
- 요청은 신뢰할 수 있는 오퍼레이터 작업과 동일한 컨트롤 플레인 에이전트 경로를 통해 실행됩니다.
- 이 엔드포인트에 별도의 비소유자/사용자별 도구 경계가 없습니다; 호출자가 여기서 게이트웨이 인증을 통과하면 OpenClaw는 해당 호출자를 이 게이트웨이의 신뢰할 수 있는 오퍼레이터로 취급합니다.
- 공유 시크릿 인증 모드(`token` 및 `password`)의 경우, 호출자가 더 좁은 `x-openclaw-scopes` 헤더를 보내더라도 엔드포인트는 정상적인 전체 오퍼레이터 기본값을 복원합니다.
- 이 엔드포인트를 루프백/tailnet/개인 인그레스에만 유지하십시오; 공용 인터넷에 직접 노출하지 마십시오.

인증 매트릭스:

- `gateway.auth.mode="token"` 또는 `"password"` + `Authorization: Bearer ...`
  - 공유 게이트웨이 오퍼레이터 시크릿의 소유를 증명합니다
  - 더 좁은 `x-openclaw-scopes`를 무시합니다
  - 전체 기본 오퍼레이터 범위 집합을 복원합니다:
    `operator.admin`, `operator.approvals`, `operator.pairing`,
    `operator.read`, `operator.talk.secrets`, `operator.write`
- 신뢰할 수 있는 신원 포함 HTTP 모드 (예: 신뢰할 수 있는 프록시 인증, 또는 개인 인그레스의 `gateway.auth.mode="none"`)
  - 외부 신뢰할 수 있는 신원 또는 배포 경계를 인증합니다
  - 헤더가 있을 때 `x-openclaw-scopes`를 준수합니다
  - 헤더가 없을 때 정상적인 오퍼레이터 기본 범위 집합으로 폴백합니다

[보안](/gateway/security/) 및 [원격 액세스](/gateway/remote) 참조.

## 에이전트 우선 모델 계약

OpenClaw는 OpenAI `model` 필드를 원시 프로바이더 모델 id가 아닌 **에이전트 대상**으로 취급합니다.

- `model: "openclaw"` — 구성된 기본 에이전트로 라우팅합니다.
- `model: "openclaw/default"` — 구성된 기본 에이전트로도 라우팅합니다.
- `model: "openclaw/<agentId>"` — 특정 에이전트로 라우팅합니다.

선택적 요청 헤더:

- `x-openclaw-model: <provider/model-or-bare-id>` — 선택된 에이전트의 백엔드 모델을 재정의합니다.
- `x-openclaw-agent-id: <agentId>` — 호환성 재정의로 지원됩니다.
- `x-openclaw-session-key: <sessionKey>` — 세션 라우팅을 완전히 제어합니다.
- `x-openclaw-message-channel: <channel>` — 채널 인식 프롬프트 및 정책을 위한 합성 인그레스 채널 컨텍스트를 설정합니다.

여전히 허용되는 호환성 별칭:

- `model: "openclaw:<agentId>"`
- `model: "agent:<agentId>"`

## 엔드포인트 활성화

`gateway.http.endpoints.chatCompletions.enabled`를 `true`로 설정합니다:

```json5
{
  gateway: {
    http: {
      endpoints: {
        chatCompletions: { enabled: true },
      },
    },
  },
}
```

## 엔드포인트 비활성화

`gateway.http.endpoints.chatCompletions.enabled`를 `false`로 설정합니다:

```json5
{
  gateway: {
    http: {
      endpoints: {
        chatCompletions: { enabled: false },
      },
    },
  },
}
```

## 세션 동작

기본적으로 엔드포인트는 **요청별 상태 없음**입니다 (각 호출마다 새 세션 키가 생성됨).

요청에 OpenAI `user` 문자열이 포함된 경우, 게이트웨이는 이로부터 안정적인 세션 키를 파생하므로 반복 호출이 에이전트 세션을 공유할 수 있습니다.

## 이 표면이 중요한 이유

이는 자체 호스팅 프론트엔드와 도구에 대한 가장 높은 레버리지 호환성 세트입니다:

- 대부분의 Open WebUI, LobeChat, LibreChat 설정은 `/v1/models`를 기대합니다.
- 많은 RAG 시스템은 `/v1/embeddings`를 기대합니다.
- 기존 OpenAI 채팅 클라이언트는 보통 `/v1/chat/completions`로 시작할 수 있습니다.
- 더 에이전트 네이티브한 클라이언트는 점점 `/v1/responses`를 선호합니다.

## 모델 목록 및 에이전트 라우팅

<AccordionGroup>
  <Accordion title="`/v1/models`는 무엇을 반환하나요?">
    OpenClaw 에이전트 대상 목록입니다.

    반환된 id는 `openclaw`, `openclaw/default`, `openclaw/<agentId>` 항목입니다.
    OpenAI `model` 값으로 직접 사용하십시오.

  </Accordion>
  <Accordion title="`/v1/models`는 에이전트 또는 서브 에이전트를 나열하나요?">
    백엔드 프로바이더 모델이 아닌 최상위 에이전트 대상을 나열하며, 서브 에이전트도 아닙니다.

    서브 에이전트는 내부 실행 토폴로지로 유지됩니다. 의사 모델로 나타나지 않습니다.

  </Accordion>
  <Accordion title="`openclaw/default`가 포함된 이유는?">
    `openclaw/default`는 구성된 기본 에이전트의 안정적인 별칭입니다.

    이는 클라이언트가 환경 간에 실제 기본 에이전트 id가 변경되더라도 예측 가능한 하나의 id를 계속 사용할 수 있음을 의미합니다.

  </Accordion>
  <Accordion title="백엔드 모델을 어떻게 재정의하나요?">
    `x-openclaw-model`을 사용합니다.

    예제:
    `x-openclaw-model: openai/gpt-5.4`
    `x-openclaw-model: gpt-5.4`

    생략하면 선택된 에이전트가 정상적으로 구성된 모델 선택으로 실행됩니다.

  </Accordion>
  <Accordion title="임베딩은 이 계약에 어떻게 맞나요?">
    `/v1/embeddings`는 동일한 에이전트 대상 `model` id를 사용합니다.

    `model: "openclaw/default"` 또는 `model: "openclaw/<agentId>"`를 사용합니다.
    특정 임베딩 모델이 필요한 경우 `x-openclaw-model`로 전송합니다.
    해당 헤더 없이는 요청이 선택된 에이전트의 정상적인 임베딩 설정으로 전달됩니다.

  </Accordion>
</AccordionGroup>

## 스트리밍 (SSE)

Server-Sent Events(SSE)를 받으려면 `stream: true`를 설정합니다:

- `Content-Type: text/event-stream`
- 각 이벤트 줄은 `data: <json>`
- 스트림은 `data: [DONE]`으로 종료됩니다

## Open WebUI 빠른 설정

기본 Open WebUI 연결의 경우:

- 기본 URL: `http://127.0.0.1:18789/v1`
- macOS의 Docker 기본 URL: `http://host.docker.internal:18789/v1`
- API 키: 게이트웨이 bearer 토큰
- 모델: `openclaw/default`

예상 동작:

- `GET /v1/models`는 `openclaw/default`를 나열해야 합니다
- Open WebUI는 채팅 모델 id로 `openclaw/default`를 사용해야 합니다
- 해당 에이전트에 대한 특정 백엔드 프로바이더/모델을 원하면 에이전트의 정상 기본 모델을 설정하거나 `x-openclaw-model`을 전송합니다

빠른 스모크 테스트:

```bash
curl -sS http://127.0.0.1:18789/v1/models \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

`openclaw/default`가 반환되면 대부분의 Open WebUI 설정이 동일한 기본 URL과 토큰으로 연결될 수 있습니다.

## 예제

비스트리밍:

```bash
curl -sS http://127.0.0.1:18789/v1/chat/completions \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "openclaw/default",
    "messages": [{"role":"user","content":"hi"}]
  }'
```

스트리밍:

```bash
curl -N http://127.0.0.1:18789/v1/chat/completions \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-openclaw-model: openai/gpt-5.4' \
  -d '{
    "model": "openclaw/research",
    "stream": true,
    "messages": [{"role":"user","content":"hi"}]
  }'
```

모델 목록:

```bash
curl -sS http://127.0.0.1:18789/v1/models \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

모델 하나 가져오기:

```bash
curl -sS http://127.0.0.1:18789/v1/models/openclaw%2Fdefault \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

임베딩 생성:

```bash
curl -sS http://127.0.0.1:18789/v1/embeddings \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-openclaw-model: openai/text-embedding-3-small' \
  -d '{
    "model": "openclaw/default",
    "input": ["alpha", "beta"]
  }'
```

참고 사항:

- `/v1/models`는 원시 프로바이더 카탈로그가 아닌 OpenClaw 에이전트 대상을 반환합니다.
- `openclaw/default`는 항상 존재하므로 환경 간에 하나의 안정적인 id가 작동합니다.
- 백엔드 프로바이더/모델 재정의는 OpenAI `model` 필드가 아닌 `x-openclaw-model`에 속합니다.
- `/v1/embeddings`는 문자열 또는 문자열 배열로 `input`을 지원합니다.
