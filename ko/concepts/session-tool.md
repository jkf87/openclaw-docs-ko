---
summary: "교차 세션 상태 조회, 회상, 메시징, 서브에이전트 오케스트레이션을 위한 에이전트 도구"
read_when:
  - 에이전트가 어떤 세션 도구를 가지고 있는지 이해하고 싶을 때
  - 교차 세션 접근 권한이나 서브에이전트 스폰(spawn)을 설정하고 싶을 때
  - 스폰된 서브에이전트의 상태를 점검하거나 제어하고 싶을 때
title: "세션 도구"
---

OpenClaw는 에이전트에게 세션 간에 작업하고, 상태를 점검하며,
서브에이전트(sub-agent)를 오케스트레이션할 수 있는 도구들을 제공합니다.

## 사용 가능한 도구

| 도구                | 역할                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `sessions_list`    | 선택적 필터(kind, label, agent, recency, preview)로 세션 목록을 조회                              |
| `sessions_history` | 특정 세션의 transcript를 읽기                                                                   |
| `sessions_send`    | 다른 세션으로 메시지를 보내고 선택적으로 대기                                                      |
| `sessions_spawn`   | 백그라운드 작업용으로 격리된 서브에이전트 세션을 스폰                                                 |
| `sessions_yield`   | 현재 턴을 종료하고 후속(follow-up) 서브에이전트 결과를 대기                                         |
| `subagents`        | 이 세션에서 스폰된 서브에이전트 목록 조회, 유도(steer), 종료(kill)                                  |
| `session_status`   | `/status` 스타일 카드를 표시하고, 선택적으로 세션별 모델 오버라이드를 설정                            |

## 세션 목록 조회 및 읽기

`sessions_list`는 세션의 key, agentId, kind, channel, model,
token 카운트, timestamp와 함께 세션들을 반환합니다. kind(`main`, `group`, `cron`, `hook`,
`node`), 정확한 `label`, 정확한 `agentId`, 검색 텍스트, 또는 recency
(`activeMinutes`)로 필터링할 수 있습니다. 메일박스 스타일의 triage가 필요할 때는
가시성 범위가 적용된(visibility-scoped) 파생 제목, last-message 미리보기 스니펫,
또는 각 행에 경계가 정해진 최근 메시지를 요청할 수도 있습니다. 파생 제목과
미리보기는 설정된 세션 도구 가시성 정책(visibility policy) 하에서 호출자가 이미
볼 수 있는 세션에 대해서만 생성되므로, 무관한 세션은 여전히 숨겨진 상태를 유지합니다.

`sessions_history`는 특정 세션의 대화 transcript를 가져옵니다.
기본적으로 도구 결과는 제외됩니다 -- 이를 보려면 `includeTools: true`를 전달하세요.
반환되는 뷰는 의도적으로 경계가 있고 안전성 필터가 적용됩니다:

- 회상(recall) 전에 assistant 텍스트가 정규화됩니다:
  - thinking 태그가 제거됩니다
  - `<relevant-memories>` / `<relevant_memories>` scaffolding 블록이 제거됩니다
  - `<tool_call>...</tool_call>`, `<function_call>...</function_call>`,
    `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>` 같은
    plain-text 도구 호출 XML 페이로드 블록이 제거되며, 깨끗하게 닫히지 않은
    잘린(truncated) 페이로드도 포함됩니다
  - `[Tool Call: ...]`, `[Tool Result ...]`, `[Historical context ...]` 같은
    다운그레이드된 tool-call/result scaffolding도 제거됩니다
  - `<|assistant|>` 같은 leaked 모델 control token, 기타 ASCII
    `<|...|>` token, full-width `<｜...｜>` 변형이 제거됩니다
  - `<invoke ...>` / `</minimax:tool_call>` 같은 malformed MiniMax tool-call
    XML이 제거됩니다
- credential/token처럼 보이는 텍스트는 반환 전에 편집(redact)됩니다
- 긴 텍스트 블록은 잘립니다(truncate)
- 매우 큰 히스토리는 오래된 행이 드롭되거나, 지나치게 큰 행은
  `[sessions_history omitted: message too large]`로 대체될 수 있습니다
- 도구는 `truncated`, `droppedMessages`, `contentTruncated`,
  `contentRedacted`, `bytes` 같은 요약 플래그를 보고합니다

두 도구 모두 **세션 키**(예: `"main"`)나 이전 list 호출에서 얻은
**세션 ID**를 받습니다.

바이트 단위로 정확한 transcript가 필요하다면, `sessions_history`를 raw dump로
취급하는 대신 디스크에 있는 transcript 파일을 직접 확인하세요.

## 교차 세션 메시지 전송

