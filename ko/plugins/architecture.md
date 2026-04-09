---
summary: "OpenClaw 플러그인 시스템의 내부 아키텍처, 기능(capability) 모델, 로드 파이프라인, 레지스트리, 런타임 헬퍼에 대한 심층 레퍼런스"
read_when:
  - 플러그인 시스템의 내부 동작 방식을 깊이 이해해야 할 때
  - 새로운 기능(capability)이나 프로바이더/채널 플러그인을 설계할 때
  - 플러그인 로드 파이프라인, 레지스트리, 런타임 헬퍼의 계약을 확인할 때
title: "플러그인 아키텍처"
---

# 플러그인 내부 구조

# 플러그인 내부 구조

<Info>
  이 문서는 **심층 아키텍처 레퍼런스**입니다. 실용적인 가이드는 다음을 참조하십시오.

  * [플러그인 설치 및 사용](/tools/plugin) — 사용자 가이드
  * [시작하기](/plugins/building-plugins) — 첫 번째 플러그인 튜토리얼
  * [채널 플러그인](/plugins/sdk-channel-plugins) — 메시징 채널 구축
  * [프로바이더 플러그인](/plugins/sdk-provider-plugins) — 모델 프로바이더 구축
  * [SDK 개요](/plugins/sdk-overview) — 임포트 맵 및 등록 API
</Info>

이 페이지는 OpenClaw 플러그인 시스템의 내부 아키텍처를 다룹니다.

## 공개 capability 모델

Capability는 OpenClaw 내부의 공개적인 **네이티브 플러그인** 모델입니다. 모든 네이티브 OpenClaw 플러그인은 하나 이상의 capability 타입에 대해 등록됩니다.

| Capability             | 등록 메서드                                        | 예시 플러그인                        |
| ---------------------- | ------------------------------------------------ | ------------------------------------ |
| 텍스트 추론            | `api.registerProvider(...)`                      | `openai`, `anthropic`                |
| CLI 추론 백엔드        | `api.registerCliBackend(...)`                    | `openai`, `anthropic`                |
| 음성                   | `api.registerSpeechProvider(...)`                | `elevenlabs`, `microsoft`            |
| 실시간 전사            | `api.registerRealtimeTranscriptionProvider(...)` | `openai`                             |
| 실시간 음성            | `api.registerRealtimeVoiceProvider(...)`         | `openai`                             |
| 미디어 이해            | `api.registerMediaUnderstandingProvider(...)`    | `openai`, `google`                   |
| 이미지 생성            | `api.registerImageGenerationProvider(...)`       | `openai`, `google`, `fal`, `minimax` |
| 음악 생성              | `api.registerMusicGenerationProvider(...)`       | `google`, `minimax`                  |
| 비디오 생성            | `api.registerVideoGenerationProvider(...)`       | `qwen`                               |
| 웹 페치                | `api.registerWebFetchProvider(...)`              | `firecrawl`                          |
| 웹 검색                | `api.registerWebSearchProvider(...)`             | `google`                             |
| 채널 / 메시징          | `api.registerChannel(...)`                       | `msteams`, `matrix`                  |

capability를 하나도 등록하지 않고 hook, 도구, 서비스만 제공하는 플러그인은 **레거시 hook-only** 플러그인입니다. 이 패턴도 여전히 완전히 지원됩니다.

### 외부 호환성 입장

capability 모델은 코어에 이미 도입되어 번들/네이티브 플러그인에서 오늘날 사용되고 있지만, 외부 플러그인 호환성은 "내보내졌으므로 고정되어 있다"보다 더 엄격한 기준이 필요합니다.

현재 가이드라인:

* **기존 외부 플러그인:** hook 기반 통합을 그대로 동작하도록 유지합니다. 이를 호환성 기준선으로 취급하십시오.
* **새로운 번들/네이티브 플러그인:** 벤더별 reach-in이나 새로운 hook-only 설계 대신 명시적인 capability 등록을 선호합니다.
* **capability 등록을 채택하는 외부 플러그인:** 허용되지만, 문서가 명시적으로 계약을 안정적이라고 표시하지 않는 한 capability별 헬퍼 표면은 진화하는 것으로 취급하십시오.

실용적인 규칙:

* capability 등록 API가 의도된 방향입니다
* 전환 기간 동안 외부 플러그인에게는 레거시 hook이 가장 안전한 무중단 경로로 남아 있습니다
* 내보낸 헬퍼 서브패스가 모두 동등한 것은 아닙니다. 우발적인 헬퍼 내보내기가 아니라 좁게 문서화된 계약을 선호하십시오

### 플러그인 형태

OpenClaw는 로드된 모든 플러그인을 정적 메타데이터가 아니라 실제 등록 동작에 따라 형태로 분류합니다.

* **plain-capability** — 정확히 하나의 capability 타입을 등록합니다 (예: `mistral`처럼 프로바이더 전용 플러그인)
* **hybrid-capability** — 여러 capability 타입을 등록합니다 (예: `openai`는 텍스트 추론, 음성, 미디어 이해, 이미지 생성을 소유)
* **hook-only** — hook만 등록합니다(타입드 또는 커스텀). capability, 도구, 커맨드, 서비스는 없습니다
* **non-capability** — 도구, 커맨드, 서비스 또는 라우트를 등록하지만 capability는 없습니다

