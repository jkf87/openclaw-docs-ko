---
summary: "플러그인 아키텍처 내부 구조: 로드 파이프라인, 레지스트리, 런타임 훅, HTTP 라우트, 레퍼런스 표"
read_when:
  - 프로바이더 런타임 훅, 채널 수명 주기 또는 패키지 팩을 구현할 때
  - 플러그인 로드 순서 또는 레지스트리 상태를 디버깅할 때
  - 새로운 플러그인 capability 또는 컨텍스트 엔진 플러그인을 추가할 때
title: "플러그인 아키텍처 내부 구조"
---

공개 capability 모델, 플러그인 형태, 소유권/실행 계약에 대해서는
[플러그인 아키텍처](/plugins/architecture)를 참조하십시오. 이 페이지는
로드 파이프라인, 레지스트리, 런타임 훅, 게이트웨이 HTTP 라우트, 임포트 경로,
스키마 표 등 내부 메커니즘에 대한 레퍼런스입니다.

## 로드 파이프라인

시작 시 OpenClaw는 대략 다음 과정을 수행합니다:

1. 후보 플러그인 루트를 발견합니다
2. 네이티브 또는 호환 번들 매니페스트와 패키지 메타데이터를 읽습니다
3. 안전하지 않은 후보를 거부합니다
4. 플러그인 구성(`plugins.enabled`, `allow`, `deny`, `entries`,
   `slots`, `load.paths`)을 정규화합니다
5. 각 후보의 활성화 여부를 결정합니다
6. 활성화된 네이티브 모듈을 로드합니다: 빌드된 번들 모듈은 네이티브 로더를 사용하고,
   빌드되지 않은 네이티브 플러그인은 jiti를 사용합니다
7. 네이티브 `register(api)` 훅을 호출하고 등록을 플러그인 레지스트리로 수집합니다
8. 레지스트리를 명령/런타임 표면에 노출합니다

<Note>
`activate`는 `register`의 레거시 별칭입니다 — 로더는 존재하는 쪽을 해결(`def.register ?? def.activate`)하여 같은 시점에 호출합니다. 모든 번들 플러그인은 `register`를 사용합니다; 새 플러그인은 `register`를 선호하십시오.
</Note>

안전 게이트는 런타임 실행 **이전에** 수행됩니다. 엔트리가 플러그인 루트를
벗어나거나, 경로가 world-writable이거나, 번들이 아닌 플러그인에서 경로 소유권이
의심스러워 보이면 후보가 차단됩니다.

### 매니페스트 우선 동작

매니페스트는 컨트롤 플레인의 신뢰 원천입니다. OpenClaw는 이를 다음 용도로 사용합니다:

- 플러그인 식별
- 선언된 channel/skill/구성 스키마 또는 번들 capability 발견
- `plugins.entries.<id>.config` 검증
- Control UI 라벨/플레이스홀더 보강
- 설치/카탈로그 메타데이터 표시
- 플러그인 런타임을 로드하지 않고도 저비용 활성화 및 setup 디스크립터 유지

네이티브 플러그인의 경우, 런타임 모듈이 데이터 플레인 부분입니다. 훅, 도구,
명령 또는 프로바이더 플로우 같은 실제 동작을 등록합니다.

선택적 매니페스트 `activation` 및 `setup` 블록은 컨트롤 플레인에 머무릅니다.
이들은 활성화 계획 및 setup 발견을 위한 메타데이터 전용 디스크립터입니다;
런타임 등록, `register(...)`, 또는 `setupEntry`를 대체하지 않습니다.
최초의 라이브 활성화 소비자들은 이제 매니페스트의 명령, 채널, 프로바이더
힌트를 사용해 더 넓은 레지스트리 머터리얼라이제이션 이전에 플러그인 로딩을 좁힙니다:

- CLI 로딩은 요청된 주 명령을 소유하는 플러그인으로 좁혀집니다
- 채널 setup/플러그인 해결은 요청된 채널 id를 소유하는 플러그인으로 좁혀집니다
- 명시적 프로바이더 setup/런타임 해결은 요청된 프로바이더 id를 소유하는
  플러그인으로 좁혀집니다

활성화 플래너는 기존 호출자를 위한 id만 반환하는 API와 새로운 진단을 위한
plan API를 모두 제공합니다. Plan 엔트리는 플러그인이 선택된 이유를 보고하며,
명시적 `activation.*` 플래너 힌트와 `providers`, `channels`, `commandAliases`,
`setup.providers`, `contracts.tools`, 훅과 같은 매니페스트 소유권 폴백을
분리합니다. 이 이유 분리가 호환성 경계입니다: 기존 플러그인 메타데이터는 계속
작동하며, 새 코드는 런타임 로딩 의미를 바꾸지 않고도 광범위한 힌트나
폴백 동작을 감지할 수 있습니다.

Setup 발견은 이제 `setup.providers` 및 `setup.cliBackends` 같은 디스크립터
소유 id를 선호하여 후보 플러그인을 좁힌 뒤, setup 시점 런타임 훅이 여전히
필요한 플러그인에 대해 `setup-api`로 폴백합니다. 발견된 여러 플러그인이 동일한
정규화된 setup 프로바이더나 CLI 백엔드 id를 주장하면, setup 조회는 발견
순서에 의존하는 대신 모호한 소유자를 거부합니다.

### 로더가 캐싱하는 항목

OpenClaw는 다음에 대해 짧은 인프로세스 캐시를 유지합니다:

- 발견 결과
- 매니페스트 레지스트리 데이터
- 로드된 플러그인 레지스트리

이 캐시들은 돌발적인 시작 부하와 반복되는 명령 오버헤드를 줄여줍니다.
영속성이 아니라 단기 성능 캐시로 생각하면 안전합니다.

성능 참고 사항:

- `OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE=1` 또는
  `OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE=1`을 설정하여 이 캐시들을 비활성화합니다.
- `OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS` 및
  `OPENCLAW_PLUGIN_MANIFEST_CACHE_MS`로 캐시 윈도우를 조정합니다.

## 레지스트리 모델

로드된 플러그인은 무작위 코어 전역을 직접 변경하지 않습니다. 중앙 플러그인
레지스트리에 등록합니다.

레지스트리는 다음을 추적합니다:

- 플러그인 레코드 (아이덴티티, 소스, 출처, 상태, 진단)
- 도구
- 레거시 훅 및 타입된 훅
- 채널
- 프로바이더
- 게이트웨이 RPC 핸들러
- HTTP 라우트
- CLI 레지스트라
- 백그라운드 서비스
- 플러그인 소유 명령

코어 기능은 그런 다음 플러그인 모듈과 직접 대화하는 대신 해당 레지스트리에서
읽습니다. 이로써 로딩이 단방향으로 유지됩니다:

- 플러그인 모듈 -> 레지스트리 등록
- 코어 런타임 -> 레지스트리 소비

이 분리는 유지보수성 측면에서 중요합니다. 대부분의 코어 표면이 "모든 플러그인
모듈을 특수 처리"하는 대신 "레지스트리를 읽는다"는 하나의 통합 지점만
필요하다는 의미이기 때문입니다.

