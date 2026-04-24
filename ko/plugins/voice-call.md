---
summary: "Voice Call 플러그인: Twilio/Telnyx/Plivo를 통한 아웃바운드 + 인바운드 통화 (플러그인 설치 + 구성 + CLI)"
read_when:
  - OpenClaw에서 아웃바운드 voice call을 발신하고 싶을 때
  - voice-call 플러그인을 구성하거나 개발할 때
title: "Voice call 플러그인"
---

# Voice Call (플러그인)

플러그인을 통한 OpenClaw용 voice call입니다. 아웃바운드 알림과 인바운드 정책을 사용한 다중 턴 대화를 지원합니다.

현재 provider:

- `twilio` (Programmable Voice + Media Streams)
- `telnyx` (Call Control v2)
- `plivo` (Voice API + XML transfer + GetInput speech)
- `mock` (개발/네트워크 없음)

빠른 멘탈 모델:

- 플러그인 설치
- Gateway 재시작
- `plugins.entries.voice-call.config` 아래 구성
- `openclaw voicecall ...` 또는 `voice_call` 도구 사용

## 실행 위치 (로컬 vs 원격)

Voice Call 플러그인은 **Gateway 프로세스 내부**에서 실행됩니다.

원격 Gateway를 사용하는 경우, **Gateway를 실행하는 머신**에서 플러그인을 설치/구성한 다음, 로드를 위해 Gateway를 재시작하십시오.

## 설치

### 옵션 A: npm에서 설치 (권장)

```bash
openclaw plugins install @openclaw/voice-call
```

그 후 Gateway를 재시작하십시오.

### 옵션 B: 로컬 폴더에서 설치 (개발, 복사 없음)

```bash
PLUGIN_SRC=./path/to/local/voice-call-plugin
openclaw plugins install "$PLUGIN_SRC"
cd "$PLUGIN_SRC" && pnpm install
```

그 후 Gateway를 재시작하십시오.

## 구성

