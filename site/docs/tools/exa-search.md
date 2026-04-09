---
title: "Exa 검색"
description: "Exa AI 검색 -- 콘텐츠 추출 기능이 있는 뉴럴 및 키워드 검색"
---

# Exa 검색

OpenClaw는 `web_search` 프로바이더로 [Exa AI](https://exa.ai/)를 지원합니다. Exa는 내장 콘텐츠 추출(하이라이트, 텍스트, 요약)이 있는 뉴럴, 키워드, 하이브리드 검색 모드를 제공합니다.

## API 키 발급

1. **계정 생성**

   [exa.ai](https://exa.ai/)에서 가입하고 대시보드에서 API 키를 생성합니다.

  2. **키 저장**

   게이트웨이 환경에서 `EXA_API_KEY`를 설정하거나 다음을 통해 설정합니다:
   
       ```bash
       openclaw configure --section web
       ```


## 설정

```json5
{
  plugins: {
    entries: {
      exa: {
        config: {
          webSearch: {
            apiKey: "exa-...", // EXA_API_KEY가 설정된 경우 선택 사항
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "exa",
      },
    },
  },
}
```

**환경 대안:** 게이트웨이 환경에서 `EXA_API_KEY`를 설정합니다.
게이트웨이 설치의 경우 `~/.openclaw/.env`에 넣으십시오.

## 도구 파라미터

| 파라미터      | 설명                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| `query`       | 검색 쿼리 (필수)                                                              |
| `count`       | 반환할 결과 수 (1-100)                                                        |
| `type`        | 검색 모드: `auto`, `neural`, `fast`, `deep`, `deep-reasoning`, 또는 `instant` |
| `freshness`   | 시간 필터: `day`, `week`, `month`, 또는 `year`                                |
| `date_after`  | 이 날짜 이후 결과 (YYYY-MM-DD)                                                |
| `date_before` | 이 날짜 이전 결과 (YYYY-MM-DD)                                                |
| `contents`    | 콘텐츠 추출 옵션 (아래 참조)                                                  |

### 콘텐츠 추출

Exa는 검색 결과와 함께 추출된 콘텐츠를 반환할 수 있습니다. 활성화하려면 `contents` 객체를 전달합니다:

```javascript
await web_search({
  query: "transformer architecture explained",
  type: "neural",
  contents: {
    text: true, // 전체 페이지 텍스트
    highlights: { numSentences: 3 }, // 핵심 문장
    summary: true, // AI 요약
  },
});
```

| Contents 옵션 | 타입                                                                  | 설명              |
| ------------- | --------------------------------------------------------------------- | ----------------- |
| `text`        | `boolean \| { maxCharacters }`                                        | 전체 페이지 텍스트 추출 |
| `highlights`  | `boolean \| { maxCharacters, query, numSentences, highlightsPerUrl }` | 핵심 문장 추출    |
| `summary`     | `boolean \| { query }`                                                | AI 생성 요약      |

### 검색 모드

| 모드             | 설명                              |
| ---------------- | --------------------------------- |
| `auto`           | Exa가 최적 모드 선택 (기본값)      |
| `neural`         | 시맨틱/의미 기반 검색             |
| `fast`           | 빠른 키워드 검색                  |
| `deep`           | 철저한 심층 검색                  |
| `deep-reasoning` | 추론이 있는 심층 검색             |
| `instant`        | 가장 빠른 결과                    |

## 참고 사항

- `contents` 옵션이 제공되지 않으면 Exa는 기본적으로 `{ highlights: true }`를 사용하므로 결과에 핵심 문장 발췌가 포함됩니다
- 결과는 사용 가능한 경우 Exa API 응답의 `highlightScores` 및 `summary` 필드를 보존합니다
- 결과 설명은 하이라이트, 요약, 전체 텍스트 순서로 사용 가능한 것으로 해결됩니다
- `freshness`와 `date_after`/`date_before`는 결합할 수 없습니다 — 하나의 시간 필터 모드를 사용하십시오
- 쿼리당 최대 100개의 결과를 반환할 수 있습니다 (Exa 검색 유형 제한에 따름)
- 결과는 기본적으로 15분 동안 캐시됩니다 (`cacheTtlMinutes`로 설정 가능)
- Exa는 구조화된 JSON 응답을 제공하는 공식 API 통합입니다

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Brave Search](/tools/brave-search) -- 국가/언어 필터가 있는 구조화된 결과
- [Perplexity Search](/tools/perplexity-search) -- 도메인 필터링이 있는 구조화된 결과
