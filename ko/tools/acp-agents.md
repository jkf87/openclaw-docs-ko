---
summary: "ACP 백엔드 플러그인을 통해 Codex, Claude Code, Gemini CLI 같은 외부 코딩 하네스를 OpenClaw에서 실행"
read_when:
  - 외부 하네스를 ACP 세션으로 실행하고 싶을 때
  - 대화/스레드 바인딩, `/acp spawn`, 런타임 제어를 설정할 때
  - ACP 권한, 샌드박스 호환성, 플러그인 도구 브리지를 구성할 때
title: "ACP 에이전트"
---

# ACP 에이전트

# ACP 에이전트

[Agent Client Protocol (ACP)](https://agentclientprotocol.com/) 세션을 사용하면 OpenClaw가 외부 코딩 하네스(예: Pi, Claude Code, Codex, Cursor, Copilot, OpenClaw ACP, OpenCode, Gemini CLI 및 기타 지원되는 ACPX 하네스)를 ACP 백엔드 플러그인을 통해 실행할 수 있습니다.

OpenClaw에게 자연어로 "이거 Codex에서 실행해줘" 또는 "여기 스레드에서 Claude Code 시작해줘"라고 요청하면, OpenClaw는 해당 요청을 ACP 런타임으로 라우팅해야 합니다(네이티브 서브에이전트 런타임이 아님). 각 ACP 세션 스폰은 [백그라운드 작업](/automation/tasks)으로 추적됩니다.

Codex 또는 Claude Code가 외부 MCP 클라이언트로서 기존 OpenClaw 채널 대화에 직접 연결되도록 하려면, ACP 대신 [`openclaw mcp serve`](/cli/mcp)를 사용하세요.

## 어떤 페이지를 원하시나요?

쉽게 혼동되는 세 가지 인접한 표면이 있습니다.

| 원하는 작업                                                                             | 사용할 것                             | 비고                                                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Codex, Claude Code, Gemini CLI 또는 기타 외부 하네스를 OpenClaw를 *통해* 실행           | 이 페이지: ACP 에이전트               | 채팅-바운드 세션, `/acp spawn`, `sessions_spawn({ runtime: "acp" })`, 백그라운드 작업, 런타임 제어                 |
| OpenClaw 게이트웨이 세션을 에디터 또는 클라이언트용 ACP 서버*로* 노출                   | [`openclaw acp`](/cli/acp)            | 브리지 모드. IDE/클라이언트가 stdio/WebSocket을 통해 OpenClaw와 ACP로 통신                                         |
| 로컬 AI CLI를 텍스트 전용 폴백 모델로 재사용                                            | [CLI Backends](/gateway/cli-backends) | ACP가 아님. OpenClaw 도구 없음, ACP 제어 없음, 하네스 런타임 없음                                                  |

## 기본 설정으로 바로 동작하나요?

대부분 그렇습니다.

* 새로 설치된 버전은 번들된 `acpx` 런타임 플러그인이 기본적으로 활성화되어 제공됩니다.
* 번들된 `acpx` 플러그인은 플러그인 로컬에 고정된 `acpx` 바이너리를 선호합니다.
* 시작 시 OpenClaw는 해당 바이너리를 탐색하고 필요 시 자가 복구합니다.
* 빠른 준비 상태 확인을 원한다면 `/acp doctor`로 시작하세요.

최초 사용 시 여전히 발생할 수 있는 일:

* 대상 하네스 어댑터가 해당 하네스를 처음 사용할 때 `npx`로 온디맨드 페치될 수 있습니다.
* 해당 하네스를 위한 벤더 인증이 호스트에 존재해야 합니다.
* 호스트에 npm/네트워크 액세스가 없으면, 캐시가 미리 웜업되거나 어댑터가 다른 방법으로 설치되기 전까지 첫 실행 어댑터 페치가 실패할 수 있습니다.

예시:

* `/acp spawn codex`: OpenClaw는 `acpx`를 부트스트랩할 준비가 되어 있지만, Codex ACP 어댑터는 여전히 첫 실행 페치가 필요할 수 있습니다.
* `/acp spawn claude`: Claude ACP 어댑터에 대해서도 같은 상황이며, 해당 호스트의 Claude 측 인증도 필요합니다.

## 빠른 오퍼레이터 흐름

실용적인 `/acp` 런북이 필요할 때 사용하세요.

1. 세션 스폰:
   * `/acp spawn codex --bind here`
   * `/acp spawn codex --mode persistent --thread auto`
2. 바인드된 대화 또는 스레드에서 작업하거나, 해당 세션 키를 명시적으로 대상으로 지정합니다.
3. 런타임 상태 확인:
   * `/acp status`
4. 필요 시 런타임 옵션 조정:
   * `/acp model <provider/model>`
   * `/acp permissions <profile>`
   * `/acp timeout <seconds>`
5. 컨텍스트를 교체하지 않고 활성 세션 방향 조정:
   * `/acp steer tighten logging and continue`
6. 작업 중지:
   * `/acp cancel` (현재 턴 중지), 또는
   * `/acp close` (세션 종료 + 바인딩 제거)

## 사용자를 위한 빠른 시작

자연어 요청 예시:

* "이 Discord 채널을 Codex에 바인드해줘."
* "여기 스레드에서 지속 Codex 세션을 시작하고 집중 상태를 유지해줘."
* "이것을 일회성 Claude Code ACP 세션으로 실행하고 결과를 요약해줘."
* "이 iMessage 채팅을 Codex에 바인드하고 후속 작업을 같은 워크스페이스에 유지해줘."
* "이 작업에 Gemini CLI를 스레드에서 사용하고, 후속 작업을 같은 스레드에 유지해줘."

OpenClaw가 해야 할 일:

1. `runtime: "acp"`를 선택합니다.
2. 요청된 하네스 대상(`agentId`, 예: `codex`)을 해석합니다.
3. 현재 대화 바인딩이 요청되었고 활성 채널이 이를 지원하면, ACP 세션을 해당 대화에 바인드합니다.
4. 그렇지 않고 스레드 바인딩이 요청되었으며 현재 채널이 이를 지원하면, ACP 세션을 스레드에 바인드합니다.
5. 해당 ACP 세션이 언포커스/종료/만료될 때까지 후속 바운드 메시지를 같은 ACP 세션으로 라우팅합니다.

## ACP 대 서브에이전트

외부 하네스 런타임을 원할 때는 ACP를 사용하세요. OpenClaw 네이티브 위임 실행을 원할 때는 서브에이전트를 사용하세요.

| 영역          | ACP 세션                              | 서브에이전트 실행                   |
| ------------- | ------------------------------------- | ----------------------------------- |
| 런타임        | ACP 백엔드 플러그인(예: acpx)         | OpenClaw 네이티브 서브에이전트 런타임 |
| 세션 키       | `agent:<agentId>:acp:<uuid>`          | `agent:<agentId>:subagent:<uuid>`   |
| 주요 명령어   | `/acp ...`                            | `/subagents ...`                    |
| 스폰 도구     | `sessions_spawn` with `runtime:"acp"` | `sessions_spawn` (기본 런타임)      |

[서브에이전트](/tools/subagents)도 참조하세요.

## ACP가 Claude Code를 실행하는 방식

ACP를 통한 Claude Code의 스택은 다음과 같습니다.

1. OpenClaw ACP 세션 제어 플레인
2. 번들된 `acpx` 런타임 플러그인
3. Claude ACP 어댑터
4. Claude 측 런타임/세션 기구

중요한 구분:

* ACP Claude는 ACP 제어, 세션 재개, 백그라운드 작업 추적, 선택적 대화/스레드 바인딩을 갖춘 하네스 세션입니다.
* CLI 백엔드는 별도의 텍스트 전용 로컬 폴백 런타임입니다. [CLI Backends](/gateway/cli-backends)를 참조하세요.

오퍼레이터를 위한 실무 규칙:

* `/acp spawn`, 바인드 가능한 세션, 런타임 제어, 또는 지속적 하네스 작업이 필요하면: ACP 사용
* 원시 CLI를 통한 간단한 로컬 텍스트 폴백이 필요하면: CLI 백엔드 사용

## 바운드 세션

### 현재 대화 바인드

자식 스레드를 생성하지 않고 현재 대화를 지속적인 ACP 워크스페이스로 만들고 싶을 때 `/acp spawn <harness> --bind here`를 사용하세요.

동작:

* OpenClaw가 계속 채널 트랜스포트, 인증, 안전, 전달을 소유합니다.
* 현재 대화가 스폰된 ACP 세션 키에 고정됩니다.
* 해당 대화의 후속 메시지는 같은 ACP 세션으로 라우팅됩니다.
* `/new`와 `/reset`은 같은 바인드된 ACP 세션을 그 자리에서 재설정합니다.
* `/acp close`는 세션을 종료하고 현재 대화 바인딩을 제거합니다.

실제로 의미하는 것:

* `--bind here`는 동일한 채팅 표면을 유지합니다. Discord에서는 현재 채널이 그대로 현재 채널로 유지됩니다.
* `--bind here`는 새 작업을 스폰하는 경우에도 여전히 새 ACP 세션을 생성할 수 있습니다. 바인드는 해당 세션을 현재 대화에 연결합니다.
* `--bind here`는 그 자체로 자식 Discord 스레드 또는 Telegram 토픽을 생성하지 않습니다.
* ACP 런타임은 여전히 자체 작업 디렉터리(`cwd`) 또는 백엔드가 관리하는 디스크상의 워크스페이스를 가질 수 있습니다. 그 런타임 워크스페이스는 채팅 표면과 분리되어 있으며, 새로운 메시징 스레드를 의미하지 않습니다.
* 다른 ACP 에이전트로 스폰하고 `--cwd`를 전달하지 않으면, OpenClaw는 요청자의 워크스페이스가 아니라 기본적으로 **대상 에이전트의** 워크스페이스를 상속합니다.
* 상속된 워크스페이스 경로가 없으면(`ENOENT`/`ENOTDIR`), OpenClaw는 잘못된 트리를 조용히 재사용하는 대신 백엔드 기본 cwd로 폴백합니다.
* 상속된 워크스페이스가 존재하지만 액세스할 수 없는 경우(예: `EACCES`), 스폰은 `cwd`를 떨구는 대신 실제 액세스 오류를 반환합니다.

멘탈 모델:

* 채팅 표면: 사람들이 계속 대화하는 곳(`Discord channel`, `Telegram topic`, `iMessage chat`)
* ACP 세션: OpenClaw가 라우팅하는 지속적인 Codex/Claude/Gemini 런타임 상태
* 자식 스레드/토픽: `--thread ...`로만 생성되는 선택적 추가 메시징 표면
* 런타임 워크스페이스: 하네스가 실행되는 파일시스템 위치(`cwd`, 리포지토리 체크아웃, 백엔드 워크스페이스)

예시:

* `/acp spawn codex --bind here`: 이 채팅을 유지하고, Codex ACP 세션을 스폰하거나 연결하며, 여기의 후속 메시지를 해당 세션으로 라우팅
* `/acp spawn codex --thread auto`: OpenClaw가 자식 스레드/토픽을 생성하여 ACP 세션을 거기에 바인드할 수 있음
* `/acp spawn codex --bind here --cwd /workspace/repo`: 위와 동일한 채팅 바인딩이지만 Codex가 `/workspace/repo`에서 실행

현재 대화 바인딩 지원:

* 현재 대화 바인딩 지원을 광고하는 채팅/메시지 채널은 공유 대화 바인딩 경로를 통해 `--bind here`를 사용할 수 있습니다.
* 커스텀 스레드/토픽 시맨틱을 가진 채널은 여전히 동일한 공유 인터페이스 뒤에서 채널별 정규화 동작을 제공할 수 있습니다.
* `--bind here`는 항상 "현재 대화를 그 자리에서 바인드"를 의미합니다.
* 일반적인 현재 대화 바인드는 공유 OpenClaw 바인딩 저장소를 사용하며 정상적인 게이트웨이 재시작에도 살아남습니다.

참고:

* `--bind here`와 `--thread ...`는 `/acp spawn`에서 상호 배타적입니다.
* Discord에서 `--bind here`는 현재 채널 또는 스레드를 그 자리에서 바인드합니다. `spawnAcpSessions`는 OpenClaw가 `--thread auto|here`를 위해 자식 스레드를 생성해야 할 때만 필요합니다.
* 활성 채널이 현재 대화 ACP 바인딩을 노출하지 않으면, OpenClaw는 명확한 미지원 메시지를 반환합니다.
* `resume` 및 "새 세션" 질문은 ACP 세션 질문이지 채널 질문이 아닙니다. 현재 채팅 표면을 변경하지 않고 런타임 상태를 재사용하거나 교체할 수 있습니다.

### 스레드 바운드 세션

채널 어댑터에 대해 스레드 바인딩이 활성화되면, ACP 세션을 스레드에 바인드할 수 있습니다.

* OpenClaw가 스레드를 대상 ACP 세션에 바인드합니다.
* 해당 스레드의 후속 메시지는 바인드된 ACP 세션으로 라우팅됩니다.
* ACP 출력은 같은 스레드로 다시 전달됩니다.
* 언포커스/종료/아카이브/유휴 타임아웃 또는 최대 수명 만료 시 바인딩이 제거됩니다.

스레드 바인딩 지원은 어댑터별로 다릅니다. 활성 채널 어댑터가 스레드 바인딩을 지원하지 않으면, OpenClaw는 명확한 미지원/사용 불가 메시지를 반환합니다.

스레드 바운드 ACP에 필요한 기능 플래그:

* `acp.enabled=true`
* `acp.dispatch.enabled`는 기본적으로 켜져 있음(`false`로 설정하여 ACP 디스패치 일시 중지)
* 채널 어댑터 ACP 스레드 스폰 플래그 활성화(어댑터별)
  * Discord: `channels.discord.threadBindings.spawnAcpSessions=true`
  * Telegram: `channels.telegram.threadBindings.spawnAcpSessions=true`

### 스레드 지원 채널

* 세션/스레드 바인딩 기능을 노출하는 모든 채널 어댑터.
* 현재 내장 지원:
  * Discord 스레드/채널
  * Telegram 토픽(그룹/슈퍼그룹의 포럼 토픽 및 DM 토픽)
* 플러그인 채널은 동일한 바인딩 인터페이스를 통해 지원을 추가할 수 있습니다.

## Channel-specific settings

비일시적 워크플로우의 경우, 최상위 `bindings[]` 항목에 지속적인 ACP 바인딩을 구성하세요.

### 바인딩 모델

* `bindings[].type="acp"`는 지속적인 ACP 대화 바인딩을 표시합니다.
* `bindings[].match`는 대상 대화를 식별합니다:
  * Discord 채널 또는 스레드: `match.channel="discord"` + `match.peer.id="<channelOrThreadId>"`
  * Telegram 포럼 토픽: `match.channel="telegram"` + `match.peer.id="<chatId>:topic:<topicId>"`
  * BlueBubbles DM/그룹 채팅: `match.channel="bluebubbles"` + `match.peer.id="<handle|chat_id:*|chat_guid:*|chat_identifier:*>"`
    안정적인 그룹 바인딩에는 `chat_id:*` 또는 `chat_identifier:*`를 선호하세요.
  * iMessage DM/그룹 채팅: `match.channel="imessage"` + `match.peer.id="<handle|chat_id:*|chat_guid:*|chat_identifier:*>"`
    안정적인 그룹 바인딩에는 `chat_id:*`를 선호하세요.
* `bindings[].agentId`는 소유 OpenClaw 에이전트 ID입니다.
* 선택적 ACP 오버라이드는 `bindings[].acp` 아래에 위치합니다:
  * `mode` (`persistent` 또는 `oneshot`)
  * `label`
  * `cwd`
  * `backend`

### 에이전트별 런타임 기본값

에이전트당 한 번 ACP 기본값을 정의하려면 `agents.list[].runtime`을 사용하세요:

* `agents.list[].runtime.type="acp"`
* `agents.list[].runtime.acp.agent` (하네스 ID, 예: `codex` 또는 `claude`)
* `agents.list[].runtime.acp.backend`
* `agents.list[].runtime.acp.mode`
* `agents.list[].runtime.acp.cwd`

ACP 바운드 세션에 대한 오버라이드 우선순위:

1. `bindings[].acp.*`
2. `agents.list[].runtime.acp.*`
3. 전역 ACP 기본값(예: `acp.backend`)

예시:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
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

* OpenClaw는 사용 전에 구성된 ACP 세션이 존재하는지 보장합니다.
* 해당 채널 또는 토픽의 메시지는 구성된 ACP 세션으로 라우팅됩니다.
* 바운드 대화에서 `/new`와 `/reset`은 같은 ACP 세션 키를 그 자리에서 재설정합니다.
* 임시 런타임 바인딩(예: 스레드 포커스 플로우로 생성된 것)은 존재하는 곳에서 여전히 적용됩니다.
* 명시적 `cwd` 없이 교차 에이전트 ACP 스폰의 경우, OpenClaw는 에이전트 구성에서 대상 에이전트 워크스페이스를 상속합니다.
* 누락된 상속 워크스페이스 경로는 백엔드 기본 cwd로 폴백하며, 누락이 아닌 액세스 실패는 스폰 오류로 표면화됩니다.

## ACP 세션 시작(인터페이스)

### `sessions_spawn`에서

에이전트 턴 또는 도구 호출에서 ACP 세션을 시작하려면 `runtime: "acp"`를 사용하세요.

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "task": "Open the repo and summarize failing tests",
  "runtime": "acp",
  "agentId": "codex",
  "thread": true,
  "mode": "session"
}
```

참고:

* `runtime`은 기본적으로 `subagent`이므로, ACP 세션의 경우 `runtime: "acp"`를 명시적으로 설정하세요.
* `agentId`가 생략된 경우, 구성되어 있으면 OpenClaw는 `acp.defaultAgent`를 사용합니다.
* `mode: "session"`은 지속적인 바운드 대화를 유지하기 위해 `thread: true`가 필요합니다.

인터페이스 세부사항:

* `task` (필수): ACP 세션으로 전송되는 초기 프롬프트.
* `runtime` (ACP에 필수): `"acp"`여야 합니다.
* `agentId` (선택): ACP 대상 하네스 ID. 설정된 경우 `acp.defaultAgent`로 폴백.
* `thread` (선택, 기본 `false`): 지원되는 곳에서 스레드 바인딩 플로우 요청.
* `mode` (선택): `run` (일회성) 또는 `session` (지속).
  * 기본값은 `run`
  * `thread: true`이고 mode가 생략되면, OpenClaw는 런타임 경로에 따라 지속 동작으로 기본 설정할 수 있음
  * `mode: "session"`은 `thread: true`가 필요함
* `cwd` (선택): 요청된 런타임 작업 디렉터리(백엔드/런타임 정책에 의해 검증됨). 생략되면, 구성되어 있을 때 ACP 스폰은 대상 에이전트 워크스페이스를 상속하며, 누락된 상속 경로는 백엔드 기본값으로 폴백하고 실제 액세스 오류는 반환됩니다.
* `label` (선택): 세션/배너 텍스트에 사용되는 오퍼레이터용 레이블.
* `resumeSessionId` (선택): 새 세션을 생성하는 대신 기존 ACP 세션을 재개. 에이전트는 `session/load`를 통해 대화 기록을 재생합니다. `runtime: "acp"`가 필요합니다.
* `streamTo` (선택): `"parent"`는 초기 ACP 실행 진행 요약을 시스템 이벤트로 요청자 세션에 다시 스트리밍합니다.
  * 사용 가능한 경우, 수락된 응답에는 전체 릴레이 기록을 tail할 수 있는 세션 범위 JSONL 로그(`<sessionId>.acp-stream.jsonl`)를 가리키는 `streamLogPath`가 포함됩니다.

### 기존 세션 재개

새로 시작하는 대신 이전 ACP 세션을 계속하려면 `resumeSessionId`를 사용하세요. 에이전트는 `session/load`를 통해 대화 기록을 재생하므로, 이전의 전체 컨텍스트를 가지고 이어서 시작합니다.

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "task": "Continue where we left off — fix the remaining test failures",
  "runtime": "acp",
  "agentId": "codex",
  "resumeSessionId": "<previous-session-id>"
}
```