## 대화 바인딩 콜백

대화를 바인딩하는 플러그인은 승인이 해결될 때 반응할 수 있습니다.

`api.onConversationBindingResolved(...)`를 사용하여 바인드 요청이 승인되거나
거부된 후 콜백을 받습니다:

```ts
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

- `status`: `"approved"` 또는 `"denied"`
- `decision`: `"allow-once"`, `"allow-always"`, 또는 `"deny"`
- `binding`: 승인된 요청에 대한 해결된 바인딩
- `request`: 원본 요청 요약, 분리 힌트, 발신자 id,
  대화 메타데이터

이 콜백은 알림 전용입니다. 누가 대화를 바인딩할 수 있는지를 변경하지 않으며,
코어 승인 처리가 끝난 후에 실행됩니다.

## 프로바이더 런타임 훅

프로바이더 플러그인은 세 가지 계층을 가집니다:

- **매니페스트 메타데이터**는 저비용 사전 런타임 조회용입니다: `providerAuthEnvVars`,
  `providerAuthAliases`, `providerAuthChoices`, `channelEnvVars`.
- **구성 시점 훅**: `catalog` (레거시 `discovery`) 및
  `applyConfigDefaults`.
- **런타임 훅**: auth, 모델 해결, 스트림 래핑, thinking 레벨, 재실행 정책,
  사용량 엔드포인트를 다루는 40개 이상의 선택적 훅. 전체 목록은
  [훅 순서 및 사용법](#hook-order-and-usage)을 참조하십시오.

OpenClaw는 여전히 일반 에이전트 루프, 페일오버, 트랜스크립트 처리, 도구 정책을
소유합니다. 이 훅들은 완전한 커스텀 추론 transport 없이도 프로바이더별 동작을
위한 확장 표면입니다.

프로바이더가 일반 auth/status/모델 피커 경로가 플러그인 런타임을 로드하지 않고도
볼 수 있어야 하는 env 기반 자격 증명을 가질 때 매니페스트 `providerAuthEnvVars`를
사용하십시오. 한 프로바이더 id가 다른 프로바이더 id의 env 변수, auth 프로필,
구성 기반 auth, API 키 온보딩 선택을 재사용해야 할 때 매니페스트
`providerAuthAliases`를 사용하십시오. 온보딩/auth-choice CLI 표면이 프로바이더
런타임을 로드하지 않고도 프로바이더의 선택 id, 그룹 라벨, 단순 one-flag auth
와이어링을 알아야 할 때 매니페스트 `providerAuthChoices`를 사용하십시오.
프로바이더 런타임 `envVars`는 온보딩 라벨이나 OAuth client-id/client-secret
setup 변수 같은 운영자 대면 힌트용으로 유지하십시오.

채널이 일반 shell-env 폴백, config/status 체크, 또는 setup 프롬프트가 채널
런타임을 로드하지 않고도 볼 수 있어야 하는 env 기반 auth 또는 setup을 가질 때
매니페스트 `channelEnvVars`를 사용하십시오.

### 훅 순서 및 사용법

모델/프로바이더 플러그인의 경우, OpenClaw는 이 대략적인 순서로 훅을 호출합니다.
"사용 시기" 열은 빠른 의사결정 가이드입니다.

| #   | 훅                                | 수행 작업                                                                                                       | 사용 시기                                                                                                                                          |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `catalog`                         | `models.json` 생성 중 프로바이더 구성을 `models.providers`에 게시                                              | 프로바이더가 카탈로그 또는 기본 URL 기본값을 소유할 때                                                                                            |
| 2   | `applyConfigDefaults`             | 구성 머터리얼라이제이션 중 프로바이더 소유 전역 구성 기본값 적용                                                | 기본값이 auth 모드, env, 또는 프로바이더 모델 패밀리 의미에 따라 달라질 때                                                                        |
| --  | _(내장 모델 조회)_                | OpenClaw가 먼저 일반 레지스트리/카탈로그 경로를 시도                                                            | _(플러그인 훅이 아님)_                                                                                                                             |
| 3   | `normalizeModelId`                | 조회 전 레거시 또는 프리뷰 모델 id 별칭 정규화                                                                  | 프로바이더가 표준 모델 해결 전에 별칭 정리를 소유할 때                                                                                            |
| 4   | `normalizeTransport`              | 일반 모델 조립 전에 프로바이더 패밀리 `api` / `baseUrl` 정규화                                                  | 프로바이더가 같은 transport 패밀리 내 커스텀 프로바이더 id에 대해 transport 정리를 소유할 때                                                      |
| 5   | `normalizeConfig`                 | 런타임/프로바이더 해결 전 `models.providers.<id>` 정규화                                                        | 프로바이더가 플러그인과 함께 있어야 하는 구성 정리가 필요할 때; 번들 Google 패밀리 헬퍼도 지원되는 Google 구성 엔트리를 백스탑                      |
| 6   | `applyNativeStreamingUsageCompat` | 구성 프로바이더에 네이티브 스트리밍 사용량 호환성 재작성 적용                                                   | 프로바이더가 엔드포인트 기반 네이티브 스트리밍 사용량 메타데이터 수정이 필요할 때                                                                 |
| 7   | `resolveConfigApiKey`             | 런타임 auth 로딩 전에 구성 프로바이더의 env 마커 auth 해결                                                      | 프로바이더가 프로바이더 소유 env 마커 API 키 해결을 가질 때; `amazon-bedrock`은 여기에 내장 AWS env 마커 리졸버도 있음                             |
| 8   | `resolveSyntheticAuth`            | 평문을 영속화하지 않고 로컬/셀프 호스팅 또는 구성 기반 auth 표면화                                              | 프로바이더가 합성/로컬 자격 증명 마커로 작동할 수 있을 때                                                                                         |
| 9   | `resolveExternalAuthProfiles`     | 프로바이더 소유 외부 auth 프로필을 오버레이; CLI/앱 소유 자격 증명의 기본 `persistence`는 `runtime-only`        | 프로바이더가 복사된 refresh token을 영속화하지 않고 외부 auth 자격 증명을 재사용할 때; 매니페스트에 `contracts.externalAuthProviders` 선언         |
| 10  | `shouldDeferSyntheticProfileAuth` | 저장된 합성 프로필 플레이스홀더를 env/구성 기반 auth 뒤로 낮춤                                                  | 프로바이더가 우선순위에서 이기면 안 되는 합성 플레이스홀더 프로필을 저장할 때                                                                      |
| 11  | `resolveDynamicModel`             | 아직 로컬 레지스트리에 없는 프로바이더 소유 모델 id에 대한 동기 폴백                                            | 프로바이더가 임의의 업스트림 모델 id를 허용할 때                                                                                                  |
| 12  | `prepareDynamicModel`             | 비동기 워밍업, 그 뒤 `resolveDynamicModel`이 다시 실행                                                          | 프로바이더가 알 수 없는 id를 해결하기 전에 네트워크 메타데이터가 필요할 때                                                                        |
| 13  | `normalizeResolvedModel`          | 임베디드 러너가 해결된 모델을 사용하기 전 최종 재작성                                                           | 프로바이더가 transport 재작성이 필요하지만 여전히 코어 transport를 사용할 때                                                                      |
| 14  | `contributeResolvedModelCompat`   | 다른 호환 transport 뒤의 벤더 모델에 대한 compat 플래그 기여                                                    | 프로바이더가 프로바이더를 인수하지 않고도 프록시 transport에서 자신의 모델을 인식할 때                                                           |
| 15  | `capabilities`                    | 공유 코어 로직에서 사용하는 프로바이더 소유 트랜스크립트/툴링 메타데이터                                         | 프로바이더가 트랜스크립트/프로바이더 패밀리 특이사항이 필요할 때                                                                                  |
| 16  | `normalizeToolSchemas`            | 임베디드 러너가 보기 전에 도구 스키마 정규화                                                                    | 프로바이더가 transport 패밀리 스키마 정리가 필요할 때                                                                                             |
| 17  | `inspectToolSchemas`              | 정규화 후 프로바이더 소유 스키마 진단 표면화                                                                    | 프로바이더가 코어에 프로바이더별 규칙을 가르치지 않고 키워드 경고를 원할 때                                                                      |
| 18  | `resolveReasoningOutputMode`      | 네이티브 vs 태그된 reasoning 출력 계약 선택                                                                     | 프로바이더가 네이티브 필드 대신 태그된 reasoning/최종 출력이 필요할 때                                                                            |
| 19  | `prepareExtraParams`              | 일반 스트림 옵션 래퍼 전의 요청 파라미터 정규화                                                                 | 프로바이더가 기본 요청 파라미터 또는 프로바이더별 파라미터 정리가 필요할 때                                                                      |
| 20  | `createStreamFn`                  | 일반 스트림 경로를 커스텀 transport로 완전히 대체                                                               | 프로바이더가 단순 래퍼가 아닌 커스텀 와이어 프로토콜이 필요할 때                                                                                  |
| 21  | `wrapStreamFn`                    | 일반 래퍼 적용 후의 스트림 래퍼                                                                                 | 프로바이더가 커스텀 transport 없이 요청 헤더/본문/모델 compat 래퍼가 필요할 때                                                                   |
| 22  | `resolveTransportTurnState`       | 네이티브 턴별 transport 헤더 또는 메타데이터 첨부                                                               | 프로바이더가 일반 transport가 프로바이더 네이티브 턴 아이덴티티를 보내길 원할 때                                                                  |
| 23  | `resolveWebSocketSessionPolicy`   | 네이티브 WebSocket 헤더 또는 세션 쿨다운 정책 첨부                                                              | 프로바이더가 일반 WS transport가 세션 헤더 또는 폴백 정책을 튜닝하길 원할 때                                                                      |
| 24  | `formatApiKey`                    | Auth 프로필 포매터: 저장된 프로필이 런타임 `apiKey` 문자열이 됨                                                 | 프로바이더가 추가 auth 메타데이터를 저장하고 커스텀 런타임 토큰 형태가 필요할 때                                                                 |
| 25  | `refreshOAuth`                    | 커스텀 refresh 엔드포인트 또는 refresh 실패 정책을 위한 OAuth refresh 오버라이드                                | 프로바이더가 공유 `pi-ai` refresher에 맞지 않을 때                                                                                                 |
| 26  | `buildAuthDoctorHint`             | OAuth refresh 실패 시 추가되는 복구 힌트                                                                        | 프로바이더가 refresh 실패 후 프로바이더 소유 auth 복구 지침이 필요할 때                                                                           |
| 27  | `matchesContextOverflowError`     | 프로바이더 소유 컨텍스트 윈도우 오버플로우 매처                                                                 | 프로바이더가 일반 휴리스틱이 놓칠 수 있는 원시 오버플로우 에러를 가질 때                                                                          |
| 28  | `classifyFailoverReason`          | 프로바이더 소유 페일오버 사유 분류                                                                              | 프로바이더가 원시 API/transport 에러를 rate-limit/overload/기타로 매핑할 수 있을 때                                                              |
| 29  | `isCacheTtlEligible`              | 프록시/백홀 프로바이더를 위한 프롬프트 캐시 정책                                                                | 프로바이더가 프록시별 캐시 TTL 게이팅이 필요할 때                                                                                                 |
| 30  | `buildMissingAuthMessage`         | 일반 missing-auth 복구 메시지 대체                                                                              | 프로바이더가 프로바이더별 missing-auth 복구 힌트가 필요할 때                                                                                      |
| 31  | `suppressBuiltInModel`            | 오래된 업스트림 모델 억제 및 선택적 사용자 대면 에러 힌트                                                       | 프로바이더가 오래된 업스트림 행을 숨기거나 벤더 힌트로 대체해야 할 때                                                                             |
| 32  | `augmentModelCatalog`             | 발견 후 추가되는 합성/최종 카탈로그 행                                                                          | 프로바이더가 `models list` 및 피커에 합성 forward-compat 행이 필요할 때                                                                          |
| 33  | `resolveThinkingProfile`          | 모델별 `/think` 레벨 세트, 표시 라벨, 기본값                                                                    | 프로바이더가 선택된 모델에 대해 커스텀 thinking 래더 또는 바이너리 라벨을 노출할 때                                                              |
| 34  | `isBinaryThinking`                | On/off reasoning 토글 호환성 훅                                                                                 | 프로바이더가 바이너리 thinking on/off만 노출할 때                                                                                                 |
| 35  | `supportsXHighThinking`           | `xhigh` reasoning 지원 호환성 훅                                                                                | 프로바이더가 모델의 하위 집합에서만 `xhigh`를 원할 때                                                                                             |
| 36  | `resolveDefaultThinkingLevel`     | 기본 `/think` 레벨 호환성 훅                                                                                    | 프로바이더가 모델 패밀리의 기본 `/think` 정책을 소유할 때                                                                                         |
| 37  | `isModernModelRef`                | 라이브 프로필 필터 및 스모크 선택을 위한 모던 모델 매처                                                         | 프로바이더가 라이브/스모크 선호 모델 매칭을 소유할 때                                                                                             |
| 38  | `prepareRuntimeAuth`              | 추론 직전에 구성된 자격 증명을 실제 런타임 토큰/키로 교환                                                       | 프로바이더가 토큰 교환 또는 단기 요청 자격 증명이 필요할 때                                                                                       |
| 39  | `resolveUsageAuth`                | `/usage` 및 관련 상태 표면에 대한 사용량/청구 자격 증명 해결                                                    | 프로바이더가 커스텀 사용량/쿼터 토큰 파싱 또는 다른 사용량 자격 증명이 필요할 때                                                                 |
| 40  | `fetchUsageSnapshot`              | auth 해결 후 프로바이더별 사용량/쿼터 스냅샷 fetch 및 정규화                                                    | 프로바이더가 프로바이더별 사용량 엔드포인트 또는 페이로드 파서가 필요할 때                                                                        |
| 41  | `createEmbeddingProvider`         | 메모리/검색을 위한 프로바이더 소유 임베딩 어댑터 구축                                                           | 메모리 임베딩 동작이 프로바이더 플러그인에 속할 때                                                                                                |
| 42  | `buildReplayPolicy`               | 프로바이더의 트랜스크립트 처리를 제어하는 재실행 정책 반환                                                      | 프로바이더가 커스텀 트랜스크립트 정책이 필요할 때 (예: thinking 블록 제거)                                                                        |
| 43  | `sanitizeReplayHistory`           | 일반 트랜스크립트 정리 후 재실행 기록 재작성                                                                    | 프로바이더가 공유 압축 헬퍼를 넘는 프로바이더별 재실행 재작성이 필요할 때                                                                        |
| 44  | `validateReplayTurns`             | 임베디드 러너 전 최종 재실행 턴 검증 또는 재구성                                                                | 프로바이더 transport가 일반 sanitation 후 더 엄격한 턴 검증이 필요할 때                                                                           |
| 45  | `onModelSelected`                 | 프로바이더 소유 선택 후 부작용 실행                                                                             | 모델이 활성화될 때 프로바이더가 텔레메트리 또는 프로바이더 소유 상태가 필요할 때                                                                 |

`normalizeModelId`, `normalizeTransport`, `normalizeConfig`는 먼저 매칭된
프로바이더 플러그인을 체크한 뒤, 실제로 모델 id 또는 transport/구성을 변경하는
것이 나타날 때까지 다른 훅 가능 프로바이더 플러그인을 폴스루(fall through)합니다.
이로써 호출자가 번들 플러그인 중 어느 것이 재작성을 소유하는지 알 필요 없이
별칭/compat 프로바이더 쉼(shim)이 계속 작동합니다. 프로바이더 훅이 지원되는
Google 패밀리 구성 엔트리를 재작성하지 않으면, 번들 Google 구성 정규화기가
여전히 그 호환성 정리를 적용합니다.

프로바이더가 완전히 커스텀 와이어 프로토콜 또는 커스텀 요청 실행기가 필요하다면,
이는 다른 클래스의 확장입니다. 이 훅들은 OpenClaw의 일반 추론 루프에서 여전히
실행되는 프로바이더 동작을 위한 것입니다.

### 프로바이더 예제

```ts
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

