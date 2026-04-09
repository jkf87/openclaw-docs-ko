---
title: "그룹"
description: "플랫폼별 그룹 채팅 동작(Discord/iMessage/Matrix/Microsoft Teams/Signal/Slack/Telegram/WhatsApp/Zalo)"
---

# 그룹

OpenClaw는 Discord, iMessage, Matrix, Microsoft Teams, Signal, Slack, Telegram, WhatsApp, Zalo 등 다양한 플랫폼에서 그룹 채팅을 일관되게 처리합니다.

## 초보자 소개 (2분)

OpenClaw는 사용자 본인의 메시징 계정에서 "살아갑니다". 별도의 WhatsApp 봇 사용자가 없습니다.
**본인이** 그룹에 있다면 OpenClaw는 해당 그룹을 보고 그곳에서 응답할 수 있습니다.

기본 동작:

- 그룹은 제한됩니다(`groupPolicy: "allowlist"`).
- 언급 게이팅을 명시적으로 비활성화하지 않는 한 응답에는 언급이 필요합니다.

요약: 허용 목록에 있는 발신자가 OpenClaw를 언급하면 트리거됩니다.

> TL;DR
>
> - **DM 접근**은 `*.allowFrom`으로 제어됩니다.
> - **그룹 접근**은 `*.groupPolicy` + 허용 목록(`*.groups`, `*.groupAllowFrom`)으로 제어됩니다.
> - **응답 트리거링**은 언급 게이팅(`requireMention`, `/activation`)으로 제어됩니다.

빠른 흐름(그룹 메시지에 발생하는 일):

```
groupPolicy? disabled -> drop
groupPolicy? allowlist -> group allowed? no -> drop
requireMention? yes -> mentioned? no -> store for context only
otherwise -> reply
```

## 컨텍스트 가시성 및 허용 목록

그룹 보안에는 두 가지 제어가 관련됩니다:

- **트리거 인증**: 에이전트를 트리거할 수 있는 사람(`groupPolicy`, `groups`, `groupAllowFrom`, 채널별 허용 목록).
- **컨텍스트 가시성**: 모델에 주입되는 보충 컨텍스트(답장 텍스트, 인용, 스레드 기록, 전달된 메타데이터).

기본적으로 OpenClaw는 일반 채팅 동작을 우선시하고 컨텍스트를 수신한 대로 대부분 유지합니다. 이는 허용 목록이 주로 작업을 트리거할 수 있는 사람을 결정하는 것이지, 모든 인용 또는 역사적 스니펫에 대한 보편적 편집 경계가 아님을 의미합니다.

현재 동작은 채널별:

- 일부 채널은 이미 특정 경로에서 보충 컨텍스트에 발신자 기반 필터링을 적용합니다(예: Slack 스레드 시딩, Matrix 답장/스레드 조회).
- 다른 채널은 여전히 인용/답장/전달 컨텍스트를 수신한 대로 전달합니다.

강화 방향(계획됨):

- `contextVisibility: "all"` (기본값)은 현재 수신한 대로의 동작을 유지합니다.
- `contextVisibility: "allowlist"`는 보충 컨텍스트를 허용 목록에 있는 발신자로 필터링합니다.
- `contextVisibility: "allowlist_quote"`는 `allowlist`에 명시적 인용/답장 예외를 하나 추가합니다.

이 강화 모델이 채널 전반에 일관되게 구현될 때까지 플랫폼별 차이가 있을 수 있습니다.

![그룹 메시지 흐름](/images/groups-flow.svg)

원하는 동작...

| 목표                                             | 설정 방법                                                  |
| ------------------------------------------------ | ---------------------------------------------------------- |
| 모든 그룹 허용하지만 @언급 시만 응답             | `groups: { "*": { requireMention: true } }`                |
| 모든 그룹 응답 비활성화                          | `groupPolicy: "disabled"`                                  |
| 특정 그룹만 허용                                 | `groups: { "&lt;group-id&gt;": { ... } }` (`"*"` 키 없음)        |
| 그룹에서 나만 트리거 가능                        | `groupPolicy: "allowlist"`, `groupAllowFrom: ["+1555..."]` |