일반적인 사용 사례:

* 노트북에서 전화기로 Codex 세션 넘기기 — 에이전트에게 중단한 곳에서 이어가라고 지시
* CLI에서 대화식으로 시작한 코딩 세션을 이제 에이전트를 통해 헤드리스로 계속
* 게이트웨이 재시작이나 유휴 타임아웃으로 중단된 작업 이어가기

참고:

* `resumeSessionId`는 `runtime: "acp"`가 필요 — 서브에이전트 런타임과 함께 사용하면 오류를 반환합니다.
* `resumeSessionId`는 업스트림 ACP 대화 기록을 복원합니다; `thread`와 `mode`는 여전히 생성 중인 새 OpenClaw 세션에 정상적으로 적용되므로, `mode: "session"`은 여전히 `thread: true`가 필요합니다.
* 대상 에이전트는 `session/load`를 지원해야 합니다(Codex와 Claude Code가 지원).
* 세션 ID를 찾을 수 없으면, 새 세션으로의 조용한 폴백 없이 명확한 오류로 스폰이 실패합니다.

### 오퍼레이터 스모크 테스트

단위 테스트 통과만이 아니라 ACP 스폰이 실제로 엔드투엔드로 동작하는지 빠르게 라이브 확인하고 싶을 때 게이트웨이 배포 후 이것을 사용하세요.

