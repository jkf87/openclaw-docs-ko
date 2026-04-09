---
summary: "Moonshot K2 대 Kimi Coding 구성 (별도 프로바이더 + 키)"
read_when:
  - Moonshot K2 (Moonshot Open Platform) 대 Kimi Coding 설정을 원하는 경우
  - 별도 엔드포인트, 키, 모델 참조를 이해해야 하는 경우
  - 두 프로바이더 중 하나에 대한 복사-붙여넣기 구성을 원하는 경우
title: "Moonshot AI"
---

# Moonshot AI (Kimi)

Moonshot은 OpenAI 호환 엔드포인트와 함께 Kimi API를 제공합니다. 프로바이더를 구성하고 기본 모델을 `moonshot/kimi-k2.5`로 설정하거나, `kimi/kimi-code`로 Kimi Coding을 사용하십시오.

현재 Kimi K2 모델 ID:

[//]: # "moonshot-kimi-k2-ids:start"

- `kimi-k2.5`
- `kimi-k2-thinking`
- `kimi-k2-thinking-turbo`
- `kimi-k2-turbo`

[//]: # "moonshot-kimi-k2-ids:end"

```bash
openclaw onboard --auth-choice moonshot-api-key
# 또는
openclaw onboard --auth-choice moonshot-api-key-cn
```

Kimi Coding:

```bash
openclaw onboard --auth-choice kimi-code-api-key
```

참고: Moonshot과 Kimi Coding은 별도 프로바이더입니다. 키는 교환 불가능하며, 엔드포인트가 다르고, 모델 참조도 다릅니다 (Moonshot은 `moonshot/...` 사용, Kimi Coding은 `kimi/...` 사용).

Kimi 웹 검색도 Moonshot 플러그인을 사용합니다:

```bash
openclaw configure --section web
```

웹 검색 섹션에서 **Kimi**를 선택하여
`plugins.entries.moonshot.config.webSearch.*`를 저장하십시오.

## 구성 스니펫 (Moonshot API)

```json5
{
  env: { MOONSHOT_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "moonshot/kimi-k2.5" },
      models: {
        // moonshot-kimi-k2-aliases:start
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
            id: "kimi-k2.5",
            name: "Kimi K2.5",
            reasoning: false,
            input: ["text", "image"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
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

## Kimi Coding

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

## Kimi 웹 검색

OpenClaw는 **Kimi**를 Moonshot 웹 검색으로 지원되는 `web_search` 프로바이더로도 제공합니다.

대화형 설정에서 다음을 물어볼 수 있습니다:

- Moonshot API 리전:
  - `https://api.moonshot.ai/v1`
  - `https://api.moonshot.cn/v1`
- 기본 Kimi 웹 검색 모델 (기본값: `kimi-k2.5`)

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
            model: "kimi-k2.5",
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

## 참고 사항

- Moonshot 모델 참조는 `moonshot/<modelId>`를 사용합니다. Kimi Coding 모델 참조는 `kimi/<modelId>`를 사용합니다.
- 현재 Kimi Coding 기본 모델 참조는 `kimi/kimi-code`입니다. 레거시 `kimi/k2p5`는 호환성 모델 id로 계속 허용됩니다.
- Kimi 웹 검색은 `KIMI_API_KEY` 또는 `MOONSHOT_API_KEY`를 사용하며, 기본적으로 `https://api.moonshot.ai/v1`과 모델 `kimi-k2.5`를 사용합니다.
- 네이티브 Moonshot 엔드포인트(`https://api.moonshot.ai/v1` 및 `https://api.moonshot.cn/v1`)는 공유 `openai-completions` 전송에서 스트리밍 사용 호환성을 광고합니다. OpenClaw는 이제 엔드포인트 기능에 의존하므로, 동일한 네이티브 Moonshot 호스트를 대상으로 하는 호환 커스텀 프로바이더 id가 동일한 스트리밍 사용 동작을 상속합니다.
- 필요한 경우 `models.providers`에서 가격 및 컨텍스트 메타데이터를 재정의하십시오.
- Moonshot이 모델에 대해 다른 컨텍스트 제한을 게시하면 그에 따라 `contextWindow`를 조정하십시오.
- 국제 엔드포인트에는 `https://api.moonshot.ai/v1`을 사용하고, 중국 엔드포인트에는 `https://api.moonshot.cn/v1`을 사용하십시오.
- 온보딩 선택:
  - `https://api.moonshot.ai/v1`의 경우 `moonshot-api-key`
  - `https://api.moonshot.cn/v1`의 경우 `moonshot-api-key-cn`

## 네이티브 사고 모드 (Moonshot)

Moonshot Kimi는 이진 네이티브 사고를 지원합니다:

- `thinking: { type: "enabled" }`
- `thinking: { type: "disabled" }`

`agents.defaults.models.<provider/model>.params`를 통해 모델별로 구성하십시오:

```json5
{
  agents: {
    defaults: {
      models: {
        "moonshot/kimi-k2.5": {
          params: {
            thinking: { type: "disabled" },
          },
        },
      },
    },
  },
}
```

OpenClaw는 Moonshot에 대한 런타임 `/think` 수준도 매핑합니다:

- `/think off` -> `thinking.type=disabled`
- 비꺼짐 사고 수준 -> `thinking.type=enabled`

Moonshot 사고가 활성화되면 `tool_choice`는 `auto` 또는 `none`이어야 합니다. OpenClaw는 호환성을 위해 호환되지 않는 `tool_choice` 값을 `auto`로 정규화합니다.
