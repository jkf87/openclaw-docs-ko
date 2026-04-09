---
summary: "OpenClaw에서 MiniMax 모델 사용"
read_when:
  - OpenClaw에서 MiniMax 모델을 원하는 경우
  - MiniMax 설정 안내가 필요한 경우
title: "MiniMax"
---

# MiniMax

OpenClaw의 MiniMax 프로바이더는 기본적으로 **MiniMax M2.7**을 사용합니다.

MiniMax는 또한 다음을 제공합니다:

- T2A v2를 통한 번들 음성 합성
- `MiniMax-VL-01`을 통한 번들 이미지 이해
- `music-2.5+`를 통한 번들 음악 생성
- MiniMax Coding Plan 검색 API를 통한 번들 `web_search`

프로바이더 분할:

- `minimax`: API 키 텍스트 프로바이더, 번들 이미지 생성, 이미지 이해, 음성, 웹 검색 포함
- `minimax-portal`: OAuth 텍스트 프로바이더, 번들 이미지 생성 및 이미지 이해 포함

## 모델 라인업

- `MiniMax-M2.7`: 기본 호스팅 추론 모델.
- `MiniMax-M2.7-highspeed`: 더 빠른 M2.7 추론 티어.
- `image-01`: 이미지 생성 모델 (생성 및 이미지-이미지 편집).

## 이미지 생성

MiniMax 플러그인은 `image_generate` 도구에 `image-01` 모델을 등록합니다. 지원 사항:

- 종횡비 제어를 사용한 **텍스트-이미지 생성**.
- 종횡비 제어를 사용한 **이미지-이미지 편집** (주제 참조).
- 요청당 최대 **9개** 출력 이미지.
- 편집 요청당 최대 **1개** 참조 이미지.
- 지원 종횡비: `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `3:4`, `9:16`, `21:9`.

MiniMax를 이미지 생성 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: { primary: "minimax/image-01" },
    },
  },
}
```

플러그인은 텍스트 모델과 동일한 `MINIMAX_API_KEY` 또는 OAuth 인증을 사용합니다. MiniMax가 이미 설정되어 있으면 추가 구성이 필요하지 않습니다.

`minimax`와 `minimax-portal` 모두 동일한 `image-01` 모델로 `image_generate`를 등록합니다. API 키 설정은 `MINIMAX_API_KEY`를 사용합니다; OAuth 설정은 번들 `minimax-portal` 인증 경로를 사용할 수 있습니다.

온보딩 또는 API 키 설정이 명시적 `models.providers.minimax` 항목을 작성하면, OpenClaw는 `input: ["text", "image"]`와 함께 `MiniMax-M2.7` 및 `MiniMax-M2.7-highspeed`를 구체화합니다.

번들 내장 MiniMax 텍스트 카탈로그 자체는 해당 명시적 프로바이더 구성이 존재할 때까지 텍스트 전용 메타데이터로 유지됩니다. 이미지 이해는 플러그인 소유 `MiniMax-VL-01` 미디어 프로바이더를 통해 별도로 노출됩니다.

공유 도구 파라미터, 프로바이더 선택, 장애 조치 동작은 [이미지 생성](/tools/image-generation)을 참조하십시오.

## 음악 생성

번들 `minimax` 플러그인도 공유 `music_generate` 도구를 통해 음악 생성을 등록합니다.

- 기본 음악 모델: `minimax/music-2.5+`
- `minimax/music-2.5` 및 `minimax/music-2.0`도 지원
- 프롬프트 제어: `lyrics`, `instrumental`, `durationSeconds`
- 출력 형식: `mp3`
- 세션 기반 실행은 `action: "status"`를 포함한 공유 태스크/상태 흐름을 통해 분리됩니다

