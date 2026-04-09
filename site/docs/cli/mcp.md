---
title: "mcp"
description: "OpenClaw 채널 대화를 MCP로 노출하고 저장된 MCP 서버 정의를 관리합니다"
---

# mcp

`openclaw mcp`에는 두 가지 역할이 있습니다:

- `openclaw mcp serve`로 OpenClaw를 MCP 서버로 실행
- `list`, `show`, `set`, `unset`으로 OpenClaw 소유 아웃바운드 MCP 서버 정의 관리

즉:

- `serve`는 OpenClaw가 MCP 서버 역할을 합니다
- `list` / `show` / `set` / `unset`은 OpenClaw가 런타임에서 나중에 사용할 수 있는 다른 MCP 서버를 위한 MCP 클라이언트 측 레지스트리 역할을 합니다

OpenClaw가 코딩 하네스 세션을 직접 호스팅하고 해당 런타임을 ACP를 통해 라우팅해야 할 때는 [`openclaw acp`](/cli/acp)를 사용하세요.

## MCP 서버로서의 OpenClaw

이것은 `openclaw mcp serve` 경로입니다.

## `serve`를 사용하는 경우

다음과 같은 경우 `openclaw mcp serve`를 사용하세요:

- Codex, Claude Code, 또는 다른 MCP 클라이언트가 OpenClaw 백업 채널 대화와 직접 통신해야 하는 경우
- 이미 라우팅된 세션이 있는 로컬 또는 원격 OpenClaw Gateway가 있는 경우
- 별도의 채널별 브리지를 실행하는 대신 OpenClaw의 채널 백엔드 전체에서 작동하는 하나의 MCP 서버를 원하는 경우

OpenClaw가 코딩 런타임을 직접 호스팅하고 에이전트 세션을 OpenClaw 내부에 유지해야 할 때는 [`openclaw acp`](/cli/acp)를 대신 사용하세요.

## 작동 방식

`openclaw mcp serve`는 stdio MCP 서버를 시작합니다. MCP 클라이언트가 해당 프로세스를 소유합니다. 클라이언트가 stdio 세션을 열어 두는 동안 브리지는 WebSocket을 통해 로컬 또는 원격 OpenClaw Gateway에 연결하고 라우팅된 채널 대화를 MCP를 통해 노출합니다.

수명 주기:

1. MCP 클라이언트가 `openclaw mcp serve`를 생성합니다
2. 브리지가 Gateway에 연결합니다
3. 라우팅된 세션이 MCP 대화 및 트랜스크립트/히스토리 툴이 됩니다
4. 라이브 이벤트가 브리지가 연결된 동안 메모리에 큐에 추가됩니다
5. Claude 채널 모드가 활성화된 경우 동일한 세션도 Claude 특정 푸시 알림을 받을 수 있습니다

중요한 동작:

- 라이브 큐 상태는 브리지가 연결될 때 시작됩니다
- 이전 트랜스크립트 히스토리는 `messages_read`로 읽습니다
- Claude 푸시 알림은 MCP 세션이 살아 있는 동안에만 존재합니다
- 클라이언트가 연결을 끊으면 브리지가 종료되고 라이브 큐가 사라집니다

## 클라이언트 모드 선택

동일한 브리지를 두 가지 다른 방식으로 사용하세요:

- 일반 MCP 클라이언트: 표준 MCP 툴만. `conversations_list`, `messages_read`, `events_poll`, `events_wait`, `messages_send`, 승인 툴을 사용하세요.
- Claude Code: 표준 MCP 툴과 Claude 특정 채널 어댑터. `--claude-channel-mode on`을 활성화하거나 기본값 `auto`를 유지하세요.

현재 `auto`는 `on`과 동일하게 동작합니다. 아직 클라이언트 기능 감지가 없습니다.

## `serve`가 노출하는 것

브리지는 기존 Gateway 세션 라우트 메타데이터를 사용하여 채널 백업 대화를 노출합니다. 다음과 같은 알려진 라우트로 OpenClaw에 이미 세션 상태가 있을 때 대화가 나타납니다:

- `channel`
- 수신자 또는 목적지 메타데이터
- 선택적 `accountId`
- 선택적 `threadId`

이렇게 하면 MCP 클라이언트가 한 곳에서 다음을 수행할 수 있습니다:

- 최근 라우팅된 대화 나열
- 최근 트랜스크립트 히스토리 읽기
- 새로운 인바운드 이벤트 대기
- 동일한 라우트를 통해 답장 전송
- 브리지가 연결된 동안 도착하는 승인 요청 확인

## 사용법

