---
title: "Voice Call 플러그인"
description: "Voice Call 플러그인: Twilio/Telnyx/Plivo를 통한 아웃바운드 + 인바운드 통화 (플러그인 설치 + 구성 + CLI)"
---

# Voice Call (플러그인)

플러그인을 통한 OpenClaw용 음성 통화. 인바운드 정책이 있는 아웃바운드 알림 및 다중 턴 대화를 지원합니다.

현재 프로바이더:

- `twilio` (Programmable Voice + Media Streams)
- `telnyx` (Call Control v2)
- `plivo` (Voice API + XML 전송 + GetInput 음성)
- `mock` (개발/네트워크 없음)

빠른 개요:

- 플러그인 설치
- 게이트웨이 재시작
- `plugins.entries.voice-call.config` 아래에서 구성
- `openclaw voicecall ...` 또는 `voice_call` 도구 사용

## 실행 위치 (로컬 vs 원격)

Voice Call 플러그인은 **게이트웨이 프로세스 내에서** 실행됩니다.

원격 게이트웨이를 사용한다면 **게이트웨이를 실행하는 머신**에 플러그인을 설치/구성한 다음 게이트웨이를 재시작하여 로드하십시오.

## 설치

### 옵션 A: npm에서 설치 (권장)

```bash
openclaw plugins install @openclaw/voice-call
```

이후 게이트웨이를 재시작하십시오.

### 옵션 B: 로컬 폴더에서 설치 (개발, 복사 없음)

```bash
PLUGIN_SRC=./path/to/local/voice-call-plugin
openclaw plugins install "$PLUGIN_SRC"
cd "$PLUGIN_SRC" && pnpm install
```

이후 게이트웨이를 재시작하십시오.

## 구성

