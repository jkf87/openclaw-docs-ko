---
summary: "지원되는 모든 채널의 리액션 도구 의미론"
read_when:
  - 어느 채널에서든 리액션 작업을 하는 경우
  - 플랫폼별 이모지 리액션 차이를 이해하는 경우
title: "리액션"
---

# 리액션

에이전트는 `react` 액션이 있는 `message` 도구를 사용하여 메시지에 이모지 리액션을 추가하고 제거할 수 있습니다. 리액션 동작은 채널마다 다릅니다.

## 작동 방식

```json
{
  "action": "react",
  "messageId": "msg-123",
  "emoji": "thumbsup"
}
```

- `emoji`는 리액션 추가 시 필수입니다.
- 봇의 리액션을 제거하려면 `emoji`를 빈 문자열 (`""`)로 설정합니다.
- 특정 이모지를 제거하려면 `remove: true`를 설정합니다 (비어 있지 않은 `emoji` 필요).

## 채널 동작

<AccordionGroup>
  <Accordion title="Discord 및 Slack">
    - 빈 `emoji`는 메시지에 있는 봇의 모든 리액션을 제거합니다.
    - `remove: true`는 지정된 이모지만 제거합니다.
  </Accordion>

  <Accordion title="Google Chat">
    - 빈 `emoji`는 메시지에 있는 앱의 리액션을 제거합니다.
    - `remove: true`는 지정된 이모지만 제거합니다.
  </Accordion>

  <Accordion title="Telegram">
    - 빈 `emoji`는 봇의 리액션을 제거합니다.
    - `remove: true`도 리액션을 제거하지만 도구 유효성 검사를 위해 비어 있지 않은 `emoji`가 여전히 필요합니다.
  </Accordion>

  <Accordion title="WhatsApp">
    - 빈 `emoji`는 봇 리액션을 제거합니다.
    - `remove: true`는 내부적으로 빈 이모지로 매핑됩니다 (도구 호출에서 여전히 `emoji` 필요).
  </Accordion>

  <Accordion title="Zalo Personal (zalouser)">
    - 비어 있지 않은 `emoji`가 필요합니다.
    - `remove: true`는 해당 특정 이모지 리액션을 제거합니다.
  </Accordion>

  <Accordion title="Feishu/Lark">
    - `add`, `remove`, `list` 액션이 있는 `feishu_reaction` 도구를 사용합니다.
    - 추가/제거에는 `emoji_type`이 필요하며; 제거에는 `reaction_id`도 필요합니다.
  </Accordion>

  <Accordion title="Signal">
    - 인바운드 리액션 알림은 `channels.signal.reactionNotifications`로 제어됩니다: `"off"`는 비활성화하고, `"own"` (기본값)은 사용자가 봇 메시지에 리액션할 때 이벤트를 내보내며, `"all"`은 모든 리액션에 대해 이벤트를 내보냅니다.
  </Accordion>
</AccordionGroup>

## 리액션 레벨

채널별 `reactionLevel` 설정은 에이전트가 리액션을 얼마나 광범위하게 사용하는지 제어합니다. 값은 일반적으로 `off`, `ack`, `minimal`, 또는 `extensive`입니다.

- [Telegram reactionLevel](/channels/telegram#reaction-notifications) — `channels.telegram.reactionLevel`
- [WhatsApp reactionLevel](/channels/whatsapp#reactions) — `channels.whatsapp.reactionLevel`

각 플랫폼에서 에이전트가 메시지에 리액션하는 정도를 조정하려면 개별 채널에서 `reactionLevel`을 설정하십시오.

## 관련 항목

- [에이전트 전송](/tools/agent-send) — `react`를 포함한 `message` 도구
- [채널](/channels/) — 채널별 설정
