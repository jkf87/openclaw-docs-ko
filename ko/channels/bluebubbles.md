---
summary: "BlueBubbles macOS 서버를 통한 iMessage 연동 (REST 송수신, 타이핑, 리액션, 페어링, 고급 액션)."
read_when:
  - BlueBubbles 채널 설정 시
  - 웹훅 페어링 문제 해결 시
  - macOS에서 iMessage 구성 시
title: "BlueBubbles"
---

# BlueBubbles (macOS REST)

상태: BlueBubbles macOS 서버와 HTTP로 통신하는 번들 플러그인입니다. 레거시 imsg 채널에 비해 더 풍부한 API와 쉬운 설정을 제공하여 **iMessage 연동에 권장됩니다**.

## 번들 플러그인

현재 OpenClaw 릴리스는 BlueBubbles를 번들로 포함하므로, 일반적인 패키지 빌드에서는 별도의 `openclaw plugins install` 단계가 필요하지 않습니다.

## 개요

- macOS에서 BlueBubbles 헬퍼 앱([bluebubbles.app](https://bluebubbles.app))을 통해 실행됩니다.
- 권장/테스트 환경: macOS Sequoia (15). macOS Tahoe (26)도 동작하지만, 현재 Tahoe에서는 edit가 동작하지 않으며 group 아이콘 업데이트는 성공으로 보고되어도 동기화되지 않을 수 있습니다.
- OpenClaw는 REST API(`GET /api/v1/ping`, `POST /message/text`, `POST /chat/:id/*`)를 통해 통신합니다.
- 인바운드 메시지는 웹훅으로 도착하고, 응답 송신, 타이핑 인디케이터, 읽음 확인, tapback은 REST 호출로 처리됩니다.
- 첨부 파일과 스티커는 인바운드 미디어로 수집됩니다(가능한 경우 에이전트에게 노출됩니다).
- 페어링/허용 목록은 다른 채널(`/channels/pairing` 등)과 동일한 방식으로 `channels.bluebubbles.allowFrom` + 페어링 코드를 사용합니다.
- 리액션은 Slack/Telegram과 마찬가지로 시스템 이벤트로 노출되어, 에이전트가 응답하기 전에 "mention"할 수 있습니다.
- 고급 기능: edit, unsend, reply threading, message effects, group 관리.

## 빠른 시작

1. Mac에 BlueBubbles 서버를 설치합니다([bluebubbles.app/install](https://bluebubbles.app/install) 안내 참고).
2. BlueBubbles 설정에서 웹 API를 활성화하고 비밀번호를 설정합니다.
3. `openclaw onboard`를 실행하여 BlueBubbles를 선택하거나, 수동으로 구성합니다.

   ```json5
   {
     channels: {
       bluebubbles: {
         enabled: true,
         serverUrl: "http://192.168.1.100:1234",
         password: "example-password",
         webhookPath: "/bluebubbles-webhook",
       },
     },
   }
   ```

4. BlueBubbles 웹훅을 게이트웨이로 지정합니다(예: `https://your-gateway-host:3000/bluebubbles-webhook?password=<password>`).
5. 게이트웨이를 시작하면 웹훅 핸들러를 등록하고 페어링을 시작합니다.

보안 참고:

- 항상 웹훅 비밀번호를 설정하세요.
- 웹훅 인증은 항상 필수입니다. OpenClaw는 루프백/프록시 토폴로지와 무관하게, `channels.bluebubbles.password`와 일치하는 password/guid(예: `?password=<password>` 또는 `x-password`)를 포함하지 않는 BlueBubbles 웹훅 요청을 거부합니다.
- 비밀번호 인증은 전체 웹훅 body를 읽기/파싱하기 전에 검사됩니다.

## Messages.app 활성 상태 유지 (VM / 헤드리스 환경)

일부 macOS VM / 상시 가동 환경에서는 Messages.app이 "idle" 상태가 되어(앱을 열거나 foreground로 전환할 때까지 인바운드 이벤트가 멈춤) 수신이 중단될 수 있습니다. 간단한 해결책은 AppleScript + LaunchAgent를 사용하여 **5분마다 Messages를 깨우는 것**입니다.

### 1) AppleScript 저장

다음 파일로 저장합니다.

- `~/Scripts/poke-messages.scpt`

예제 스크립트(비대화형; 포커스를 빼앗지 않음):

```applescript
try
  tell application "Messages"
    if not running then
      launch
    end if

    -- Touch the scripting interface to keep the process responsive.
    set _chatCount to (count of chats)
  end tell
on error
  -- Ignore transient failures (first-run prompts, locked session, etc).
end try
```

### 2) LaunchAgent 설치

다음 파일로 저장합니다.

- `~/Library/LaunchAgents/com.user.poke-messages.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.user.poke-messages</string>

    <key>ProgramArguments</key>
    <array>
      <string>/bin/bash</string>
      <string>-lc</string>
      <string>/usr/bin/osascript &quot;$HOME/Scripts/poke-messages.scpt&quot;</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>StartInterval</key>
    <integer>300</integer>

    <key>StandardOutPath</key>
    <string>/tmp/poke-messages.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/poke-messages.err</string>
  </dict>
</plist>
```

참고:

- 이 스크립트는 **300초마다** 그리고 **로그인 시**에 실행됩니다.
- 처음 실행 시 macOS **자동화(Automation)** 프롬프트(`osascript` → Messages)가 나타날 수 있습니다. LaunchAgent를 실행하는 동일한 사용자 세션에서 승인하세요.

로드 방법:

```bash
launchctl unload ~/Library/LaunchAgents/com.user.poke-messages.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.user.poke-messages.plist
```

## 온보딩

BlueBubbles는 대화형 온보딩에서 사용할 수 있습니다.

```
openclaw onboard
```

마법사는 다음을 묻습니다.

- **Server URL** (필수): BlueBubbles 서버 주소(예: `http://192.168.1.100:1234`)
- **Password** (필수): BlueBubbles 서버 설정에서 확인할 수 있는 API 비밀번호
- **Webhook path** (선택): 기본값 `/bluebubbles-webhook`
- **DM 정책**: pairing, allowlist, open, disabled
- **허용 목록**: 전화번호, 이메일, chat 대상

CLI로도 BlueBubbles를 추가할 수 있습니다.

```
openclaw channels add bluebubbles --http-url http://192.168.1.100:1234 --password <password>
```

## 접근 제어 (DM + group)

DM:

- 기본값: `channels.bluebubbles.dmPolicy = "pairing"`.
- 모르는 발신자는 페어링 코드를 받으며, 승인될 때까지 메시지는 무시됩니다(코드는 1시간 후 만료).
- 승인 방법:
  - `openclaw pairing list bluebubbles`
  - `openclaw pairing approve bluebubbles <CODE>`
- 페어링은 기본 토큰 교환 방식입니다. 자세한 내용: [페어링](/channels/pairing)

Group:

- `channels.bluebubbles.groupPolicy = open | allowlist | disabled` (기본값: `allowlist`).
- `channels.bluebubbles.groupAllowFrom`는 `allowlist`가 설정되었을 때 group에서 트리거할 수 있는 사람을 제어합니다.

### 연락처 이름 보강 (macOS, 선택)

BlueBubbles group 웹훅은 대개 원시 참가자 주소만 포함합니다. `GroupMembers` context에 로컬 연락처 이름을 표시하고 싶다면, macOS에서 로컬 연락처(Contacts) 보강을 선택적으로 활성화할 수 있습니다.

- `channels.bluebubbles.enrichGroupParticipantsFromContacts = true`로 조회를 활성화합니다. 기본값: `false`.
- 조회는 group 접근, 명령어 인증, mention 게이팅이 메시지를 통과시킨 후에만 실행됩니다.
- 이름이 없는 전화 참가자만 보강됩니다.
- 로컬 매칭이 없으면 원시 전화번호가 폴백으로 유지됩니다.

```json5
{
  channels: {
    bluebubbles: {
      enrichGroupParticipantsFromContacts: true,
    },
  },
}
```

### Mention 게이팅 (group)

BlueBubbles는 iMessage/WhatsApp 동작과 동일하게 group chat에 대한 mention 게이팅을 지원합니다.

- `agents.list[].groupChat.mentionPatterns`(또는 `messages.groupChat.mentionPatterns`)을 사용하여 mention을 감지합니다.
- group에 대해 `requireMention`이 활성화되면, 에이전트는 mention될 때만 응답합니다.
- 인증된 발신자의 제어 명령어는 mention 게이팅을 우회합니다.

Group별 구성:

```json5
{
  channels: {
    bluebubbles: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true }, // 모든 group의 기본값
        "iMessage;-;chat123": { requireMention: false }, // 특정 group 오버라이드
      },
    },
  },
}
```

### 명령어 게이팅

- 제어 명령어(예: `/config`, `/model`)는 인증이 필요합니다.
- 명령어 인증을 결정하기 위해 `allowFrom`과 `groupAllowFrom`을 사용합니다.
- 인증된 발신자는 group에서 mention 없이도 제어 명령어를 실행할 수 있습니다.

### Group별 시스템 프롬프트

`channels.bluebubbles.groups.*` 아래의 각 항목은 선택적인 `systemPrompt` 문자열을 받습니다. 이 값은 해당 group의 메시지를 처리하는 매 턴마다 에이전트의 시스템 프롬프트에 주입되므로, 에이전트 프롬프트를 편집하지 않고도 group별 페르소나나 행동 규칙을 설정할 수 있습니다.

```json5
{
  channels: {
    bluebubbles: {
      groups: {
        "iMessage;-;chat123": {
          systemPrompt: "Keep responses under 3 sentences. Mirror the group's casual tone.",
        },
      },
    },
  },
}
```

키는 BlueBubbles가 해당 group에 대해 보고하는 `chatGuid` / `chatIdentifier` / 숫자 `chatId`와 일치하며, `"*"` 와일드카드 항목은 정확히 일치하지 않는 모든 group에 대한 기본값을 제공합니다(`requireMention`과 group별 도구 정책에서 사용하는 것과 동일한 패턴). 정확한 일치는 항상 와일드카드보다 우선합니다. DM은 이 필드를 무시하므로, 에이전트 수준 또는 계정 수준의 프롬프트 사용자 정의를 사용하세요.

#### 작동 예제: threaded reply와 tapback 리액션 (Private API)

BlueBubbles Private API가 활성화되면, 인바운드 메시지는 짧은 메시지 ID(예: `[[reply_to:5]]`)와 함께 도착하며, 에이전트는 `action=reply`를 호출하여 특정 메시지에 스레드로 연결하거나 `action=react`로 tapback을 남길 수 있습니다. Group별 `systemPrompt`는 에이전트가 적절한 도구를 선택하도록 유도하는 신뢰할 수 있는 방법입니다.

```json5
{
  channels: {
    bluebubbles: {
      groups: {
        "iMessage;+;chat-family": {
          systemPrompt: [
            "When replying in this group, always call action=reply with the",
            "[[reply_to:N]] messageId from context so your response threads",
            "under the triggering message. Never send a new unlinked message.",
            "",
            "For short acknowledgements ('ok', 'got it', 'on it'), use",
            "action=react with an appropriate tapback emoji (❤️, 👍, 😂, ‼️, ❓)",
            "instead of sending a text reply.",
          ].join(" "),
        },
      },
    },
  },
}
```

Tapback 리액션과 threaded reply는 모두 BlueBubbles Private API를 필요로 합니다. 자세한 내용은 [고급 액션](#advanced-actions)과 [메시지 ID](#message-ids-short-vs-full)를 참고하세요.

## ACP 대화 바인딩

BlueBubbles chat은 전송 계층을 바꾸지 않고도 영속적인 ACP 워크스페이스로 전환할 수 있습니다.

빠른 운영자 플로우:

- 허용된 DM 또는 group chat 안에서 `/acp spawn codex --bind here`를 실행합니다.
- 해당 BlueBubbles 대화의 이후 메시지는 생성된 ACP 세션으로 라우팅됩니다.
- `/new`와 `/reset`은 바인딩된 동일한 ACP 세션을 제자리에서 재설정합니다.
- `/acp close`는 ACP 세션을 닫고 바인딩을 제거합니다.

`type: "acp"`와 `match.channel: "bluebubbles"`을 갖는 최상위 `bindings[]` 항목을 통해 구성된 영속 바인딩도 지원됩니다.

`match.peer.id`는 지원되는 모든 BlueBubbles 대상 형식을 사용할 수 있습니다.

- 정규화된 DM 핸들(예: `+15555550123` 또는 `user@example.com`)
- `chat_id:<id>`
- `chat_guid:<guid>`
- `chat_identifier:<identifier>`

안정적인 group 바인딩을 위해서는 `chat_id:*` 또는 `chat_identifier:*`를 선호하세요.

예제:

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: { agent: "codex", backend: "acpx", mode: "persistent" },
        },
      },
    ],
  },
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "bluebubbles",
        accountId: "default",
        peer: { kind: "dm", id: "+15555550123" },
      },
      acp: { label: "codex-imessage" },
    },
  ],
}
```

공유 ACP 바인딩 동작은 [ACP Agents](/tools/acp-agents)를 참고하세요.

## 타이핑 + 읽음 확인

- **타이핑 인디케이터**: 응답 생성 전과 생성 중에 자동으로 전송됩니다.
- **읽음 확인**: `channels.bluebubbles.sendReadReceipts`로 제어됩니다(기본값: `true`).
- **타이핑 인디케이터**: OpenClaw는 typing start 이벤트를 전송하며, BlueBubbles는 전송 시 또는 타임아웃 시 자동으로 타이핑을 지웁니다(DELETE를 통한 수동 정지는 신뢰할 수 없습니다).

```json5
{
  channels: {
    bluebubbles: {
      sendReadReceipts: false, // 읽음 확인 비활성화
    },
  },
}
```

## 고급 액션

BlueBubbles는 설정에서 활성화하면 고급 메시지 액션을 지원합니다.

```json5
{
  channels: {
    bluebubbles: {
      actions: {
        reactions: true, // tapbacks (기본값: true)
        edit: true, // 전송한 메시지 편집 (macOS 13+, macOS 26 Tahoe에서 동작하지 않음)
        unsend: true, // 메시지 언센드 (macOS 13+)
        reply: true, // 메시지 GUID로 reply threading
        sendWithEffect: true, // 메시지 효과 (slam, loud 등)
        renameGroup: true, // group chat 이름 변경
        setGroupIcon: true, // group chat 아이콘/사진 설정 (macOS 26 Tahoe에서 불안정)
        addParticipant: true, // group에 참가자 추가
        removeParticipant: true, // group에서 참가자 제거
        leaveGroup: true, // group chat 나가기
        sendAttachment: true, // 첨부 파일/미디어 전송
      },
    },
  },
}
```

사용 가능한 액션:

- **react**: tapback 리액션 추가/제거(`messageId`, `emoji`, `remove`). iMessage의 기본 tapback 세트는 `love`, `like`, `dislike`, `laugh`, `emphasize`, `question`입니다. 에이전트가 해당 세트 외의 이모지(예: `👀`)를 선택하면, 리액션 도구는 `love`로 폴백하여 전체 요청이 실패하지 않고 tapback이 렌더링되도록 합니다. 구성된 ack 리액션은 여전히 엄격하게 검증되며 알 수 없는 값에는 오류를 발생시킵니다.
- **edit**: 전송한 메시지 편집(`messageId`, `text`)
- **unsend**: 메시지 언센드(`messageId`)
- **reply**: 특정 메시지에 reply(`messageId`, `text`, `to`)
- **sendWithEffect**: iMessage 효과로 전송(`text`, `to`, `effectId`)
- **renameGroup**: group chat 이름 변경(`chatGuid`, `displayName`)
- **setGroupIcon**: group chat의 아이콘/사진 설정(`chatGuid`, `media`) — macOS 26 Tahoe에서 불안정(API가 성공을 반환해도 아이콘이 동기화되지 않을 수 있음).
- **addParticipant**: group에 사람 추가(`chatGuid`, `address`)
- **removeParticipant**: group에서 사람 제거(`chatGuid`, `address`)
- **leaveGroup**: group chat 나가기(`chatGuid`)
- **upload-file**: 미디어/파일 전송(`to`, `buffer`, `filename`, `asVoice`)
  - 음성 메모: iMessage 음성 메시지로 전송하려면 `asVoice: true`와 **MP3** 또는 **CAF** 오디오를 설정합니다. BlueBubbles는 음성 메모 전송 시 MP3 → CAF로 변환합니다.
- 레거시 별칭: `sendAttachment`도 여전히 동작하지만, `upload-file`이 표준 액션 이름입니다.

### 메시지 ID (짧은 형식 vs 전체 형식)

OpenClaw는 토큰을 절약하기 위해 _짧은_ 메시지 ID(예: `1`, `2`)를 노출할 수 있습니다.

- `MessageSid` / `ReplyToId`는 짧은 ID일 수 있습니다.
- `MessageSidFull` / `ReplyToIdFull`에는 프로바이더의 전체 ID가 포함됩니다.
- 짧은 ID는 인메모리에 저장되므로, 재시작이나 캐시 eviction 시 만료될 수 있습니다.
- 액션은 짧거나 전체 `messageId`를 모두 받지만, 짧은 ID가 더 이상 사용 불가능하면 오류가 발생합니다.

영구 자동화 및 저장에는 전체 ID를 사용하세요.

- 템플릿: `{{MessageSidFull}}`, `{{ReplyToIdFull}}`
- Context: 인바운드 페이로드의 `MessageSidFull` / `ReplyToIdFull`

템플릿 변수는 [구성](/gateway/configuration)을 참고하세요.

<a id="coalescing-split-send-dms-command--url-in-one-composition"></a>

## Split-send DM 병합 (한 작성에 명령어 + URL)

사용자가 iMessage에서 명령어와 URL을 함께 입력하면(예: `Dump https://example.com/article`), Apple은 전송을 **두 개의 별도 웹훅 전달**로 분할합니다.

