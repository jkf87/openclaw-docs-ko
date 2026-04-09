---
title: "SearXNG 검색"
description: "SearXNG 웹 검색 -- 자체 호스팅, 키 없는 메타 검색 프로바이더"
---

# SearXNG 검색

OpenClaw는 [SearXNG](https://docs.searxng.org/)를 **자체 호스팅, 키 없는** `web_search` 프로바이더로 지원합니다. SearXNG는 Google, Bing, DuckDuckGo 및 기타 소스에서 결과를 집계하는 오픈 소스 메타 검색 엔진입니다.

장점:

- **무료 및 무제한** -- API 키나 상업적 구독 불필요
- **개인 정보 보호 / 에어갭** -- 쿼리가 네트워크를 벗어나지 않음
- **어디서나 작동** -- 상업적 검색 API의 지역 제한 없음

## 설정

1. **SearXNG 인스턴스 실행**

   ```bash
       docker run -d -p 8888:8080 searxng/searxng
       ```
   
       또는 접근 권한이 있는 기존 SearXNG 배포를 사용합니다. 프로덕션 설정은 [SearXNG 문서](https://docs.searxng.org/)를 참조하십시오.

  2. **설정**

   ```bash
       openclaw configure --section web
       # "searxng"를 프로바이더로 선택
       ```
   
       또는 환경 변수를 설정하고 자동 감지가 찾도록 합니다:
   
       ```bash
       export SEARXNG_BASE_URL="http://localhost:8888"
       ```


## 설정

```json5
{
  tools: {
    web: {
      search: {
        provider: "searxng",
      },
    },
  },
}
```

SearXNG 인스턴스에 대한 플러그인 수준 설정:

```json5
{
  plugins: {
    entries: {
      searxng: {
        config: {
          webSearch: {
            baseUrl: "http://localhost:8888",
            categories: "general,news", // 선택 사항
            language: "en", // 선택 사항
          },
        },
      },
    },
  },
}
```

`baseUrl` 필드는 SecretRef 객체도 허용합니다.

전송 규칙:

- `https://`는 공개 또는 비공개 SearXNG 호스트에서 작동합니다
- `http://`는 신뢰할 수 있는 사설 네트워크 또는 루프백 호스트에만 허용됩니다
- 공개 SearXNG 호스트는 `https://`를 사용해야 합니다

## 환경 변수

설정 대신 `SEARXNG_BASE_URL`을 설정합니다:

```bash
export SEARXNG_BASE_URL="http://localhost:8888"
```

`SEARXNG_BASE_URL`이 설정되고 명시적 프로바이더가 설정되지 않은 경우 자동 감지가 자동으로 SearXNG를 선택합니다(가장 낮은 우선순위 -- 키가 있는 API 기반 프로바이더가 먼저 적용됨).

## 플러그인 설정 레퍼런스

| 필드         | 설명                                                         |
| ------------ | ------------------------------------------------------------ |
| `baseUrl`    | SearXNG 인스턴스의 기본 URL (필수)                           |
| `categories` | `general`, `news`, `science` 등 쉼표로 구분된 카테고리       |
| `language`   | `en`, `de`, `fr` 등의 결과 언어 코드                         |

## 참고 사항

- **JSON API** -- HTML 스크래핑이 아닌 SearXNG의 기본 `format=json` 엔드포인트 사용
- **API 키 없음** -- 모든 SearXNG 인스턴스에서 즉시 작동
- **기본 URL 검증** -- `baseUrl`은 유효한 `http://` 또는 `https://` URL이어야 하며; 공개 호스트는 `https://`를 사용해야 합니다
- **자동 감지 순서** -- SearXNG는 자동 감지에서 마지막으로 확인됩니다 (순서 200). API 키가 구성된 API 기반 프로바이더가 먼저 실행되고, 그 다음 DuckDuckGo (순서 100), 그 다음 Ollama 웹 검색 (순서 110)
- **자체 호스팅** -- 인스턴스, 쿼리, 업스트림 검색 엔진을 제어합니다
- **카테고리**는 설정되지 않으면 기본적으로 `general`로 설정됩니다

::: tip
SearXNG JSON API가 작동하려면 SearXNG 인스턴스의 `settings.yml`에서 `search.formats`에 `json` 형식이 활성화되어 있는지 확인하십시오.
:::


## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [DuckDuckGo 검색](/tools/duckduckgo-search) -- 또 다른 키 없는 폴백
- [Brave Search](/tools/brave-search) -- 무료 티어가 있는 구조화된 결과
