# QA 리팩토링

상태: 기반 마이그레이션 완료.

## 목표

OpenClaw QA를 분할 정의 모델에서 단일 진실 소스로 이동합니다:

- 시나리오 메타데이터
- 모델에 전송되는 프롬프트
- 설정 및 해제
- 하네스 로직
- 어서션 및 성공 기준
- 아티팩트 및 보고서 힌트

원하는 최종 상태는 TypeScript에서 대부분의 동작을 하드코딩하는 대신 강력한 시나리오 정의 파일을 로드하는 일반 QA 하네스입니다.

## 현재 상태

기본 진실 소스는 이제 `qa/scenarios/index.md`와 `qa/scenarios/*.md` 아래 시나리오당 하나의 파일에 있습니다.

구현됨:

- `qa/scenarios/index.md`
  - 정규 QA 팩 메타데이터
  - 운영자 아이덴티티
  - 킥오프 미션
- `qa/scenarios/*.md`
  - 시나리오당 하나의 마크다운 파일
  - 시나리오 메타데이터
  - 핸들러 바인딩
  - 시나리오별 실행 구성
- `extensions/qa-lab/src/scenario-catalog.ts`
  - 마크다운 팩 파서 + zod 유효성 검사
- `extensions/qa-lab/src/qa-agent-bootstrap.ts`
  - 마크다운 팩에서 계획 렌더링
- `extensions/qa-lab/src/qa-agent-workspace.ts`
  - 생성된 호환성 파일 및 `QA_SCENARIOS.md` 시드
- `extensions/qa-lab/src/suite.ts`
  - 마크다운 정의 핸들러 바인딩을 통해 실행 가능한 시나리오 선택
- QA 버스 프로토콜 + UI
  - 이미지/비디오/오디오/파일 렌더링을 위한 일반 인라인 첨부 파일

남은 분할 인터페이스:

- `extensions/qa-lab/src/suite.ts`
  - 여전히 대부분의 실행 가능한 커스텀 핸들러 로직 소유
- `extensions/qa-lab/src/report.ts`
  - 여전히 런타임 출력에서 보고서 구조 파생

따라서 진실 소스 분할은 수정되었지만 실행은 여전히 완전히 선언적이라기보다는 주로 핸들러 지원입니다.

## 실제 시나리오 인터페이스 모습

현재 스위트를 읽으면 몇 가지 뚜렷한 시나리오 클래스가 있습니다.

### 단순 상호작용

- 채널 기준선
- DM 기준선
- 스레드 후속 조치
- 모델 전환
- 승인 후속 조치
- 반응/편집/삭제

### 구성 및 런타임 변형

- 구성 패치 스킬 비활성화
- 구성 적용 재시작 활성화
- 구성 재시작 기능 전환
- 런타임 인벤토리 드리프트 확인

### 파일시스템 및 리포지토리 어서션

- 소스/문서 검색 보고서
- Lobster Invaders 빌드
- 생성된 이미지 아티팩트 조회

### 메모리 오케스트레이션

- 메모리 리콜
- 채널 컨텍스트에서 메모리 도구
- 메모리 실패 폴백
- 세션 메모리 순위
- 스레드 메모리 격리
- 메모리 꿈꾸기 스윕

### 도구 및 플러그인 통합

- MCP 플러그인 도구 호출
- 스킬 가시성
- 스킬 핫 설치
- 네이티브 이미지 생성
- 이미지 라운드트립
- 첨부 파일에서 이미지 이해

### 멀티턴 및 멀티액터

- 서브에이전트 핸드오프
- 서브에이전트 팬아웃 합성
- 재시작 복구 스타일 흐름

이러한 카테고리는 DSL 요구 사항을 결정하기 때문에 중요합니다. 프롬프트 + 예상 텍스트의 단순 목록으로는 충분하지 않습니다.

## 방향

### 단일 진실 소스

`qa/scenarios/index.md`와 `qa/scenarios/*.md`를 작성된 진실 소스로 사용하십시오.

팩은 다음 상태를 유지해야 합니다:

