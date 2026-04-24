---
summary: "Import 맵, 등록 API 레퍼런스, SDK 아키텍처"
title: "플러그인 SDK 개요"
sidebarTitle: "SDK 개요"
read_when:
  - 어느 SDK subpath에서 import해야 하는지 알아야 할 때
  - OpenClawPluginApi의 모든 registration 메서드 레퍼런스가 필요할 때
  - 특정 SDK export를 찾아볼 때
---

플러그인 SDK는 플러그인과 코어 간의 타입화된 계약(contract)입니다. 이 페이지는 **무엇을 import 해야 하는지**와 **무엇을 register 할 수 있는지**에 대한 레퍼런스입니다.

<Tip>
  How-to 가이드를 찾고 계신가요?

- 첫 플러그인이라면 [플러그인 빌드하기](/plugins/building-plugins)로 시작하십시오.
- 채널 플러그인은 [채널 플러그인](/plugins/sdk-channel-plugins)을 참조하십시오.
- 프로바이더 플러그인은 [프로바이더 플러그인](/plugins/sdk-provider-plugins)을 참조하십시오.
  </Tip>

## Import 규약

항상 구체적인 subpath에서 import하십시오:

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { defineChannelPluginEntry } from "openclaw/plugin-sdk/channel-core";
```

각 subpath는 작고 독립적인 모듈입니다. 이를 통해 시작(startup)이 빨라지고 순환 의존성(circular dependency) 문제가 방지됩니다. 채널 전용 entry/build 헬퍼는 `openclaw/plugin-sdk/channel-core`를 선호하고, `buildChannelConfigSchema`와 같은 더 넓은 umbrella 표면(surface)과 공유 헬퍼에는 `openclaw/plugin-sdk/core`를 유지하십시오.

<Warning>
  provider- 또는 channel-브랜드가 붙은 편의용 seam(예: `openclaw/plugin-sdk/slack`, `.../discord`, `.../signal`, `.../whatsapp`)을 import하지 마십시오.
  번들 플러그인은 자체 `api.ts` / `runtime-api.ts` barrel 내부에서 범용 SDK subpath를 조합합니다. 코어 소비자는 해당 플러그인 로컬 barrel을 사용하거나, 진정으로 채널 간 공용이 필요할 때 좁은 범용 SDK 계약을 추가해야 합니다.

  일부 번들 플러그인 헬퍼 seam(`plugin-sdk/feishu`, `plugin-sdk/zalo`, `plugin-sdk/matrix*` 및 유사한 것들)은 여전히 생성된 export 맵에 나타납니다. 이는 번들 플러그인 유지보수용으로만 존재하며, 새로운 서드파티 플러그인을 위한 권장 import 경로가 아닙니다.
</Warning>

## Subpath 레퍼런스

플러그인 SDK는 영역별(plugin entry, channel, provider, auth, runtime, capability, memory, 그리고 예약된 번들 플러그인 헬퍼)로 그룹화된 좁은 subpath 집합으로 노출됩니다. 그룹화 및 링크된 전체 카탈로그는 [플러그인 SDK subpath](/plugins/sdk-subpaths)를 참조하십시오.

200개 이상의 subpath 생성 목록은 `scripts/lib/plugin-sdk-entrypoints.json`에 있습니다.

## Registration API

`register(api)` 콜백은 다음 메서드를 가진 `OpenClawPluginApi` 객체를 받습니다:

### Capability 등록

| 메서드                                           | 등록 대상                                |
| ------------------------------------------------ | ---------------------------------------- |
| `api.registerProvider(...)`                      | 텍스트 추론(LLM)                         |
| `api.registerAgentHarness(...)`                  | 실험적 저수준 agent executor             |
| `api.registerCliBackend(...)`                    | 로컬 CLI 추론 backend                    |
| `api.registerChannel(...)`                       | 메시징 채널                              |
| `api.registerSpeechProvider(...)`                | TTS / STT 합성                           |
| `api.registerRealtimeTranscriptionProvider(...)` | 스트리밍 실시간 전사                     |
| `api.registerRealtimeVoiceProvider(...)`         | 양방향(duplex) 실시간 음성 세션          |
| `api.registerMediaUnderstandingProvider(...)`    | 이미지/오디오/비디오 분석                |
| `api.registerImageGenerationProvider(...)`       | 이미지 생성                              |
| `api.registerMusicGenerationProvider(...)`       | 음악 생성                                |
| `api.registerVideoGenerationProvider(...)`       | 비디오 생성                              |
| `api.registerWebFetchProvider(...)`              | 웹 fetch / 스크레이프 프로바이더         |
| `api.registerWebSearchProvider(...)`             | 웹 검색                                  |

### 도구와 명령(Tools and commands)

| 메서드                          | 등록 대상                                     |
| ------------------------------- | --------------------------------------------- |
| `api.registerTool(tool, opts?)` | Agent tool (필수 또는 `{ optional: true }`)   |
| `api.registerCommand(def)`      | 커스텀 명령 (LLM을 우회)                      |

### Infrastructure

| 메서드                                          | 등록 대상                                    |
| ----------------------------------------------- | -------------------------------------------- |
| `api.registerHook(events, handler, opts?)`      | 이벤트 hook                                  |
| `api.registerHttpRoute(params)`                 | 게이트웨이 HTTP 엔드포인트                   |
| `api.registerGatewayMethod(name, handler)`      | 게이트웨이 RPC 메서드                        |
| `api.registerCli(registrar, opts?)`             | CLI 하위 명령                                |
| `api.registerService(service)`                  | 백그라운드 서비스                            |
| `api.registerInteractiveHandler(registration)`  | 인터랙티브 핸들러                            |
| `api.registerEmbeddedExtensionFactory(factory)` | Pi embedded-runner extension factory         |
| `api.registerMemoryPromptSupplement(builder)`   | 추가(additive) 메모리 인접 프롬프트 섹션     |
| `api.registerMemoryCorpusSupplement(adapter)`   | 추가(additive) 메모리 검색/읽기 코퍼스       |

<Note>
  예약된 코어 admin 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`,
  `update.*`)는 플러그인이 더 좁은 게이트웨이 메서드 스코프를 할당하려 해도 항상 `operator.admin`으로 유지됩니다. 플러그인 소유 메서드에는 플러그인 전용 prefix를 선호하십시오.
