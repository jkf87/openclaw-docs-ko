---
title: "구성 레퍼런스"
description: "핵심 OpenClaw 키, 기본값, 전용 서브시스템 레퍼런스 링크를 위한 게이트웨이 구성 레퍼런스"
---

# 구성 레퍼런스

`~/.openclaw/openclaw.json`에 대한 핵심 구성 레퍼런스입니다. 작업 중심 개요는 [구성](/gateway/configuration)을 참조하십시오.

이 페이지는 주요 OpenClaw 구성 표면을 다루고 서브시스템에 더 깊은 레퍼런스가 있는 경우 링크를 제공합니다. 모든 채널/플러그인 소유 명령 카탈로그나 모든 깊은 메모리/QMD 노브를 한 페이지에 인라인으로 넣으려 하지 **않습니다**.

코드 진실:

- `openclaw config schema`는 번들/플러그인/채널 메타데이터가 가용한 경우 병합된 유효성 검사 및 Control UI에 사용되는 라이브 JSON 스키마를 출력합니다
- `config.schema.lookup`은 드릴다운 툴링을 위한 하나의 경로 범위 스키마 노드를 반환합니다
- `pnpm config:docs:check` / `pnpm config:docs:gen`은 현재 스키마 표면에 대해 config-doc 기준 해시를 검증합니다

전용 심층 레퍼런스:

- `agents.defaults.memorySearch.*`, `memory.qmd.*`, `memory.citations`, `plugins.entries.memory-core.config.dreaming`의 드리밍 구성에 대한 [메모리 구성 레퍼런스](/reference/memory-config)
- 현재 내장 + 번들 명령 카탈로그에 대한 [슬래시 명령](/tools/slash-commands)
- 채널별 명령 표면에 대한 소유 채널/플러그인 페이지

구성 형식은 **JSON5**(주석 + 후행 쉼표 허용)입니다. 모든 필드는 선택적입니다 — 생략 시 OpenClaw는 안전한 기본값을 사용합니다.

---

## 채널

각 채널은 구성 섹션이 존재할 때 자동으로 시작됩니다(`enabled: false`가 아닌 경우).

### DM 및 그룹 접근

모든 채널은 DM 정책과 그룹 정책을 지원합니다:

| DM 정책           | 동작                                                        |
| ------------------- | --------------------------------------------------------------- |
| `pairing` (기본값) | 알 수 없는 발신자는 일회용 페어링 코드를 받고; 소유자가 승인해야 합니다 |
| `allowlist`         | `allowFrom`에 있는 발신자만(또는 페어링된 허용 저장소)             |
| `open`              | 모든 인바운드 DM 허용 (`allowFrom: ["*"]` 필요)             |
| `disabled`          | 모든 인바운드 DM 무시                                          |

| 그룹 정책          | 동작                                               |
| --------------------- | ------------------------------------------------------ |
| `allowlist` (기본값) | 구성된 허용 목록과 일치하는 그룹만          |
| `open`                | 그룹 허용 목록 우회 (언급 게이팅은 여전히 적용) |
| `disabled`            | 모든 그룹/룸 메시지 차단                          |

::: info NOTE
`channels.defaults.groupPolicy`는 프로바이더의 `groupPolicy`가 설정되지 않은 경우 기본값을 설정합니다.
페어링 코드는 1시간 후 만료됩니다. 보류 중인 DM 페어링 요청은 **채널당 3개**로 제한됩니다.
프로바이더 블록이 완전히 없는 경우(`channels.&lt;provider&gt;` 부재), 런타임 그룹 정책은 시작 경고와 함께 `allowlist`(실패 시 닫힘)로 폴백됩니다.
:::


### 채널 모델 재정의

`channels.modelByChannel`을 사용하여 특정 채널 ID를 모델에 고정합니다. 값은 `provider/model` 또는 구성된 모델 별칭을 허용합니다. 채널 매핑은 세션에 이미 모델 재정의가 없는 경우(예: `/model`을 통해 설정) 적용됩니다.

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

