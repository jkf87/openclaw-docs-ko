---
title: "플러그인 SDK 개요"
sidebarTitle: "SDK 개요"
summary: "임포트 맵, 등록 API 레퍼런스, SDK 아키텍처"
read_when:
  - 어떤 SDK 서브패스에서 임포트해야 하는지 알아야 할 때
  - OpenClawPluginApi의 모든 등록 메서드 레퍼런스가 필요할 때
  - 특정 SDK 내보내기를 찾을 때
---

# 플러그인 SDK 개요

플러그인 SDK는 플러그인과 코어 간의 타입된 계약입니다. 이 페이지는 **임포트할 항목**과 **등록할 수 있는 항목**에 대한 레퍼런스입니다.

<Tip>
  **방법론 가이드가 필요하신가요?**
  - 첫 번째 플러그인? [시작하기](/plugins/building-plugins)로 시작하십시오
  - 채널 플러그인? [채널 플러그인](/plugins/sdk-channel-plugins) 참조
  - 프로바이더 플러그인? [프로바이더 플러그인](/plugins/sdk-provider-plugins) 참조
</Tip>

## 임포트 규칙

항상 특정 서브패스에서 임포트하십시오:

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { defineChannelPluginEntry } from "openclaw/plugin-sdk/channel-core";
```

각 서브패스는 작고 독립적인 모듈입니다. 이렇게 하면 시작이 빠르고 순환 의존성 문제가 방지됩니다. 채널별 엔트리/빌드 헬퍼에는 `openclaw/plugin-sdk/channel-core`를 선호하고, `openclaw/plugin-sdk/core`는 `buildChannelConfigSchema`와 같은 더 넓은 우산 표면 및 공유 헬퍼용으로 유지하십시오.

`openclaw/plugin-sdk/slack`, `openclaw/plugin-sdk/discord`, `openclaw/plugin-sdk/signal`, `openclaw/plugin-sdk/whatsapp`, 또는 채널 브랜드 헬퍼 이음새와 같은 프로바이더 이름 편의 이음새를 추가하거나 의존하지 마십시오. 번들 플러그인은 자체 `api.ts` 또는 `runtime-api.ts` 배럴 내에서 범용 SDK 서브패스를 조합해야 하며, 코어는 해당 플러그인 로컬 배럴을 사용하거나 진정으로 크로스 채널 필요가 있을 때만 좁은 범용 SDK 계약을 추가해야 합니다.

생성된 내보내기 맵에는 여전히 `plugin-sdk/feishu`, `plugin-sdk/feishu-setup`, `plugin-sdk/zalo`, `plugin-sdk/zalo-setup`, `plugin-sdk/matrix*`와 같은 소수의 번들 플러그인 헬퍼 이음새가 포함되어 있습니다. 이 서브패스는 번들 플러그인 유지보수 및 호환성만을 위해 존재합니다; 의도적으로 아래 공통 표에서 제외되었으며 새로운 서드파티 플러그인에 권장되는 임포트 경로가 아닙니다.

## 서브패스 레퍼런스

목적별로 그룹화된 가장 일반적으로 사용되는 서브패스. 200개 이상의 서브패스 전체 생성 목록은 `scripts/lib/plugin-sdk-entrypoints.json`에 있습니다.

예약된 번들 플러그인 헬퍼 서브패스는 여전히 해당 생성 목록에 나타납니다. 문서 페이지가 명시적으로 공개로 표시하지 않는 한 이를 구현 세부 정보/호환성 표면으로 취급하십시오.

### 플러그인 엔트리

| 서브패스                    | 주요 내보내기                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `plugin-sdk/plugin-entry`   | `definePluginEntry`                                                                                                                                    |
| `plugin-sdk/core`           | `defineChannelPluginEntry`, `createChatChannelPlugin`, `createChannelPluginBase`, `defineSetupPluginEntry`, `buildChannelConfigSchema` |
| `plugin-sdk/config-schema`  | `OpenClawSchema`                                                                                                                                       |
| `plugin-sdk/provider-entry` | `defineSingleProviderPluginEntry`                                                                                                                      |

<AccordionGroup>
  <Accordion title="채널 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/channel-core` | `defineChannelPluginEntry`, `defineSetupPluginEntry`, `createChatChannelPlugin`, `createChannelPluginBase` |
    | `plugin-sdk/config-schema` | 루트 `openclaw.json` Zod 스키마 내보내기(`OpenClawSchema`) |
    | `plugin-sdk/channel-setup` | `createOptionalChannelSetupSurface`, `createOptionalChannelSetupAdapter`, `createOptionalChannelSetupWizard`, `DEFAULT_ACCOUNT_ID`, `createTopLevelChannelDmPolicy`, `setSetupChannelEnabled`, `splitSetupEntries` |
    | `plugin-sdk/setup` | 공유 setup 마법사 헬퍼, 허용 목록 프롬프트, setup 상태 빌더 |
    | `plugin-sdk/setup-runtime` | `createPatchedAccountSetupAdapter`, `createEnvPatchedAccountSetupAdapter`, `createSetupInputPresenceValidator`, `noteChannelLookupFailure`, `noteChannelLookupSummary`, `promptResolvedAllowFrom`, `splitSetupEntries`, `createAllowlistSetupWizardProxy`, `createDelegatedSetupWizardProxy` |
    | `plugin-sdk/setup-adapter-runtime` | `createEnvPatchedAccountSetupAdapter` |
    | `plugin-sdk/setup-tools` | `formatCliCommand`, `detectBinary`, `extractArchive`, `resolveBrewExecutable`, `formatDocsLink`, `CONFIG_DIR` |
    | `plugin-sdk/account-core` | 다중 계정 구성/액션 게이트 헬퍼, 기본 계정 폴백 헬퍼 |
    | `plugin-sdk/account-id` | `DEFAULT_ACCOUNT_ID`, 계정 id 정규화 헬퍼 |
    | `plugin-sdk/account-resolution` | 계정 조회 + 기본값 폴백 헬퍼 |
    | `plugin-sdk/account-helpers` | 좁은 계정 목록/계정 액션 헬퍼 |
    | `plugin-sdk/channel-pairing` | `createChannelPairingController` |
    | `plugin-sdk/channel-reply-pipeline` | `createChannelReplyPipeline` |
    | `plugin-sdk/channel-config-helpers` | `createHybridChannelConfigAdapter` |
    | `plugin-sdk/channel-config-schema` | 채널 구성 스키마 타입 |
    | `plugin-sdk/telegram-command-config` | 번들 계약 표면 폴백이 있는 Telegram 사용자 정의 명령 정규화/검증 헬퍼 |
    | `plugin-sdk/channel-policy` | `resolveChannelGroupRequireMention` |
    | `plugin-sdk/channel-lifecycle` | `createAccountStatusSink` |
    | `plugin-sdk/inbound-envelope` | 공유 인바운드 라우트 + 봉투 빌더 헬퍼 |
    | `plugin-sdk/inbound-reply-dispatch` | 공유 인바운드 기록-및-발송 헬퍼 |
    | `plugin-sdk/messaging-targets` | 타겟 파싱/매칭 헬퍼 |
    | `plugin-sdk/outbound-media` | 공유 아웃바운드 미디어 로딩 헬퍼 |
    | `plugin-sdk/outbound-runtime` | 아웃바운드 아이덴티티/전송 위임 헬퍼 |
    | `plugin-sdk/thread-bindings-runtime` | 스레드 바인딩 수명 주기 및 어댑터 헬퍼 |
    | `plugin-sdk/agent-media-payload` | 레거시 에이전트 미디어 페이로드 빌더 |
    | `plugin-sdk/channel-status` | 공유 채널 상태 스냅샷/요약 헬퍼 |
    | `plugin-sdk/channel-config-primitives` | 좁은 채널 구성 스키마 프리미티브 |
    | `plugin-sdk/channel-config-writes` | 채널 구성 쓰기 인가 헬퍼 |
    | `plugin-sdk/channel-plugin-common` | 공유 채널 플러그인 프리앰블 내보내기 |
    | `plugin-sdk/allowlist-config-edit` | 허용 목록 구성 편집/읽기 헬퍼 |
    | `plugin-sdk/group-access` | 공유 그룹 접근 결정 헬퍼 |
    | `plugin-sdk/direct-dm` | 공유 다이렉트 DM auth/가드 헬퍼 |
    | `plugin-sdk/interactive-runtime` | 인터랙티브 답글 페이로드 정규화/축소 헬퍼 |
    | `plugin-sdk/channel-inbound` | 인바운드 디바운스, 언급 매칭, 언급 정책 헬퍼, 봉투 헬퍼 |
    | `plugin-sdk/channel-send-result` | 답글 결과 타입 |
    | `plugin-sdk/channel-actions` | `createMessageToolButtonsSchema`, `createMessageToolCardSchema` |
    | `plugin-sdk/channel-targets` | 타겟 파싱/매칭 헬퍼 |
    | `plugin-sdk/channel-contract` | 채널 계약 타입 |
    | `plugin-sdk/channel-feedback` | 피드백/반응 와이어링 |
  </Accordion>

  <Accordion title="프로바이더 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/provider-entry` | `defineSingleProviderPluginEntry` |
    | `plugin-sdk/provider-setup` | 큐레이션된 로컬/셀프 호스팅 프로바이더 setup 헬퍼 |
    | `plugin-sdk/self-hosted-provider-setup` | 집중된 OpenAI 호환 셀프 호스팅 프로바이더 setup 헬퍼 |
    | `plugin-sdk/provider-auth` | `createProviderApiKeyAuthMethod`, `ensureApiKeyFromOptionEnvOrPrompt`, `upsertAuthProfile`, `upsertApiKeyProfile`, `writeOAuthCredentials` |
    | `plugin-sdk/provider-auth-runtime` | 프로바이더 플러그인을 위한 런타임 API 키 해결 헬퍼 |
    | `plugin-sdk/provider-auth-api-key` | `upsertApiKeyProfile`과 같은 API 키 온보딩/프로필 쓰기 헬퍼 |
    | `plugin-sdk/provider-auth-result` | 표준 OAuth auth 결과 빌더 |
    | `plugin-sdk/provider-auth-login` | 프로바이더 플러그인을 위한 공유 인터랙티브 로그인 헬퍼 |
    | `plugin-sdk/provider-env-vars` | 프로바이더 auth 환경 변수 조회 헬퍼 |
    | `plugin-sdk/provider-model-shared` | `ProviderReplayFamily`, `buildProviderReplayFamilyHooks`, `normalizeModelCompat`, 공유 재실행 정책 빌더, 프로바이더 엔드포인트 헬퍼, 모델 id 정규화 헬퍼 |
    | `plugin-sdk/provider-catalog-shared` | `findCatalogTemplate`, `buildSingleProviderApiKeyCatalog`, `supportsNativeStreamingUsageCompat`, `applyProviderNativeStreamingUsageCompat` |
    | `plugin-sdk/provider-http` | 범용 프로바이더 HTTP/엔드포인트 역량 헬퍼 |
    | `plugin-sdk/provider-web-fetch` | 웹 fetch 프로바이더 등록/캐시 헬퍼 |
    | `plugin-sdk/provider-web-search-config-contract` | 플러그인 활성화 와이어링이 필요 없는 프로바이더를 위한 좁은 웹 검색 구성/자격 증명 헬퍼 |
    | `plugin-sdk/provider-web-search-contract` | `createWebSearchProviderContractFields`, `enablePluginInConfig`, `resolveProviderWebSearchPluginConfig`, 스코프된 자격 증명 setter/getter를 포함한 좁은 웹 검색 구성/자격 증명 계약 헬퍼 |
    | `plugin-sdk/provider-web-search` | 웹 검색 프로바이더 등록/캐시/런타임 헬퍼 |
    | `plugin-sdk/provider-tools` | `ProviderToolCompatFamily`, `buildProviderToolCompatFamilyHooks`, Gemini 스키마 정리 + 진단, `resolveXaiModelCompatPatch` / `applyXaiModelCompat`를 포함한 xAI 호환성 헬퍼 |
    | `plugin-sdk/provider-usage` | `fetchClaudeUsage` 및 유사 헬퍼 |
    | `plugin-sdk/provider-stream` | `ProviderStreamFamily`, `buildProviderStreamFamilyHooks`, `composeProviderStreamWrappers`, 스트림 래퍼 타입, 공유 Anthropic/Bedrock/Google/Kilocode/Moonshot/OpenAI/OpenRouter/Z.A.I/MiniMax/Copilot 래퍼 헬퍼 |
    | `plugin-sdk/provider-onboard` | 온보딩 구성 패치 헬퍼 |
  </Accordion>

  <Accordion title="Auth 및 보안 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/command-auth` | `resolveControlCommandGate`, 명령 레지스트리 헬퍼, 발신자 인증 헬퍼 |
    | `plugin-sdk/approval-auth-runtime` | 승인자 해결 및 동일 채팅 액션 auth 헬퍼 |
    | `plugin-sdk/approval-client-runtime` | 네이티브 실행 승인 프로필/필터 헬퍼 |
    | `plugin-sdk/approval-delivery-runtime` | 네이티브 승인 역량/delivery 어댑터 |
    | `plugin-sdk/approval-gateway-runtime` | 공유 승인 게이트웨이 해결 헬퍼 |
    | `plugin-sdk/approval-handler-adapter-runtime` | 핫 채널 엔트리포인트를 위한 경량 네이티브 승인 어댑터 로딩 헬퍼 |
    | `plugin-sdk/approval-handler-runtime` | 더 넓은 승인 핸들러 런타임 헬퍼 |
    | `plugin-sdk/approval-native-runtime` | 네이티브 승인 타겟 + 계정 바인딩 헬퍼 |
    | `plugin-sdk/approval-reply-runtime` | 실행/플러그인 승인 답글 페이로드 헬퍼 |
    | `plugin-sdk/allow-from` | `formatAllowFromLowercase` |
    | `plugin-sdk/security-runtime` | 공유 신뢰, DM 게이팅, 외부 콘텐츠, 시크릿 수집 헬퍼 |
    | `plugin-sdk/ssrf-policy` | 호스트 허용 목록 및 사설 네트워크 SSRF 정책 헬퍼 |
    | `plugin-sdk/ssrf-runtime` | 고정 디스패처, SSRF 보호 fetch, SSRF 정책 헬퍼 |
    | `plugin-sdk/secret-input` | 시크릿 입력 파싱 헬퍼 |
    | `plugin-sdk/webhook-ingress` | 웹훅 요청/타겟 헬퍼 |
    | `plugin-sdk/webhook-request-guards` | 요청 본문 크기/타임아웃 헬퍼 |
  </Accordion>

  <Accordion title="런타임 및 스토리지 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/runtime` | 광범위한 런타임/로깅/백업/플러그인 설치 헬퍼 |
    | `plugin-sdk/runtime-env` | 좁은 런타임 환경, 로거, 타임아웃, 재시도, 백오프 헬퍼 |
    | `plugin-sdk/channel-runtime-context` | 범용 채널 런타임 컨텍스트 등록 및 조회 헬퍼 |
    | `plugin-sdk/runtime-store` | `createPluginRuntimeStore` |
    | `plugin-sdk/plugin-runtime` | 공유 플러그인 명령/훅/http/인터랙티브 헬퍼 |
    | `plugin-sdk/hook-runtime` | 공유 웹훅/내부 훅 파이프라인 헬퍼 |
    | `plugin-sdk/lazy-runtime` | `createLazyRuntimeModule`, `createLazyRuntimeMethod`, `createLazyRuntimeSurface`와 같은 지연 런타임 임포트/바인딩 헬퍼 |
    | `plugin-sdk/process-runtime` | 프로세스 실행 헬퍼 |
    | `plugin-sdk/cli-runtime` | CLI 포맷팅, 대기, 버전 헬퍼 |
    | `plugin-sdk/gateway-runtime` | 게이트웨이 클라이언트 및 채널 상태 패치 헬퍼 |
    | `plugin-sdk/config-runtime` | 구성 로드/쓰기 헬퍼 |
    | `plugin-sdk/approval-runtime` | 실행/플러그인 승인 헬퍼, 승인 역량 빌더, auth/프로필 헬퍼, 네이티브 라우팅/런타임 헬퍼 |
    | `plugin-sdk/reply-runtime` | 공유 인바운드/답글 런타임 헬퍼, 청크 분할, 발송, 하트비트, 답글 플래너 |
    | `plugin-sdk/reply-dispatch-runtime` | 좁은 답글 발송/완료 헬퍼 |
    | `plugin-sdk/reply-history` | `buildHistoryContext`, `recordPendingHistoryEntry`, `clearHistoryEntriesIfEnabled`와 같은 공유 단기 답글 기록 헬퍼 |
    | `plugin-sdk/reply-reference` | `createReplyReferencePlanner` |
    | `plugin-sdk/reply-chunking` | 좁은 텍스트/마크다운 청크 분할 헬퍼 |
    | `plugin-sdk/session-store-runtime` | 세션 스토어 경로 + 업데이트 시간 헬퍼 |
    | `plugin-sdk/state-paths` | 상태/OAuth 디렉토리 경로 헬퍼 |
    | `plugin-sdk/routing` | `resolveAgentRoute`, `buildAgentSessionKey`, `resolveDefaultAgentBoundAccountId`와 같은 라우트/세션 키/계정 바인딩 헬퍼 |
    | `plugin-sdk/status-helpers` | 공유 채널/계정 상태 요약 헬퍼, 런타임 상태 기본값, 이슈 메타데이터 헬퍼 |
    | `plugin-sdk/target-resolver-runtime` | 공유 타겟 해결자 헬퍼 |
    | `plugin-sdk/string-normalization-runtime` | 슬러그/문자열 정규화 헬퍼 |
    | `plugin-sdk/request-url` | fetch/요청 유사 입력에서 문자열 URL 추출 |
    | `plugin-sdk/run-command` | 정규화된 stdout/stderr 결과가 있는 시간 제한 명령 러너 |
    | `plugin-sdk/param-readers` | 공통 도구/CLI 파라미터 리더 |
    | `plugin-sdk/tool-payload` | 도구 결과 객체에서 정규화된 페이로드 추출 |
    | `plugin-sdk/tool-send` | 도구 인수에서 표준 전송 타겟 필드 추출 |
    | `plugin-sdk/temp-path` | 공유 임시 다운로드 경로 헬퍼 |
    | `plugin-sdk/logging-core` | 서브시스템 로거 및 수정 헬퍼 |
    | `plugin-sdk/keyed-async-queue` | `KeyedAsyncQueue` |
    | `plugin-sdk/directory-runtime` | 구성 기반 디렉토리 쿼리/중복 제거 |
    | `plugin-sdk/agent-runtime` | 에이전트 디렉토리/아이덴티티/워크스페이스 헬퍼 |
  </Accordion>

  <Accordion title="역량 및 테스팅 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/media-runtime` | 공유 미디어 fetch/변환/저장 헬퍼와 미디어 페이로드 빌더 |
    | `plugin-sdk/media-generation-runtime` | 공유 미디어 생성 폴오버 헬퍼, 후보 선택, 누락 모델 메시지 |
    | `plugin-sdk/media-understanding` | 미디어 이해 프로바이더 타입과 프로바이더 대면 이미지/오디오 헬퍼 내보내기 |
    | `plugin-sdk/text-runtime` | 어시스턴트 가시 텍스트 제거, 마크다운 렌더링/청크/테이블 헬퍼, 수정 헬퍼, 지시 태그 헬퍼, 안전 텍스트 유틸리티와 같은 공유 텍스트/마크다운/로깅 헬퍼 |
    | `plugin-sdk/text-chunking` | 아웃바운드 텍스트 청크 분할 헬퍼 |
    | `plugin-sdk/speech` | 음성 프로바이더 타입과 프로바이더 대면 지시, 레지스트리, 검증 헬퍼 |
    | `plugin-sdk/speech-core` | 공유 음성 프로바이더 타입, 레지스트리, 지시, 정규화 헬퍼 |
    | `plugin-sdk/realtime-transcription` | 실시간 전사 프로바이더 타입 및 레지스트리 헬퍼 |
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
    | `plugin-sdk/zod` | 플러그인 SDK 소비자를 위한 재내보낸 `zod` |
    | `plugin-sdk/testing` | `installCommonResolveTargetErrorCases`, `shouldAckReaction` |
  </Accordion>

  <Accordion title="메모리 서브패스">
    | 서브패스 | 주요 내보내기 |
    | --- | --- |
    | `plugin-sdk/memory-core` | 관리자/구성/파일/CLI 헬퍼를 위한 번들 memory-core 헬퍼 표면 |
    | `plugin-sdk/memory-core-engine-runtime` | 메모리 인덱스/검색 런타임 파사드 |
    | `plugin-sdk/memory-core-host-engine-foundation` | 메모리 호스트 기반 엔진 내보내기 |
    | `plugin-sdk/memory-core-host-engine-embeddings` | 메모리 호스트 임베딩 엔진 내보내기 |
    | `plugin-sdk/memory-core-host-engine-qmd` | 메모리 호스트 QMD 엔진 내보내기 |
    | `plugin-sdk/memory-core-host-engine-storage` | 메모리 호스트 스토리지 엔진 내보내기 |
    | `plugin-sdk/memory-core-host-multimodal` | 메모리 호스트 멀티모달 헬퍼 |
    | `plugin-sdk/memory-core-host-query` | 메모리 호스트 쿼리 헬퍼 |
    | `plugin-sdk/memory-core-host-secret` | 메모리 호스트 시크릿 헬퍼 |
    | `plugin-sdk/memory-core-host-events` | 메모리 호스트 이벤트 저널 헬퍼 |
    | `plugin-sdk/memory-core-host-status` | 메모리 호스트 상태 헬퍼 |
    | `plugin-sdk/memory-core-host-runtime-cli` | 메모리 호스트 CLI 런타임 헬퍼 |
    | `plugin-sdk/memory-core-host-runtime-core` | 메모리 호스트 코어 런타임 헬퍼 |
    | `plugin-sdk/memory-core-host-runtime-files` | 메모리 호스트 파일/런타임 헬퍼 |
    | `plugin-sdk/memory-host-core` | 메모리 호스트 코어 런타임 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-host-events` | 메모리 호스트 이벤트 저널 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-host-files` | 메모리 호스트 파일/런타임 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-host-markdown` | 메모리 인접 플러그인을 위한 공유 관리 마크다운 헬퍼 |
    | `plugin-sdk/memory-host-search` | 검색 관리자 접근을 위한 활성 메모리 런타임 파사드 |
    | `plugin-sdk/memory-host-status` | 메모리 호스트 상태 헬퍼의 벤더 중립 별칭 |
    | `plugin-sdk/memory-lancedb` | 번들 memory-lancedb 헬퍼 표면 |
  </Accordion>
</AccordionGroup>

## 등록 API

`register(api)` 콜백은 다음 메서드를 가진 `OpenClawPluginApi` 객체를 받습니다:

### 역량 등록

| 메서드                                           | 등록 항목                        |
| ------------------------------------------------ | -------------------------------- |
| `api.registerProvider(...)`                      | 텍스트 추론 (LLM)                |
| `api.registerCliBackend(...)`                    | 로컬 CLI 추론 백엔드             |
| `api.registerChannel(...)`                       | 메시징 채널                      |
| `api.registerSpeechProvider(...)`                | TTS / STT 합성                   |
| `api.registerRealtimeTranscriptionProvider(...)` | 스트리밍 실시간 전사             |
| `api.registerRealtimeVoiceProvider(...)`         | 듀플렉스 실시간 음성 세션        |
| `api.registerMediaUnderstandingProvider(...)`    | 이미지/오디오/비디오 분석        |
| `api.registerImageGenerationProvider(...)`       | 이미지 생성                      |
| `api.registerMusicGenerationProvider(...)`       | 음악 생성                        |
| `api.registerVideoGenerationProvider(...)`       | 비디오 생성                      |
| `api.registerWebFetchProvider(...)`              | 웹 fetch / 스크레이프 프로바이더 |
| `api.registerWebSearchProvider(...)`             | 웹 검색                          |

### 도구 및 명령

| 메서드                          | 등록 항목                                     |
| ------------------------------- | --------------------------------------------- |
| `api.registerTool(tool, opts?)` | 에이전트 도구 (필수 또는 `{ optional: true }`) |
| `api.registerCommand(def)`      | 사용자 정의 명령 (LLM 우회)                   |

### 인프라

| 메서드                                         | 등록 항목                           |
| ---------------------------------------------- | ----------------------------------- |
| `api.registerHook(events, handler, opts?)`     | 이벤트 훅                           |
| `api.registerHttpRoute(params)`                | 게이트웨이 HTTP 엔드포인트          |
| `api.registerGatewayMethod(name, handler)`     | 게이트웨이 RPC 메서드               |
| `api.registerCli(registrar, opts?)`            | CLI 하위 명령                       |
| `api.registerService(service)`                 | 백그라운드 서비스                   |
| `api.registerInteractiveHandler(registration)` | 인터랙티브 핸들러                   |
| `api.registerMemoryPromptSupplement(builder)`  | 추가적인 메모리 인접 프롬프트 섹션  |
| `api.registerMemoryCorpusSupplement(adapter)`  | 추가적인 메모리 검색/읽기 코퍼스    |

예약된 코어 관리자 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`, `update.*`)는 플러그인이 더 좁은 게이트웨이 메서드 스코프를 할당하려 해도 항상 `operator.admin`으로 유지됩니다. 플러그인 소유 메서드에는 플러그인별 접두사를 선호하십시오.

