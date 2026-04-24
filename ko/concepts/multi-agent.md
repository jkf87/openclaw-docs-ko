---
summary: "Multi-agent 라우팅: 격리된 agent, 채널 계정, 바인딩"
title: Multi-agent 라우팅
read_when: "하나의 게이트웨이 프로세스 안에서 여러 개의 격리된 agent(워크스페이스 + 인증)를 운영하고 싶을 때."
status: active
---

여러 개의 _격리된_ agent — 각각 고유한 워크스페이스, 상태 디렉터리(`agentDir`), 세션 히스토리를 가짐 — 에 더해 여러 채널 계정(예: 두 개의 WhatsApp)을 실행 중인 하나의 Gateway에서 함께 운영하십시오. 인바운드 메시지는 바인딩(binding)을 통해 올바른 agent로 라우팅됩니다.

여기서 **agent**란 페르소나별로 완전하게 범위가 지정된 스코프를 뜻합니다: 워크스페이스 파일, 인증 프로파일, 모델 레지스트리, 세션 저장소. `agentDir`는 agent별 구성을 `~/.openclaw/agents/<agentId>/` 아래에 보관하는 온디스크 상태 디렉터리입니다. **바인딩(binding)**은 채널 계정(예: Slack 워크스페이스 또는 WhatsApp 번호)을 이들 agent 중 하나에 매핑합니다.

## "하나의 agent"란 무엇인가요?

**agent**는 다음을 각각 가진 완전히 범위가 지정된 두뇌입니다:

- **워크스페이스** (파일, AGENTS.md/SOUL.md/USER.md, 로컬 노트, 페르소나 규칙).
- **상태 디렉터리** (`agentDir`) — 인증 프로파일, 모델 레지스트리, agent별 구성.
- **세션 저장소** (채팅 히스토리 + 라우팅 상태) — `~/.openclaw/agents/<agentId>/sessions` 아래에 저장.

인증 프로파일은 **agent별(per-agent)**로 관리됩니다. 각 agent는 자신만의 다음 파일에서 읽습니다:

```text
~/.openclaw/agents/<agentId>/agent/auth-profiles.json
```

`sessions_history`는 여기서도 더 안전한 세션 간 회상 경로입니다: 원시 트랜스크립트 덤프가 아닌, 경계가 지정되고 정화된 뷰를 반환합니다. 어시스턴트 회상은 redaction/truncation 전에 thinking 태그, `<relevant-memories>` 스캐폴딩, 평문 tool-call XML 페이로드(`<tool_call>...</tool_call>`, `<function_call>...</function_call>`, `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>`, 잘린 tool-call 블록 포함), 다운그레이드된 tool-call 스캐폴딩, 유출된 ASCII/전각 모델 제어 토큰, 그리고 잘못된 형식의 MiniMax tool-call XML을 제거합니다.

메인 agent 자격 증명은 **자동으로 공유되지 않습니다**. 여러 agent 간에 `agentDir`를 절대 재사용하지 마십시오 (인증/세션 충돌을 일으킵니다). 자격 증명을 공유하고 싶다면, `auth-profiles.json`을 다른 agent의 `agentDir`로 복사하십시오.