플러그인의 형태와 capability 분포를 확인하려면 `openclaw plugins inspect <id>`를 사용하십시오. 자세한 내용은 [CLI 레퍼런스](/cli/plugins#inspect)를 참조하십시오.

### 레거시 hook

`before_agent_start` hook은 hook-only 플러그인을 위한 호환성 경로로 계속 지원됩니다. 레거시 실제 플러그인들이 여전히 이에 의존합니다.

방향성:

* 계속 동작하도록 유지
* 레거시로 문서화
* 모델/프로바이더 재정의 작업에는 `before_model_resolve`를 선호
* 프롬프트 변경 작업에는 `before_prompt_build`를 선호
* 실제 사용이 감소하고 픽스처 커버리지가 마이그레이션 안전성을 증명한 후에만 제거

### 호환성 신호

`openclaw doctor`나 `openclaw plugins inspect <id>`를 실행하면 다음 레이블 중 하나가 보일 수 있습니다.

| 신호                       | 의미                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| **config valid**           | 구성이 정상 파싱되고 플러그인이 해결됨                            |
| **compatibility advisory** | 플러그인이 지원되지만 오래된 패턴을 사용 중 (예: `hook-only`)     |
| **legacy warning**         | 플러그인이 더 이상 권장되지 않는 `before_agent_start`를 사용 중   |
| **hard error**             | 구성이 유효하지 않거나 플러그인 로드 실패                         |

`hook-only`나 `before_agent_start` 모두 오늘 당장 플러그인을 깨뜨리지는 않습니다. `hook-only`는 권고 수준이며, `before_agent_start`는 경고만 트리거합니다. 이 신호들은 `openclaw status --all`과 `openclaw plugins doctor`에도 나타납니다.

## 아키텍처 개요

OpenClaw의 플러그인 시스템은 네 개의 계층으로 구성됩니다.

1. **매니페스트 + 디스커버리**
   OpenClaw는 구성된 경로, 워크스페이스 루트, 전역 확장 루트, 번들 확장에서 후보 플러그인을 찾습니다. 디스커버리는 네이티브 `openclaw.plugin.json` 매니페스트와 지원되는 번들 매니페스트를 먼저 읽습니다.
2. **활성화 + 검증**
   코어는 디스커버리된 플러그인이 활성화되어 있는지, 비활성화되어 있는지, 차단되었는지, 또는 메모리와 같은 독점 슬롯에 선택되었는지 결정합니다.
3. **런타임 로딩**
   네이티브 OpenClaw 플러그인은 jiti를 통해 인-프로세스로 로드되며 중앙 레지스트리에 capability를 등록합니다. 호환되는 번들은 런타임 코드를 임포트하지 않고 레지스트리 레코드로 정규화됩니다.
4. **표면 소비**
   OpenClaw의 나머지 부분은 레지스트리를 읽어 도구, 채널, 프로바이더 설정, hook, HTTP 라우트, CLI 커맨드, 서비스를 노출합니다.

특히 플러그인 CLI의 경우, 루트 커맨드 디스커버리는 두 단계로 분리됩니다.

* 파싱 타임 메타데이터는 `registerCli(..., { descriptors: [...] })`에서 제공됩니다
* 실제 플러그인 CLI 모듈은 지연 상태로 남아 있다가 첫 호출 시 등록될 수 있습니다

이렇게 하면 플러그인 소유의 CLI 코드가 플러그인 내부에 머물러 있으면서도 OpenClaw가 파싱 전에 루트 커맨드 이름을 예약할 수 있습니다.

중요한 설계 경계:

* 디스커버리 + 구성 검증은 플러그인 코드를 실행하지 않고 **매니페스트/스키마 메타데이터**만으로 동작해야 합니다
* 네이티브 런타임 동작은 플러그인 모듈의 `register(api)` 경로에서 옵니다

이 분리 덕분에 OpenClaw는 전체 런타임이 활성화되기 전에 구성을 검증하고, 누락/비활성화된 플러그인을 설명하며, UI/스키마 힌트를 구축할 수 있습니다.

### 채널 플러그인과 공유 메시지 도구

채널 플러그인은 일반 채팅 액션을 위한 별도의 전송/편집/리액션 도구를 등록할 필요가 없습니다. OpenClaw는 코어에 하나의 공유 `message` 도구를 유지하고, 채널 플러그인은 그 뒤에서 채널별 디스커버리와 실행 동작을 소유합니다.

현재 경계는 다음과 같습니다.

* 코어는 공유 `message` 도구 호스트, 프롬프트 와이어링, 세션/스레드 기록, 실행 디스패치를 소유합니다
* 채널 플러그인은 스코프 액션 디스커버리, capability 디스커버리, 채널별 스키마 프래그먼트를 소유합니다
* 채널 플러그인은 대화 ID가 스레드 ID를 인코딩하거나 부모 대화에서 상속받는 방식과 같은 프로바이더별 세션 대화 문법을 소유합니다
* 채널 플러그인은 자신의 액션 어댑터를 통해 최종 액션을 실행합니다

채널 플러그인의 경우 SDK 표면은 `ChannelMessageActionAdapter.describeMessageTool(...)`입니다. 이 통합 디스커버리 호출은 플러그인이 가시적인 액션, capability, 스키마 기여분을 함께 반환하도록 하여 이들이 서로 어긋나지 않게 합니다.

코어는 이 디스커버리 단계에 런타임 스코프를 전달합니다. 중요한 필드는 다음과 같습니다.

* `accountId`
* `currentChannelId`
* `currentThreadTs`
* `currentMessageId`
* `sessionKey`
* `sessionId`
* `agentId`
* 신뢰된 인바운드 `requesterSenderId`

이것은 컨텍스트에 민감한 플러그인에게 중요합니다. 채널은 코어의 `message` 도구에 채널별 분기를 하드코딩하지 않고도 활성 계정, 현재 방/스레드/메시지 또는 신뢰된 요청자 신원에 따라 메시지 액션을 숨기거나 노출할 수 있습니다.

이것이 임베디드 러너 라우팅 변경이 여전히 플러그인 작업인 이유입니다. 러너는 현재 채팅/세션 신원을 플러그인 디스커버리 경계로 전달하여 공유 `message` 도구가 현재 턴에 대해 올바른 채널 소유 표면을 노출하도록 책임집니다.

채널 소유 실행 헬퍼의 경우, 번들 플러그인은 실행 런타임을 자체 확장 모듈 안에 유지해야 합니다. 코어는 더 이상 `src/agents/tools` 아래에서 Discord, Slack, Telegram 또는 WhatsApp 메시지 액션 런타임을 소유하지 않습니다. 우리는 별도의 `plugin-sdk/*-action-runtime` 서브패스를 게시하지 않으며, 번들 플러그인은 확장 소유 모듈에서 자체 로컬 런타임 코드를 직접 임포트해야 합니다.

동일한 경계가 일반적으로 프로바이더 명명 SDK 심에도 적용됩니다. 코어는 Slack, Discord, Signal, WhatsApp 또는 유사한 확장을 위한 채널별 편의 배럴을 임포트해서는 안 됩니다. 코어가 특정 동작을 필요로 한다면, 번들 플러그인 자체의 `api.ts` / `runtime-api.ts` 배럴을 사용하거나 그 필요성을 공유 SDK의 좁은 일반 capability로 승격해야 합니다.

특히 여론조사(poll)의 경우 두 가지 실행 경로가 있습니다.

* `outbound.sendPoll`은 공통 여론조사 모델에 맞는 채널을 위한 공유 기준선입니다
* `actions.handleAction("poll")`은 채널별 여론조사 의미론이나 추가 여론조사 매개변수를 위한 선호 경로입니다

코어는 이제 플러그인 여론조사 디스패치가 액션을 거부할 때까지 공유 여론조사 파싱을 지연합니다. 그래야 플러그인 소유 여론조사 핸들러가 일반 여론조사 파서에 먼저 차단되지 않고 채널별 여론조사 필드를 수락할 수 있습니다.

전체 시작 시퀀스는 [로드 파이프라인](#load-pipeline)을 참조하십시오.

## Capability 소유 모델

OpenClaw는 네이티브 플러그인을 관련 없는 통합의 잡동사니가 아니라 **회사** 또는 **기능**에 대한 소유 경계로 취급합니다.

이는 다음을 의미합니다.

* 회사 플러그인은 보통 해당 회사의 모든 OpenClaw 대상 표면을 소유해야 합니다
* 기능 플러그인은 보통 자신이 도입하는 전체 기능 표면을 소유해야 합니다
* 채널은 프로바이더 동작을 임시로 재구현하지 말고 공유 코어 capability를 소비해야 합니다

예시:

* 번들 `openai` 플러그인은 OpenAI 모델 프로바이더 동작과 OpenAI 음성 + 실시간 음성 + 미디어 이해 + 이미지 생성 동작을 소유합니다
* 번들 `elevenlabs` 플러그인은 ElevenLabs 음성 동작을 소유합니다
* 번들 `microsoft` 플러그인은 Microsoft 음성 동작을 소유합니다
* 번들 `google` 플러그인은 Google 모델 프로바이더 동작과 Google 미디어 이해 + 이미지 생성 + 웹 검색 동작을 소유합니다
* 번들 `firecrawl` 플러그인은 Firecrawl 웹 페치 동작을 소유합니다
* 번들 `minimax`, `mistral`, `moonshot`, `zai` 플러그인은 각자의 미디어 이해 백엔드를 소유합니다
* 번들 `qwen` 플러그인은 Qwen 텍스트 프로바이더 동작과 미디어 이해 및 비디오 생성 동작을 소유합니다
* `voice-call` 플러그인은 기능 플러그인입니다. 콜 트랜스포트, 도구, CLI, 라우트, Twilio 미디어 스트림 브리징을 소유하지만, 벤더 플러그인을 직접 임포트하는 대신 공유 음성 + 실시간 전사 및 실시간 음성 capability를 소비합니다

의도된 최종 상태는 다음과 같습니다.

* OpenAI는 텍스트 모델, 음성, 이미지, 앞으로의 비디오에 걸쳐 있더라도 하나의 플러그인 안에 존재합니다
* 다른 벤더도 자체 표면 영역에 대해 동일하게 할 수 있습니다
* 채널은 어느 벤더 플러그인이 프로바이더를 소유하는지에 신경 쓰지 않습니다. 채널은 코어가 노출하는 공유 capability 계약을 소비합니다

이것이 핵심 구분입니다.

* **플러그인** = 소유 경계
* **capability** = 여러 플러그인이 구현하거나 소비할 수 있는 코어 계약

따라서 OpenClaw가 비디오 같은 새로운 도메인을 추가할 때 첫 번째 질문은 "어떤 프로바이더가 비디오 처리를 하드코딩해야 할까?"가 아닙니다. 첫 번째 질문은 "코어 비디오 capability 계약이 무엇인가?"입니다. 그 계약이 존재하면 벤더 플러그인은 그에 등록할 수 있고 채널/기능 플러그인은 그것을 소비할 수 있습니다.

capability가 아직 존재하지 않는다면 올바른 조치는 보통 다음과 같습니다.

1. 코어에 누락된 capability를 정의합니다
2. 타입된 방식으로 플러그인 API/런타임을 통해 노출합니다
3. 해당 capability에 대해 채널/기능을 연결합니다
4. 벤더 플러그인이 구현을 등록하도록 합니다

이렇게 하면 소유권이 명시적으로 유지되면서도 단일 벤더나 일회성 플러그인별 코드 경로에 의존하는 코어 동작을 피할 수 있습니다.

### Capability 계층화

코드가 어디에 속해야 하는지 결정할 때 다음 멘탈 모델을 사용하십시오.

* **코어 capability 계층**: 공유 오케스트레이션, 정책, 폴백, 구성 병합 규칙, 전달 의미론, 타입된 계약
* **벤더 플러그인 계층**: 벤더별 API, 인증, 모델 카탈로그, 음성 합성, 이미지 생성, 미래의 비디오 백엔드, 사용량 엔드포인트
* **채널/기능 플러그인 계층**: Slack/Discord/voice-call 등 코어 capability를 소비하고 이를 표면에 제시하는 통합

예를 들어 TTS는 다음 형태를 따릅니다.

* 코어는 응답 시점 TTS 정책, 폴백 순서, 환경설정, 채널 전달을 소유합니다
* `openai`, `elevenlabs`, `microsoft`는 합성 구현을 소유합니다
* `voice-call`은 텔레포니 TTS 런타임 헬퍼를 소비합니다

동일한 패턴이 미래의 capability에도 선호되어야 합니다.

### 다중 capability 회사 플러그인 예시

회사 플러그인은 외부에서 보았을 때 응집력 있게 느껴져야 합니다. OpenClaw가 모델, 음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성, 비디오 생성, 웹 페치, 웹 검색에 대한 공유 계약을 가지고 있다면 벤더는 한 곳에서 모든 표면을 소유할 수 있습니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
import type { OpenClawPluginDefinition } from "openclaw/plugin-sdk/plugin-entry";
import {
  describeImageWithModel,
  transcribeOpenAiCompatibleAudio,
} from "openclaw/plugin-sdk/media-understanding";

const plugin: OpenClawPluginDefinition = {
  id: "exampleai",
  name: "ExampleAI",
  register(api) {
    api.registerProvider({
      id: "exampleai",
      // auth/model catalog/runtime hooks
    });

    api.registerSpeechProvider({
      id: "exampleai",
      // vendor speech config — implement the SpeechProviderPlugin interface directly
    });

    api.registerMediaUnderstandingProvider({
      id: "exampleai",
      capabilities: ["image", "audio", "video"],
      async describeImage(req) {
        return describeImageWithModel({
          provider: "exampleai",
          model: req.model,
          input: req.input,
        });
      },
      async transcribeAudio(req) {
        return transcribeOpenAiCompatibleAudio({
          provider: "exampleai",
          model: req.model,
          input: req.input,
        });
      },
    });

    api.registerWebSearchProvider(
      createPluginBackedWebSearchProvider({
        id: "exampleai-search",
        // credential + fetch logic
      }),
    );
  },
};

export default plugin;
```

중요한 것은 정확한 헬퍼 이름이 아닙니다. 형태가 중요합니다.

* 하나의 플러그인이 벤더 표면을 소유합니다
* 코어는 여전히 capability 계약을 소유합니다
* 채널과 기능 플러그인은 벤더 코드가 아닌 `api.runtime.*` 헬퍼를 소비합니다
* 계약 테스트는 플러그인이 소유를 주장하는 capability를 실제로 등록했는지 단언할 수 있습니다

### Capability 예시: 비디오 이해

OpenClaw는 이미 이미지/오디오/비디오 이해를 하나의 공유 capability로 취급합니다. 거기에도 동일한 소유 모델이 적용됩니다.

1. 코어는 미디어 이해 계약을 정의합니다
2. 벤더 플러그인은 해당되는 경우 `describeImage`, `transcribeAudio`, `describeVideo`를 등록합니다
3. 채널과 기능 플러그인은 벤더 코드에 직접 연결하는 대신 공유 코어 동작을 소비합니다

이렇게 하면 한 프로바이더의 비디오 가정을 코어에 굽는 것을 피할 수 있습니다. 플러그인은 벤더 표면을 소유하고, 코어는 capability 계약과 폴백 동작을 소유합니다.

비디오 생성은 이미 동일한 시퀀스를 사용합니다. 코어는 타입된 capability 계약과 런타임 헬퍼를 소유하고, 벤더 플러그인은 그에 대한 `api.registerVideoGenerationProvider(...)` 구현을 등록합니다.

구체적인 롤아웃 체크리스트가 필요합니까? [Capability Cookbook](/tools/capability-cookbook)을 참조하십시오.

## 계약과 강제

플러그인 API 표면은 의도적으로 타입되고 `OpenClawPluginApi`에 중앙집중화되어 있습니다. 이 계약은 플러그인이 의존할 수 있는 지원되는 등록 지점과 런타임 헬퍼를 정의합니다.

이것이 중요한 이유는 다음과 같습니다.

* 플러그인 작성자는 하나의 안정적인 내부 표준을 얻습니다
* 코어는 두 플러그인이 동일한 프로바이더 ID를 등록하는 것과 같은 중복 소유를 거부할 수 있습니다
* 시작 시 잘못된 형식의 등록에 대해 실행 가능한 진단을 표면화할 수 있습니다
* 계약 테스트는 번들 플러그인 소유권을 강제하고 조용한 드리프트를 방지할 수 있습니다

강제에는 두 계층이 있습니다.

1. **런타임 등록 강제**
   플러그인 레지스트리는 플러그인이 로드될 때 등록을 검증합니다. 예시: 중복 프로바이더 ID, 중복 음성 프로바이더 ID, 잘못된 형식의 등록은 정의되지 않은 동작이 아닌 플러그인 진단을 생성합니다.
2. **계약 테스트**
   번들 플러그인은 테스트 실행 중 계약 레지스트리에 기록되어 OpenClaw가 소유를 명시적으로 단언할 수 있습니다. 오늘날 이는 모델 프로바이더, 음성 프로바이더, 웹 검색 프로바이더, 번들 등록 소유권에 사용됩니다.

실용적 효과는 OpenClaw가 어떤 플러그인이 어떤 표면을 소유하는지 사전에 알고 있다는 것입니다. 이로 인해 소유권이 암묵적이지 않고 선언적이며 타입되고 테스트 가능하기 때문에 코어와 채널이 매끄럽게 구성될 수 있습니다.

### 계약에 포함되어야 하는 것

좋은 플러그인 계약은 다음과 같습니다.

* 타입됨
* 작음
* capability별
* 코어 소유
* 여러 플러그인이 재사용 가능
* 채널/기능이 벤더 지식 없이 소비 가능

나쁜 플러그인 계약은 다음과 같습니다.

* 코어에 숨겨진 벤더별 정책
* 레지스트리를 우회하는 일회성 플러그인 이스케이프 해치
* 채널 코드가 벤더 구현에 직접 손을 뻗는 것
* `OpenClawPluginApi`나 `api.runtime`의 일부가 아닌 임시 런타임 객체

의심스러울 때는 추상화 수준을 올리십시오. 먼저 capability를 정의한 다음 플러그인이 그것에 플러그인하도록 하십시오.

## 실행 모델

네이티브 OpenClaw 플러그인은 게이트웨이와 함께 **인-프로세스**로 실행됩니다. 샌드박스되지 않습니다. 로드된 네이티브 플러그인은 코어 코드와 동일한 프로세스 수준의 신뢰 경계를 갖습니다.

함의:

* 네이티브 플러그인은 도구, 네트워크 핸들러, hook, 서비스를 등록할 수 있습니다
* 네이티브 플러그인의 버그는 게이트웨이를 크래시시키거나 불안정하게 만들 수 있습니다
* 악의적인 네이티브 플러그인은 OpenClaw 프로세스 내에서의 임의 코드 실행과 동등합니다

호환되는 번들은 기본적으로 더 안전합니다. OpenClaw가 현재 이를 메타데이터/콘텐츠 팩으로 취급하기 때문입니다. 현재 릴리스에서 이는 대부분 번들 skill을 의미합니다.

비번들 플러그인에는 허용 목록과 명시적인 설치/로드 경로를 사용하십시오. 워크스페이스 플러그인은 프로덕션 기본값이 아니라 개발 시점 코드로 취급하십시오.

번들 워크스페이스 패키지 이름의 경우, 플러그인 ID를 npm 이름에 고정시키십시오. 기본적으로 `@openclaw/<id>`를 사용하거나, 패키지가 의도적으로 더 좁은 플러그인 역할을 노출할 때는 `-provider`, `-plugin`, `-speech`, `-sandbox`, `-media-understanding`과 같은 승인된 타입 접미사를 사용하십시오.

중요한 신뢰 관련 주의사항:

* `plugins.allow`는 소스 출처가 아닌 **플러그인 ID**를 신뢰합니다.
* 번들 플러그인과 동일한 ID를 가진 워크스페이스 플러그인은 해당 워크스페이스 플러그인이 활성화/허용 목록에 있을 때 의도적으로 번들 사본을 가립니다.
* 이는 로컬 개발, 패치 테스트, 핫픽스에 정상적이고 유용합니다.

## 내보내기 경계

OpenClaw는 구현 편의가 아닌 capability를 내보냅니다.

capability 등록은 공개로 유지하십시오. 비계약 헬퍼 내보내기는 다듬으십시오.

* 번들 플러그인별 헬퍼 서브패스
* 공개 API로 의도되지 않은 런타임 배선 서브패스
* 벤더별 편의 헬퍼
* 구현 세부사항인 설정/온보딩 헬퍼

일부 번들 플러그인 헬퍼 서브패스는 호환성과 번들 플러그인 유지보수를 위해 생성된 SDK 내보내기 맵에 여전히 남아 있습니다. 현재 예시로는 `plugin-sdk/feishu`, `plugin-sdk/feishu-setup`, `plugin-sdk/zalo`, `plugin-sdk/zalo-setup`, 그리고 여러 `plugin-sdk/matrix*` 심이 있습니다. 이들은 새로운 서드파티 플러그인을 위한 권장 SDK 패턴이 아니라 예약된 구현 세부사항 내보내기로 취급하십시오.

## 로드 파이프라인

시작 시 OpenClaw는 대략 다음을 수행합니다.

1. 후보 플러그인 루트를 디스커버합니다
2. 네이티브 또는 호환 번들 매니페스트와 패키지 메타데이터를 읽습니다
3. 안전하지 않은 후보를 거부합니다
4. 플러그인 구성을 정규화합니다 (`plugins.enabled`, `allow`, `deny`, `entries`, `slots`, `load.paths`)
5. 각 후보에 대해 활성화를 결정합니다
6. jiti를 통해 활성화된 네이티브 모듈을 로드합니다
7. 네이티브 `register(api)` (또는 레거시 별칭인 `activate(api)`) hook을 호출하고 등록을 플러그인 레지스트리에 수집합니다
8. 레지스트리를 커맨드/런타임 표면에 노출합니다

<Note>
  `activate`는 `register`의 레거시 별칭입니다. 로더는 존재하는 쪽을 해석하고(`def.register ?? def.activate`) 같은 지점에서 호출합니다. 모든 번들 플러그인은 `register`를 사용합니다. 새 플러그인에는 `register`를 선호하십시오.
</Note>

안전 게이트는 런타임 실행 **이전에** 발생합니다. 엔트리가 플러그인 루트를 벗어나거나, 경로가 world-writable이거나, 비번들 플러그인에 대해 경로 소유권이 수상해 보일 때 후보가 차단됩니다.

### 매니페스트 우선 동작

매니페스트는 컨트롤 플레인의 진실의 원천입니다. OpenClaw는 이를 사용하여 다음을 수행합니다.

* 플러그인을 식별합니다
* 선언된 채널/skill/구성 스키마 또는 번들 capability를 디스커버합니다
* `plugins.entries.<id>.config`를 검증합니다
* 컨트롤 UI 레이블/플레이스홀더를 보강합니다
* 설치/카탈로그 메타데이터를 표시합니다

네이티브 플러그인의 경우, 런타임 모듈은 데이터 플레인 부분입니다. hook, 도구, 커맨드 또는 프로바이더 흐름과 같은 실제 동작을 등록합니다.

### 로더가 캐싱하는 것

OpenClaw는 다음에 대해 짧은 인-프로세스 캐시를 유지합니다.

* 디스커버리 결과
* 매니페스트 레지스트리 데이터
* 로드된 플러그인 레지스트리

이 캐시는 폭발적인 시작과 반복 커맨드 오버헤드를 줄입니다. 이들은 영속성이 아니라 수명이 짧은 성능 캐시로 생각하면 안전합니다.

성능 참고사항:

* 이 캐시를 비활성화하려면 `OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE=1` 또는 `OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE=1`을 설정하십시오.
* `OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS`와 `OPENCLAW_PLUGIN_MANIFEST_CACHE_MS`로 캐시 윈도우를 튜닝할 수 있습니다.

## 레지스트리 모델

로드된 플러그인은 임의의 코어 전역을 직접 변경하지 않습니다. 중앙 플러그인 레지스트리에 등록합니다.

레지스트리는 다음을 추적합니다.

* 플러그인 레코드(신원, 출처, 기원, 상태, 진단)
* 도구
* 레거시 hook과 타입된 hook
* 채널
* 프로바이더
* 게이트웨이 RPC 핸들러
* HTTP 라우트
* CLI 등록자
* 백그라운드 서비스
* 플러그인 소유 커맨드

코어 기능은 플러그인 모듈과 직접 대화하는 대신 해당 레지스트리에서 읽습니다. 이렇게 하면 로딩이 단방향으로 유지됩니다.

* 플러그인 모듈 -> 레지스트리 등록
* 코어 런타임 -> 레지스트리 소비

이 분리는 유지보수성에 중요합니다. 이는 대부분의 코어 표면이 "모든 플러그인 모듈을 특수 케이스로 처리"하는 것이 아니라 "레지스트리를 읽기"라는 하나의 통합 지점만 필요하다는 것을 의미합니다.

## 대화 바인딩 콜백

대화를 바인딩하는 플러그인은 승인이 해결될 때 반응할 수 있습니다.

바인드 요청이 승인되거나 거부된 후 콜백을 받으려면 `api.onConversationBindingResolved(...)`를 사용하십시오.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export default {
  id: "my-plugin",
  register(api) {
    api.onConversationBindingResolved(async (event) => {
      if (event.status === "approved") {
        // A binding now exists for this plugin + conversation.
        console.log(event.binding?.conversationId);
        return;
      }

      // The request was denied; clear any local pending state.
      console.log(event.request.conversation.conversationId);
    });
  },
};
```

콜백 페이로드 필드:

* `status`: `"approved"` 또는 `"denied"`
* `decision`: `"allow-once"`, `"allow-always"`, 또는 `"deny"`
* `binding`: 승인된 요청에 대한 해결된 바인딩
* `request`: 원래 요청 요약, 분리 힌트, 발신자 ID, 대화 메타데이터

이 콜백은 알림 전용입니다. 누가 대화를 바인딩할 수 있는지를 변경하지 않으며, 코어 승인 처리가 완료된 후 실행됩니다.

## 프로바이더 런타임 hook

프로바이더 플러그인에는 이제 두 개의 계층이 있습니다.

* 매니페스트 메타데이터: 런타임 로드 전의 저렴한 프로바이더 환경 인증 조회를 위한 `providerAuthEnvVars`, 인증을 공유하는 프로바이더 변형을 위한 `providerAuthAliases`, 런타임 로드 전의 저렴한 채널 환경/설정 조회를 위한 `channelEnvVars`, 런타임 로드 전의 저렴한 온보딩/인증 선택 레이블과 CLI 플래그 메타데이터를 위한 `providerAuthChoices`
* 구성 타임 hook: `catalog` / 레거시 `discovery` 및 `applyConfigDefaults`
* 런타임 hook: `normalizeModelId`, `normalizeTransport`, `normalizeConfig`, `applyNativeStreamingUsageCompat`, `resolveConfigApiKey`, `resolveSyntheticAuth`, `resolveExternalAuthProfiles`, `shouldDeferSyntheticProfileAuth`, `resolveDynamicModel`, `prepareDynamicModel`, `normalizeResolvedModel`, `contributeResolvedModelCompat`, `capabilities`, `normalizeToolSchemas`, `inspectToolSchemas`, `resolveReasoningOutputMode`, `prepareExtraParams`, `createStreamFn`, `wrapStreamFn`, `resolveTransportTurnState`, `resolveWebSocketSessionPolicy`, `formatApiKey`, `refreshOAuth`, `buildAuthDoctorHint`, `matchesContextOverflowError`, `classifyFailoverReason`, `isCacheTtlEligible`, `buildMissingAuthMessage`, `suppressBuiltInModel`, `augmentModelCatalog`, `isBinaryThinking`, `supportsXHighThinking`, `resolveDefaultThinkingLevel`, `isModernModelRef`, `prepareRuntimeAuth`, `resolveUsageAuth`, `fetchUsageSnapshot`, `createEmbeddingProvider`, `buildReplayPolicy`, `sanitizeReplayHistory`, `validateReplayTurns`, `onModelSelected`

OpenClaw는 여전히 일반 에이전트 루프, 페일오버, 전사본 처리, 도구 정책을 소유합니다. 이 hook들은 완전한 커스텀 추론 트랜스포트가 필요 없이 프로바이더별 동작을 위한 확장 표면입니다.

프로바이더에 env 기반 자격 증명이 있고 일반 인증/상태/모델 피커 경로가 플러그인 런타임을 로드하지 않고 그것을 볼 수 있어야 할 때 매니페스트 `providerAuthEnvVars`를 사용하십시오. 한 프로바이더 ID가 다른 프로바이더 ID의 환경 변수, 인증 프로필, 구성 지원 인증, API 키 온보딩 선택을 재사용해야 할 때 매니페스트 `providerAuthAliases`를 사용하십시오. 온보딩/인증 선택 CLI 표면이 프로바이더 런타임을 로드하지 않고 프로바이더의 선택 ID, 그룹 레이블, 단순한 원 플래그 인증 배선을 알아야 할 때 매니페스트 `providerAuthChoices`를 사용하십시오. 온보딩 레이블이나 OAuth 클라이언트 ID/클라이언트 시크릿 설정 변수와 같은 운영자 대상 힌트를 위해 프로바이더 런타임 `envVars`를 유지하십시오.

일반 셸 env 폴백, 구성/상태 확인 또는 설정 프롬프트가 채널 런타임을 로드하지 않고 볼 수 있어야 하는 env 기반 인증이나 설정이 채널에 있을 때 매니페스트 `channelEnvVars`를 사용하십시오.

### Hook 순서와 사용법

모델/프로바이더 플러그인의 경우, OpenClaw는 hook을 대략 다음 순서로 호출합니다. "사용 시점" 열은 빠른 결정 가이드입니다.

| #  | Hook                              | 역할                                                                                                          | 사용 시점                                                                                                                                   |
| -- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | `catalog`                         | `models.json` 생성 중 프로바이더 구성을 `models.providers`에 게시                                             | 프로바이더가 카탈로그나 기본 base URL을 소유함                                                                                              |
| 2  | `applyConfigDefaults`             | 구성 머티리얼라이즈 중 프로바이더 소유 전역 구성 기본값 적용                                                  | 기본값이 인증 모드, env 또는 프로바이더 모델 패밀리 의미에 의존함                                                                           |
| -- | *(내장 모델 조회)*                | OpenClaw가 먼저 일반 레지스트리/카탈로그 경로를 시도함                                                        | *(플러그인 hook 아님)*                                                                                                                      |
| 3  | `normalizeModelId`                | 조회 전에 레거시 또는 프리뷰 모델 ID 별칭 정규화                                                              | 프로바이더가 정규 모델 해결 전에 별칭 정리를 소유함                                                                                         |
| 4  | `normalizeTransport`              | 일반 모델 어셈블리 전에 프로바이더 패밀리 `api` / `baseUrl` 정규화                                            | 프로바이더가 동일 트랜스포트 패밀리 내 커스텀 프로바이더 ID의 트랜스포트 정리를 소유함                                                      |
| 5  | `normalizeConfig`                 | 런타임/프로바이더 해결 전에 `models.providers.<id>` 정규화                                                    | 프로바이더에 플러그인과 함께 있어야 할 구성 정리가 필요함. 번들 Google 패밀리 헬퍼도 지원되는 Google 구성 엔트리를 백스톱함                  |
| 6  | `applyNativeStreamingUsageCompat` | 구성 프로바이더에 네이티브 스트리밍 사용량 호환 재작성 적용                                                   | 프로바이더에 엔드포인트 기반 네이티브 스트리밍 사용량 메타데이터 수정이 필요함                                                              |
| 7  | `resolveConfigApiKey`             | 런타임 인증 로드 전에 구성 프로바이더의 env 마커 인증 해결                                                    | 프로바이더에 프로바이더 소유 env 마커 API 키 해결이 있음. `amazon-bedrock`에는 여기에 내장 AWS env 마커 리졸버도 있음                       |
| 8  | `resolveSyntheticAuth`            | 평문 저장 없이 로컬/셀프 호스팅 또는 구성 지원 인증 표면화                                                    | 프로바이더가 합성/로컬 자격 증명 마커로 동작할 수 있음                                                                                      |
| 9  | `resolveExternalAuthProfiles`     | 프로바이더 소유 외부 인증 프로필 오버레이. CLI/앱 소유 자격 증명의 기본 `persistence`는 `runtime-only`        | 프로바이더가 복사된 refresh 토큰을 영속화하지 않고 외부 인증 자격 증명을 재사용함                                                           |
| 10 | `shouldDeferSyntheticProfileAuth` | 저장된 합성 프로필 플레이스홀더를 env/구성 지원 인증 뒤로 낮춤                                                | 프로바이더가 우선순위를 차지해서는 안 되는 합성 플레이스홀더 프로필을 저장함                                                                |
| 11 | `resolveDynamicModel`             | 로컬 레지스트리에 아직 없는 프로바이더 소유 모델 ID에 대한 동기 폴백                                          | 프로바이더가 임의의 업스트림 모델 ID를 수락함                                                                                               |
| 12 | `prepareDynamicModel`             | 비동기 웜업, 그 후 `resolveDynamicModel`이 다시 실행됨                                                        | 프로바이더가 알려지지 않은 ID를 해결하기 전에 네트워크 메타데이터가 필요함                                                                  |
| 13 | `normalizeResolvedModel`          | 임베디드 러너가 해결된 모델을 사용하기 전 최종 재작성                                                         | 프로바이더에 트랜스포트 재작성이 필요하지만 여전히 코어 트랜스포트를 사용함                                                                 |
| 14 | `contributeResolvedModelCompat`   | 다른 호환 트랜스포트 뒤의 벤더 모델에 대한 호환 플래그 기여                                                   | 프로바이더가 프로바이더를 점유하지 않고 프록시 트랜스포트에서 자체 모델을 인식함                                                            |
| 15 | `capabilities`                    | 공유 코어 로직에 사용되는 프로바이더 소유 전사본/도구 메타데이터                                              | 프로바이더에 전사본/프로바이더 패밀리 특이사항이 필요함                                                                                     |
| 16 | `normalizeToolSchemas`            | 임베디드 러너가 도구 스키마를 보기 전에 정규화                                                                | 프로바이더에 트랜스포트 패밀리 스키마 정리가 필요함                                                                                         |
| 17 | `inspectToolSchemas`              | 정규화 후 프로바이더 소유 스키마 진단 표면화                                                                  | 프로바이더가 코어에 프로바이더별 규칙을 가르치지 않고 키워드 경고를 원함                                                                    |
| 18 | `resolveReasoningOutputMode`      | 네이티브 vs 태그드 추론 출력 계약 선택                                                                        | 프로바이더에 네이티브 필드 대신 태그드 추론/최종 출력이 필요함                                                                              |
| 19 | `prepareExtraParams`              | 일반 스트림 옵션 래퍼 전에 요청 매개변수 정규화                                                               | 프로바이더에 기본 요청 매개변수나 프로바이더별 매개변수 정리가 필요함                                                                       |
| 20 | `createStreamFn`                  | 일반 스트림 경로를 커스텀 트랜스포트로 완전히 교체                                                            | 프로바이더에 래퍼가 아닌 커스텀 와이어 프로토콜이 필요함                                                                                    |
| 21 | `wrapStreamFn`                    | 일반 래퍼가 적용된 후의 스트림 래퍼                                                                           | 프로바이더에 커스텀 트랜스포트 없이 요청 헤더/본문/모델 호환 래퍼가 필요함                                                                  |
| 22 | `resolveTransportTurnState`       | 네이티브 per-turn 트랜스포트 헤더나 메타데이터 첨부                                                           | 프로바이더가 일반 트랜스포트에서 프로바이더 네이티브 턴 신원을 전송하길 원함                                                                |
| 23 | `resolveWebSocketSessionPolicy`   | 네이티브 WebSocket 헤더나 세션 쿨다운 정책 첨부                                                               | 프로바이더가 일반 WS 트랜스포트에서 세션 헤더나 폴백 정책을 튜닝하길 원함                                                                   |
| 24 | `formatApiKey`                    | 인증 프로필 포매터: 저장된 프로필이 런타임 `apiKey` 문자열이 됨                                               | 프로바이더가 추가 인증 메타데이터를 저장하고 커스텀 런타임 토큰 모양이 필요함                                                               |
| 25 | `refreshOAuth`                    | 커스텀 refresh 엔드포인트나 refresh 실패 정책을 위한 OAuth refresh 재정의                                     | 프로바이더가 공유 `pi-ai` 리프레셔에 맞지 않음                                                                                              |
| 26 | `buildAuthDoctorHint`             | OAuth refresh가 실패했을 때 추가되는 복구 힌트                                                                | 프로바이더에 refresh 실패 후 프로바이더 소유 인증 복구 가이드가 필요함                                                                      |
| 27 | `matchesContextOverflowError`     | 프로바이더 소유 컨텍스트 윈도우 오버플로 매처                                                                 | 일반 휴리스틱이 놓칠 수 있는 원시 오버플로 오류가 프로바이더에 있음                                                                         |
| 28 | `classifyFailoverReason`          | 프로바이더 소유 페일오버 이유 분류                                                                            | 프로바이더가 원시 API/트랜스포트 오류를 rate-limit/overload 등으로 매핑할 수 있음                                                           |
| 29 | `isCacheTtlEligible`              | 프록시/백홀 프로바이더를 위한 프롬프트 캐시 정책                                                              | 프로바이더에 프록시별 캐시 TTL 게이팅이 필요함                                                                                              |
| 30 | `buildMissingAuthMessage`         | 일반 누락 인증 복구 메시지 대체                                                                               | 프로바이더에 프로바이더별 누락 인증 복구 힌트가 필요함                                                                                      |
| 31 | `suppressBuiltInModel`            | 오래된 업스트림 모델 억제 및 선택적 사용자 대면 오류 힌트                                                     | 프로바이더가 오래된 업스트림 행을 숨기거나 벤더 힌트로 교체해야 함                                                                          |
| 32 | `augmentModelCatalog`             | 디스커버리 후에 추가되는 합성/최종 카탈로그 행                                                                | 프로바이더에 `models list`와 피커에 합성 forward-compat 행이 필요함                                                                         |
| 33 | `isBinaryThinking`                | 바이너리 사고 프로바이더를 위한 on/off 추론 토글                                                              | 프로바이더가 바이너리 사고 on/off만 노출함                                                                                                  |
| 34 | `supportsXHighThinking`           | 선택된 모델에 대한 `xhigh` 추론 지원                                                                          | 프로바이더가 모델 일부에만 `xhigh`를 원함                                                                                                   |
| 35 | `resolveDefaultThinkingLevel`     | 특정 모델 패밀리에 대한 기본 `/think` 레벨                                                                    | 프로바이더가 모델 패밀리에 대한 기본 `/think` 정책을 소유함                                                                                 |
| 36 | `isModernModelRef`                | 라이브 프로필 필터 및 스모크 선택을 위한 모던 모델 매처                                                       | 프로바이더가 라이브/스모크 선호 모델 매칭을 소유함                                                                                          |
| 37 | `prepareRuntimeAuth`              | 추론 직전에 구성된 자격 증명을 실제 런타임 토큰/키로 교환                                                     | 프로바이더에 토큰 교환이나 단기 요청 자격 증명이 필요함                                                                                     |
| 38 | `resolveUsageAuth`                | `/usage` 및 관련 상태 표면을 위한 사용량/청구 자격 증명 해결                                                  | 프로바이더에 커스텀 사용량/쿼터 토큰 파싱 또는 다른 사용량 자격 증명이 필요함                                                               |
| 39 | `fetchUsageSnapshot`              | 인증이 해결된 후 프로바이더별 사용량/쿼터 스냅샷 페치 및 정규화                                               | 프로바이더에 프로바이더별 사용량 엔드포인트나 페이로드 파서가 필요함                                                                        |
| 40 | `createEmbeddingProvider`         | 메모리/검색을 위한 프로바이더 소유 임베딩 어댑터 빌드                                                         | 메모리 임베딩 동작이 프로바이더 플러그인에 속함                                                                                             |
| 41 | `buildReplayPolicy`               | 프로바이더에 대한 전사본 처리를 제어하는 리플레이 정책 반환                                                   | 프로바이더에 커스텀 전사본 정책이 필요함 (예: thinking 블록 제거)                                                                           |
| 42 | `sanitizeReplayHistory`           | 일반 전사본 정리 후 리플레이 히스토리 재작성                                                                  | 프로바이더에 공유 압축 헬퍼를 넘어서는 프로바이더별 리플레이 재작성이 필요함                                                                |
| 43 | `validateReplayTurns`             | 임베디드 러너 전 최종 리플레이 턴 검증이나 재구성                                                             | 일반 정화 후 프로바이더 트랜스포트에 더 엄격한 턴 검증이 필요함                                                                             |
| 44 | `onModelSelected`                 | 프로바이더 소유 선택 후 사이드 이펙트 실행                                                                    | 모델이 활성화될 때 프로바이더에 텔레메트리나 프로바이더 소유 상태가 필요함                                                                  |

`normalizeModelId`, `normalizeTransport`, `normalizeConfig`는 먼저 매칭된 프로바이더 플러그인을 확인한 다음, 하나가 실제로 모델 ID나 트랜스포트/구성을 변경할 때까지 다른 hook 지원 프로바이더 플러그인을 통해 폴스루합니다. 이렇게 하면 호출자가 어느 번들 플러그인이 재작성을 소유하는지 알 필요 없이 별칭/호환 프로바이더 심이 동작합니다. 프로바이더 hook이 지원되는 Google 패밀리 구성 엔트리를 재작성하지 않으면 번들 Google 구성 노멀라이저가 여전히 그 호환성 정리를 적용합니다.

프로바이더에 완전 커스텀 와이어 프로토콜이나 커스텀 요청 실행기가 필요한 경우 그것은 다른 종류의 확장입니다. 이 hook들은 여전히 OpenClaw의 일반 추론 루프에서 실행되는 프로바이더 동작을 위한 것입니다.

### 프로바이더 예시

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
api.registerProvider({
  id: "example-proxy",
  label: "Example Proxy",
  auth: [],
  catalog: {
    order: "simple",
    run: async (ctx) => {
      const apiKey = ctx.resolveProviderApiKey("example-proxy").apiKey;
      if (!apiKey) {
        return null;
      }
      return {
        provider: {
          baseUrl: "https://proxy.example.com/v1",
          apiKey,
          api: "openai-completions",
          models: [{ id: "auto", name: "Auto" }],
        },
      };
    },
  },
  resolveDynamicModel: (ctx) => ({
    id: ctx.modelId,
    name: ctx.modelId,
    provider: "example-proxy",
    api: "openai-completions",
    baseUrl: "https://proxy.example.com/v1",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 8192,
  }),
  prepareRuntimeAuth: async (ctx) => {
    const exchanged = await exchangeToken(ctx.apiKey);
    return {
      apiKey: exchanged.token,
      baseUrl: exchanged.baseUrl,
      expiresAt: exchanged.expiresAt,
    };
  },
  resolveUsageAuth: async (ctx) => {
    const auth = await ctx.resolveOAuthToken();
    return auth ? { token: auth.token } : null;
  },
  fetchUsageSnapshot: async (ctx) => {
    return await fetchExampleProxyUsage(ctx.token, ctx.timeoutMs, ctx.fetchFn);
  },
});
```

### 내장 예시

* Anthropic은 `resolveDynamicModel`, `capabilities`, `buildAuthDoctorHint`, `resolveUsageAuth`, `fetchUsageSnapshot`, `isCacheTtlEligible`, `resolveDefaultThinkingLevel`, `applyConfigDefaults`, `isModernModelRef`, `wrapStreamFn`을 사용합니다. Claude 4.6 forward-compat, 프로바이더 패밀리 힌트, 인증 복구 가이드, 사용량 엔드포인트 통합, 프롬프트 캐시 적격성, 인증 인식 구성 기본값, Claude 기본/적응형 사고 정책, 베타 헤더를 위한 Anthropic별 스트림 셰이핑, `/fast` / `serviceTier`, `context1m`을 소유하기 때문입니다.
* Anthropic의 Claude별 스트림 헬퍼는 당분간 번들 플러그인의 자체 공개 `api.ts` / `contract-api.ts` 심에 남아 있습니다. 해당 패키지 표면은 한 프로바이더의 베타 헤더 규칙을 중심으로 일반 SDK를 확장하는 대신 `wrapAnthropicProviderStream`, `resolveAnthropicBetas`, `resolveAnthropicFastMode`, `resolveAnthropicServiceTier`, 그리고 하위 수준 Anthropic 래퍼 빌더를 내보냅니다.
* OpenAI는 `resolveDynamicModel`, `normalizeResolvedModel`, `capabilities`에 더해 `buildMissingAuthMessage`, `suppressBuiltInModel`, `augmentModelCatalog`, `supportsXHighThinking`, `isModernModelRef`를 사용합니다. GPT-5.4 forward-compat, 직접 OpenAI `openai-completions` -> `openai-responses` 정규화, Codex 인식 인증 힌트, Spark 억제, 합성 OpenAI 리스트 행, GPT-5 사고/라이브 모델 정책을 소유하기 때문입니다. `openai-responses-defaults` 스트림 패밀리는 속성 헤더, `/fast`/`serviceTier`, 텍스트 verbosity, 네이티브 Codex 웹 검색, 추론 호환 페이로드 셰이핑, Responses 컨텍스트 관리를 위한 공유 네이티브 OpenAI Responses 래퍼를 소유합니다.
* OpenRouter는 `catalog`에 더해 `resolveDynamicModel`과 `prepareDynamicModel`을 사용합니다. 프로바이더가 패스스루이고 OpenClaw의 정적 카탈로그 업데이트 전에 새 모델 ID를 노출할 수 있기 때문입니다. 또한 프로바이더별 요청 헤더, 라우팅 메타데이터, 추론 패치, 프롬프트 캐시 정책을 코어 밖으로 유지하기 위해 `capabilities`, `wrapStreamFn`, `isCacheTtlEligible`를 사용합니다. 리플레이 정책은 `passthrough-gemini` 패밀리에서 오며, `openrouter-thinking` 스트림 패밀리는 프록시 추론 주입과 지원되지 않는 모델/`auto` 스킵을 소유합니다.
* GitHub Copilot은 `catalog`, `auth`, `resolveDynamicModel`, `capabilities`에 더해 `prepareRuntimeAuth`와 `fetchUsageSnapshot`을 사용합니다. 프로바이더 소유 디바이스 로그인, 모델 폴백 동작, Claude 전사본 특이사항, GitHub 토큰 -> Copilot 토큰 교환, 프로바이더 소유 사용량 엔드포인트가 필요하기 때문입니다.
* OpenAI Codex는 `catalog`, `resolveDynamicModel`, `normalizeResolvedModel`, `refreshOAuth`, `augmentModelCatalog`에 더해 `prepareExtraParams`, `resolveUsageAuth`, `fetchUsageSnapshot`을 사용합니다. 여전히 코어 OpenAI 트랜스포트에서 실행되지만 자체 트랜스포트/base URL 정규화, OAuth refresh 폴백 정책, 기본 트랜스포트 선택, 합성 Codex 카탈로그 행, ChatGPT 사용량 엔드포인트 통합을 소유하기 때문입니다. 직접 OpenAI와 동일한 `openai-responses-defaults` 스트림 패밀리를 공유합니다.
* Google AI Studio와 Gemini CLI OAuth는 `resolveDynamicModel`, `buildReplayPolicy`, `sanitizeReplayHistory`, `resolveReasoningOutputMode`, `wrapStreamFn`, `isModernModelRef`를 사용합니다. `google-gemini` 리플레이 패밀리가 Gemini 3.1 forward-compat 폴백, 네이티브 Gemini 리플레이 검증, 부트스트랩 리플레이 정화, 태그드 추론 출력 모드, 모던 모델 매칭을 소유하는 반면, `google-thinking` 스트림 패밀리는 Gemini 사고 페이로드 정규화를 소유하기 때문입니다. Gemini CLI OAuth는 토큰 포매팅, 토큰 파싱, 쿼터 엔드포인트 배선을 위해 `formatApiKey`, `resolveUsageAuth`, `fetchUsageSnapshot`도 사용합니다.
* Anthropic Vertex는 `anthropic-by-model` 리플레이 패밀리를 통해 `buildReplayPolicy`를 사용하여 Claude별 리플레이 정리가 모든 `anthropic-messages` 트랜스포트가 아닌 Claude ID에만 스코프되도록 합니다.
* Amazon Bedrock은 `buildReplayPolicy`, `matchesContextOverflowError`, `classifyFailoverReason`, `resolveDefaultThinkingLevel`을 사용합니다. Anthropic-on-Bedrock 트래픽에 대한 Bedrock별 throttle/not-ready/context-overflow 오류 분류를 소유하기 때문입니다. 리플레이 정책은 여전히 동일한 Claude 전용 `anthropic-by-model` 가드를 공유합니다.
* OpenRouter, Kilocode, Opencode, Opencode Go는 `passthrough-gemini` 리플레이 패밀리를 통해 `buildReplayPolicy`를 사용합니다. 네이티브 Gemini 리플레이 검증이나 부트스트랩 재작성 없이 Gemini 모델을 OpenAI 호환 트랜스포트를 통해 프록시하고 Gemini thought-signature 정화가 필요하기 때문입니다.
* MiniMax는 `hybrid-anthropic-openai` 리플레이 패밀리를 통해 `buildReplayPolicy`를 사용합니다. 한 프로바이더가 Anthropic-message와 OpenAI 호환 의미론 모두를 소유하기 때문입니다. Anthropic 측에서는 Claude 전용 thinking-block 드로핑을 유지하면서 추론 출력 모드를 네이티브로 재정의하며, `minimax-fast-mode` 스트림 패밀리는 공유 스트림 경로에서 빠른 모드 모델 재작성을 소유합니다.
* Moonshot은 `catalog`에 더해 `wrapStreamFn`을 사용합니다. 여전히 공유 OpenAI 트랜스포트를 사용하지만 프로바이더 소유 사고 페이로드 정규화가 필요하기 때문입니다. `moonshot-thinking` 스트림 패밀리는 구성과 `/think` 상태를 네이티브 바이너리 사고 페이로드에 매핑합니다.
* Kilocode는 `catalog`, `capabilities`, `wrapStreamFn`, `isCacheTtlEligible`를 사용합니다. 프로바이더 소유 요청 헤더, 추론 페이로드 정규화, Gemini 전사본 힌트, Anthropic 캐시 TTL 게이팅이 필요하기 때문입니다. `kilocode-thinking` 스트림 패밀리는 명시적 추론 페이로드를 지원하지 않는 `kilo/auto`와 기타 프록시 모델 ID를 건너뛰면서 Kilo 사고 주입을 공유 프록시 스트림 경로에 유지합니다.
* Z.AI는 `resolveDynamicModel`, `prepareExtraParams`, `wrapStreamFn`, `isCacheTtlEligible`, `isBinaryThinking`, `isModernModelRef`, `resolveUsageAuth`, `fetchUsageSnapshot`을 사용합니다. GLM-5 폴백, `tool_stream` 기본값, 바이너리 사고 UX, 모던 모델 매칭, 사용량 인증 + 쿼터 페치를 모두 소유하기 때문입니다. `tool-stream-default-on` 스트림 패밀리는 기본 활성화된 `tool_stream` 래퍼를 프로바이더별 수작업 글루 밖에 유지합니다.
* xAI는 `normalizeResolvedModel`, `normalizeTransport`, `contributeResolvedModelCompat`, `prepareExtraParams`, `wrapStreamFn`, `resolveSyntheticAuth`, `resolveDynamicModel`, `isModernModelRef`를 사용합니다. 네이티브 xAI Responses 트랜스포트 정규화, Grok fast-mode 별칭 재작성, 기본 `tool_stream`, 엄격 도구/추론 페이로드 정리, 플러그인 소유 도구를 위한 폴백 인증 재사용, forward-compat Grok 모델 해결, xAI 도구 스키마 프로파일, 지원되지 않는 스키마 키워드, 네이티브 `web_search`, HTML 엔티티 도구 호출 인수 디코딩과 같은 프로바이더 소유 호환 패치를 소유하기 때문입니다.
* Mistral, OpenCode Zen, OpenCode Go는 전사본/도구 특이사항을 코어 밖에 유지하기 위해 `capabilities`만 사용합니다.
* `byteplus`, `cloudflare-ai-gateway`, `huggingface`, `kimi-coding`, `nvidia`, `qianfan`, `synthetic`, `together`, `venice`, `vercel-ai-gateway`, `volcengine`과 같은 카탈로그 전용 번들 프로바이더는 `catalog`만 사용합니다.
* Qwen은 텍스트 프로바이더에 대해 `catalog`를 사용하고 멀티모달 표면에 대해 공유 미디어 이해 및 비디오 생성 등록을 사용합니다.
* MiniMax와 Xiaomi는 `catalog`에 사용량 hook을 사용합니다. 추론은 여전히 공유 트랜스포트를 통해 실행되지만 `/usage` 동작이 플러그인 소유이기 때문입니다.

## 런타임 헬퍼

플러그인은 `api.runtime`을 통해 선택된 코어 헬퍼에 접근할 수 있습니다. TTS의 경우:

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const clip = await api.runtime.tts.textToSpeech({
  text: "Hello from OpenClaw",
  cfg: api.config,
});

const result = await api.runtime.tts.textToSpeechTelephony({
  text: "Hello from OpenClaw",
  cfg: api.config,
});

const voices = await api.runtime.tts.listVoices({
  provider: "elevenlabs",
  cfg: api.config,
});
```

참고사항:

* `textToSpeech`는 파일/음성 노트 표면을 위한 일반 코어 TTS 출력 페이로드를 반환합니다.
* 코어 `messages.tts` 구성과 프로바이더 선택을 사용합니다.
* PCM 오디오 버퍼 + 샘플 레이트를 반환합니다. 플러그인은 프로바이더에 맞게 리샘플/인코딩해야 합니다.
* `listVoices`는 프로바이더별로 선택 사항입니다. 벤더 소유 음성 피커나 설정 흐름에 사용하십시오.
* 음성 목록에는 프로바이더 인식 피커를 위한 로케일, 성별, 성격 태그와 같은 더 풍부한 메타데이터가 포함될 수 있습니다.
* OpenAI와 ElevenLabs는 오늘 텔레포니를 지원합니다. Microsoft는 그렇지 않습니다.

플러그인은 또한 `api.registerSpeechProvider(...)`를 통해 음성 프로바이더를 등록할 수 있습니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
api.registerSpeechProvider({
  id: "acme-speech",
  label: "Acme Speech",
  isConfigured: ({ config }) => Boolean(config.messages?.tts),
  synthesize: async (req) => {
    return {
      audioBuffer: Buffer.from([]),
      outputFormat: "mp3",
      fileExtension: ".mp3",
      voiceCompatible: false,
    };
  },
});
```

참고사항:

* TTS 정책, 폴백, 응답 전달은 코어에 유지하십시오.
* 벤더 소유 합성 동작에는 음성 프로바이더를 사용하십시오.
* 레거시 Microsoft `edge` 입력은 `microsoft` 프로바이더 ID로 정규화됩니다.
* 선호되는 소유 모델은 회사 지향입니다. OpenClaw가 해당 capability 계약을 추가함에 따라 하나의 벤더 플러그인이 텍스트, 음성, 이미지 및 미래의 미디어 프로바이더를 소유할 수 있습니다.

이미지/오디오/비디오 이해의 경우, 플러그인은 일반 key/value bag 대신 하나의 타입된 미디어 이해 프로바이더를 등록합니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
api.registerMediaUnderstandingProvider({
  id: "google",
  capabilities: ["image", "audio", "video"],
  describeImage: async (req) => ({ text: "..." }),
  transcribeAudio: async (req) => ({ text: "..." }),
  describeVideo: async (req) => ({ text: "..." }),
});
```

참고사항:

* 오케스트레이션, 폴백, 구성, 채널 배선은 코어에 유지하십시오.
* 벤더 동작은 프로바이더 플러그인에 유지하십시오.
* 추가 확장은 타입 있는 상태를 유지해야 합니다: 새 선택적 메서드, 새 선택적 결과 필드, 새 선택적 capability.
* 비디오 생성은 이미 동일한 패턴을 따릅니다:
  * 코어는 capability 계약과 런타임 헬퍼를 소유합니다
  * 벤더 플러그인은 `api.registerVideoGenerationProvider(...)`를 등록합니다
  * 기능/채널 플러그인은 `api.runtime.videoGeneration.*`를 소비합니다

미디어 이해 런타임 헬퍼의 경우, 플러그인은 다음을 호출할 수 있습니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const image = await api.runtime.mediaUnderstanding.describeImageFile({
  filePath: "/tmp/inbound-photo.jpg",
  cfg: api.config,
  agentDir: "/tmp/agent",
});

const video = await api.runtime.mediaUnderstanding.describeVideoFile({
  filePath: "/tmp/inbound-video.mp4",
  cfg: api.config,
});
```

오디오 전사의 경우, 플러그인은 미디어 이해 런타임 또는 이전의 STT 별칭을 사용할 수 있습니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const { text } = await api.runtime.mediaUnderstanding.transcribeAudioFile({
  filePath: "/tmp/inbound-audio.ogg",
  cfg: api.config,
  // Optional when MIME cannot be inferred reliably:
  mime: "audio/ogg",
});
```

참고사항:

* `api.runtime.mediaUnderstanding.*`는 이미지/오디오/비디오 이해를 위한 선호되는 공유 표면입니다.
* 코어 미디어 이해 오디오 구성(`tools.media.audio`)과 프로바이더 폴백 순서를 사용합니다.
* 전사 출력이 생성되지 않을 때 `{ text: undefined }`를 반환합니다(예: 건너뛴/지원되지 않는 입력).
* `api.runtime.stt.transcribeAudioFile(...)`는 호환성 별칭으로 남아 있습니다.

플러그인은 또한 `api.runtime.subagent`를 통해 백그라운드 서브에이전트 실행을 시작할 수 있습니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const result = await api.runtime.subagent.run({
  sessionKey: "agent:main:subagent:search-helper",
  message: "Expand this query into focused follow-up searches.",
  provider: "openai",
  model: "gpt-4.1-mini",
  deliver: false,
});
```

참고사항:

* `provider`와 `model`은 선택적 실행별 재정의이며, 영속적인 세션 변경이 아닙니다.
* OpenClaw는 신뢰된 호출자에 대해서만 이 재정의 필드를 존중합니다.
* 플러그인 소유 폴백 실행의 경우, 운영자는 `plugins.entries.<id>.subagent.allowModelOverride: true`로 옵트인해야 합니다.
* 신뢰된 플러그인을 특정 정규 `provider/model` 대상으로 제한하려면 `plugins.entries.<id>.subagent.allowedModels`를 사용하거나, 임의의 대상을 명시적으로 허용하려면 `"*"`를 사용하십시오.
* 신뢰되지 않은 플러그인 서브에이전트 실행은 여전히 동작하지만, 재정의 요청은 조용히 폴백하는 대신 거부됩니다.

웹 검색의 경우, 플러그인은 에이전트 도구 배선에 손을 뻗지 않고 공유 런타임 헬퍼를 소비할 수 있습니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const providers = api.runtime.webSearch.listProviders({
  config: api.config,
});

const result = await api.runtime.webSearch.search({
  config: api.config,
  args: {
    query: "OpenClaw plugin runtime helpers",
    count: 5,
  },
});
```

플러그인은 또한 `api.registerWebSearchProvider(...)`를 통해 웹 검색 프로바이더를 등록할 수 있습니다.

참고사항:

* 프로바이더 선택, 자격 증명 해결, 공유 요청 의미론은 코어에 유지하십시오.
* 벤더별 검색 트랜스포트에는 웹 검색 프로바이더를 사용하십시오.
* `api.runtime.webSearch.*`는 에이전트 도구 래퍼에 의존하지 않고 검색 동작이 필요한 기능/채널 플러그인을 위한 선호되는 공유 표면입니다.

### `api.runtime.imageGeneration`

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const result = await api.runtime.imageGeneration.generate({
  config: api.config,
  args: { prompt: "A friendly lobster mascot", size: "1024x1024" },
});

const providers = api.runtime.imageGeneration.listProviders({
  config: api.config,
});
```

* `generate(...)`: 구성된 이미지 생성 프로바이더 체인을 사용하여 이미지를 생성합니다.
* `listProviders(...)`: 사용 가능한 이미지 생성 프로바이더와 그 capability를 나열합니다.

## 게이트웨이 HTTP 라우트

플러그인은 `api.registerHttpRoute(...)`로 HTTP 엔드포인트를 노출할 수 있습니다.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
api.registerHttpRoute({
  path: "/acme/webhook",
  auth: "plugin",
  match: "exact",
  handler: async (_req, res) => {
    res.statusCode = 200;
    res.end("ok");
    return true;
  },
});
```

라우트 필드:

* `path`: 게이트웨이 HTTP 서버 아래의 라우트 경로.
* `auth`: 필수. 일반 게이트웨이 인증을 요구하려면 `"gateway"`를, 플러그인 관리 인증/웹훅 검증에는 `"plugin"`을 사용하십시오.
* `match`: 선택 사항. `"exact"`(기본) 또는 `"prefix"`.
* `replaceExisting`: 선택 사항. 동일한 플러그인이 자체 기존 라우트 등록을 대체할 수 있게 합니다.
* `handler`: 라우트가 요청을 처리했을 때 `true`를 반환합니다.

참고사항:

* `api.registerHttpHandler(...)`는 제거되었으며 플러그인 로드 오류를 일으킵니다. 대신 `api.registerHttpRoute(...)`를 사용하십시오.
* 플러그인 라우트는 `auth`를 명시적으로 선언해야 합니다.
* 정확한 `path + match` 충돌은 `replaceExisting: true`가 아닌 한 거부되며, 한 플러그인은 다른 플러그인의 라우트를 대체할 수 없습니다.
* 다른 `auth` 수준을 가진 겹치는 라우트는 거부됩니다. `exact`/`prefix` 폴스루 체인은 동일한 인증 수준에서만 유지하십시오.
* `auth: "plugin"` 라우트는 운영자 런타임 스코프를 자동으로 받지 **않습니다**. 이들은 특권 게이트웨이 헬퍼 호출이 아니라 플러그인 관리 웹훅/서명 검증을 위한 것입니다.
* `auth: "gateway"` 라우트는 게이트웨이 요청 런타임 스코프 내에서 실행되지만, 그 스코프는 의도적으로 보수적입니다:
  * 공유 시크릿 bearer 인증(`gateway.auth.mode = "token"` / `"password"`)은 호출자가 `x-openclaw-scopes`를 전송하더라도 플러그인 라우트 런타임 스코프를 `operator.write`에 고정합니다
  * 신뢰된 신원 전달 HTTP 모드(예: `trusted-proxy` 또는 프라이빗 인그레스에서의 `gateway.auth.mode = "none"`)는 헤더가 명시적으로 존재할 때만 `x-openclaw-scopes`를 존중합니다
  * 해당 신원 전달 플러그인 라우트 요청에 `x-openclaw-scopes`가 없으면 런타임 스코프는 `operator.write`로 폴백됩니다
* 실용적 규칙: 게이트웨이 인증 플러그인 라우트가 암묵적인 관리자 표면이라고 가정하지 마십시오. 라우트에 관리자 전용 동작이 필요하면 신원 전달 인증 모드를 요구하고 명시적인 `x-openclaw-scopes` 헤더 계약을 문서화하십시오.

## 플러그인 SDK 임포트 경로

플러그인을 작성할 때 단일 `openclaw/plugin-sdk` 임포트 대신 SDK 서브패스를 사용하십시오.

* 플러그인 등록 기본 요소에는 `openclaw/plugin-sdk/plugin-entry`.
* 일반 공유 플러그인 대면 계약에는 `openclaw/plugin-sdk/core`.
* 루트 `openclaw.json` Zod 스키마 내보내기(`OpenClawSchema`)에는 `openclaw/plugin-sdk/config-schema`.
* 공유 설정/인증/응답/웹훅 배선을 위한 안정적인 채널 기본 요소: `openclaw/plugin-sdk/channel-setup`, `openclaw/plugin-sdk/setup-runtime`, `openclaw/plugin-sdk/setup-adapter-runtime`, `openclaw/plugin-sdk/setup-tools`, `openclaw/plugin-sdk/channel-pairing`, `openclaw/plugin-sdk/channel-contract`, `openclaw/plugin-sdk/channel-feedback`, `openclaw/plugin-sdk/channel-inbound`, `openclaw/plugin-sdk/channel-lifecycle`, `openclaw/plugin-sdk/channel-reply-pipeline`, `openclaw/plugin-sdk/command-auth`, `openclaw/plugin-sdk/secret-input`, `openclaw/plugin-sdk/webhook-ingress`.
  `channel-inbound`는 디바운스, mention 매칭, 인바운드 mention 정책 헬퍼, 엔벌로프 포매팅, 인바운드 엔벌로프 컨텍스트 헬퍼를 위한 공유 홈입니다.
  `channel-setup`은 좁은 선택적 설치 설정 심입니다.
  `setup-runtime`은 `setupEntry` / 지연 시작에 사용되는 런타임 안전 설정 표면이며, 임포트 안전 설정 패치 어댑터를 포함합니다.
  `setup-adapter-runtime`은 env 인식 계정 설정 어댑터 심입니다.
  `setup-tools`는 작은 CLI/아카이브/문서 헬퍼 심입니다(`formatCliCommand`, `detectBinary`, `extractArchive`, `resolveBrewExecutable`, `formatDocsLink`, `CONFIG_DIR`).
* 공유 런타임/구성 헬퍼를 위한 도메인 서브패스: `openclaw/plugin-sdk/channel-config-helpers`, `openclaw/plugin-sdk/allow-from`, `openclaw/plugin-sdk/channel-config-schema`, `openclaw/plugin-sdk/telegram-command-config`, `openclaw/plugin-sdk/channel-policy`, `openclaw/plugin-sdk/approval-gateway-runtime`, `openclaw/plugin-sdk/approval-handler-adapter-runtime`, `openclaw/plugin-sdk/approval-handler-runtime`, `openclaw/plugin-sdk/approval-runtime`, `openclaw/plugin-sdk/config-runtime`, `openclaw/plugin-sdk/infra-runtime`, `openclaw/plugin-sdk/agent-runtime`, `openclaw/plugin-sdk/lazy-runtime`, `openclaw/plugin-sdk/reply-history`, `openclaw/plugin-sdk/routing`, `openclaw/plugin-sdk/status-helpers`, `openclaw/plugin-sdk/text-runtime`, `openclaw/plugin-sdk/runtime-store`, `openclaw/plugin-sdk/directory-runtime`.
  `telegram-command-config`는 Telegram 커스텀 커맨드 정규화/검증을 위한 좁은 공개 심이며, 번들 Telegram 계약 표면이 일시적으로 사용 불가능하더라도 사용할 수 있습니다.
  `text-runtime`은 공유 텍스트/마크다운/로깅 심이며, 어시스턴트 가시 텍스트 제거, 마크다운 렌더/청킹 헬퍼, 수정(redaction) 헬퍼, 지시문 태그 헬퍼, 안전 텍스트 유틸리티를 포함합니다.
* 승인별 채널 심은 플러그인에 하나의 `approvalCapability` 계약을 선호해야 합니다. 그런 다음 코어는 승인 동작을 관련 없는 플러그인 필드에 섞는 대신 하나의 capability를 통해 승인 인증, 전달, 렌더링, 네이티브 라우팅, 지연 네이티브 핸들러 동작을 읽습니다.
* `openclaw/plugin-sdk/channel-runtime`은 더 이상 사용되지 않으며 이전 플러그인을 위한 호환성 심으로만 남아 있습니다. 새 코드는 더 좁은 일반 기본 요소를 임포트해야 하며, 레포 코드는 해당 심의 새 임포트를 추가해서는 안 됩니다.
* 번들 확장 내부는 비공개로 유지됩니다. 외부 플러그인은 `openclaw/plugin-sdk/*` 서브패스만 사용해야 합니다. OpenClaw 코어/테스트 코드는 플러그인 패키지 루트 아래의 `index.js`, `api.js`, `runtime-api.js`, `setup-entry.js` 등 레포 공개 진입점과 `login-qr-api.js` 같은 좁게 범위가 지정된 파일을 사용할 수 있습니다. 코어나 다른 확장에서 플러그인 패키지의 `src/*`를 결코 임포트하지 마십시오.
* 레포 진입점 분할:
  `<plugin-package-root>/api.js`는 헬퍼/타입 배럴,
  `<plugin-package-root>/runtime-api.js`는 런타임 전용 배럴,
  `<plugin-package-root>/index.js`는 번들 플러그인 엔트리,
  `<plugin-package-root>/setup-entry.js`는 설정 플러그인 엔트리입니다.
* 현재 번들 프로바이더 예시:
  * Anthropic은 `wrapAnthropicProviderStream`, 베타 헤더 헬퍼, `service_tier` 파싱과 같은 Claude 스트림 헬퍼를 위해 `api.js` / `contract-api.js`를 사용합니다.
  * OpenAI는 프로바이더 빌더, 기본 모델 헬퍼, 실시간 프로바이더 빌더를 위해 `api.js`를 사용합니다.
  * OpenRouter는 프로바이더 빌더와 온보딩/구성 헬퍼에 `api.js`를 사용하며, `register.runtime.js`는 레포 로컬 용도로 여전히 일반 `plugin-sdk/provider-stream` 헬퍼를 재내보낼 수 있습니다.
* 파사드 로드 공개 진입점은 존재하면 활성 런타임 구성 스냅샷을 선호한 다음, OpenClaw가 아직 런타임 스냅샷을 서비스하지 않을 때는 디스크의 해결된 구성 파일로 폴백됩니다.
* 일반 공유 기본 요소가 선호되는 공개 SDK 계약으로 남아 있습니다. 번들 채널 브랜드 헬퍼 심의 작은 예약 호환성 세트가 여전히 존재합니다. 이들을 새로운 서드파티 임포트 대상이 아니라 번들 유지보수/호환성 심으로 취급하십시오. 새로운 크로스 채널 계약은 여전히 일반 `plugin-sdk/*` 서브패스 또는 플러그인 로컬 `api.js` / `runtime-api.js` 배럴에 들어가야 합니다.

호환성 참고사항:

* 새 코드에서는 루트 `openclaw/plugin-sdk` 배럴을 피하십시오.
* 좁은 안정 기본 요소를 먼저 선호하십시오. 더 새로운 설정/페어링/응답/피드백/계약/인바운드/스레딩/커맨드/secret-input/웹훅/인프라/허용 목록/상태/메시지 도구 서브패스는 새 번들 및 외부 플러그인 작업을 위한 의도된 계약입니다.
  대상 파싱/매칭은 `openclaw/plugin-sdk/channel-targets`에 속합니다.
  메시지 액션 게이트와 리액션 메시지 ID 헬퍼는 `openclaw/plugin-sdk/channel-actions`에 속합니다.
* 번들 확장별 헬퍼 배럴은 기본적으로 안정적이지 않습니다. 헬퍼가 번들 확장에서만 필요하다면 `openclaw/plugin-sdk/<extension>`에 승격하는 대신 확장의 로컬 `api.js` 또는 `runtime-api.js` 심 뒤에 유지하십시오.
* 새 공유 헬퍼 심은 채널 브랜드가 아닌 일반적이어야 합니다. 공유 대상 파싱은 `openclaw/plugin-sdk/channel-targets`에 속합니다. 채널별 내부는 소유 플러그인의 로컬 `api.js` 또는 `runtime-api.js` 심 뒤에 유지됩니다.
* `image-generation`, `media-understanding`, `speech`와 같은 capability별 서브패스는 번들/네이티브 플러그인이 오늘날 사용하기 때문에 존재합니다. 그 존재 자체가 내보낸 모든 헬퍼가 장기적으로 고정된 외부 계약이라는 것을 의미하지는 않습니다.

## 메시지 도구 스키마

플러그인은 채널별 `describeMessageTool(...)` 스키마 기여분을 소유해야 합니다. 프로바이더별 필드는 공유 코어가 아닌 플러그인에 유지하십시오.

공유 가능한 포터블 스키마 프래그먼트의 경우, `openclaw/plugin-sdk/channel-actions`를 통해 내보낸 일반 헬퍼를 재사용하십시오.

* 버튼 그리드 스타일 페이로드를 위한 `createMessageToolButtonsSchema()`
* 구조화된 카드 페이로드를 위한 `createMessageToolCardSchema()`

스키마 형태가 한 프로바이더에만 의미가 있다면, 공유 SDK로 승격하는 대신 해당 플러그인의 자체 소스에서 정의하십시오.

## 채널 대상 해결

채널 플러그인은 채널별 대상 의미론을 소유해야 합니다. 공유 아웃바운드 호스트는 일반적인 상태로 유지하고 프로바이더 규칙에는 메시징 어댑터 표면을 사용하십시오.

* `messaging.inferTargetChatType({ to })`는 디렉토리 조회 전에 정규화된 대상이 `direct`, `group`, `channel` 중 무엇으로 취급되어야 하는지 결정합니다.
* `messaging.targetResolver.looksLikeId(raw, normalized)`는 입력이 디렉토리 검색 대신 ID 유사 해결로 바로 가야 하는지를 코어에 알려줍니다.
* `messaging.targetResolver.resolveTarget(...)`는 정규화 후나 디렉토리 미스 후 코어가 최종 프로바이더 소유 해결이 필요할 때의 플러그인 폴백입니다.
* `messaging.resolveOutboundSessionRoute(...)`는 대상이 해결된 후 프로바이더별 세션 라우트 구성을 소유합니다.

권장 분할:

* 피어/그룹을 검색하기 전에 발생해야 하는 카테고리 결정에는 `inferTargetChatType`을 사용하십시오.
* "이것을 명시적/네이티브 대상 ID로 취급" 체크에는 `looksLikeId`를 사용하십시오.
* 광범위한 디렉토리 검색이 아닌 프로바이더별 정규화 폴백에는 `resolveTarget`을 사용하십시오.
* chat ID, 스레드 ID, JID, 핸들, 룸 ID와 같은 프로바이더 네이티브 ID는 일반 SDK 필드가 아닌 `target` 값이나 프로바이더별 매개변수 안에 유지하십시오.

## 구성 지원 디렉토리

구성에서 디렉토리 엔트리를 파생하는 플러그인은 해당 로직을 플러그인에 유지하고 `openclaw/plugin-sdk/directory-runtime`의 공유 헬퍼를 재사용해야 합니다.

채널이 다음과 같은 구성 지원 피어/그룹을 필요로 할 때 사용하십시오.

* 허용 목록 기반 DM 피어
* 구성된 채널/그룹 맵
* 계정 스코프 정적 디렉토리 폴백

`directory-runtime`의 공유 헬퍼는 일반 작업만 처리합니다.

* 쿼리 필터링
* 제한 적용
* 중복 제거/정규화 헬퍼
* `ChannelDirectoryEntry[]` 빌드

채널별 계정 검사와 ID 정규화는 플러그인 구현에 유지되어야 합니다.

## 프로바이더 카탈로그

프로바이더 플러그인은 `registerProvider({ catalog: { run(...) { ... } } })`를 사용하여 추론용 모델 카탈로그를 정의할 수 있습니다.

`catalog.run(...)`는 OpenClaw가 `models.providers`에 작성하는 것과 동일한 모양을 반환합니다.

* 하나의 프로바이더 엔트리에 대한 `{ provider }`
* 여러 프로바이더 엔트리에 대한 `{ providers }`

플러그인이 프로바이더별 모델 ID, 기본 base URL 또는 인증 게이트 모델 메타데이터를 소유할 때 `catalog`를 사용하십시오.

`catalog.order`는 플러그인의 카탈로그가 OpenClaw의 내장 암묵적 프로바이더에 대해 언제 병합되는지 제어합니다.

* `simple`: 평범한 API 키 또는 env 기반 프로바이더
* `profile`: 인증 프로필이 존재할 때 나타나는 프로바이더
* `paired`: 여러 관련 프로바이더 엔트리를 합성하는 프로바이더
* `late`: 다른 암묵적 프로바이더 이후의 마지막 패스

나중의 프로바이더가 키 충돌에서 이기므로, 플러그인은 동일한 프로바이더 ID를 가진 내장 프로바이더 엔트리를 의도적으로 재정의할 수 있습니다.

호환성:

* `discovery`는 여전히 레거시 별칭으로 동작합니다
* `catalog`와 `discovery`가 모두 등록되면 OpenClaw는 `catalog`를 사용합니다

## 읽기 전용 채널 검사

플러그인이 채널을 등록한다면 `resolveAccount(...)`와 함께 `plugin.config.inspectAccount(cfg, accountId)` 구현을 선호하십시오.

이유:

* `resolveAccount(...)`는 런타임 경로입니다. 자격 증명이 완전히 머티리얼라이즈되었다고 가정할 수 있으며 필수 시크릿이 누락된 경우 빠르게 실패할 수 있습니다.
* `openclaw status`, `openclaw status --all`, `openclaw channels status`, `openclaw channels resolve`, doctor/config 수리 흐름과 같은 읽기 전용 커맨드 경로는 구성을 설명하기 위해 런타임 자격 증명을 머티리얼라이즈할 필요가 없어야 합니다.

권장 `inspectAccount(...)` 동작:

* 설명적인 계정 상태만 반환하십시오.
* `enabled`와 `configured`를 보존하십시오.
* 관련된 경우 자격 증명 소스/상태 필드를 포함하십시오:
  * `tokenSource`, `tokenStatus`
  * `botTokenSource`, `botTokenStatus`
  * `appTokenSource`, `appTokenStatus`
  * `signingSecretSource`, `signingSecretStatus`
* 읽기 전용 가용성을 보고하기 위해 원시 토큰 값을 반환할 필요는 없습니다. `tokenStatus: "available"`(과 일치하는 소스 필드)를 반환하는 것만으로 상태 스타일 커맨드에 충분합니다.
* 자격 증명이 SecretRef를 통해 구성되었지만 현재 커맨드 경로에서 사용 불가능한 경우 `configured_unavailable`을 사용하십시오.

이렇게 하면 읽기 전용 커맨드가 "구성되었지만 이 커맨드 경로에서 사용 불가"를 크래시하거나 계정이 구성되지 않은 것으로 잘못 보고하는 대신 보고할 수 있습니다.

## 패키지 팩

플러그인 디렉토리는 `openclaw.extensions`가 있는 `package.json`을 포함할 수 있습니다.

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "name": "my-pack",
  "openclaw": {
    "extensions": ["./src/safety.ts", "./src/tools.ts"],
    "setupEntry": "./src/setup-entry.ts"
  }
}
```

각 엔트리는 하나의 플러그인이 됩니다. 팩이 여러 확장을 나열하면 플러그인 ID는 `name/<fileBase>`가 됩니다.

플러그인이 npm 의존성을 임포트하는 경우, `node_modules`가 사용 가능하도록 해당 디렉토리에 설치하십시오(`npm install` / `pnpm install`).

보안 가드레일: 모든 `openclaw.extensions` 엔트리는 심볼릭 링크 해결 후에도 플러그인 디렉토리 안에 머물러야 합니다. 패키지 디렉토리를 벗어나는 엔트리는 거부됩니다.

보안 참고사항: `openclaw plugins install`은 `npm install --omit=dev --ignore-scripts`로 플러그인 의존성을 설치합니다(라이프사이클 스크립트 없음, 런타임 dev 의존성 없음). 플러그인 의존성 트리를 "순수 JS/TS"로 유지하고 `postinstall` 빌드가 필요한 패키지를 피하십시오.

선택 사항: `openclaw.setupEntry`는 가벼운 설정 전용 모듈을 가리킬 수 있습니다. OpenClaw가 비활성화된 채널 플러그인에 대한 설정 표면이 필요할 때, 또는 채널 플러그인이 활성화되었지만 아직 구성되지 않은 경우, 전체 플러그인 엔트리 대신 `setupEntry`를 로드합니다. 이렇게 하면 주 플러그인 엔트리가 도구, hook 또는 기타 런타임 전용 코드를 배선하는 경우에도 시작과 설정이 더 가벼워집니다.

선택 사항: `openclaw.startup.deferConfiguredChannelFullLoadUntilAfterListen`은 채널이 이미 구성된 경우에도 게이트웨이의 프리 리슨 시작 단계 동안 채널 플러그인을 동일한 `setupEntry` 경로로 옵트인할 수 있습니다.

`setupEntry`가 게이트웨이가 리스닝을 시작하기 전에 존재해야 하는 시작 표면을 완전히 다룰 때만 사용하십시오. 실제로 이는 설정 엔트리가 시작이 의존하는 모든 채널 소유 capability를 등록해야 한다는 의미입니다. 예를 들어:

* 채널 등록 자체
* 게이트웨이가 리스닝을 시작하기 전에 사용 가능해야 하는 HTTP 라우트
* 동일한 윈도우 동안 존재해야 하는 게이트웨이 메서드, 도구 또는 서비스

전체 엔트리가 여전히 필수 시작 capability를 소유한다면 이 플래그를 활성화하지 마십시오. 플러그인을 기본 동작으로 유지하고 OpenClaw가 시작 중에 전체 엔트리를 로드하도록 하십시오.

번들 채널은 또한 전체 채널 런타임이 로드되기 전에 코어가 참조할 수 있는 설정 전용 계약 표면 헬퍼를 게시할 수 있습니다. 현재 설정 승격 표면은 다음과 같습니다.

* `singleAccountKeysToMove`
* `namedAccountPromotionKeys`
* `resolveSingleAccountPromotionTarget(...)`

코어는 전체 플러그인 엔트리를 로드하지 않고 레거시 단일 계정 채널 구성을 `channels.<id>.accounts.*`로 승격해야 할 때 해당 표면을 사용합니다. Matrix가 현재 번들 예시입니다. 이름 있는 계정이 이미 존재할 때 인증/부트스트랩 키만 이름이 붙은 승격된 계정으로 이동시키고, 항상 `accounts.default`를 생성하는 대신 구성된 비정규 기본 계정 키를 보존할 수 있습니다.

이 설정 패치 어댑터는 번들 계약 표면 디스커버리를 지연으로 유지합니다. 임포트 시간은 가볍게 유지되고, 승격 표면은 모듈 임포트 시 번들 채널 시작을 다시 입력하는 대신 첫 사용 시에만 로드됩니다.

해당 시작 표면에 게이트웨이 RPC 메서드가 포함된 경우, 플러그인별 프리픽스에 유지하십시오. 코어 관리자 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`, `update.*`)는 예약되어 있으며, 플러그인이 더 좁은 스코프를 요청하더라도 항상 `operator.admin`으로 해결됩니다.