### CLI 등록 메타데이터

`api.registerCli(registrar, opts?)`는 두 가지 유형의 최상위 메타데이터를 허용합니다:

- `commands`: 레지스트라가 소유하는 명시적 명령 루트
- `descriptors`: 루트 CLI 도움말, 라우팅, 지연 플러그인 CLI 등록에 사용되는 파싱 시간 명령 디스크립터

레지스트라가 노출하는 모든 최상위 명령 루트를 포함하는 `descriptors`를 제공하면 플러그인 명령이 일반 루트 CLI 경로에서 지연 로드 상태를 유지할 수 있습니다.

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

지연 루트 CLI 등록이 필요하지 않을 때만 단독으로 `commands`를 사용하십시오. 해당 즉시 실행 호환성 경로는 여전히 지원되지만, 파싱 시간 지연 로딩을 위한 디스크립터 기반 플레이스홀더를 설치하지 않습니다.

### CLI 백엔드 등록

`api.registerCliBackend(...)`는 플러그인이 `codex-cli`와 같은 로컬 AI CLI 백엔드의 기본 구성을 소유하도록 합니다.

- 백엔드 `id`는 `codex-cli/gpt-5`와 같은 모델 참조에서 프로바이더 접두사가 됩니다.
- 백엔드 `config`는 `agents.defaults.cliBackends.<id>`와 동일한 형태를 사용합니다.
- 사용자 구성이 우선됩니다. OpenClaw는 CLI 실행 전에 플러그인 기본값 위에 `agents.defaults.cliBackends.<id>`를 병합합니다.
- 병합 후 백엔드에 호환성 재작성이 필요하면 `normalizeConfig`를 사용하십시오.

