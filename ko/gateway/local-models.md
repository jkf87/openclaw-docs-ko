---
summary: "로컬 LLM에서 OpenClaw 실행 (LM Studio, vLLM, LiteLLM, 사용자 지정 OpenAI 엔드포인트)"
read_when:
  - 자체 GPU 박스에서 모델을 서빙하고 싶을 때
  - LM Studio 또는 OpenAI 호환 프록시를 연결할 때
  - 가장 안전한 로컬 모델 지침이 필요할 때
title: "로컬 모델"
---

# 로컬 모델

로컬은 가능하지만, OpenClaw는 큰 컨텍스트와 프롬프트 인젝션에 대한 강력한 방어를 기대합니다. 소형 카드는 컨텍스트를 잘라내고 안전성을 누출합니다. 높은 목표를 세우십시오: **≥2 최대 사양 Mac Studio 또는 동급 GPU 장비 (~$30k+)**. 단일 **24 GB** GPU는 더 높은 지연 시간의 가벼운 프롬프트에만 작동합니다. 실행할 수 있는 **가장 크고/전체 크기의 모델 변형**을 사용하십시오; 공격적으로 양자화되거나 "소형" 체크포인트는 프롬프트 인젝션 위험을 높입니다([보안](/gateway/security) 참조).

마찰이 가장 적은 로컬 설정을 원한다면 [Ollama](/providers/ollama)와 `openclaw onboard`로 시작하십시오. 이 페이지는 고급 로컬 스택과 사용자 지정 OpenAI 호환 로컬 서버에 대한 의견이 있는 가이드입니다.

## 권장 사항: LM Studio + 대형 로컬 모델 (Responses API)

현재 최고의 로컬 스택. LM Studio에 대형 모델(예: 전체 크기 Qwen, DeepSeek, 또는 Llama 빌드)을 로드하고, 로컬 서버(기본 `http://127.0.0.1:1234`)를 활성화한 후, Responses API를 사용하여 추론을 최종 텍스트와 별도로 유지합니다.

```json5
{
  agents: {
    defaults: {
      model: { primary: "lmstudio/my-local-model" },
      models: {
        "anthropic/claude-opus-4-6": { alias: "Opus" },
        "lmstudio/my-local-model": { alias: "Local" },
      },
    },
  },
  models: {
    mode: "merge",
    providers: {
      lmstudio: {
        baseUrl: "http://127.0.0.1:1234/v1",
        apiKey: "lmstudio",
        api: "openai-responses",
        models: [
          {
            id: "my-local-model",
            name: "Local Model",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 196608,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
}
```

**설정 체크리스트**

