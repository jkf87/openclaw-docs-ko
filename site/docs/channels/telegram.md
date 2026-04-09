---
title: "Telegram"
description: "Telegram 봇 지원 상태, 기능 및 구성"
---

# Telegram (Bot API)

상태: grammY를 통한 봇 DM + 그룹에서 프로덕션 준비 완료. 기본 모드는 롱 폴링이며, 웹훅 모드는 선택 사항입니다.

> **페어링**
> Telegram의 기본 DM 정책은 페어링입니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


  > **게이트웨이 구성**
> 전체 채널 구성 패턴 및 예시.


## 빠른 설정

1. **BotFather에서 봇 토큰 생성**

   Telegram을 열고 **@BotFather**(핸들이 정확히 `@BotFather`인지 확인)와 채팅합니다.
   
       `/newbot`을 실행하고 프롬프트에 따라 토큰을 저장합니다.


  2. **토큰 및 DM 정책 구성**

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
       Telegram은 `openclaw channels login telegram`을 사용하지 않습니다. 구성/환경 변수에서 토큰을 설정한 후 게이트웨이를 시작합니다.


  3. **게이트웨이 시작 및 첫 번째 DM 승인**

   ```bash
   openclaw gateway
   openclaw pairing list telegram
   openclaw pairing approve telegram <CODE>
   ```
   
       페어링 코드는 1시간 후 만료됩니다.


  4. **그룹에 봇 추가**

   그룹에 봇을 추가한 다음, 접근 모델에 맞게 `channels.telegram.groups`와 `groupPolicy`를 설정합니다.


::: info NOTE
토큰 확인 순서는 계정을 고려합니다. 실제로는 구성 값이 환경 변수 폴백보다 우선하며, `TELEGRAM_BOT_TOKEN`은 기본 계정에만 적용됩니다.
:::


## Telegram 측 설정

::: details 개인 정보 모드 및 그룹 가시성
Telegram 봇은 기본적으로 **개인 정보 모드**로, 수신하는 그룹 메시지가 제한됩니다.

    봇이 모든 그룹 메시지를 수신해야 하는 경우:

    - `/setprivacy`로 개인 정보 모드를 비활성화하거나,
    - 봇을 그룹 관리자로 지정합니다.

    개인 정보 모드를 전환할 때 각 그룹에서 봇을 제거한 후 다시 추가하여 Telegram이 변경 사항을 적용하도록 합니다.
:::


  ::: details 그룹 권한
관리자 상태는 Telegram 그룹 설정에서 제어됩니다.

    관리자 봇은 모든 그룹 메시지를 수신하므로, 상시 그룹 동작에 유용합니다.
:::


  ::: details 유용한 BotFather 토글
- `/setjoingroups` - 그룹 추가 허용/거부
    - `/setprivacy` - 그룹 가시성 동작
:::

## 접근 제어 및 활성화

**DM 정책**

