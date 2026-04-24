---
summary: "채널 구성: Slack, Discord, Telegram, WhatsApp, Matrix, iMessage 등에서의 접근 제어, 페어링, 채널별 키"
read_when:
  - 채널 플러그인 구성 (인증, 접근 제어, 다중 계정)
  - 채널별 config 키 문제 해결
  - DM 정책, 그룹 정책, 또는 언급(mention) 게이팅 감사
title: "구성 — 채널"
---

`channels.*` 아래의 채널별 구성 키입니다. DM 및 그룹 접근, 다중 계정 설정, 언급(mention) 게이팅, 그리고 Slack, Discord, Telegram, WhatsApp, Matrix, iMessage 및 기타 번들 채널 플러그인의 채널별 키를 다룹니다.

에이전트, 툴, 게이트웨이 런타임 및 기타 최상위 키는
[구성 레퍼런스](/gateway/configuration-reference)를 참조하십시오.

## Channels

각 채널은 `enabled: false`가 아닌 한, 해당 config 섹션이 존재할 때 자동으로 시작됩니다.

### DM 및 그룹 접근

모든 채널은 DM 정책과 그룹 정책을 지원합니다:

| DM 정책              | 동작                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `pairing` (기본값)   | 알 수 없는 발신자는 일회용 페어링 코드를 받음; 소유자 승인 필요  |
| `allowlist`          | `allowFrom`에 있는 발신자(또는 페어링된 allow store)만 허용      |
| `open`               | 모든 인바운드 DM 허용 (`allowFrom: ["*"]` 필요)                  |
| `disabled`           | 모든 인바운드 DM 무시                                            |

| 그룹 정책              | 동작                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `allowlist` (기본값)   | 구성된 allowlist와 일치하는 그룹만 허용                         |
| `open`                 | 그룹 allowlist 우회 (mention 게이팅은 여전히 적용됨)            |
| `disabled`             | 모든 그룹/룸 메시지 차단                                        |

<Note>
`channels.defaults.groupPolicy`는 프로바이더의 `groupPolicy`가 설정되지 않았을 때의 기본값을 지정합니다.
페어링 코드는 1시간 후 만료됩니다. 대기 중인 DM 페어링 요청은 **채널당 3개**로 제한됩니다.
프로바이더 블록이 전체적으로 누락된 경우(`channels.<provider>` 부재), 런타임 그룹 정책은 시작 경고와 함께 `allowlist`(fail-closed)로 폴백됩니다.
</Note>

### 채널 모델 오버라이드

특정 채널 ID를 모델에 고정하려면 `channels.modelByChannel`을 사용하십시오. 값은 `provider/model` 또는 구성된 모델 별칭(alias)을 허용합니다. 채널 매핑은 세션에 이미 모델 오버라이드가 없는 경우에 적용됩니다(예: `/model`을 통해 설정).

```json5
{
  channels: {
    modelByChannel: {
      discord: {
        "123456789012345678": "anthropic/claude-opus-4-6",
      },
      slack: {
        C1234567890: "openai/gpt-4.1",
      },
      telegram: {
        "-1001234567890": "openai/gpt-4.1-mini",
        "-1001234567890:topic:99": "anthropic/claude-sonnet-4-6",
      },
    },
  },
}
```

### 채널 기본값 및 하트비트

프로바이더 간에 공유되는 그룹 정책 및 하트비트 동작에는 `channels.defaults`를 사용하십시오:

```json5
{
  channels: {
    defaults: {
      groupPolicy: "allowlist", // open | allowlist | disabled
      contextVisibility: "all", // all | allowlist | allowlist_quote
      heartbeat: {
        showOk: false,
        showAlerts: true,
        useIndicator: true,
      },
    },
  },
}
```

- `channels.defaults.groupPolicy`: 프로바이더 수준 `groupPolicy`가 설정되지 않았을 때의 폴백 그룹 정책.
- `channels.defaults.contextVisibility`: 모든 채널의 기본 보조 컨텍스트 가시성 모드. 값: `all`(기본값, 모든 인용/스레드/히스토리 컨텍스트 포함), `allowlist`(allowlist에 등록된 발신자의 컨텍스트만 포함), `allowlist_quote`(allowlist와 동일하지만 명시적 인용/답글 컨텍스트는 유지). 채널별 오버라이드: `channels.<channel>.contextVisibility`.
- `channels.defaults.heartbeat.showOk`: 정상 채널 상태를 하트비트 출력에 포함.
- `channels.defaults.heartbeat.showAlerts`: 저하/오류 상태를 하트비트 출력에 포함.
- `channels.defaults.heartbeat.useIndicator`: 컴팩트한 인디케이터 스타일의 하트비트 출력을 렌더링.

### WhatsApp