스킬은 각 agent 워크스페이스와 `~/.openclaw/skills` 같은 공유 루트에서 로드된 다음, 구성되어 있을 때 effective agent skill allowlist로 필터링됩니다. 공유 베이스라인에는 `agents.defaults.skills`를, agent별 치환에는 `agents.list[].skills`를 사용하십시오. [Skills: agent별 vs 공유](/tools/skills#per-agent-vs-shared-skills) 및 [Skills: agent 스킬 allowlist](/tools/skills#agent-skill-allowlists)를 참조하십시오.

Gateway는 **하나의 agent**(기본값)를 호스팅하거나 **여러 agent**를 나란히 호스팅할 수 있습니다.

**워크스페이스 주의사항:** 각 agent의 워크스페이스는 **기본 cwd**이지, 하드 샌드박스가 아닙니다. 상대 경로는 워크스페이스 내부에서 해석되지만, 샌드박싱이 활성화되지 않는 한 절대 경로는 호스트의 다른 위치에 도달할 수 있습니다. [샌드박싱](/gateway/sandboxing)을 참조하십시오.

## 경로 (빠른 지도)

- 구성: `~/.openclaw/openclaw.json` (또는 `OPENCLAW_CONFIG_PATH`)
- 상태 디렉터리: `~/.openclaw` (또는 `OPENCLAW_STATE_DIR`)
- 워크스페이스: `~/.openclaw/workspace` (또는 `~/.openclaw/workspace-<agentId>`)
- Agent 디렉터리: `~/.openclaw/agents/<agentId>/agent` (또는 `agents.list[].agentDir`)
- 세션: `~/.openclaw/agents/<agentId>/sessions`

### 싱글 agent 모드 (기본값)

아무 것도 하지 않으면, OpenClaw는 단일 agent로 실행됩니다:

- `agentId`는 기본적으로 **`main`**입니다.
- 세션은 `agent:main:<mainKey>`로 키가 지정됩니다.
- 워크스페이스는 기본적으로 `~/.openclaw/workspace`(또는 `OPENCLAW_PROFILE`가 설정된 경우 `~/.openclaw/workspace-<profile>`)입니다.
- 상태는 기본적으로 `~/.openclaw/agents/main/agent`입니다.

## Agent 헬퍼

새 격리 agent를 추가하려면 agent 마법사를 사용하십시오:

```bash
openclaw agents add work
```

그런 다음 인바운드 메시지 라우팅을 위해 `bindings`를 추가하십시오 (또는 마법사가 추가하도록 두십시오).

다음으로 확인하십시오:

```bash
openclaw agents list --bindings
```

## 빠른 시작

<Steps>
  <Step title="각 agent 워크스페이스 생성">

마법사를 사용하거나 워크스페이스를 수동으로 생성하십시오:

```bash
openclaw agents add coding
openclaw agents add social
```

각 agent는 `SOUL.md`, `AGENTS.md`, 선택적인 `USER.md`가 포함된 고유 워크스페이스와, `~/.openclaw/agents/<agentId>` 아래의 전용 `agentDir` 및 세션 저장소를 갖게 됩니다.

  </Step>

  <Step title="채널 계정 생성">

원하는 채널에 agent별로 하나씩 계정을 생성하십시오:

- Discord: agent당 봇 하나, Message Content Intent 활성화, 각 토큰 복사.
- Telegram: BotFather로 agent당 봇 하나, 각 토큰 복사.
- WhatsApp: 계정별로 각 전화번호 연결.

```bash
openclaw channels login --channel whatsapp --account work
```

채널 가이드 참조: [Discord](/channels/discord), [Telegram](/channels/telegram), [WhatsApp](/channels/whatsapp).

  </Step>

  <Step title="agent, 계정, 바인딩 추가">

`agents.list` 아래에 agent를, `channels.<channel>.accounts` 아래에 채널 계정을 추가하고, `bindings`로 연결하십시오 (아래 예시 참조).

  </Step>

  <Step title="재시작 및 확인">

```bash
openclaw gateway restart
openclaw agents list --bindings
openclaw channels status --probe
```

  </Step>
</Steps>

## 여러 agent = 여러 사람, 여러 인격

**여러 agent**를 사용하면, 각 `agentId`는 **완전히 격리된 페르소나**가 됩니다:

- **서로 다른 전화번호/계정** (채널별 `accountId`).
- **서로 다른 인격** (`AGENTS.md`, `SOUL.md` 같은 agent별 워크스페이스 파일).
- **분리된 인증 + 세션** (명시적으로 활성화하지 않는 한 상호 간섭 없음).

이를 통해 **여러 사람**이 하나의 Gateway 서버를 공유하면서도 자신의 AI "두뇌"와 데이터는 격리된 상태로 유지할 수 있습니다.

## Agent 간 QMD 메모리 검색

한 agent가 다른 agent의 QMD 세션 트랜스크립트를 검색해야 한다면, `agents.list[].memorySearch.qmd.extraCollections` 아래에 추가 컬렉션을 추가하십시오. 모든 agent가 동일한 공유 트랜스크립트 컬렉션을 상속해야 하는 경우에만 `agents.defaults.memorySearch.qmd.extraCollections`를 사용하십시오.

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
            extraCollections: [{ path: "notes" }], // 워크스페이스 내부에서 해석됨 -> "notes-main" 이름의 컬렉션
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

추가 컬렉션 경로는 agent 간에 공유될 수 있지만, 경로가 agent 워크스페이스 외부에 있을 때는 컬렉션 이름이 명시적으로 유지됩니다. 워크스페이스 내부의 경로는 agent 범위로 유지되어 각 agent가 자신만의 트랜스크립트 검색 세트를 가집니다.

## 하나의 WhatsApp 번호, 여러 사람 (DM 분할)

**하나의 WhatsApp 계정**을 유지하면서 **서로 다른 WhatsApp DM**을 서로 다른 agent로 라우팅할 수 있습니다. `peer.kind: "direct"`와 함께 발신자 E.164(예: `+15551234567`)로 매칭하십시오. 응답은 여전히 동일한 WhatsApp 번호에서 발송됩니다(agent별 발신자 신원은 없음).

중요한 세부사항: 다이렉트 채팅은 agent의 **메인 세션 키**로 축소되므로, 진정한 격리를 위해서는 **사람당 agent 하나**가 필요합니다.

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

- DM 접근 제어는 agent별이 아니라 **WhatsApp 계정별 전역**입니다 (페어링/allowlist).
- 공유 그룹의 경우, 그룹을 하나의 agent에 바인딩하거나 [Broadcast 그룹](/channels/broadcast-groups)을 사용하십시오.

## 라우팅 규칙 (메시지가 agent를 어떻게 선택하는가)

바인딩은 **결정론적(deterministic)**이며 **가장 구체적인 것이 이깁니다**:

1. `peer` 매치 (정확한 DM/그룹/채널 id)
2. `parentPeer` 매치 (스레드 상속)
3. `guildId + roles` (Discord 역할 라우팅)
4. `guildId` (Discord)
5. `teamId` (Slack)
6. 채널에 대한 `accountId` 매치
7. 채널 수준 매치 (`accountId: "*"`)
8. 기본 agent로 폴백 (`agents.list[].default`, 없으면 리스트의 첫 항목, 기본값: `main`)

동일 티어에서 여러 바인딩이 매치되면, 구성 순서상 첫 번째 것이 이깁니다. 바인딩이 여러 매치 필드(예: `peer` + `guildId`)를 설정한 경우, 지정된 모든 필드가 요구됩니다 (`AND` 의미론).

중요한 계정 범위 세부사항:

- `accountId`를 생략하는 바인딩은 기본 계정만 매치합니다.
- 모든 계정에 걸친 채널 전체 폴백에는 `accountId: "*"`를 사용하십시오.
- 나중에 동일 agent에 대해 명시적인 계정 id로 동일한 바인딩을 추가하면, OpenClaw는 기존 채널 전용 바인딩을 중복 생성하는 대신 계정 범위로 업그레이드합니다.

## 여러 계정 / 전화번호

**여러 계정**을 지원하는 채널(예: WhatsApp)은 `accountId`를 사용하여 각 로그인을 식별합니다. 각 `accountId`는 다른 agent로 라우팅될 수 있어, 하나의 서버가 세션을 섞지 않고도 여러 전화번호를 호스팅할 수 있습니다.

`accountId`가 생략될 때 채널 전체 기본 계정을 원한다면, `channels.<channel>.defaultAccount`(선택 사항)를 설정하십시오. 설정되지 않으면, OpenClaw는 존재한다면 `default`로 폴백하고, 그렇지 않으면 첫 번째로 구성된 계정 id(정렬됨)로 폴백합니다.

이 패턴을 지원하는 일반적인 채널은 다음과 같습니다:

- `whatsapp`, `telegram`, `discord`, `slack`, `signal`, `imessage`
- `irc`, `line`, `googlechat`, `mattermost`, `matrix`, `nextcloud-talk`
- `bluebubbles`, `zalo`, `zalouser`, `nostr`, `feishu`

## 개념

- `agentId`: 하나의 "두뇌" (워크스페이스, agent별 인증, agent별 세션 저장소).
- `accountId`: 하나의 채널 계정 인스턴스 (예: WhatsApp 계정 `"personal"` vs `"biz"`).
- `binding`: `(channel, accountId, peer)`와 선택적인 guild/team id로 인바운드 메시지를 `agentId`로 라우팅.
- 다이렉트 채팅은 `agent:<agentId>:<mainKey>`로 축소됩니다 (agent별 "main"; `session.mainKey`).

## 플랫폼 예시

### agent별 Discord 봇

각 Discord 봇 계정은 고유한 `accountId`에 매핑됩니다. 각 계정을 agent에 바인딩하고 봇별로 allowlist를 유지하십시오.

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
- 토큰은 `channels.discord.accounts.<id>.token`에 위치합니다 (기본 계정은 `DISCORD_BOT_TOKEN`을 사용할 수 있음).

### agent별 Telegram 봇

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

- BotFather로 agent당 봇 하나를 생성하고 각 토큰을 복사하십시오.
- 토큰은 `channels.telegram.accounts.<id>.botToken`에 위치합니다 (기본 계정은 `TELEGRAM_BOT_TOKEN`을 사용할 수 있음).

### agent별 WhatsApp 번호

게이트웨이 시작 전에 각 계정을 연결하십시오:

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

  // 결정론적 라우팅: 첫 번째 매치가 이김 (가장 구체적인 것 우선).
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },

    // 선택적 peer별 오버라이드 (예: 특정 그룹을 work agent로 전송).
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        accountId: "personal",
        peer: { kind: "group", id: "1203630...@g.us" },
      },
    },
  ],

  // 기본적으로 꺼짐: agent 간 메시징은 명시적으로 활성화 + allowlist 지정해야 함.
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

