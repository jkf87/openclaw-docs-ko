---
summary: "Telegram 봇 지원 상태, 기능 및 구성"
read_when:
  - Telegram 기능 또는 webhook 작업 시
title: "Telegram"
---

grammY를 통한 봇 DM 및 그룹에서 프로덕션 준비 완료입니다. 기본 모드는 long polling이며, webhook 모드는 선택 사항입니다.

<CardGroup cols={3}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Telegram의 기본 DM 정책은 페어링입니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 복구 플레이북입니다.
  </Card>
  <Card title="게이트웨이 구성" icon="settings" href="/gateway/configuration">
    전체 채널 구성 패턴과 예시입니다.
  </Card>
</CardGroup>

## 빠른 설정

<Steps>
  <Step title="BotFather에서 봇 토큰 생성">
    Telegram을 열고 **@BotFather**와 대화를 시작합니다 (핸들이 정확히 `@BotFather`인지 확인).

    `/newbot`을 실행하고 프롬프트에 따라 진행한 후 토큰을 저장합니다.

  </Step>

  <Step title="토큰 및 DM 정책 구성">

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } },
    },
  },
}
```

    환경 변수 폴백: `TELEGRAM_BOT_TOKEN=...` (기본 계정에만 적용).
    Telegram은 `openclaw channels login telegram`을 사용하지 **않습니다**. 구성/환경 변수에서 토큰을 설정한 후 게이트웨이를 시작하세요.

  </Step>

  <Step title="게이트웨이 시작 및 첫 DM 승인">

```bash
openclaw gateway
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

    페어링 코드는 1시간 후 만료됩니다.

  </Step>

  <Step title="그룹에 봇 추가">
    봇을 그룹에 추가한 후, 접근 모델에 맞게 `channels.telegram.groups`와 `groupPolicy`를 설정합니다.
  </Step>
</Steps>

<Note>
토큰 해석 순서는 계정 인식 방식입니다. 실제로는 구성 값이 환경 변수 폴백보다 우선하며, `TELEGRAM_BOT_TOKEN`은 기본 계정에만 적용됩니다.
</Note>

## Telegram 측 설정

<AccordionGroup>
  <Accordion title="Privacy mode와 그룹 가시성">
    Telegram 봇은 기본적으로 **Privacy Mode**가 활성화되어 있어, 봇이 받을 수 있는 그룹 메시지를 제한합니다.

    봇이 모든 그룹 메시지를 볼 수 있어야 한다면, 다음 중 하나를 수행하세요:

    - `/setprivacy`를 통해 privacy mode를 비활성화하거나,
    - 봇을 그룹 관리자(admin)로 만듭니다.

    privacy mode를 토글할 때는, Telegram이 변경 사항을 적용하도록 각 그룹에서 봇을 제거 후 다시 추가하세요.

  </Accordion>

  <Accordion title="그룹 권한">
    관리자 상태는 Telegram 그룹 설정에서 제어됩니다.

    관리자 봇은 모든 그룹 메시지를 수신하므로, 항상 켜져 있는(always-on) 그룹 동작에 유용합니다.

  </Accordion>

  <Accordion title="유용한 BotFather 토글">

    - `/setjoingroups` — 그룹 추가 허용/거부
    - `/setprivacy` — 그룹 가시성 동작 설정

  </Accordion>
</AccordionGroup>

## 접근 제어 및 활성화

<Tabs>
  <Tab title="DM 정책">
    `channels.telegram.dmPolicy`는 다이렉트 메시지 접근을 제어합니다:

    - `pairing` (기본값)
    - `allowlist` (`allowFrom`에 최소 한 개의 발신자 ID 필요)
    - `open` (`allowFrom`에 `"*"` 포함 필요)
    - `disabled`

    `channels.telegram.allowFrom`은 숫자형 Telegram 사용자 ID를 허용합니다. `telegram:` / `tg:` 접두사는 허용되며 정규화됩니다.
    `allowFrom`이 비어 있는 `dmPolicy: "allowlist"`는 모든 DM을 차단하며, 구성 검증에서 거부됩니다.
    설정은 숫자형 사용자 ID만 요청합니다.
    업그레이드 후 구성에 `@username` allowlist 항목이 있다면, `openclaw doctor --fix`를 실행하여 해결하세요 (best-effort이며, Telegram 봇 토큰이 필요합니다).
    이전에 pairing-store allowlist 파일에 의존했다면, `openclaw doctor --fix`가 allowlist 흐름에서 항목을 `channels.telegram.allowFrom`으로 복구할 수 있습니다 (예: `dmPolicy: "allowlist"`에 아직 명시적 ID가 없는 경우).

    단일 소유자 봇의 경우, 접근 정책을 구성에 영구적으로 유지하려면 명시적 숫자 `allowFrom` ID와 함께 `dmPolicy: "allowlist"`를 선호하세요 (이전 페어링 승인에 의존하는 대신).

    흔한 혼동: DM 페어링 승인은 "이 발신자가 어디서든 인증됨"을 의미하지 않습니다.
    페어링은 DM 접근만 부여합니다. 그룹 발신자 인증은 여전히 명시적인 구성 allowlist에서 가져옵니다.
    "한 번 인증되면 DM과 그룹 명령이 모두 동작"하길 원한다면, 숫자형 Telegram 사용자 ID를 `channels.telegram.allowFrom`에 넣으세요.

    ### Telegram 사용자 ID 찾기

    더 안전한 방법 (서드파티 봇 없음):

    1. 봇에게 DM을 보냅니다.
    2. `openclaw logs --follow`를 실행합니다.
    3. `from.id`를 읽습니다.

    공식 Bot API 방법:

