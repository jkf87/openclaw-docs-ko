---
summary: "Claude Code, Cursor, Gemini CLI, 명시적 Codex ACP fallback, OpenClaw ACP 및 기타 하네스 agent를 위해 ACP 런타임 세션을 사용"
read_when:
  - 코딩 하네스를 ACP를 통해 실행할 때
  - 메시징 채널에서 대화 바인딩된 ACP 세션을 설정할 때
  - 메시지 채널 대화를 영구 ACP 세션에 바인딩할 때
  - ACP 백엔드 및 플러그인 배선 문제를 해결할 때
  - ACP 완료 전달 또는 agent-to-agent 루프를 디버깅할 때
  - 채팅에서 /acp 명령을 운영할 때
title: "ACP agents"
---

[Agent Client Protocol (ACP)](https://agentclientprotocol.com/) 세션은 OpenClaw가 ACP 백엔드 플러그인을 통해 외부 코딩 하네스(예: Pi, Claude Code, Cursor, Copilot, OpenClaw ACP, OpenCode, Gemini CLI 및 기타 지원되는 ACPX 하네스)를 실행하도록 해줍니다.

현재 대화에서 Codex를 바인딩하거나 제어하라고 OpenClaw에 평문 언어로 요청하면 OpenClaw는 네이티브 Codex app-server 플러그인(`/codex bind`, `/codex threads`, `/codex resume`)을 사용해야 합니다. `/acp`, ACP, acpx 또는 Codex 백그라운드 자식 세션을 요청하면 OpenClaw는 여전히 Codex를 ACP를 통해 라우팅할 수 있습니다. 각 ACP 세션 spawn은 [백그라운드 task](/automation/tasks)로 추적됩니다.

"Claude Code를 스레드에서 시작해"라거나 다른 외부 하네스를 사용하라고 OpenClaw에 평문 언어로 요청하면 OpenClaw는 해당 요청을 ACP 런타임(네이티브 sub-agent 런타임이 아닌)으로 라우팅해야 합니다.

Codex나 Claude Code가 외부 MCP 클라이언트로 기존 OpenClaw 채널 대화에 직접 연결되기를 원한다면 ACP 대신 [`openclaw mcp serve`](/cli/mcp)를 사용하세요.

## 어떤 페이지가 필요한가요?

쉽게 혼동할 수 있는 인접한 세 가지 표면이 있습니다.

| 하고 싶은 작업                                                                             | 사용하세요                             | 참고                                                                                                                                                       |
| ----------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 현재 대화에서 Codex를 바인딩하거나 제어                                                     | `/codex bind`, `/codex threads`       | 네이티브 Codex app-server 경로. 바운드 채팅 회신, 이미지 전달, 모델/fast/permissions, stop, steer 제어 포함. ACP는 명시적 fallback                          |
| Claude Code, Gemini CLI, 명시적 Codex ACP 또는 다른 외부 하네스를 OpenClaw를 _통해_ 실행  | 이 페이지: ACP agents                 | 채팅 바운드 세션, `/acp spawn`, `sessions_spawn({ runtime: "acp" })`, 백그라운드 task, 런타임 제어                                                        |
| OpenClaw Gateway 세션을 에디터나 클라이언트를 위한 ACP 서버 _로_ 노출                      | [`openclaw acp`](/cli/acp)            | Bridge 모드. IDE/클라이언트가 stdio/WebSocket을 통해 OpenClaw와 ACP로 대화                                                                                  |
| 로컬 AI CLI를 텍스트 전용 fallback 모델로 재사용                                            | [CLI Backends](/gateway/cli-backends) | ACP가 아님. OpenClaw 도구 없음, ACP 제어 없음, 하네스 런타임 없음                                                                                          |

## 바로 작동하나요?

대개 네. 새 설치는 번들된 `acpx` 런타임 플러그인이 기본 활성화되어 제공되며, OpenClaw가 시작 시 probe하고 자가 복구하는 플러그인 로컬 pinned `acpx` 바이너리를 포함합니다. readiness 점검을 위해 `/acp doctor`를 실행하세요.

첫 실행 시 유의사항:

- 대상 하네스 어댑터(Codex, Claude 등)는 처음 사용할 때 `npx`로 온디맨드 fetch될 수 있습니다.
- 벤더 auth는 해당 하네스를 위해 host에 여전히 존재해야 합니다.
- host에 npm이나 네트워크 접근이 없으면 캐시가 미리 warming되거나 어댑터가 다른 방식으로 설치될 때까지 첫 실행 어댑터 fetch가 실패합니다.

## 운영자 runbook

채팅에서 빠른 `/acp` 흐름:

1. **Spawn** — `/acp spawn claude --bind here`, `/acp spawn gemini --mode persistent --thread auto`, 또는 명시적 `/acp spawn codex --bind here`
2. 바운드 대화나 스레드에서 **작업**(또는 세션 키를 명시적으로 타깃).
3. **상태 확인** — `/acp status`
4. **튜닝** — `/acp model <provider/model>`, `/acp permissions <profile>`, `/acp timeout <seconds>`
5. 컨텍스트를 대체하지 않고 **steer** — `/acp steer tighten logging and continue`
6. **중지** — `/acp cancel`(현재 turn) 또는 `/acp close`(세션 + 바인딩)

네이티브 Codex 플러그인으로 라우팅되어야 하는 자연어 트리거:

- "이 Discord 채널을 Codex에 바인딩해."
- "이 채팅을 Codex 스레드 `<id>`에 연결해."
- "Codex 스레드를 보여주고 이것을 바인딩해."

네이티브 Codex 대화 바인딩은 기본 채팅 제어 경로이지만 인터랙티브한 Codex 승인/도구 흐름에 대해 의도적으로 보수적입니다: OpenClaw 동적 도구와 승인 프롬프트는 아직 이 바운드 채팅 경로를 통해 노출되지 않으므로 해당 요청은 명확한 설명과 함께 거부됩니다. 워크플로가 OpenClaw 동적 도구나 장기 실행 인터랙티브 승인에 의존할 때는 Codex 하네스 경로나 명시적 ACP fallback을 사용하세요.

ACP 런타임으로 라우팅되어야 하는 자연어 트리거:

- "이것을 원샷 Claude Code ACP 세션으로 실행하고 결과를 요약해줘."
- "이 작업에 Gemini CLI를 스레드에서 사용하고, 후속 조치는 같은 스레드에 유지해."
- "Codex를 백그라운드 스레드에서 ACP를 통해 실행해."

OpenClaw는 `runtime: "acp"`를 선택하고, 하네스 `agentId`를 해석하고, 지원되는 경우 현재 대화나 스레드에 바인딩하고, 후속 조치를 close/expiry 전까지 해당 세션으로 라우팅합니다. Codex는 ACP가 명시적이거나 요청된 백그라운드 런타임이 여전히 ACP가 필요한 경우에만 이 경로를 따릅니다.

## ACP vs sub-agents

외부 하네스 런타임을 원할 때 ACP를 사용하세요. Codex 대화 바인딩/제어에는 네이티브 Codex app-server를 사용하세요. OpenClaw 네이티브 위임 실행을 원할 때 sub-agent를 사용하세요.

| 영역          | ACP 세션                              | Sub-agent 실행                     |
| ------------- | ------------------------------------- | ---------------------------------- |
| 런타임        | ACP 백엔드 플러그인 (예: acpx)        | OpenClaw 네이티브 sub-agent 런타임 |
| 세션 키       | `agent:<agentId>:acp:<uuid>`          | `agent:<agentId>:subagent:<uuid>`  |
| 주요 명령     | `/acp ...`                            | `/subagents ...`                   |
| Spawn 도구    | `sessions_spawn` with `runtime:"acp"` | `sessions_spawn`(기본 런타임)      |

[Sub-agents](/tools/subagents)도 참조하세요.

## ACP가 Claude Code를 실행하는 방법

ACP를 통한 Claude Code의 경우 스택은:

1. OpenClaw ACP 세션 제어 평면
2. 번들된 `acpx` 런타임 플러그인
3. Claude ACP 어댑터
4. Claude 측 런타임/세션 기계

중요한 구분:

- ACP Claude는 ACP 제어, 세션 resume, 백그라운드 task 추적 및 선택적 대화/스레드 바인딩이 있는 하네스 세션입니다.
- CLI backends는 별도의 텍스트 전용 로컬 fallback 런타임입니다. [CLI Backends](/gateway/cli-backends)를 참조하세요.

운영자에게 실용적인 규칙은:

- `/acp spawn`, 바인딩 가능한 세션, 런타임 제어 또는 영구 하네스 작업이 필요하면: ACP 사용
- 원시 CLI를 통한 간단한 로컬 텍스트 fallback을 원하면: CLI backends 사용

## 바운드 세션

### 현재 대화 바인딩

`/acp spawn <harness> --bind here`는 현재 대화를 spawn된 ACP 세션에 고정합니다 — 자식 스레드 없이 같은 채팅 표면. OpenClaw는 transport, auth, 안전, 전달의 소유권을 계속 유지합니다. 해당 대화의 후속 메시지는 같은 세션으로 라우팅됩니다. `/new`와 `/reset`은 세션을 제자리에서 재설정합니다. `/acp close`는 바인딩을 제거합니다.

멘탈 모델:

- **채팅 표면** — 사람들이 계속 대화하는 곳(Discord 채널, Telegram 토픽, iMessage 채팅).
- **ACP 세션** — OpenClaw가 라우팅하는 내구성 있는 Codex/Claude/Gemini 런타임 상태.
- **자식 스레드/토픽** — `--thread ...`에 의해서만 생성되는 선택적 추가 메시징 표면.
- **런타임 워크스페이스** — 하네스가 실행되는 파일시스템 위치(`cwd`, 저장소 체크아웃, 백엔드 워크스페이스). 채팅 표면과 독립적.

예시:

- `/codex bind` — 이 채팅을 유지하고, 네이티브 Codex app-server를 spawn하거나 attach하고, 미래의 메시지를 여기로 라우팅.
- `/codex model gpt-5.4`, `/codex fast on`, `/codex permissions yolo` — 채팅에서 바운드 네이티브 Codex 스레드를 튜닝.
- `/codex stop` 또는 `/codex steer focus on the failing tests first` — 활성 네이티브 Codex turn 제어.
- `/acp spawn codex --bind here` — Codex를 위한 명시적 ACP fallback.
- `/acp spawn codex --thread auto` — OpenClaw가 자식 스레드/토픽을 생성하고 거기에 바인딩할 수 있음.
- `/acp spawn codex --bind here --cwd /workspace/repo` — 같은 채팅 바인딩, Codex는 `/workspace/repo`에서 실행.

참고사항:

- `--bind here`와 `--thread ...`는 상호 배타적입니다.
- `--bind here`는 current-conversation binding을 알리는 채널에서만 작동합니다. 그렇지 않으면 OpenClaw가 명확한 unsupported 메시지를 반환합니다. 바인딩은 gateway 재시작 사이에도 유지됩니다.
- Discord에서 `spawnAcpSessions`는 OpenClaw가 `--thread auto|here`에 대한 자식 스레드를 생성해야 할 때만 필요하며, `--bind here`에는 필요하지 않습니다.
- `--cwd` 없이 다른 ACP agent로 spawn하면 OpenClaw는 기본적으로 **대상 agent의** 워크스페이스를 상속합니다. 누락된 상속 경로(`ENOENT`/`ENOTDIR`)는 백엔드 기본값으로 fallback되며, 다른 접근 오류(예: `EACCES`)는 spawn 오류로 표시됩니다.

### 스레드 바운드 세션

채널 어댑터에 대해 스레드 바인딩이 활성화되면 ACP 세션은 스레드에 바인딩될 수 있습니다.

- OpenClaw가 스레드를 대상 ACP 세션에 바인딩합니다.
- 해당 스레드의 후속 메시지는 바운드 ACP 세션으로 라우팅됩니다.
- ACP 출력은 같은 스레드로 다시 전달됩니다.
- Unfocus/close/archive/idle-timeout 또는 max-age expiry는 바인딩을 제거합니다.

스레드 바인딩 지원은 어댑터별입니다. 활성 채널 어댑터가 스레드 바인딩을 지원하지 않으면 OpenClaw가 명확한 unsupported/unavailable 메시지를 반환합니다.

스레드 바운드 ACP에 필요한 feature flag:

- `acp.enabled=true`
- `acp.dispatch.enabled`는 기본 활성 (ACP dispatch를 일시 중지하려면 `false`로 설정)
- 채널 어댑터 ACP 스레드 spawn 플래그 활성화 (어댑터별)
  - Discord: `channels.discord.threadBindings.spawnAcpSessions=true`
  - Telegram: `channels.telegram.threadBindings.spawnAcpSessions=true`

### 스레드 지원 채널

- 세션/스레드 바인딩 기능을 노출하는 모든 채널 어댑터.
- 현재 내장 지원:
  - Discord 스레드/채널
  - Telegram 토픽(그룹/슈퍼그룹의 forum 토픽 및 DM 토픽)
- 플러그인 채널은 동일한 바인딩 인터페이스를 통해 지원을 추가할 수 있습니다.

## 채널별 설정

비일시적 워크플로를 위해 최상위 `bindings[]` 엔트리에서 영구 ACP 바인딩을 구성하세요.

### 바인딩 모델

- `bindings[].type="acp"`는 영구 ACP 대화 바인딩을 표시합니다.
- `bindings[].match`는 대상 대화를 식별합니다:
  - Discord 채널 또는 스레드: `match.channel="discord"` + `match.peer.id="<channelOrThreadId>"`
  - Telegram forum 토픽: `match.channel="telegram"` + `match.peer.id="<chatId>:topic:<topicId>"`
  - BlueBubbles DM/그룹 채팅: `match.channel="bluebubbles"` + `match.peer.id="<handle|chat_id:*|chat_guid:*|chat_identifier:*>"`
    안정적인 그룹 바인딩에는 `chat_id:*` 또는 `chat_identifier:*`를 선호하세요.
  - iMessage DM/그룹 채팅: `match.channel="imessage"` + `match.peer.id="<handle|chat_id:*|chat_guid:*|chat_identifier:*>"`
    안정적인 그룹 바인딩에는 `chat_id:*`를 선호하세요.
- `bindings[].agentId`는 소유 OpenClaw agent id입니다.
- 선택적 ACP override는 `bindings[].acp` 아래에 있습니다:
  - `mode` (`persistent` 또는 `oneshot`)
  - `label`
  - `cwd`
  - `backend`

### agent별 런타임 기본값

`agents.list[].runtime`을 사용해 agent당 한 번 ACP 기본값을 정의하세요:

- `agents.list[].runtime.type="acp"`
- `agents.list[].runtime.acp.agent` (하네스 id, 예: `codex` 또는 `claude`)
- `agents.list[].runtime.acp.backend`
- `agents.list[].runtime.acp.mode`
- `agents.list[].runtime.acp.cwd`

ACP 바운드 세션의 Override 우선순위:

1. `bindings[].acp.*`
2. `agents.list[].runtime.acp.*`
3. 전역 ACP 기본값 (예: `acp.backend`)

예시:

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace/openclaw",
          },
        },
      },
      {
        id: "claude",
        runtime: {
          type: "acp",
          acp: { agent: "claude", backend: "acpx", mode: "persistent" },
        },
      },
    ],
  },
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "discord",
        accountId: "default",
        peer: { kind: "channel", id: "222222222222222222" },
      },
      acp: { label: "codex-main" },
    },
    {
      type: "acp",
      agentId: "claude",
      match: {
        channel: "telegram",
        accountId: "default",
        peer: { kind: "group", id: "-1001234567890:topic:42" },
      },
      acp: { cwd: "/workspace/repo-b" },
    },
    {
      type: "route",
      agentId: "main",
      match: { channel: "discord", accountId: "default" },
    },
    {
      type: "route",
      agentId: "main",
      match: { channel: "telegram", accountId: "default" },
    },
  ],
  channels: {
    discord: {
      guilds: {
        "111111111111111111": {
          channels: {
            "222222222222222222": { requireMention: false },
          },
        },
      },
    },
    telegram: {
      groups: {
        "-1001234567890": {
          topics: { "42": { requireMention: false } },
        },
      },
    },
  },
}
```

동작:

- OpenClaw는 사용 전에 설정된 ACP 세션이 존재하도록 보장합니다.
- 해당 채널이나 토픽의 메시지는 설정된 ACP 세션으로 라우팅됩니다.
- 바운드 대화에서 `/new`와 `/reset`은 동일한 ACP 세션 키를 제자리에서 재설정합니다.
- 임시 런타임 바인딩(예: thread-focus 흐름으로 생성된 것)은 존재할 때 여전히 적용됩니다.
- 명시적 `cwd` 없이 cross-agent ACP spawn의 경우 OpenClaw는 agent 설정에서 대상 agent 워크스페이스를 상속합니다.
- 누락된 상속된 워크스페이스 경로는 백엔드 기본 cwd로 fallback됩니다. 누락이 아닌 접근 실패는 spawn 오류로 표시됩니다.

## ACP 세션 시작 (인터페이스)

### `sessions_spawn`에서

agent turn이나 도구 호출에서 ACP 세션을 시작하려면 `runtime: "acp"`를 사용하세요.

```json
{
  "task": "Open the repo and summarize failing tests",
  "runtime": "acp",
  "agentId": "codex",
  "thread": true,
  "mode": "session"
}
```

참고사항:

- `runtime`은 기본값이 `subagent`이므로 ACP 세션의 경우 `runtime: "acp"`를 명시적으로 설정하세요.
- `agentId`가 생략되면 OpenClaw는 설정된 경우 `acp.defaultAgent`를 사용합니다.
- `mode: "session"`은 영구 바운드 대화를 유지하기 위해 `thread: true`가 필요합니다.

인터페이스 세부사항:

- `task` (필수): ACP 세션에 전송되는 초기 prompt.
- `runtime` (ACP에 필수): `"acp"`여야 합니다.
- `agentId` (선택): ACP 대상 하네스 id. 설정되면 `acp.defaultAgent`로 fallback합니다.
- `thread` (선택, 기본 `false`): 지원되는 곳에서 스레드 바인딩 흐름을 요청합니다.
- `mode` (선택): `run` (one-shot) 또는 `session` (persistent).
  - 기본값은 `run`
  - `thread: true`이고 mode가 생략되면 OpenClaw는 런타임 경로별로 persistent 동작을 기본값으로 할 수 있습니다
  - `mode: "session"`은 `thread: true`가 필요합니다
- `cwd` (선택): 요청된 런타임 작업 디렉토리 (백엔드/런타임 정책에 의해 검증). 생략되면 ACP spawn은 설정된 경우 대상 agent 워크스페이스를 상속합니다. 누락된 상속 경로는 백엔드 기본값으로 fallback되며, 실제 접근 오류는 반환됩니다.
- `label` (선택): 세션/배너 텍스트에 사용되는 운영자 대면 label.
- `resumeSessionId` (선택): 새 세션을 만드는 대신 기존 ACP 세션을 재개합니다. agent는 `session/load`를 통해 대화 이력을 replay합니다. `runtime: "acp"`가 필요합니다.
- `streamTo` (선택): `"parent"`는 초기 ACP 실행 진행 요약을 system event로 요청자 세션에 다시 스트리밍합니다.
  - 사용 가능한 경우 수락된 응답에는 전체 relay 이력을 tail할 수 있는 세션 범위 JSONL 로그(`<sessionId>.acp-stream.jsonl`)를 가리키는 `streamLogPath`가 포함됩니다.
- `model` (선택): ACP 자식 세션을 위한 명시적 모델 override. `runtime: "acp"`에 대해 존중되므로 자식은 대상 agent 기본값으로 조용히 fallback되는 대신 요청된 모델을 사용합니다.

## 전달 모델

ACP 세션은 인터랙티브 워크스페이스이거나 parent 소유 백그라운드 작업일 수 있습니다. 전달 경로는 그 형태에 따라 달라집니다.

### 인터랙티브 ACP 세션

인터랙티브 세션은 가시적인 채팅 표면에서 계속 대화하기 위한 것입니다:

- `/acp spawn ... --bind here`는 현재 대화를 ACP 세션에 바인딩합니다.
- `/acp spawn ... --thread ...`는 채널 스레드/토픽을 ACP 세션에 바인딩합니다.
- 영구 설정된 `bindings[].type="acp"`는 일치하는 대화를 동일한 ACP 세션으로 라우팅합니다.

바운드 대화의 후속 메시지는 ACP 세션으로 직접 라우팅되며, ACP 출력은 동일한 채널/스레드/토픽으로 다시 전달됩니다.

### Parent 소유 one-shot ACP 세션

다른 agent 실행에 의해 spawn된 one-shot ACP 세션은 sub-agent와 유사하게 백그라운드 자식입니다:

- parent가 `sessions_spawn({ runtime: "acp", mode: "run" })`로 작업을 요청합니다.
- 자식이 자체 ACP 하네스 세션에서 실행됩니다.
- 완료는 내부 task-completion announce 경로를 통해 다시 보고됩니다.
- 사용자 대면 회신이 유용할 때 parent는 자식 결과를 일반 assistant voice로 다시 씁니다.

이 경로를 parent와 자식 사이의 peer-to-peer 채팅으로 취급하지 마세요. 자식은 이미 parent로 돌아가는 완료 채널을 가지고 있습니다.

### `sessions_send` 및 A2A 전달

`sessions_send`는 spawn 후 다른 세션을 타깃팅할 수 있습니다. 일반 peer 세션의 경우 OpenClaw는 메시지를 주입한 후 agent-to-agent (A2A) 후속 경로를 사용합니다:

- 대상 세션의 회신을 기다림
- 선택적으로 요청자와 대상이 제한된 수의 후속 turn을 교환하도록 허용
- 대상에게 announce 메시지를 생성하도록 요청
- 해당 announce를 가시적 채널이나 스레드에 전달

그 A2A 경로는 sender가 가시적 후속 조치를 필요로 하는 peer send를 위한 fallback입니다. 관련 없는 세션이 ACP 대상을 보고 메시지를 보낼 수 있을 때(예: 광범위한 `tools.sessions.visibility` 설정 하에) 활성 상태로 유지됩니다.

OpenClaw는 요청자가 자체 parent 소유 one-shot ACP 자식의 parent인 경우에만 A2A 후속 조치를 건너뜁니다. 이 경우 task 완료 위에 A2A를 실행하면 parent를 자식 결과로 깨울 수 있고, parent의 회신을 자식으로 다시 전달하며, parent/child echo 루프를 생성할 수 있습니다. `sessions_send` 결과는 owned-child 케이스에 대해 `delivery.status="skipped"`를 보고하는데, 완료 경로가 이미 결과를 담당하기 때문입니다.

### 기존 세션 재개

새로 시작하는 대신 이전 ACP 세션을 계속하려면 `resumeSessionId`를 사용하세요. agent는 `session/load`를 통해 대화 이력을 replay하므로 이전에 있었던 일의 전체 컨텍스트를 가지고 이어갑니다.

```json
{
  "task": "Continue where we left off — fix the remaining test failures",
  "runtime": "acp",
  "agentId": "codex",
  "resumeSessionId": "<previous-session-id>"
}
```

일반적인 사용 사례:

- 노트북에서 전화로 Codex 세션을 넘기기 — agent에게 멈춘 곳에서 이어가라고 지시
- CLI에서 인터랙티브하게 시작한 코딩 세션을 이제 agent를 통해 headless로 계속
- gateway 재시작이나 idle timeout으로 중단된 작업 이어가기

참고사항:

- `resumeSessionId`는 `runtime: "acp"`가 필요합니다 — sub-agent 런타임과 함께 사용하면 오류를 반환합니다.
- `resumeSessionId`는 upstream ACP 대화 이력을 복원합니다. `thread`와 `mode`는 여전히 생성 중인 새 OpenClaw 세션에 정상적으로 적용되므로 `mode: "session"`은 여전히 `thread: true`가 필요합니다.
- 대상 agent는 `session/load`를 지원해야 합니다(Codex와 Claude Code는 지원합니다).
- 세션 ID를 찾을 수 없으면 spawn은 명확한 오류로 실패합니다 — 새 세션으로의 조용한 fallback은 없습니다.

<Accordion title="배포 후 smoke 테스트">

gateway 배포 후 unit test를 신뢰하기보다 라이브 end-to-end 점검을 실행하세요:

1. 대상 host에서 배포된 gateway 버전과 commit을 검증합니다.
2. 라이브 agent에 임시 ACPX bridge 세션을 엽니다.
3. 해당 agent에게 `runtime: "acp"`, `agentId: "codex"`, `mode: "run"`, 그리고 task `Reply with exactly LIVE-ACP-SPAWN-OK`로 `sessions_spawn`을 호출하도록 요청합니다.
4. `accepted=yes`, 실제 `childSessionKey`, 그리고 validator 오류가 없음을 검증합니다.
5. 임시 bridge 세션을 정리합니다.

게이트를 `mode: "run"`으로 유지하고 `streamTo: "parent"`는 건너뛰세요 — 스레드 바운드 `mode: "session"`과 stream-relay 경로는 별도의 더 풍부한 통합 pass입니다.

</Accordion>

## 샌드박스 호환성

ACP 세션은 현재 OpenClaw 샌드박스 내부가 아니라 host 런타임에서 실행됩니다.

현재 제한사항:

- 요청자 세션이 샌드박스된 경우 ACP spawn은 `sessions_spawn({ runtime: "acp" })`와 `/acp spawn` 모두에 대해 차단됩니다.
  - 오류: `Sandboxed sessions cannot spawn ACP sessions because runtime="acp" runs on the host. Use runtime="subagent" from sandboxed sessions.`
- `runtime: "acp"`인 `sessions_spawn`은 `sandbox: "require"`를 지원하지 않습니다.
  - 오류: `sessions_spawn sandbox="require" is unsupported for runtime="acp" because ACP sessions run outside the sandbox. Use runtime="subagent" or sandbox="inherit".`

샌드박스로 강제된 실행이 필요할 때는 `runtime: "subagent"`를 사용하세요.

### `/acp` 명령에서

필요할 때 채팅에서 명시적 운영자 제어를 위해 `/acp spawn`을 사용하세요.

```text
/acp spawn codex --mode persistent --thread auto
/acp spawn codex --mode oneshot --thread off
/acp spawn codex --bind here
/acp spawn codex --thread here
```

주요 플래그:

- `--mode persistent|oneshot`
- `--bind here|off`
- `--thread auto|here|off`
- `--cwd <absolute-path>`
- `--label <name>`

[Slash Commands](/tools/slash-commands)를 참조하세요.

## 세션 대상 해결

대부분의 `/acp` 액션은 선택적 세션 대상(`session-key`, `session-id`, 또는 `session-label`)을 수락합니다.

해결 순서:

1. 명시적 대상 인수 (또는 `/acp steer`의 경우 `--session`)
   - 키 시도
   - 그 다음 UUID 형태의 세션 id
   - 그 다음 label
2. 현재 스레드 바인딩 (이 대화/스레드가 ACP 세션에 바인딩되어 있는 경우)
3. 현재 요청자 세션 fallback

현재 대화 바인딩과 스레드 바인딩 모두 2단계에 참여합니다.

대상이 해결되지 않으면 OpenClaw가 명확한 오류(`Unable to resolve session target: ...`)를 반환합니다.

## Spawn 바인딩 모드

`/acp spawn`은 `--bind here|off`를 지원합니다.

| 모드   | 동작                                                                  |
| ------ | --------------------------------------------------------------------- |
| `here` | 현재 활성 대화를 제자리에서 바인딩. 활성 상태가 없으면 실패.          |
| `off`  | 현재 대화 바인딩을 생성하지 않음.                                      |

참고사항:

- `--bind here`는 "이 채널이나 채팅을 Codex 기반으로 만들기"에 대한 가장 간단한 운영자 경로입니다.
- `--bind here`는 자식 스레드를 생성하지 않습니다.
- `--bind here`는 current-conversation binding 지원을 노출하는 채널에서만 사용할 수 있습니다.
- `--bind`와 `--thread`는 동일한 `/acp spawn` 호출에서 결합할 수 없습니다.

## Spawn 스레드 모드

`/acp spawn`은 `--thread auto|here|off`를 지원합니다.

| 모드   | 동작                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------- |
| `auto` | 활성 스레드에서: 해당 스레드 바인딩. 스레드 외부: 지원되는 경우 자식 스레드 생성/바인딩.             |
| `here` | 현재 활성 스레드 필요. 스레드에 없으면 실패.                                                        |
| `off`  | 바인딩 없음. 세션이 unbound 상태로 시작.                                                            |

참고사항:

- 비 스레드 바인딩 표면에서 기본 동작은 사실상 `off`입니다.
- 스레드 바운드 spawn은 채널 정책 지원이 필요합니다:
  - Discord: `channels.discord.threadBindings.spawnAcpSessions=true`
  - Telegram: `channels.telegram.threadBindings.spawnAcpSessions=true`
- 자식 스레드를 생성하지 않고 현재 대화를 고정하려면 `--bind here`를 사용하세요.

## ACP 제어

| 명령                 | 하는 일                                                      | 예시                                                          |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `/acp spawn`         | ACP 세션 생성. 선택적 현재 bind 또는 스레드 bind.            | `/acp spawn codex --bind here --cwd /repo`                    |
| `/acp cancel`        | 대상 세션의 진행 중 turn 취소.                               | `/acp cancel agent:codex:acp:<uuid>`                          |
| `/acp steer`         | 실행 중인 세션에 steer 지시 전송.                            | `/acp steer --session support inbox prioritize failing tests` |
| `/acp close`         | 세션을 닫고 스레드 대상을 unbind.                            | `/acp close`                                                  |
| `/acp status`        | 백엔드, 모드, 상태, 런타임 옵션, 기능 표시.                  | `/acp status`                                                 |
| `/acp set-mode`      | 대상 세션의 런타임 모드 설정.                                | `/acp set-mode plan`                                          |
| `/acp set`           | 일반 런타임 설정 옵션 쓰기.                                  | `/acp set model openai/gpt-5.4`                               |
| `/acp cwd`           | 런타임 작업 디렉토리 override 설정.                          | `/acp cwd /Users/user/Projects/repo`                          |
| `/acp permissions`   | 승인 정책 프로필 설정.                                       | `/acp permissions strict`                                     |
| `/acp timeout`       | 런타임 타임아웃(초) 설정.                                    | `/acp timeout 120`                                            |
| `/acp model`         | 런타임 모델 override 설정.                                   | `/acp model anthropic/claude-opus-4-6`                        |
| `/acp reset-options` | 세션 런타임 옵션 override 제거.                              | `/acp reset-options`                                          |
| `/acp sessions`      | 저장소의 최근 ACP 세션 목록.                                 | `/acp sessions`                                               |
| `/acp doctor`        | 백엔드 상태, 기능, 실행 가능한 수정.                         | `/acp doctor`                                                 |
| `/acp install`       | 결정적 설치 및 활성화 단계 출력.                             | `/acp install`                                                |

`/acp status`는 효과적인 런타임 옵션과 런타임 수준 및 백엔드 수준 세션 식별자를 표시합니다. 백엔드가 기능이 없을 때 unsupported-control 오류가 명확하게 표시됩니다. `/acp sessions`는 현재 바운드 또는 요청자 세션에 대한 저장소를 읽습니다. 대상 토큰(`session-key`, `session-id`, 또는 `session-label`)은 사용자 정의 agent별 `session.store` 루트를 포함한 gateway 세션 검색을 통해 해결됩니다.

## 런타임 옵션 매핑

`/acp`는 편의 명령과 일반 setter를 가지고 있습니다.

동등한 작업:

- `/acp model <id>`는 런타임 설정 키 `model`에 매핑됩니다.
- `/acp permissions <profile>`은 런타임 설정 키 `approval_policy`에 매핑됩니다.
- `/acp timeout <seconds>`는 런타임 설정 키 `timeout`에 매핑됩니다.
- `/acp cwd <path>`는 cwd override 경로를 직접 업데이트합니다.
- `/acp set <key> <value>`는 일반 경로입니다.
  - 특수 케이스: `key=cwd`는 cwd override 경로를 사용합니다.
- `/acp reset-options`는 대상 세션의 모든 런타임 override를 지웁니다.

## acpx 하네스, 플러그인 설정, 권한

acpx 하네스 설정(Claude Code / Codex / Gemini CLI alias), 플러그인 도구 및 OpenClaw 도구 MCP bridge, ACP 권한 모드에 대해서는 [ACP agents — 설정](/tools/acp-agents-setup)을 참조하세요.

## 문제 해결

| 증상                                                                          | 가능한 원인                                                                         | 수정                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACP runtime backend is not configured`                                       | 백엔드 플러그인이 누락되었거나 비활성화됨.                                          | 백엔드 플러그인 설치 및 활성화 후 `/acp doctor` 실행.                                                                                                                     |
| `ACP is disabled by policy (acp.enabled=false)`                               | ACP가 전역적으로 비활성화됨.                                                        | `acp.enabled=true`로 설정.                                                                                                                                                |
| `ACP dispatch is disabled by policy (acp.dispatch.enabled=false)`             | 일반 스레드 메시지에서의 dispatch가 비활성화됨.                                     | `acp.dispatch.enabled=true`로 설정.                                                                                                                                       |
| `ACP agent "<id>" is not allowed by policy`                                   | agent가 allowlist에 없음.                                                           | 허용된 `agentId`를 사용하거나 `acp.allowedAgents`를 업데이트.                                                                                                             |
| `Unable to resolve session target: ...`                                       | 잘못된 키/id/label 토큰.                                                            | `/acp sessions`를 실행해 정확한 키/label을 복사한 후 재시도.                                                                                                              |
| `--bind here requires running /acp spawn inside an active ... conversation`   | 활성 바인딩 가능 대화 없이 `--bind here` 사용.                                      | 대상 채팅/채널로 이동 후 재시도하거나 unbound spawn 사용.                                                                                                                 |
| `Conversation bindings are unavailable for <channel>.`                        | 어댑터에 current-conversation ACP 바인딩 기능 없음.                                 | 지원되는 곳에서 `/acp spawn ... --thread ...`를 사용하거나, 최상위 `bindings[]`를 설정하거나, 지원되는 채널로 이동.                                                       |
| `--thread here requires running /acp spawn inside an active ... thread`       | 스레드 컨텍스트 외부에서 `--thread here` 사용.                                      | 대상 스레드로 이동하거나 `--thread auto`/`off` 사용.                                                                                                                      |
| `Only <user-id> can rebind this channel/conversation/thread.`                 | 다른 사용자가 활성 바인딩 대상을 소유.                                              | 소유자로 rebind하거나 다른 대화나 스레드 사용.                                                                                                                            |
| `Thread bindings are unavailable for <channel>.`                              | 어댑터에 스레드 바인딩 기능 없음.                                                   | `--thread off`를 사용하거나 지원되는 어댑터/채널로 이동.                                                                                                                  |
| `Sandboxed sessions cannot spawn ACP sessions ...`                            | ACP 런타임은 host 측. 요청자 세션이 샌드박스됨.                                     | 샌드박스 세션에서 `runtime="subagent"`를 사용하거나 비 샌드박스 세션에서 ACP spawn 실행.                                                                                  |
| `sessions_spawn sandbox="require" is unsupported for runtime="acp" ...`       | ACP 런타임에 대해 `sandbox="require"` 요청됨.                                       | 필수 샌드박싱을 위해 `runtime="subagent"`를 사용하거나 비 샌드박스 세션에서 `sandbox="inherit"`로 ACP 사용.                                                               |
| 바운드 세션에 ACP 메타데이터 누락                                              | 오래된/삭제된 ACP 세션 메타데이터.                                                  | `/acp spawn`으로 재생성 후 스레드 rebind/focus.                                                                                                                           |
| `AcpRuntimeError: Permission prompt unavailable in non-interactive mode`      | 비 인터랙티브 ACP 세션에서 `permissionMode`가 쓰기/실행을 차단.                     | `plugins.entries.acpx.config.permissionMode`를 `approve-all`로 설정하고 gateway 재시작. [권한 설정](/tools/acp-agents-setup#permission-configuration)을 참조하세요.       |
| ACP 세션이 출력이 거의 없이 일찍 실패                                         | `permissionMode`/`nonInteractivePermissions`에 의해 권한 프롬프트가 차단됨.         | gateway 로그에서 `AcpRuntimeError` 확인. 전체 권한의 경우 `permissionMode=approve-all`로 설정. 우아한 degradation의 경우 `nonInteractivePermissions=deny`로 설정.         |
| ACP 세션이 작업 완료 후 무기한 정지                                           | 하네스 프로세스는 완료되었지만 ACP 세션이 완료를 보고하지 않음.                     | `ps aux \| grep acpx`로 모니터링. 정지된 프로세스를 수동으로 kill.                                                                                                        |

## 관련

- [Sub-agents](/tools/subagents)
- [Multi-agent 샌드박스 도구](/tools/multi-agent-sandbox-tools)
- [Agent send](/tools/agent-send)
