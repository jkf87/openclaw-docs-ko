---
summary: "플러그인 SDK 서브패스 카탈로그: 어떤 임포트가 어디에 있는지 영역별로 분류"
read_when:
  - 플러그인 임포트를 위해 올바른 plugin-sdk 서브패스를 고를 때
  - 번들 플러그인 서브패스와 헬퍼 표면을 감사(audit)할 때
title: "플러그인 SDK 서브패스"
---

플러그인 SDK는 `openclaw/plugin-sdk/` 하위의 좁은 서브패스(subpath) 집합으로 노출됩니다.
이 페이지는 목적별로 그룹화된 일반적으로 사용되는 서브패스를 카탈로그화합니다. 200개 이상의 서브패스
전체 생성 목록은 `scripts/lib/plugin-sdk-entrypoints.json`에 있습니다;
예약된 번들 플러그인 헬퍼 서브패스도 거기에 나타나지만, 문서 페이지가 명시적으로 공개하지 않는 한
구현 세부사항으로 간주하십시오.

플러그인 저작 가이드는 [플러그인 SDK 개요](/plugins/sdk-overview)를 참조하십시오.

## 플러그인 엔트리

| 서브패스                    | 주요 내보내기                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugin-sdk/plugin-entry`   | `definePluginEntry`                                                                                                                                |
| `plugin-sdk/core`           | `defineChannelPluginEntry`, `createChatChannelPlugin`, `createChannelPluginBase`, `defineSetupPluginEntry`, `buildChannelConfigSchema` |
| `plugin-sdk/config-schema`  | `OpenClawSchema`                                                                                                                                   |
| `plugin-sdk/provider-entry` | `defineSingleProviderPluginEntry`                                                                                                                  |

<AccordionGroup>
  <Accordion title="채널 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/channel-core` | `defineChannelPluginEntry`, `defineSetupPluginEntry`, `createChatChannelPlugin`, `createChannelPluginBase` |
    | `plugin-sdk/config-schema` | 루트 `openclaw.json` Zod schema 내보내기 (`OpenClawSchema`) |
    | `plugin-sdk/channel-setup` | `createOptionalChannelSetupSurface`, `createOptionalChannelSetupAdapter`, `createOptionalChannelSetupWizard`, 그리고 `DEFAULT_ACCOUNT_ID`, `createTopLevelChannelDmPolicy`, `setSetupChannelEnabled`, `splitSetupEntries` |
    | `plugin-sdk/setup` | 공유 setup 마법사 헬퍼, 허용 목록(allowlist) 프롬프트, setup 상태 빌더 |
    | `plugin-sdk/setup-runtime` | `createPatchedAccountSetupAdapter`, `createEnvPatchedAccountSetupAdapter`, `createSetupInputPresenceValidator`, `noteChannelLookupFailure`, `noteChannelLookupSummary`, `promptResolvedAllowFrom`, `splitSetupEntries`, `createAllowlistSetupWizardProxy`, `createDelegatedSetupWizardProxy` |
    | `plugin-sdk/setup-adapter-runtime` | `createEnvPatchedAccountSetupAdapter` |
    | `plugin-sdk/setup-tools` | `formatCliCommand`, `detectBinary`, `extractArchive`, `resolveBrewExecutable`, `formatDocsLink`, `CONFIG_DIR` |
    | `plugin-sdk/account-core` | 다중 계정 구성/액션 게이트 헬퍼, 기본 계정 폴백(fallback) 헬퍼 |
    | `plugin-sdk/account-id` | `DEFAULT_ACCOUNT_ID`, 계정 id 정규화 헬퍼 |
    | `plugin-sdk/account-resolution` | 계정 조회 + 기본값 폴백 헬퍼 |
    | `plugin-sdk/account-helpers` | 좁은 계정 목록/계정 액션 헬퍼 |
    | `plugin-sdk/channel-pairing` | `createChannelPairingController` |
    | `plugin-sdk/channel-reply-pipeline` | `createChannelReplyPipeline` |
    | `plugin-sdk/channel-config-helpers` | `createHybridChannelConfigAdapter` |
    | `plugin-sdk/channel-config-schema` | 채널 구성 schema 타입 |
    | `plugin-sdk/telegram-command-config` | 번들 계약(contract) 폴백이 포함된 Telegram 커스텀 명령 정규화/검증 헬퍼 |
    | `plugin-sdk/command-gating` | 좁은 명령 권한 게이트 헬퍼 |
    | `plugin-sdk/channel-policy` | `resolveChannelGroupRequireMention` |
    | `plugin-sdk/channel-lifecycle` | `createAccountStatusSink`, 초안(draft) 스트림 수명 주기/완결(finalization) 헬퍼 |
    | `plugin-sdk/inbound-envelope` | 공유 인바운드 라우트 + 봉투(envelope) 빌더 헬퍼 |
    | `plugin-sdk/inbound-reply-dispatch` | 공유 인바운드 record-and-dispatch 헬퍼 |
    | `plugin-sdk/messaging-targets` | 타겟 파싱/매칭 헬퍼 |
    | `plugin-sdk/outbound-media` | 공유 아웃바운드 미디어 로딩 헬퍼 |
    | `plugin-sdk/outbound-runtime` | 아웃바운드 아이덴티티, 전송 위임(send delegate), 페이로드 계획 헬퍼 |
    | `plugin-sdk/poll-runtime` | 좁은 투표(poll) 정규화 헬퍼 |
    | `plugin-sdk/thread-bindings-runtime` | 스레드 바인딩 수명 주기 및 어댑터 헬퍼 |
    | `plugin-sdk/agent-media-payload` | 레거시 에이전트 미디어 페이로드 빌더 |
    | `plugin-sdk/conversation-runtime` | 대화/스레드 바인딩, 페어링, 구성된(configured) 바인딩 헬퍼 |
    | `plugin-sdk/runtime-config-snapshot` | 런타임 구성 스냅샷 헬퍼 |
    | `plugin-sdk/runtime-group-policy` | 런타임 그룹 정책 해결 헬퍼 |
    | `plugin-sdk/channel-status` | 공유 채널 상태 스냅샷/요약 헬퍼 |
    | `plugin-sdk/channel-config-primitives` | 좁은 채널 구성 schema 프리미티브 |
    | `plugin-sdk/channel-config-writes` | 채널 구성 쓰기 권한 헬퍼 |
    | `plugin-sdk/channel-plugin-common` | 공유 채널 플러그인 프렐류드(prelude) 내보내기 |
    | `plugin-sdk/allowlist-config-edit` | 허용 목록 구성 편집/읽기 헬퍼 |
    | `plugin-sdk/group-access` | 공유 그룹 액세스 결정 헬퍼 |
    | `plugin-sdk/direct-dm` | 공유 다이렉트 DM auth/가드 헬퍼 |
    | `plugin-sdk/interactive-runtime` | 시맨틱 메시지 프레젠테이션, 전달(delivery), 레거시 인터랙티브 답글 헬퍼. [Message Presentation](/plugins/message-presentation) 참조 |
    | `plugin-sdk/channel-inbound` | 인바운드 디바운스(debounce), 멘션 매칭, 멘션 정책 헬퍼, 봉투 헬퍼를 위한 호환성 barrel |
    | `plugin-sdk/channel-inbound-debounce` | 좁은 인바운드 디바운스 헬퍼 |
    | `plugin-sdk/channel-mention-gating` | 더 넓은 인바운드 runtime 표면 없이 좁은 멘션 정책 및 멘션 텍스트 헬퍼 |
    | `plugin-sdk/channel-envelope` | 좁은 인바운드 봉투 포매팅 헬퍼 |
    | `plugin-sdk/channel-location` | 채널 위치 컨텍스트 및 포매팅 헬퍼 |
    | `plugin-sdk/channel-logging` | 인바운드 드롭 및 타이핑/ack 실패를 위한 채널 로깅 헬퍼 |
    | `plugin-sdk/channel-send-result` | 답글 결과 타입 |
    | `plugin-sdk/channel-actions` | 채널 메시지 액션 헬퍼, 그리고 플러그인 호환성을 위해 유지되는 deprecated native schema 헬퍼 |
    | `plugin-sdk/channel-targets` | 타겟 파싱/매칭 헬퍼 |
    | `plugin-sdk/channel-contract` | 채널 계약 타입 |
    | `plugin-sdk/channel-feedback` | 피드백/반응 와이어링 |
    | `plugin-sdk/channel-secret-runtime` | `collectSimpleChannelFieldAssignments`, `getChannelSurface`, `pushAssignment`과 같은 좁은 시크릿 계약 헬퍼와 시크릿 타겟 타입 |
  </Accordion>

  <Accordion title="프로바이더 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/provider-entry` | `defineSingleProviderPluginEntry` |
    | `plugin-sdk/provider-setup` | 큐레이션된 로컬/셀프 호스팅 프로바이더 setup 헬퍼 |
    | `plugin-sdk/self-hosted-provider-setup` | 집중된 OpenAI 호환 셀프 호스팅 프로바이더 setup 헬퍼 |
    | `plugin-sdk/cli-backend` | CLI 백엔드 기본값 + watchdog 상수 |
    | `plugin-sdk/provider-auth-runtime` | 프로바이더 플러그인을 위한 런타임 API 키 해결 헬퍼 |
    | `plugin-sdk/provider-auth-api-key` | `upsertApiKeyProfile`과 같은 API 키 온보딩/프로필 쓰기 헬퍼 |
    | `plugin-sdk/provider-auth-result` | 표준 OAuth auth 결과 빌더 |
    | `plugin-sdk/provider-auth-login` | 프로바이더 플러그인을 위한 공유 인터랙티브 로그인 헬퍼 |
    | `plugin-sdk/provider-env-vars` | 프로바이더 auth 환경 변수 조회 헬퍼 |
    | `plugin-sdk/provider-auth` | `createProviderApiKeyAuthMethod`, `ensureApiKeyFromOptionEnvOrPrompt`, `upsertAuthProfile`, `upsertApiKeyProfile`, `writeOAuthCredentials` |
    | `plugin-sdk/provider-model-shared` | `ProviderReplayFamily`, `buildProviderReplayFamilyHooks`, `normalizeModelCompat`, 공유 replay 정책 빌더, 프로바이더 엔드포인트 헬퍼, 그리고 `normalizeNativeXaiModelId`와 같은 모델 id 정규화 헬퍼 |
    | `plugin-sdk/provider-catalog-shared` | `findCatalogTemplate`, `buildSingleProviderApiKeyCatalog`, `supportsNativeStreamingUsageCompat`, `applyProviderNativeStreamingUsageCompat` |
    | `plugin-sdk/provider-http` | 범용 프로바이더 HTTP/엔드포인트 역량 헬퍼, 오디오 전사 multipart form 헬퍼 포함 |
    | `plugin-sdk/provider-web-fetch-contract` | `enablePluginInConfig` 및 `WebFetchProviderPlugin`과 같은 좁은 web-fetch 구성/선택 계약 헬퍼 |
    | `plugin-sdk/provider-web-fetch` | Web-fetch 프로바이더 등록/캐시 헬퍼 |
    | `plugin-sdk/provider-web-search-config-contract` | 플러그인 활성화 와이어링이 필요 없는 프로바이더를 위한 좁은 web-search 구성/자격 증명 헬퍼 |
    | `plugin-sdk/provider-web-search-contract` | `createWebSearchProviderContractFields`, `enablePluginInConfig`, `resolveProviderWebSearchPluginConfig`, 스코프된 자격 증명 setter/getter와 같은 좁은 web-search 구성/자격 증명 계약 헬퍼 |
    | `plugin-sdk/provider-web-search` | Web-search 프로바이더 등록/캐시/runtime 헬퍼 |
    | `plugin-sdk/provider-tools` | `ProviderToolCompatFamily`, `buildProviderToolCompatFamilyHooks`, Gemini schema 정리 + 진단, 그리고 `resolveXaiModelCompatPatch` / `applyXaiModelCompat`과 같은 xAI 호환 헬퍼 |
    | `plugin-sdk/provider-usage` | `fetchClaudeUsage` 등 |
    | `plugin-sdk/provider-stream` | `ProviderStreamFamily`, `buildProviderStreamFamilyHooks`, `composeProviderStreamWrappers`, 스트림 래퍼 타입, 공유 Anthropic/Bedrock/Google/Kilocode/Moonshot/OpenAI/OpenRouter/Z.A.I/MiniMax/Copilot 래퍼 헬퍼 |
    | `plugin-sdk/provider-transport-runtime` | guarded fetch, transport 메시지 변환, 쓰기 가능한 transport 이벤트 스트림과 같은 네이티브 프로바이더 transport 헬퍼 |
    | `plugin-sdk/provider-onboard` | 온보딩 구성 패치 헬퍼 |
    | `plugin-sdk/global-singleton` | 프로세스 로컬 singleton/map/cache 헬퍼 |
    | `plugin-sdk/group-activation` | 좁은 그룹 활성화 모드 및 명령 파싱 헬퍼 |
  </Accordion>

  <Accordion title="Auth 및 보안 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/command-auth` | `resolveControlCommandGate`, 명령 레지스트리 헬퍼, 발신자 권한 헬퍼 |
    | `plugin-sdk/command-status` | `buildCommandsMessagePaginated` 및 `buildHelpMessage`와 같은 명령/도움말 메시지 빌더 |
    | `plugin-sdk/approval-auth-runtime` | 승인자 해결 및 동일 채팅 내 액션 auth 헬퍼 |
    | `plugin-sdk/approval-client-runtime` | 네이티브 실행 승인 프로필/필터 헬퍼 |
    | `plugin-sdk/approval-delivery-runtime` | 네이티브 승인 역량/전달(delivery) 어댑터 |
    | `plugin-sdk/approval-gateway-runtime` | 공유 승인 게이트웨이 해결 헬퍼 |
    | `plugin-sdk/approval-handler-adapter-runtime` | 핫 채널 엔트리포인트를 위한 경량 네이티브 승인 어댑터 로딩 헬퍼 |
    | `plugin-sdk/approval-handler-runtime` | 더 넓은 승인 핸들러 runtime 헬퍼; 충분할 때는 더 좁은 어댑터/게이트웨이 이음새(seam)를 선호하십시오 |
    | `plugin-sdk/approval-native-runtime` | 네이티브 승인 타겟 + 계정 바인딩 헬퍼 |
    | `plugin-sdk/approval-reply-runtime` | 실행/플러그인 승인 답글 페이로드 헬퍼 |
    | `plugin-sdk/reply-dedupe` | 좁은 인바운드 답글 중복 제거(dedupe) 리셋 헬퍼 |
    | `plugin-sdk/channel-contract-testing` | 넓은 testing barrel 없이 좁은 채널 계약 테스트 헬퍼 |
    | `plugin-sdk/command-auth-native` | 네이티브 명령 auth + 네이티브 세션 타겟 헬퍼 |
    | `plugin-sdk/command-detection` | 공유 명령 감지 헬퍼 |
    | `plugin-sdk/command-primitives-runtime` | 핫 채널 경로를 위한 경량 명령 텍스트 predicate |
    | `plugin-sdk/command-surface` | 명령 본문 정규화 및 명령 표면 헬퍼 |
    | `plugin-sdk/allow-from` | `formatAllowFromLowercase` |
    | `plugin-sdk/channel-secret-runtime` | 채널/플러그인 시크릿 표면을 위한 좁은 시크릿 계약 수집 헬퍼 |
    | `plugin-sdk/secret-ref-runtime` | 시크릿 계약/구성 파싱을 위한 좁은 `coerceSecretRef` 및 SecretRef 타이핑 헬퍼 |
    | `plugin-sdk/security-runtime` | 공유 신뢰(trust), DM 게이팅, 외부 콘텐츠, 시크릿 수집 헬퍼 |
    | `plugin-sdk/ssrf-policy` | 호스트 허용 목록 및 사설 네트워크 SSRF 정책 헬퍼 |
    | `plugin-sdk/ssrf-dispatcher` | 넓은 인프라 runtime 표면 없이 좁은 pinned-dispatcher 헬퍼 |
    | `plugin-sdk/ssrf-runtime` | Pinned-dispatcher, SSRF 가드 fetch, SSRF 정책 헬퍼 |
    | `plugin-sdk/secret-input` | 시크릿 입력 파싱 헬퍼 |
    | `plugin-sdk/webhook-ingress` | 웹훅 요청/타겟 헬퍼 |
    | `plugin-sdk/webhook-request-guards` | 요청 본문 크기/타임아웃 헬퍼 |
  </Accordion>

  <Accordion title="런타임 및 스토리지 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/runtime` | 넓은 runtime/로깅/백업/플러그인 설치 헬퍼 |
    | `plugin-sdk/runtime-env` | 좁은 runtime env, logger, 타임아웃, 재시도, 백오프 헬퍼 |
    | `plugin-sdk/channel-runtime-context` | 범용 채널 runtime 컨텍스트 등록 및 조회 헬퍼 |
    | `plugin-sdk/runtime-store` | `createPluginRuntimeStore` |
    | `plugin-sdk/plugin-runtime` | 공유 플러그인 명령/훅/http/인터랙티브 헬퍼 |
    | `plugin-sdk/hook-runtime` | 공유 웹훅/내부 훅 파이프라인 헬퍼 |
    | `plugin-sdk/lazy-runtime` | `createLazyRuntimeModule`, `createLazyRuntimeMethod`, `createLazyRuntimeSurface`와 같은 지연 runtime 임포트/바인딩 헬퍼 |
    | `plugin-sdk/process-runtime` | 프로세스 실행 헬퍼 |
    | `plugin-sdk/cli-runtime` | CLI 포매팅, wait, 버전 헬퍼 |
    | `plugin-sdk/gateway-runtime` | 게이트웨이 클라이언트 및 채널 상태 패치 헬퍼 |
    | `plugin-sdk/config-runtime` | 구성 로드/쓰기 헬퍼 및 플러그인 구성 조회 헬퍼 |
    | `plugin-sdk/telegram-command-config` | 번들된 Telegram 계약 표면을 사용할 수 없을 때도 동작하는 Telegram 명령 이름/설명 정규화 및 중복/충돌 검사 |
    | `plugin-sdk/text-autolink-runtime` | 넓은 text-runtime barrel 없이 파일 참조 자동 링크 감지 |
    | `plugin-sdk/approval-runtime` | 실행/플러그인 승인 헬퍼, 승인 역량 빌더, auth/프로필 헬퍼, 네이티브 라우팅/runtime 헬퍼 |
    | `plugin-sdk/reply-runtime` | 공유 인바운드/답글 runtime 헬퍼, 청킹(chunking), 발송, 하트비트, 답글 플래너 |
    | `plugin-sdk/reply-dispatch-runtime` | 좁은 답글 발송/완료 헬퍼 |
    | `plugin-sdk/reply-history` | `buildHistoryContext`, `recordPendingHistoryEntry`, `clearHistoryEntriesIfEnabled`와 같은 공유 단기(window) 답글 기록 헬퍼 |
    | `plugin-sdk/reply-reference` | `createReplyReferencePlanner` |
    | `plugin-sdk/reply-chunking` | 좁은 텍스트/마크다운 청킹 헬퍼 |
    | `plugin-sdk/session-store-runtime` | 세션 스토어 경로 + updated-at 헬퍼 |
    | `plugin-sdk/state-paths` | State/OAuth 디렉토리 경로 헬퍼 |
    | `plugin-sdk/routing` | `resolveAgentRoute`, `buildAgentSessionKey`, `resolveDefaultAgentBoundAccountId`와 같은 라우트/세션 키/계정 바인딩 헬퍼 |
    | `plugin-sdk/status-helpers` | 공유 채널/계정 상태 요약 헬퍼, runtime 상태 기본값, 이슈 메타데이터 헬퍼 |
    | `plugin-sdk/target-resolver-runtime` | 공유 타겟 resolver 헬퍼 |
    | `plugin-sdk/string-normalization-runtime` | Slug/문자열 정규화 헬퍼 |
    | `plugin-sdk/request-url` | fetch/request 유사 입력에서 문자열 URL 추출 |
    | `plugin-sdk/run-command` | 정규화된 stdout/stderr 결과를 가진 시간 제한 명령 러너 |
    | `plugin-sdk/param-readers` | 공통 도구/CLI 파라미터 리더 |
    | `plugin-sdk/tool-payload` | 도구 결과 객체에서 정규화된 페이로드 추출 |
    | `plugin-sdk/tool-send` | 도구 인수에서 표준(canonical) 전송 타겟 필드 추출 |
    | `plugin-sdk/temp-path` | 공유 임시 다운로드 경로 헬퍼 |
    | `plugin-sdk/logging-core` | 서브시스템 logger 및 편집(redaction) 헬퍼 |
    | `plugin-sdk/markdown-table-runtime` | 마크다운 테이블 모드 및 변환 헬퍼 |
    | `plugin-sdk/json-store` | 소형 JSON 상태 읽기/쓰기 헬퍼 |
    | `plugin-sdk/file-lock` | 재진입(re-entrant) 파일 락 헬퍼 |
    | `plugin-sdk/persistent-dedupe` | 디스크 기반 중복 제거 캐시 헬퍼 |
    | `plugin-sdk/acp-runtime` | ACP runtime/세션 및 답글 발송 헬퍼 |
    | `plugin-sdk/acp-binding-resolve-runtime` | 수명 주기 시작 임포트 없이 읽기 전용 ACP 바인딩 해결 |
    | `plugin-sdk/agent-config-primitives` | 좁은 에이전트 runtime 구성 schema 프리미티브 |
    | `plugin-sdk/boolean-param` | 느슨한(loose) 불리언 파라미터 리더 |
    | `plugin-sdk/dangerous-name-runtime` | 위험한 이름 매칭 해결 헬퍼 |
    | `plugin-sdk/device-bootstrap` | 디바이스 부트스트랩 및 페어링 토큰 헬퍼 |
    | `plugin-sdk/extension-shared` | 공유 passive-channel, status, ambient proxy 헬퍼 프리미티브 |
    | `plugin-sdk/models-provider-runtime` | `/models` 명령/프로바이더 답글 헬퍼 |
    | `plugin-sdk/skill-commands-runtime` | 스킬 명령 목록 헬퍼 |
    | `plugin-sdk/native-command-registry` | 네이티브 명령 레지스트리/빌드/직렬화 헬퍼 |
    | `plugin-sdk/agent-harness` | 저수준 에이전트 harness를 위한 실험적 신뢰 플러그인 표면: harness 타입, 활성 실행 steer/abort 헬퍼, OpenClaw 도구 브리지 헬퍼, attempt 결과 유틸리티 |
    | `plugin-sdk/provider-zai-endpoint` | Z.AI 엔드포인트 감지 헬퍼 |
    | `plugin-sdk/infra-runtime` | 시스템 이벤트/하트비트 헬퍼 |
    | `plugin-sdk/collection-runtime` | 소형 경계(bounded) 캐시 헬퍼 |
    | `plugin-sdk/diagnostic-runtime` | 진단 플래그 및 이벤트 헬퍼 |
    | `plugin-sdk/error-runtime` | 에러 그래프, 포매팅, 공유 에러 분류 헬퍼, `isApprovalNotFoundError` |
    | `plugin-sdk/fetch-runtime` | Wrapped fetch, proxy, pinned lookup 헬퍼 |
    | `plugin-sdk/runtime-fetch` | Proxy/guarded-fetch 임포트 없는 dispatcher 인지 runtime fetch |
    | `plugin-sdk/response-limit-runtime` | 넓은 미디어 runtime 표면 없이 경계가 있는 응답 본문 리더 |
    | `plugin-sdk/session-binding-runtime` | 구성된 바인딩 라우팅 또는 페어링 스토어 없이 현재 대화 바인딩 상태 |
    | `plugin-sdk/session-store-runtime` | 넓은 구성 쓰기/유지보수 임포트 없이 세션 스토어 읽기 헬퍼 |
    | `plugin-sdk/context-visibility-runtime` | 넓은 구성/보안 임포트 없이 컨텍스트 가시성 해결 및 보조 컨텍스트 필터링 |
    | `plugin-sdk/string-coerce-runtime` | 마크다운/로깅 임포트 없이 좁은 프리미티브 레코드/문자열 coercion 및 정규화 헬퍼 |
    | `plugin-sdk/host-runtime` | 호스트명 및 SCP 호스트 정규화 헬퍼 |
    | `plugin-sdk/retry-runtime` | 재시도 구성 및 재시도 러너 헬퍼 |
    | `plugin-sdk/agent-runtime` | 에이전트 디렉토리/아이덴티티/워크스페이스 헬퍼 |
    | `plugin-sdk/directory-runtime` | 구성 기반 디렉토리 쿼리/중복 제거 |
    | `plugin-sdk/keyed-async-queue` | `KeyedAsyncQueue` |
  </Accordion>

  <Accordion title="역량(capability) 및 테스팅 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/media-runtime` | 공유 미디어 fetch/변환/저장 헬퍼와 미디어 페이로드 빌더 |
    | `plugin-sdk/media-store` | `saveMediaBuffer`와 같은 좁은 미디어 스토어 헬퍼 |
    | `plugin-sdk/media-generation-runtime` | 공유 미디어 생성 폴오버 헬퍼, 후보 선택, 누락 모델 메시지 |
    | `plugin-sdk/media-understanding` | 미디어 이해 프로바이더 타입과 프로바이더 대면 이미지/오디오 헬퍼 내보내기 |
    | `plugin-sdk/text-runtime` | 어시스턴트 가시 텍스트 스트리핑, 마크다운 렌더/청킹/테이블 헬퍼, 편집 헬퍼, directive-tag 헬퍼, 안전 텍스트 유틸리티와 같은 공유 텍스트/마크다운/로깅 헬퍼 |
    | `plugin-sdk/text-chunking` | 아웃바운드 텍스트 청킹 헬퍼 |
    | `plugin-sdk/speech` | 음성 프로바이더 타입과 프로바이더 대면 directive, 레지스트리, 검증 헬퍼 |
    | `plugin-sdk/speech-core` | 공유 음성 프로바이더 타입, 레지스트리, directive, 정규화 헬퍼 |
    | `plugin-sdk/realtime-transcription` | 실시간 전사 프로바이더 타입, 레지스트리 헬퍼, 공유 WebSocket 세션 헬퍼 |
    | `plugin-sdk/realtime-voice` | 실시간 음성 프로바이더 타입 및 레지스트리 헬퍼 |
    | `plugin-sdk/image-generation` | 이미지 생성 프로바이더 타입 |
    | `plugin-sdk/image-generation-core` | 공유 이미지 생성 타입, 폴오버, auth, 레지스트리 헬퍼 |
    | `plugin-sdk/music-generation` | 음악 생성 프로바이더/요청/결과 타입 |
    | `plugin-sdk/music-generation-core` | 공유 음악 생성 타입, 폴오버 헬퍼, 프로바이더 조회, 모델 참조 파싱 |
    | `plugin-sdk/video-generation` | 비디오 생성 프로바이더/요청/결과 타입 |
    | `plugin-sdk/video-generation-core` | 공유 비디오 생성 타입, 폴오버 헬퍼, 프로바이더 조회, 모델 참조 파싱 |
    | `plugin-sdk/webhook-targets` | 웹훅 타겟 레지스트리 및 라우트 설치 헬퍼 |
    | `plugin-sdk/webhook-path` | 웹훅 경로 정규화 헬퍼 |
    | `plugin-sdk/web-media` | 공유 원격/로컬 미디어 로딩 헬퍼 |
    | `plugin-sdk/zod` | 플러그인 SDK 소비자를 위해 재내보낸 `zod` |
    | `plugin-sdk/testing` | `installCommonResolveTargetErrorCases`, `shouldAckReaction` |
  </Accordion>

  <Accordion title="메모리 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/memory-core` | manager/config/file/CLI 헬퍼를 위한 번들 memory-core 헬퍼 표면 |
    | `plugin-sdk/memory-core-engine-runtime` | 메모리 인덱스/검색 runtime 파사드(facade) |
    | `plugin-sdk/memory-core-host-engine-foundation` | 메모리 호스트 foundation 엔진 내보내기 |
    | `plugin-sdk/memory-core-host-engine-embeddings` | 메모리 호스트 임베딩 계약, 레지스트리 액세스, 로컬 프로바이더, 범용 batch/remote 헬퍼 |
    | `plugin-sdk/memory-core-host-engine-qmd` | 메모리 호스트 QMD 엔진 내보내기 |
    | `plugin-sdk/memory-core-host-engine-storage` | 메모리 호스트 스토리지 엔진 내보내기 |
    | `plugin-sdk/memory-core-host-multimodal` | 메모리 호스트 멀티모달 헬퍼 |
    | `plugin-sdk/memory-core-host-query` | 메모리 호스트 쿼리 헬퍼 |
    | `plugin-sdk/memory-core-host-secret` | 메모리 호스트 시크릿 헬퍼 |
    | `plugin-sdk/memory-core-host-events` | 메모리 호스트 이벤트 저널 헬퍼 |
    | `plugin-sdk/memory-core-host-status` | 메모리 호스트 상태 헬퍼 |
    | `plugin-sdk/memory-core-host-runtime-cli` | 메모리 호스트 CLI runtime 헬퍼 |
    | `plugin-sdk/memory-core-host-runtime-core` | 메모리 호스트 core runtime 헬퍼 |
    | `plugin-sdk/memory-core-host-runtime-files` | 메모리 호스트 파일/runtime 헬퍼 |
    | `plugin-sdk/memory-host-core` | 메모리 호스트 core runtime 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-host-events` | 메모리 호스트 이벤트 저널 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-host-files` | 메모리 호스트 파일/runtime 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-host-markdown` | 메모리 인접 플러그인을 위한 공유 관리형(managed) 마크다운 헬퍼 |
    | `plugin-sdk/memory-host-search` | search-manager 액세스를 위한 Active Memory runtime 파사드 |
    | `plugin-sdk/memory-host-status` | 메모리 호스트 상태 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-lancedb` | 번들 memory-lancedb 헬퍼 표면 |
  </Accordion>

  <Accordion title="예약된 번들 헬퍼 서브패스">
    | 패밀리 | 현재 서브패스 | 의도된 사용처 |
    | --- | --- | --- |
    | Browser | `plugin-sdk/browser-cdp`, `plugin-sdk/browser-config-runtime`, `plugin-sdk/browser-config-support`, `plugin-sdk/browser-control-auth`, `plugin-sdk/browser-node-runtime`, `plugin-sdk/browser-profiles`, `plugin-sdk/browser-security-runtime`, `plugin-sdk/browser-setup-tools`, `plugin-sdk/browser-support` | 번들된 브라우저 플러그인 지원 헬퍼 (`browser-support`는 호환성 barrel로 유지됨) |
    | Matrix | `plugin-sdk/matrix`, `plugin-sdk/matrix-helper`, `plugin-sdk/matrix-runtime-heavy`, `plugin-sdk/matrix-runtime-shared`, `plugin-sdk/matrix-runtime-surface`, `plugin-sdk/matrix-surface`, `plugin-sdk/matrix-thread-bindings` | 번들된 Matrix 헬퍼/runtime 표면 |
    | Line | `plugin-sdk/line`, `plugin-sdk/line-core`, `plugin-sdk/line-runtime`, `plugin-sdk/line-surface` | 번들된 LINE 헬퍼/runtime 표면 |
    | IRC | `plugin-sdk/irc`, `plugin-sdk/irc-surface` | 번들된 IRC 헬퍼 표면 |
    | 채널 전용 헬퍼 | `plugin-sdk/googlechat`, `plugin-sdk/zalouser`, `plugin-sdk/bluebubbles`, `plugin-sdk/bluebubbles-policy`, `plugin-sdk/mattermost`, `plugin-sdk/mattermost-policy`, `plugin-sdk/feishu-conversation`, `plugin-sdk/msteams`, `plugin-sdk/nextcloud-talk`, `plugin-sdk/nostr`, `plugin-sdk/tlon`, `plugin-sdk/twitch` | 번들된 채널 호환성/헬퍼 이음새 |
    | Auth/플러그인 전용 헬퍼 | `plugin-sdk/github-copilot-login`, `plugin-sdk/github-copilot-token`, `plugin-sdk/diagnostics-otel`, `plugin-sdk/diffs`, `plugin-sdk/llm-task`, `plugin-sdk/thread-ownership`, `plugin-sdk/voice-call` | 번들된 기능/플러그인 헬퍼 이음새; `plugin-sdk/github-copilot-token`은 현재 `DEFAULT_COPILOT_API_BASE_URL`, `deriveCopilotApiBaseUrlFromToken`, `resolveCopilotApiToken`를 내보냅니다 |
  </Accordion>
</AccordionGroup>

## 관련 문서

- [플러그인 SDK 개요](/plugins/sdk-overview)
- [플러그인 SDK setup](/plugins/sdk-setup)
- [플러그인 빌드하기](/plugins/building-plugins)
