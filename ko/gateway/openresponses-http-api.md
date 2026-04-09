---
summary: "게이트웨이에서 OpenResponses 호환 /v1/responses HTTP 엔드포인트 노출"
read_when:
  - OpenResponses API를 사용하는 클라이언트 통합 시
  - 항목 기반 입력, 클라이언트 도구 호출, 또는 SSE 이벤트가 필요할 때
title: "OpenResponses API"
---

# OpenResponses API (HTTP)

OpenClaw의 게이트웨이는 OpenResponses 호환 `POST /v1/responses` 엔드포인트를 서빙할 수 있습니다.

이 엔드포인트는 **기본적으로 비활성화되어 있습니다**. 먼저 구성에서 활성화하십시오.

- `POST /v1/responses`
- 게이트웨이와 동일한 포트 (WS + HTTP 멀티플렉스): `http://<gateway-host>:<port>/v1/responses`

내부적으로 요청은 일반 게이트웨이 에이전트 실행으로 실행됩니다(`openclaw agent`와 동일한 코드 경로).

## 인증, 보안, 및 라우팅

운영 동작은 [OpenAI Chat Completions](/gateway/openai-http-api)와 일치합니다:

- 일치하는 게이트웨이 HTTP 인증 경로를 사용합니다:
  - 공유 시크릿 인증 (`gateway.auth.mode="token"` 또는 `"password"`): `Authorization: Bearer <token-or-password>`
  - 신뢰할 수 있는 프록시 인증 (`gateway.auth.mode="trusted-proxy"`): 구성된 비루프백 신뢰할 수 있는 프록시 소스의 신원 인식 프록시 헤더
  - 개인 인그레스 열린 인증 (`gateway.auth.mode="none"`): 인증 헤더 없음
- 엔드포인트를 게이트웨이 인스턴스의 전체 오퍼레이터 액세스로 취급합니다
- 공유 시크릿 인증 모드(`token` 및 `password`)의 경우, 더 좁은 bearer 선언 `x-openclaw-scopes` 값을 무시하고 정상적인 전체 오퍼레이터 기본값을 복원합니다
- `model: "openclaw"`, `model: "openclaw/default"`, `model: "openclaw/<agentId>"`, 또는 `x-openclaw-agent-id`로 에이전트를 선택합니다
- 선택된 에이전트의 백엔드 모델을 재정의하려면 `x-openclaw-model`을 사용합니다
- 명시적 세션 라우팅에는 `x-openclaw-session-key`를 사용합니다

`gateway.http.endpoints.responses.enabled`로 이 엔드포인트를 활성화하거나 비활성화합니다.

동일한 호환성 표면에는 다음도 포함됩니다:

- `GET /v1/models`
- `GET /v1/models/{id}`
- `POST /v1/embeddings`
- `POST /v1/chat/completions`

