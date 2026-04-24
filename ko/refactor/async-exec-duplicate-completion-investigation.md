---
summary: "중복 async exec completion 주입에 대한 조사 노트"
read_when:
  - 반복되는 노드 exec completion 이벤트를 디버깅할 때
  - heartbeat/system-event 중복 제거(dedupe) 작업을 진행할 때
title: "Async exec 중복 completion 조사"
---

## 범위

- 세션: `agent:main:telegram:group:-1003774691294:topic:1`
- 증상: 세션/실행(run) `keen-nexus`에 대한 동일한 async exec completion이 LCM에 사용자 턴(user turn)으로 두 번 기록되었습니다.
- 목표: 이것이 중복 세션 주입(duplicate session injection)일 가능성이 높은지, 아니면 단순 아웃바운드(outbound) 전송 재시도인지 식별하는 것입니다.

## 결론

가장 가능성이 높은 원인은 순수한 아웃바운드 전송 재시도가 아니라 **중복 세션 주입(duplicate session injection)** 입니다.

게이트웨이(gateway) 측에서 가장 취약한 지점은 **노드 exec completion 경로** 입니다:

1. 노드 측 exec 종료 시 전체 `runId`와 함께 `exec.finished`가 emit됩니다.
2. 게이트웨이의 `server-node-events`는 이를 system event로 변환하고 heartbeat를 요청합니다.
3. Heartbeat 실행은 drain된 system event 블록을 에이전트 프롬프트에 주입합니다.
4. 임베디드 러너(embedded runner)는 해당 프롬프트를 세션 트랜스크립트(transcript)에 새 사용자 턴으로 영속화합니다.

어떤 이유(replay, 재연결 중복, 업스트림 재전송, 프로듀서 중복)로든 동일한 `runId`에 대해 `exec.finished`가 게이트웨이에 두 번 도달하면, 현재 OpenClaw는 이 경로에서 **`runId`/`contextKey`로 키잉된 idempotency 검사가 없습니다**. 두 번째 복사본은 동일한 내용을 가진 두 번째 사용자 메시지가 됩니다.

## 정확한 코드 경로

### 1. 프로듀서: 노드 exec completion 이벤트

- `src/node-host/invoke.ts:340-360`
  - `sendExecFinishedEvent(...)`는 `exec.finished` 이벤트로 `node.event`를 emit합니다.
  - 페이로드에는 `sessionKey`와 전체 `runId`가 포함됩니다.

### 2. 게이트웨이 이벤트 수집(ingestion)

- `src/gateway/server-node-events.ts:574-640`
  - `exec.finished`를 처리합니다.
  - 텍스트를 구성합니다:
    - `Exec finished (node=..., id=<runId>, code ...)`
  - 다음을 통해 enqueue합니다:
    - `enqueueSystemEvent(text, { sessionKey, contextKey: runId ? \`exec:${runId}\` : "exec", trusted: false })`
  - 즉시 wake를 요청합니다:
    - `requestHeartbeatNow(scopedHeartbeatWakeOptions(sessionKey, { reason: "exec-event" }))`

### 3. System event 중복 제거의 취약성

- `src/infra/system-events.ts:90-115`
  - `enqueueSystemEvent(...)`는 **연속된 중복 텍스트**만 억제합니다:
    - `if (entry.lastText === cleaned) return false`
  - `contextKey`를 저장하긴 하지만, idempotency를 위해 `contextKey`를 **사용하지 않습니다**.
  - Drain 이후에는 중복 억제가 리셋됩니다.

이는 코드가 이미 안정적인 idempotency 후보(`exec:<runId>`)를 가지고 있음에도 불구하고, 동일한 `runId`로 재전송된 `exec.finished`가 나중에 다시 수용될 수 있음을 의미합니다.

### 4. Wake 처리는 주요 중복 원인이 아님

- `src/infra/heartbeat-wake.ts:79-117`
  - Wake는 `(agentId, sessionKey)`로 coalesce됩니다.
  - 동일한 대상에 대한 중복 wake 요청은 하나의 pending wake 엔트리로 축소됩니다.

따라서 **중복 wake 처리만으로는** 중복 이벤트 수집보다 설명력이 약합니다.

### 5. Heartbeat가 이벤트를 소비하여 프롬프트 입력으로 변환