예시:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "name": "@scope/my-channel",
  "openclaw": {
    "extensions": ["./index.ts"],
    "setupEntry": "./setup-entry.ts",
    "startup": {
      "deferConfiguredChannelFullLoadUntilAfterListen": true
    }
  }
}
```

### 채널 카탈로그 메타데이터

채널 플러그인은 `openclaw.channel`을 통해 설정/디스커버리 메타데이터를 광고하고 `openclaw.install`을 통해 설치 힌트를 광고할 수 있습니다. 이렇게 하면 코어 카탈로그가 데이터 없는 상태로 유지됩니다.

예시:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "name": "@openclaw/nextcloud-talk",
  "openclaw": {
    "extensions": ["./index.ts"],
    "channel": {
      "id": "nextcloud-talk",
      "label": "Nextcloud Talk",
      "selectionLabel": "Nextcloud Talk (self-hosted)",
      "docsPath": "/channels/nextcloud-talk",
      "docsLabel": "nextcloud-talk",
      "blurb": "Self-hosted chat via Nextcloud Talk webhook bots.",
      "order": 65,
      "aliases": ["nc-talk", "nc"]
    },
    "install": {
      "npmSpec": "@openclaw/nextcloud-talk",
      "localPath": "<bundled-plugin-local-path>",
      "defaultChoice": "npm"
    }
  }
}
```