1. 텍스트 메시지(`"Dump"`).
2. OG-프리뷰 이미지를 첨부로 갖는 URL-프리뷰 풍선(`"https://..."`).

두 웹훅은 대부분의 환경에서 약 0.8-2.0초 간격으로 OpenClaw에 도착합니다. 병합을 하지 않으면, 에이전트는 턴 1에서 명령어만 받고 응답(종종 "send me the URL")하며, 턴 2에서야 URL을 보게 되는데, 이 시점에는 이미 명령어 context가 사라져 있습니다.

`channels.bluebubbles.coalesceSameSenderDms`는 DM이 연속된 동일 발신자 웹훅을 단일 에이전트 턴으로 병합하도록 옵트인합니다. Group chat은 계속해서 메시지별로 키를 구분하여 다중 사용자 턴 구조가 보존됩니다.

### 언제 활성화해야 하나요

다음의 경우 활성화하세요.

- 하나의 메시지로 `command + payload`를 기대하는 스킬을 제공하는 경우(dump, paste, save, queue 등).
- 사용자가 명령어와 함께 URL, 이미지, 긴 콘텐츠를 붙여 넣는 경우.
- 추가된 DM 턴 지연을 수용할 수 있는 경우(아래 참조).

다음의 경우 비활성화로 유지하세요.

