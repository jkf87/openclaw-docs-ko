---
title: "Volcengine (Doubao)"
summary: "Volcano Engine 설정 (Doubao 모델, 일반 + 코딩 엔드포인트)"
read_when:
  - OpenClaw에서 Volcano Engine 또는 Doubao 모델을 사용하려는 경우
  - Volcengine API 키 설정이 필요한 경우
---

# Volcengine (Doubao)

Volcengine 프로바이더는 일반 및 코딩 작업 부하를 위한 별도 엔드포인트가 있는 Doubao 모델 및 Volcano Engine에서 호스팅되는 서드파티 모델에 접근할 수 있습니다.

- 프로바이더: `volcengine` (일반) + `volcengine-plan` (코딩)
- 인증: `VOLCANO_ENGINE_API_KEY`
- API: OpenAI 호환

## 빠른 시작

1. API 키 설정:

```bash
openclaw onboard --auth-choice volcengine-api-key
```

2. 기본 모델 설정:

```json5
{
  agents: {
    defaults: {
      model: { primary: "volcengine-plan/ark-code-latest" },
    },
  },
}
```

## 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice volcengine-api-key \
  --volcengine-api-key "$VOLCANO_ENGINE_API_KEY"
```

## 프로바이더 및 엔드포인트

| 프로바이더        | 엔드포인트                                | 사용 사례      |
| ----------------- | ----------------------------------------- | -------------- |
| `volcengine`      | `ark.cn-beijing.volces.com/api/v3`        | 일반 모델      |
| `volcengine-plan` | `ark.cn-beijing.volces.com/api/coding/v3` | 코딩 모델      |

두 프로바이더 모두 단일 API 키로 구성됩니다. 설정하면 두 프로바이더 모두 자동으로 등록됩니다.

## 사용 가능한 모델

일반 프로바이더 (`volcengine`):

| 모델 참조                                    | 이름                            | 입력         | 컨텍스트 |
| -------------------------------------------- | ------------------------------- | ------------ | -------- |
| `volcengine/doubao-seed-1-8-251228`          | Doubao Seed 1.8                 | 텍스트, 이미지 | 256,000  |
| `volcengine/doubao-seed-code-preview-251028` | doubao-seed-code-preview-251028 | 텍스트, 이미지 | 256,000  |
| `volcengine/kimi-k2-5-260127`                | Kimi K2.5                       | 텍스트, 이미지 | 256,000  |
| `volcengine/glm-4-7-251222`                  | GLM 4.7                         | 텍스트, 이미지 | 200,000  |
| `volcengine/deepseek-v3-2-251201`            | DeepSeek V3.2                   | 텍스트, 이미지 | 128,000  |

코딩 프로바이더 (`volcengine-plan`):

| 모델 참조                                         | 이름                     | 입력   | 컨텍스트 |
| ------------------------------------------------- | ------------------------ | ------ | -------- |
| `volcengine-plan/ark-code-latest`                 | Ark Coding Plan          | 텍스트 | 256,000  |
| `volcengine-plan/doubao-seed-code`                | Doubao Seed Code         | 텍스트 | 256,000  |
| `volcengine-plan/glm-4.7`                         | GLM 4.7 Coding           | 텍스트 | 200,000  |
| `volcengine-plan/kimi-k2-thinking`                | Kimi K2 Thinking         | 텍스트 | 256,000  |
| `volcengine-plan/kimi-k2.5`                       | Kimi K2.5 Coding         | 텍스트 | 256,000  |
| `volcengine-plan/doubao-seed-code-preview-251028` | Doubao Seed Code Preview | 텍스트 | 256,000  |

`openclaw onboard --auth-choice volcengine-api-key`는 현재 일반 `volcengine` 카탈로그도 등록하면서 `volcengine-plan/ark-code-latest`를 기본 모델로 설정합니다.

온보딩/구성 모델 선택 중 Volcengine 인증 선택은 `volcengine/*` 및 `volcengine-plan/*` 행 모두를 선호합니다. 해당 모델이 아직 로드되지 않은 경우 OpenClaw는 빈 프로바이더 범위의 선택기를 표시하는 대신 필터링되지 않은 카탈로그로 폴백합니다.

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우 해당 프로세스에서 `VOLCANO_ENGINE_API_KEY`를 사용할 수 있어야 합니다 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).
