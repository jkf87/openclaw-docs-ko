---
summary: "컨텍스트 엔진: 플러그형 컨텍스트 조립, 압축(compaction), 서브에이전트 라이프사이클"
read_when:
  - OpenClaw가 모델 컨텍스트를 어떻게 조립하는지 이해하고 싶을 때
  - 레거시 엔진과 플러그인 엔진 사이를 전환할 때
  - 컨텍스트 엔진 플러그인을 만들고 있을 때
title: "컨텍스트 엔진(Context engine)"
---

**컨텍스트 엔진(context engine)**은 OpenClaw가 각 실행마다 모델 컨텍스트를
어떻게 구축할지 제어합니다: 어떤 메시지를 포함할지, 오래된 이력을 어떻게
요약할지, 그리고 서브에이전트 경계 너머의 컨텍스트를 어떻게 관리할지입니다.

OpenClaw는 내장 `legacy` 엔진을 함께 제공하며 기본값으로 사용합니다 —
대부분의 사용자는 이를 변경할 필요가 없습니다. 다른 조립, 압축, 또는 세션
간 회상(recall) 동작을 원할 때에만 플러그인 엔진을 설치하고 선택하세요.

## 빠른 시작

어떤 엔진이 활성화되어 있는지 확인합니다:

```bash
openclaw doctor
# 또는 config를 직접 확인:
cat ~/.openclaw/openclaw.json | jq '.plugins.slots.contextEngine'
```

### 컨텍스트 엔진 플러그인 설치

컨텍스트 엔진 플러그인은 다른 OpenClaw 플러그인과 마찬가지로 설치합니다.
먼저 설치한 뒤 슬롯에서 엔진을 선택하세요:

```bash
# npm에서 설치
openclaw plugins install @martian-engineering/lossless-claw

# 또는 로컬 경로에서 설치 (개발용)
openclaw plugins install -l ./my-context-engine
```

그런 다음 플러그인을 활성화하고 config에서 활성 엔진으로 선택합니다:

```json5
// openclaw.json
{
  plugins: {
    slots: {
      contextEngine: "lossless-claw", // 플러그인이 등록한 엔진 id와 일치해야 함
    },
    entries: {
      "lossless-claw": {
        enabled: true,
        // 플러그인별 설정은 여기에 (플러그인 문서 참고)
      },
    },
  },
}
```

설치 및 설정 후 게이트웨이를 재시작하세요.

내장 엔진으로 되돌리려면 `contextEngine`을 `"legacy"`로 설정하거나
키를 통째로 제거하세요 — `"legacy"`가 기본값입니다.

## 동작 방식

OpenClaw가 모델 프롬프트를 실행할 때마다 컨텍스트 엔진은 다음 네 가지
라이프사이클 지점에 참여합니다:

1. **Ingest(수집)** — 세션에 새 메시지가 추가되면 호출됩니다. 엔진은
   메시지를 자체 데이터 저장소에 저장하거나 인덱싱할 수 있습니다.
2. **Assemble(조립)** — 각 모델 실행 전에 호출됩니다. 엔진은 토큰 예산
   내에 들어가는 정렬된 메시지 집합(그리고 선택적인 `systemPromptAddition`)을
   반환합니다.
3. **Compact(압축)** — 컨텍스트 윈도우가 꽉 찼거나 사용자가 `/compact`를
   실행했을 때 호출됩니다. 엔진은 오래된 이력을 요약해 공간을 확보합니다.
4. **After turn(턴 이후)** — 실행이 완료된 뒤 호출됩니다. 엔진은 상태를
   영속화하거나, 백그라운드 압축을 트리거하거나, 인덱스를 갱신할 수 있습니다.

번들된 비-ACP Codex harness의 경우, OpenClaw는 조립된 컨텍스트를 Codex
developer instructions와 현재 턴 프롬프트로 투영(project)하여 동일한
라이프사이클을 적용합니다. Codex는 여전히 자체 스레드 이력과 자체 컴팩터를
소유합니다.

### 서브에이전트 라이프사이클 (선택)

OpenClaw는 두 개의 선택적 서브에이전트 라이프사이클 훅을 호출합니다:

- **prepareSubagentSpawn** — 자식 실행이 시작되기 전에 공유 컨텍스트
  상태를 준비합니다. 훅은 부모/자식 세션 키, `contextMode`
  (`isolated` 또는 `fork`), 사용 가능한 transcript id/파일, 그리고 선택적
  TTL을 전달받습니다. 롤백 핸들을 반환하면, 준비가 성공한 뒤 spawn이 실패할
  때 OpenClaw가 이를 호출합니다.
- **onSubagentEnded** — 서브에이전트 세션이 완료되거나 청소(sweep)될 때
  정리 작업을 수행합니다.

### 시스템 프롬프트 추가

