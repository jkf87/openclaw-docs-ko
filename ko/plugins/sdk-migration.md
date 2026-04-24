---
summary: "레거시 하위 호환성 레이어에서 최신 플러그인 SDK로 마이그레이션"
title: "플러그인 SDK 마이그레이션"
sidebarTitle: "SDK 마이그레이션"
read_when:
  - OPENCLAW_PLUGIN_SDK_COMPAT_DEPRECATED 경고를 보았을 때
  - OPENCLAW_EXTENSION_API_DEPRECATED 경고를 보았을 때
  - 플러그인을 최신 플러그인 아키텍처로 업데이트하고 있을 때
  - 외부 OpenClaw 플러그인을 유지보수하고 있을 때
---

OpenClaw는 광범위한 하위 호환성(backwards-compatibility) 레이어에서 집중적이고 문서화된 임포트를 가진 최신 플러그인 아키텍처로 전환되었습니다. 새로운 아키텍처 이전에 만들어진 플러그인이 있다면, 이 가이드가 마이그레이션에 도움을 드립니다.

## 무엇이 바뀌었는지

기존 플러그인 시스템은 플러그인이 단일 엔트리포인트에서 필요한 모든 것을 임포트할 수 있도록 두 가지 넓게 열린 표면(surface)을 제공했습니다:

- **`openclaw/plugin-sdk/compat`** — 수십 개의 헬퍼를 다시 내보내는(re-export) 단일 임포트입니다. 새로운 플러그인 아키텍처가 구축되는 동안 오래된 훅 기반 플러그인을 계속 작동시키기 위해 도입되었습니다.
- **`openclaw/extension-api`** — 임베디드 agent 러너와 같은 호스트 측 헬퍼에 대한 직접적인 접근을 플러그인에 제공하는 브리지(bridge)입니다.

두 표면 모두 이제 **deprecated** 되었습니다. 런타임에서는 여전히 작동하지만, 새로운 플러그인은 이를 사용해서는 안 되며, 기존 플러그인도 다음 메이저 릴리스에서 제거되기 전에 마이그레이션해야 합니다.

OpenClaw는 대체(replacement)를 도입하는 동일한 변경에서 문서화된 플러그인 동작을 제거하거나 재해석하지 않습니다. 파괴적 계약 변경(Breaking contract changes)은 먼저 호환성 어댑터, 진단(diagnostics), 문서, 그리고 deprecation 기간을 거쳐야 합니다. 이는 SDK 임포트, manifest 필드, setup API, hook, 런타임 등록 동작 모두에 적용됩니다.

<Warning>
  하위 호환성 레이어는 향후 메이저 릴리스에서 제거됩니다. 이 표면에서 여전히 임포트하는 플러그인은 그 시점에 동작이 중단됩니다.
</Warning>

## 왜 바뀌었는지

기존 방식은 다음과 같은 문제를 일으켰습니다:

- **느린 시작** — 헬퍼 하나를 임포트하면 관련 없는 수십 개의 모듈이 로드되었습니다
- **순환 의존성** — 광범위한 재내보내기는 임포트 사이클을 쉽게 만들었습니다
- **불명확한 API 표면** — 어떤 내보내기가 안정적인지 내부용인지 구분할 수 없었습니다

최신 플러그인 SDK는 이 문제를 해결합니다: 각 임포트 경로(`openclaw/plugin-sdk/\<subpath\>`)는 명확한 목적과 문서화된 계약을 가진 작고 독립적인 모듈입니다.

번들된 채널용 레거시 provider 편의 이음새(seam)도 제거되었습니다. `openclaw/plugin-sdk/slack`, `openclaw/plugin-sdk/discord`, `openclaw/plugin-sdk/signal`, `openclaw/plugin-sdk/whatsapp`와 같은 임포트, 채널 브랜드 헬퍼 이음새, `openclaw/plugin-sdk/telegram-core`는 안정적인 플러그인 계약이 아닌 비공개 모노레포 단축 경로였습니다. 대신 좁고 범용적인 SDK 서브패스를 사용하십시오. 번들된 플러그인 워크스페이스 내부에서는 provider 소유 헬퍼를 해당 플러그인 자체의 `api.ts` 또는 `runtime-api.ts`에 유지하십시오.

현재 번들된 provider 예시:

- Anthropic은 Claude 전용 stream 헬퍼를 자체 `api.ts` / `contract-api.ts` 이음새에 유지합니다
- OpenAI는 provider 빌더, 기본 모델 헬퍼, realtime provider 빌더를 자체 `api.ts`에 유지합니다
- OpenRouter는 provider 빌더와 온보딩/구성 헬퍼를 자체 `api.ts`에 유지합니다

## 호환성 정책

외부 플러그인의 경우, 호환성 작업은 다음 순서를 따릅니다:

1. 새 계약 추가
2. 호환성 어댑터를 통해 기존 동작 유지
3. 기존 경로와 대체를 명시한 진단 또는 경고 방출
4. 테스트에서 양쪽 경로 커버
5. deprecation 및 마이그레이션 경로 문서화
6. 공지된 마이그레이션 기간이 끝난 후에만 제거, 일반적으로 메이저 릴리스에서

