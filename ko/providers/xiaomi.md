---
summary: "OpenClaw에서 Xiaomi MiMo 모델 사용하기"
read_when:
  - OpenClaw에서 Xiaomi MiMo 모델을 사용하고 싶을 때
  - XIAOMI_API_KEY 설정이 필요할 때
title: "Xiaomi MiMo"
---

Xiaomi MiMo는 **MiMo** 모델을 위한 API 플랫폼입니다. OpenClaw는 API 키 인증과 함께
Xiaomi의 OpenAI 호환 엔드포인트를 사용합니다.

| 항목     | 값                              |
| -------- | ------------------------------- |
| Provider | `xiaomi`                        |
| 인증     | `XIAOMI_API_KEY`                |
| API      | OpenAI 호환                     |
| Base URL | `https://api.xiaomimimo.com/v1` |

## 시작하기

<Steps>
  <Step title="API 키 발급">
    [Xiaomi MiMo 콘솔](https://platform.xiaomimimo.com/#/console/api-keys)에서 API 키를 생성합니다.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice xiaomi-api-key
    ```

    또는 키를 직접 전달합니다:

    ```bash
    openclaw onboard --auth-choice xiaomi-api-key --xiaomi-api-key "$XIAOMI_API_KEY"
    ```

  </Step>
  <Step title="모델 사용 가능 여부 확인">
    ```bash
    openclaw models list --provider xiaomi
    ```
  </Step>
</Steps>

## 내장 카탈로그

| 모델 ref               | 입력        | 컨텍스트   | 최대 출력 | 추론(Reasoning) | 비고          |
| ---------------------- | ----------- | --------- | --------- | --------------- | ------------- |
| `xiaomi/mimo-v2-flash` | text        | 262,144   | 8,192     | No              | 기본 모델      |
| `xiaomi/mimo-v2-pro`   | text        | 1,048,576 | 32,000    | Yes             | 대용량 컨텍스트 |
| `xiaomi/mimo-v2-omni`  | text, image | 262,144   | 32,000    | Yes             | 멀티모달       |

<Tip>
기본 모델 ref는 `xiaomi/mimo-v2-flash`입니다. `XIAOMI_API_KEY`가 설정되어 있거나
auth 프로파일이 존재하면 프로바이더가 자동으로 주입됩니다.
</Tip>

## 설정 예시

```json5
{
  env: { XIAOMI_API_KEY: "your-key" },
  agents: { defaults: { model: { primary: "xiaomi/mimo-v2-flash" } } },
  models: {
    mode: "merge",
    providers: {
      xiaomi: {
        baseUrl: "https://api.xiaomimimo.com/v1",
        api: "openai-completions",
        apiKey: "XIAOMI_API_KEY",
        models: [
          {
            id: "mimo-v2-flash",
            name: "Xiaomi MiMo V2 Flash",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 262144,
            maxTokens: 8192,
          },
          {
            id: "mimo-v2-pro",
            name: "Xiaomi MiMo V2 Pro",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 1048576,
            maxTokens: 32000,
          },
          {
            id: "mimo-v2-omni",
            name: "Xiaomi MiMo V2 Omni",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 262144,
            maxTokens: 32000,
          },
        ],
      },
    },
  },
}
```

<AccordionGroup>
  <Accordion title="자동 주입 동작">
    환경 변수에 `XIAOMI_API_KEY`가 설정되어 있거나 auth 프로파일이 존재하면
    `xiaomi` 프로바이더가 자동으로 주입됩니다. 모델 메타데이터나 base URL을
    재정의하려는 경우가 아니라면 별도로 프로바이더를 설정할 필요가 없습니다.
  </Accordion>

  <Accordion title="모델 상세 정보">
    - **mimo-v2-flash** — 가볍고 빠른 모델로, 범용 텍스트 작업에 적합합니다. Reasoning은 지원하지 않습니다.
    - **mimo-v2-pro** — 긴 문서 워크로드를 위해 1M 토큰 컨텍스트 윈도우로 reasoning을 지원합니다.
    - **mimo-v2-omni** — 텍스트와 이미지 입력을 모두 받는 reasoning 활성화 멀티모달 모델입니다.

    <Note>
    모든 모델은 `xiaomi/` 접두어를 사용합니다 (예: `xiaomi/mimo-v2-pro`).
    </Note>

  </Accordion>

  <Accordion title="문제 해결">
    - 모델이 나타나지 않으면 `XIAOMI_API_KEY`가 설정되고 유효한지 확인하십시오.
    - Gateway가 데몬으로 실행되는 경우, 해당 프로세스에서 키에 접근할 수 있도록 하십시오 (예: `~/.openclaw/.env` 또는 `env.shellEnv`).

    <Warning>
    대화형 셸에서만 설정된 키는 데몬으로 관리되는 gateway 프로세스에는 보이지
    않습니다. 지속적으로 사용하려면 `~/.openclaw/.env` 또는 `env.shellEnv`
    설정을 사용하십시오.
    </Warning>

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
  <Card title="Xiaomi MiMo 콘솔" href="https://platform.xiaomimimo.com" icon="arrow-up-right-from-square">
    Xiaomi MiMo 대시보드 및 API 키 관리.
  </Card>
</CardGroup>
