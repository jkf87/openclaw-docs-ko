---
summary: "OpenClaw에서 Synthetic의 Anthropic 호환 API 사용하기"
read_when:
  - Synthetic을 모델 프로바이더로 사용하고 싶을 때
  - Synthetic API 키 또는 base URL 설정이 필요할 때
title: "Synthetic"
---

[Synthetic](https://synthetic.new)은 Anthropic 호환 엔드포인트를 제공합니다.
OpenClaw는 이를 `synthetic` 프로바이더로 등록하며, Anthropic Messages API를
사용합니다.

| 속성      | 값                                    |
| --------- | ------------------------------------- |
| Provider  | `synthetic`                           |
| Auth      | `SYNTHETIC_API_KEY`                   |
| API       | Anthropic Messages                    |
| Base URL  | `https://api.synthetic.new/anthropic` |

## 시작하기

<Steps>
  <Step title="API 키 발급">
    Synthetic 계정에서 `SYNTHETIC_API_KEY`를 발급받거나, 온보딩 마법사가
    키를 입력하도록 안내하게 하세요.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice synthetic-api-key
    ```
  </Step>
  <Step title="기본 모델 확인">
    온보딩 후 기본 모델은 다음과 같이 설정됩니다.
    ```
    synthetic/hf:MiniMaxAI/MiniMax-M2.5
    ```
  </Step>
</Steps>

<Warning>
OpenClaw의 Anthropic 클라이언트는 base URL에 `/v1`을 자동으로 덧붙이므로
`https://api.synthetic.new/anthropic`을 사용하세요(`/anthropic/v1` 아님).
Synthetic이 base URL을 변경한 경우에는 `models.providers.synthetic.baseUrl`을
오버라이드하세요.
</Warning>

## 설정 예시

```json5
{
  env: { SYNTHETIC_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "synthetic/hf:MiniMaxAI/MiniMax-M2.5" },
      models: { "synthetic/hf:MiniMaxAI/MiniMax-M2.5": { alias: "MiniMax M2.5" } },
    },
  },
  models: {
    mode: "merge",
    providers: {
      synthetic: {
        baseUrl: "https://api.synthetic.new/anthropic",
        apiKey: "${SYNTHETIC_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "hf:MiniMaxAI/MiniMax-M2.5",
            name: "MiniMax M2.5",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 192000,
            maxTokens: 65536,
          },
        ],
      },
    },
  },
}
```

## 내장 카탈로그

모든 Synthetic 모델은 비용이 `0`입니다(input/output/cache).

| 모델 ID                                                | 컨텍스트 윈도우 | 최대 토큰  | Reasoning | 입력         |
| ------------------------------------------------------ | --------------- | ---------- | --------- | ------------ |
| `hf:MiniMaxAI/MiniMax-M2.5`                            | 192,000         | 65,536     | 아니오    | text         |
| `hf:moonshotai/Kimi-K2-Thinking`                       | 256,000         | 8,192      | 예        | text         |
| `hf:zai-org/GLM-4.7`                                   | 198,000         | 128,000    | 아니오    | text         |
| `hf:deepseek-ai/DeepSeek-R1-0528`                      | 128,000         | 8,192      | 아니오    | text         |
| `hf:deepseek-ai/DeepSeek-V3-0324`                      | 128,000         | 8,192      | 아니오    | text         |
| `hf:deepseek-ai/DeepSeek-V3.1`                         | 128,000         | 8,192      | 아니오    | text         |
| `hf:deepseek-ai/DeepSeek-V3.1-Terminus`                | 128,000         | 8,192      | 아니오    | text         |
| `hf:deepseek-ai/DeepSeek-V3.2`                         | 159,000         | 8,192      | 아니오    | text         |
| `hf:meta-llama/Llama-3.3-70B-Instruct`                 | 128,000         | 8,192      | 아니오    | text         |
| `hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | 524,000         | 8,192      | 아니오    | text         |
| `hf:moonshotai/Kimi-K2-Instruct-0905`                  | 256,000         | 8,192      | 아니오    | text         |
| `hf:moonshotai/Kimi-K2.5`                              | 256,000         | 8,192      | 예        | text + image |
| `hf:openai/gpt-oss-120b`                               | 128,000         | 8,192      | 아니오    | text         |
| `hf:Qwen/Qwen3-235B-A22B-Instruct-2507`                | 256,000         | 8,192      | 아니오    | text         |
| `hf:Qwen/Qwen3-Coder-480B-A35B-Instruct`               | 256,000         | 8,192      | 아니오    | text         |
| `hf:Qwen/Qwen3-VL-235B-A22B-Instruct`                  | 250,000         | 8,192      | 아니오    | text + image |
| `hf:zai-org/GLM-4.5`                                   | 128,000         | 128,000    | 아니오    | text         |
| `hf:zai-org/GLM-4.6`                                   | 198,000         | 128,000    | 아니오    | text         |
| `hf:zai-org/GLM-5`                                     | 256,000         | 128,000    | 예        | text + image |
| `hf:deepseek-ai/DeepSeek-V3`                           | 128,000         | 8,192      | 아니오    | text         |
| `hf:Qwen/Qwen3-235B-A22B-Thinking-2507`                | 256,000         | 8,192      | 예        | text         |

<Tip>
모델 레퍼런스는 `synthetic/<modelId>` 형식을 사용합니다.
계정에서 사용 가능한 모든 모델을 확인하려면
`openclaw models list --provider synthetic`을 사용하세요.
</Tip>

<AccordionGroup>
  <Accordion title="모델 허용 목록(allowlist)">
    모델 허용 목록(`agents.defaults.models`)을 활성화한 경우, 사용할 모든
    Synthetic 모델을 추가해야 합니다. 허용 목록에 없는 모델은 에이전트에게
    숨겨집니다.
  </Accordion>

  <Accordion title="Base URL 오버라이드">
    Synthetic이 API 엔드포인트를 변경한 경우, 설정에서 base URL을 오버라이드하세요.

    ```json5
    {
      models: {
        providers: {
          synthetic: {
            baseUrl: "https://new-api.synthetic.new/anthropic",
          },
        },
      },
    }
    ```

    OpenClaw가 `/v1`을 자동으로 덧붙인다는 점을 기억하세요.

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 규칙, 모델 레퍼런스, 페일오버 동작.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    프로바이더 설정을 포함한 전체 설정 스키마.
  </Card>
  <Card title="Synthetic" href="https://synthetic.new" icon="arrow-up-right-from-square">
    Synthetic 대시보드 및 API 문서.
  </Card>
</CardGroup>
