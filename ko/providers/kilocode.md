---
summary: "OpenClaw에서 Kilo Gateway의 통합 API로 다양한 모델에 접근하기"
title: "Kilocode"
read_when:
  - 여러 LLM에 대해 단일 API 키를 사용하고 싶을 때
  - OpenClaw에서 Kilo Gateway를 통해 모델을 실행하고 싶을 때
---

# Kilo Gateway

Kilo Gateway는 단일 엔드포인트와 API 키 뒷단에서 여러 모델로 요청을 라우팅하는
**통합 API**를 제공합니다. OpenAI 호환이므로 대부분의 OpenAI SDK에서 base URL만
교체하면 동작합니다.

| 속성     | 값                                 |
| -------- | ---------------------------------- |
| Provider | `kilocode`                         |
| Auth     | `KILOCODE_API_KEY`                 |
| API      | OpenAI 호환                        |
| Base URL | `https://api.kilo.ai/api/gateway/` |

## 시작하기

<Steps>
  <Step title="계정 생성">
    [app.kilo.ai](https://app.kilo.ai)에 접속해 로그인하거나 계정을 생성한 뒤, API Keys로 이동해 새 키를 발급하세요.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice kilocode-api-key
    ```

    또는 환경 변수를 직접 설정하세요.

    ```bash
    export KILOCODE_API_KEY="<your-kilocode-api-key>" # pragma: allowlist secret
    ```

  </Step>
  <Step title="모델 사용 가능 여부 확인">
    ```bash
    openclaw models list --provider kilocode
    ```
  </Step>
</Steps>

## 기본 모델

기본 모델은 `kilocode/kilo/auto`이며, Kilo Gateway가 관리하는 프로바이더 소유의
스마트 라우팅 모델입니다.

<Note>
OpenClaw는 `kilocode/kilo/auto`를 안정적인 기본 레퍼런스로 취급하지만, 해당
라우트에 대한 소스 기반의 작업-업스트림 모델 매핑을 공개하지 않습니다.
`kilocode/kilo/auto` 뒷단의 정확한 업스트림 라우팅은 OpenClaw에 하드코딩되어
있지 않으며 Kilo Gateway가 소유합니다.
</Note>

## 내장 카탈로그

OpenClaw는 시작 시 Kilo Gateway에서 사용 가능한 모델을 동적으로 검색합니다.
계정에서 사용 가능한 모델의 전체 목록을 확인하려면 `/models kilocode`를 사용하세요.

게이트웨이에서 사용 가능한 모든 모델은 `kilocode/` 접두사를 사용해서 쓸 수 있습니다.

| 모델 레퍼런스                          | 비고                                     |
| -------------------------------------- | ---------------------------------------- |
| `kilocode/kilo/auto`                   | 기본 — 스마트 라우팅                     |
| `kilocode/anthropic/claude-sonnet-4`   | Kilo를 통한 Anthropic                    |
| `kilocode/openai/gpt-5.5`              | Kilo를 통한 OpenAI                       |
| `kilocode/google/gemini-3-pro-preview` | Kilo를 통한 Google                       |
| ...그리고 더 많은 모델들               | 전체 목록은 `/models kilocode`로 확인    |

<Tip>
시작 시 OpenClaw는 `GET https://api.kilo.ai/api/gateway/models`를 쿼리하고
검색된 모델을 정적 폴백 카탈로그보다 앞쪽으로 병합합니다. 번들 폴백에는 항상
`kilocode/kilo/auto` (`Kilo Auto`)가 포함되며 `input: ["text", "image"]`,
`reasoning: true`, `contextWindow: 1000000`, `maxTokens: 128000`을 갖습니다.
</Tip>

## 설정 예시

```json5
{
  env: { KILOCODE_API_KEY: "<your-kilocode-api-key>" }, // pragma: allowlist secret
  agents: {
    defaults: {
      model: { primary: "kilocode/kilo/auto" },
    },
  },
}
```

<AccordionGroup>
  <Accordion title="전송 및 호환성">
    Kilo Gateway는 소스에서 OpenRouter 호환으로 문서화되어 있으므로, 네이티브
    OpenAI 요청 정형화가 아닌 프록시 스타일 OpenAI 호환 경로에 머무릅니다.

    - Gemini 기반 Kilo 레퍼런스는 proxy-Gemini 경로에 남아 있으므로, OpenClaw는
      네이티브 Gemini 리플레이 검증이나 부트스트랩 재작성을 활성화하지 않은 채
      Gemini 사고(thought) 서명 정제를 유지합니다.
    - Kilo Gateway는 내부적으로 API 키를 사용한 Bearer 토큰을 이용합니다.

  </Accordion>

  <Accordion title="스트림 래퍼와 Reasoning">
    Kilo의 공유 스트림 래퍼는 프로바이더 앱 헤더를 추가하고 지원되는 구체적인
    모델 레퍼런스에 대해 프록시 reasoning 페이로드를 정규화합니다.

    <Warning>
    `kilocode/kilo/auto` 및 프록시 reasoning을 지원하지 않는 힌트에서는
    reasoning 주입을 건너뜁니다. reasoning 지원이 필요하다면
    `kilocode/anthropic/claude-sonnet-4` 같은 구체적인 모델 레퍼런스를 사용하세요.
    </Warning>

  </Accordion>

  <Accordion title="트러블슈팅">
    - 시작 시 모델 검색이 실패하면 OpenClaw는 `kilocode/kilo/auto`를 포함한 번들 정적 카탈로그로 폴백합니다.
    - API 키가 유효하고 Kilo 계정에서 원하는 모델이 활성화되어 있는지 확인하세요.
    - 게이트웨이가 데몬으로 실행될 때는 해당 프로세스에서 `KILOCODE_API_KEY`를 사용할 수 있는지 확인하세요(예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 선택, 모델 레퍼런스, 페일오버 동작.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    전체 OpenClaw 설정 레퍼런스.
  </Card>
  <Card title="Kilo Gateway" href="https://app.kilo.ai" icon="arrow-up-right-from-square">
    Kilo Gateway 대시보드, API 키, 계정 관리.
  </Card>
</CardGroup>
