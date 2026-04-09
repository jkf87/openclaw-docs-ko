---
title: "StepFun"
description: "OpenClaw에서 StepFun 모델 사용"
---

# StepFun

OpenClaw에는 두 가지 프로바이더 id를 가진 번들 StepFun 프로바이더 플러그인이 포함되어 있습니다:

- 표준 엔드포인트용 `stepfun`
- Step Plan 엔드포인트용 `stepfun-plan`

내장 카탈로그는 현재 표면에 따라 다릅니다:

- Standard: `step-3.5-flash`
- Step Plan: `step-3.5-flash`, `step-3.5-flash-2603`

## 리전 및 엔드포인트 개요

- 중국 표준 엔드포인트: `https://api.stepfun.com/v1`
- 글로벌 표준 엔드포인트: `https://api.stepfun.ai/v1`
- 중국 Step Plan 엔드포인트: `https://api.stepfun.com/step_plan/v1`
- 글로벌 Step Plan 엔드포인트: `https://api.stepfun.ai/step_plan/v1`
- 인증 환경 변수: `STEPFUN_API_KEY`

`.com` 엔드포인트에는 중국 키를, `.ai` 엔드포인트에는 글로벌 키를 사용하십시오.

## CLI 설정

대화형 설정:

```bash
openclaw onboard
```

다음 인증 선택 중 하나를 선택하십시오:

- `stepfun-standard-api-key-cn`
- `stepfun-standard-api-key-intl`
- `stepfun-plan-api-key-cn`
- `stepfun-plan-api-key-intl`

비대화형 예시:

```bash
openclaw onboard --auth-choice stepfun-standard-api-key-intl --stepfun-api-key "$STEPFUN_API_KEY"
openclaw onboard --auth-choice stepfun-plan-api-key-intl --stepfun-api-key "$STEPFUN_API_KEY"
```

## 모델 참조

- Standard 기본 모델: `stepfun/step-3.5-flash`
- Step Plan 기본 모델: `stepfun-plan/step-3.5-flash`
- Step Plan 대체 모델: `stepfun-plan/step-3.5-flash-2603`

## 내장 카탈로그

Standard (`stepfun`):

| 모델 참조                | 컨텍스트 | 최대 출력 | 참고 사항            |
| ------------------------ | -------- | --------- | -------------------- |
| `stepfun/step-3.5-flash` | 262,144  | 65,536    | 기본 Standard 모델   |

Step Plan (`stepfun-plan`):

| 모델 참조                          | 컨텍스트 | 최대 출력 | 참고 사항                    |
| ---------------------------------- | -------- | --------- | ---------------------------- |
| `stepfun-plan/step-3.5-flash`      | 262,144  | 65,536    | 기본 Step Plan 모델          |
| `stepfun-plan/step-3.5-flash-2603` | 262,144  | 65,536    | 추가 Step Plan 모델          |

## 구성 스니펫

Standard 프로바이더:

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

Step Plan 프로바이더:

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

## 참고 사항

- 프로바이더는 OpenClaw와 번들되어 있으므로 별도의 플러그인 설치 단계가 없습니다.
- `step-3.5-flash-2603`은 현재 `stepfun-plan`에서만 노출됩니다.
- 단일 인증 플로우는 `stepfun`과 `stepfun-plan` 모두에 대해 리전 일치 프로파일을 작성하므로 두 표면을 함께 발견할 수 있습니다.
- 모델을 검사하거나 전환하려면 `openclaw models list` 및 `openclaw models set &lt;provider/model&gt;`을 사용하십시오.
- 더 넓은 프로바이더 개요는 [모델 프로바이더](/concepts/model-providers)를 참조하십시오.
