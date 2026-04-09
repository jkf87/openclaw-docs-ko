---
title: "텍스트 음성 변환"
description: "아웃바운드 응답을 위한 텍스트 음성 변환 (TTS)"
---

# 텍스트 음성 변환 (TTS)

OpenClaw는 ElevenLabs, Microsoft, MiniMax, 또는 OpenAI를 사용하여 아웃바운드 응답을 오디오로 변환할 수 있습니다.
OpenClaw가 오디오를 전송할 수 있는 모든 곳에서 작동합니다.

## 지원 서비스

- **ElevenLabs** (기본 또는 폴백 프로바이더)
- **Microsoft** (기본 또는 폴백 프로바이더; 현재 번들된 구현은 `node-edge-tts` 사용)
- **MiniMax** (기본 또는 폴백 프로바이더; T2A v2 API 사용)
- **OpenAI** (기본 또는 폴백 프로바이더; 요약에도 사용됨)

### Microsoft 음성 참고 사항

번들된 Microsoft 음성 프로바이더는 현재 `node-edge-tts` 라이브러리를 통해 Microsoft Edge의 온라인 신경 TTS 서비스를 사용합니다. 이것은 호스팅된 서비스이며 (로컬이 아님) Microsoft 엔드포인트를 사용하고 API 키가 필요하지 않습니다.
`node-edge-tts`는 음성 설정 옵션과 출력 형식을 노출하지만 모든 옵션이 서비스에서 지원되지는 않습니다. `edge`를 사용하는 레거시 설정 및 지시자 입력은 계속 작동하며 `microsoft`로 정규화됩니다.

이 경로는 공개 SLA 또는 할당량이 없는 공개 웹 서비스이므로 최선 노력으로 처리하십시오. 보장된 제한과 지원이 필요하면 OpenAI 또는 ElevenLabs를 사용하십시오.

## 선택적 키

OpenAI, ElevenLabs, 또는 MiniMax를 사용하려면:

- `ELEVENLABS_API_KEY` (또는 `XI_API_KEY`)
- `MINIMAX_API_KEY`
- `OPENAI_API_KEY`

Microsoft 음성은 API 키가 **필요하지 않습니다**.

여러 프로바이더가 구성된 경우 선택된 프로바이더가 먼저 사용되고 나머지는 폴백 옵션입니다.
자동 요약은 구성된 `summaryModel` (또는 `agents.defaults.model.primary`)을 사용하므로 요약을 활성화하면 해당 프로바이더도 인증되어야 합니다.

## 서비스 링크

