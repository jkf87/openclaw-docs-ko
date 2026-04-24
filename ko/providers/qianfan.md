---
summary: "OpenClaw에서 Qianfan의 통합 API로 다양한 모델에 접근하기"
read_when:
  - 다양한 LLM에 대해 단일 API 키를 사용하고 싶을 때
  - Baidu Qianfan 설정 가이드가 필요할 때
title: "Qianfan"
---

Qianfan은 Baidu의 MaaS 플랫폼으로, 단일 엔드포인트와 API 키 뒤에서 여러 모델로 요청을 라우팅하는 **통합 API**를 제공합니다.
OpenAI 호환 방식이므로 base URL만 변경하면 대부분의 OpenAI SDK가 그대로 동작합니다.

| 항목     | 값                                |
| -------- | --------------------------------- |
| Provider | `qianfan`                         |
| 인증     | `QIANFAN_API_KEY`                 |
| API      | OpenAI 호환                       |
| Base URL | `https://qianfan.baidubce.com/v2` |

## 시작하기

<Steps>
  <Step title="Baidu Cloud 계정 생성">
    [Qianfan 콘솔](https://console.bce.baidu.com/qianfan/ais/console/apiKey)에서 가입 또는 로그인하고, Qianfan API 접근이 활성화되어 있는지 확인하십시오.
  </Step>
  <Step title="API 키 발급">
    새 애플리케이션을 생성하거나 기존 애플리케이션을 선택한 뒤 API 키를 발급합니다. 키 형식은 `bce-v3/ALTAK-...`입니다.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice qianfan-api-key
    ```
  </Step>
  <Step title="모델 사용 가능 여부 확인">
    ```bash
    openclaw models list --provider qianfan
    ```
  </Step>
</Steps>

## 내장 카탈로그

| 모델 ref                             | 입력        | 컨텍스트 | 최대 출력  | 추론(Reasoning) | 비고       |
| ------------------------------------ | ----------- | -------- | ---------- | --------------- | ---------- |
| `qianfan/deepseek-v3.2`              | text        | 98,304   | 32,768     | Yes             | 기본 모델  |
| `qianfan/ernie-5.0-thinking-preview` | text, image | 119,000  | 64,000     | Yes             | 멀티모달   |

<Tip>
기본 번들 모델 ref는 `qianfan/deepseek-v3.2`입니다. 사용자 정의 base URL이나 모델 메타데이터가 필요한 경우에만 `models.providers.qianfan`을 재정의하면 됩니다.
</Tip>

## 설정 예시

```json5
{
  env: { QIANFAN_API_KEY: "bce-v3/ALTAK-..." },
  agents: {
    defaults: {
      model: { primary: "qianfan/deepseek-v3.2" },
      models: {
        "qianfan/deepseek-v3.2": { alias: "QIANFAN" },
      },
    },
  },
  models: {
    providers: {
      qianfan: {
        baseUrl: "https://qianfan.baidubce.com/v2",
        api: "openai-completions",
        models: [
          {
            id: "deepseek-v3.2",
            name: "DEEPSEEK V3.2",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 98304,
            maxTokens: 32768,
          },
          {
            id: "ernie-5.0-thinking-preview",
            name: "ERNIE-5.0-Thinking-Preview",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 119000,
            maxTokens: 64000,
          },
        ],
      },
    },
  },
}
```

<AccordionGroup>
  <Accordion title="Transport 및 호환성">
    Qianfan은 native OpenAI 요청 포맷이 아닌 OpenAI 호환 transport 경로를 통해 동작합니다. 이로 인해 표준 OpenAI SDK 기능은 동작하지만, 프로바이더 고유 파라미터는 전달되지 않을 수 있습니다.
  </Accordion>

  <Accordion title="카탈로그와 오버라이드">
    번들 카탈로그에는 현재 `deepseek-v3.2`와 `ernie-5.0-thinking-preview`가 포함됩니다. 사용자 정의 base URL이나 모델 메타데이터가 필요한 경우에만 `models.providers.qianfan`을 추가하거나 재정의하십시오.

    <Note>
    모델 ref는 `qianfan/` 접두어를 사용합니다 (예: `qianfan/deepseek-v3.2`).
    </Note>

  </Accordion>

  <Accordion title="문제 해결">
    - API 키가 `bce-v3/ALTAK-`로 시작하는지, Baidu Cloud 콘솔에서 Qianfan API 접근이 활성화되어 있는지 확인하십시오.
    - 모델이 목록에 나타나지 않으면, 계정에서 Qianfan 서비스가 활성화되어 있는지 확인하십시오.
    - 기본 base URL은 `https://qianfan.baidubce.com/v2`입니다. 사용자 정의 엔드포인트나 프록시를 사용할 때만 변경하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, failover 동작 선택.
  </Card>
  <Card title="구성 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    전체 OpenClaw 구성 레퍼런스.
  </Card>
  <Card title="Agent 설정" href="/concepts/agent" icon="robot">
    agent 기본값 및 모델 할당 구성.
  </Card>
  <Card title="Qianfan API 문서" href="https://cloud.baidu.com/doc/qianfan-api/s/3m7of64lb" icon="arrow-up-right-from-square">
    공식 Qianfan API 문서.
  </Card>
</CardGroup>
