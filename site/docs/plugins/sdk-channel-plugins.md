---
title: "채널 플러그인 빌드하기"
description: "OpenClaw용 메시징 채널 플러그인을 빌드하는 단계별 가이드"
---

# 채널 플러그인 빌드하기

이 가이드는 OpenClaw를 메시징 플랫폼에 연결하는 채널 플러그인 빌드를 안내합니다.
끝까지 따라하면 DM 보안, 페어링, 답장 스레딩, 아웃바운드 메시징이 있는
작동하는 채널이 완성됩니다.

::: info
OpenClaw 플러그인을 처음 빌드하는 경우, 기본 패키지 구조 및 매니페스트 설정을 위해
  먼저 [시작하기](/plugins/building-plugins)를 읽으십시오.
:::


## 채널 플러그인 작동 방식

채널 플러그인은 자체 전송/편집/반응 도구가 필요하지 않습니다. OpenClaw는 코어에 하나의 공유
`message` 도구를 유지합니다. 플러그인이 소유하는 것:

- **구성** — 계정 해결 및 설정 마법사
- **보안** — DM 정책 및 허용 목록
- **페어링** — DM 승인 흐름
- **세션 문법** — 프로바이더별 대화 id가 기본 채팅, 스레드 id, 부모 폴백으로 매핑되는 방법
- **아웃바운드** — 플랫폼으로 텍스트, 미디어, 투표 전송
- **스레딩** — 답장이 스레드되는 방법

코어는 공유 메시지 도구, 프롬프트 배선, 외부 세션-키 형태, 일반 `:thread:` 관리,
및 디스패치를 소유합니다.

플랫폼이 대화 id 내에 추가 범위를 저장하는 경우, `messaging.resolveSessionConversation(...)`을
사용하여 플러그인에서 해당 파싱을 유지하십시오. 이것은 `rawId`를 기본 대화 id, 선택적 스레드 id,
명시적 `baseConversationId`, 및 `parentConversationCandidates`로 매핑하는 표준 훅입니다.
`parentConversationCandidates`를 반환할 때, 가장 좁은 부모에서 가장 넓은/기본 대화 순으로
정렬하십시오.

채널 레지스트리가 부팅되기 전에 동일한 파싱이 필요한 번들 플러그인은 일치하는
`resolveSessionConversation(...)` 내보내기가 있는 최상위 `session-key-api.ts` 파일을
노출할 수 있습니다. 코어는 런타임 플러그인 레지스트리가 아직 없을 때만 해당 부트스트랩 안전 표면을 사용합니다.

`messaging.resolveParentConversationCandidates(...)`는 플러그인이 일반/원시 id 위에 부모
폴백만 필요할 때 레거시 호환성 폴백으로 사용 가능합니다. 두 훅이 모두 있으면, 코어는
`resolveSessionConversation(...).parentConversationCandidates`를 먼저 사용하고 표준 훅에서 생략된
경우에만 `resolveParentConversationCandidates(...)`로 폴백합니다.

## 승인 및 채널 기능

대부분의 채널 플러그인은 승인 특정 코드가 필요하지 않습니다.