최소 예시 외에 유용한 `openclaw.channel` 필드:

* `detailLabel`: 더 풍부한 카탈로그/상태 표면을 위한 보조 레이블
* `docsLabel`: 문서 링크의 링크 텍스트 재정의
* `preferOver`: 이 카탈로그 엔트리가 능가해야 하는 낮은 우선순위 플러그인/채널 ID
* `selectionDocsPrefix`, `selectionDocsOmitLabel`, `selectionExtras`: 선택 표면 복사 제어
* `markdownCapable`: 아웃바운드 포매팅 결정을 위해 채널을 마크다운 지원으로 표시
* `exposure.configured`: `false`로 설정되면 구성된 채널 목록 표면에서 채널 숨김
* `exposure.setup`: `false`로 설정되면 대화형 설정/구성 피커에서 채널 숨김
* `exposure.docs`: 문서 탐색 표면에 대해 채널을 내부/비공개로 표시
* `showConfigured` / `showInSetup`: 호환성을 위해 여전히 받아들여지는 레거시 별칭. `exposure`를 선호
* `quickstartAllowFrom`: 채널을 표준 퀵스타트 `allowFrom` 흐름에 옵트인
* `forceAccountBinding`: 하나의 계정만 존재하는 경우에도 명시적 계정 바인딩을 요구
* `preferSessionLookupForAnnounceTarget`: 공지 대상 해결 시 세션 조회 선호

