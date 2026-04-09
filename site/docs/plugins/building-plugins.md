---
title: "플러그인 빌드하기"
description: "몇 분 안에 첫 번째 OpenClaw 플러그인을 만들어 보십시오"
---

# 플러그인 빌드하기

플러그인은 OpenClaw에 새로운 기능을 추가합니다: 채널, 모델 프로바이더,
음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지
생성, 동영상 생성, 웹 페치, 웹 검색, 에이전트 도구, 또는 이들의
조합입니다.

플러그인을 OpenClaw 저장소에 추가할 필요는 없습니다.
[ClawHub](/tools/clawhub) 또는 npm에 게시하면 사용자는
`openclaw plugins install &lt;package-name&gt;`으로 설치할 수 있습니다. OpenClaw는 먼저 ClawHub를
확인하고 자동으로 npm으로 폴백합니다.

## 사전 요구사항

- Node >= 22 및 패키지 관리자(npm 또는 pnpm)
- TypeScript(ESM)에 대한 기본 지식
- 리포지토리 내 플러그인의 경우: 저장소 클론 및 `pnpm install` 완료

## 어떤 종류의 플러그인인가요?

> **채널 플러그인**
> OpenClaw를 메시징 플랫폼(Discord, IRC 등)에 연결합니다


  > **프로바이더 플러그인**
> 모델 프로바이더(LLM, 프록시, 또는 커스텀 엔드포인트)를 추가합니다


  > **도구 / 훅 플러그인**
> 에이전트 도구, 이벤트 훅, 또는 서비스를 등록합니다 — 아래에서 계속


채널 플러그인이 선택 사항이고 온보딩/설정 시 설치되지 않을 수 있는 경우,
`openclaw/plugin-sdk/channel-setup`의 `createOptionalChannelSetupSurface(...)`를
사용하십시오. 이 함수는 설치 요구사항을 알리고 플러그인이 설치될 때까지
실제 구성 쓰기를 차단하는 설정 어댑터 + 마법사 쌍을 생성합니다.

## 빠른 시작: 도구 플러그인

이 연습에서는 에이전트 도구를 등록하는 최소한의 플러그인을 만듭니다.
채널 및 프로바이더 플러그인에는 위에 링크된 전용 가이드가 있습니다.

1. **패키지 및 매니페스트 만들기**

   ```json package.json
       {
         "name": "@myorg/openclaw-my-plugin",
         "version": "1.0.0",
         "type": "module",
         "openclaw": {
           "extensions": ["./index.ts"],
           "compat": {
             "pluginApi": ">=2026.3.24-beta.2",
             "minGatewayVersion": "2026.3.24-beta.2"
           },
           "build": {
             "openclawVersion": "2026.3.24-beta.2",
             "pluginSdkVersion": "2026.3.24-beta.2"
           }
         }
       }
       ```
   
       ```json openclaw.plugin.json
       {
         "id": "my-plugin",
         "name": "My Plugin",
         "description": "Adds a custom tool to OpenClaw",
         "configSchema": {
           "type": "object",
           "additionalProperties": false
         }
       }
       ```
       구성이 없어도 모든 플러그인에는 매니페스트가 필요합니다.
       전체 스키마는 [매니페스트](/plugins/manifest)를 참조하십시오. 표준 ClawHub
       게시 스니펫은 `docs/snippets/plugin-publish/`에 있습니다.


  2. **엔트리포인트 작성하기**

   ```typescript
       // index.ts
       import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
       import { Type } from "@sinclair/typebox";
   
       export default definePluginEntry({
         id: "my-plugin",
         name: "My Plugin",
         description: "Adds a custom tool to OpenClaw",
         register(api) {
           api.registerTool({
             name: "my_tool",
             description: "Do a thing",
             parameters: Type.Object({ input: Type.String() }),
             async execute(_id, params) {
               return { content: [{ type: "text", text: `Got: ${params.input}` }] };
             },
           });
         },
       });
       ```
   
       `definePluginEntry`는 채널이 아닌 플러그인에 사용합니다. 채널의 경우
       `defineChannelPluginEntry`를 사용하십시오 — [채널 플러그인](/plugins/sdk-channel-plugins)을 참조하십시오.
       전체 엔트리포인트 옵션은 [엔트리 포인트](/plugins/sdk-entrypoints)를 참조하십시오.


  3. **테스트 및 게시**

   **외부 플러그인:** ClawHub로 검증 및 게시한 다음 설치합니다:
   
       ```bash
       clawhub package publish your-org/your-plugin --dry-run
       clawhub package publish your-org/your-plugin
       openclaw plugins install clawhub:@myorg/openclaw-my-plugin
       ```
   
       OpenClaw는 `@myorg/openclaw-my-plugin`과 같은 패키지 스펙에 대해
       npm보다 먼저 ClawHub를 확인합니다.
   
       **리포지토리 내 플러그인:** 번들 플러그인 워크스페이스 트리 아래에 배치하면 자동으로 검색됩니다.
   
       ```bash
       pnpm test -- &lt;bundled-plugin-root&gt;/my-plugin/
       ```


