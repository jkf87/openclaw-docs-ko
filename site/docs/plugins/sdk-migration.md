---
title: "플러그인 SDK 마이그레이션"
description: "레거시 하위 호환성 레이어에서 모던 플러그인 SDK로 마이그레이션하기"
---

# 플러그인 SDK 마이그레이션

OpenClaw는 광범위한 하위 호환성 레이어에서 집중적이고 문서화된 임포트를 가진 모던 플러그인
아키텍처로 이동했습니다. 플러그인이 새 아키텍처 이전에 빌드되었다면 이 가이드를 통해 마이그레이션하십시오.

## 변경 사항

이전 플러그인 시스템은 플러그인이 단일 엔트리포인트에서 필요한 것을 임포트할 수 있도록 두 가지 넓은 표면을 제공했습니다:

- **`openclaw/plugin-sdk/compat`** — 수십 개의 헬퍼를 재내보내는 단일 임포트입니다. 새 플러그인 아키텍처가 구축되는 동안 구형 훅 기반 플러그인이 작동하도록 유지하기 위해 도입되었습니다.
- **`openclaw/extension-api`** — 플러그인에 임베디드 에이전트 러너와 같은 호스트 측 헬퍼에 직접 접근을 제공하는 브리지입니다.

두 표면 모두 이제 **더 이상 사용 권장하지 않습니다**. 런타임에서 여전히 작동하지만 새 플러그인은 이를 사용하면 안 되며, 기존 플러그인은 다음 주요 릴리스에서 제거되기 전에 마이그레이션해야 합니다.

::: warning
하위 호환성 레이어는 향후 주요 릴리스에서 제거됩니다.
  이러한 표면에서 여전히 임포트하는 플러그인은 제거 시 작동이 중단됩니다.
:::


## 변경된 이유

이전 접근 방식은 다음과 같은 문제를 야기했습니다:

- **느린 시작** — 하나의 헬퍼를 임포트하면 수십 개의 관련 없는 모듈이 로드됨
- **순환 의존성** — 광범위한 재내보내기로 임포트 사이클 생성이 쉬워짐
- **불명확한 API 표면** — 어떤 내보내기가 안정적인지 내부적인지 알 수 없음

모던 플러그인 SDK는 이를 해결합니다: 각 임포트 경로(`openclaw/plugin-sdk/&lt;subpath&gt;`)는 명확한 목적과 문서화된 계약을 가진 작고 독립적인 모듈입니다.

번들 채널을 위한 레거시 프로바이더 편의 이음새도 제거되었습니다. `openclaw/plugin-sdk/slack`, `openclaw/plugin-sdk/discord`, `openclaw/plugin-sdk/signal`, `openclaw/plugin-sdk/whatsapp`, 채널 브랜드 헬퍼 이음새, `openclaw/plugin-sdk/telegram-core`와 같은 임포트는 비공개 모노레포 단축키였으며 안정적인 플러그인 계약이 아닙니다. 대신 좁은 범용 SDK 서브패스를 사용하십시오. 번들 플러그인 워크스페이스 내에서는 프로바이더 소유 헬퍼를 해당 플러그인의 자체 `api.ts` 또는 `runtime-api.ts`에 보관하십시오.

현재 번들 프로바이더 예시:

- Anthropic은 Claude 특정 스트림 헬퍼를 자체 `api.ts` / `contract-api.ts` 이음새에 보관합니다
- OpenAI는 프로바이더 빌더, 기본 모델 헬퍼, 실시간 프로바이더 빌더를 자체 `api.ts`에 보관합니다
- OpenRouter는 프로바이더 빌더와 온보딩/구성 헬퍼를 자체 `api.ts`에 보관합니다

## 마이그레이션 방법

