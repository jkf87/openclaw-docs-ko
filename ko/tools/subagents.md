---
summary: "서브 에이전트: 격리된 에이전트 실행을 생성하고 요청자 채팅에 결과를 공지하기"
read_when:
  - You want background/parallel work via the agent
  - You are changing sessions_spawn or sub-agent tool policy
  - You are implementing or troubleshooting thread-bound subagent sessions
title: "서브 에이전트"
---

# 서브 에이전트

서브 에이전트는 기존 에이전트 실행에서 생성된 백그라운드 에이전트 실행입니다. 자체 세션(`agent:<agentId>:subagent:<uuid>`)에서 실행되며, 완료 시 요청자 채팅 채널에 결과를 **공지**합니다. 각 서브 에이전트 실행은 [백그라운드 태스크](/automation/tasks)로 추적됩니다.

## 슬래시 명령어

**현재 세션**의 서브 에이전트 실행을 검사하거나 제어하려면 `/subagents`를 사용하십시오:

- `/subagents list`
- `/subagents kill <id|#|all>`
- `/subagents log <id|#> [limit] [tools]`
- `/subagents info <id|#>`
- `/subagents send <id|#> <message>`
- `/subagents steer <id|#> <message>`
- `/subagents spawn <agentId> <task> [--model <model>] [--thinking <level>]`

스레드 바인딩 제어:

이 명령어는 영구 스레드 바인딩을 지원하는 채널에서 작동합니다. 아래 **스레드 지원 채널**을 참조하십시오.

- `/focus <subagent-label|session-key|session-id|session-label>`
- `/unfocus`
- `/agents`
- `/session idle <duration|off>`
- `/session max-age <duration|off>`

`/subagents info`는 실행 메타데이터(상태, 타임스탬프, 세션 ID, 트랜스크립트 경로, 정리)를 표시합니다.
제한적이고 안전하게 필터링된 리콜 보기에는 `sessions_history`를 사용하십시오; 전체 원시 트랜스크립트가 필요하면 디스크의 트랜스크립트 경로를 직접 검사하십시오.

### 생성 동작

`/subagents spawn`은 내부 릴레이가 아닌 사용자 명령으로 백그라운드 서브 에이전트를 시작하며, 실행이 완료되면 요청자 채팅에 하나의 최종 완료 업데이트를 전송합니다.

- 생성 명령어는 비차단 방식으로, 즉시 실행 ID를 반환합니다.
- 완료 시 서브 에이전트는 요청자 채팅 채널에 요약/결과 메시지를 공지합니다.
- 완료는 푸시 기반입니다. 생성 후 완료를 기다리기 위해 `/subagents list`, `sessions_list`, 또는 `sessions_history`를 루프로 폴링하지 마십시오; 디버깅 또는 개입이 필요할 때만 상태를 확인하십시오.
- 완료 시 OpenClaw는 서브 에이전트 세션이 열었던 추적된 브라우저 탭/프로세스를 최선 노력으로 닫은 후 공지 정리 흐름을 계속합니다.
- 수동 생성의 경우, 전달은 복원력이 있습니다:
  - OpenClaw는 안정적인 멱등성 키로 먼저 직접 `agent` 전달을 시도합니다.
  - 직접 전달이 실패하면 대기열 라우팅으로 폴백합니다.
  - 대기열 라우팅도 사용할 수 없으면, 최종 포기 전 짧은 지수 백오프로 공지를 재시도합니다.
- 완료 전달은 해결된 요청자 경로를 유지합니다:
  - 사용 가능한 경우 스레드 바인딩 또는 대화 바인딩 완료 경로가 우선합니다
  - 완료 출처가 채널만 제공하면, OpenClaw는 누락된 target/account를 요청자 세션의 해결된 경로(`lastChannel` / `lastTo` / `lastAccountId`)에서 채워 직접 전달이 계속 작동하도록 합니다
- 요청자 세션으로의 완료 핸드오프는 런타임에서 생성된 내부 컨텍스트(사용자 작성 텍스트 아님)이며 다음을 포함합니다:
  - `Result` (최신 표시 `assistant` 응답 텍스트, 없으면 정제된 최신 도구/toolResult 텍스트)
  - `Status` (`completed successfully` / `failed` / `timed out` / `unknown`)
  - 간결한 런타임/토큰 통계
  - 요청자 에이전트에게 일반 어시스턴트 음성으로 다시 작성하도록 지시하는 전달 지침(원시 내부 메타데이터 그대로 전달 금지)