MiniMax를 기본 음악 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      musicGenerationModel: {
        primary: "minimax/music-2.5+",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택, 장애 조치 동작은 [음악 생성](/tools/music-generation)을 참조하십시오.

## 동영상 생성

번들 `minimax` 플러그인도 공유 `video_generate` 도구를 통해 동영상 생성을 등록합니다.

- 기본 동영상 모델: `minimax/MiniMax-Hailuo-2.3`
- 모드: 텍스트-동영상 및 단일 이미지 참조 흐름
- `aspectRatio` 및 `resolution` 지원

MiniMax를 기본 동영상 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "minimax/MiniMax-Hailuo-2.3",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택, 장애 조치 동작은 [동영상 생성](/tools/video-generation)을 참조하십시오.

## 이미지 이해

MiniMax 플러그인은 텍스트 카탈로그와 별도로 이미지 이해를 등록합니다:

- `minimax`: 기본 이미지 모델 `MiniMax-VL-01`
- `minimax-portal`: 기본 이미지 모델 `MiniMax-VL-01`

따라서 번들 텍스트 프로바이더 카탈로그가 여전히 텍스트 전용 M2.7 채팅 참조를 표시하더라도 자동 미디어 라우팅이 MiniMax 이미지 이해를 사용할 수 있습니다.

## 웹 검색

MiniMax 플러그인은 MiniMax Coding Plan 검색 API를 통해 `web_search`도 등록합니다.

- 프로바이더 id: `minimax`
- 구조화된 결과: 제목, URL, 스니펫, 관련 쿼리
- 권장 환경 변수: `MINIMAX_CODE_PLAN_KEY`
- 허용 환경 별칭: `MINIMAX_CODING_API_KEY`
- 호환성 폴백: 이미 coding-plan 토큰을 가리키는 경우 `MINIMAX_API_KEY`
- 리전 재사용: `plugins.entries.minimax.config.webSearch.region`, 그 다음 `MINIMAX_API_HOST`, 그 다음 MiniMax 프로바이더 기본 URL
- 검색은 프로바이더 id `minimax`에서 유지됩니다; OAuth CN/전역 설정은 `models.providers.minimax-portal.baseUrl`을 통해 리전을 간접적으로 조정할 수 있습니다

구성은 `plugins.entries.minimax.config.webSearch.*` 아래에 있습니다.
[MiniMax 검색](/tools/minimax-search)을 참조하십시오.

## 설정 선택

### MiniMax OAuth (Coding Plan) - 권장

**적합한 경우:** OAuth를 통한 MiniMax Coding Plan을 사용한 빠른 설정, API 키 불필요.

명시적 리전 OAuth 선택으로 인증하십시오:

```bash
openclaw onboard --auth-choice minimax-global-oauth
# 또는
openclaw onboard --auth-choice minimax-cn-oauth
```

선택 매핑:

- `minimax-global-oauth`: 국제 사용자 (`api.minimax.io`)
- `minimax-cn-oauth`: 중국 사용자 (`api.minimaxi.com`)

자세한 내용은 OpenClaw 저장소의 MiniMax 플러그인 패키지 README를 참조하십시오.

### MiniMax M2.7 (API 키)

**적합한 경우:** Anthropic 호환 API를 사용한 호스팅 MiniMax.

CLI를 통해 구성하십시오:

- 대화형 온보딩:

```bash
openclaw onboard --auth-choice minimax-global-api
# 또는
openclaw onboard --auth-choice minimax-cn-api
```

- `minimax-global-api`: 국제 사용자 (`api.minimax.io`)
- `minimax-cn-api`: 중국 사용자 (`api.minimaxi.com`)

```json5
{
  env: { MINIMAX_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "minimax/MiniMax-M2.7" } } },
  models: {
    mode: "merge",
    providers: {
      minimax: {
        baseUrl: "https://api.minimax.io/anthropic",
        apiKey: "${MINIMAX_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "MiniMax-M2.7",
            name: "MiniMax M2.7",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0.3, output: 1.2, cacheRead: 0.06, cacheWrite: 0.375 },
            contextWindow: 204800,
            maxTokens: 131072,
          },
          {
            id: "MiniMax-M2.7-highspeed",
            name: "MiniMax M2.7 Highspeed",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0.6, output: 2.4, cacheRead: 0.06, cacheWrite: 0.375 },
            contextWindow: 204800,
            maxTokens: 131072,
          },
        ],
      },
    },
  },
}
```

Anthropic 호환 스트리밍 경로에서 OpenClaw는 이제 직접 `thinking`을 설정하지 않는 한 MiniMax 사고를 기본적으로 비활성화합니다. MiniMax의 스트리밍 엔드포인트는 네이티브 Anthropic 사고 블록 대신 OpenAI 스타일 델타 청크에서 `reasoning_content`를 방출하여 암묵적으로 활성화된 경우 내부 추론이 표시 출력에 노출될 수 있습니다.

### MiniMax M2.7를 폴백으로 사용 (예시)

**적합한 경우:** 가장 강력한 최신 세대 모델을 기본으로 유지하고 MiniMax M2.7로 장애 조치.
아래 예시는 구체적인 기본 모델로 Opus를 사용합니다; 원하는 최신 세대 기본 모델로 교체하십시오.

```json5
{
  env: { MINIMAX_API_KEY: "sk-..." },
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": { alias: "primary" },
        "minimax/MiniMax-M2.7": { alias: "minimax" },
      },
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["minimax/MiniMax-M2.7"],
      },
    },
  },
}
```

## `openclaw configure`를 통한 구성

JSON을 편집하지 않고 대화형 구성 마법사를 사용하여 MiniMax를 설정하십시오:

1. `openclaw configure`를 실행하십시오.
2. **Model/auth**를 선택하십시오.
3. **MiniMax** 인증 옵션을 선택하십시오.
4. 메시지가 표시되면 기본 모델을 선택하십시오.

마법사/CLI의 현재 MiniMax 인증 선택:

- `minimax-global-oauth`
- `minimax-cn-oauth`
- `minimax-global-api`
- `minimax-cn-api`

## 구성 옵션

- `models.providers.minimax.baseUrl`: `https://api.minimax.io/anthropic` 선호 (Anthropic 호환); `https://api.minimax.io/v1`은 OpenAI 호환 페이로드의 경우 선택 사항.
- `models.providers.minimax.api`: `anthropic-messages` 선호; `openai-completions`은 OpenAI 호환 페이로드의 경우 선택 사항.
- `models.providers.minimax.apiKey`: MiniMax API 키 (`MINIMAX_API_KEY`).
- `models.providers.minimax.models`: `id`, `name`, `reasoning`, `contextWindow`, `maxTokens`, `cost` 정의.
- `agents.defaults.models`: 허용 목록에 원하는 모델의 별칭 지정.
- `models.mode`: 내장 모델과 함께 MiniMax를 추가하려면 `merge`로 유지.

## 참고 사항

- 모델 참조는 인증 경로를 따릅니다:
  - API 키 설정: `minimax/<model>`
  - OAuth 설정: `minimax-portal/<model>`
- 기본 채팅 모델: `MiniMax-M2.7`
- 대체 채팅 모델: `MiniMax-M2.7-highspeed`
- `api: "anthropic-messages"`에서 OpenClaw는 파라미터/구성에서 이미 명시적으로 설정되지 않은 한 `thinking: { type: "disabled" }`를 주입합니다.
- `/fast on` 또는 `params.fastMode: true`는 Anthropic 호환 스트림 경로에서 `MiniMax-M2.7`을 `MiniMax-M2.7-highspeed`로 재작성합니다.
- 온보딩 및 직접 API 키 설정은 두 M2.7 변형 모두에 대해 `input: ["text", "image"]`로 명시적 모델 정의를 작성합니다
- 번들 프로바이더 카탈로그는 명시적 MiniMax 프로바이더 구성이 존재할 때까지 채팅 참조를 텍스트 전용 메타데이터로 노출합니다
- Coding Plan 사용량 API: `https://api.minimaxi.com/v1/api/openplatform/coding_plan/remains` (coding plan 키 필요).
- OpenClaw는 MiniMax coding-plan 사용량을 다른 프로바이더에서 사용하는 것과 동일한 `% left` 표시로 정규화합니다. MiniMax의 원시 `usage_percent` / `usagePercent` 필드는 소비된 할당량이 아닌 남은 할당량이므로 OpenClaw는 이를 반전합니다. 카운트 기반 필드가 있으면 우선합니다. API가 `model_remains`를 반환하면 OpenClaw는 채팅 모델 항목을 선호하고, 필요한 경우 `start_time` / `end_time`에서 창 레이블을 유도하며, 코딩 플랜 창을 더 쉽게 구별할 수 있도록 플랜 레이블에 선택된 모델 이름을 포함합니다.
- 사용량 스냅샷은 `minimax`, `minimax-cn`, `minimax-portal`을 동일한 MiniMax 할당량 표면으로 처리하고, Coding Plan 키 환경 변수로 폴백하기 전에 저장된 MiniMax OAuth를 선호합니다.
- 정확한 비용 추적이 필요한 경우 `models.json`에서 가격 값을 업데이트하십시오.
- MiniMax Coding Plan 추천 링크 (10% 할인): [https://platform.minimax.io/subscribe/coding-plan?code=DbXJTRClnb&source=link](https://platform.minimax.io/subscribe/coding-plan?code=DbXJTRClnb&source=link)
- 프로바이더 규칙은 [/concepts/model-providers](/concepts/model-providers)를 참조하십시오.
- `openclaw models list`를 사용하여 현재 프로바이더 id를 확인한 후 `openclaw models set minimax/MiniMax-M2.7` 또는 `openclaw models set minimax-portal/MiniMax-M2.7`로 전환하십시오.

## 문제 해결

### "Unknown model: minimax/MiniMax-M2.7"

이는 일반적으로 **MiniMax 프로바이더가 구성되지 않음**(일치하는 프로바이더 항목이 없고 MiniMax 인증 프로필/환경 키를 찾을 수 없음)을 의미합니다. 이 감지에 대한 수정은 **2026.1.12**에 있습니다. 다음으로 수정하십시오:

- **2026.1.12** (또는 소스 `main`에서 실행)로 업그레이드한 후 게이트웨이를 재시작하십시오.
- `openclaw configure`를 실행하고 **MiniMax** 인증 옵션을 선택하거나,
- 일치하는 `models.providers.minimax` 또는 `models.providers.minimax-portal` 블록을 수동으로 추가하거나,
- 일치하는 프로바이더가 주입될 수 있도록 `MINIMAX_API_KEY`, `MINIMAX_OAUTH_TOKEN` 또는 MiniMax 인증 프로필을 설정하십시오.

모델 id는 **대소문자를 구분**합니다:

- API 키 경로: `minimax/MiniMax-M2.7` 또는 `minimax/MiniMax-M2.7-highspeed`
- OAuth 경로: `minimax-portal/MiniMax-M2.7` 또는 `minimax-portal/MiniMax-M2.7-highspeed`

그런 다음 다음으로 다시 확인하십시오:

```bash
openclaw models list
```