1. **승인 네이티브 핸들러를 역량 사실로 마이그레이션하기**

   승인 가능한 채널 플러그인은 이제 `approvalCapability.nativeRuntime`과 공유 런타임 컨텍스트 레지스트리를 통해 네이티브 승인 동작을 노출합니다.
   
       주요 변경 사항:
   
       - `approvalCapability.handler.loadRuntime(...)`을 `approvalCapability.nativeRuntime`으로 교체하십시오
       - 승인별 auth/delivery를 레거시 `plugin.auth` / `plugin.approvals` 와이어링에서 `approvalCapability`로 이동하십시오
       - `ChannelPlugin.approvals`가 공개 채널 플러그인 계약에서 제거되었습니다; delivery/native/render 필드를 `approvalCapability`로 이동하십시오
       - `plugin.auth`는 채널 로그인/로그아웃 흐름에만 남아 있습니다; 승인 auth 훅은 더 이상 코어에서 읽히지 않습니다
       - `openclaw/plugin-sdk/channel-runtime-context`를 통해 클라이언트, 토큰, Bolt 앱과 같은 채널 소유 런타임 객체를 등록하십시오
       - 플러그인 소유 재라우팅 알림을 네이티브 승인 핸들러에서 보내지 마십시오; 코어가 이제 실제 delivery 결과에서 다른 곳으로 라우팅 알림을 소유합니다
       - `createChannelManager(...)`에 `channelRuntime`을 전달할 때 실제 `createPluginRuntime().channel` 표면을 제공하십시오. 부분 스텁은 거부됩니다.
   
       현재 승인 역량 레이아웃은 [/plugins/sdk-channel-plugins](/plugins/sdk-channel-plugins)를 참조하십시오.


  2. **Windows 래퍼 폴백 동작 감사하기**

   플러그인이 `openclaw/plugin-sdk/windows-spawn`을 사용한다면, 해결되지 않은 Windows `.cmd`/`.bat` 래퍼는 이제 `allowShellFallback: true`를 명시적으로 전달하지 않으면 닫힌 상태로 실패합니다.
   
       ```typescript
       // 이전
       const program = applyWindowsSpawnProgramPolicy({ candidate });
   
       // 이후
       const program = applyWindowsSpawnProgramPolicy({
         candidate,
         // 셸 중개 폴백을 의도적으로 허용하는 신뢰할 수 있는 호환성 호출자에게만 설정하십시오.
         allowShellFallback: true,
       });
       ```
   
       호출자가 의도적으로 셸 폴백에 의존하지 않는다면 `allowShellFallback`을 설정하지 말고 대신 던져진 오류를 처리하십시오.


  3. **더 이상 사용 권장하지 않는 임포트 찾기**

   플러그인에서 두 더 이상 사용 권장하지 않는 표면의 임포트를 검색하십시오:
   
       ```bash
       grep -r "plugin-sdk/compat" my-plugin/
       grep -r "openclaw/extension-api" my-plugin/
       ```


  4. **집중 임포트로 교체하기**

   이전 표면의 각 내보내기는 특정 모던 임포트 경로에 매핑됩니다:
   
       ```typescript
       // 이전 (더 이상 사용 권장하지 않는 하위 호환성 레이어)
       import {
         createChannelReplyPipeline,
         createPluginRuntimeStore,
         resolveControlCommandGate,
       } from "openclaw/plugin-sdk/compat";
   
       // 이후 (모던 집중 임포트)
       import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
       import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
       import { resolveControlCommandGate } from "openclaw/plugin-sdk/command-auth";
       ```
   
       호스트 측 헬퍼의 경우 직접 임포트 대신 주입된 플러그인 런타임을 사용하십시오:
   
       ```typescript
       // 이전 (더 이상 사용 권장하지 않는 extension-api 브리지)
       import { runEmbeddedPiAgent } from "openclaw/extension-api";
       const result = await runEmbeddedPiAgent({ sessionId, prompt });
   
       // 이후 (주입된 런타임)
       const result = await api.runtime.agent.runEmbeddedPiAgent({ sessionId, prompt });
       ```
   
       동일한 패턴이 다른 레거시 브리지 헬퍼에도 적용됩니다:
   
       | 이전 임포트 | 모던 동등 항목 |
       | --- | --- |
       | `resolveAgentDir` | `api.runtime.agent.resolveAgentDir` |
       | `resolveAgentWorkspaceDir` | `api.runtime.agent.resolveAgentWorkspaceDir` |
       | `resolveAgentIdentity` | `api.runtime.agent.resolveAgentIdentity` |
       | `resolveThinkingDefault` | `api.runtime.agent.resolveThinkingDefault` |
       | `resolveAgentTimeoutMs` | `api.runtime.agent.resolveAgentTimeoutMs` |
       | `ensureAgentWorkspace` | `api.runtime.agent.ensureAgentWorkspace` |
       | 세션 스토어 헬퍼 | `api.runtime.agent.session.*` |


  5. **빌드 및 테스트**

   ```bash
       pnpm build
       pnpm test -- my-plugin/
       ```


## 임포트 경로 레퍼런스

