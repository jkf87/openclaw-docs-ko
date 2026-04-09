---
title: "Google (Gemini)"
description: "Google Gemini 설정 (API 키 + OAuth, 이미지 생성, 미디어 이해, 웹 검색)"
---

# Google (Gemini)

Google 플러그인은 Google AI Studio를 통한 Gemini 모델 액세스, 이미지 생성, 미디어 이해(이미지/오디오/동영상), Gemini Grounding을 통한 웹 검색을 제공합니다.

- 프로바이더: `google`
- 인증: `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`
- API: Google Gemini API
- 대체 프로바이더: `google-gemini-cli` (OAuth)

## 빠른 시작

1. API 키 설정:

```bash
openclaw onboard --auth-choice gemini-api-key
```

2. 기본 모델 설정:

```json5
{
  agents: {
    defaults: {
      model: { primary: "google/gemini-3.1-pro-preview" },
    },
  },
}
```

## 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice gemini-api-key \
  --gemini-api-key "$GEMINI_API_KEY"
```

## OAuth (Gemini CLI)

대체 프로바이더 `google-gemini-cli`는 API 키 대신 PKCE OAuth를 사용합니다. 이는 비공식 통합입니다; 일부 사용자는 계정 제한을 보고합니다. 본인 책임 하에 사용하십시오.

- 기본 모델: `google-gemini-cli/gemini-3-flash-preview`
- 별칭: `gemini-cli`
- 설치 전제 조건: `gemini`으로 사용 가능한 로컬 Gemini CLI
  - Homebrew: `brew install gemini-cli`
  - npm: `npm install -g @google/gemini-cli`
- 로그인:

```bash
openclaw models auth login --provider google-gemini-cli --set-default
```

환경 변수:

- `OPENCLAW_GEMINI_OAUTH_CLIENT_ID`
- `OPENCLAW_GEMINI_OAUTH_CLIENT_SECRET`

(또는 `GEMINI_CLI_*` 변형.)

로그인 후 Gemini CLI OAuth 요청이 실패하면, 게이트웨이 호스트에 `GOOGLE_CLOUD_PROJECT` 또는 `GOOGLE_CLOUD_PROJECT_ID`를 설정하고 다시 시도하십시오.

브라우저 흐름 시작 전에 로그인이 실패하면, 로컬 `gemini` 명령이 설치되어 `PATH`에 있는지 확인하십시오. OpenClaw는 Homebrew 설치와 글로벌 npm 설치를 모두 지원하며, 일반적인 Windows/npm 레이아웃도 포함합니다.

Gemini CLI JSON 사용 참고 사항:

- 응답 텍스트는 CLI JSON `response` 필드에서 가져옵니다.
- CLI가 `usage`를 비워두면 사용량이 `stats`로 폴백됩니다.
- `stats.cached`는 OpenClaw `cacheRead`로 정규화됩니다.
- `stats.input`이 없으면 OpenClaw는 `stats.input_tokens - stats.cached`에서 입력 토큰을 유도합니다.

## 기능

| 기능                    | 지원             |
| ----------------------- | ---------------- |
| 채팅 완성               | 예               |
| 이미지 생성             | 예               |
| 음악 생성               | 예               |
| 이미지 이해             | 예               |
| 오디오 전사             | 예               |
| 동영상 이해             | 예               |
| 웹 검색 (Grounding)     | 예               |
| 사고/추론               | 예 (Gemini 3.1+) |
| Gemma 4 모델            | 예               |

Gemma 4 모델(예: `gemma-4-26b-a4b-it`)은 사고 모드를 지원합니다. OpenClaw는 Gemma 4에 대해 `thinkingBudget`을 지원되는 Google `thinkingLevel`로 재작성합니다. 사고를 `off`로 설정하면 `MINIMAL`로 매핑하는 대신 사고가 비활성화됩니다.

## 직접 Gemini 캐시 재사용

직접 Gemini API 실행(`api: "google-generative-ai"`)의 경우, OpenClaw는 이제 구성된 `cachedContent` 핸들을 Gemini 요청에 전달합니다.

- 모델별 또는 전역 파라미터에서 `cachedContent` 또는 레거시 `cached_content`로 구성
- 둘 다 있으면 `cachedContent`가 우선
- 예시 값: `cachedContents/prebuilt-context`
- Gemini 캐시 히트 사용량은 업스트림 `cachedContentTokenCount`에서 OpenClaw `cacheRead`로 정규화됩니다

예시:

```json5
{
  agents: {
    defaults: {
      models: {
        "google/gemini-2.5-pro": {
          params: {
            cachedContent: "cachedContents/prebuilt-context",
          },
        },
      },
    },
  },
}
```

## 이미지 생성

번들 `google` 이미지 생성 프로바이더는 기본적으로
`google/gemini-3.1-flash-image-preview`를 사용합니다.

- `google/gemini-3-pro-image-preview`도 지원
- 생성: 요청당 최대 4개 이미지
- 편집 모드: 활성화, 최대 5개 입력 이미지
- 기하학적 제어: `size`, `aspectRatio`, `resolution`

OAuth 전용 `google-gemini-cli` 프로바이더는 별도의 텍스트 추론 인터페이스입니다. 이미지 생성, 미디어 이해, Gemini Grounding은 `google` 프로바이더 id에서 처리됩니다.

Google을 기본 이미지 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "google/gemini-3.1-flash-image-preview",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택, 장애 조치 동작은 [이미지 생성](/tools/image-generation)을 참조하십시오.

## 동영상 생성

번들 `google` 플러그인도 공유 `video_generate` 도구를 통해 동영상 생성을 등록합니다.

- 기본 동영상 모델: `google/veo-3.1-fast-generate-preview`
- 모드: 텍스트-동영상, 이미지-동영상, 단일 동영상 참조 흐름
- `aspectRatio`, `resolution`, `audio` 지원
- 현재 길이 제한: **4~8초**

Google을 기본 동영상 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "google/veo-3.1-fast-generate-preview",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택, 장애 조치 동작은 [동영상 생성](/tools/video-generation)을 참조하십시오.

## 음악 생성

번들 `google` 플러그인도 공유 `music_generate` 도구를 통해 음악 생성을 등록합니다.

- 기본 음악 모델: `google/lyria-3-clip-preview`
- `google/lyria-3-pro-preview`도 지원
- 프롬프트 제어: `lyrics` 및 `instrumental`
- 출력 형식: 기본적으로 `mp3`, `google/lyria-3-pro-preview`에서 `wav` 추가
- 참조 입력: 최대 10개 이미지
- 세션 기반 실행은 `action: "status"`를 포함한 공유 태스크/상태 흐름을 통해 분리됩니다

Google을 기본 음악 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      musicGenerationModel: {
        primary: "google/lyria-3-clip-preview",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택, 장애 조치 동작은 [음악 생성](/tools/music-generation)을 참조하십시오.

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우, `GEMINI_API_KEY`가 해당 프로세스에서 사용 가능한지 확인하십시오 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).
