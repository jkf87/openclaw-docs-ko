---
title: "LiteLLM"
summary: "통합 모델 액세스 및 비용 추적을 위해 LiteLLM Proxy를 통해 OpenClaw 실행"
read_when:
  - LiteLLM 프록시를 통해 OpenClaw를 라우팅하려는 경우
  - LiteLLM을 통해 비용 추적, 로깅, 모델 라우팅이 필요한 경우
---

# LiteLLM

[LiteLLM](https://litellm.ai)은 100개 이상의 모델 프로바이더에 통합 API를 제공하는 오픈소스 LLM 게이트웨이입니다. OpenClaw를 LiteLLM을 통해 라우팅하면 중앙화된 비용 추적, 로깅을 받고 OpenClaw 구성을 변경하지 않고 백엔드를 전환할 수 있습니다.

## LiteLLM을 OpenClaw와 사용하는 이유?

- **비용 추적** — 모든 모델에서 OpenClaw가 지출하는 정확한 금액 확인
- **모델 라우팅** — 구성 변경 없이 Claude, GPT-4, Gemini, Bedrock 간 전환
- **가상 키** — OpenClaw에 대한 지출 한도가 있는 키 생성
- **로깅** — 디버깅을 위한 전체 요청/응답 로그
- **폴백** — 기본 프로바이더가 다운된 경우 자동 장애 조치

## 빠른 시작

### 온보딩을 통해

```bash
openclaw onboard --auth-choice litellm-api-key
```

### 수동 설정

1. LiteLLM Proxy 시작:

```bash
pip install 'litellm[proxy]'
litellm --model claude-opus-4-6
```

2. OpenClaw를 LiteLLM에 연결:

```bash
export LITELLM_API_KEY="your-litellm-key"

openclaw
```

이것으로 끝입니다. OpenClaw가 이제 LiteLLM을 통해 라우팅됩니다.

## 구성

### 환경 변수

```bash
export LITELLM_API_KEY="sk-litellm-key"
```

### 구성 파일

```json5
{
  models: {
    providers: {
      litellm: {
        baseUrl: "http://localhost:4000",
        apiKey: "${LITELLM_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6",
            reasoning: true,
            input: ["text", "image"],
            contextWindow: 200000,
            maxTokens: 64000,
          },
          {
            id: "gpt-4o",
            name: "GPT-4o",
            reasoning: false,
            input: ["text", "image"],
            contextWindow: 128000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
  agents: {
    defaults: {
      model: { primary: "litellm/claude-opus-4-6" },
    },
  },
}
```

## 가상 키

지출 한도가 있는 OpenClaw 전용 키를 생성하십시오:

```bash
curl -X POST "http://localhost:4000/key/generate" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key_alias": "openclaw",
    "max_budget": 50.00,
    "budget_duration": "monthly"
  }'
```

생성된 키를 `LITELLM_API_KEY`로 사용하십시오.

## 모델 라우팅

LiteLLM은 모델 요청을 다른 백엔드로 라우팅할 수 있습니다. LiteLLM `config.yaml`에서 구성하십시오:

```yaml
model_list:
  - model_name: claude-opus-4-6
    litellm_params:
      model: claude-opus-4-6
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

OpenClaw는 계속 `claude-opus-4-6`을 요청합니다 — LiteLLM이 라우팅을 처리합니다.

## 사용량 확인

LiteLLM의 대시보드 또는 API를 확인하십시오:

```bash
# 키 정보
curl "http://localhost:4000/key/info" \
  -H "Authorization: Bearer sk-litellm-key"

# 지출 로그
curl "http://localhost:4000/spend/logs" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

## 참고 사항

- LiteLLM은 기본적으로 `http://localhost:4000`에서 실행됩니다
- OpenClaw는 LiteLLM의 프록시 스타일 OpenAI 호환 `/v1` 엔드포인트를 통해 연결합니다
- LiteLLM을 통해 네이티브 OpenAI 전용 요청 형성이 적용되지 않습니다: `service_tier`, Responses `store`, 프롬프트 캐시 힌트, OpenAI 추론 호환 페이로드 형성이 없습니다
- 히든 OpenClaw 귀속 헤더(`originator`, `version`, `User-Agent`)는 커스텀 LiteLLM 기본 URL에 주입되지 않습니다

## 참조

- [LiteLLM 문서](https://docs.litellm.ai)
- [모델 프로바이더](/concepts/model-providers)
