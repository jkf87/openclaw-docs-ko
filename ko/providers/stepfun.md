---
summary: "OpenClaw에서 StepFun 모델 사용하기"
read_when:
  - OpenClaw에서 StepFun 모델을 사용하고 싶을 때
  - StepFun 설정 가이드가 필요할 때
title: "StepFun"
---

OpenClaw는 두 가지 프로바이더 ID를 가진 StepFun 프로바이더 플러그인을 내장하고 있습니다.

- `stepfun`: 표준 엔드포인트용
- `stepfun-plan`: Step Plan 엔드포인트용

<Warning>
Standard와 Step Plan은 서로 다른 엔드포인트와 모델 레퍼런스 접두사(`stepfun/...` vs `stepfun-plan/...`)를 가진 **별개의 프로바이더**입니다. `.com` 엔드포인트에는 중국 키를, `.ai` 엔드포인트에는 글로벌 키를 사용하세요.
</Warning>

## 리전 및 엔드포인트 개요

| 엔드포인트 | 중국 (`.com`)                          | 글로벌 (`.ai`)                         |
| ---------- | -------------------------------------- | ------------------------------------- |
| Standard   | `https://api.stepfun.com/v1`           | `https://api.stepfun.ai/v1`           |
| Step Plan  | `https://api.stepfun.com/step_plan/v1` | `https://api.stepfun.ai/step_plan/v1` |

인증 환경 변수: `STEPFUN_API_KEY`

## 내장 카탈로그

Standard (`stepfun`):

| 모델 레퍼런스            | 컨텍스트 | 최대 출력 | 비고                    |
| ------------------------ | -------- | --------- | ----------------------- |
| `stepfun/step-3.5-flash` | 262,144  | 65,536    | 기본 Standard 모델      |

Step Plan (`stepfun-plan`):

| 모델 레퍼런스                      | 컨텍스트 | 최대 출력 | 비고                       |
| ---------------------------------- | -------- | --------- | -------------------------- |
| `stepfun-plan/step-3.5-flash`      | 262,144  | 65,536    | 기본 Step Plan 모델        |
| `stepfun-plan/step-3.5-flash-2603` | 262,144  | 65,536    | 추가 Step Plan 모델        |

## 시작하기

프로바이더 표면을 선택하고 설정 단계를 따라 진행하세요.

<Tabs>
  <Tab title="Standard">
    **적합한 사용처:** 표준 StepFun 엔드포인트를 통한 범용 용도.

    <Steps>
      <Step title="엔드포인트 리전 선택">
        | 인증 선택                        | 엔드포인트                       | 리전          |
        | -------------------------------- | -------------------------------- | ------------- |
        | `stepfun-standard-api-key-intl`  | `https://api.stepfun.ai/v1`     | 글로벌        |
        | `stepfun-standard-api-key-cn`    | `https://api.stepfun.com/v1`    | 중국          |
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice stepfun-standard-api-key-intl
        ```

        또는 중국 엔드포인트의 경우:

        ```bash
        openclaw onboard --auth-choice stepfun-standard-api-key-cn
        ```
      </Step>
      <Step title="비대화형 대안">
        ```bash
        openclaw onboard --auth-choice stepfun-standard-api-key-intl \
          --stepfun-api-key "$STEPFUN_API_KEY"
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider stepfun
        ```
      </Step>
    </Steps>

    ### 모델 레퍼런스

    - 기본 모델: `stepfun/step-3.5-flash`

  </Tab>

  <Tab title="Step Plan">
    **적합한 사용처:** Step Plan 추론(reasoning) 엔드포인트.

    <Steps>
      <Step title="엔드포인트 리전 선택">
        | 인증 선택                    | 엔드포인트                              | 리전          |
        | ---------------------------- | --------------------------------------- | ------------- |
        | `stepfun-plan-api-key-intl`  | `https://api.stepfun.ai/step_plan/v1`  | 글로벌        |
        | `stepfun-plan-api-key-cn`    | `https://api.stepfun.com/step_plan/v1` | 중국          |
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice stepfun-plan-api-key-intl
        ```

        또는 중국 엔드포인트의 경우:

        ```bash
        openclaw onboard --auth-choice stepfun-plan-api-key-cn
        ```
      </Step>
      <Step title="비대화형 대안">
        ```bash
        openclaw onboard --auth-choice stepfun-plan-api-key-intl \
          --stepfun-api-key "$STEPFUN_API_KEY"
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider stepfun-plan
        ```
      </Step>
    </Steps>

    ### 모델 레퍼런스

    - 기본 모델: `stepfun-plan/step-3.5-flash`
    - 대체 모델: `stepfun-plan/step-3.5-flash-2603`

  </Tab>
</Tabs>

## 고급 설정

<AccordionGroup>
  <Accordion title="전체 설정: Standard 프로바이더">
    ```json5
    {
      env: { STEPFUN_API_KEY: "your-key" },
      agents: { defaults: { model: { primary: "stepfun/step-3.5-flash" } } },
      models: {
        mode: "merge",
        providers: {
          stepfun: {
            baseUrl: "https://api.stepfun.ai/v1",
            api: "openai-completions",
            apiKey: "${STEPFUN_API_KEY}",
            models: [
              {
                id: "step-3.5-flash",
                name: "Step 3.5 Flash",
                reasoning: true,
                input: ["text"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 65536,
              },
            ],
          },
        },
      },
    }
    ```
  </Accordion>

  <Accordion title="전체 설정: Step Plan 프로바이더">
    ```json5
    {
      env: { STEPFUN_API_KEY: "your-key" },
      agents: { defaults: { model: { primary: "stepfun-plan/step-3.5-flash" } } },
      models: {
        mode: "merge",
        providers: {
          "stepfun-plan": {
            baseUrl: "https://api.stepfun.ai/step_plan/v1",
            api: "openai-completions",
            apiKey: "${STEPFUN_API_KEY}",
            models: [
              {
                id: "step-3.5-flash",
                name: "Step 3.5 Flash",
                reasoning: true,
                input: ["text"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 65536,
              },
              {
                id: "step-3.5-flash-2603",
                name: "Step 3.5 Flash 2603",
                reasoning: true,
                input: ["text"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 65536,
              },
            ],
          },
        },
      },
    }
    ```
  </Accordion>

  <Accordion title="참고 사항">
    - 이 프로바이더는 OpenClaw에 번들로 제공되므로 별도의 플러그인 설치 단계가 필요하지 않습니다.
    - `step-3.5-flash-2603`은 현재 `stepfun-plan`에서만 노출됩니다.
    - 단일 인증 플로우로 `stepfun` 및 `stepfun-plan` 양쪽에 리전 일치 프로파일이 기록되므로 두 표면을 함께 검색할 수 있습니다.
    - 모델을 조회하거나 전환하려면 `openclaw models list`와 `openclaw models set <provider/model>`을 사용하세요.
  </Accordion>
</AccordionGroup>

<Note>
더 넓은 프로바이더 개요는 [모델 프로바이더](/concepts/model-providers)를 참고하세요.
</Note>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    모든 프로바이더, 모델 레퍼런스, 페일오버 동작 개요.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    프로바이더, 모델, 플러그인에 대한 전체 설정 스키마.
  </Card>
  <Card title="모델 선택" href="/concepts/models" icon="brain">
    모델을 선택하고 설정하는 방법.
  </Card>
  <Card title="StepFun Platform" href="https://platform.stepfun.com" icon="globe">
    StepFun API 키 관리 및 문서.
  </Card>
</CardGroup>
