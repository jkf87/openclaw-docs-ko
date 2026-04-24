---
summary: "Volcano Engine 설정 (Doubao 모델, 일반 + 코딩 엔드포인트)"
title: "Volcengine (Doubao)"
read_when:
  - OpenClaw에서 Volcano Engine 또는 Doubao 모델을 사용하고 싶을 때
  - Volcengine API 키 설정이 필요할 때
---

Volcengine 프로바이더는 Doubao 모델과 Volcano Engine에서 호스팅되는 서드파티
모델에 접근할 수 있으며, 일반 워크로드와 코딩 워크로드를 위한 별도의 엔드포인트를
제공합니다.

| 항목       | 값                                                   |
| ---------- | --------------------------------------------------- |
| Providers  | `volcengine` (일반) + `volcengine-plan` (코딩)       |
| 인증       | `VOLCANO_ENGINE_API_KEY`                            |
| API        | OpenAI 호환                                          |

## 시작하기

<Steps>
  <Step title="API 키 설정">
    대화형 온보딩을 실행합니다:

    ```bash
    openclaw onboard --auth-choice volcengine-api-key
    ```

    단일 API 키로 일반(`volcengine`)과 코딩(`volcengine-plan`) 프로바이더가 함께 등록됩니다.

  </Step>
  <Step title="기본 모델 설정">
    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "volcengine-plan/ark-code-latest" },
        },
      },
    }
    ```
  </Step>
  <Step title="모델 사용 가능 여부 확인">
    ```bash
    openclaw models list --provider volcengine
    openclaw models list --provider volcengine-plan
    ```
  </Step>
</Steps>

<Tip>
비대화형(CI, 스크립트) 설정에서는 키를 직접 전달하십시오:

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice volcengine-api-key \
  --volcengine-api-key "$VOLCANO_ENGINE_API_KEY"
```

</Tip>

## 프로바이더와 엔드포인트

| Provider          | 엔드포인트                                | 사용 사례        |
| ----------------- | ----------------------------------------- | ---------------- |
| `volcengine`      | `ark.cn-beijing.volces.com/api/v3`        | 일반 모델         |
| `volcengine-plan` | `ark.cn-beijing.volces.com/api/coding/v3` | 코딩 모델         |

<Note>
두 프로바이더 모두 단일 API 키로 구성됩니다. 설정 시 두 프로바이더가 자동으로 등록됩니다.
</Note>

## 내장 카탈로그

<Tabs>
  <Tab title="일반 (volcengine)">
    | 모델 ref                                     | 이름                            | 입력        | 컨텍스트 |
    | -------------------------------------------- | ------------------------------- | ----------- | ------- |
    | `volcengine/doubao-seed-1-8-251228`          | Doubao Seed 1.8                 | text, image | 256,000 |
    | `volcengine/doubao-seed-code-preview-251028` | doubao-seed-code-preview-251028 | text, image | 256,000 |
    | `volcengine/kimi-k2-5-260127`                | Kimi K2.5                       | text, image | 256,000 |
    | `volcengine/glm-4-7-251222`                  | GLM 4.7                         | text, image | 200,000 |
    | `volcengine/deepseek-v3-2-251201`            | DeepSeek V3.2                   | text, image | 128,000 |
  </Tab>
  <Tab title="코딩 (volcengine-plan)">
    | 모델 ref                                          | 이름                     | 입력  | 컨텍스트 |
    | ------------------------------------------------- | ------------------------ | ----- | ------- |
    | `volcengine-plan/ark-code-latest`                 | Ark Coding Plan          | text  | 256,000 |
    | `volcengine-plan/doubao-seed-code`                | Doubao Seed Code         | text  | 256,000 |
    | `volcengine-plan/glm-4.7`                         | GLM 4.7 Coding           | text  | 200,000 |
    | `volcengine-plan/kimi-k2-thinking`                | Kimi K2 Thinking         | text  | 256,000 |
    | `volcengine-plan/kimi-k2.5`                       | Kimi K2.5 Coding         | text  | 256,000 |
    | `volcengine-plan/doubao-seed-code-preview-251028` | Doubao Seed Code Preview | text  | 256,000 |
  </Tab>
</Tabs>

## 고급 설정

<AccordionGroup>
  <Accordion title="온보딩 후 기본 모델">
    `openclaw onboard --auth-choice volcengine-api-key`는 현재
    `volcengine-plan/ark-code-latest`를 기본 모델로 설정하면서 일반 `volcengine`
    카탈로그도 함께 등록합니다.
  </Accordion>

  <Accordion title="모델 선택기 폴백 동작">
    온보딩/구성 시 모델 선택 과정에서, Volcengine 인증 선택지는
    `volcengine/*`과 `volcengine-plan/*` 행을 우선합니다. 해당 모델이 아직
    로드되지 않은 경우, OpenClaw는 빈 provider-scope 선택기를 보여주지 않고
    필터링되지 않은 카탈로그로 폴백합니다.
  </Accordion>

  <Accordion title="데몬 프로세스를 위한 환경 변수">
    Gateway가 데몬(launchd/systemd)으로 실행되는 경우, 해당 프로세스에서
    `VOLCANO_ENGINE_API_KEY`를 사용할 수 있도록 하십시오 (예: `~/.openclaw/.env`
    또는 `env.shellEnv` 설정).
  </Accordion>
</AccordionGroup>

<Warning>
OpenClaw를 백그라운드 서비스로 실행할 때, 대화형 셸에서 설정된 환경 변수는
자동으로 상속되지 않습니다. 위의 데몬 관련 참고를 확인하십시오.
</Warning>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, failover 동작 선택.
  </Card>
  <Card title="Configuration" href="/gateway/configuration" icon="gear">
    agent, 모델, 프로바이더에 대한 전체 구성 레퍼런스.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반적인 이슈와 디버깅 절차.
  </Card>
  <Card title="FAQ" href="/help/faq" icon="circle-question">
    OpenClaw 설정에 대한 자주 묻는 질문.
  </Card>
</CardGroup>