- 한 단어 DM 트리거에 대해 최소 명령어 지연이 필요한 경우.
- 모든 플로우가 payload 후속 없이 일회성 명령어인 경우.

### 활성화

```json5
{
  channels: {
    bluebubbles: {
      coalesceSameSenderDms: true, // 옵트인 (기본값: false)
    },
  },
}
```

플래그가 켜져 있고 `messages.inbound.byChannel.bluebubbles`가 명시되지 않으면, 디바운스 창이 **2500ms**로 확장됩니다(비병합 기본값은 500ms). 넓은 창은 필수입니다. Apple의 split-send 간격인 0.8-2.0초는 더 좁은 기본값에 맞지 않습니다.

직접 창을 조정하려면:

```json5
{
  messages: {
    inbound: {
      byChannel: {
        // 2500 ms는 대부분의 환경에서 동작합니다. Mac이 느리거나
        // 메모리 압박이 있는 경우 4000 ms로 올리세요(관찰된 간격이
        // 2초를 넘는 경우가 있습니다).
        bluebubbles: 2500,
      },
    },
  },
}
```

### 트레이드오프

- **DM 제어 명령어의 추가 지연.** 플래그가 켜지면, DM 제어 명령어 메시지(`Dump`, `Save` 등)는 payload 웹훅이 올 수 있으므로 디스패치 전에 디바운스 창만큼 대기합니다. Group chat 명령어는 즉시 디스패치를 유지합니다.
- **병합된 출력은 제한됨** — 병합된 텍스트는 4000자로 제한되며 명시적 `…[truncated]` 마커가 붙고, 첨부는 20개, 소스 항목은 10개로 제한됩니다(이후에는 처음과 최신 항목만 유지). 모든 소스 `messageId`는 여전히 인바운드 중복 제거에 도달하므로 MessagePoller가 나중에 개별 이벤트를 재생하더라도 중복으로 인식됩니다.
- **채널별 옵트인.** 다른 채널(Telegram, WhatsApp, Slack 등)은 영향을 받지 않습니다.