OpenClaw는 또한 **외부 채널 카탈로그**(예: MPM 레지스트리 내보내기)를 병합할 수 있습니다. 다음 중 하나에 JSON 파일을 드롭하십시오.

* `~/.openclaw/mpm/plugins.json`
* `~/.openclaw/mpm/catalog.json`
* `~/.openclaw/plugins/catalog.json`

또는 `OPENCLAW_PLUGIN_CATALOG_PATHS` (또는 `OPENCLAW_MPM_CATALOG_PATHS`)를 하나 이상의 JSON 파일로 가리키십시오(쉼표/세미콜론/`PATH`로 구분). 각 파일은 `{ "entries": [ { "name": "@scope/pkg", "openclaw": { "channel": {...}, "install": {...} } } ] }`를 포함해야 합니다. 파서는 또한 `"entries"` 키의 레거시 별칭으로 `"packages"` 또는 `"plugins"`도 받아들입니다.

## 컨텍스트 엔진 플러그인

컨텍스트 엔진 플러그인은 인제스트, 어셈블리, 컴팩션을 위한 세션 컨텍스트 오케스트레이션을 소유합니다. 플러그인에서 `api.registerContextEngine(id, factory)`로 등록한 다음 `plugins.slots.contextEngine`으로 활성 엔진을 선택하십시오.

