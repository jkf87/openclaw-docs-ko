---
summary: "GLM 모델 계열 개요 + OpenClaw에서 사용하는 방법"
read_when:
  - OpenClaw에서 GLM 모델을 사용하고 싶을 때
  - 모델 네이밍 규칙과 설정이 필요할 때
title: "GLM (Zhipu)"
---

# GLM 모델

GLM은 Z.AI 플랫폼을 통해 제공되는 **모델 계열**(회사가 아님)입니다. OpenClaw에서 GLM
모델은 `zai` 프로바이더와 `zai/glm-5` 같은 모델 ID를 통해 접근합니다.

## 시작하기

<Steps>
  <Step title="인증 경로 선택 및 온보딩 실행">
    Z.AI 플랜과 지역에 맞는 온보딩 선택지를 고르세요.

    | 인증 선택지 | 적합한 경우 |
    | ----------- | ----------- |
    | `zai-api-key` | 엔드포인트 자동 감지를 사용하는 범용 API 키 설정 |
    | `zai-coding-global` | Coding Plan 사용자 (글로벌) |
    | `zai-coding-cn` | Coding Plan 사용자 (중국 지역) |
    | `zai-global` | 일반 API (글로벌) |
    | `zai-cn` | 일반 API (중국 지역) |

    ```bash
    # 예시: 범용 자동 감지
    openclaw onboard --auth-choice zai-api-key

    # 예시: Coding Plan 글로벌
    openclaw onboard --auth-choice zai-coding-global
    ```

  </Step>
  <Step title="GLM을 기본 모델로 설정">
    ```bash
    openclaw config set agents.defaults.model.primary "zai/glm-5.1"
    ```
  </Step>
  <Step title="모델이 사용 가능한지 확인">
    ```bash
    openclaw models list --provider zai
    ```
  </Step>
</Steps>

## 설정 예시

```json5
{
  env: { ZAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "zai/glm-5.1" } } },
}
```

<Tip>
`zai-api-key`를 사용하면 OpenClaw가 키에서 일치하는 Z.AI 엔드포인트를 감지하고
올바른 base URL을 자동으로 적용합니다. 특정 Coding Plan 또는 일반 API 표면을
강제하고 싶을 때는 명시적인 지역 선택지를 사용하세요.
</Tip>

## 내장 카탈로그

OpenClaw는 현재 번들 `zai` 프로바이더에 다음 GLM ref들을 시드합니다.

| 모델            | 모델             |
| --------------- | ---------------- |
| `glm-5.1`       | `glm-4.7`        |
| `glm-5`         | `glm-4.7-flash`  |
| `glm-5-turbo`   | `glm-4.7-flashx` |
| `glm-5v-turbo`  | `glm-4.6`        |
| `glm-4.5`       | `glm-4.6v`       |
| `glm-4.5-air`   |                  |
| `glm-4.5-flash` |                  |
| `glm-4.5v`      |                  |

<Note>
기본 번들 모델 ref는 `zai/glm-5.1`입니다. GLM 버전과 가용성은 변경될 수 있으니,
최신 정보는 Z.AI 문서를 확인하세요.
</Note>

## 고급 설정

<AccordionGroup>
  <Accordion title="엔드포인트 자동 감지">
    `zai-api-key` 인증 선택지를 사용하면, OpenClaw는 키 형식을 분석하여 올바른
    Z.AI base URL을 결정합니다. 명시적 지역 선택지
    (`zai-coding-global`, `zai-coding-cn`, `zai-global`, `zai-cn`)는 자동 감지를
    재정의하고 엔드포인트를 직접 고정합니다.
  </Accordion>

  <Accordion title="프로바이더 세부 정보">
    GLM 모델은 `zai` 런타임 프로바이더에서 서빙됩니다. 전체 프로바이더 설정,
    지역 엔드포인트, 추가 기능은
    [Z.AI 프로바이더 문서](/providers/zai)를 참고하세요.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Z.AI 프로바이더" href="/providers/zai" icon="server">
    전체 Z.AI 프로바이더 설정과 지역 엔드포인트.
  </Card>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택.
  </Card>
</CardGroup>
