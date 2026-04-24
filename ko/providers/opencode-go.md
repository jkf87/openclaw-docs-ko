---
summary: "공유 OpenCode 설정으로 OpenCode Go 카탈로그 사용하기"
read_when:
  - OpenCode Go 카탈로그를 사용하고 싶을 때
  - Go 호스팅 모델의 런타임 모델 ref가 필요할 때
title: "OpenCode Go"
---

OpenCode Go는 [OpenCode](/providers/opencode) 내의 Go 카탈로그입니다.
Zen 카탈로그와 동일한 `OPENCODE_API_KEY`를 사용하지만, 상위(upstream) 모델별 라우팅이 올바르게 유지되도록 런타임 프로바이더 ID는 `opencode-go`를 그대로 유지합니다.

| 속성             | 값                              |
| ---------------- | ------------------------------- |
| 런타임 프로바이더 | `opencode-go`                   |
| 인증             | `OPENCODE_API_KEY`              |
| 상위 설정        | [OpenCode](/providers/opencode) |

## 내장 카탈로그

OpenClaw는 번들된 pi 모델 레지스트리에서 Go 카탈로그를 가져옵니다. 최신 모델 목록은 `openclaw models list --provider opencode-go`를 실행해 확인할 수 있습니다.

번들된 pi 카탈로그 기준으로 해당 프로바이더는 다음을 포함합니다.

| 모델 ref                   | 이름                   |
| -------------------------- | --------------------- |
| `opencode-go/glm-5`        | GLM-5                 |
| `opencode-go/glm-5.1`      | GLM-5.1               |
| `opencode-go/kimi-k2.5`    | Kimi K2.5             |
| `opencode-go/kimi-k2.6`    | Kimi K2.6 (3x limits) |
| `opencode-go/mimo-v2-omni` | MiMo V2 Omni          |
| `opencode-go/mimo-v2-pro`  | MiMo V2 Pro           |
| `opencode-go/minimax-m2.5` | MiniMax M2.5          |
| `opencode-go/minimax-m2.7` | MiniMax M2.7          |
| `opencode-go/qwen3.5-plus` | Qwen3.5 Plus          |
| `opencode-go/qwen3.6-plus` | Qwen3.6 Plus          |

## 시작하기

<Tabs>
  <Tab title="대화형">
    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice opencode-go
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

  <Tab title="비대화형">
    <Steps>
      <Step title="키를 직접 전달">
        ```bash
        openclaw onboard --opencode-go-api-key "$OPENCODE_API_KEY"
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
  env: { OPENCODE_API_KEY: "YOUR_API_KEY_HERE" }, // pragma: allowlist secret
  agents: { defaults: { model: { primary: "opencode-go/kimi-k2.5" } } },
}
```

## 고급 설정

<AccordionGroup>
  <Accordion title="라우팅 동작">
    모델 ref가 `opencode-go/...` 형식이면 OpenClaw가 모델별 라우팅을 자동으로 처리합니다. 추가 프로바이더 설정은 필요하지 않습니다.
  </Accordion>

  <Accordion title="런타임 ref 규칙">
    런타임 ref는 명시적으로 유지됩니다. Zen은 `opencode/...`, Go는 `opencode-go/...`입니다. 이렇게 하면 두 카탈로그 전반에서 상위(upstream) 모델별 라우팅이 올바르게 유지됩니다.
  </Accordion>

  <Accordion title="공유 자격증명">
    동일한 `OPENCODE_API_KEY`가 Zen과 Go 카탈로그 모두에서 사용됩니다. 설정 시 키를 입력하면 두 런타임 프로바이더 모두에 대한 자격증명이 저장됩니다.
  </Accordion>
</AccordionGroup>

<Tip>
공유 온보딩 개요와 Zen + Go 카탈로그 전체 레퍼런스는 [OpenCode](/providers/opencode)를 참고하세요.
</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="OpenCode (상위)" href="/providers/opencode" icon="server">
    공유 온보딩, 카탈로그 개요, 고급 노트.
  </Card>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택 방법.
  </Card>
</CardGroup>
