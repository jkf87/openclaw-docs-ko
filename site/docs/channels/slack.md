---
title: "Slack"
description: "Slack 설정 및 런타임 동작 (소켓 모드 + HTTP 요청 URL)"
---

# Slack

상태: Slack 앱 통합을 통한 DM + 채널에서 프로덕션 준비 완료. 기본 모드는 소켓 모드이며, HTTP 요청 URL도 지원됩니다.

> **페어링**
> Slack DM은 기본적으로 페어링 모드입니다.


  > **슬래시 명령**
> 네이티브 명령 동작 및 명령 카탈로그.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 빠른 설정

**소켓 모드 (기본값)**

1. **새 Slack 앱 생성**

   Slack 앱 설정에서 **[새 앱 생성](https://api.slack.com/apps/new)** 버튼을 누릅니다:
   
           - **매니페스트에서** 선택하고 앱의 워크스페이스 선택
           - 아래 [매니페스트 예시](#manifest-and-scope-checklist)를 붙여넣고 계속하여 생성
           - `connections:write` 권한으로 **앱 수준 토큰** (`xapp-...`) 생성
           - 앱을 설치하고 표시된 **봇 토큰** (`xoxb-...`) 복사


      2. **OpenClaw 구성**

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


      3. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```



  **HTTP 요청 URL**

1. **새 Slack 앱 생성**

   Slack 앱 설정에서 **[새 앱 생성](https://api.slack.com/apps/new)** 버튼을 누릅니다:
   
           - **매니페스트에서** 선택하고 앱의 워크스페이스 선택
           - 아래 매니페스트 예시를 붙여넣고 생성 전 URL 업데이트
           - 요청 검증을 위한 **서명 비밀** 저장
           - 앱을 설치하고 표시된 **봇 토큰** (`xoxb-...`) 복사


      2. **OpenClaw 구성**

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
   
           ::: info NOTE
   멀티 계정 HTTP에는 고유한 웹훅 경로 사용
   
           등록이 충돌하지 않도록 각 계정에 별도의 `webhookPath`(기본값 `/slack/events`)를 지정하십시오.
   :::


      3. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```



## 매니페스트 및 범위 체크리스트

**소켓 모드 (기본값)**

```json
{
  "display_information": {
    "name": "OpenClaw",
    "description": "OpenClaw용 Slack 커넥터"
  },
  "features": {
    "bot_user": {
      "display_name": "OpenClaw",
      "always_online": true
    },
    "app_home": {
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    },
    "slash_commands": [
      {
        "command": "/openclaw",
        "description": "OpenClaw에 메시지 보내기",
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



  **HTTP 요청 URL**

```json
{
  "display_information": {
    "name": "OpenClaw",
    "description": "OpenClaw용 Slack 커넥터"
  },
  "features": {
    "bot_user": {
      "display_name": "OpenClaw",
      "always_online": true
    },
    "slash_commands": [
      {
        "command": "/openclaw",
        "description": "OpenClaw에 메시지 보내기",
        "should_escape": false,
        "url": "https://gateway-host.example.com/slack/events"
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "app_mentions:read",
        "channels:history",
        "channels:read",
        "chat:write",
        "commands",
        "im:history",
        "im:read",
        "im:write",
        "reactions:read",
        "reactions:write",
        "users:read"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "request_url": "https://gateway-host.example.com/slack/events",
      "bot_events": [
        "app_mention",
        "message.channels",
        "message.groups",
        "message.im",
        "message.mpim"
      ]
    },
    "interactivity": {
      "is_enabled": true,
      "request_url": "https://gateway-host.example.com/slack/events"
    }
  }
}
```



## 토큰 모델

- 소켓 모드에는 `botToken` + `appToken`이 필요합니다.
- HTTP 모드에는 `botToken` + `signingSecret`이 필요합니다.
- `botToken`, `appToken`, `signingSecret`, `userToken`은 일반 텍스트 문자열 또는 SecretRef 객체를 허용합니다.
- 구성 토큰은 환경 변수 폴백을 재정의합니다.
- `SLACK_BOT_TOKEN` / `SLACK_APP_TOKEN` 환경 변수 폴백은 기본 계정에만 적용됩니다.

상태 스냅샷 동작:

- Slack 계정 검사는 자격 증명별 `*Source` 및 `*Status` 필드를 추적합니다.
- 상태는 `available`, `configured_unavailable`, 또는 `missing`입니다.
- `configured_unavailable`은 계정이 SecretRef 또는 다른 비인라인 비밀 소스를 통해 구성되었지만 현재 명령/런타임 경로가 실제 값을 확인할 수 없음을 의미합니다.

::: tip
액션/디렉토리 읽기의 경우 구성된 경우 사용자 토큰을 선호할 수 있습니다. 쓰기의 경우 봇 토큰이 선호되며, 사용자 토큰 쓰기는 `userTokenReadOnly: false`이고 봇 토큰이 사용 불가한 경우에만 허용됩니다.
:::


## 액션 및 게이트

Slack 액션은 `channels.slack.actions.*`로 제어됩니다.

현재 Slack 도구의 가용 액션 그룹:

| 그룹       | 기본값   |
| ---------- | -------- |
| messages   | 활성화   |
| reactions  | 활성화   |
| pins       | 활성화   |
| memberInfo | 활성화   |
| emojiList  | 활성화   |

## 접근 제어 및 라우팅

**DM 정책**

`channels.slack.dmPolicy`는 DM 접근을 제어합니다:

    - `pairing` (기본값)
    - `allowlist`
    - `open` (`channels.slack.allowFrom`에 `"*"` 포함 필요)
    - `disabled`

    DM 플래그:

    - `dm.enabled` (기본값 true)
    - `channels.slack.allowFrom` (권장)
    - `dm.groupEnabled` (그룹 DM 기본값 false)



  **채널 정책**

`channels.slack.groupPolicy`는 채널 처리를 제어합니다:

    - `open`
    - `allowlist`
    - `disabled`

    채널 허용 목록은 `channels.slack.channels` 아래에 있으며 안정적인 채널 ID를 사용해야 합니다.



  **언급 및 채널 사용자**

채널 메시지는 기본적으로 언급 게이팅됩니다.

    언급 소스:

    - 명시적 앱 언급 (`<@botId>`)
    - 언급 정규식 패턴
    - 암시적 봇 스레드 응답 동작

    채널별 제어 (`channels.slack.channels.&lt;id&gt;`):

    - `requireMention`
    - `users` (허용 목록)
    - `allowBots`
    - `skills`
    - `systemPrompt`
    - `tools`, `toolsBySender`



## 스레딩, 세션 및 응답 태그

- DM은 `direct`로 라우팅됩니다. 채널은 `channel`로, MPIM은 `group`으로 라우팅됩니다.
- 기본 `session.dmScope=main`으로 Slack DM은 에이전트 메인 세션으로 축소됩니다.
- 채널 세션: `agent:&lt;agentId&gt;:slack:channel:&lt;channelId&gt;`.
- 스레드 응답은 스레드 세션 접미사를 생성할 수 있습니다 (`:thread:&lt;threadTs&gt;`).
- `channels.slack.thread.requireExplicitMention` (기본값 `false`): `true`인 경우 스레드 내에서도 명시적 `@봇` 언급만 응답합니다.

응답 스레딩 제어:

- `channels.slack.replyToMode`: `off|first|all|batched` (기본값 `off`)
- `channels.slack.replyToModeByChatType`: `direct|group|channel`별

참고: `replyToMode="off"`는 명시적 `[[reply_to_*]]` 태그를 포함한 Slack의 **모든** 응답 스레딩을 비활성화합니다.

## 확인 반응

`ackReaction`은 OpenClaw가 인바운드 Slack 메시지를 처리하는 동안 확인 이모지를 임시로 보냅니다.

## 텍스트 스트리밍

`channels.slack.streaming`은 라이브 미리보기 동작을 제어합니다:

- `off`: 라이브 미리보기 스트리밍 비활성화.
- `partial` (기본값): 미리보기 텍스트를 최신 부분 출력으로 교체.
- `block`: 청크된 미리보기 업데이트 추가.
- `progress`: 생성 중 진행 상태 텍스트 표시, 그런 다음 최종 텍스트 전송.

초안 미리보기 사용 (Slack 네이티브 텍스트 스트리밍 대신):

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

## 미디어, 청크 및 전달

::: details 인바운드 첨부 파일
Slack 파일 첨부는 Slack 호스팅 프라이빗 URL에서 다운로드됩니다.

    런타임 인바운드 크기 제한은 `channels.slack.mediaMaxMb`로 재정의하지 않는 한 기본값이 `20MB`입니다.
:::


  ::: details 아웃바운드 텍스트 및 파일
- 텍스트 청크는 `channels.slack.textChunkLimit`을 사용합니다 (기본값 4000)
    - `channels.slack.chunkMode="newline"` - 단락 우선 분할 활성화
    - 파일 전송은 Slack 업로드 API를 사용합니다
:::


  ::: details 전달 타겟
권장되는 명시적 타겟:

    - `user:&lt;id&gt;` - DM
    - `channel:&lt;id&gt;` - 채널
:::

## 명령 및 슬래시 동작

- 네이티브 명령 자동 모드는 Slack에 대해 **꺼져** 있습니다 (`commands.native: "auto"`는 Slack 네이티브 명령을 활성화하지 않음).
- `channels.slack.commands.native: true`로 네이티브 Slack 명령 처리기를 활성화합니다.

기본 슬래시 명령 설정:

- `enabled: false`
- `name: "openclaw"`
- `ephemeral: true`

## 인터랙티브 응답

Slack은 에이전트 작성 인터랙티브 응답 제어를 렌더링할 수 있지만 이 기능은 기본적으로 비활성화되어 있습니다.

전역 활성화:

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

활성화 시 에이전트는 Slack 전용 응답 지시문을 내보낼 수 있습니다:

- `[[slack_buttons: 승인:approve, 거부:reject]]`
- `[[slack_select: 타겟 선택 | Canary:canary, Production:production]]`

## Slack에서의 실행 승인

Slack은 인터랙티브 버튼 및 인터랙션을 사용하는 네이티브 승인 클라이언트로 작동할 수 있습니다.

구성 경로:

- `channels.slack.execApprovals.enabled`
- `channels.slack.execApprovals.approvers`
- `channels.slack.execApprovals.target` (`dm` | `channel` | `both`, 기본값: `dm`)

## 이벤트 및 운영 동작

- 메시지 편집/삭제/스레드 브로드캐스트는 시스템 이벤트로 매핑됩니다.
- 반응 추가/제거 이벤트는 시스템 이벤트로 매핑됩니다.
- 멤버 참여/퇴장, 채널 생성/이름 변경, 핀 추가/제거 이벤트는 시스템 이벤트로 매핑됩니다.

## 구성 참조 포인터

기본 참조:

- [구성 참조 - Slack](/gateway/configuration-reference#slack)

주요 Slack 필드:
- 모드/인증: `mode`, `botToken`, `appToken`, `signingSecret`, `webhookPath`, `accounts.*`
- DM 접근: `dm.enabled`, `dmPolicy`, `allowFrom`, `dm.groupEnabled`
- 채널 접근: `groupPolicy`, `channels.*`, `channels.*.users`, `channels.*.requireMention`
- 스레딩/히스토리: `replyToMode`, `thread.*`, `historyLimit`
- 전달: `textChunkLimit`, `chunkMode`, `mediaMaxMb`, `streaming`

## 문제 해결

::: details 채널에서 응답 없음
순서대로 확인:

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
:::


  ::: details DM 메시지 무시됨
확인:

    - `channels.slack.dm.enabled`
    - `channels.slack.dmPolicy`
    - 페어링 승인 / 허용 목록 항목

```bash
openclaw pairing list slack
```
:::


  ::: details 소켓 모드 연결 안 됨
봇 + 앱 토큰 및 Slack 앱 설정에서 소켓 모드 활성화를 검증합니다.

    `openclaw channels status --probe --json`이 `botTokenStatus` 또는
    `appTokenStatus: "configured_unavailable"`을 표시하면 Slack 계정이
    구성되었지만 현재 런타임이 SecretRef 기반 값을 확인할 수 없습니다.
:::


  ::: details HTTP 모드에서 이벤트 수신 안 됨
다음을 검증합니다:

    - 서명 비밀
    - 웹훅 경로
    - Slack 요청 URL (이벤트 + 인터랙티비티 + 슬래시 명령)
    - HTTP 계정당 고유한 `webhookPath`
:::

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [보안](/gateway/security)
- [채널 라우팅](/channels/channel-routing)
- [문제 해결](/channels/troubleshooting)
- [구성](/gateway/configuration)
- [슬래시 명령](/tools/slash-commands)