</Note>

<Accordion title="registerEmbeddedExtensionFactory를 사용해야 하는 경우">
  플러그인이 OpenClaw embedded 실행 중에 Pi-native 이벤트 타이밍이 필요할 때 `api.registerEmbeddedExtensionFactory(...)`를 사용하십시오. 예를 들어 최종 tool-result 메시지가 emit되기 전에 반드시 일어나야 하는 비동기 `tool_result` 재작성이 여기에 해당합니다.

  이는 오늘날 번들 플러그인 전용 seam입니다. 번들 플러그인만 등록할 수 있으며, `openclaw.plugin.json`에 `contracts.embeddedExtensionFactories: ["pi"]`를 선언해야 합니다. 해당 저수준 seam이 필요하지 않은 모든 경우에는 일반 OpenClaw 플러그인 hook을 유지하십시오.
</Accordion>

### CLI registration 메타데이터

`api.registerCli(registrar, opts?)`는 두 가지 종류의 최상위 메타데이터를 받습니다:

- `commands`: registrar가 소유하는 명시적인 커맨드 루트
- `descriptors`: 루트 CLI 도움말, 라우팅, 지연(lazy) 플러그인 CLI 등록에 사용되는 parse-time 커맨드 descriptor

플러그인 명령이 일반 루트 CLI 경로에서 지연 로드(lazy-loaded) 상태로 유지되기를 원한다면, 해당 registrar가 노출하는 모든 최상위 커맨드 루트를 커버하는 `descriptors`를 제공하십시오.

```typescript
api.registerCli(
  async ({ program }) => {
    const { registerMatrixCli } = await import("./src/cli.js");
    registerMatrixCli({ program });
  },
  {
    descriptors: [
      {
        name: "matrix",
        description: "Manage Matrix accounts, verification, devices, and profile state",
        hasSubcommands: true,
      },
    ],
  },
);
```

지연 루트 CLI 등록이 필요하지 않을 때에만 `commands`를 단독으로 사용하십시오. 해당 eager 호환성 경로는 여전히 지원되지만, parse-time 지연 로딩을 위한 descriptor 기반 placeholder는 설치하지 않습니다.

### CLI backend 등록

`api.registerCliBackend(...)`는 `codex-cli`와 같은 로컬 AI CLI backend의 기본 구성(default config)을 플러그인이 소유하도록 해줍니다.

- backend `id`는 `codex-cli/gpt-5`와 같은 model ref의 provider prefix가 됩니다.
- backend `config`는 `agents.defaults.cliBackends.<id>`와 동일한 형태(shape)를 사용합니다.
- 사용자 구성이 우선합니다. OpenClaw는 CLI를 실행하기 전에 플러그인 기본값 위에 `agents.defaults.cliBackends.<id>`를 병합합니다.
- 병합 후 backend에 호환성 재작성이 필요할 때(예: 오래된 flag 형태를 정규화)는 `normalizeConfig`를 사용하십시오.