manifest 필드가 여전히 허용된다면, 플러그인 작성자는 문서와 진단이 달리 말할 때까지 계속 사용할 수 있습니다. 새 코드는 문서화된 대체를 선호해야 하지만, 기존 플러그인은 일반적인 마이너 릴리스 동안에 동작이 중단되어서는 안 됩니다.

## 마이그레이션 방법

<Steps>
  <Step title="approval-native 핸들러를 capability fact로 마이그레이션">
    승인(approval) 가능한 채널 플러그인은 이제 `approvalCapability.nativeRuntime`과 공유 runtime-context 레지스트리를 통해 네이티브 승인 동작을 노출합니다.

    주요 변경 사항:

    - `approvalCapability.handler.loadRuntime(...)`을 `approvalCapability.nativeRuntime`으로 교체
    - approval 전용 auth/delivery를 레거시 `plugin.auth` / `plugin.approvals` 와이어링에서 떼어내 `approvalCapability`로 이동
    - `ChannelPlugin.approvals`는 공개 채널 플러그인 계약에서 제거되었습니다; delivery/native/render 필드를 `approvalCapability`로 이동하십시오
    - `plugin.auth`는 채널 로그인/로그아웃 플로우 전용으로만 남습니다; 거기의 approval auth hook은 더 이상 코어가 읽지 않습니다
    - 클라이언트, 토큰, Bolt 앱과 같은 채널 소유 런타임 객체는 `openclaw/plugin-sdk/channel-runtime-context`를 통해 등록하십시오
    - 네이티브 approval 핸들러에서 플러그인 소유 재라우팅 알림을 보내지 마십시오; 이제 실제 delivery 결과에서 재라우팅 알림을 코어가 소유합니다
    - `createChannelManager(...)`에 `channelRuntime`을 전달할 때, 실제 `createPluginRuntime().channel` 표면을 제공하십시오. 부분적인 스텁(stub)은 거부됩니다.

    현재 approval capability 레이아웃은 `/plugins/sdk-channel-plugins`를 참조하십시오.

  </Step>

  <Step title="Windows 래퍼 fallback 동작 감사">
    플러그인이 `openclaw/plugin-sdk/windows-spawn`을 사용한다면, 해결되지 않은 Windows `.cmd`/`.bat` 래퍼는 이제 `allowShellFallback: true`를 명시적으로 전달하지 않는 한 닫힌 상태로 실패(fail closed)합니다.

    ```typescript
    // Before
    const program = applyWindowsSpawnProgramPolicy({ candidate });

    // After
    const program = applyWindowsSpawnProgramPolicy({
      candidate,
      // Only set this for trusted compatibility callers that intentionally
      // accept shell-mediated fallback.
      allowShellFallback: true,
    });
    ```

    호출자가 의도적으로 shell fallback에 의존하지 않는다면, `allowShellFallback`을 설정하지 말고 던져진 에러를 대신 처리하십시오.

  </Step>

  <Step title="deprecated 임포트 찾기">
    두 deprecated 표면 중 하나에서의 임포트를 플러그인에서 검색하십시오:

    ```bash
    grep -r "plugin-sdk/compat" my-plugin/
    grep -r "openclaw/extension-api" my-plugin/
    ```

  </Step>

  <Step title="집중된 임포트로 교체">
    기존 표면의 각 내보내기는 특정 최신 임포트 경로에 매핑됩니다:

    ```typescript
    // Before (deprecated backwards-compatibility layer)
    import {
      createChannelReplyPipeline,
      createPluginRuntimeStore,
      resolveControlCommandGate,
    } from "openclaw/plugin-sdk/compat";

    // After (modern focused imports)
    import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
    import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
    import { resolveControlCommandGate } from "openclaw/plugin-sdk/command-auth";
    ```

    호스트 측 헬퍼의 경우, 직접 임포트하는 대신 주입된 플러그인 runtime을 사용하십시오:

    ```typescript
    // Before (deprecated extension-api bridge)
    import { runEmbeddedPiAgent } from "openclaw/extension-api";
    const result = await runEmbeddedPiAgent({ sessionId, prompt });

    // After (injected runtime)
    const result = await api.runtime.agent.runEmbeddedPiAgent({ sessionId, prompt });
    ```

    동일한 패턴이 다른 레거시 브리지 헬퍼에도 적용됩니다:

    | 기존 임포트 | 최신 대응 항목 |
    | --- | --- |
    | `resolveAgentDir` | `api.runtime.agent.resolveAgentDir` |
    | `resolveAgentWorkspaceDir` | `api.runtime.agent.resolveAgentWorkspaceDir` |
    | `resolveAgentIdentity` | `api.runtime.agent.resolveAgentIdentity` |
    | `resolveThinkingDefault` | `api.runtime.agent.resolveThinkingDefault` |
    | `resolveAgentTimeoutMs` | `api.runtime.agent.resolveAgentTimeoutMs` |
    | `ensureAgentWorkspace` | `api.runtime.agent.ensureAgentWorkspace` |
    | session store 헬퍼 | `api.runtime.agent.session.*` |

  </Step>

  <Step title="빌드 및 테스트">
    ```bash
    pnpm build
    pnpm test -- my-plugin/
    ```
  </Step>