프로바이더 간 공유 그룹 정책 및 하트비트 동작에 `channels.defaults`를 사용하십시오:

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

- `channels.defaults.groupPolicy`: 프로바이더 레벨 `groupPolicy`가 설정되지 않은 경우 폴백 그룹 정책.
- `channels.defaults.contextVisibility`: 모든 채널에 대한 기본 보조 컨텍스트 가시성 모드. 값: `all`(기본값, 모든 인용/스레드/기록 컨텍스트 포함), `allowlist`(허용 목록 발신자의 컨텍스트만 포함), `allowlist_quote`(동일하지만 명시적 인용/답장 컨텍스트 유지). 채널별 재정의: `channels.&lt;channel&gt;.contextVisibility`.
- `channels.defaults.heartbeat.showOk`: 하트비트 출력에 정상 채널 상태 포함.
- `channels.defaults.heartbeat.showAlerts`: 하트비트 출력에 저하/오류 상태 포함.
- `channels.defaults.heartbeat.useIndicator`: 간결한 인디케이터 스타일 하트비트 출력 렌더링.

### WhatsApp

WhatsApp은 게이트웨이의 웹 채널(Baileys Web)을 통해 실행됩니다. 연결된 세션이 존재할 때 자동으로 시작됩니다.

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "pairing", // pairing | allowlist | open | disabled
      allowFrom: ["+15555550123", "+447700900123"],
      textChunkLimit: 4000,
      chunkMode: "length", // length | newline
      mediaMaxMb: 50,
      sendReadReceipts: true, // 파란 체크 (자가 채팅 모드에서는 false)
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

::: details 다중 계정 WhatsApp
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

- 아웃바운드 명령은 `default`가 있으면 기본으로 사용하고; 그렇지 않으면 첫 번째 구성된 계정 id(정렬됨)를 사용합니다.
- 선택적 `channels.whatsapp.defaultAccount`는 구성된 계정 id와 일치할 때 해당 폴백 기본 계정 선택을 재정의합니다.
- 레거시 단일 계정 Baileys 인증 디렉토리는 `openclaw doctor`에 의해 `whatsapp/default`로 마이그레이션됩니다.
- 계정별 재정의: `channels.whatsapp.accounts.&lt;id&gt;.sendReadReceipts`, `channels.whatsapp.accounts.&lt;id&gt;.dmPolicy`, `channels.whatsapp.accounts.&lt;id&gt;.allowFrom`.
:::


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
      streaming: "partial", // off | partial | block | progress (기본값: off; 미리보기 편집 속도 제한을 피하려면 명시적으로 opt-in)
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