### 내장 예제

번들 프로바이더 플러그인은 각 벤더의 카탈로그, auth, thinking, 재실행, 사용량
요구에 맞게 위의 훅들을 조합합니다. 권위 있는 훅 세트는 `extensions/`에 있는
각 플러그인과 함께 위치합니다; 이 페이지는 목록을 미러링하기보다 형태를
보여줍니다.

<AccordionGroup>
  <Accordion title="Pass-through 카탈로그 프로바이더">
    OpenRouter, Kilocode, Z.AI, xAI는 `catalog`에 더해
    `resolveDynamicModel` / `prepareDynamicModel`을 등록하여 OpenClaw의
    정적 카탈로그 이전에 업스트림 모델 id를 표면화할 수 있습니다.
  </Accordion>
  <Accordion title="OAuth 및 사용량 엔드포인트 프로바이더">
    GitHub Copilot, Gemini CLI, ChatGPT Codex, MiniMax, Xiaomi, z.ai는
    `prepareRuntimeAuth` 또는 `formatApiKey`를 `resolveUsageAuth` +
    `fetchUsageSnapshot`과 쌍으로 두어 토큰 교환과 `/usage` 통합을 소유합니다.
  </Accordion>
  <Accordion title="재실행 및 트랜스크립트 정리 패밀리">
    공유 명명된 패밀리(`google-gemini`, `passthrough-gemini`,
    `anthropic-by-model`, `hybrid-anthropic-openai`)는 각 플러그인이 정리를
    다시 구현하는 대신 `buildReplayPolicy`를 통해 프로바이더가 트랜스크립트
    정책을 선택할 수 있게 합니다.
  </Accordion>
  <Accordion title="카탈로그 전용 프로바이더">
    `byteplus`, `cloudflare-ai-gateway`, `huggingface`, `kimi-coding`, `nvidia`,
    `qianfan`, `synthetic`, `together`, `venice`, `vercel-ai-gateway`,
    `volcengine`은 `catalog`만 등록하고 공유 추론 루프를 탑니다.
  </Accordion>
  <Accordion title="Anthropic 전용 스트림 헬퍼">
    Beta 헤더, `/fast` / `serviceTier`, `context1m`은 일반 SDK가 아니라
    Anthropic 플러그인의 공개 `api.ts` / `contract-api.ts` 이음새
    (`wrapAnthropicProviderStream`, `resolveAnthropicBetas`,
    `resolveAnthropicFastMode`, `resolveAnthropicServiceTier`) 안에 있습니다.
  </Accordion>