- `--model`과 `--thinking`은 해당 특정 실행의 기본값을 재정의합니다.
- 완료 후 `info`/`log`를 사용하여 세부 정보와 출력을 검사하십시오.
- `/subagents spawn`은 원샷 모드(`mode: "run"`)입니다. 영구 스레드 바인딩 세션의 경우 `thread: true` 및 `mode: "session"`으로 `sessions_spawn`을 사용하십시오.
- ACP 하네스 세션(Codex, Claude Code, Gemini CLI)의 경우 `runtime: "acp"`로 `sessions_spawn`을 사용하고 [ACP 에이전트](/tools/acp-agents)를 참조하십시오.

주요 목표:

- 메인 실행을 차단하지 않고 "리서치 / 장기 태스크 / 느린 도구" 작업을 병렬화합니다.
- 기본적으로 서브 에이전트를 격리 유지합니다 (세션 분리 + 선택적 샌드박싱).
- 도구 표면을 오용하기 어렵게 유지합니다: 서브 에이전트는 기본적으로 세션 도구를 받지 **않습니다**.
- 오케스트레이터 패턴을 위한 구성 가능한 중첩 깊이를 지원합니다.

비용 참고: 각 서브 에이전트는 **자체** 컨텍스트와 토큰 사용량을 가집니다. 무겁거나 반복적인
태스크의 경우 서브 에이전트에 더 저렴한 모델을 설정하고 메인 에이전트를 더 고품질 모델로 유지하십시오.
`agents.defaults.subagents.model` 또는 에이전트별 재정의를 통해 이를 구성할 수 있습니다.

## 도구

`sessions_spawn` 사용:

- 서브 에이전트 실행 시작 (`deliver: false`, 전역 레인: `subagent`)
- 그런 다음 공지 단계를 실행하고 요청자 채팅 채널에 공지 응답을 게시합니다
- 기본 모델: `agents.defaults.subagents.model`을 설정하지 않으면(또는 에이전트별 `agents.list[].subagents.model`) 호출자를 상속합니다; 명시적 `sessions_spawn.model`이 여전히 우선합니다.
- 기본 사고: `agents.defaults.subagents.thinking`을 설정하지 않으면(또는 에이전트별 `agents.list[].subagents.thinking`) 호출자를 상속합니다; 명시적 `sessions_spawn.thinking`이 여전히 우선합니다.
- 기본 실행 타임아웃: `sessions_spawn.runTimeoutSeconds`가 생략되면, OpenClaw는 설정된 경우 `agents.defaults.subagents.runTimeoutSeconds`를 사용하고; 그렇지 않으면 `0`(타임아웃 없음)으로 폴백합니다.

도구 파라미터:

- `task` (필수)
- `label?` (선택)
- `agentId?` (선택; 허용된 경우 다른 에이전트 id 아래에서 생성)
- `model?` (선택; 서브 에이전트 모델 재정의; 유효하지 않은 값은 건너뛰고 서브 에이전트는 기본 모델로 실행되며 도구 결과에 경고가 표시됩니다)
- `thinking?` (선택; 서브 에이전트 실행을 위한 사고 수준 재정의)
- `runTimeoutSeconds?` (설정된 경우 `agents.defaults.subagents.runTimeoutSeconds`를 기본값으로 사용하고, 그렇지 않으면 `0`; 설정된 경우 N초 후 서브 에이전트 실행이 중단됨)
- `thread?` (기본값 `false`; `true`인 경우 이 서브 에이전트 세션에 대한 채널 스레드 바인딩 요청)
- `mode?` (`run|session`)
  - 기본값은 `run`
  - `thread: true`이고 `mode`가 생략된 경우 기본값은 `session`이 됩니다
  - `mode: "session"`은 `thread: true`가 필요합니다
- `cleanup?` (`delete|keep`, 기본값 `keep`)
- `sandbox?` (`inherit|require`, 기본값 `inherit`; `require`는 대상 자식 런타임이 샌드박스화되지 않으면 생성을 거부합니다)
- `sessions_spawn`은 채널 전달 파라미터(`target`, `channel`, `to`, `threadId`, `replyTo`, `transport`)를 **허용하지 않습니다**. 전달을 위해서는 생성된 실행에서 `message`/`sessions_send`를 사용하십시오.

