---
summary: "플러그인 내부 구조: capability 모델, 소유권, 계약, 로드 파이프라인, 런타임 헬퍼"
read_when:
  - 네이티브 OpenClaw 플러그인을 빌드하거나 디버깅할 때
  - 플러그인 capability 모델 또는 소유권 경계를 이해하고자 할 때
  - 플러그인 로드 파이프라인 또는 레지스트리 작업을 할 때
  - provider 런타임 훅 또는 채널 플러그인을 구현할 때
title: "플러그인 내부 구조"
sidebarTitle: "Internals"
---

이 문서는 OpenClaw 플러그인 시스템에 대한 **심층 아키텍처 레퍼런스**입니다. 실용적 가이드가 필요하다면 아래의 집중 페이지부터 시작하십시오.

<CardGroup cols={2}>
  <Card title="플러그인 설치 및 사용" icon="plug" href="/tools/plugin">
    플러그인 추가, 활성화, 문제 해결을 위한 최종 사용자 가이드입니다.
  </Card>
  <Card title="플러그인 빌드" icon="rocket" href="/plugins/building-plugins">
    가장 작은 동작 매니페스트로 첫 플러그인을 만드는 튜토리얼입니다.
  </Card>
  <Card title="채널 플러그인" icon="comments" href="/plugins/sdk-channel-plugins">
    메시징 채널 플러그인을 빌드합니다.
  </Card>
  <Card title="프로바이더 플러그인" icon="microchip" href="/plugins/sdk-provider-plugins">
    모델 프로바이더 플러그인을 빌드합니다.
  </Card>
  <Card title="SDK 개요" icon="book" href="/plugins/sdk-overview">
    임포트 맵과 등록 API 레퍼런스입니다.
  </Card>
</CardGroup>

## Public capability model

Capability는 OpenClaw 내부의 공개 **네이티브 플러그인** 모델입니다. 모든 네이티브 OpenClaw 플러그인은 하나 이상의 capability 타입에 대해 등록됩니다:

| Capability                | 등록 메서드                                       | 예시 플러그인                          |
| ------------------------- | ------------------------------------------------ | ------------------------------------ |
| 텍스트 추론               | `api.registerProvider(...)`                      | `openai`, `anthropic`                |
| CLI 추론 백엔드           | `api.registerCliBackend(...)`                    | `openai`, `anthropic`                |
| 음성(Speech)              | `api.registerSpeechProvider(...)`                | `elevenlabs`, `microsoft`            |
| 실시간 전사               | `api.registerRealtimeTranscriptionProvider(...)` | `openai`                             |
| 실시간 음성               | `api.registerRealtimeVoiceProvider(...)`         | `openai`                             |
| 미디어 이해               | `api.registerMediaUnderstandingProvider(...)`    | `openai`, `google`                   |
| 이미지 생성               | `api.registerImageGenerationProvider(...)`       | `openai`, `google`, `fal`, `minimax` |
| 음악 생성                 | `api.registerMusicGenerationProvider(...)`       | `google`, `minimax`                  |
| 비디오 생성               | `api.registerVideoGenerationProvider(...)`       | `qwen`                               |
| 웹 fetch                  | `api.registerWebFetchProvider(...)`              | `firecrawl`                          |
| 웹 검색                   | `api.registerWebSearchProvider(...)`             | `google`                             |
| 채널 / 메시징             | `api.registerChannel(...)`                       | `msteams`, `matrix`                  |

capability를 하나도 등록하지 않지만 hook, 도구 또는 서비스를 제공하는 플러그인은 **레거시 hook-only** 플러그인입니다. 이 패턴은 여전히 완전히 지원됩니다.

### 외부 호환성 입장

capability 모델은 코어에 이미 반영되어 번들/네이티브 플러그인에서 사용되고 있지만, 외부 플러그인 호환성은 "내보내진 이상 고정되었다"는 수준보다 더 엄격한 기준이 필요합니다.

