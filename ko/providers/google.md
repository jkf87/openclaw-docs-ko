---
summary: "Google Gemini 설정 (API 키 + OAuth, 이미지 생성, 미디어 이해, TTS, 웹 검색)"
title: "Google (Gemini)"
read_when:
  - Google Gemini 모델을 OpenClaw에서 사용하고 싶을 때
  - API 키 또는 OAuth 인증 흐름이 필요할 때
---

Google 플러그인은 Google AI Studio를 통해 Gemini 모델에 접근할 수 있게 해주며,
이미지 생성, 미디어 이해(이미지/오디오/비디오), 텍스트-투-스피치(TTS),
Gemini Grounding을 통한 웹 검색을 제공합니다.

- Provider: `google`
- 인증: `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`
- API: Google Gemini API
- 대체 Provider: `google-gemini-cli` (OAuth)

## 시작하기

선호하는 인증 방식을 선택하고 설정 단계를 따라 진행하세요.

<Tabs>
  <Tab title="API 키">
    **적합한 경우:** Google AI Studio를 통한 표준 Gemini API 접근.

    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice gemini-api-key
        ```

        또는 키를 직접 전달하세요:

        ```bash
        openclaw onboard --non-interactive \
          --mode local \
          --auth-choice gemini-api-key \
          --gemini-api-key "$GEMINI_API_KEY"
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "google/gemini-3.1-pro-preview" },
            },
          },
        }
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider google
        ```
      </Step>
    </Steps>

    <Tip>
    환경 변수 `GEMINI_API_KEY`와 `GOOGLE_API_KEY`는 둘 다 허용됩니다. 이미 설정되어 있는 것을 사용하세요.
    </Tip>

  </Tab>

  <Tab title="Gemini CLI (OAuth)">
    **적합한 경우:** 별도의 API 키 대신 기존 Gemini CLI 로그인(PKCE OAuth)을 재사용하려는 경우.

    <Warning>
    `google-gemini-cli` Provider는 비공식 통합입니다. 일부 사용자는 이 방식으로 OAuth를 사용할 때
    계정 제한을 보고합니다. 사용은 본인의 책임하에 이뤄집니다.
    </Warning>

    <Steps>
      <Step title="Gemini CLI 설치">
        로컬 `gemini` 명령이 `PATH`에 있어야 합니다.

        ```bash
        # Homebrew
        brew install gemini-cli

        # 또는 npm
        npm install -g @google/gemini-cli
        ```

        OpenClaw는 Homebrew 설치와 전역 npm 설치를 모두 지원하며, 일반적인
        Windows/npm 레이아웃도 지원합니다.
      </Step>
      <Step title="OAuth로 로그인">
        ```bash
        openclaw models auth login --provider google-gemini-cli --set-default
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider google-gemini-cli
        ```
      </Step>
    </Steps>

    - 기본 모델: `google-gemini-cli/gemini-3-flash-preview`
    - 별칭: `gemini-cli`

    **환경 변수:**

    - `OPENCLAW_GEMINI_OAUTH_CLIENT_ID`
    - `OPENCLAW_GEMINI_OAUTH_CLIENT_SECRET`

    (또는 `GEMINI_CLI_*` 변형도 사용 가능합니다.)

    <Note>
    로그인 후 Gemini CLI OAuth 요청이 실패하는 경우, 게이트웨이 호스트에 `GOOGLE_CLOUD_PROJECT` 또는
    `GOOGLE_CLOUD_PROJECT_ID`를 설정하고 다시 시도하세요.
    </Note>

    <Note>
    브라우저 플로우가 시작되기 전에 로그인이 실패하는 경우, 로컬 `gemini`
    명령이 설치되어 있고 `PATH`에 있는지 확인하세요.
    </Note>

    OAuth 전용 `google-gemini-cli` Provider는 별도의 텍스트 추론
    표면입니다. 이미지 생성, 미디어 이해, Gemini Grounding은 `google` Provider
    ID에 그대로 남아있습니다.

  </Tab>
</Tabs>

## 지원 기능

| 기능                     | 지원 여부                      |
| ------------------------ | ------------------------------ |
| 채팅 완성                | 예                             |
| 이미지 생성              | 예                             |
| 음악 생성                | 예                             |
| 텍스트-투-스피치         | 예                             |
| 이미지 이해              | 예                             |
| 오디오 전사(Transcription) | 예                             |
| 비디오 이해              | 예                             |
| 웹 검색(Grounding)       | 예                             |
| Thinking/추론            | 예 (Gemini 2.5+ / Gemini 3+)   |
| Gemma 4 모델             | 예                             |

<Tip>
Gemini 3 모델은 `thinkingBudget` 대신 `thinkingLevel`을 사용합니다. OpenClaw는
Gemini 3, Gemini 3.1, `gemini-*-latest` 별칭의 추론 컨트롤을
`thinkingLevel`로 매핑하여 기본/저지연 실행에서 비활성화된
`thinkingBudget` 값을 전송하지 않도록 합니다.

Gemma 4 모델(예: `gemma-4-26b-a4b-it`)은 thinking 모드를 지원합니다. OpenClaw는
Gemma 4에 대해 `thinkingBudget`을 지원되는 Google `thinkingLevel`로 재작성합니다.
thinking을 `off`로 설정하면 `MINIMAL`로 매핑하는 대신 thinking 비활성화 상태를 유지합니다.
</Tip>

## 이미지 생성

번들된 `google` 이미지 생성 Provider는 기본적으로
`google/gemini-3.1-flash-image-preview`를 사용합니다.

- `google/gemini-3-pro-image-preview`도 지원
- 생성: 요청당 최대 4장의 이미지
- 편집 모드: 활성화됨, 최대 5개의 입력 이미지
- 기하학적 컨트롤: `size`, `aspectRatio`, `resolution`

Google을 기본 이미지 Provider로 사용하려면:

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

<Note>
공유 도구 파라미터, Provider 선택, 페일오버 동작에 대해서는 [이미지 생성](/tools/image-generation)을 참고하세요.
</Note>

## 비디오 생성

번들된 `google` 플러그인은 공유 `video_generate` 도구를 통해 비디오 생성도 등록합니다.

- 기본 비디오 모델: `google/veo-3.1-fast-generate-preview`
- 모드: 텍스트-투-비디오, 이미지-투-비디오, 단일 비디오 참조 플로우
- `aspectRatio`, `resolution`, `audio` 지원
- 현재 재생 시간 범위: **4초 ~ 8초**

Google을 기본 비디오 Provider로 사용하려면:

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

<Note>
공유 도구 파라미터, Provider 선택, 페일오버 동작에 대해서는 [비디오 생성](/tools/video-generation)을 참고하세요.
</Note>

## 음악 생성

번들된 `google` 플러그인은 공유 `music_generate` 도구를 통해 음악 생성도 등록합니다.

- 기본 음악 모델: `google/lyria-3-clip-preview`
- `google/lyria-3-pro-preview`도 지원
- 프롬프트 컨트롤: `lyrics`, `instrumental`
- 출력 포맷: 기본 `mp3`, `google/lyria-3-pro-preview`에서는 `wav`도 지원
- 참조 입력: 최대 10장의 이미지
- 세션 기반 실행은 `action: "status"`를 포함한 공유 task/status 플로우를 통해 분리됩니다

Google을 기본 음악 Provider로 사용하려면:

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

<Note>
공유 도구 파라미터, Provider 선택, 페일오버 동작에 대해서는 [음악 생성](/tools/music-generation)을 참고하세요.
</Note>

## 텍스트-투-스피치

번들된 `google` 음성 Provider는 Gemini API TTS 경로를 사용하며
`gemini-3.1-flash-tts-preview`를 사용합니다.

- 기본 음성: `Kore`
- 인증: `messages.tts.providers.google.apiKey`, `models.providers.google.apiKey`, `GEMINI_API_KEY`, 또는 `GOOGLE_API_KEY`
- 출력: 일반 TTS 첨부에는 WAV, Talk/전화 연결에는 PCM
- 네이티브 음성 메모 출력: Gemini API가 Opus 대신 PCM을 반환하기 때문에 이 Gemini API 경로에서는 지원되지 않습니다

Google을 기본 TTS Provider로 사용하려면:

```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "google",
      providers: {
        google: {
          model: "gemini-3.1-flash-tts-preview",
          voiceName: "Kore",
        },
      },
    },
  },
}
```

Gemini API TTS는 `[whispers]` 또는 `[laughs]`와 같이
텍스트 안에 표현적 대괄호 오디오 태그를 받아들입니다. 태그를 실제 채팅 응답에 보이지 않게 하면서
TTS로만 전송하려면, `[[tts:text]]...[[/tts:text]]` 블록 안에 넣으세요:

```text
Here is the clean reply text.

