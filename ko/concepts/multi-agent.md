---
summary: "멀티 에이전트 라우팅: 격리된 에이전트, 채널 계정, 바인딩"
title: 멀티 에이전트 라우팅
read_when: "하나의 게이트웨이 프로세스에서 여러 격리된 에이전트 (워크스페이스 + 인증)를 원하는 경우."
status: active
---

# 멀티 에이전트 라우팅

목표: 하나의 실행 중인 게이트웨이에서 여러 _격리된_ 에이전트 (별도 워크스페이스 + `agentDir` + 세션)와 여러 채널 계정 (예: 두 개의 WhatsApp)을 운영합니다. 인바운드는 바인딩을 통해 에이전트로 라우팅됩니다.

## "하나의 에이전트"란?

**에이전트**는 다음을 각자 가진 완전히 범위가 지정된 뇌입니다:

- **워크스페이스** (파일, AGENTS.md/SOUL.md/USER.md, 로컬 메모, 페르소나 규칙).
- 인증 프로필, 모델 레지스트리, 에이전트별 구성을 위한 **상태 디렉터리** (`agentDir`).
- `~/.openclaw/agents/<agentId>/sessions` 아래의 **세션 저장소** (채팅 히스토리 + 라우팅 상태).

인증 프로필은 **에이전트별**입니다. 각 에이전트는 자체 파일에서 읽습니다:

```text
~/.openclaw/agents/<agentId>/agent/auth-profiles.json
```

`sessions_history`는 여기서도 더 안전한 크로스 세션 회상 경로입니다: 원시 트랜스크립트 덤프가 아닌 제한된 제거된 뷰를 반환합니다. 어시스턴트 회상은 thinking 태그, `<relevant-memories>` 스캐폴딩, 일반 텍스트 도구 호출 XML 페이로드 (`<tool_call>...</tool_call>`, `<function_call>...</function_call>`, `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>`, 잘린 도구 호출 블록 포함), 다운그레이드된 도구 호출 스캐폴딩, 유출된 ASCII/전각 모델 제어 토큰, 잘못된 형식의 MiniMax 도구 호출 XML을 교정/잘라내기 전에 제거합니다.

메인 에이전트 자격 증명은 자동으로 공유되지 **않습니다**. 에이전트 간에 `agentDir`을 재사용하지 마십시오 (인증/세션 충돌이 발생합니다). 자격 증명을 공유하려면 `auth-profiles.json`을 다른 에이전트의 `agentDir`에 복사하십시오.

