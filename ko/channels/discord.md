---
summary: "Discord 봇 지원 상태, 기능 및 구성"
read_when:
  - Discord 채널 기능 작업 시
title: "Discord"
---

# Discord (Bot API)

상태: 공식 Discord 게이트웨이를 통한 DM 및 길드 채널에서 준비 완료.

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

새 봇이 있는 애플리케이션을 만들고, 봇을 서버에 추가하고, OpenClaw에 페어링해야 합니다. 개인 비공개 서버에 봇을 추가하는 것을 권장합니다. 아직 없는 경우 [먼저 서버를 생성하십시오](https://support.discord.com/hc/en-us/articles/204849977-How-do-I-create-a-server) (**내 서버 만들기 > 나와 내 친구들용** 선택).

<Steps>
  <Step title="Discord 애플리케이션 및 봇 생성">
    [Discord 개발자 포털](https://discord.com/developers/applications)로 이동하여 **새 애플리케이션**을 클릭합니다. "OpenClaw" 같은 이름을 입력합니다.

    사이드바에서 **봇**을 클릭합니다. **사용자 이름**을 OpenClaw 에이전트 이름으로 설정합니다.

  </Step>

  <Step title="특권 인텐트 활성화">
    **봇** 페이지에서 **특권 게이트웨이 인텐트**로 스크롤하여 다음을 활성화합니다:

    - **메시지 콘텐츠 인텐트** (필수)
    - **서버 멤버 인텐트** (권장; 역할 허용 목록 및 이름-ID 매칭에 필요)
    - **존재 인텐트** (선택 사항; 존재 업데이트에만 필요)

  </Step>

  <Step title="봇 토큰 복사">
    **봇** 페이지에서 위로 스크롤하여 **토큰 재설정**을 클릭합니다.

    <Note>
    이름과 달리 이 작업은 첫 번째 토큰을 생성하는 것입니다. 아무것도 "재설정"되지 않습니다.
    </Note>

    토큰을 복사하고 저장합니다. 이것이 **봇 토큰**이며 곧 필요합니다.

  </Step>

  <Step title="초대 URL 생성 및 서버에 봇 추가">
    사이드바에서 **OAuth2**를 클릭합니다. 서버에 봇을 추가할 올바른 권한으로 초대 URL을 생성합니다.

    **OAuth2 URL 생성기**로 스크롤하여 다음을 활성화합니다:

    - `bot`
    - `applications.commands`

    아래에 **봇 권한** 섹션이 나타납니다. 다음을 활성화합니다:

    - 채널 보기
    - 메시지 보내기
    - 메시지 기록 읽기
    - 링크 임베드
    - 파일 첨부
    - 반응 추가 (선택 사항)

    하단에서 생성된 URL을 복사하여 브라우저에 붙여넣고, 서버를 선택하고, **계속**을 클릭합니다. 이제 Discord 서버에서 봇을 볼 수 있어야 합니다.

  </Step>

  <Step title="개발자 모드 활성화 및 ID 수집">
    Discord 앱으로 돌아가서 내부 ID를 복사할 수 있도록 개발자 모드를 활성화해야 합니다.

    1. **사용자 설정** (아바타 옆 기어 아이콘) → **고급** → **개발자 모드** 켜기
    2. 사이드바에서 **서버 아이콘** 우클릭 → **서버 ID 복사**
    3. **자신의 아바타** 우클릭 → **사용자 ID 복사**

    **서버 ID**와 **사용자 ID**를 봇 토큰 옆에 저장합니다. 다음 단계에서 이 세 가지를 모두 OpenClaw에 전달합니다.

  </Step>

  <Step title="서버 멤버에서 DM 허용">
    페어링이 작동하려면 Discord가 봇이 사용자에게 DM을 보낼 수 있도록 해야 합니다. **서버 아이콘** 우클릭 → **개인 정보 설정** → **다이렉트 메시지** 켜기.

    이렇게 하면 서버 멤버(봇 포함)가 DM을 보낼 수 있습니다.

  </Step>

  <Step title="봇 토큰 안전하게 설정 (채팅에서 전송 금지)">
    Discord 봇 토큰은 비밀입니다(비밀번호와 같음). OpenClaw를 실행하는 기기에서 에이전트에 메시지를 보내기 전에 설정하십시오.

```bash
export DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN"
openclaw config set channels.discord.token --ref-provider default --ref-source env --ref-id DISCORD_BOT_TOKEN --dry-run
openclaw config set channels.discord.token --ref-provider default --ref-source env --ref-id DISCORD_BOT_TOKEN
openclaw config set channels.discord.enabled true --strict-json
openclaw gateway
```

  </Step>

  <Step title="OpenClaw 구성 및 페어링">

    <Tabs>
      <Tab title="에이전트에게 요청">
        기존 채널 (예: Telegram)에서 OpenClaw 에이전트와 채팅하여 알립니다. Discord가 첫 번째 채널이라면 대신 CLI/구성 탭을 사용하십시오.

        > "이미 구성에서 Discord 봇 토큰을 설정했습니다. 사용자 ID `<user_id>`와 서버 ID `<server_id>`로 Discord 설정을 완료해주세요."
      </Tab>
      <Tab title="CLI / 구성">
        파일 기반 구성을 선호하는 경우 다음을 설정합니다:

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

      </Tab>
    </Tabs>

  </Step>

  <Step title="첫 번째 DM 페어링 승인">
    게이트웨이가 실행될 때까지 기다린 다음 Discord에서 봇에게 DM을 보냅니다. 봇이 페어링 코드로 응답합니다.

    <Tabs>
      <Tab title="에이전트에게 요청">
        기존 채널에서 에이전트에게 페어링 코드를 전송합니다:

        > "이 Discord 페어링 코드를 승인해주세요: `<CODE>`"
      </Tab>
      <Tab title="CLI">

```bash
openclaw pairing list discord
openclaw pairing approve discord <CODE>
```

      </Tab>
    </Tabs>

    페어링 코드는 1시간 후 만료됩니다.

    이제 Discord DM을 통해 에이전트와 채팅할 수 있어야 합니다.

  </Step>
</Steps>

## 권장: 길드 워크스페이스 설정

DM이 작동하면 Discord 서버를 각 채널이 자체 컨텍스트로 에이전트 세션을 갖는 전체 워크스페이스로 설정할 수 있습니다.

<Steps>
  <Step title="길드 허용 목록에 서버 추가">

    <Tabs>
      <Tab title="에이전트에게 요청">
        > "내 Discord 서버 ID `<server_id>`를 길드 허용 목록에 추가해주세요"
      </Tab>
      <Tab title="구성">

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

  <Step title="@언급 없이 응답 허용">
    기본적으로 에이전트는 @언급 시에만 길드 채널에서 응답합니다. 비공개 서버의 경우 모든 메시지에 응답하도록 하는 것이 좋습니다.

    <Tabs>
      <Tab title="에이전트에게 요청">
        > "이 서버에서 @언급 없이도 에이전트가 응답할 수 있도록 허용해주세요"
      </Tab>
      <Tab title="구성">
        길드 구성에서 `requireMention: false`를 설정합니다:

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

  <Step title="길드 채널에서 메모리 계획">
    기본적으로 장기 메모리(MEMORY.md)는 DM 세션에서만 로드됩니다. 길드 채널은 MEMORY.md를 자동으로 로드하지 않습니다.

    <Tabs>
      <Tab title="에이전트에게 요청">
        > "Discord 채널에서 질문할 때 MEMORY.md의 장기 컨텍스트가 필요하면 memory_search 또는 memory_get을 사용해주세요."
      </Tab>
      <Tab title="수동">
        모든 채널에서 공유 컨텍스트가 필요한 경우 안정적인 지침을 `AGENTS.md` 또는 `USER.md`에 넣으십시오.
      </Tab>
    </Tabs>

  </Step>
</Steps>

이제 Discord 서버에서 채널을 만들고 채팅을 시작합니다. 에이전트는 채널 이름을 볼 수 있으며, 각 채널은 자체 격리된 세션을 가집니다.

## 런타임 모델

- 게이트웨이가 Discord 연결을 소유합니다.
- 응답 라우팅은 결정적입니다: Discord 인바운드는 Discord로 다시 응답합니다.
- 기본적으로 (`session.dmScope=main`) 다이렉트 채팅은 에이전트 메인 세션을 공유합니다 (`agent:main:main`).
- 길드 채널은 격리된 세션 키입니다 (`agent:<agentId>:discord:channel:<channelId>`).
- 그룹 DM은 기본적으로 무시됩니다 (`channels.discord.dm.groupEnabled=false`).

## 포럼 채널

Discord 포럼 및 미디어 채널은 스레드 게시물만 허용합니다. OpenClaw는 두 가지 방법으로 생성을 지원합니다:

- 포럼 부모 (`channel:<forumId>`)에 메시지를 보내 스레드를 자동 생성합니다.
- `openclaw message thread create`를 사용하여 스레드를 직접 생성합니다.

포럼 상위에 메시지를 보내 스레드 생성 예시:

```bash
openclaw message send --channel discord --target channel:<forumId> \
  --message "주제 제목\n게시물 본문"
```

## 인터랙티브 컴포넌트

OpenClaw는 에이전트 메시지에 Discord 컴포넌트 v2 컨테이너를 지원합니다.

지원 블록:

- `text`, `section`, `separator`, `actions`, `media-gallery`, `file`
- 액션 행은 최대 5개의 버튼 또는 단일 선택 메뉴를 허용합니다

예시:

```json5
{
  channel: "discord",
  action: "send",
  to: "channel:123456789012345678",
  message: "선택적 폴백 텍스트",
  components: {
    reusable: true,
    text: "경로를 선택하세요",
    blocks: [
      {
        type: "actions",
        buttons: [
          {
            label: "승인",
            style: "success",
            allowedUsers: ["123456789012345678"],
          },
          { label: "거부", style: "danger" },
        ],
      },
    ],
  },
}
```

## 접근 제어 및 라우팅

<Tabs>
  <Tab title="DM 정책">
    `channels.discord.dmPolicy`는 DM 접근을 제어합니다:

    - `pairing` (기본값)
    - `allowlist`
    - `open` (`channels.discord.allowFrom`에 `"*"` 포함 필요)
    - `disabled`

  </Tab>

  <Tab title="길드 정책">
    길드 처리는 `channels.discord.groupPolicy`로 제어됩니다:

    - `open`
    - `allowlist`
    - `disabled`

    `channels.discord` 존재 시 보안 기준은 `allowlist`입니다.

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

  </Tab>

  <Tab title="언급 및 그룹 DM">
    길드 메시지는 기본적으로 언급 게이팅됩니다.

    언급 감지 포함:

    - 명시적 봇 언급
    - 구성된 언급 패턴
    - 지원되는 경우 암시적 봇-응답 동작

    그룹 DM:

    - 기본값: 무시됨 (`dm.groupEnabled=false`)
    - `dm.groupChannels`를 통한 선택적 허용 목록

  </Tab>
</Tabs>

### 역할 기반 에이전트 라우팅

`bindings[].match.roles`를 사용하여 역할 ID별로 Discord 길드 멤버를 다른 에이전트로 라우팅합니다.

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

## 개발자 포털 설정

<AccordionGroup>
  <Accordion title="앱 및 봇 생성">

    1. Discord 개발자 포털 → **애플리케이션** → **새 애플리케이션**
    2. **봇** → **봇 추가**
    3. 봇 토큰 복사

  </Accordion>

  <Accordion title="특권 인텐트">
    **봇 → 특권 게이트웨이 인텐트**에서 다음을 활성화합니다:

    - 메시지 콘텐츠 인텐트
    - 서버 멤버 인텐트 (권장)

  </Accordion>

  <Accordion title="OAuth 범위 및 기본 권한">
    OAuth URL 생성기:

    - 범위: `bot`, `applications.commands`

    일반적인 기본 권한:

    - 채널 보기
    - 메시지 보내기
    - 메시지 기록 읽기
    - 링크 임베드
    - 파일 첨부
    - 반응 추가 (선택 사항)

    명시적으로 필요한 경우가 아니면 `Administrator`를 피하십시오.

  </Accordion>

  <Accordion title="ID 복사">
    Discord 개발자 모드를 활성화한 다음 다음을 복사합니다:

    - 서버 ID
    - 채널 ID
    - 사용자 ID

    안정적인 감사 및 프로브를 위해 OpenClaw 구성에서 숫자 ID를 사용하십시오.

  </Accordion>
</AccordionGroup>

## 네이티브 명령 및 명령 인증

- `commands.native`는 기본적으로 `"auto"`이며 Discord에 대해 활성화됩니다.
- 채널별 재정의: `channels.discord.commands.native`.
- `commands.native=false`는 이전에 등록된 Discord 네이티브 명령을 명시적으로 지웁니다.

[슬래시 명령](/tools/slash-commands) 참조.

기본 슬래시 명령 설정:

- `ephemeral: true`

## 기능 세부 사항

<AccordionGroup>
  <Accordion title="응답 태그 및 네이티브 응답">
    Discord는 에이전트 출력에서 응답 태그를 지원합니다:

    - `[[reply_to_current]]`
    - `[[reply_to:<id>]]`

    `channels.discord.replyToMode`로 제어:

    - `off` (기본값)
    - `first`
    - `all`
    - `batched`

  </Accordion>

  <Accordion title="라이브 스트림 미리보기">
    OpenClaw는 임시 메시지를 보내고 텍스트가 도착하면 편집하여 초안 응답을 스트리밍할 수 있습니다.

    - `channels.discord.streaming`은 미리보기 스트리밍을 제어합니다 (`off` | `partial` | `block` | `progress`, 기본값: `off`).

    예시:

```json5
{
  channels: {
    discord: {
      streaming: "partial",
    },
  },
}
```

  </Accordion>

  <Accordion title="히스토리, 컨텍스트 및 스레드 동작">
    길드 히스토리 컨텍스트:

    - `channels.discord.historyLimit` 기본값 `20`
    - `0` 비활성화

    스레드 동작:

    - Discord 스레드는 채널 세션으로 라우팅됩니다
    - 스레드 구성은 스레드별 항목이 없으면 부모 채널 구성을 상속합니다

  </Accordion>

  <Accordion title="반응 알림">
    길드별 반응 알림 모드:

    - `off`
    - `own` (기본값)
    - `all`
    - `allowlist` (`guilds.<id>.users` 사용)

  </Accordion>

  <Accordion title="확인 반응">
    `ackReaction`은 OpenClaw가 인바운드 메시지를 처리하는 동안 확인 이모지를 전송합니다.

    확인 순서:

    - `channels.discord.accounts.<accountId>.ackReaction`
    - `channels.discord.ackReaction`
    - `messages.ackReaction`
    - 에이전트 ID 이모지 폴백 (없으면 "👀")

  </Accordion>

  <Accordion title="음성 채널">
    OpenClaw는 실시간 연속 대화를 위해 Discord 음성 채널에 참여할 수 있습니다.

    요구 사항:

    - 네이티브 명령 활성화 (`commands.native` 또는 `channels.discord.commands.native`).
    - `channels.discord.voice` 구성.
    - 봇에게 대상 음성 채널에서 연결 + 말하기 권한 필요.

    Discord 전용 네이티브 명령 `/vc join|leave|status`를 사용하여 세션을 제어합니다.

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
        tts: {
          provider: "openai",
          openai: { voice: "alloy" },
        },
      },
    },
  },
}
```

  </Accordion>
</AccordionGroup>

## 도구 및 액션 게이트

Discord 메시지 액션에는 메시지, 채널 관리, 모더레이션, 존재 및 메타데이터 액션이 포함됩니다.

핵심 예시:

- 메시지: `sendMessage`, `readMessages`, `editMessage`, `deleteMessage`, `threadReply`
- 반응: `react`, `reactions`, `emojiList`
- 모더레이션: `timeout`, `kick`, `ban`
- 존재: `setPresence`

액션 게이트는 `channels.discord.actions.*` 아래에 있습니다.

기본 게이트 동작:

| 액션 그룹                                                                       | 기본값   |
| ------------------------------------------------------------------------------- | -------- |
| reactions, messages, threads, pins, polls, search, memberInfo, roleInfo 등      | 활성화   |
| roles                                                                           | 비활성화 |
| moderation                                                                      | 비활성화 |
| presence                                                                        | 비활성화 |

## 문제 해결

<AccordionGroup>
  <Accordion title="사용된 인텐트 오류 또는 봇이 길드 메시지를 보지 못함">

    - 메시지 콘텐츠 인텐트 활성화
    - 사용자/멤버 확인에 의존하는 경우 서버 멤버 인텐트 활성화
    - 인텐트 변경 후 게이트웨이 재시작

  </Accordion>

  <Accordion title="예상치 않게 길드 메시지 차단됨">

    - `groupPolicy` 확인
    - `channels.discord.guilds` 아래의 길드 허용 목록 확인
    - 길드 `channels` 맵이 있는 경우 나열된 채널만 허용됩니다

    유용한 확인:

```bash
openclaw doctor
openclaw channels status --probe
openclaw logs --follow
```

  </Accordion>

  <Accordion title="DM 및 페어링 문제">

    - DM 비활성화: `channels.discord.dm.enabled=false`
    - DM 정책 비활성화: `channels.discord.dmPolicy="disabled"`
    - `pairing` 모드에서 페어링 승인 대기 중

  </Accordion>

  <Accordion title="봇 간 루프">
    기본적으로 봇이 작성한 메시지는 무시됩니다.

    `channels.discord.allowBots=true`를 설정하는 경우 루프 동작을 방지하기 위해 엄격한 언급 및 허용 목록 규칙을 사용하십시오.

  </Accordion>
</AccordionGroup>

## 구성 참조 포인터

기본 참조:

- [구성 참조 - Discord](/gateway/configuration-reference#discord)

주요 Discord 필드:

- 시작/인증: `enabled`, `token`, `accounts.*`, `allowBots`
- 정책: `groupPolicy`, `dm.*`, `guilds.*`, `guilds.*.channels.*`
- 명령: `commands.native`, `configWrites`, `slashCommand.*`
- 응답/히스토리: `replyToMode`, `historyLimit`, `dmHistoryLimit`
- 전달: `textChunkLimit`, `chunkMode`, `maxLinesPerMessage`
- 스트리밍: `streaming`, `draftChunk`
- 미디어/재시도: `mediaMaxMb`, `retry`
- 액션: `actions.*`
- 기능: `threadBindings`, `pluralkit`, `execApprovals`, `voice`

## 안전 및 운영

OpenClaw는 Discord 연결 상태를 모니터링합니다. 봇이 예상치 않게 오프라인 상태가 되거나 응답하지 않는 경우 `openclaw channels status --probe`와 `openclaw logs --follow`를 실행하십시오.

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [보안](/gateway/security)
- [채널 라우팅](/channels/channel-routing)
- [문제 해결](/channels/troubleshooting)
- [슬래시 명령](/tools/slash-commands)