- LM Studio 설치: [https://lmstudio.ai](https://lmstudio.ai)
- LM Studio에서 **사용 가능한 가장 큰 모델 빌드**를 다운로드하고(소형/강하게 양자화된 변형 피하기), 서버를 시작한 후 `http://127.0.0.1:1234/v1/models`가 이를 나열하는지 확인합니다.
- `my-local-model`을 LM Studio에 표시된 실제 모델 ID로 교체합니다.
- 모델을 로드된 상태로 유지합니다; 콜드 로드는 시작 지연을 추가합니다.
- LM Studio 빌드가 다른 경우 `contextWindow`/`maxTokens`를 조정합니다.
- WhatsApp의 경우 최종 텍스트만 전송되도록 Responses API를 사용합니다.

로컬을 실행할 때도 호스팅 모델을 구성된 상태로 유지합니다; 폴백이 사용 가능하도록 `models.mode: "merge"`를 사용합니다.

### 하이브리드 구성: 호스팅 기본, 로컬 폴백

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-sonnet-4-6",
        fallbacks: ["lmstudio/my-local-model", "anthropic/claude-opus-4-6"],
      },
      models: {
        "anthropic/claude-sonnet-4-6": { alias: "Sonnet" },
        "lmstudio/my-local-model": { alias: "Local" },
        "anthropic/claude-opus-4-6": { alias: "Opus" },
      },
    },
  },
  models: {
    mode: "merge",
    providers: {
      lmstudio: {
        baseUrl: "http://127.0.0.1:1234/v1",
        apiKey: "lmstudio",
        api: "openai-responses",
        models: [
          {
            id: "my-local-model",
            name: "Local Model",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 196608,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
}
```

### 로컬 우선 + 호스팅 안전망

기본 및 폴백 순서를 바꿉니다; 동일한 providers 블록과 `models.mode: "merge"`를 유지하여 로컬 박스가 다운되었을 때 Sonnet 또는 Opus로 폴백할 수 있습니다.

### 지역 호스팅 / 데이터 라우팅

- 호스팅된 MiniMax/Kimi/GLM 변형도 지역 고정 엔드포인트(예: 미국 호스팅)를 통해 OpenRouter에 있습니다. 선택한 관할 구역에 트래픽을 유지하면서 Anthropic/OpenAI 폴백을 위해 `models.mode: "merge"`를 사용하려면 해당 지역 변형을 선택합니다.
- 로컬 전용은 가장 강력한 프라이버시 경로입니다; 호스팅된 지역 라우팅은 공급자 기능이 필요하지만 데이터 흐름을 제어하고 싶을 때 중간 방법입니다.

## 기타 OpenAI 호환 로컬 프록시

vLLM, LiteLLM, OAI-proxy, 또는 사용자 지정 게이트웨이는 OpenAI 스타일 `/v1` 엔드포인트를 노출하는 경우 작동합니다. 위의 provider 블록을 엔드포인트와 모델 ID로 교체합니다:

```json5
{
  models: {
    mode: "merge",
    providers: {
      local: {
        baseUrl: "http://127.0.0.1:8000/v1",
        apiKey: "sk-local",
        api: "openai-responses",
        models: [
          {
            id: "my-local-model",
            name: "Local Model",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 120000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
}
```

호스팅 모델이 폴백으로 사용 가능하도록 `models.mode: "merge"`를 유지합니다.

로컬/프록시 `/v1` 백엔드에 대한 동작 참고 사항:

- OpenClaw는 이것들을 기본 OpenAI 엔드포인트가 아닌 프록시 스타일 OpenAI 호환 경로로 처리합니다
- 기본 OpenAI 전용 요청 형성이 여기에는 적용되지 않습니다: `service_tier` 없음, Responses `store` 없음, OpenAI 추론 호환 페이로드 형성 없음, 프롬프트 캐시 힌트 없음
- 숨겨진 OpenClaw 어트리뷰션 헤더(`originator`, `version`, `User-Agent`)는 이 사용자 지정 프록시 URL에 주입되지 않습니다

더 엄격한 OpenAI 호환 백엔드에 대한 호환성 참고 사항:

- 일부 서버는 Chat Completions에서 구조화된 콘텐츠 파트 배열이 아닌 문자열 `messages[].content`만 허용합니다. 해당 엔드포인트에는 `models.providers.<provider>.models[].compat.requiresStringContent: true`를 설정합니다.
- 일부 소형 또는 더 엄격한 로컬 백엔드는 특히 도구 스키마가 포함된 경우 OpenClaw의 전체 에이전트 런타임 프롬프트 형태와 불안정합니다. 작은 직접 `/v1/chat/completions` 호출은 작동하지만 일반 OpenClaw 에이전트 턴에서 실패하는 경우 먼저 `models.providers.<provider>.models[].compat.supportsTools: false`를 시도합니다.

## 문제 해결

- 게이트웨이가 프록시에 도달할 수 있나요? `curl http://127.0.0.1:1234/v1/models`.
- LM Studio 모델이 언로드되었나요? 다시 로드합니다; 콜드 시작은 일반적인 "중단" 원인입니다.
- 컨텍스트 오류? `contextWindow`를 낮추거나 서버 제한을 올립니다.
- OpenAI 호환 서버가 `messages[].content ... expected a string`을 반환하나요? 해당 모델 항목에 `compat.requiresStringContent: true`를 추가합니다.
- 직접 소형 `/v1/chat/completions` 호출은 작동하지만 Gemma 또는 다른 로컬 모델에서 `openclaw infer model run`이 실패하나요? 먼저 `compat.supportsTools: false`로 도구 스키마를 비활성화한 다음 재테스트합니다.
- 안전: 로컬 모델은 프로바이더 측 필터를 건너뜁니다; 에이전트를 좁게 유지하고 압축을 켜서 프롬프트 인젝션 폭발 반경을 제한합니다.
