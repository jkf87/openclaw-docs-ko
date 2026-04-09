---
title: "acp"
description: "IDE 통합을 위한 ACP 브리지 실행"
---

# acp

OpenClaw Gateway와 통신하는 [Agent Client Protocol (ACP)](https://agentclientprotocol.com/) 브리지를 실행합니다.

이 명령은 IDE를 위해 stdio를 통해 ACP를 사용하고 WebSocket을 통해 Gateway로 프롬프트를 전달합니다. ACP 세션을 Gateway 세션 키에 매핑한 상태로 유지합니다.

`openclaw acp`는 완전한 ACP 네이티브 에디터 런타임이 아닌 Gateway 기반 ACP 브리지입니다. 세션 라우팅, 프롬프트 전달, 기본 스트리밍 업데이트에 집중합니다.

외부 MCP 클라이언트가 ACP 하네스 세션을 호스팅하는 대신 OpenClaw 채널 대화에 직접 연결하기를 원한다면 [`openclaw mcp serve`](/cli/mcp)를 사용하세요.

## 이것이 아닌 것

이 페이지는 종종 ACP 하네스 세션과 혼동됩니다.

`openclaw acp`의 의미:

- OpenClaw가 ACP 서버로 작동
- IDE 또는 ACP 클라이언트가 OpenClaw에 연결
- OpenClaw가 해당 작업을 Gateway 세션으로 전달

이것은 OpenClaw가 `acpx`를 통해 Codex 또는 Claude Code와 같은 외부 하네스를 실행하는 [ACP 에이전트](/tools/acp-agents)와는 다릅니다.

간단한 규칙:

- 에디터/클라이언트가 OpenClaw에 ACP로 연결하려는 경우: `openclaw acp` 사용
- OpenClaw가 Codex/Claude/Gemini를 ACP 하네스로 실행해야 하는 경우: `/acp spawn` 및 [ACP 에이전트](/tools/acp-agents) 사용

## 호환성 매트릭스

| ACP 영역                                                              | 상태      | 참고                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `initialize`, `newSession`, `prompt`, `cancel`                        | 구현됨 | stdio를 통해 Gateway chat/send + abort로 이어지는 핵심 브리지 흐름.                                                                                                                                                                                        |
| `listSessions`, 슬래시 명령                                        | 구현됨 | 세션 목록은 Gateway 세션 상태에 대해 작동하며, 명령은 `available_commands_update`를 통해 알립니다.                                                                                                                                       |
| `loadSession`                                                         | 부분 구현     | ACP 세션을 Gateway 세션 키에 다시 바인딩하고 저장된 사용자/어시스턴트 텍스트 이력을 재생합니다. 툴/시스템 이력은 아직 재구성되지 않습니다.                                                                                                   |
| 프롬프트 콘텐츠 (`text`, 내장 `resource`, 이미지)                  | 부분 구현     | 텍스트/리소스는 채팅 입력으로 평탄화되며, 이미지는 Gateway 첨부 파일이 됩니다.                                                                                                                                                                 |
| 세션 모드                                                         | 부분 구현     | `session/set_mode`가 지원되며 브리지는 사고 수준, 툴 상세도, 추론, 사용 세부사항, 높은 권한의 작업에 대한 초기 Gateway 기반 세션 컨트롤을 제공합니다. 더 넓은 ACP 네이티브 모드/구성 표면은 아직 범위 밖입니다. |
| 세션 정보 및 사용량 업데이트                                        | 부분 구현     | 브리지는 캐시된 Gateway 세션 스냅샷에서 `session_info_update` 및 최선의 `usage_update` 알림을 발송합니다. 사용량은 근사치이며 Gateway 토큰 합계가 최신으로 표시될 때만 전송됩니다.                                        |
| 툴 스트리밍                                                        | 부분 구현     | `tool_call` / `tool_call_update` 이벤트에는 원시 I/O, 텍스트 콘텐츠, Gateway 툴 인수/결과가 노출될 때 최선의 파일 위치가 포함됩니다. 내장 터미널과 더 풍부한 diff 네이티브 출력은 아직 노출되지 않습니다.                        |
| 세션별 MCP 서버 (`mcpServers`)                                | 미지원 | 브리지 모드는 세션별 MCP 서버 요청을 거부합니다. OpenClaw gateway 또는 에이전트에서 MCP를 구성하세요.                                                                                                                                     |
| 클라이언트 파일시스템 메서드 (`fs/read_text_file`, `fs/write_text_file`) | 미지원 | 브리지는 ACP 클라이언트 파일시스템 메서드를 호출하지 않습니다.                                                                                                                                                                          |
| 클라이언트 터미널 메서드 (`terminal/*`)                                | 미지원 | 브리지는 ACP 클라이언트 터미널을 생성하거나 툴 호출을 통해 터미널 id를 스트리밍하지 않습니다.                                                                                                                                     |
| 세션 플랜 / 사고 스트리밍                                     | 미지원 | 브리지는 현재 ACP 플랜이나 사고 업데이트가 아닌 출력 텍스트와 툴 상태를 발송합니다.                                                                                                                                         |

## 알려진 제한사항

- `loadSession`은 저장된 사용자 및 어시스턴트 텍스트 이력을 재생하지만, 이전 툴 호출, 시스템 알림, 또는 더 풍부한 ACP 네이티브 이벤트 유형은 재구성하지 않습니다.
- 여러 ACP 클라이언트가 동일한 Gateway 세션 키를 공유하는 경우, 이벤트 및 취소 라우팅은 클라이언트별로 엄격하게 격리되지 않고 최선의 방식으로 처리됩니다. 깔끔한 에디터 로컬 턴이 필요한 경우 기본 격리 `acp:&lt;uuid&gt;` 세션을 선호하세요.
- Gateway 중지 상태는 ACP 중지 이유로 변환되지만, 해당 매핑은 완전한 ACP 네이티브 런타임보다 표현력이 떨어집니다.
- 초기 세션 컨트롤은 현재 Gateway 노브의 집중된 하위 집합인 사고 수준, 툴 상세도, 추론, 사용 세부사항, 높은 권한의 작업을 제공합니다. 모델 선택 및 실행 호스트 컨트롤은 아직 ACP 구성 옵션으로 노출되지 않습니다.
- `session_info_update` 및 `usage_update`는 라이브 ACP 네이티브 런타임 계정이 아닌 Gateway 세션 스냅샷에서 파생됩니다. 사용량은 근사치이며, 비용 데이터가 없고, Gateway가 총 토큰 데이터를 최신으로 표시할 때만 발송됩니다.
- 툴 팔로우업 데이터는 최선의 방식으로 처리됩니다. 브리지는 알려진 툴 인수/결과에 나타나는 파일 경로를 표면화할 수 있지만, ACP 터미널이나 구조화된 파일 diff를 아직 발송하지 않습니다.

## 사용법

```bash
openclaw acp

# 원격 Gateway
openclaw acp --url wss://gateway-host:18789 --token &lt;token&gt;

# 원격 Gateway (파일에서 토큰 읽기)
openclaw acp --url wss://gateway-host:18789 --token-file ~/.openclaw/gateway.token

# 기존 세션 키에 연결
openclaw acp --session agent:main:main

# 레이블로 연결 (이미 존재해야 함)
openclaw acp --session-label "support inbox"

# 첫 번째 프롬프트 전에 세션 키 재설정
openclaw acp --session agent:main:main --reset-session
```

## ACP 클라이언트 (디버그)

IDE 없이 브리지를 검증하기 위해 내장 ACP 클라이언트를 사용하세요. ACP 브리지를 생성하고 프롬프트를 대화형으로 입력할 수 있습니다.

```bash
openclaw acp client

# 생성된 브리지를 원격 Gateway로 연결
openclaw acp client --server-args --url wss://gateway-host:18789 --token-file ~/.openclaw/gateway.token

# 서버 명령 재정의 (기본값: openclaw)
openclaw acp client --server "node" --server-args openclaw.mjs acp --url ws://127.0.0.1:19001
```

권한 모델 (클라이언트 디버그 모드):

- 자동 승인은 허용 목록 기반이며 신뢰할 수 있는 핵심 툴 ID에만 적용됩니다.
- `read` 자동 승인은 현재 작업 디렉터리로 범위가 지정됩니다 (설정된 경우 `--cwd`).
- ACP는 좁은 읽기 전용 클래스만 자동 승인합니다: 활성 cwd 아래의 범위 지정된 `read` 호출과 읽기 전용 검색 툴 (`search`, `web_search`, `memory_search`). 알 수 없는/비핵심 툴, 범위 밖 읽기, 실행 가능한 툴, 컨트롤 플레인 툴, 변경 툴, 대화형 흐름은 항상 명시적인 프롬프트 승인이 필요합니다.
- 서버 제공 `toolCall.kind`는 신뢰할 수 없는 메타데이터로 처리됩니다 (인증 소스가 아님).
- 이 ACP 브리지 정책은 ACPX 하네스 권한과 별개입니다. `acpx` 백엔드를 통해 OpenClaw를 실행하는 경우 `plugins.entries.acpx.config.permissionMode=approve-all`이 해당 하네스 세션의 "yolo" 스위치입니다.

## 사용 방법

IDE(또는 다른 클라이언트)가 Agent Client Protocol을 사용하고 OpenClaw Gateway 세션을 구동하기를 원할 때 ACP를 사용하세요.

1. Gateway가 실행 중인지 확인하세요 (로컬 또는 원격).
2. Gateway 대상을 구성하세요 (구성 또는 플래그).
3. IDE가 stdio를 통해 `openclaw acp`를 실행하도록 설정하세요.

구성 예시 (영구 저장):

```bash
openclaw config set gateway.remote.url wss://gateway-host:18789
openclaw config set gateway.remote.token &lt;token&gt;
```

직접 실행 예시 (구성 파일 작성 없음):

```bash
openclaw acp --url wss://gateway-host:18789 --token &lt;token&gt;
# 로컬 프로세스 안전을 위해 선호
openclaw acp --url wss://gateway-host:18789 --token-file ~/.openclaw/gateway.token
```

## 에이전트 선택

ACP는 에이전트를 직접 선택하지 않습니다. Gateway 세션 키로 라우팅합니다.

특정 에이전트를 대상으로 하려면 에이전트 범위의 세션 키를 사용하세요:

```bash
openclaw acp --session agent:main:main
openclaw acp --session agent:design:main
openclaw acp --session agent:qa:bug-123
```

각 ACP 세션은 단일 Gateway 세션 키에 매핑됩니다. 하나의 에이전트는 많은 세션을 가질 수 있습니다. ACP는 키나 레이블을 재정의하지 않는 한 기본적으로 격리된 `acp:&lt;uuid&gt;` 세션을 사용합니다.

세션별 `mcpServers`는 브리지 모드에서 지원되지 않습니다. ACP 클라이언트가 `newSession` 또는 `loadSession` 중에 이를 전송하면, 브리지는 자동으로 무시하는 대신 명확한 오류를 반환합니다.

ACPX 기반 세션에서 OpenClaw 플러그인 툴을 볼 수 있도록 하려면 세션별 `mcpServers`를 전달하는 대신 Gateway 측 ACPX 플러그인 브리지를 활성화하세요. [ACP 에이전트](/tools/acp-agents#plugin-tools-mcp-bridge)를 참조하세요.

## `acpx`에서 사용 (Codex, Claude, 기타 ACP 클라이언트)

Codex나 Claude Code와 같은 코딩 에이전트가 ACP를 통해 OpenClaw 봇과 통신하도록 하려면 내장 `openclaw` 대상이 있는 `acpx`를 사용하세요.

일반적인 흐름:

1. Gateway를 실행하고 ACP 브리지가 도달할 수 있는지 확인하세요.
2. `acpx openclaw`를 `openclaw acp`로 연결하세요.
3. 코딩 에이전트가 사용할 OpenClaw 세션 키를 대상으로 지정하세요.

예시:

```bash
# 기본 OpenClaw ACP 세션으로 일회성 요청
acpx openclaw exec "Summarize the active OpenClaw session state."

# 후속 턴을 위한 영구 명명 세션
acpx openclaw sessions ensure --name codex-bridge
acpx openclaw -s codex-bridge --cwd /path/to/repo \
  "Ask my OpenClaw work agent for recent context relevant to this repo."
```

`acpx openclaw`가 매번 특정 Gateway와 세션 키를 대상으로 하려면 `~/.acpx/config.json`의 `openclaw` 에이전트 명령을 재정의하세요:

```json
{
  "agents": {
    "openclaw": {
      "command": "env OPENCLAW_HIDE_BANNER=1 OPENCLAW_SUPPRESS_NOTES=1 openclaw acp --url ws://127.0.0.1:18789 --token-file ~/.openclaw/gateway.token --session agent:main:main"
    }
  }
}
```

저장소 로컬 OpenClaw 체크아웃의 경우, ACP 스트림을 깔끔하게 유지하기 위해 개발 실행기 대신 직접 CLI 진입점을 사용하세요. 예:

```bash
env OPENCLAW_HIDE_BANNER=1 OPENCLAW_SUPPRESS_NOTES=1 node openclaw.mjs acp ...
```

이것은 Codex, Claude Code 또는 다른 ACP 인식 클라이언트가 터미널을 스크래핑하지 않고 OpenClaw 에이전트에서 컨텍스트 정보를 가져올 수 있는 가장 쉬운 방법입니다.

## Zed 에디터 설정

`~/.config/zed/settings.json`에 사용자 정의 ACP 에이전트를 추가하거나 Zed의 설정 UI를 사용하세요:

```json
{
  "agent_servers": {
    "OpenClaw ACP": {
      "type": "custom",
      "command": "openclaw",
      "args": ["acp"],
      "env": {}
    }
  }
}
```

특정 Gateway 또는 에이전트를 대상으로 하려면:

```json
{
  "agent_servers": {
    "OpenClaw ACP": {
      "type": "custom",
      "command": "openclaw",
      "args": [
        "acp",
        "--url",
        "wss://gateway-host:18789",
        "--token",
        "&lt;token&gt;",
        "--session",
        "agent:design:main"
      ],
      "env": {}
    }
  }
}
```

Zed에서 에이전트 패널을 열고 "OpenClaw ACP"를 선택하여 스레드를 시작하세요.

## 세션 매핑

기본적으로 ACP 세션은 `acp:` 접두사가 있는 격리된 Gateway 세션 키를 받습니다. 알려진 세션을 재사용하려면 세션 키나 레이블을 전달하세요:

- `--session &lt;key&gt;`: 특정 Gateway 세션 키 사용.
- `--session-label <label>`: 레이블로 기존 세션 확인.
- `--reset-session`: 해당 키에 대한 새 세션 id 생성 (동일 키, 새 기록).

ACP 클라이언트가 메타데이터를 지원하는 경우, 세션별로 재정의할 수 있습니다:

```json
{
  "_meta": {
    "sessionKey": "agent:main:main",
    "sessionLabel": "support inbox",
    "resetSession": true
  }
}
```

세션 키에 대해 자세히 알아보려면 [/concepts/session](/concepts/session)을 참조하세요.

## 옵션

- `--url &lt;url&gt;`: Gateway WebSocket URL (구성된 경우 gateway.remote.url로 기본 설정).
- `--token &lt;token&gt;`: Gateway 인증 토큰.
- `--token-file &lt;path&gt;`: 파일에서 Gateway 인증 토큰 읽기.
- `--password &lt;password&gt;`: Gateway 인증 비밀번호.
- `--password-file &lt;path&gt;`: 파일에서 Gateway 인증 비밀번호 읽기.
- `--session &lt;key&gt;`: 기본 세션 키.
- `--session-label <label>`: 확인할 기본 세션 레이블.
- `--require-existing`: 세션 키/레이블이 존재하지 않으면 실패.
- `--reset-session`: 첫 번째 사용 전에 세션 키 재설정.
- `--no-prefix-cwd`: 프롬프트에 작업 디렉터리 접두사를 붙이지 않음.
- `--provenance &lt;off|meta|meta+receipt&gt;`: ACP 출처 메타데이터 또는 영수증 포함.
- `--verbose, -v`: stderr에 상세 로깅.

보안 참고사항:

- `--token` 및 `--password`는 일부 시스템의 로컬 프로세스 목록에 표시될 수 있습니다.
- `--token-file`/`--password-file` 또는 환경 변수 (`OPENCLAW_GATEWAY_TOKEN`, `OPENCLAW_GATEWAY_PASSWORD`)를 선호하세요.
- Gateway 인증 확인은 다른 Gateway 클라이언트가 사용하는 공유 계약을 따릅니다:
  - 로컬 모드: env (`OPENCLAW_GATEWAY_*`) -> `gateway.auth.*` -> `gateway.auth.*`가 설정되지 않은 경우에만 `gateway.remote.*` 폴백 (구성되었지만 확인되지 않은 로컬 SecretRef는 실패 처리)
  - 원격 모드: 원격 우선순위 규칙에 따른 env/구성 폴백이 있는 `gateway.remote.*`
  - `--url`은 재정의 안전하며 암묵적 구성/env 자격 증명을 재사용하지 않습니다. 명시적 `--token`/`--password` (또는 파일 변형)를 전달하세요.
- ACP 런타임 백엔드 자식 프로세스는 `OPENCLAW_SHELL=acp`를 받습니다. 이는 컨텍스트별 셸/프로파일 규칙에 사용할 수 있습니다.
- `openclaw acp client`는 생성된 브리지 프로세스에 `OPENCLAW_SHELL=acp-client`를 설정합니다.

### `acp client` 옵션

- `--cwd &lt;dir&gt;`: ACP 세션의 작업 디렉터리.
- `--server &lt;command&gt;`: ACP 서버 명령 (기본값: `openclaw`).
- `--server-args &lt;args...&gt;`: ACP 서버에 전달되는 추가 인수.
- `--server-verbose`: ACP 서버에서 상세 로깅 활성화.
- `--verbose, -v`: 상세 클라이언트 로깅.