## 스레드 바인딩 세션

채널에서 스레드 바인딩이 활성화된 경우, 서브 에이전트는 스레드에 바인딩되어 해당 스레드의 후속 사용자 메시지가 동일한 서브 에이전트 세션으로 계속 라우팅될 수 있습니다.

### 스레드 지원 채널

- Discord (현재 지원되는 유일한 채널): 영구 스레드 바인딩 서브 에이전트 세션(`thread: true`가 있는 `sessions_spawn`), 수동 스레드 제어(`/focus`, `/unfocus`, `/agents`, `/session idle`, `/session max-age`), 및 어댑터 키 `channels.discord.threadBindings.enabled`, `channels.discord.threadBindings.idleHours`, `channels.discord.threadBindings.maxAgeHours`, `channels.discord.threadBindings.spawnSubagentSessions`를 지원합니다.

빠른 흐름:

1. `thread: true`(및 선택적으로 `mode: "session"`)를 사용하여 `sessions_spawn`으로 생성합니다.
2. OpenClaw는 활성 채널에서 해당 세션 대상에 스레드를 생성하거나 바인딩합니다.
3. 해당 스레드의 응답 및 후속 메시지는 바인딩된 세션으로 라우팅됩니다.
4. `/session idle`을 사용하여 비활성 자동 언포커스를 검사/업데이트하고 `/session max-age`를 사용하여 하드 캡을 제어합니다.
5. `/unfocus`를 사용하여 수동으로 분리합니다.

수동 제어:

- `/focus <target>`은 현재 스레드를(또는 새로 생성하여) 서브 에이전트/세션 대상에 바인딩합니다.
- `/unfocus`는 현재 바인딩된 스레드에 대한 바인딩을 제거합니다.
- `/agents`는 활성 실행과 바인딩 상태(`thread:<id>` 또는 `unbound`)를 나열합니다.
- `/session idle`과 `/session max-age`는 포커스된 바인딩된 스레드에서만 작동합니다.

구성 스위치:

- 전역 기본값: `session.threadBindings.enabled`, `session.threadBindings.idleHours`, `session.threadBindings.maxAgeHours`
- 채널 재정의 및 생성 자동 바인딩 키는 어댑터 고유입니다. 위의 **스레드 지원 채널**을 참조하십시오.

현재 어댑터 세부 정보는 [구성 레퍼런스](/gateway/configuration-reference) 및 [슬래시 명령어](/tools/slash-commands)를 참조하십시오.

허용 목록:

- `agents.list[].subagents.allowAgents`: `agentId`를 통해 대상으로 지정할 수 있는 에이전트 id 목록 (모두 허용하려면 `["*"]`). 기본값: 요청자 에이전트만.
- `agents.defaults.subagents.allowAgents`: 요청자 에이전트가 자체 `subagents.allowAgents`를 설정하지 않을 때 사용되는 기본 대상 에이전트 허용 목록.
- 샌드박스 상속 가드: 요청자 세션이 샌드박스화된 경우 `sessions_spawn`은 샌드박스 없이 실행될 대상을 거부합니다.
- `agents.defaults.subagents.requireAgentId` / `agents.list[].subagents.requireAgentId`: true인 경우 `agentId`를 생략하는 `sessions_spawn` 호출을 차단합니다 (명시적 프로파일 선택 강제). 기본값: false.

디스커버리:

- `agents_list`를 사용하여 `sessions_spawn`에 현재 허용된 에이전트 id를 확인하십시오.

자동 아카이브:

- 서브 에이전트 세션은 `agents.defaults.subagents.archiveAfterMinutes` (기본값: 60) 후 자동으로 아카이브됩니다.
- 아카이브는 `sessions.delete`를 사용하고 트랜스크립트를 `*.deleted.<timestamp>`로 이름을 변경합니다 (동일 폴더).
- `cleanup: "delete"`는 공지 직후 즉시 아카이브합니다 (이름 변경을 통해 트랜스크립트는 유지).
- 자동 아카이브는 최선 노력 방식입니다; 게이트웨이가 재시작되면 보류 중인 타이머가 손실됩니다.
- `runTimeoutSeconds`는 자동 아카이브하지 않습니다; 실행만 중지합니다. 세션은 자동 아카이브까지 남아있습니다.
- 자동 아카이브는 깊이 1과 깊이 2 세션 모두에 동일하게 적용됩니다.
- 브라우저 정리는 아카이브 정리와 별개입니다: 추적된 브라우저 탭/프로세스는 실행이 완료될 때 최선 노력으로 닫히며, 트랜스크립트/세션 레코드가 유지되더라도 마찬가지입니다.

