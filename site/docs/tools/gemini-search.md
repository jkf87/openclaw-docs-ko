---
title: "Gemini 검색"
description: "Google Search 그라운딩이 있는 Gemini 웹 검색"
---

# Gemini 검색

OpenClaw는 인용이 포함된 라이브 Google Search 결과로 AI 합성 답변을 반환하는 내장 [Google Search 그라운딩](https://ai.google.dev/gemini-api/docs/grounding)이 있는 Gemini 모델을 지원합니다.

## API 키 발급

1. **키 생성**

   [Google AI Studio](https://aistudio.google.com/apikey)로 이동하여 API 키를 생성합니다.

  2. **키 저장**

   게이트웨이 환경에서 `GEMINI_API_KEY`를 설정하거나 다음을 통해 설정합니다:
   
       ```bash
       openclaw configure --section web
       ```


## 설정

```json5
{
  plugins: {
    entries: {
      google: {
        config: {
          webSearch: {
            apiKey: "AIza...", // GEMINI_API_KEY가 설정된 경우 선택 사항
            model: "gemini-2.5-flash", // 기본값
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "gemini",
      },
    },
  },
}
```

**환경 대안:** 게이트웨이 환경에서 `GEMINI_API_KEY`를 설정합니다.
게이트웨이 설치의 경우 `~/.openclaw/.env`에 넣으십시오.

## 작동 방식

링크와 스니펫 목록을 반환하는 기존 검색 프로바이더와 달리, Gemini는 Google Search 그라운딩을 사용하여 인라인 인용이 있는 AI 합성 답변을 생성합니다. 결과에는 합성된 답변과 소스 URL이 모두 포함됩니다.

- Gemini 그라운딩의 인용 URL은 Google 리다이렉트 URL에서 직접 URL로 자동 해결됩니다.
- 리다이렉트 해결은 최종 인용 URL을 반환하기 전에 SSRF 가드 경로(HEAD + 리다이렉트 확인 + http/https 유효성 검사)를 사용합니다.
- 리다이렉트 해결은 엄격한 SSRF 기본값을 사용하므로 비공개/내부 대상으로의 리다이렉트는 차단됩니다.

## 지원 파라미터

Gemini 검색은 `query`를 지원합니다.

`count`는 공유 `web_search` 호환성을 위해 허용되지만, Gemini 그라운딩은 N개 결과 목록 대신 인용이 있는 하나의 합성 답변을 반환합니다.

`country`, `language`, `freshness`, `domain_filter`와 같은 프로바이더별 필터는 지원되지 않습니다.

## 모델 선택

기본 모델은 `gemini-2.5-flash` (빠르고 비용 효율적)입니다. 그라운딩을 지원하는 모든 Gemini 모델은 `plugins.entries.google.config.webSearch.model`을 통해 사용할 수 있습니다.

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Brave Search](/tools/brave-search) -- 스니펫이 있는 구조화된 결과
- [Perplexity Search](/tools/perplexity-search) -- 구조화된 결과 + 콘텐츠 추출