- 검토에서 사람이 읽을 수 있음
- 기계 파싱 가능
- 다음을 구동하기에 충분히 풍부:
  - 스위트 실행
  - QA 워크스페이스 부트스트랩
  - QA Lab UI 메타데이터
  - 문서/검색 프롬프트
  - 보고서 생성

### 선호하는 작성 형식

마크다운을 최상위 형식으로 사용하고, 내부에 구조화된 YAML을 사용합니다.

권장 형태:

- YAML 프론트매터
  - id
  - title
  - surface
  - tags
  - 문서 참조
  - 코드 참조
  - 모델/프로바이더 재정의
  - 전제 조건
- 산문 섹션
  - 목표
  - 참고
  - 디버깅 힌트
- 펜싱된 YAML 블록
  - 설정
  - 단계
  - 어서션
  - 정리

이것은 다음을 제공합니다:

- 거대한 JSON보다 더 나은 PR 가독성
- 순수 YAML보다 더 풍부한 컨텍스트
- 엄격한 파싱 및 zod 유효성 검사

원시 JSON은 중간 생성 형식으로만 허용됩니다.

## 제안된 시나리오 파일 형태

예시:

````md
---
id: image-generation-roundtrip
title: Image generation roundtrip
surface: image
tags: [media, image, roundtrip]
models:
  primary: openai/gpt-5.4
requires:
  tools: [image_generate]
  plugins: [openai, qa-channel]
docsRefs:
  - docs/help/testing.md
  - docs/concepts/model-providers.md
codeRefs:
  - extensions/qa-lab/src/suite.ts
  - src/gateway/chat-attachments.ts
---

# Objective

Verify generated media is reattached on the follow-up turn.

# Setup

```yaml scenario.setup
- action: config.patch
  patch:
    agents:
      defaults:
        imageGenerationModel:
          primary: openai/gpt-image-1
- action: session.create
  key: agent:qa:image-roundtrip
```

# Steps

```yaml scenario.steps
- action: agent.send
  session: agent:qa:image-roundtrip
  message: |
    Image generation check: generate a QA lighthouse image and summarize it in one short sentence.
- action: artifact.capture
  kind: generated-image
  promptSnippet: Image generation check
  saveAs: lighthouseImage
- action: agent.send
  session: agent:qa:image-roundtrip
  message: |
    Roundtrip image inspection check: describe the generated lighthouse attachment in one short sentence.
  attachments:
    - fromArtifact: lighthouseImage
```

# Expect

```yaml scenario.expect
- assert: outbound.textIncludes
  value: lighthouse
- assert: requestLog.matches
  where:
    promptIncludes: Roundtrip image inspection check
  imageInputCountGte: 1
- assert: artifact.exists
  ref: lighthouseImage
```
````

## DSL이 다루어야 하는 러너 기능

현재 스위트를 기반으로 일반 러너는 프롬프트 실행 이상이 필요합니다.

### 환경 및 설정 작업

- `bus.reset`
- `gateway.waitHealthy`
- `channel.waitReady`
- `session.create`
- `thread.create`
- `workspace.writeSkill`

### 에이전트 턴 작업

- `agent.send`
- `agent.wait`
- `bus.injectInbound`
- `bus.injectOutbound`

### 구성 및 런타임 작업

- `config.get`
- `config.patch`
- `config.apply`
- `gateway.restart`
- `tools.effective`
- `skills.status`

### 파일 및 아티팩트 작업

- `file.write`
- `file.read`
- `file.delete`
- `file.touchTime`
- `artifact.captureGeneratedImage`
- `artifact.capturePath`

### 메모리 및 cron 작업

- `memory.indexForce`
- `memory.searchCli`
- `doctor.memory.status`
- `cron.list`
- `cron.run`
- `cron.waitCompletion`
- `sessionTranscript.write`

### MCP 작업

- `mcp.callTool`

### 어서션

- `outbound.textIncludes`
- `outbound.inThread`
- `outbound.notInRoot`
- `tool.called`
- `tool.notPresent`
- `skill.visible`
- `skill.disabled`
- `file.contains`
- `memory.contains`
- `requestLog.matches`
- `sessionStore.matches`
- `cron.managedPresent`
- `artifact.exists`