- 코어는 동일 채팅 `/approve`, 공유 승인 버튼 페이로드, 및 일반 폴백 전달을 소유합니다.
- 채널에 승인 특정 동작이 필요할 때 플러그인에 하나의 `approvalCapability` 객체를 사용하십시오.
- `ChannelPlugin.approvals`는 제거되었습니다. 승인 전달/네이티브/렌더/인증 사실을 `approvalCapability`에 넣으십시오.
- `plugin.auth`는 로그인/로그아웃 전용입니다; 코어는 더 이상 해당 객체에서 승인 인증 훅을 읽지 않습니다.
- `approvalCapability.authorizeActorAction` 및 `approvalCapability.getActionAvailabilityState`는 표준 승인 인증 이음새입니다.
- 동일 채팅 승인 인증 가용성에는 `approvalCapability.getActionAvailabilityState`를 사용하십시오.
- 채널이 네이티브 exec 승인을 노출하는 경우, 시작 표면/네이티브 클라이언트 상태가 동일 채팅 승인 인증과 다를 때 `approvalCapability.getExecInitiatingSurfaceState`를 사용하십시오. 코어는 해당 exec 특정 훅을 사용하여 `enabled` 대 `disabled`를 구분하고, 시작 채널이 네이티브 exec 승인을 지원하는지 결정하고, 채널을 네이티브 클라이언트 폴백 안내에 포함시킵니다. `createApproverRestrictedNativeApprovalCapability(...)`는 일반적인 경우를 채웁니다.
- 채널별 페이로드 수명 주기 동작(예: 중복 로컬 승인 프롬프트 숨기기 또는 전달 전 타이핑 표시기 전송)에는 `outbound.shouldSuppressLocalPayloadPrompt` 또는 `outbound.beforeDeliverPayload`를 사용하십시오.
- 네이티브 승인 라우팅 또는 폴백 억제에만 `approvalCapability.delivery`를 사용하십시오.
- 채널 소유 네이티브 승인 사실에는 `approvalCapability.nativeRuntime`을 사용하십시오. 핫 채널 엔트리포인트에서 `createLazyChannelApprovalNativeRuntimeAdapter(...)`로 지연 로드하여 코어가 승인 수명 주기를 어셈블하는 동안 런타임 모듈을 온디맨드로 임포트할 수 있습니다.
- 채널에 공유 렌더러 대신 커스텀 승인 페이로드가 진정으로 필요할 때만 `approvalCapability.render`를 사용하십시오.
- 채널이 비활성화 경로 답장에서 네이티브 exec 승인을 활성화하는 데 필요한 정확한 구성 노브를 설명하고 싶을 때 `approvalCapability.describeExecApprovalSetup`을 사용하십시오. 훅은 `{ channel, channelLabel, accountId }`를 받습니다; 명명된 계정 채널은 최상위 기본값 대신 `channels.&lt;channel&gt;.accounts.&lt;id&gt;.execApprovals.*`와 같은 계정 범위 경로를 렌더링해야 합니다.
- 채널이 기존 구성에서 안정적인 소유자 같은 DM 신원을 추론할 수 있다면, 코어에 승인 특정 로직을 추가하지 않고 동일 채팅 `/approve`를 제한하기 위해 `openclaw/plugin-sdk/approval-runtime`의 `createResolvedApproverActionAuthAdapter`를 사용하십시오.
- 채널에 네이티브 승인 전달이 필요하면, 채널 코드를 대상 정규화 및 전송/프레젠테이션 사실에 집중하십시오. `openclaw/plugin-sdk/approval-runtime`의 `createChannelExecApprovalProfile`, `createChannelNativeOriginTargetResolver`, `createChannelApproverDmTargetResolver`, `createApproverRestrictedNativeApprovalCapability`를 사용하십시오. 채널별 사실을 `approvalCapability.nativeRuntime` 뒤에 넣으십시오, 이상적으로는 `createChannelApprovalNativeRuntimeAdapter(...)`나 `createLazyChannelApprovalNativeRuntimeAdapter(...)`를 통해, 코어가 핸들러를 어셈블하고 요청 필터링, 라우팅, 중복 제거, 만료, 게이트웨이 구독, 및 다른 곳으로 라우팅된 알림을 소유할 수 있도록 합니다. `nativeRuntime`은 몇 가지 더 작은 이음새로 분할됩니다:
- `availability` — 계정이 구성되었는지 및 요청을 처리해야 하는지
- `presentation` — 공유 승인 뷰 모델을 대기/해결/만료된 네이티브 페이로드 또는 최종 작업으로 매핑
- `transport` — 대상 준비 및 네이티브 승인 메시지 전송/업데이트/삭제
- `interactions` — 네이티브 버튼이나 반응을 위한 선택적 바인드/언바인드/클리어-액션 훅
- `observe` — 선택적 전달 진단 훅
- 채널에 클라이언트, 토큰, Bolt 앱, 웹훅 수신기와 같은 런타임 소유 객체가 필요하면, `openclaw/plugin-sdk/channel-runtime-context`를 통해 등록하십시오. 일반 런타임-컨텍스트 레지스트리를 사용하면 코어가 채널 시작 상태에서 기능 기반 핸들러를 부트스트랩할 수 있습니다.
- 기능 기반 이음새가 충분히 표현적이지 않을 때만 하위 수준의 `createChannelApprovalHandler` 또는 `createChannelNativeApprovalRuntime`을 사용하십시오.
- 네이티브 승인 채널은 해당 헬퍼를 통해 `accountId`와 `approvalKind`를 모두 라우팅해야 합니다. `accountId`는 올바른 봇 계정으로 범위가 지정된 멀티-계정 승인 정책을 유지하고, `approvalKind`는 코어에 하드코딩된 분기 없이 exec 대 플러그인 승인 동작을 채널에서 사용할 수 있게 합니다.
- 코어는 이제 승인 재라우팅 알림도 소유합니다. 채널 플러그인은 `createChannelNativeApprovalRuntime`에서 "승인이 DM/다른 채널로 이동했습니다" 후속 메시지를 자체적으로 전송하지 않아야 합니다; 대신 공유 승인 기능 헬퍼를 통해 정확한 원점 + 승인자-DM 라우팅을 노출하고 코어가 시작 채팅에 알림을 게시하기 전에 실제 전달을 집계하도록 하십시오.
- 전달된 승인 id 종류를 끝까지 보존하십시오. 네이티브 클라이언트는 채널 로컬 상태에서 exec 대 플러그인 승인 라우팅을 추측하거나 다시 쓰지 않아야 합니다.
- 다른 승인 종류는 의도적으로 다른 네이티브 표면을 노출할 수 있습니다.
  현재 번들 예시:
  - Slack은 exec 및 플러그인 id 모두에 네이티브 승인 라우팅을 사용 가능하게 유지합니다.
  - Matrix는 exec 및 플러그인 승인에 대해 동일한 네이티브 DM/채널 라우팅 및 반응 UX를 유지하면서, 승인 종류에 따라 인증이 달라지도록 합니다.
