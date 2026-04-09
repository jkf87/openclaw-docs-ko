---
summary: "OpenClaw을 inferrs (OpenAI 호환 로컬 서버)를 통해 실행"
read_when:
  - 로컬 inferrs 서버에 대해 OpenClaw를 실행하려는 경우
  - inferrs를 통해 Gemma 또는 다른 모델을 제공하는 경우
  - inferrs에 대한 정확한 OpenClaw 호환 플래그가 필요한 경우
title: "inferrs"
---

# inferrs

[inferrs](https://github.com/ericcurtin/inferrs)는 OpenAI 호환 `/v1` API 뒤에서 로컬 모델을 제공할 수 있습니다. OpenClaw는 일반 `openai-completions` 경로를 통해 `inferrs`와 함께 작동합니다.

`inferrs`는 현재 전용 OpenClaw 프로바이더 플러그인이 아닌 커스텀 자체 호스팅 OpenAI 호환 백엔드로 처리하는 것이 가장 좋습니다.

## 빠른 시작

1. 모델로 `inferrs`를 시작하십시오.

예시:

```bash
inferrs serve google/gemma-4-E2B-it \
  --host 127.0.0.1 \
  --port 8080 \
  --device metal
```

2. 서버에 접근 가능한지 확인하십시오.

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/v1/models
```

3. 명시적 OpenClaw 프로바이더 항목을 추가하고 기본 모델을 그것을 가리키게 하십시오.

## 전체 구성 예시

이 예시는 로컬 `inferrs` 서버에서 Gemma 4를 사용합니다.

```json5
{
  agents: {
    defaults: {
      model: { primary: "inferrs/google/gemma-4-E2B-it" },
      models: {
        "inferrs/google/gemma-4-E2B-it": {
          alias: "Gemma 4 (inferrs)",
        },
      },
    },
  },
  models: {
    mode: "merge",
    providers: {
      inferrs: {
        baseUrl: "http://127.0.0.1:8080/v1",
        apiKey: "inferrs-local",
        api: "openai-completions",
        models: [
          {
            id: "google/gemma-4-E2B-it",
            name: "Gemma 4 E2B (inferrs)",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 131072,
            maxTokens: 4096,
            compat: {
              requiresStringContent: true,
            },
          },
        ],
      },
    },
  },
}
```

## `requiresStringContent`가 중요한 이유

일부 `inferrs` Chat Completions 경로는 구조화된 콘텐츠 파트 배열이 아닌 문자열
`messages[].content`만 허용합니다.

OpenClaw 실행이 다음과 같은 오류로 실패하는 경우:

```text
messages[1].content: invalid type: sequence, expected a string
```

다음을 설정하십시오:

```json5
compat: {
  requiresStringContent: true
}
```

OpenClaw는 요청을 보내기 전에 순수 텍스트 콘텐츠 파트를 일반 문자열로 평탄화합니다.

## Gemma 및 도구 스키마 주의 사항

일부 현재 `inferrs` + Gemma 조합은 작은 직접
`/v1/chat/completions` 요청은 허용하지만 전체 OpenClaw 에이전트 런타임 턴에서는 여전히 실패합니다.

그런 경우 먼저 다음을 시도하십시오:

```json5
compat: {
  requiresStringContent: true,
  supportsTools: false
}
```

이렇게 하면 모델에 대한 OpenClaw의 도구 스키마 인터페이스가 비활성화되고 더 엄격한 로컬 백엔드의 프롬프트 부하를 줄일 수 있습니다.

작은 직접 요청은 여전히 작동하지만 정상적인 OpenClaw 에이전트 턴이 `inferrs` 내부에서 계속 충돌하는 경우, 남은 문제는 일반적으로 OpenClaw의 전송 레이어가 아닌 업스트림 모델/서버 동작입니다.

## 수동 스모크 테스트

구성 후 두 레이어를 모두 테스트하십시오:

```bash
curl http://127.0.0.1:8080/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"google/gemma-4-E2B-it","messages":[{"role":"user","content":"What is 2 + 2?"}],"stream":false}'

openclaw infer model run \
  --model inferrs/google/gemma-4-E2B-it \
  --prompt "What is 2 + 2? Reply with one short sentence." \
  --json
```

첫 번째 명령은 작동하지만 두 번째 명령이 실패하면 아래 문제 해결 참고 사항을 사용하십시오.

## 문제 해결

- `curl /v1/models` 실패: `inferrs`가 실행되지 않거나, 접근 불가능하거나, 예상 호스트/포트에 바인딩되지 않은 경우.
- `messages[].content ... expected a string`: `compat.requiresStringContent: true` 설정.
- 직접 작은 `/v1/chat/completions` 호출은 통과하지만 `openclaw infer model run`이 실패: `compat.supportsTools: false` 시도.
- OpenClaw가 더 이상 스키마 오류를 받지 않지만 더 큰 에이전트 턴에서 `inferrs`가 여전히 충돌: 업스트림 `inferrs` 또는 모델 제한으로 처리하고 프롬프트 부하를 줄이거나 로컬 백엔드/모델을 전환하십시오.

## 프록시 스타일 동작

`inferrs`는 네이티브 OpenAI 엔드포인트가 아닌 프록시 스타일 OpenAI 호환 `/v1` 백엔드로 처리됩니다.

- 네이티브 OpenAI 전용 요청 형성이 여기에 적용되지 않습니다
- `service_tier`, Responses `store`, 프롬프트 캐시 힌트, OpenAI 추론 호환 페이로드 형성이 없습니다
- 히든 OpenClaw 귀속 헤더(`originator`, `version`, `User-Agent`)는 커스텀 `inferrs` 기본 URL에 주입되지 않습니다

## 참조

- [로컬 모델](/gateway/local-models)
- [게이트웨이 문제 해결](/gateway/troubleshooting#local-openai-compatible-backend-passes-direct-probes-but-agent-runs-fail)
- [모델 프로바이더](/concepts/model-providers)