</Steps>

## 임포트 경로 레퍼런스

<Accordion title="공통 임포트 경로 표">
  | 임포트 경로 | 목적 | 주요 내보내기 |
  | --- | --- | --- |
  | `plugin-sdk/plugin-entry` | 표준 플러그인 엔트리 헬퍼 | `definePluginEntry` |
  | `plugin-sdk/core` | 채널 엔트리 정의/빌더를 위한 레거시 우산 재내보내기 | `defineChannelPluginEntry`, `createChatChannelPlugin` |
  | `plugin-sdk/config-schema` | 루트 구성 스키마 내보내기 | `OpenClawSchema` |
  | `plugin-sdk/provider-entry` | 단일 provider 엔트리 헬퍼 | `defineSingleProviderPluginEntry` |
  | `plugin-sdk/channel-core` | 집중된 채널 엔트리 정의 및 빌더 | `defineChannelPluginEntry`, `defineSetupPluginEntry`, `createChatChannelPlugin`, `createChannelPluginBase` |
  | `plugin-sdk/setup` | 공유 setup 마법사 헬퍼 | Allowlist 프롬프트, setup 상태 빌더 |
  | `plugin-sdk/setup-runtime` | Setup 타임 런타임 헬퍼 | 임포트 안전 setup 패치 어댑터, lookup-note 헬퍼, `promptResolvedAllowFrom`, `splitSetupEntries`, 위임 setup 프록시 |
  | `plugin-sdk/setup-adapter-runtime` | Setup 어댑터 헬퍼 | `createEnvPatchedAccountSetupAdapter` |
  | `plugin-sdk/setup-tools` | Setup 툴링 헬퍼 | `formatCliCommand`, `detectBinary`, `extractArchive`, `resolveBrewExecutable`, `formatDocsLink`, `CONFIG_DIR` |
  | `plugin-sdk/account-core` | 다중 계정 헬퍼 | Account list/config/action-gate 헬퍼 |
  | `plugin-sdk/account-id` | Account-id 헬퍼 | `DEFAULT_ACCOUNT_ID`, account-id 정규화 |
  | `plugin-sdk/account-resolution` | Account 조회 헬퍼 | Account 조회 + 기본값 폴백 헬퍼 |
  | `plugin-sdk/account-helpers` | 좁은 account 헬퍼 | Account list/account-action 헬퍼 |
  | `plugin-sdk/channel-setup` | Setup 마법사 어댑터 | `createOptionalChannelSetupSurface`, `createOptionalChannelSetupAdapter`, `createOptionalChannelSetupWizard`, `DEFAULT_ACCOUNT_ID`, `createTopLevelChannelDmPolicy`, `setSetupChannelEnabled`, `splitSetupEntries` |
  | `plugin-sdk/channel-pairing` | DM 페어링 프리미티브 | `createChannelPairingController` |
  | `plugin-sdk/channel-reply-pipeline` | 답글 prefix + typing 와이어링 | `createChannelReplyPipeline` |
  | `plugin-sdk/channel-config-helpers` | 구성 어댑터 팩토리 | `createHybridChannelConfigAdapter` |
  | `plugin-sdk/channel-config-schema` | 구성 스키마 빌더 | 채널 구성 스키마 타입 |
  | `plugin-sdk/telegram-command-config` | Telegram 명령 구성 헬퍼 | 명령명 정규화, 설명 트리밍, 중복/충돌 검증 |
  | `plugin-sdk/channel-policy` | Group/DM 정책 해결 | `resolveChannelGroupRequireMention` |
  | `plugin-sdk/channel-lifecycle` | 계정 상태 및 draft stream 수명 주기 헬퍼 | `createAccountStatusSink`, draft preview 완료 헬퍼 |
  | `plugin-sdk/inbound-envelope` | Inbound envelope 헬퍼 | 공유 라우트 + envelope 빌더 헬퍼 |
  | `plugin-sdk/inbound-reply-dispatch` | Inbound reply 헬퍼 | 공유 record-and-dispatch 헬퍼 |
  | `plugin-sdk/messaging-targets` | Messaging target 파싱 | Target 파싱/매칭 헬퍼 |
  | `plugin-sdk/outbound-media` | Outbound 미디어 헬퍼 | 공유 outbound 미디어 로딩 |
  | `plugin-sdk/outbound-runtime` | Outbound runtime 헬퍼 | Outbound 아이덴티티/send 위임 및 payload 계획 헬퍼 |
  | `plugin-sdk/thread-bindings-runtime` | Thread-binding 헬퍼 | Thread-binding 수명 주기 및 어댑터 헬퍼 |
  | `plugin-sdk/agent-media-payload` | 레거시 미디어 payload 헬퍼 | 레거시 필드 레이아웃을 위한 agent 미디어 payload 빌더 |
  | `plugin-sdk/channel-runtime` | Deprecated 호환성 shim | 레거시 채널 runtime 유틸리티 전용 |
  | `plugin-sdk/channel-send-result` | Send 결과 타입 | Reply 결과 타입 |
  | `plugin-sdk/runtime-store` | 영구 플러그인 스토리지 | `createPluginRuntimeStore` |
  | `plugin-sdk/runtime` | 넓은 runtime 헬퍼 | Runtime/logging/backup/plugin-install 헬퍼 |
  | `plugin-sdk/runtime-env` | 좁은 runtime env 헬퍼 | Logger/runtime env, timeout, retry, backoff 헬퍼 |
  | `plugin-sdk/plugin-runtime` | 공유 플러그인 runtime 헬퍼 | Plugin commands/hooks/http/interactive 헬퍼 |
  | `plugin-sdk/hook-runtime` | Hook 파이프라인 헬퍼 | 공유 webhook/internal hook 파이프라인 헬퍼 |
  | `plugin-sdk/lazy-runtime` | Lazy runtime 헬퍼 | `createLazyRuntimeModule`, `createLazyRuntimeMethod`, `createLazyRuntimeMethodBinder`, `createLazyRuntimeNamedExport`, `createLazyRuntimeSurface` |
  | `plugin-sdk/process-runtime` | 프로세스 헬퍼 | 공유 exec 헬퍼 |
  | `plugin-sdk/cli-runtime` | CLI runtime 헬퍼 | 명령 포맷팅, wait, 버전 헬퍼 |
  | `plugin-sdk/gateway-runtime` | Gateway 헬퍼 | Gateway 클라이언트 및 채널 상태 패치 헬퍼 |
  | `plugin-sdk/config-runtime` | 구성 헬퍼 | 구성 load/write 헬퍼 |
  | `plugin-sdk/telegram-command-config` | Telegram 명령 헬퍼 | 번들된 Telegram 계약 표면을 사용할 수 없을 때 폴백 안정적 Telegram 명령 검증 헬퍼 |
  | `plugin-sdk/approval-runtime` | Approval 프롬프트 헬퍼 | Exec/plugin approval payload, approval capability/profile 헬퍼, 네이티브 approval 라우팅/런타임 헬퍼 |
  | `plugin-sdk/approval-auth-runtime` | Approval auth 헬퍼 | 승인자 해결, 동일 채팅 액션 auth |
  | `plugin-sdk/approval-client-runtime` | Approval 클라이언트 헬퍼 | 네이티브 exec approval 프로필/필터 헬퍼 |
  | `plugin-sdk/approval-delivery-runtime` | Approval delivery 헬퍼 | 네이티브 approval capability/delivery 어댑터 |
  | `plugin-sdk/approval-gateway-runtime` | Approval gateway 헬퍼 | 공유 approval gateway-resolution 헬퍼 |
  | `plugin-sdk/approval-handler-adapter-runtime` | Approval 어댑터 헬퍼 | 핫 채널 엔트리포인트를 위한 경량 네이티브 approval 어댑터 로딩 헬퍼 |
  | `plugin-sdk/approval-handler-runtime` | Approval 핸들러 헬퍼 | 더 넓은 approval 핸들러 runtime 헬퍼; 충분할 때 더 좁은 어댑터/gateway 이음새를 선호하십시오 |
  | `plugin-sdk/approval-native-runtime` | Approval target 헬퍼 | 네이티브 approval target/account binding 헬퍼 |
  | `plugin-sdk/approval-reply-runtime` | Approval reply 헬퍼 | Exec/plugin approval reply payload 헬퍼 |
  | `plugin-sdk/channel-runtime-context` | 채널 runtime-context 헬퍼 | 범용 채널 runtime-context register/get/watch 헬퍼 |
  | `plugin-sdk/security-runtime` | 보안 헬퍼 | 공유 trust, DM 게이팅, 외부 콘텐츠, 시크릿 수집 헬퍼 |
  | `plugin-sdk/ssrf-policy` | SSRF 정책 헬퍼 | 호스트 allowlist 및 사설 네트워크 정책 헬퍼 |
  | `plugin-sdk/ssrf-runtime` | SSRF runtime 헬퍼 | 고정 디스패처, 가드된 fetch, SSRF 정책 헬퍼 |
  | `plugin-sdk/collection-runtime` | 제한된 캐시 헬퍼 | `pruneMapToMaxSize` |
  | `plugin-sdk/diagnostic-runtime` | 진단 게이팅 헬퍼 | `isDiagnosticFlagEnabled`, `isDiagnosticsEnabled` |
  | `plugin-sdk/error-runtime` | 에러 포맷팅 헬퍼 | `formatUncaughtError`, `isApprovalNotFoundError`, 에러 그래프 헬퍼 |
  | `plugin-sdk/fetch-runtime` | 래핑된 fetch/프록시 헬퍼 | `resolveFetch`, 프록시 헬퍼 |
  | `plugin-sdk/host-runtime` | 호스트 정규화 헬퍼 | `normalizeHostname`, `normalizeScpRemoteHost` |
  | `plugin-sdk/retry-runtime` | Retry 헬퍼 | `RetryConfig`, `retryAsync`, policy runner |
  | `plugin-sdk/allow-from` | Allowlist 포맷팅 | `formatAllowFromLowercase` |
  | `plugin-sdk/allowlist-resolution` | Allowlist 입력 매핑 | `mapAllowlistResolutionInputs` |
  | `plugin-sdk/command-auth` | 명령 게이팅 및 명령 표면 헬퍼 | `resolveControlCommandGate`, 발신자 인증 헬퍼, 명령 레지스트리 헬퍼 |
  | `plugin-sdk/command-status` | 명령 상태/도움말 렌더러 | `buildCommandsMessage`, `buildCommandsMessagePaginated`, `buildHelpMessage` |
  | `plugin-sdk/secret-input` | 시크릿 입력 파싱 | 시크릿 입력 헬퍼 |
  | `plugin-sdk/webhook-ingress` | Webhook 요청 헬퍼 | Webhook target 유틸리티 |
  | `plugin-sdk/webhook-request-guards` | Webhook body 가드 헬퍼 | 요청 body read/limit 헬퍼 |
  | `plugin-sdk/reply-runtime` | 공유 reply runtime | Inbound dispatch, heartbeat, reply planner, chunking |
  | `plugin-sdk/reply-dispatch-runtime` | 좁은 reply dispatch 헬퍼 | Finalize + provider dispatch 헬퍼 |
  | `plugin-sdk/reply-history` | Reply-history 헬퍼 | `buildHistoryContext`, `buildPendingHistoryContextFromMap`, `recordPendingHistoryEntry`, `clearHistoryEntriesIfEnabled` |
  | `plugin-sdk/reply-reference` | Reply reference 계획 | `createReplyReferencePlanner` |
  | `plugin-sdk/reply-chunking` | Reply chunk 헬퍼 | Text/markdown chunking 헬퍼 |
  | `plugin-sdk/session-store-runtime` | 세션 스토어 헬퍼 | Store path + updated-at 헬퍼 |
  | `plugin-sdk/state-paths` | 상태 경로 헬퍼 | 상태 및 OAuth 디렉토리 헬퍼 |
  | `plugin-sdk/routing` | 라우팅/세션 키 헬퍼 | `resolveAgentRoute`, `buildAgentSessionKey`, `resolveDefaultAgentBoundAccountId`, 세션 키 정규화 헬퍼 |
  | `plugin-sdk/status-helpers` | 채널 상태 헬퍼 | 채널/계정 상태 요약 빌더, 런타임 상태 기본값, 이슈 메타데이터 헬퍼 |
  | `plugin-sdk/target-resolver-runtime` | Target resolver 헬퍼 | 공유 target resolver 헬퍼 |
  | `plugin-sdk/string-normalization-runtime` | 문자열 정규화 헬퍼 | 슬러그/문자열 정규화 헬퍼 |
  | `plugin-sdk/request-url` | 요청 URL 헬퍼 | 요청 형태의 입력에서 문자열 URL 추출 |
  | `plugin-sdk/run-command` | Timed 명령 헬퍼 | 정규화된 stdout/stderr이 포함된 timed 명령 러너 |
  | `plugin-sdk/param-readers` | Param reader | 공통 tool/CLI param reader |
  | `plugin-sdk/tool-payload` | Tool payload 추출 | Tool 결과 객체에서 정규화된 payload 추출 |
  | `plugin-sdk/tool-send` | Tool send 추출 | Tool 인수에서 표준 send target 필드 추출 |
  | `plugin-sdk/temp-path` | 임시 경로 헬퍼 | 공유 임시 다운로드 경로 헬퍼 |
  | `plugin-sdk/logging-core` | 로깅 헬퍼 | 서브시스템 logger 및 redaction 헬퍼 |
  | `plugin-sdk/markdown-table-runtime` | Markdown-table 헬퍼 | Markdown 테이블 mode 헬퍼 |
  | `plugin-sdk/reply-payload` | 메시지 reply 타입 | Reply payload 타입 |
  | `plugin-sdk/provider-setup` | 큐레이션된 local/self-hosted provider setup 헬퍼 | Self-hosted provider 발견/구성 헬퍼 |
  | `plugin-sdk/self-hosted-provider-setup` | 집중된 OpenAI 호환 self-hosted provider setup 헬퍼 | 동일한 self-hosted provider 발견/구성 헬퍼 |
  | `plugin-sdk/provider-auth-runtime` | Provider runtime auth 헬퍼 | Runtime API-key 해결 헬퍼 |
  | `plugin-sdk/provider-auth-api-key` | Provider API-key setup 헬퍼 | API-key 온보딩/프로필 쓰기 헬퍼 |
  | `plugin-sdk/provider-auth-result` | Provider auth-result 헬퍼 | 표준 OAuth auth-result 빌더 |
  | `plugin-sdk/provider-auth-login` | Provider 인터랙티브 로그인 헬퍼 | 공유 인터랙티브 로그인 헬퍼 |
  | `plugin-sdk/provider-selection-runtime` | Provider 선택 헬퍼 | 구성된 또는 자동 provider 선택과 raw provider 구성 병합 |
  | `plugin-sdk/provider-env-vars` | Provider env-var 헬퍼 | Provider auth 환경 변수 조회 헬퍼 |
  | `plugin-sdk/provider-model-shared` | 공유 provider 모델/replay 헬퍼 | `ProviderReplayFamily`, `buildProviderReplayFamilyHooks`, `normalizeModelCompat`, 공유 replay-policy 빌더, provider-endpoint 헬퍼, model-id 정규화 헬퍼 |
  | `plugin-sdk/provider-catalog-shared` | 공유 provider 카탈로그 헬퍼 | `findCatalogTemplate`, `buildSingleProviderApiKeyCatalog`, `supportsNativeStreamingUsageCompat`, `applyProviderNativeStreamingUsageCompat` |
  | `plugin-sdk/provider-onboard` | Provider 온보딩 패치 | 온보딩 구성 헬퍼 |
  | `plugin-sdk/provider-http` | Provider HTTP 헬퍼 | 범용 provider HTTP/endpoint capability 헬퍼, 오디오 transcription multipart form 헬퍼 포함 |
  | `plugin-sdk/provider-web-fetch` | Provider web-fetch 헬퍼 | Web-fetch provider 등록/캐시 헬퍼 |
  | `plugin-sdk/provider-web-search-config-contract` | Provider web-search 구성 헬퍼 | 플러그인 활성화 와이어링이 필요 없는 provider를 위한 좁은 web-search 구성/자격 증명 헬퍼 |
  | `plugin-sdk/provider-web-search-contract` | Provider web-search 계약 헬퍼 | `createWebSearchProviderContractFields`, `enablePluginInConfig`, `resolveProviderWebSearchPluginConfig`, 스코프된 자격 증명 setter/getter와 같은 좁은 web-search 구성/자격 증명 계약 헬퍼 |
  | `plugin-sdk/provider-web-search` | Provider web-search 헬퍼 | Web-search provider 등록/캐시/runtime 헬퍼 |
  | `plugin-sdk/provider-tools` | Provider tool/schema 호환 헬퍼 | `ProviderToolCompatFamily`, `buildProviderToolCompatFamilyHooks`, Gemini schema 정리 + 진단, `resolveXaiModelCompatPatch` / `applyXaiModelCompat`와 같은 xAI 호환 헬퍼 |
  | `plugin-sdk/provider-usage` | Provider usage 헬퍼 | `fetchClaudeUsage`, `fetchGeminiUsage`, `fetchGithubCopilotUsage` 및 기타 provider usage 헬퍼 |
  | `plugin-sdk/provider-stream` | Provider stream wrapper 헬퍼 | `ProviderStreamFamily`, `buildProviderStreamFamilyHooks`, `composeProviderStreamWrappers`, stream wrapper 타입, 공유 Anthropic/Bedrock/Google/Kilocode/Moonshot/OpenAI/OpenRouter/Z.A.I/MiniMax/Copilot wrapper 헬퍼 |
  | `plugin-sdk/provider-transport-runtime` | Provider transport 헬퍼 | 가드된 fetch, transport 메시지 변환, 쓰기 가능한 transport 이벤트 스트림과 같은 네이티브 provider transport 헬퍼 |
  | `plugin-sdk/keyed-async-queue` | 순서 있는 async queue | `KeyedAsyncQueue` |
  | `plugin-sdk/media-runtime` | 공유 미디어 헬퍼 | 미디어 fetch/transform/store 헬퍼와 미디어 payload 빌더 |
  | `plugin-sdk/media-generation-runtime` | 공유 미디어 생성 헬퍼 | 이미지/비디오/음악 생성을 위한 공유 failover 헬퍼, 후보 선택, 누락 모델 메시징 |
  | `plugin-sdk/media-understanding` | 미디어 이해 헬퍼 | 미디어 이해 provider 타입과 provider 대면 이미지/오디오 헬퍼 내보내기 |
  | `plugin-sdk/text-runtime` | 공유 텍스트 헬퍼 | Assistant-visible-text stripping, markdown render/chunking/table 헬퍼, redaction 헬퍼, directive-tag 헬퍼, safe-text 유틸리티 및 관련 텍스트/로깅 헬퍼 |
  | `plugin-sdk/text-chunking` | 텍스트 chunking 헬퍼 | Outbound 텍스트 chunking 헬퍼 |
  | `plugin-sdk/speech` | Speech 헬퍼 | Speech provider 타입과 provider 대면 directive, 레지스트리, 검증 헬퍼 |
  | `plugin-sdk/speech-core` | 공유 speech 코어 | Speech provider 타입, 레지스트리, directive, 정규화 |
  | `plugin-sdk/realtime-transcription` | 실시간 transcription 헬퍼 | Provider 타입, 레지스트리 헬퍼, 공유 WebSocket 세션 헬퍼 |
  | `plugin-sdk/realtime-voice` | 실시간 voice 헬퍼 | Provider 타입, 레지스트리/resolution 헬퍼, bridge 세션 헬퍼 |
  | `plugin-sdk/image-generation-core` | 공유 image-generation 코어 | Image-generation 타입, failover, auth, 레지스트리 헬퍼 |
  | `plugin-sdk/music-generation` | Music-generation 헬퍼 | Music-generation provider/request/result 타입 |
  | `plugin-sdk/music-generation-core` | 공유 music-generation 코어 | Music-generation 타입, failover 헬퍼, provider 조회, model-ref 파싱 |
  | `plugin-sdk/video-generation` | Video-generation 헬퍼 | Video-generation provider/request/result 타입 |
  | `plugin-sdk/video-generation-core` | 공유 video-generation 코어 | Video-generation 타입, failover 헬퍼, provider 조회, model-ref 파싱 |
  | `plugin-sdk/interactive-runtime` | 인터랙티브 reply 헬퍼 | 인터랙티브 reply payload 정규화/reduction |
  | `plugin-sdk/channel-config-primitives` | 채널 구성 프리미티브 | 좁은 채널 구성 스키마 프리미티브 |
  | `plugin-sdk/channel-config-writes` | 채널 구성 쓰기 헬퍼 | 채널 구성 쓰기 인가 헬퍼 |
  | `plugin-sdk/channel-plugin-common` | 공유 채널 프리앰블 | 공유 채널 플러그인 프리앰블 내보내기 |
  | `plugin-sdk/channel-status` | 채널 상태 헬퍼 | 공유 채널 상태 스냅샷/요약 헬퍼 |
  | `plugin-sdk/allowlist-config-edit` | Allowlist 구성 헬퍼 | Allowlist 구성 편집/읽기 헬퍼 |
  | `plugin-sdk/group-access` | Group 접근 헬퍼 | 공유 group-access 결정 헬퍼 |
  | `plugin-sdk/direct-dm` | Direct-DM 헬퍼 | 공유 direct-DM auth/guard 헬퍼 |
  | `plugin-sdk/extension-shared` | 공유 extension 헬퍼 | Passive-channel/status 및 ambient proxy 헬퍼 프리미티브 |
  | `plugin-sdk/webhook-targets` | Webhook target 헬퍼 | Webhook target 레지스트리와 route-install 헬퍼 |
  | `plugin-sdk/webhook-path` | Webhook 경로 헬퍼 | Webhook 경로 정규화 헬퍼 |
  | `plugin-sdk/web-media` | 공유 웹 미디어 헬퍼 | 원격/로컬 미디어 로딩 헬퍼 |
  | `plugin-sdk/zod` | Zod 재내보내기 | 플러그인 SDK 소비자를 위한 재내보낸 `zod` |
  | `plugin-sdk/memory-core` | 번들된 memory-core 헬퍼 | 메모리 manager/config/file/CLI 헬퍼 표면 |
  | `plugin-sdk/memory-core-engine-runtime` | 메모리 engine runtime 파사드 | 메모리 index/search runtime 파사드 |
  | `plugin-sdk/memory-core-host-engine-foundation` | 메모리 호스트 foundation engine | 메모리 호스트 foundation engine 내보내기 |
  | `plugin-sdk/memory-core-host-engine-embeddings` | 메모리 호스트 embedding engine | 메모리 embedding 계약, 레지스트리 접근, local provider, 범용 batch/remote 헬퍼; 구체적인 원격 provider는 소유 플러그인에 존재합니다 |
  | `plugin-sdk/memory-core-host-engine-qmd` | 메모리 호스트 QMD engine | 메모리 호스트 QMD engine 내보내기 |
  | `plugin-sdk/memory-core-host-engine-storage` | 메모리 호스트 storage engine | 메모리 호스트 storage engine 내보내기 |
  | `plugin-sdk/memory-core-host-multimodal` | 메모리 호스트 multimodal 헬퍼 | 메모리 호스트 multimodal 헬퍼 |
  | `plugin-sdk/memory-core-host-query` | 메모리 호스트 query 헬퍼 | 메모리 호스트 query 헬퍼 |
  | `plugin-sdk/memory-core-host-secret` | 메모리 호스트 secret 헬퍼 | 메모리 호스트 secret 헬퍼 |
  | `plugin-sdk/memory-core-host-events` | 메모리 호스트 이벤트 저널 헬퍼 | 메모리 호스트 이벤트 저널 헬퍼 |
  | `plugin-sdk/memory-core-host-status` | 메모리 호스트 상태 헬퍼 | 메모리 호스트 상태 헬퍼 |
  | `plugin-sdk/memory-core-host-runtime-cli` | 메모리 호스트 CLI runtime | 메모리 호스트 CLI runtime 헬퍼 |
  | `plugin-sdk/memory-core-host-runtime-core` | 메모리 호스트 core runtime | 메모리 호스트 core runtime 헬퍼 |
  | `plugin-sdk/memory-core-host-runtime-files` | 메모리 호스트 file/runtime 헬퍼 | 메모리 호스트 file/runtime 헬퍼 |
  | `plugin-sdk/memory-host-core` | 메모리 호스트 core runtime 별칭 | 메모리 호스트 core runtime 헬퍼의 벤더 중립 별칭 |
  | `plugin-sdk/memory-host-events` | 메모리 호스트 이벤트 저널 별칭 | 메모리 호스트 이벤트 저널 헬퍼의 벤더 중립 별칭 |
  | `plugin-sdk/memory-host-files` | 메모리 호스트 file/runtime 별칭 | 메모리 호스트 file/runtime 헬퍼의 벤더 중립 별칭 |
  | `plugin-sdk/memory-host-markdown` | 관리 markdown 헬퍼 | 메모리 인접 플러그인을 위한 공유 관리 markdown 헬퍼 |
  | `plugin-sdk/memory-host-search` | Active memory 검색 파사드 | Lazy active-memory 검색 manager runtime 파사드 |
  | `plugin-sdk/memory-host-status` | 메모리 호스트 상태 별칭 | 메모리 호스트 상태 헬퍼의 벤더 중립 별칭 |
  | `plugin-sdk/memory-lancedb` | 번들된 memory-lancedb 헬퍼 | Memory-lancedb 헬퍼 표면 |
  | `plugin-sdk/testing` | 테스트 유틸리티 | 테스트 헬퍼와 mock |
