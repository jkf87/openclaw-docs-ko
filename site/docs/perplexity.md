---
title: "Perplexity Search (레거시 경로)"
description: "web_search를 위한 Perplexity Search API 및 Sonar/OpenRouter 호환성"
---

# Perplexity Search API

OpenClaw는 Perplexity Search API를 `web_search` 프로바이더로 지원합니다.
`title`, `url`, `snippet` 필드가 포함된 구조화된 결과를 반환합니다.

호환성을 위해 OpenClaw는 레거시 Perplexity Sonar/OpenRouter 설정도 지원합니다.
`OPENROUTER_API_KEY`를 사용하거나, `plugins.entries.perplexity.config.webSearch.apiKey`에 `sk-or-...` 키를 사용하거나, `plugins.entries.perplexity.config.webSearch.baseUrl` / `model`을 설정하면 프로바이더가 채팅 완성 경로로 전환되어 구조화된 Search API 결과 대신 인용문이 포함된 AI 합성 답변을 반환합니다.

## Perplexity API 키 발급

1. [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)에서 Perplexity 계정을 생성하십시오.
2. 대시보드에서 API 키를 생성하십시오.
3. 키를 구성에 저장하거나 게이트웨이 환경에서 `PERPLEXITY_API_KEY`를 설정하십시오.

## OpenRouter 호환성

이미 Perplexity Sonar에 OpenRouter를 사용하고 있다면 `provider: "perplexity"`를 유지하고 게이트웨이 환경에서 `OPENROUTER_API_KEY`를 설정하거나 `plugins.entries.perplexity.config.webSearch.apiKey`에 `sk-or-...` 키를 저장하십시오.

선택적 호환성 제어:

- `plugins.entries.perplexity.config.webSearch.baseUrl`
- `plugins.entries.perplexity.config.webSearch.model`

## 구성 예시

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
            apiKey: "&lt;openrouter-api-key&gt;",
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

**구성을 통해:** `openclaw configure --section web`을 실행하십시오. `plugins.entries.perplexity.config.webSearch.apiKey` 아래 `~/.openclaw/openclaw.json`에 키를 저장합니다. 해당 필드는 SecretRef 객체도 허용합니다.

**환경을 통해:** 게이트웨이 프로세스 환경에서 `PERPLEXITY_API_KEY` 또는 `OPENROUTER_API_KEY`를 설정하십시오. 게이트웨이 설치의 경우 `~/.openclaw/.env`(또는 서비스 환경)에 넣으십시오. [환경 변수](/help/faq#env-vars-and-env-loading)를 참조하십시오.

`provider: "perplexity"`가 구성되어 있고 Perplexity 키 SecretRef가 해결되지 않고 환경 폴백이 없는 경우 시작/재로드가 즉시 실패합니다.

## 도구 매개변수

이 매개변수는 네이티브 Perplexity Search API 경로에 적용됩니다.

| 매개변수              | 설명                                                         |
| --------------------- | ------------------------------------------------------------ |
| `query`               | 검색 쿼리 (필수)                                             |
| `count`               | 반환할 결과 수 (1-10, 기본값: 5)                             |
| `country`             | 2자리 ISO 국가 코드 (예: "US", "DE")                         |
| `language`            | ISO 639-1 언어 코드 (예: "en", "de", "fr")                   |
| `freshness`           | 시간 필터: `day` (24시간), `week`, `month`, 또는 `year`      |
| `date_after`          | 이 날짜 이후 게시된 결과만 (YYYY-MM-DD)                      |
| `date_before`         | 이 날짜 이전 게시된 결과만 (YYYY-MM-DD)                      |
| `domain_filter`       | 도메인 허용 목록/거부 목록 배열 (최대 20)                    |
| `max_tokens`          | 총 콘텐츠 예산 (기본값: 25000, 최대: 1000000)                |
| `max_tokens_per_page` | 페이지별 토큰 한도 (기본값: 2048)                            |

레거시 Sonar/OpenRouter 호환성 경로의 경우:

- `query`, `count`, `freshness`가 허용됩니다.
- `count`는 여기서 호환성 전용입니다. 응답은 여전히 N개 결과 목록이 아닌 인용문이 포함된 하나의 합성 답변입니다.
- `country`, `language`, `date_after`, `date_before`, `domain_filter`, `max_tokens`, `max_tokens_per_page` 같은 Search API 전용 필터는 명시적 오류를 반환합니다.

**예시:**

```javascript
// 국가 및 언어 특정 검색
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

// 도메인 필터링 (거부 목록 - - 접두사 사용)
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
- 동일 요청에서 허용 목록과 거부 목록을 혼용할 수 없습니다.
- 거부 목록 항목에는 `-` 접두사를 사용하십시오(예: `["-reddit.com"]`).

## 참고 사항

- Perplexity Search API는 구조화된 웹 검색 결과(`title`, `url`, `snippet`)를 반환합니다.
- OpenRouter 또는 명시적 `plugins.entries.perplexity.config.webSearch.baseUrl` / `model`은 호환성을 위해 Perplexity를 Sonar 채팅 완성으로 전환합니다.
- Sonar/OpenRouter 호환성은 구조화된 결과 행이 아닌 인용문이 포함된 하나의 합성 답변을 반환합니다.
- 결과는 기본적으로 15분 동안 캐시됩니다(`cacheTtlMinutes`로 구성 가능).

전체 web_search 구성은 [웹 도구](/tools/web)를 참조하십시오.
자세한 내용은 [Perplexity Search API 문서](https://docs.perplexity.ai/docs/search/quickstart)를 참조하십시오.