## 중첩 서브 에이전트

기본적으로 서브 에이전트는 자체 서브 에이전트를 생성할 수 없습니다(`maxSpawnDepth: 1`). `maxSpawnDepth: 2`를 설정하여 한 수준의 중첩을 활성화할 수 있으며, 이는 **오케스트레이터 패턴**을 허용합니다: 메인 → 오케스트레이터 서브 에이전트 → 워커 서브-서브 에이전트.

### 활성화 방법

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2, // 서브 에이전트가 자식을 생성하도록 허용 (기본값: 1)
        maxChildrenPerAgent: 5, // 에이전트 세션당 최대 활성 자식 (기본값: 5)
        maxConcurrent: 8, // 전역 동시성 레인 캡 (기본값: 8)
        runTimeoutSeconds: 900, // 생략 시 sessions_spawn의 기본 타임아웃 (0 = 타임아웃 없음)
      },
    },
  },
}
```

### 깊이 레벨

| 깊이 | 세션 키 형태                                 | 역할                                          | 생성 가능?                   |
| ---- | -------------------------------------------- | --------------------------------------------- | ---------------------------- |
| 0    | `agent:<id>:main`                            | 메인 에이전트                                 | 항상                         |
| 1    | `agent:<id>:subagent:<uuid>`                 | 서브 에이전트 (깊이 2 허용 시 오케스트레이터) | `maxSpawnDepth >= 2`인 경우만 |
| 2    | `agent:<id>:subagent:<uuid>:subagent:<uuid>` | 서브-서브 에이전트 (리프 워커)               | 절대 불가                    |

### 공지 체인

결과는 체인을 통해 위로 전달됩니다:

1. 깊이-2 워커 완료 → 부모(깊이-1 오케스트레이터)에 공지
2. 깊이-1 오케스트레이터가 공지를 수신하고, 결과를 합성하고, 완료 → 메인에 공지
3. 메인 에이전트가 공지를 수신하고 사용자에게 전달

각 레벨은 직접 자식의 공지만 봅니다.

운영 지침:

- 자식 작업을 한 번 시작하고 `sessions_list`, `sessions_history`, `/subagents list`, 또는
  `exec` 슬립 명령어 주변에 폴링 루프를 구축하는 대신 완료 이벤트를 기다리십시오.
- 자식 완료 이벤트가 이미 최종 답변을 보낸 후 도착하는 경우,
  올바른 후속 조치는 정확한 무음 토큰 `NO_REPLY` / `no_reply`입니다.

### 깊이별 도구 정책

- 역할과 제어 범위는 생성 시 세션 메타데이터에 기록됩니다. 이는 플랫하거나 복원된 세션 키가 실수로 오케스트레이터 권한을 다시 얻지 못하도록 합니다.
- **깊이 1 (오케스트레이터, `maxSpawnDepth >= 2`인 경우)**: 자식을 관리할 수 있도록 `sessions_spawn`, `subagents`, `sessions_list`, `sessions_history`를 받습니다. 다른 세션/시스템 도구는 여전히 거부됩니다.
- **깊이 1 (리프, `maxSpawnDepth == 1`인 경우)**: 세션 도구 없음 (현재 기본 동작).
- **깊이 2 (리프 워커)**: 세션 도구 없음 — `sessions_spawn`은 깊이 2에서 항상 거부됩니다. 추가 자식을 생성할 수 없습니다.

### 에이전트별 생성 제한

각 에이전트 세션(모든 깊이에서)은 한 번에 최대 `maxChildrenPerAgent` (기본값: 5) 활성 자식을 가질 수 있습니다. 이는 단일 오케스트레이터로부터의 폭주 팬아웃을 방지합니다.

### 연쇄 중지

깊이-1 오케스트레이터를 중지하면 깊이-2 자식이 자동으로 중지됩니다:

- 메인 채팅에서 `/stop`은 모든 깊이-1 에이전트를 중지하고 깊이-2 자식으로 연쇄됩니다.
- `/subagents kill <id>`는 특정 서브 에이전트를 중지하고 자식으로 연쇄됩니다.
- `/subagents kill all`은 요청자의 모든 서브 에이전트를 중지하고 연쇄됩니다.

## 인증

서브 에이전트 인증은 세션 유형이 아닌 **에이전트 id**로 해결됩니다:

- 서브 에이전트 세션 키는 `agent:<agentId>:subagent:<uuid>`입니다.
- 인증 스토어는 해당 에이전트의 `agentDir`에서 로드됩니다.
- 메인 에이전트의 인증 프로파일은 **폴백**으로 병합됩니다; 충돌 시 에이전트 프로파일이 메인 프로파일을 재정의합니다.

참고: 병합은 가산적이므로 메인 프로파일은 항상 폴백으로 사용 가능합니다. 에이전트별 완전 격리된 인증은 아직 지원되지 않습니다.

## 공지

서브 에이전트는 공지 단계를 통해 보고합니다:

- 공지 단계는 서브 에이전트 세션 내에서 실행됩니다 (요청자 세션이 아님).
- 서브 에이전트가 정확히 `ANNOUNCE_SKIP`을 응답하면 아무것도 게시되지 않습니다.
- 최신 어시스턴트 텍스트가 정확한 무음 토큰 `NO_REPLY` / `no_reply`이면,
  이전에 표시된 진행 상황이 있더라도 공지 출력이 억제됩니다.
- 그렇지 않으면 전달은 요청자 깊이에 따라 달라집니다:
  - 최상위 요청자 세션은 외부 전달이 있는 후속 `agent` 호출을 사용합니다 (`deliver=true`)
  - 중첩 요청자 서브에이전트 세션은 내부 후속 주입을 받습니다 (`deliver=false`) 오케스트레이터가 세션 내에서 자식 결과를 합성할 수 있도록
  - 중첩 요청자 서브에이전트 세션이 없으면, OpenClaw는 가능한 경우 해당 세션의 요청자로 폴백합니다
- 최상위 요청자 세션의 경우, 완료 모드 직접 전달은 먼저 모든 바인딩된 대화/스레드 경로와 훅 재정의를 해결하고, 그런 다음 요청자 세션의 저장된 경로에서 누락된 채널-대상 필드를 채웁니다. 이는 완료 출처가 채널만 식별하더라도 완료가 올바른 채팅/주제에 남아있도록 합니다.
- 자식 완료 집계는 중첩 완료 결과를 구축할 때 현재 요청자 실행으로 범위가 지정되며, 오래된 이전 실행의 자식 출력이 현재 공지로 누출되는 것을 방지합니다.
- 공지 응답은 채널 어댑터에서 사용 가능한 경우 스레드/주제 라우팅을 보존합니다.
- 공지 컨텍스트는 안정적인 내부 이벤트 블록으로 정규화됩니다:
  - 소스 (`subagent` 또는 `cron`)
  - 자식 세션 키/id
  - 공지 유형 + 태스크 레이블
  - 런타임 결과에서 도출된 상태 줄 (`success`, `error`, `timeout`, 또는 `unknown`)
  - 최신 표시 어시스턴트 텍스트에서 선택된 결과 내용, 없으면 정제된 최신 도구/toolResult 텍스트
  - 응답 대 침묵 시기를 설명하는 후속 지침
- `Status`는 모델 출력에서 추론되지 않습니다; 런타임 결과 신호에서 옵니다.
- 타임아웃 시 자식이 도구 호출만 수행한 경우, 공지는 원시 도구 출력을 재생하는 대신 짧은 부분적 진행 요약으로 해당 내역을 축소할 수 있습니다.

공지 페이로드에는 끝에 통계 줄이 포함됩니다 (래핑된 경우에도):

- 런타임 (예: `runtime 5m12s`)
- 토큰 사용량 (입력/출력/합계)
- 모델 가격이 구성된 경우 예상 비용 (`models.providers.*.models[].cost`)
- `sessionKey`, `sessionId`, 및 트랜스크립트 경로 (메인 에이전트가 `sessions_history`를 통해 내역을 가져오거나 디스크의 파일을 검사할 수 있도록)
- 내부 메타데이터는 오케스트레이션 전용입니다; 사용자 대면 응답은 일반 어시스턴트 음성으로 다시 작성해야 합니다.

`sessions_history`는 더 안전한 오케스트레이션 경로입니다:

- 어시스턴트 리콜은 먼저 정규화됩니다:
  - 사고 태그 제거
  - `<relevant-memories>` / `<relevant_memories>` 스캐폴딩 블록 제거
  - `<tool_call>...</tool_call>`, `<function_call>...</function_call>`, `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>` 같은 평문 텍스트 도구 호출 XML 페이로드 블록 제거 (깔끔하게 닫히지 않는 잘린 페이로드 포함)
  - 다운그레이드된 도구 호출/결과 스캐폴딩 및 히스토리 컨텍스트 마커 제거
  - `<|assistant|>`, 기타 ASCII `<|...|>` 토큰, 전각 `<｜...｜>` 변형과 같은 누출된 모델 제어 토큰 제거
  - 잘못된 형식의 MiniMax 도구 호출 XML 제거
- 자격 증명/토큰 유사 텍스트 편집
- 긴 블록은 잘릴 수 있습니다
- 매우 큰 내역은 이전 행을 삭제하거나 지나치게 큰 행을 `[sessions_history omitted: message too large]`로 대체할 수 있습니다
- 전체 바이트 단위 트랜스크립트가 필요하면 디스크의 트랜스크립트 원시 검사가 폴백입니다

## 도구 정책 (서브 에이전트 도구)

기본적으로 서브 에이전트는 **세션 도구 및 시스템 도구를 제외한 모든 도구**를 받습니다:

- `sessions_list`
- `sessions_history`
- `sessions_send`
- `sessions_spawn`

`sessions_history`는 여기서도 제한적이고 정제된 리콜 보기로 남아있습니다; 원시 트랜스크립트 덤프가 아닙니다.

`maxSpawnDepth >= 2`인 경우 깊이-1 오케스트레이터 서브 에이전트는 추가로 `sessions_spawn`, `subagents`, `sessions_list`, `sessions_history`를 받아 자식을 관리할 수 있습니다.

구성으로 재정의:

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxConcurrent: 1,
      },
    },
  },
  tools: {
    subagents: {
      tools: {
        // deny가 우선합니다
        deny: ["gateway", "cron"],
        // allow가 설정된 경우 allow-only가 됩니다 (deny가 여전히 우선)
        // allow: ["read", "exec", "process"]
      },
    },
  },
}
```

