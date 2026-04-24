---
summary: "OpenClaw에서 Z.AI(GLM 모델)를 사용하는 방법"
read_when:
  - OpenClaw에서 Z.AI / GLM 모델을 사용하고자 할 때
  - 간단한 ZAI_API_KEY 설정이 필요할 때
title: "Z.AI"
---

Z.AI는 **GLM** 모델을 위한 API 플랫폼입니다. GLM에 대한 REST API를 제공하며 API 키를 통한
인증을 사용합니다. Z.AI 콘솔에서 API 키를 생성하세요. OpenClaw는 Z.AI API 키와 함께
`zai` 프로바이더를 사용합니다.

- Provider: `zai`
- 인증: `ZAI_API_KEY`
- API: Z.AI Chat Completions (Bearer 인증)

## 시작하기

<Tabs>
  <Tab title="엔드포인트 자동 감지">
    **권장 대상:** 대부분의 사용자. OpenClaw가 키로부터 일치하는 Z.AI 엔드포인트를 감지하여 올바른 base URL을 자동으로 적용합니다.

    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice zai-api-key
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          env: { ZAI_API_KEY: "sk-..." },
          agents: { defaults: { model: { primary: "zai/glm-5.1" } } },
        }
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider zai
        ```
      </Step>
    </Steps>

  </Tab>

  <Tab title="명시적 리전 엔드포인트">
    **권장 대상:** 특정 Coding Plan이나 일반 API 사용면을 강제 지정하고자 하는 사용자.

    <Steps>
      <Step title="적절한 온보딩 선택지 고르기">
        ```bash
        # Coding Plan Global (Coding Plan 사용자 권장)
        openclaw onboard --auth-choice zai-coding-global

        # Coding Plan CN (중국 리전)
        openclaw onboard --auth-choice zai-coding-cn

        # General API
        openclaw onboard --auth-choice zai-global

        # General API CN (중국 리전)
        openclaw onboard --auth-choice zai-cn
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          env: { ZAI_API_KEY: "sk-..." },
          agents: { defaults: { model: { primary: "zai/glm-5.1" } } },
        }
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider zai
        ```
      </Step>
    </Steps>

  </Tab>
</Tabs>

## 내장 카탈로그

OpenClaw는 번들된 `zai` 프로바이더에 현재 다음 모델들을 제공합니다.

| 모델 레퍼런스        | 비고          |
| -------------------- | ------------- |
| `zai/glm-5.1`        | 기본 모델     |
| `zai/glm-5`          |               |
| `zai/glm-5-turbo`    |               |
| `zai/glm-5v-turbo`   |               |
| `zai/glm-4.7`        |               |
| `zai/glm-4.7-flash`  |               |
| `zai/glm-4.7-flashx` |               |
| `zai/glm-4.6`        |               |
| `zai/glm-4.6v`       |               |
| `zai/glm-4.5`        |               |
| `zai/glm-4.5-air`    |               |
| `zai/glm-4.5-flash`  |               |
| `zai/glm-4.5v`       |               |

<Tip>
GLM 모델은 `zai/<model>` 형태로 제공됩니다(예: `zai/glm-5`). 번들된 기본 모델 레퍼런스는 `zai/glm-5.1`입니다.
</Tip>

## 고급 설정

<AccordionGroup>
  <Accordion title="알 수 없는 GLM-5 모델의 전방 해석(forward-resolving)">
    알 수 없는 `glm-5*` ID도 현재 GLM-5 패밀리 형태와 일치하는 경우
    번들 프로바이더 경로에서 `glm-4.7` 템플릿으로부터 프로바이더 소유 메타데이터를
    합성하여 전방 해석이 이루어집니다.
  </Accordion>

  <Accordion title="도구 호출 스트리밍">
    `tool_stream`은 Z.AI 도구 호출 스트리밍을 위해 기본적으로 활성화되어 있습니다. 비활성화하려면 다음과 같이 설정하세요.

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "zai/<model>": {
              params: { tool_stream: false },
            },
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="이미지 이해">
    번들된 Z.AI 플러그인은 이미지 이해 기능을 등록합니다.

    | 속성          | 값          |
    | ------------- | ----------- |
    | 모델          | `glm-4.6v`  |

    이미지 이해는 설정된 Z.AI 인증으로부터 자동 해석되므로
    추가 설정이 필요하지 않습니다.

  </Accordion>

  <Accordion title="인증 세부 사항">
    - Z.AI는 API 키로 Bearer 인증을 사용합니다.
    - `zai-api-key` 온보딩 선택지는 키 prefix로부터 일치하는 Z.AI 엔드포인트를 자동 감지합니다.
    - 특정 API 사용면을 강제 지정하려는 경우 명시적 리전 선택지(`zai-coding-global`, `zai-coding-cn`, `zai-global`, `zai-cn`)를 사용하세요.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="GLM 모델 패밀리" href="/providers/glm" icon="microchip">
    GLM 모델 패밀리 개요.
  </Card>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 레퍼런스, 페일오버 동작 선택 방법.
  </Card>
</CardGroup>