플러그인이 메모리 검색이나 hook을 추가하는 것이 아니라 기본 컨텍스트 파이프라인을 교체하거나 확장해야 할 때 사용하십시오.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
import { buildMemorySystemPromptAddition } from "openclaw/plugin-sdk/core";

export default function (api) {
  api.registerContextEngine("lossless-claw", () => ({
    info: { id: "lossless-claw", name: "Lossless Claw", ownsCompaction: true },
    async ingest() {
      return { ingested: true };
    },
    async assemble({ messages, availableTools, citationsMode }) {
      return {
        messages,
        estimatedTokens: 0,
        systemPromptAddition: buildMemorySystemPromptAddition({
          availableTools: availableTools ?? new Set(),
          citationsMode,
        }),
      };
    },
    async compact() {
      return { ok: true, compacted: false };
    },
  }));
}
```

엔진이 컴팩션 알고리즘을 **소유하지 않는** 경우, `compact()`를 구현하고 명시적으로 위임하십시오.

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
import {
  buildMemorySystemPromptAddition,
  delegateCompactionToRuntime,
} from "openclaw/plugin-sdk/core";

export default function (api) {
  api.registerContextEngine("my-memory-engine", () => ({
    info: {
      id: "my-memory-engine",
      name: "My Memory Engine",
      ownsCompaction: false,
    },
    async ingest() {
      return { ingested: true };
    },
    async assemble({ messages, availableTools, citationsMode }) {
      return {
        messages,
        estimatedTokens: 0,
        systemPromptAddition: buildMemorySystemPromptAddition({
          availableTools: availableTools ?? new Set(),
          citationsMode,
        }),
      };
    },
    async compact(params) {
      return await delegateCompactionToRuntime(params);
    },
  }));
}
```