- `createApproverRestrictedNativeApprovalAdapter`는 여전히 호환성 래퍼로 존재하지만, 새 코드는 기능 빌더를 사용하고 플러그인에 `approvalCapability`를 노출하는 것을 선호해야 합니다.

핫 채널 엔트리포인트의 경우, 그 계열의 한 부분만 필요할 때 더 좁은 런타임 서브경로를 사용하십시오:

- `openclaw/plugin-sdk/approval-auth-runtime`
- `openclaw/plugin-sdk/approval-client-runtime`
- `openclaw/plugin-sdk/approval-delivery-runtime`
- `openclaw/plugin-sdk/approval-gateway-runtime`
- `openclaw/plugin-sdk/approval-handler-adapter-runtime`
- `openclaw/plugin-sdk/approval-handler-runtime`
- `openclaw/plugin-sdk/approval-native-runtime`
- `openclaw/plugin-sdk/approval-reply-runtime`
- `openclaw/plugin-sdk/channel-runtime-context`

마찬가지로, 더 넓은 우산 표면이 필요하지 않을 때 `openclaw/plugin-sdk/setup-runtime`,
`openclaw/plugin-sdk/setup-adapter-runtime`,
`openclaw/plugin-sdk/reply-runtime`,
`openclaw/plugin-sdk/reply-dispatch-runtime`,
`openclaw/plugin-sdk/reply-reference`, 및
`openclaw/plugin-sdk/reply-chunking`을 사용하십시오.

