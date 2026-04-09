---
title: "Web Fetch"
description: "web_fetch 도구 -- 읽기 가능한 콘텐츠 추출이 있는 HTTP 가져오기"
---

# Web Fetch

`web_fetch` 도구는 일반 HTTP GET을 수행하고 읽기 가능한 콘텐츠(HTML을 마크다운 또는 텍스트로)를 추출합니다. JavaScript를 **실행하지 않습니다**.

JS가 많은 사이트나 로그인이 필요한 페이지에는 대신
[웹 브라우저](/tools/browser)를 사용하십시오.

## 빠른 시작

`web_fetch`는 **기본적으로 활성화됩니다** — 구성이 필요 없습니다. 에이전트가 즉시 호출할 수 있습니다:

```javascript
await web_fetch({ url: "https://example.com/article" });
```

## 도구 파라미터

| 파라미터      | 유형     | 설명                                     |
| ------------- | -------- | ---------------------------------------- |
| `url`         | `string` | 가져올 URL (필수, http/https만 가능)     |
| `extractMode` | `string` | `"markdown"` (기본값) 또는 `"text"`      |
| `maxChars`    | `number` | 출력을 이 문자 수로 잘라냅니다           |

## 작동 방식

1. **가져오기**

   Chrome과 유사한 User-Agent 및 `Accept-Language` 헤더로 HTTP GET을 전송합니다. 비공개/내부 호스트명을 차단하고 리디렉션을 재확인합니다.

  2. **추출**

   HTML 응답에서 Readability(메인 콘텐츠 추출)를 실행합니다.

  3. **폴백 (선택적)**

   Readability가 실패하고 Firecrawl이 구성된 경우, 봇 우회 모드로 Firecrawl API를 통해 재시도합니다.

  4. **캐시**

   결과는 동일한 URL의 반복 가져오기를 줄이기 위해 15분(구성 가능) 동안 캐시됩니다.


## 구성

```json5
{
  tools: {
    web: {
      fetch: {
        enabled: true, // 기본값: true
        provider: "firecrawl", // 선택적; 자동 감지를 위해 생략
        maxChars: 50000, // 최대 출력 문자
        maxCharsCap: 50000, // maxChars 파라미터 하드 캡
        maxResponseBytes: 2000000, // 잘라내기 전 최대 다운로드 크기
        timeoutSeconds: 30,
        cacheTtlMinutes: 15,
        maxRedirects: 3,
        readability: true, // Readability 추출 사용
        userAgent: "Mozilla/5.0 ...", // User-Agent 재정의
      },
    },
  },
}
```

## Firecrawl 폴백

Readability 추출이 실패하면 `web_fetch`는 봇 우회 및 더 나은 추출을 위해
[Firecrawl](/tools/firecrawl)로 폴백할 수 있습니다:

```json5
{
  tools: {
    web: {
      fetch: {
        provider: "firecrawl", // 선택적; 사용 가능한 자격 증명에서 자동 감지를 위해 생략
      },
    },
  },
  plugins: {
    entries: {
      firecrawl: {
        enabled: true,
        config: {
          webFetch: {
            apiKey: "fc-...", // FIRECRAWL_API_KEY가 설정된 경우 선택적
            baseUrl: "https://api.firecrawl.dev",
            onlyMainContent: true,
            maxAgeMs: 86400000, // 캐시 기간 (1일)
            timeoutSeconds: 60,
          },
        },
      },
    },
  },
}
```

`plugins.entries.firecrawl.config.webFetch.apiKey`는 SecretRef 객체를 지원합니다.
레거시 `tools.web.fetch.firecrawl.*` 구성은 `openclaw doctor --fix`로 자동 마이그레이션됩니다.

::: info NOTE
Firecrawl이 활성화되고 SecretRef가 해결되지 않으며 `FIRECRAWL_API_KEY` 환경 변수 폴백도 없는 경우, 게이트웨이 시작이 빠르게 실패합니다.
:::


::: info NOTE
Firecrawl `baseUrl` 재정의는 잠겨 있습니다: `https://`를 사용해야 하며 공식 Firecrawl 호스트(`api.firecrawl.dev`)여야 합니다.
:::


현재 런타임 동작:

- `tools.web.fetch.provider`는 가져오기 폴백 프로바이더를 명시적으로 선택합니다.
- `provider`가 생략되면 OpenClaw는 사용 가능한 자격 증명에서 첫 번째 준비된 web-fetch 프로바이더를 자동 감지합니다. 현재 번들된 프로바이더는 Firecrawl입니다.
- Readability가 비활성화된 경우 `web_fetch`는 선택된 프로바이더 폴백으로 바로 건너뜁니다. 사용 가능한 프로바이더가 없으면 실패합니다.

## 제한 및 안전

- `maxChars`는 `tools.web.fetch.maxCharsCap`으로 제한됩니다
- 응답 본문은 파싱 전 `maxResponseBytes`로 제한됩니다; 너무 큰 응답은 경고와 함께 잘립니다
- 비공개/내부 호스트명은 차단됩니다
- 리디렉션은 확인되고 `maxRedirects`로 제한됩니다
- `web_fetch`는 최선 노력 방식입니다 -- 일부 사이트는 [웹 브라우저](/tools/browser)가 필요합니다

## 도구 프로파일

도구 프로파일 또는 허용 목록을 사용하는 경우 `web_fetch` 또는 `group:web`을 추가하십시오:

```json5
{
  tools: {
    allow: ["web_fetch"],
    // 또는: allow: ["group:web"]  (web_fetch, web_search, x_search 포함)
  },
}
```

## 관련 항목

- [웹 검색](/tools/web) -- 여러 프로바이더로 웹 검색
- [웹 브라우저](/tools/browser) -- JS가 많은 사이트를 위한 전체 브라우저 자동화
- [Firecrawl](/tools/firecrawl) -- Firecrawl 검색 및 스크레이핑 도구
