---
summary: "ACP agents 설정: acpx harness 구성, 플러그인 setup, 권한(permissions)"
read_when:
  - Claude Code / Codex / Gemini CLI용 acpx harness를 설치하거나 구성할 때
  - plugin-tools 또는 OpenClaw-tools MCP 브리지를 활성화할 때
  - ACP 권한(permission) 모드를 구성할 때
title: "ACP agents — setup"
---

개요, 오퍼레이터 런북, 개념에 대해서는 [ACP agents](/tools/acp-agents)를 참조하세요.
이 페이지는 acpx harness 구성, MCP 브리지용 plugin setup, 권한(permission) 구성을 다룹니다.

## acpx harness 지원 (현재)

현재 acpx 내장 harness 별칭은 다음과 같습니다:

- `claude`
- `codex`
- `copilot`
- `cursor` (Cursor CLI: `cursor-agent acp`)
- `droid`
- `gemini`
- `iflow`
- `kilocode`
- `kimi`
- `kiro`
- `openclaw`
- `opencode`
- `pi`
- `qwen`

OpenClaw가 acpx 백엔드를 사용할 때는, acpx 구성에서 커스텀 agent 별칭을 정의하지 않은 한 `agentId`로 위의 값을 사용하는 것을 권장합니다.
로컬 Cursor 설치가 여전히 ACP를 `agent acp`로 노출한다면, 내장 기본값을 변경하는 대신 acpx 구성에서 `cursor` agent 명령을 재정의하세요.

직접 acpx CLI 사용 시에는 `--agent <command>`를 통해 임의의 어댑터를 지정할 수도 있지만, 이 원시 탈출구(raw escape hatch)는 acpx CLI 기능이며 일반적인 OpenClaw `agentId` 경로는 아닙니다.

## 필수 구성

ACP 핵심 기본 구성:

```json5
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

스레드 바인딩(thread binding) 구성은 채널 어댑터별로 다릅니다. Discord 예시:

```json5
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

스레드 바인딩 ACP 스폰이 동작하지 않는다면, 먼저 어댑터 기능 플래그를 확인하세요:

- Discord: `channels.discord.threadBindings.spawnAcpSessions=true`

현재-대화 바인딩은 자식 스레드 생성이 필요하지 않습니다. 활성 대화 컨텍스트와 ACP 대화 바인딩을 노출하는 채널 어댑터가 필요합니다.

[Configuration Reference](/gateway/configuration-reference)를 참조하세요.

## acpx 백엔드용 plugin setup

새로 설치하면 번들된 `acpx` 런타임 plugin이 기본적으로 활성화되어 있으므로,
일반적으로 수동 plugin 설치 단계 없이 ACP가 동작합니다.

다음으로 시작하세요:

```text
/acp doctor
```

`acpx`를 비활성화했거나, `plugins.allow` / `plugins.deny`를 통해 거부했거나,
로컬 개발 체크아웃으로 전환하고 싶다면 명시적 plugin 경로를 사용하세요:

```bash
openclaw plugins install acpx
openclaw config set plugins.entries.acpx.enabled true
```

개발 중 로컬 워크스페이스 설치:

```bash
openclaw plugins install ./path/to/local/acpx-plugin
```

그런 다음 백엔드 상태를 확인하세요:

```text
/acp doctor
```

### acpx 명령 및 버전 구성

기본적으로, 번들된 `acpx` plugin은 plugin 로컬의 고정된 바이너리(`node_modules/.bin/acpx`, plugin 패키지 내부)를 사용합니다. 시작 시 백엔드는 not-ready로 등록되고, 백그라운드 작업이 `acpx --version`을 검증합니다; 바이너리가 없거나 불일치하면 `npm install --omit=dev --no-save acpx@<pinned>`를 실행한 후 재검증합니다. 그 동안 게이트웨이는 논블로킹 상태를 유지합니다.

plugin 구성에서 명령 또는 버전을 재정의하세요:

