---
summary: "OpenClaw용 메시징 channel plugin을 빌드하는 단계별 가이드"
title: "Channel plugin 빌드하기"
sidebarTitle: "Channel Plugins"
read_when:
  - 새로운 메시징 channel plugin을 빌드하려고 할 때
  - OpenClaw를 메시징 플랫폼에 연결하려고 할 때
  - ChannelPlugin adapter 표면을 이해해야 할 때
---

이 가이드는 OpenClaw를 메시징 플랫폼에 연결하는 channel plugin을 빌드하는 과정을 안내합니다.
끝까지 따라오시면 DM 보안, pairing, 답장 스레딩, 아웃바운드 메시징이 작동하는
channel이 완성됩니다.

<Info>
  OpenClaw plugin을 한 번도 빌드해 본 적이 없으시다면, 기본 패키지 구조와 manifest 설정을 위해
  먼저 [시작하기](/plugins/building-plugins)를 읽으십시오.
</Info>

## Channel plugin의 작동 방식

Channel plugin은 자체 send/edit/react 도구가 필요하지 않습니다. OpenClaw는 코어에 하나의
공유 `message` 도구를 유지합니다. 플러그인이 소유하는 것:

- **Config** — 계정 해결(account resolution) 및 setup 마법사
- **Security** — DM 정책 및 allowlist
- **Pairing** — DM 승인 흐름
- **Session grammar** — 프로바이더별 대화 id가 base chat, thread id, parent fallback으로 매핑되는 방식
- **Outbound** — 플랫폼으로 텍스트, 미디어, 투표(poll) 전송
- **Threading** — 답장이 스레드되는 방식
- **Heartbeat typing** — heartbeat delivery target을 위한 선택적 typing/busy 신호

코어는 공유 message 도구, 프롬프트 배선, 외부 session-key 모양, 일반 `:thread:` 관리,
및 dispatch를 소유합니다.

Channel이 인바운드 답장 외부에서 typing 표시기를 지원한다면, channel plugin에
`heartbeat.sendTyping(...)`을 노출하십시오. 코어는 heartbeat 모델 실행이 시작되기 전에
해결된 heartbeat delivery target으로 이를 호출하며, 공유 typing keepalive/cleanup 수명 주기를
사용합니다. 플랫폼에 명시적 정지 신호가 필요한 경우 `heartbeat.clearTyping(...)`을 추가하십시오.

Channel이 media source를 전달하는 message-tool 파라미터를 추가한다면, 해당 파라미터
이름을 `describeMessageTool(...).mediaSourceParams`를 통해 노출하십시오. 코어는 이 명시적
목록을 sandbox 경로 정규화와 아웃바운드 media-access 정책에 사용하므로, plugin은 프로바이더별
avatar, attachment, cover-image 파라미터에 대해 shared-core 특수 케이스가 필요하지 않습니다.
관련 없는 action이 다른 action의 media 인자를 상속받지 않도록
`{ "set-profile": ["avatarUrl", "avatarPath"] }`와 같이 action-keyed 맵을 반환하는 것을
선호하십시오. 노출된 모든 action에 의도적으로 공유되는 파라미터의 경우 평탄한 배열도
여전히 작동합니다.

플랫폼이 대화 id 내부에 추가 scope를 저장한다면, 해당 파싱을 plugin 내부에
`messaging.resolveSessionConversation(...)`으로 유지하십시오. 이는 `rawId`를 base 대화 id,
선택적 thread id, 명시적 `baseConversationId`, 그리고 `parentConversationCandidates`로 매핑하는
표준(canonical) 훅입니다. `parentConversationCandidates`를 반환할 때는 가장 좁은 parent에서
가장 넓은/base 대화 순으로 정렬된 상태로 유지하십시오.

Channel registry가 부팅되기 전에 동일한 파싱이 필요한 번들 plugin은 일치하는
`resolveSessionConversation(...)` export가 있는 최상위 `session-key-api.ts` 파일도 노출할
수 있습니다. 코어는 runtime plugin registry를 아직 사용할 수 없을 때만 해당 bootstrap-safe
표면을 사용합니다.