</Accordion>

이 표는 전체 SDK 표면이 아니라 의도적으로 공통 마이그레이션 서브셋입니다. 200개 이상의 엔트리포인트 전체 목록은 `scripts/lib/plugin-sdk-entrypoints.json`에 있습니다.

해당 목록에는 여전히 `plugin-sdk/feishu`, `plugin-sdk/feishu-setup`, `plugin-sdk/zalo`, `plugin-sdk/zalo-setup`, `plugin-sdk/matrix*`와 같은 일부 번들된 플러그인 헬퍼 이음새가 포함됩니다. 이들은 번들된 플러그인 유지보수와 호환성을 위해 내보내진 상태로 남아있지만, 공통 마이그레이션 표에서 의도적으로 제외되었으며 새 플러그인 코드의 권장 대상이 아닙니다.

동일한 규칙이 다른 번들 헬퍼 패밀리에도 적용됩니다:

- browser 지원 헬퍼: `plugin-sdk/browser-cdp`, `plugin-sdk/browser-config-runtime`, `plugin-sdk/browser-config-support`, `plugin-sdk/browser-control-auth`, `plugin-sdk/browser-node-runtime`, `plugin-sdk/browser-profiles`, `plugin-sdk/browser-security-runtime`, `plugin-sdk/browser-setup-tools`, `plugin-sdk/browser-support`
- Matrix: `plugin-sdk/matrix*`
- LINE: `plugin-sdk/line*`
- IRC: `plugin-sdk/irc*`
- `plugin-sdk/googlechat`, `plugin-sdk/zalouser`, `plugin-sdk/bluebubbles*`, `plugin-sdk/mattermost*`, `plugin-sdk/msteams`, `plugin-sdk/nextcloud-talk`, `plugin-sdk/nostr`, `plugin-sdk/tlon`, `plugin-sdk/twitch`, `plugin-sdk/github-copilot-login`, `plugin-sdk/github-copilot-token`, `plugin-sdk/diagnostics-otel`, `plugin-sdk/diffs`, `plugin-sdk/llm-task`, `plugin-sdk/thread-ownership`, `plugin-sdk/voice-call` 같은 번들 헬퍼/플러그인 표면