```bash
curl "https://api.telegram.org/bot<bot_token>/getUpdates"
```

    서드파티 방법 (프라이버시가 덜함): `@userinfobot` 또는 `@getidsbot`.

  </Tab>

  <Tab title="그룹 정책 및 allowlist">
    두 가지 제어가 함께 적용됩니다:

    1. **허용되는 그룹** (`channels.telegram.groups`)
       - `groups` 구성이 없을 때:
         - `groupPolicy: "open"`의 경우: 모든 그룹이 그룹 ID 체크를 통과할 수 있음
         - `groupPolicy: "allowlist"`(기본값)의 경우: `groups` 항목 (또는 `"*"`)을 추가할 때까지 그룹이 차단됨
       - `groups`가 구성됨: allowlist로 작동 (명시적 ID 또는 `"*"`)

    2. **그룹에서 허용되는 발신자** (`channels.telegram.groupPolicy`)
       - `open`
       - `allowlist` (기본값)
       - `disabled`

    `groupAllowFrom`은 그룹 발신자 필터링에 사용됩니다. 설정되지 않으면, Telegram은 `allowFrom`으로 폴백합니다.
    `groupAllowFrom` 항목은 숫자형 Telegram 사용자 ID여야 합니다 (`telegram:` / `tg:` 접두사는 정규화됨).
    Telegram 그룹 또는 슈퍼그룹 채팅 ID를 `groupAllowFrom`에 넣지 마세요. 음수 채팅 ID는 `channels.telegram.groups` 아래에 속합니다.
    숫자가 아닌 항목은 발신자 인증에 무시됩니다.
    보안 경계 (`2026.2.25+`): 그룹 발신자 인증은 DM pairing-store 승인을 **상속하지 않습니다**.
    페어링은 DM 전용으로 유지됩니다. 그룹의 경우 `groupAllowFrom` 또는 그룹별/주제(topic)별 `allowFrom`을 설정하세요.
    `groupAllowFrom`이 설정되지 않으면, Telegram은 pairing store가 아니라 구성의 `allowFrom`으로 폴백합니다.
    단일 소유자 봇을 위한 실용적 패턴: 사용자 ID를 `channels.telegram.allowFrom`에 설정하고, `groupAllowFrom`은 설정하지 않으며, 대상 그룹을 `channels.telegram.groups` 아래에 허용하는 것입니다.
    런타임 참고: `channels.telegram`이 완전히 누락된 경우, 런타임은 `channels.defaults.groupPolicy`가 명시적으로 설정되지 않는 한 fail-closed `groupPolicy="allowlist"`를 기본값으로 사용합니다.

    예시: 특정 그룹 하나의 모든 멤버 허용:

```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          groupPolicy: "open",
          requireMention: false,
        },
      },
    },
  },
}
```

    예시: 특정 그룹 내 특정 사용자만 허용:

```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          requireMention: true,
          allowFrom: ["8734062810", "745123456"],
        },
      },
    },
  },
}
```

    <Warning>
      흔한 실수: `groupAllowFrom`은 Telegram 그룹 allowlist가 **아닙니다**.

      - `-1001234567890` 같은 음수 Telegram 그룹 또는 슈퍼그룹 채팅 ID는 `channels.telegram.groups` 아래에 넣습니다.
      - `8734062810` 같은 Telegram 사용자 ID는 허용된 그룹 내에서 봇을 트리거할 수 있는 사람을 제한하려는 경우 `groupAllowFrom`에 넣습니다.
      - 허용된 그룹의 모든 멤버가 봇과 대화할 수 있게 하려는 경우에만 `groupAllowFrom: ["*"]`을 사용합니다.
    </Warning>

  </Tab>

  <Tab title="멘션(mention) 동작">
    그룹 응답은 기본적으로 멘션을 필요로 합니다.

    멘션은 다음에서 올 수 있습니다:

    - 네이티브 `@botusername` 멘션, 또는
    - 다음의 멘션 패턴:
      - `agents.list[].groupChat.mentionPatterns`
      - `messages.groupChat.mentionPatterns`

    세션 수준 명령 토글:

    - `/activation always`
    - `/activation mention`

    이는 세션 상태만 업데이트합니다. 영구 설정에는 config를 사용하세요.

    영구 구성 예시:

```json5
{
  channels: {
    telegram: {
      groups: {
        "*": { requireMention: false },
      },
    },
  },
}
```

    그룹 채팅 ID 얻기:

    - 그룹 메시지를 `@userinfobot` / `@getidsbot`으로 전달
    - 또는 `openclaw logs --follow`에서 `chat.id`를 읽기
    - 또는 Bot API `getUpdates` 검사

  </Tab>
</Tabs>

## 런타임 동작

- Telegram은 게이트웨이 프로세스가 소유합니다.
- 라우팅은 결정적입니다: Telegram 인바운드는 Telegram으로 응답합니다 (모델이 채널을 선택하지 않음).
- 인바운드 메시지는 공유 채널 envelope로 정규화되며 reply 메타데이터와 미디어 placeholder를 포함합니다.
- 그룹 세션은 group ID로 격리됩니다. 포럼 토픽은 `:topic:<threadId>`를 추가하여 토픽을 격리합니다.
- DM 메시지는 `message_thread_id`를 전달할 수 있으며, OpenClaw는 thread-aware 세션 키로 라우팅하고 응답을 위해 thread ID를 보존합니다.
- Long polling은 per-chat/per-thread 시퀀싱과 함께 grammY runner를 사용합니다. 전체 runner sink 동시성은 `agents.defaults.maxConcurrent`를 사용합니다.
- Long-polling watchdog 재시작은 기본적으로 `getUpdates` liveness 완료 없이 120초 후에 트리거됩니다. 배포 환경에서 장시간 작업 중 여전히 false polling-stall 재시작이 발생하는 경우에만 `channels.telegram.pollingStallThresholdMs`를 늘리세요. 값은 밀리초이며 `30000`부터 `600000`까지 허용되고, 계정별 override가 지원됩니다.
- Telegram Bot API는 읽음 영수증(read-receipt) 지원이 없습니다 (`sendReadReceipts`는 적용되지 않음).

