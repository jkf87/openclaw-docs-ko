---
summary: "OpenClaw에서 Qianfan의 통합 API로 다양한 모델 접근"
read_when:
  - 다양한 LLM에 단일 API 키를 원하는 경우
  - Baidu Qianfan 설정 안내가 필요한 경우
title: "Qianfan"
---

# Qianfan 프로바이더 가이드

Qianfan은 Baidu의 MaaS 플랫폼으로, 단일 엔드포인트와 API 키 뒤에서 많은 모델에 요청을 라우팅하는 **통합 API**를 제공합니다. OpenAI 호환이므로 대부분의 OpenAI SDK는 기본 URL을 변경하면 작동합니다.

## 사전 요구 사항

1. Qianfan API 접근이 가능한 Baidu Cloud 계정
2. Qianfan 콘솔에서의 API 키
3. 시스템에 설치된 OpenClaw

## API 키 발급

1. [Qianfan 콘솔](https://console.bce.baidu.com/qianfan/ais/console/apiKey) 방문
2. 새 애플리케이션 생성 또는 기존 애플리케이션 선택
3. API 키 생성 (형식: `bce-v3/ALTAK-...`)
4. OpenClaw와 함께 사용할 API 키 복사

## CLI 설정

```bash
openclaw onboard --auth-choice qianfan-api-key
```

## 구성 스니펫

```json5
{
  env: { QIANFAN_API_KEY: "bce-v3/ALTAK-..." },
  agents: {
    defaults: {
      model: { primary: "qianfan/deepseek-v3.2" },
      models: {
        "qianfan/deepseek-v3.2": { alias: "QIANFAN" },
      },
    },
  },
  models: {
    providers: {
      qianfan: {
        baseUrl: "https://qianfan.baidubce.com/v2",
        api: "openai-completions",
        models: [
          {
            id: "deepseek-v3.2",
            name: "DEEPSEEK V3.2",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 98304,
            maxTokens: 32768,
          },
          {
            id: "ernie-5.0-thinking-preview",
            name: "ERNIE-5.0-Thinking-Preview",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 119000,
            maxTokens: 64000,
          },
        ],
      },
    },
  },
}
```

## 참고 사항

- 기본 번들 모델 참조: `qianfan/deepseek-v3.2`
- 기본 기본 URL: `https://qianfan.baidubce.com/v2`
- 번들 카탈로그에는 현재 `deepseek-v3.2`와 `ernie-5.0-thinking-preview`가 포함됩니다
- 사용자 정의 기본 URL 또는 모델 메타데이터가 필요한 경우에만 `models.providers.qianfan`을 추가하거나 재정의하십시오
- Qianfan은 네이티브 OpenAI 요청 형성이 아닌 OpenAI 호환 전송 경로를 통해 실행됩니다

## 관련 문서

- [OpenClaw 구성](/gateway/configuration)
- [모델 프로바이더](/concepts/model-providers)
- [에이전트 설정](/concepts/agent)
- [Qianfan API 문서](https://cloud.baidu.com/doc/qianfan-api/s/3m7of64lb)
