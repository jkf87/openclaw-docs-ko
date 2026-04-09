---
summary: "Firecrawl 검색, 스크래핑, web_fetch 폴백"
read_when:
  - Firecrawl 기반 웹 추출을 원하는 경우
  - Firecrawl API 키가 필요한 경우
  - web_search 프로바이더로 Firecrawl을 원하는 경우
  - web_fetch에 봇 방지 추출이 필요한 경우
title: "Firecrawl"
---

# Firecrawl

OpenClaw는 세 가지 방식으로 **Firecrawl**을 사용할 수 있습니다:

- `web_search` 프로바이더로
- 명시적 플러그인 도구: `firecrawl_search` 및 `firecrawl_scrape`
- `web_fetch`를 위한 폴백 추출기로

Firecrawl은 봇 우회 및 캐싱을 지원하는 호스팅 추출/검색 서비스로, JS가 많은 사이트나 일반 HTTP 가져오기를 차단하는 페이지에 도움이 됩니다.

## API 키 발급

1. Firecrawl 계정을 만들고 API 키를 생성합니다.
2. 설정에 저장하거나 게이트웨이 환경에서 `FIRECRAWL_API_KEY`를 설정합니다.

## Firecrawl 검색 설정

```json5
{
  tools: {
    web: {
      search: {
        provider: "firecrawl",
      },
    },
  },
  plugins: {
    entries: {
      firecrawl: {
        enabled: true,
        config: {
          webSearch: {
            apiKey: "FIRECRAWL_API_KEY_HERE",
            baseUrl: "https://api.firecrawl.dev",
          },
        },
      },
    },
  },
}
```

참고 사항:

- 온보딩 또는 `openclaw configure --section web`에서 Firecrawl을 선택하면 번들된 Firecrawl 플러그인이 자동으로 활성화됩니다.
- Firecrawl을 사용한 `web_search`는 `query` 및 `count`를 지원합니다.
- `sources`, `categories` 또는 결과 스크래핑과 같은 Firecrawl 특정 제어의 경우 `firecrawl_search`를 사용합니다.
- `baseUrl` 재정의는 `https://api.firecrawl.dev`에만 있어야 합니다.
- `FIRECRAWL_BASE_URL`은 Firecrawl 검색 및 스크래핑 기본 URL을 위한 공유 환경 폴백입니다.

## Firecrawl 스크래핑 + web_fetch 폴백 설정

```json5
{
  plugins: {
    entries: {
      firecrawl: {
        enabled: true,
        config: {
          webFetch: {
            apiKey: "FIRECRAWL_API_KEY_HERE",
            baseUrl: "https://api.firecrawl.dev",
            onlyMainContent: true,
            maxAgeMs: 172800000,
            timeoutSeconds: 60,
          },
        },
      },
    },
  },
}
```

참고 사항:

- Firecrawl 폴백 시도는 API 키가 사용 가능한 경우에만 실행됩니다 (`plugins.entries.firecrawl.config.webFetch.apiKey` 또는 `FIRECRAWL_API_KEY`).
- `maxAgeMs`는 캐시된 결과가 얼마나 오래될 수 있는지 제어합니다 (ms). 기본값은 2일입니다.
- 레거시 `tools.web.fetch.firecrawl.*` 설정은 `openclaw doctor --fix`에 의해 자동 마이그레이션됩니다.
- Firecrawl 스크래핑/기본 URL 재정의는 `https://api.firecrawl.dev`로 제한됩니다.

`firecrawl_scrape`는 동일한 `plugins.entries.firecrawl.config.webFetch.*` 설정 및 환경 변수를 재사용합니다.

## Firecrawl 플러그인 도구

### `firecrawl_search`

일반 `web_search` 대신 Firecrawl 특정 검색 제어가 필요할 때 사용합니다.

핵심 파라미터:

- `query`
- `count`
- `sources`
- `categories`
- `scrapeResults`
- `timeoutSeconds`

### `firecrawl_scrape`

일반 `web_fetch`가 약한 JS가 많거나 봇 보호된 페이지에 사용합니다.

핵심 파라미터:

- `url`
- `extractMode`
- `maxChars`
- `onlyMainContent`
- `maxAgeMs`
- `proxy`
- `storeInCache`
- `timeoutSeconds`

## 스텔스 / 봇 우회

Firecrawl은 봇 우회를 위한 **프록시 모드** 파라미터를 노출합니다 (`basic`, `stealth`, 또는 `auto`).
OpenClaw는 항상 Firecrawl 요청에 `proxy: "auto"` 및 `storeInCache: true`를 사용합니다.
프록시가 생략되면 Firecrawl은 `auto`로 기본 설정됩니다. `auto`는 기본 시도가 실패하면 스텔스 프록시로 재시도하므로 기본 전용 스크래핑보다 더 많은 크레딧을 사용할 수 있습니다.

## `web_fetch`에서 Firecrawl 사용 방법

`web_fetch` 추출 순서:

1. Readability (로컬)
2. Firecrawl (활성 web-fetch 폴백으로 선택되거나 자동 감지된 경우)
3. 기본 HTML 정리 (최후 폴백)

선택 제어는 `tools.web.fetch.provider`입니다. 생략하면 OpenClaw가 사용 가능한 자격 증명에서 첫 번째 준비된 web-fetch 프로바이더를 자동 감지합니다. 현재 번들된 프로바이더는 Firecrawl입니다.

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [웹 가져오기](/tools/web-fetch) -- Firecrawl 폴백이 있는 web_fetch 도구
- [Tavily](/tools/tavily) -- 검색 + 추출 도구
