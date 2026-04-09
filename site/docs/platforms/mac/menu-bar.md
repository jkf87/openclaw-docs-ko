---
title: "메뉴 바"
description: "메뉴 바 상태 로직 및 사용자에게 표시되는 내용"
---

# 메뉴 바 상태 로직

## 표시되는 내용

- 메뉴 바 아이콘과 메뉴의 첫 번째 상태 행에 현재 에이전트 작업 상태를 표시합니다.
- 작업이 활성 상태인 동안 상태 표시는 숨겨집니다. 모든 세션이 유휴 상태가 되면 돌아옵니다.
- 메뉴의 "Nodes" 블록은 `node.list`를 통한 페어링된 노드인 **기기**만 나열합니다. 클라이언트/프레전스 항목은 제외됩니다.
- 공급자 사용 스냅샷이 사용 가능한 경우 Context 아래에 "Usage" 섹션이 나타납니다.

## 상태 모델

- 세션: 이벤트는 `runId` (실행당) 및 페이로드의 `sessionKey`와 함께 도착합니다. "main" 세션은 키 `main`입니다. 없으면 가장 최근에 업데이트된 세션으로 대체됩니다.
- 우선순위: main이 항상 우선합니다. main이 활성 상태이면 상태가 즉시 표시됩니다. main이 유휴 상태이면 가장 최근에 활성 상태였던 main이 아닌 세션이 표시됩니다. 활동 중간에 전환하지 않습니다. 현재 세션이 유휴 상태가 되거나 main이 활성화될 때만 전환합니다.
- 활동 종류:
  - `job`: 고수준 명령 실행 (`state: started|streaming|done|error`).
  - `tool`: `toolName` 및 `meta/args`와 함께 `phase: start|result`.

## IconState 열거형 (Swift)

- `idle`
- `workingMain(ActivityKind)`
- `workingOther(ActivityKind)`
- `overridden(ActivityKind)` (디버그 재정의)

### ActivityKind → 글리프

- `exec` → 💻
- `read` → 📄
- `write` → ✍️
- `edit` → 📝
- `attach` → 📎
- 기본값 → 🛠️

### 시각적 매핑

- `idle`: 일반 크리터.
- `workingMain`: 글리프가 있는 배지, 전체 색조, 다리 "작업 중" 애니메이션.
- `workingOther`: 글리프가 있는 배지, 음소거된 색조, 스커리 없음.
- `overridden`: 활동에 관계없이 선택한 글리프/색조를 사용합니다.

## 상태 행 텍스트 (메뉴)

- 작업이 활성 상태인 동안: `&lt;Session role&gt; · &lt;activity label&gt;`
  - 예시: `Main · exec: pnpm test`, `Other · read: apps/macos/Sources/OpenClaw/AppState.swift`.
- 유휴 상태일 때: 상태 요약으로 대체됩니다.

## 이벤트 수집

- 소스: 제어 채널 `agent` 이벤트 (`ControlChannel.handleAgentEvent`).
- 파싱된 필드:
  - 시작/중지를 위한 `data.state`와 함께 `stream: "job"`.
  - `data.phase`, `name`, 선택적 `meta`/`args`와 함께 `stream: "tool"`.
- 레이블:
  - `exec`: `args.command`의 첫 번째 줄.
  - `read`/`write`: 축약된 경로.
  - `edit`: `meta`/diff 수에서 추론된 변경 종류와 함께 경로.
  - 대체: 도구 이름.

## 디버그 재정의

- 설정 ▸ Debug ▸ "Icon override" 선택기:
  - `System (auto)` (기본값)
  - `Working: main` (도구 종류별)
  - `Working: other` (도구 종류별)
  - `Idle`
- `@AppStorage("iconOverride")`를 통해 저장됨; `IconState.overridden`에 매핑됨.

## 테스트 체크리스트

- main 세션 작업 트리거: 아이콘이 즉시 전환되고 상태 행에 main 레이블이 표시되는지 확인.
- main이 유휴 상태인 동안 main이 아닌 세션 작업 트리거: 아이콘/상태가 main이 아닌 것을 표시하고 완료될 때까지 안정적으로 유지.
- 다른 세션이 활성 상태인 동안 main 시작: 아이콘이 즉시 main으로 전환.
- 빠른 도구 버스트: 배지가 깜빡이지 않는지 확인 (도구 결과에 TTL 유예 적용).
- 모든 세션이 유휴 상태가 되면 상태 행이 다시 나타납니다.