## 예시: WhatsApp 일상 대화 + Telegram 딥 워크

채널별로 분할: WhatsApp을 빠른 일상 agent로, Telegram을 Opus agent로 라우팅하십시오.

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

- 채널에 여러 계정이 있다면, 바인딩에 `accountId`를 추가하십시오 (예: `{ channel: "whatsapp", accountId: "personal" }`).
- 나머지는 chat에 유지하면서 단일 DM/그룹을 Opus로 라우팅하려면, 해당 peer에 대한 `match.peer` 바인딩을 추가하십시오; peer 매치는 항상 채널 전체 규칙보다 우선합니다.

## 예시: 동일 채널, 하나의 peer를 Opus로

WhatsApp을 빠른 agent에 유지하되, 한 DM을 Opus로 라우팅하십시오:

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

peer 바인딩은 항상 이기므로, 채널 전체 규칙 위에 배치하십시오.

## WhatsApp 그룹에 바인딩된 Family agent

전용 family agent를 단일 WhatsApp 그룹에 바인딩하되, mention 게이팅과 더 타이트한 도구 정책을 함께 설정하십시오:

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

- 도구 allow/deny 리스트는 스킬이 아니라 **도구(tool)**에 대한 것입니다. 스킬이 바이너리를 실행해야 한다면, `exec`이 허용되어 있고 해당 바이너리가 샌드박스 내에 존재하는지 확인하십시오.
- 더 엄격한 게이팅을 위해서는 `agents.list[].groupChat.mentionPatterns`를 설정하고 해당 채널에 대해 그룹 allowlist를 활성화 상태로 유지하십시오.