`channels.telegram.dmPolicy`는 다이렉트 메시지 접근을 제어합니다:

    - `pairing` (기본값)
    - `allowlist` (`allowFrom`에 발신자 ID가 하나 이상 필요)
    - `open` (`allowFrom`에 `"*"` 포함 필요)
    - `disabled`

    `channels.telegram.allowFrom`은 숫자 형식의 Telegram 사용자 ID를 허용합니다. `telegram:` / `tg:` 접두사가 허용되며 정규화됩니다.
    `dmPolicy: "allowlist"`에 `allowFrom`이 비어 있으면 모든 DM이 차단되고 구성 유효성 검사에서 거부됩니다.
    온보딩은 `@username` 입력을 허용하고 숫자 ID로 확인합니다.
    업그레이드 후 구성에 `@username` 허용 목록 항목이 포함된 경우, `openclaw doctor --fix`를 실행하여 ID로 확인합니다(최선 노력; Telegram 봇 토큰 필요).
    이전에 페어링 저장소 허용 목록 파일을 사용한 경우, `openclaw doctor --fix`는 허용 목록 마이그레이션 흐름에서 항목을 `channels.telegram.allowFrom`으로 복구할 수 있습니다.

    단일 소유자 봇의 경우 `dmPolicy: "allowlist"`와 명시적 숫자 `allowFrom` ID를 사용하면 구성에서 접근 정책이 지속됩니다(이전 페어링 승인에 의존하는 대신).

    일반적인 혼동: DM 페어링 승인은 "이 발신자가 모든 곳에서 인증됨"을 의미하지 않습니다.
    페어링은 DM 접근만 부여합니다. 그룹 발신자 인증은 여전히 명시적 구성 허용 목록에서 제공됩니다.
    "내가 한 번 인증되고 DM과 그룹 명령 모두 작동"을 원한다면, `channels.telegram.allowFrom`에 숫자 Telegram 사용자 ID를 추가하십시오.

    ### Telegram 사용자 ID 찾기

    더 안전한 방법 (제3자 봇 없음):

    1. 봇에 DM 전송.
    2. `openclaw logs --follow` 실행.
    3. `from.id` 읽기.

    공식 Bot API 방법:

```bash
curl "https://api.telegram.org/bot&lt;bot_token&gt;/getUpdates"
```

    제3자 방법 (덜 비공개): `@userinfobot` 또는 `@getidsbot`.



  **그룹 정책 및 허용 목록**

두 가지 제어가 함께 적용됩니다:

    1. **허용된 그룹** (`channels.telegram.groups`)
       - `groups` 구성 없음:
         - `groupPolicy: "open"`인 경우: 모든 그룹이 그룹 ID 확인을 통과
         - `groupPolicy: "allowlist"` (기본값)인 경우: `groups` 항목(또는 `"*"`)을 추가할 때까지 그룹 차단
       - `groups` 구성 시: 허용 목록으로 작동 (명시적 ID 또는 `"*"`)

    2. **그룹 내 허용된 발신자** (`channels.telegram.groupPolicy`)
       - `open`
       - `allowlist` (기본값)
       - `disabled`

    `groupAllowFrom`은 그룹 발신자 필터링에 사용됩니다. 설정하지 않으면 Telegram은 `allowFrom`으로 폴백합니다.
    `groupAllowFrom` 항목은 숫자 Telegram 사용자 ID여야 합니다 (`telegram:` / `tg:` 접두사는 정규화됨).
    `groupAllowFrom`에 Telegram 그룹 또는 슈퍼그룹 채팅 ID를 넣지 마십시오. 음수 채팅 ID는 `channels.telegram.groups` 아래에 속합니다.
    숫자가 아닌 항목은 발신자 인증 시 무시됩니다.
    보안 경계 (`2026.2.25+`): 그룹 발신자 인증은 DM 페어링 저장소 승인을 **상속하지 않습니다**.
    페어링은 DM 전용으로 유지됩니다. 그룹의 경우 `groupAllowFrom` 또는 그룹/주제별 `allowFrom`을 설정하십시오.
    `groupAllowFrom`이 설정되지 않은 경우 Telegram은 페어링 저장소가 아닌 구성 `allowFrom`으로 폴백합니다.
    단일 소유자 봇의 실용적인 패턴: `channels.telegram.allowFrom`에 사용자 ID를 설정하고, `groupAllowFrom`을 설정하지 않고, `channels.telegram.groups` 아래에 대상 그룹을 허용합니다.
    런타임 참고: `channels.telegram`이 완전히 없으면 `channels.defaults.groupPolicy`가 명시적으로 설정되지 않는 한 런타임 기본값은 실패 폐쇄 `groupPolicy="allowlist"`입니다.

    예시: 하나의 특정 그룹에서 모든 구성원 허용:

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

    예시: 하나의 특정 그룹 내 특정 사용자만 허용:

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

    ::: warning