### 독점 슬롯(Exclusive slots)

| 메서드                                     | 등록 대상                                                                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.registerContextEngine(id, factory)`   | 컨텍스트 엔진(한 번에 하나만 활성). `assemble()` 콜백은 `availableTools`와 `citationsMode`를 받아 엔진이 프롬프트 추가(prompt additions)를 맞춤화할 수 있게 합니다. |
| `api.registerMemoryCapability(capability)` | 통합(unified) 메모리 capability                                                                                                                                      |
| `api.registerMemoryPromptSection(builder)` | 메모리 프롬프트 섹션 빌더                                                                                                                                            |
| `api.registerMemoryFlushPlan(resolver)`    | 메모리 flush plan resolver                                                                                                                                           |
| `api.registerMemoryRuntime(runtime)`       | 메모리 런타임 어댑터                                                                                                                                                 |

### 메모리 임베딩 어댑터

| 메서드                                         | 등록 대상                                       |
| ---------------------------------------------- | ----------------------------------------------- |
| `api.registerMemoryEmbeddingProvider(adapter)` | 활성 플러그인을 위한 메모리 임베딩 어댑터       |

- `registerMemoryCapability`가 선호되는 독점(exclusive) 메모리 플러그인 API입니다.
- `registerMemoryCapability`는 companion 플러그인이 특정 메모리 플러그인의 내부 레이아웃에 reach-in하지 않고 `openclaw/plugin-sdk/memory-host-core`를 통해 export된 메모리 artifact를 소비할 수 있도록 `publicArtifacts.listArtifacts(...)`를 노출할 수도 있습니다.
- `registerMemoryPromptSection`, `registerMemoryFlushPlan`, `registerMemoryRuntime`은 레거시 호환 독점 메모리 플러그인 API입니다.
- `registerMemoryEmbeddingProvider`는 활성 메모리 플러그인이 하나 이상의 임베딩 어댑터 id(예: `openai`, `gemini`, 또는 커스텀 플러그인 정의 id)를 등록할 수 있게 해줍니다.
- `agents.defaults.memorySearch.provider`, `agents.defaults.memorySearch.fallback`과 같은 사용자 구성은 등록된 어댑터 id에 대해 해결(resolve)됩니다.

### 이벤트와 라이프사이클

| 메서드                                       | 역할                              |
| -------------------------------------------- | --------------------------------- |
| `api.on(hookName, handler, opts?)`           | 타입화된 라이프사이클 hook        |
| `api.onConversationBindingResolved(handler)` | 대화 바인딩 콜백                  |

### Hook 결정 의미론(Hook decision semantics)

- `before_tool_call`: `{ block: true }` 반환은 terminal(종료)입니다. 어떤 핸들러가 이를 설정하면 우선순위가 낮은 핸들러는 건너뜁니다.
- `before_tool_call`: `{ block: false }` 반환은 결정 없음(`block`을 생략한 것과 동일)으로 취급되며, override가 아닙니다.
- `before_install`: `{ block: true }` 반환은 terminal입니다. 어떤 핸들러가 이를 설정하면 우선순위가 낮은 핸들러는 건너뜁니다.
- `before_install`: `{ block: false }` 반환은 결정 없음(`block`을 생략한 것과 동일)으로 취급되며, override가 아닙니다.
- `reply_dispatch`: `{ handled: true, ... }` 반환은 terminal입니다. 어떤 핸들러가 dispatch를 claim하면 우선순위가 낮은 핸들러와 기본 모델 dispatch 경로는 건너뜁니다.
- `message_sending`: `{ cancel: true }` 반환은 terminal입니다. 어떤 핸들러가 이를 설정하면 우선순위가 낮은 핸들러는 건너뜁니다.
- `message_sending`: `{ cancel: false }` 반환은 결정 없음(`cancel`을 생략한 것과 동일)으로 취급되며, override가 아닙니다.
- `message_received`: inbound thread/topic 라우팅이 필요할 때는 타입화된 `threadId` 필드를 사용하십시오. `metadata`는 채널별 부가 정보 용도로 유지하십시오.
- `message_sending`: 채널별 `metadata`로 fallback하기 전에 타입화된 `replyToId` / `threadId` 라우팅 필드를 사용하십시오.
- `gateway_start`: 게이트웨이 소유의 startup 상태에는 내부 `gateway:startup` hook에 의존하는 대신 `ctx.config`, `ctx.workspaceDir`, `ctx.getCron?.()`를 사용하십시오.

### API 객체 필드

| 필드                     | 타입                      | 설명                                                                                             |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------ |
| `api.id`                 | `string`                  | 플러그인 id                                                                                      |
| `api.name`               | `string`                  | 표시 이름                                                                                        |
| `api.version`            | `string?`                 | 플러그인 버전 (선택)                                                                             |
| `api.description`        | `string?`                 | 플러그인 설명 (선택)                                                                             |
| `api.source`             | `string`                  | 플러그인 source 경로                                                                             |
| `api.rootDir`            | `string?`                 | 플러그인 루트 디렉터리 (선택)                                                                    |
| `api.config`             | `OpenClawConfig`          | 현재 config 스냅샷 (사용 가능한 경우 활성 인메모리 런타임 스냅샷)                                |
| `api.pluginConfig`       | `Record<string, unknown>` | `plugins.entries.<id>.config`에서 온 플러그인별 config                                           |
| `api.runtime`            | `PluginRuntime`           | [런타임 헬퍼](/plugins/sdk-runtime)                                                              |
| `api.logger`             | `PluginLogger`            | 스코프된 로거(`debug`, `info`, `warn`, `error`)                                                  |
| `api.registrationMode`   | `PluginRegistrationMode`  | 현재 load 모드. `"setup-runtime"`은 전체 entry 이전의 경량 startup/setup 윈도우입니다            |
| `api.resolvePath(input)` | `(string) => string`      | 플러그인 루트를 기준으로 경로 해결                                                               |

## 내부 모듈 규약

플러그인 내부에서 내부 import에는 로컬 barrel 파일을 사용하십시오:

```
my-plugin/
  api.ts            # 외부 소비자를 위한 public export
  runtime-api.ts    # 내부 전용 런타임 export
  index.ts          # 플러그인 엔트리포인트
  setup-entry.ts    # 경량 setup 전용 엔트리 (선택)
