---
title: "Grok 검색"
description: "xAI 웹 그라운딩 응답을 통한 Grok 웹 검색"
---

# Grok 검색

OpenClaw는 `web_search` 프로바이더로 Grok을 지원하며, xAI 웹 그라운딩 응답을 사용하여 인용이 있는 라이브 검색 결과로 AI 합성 답변을 생성합니다.

동일한 `XAI_API_KEY`는 X (구 Twitter) 게시물 검색을 위한 내장 `x_search` 도구를 지원할 수도 있습니다. `plugins.entries.xai.config.webSearch.apiKey` 아래에 키를 저장하면 OpenClaw는 이제 번들된 xAI 모델 프로바이더를 위한 폴백으로 재사용합니다.

리포스트, 답글, 북마크, 조회수와 같은 게시물 수준 X 메트릭의 경우 광범위한 검색 쿼리 대신 정확한 게시물 URL 또는 상태 ID와 함께 `x_search`를 선호합니다.

## 온보딩 및 설정

다음 중에 **Grok**을 선택하는 경우:

- `openclaw onboard`
- `openclaw configure --section web`

OpenClaw는 동일한 `XAI_API_KEY`로 `x_search`를 활성화하기 위한 별도의 후속 단계를 표시할 수 있습니다. 해당 후속 단계:

- Grok을 `web_search`용으로 선택한 후에만 나타납니다
- 별도의 최상위 웹 검색 프로바이더 선택이 아닙니다
- 동일한 플로우에서 선택적으로 `x_search` 모델을 설정할 수 있습니다

건너뛰면 나중에 설정에서 `x_search`를 활성화하거나 변경할 수 있습니다.

## API 키 발급

1. **키 생성**

   [xAI](https://console.x.ai/)에서 API 키를 받습니다.

  2. **키 저장**

   게이트웨이 환경에서 `XAI_API_KEY`를 설정하거나 다음을 통해 설정합니다:
   
       ```bash
       openclaw configure --section web
       ```


## 설정

```json5
{
  plugins: {
    entries: {
      xai: {
        config: {
          webSearch: {
            apiKey: "xai-...", // XAI_API_KEY가 설정된 경우 선택 사항
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "grok",
      },
    },
  },
}
```

**환경 대안:** 게이트웨이 환경에서 `XAI_API_KEY`를 설정합니다.
게이트웨이 설치의 경우 `~/.openclaw/.env`에 넣으십시오.

## 작동 방식

Grok은 xAI 웹 그라운딩 응답을 사용하여 인라인 인용이 있는 답변을 합성합니다. 이는 Gemini의 Google Search 그라운딩 접근 방식과 유사합니다.

## 지원 파라미터

Grok 검색은 `query`를 지원합니다.

`count`는 공유 `web_search` 호환성을 위해 허용되지만, Grok은 N개 결과 목록 대신 인용이 있는 하나의 합성 답변을 반환합니다.

프로바이더별 필터는 현재 지원되지 않습니다.

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [웹 검색의 x_search](/tools/web#x_search) -- xAI를 통한 X 검색
- [Gemini 검색](/tools/gemini-search) -- Google 그라운딩을 통한 AI 합성 답변