## 기능 참조

<AccordionGroup>
  <Accordion title="라이브 스트림 프리뷰 (메시지 편집)">
    OpenClaw는 부분 응답을 실시간으로 스트리밍할 수 있습니다:

    - 다이렉트 채팅: 프리뷰 메시지 + `editMessageText`
    - 그룹/토픽: 프리뷰 메시지 + `editMessageText`

    요구 사항:

    - `channels.telegram.streaming`은 `off | partial | block | progress` (기본값: `partial`)
    - `progress`는 Telegram에서 `partial`로 매핑됩니다 (채널 간 명명 호환성)
    - `streaming.preview.toolProgress`는 도구/진행 상황 업데이트가 동일한 편집된 프리뷰 메시지를 재사용할지 여부를 제어합니다 (기본값: `true`). 별도의 도구/진행 메시지를 유지하려면 `false`로 설정하세요.
    - 레거시 `channels.telegram.streamMode` 및 boolean `streaming` 값은 자동 매핑됩니다.

    텍스트 전용 응답의 경우:

    - DM: OpenClaw는 동일한 프리뷰 메시지를 유지하고 제자리에서 최종 편집을 수행합니다 (두 번째 메시지 없음)
    - 그룹/토픽: OpenClaw는 동일한 프리뷰 메시지를 유지하고 제자리에서 최종 편집을 수행합니다 (두 번째 메시지 없음)

    복잡한 응답 (예: 미디어 페이로드)의 경우, OpenClaw는 일반 최종 전달로 폴백한 후 프리뷰 메시지를 정리합니다.

    프리뷰 스트리밍은 block 스트리밍과 별개입니다. Telegram에 대해 block 스트리밍이 명시적으로 활성화되면, OpenClaw는 double-streaming을 피하기 위해 프리뷰 스트림을 건너뜁니다.

    네이티브 draft 전송이 사용 불가능/거부되는 경우, OpenClaw는 자동으로 `sendMessage` + `editMessageText`로 폴백합니다.

    Telegram 전용 reasoning 스트림:

    - `/reasoning stream`은 생성 중에 reasoning을 라이브 프리뷰로 전송합니다
    - 최종 답변은 reasoning 텍스트 없이 전송됩니다

  </Accordion>

  <Accordion title="포맷팅 및 HTML 폴백">
    아웃바운드 텍스트는 Telegram `parse_mode: "HTML"`을 사용합니다.

    - Markdown 스타일 텍스트는 Telegram-safe HTML로 렌더링됩니다.
    - 원시 모델 HTML은 Telegram 파싱 실패를 줄이기 위해 escape 처리됩니다.
    - Telegram이 파싱된 HTML을 거부하면, OpenClaw는 일반 텍스트로 재시도합니다.

    링크 프리뷰는 기본적으로 활성화되며, `channels.telegram.linkPreview: false`로 비활성화할 수 있습니다.

  </Accordion>

  <Accordion title="네이티브 명령과 커스텀 명령">
    Telegram 명령 메뉴 등록은 시작 시 `setMyCommands`로 처리됩니다.

    네이티브 명령 기본값:

    - `commands.native: "auto"`는 Telegram에 대해 네이티브 명령을 활성화합니다.

    커스텀 명령 메뉴 항목 추가:

```json5
{
  channels: {
    telegram: {
      customCommands: [
        { command: "backup", description: "Git backup" },
        { command: "generate", description: "Create an image" },
      ],
    },
  },
}
```

    규칙:

    - 이름은 정규화됩니다 (선행 `/` 제거, 소문자)
    - 유효한 패턴: `a-z`, `0-9`, `_`, 길이 `1..32`
    - 커스텀 명령은 네이티브 명령을 덮어쓸 수 없습니다
    - 충돌/중복은 건너뛰고 기록됩니다

    참고:

    - 커스텀 명령은 메뉴 항목일 뿐이며, 동작을 자동 구현하지 않습니다
    - Telegram 메뉴에 표시되지 않더라도, 입력되면 플러그인/스킬 명령은 여전히 작동할 수 있습니다

    네이티브 명령이 비활성화되면, 내장(built-in) 명령은 제거됩니다. 커스텀/플러그인 명령은 구성된 경우 여전히 등록될 수 있습니다.

    일반적인 설정 실패:

    - `setMyCommands failed`와 `BOT_COMMANDS_TOO_MUCH`는 Telegram 메뉴가 트리밍 후에도 여전히 오버플로되었음을 의미합니다. 플러그인/스킬/커스텀 명령을 줄이거나 `channels.telegram.commands.native`를 비활성화하세요.
    - `setMyCommands failed`와 네트워크/fetch 오류는 보통 `api.telegram.org`로의 아웃바운드 DNS/HTTPS가 차단되었음을 의미합니다.

    ### 기기 페어링 명령 (`device-pair` 플러그인)

    `device-pair` 플러그인이 설치된 경우:

    1. `/pair`가 설정 코드를 생성합니다
    2. iOS 앱에 코드를 붙여넣습니다
    3. `/pair pending`이 대기 중인 요청을 나열합니다 (role/scopes 포함)
    4. 요청을 승인합니다:
       - 명시적 승인: `/pair approve <requestId>`
       - 대기 중 요청이 하나만 있는 경우: `/pair approve`
       - 최신 요청: `/pair approve latest`

    설정 코드는 수명이 짧은 bootstrap 토큰을 전달합니다. 내장 bootstrap handoff는 주 노드 토큰을 `scopes: []`로 유지합니다. handoff된 operator 토큰은 `operator.approvals`, `operator.read`, `operator.talk.secrets`, `operator.write`로 제한됩니다. Bootstrap scope 체크는 role-prefixed이므로, operator allowlist는 operator 요청만 충족하고, non-operator role은 자신의 role 접두사 아래 scope가 여전히 필요합니다.

    기기가 변경된 인증 세부 정보(예: role/scopes/공개 키)로 재시도하면, 이전 대기 요청은 대체되고 새 요청은 다른 `requestId`를 사용합니다. 승인 전에 `/pair pending`을 다시 실행하세요.

    자세한 내용: [페어링](/channels/pairing#pair-via-telegram-recommended-for-ios).

  </Accordion>

  <Accordion title="인라인 버튼">
    인라인 키보드 scope 구성:

```json5
{
  channels: {
    telegram: {
      capabilities: {
        inlineButtons: "allowlist",
      },
    },
  },
}
```

    계정별 override:

```json5
{
  channels: {
    telegram: {
      accounts: {
        main: {
          capabilities: {
            inlineButtons: "allowlist",
          },
        },
      },
    },
  },
}
```

    Scope:

    - `off`
    - `dm`
    - `group`
    - `all`
    - `allowlist` (기본값)

    레거시 `capabilities: ["inlineButtons"]`는 `inlineButtons: "all"`로 매핑됩니다.

    메시지 액션 예시:

```json5
{
  action: "send",
  channel: "telegram",
  to: "123456789",
  message: "Choose an option:",
  buttons: [
    [
      { text: "Yes", callback_data: "yes" },
      { text: "No", callback_data: "no" },
    ],
    [{ text: "Cancel", callback_data: "cancel" }],
  ],
}
```

    콜백 클릭은 에이전트에 텍스트로 전달됩니다:
    `callback_data: <value>`

  </Accordion>

  <Accordion title="에이전트 및 자동화를 위한 Telegram 메시지 액션">
    Telegram 도구 액션에는 다음이 포함됩니다:

    - `sendMessage` (`to`, `content`, 선택적 `mediaUrl`, `replyToMessageId`, `messageThreadId`)
    - `react` (`chatId`, `messageId`, `emoji`)
    - `deleteMessage` (`chatId`, `messageId`)
    - `editMessage` (`chatId`, `messageId`, `content`)
    - `createForumTopic` (`chatId`, `name`, 선택적 `iconColor`, `iconCustomEmojiId`)

    채널 메시지 액션은 사용하기 편리한 별칭(`send`, `react`, `delete`, `edit`, `sticker`, `sticker-search`, `topic-create`)을 노출합니다.

    게이팅 제어:

    - `channels.telegram.actions.sendMessage`
    - `channels.telegram.actions.deleteMessage`
    - `channels.telegram.actions.reactions`
    - `channels.telegram.actions.sticker` (기본값: 비활성화)

    참고: `edit`와 `topic-create`는 현재 기본적으로 활성화되어 있으며 별도의 `channels.telegram.actions.*` 토글이 없습니다.
    런타임 전송은 활성 config/secrets 스냅샷(시작/재로드)을 사용하므로, 액션 경로는 전송당 즉석 SecretRef 재해석을 수행하지 않습니다.

    Reaction 제거 시맨틱: [/tools/reactions](/tools/reactions)

  </Accordion>

  <Accordion title="Reply threading 태그">
    Telegram은 생성된 출력에서 명시적 reply threading 태그를 지원합니다:

    - `[[reply_to_current]]`는 트리거 메시지에 답장합니다
    - `[[reply_to:<id>]]`는 특정 Telegram 메시지 ID에 답장합니다

    `channels.telegram.replyToMode`는 처리를 제어합니다:

    - `off` (기본값)
    - `first`
    - `all`

    참고: `off`는 암시적 reply threading을 비활성화합니다. 명시적 `[[reply_to_*]]` 태그는 여전히 존중됩니다.

  </Accordion>

  <Accordion title="포럼 토픽 및 스레드 동작">
    포럼 슈퍼그룹:

    - 토픽 세션 키는 `:topic:<threadId>`를 추가합니다
    - 답장과 타이핑은 토픽 스레드를 대상으로 합니다
    - 토픽 구성 경로:
      `channels.telegram.groups.<chatId>.topics.<threadId>`

    General topic (`threadId=1`) 특수 케이스:

    - 메시지 전송은 `message_thread_id`를 생략합니다 (Telegram이 `sendMessage(...thread_id=1)`을 거부함)
    - 타이핑 액션은 여전히 `message_thread_id`를 포함합니다

    토픽 상속: 토픽 항목은 override되지 않는 한 그룹 설정을 상속합니다 (`requireMention`, `allowFrom`, `skills`, `systemPrompt`, `enabled`, `groupPolicy`).
    `agentId`는 토픽 전용이며 그룹 기본값에서 상속되지 않습니다.

    **토픽별 에이전트 라우팅**: 각 토픽은 토픽 구성에 `agentId`를 설정하여 다른 에이전트로 라우팅할 수 있습니다. 이를 통해 각 토픽은 격리된 작업 공간, 메모리, 세션을 갖습니다. 예시:

    ```json5
    {
      channels: {
        telegram: {
          groups: {
            "-1001234567890": {
              topics: {
                "1": { agentId: "main" },      // General topic → main agent
                "3": { agentId: "zu" },        // Dev topic → zu agent
                "5": { agentId: "coder" }      // Code review → coder agent
              }
            }
          }
        }
      }
    }
    ```

    그러면 각 토픽은 고유한 세션 키를 갖습니다: `agent:zu:telegram:group:-1001234567890:topic:3`

    **영구 ACP 토픽 바인딩**: 포럼 토픽은 최상위 typed ACP 바인딩 (`bindings[]`에 `type: "acp"` 및 `match.channel: "telegram"`, `peer.kind: "group"`, `-1001234567890:topic:42` 같은 topic-qualified id)을 통해 ACP harness 세션을 고정할 수 있습니다. 현재는 그룹/슈퍼그룹의 포럼 토픽으로 scope됩니다. [ACP Agents](/tools/acp-agents)를 참조하세요.

    **채팅에서 Thread-bound ACP spawn**: `/acp spawn <agent> --thread here|auto`는 현재 토픽을 새 ACP 세션에 바인딩합니다. 후속 메시지는 직접 그곳으로 라우팅됩니다. OpenClaw는 spawn 확인을 in-topic으로 고정합니다. `channels.telegram.threadBindings.spawnAcpSessions=true`가 필요합니다.

    템플릿 컨텍스트는 `MessageThreadId`와 `IsForum`을 노출합니다. `message_thread_id`가 있는 DM 채팅은 DM 라우팅을 유지하지만 thread-aware 세션 키를 사용합니다.

  </Accordion>

  <Accordion title="오디오, 비디오, 스티커">
    ### 오디오 메시지

    Telegram은 voice note와 오디오 파일을 구분합니다.

    - 기본: 오디오 파일 동작
    - 에이전트 응답의 `[[audio_as_voice]]` 태그로 voice-note 전송 강제

    메시지 액션 예시:

```json5
{
  action: "send",
  channel: "telegram",
  to: "123456789",
  media: "https://example.com/voice.ogg",
  asVoice: true,
}
```

    ### 비디오 메시지

    Telegram은 비디오 파일과 video note를 구분합니다.

    메시지 액션 예시:

```json5
{
  action: "send",
  channel: "telegram",
  to: "123456789",
  media: "https://example.com/video.mp4",
  asVideoNote: true,
}
```

    Video note는 캡션을 지원하지 않으며, 제공된 메시지 텍스트는 별도로 전송됩니다.

    ### 스티커

    인바운드 스티커 처리:

    - static WEBP: 다운로드 및 처리됨 (placeholder `<media:sticker>`)
    - animated TGS: 건너뜀
    - video WEBM: 건너뜀

    스티커 컨텍스트 필드:

    - `Sticker.emoji`
    - `Sticker.setName`
    - `Sticker.fileId`
    - `Sticker.fileUniqueId`
    - `Sticker.cachedDescription`

    스티커 캐시 파일:

    - `~/.openclaw/telegram/sticker-cache.json`

    스티커는 (가능한 경우) 한 번 설명되고 캐시되어 반복적인 비전 호출을 줄입니다.

    스티커 액션 활성화:

```json5
{
  channels: {
    telegram: {
      actions: {
        sticker: true,
      },
    },
  },
}
```

    스티커 전송 액션:

```json5
{
  action: "sticker",
  channel: "telegram",
  to: "123456789",
  fileId: "CAACAgIAAxkBAAI...",
}
```

    캐시된 스티커 검색:

```json5
{
  action: "sticker-search",
  channel: "telegram",
  query: "cat waving",
  limit: 5,
}
```

  </Accordion>

  <Accordion title="Reaction 알림">
    Telegram reaction은 `message_reaction` 업데이트로 도착합니다 (메시지 페이로드와 별개).

    활성화되면, OpenClaw는 다음과 같은 시스템 이벤트를 enqueue합니다:

    - `Telegram reaction added: 👍 by Alice (@alice) on msg 42`

    구성:

    - `channels.telegram.reactionNotifications`: `off | own | all` (기본값: `own`)
    - `channels.telegram.reactionLevel`: `off | ack | minimal | extensive` (기본값: `minimal`)

    참고:

    - `own`은 봇이 보낸 메시지에 대한 사용자 reaction만을 의미합니다 (sent-message cache를 통한 best-effort).
    - Reaction 이벤트는 여전히 Telegram 접근 제어(`dmPolicy`, `allowFrom`, `groupPolicy`, `groupAllowFrom`)를 존중하며, 권한 없는 발신자는 drop됩니다.
    - Telegram은 reaction 업데이트에 thread ID를 제공하지 않습니다.
      - non-forum 그룹은 그룹 채팅 세션으로 라우팅됩니다
      - forum 그룹은 정확한 원본 토픽이 아닌 그룹 general-topic 세션 (`:topic:1`)으로 라우팅됩니다

    polling/webhook을 위한 `allowed_updates`는 자동으로 `message_reaction`을 포함합니다.

  </Accordion>

  <Accordion title="Ack reactions">
    `ackReaction`은 OpenClaw가 인바운드 메시지를 처리하는 동안 확인(acknowledgement) 이모지를 전송합니다.

    해석 순서:

    - `channels.telegram.accounts.<accountId>.ackReaction`
    - `channels.telegram.ackReaction`
    - `messages.ackReaction`
    - 에이전트 identity 이모지 폴백 (`agents.list[].identity.emoji`, 없으면 "👀")

    참고:

    - Telegram은 유니코드 이모지를 기대합니다 (예: "👀").
    - 채널 또는 계정의 reaction을 비활성화하려면 `""`를 사용하세요.

  </Accordion>

  <Accordion title="Telegram 이벤트 및 명령에서 Config 쓰기">
    채널 config 쓰기는 기본적으로 활성화되어 있습니다 (`configWrites !== false`).

    Telegram 트리거 쓰기에는 다음이 포함됩니다:

    - `channels.telegram.groups`를 업데이트하기 위한 그룹 마이그레이션 이벤트 (`migrate_to_chat_id`)
    - `/config set`과 `/config unset` (명령 활성화 필요)

    비활성화:

```json5
{
  channels: {
    telegram: {
      configWrites: false,
    },
  },
}
```

  </Accordion>

  <Accordion title="Long polling vs webhook">
    기본값은 long polling입니다. Webhook 모드의 경우 `channels.telegram.webhookUrl`과 `channels.telegram.webhookSecret`을 설정하세요. 선택적으로 `webhookPath`, `webhookHost`, `webhookPort`를 설정할 수 있습니다 (기본값 `/telegram-webhook`, `127.0.0.1`, `8787`).

    로컬 리스너는 `127.0.0.1:8787`에 바인딩됩니다. public ingress의 경우, 로컬 포트 앞에 리버스 프록시를 두거나 의도적으로 `webhookHost: "0.0.0.0"`을 설정하세요.

  </Accordion>

  <Accordion title="제한, 재시도, CLI 대상">
    - `channels.telegram.textChunkLimit` 기본값은 4000입니다.
    - `channels.telegram.chunkMode="newline"`은 길이 분할 전에 단락 경계(빈 줄)를 선호합니다.
    - `channels.telegram.mediaMaxMb` (기본 100)는 인바운드 및 아웃바운드 Telegram 미디어 크기를 제한합니다.
    - `channels.telegram.timeoutSeconds`는 Telegram API 클라이언트 타임아웃을 override합니다 (설정되지 않으면 grammY 기본값이 적용됨).
    - `channels.telegram.pollingStallThresholdMs`는 기본적으로 `120000`입니다. false-positive polling-stall 재시작을 위해서만 `30000`과 `600000` 사이에서 튜닝하세요.
    - 그룹 컨텍스트 히스토리는 `channels.telegram.historyLimit` 또는 `messages.groupChat.historyLimit`(기본 50)을 사용합니다. `0`은 비활성화합니다.
    - 답장/인용/전달 보조 컨텍스트는 현재 받은 대로 전달됩니다.
    - Telegram allowlist는 주로 누가 에이전트를 트리거할 수 있는지를 게이팅하며, 전체 보조 컨텍스트 redaction 경계는 아닙니다.
    - DM 히스토리 제어:
      - `channels.telegram.dmHistoryLimit`
      - `channels.telegram.dms["<user_id>"].historyLimit`
    - `channels.telegram.retry` 구성은 복구 가능한 아웃바운드 API 오류에 대해 Telegram 전송 헬퍼(CLI/tools/actions)에 적용됩니다.

    CLI 전송 대상은 숫자 채팅 ID 또는 사용자 이름이 될 수 있습니다:

```bash
openclaw message send --channel telegram --target 123456789 --message "hi"
openclaw message send --channel telegram --target @name --message "hi"
```

    Telegram poll은 `openclaw message poll`을 사용하며 포럼 토픽을 지원합니다:

```bash
openclaw message poll --channel telegram --target 123456789 \
  --poll-question "Ship it?" --poll-option "Yes" --poll-option "No"
openclaw message poll --channel telegram --target -1001234567890:topic:42 \
  --poll-question "Pick a time" --poll-option "10am" --poll-option "2pm" \
  --poll-duration-seconds 300 --poll-public
```

    Telegram 전용 poll 플래그:

    - `--poll-duration-seconds` (5-600)
    - `--poll-anonymous`
    - `--poll-public`
    - 포럼 토픽용 `--thread-id` (또는 `:topic:` 타겟 사용)

    Telegram 전송은 다음도 지원합니다:

    - `channels.telegram.capabilities.inlineButtons`가 허용할 때 인라인 키보드를 위한 `buttons` 블록이 포함된 `--presentation`
    - 봇이 해당 채팅에서 고정할 수 있을 때 고정 전송을 요청하는 `--pin` 또는 `--delivery '{"pin":true}'`
    - 압축된 사진 또는 애니메이션 미디어 업로드 대신 아웃바운드 이미지와 GIF를 문서로 전송하는 `--force-document`

    액션 게이팅:

    - `channels.telegram.actions.sendMessage=false`는 poll을 포함하여 아웃바운드 Telegram 메시지를 비활성화합니다
    - `channels.telegram.actions.poll=false`는 일반 전송은 활성화된 상태로 Telegram poll 생성을 비활성화합니다

  </Accordion>

  <Accordion title="Telegram에서 exec 승인">
    Telegram은 승인자 DM에서 exec 승인을 지원하며, 선택적으로 원본 채팅이나 토픽에서 프롬프트를 게시할 수 있습니다. 승인자는 숫자형 Telegram 사용자 ID여야 합니다.

    구성 경로:

    - `channels.telegram.execApprovals.enabled` (최소 한 명의 승인자가 해석 가능할 때 자동 활성화)
    - `channels.telegram.execApprovals.approvers` (`allowFrom` / `defaultTo`의 숫자형 owner ID로 폴백)
    - `channels.telegram.execApprovals.target`: `dm` (기본값) | `channel` | `both`
    - `agentFilter`, `sessionFilter`

    채널 전달은 채팅에 명령 텍스트를 표시합니다. 신뢰할 수 있는 그룹/토픽에서만 `channel` 또는 `both`를 활성화하세요. 프롬프트가 포럼 토픽에 도착하면, OpenClaw는 승인 프롬프트와 후속 조치를 위해 토픽을 보존합니다. Exec 승인은 기본적으로 30분 후 만료됩니다.

    인라인 승인 버튼은 또한 `channels.telegram.capabilities.inlineButtons`가 대상 표면(`dm`, `group`, 또는 `all`)을 허용하도록 요구합니다. `plugin:` 접두사가 붙은 승인 ID는 플러그인 승인을 통해 해석되고, 나머지는 먼저 exec 승인을 통해 해석됩니다.

    [Exec 승인](/tools/exec-approvals)을 참조하세요.

  </Accordion>
</AccordionGroup>

## 오류 응답 제어

에이전트가 전달 또는 공급자 오류에 부딪히면, Telegram은 오류 텍스트로 응답하거나 이를 억제할 수 있습니다. 두 개의 config 키가 이 동작을 제어합니다:

| 키                                   | 값                | 기본값   | 설명                                                                                               |
| ----------------------------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `channels.telegram.errorPolicy`     | `reply`, `silent` | `reply` | `reply`는 친절한 오류 메시지를 채팅에 전송합니다. `silent`는 오류 응답을 완전히 억제합니다.                              |
| `channels.telegram.errorCooldownMs` | number (ms)       | `60000` | 동일 채팅에 대한 오류 응답 간 최소 시간입니다. 장애 동안 오류 spam을 방지합니다.                                        |

계정별, 그룹별, 토픽별 override가 지원됩니다 (다른 Telegram config 키와 동일한 상속).

```json5
{
  channels: {
    telegram: {
      errorPolicy: "reply",
      errorCooldownMs: 120000,
      groups: {
        "-1001234567890": {
          errorPolicy: "silent", // suppress errors in this group
        },
      },
    },
  },
}
```

## 문제 해결

<AccordionGroup>
  <Accordion title="봇이 멘션 없는 그룹 메시지에 응답하지 않음">

    - `requireMention=false`인 경우, Telegram privacy mode가 전체 가시성을 허용해야 합니다.
      - BotFather: `/setprivacy` -> Disable
      - 그런 다음 그룹에서 봇을 제거 후 다시 추가
    - `openclaw channels status`는 config가 멘션 없는 그룹 메시지를 기대할 때 경고합니다.
    - `openclaw channels status --probe`는 명시적인 숫자 그룹 ID를 확인할 수 있습니다. 와일드카드 `"*"`는 membership-probe될 수 없습니다.
    - 빠른 세션 테스트: `/activation always`.

  </Accordion>

  <Accordion title="봇이 그룹 메시지를 전혀 보지 못함">

    - `channels.telegram.groups`가 존재할 때, 그룹이 나열되어 있어야 합니다 (또는 `"*"` 포함)
    - 그룹의 봇 멤버십 확인
    - 로그 검토: skip 사유를 위한 `openclaw logs --follow`

  </Accordion>

  <Accordion title="명령이 부분적으로 또는 전혀 작동하지 않음">

    - 발신자 신원 인증 (페어링 및/또는 숫자형 `allowFrom`)
    - 그룹 정책이 `open`인 경우에도 명령 인증이 여전히 적용됨
    - `setMyCommands failed`와 `BOT_COMMANDS_TOO_MUCH`는 네이티브 메뉴에 항목이 너무 많음을 의미합니다. 플러그인/스킬/커스텀 명령을 줄이거나 네이티브 메뉴를 비활성화하세요
    - `setMyCommands failed`와 네트워크/fetch 오류는 보통 `api.telegram.org`로의 DNS/HTTPS 도달 가능성 문제를 나타냅니다

  </Accordion>

  <Accordion title="Polling 또는 네트워크 불안정">

    - Node 22+ + 커스텀 fetch/프록시는 AbortSignal 타입이 일치하지 않는 경우 즉시 abort 동작을 트리거할 수 있습니다.
    - 일부 호스트는 `api.telegram.org`를 IPv6로 먼저 해석합니다. 고장난 IPv6 egress는 간헐적 Telegram API 실패를 유발할 수 있습니다.
    - 로그에 `TypeError: fetch failed` 또는 `Network request for 'getUpdates' failed!`가 포함되면, OpenClaw는 이제 복구 가능한 네트워크 오류로 재시도합니다.
    - 로그에 `Polling stall detected`가 포함되면, OpenClaw는 기본적으로 long-poll liveness 완료 없이 120초 후에 polling을 재시작하고 Telegram transport를 재구축합니다.
    - long-running `getUpdates` 호출이 정상이지만 호스트에서 여전히 false polling-stall 재시작을 보고할 때만 `channels.telegram.pollingStallThresholdMs`를 늘리세요. 지속적인 stall은 보통 호스트와 `api.telegram.org` 사이의 프록시, DNS, IPv6 또는 TLS egress 문제를 가리킵니다.
    - 불안정한 직접 egress/TLS가 있는 VPS 호스트에서는, Telegram API 호출을 `channels.telegram.proxy`를 통해 라우팅하세요:

```yaml
channels:
  telegram:
    proxy: socks5://<user>:<password>@proxy-host:1080
```

    - Node 22+는 기본적으로 `autoSelectFamily=true` (WSL2 제외)와 `dnsResultOrder=ipv4first`를 사용합니다.
    - 호스트가 WSL2이거나 IPv4-only 동작에서 명시적으로 더 잘 작동하는 경우, family 선택을 강제하세요:

```yaml
channels:
  telegram:
    network:
      autoSelectFamily: false
```

    - RFC 2544 벤치마크 범위 응답(`198.18.0.0/15`)은 Telegram 미디어 다운로드에 대해 기본적으로 이미 허용됩니다. 신뢰할 수 있는 fake-IP 또는 투명 프록시가 미디어 다운로드 중 `api.telegram.org`를 다른 private/internal/special-use 주소로 rewrite한다면, Telegram 전용 bypass를 opt-in할 수 있습니다:

```yaml
channels:
  telegram:
    network:
      dangerouslyAllowPrivateNetwork: true
```

    - 동일한 opt-in은 계정별로 `channels.telegram.accounts.<accountId>.network.dangerouslyAllowPrivateNetwork`에서 사용 가능합니다.
    - 프록시가 Telegram 미디어 호스트를 `198.18.x.x`로 해석하는 경우, 먼저 위험한 플래그는 끄세요. Telegram 미디어는 이미 기본적으로 RFC 2544 벤치마크 범위를 허용합니다.

    <Warning>
      `channels.telegram.network.dangerouslyAllowPrivateNetwork`는 Telegram 미디어 SSRF 보호를 약화시킵니다. Clash, Mihomo, Surge fake-IP 라우팅처럼 RFC 2544 벤치마크 범위 외부에서 private 또는 special-use 응답을 합성할 때의 신뢰할 수 있는 operator-controlled 프록시 환경에서만 사용하세요. 일반 public 인터넷 Telegram 접근에서는 꺼 두세요.
    </Warning>

    - 환경 변수 override (임시):
      - `OPENCLAW_TELEGRAM_DISABLE_AUTO_SELECT_FAMILY=1`
      - `OPENCLAW_TELEGRAM_ENABLE_AUTO_SELECT_FAMILY=1`
      - `OPENCLAW_TELEGRAM_DNS_RESULT_ORDER=ipv4first`
    - DNS 응답 검증:

```bash
dig +short api.telegram.org A
dig +short api.telegram.org AAAA
```

  </Accordion>
</AccordionGroup>

추가 도움말: [채널 문제 해결](/channels/troubleshooting).

## 구성 참조

기본 참조: [구성 참조 - Telegram](/gateway/config-channels#telegram).

<Accordion title="주요 Telegram 필드">

- 시작/인증: `enabled`, `botToken`, `tokenFile`, `accounts.*` (`tokenFile`은 일반 파일을 가리켜야 하며, 심볼릭 링크는 거부됩니다)
- 접근 제어: `dmPolicy`, `allowFrom`, `groupPolicy`, `groupAllowFrom`, `groups`, `groups.*.topics.*`, 최상위 `bindings[]` (`type: "acp"`)
- exec 승인: `execApprovals`, `accounts.*.execApprovals`
- 명령/메뉴: `commands.native`, `commands.nativeSkills`, `customCommands`
- threading/답장: `replyToMode`
- 스트리밍: `streaming` (프리뷰), `streaming.preview.toolProgress`, `blockStreaming`
- 포맷팅/전달: `textChunkLimit`, `chunkMode`, `linkPreview`, `responsePrefix`
- 미디어/네트워크: `mediaMaxMb`, `timeoutSeconds`, `pollingStallThresholdMs`, `retry`, `network.autoSelectFamily`, `network.dangerouslyAllowPrivateNetwork`, `proxy`
- webhook: `webhookUrl`, `webhookSecret`, `webhookPath`, `webhookHost`
- 액션/기능: `capabilities.inlineButtons`, `actions.sendMessage|editMessage|deleteMessage|reactions|sticker`
- reaction: `reactionNotifications`, `reactionLevel`
- 오류: `errorPolicy`, `errorCooldownMs`
- 쓰기/히스토리: `configWrites`, `historyLimit`, `dmHistoryLimit`, `dms.*.historyLimit`

</Accordion>

<Note>
Multi-account 우선순위: 두 개 이상의 계정 ID가 구성된 경우, 기본 라우팅을 명시적으로 만들기 위해 `channels.telegram.defaultAccount`를 설정하거나 `channels.telegram.accounts.default`를 포함하세요. 그렇지 않으면 OpenClaw는 첫 번째 정규화된 계정 ID로 폴백하며 `openclaw doctor`가 경고합니다. 명명된 계정은 `channels.telegram.allowFrom` / `groupAllowFrom`을 상속하지만, `accounts.default.*` 값은 상속하지 않습니다.
</Note>

## 관련 문서

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Telegram 사용자를 게이트웨이에 페어링합니다.
  </Card>
  <Card title="그룹" icon="users" href="/channels/groups">
    그룹 및 토픽 allowlist 동작입니다.
  </Card>
  <Card title="채널 라우팅" icon="route" href="/channels/channel-routing">
    인바운드 메시지를 에이전트로 라우팅합니다.
  </Card>
  <Card title="보안" icon="shield" href="/gateway/security/">
    위협 모델 및 hardening입니다.
  </Card>
  <Card title="멀티 에이전트 라우팅" icon="sitemap" href="/concepts/multi-agent">
    그룹과 토픽을 에이전트에 매핑합니다.
  </Card>
  <Card title="문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단입니다.
  </Card>
</CardGroup>