## 새 capability 추가

플러그인이 현재 API에 맞지 않는 동작을 필요로 할 때, 비공개 reach-in으로 플러그인 시스템을 우회하지 마십시오. 누락된 capability를 추가하십시오.

권장 시퀀스:

1. 코어 계약 정의
   코어가 소유해야 할 공유 동작(정책, 폴백, 구성 병합, 라이프사이클, 채널 대면 의미론, 런타임 헬퍼 모양)을 결정하십시오.
2. 타입된 플러그인 등록/런타임 표면 추가
   가장 작은 유용한 타입된 capability 표면으로 `OpenClawPluginApi` 및/또는 `api.runtime`을 확장하십시오.
3. 코어 + 채널/기능 소비자 연결
   채널과 기능 플러그인은 벤더 구현을 직접 임포트하는 것이 아니라 코어를 통해 새 capability를 소비해야 합니다.
4. 벤더 구현 등록
   그런 다음 벤더 플러그인은 capability에 대해 백엔드를 등록합니다.
5. 계약 커버리지 추가
   시간이 지남에 따라 소유권과 등록 형태가 명시적으로 유지되도록 테스트를 추가하십시오.

이것이 OpenClaw가 한 프로바이더의 세계관에 하드코딩되지 않으면서 의견을 가진 상태로 유지되는 방법입니다. 구체적인 파일 체크리스트와 작업 예시는 [Capability Cookbook](/tools/capability-cookbook)을 참조하십시오.