`plugins.entries.voice-call.config` 아래에 구성을 설정하십시오:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        enabled: true,
        config: {
          provider: "twilio", // or "telnyx" | "plivo" | "mock"
          fromNumber: "+15550001234", // or TWILIO_FROM_NUMBER for Twilio
          toNumber: "+15550005678",

          twilio: {
            accountSid: "ACxxxxxxxx",
            authToken: "...",
          },

          telnyx: {
            apiKey: "...",
            connectionId: "...",
            // Telnyx webhook public key from the Telnyx Mission Control Portal
            // (Base64 string; can also be set via TELNYX_PUBLIC_KEY).
            publicKey: "...",
          },

          plivo: {
            authId: "MAxxxxxxxxxxxxxxxxxxxx",
            authToken: "...",
          },

          // Webhook server
          serve: {
            port: 3334,
            path: "/voice/webhook",
          },

          // Webhook security (recommended for tunnels/proxies)
          webhookSecurity: {
            allowedHosts: ["voice.example.com"],
            trustedProxyIPs: ["100.64.0.1"],
          },

          // Public exposure (pick one)
          // publicUrl: "https://example.ngrok.app/voice/webhook",
          // tunnel: { provider: "ngrok" },
          // tailscale: { mode: "funnel", path: "/voice/webhook" }

          outbound: {
            defaultMode: "notify", // notify | conversation
          },

          streaming: {
            enabled: true,
            provider: "openai", // optional; first registered realtime transcription provider when unset
            streamPath: "/voice/stream",
            providers: {
              openai: {
                apiKey: "sk-...", // optional if OPENAI_API_KEY is set
                model: "gpt-4o-transcribe",
                silenceDurationMs: 800,
                vadThreshold: 0.5,
              },
            },
            preStartTimeoutMs: 5000,
            maxPendingConnections: 32,
            maxPendingConnectionsPerIp: 4,
            maxConnections: 128,
          },
        },
      },
    },
  },
}
```

참고 사항:

- Twilio/Telnyx는 **공개적으로 도달 가능한** webhook URL이 필요합니다.
- Plivo는 **공개적으로 도달 가능한** webhook URL이 필요합니다.
- `mock`은 로컬 개발 provider입니다 (네트워크 호출 없음).
- 이전 구성이 여전히 `provider: "log"`, `twilio.from`, 또는 레거시 `streaming.*` OpenAI 키를 사용하는 경우, `openclaw doctor --fix`를 실행하여 재작성하십시오.
- Telnyx는 `skipSignatureVerification`이 true가 아닌 한 `telnyx.publicKey` (또는 `TELNYX_PUBLIC_KEY`)를 필요로 합니다.
- `skipSignatureVerification`은 로컬 테스트 전용입니다.
- ngrok free tier를 사용하는 경우, `publicUrl`을 정확한 ngrok URL로 설정하십시오; 서명 검증은 항상 강제됩니다.
- `tunnel.allowNgrokFreeTierLoopbackBypass: true`는 `tunnel.provider="ngrok"`이고 `serve.bind`가 loopback (ngrok 로컬 에이전트)일 때 **만** 유효하지 않은 서명이 있는 Twilio webhook을 허용합니다. 로컬 개발 전용으로 사용하십시오.
- Ngrok free tier URL은 변경되거나 interstitial 동작을 추가할 수 있습니다; `publicUrl`이 흘러가면 Twilio 서명이 실패합니다. 프로덕션에는 안정적인 도메인이나 Tailscale funnel을 선호하십시오.
- 스트리밍 보안 기본값:
  - `streaming.preStartTimeoutMs`는 유효한 `start` 프레임을 보내지 않는 소켓을 닫습니다.
- `streaming.maxPendingConnections`는 인증되지 않은 pre-start 소켓의 총 수를 제한합니다.
- `streaming.maxPendingConnectionsPerIp`는 소스 IP당 인증되지 않은 pre-start 소켓을 제한합니다.
- `streaming.maxConnections`는 열린 전체 media stream 소켓 (pending + active)을 제한합니다.
- 런타임 폴백은 지금은 여전히 해당 이전 voice-call 키를 수락하지만, 재작성 경로는 `openclaw doctor --fix`이며 compat shim은 임시입니다.

## 스트리밍 전사 (transcription)

`streaming`은 라이브 call 오디오를 위한 실시간 전사 provider를 선택합니다.

현재 런타임 동작:

- `streaming.provider`는 선택 사항입니다. 설정되지 않은 경우, Voice Call은 첫 번째로 등록된 실시간 전사 provider를 사용합니다.
- 번들 실시간 전사 provider에는 Deepgram (`deepgram`), ElevenLabs (`elevenlabs`), Mistral (`mistral`), OpenAI (`openai`), xAI (`xai`)가 포함되어 있으며, 해당 provider 플러그인에 의해 등록됩니다.
- Provider가 소유하는 원시 구성은 `streaming.providers.<providerId>` 아래에 위치합니다.
- `streaming.provider`가 등록되지 않은 provider를 가리키거나, 실시간 전사 provider가 전혀 등록되지 않은 경우, Voice Call은 경고를 로그하고 전체 플러그인을 실패시키는 대신 media streaming을 건너뜁니다.

OpenAI 스트리밍 전사 기본값:

- API key: `streaming.providers.openai.apiKey` 또는 `OPENAI_API_KEY`
- model: `gpt-4o-transcribe`
- `silenceDurationMs`: `800`
- `vadThreshold`: `0.5`

xAI 스트리밍 전사 기본값:

- API key: `streaming.providers.xai.apiKey` 또는 `XAI_API_KEY`
- endpoint: `wss://api.x.ai/v1/stt`
- `encoding`: `mulaw`
- `sampleRate`: `8000`
- `endpointingMs`: `800`
- `interimResults`: `true`

예시:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          streaming: {
            enabled: true,
            provider: "openai",
            streamPath: "/voice/stream",
            providers: {
              openai: {
                apiKey: "sk-...", // optional if OPENAI_API_KEY is set
                model: "gpt-4o-transcribe",
                silenceDurationMs: 800,
                vadThreshold: 0.5,
              },
            },
          },
        },
      },
    },
  },
}
```

대신 xAI 사용:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          streaming: {
            enabled: true,
            provider: "xai",
            streamPath: "/voice/stream",
            providers: {
              xai: {
                apiKey: "${XAI_API_KEY}", // optional if XAI_API_KEY is set
                endpointingMs: 800,
                language: "en",
              },
            },
          },
        },
      },
    },
  },
}
```

레거시 키는 여전히 `openclaw doctor --fix`에 의해 자동 마이그레이션됩니다:

- `streaming.sttProvider` → `streaming.provider`
- `streaming.openaiApiKey` → `streaming.providers.openai.apiKey`
- `streaming.sttModel` → `streaming.providers.openai.model`
- `streaming.silenceDurationMs` → `streaming.providers.openai.silenceDurationMs`
- `streaming.vadThreshold` → `streaming.providers.openai.vadThreshold`

## 오래된 call 리퍼 (stale call reaper)

종료 webhook을 결코 수신하지 않는 call을 종료하려면 `staleCallReaperSeconds`를 사용하십시오 (예: 완료되지 않는 notify-mode call). 기본값은 `0` (비활성화)입니다.