### 독점 슬롯

| 메서드                                     | 등록 항목                                                                                                                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.registerContextEngine(id, factory)`   | 컨텍스트 엔진(한 번에 하나만 활성). `assemble()` 콜백은 `availableTools`와 `citationsMode`를 받아 엔진이 프롬프트 추가를 조정할 수 있습니다. |
| `api.registerMemoryCapability(capability)` | 통합 메모리 역량                                                                                                                                               |
| `api.registerMemoryPromptSection(builder)` | 메모리 프롬프트 섹션 빌더                                                                                                                                      |
| `api.registerMemoryFlushPlan(resolver)`    | 메모리 플러시 계획 해결자                                                                                                                                      |
| `api.registerMemoryRuntime(runtime)`       | 메모리 런타임 어댑터                                                                                                                                           |

### 메모리 임베딩 어댑터

| 메서드                                         | 등록 항목                                   |
| ---------------------------------------------- | ------------------------------------------- |
| `api.registerMemoryEmbeddingProvider(adapter)` | 활성 플러그인을 위한 메모리 임베딩 어댑터   |

### 이벤트 및 수명 주기

| 메서드                                       | 수행 작업                        |
| -------------------------------------------- | -------------------------------- |
| `api.on(hookName, handler, opts?)`           | 타입된 수명 주기 훅              |
| `api.onConversationBindingResolved(handler)` | 대화 바인딩 콜백                 |

### 훅 결정 의미론

- `before_tool_call`: `{ block: true }` 반환은 종료 처리입니다. 핸들러가 설정하면 낮은 우선순위 핸들러는 건너뜁니다.
- `before_tool_call`: `{ block: false }` 반환은 결정 없음(블록 생략과 동일)으로 처리되며 재정의가 아닙니다.
- `before_install`: `{ block: true }` 반환은 종료 처리입니다. 핸들러가 설정하면 낮은 우선순위 핸들러는 건너뜁니다.
- `before_install`: `{ block: false }` 반환은 결정 없음으로 처리되며 재정의가 아닙니다.
- `reply_dispatch`: `{ handled: true, ... }` 반환은 종료 처리입니다. 핸들러가 발송을 선언하면 낮은 우선순위 핸들러와 기본 모델 발송 경로는 건너뜁니다.
- `message_sending`: `{ cancel: true }` 반환은 종료 처리입니다. 핸들러가 설정하면 낮은 우선순위 핸들러는 건너뜁니다.
- `message_sending`: `{ cancel: false }` 반환은 결정 없음으로 처리되며 재정의가 아닙니다.

### API 객체 필드

| 필드                     | 타입                      | 설명                                                                                          |
| ------------------------ | ------------------------- | --------------------------------------------------------------------------------------------- |
| `api.id`                 | `string`                  | 플러그인 id                                                                                   |
| `api.name`               | `string`                  | 표시 이름                                                                                     |
| `api.version`            | `string?`                 | 플러그인 버전 (선택 사항)                                                                     |
| `api.description`        | `string?`                 | 플러그인 설명 (선택 사항)                                                                     |
| `api.source`             | `string`                  | 플러그인 소스 경로                                                                            |
| `api.rootDir`            | `string?`                 | 플러그인 루트 디렉토리 (선택 사항)                                                            |
| `api.config`             | `OpenClawConfig`          | 현재 구성 스냅샷(사용 가능할 때 활성 인메모리 런타임 스냅샷)                                 |
| `api.pluginConfig`       | `Record<string, unknown>` | `plugins.entries.<id>.config`의 플러그인별 구성                                               |
| `api.runtime`            | `PluginRuntime`           | [런타임 헬퍼](/plugins/sdk-runtime)                                                           |
| `api.logger`             | `PluginLogger`            | 스코프된 로거 (`debug`, `info`, `warn`, `error`)                                              |
| `api.registrationMode`   | `PluginRegistrationMode`  | 현재 로드 모드; `"setup-runtime"`은 경량 사전 전체 엔트리 시작/setup 창입니다                 |
| `api.resolvePath(input)` | `(string) => string`      | 플러그인 루트에 상대적인 경로 해결                                                             |

## 내부 모듈 규칙

플러그인 내에서 내부 임포트에 로컬 배럴 파일을 사용하십시오:

```
my-plugin/
  api.ts            # 외부 소비자를 위한 공개 내보내기
  runtime-api.ts    # 내부 전용 런타임 내보내기
  index.ts          # 플러그인 엔트리포인트
  setup-entry.ts    # 경량 setup 전용 엔트리 (선택 사항)
```

<Warning>
  프로덕션 코드에서 `openclaw/plugin-sdk/<your-plugin>`을 통해 자신의 플러그인을 임포트하지 마십시오.
  내부 임포트는 `./api.ts` 또는 `./runtime-api.ts`를 통해 라우팅하십시오. SDK 경로는 외부 계약 전용입니다.
</Warning>

## 관련 문서

- [엔트리포인트](/plugins/sdk-entrypoints) — `definePluginEntry` 및 `defineChannelPluginEntry` 옵션
- [런타임 헬퍼](/plugins/sdk-runtime) — 전체 `api.runtime` 네임스페이스 레퍼런스
- [Setup 및 구성](/plugins/sdk-setup) — 패키징, 매니페스트, 구성 스키마
- [테스팅](/plugins/sdk-testing) — 테스트 유틸리티 및 린트 규칙
- [SDK 마이그레이션](/plugins/sdk-migration) — 더 이상 사용 권장하지 않는 표면에서 마이그레이션
- [플러그인 내부 구조](/plugins/architecture) — 깊은 아키텍처 및 역량 모델
