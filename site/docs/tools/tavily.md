---
title: "Tavily"
description: "Tavily 검색 및 추출 도구"
---

# Tavily

OpenClaw는 두 가지 방식으로 **Tavily**를 사용할 수 있습니다:

- `web_search` 프로바이더로
- 명시적 플러그인 도구: `tavily_search` 및 `tavily_extract`

Tavily는 AI 애플리케이션을 위해 설계된 검색 API로, LLM 소비에 최적화된 구조화된 결과를 반환합니다. 구성 가능한 검색 깊이, 주제 필터링, 도메인 필터, AI 생성 답변 요약 및 URL에서의 콘텐츠 추출(JavaScript 렌더링 페이지 포함)을 지원합니다.

## API 키 발급

1. [tavily.com](https://tavily.com/)에서 Tavily 계정을 생성합니다.
2. 대시보드에서 API 키를 생성합니다.
3. 설정에 저장하거나 게이트웨이 환경에서 `TAVILY_API_KEY`를 설정합니다.

## Tavily 검색 설정

```json5
{
  plugins: {
    entries: {
      tavily: {
        enabled: true,
        config: {
          webSearch: {
            apiKey: "tvly-...", // TAVILY_API_KEY가 설정된 경우 선택 사항
            baseUrl: "https://api.tavily.com",
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "tavily",
      },
    },
  },
}
```

참고 사항:

- 온보딩 또는 `openclaw configure --section web`에서 Tavily를 선택하면 번들된 Tavily 플러그인이 자동으로 활성화됩니다.
- Tavily 설정은 `plugins.entries.tavily.config.webSearch.*` 아래에 저장합니다.
- Tavily를 사용한 `web_search`는 `query` 및 `count` (최대 20개 결과)를 지원합니다.
- `search_depth`, `topic`, `include_answer`, 도메인 필터와 같은 Tavily 특정 제어의 경우 `tavily_search`를 사용합니다.

## Tavily 플러그인 도구

### `tavily_search`

일반 `web_search` 대신 Tavily 특정 검색 제어가 필요할 때 사용합니다.

| 파라미터          | 설명                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `query`           | 검색 쿼리 문자열 (400자 미만으로 유지)                              |
| `search_depth`    | `basic` (기본값, 균형) 또는 `advanced` (최고 관련성, 느림)          |
| `topic`           | `general` (기본값), `news` (실시간 업데이트), 또는 `finance`         |
| `max_results`     | 결과 수, 1-20 (기본값: 5)                                           |
| `include_answer`  | AI 생성 답변 요약 포함 (기본값: false)                              |
| `time_range`      | 최신성 필터: `day`, `week`, `month`, 또는 `year`                    |
| `include_domains` | 결과를 제한할 도메인 배열                                           |
| `exclude_domains` | 결과에서 제외할 도메인 배열                                         |

**검색 깊이:**

| 깊이       | 속도   | 관련성 | 최적 용도                                |
| ---------- | ------ | ------ | ---------------------------------------- |
| `basic`    | 빠름   | 높음   | 일반 목적 쿼리 (기본값)                  |
| `advanced` | 느림   | 최고   | 정밀성, 특정 사실, 연구                  |

### `tavily_extract`

하나 이상의 URL에서 깨끗한 콘텐츠를 추출하는 데 사용합니다. JavaScript 렌더링 페이지를 처리하고 대상 추출을 위한 쿼리 중심 청킹을 지원합니다.

| 파라미터            | 설명                                                        |
| ------------------- | ----------------------------------------------------------- |
| `urls`              | 추출할 URL 배열 (요청당 1-20개)                             |
| `query`             | 이 쿼리와의 관련성으로 추출된 청크 재순위                   |
| `extract_depth`     | `basic` (기본값, 빠름) 또는 `advanced` (JS 많은 페이지용)   |
| `chunks_per_source` | URL당 청크, 1-5 (`query` 필요)                              |
| `include_images`    | 결과에 이미지 URL 포함 (기본값: false)                      |

**추출 깊이:**

| 깊이       | 사용 시기                                   |
| ---------- | ------------------------------------------- |
| `basic`    | 간단한 페이지 - 먼저 시도                    |
| `advanced` | JS 렌더링 SPA, 동적 콘텐츠, 테이블          |

팁:

- 요청당 최대 20개 URL. 더 큰 목록은 여러 호출로 배치합니다.
- 전체 페이지 대신 관련 콘텐츠만 가져오려면 `query` + `chunks_per_source`를 사용합니다.
- 먼저 `basic`을 시도하고 콘텐츠가 누락되거나 불완전한 경우 `advanced`로 폴백합니다.

## 올바른 도구 선택

| 필요 사항                                       | 도구             |
| ----------------------------------------------- | ---------------- |
| 특별 옵션 없는 빠른 웹 검색                     | `web_search`     |
| 깊이, 주제, AI 답변을 사용한 검색               | `tavily_search`  |
| 특정 URL에서 콘텐츠 추출                        | `tavily_extract` |

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Firecrawl](/tools/firecrawl) -- 콘텐츠 추출이 있는 검색 + 스크래핑
- [Exa Search](/tools/exa-search) -- 콘텐츠 추출 기능이 있는 뉴럴 검색