`messaging.resolveParentConversationCandidates(...)`는 plugin이 generic/raw id 위에 parent
fallback만 필요한 경우를 위한 레거시 호환성 fallback으로 남아 있습니다. 두 훅이 모두 존재하면,
코어는 `resolveSessionConversation(...).parentConversationCandidates`를 먼저 사용하고,
표준 훅이 이를 생략했을 때만 `resolveParentConversationCandidates(...)`로 fallback합니다.

## Approval 및 channel capability

대부분의 channel plugin은 approval 전용 코드가 필요하지 않습니다.

- 코어는 동일 채팅 `/approve`, 공유 approval 버튼 payload, 그리고 일반(generic) fallback delivery를 소유합니다.
- Channel이 approval 전용 동작을 필요로 할 때 channel plugin에 하나의 `approvalCapability` 객체를 사용하는 것을 선호하십시오.
- `ChannelPlugin.approvals`는 제거되었습니다. approval delivery/native/render/auth 관련 사실은 `approvalCapability`에 넣으십시오.
- `plugin.auth`는 login/logout 전용입니다; 코어는 더 이상 해당 객체에서 approval auth 훅을 읽지 않습니다.
- `approvalCapability.authorizeActorAction`과 `approvalCapability.getActionAvailabilityState`가 표준(canonical) approval-auth seam입니다.
- 동일 채팅 approval auth 가용성에는 `approvalCapability.getActionAvailabilityState`를 사용하십시오.
- Channel이 네이티브 exec approval을 노출하는 경우, initiating-surface/native-client 상태가 동일 채팅 approval auth와 다를 때 `approvalCapability.getExecInitiatingSurfaceState`를 사용하십시오. 코어는 해당 exec 전용 훅을 사용해 `enabled` 대 `disabled`를 구분하고, initiating channel이 네이티브 exec approval을 지원하는지 결정하며, native-client fallback 안내에 channel을 포함시킵니다. `createApproverRestrictedNativeApprovalCapability(...)`가 일반적인 경우를 채워 줍니다.
- 중복 로컬 approval 프롬프트 숨기기나 delivery 이전 typing 표시기 전송과 같은 channel 전용 payload 수명 주기 동작에는 `outbound.shouldSuppressLocalPayloadPrompt` 또는 `outbound.beforeDeliverPayload`를 사용하십시오.
- `approvalCapability.delivery`는 네이티브 approval 라우팅 또는 fallback 억제에만 사용하십시오.
- Channel 소유 네이티브 approval 관련 사실에는 `approvalCapability.nativeRuntime`을 사용하십시오. 핫(hot) channel entrypoint에서는 `createLazyChannelApprovalNativeRuntimeAdapter(...)`를 사용해 lazy하게 유지하십시오. 이는 코어가 approval 수명 주기를 조립하도록 두면서도 runtime 모듈을 요청 시점에 import할 수 있게 합니다.
- 공유 renderer 대신 커스텀 approval payload가 정말로 필요할 때만 `approvalCapability.render`를 사용하십시오.
- disabled-path 답장이 네이티브 exec approval을 활성화하는 데 필요한 정확한 config 노브(knob)를 설명하기를 원할 때 `approvalCapability.describeExecApprovalSetup`을 사용하십시오. 이 훅은 `{ channel, channelLabel, accountId }`를 받습니다; named-account channel은 최상위 기본값 대신 `channels.<channel>.accounts.<id>.execApprovals.*`와 같이 account-scoped 경로를 렌더링해야 합니다.
- Channel이 기존 config에서 안정적인 owner-like DM 아이덴티티를 추론할 수 있다면, approval 전용 코어 로직을 추가하지 않고 동일 채팅 `/approve`를 제한하기 위해 `openclaw/plugin-sdk/approval-runtime`의 `createResolvedApproverActionAuthAdapter`를 사용하십시오.
- Channel에 네이티브 approval delivery가 필요하다면, channel 코드는 target 정규화와 transport/presentation 관련 사실에 집중하십시오. `openclaw/plugin-sdk/approval-runtime`의 `createChannelExecApprovalProfile`, `createChannelNativeOriginTargetResolver`, `createChannelApproverDmTargetResolver`, `createApproverRestrictedNativeApprovalCapability`를 사용하십시오. Channel 전용 사실은 `approvalCapability.nativeRuntime` 뒤에 배치하되, 이상적으로는 `createChannelApprovalNativeRuntimeAdapter(...)` 또는 `createLazyChannelApprovalNativeRuntimeAdapter(...)`를 통해 배치해 코어가 handler를 조립하고 요청 필터링, 라우팅, 중복 제거(dedupe), 만료(expiry), gateway 구독, routed-elsewhere 알림을 소유할 수 있도록 하십시오. `nativeRuntime`은 몇 가지 더 작은 seam으로 분할됩니다:
- `availability` — 계정이 구성되었는지 여부와 요청이 처리되어야 하는지 여부
- `presentation` — 공유 approval 뷰 모델을 대기(pending)/해결(resolved)/만료(expired) 네이티브 payload 또는 최종 액션으로 매핑
- `transport` — target을 준비하고 네이티브 approval 메시지를 송신/업데이트/삭제
- `interactions` — 네이티브 버튼이나 반응을 위한 선택적 bind/unbind/clear-action 훅
- `observe` — 선택적 delivery 진단 훅
- Channel에 client, token, Bolt app, webhook receiver 같은 runtime 소유 객체가 필요하다면, `openclaw/plugin-sdk/channel-runtime-context`를 통해 등록하십시오. 일반(generic) runtime-context registry는 approval 전용 wrapper glue를 추가하지 않고도 channel 시작 상태로부터 capability-driven handler를 코어가 bootstrap할 수 있게 해 줍니다.
- capability-driven seam이 아직 충분히 표현력 있지 않을 때에만 하위 수준의 `createChannelApprovalHandler` 또는 `createChannelNativeApprovalRuntime`에 의존하십시오.
- 네이티브 approval channel은 해당 helper들을 통해 `accountId`와 `approvalKind`를 모두 라우팅해야 합니다. `accountId`는 멀티 계정 approval 정책을 올바른 봇 계정으로 scope한 상태로 유지하고, `approvalKind`는 코어에 하드코딩된 분기 없이 channel이 exec 대 plugin approval 동작을 구분할 수 있게 해 줍니다.
- 이제 코어가 approval reroute 알림도 소유합니다. Channel plugin은 `createChannelNativeApprovalRuntime`에서 자체적으로 "approval이 DM으로/다른 channel로 이동했습니다" 후속 메시지를 전송하지 않아야 합니다; 대신 공유 approval capability helper를 통해 정확한 origin + approver-DM 라우팅을 노출하고, 코어가 실제 delivery를 집계한 뒤 initiating chat에 알림을 게시하도록 두십시오.
- 전달된 approval id의 kind를 end-to-end로 보존하십시오. 네이티브 client는 channel-local 상태에서 exec 대 plugin approval 라우팅을 추측하거나 다시 쓰지 않아야 합니다.
- 서로 다른 approval kind는 의도적으로 서로 다른 네이티브 표면을 노출할 수 있습니다.
  현재 번들된 예시:
  - Slack은 exec와 plugin id 모두에 대해 네이티브 approval 라우팅을 사용 가능한 상태로 유지합니다.
  - Matrix는 exec와 plugin approval에 대해 동일한 네이티브 DM/channel 라우팅과 반응 UX를 유지하면서도, approval kind에 따라 auth가 달라질 수 있게 둡니다.