```json
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

- `command`는 절대 경로, 상대 경로(OpenClaw 워크스페이스 기준으로 해결됨) 또는 명령 이름을 허용합니다.
- `expectedVersion: "any"`는 엄격한 버전 매칭을 비활성화합니다.
- 커스텀 `command` 경로는 plugin 로컬 자동 설치를 비활성화합니다.

[Plugins](/tools/plugin)를 참조하세요.

### 자동 의존성 설치

OpenClaw를 `npm install -g openclaw`로 전역 설치하면, acpx 런타임
의존성(플랫폼별 바이너리)이 postinstall 훅을 통해 자동으로 설치됩니다.
자동 설치가 실패해도 게이트웨이는 정상적으로 시작되며, 누락된 의존성은
`openclaw acp doctor`를 통해 보고됩니다.

### Plugin tools MCP 브리지

기본적으로, ACPX 세션은 OpenClaw plugin에 등록된 tools를 ACP harness에 노출하지 **않습니다**.

Codex 또는 Claude Code 같은 ACP agents가 설치된
OpenClaw plugin tools(예: memory recall/store)를 호출하게 하려면, 전용 브리지를 활성화하세요:

```bash
openclaw config set plugins.entries.acpx.config.pluginToolsMcpBridge true
```

이 기능의 동작:

- `openclaw-plugin-tools`라는 내장 MCP 서버를 ACPX 세션 bootstrap에
  주입합니다.
- 설치되고 활성화된 OpenClaw plugins에 이미 등록된 plugin tools를
  노출합니다.
- 이 기능을 명시적으로 유지하며 기본값은 off입니다.

보안 및 신뢰 관련 참고:

- 이는 ACP harness의 tool 노출 표면(surface)을 확장합니다.
- ACP agents는 게이트웨이에서 이미 활성화된 plugin tools에만 접근할 수 있습니다.
- 이를 해당 plugins가 OpenClaw 내부에서 실행되도록 허용하는 것과 동일한 신뢰 경계로
  간주하세요.
- 활성화하기 전에 설치된 plugins를 검토하세요.

커스텀 `mcpServers`는 여전히 이전과 동일하게 동작합니다. 내장 plugin-tools 브리지는
일반 MCP 서버 구성을 대체하는 것이 아니라 추가적인 옵트인 편의 기능입니다.

### OpenClaw tools MCP 브리지

기본적으로, ACPX 세션은 내장 OpenClaw tools도 MCP를 통해 노출하지
**않습니다**. ACP agent가 `cron` 같은 선택된 내장 tools가 필요할 때 별도의
core-tools 브리지를 활성화하세요:

```bash
openclaw config set plugins.entries.acpx.config.openClawToolsMcpBridge true
```

이 기능의 동작:

- `openclaw-tools`라는 내장 MCP 서버를 ACPX 세션 bootstrap에
  주입합니다.
- 선택된 내장 OpenClaw tools를 노출합니다. 초기 서버는 `cron`을 노출합니다.
- 코어 tool 노출을 명시적으로 유지하며 기본값은 off입니다.

### 런타임 타임아웃 구성

번들된 `acpx` plugin은 임베디드 런타임 턴의 타임아웃을 120초로
기본 설정합니다. 이는 Gemini CLI 같은 느린 harness가 ACP 시작 및
초기화를 완료할 수 있는 충분한 시간을 제공합니다. 호스트에 다른 런타임
제한이 필요하다면 재정의하세요:

```bash
openclaw config set plugins.entries.acpx.config.timeoutSeconds 180
```

이 값을 변경한 후에는 게이트웨이를 재시작하세요.

### 상태 프로브 agent 구성

번들된 `acpx` plugin은 임베디드 런타임 백엔드가 준비되었는지
판단하는 동안 하나의 harness agent를 프로브합니다. 기본값은 `codex`입니다.
배포가 다른 기본 ACP agent를 사용한다면, 프로브 agent를 같은 id로
설정하세요:

```bash
openclaw config set plugins.entries.acpx.config.probeAgent claude
```

이 값을 변경한 후에는 게이트웨이를 재시작하세요.

## 권한(Permission) 구성

ACP 세션은 비대화형(non-interactively)으로 실행됩니다 — 파일 쓰기 및 shell 실행 권한 프롬프트를 승인하거나 거부할 TTY가 없습니다. acpx plugin은 권한 처리 방식을 제어하는 두 가지 구성 키를 제공합니다:

이 ACPX harness 권한은 OpenClaw exec 승인과 별개이며, Claude CLI `--permission-mode bypassPermissions` 같은 CLI 백엔드 벤더 우회 플래그와도 별개입니다. ACPX `approve-all`은 ACP 세션을 위한 harness 수준의 비상 해제(break-glass) 스위치입니다.

### `permissionMode`

harness agent가 프롬프트 없이 수행할 수 있는 작업을 제어합니다.

| 값              | 동작                                                             |
| --------------- | ---------------------------------------------------------------- |
| `approve-all`   | 모든 파일 쓰기 및 shell 명령을 자동 승인합니다.                  |
| `approve-reads` | 읽기만 자동 승인합니다; 쓰기와 exec는 프롬프트가 필요합니다.     |
| `deny-all`      | 모든 권한 프롬프트를 거부합니다.                                 |

### `nonInteractivePermissions`

권한 프롬프트가 표시되어야 하지만 대화형 TTY를 사용할 수 없는 상황(ACP 세션의 경우 항상 그렇습니다)에서 어떻게 처리할지 제어합니다.

| 값     | 동작                                                                    |
| ------ | ----------------------------------------------------------------------- |
| `fail` | `AcpRuntimeError`와 함께 세션을 중단합니다. **(기본값)**                |
| `deny` | 권한을 조용히 거부하고 계속 진행합니다 (우아한 저하).                   |

### 구성

plugin 구성을 통해 설정하세요:

```bash
openclaw config set plugins.entries.acpx.config.permissionMode approve-all
openclaw config set plugins.entries.acpx.config.nonInteractivePermissions fail
```

이 값들을 변경한 후에는 게이트웨이를 재시작하세요.

> **중요:** OpenClaw는 현재 `permissionMode=approve-reads` 및 `nonInteractivePermissions=fail`을 기본값으로 사용합니다. 비대화형 ACP 세션에서는 권한 프롬프트를 유발하는 모든 쓰기 또는 exec가 `AcpRuntimeError: Permission prompt unavailable in non-interactive mode`로 실패할 수 있습니다.
>
> 권한을 제한해야 한다면, 세션이 크래시 대신 우아하게 저하되도록 `nonInteractivePermissions`를 `deny`로 설정하세요.

## 관련

- [ACP agents](/tools/acp-agents) — 개요, 오퍼레이터 런북, 개념
- [Sub-agents](/tools/subagents)
- [Multi-agent routing](/concepts/multi-agent)