</AccordionGroup>

## 런타임 헬퍼

플러그인은 `api.runtime`을 통해 선택된 코어 헬퍼에 접근할 수 있습니다. TTS의 경우:

```ts
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

참고 사항:

- `textToSpeech`는 파일/음성 노트 표면을 위한 일반 코어 TTS 출력 페이로드를 반환합니다.
- 코어 `messages.tts` 구성 및 프로바이더 선택을 사용합니다.
- PCM 오디오 버퍼 + 샘플 레이트를 반환합니다. 플러그인은 프로바이더를 위해 리샘플/인코딩해야 합니다.
- `listVoices`는 프로바이더별로 선택 사항입니다. 벤더 소유 음성 피커 또는 setup 플로우에 사용하십시오.
- 음성 목록에는 프로바이더 인식 피커를 위한 로케일, 성별, 성격 태그 같은 더 풍부한 메타데이터가 포함될 수 있습니다.
- OpenAI와 ElevenLabs는 오늘날 전화 통신(telephony)을 지원합니다. Microsoft는 지원하지 않습니다.

플러그인은 또한 `api.registerSpeechProvider(...)`를 통해 음성 프로바이더를 등록할 수 있습니다.

```ts
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

참고 사항:

- TTS 정책, 폴백, 답글 전달은 코어에 유지하십시오.
- 벤더 소유 합성 동작에는 음성 프로바이더를 사용하십시오.
- 레거시 Microsoft `edge` 입력은 `microsoft` 프로바이더 id로 정규화됩니다.
- 선호되는 소유권 모델은 회사 지향적입니다: 하나의 벤더 플러그인이 OpenClaw가
  해당 capability 계약을 추가함에 따라 텍스트, 음성, 이미지 및 향후 미디어
  프로바이더를 소유할 수 있습니다.

이미지/오디오/비디오 이해를 위해 플러그인은 일반 key/value 백(bag) 대신
하나의 타입된 media-understanding 프로바이더를 등록합니다:

```ts
api.registerMediaUnderstandingProvider({
  id: "google",
  capabilities: ["image", "audio", "video"],
  describeImage: async (req) => ({ text: "..." }),
  transcribeAudio: async (req) => ({ text: "..." }),
  describeVideo: async (req) => ({ text: "..." }),
});
```

참고 사항:

- 오케스트레이션, 폴백, 구성, 채널 와이어링은 코어에 유지하십시오.
- 벤더 동작은 프로바이더 플러그인에 유지하십시오.
- 추가 확장은 타입을 유지해야 합니다: 새로운 선택적 메서드, 새로운 선택적
  결과 필드, 새로운 선택적 capability.