## 인바운드 멘션 정책

인바운드 멘션 처리를 두 레이어로 분리하십시오:

- 플러그인 소유 증거 수집
- 공유 정책 평가

공유 레이어에는 `openclaw/plugin-sdk/channel-inbound`를 사용하십시오.

플러그인 로컬 로직에 적합한 것:

- 봇 응답-감지
- 봇 인용 감지
- 스레드-참여 검사
- 서비스/시스템-메시지 제외
- 봇 참여를 증명하는 데 필요한 플랫폼 네이티브 캐시

공유 헬퍼에 적합한 것:

- `requireMention`
- 명시적 멘션 결과
- 암시적 멘션 허용 목록
- 명령어 우회
- 최종 건너뛰기 결정

권장 흐름:

1. 로컬 멘션 사실을 계산합니다.
2. 해당 사실을 `resolveInboundMentionDecision({ facts, policy })`에 전달합니다.
3. 인바운드 게이트에서 `decision.effectiveWasMentioned`, `decision.shouldBypassMention`, `decision.shouldSkip`을 사용합니다.

```typescript
import {
  implicitMentionKindWhen,
  matchesMentionWithExplicit,
  resolveInboundMentionDecision,
} from "openclaw/plugin-sdk/channel-inbound";

const mentionMatch = matchesMentionWithExplicit(text, {
  mentionRegexes,
  mentionPatterns,
});

const facts = {
  canDetectMention: true,
  wasMentioned: mentionMatch.matched,
  hasAnyMention: mentionMatch.hasExplicitMention,
  implicitMentionKinds: [
    ...implicitMentionKindWhen("reply_to_bot", isReplyToBot),
    ...implicitMentionKindWhen("quoted_bot", isQuoteOfBot),
  ],
};

const decision = resolveInboundMentionDecision({
  facts,
  policy: {
    isGroup,
    requireMention,
    allowedImplicitMentionKinds: requireExplicitMention ? [] : ["reply_to_bot", "quoted_bot"],
    allowTextCommands,
    hasControlCommand,
    commandAuthorized,
  },
});

if (decision.shouldSkip) return;
```

`api.runtime.channel.mentions`는 런타임 주입을 이미 사용하는 번들 채널 플러그인을 위해
동일한 공유 멘션 헬퍼를 노출합니다:

- `buildMentionRegexes`
- `matchesMentionPatterns`
- `matchesMentionWithExplicit`
- `implicitMentionKindWhen`
- `resolveInboundMentionDecision`

이전의 `resolveMentionGating*` 헬퍼는 `openclaw/plugin-sdk/channel-inbound`에
호환성 내보내기로만 남아 있습니다. 새 코드는 `resolveInboundMentionDecision({ facts, policy })`를
사용해야 합니다.

## 연습