일반적인 실수: `groupAllowFrom`은 Telegram 그룹 허용 목록이 아닙니다.

      - `-1001234567890` 같은 음수 Telegram 그룹 또는 슈퍼그룹 채팅 ID는 `channels.telegram.groups` 아래에 넣으십시오.
      - `8734062810` 같은 Telegram 사용자 ID는 허용된 그룹 내에서 봇을 트리거할 수 있는 사람을 제한하려면 `groupAllowFrom` 아래에 넣으십시오.
      - 허용된 그룹의 모든 구성원이 봇과 대화할 수 있도록 하려면 `groupAllowFrom: ["*"]`만 사용하십시오.
:::



  **언급 동작**

그룹 응답은 기본적으로 언급이 필요합니다.

    언급 출처:

    - 네이티브 `@botusername` 언급, 또는
    - 다음의 언급 패턴:
      - `agents.list[].groupChat.mentionPatterns`
      - `messages.groupChat.mentionPatterns`

    세션 수준 명령 토글:

    - `/activation always`
    - `/activation mention`

    이는 세션 상태만 업데이트합니다. 지속을 위해 구성을 사용하십시오.

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

    그룹 채팅 ID 가져오기:

    - 그룹 메시지를 `@userinfobot` / `@getidsbot`에 전달
    - 또는 `openclaw logs --follow`에서 `chat.id` 읽기
    - 또는 Bot API `getUpdates` 검사



## 런타임 동작

- Telegram은 게이트웨이 프로세스가 소유합니다.
- 라우팅은 결정적입니다: Telegram 인바운드는 Telegram으로 다시 응답합니다(모델이 채널을 선택하지 않음).
- 인바운드 메시지는 응답 메타데이터 및 미디어 플레이스홀더와 함께 공유 채널 봉투로 정규화됩니다.
- 그룹 세션은 그룹 ID로 격리됩니다. 포럼 주제는 `:topic:&lt;threadId&gt;`를 추가하여 주제를 격리합니다.
- DM 메시지는 `message_thread_id`를 포함할 수 있으며, OpenClaw는 스레드 인식 세션 키로 라우팅하고 응답을 위해 스레드 ID를 보존합니다.
- 롱 폴링은 채팅/스레드별 시퀀싱으로 grammY 러너를 사용합니다. 전체 러너 싱크 동시성은 `agents.defaults.maxConcurrent`를 사용합니다.
- Telegram Bot API는 읽음 확인을 지원하지 않습니다 (`sendReadReceipts`는 적용되지 않음).

## 기능 참조

::: details 라이브 스트림 미리보기 (메시지 편집)
OpenClaw는 실시간으로 부분 응답을 스트리밍할 수 있습니다:

    - 다이렉트 채팅: 미리보기 메시지 + `editMessageText`
    - 그룹/주제: 미리보기 메시지 + `editMessageText`

    요구 사항:

    - `channels.telegram.streaming`은 `off | partial | block | progress` (기본값: `partial`)
    - `progress`는 Telegram에서 `partial`로 매핑됩니다 (채널 간 이름 호환성)
    - 레거시 `channels.telegram.streamMode` 및 부울 `streaming` 값은 자동 매핑됩니다

    텍스트 전용 응답의 경우:

    - DM: OpenClaw는 동일한 미리보기 메시지를 유지하고 인플레이스에서 최종 편집 수행 (두 번째 메시지 없음)
    - 그룹/주제: OpenClaw는 동일한 미리보기 메시지를 유지하고 인플레이스에서 최종 편집 수행 (두 번째 메시지 없음)

    복잡한 응답(예: 미디어 페이로드)의 경우, OpenClaw는 일반 최종 전달로 폴백한 다음 미리보기 메시지를 정리합니다.

    미리보기 스트리밍은 블록 스트리밍과 별개입니다. Telegram에 대해 블록 스트리밍이 명시적으로 활성화된 경우, OpenClaw는 이중 스트리밍을 방지하기 위해 미리보기 스트림을 건너뜁니다.

    네이티브 초안 전송이 사용할 수 없거나 거부되면 OpenClaw는 자동으로 `sendMessage` + `editMessageText`로 폴백합니다.

    Telegram 전용 추론 스트림:

    - `/reasoning stream` - 생성 중 라이브 미리보기로 추론 전송
    - 최종 답변은 추론 텍스트 없이 전송됨
