---
title: "MiniMax 검색"
description: "Coding Plan 검색 API를 통한 MiniMax 검색"
---

# MiniMax 검색

OpenClaw는 MiniMax Coding Plan 검색 API를 통해 `web_search` 프로바이더로 MiniMax를 지원합니다. 제목, URL, 스니펫, 관련 쿼리가 있는 구조화된 검색 결과를 반환합니다.

## Coding Plan 키 발급

1. **키 생성**

   [MiniMax Platform](https://platform.minimax.io/user-center/basic-information/interface-key)에서 MiniMax Coding Plan 키를 생성하거나 복사합니다.

  2. **키 저장**

   게이트웨이 환경에서 `MINIMAX_CODE_PLAN_KEY`를 설정하거나 다음을 통해 설정합니다:
   
       ```bash
       openclaw configure --section web
       ```


OpenClaw는 환경 별칭으로 `MINIMAX_CODING_API_KEY`도 허용합니다. `MINIMAX_API_KEY`는 이미 코딩 플랜 토큰을 가리키는 경우 호환성 폴백으로 계속 읽힙니다.

## 설정

```json5
{
  plugins: {
    entries: {
      minimax: {
        config: {
          webSearch: {
            apiKey: "sk-cp-...", // MINIMAX_CODE_PLAN_KEY가 설정된 경우 선택 사항
            region: "global", // 또는 "cn"
          },
        },
      },
    },
  },
  tools: {
    web: {
      search: {
        provider: "minimax",
      },
    },
  },
}
```

**환경 대안:** 게이트웨이 환경에서 `MINIMAX_CODE_PLAN_KEY`를 설정합니다.
게이트웨이 설치의 경우 `~/.openclaw/.env`에 넣으십시오.

## 지역 선택

MiniMax 검색은 다음 엔드포인트를 사용합니다:

- 전역: `https://api.minimax.io/v1/coding_plan/search`
- CN: `https://api.minimaxi.com/v1/coding_plan/search`

`plugins.entries.minimax.config.webSearch.region`이 설정되지 않은 경우 OpenClaw는 다음 순서로 지역을 해결합니다:

1. `tools.web.search.minimax.region` / 플러그인 소유 `webSearch.region`
2. `MINIMAX_API_HOST`
3. `models.providers.minimax.baseUrl`
4. `models.providers.minimax-portal.baseUrl`

즉, CN 온보딩 또는 `MINIMAX_API_HOST=https://api.minimaxi.com/...`는 MiniMax 검색도 자동으로 CN 호스트에 유지합니다.

OAuth `minimax-portal` 경로를 통해 MiniMax를 인증한 경우에도 웹 검색은 여전히 프로바이더 id `minimax`로 등록됩니다; OAuth 프로바이더 기본 URL은 CN/전역 호스트 선택을 위한 지역 힌트로만 사용됩니다.

## 지원 파라미터

MiniMax 검색이 지원하는 항목:

- `query`
- `count` (OpenClaw가 요청된 카운트로 반환된 결과 목록을 조정함)

프로바이더별 필터는 현재 지원되지 않습니다.

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [MiniMax](/providers/minimax) -- 모델, 이미지, 음성, 인증 설정