- 봇 토큰: `channels.telegram.botToken` 또는 `channels.telegram.tokenFile` (일반 파일만; 심볼릭 링크 거부), 기본 계정의 폴백으로 `TELEGRAM_BOT_TOKEN`.
- 선택적 `channels.telegram.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 재정의합니다.
- 다중 계정 설정(2개+ 계정 id)에서는 폴백 라우팅을 피하기 위해 명시적 기본값(`channels.telegram.defaultAccount` 또는 `channels.telegram.accounts.default`)을 설정하십시오; `openclaw doctor`는 이것이 없거나 유효하지 않을 때 경고합니다.
- `configWrites: false`는 Telegram 시작 구성 쓰기(슈퍼그룹 ID 마이그레이션, `/config set|unset`)를 차단합니다.
- `type: "acp"`가 있는 최상위 `bindings[]` 항목은 포럼 주제에 대한 지속적인 ACP 바인딩을 구성합니다(`match.peer.id`에서 표준 `chatId:topic:topicId` 사용). 필드 시맨틱은 [ACP 에이전트](/tools/acp-agents#channel-specific-settings)에서 공유됩니다.
- Telegram 스트림 미리보기는 `sendMessage` + `editMessageText`를 사용합니다(직접 및 그룹 채팅에서 작동).
- 재시도 정책: [재시도 정책](/concepts/retry) 참조.

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
      streaming: "off", // off | partial | block | progress (Discord에서 progress는 partial로 매핑됨)
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
        spawnSubagentSessions: false, // sessions_spawn({ thread: true })를 위한 opt-in
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

- 토큰: `channels.discord.token`, 기본 계정의 폴백으로 `DISCORD_BOT_TOKEN`.
- 명시적 Discord `token`을 제공하는 직접 아웃바운드 호출은 해당 토큰을 호출에 사용합니다; 계정 재시도/정책 설정은 여전히 활성 런타임 스냅샷의 선택된 계정에서 제공됩니다.
- 선택적 `channels.discord.defaultAccount`는 구성된 계정 id와 일치할 때 기본 계정 선택을 재정의합니다.
- 전달 대상에는 `user:&lt;id&gt;`(DM) 또는 `channel:&lt;id&gt;`(길드 채널)을 사용하십시오; 숫자 ID만 있는 것은 거부됩니다.
- 길드 슬러그는 소문자이며 공백은 `-`로 대체됩니다; 채널 키는 슬러그된 이름을 사용합니다(`#` 없음). 길드 ID를 선호합니다.
- 봇 작성 메시지는 기본적으로 무시됩니다. `allowBots: true`는 활성화합니다; 봇 자신의 메시지는 여전히 필터링되고 봇을 언급하는 봇 메시지만 허용하려면 `allowBots: "mentions"`를 사용하십시오.
- `channels.discord.guilds.&lt;id&gt;.ignoreOtherMentions`(및 채널 재정의)는 봇이 아닌 다른 사용자 또는 역할을 언급하는 메시지를 삭제합니다(@everyone/@here 제외).
- `maxLinesPerMessage`(기본값 17)는 2000자 미만이라도 키 큰 메시지를 분할합니다.
- `channels.discord.threadBindings`는 Discord 스레드 바인딩 라우팅을 제어합니다.
- `type: "acp"`가 있는 최상위 `bindings[]` 항목은 채널 및 스레드에 대한 지속적인 ACP 바인딩을 구성합니다.
- `channels.discord.ui.components.accentColor`는 Discord 컴포넌트 v2 컨테이너의 강조 색상을 설정합니다.
- `channels.discord.voice`는 Discord 음성 채널 대화 및 선택적 자동 조인 + TTS 재정의를 활성화합니다.

**반응 알림 모드:** `off`(없음), `own`(봇 메시지, 기본값), `all`(모든 메시지), `allowlist`(모든 메시지의 `guilds.&lt;id&gt;.users`에서).

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
- 전달 대상에는 `spaces/&lt;spaceId&gt;` 또는 `users/&lt;userId&gt;`를 사용하십시오.
- `channels.googlechat.dangerouslyAllowNameMatching`은 변경 가능한 이메일 주요 매칭을 다시 활성화합니다(긴급 호환성 모드).

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
        nativeTransport: true, // mode=partial일 때 Slack 네이티브 스트리밍 API 사용
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

- **소켓 모드**에는 `botToken`과 `appToken` 모두 필요합니다(기본 계정 환경 변수 폴백으로 `SLACK_BOT_TOKEN` + `SLACK_APP_TOKEN`).
- **HTTP 모드**에는 `botToken`과 `signingSecret`(루트 또는 계정별)이 필요합니다.
- `botToken`, `appToken`, `signingSecret`, `userToken`은 일반 텍스트 문자열 또는 SecretRef 객체를 허용합니다.
- `channels.slack.streaming.mode`는 표준 Slack 스트림 모드 키입니다. `channels.slack.streaming.nativeTransport`는 Slack의 네이티브 스트리밍 전송을 제어합니다.
- 전달 대상에는 `user:&lt;id&gt;`(DM) 또는 `channel:&lt;id&gt;`를 사용하십시오.