WhatsApp은 게이트웨이의 웹 채널(Baileys Web)을 통해 실행됩니다. 연결된 세션이 존재하면 자동으로 시작됩니다.

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "pairing", // pairing | allowlist | open | disabled
      allowFrom: ["+15555550123", "+447700900123"],
      textChunkLimit: 4000,
      chunkMode: "length", // length | newline
      mediaMaxMb: 50,
      sendReadReceipts: true, // blue ticks (false in self-chat mode)
      groups: {
        "*": { requireMention: true },
      },
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"],
    },
  },
  web: {
    enabled: true,
    heartbeatSeconds: 60,
    reconnect: {
      initialMs: 2000,
      maxMs: 120000,
      factor: 1.4,
      jitter: 0.2,
      maxAttempts: 0,
    },
  },
}
```

<Accordion title="다중 계정 WhatsApp">

```json5
{
  channels: {
    whatsapp: {
      accounts: {
        default: {},
        personal: {},
        biz: {
          // authDir: "~/.openclaw/credentials/whatsapp/biz",
        },
      },
    },
  },
}
```

- 아웃바운드 명령은 `default` 계정이 존재하면 기본으로 사용되며, 그렇지 않으면 정렬된 첫 번째 구성 계정 id가 사용됩니다.
- 선택적 `channels.whatsapp.defaultAccount`는 구성된 계정 id와 일치할 때 해당 폴백 기본 계정 선택을 오버라이드합니다.
- 레거시 단일 계정 Baileys 인증 디렉토리는 `openclaw doctor`에 의해 `whatsapp/default`로 마이그레이션됩니다.
- 계정별 오버라이드: `channels.whatsapp.accounts.<id>.sendReadReceipts`, `channels.whatsapp.accounts.<id>.dmPolicy`, `channels.whatsapp.accounts.<id>.allowFrom`.

</Accordion>

### Telegram

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "your-bot-token",
      dmPolicy: "pairing",
      allowFrom: ["tg:123456789"],
      groups: {
        "*": { requireMention: true },
        "-1001234567890": {
          allowFrom: ["@admin"],
          systemPrompt: "Keep answers brief.",
          topics: {
            "99": {
              requireMention: false,
              skills: ["search"],
              systemPrompt: "Stay on topic.",
            },
          },
        },
      },
      customCommands: [
        { command: "backup", description: "Git backup" },
        { command: "generate", description: "Create an image" },
      ],
      historyLimit: 50,
      replyToMode: "first", // off | first | all | batched
      linkPreview: true,
      streaming: "partial", // off | partial | block | progress (default: off; opt in explicitly to avoid preview-edit rate limits)
      actions: { reactions: true, sendMessage: true },
      reactionNotifications: "own", // off | own | all
      mediaMaxMb: 100,
      retry: {
        attempts: 3,
        minDelayMs: 400,
        maxDelayMs: 30000,
        jitter: 0.1,
      },
      network: {
        autoSelectFamily: true,
        dnsResultOrder: "ipv4first",
      },
      proxy: "socks5://localhost:9050",
      webhookUrl: "https://example.com/telegram-webhook",
      webhookSecret: "secret",
      webhookPath: "/telegram-webhook",
    },
  },
}
```

- 봇 토큰: `channels.telegram.botToken` 또는 `channels.telegram.tokenFile`(일반 파일만; 심볼릭 링크는 거부됨), 기본 계정의 폴백으로 `TELEGRAM_BOT_TOKEN`을 사용합니다.
- 선택적 `channels.telegram.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.
- 다중 계정 설정(2개 이상 계정 id)에서는 폴백 라우팅을 피하기 위해 명시적인 기본값(`channels.telegram.defaultAccount` 또는 `channels.telegram.accounts.default`)을 설정하십시오. `openclaw doctor`는 이것이 누락되거나 유효하지 않을 때 경고를 표시합니다.
- `configWrites: false`는 Telegram에서 시작된 config 쓰기(슈퍼그룹 ID 마이그레이션, `/config set|unset`)를 차단합니다.
- `type: "acp"`를 가진 최상위 `bindings[]` 항목은 포럼 토픽에 대한 영구 ACP 바인딩을 구성합니다(`match.peer.id`에서 정식 `chatId:topic:topicId` 사용). 필드 시맨틱은 [ACP Agents](/tools/acp-agents#channel-specific-settings)에서 공유됩니다.
- Telegram 스트림 프리뷰는 `sendMessage` + `editMessageText`를 사용합니다(다이렉트 및 그룹 채팅에서 작동).
- 재시도 정책: [재시도 정책](/concepts/retry)을 참조하십시오.

### Discord

```json5
{
  channels: {
    discord: {
      enabled: true,
      token: "your-bot-token",
      mediaMaxMb: 100,
      allowBots: false,
      actions: {
        reactions: true,
        stickers: true,
        polls: true,
        permissions: true,
        messages: true,
        threads: true,
        pins: true,
        search: true,
        memberInfo: true,
        roleInfo: true,
        roles: false,
        channelInfo: true,
        voiceStatus: true,
        events: true,
        moderation: false,
      },
      replyToMode: "off", // off | first | all | batched
      dmPolicy: "pairing",
      allowFrom: ["1234567890", "123456789012345678"],
      dm: { enabled: true, groupEnabled: false, groupChannels: ["openclaw-dm"] },
      guilds: {
        "123456789012345678": {
          slug: "friends-of-openclaw",
          requireMention: false,
          ignoreOtherMentions: true,
          reactionNotifications: "own",
          users: ["987654321098765432"],
          channels: {
            general: { allow: true },
            help: {
              allow: true,
              requireMention: true,
              users: ["987654321098765432"],
              skills: ["docs"],
              systemPrompt: "Short answers only.",
            },
          },
        },
      },
      historyLimit: 20,
      textChunkLimit: 2000,
      chunkMode: "length", // length | newline
      streaming: "off", // off | partial | block | progress (progress maps to partial on Discord)
      maxLinesPerMessage: 17,
      ui: {
        components: {
          accentColor: "#5865F2",
        },
      },
      threadBindings: {
        enabled: true,
        idleHours: 24,
        maxAgeHours: 0,
        spawnSubagentSessions: false, // opt-in for sessions_spawn({ thread: true })
      },
      voice: {
        enabled: true,
        autoJoin: [
          {
            guildId: "123456789012345678",
            channelId: "234567890123456789",
          },
        ],
        daveEncryption: true,
        decryptionFailureTolerance: 24,
        tts: {
          provider: "openai",
          openai: { voice: "alloy" },
        },
      },
      execApprovals: {
        enabled: "auto", // true | false | "auto"
        approvers: ["987654321098765432"],
        agentFilter: ["default"],
        sessionFilter: ["discord:"],
        target: "dm", // dm | channel | both
        cleanupAfterResolve: false,
      },
      retry: {
        attempts: 3,
        minDelayMs: 500,
        maxDelayMs: 30000,
        jitter: 0.1,
      },
    },
  },
}
```

- 토큰: `channels.discord.token`, 기본 계정의 폴백으로 `DISCORD_BOT_TOKEN`을 사용합니다.
- 명시적 Discord `token`을 제공하는 직접 아웃바운드 호출은 해당 호출에 그 토큰을 사용합니다. 계정 재시도/정책 설정은 여전히 활성 런타임 스냅샷에서 선택된 계정에서 가져옵니다.
- 선택적 `channels.discord.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.
- 전달 대상에는 `user:<id>`(DM) 또는 `channel:<id>`(길드 채널)를 사용하십시오. 숫자로만 된 id는 거부됩니다.
- 길드 slug는 소문자로, 공백은 `-`로 대체됩니다. 채널 키는 slugged 이름을 사용합니다(`#` 없음). 길드 ID를 선호하십시오.
- 봇이 작성한 메시지는 기본적으로 무시됩니다. `allowBots: true`는 이를 활성화합니다. 봇을 멘션하는 봇 메시지만 수락하려면 `allowBots: "mentions"`를 사용하십시오(자신의 메시지는 여전히 필터링됨).
- `channels.discord.guilds.<id>.ignoreOtherMentions`(및 채널 오버라이드)는 봇이 아닌 다른 사용자나 역할을 멘션하는 메시지를 버립니다(@everyone/@here 제외).
- `maxLinesPerMessage`(기본값 17)는 2000자 미만이더라도 긴 메시지를 분할합니다.
- `channels.discord.threadBindings`는 Discord 스레드 바인딩 라우팅을 제어합니다:
  - `enabled`: 스레드 바인딩 세션 기능(`/focus`, `/unfocus`, `/agents`, `/session idle`, `/session max-age`, 바인딩된 전달/라우팅)에 대한 Discord 오버라이드
  - `idleHours`: 비활성 자동 언포커스를 위한 Discord 오버라이드(시간 단위, `0`은 비활성화)
  - `maxAgeHours`: 하드 최대 수명을 위한 Discord 오버라이드(시간 단위, `0`은 비활성화)
  - `spawnSubagentSessions`: `sessions_spawn({ thread: true })` 자동 스레드 생성/바인딩의 옵트인 스위치