- `createApproverRestrictedNativeApprovalAdapter`는 여전히 호환성 wrapper로 존재하지만, 새 코드는 capability 빌더를 선호하고 plugin에 `approvalCapability`를 노출해야 합니다.

핫(hot) channel entrypoint의 경우, 해당 family에서 한 부분만 필요할 때는 더 좁은 runtime
서브패스를 선호하십시오:

- `openclaw/plugin-sdk/approval-auth-runtime`
- `openclaw/plugin-sdk/approval-client-runtime`
- `openclaw/plugin-sdk/approval-delivery-runtime`
- `openclaw/plugin-sdk/approval-gateway-runtime`
- `openclaw/plugin-sdk/approval-handler-adapter-runtime`
- `openclaw/plugin-sdk/approval-handler-runtime`
- `openclaw/plugin-sdk/approval-native-runtime`
- `openclaw/plugin-sdk/approval-reply-runtime`
- `openclaw/plugin-sdk/channel-runtime-context`

마찬가지로, 더 넓은 우산(umbrella) 표면이 필요하지 않다면 `openclaw/plugin-sdk/setup-runtime`,
`openclaw/plugin-sdk/setup-adapter-runtime`,
`openclaw/plugin-sdk/reply-runtime`,
`openclaw/plugin-sdk/reply-dispatch-runtime`,
`openclaw/plugin-sdk/reply-reference`,
`openclaw/plugin-sdk/reply-chunking`을 선호하십시오.

