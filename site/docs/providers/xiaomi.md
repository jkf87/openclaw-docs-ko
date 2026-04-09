---
title: "Xiaomi MiMo"
description: "OpenClaw에서 Xiaomi MiMo 모델 사용"
---

# Xiaomi MiMo

Xiaomi MiMo는 **MiMo** 모델을 위한 API 플랫폼입니다. OpenClaw는 API 키 인증과 함께 Xiaomi OpenAI 호환 엔드포인트를 사용합니다. [Xiaomi MiMo 콘솔](https://platform.xiaomimimo.com/#/console/api-keys)에서 API 키를 생성한 후, 해당 키로 번들 `xiaomi` 프로바이더를 구성하십시오.

## 내장 카탈로그

- 기본 URL: `https://api.xiaomimimo.com/v1`
- API: `openai-completions`
- 인증: `Bearer $XIAOMI_API_KEY`

| 모델 참조              | 입력         | 컨텍스트  | 최대 출력 | 참고 사항                   |
| ---------------------- | ------------ | --------- | --------- | --------------------------- |
| `xiaomi/mimo-v2-flash` | 텍스트       | 262,144   | 8,192     | 기본 모델                   |
| `xiaomi/mimo-v2-pro`   | 텍스트       | 1,048,576 | 32,000    | 추론 활성화                 |
| `xiaomi/mimo-v2-omni`  | 텍스트, 이미지 | 262,144   | 32,000    | 추론 활성화 멀티모달        |

## CLI 설정

```bash
openclaw onboard --auth-choice xiaomi-api-key
# 또는 비대화형
openclaw onboard --auth-choice xiaomi-api-key --xiaomi-api-key "$XIAOMI_API_KEY"
```

## 구성 스니펫

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

## 참고 사항

- 기본 모델 참조: `xiaomi/mimo-v2-flash`.
- 추가 내장 모델: `xiaomi/mimo-v2-pro`, `xiaomi/mimo-v2-omni`.
- `XIAOMI_API_KEY`가 설정되거나 인증 프로파일이 존재하면 프로바이더가 자동으로 주입됩니다.
- 프로바이더 규칙은 [/concepts/model-providers](/concepts/model-providers)를 참조하십시오.