:::


  ::: details 서식 및 HTML 폴백
아웃바운드 텍스트는 Telegram `parse_mode: "HTML"`을 사용합니다.

    - 마크다운 유사 텍스트는 Telegram 안전 HTML로 렌더링됩니다.
    - 원시 모델 HTML은 Telegram 파싱 실패를 줄이기 위해 이스케이프됩니다.
    - Telegram이 파싱된 HTML을 거부하면 OpenClaw는 일반 텍스트로 재시도합니다.

    링크 미리보기는 기본적으로 활성화되어 있으며 `channels.telegram.linkPreview: false`로 비활성화할 수 있습니다.
:::


  ::: details 네이티브 명령 및 사용자 정의 명령
Telegram 명령 메뉴 등록은 시작 시 `setMyCommands`로 처리됩니다.

    네이티브 명령 기본값:

    - `commands.native: "auto"` - Telegram에 대한 네이티브 명령 활성화

    사용자 정의 명령 메뉴 항목 추가:

```json5
{
  channels: {
    telegram: {
      customCommands: [
        { command: "backup", description: "Git 백업" },
        { command: "generate", description: "이미지 생성" },
      ],
    },
  },
}
```

    규칙:

    - 이름은 정규화됨 (선행 `/` 제거, 소문자)
    - 유효 패턴: `a-z`, `0-9`, `_`, 길이 `1..32`
    - 사용자 정의 명령은 네이티브 명령을 재정의할 수 없음
    - 충돌/중복은 건너뛰고 로그에 기록됨

    참고:

    - 사용자 정의 명령은 메뉴 항목일 뿐이며 동작을 자동으로 구현하지 않음
    - Telegram 메뉴에 표시되지 않더라도 플러그인/스킬 명령은 여전히 입력 시 작동할 수 있음

    네이티브 명령이 비활성화되면 내장 명령이 제거됩니다. 구성된 경우 사용자 정의/플러그인 명령은 여전히 등록될 수 있습니다.

    일반적인 설정 실패:

    - `BOT_COMMANDS_TOO_MUCH`와 함께 `setMyCommands failed`는 트리밍 후에도 Telegram 메뉴가 오버플로됨을 의미합니다. 플러그인/스킬/사용자 정의 명령을 줄이거나 `channels.telegram.commands.native`를 비활성화하십시오.
    - 네트워크/fetch 오류와 함께 `setMyCommands failed`는 보통 `api.telegram.org`로의 아웃바운드 DNS/HTTPS가 차단됨을 나타냅니다.

    ### 디바이스 페어링 명령 (`device-pair` 플러그인)

    `device-pair` 플러그인이 설치된 경우:

    1. `/pair` - 설정 코드 생성
    2. iOS 앱에 코드 붙여넣기
    3. `/pair pending` - 대기 중인 요청 목록 표시 (역할/범위 포함)
    4. 요청 승인:
       - `/pair approve &lt;requestId&gt;` - 명시적 승인
       - `/pair approve` - 대기 중인 요청이 하나인 경우
       - `/pair approve latest` - 가장 최근 요청

    설정 코드는 단기 부트스트랩 토큰을 포함합니다. 자세한 내용: [페어링](/channels/pairing#pair-via-telegram-recommended-for-ios).
:::


  ::: details 인라인 버튼
인라인 키보드 범위 구성:

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

    범위:

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
  message: "옵션을 선택하세요:",
  buttons: [
    [
      { text: "예", callback_data: "yes" },
      { text: "아니오", callback_data: "no" },
    ],
    [{ text: "취소", callback_data: "cancel" }],
  ],
}
```

    콜백 클릭은 에이전트에 텍스트로 전달됩니다:
    `callback_data: &lt;value&gt;`
:::


  ::: details 에이전트 및 자동화를 위한 Telegram 메시지 액션
Telegram 도구 액션 포함:

    - `sendMessage` (`to`, `content`, 선택적 `mediaUrl`, `replyToMessageId`, `messageThreadId`)
    - `react` (`chatId`, `messageId`, `emoji`)
    - `deleteMessage` (`chatId`, `messageId`)
    - `editMessage` (`chatId`, `messageId`, `content`)
    - `createForumTopic` (`chatId`, `name`, 선택적 `iconColor`, `iconCustomEmojiId`)

    채널 메시지 액션은 편리한 별칭을 노출합니다 (`send`, `react`, `delete`, `edit`, `sticker`, `sticker-search`, `topic-create`).

    게이팅 제어:

    - `channels.telegram.actions.sendMessage`
    - `channels.telegram.actions.deleteMessage`
    - `channels.telegram.actions.reactions`
    - `channels.telegram.actions.sticker` (기본값: 비활성화)
:::


  ::: details 응답 스레딩 태그
Telegram은 생성된 출력에서 명시적 응답 스레딩 태그를 지원합니다:

    - `[[reply_to_current]]` - 트리거 메시지에 응답
    - `[[reply_to:&lt;id&gt;]]` - 특정 Telegram 메시지 ID에 응답

    `channels.telegram.replyToMode` 처리 제어:

    - `off` (기본값)
    - `first`
    - `all`

    참고: `off`는 암시적 응답 스레딩을 비활성화합니다. 명시적 `[[reply_to_*]]` 태그는 여전히 처리됩니다.
:::


  ::: details 포럼 주제 및 스레드 동작
포럼 슈퍼그룹:

    - 주제 세션 키는 `:topic:&lt;threadId&gt;` 추가
    - 응답 및 타이핑은 주제 스레드를 대상으로 함
    - 주제 구성 경로:
      `channels.telegram.groups.&lt;chatId&gt;.topics.&lt;threadId&gt;`

    일반 주제 (`threadId=1`) 특수 케이스:

    - 메시지 전송은 `message_thread_id` 생략 (Telegram은 `sendMessage(...thread_id=1)` 거부)
    - 타이핑 액션은 여전히 `message_thread_id` 포함

    주제 상속: 주제 항목은 재정의되지 않는 한 그룹 설정을 상속합니다 (`requireMention`, `allowFrom`, `skills`, `systemPrompt`, `enabled`, `groupPolicy`).
    `agentId`는 주제 전용이며 그룹 기본값에서 상속되지 않습니다.

    **주제별 에이전트 라우팅**: 각 주제는 주제 구성에서 `agentId`를 설정하여 다른 에이전트로 라우팅할 수 있습니다.

    ```json5
    {
      channels: {
        telegram: {
          groups: {
            "-1001234567890": {
              topics: {
                "1": { agentId: "main" },      // 일반 주제 → 메인 에이전트
                "3": { agentId: "zu" },        // 개발 주제 → zu 에이전트
                "5": { agentId: "coder" }      // 코드 리뷰 → coder 에이전트
              }
            }
          }
        }
      }
    }
    ```
:::


  ::: details 오디오, 비디오 및 스티커
### 오디오 메시지

    Telegram은 음성 메모와 오디오 파일을 구분합니다.

    - 기본값: 오디오 파일 동작
    - 에이전트 응답에서 `[[audio_as_voice]]` 태그를 사용하여 음성 메모 전송 강제

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

    Telegram은 비디오 파일과 비디오 메모를 구분합니다.

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

    비디오 메모는 캡션을 지원하지 않으며 제공된 메시지 텍스트는 별도로 전송됩니다.

    ### 스티커

    인바운드 스티커 처리:

    - 정적 WEBP: 다운로드 및 처리됨 (플레이스홀더 `&lt;media:sticker&gt;`)
    - 애니메이션 TGS: 건너뜀
    - 비디오 WEBM: 건너뜀

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
:::


  ::: details 반응 알림
Telegram 반응은 `message_reaction` 업데이트로 도착합니다(메시지 페이로드와 별개).

    활성화되면 OpenClaw는 다음과 같은 시스템 이벤트를 큐에 넣습니다:

    - `Telegram reaction added: 👍 by Alice (@alice) on msg 42`

    구성:

    - `channels.telegram.reactionNotifications`: `off | own | all` (기본값: `own`)
    - `channels.telegram.reactionLevel`: `off | ack | minimal | extensive` (기본값: `minimal`)
:::


  ::: details 확인 반응
`ackReaction`은 OpenClaw가 인바운드 메시지를 처리하는 동안 확인 이모지를 전송합니다.

    확인 순서:

    - `channels.telegram.accounts.&lt;accountId&gt;.ackReaction`
    - `channels.telegram.ackReaction`
    - `messages.ackReaction`
    - 에이전트 ID 이모지 폴백 (`agents.list[].identity.emoji`, 없으면 "👀")

    참고:

    - Telegram은 유니코드 이모지를 기대합니다 (예: "👀").
    - `""`를 사용하면 채널 또는 계정에 대한 반응을 비활성화합니다.
:::


  ::: details 롱 폴링 vs 웹훅
기본값: 롱 폴링.

    웹훅 모드:

    - `channels.telegram.webhookUrl` 설정
    - `channels.telegram.webhookSecret` 설정 (웹훅 URL 설정 시 필수)
    - 선택적 `channels.telegram.webhookPath` (기본값 `/telegram-webhook`)
    - 선택적 `channels.telegram.webhookHost` (기본값 `127.0.0.1`)
    - 선택적 `channels.telegram.webhookPort` (기본값 `8787`)

    웹훅 모드의 기본 로컬 리스너는 `127.0.0.1:8787`에 바인딩됩니다.
:::


  ::: details 제한, 재시도 및 CLI 타겟
- `channels.telegram.textChunkLimit` 기본값은 4000.
    - `channels.telegram.chunkMode="newline"` - 길이 분할 전 단락 경계 선호.
    - `channels.telegram.mediaMaxMb` (기본값 100) - 인바운드 및 아웃바운드 Telegram 미디어 크기 제한.
    - `channels.telegram.timeoutSeconds` - Telegram API 클라이언트 타임아웃 재정의.

    CLI 전송 타겟은 숫자 채팅 ID 또는 사용자 이름일 수 있습니다:

```bash
openclaw message send --channel telegram --target 123456789 --message "안녕하세요"
openclaw message send --channel telegram --target @name --message "안녕하세요"
```

    Telegram 설문은 `openclaw message poll`을 사용하고 포럼 주제를 지원합니다:

```bash
openclaw message poll --channel telegram --target 123456789 \
  --poll-question "배포할까요?" --poll-option "예" --poll-option "아니오"