Setup의 경우 특히:

- `openclaw/plugin-sdk/setup-runtime`은 runtime-safe setup helper를 다룹니다:
  import-safe setup patch adapter (`createPatchedAccountSetupAdapter`,
  `createEnvPatchedAccountSetupAdapter`,
  `createSetupInputPresenceValidator`), lookup-note 출력,
  `promptResolvedAllowFrom`, `splitSetupEntries`, 그리고 위임된(delegated)
  setup-proxy 빌더
- `openclaw/plugin-sdk/setup-adapter-runtime`은 `createEnvPatchedAccountSetupAdapter`를 위한
  좁은 env-aware adapter seam입니다
- `openclaw/plugin-sdk/channel-setup`은 optional-install setup 빌더와 몇 가지 setup-safe
  프리미티브를 다룹니다:
  `createOptionalChannelSetupSurface`, `createOptionalChannelSetupAdapter`,

Channel이 env 기반 setup 또는 auth를 지원하고, runtime이 로드되기 전에 일반
startup/config 흐름이 해당 env 이름을 알아야 한다면, plugin manifest에서 `channelEnvVars`로
선언하십시오. Channel runtime `envVars` 또는 로컬 상수는 운영자 대면 문구 전용으로만
유지하십시오.

Channel이 plugin runtime이 시작되기 전에 `status`, `channels list`, `channels status`, 또는
SecretRef 스캔에 나타날 수 있다면, `package.json`에 `openclaw.setupEntry`를 추가하십시오.
해당 entrypoint는 read-only 명령 경로에서 import하기 안전해야 하며, 이러한 요약에 필요한
channel 메타데이터, setup-safe config adapter, status adapter, 그리고 channel secret target
메타데이터를 반환해야 합니다. Setup entry에서는 client, listener, transport runtime을
시작하지 마십시오.

`createOptionalChannelSetupWizard`, `DEFAULT_ACCOUNT_ID`,
`createTopLevelChannelDmPolicy`, `setSetupChannelEnabled`,
`splitSetupEntries`

- `moveSingleAccountChannelSectionToDefaultAccount(...)`와 같은 더 무거운 공유 setup/config
  helper도 필요한 경우에만 더 넓은 `openclaw/plugin-sdk/setup` seam을 사용하십시오

Channel이 setup 표면에서 "이 plugin을 먼저 설치하세요"만 광고하고 싶다면,
`createOptionalChannelSetupSurface(...)`를 선호하십시오. 생성된 adapter/wizard는 config 쓰기와
finalization에서 fail-closed로 동작하며, validation, finalize, docs-link 문구 전반에 걸쳐
동일한 install-required 메시지를 재사용합니다.

다른 핫(hot) channel 경로의 경우, 더 넓은 레거시 표면보다는 좁은 helper를 선호하십시오:

- 멀티 계정 config 및 default-account fallback용:
  `openclaw/plugin-sdk/account-core`,
  `openclaw/plugin-sdk/account-id`,
  `openclaw/plugin-sdk/account-resolution`,
  `openclaw/plugin-sdk/account-helpers`
- 인바운드 라우트/envelope 및 record-and-dispatch 배선용:
  `openclaw/plugin-sdk/inbound-envelope` 및
  `openclaw/plugin-sdk/inbound-reply-dispatch`
- Target 파싱/매칭용: `openclaw/plugin-sdk/messaging-targets`
- 미디어 로딩 및 아웃바운드 아이덴티티/send delegate와 payload 계획용:
  `openclaw/plugin-sdk/outbound-media` 및
  `openclaw/plugin-sdk/outbound-runtime`
- `openclaw/plugin-sdk/channel-core`의
  `buildThreadAwareOutboundSessionRoute(...)` — 아웃바운드 라우트가 명시적
  `replyToId`/`threadId`를 보존하거나, base session key가 여전히 일치할 때 현재 `:thread:`
  session을 복구해야 할 때 사용합니다. 프로바이더 plugin은 플랫폼에 네이티브 스레드 delivery
  의미론이 있을 때 우선순위, suffix 동작, thread id 정규화를 override할 수 있습니다.