## 세션 키

- 그룹 세션은 `agent:&lt;agentId&gt;:&lt;channel&gt;:group:&lt;id&gt;` 세션 키를 사용합니다(방/채널은 `agent:&lt;agentId&gt;:&lt;channel&gt;:channel:&lt;id&gt;` 사용).
- Telegram 포럼 주제는 그룹 ID에 `:topic:&lt;threadId&gt;`를 추가하여 각 주제가 자체 세션을 갖도록 합니다.
- 다이렉트 채팅은 메인 세션을 사용합니다(또는 구성된 경우 발신자별).
- 그룹 세션에 대해 하트비트가 건너뜁니다.

<a id="pattern-personal-dms-public-groups-single-agent"></a>

## 패턴: 개인 DM + 공개 그룹 (단일 에이전트)

네, "개인" 트래픽이 **DM**이고 "공개" 트래픽이 **그룹**인 경우 잘 작동합니다.

이유: 단일 에이전트 모드에서 DM은 일반적으로 **main** 세션 키(`agent:main:main`)에 도착하는 반면, 그룹은 항상 **non-main** 세션 키(`agent:main:&lt;channel&gt;:group:&lt;id&gt;`)를 사용합니다. `mode: "non-main"`으로 샌드박싱을 활성화하면 해당 그룹 세션은 Docker에서 실행되고 메인 DM 세션은 호스트에 유지됩니다.

이는 하나의 에이전트 "두뇌"(공유 워크스페이스 + 메모리)를 제공하지만 두 가지 실행 자세로:

- **DM**: 전체 도구(호스트)
- **그룹**: 샌드박스 + 제한된 도구(Docker)

> 진정으로 별도의 워크스페이스/페르소나("개인"과 "공개"가 절대 섞이면 안 됨)가 필요한 경우 두 번째 에이전트 + 바인딩을 사용하십시오. [멀티 에이전트 라우팅](/concepts/multi-agent)을 참조하십시오.

예시 (DM은 호스트에서, 그룹은 샌드박스 + 메시징 전용 도구):

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // 그룹/채널은 non-main -> 샌드박스
        scope: "session", // 최강 격리(그룹/채널당 하나의 컨테이너)
        workspaceAccess: "none",
      },
    },
  },
  tools: {
    sandbox: {
      tools: {
        // allow가 비어 있지 않으면 나머지는 모두 차단됩니다(deny가 여전히 우선).
        allow: ["group:messaging", "group:sessions"],
        deny: ["group:runtime", "group:fs", "group:ui", "nodes", "cron", "gateway"],
      },
    },
  },
}
```

"호스트 접근 없음" 대신 "그룹은 폴더 X만 볼 수 있음"을 원하시면? `workspaceAccess: "none"`을 유지하고 허용 목록에 있는 경로만 샌드박스에 마운트하십시오:

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "none",
        docker: {
          binds: [
            // hostPath:containerPath:mode
            "/home/user/FriendsShared:/data:ro",
          ],
        },
      },
    },
  },
}
```

관련:

- 구성 키 및 기본값: [게이트웨이 구성](/gateway/configuration-reference#agentsdefaultssandbox)
- 도구가 차단된 이유 디버깅: [샌드박스 vs 도구 정책 vs 상승](/gateway/sandbox-vs-tool-policy-vs-elevated)
- 바인드 마운트 세부 정보: [샌드박싱](/gateway/sandboxing#custom-bind-mounts)

## 표시 레이블

- UI 레이블은 사용 가능한 경우 `displayName`을 사용하며, `&lt;channel&gt;:&lt;token&gt;` 형식으로 표시됩니다.
- `#room`은 방/채널용으로 예약되어 있습니다. 그룹 채팅은 `g-&lt;slug&gt;`를 사용합니다(소문자, 공백은 `-`로, `#@+._-`는 유지).

## 그룹 정책

채널별로 그룹/방 메시지를 처리하는 방법 제어:

```json5
{
  channels: {
    whatsapp: {
      groupPolicy: "disabled", // "open" | "disabled" | "allowlist"
      groupAllowFrom: ["+15551234567"],
    },
    telegram: {
      groupPolicy: "disabled",
      groupAllowFrom: ["123456789"], // 숫자 Telegram 사용자 ID(마법사가 @username 해결 가능)
    },
    signal: {
      groupPolicy: "disabled",
      groupAllowFrom: ["+15551234567"],
    },
    imessage: {
      groupPolicy: "disabled",
      groupAllowFrom: ["chat_id:123"],
    },
    msteams: {
      groupPolicy: "disabled",
      groupAllowFrom: ["user@org.com"],
    },
    discord: {
      groupPolicy: "allowlist",
      guilds: {
        GUILD_ID: { channels: { help: { allow: true } } },
      },
    },
    slack: {
      groupPolicy: "allowlist",
      channels: { "#general": { allow: true } },
    },
    matrix: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["@owner:example.org"],
      groups: {
        "!roomId:example.org": { enabled: true },
        "#alias:example.org": { enabled: true },
      },
    },
  },
}
```

| 정책          | 동작                                                         |
| ------------- | ------------------------------------------------------------ |
| `"open"`      | 그룹이 허용 목록을 우회합니다. 언급 게이팅은 여전히 적용됩니다. |
| `"disabled"`  | 모든 그룹 메시지를 완전히 차단합니다.                       |
| `"allowlist"` | 구성된 허용 목록과 일치하는 그룹/방만 허용합니다.           |

참고:

- `groupPolicy`는 언급 게이팅(@언급 필요)과 별개입니다.
- WhatsApp/Telegram/Signal/iMessage/Microsoft Teams/Zalo: `groupAllowFrom` 사용(폴백: 명시적 `allowFrom`).
- DM 페어링 승인(`*-allowFrom` 저장소 항목)은 DM 접근에만 적용됩니다. 그룹 발신자 인증은 그룹 허용 목록에 명시적으로 지정됩니다.
- Discord: 허용 목록은 `channels.discord.guilds.&lt;id&gt;.channels` 사용.
- Slack: 허용 목록은 `channels.slack.channels` 사용.
- Matrix: 허용 목록은 `channels.matrix.groups` 사용. 방 ID 또는 별칭을 선호하십시오. 참여한 방 이름 조회는 최선이며 런타임에 해결되지 않은 이름은 무시됩니다. `channels.matrix.groupAllowFrom`을 사용하여 발신자를 제한하십시오; 방별 `users` 허용 목록도 지원됩니다.
- 그룹 DM은 별도로 제어됩니다(`channels.discord.dm.*`, `channels.slack.dm.*`).
- Telegram 허용 목록은 사용자 ID(`"123456789"`, `"telegram:123456789"`, `"tg:123456789"`) 또는 사용자 이름(`"@alice"` 또는 `"alice"`)과 일치할 수 있습니다. 접두사는 대소문자를 구분하지 않습니다.
- 기본값은 `groupPolicy: "allowlist"`입니다. 그룹 허용 목록이 비어 있으면 그룹 메시지가 차단됩니다.
- 런타임 안전: 프로바이더 블록이 완전히 없는 경우(`channels.&lt;provider&gt;` 부재), 그룹 정책은 `channels.defaults.groupPolicy`를 상속하는 대신 페일-클로즈 모드(일반적으로 `allowlist`)로 폴백됩니다.

빠른 정신 모델(그룹 메시지 평가 순서):

1. `groupPolicy` (open/disabled/allowlist)
2. 그룹 허용 목록(`*.groups`, `*.groupAllowFrom`, 채널별 허용 목록)
3. 언급 게이팅(`requireMention`, `/activation`)

## 언급 게이팅 (기본값)

그룹 메시지는 그룹별로 재정의하지 않는 한 언급이 필요합니다. 기본값은 `*.groups."*"` 아래 하위 시스템별로 있습니다.

봇 메시지에 답장하는 것은 채널이 답장 메타데이터를 지원하는 경우 암묵적 언급으로 간주됩니다. 봇 메시지를 인용하는 것도 인용 메타데이터를 노출하는 채널에서 암묵적 언급으로 간주될 수 있습니다. 현재 내장 케이스에는 Telegram, WhatsApp, Slack, Discord, Microsoft Teams, ZaloUser가 포함됩니다.

```json5
{
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true },
        "123@g.us": { requireMention: false },
      },
    },
    telegram: {
      groups: {
        "*": { requireMention: true },
        "123456789": { requireMention: false },
      },
    },
    imessage: {
      groups: {
        "*": { requireMention: true },
        "123": { requireMention: false },
      },
    },
  },
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          mentionPatterns: ["@openclaw", "openclaw", "\\+15555550123"],
          historyLimit: 50,
        },
      },
    ],
  },
}
```

참고:

- `mentionPatterns`는 대소문자를 구분하지 않는 안전한 regex 패턴입니다. 유효하지 않은 패턴과 안전하지 않은 중첩 반복 형식은 무시됩니다.
- 명시적 언급을 제공하는 플랫폼은 여전히 통과됩니다. 패턴은 폴백입니다.
- 에이전트별 오버라이드: `agents.list[].groupChat.mentionPatterns`(여러 에이전트가 그룹을 공유하는 경우 유용).
- 언급 게이팅은 언급 감지가 가능한 경우에만 적용됩니다(네이티브 언급 또는 `mentionPatterns` 구성).
- Discord 기본값은 `channels.discord.guilds."*"`에 있습니다(길드/채널별 오버라이드 가능).
- 그룹 기록 컨텍스트는 채널 전반에 걸쳐 균일하게 래핑되며 **보류 중만** 해당됩니다(언급 게이팅으로 건너뛴 메시지). 전역 기본값은 `messages.groupChat.historyLimit`를 사용하고 오버라이드는 `channels.&lt;channel&gt;.historyLimit`(또는 `channels.&lt;channel&gt;.accounts.*.historyLimit`)를 사용합니다. `0`으로 비활성화합니다.

## 그룹/채널 도구 제한 (선택 사항)

일부 채널 구성은 **특정 그룹/방/채널 내부**에서 사용 가능한 도구를 제한하는 것을 지원합니다.

- `tools`: 전체 그룹에 대한 도구 허용/거부.
- `toolsBySender`: 그룹 내 발신자별 오버라이드.
  명시적 키 접두사를 사용하십시오:
  `id:&lt;senderId&gt;`, `e164:&lt;phone&gt;`, `username:&lt;handle&gt;`, `name:&lt;displayName&gt;`, `"*"` 와일드카드.
  레거시 접두사 없는 키는 여전히 허용되며 `id:`로만 매핑됩니다.

해결 순서(가장 구체적인 것이 우선):

1. 그룹/채널 `toolsBySender` 매치
2. 그룹/채널 `tools`
3. 기본(`"*"`) `toolsBySender` 매치
4. 기본(`"*"`) `tools`

예시 (Telegram):

```json5
{
  channels: {
    telegram: {
      groups: {
        "*": { tools: { deny: ["exec"] } },
        "-1001234567890": {
          tools: { deny: ["exec", "read", "write"] },
          toolsBySender: {
            "id:123456789": { alsoAllow: ["exec"] },
          },
        },
      },
    },
  },
}
```

참고:

- 그룹/채널 도구 제한은 전역/에이전트 도구 정책에 추가로 적용됩니다(deny가 여전히 우선).
- 일부 채널은 방/채널에 다른 중첩을 사용합니다(예: Discord `guilds.*.channels.*`, Slack `channels.*`, Microsoft Teams `teams.*.channels.*`).

## 그룹 허용 목록

`channels.whatsapp.groups`, `channels.telegram.groups`, 또는 `channels.imessage.groups`가 구성되면 키가 그룹 허용 목록 역할을 합니다. 기본 언급 동작을 설정하면서도 모든 그룹을 허용하려면 `"*"`를 사용하십시오.

일반적인 혼동: DM 페어링 승인이 그룹 인증과 동일하지 않습니다.
DM 페어링을 지원하는 채널의 경우, 페어링 저장소는 DM만 잠금 해제합니다. 그룹 명령은 여전히 `groupAllowFrom` 또는 해당 채널에 대한 문서화된 구성 폴백과 같은 구성 허용 목록에서 명시적인 그룹 발신자 인증이 필요합니다.

일반적인 의도 (복사/붙여넣기):

1. 모든 그룹 응답 비활성화

```json5
{
  channels: { whatsapp: { groupPolicy: "disabled" } },
}
```

2. 특정 그룹만 허용 (WhatsApp)

```json5
{
  channels: {
    whatsapp: {
      groups: {
        "123@g.us": { requireMention: true },
        "456@g.us": { requireMention: false },
      },
    },
  },
}
```

3. 모든 그룹 허용하지만 언급 필요 (명시적)

```json5
{
  channels: {
    whatsapp: {
      groups: { "*": { requireMention: true } },
    },
  },
}
```

4. 소유자만 그룹에서 트리거 가능 (WhatsApp)

```json5
{
  channels: {
    whatsapp: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"],
      groups: { "*": { requireMention: true } },
    },
  },
}
```

## 활성화 (소유자 전용)

그룹 소유자는 그룹별 활성화를 전환할 수 있습니다:

- `/activation mention`
- `/activation always`

소유자는 `channels.whatsapp.allowFrom`에 의해 결정됩니다(설정되지 않은 경우 봇의 자체 E.164). 명령을 독립 메시지로 보내십시오. 다른 플랫폼은 현재 `/activation`을 무시합니다.

## 컨텍스트 필드

그룹 인바운드 페이로드 설정:

- `ChatType=group`
- `GroupSubject` (알려진 경우)
- `GroupMembers` (알려진 경우)
- `WasMentioned` (언급 게이팅 결과)
- Telegram 포럼 주제에는 `MessageThreadId` 및 `IsForum`도 포함됩니다.

채널별 참고 사항:

- BlueBubbles는 선택적으로 로컬 연락처 데이터베이스에서 이름이 없는 macOS 그룹 참가자를 풍부하게 할 수 있습니다. `GroupMembers` 채울 때. 이는 기본적으로 꺼져 있으며 일반 그룹 게이팅이 통과된 후에만 실행됩니다.

에이전트 시스템 프롬프트는 새 그룹 세션의 첫 번째 턴에 그룹 소개를 포함합니다. 이는 모델이 사람처럼 응답하고, 마크다운 테이블을 피하고, 빈 줄을 최소화하고, 일반 채팅 간격을 따르며, 리터럴 `\n` 시퀀스를 입력하지 않도록 상기시킵니다.

## iMessage 세부 사항

- 라우팅 또는 허용 목록 작성 시 `chat_id:&lt;id&gt;`를 선호합니다.
- 채팅 목록: `imsg chats --limit 20`.
- 그룹 응답은 항상 동일한 `chat_id`로 돌아갑니다.

## WhatsApp 세부 사항

WhatsApp 전용 동작(기록 주입, 언급 처리 세부 정보)은 [그룹 메시지](/channels/group-messages)를 참조하십시오.