### Capability 체크리스트

새 capability를 추가할 때, 구현은 보통 이 표면들을 함께 건드려야 합니다.

* `src/<capability>/types.ts`의 코어 계약 타입
* `src/<capability>/runtime.ts`의 코어 러너/런타임 헬퍼
* `src/plugins/types.ts`의 플러그인 API 등록 표면
* `src/plugins/registry.ts`의 플러그인 레지스트리 배선
* 기능/채널 플러그인이 소비해야 할 때 `src/plugins/runtime/*`의 플러그인 런타임 노출
* `src/test-utils/plugin-registration.ts`의 캡처/테스트 헬퍼
* `src/plugins/contracts/registry.ts`의 소유권/계약 단언
* `docs/`의 운영자/플러그인 문서

그 중 하나의 표면이 누락되어 있다면, 그것은 보통 capability가 아직 완전히 통합되지 않았다는 신호입니다.

### Capability 템플릿

최소 패턴:

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
// core contract
export type VideoGenerationProviderPlugin = {
  id: string;
  label: string;
  generateVideo: (req: VideoGenerationRequest) => Promise<VideoGenerationResult>;
};

// plugin API
api.registerVideoGenerationProvider({
  id: "openai",
  label: "OpenAI",
  async generateVideo(req) {
    return await generateOpenAiVideo(req);
  },
});

// shared runtime helper for feature/channel plugins
const clip = await api.runtime.videoGeneration.generate({
  prompt: "Show the robot walking through the lab.",
  cfg,
});
```

계약 테스트 패턴:

```ts  theme={"theme":{"light":"min-light","dark":"min-dark"}}
expect(findVideoGenerationProviderIdsForPlugin("openai")).toEqual(["openai"]);
```

이것은 규칙을 단순하게 유지합니다.

* 코어는 capability 계약 + 오케스트레이션을 소유합니다
* 벤더 플러그인은 벤더 구현을 소유합니다
* 기능/채널 플러그인은 런타임 헬퍼를 소비합니다
* 계약 테스트는 소유권을 명시적으로 유지합니다