## 변수 및 아티팩트 참조

DSL은 저장된 출력과 이후 참조를 지원해야 합니다.

현재 스위트의 예시:

- 스레드 생성 후 `threadId` 재사용
- 세션 생성 후 `sessionKey` 재사용
- 이미지 생성 후 다음 턴에 파일 첨부
- 웨이크 마커 문자열 생성 후 나중에 나타나는지 어서션

필요한 기능:

- `saveAs`
- `${vars.name}`
- `${artifacts.name}`
- 경로, 세션 키, 스레드 ID, 마커, 도구 출력을 위한 타입 참조

변수 지원 없이 하네스는 계속 시나리오 로직을 TypeScript로 유출시킬 것입니다.

## 이스케이프 해치로 유지해야 할 것

완전히 순수한 선언적 러너는 1단계에서 현실적이지 않습니다.

일부 시나리오는 본질적으로 오케스트레이션이 무겁습니다:

- 메모리 꿈꾸기 스윕
- 구성 적용 재시작 활성화
- 구성 재시작 기능 전환
- 타임스탬프/경로에 의한 생성된 이미지 아티팩트 해결
- 검색 보고서 평가

이것들은 지금은 명시적 커스텀 핸들러를 사용해야 합니다.

권장 규칙:

- 85-90% 선언적
- 나머지 어려운 부분을 위한 명시적 `customHandler` 단계
- 명명되고 문서화된 커스텀 핸들러만
- 시나리오 파일에 익명 인라인 코드 없음

이렇게 하면 진행이 가능하면서도 일반 엔진이 깔끔하게 유지됩니다.

## 아키텍처 변경

### 현재

시나리오 마크다운이 이미 다음의 진실 소스입니다:

- 스위트 실행
- 워크스페이스 부트스트랩 파일
- QA Lab UI 시나리오 카탈로그
- 보고서 메타데이터
- 검색 프롬프트

생성된 호환성:

- 시드된 워크스페이스에는 여전히 `QA_KICKOFF_TASK.md` 포함
- 시드된 워크스페이스에는 여전히 `QA_SCENARIO_PLAN.md` 포함
- 시드된 워크스페이스에는 이제 `QA_SCENARIOS.md`도 포함

## 리팩토링 계획

### 1단계: 로더 및 스키마

완료.

- `qa/scenarios/index.md` 추가
- 시나리오를 `qa/scenarios/*.md`로 분할
- 명명된 마크다운 YAML 팩 콘텐츠용 파서 추가
- zod로 유효성 검사
- 소비자를 파싱된 팩으로 전환
- 리포지토리 수준 `qa/seed-scenarios.json` 및 `qa/QA_KICKOFF_TASK.md` 제거

### 2단계: 일반 엔진

- `extensions/qa-lab/src/suite.ts`를 다음으로 분할:
  - 로더
  - 엔진
  - 작업 레지스트리
  - 어서션 레지스트리
  - 커스텀 핸들러
- 기존 헬퍼 함수를 엔진 작업으로 유지

결과물:

- 엔진이 간단한 선언적 시나리오 실행

프롬프트 + 대기 + 어서션 위주의 시나리오부터 시작:

- 스레드 후속 조치
- 첨부 파일에서 이미지 이해
- 스킬 가시성 및 호출
- 채널 기준선

결과물:

- 일반 엔진을 통해 출시되는 첫 번째 실제 마크다운 정의 시나리오

### 4단계: 중간 시나리오 마이그레이션

- 이미지 생성 라운드트립
- 채널 컨텍스트에서 메모리 도구
- 세션 메모리 순위
- 서브에이전트 핸드오프
- 서브에이전트 팬아웃 합성

결과물:

- 변수, 아티팩트, 도구 어서션, 요청 로그 어서션 검증

### 5단계: 어려운 시나리오는 커스텀 핸들러 유지

- 메모리 꿈꾸기 스윕
- 구성 적용 재시작 활성화
- 구성 재시작 기능 전환
- 런타임 인벤토리 드리프트