## Agent별 샌드박스 및 도구 구성

각 agent는 자신만의 샌드박스 및 도구 제한을 가질 수 있습니다:

```js
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/.openclaw/workspace-personal",
        sandbox: {
          mode: "off",  // personal agent에는 샌드박스 없음
        },
        // 도구 제한 없음 - 모든 도구 사용 가능
      },
      {
        id: "family",
        workspace: "~/.openclaw/workspace-family",
        sandbox: {
          mode: "all",     // 항상 샌드박스 적용
          scope: "agent",  // agent당 컨테이너 하나
          docker: {
            // 컨테이너 생성 후 선택적 일회성 설정
            setupCommand: "apt-get update && apt-get install -y git curl",
          },
        },
        tools: {
          allow: ["read"],                    // read 도구만
          deny: ["exec", "write", "edit", "apply_patch"],    // 나머지는 거부
        },
      },
    ],
  },
}
```

참고: `setupCommand`는 `sandbox.docker` 아래에 위치하며 컨테이너 생성 시 한 번만 실행됩니다. 해석된 scope가 `"shared"`인 경우 agent별 `sandbox.docker.*` 오버라이드는 무시됩니다.

**이점:**

- **보안 격리**: 신뢰할 수 없는 agent에 대해 도구 제한
- **리소스 제어**: 특정 agent는 샌드박스 적용하고 다른 agent는 호스트에서 유지
- **유연한 정책**: agent별로 다른 권한

참고: `tools.elevated`는 **전역**이며 발신자 기반입니다; agent별로 구성할 수 없습니다. agent별 경계가 필요하다면, `agents.list[].tools`를 사용하여 `exec`을 거부하십시오. 그룹 타겟팅을 위해서는 `agents.list[].groupChat.mentionPatterns`를 사용하여 @mention이 의도한 agent에 깔끔하게 매핑되도록 하십시오.

자세한 예시는 [Multi-Agent 샌드박스 & 도구](/tools/multi-agent-sandbox-tools)를 참조하십시오.

## 관련 문서

- [채널 라우팅](/channels/channel-routing) — 메시지가 agent로 라우팅되는 방식
- [Sub-Agent](/tools/subagents) — 백그라운드 agent 실행 스폰
- [ACP Agent](/tools/acp-agents) — 외부 코딩 하네스 실행
- [Presence](/concepts/presence) — agent 프레즌스 및 가용성
- [Session](/concepts/session) — 세션 격리 및 라우팅
