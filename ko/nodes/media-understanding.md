---
summary: "프로바이더 + CLI 폴백을 사용한 수신 이미지/오디오/비디오 이해 (선택 사항)"
read_when:
  - Designing or refactoring media understanding
  - Tuning inbound audio/video/image preprocessing
title: "미디어 이해"
---

# 미디어 이해 - 수신 (2026-01-17)

OpenClaw는 답변 파이프라인이 실행되기 전에 수신 미디어(이미지/오디오/비디오)를 **요약**할 수 있습니다. 로컬 도구나 프로바이더 키가 사용 가능한 경우 자동으로 감지되며, 비활성화하거나 사용자 정의할 수 있습니다. 이해가 꺼진 경우에도 모델은 여전히 원본 파일/URL을 수신합니다.

벤더별 미디어 동작은 벤더 플러그인에 의해 등록되며, OpenClaw
코어는 공유 `tools.media` 구성, 폴백 순서, 답변 파이프라인 통합을 소유합니다.

## 목표

- 선택 사항: 더 빠른 라우팅 + 더 나은 명령 파싱을 위해 수신 미디어를 짧은 텍스트로 사전 소화합니다.
- 모델에 대한 원본 미디어 전달 보존 (항상).
- **프로바이더 API** 및 **CLI 폴백** 지원.
- 순서가 있는 폴백(오류/크기/타임아웃)을 가진 여러 모델 허용.

## 고수준 동작

1. 수신 첨부 파일(`MediaPaths`, `MediaUrls`, `MediaTypes`)을 수집합니다.
2. 각 활성화된 기능(이미지/오디오/비디오)에 대해 정책에 따라 첨부 파일을 선택합니다 (기본값: **첫 번째**).
3. 첫 번째 적합한 모델 항목(크기 + 기능 + 인증)을 선택합니다.
4. 모델이 실패하거나 미디어가 너무 큰 경우 **다음 항목으로 폴백**합니다.
5. 성공 시:
   - `Body`가 `[Image]`, `[Audio]`, 또는 `[Video]` 블록이 됩니다.
   - 오디오는 `{{Transcript}}`를 설정합니다. 캡션 텍스트가 있는 경우 명령 파싱은 캡션 텍스트를 사용하고, 그렇지 않으면 전사 내용을 사용합니다.
   - 캡션은 블록 내에 `User text:`로 보존됩니다.

이해가 실패하거나 비활성화된 경우 **답변 흐름은 원본 본문 + 첨부 파일로 계속됩니다**.

## 설정 개요

`tools.media`는 **공유 모델** 및 기능별 재정의를 지원합니다:

- `tools.media.models`: 공유 모델 목록 (게이팅을 위해 `capabilities` 사용).
- `tools.media.image` / `tools.media.audio` / `tools.media.video`:
  - 기본값(`prompt`, `maxChars`, `maxBytes`, `timeoutSeconds`, `language`)
  - 프로바이더 재정의(`baseUrl`, `headers`, `providerOptions`)
  - `tools.media.audio.providerOptions.deepgram`을 통한 Deepgram 오디오 옵션
  - 오디오 전사 에코 컨트롤(`echoTranscript`, 기본값 `false`; `echoFormat`)
  - 선택적 **기능별 `models` 목록** (공유 모델보다 선호)
  - `attachments` 정책(`mode`, `maxAttachments`, `prefer`)
  - `scope` (채널/chatType/세션 키에 의한 선택적 게이팅)
- `tools.media.concurrency`: 최대 동시 기능 실행 (기본값 **2**).

```json5
{
  tools: {
    media: {
      models: [
        /* 공유 목록 */
      ],
      image: {
        /* 선택적 재정의 */
      },
      audio: {
        /* 선택적 재정의 */
        echoTranscript: true,
        echoFormat: '📝 "{transcript}"',
      },
      video: {
        /* 선택적 재정의 */
      },
    },
  },
}
```

### 모델 항목

각 `models[]` 항목은 **프로바이더** 또는 **CLI**일 수 있습니다:

```json5
{
  type: "provider", // 생략된 경우 기본값
  provider: "openai",
  model: "gpt-5.4-mini",
  prompt: "Describe the image in <= 500 chars.",
  maxChars: 500,
  maxBytes: 10485760,
  timeoutSeconds: 60,
  capabilities: ["image"], // 선택 사항, 멀티모달 항목에 사용
  profile: "vision-profile",
  preferredProfile: "vision-fallback",
}
```