openclaw message poll --channel telegram --target -1001234567890:topic:42 \
  --poll-question "시간 선택" --poll-option "오전 10시" --poll-option "오후 2시" \
  --poll-duration-seconds 300 --poll-public
```
:::

## 오류 응답 제어

에이전트에 전달 또는 프로바이더 오류가 발생하면 Telegram은 오류 텍스트로 응답하거나 억제할 수 있습니다. 두 가지 구성 키가 이 동작을 제어합니다:

| 키                                  | 값                | 기본값  | 설명                                                                                     |
| ----------------------------------- | ----------------- | ------- | ---------------------------------------------------------------------------------------- |
| `channels.telegram.errorPolicy`     | `reply`, `silent` | `reply` | `reply`는 채팅에 친화적인 오류 메시지를 전송합니다. `silent`는 오류 응답을 완전히 억제합니다. |
| `channels.telegram.errorCooldownMs` | 숫자 (ms)         | `60000` | 동일한 채팅에 대한 오류 응답 사이의 최소 시간. 중단 중 오류 스팸을 방지합니다.           |

```json5
{
  channels: {
    telegram: {
      errorPolicy: "reply",
      errorCooldownMs: 120000,
      groups: {
        "-1001234567890": {
          errorPolicy: "silent", // 이 그룹에서 오류 억제
        },
      },
    },
  },
}
```

## 문제 해결

::: details 봇이 비언급 그룹 메시지에 응답하지 않음
- `requireMention=false`인 경우 Telegram 개인 정보 모드가 전체 가시성을 허용해야 합니다.
      - BotFather: `/setprivacy` → 비활성화
      - 그런 다음 그룹에서 봇 제거 후 다시 추가
    - `openclaw channels status`는 구성에서 비언급 그룹 메시지를 기대할 때 경고합니다.
:::


  ::: details 봇이 그룹 메시지를 전혀 보지 못함
- `channels.telegram.groups`가 존재하는 경우 그룹이 목록에 있어야 합니다 (또는 `"*"` 포함)
    - 그룹에서 봇 멤버십 확인
    - 로그 검토: 건너뜀 이유에 대해 `openclaw logs --follow`
:::


  ::: details 명령이 부분적으로 또는 전혀 작동하지 않음
- 발신자 ID 인증 (페어링 및/또는 숫자 `allowFrom`)
    - 그룹 정책이 `open`인 경우에도 명령 인증이 적용됩니다
    - `BOT_COMMANDS_TOO_MUCH`와 함께 `setMyCommands failed` - 네이티브 메뉴에 항목이 너무 많습니다. 플러그인/스킬/사용자 정의 명령을 줄이거나 네이티브 메뉴를 비활성화하십시오.
    - 네트워크/fetch 오류와 함께 `setMyCommands failed` - 보통 `api.telegram.org`로의 DNS/HTTPS 도달 가능성 문제를 나타냅니다.
:::


  ::: details 폴링 또는 네트워크 불안정
- 일부 호스트는 `api.telegram.org`를 IPv6으로 먼저 확인합니다. 손상된 IPv6 이그레스는 간헐적인 Telegram API 실패를 일으킬 수 있습니다.
    - VPS 호스트에서 불안정한 직접 이그레스/TLS가 있는 경우 `channels.telegram.proxy`를 통해 Telegram API 호출을 라우팅합니다:

```yaml
channels:
  telegram:
    proxy: socks5://&lt;user&gt;:&lt;password&gt;@proxy-host:1080