`sessions_send`는 다른 세션에 메시지를 전달하고 선택적으로 응답을 대기합니다:

- **Fire-and-forget:** `timeoutSeconds: 0`으로 설정하면 큐잉 후 즉시 반환됩니다.
- **응답 대기:** timeout을 설정하면 응답을 인라인으로 받습니다.

대상 세션이 응답한 후, OpenClaw는 **reply-back 루프**를 실행할 수 있는데
여기서 에이전트들이 서로 메시지를 주고받을 수 있습니다(최대 5턴). 대상 에이전트는
`REPLY_SKIP`으로 응답하여 조기에 멈출 수 있습니다.

## 상태 및 오케스트레이션 헬퍼

`session_status`는 현재 세션이나 다른 보이는(visible) 세션에 대한 경량
`/status` 등가 도구입니다. 사용량, 시간, 모델/런타임 상태, 연결된 백그라운드
태스크 컨텍스트(있는 경우)를 보고합니다. `/status`처럼, 최신 transcript의 usage
항목에서 희박한 token/cache 카운터를 backfill할 수 있으며, `model=default`는
세션별 오버라이드를 해제합니다.

`sessions_yield`는 다음 메시지가 대기 중인 후속(follow-up) 이벤트가 될 수 있도록
현재 턴을 의도적으로 종료합니다. 폴링 루프를 만드는 대신 완료 결과를 다음
메시지로 받고 싶을 때, 서브에이전트를 스폰한 후에 사용하세요.

`subagents`는 이미 스폰된 OpenClaw 서브에이전트들을 위한 control-plane 헬퍼입니다.
지원하는 작업:

- `action: "list"`: active/recent 실행을 점검
- `action: "steer"`: 실행 중인 자식에게 후속 가이드를 보냄
- `action: "kill"`: 하나의 자식 또는 `all`을 중단

## 서브에이전트 스폰

`sessions_spawn`은 기본적으로 백그라운드 작업용 격리 세션을 생성합니다.
항상 non-blocking이며 -- `runId`와 `childSessionKey`를 반환하며 즉시 리턴됩니다.

주요 옵션:

- `runtime: "subagent"`(기본값) 또는 외부 harness 에이전트용 `"acp"`.
- 자식 세션을 위한 `model` 및 `thinking` 오버라이드.
- `thread: true`: 스폰을 채팅 스레드(Discord, Slack 등)에 바인딩합니다.
- `sandbox: "require"`: 자식에게 샌드박싱을 강제합니다.
- `context: "fork"`: 네이티브 서브에이전트가 현재 요청자(requester) transcript를
  필요로 할 때 사용합니다. 이를 생략하거나 `context: "isolated"`를 사용하면
  깨끗한 자식이 생성됩니다.

기본 leaf 서브에이전트는 세션 도구를 받지 않습니다. `maxSpawnDepth >= 2`인 경우,
depth-1 orchestrator 서브에이전트는 자신의 자식들을 관리할 수 있도록
`sessions_spawn`, `subagents`, `sessions_list`, `sessions_history`를
추가로 받습니다. Leaf 실행은 여전히 재귀적 오케스트레이션 도구를 받지 않습니다.

완료 후에는 announce 단계가 결과를 요청자의 채널에 게시합니다.
완료 전달은 가능한 경우 바인딩된 스레드/토픽 라우팅을 보존하며,
완료 origin이 채널만 식별할 수 있는 경우에도 OpenClaw는 요청자 세션에
저장된 경로(`lastChannel` / `lastTo`)를 재사용하여 직접 전달할 수 있습니다.

ACP 관련 동작은 [ACP Agents](/tools/acp-agents)를 참고하세요.

## 가시성 (Visibility)

세션 도구는 에이전트가 볼 수 있는 범위를 제한하도록 스코프가 지정됩니다:

| 레벨    | 범위                                      |
| ------ | --------------------------------------- |
| `self` | 현재 세션만                                 |
| `tree` | 현재 세션 + 스폰된 서브에이전트                   |
| `agent`| 이 에이전트의 모든 세션                         |
| `all`  | 모든 세션(설정된 경우 교차 에이전트)               |

기본값은 `tree`입니다. 샌드박스된 세션은 설정과 무관하게 `tree`로 clamp됩니다.

## 추가로 읽을거리

- [세션 관리](/concepts/session) -- 라우팅, 라이프사이클, 유지 관리
- [ACP Agents](/tools/acp-agents) -- 외부 harness 스폰
- [멀티 에이전트](/concepts/multi-agent) -- 멀티 에이전트 아키텍처
- [Gateway Configuration](/gateway/configuration) -- 세션 도구 설정 값

## 관련 문서

- [세션 관리](/concepts/session)
- [세션 pruning](/concepts/session-pruning)