**반응 알림 모드:** `off`, `own`(기본값), `all`, `allowlist`(`reactionAllowlist`에서).

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
        callbackUrl: "https://gateway.example.com/api/channels/mattermost/command",
      },
      textChunkLimit: 4000,
      chunkMode: "length",
    },
  },
}
```

채팅 모드: `oncall`(@-언급에 응답, 기본값), `onmessage`(모든 메시지), `onchar`(트리거 접두사로 시작하는 메시지).

### Signal

```json5
{
  channels: {
    signal: {
      enabled: true,
      account: "+15555550123",
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

### iMessage

OpenClaw는 `imsg rpc`(stdio를 통한 JSON-RPC)를 생성합니다.

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

### Matrix

Matrix는 확장 프로그램 기반이며 `channels.matrix` 아래에 구성됩니다.

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

### Microsoft Teams

Microsoft Teams는 확장 프로그램 기반이며 `channels.msteams` 아래에 구성됩니다.

```json5
{
  channels: {
    msteams: {
      enabled: true,
      configWrites: true,
      // appId, appPassword, tenantId, webhook, 팀/채널 정책:
      // /channels/msteams 참조
    },
  },
}
```

### IRC

IRC는 확장 프로그램 기반이며 `channels.irc` 아래에 구성됩니다.

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

### 다중 계정 (모든 채널)

채널당 여러 계정 실행 (각자 고유한 `accountId` 포함):

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

- `default`는 `accountId`가 생략된 경우 사용됩니다(CLI + 라우팅).
- 환경 변수 토큰은 **기본** 계정에만 적용됩니다.
- 기본 채널 설정은 계정별로 재정의되지 않는 한 모든 계정에 적용됩니다.
- `bindings[].match.accountId`를 사용하여 각 계정을 다른 에이전트로 라우팅하십시오.

### 그룹 채팅 언급 게이팅

그룹 메시지는 기본적으로 **언급 필요**(메타데이터 언급 또는 안전한 정규식 패턴)입니다. WhatsApp, Telegram, Discord, Google Chat, iMessage 그룹 채팅에 적용됩니다.

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

### 명령 (채팅 명령 처리)

```json5
{
  commands: {
    native: "auto",
    nativeSkills: "auto",
    text: true,
    bash: false,
    bashForegroundMs: 2000,
    config: false,
    mcp: false,
    plugins: false,
    debug: false,
    restart: true,
    ownerAllowFrom: ["discord:123456789012345678"],
    ownerDisplay: "raw",
    ownerDisplaySecret: "${OWNER_ID_HASH_SECRET}",
    allowFrom: {
      "*": ["user1"],
      discord: ["user:123"],
    },
    useAccessGroups: true,
  },
}
```

---

## 에이전트 기본값

### `agents.defaults.workspace`

기본값: `~/.openclaw/workspace`.

### `agents.defaults.model`

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": { alias: "opus" },
        "minimax/MiniMax-M2.7": { alias: "minimax" },
      },
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["minimax/MiniMax-M2.7"],
      },
      imageModel: {
        primary: "openrouter/qwen/qwen-2.5-vl-72b-instruct:free",
        fallbacks: ["openrouter/google/gemini-2.0-flash-vision:free"],
      },
      imageGenerationModel: {
        primary: "openai/gpt-image-1",
        fallbacks: ["google/gemini-3.1-flash-image-preview"],
      },
      videoGenerationModel: {
        primary: "qwen/wan2.6-t2v",
        fallbacks: ["qwen/wan2.6-i2v"],
      },
      pdfModel: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["openai/gpt-5.4-mini"],
      },
      params: { cacheRetention: "long" },
      pdfMaxBytesMb: 10,
      pdfMaxPages: 20,
      thinkingDefault: "low",
      verboseDefault: "off",
      elevatedDefault: "on",
      timeoutSeconds: 600,
      mediaMaxMb: 5,
      contextTokens: 200000,
      maxConcurrent: 3,
    },
  },
}
```

**내장 별칭 단축키** (`agents.defaults.models`에 모델이 있을 때만 적용):

| 별칭               | 모델                                  |
| ------------------- | -------------------------------------- |
| `opus`              | `anthropic/claude-opus-4-6`            |
| `sonnet`            | `anthropic/claude-sonnet-4-6`          |
| `gpt`               | `openai/gpt-5.4`                       |
| `gpt-mini`          | `openai/gpt-5.4-mini`                  |
| `gpt-nano`          | `openai/gpt-5.4-nano`                  |
| `gemini`            | `google/gemini-3.1-pro-preview`        |
| `gemini-flash`      | `google/gemini-3-flash-preview`        |
| `gemini-flash-lite` | `google/gemini-3.1-flash-lite-preview` |

구성된 별칭은 항상 기본값보다 우선합니다.

### `agents.defaults.heartbeat`

주기적 하트비트 실행.

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        model: "openai/gpt-5.4-mini",
        includeReasoning: false,
        includeSystemPromptSection: true,
        lightContext: false,
        isolatedSession: false,
        session: "main",
        to: "+15555550123",
        directPolicy: "allow",
        target: "none",
        prompt: "Read HEARTBEAT.md if it exists...",
        ackMaxChars: 300,
        suppressToolErrorWarnings: false,
      },
    },
  },
}
```