권장 범위:

- **프로덕션:** notify 스타일 플로우에 대해 `120`–`300`초.
- 일반 call이 완료될 수 있도록 이 값을 **`maxDurationSeconds`보다 높게** 유지하십시오. 좋은 시작점은 `maxDurationSeconds + 30–60`초입니다.

예시:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          maxDurationSeconds: 300,
          staleCallReaperSeconds: 360,
        },
      },
    },
  },
}
```

## Webhook 보안

프록시나 터널이 Gateway 앞에 있을 때, 플러그인은 서명 검증을 위해 공개 URL을 재구성합니다. 이 옵션은 어떤 전달된 헤더를 신뢰할지 제어합니다.

`webhookSecurity.allowedHosts`는 전달 헤더의 호스트를 허용 목록에 등록합니다.

`webhookSecurity.trustForwardingHeaders`는 허용 목록 없이 전달된 헤더를 신뢰합니다.

`webhookSecurity.trustedProxyIPs`는 요청 원격 IP가 목록과 일치하는 경우에만 전달된 헤더를 신뢰합니다.

Webhook 리플레이 보호는 Twilio와 Plivo에 대해 활성화되어 있습니다. 리플레이된 유효한 webhook 요청은 확인되지만 부수 효과에 대해서는 건너뜁니다.

Twilio 대화 턴은 `<Gather>` 콜백에 턴별 토큰을 포함하므로, 오래되거나 리플레이된 speech 콜백은 새로운 pending transcript 턴을 충족시킬 수 없습니다.

인증되지 않은 webhook 요청은 provider의 필수 서명 헤더가 누락된 경우 본문 읽기 전에 거부됩니다.

Voice-call webhook은 공유 pre-auth 본문 프로파일 (64 KB / 5초)과 서명 검증 전에 IP별 in-flight cap을 사용합니다.

안정적인 공개 호스트가 있는 예시:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          publicUrl: "https://voice.example.com/voice/webhook",
          webhookSecurity: {
            allowedHosts: ["voice.example.com"],
          },
        },
      },
    },
  },
}
```

## Call용 TTS

Voice Call은 call에서의 스트리밍 speech를 위해 코어 `messages.tts` 구성을 사용합니다. **동일한 형태**로 플러그인 구성 아래에서 재정의할 수 있으며, `messages.tts`와 deep-merge됩니다.

```json5
{
  tts: {
    provider: "elevenlabs",
    providers: {
      elevenlabs: {
        voiceId: "pMsXgVXv3BLzUgSXRplE",
        modelId: "eleven_multilingual_v2",
      },
    },
  },
}
```

참고 사항:

- 플러그인 구성 내부의 레거시 `tts.<provider>` 키 (`openai`, `elevenlabs`, `microsoft`, `edge`)는 로드 시 `tts.providers.<provider>`로 자동 마이그레이션됩니다. 커밋된 구성에서는 `providers` 형태를 선호하십시오.
- **Microsoft speech는 voice call에서 무시됩니다** (전화 오디오는 PCM이 필요합니다; 현재 Microsoft 전송은 전화 PCM 출력을 노출하지 않습니다).
- Twilio media streaming이 활성화된 경우 코어 TTS가 사용됩니다; 그렇지 않으면 call은 provider 네이티브 voice로 폴백됩니다.
- Twilio media stream이 이미 활성 상태이면, Voice Call은 TwiML `<Say>`로 폴백하지 않습니다. 해당 상태에서 전화 TTS를 사용할 수 없으면, 재생 요청은 두 재생 경로를 혼합하는 대신 실패합니다.
- 전화 TTS가 보조 provider로 폴백될 때, Voice Call은 디버깅을 위해 provider 체인 (`from`, `to`, `attempts`)과 함께 경고를 로그합니다.

### 추가 예시

코어 TTS만 사용 (재정의 없음):

```json5
{
  messages: {
    tts: {
      provider: "openai",
      providers: {
        openai: { voice: "alloy" },
      },
    },
  },
}
```

call에 대해서만 ElevenLabs로 재정의 (다른 곳에서는 코어 기본값 유지):

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          tts: {
            provider: "elevenlabs",
            providers: {
              elevenlabs: {
                apiKey: "elevenlabs_key",
                voiceId: "pMsXgVXv3BLzUgSXRplE",
                modelId: "eleven_multilingual_v2",
              },
            },
          },
        },
      },
    },
  },
}
```

call에 대해서만 OpenAI 모델 재정의 (deep-merge 예시):

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          tts: {
            providers: {
              openai: {
                model: "gpt-4o-mini-tts",
                voice: "marin",
              },
            },
          },
        },
      },
    },
  },
}
```

