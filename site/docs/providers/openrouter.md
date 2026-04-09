---
title: "OpenRouter"
description: "OpenClaw에서 OpenRouter의 통합 API로 다양한 모델 접근"
---

# OpenRouter

OpenRouter는 단일 엔드포인트와 API 키 뒤에서 많은 모델에 요청을 라우팅하는 **통합 API**를 제공합니다. OpenAI 호환이므로 대부분의 OpenAI SDK는 기본 URL을 변경하면 작동합니다.

## CLI 설정

```bash
openclaw onboard --auth-choice openrouter-api-key
```

## 구성 스니펫

```json5
{
  env: { OPENROUTER_API_KEY: "sk-or-..." },
  agents: {
    defaults: {
      model: { primary: "openrouter/auto" },
    },
  },
}
```

## 참고 사항

- 모델 참조는 `openrouter/&lt;provider&gt;/&lt;model&gt;` 형식입니다.
- 온보딩 기본값은 `openrouter/auto`입니다. 나중에 `openclaw models set openrouter/&lt;provider&gt;/&lt;model&gt;`로 구체적인 모델로 전환하십시오.
- 더 많은 모델/프로바이더 옵션은 [/concepts/model-providers](/concepts/model-providers)를 참조하십시오.
- OpenRouter는 내부적으로 API 키와 함께 Bearer 토큰을 사용합니다.
- 실제 OpenRouter 요청(`https://openrouter.ai/api/v1`)에서 OpenClaw는 OpenRouter의 문서화된 앱 귀속 헤더도 추가합니다: `HTTP-Referer: https://openclaw.ai`, `X-OpenRouter-Title: OpenClaw`, `X-OpenRouter-Categories: cli-agent`.
- 검증된 OpenRouter 라우트에서 Anthropic 모델 참조는 시스템/개발자 프롬프트 블록에서 더 나은 프롬프트 캐시 재사용을 위해 OpenClaw가 사용하는 OpenRouter 특화 Anthropic `cache_control` 마커도 유지합니다.
- OpenRouter 프로바이더를 다른 프록시/기본 URL로 재지정하면 OpenClaw는 해당 OpenRouter 특화 헤더나 Anthropic 캐시 마커를 주입하지 않습니다.
- OpenRouter는 여전히 프록시 스타일 OpenAI 호환 경로를 통해 실행되므로, `serviceTier`, Responses `store`, OpenAI 추론 호환 페이로드, 프롬프트 캐시 힌트와 같은 네이티브 OpenAI 전용 요청 형성은 전달되지 않습니다.
- Gemini 기반 OpenRouter 참조는 프록시-Gemini 경로에 유지됩니다: OpenClaw는 거기서 Gemini 사고 서명 위생을 유지하지만, 네이티브 Gemini 재생 검증이나 부트스트랩 재작성은 활성화하지 않습니다.
- 지원되는 비`auto` 라우트에서 OpenClaw는 선택된 사고 수준을 OpenRouter 프록시 추론 페이로드에 매핑합니다. 지원되지 않는 모델 힌트와 `openrouter/auto`는 해당 추론 주입을 건너뜁니다.
- 모델 파라미터 아래에 OpenRouter 프로바이더 라우팅을 전달하면 OpenClaw는 공유 스트림 래퍼가 실행되기 전에 OpenRouter 라우팅 메타데이터로 전달합니다.
