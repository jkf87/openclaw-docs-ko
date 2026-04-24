---
title: "Codex Harness 컨텍스트 엔진 포트"
summary: "번들된 Codex app-server harness가 OpenClaw 컨텍스트 엔진(context-engine) 플러그인을 존중하도록 만드는 구현 명세"
read_when:
  - 컨텍스트 엔진 생명주기 동작을 Codex harness에 연결하려는 경우
  - `lossless-claw` 또는 기타 컨텍스트 엔진 플러그인이 codex/* 임베디드 harness 세션과 함께 작동해야 하는 경우
  - 임베디드 PI와 Codex app-server의 컨텍스트 동작을 비교하려는 경우
---

# Codex Harness 컨텍스트 엔진 포트

## 상태

초안 구현 명세(Draft implementation specification).

## 목표

번들된 Codex app-server harness가, 임베디드 PI 턴이 이미 존중하는 것과 동일한 OpenClaw 컨텍스트 엔진(context-engine) 생명주기 계약을 존중하도록 만듭니다.

`agents.defaults.embeddedHarness.runtime: "codex"` 또는 `codex/*` 모델을 사용하는 세션은, Codex app-server 경계가 허용하는 한도 내에서 선택된 컨텍스트 엔진 플러그인(예: `lossless-claw`)이 컨텍스트 assemble, 턴 이후 ingest, maintenance, 그리고 OpenClaw 수준의 compaction 정책을 계속 제어할 수 있어야 합니다.

## 비목표(Non-goals)

- Codex app-server 내부를 재구현하지 않습니다.
- Codex 네이티브 스레드 compaction이 lossless-claw 요약을 생성하도록 만들지 않습니다.
- Codex가 아닌 모델이 Codex harness를 사용하도록 요구하지 않습니다.
- ACP/acpx 세션 동작을 변경하지 않습니다. 이 명세는 비-ACP 임베디드 에이전트 harness 경로만 대상으로 합니다.
- 서드파티 플러그인이 Codex app-server 확장 팩토리를 등록하도록 요구하지 않습니다. 기존의 번들 플러그인 신뢰 경계는 변경되지 않습니다.

## 현재 아키텍처

임베디드 실행 루프는 구체적인 저수준 harness를 선택하기 전에, 실행당 한 번 구성된 컨텍스트 엔진을 해석합니다:

- `src/agents/pi-embedded-runner/run.ts`
  - 컨텍스트 엔진 플러그인을 초기화합니다.
  - `resolveContextEngine(params.config)`를 호출합니다.
  - `contextEngine`과 `contextTokenBudget`을 `runEmbeddedAttemptWithBackend(...)`에 전달합니다.

`runEmbeddedAttemptWithBackend(...)`는 선택된 에이전트 harness에 위임합니다:

- `src/agents/pi-embedded-runner/run/backend.ts`
- `src/agents/harness/selection.ts`

Codex app-server harness는 번들된 Codex 플러그인에 의해 등록됩니다:

- `extensions/codex/index.ts`
- `extensions/codex/harness.ts`

Codex harness 구현은 PI 기반 attempt와 동일한 `EmbeddedRunAttemptParams`를 받습니다:

- `extensions/codex/src/app-server/run-attempt.ts`

이는 필요한 훅 포인트가 OpenClaw가 제어하는 코드 안에 있다는 것을 의미합니다. 외부 경계는 Codex app-server 프로토콜 자체입니다. OpenClaw는 `thread/start`, `thread/resume`, `turn/start`에 전송하는 내용을 제어하고 알림을 관찰할 수 있지만, Codex의 내부 스레드 저장소나 네이티브 compactor는 변경할 수 없습니다.

## 현재 격차(Current gap)

임베디드 PI attempt는 컨텍스트 엔진 생명주기를 직접 호출합니다:

- attempt 이전의 bootstrap/maintenance
- 모델 호출 이전의 assemble
- attempt 이후의 afterTurn 또는 ingest
- 성공적인 턴 이후의 maintenance
- compaction을 소유하는 엔진을 위한 컨텍스트 엔진 compaction

관련 PI 코드:

- `src/agents/pi-embedded-runner/run/attempt.ts`
- `src/agents/pi-embedded-runner/run/attempt.context-engine-helpers.ts`
- `src/agents/pi-embedded-runner/context-engine-maintenance.ts`

Codex app-server attempt는 현재 일반 에이전트 harness 훅을 실행하고 전사(transcript)를 미러링하지만, `params.contextEngine.bootstrap`, `params.contextEngine.assemble`, `params.contextEngine.afterTurn`, `params.contextEngine.ingestBatch`, `params.contextEngine.ingest`, `params.contextEngine.maintain`는 호출하지 않습니다.

관련 Codex 코드:

- `extensions/codex/src/app-server/run-attempt.ts`
- `extensions/codex/src/app-server/thread-lifecycle.ts`
- `extensions/codex/src/app-server/event-projector.ts`
- `extensions/codex/src/app-server/compact.ts`

## 목표 동작(Desired behavior)

Codex harness 턴에 대해, OpenClaw는 다음 생명주기를 보존해야 합니다:

1. 미러링된 OpenClaw 세션 전사를 읽습니다.
2. 이전 세션 파일이 존재하면 활성 컨텍스트 엔진을 bootstrap합니다.
3. 사용 가능한 경우 bootstrap maintenance를 실행합니다.
4. 활성 컨텍스트 엔진을 사용해 컨텍스트를 assemble합니다.
5. assemble된 컨텍스트를 Codex 호환 입력으로 변환합니다.
6. 컨텍스트 엔진의 `systemPromptAddition`을 포함하는 developer instructions로 Codex 스레드를 시작하거나 재개합니다.
7. assemble된 사용자 대면 프롬프트로 Codex 턴을 시작합니다.
8. Codex 결과를 OpenClaw 전사로 다시 미러링합니다.
9. `afterTurn`이 구현되어 있으면 이를 호출하고, 그렇지 않으면 미러링된 전사 스냅샷을 사용해 `ingestBatch`/`ingest`를 호출합니다.
10. 성공적이고 중단되지 않은 턴 이후에 턴 maintenance를 실행합니다.
11. Codex 네이티브 compaction 신호와 OpenClaw compaction 훅을 보존합니다.

## 설계 제약(Design constraints)

### Codex app-server는 네이티브 스레드 상태에 대해 정규(canonical)로 유지

Codex는 자신의 네이티브 스레드와 내부 확장 히스토리를 소유합니다. OpenClaw는 지원되는 프로토콜 호출을 제외하고는 app-server의 내부 히스토리를 변경하려고 시도해서는 안 됩니다.

OpenClaw의 전사 미러는 다음 OpenClaw 기능의 소스(source)로 유지됩니다:

- 채팅 히스토리
- 검색
- `/new` 및 `/reset` bookkeeping
- 향후 모델 또는 harness 전환
- 컨텍스트 엔진 플러그인 상태

### 컨텍스트 엔진 assembly는 Codex 입력으로 투영(project)되어야 함

컨텍스트 엔진 인터페이스는 Codex 스레드 패치가 아니라 OpenClaw `AgentMessage[]`를 반환합니다. Codex app-server `turn/start`는 현재 사용자 입력을 받고, `thread/start`와 `thread/resume`은 developer instructions를 받습니다.

따라서 구현에는 투영 계층(projection layer)이 필요합니다. 안전한 첫 버전은 Codex 내부 히스토리를 대체할 수 있는 척하지 말아야 합니다. assemble된 컨텍스트를 현재 턴 주변에 결정론적 prompt/developer-instruction 자료로 주입해야 합니다.

### 프롬프트 캐시 안정성이 중요

`lossless-claw` 같은 엔진의 경우, assemble된 컨텍스트는 변경되지 않은 입력에 대해 결정론적이어야 합니다. 생성된 컨텍스트 텍스트에 타임스탬프, 랜덤 id 또는 비결정론적 순서를 추가하지 마십시오.

### PI 폴백 의미는 변경되지 않음

Harness 선택은 그대로 유지됩니다:

- `runtime: "pi"`는 PI를 강제합니다.
- `runtime: "codex"`는 등록된 Codex harness를 선택합니다.
- `runtime: "auto"`는 플러그인 harness가 지원되는 제공자를 주장할 수 있게 합니다.
- `fallback: "none"`은 일치하는 플러그인 harness가 없을 때 PI 폴백을 비활성화합니다.

이 작업은 Codex harness가 선택된 이후에 어떤 일이 일어나는지를 변경합니다.

## 구현 계획

### 1. 재사용 가능한 컨텍스트 엔진 attempt 헬퍼를 내보내거나 재배치

오늘날 재사용 가능한 생명주기 헬퍼는 PI 러너 아래에 있습니다:

- `src/agents/pi-embedded-runner/run/attempt.context-engine-helpers.ts`
- `src/agents/pi-embedded-runner/run/attempt.prompt-helpers.ts`
- `src/agents/pi-embedded-runner/context-engine-maintenance.ts`

Codex가 피할 수 있다면, 이름이 PI를 암시하는 구현 경로에서 import하지 않는 것이 좋습니다.

harness 중립 모듈을 만듭니다. 예를 들면:

- `src/agents/harness/context-engine-lifecycle.ts`

다음을 이동하거나 재내보내기(re-export)합니다:

- `runAttemptContextEngineBootstrap`
- `assembleAttemptContextEngine`
- `finalizeAttemptContextEngineTurn`
- `buildAfterTurnRuntimeContext`
- `buildAfterTurnRuntimeContextFromUsage`
- `runContextEngineMaintenance` 주변의 작은 wrapper

기존 파일에서 재내보내거나 같은 PR에서 PI 호출 지점을 업데이트하여 PI import가 계속 작동하도록 유지합니다.

중립 헬퍼 이름은 PI를 언급하지 않아야 합니다.

제안 이름:

- `bootstrapHarnessContextEngine`
- `assembleHarnessContextEngine`
- `finalizeHarnessContextEngineTurn`
- `buildHarnessContextEngineRuntimeContext`
- `runHarnessContextEngineMaintenance`

### 2. Codex 컨텍스트 투영 헬퍼 추가

새 모듈을 추가합니다:

- `extensions/codex/src/app-server/context-engine-projection.ts`

책임:

- assemble된 `AgentMessage[]`, 원본 미러링된 히스토리, 현재 프롬프트를 받습니다.
- 어떤 컨텍스트가 developer instructions에 속하고 어떤 것이 현재 사용자 입력에 속하는지 결정합니다.
- 현재 사용자 프롬프트를 최종 actionable 요청으로 보존합니다.
- 이전 메시지를 안정적이고 명시적인 형식으로 렌더링합니다.
- 휘발성 메타데이터를 피합니다.

제안되는 API:

```ts
export type CodexContextProjection = {
  developerInstructionAddition?: string;
  promptText: string;
  assembledMessages: AgentMessage[];
  prePromptMessageCount: number;
};

export function projectContextEngineAssemblyForCodex(params: {
  assembledMessages: AgentMessage[];
  originalHistoryMessages: AgentMessage[];
  prompt: string;
  systemPromptAddition?: string;
}): CodexContextProjection;
```

권장되는 첫 투영:

- `systemPromptAddition`을 developer instructions에 넣습니다.
- `promptText`에서 현재 프롬프트 앞에 assemble된 전사 컨텍스트를 넣습니다.
- OpenClaw assemble된 컨텍스트로 명확히 레이블링합니다.
- 현재 프롬프트를 마지막에 유지합니다.
- 현재 사용자 프롬프트가 이미 끝에 나타나면 중복을 제외합니다.

프롬프트 형태 예:

```text
OpenClaw assembled context for this turn:

<conversation_context>
[user]
...

[assistant]
...
</conversation_context>

Current user request:
...
```

이것은 네이티브 Codex 히스토리 수술(surgery)보다는 덜 우아하지만, OpenClaw 내부에서 구현 가능하며 컨텍스트 엔진 의미(semantics)를 보존합니다.

향후 개선: Codex app-server가 스레드 히스토리를 대체하거나 보완하는 프로토콜을 노출하면, 이 투영 계층을 해당 API를 사용하도록 교체합니다.

### 3. Codex 스레드 시작 이전에 bootstrap 연결

`extensions/codex/src/app-server/run-attempt.ts`에서:

- 오늘날처럼 미러링된 세션 히스토리를 읽습니다.
- 이번 실행 이전에 세션 파일이 존재했는지 판별합니다. 미러링 쓰기 전에 `fs.stat(params.sessionFile)`을 확인하는 헬퍼를 선호합니다.
- 헬퍼가 요구하면 `SessionManager`를 열거나 좁은 세션 매니저 adapter를 사용합니다.
- `params.contextEngine`이 존재하면 중립 bootstrap 헬퍼를 호출합니다.

의사 흐름(pseudo-flow):

```ts
const hadSessionFile = await fileExists(params.sessionFile);
const sessionManager = SessionManager.open(params.sessionFile);
const historyMessages = sessionManager.buildSessionContext().messages;

await bootstrapHarnessContextEngine({
  hadSessionFile,
  contextEngine: params.contextEngine,
  sessionId: params.sessionId,
  sessionKey: sandboxSessionKey,
  sessionFile: params.sessionFile,
  sessionManager,
  runtimeContext: buildHarnessContextEngineRuntimeContext(...),
  runMaintenance: runHarnessContextEngineMaintenance,
  warn,
});
```

Codex 도구 브리지 및 전사 미러와 동일한 `sessionKey` 규약을 사용합니다. 오늘날 Codex는 `params.sessionKey` 또는 `params.sessionId`에서 `sandboxSessionKey`를 계산합니다. 원시 `params.sessionKey`를 보존할 이유가 없다면 이를 일관되게 사용하십시오.

### 4. `thread/start` / `thread/resume` 및 `turn/start` 이전에 assemble 연결

`runCodexAppServerAttempt`에서:

1. 컨텍스트 엔진이 실제로 사용 가능한 도구 이름을 볼 수 있도록, 동적 도구를 먼저 빌드합니다.
2. 미러링된 세션 히스토리를 읽습니다.
3. `params.contextEngine`이 존재하면 컨텍스트 엔진 `assemble(...)`을 실행합니다.
4. assemble된 결과를 다음으로 투영합니다:
   - developer instruction addition
   - `turn/start`를 위한 prompt text

기존 훅 호출:

```ts
resolveAgentHarnessBeforePromptBuildResult({
  prompt: params.prompt,
  developerInstructions: buildDeveloperInstructions(params),
  messages: historyMessages,
  ctx: hookContext,
});
```

이것은 컨텍스트 인식(context-aware)이 되어야 합니다:

1. `buildDeveloperInstructions(params)`로 기본 developer instructions를 계산합니다.
2. 컨텍스트 엔진 assembly/projection을 적용합니다.
3. 투영된 prompt/developer instructions로 `before_prompt_build`를 실행합니다.

이 순서는 일반 prompt 훅이 Codex가 받을 것과 동일한 프롬프트를 보게 합니다. PI와의 엄격한 패리티가 필요하다면, PI가 프롬프트 파이프라인 이후 컨텍스트 엔진의 `systemPromptAddition`을 최종 시스템 프롬프트에 적용하므로, 훅 구성 이전에 컨텍스트 엔진 assembly를 실행하십시오. 중요한 불변식(invariant)은 컨텍스트 엔진과 훅 모두 결정론적이고 문서화된 순서를 얻는다는 것입니다.

첫 구현에 권장되는 순서:

1. `buildDeveloperInstructions(params)`
2. 컨텍스트 엔진 `assemble()`
3. `systemPromptAddition`을 developer instructions에 추가(append/prepend)
4. assemble된 메시지를 prompt text로 투영
5. `resolveAgentHarnessBeforePromptBuildResult(...)`
6. 최종 developer instructions를 `startOrResumeThread(...)`에 전달
7. 최종 prompt text를 `buildTurnStartParams(...)`에 전달

이 명세는 테스트로 인코딩되어야 하며, 향후 변경이 실수로 순서를 바꾸지 못하도록 해야 합니다.

### 5. 프롬프트 캐시 안정 포맷 보존

투영 헬퍼는 동일한 입력에 대해 바이트 수준에서 안정적인(byte-stable) 출력을 생성해야 합니다:

- 안정적인 메시지 순서
- 안정적인 role 레이블
- 생성된 타임스탬프 없음
- 객체 키 순서 유출 없음
- 랜덤 구분자 없음
- 실행별 id 없음

고정된 구분자와 명시적 섹션을 사용하십시오.

### 6. 전사 미러링 이후 post-turn 연결

Codex의 `CodexAppServerEventProjector`는 현재 턴에 대한 로컬 `messagesSnapshot`을 빌드합니다. `mirrorTranscriptBestEffort(...)`가 해당 스냅샷을 OpenClaw 전사 미러에 기록합니다.

미러링이 성공하거나 실패한 후, 사용 가능한 최선의 메시지 스냅샷으로 컨텍스트 엔진 finalizer를 호출합니다:

- `afterTurn`은 현재 턴만이 아니라 세션 스냅샷을 기대하므로, 쓰기 후 전체 미러링된 세션 컨텍스트를 선호합니다.
- 세션 파일을 다시 열 수 없으면 `historyMessages + result.messagesSnapshot`으로 폴백합니다.

의사 흐름:

```ts
const prePromptMessageCount = historyMessages.length;
await mirrorTranscriptBestEffort(...);
const finalMessages = readMirroredSessionHistoryMessages(params.sessionFile)
  ?? [...historyMessages, ...result.messagesSnapshot];

await finalizeHarnessContextEngineTurn({
  contextEngine: params.contextEngine,
  promptError: Boolean(finalPromptError),
  aborted: finalAborted,
  yieldAborted,
  sessionIdUsed: params.sessionId,
  sessionKey: sandboxSessionKey,
  sessionFile: params.sessionFile,
  messagesSnapshot: finalMessages,
  prePromptMessageCount,
  tokenBudget: params.contextTokenBudget,
  runtimeContext: buildHarnessContextEngineRuntimeContextFromUsage({
    attempt: params,
    workspaceDir: effectiveWorkspace,
    agentDir,
    tokenBudget: params.contextTokenBudget,
    lastCallUsage: result.attemptUsage,
    promptCache: result.promptCache,
  }),
  runMaintenance: runHarnessContextEngineMaintenance,
  sessionManager,
  warn,
});
```

미러링이 실패하더라도 폴백 스냅샷으로 `afterTurn`을 호출하되, 컨텍스트 엔진이 폴백 턴 데이터에서 ingest하고 있음을 로그로 남깁니다.

### 7. 사용량과 프롬프트 캐시 런타임 컨텍스트 정규화

Codex 결과는 사용 가능한 경우 app-server 토큰 알림에서 정규화된 사용량을 포함합니다. 그 사용량을 컨텍스트 엔진 런타임 컨텍스트로 전달합니다.

Codex app-server가 결국 캐시 read/write 세부 사항을 노출하면, 이를 `ContextEnginePromptCacheInfo`에 매핑하십시오. 그때까지는 0을 지어내는 대신 `promptCache`를 생략하십시오.

### 8. Compaction 정책

두 가지 compaction 시스템이 있습니다:

1. OpenClaw 컨텍스트 엔진 `compact()`
2. Codex app-server 네이티브 `thread/compact/start`

이들을 조용히 혼동하지 마십시오.

#### `/compact` 및 명시적 OpenClaw compaction

선택된 컨텍스트 엔진이 `info.ownsCompaction === true`이면, 명시적 OpenClaw compaction은 OpenClaw 전사 미러와 플러그인 상태에 대해 컨텍스트 엔진의 `compact()` 결과를 선호해야 합니다.

선택된 Codex harness에 네이티브 스레드 바인딩이 있으면, app-server 스레드를 건강하게 유지하기 위해 Codex 네이티브 compaction을 추가로 요청할 수 있지만, 이는 세부사항에서 별도 백엔드 action으로 보고되어야 합니다.

권장 동작:

- `contextEngine.info.ownsCompaction === true`이면:
  - 컨텍스트 엔진 `compact()`를 먼저 호출합니다.
  - 그 다음 스레드 바인딩이 존재하면 Codex 네이티브 compaction을 best-effort로 호출합니다.
  - 컨텍스트 엔진 결과를 주(primary) 결과로 반환합니다.
  - `details.codexNativeCompaction`에 Codex 네이티브 compaction 상태를 포함합니다.
- 활성 컨텍스트 엔진이 compaction을 소유하지 않으면:
  - 현재 Codex 네이티브 compaction 동작을 보존합니다.

이는 `maybeCompactAgentHarnessSession(...)`이 어디서 호출되는지에 따라 `extensions/codex/src/app-server/compact.ts`를 변경하거나 일반 compaction 경로에서 래핑하는 것을 요구할 가능성이 높습니다.

#### 턴 내 Codex 네이티브 contextCompaction 이벤트

Codex는 턴 동안 `contextCompaction` 아이템 이벤트를 방출할 수 있습니다. `event-projector.ts`의 현재 before/after compaction 훅 emit을 유지하되, 그것을 완료된 컨텍스트 엔진 compaction으로 취급하지 마십시오.

compaction을 소유하는 엔진의 경우, Codex가 어쨌든 네이티브 compaction을 수행하면 명시적 진단을 emit하십시오:

- 스트림/이벤트 이름: 기존 `compaction` 스트림이 허용됩니다.
- 세부사항: `{ backend: "codex-app-server", ownsCompaction: true }`

이것은 분할을 감사 가능하게(auditable) 만듭니다.

### 9. 세션 reset 및 바인딩 동작

기존 Codex harness `reset(...)`은 OpenClaw 세션 파일에서 Codex app-server 바인딩을 지웁니다. 그 동작을 보존하십시오.

또한 컨텍스트 엔진 상태 정리가 기존 OpenClaw 세션 생명주기 경로를 통해 계속 발생하도록 보장하십시오. 컨텍스트 엔진 생명주기가 현재 모든 harness에 대해 reset/delete 이벤트를 놓치는 경우가 아니라면, Codex 전용 정리를 추가하지 마십시오.

### 10. 에러 처리

PI 의미(semantics)를 따릅니다:

- bootstrap 실패는 경고(warn)하고 계속 진행합니다.
- assemble 실패는 경고하고 unassembled 파이프라인 메시지/프롬프트로 폴백합니다.
- afterTurn/ingest 실패는 경고하고 post-turn finalization을 비성공으로 표시합니다.
- maintenance는 성공적이고 중단되지 않은 non-yield 턴 이후에만 실행됩니다.
- compaction 에러는 새로운 프롬프트로 재시도되어서는 안 됩니다.

Codex 전용 추가 사항:

- 컨텍스트 투영이 실패하면 경고하고 원래 프롬프트로 폴백합니다.
- 전사 미러가 실패하더라도, 폴백 메시지로 컨텍스트 엔진 finalization을 여전히 시도합니다.
- 컨텍스트 엔진 compaction이 성공한 후 Codex 네이티브 compaction이 실패하면, 컨텍스트 엔진이 primary일 때 전체 OpenClaw compaction을 실패시키지 마십시오.

## 테스트 계획

### 단위 테스트

`extensions/codex/src/app-server` 아래에 테스트를 추가합니다:

1. `run-attempt.context-engine.test.ts`
   - 세션 파일이 존재할 때 Codex가 `bootstrap`을 호출합니다.
   - Codex가 미러링된 메시지, 토큰 예산, 도구 이름, citations 모드, 모델 id, 프롬프트와 함께 `assemble`을 호출합니다.
   - `systemPromptAddition`이 developer instructions에 포함됩니다.
   - assemble된 메시지가 현재 요청 앞에서 프롬프트로 투영됩니다.
   - 전사 미러링 이후 Codex가 `afterTurn`을 호출합니다.
   - `afterTurn`이 없으면, Codex는 `ingestBatch` 또는 메시지별 `ingest`를 호출합니다.
   - 성공적인 턴 이후 턴 maintenance가 실행됩니다.
   - 턴 maintenance는 prompt error, abort, yield abort에서는 실행되지 않습니다.

2. `context-engine-projection.test.ts`
   - 동일한 입력에 대해 안정적인 출력
   - assemble된 히스토리가 현재 프롬프트를 포함할 때 중복 현재 프롬프트가 없음
   - 빈 히스토리 처리
   - role 순서 보존
   - system prompt addition은 developer instructions에만 포함

3. `compact.context-engine.test.ts`
   - compaction을 소유하는 컨텍스트 엔진의 primary 결과가 이깁니다.
   - 동시에 시도된 경우 Codex 네이티브 compaction 상태가 세부사항에 나타납니다.
   - Codex 네이티브 실패가 compaction을 소유하는 컨텍스트 엔진 compaction을 실패시키지 않습니다.
   - 소유하지 않는 컨텍스트 엔진은 현재 네이티브 compaction 동작을 보존합니다.

### 업데이트할 기존 테스트

- `extensions/codex/src/app-server/run-attempt.test.ts`가 있으면 해당 파일, 없으면 가장 가까운 Codex app-server 실행 테스트.
- compaction 이벤트 세부사항이 변경되는 경우에만 `extensions/codex/src/app-server/event-projector.test.ts`.
- `src/agents/harness/selection.test.ts`는 구성 동작이 변경되지 않으면 변경이 필요 없습니다. 안정적으로 유지되어야 합니다.
- PI 컨텍스트 엔진 테스트는 변경 없이 계속 통과해야 합니다.

### 통합/라이브 테스트

라이브 Codex harness smoke 테스트를 추가하거나 확장합니다:

- `plugins.slots.contextEngine`을 테스트 엔진으로 구성
- `agents.defaults.model`을 `codex/*` 모델로 구성
- `agents.defaults.embeddedHarness.runtime = "codex"`로 구성
- 테스트 엔진이 관찰되었는지 단언:
  - bootstrap
  - assemble
  - afterTurn 또는 ingest
  - maintenance

OpenClaw 핵심 테스트에서 lossless-claw를 요구하는 것을 피하십시오. 작은 in-repo fake 컨텍스트 엔진 플러그인을 사용하십시오.

## 관측성(Observability)

Codex 컨텍스트 엔진 생명주기 호출 주변에 디버그 로그를 추가합니다:

- `codex context engine bootstrap started/completed/failed`
- `codex context engine assemble applied`
- `codex context engine finalize completed/failed`
- `codex context engine maintenance skipped` 이유와 함께
- `codex native compaction completed alongside context-engine compaction`

전체 프롬프트나 전사 내용을 로깅하지 마십시오.

유용한 곳에 구조화된 필드를 추가합니다:

- `sessionId`
- `sessionKey`는 기존 로깅 관행에 따라 redact되거나 생략됨
- `engineId`
- `threadId`
- `turnId`
- `assembledMessageCount`
- `estimatedTokens`
- `hasSystemPromptAddition`

## 마이그레이션 / 호환성

이는 하위 호환이어야 합니다:

- 컨텍스트 엔진이 구성되지 않으면, 레거시 컨텍스트 엔진 동작은 오늘날의 Codex harness 동작과 동등해야 합니다.
- 컨텍스트 엔진 `assemble`이 실패하면, Codex는 원래 프롬프트 경로로 계속 진행해야 합니다.
- 기존 Codex 스레드 바인딩은 유효한 상태로 유지되어야 합니다.
- 동적 도구 fingerprinting은 컨텍스트 엔진 출력을 포함해서는 안 됩니다. 그렇지 않으면 모든 컨텍스트 변경이 새 Codex 스레드를 강제할 수 있습니다. 오직 도구 카탈로그만이 동적 도구 fingerprint에 영향을 미쳐야 합니다.

## 미해결 질문(Open questions)

1. assemble된 컨텍스트를 사용자 프롬프트에 전적으로 주입할지, developer instructions에 전적으로 주입할지, 아니면 분할할지?

   권장: 분할. `systemPromptAddition`을 developer instructions에 두고, assemble된 전사 컨텍스트를 사용자 프롬프트 wrapper에 넣습니다. 이것이 네이티브 스레드 히스토리를 변경하지 않고 현재 Codex 프로토콜과 가장 잘 맞습니다.

2. 컨텍스트 엔진이 compaction을 소유할 때 Codex 네이티브 compaction을 비활성화해야 할까?

   권장: 아니요, 초기에는 아닙니다. Codex 네이티브 compaction은 app-server 스레드를 살려두기 위해 여전히 필요할 수 있습니다. 그러나 컨텍스트 엔진 compaction이 아닌 네이티브 Codex compaction으로 보고되어야 합니다.

3. `before_prompt_build`는 컨텍스트 엔진 assembly 이전에 실행되어야 할까, 이후에 실행되어야 할까?

   권장: Codex의 경우 컨텍스트 엔진 투영 이후. 일반 harness 훅이 Codex가 받을 실제 prompt/developer instructions를 보도록 하기 위해서입니다. PI 패리티가 반대를 요구하면, 선택된 순서를 테스트로 인코딩하고 여기에 문서화하십시오.

4. Codex app-server가 향후 구조화된 컨텍스트/히스토리 오버라이드를 받아들일 수 있을까?

   알 수 없음. 가능하다면, 텍스트 투영 계층을 해당 프로토콜로 교체하고 생명주기 호출은 변경하지 않은 채로 유지하십시오.

## 수락 기준(Acceptance criteria)

- `codex/*` 임베디드 harness 턴이 선택된 컨텍스트 엔진의 assemble 생명주기를 호출합니다.
- 컨텍스트 엔진 `systemPromptAddition`이 Codex developer instructions에 영향을 미칩니다.
- assemble된 컨텍스트가 Codex 턴 입력에 결정론적으로 영향을 미칩니다.
- 성공적인 Codex 턴은 `afterTurn` 또는 ingest 폴백을 호출합니다.
- 성공적인 Codex 턴은 컨텍스트 엔진 턴 maintenance를 실행합니다.
- 실패한/중단된/yield-abort된 턴은 턴 maintenance를 실행하지 않습니다.
- 컨텍스트 엔진이 소유한 compaction은 OpenClaw/플러그인 상태에 대해 primary로 유지됩니다.
- Codex 네이티브 compaction은 네이티브 Codex 동작으로서 감사 가능한 상태를 유지합니다.
- 기존 PI 컨텍스트 엔진 동작은 변경되지 않습니다.
- non-legacy 컨텍스트 엔진이 선택되지 않거나 assembly가 실패할 때, 기존 Codex harness 동작은 변경되지 않습니다.