::: details 공통 임포트 경로 표
| 임포트 경로 | 목적 | 주요 내보내기 |
  | --- | --- | --- |
  | `plugin-sdk/plugin-entry` | 표준 플러그인 엔트리 헬퍼 | `definePluginEntry` |
  | `plugin-sdk/core` | 채널 엔트리 정의/빌더를 위한 레거시 우산 재내보내기 | `defineChannelPluginEntry`, `createChatChannelPlugin` |
  | `plugin-sdk/config-schema` | 루트 구성 스키마 내보내기 | `OpenClawSchema` |
  | `plugin-sdk/provider-entry` | 단일 프로바이더 엔트리 헬퍼 | `defineSingleProviderPluginEntry` |
  | `plugin-sdk/channel-core` | 집중된 채널 엔트리 정의 및 빌더 | `defineChannelPluginEntry`, `defineSetupPluginEntry`, `createChatChannelPlugin`, `createChannelPluginBase` |
  | `plugin-sdk/setup` | 공유 setup 마법사 헬퍼 | 허용 목록 프롬프트, setup 상태 빌더 |
  | `plugin-sdk/setup-runtime` | Setup 시간 런타임 헬퍼 | 임포트 안전 setup 패치 어댑터, 조회 노트 헬퍼, `promptResolvedAllowFrom`, `splitSetupEntries`, 위임 setup 프록시 |
  | `plugin-sdk/setup-adapter-runtime` | Setup 어댑터 헬퍼 | `createEnvPatchedAccountSetupAdapter` |
  | `plugin-sdk/setup-tools` | Setup 도구 헬퍼 | `formatCliCommand`, `detectBinary`, `extractArchive`, `resolveBrewExecutable`, `formatDocsLink`, `CONFIG_DIR` |
  | `plugin-sdk/account-core` | 다중 계정 헬퍼 | 계정 목록/구성/액션 게이트 헬퍼 |
  | `plugin-sdk/account-id` | 계정 id 헬퍼 | `DEFAULT_ACCOUNT_ID`, 계정 id 정규화 |
  | `plugin-sdk/account-resolution` | 계정 조회 헬퍼 | 계정 조회 + 기본값 폴백 헬퍼 |
  | `plugin-sdk/account-helpers` | 좁은 계정 헬퍼 | 계정 목록/계정 액션 헬퍼 |
  | `plugin-sdk/channel-setup` | Setup 마법사 어댑터 | `createOptionalChannelSetupSurface`, `createOptionalChannelSetupAdapter`, `createOptionalChannelSetupWizard`, 및 `DEFAULT_ACCOUNT_ID`, `createTopLevelChannelDmPolicy`, `setSetupChannelEnabled`, `splitSetupEntries` |
  | `plugin-sdk/channel-pairing` | DM 페어링 프리미티브 | `createChannelPairingController` |
  | `plugin-sdk/channel-reply-pipeline` | 답글 접두사 + 타이핑 와이어링 | `createChannelReplyPipeline` |
  | `plugin-sdk/channel-config-helpers` | 구성 어댑터 팩토리 | `createHybridChannelConfigAdapter` |
  | `plugin-sdk/channel-config-schema` | 구성 스키마 빌더 | 채널 구성 스키마 타입 |
  | `plugin-sdk/telegram-command-config` | Telegram 명령 구성 헬퍼 | 명령 이름 정규화, 설명 자르기, 중복/충돌 검증 |
  | `plugin-sdk/channel-policy` | 그룹/DM 정책 해결 | `resolveChannelGroupRequireMention` |
  | `plugin-sdk/channel-lifecycle` | 계정 상태 추적 | `createAccountStatusSink` |
  | `plugin-sdk/inbound-envelope` | 인바운드 봉투 헬퍼 | 공유 라우트 + 봉투 빌더 헬퍼 |
  | `plugin-sdk/inbound-reply-dispatch` | 인바운드 답글 헬퍼 | 공유 기록-및-발송 헬퍼 |
  | `plugin-sdk/messaging-targets` | 메시징 타겟 파싱 | 타겟 파싱/매칭 헬퍼 |
  | `plugin-sdk/outbound-media` | 아웃바운드 미디어 헬퍼 | 공유 아웃바운드 미디어 로딩 |
  | `plugin-sdk/outbound-runtime` | 아웃바운드 런타임 헬퍼 | 아웃바운드 아이덴티티/전송 위임 헬퍼 |
  | `plugin-sdk/thread-bindings-runtime` | 스레드 바인딩 헬퍼 | 스레드 바인딩 수명 주기 및 어댑터 헬퍼 |
  | `plugin-sdk/agent-media-payload` | 레거시 미디어 페이로드 헬퍼 | 레거시 필드 레이아웃을 위한 에이전트 미디어 페이로드 빌더 |
  | `plugin-sdk/channel-runtime` | 더 이상 사용 권장하지 않는 호환성 심 | 레거시 채널 런타임 유틸리티만 |
  | `plugin-sdk/channel-send-result` | 전송 결과 타입 | 답글 결과 타입 |
  | `plugin-sdk/runtime-store` | 지속적 플러그인 스토리지 | `createPluginRuntimeStore` |
  | `plugin-sdk/runtime` | 광범위한 런타임 헬퍼 | 런타임/로깅/백업/플러그인 설치 헬퍼 |
  | `plugin-sdk/runtime-env` | 좁은 런타임 환경 헬퍼 | 로거/런타임 환경, 타임아웃, 재시도, 백오프 헬퍼 |
  | `plugin-sdk/plugin-runtime` | 공유 플러그인 런타임 헬퍼 | 플러그인 명령/훅/http/인터랙티브 헬퍼 |
  | `plugin-sdk/hook-runtime` | 훅 파이프라인 헬퍼 | 공유 웹훅/내부 훅 파이프라인 헬퍼 |
  | `plugin-sdk/lazy-runtime` | 지연 런타임 헬퍼 | `createLazyRuntimeModule`, `createLazyRuntimeMethod`, `createLazyRuntimeMethodBinder`, `createLazyRuntimeNamedExport`, `createLazyRuntimeSurface` |
  | `plugin-sdk/process-runtime` | 프로세스 헬퍼 | 공유 실행 헬퍼 |
  | `plugin-sdk/cli-runtime` | CLI 런타임 헬퍼 | 명령 포맷팅, 대기, 버전 헬퍼 |
  | `plugin-sdk/gateway-runtime` | 게이트웨이 헬퍼 | 게이트웨이 클라이언트 및 채널 상태 패치 헬퍼 |
  | `plugin-sdk/config-runtime` | 구성 헬퍼 | 구성 로드/쓰기 헬퍼 |
  | `plugin-sdk/approval-runtime` | 승인 프롬프트 헬퍼 | 실행/플러그인 승인 페이로드, 승인 역량/프로필 헬퍼, 네이티브 승인 라우팅/런타임 헬퍼 |
  | `plugin-sdk/approval-auth-runtime` | 승인 auth 헬퍼 | 승인자 해결, 동일 채팅 액션 auth |
  | `plugin-sdk/approval-client-runtime` | 승인 클라이언트 헬퍼 | 네이티브 실행 승인 프로필/필터 헬퍼 |
  | `plugin-sdk/approval-delivery-runtime` | 승인 delivery 헬퍼 | 네이티브 승인 역량/delivery 어댑터 |
  | `plugin-sdk/approval-gateway-runtime` | 승인 게이트웨이 헬퍼 | 공유 승인 게이트웨이 해결 헬퍼 |
  | `plugin-sdk/approval-handler-adapter-runtime` | 승인 어댑터 헬퍼 | 핫 채널 엔트리포인트를 위한 경량 네이티브 승인 어댑터 로딩 헬퍼 |
  | `plugin-sdk/approval-handler-runtime` | 승인 핸들러 헬퍼 | 더 넓은 승인 핸들러 런타임 헬퍼; 좁은 어댑터/게이트웨이 이음새로 충분할 때는 해당 이음새를 선호하십시오 |
  | `plugin-sdk/approval-native-runtime` | 승인 타겟 헬퍼 | 네이티브 승인 타겟/계정 바인딩 헬퍼 |
  | `plugin-sdk/approval-reply-runtime` | 승인 답글 헬퍼 | 실행/플러그인 승인 답글 페이로드 헬퍼 |
  | `plugin-sdk/channel-runtime-context` | 채널 런타임 컨텍스트 헬퍼 | 범용 채널 런타임 컨텍스트 등록/가져오기/감시 헬퍼 |
  | `plugin-sdk/security-runtime` | 보안 헬퍼 | 공유 신뢰, DM 게이팅, 외부 콘텐츠, 시크릿 수집 헬퍼 |
  | `plugin-sdk/ssrf-policy` | SSRF 정책 헬퍼 | 호스트 허용 목록 및 사설 네트워크 정책 헬퍼 |
  | `plugin-sdk/ssrf-runtime` | SSRF 런타임 헬퍼 | 고정 디스패처, 보호된 fetch, SSRF 정책 헬퍼 |
  | `plugin-sdk/collection-runtime` | 경계 캐시 헬퍼 | `pruneMapToMaxSize` |
  | `plugin-sdk/diagnostic-runtime` | 진단 게이팅 헬퍼 | `isDiagnosticFlagEnabled`, `isDiagnosticsEnabled` |
  | `plugin-sdk/error-runtime` | 오류 포맷팅 헬퍼 | `formatUncaughtError`, `isApprovalNotFoundError`, 오류 그래프 헬퍼 |
  | `plugin-sdk/fetch-runtime` | 래핑된 fetch/프록시 헬퍼 | `resolveFetch`, 프록시 헬퍼 |
  | `plugin-sdk/host-runtime` | 호스트 정규화 헬퍼 | `normalizeHostname`, `normalizeScpRemoteHost` |
  | `plugin-sdk/retry-runtime` | 재시도 헬퍼 | `RetryConfig`, `retryAsync`, 정책 러너 |
  | `plugin-sdk/allow-from` | 허용 목록 포맷팅 | `formatAllowFromLowercase` |
  | `plugin-sdk/allowlist-resolution` | 허용 목록 입력 매핑 | `mapAllowlistResolutionInputs` |
  | `plugin-sdk/command-auth` | 명령 게이팅 및 명령 표면 헬퍼 | `resolveControlCommandGate`, 발신자 인증 헬퍼, 명령 레지스트리 헬퍼 |
  | `plugin-sdk/secret-input` | 시크릿 입력 파싱 | 시크릿 입력 헬퍼 |
  | `plugin-sdk/webhook-ingress` | 웹훅 요청 헬퍼 | 웹훅 타겟 유틸리티 |
  | `plugin-sdk/webhook-request-guards` | 웹훅 본문 가드 헬퍼 | 요청 본문 읽기/제한 헬퍼 |
  | `plugin-sdk/reply-runtime` | 공유 답글 런타임 | 인바운드 발송, 하트비트, 답글 플래너, 청크 분할 |
  | `plugin-sdk/reply-dispatch-runtime` | 좁은 답글 발송 헬퍼 | 완료 + 프로바이더 발송 헬퍼 |
  | `plugin-sdk/reply-history` | 답글 기록 헬퍼 | `buildHistoryContext`, `buildPendingHistoryContextFromMap`, `recordPendingHistoryEntry`, `clearHistoryEntriesIfEnabled` |
  | `plugin-sdk/reply-reference` | 답글 참조 계획 | `createReplyReferencePlanner` |
  | `plugin-sdk/reply-chunking` | 답글 청크 헬퍼 | 텍스트/마크다운 청크 분할 헬퍼 |
  | `plugin-sdk/session-store-runtime` | 세션 스토어 헬퍼 | 스토어 경로 + 업데이트 시간 헬퍼 |
  | `plugin-sdk/state-paths` | 상태 경로 헬퍼 | 상태 및 OAuth 디렉토리 헬퍼 |
  | `plugin-sdk/routing` | 라우팅/세션 키 헬퍼 | `resolveAgentRoute`, `buildAgentSessionKey`, `resolveDefaultAgentBoundAccountId`, 세션 키 정규화 헬퍼 |
  | `plugin-sdk/status-helpers` | 채널 상태 헬퍼 | 채널/계정 상태 요약 빌더, 런타임 상태 기본값, 이슈 메타데이터 헬퍼 |
  | `plugin-sdk/target-resolver-runtime` | 타겟 해결자 헬퍼 | 공유 타겟 해결자 헬퍼 |
  | `plugin-sdk/string-normalization-runtime` | 문자열 정규화 헬퍼 | 슬러그/문자열 정규화 헬퍼 |
  | `plugin-sdk/request-url` | 요청 URL 헬퍼 | 요청 유사 입력에서 문자열 URL 추출 |
  | `plugin-sdk/run-command` | 시간 제한 명령 헬퍼 | 정규화된 stdout/stderr이 있는 시간 제한 명령 러너 |
  | `plugin-sdk/param-readers` | 파라미터 리더 | 공통 도구/CLI 파라미터 리더 |
  | `plugin-sdk/tool-payload` | 도구 페이로드 추출 | 도구 결과 객체에서 정규화된 페이로드 추출 |
  | `plugin-sdk/tool-send` | 도구 전송 추출 | 도구 인수에서 표준 전송 타겟 필드 추출 |
  | `plugin-sdk/temp-path` | 임시 경로 헬퍼 | 공유 임시 다운로드 경로 헬퍼 |
  | `plugin-sdk/logging-core` | 로깅 헬퍼 | 서브시스템 로거 및 수정 헬퍼 |
  | `plugin-sdk/markdown-table-runtime` | 마크다운 테이블 헬퍼 | 마크다운 테이블 모드 헬퍼 |
  | `plugin-sdk/reply-payload` | 메시지 답글 타입 | 답글 페이로드 타입 |
  | `plugin-sdk/provider-setup` | 큐레이션된 로컬/셀프 호스팅 프로바이더 setup 헬퍼 | 셀프 호스팅 프로바이더 검색/구성 헬퍼 |
  | `plugin-sdk/self-hosted-provider-setup` | 집중된 OpenAI 호환 셀프 호스팅 프로바이더 setup 헬퍼 | 동일한 셀프 호스팅 프로바이더 검색/구성 헬퍼 |
  | `plugin-sdk/provider-auth-runtime` | 프로바이더 런타임 auth 헬퍼 | 런타임 API 키 해결 헬퍼 |
  | `plugin-sdk/provider-auth-api-key` | 프로바이더 API 키 setup 헬퍼 | API 키 온보딩/프로필 쓰기 헬퍼 |
  | `plugin-sdk/provider-auth-result` | 프로바이더 auth 결과 헬퍼 | 표준 OAuth auth 결과 빌더 |
  | `plugin-sdk/provider-auth-login` | 프로바이더 인터랙티브 로그인 헬퍼 | 공유 인터랙티브 로그인 헬퍼 |
  | `plugin-sdk/provider-env-vars` | 프로바이더 환경 변수 헬퍼 | 프로바이더 auth 환경 변수 조회 헬퍼 |
  | `plugin-sdk/provider-model-shared` | 공유 프로바이더 모델/재실행 헬퍼 | `ProviderReplayFamily`, `buildProviderReplayFamilyHooks`, `normalizeModelCompat`, 공유 재실행 정책 빌더, 프로바이더 엔드포인트 헬퍼, 모델 id 정규화 헬퍼 |
  | `plugin-sdk/provider-catalog-shared` | 공유 프로바이더 카탈로그 헬퍼 | `findCatalogTemplate`, `buildSingleProviderApiKeyCatalog`, `supportsNativeStreamingUsageCompat`, `applyProviderNativeStreamingUsageCompat` |
  | `plugin-sdk/provider-onboard` | 프로바이더 온보딩 패치 | 온보딩 구성 헬퍼 |
  | `plugin-sdk/provider-http` | 프로바이더 HTTP 헬퍼 | 범용 프로바이더 HTTP/엔드포인트 역량 헬퍼 |
  | `plugin-sdk/provider-web-fetch` | 프로바이더 웹 fetch 헬퍼 | 웹 fetch 프로바이더 등록/캐시 헬퍼 |
  | `plugin-sdk/provider-web-search-config-contract` | 프로바이더 웹 검색 구성 헬퍼 | 플러그인 활성화 와이어링이 필요 없는 프로바이더를 위한 좁은 웹 검색 구성/자격 증명 헬퍼 |
  | `plugin-sdk/provider-web-search-contract` | 프로바이더 웹 검색 계약 헬퍼 | `createWebSearchProviderContractFields`, `enablePluginInConfig`, `resolveProviderWebSearchPluginConfig`, 스코프된 자격 증명 setter/getter를 포함한 좁은 웹 검색 구성/자격 증명 계약 헬퍼 |
  | `plugin-sdk/provider-web-search` | 프로바이더 웹 검색 헬퍼 | 웹 검색 프로바이더 등록/캐시/런타임 헬퍼 |
  | `plugin-sdk/provider-tools` | 프로바이더 도구/스키마 호환성 헬퍼 | `ProviderToolCompatFamily`, `buildProviderToolCompatFamilyHooks`, Gemini 스키마 정리 + 진단, `resolveXaiModelCompatPatch` / `applyXaiModelCompat`를 포함한 xAI 호환성 헬퍼 |
  | `plugin-sdk/provider-usage` | 프로바이더 사용량 헬퍼 | `fetchClaudeUsage`, `fetchGeminiUsage`, `fetchGithubCopilotUsage` 및 기타 프로바이더 사용량 헬퍼 |
  | `plugin-sdk/provider-stream` | 프로바이더 스트림 래퍼 헬퍼 | `ProviderStreamFamily`, `buildProviderStreamFamilyHooks`, `composeProviderStreamWrappers`, 스트림 래퍼 타입, 공유 Anthropic/Bedrock/Google/Kilocode/Moonshot/OpenAI/OpenRouter/Z.A.I/MiniMax/Copilot 래퍼 헬퍼 |
  | `plugin-sdk/keyed-async-queue` | 순서 있는 비동기 큐 | `KeyedAsyncQueue` |
  | `plugin-sdk/media-runtime` | 공유 미디어 헬퍼 | 미디어 fetch/변환/저장 헬퍼와 미디어 페이로드 빌더 |
  | `plugin-sdk/media-generation-runtime` | 공유 미디어 생성 헬퍼 | 이미지/비디오/음악 생성을 위한 공유 폴오버 헬퍼, 후보 선택, 누락 모델 메시지 |
  | `plugin-sdk/media-understanding` | 미디어 이해 헬퍼 | 미디어 이해 프로바이더 타입과 프로바이더 대면 이미지/오디오 헬퍼 내보내기 |
  | `plugin-sdk/text-runtime` | 공유 텍스트 헬퍼 | 어시스턴트 가시 텍스트 제거, 마크다운 렌더링/청크/테이블 헬퍼, 수정 헬퍼, 지시 태그 헬퍼, 안전 텍스트 유틸리티, 관련 텍스트/로깅 헬퍼 |
  | `plugin-sdk/text-chunking` | 텍스트 청크 헬퍼 | 아웃바운드 텍스트 청크 분할 헬퍼 |
  | `plugin-sdk/speech` | 음성 헬퍼 | 음성 프로바이더 타입과 프로바이더 대면 지시, 레지스트리, 검증 헬퍼 |
  | `plugin-sdk/speech-core` | 공유 음성 코어 | 음성 프로바이더 타입, 레지스트리, 지시, 정규화 |
  | `plugin-sdk/realtime-transcription` | 실시간 전사 헬퍼 | 프로바이더 타입 및 레지스트리 헬퍼 |
  | `plugin-sdk/realtime-voice` | 실시간 음성 헬퍼 | 프로바이더 타입 및 레지스트리 헬퍼 |
  | `plugin-sdk/image-generation-core` | 공유 이미지 생성 코어 | 이미지 생성 타입, 폴오버, auth, 레지스트리 헬퍼 |
  | `plugin-sdk/music-generation` | 음악 생성 헬퍼 | 음악 생성 프로바이더/요청/결과 타입 |
  | `plugin-sdk/music-generation-core` | 공유 음악 생성 코어 | 음악 생성 타입, 폴오버 헬퍼, 프로바이더 조회, 모델 참조 파싱 |
  | `plugin-sdk/video-generation` | 비디오 생성 헬퍼 | 비디오 생성 프로바이더/요청/결과 타입 |
  | `plugin-sdk/video-generation-core` | 공유 비디오 생성 코어 | 비디오 생성 타입, 폴오버 헬퍼, 프로바이더 조회, 모델 참조 파싱 |
  | `plugin-sdk/interactive-runtime` | 인터랙티브 답글 헬퍼 | 인터랙티브 답글 페이로드 정규화/축소 |
  | `plugin-sdk/channel-config-primitives` | 채널 구성 프리미티브 | 좁은 채널 구성 스키마 프리미티브 |
  | `plugin-sdk/channel-config-writes` | 채널 구성 쓰기 헬퍼 | 채널 구성 쓰기 인가 헬퍼 |
  | `plugin-sdk/channel-plugin-common` | 공유 채널 프리앰블 | 공유 채널 플러그인 프리앰블 내보내기 |
  | `plugin-sdk/channel-status` | 채널 상태 헬퍼 | 공유 채널 상태 스냅샷/요약 헬퍼 |
  | `plugin-sdk/allowlist-config-edit` | 허용 목록 구성 헬퍼 | 허용 목록 구성 편집/읽기 헬퍼 |
  | `plugin-sdk/group-access` | 그룹 접근 헬퍼 | 공유 그룹 접근 결정 헬퍼 |
  | `plugin-sdk/direct-dm` | 다이렉트 DM 헬퍼 | 공유 다이렉트 DM auth/가드 헬퍼 |
  | `plugin-sdk/extension-shared` | 공유 확장 헬퍼 | 패시브 채널/상태 및 주변 프록시 헬퍼 프리미티브 |
  | `plugin-sdk/webhook-targets` | 웹훅 타겟 헬퍼 | 웹훅 타겟 레지스트리 및 라우트 설치 헬퍼 |
  | `plugin-sdk/webhook-path` | 웹훅 경로 헬퍼 | 웹훅 경로 정규화 헬퍼 |
  | `plugin-sdk/web-media` | 공유 웹 미디어 헬퍼 | 원격/로컬 미디어 로딩 헬퍼 |
  | `plugin-sdk/zod` | Zod 재내보내기 | 플러그인 SDK 소비자를 위한 재내보낸 `zod` |
  | `plugin-sdk/memory-core` | 번들 memory-core 헬퍼 | 메모리 관리자/구성/파일/CLI 헬퍼 표면 |
  | `plugin-sdk/testing` | 테스트 유틸리티 | 테스트 헬퍼 및 목 |