### 시나리오와 에이전트가 보는 내용

| 사용자 작성                                                        | Apple의 전달              | 플래그 off (기본값)                     | 플래그 on + 2500ms 창                                                   |
| ------------------------------------------------------------------ | ------------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| `Dump https://example.com` (한 번 전송)                            | 웹훅 2개, 약 1초 간격     | 에이전트 턴 2회: "Dump" 단독, 그 후 URL | 1회 턴: 병합된 텍스트 `Dump https://example.com`                        |
| `Save this 📎image.jpg caption` (첨부 + 텍스트)                    | 웹훅 2개                  | 턴 2회                                  | 1회 턴: 텍스트 + 이미지                                                 |
| `/status` (단독 명령어)                                            | 웹훅 1개                  | 즉시 디스패치                           | **창만큼 대기 후 디스패치**                                             |
| URL 단독 전송                                                      | 웹훅 1개                  | 즉시 디스패치                           | 즉시 디스패치 (버킷에 항목 하나뿐)                                      |
| 수 분 간격으로 의도적으로 별개로 보낸 텍스트 + URL                 | 창 밖의 웹훅 2개          | 턴 2회                                  | 턴 2회 (창이 만료됨)                                                    |
| 빠른 플러드 (창 내 >10개의 짧은 DM)                                | 웹훅 N개                  | 턴 N회                                  | 1회 턴, 제한된 출력 (처음 + 최신, 텍스트/첨부 제한 적용)                |