`assemble` 메서드는 `systemPromptAddition` 문자열을 반환할 수 있습니다.
OpenClaw는 이를 해당 실행의 시스템 프롬프트 앞에 prepend합니다. 이를 통해
엔진은 정적 워크스페이스 파일 없이도 동적 회상(recall) 안내, 검색 지시,
또는 컨텍스트 인지형 힌트를 주입할 수 있습니다.

## 레거시 엔진

내장 `legacy` 엔진은 OpenClaw의 기존 동작을 유지합니다:

- **Ingest**: no-op (세션 매니저가 메시지 영속화를 직접 처리).
- **Assemble**: 통과(pass-through) — 런타임의 기존 sanitize → validate → limit
  파이프라인이 컨텍스트 조립을 처리합니다.
- **Compact**: 내장 요약 압축에 위임합니다. 오래된 메시지의 단일 요약을
  생성하고 최근 메시지는 그대로 유지합니다.
- **After turn**: no-op.

레거시 엔진은 도구를 등록하지 않으며 `systemPromptAddition`을 제공하지
않습니다.

`plugins.slots.contextEngine`이 설정되어 있지 않거나 `"legacy"`로 설정되면
이 엔진이 자동으로 사용됩니다.

## 플러그인 엔진

플러그인은 플러그인 API를 사용해 컨텍스트 엔진을 등록할 수 있습니다:

```ts
import { buildMemorySystemPromptAddition } from "openclaw/plugin-sdk/core";

export default function register(api) {
  api.registerContextEngine("my-engine", () => ({
    info: {
      id: "my-engine",
      name: "My Context Engine",
      ownsCompaction: true,
    },

    async ingest({ sessionId, message, isHeartbeat }) {
      // 데이터 저장소에 메시지 저장
      return { ingested: true };
    },

    async assemble({ sessionId, messages, tokenBudget, availableTools, citationsMode }) {
      // 예산에 맞는 메시지 반환
      return {
        messages: buildContext(messages, tokenBudget),
        estimatedTokens: countTokens(messages),
        systemPromptAddition: buildMemorySystemPromptAddition({
          availableTools: availableTools ?? new Set(),
          citationsMode,
        }),
      };
    },

    async compact({ sessionId, force }) {
      // 오래된 컨텍스트 요약
      return { ok: true, compacted: true };
    },
  }));
}
```

그런 다음 config에서 활성화합니다:

```json5
{
  plugins: {
    slots: {
      contextEngine: "my-engine",
    },
    entries: {
      "my-engine": {
        enabled: true,
      },
    },
  },
}
```

### ContextEngine 인터페이스

필수 멤버:

| 멤버               | 종류     | 목적                                                       |
| ------------------ | -------- | ---------------------------------------------------------- |
| `info`             | 속성     | 엔진 id, 이름, 버전, 그리고 압축을 소유하는지 여부         |
| `ingest(params)`   | 메서드   | 단일 메시지 저장                                           |
| `assemble(params)` | 메서드   | 모델 실행용 컨텍스트 구성 (`AssembleResult` 반환)          |
| `compact(params)`  | 메서드   | 컨텍스트 요약/축소                                         |

`assemble`은 다음을 포함하는 `AssembleResult`를 반환합니다:

- `messages` — 모델에 보낼 정렬된 메시지.
- `estimatedTokens` (필수, `number`) — 엔진이 추정한 조립된 컨텍스트의
  총 토큰 수. OpenClaw는 이를 압축 임계값 판단과 진단 리포트에 사용합니다.
- `systemPromptAddition` (선택, `string`) — 시스템 프롬프트 앞에 prepend됨.

선택 멤버:

| 멤버                           | 종류   | 목적                                                                                                                  |
| ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `bootstrap(params)`            | 메서드 | 세션용 엔진 상태 초기화. 엔진이 해당 세션을 처음 볼 때 한 번 호출됨(예: 이력 임포트).                                 |
| `ingestBatch(params)`          | 메서드 | 완료된 턴을 배치로 수집. 실행 완료 후 해당 턴의 모든 메시지를 한 번에 전달받아 호출됨.                                |
| `afterTurn(params)`            | 메서드 | 실행 후 라이프사이클 작업(상태 영속화, 백그라운드 압축 트리거).                                                       |
| `prepareSubagentSpawn(params)` | 메서드 | 자식 세션이 시작되기 전에 공유 상태를 설정.                                                                           |
| `onSubagentEnded(params)`      | 메서드 | 서브에이전트 종료 후 정리.                                                                                            |
| `dispose()`                    | 메서드 | 리소스 해제. 게이트웨이 종료 또는 플러그인 리로드 시 호출됨 — 세션 단위가 아님.                                       |

### ownsCompaction

`ownsCompaction`은 해당 실행에서 Pi의 내장 in-attempt 자동 압축이 활성화된
채 유지될지를 제어합니다:

- `true` — 엔진이 압축 동작을 소유합니다. OpenClaw는 해당 실행에서 Pi의
  내장 자동 압축을 비활성화하며, 엔진의 `compact()` 구현이 `/compact`,
  오버플로우 복구 압축, 그리고 `afterTurn()`에서 수행하려는 모든 선제적
  압축을 책임집니다.