스킬은 각 에이전트 워크스페이스와 `~/.openclaw/skills`와 같은 공유 루트에서 로드된 다음, 구성된 경우 유효한 에이전트 스킬 허용 목록으로 필터링됩니다. 공유 기준선에는 `agents.defaults.skills`를, 에이전트별 교체에는 `agents.list[].skills`를 사용하십시오. [스킬: 에이전트별 대 공유](/tools/skills#per-agent-vs-shared-skills) 및 [스킬: 에이전트 스킬 허용 목록](/tools/skills#agent-skill-allowlists)을 참조하십시오.

게이트웨이는 **하나의 에이전트** (기본값) 또는 **여러 에이전트**를 나란히 호스팅할 수 있습니다.

**워크스페이스 참고:** 각 에이전트의 워크스페이스는 **기본 cwd**이지 하드 샌드박스가 아닙니다. 상대 경로는 워크스페이스 내부에서 해결되지만, 샌드박싱이 활성화되지 않은 한 절대 경로는 다른 호스트 위치에 도달할 수 있습니다. [샌드박싱](/gateway/sandboxing)을 참조하십시오.

## 경로 (빠른 맵)

- 구성: `~/.openclaw/openclaw.json` (또는 `OPENCLAW_CONFIG_PATH`)
- 상태 디렉터리: `~/.openclaw` (또는 `OPENCLAW_STATE_DIR`)
- 워크스페이스: `~/.openclaw/workspace` (또는 `~/.openclaw/workspace-<agentId>`)
- 에이전트 디렉터리: `~/.openclaw/agents/<agentId>/agent` (또는 `agents.list[].agentDir`)
- 세션: `~/.openclaw/agents/<agentId>/sessions`

### 단일 에이전트 모드 (기본값)

아무것도 하지 않으면 OpenClaw는 단일 에이전트로 실행됩니다:

- `agentId`는 기본값 **`main`**.
- 세션은 `agent:main:<mainKey>`로 키가 지정됩니다.
- 워크스페이스는 기본값 `~/.openclaw/workspace` (또는 `OPENCLAW_PROFILE`이 설정된 경우 `~/.openclaw/workspace-<profile>`).
- 상태는 기본값 `~/.openclaw/agents/main/agent`.

## 에이전트 도우미

에이전트 마법사를 사용하여 새 격리된 에이전트를 추가하십시오:

```bash
openclaw agents add work
```

그런 다음 `bindings`를 추가하거나 (또는 마법사가 하도록) 인바운드 메시지를 라우팅하십시오.

다음으로 확인하십시오:

```bash
openclaw agents list --bindings
```

## 빠른 시작

<Steps>
  <Step title="각 에이전트 워크스페이스 생성">

마법사를 사용하거나 워크스페이스를 수동으로 생성하십시오:

```bash
openclaw agents add coding
openclaw agents add social
```

각 에이전트는 `SOUL.md`, `AGENTS.md`, 선택적 `USER.md`와 함께 자체 워크스페이스를 얻으며, `~/.openclaw/agents/<agentId>` 아래에 전용 `agentDir`과 세션 저장소가 있습니다.

  </Step>

  <Step title="채널 계정 생성">

선호하는 채널에서 에이전트당 하나의 계정을 만드십시오:

- Discord: 에이전트당 하나의 봇, Message Content Intent 활성화, 각 토큰 복사.
- Telegram: BotFather를 통해 에이전트당 하나의 봇, 각 토큰 복사.
- WhatsApp: 계정당 각 전화번호 연결.

```bash
openclaw channels login --channel whatsapp --account work
```

채널 가이드 참조: [Discord](/channels/discord), [Telegram](/channels/telegram), [WhatsApp](/channels/whatsapp).

  </Step>

  <Step title="에이전트, 계정, 바인딩 추가">

`agents.list` 아래에 에이전트를, `channels.<channel>.accounts` 아래에 채널 계정을 추가하고, `bindings`로 연결하십시오 (아래 예시).

  </Step>

  <Step title="재시작 및 확인">

```bash
openclaw gateway restart
openclaw agents list --bindings
openclaw channels status --probe
```

  </Step>
</Steps>

## 여러 에이전트 = 여러 사람, 여러 개성

**여러 에이전트**를 사용하면 각 `agentId`가 **완전히 격리된 페르소나**가 됩니다:

- **다른 전화번호/계정** (채널 `accountId`별).
- **다른 개성** (에이전트별 워크스페이스 파일 `AGENTS.md` 및 `SOUL.md`).
- **별도의 인증 + 세션** (명시적으로 활성화되지 않는 한 크로스 토크 없음).

이를 통해 **여러 사람**이 하나의 게이트웨이 서버를 공유하면서 AI "뇌"와 데이터를 격리된 상태로 유지할 수 있습니다.

## 크로스 에이전트 QMD 메모리 검색

한 에이전트가 다른 에이전트의 QMD 세션 트랜스크립트를 검색해야 하는 경우, `agents.list[].memorySearch.qmd.extraCollections` 아래에 추가 컬렉션을 추가하십시오. 모든 에이전트가 동일한 공유 트랜스크립트 컬렉션을 상속해야 하는 경우에만 `agents.defaults.memorySearch.qmd.extraCollections`를 사용하십시오.

```json5
{
  agents: {
    defaults: {
      workspace: "~/workspaces/main",
      memorySearch: {
        qmd: {
          extraCollections: [{ path: "~/agents/family/sessions", name: "family-sessions" }],
        },
      },
    },
    list: [
      {
        id: "main",
        workspace: "~/workspaces/main",
        memorySearch: {
          qmd: {
            extraCollections: [{ path: "notes" }], // 워크스페이스 내부에서 해결됨 -> 컬렉션 이름 "notes-main"
          },
        },
      },
      { id: "family", workspace: "~/workspaces/family" },
    ],
  },
  memory: {
    backend: "qmd",
    qmd: { includeDefaultMemory: false },
  },
}
```

추가 컬렉션 경로는 에이전트 간에 공유될 수 있지만, 경로가 에이전트 워크스페이스 외부인 경우 컬렉션 이름은 명시적으로 유지됩니다. 워크스페이스 내부 경로는 각 에이전트가 자체 트랜스크립트 검색 세트를 유지하도록 에이전트 범위로 유지됩니다.

## 하나의 WhatsApp 번호, 여러 사람 (DM 분리)

**하나의 WhatsApp 계정**을 유지하면서 **다른 WhatsApp DM**을 다른 에이전트로 라우팅할 수 있습니다. `peer.kind: "direct"`와 함께 발신자 E.164 (예: `+15551234567`)로 매칭하십시오. 응답은 여전히 동일한 WhatsApp 번호에서 옵니다 (에이전트별 발신자 ID 없음).

중요한 세부사항: 직접 채팅은 에이전트의 **메인 세션 키**로 통합되므로, 진정한 격리에는 **사람당 하나의 에이전트**가 필요합니다.

예시:

```json5
{
  agents: {
    list: [
      { id: "alex", workspace: "~/.openclaw/workspace-alex" },
      { id: "mia", workspace: "~/.openclaw/workspace-mia" },
    ],
  },
  bindings: [
    {
      agentId: "alex",
      match: { channel: "whatsapp", peer: { kind: "direct", id: "+15551230001" } },
    },
    {
      agentId: "mia",
      match: { channel: "whatsapp", peer: { kind: "direct", id: "+15551230002" } },
    },
  ],
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551230001", "+15551230002"],
    },
  },
}
```

참고:

- DM 접근 제어는 WhatsApp 계정당 **전역**입니다 (페어링/허용 목록). 에이전트별이 아닙니다.
- 공유 그룹의 경우, 그룹을 하나의 에이전트에 바인딩하거나 [브로드캐스트 그룹](/channels/broadcast-groups)을 사용하십시오.

## 라우팅 규칙 (메시지가 에이전트를 선택하는 방법)

바인딩은 **결정론적**이며 **가장 구체적인 것이 우선**합니다:

1. `peer` 매칭 (정확한 DM/그룹/채널 id)
2. `parentPeer` 매칭 (스레드 상속)
3. `guildId + roles` (Discord 역할 라우팅)
4. `guildId` (Discord)
5. `teamId` (Slack)
6. 채널에 대한 `accountId` 매칭
7. 채널 수준 매칭 (`accountId: "*"`)
8. 기본 에이전트로 폴백 (`agents.list[].default`, 없으면 첫 번째 목록 항목, 기본값: `main`)

같은 티어에서 여러 바인딩이 일치하면 구성 순서의 첫 번째가 우선합니다. 바인딩이 여러 일치 필드를 설정하는 경우 (예: `peer` + `guildId`), 지정된 모든 필드가 필요합니다 (`AND` 의미론).

중요한 계정 범위 세부사항:

- `accountId`를 생략한 바인딩은 기본 계정에만 매칭됩니다.
- 모든 계정에 걸친 채널 전체 폴백에는 `accountId: "*"`를 사용하십시오.
- 나중에 명시적인 계정 id로 동일한 에이전트에 대해 동일한 바인딩을 추가하면, OpenClaw는 기존 채널 전용 바인딩을 중복 생성하는 대신 계정 범위로 업그레이드합니다.

## 여러 계정 / 전화번호

**여러 계정**을 지원하는 채널 (예: WhatsApp)은 `accountId`를 사용하여 각 로그인을 식별합니다. 각 `accountId`는 다른 에이전트로 라우팅될 수 있으므로, 하나의 서버가 세션을 혼합하지 않고 여러 전화번호를 호스팅할 수 있습니다.

`accountId`가 생략된 경우 채널 전체 기본 계정을 원하면 `channels.<channel>.defaultAccount`를 설정하십시오 (선택적). 설정되지 않으면 OpenClaw는 `default`가 있으면 폴백하고, 없으면 첫 번째 구성된 계정 id (정렬됨)로 폴백합니다.

이 패턴을 지원하는 일반적인 채널:

- `whatsapp`, `telegram`, `discord`, `slack`, `signal`, `imessage`
- `irc`, `line`, `googlechat`, `mattermost`, `matrix`, `nextcloud-talk`
- `bluebubbles`, `zalo`, `zalouser`, `nostr`, `feishu`

## 개념

- `agentId`: 하나의 "뇌" (워크스페이스, 에이전트별 인증, 에이전트별 세션 저장소).
- `accountId`: 하나의 채널 계정 인스턴스 (예: WhatsApp 계정 `"personal"` 대 `"biz"`).
- `binding`: 인바운드 메시지를 `(channel, accountId, peer)` 및 선택적으로 guild/team id로 `agentId`에 라우팅합니다.
- 직접 채팅은 `agent:<agentId>:<mainKey>`로 통합됩니다 (에이전트별 "main"; `session.mainKey`).

## 플랫폼 예시

### 에이전트별 Discord 봇

각 Discord 봇 계정은 고유한 `accountId`에 매핑됩니다. 각 계정을 에이전트에 바인딩하고 봇별 허용 목록을 유지하십시오.

```json5
{
  agents: {
    list: [
      { id: "main", workspace: "~/.openclaw/workspace-main" },
      { id: "coding", workspace: "~/.openclaw/workspace-coding" },
    ],
  },
  bindings: [
    { agentId: "main", match: { channel: "discord", accountId: "default" } },
    { agentId: "coding", match: { channel: "discord", accountId: "coding" } },
  ],
  channels: {
    discord: {
      groupPolicy: "allowlist",
      accounts: {
        default: {
          token: "DISCORD_BOT_TOKEN_MAIN",
          guilds: {
            "123456789012345678": {
              channels: {
                "222222222222222222": { allow: true, requireMention: false },
              },
            },
          },
        },
        coding: {
          token: "DISCORD_BOT_TOKEN_CODING",
          guilds: {
            "123456789012345678": {
              channels: {
                "333333333333333333": { allow: true, requireMention: false },
              },
            },
          },
        },
      },
    },
  },
}
```

참고:

- 각 봇을 길드에 초대하고 Message Content Intent를 활성화하십시오.
- 토큰은 `channels.discord.accounts.<id>.token`에 있습니다 (기본 계정은 `DISCORD_BOT_TOKEN`을 사용할 수 있습니다).

### 에이전트별 Telegram 봇

```json5
{
  agents: {
    list: [
      { id: "main", workspace: "~/.openclaw/workspace-main" },
      { id: "alerts", workspace: "~/.openclaw/workspace-alerts" },
    ],
  },
  bindings: [
    { agentId: "main", match: { channel: "telegram", accountId: "default" } },
    { agentId: "alerts", match: { channel: "telegram", accountId: "alerts" } },
  ],
  channels: {
    telegram: {
      accounts: {
        default: {
          botToken: "123456:ABC...",
          dmPolicy: "pairing",
        },
        alerts: {
          botToken: "987654:XYZ...",
          dmPolicy: "allowlist",
          allowFrom: ["tg:123456789"],
        },
      },
    },
  },
}
```

참고:

- BotFather로 에이전트당 하나의 봇을 만들고 각 토큰을 복사하십시오.
- 토큰은 `channels.telegram.accounts.<id>.botToken`에 있습니다 (기본 계정은 `TELEGRAM_BOT_TOKEN`을 사용할 수 있습니다).

### 에이전트별 WhatsApp 번호

게이트웨이를 시작하기 전에 각 계정을 연결하십시오:

```bash
openclaw channels login --channel whatsapp --account personal
openclaw channels login --channel whatsapp --account biz
```

`~/.openclaw/openclaw.json` (JSON5):

```js
{
  agents: {
    list: [
      {
        id: "home",
        default: true,
        name: "Home",
        workspace: "~/.openclaw/workspace-home",
        agentDir: "~/.openclaw/agents/home/agent",
      },
      {
        id: "work",
        name: "Work",
        workspace: "~/.openclaw/workspace-work",
        agentDir: "~/.openclaw/agents/work/agent",
      },
    ],
  },

  // 결정론적 라우팅: 첫 번째 매칭이 우선 (가장 구체적인 것 먼저).
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },

    // 선택적 피어별 오버라이드 (예: 특정 그룹을 work 에이전트로 전송).
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        accountId: "personal",
        peer: { kind: "group", id: "1203630...@g.us" },
      },
    },
  ],

  // 기본적으로 꺼짐: 에이전트 간 메시징은 명시적으로 활성화 + 허용 목록 등록 필요.
  tools: {
    agentToAgent: {
      enabled: false,
      allow: ["home", "work"],
    },
  },

  channels: {
    whatsapp: {
      accounts: {
        personal: {
          // 선택적 오버라이드. 기본값: ~/.openclaw/credentials/whatsapp/personal
          // authDir: "~/.openclaw/credentials/whatsapp/personal",
        },
        biz: {
          // 선택적 오버라이드. 기본값: ~/.openclaw/credentials/whatsapp/biz
          // authDir: "~/.openclaw/credentials/whatsapp/biz",
        },
      },
    },
  },
}
```

## 예시: WhatsApp 일상 채팅 + Telegram 심층 작업

채널로 분리: WhatsApp을 빠른 일상 에이전트로, Telegram을 Opus 에이전트로 라우팅합니다.

```json5
{
  agents: {
    list: [
      {
        id: "chat",
        name: "Everyday",
        workspace: "~/.openclaw/workspace-chat",
        model: "anthropic/claude-sonnet-4-6",
      },
      {
        id: "opus",
        name: "Deep Work",
        workspace: "~/.openclaw/workspace-opus",
        model: "anthropic/claude-opus-4-6",
      },
    ],
  },
  bindings: [
    { agentId: "chat", match: { channel: "whatsapp" } },
    { agentId: "opus", match: { channel: "telegram" } },
  ],
}
```

참고:

- 채널에 여러 계정이 있으면 바인딩에 `accountId`를 추가하십시오 (예: `{ channel: "whatsapp", accountId: "personal" }`).
- 나머지는 chat에 유지하면서 단일 DM/그룹을 Opus로 라우팅하려면 해당 피어에 대한 `match.peer` 바인딩을 추가하십시오. 피어 매칭은 항상 채널 전체 규칙보다 우선합니다.

## 예시: 동일 채널, 하나의 피어를 Opus로

WhatsApp은 빠른 에이전트에 유지하되 하나의 DM을 Opus로 라우팅:

```json5
{
  agents: {
    list: [
      {
        id: "chat",
        name: "Everyday",
        workspace: "~/.openclaw/workspace-chat",
        model: "anthropic/claude-sonnet-4-6",
      },
      {
        id: "opus",
        name: "Deep Work",
        workspace: "~/.openclaw/workspace-opus",
        model: "anthropic/claude-opus-4-6",
      },
    ],
  },
  bindings: [
    {
      agentId: "opus",
      match: { channel: "whatsapp", peer: { kind: "direct", id: "+15551234567" } },
    },
    { agentId: "chat", match: { channel: "whatsapp" } },
  ],
}
```

피어 바인딩이 항상 우선하므로 채널 전체 규칙 위에 유지하십시오.

## WhatsApp 그룹에 바인딩된 가족 에이전트

단일 WhatsApp 그룹에 전용 가족 에이전트를 바인딩하고, 멘션 게이팅 및 더 엄격한 도구 정책을 적용:

```json5
{
  agents: {
    list: [
      {
        id: "family",
        name: "Family",
        workspace: "~/.openclaw/workspace-family",
        identity: { name: "Family Bot" },
        groupChat: {
          mentionPatterns: ["@family", "@familybot", "@Family Bot"],
        },
        sandbox: {
          mode: "all",
          scope: "agent",
        },
        tools: {
          allow: [
            "exec",
            "read",
            "sessions_list",
            "sessions_history",
            "sessions_send",
            "sessions_spawn",
            "session_status",
          ],
          deny: ["write", "edit", "apply_patch", "browser", "canvas", "nodes", "cron"],
        },
      },
    ],
  },
  bindings: [
    {
      agentId: "family",
      match: {
        channel: "whatsapp",
        peer: { kind: "group", id: "120363999999999999@g.us" },
      },
    },
  ],
}
```

참고:

- 도구 허용/거부 목록은 **도구**입니다. 스킬이 아닙니다. 스킬이 바이너리를 실행해야 하는 경우, `exec`가 허용되고 바이너리가 샌드박스에 있는지 확인하십시오.
- 더 엄격한 게이팅을 위해 `agents.list[].groupChat.mentionPatterns`를 설정하고 채널에 대해 그룹 허용 목록을 활성화된 상태로 유지하십시오.

## 에이전트별 샌드박스 및 도구 구성

각 에이전트는 자체 샌드박스 및 도구 제한을 가질 수 있습니다:

```js
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/.openclaw/workspace-personal",
        sandbox: {
          mode: "off",  // 개인 에이전트에 대한 샌드박스 없음
        },
        // 도구 제한 없음 - 모든 도구 사용 가능
      },
      {
        id: "family",
        workspace: "~/.openclaw/workspace-family",
        sandbox: {
          mode: "all",     // 항상 샌드박싱됨
          scope: "agent",  // 에이전트당 하나의 컨테이너
          docker: {
            // 컨테이너 생성 후 선택적 일회성 설정
            setupCommand: "apt-get update && apt-get install -y git curl",
          },
        },
        tools: {
          allow: ["read"],                    // read 도구만
          deny: ["exec", "write", "edit", "apply_patch"],    // 나머지 거부
        },
      },
    ],
  },
}
```

참고: `setupCommand`는 `sandbox.docker` 아래에 있으며 컨테이너 생성 시 한 번 실행됩니다. 해결된 범위가 `"shared"`인 경우 에이전트별 `sandbox.docker.*` 오버라이드는 무시됩니다.

**이점:**

- **보안 격리**: 신뢰할 수 없는 에이전트에 대한 도구 제한
- **리소스 제어**: 특정 에이전트를 샌드박싱하면서 다른 에이전트는 호스트에 유지
- **유연한 정책**: 에이전트별 다른 권한

참고: `tools.elevated`는 **전역**이며 발신자 기반입니다. 에이전트별로 구성할 수 없습니다. 에이전트별 경계가 필요하면 `agents.list[].tools`를 사용하여 `exec`를 거부하십시오. 그룹 타게팅을 위해 `agents.list[].groupChat.mentionPatterns`를 사용하여 @멘션이 의도한 에이전트에 명확하게 매핑되도록 하십시오.

자세한 예시는 [멀티 에이전트 샌드박스 & 도구](/tools/multi-agent-sandbox-tools)를 참조하십시오.

## 관련 항목

- [채널 라우팅](/channels/channel-routing) — 메시지가 에이전트로 라우팅되는 방법
- [서브 에이전트](/tools/subagents) — 백그라운드 에이전트 실행 생성
- [ACP 에이전트](/tools/acp-agents) — 외부 코딩 하네스 실행
- [프레전스](/concepts/presence) — 에이전트 프레전스 및 가용성
- [세션](/concepts/session) — 세션 격리 및 라우팅