### `agents.defaults.compaction`

```json5
{
  agents: {
    defaults: {
      compaction: {
        mode: "safeguard",
        provider: "my-provider",
        timeoutSeconds: 900,
        reserveTokensFloor: 24000,
        identifierPolicy: "strict",
        identifierInstructions: "Preserve deployment IDs, ticket IDs, and host:port pairs exactly.",
        postCompactionSections: ["Session Startup", "Red Lines"],
        model: "openrouter/anthropic/claude-sonnet-4-6",
        notifyUser: true,
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 6000,
          systemPrompt: "Session nearing compaction. Store durable memories now.",
          prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with the exact silent token NO_REPLY if nothing to store.",
        },
      },
    },
  },
}
```

### `agents.defaults.contextPruning`

LLM으로 보내기 전에 인메모리 컨텍스트에서 **오래된 툴 결과**를 정리합니다.

```json5
{
  agents: {
    defaults: {
      contextPruning: {
        mode: "cache-ttl",
        ttl: "1h",
        keepLastAssistants: 3,
        softTrimRatio: 0.3,
        hardClearRatio: 0.5,
        minPrunableToolChars: 50000,
        softTrim: { maxChars: 4000, headChars: 1500, tailChars: 1500 },
        hardClear: { enabled: true, placeholder: "[Old tool result content cleared]" },
        tools: { deny: ["browser", "canvas"] },
      },
    },
  },
}
```

### `agents.list` (에이전트별 재정의)

```json5
{
  agents: {
    list: [
      {
        id: "main",
        default: true,
        name: "Main Agent",
        workspace: "~/.openclaw/workspace",
        agentDir: "~/.openclaw/agents/main/agent",
        model: "anthropic/claude-opus-4-6",
        thinkingDefault: "high",
        reasoningDefault: "on",
        fastModeDefault: false,
        params: { cacheRetention: "none" },
        skills: ["docs-search"],
        identity: {
          name: "Samantha",
          theme: "helpful sloth",
          emoji: "🦥",
          avatar: "avatars/samantha.png",
        },
        groupChat: { mentionPatterns: ["@openclaw"] },
        sandbox: { mode: "off" },
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace/openclaw",
          },
        },
        subagents: { allowAgents: ["*"] },
        tools: {
          profile: "coding",
          allow: ["browser"],
          deny: ["canvas"],
          elevated: { enabled: true },
        },
      },
    ],
  },
}
```

---

## 다중 에이전트 라우팅

하나의 게이트웨이 내에서 여러 격리된 에이전트 실행. [다중 에이전트](/concepts/multi-agent) 참조.

```json5
{
  agents: {
    list: [
      { id: "home", default: true, workspace: "~/.openclaw/workspace-home" },
      { id: "work", workspace: "~/.openclaw/workspace-work" },
    ],
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },
  ],
}
```

---

## 세션