### Split-send 병합 문제 해결

플래그가 켜져 있는데도 split-send가 여전히 두 턴으로 도착한다면, 각 계층을 점검하세요.

1. **설정이 실제로 로드되었는가.**

   ```
   grep coalesceSameSenderDms ~/.openclaw/openclaw.json
   ```

   이후 `openclaw gateway restart` — 플래그는 디바운서 레지스트리 생성 시 읽힙니다.

2. **디바운스 창이 환경에 충분히 넓은가.** `~/Library/Logs/bluebubbles-server/main.log`에서 BlueBubbles 서버 로그를 확인하세요.

   ```
   grep -E "Dispatching event to webhook" main.log | tail -20
   ```

   `"Dump"` 스타일 텍스트 디스패치와 그 뒤를 잇는 `"https://..."; Attachments:` 디스패치 간의 간격을 측정하세요. `messages.inbound.byChannel.bluebubbles`를 해당 간격을 여유 있게 커버하도록 올리세요.

3. **세션 JSONL 타임스탬프 ≠ 웹훅 도착.** 세션 이벤트 타임스탬프(`~/.openclaw/agents/<id>/sessions/*.jsonl`)는 게이트웨이가 에이전트에게 메시지를 전달한 시점을 반영하며, 웹훅이 도착한 시점이 **아닙니다**. `[Queued messages while agent was busy]`로 태그된 두 번째 큐잉 메시지는, 두 번째 웹훅이 도착했을 때 첫 번째 턴이 아직 실행 중이었음을 의미합니다. 즉 병합 버킷이 이미 플러시된 상태입니다. 세션 로그가 아니라 BB 서버 로그에 맞춰 창을 조정하세요.