`plugin-sdk/github-copilot-token`은 현재 좁은 토큰 헬퍼 표면 `DEFAULT_COPILOT_API_BASE_URL`, `deriveCopilotApiBaseUrlFromToken`, `resolveCopilotApiToken`을 노출합니다.

작업에 맞는 가장 좁은 임포트를 사용하십시오. 내보내기를 찾을 수 없다면, `src/plugin-sdk/`에서 소스를 확인하거나 Discord에 문의하십시오.

## 제거 타임라인

| 시점                   | 발생 내용                                                           |
| ---------------------- | ------------------------------------------------------------------- |
| **현재**               | Deprecated 표면에서 런타임 경고 방출                                |
| **다음 메이저 릴리스** | Deprecated 표면이 제거됩니다; 여전히 사용하는 플러그인은 실패합니다 |

모든 코어 플러그인은 이미 마이그레이션되었습니다. 외부 플러그인은 다음 메이저 릴리스 전에 마이그레이션해야 합니다.

## 경고 일시적 억제

마이그레이션 작업 중에는 다음 환경 변수를 설정하십시오:

```bash
OPENCLAW_SUPPRESS_PLUGIN_SDK_COMPAT_WARNING=1 openclaw gateway run
OPENCLAW_SUPPRESS_EXTENSION_API_WARNING=1 openclaw gateway run
```

이는 영구적인 해결책이 아닌 임시 탈출구입니다.

## 관련 문서

- [시작하기](/plugins/building-plugins) — 첫 번째 플러그인 만들기
- [SDK 개요](/plugins/sdk-overview) — 전체 서브패스 임포트 레퍼런스
- [채널 플러그인](/plugins/sdk-channel-plugins) — 채널 플러그인 구축
- [프로바이더 플러그인](/plugins/sdk-provider-plugins) — 프로바이더 플러그인 구축
- [플러그인 내부 구조](/plugins/architecture) — 아키텍처 심층 분석
- [플러그인 매니페스트](/plugins/manifest) — 매니페스트 스키마 레퍼런스