```bash
# 로컬 Gateway
openclaw mcp serve

# 원격 Gateway
openclaw mcp serve --url wss://gateway-host:18789 --token-file ~/.openclaw/gateway.token

# 비밀번호 인증이 있는 원격 Gateway
openclaw mcp serve --url wss://gateway-host:18789 --password-file ~/.openclaw/gateway.password

# 상세 브리지 로그 활성화
openclaw mcp serve --verbose

# Claude 특정 푸시 알림 비활성화
openclaw mcp serve --claude-channel-mode off
```

## 브리지 툴

현재 브리지는 다음 MCP 툴을 노출합니다:

- `conversations_list`
- `conversation_get`
- `messages_read`
- `attachments_fetch`
- `events_poll`
- `events_wait`
- `messages_send`
- `permissions_list_open`
- `permissions_respond`

### `conversations_list`

Gateway 세션 상태에 이미 라우트 메타데이터가 있는 최근 세션 백업 대화를 나열합니다.

유용한 필터:

- `limit`
- `search`
- `channel`
- `includeDerivedTitles`
- `includeLastMessage`

### `conversation_get`

`session_key`로 하나의 대화를 반환합니다.

### `messages_read`

하나의 세션 백업 대화에 대한 최근 트랜스크립트 메시지를 읽습니다.

### `attachments_fetch`

하나의 트랜스크립트 메시지에서 비텍스트 메시지 콘텐츠 블록을 추출합니다. 이것은 독립적인 내구성 있는 첨부 파일 블롭 저장소가 아닌 트랜스크립트 콘텐츠에 대한 메타데이터 뷰입니다.

### `events_poll`

숫자 커서 이후로 큐에 추가된 라이브 이벤트를 읽습니다.

### `events_wait`

다음 매칭 큐 이벤트가 도착하거나 타임아웃이 만료될 때까지 롱 폴링합니다.

Claude 특정 푸시 프로토콜 없이 일반 MCP 클라이언트가 거의 실시간 전달이 필요할 때 이를 사용하세요.

### `messages_send`

세션에 이미 기록된 동일한 라우트를 통해 텍스트를 되돌려 보냅니다.

현재 동작:

- 기존 대화 라우트가 필요합니다
- 세션의 채널, 수신자, 계정 id, 스레드 id를 사용합니다
- 텍스트만 전송합니다

### `permissions_list_open`

브리지가 Gateway에 연결된 이후 관찰한 보류 중인 exec/플러그인 승인 요청을 나열합니다.

### `permissions_respond`

다음을 사용하여 하나의 보류 중인 exec/플러그인 승인 요청을 확인합니다:

- `allow-once`
- `allow-always`
- `deny`

## 이벤트 모델

브리지는 연결된 동안 메모리 내 이벤트 큐를 유지합니다.

현재 이벤트 유형:

- `message`
- `exec_approval_requested`
- `exec_approval_resolved`
- `plugin_approval_requested`
- `plugin_approval_resolved`
- `claude_permission_request`

중요한 제한:

- 큐는 라이브 전용입니다; MCP 브리지가 시작될 때 시작됩니다
- `events_poll`과 `events_wait`은 자체적으로 이전 Gateway 히스토리를 재생하지 않습니다
- 내구성 있는 백로그는 `messages_read`로 읽어야 합니다

## Claude 채널 알림

브리지는 Claude 특정 채널 알림도 노출할 수 있습니다. 이것은 Claude Code 채널 어댑터의 OpenClaw 동등물입니다: 표준 MCP 툴은 계속 사용 가능하지만 라이브 인바운드 메시지도 Claude 특정 MCP 알림으로 도착할 수 있습니다.

플래그:

- `--claude-channel-mode off`: 표준 MCP 툴만
- `--claude-channel-mode on`: Claude 채널 알림 활성화
- `--claude-channel-mode auto`: 현재 기본값; `on`과 동일한 브리지 동작

Claude 채널 모드가 활성화되면 서버는 Claude 실험적 기능을 광고하고 다음을 출력할 수 있습니다:

- `notifications/claude/channel`
- `notifications/claude/channel/permission`

현재 브리지 동작:

- 인바운드 `user` 트랜스크립트 메시지는 `notifications/claude/channel`로 전달됩니다
- MCP를 통해 받은 Claude 권한 요청은 메모리 내에서 추적됩니다
- 연결된 대화가 나중에 `yes abcde` 또는 `no abcde`를 보내면 브리지는 이를 `notifications/claude/channel/permission`으로 변환합니다
- 이러한 알림은 라이브 세션 전용입니다; MCP 클라이언트가 연결을 끊으면 푸시 대상이 없습니다

이것은 의도적으로 클라이언트 특정입니다. 일반 MCP 클라이언트는 표준 폴링 툴에 의존해야 합니다.

## MCP 클라이언트 구성

stdio 클라이언트 구성 예시:

```json
{
  "mcpServers": {
    "openclaw": {
      "command": "openclaw",
      "args": [
        "mcp",
        "serve",
        "--url",
        "wss://gateway-host:18789",
        "--token-file",
        "/path/to/gateway.token"
      ]
    }
  }
}
```