권장 게이트:

1. 대상 호스트에서 배포된 게이트웨이 버전/커밋을 확인합니다.
2. 배포된 소스에 `src/gateway/sessions-patch.ts`의 ACP 계보 수락(`subagent:* or acp:* sessions`)이 포함되어 있는지 확인합니다.
3. 라이브 에이전트(예: `jpclawhq`의 `razor(main)`)에 대한 임시 ACPX 브리지 세션을 엽니다.
4. 해당 에이전트에게 다음으로 `sessions_spawn`을 호출하도록 요청합니다:
   * `runtime: "acp"`
   * `agentId: "codex"`
   * `mode: "run"`
   * task: `Reply with exactly LIVE-ACP-SPAWN-OK`
5. 에이전트가 다음을 보고하는지 확인합니다:
   * `accepted=yes`
   * 실제 `childSessionKey`
   * 검증자 오류 없음
6. 임시 ACPX 브리지 세션을 정리합니다.

라이브 에이전트에 대한 예시 프롬프트:

```text  theme={"theme":{"light":"min-light","dark":"min-dark"}}
Use the sessions_spawn tool now with runtime: "acp", agentId: "codex", and mode: "run".
Set the task to: "Reply with exactly LIVE-ACP-SPAWN-OK".
Then report only: accepted=<yes/no>; childSessionKey=<value or none>; error=<exact text or none>.
```