- 비디오 생성은 이미 동일한 패턴을 따릅니다:
  - 코어가 capability 계약과 런타임 헬퍼를 소유합니다
  - 벤더 플러그인이 `api.registerVideoGenerationProvider(...)`를 등록합니다
  - feature/channel 플러그인이 `api.runtime.videoGeneration.*`을 소비합니다

media-understanding 런타임 헬퍼의 경우, 플러그인은 다음을 호출할 수 있습니다:

```ts
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

오디오 전사의 경우, 플러그인은 media-understanding 런타임 또는 이전 STT 별칭을
사용할 수 있습니다:

```ts
const { text } = await api.runtime.mediaUnderstanding.transcribeAudioFile({
  filePath: "/tmp/inbound-audio.ogg",
  cfg: api.config,
  // Optional when MIME cannot be inferred reliably:
  mime: "audio/ogg",
});
```

참고 사항:

- `api.runtime.mediaUnderstanding.*`은 이미지/오디오/비디오 이해를 위한 선호되는
  공유 표면입니다.
- 코어 media-understanding 오디오 구성(`tools.media.audio`)과 프로바이더 폴백 순서를 사용합니다.
- 전사 출력이 생성되지 않을 때 `{ text: undefined }`를 반환합니다 (예: 건너뛴/지원되지 않는 입력).
- `api.runtime.stt.transcribeAudioFile(...)`은 호환성 별칭으로 남아 있습니다.

플러그인은 또한 `api.runtime.subagent`를 통해 백그라운드 서브에이전트 실행을
시작할 수 있습니다:

```ts
const result = await api.runtime.subagent.run({
  sessionKey: "agent:main:subagent:search-helper",
  message: "Expand this query into focused follow-up searches.",
  provider: "openai",
  model: "gpt-4.1-mini",
  deliver: false,
});
```

참고 사항:

- `provider` 및 `model`은 실행별 선택적 오버라이드이며, 영속 세션 변경이 아닙니다.
- OpenClaw는 신뢰된 호출자에 대해서만 이 오버라이드 필드를 존중합니다.
- 플러그인 소유 폴백 실행의 경우, 운영자는 `plugins.entries.<id>.subagent.allowModelOverride: true`로 옵트인해야 합니다.
- 신뢰된 플러그인을 특정 표준 `provider/model` 타겟으로 제한하려면 `plugins.entries.<id>.subagent.allowedModels`를 사용하고, 또는 모든 타겟을 명시적으로 허용하려면 `"*"`를 사용하십시오.
- 신뢰되지 않은 플러그인 서브에이전트 실행도 여전히 작동하지만, 오버라이드 요청은 조용히 폴백하는 대신 거부됩니다.

웹 검색의 경우, 플러그인은 에이전트 도구 와이어링에 손을 뻗는 대신 공유 런타임
헬퍼를 소비할 수 있습니다:

```ts
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

플러그인은 또한 `api.registerWebSearchProvider(...)`를 통해 웹 검색 프로바이더를
등록할 수 있습니다.

참고 사항:

- 프로바이더 선택, 자격 증명 해결, 공유 요청 의미론은 코어에 유지하십시오.
- 벤더별 검색 transport에는 웹 검색 프로바이더를 사용하십시오.
- `api.runtime.webSearch.*`은 에이전트 도구 래퍼에 의존하지 않고 검색 동작이 필요한 feature/channel 플러그인을 위한 선호되는 공유 표면입니다.

### `api.runtime.imageGeneration`

```ts
const result = await api.runtime.imageGeneration.generate({
  config: api.config,
  args: { prompt: "A friendly lobster mascot", size: "1024x1024" },
});

const providers = api.runtime.imageGeneration.listProviders({
  config: api.config,
});
```

- `generate(...)`: 구성된 이미지 생성 프로바이더 체인을 사용하여 이미지 생성.
- `listProviders(...)`: 사용 가능한 이미지 생성 프로바이더와 해당 capability 나열.

## 게이트웨이 HTTP 라우트

플러그인은 `api.registerHttpRoute(...)`를 사용하여 HTTP 엔드포인트를 노출할 수 있습니다.