| 플러그인 상황                                  | 지침                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 기존 외부 플러그인                            | hook 기반 통합이 계속 작동하도록 유지합니다; 이것이 호환성 기준선입니다.                         |
| 신규 번들/네이티브 플러그인                   | 벤더별 강제 결합이나 새로운 hook-only 설계보다 명시적 capability 등록을 선호합니다.               |
| capability 등록을 채택하는 외부 플러그인      | 허용되지만, capability별 헬퍼 표면은 문서가 stable로 표시하지 않는 한 진화 중인 것으로 취급합니다. |

capability 등록이 의도된 방향입니다. 레거시 hook은 전환 기간 동안 외부 플러그인에 가장 안전한 무중단 경로로 남아 있습니다. 내보내진 헬퍼 서브패스가 모두 동등하지는 않습니다 — 우연한 헬퍼 내보내기보다 좁고 문서화된 계약을 선호하십시오.

### 플러그인 형태

OpenClaw는 로드된 모든 플러그인을 정적 메타데이터만이 아니라 실제 등록 동작에 기반하여 형태(shape)로 분류합니다:

- **plain-capability**: 정확히 하나의 capability 타입을 등록합니다 (예: `mistral` 같은 provider 전용 플러그인).
- **hybrid-capability**: 여러 capability 타입을 등록합니다 (예: `openai`는 텍스트 추론, 음성, 미디어 이해, 이미지 생성을 소유).
- **hook-only**: hook(typed 또는 custom)만 등록하고 capability, 도구, 명령, 서비스는 등록하지 않습니다.
- **non-capability**: 도구, 명령, 서비스, 라우트는 등록하지만 capability는 등록하지 않습니다.