참고:

* 스레드 바운드 지속 ACP 세션을 의도적으로 테스트하는 경우가 아니라면 이 스모크 테스트를 `mode: "run"`으로 유지하세요.
* 기본 게이트에 `streamTo: "parent"`를 요구하지 마세요. 해당 경로는 요청자/세션 능력에 의존하며 별도의 통합 확인입니다.
* 스레드 바운드 `mode: "session"` 테스트는 실제 Discord 스레드 또는 Telegram 토픽에서 수행하는 두 번째, 더 풍부한 통합 패스로 취급하세요.

## 샌드박스 호환성

ACP 세션은 현재 OpenClaw 샌드박스 내부가 아닌 호스트 런타임에서 실행됩니다.

현재 제한사항:

* 요청자 세션이 샌드박스화된 경우, `sessions_spawn({ runtime: "acp" })`와 `/acp spawn` 모두에 대해 ACP 스폰이 차단됩니다.
  * 오류: `Sandboxed sessions cannot spawn ACP sessions because runtime="acp" runs on the host. Use runtime="subagent" from sandboxed sessions.`
* `runtime: "acp"`가 있는 `sessions_spawn`은 `sandbox: "require"`를 지원하지 않습니다.
  * 오류: `sessions_spawn sandbox="require" is unsupported for runtime="acp" because ACP sessions run outside the sandbox. Use runtime="subagent" or sandbox="inherit".`