<a id="step-1-package-and-manifest"></a>
  1. **패키지 및 매니페스트**

   표준 플러그인 파일을 만드십시오. `package.json`의 `channel` 필드가 이것을 채널 플러그인으로
       만드는 것입니다. 전체 패키지-메타데이터 표면은 [플러그인 설정 및 구성](/plugins/sdk-setup#openclawchannel)을
       참조하십시오:
   
       ```json package.json
       {
         "name": "@myorg/openclaw-acme-chat",
         "version": "1.0.0",
         "type": "module",
         "openclaw": {
           "extensions": ["./index.ts"],
           "setupEntry": "./setup-entry.ts",
           "channel": {
             "id": "acme-chat",
             "label": "Acme Chat",
             "blurb": "Connect OpenClaw to Acme Chat."
           }
         }
       }
       ```
   
       ```json openclaw.plugin.json
       {
         "id": "acme-chat",
         "kind": "channel",
         "channels": ["acme-chat"],
         "name": "Acme Chat",
         "description": "Acme Chat channel plugin",
         "configSchema": {
           "type": "object",
           "additionalProperties": false,
           "properties": {
             "acme-chat": {
               "type": "object",
               "properties": {
                 "token": { "type": "string" },
                 "allowFrom": {
                   "type": "array",
                   "items": { "type": "string" }
                 }
               }
             }
           }
         }
       }
       ```
       2. **채널 플러그인 객체 빌드하기**

   `ChannelPlugin` 인터페이스에는 많은 선택적 어댑터 표면이 있습니다. 최솟값인 `id`와
       `setup`으로 시작하고 필요에 따라 어댑터를 추가하십시오.
   
       `src/channel.ts`를 만드십시오:
   
       ```typescript src/channel.ts
       import {
         createChatChannelPlugin,
         createChannelPluginBase,
       } from "openclaw/plugin-sdk/channel-core";
       import type { OpenClawConfig } from "openclaw/plugin-sdk/channel-core";
       import { acmeChatApi } from "./client.js"; // 플랫폼 API 클라이언트
   
       type ResolvedAccount = {
         accountId: string | null;
         token: string;
         allowFrom: string[];
         dmPolicy: string | undefined;
       };
   
       function resolveAccount(
         cfg: OpenClawConfig,
         accountId?: string | null,
       ): ResolvedAccount {
         const section = (cfg.channels as Record&lt;string, any&gt;)?.["acme-chat"];
         const token = section?.token;
         if (!token) throw new Error("acme-chat: token is required");
         return {
           accountId: accountId ?? null,
           token,
           allowFrom: section?.allowFrom ?? [],
           dmPolicy: section?.dmSecurity,
         };
       }
   
       export const acmeChatPlugin = createChatChannelPlugin&lt;ResolvedAccount&gt;({
         base: createChannelPluginBase({
           id: "acme-chat",
           setup: {
             resolveAccount,
             inspectAccount(cfg, accountId) {
               const section =
                 (cfg.channels as Record&lt;string, any&gt;)?.["acme-chat"];
               return {
                 enabled: Boolean(section?.token),
                 configured: Boolean(section?.token),
                 tokenStatus: section?.token ? "available" : "missing",
               };
             },
           },
         }),
   
         // DM 보안: 봇에게 메시지를 보낼 수 있는 사람
         security: {
           dm: {
             channelKey: "acme-chat",
             resolvePolicy: (account) => account.dmPolicy,
             resolveAllowFrom: (account) => account.allowFrom,
             defaultPolicy: "allowlist",
           },
         },
   
         // 페어링: 새 DM 연락처를 위한 승인 흐름
         pairing: {
           text: {
             idLabel: "Acme Chat username",
             message: "Send this code to verify your identity:",
             notify: async ({ target, code }) => {
               await acmeChatApi.sendDm(target, `Pairing code: ${code}`);
             },
           },
         },
   
         // 스레딩: 답장 전달 방식
         threading: { topLevelReplyToMode: "reply" },
   
         // 아웃바운드: 플랫폼으로 메시지 전송
         outbound: {
           attachedResults: {
             sendText: async (params) => {
               const result = await acmeChatApi.sendMessage(
                 params.to,
                 params.text,
               );
               return { messageId: result.id };
             },
           },
           base: {
             sendMedia: async (params) => {
               await acmeChatApi.sendFile(params.to, params.filePath);
             },
           },
         },
       });
       ```
   
       ::: details createChatChannelPlugin이 하는 일
   하위 수준 어댑터 인터페이스를 수동으로 구현하는 대신,
         선언적 옵션을 전달하면 빌더가 이를 구성합니다:
   
         | 옵션 | 배선하는 것 |
         | --- | --- |
         | `security.dm` | 구성 필드에서 범위가 지정된 DM 보안 해결자 |
         | `pairing.text` | 코드 교환이 있는 텍스트 기반 DM 페어링 흐름 |
         | `threading` | 답장-모드 해결자(고정, 계정 범위, 또는 커스텀) |
         | `outbound.attachedResults` | 결과 메타데이터(메시지 id)를 반환하는 전송 함수 |
   
         전체 제어가 필요하면 선언적 옵션 대신 원시 어댑터 객체를 전달할 수도 있습니다.
   :::


  3. **엔트리포인트 배선하기**

   `index.ts`를 만드십시오:
   
       ```typescript index.ts
       import { defineChannelPluginEntry } from "openclaw/plugin-sdk/channel-core";
       import { acmeChatPlugin } from "./src/channel.js";
   
       export default defineChannelPluginEntry({
         id: "acme-chat",
         name: "Acme Chat",
         description: "Acme Chat channel plugin",
         plugin: acmeChatPlugin,
         registerCliMetadata(api) {
           api.registerCli(
             ({ program }) => {
               program
                 .command("acme-chat")
                 .description("Acme Chat management");
             },
             {
               descriptors: [
                 {
                   name: "acme-chat",
                   description: "Acme Chat management",
                   hasSubcommands: false,
                 },
               ],
             },
           );
         },
         registerFull(api) {
           api.registerGatewayMethod(/* ... */);
         },
       });
       ```
   
       채널 소유 CLI 설명자를 `registerCliMetadata(...)`에 넣어 OpenClaw가 전체 채널 런타임을
       활성화하지 않고 루트 도움말에 표시할 수 있게 하고, 일반 전체 로드는 여전히 실제 명령
       등록을 위해 동일한 설명자를 가져옵니다. `registerFull(...)`은 런타임 전용 작업을 위해
       유지하십시오. `registerFull(...)`이 게이트웨이 RPC 메서드를 등록하면, 플러그인 특정
       접두사를 사용하십시오. 코어 관리자 네임스페이스(`config.*`, `exec.approvals.*`,
       `wizard.*`, `update.*`)는 예약되어 있으며 항상 `operator.admin`으로 확인됩니다.
       `defineChannelPluginEntry`는 등록 모드 분할을 자동으로 처리합니다. 모든
       옵션은 [엔트리 포인트](/plugins/sdk-entrypoints#definechannelpluginentry)를 참조하십시오.


  4. **설정 엔트리 추가하기**

   온보딩 중 경량 로딩을 위한 `setup-entry.ts`를 만드십시오:
   
       ```typescript setup-entry.ts
       import { defineSetupPluginEntry } from "openclaw/plugin-sdk/channel-core";
       import { acmeChatPlugin } from "./src/channel.js";
   
       export default defineSetupPluginEntry(acmeChatPlugin);
       ```
   
       채널이 비활성화되거나 구성되지 않은 경우 OpenClaw는 전체 엔트리 대신 이것을 로드합니다.
       설정 흐름 중에 무거운 런타임 코드를 가져오는 것을 방지합니다.
       자세한 내용은 [설정 및 구성](/plugins/sdk-setup#setup-entry)을 참조하십시오.


  5. **인바운드 메시지 처리하기**

   플러그인은 플랫폼에서 메시지를 받아 OpenClaw로 전달해야 합니다. 일반적인 패턴은
       요청을 검증하고 채널의 인바운드 핸들러를 통해 디스패치하는 웹훅입니다:
   
       ```typescript
       registerFull(api) {
         api.registerHttpRoute({
           path: "/acme-chat/webhook",
           auth: "plugin", // 플러그인 관리 인증(직접 서명 검증)
           handler: async (req, res) => {
             const event = parseWebhookPayload(req);
   
             // 인바운드 핸들러가 메시지를 OpenClaw로 디스패치합니다.
             // 정확한 배선은 플랫폼 SDK에 따라 다릅니다 —
             // 번들 Microsoft Teams 또는 Google Chat 플러그인 패키지에서 실제 예시를 참조하십시오.
             await handleAcmeChatInbound(api, event);
   
             res.statusCode = 200;
             res.end("ok");
             return true;
           },
         });
       }
       ```
   
       ::: info NOTE
   인바운드 메시지 처리는 채널에 따라 다릅니다. 각 채널 플러그인은 자체 인바운드 파이프라인을
         소유합니다. 실제 패턴은 번들 채널 플러그인(예: Microsoft Teams 또는 Google Chat 플러그인 패키지)을
         참조하십시오.
   :::


<a id="step-6-test"></a>
6. **테스트**

   `src/channel.test.ts`에 동일한 위치에 테스트를 작성하십시오:
   
       ```typescript src/channel.test.ts
       import { describe, it, expect } from "vitest";
       import { acmeChatPlugin } from "./channel.js";
   
       describe("acme-chat plugin", () => {
         it("resolves account from config", () => {
           const cfg = {
             channels: {
               "acme-chat": { token: "test-token", allowFrom: ["user1"] },
             },
           } as any;
           const account = acmeChatPlugin.setup!.resolveAccount(cfg, undefined);
           expect(account.token).toBe("test-token");
         });
   
         it("inspects account without materializing secrets", () => {
           const cfg = {
             channels: { "acme-chat": { token: "test-token" } },
           } as any;
           const result = acmeChatPlugin.setup!.inspectAccount!(cfg, undefined);
           expect(result.configured).toBe(true);
           expect(result.tokenStatus).toBe("available");
         });
   
         it("reports missing config", () => {
           const cfg = { channels: {} } as any;
           const result = acmeChatPlugin.setup!.inspectAccount!(cfg, undefined);
           expect(result.configured).toBe(false);
         });
       });
       ```
   
       ```bash
       pnpm test -- &lt;bundled-plugin-root&gt;/acme-chat/
       ```
   
       공유 테스트 헬퍼는 [테스팅](/plugins/sdk-testing)을 참조하십시오.


## 파일 구조

```
&lt;bundled-plugin-root&gt;/acme-chat/
├── package.json              # openclaw.channel 메타데이터
├── openclaw.plugin.json      # 구성 스키마가 있는 매니페스트
├── index.ts                  # defineChannelPluginEntry
├── setup-entry.ts            # defineSetupPluginEntry
├── api.ts                    # 공개 내보내기(선택)
├── runtime-api.ts            # 내부 런타임 내보내기(선택)
└── src/
    ├── channel.ts            # createChatChannelPlugin을 통한 ChannelPlugin
    ├── channel.test.ts       # 테스트
    ├── client.ts             # 플랫폼 API 클라이언트
    └── runtime.ts            # 런타임 저장소(필요한 경우)
```

## 고급 주제

> **스레딩 옵션**
> 고정, 계정 범위, 또는 커스텀 답장 모드


  > **메시지 도구 통합**
> describeMessageTool 및 액션 검색


  > **대상 해결**
> inferTargetChatType, looksLikeId, resolveTarget


  > **런타임 헬퍼**
> api.runtime을 통한 TTS, STT, 미디어, 서브에이전트


::: info NOTE
일부 번들 헬퍼 이음새는 번들 플러그인 유지 관리 및 호환성을 위해 여전히 존재합니다.
해당 번들 플러그인 계열을 직접 유지 관리하지 않는 한 새 채널 플러그인에 권장되는
패턴이 아닙니다; 공통 SDK 표면의 일반 채널/설정/답장/런타임 서브경로를 사용하십시오.
:::


## 다음 단계

- [프로바이더 플러그인](/plugins/sdk-provider-plugins) — 플러그인이 모델도 제공하는 경우
- [SDK 개요](/plugins/sdk-overview) — 전체 서브경로 임포트 참조
- [SDK 테스팅](/plugins/sdk-testing) — 테스트 유틸리티 및 계약 테스트
- [플러그인 매니페스트](/plugins/manifest) — 전체 매니페스트 스키마