플러그인의 형태와 capability 분류를 보려면 `openclaw plugins inspect <id>`를 사용하십시오. 자세한 내용은 [CLI 레퍼런스](/cli/plugins#inspect)를 참조하십시오.

### 레거시 hook

`before_agent_start` hook은 hook-only 플러그인을 위한 호환 경로로 계속 지원됩니다. 실제 레거시 플러그인들이 여전히 이에 의존하고 있습니다.

방향성:

- 계속 동작하도록 유지
- 레거시로 문서화
- 모델/provider 오버라이드 작업에는 `before_model_resolve`를 선호
- 프롬프트 변경 작업에는 `before_prompt_build`를 선호
- 실제 사용이 줄고 fixture 커버리지가 마이그레이션 안전성을 증명한 후에만 제거

### 호환성 신호

`openclaw doctor` 또는 `openclaw plugins inspect <id>`를 실행하면 다음 라벨 중 하나가 표시될 수 있습니다:

| 신호                         | 의미                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| **config valid**             | 구성이 올바르게 파싱되고 플러그인이 해결됨                   |
| **compatibility advisory**   | 플러그인이 지원되지만 오래된 패턴을 사용함 (예: `hook-only`) |
| **legacy warning**           | 플러그인이 deprecated된 `before_agent_start`를 사용함        |
| **hard error**               | 구성이 유효하지 않거나 플러그인이 로드에 실패함              |

`hook-only`도 `before_agent_start`도 오늘 여러분의 플러그인을 깨뜨리지 않습니다: `hook-only`는 advisory이며, `before_agent_start`는 경고만 트리거합니다. 이 신호들은 `openclaw status --all` 및 `openclaw plugins doctor`에도 표시됩니다.

## Architecture overview

OpenClaw 플러그인 시스템은 네 개의 계층으로 구성됩니다:

1. **매니페스트 + 발견(Discovery)**
   OpenClaw는 구성된 경로, 워크스페이스 루트, 전역 플러그인 루트, 번들 플러그인에서 후보 플러그인을 찾습니다. 발견 과정은 네이티브 `openclaw.plugin.json` 매니페스트와 지원되는 번들 매니페스트를 먼저 읽습니다.
2. **활성화 + 검증**
   코어는 발견된 플러그인이 enabled, disabled, blocked인지 또는 memory 같은 배타 슬롯에 선택되었는지를 결정합니다.
3. **런타임 로딩**
   네이티브 OpenClaw 플러그인은 jiti를 통해 in-process로 로드되어 중앙 레지스트리에 capability를 등록합니다. 호환 번들은 런타임 코드를 임포트하지 않고도 레지스트리 레코드로 정규화됩니다.
4. **표면(Surface) 소비**
   OpenClaw의 나머지 부분은 레지스트리를 읽어 도구, 채널, provider 설정, hook, HTTP 라우트, CLI 명령, 서비스를 노출합니다.

플러그인 CLI 한정으로, 루트 명령 발견은 두 단계로 나뉩니다:

- parse-time 메타데이터는 `registerCli(..., { descriptors: [...] })`에서 제공됩니다
- 실제 플러그인 CLI 모듈은 lazy 상태를 유지하고 첫 호출 시 등록될 수 있습니다

이렇게 하면 플러그인 소유 CLI 코드는 플러그인 내부에 유지하면서 OpenClaw가 파싱 전에 루트 명령 이름을 예약할 수 있습니다.

중요한 설계 경계:

- 발견 + 구성 검증은 플러그인 코드를 실행하지 않고도 **매니페스트/스키마 메타데이터**에서 동작해야 합니다
- 네이티브 런타임 동작은 플러그인 모듈의 `register(api)` 경로에서 나옵니다

이 분리 덕분에 OpenClaw는 전체 런타임이 활성화되기 전에도 구성을 검증하고, 누락되거나 비활성화된 플러그인을 설명하고, UI/스키마 힌트를 빌드할 수 있습니다.

### 활성화 계획(Activation planning)

활성화 계획은 control plane의 일부입니다. 호출자는 더 넓은 런타임 레지스트리를 로드하기 전에 특정 명령, provider, 채널, 라우트, 에이전트 하네스, capability에 관련된 플러그인이 무엇인지 물어볼 수 있습니다.

플래너는 현재 매니페스트 동작을 호환 가능한 방식으로 유지합니다:

- `activation.*` 필드는 명시적인 플래너 힌트입니다
- `providers`, `channels`, `commandAliases`, `setup.providers`, `contracts.tools`, hook은 매니페스트 소유권 폴백으로 유지됩니다
- id만 반환하는 플래너 API는 기존 호출자를 위해 계속 사용할 수 있습니다
- plan API는 reason 라벨을 보고하므로 진단에서 명시적 힌트와 소유권 폴백을 구분할 수 있습니다

`activation`을 수명 주기 hook이나 `register(...)`의 대체물로 취급하지 마십시오. 이는 로딩을 좁히는 데 사용되는 메타데이터입니다. 관계를 이미 설명하는 소유권 필드가 있다면 그것을 선호하고, 추가적인 플래너 힌트가 필요한 경우에만 `activation`을 사용하십시오.

### 채널 플러그인과 공유 `message` 도구

채널 플러그인은 일반 채팅 액션을 위해 별도의 send/edit/react 도구를 등록할 필요가 없습니다. OpenClaw는 코어에 공유 `message` 도구 하나를 유지하고, 채널 플러그인은 그 뒤의 채널별 발견 및 실행 동작을 소유합니다.

현재 경계는 다음과 같습니다:

- 코어는 공유 `message` 도구 호스트, 프롬프트 와이어링, session/thread 관리, 실행 디스패치를 소유합니다
- 채널 플러그인은 스코프된 액션 발견, capability 발견, 채널별 스키마 조각을 소유합니다
- 채널 플러그인은 provider별 세션 대화 문법(예: conversation id가 thread id를 인코딩하거나 상위 대화에서 상속받는 방식)을 소유합니다
- 채널 플러그인은 자신의 액션 어댑터를 통해 최종 액션을 실행합니다

채널 플러그인의 SDK 표면은 `ChannelMessageActionAdapter.describeMessageTool(...)`입니다. 이 통합 발견 호출은 플러그인이 가시적인 액션, capability, 스키마 기여분을 함께 반환하도록 해서 이 조각들이 서로 엇나가지 않도록 합니다.

채널별 message-tool 파라미터가 로컬 경로나 원격 미디어 URL 같은 미디어 소스를 포함할 때, 플러그인은 `describeMessageTool(...)`에서 `mediaSourceParams`도 함께 반환해야 합니다. 코어는 그 명시적 목록을 사용해 플러그인 소유 파라미터 이름을 하드코딩하지 않고도 샌드박스 경로 정규화 및 아웃바운드 미디어 액세스 힌트를 적용합니다.
여기서는 채널 전체 단일 플랫 리스트가 아니라 액션별로 스코프된 맵을 선호하십시오. 그래야 프로필 전용 미디어 파라미터가 `send` 같은 무관한 액션에 정규화되지 않습니다.

코어는 런타임 스코프를 그 발견 단계에 전달합니다. 중요 필드는 다음과 같습니다:

- `accountId`
- `currentChannelId`
- `currentThreadTs`
- `currentMessageId`
- `sessionKey`
- `sessionId`
- `agentId`
- 신뢰된 인바운드 `requesterSenderId`

이는 컨텍스트에 민감한 플러그인에 중요합니다. 채널은 코어 `message` 도구에 채널별 분기를 하드코딩하지 않고도 활성 계정, 현재 room/thread/message, 또는 신뢰된 요청자 아이덴티티에 따라 메시지 액션을 숨기거나 노출할 수 있습니다.

임베디드 러너 라우팅 변경이 여전히 플러그인 작업인 이유가 여기에 있습니다: 러너는 현재 chat/session 아이덴티티를 플러그인 발견 경계로 전달해 공유 `message` 도구가 현재 턴에 맞는 올바른 채널 소유 표면을 노출하도록 해야 합니다.

채널 소유 실행 헬퍼의 경우, 번들 플러그인은 자체 익스텐션 모듈 안에 실행 런타임을 유지해야 합니다. 코어는 더 이상 `src/agents/tools` 아래의 Discord, Slack, Telegram, WhatsApp 메시지 액션 런타임을 소유하지 않습니다. 우리는 별도의 `plugin-sdk/*-action-runtime` 서브패스를 게시하지 않으며, 번들 플러그인은 익스텐션이 소유한 모듈에서 자신의 로컬 런타임 코드를 직접 임포트해야 합니다.

동일한 경계가 provider 이름을 딴 SDK 이음새 전반에 적용됩니다: 코어는 Slack, Discord, Signal, WhatsApp 또는 유사한 익스텐션의 채널별 편의 배럴을 임포트해서는 안 됩니다. 코어가 특정 동작을 필요로 한다면, 번들 플러그인 자체의 `api.ts` / `runtime-api.ts` 배럴을 소비하거나, 해당 필요를 공유 SDK의 좁은 범용 capability로 승격시키십시오.

투표(poll)의 경우 두 가지 실행 경로가 있습니다:

- `outbound.sendPoll`은 공통 poll 모델에 맞는 채널을 위한 공유 기준선입니다
- `actions.handleAction("poll")`은 채널별 poll 시맨틱이나 추가 poll 파라미터를 위한 권장 경로입니다

코어는 이제 플러그인 poll 디스패치가 액션을 거부한 후에야 공유 poll 파싱을 수행하므로, 플러그인 소유 poll 핸들러가 범용 poll 파서에 먼저 막히지 않고 채널별 poll 필드를 받을 수 있습니다.

전체 시작 시퀀스는 [플러그인 아키텍처 내부 구조](/plugins/architecture-internals)를 참조하십시오.

## Capability ownership model

OpenClaw는 네이티브 플러그인을 무관한 통합의 잡화 상자가 아니라 **회사(company)** 또는 **기능(feature)**의 소유권 경계로 취급합니다.

이는 다음을 의미합니다:

- 회사 플러그인은 일반적으로 해당 회사의 OpenClaw 대면 표면 전체를 소유해야 합니다
- 기능 플러그인은 일반적으로 자신이 도입하는 전체 기능 표면을 소유해야 합니다
- 채널은 provider 동작을 즉흥적으로 재구현하는 대신 공유 코어 capability를 소비해야 합니다

<Accordion title="번들 플러그인 전반의 소유권 패턴 예시">
  - **다중 capability 벤더**: `openai`는 텍스트 추론, 음성, 실시간 음성, 미디어 이해, 이미지 생성을 소유합니다. `google`은 텍스트 추론과 미디어 이해, 이미지 생성, 웹 검색을 소유합니다. `qwen`은 텍스트 추론과 미디어 이해, 비디오 생성을 소유합니다.
  - **단일 capability 벤더**: `elevenlabs`와 `microsoft`는 음성을 소유합니다; `firecrawl`은 web-fetch를 소유하고; `minimax` / `mistral` / `moonshot` / `zai`는 미디어 이해 백엔드를 소유합니다.
  - **기능 플러그인**: `voice-call`은 통화 전송, 도구, CLI, 라우트, Twilio 미디어 스트림 브리징을 소유하지만, 벤더 플러그인을 직접 임포트하지 않고 공유 음성, 실시간 전사, 실시간 음성 capability를 소비합니다.
</Accordion>

의도된 최종 상태는 다음과 같습니다:

- OpenAI는 텍스트 모델, 음성, 이미지, 향후 비디오에 걸쳐 있어도 하나의 플러그인에 존재합니다
- 다른 벤더도 자기 표면 영역에 대해 동일하게 할 수 있습니다
- 채널은 어떤 벤더 플러그인이 provider를 소유하는지 신경 쓰지 않습니다; 코어가 노출한 공유 capability 계약을 소비합니다

핵심 구분은 이것입니다:

- **플러그인** = 소유권 경계
- **capability** = 여러 플러그인이 구현하거나 소비할 수 있는 코어 계약

따라서 OpenClaw가 비디오 같은 새 도메인을 추가한다면, 첫 번째 질문은 "어떤 provider가 비디오 처리를 하드코딩해야 하는가?"가 아닙니다. 첫 번째 질문은 "코어 비디오 capability 계약은 무엇인가?"입니다. 그 계약이 존재하면 벤더 플러그인은 그에 대해 등록할 수 있고 채널/기능 플러그인은 이를 소비할 수 있습니다.

capability가 아직 존재하지 않는다면 올바른 조치는 대체로:

1. 코어에 누락된 capability를 정의합니다
2. 플러그인 API/런타임을 통해 typed 방식으로 노출합니다
3. 채널/기능을 해당 capability에 연결합니다
4. 벤더 플러그인이 구현을 등록하도록 합니다

이렇게 하면 단일 벤더나 일회성 플러그인별 코드 경로에 의존하는 코어 동작을 피하면서 소유권을 명시적으로 유지할 수 있습니다.

### Capability 계층

코드가 어디에 속하는지 결정할 때 다음 멘탈 모델을 사용하십시오:

- **코어 capability 계층**: 공유 오케스트레이션, 정책, 폴백, 구성 병합 규칙, delivery 시맨틱, typed 계약
- **벤더 플러그인 계층**: 벤더별 API, 인증, 모델 카탈로그, 음성 합성, 이미지 생성, 향후 비디오 백엔드, 사용량 엔드포인트
- **채널/기능 플러그인 계층**: Slack/Discord/voice-call 등 코어 capability를 소비해서 표면에 제시하는 통합

예를 들어, TTS는 이 형태를 따릅니다:

- 코어는 응답 시점 TTS 정책, 폴백 순서, 환경설정, 채널 delivery를 소유합니다
- `openai`, `elevenlabs`, `microsoft`는 합성 구현을 소유합니다
- `voice-call`은 전화 통신 TTS 런타임 헬퍼를 소비합니다

향후 capability에서도 동일한 패턴을 선호해야 합니다.

### 다중 capability 회사 플러그인 예시

회사 플러그인은 바깥에서 볼 때 응집력 있게 느껴져야 합니다. OpenClaw가 모델, 음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성, 비디오 생성, 웹 fetch, 웹 검색에 대한 공유 계약을 제공한다면, 벤더는 자신의 모든 표면을 한곳에서 소유할 수 있습니다:

```ts
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

정확한 헬퍼 이름이 중요한 것은 아닙니다. 형태(shape)가 중요합니다:

- 하나의 플러그인이 벤더 표면을 소유합니다
- 코어는 여전히 capability 계약을 소유합니다
- 채널과 기능 플러그인은 벤더 코드가 아니라 `api.runtime.*` 헬퍼를 소비합니다
- 계약 테스트는 플러그인이 소유를 주장하는 capability를 실제로 등록했는지 확인할 수 있습니다

### Capability 예시: 비디오 이해

OpenClaw는 이미 이미지/오디오/비디오 이해를 하나의 공유 capability로 취급합니다. 동일한 소유권 모델이 여기에도 적용됩니다:

1. 코어는 미디어 이해 계약을 정의합니다
2. 벤더 플러그인은 해당되는 경우 `describeImage`, `transcribeAudio`, `describeVideo`를 등록합니다
3. 채널과 기능 플러그인은 벤더 코드에 직접 연결하는 대신 공유 코어 동작을 소비합니다

이렇게 하면 특정 provider의 비디오 가정을 코어에 굽지 않을 수 있습니다. 플러그인이 벤더 표면을 소유하고, 코어는 capability 계약과 폴백 동작을 소유합니다.

비디오 생성은 이미 동일한 시퀀스를 사용합니다: 코어가 typed capability 계약과 런타임 헬퍼를 소유하고, 벤더 플러그인은 이에 대해 `api.registerVideoGenerationProvider(...)` 구현을 등록합니다.

구체적인 롤아웃 체크리스트가 필요하신가요? [Capability Cookbook](/tools/capability-cookbook)을 참조하십시오.

## Contracts and enforcement

플러그인 API 표면은 의도적으로 typed되어 있으며 `OpenClawPluginApi`에 중앙 집중화되어 있습니다. 이 계약은 지원되는 등록 지점과 플러그인이 의존할 수 있는 런타임 헬퍼를 정의합니다.

이것이 중요한 이유:

- 플러그인 작성자는 하나의 안정적인 내부 표준을 얻습니다
- 코어는 두 플러그인이 동일한 provider id를 등록하는 것과 같은 중복 소유권을 거부할 수 있습니다
- 시작 단계에서 잘못된 등록에 대해 실행 가능한 진단을 노출할 수 있습니다
- 계약 테스트는 번들 플러그인 소유권을 강제하고 조용한 드리프트를 방지할 수 있습니다

enforcement는 두 계층으로 이루어집니다:

1. **런타임 등록 enforcement**
   플러그인 레지스트리는 플러그인이 로드될 때 등록을 검증합니다. 예시: 중복 provider id, 중복 음성 provider id, 잘못된 등록은 정의되지 않은 동작 대신 플러그인 진단을 생성합니다.
2. **계약 테스트**
   번들 플러그인은 테스트 실행 중 계약 레지스트리에 캡처되므로 OpenClaw는 소유권을 명시적으로 단언할 수 있습니다. 오늘날 이는 모델 provider, 음성 provider, 웹 검색 provider, 번들 등록 소유권에 사용됩니다.

실질적인 효과는 OpenClaw가 어떤 플러그인이 어떤 표면을 소유하는지 미리 안다는 것입니다. 이는 소유권이 암묵적이 아니라 선언되고, typed되고, 테스트 가능하기 때문에 코어와 채널이 매끄럽게 구성될 수 있도록 합니다.

### 계약에 속하는 것

좋은 플러그인 계약은:

- typed
- small
- capability-specific
- 코어가 소유
- 여러 플러그인이 재사용 가능
- 벤더 지식 없이 채널/기능이 소비 가능

나쁜 플러그인 계약은:

- 코어에 숨겨진 벤더별 정책
- 레지스트리를 우회하는 일회성 플러그인 탈출구
- 벤더 구현에 직접 손을 뻗는 채널 코드
- `OpenClawPluginApi`나 `api.runtime`의 일부가 아닌 즉흥적인 런타임 객체

의심스러울 때는 추상화 수준을 올리십시오: 먼저 capability를 정의하고 플러그인이 그에 연결되도록 하십시오.

## Execution model

네이티브 OpenClaw 플러그인은 Gateway와 **in-process**로 실행됩니다. 샌드박스되지 않습니다. 로드된 네이티브 플러그인은 코어 코드와 동일한 프로세스 수준 신뢰 경계를 가집니다.

함의:

- 네이티브 플러그인은 도구, 네트워크 핸들러, hook, 서비스를 등록할 수 있습니다
- 네이티브 플러그인의 버그는 gateway를 충돌시키거나 불안정하게 만들 수 있습니다
- 악의적인 네이티브 플러그인은 OpenClaw 프로세스 내부의 임의 코드 실행과 동등합니다

호환 번들은 OpenClaw가 현재 이를 메타데이터/콘텐츠 팩으로 취급하기 때문에 기본적으로 더 안전합니다. 현재 릴리스에서는 주로 번들 skill을 의미합니다.

번들되지 않은 플러그인에는 허용 목록과 명시적 설치/로드 경로를 사용하십시오. 워크스페이스 플러그인은 프로덕션 기본값이 아니라 개발 시점 코드로 취급하십시오.

번들 워크스페이스 패키지 이름의 경우, 플러그인 id를 npm 이름에 고정해 두십시오: 기본적으로 `@openclaw/<id>`이거나, 패키지가 의도적으로 더 좁은 플러그인 역할을 노출할 때는 `-provider`, `-plugin`, `-speech`, `-sandbox`, `-media-understanding` 같은 승인된 typed 접미사를 사용합니다.

중요한 신뢰 참고:

- `plugins.allow`는 소스 출처(provenance)가 아니라 **플러그인 id**를 신뢰합니다.
- 번들 플러그인과 동일한 id를 가진 워크스페이스 플러그인은 해당 워크스페이스 플러그인이 활성화/allowlist 되었을 때 번들 복사본을 의도적으로 그림자(shadow)처럼 가립니다.
- 이는 정상이며, 로컬 개발, 패치 테스트, 핫픽스에 유용합니다.
- 번들 플러그인 신뢰는 설치 메타데이터가 아니라 소스 스냅샷 — 로드 시점 디스크의 매니페스트와 코드 — 에서 해결됩니다. 손상되거나 치환된 설치 기록은 실제 소스가 주장하는 것 이상으로 번들 플러그인의 신뢰 표면을 조용히 넓힐 수 없습니다.

## Export boundary

OpenClaw는 구현 편의가 아니라 capability를 내보냅니다.

capability 등록은 공개로 유지하십시오. 계약 외 헬퍼 내보내기는 축소하십시오:

- 번들 플러그인별 헬퍼 서브패스
- 공개 API로 의도되지 않은 런타임 배관 서브패스
- 벤더별 편의 헬퍼
- 구현 세부 사항인 setup/온보딩 헬퍼

일부 번들 플러그인 헬퍼 서브패스는 호환성 및 번들 플러그인 유지보수를 위해 생성된 SDK 내보내기 맵에 여전히 남아 있습니다. 현재 예시로는 `plugin-sdk/feishu`, `plugin-sdk/feishu-setup`, `plugin-sdk/zalo`, `plugin-sdk/zalo-setup`, 여러 `plugin-sdk/matrix*` 이음새가 있습니다. 이들은 새 서드파티 플러그인을 위한 권장 SDK 패턴이 아니라 예약된 구현 세부 사항 내보내기로 취급하십시오.

## Internals and reference

로드 파이프라인, 레지스트리 모델, provider 런타임 hook, Gateway HTTP 라우트, message 도구 스키마, 채널 타겟 해결, provider 카탈로그, 컨텍스트 엔진 플러그인, 새 capability 추가 가이드는 [플러그인 아키텍처 내부 구조](/plugins/architecture-internals)를 참조하십시오.

## Related

- [플러그인 빌드](/plugins/building-plugins)
- [플러그인 SDK 설정](/plugins/sdk-setup)
- [플러그인 매니페스트](/plugins/manifest)