샌드박스 강제 실행이 필요할 때는 `runtime: "subagent"`를 사용하세요.

### `/acp` 명령에서

필요할 때 채팅에서 명시적 오퍼레이터 제어를 위해 `/acp spawn`을 사용하세요.

```text  theme={"theme":{"light":"min-light","dark":"min-dark"}}
/acp spawn codex --mode persistent --thread auto
/acp spawn codex --mode oneshot --thread off
/acp spawn codex --bind here
/acp spawn codex --thread here
```

주요 플래그:

* `--mode persistent|oneshot`
* `--bind here|off`
* `--thread auto|here|off`
* `--cwd <absolute-path>`
* `--label <name>`

[슬래시 명령어](/tools/slash-commands)를 참조하세요.

## 세션 대상 해석

대부분의 `/acp` 작업은 선택적 세션 대상(`session-key`, `session-id`, 또는 `session-label`)을 허용합니다.

해석 순서:

1. 명시적 대상 인수(또는 `/acp steer`의 `--session`)
   * 키 시도
   * 그다음 UUID 형태의 세션 ID
   * 그다음 레이블
2. 현재 스레드 바인딩(이 대화/스레드가 ACP 세션에 바인드된 경우)
3. 현재 요청자 세션 폴백

현재 대화 바인딩과 스레드 바인딩 모두 2단계에 참여합니다.

대상이 해석되지 않으면, OpenClaw는 명확한 오류(`Unable to resolve session target: ...`)를 반환합니다.

## 스폰 바인드 모드

`/acp spawn`은 `--bind here|off`를 지원합니다.

| 모드   | 동작                                                                  |
| ------ | --------------------------------------------------------------------- |
| `here` | 현재 활성 대화를 그 자리에서 바인드; 활성 대화가 없으면 실패.         |
| `off`  | 현재 대화 바인딩을 생성하지 않음.                                     |

참고:

* `--bind here`는 "이 채널 또는 채팅을 Codex 기반으로 만들기"에 대한 가장 간단한 오퍼레이터 경로입니다.
* `--bind here`는 자식 스레드를 생성하지 않습니다.
* `--bind here`는 현재 대화 바인딩 지원을 노출하는 채널에서만 사용할 수 있습니다.
* `--bind`와 `--thread`는 동일한 `/acp spawn` 호출에서 결합할 수 없습니다.

## 스폰 스레드 모드

`/acp spawn`은 `--thread auto|here|off`를 지원합니다.

| 모드   | 동작                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| `auto` | 활성 스레드 내: 그 스레드를 바인드. 스레드 외부: 지원되는 경우 자식 스레드를 생성/바인드.                  |
| `here` | 현재 활성 스레드 필요; 스레드 내에 없으면 실패.                                                            |
| `off`  | 바인딩 없음. 세션이 바운드되지 않은 상태로 시작.                                                           |

참고:

* 비-스레드 바인딩 표면에서는 기본 동작이 사실상 `off`입니다.
* 스레드 바운드 스폰에는 채널 정책 지원이 필요합니다:
  * Discord: `channels.discord.threadBindings.spawnAcpSessions=true`
  * Telegram: `channels.telegram.threadBindings.spawnAcpSessions=true`
* 자식 스레드를 생성하지 않고 현재 대화를 고정하려면 `--bind here`를 사용하세요.

## ACP 제어

사용 가능한 명령 패밀리:

* `/acp spawn`
* `/acp cancel`
* `/acp steer`
* `/acp close`
* `/acp status`
* `/acp set-mode`
* `/acp set`
* `/acp cwd`
* `/acp permissions`
* `/acp timeout`
* `/acp model`
* `/acp reset-options`
* `/acp sessions`
* `/acp doctor`
* `/acp install`

`/acp status`는 유효한 런타임 옵션을 표시하고, 사용 가능한 경우 런타임 수준 및 백엔드 수준 세션 식별자 모두를 표시합니다.

일부 제어는 백엔드 능력에 따라 다릅니다. 백엔드가 제어를 지원하지 않으면, OpenClaw는 명확한 미지원 제어 오류를 반환합니다.

## ACP 명령 쿡북