```json5
{
  type: "cli",
  command: "gemini",
  args: [
    "-m",
    "gemini-3-flash",
    "--allowed-tools",
    "read_file",
    "Read the media at {{MediaPath}} and describe it in <= {{MaxChars}} characters.",
  ],
  maxChars: 500,
  maxBytes: 52428800,
  timeoutSeconds: 120,
  capabilities: ["video", "image"],
}
```

CLI 템플릿은 다음을 사용할 수도 있습니다:

- `{{MediaDir}}` (미디어 파일이 포함된 디렉토리)
- `{{OutputDir}}` (이 실행을 위해 생성된 스크래치 디렉토리)
- `{{OutputBase}}` (확장자 없는 스크래치 파일 기본 경로)

## 기본값 및 제한 사항

권장 기본값:

- `maxChars`: 이미지/비디오의 경우 **500** (짧고 명령 친화적)
- `maxChars`: 오디오의 경우 **미설정** (제한을 설정하지 않는 한 전체 전사)
- `maxBytes`:
  - 이미지: **10MB**
  - 오디오: **20MB**
  - 비디오: **50MB**

규칙:

- 미디어가 `maxBytes`를 초과하면 해당 모델을 건너뛰고 **다음 모델을 시도합니다**.
- **1024바이트** 미만의 오디오 파일은 프로바이더/CLI 전사 전에 비어 있거나 손상된 것으로 처리됩니다.
- 모델이 `maxChars`보다 많이 반환하면 출력이 트리밍됩니다.
- `prompt`는 기본적으로 단순한 "{media}를 설명하세요."와 `maxChars` 안내로 설정됩니다 (이미지/비디오만).
- 활성 기본 이미지 모델이 이미 기본적으로 비전을 지원하는 경우, OpenClaw는 `[Image]` 요약 블록을 건너뛰고 원본 이미지를 모델에 직접 전달합니다.
- `<capability>.enabled: true`이지만 모델이 구성되지 않은 경우, OpenClaw는 프로바이더가 기능을 지원하는 경우 **활성 답변 모델**을 시도합니다.

### 미디어 이해 자동 감지 (기본값)

`tools.media.<capability>.enabled`가 `false`로 설정되지 않고 모델을 구성하지 않은 경우,
OpenClaw는 다음 순서로 자동 감지를 수행하며 **첫 번째 작동하는 옵션에서 중단합니다**:

1. 프로바이더가 기능을 지원하는 경우의 **활성 답변 모델**.
2. **`agents.defaults.imageModel`** 기본/폴백 참조 (이미지만).
3. **로컬 CLI** (오디오만; 설치된 경우)
   - `sherpa-onnx-offline` (`SHERPA_ONNX_MODEL_DIR`에 encoder/decoder/joiner/tokens 필요)
   - `whisper-cli` (`whisper-cpp`; `WHISPER_CPP_MODEL` 또는 내장 tiny 모델 사용)
   - `whisper` (Python CLI; 모델 자동 다운로드)
4. `read_many_files`를 사용하는 **Gemini CLI** (`gemini`)
5. **프로바이더 인증**
   - 기능을 지원하는 구성된 `models.providers.*` 항목이 내장 폴백 순서 전에 시도됩니다.
   - 이미지 지원 모델이 있는 이미지 전용 구성 프로바이더는 내장 벤더 플러그인이 아닌 경우에도 미디어 이해를 위해 자동 등록됩니다.
   - 내장 폴백 순서:
     - 오디오: OpenAI → Groq → Deepgram → Google → Mistral
     - 이미지: OpenAI → Anthropic → Google → MiniMax → MiniMax Portal → Z.AI
     - 비디오: Google → Qwen → Moonshot

자동 감지를 비활성화하려면 다음을 설정하십시오:

```json5
{
  tools: {
    media: {
      audio: {
        enabled: false,
      },
    },
  },
}
```

참고: 이진 감지는 macOS/Linux/Windows 전반에서 최선 방식으로 작동합니다. CLI가 `PATH`에 있는지 확인하십시오 (`~`를 확장합니다). 또는 전체 명령 경로가 포함된 명시적 CLI 모델을 설정하십시오.

### 프록시 환경 지원 (프로바이더 모델)

프로바이더 기반 **오디오** 및 **비디오** 미디어 이해가 활성화된 경우, OpenClaw는 프로바이더 HTTP 호출에 대한 표준 아웃바운드 프록시 환경 변수를 준수합니다:

- `HTTPS_PROXY`
- `HTTP_PROXY`
- `https_proxy`
- `http_proxy`

프록시 환경 변수가 설정되지 않으면 미디어 이해는 직접 송신을 사용합니다.
프록시 값이 잘못된 경우 OpenClaw는 경고를 기록하고 직접 가져오기로 폴백합니다.

## 기능 (선택 사항)

`capabilities`를 설정하면 항목이 해당 미디어 유형에 대해서만 실행됩니다. 공유 목록의 경우 OpenClaw는 기본값을 추론할 수 있습니다:

- `openai`, `anthropic`, `minimax`: **image**
- `minimax-portal`: **image**
- `moonshot`: **image + video**
- `openrouter`: **image**
- `google` (Gemini API): **image + audio + video**
- `qwen`: **image + video**
- `mistral`: **audio**
- `zai`: **image**
- `groq`: **audio**
- `deepgram`: **audio**
- 이미지 지원 모델이 있는 `models.providers.<id>.models[]` 카탈로그:
  **image**

CLI 항목의 경우, 예상치 못한 일치를 방지하기 위해 **`capabilities`를 명시적으로 설정하십시오**.
`capabilities`를 생략하면 해당 항목이 포함된 목록에 적합합니다.

## 프로바이더 지원 매트릭스 (OpenClaw 통합)

| 기능 | 프로바이더 통합                                                                    | 참고                                                                                                                                    |
| ---- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 이미지 | OpenAI, OpenRouter, Anthropic, Google, MiniMax, Moonshot, Qwen, Z.AI, 구성 프로바이더 | 벤더 플러그인이 이미지 지원 등록; MiniMax와 MiniMax OAuth 모두 `MiniMax-VL-01` 사용; 이미지 지원 구성 프로바이더 자동 등록. |
| 오디오 | OpenAI, Groq, Deepgram, Google, Mistral                                            | 프로바이더 전사 (Whisper/Deepgram/Gemini/Voxtral).                                                                                      |
| 비디오 | Google, Qwen, Moonshot                                                              | 벤더 플러그인을 통한 프로바이더 비디오 이해; Qwen 비디오 이해는 표준 DashScope 엔드포인트 사용.                                         |

MiniMax 참고:

- `minimax`와 `minimax-portal` 이미지 이해는 플러그인 소유
  `MiniMax-VL-01` 미디어 프로바이더에서 제공됩니다.
- 내장 MiniMax 텍스트 카탈로그는 여전히 텍스트 전용으로 시작합니다. 명시적
  `models.providers.minimax` 항목은 이미지 지원 M2.7 채팅 참조를 구체화합니다.

## 모델 선택 지침

- 품질과 안전성이 중요한 경우 각 미디어 기능에 사용 가능한 가장 강력한 최신 세대 모델을 선호하십시오.
- 신뢰할 수 없는 입력을 처리하는 도구 지원 에이전트의 경우 오래되거나 약한 미디어 모델을 피하십시오.
- 가용성을 위해 기능당 최소 하나의 폴백을 유지하십시오 (품질 모델 + 더 빠르고 저렴한 모델).
- CLI 폴백(`whisper-cli`, `whisper`, `gemini`)은 프로바이더 API를 사용할 수 없을 때 유용합니다.
- `parakeet-mlx` 참고: `--output-dir` 사용 시, 출력 형식이 `txt` (또는 미지정)인 경우 OpenClaw는 `<output-dir>/<media-basename>.txt`를 읽습니다. `txt` 이외의 형식은 stdout으로 폴백합니다.

## 첨부 파일 정책

기능별 `attachments`는 처리할 첨부 파일을 제어합니다:

- `mode`: `first` (기본값) 또는 `all`
- `maxAttachments`: 처리되는 수 제한 (기본값 **1**)
- `prefer`: `first`, `last`, `path`, `url`

`mode: "all"`인 경우 출력은 `[Image 1/2]`, `[Audio 2/2]` 등으로 레이블됩니다.

파일 첨부 파일 추출 동작:

- 추출된 파일 텍스트는 미디어 프롬프트에 추가되기 전에 **신뢰할 수 없는 외부 콘텐츠**로 래핑됩니다.
- 삽입된 블록은 `<<<EXTERNAL_UNTRUSTED_CONTENT id="...">>>` /
  `<<<END_EXTERNAL_UNTRUSTED_CONTENT id="...">>>`와 같은 명시적 경계 마커와
  `Source: External` 메타데이터 줄을 사용합니다.
