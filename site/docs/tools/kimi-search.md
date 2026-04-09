---
title: "Kimi 검색"
description: "Moonshot 웹 검색을 통한 Kimi 웹 검색"
---

# Kimi 검색

OpenClaw는 `web_search` 프로바이더로 Kimi를 지원하며, Moonshot 웹 검색을 사용하여 인용이 있는 AI 합성 답변을 생성합니다.

## API 키 발급

1. **키 생성**

   [Moonshot AI](https://platform.moonshot.cn/)에서 API 키를 받습니다.

  2. **키 저장**

   게이트웨이 환경에서 `KIMI_API_KEY` 또는 `MOONSHOT_API_KEY`를 설정하거나 다음을 통해 설정합니다:
   
       ```bash
       openclaw configure --section web
       ```


`openclaw onboard` 또는 `openclaw configure --section web` 중에 **Kimi**를 선택하면 OpenClaw는 다음을 추가로 요청할 수 있습니다:

- Moonshot API 지역:
  - `https://api.moonshot.ai/v1`
  - `https://api.moonshot.cn/v1`
- 기본 Kimi 웹 검색 모델 (기본값: `kimi-k2.5`)

## 설정

```json5
{
  plugins: {
    entries: {
      moonshot: {
        config: {
          webSearch: {
            apiKey: "sk-...", // KIMI_API_KEY 또는 MOONSHOT_API_KEY가 설정된 경우 선택 사항
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

채팅에 중국 API 호스트(`models.providers.moonshot.baseUrl`: `https://api.moonshot.cn/v1`)를 사용하는 경우, OpenClaw는 `tools.web.search.kimi.baseUrl`이 생략되면 Kimi `web_search`에도 동일한 호스트를 재사용합니다. 따라서 [platform.moonshot.cn](https://platform.moonshot.cn/)의 키가 실수로 국제 엔드포인트에 도달하지 않습니다(HTTP 401 오류가 자주 발생). 다른 검색 기본 URL이 필요한 경우 `tools.web.search.kimi.baseUrl`로 재정의하십시오.

**환경 대안:** 게이트웨이 환경에서 `KIMI_API_KEY` 또는 `MOONSHOT_API_KEY`를 설정합니다. 게이트웨이 설치의 경우 `~/.openclaw/.env`에 넣으십시오.

`baseUrl`을 생략하면 OpenClaw는 `https://api.moonshot.ai/v1`로 기본 설정됩니다.
`model`을 생략하면 OpenClaw는 `kimi-k2.5`로 기본 설정됩니다.

## 작동 방식

Kimi는 Moonshot 웹 검색을 사용하여 인라인 인용이 있는 답변을 합성합니다. 이는 Gemini와 Grok의 그라운딩 응답 접근 방식과 유사합니다.

## 지원 파라미터

Kimi 검색은 `query`를 지원합니다.

`count`는 공유 `web_search` 호환성을 위해 허용되지만, Kimi는 N개 결과 목록 대신 인용이 있는 하나의 합성 답변을 반환합니다.

프로바이더별 필터는 현재 지원되지 않습니다.

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Moonshot AI](/providers/moonshot) -- Moonshot 모델 + Kimi Coding 프로바이더 문서
- [Gemini 검색](/tools/gemini-search) -- Google 그라운딩을 통한 AI 합성 답변
- [Grok 검색](/tools/grok-search) -- xAI 그라운딩을 통한 AI 합성 답변