| 명령                 | 역할                                                         | 예시                                                          |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `/acp spawn`         | ACP 세션 생성; 선택적 현재 바인드 또는 스레드 바인드.        | `/acp spawn codex --bind here --cwd /repo`                    |
| `/acp cancel`        | 대상 세션의 진행 중인 턴 취소.                               | `/acp cancel agent:codex:acp:<uuid>`                          |
| `/acp steer`         | 실행 중인 세션에 방향 조정 지시 전송.                        | `/acp steer --session support inbox prioritize failing tests` |
| `/acp close`         | 세션 종료 및 스레드 대상 바인딩 해제.                        | `/acp close`                                                  |
| `/acp status`        | 백엔드, 모드, 상태, 런타임 옵션, 능력 표시.                  | `/acp status`                                                 |
| `/acp set-mode`      | 대상 세션의 런타임 모드 설정.                                | `/acp set-mode plan`                                          |
| `/acp set`           | 일반 런타임 구성 옵션 쓰기.                                  | `/acp set model openai/gpt-5.4`                               |
| `/acp cwd`           | 런타임 작업 디렉터리 오버라이드 설정.                        | `/acp cwd /Users/user/Projects/repo`                          |
| `/acp permissions`   | 승인 정책 프로필 설정.                                       | `/acp permissions strict`                                     |
| `/acp timeout`       | 런타임 타임아웃(초) 설정.                                    | `/acp timeout 120`                                            |
| `/acp model`         | 런타임 모델 오버라이드 설정.                                 | `/acp model anthropic/claude-opus-4-6`                        |
| `/acp reset-options` | 세션 런타임 옵션 오버라이드 제거.                            | `/acp reset-options`                                          |
| `/acp sessions`      | 저장소의 최근 ACP 세션 나열.                                 | `/acp sessions`                                               |
| `/acp doctor`        | 백엔드 상태, 능력, 실행 가능한 수정.                         | `/acp doctor`                                                 |
| `/acp install`       | 결정론적 설치 및 활성화 단계 출력.                           | `/acp install`                                                |

`/acp sessions`는 현재 바운드 또는 요청자 세션에 대한 저장소를 읽습니다. `session-key`, `session-id`, 또는 `session-label` 토큰을 수락하는 명령은 커스텀 에이전트별 `session.store` 루트를 포함하여 게이트웨이 세션 검색을 통해 대상을 해석합니다.

## 런타임 옵션 매핑

`/acp`에는 편의 명령과 일반 세터가 있습니다.

동등한 작업:

* `/acp model <id>`는 런타임 구성 키 `model`에 매핑됩니다.
* `/acp permissions <profile>`는 런타임 구성 키 `approval_policy`에 매핑됩니다.
* `/acp timeout <seconds>`는 런타임 구성 키 `timeout`에 매핑됩니다.
* `/acp cwd <path>`는 런타임 cwd 오버라이드를 직접 업데이트합니다.
* `/acp set <key> <value>`는 일반 경로입니다.
  * 특수 케이스: `key=cwd`는 cwd 오버라이드 경로를 사용합니다.
* `/acp reset-options`는 대상 세션의 모든 런타임 오버라이드를 지웁니다.

## acpx 하네스 지원(현재)

현재 acpx 내장 하네스 별칭:

* `claude`
* `codex`
* `copilot`
* `cursor` (Cursor CLI: `cursor-agent acp`)
* `droid`
* `gemini`
* `iflow`
* `kilocode`
* `kimi`
* `kiro`
* `openclaw`
* `opencode`
* `pi`
* `qwen`

OpenClaw가 acpx 백엔드를 사용할 때, acpx 구성에서 커스텀 에이전트 별칭을 정의하지 않는 한 `agentId`에 이 값들을 선호하세요.
로컬 Cursor 설치가 여전히 `agent acp`로 ACP를 노출한다면, 내장 기본값을 변경하는 대신 acpx 구성에서 `cursor` 에이전트 명령을 오버라이드하세요.

직접 acpx CLI 사용은 `--agent <command>`를 통해 임의의 어댑터도 대상으로 지정할 수 있지만, 그 원시 탈출구는 acpx CLI 기능입니다(일반 OpenClaw `agentId` 경로가 아님).

## 필수 구성

핵심 ACP 베이스라인:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  acp: {
    enabled: true,
    // Optional. Default is true; set false to pause ACP dispatch while keeping /acp controls.
    dispatch: { enabled: true },
    backend: "acpx",
    defaultAgent: "codex",
    allowedAgents: [
      "claude",
      "codex",
      "copilot",
      "cursor",
      "droid",
      "gemini",
      "iflow",
      "kilocode",
      "kimi",
      "kiro",
      "openclaw",
      "opencode",
      "pi",
      "qwen",
    ],
    maxConcurrentSessions: 8,
    stream: {
      coalesceIdleMs: 300,
      maxChunkChars: 1200,
    },
    runtime: {
      ttlMinutes: 120,
    },
  },
}
```

스레드 바인딩 구성은 채널 어댑터별입니다. Discord 예시:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  session: {
    threadBindings: {
      enabled: true,
      idleHours: 24,
      maxAgeHours: 0,
    },
  },
  channels: {
    discord: {
      threadBindings: {
        enabled: true,
        spawnAcpSessions: true,
      },
    },
  },
}
```

스레드 바운드 ACP 스폰이 작동하지 않으면, 먼저 어댑터 기능 플래그를 확인하세요:

* Discord: `channels.discord.threadBindings.spawnAcpSessions=true`

현재 대화 바인드는 자식 스레드 생성이 필요하지 않습니다. 활성 대화 컨텍스트와 ACP 대화 바인딩을 노출하는 채널 어댑터가 필요합니다.

[구성 레퍼런스](/gateway/configuration-reference)를 참조하세요.

## acpx 백엔드용 플러그인 설정

새로 설치된 버전은 번들된 `acpx` 런타임 플러그인이 기본적으로 활성화되어 제공되므로, ACP는 보통 수동 플러그인 설치 단계 없이 작동합니다.

다음으로 시작하세요:

```text  theme={"theme":{"light":"min-light","dark":"min-dark"}}
/acp doctor
```

