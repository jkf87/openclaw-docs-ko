---
title: "Kilo Gateway"
description: "OpenClaw에서 많은 모델에 액세스하기 위해 Kilo Gateway의 통합 API 사용"
---

# Kilo Gateway

Kilo Gateway는 단일 엔드포인트와 API 키 뒤에서 많은 모델에 요청을 라우팅하는 **통합 API**를 제공합니다. OpenAI 호환이므로 대부분의 OpenAI SDK는 기본 URL을 전환하면 작동합니다.

## API 키 발급

1. [app.kilo.ai](https://app.kilo.ai)로 이동하십시오
2. 로그인하거나 계정을 생성하십시오
3. API Keys로 이동하여 새 키를 생성하십시오

## CLI 설정

```bash
openclaw onboard --auth-choice kilocode-api-key
```

또는 환경 변수 설정:

```bash
export KILOCODE_API_KEY="&lt;your-kilocode-api-key&gt;" # pragma: allowlist secret
```

## 구성 스니펫

```json5
{
  env: { KILOCODE_API_KEY: "&lt;your-kilocode-api-key&gt;" }, // pragma: allowlist secret
  agents: {
    defaults: {
      model: { primary: "kilocode/kilo/auto" },
    },
  },
}
```

## 기본 모델

기본 모델은 Kilo Gateway에서 관리하는 프로바이더 소유의 스마트 라우팅 모델인 `kilocode/kilo/auto`입니다.

OpenClaw는 `kilocode/kilo/auto`를 안정적인 기본 참조로 처리하지만, 해당 경로에 대한 소스 기반 태스크-업스트림-모델 매핑을 게시하지 않습니다.

## 사용 가능한 모델

OpenClaw는 시작 시 Kilo Gateway에서 사용 가능한 모델을 동적으로 검색합니다. `/models kilocode`를 사용하여 계정에서 사용 가능한 전체 모델 목록을 확인하십시오.

게이트웨이에서 사용 가능한 모든 모델은 `kilocode/` 접두사와 함께 사용할 수 있습니다:

```
kilocode/kilo/auto              (기본값 - 스마트 라우팅)
kilocode/anthropic/claude-sonnet-4
kilocode/openai/gpt-5.4
kilocode/google/gemini-3-pro-preview
...더 많이
```

## 참고 사항

- 모델 참조는 `kilocode/&lt;model-id&gt;` 형식입니다 (예: `kilocode/anthropic/claude-sonnet-4`).
- 기본 모델: `kilocode/kilo/auto`
- 기본 URL: `https://api.kilo.ai/api/gateway/`
- 번들 폴백 카탈로그는 항상 `input: ["text", "image"]`, `reasoning: true`, `contextWindow: 1000000`, `maxTokens: 128000`과 함께 `kilocode/kilo/auto` (`Kilo Auto`)를 포함합니다
- 시작 시 OpenClaw는 `GET https://api.kilo.ai/api/gateway/models`를 시도하고 검색된 모델을 정적 폴백 카탈로그 앞에 병합합니다
- `kilocode/kilo/auto` 뒤의 정확한 업스트림 라우팅은 Kilo Gateway 소유이며 OpenClaw에 하드코딩되지 않습니다
- Kilo Gateway는 소스에서 OpenRouter 호환으로 문서화되어 있으므로, 네이티브 OpenAI 요청 형성이 아닌 프록시 스타일 OpenAI 호환 경로에서 유지됩니다
- Gemini 기반 Kilo 참조는 프록시-Gemini 경로를 유지하므로 OpenClaw는 네이티브 Gemini 재생 검증이나 부트스트랩 재작성을 활성화하지 않고 Gemini 사고 서명 정리를 유지합니다.
- Kilo의 공유 스트림 래퍼는 지원되는 구체적인 모델 참조에 대해 프로바이더 앱 헤더를 추가하고 프록시 추론 페이로드를 정규화합니다. `kilocode/kilo/auto` 및 다른 프록시 추론 미지원 힌트는 해당 추론 주입을 건너뜁니다.
- 더 많은 모델/프로바이더 옵션은 [/concepts/model-providers](/concepts/model-providers)를 참조하십시오.
- Kilo Gateway는 내부적으로 API 키와 함께 Bearer 토큰을 사용합니다.
