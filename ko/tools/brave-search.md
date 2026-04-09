---
summary: "web_search를 위한 Brave Search API 설정"
read_when:
  - web_search에 Brave Search를 사용하려는 경우
  - BRAVE_API_KEY 또는 플랜 세부 정보가 필요한 경우
title: "Brave Search"
---

# Brave Search API

OpenClaw는 `web_search` 프로바이더로 Brave Search API를 지원합니다.

## API 키 발급

1. [https://brave.com/search/api/](https://brave.com/search/api/)에서 Brave Search API 계정을 생성합니다.
2. 대시보드에서 **Search** 플랜을 선택하고 API 키를 생성합니다.
3. 설정 파일에 키를 저장하거나 게이트웨이 환경에서 `BRAVE_API_KEY`를 설정합니다.

## 설정 예시

```json5
{
  plugins: {
    entries: {
      brave: {
        config: {
          webSearch: {
            apiKey: "BRAVE_API_KEY_HERE",
            mode: "web", // 또는 "llm-context"
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "brave",
        maxResults: 5,
        timeoutSeconds: 30,
      },
    },
  },
}
```

프로바이더별 Brave 검색 설정은 이제 `plugins.entries.brave.config.webSearch.*`에 위치합니다.
레거시 `tools.web.search.apiKey`는 호환성 심을 통해 계속 로드되지만, 더 이상 표준 설정 경로가 아닙니다.

`webSearch.mode`는 Brave 전송 방식을 제어합니다:

- `web` (기본값): 제목, URL, 스니펫이 포함된 일반 Brave 웹 검색
- `llm-context`: 그라운딩을 위한 사전 추출된 텍스트 청크 및 소스가 포함된 Brave LLM Context API

## 도구 파라미터

| 파라미터      | 설명                                                        |
| ------------- | ----------------------------------------------------------- |
| `query`       | 검색 쿼리 (필수)                                            |
| `count`       | 반환할 결과 수 (1-10, 기본값: 5)                            |
| `country`     | 2자리 ISO 국가 코드 (예: "US", "DE")                        |
| `language`    | 검색 결과의 ISO 639-1 언어 코드 (예: "en", "de", "fr")      |
| `search_lang` | Brave 검색 언어 코드 (예: `en`, `en-gb`, `zh-hans`)         |
| `ui_lang`     | UI 요소에 대한 ISO 언어 코드                                |
| `freshness`   | 시간 필터: `day` (24시간), `week`, `month`, 또는 `year`     |
| `date_after`  | 이 날짜 이후에 게시된 결과만 (YYYY-MM-DD)                   |
| `date_before` | 이 날짜 이전에 게시된 결과만 (YYYY-MM-DD)                   |

**예시:**

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
```

## 참고 사항

- OpenClaw는 Brave **Search** 플랜을 사용합니다. 레거시 구독(예: 월 2,000건 쿼리의 원래 무료 플랜)이 있는 경우에도 유효하지만, LLM Context나 더 높은 속도 제한 등 최신 기능은 포함되지 않습니다.
- 각 Brave 플랜은 **월 \$5 무료 크레딧**(갱신됩니다)을 포함합니다. Search 플랜은 1,000건 요청당 \$5이므로, 크레딧으로 월 1,000건의 쿼리를 처리할 수 있습니다. 예상치 못한 청구를 방지하려면 Brave 대시보드에서 사용 한도를 설정하십시오. 현재 플랜은 [Brave API 포털](https://brave.com/search/api/)을 참고하십시오.
- Search 플랜에는 LLM Context 엔드포인트와 AI 추론 권한이 포함됩니다. 모델 학습이나 튜닝을 위해 결과를 저장하려면 명시적인 저장 권한이 있는 플랜이 필요합니다. Brave [서비스 약관](https://api-dashboard.search.brave.com/terms-of-service)을 참고하십시오.
- `llm-context` 모드는 일반 웹 검색 스니펫 형태 대신 그라운딩된 소스 항목을 반환합니다.
- `llm-context` 모드는 `ui_lang`, `freshness`, `date_after`, `date_before`를 지원하지 않습니다.
- `ui_lang`에는 `en-US`와 같은 지역 하위 태그가 포함되어야 합니다.
- 결과는 기본적으로 15분 동안 캐시됩니다 (`cacheTtlMinutes`로 설정 가능).

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Perplexity Search](/tools/perplexity-search) -- 도메인 필터링이 포함된 구조화된 결과
- [Exa Search](/tools/exa-search) -- 콘텐츠 추출 기능이 있는 뉴럴 검색