대부분의 일반 MCP 클라이언트의 경우 표준 툴 표면으로 시작하고 Claude 모드를 무시하세요. Claude 특정 알림 메서드를 실제로 이해하는 클라이언트에만 Claude 모드를 켜세요.

## 옵션

`openclaw mcp serve`는 다음을 지원합니다:

- `--url &lt;url&gt;`: Gateway WebSocket URL
- `--token &lt;token&gt;`: Gateway 토큰
- `--token-file &lt;path&gt;`: 파일에서 토큰 읽기
- `--password &lt;password&gt;`: Gateway 비밀번호
- `--password-file &lt;path&gt;`: 파일에서 비밀번호 읽기
- `--claude-channel-mode &lt;auto|on|off&gt;`: Claude 알림 모드
- `-v`, `--verbose`: stderr에 상세 로그

가능한 경우 인라인 비밀보다 `--token-file` 또는 `--password-file`을 선호하세요.

## 보안 및 신뢰 경계

브리지는 라우팅을 만들지 않습니다. Gateway가 이미 라우팅하는 방법을 알고 있는 대화만 노출합니다.

즉:

- 발신자 허용 목록, 페어링, 채널 수준 신뢰는 여전히 기본 OpenClaw 채널 구성에 속합니다
- `messages_send`는 기존 저장된 라우트를 통해서만 답장할 수 있습니다
- 승인 상태는 현재 브리지 세션에만 라이브/메모리 내입니다
- 브리지 인증은 다른 원격 Gateway 클라이언트에 신뢰할 것과 동일한 Gateway 토큰 또는 비밀번호 제어를 사용해야 합니다

`conversations_list`에서 대화가 누락된 경우 일반적인 원인은 MCP 구성이 아닙니다. 기본 Gateway 세션에 누락되거나 불완전한 라우트 메타데이터입니다.

## 테스트

OpenClaw는 이 브리지를 위한 결정론적 Docker 스모크를 포함합니다:

```bash
pnpm test:docker:mcp-channels
```

해당 스모크:

- 시드된 Gateway 컨테이너를 시작합니다
- `openclaw mcp serve`를 생성하는 두 번째 컨테이너를 시작합니다
- 대화 검색, 트랜스크립트 읽기, 첨부 파일 메타데이터 읽기, 라이브 이벤트 큐 동작, 아웃바운드 전송 라우팅을 검증합니다
- 실제 stdio MCP 브리지를 통해 Claude 스타일 채널 및 권한 알림을 검증합니다

이것은 실제 Telegram, Discord, 또는 iMessage 계정을 테스트 실행에 연결하지 않고 브리지가 작동하는지 증명하는 가장 빠른 방법입니다.

더 넓은 테스트 컨텍스트는 [테스트](/help/testing)를 참조하세요.

## 문제 해결

### 반환된 대화 없음

일반적으로 Gateway 세션이 아직 라우팅 가능하지 않음을 의미합니다. 기본 세션에 저장된 채널/프로바이더, 수신자, 선택적 계정/스레드 라우트 메타데이터가 있는지 확인하세요.

### `events_poll` 또는 `events_wait`이 이전 메시지를 놓침

예상된 동작입니다. 라이브 큐는 브리지가 연결될 때 시작됩니다. `messages_read`로 이전 트랜스크립트 히스토리를 읽으세요.

### Claude 알림이 표시되지 않음

다음을 모두 확인하세요:

- 클라이언트가 stdio MCP 세션을 열어 두었습니다
- `--claude-channel-mode`가 `on` 또는 `auto`입니다
- 클라이언트가 Claude 특정 알림 메서드를 실제로 이해합니다
- 인바운드 메시지가 브리지가 연결된 후에 발생했습니다

### 승인이 누락됨

`permissions_list_open`은 브리지가 연결된 동안 관찰된 승인 요청만 표시합니다. 내구성 있는 승인 히스토리 API가 아닙니다.

## MCP 클라이언트 레지스트리로서의 OpenClaw

이것은 `openclaw mcp list`, `show`, `set`, `unset` 경로입니다.

이러한 명령은 OpenClaw를 MCP를 통해 노출하지 않습니다. OpenClaw 구성의 `mcp.servers` 아래에 OpenClaw 소유 MCP 서버 정의를 관리합니다.

저장된 정의는 임베디드 Pi 및 다른 런타임 어댑터와 같이 OpenClaw가 나중에 시작하거나 구성하는 런타임을 위한 것입니다. OpenClaw는 해당 런타임이 자체 중복 MCP 서버 목록을 유지할 필요가 없도록 중앙에서 정의를 저장합니다.

중요한 동작:

- 이러한 명령은 OpenClaw 구성만 읽거나 씁니다
- 대상 MCP 서버에 연결하지 않습니다
- 명령, URL, 또는 원격 전송이 지금 도달 가능한지 검증하지 않습니다
- 런타임 어댑터는 실행 시 실제로 지원하는 전송 형태를 결정합니다

## 저장된 MCP 서버 정의

OpenClaw는 또한 OpenClaw 관리 MCP 정의를 원하는 표면을 위해 구성에 경량 MCP 서버 레지스트리를 저장합니다.

명령:

- `openclaw mcp list`
- `openclaw mcp show [name]`
- `openclaw mcp set &lt;name&gt; &lt;json&gt;`
- `openclaw mcp unset &lt;name&gt;`

참고사항:

- `list`는 서버 이름을 정렬합니다.
- `show`는 이름 없이 전체 구성된 MCP 서버 객체를 출력합니다.
- `set`은 명령줄에서 하나의 JSON 객체 값을 예상합니다.
- `unset`은 명명된 서버가 존재하지 않으면 실패합니다.

예시:

```bash
openclaw mcp list
openclaw mcp show context7 --json
openclaw mcp set context7 '{"command":"uvx","args":["context7-mcp"]}'
openclaw mcp set docs '{"url":"https://mcp.example.com"}'
openclaw mcp unset context7
```

예시 구성 형태:

```json
{
  "mcp": {
    "servers": {
      "context7": {
        "command": "uvx",
        "args": ["context7-mcp"]
      },
      "docs": {
        "url": "https://mcp.example.com"
      }
    }
  }
}
```

### Stdio 전송

로컬 자식 프로세스를 시작하고 stdin/stdout을 통해 통신합니다.

| 필드                       | 설명                              |
| -------------------------- | --------------------------------- |
| `command`                  | 생성할 실행 파일 (필수)           |
| `args`                     | 명령줄 인수 배열                  |
| `env`                      | 추가 환경 변수                    |
| `cwd` / `workingDirectory` | 프로세스의 작업 디렉터리          |

### SSE / HTTP 전송

HTTP Server-Sent Events를 통해 원격 MCP 서버에 연결합니다.

| 필드                  | 설명                                                         |
| --------------------- | ------------------------------------------------------------ |
| `url`                 | 원격 서버의 HTTP 또는 HTTPS URL (필수)                       |
| `headers`             | HTTP 헤더의 선택적 키-값 맵 (예: 인증 토큰)                  |
| `connectionTimeoutMs` | 서버별 연결 타임아웃 (밀리초) (선택 사항)                    |

예시:

```json
{
  "mcp": {
    "servers": {
      "remote-tools": {
        "url": "https://mcp.example.com",
        "headers": {
          "Authorization": "Bearer &lt;token&gt;"
        }
      }
    }
  }
}
```

`url` (사용자 정보) 및 `headers`의 민감한 값은 로그 및 상태 출력에서 수정됩니다.

### 스트리밍 가능한 HTTP 전송

`streamable-http`는 `sse` 및 `stdio`와 함께 추가 전송 옵션입니다. 원격 MCP 서버와의 양방향 통신에 HTTP 스트리밍을 사용합니다.

| 필드                  | 설명                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `url`                 | 원격 서버의 HTTP 또는 HTTPS URL (필수)                                                 |
| `transport`           | 이 전송을 선택하려면 `"streamable-http"`로 설정; 생략하면 OpenClaw가 `sse`를 사용합니다 |
| `headers`             | HTTP 헤더의 선택적 키-값 맵 (예: 인증 토큰)                                            |
| `connectionTimeoutMs` | 서버별 연결 타임아웃 (밀리초) (선택 사항)                                              |

예시:

```json
{
  "mcp": {
    "servers": {
      "streaming-tools": {
        "url": "https://mcp.example.com/stream",
        "transport": "streamable-http",
        "connectionTimeoutMs": 10000,
        "headers": {
          "Authorization": "Bearer &lt;token&gt;"
        }
      }
    }
  }
}
```

이러한 명령은 저장된 구성만 관리합니다. 채널 브리지를 시작하거나, 라이브 MCP 클라이언트 세션을 열거나, 대상 서버에 도달 가능한지 증명하지 않습니다.

## 현재 제한

이 페이지는 오늘날 제공되는 브리지를 문서화합니다.

현재 제한:

- 대화 검색은 기존 Gateway 세션 라우트 메타데이터에 의존합니다
- Claude 특정 어댑터를 넘어서는 일반 푸시 프로토콜 없음
- 아직 메시지 편집 또는 반응 툴 없음
- HTTP/SSE/streamable-http 전송은 단일 원격 서버에 연결합니다; 아직 멀티플렉스된 업스트림 없음
- `permissions_list_open`은 브리지가 연결된 동안 관찰된 승인만 포함합니다
