---
title: "테스트"
description: "테스트 킷: 유닛/e2e/라이브 스위트, Docker 러너, 각 테스트 범위"
---

# 테스트

OpenClaw에는 세 가지 Vitest 스위트(유닛/통합, e2e, 라이브)와 소규모 Docker 러너 세트가 있습니다.

이 문서는 "테스트 방법" 가이드입니다:

- 각 스위트의 범위 (의도적으로 다루지 않는 것 포함)
- 일반 워크플로우(로컬, 푸시 전, 디버깅)에 실행할 명령
- 라이브 테스트가 자격 증명을 검색하고 모델/프로바이더를 선택하는 방법
- 실제 모델/프로바이더 문제에 대한 회귀 테스트 추가 방법

## 빠른 시작

대부분의 날:

- 전체 게이트(푸시 전 예상): `pnpm build && pnpm check && pnpm test`
- 여유 있는 머신에서 더 빠른 로컬 전체 스위트 실행: `pnpm test:max`
- 직접 Vitest 감시 루프: `pnpm test:watch`
- 직접 파일 대상 지정이 이제 extension/channel 경로도 라우팅합니다: `pnpm test extensions/discord/src/monitor/message-handler.preflight.test.ts`
- Docker 기반 QA 사이트: `pnpm qa:lab:up`

테스트를 수정하거나 추가적인 확인이 필요한 경우:

- 커버리지 게이트: `pnpm test:coverage`
- E2E 스위트: `pnpm test:e2e`

실제 프로바이더/모델 디버깅 시 (실제 자격 증명 필요):

- 라이브 스위트 (모델 + 게이트웨이 도구/이미지 프로브): `pnpm test:live`
- 하나의 라이브 파일 조용히 대상 지정: `pnpm test:live -- src/agents/models.profiles.live.test.ts`

팁: 실패한 케이스 하나만 필요한 경우 아래에 설명된 허용 목록 환경 변수를 통해 라이브 테스트를 좁히십시오.

## 테스트 스위트 (어디서 무엇이 실행되는가)

스위트를 "증가하는 현실성" (그리고 증가하는 불안정성/비용)으로 생각하십시오:

### 유닛 / 통합 (기본)

- 명령: `pnpm test`
- 구성: 기존 범위 지정 Vitest 프로젝트에 대한 10개 순차 샤드 실행 (`vitest.full-*.config.ts`)
- 파일: `src/**/*.test.ts`, `packages/**/*.test.ts`, `test/**/*.test.ts` 아래의 핵심/유닛 인벤토리와 `vitest.unit.config.ts`가 다루는 허용된 `ui` 노드 테스트
- 범위:
  - 순수 유닛 테스트
  - 인프로세스 통합 테스트 (게이트웨이 인증, 라우팅, 도구, 파싱, 구성)
  - 알려진 버그에 대한 결정론적 회귀 테스트
- 기대:
  - CI에서 실행
  - 실제 키 불필요
  - 빠르고 안정적이어야 함
- 프로젝트 참고:
  - 대상 없는 `pnpm test`는 이제 하나의 거대한 네이티브 루트 프로젝트 프로세스 대신 11개의 소규모 샤드 구성(`core-unit-src`, `core-unit-security`, `core-unit-ui`, `core-unit-support`, `core-support-boundary`, `core-contracts`, `core-bundled`, `core-runtime`, `agentic`, `auto-reply`, `extensions`)을 실행합니다. 이는 부하가 높은 머신에서 최대 RSS를 줄이고 auto-reply/extension 작업이 관련 없는 스위트를 굶기지 않도록 합니다.
  - `pnpm test --watch`는 멀티 샤드 감시 루프가 실용적이지 않기 때문에 여전히 네이티브 루트 `vitest.config.ts` 프로젝트 그래프를 사용합니다.
  - `pnpm test`, `pnpm test:watch`, `pnpm test:perf:imports`는 명시적 파일/디렉토리 대상을 먼저 범위 지정 레인을 통해 라우팅합니다.
  - `pnpm test:changed`는 변경된 git 경로가 더 작은 스위트에 깔끔하게 매핑될 때 범위 지정 레인을 통해 확장합니다.

### E2E (게이트웨이 스모크)

- 명령: `pnpm test:e2e`
- 구성: `vitest.e2e.config.ts`
- 파일: `src/**/*.e2e.test.ts`, `test/**/*.e2e.test.ts`
- 런타임 기본값:
  - `isolate: false`로 Vitest `threads` 사용
  - 적응형 워커 사용 (CI: 최대 2, 로컬: 기본 1)
  - 기본적으로 콘솔 I/O 오버헤드 감소를 위해 자동 모드로 실행