```json5
{
  session: {
    scope: "per-sender",
    dmScope: "main",
    identityLinks: {
      alice: ["telegram:123456789", "discord:987654321012345678"],
    },
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 60,
    },
    resetByType: {
      thread: { mode: "daily", atHour: 4 },
      direct: { mode: "idle", idleMinutes: 240 },
      group: { mode: "idle", idleMinutes: 120 },
    },
    resetTriggers: ["/new", "/reset"],
    store: "~/.openclaw/agents/{agentId}/sessions/sessions.json",
    parentForkMaxTokens: 100000,
    maintenance: {
      mode: "warn",
      pruneAfter: "30d",
      maxEntries: 500,
      rotateBytes: "10mb",
      resetArchiveRetention: "30d",
      maxDiskBytes: "500mb",
      highWaterBytes: "400mb",
    },
    threadBindings: {
      enabled: true,
      idleHours: 24,
      maxAgeHours: 0,
    },
    mainKey: "main",
    agentToAgent: { maxPingPongTurns: 5 },
    sendPolicy: {
      rules: [{ action: "deny", match: { channel: "discord", chatType: "group" } }],
      default: "allow",
    },
  },
}
```

---

## 메시지

```json5
{
  messages: {
    responsePrefix: "🦞",
    ackReaction: "👀",
    ackReactionScope: "group-mentions",
    removeAckAfterReply: false,
    queue: {
      mode: "collect",
      debounceMs: 1000,
      cap: 20,
      drop: "summarize",
      byChannel: {
        whatsapp: "collect",
        telegram: "collect",
      },
    },
    inbound: {
      debounceMs: 2000,
      byChannel: {
        whatsapp: 5000,
        slack: 1500,
      },
    },
  },
}
```

---

## 툴

### 툴 프로파일

`tools.profile`은 `tools.allow`/`tools.deny` 전에 기본 허용 목록을 설정합니다:

| 프로파일     | 포함                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `minimal`   | `session_status`만                                                                                                           |
| `coding`    | `group:fs`, `group:runtime`, `group:web`, `group:sessions`, `group:memory`, `cron`, `image`, `image_generate`, `video_generate` |
| `messaging` | `group:messaging`, `sessions_list`, `sessions_history`, `sessions_send`, `session_status`                                       |
| `full`      | 제한 없음 (미설정과 동일)                                                                                                  |

### 툴 그룹

