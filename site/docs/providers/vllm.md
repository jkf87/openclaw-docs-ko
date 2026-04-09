---
title: "vLLM"
description: "vLLM (OpenAI 호환 로컬 서버)으로 OpenClaw 실행"
---

# vLLM

vLLM은 **OpenAI 호환** HTTP API를 통해 오픈 소스 (및 일부 사용자 정의) 모델을 제공할 수 있습니다. OpenClaw는 `openai-completions` API를 사용하여 vLLM에 연결할 수 있습니다.

`VLLM_API_KEY` (서버가 인증을 강제하지 않는 경우 어떤 값이든 가능)를 옵트인하고 명시적인 `models.providers.vllm` 항목을 정의하지 않으면 OpenClaw는 vLLM에서 사용 가능한 모델을 **자동으로 발견**할 수도 있습니다.

## 빠른 시작

1. OpenAI 호환 서버로 vLLM을 시작하십시오.

기본 URL은 `/v1` 엔드포인트를 노출해야 합니다 (예: `/v1/models`, `/v1/chat/completions`). vLLM은 일반적으로 다음에서 실행됩니다:

- `http://127.0.0.1:8000/v1`

2. 옵트인 (인증이 구성되지 않은 경우 어떤 값이든 가능):

```bash
export VLLM_API_KEY="vllm-local"
```

3. 모델 선택 (vLLM 모델 ID 중 하나로 교체):

```json5
{
  agents: {
    defaults: {
      model: { primary: "vllm/your-model-id" },
    },
  },
}
```

## 모델 발견 (암시적 프로바이더)

`VLLM_API_KEY`가 설정되어 있거나 (또는 인증 프로파일이 존재하고) `models.providers.vllm`을 **정의하지 않은** 경우 OpenClaw는 다음을 쿼리합니다:

- `GET http://127.0.0.1:8000/v1/models`

그리고 반환된 id를 모델 항목으로 변환합니다.

`models.providers.vllm`을 명시적으로 설정하면 자동 발견이 건너뛰어지고 모델을 수동으로 정의해야 합니다.

## 명시적 구성 (수동 모델)

다음과 같은 경우 명시적 구성을 사용하십시오:

- vLLM이 다른 호스트/포트에서 실행되는 경우.
- `contextWindow`/`maxTokens` 값을 고정하려는 경우.
- 서버에 실제 API 키가 필요하거나 헤더를 제어하려는 경우.

```json5
{
  models: {
    providers: {
      vllm: {
        baseUrl: "http://127.0.0.1:8000/v1",
        apiKey: "${VLLM_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "your-model-id",
            name: "Local vLLM Model",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
}
```

## 문제 해결

- 서버에 연결 가능한지 확인하십시오:

```bash
curl http://127.0.0.1:8000/v1/models
```

- 인증 오류로 요청이 실패하면 서버 구성과 일치하는 실제 `VLLM_API_KEY`를 설정하거나, `models.providers.vllm` 아래에 프로바이더를 명시적으로 구성하십시오.

## 프록시 스타일 동작

vLLM은 네이티브 OpenAI 엔드포인트가 아닌 프록시 스타일 OpenAI 호환 `/v1` 백엔드로 처리됩니다.

- 네이티브 OpenAI 전용 요청 형성은 여기에 적용되지 않습니다
- `service_tier`, Responses `store`, 프롬프트 캐시 힌트, OpenAI 추론 호환 페이로드 형성 없음
- 숨겨진 OpenClaw 귀속 헤더(`originator`, `version`, `User-Agent`)는 사용자 정의 vLLM 기본 URL에 주입되지 않습니다