4. **메모리 압박으로 인한 응답 디스패치 지연.** 작은 머신(8 GB)에서는 에이전트 턴이 응답 완료 전에 병합 버킷을 플러시할 만큼 길어질 수 있어, URL이 큐잉된 두 번째 턴으로 도착합니다. `memory_pressure`와 `ps -o rss -p $(pgrep openclaw-gateway)`를 확인하세요. 게이트웨이가 약 500 MB RSS 이상이고 compressor가 활성화된 경우, 무거운 다른 프로세스를 종료하거나 더 큰 호스트로 업그레이드하세요.

5. **Reply-quote 전송은 다른 경로입니다.** 사용자가 기존 URL 풍선에 대한 **reply**로 `Dump`를 탭한 경우(iMessage는 Dump 버블에 "1 Reply" 배지를 표시), URL은 두 번째 웹훅이 아니라 `replyToBody`에 있습니다. 병합은 적용되지 않으며, 이는 디바운서 문제가 아닌 스킬/프롬프트 문제입니다.

## 블록 스트리밍

응답을 단일 메시지로 보낼지, 아니면 블록 단위로 스트리밍할지를 제어합니다.

```json5
{
  channels: {
    bluebubbles: {
      blockStreaming: true, // 블록 스트리밍 활성화 (기본값: off)
    },
  },
}
```

## 미디어 + 제한