`plugins.entries.voice-call.config` 아래에 구성을 설정하십시오:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        enabled: true,
        config: {
          provider: "twilio", // 또는 "telnyx" | "plivo" | "mock"
          fromNumber: "+15550001234",
          toNumber: "+15550005678",

          twilio: {
            accountSid: "ACxxxxxxxx",
            authToken: "...",
          },

          telnyx: {
            apiKey: "...",
            connectionId: "...",
            // Telnyx Mission Control Portal의 Telnyx 웹훅 공개 키
            // (Base64 문자열; TELNYX_PUBLIC_KEY로도 설정 가능).
            publicKey: "...",
          },

          plivo: {
            authId: "MAxxxxxxxxxxxxxxxxxxxx",
            authToken: "...",
          },

          // 웹훅 서버
          serve: {
            port: 3334,
            path: "/voice/webhook",
          },

          // 웹훅 보안 (터널/프록시에 권장)
          webhookSecurity: {
            allowedHosts: ["voice.example.com"],
            trustedProxyIPs: ["100.64.0.1"],
          },

          // 공개 노출 (하나 선택)
          // publicUrl: "https://example.ngrok.app/voice/webhook",
          // tunnel: { provider: "ngrok" },
          // tailscale: { mode: "funnel", path: "/voice/webhook" }

          outbound: {
            defaultMode: "notify", // notify | conversation
          },

          streaming: {
            enabled: true,
            provider: "openai", // 선택 사항; 설정 안 되면 첫 번째 등록된 실시간 전사 프로바이더 사용
            streamPath: "/voice/stream",
            providers: {
              openai: {
                apiKey: "sk-...", // OPENAI_API_KEY가 설정되어 있으면 선택 사항
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

- Twilio/Telnyx는 **공개적으로 접근 가능한** 웹훅 URL이 필요합니다.
- Plivo는 **공개적으로 접근 가능한** 웹훅 URL이 필요합니다.
- `mock`은 로컬 개발 프로바이더입니다(네트워크 호출 없음).
- 구형 구성에서 여전히 `provider: "log"`, `twilio.from`, 또는 레거시 `streaming.*` OpenAI 키를 사용한다면 `openclaw doctor --fix`를 실행하여 재작성하십시오.
- Telnyx는 `skipSignatureVerification`이 true가 아니면 `telnyx.publicKey`(또는 `TELNYX_PUBLIC_KEY`)가 필요합니다.
- `skipSignatureVerification`은 로컬 테스트 전용입니다.
- ngrok 무료 티어를 사용한다면 `publicUrl`을 정확한 ngrok URL로 설정하십시오; 서명 검증은 항상 적용됩니다.
- `tunnel.allowNgrokFreeTierLoopbackBypass: true`는 `tunnel.provider="ngrok"`이고 `serve.bind`가 루프백(ngrok 로컬 에이전트)일 때 **유효하지 않은 서명**의 Twilio 웹훅을 허용합니다. 로컬 개발 전용으로 사용하십시오.
- ngrok 무료 티어 URL은 변경되거나 중간 페이지 동작이 추가될 수 있습니다; `publicUrl`이 변경되면 Twilio 서명이 실패합니다. 프로덕션에서는 안정적인 도메인이나 Tailscale funnel을 선호하십시오.
- 스트리밍 보안 기본값:
  - `streaming.preStartTimeoutMs`는 유효한 `start` 프레임을 보내지 않는 소켓을 닫습니다.
- `streaming.maxPendingConnections`는 총 미인증 사전 시작 소켓을 제한합니다.
- `streaming.maxPendingConnectionsPerIp`는 소스 IP당 미인증 사전 시작 소켓을 제한합니다.
- `streaming.maxConnections`는 총 열린 미디어 스트림 소켓(대기 중 + 활성)을 제한합니다.
- 런타임 폴백은 현재도 구형 voice-call 키를 수용하지만, 재작성 경로는 `openclaw doctor --fix`이며 호환성 심은 임시적입니다.

## 스트리밍 전사

`streaming`은 라이브 통화 오디오를 위한 실시간 전사 프로바이더를 선택합니다.

현재 런타임 동작:

- `streaming.provider`는 선택 사항입니다. 설정하지 않으면 Voice Call은 첫 번째 등록된 실시간 전사 프로바이더를 사용합니다.
- 오늘날 번들 프로바이더는 번들 `openai` 플러그인이 등록한 OpenAI입니다.
- 프로바이더 소유 원시 구성은 `streaming.providers.&lt;providerId&gt;` 아래에 있습니다.
- `streaming.provider`가 등록되지 않은 프로바이더를 가리키거나, 실시간 전사 프로바이더가 전혀 등록되지 않은 경우, Voice Call은 경고를 기록하고 플러그인 전체를 실패시키는 대신 미디어 스트리밍을 건너뜁니다.

OpenAI 스트리밍 전사 기본값:

- API 키: `streaming.providers.openai.apiKey` 또는 `OPENAI_API_KEY`
- model: `gpt-4o-transcribe`
- `silenceDurationMs`: `800`
- `vadThreshold`: `0.5`

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
                apiKey: "sk-...", // OPENAI_API_KEY가 설정되어 있으면 선택 사항
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

레거시 키는 `openclaw doctor --fix`에 의해 자동 마이그레이션됩니다:

- `streaming.sttProvider` → `streaming.provider`
- `streaming.openaiApiKey` → `streaming.providers.openai.apiKey`
- `streaming.sttModel` → `streaming.providers.openai.model`
- `streaming.silenceDurationMs` → `streaming.providers.openai.silenceDurationMs`
- `streaming.vadThreshold` → `streaming.providers.openai.vadThreshold`

## 오래된 통화 청소기

터미널 웹훅을 받지 못하는 통화(예: 완료되지 않은 알림 모드 통화)를 종료하려면 `staleCallReaperSeconds`를 사용하십시오. 기본값은 `0`(비활성화)입니다.

권장 범위:

- **프로덕션:** 알림 스타일 흐름에서는 `120`~`300`초.
- 일반 통화가 완료될 수 있도록 이 값을 **`maxDurationSeconds`보다 높게** 유지하십시오. 좋은 시작점은 `maxDurationSeconds + 30~60`초입니다.

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

## 웹훅 보안

프록시 또는 터널이 게이트웨이 앞에 있을 때, 플러그인은 서명 검증을 위해 공개 URL을 재구성합니다. 이 옵션들은 어떤 전달 헤더를 신뢰할지 제어합니다.

`webhookSecurity.allowedHosts`는 전달 헤더의 호스트를 허용 목록에 추가합니다.

`webhookSecurity.trustForwardingHeaders`는 허용 목록 없이 전달 헤더를 신뢰합니다.

`webhookSecurity.trustedProxyIPs`는 요청 원격 IP가 목록과 일치할 때만 전달 헤더를 신뢰합니다.

웹훅 재실행 방지는 Twilio 및 Plivo에 대해 활성화되어 있습니다. 재실행된 유효한 웹훅 요청은 확인되지만 부작용은 건너뜁니다.

Twilio 대화 턴은 `&lt;Gather&gt;` 콜백에 턴별 토큰을 포함하므로, 오래되거나 재실행된 음성 콜백이 더 새로운 대기 중인 전사 턴을 충족시킬 수 없습니다.

미인증 웹훅 요청은 프로바이더의 필수 서명 헤더가 없을 때 본문 읽기 전에 거부됩니다.

Voice-call 웹훅은 서명 검증 전에 공유 사전 auth 본문 프로필(64 KB / 5초)과 IP당 진행 중 제한을 사용합니다.

안정적인 공개 호스트를 사용한 예시:

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

## 통화용 TTS

Voice Call은 통화의 스트리밍 음성을 위해 코어 `messages.tts` 구성을 사용합니다. 플러그인 구성 아래에서 **동일한 형태**로 재정의할 수 있습니다 — `messages.tts`와 깊은 병합됩니다.

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

- 플러그인 구성 내의 레거시 `tts.&lt;provider&gt;` 키(`openai`, `elevenlabs`, `microsoft`, `edge`)는 로드 시 `tts.providers.&lt;provider&gt;`로 자동 마이그레이션됩니다. 커밋된 구성에서는 `providers` 형태를 선호하십시오.
- **Microsoft 음성은 음성 통화에서 무시됩니다** (전화 오디오는 PCM이 필요합니다; 현재 Microsoft 전송은 전화 PCM 출력을 노출하지 않습니다).
- Twilio 미디어 스트리밍이 활성화된 경우 코어 TTS가 사용됩니다; 그렇지 않으면 통화는 프로바이더 네이티브 음성으로 폴백됩니다.
- Twilio 미디어 스트림이 이미 활성 상태인 경우 Voice Call은 TwiML `&lt;Say&gt;`로 폴백하지 않습니다. 해당 상태에서 전화 TTS를 사용할 수 없으면, 두 재생 경로를 혼합하는 대신 재생 요청이 실패합니다.
- 전화 TTS가 보조 프로바이더로 폴백할 때 Voice Call은 디버깅을 위해 프로바이더 체인(`from`, `to`, `attempts`)과 함께 경고를 기록합니다.

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

통화에만 ElevenLabs로 재정의 (다른 곳에서는 코어 기본값 유지):

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

통화에만 OpenAI 모델 재정의 (깊은 병합 예시):

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

## 인바운드 통화

인바운드 정책은 기본적으로 `disabled`입니다. 인바운드 통화를 활성화하려면 다음을 설정하십시오:

```json5
{
  inboundPolicy: "allowlist",
  allowFrom: ["+15550001234"],
  inboundGreeting: "Hello! How can I help?",
}
```

`inboundPolicy: "allowlist"`는 낮은 보증의 발신자 ID 스크리닝입니다. 플러그인은 프로바이더가 제공한 `From` 값을 정규화하고 `allowFrom`과 비교합니다. 웹훅 검증은 프로바이더 delivery 및 페이로드 무결성을 인증하지만, PSTN/VoIP 발신자 번호 소유권을 증명하지는 않습니다. `allowFrom`을 강력한 발신자 아이덴티티가 아닌 발신자 ID 필터링으로 취급하십시오.

자동 응답은 에이전트 시스템을 사용합니다. 다음으로 조정하십시오:

- `responseModel`
- `responseSystemPrompt`
- `responseTimeoutMs`

### 음성 출력 계약

자동 응답의 경우 Voice Call은 시스템 프롬프트에 엄격한 음성 출력 계약을 추가합니다:

- `{"spoken":"..."}`

Voice Call은 그런 다음 방어적으로 음성 텍스트를 추출합니다:

- 추론/오류 콘텐츠로 표시된 페이로드는 무시합니다.
- 직접 JSON, 펜스드 JSON, 또는 인라인 `"spoken"` 키를 파싱합니다.
- 일반 텍스트로 폴백하고 likely 계획/메타 도입 단락을 제거합니다.

이렇게 하면 음성 재생이 발신자 대면 텍스트에 집중되고 계획 텍스트가 오디오에 누출되지 않습니다.

### 대화 시작 동작

아웃바운드 `conversation` 통화의 경우, 첫 번째 메시지 처리는 라이브 재생 상태와 연결됩니다:

- 할주 큐 지우기 및 자동 응답은 초기 인사말이 활성 재생 중인 동안에만 억제됩니다.
- 초기 재생이 실패하면 통화는 `listening` 상태로 돌아가고 초기 메시지는 재시도를 위해 큐에 남습니다.
- Twilio 스트리밍의 경우 초기 재생은 추가 지연 없이 스트림 연결 시 시작됩니다.

### Twilio 스트림 연결 해제 유예

Twilio 미디어 스트림이 연결 해제될 때 Voice Call은 통화를 자동 종료하기 전에 `2000ms`를 기다립니다:

- 해당 기간 내에 스트림이 재연결되면 자동 종료가 취소됩니다.
- 유예 기간 후 스트림이 재등록되지 않으면, 중단된 활성 통화를 방지하기 위해 통화가 종료됩니다.

## CLI

```bash
openclaw voicecall call --to "+15555550123" --message "Hello from OpenClaw"
openclaw voicecall start --to "+15555550123"   # call의 별칭
openclaw voicecall continue --call-id &lt;id&gt; --message "Any questions?"
openclaw voicecall speak --call-id &lt;id&gt; --message "One moment"
openclaw voicecall end --call-id &lt;id&gt;
openclaw voicecall status --call-id &lt;id&gt;
openclaw voicecall tail
openclaw voicecall latency                     # 로그에서 턴 지연 요약
openclaw voicecall expose --mode funnel
```

`latency`는 기본 voice-call 저장 경로에서 `calls.jsonl`을 읽습니다. `--file &lt;path&gt;`를 사용하여 다른 로그를 가리키고 `--last &lt;n&gt;`을 사용하여 분석을 마지막 N개 레코드로 제한하십시오(기본값 200). 출력에는 턴 지연 및 듣기 대기 시간에 대한 p50/p90/p99가 포함됩니다.

## 에이전트 도구

도구 이름: `voice_call`

액션:

- `initiate_call` (message, to?, mode?)
- `continue_call` (callId, message)
- `speak_to_user` (callId, message)
- `end_call` (callId)
- `get_status` (callId)

이 레포에는 `skills/voice-call/SKILL.md`에 일치하는 스킬 문서가 있습니다.

## 게이트웨이 RPC

- `voicecall.initiate` (`to?`, `message`, `mode?`)
- `voicecall.continue` (`callId`, `message`)
- `voicecall.speak` (`callId`, `message`)
- `voicecall.end` (`callId`)
- `voicecall.status` (`callId`)