`acpx`를 비활성화했거나, `plugins.allow` / `plugins.deny`를 통해 거부했거나, 로컬 개발 체크아웃으로 전환하고 싶다면 명시적 플러그인 경로를 사용하세요:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw plugins install acpx
openclaw config set plugins.entries.acpx.enabled true
```

개발 중 로컬 워크스페이스 설치:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw plugins install ./path/to/local/acpx-plugin
```

그런 다음 백엔드 상태를 확인하세요:

```text  theme={"theme":{"light":"min-light","dark":"min-dark"}}
/acp doctor
```

### acpx 명령 및 버전 구성

기본적으로 번들된 acpx 백엔드 플러그인(`acpx`)은 플러그인 로컬에 고정된 바이너리를 사용합니다:

1. 명령은 ACPX 플러그인 패키지 내부의 플러그인 로컬 `node_modules/.bin/acpx`로 기본 설정됩니다.
2. 예상 버전은 확장 핀으로 기본 설정됩니다.
3. 시작 시 ACP 백엔드를 즉시 not-ready로 등록합니다.
4. 백그라운드 ensure 작업이 `acpx --version`을 검증합니다.
5. 플러그인 로컬 바이너리가 없거나 불일치하는 경우 다음을 실행합니다:
   `npm install --omit=dev --no-save acpx@<pinned>` 후 다시 검증합니다.

플러그인 구성에서 명령/버전을 오버라이드할 수 있습니다:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "plugins": {
    "entries": {
      "acpx": {
        "enabled": true,
        "config": {
          "command": "../acpx/dist/cli.js",
          "expectedVersion": "any"
        }
      }
    }
  }
}
```

참고:

* `command`는 절대 경로, 상대 경로, 또는 명령 이름(`acpx`)을 허용합니다.
* 상대 경로는 OpenClaw 워크스페이스 디렉터리에서 해석됩니다.
* `expectedVersion: "any"`는 엄격한 버전 매칭을 비활성화합니다.
* `command`가 커스텀 바이너리/경로를 가리키면, 플러그인 로컬 자동 설치가 비활성화됩니다.
* 백엔드 상태 확인이 실행되는 동안 OpenClaw 시작은 논블로킹 상태를 유지합니다.

[플러그인](/tools/plugin)을 참조하세요.

### 자동 의존성 설치

`npm install -g openclaw`로 OpenClaw를 전역 설치하면, acpx 런타임 의존성(플랫폼별 바이너리)이 postinstall 훅을 통해 자동으로 설치됩니다. 자동 설치가 실패하더라도 게이트웨이는 정상적으로 시작되며 `openclaw acp doctor`를 통해 누락된 의존성을 보고합니다.

## Plugin tools (MCP bridge)

기본적으로, ACPX 세션은 OpenClaw 플러그인에 등록된 도구를 ACP 하네스에 노출하지 **않습니다**.

Codex 또는 Claude Code와 같은 ACP 에이전트가 메모리 recall/store 같은 설치된 OpenClaw 플러그인 도구를 호출하도록 하려면, 전용 브리지를 활성화하세요:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw config set plugins.entries.acpx.config.pluginToolsMcpBridge true
```

이것이 하는 일:

* `openclaw-plugin-tools`라는 내장 MCP 서버를 ACPX 세션 부트스트랩에 주입합니다.
* 설치되고 활성화된 OpenClaw 플러그인에 의해 이미 등록된 플러그인 도구를 노출합니다.
* 기능을 명시적이고 기본적으로 꺼져 있는 상태로 유지합니다.

보안 및 신뢰 참고사항:

* 이것은 ACP 하네스 도구 표면을 확장합니다.
* ACP 에이전트는 게이트웨이에서 이미 활성화된 플러그인 도구에만 접근할 수 있습니다.
* 이것을 OpenClaw 자체에서 해당 플러그인들이 실행되도록 허용하는 것과 동일한 신뢰 경계로 취급하세요.
* 활성화하기 전에 설치된 플러그인을 검토하세요.

커스텀 `mcpServers`는 여전히 이전과 같이 작동합니다. 내장 플러그인 도구 브리지는 일반 MCP 서버 구성의 대체가 아닌 추가적인 옵트인 편의입니다.

### 런타임 타임아웃 구성

번들된 `acpx` 플러그인은 임베디드 런타임 턴에 대해 기본 120초 타임아웃을 사용합니다. 이것은 Gemini CLI와 같은 느린 하네스가 ACP 시작 및 초기화를 완료할 수 있는 충분한 시간을 제공합니다. 호스트에 다른 런타임 제한이 필요하다면 오버라이드하세요:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw config set plugins.entries.acpx.config.timeoutSeconds 180
```

이 값을 변경한 후 게이트웨이를 재시작하세요.

## 권한 구성

ACP 세션은 비대화식으로 실행되므로 — 파일 쓰기 및 셸 실행 권한 프롬프트를 승인하거나 거부할 TTY가 없습니다. acpx 플러그인은 권한이 처리되는 방식을 제어하는 두 개의 구성 키를 제공합니다:

이러한 ACPX 하네스 권한은 OpenClaw exec 승인과 별개이며 Claude CLI `--permission-mode bypassPermissions`와 같은 CLI 백엔드 벤더 우회 플래그와도 별개입니다. ACPX `approve-all`은 ACP 세션을 위한 하네스 수준의 비상 스위치입니다.

### `permissionMode`

하네스 에이전트가 프롬프트 없이 수행할 수 있는 작업을 제어합니다.

| 값              | 동작                                                       |
| --------------- | ---------------------------------------------------------- |
| `approve-all`   | 모든 파일 쓰기 및 셸 명령을 자동 승인.                     |
| `approve-reads` | 읽기만 자동 승인; 쓰기 및 exec는 프롬프트 필요.            |
| `deny-all`      | 모든 권한 프롬프트 거부.                                   |

### `nonInteractivePermissions`

권한 프롬프트가 표시되어야 하지만 대화식 TTY를 사용할 수 없을 때(ACP 세션에서는 항상 해당) 발생하는 일을 제어합니다.

| 값     | 동작                                                                |
| ------ | ------------------------------------------------------------------- |
| `fail` | `AcpRuntimeError`로 세션 중단. **(기본값)**                         |
| `deny` | 권한을 조용히 거부하고 계속 진행(우아한 저하).                      |

### 구성

플러그인 구성을 통해 설정:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw config set plugins.entries.acpx.config.permissionMode approve-all
openclaw config set plugins.entries.acpx.config.nonInteractivePermissions fail
```

