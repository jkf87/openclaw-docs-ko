---
title: "agents"
description: "`openclaw agents`에 대한 CLI 참조 (목록/추가/삭제/바인딩/바인드/언바인드/ID 설정)"
---

# `openclaw agents`

격리된 에이전트 (워크스페이스 + 인증 + 라우팅) 관리.

관련:

- 다중 에이전트 라우팅: [다중 에이전트 라우팅](/concepts/multi-agent)
- 에이전트 워크스페이스: [에이전트 워크스페이스](/concepts/agent-workspace)
- 스킬 가시성 구성: [스킬 구성](/tools/skills-config)

## 예시

```bash
openclaw agents list
openclaw agents list --bindings
openclaw agents add work --workspace ~/.openclaw/workspace-work
openclaw agents add ops --workspace ~/.openclaw/workspace-ops --bind telegram:ops --non-interactive
openclaw agents bindings
openclaw agents bind --agent work --bind telegram:ops
openclaw agents unbind --agent work --bind telegram:ops
openclaw agents set-identity --workspace ~/.openclaw/workspace --from-identity
openclaw agents set-identity --agent main --avatar avatars/openclaw.png
openclaw agents delete work
```

## 라우팅 바인딩

라우팅 바인딩을 사용하여 인바운드 채널 트래픽을 특정 에이전트에 고정하세요.

에이전트별로 다른 가시적 스킬이 필요한 경우 `openclaw.json`에서 `agents.defaults.skills` 및 `agents.list[].skills`를 구성하세요. [스킬 구성](/tools/skills-config) 및 [구성 참조](/gateway/configuration-reference#agentsdefaultsskills)를 참조하세요.

바인딩 목록:

```bash
openclaw agents bindings
openclaw agents bindings --agent work
openclaw agents bindings --json
```

바인딩 추가:

```bash
openclaw agents bind --agent work --bind telegram:ops --bind discord:guild-a
```

`accountId`를 생략하면 (`--bind &lt;channel&gt;`), OpenClaw는 사용 가능한 경우 채널 기본값과 플러그인 설정 훅에서 이를 확인합니다.

`bind` 또는 `unbind`에서 `--agent`를 생략하면 OpenClaw는 현재 기본 에이전트를 대상으로 합니다.

### 바인딩 범위 동작

- `accountId` 없는 바인딩은 채널 기본 계정에만 일치합니다.
- `accountId: "*"`는 채널 전체 폴백 (모든 계정)이며 명시적 계정 바인딩보다 덜 구체적입니다.
- 동일한 에이전트가 이미 `accountId` 없는 일치하는 채널 바인딩을 가지고 있고 나중에 명시적이거나 확인된 `accountId`로 바인딩하면 OpenClaw는 중복을 추가하는 대신 해당 기존 바인딩을 제자리에서 업그레이드합니다.

예시:

```bash
# 초기 채널 전용 바인딩
openclaw agents bind --agent work --bind telegram

# 나중에 계정 범위 바인딩으로 업그레이드
openclaw agents bind --agent work --bind telegram:ops
```

업그레이드 후 해당 바인딩에 대한 라우팅은 `telegram:ops`로 범위가 지정됩니다. 기본 계정 라우팅도 원하는 경우 명시적으로 추가하세요 (예: `--bind telegram:default`).

바인딩 제거:

```bash
openclaw agents unbind --agent work --bind telegram:ops
openclaw agents unbind --agent work --all
```

`unbind`는 `--all` 또는 하나 이상의 `--bind` 값을 허용하며, 둘 다는 허용하지 않습니다.

## 명령 표면

### `agents`

하위 명령 없이 `openclaw agents`를 실행하는 것은 `openclaw agents list`와 동일합니다.

### `agents list`

옵션:

- `--json`
- `--bindings`: 에이전트별 카운트/요약이 아닌 전체 라우팅 규칙 포함

### `agents add [name]`

옵션:

- `--workspace &lt;dir&gt;`
- `--model &lt;id&gt;`
- `--agent-dir &lt;dir&gt;`
- `--bind &lt;channel[:accountId]&gt;` (반복 가능)
- `--non-interactive`
- `--json`

참고사항:

- 명시적 추가 플래그를 전달하면 명령이 비대화형 경로로 전환됩니다.
- 비대화형 모드에는 에이전트 이름과 `--workspace`가 모두 필요합니다.
- `main`은 예약되어 있으며 새 에이전트 id로 사용할 수 없습니다.

### `agents bindings`

옵션:

- `--agent &lt;id&gt;`
- `--json`

### `agents bind`

옵션:

- `--agent &lt;id&gt;` (현재 기본 에이전트로 기본 설정)
- `--bind &lt;channel[:accountId]&gt;` (반복 가능)
- `--json`

### `agents unbind`

옵션:

- `--agent &lt;id&gt;` (현재 기본 에이전트로 기본 설정)
- `--bind &lt;channel[:accountId]&gt;` (반복 가능)
- `--all`
- `--json`

### `agents delete &lt;id&gt;`

옵션:

- `--force`
- `--json`

참고사항:

- `main`은 삭제할 수 없습니다.
- `--force` 없이는 대화형 확인이 필요합니다.
- 워크스페이스, 에이전트 상태, 세션 기록 디렉터리는 영구 삭제 대신 휴지통으로 이동됩니다.

## ID 파일

각 에이전트 워크스페이스는 워크스페이스 루트에 `IDENTITY.md`를 포함할 수 있습니다:

- 예시 경로: `~/.openclaw/workspace/IDENTITY.md`
- `set-identity --from-identity`는 워크스페이스 루트 (또는 명시적 `--identity-file`)에서 읽습니다.

아바타 경로는 워크스페이스 루트를 기준으로 확인됩니다.

## ID 설정

`set-identity`는 `agents.list[].identity`에 필드를 씁니다:

- `name`
- `theme`
- `emoji`
- `avatar` (워크스페이스 상대 경로, http(s) URL, 또는 data URI)

옵션:

- `--agent &lt;id&gt;`
- `--workspace &lt;dir&gt;`
- `--identity-file &lt;path&gt;`
- `--from-identity`
- `--name &lt;name&gt;`
- `--theme &lt;theme&gt;`
- `--emoji &lt;emoji&gt;`
- `--avatar &lt;value&gt;`
- `--json`

참고사항:

- `--agent` 또는 `--workspace`를 사용하여 대상 에이전트를 선택할 수 있습니다.
- `--workspace`에 의존하고 여러 에이전트가 해당 워크스페이스를 공유하는 경우 명령이 실패하고 `--agent`를 전달하도록 요청합니다.
- 명시적 ID 필드가 제공되지 않으면 명령은 `IDENTITY.md`에서 ID 데이터를 읽습니다.

`IDENTITY.md`에서 로드:

```bash
openclaw agents set-identity --workspace ~/.openclaw/workspace --from-identity
```

명시적으로 필드 재정의:

```bash
openclaw agents set-identity --agent main --name "OpenClaw" --emoji "🦞" --avatar avatars/openclaw.png
```

구성 샘플:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "OpenClaw",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/openclaw.png",
        },
      },
    ],
  },
}
```