## 동시성

서브 에이전트는 전용 인-프로세스 대기열 레인을 사용합니다:

- 레인 이름: `subagent`
- 동시성: `agents.defaults.subagents.maxConcurrent` (기본값 `8`)

## 중지

- 요청자 채팅에서 `/stop`을 전송하면 요청자 세션이 중단되고 그로부터 생성된 활성 서브 에이전트 실행이 중지되며 중첩 자식으로 연쇄됩니다.
- `/subagents kill <id>`는 특정 서브 에이전트를 중지하고 자식으로 연쇄됩니다.

## 제한 사항

- 서브 에이전트 공지는 **최선 노력**입니다. 게이트웨이가 재시작되면 보류 중인 "공지 복귀" 작업이 손실됩니다.
- 서브 에이전트는 여전히 동일한 게이트웨이 프로세스 리소스를 공유합니다; `maxConcurrent`를 안전 밸브로 취급하십시오.
- `sessions_spawn`은 항상 비차단 방식입니다: `{ status: "accepted", runId, childSessionKey }`를 즉시 반환합니다.
- 서브 에이전트 컨텍스트는 `AGENTS.md` + `TOOLS.md`만 주입합니다 (`SOUL.md`, `IDENTITY.md`, `USER.md`, `HEARTBEAT.md`, 또는 `BOOTSTRAP.md` 없음).
- 최대 중첩 깊이는 5입니다 (`maxSpawnDepth` 범위: 1–5). 대부분의 사용 사례에는 깊이 2가 권장됩니다.
- `maxChildrenPerAgent`는 세션당 활성 자식을 제한합니다 (기본값: 5, 범위: 1–20).
