---
title: "Chutes"
description: "Chutes 설정 (OAuth 또는 API 키, 모델 검색, 별칭)"
---

# Chutes

[Chutes](https://chutes.ai)는 OpenAI 호환 API를 통해 오픈소스 모델 카탈로그를 제공합니다. OpenClaw는 번들 `chutes` 프로바이더에 대해 브라우저 OAuth와 직접 API 키 인증을 모두 지원합니다.

- 프로바이더: `chutes`
- API: OpenAI 호환
- 기본 URL: `https://llm.chutes.ai/v1`
- 인증:
  - `openclaw onboard --auth-choice chutes`를 통한 OAuth
  - `openclaw onboard --auth-choice chutes-api-key`를 통한 API 키
  - 런타임 환경 변수: `CHUTES_API_KEY`, `CHUTES_OAUTH_TOKEN`

## 빠른 시작

### OAuth

```bash
openclaw onboard --auth-choice chutes
```

OpenClaw는 로컬에서 브라우저 흐름을 시작하거나, 원격/헤드리스 호스트에서 URL + 리디렉션 붙여넣기 흐름을 표시합니다. OAuth 토큰은 OpenClaw 인증 프로필을 통해 자동으로 갱신됩니다.

선택적 OAuth 재정의:

- `CHUTES_CLIENT_ID`
- `CHUTES_CLIENT_SECRET`
- `CHUTES_OAUTH_REDIRECT_URI`
- `CHUTES_OAUTH_SCOPES`

### API 키

```bash
openclaw onboard --auth-choice chutes-api-key
```

[chutes.ai/settings/api-keys](https://chutes.ai/settings/api-keys)에서 키를 발급받으십시오.

두 인증 경로 모두 번들 Chutes 카탈로그를 등록하고 기본 모델을 `chutes/zai-org/GLM-4.7-TEE`로 설정합니다.

## 검색 동작

Chutes 인증이 사용 가능하면, OpenClaw는 해당 자격 증명으로 Chutes 카탈로그를 쿼리하고 검색된 모델을 사용합니다. 검색이 실패하면 OpenClaw는 온보딩 및 시작이 계속 작동하도록 번들 정적 카탈로그로 폴백합니다.

## 기본 별칭

OpenClaw는 번들 Chutes 카탈로그에 대해 세 가지 편의 별칭도 등록합니다:

- `chutes-fast` -> `chutes/zai-org/GLM-4.7-FP8`
- `chutes-pro` -> `chutes/deepseek-ai/DeepSeek-V3.2-TEE`
- `chutes-vision` -> `chutes/chutesai/Mistral-Small-3.2-24B-Instruct-2506`

## 내장 스타터 카탈로그

번들 폴백 카탈로그에는 다음과 같은 현재 Chutes 참조가 포함됩니다:

- `chutes/zai-org/GLM-4.7-TEE`
- `chutes/zai-org/GLM-5-TEE`
- `chutes/deepseek-ai/DeepSeek-V3.2-TEE`
- `chutes/deepseek-ai/DeepSeek-R1-0528-TEE`
- `chutes/moonshotai/Kimi-K2.5-TEE`
- `chutes/chutesai/Mistral-Small-3.2-24B-Instruct-2506`
- `chutes/Qwen/Qwen3-Coder-Next-TEE`
- `chutes/openai/gpt-oss-120b-TEE`

## 구성 예시

```json5
{
  agents: {
    defaults: {
      model: { primary: "chutes/zai-org/GLM-4.7-TEE" },
      models: {
        "chutes/zai-org/GLM-4.7-TEE": { alias: "Chutes GLM 4.7" },
        "chutes/deepseek-ai/DeepSeek-V3.2-TEE": { alias: "Chutes DeepSeek V3.2" },
      },
    },
  },
}
```

## 참고 사항

- OAuth 도움말 및 리디렉션 앱 요구 사항: [Chutes OAuth 문서](https://chutes.ai/docs/sign-in-with-chutes/overview)
- API 키와 OAuth 검색 모두 동일한 `chutes` 프로바이더 id를 사용합니다.
- Chutes 모델은 `chutes/&lt;model-id&gt;`로 등록됩니다.