```

    - DNS 답변 검증:

```bash
dig +short api.telegram.org A
dig +short api.telegram.org AAAA
```
:::

추가 도움: [채널 문제 해결](/channels/troubleshooting).

## Telegram 구성 참조 포인터

기본 참조:

- `channels.telegram.enabled`: 채널 시작 활성화/비활성화.
- `channels.telegram.botToken`: 봇 토큰 (BotFather).
- `channels.telegram.dmPolicy`: `pairing | allowlist | open | disabled` (기본값: pairing).
- `channels.telegram.allowFrom`: DM 허용 목록 (숫자 Telegram 사용자 ID).
- `channels.telegram.groupPolicy`: `open | allowlist | disabled` (기본값: allowlist).
- `channels.telegram.groupAllowFrom`: 그룹 발신자 허용 목록 (숫자 Telegram 사용자 ID).
- `channels.telegram.groups`: 그룹별 기본값 + 허용 목록.
- `channels.telegram.streaming`: `off | partial | block | progress` (기본값: `partial`).
- `channels.telegram.webhookUrl`: 웹훅 모드 활성화 (`channels.telegram.webhookSecret` 필요).
- `channels.telegram.proxy`: Bot API 호출을 위한 프록시 URL (SOCKS/HTTP).

- [구성 참조 - Telegram](/gateway/configuration-reference#telegram)

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [보안](/gateway/security)
- [채널 라우팅](/channels/channel-routing)
- [멀티 에이전트 라우팅](/concepts/multi-agent)
- [문제 해결](/channels/troubleshooting)