- 이 첨부 파일 추출 경로는 미디어 프롬프트 비대화를 방지하기 위해 긴
  `SECURITY NOTICE:` 배너를 의도적으로 생략합니다. 경계 마커와 메타데이터는 여전히 유지됩니다.
- 파일에 추출 가능한 텍스트가 없으면 OpenClaw는 `[No extractable text]`를 삽입합니다.
- PDF가 이 경로에서 렌더링된 페이지 이미지로 폴백하는 경우, 미디어 프롬프트는
  `[PDF content rendered to images; images not forwarded to model]` 플레이스홀더를 유지합니다.
  이 첨부 파일 추출 단계는 렌더링된 PDF 이미지가 아닌 텍스트 블록을 전달하기 때문입니다.

## 설정 예시

### 1) 공유 모델 목록 + 재정의

```json5
{
  tools: {
    media: {
      models: [
        { provider: "openai", model: "gpt-5.4-mini", capabilities: ["image"] },
        {
          provider: "google",
          model: "gemini-3-flash-preview",
          capabilities: ["image", "audio", "video"],
        },
        {
          type: "cli",
          command: "gemini",
          args: [
            "-m",
            "gemini-3-flash",
            "--allowed-tools",
            "read_file",
            "Read the media at {{MediaPath}} and describe it in <= {{MaxChars}} characters.",
          ],
          capabilities: ["image", "video"],
        },
      ],
      audio: {
        attachments: { mode: "all", maxAttachments: 2 },
      },
      video: {
        maxChars: 500,
      },
    },
  },
}
```

### 2) 오디오 + 비디오만 (이미지 꺼짐)

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" },
          {
            type: "cli",
            command: "whisper",
            args: ["--model", "base", "{{MediaPath}}"],
          },
        ],
      },
      video: {
        enabled: true,
        maxChars: 500,
        models: [
          { provider: "google", model: "gemini-3-flash-preview" },
          {
            type: "cli",
            command: "gemini",
            args: [
              "-m",
              "gemini-3-flash",
              "--allowed-tools",
              "read_file",
              "Read the media at {{MediaPath}} and describe it in <= {{MaxChars}} characters.",
            ],
          },
        ],
      },
    },
  },
}
```

### 3) 선택적 이미지 이해

```json5
{
  tools: {
    media: {
      image: {
        enabled: true,
        maxBytes: 10485760,
        maxChars: 500,
        models: [
          { provider: "openai", model: "gpt-5.4-mini" },
          { provider: "anthropic", model: "claude-opus-4-6" },
          {
            type: "cli",
            command: "gemini",
            args: [
              "-m",
              "gemini-3-flash",
              "--allowed-tools",
              "read_file",
              "Read the media at {{MediaPath}} and describe it in <= {{MaxChars}} characters.",
            ],
          },
        ],
      },
    },
  },
}
```

### 4) 멀티모달 단일 항목 (명시적 기능)

```json5
{
  tools: {
    media: {
      image: {
        models: [
          {
            provider: "google",
            model: "gemini-3.1-pro-preview",
            capabilities: ["image", "video", "audio"],
          },
        ],
      },
      audio: {
        models: [
          {
            provider: "google",
            model: "gemini-3.1-pro-preview",
            capabilities: ["image", "video", "audio"],
          },
        ],
      },
      video: {
        models: [
          {
            provider: "google",
            model: "gemini-3.1-pro-preview",
            capabilities: ["image", "video", "audio"],
          },
        ],
      },
    },
  },
}
```

## 상태 출력

미디어 이해가 실행되면 `/status`에 짧은 요약 줄이 포함됩니다:

```
📎 Media: image ok (openai/gpt-5.4-mini) · audio skipped (maxBytes)
```

해당 기능별 결과와 적용 가능한 경우 선택된 프로바이더/모델이 표시됩니다.

## 참고 사항

- 이해는 **최선 방식**입니다. 오류가 답변을 차단하지 않습니다.
- 이해가 비활성화된 경우에도 첨부 파일은 모델에 전달됩니다.
- `scope`를 사용하여 이해가 실행되는 위치를 제한하십시오 (예: DM만).

## 관련 문서

- [구성](/gateway/configuration)
- [이미지 및 미디어 지원](/nodes/images)
