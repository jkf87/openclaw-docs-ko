---
title: "Vercel AI Gateway"
summary: "Vercel AI Gateway 설정 (인증 + 모델 선택)"
read_when:
  - OpenClaw에서 Vercel AI Gateway를 사용하려는 경우
  - API 키 환경 변수 또는 CLI 인증 선택이 필요한 경우
---

# Vercel AI Gateway

[Vercel AI Gateway](https://vercel.com/ai-gateway)는 단일 엔드포인트를 통해 수백 개의 모델에 접근할 수 있는 통합 API를 제공합니다.

- 프로바이더: `vercel-ai-gateway`
- 인증: `AI_GATEWAY_API_KEY`
- API: Anthropic Messages 호환
- OpenClaw는 게이트웨이 `/v1/models` 카탈로그를 자동으로 발견하므로 `/models vercel-ai-gateway`에는 `vercel-ai-gateway/openai/gpt-5.4`와 같은 현재 모델 참조가 포함됩니다.

## 빠른 시작

1. API 키 설정 (권장: 게이트웨이용으로 저장):

```bash
openclaw onboard --auth-choice ai-gateway-api-key
```

2. 기본 모델 설정:

```json5
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4.6" },
    },
  },
}
```

## 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY"
```

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우 해당 프로세스에서 `AI_GATEWAY_API_KEY`를 사용할 수 있어야 합니다 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).

## 모델 ID 단축 표기

OpenClaw는 Vercel Claude 단축 모델 참조를 허용하고 런타임에 정규화합니다:

- `vercel-ai-gateway/claude-opus-4.6` -> `vercel-ai-gateway/anthropic/claude-opus-4.6`
- `vercel-ai-gateway/opus-4.6` -> `vercel-ai-gateway/anthropic/claude-opus-4-6`