```ts
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

- `path`: 게이트웨이 HTTP 서버 아래의 라우트 경로.
- `auth`: 필수. 일반 게이트웨이 auth를 요구하려면 `"gateway"`를, 플러그인이 관리하는 auth/웹훅 검증을 위해 `"plugin"`을 사용하십시오.
- `match`: 선택 사항. `"exact"` (기본값) 또는 `"prefix"`.
- `replaceExisting`: 선택 사항. 같은 플러그인이 자신의 기존 라우트 등록을 대체할 수 있게 합니다.
- `handler`: 라우트가 요청을 처리했을 때 `true`를 반환.

참고 사항:

- `api.registerHttpHandler(...)`는 제거되었으며 플러그인 로드 에러를 발생시킵니다. 대신 `api.registerHttpRoute(...)`를 사용하십시오.
- 플러그인 라우트는 `auth`를 명시적으로 선언해야 합니다.
- 정확한 `path + match` 충돌은 `replaceExisting: true`가 아닌 한 거부되며, 한 플러그인이 다른 플러그인의 라우트를 대체할 수 없습니다.
- 다른 `auth` 레벨을 가진 겹치는 라우트는 거부됩니다. `exact`/`prefix` 폴스루 체인은 같은 auth 레벨에만 유지하십시오.
- `auth: "plugin"` 라우트는 운영자 런타임 스코프를 자동으로 받지 **않습니다**. 이들은 플러그인이 관리하는 웹훅/서명 검증을 위한 것이며, 특권 게이트웨이 헬퍼 호출을 위한 것이 아닙니다.
- `auth: "gateway"` 라우트는 게이트웨이 요청 런타임 스코프 내에서 실행되지만, 해당 스코프는 의도적으로 보수적입니다:
  - 공유 시크릿 bearer auth (`gateway.auth.mode = "token"` / `"password"`)는 호출자가 `x-openclaw-scopes`를 보내더라도 플러그인 라우트 런타임 스코프를 `operator.write`로 고정합니다
  - 신뢰된 아이덴티티를 가진 HTTP 모드 (예: `trusted-proxy` 또는 사설 인그레스의 `gateway.auth.mode = "none"`)는 헤더가 명시적으로 존재할 때만 `x-openclaw-scopes`를 존중합니다
  - 이러한 아이덴티티 전달 플러그인 라우트 요청에서 `x-openclaw-scopes`가 없으면, 런타임 스코프는 `operator.write`로 폴백합니다
- 실용적 규칙: gateway-auth 플러그인 라우트를 암묵적 관리자 표면으로 가정하지 마십시오. 라우트가 관리자 전용 동작이 필요하면, 아이덴티티 전달 auth 모드를 요구하고 명시적 `x-openclaw-scopes` 헤더 계약을 문서화하십시오.

## 플러그인 SDK 임포트 경로

새 플러그인을 작성할 때는 모놀리식 `openclaw/plugin-sdk` 루트 배럴 대신 좁은
SDK 서브패스를 사용하십시오. 코어 서브패스:

| 서브패스                             | 용도                                                |
| ----------------------------------- | -------------------------------------------------- |
| `openclaw/plugin-sdk/plugin-entry`  | 플러그인 등록 프리미티브                             |
| `openclaw/plugin-sdk/channel-core`  | 채널 엔트리/빌드 헬퍼                                |
| `openclaw/plugin-sdk/core`          | 일반 공유 헬퍼 및 우산 계약                         |
| `openclaw/plugin-sdk/config-schema` | 루트 `openclaw.json` Zod 스키마 (`OpenClawSchema`) |

채널 플러그인은 좁은 이음새 패밀리에서 선택합니다 — `channel-setup`,
`setup-runtime`, `setup-adapter-runtime`, `setup-tools`, `channel-pairing`,
`channel-contract`, `channel-feedback`, `channel-inbound`, `channel-lifecycle`,
`channel-reply-pipeline`, `command-auth`, `secret-input`, `webhook-ingress`,
`channel-targets`, `channel-actions`. 승인 동작은 관련 없는 플러그인 필드 전반에
걸쳐 섞는 대신 하나의 `approvalCapability` 계약으로 통합해야 합니다.
[채널 플러그인](/plugins/sdk-channel-plugins)을 참조하십시오.

런타임 및 구성 헬퍼는 매칭되는 `*-runtime` 서브패스 아래에 있습니다
(`approval-runtime`, `config-runtime`, `infra-runtime`, `agent-runtime`,
`lazy-runtime`, `directory-runtime`, `text-runtime`, `runtime-store` 등).

<Info>
`openclaw/plugin-sdk/channel-runtime`은 더 이상 권장되지 않습니다 — 오래된
플러그인을 위한 호환성 쉼(shim)입니다. 새 코드는 대신 더 좁은 일반 프리미티브를
임포트해야 합니다.
</Info>

리포지토리 내부 엔트리 포인트 (번들된 각 플러그인 패키지 루트별):

- `index.js` — 번들된 플러그인 엔트리
- `api.js` — 헬퍼/타입 배럴
- `runtime-api.js` — 런타임 전용 배럴
- `setup-entry.js` — setup 플러그인 엔트리

외부 플러그인은 `openclaw/plugin-sdk/*` 서브패스만 임포트해야 합니다. 절대로
코어나 다른 플러그인에서 다른 플러그인 패키지의 `src/*`를 임포트하지 마십시오.
파사드 로드된 엔트리 포인트는 활성 런타임 구성 스냅샷이 존재할 때 이를 선호한
뒤, 디스크의 해결된 구성 파일로 폴백합니다.

`image-generation`, `media-understanding`, `speech` 같은 capability별 서브패스는
번들 플러그인이 오늘날 이들을 사용하기 때문에 존재합니다. 이들은 자동으로 장기
고정된 외부 계약이 아닙니다 — 이들에 의존할 때는 관련 SDK 레퍼런스 페이지를
확인하십시오.

## 메시지 도구 스키마

플러그인은 반응(reaction), 읽음(read), 투표(poll) 같은 메시지 외 프리미티브에
대한 채널별 `describeMessageTool(...)` 스키마 기여를 소유해야 합니다. 공유
전송 프레젠테이션은 프로바이더 네이티브 버튼, 컴포넌트, 블록 또는 카드 필드 대신
일반 `MessagePresentation` 계약을 사용해야 합니다.
계약, 폴백 규칙, 프로바이더 매핑, 플러그인 작성자 체크리스트는
[Message Presentation](/plugins/message-presentation)을 참조하십시오.

전송 가능한 플러그인은 메시지 capability를 통해 렌더링할 수 있는 것을 선언합니다:

- 의미론적 프레젠테이션 블록을 위한 `presentation` (`text`, `context`, `divider`, `buttons`, `select`)
- 고정 전달 요청을 위한 `delivery-pin`

코어는 프레젠테이션을 네이티브로 렌더링할지 아니면 텍스트로 격하할지 결정합니다.
일반 메시지 도구에서 프로바이더 네이티브 UI 탈출 해치를 노출하지 마십시오.
레거시 네이티브 스키마를 위한 더 이상 권장되지 않는 SDK 헬퍼는 기존 서드파티
플러그인을 위해 여전히 내보내지지만, 새 플러그인은 이를 사용하지 않아야 합니다.

## 채널 타겟 해결

채널 플러그인은 채널별 타겟 의미론을 소유해야 합니다. 공유 아웃바운드 호스트를
일반적으로 유지하고 프로바이더 규칙을 위해 메시징 어댑터 표면을 사용하십시오:

- `messaging.inferTargetChatType({ to })`는 디렉토리 조회 전에 정규화된 타겟을
  `direct`, `group`, 또는 `channel`로 취급할지 결정합니다.
- `messaging.targetResolver.looksLikeId(raw, normalized)`는 입력이 디렉토리
  검색 대신 id 유사 해결로 바로 건너뛸지를 코어에 알려줍니다.
- `messaging.targetResolver.resolveTarget(...)`은 정규화 또는 디렉토리 미스
  후에 코어가 최종 프로바이더 소유 해결이 필요할 때의 플러그인 폴백입니다.
- `messaging.resolveOutboundSessionRoute(...)`는 타겟이 해결된 후 프로바이더별
  세션 경로 구성을 소유합니다.

권장 분할:

- 피어/그룹 검색 전에 일어나야 하는 카테고리 결정에는 `inferTargetChatType`을
  사용하십시오.
- "이를 명시적/네이티브 타겟 id로 취급하라" 체크에는 `looksLikeId`를
  사용하십시오.
- 광범위한 디렉토리 검색이 아닌 프로바이더별 정규화 폴백에는 `resolveTarget`을
  사용하십시오.
- 채팅 id, 스레드 id, JID, 핸들, 룸 id 같은 프로바이더 네이티브 id는 일반 SDK
  필드가 아닌 `target` 값이나 프로바이더별 파라미터 내에 유지하십시오.

## 구성 기반 디렉토리

구성에서 디렉토리 엔트리를 파생하는 플러그인은 해당 로직을 플러그인에 유지하고
`openclaw/plugin-sdk/directory-runtime`의 공유 헬퍼를 재사용해야 합니다.

이는 채널이 다음과 같은 구성 기반 피어/그룹이 필요할 때 사용하십시오:

- 허용 목록 기반 DM 피어
- 구성된 채널/그룹 맵
- 계정 스코프 정적 디렉토리 폴백

`directory-runtime`의 공유 헬퍼는 일반 작업만 처리합니다:

- 쿼리 필터링
- 한도 적용
- 중복 제거/정규화 헬퍼
- `ChannelDirectoryEntry[]` 빌드

채널별 계정 검사와 id 정규화는 플러그인 구현에 남아 있어야 합니다.

## 프로바이더 카탈로그

프로바이더 플러그인은 `registerProvider({ catalog: { run(...) { ... } } })`로
추론을 위한 모델 카탈로그를 정의할 수 있습니다.

`catalog.run(...)`은 OpenClaw가 `models.providers`에 쓰는 것과 같은 형태를
반환합니다:

- 하나의 프로바이더 엔트리의 경우 `{ provider }`
- 여러 프로바이더 엔트리의 경우 `{ providers }`

플러그인이 프로바이더별 모델 id, 기본 URL 기본값, 또는 auth 게이트된 모델
메타데이터를 소유할 때 `catalog`를 사용하십시오.

`catalog.order`는 플러그인의 카탈로그가 OpenClaw의 내장 암시적 프로바이더에
상대적으로 언제 병합될지를 제어합니다:

- `simple`: 평범한 API 키 또는 env 기반 프로바이더
- `profile`: auth 프로필이 존재할 때 나타나는 프로바이더
- `paired`: 여러 관련 프로바이더 엔트리를 합성하는 프로바이더
- `late`: 다른 암시적 프로바이더 이후 마지막 패스

나중 프로바이더가 키 충돌에서 이기므로, 플러그인은 동일한 프로바이더 id를 가진
내장 프로바이더 엔트리를 의도적으로 오버라이드할 수 있습니다.

호환성:

- `discovery`는 여전히 레거시 별칭으로 작동합니다
- `catalog`와 `discovery`가 모두 등록되면, OpenClaw는 `catalog`를 사용합니다

## 읽기 전용 채널 검사

플러그인이 채널을 등록한다면, `resolveAccount(...)`과 함께
`plugin.config.inspectAccount(cfg, accountId)`를 구현하는 것이 좋습니다.

이유:

- `resolveAccount(...)`는 런타임 경로입니다. 자격 증명이 완전히 머터리얼라이즈
  되었다고 가정하는 것이 허용되며 필요한 시크릿이 없으면 빠르게 실패할 수
  있습니다.
- `openclaw status`, `openclaw status --all`, `openclaw channels status`,
  `openclaw channels resolve`, doctor/config 복구 플로우 같은 읽기 전용 명령
  경로는 단지 구성을 설명하기 위해 런타임 자격 증명을 머터리얼라이즈할 필요가
  없어야 합니다.

권장 `inspectAccount(...)` 동작:

- 설명적 계정 상태만 반환.
- `enabled`와 `configured`를 보존.
- 관련 있을 때 자격 증명 소스/상태 필드를 포함, 예:
  - `tokenSource`, `tokenStatus`
  - `botTokenSource`, `botTokenStatus`
  - `appTokenSource`, `appTokenStatus`
  - `signingSecretSource`, `signingSecretStatus`
- 읽기 전용 가용성을 보고하기 위해 원시 토큰 값을 반환할 필요는 없습니다.
  상태 스타일 명령에는 `tokenStatus: "available"` (그리고 매칭되는 소스 필드)을
  반환하는 것으로 충분합니다.
- 자격 증명이 SecretRef를 통해 구성되었지만 현재 명령 경로에서 사용할 수 없을
  때 `configured_unavailable`을 사용하십시오.

이렇게 하면 읽기 전용 명령이 계정을 구성되지 않은 것으로 충돌하거나 잘못 보고
하는 대신 "구성되었지만 이 명령 경로에서 사용 불가"로 보고할 수 있습니다.

## 패키지 팩

플러그인 디렉토리는 `openclaw.extensions`를 가진 `package.json`을 포함할 수 있습니다:

```json
{
  "name": "my-pack",
  "openclaw": {
    "extensions": ["./src/safety.ts", "./src/tools.ts"],
    "setupEntry": "./src/setup-entry.ts"
  }
}
```

각 엔트리는 플러그인이 됩니다. 팩이 여러 extension을 나열하면, 플러그인 id는
`name/<fileBase>`가 됩니다.

플러그인이 npm 의존성을 임포트하는 경우, `node_modules`를 사용할 수 있도록
해당 디렉토리에 설치하십시오 (`npm install` / `pnpm install`).

보안 가드레일: 모든 `openclaw.extensions` 엔트리는 심볼릭 링크 해결 후에도
플러그인 디렉토리 내에 머물러야 합니다. 패키지 디렉토리를 벗어나는 엔트리는
거부됩니다.

보안 참고: `openclaw plugins install`은 `npm install --omit=dev --ignore-scripts`로
플러그인 의존성을 설치합니다 (수명 주기 스크립트 없음, 런타임에 dev 의존성
없음). 플러그인 의존성 트리를 "순수 JS/TS"로 유지하고 `postinstall` 빌드가
필요한 패키지를 피하십시오.

선택 사항: `openclaw.setupEntry`는 경량 setup 전용 모듈을 가리킬 수 있습니다.
OpenClaw가 비활성화된 채널 플러그인에 대해 setup 표면이 필요하거나, 채널
플러그인이 활성화되었지만 여전히 구성되지 않았을 때, 전체 플러그인 엔트리 대신
`setupEntry`를 로드합니다. 이는 주 플러그인 엔트리가 도구, 훅, 또는 기타 런타임
전용 코드도 와이어할 때 시작과 setup을 더 가볍게 유지합니다.

선택 사항: `openclaw.startup.deferConfiguredChannelFullLoadUntilAfterListen`은
채널이 이미 구성된 경우에도, 게이트웨이의 사전 리슨 시작 단계 동안 채널
플러그인을 동일한 `setupEntry` 경로로 옵트인할 수 있습니다.

이는 `setupEntry`가 게이트웨이가 리스닝을 시작하기 전에 존재해야 하는 시작
표면을 완전히 커버할 때만 사용하십시오. 실제로, 이는 setup 엔트리가 시작이
의존하는 모든 채널 소유 capability를 등록해야 한다는 의미입니다, 예:

- 채널 등록 자체
- 게이트웨이가 리스닝을 시작하기 전에 사용 가능해야 하는 HTTP 라우트
- 같은 윈도우 동안 존재해야 하는 게이트웨이 메서드, 도구, 또는 서비스

전체 엔트리가 여전히 필수 시작 capability를 소유하고 있다면, 이 플래그를
활성화하지 마십시오. 플러그인을 기본 동작으로 유지하고 OpenClaw가 시작 중에
전체 엔트리를 로드하도록 하십시오.

번들 채널은 또한 전체 채널 런타임이 로드되기 전에 코어가 상의할 수 있는 setup
전용 계약 표면 헬퍼를 게시할 수 있습니다. 현재 setup 승격 표면은 다음과 같습니다:

- `singleAccountKeysToMove`
- `namedAccountPromotionKeys`
- `resolveSingleAccountPromotionTarget(...)`

코어는 전체 플러그인 엔트리를 로드하지 않고 레거시 단일 계정 채널 구성을
`channels.<id>.accounts.*`로 승격해야 할 때 해당 표면을 사용합니다. Matrix는
현재 번들된 예입니다: 명명된 계정이 이미 존재할 때 auth/부트스트랩 키만 명명된
승격된 계정으로 이동하며, 항상 `accounts.default`를 만드는 대신 구성된 비표준
기본 계정 키를 보존할 수 있습니다.

이러한 setup 패치 어댑터는 번들된 계약 표면 발견을 지연시킵니다. 임포트 시간이
가볍게 유지됩니다; 승격 표면은 모듈 임포트 시 번들된 채널 시작에 재진입하는
대신 첫 사용 시에만 로드됩니다.

이러한 시작 표면이 게이트웨이 RPC 메서드를 포함할 때는 플러그인별 접두사에
유지하십시오. 코어 관리자 네임스페이스(`config.*`, `exec.approvals.*`,
`wizard.*`, `update.*`)는 예약된 상태로 유지되며 플러그인이 더 좁은 스코프를
요청해도 항상 `operator.admin`으로 해결됩니다.

예제:

```json
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

채널 플러그인은 `openclaw.channel`을 통해 setup/발견 메타데이터를, `openclaw.install`을
통해 설치 힌트를 광고할 수 있습니다. 이로써 코어 카탈로그가 데이터 없이
유지됩니다.

예제:

```json
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

최소 예제를 넘어서는 유용한 `openclaw.channel` 필드:

- `detailLabel`: 더 풍부한 카탈로그/상태 표면을 위한 2차 라벨
- `docsLabel`: 문서 링크의 링크 텍스트 오버라이드
- `preferOver`: 이 카탈로그 엔트리가 능가해야 하는 낮은 우선순위 플러그인/채널 id
- `selectionDocsPrefix`, `selectionDocsOmitLabel`, `selectionExtras`: 선택 표면 카피 컨트롤
- `markdownCapable`: 아웃바운드 포매팅 결정을 위해 채널을 마크다운 가능으로 표시
- `exposure.configured`: `false`로 설정하면 구성된 채널 리스팅 표면에서 채널을 숨김
- `exposure.setup`: `false`로 설정하면 인터랙티브 setup/구성 피커에서 채널을 숨김
- `exposure.docs`: 문서 네비게이션 표면을 위해 채널을 내부/비공개로 표시
- `showConfigured` / `showInSetup`: 호환성을 위해 여전히 허용되는 레거시 별칭; `exposure`를 선호하십시오
- `quickstartAllowFrom`: 채널을 표준 퀵스타트 `allowFrom` 플로우로 옵트인
- `forceAccountBinding`: 하나의 계정만 존재해도 명시적 계정 바인딩 요구
- `preferSessionLookupForAnnounceTarget`: 공지 타겟 해결 시 세션 조회 선호

OpenClaw는 또한 **외부 채널 카탈로그**를 병합할 수 있습니다 (예: MPM 레지스트리
내보내기). 다음 중 하나의 위치에 JSON 파일을 드롭하십시오:

- `~/.openclaw/mpm/plugins.json`
- `~/.openclaw/mpm/catalog.json`
- `~/.openclaw/plugins/catalog.json`

또는 `OPENCLAW_PLUGIN_CATALOG_PATHS` (또는 `OPENCLAW_MPM_CATALOG_PATHS`)가
하나 이상의 JSON 파일을 가리키도록 하십시오 (쉼표/세미콜론/`PATH` 구분).
각 파일에는 `{ "entries": [ { "name": "@scope/pkg", "openclaw": { "channel": {...}, "install": {...} } } ] }`가 포함되어야 합니다. 파서는 `"entries"` 키의 레거시 별칭으로 `"packages"` 또는 `"plugins"`도 허용합니다.

## 컨텍스트 엔진 플러그인

컨텍스트 엔진 플러그인은 인제스트, 조립, 압축을 위한 세션 컨텍스트
오케스트레이션을 소유합니다. 플러그인에서 `api.registerContextEngine(id, factory)`로
등록한 뒤, `plugins.slots.contextEngine`으로 활성 엔진을 선택하십시오.

플러그인이 메모리 검색이나 훅을 추가하는 것이 아니라 기본 컨텍스트 파이프라인을
대체하거나 확장해야 할 때 이를 사용하십시오.

```ts
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

엔진이 압축 알고리즘을 소유하지 **않는** 경우, `compact()`를 구현 상태로
유지하고 명시적으로 위임하십시오:

```ts
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

## 새로운 capability 추가

플러그인이 현재 API에 맞지 않는 동작이 필요할 때, 사적인 리치인(reach-in)으로
플러그인 시스템을 우회하지 마십시오. 누락된 capability를 추가하십시오.

권장 순서:

1. 코어 계약 정의
   코어가 소유해야 하는 공유 동작을 결정하십시오: 정책, 폴백, 구성 병합,
   수명 주기, 채널 대면 의미론, 런타임 헬퍼 형태.
2. 타입된 플러그인 등록/런타임 표면 추가
   `OpenClawPluginApi` 및/또는 `api.runtime`을 가장 작은 유용한 타입된
   capability 표면으로 확장하십시오.
3. 코어 + channel/feature 소비자 와이어
   채널과 기능 플러그인은 벤더 구현을 직접 임포트하지 않고 코어를 통해 새
   capability를 소비해야 합니다.
4. 벤더 구현 등록
   벤더 플러그인은 그런 다음 capability에 대해 자신의 백엔드를 등록합니다.
5. 계약 커버리지 추가
   소유권과 등록 형태가 시간이 지나도 명시적으로 유지되도록 테스트를
   추가하십시오.

이것이 OpenClaw가 하나의 프로바이더 세계관에 하드코딩되지 않으면서 의견을
유지하는 방식입니다. 구체적인 파일 체크리스트와 실제 예제는
[Capability Cookbook](/tools/capability-cookbook)을 참조하십시오.

### Capability 체크리스트

새 capability를 추가할 때, 구현은 보통 이러한 표면을 함께 건드려야 합니다:

- `src/<capability>/types.ts`의 코어 계약 타입
- `src/<capability>/runtime.ts`의 코어 러너/런타임 헬퍼
- `src/plugins/types.ts`의 플러그인 API 등록 표면
- `src/plugins/registry.ts`의 플러그인 레지스트리 와이어링
- feature/channel 플러그인이 이를 소비해야 할 때 `src/plugins/runtime/*`의
  플러그인 런타임 노출
- `src/test-utils/plugin-registration.ts`의 캡처/테스트 헬퍼
- `src/plugins/contracts/registry.ts`의 소유권/계약 어서션
- `docs/`의 운영자/플러그인 문서

이러한 표면 중 하나가 누락되어 있다면, 이는 보통 capability가 아직 완전히
통합되지 않았다는 신호입니다.

### Capability 템플릿

최소 패턴:

```ts
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

```ts
expect(findVideoGenerationProviderIdsForPlugin("openai")).toEqual(["openai"]);
```

이로써 규칙이 단순하게 유지됩니다:

- 코어가 capability 계약 + 오케스트레이션을 소유
- 벤더 플러그인이 벤더 구현을 소유
- feature/channel 플러그인이 런타임 헬퍼를 소비
- 계약 테스트가 소유권을 명시적으로 유지

## 관련 문서

- [플러그인 아키텍처](/plugins/architecture) — 공개 capability 모델 및 형태
- [플러그인 SDK 서브패스](/plugins/sdk-subpaths)
- [플러그인 SDK setup](/plugins/sdk-setup)
- [플러그인 구축](/plugins/building-plugins)
