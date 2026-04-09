---
title: "DuckDuckGo 검색"
description: "DuckDuckGo 웹 검색 -- 키 없는 폴백 프로바이더 (실험적, HTML 기반)"
---

# DuckDuckGo 검색

OpenClaw는 **키 없는** `web_search` 프로바이더로 DuckDuckGo를 지원합니다. API 키나 계정이 필요하지 않습니다.

::: warning
DuckDuckGo는 공식 API가 아닌 DuckDuckGo의 비JavaScript 검색 페이지에서 결과를 가져오는 **실험적, 비공식** 통합입니다. 봇 차단 페이지나 HTML 변경으로 인한 간헐적인 오류가 발생할 수 있습니다.
:::


## 설정

API 키가 필요 없습니다 — DuckDuckGo를 프로바이더로 설정하기만 하면 됩니다:

1. **설정**

   ```bash
       openclaw configure --section web
       # "duckduckgo"를 프로바이더로 선택
       ```


## 설정

```json5
{
  tools: {
    web: {
      search: {
        provider: "duckduckgo",
      },
    },
  },
}
```

지역 및 SafeSearch를 위한 선택적 플러그인 수준 설정:

```json5
{
  plugins: {
    entries: {
      duckduckgo: {
        config: {
          webSearch: {
            region: "us-en", // DuckDuckGo 지역 코드
            safeSearch: "moderate", // "strict", "moderate", 또는 "off"
          },
        },
      },
    },
  },
}
```

## 도구 파라미터

| 파라미터     | 설명                                                      |
| ------------ | --------------------------------------------------------- |
| `query`      | 검색 쿼리 (필수)                                          |
| `count`      | 반환할 결과 수 (1-10, 기본값: 5)                          |
| `region`     | DuckDuckGo 지역 코드 (예: `us-en`, `uk-en`, `de-de`)     |
| `safeSearch` | SafeSearch 수준: `strict`, `moderate` (기본값), 또는 `off` |

지역 및 SafeSearch는 플러그인 설정에서도 설정할 수 있으며(위 참조) — 도구 파라미터가 쿼리별 설정 값을 재정의합니다.

## 참고 사항

- **API 키 없음** — 즉시 사용 가능, 무설정
- **실험적** — 공식 API나 SDK가 아닌 DuckDuckGo의 비JavaScript HTML 검색 페이지에서 결과를 수집합니다
- **봇 차단 위험** — DuckDuckGo는 과도하거나 자동화된 사용 시 CAPTCHA를 제공하거나 요청을 차단할 수 있습니다
- **HTML 파싱** — 결과는 공지 없이 변경될 수 있는 페이지 구조에 의존합니다
- **자동 감지 순서** — DuckDuckGo는 자동 감지에서 첫 번째 키 없는 폴백 (순서 100)입니다. 설정된 키가 있는 API 기반 프로바이더가 먼저 실행되고, 그 다음 Ollama 웹 검색 (순서 110), 그 다음 SearXNG (순서 200)
- **SafeSearch는 설정되지 않으면 moderate로 기본 설정됩니다**

::: tip
프로덕션 사용의 경우, [Brave Search](/tools/brave-search) (무료 티어 제공) 또는 다른 API 기반 프로바이더를 고려하십시오.
:::


## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Brave Search](/tools/brave-search) -- 무료 티어가 있는 구조화된 결과
- [Exa Search](/tools/exa-search) -- 콘텐츠 추출 기능이 있는 뉴럴 검색