[[tts:text]][whispers] Here is the spoken version.[[/tts:text]]
```

<Note>
Gemini API로 제한된 Google Cloud Console API 키는 이 Provider에 유효합니다.
이것은 별도의 Cloud Text-to-Speech API 경로가 아닙니다.
</Note>

## 고급 설정

<AccordionGroup>
  <Accordion title="Gemini 캐시 직접 재사용">
    직접 Gemini API 실행(`api: "google-generative-ai"`)의 경우, OpenClaw는
    설정된 `cachedContent` 핸들을 Gemini 요청으로 전달합니다.

    - 모델별 또는 전역 파라미터를 `cachedContent` 또는 레거시 `cached_content`로 설정
    - 두 값이 모두 있는 경우 `cachedContent`가 우선
    - 예시 값: `cachedContents/prebuilt-context`
    - Gemini 캐시 히트 사용량은 업스트림 `cachedContentTokenCount`에서 OpenClaw `cacheRead`로 정규화됩니다

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

  </Accordion>

  <Accordion title="Gemini CLI JSON 사용 참고 사항">
    `google-gemini-cli` OAuth Provider를 사용할 때, OpenClaw는
    CLI JSON 출력을 다음과 같이 정규화합니다:

    - 응답 텍스트는 CLI JSON `response` 필드에서 가져옵니다.
    - CLI가 `usage`를 비워두면 `stats`로 폴백합니다.
    - `stats.cached`는 OpenClaw `cacheRead`로 정규화됩니다.
    - `stats.input`이 없으면, OpenClaw는 입력 토큰을
      `stats.input_tokens - stats.cached`에서 도출합니다.

  </Accordion>

  <Accordion title="환경 및 데몬 설정">
    게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우, `GEMINI_API_KEY`가
    해당 프로세스에서 사용 가능한지 확인하세요(예: `~/.openclaw/.env` 또는
    `env.shellEnv`를 통해).
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    Provider, 모델 참조, 페일오버 동작 선택 가이드.
  </Card>
  <Card title="이미지 생성" href="/tools/image-generation" icon="image">
    공유 이미지 도구 파라미터와 Provider 선택.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    공유 비디오 도구 파라미터와 Provider 선택.
  </Card>
  <Card title="음악 생성" href="/tools/music-generation" icon="music">
    공유 음악 도구 파라미터와 Provider 선택.
  </Card>
</CardGroup>