- 유용한 재정의:
  - `OPENCLAW_E2E_WORKERS=&lt;n&gt;`: 워커 수 강제 지정 (최대 16)
  - `OPENCLAW_E2E_VERBOSE=1`: 상세 콘솔 출력 재활성화
- 범위:
  - 멀티 인스턴스 게이트웨이 엔드 투 엔드 동작
  - WebSocket/HTTP 인터페이스, 노드 페어링 및 더 무거운 네트워킹
- 기대:
  - CI에서 실행 (파이프라인에서 활성화된 경우)
  - 실제 키 불필요
  - 유닛 테스트보다 움직임이 더 많음 (더 느릴 수 있음)

### E2E: OpenShell 백엔드 스모크

- 명령: `pnpm test:e2e:openshell`
- 파일: `test/openshell-sandbox.e2e.test.ts`
- 범위:
  - Docker를 통해 호스트에서 격리된 OpenShell 게이트웨이 시작
  - 임시 로컬 Dockerfile에서 샌드박스 생성
  - 실제 `sandbox ssh-config` + SSH exec를 통해 OpenClaw의 OpenShell 백엔드 실행
  - 샌드박스 fs 브리지를 통해 원격 정규 파일시스템 동작 확인
- 기대:
  - 선택 사항만; 기본 `pnpm test:e2e` 실행의 일부 아님
  - 로컬 `openshell` CLI와 작동하는 Docker 데몬 필요
  - 격리된 `HOME` / `XDG_CONFIG_HOME` 사용 후 테스트 게이트웨이와 샌드박스 삭제
- 유용한 재정의:
  - `OPENCLAW_E2E_OPENSHELL=1`: 광범위한 e2e 스위트를 수동으로 실행할 때 테스트 활성화
  - `OPENCLAW_E2E_OPENSHELL_COMMAND=/path/to/openshell`: 기본값이 아닌 CLI 바이너리 또는 래퍼 스크립트 지정

### 라이브 (실제 프로바이더 + 실제 모델)

- 명령: `pnpm test:live`
- 구성: `vitest.live.config.ts`
- 파일: `src/**/*.live.test.ts`
- 기본값: `pnpm test:live`로 **활성화** (`OPENCLAW_LIVE_TEST=1` 설정)
- 범위:
  - "이 프로바이더/모델이 오늘 실제 자격 증명으로 실제로 작동하는가?"
  - 프로바이더 형식 변경, 도구 호출 특이점, 인증 문제 및 속도 제한 동작 포착
- 기대:
  - 설계상 CI 안정성 없음 (실제 네트워크, 실제 프로바이더 정책, 할당량, 중단)
  - 비용 발생 / 속도 제한 사용
  - "모든 것"이 아닌 좁혀진 하위 집합 실행 선호
- 라이브 실행은 누락된 API 키를 가져오기 위해 `~/.profile`을 소싱합니다.
- 기본적으로 라이브 실행은 여전히 `HOME`을 격리하고 구성/인증 자료를 임시 테스트 홈으로 복사합니다.
- 실제 홈 디렉토리를 사용하려면 `OPENCLAW_LIVE_USE_REAL_HOME=1`만 설정하십시오.
- API 키 교체 (프로바이더별): `*_API_KEYS`를 쉼표/세미콜론 형식 또는 `*_API_KEY_1`, `*_API_KEY_2`로 설정하십시오.

## 어떤 스위트를 실행해야 하는가?

이 결정 표를 사용하십시오:

- 로직/테스트 편집: `pnpm test` 실행 (많이 변경한 경우 `pnpm test:coverage`도)
- 게이트웨이 네트워킹 / WS 프로토콜 / 페어링 수정: `pnpm test:e2e` 추가
- "내 봇이 다운되었음" / 프로바이더별 실패 / 도구 호출 디버깅: 좁혀진 `pnpm test:live` 실행

## 라이브: Android 노드 기능 스윕

- 테스트: `src/gateway/android-node.capabilities.live.test.ts`
- 스크립트: `pnpm android:test:integration`
- 목표: 연결된 Android 노드가 현재 광고하는 **모든 명령**을 호출하고 명령 계약 동작을 확인합니다.
- 범위:
  - 사전 조건/수동 설정 (스위트는 앱을 설치/실행/페어링하지 않음)
  - 선택된 Android 노드에 대한 명령별 게이트웨이 `node.invoke` 유효성 검사
- 필수 사전 설정:
  - Android 앱이 게이트웨이에 이미 연결 + 페어링됨
  - 앱이 포그라운드 상태 유지
  - 통과를 예상하는 기능에 권한/캡처 동의가 부여됨