에이전트 대상 모델, `openclaw/default`, 임베딩 전달, 백엔드 모델 재정의가 어떻게 맞는지에 대한 정식 설명은 [OpenAI Chat Completions](/gateway/openai-http-api#agent-first-model-contract) 및 [모델 목록 및 에이전트 라우팅](/gateway/openai-http-api#model-list-and-agent-routing)을 참조하십시오.

## 세션 동작

기본적으로 엔드포인트는 **요청별 상태 없음**입니다 (각 호출마다 새 세션 키가 생성됨).

요청에 OpenResponses `user` 문자열이 포함된 경우, 게이트웨이는 이로부터 안정적인 세션 키를 파생하므로 반복 호출이 에이전트 세션을 공유할 수 있습니다.

## 요청 형태 (지원됨)

요청은 항목 기반 입력이 있는 OpenResponses API를 따릅니다. 현재 지원:

- `input`: 문자열 또는 항목 객체 배열.
- `instructions`: 시스템 프롬프트에 병합됩니다.
- `tools`: 클라이언트 도구 정의 (함수 도구).
- `tool_choice`: 클라이언트 도구를 필터링하거나 요구합니다.
- `stream`: SSE 스트리밍을 활성화합니다.
- `max_output_tokens`: 최선의 출력 제한 (프로바이더에 따라 다름).
- `user`: 안정적인 세션 라우팅.

허용되지만 **현재 무시됨**:

- `max_tool_calls`
- `reasoning`
- `metadata`
- `store`
- `truncation`

지원됨:

- `previous_response_id`: 요청이 동일한 에이전트/사용자/요청된 세션 범위 내에 있을 때 OpenClaw는 이전 응답 세션을 재사용합니다.

## 항목 (입력)

### `message`

역할: `system`, `developer`, `user`, `assistant`.

- `system`과 `developer`는 시스템 프롬프트에 추가됩니다.
- 가장 최근의 `user` 또는 `function_call_output` 항목이 "현재 메시지"가 됩니다.
- 이전 사용자/어시스턴트 메시지는 컨텍스트를 위한 기록으로 포함됩니다.

### `function_call_output` (턴 기반 도구)

모델에 도구 결과를 다시 전송합니다:

```json
{
  "type": "function_call_output",
  "call_id": "call_123",
  "output": "{\"temperature\": \"72F\"}"
}
```

### `reasoning` 및 `item_reference`

스키마 호환성을 위해 허용되지만 프롬프트를 구축할 때 무시됩니다.

## 도구 (클라이언트 측 함수 도구)

`tools: [{ type: "function", function: { name, description?, parameters? } }]`로 도구를 제공합니다.

에이전트가 도구를 호출하기로 결정하면 응답은 `function_call` 출력 항목을 반환합니다.
그런 다음 턴을 계속하기 위해 `function_call_output`과 함께 후속 요청을 보냅니다.

## 이미지 (`input_image`)

base64 또는 URL 소스를 지원합니다:

```json
{
  "type": "input_image",
  "source": { "type": "url", "url": "https://example.com/image.png" }
}
```

허용된 MIME 유형 (현재): `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/heic`, `image/heif`.
최대 크기 (현재): 10MB.

## 파일 (`input_file`)

base64 또는 URL 소스를 지원합니다:

```json
{
  "type": "input_file",
  "source": {
    "type": "base64",
    "media_type": "text/plain",
    "data": "SGVsbG8gV29ybGQh",
    "filename": "hello.txt"
  }
}
```

허용된 MIME 유형 (현재): `text/plain`, `text/markdown`, `text/html`, `text/csv`,
`application/json`, `application/pdf`.

최대 크기 (현재): 5MB.

현재 동작:

- 파일 콘텐츠는 디코딩되어 사용자 메시지가 아닌 **시스템 프롬프트**에 추가되므로, 임시적입니다 (세션 기록에 유지되지 않음).
- 디코딩된 파일 텍스트는 추가되기 전에 **신뢰할 수 없는 외부 콘텐츠**로 래핑됩니다.
- 주입된 블록은 `<<<EXTERNAL_UNTRUSTED_CONTENT id="...">>>` / `<<<END_EXTERNAL_UNTRUSTED_CONTENT id="...">>>`와 같은 명시적 경계 표시를 사용합니다.
- PDF는 먼저 텍스트를 파싱합니다. 텍스트가 적으면 첫 페이지를 이미지로 래스터화하여 모델에 전달합니다.

## 파일 + 이미지 제한 (구성)

`gateway.http.endpoints.responses` 아래에서 기본값을 조정할 수 있습니다:

```json5
{
  gateway: {
    http: {
      endpoints: {
        responses: {
          enabled: true,
          maxBodyBytes: 20000000,
          maxUrlParts: 8,
          files: {
            allowUrl: true,
            urlAllowlist: ["cdn.example.com", "*.assets.example.com"],
            allowedMimes: [
              "text/plain",
              "text/markdown",
              "text/html",
              "text/csv",
              "application/json",
              "application/pdf",
            ],
            maxBytes: 5242880,
            maxChars: 200000,
            maxRedirects: 3,
            timeoutMs: 10000,
            pdf: {
              maxPages: 4,
              maxPixels: 4000000,
              minTextChars: 200,
            },
          },
          images: {
            allowUrl: true,
            urlAllowlist: ["images.example.com"],
            allowedMimes: [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
              "image/heic",
              "image/heif",
            ],
            maxBytes: 10485760,
            maxRedirects: 3,
            timeoutMs: 10000,
          },
        },
      },
    },
  },
}
```

생략 시 기본값:

- `maxBodyBytes`: 20MB
- `maxUrlParts`: 8
- `files.maxBytes`: 5MB
- `files.maxChars`: 200k
- `files.maxRedirects`: 3
- `files.timeoutMs`: 10초
- `images.maxBytes`: 10MB
- `images.maxRedirects`: 3
- `images.timeoutMs`: 10초
- HEIC/HEIF `input_image` 소스는 허용되며 프로바이더 전달 전에 JPEG로 정규화됩니다.

보안 참고 사항:

- URL 허용 목록은 가져오기 전과 리다이렉트 홉에서 적용됩니다.
- 호스트명 허용 목록은 개인/내부 IP 차단을 우회하지 않습니다.

## 스트리밍 (SSE)

Server-Sent Events(SSE)를 받으려면 `stream: true`를 설정합니다:

- `Content-Type: text/event-stream`
- 각 이벤트 줄은 `event: <type>` 및 `data: <json>`
- 스트림은 `data: [DONE]`으로 종료됩니다

현재 내보내지는 이벤트 유형:

- `response.created`
- `response.in_progress`
- `response.output_item.added`
- `response.content_part.added`
- `response.output_text.delta`
- `response.output_text.done`
- `response.content_part.done`
- `response.output_item.done`
- `response.completed`
- `response.failed` (오류 시)

## 사용량

`usage`는 기본 프로바이더가 토큰 수를 보고할 때 채워집니다.

## 오류

오류는 다음과 같은 JSON 객체를 사용합니다:

```json
{ "error": { "message": "...", "type": "invalid_request_error" } }
```

일반적인 경우:

- `401` 누락/잘못된 인증
- `400` 잘못된 요청 본문
- `405` 잘못된 메서드

## 예제

비스트리밍:

```bash
curl -sS http://127.0.0.1:18789/v1/responses \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-openclaw-agent-id: main' \
  -d '{
    "model": "openclaw",
    "input": "hi"
  }'
```

스트리밍:

```bash
curl -N http://127.0.0.1:18789/v1/responses \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-openclaw-agent-id: main' \
  -d '{
    "model": "openclaw",
    "stream": true,
    "input": "hi"
  }'
```