:::


이 표는 의도적으로 공통 마이그레이션 부분 집합이며 전체 SDK 표면이 아닙니다. 200개 이상의 엔트리포인트 전체 목록은 `scripts/lib/plugin-sdk-entrypoints.json`에 있습니다.

해당 목록에는 여전히 `plugin-sdk/feishu`, `plugin-sdk/feishu-setup`, `plugin-sdk/zalo`, `plugin-sdk/zalo-setup`, `plugin-sdk/matrix*`와 같은 일부 번들 플러그인 헬퍼 이음새가 포함되어 있습니다. 이는 번들 플러그인 유지보수 및 호환성을 위해 내보내기로 남아 있지만, 의도적으로 공통 마이그레이션 표에서 제외되었으며 새 플러그인 코드의 권장 대상이 아닙니다.

동일한 규칙이 다른 번들 헬퍼 패밀리에도 적용됩니다:

- 브라우저 지원 헬퍼: `plugin-sdk/browser-cdp`, `plugin-sdk/browser-config-runtime`, `plugin-sdk/browser-config-support`, `plugin-sdk/browser-control-auth`, `plugin-sdk/browser-node-runtime`, `plugin-sdk/browser-profiles`, `plugin-sdk/browser-security-runtime`, `plugin-sdk/browser-setup-tools`, `plugin-sdk/browser-support`
- Matrix: `plugin-sdk/matrix*`
- LINE: `plugin-sdk/line*`
- IRC: `plugin-sdk/irc*`
- `plugin-sdk/googlechat`, `plugin-sdk/zalouser`, `plugin-sdk/bluebubbles*`, `plugin-sdk/mattermost*`, `plugin-sdk/msteams`, `plugin-sdk/nextcloud-talk`, `plugin-sdk/nostr`, `plugin-sdk/tlon`, `plugin-sdk/twitch`, `plugin-sdk/github-copilot-login`, `plugin-sdk/github-copilot-token`, `plugin-sdk/diagnostics-otel`, `plugin-sdk/diffs`, `plugin-sdk/llm-task`, `plugin-sdk/thread-ownership`, `plugin-sdk/voice-call`와 같은 번들 헬퍼/플러그인 표면

