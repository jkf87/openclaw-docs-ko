---
summary: "Slack 설정 및 런타임 동작 (Socket Mode + HTTP Request URLs)"
read_when:
  - Slack 설정 또는 Slack socket/HTTP 모드 디버깅 시
title: "Slack"
---

Slack 앱 통합을 통해 DM과 채널에서 프로덕션 준비 완료. 기본 모드는 Socket Mode이며, HTTP Request URLs도 지원됩니다.

<CardGroup cols={3}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Slack DM은 기본적으로 페어링 모드입니다.
  </Card>
  <Card title="슬래시 명령" icon="terminal" href="/tools/slash-commands">
    네이티브 명령 동작 및 명령 카탈로그.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 복구 플레이북.
  </Card>
</CardGroup>

## 빠른 설정

<Tabs>
  <Tab title="Socket Mode (기본값)">
    <Steps>
      <Step title="새 Slack 앱 생성">
        Slack 앱 설정에서 **[Create New App](https://api.slack.com/apps/new)** 버튼을 누릅니다:

        - **from a manifest**를 선택하고 앱을 사용할 워크스페이스를 선택합니다
        - 아래 [예시 manifest](#manifest-and-scope-checklist)를 붙여넣고 생성으로 진행합니다
        - `connections:write` 권한을 가진 **App-Level Token**(`xapp-...`)을 생성합니다
        - 앱을 설치하고 표시된 **Bot Token**(`xoxb-...`)을 복사합니다
      </Step>

      <Step title="OpenClaw 구성">

```json5
{
  channels: {
    slack: {
      enabled: true,
      mode: "socket",
      appToken: "xapp-...",
      botToken: "xoxb-...",
    },
  },
}
```

        환경 변수 폴백 (기본 계정에만 적용):

```bash
SLACK_APP_TOKEN=xapp-...
SLACK_BOT_TOKEN=xoxb-...
```

      </Step>

      <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

      </Step>
    </Steps>

  </Tab>

  <Tab title="HTTP Request URLs">
    <Steps>
      <Step title="새 Slack 앱 생성">
        Slack 앱 설정에서 **[Create New App](https://api.slack.com/apps/new)** 버튼을 누릅니다:

        - **from a manifest**를 선택하고 앱을 사용할 워크스페이스를 선택합니다
        - [예시 manifest](#manifest-and-scope-checklist)를 붙여넣고 생성 전에 URL을 업데이트합니다
        - 요청 검증을 위해 **Signing Secret**을 저장합니다
        - 앱을 설치하고 표시된 **Bot Token**(`xoxb-...`)을 복사합니다

      </Step>

      <Step title="OpenClaw 구성">

```json5
{
  channels: {
    slack: {
      enabled: true,
      mode: "http",
      botToken: "xoxb-...",
      signingSecret: "your-signing-secret",
      webhookPath: "/slack/events",
    },
  },
}
```

        <Note>
        다중 계정 HTTP에는 고유한 webhook 경로 사용

        각 계정에 별도의 `webhookPath`(기본값 `/slack/events`)를 지정하여 등록 충돌을 방지하세요.
        </Note>

      </Step>

      <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

      </Step>
    </Steps>

  </Tab>
</Tabs>

## Manifest 및 스코프 체크리스트

기본 Slack 앱 manifest는 Socket Mode와 HTTP Request URLs에서 동일합니다. `settings` 블록(및 슬래시 명령의 `url`)만 다릅니다.

기본 manifest (Socket Mode 기본값):

```json
{
  "display_information": {
    "name": "OpenClaw",
    "description": "Slack connector for OpenClaw"
  },
  "features": {
    "bot_user": { "display_name": "OpenClaw", "always_online": true },
    "app_home": {
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    },
    "slash_commands": [
      {
        "command": "/openclaw",
        "description": "Send a message to OpenClaw",
        "should_escape": false
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "app_mentions:read",
        "assistant:write",
        "channels:history",
        "channels:read",
        "chat:write",
        "commands",
        "emoji:read",
        "files:read",
        "files:write",
        "groups:history",
        "groups:read",
        "im:history",
        "im:read",
        "im:write",
        "mpim:history",
        "mpim:read",
        "mpim:write",
        "pins:read",
        "pins:write",
        "reactions:read",
        "reactions:write",
        "users:read"
      ]
    }
  },
  "settings": {
    "socket_mode_enabled": true,
    "event_subscriptions": {
      "bot_events": [
        "app_mention",
        "channel_rename",
        "member_joined_channel",
        "member_left_channel",
        "message.channels",
        "message.groups",
        "message.im",
        "message.mpim",
        "pin_added",
        "pin_removed",
        "reaction_added",
        "reaction_removed"
      ]
    }
  }
}
```

**HTTP Request URLs 모드**의 경우, `settings`를 HTTP 변형으로 교체하고 각 슬래시 명령에 `url`을 추가합니다. 공개 URL이 필요합니다:

```json
{
  "features": {
    "slash_commands": [
      {
        "command": "/openclaw",
        "description": "Send a message to OpenClaw",
        "should_escape": false,
        "url": "https://gateway-host.example.com/slack/events"
      }
    ]
  },
  "settings": {
    "event_subscriptions": {
      "request_url": "https://gateway-host.example.com/slack/events",
      "bot_events": [
        /* same as Socket Mode */
      ]
    },
    "interactivity": {
      "is_enabled": true,
      "request_url": "https://gateway-host.example.com/slack/events",
      "message_menu_options_url": "https://gateway-host.example.com/slack/events"
    }
  }
}
```

### 추가 manifest 설정

위 기본값을 확장하는 다양한 기능을 노출합니다.

<AccordionGroup>
  <Accordion title="선택적 네이티브 슬래시 명령">

    단일 구성된 명령 대신 여러 [네이티브 슬래시 명령](#commands-and-slash-behavior)을 다음 유의 사항과 함께 사용할 수 있습니다:

    - `/status` 명령은 예약되어 있으므로 `/status` 대신 `/agentstatus`를 사용하세요.
    - 한 번에 25개를 초과하는 슬래시 명령은 제공할 수 없습니다.

    기존 `features.slash_commands` 섹션을 [사용 가능한 명령](/tools/slash-commands#command-list)의 하위 집합으로 교체하세요:

    <Tabs>
      <Tab title="Socket Mode (기본값)">

```json
    "slash_commands": [
      {
        "command": "/new",
        "description": "Start a new session",
        "usage_hint": "[model]"
      },
      {
        "command": "/reset",
        "description": "Reset the current session"
      },
      {
        "command": "/compact",
        "description": "Compact the session context",
        "usage_hint": "[instructions]"
      },
      {
        "command": "/stop",
        "description": "Stop the current run"
      },
      {
        "command": "/session",
        "description": "Manage thread-binding expiry",
        "usage_hint": "idle <duration|off> or max-age <duration|off>"
      },
      {
        "command": "/think",
        "description": "Set the thinking level",
        "usage_hint": "<level>"
      },
      {
        "command": "/verbose",
        "description": "Toggle verbose output",
        "usage_hint": "on|off|full"
      },
      {
        "command": "/fast",
        "description": "Show or set fast mode",
        "usage_hint": "[status|on|off]"
      },
      {
        "command": "/reasoning",
        "description": "Toggle reasoning visibility",
        "usage_hint": "[on|off|stream]"
      },
      {
        "command": "/elevated",
        "description": "Toggle elevated mode",
        "usage_hint": "[on|off|ask|full]"
      },
      {
        "command": "/exec",
        "description": "Show or set exec defaults",
        "usage_hint": "host=<auto|sandbox|gateway|node> security=<deny|allowlist|full> ask=<off|on-miss|always> node=<id>"
      },
      {
        "command": "/model",
        "description": "Show or set the model",
        "usage_hint": "[name|#|status]"
      },
      {
        "command": "/models",
        "description": "List providers/models or add a model",
        "usage_hint": "[provider] [page] [limit=<n>|size=<n>|all] | add <provider> <modelId>"
      },
      {
        "command": "/help",
        "description": "Show the short help summary"
      },
      {
        "command": "/commands",
        "description": "Show the generated command catalog"
      },
      {
        "command": "/tools",
        "description": "Show what the current agent can use right now",
        "usage_hint": "[compact|verbose]"
      },
      {
        "command": "/agentstatus",
        "description": "Show runtime status, including provider usage/quota when available"
      },
      {
        "command": "/tasks",
        "description": "List active/recent background tasks for the current session"
      },
      {
        "command": "/context",
        "description": "Explain how context is assembled",
        "usage_hint": "[list|detail|json]"
      },
      {
        "command": "/whoami",
        "description": "Show your sender identity"
      },
      {
        "command": "/skill",
        "description": "Run a skill by name",
        "usage_hint": "<name> [input]"
      },
      {
        "command": "/btw",
        "description": "Ask a side question without changing session context",
        "usage_hint": "<question>"
      },
      {
        "command": "/usage",
        "description": "Control the usage footer or show cost summary",
        "usage_hint": "off|tokens|full|cost"
      }
    ]
```

      </Tab>
      <Tab title="HTTP Request URLs">
        위 Socket Mode와 동일한 `slash_commands` 목록을 사용하고, 모든 항목에 `"url": "https://gateway-host.example.com/slack/events"`를 추가합니다. 예시:

```json
    "slash_commands": [
      {
        "command": "/new",
        "description": "Start a new session",
        "usage_hint": "[model]",
        "url": "https://gateway-host.example.com/slack/events"
      },
      {
        "command": "/help",
        "description": "Show the short help summary",
        "url": "https://gateway-host.example.com/slack/events"
      }
      // ...동일한 `url` 값으로 모든 명령에 반복
    ]
```

      </Tab>
    </Tabs>

  </Accordion>
  <Accordion title="선택적 작성자 스코프 (쓰기 작업)">
    기본 Slack 앱 ID 대신 활성 에이전트 ID(사용자 정의 username 및 아이콘)로 아웃바운드 메시지를 전송하려면 `chat:write.customize` 봇 스코프를 추가하세요.

    이모지 아이콘을 사용하는 경우, Slack은 `:emoji_name:` 구문을 기대합니다.

  </Accordion>
  <Accordion title="선택적 user-token 스코프 (읽기 작업)">
    `channels.slack.userToken`을 구성하는 경우, 일반적인 읽기 스코프는 다음과 같습니다:

    - `channels:history`, `groups:history`, `im:history`, `mpim:history`
    - `channels:read`, `groups:read`, `im:read`, `mpim:read`
    - `users:read`
    - `reactions:read`
    - `pins:read`
    - `emoji:read`
    - `search:read` (Slack 검색 읽기에 의존하는 경우)

  </Accordion>
</AccordionGroup>

## 토큰 모델

- Socket Mode에는 `botToken` + `appToken`이 필요합니다.
- HTTP 모드에는 `botToken` + `signingSecret`이 필요합니다.
- `botToken`, `appToken`, `signingSecret`, `userToken`은 plaintext
  문자열 또는 SecretRef 객체를 허용합니다.
- 구성 토큰은 환경 변수 폴백을 재정의합니다.
- `SLACK_BOT_TOKEN` / `SLACK_APP_TOKEN` 환경 변수 폴백은 기본 계정에만 적용됩니다.
- `userToken`(`xoxp-...`)은 구성 전용이며(환경 변수 폴백 없음) 기본적으로 읽기 전용 동작(`userTokenReadOnly: true`)을 취합니다.

상태 스냅샷 동작:

- Slack 계정 검사는 자격 증명별 `*Source` 및 `*Status`
  필드(`botToken`, `appToken`, `signingSecret`, `userToken`)를 추적합니다.
- 상태는 `available`, `configured_unavailable`, 또는 `missing`입니다.
- `configured_unavailable`은 계정이 SecretRef 또는
  다른 비인라인 시크릿 소스를 통해 구성되었으나, 현재 명령/런타임 경로가
  실제 값을 해석할 수 없음을 의미합니다.
- HTTP 모드에서는 `signingSecretStatus`가 포함되며, Socket Mode에서는
  필수 쌍이 `botTokenStatus` + `appTokenStatus`입니다.

<Tip>
액션/디렉토리 읽기의 경우 user token이 구성되어 있으면 선호될 수 있습니다. 쓰기의 경우 bot token이 여전히 선호되며, user-token 쓰기는 `userTokenReadOnly: false`이고 bot token을 사용할 수 없을 때만 허용됩니다.
</Tip>

## 액션 및 게이트

Slack 액션은 `channels.slack.actions.*`로 제어됩니다.

현재 Slack 도구에서 사용 가능한 액션 그룹:

| 그룹       | 기본값  |
| ---------- | ------- |
| messages   | enabled |
| reactions  | enabled |
| pins       | enabled |
| memberInfo | enabled |
| emojiList  | enabled |

현재 Slack 메시지 액션에는 `send`, `upload-file`, `download-file`, `read`, `edit`, `delete`, `pin`, `unpin`, `list-pins`, `member-info`, `emoji-list`가 포함됩니다.

## 접근 제어 및 라우팅

<Tabs>
  <Tab title="DM 정책">
    `channels.slack.dmPolicy`는 DM 접근을 제어합니다 (레거시: `channels.slack.dm.policy`):

    - `pairing` (기본값)
    - `allowlist`
    - `open` (`channels.slack.allowFrom`에 `"*"` 포함 필요; 레거시: `channels.slack.dm.allowFrom`)
    - `disabled`

    DM 플래그:

    - `dm.enabled` (기본값 true)
    - `channels.slack.allowFrom` (권장)
    - `dm.allowFrom` (레거시)
    - `dm.groupEnabled` (그룹 DM 기본값 false)
    - `dm.groupChannels` (선택적 MPIM 허용 목록)

    다중 계정 우선순위:

    - `channels.slack.accounts.default.allowFrom`은 `default` 계정에만 적용됩니다.
    - 명명된 계정은 자체 `allowFrom`이 설정되지 않은 경우 `channels.slack.allowFrom`을 상속합니다.
    - 명명된 계정은 `channels.slack.accounts.default.allowFrom`을 상속하지 않습니다.

    DM 페어링은 `openclaw pairing approve slack <code>`를 사용합니다.

  </Tab>

  <Tab title="채널 정책">
    `channels.slack.groupPolicy`는 채널 처리를 제어합니다:

    - `open`
    - `allowlist`
    - `disabled`

    채널 허용 목록은 `channels.slack.channels` 아래에 있으며 안정적인 채널 ID를 사용해야 합니다.

    런타임 참고: `channels.slack`이 완전히 없으면(환경 변수 전용 설정) 런타임은 `groupPolicy="allowlist"`로 폴백하고 경고를 로그합니다 (`channels.defaults.groupPolicy`가 설정된 경우에도).

    이름/ID 해석:

    - 채널 허용 목록 항목과 DM 허용 목록 항목은 토큰 접근이 허용되는 경우 시작 시 해석됩니다
    - 해석되지 않은 채널 이름 항목은 구성된 대로 유지되지만 기본적으로 라우팅에서 무시됩니다
    - 인바운드 인증과 채널 라우팅은 기본적으로 ID 우선이며, 직접 username/slug 매칭은 `channels.slack.dangerouslyAllowNameMatching: true`가 필요합니다

  </Tab>

  <Tab title="언급 및 채널 사용자">
    채널 메시지는 기본적으로 언급으로 게이트됩니다.

    언급 출처:

    - 명시적 앱 언급 (`<@botId>`)
    - 언급 정규식 패턴 (`agents.list[].groupChat.mentionPatterns`, 폴백 `messages.groupChat.mentionPatterns`)
    - 암시적 봇 응답 스레드 동작 (`thread.requireExplicitMention`이 `true`일 때 비활성화)

    채널별 제어 (`channels.slack.channels.<id>`; 이름은 시작 시 해석 또는 `dangerouslyAllowNameMatching`을 통해서만):

    - `requireMention`
    - `users` (허용 목록)
    - `allowBots`
    - `skills`
    - `systemPrompt`
    - `tools`, `toolsBySender`
    - `toolsBySender` 키 형식: `id:`, `e164:`, `username:`, `name:`, 또는 `"*"` 와일드카드
      (레거시 접두사 없는 키는 `id:`로만 매핑됨)

  </Tab>
</Tabs>

## 스레딩, 세션 및 응답 태그

- DM은 `direct`로, 채널은 `channel`로, MPIM은 `group`으로 라우팅됩니다.
- 기본 `session.dmScope=main`으로 Slack DM은 에이전트 메인 세션으로 축소됩니다.
- 채널 세션: `agent:<agentId>:slack:channel:<channelId>`.
- 스레드 응답은 해당되는 경우 스레드 세션 접미사(`:thread:<threadTs>`)를 생성할 수 있습니다.
- `channels.slack.thread.historyScope` 기본값은 `thread`; `thread.inheritParent` 기본값은 `false`입니다.
- `channels.slack.thread.initialHistoryLimit`은 새 스레드 세션이 시작될 때 가져오는 기존 스레드 메시지 수를 제어합니다 (기본값 `20`; `0`으로 설정하여 비활성화).
- `channels.slack.thread.requireExplicitMention` (기본값 `false`): `true`일 때, 암시적 스레드 언급을 억제하여 봇이 이미 스레드에 참여했더라도 스레드 내부의 명시적 `@bot` 언급에만 응답합니다. 이것이 없으면 봇 참여 스레드의 응답은 `requireMention` 게이팅을 우회합니다.

응답 스레딩 제어:

- `channels.slack.replyToMode`: `off|first|all|batched` (기본값 `off`)
- `channels.slack.replyToModeByChatType`: `direct|group|channel`별
- 다이렉트 채팅용 레거시 폴백: `channels.slack.dm.replyToMode`

수동 응답 태그가 지원됩니다:

- `[[reply_to_current]]`
- `[[reply_to:<id>]]`

참고: `replyToMode="off"`는 명시적 `[[reply_to_*]]` 태그를 포함한 Slack의 **모든** 응답 스레딩을 비활성화합니다. 이는 `"off"` 모드에서도 명시적 태그가 존중되는 Telegram과 다릅니다 — Slack 스레드는 채널에서 메시지를 숨기는 반면 Telegram 응답은 인라인에서 계속 표시됩니다.

## 확인 반응 (Ack reactions)

`ackReaction`은 OpenClaw가 인바운드 메시지를 처리하는 동안 확인 이모지를 전송합니다.

해석 순서:

- `channels.slack.accounts.<accountId>.ackReaction`
- `channels.slack.ackReaction`
- `messages.ackReaction`
- 에이전트 ID 이모지 폴백 (`agents.list[].identity.emoji`, 없으면 "👀")

참고:

- Slack은 shortcode를 기대합니다 (예: `"eyes"`).
- `""`를 사용하면 Slack 계정 또는 전역 반응이 비활성화됩니다.

## 텍스트 스트리밍

`channels.slack.streaming`은 라이브 미리보기 동작을 제어합니다:

- `off`: 라이브 미리보기 스트리밍 비활성화.
- `partial` (기본값): 미리보기 텍스트를 최신 부분 출력으로 교체.
- `block`: 청크 단위 미리보기 업데이트 추가.
- `progress`: 생성 중 진행 상태 텍스트를 표시하고 최종 텍스트 전송.
- `streaming.preview.toolProgress`: 초안 미리보기가 활성화된 경우 tool/progress 업데이트를 동일한 편집된 미리보기 메시지로 라우팅 (기본값: `true`). 별도의 tool/progress 메시지를 유지하려면 `false`로 설정.

`channels.slack.streaming.nativeTransport`는 `channels.slack.streaming.mode`가 `partial`일 때 Slack 네이티브 텍스트 스트리밍을 제어합니다 (기본값: `true`).

- 네이티브 텍스트 스트리밍과 Slack assistant 스레드 상태가 나타나려면 응답 스레드가 사용 가능해야 합니다. 스레드 선택은 여전히 `replyToMode`를 따릅니다.
- 네이티브 스트리밍을 사용할 수 없을 때 채널 및 그룹 채팅 루트는 일반 초안 미리보기를 사용할 수 있습니다.
- 최상위 Slack DM은 기본적으로 스레드 외부에 있으므로 스레드 스타일 미리보기를 표시하지 않습니다; 가시적인 진행 상태를 원한다면 스레드 응답 또는 `typingReaction`을 사용하세요.
- 미디어 및 비 텍스트 페이로드는 일반 전달로 폴백합니다.
- 미디어/오류 최종본은 대기 중인 미리보기 편집을 취소합니다; 적격 텍스트/블록 최종본은 제자리에서 미리보기를 편집할 수 있을 때만 플러시됩니다.
- 응답 중간에 스트리밍이 실패하면 OpenClaw는 나머지 페이로드에 대해 일반 전달로 폴백합니다.

Slack 네이티브 텍스트 스트리밍 대신 초안 미리보기 사용:

```json5
{
  channels: {
    slack: {
      streaming: {
        mode: "partial",
        nativeTransport: false,
      },
    },
  },
}
```

레거시 키:

- `channels.slack.streamMode` (`replace | status_final | append`)는 `channels.slack.streaming.mode`로 자동 마이그레이션됩니다.
- 부울 `channels.slack.streaming`은 `channels.slack.streaming.mode`와 `channels.slack.streaming.nativeTransport`로 자동 마이그레이션됩니다.
- 레거시 `channels.slack.nativeStreaming`은 `channels.slack.streaming.nativeTransport`로 자동 마이그레이션됩니다.

## 타이핑 반응 폴백

`typingReaction`은 OpenClaw가 응답을 처리하는 동안 인바운드 Slack 메시지에 임시 반응을 추가하고, 실행이 완료되면 제거합니다. 이는 기본 "is typing..." 상태 표시기를 사용하는 스레드 응답 외부에서 가장 유용합니다.

해석 순서:

- `channels.slack.accounts.<accountId>.typingReaction`
- `channels.slack.typingReaction`

참고:

- Slack은 shortcode를 기대합니다 (예: `"hourglass_flowing_sand"`).
- 반응은 최선 노력이며, 응답 또는 실패 경로가 완료된 후 정리가 자동으로 시도됩니다.

## 미디어, 청킹 및 전달

<AccordionGroup>
  <Accordion title="인바운드 첨부 파일">
    Slack 파일 첨부는 Slack 호스팅 비공개 URL(토큰 인증 요청 흐름)에서 다운로드되며, fetch가 성공하고 크기 제한이 허용되는 경우 미디어 저장소에 기록됩니다.

    런타임 인바운드 크기 상한은 `channels.slack.mediaMaxMb`로 재정의되지 않는 한 기본값이 `20MB`입니다.

  </Accordion>

  <Accordion title="아웃바운드 텍스트 및 파일">
    - 텍스트 청크는 `channels.slack.textChunkLimit`(기본값 4000)을 사용합니다
    - `channels.slack.chunkMode="newline"`은 단락 우선 분할을 활성화합니다
    - 파일 전송은 Slack 업로드 API를 사용하며 스레드 응답(`thread_ts`)을 포함할 수 있습니다
    - 아웃바운드 미디어 상한은 구성된 경우 `channels.slack.mediaMaxMb`를 따릅니다; 그렇지 않으면 채널 전송은 미디어 파이프라인의 MIME 종류 기본값을 사용합니다
  </Accordion>

  <Accordion title="전달 타겟">
    선호되는 명시적 타겟:

    - DM의 경우 `user:<id>`
    - 채널의 경우 `channel:<id>`

    Slack DM은 사용자 타겟으로 전송할 때 Slack conversation API를 통해 열립니다.

  </Accordion>
</AccordionGroup>

## 명령 및 슬래시 동작

슬래시 명령은 Slack에 단일 구성된 명령 또는 여러 네이티브 명령으로 나타납니다. 명령 기본값을 변경하려면 `channels.slack.slashCommand`를 구성하세요:

- `enabled: false`
- `name: "openclaw"`
- `sessionPrefix: "slack:slash"`
- `ephemeral: true`

```txt
/openclaw /help
```

네이티브 명령은 Slack 앱에서 [추가 manifest 설정](#additional-manifest-settings)이 필요하며, 전역 구성에서 `channels.slack.commands.native: true` 또는 `commands.native: true`로 활성화됩니다.

- Slack의 경우 네이티브 명령 자동 모드는 **off**이므로 `commands.native: "auto"`는 Slack 네이티브 명령을 활성화하지 않습니다.

```txt
/help
```

네이티브 인수 메뉴는 선택된 옵션 값을 디스패치하기 전에 확인 모달을 표시하는 적응형 렌더링 전략을 사용합니다:

- 최대 5개 옵션: 버튼 블록
- 6~100개 옵션: 정적 선택 메뉴
- 100개 초과 옵션: 인터랙티비티 옵션 핸들러를 사용할 수 있을 때 비동기 옵션 필터링이 있는 외부 선택
- Slack 제한 초과: 인코딩된 옵션 값이 버튼으로 폴백

```txt
/think
```

슬래시 세션은 `agent:<agentId>:slack:slash:<userId>` 같은 격리된 키를 사용하며, `CommandTargetSessionKey`를 사용하여 대상 대화 세션으로 명령 실행을 계속 라우팅합니다.

## 인터랙티브 응답

Slack은 에이전트가 작성한 인터랙티브 응답 컨트롤을 렌더링할 수 있지만, 이 기능은 기본적으로 비활성화되어 있습니다.

전역으로 활성화:

```json5
{
  channels: {
    slack: {
      capabilities: {
        interactiveReplies: true,
      },
    },
  },
}
```

또는 하나의 Slack 계정에만 활성화:

```json5
{
  channels: {
    slack: {
      accounts: {
        ops: {
          capabilities: {
            interactiveReplies: true,
          },
        },
      },
    },
  },
}
```

활성화되면 에이전트는 Slack 전용 응답 지시문을 발행할 수 있습니다:

- `[[slack_buttons: Approve:approve, Reject:reject]]`
- `[[slack_select: Choose a target | Canary:canary, Production:production]]`

이 지시문은 Slack Block Kit으로 컴파일되며, 클릭 또는 선택은 기존 Slack 인터랙션 이벤트 경로를 통해 다시 라우팅됩니다.

참고:

- 이는 Slack 전용 UI입니다. 다른 채널은 Slack Block Kit 지시문을 자체 버튼 시스템으로 변환하지 않습니다.
- 인터랙티브 콜백 값은 OpenClaw가 생성한 불투명 토큰이며, 원시 에이전트 작성 값이 아닙니다.
- 생성된 인터랙티브 블록이 Slack Block Kit 제한을 초과하는 경우, OpenClaw는 잘못된 blocks 페이로드를 전송하는 대신 원래 텍스트 응답으로 폴백합니다.

## Slack에서의 Exec 승인

Slack은 Web UI 또는 터미널로 폴백하는 대신 인터랙티브 버튼과 인터랙션이 있는 네이티브 승인 클라이언트로 작동할 수 있습니다.

- Exec 승인은 네이티브 DM/채널 라우팅을 위해 `channels.slack.execApprovals.*`를 사용합니다.
- 플러그인 승인은 요청이 이미 Slack에 도착하고 승인 ID 종류가 `plugin:`일 때 동일한 Slack 네이티브 버튼 표면을 통해 해석될 수 있습니다.
- 승인자 인증은 여전히 적용됩니다: 승인자로 식별된 사용자만 Slack을 통해 요청을 승인하거나 거부할 수 있습니다.

이는 다른 채널과 동일한 공유 승인 버튼 표면을 사용합니다. Slack 앱 설정에서 `interactivity`가 활성화된 경우, 승인 프롬프트는 대화에 Block Kit 버튼으로 직접 렌더링됩니다.
해당 버튼이 있을 때는 기본 승인 UX입니다; OpenClaw는
도구 결과에서 채팅 승인을 사용할 수 없거나 수동 승인이 유일한
경로라고 표시될 때만 수동 `/approve` 명령을 포함해야 합니다.

구성 경로:

- `channels.slack.execApprovals.enabled`
- `channels.slack.execApprovals.approvers` (선택 사항; 가능한 경우 `commands.ownerAllowFrom`으로 폴백)
- `channels.slack.execApprovals.target` (`dm` | `channel` | `both`, 기본값: `dm`)
- `agentFilter`, `sessionFilter`

Slack은 `enabled`가 설정되지 않았거나 `"auto"`이고 최소 한 명의
승인자가 해석될 때 네이티브 exec 승인을 자동 활성화합니다. Slack을 네이티브 승인 클라이언트로 명시적으로 비활성화하려면 `enabled: false`로 설정하세요.
승인자가 해석될 때 네이티브 승인을 강제로 활성화하려면 `enabled: true`로 설정하세요.

명시적 Slack exec 승인 구성 없는 기본 동작:

```json5
{
  commands: {
    ownerAllowFrom: ["slack:U12345678"],
  },
}
```

명시적 Slack 네이티브 구성은 승인자를 재정의하거나, 필터를 추가하거나,
원본 채팅 전달을 선택하려는 경우에만 필요합니다:

```json5
{
  channels: {
    slack: {
      execApprovals: {
        enabled: true,
        approvers: ["U12345678"],
        target: "both",
      },
    },
  },
}
```

공유 `approvals.exec` 전달은 별개입니다. exec 승인 프롬프트가
다른 채팅 또는 명시적 대역외 대상으로도 라우팅되어야 할 때만 사용하세요. 공유 `approvals.plugin` 전달도
별개입니다; Slack 네이티브 버튼은 해당 요청이 이미 Slack에 도착했을 때
플러그인 승인을 계속 해석할 수 있습니다.

동일 채팅 `/approve`는 이미 명령을 지원하는 Slack 채널 및 DM에서도 작동합니다. 전체 승인 전달 모델은 [Exec 승인](/tools/exec-approvals)을 참조하세요.

## 이벤트 및 운영 동작

- 메시지 편집/삭제/스레드 브로드캐스트는 시스템 이벤트로 매핑됩니다.
- 반응 추가/제거 이벤트는 시스템 이벤트로 매핑됩니다.
- 멤버 참여/탈퇴, 채널 생성/이름 변경, pin 추가/제거 이벤트는 시스템 이벤트로 매핑됩니다.
- `configWrites`가 활성화된 경우 `channel_id_changed`는 채널 구성 키를 마이그레이션할 수 있습니다.
- 채널 주제/목적 메타데이터는 신뢰할 수 없는 컨텍스트로 처리되며 라우팅 컨텍스트에 주입될 수 있습니다.
- 스레드 시작자 및 초기 스레드 히스토리 컨텍스트 시딩은 해당되는 경우 구성된 발신자 허용 목록으로 필터링됩니다.
- 블록 액션 및 모달 인터랙션은 풍부한 페이로드 필드와 함께 구조화된 `Slack interaction: ...` 시스템 이벤트를 발행합니다:
  - 블록 액션: 선택된 값, 레이블, picker 값, `workflow_*` 메타데이터
  - 라우팅된 채널 메타데이터와 양식 입력이 있는 모달 `view_submission` 및 `view_closed` 이벤트

## 구성 참조

기본 참조: [구성 참조 - Slack](/gateway/config-channels#slack).

<Accordion title="고 신호 Slack 필드">

- 모드/인증: `mode`, `botToken`, `appToken`, `signingSecret`, `webhookPath`, `accounts.*`
- DM 접근: `dm.enabled`, `dmPolicy`, `allowFrom` (레거시: `dm.policy`, `dm.allowFrom`), `dm.groupEnabled`, `dm.groupChannels`
- 호환성 토글: `dangerouslyAllowNameMatching` (비상용; 필요하지 않으면 꺼두세요)
- 채널 접근: `groupPolicy`, `channels.*`, `channels.*.users`, `channels.*.requireMention`
- 스레딩/히스토리: `replyToMode`, `replyToModeByChatType`, `thread.*`, `historyLimit`, `dmHistoryLimit`, `dms.*.historyLimit`
- 전달: `textChunkLimit`, `chunkMode`, `mediaMaxMb`, `streaming`, `streaming.nativeTransport`, `streaming.preview.toolProgress`
- 운영/기능: `configWrites`, `commands.native`, `slashCommand.*`, `actions.*`, `userToken`, `userTokenReadOnly`

</Accordion>

## 문제 해결

<AccordionGroup>
  <Accordion title="채널에서 응답 없음">
    다음 순서로 확인:

    - `groupPolicy`
    - 채널 허용 목록 (`channels.slack.channels`)
    - `requireMention`
    - 채널별 `users` 허용 목록

    유용한 명령:

```bash
openclaw channels status --probe
openclaw logs --follow
openclaw doctor
```

  </Accordion>

  <Accordion title="DM 메시지 무시됨">
    확인:

    - `channels.slack.dm.enabled`
    - `channels.slack.dmPolicy` (또는 레거시 `channels.slack.dm.policy`)
    - 페어링 승인 / 허용 목록 항목

```bash
openclaw pairing list slack
```

  </Accordion>

  <Accordion title="Socket Mode 연결 안 됨">
    Slack 앱 설정에서 bot + app 토큰과 Socket Mode 활성화를 검증하세요.

    `openclaw channels status --probe --json`이 `botTokenStatus` 또는
    `appTokenStatus: "configured_unavailable"`을 표시하면 Slack 계정은
    구성되었으나 현재 런타임이 SecretRef 기반 값을 해석할 수 없음을 의미합니다.

  </Accordion>

  <Accordion title="HTTP 모드에서 이벤트 수신 안 됨">
    검증:

    - signing secret
    - webhook 경로
    - Slack Request URLs (Events + Interactivity + Slash Commands)
    - HTTP 계정별 고유한 `webhookPath`

    계정 스냅샷에 `signingSecretStatus: "configured_unavailable"`이 나타나면
    HTTP 계정은 구성되었으나 현재 런타임이 SecretRef 기반
    signing secret을 해석할 수 없음을 의미합니다.

  </Accordion>

  <Accordion title="네이티브/슬래시 명령이 실행되지 않음">
    의도한 것을 확인하세요:

    - Slack에 등록된 일치하는 슬래시 명령이 있는 네이티브 명령 모드 (`channels.slack.commands.native: true`)
    - 또는 단일 슬래시 명령 모드 (`channels.slack.slashCommand.enabled: true`)

    또한 `commands.useAccessGroups`와 채널/사용자 허용 목록을 확인하세요.

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Slack 사용자를 게이트웨이에 페어링합니다.
  </Card>
  <Card title="그룹" icon="users" href="/channels/groups">
    채널 및 그룹 DM 동작.
  </Card>
  <Card title="채널 라우팅" icon="route" href="/channels/channel-routing">
    인바운드 메시지를 에이전트로 라우팅합니다.
  </Card>
  <Card title="보안" icon="shield" href="/gateway/security/">
    위협 모델 및 강화.
  </Card>
  <Card title="구성" icon="sliders" href="/gateway/configuration">
    구성 레이아웃 및 우선순위.
  </Card>
  <Card title="슬래시 명령" icon="terminal" href="/tools/slash-commands">
    명령 카탈로그 및 동작.
  </Card>
</CardGroup>