- 스레드 바인딩 수명 주기와 adapter 등록용: `openclaw/plugin-sdk/thread-bindings-runtime`
- 레거시 agent/media payload 필드 레이아웃이 여전히 필요한 경우에만:
  `openclaw/plugin-sdk/agent-media-payload`
- Telegram custom-command 정규화, 중복/충돌 검증, 그리고 fallback-stable command
  config contract용: `openclaw/plugin-sdk/telegram-command-config`

Auth 전용 channel은 일반적으로 기본 경로에서 멈출 수 있습니다: 코어가 approval을 처리하고
plugin은 outbound/auth capability만 노출합니다. Matrix, Slack, Telegram, 그리고 커스텀 채팅
transport와 같은 네이티브 approval channel은 자체 approval 수명 주기를 직접 만드는 대신
공유된 네이티브 helper를 사용해야 합니다.

## 인바운드 mention 정책

인바운드 mention 처리를 두 레이어로 분리해서 유지하십시오:

- plugin 소유 증거 수집
- 공유 정책 평가

Mention 정책 결정에는 `openclaw/plugin-sdk/channel-mention-gating`을 사용하십시오.
더 넓은 인바운드 helper 배럴이 필요할 때에만 `openclaw/plugin-sdk/channel-inbound`를 사용하십시오.

Plugin 로컬 로직에 적합한 것:

- 봇에 대한 답장(reply-to-bot) 감지
- 인용된 봇(quoted-bot) 감지
- 스레드 참여(thread-participation) 검사
- service/system-message 제외
- 봇 참여를 증명하는 데 필요한 플랫폼 네이티브 캐시

공유 helper에 적합한 것:

- `requireMention`
- 명시적 mention 결과
- 암시적 mention allowlist
- 명령어 bypass
- 최종 skip 결정

권장되는 흐름:

1. 로컬 mention 사실을 계산합니다.
2. 해당 사실을 `resolveInboundMentionDecision({ facts, policy })`에 전달합니다.
3. 인바운드 게이트에서 `decision.effectiveWasMentioned`, `decision.shouldBypassMention`, `decision.shouldSkip`를 사용합니다.

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

`api.runtime.channel.mentions`는 이미 runtime 주입에 의존하는 번들 channel plugin을 위해
동일한 공유 mention helper를 노출합니다:

- `buildMentionRegexes`
- `matchesMentionPatterns`
- `matchesMentionWithExplicit`
- `implicitMentionKindWhen`
- `resolveInboundMentionDecision`

`implicitMentionKindWhen`과 `resolveInboundMentionDecision`만 필요하다면, 관련 없는 인바운드
runtime helper를 로드하지 않도록 `openclaw/plugin-sdk/channel-mention-gating`에서 import하십시오.

이전의 `resolveMentionGating*` helper는 `openclaw/plugin-sdk/channel-inbound`에 호환성
export로만 남아 있습니다. 새 코드는 `resolveInboundMentionDecision({ facts, policy })`를
사용해야 합니다.

## 연습