| 그룹              | 툴                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `group:runtime`    | `exec`, `process`, `code_execution`                                                                                         |
| `group:fs`         | `read`, `write`, `edit`, `apply_patch`                                                                                  |
| `group:sessions`   | `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `sessions_yield`, `subagents`, `session_status` |
| `group:memory`     | `memory_search`, `memory_get`                                                                                           |
| `group:web`        | `web_search`, `x_search`, `web_fetch`                                                                                   |
| `group:ui`         | `browser`, `canvas`                                                                                                     |
| `group:automation` | `cron`, `gateway`                                                                                                       |
| `group:messaging`  | `message`                                                                                                               |
| `group:nodes`      | `nodes`                                                                                                                 |
| `group:agents`     | `agents_list`                                                                                                           |
| `group:media`      | `image`, `image_generate`, `video_generate`, `tts`                                                                      |
| `group:openclaw`   | 모든 내장 툴 (프로바이더 플러그인 제외)                                                                          |

### `tools.elevated`

샌드박스 외부의 elevated exec 접근 제어:

```json5
{
  tools: {
    elevated: {
      enabled: true,
      allowFrom: {
        whatsapp: ["+15555550123"],
        discord: ["1234567890123", "987654321098765432"],
      },
    },
  },
}
```

### `tools.exec`

```json5
{
  tools: {
    exec: {
      backgroundMs: 10000,
      timeoutSec: 1800,
      cleanupMs: 1800000,
      notifyOnExit: true,
      notifyOnExitEmptySuccess: false,
      applyPatch: {
        enabled: false,
        allowModels: ["gpt-5.4"],
      },
    },
  },
}
```

---

## 사용자 정의 프로바이더 및 기본 URL

```json5
{
  models: {
    mode: "merge",
    providers: {
      "custom-proxy": {
        baseUrl: "http://localhost:4000/v1",
        apiKey: "LITELLM_KEY",
        api: "openai-completions",
        models: [
          {
            id: "llama-3.1-8b",
            name: "Llama 3.1 8B",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            contextTokens: 96000,
            maxTokens: 32000,
          },
        ],
      },
    },
  },
}
```

---

## 스킬

```json5
{
  skills: {
    allowBundled: ["gemini", "peekaboo"],
    load: {
      extraDirs: ["~/Projects/agent-scripts/skills"],
    },
    install: {
      preferBrew: true,
      nodeManager: "npm",
    },
    entries: {
      "image-lab": {
        apiKey: { source: "env", provider: "default", id: "GEMINI_API_KEY" },
        env: { GEMINI_API_KEY: "GEMINI_KEY_HERE" },
      },
      peekaboo: { enabled: true },
      sag: { enabled: false },
    },
  },
}
```

---

## 플러그인

```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: [],
    load: {
      paths: ["~/Projects/oss/voice-call-extension"],
    },
    entries: {
      "voice-call": {
        enabled: true,
        hooks: {
          allowPromptInjection: false,
        },
        config: { provider: "twilio" },
      },
    },
  },
}
```

---

## 게이트웨이

```json5
{
  gateway: {
    mode: "local",
    port: 18789,
    bind: "loopback",
    auth: {
      mode: "token",
      token: "your-token",
      allowTailscale: true,
      rateLimit: {
        maxAttempts: 10,
        windowMs: 60000,
        lockoutMs: 300000,
        exemptLoopback: true,
      },
    },
    tailscale: {
      mode: "off",
      resetOnExit: false,
    },
    controlUi: {
      enabled: true,
      basePath: "/openclaw",
    },
    remote: {
      url: "ws://gateway.tailnet:18789",
      transport: "ssh",
      token: "your-token",
    },
    trustedProxies: ["10.0.0.1"],
    allowRealIpFallback: false,
    tools: {
      deny: ["browser"],
      allow: ["gateway"],
    },
  },
}
```

### OpenAI 호환 엔드포인트

- Chat Completions: 기본적으로 비활성화됩니다. `gateway.http.endpoints.chatCompletions.enabled: true`로 활성화하십시오.
- Responses API: `gateway.http.endpoints.responses.enabled`.

### `gateway.tls`

```json5
{
  gateway: {
    tls: {
      enabled: false,
      autoGenerate: false,
      certPath: "/etc/openclaw/tls/server.crt",
      keyPath: "/etc/openclaw/tls/server.key",
      caPath: "/etc/openclaw/tls/ca-bundle.crt",
    },
  },
}
```

### `gateway.reload`

```json5
{
  gateway: {
    reload: {
      mode: "hybrid",
      debounceMs: 500,
      deferralTimeoutMs: 300000,
    },
  },
}
```

---

## 훅

```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
    maxBodyBytes: 262144,
    defaultSessionKey: "hook:ingress",
    allowRequestSessionKey: false,
    allowedSessionKeyPrefixes: ["hook:"],
    allowedAgentIds: ["hooks", "main"],
    presets: ["gmail"],
    transformsDir: "~/.openclaw/hooks/transforms",
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        agentId: "hooks",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:{{messages[0].id}}",
        messageTemplate: "From: {{messages[0].from}}\nSubject: {{messages[0].subject}}\n{{messages[0].snippet}}",
        deliver: true,
        channel: "last",
        model: "openai/gpt-5.4-mini",
      },
    ],
  },
}
```

---

## 로깅

```json5
{
  logging: {
    level: "info",
    file: "/tmp/openclaw/openclaw.log",
    consoleLevel: "info",
    consoleStyle: "pretty",
    redactSensitive: "tools",
    redactPatterns: ["\\bTOKEN\\b\\s*[=:]\\s*([\"']?)([^\\s\"']+)\\1"],
  },
}
```

---

## 진단

```json5
{
  diagnostics: {
    enabled: true,
    flags: ["telegram.*"],
    stuckSessionWarnMs: 30000,
    otel: {
      enabled: false,
      endpoint: "https://otel-collector.example.com:4318",
      protocol: "http/protobuf",
      headers: { "x-tenant-id": "my-org" },
      serviceName: "openclaw-gateway",
      traces: true,
      metrics: true,
      logs: false,
      sampleRate: 1.0,
      flushIntervalMs: 5000,
    },
    cacheTrace: {
      enabled: false,
      filePath: "~/.openclaw/logs/cache-trace.jsonl",
      includeMessages: true,
      includePrompt: true,
      includeSystem: true,
    },
  },
}
```

---

## 업데이트

```json5
{
  update: {
    channel: "stable",
    checkOnStart: true,
    auto: {
      enabled: false,
      stableDelayHours: 6,
      stableJitterHours: 12,
      betaCheckIntervalHours: 1,
    },
  },
}
```

---

## Cron

```json5
{
  cron: {
    enabled: true,
    maxConcurrentRuns: 2,
    sessionRetention: "24h",
    runLog: {
      maxBytes: "2mb",
      keepLines: 2000,
    },
  },
}
```

---

## 미디어 모델 템플릿 변수

`tools.media.models[].args`에서 확장되는 템플릿 플레이스홀더:

| 변수           | 설명                                       |
| ------------------ | ------------------------------------------------- |
| `{{Body}}`         | 전체 인바운드 메시지 본문                         |
| `{{RawBody}}`      | 원시 본문 (기록/발신자 래퍼 없음)             |
| `{{BodyStripped}}` | 그룹 언급이 제거된 본문                 |
| `{{From}}`         | 발신자 식별자                                 |
| `{{To}}`           | 대상 식별자                                 |
| `{{MessageSid}}`   | 채널 메시지 id                                |
| `{{SessionId}}`    | 현재 세션 UUID                              |
| `{{IsNewSession}}` | 새 세션 생성 시 `"true"`                 |
| `{{MediaUrl}}`     | 인바운드 미디어 의사-URL                          |
| `{{MediaPath}}`    | 로컬 미디어 경로                                  |
| `{{MediaType}}`    | 미디어 유형 (image/audio/document/…)               |
| `{{Transcript}}`   | 오디오 기록                                  |
| `{{Prompt}}`       | CLI 항목에 대한 해석된 미디어 프롬프트             |
| `{{MaxChars}}`     | CLI 항목에 대한 해석된 최대 출력 문자         |
| `{{ChatType}}`     | `"direct"` 또는 `"group"`                           |
| `{{GroupSubject}}` | 그룹 주제 (최선 노력)                       |
| `{{GroupMembers}}` | 그룹 구성원 미리보기 (최선 노력)               |
| `{{SenderName}}`   | 발신자 표시 이름 (최선 노력)                 |
| `{{SenderE164}}`   | 발신자 전화번호 (최선 노력)                 |
| `{{Provider}}`     | 프로바이더 힌트 (whatsapp, telegram, discord 등) |

---

## 구성 포함 (`$include`)

구성을 여러 파일로 분할:

```json5
// ~/.openclaw/openclaw.json
{
  gateway: { port: 18789 },
  agents: { $include: "./agents.json5" },
  broadcast: {
    $include: ["./clients/mueller.json5", "./clients/schmidt.json5"],
  },
}
```

**병합 동작:**

- 단일 파일: 포함하는 객체를 대체합니다.
- 파일 배열: 순서대로 깊이 병합됩니다(나중 것이 이전 것을 재정의).
- 형제 키: 포함 후 병합됩니다(포함된 값을 재정의).
- 중첩 포함: 최대 10레벨 깊이.

---

_관련: [구성](/gateway/configuration) · [구성 예시](/gateway/configuration-examples) · [Doctor](/gateway/doctor)_
