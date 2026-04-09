---
title: "message"
description: "`openclaw message`에 대한 CLI 참조 (전송 + 채널 액션)"
---

# `openclaw message`

메시지 전송 및 채널 액션을 위한 단일 아웃바운드 명령
(Discord/Google Chat/iMessage/Matrix/Mattermost (플러그인)/Microsoft Teams/Signal/Slack/Telegram/WhatsApp).

## 사용법

```
openclaw message &lt;subcommand&gt; [flags]
```

채널 선택:

- `--channel`은 두 개 이상의 채널이 구성된 경우 필수입니다.
- 정확히 하나의 채널이 구성된 경우 기본값이 됩니다.
- 값: `discord|googlechat|imessage|matrix|mattermost|msteams|signal|slack|telegram|whatsapp` (Mattermost는 플러그인 필요)

대상 형식 (`--target`):

- WhatsApp: E.164 또는 그룹 JID
- Telegram: 채팅 id 또는 `@username`
- Discord: `channel:&lt;id&gt;` 또는 `user:&lt;id&gt;` (또는 `<@id>` 멘션; 원시 숫자 id는 채널로 처리됨)
- Google Chat: `spaces/&lt;spaceId&gt;` 또는 `users/&lt;userId&gt;`
- Slack: `channel:&lt;id&gt;` 또는 `user:&lt;id&gt;` (원시 채널 id 허용)
- Mattermost (플러그인): `channel:&lt;id&gt;`, `user:&lt;id&gt;`, 또는 `@username` (베어 id는 채널로 처리됨)
- Signal: `+E.164`, `group:&lt;id&gt;`, `signal:+E.164`, `signal:group:&lt;id&gt;`, 또는 `username:&lt;name&gt;`/`u:&lt;name&gt;`
- iMessage: 핸들, `chat_id:&lt;id&gt;`, `chat_guid:&lt;guid&gt;`, 또는 `chat_identifier:&lt;id&gt;`
- Matrix: `@user:server`, `!room:server`, 또는 `#alias:server`
- Microsoft Teams: 대화 id (`19:...@thread.tacv2`) 또는 `conversation:&lt;id&gt;` 또는 `user:&lt;aad-object-id&gt;`

이름 조회:

- 지원되는 프로바이더(Discord/Slack 등)의 경우 `Help` 또는 `#help` 같은 채널 이름이 디렉터리 캐시를 통해 확인됩니다.
- 캐시 미스 시 OpenClaw는 프로바이더가 지원하는 경우 라이브 디렉터리 조회를 시도합니다.

## 공통 플래그

- `--channel &lt;name&gt;`
- `--account &lt;id&gt;`
- `--target &lt;dest&gt;` (전송/폴/읽기 등의 대상 채널 또는 사용자)
- `--targets &lt;name&gt;` (반복; 브로드캐스트 전용)
- `--json`
- `--dry-run`
- `--verbose`

## SecretRef 동작

- `openclaw message`는 선택한 액션을 실행하기 전에 지원되는 채널 SecretRef를 확인합니다.
- 확인은 가능한 경우 활성 액션 대상으로 범위가 지정됩니다:
  - `--channel`이 설정된 경우(또는 `discord:...` 같은 접두어 대상에서 추론된 경우) 채널 범위
  - `--account`가 설정된 경우 계정 범위(채널 전역 + 선택한 계정 표면)
  - `--account`가 생략되면 OpenClaw는 `default` 계정 SecretRef 범위를 강제하지 않음
- 관련 없는 채널의 확인되지 않은 SecretRef는 대상 메시지 액션을 차단하지 않습니다.
- 선택한 채널/계정 SecretRef가 확인되지 않으면 해당 액션에 대해 명령이 실패합니다.

## 액션

### 핵심

