---
summary: "WhatsApp 그룹 메시지 처리 동작 및 구성 (mentionPatterns은 여러 서피스에서 공유됨)"
read_when:
  - 그룹 메시지 규칙 또는 멘션 변경 시
title: "그룹 메시지"
---

# 그룹 메시지 (WhatsApp 웹 채널)

목표: Clawd가 WhatsApp 그룹에 있으면서 핑을 받을 때만 깨어나고, 해당 스레드를 개인 DM 세션과 분리된 상태로 유지하도록 합니다.

참고: `agents.list[].groupChat.mentionPatterns`은 이제 Telegram/Discord/Slack/iMessage에서도 사용됩니다. 이 문서는 WhatsApp 특화 동작에 초점을 맞춥니다. 멀티 에이전트 설정의 경우 에이전트별로 `agents.list[].groupChat.mentionPatterns`을 설정하세요 (또는 전역 폴백으로 `messages.groupChat.mentionPatterns`을 사용하세요).

## 현재 구현 (2025-12-03)

- 활성화 모드: `mention` (기본값) 또는 `always`. `mention`은 핑이 필요합니다 (`mentionedJids`를 통한 실제 WhatsApp @멘션, 안전한 정규식 패턴, 또는 텍스트 어디든 봇의 E.164 번호). `always`는 모든 메시지에 에이전트를 깨우지만 의미 있는 가치를 더할 수 있을 때만 응답해야 합니다. 그렇지 않으면 정확한 무응답 토큰 `NO_REPLY` / `no_reply`를 반환합니다. 기본값은 구성(`channels.whatsapp.groups`)에서 설정할 수 있으며 `/activation`을 통해 그룹별로 재정의할 수 있습니다. `channels.whatsapp.groups`가 설정되면 그룹 허용 목록으로도 작동합니다 (모두 허용하려면 `"*"`를 포함하세요).
- 그룹 정책: `channels.whatsapp.groupPolicy`는 그룹 메시지가 수락되는지 제어합니다 (`open|disabled|allowlist`). `allowlist`는 `channels.whatsapp.groupAllowFrom`을 사용합니다 (폴백: 명시적 `channels.whatsapp.allowFrom`). 기본값은 `allowlist`입니다 (발신자를 추가할 때까지 차단됨).
- 그룹별 세션: 세션 키는 `agent:<agentId>:whatsapp:group:<jid>`처럼 보이므로 `/verbose on`, `/trace on`, `/think high`와 같은 명령(독립 실행형 메시지로 전송)은 해당 그룹 범위로 제한됩니다. 개인 DM 상태는 영향을 받지 않습니다. 그룹 스레드에서는 하트비트가 건너뛰어집니다.
- 컨텍스트 주입: **대기 중인 경우에만** 실행을 트리거하지 _않은_ 그룹 메시지(기본값 50개)가 `[Chat messages since your last reply - for context]` 아래에 접두어로 추가되며, 트리거 라인은 `[Current message - respond to this]` 아래에 배치됩니다. 이미 세션에 있는 메시지는 다시 주입되지 않습니다.
- 발신자 표시: 모든 그룹 배치는 이제 `[from: Sender Name (+E164)]`로 끝나므로 Pi는 누가 말하는지 알 수 있습니다.
- Ephemeral/view-once: 텍스트/멘션을 추출하기 전에 이를 언래핑하므로, 그 안의 핑도 여전히 트리거됩니다.
- 그룹 시스템 프롬프트: 그룹 세션의 첫 번째 턴에서 (그리고 `/activation`이 모드를 변경할 때마다) 시스템 프롬프트에 다음과 같은 짧은 블러브를 주입합니다: `You are replying inside the WhatsApp group "<subject>". Group members: Alice (+44...), Bob (+43...), … Activation: trigger-only … Address the specific sender noted in the message context.` 메타데이터를 사용할 수 없는 경우에도 여전히 에이전트에게 그룹 채팅이라고 알려줍니다.

## 구성 예시 (WhatsApp)

WhatsApp이 텍스트 본문에서 시각적 `@`를 제거하더라도 표시 이름 핑이 작동하도록 `~/.openclaw/openclaw.json`에 `groupChat` 블록을 추가하세요:

```json5
{
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true },
      },
    },
  },
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          historyLimit: 50,
          mentionPatterns: ["@?openclaw", "\\+?15555550123"],
        },
      },
    ],
  },
}
```

참고 사항:

- 정규식은 대소문자를 구분하지 않으며 다른 구성 정규식 서피스와 동일한 safe-regex 가드레일을 사용합니다. 유효하지 않은 패턴과 안전하지 않은 중첩 반복은 무시됩니다.
- WhatsApp은 누군가 연락처를 탭할 때 `mentionedJids`를 통해 정식 멘션을 계속 보내므로 번호 폴백은 거의 필요하지 않지만 유용한 안전망입니다.

### 활성화 명령 (소유자 전용)

그룹 채팅 명령을 사용합니다:

- `/activation mention`
- `/activation always`

소유자 번호(`channels.whatsapp.allowFrom`에서, 설정되지 않은 경우 봇 자체의 E.164)만 이를 변경할 수 있습니다. 현재 활성화 모드를 보려면 그룹에서 독립 실행형 메시지로 `/status`를 보내세요.

## 사용 방법

1. OpenClaw를 실행하는 WhatsApp 계정을 그룹에 추가합니다.
2. `@openclaw …`라고 말합니다 (또는 번호를 포함합니다). `groupPolicy: "open"`을 설정하지 않는 한 허용 목록에 있는 발신자만 트리거할 수 있습니다.
3. 에이전트 프롬프트에는 최근 그룹 컨텍스트와 끝의 `[from: …]` 마커가 포함되어 적절한 사람을 지정할 수 있습니다.
4. 세션 수준 지시문(`/verbose on`, `/trace on`, `/think high`, `/new` 또는 `/reset`, `/compact`)은 해당 그룹의 세션에만 적용됩니다. 이를 등록하려면 독립 실행형 메시지로 보내세요. 개인 DM 세션은 독립적으로 유지됩니다.

## 테스트 / 검증

- 수동 스모크:
  - 그룹에서 `@openclaw` 핑을 보내고 발신자 이름을 참조하는 응답을 확인합니다.
  - 두 번째 핑을 보내고 히스토리 블록이 포함되어 있다가 다음 턴에 지워지는지 확인합니다.
- 게이트웨이 로그 (`--verbose`로 실행) 를 확인하여 `from: <groupJid>`와 `[from: …]` 접미사를 보여주는 `inbound web message` 항목을 확인합니다.

## 알려진 고려 사항

- 시끄러운 브로드캐스트를 피하기 위해 그룹에서는 하트비트가 의도적으로 건너뛰어집니다.
- 에코 억제는 결합된 배치 문자열을 사용합니다. 멘션 없이 동일한 텍스트를 두 번 보내면 첫 번째만 응답을 받습니다.
- 세션 저장소 항목은 세션 저장소(`~/.openclaw/agents/<agentId>/sessions/sessions.json` 기본값)에 `agent:<agentId>:whatsapp:group:<jid>`로 나타납니다. 항목이 없다는 것은 그룹이 아직 실행을 트리거하지 않았음을 의미합니다.
- 그룹에서의 타이핑 표시기는 `agents.defaults.typingMode`를 따릅니다 (기본값: 멘션되지 않은 경우 `message`).

## 관련 문서

- [그룹](/channels/groups)
- [채널 라우팅](/channels/channel-routing)
- [브로드캐스트 그룹](/channels/broadcast-groups)