- [OpenAI Text-to-Speech guide](https://platform.openai.com/docs/guides/text-to-speech)
- [OpenAI Audio API reference](https://platform.openai.com/docs/api-reference/audio)
- [ElevenLabs Text to Speech](https://elevenlabs.io/docs/api-reference/text-to-speech)
- [ElevenLabs Authentication](https://elevenlabs.io/docs/api-reference/authentication)
- [MiniMax T2A v2 API](https://platform.minimaxi.com/document/T2A%20V2)
- [node-edge-tts](https://github.com/SchneeHertz/node-edge-tts)
- [Microsoft Speech output formats](https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech#audio-outputs)

## 기본적으로 활성화되어 있나요?

아니요. 자동 TTS는 기본적으로 **꺼져** 있습니다. 설정에서 `messages.tts.auto`로 활성화하거나 `/tts on`으로 로컬에서 활성화하십시오.

`messages.tts.provider`가 설정되지 않은 경우 OpenClaw는 레지스트리 자동 선택 순서에서 첫 번째로 구성된 음성 프로바이더를 선택합니다.

## 설정

TTS 설정은 `openclaw.json`의 `messages.tts` 아래에 있습니다.
전체 스키마는 [게이트웨이 설정](/gateway/configuration)에 있습니다.

### 최소 설정 (활성화 + 프로바이더)

```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "elevenlabs",
    },
  },
}
```

### OpenAI 기본, ElevenLabs 폴백

```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "openai",
      summaryModel: "openai/gpt-4.1-mini",
      modelOverrides: {
        enabled: true,
      },
      providers: {
        openai: {
          apiKey: "openai_api_key",
          baseUrl: "https://api.openai.com/v1",
          model: "gpt-4o-mini-tts",
          voice: "alloy",
        },
        elevenlabs: {
          apiKey: "elevenlabs_api_key",
          baseUrl: "https://api.elevenlabs.io",
          voiceId: "voice_id",
          modelId: "eleven_multilingual_v2",
          seed: 42,
          applyTextNormalization: "auto",
          languageCode: "en",
          voiceSettings: {
            stability: 0.5,
            similarityBoost: 0.75,
            style: 0.0,
            useSpeakerBoost: true,
            speed: 1.0,
          },
        },
      },
    },
  },
}
```

### Microsoft 기본 (API 키 없음)

```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "microsoft",
      providers: {
        microsoft: {
          enabled: true,
          voice: "en-US-MichelleNeural",
          lang: "en-US",
          outputFormat: "audio-24khz-48kbitrate-mono-mp3",
          rate: "+10%",
          pitch: "-5%",
        },
      },
    },
  },
}
```

### MiniMax 기본

```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "minimax",
      providers: {
        minimax: {
          apiKey: "minimax_api_key",
          baseUrl: "https://api.minimax.io",
          model: "speech-2.8-hd",
          voiceId: "English_expressive_narrator",
          speed: 1.0,
          vol: 1.0,
          pitch: 0,
        },
      },
    },
  },
}
```

### Microsoft 음성 비활성화

```json5
{
  messages: {
    tts: {
      providers: {
        microsoft: {
          enabled: false,
        },
      },
    },
  },
}
```

### 사용자 지정 제한 + 설정 경로

```json5
{
  messages: {
    tts: {
      auto: "always",
      maxTextLength: 4000,
      timeoutMs: 30000,
      prefsPath: "~/.openclaw/settings/tts.json",
    },
  },
}
```

### 인바운드 음성 메시지 후에만 오디오로 응답

```json5
{
  messages: {
    tts: {
      auto: "inbound",
    },
  },
}
```

### 긴 응답에 대한 자동 요약 비활성화

```json5
{
  messages: {
    tts: {
      auto: "always",
    },
  },
}
```

그런 다음 실행합니다:

```
/tts summary off
```

### 필드 참고 사항

- `auto`: 자동 TTS 모드 (`off`, `always`, `inbound`, `tagged`).
  - `inbound`는 인바운드 음성 메시지 후에만 오디오를 전송합니다.
  - `tagged`는 응답에 `[[tts]]` 태그가 포함된 경우에만 오디오를 전송합니다.
- `enabled`: 레거시 토글 (doctor가 이것을 `auto`로 마이그레이션합니다).
- `mode`: `"final"` (기본값) 또는 `"all"` (도구/블록 응답 포함).
- `provider`: `"elevenlabs"`, `"microsoft"`, `"minimax"`, 또는 `"openai"`와 같은 음성 프로바이더 ID (폴백은 자동).
- `provider`가 **설정되지 않은** 경우 OpenClaw는 레지스트리 자동 선택 순서에서 첫 번째로 구성된 음성 프로바이더를 사용합니다.
- 레거시 `provider: "edge"`는 계속 작동하며 `microsoft`로 정규화됩니다.
- `summaryModel`: 자동 요약을 위한 선택적 저렴한 모델; 기본값은 `agents.defaults.model.primary`.
  - `provider/model` 또는 구성된 모델 별칭을 허용합니다.
- `modelOverrides`: 모델이 TTS 지시자를 내보낼 수 있도록 허용합니다 (기본적으로 켜짐).
  - `allowProvider`는 기본적으로 `false`입니다 (프로바이더 전환은 옵트인).
- `providers.&lt;id&gt;`: 음성 프로바이더 ID로 키가 지정된 프로바이더 소유 설정.
- 레거시 직접 프로바이더 블록 (`messages.tts.openai`, `messages.tts.elevenlabs`, `messages.tts.microsoft`, `messages.tts.edge`)은 로드 시 `messages.tts.providers.&lt;id&gt;`로 자동 마이그레이션됩니다.
- `maxTextLength`: TTS 입력의 하드 상한 (문자). 초과하면 `/tts audio`가 실패합니다.
- `timeoutMs`: 요청 타임아웃 (ms).
- `prefsPath`: 로컬 설정 JSON 경로 재정의 (프로바이더/제한/요약).
- `apiKey` 값은 환경 변수로 폴백됩니다 (`ELEVENLABS_API_KEY`/`XI_API_KEY`, `MINIMAX_API_KEY`, `OPENAI_API_KEY`).
- `providers.elevenlabs.baseUrl`: ElevenLabs API 베이스 URL 재정의.
- `providers.openai.baseUrl`: OpenAI TTS 엔드포인트 재정의.
  - 결정 순서: `messages.tts.providers.openai.baseUrl` -> `OPENAI_TTS_BASE_URL` -> `https://api.openai.com/v1`
  - 기본값이 아닌 값은 OpenAI 호환 TTS 엔드포인트로 처리되므로 사용자 지정 모델 및 음성 이름이 허용됩니다.
- `providers.elevenlabs.voiceSettings`:
  - `stability`, `similarityBoost`, `style`: `0..1`
  - `useSpeakerBoost`: `true|false`
  - `speed`: `0.5..2.0` (1.0 = 기본)
- `providers.elevenlabs.applyTextNormalization`: `auto|on|off`
- `providers.elevenlabs.languageCode`: 2자리 ISO 639-1 (예: `en`, `de`)
- `providers.elevenlabs.seed`: 정수 `0..4294967295` (최선 노력 결정론)
- `providers.minimax.baseUrl`: MiniMax API 베이스 URL 재정의 (기본값 `https://api.minimax.io`, 환경 변수: `MINIMAX_API_HOST`).
- `providers.minimax.model`: TTS 모델 (기본값 `speech-2.8-hd`, 환경 변수: `MINIMAX_TTS_MODEL`).
- `providers.minimax.voiceId`: 음성 식별자 (기본값 `English_expressive_narrator`, 환경 변수: `MINIMAX_TTS_VOICE_ID`).
- `providers.minimax.speed`: 재생 속도 `0.5..2.0` (기본값 1.0).
- `providers.minimax.vol`: 볼륨 `(0, 10]` (기본값 1.0; 0보다 커야 함).
- `providers.minimax.pitch`: 피치 이동 `-12..12` (기본값 0).
- `providers.microsoft.enabled`: Microsoft 음성 사용 허용 (기본값 `true`; API 키 불필요).
- `providers.microsoft.voice`: Microsoft 신경 음성 이름 (예: `en-US-MichelleNeural`).
- `providers.microsoft.lang`: 언어 코드 (예: `en-US`).
- `providers.microsoft.outputFormat`: Microsoft 출력 형식 (예: `audio-24khz-48kbitrate-mono-mp3`).
  - Microsoft Speech 출력 형식에서 유효한 값을 확인하십시오. 번들된 Edge 기반 전송에서 모든 형식이 지원되지는 않습니다.
- `providers.microsoft.rate` / `providers.microsoft.pitch` / `providers.microsoft.volume`: 퍼센트 문자열 (예: `+10%`, `-5%`).
- `providers.microsoft.saveSubtitles`: 오디오 파일과 함께 JSON 자막을 저장합니다.
- `providers.microsoft.proxy`: Microsoft 음성 요청을 위한 프록시 URL.
- `providers.microsoft.timeoutMs`: 요청 타임아웃 재정의 (ms).
- `edge.*`: 동일한 Microsoft 설정에 대한 레거시 별칭.

## 모델 기반 재정의 (기본적으로 켜짐)

기본적으로 모델은 단일 응답에 대해 TTS 지시자를 **내보낼 수 있습니다**.
`messages.tts.auto`가 `tagged`인 경우 이 지시자가 오디오를 트리거하는 데 필요합니다.

활성화된 경우 모델은 `[[tts:...]]` 지시자를 내보내 단일 응답에 대한 음성을 재정의할 수 있으며, 오디오에만 표시되어야 하는 표현적 태그 (웃음, 노래 신호 등)를 제공하기 위한 선택적 `[[tts:text]]...[[/tts:text]]` 블록도 가능합니다.

`provider=...` 지시자는 `modelOverrides.allowProvider: true`가 아닌 경우 무시됩니다.

예시 응답 페이로드:

```
Here you go.

[[tts:voiceId=pMsXgVXv3BLzUgSXRplE model=eleven_v3 speed=1.1]]
[[tts:text]](laughs) Read the song once more.[[/tts:text]]
```

사용 가능한 지시자 키 (활성화된 경우):

- `provider` (등록된 음성 프로바이더 ID, 예: `openai`, `elevenlabs`, `minimax`, 또는 `microsoft`; `allowProvider: true` 필요)
- `voice` (OpenAI 음성) 또는 `voiceId` (ElevenLabs / MiniMax)
- `model` (OpenAI TTS 모델, ElevenLabs 모델 ID, 또는 MiniMax 모델)
- `stability`, `similarityBoost`, `style`, `speed`, `useSpeakerBoost`
- `vol` / `volume` (MiniMax 볼륨, 0-10)
- `pitch` (MiniMax 피치, -12~12)
- `applyTextNormalization` (`auto|on|off`)
- `languageCode` (ISO 639-1)
- `seed`

모든 모델 재정의 비활성화:

```json5
{
  messages: {
    tts: {
      modelOverrides: {
        enabled: false,
      },
    },
  },
}
```

선택적 허용 목록 (다른 설정을 구성 가능하게 유지하면서 프로바이더 전환 활성화):

```json5
{
  messages: {
    tts: {
      modelOverrides: {
        enabled: true,
        allowProvider: true,
        allowSeed: false,
      },
    },
  },
}
```

## 사용자별 설정

슬래시 명령은 로컬 재정의를 `prefsPath`에 저장합니다 (기본값: `~/.openclaw/settings/tts.json`, `OPENCLAW_TTS_PREFS` 또는 `messages.tts.prefsPath`로 재정의).

저장된 필드:

- `enabled`
- `provider`
- `maxLength` (요약 임계값; 기본값 1500자)
- `summarize` (기본값 `true`)

이 설정들은 해당 호스트의 `messages.tts.*`를 재정의합니다.

## 출력 형식 (고정)

- **Feishu / Matrix / Telegram / WhatsApp**: Opus 음성 메시지 (ElevenLabs에서 `opus_48000_64`, OpenAI에서 `opus`).
  - 48kHz / 64kbps는 음성 메시지의 좋은 트레이드오프입니다.
- **기타 채널**: MP3 (ElevenLabs에서 `mp3_44100_128`, OpenAI에서 `mp3`).
  - 44.1kHz / 128kbps는 음성 명료도를 위한 기본 균형입니다.
- **MiniMax**: MP3 (`speech-2.8-hd` 모델, 32kHz 샘플레이트). 음성 노트 형식은 기본적으로 지원되지 않습니다. 보장된 Opus 음성 메시지를 위해 OpenAI 또는 ElevenLabs를 사용하십시오.
- **Microsoft**: `microsoft.outputFormat` 사용 (기본값 `audio-24khz-48kbitrate-mono-mp3`).
  - 번들된 전송은 `outputFormat`을 허용하지만 서비스에서 모든 형식이 사용 가능하지는 않습니다.
  - 출력 형식 값은 Microsoft Speech 출력 형식을 따릅니다 (Ogg/WebM Opus 포함).
  - Telegram `sendVoice`는 OGG/MP3/M4A를 허용합니다. 보장된 Opus 음성 메시지가 필요하면 OpenAI/ElevenLabs를 사용하십시오.
  - 구성된 Microsoft 출력 형식이 실패하면 OpenClaw는 MP3로 재시도합니다.

OpenAI/ElevenLabs 출력 형식은 채널별로 고정됩니다 (위 참조).

## 자동 TTS 동작

활성화된 경우 OpenClaw는:

- 응답에 미디어 또는 `MEDIA:` 지시자가 포함된 경우 TTS를 건너뜁니다.
- 매우 짧은 응답 (< 10자)을 건너뜁니다.
- 활성화된 경우 `agents.defaults.model.primary` (또는 `summaryModel`)을 사용하여 긴 응답을 요약합니다.
- 생성된 오디오를 응답에 첨부합니다.

응답이 `maxLength`를 초과하고 요약이 꺼져 있으면 (또는 요약 모델에 대한 API 키가 없으면), 오디오를 건너뛰고 일반 텍스트 응답이 전송됩니다.

## 흐름 다이어그램

```
응답 -> TTS 활성화?
  아니요 -> 텍스트 전송
  예 -> 미디어 / MEDIA: / 짧은 응답?
          예 -> 텍스트 전송
          아니요 -> 길이 > 제한?
                   아니요 -> TTS -> 오디오 첨부
                   예 -> 요약 활성화?
                            아니요 -> 텍스트 전송
                            예 -> 요약 (summaryModel 또는 agents.defaults.model.primary)
                                      -> TTS -> 오디오 첨부
```

## 슬래시 명령 사용

단일 명령 `/tts`가 있습니다.
활성화 세부 정보는 [슬래시 명령](/tools/slash-commands)을 참조하십시오.

Discord 참고: `/tts`는 Discord에 내장된 명령이므로 OpenClaw는 거기에 `/voice`를 네이티브 명령으로 등록합니다. 텍스트 `/tts ...`는 계속 작동합니다.

```
/tts off
/tts on
/tts status
/tts provider openai
/tts limit 2000
/tts summary off
/tts audio Hello from OpenClaw
```

참고 사항:

- 명령에는 승인된 발신자가 필요합니다 (허용 목록/소유자 규칙이 여전히 적용됨).
- `commands.text` 또는 네이티브 명령 등록이 활성화되어 있어야 합니다.
- 설정 `messages.tts.auto`는 `off|always|inbound|tagged`를 허용합니다.
- `/tts on`은 로컬 TTS 설정을 `always`로 저장합니다. `/tts off`는 `off`로 저장합니다.
- `inbound` 또는 `tagged` 기본값이 필요한 경우 설정을 사용하십시오.
- `limit` 및 `summary`는 주 설정이 아닌 로컬 설정에 저장됩니다.
- `/tts audio`는 일회성 오디오 응답을 생성합니다 (TTS를 켜지 않음).
- `/tts status`에는 최신 시도에 대한 폴백 가시성이 포함됩니다:
  - 성공 폴백: `Fallback: &lt;primary&gt; -> &lt;used&gt;` 및 `Attempts: ...`
  - 실패: `Error: ...` 및 `Attempts: ...`
  - 자세한 진단: `Attempt details: provider:outcome(reasonCode) latency`
- OpenAI 및 ElevenLabs API 실패는 이제 파싱된 프로바이더 오류 세부 정보와 요청 ID (프로바이더가 반환하는 경우)를 포함하며, 이는 TTS 오류/로그에 표시됩니다.

## 에이전트 도구

`tts` 도구는 텍스트를 음성으로 변환하고 응답 전달을 위한 오디오 첨부 파일을 반환합니다. 채널이 Feishu, Matrix, Telegram, 또는 WhatsApp인 경우 오디오는 파일 첨부 파일이 아닌 음성 메시지로 전달됩니다.

## 게이트웨이 RPC

게이트웨이 메서드:

- `tts.status`
- `tts.enable`
- `tts.disable`
- `tts.convert`
- `tts.setProvider`
- `tts.providers`