## 인바운드 call

인바운드 정책은 기본값 `disabled`입니다. 인바운드 call을 활성화하려면 다음을 설정하십시오:

```json5
{
  inboundPolicy: "allowlist",
  allowFrom: ["+15550001234"],
  inboundGreeting: "Hello! How can I help?",
}
```

`inboundPolicy: "allowlist"`는 낮은 보증 수준의 caller-ID 스크리닝입니다. 플러그인은 provider가 제공한 `From` 값을 정규화하고 `allowFrom`과 비교합니다. Webhook 검증은 provider 전달 및 페이로드 무결성을 인증하지만, PSTN/VoIP caller 번호 소유권을 증명하지는 않습니다. `allowFrom`은 강력한 caller identity가 아닌 caller-ID 필터링으로 취급하십시오.

자동 응답은 에이전트 시스템을 사용합니다. 다음으로 튜닝하십시오:

- `responseModel`
- `responseSystemPrompt`
- `responseTimeoutMs`

### 구두 출력 계약

자동 응답의 경우, Voice Call은 엄격한 구두 출력 계약을 시스템 프롬프트에 추가합니다:

- `{"spoken":"..."}`

그런 다음 Voice Call은 방어적으로 speech 텍스트를 추출합니다:

- reasoning/error 콘텐츠로 표시된 페이로드는 무시합니다.
- 직접 JSON, fenced JSON, 또는 인라인 `"spoken"` 키를 파싱합니다.
- 일반 텍스트로 폴백하고 가능한 계획/메타 리드인 단락을 제거합니다.

이것은 구두 재생을 caller 대면 텍스트에 집중시키고 계획 텍스트가 오디오로 누출되는 것을 방지합니다.

### 대화 시작 동작

아웃바운드 `conversation` call의 경우, 첫 번째 메시지 처리는 라이브 재생 상태에 연결됩니다:

- Barge-in 큐 clear와 자동 응답은 초기 인사말이 활발히 말하는 동안에만 억제됩니다.
- 초기 재생이 실패하면 call은 `listening`으로 돌아가고 초기 메시지는 재시도를 위해 큐에 남아 있습니다.
- Twilio 스트리밍의 초기 재생은 추가 지연 없이 스트림 연결 시 시작됩니다.

### Twilio 스트림 연결 해제 유예

Twilio media stream이 연결 해제되면, Voice Call은 call을 자동 종료하기 전에 `2000ms`를 기다립니다:

- 해당 창에서 스트림이 다시 연결되면, 자동 종료가 취소됩니다.
- 유예 기간 후 스트림이 다시 등록되지 않으면, 활성 call이 멈추는 것을 방지하기 위해 call이 종료됩니다.

## CLI

```bash
openclaw voicecall call --to "+15555550123" --message "Hello from OpenClaw"
openclaw voicecall start --to "+15555550123"   # alias for call
openclaw voicecall continue --call-id <id> --message "Any questions?"
openclaw voicecall speak --call-id <id> --message "One moment"
openclaw voicecall dtmf --call-id <id> --digits "ww123456#"
openclaw voicecall end --call-id <id>
openclaw voicecall status --call-id <id>
openclaw voicecall tail
openclaw voicecall latency                     # summarize turn latency from logs
openclaw voicecall expose --mode funnel
```

`latency`는 기본 voice-call 스토리지 경로에서 `calls.jsonl`을 읽습니다. 다른 로그를 가리키려면 `--file <path>`를 사용하고, 분석을 마지막 N개 레코드로 제한하려면 `--last <n>`을 사용하십시오 (기본값 200). 출력에는 턴 지연 시간과 listen-wait 시간에 대한 p50/p90/p99가 포함됩니다.

## 에이전트 도구

도구 이름: `voice_call`

액션:

- `initiate_call` (message, to?, mode?)
- `continue_call` (callId, message)
- `speak_to_user` (callId, message)
- `send_dtmf` (callId, digits)
- `end_call` (callId)
- `get_status` (callId)

이 repo는 `skills/voice-call/SKILL.md`에 일치하는 skill 문서를 제공합니다.

## Gateway RPC

- `voicecall.initiate` (`to?`, `message`, `mode?`)
- `voicecall.continue` (`callId`, `message`)
- `voicecall.speak` (`callId`, `message`)
- `voicecall.dtmf` (`callId`, `digits`)
- `voicecall.end` (`callId`)
- `voicecall.status` (`callId`)

## 관련 문서

- [Text-to-speech](/tools/tts)
- [Talk 모드](/nodes/talk)
- [Voice wake](/nodes/voicewake)