- `type: "acp"`를 가진 최상위 `bindings[]` 항목은 채널 및 스레드에 대한 영구 ACP 바인딩을 구성합니다(`match.peer.id`에서 채널/스레드 id 사용). 필드 시맨틱은 [ACP Agents](/tools/acp-agents#channel-specific-settings)에서 공유됩니다.
- `channels.discord.ui.components.accentColor`는 Discord components v2 컨테이너의 액센트 색상을 설정합니다.
- `channels.discord.voice`는 Discord 음성 채널 대화와 선택적 자동 참가 + TTS 오버라이드를 활성화합니다.
- `channels.discord.voice.daveEncryption`과 `channels.discord.voice.decryptionFailureTolerance`는 `@discordjs/voice` DAVE 옵션으로 전달됩니다(기본값 `true` 및 `24`).
- OpenClaw는 또한 반복되는 복호화 실패 후 음성 세션을 나갔다가 재참가하여 음성 수신 복구를 시도합니다.
- `channels.discord.streaming`은 정식 스트림 모드 키입니다. 레거시 `streamMode` 및 불리언 `streaming` 값은 자동 마이그레이션됩니다.
- `channels.discord.autoPresence`는 런타임 가용성을 봇 프레즌스에 매핑합니다(healthy => online, degraded => idle, exhausted => dnd) 그리고 선택적 상태 텍스트 오버라이드를 허용합니다.
- `channels.discord.dangerouslyAllowNameMatching`은 가변 이름/태그 매칭을 다시 활성화합니다(break-glass 호환성 모드).
- `channels.discord.execApprovals`: Discord 네이티브 exec 승인 전달 및 승인자 인증.
  - `enabled`: `true`, `false`, 또는 `"auto"`(기본값). auto 모드에서는 `approvers` 또는 `commands.ownerAllowFrom`에서 승인자를 해석할 수 있을 때 exec 승인이 활성화됩니다.
  - `approvers`: exec 요청을 승인할 수 있는 Discord 사용자 ID. 생략하면 `commands.ownerAllowFrom`으로 폴백됩니다.
  - `agentFilter`: 선택적 에이전트 ID allowlist. 모든 에이전트의 승인을 전달하려면 생략하십시오.
  - `sessionFilter`: 선택적 세션 키 패턴(부분 문자열 또는 정규식).
  - `target`: 승인 프롬프트를 보낼 위치. `"dm"`(기본값)은 승인자 DM으로 전송, `"channel"`은 원래 채널로 전송, `"both"`는 둘 다로 전송합니다. 대상에 `"channel"`이 포함되면 버튼은 해석된 승인자만 사용할 수 있습니다.
  - `cleanupAfterResolve`: `true`이면, 승인, 거부 또는 타임아웃 후 승인 DM을 삭제합니다.

**반응 알림 모드:** `off`(없음), `own`(봇의 메시지, 기본값), `all`(모든 메시지), `allowlist`(모든 메시지에 대해 `guilds.<id>.users`에서).

### Google Chat

```json5
{
  channels: {
    googlechat: {
      enabled: true,
      serviceAccountFile: "/path/to/service-account.json",
      audienceType: "app-url", // app-url | project-number
      audience: "https://gateway.example.com/googlechat",
      webhookPath: "/googlechat",
      botUser: "users/1234567890",
      dm: {
        enabled: true,
        policy: "pairing",
        allowFrom: ["users/1234567890"],
      },
      groupPolicy: "allowlist",
      groups: {
        "spaces/AAAA": { allow: true, requireMention: true },
      },
      actions: { reactions: true },
      typingIndicator: "message",
      mediaMaxMb: 20,
    },
  },
}
```

- 서비스 계정 JSON: 인라인(`serviceAccount`) 또는 파일 기반(`serviceAccountFile`).
- 서비스 계정 SecretRef도 지원됩니다(`serviceAccountRef`).
- 환경 변수 폴백: `GOOGLE_CHAT_SERVICE_ACCOUNT` 또는 `GOOGLE_CHAT_SERVICE_ACCOUNT_FILE`.
- 전달 대상에는 `spaces/<spaceId>` 또는 `users/<userId>`를 사용하십시오.
- `channels.googlechat.dangerouslyAllowNameMatching`은 가변 이메일 principal 매칭을 다시 활성화합니다(break-glass 호환성 모드).

### Slack

```json5
{
  channels: {
    slack: {
      enabled: true,
      botToken: "xoxb-...",
      appToken: "xapp-...",
      dmPolicy: "pairing",
      allowFrom: ["U123", "U456", "*"],
      dm: { enabled: true, groupEnabled: false, groupChannels: ["G123"] },
      channels: {
        C123: { allow: true, requireMention: true, allowBots: false },
        "#general": {
          allow: true,
          requireMention: true,
          allowBots: false,
          users: ["U123"],
          skills: ["docs"],
          systemPrompt: "Short answers only.",
        },
      },
      historyLimit: 50,
      allowBots: false,
      reactionNotifications: "own",
      reactionAllowlist: ["U123"],
      replyToMode: "off", // off | first | all | batched
      thread: {
        historyScope: "thread", // thread | channel
        inheritParent: false,
      },
      actions: {
        reactions: true,
        messages: true,
        pins: true,
        memberInfo: true,
        emojiList: true,
      },
      slashCommand: {
        enabled: true,
        name: "openclaw",
        sessionPrefix: "slack:slash",
        ephemeral: true,
      },
      typingReaction: "hourglass_flowing_sand",
      textChunkLimit: 4000,
      chunkMode: "length",
      streaming: {
        mode: "partial", // off | partial | block | progress
        nativeTransport: true, // use Slack native streaming API when mode=partial
      },
      mediaMaxMb: 20,
      execApprovals: {
        enabled: "auto", // true | false | "auto"
        approvers: ["U123"],
        agentFilter: ["default"],
        sessionFilter: ["slack:"],
        target: "dm", // dm | channel | both
      },
    },
  },
}
```

- **Socket 모드**는 `botToken`과 `appToken` 모두 필요합니다(기본 계정 환경 변수 폴백을 위해 `SLACK_BOT_TOKEN` + `SLACK_APP_TOKEN`).
- **HTTP 모드**는 `botToken`과 `signingSecret`(루트 또는 계정별)을 필요로 합니다.
- `botToken`, `appToken`, `signingSecret`, `userToken`은 평문 문자열 또는
  SecretRef 객체를 허용합니다.
- Slack 계정 스냅샷은 `botTokenSource`, `botTokenStatus`, `appTokenStatus`와 같은
  자격 증명별 소스/상태 필드를 노출하며, HTTP 모드에서는 `signingSecretStatus`도
  노출합니다. `configured_unavailable`은 계정이 SecretRef를 통해 구성되었지만
  현재 명령/런타임 경로가 시크릿 값을 해석할 수 없음을 의미합니다.
- `configWrites: false`는 Slack에서 시작된 config 쓰기를 차단합니다.
- 선택적 `channels.slack.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.
- `channels.slack.streaming.mode`는 정식 Slack 스트림 모드 키입니다. `channels.slack.streaming.nativeTransport`는 Slack의 네이티브 스트리밍 전송을 제어합니다. 레거시 `streamMode`, 불리언 `streaming`, `nativeStreaming` 값은 자동 마이그레이션됩니다.
- 전달 대상에는 `user:<id>`(DM) 또는 `channel:<id>`를 사용하십시오.

**반응 알림 모드:** `off`, `own`(기본값), `all`, `allowlist`(`reactionAllowlist`에서).

**스레드 세션 격리:** `thread.historyScope`는 스레드별(기본값) 또는 채널 전체에서 공유됩니다. `thread.inheritParent`는 상위 채널 트랜스크립트를 새 스레드로 복사합니다.

- Slack 네이티브 스트리밍과 Slack 어시스턴트 스타일의 "is typing..." 스레드 상태에는 답글 스레드 대상이 필요합니다. 최상위 DM은 기본적으로 스레드 밖에 머무르므로, 스레드 스타일 프리뷰 대신 `typingReaction` 또는 일반 전달을 사용합니다.
- `typingReaction`은 답글이 실행되는 동안 인바운드 Slack 메시지에 임시 반응을 추가한 다음 완료 시 제거합니다. `"hourglass_flowing_sand"`와 같은 Slack 이모지 단축코드를 사용하십시오.
- `channels.slack.execApprovals`: Slack 네이티브 exec 승인 전달 및 승인자 인증. Discord와 동일한 스키마: `enabled`(`true`/`false`/`"auto"`), `approvers`(Slack 사용자 ID), `agentFilter`, `sessionFilter`, `target`(`"dm"`, `"channel"`, 또는 `"both"`).

| 액션 그룹     | 기본값  | 참고                     |
| ------------- | ------- | ------------------------ |
| reactions     | 활성화  | 반응 + 반응 목록         |
| messages      | 활성화  | 읽기/보내기/편집/삭제    |
| pins          | 활성화  | 고정/고정 해제/목록      |
| memberInfo    | 활성화  | 멤버 정보                |
| emojiList     | 활성화  | 커스텀 이모지 목록       |

### Mattermost

Mattermost는 플러그인으로 제공됩니다: `openclaw plugins install @openclaw/mattermost`.

```json5
{
  channels: {
    mattermost: {
      enabled: true,
      botToken: "mm-token",
      baseUrl: "https://chat.example.com",
      dmPolicy: "pairing",
      chatmode: "oncall", // oncall | onmessage | onchar
      oncharPrefixes: [">", "!"],
      groups: {
        "*": { requireMention: true },
        "team-channel-id": { requireMention: false },
      },
      commands: {
        native: true, // opt-in
        nativeSkills: true,
        callbackPath: "/api/channels/mattermost/command",
        // Optional explicit URL for reverse-proxy/public deployments
        callbackUrl: "https://gateway.example.com/api/channels/mattermost/command",
      },
      textChunkLimit: 4000,
      chunkMode: "length",
    },
  },
}
```

채팅 모드: `oncall`(@-멘션 시 응답, 기본값), `onmessage`(모든 메시지), `onchar`(트리거 접두사로 시작하는 메시지).

Mattermost 네이티브 명령이 활성화된 경우:

- `commands.callbackPath`는 전체 URL이 아니라 경로여야 합니다(예: `/api/channels/mattermost/command`).
- `commands.callbackUrl`은 OpenClaw 게이트웨이 엔드포인트로 해석되어야 하며 Mattermost 서버에서 도달 가능해야 합니다.
- 네이티브 슬래시 콜백은 슬래시 명령 등록 시 Mattermost가 반환한 명령별 토큰으로
  인증됩니다. 등록이 실패하거나 활성화된 명령이 없는 경우, OpenClaw는
  `Unauthorized: invalid command token.`으로 콜백을 거부합니다.
- 비공개/테일넷/내부 콜백 호스트의 경우, Mattermost는
  `ServiceSettings.AllowedUntrustedInternalConnections`에 콜백 호스트/도메인이 포함되어야 할 수 있습니다.
  전체 URL이 아닌 호스트/도메인 값을 사용하십시오.
- `channels.mattermost.configWrites`: Mattermost에서 시작된 config 쓰기를 허용하거나 거부합니다.
- `channels.mattermost.requireMention`: 채널에서 답글하기 전에 `@mention`을 요구합니다.
- `channels.mattermost.groups.<channelId>.requireMention`: 채널별 mention 게이팅 오버라이드(기본값은 `"*"`).
- 선택적 `channels.mattermost.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.

### Signal

```json5
{
  channels: {
    signal: {
      enabled: true,
      account: "+15555550123", // optional account binding
      dmPolicy: "pairing",
      allowFrom: ["+15551234567", "uuid:123e4567-e89b-12d3-a456-426614174000"],
      configWrites: true,
      reactionNotifications: "own", // off | own | all | allowlist
      reactionAllowlist: ["+15551234567", "uuid:123e4567-e89b-12d3-a456-426614174000"],
      historyLimit: 50,
    },
  },
}
```

**반응 알림 모드:** `off`, `own`(기본값), `all`, `allowlist`(`reactionAllowlist`에서).

- `channels.signal.account`: 채널 시작을 특정 Signal 계정 신원에 고정합니다.
- `channels.signal.configWrites`: Signal에서 시작된 config 쓰기를 허용하거나 거부합니다.
- 선택적 `channels.signal.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.

### BlueBubbles

BlueBubbles는 권장되는 iMessage 경로입니다(플러그인 기반, `channels.bluebubbles` 아래에 구성됨).

```json5
{
  channels: {
    bluebubbles: {
      enabled: true,
      dmPolicy: "pairing",
      // serverUrl, password, webhookPath, group controls, and advanced actions:
      // see /channels/bluebubbles
    },
  },
}
```

- 여기서 다루는 핵심 키 경로: `channels.bluebubbles`, `channels.bluebubbles.dmPolicy`.
- 선택적 `channels.bluebubbles.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.
- `type: "acp"`를 가진 최상위 `bindings[]` 항목은 BlueBubbles 대화를 영구 ACP 세션에 바인딩할 수 있습니다. `match.peer.id`에서 BlueBubbles 핸들 또는 대상 문자열(`chat_id:*`, `chat_guid:*`, `chat_identifier:*`)을 사용하십시오. 공유 필드 시맨틱: [ACP Agents](/tools/acp-agents#channel-specific-settings).
- BlueBubbles 채널 전체 구성은 [BlueBubbles](/channels/bluebubbles)에 문서화되어 있습니다.

### iMessage

OpenClaw는 `imsg rpc`(stdio 위의 JSON-RPC)를 스폰합니다. 데몬이나 포트가 필요하지 않습니다.

```json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "imsg",
      dbPath: "~/Library/Messages/chat.db",
      remoteHost: "user@gateway-host",
      dmPolicy: "pairing",
      allowFrom: ["+15555550123", "user@example.com", "chat_id:123"],
      historyLimit: 50,
      includeAttachments: false,
      attachmentRoots: ["/Users/*/Library/Messages/Attachments"],
      remoteAttachmentRoots: ["/Users/*/Library/Messages/Attachments"],
      mediaMaxMb: 16,
      service: "auto",
      region: "US",
    },
  },
}
```

- 선택적 `channels.imessage.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.

- Messages DB에 대한 전체 디스크 접근(Full Disk Access)이 필요합니다.
- `chat_id:<id>` 대상을 선호하십시오. 채팅 목록을 보려면 `imsg chats --limit 20`을 사용하십시오.
- `cliPath`는 SSH 래퍼를 가리킬 수 있습니다. SCP 첨부 파일 가져오기를 위해 `remoteHost`(`host` 또는 `user@host`)를 설정하십시오.
- `attachmentRoots` 및 `remoteAttachmentRoots`는 인바운드 첨부 파일 경로를 제한합니다(기본값: `/Users/*/Library/Messages/Attachments`).
- SCP는 엄격한 호스트 키 검사를 사용하므로, 릴레이 호스트 키가 이미 `~/.ssh/known_hosts`에 존재하는지 확인하십시오.
- `channels.imessage.configWrites`: iMessage에서 시작된 config 쓰기를 허용하거나 거부합니다.
- `type: "acp"`를 가진 최상위 `bindings[]` 항목은 iMessage 대화를 영구 ACP 세션에 바인딩할 수 있습니다. `match.peer.id`에서 정규화된 핸들 또는 명시적 채팅 대상(`chat_id:*`, `chat_guid:*`, `chat_identifier:*`)을 사용하십시오. 공유 필드 시맨틱: [ACP Agents](/tools/acp-agents#channel-specific-settings).

<Accordion title="iMessage SSH 래퍼 예시">

```bash
#!/usr/bin/env bash
exec ssh -T gateway-host imsg "$@"
```

</Accordion>

### Matrix

Matrix는 플러그인 기반이며 `channels.matrix` 아래에 구성됩니다.

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_bot_xxx",
      proxy: "http://127.0.0.1:7890",
      encryption: true,
      initialSyncLimit: 20,
      defaultAccount: "ops",
      accounts: {
        ops: {
          name: "Ops",
          userId: "@ops:example.org",
          accessToken: "syt_ops_xxx",
        },
        alerts: {
          userId: "@alerts:example.org",
          password: "secret",
          proxy: "http://127.0.0.1:7891",
        },
      },
    },
  },
}
```

- 토큰 인증은 `accessToken`을 사용합니다. 비밀번호 인증은 `userId` + `password`를 사용합니다.
- `channels.matrix.proxy`는 Matrix HTTP 트래픽을 명시적 HTTP(S) 프록시를 통해 라우팅합니다. 이름이 지정된 계정은 `channels.matrix.accounts.<id>.proxy`로 이를 오버라이드할 수 있습니다.
- `channels.matrix.network.dangerouslyAllowPrivateNetwork`는 비공개/내부 homeserver를 허용합니다. `proxy`와 이 네트워크 옵트인은 독립적인 제어입니다.
- `channels.matrix.defaultAccount`는 다중 계정 설정에서 선호되는 계정을 선택합니다.
- `channels.matrix.autoJoin`은 기본값이 `off`이므로, 초대된 룸과 새 DM 스타일 초대는 `autoJoinAllowlist`와 함께 `autoJoin: "allowlist"`를 설정하거나 `autoJoin: "always"`로 설정할 때까지 무시됩니다.
- `channels.matrix.execApprovals`: Matrix 네이티브 exec 승인 전달 및 승인자 인증.
  - `enabled`: `true`, `false`, 또는 `"auto"`(기본값). auto 모드에서는 `approvers` 또는 `commands.ownerAllowFrom`에서 승인자를 해석할 수 있을 때 exec 승인이 활성화됩니다.
  - `approvers`: exec 요청을 승인할 수 있는 Matrix 사용자 ID(예: `@owner:example.org`).
  - `agentFilter`: 선택적 에이전트 ID allowlist. 모든 에이전트의 승인을 전달하려면 생략하십시오.
  - `sessionFilter`: 선택적 세션 키 패턴(부분 문자열 또는 정규식).
  - `target`: 승인 프롬프트를 보낼 위치. `"dm"`(기본값), `"channel"`(원래 룸), 또는 `"both"`.
  - 계정별 오버라이드: `channels.matrix.accounts.<id>.execApprovals`.
- `channels.matrix.dm.sessionScope`는 Matrix DM이 세션에 그룹화되는 방식을 제어합니다: `per-user`(기본값)는 라우팅된 피어별로 공유하고, `per-room`은 각 DM 룸을 격리합니다.
- Matrix 상태 프로브와 라이브 디렉토리 조회는 런타임 트래픽과 동일한 프록시 정책을 사용합니다.
- Matrix 전체 구성, 타겟팅 규칙, 설정 예시는 [Matrix](/channels/matrix)에 문서화되어 있습니다.

### Microsoft Teams

Microsoft Teams는 플러그인 기반이며 `channels.msteams` 아래에 구성됩니다.

```json5
{
  channels: {
    msteams: {
      enabled: true,
      configWrites: true,
      // appId, appPassword, tenantId, webhook, team/channel policies:
      // see /channels/msteams
    },
  },
}
```

- 여기서 다루는 핵심 키 경로: `channels.msteams`, `channels.msteams.configWrites`.
- Teams 전체 config(자격 증명, webhook, DM/그룹 정책, 팀별/채널별 오버라이드)는 [Microsoft Teams](/channels/msteams)에 문서화되어 있습니다.

### IRC

IRC는 플러그인 기반이며 `channels.irc` 아래에 구성됩니다.

```json5
{
  channels: {
    irc: {
      enabled: true,
      dmPolicy: "pairing",
      configWrites: true,
      nickserv: {
        enabled: true,
        service: "NickServ",
        password: "${IRC_NICKSERV_PASSWORD}",
        register: false,
        registerEmail: "bot@example.com",
      },
    },
  },
}
```

- 여기서 다루는 핵심 키 경로: `channels.irc`, `channels.irc.dmPolicy`, `channels.irc.configWrites`, `channels.irc.nickserv.*`.
- 선택적 `channels.irc.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 오버라이드합니다.
- IRC 채널 전체 구성(host/port/TLS/channels/allowlists/mention 게이팅)은 [IRC](/channels/irc)에 문서화되어 있습니다.

### 다중 계정 (모든 채널)

채널당 여러 계정을 실행합니다(각각 자체 `accountId` 사용):

```json5
{
  channels: {
    telegram: {
      accounts: {
        default: {
          name: "Primary bot",
          botToken: "123456:ABC...",
        },
        alerts: {
          name: "Alerts bot",
          botToken: "987654:XYZ...",
        },
      },
    },
  },
}
```

- `default`는 `accountId`가 생략될 때 사용됩니다(CLI + 라우팅).
- 환경 변수 토큰은 **기본** 계정에만 적용됩니다.
- 기본 채널 설정은 계정별로 오버라이드되지 않는 한 모든 계정에 적용됩니다.
- 각 계정을 다른 에이전트로 라우팅하려면 `bindings[].match.accountId`를 사용하십시오.
- 단일 계정 최상위 채널 config에 있는 상태에서 `openclaw channels add`(또는 채널 온보딩)를 통해 기본이 아닌 계정을 추가하면, OpenClaw는 원래 계정이 계속 작동하도록 계정 범위의 최상위 단일 계정 값을 채널 계정 맵으로 먼저 승격합니다. 대부분의 채널은 이들을 `channels.<channel>.accounts.default`로 이동시키지만, Matrix는 일치하는 기존 named/default 대상을 대신 보존할 수 있습니다.
- 기존 채널 전용 바인딩(`accountId` 없음)은 기본 계정과 계속 일치합니다. 계정 범위 바인딩은 선택 사항으로 유지됩니다.
- `openclaw doctor --fix`도 계정 범위 최상위 단일 계정 값을 해당 채널에 대해 선택된 승격 계정으로 이동시켜 혼합된 형태를 복구합니다. 대부분의 채널은 `accounts.default`를 사용하지만, Matrix는 일치하는 기존 named/default 대상을 대신 보존할 수 있습니다.

### 기타 플러그인 채널

많은 플러그인 채널은 `channels.<id>`로 구성되며 전용 채널 페이지에 문서화되어 있습니다(예: Feishu, Matrix, LINE, Nostr, Zalo, Nextcloud Talk, Synology Chat, Twitch).
전체 채널 인덱스는 [채널](/channels/)을 참조하십시오.

### 그룹 채팅 mention 게이팅

그룹 메시지는 기본적으로 **mention 필요**입니다(메타데이터 mention 또는 안전한 정규식 패턴). WhatsApp, Telegram, Discord, Google Chat 및 iMessage 그룹 채팅에 적용됩니다.

**Mention 유형:**

- **메타데이터 mention**: 네이티브 플랫폼 @-mention. WhatsApp 셀프 채팅 모드에서는 무시됩니다.
- **텍스트 패턴**: `agents.list[].groupChat.mentionPatterns`의 안전한 정규식 패턴. 유효하지 않은 패턴과 안전하지 않은 중첩 반복은 무시됩니다.
- Mention 게이팅은 감지가 가능한 경우에만 적용됩니다(네이티브 mention 또는 최소 하나의 패턴).

```json5
{
  messages: {
    groupChat: { historyLimit: 50 },
  },
  agents: {
    list: [{ id: "main", groupChat: { mentionPatterns: ["@openclaw", "openclaw"] } }],
  },
}
```

`messages.groupChat.historyLimit`은 전역 기본값을 설정합니다. 채널은 `channels.<channel>.historyLimit`(또는 계정별)로 오버라이드할 수 있습니다. 비활성화하려면 `0`으로 설정하십시오.

#### DM 히스토리 제한

```json5
{
  channels: {
    telegram: {
      dmHistoryLimit: 30,
      dms: {
        "123456789": { historyLimit: 50 },
      },
    },
  },
}
```

해석: DM별 오버라이드 → 프로바이더 기본값 → 제한 없음(모두 보관).

지원: `telegram`, `whatsapp`, `discord`, `slack`, `signal`, `imessage`, `msteams`.

#### 셀프 채팅 모드

셀프 채팅 모드를 활성화하려면 `allowFrom`에 자신의 번호를 포함하십시오(네이티브 @-mention 무시, 텍스트 패턴에만 응답):

```json5
{
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } },
    },
  },
  agents: {
    list: [
      {
        id: "main",
        groupChat: { mentionPatterns: ["reisponde", "@openclaw"] },
      },
    ],
  },
}
```

### Commands (채팅 명령 처리)

```json5
{
  commands: {
    native: "auto", // register native commands when supported
    nativeSkills: "auto", // register native skill commands when supported
    text: true, // parse /commands in chat messages
    bash: false, // allow ! (alias: /bash)
    bashForegroundMs: 2000,
    config: false, // allow /config
    mcp: false, // allow /mcp
    plugins: false, // allow /plugins
    debug: false, // allow /debug
    restart: true, // allow /restart + gateway restart tool
    ownerAllowFrom: ["discord:123456789012345678"],
    ownerDisplay: "raw", // raw | hash
    ownerDisplaySecret: "${OWNER_ID_HASH_SECRET}",
    allowFrom: {
      "*": ["user1"],
      discord: ["user:123"],
    },
    useAccessGroups: true,
  },
}
```

<Accordion title="Command 세부 정보">

- 이 블록은 명령 표면을 구성합니다. 현재 내장 + 번들 명령 카탈로그는 [Slash Commands](/tools/slash-commands)를 참조하십시오.
- 이 페이지는 **config 키 레퍼런스**이지 전체 명령 카탈로그가 아닙니다. QQ Bot `/bot-ping` `/bot-help` `/bot-logs`, LINE `/card`, device-pair `/pair`, memory `/dreaming`, phone-control `/phone`, Talk `/voice`와 같은 채널/플러그인 소유 명령은 해당 채널/플러그인 페이지와 [Slash Commands](/tools/slash-commands)에 문서화되어 있습니다.
- 텍스트 명령은 선행 `/`가 있는 **독립** 메시지여야 합니다.
- `native: "auto"`는 Discord/Telegram에 대해 네이티브 명령을 켜고, Slack은 끈 채로 둡니다.
- `nativeSkills: "auto"`는 Discord/Telegram에 대해 네이티브 스킬 명령을 켜고, Slack은 끈 채로 둡니다.
- 채널별 오버라이드: `channels.discord.commands.native`(bool 또는 `"auto"`). `false`는 이전에 등록된 명령을 지웁니다.
- `channels.<provider>.commands.nativeSkills`로 채널별 네이티브 스킬 등록을 오버라이드하십시오.
- `channels.telegram.customCommands`는 Telegram 봇 메뉴 항목을 추가합니다.
- `bash: true`는 호스트 셸에 대해 `! <cmd>`를 활성화합니다. `tools.elevated.enabled`와 `tools.elevated.allowFrom.<channel>`의 발신자가 필요합니다.
- `config: true`는 `/config`를 활성화합니다(`openclaw.json` 읽기/쓰기). 게이트웨이 `chat.send` 클라이언트의 경우, 영구 `/config set|unset` 쓰기는 `operator.admin`도 요구합니다. 읽기 전용 `/config show`는 일반 쓰기 범위 operator 클라이언트에서 계속 사용할 수 있습니다.
- `mcp: true`는 `mcp.servers` 아래의 OpenClaw 관리 MCP 서버 config에 대한 `/mcp`를 활성화합니다.
- `plugins: true`는 플러그인 검색, 설치 및 활성화/비활성화 제어를 위한 `/plugins`를 활성화합니다.
- `channels.<provider>.configWrites`는 채널별 config 변경을 제어합니다(기본값: true).
- 다중 계정 채널의 경우, `channels.<provider>.accounts.<id>.configWrites`도 해당 계정을 대상으로 하는 쓰기를 제어합니다(예: `/allowlist --config --account <id>` 또는 `/config set channels.<provider>.accounts.<id>...`).
- `restart: false`는 `/restart`와 게이트웨이 재시작 툴 액션을 비활성화합니다. 기본값: `true`.
- `ownerAllowFrom`은 소유자 전용 명령/툴에 대한 명시적 소유자 allowlist입니다. `allowFrom`과 별개입니다.
- `ownerDisplay: "hash"`는 시스템 프롬프트에서 소유자 id를 해시합니다. 해싱을 제어하려면 `ownerDisplaySecret`을 설정하십시오.
- `allowFrom`은 프로바이더별입니다. 설정되면 **유일한** 인증 소스입니다(채널 allowlist/페어링 및 `useAccessGroups`는 무시됨).
- `useAccessGroups: false`는 `allowFrom`이 설정되지 않았을 때 명령이 접근 그룹 정책을 우회하도록 허용합니다.
- 명령 문서 맵:
  - 내장 + 번들 카탈로그: [Slash Commands](/tools/slash-commands)
  - 채널별 명령 표면: [채널](/channels/)
  - QQ Bot 명령: [QQ Bot](/channels/qqbot)
  - 페어링 명령: [Pairing](/channels/pairing)
  - LINE card 명령: [LINE](/channels/line)
  - memory dreaming: [Dreaming](/concepts/dreaming)

</Accordion>

---

## 관련

- [구성 레퍼런스](/gateway/configuration-reference) — 최상위 키
- [구성 — 에이전트](/gateway/config-agents)
- [채널 개요](/channels/)