- 선택적 대상 재정의:
  - `OPENCLAW_ANDROID_NODE_ID` 또는 `OPENCLAW_ANDROID_NODE_NAME`
  - `OPENCLAW_ANDROID_GATEWAY_URL` / `OPENCLAW_ANDROID_GATEWAY_TOKEN` / `OPENCLAW_ANDROID_GATEWAY_PASSWORD`
- 전체 Android 설정 세부 정보: [Android 앱](/platforms/android)

## 라이브: 모델 스모크 (프로필 키)

라이브 테스트는 실패를 격리하기 위해 두 레이어로 분리됩니다:

- "직접 모델"은 프로바이더/모델이 주어진 키로 전혀 응답할 수 있는지 알려줍니다.
- "게이트웨이 스모크"는 해당 모델에 대해 전체 게이트웨이+에이전트 파이프라인이 작동하는지 알려줍니다 (세션, 히스토리, 도구, 샌드박스 정책 등).

### 레이어 1: 직접 모델 완성 (게이트웨이 없음)

- 테스트: `src/agents/models.profiles.live.test.ts`
- 목표:
  - 발견된 모델 열거
  - `getApiKeyForModel`을 사용하여 자격 증명이 있는 모델 선택
  - 모델당 소규모 완성 실행 (필요한 경우 대상 회귀 포함)
- 활성화 방법:
  - `pnpm test:live` (또는 Vitest를 직접 호출하는 경우 `OPENCLAW_LIVE_TEST=1`)
- 모델 선택 방법:
  - `OPENCLAW_LIVE_MODELS=modern`: 현대 허용 목록 실행
  - `OPENCLAW_LIVE_MODELS=all`: `modern`의 별칭
  - 또는 `OPENCLAW_LIVE_MODELS="openai/gpt-5.4,anthropic/claude-opus-4-6,..."` (쉼표 허용 목록)
- 프로바이더 선택 방법:
  - `OPENCLAW_LIVE_PROVIDERS="google,google-antigravity,google-gemini-cli"` (쉼표 허용 목록)

### 레이어 2: 게이트웨이 + 개발 에이전트 스모크

- 테스트: `src/gateway/gateway-models.profiles.live.test.ts`
- 목표:
  - 인프로세스 게이트웨이 시작
  - `agent:dev:*` 세션 생성/패치 (실행당 모델 재정의)
  - 키가 있는 모델 반복 및 확인:
    - "의미 있는" 응답 (도구 없음)
    - 실제 도구 호출 작동 (읽기 프로브)
    - 선택적 추가 도구 프로브 (exec+읽기 프로브)
    - OpenAI 회귀 경로 (도구 호출 전용 → 후속 조치)
- 활성화 방법:
  - `pnpm test:live` (또는 Vitest를 직접 호출하는 경우 `OPENCLAW_LIVE_TEST=1`)
- 모델 선택 방법:
  - 기본값: 현대 허용 목록
  - `OPENCLAW_LIVE_GATEWAY_MODELS=all`: 현대 허용 목록의 별칭
  - 또는 `OPENCLAW_LIVE_GATEWAY_MODELS="provider/model"` (또는 쉼표 목록)으로 좁히기

## 자격 증명 (커밋하지 마십시오)

라이브 테스트는 CLI와 동일한 방식으로 자격 증명을 검색합니다:

- CLI가 작동하면 라이브 테스트도 동일한 키를 찾아야 합니다.
- 라이브 테스트에서 "자격 증명 없음"이라고 하면 `openclaw models list` / 모델 선택 디버깅과 동일한 방법으로 디버그하십시오.

- 에이전트별 인증 프로필: `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-profiles.json`
- 구성: `~/.openclaw/openclaw.json` (또는 `OPENCLAW_CONFIG_PATH`)
- 레거시 상태 디렉토리: `~/.openclaw/credentials/`

## Docker 러너 (선택적 "Linux에서 작동" 확인)

Docker 러너는 두 가지 버킷으로 나뉩니다:

- 라이브 모델 러너: `test:docker:live-models`와 `test:docker:live-gateway`는 리포지토리 Docker 이미지 내에서만 매칭 프로필 키 라이브 파일을 실행합니다.
- 컨테이너 스모크 러너: `test:docker:openwebui`, `test:docker:onboard`, `test:docker:gateway-network`, `test:docker:mcp-channels`, `test:docker:plugins`는 하나 이상의 실제 컨테이너를 부팅하고 더 높은 수준의 통합 경로를 확인합니다.

Docker 러너 명령:

- 직접 모델: `pnpm test:docker:live-models` (스크립트: `scripts/test-live-models-docker.sh`)
- ACP 바인드 스모크: `pnpm test:docker:live-acp-bind` (스크립트: `scripts/test-live-acp-bind-docker.sh`)
- CLI 백엔드 스모크: `pnpm test:docker:live-cli-backend` (스크립트: `scripts/test-live-cli-backend-docker.sh`)
- 게이트웨이 + 개발 에이전트: `pnpm test:docker:live-gateway` (스크립트: `scripts/test-live-gateway-models-docker.sh`)
- Open WebUI 라이브 스모크: `pnpm test:docker:openwebui` (스크립트: `scripts/e2e/openwebui-docker.sh`)
- 온보딩 마법사 (TTY, 전체 스캐폴딩): `pnpm test:docker:onboard` (스크립트: `scripts/e2e/onboard-docker.sh`)
- 게이트웨이 네트워킹 (두 개의 컨테이너, WS 인증 + 상태): `pnpm test:docker:gateway-network` (스크립트: `scripts/e2e/gateway-network-docker.sh`)
- MCP 채널 브리지: `pnpm test:docker:mcp-channels` (스크립트: `scripts/e2e/mcp-channels-docker.sh`)
- 플러그인 (설치 스모크 + `/plugin` 별칭 + Claude 번들 재시작 의미론): `pnpm test:docker:plugins` (스크립트: `scripts/e2e/plugins-docker.sh`)

유용한 환경 변수:

- `OPENCLAW_CONFIG_DIR=...` (기본값: `~/.openclaw`) `/home/node/.openclaw`에 마운트됨
- `OPENCLAW_WORKSPACE_DIR=...` (기본값: `~/.openclaw/workspace`) `/home/node/.openclaw/workspace`에 마운트됨
- `OPENCLAW_PROFILE_FILE=...` (기본값: `~/.profile`) `/home/node/.profile`에 마운트되고 테스트 실행 전에 소싱됨
- `OPENCLAW_DOCKER_CLI_TOOLS_DIR=...` (기본값: `~/.cache/openclaw/docker-cli-tools`) Docker 내부에 캐시된 CLI 설치를 위해 `/home/node/.npm-global`에 마운트됨

## 문서 정상 확인

문서 편집 후 문서 확인 실행: `pnpm check:docs`.
인페이지 헤딩 확인이 필요한 경우 전체 Mintlify 앵커 유효성 검사 실행: `pnpm docs:check-links:anchors`.

## 계약 테스트 (플러그인 및 채널 형태)

계약 테스트는 등록된 모든 플러그인과 채널이 인터페이스 계약을 준수하는지 확인합니다.

### 명령

- 모든 계약: `pnpm test:contracts`
- 채널 계약만: `pnpm test:contracts:channels`
- 프로바이더 계약만: `pnpm test:contracts:plugins`

### 채널 계약

`src/channels/plugins/contracts/*.contract.test.ts`에 위치:

- **plugin** - 기본 플러그인 형태 (id, name, 기능)
- **setup** - 설정 마법사 계약
- **session-binding** - 세션 바인딩 동작
- **outbound-payload** - 메시지 페이로드 구조
- **inbound** - 인바운드 메시지 처리
- **actions** - 채널 작업 핸들러
- **threading** - 스레드 ID 처리
- **directory** - 디렉토리/로스터 API
- **group-policy** - 그룹 정책 시행

### 프로바이더 계약

`src/plugins/contracts/*.contract.test.ts`에 위치:

- **auth** - 인증 흐름 계약
- **catalog** - 모델 카탈로그 API
- **discovery** - 플러그인 검색
- **loader** - 플러그인 로딩
- **runtime** - 프로바이더 런타임
- **shape** - 플러그인 형태/인터페이스

### 실행 시기

- plugin-sdk 내보내기 또는 하위 경로 변경 후
- 채널 또는 프로바이더 플러그인 추가 또는 수정 후
- 플러그인 등록 또는 검색 리팩토링 후

계약 테스트는 CI에서 실행되며 실제 API 키가 필요하지 않습니다.

## 회귀 추가 (가이드)

라이브에서 발견된 프로바이더/모델 문제를 수정할 때:

- 가능하면 CI 안전 회귀를 추가하십시오 (모의/스텁 프로바이더, 또는 정확한 요청 형태 변환 캡처)
- 본질적으로 라이브 전용인 경우 (속도 제한, 인증 정책), 라이브 테스트를 좁게 유지하고 환경 변수를 통해 선택 사항으로 만드십시오
- 버그를 포착하는 가장 작은 레이어를 대상으로 하십시오:
  - 프로바이더 요청 변환/리플레이 버그 → 직접 모델 테스트
  - 게이트웨이 세션/히스토리/도구 파이프라인 버그 → 게이트웨이 라이브 스모크 또는 CI 안전 게이트웨이 모의 테스트
