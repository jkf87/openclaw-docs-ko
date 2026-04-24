---
summary: "web_search를 위한 Perplexity Search API 및 Sonar/OpenRouter 호환성"
read_when:
  - 웹 검색에 Perplexity Search를 사용하려는 경우
  - PERPLEXITY_API_KEY 또는 OPENROUTER_API_KEY 설정이 필요한 경우
title: "Perplexity 검색"
---

# Perplexity Search API

OpenClaw는 Perplexity Search API를 `web_search` 프로바이더로 지원합니다.
`title`, `url`, `snippet` 필드가 포함된 구조화된 결과를 반환합니다.

호환성을 위해 OpenClaw는 레거시 Perplexity Sonar/OpenRouter 설정도 지원합니다.
`OPENROUTER_API_KEY`, `plugins.entries.perplexity.config.webSearch.apiKey`의 `sk-or-...` 키를 사용하거나, `plugins.entries.perplexity.config.webSearch.baseUrl` / `model`을 설정하면, 프로바이더는 chat-completions 경로로 전환하며 구조화된 Search API 결과 대신 인용이 포함된 AI 합성 답변을 반환합니다.

## Perplexity API 키 받기

1. [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)에서 Perplexity 계정을 생성합니다
2. 대시보드에서 API 키를 생성합니다
3. 키를 설정에 저장하거나 게이트웨이 환경에 `PERPLEXITY_API_KEY`를 설정합니다.

## OpenRouter 호환성

이미 OpenRouter를 Perplexity Sonar에 사용하고 있다면, `provider: "perplexity"`를 유지하고 게이트웨이 환경에 `OPENROUTER_API_KEY`를 설정하거나, `plugins.entries.perplexity.config.webSearch.apiKey`에 `sk-or-...` 키를 저장하세요.

선택적 호환성 제어:

- `plugins.entries.perplexity.config.webSearch.baseUrl`
- `plugins.entries.perplexity.config.webSearch.model`

## 설정 예제

### 네이티브 Perplexity Search API

```json5
{
  plugins: {
    entries: {
      perplexity: {
        config: {
          webSearch: {
            apiKey: "pplx-...",
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "perplexity",
      },
    },
  },
}
```

### OpenRouter / Sonar 호환성

```json5
{
  plugins: {
    entries: {
      perplexity: {
        config: {
          webSearch: {
            apiKey: "<openrouter-api-key>",
            baseUrl: "https://openrouter.ai/api/v1",
            model: "perplexity/sonar-pro",
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "perplexity",
      },
    },
  },
}
```

## 키 설정 위치

**설정을 통해:** `openclaw configure --section web`을 실행합니다. 이는
`~/.openclaw/openclaw.json`의 `plugins.entries.perplexity.config.webSearch.apiKey` 아래에 키를 저장합니다.
해당 필드는 SecretRef 객체도 허용합니다.

**환경 변수를 통해:** 게이트웨이 프로세스 환경에 `PERPLEXITY_API_KEY` 또는 `OPENROUTER_API_KEY`를 설정합니다.
게이트웨이 설치의 경우 `~/.openclaw/.env` (또는 서비스 환경)에 넣으세요. [Env vars](/help/faq#env-vars-and-env-loading)를 참고하세요.

`provider: "perplexity"`가 구성되어 있고 Perplexity 키 SecretRef가 해결되지 않고 env 폴백이 없으면, 시작/재로드가 즉시 실패합니다.

## 도구 매개변수

이 매개변수는 네이티브 Perplexity Search API 경로에 적용됩니다.

<ParamField path="query" type="string" required>
검색 쿼리.
</ParamField>

<ParamField path="count" type="number" default="5">
반환할 결과 수 (1–10).
</ParamField>

<ParamField path="country" type="string">
2자리 ISO 국가 코드 (예: `US`, `DE`).
</ParamField>

<ParamField path="language" type="string">
ISO 639-1 언어 코드 (예: `en`, `de`, `fr`).
</ParamField>

<ParamField path="freshness" type="'day' | 'week' | 'month' | 'year'">
시간 필터 — `day`는 24시간입니다.
</ParamField>

<ParamField path="date_after" type="string">
이 날짜 이후에 게시된 결과만 (`YYYY-MM-DD`).
</ParamField>

<ParamField path="date_before" type="string">
이 날짜 이전에 게시된 결과만 (`YYYY-MM-DD`).
</ParamField>

<ParamField path="domain_filter" type="string[]">
도메인 허용/거부 목록 배열 (최대 20개).
</ParamField>

<ParamField path="max_tokens" type="number" default="25000">
총 콘텐츠 예산 (최대 1000000).
</ParamField>

<ParamField path="max_tokens_per_page" type="number" default="2048">
페이지당 토큰 제한.
</ParamField>

레거시 Sonar/OpenRouter 호환성 경로의 경우:

- `query`, `count`, `freshness`가 허용됩니다
- 거기서 `count`는 호환성 전용이며, 응답은 여전히 N개 결과 목록이 아닌 인용이 포함된
  하나의 합성된 답변입니다
- `country`, `language`, `date_after`,
  `date_before`, `domain_filter`, `max_tokens`, `max_tokens_per_page` 같은
  Search API 전용 필터는 명시적인 오류를 반환합니다

**예제:**

```javascript
// 국가 및 언어별 검색
await web_search({
  query: "renewable energy",
  country: "DE",
  language: "de",
});

// 최근 결과 (지난 주)
await web_search({
  query: "AI news",
  freshness: "week",
});

// 날짜 범위 검색
await web_search({
  query: "AI developments",
  date_after: "2024-01-01",
  date_before: "2024-06-30",
});

// 도메인 필터링 (허용 목록)
await web_search({
  query: "climate research",
  domain_filter: ["nature.com", "science.org", ".edu"],
});

// 도메인 필터링 (거부 목록 - 접두사 -)
await web_search({
  query: "product reviews",
  domain_filter: ["-reddit.com", "-pinterest.com"],
});

// 더 많은 콘텐츠 추출
await web_search({
  query: "detailed AI research",
  max_tokens: 50000,
  max_tokens_per_page: 4096,
});
```

### 도메인 필터 규칙

- 필터당 최대 20개 도메인
- 같은 요청에서 허용 목록과 거부 목록을 혼합할 수 없음
- 거부 목록 항목에는 `-` 접두사를 사용합니다 (예: `["-reddit.com"]`)

## 참고

- Perplexity Search API는 구조화된 웹 검색 결과(`title`, `url`, `snippet`)를 반환합니다
- OpenRouter 또는 명시적인 `plugins.entries.perplexity.config.webSearch.baseUrl` / `model`은 호환성을 위해 Perplexity를 다시 Sonar chat completions로 전환합니다
- Sonar/OpenRouter 호환성은 구조화된 결과 행이 아닌 인용이 포함된 하나의 합성 답변을 반환합니다
- 결과는 기본적으로 15분간 캐시됩니다 (`cacheTtlMinutes`로 구성 가능)

## 관련

- [Web Search overview](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Perplexity Search API docs](https://docs.perplexity.ai/docs/search/quickstart) -- 공식 Perplexity 문서
- [Brave Search](/tools/brave-search) -- 국가/언어 필터가 있는 구조화된 결과
- [Exa Search](/tools/exa-search) -- 콘텐츠 추출이 포함된 신경 검색