결과물:

- 동일한 작성 형식이지만 필요한 경우 명시적 커스텀 단계 블록 포함

### 6단계: 하드코딩된 시나리오 맵 삭제

팩 커버리지가 충분히 좋아지면:

- `extensions/qa-lab/src/suite.ts`에서 대부분의 시나리오별 TypeScript 분기 제거

## 가짜 Slack / 리치 미디어 지원

현재 QA 버스는 텍스트 우선입니다.

관련 파일:

- `extensions/qa-channel/src/protocol.ts`
- `extensions/qa-lab/src/bus-state.ts`
- `extensions/qa-lab/src/bus-queries.ts`
- `extensions/qa-lab/src/bus-server.ts`
- `extensions/qa-lab/web/src/ui-render.ts`

현재 QA 버스 지원:

- 텍스트
- 반응
- 스레드

인라인 미디어 첨부 파일은 아직 모델링하지 않습니다.

### 필요한 전송 계약

일반 QA 버스 첨부 파일 모델 추가:

```ts
type QaBusAttachment = {
  id: string;
  kind: "image" | "video" | "audio" | "file";
  mimeType: string;
  fileName?: string;
  inline?: boolean;
  url?: string;
  contentBase64?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  altText?: string;
  transcript?: string;
};
```

그런 다음 다음에 `attachments?: QaBusAttachment[]` 추가:

- `QaBusMessage`
- `QaBusInboundMessageInput`
- `QaBusOutboundMessageInput`

### 먼저 일반적으로 하는 이유

Slack 전용 미디어 모델을 구축하지 마십시오.

대신:

- 하나의 일반 QA 전송 모델
- 그 위에 여러 렌더러
  - 현재 QA Lab 채팅
  - 향후 가짜 Slack 웹
  - 기타 가짜 전송 보기

이것은 중복 로직을 방지하고 미디어 시나리오가 전송에 구애받지 않도록 합니다.

### 필요한 UI 작업

QA UI를 업데이트하여 렌더링:

- 인라인 이미지 미리보기
- 인라인 오디오 플레이어
- 인라인 비디오 플레이어
- 파일 첨부 칩

현재 UI는 이미 스레드와 반응을 렌더링할 수 있으므로 첨부 파일 렌더링은 동일한 메시지 카드 모델에 레이어화되어야 합니다.

### 미디어 전송으로 가능한 시나리오 작업

QA 버스를 통해 첨부 파일이 흐르면 더 풍부한 가짜 채팅 시나리오를 추가할 수 있습니다:

- 가짜 Slack에서 인라인 이미지 응답
- 오디오 첨부 파일 이해
- 비디오 첨부 파일 이해
- 혼합 첨부 파일 순서
- 미디어가 유지된 스레드 응답

## 권고 사항

다음 구현 청크는 다음이어야 합니다:

1. 마크다운 시나리오 로더 + zod 스키마 추가
2. 마크다운에서 현재 카탈로그 생성
3. 먼저 몇 가지 간단한 시나리오 마이그레이션
4. 일반 QA 버스 첨부 파일 지원 추가
5. QA UI에서 인라인 이미지 렌더링
6. 그런 다음 오디오와 비디오로 확장

이것은 두 목표 모두를 증명하는 가장 작은 경로입니다:

- 일반 마크다운 정의 QA
- 더 풍부한 가짜 메시징 인터페이스

## 열린 질문

- 시나리오 파일이 변수 보간이 있는 내장된 마크다운 프롬프트 템플릿을 허용해야 하는지
- 설정/정리가 명명된 섹션이어야 하는지 아니면 순서 있는 작업 목록이어야 하는지
- 아티팩트 참조가 스키마에서 강타입화되어야 하는지 문자열 기반이어야 하는지
- 커스텀 핸들러가 하나의 레지스트리에 있어야 하는지 인터페이스별 레지스트리에 있어야 하는지
- 마이그레이션 중 생성된 JSON 호환성 파일이 체크인된 상태로 유지되어야 하는지