- `false` 또는 미설정 — Pi의 내장 자동 압축이 프롬프트 실행 중에 여전히
  동작할 수 있지만, 활성 엔진의 `compact()` 메서드는 여전히 `/compact`와
  오버플로우 복구를 위해 호출됩니다.

`ownsCompaction: false`는 OpenClaw가 레거시 엔진의 압축 경로로 자동
폴백한다는 의미가 **아닙니다**.

따라서 두 가지 유효한 플러그인 패턴이 있습니다:

- **Owning 모드** — 자체 압축 알고리즘을 구현하고 `ownsCompaction: true`로
  설정.
- **Delegating 모드** — `ownsCompaction: false`로 설정하고 `compact()`에서
  `openclaw/plugin-sdk/core`의 `delegateCompactionToRuntime(...)`을 호출해
  OpenClaw의 내장 압축 동작을 사용.

활성 non-owning 엔진에서 no-op `compact()`는 안전하지 않습니다. 해당 엔진
슬롯에서 일반적인 `/compact`와 오버플로우 복구 압축 경로를 비활성화하기
때문입니다.

## 설정 레퍼런스

```json5
{
  plugins: {
    slots: {
      // 활성 컨텍스트 엔진 선택. 기본값: "legacy".
      // 플러그인 엔진을 사용하려면 플러그인 id로 설정.
      contextEngine: "legacy",
    },
  },
}
```

슬롯은 실행 시점에 배타적입니다 — 주어진 실행 또는 압축 연산에 대해 오직
하나의 등록된 컨텍스트 엔진만 해석(resolve)됩니다. 다른 활성화된
`kind: "context-engine"` 플러그인들도 여전히 로드되고 등록 코드는 실행될
수 있지만, `plugins.slots.contextEngine`은 OpenClaw가 컨텍스트 엔진이
필요할 때 어떤 등록된 엔진 id로 해석할지만 선택합니다.

## 압축 및 메모리와의 관계

- **압축(Compaction)**은 컨텍스트 엔진의 한 가지 책임입니다. 레거시 엔진은
  OpenClaw의 내장 요약에 위임합니다. 플러그인 엔진은 어떠한 압축 전략이든
  구현할 수 있습니다 (DAG 요약, 벡터 검색 등).
- **메모리 플러그인(Memory plugins)**(`plugins.slots.memory`)은 컨텍스트
  엔진과 별개입니다. 메모리 플러그인은 검색/조회를 제공하고, 컨텍스트 엔진은
  모델이 보는 것을 제어합니다. 둘은 함께 동작할 수 있습니다 — 컨텍스트
  엔진이 조립 중에 메모리 플러그인 데이터를 사용할 수 있습니다. active
  memory prompt 경로를 원하는 플러그인 엔진은 `openclaw/plugin-sdk/core`의
  `buildMemorySystemPromptAddition(...)`을 선호하는 것이 좋습니다. 이것은
  active memory prompt 섹션을 곧바로 prepend할 수 있는 `systemPromptAddition`
  으로 변환해 줍니다. 엔진이 더 낮은 수준의 제어가 필요하다면,
  `openclaw/plugin-sdk/memory-host-core`의 `buildActiveMemoryPromptSection(...)`
  을 통해 원시(raw) 라인을 직접 가져올 수도 있습니다.
- **세션 프루닝(Session pruning)**(메모리에서 오래된 도구 결과를 잘라내는
  작업)은 어떤 컨텍스트 엔진이 활성이든 상관없이 여전히 동작합니다.

## 팁

- `openclaw doctor`를 사용해 엔진이 올바르게 로드되고 있는지 확인하세요.
- 엔진을 전환할 때, 기존 세션은 현재 이력을 그대로 유지한 채 계속됩니다.
  새 엔진은 이후 실행부터 인계받습니다.
- 엔진 오류는 로그되고 진단 리포트에 표시됩니다. 플러그인 엔진이 등록에
  실패하거나 선택된 엔진 id를 해석할 수 없으면, OpenClaw는 자동 폴백하지
  않습니다; 플러그인을 수정하거나 `plugins.slots.contextEngine`을
  `"legacy"`로 되돌릴 때까지 실행이 실패합니다.
- 개발 시에는 `openclaw plugins install -l ./my-engine`을 사용해 복사 없이
  로컬 플러그인 디렉터리를 연결(link)할 수 있습니다.

참고: [압축(Compaction)](/concepts/compaction), [컨텍스트](/concepts/context),
[플러그인](/tools/plugin), [플러그인 매니페스트](/plugins/manifest).

## 관련 문서

- [컨텍스트](/concepts/context) — 에이전트 턴을 위해 컨텍스트가 어떻게 구성되는지
- [플러그인 아키텍처](/plugins/architecture) — 컨텍스트 엔진 플러그인 등록
- [압축(Compaction)](/concepts/compaction) — 긴 대화 요약하기
