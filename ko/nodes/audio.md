---
summary: "수신 오디오/보이스 노트가 다운로드, 전사, 답변에 삽입되는 방식"
read_when:
  - Changing audio transcription or media handling
title: "오디오 및 보이스 노트"
---

# 오디오 / 보이스 노트 (2026-01-17)

## 작동 기능

- **미디어 이해 (오디오)**: 오디오 이해가 활성화되어 있거나 자동 감지된 경우, OpenClaw는 다음을 수행합니다:
  1. 첫 번째 오디오 첨부 파일(로컬 경로 또는 URL)을 찾아 필요 시 다운로드합니다.
  2. 각 모델 항목에 전송하기 전에 `maxBytes`를 확인합니다.
  3. 순서대로 첫 번째 적합한 모델 항목(프로바이더 또는 CLI)을 실행합니다.
  4. 실패하거나 건너뜀(크기/타임아웃)이 발생하면 다음 항목을 시도합니다.
  5. 성공 시, `Body`를 `[Audio]` 블록으로 교체하고 `{{Transcript}}`를 설정합니다.
- **명령 파싱**: 전사가 성공하면 `CommandBody`/`RawBody`가 전사 내용으로 설정되어 슬래시 명령이 계속 작동합니다.
- **상세 로깅**: `--verbose` 모드에서 전사 실행 및 본문 교체 시 로그를 기록합니다.

## 자동 감지 (기본값)

**모델을 구성하지 않고** `tools.media.audio.enabled`가 `false`로 설정되지 않은 경우,
OpenClaw는 다음 순서로 자동 감지를 시도하며 첫 번째 작동하는 옵션에서 중단합니다:

1. 프로바이더가 오디오 이해를 지원하는 경우의 **활성 답변 모델**.
2. **로컬 CLI** (설치된 경우)
   - `sherpa-onnx-offline` (`SHERPA_ONNX_MODEL_DIR`에 encoder/decoder/joiner/tokens 필요)
   - `whisper-cli` (`whisper-cpp`에서; `WHISPER_CPP_MODEL` 또는 내장 tiny 모델 사용)
   - `whisper` (Python CLI; 모델 자동 다운로드)
3. `read_many_files`를 사용하는 **Gemini CLI** (`gemini`)
4. **프로바이더 인증**
   - 오디오를 지원하는 구성된 `models.providers.*` 항목이 먼저 시도됩니다
   - 내장 폴백 순서: OpenAI → Groq → Deepgram → Google → Mistral

자동 감지를 비활성화하려면 `tools.media.audio.enabled: false`로 설정하십시오.
사용자 정의하려면 `tools.media.audio.models`를 설정하십시오.
참고: 이진 감지는 macOS/Linux/Windows 전반에서 최선 방식으로 작동합니다. CLI가 `PATH`에 있는지 확인하십시오 (`~`를 확장합니다). 또는 전체 명령 경로가 포함된 명시적 CLI 모델을 설정하십시오.

## 설정 예시

### 프로바이더 + CLI 폴백 (OpenAI + Whisper CLI)

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        maxBytes: 20971520,
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" },
          {
            type: "cli",
            command: "whisper",
            args: ["--model", "base", "{{MediaPath}}"],
            timeoutSeconds: 45,
          },
        ],
      },
    },
  },
}
```

### 범위 게이팅이 있는 프로바이더 전용

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        scope: {
          default: "allow",
          rules: [{ action: "deny", match: { chatType: "group" } }],
        },
        models: [{ provider: "openai", model: "gpt-4o-mini-transcribe" }],
      },
    },
  },
}
```

### 프로바이더 전용 (Deepgram)

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [{ provider: "deepgram", model: "nova-3" }],
      },
    },
  },
}
```

### 프로바이더 전용 (Mistral Voxtral)

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [{ provider: "mistral", model: "voxtral-mini-latest" }],
      },
    },
  },
}
```