이 값들을 변경한 후 게이트웨이를 재시작하세요.

> **중요:** OpenClaw는 현재 `permissionMode=approve-reads` 및 `nonInteractivePermissions=fail`로 기본 설정됩니다. 비대화식 ACP 세션에서는, 권한 프롬프트를 트리거하는 쓰기 또는 exec가 `AcpRuntimeError: Permission prompt unavailable in non-interactive mode`로 실패할 수 있습니다.
>
> 권한을 제한해야 한다면, 세션이 크래시되는 대신 우아하게 저하되도록 `nonInteractivePermissions`를 `deny`로 설정하세요.

## 문제 해결

| 증상                                                                        | 가능한 원인                                                                      | 수정                                                                                                                                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACP runtime backend is not configured`                                     | 백엔드 플러그인 누락 또는 비활성화.                                              | 백엔드 플러그인을 설치 및 활성화한 후 `/acp doctor` 실행.                                                                                                          |
| `ACP is disabled by policy (acp.enabled=false)`                             | ACP가 전역으로 비활성화됨.                                                       | `acp.enabled=true`로 설정.                                                                                                                                         |
| `ACP dispatch is disabled by policy (acp.dispatch.enabled=false)`           | 정상 스레드 메시지로부터의 디스패치가 비활성화됨.                                 | `acp.dispatch.enabled=true`로 설정.                                                                                                                                |
| `ACP agent "<id>" is not allowed by policy`                                 | 에이전트가 허용 목록에 없음.                                                     | 허용된 `agentId`를 사용하거나 `acp.allowedAgents`를 업데이트.                                                                                                      |
| `Unable to resolve session target: ...`                                     | 잘못된 키/ID/레이블 토큰.                                                        | `/acp sessions` 실행, 정확한 키/레이블 복사, 재시도.                                                                                                               |
| `--bind here requires running /acp spawn inside an active ... conversation` | 활성 바인드 가능한 대화 없이 `--bind here` 사용.                                  | 대상 채팅/채널로 이동 후 재시도하거나, 언바운드 스폰 사용.                                                                                                          |
| `Conversation bindings are unavailable for <channel>.`                      | 어댑터에 현재 대화 ACP 바인딩 기능이 없음.                                        | 지원되는 곳에서 `/acp spawn ... --thread ...`를 사용하거나, 최상위 `bindings[]`를 구성하거나, 지원되는 채널로 이동.                                                |
| `--thread here requires running /acp spawn inside an active ... thread`     | 스레드 컨텍스트 외부에서 `--thread here` 사용.                                   | 대상 스레드로 이동하거나 `--thread auto`/`off` 사용.                                                                                                               |
| `Only <user-id> can rebind this channel/conversation/thread.`               | 다른 사용자가 활성 바인딩 대상을 소유.                                            | 소유자로 다시 바인드하거나 다른 대화 또는 스레드 사용.                                                                                                             |
| `Thread bindings are unavailable for <channel>.`                            | 어댑터에 스레드 바인딩 기능이 없음.                                               | `--thread off`를 사용하거나 지원되는 어댑터/채널로 이동.                                                                                                           |
| `Sandboxed sessions cannot spawn ACP sessions ...`                          | ACP 런타임은 호스트 측이며; 요청자 세션이 샌드박스화됨.                           | 샌드박스화된 세션에서 `runtime="subagent"`를 사용하거나, 샌드박스화되지 않은 세션에서 ACP 스폰 실행.                                                               |
| `sessions_spawn sandbox="require" is unsupported for runtime="acp" ...`     | ACP 런타임에 대해 `sandbox="require"`가 요청됨.                                   | 필수 샌드박싱에는 `runtime="subagent"`를 사용하거나, 샌드박스화되지 않은 세션에서 `sandbox="inherit"`와 함께 ACP 사용.                                             |
| 바운드 세션의 ACP 메타데이터 누락                                           | 오래되었거나 삭제된 ACP 세션 메타데이터.                                          | `/acp spawn`으로 재생성한 후 스레드를 다시 바인드/포커스.                                                                                                          |
| `AcpRuntimeError: Permission prompt unavailable in non-interactive mode`    | `permissionMode`가 비대화식 ACP 세션에서 쓰기/exec를 차단.                        | `plugins.entries.acpx.config.permissionMode`를 `approve-all`로 설정하고 게이트웨이 재시작. [권한 구성](#permission-configuration)을 참조.                          |
| ACP 세션이 적은 출력과 함께 일찍 실패                                       | `permissionMode`/`nonInteractivePermissions`에 의해 권한 프롬프트가 차단됨.       | 게이트웨이 로그에서 `AcpRuntimeError` 확인. 전체 권한에는 `permissionMode=approve-all`을 설정하고; 우아한 저하에는 `nonInteractivePermissions=deny`를 설정.        |
| 작업 완료 후 ACP 세션이 무기한 중단                                          | 하네스 프로세스는 완료되었지만 ACP 세션이 완료를 보고하지 않음.                   | `ps aux \| grep acpx`로 모니터링; 오래된 프로세스를 수동으로 kill.                                                                                                 |