- `send`
  - 채널: WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost (플러그인)/Signal/iMessage/Matrix/Microsoft Teams
  - 필수: `--target`, `--message` 또는 `--media`
  - 선택: `--media`, `--interactive`, `--buttons`, `--components`, `--card`, `--reply-to`, `--thread-id`, `--gif-playback`, `--force-document`, `--silent`
  - 공유 인터랙티브 페이로드: `--interactive`는 지원되는 경우 채널 네이티브 인터랙티브 JSON 페이로드를 전송
  - Telegram 전용: `--buttons` (`channels.telegram.capabilities.inlineButtons`가 허용해야 함)
  - Telegram 전용: `--force-document` (이미지와 GIF를 문서로 전송하여 Telegram 압축 방지)
  - Telegram 전용: `--thread-id` (포럼 토픽 id)
  - Slack 전용: `--thread-id` (스레드 타임스탬프; `--reply-to`는 동일한 필드 사용)
  - Discord 전용: `--components` JSON 페이로드
  - 어댑티브 카드 채널: 지원되는 경우 `--card` JSON 페이로드
  - Telegram + Discord: `--silent`
  - WhatsApp 전용: `--gif-playback`

- `poll`
  - 채널: WhatsApp/Telegram/Discord/Matrix/Microsoft Teams
  - 필수: `--target`, `--poll-question`, `--poll-option` (반복)
  - 선택: `--poll-multi`
  - Discord 전용: `--poll-duration-hours`, `--silent`, `--message`
  - Telegram 전용: `--poll-duration-seconds` (5-600), `--silent`, `--poll-anonymous` / `--poll-public`, `--thread-id`

- `react`
  - 채널: Discord/Google Chat/Slack/Telegram/WhatsApp/Signal/Matrix
  - 필수: `--message-id`, `--target`
  - 선택: `--emoji`, `--remove`, `--participant`, `--from-me`, `--target-author`, `--target-author-uuid`
  - 참고: `--remove`는 `--emoji`가 필요합니다 (지원되는 경우 자신의 반응을 지우려면 `--emoji` 생략; /tools/reactions 참조)
  - WhatsApp 전용: `--participant`, `--from-me`
  - Signal 그룹 반응: `--target-author` 또는 `--target-author-uuid` 필요

- `reactions`
  - 채널: Discord/Google Chat/Slack/Matrix
  - 필수: `--message-id`, `--target`
  - 선택: `--limit`

- `read`
  - 채널: Discord/Slack/Matrix
  - 필수: `--target`
  - 선택: `--limit`, `--before`, `--after`
  - Discord 전용: `--around`

- `edit`
  - 채널: Discord/Slack/Matrix
  - 필수: `--message-id`, `--message`, `--target`

- `delete`
  - 채널: Discord/Slack/Telegram/Matrix
  - 필수: `--message-id`, `--target`

- `pin` / `unpin`
  - 채널: Discord/Slack/Matrix
  - 필수: `--message-id`, `--target`

- `pins` (목록)
  - 채널: Discord/Slack/Matrix
  - 필수: `--target`

- `permissions`
  - 채널: Discord/Matrix
  - 필수: `--target`
  - Matrix 전용: Matrix 암호화가 활성화되고 검증 액션이 허용된 경우에 사용 가능

- `search`
  - 채널: Discord
  - 필수: `--guild-id`, `--query`
  - 선택: `--channel-id`, `--channel-ids` (반복), `--author-id`, `--author-ids` (반복), `--limit`

### 스레드

- `thread create`
  - 채널: Discord
  - 필수: `--thread-name`, `--target` (채널 id)
  - 선택: `--message-id`, `--message`, `--auto-archive-min`

- `thread list`
  - 채널: Discord
  - 필수: `--guild-id`
  - 선택: `--channel-id`, `--include-archived`, `--before`, `--limit`

- `thread reply`
  - 채널: Discord
  - 필수: `--target` (스레드 id), `--message`
  - 선택: `--media`, `--reply-to`

### 이모지

- `emoji list`
  - Discord: `--guild-id`
  - Slack: 추가 플래그 없음

- `emoji upload`
  - 채널: Discord
  - 필수: `--guild-id`, `--emoji-name`, `--media`
  - 선택: `--role-ids` (반복)

### 스티커

- `sticker send`
  - 채널: Discord
  - 필수: `--target`, `--sticker-id` (반복)
  - 선택: `--message`

- `sticker upload`
  - 채널: Discord
  - 필수: `--guild-id`, `--sticker-name`, `--sticker-desc`, `--sticker-tags`, `--media`

### 역할 / 채널 / 멤버 / 음성