### 채팅에 전사 내용 에코 (옵트인)

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        echoTranscript: true, // 기본값은 false
        echoFormat: '📝 "{transcript}"', // 선택 사항, {transcript} 지원
        models: [{ provider: "openai", model: "gpt-4o-mini-transcribe" }],
      },
    },
  },
}
```

## 참고 사항 및 제한 사항

- 프로바이더 인증은 표준 모델 인증 순서(인증 프로필, 환경 변수, `models.providers.*.apiKey`)를 따릅니다.
- Groq 설정 세부 정보: [Groq](/providers/groq).
- Deepgram은 `provider: "deepgram"` 사용 시 `DEEPGRAM_API_KEY`를 자동으로 인식합니다.
- Deepgram 설정 세부 정보: [Deepgram (오디오 전사)](/providers/deepgram).
- Mistral 설정 세부 정보: [Mistral](/providers/mistral).
- 오디오 프로바이더는 `tools.media.audio`를 통해 `baseUrl`, `headers`, `providerOptions`를 재정의할 수 있습니다.
- 기본 크기 제한은 20MB(`tools.media.audio.maxBytes`)입니다. 크기 초과 오디오는 해당 모델에서 건너뛰고 다음 항목이 시도됩니다.
- 1024바이트 미만의 작은/빈 오디오 파일은 프로바이더/CLI 전사 전에 건너뜁니다.
- 오디오의 기본 `maxChars`는 **미설정** (전체 전사)입니다. 출력을 트리밍하려면 `tools.media.audio.maxChars` 또는 항목별 `maxChars`를 설정하십시오.
- OpenAI 자동 기본값은 `gpt-4o-mini-transcribe`입니다. 더 높은 정확도를 원하면 `model: "gpt-4o-transcribe"`를 설정하십시오.
- `tools.media.audio.attachments`를 사용하여 여러 보이스 노트를 처리하십시오 (`mode: "all"` + `maxAttachments`).
- 전사 내용은 `{{Transcript}}`로 템플릿에서 사용 가능합니다.
- `tools.media.audio.echoTranscript`는 기본적으로 비활성화되어 있습니다. 에이전트 처리 전에 원래 채팅으로 전사 확인을 보내려면 활성화하십시오.
- `tools.media.audio.echoFormat`은 에코 텍스트를 사용자 정의합니다 (플레이스홀더: `{transcript}`).
- CLI stdout은 제한됩니다 (5MB). CLI 출력을 간결하게 유지하십시오.

### 프록시 환경 지원

프로바이더 기반 오디오 전사는 표준 아웃바운드 프록시 환경 변수를 사용합니다:

- `HTTPS_PROXY`
- `HTTP_PROXY`
- `https_proxy`
- `http_proxy`

프록시 환경 변수가 설정되지 않으면 직접 송신이 사용됩니다. 프록시 구성이 잘못된 경우 OpenClaw는 경고를 기록하고 직접 가져오기로 폴백합니다.

## 그룹에서의 멘션 감지

그룹 채팅에 `requireMention: true`가 설정된 경우, OpenClaw는 이제 멘션 확인 **전에** 오디오를 전사합니다. 이를 통해 멘션이 포함된 보이스 노트도 처리할 수 있습니다.

**작동 방식:**

1. 보이스 메시지에 텍스트 본문이 없고 그룹에 멘션이 필요한 경우, OpenClaw는 "사전 비행" 전사를 수행합니다.
2. 전사 내용에서 멘션 패턴(예: `@BotName`, 이모지 트리거)을 확인합니다.
3. 멘션이 발견되면 메시지는 전체 답변 파이프라인을 통해 처리됩니다.
4. 전사 내용은 멘션 감지에 사용되므로 보이스 노트가 멘션 게이트를 통과할 수 있습니다.

**폴백 동작:**

- 사전 비행 중 전사가 실패하면(타임아웃, API 오류 등), 메시지는 텍스트 전용 멘션 감지를 기반으로 처리됩니다.
- 이를 통해 혼합 메시지(텍스트 + 오디오)가 잘못 삭제되지 않습니다.

**Telegram 그룹/토픽별 옵트아웃:**

- `channels.telegram.groups.<chatId>.disableAudioPreflight: true`를 설정하면 해당 그룹의 사전 비행 전사 멘션 확인을 건너뜁니다.
- `channels.telegram.groups.<chatId>.topics.<threadId>.disableAudioPreflight`를 설정하면 토픽별로 재정의합니다 (`true`로 건너뜀, `false`로 강제 활성화).
- 기본값은 `false` (멘션 게이팅 조건이 일치할 때 사전 비행 활성화)입니다.

**예시:** 사용자가 `requireMention: true`인 Telegram 그룹에서 "Hey @Claude, what's the weather?"라는 보이스 노트를 보냅니다. 보이스 노트가 전사되고, 멘션이 감지되어 에이전트가 답변합니다.

## 주의 사항

- 범위 규칙은 첫 번째 일치 우선 방식을 사용합니다. `chatType`은 `direct`, `group`, 또는 `room`으로 정규화됩니다.
- CLI가 종료 코드 0으로 종료되고 일반 텍스트를 출력하는지 확인하십시오. JSON은 `jq -r .text`를 통해 처리해야 합니다.
- `parakeet-mlx`의 경우, `--output-dir`을 전달하면 `--output-format`이 `txt` (또는 생략)일 때 OpenClaw가 `<output-dir>/<media-basename>.txt`를 읽습니다. `txt` 이외의 출력 형식은 stdout 파싱으로 폴백합니다.
- 답변 큐를 차단하지 않도록 타임아웃을 적절하게 설정하십시오 (`timeoutSeconds`, 기본값 60초).
- 사전 비행 전사는 멘션 감지를 위해 **첫 번째** 오디오 첨부 파일만 처리합니다. 추가 오디오는 주 미디어 이해 단계에서 처리됩니다.