- `src/infra/heartbeat-runner.ts:535-574`
  - Preflight가 pending system event를 미리 살펴보고 exec-event 실행을 분류합니다.
- `src/auto-reply/reply/session-system-events.ts:86-90`
  - `drainFormattedSystemEvents(...)`가 해당 세션의 큐를 drain합니다.
- `src/auto-reply/reply/get-reply-run.ts:400-427`
  - Drain된 system event 블록이 에이전트 프롬프트 본문 앞에 prepend됩니다.

### 6. 트랜스크립트 주입 지점

- `src/agents/pi-embedded-runner/run/attempt.ts:2000-2017`
  - `activeSession.prompt(effectivePrompt)`는 임베디드 PI 세션에 전체 프롬프트를 제출합니다.
  - 이 지점이 completion에서 파생된 프롬프트가 영속화된 사용자 턴이 되는 지점입니다.

따라서 동일한 system event가 프롬프트로 두 번 재구성되면 LCM 사용자 메시지 중복이 발생하는 것은 당연한 결과입니다.

## 순수한 아웃바운드 전송 재시도 가능성이 낮은 이유

Heartbeat 러너에는 실제 아웃바운드 실패 경로가 존재합니다:

- `src/infra/heartbeat-runner.ts:1194-1242`
  - 답변(reply)이 먼저 생성됩니다.
  - 아웃바운드 전송은 이후 `deliverOutboundPayloads(...)`를 통해 이루어집니다.
  - 여기서 실패하면 `{ status: "failed" }`를 반환합니다.

그러나 동일한 system event 큐 엔트리의 경우 이것만으로는 중복 사용자 턴을 설명하기에 **충분하지 않습니다**:

- `src/auto-reply/reply/session-system-events.ts:86-90`
  - System event 큐는 아웃바운드 전송 이전에 이미 drain됩니다.

따라서 채널 전송 재시도만으로는 동일한 큐 이벤트가 재생성되지 않습니다. 외부 전송 누락/실패는 설명할 수 있지만, 그 자체만으로 두 번째 동일한 세션 사용자 메시지를 설명할 수는 없습니다.

## 두 번째, 신뢰도가 낮은 가능성

에이전트 러너에는 전체 실행 재시도 루프가 있습니다:

- `src/auto-reply/reply/agent-runner-execution.ts:741-1473`
  - 특정 일시적 실패의 경우 전체 실행을 재시도하고 동일한 `commandBody`를 재제출할 수 있습니다.

이는 재시도 조건이 트리거되기 전에 프롬프트가 이미 append된 상태였다면 **동일한 reply 실행 내에서** 영속화된 사용자 프롬프트를 중복시킬 수 있습니다.

다음과 같은 이유로 이 가능성은 중복 `exec.finished` 수집보다 낮다고 판단합니다:

- 관측된 간격이 약 51초였는데, 이는 in-process 재시도보다는 두 번째 wake/턴에 가까워 보입니다.
- 보고된 반복적인 메시지 전송 실패는 즉각적인 모델/런타임 재시도보다는 별도의 이후 턴을 가리킵니다.

## 근본 원인 가설

가장 신뢰도가 높은 가설:

- `keen-nexus` completion이 **노드 exec 이벤트 경로**를 통해 들어왔습니다.
- 동일한 `exec.finished`가 `server-node-events`로 두 번 전달되었습니다.
- `enqueueSystemEvent(...)`가 `contextKey` / `runId`로 중복 제거하지 않기 때문에 게이트웨이가 둘 다 수용했습니다.
- 수용된 각 이벤트는 heartbeat를 트리거하고 PI 트랜스크립트에 사용자 턴으로 주입되었습니다.

## 제안하는 최소 외과적 수정

수정을 원한다면 가장 작으면서도 가치가 큰 변경은 다음과 같습니다:

- exec/system-event idempotency가 짧은 범위 동안 최소한 정확한 `(sessionKey, contextKey, text)` 반복에 대해서는 `contextKey`를 존중하도록 만드는 것.
- 또는 `server-node-events`에 `(sessionKey, runId, event kind)`로 키잉된 `exec.finished` 전용 중복 제거 로직을 추가하는 것.

이렇게 하면 재전송된 `exec.finished` 중복이 세션 턴이 되기 전에 직접 차단됩니다.

## 관련 문서

- [Exec 도구](/tools/exec)
- [세션 관리](/concepts/session)
