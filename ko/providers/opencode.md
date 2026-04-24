---
summary: "OpenClaw에서 OpenCode Zen과 Go 카탈로그 사용하기"
read_when:
  - OpenCode가 호스팅하는 모델에 접근하고 싶을 때
  - Zen과 Go 카탈로그 중 하나를 선택하고 싶을 때
title: "OpenCode"
---

OpenCode는 OpenClaw에서 두 개의 호스팅 카탈로그를 제공합니다.

| 카탈로그 | 접두사            | 런타임 프로바이더 |
| ------- | ----------------- | ---------------- |
| **Zen** | `opencode/...`    | `opencode`       |
| **Go**  | `opencode-go/...` | `opencode-go`    |

두 카탈로그 모두 동일한 OpenCode API 키를 사용합니다. OpenClaw는 상위(upstream) 모델별 라우팅이 올바르게 유지되도록 런타임 프로바이더 ID는 분리해 두지만, 온보딩과 문서에서는 하나의 OpenCode 설정으로 취급합니다.

## 시작하기

<Tabs>
  <Tab title="Zen 카탈로그">
    **적합한 사용처:** 큐레이팅된 OpenCode 멀티모델 프록시(Claude, GPT, Gemini).

    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice opencode-zen
        ```

        또는 키를 직접 전달할 수 있습니다.

        ```bash
        openclaw onboard --opencode-zen-api-key "$OPENCODE_API_KEY"
        ```
      </Step>
      <Step title="Zen 모델을 기본값으로 설정">
        ```bash
        openclaw config set agents.defaults.model.primary "opencode/claude-opus-4-6"
        ```
      </Step>
      <Step title="사용 가능한 모델 확인">
        ```bash
        openclaw models list --provider opencode
        ```
      </Step>
    </Steps>

  </Tab>

  <Tab title="Go 카탈로그">
    **적합한 사용처:** OpenCode가 호스팅하는 Kimi, GLM, MiniMax 라인업.

    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice opencode-go
        ```

        또는 키를 직접 전달할 수 있습니다.

        ```bash
        openclaw onboard --opencode-go-api-key "$OPENCODE_API_KEY"
        ```
      </Step>
      <Step title="Go 모델을 기본값으로 설정">
        ```bash
        openclaw config set agents.defaults.model.primary "opencode-go/kimi-k2.5"
        ```
      </Step>
      <Step title="사용 가능한 모델 확인">
        ```bash
        openclaw models list --provider opencode-go
        ```
      </Step>
    </Steps>

  </Tab>
</Tabs>

## 설정 예시

```json5
{
  env: { OPENCODE_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "opencode/claude-opus-4-6" } } },
}
```

## 내장 카탈로그

### Zen

| 속성             | 값                                                                      |
| ---------------- | ----------------------------------------------------------------------- |
| 런타임 프로바이더 | `opencode`                                                              |
| 예시 모델        | `opencode/claude-opus-4-6`, `opencode/gpt-5.5`, `opencode/gemini-3-pro` |

### Go

| 속성             | 값                                                                       |
| ---------------- | ------------------------------------------------------------------------ |
| 런타임 프로바이더 | `opencode-go`                                                            |
| 예시 모델        | `opencode-go/kimi-k2.5`, `opencode-go/glm-5`, `opencode-go/minimax-m2.5` |

## 고급 설정

<AccordionGroup>
  <Accordion title="API 키 별칭">
    `OPENCODE_ZEN_API_KEY`도 `OPENCODE_API_KEY`의 별칭(alias)으로 지원됩니다.
  </Accordion>

  <Accordion title="공유 자격증명">
    설정 시 하나의 OpenCode 키를 입력하면 두 런타임 프로바이더 모두에 대한 자격증명이 저장됩니다. 카탈로그별로 별도의 온보딩을 할 필요가 없습니다.
  </Accordion>

  <Accordion title="결제 및 대시보드">
    OpenCode에 로그인하고, 결제 정보를 추가한 뒤, API 키를 복사합니다. 결제와 카탈로그 사용 가능 여부는 OpenCode 대시보드에서 관리합니다.
  </Accordion>

  <Accordion title="Gemini 리플레이 동작">
    Gemini 기반의 OpenCode ref는 프록시 경유 Gemini 경로(proxy-Gemini path)에 머물기 때문에, OpenClaw는 네이티브 Gemini 리플레이 검증이나 부트스트랩 재작성을 활성화하지 않은 상태로 해당 경로에서 Gemini의 thought-signature 정화(sanitation)를 유지합니다.
  </Accordion>

  <Accordion title="Gemini 외 리플레이 동작">
    Gemini가 아닌 OpenCode ref는 최소한의 OpenAI 호환 리플레이 정책을 유지합니다.
  </Accordion>
</AccordionGroup>

<Tip>
설정 시 하나의 OpenCode 키를 입력하면 Zen과 Go 런타임 프로바이더 모두에 대한 자격증명이 저장되므로, 한 번만 온보딩하면 됩니다.
</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택 방법.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    에이전트, 모델, 프로바이더에 대한 전체 설정 레퍼런스.
  </Card>
</CardGroup>