```

<Warning>
  프로덕션 코드에서 `openclaw/plugin-sdk/<your-plugin>`을 통해 자기 자신의 플러그인을 import하지 마십시오.
  내부 import는 `./api.ts` 또는 `./runtime-api.ts`를 통해 라우팅하십시오. SDK 경로는 외부 계약 전용입니다.
</Warning>

Facade로 로드되는 번들 플러그인의 공개 표면(`api.ts`, `runtime-api.ts`, `index.ts`, `setup-entry.ts`, 그리고 유사한 public entry 파일)은 OpenClaw가 이미 실행 중일 때 활성 런타임 config 스냅샷을 선호합니다. 아직 런타임 스냅샷이 없으면 디스크상의 해결된 config 파일로 fallback합니다.

프로바이더 플러그인은 특정 헬퍼가 의도적으로 프로바이더 전용이고 아직 범용 SDK subpath에 속하지 않을 때 좁은 플러그인 로컬 계약 barrel을 노출할 수 있습니다. 번들 예시:

- **Anthropic**: Claude beta-header 및 `service_tier` stream 헬퍼를 위한 public `api.ts` / `contract-api.ts` seam.
- **`@openclaw/openai-provider`**: `api.ts`는 provider builder, 기본 모델 헬퍼, realtime provider builder를 export합니다.
- **`@openclaw/openrouter-provider`**: `api.ts`는 provider builder와 onboarding/config 헬퍼를 export합니다.

<Warning>
  확장(extension) 프로덕션 코드도 `openclaw/plugin-sdk/<other-plugin>` import를 피해야 합니다. 헬퍼가 진정으로 공유되는 것이라면, 두 플러그인을 결합시키는 대신 `openclaw/plugin-sdk/speech`, `.../provider-model-shared`와 같은 중립적인 SDK subpath 또는 다른 capability 지향 표면으로 승격시키십시오.
</Warning>

## 관련 문서

<CardGroup cols={2}>
  <Card title="엔트리포인트" icon="door-open" href="/plugins/sdk-entrypoints">
    `definePluginEntry` 및 `defineChannelPluginEntry` 옵션.
  </Card>
  <Card title="런타임 헬퍼" icon="gears" href="/plugins/sdk-runtime">
    전체 `api.runtime` 네임스페이스 레퍼런스.
  </Card>
  <Card title="Setup과 config" icon="sliders" href="/plugins/sdk-setup">
    패키징, 매니페스트, config 스키마.
  </Card>
  <Card title="테스팅" icon="vial" href="/plugins/sdk-testing">
    테스트 유틸리티와 lint 규칙.
  </Card>
  <Card title="SDK 마이그레이션" icon="arrows-turn-right" href="/plugins/sdk-migration">
    deprecated된 표면으로부터 마이그레이션.
  </Card>
  <Card title="플러그인 내부 구조" icon="diagram-project" href="/plugins/architecture">
    심층 아키텍처와 capability 모델.
  </Card>
</CardGroup>
