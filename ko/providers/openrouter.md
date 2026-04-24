---
summary: "OpenClaw에서 OpenRouter의 통합 API로 다양한 모델에 접근하기"
read_when:
  - 여러 LLM을 하나의 API 키로 사용하고자 할 때
  - OpenClaw에서 OpenRouter를 통해 모델을 실행하고자 할 때
  - 이미지 생성에 OpenRouter를 사용하고자 할 때
title: "OpenRouter"
---

OpenRouter는 하나의 엔드포인트와 API 키 뒤에서 다양한 모델로 요청을 라우팅하는 **통합 API**를
제공합니다. OpenAI와 호환되므로 대부분의 OpenAI SDK는 base URL만 변경하면 동작합니다.

## 시작하기

<Steps>
  <Step title="API 키 발급">
    [openrouter.ai/keys](https://openrouter.ai/keys)에서 API 키를 생성하세요.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice openrouter-api-key
    ```
  </Step>
  <Step title="(선택) 특정 모델로 전환">
    온보딩 기본값은 `openrouter/auto`입니다. 나중에 구체적인 모델을 선택하세요.

    ```bash
    openclaw models set openrouter/<provider>/<model>
    ```

  </Step>
</Steps>

## 설정 예시

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

## 모델 레퍼런스

<Note>
모델 레퍼런스는 `openrouter/<provider>/<model>` 패턴을 따릅니다. 사용 가능한
프로바이더와 모델의 전체 목록은 [/concepts/model-providers/](/concepts/model-providers)를 참고하세요.
</Note>

번들된 폴백 예시:

| 모델 레퍼런스                        | 비고                          |
| ------------------------------------ | ----------------------------- |
| `openrouter/auto`                    | OpenRouter 자동 라우팅        |
| `openrouter/moonshotai/kimi-k2.6`    | MoonshotAI를 통한 Kimi K2.6   |
| `openrouter/openrouter/healer-alpha` | OpenRouter Healer Alpha 라우트 |
| `openrouter/openrouter/hunter-alpha` | OpenRouter Hunter Alpha 라우트 |

## 이미지 생성

OpenRouter는 `image_generate` 도구의 백엔드로도 사용할 수 있습니다. `agents.defaults.imageGenerationModel` 아래에 OpenRouter 이미지 모델을 사용하세요.

```json5
{
  env: { OPENROUTER_API_KEY: "sk-or-..." },
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "openrouter/google/gemini-3.1-flash-image-preview",
      },
    },
  },
}
```

OpenClaw는 이미지 요청을 OpenRouter의 chat completions 이미지 API로 `modalities: ["image", "text"]`와 함께 전송합니다. Gemini 이미지 모델은 OpenRouter의 `image_config`를 통해 지원되는 `aspectRatio`와 `resolution` 힌트를 받습니다.

## 인증 및 헤더

OpenRouter는 내부적으로 API 키와 함께 Bearer 토큰을 사용합니다.

실제 OpenRouter 요청(`https://openrouter.ai/api/v1`) 시, OpenClaw는
OpenRouter의 문서화된 앱 귀속(attribution) 헤더도 추가합니다.

| 헤더                      | 값                    |
| ------------------------- | --------------------- |
| `HTTP-Referer`            | `https://openclaw.ai` |
| `X-OpenRouter-Title`      | `OpenClaw`            |
| `X-OpenRouter-Categories` | `cli-agent`           |

<Warning>
OpenRouter 프로바이더를 다른 프록시나 base URL로 재지정하는 경우, OpenClaw는
OpenRouter 전용 헤더나 Anthropic 캐시 마커를 주입하지 **않습니다**.
</Warning>

## 고급 설정

<AccordionGroup>
  <Accordion title="Anthropic 캐시 마커">
    검증된 OpenRouter 라우트에서는 Anthropic 모델 레퍼런스가
    OpenClaw가 시스템/개발자 프롬프트 블록의 프롬프트 캐시 재사용을 개선하기 위해
    사용하는 OpenRouter 전용 Anthropic `cache_control` 마커를 유지합니다.
  </Accordion>

  <Accordion title="Thinking / reasoning 주입">
    지원되는 non-`auto` 라우트에서 OpenClaw는 선택된 thinking 수준을
    OpenRouter 프록시 reasoning 페이로드로 매핑합니다. 지원되지 않는 모델 힌트와
    `openrouter/auto`는 이 reasoning 주입을 건너뜁니다.
  </Accordion>

  <Accordion title="OpenAI 전용 요청 쉐이핑">
    OpenRouter는 여전히 프록시 방식의 OpenAI 호환 경로를 통해 실행되므로,
    `serviceTier`, Responses `store`, OpenAI reasoning-compat 페이로드,
    prompt-cache 힌트와 같은 OpenAI 전용 요청 쉐이핑은 전달되지 않습니다.
  </Accordion>

  <Accordion title="Gemini 기반 라우트">
    Gemini 기반 OpenRouter 레퍼런스는 프록시-Gemini 경로에 머무릅니다. OpenClaw는
    그곳에서 Gemini thought-signature 정화를 유지하지만, 네이티브 Gemini
    재생 검증이나 부트스트랩 재작성은 활성화하지 않습니다.
  </Accordion>

  <Accordion title="프로바이더 라우팅 메타데이터">
    모델 파라미터에 OpenRouter 프로바이더 라우팅을 전달하면, OpenClaw는 공통 스트림
    래퍼가 실행되기 전에 이를 OpenRouter 라우팅 메타데이터로 전달합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 레퍼런스, 페일오버 동작 선택 방법.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    에이전트, 모델, 프로바이더의 전체 설정 레퍼런스.
  </Card>
</CardGroup>