`plugin-sdk/github-copilot-token`은 현재 좁은 토큰 헬퍼 표면인 `DEFAULT_COPILOT_API_BASE_URL`, `deriveCopilotApiBaseUrlFromToken`, `resolveCopilotApiToken`을 노출합니다.

작업에 맞는 가장 좁은 임포트를 사용하십시오. 내보내기를 찾을 수 없다면 `src/plugin-sdk/`의 소스를 확인하거나 Discord에서 문의하십시오.

## 제거 일정

| 시기                 | 발생하는 일                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| **지금**             | 더 이상 사용 권장하지 않는 표면은 런타임 경고를 발생시킵니다               |
| **다음 주요 릴리스** | 더 이상 사용 권장하지 않는 표면이 제거됩니다; 여전히 사용하는 플러그인은 실패합니다 |

모든 코어 플러그인은 이미 마이그레이션되었습니다. 외부 플러그인은 다음 주요 릴리스 이전에 마이그레이션해야 합니다.

## 일시적으로 경고 억제하기

마이그레이션 작업 중 다음 환경 변수를 설정하십시오:

```bash
OPENCLAW_SUPPRESS_PLUGIN_SDK_COMPAT_WARNING=1 openclaw gateway run
OPENCLAW_SUPPRESS_EXTENSION_API_WARNING=1 openclaw gateway run
```

이것은 임시 탈출구이며 영구적인 해결책이 아닙니다.

## 관련 문서

- [시작하기](/plugins/building-plugins) — 첫 번째 플러그인 빌드하기
- [SDK 개요](/plugins/sdk-overview) — 전체 서브패스 임포트 레퍼런스
- [채널 플러그인](/plugins/sdk-channel-plugins) — 채널 플러그인 빌드하기
- [프로바이더 플러그인](/plugins/sdk-provider-plugins) — 프로바이더 플러그인 빌드하기
- [플러그인 내부 구조](/plugins/architecture) — 아키텍처 심층 분석
- [플러그인 매니페스트](/plugins/manifest) — 매니페스트 스키마 레퍼런스