## 플러그인 기능

단일 플러그인은 `api` 객체를 통해 여러 기능을 등록할 수 있습니다:

| 기능                   | 등록 메서드                                      | 상세 가이드                                                                     |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| 텍스트 추론 (LLM)      | `api.registerProvider(...)`                      | [프로바이더 플러그인](/plugins/sdk-provider-plugins)                             |
| CLI 추론 백엔드        | `api.registerCliBackend(...)`                    | [CLI 백엔드](/gateway/cli-backends)                                             |
| 채널 / 메시징          | `api.registerChannel(...)`                       | [채널 플러그인](/plugins/sdk-channel-plugins)                                   |
| 음성 (TTS/STT)         | `api.registerSpeechProvider(...)`                | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 실시간 전사            | `api.registerRealtimeTranscriptionProvider(...)` | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 실시간 음성            | `api.registerRealtimeVoiceProvider(...)`         | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 미디어 이해            | `api.registerMediaUnderstandingProvider(...)`    | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 이미지 생성            | `api.registerImageGenerationProvider(...)`       | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 음악 생성              | `api.registerMusicGenerationProvider(...)`       | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 동영상 생성            | `api.registerVideoGenerationProvider(...)`       | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 웹 페치                | `api.registerWebFetchProvider(...)`              | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 웹 검색                | `api.registerWebSearchProvider(...)`             | [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-5-add-extra-capabilities) |
| 에이전트 도구          | `api.registerTool(...)`                          | 아래                                                                             |
| 커스텀 명령어          | `api.registerCommand(...)`                       | [엔트리 포인트](/plugins/sdk-entrypoints)                                        |
| 이벤트 훅              | `api.registerHook(...)`                          | [엔트리 포인트](/plugins/sdk-entrypoints)                                        |
| HTTP 라우트            | `api.registerHttpRoute(...)`                     | [내부구조](/plugins/architecture#gateway-http-routes)                           |
| CLI 서브명령어         | `api.registerCli(...)`                           | [엔트리 포인트](/plugins/sdk-entrypoints)                                        |

전체 등록 API는 [SDK 개요](/plugins/sdk-overview#registration-api)를 참조하십시오.

플러그인이 커스텀 게이트웨이 RPC 메서드를 등록하는 경우, 플러그인 전용 접두사를 사용하십시오.
코어 관리자 네임스페이스(`config.*`,
`exec.approvals.*`, `wizard.*`, `update.*`)는 예약되어 있으며 플러그인이 더 좁은
범위를 요청하더라도 항상 `operator.admin`으로 확인됩니다.

주의해야 할 훅 가드 의미론:

- `before_tool_call`: `{ block: true }`는 종료적이며 낮은 우선순위 핸들러를 중단합니다.
- `before_tool_call`: `{ block: false }`는 결정 없음으로 처리됩니다.
- `before_tool_call`: `{ requireApproval: true }`는 에이전트 실행을 일시 중지하고 exec 승인 오버레이, Telegram 버튼, Discord 인터랙션, 또는 채널의 `/approve` 명령을 통해 사용자에게 승인을 요청합니다.
- `before_install`: `{ block: true }`는 종료적이며 낮은 우선순위 핸들러를 중단합니다.
- `before_install`: `{ block: false }`는 결정 없음으로 처리됩니다.
- `message_sending`: `{ cancel: true }`는 종료적이며 낮은 우선순위 핸들러를 중단합니다.
- `message_sending`: `{ cancel: false }`는 결정 없음으로 처리됩니다.

`/approve` 명령은 제한된 폴백으로 exec 및 플러그인 승인을 모두 처리합니다: exec 승인 id를 찾을 수 없는 경우, OpenClaw는 플러그인 승인을 통해 동일한 id를 재시도합니다. 플러그인 승인 전달은 구성에서 `approvals.plugin`을 통해 독립적으로 구성할 수 있습니다.

커스텀 승인 배선이 동일한 제한된 폴백 케이스를 감지해야 하는 경우,
승인 만료 문자열을 수동으로 매칭하는 대신 `openclaw/plugin-sdk/error-runtime`의
`isApprovalNotFoundError`를 사용하십시오.

자세한 내용은 [SDK 개요 훅 결정 의미론](/plugins/sdk-overview#hook-decision-semantics)을 참조하십시오.

## 에이전트 도구 등록하기

도구는 LLM이 호출할 수 있는 타입이 지정된 함수입니다. 필수(항상
사용 가능) 또는 선택(사용자 옵트인)이 될 수 있습니다:

```typescript
register(api) {
  // 필수 도구 — 항상 사용 가능
  api.registerTool({
    name: "my_tool",
    description: "Do a thing",
    parameters: Type.Object({ input: Type.String() }),
    async execute(_id, params) {
      return { content: [{ type: "text", text: params.input }] };
    },
  });

  // 선택 도구 — 사용자가 허용 목록에 추가해야 함
  api.registerTool(
    {
      name: "workflow_tool",
      description: "Run a workflow",
      parameters: Type.Object({ pipeline: Type.String() }),
      async execute(_id, params) {
        return { content: [{ type: "text", text: params.pipeline }] };
      },
    },
    { optional: true },
  );
}
```

사용자는 구성에서 선택 도구를 활성화합니다:

```json5
{
  tools: { allow: ["workflow_tool"] },
}
```

- 도구 이름은 코어 도구와 충돌하면 안 됩니다(충돌 시 건너뜁니다)
- 부작용이 있거나 추가 바이너리 요구사항이 있는 도구에는 `optional: true`를 사용하십시오
- 사용자는 `tools.allow`에 플러그인 id를 추가하여 플러그인의 모든 도구를 활성화할 수 있습니다

## 임포트 규칙

항상 집중된 `openclaw/plugin-sdk/&lt;subpath&gt;` 경로에서 임포트하십시오:

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";

// 잘못됨: 단일 루트(더 이상 사용되지 않음, 제거될 예정)
import { ... } from "openclaw/plugin-sdk";
```

전체 서브경로 참조는 [SDK 개요](/plugins/sdk-overview)를 참조하십시오.

플러그인 내부에서는 내부 임포트에 로컬 배럴 파일(`api.ts`, `runtime-api.ts`)을 사용하십시오 —
SDK 경로를 통해 자신의 플러그인을 임포트하지 마십시오.

프로바이더 플러그인의 경우, 이음새가 진정으로 일반적이지 않는 한 프로바이더별 헬퍼를
해당 패키지 루트 배럴에 유지하십시오. 현재 번들 예시:

- Anthropic: Claude 스트림 래퍼 및 `service_tier` / 베타 헬퍼
- OpenAI: 프로바이더 빌더, 기본 모델 헬퍼, 실시간 프로바이더
- OpenRouter: 프로바이더 빌더 및 온보딩/구성 헬퍼

헬퍼가 하나의 번들 프로바이더 패키지 내에서만 유용하다면,
`openclaw/plugin-sdk/*`로 올리는 대신 해당 패키지 루트 이음새에 유지하십시오.

일부 생성된 `openclaw/plugin-sdk/&lt;bundled-id&gt;` 헬퍼 이음새는
번들 플러그인 유지 관리 및 호환성을 위해 여전히 존재합니다. 예를 들어
`plugin-sdk/feishu-setup` 또는 `plugin-sdk/zalo-setup`이 있습니다.
이들을 새로운 서드파티 플러그인의 기본 패턴이 아닌 예약된 표면으로 취급하십시오.

## 제출 전 체크리스트

&lt;Check&gt;**package.json**에 올바른 `openclaw` 메타데이터가 있습니다&lt;/Check&gt;
&lt;Check&gt;**openclaw.plugin.json** 매니페스트가 존재하고 유효합니다&lt;/Check&gt;
&lt;Check&gt;엔트리포인트가 `defineChannelPluginEntry` 또는 `definePluginEntry`를 사용합니다&lt;/Check&gt;
&lt;Check&gt;모든 임포트가 집중된 `plugin-sdk/&lt;subpath&gt;` 경로를 사용합니다&lt;/Check&gt;
&lt;Check&gt;내부 임포트가 로컬 모듈을 사용하며 SDK 자체 임포트를 사용하지 않습니다&lt;/Check&gt;
&lt;Check&gt;테스트가 통과합니다 (`pnpm test -- &lt;bundled-plugin-root&gt;/my-plugin/`)&lt;/Check&gt;
&lt;Check&gt;`pnpm check`가 통과합니다(리포지토리 내 플러그인)&lt;/Check&gt;

## 베타 릴리즈 테스팅

1. [openclaw/openclaw](https://github.com/openclaw/openclaw/releases)의 GitHub 릴리즈 태그를 주시하고 `Watch` > `Releases`를 통해 구독하십시오. 베타 태그는 `v2026.3.N-beta.1`과 같이 표시됩니다. 릴리즈 공지를 위해 공식 OpenClaw X 계정 [@openclaw](https://x.com/openclaw)의 알림을 설정할 수도 있습니다.
2. 베타 태그가 나타나는 즉시 플러그인을 테스트하십시오. 안정 버전 출시 전 창은 일반적으로 몇 시간에 불과합니다.
3. `plugin-forum` Discord 채널의 플러그인 스레드에서 `all good` 또는 무엇이 중단되었는지 테스트 결과를 게시하십시오. 아직 스레드가 없다면 새로 만드십시오.
4. 문제가 발생한 경우, `Beta blocker: &lt;plugin-name&gt; - <summary>` 제목의 이슈를 생성하거나 업데이트하고 `beta-blocker` 레이블을 적용하십시오. 스레드에 이슈 링크를 게시하십시오.
5. `fix(&lt;plugin-id&gt;): beta blocker - <summary>` 제목의 PR을 `main`으로 열고 PR과 Discord 스레드 모두에 이슈를 연결하십시오. 기여자는 PR에 레이블을 붙일 수 없으므로 제목이 유지 관리자와 자동화를 위한 PR 측 신호입니다. PR이 있는 차단 항목은 병합되고, 없는 항목은 그냥 출시될 수 있습니다. 유지 관리자는 베타 테스팅 중 이 스레드를 주시합니다.
6. 침묵은 양호를 의미합니다. 창을 놓친 경우 수정 사항은 다음 주기에 포함될 가능성이 높습니다.

## 다음 단계

> **채널 플러그인**
> 메시징 채널 플러그인 빌드하기


  > **프로바이더 플러그인**
> 모델 프로바이더 플러그인 빌드하기


  > **SDK 개요**
> 임포트 맵 및 등록 API 참조


  > **런타임 헬퍼**
> api.runtime을 통한 TTS, 검색, 서브에이전트


  > **테스팅**
> 테스트 유틸리티 및 패턴


  > **플러그인 매니페스트**
> 전체 매니페스트 스키마 참조


## 관련 문서

- [플러그인 아키텍처](/plugins/architecture) — 내부 아키텍처 심층 분석
- [SDK 개요](/plugins/sdk-overview) — 플러그인 SDK 참조
- [매니페스트](/plugins/manifest) — 플러그인 매니페스트 형식
- [채널 플러그인](/plugins/sdk-channel-plugins) — 채널 플러그인 빌드하기
- [프로바이더 플러그인](/plugins/sdk-provider-plugins) — 프로바이더 플러그인 빌드하기