- `role info` (Discord): `--guild-id`
- `role add` / `role remove` (Discord): `--guild-id`, `--user-id`, `--role-id`
- `channel info` (Discord): `--target`
- `channel list` (Discord): `--guild-id`
- `member info` (Discord/Slack): `--user-id` (Discord의 경우 `--guild-id` 추가)
- `voice status` (Discord): `--guild-id`, `--user-id`

### 이벤트

- `event list` (Discord): `--guild-id`
- `event create` (Discord): `--guild-id`, `--event-name`, `--start-time`
  - 선택: `--end-time`, `--desc`, `--channel-id`, `--location`, `--event-type`

### 모더레이션 (Discord)

- `timeout`: `--guild-id`, `--user-id` (선택적 `--duration-min` 또는 `--until`; 둘 다 생략 시 타임아웃 해제)
- `kick`: `--guild-id`, `--user-id` (`--reason` 추가)
- `ban`: `--guild-id`, `--user-id` (`--delete-days`, `--reason` 추가)
  - `timeout`은 `--reason`도 지원

### 브로드캐스트

- `broadcast`
  - 채널: 구성된 모든 채널; `--channel all`을 사용하면 모든 프로바이더 대상
  - 필수: `--targets &lt;target...&gt;`
  - 선택: `--message`, `--media`, `--dry-run`

## 예시

Discord 답장 전송:

```
openclaw message send --channel discord \
  --target channel:123 --message "hi" --reply-to 456
```

컴포넌트가 있는 Discord 메시지 전송:

```
openclaw message send --channel discord \
  --target channel:123 --message "Choose:" \
  --components '{"text":"Choose a path","blocks":[{"type":"actions","buttons":[{"label":"Approve","style":"success"},{"label":"Decline","style":"danger"}]}]}'
```

전체 스키마는 [Discord 컴포넌트](/channels/discord#interactive-components)를 참조하세요.

공유 인터랙티브 페이로드 전송:

```bash
openclaw message send --channel googlechat --target spaces/AAA... \
  --message "Choose:" \
  --interactive '{"text":"Choose a path","blocks":[{"type":"actions","buttons":[{"label":"Approve"},{"label":"Decline"}]}]}'
```

Discord 폴 생성:

```
openclaw message poll --channel discord \
  --target channel:123 \
  --poll-question "Snack?" \
  --poll-option Pizza --poll-option Sushi \
  --poll-multi --poll-duration-hours 48
```

Telegram 폴 생성 (2분 후 자동 종료):

```
openclaw message poll --channel telegram \
  --target @mychat \
  --poll-question "Lunch?" \
  --poll-option Pizza --poll-option Sushi \
  --poll-duration-seconds 120 --silent
```

Teams 프로액티브 메시지 전송:

```
openclaw message send --channel msteams \
  --target conversation:19:abc@thread.tacv2 --message "hi"
```

Teams 폴 생성:

```
openclaw message poll --channel msteams \
  --target conversation:19:abc@thread.tacv2 \
  --poll-question "Lunch?" \
  --poll-option Pizza --poll-option Sushi
```

Slack에서 반응:

```
openclaw message react --channel slack \
  --target C123 --message-id 456 --emoji "✅"
```

Signal 그룹에서 반응:

```
openclaw message react --channel signal \
  --target signal:group:abc123 --message-id 1737630212345 \
  --emoji "✅" --target-author-uuid 123e4567-e89b-12d3-a456-426614174000
```

Telegram 인라인 버튼 전송:

```
openclaw message send --channel telegram --target @mychat --message "Choose:" \
  --buttons '[ [{"text":"Yes","callback_data":"cmd:yes"}], [{"text":"No","callback_data":"cmd:no"}] ]'
```

Teams 어댑티브 카드 전송:

```bash
openclaw message send --channel msteams \
  --target conversation:19:abc@thread.tacv2 \
  --card '{"type":"AdaptiveCard","version":"1.5","body":[{"type":"TextBlock","text":"Status update"}]}'
```

압축 방지를 위해 Telegram 이미지를 문서로 전송:

```bash
openclaw message send --channel telegram --target @mychat \
  --media ./diagram.png --force-document
```
