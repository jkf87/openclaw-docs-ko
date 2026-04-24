---
summary: "Discord 봇 지원 상태, 기능 및 구성"
read_when:
  - Discord 채널 기능 작업 시
title: "Discord"
sidebarTitle: "Discord"
---

공식 Discord gateway를 통해 DM 및 guild 채널에서 사용할 준비가 되어 있습니다.

<CardGroup cols={3}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Discord DM은 기본적으로 페어링 모드입니다.
  </Card>
  <Card title="슬래시 명령" icon="terminal" href="/tools/slash-commands">
    네이티브 명령 동작 및 명령 카탈로그.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 흐름.
  </Card>
</CardGroup>

## 빠른 설정

봇이 포함된 새 애플리케이션을 생성하고, 봇을 서버에 추가한 다음, OpenClaw에 페어링해야 합니다. 봇은 본인의 프라이빗 서버에 추가하는 것을 권장합니다. 아직 프라이빗 서버가 없다면 [먼저 생성](https://support.discord.com/hc/en-us/articles/204849977-How-do-I-create-a-server)하십시오 (**Create My Own > For me and my friends** 선택).

<Steps>
  <Step title="Discord 애플리케이션 및 봇 생성">
    [Discord Developer Portal](https://discord.com/developers/applications)로 이동하여 **New Application**을 클릭합니다. "OpenClaw"와 같은 이름을 지정합니다.

    사이드바의 **Bot**을 클릭합니다. **Username**을 OpenClaw 에이전트 이름으로 설정합니다.

  </Step>

  <Step title="권한 있는 intent 활성화">
    **Bot** 페이지에서 아래로 스크롤하여 **Privileged Gateway Intents**로 이동한 뒤 다음을 활성화합니다:

    - **Message Content Intent** (필수)
    - **Server Members Intent** (권장; 역할 허용 목록 및 이름-ID 매칭에 필요)
    - **Presence Intent** (선택 사항; presence 업데이트에만 필요)

  </Step>

  <Step title="봇 토큰 복사">
    **Bot** 페이지 상단으로 다시 스크롤하고 **Reset Token**을 클릭합니다.

    <Note>
    이름과 달리, 이는 첫 번째 토큰을 생성하는 것입니다 — "리셋"되는 것은 없습니다.
    </Note>

    토큰을 복사하여 어딘가에 저장하십시오. 이는 **Bot Token**이며 곧 필요합니다.

  </Step>

  <Step title="초대 URL 생성 및 봇을 서버에 추가">
    사이드바의 **OAuth2**를 클릭합니다. 봇을 서버에 추가할 적절한 권한이 포함된 초대 URL을 생성합니다.

    **OAuth2 URL Generator**로 스크롤하여 다음을 활성화합니다:

    - `bot`
    - `applications.commands`

    아래에 **Bot Permissions** 섹션이 나타납니다. 최소한 다음을 활성화합니다:

    **General Permissions**
      - View Channels
    **Text Permissions**
      - Send Messages
      - Read Message History
      - Embed Links
      - Attach Files
      - Add Reactions (선택 사항)

    이는 일반 텍스트 채널의 기준 세트입니다. 스레드를 생성하거나 이어가는 forum 또는 media 채널 워크플로를 포함하여 Discord 스레드에 게시할 계획이라면, **Send Messages in Threads**도 활성화하십시오.
    맨 아래에서 생성된 URL을 복사하고 브라우저에 붙여넣어 서버를 선택한 뒤 **Continue**를 클릭하여 연결합니다. 이제 Discord 서버에서 봇이 보여야 합니다.

  </Step>

  <Step title="Developer Mode 활성화 및 ID 수집">
    다시 Discord 앱으로 돌아가서, 내부 ID를 복사할 수 있도록 Developer Mode를 활성화해야 합니다.

    1. **User Settings** (아바타 옆 톱니바퀴 아이콘) 클릭 → **Advanced** → **Developer Mode** 토글 켜기
    2. 사이드바에서 **서버 아이콘** 우클릭 → **Copy Server ID**
    3. **내 아바타** 우클릭 → **Copy User ID**

    **Server ID**와 **User ID**를 Bot Token과 함께 저장하십시오 — 다음 단계에서 세 가지 모두 OpenClaw에 전달합니다.

  </Step>

  <Step title="서버 멤버의 DM 허용">
    페어링이 작동하려면 Discord가 봇이 사용자에게 DM을 보낼 수 있도록 허용해야 합니다. **서버 아이콘** 우클릭 → **Privacy Settings** → **Direct Messages** 토글 켜기.

    이를 통해 서버 멤버(봇 포함)가 DM을 보낼 수 있습니다. OpenClaw와 Discord DM을 사용하려면 이 설정을 유지하십시오. guild 채널만 사용할 계획이라면 페어링 후 DM을 비활성화할 수 있습니다.

  </Step>

  <Step title="봇 토큰을 안전하게 설정 (채팅에서 전송하지 말 것)">
    Discord 봇 토큰은 비밀(비밀번호와 같음)입니다. 에이전트에 메시지를 보내기 전에 OpenClaw를 실행하는 머신에 설정하십시오.

```bash
export DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN"
openclaw config set channels.discord.token --ref-provider default --ref-source env --ref-id DISCORD_BOT_TOKEN --dry-run
openclaw config set channels.discord.token --ref-provider default --ref-source env --ref-id DISCORD_BOT_TOKEN
openclaw config set channels.discord.enabled true --strict-json
openclaw gateway
```

    OpenClaw가 이미 백그라운드 서비스로 실행 중이라면, OpenClaw Mac 앱을 통해 또는 `openclaw gateway run` 프로세스를 중지하고 재시작하여 재시작하십시오.

  </Step>

  <Step title="OpenClaw 구성 및 페어링">

    <Tabs>
      <Tab title="에이전트에게 요청">
        기존 채널(예: Telegram)에서 OpenClaw 에이전트와 대화하여 알려주십시오. Discord가 첫 번째 채널이라면 CLI / config 탭을 사용하십시오.

        > "설정에 Discord 봇 토큰을 이미 설정했습니다. User ID `<user_id>`와 Server ID `<server_id>`로 Discord 설정을 마무리해 주세요."
      </Tab>
      <Tab title="CLI / config">
        파일 기반 구성을 선호하는 경우 다음을 설정하십시오:

```json5
{
  channels: {
    discord: {
      enabled: true,
      token: {
        source: "env",
        provider: "default",
        id: "DISCORD_BOT_TOKEN",
      },
    },
  },
}
```

        기본 계정의 환경 변수 폴백:

```bash
DISCORD_BOT_TOKEN=...
```

        일반 텍스트 `token` 값이 지원됩니다. `channels.discord.token`에 대해 env/file/exec provider 전반에서 SecretRef 값도 지원됩니다. [비밀 관리](/gateway/secrets)를 참조하십시오.

      </Tab>
    </Tabs>

  </Step>

  <Step title="첫 DM 페어링 승인">
    gateway가 실행될 때까지 기다린 다음 Discord에서 봇에게 DM을 보내십시오. 봇은 페어링 코드로 응답합니다.

    <Tabs>
      <Tab title="에이전트에게 요청">
        기존 채널에서 에이전트에게 페어링 코드를 전송하십시오:

        > "이 Discord 페어링 코드를 승인해 주세요: `<CODE>`"
      </Tab>
      <Tab title="CLI">

```bash
openclaw pairing list discord
openclaw pairing approve discord <CODE>
```

      </Tab>
    </Tabs>

    페어링 코드는 1시간 후 만료됩니다.

    이제 DM을 통해 Discord에서 에이전트와 대화할 수 있어야 합니다.

  </Step>
</Steps>

<Note>
토큰 확인은 계정을 고려합니다. 구성 토큰 값이 환경 변수 폴백보다 우선합니다. `DISCORD_BOT_TOKEN`은 기본 계정에만 사용됩니다.
고급 아웃바운드 호출(message tool/채널 액션)의 경우, 해당 호출에는 명시적 호출별 `token`이 사용됩니다. 이는 send 및 read/probe 스타일 액션(예: read/search/fetch/thread/pins/permissions)에 적용됩니다. 계정 정책/재시도 설정은 여전히 활성 런타임 스냅샷에서 선택된 계정에서 가져옵니다.
</Note>

## 권장: guild 워크스페이스 설정

DM이 작동하면, Discord 서버를 각 채널이 자체 컨텍스트를 가진 에이전트 세션을 얻는 완전한 워크스페이스로 설정할 수 있습니다. 본인과 봇만 있는 프라이빗 서버에 권장됩니다.

<Steps>
  <Step title="서버를 guild 허용 목록에 추가">
    이를 통해 에이전트가 DM뿐만 아니라 서버의 모든 채널에서 응답할 수 있습니다.

    <Tabs>
      <Tab title="에이전트에게 요청">
        > "내 Discord Server ID `<server_id>`를 guild 허용 목록에 추가해 주세요"
      </Tab>
      <Tab title="Config">

```json5
{
  channels: {
    discord: {
      groupPolicy: "allowlist",
      guilds: {
        YOUR_SERVER_ID: {
          requireMention: true,
          users: ["YOUR_USER_ID"],
        },
      },
    },
  },
}
```

      </Tab>
    </Tabs>

  </Step>

  <Step title="@mention 없이 응답 허용">
    기본적으로 에이전트는 @mention된 경우에만 guild 채널에서 응답합니다. 프라이빗 서버에서는 모든 메시지에 응답하도록 하고 싶을 것입니다.

    <Tabs>
      <Tab title="에이전트에게 요청">
        > "이 서버에서 @mention 없이도 에이전트가 응답하도록 허용해 주세요"
      </Tab>
      <Tab title="Config">
        guild 구성에서 `requireMention: false`를 설정하십시오:

```json5
{
  channels: {
    discord: {
      guilds: {
        YOUR_SERVER_ID: {
          requireMention: false,
        },
      },
    },
  },
}
```

      </Tab>
    </Tabs>

  </Step>

  <Step title="guild 채널의 메모리 계획">
    기본적으로 장기 메모리(MEMORY.md)는 DM 세션에서만 로드됩니다. guild 채널은 MEMORY.md를 자동 로드하지 않습니다.

    <Tabs>
      <Tab title="에이전트에게 요청">
        > "Discord 채널에서 질문할 때, MEMORY.md의 장기 컨텍스트가 필요하면 memory_search 또는 memory_get을 사용해 주세요."
      </Tab>
      <Tab title="수동">
        모든 채널에서 공유 컨텍스트가 필요하다면, 안정적인 지침을 `AGENTS.md` 또는 `USER.md`에 넣으십시오 (모든 세션에 주입됨). 장기 노트는 `MEMORY.md`에 유지하고 메모리 도구로 필요 시 접근하십시오.
      </Tab>
    </Tabs>

  </Step>
</Steps>

이제 Discord 서버에서 채널 몇 개를 만들고 대화를 시작하십시오. 에이전트는 채널 이름을 볼 수 있으며, 각 채널은 자체 격리된 세션을 갖습니다 — 따라서 `#coding`, `#home`, `#research` 등 워크플로에 맞는 채널을 설정할 수 있습니다.

## 런타임 모델

- Gateway가 Discord 연결을 소유합니다.
- 응답 라우팅은 결정적입니다: Discord 인바운드는 Discord로 다시 응답합니다.
- 기본적으로 (`session.dmScope=main`), 다이렉트 채팅은 에이전트 메인 세션(`agent:main:main`)을 공유합니다.
- Guild 채널은 격리된 세션 키(`agent:<agentId>:discord:channel:<channelId>`)입니다.
- 그룹 DM은 기본적으로 무시됩니다 (`channels.discord.dm.groupEnabled=false`).
- 네이티브 슬래시 명령은 격리된 명령 세션(`agent:<agentId>:discord:slash:<userId>`)에서 실행되며, 동시에 `CommandTargetSessionKey`를 라우팅된 대화 세션으로 전달합니다.

## Forum 채널

Discord forum 및 media 채널은 스레드 게시만 허용합니다. OpenClaw는 이를 생성하는 두 가지 방법을 지원합니다:

- Forum 부모(`channel:<forumId>`)에 메시지를 보내 스레드를 자동 생성합니다. 스레드 제목은 메시지의 첫 번째 비어 있지 않은 줄을 사용합니다.
- 스레드를 직접 생성하려면 `openclaw message thread create`를 사용하십시오. Forum 채널에는 `--message-id`를 전달하지 마십시오.

예시: forum 부모에 보내 스레드 생성

```bash
openclaw message send --channel discord --target channel:<forumId> \
  --message "Topic title\nBody of the post"
```

예시: forum 스레드를 명시적으로 생성

```bash
openclaw message thread create --channel discord --target channel:<forumId> \
  --thread-name "Topic title" --message "Body of the post"
```

Forum 부모는 Discord component를 허용하지 않습니다. Component가 필요하다면 스레드 자체(`channel:<threadId>`)로 전송하십시오.

## 인터랙티브 component

OpenClaw는 에이전트 메시지에 대해 Discord components v2 컨테이너를 지원합니다. `components` 페이로드가 포함된 message tool을 사용하십시오. 인터랙션 결과는 일반 인바운드 메시지로 에이전트에 다시 라우팅되고 기존 Discord `replyToMode` 설정을 따릅니다.

지원되는 블록:

- `text`, `section`, `separator`, `actions`, `media-gallery`, `file`
- Action row는 최대 5개의 버튼 또는 단일 select 메뉴를 허용합니다
- Select 타입: `string`, `user`, `role`, `mentionable`, `channel`

기본적으로 component는 단일 사용입니다. `components.reusable=true`로 설정하여 버튼, select, 폼이 만료될 때까지 여러 번 사용되도록 허용하십시오.

버튼 클릭을 누가 할 수 있는지 제한하려면 해당 버튼에 `allowedUsers`(Discord user ID, 태그 또는 `*`)를 설정하십시오. 구성된 경우 일치하지 않는 사용자는 ephemeral 거부를 받습니다.

`/model` 및 `/models` 슬래시 명령은 provider와 model 드롭다운에 Submit 단계가 추가된 인터랙티브 모델 선택기를 엽니다. `commands.modelsWrite=false`가 아닌 경우, `/models add`는 채팅에서 새 provider/model 항목 추가도 지원하며, 새로 추가된 모델은 gateway를 재시작하지 않고도 나타납니다. 선택기 응답은 ephemeral이며 호출한 사용자만 사용할 수 있습니다.

파일 첨부:

- `file` 블록은 attachment 참조(`attachment://<filename>`)를 가리켜야 합니다
- `media`/`path`/`filePath`(단일 파일)를 통해 attachment를 제공하십시오. 여러 파일은 `media-gallery`를 사용하십시오
- attachment 참조와 일치해야 하는 경우 업로드 이름을 재정의하려면 `filename`을 사용하십시오

Modal 폼:

- `components.modal`에 최대 5개의 필드 추가
- 필드 타입: `text`, `checkbox`, `radio`, `select`, `role-select`, `user-select`
- OpenClaw는 트리거 버튼을 자동으로 추가합니다

예시:

```json5
{
  channel: "discord",
  action: "send",
  to: "channel:123456789012345678",
  message: "Optional fallback text",
  components: {
    reusable: true,
    text: "Choose a path",
    blocks: [
      {
        type: "actions",
        buttons: [
          {
            label: "Approve",
            style: "success",
            allowedUsers: ["123456789012345678"],
          },
          { label: "Decline", style: "danger" },
        ],
      },
      {
        type: "actions",
        select: {
          type: "string",
          placeholder: "Pick an option",
          options: [
            { label: "Option A", value: "a" },
            { label: "Option B", value: "b" },
          ],
        },
      },
    ],
    modal: {
      title: "Details",
      triggerLabel: "Open form",
      fields: [
        { type: "text", label: "Requester" },
        {
          type: "select",
          label: "Priority",
          options: [
            { label: "Low", value: "low" },
            { label: "High", value: "high" },
          ],
        },
      ],
    },
  },
}
```

## 접근 제어 및 라우팅

<Tabs>
  <Tab title="DM 정책">
    `channels.discord.dmPolicy`는 DM 접근을 제어합니다 (레거시: `channels.discord.dm.policy`):

    - `pairing` (기본값)
    - `allowlist`
    - `open` (`channels.discord.allowFrom`이 `"*"`를 포함해야 함; 레거시: `channels.discord.dm.allowFrom`)
    - `disabled`

    DM 정책이 open이 아닌 경우, 알 수 없는 사용자는 차단됩니다 (또는 `pairing` 모드에서 페어링이 요청됩니다).

    다중 계정 우선순위:

    - `channels.discord.accounts.default.allowFrom`은 `default` 계정에만 적용됩니다.
    - 명명된 계정은 자체 `allowFrom`이 설정되지 않은 경우 `channels.discord.allowFrom`을 상속합니다.
    - 명명된 계정은 `channels.discord.accounts.default.allowFrom`을 상속하지 않습니다.

    전달을 위한 DM 타겟 형식:

    - `user:<id>`
    - `<@id>` 멘션

    단순 숫자 ID는 모호하여 명시적 user/channel 타겟 종류가 제공되지 않는 한 거부됩니다.

  </Tab>

  <Tab title="Guild 정책">
    Guild 처리는 `channels.discord.groupPolicy`로 제어됩니다:

    - `open`
    - `allowlist`
    - `disabled`

    `channels.discord`가 존재할 때의 보안 기준선은 `allowlist`입니다.

    `allowlist` 동작:

    - guild는 `channels.discord.guilds`와 일치해야 합니다 (`id` 선호, slug 허용)
    - 선택적 발신자 허용 목록: `users` (안정적인 ID 권장)과 `roles` (role ID만); 어느 쪽이든 구성되면 발신자는 `users` OR `roles`와 일치할 때 허용됩니다
    - 직접 이름/태그 매칭은 기본적으로 비활성화됩니다. `channels.discord.dangerouslyAllowNameMatching: true`는 비상 호환성 모드로만 활성화하십시오
    - 이름/태그는 `users`에 지원되지만, ID가 더 안전합니다. `openclaw security audit`은 이름/태그 항목이 사용될 때 경고합니다
    - guild에 `channels`가 구성되어 있으면, 목록에 없는 채널은 거부됩니다
    - guild에 `channels` 블록이 없으면, 허용 목록에 있는 해당 guild의 모든 채널이 허용됩니다

    예시:

```json5
{
  channels: {
    discord: {
      groupPolicy: "allowlist",
      guilds: {
        "123456789012345678": {
          requireMention: true,
          ignoreOtherMentions: true,
          users: ["987654321098765432"],
          roles: ["123456789012345678"],
          channels: {
            general: { allow: true },
            help: { allow: true, requireMention: true },
          },
        },
      },
    },
  },
}
```

    `DISCORD_BOT_TOKEN`만 설정하고 `channels.discord` 블록을 만들지 않으면, `channels.defaults.groupPolicy`가 `open`이더라도 런타임 폴백은 `groupPolicy="allowlist"`입니다 (로그에 경고와 함께).

  </Tab>

  <Tab title="멘션 및 그룹 DM">
    Guild 메시지는 기본적으로 멘션 게이팅됩니다.

    멘션 감지에는 다음이 포함됩니다:

    - 명시적 봇 멘션
    - 구성된 멘션 패턴 (`agents.list[].groupChat.mentionPatterns`, 폴백 `messages.groupChat.mentionPatterns`)
    - 지원되는 경우 암시적 봇 응답 동작

    `requireMention`은 guild/channel별로 구성됩니다 (`channels.discord.guilds...`).
    `ignoreOtherMentions`는 봇이 아닌 다른 사용자/역할을 멘션하는 메시지를 선택적으로 삭제합니다 (@everyone/@here 제외).

    그룹 DM:

    - 기본값: 무시됨 (`dm.groupEnabled=false`)
    - `dm.groupChannels`를 통한 선택적 허용 목록 (채널 ID 또는 slug)

  </Tab>
</Tabs>

### 역할 기반 에이전트 라우팅

`bindings[].match.roles`를 사용하여 Discord guild 멤버를 role ID로 다른 에이전트에 라우팅합니다. 역할 기반 바인딩은 role ID만 허용하며 peer 또는 parent-peer 바인딩 이후, guild 전용 바인딩 이전에 평가됩니다. 바인딩이 다른 match 필드도 설정하는 경우(예: `peer` + `guildId` + `roles`), 구성된 모든 필드가 일치해야 합니다.

```json5
{
  bindings: [
    {
      agentId: "opus",
      match: {
        channel: "discord",
        guildId: "123456789012345678",
        roles: ["111111111111111111"],
      },
    },
    {
      agentId: "sonnet",
      match: {
        channel: "discord",
        guildId: "123456789012345678",
      },
    },
  ],
}
```

## 네이티브 명령 및 명령 인증

- `commands.native`는 기본적으로 `"auto"`이며 Discord에서 활성화됩니다.
- 채널별 재정의: `channels.discord.commands.native`.
- `commands.native=false`는 이전에 등록된 Discord 네이티브 명령을 명시적으로 지웁니다.
- 네이티브 명령 인증은 일반 메시지 처리와 동일한 Discord 허용 목록/정책을 사용합니다.
- 명령은 인증되지 않은 사용자에게도 Discord UI에 보일 수 있지만, 실행 시 OpenClaw 인증이 여전히 시행되며 "not authorized"를 반환합니다.

명령 카탈로그 및 동작은 [슬래시 명령](/tools/slash-commands)을 참조하십시오.

기본 슬래시 명령 설정:

- `ephemeral: true`

## 기능 상세

<AccordionGroup>
  <Accordion title="응답 태그 및 네이티브 응답">
    Discord는 에이전트 출력에서 응답 태그를 지원합니다:

    - `[[reply_to_current]]`
    - `[[reply_to:<id>]]`

    `channels.discord.replyToMode`로 제어됩니다:

    - `off` (기본값)
    - `first`
    - `all`
    - `batched`

    참고: `off`는 암시적 응답 스레딩을 비활성화합니다. 명시적 `[[reply_to_*]]` 태그는 여전히 처리됩니다.
    `first`는 항상 턴의 첫 번째 아웃바운드 Discord 메시지에 암시적 네이티브 응답 참조를 첨부합니다.
    `batched`는 인바운드 턴이 여러 메시지의 디바운스된 배치인 경우에만 Discord의 암시적 네이티브 응답 참조를 첨부합니다. 이는 매 단일 메시지 턴이 아니라 모호한 버스티 채팅에 주로 네이티브 응답을 원할 때 유용합니다.

    메시지 ID는 context/history에 표시되어 에이전트가 특정 메시지를 대상으로 지정할 수 있습니다.

  </Accordion>

  <Accordion title="라이브 스트림 미리보기">
    OpenClaw는 임시 메시지를 보낸 뒤 텍스트가 도착하면 편집하여 초안 응답을 스트리밍할 수 있습니다. `channels.discord.streaming`은 `off` (기본값) | `partial` | `block` | `progress`를 받습니다. `progress`는 Discord에서 `partial`로 매핑됩니다. `streamMode`는 레거시 별칭이며 자동으로 마이그레이션됩니다.

    기본값은 `off`로 유지되는데, 여러 봇이나 gateway가 계정을 공유할 때 Discord 미리보기 편집이 속도 제한에 빠르게 도달하기 때문입니다.

```json5
{
  channels: {
    discord: {
      streaming: "block",
      draftChunk: {
        minChars: 200,
        maxChars: 800,
        breakPreference: "paragraph",
      },
    },
  },
}
```

    - `partial`은 토큰이 도착할 때 단일 미리보기 메시지를 편집합니다.
    - `block`은 초안 크기 청크를 방출합니다 (`draftChunk`를 사용하여 크기 및 중단점 조정, `textChunkLimit`으로 제한됨).
    - 미디어, 오류, 명시적 응답 최종본은 대기 중인 미리보기 편집을 취소합니다.
    - `streaming.preview.toolProgress` (기본값 `true`)는 tool/progress 업데이트가 미리보기 메시지를 재사용할지 제어합니다.

    미리보기 스트리밍은 텍스트 전용입니다. 미디어 응답은 일반 전달로 폴백됩니다. `block` 스트리밍이 명시적으로 활성화된 경우, OpenClaw는 이중 스트리밍을 방지하기 위해 미리보기 스트림을 건너뜁니다.

  </Accordion>

  <Accordion title="히스토리, 컨텍스트 및 스레드 동작">
    Guild 히스토리 컨텍스트:

    - `channels.discord.historyLimit` 기본값 `20`
    - 폴백: `messages.groupChat.historyLimit`
    - `0`은 비활성화

    DM 히스토리 제어:

    - `channels.discord.dmHistoryLimit`
    - `channels.discord.dms["<user_id>"].historyLimit`

    스레드 동작:

    - Discord 스레드는 채널 세션으로 라우팅되며 재정의되지 않는 한 부모 채널 구성을 상속합니다.
    - `channels.discord.thread.inheritParent` (기본값 `false`)는 새 자동 스레드가 부모 transcript에서 시딩하도록 옵트인합니다. 계정별 재정의는 `channels.discord.accounts.<id>.thread.inheritParent`에 있습니다.
    - Message-tool 반응은 `user:<id>` DM 타겟을 확인할 수 있습니다.
    - `guilds.<guild>.channels.<channel>.requireMention: false`는 응답 단계 활성화 폴백 중에 보존됩니다.

    채널 topic은 **신뢰할 수 없는** 컨텍스트로 주입됩니다. 허용 목록은 에이전트를 트리거할 수 있는 사람을 게이팅하며, 전체 보조 컨텍스트 편집 경계는 아닙니다.

  </Accordion>

  <Accordion title="서브에이전트를 위한 스레드 바인딩 세션">
    Discord는 스레드를 세션 타겟에 바인딩하여 해당 스레드의 후속 메시지가 동일한 세션(서브에이전트 세션 포함)으로 계속 라우팅되도록 할 수 있습니다.

    명령:

    - `/focus <target>` 현재/새 스레드를 서브에이전트/세션 타겟에 바인딩
    - `/unfocus` 현재 스레드 바인딩 제거
    - `/agents` 활성 실행 및 바인딩 상태 표시
    - `/session idle <duration|off>` focused 바인딩의 비활성 자동 unfocus 검사/업데이트
    - `/session max-age <duration|off>` focused 바인딩의 하드 max age 검사/업데이트

    Config:

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
        idleHours: 24,
        maxAgeHours: 0,
        spawnSubagentSessions: false, // opt-in
      },
    },
  },
}
```

    참고:

    - `session.threadBindings.*`는 전역 기본값을 설정합니다.
    - `channels.discord.threadBindings.*`는 Discord 동작을 재정의합니다.
    - `sessions_spawn({ thread: true })`를 위해 스레드를 자동 생성/바인딩하려면 `spawnSubagentSessions`가 true여야 합니다.
    - ACP(`/acp spawn ... --thread ...` 또는 `sessions_spawn({ runtime: "acp", thread: true })`)를 위해 스레드를 자동 생성/바인딩하려면 `spawnAcpSessions`가 true여야 합니다.
    - 계정에 대해 스레드 바인딩이 비활성화된 경우, `/focus` 및 관련 스레드 바인딩 작업은 사용할 수 없습니다.

    [서브에이전트](/tools/subagents), [ACP 에이전트](/tools/acp-agents), [구성 참조](/gateway/configuration-reference)를 참조하십시오.

  </Accordion>

  <Accordion title="영구 ACP 채널 바인딩">
    안정적인 "항상 켜져 있는" ACP 워크스페이스를 위해, Discord 대화를 타겟으로 하는 최상위 타입이 지정된 ACP 바인딩을 구성하십시오.

    Config 경로:

    - `type: "acp"` 및 `match.channel: "discord"`가 있는 `bindings[]`

    예시:

```json5
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
  ],
  channels: {
    discord: {
      guilds: {
        "111111111111111111": {
          channels: {
            "222222222222222222": {
              requireMention: false,
            },
          },
        },
      },
    },
  },
}
```

    참고:

    - `/acp spawn codex --bind here`는 현재 채널 또는 스레드를 제자리에서 바인딩하고 향후 메시지를 동일한 ACP 세션으로 유지합니다. 스레드 메시지는 부모 채널 바인딩을 상속합니다.
    - 바인딩된 채널 또는 스레드에서 `/new`와 `/reset`은 동일한 ACP 세션을 제자리에서 리셋합니다. 임시 스레드 바인딩은 활성화되어 있는 동안 타겟 확인을 재정의할 수 있습니다.
    - `spawnAcpSessions`는 OpenClaw가 `--thread auto|here`를 통해 자식 스레드를 생성/바인딩해야 할 때만 필요합니다.

    바인딩 동작 상세는 [ACP 에이전트](/tools/acp-agents)를 참조하십시오.

  </Accordion>

  <Accordion title="반응 알림">
    Guild별 반응 알림 모드:

    - `off`
    - `own` (기본값)
    - `all`
    - `allowlist` (`guilds.<id>.users` 사용)

    반응 이벤트는 시스템 이벤트로 변환되어 라우팅된 Discord 세션에 첨부됩니다.

  </Accordion>

  <Accordion title="확인 반응">
    `ackReaction`은 OpenClaw가 인바운드 메시지를 처리하는 동안 확인 이모지를 전송합니다.

    확인 순서:

    - `channels.discord.accounts.<accountId>.ackReaction`
    - `channels.discord.ackReaction`
    - `messages.ackReaction`
    - 에이전트 ID 이모지 폴백 (`agents.list[].identity.emoji`, 없으면 "👀")

    참고:

    - Discord는 유니코드 이모지 또는 커스텀 이모지 이름을 허용합니다.
    - `""`를 사용하여 채널 또는 계정에 대한 반응을 비활성화하십시오.

  </Accordion>

  <Accordion title="Config 쓰기">
    채널 시작 config 쓰기는 기본적으로 활성화되어 있습니다.

    이는 `/config set|unset` 흐름에 영향을 줍니다 (명령 기능이 활성화된 경우).

    비활성화:

```json5
{
  channels: {
    discord: {
      configWrites: false,
    },
  },
}
```

  </Accordion>

  <Accordion title="Gateway 프록시">
    `channels.discord.proxy`로 Discord gateway WebSocket 트래픽과 시작 시 REST 조회(application ID + 허용 목록 확인)를 HTTP(S) 프록시를 통해 라우팅합니다.

```json5
{
  channels: {
    discord: {
      proxy: "http://proxy.example:8080",
    },
  },
}
```

    계정별 재정의:

```json5
{
  channels: {
    discord: {
      accounts: {
        primary: {
          proxy: "http://proxy.example:8080",
        },
      },
    },
  },
}
```

  </Accordion>

  <Accordion title="PluralKit 지원">
    프록시된 메시지를 시스템 멤버 ID에 매핑하려면 PluralKit 확인을 활성화하십시오:

```json5
{
  channels: {
    discord: {
      pluralkit: {
        enabled: true,
        token: "pk_live_...", // 선택 사항; 프라이빗 시스템에 필요
      },
    },
  },
}
```

    참고:

    - 허용 목록은 `pk:<memberId>`를 사용할 수 있습니다
    - 멤버 표시 이름은 `channels.discord.dangerouslyAllowNameMatching: true`일 때만 name/slug로 매칭됩니다
    - 조회는 원래 메시지 ID를 사용하며 시간 창이 제한됩니다
    - 조회에 실패하면 프록시된 메시지는 봇 메시지로 취급되어 `allowBots=true`가 아닌 한 삭제됩니다

  </Accordion>

  <Accordion title="Presence 구성">
    상태 또는 activity 필드를 설정하거나 자동 presence를 활성화하면 presence 업데이트가 적용됩니다.

    상태만 예시:

```json5
{
  channels: {
    discord: {
      status: "idle",
    },
  },
}
```

    Activity 예시 (커스텀 상태가 기본 activity 타입):

```json5
{
  channels: {
    discord: {
      activity: "Focus time",
      activityType: 4,
    },
  },
}
```

    Streaming 예시:

```json5
{
  channels: {
    discord: {
      activity: "Live coding",
      activityType: 1,
      activityUrl: "https://twitch.tv/openclaw",
    },
  },
}
```

    Activity 타입 맵:

    - 0: Playing
    - 1: Streaming (`activityUrl` 필요)
    - 2: Listening
    - 3: Watching
    - 4: Custom (activity 텍스트를 상태 state로 사용; 이모지는 선택 사항)
    - 5: Competing

    자동 presence 예시 (런타임 상태 신호):

```json5
{
  channels: {
    discord: {
      autoPresence: {
        enabled: true,
        intervalMs: 30000,
        minUpdateIntervalMs: 15000,
        exhaustedText: "token exhausted",
      },
    },
  },
}
```

    자동 presence는 런타임 가용성을 Discord 상태에 매핑합니다: healthy => online, degraded 또는 unknown => idle, exhausted 또는 unavailable => dnd. 선택적 텍스트 재정의:

    - `autoPresence.healthyText`
    - `autoPresence.degradedText`
    - `autoPresence.exhaustedText` (`{reason}` 플레이스홀더 지원)

  </Accordion>

  <Accordion title="Discord에서의 승인">
    Discord는 DM에서 버튼 기반 승인 처리를 지원하며 선택적으로 원래 채널에 승인 프롬프트를 게시할 수 있습니다.

    Config 경로:

    - `channels.discord.execApprovals.enabled`
    - `channels.discord.execApprovals.approvers` (선택 사항; 가능한 경우 `commands.ownerAllowFrom`으로 폴백)
    - `channels.discord.execApprovals.target` (`dm` | `channel` | `both`, 기본값: `dm`)
    - `agentFilter`, `sessionFilter`, `cleanupAfterResolve`

    Discord는 `enabled`가 설정되지 않았거나 `"auto"`이고 `execApprovals.approvers` 또는 `commands.ownerAllowFrom`에서 최소 하나의 승인자가 확인될 수 있을 때 네이티브 exec 승인을 자동 활성화합니다. Discord는 channel `allowFrom`, 레거시 `dm.allowFrom` 또는 다이렉트 메시지 `defaultTo`에서 exec 승인자를 유추하지 않습니다. Discord를 네이티브 승인 클라이언트로 명시적으로 비활성화하려면 `enabled: false`를 설정하십시오.

    `target`이 `channel` 또는 `both`인 경우, 승인 프롬프트는 채널에서 볼 수 있습니다. 확인된 승인자만 버튼을 사용할 수 있습니다. 다른 사용자는 ephemeral 거부를 받습니다. 승인 프롬프트는 명령 텍스트를 포함하므로, 신뢰할 수 있는 채널에서만 채널 전달을 활성화하십시오. 세션 키에서 채널 ID를 유도할 수 없으면, OpenClaw는 DM 전달로 폴백합니다.

    Discord는 다른 채팅 채널에서 사용되는 공유 승인 버튼도 렌더링합니다. 네이티브 Discord 어댑터는 주로 승인자 DM 라우팅과 채널 fanout을 추가합니다.
    해당 버튼이 있을 때, 그들은 주요 승인 UX입니다. OpenClaw는 도구 결과가 채팅 승인을 사용할 수 없거나 수동 승인이 유일한 경로라고 말할 때만 수동 `/approve` 명령을 포함해야 합니다.

    Gateway 인증 및 승인 확인은 공유 Gateway 클라이언트 계약을 따릅니다 (`plugin:` ID는 `plugin.approval.resolve`를 통해 확인되고, 다른 ID는 `exec.approval.resolve`를 통해 확인됩니다). 승인은 기본적으로 30분 후 만료됩니다.

    [Exec 승인](/tools/exec-approvals)을 참조하십시오.

  </Accordion>
</AccordionGroup>

## 도구 및 액션 게이트

Discord message 액션에는 메시징, 채널 관리, 모더레이션, presence, 메타데이터 액션이 포함됩니다.

핵심 예시:

- messaging: `sendMessage`, `readMessages`, `editMessage`, `deleteMessage`, `threadReply`
- reactions: `react`, `reactions`, `emojiList`
- moderation: `timeout`, `kick`, `ban`
- presence: `setPresence`

`event-create` 액션은 예약된 이벤트 커버 이미지를 설정하는 선택적 `image` 매개변수(URL 또는 로컬 파일 경로)를 허용합니다.

액션 게이트는 `channels.discord.actions.*` 아래에 있습니다.

기본 게이트 동작:

| 액션 그룹                                                                                                                                                                | 기본값   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| reactions, messages, threads, pins, polls, search, memberInfo, roleInfo, channelInfo, channels, voiceStatus, events, stickers, emojiUploads, stickerUploads, permissions | 활성화   |
| roles                                                                                                                                                                    | 비활성화 |
| moderation                                                                                                                                                               | 비활성화 |
| presence                                                                                                                                                                 | 비활성화 |

## Components v2 UI

OpenClaw는 exec 승인 및 교차 컨텍스트 마커에 Discord components v2를 사용합니다. Discord message 액션은 커스텀 UI에 대해 `components`를 허용할 수도 있지만(고급; discord 도구를 통해 component 페이로드를 구성해야 함), 레거시 `embeds`는 여전히 사용 가능하나 권장되지 않습니다.

- `channels.discord.ui.components.accentColor`는 Discord component 컨테이너가 사용하는 강조 색상을 설정합니다 (16진수).
- 계정별 설정: `channels.discord.accounts.<id>.ui.components.accentColor`.
- components v2가 있을 때 `embeds`는 무시됩니다.

예시:

```json5
{
  channels: {
    discord: {
      ui: {
        components: {
          accentColor: "#5865F2",
        },
      },
    },
  },
}
```

## 음성

Discord에는 두 가지 구별되는 음성 표면이 있습니다: 실시간 **voice channel**(연속 대화)과 **음성 메시지 첨부**(waveform 미리보기 형식). Gateway는 둘 다 지원합니다.

### Voice channel

요구 사항:

- 네이티브 명령 활성화 (`commands.native` 또는 `channels.discord.commands.native`).
- `channels.discord.voice` 구성.
- 봇은 대상 voice channel에서 Connect + Speak 권한이 필요합니다.

`/vc join|leave|status`를 사용하여 세션을 제어합니다. 이 명령은 계정 기본 에이전트를 사용하고 다른 Discord 명령과 동일한 허용 목록 및 그룹 정책 규칙을 따릅니다.

자동 참여 예시:

```json5
{
  channels: {
    discord: {
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
    },
  },
}
```

참고:

- `voice.tts`는 음성 재생에만 `messages.tts`를 재정의합니다.
- 음성 transcript 턴은 Discord `allowFrom` (또는 `dm.allowFrom`)에서 owner 상태를 유도합니다. Owner가 아닌 발화자는 owner 전용 도구(예: `gateway` 및 `cron`)에 접근할 수 없습니다.
- 음성은 기본적으로 활성화되어 있습니다. 비활성화하려면 `channels.discord.voice.enabled=false`를 설정하십시오.
- `voice.daveEncryption`과 `voice.decryptionFailureTolerance`는 `@discordjs/voice` join 옵션에 전달됩니다.
- `@discordjs/voice` 기본값은 설정되지 않은 경우 `daveEncryption=true`와 `decryptionFailureTolerance=24`입니다.
- OpenClaw는 수신 복호화 실패도 감시하고 짧은 창 내에서 반복 실패 후 voice channel에서 나갔다가 다시 참여하여 자동 복구합니다.
- 수신 로그에 `DecryptionFailed(UnencryptedWhenPassthroughDisabled)`가 반복해서 표시되면, 이는 [discord.js #11419](https://github.com/discordjs/discord.js/issues/11419)에서 추적되는 업스트림 `@discordjs/voice` 수신 버그일 수 있습니다.

### 음성 메시지

Discord 음성 메시지는 waveform 미리보기를 표시하며 OGG/Opus 오디오가 필요합니다. OpenClaw는 waveform을 자동 생성하지만, 검사 및 변환을 위해 gateway 호스트에 `ffmpeg` 및 `ffprobe`가 필요합니다.

- **로컬 파일 경로**를 제공하십시오 (URL은 거부됨).
- 텍스트 콘텐츠는 생략하십시오 (Discord는 동일한 페이로드에서 텍스트 + 음성 메시지를 거부함).
- 어떤 오디오 형식이든 허용됩니다. OpenClaw는 필요에 따라 OGG/Opus로 변환합니다.

```bash
message(action="send", channel="discord", target="channel:123", path="/path/to/audio.mp3", asVoice=true)
```

## 문제 해결

<AccordionGroup>
  <Accordion title="허용되지 않은 intent를 사용했거나 봇이 guild 메시지를 보지 못함">

    - Message Content Intent 활성화
    - 사용자/멤버 확인에 의존하는 경우 Server Members Intent 활성화
    - intent 변경 후 gateway 재시작

  </Accordion>

  <Accordion title="Guild 메시지가 예기치 않게 차단됨">

    - `groupPolicy` 확인
    - `channels.discord.guilds` 아래 guild 허용 목록 확인
    - guild `channels` 맵이 존재하면, 목록에 있는 채널만 허용됨
    - `requireMention` 동작 및 멘션 패턴 확인

    유용한 확인:

```bash
openclaw doctor
openclaw channels status --probe
openclaw logs --follow
```

  </Accordion>

  <Accordion title="requireMention false인데 여전히 차단됨">
    일반적인 원인:

    - 일치하는 guild/channel 허용 목록 없이 `groupPolicy="allowlist"`
    - `requireMention`이 잘못된 위치에 구성됨 (`channels.discord.guilds` 또는 channel 항목 아래에 있어야 함)
    - 발신자가 guild/channel `users` 허용 목록으로 차단됨

  </Accordion>

  <Accordion title="장기 실행 핸들러가 타임아웃되거나 응답이 중복됨">

    일반적인 로그:

    - `Listener DiscordMessageListener timed out after 30000ms for event MESSAGE_CREATE`
    - `Slow listener detected ...`
    - `discord inbound worker timed out after ...`

    Listener 예산 조정:

    - 단일 계정: `channels.discord.eventQueue.listenerTimeout`
    - 다중 계정: `channels.discord.accounts.<accountId>.eventQueue.listenerTimeout`

    Worker 실행 타임아웃 조정:

    - 단일 계정: `channels.discord.inboundWorker.runTimeoutMs`
    - 다중 계정: `channels.discord.accounts.<accountId>.inboundWorker.runTimeoutMs`
    - 기본값: `1800000` (30분); `0`으로 설정하면 비활성화

    권장 기준선:

```json5
{
  channels: {
    discord: {
      accounts: {
        default: {
          eventQueue: {
            listenerTimeout: 120000,
          },
          inboundWorker: {
            runTimeoutMs: 1800000,
          },
        },
      },
    },
  },
}
```

    느린 listener 설정에는 `eventQueue.listenerTimeout`을 사용하고, 큐에 있는 에이전트 턴에 대해 별도의 안전 밸브를 원하는 경우에만 `inboundWorker.runTimeoutMs`를 사용하십시오.

  </Accordion>

  <Accordion title="권한 감사 불일치">
    `channels status --probe` 권한 확인은 숫자 채널 ID에 대해서만 작동합니다.

    slug 키를 사용하는 경우, 런타임 매칭은 여전히 작동할 수 있지만 probe는 권한을 완전히 확인할 수 없습니다.

  </Accordion>

  <Accordion title="DM 및 페어링 문제">

    - DM 비활성화: `channels.discord.dm.enabled=false`
    - DM 정책 비활성화: `channels.discord.dmPolicy="disabled"` (레거시: `channels.discord.dm.policy`)
    - `pairing` 모드에서 페어링 승인 대기 중

  </Accordion>

  <Accordion title="봇 대 봇 루프">
    기본적으로 봇이 작성한 메시지는 무시됩니다.

    `channels.discord.allowBots=true`를 설정한 경우, 루프 동작을 피하기 위해 엄격한 멘션 및 허용 목록 규칙을 사용하십시오.
    봇을 멘션하는 봇 메시지만 허용하려면 `channels.discord.allowBots="mentions"`를 선호하십시오.

  </Accordion>

  <Accordion title="음성 STT가 DecryptionFailed(...)로 끊김">

    - Discord 음성 수신 복구 로직이 있도록 OpenClaw를 최신 상태로 유지하십시오 (`openclaw update`)
    - `channels.discord.voice.daveEncryption=true` (기본값) 확인
    - `channels.discord.voice.decryptionFailureTolerance=24` (업스트림 기본값)부터 시작하여 필요할 때만 조정
    - 로그에서 다음을 감시하십시오:
      - `discord voice: DAVE decrypt failures detected`
      - `discord voice: repeated decrypt failures; attempting rejoin`
    - 자동 재참여 후에도 실패가 계속되면 로그를 수집하여 [discord.js #11419](https://github.com/discordjs/discord.js/issues/11419)와 비교하십시오

  </Accordion>
</AccordionGroup>

## 구성 참조

기본 참조: [구성 참조 - Discord](/gateway/config-channels#discord).

<Accordion title="고신호 Discord 필드">

- 시작/인증: `enabled`, `token`, `accounts.*`, `allowBots`
- 정책: `groupPolicy`, `dm.*`, `guilds.*`, `guilds.*.channels.*`
- 명령: `commands.native`, `commands.useAccessGroups`, `configWrites`, `slashCommand.*`
- 이벤트 큐: `eventQueue.listenerTimeout` (listener 예산), `eventQueue.maxQueueSize`, `eventQueue.maxConcurrency`
- 인바운드 worker: `inboundWorker.runTimeoutMs`
- 응답/히스토리: `replyToMode`, `historyLimit`, `dmHistoryLimit`, `dms.*.historyLimit`
- 전달: `textChunkLimit`, `chunkMode`, `maxLinesPerMessage`
- 스트리밍: `streaming` (레거시 별칭: `streamMode`), `streaming.preview.toolProgress`, `draftChunk`, `blockStreaming`, `blockStreamingCoalesce`
- 미디어/재시도: `mediaMaxMb` (아웃바운드 Discord 업로드 제한, 기본값 `100MB`), `retry`
- 액션: `actions.*`
- Presence: `activity`, `status`, `activityType`, `activityUrl`
- UI: `ui.components.accentColor`
- 기능: `threadBindings`, 최상위 `bindings[]` (`type: "acp"`), `pluralkit`, `execApprovals`, `intents`, `agentComponents`, `heartbeat`, `responsePrefix`

</Accordion>

## 안전 및 운영

- 봇 토큰을 비밀로 취급하십시오 (감독된 환경에서는 `DISCORD_BOT_TOKEN` 선호).
- 최소 권한 Discord 권한을 부여하십시오.
- 명령 배포/상태가 오래된 경우, gateway를 재시작하고 `openclaw channels status --probe`로 다시 확인하십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Discord 사용자를 gateway에 페어링합니다.
  </Card>
  <Card title="그룹" icon="users" href="/channels/groups">
    그룹 채팅 및 허용 목록 동작.
  </Card>
  <Card title="채널 라우팅" icon="route" href="/channels/channel-routing">
    인바운드 메시지를 에이전트로 라우팅합니다.
  </Card>
  <Card title="보안" icon="shield" href="/gateway/security/">
    위협 모델 및 강화.
  </Card>
  <Card title="멀티 에이전트 라우팅" icon="sitemap" href="/concepts/multi-agent">
    guild와 채널을 에이전트에 매핑합니다.
  </Card>
  <Card title="슬래시 명령" icon="terminal" href="/tools/slash-commands">
    네이티브 명령 동작.
  </Card>
</CardGroup>