- 인바운드 첨부 파일은 다운로드되어 미디어 캐시에 저장됩니다.
- 인바운드/아웃바운드 미디어 상한은 `channels.bluebubbles.mediaMaxMb`로 설정합니다(기본값: 8 MB).
- 아웃바운드 텍스트는 `channels.bluebubbles.textChunkLimit`으로 청킹됩니다(기본값: 4000자).

## 구성 참조

전체 구성: [구성](/gateway/configuration)

프로바이더 옵션:

- `channels.bluebubbles.enabled`: 채널 활성화/비활성화.
- `channels.bluebubbles.serverUrl`: BlueBubbles REST API 베이스 URL.
- `channels.bluebubbles.password`: API 비밀번호.
- `channels.bluebubbles.webhookPath`: 웹훅 엔드포인트 경로 (기본값: `/bluebubbles-webhook`).
- `channels.bluebubbles.dmPolicy`: `pairing | allowlist | open | disabled` (기본값: `pairing`).
- `channels.bluebubbles.allowFrom`: DM 허용 목록 (핸들, 이메일, E.164 번호, `chat_id:*`, `chat_guid:*`).
- `channels.bluebubbles.groupPolicy`: `open | allowlist | disabled` (기본값: `allowlist`).
- `channels.bluebubbles.groupAllowFrom`: Group 발신자 허용 목록.
- `channels.bluebubbles.enrichGroupParticipantsFromContacts`: macOS에서 게이팅 통과 후 이름 없는 group 참가자를 로컬 연락처로 선택적으로 보강. 기본값: `false`.
- `channels.bluebubbles.groups`: Group별 구성 (`requireMention` 등).
- `channels.bluebubbles.sendReadReceipts`: 읽음 확인 전송 (기본값: `true`).
- `channels.bluebubbles.blockStreaming`: 블록 스트리밍 활성화 (기본값: `false`; 스트리밍 응답에 필요).
- `channels.bluebubbles.textChunkLimit`: 아웃바운드 청크 크기(자) (기본값: 4000).
- `channels.bluebubbles.sendTimeoutMs`: `/api/v1/message/text`를 통한 아웃바운드 텍스트 전송의 요청당 타임아웃(ms) (기본값: 30000). Private API iMessage 전송이 iMessage 프레임워크 내에서 60초 이상 정체될 수 있는 macOS 26 환경에서는 올리세요(예: `45000` 또는 `60000`). Probe, chat 조회, 리액션, edit, 헬스 체크는 현재 더 짧은 10초 기본값을 유지하며, 리액션과 edit으로의 확장은 후속 작업으로 계획되어 있습니다. 계정별 오버라이드: `channels.bluebubbles.accounts.<accountId>.sendTimeoutMs`.
- `channels.bluebubbles.chunkMode`: `length` (기본값)는 `textChunkLimit` 초과 시에만 분할; `newline`은 길이 청킹 전에 빈 줄(단락 경계)에서 분할.
- `channels.bluebubbles.mediaMaxMb`: 인바운드/아웃바운드 미디어 상한(MB) (기본값: 8).
- `channels.bluebubbles.mediaLocalRoots`: 아웃바운드 로컬 미디어 경로에 허용되는 절대 로컬 디렉터리의 명시적 허용 목록. 구성되지 않으면 로컬 경로 전송은 기본적으로 거부됩니다. 계정별 오버라이드: `channels.bluebubbles.accounts.<accountId>.mediaLocalRoots`.
- `channels.bluebubbles.coalesceSameSenderDms`: 연속된 동일 발신자 DM 웹훅을 하나의 에이전트 턴으로 병합하여 Apple의 텍스트+URL split-send를 단일 메시지로 도착하게 함 (기본값: `false`). 시나리오, 창 조정, 트레이드오프는 [Split-send DM 병합](#coalescing-split-send-dms-command--url-in-one-composition)을 참고하세요. 활성화되고 `messages.inbound.byChannel.bluebubbles`가 명시되지 않은 경우 기본 인바운드 디바운스 창이 500ms에서 2500ms로 확장됩니다.
- `channels.bluebubbles.historyLimit`: Context에 사용할 최대 group 메시지 수 (0은 비활성화).
- `channels.bluebubbles.dmHistoryLimit`: DM 히스토리 제한.
- `channels.bluebubbles.actions`: 특정 액션 활성화/비활성화.
- `channels.bluebubbles.accounts`: 다중 계정 구성.

관련 전역 옵션:

- `agents.list[].groupChat.mentionPatterns` (또는 `messages.groupChat.mentionPatterns`).
- `messages.responsePrefix`.

## 주소 지정 / 전달 대상

안정적인 라우팅을 위해 `chat_guid`를 선호하세요.

- `chat_guid:iMessage;-;+15555550123` (group에 권장)
- `chat_id:123`
- `chat_identifier:...`
- 직접 핸들: `+15555550123`, `user@example.com`
  - 직접 핸들에 기존 DM chat이 없으면, OpenClaw는 `POST /api/v1/chat/new`를 통해 생성합니다. 이를 위해서는 BlueBubbles Private API가 활성화되어야 합니다.

### iMessage vs SMS 라우팅

동일한 핸들이 Mac에서 iMessage chat과 SMS chat을 모두 갖는 경우(예: iMessage로 등록된 전화번호가 녹색 말풍선 폴백도 수신한 경우), OpenClaw는 iMessage chat을 선호하며 SMS로 자동 다운그레이드하지 않습니다. SMS chat을 강제하려면 명시적인 `sms:` 대상 접두사를 사용하세요(예: `sms:+15555550123`). 매칭되는 iMessage chat이 없는 핸들은 BlueBubbles가 보고하는 chat을 통해 전송됩니다.

## 보안

- 웹훅 요청은 `guid`/`password` 쿼리 파라미터 또는 헤더를 `channels.bluebubbles.password`와 비교하여 인증됩니다.
- API 비밀번호와 웹훅 엔드포인트를 비밀로 유지하세요(자격 증명처럼 취급).
- BlueBubbles 웹훅 인증에는 localhost 우회가 없습니다. 웹훅 트래픽을 프록시하는 경우, BlueBubbles 비밀번호를 요청에 끝까지 유지하세요. 여기서 `gateway.trustedProxies`는 `channels.bluebubbles.password`를 대체하지 않습니다. [게이트웨이 보안](/gateway/security/#reverse-proxy-configuration)을 참고하세요.
- BlueBubbles 서버를 LAN 외부에 노출하는 경우 HTTPS + 방화벽 규칙을 활성화하세요.

## 문제 해결

- 타이핑/읽음 이벤트가 중단되면 BlueBubbles 웹훅 로그를 확인하고 게이트웨이 경로가 `channels.bluebubbles.webhookPath`와 일치하는지 확인하세요.
- 페어링 코드는 1시간 후 만료됩니다. `openclaw pairing list bluebubbles`와 `openclaw pairing approve bluebubbles <code>`를 사용하세요.
- 리액션은 BlueBubbles private API(`POST /api/v1/message/react`)가 필요합니다. 서버 버전이 이를 노출하는지 확인하세요.
- Edit/unsend는 macOS 13+와 호환되는 BlueBubbles 서버 버전이 필요합니다. macOS 26 (Tahoe)에서는 private API 변경으로 인해 현재 edit이 동작하지 않습니다.
- macOS 26 (Tahoe)에서는 group 아이콘 업데이트가 불안정할 수 있습니다. API가 성공을 반환해도 새 아이콘이 동기화되지 않을 수 있습니다.
- OpenClaw는 BlueBubbles 서버의 macOS 버전에 따라 알려진 고장난 액션을 자동으로 숨깁니다. macOS 26 (Tahoe)에서도 edit이 여전히 보인다면 `channels.bluebubbles.actions.edit=false`로 수동으로 비활성화하세요.
- `coalesceSameSenderDms`가 활성화되었는데도 split-send(예: `Dump` + URL)가 여전히 두 턴으로 도착하는 경우: [split-send 병합 문제 해결](#split-send-coalescing-troubleshooting) 체크리스트를 참고하세요. 흔한 원인은 너무 좁은 디바운스 창, 세션 로그 타임스탬프를 웹훅 도착으로 오독하는 것, 또는 reply-quote 전송(이는 두 번째 웹훅이 아니라 `replyToBody`를 사용)입니다.
- 상태/헬스 정보: `openclaw status --all` 또는 `openclaw status --deep`.

일반 채널 워크플로우 참고는 [채널](/channels/)과 [플러그인](/tools/plugin) 가이드를 참고하세요.

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 플로우
- [Groups](/channels/groups) — Group chat 동작과 mention 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지의 세션 라우팅
- [보안](/gateway/security/) — 접근 모델과 강화
