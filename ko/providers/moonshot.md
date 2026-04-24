---
summary: "Moonshot K2 대 Kimi Coding 구성 (별도 프로바이더 + 키)"
read_when:
  - Moonshot K2 (Moonshot Open Platform) 대 Kimi Coding 설정을 원하는 경우
  - 별도 엔드포인트, 키, model 참조를 이해해야 하는 경우
  - 두 프로바이더 중 하나에 대한 복붙 가능한 구성을 원하는 경우
title: "Moonshot AI"
---

# Moonshot AI (Kimi)

Moonshot은 OpenAI 호환 엔드포인트가 포함된 Kimi API를 제공합니다. 프로바이더를
구성하고 기본 모델을 `moonshot/kimi-k2.6`으로 설정하거나,
`kimi/kimi-code`와 함께 Kimi Coding을 사용하십시오.

<Warning>
Moonshot과 Kimi Coding은 **별도 프로바이더**입니다. 키는 서로 호환되지 않고, 엔드포인트가 다르며, model 참조도 다릅니다 (`moonshot/...` 대 `kimi/...`).
</Warning>

## 내장 model 카탈로그

[//]: # "moonshot-kimi-k2-ids:start"

| Model 참조                        | 이름                   | Reasoning | 입력        | Context | 최대 출력  |
| --------------------------------- | ---------------------- | --------- | ----------- | ------- | ---------- |
| `moonshot/kimi-k2.6`              | Kimi K2.6              | No        | text, image | 262,144 | 262,144    |
| `moonshot/kimi-k2.5`              | Kimi K2.5              | No        | text, image | 262,144 | 262,144    |
| `moonshot/kimi-k2-thinking`       | Kimi K2 Thinking       | Yes       | text        | 262,144 | 262,144    |
| `moonshot/kimi-k2-thinking-turbo` | Kimi K2 Thinking Turbo | Yes       | text        | 262,144 | 262,144    |
| `moonshot/kimi-k2-turbo`          | Kimi K2 Turbo          | No        | text        | 256,000 | 16,384     |

[//]: # "moonshot-kimi-k2-ids:end"

현재 Moonshot 호스팅 K2 모델에 대한 번들 비용 추정치는 Moonshot이 공개한
pay-as-you-go 요율을 사용합니다: Kimi K2.6은 $0.16/MTok 캐시 적중,
$0.95/MTok 입력, $4.00/MTok 출력이며; Kimi K2.5는 $0.10/MTok 캐시 적중,
$0.60/MTok 입력, $3.00/MTok 출력입니다. 다른 레거시 카탈로그 항목은 구성에서
재정의하지 않는 한 비용 0 자리표시자를 유지합니다.

## 시작하기

프로바이더를 선택하고 설정 단계를 따르십시오.

<Tabs>
  <Tab title="Moonshot API">
    **적합한 경우:** Moonshot Open Platform을 통한 Kimi K2 모델.

    <Steps>
      <Step title="엔드포인트 리전 선택">
        | 인증 선택              | 엔드포인트                     | 리전          |
        | ---------------------- | ------------------------------ | ------------- |
        | `moonshot-api-key`     | `https://api.moonshot.ai/v1`   | International |
        | `moonshot-api-key-cn`  | `https://api.moonshot.cn/v1`   | China         |
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice moonshot-api-key
        ```

        또는 China 엔드포인트의 경우:

        ```bash
        openclaw onboard --auth-choice moonshot-api-key-cn
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "moonshot/kimi-k2.6" },
            },
          },
        }
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider moonshot
        ```
      </Step>
      <Step title="라이브 smoke test 실행">
        일반 세션을 건드리지 않고 모델 액세스 및 비용 추적을 검증하고 싶을 때
        격리된 state 디렉토리를 사용하십시오:

        ```bash
        OPENCLAW_CONFIG_PATH=/tmp/openclaw-kimi/openclaw.json \
        OPENCLAW_STATE_DIR=/tmp/openclaw-kimi \
        openclaw agent --local \
          --session-id live-kimi-cost \
          --message 'Reply exactly: KIMI_LIVE_OK' \
          --thinking off \
          --json
        ```

        JSON 응답은 `provider: "moonshot"` 및
        `model: "kimi-k2.6"`을 보고해야 합니다. Assistant 전사 항목은 Moonshot이
        usage 메타데이터를 반환할 때 `usage.cost` 아래에 정규화된 token 사용량과
        추정 비용을 저장합니다.
      </Step>
    </Steps>

    ### 구성 예시

    ```json5
    {
      env: { MOONSHOT_API_KEY: "sk-..." },
      agents: {
        defaults: {
          model: { primary: "moonshot/kimi-k2.6" },
          models: {
            // moonshot-kimi-k2-aliases:start
            "moonshot/kimi-k2.6": { alias: "Kimi K2.6" },
            "moonshot/kimi-k2.5": { alias: "Kimi K2.5" },
            "moonshot/kimi-k2-thinking": { alias: "Kimi K2 Thinking" },
            "moonshot/kimi-k2-thinking-turbo": { alias: "Kimi K2 Thinking Turbo" },
            "moonshot/kimi-k2-turbo": { alias: "Kimi K2 Turbo" },
            // moonshot-kimi-k2-aliases:end
          },
        },
      },
      models: {
        mode: "merge",
        providers: {
          moonshot: {
            baseUrl: "https://api.moonshot.ai/v1",
            apiKey: "${MOONSHOT_API_KEY}",
            api: "openai-completions",
            models: [
              // moonshot-kimi-k2-models:start
              {
                id: "kimi-k2.6",
                name: "Kimi K2.6",
                reasoning: false,
                input: ["text", "image"],
                cost: { input: 0.95, output: 4, cacheRead: 0.16, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 262144,
              },
              {
                id: "kimi-k2.5",
                name: "Kimi K2.5",
                reasoning: false,
                input: ["text", "image"],
                cost: { input: 0.6, output: 3, cacheRead: 0.1, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 262144,
              },
              {
                id: "kimi-k2-thinking",
                name: "Kimi K2 Thinking",
                reasoning: true,
                input: ["text"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 262144,
              },
              {
                id: "kimi-k2-thinking-turbo",
                name: "Kimi K2 Thinking Turbo",
                reasoning: true,
                input: ["text"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 262144,
              },
              {
                id: "kimi-k2-turbo",
                name: "Kimi K2 Turbo",
                reasoning: false,
                input: ["text"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 256000,
                maxTokens: 16384,
              },
              // moonshot-kimi-k2-models:end
            ],
          },
        },
      },
    }
    ```

  </Tab>

  <Tab title="Kimi Coding">
    **적합한 경우:** Kimi Coding 엔드포인트를 통한 코드 중심 작업.

    <Note>
    Kimi Coding은 Moonshot (`moonshot/...`)과 다른 API 키 및 프로바이더 접두사 (`kimi/...`)를 사용합니다. 레거시 model 참조 `kimi/k2p5`는 호환성 ID로 계속 허용됩니다.
    </Note>

    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice kimi-code-api-key
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "kimi/kimi-code" },
            },
          },
        }
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider kimi
        ```
      </Step>
    </Steps>

    ### 구성 예시

    ```json5
    {
      env: { KIMI_API_KEY: "sk-..." },
      agents: {
        defaults: {
          model: { primary: "kimi/kimi-code" },
          models: {
            "kimi/kimi-code": { alias: "Kimi" },
          },
        },
      },
    }
    ```

  </Tab>
</Tabs>

## Kimi web search

OpenClaw는 또한 Moonshot web search로 지원되는 `web_search` 프로바이더로
**Kimi**를 제공합니다.

<Steps>
  <Step title="대화형 web search 설정 실행">
    ```bash
    openclaw configure --section web
    ```

    web-search 섹션에서 **Kimi**를 선택하여
    `plugins.entries.moonshot.config.webSearch.*`를 저장하십시오.

  </Step>
  <Step title="web search 리전 및 모델 구성">
    대화형 설정은 다음을 묻습니다:

    | 설정                | 옵션                                                                 |
    | ------------------- | -------------------------------------------------------------------- |
    | API 리전            | `https://api.moonshot.ai/v1` (international) 또는 `https://api.moonshot.cn/v1` (China) |
    | Web search 모델     | 기본값 `kimi-k2.6`                                                   |

  </Step>
</Steps>

구성은 `plugins.entries.moonshot.config.webSearch` 아래에 있습니다:

```json5
{
  plugins: {
    entries: {
      moonshot: {
        config: {
          webSearch: {
            apiKey: "sk-...", // 또는 KIMI_API_KEY / MOONSHOT_API_KEY 사용
            baseUrl: "https://api.moonshot.ai/v1",
            model: "kimi-k2.6",
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "kimi",
      },
    },
  },
}
```

## 고급 구성

<AccordionGroup>
  <Accordion title="네이티브 thinking 모드">
    Moonshot Kimi는 이진 네이티브 thinking을 지원합니다:

    - `thinking: { type: "enabled" }`
    - `thinking: { type: "disabled" }`

    `agents.defaults.models.<provider/model>.params`를 통해 모델별로 구성하십시오:

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "moonshot/kimi-k2.6": {
              params: {
                thinking: { type: "disabled" },
              },
            },
          },
        },
      },
    }
    ```

    OpenClaw는 또한 Moonshot에 대해 runtime `/think` 수준을 매핑합니다:

    | `/think` 수준        | Moonshot 동작              |
    | -------------------- | -------------------------- |
    | `/think off`         | `thinking.type=disabled`   |
    | off가 아닌 모든 수준 | `thinking.type=enabled`    |

    <Warning>
    Moonshot thinking이 활성화되면 `tool_choice`는 `auto` 또는 `none`이어야 합니다. OpenClaw는 호환성을 위해 호환되지 않는 `tool_choice` 값을 `auto`로 정규화합니다.
    </Warning>

    Kimi K2.6은 또한 `reasoning_content`의 다중 턴 유지를 제어하는 선택적
    `thinking.keep` 필드를 허용합니다. 턴 전체에서 전체 reasoning을 유지하려면
    `"all"`로 설정하고, 서버 기본 전략을 사용하려면 생략하거나 `null`로
    두십시오. OpenClaw는 `moonshot/kimi-k2.6`에 대해서만 `thinking.keep`을
    전달하며, 다른 모델에서는 이를 제거합니다.

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "moonshot/kimi-k2.6": {
              params: {
                thinking: { type: "enabled", keep: "all" },
              },
            },
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="Tool call ID 정규화">
    Moonshot Kimi는 `functions.<name>:<index>` 형태의 tool_call ID를 제공합니다. OpenClaw는 다중 턴 tool call이 계속 작동할 수 있도록 이를 변경하지 않고 보존합니다.

    커스텀 OpenAI 호환 프로바이더에서 엄격한 정규화를 강제하려면 `sanitizeToolCallIds: true`를 설정하십시오:

    ```json5
    {
      models: {
        providers: {
          "my-kimi-proxy": {
            api: "openai-completions",
            sanitizeToolCallIds: true,
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="Streaming usage 호환성">
    네이티브 Moonshot 엔드포인트 (`https://api.moonshot.ai/v1` 및
    `https://api.moonshot.cn/v1`)는 공유 `openai-completions` transport에서
    streaming usage 호환성을 광고합니다. OpenClaw는 이를 엔드포인트 capability에
    맞춰 처리하므로, 동일한 네이티브 Moonshot 호스트를 대상으로 하는 호환
    커스텀 프로바이더 ID는 동일한 streaming-usage 동작을 상속합니다.

    번들 K2.6 요금제에서는, 입력, 출력, 캐시 읽기 token을 포함하는 스트리밍된
    usage도 `/status`, `/usage full`, `/usage cost`, 그리고 전사 기반 세션
    회계를 위해 로컬 추정 USD 비용으로 변환됩니다.

  </Accordion>

  <Accordion title="엔드포인트 및 model 참조 참고">
    | 프로바이더   | Model 참조 접두사 | 엔드포인트                    | 인증 환경 변수      |
    | ------------ | ----------------- | ----------------------------- | ------------------- |
    | Moonshot     | `moonshot/`       | `https://api.moonshot.ai/v1`  | `MOONSHOT_API_KEY`  |
    | Moonshot CN  | `moonshot/`       | `https://api.moonshot.cn/v1`  | `MOONSHOT_API_KEY`  |
    | Kimi Coding  | `kimi/`           | Kimi Coding 엔드포인트        | `KIMI_API_KEY`      |
    | Web search   | N/A               | Moonshot API 리전과 동일      | `KIMI_API_KEY` 또는 `MOONSHOT_API_KEY` |

    - Kimi web search는 `KIMI_API_KEY` 또는 `MOONSHOT_API_KEY`를 사용하며, model `kimi-k2.6`과 함께 `https://api.moonshot.ai/v1`로 기본 설정됩니다.
    - 필요한 경우 `models.providers`에서 가격과 context 메타데이터를 재정의하십시오.
    - Moonshot이 모델에 대해 다른 context 제한을 게시하면 그에 맞게 `contextWindow`를 조정하십시오.

  </Accordion>
</AccordionGroup>

## 관련 항목

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, model 참조, failover 동작 선택.
  </Card>
  <Card title="Web search" href="/tools/web" icon="magnifying-glass">
    Kimi를 포함한 web search 프로바이더 구성.
  </Card>
  <Card title="구성 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    프로바이더, 모델, 플러그인의 전체 구성 스키마.
  </Card>
  <Card title="Moonshot Open Platform" href="https://platform.moonshot.ai" icon="globe">
    Moonshot API 키 관리 및 문서.
  </Card>
</CardGroup>