<Steps>
  <a id="step-1-package-and-manifest"></a>
  <Step title="Package 및 manifest">
    표준 plugin 파일을 만드십시오. `package.json`의 `channel` 필드가 이것을 channel plugin으로
    만들어 주는 요소입니다. 전체 package-metadata 표면은
    [Plugin Setup 및 Config](/plugins/sdk-setup#openclaw-channel)를 참조하십시오:

    <CodeGroup>
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
    </CodeGroup>

  </Step>

  <Step title="Channel plugin 객체 빌드하기">
    `ChannelPlugin` 인터페이스에는 많은 선택적 adapter 표면이 있습니다. 최소값인 `id`와
    `setup`으로 시작하고 필요에 따라 adapter를 추가하십시오.

    `src/channel.ts`를 만드십시오:

    ```typescript src/channel.ts
    import {
      createChatChannelPlugin,
      createChannelPluginBase,
    } from "openclaw/plugin-sdk/channel-core";
    import type { OpenClawConfig } from "openclaw/plugin-sdk/channel-core";
    import { acmeChatApi } from "./client.js"; // your platform API client

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
      const section = (cfg.channels as Record<string, any>)?.["acme-chat"];
      const token = section?.token;
      if (!token) throw new Error("acme-chat: token is required");
      return {
        accountId: accountId ?? null,
        token,
        allowFrom: section?.allowFrom ?? [],
        dmPolicy: section?.dmSecurity,
      };
    }

    export const acmeChatPlugin = createChatChannelPlugin<ResolvedAccount>({
      base: createChannelPluginBase({
        id: "acme-chat",
        setup: {
          resolveAccount,
          inspectAccount(cfg, accountId) {
            const section =
              (cfg.channels as Record<string, any>)?.["acme-chat"];
            return {
              enabled: Boolean(section?.token),
              configured: Boolean(section?.token),
              tokenStatus: section?.token ? "available" : "missing",
            };
          },
        },
      }),

      // DM security: who can message the bot
      security: {
        dm: {
          channelKey: "acme-chat",
          resolvePolicy: (account) => account.dmPolicy,
          resolveAllowFrom: (account) => account.allowFrom,
          defaultPolicy: "allowlist",
        },
      },

      // Pairing: approval flow for new DM contacts
      pairing: {
        text: {
          idLabel: "Acme Chat username",
          message: "Send this code to verify your identity:",
          notify: async ({ target, code }) => {
            await acmeChatApi.sendDm(target, `Pairing code: ${code}`);
          },
        },
      },

      // Threading: how replies are delivered
      threading: { topLevelReplyToMode: "reply" },

      // Outbound: send messages to the platform
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

    <Accordion title="createChatChannelPlugin이 대신 해 주는 일">
      저수준 adapter 인터페이스를 수동으로 구현하는 대신, 선언적 옵션을 전달하면
      빌더가 이를 조합해 줍니다:

      | 옵션 | 배선되는 항목 |
      | --- | --- |
      | `security.dm` | config 필드로부터의 scope된 DM security resolver |
      | `pairing.text` | 코드 교환이 있는 텍스트 기반 DM pairing 흐름 |
      | `threading` | Reply-to-mode resolver (fixed, account-scoped, 또는 custom) |
      | `outbound.attachedResults` | 결과 메타데이터(message id)를 반환하는 send 함수 |

      전체 제어가 필요하다면 선언적 옵션 대신 원시(raw) adapter 객체를 전달할 수도
      있습니다.
    </Accordion>

  </Step>

  <Step title="Entry point 배선하기">
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

    Channel 소유의 CLI descriptor는 `registerCliMetadata(...)`에 넣어, 전체 channel runtime을
    활성화하지 않고도 OpenClaw가 root help에 표시할 수 있게 하십시오. 일반 full 로드에서는
    여전히 실제 명령 등록을 위해 동일한 descriptor를 가져옵니다. runtime 전용 작업은
    `registerFull(...)`에 남겨 두십시오.
    `registerFull(...)`이 gateway RPC 메서드를 등록한다면 plugin 전용 접두사를 사용하십시오.
    코어 admin 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`, `update.*`)는
    예약된 상태로 유지되며 항상 `operator.admin`으로 해석됩니다.
    `defineChannelPluginEntry`는 등록 모드 분할을 자동으로 처리합니다. 모든 옵션은
    [Entry Points](/plugins/sdk-entrypoints#definechannelpluginentry)를 참조하십시오.

  </Step>

  <Step title="Setup entry 추가하기">
    온보딩 중 경량 로딩을 위해 `setup-entry.ts`를 만드십시오:

    ```typescript setup-entry.ts
    import { defineSetupPluginEntry } from "openclaw/plugin-sdk/channel-core";
    import { acmeChatPlugin } from "./src/channel.js";

    export default defineSetupPluginEntry(acmeChatPlugin);
    ```

    Channel이 비활성화되거나 구성되지 않은 경우, OpenClaw는 full entry 대신 이것을 로드합니다.
    Setup 흐름 중 무거운 runtime 코드를 끌어들이는 것을 피합니다.
    자세한 내용은 [Setup 및 Config](/plugins/sdk-setup#setup-entry)를 참조하십시오.

    Setup-safe export를 sidecar 모듈로 분리하는 번들 workspace channel은 명시적 setup-time
    runtime setter도 필요할 때 `openclaw/plugin-sdk/channel-entry-contract`의
    `defineBundledChannelSetupEntry(...)`를 사용할 수 있습니다.

  </Step>

  <Step title="인바운드 메시지 처리하기">
    Plugin은 플랫폼으로부터 메시지를 받아 OpenClaw로 전달해야 합니다. 일반적인 패턴은
    요청을 검증하고 channel의 인바운드 handler를 통해 dispatch하는 webhook입니다:

    ```typescript
    registerFull(api) {
      api.registerHttpRoute({
        path: "/acme-chat/webhook",
        auth: "plugin", // plugin-managed auth (verify signatures yourself)
        handler: async (req, res) => {
          const event = parseWebhookPayload(req);

          // Your inbound handler dispatches the message to OpenClaw.
          // The exact wiring depends on your platform SDK —
          // see a real example in the bundled Microsoft Teams or Google Chat plugin package.
          await handleAcmeChatInbound(api, event);

          res.statusCode = 200;
          res.end("ok");
          return true;
        },
      });
    }
    ```

    <Note>
      인바운드 메시지 처리는 channel마다 다릅니다. 각 channel plugin은 자체 인바운드
      pipeline을 소유합니다. 실제 패턴은 번들 channel plugin(예: Microsoft Teams 또는
      Google Chat plugin 패키지)을 참조하십시오.
    </Note>

  </Step>

<a id="step-6-test"></a>
<Step title="테스트">
`src/channel.test.ts`에 colocated 테스트를 작성하십시오:

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
    pnpm test -- <bundled-plugin-root>/acme-chat/
    ```

    공유 테스트 helper는 [Testing](/plugins/sdk-testing)을 참조하십시오.

  </Step>
</Steps>

## 파일 구조

```
<bundled-plugin-root>/acme-chat/
├── package.json              # openclaw.channel metadata
├── openclaw.plugin.json      # Manifest with config schema
├── index.ts                  # defineChannelPluginEntry
├── setup-entry.ts            # defineSetupPluginEntry
├── api.ts                    # Public exports (optional)
├── runtime-api.ts            # Internal runtime exports (optional)
└── src/
    ├── channel.ts            # ChannelPlugin via createChatChannelPlugin
    ├── channel.test.ts       # Tests
    ├── client.ts             # Platform API client
    └── runtime.ts            # Runtime store (if needed)
```

## 고급 주제

<CardGroup cols={2}>
  <Card title="Threading 옵션" icon="git-branch" href="/plugins/sdk-entrypoints#registration-mode">
    Fixed, account-scoped, 또는 custom 답장 모드
  </Card>
  <Card title="Message 도구 통합" icon="puzzle" href="/plugins/architecture#channel-plugins-and-the-shared-message-tool">
    describeMessageTool 및 action 검색
  </Card>
  <Card title="Target 해결" icon="crosshair" href="/plugins/architecture-internals#channel-target-resolution">
    inferTargetChatType, looksLikeId, resolveTarget
  </Card>
  <Card title="Runtime helper" icon="settings" href="/plugins/sdk-runtime">
    api.runtime을 통한 TTS, STT, 미디어, subagent
  </Card>
</CardGroup>

<Note>
일부 번들 helper seam은 번들 plugin 유지보수와 호환성을 위해 여전히 존재합니다.
해당 번들 plugin family를 직접 유지보수하고 있는 경우가 아니라면, 새 channel plugin에
권장되는 패턴은 아닙니다. 공통 SDK 표면의 일반 channel/setup/reply/runtime 서브패스를
선호하십시오.
</Note>

## 다음 단계

- [Provider Plugins](/plugins/sdk-provider-plugins) — plugin이 모델도 제공하는 경우
- [SDK 개요](/plugins/sdk-overview) — 전체 서브패스 import 레퍼런스
- [SDK 테스팅](/plugins/sdk-testing) — 테스트 유틸리티 및 contract 테스트
- [Plugin Manifest](/plugins/manifest) — 전체 manifest 스키마

## 관련 문서

- [Plugin SDK setup](/plugins/sdk-setup)
- [Plugin 빌드하기](/plugins/building-plugins)
- [Agent harness plugin](/plugins/sdk-agent-harness)
