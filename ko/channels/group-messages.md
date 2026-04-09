---
summary: "그룹 메시지 처리, 언급 감지 및 세션 격리"
read_when:
  - 그룹 채팅 동작 구성 시
  - 언급 감지 커스터마이즈 시
title: "그룹 메시지"
---

# 그룹 메시지

OpenClaw는 그룹 채팅 메시지를 DM과 다르게 처리합니다.

## 언급 감지

그룹 메시지는 기본적으로 언급 게이팅됩니다. 봇은 다음 경우에만 응답합니다:

1. 채널 네이티브 언급 (예: Telegram `@botusername`, Discord `<@botId>`, Slack `<@botId>`)
2. 구성된 언급 패턴:
   - `agents.list[].groupChat.mentionPatterns`
   - `messages.groupChat.mentionPatterns`

### 언급 패턴 구성

```json5
{
  messages: {
    groupChat: {
      mentionPatterns: ["alfred", "hey bot"],
    },
  },
}
```

또는 에이전트별:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          mentionPatterns: ["alfred", "ai"],
        },
      },
    ],
  },
}
```

### 언급 없이 응답

언급 게이팅을 비활성화하려면:

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

Discord의 경우:

```json5
{
  channels: {
    discord: {
      guilds: {
        "YOUR_SERVER_ID": {
          requireMention: false,
        },
      },
    },
  },
}
```

## 세션 격리

그룹 채팅은 각 그룹 대화에 대해 격리된 세션을 사용합니다:

- 세션 키 형식: `agent:<agentId>:<channel>:group:<id>`
- 예시: `agent:main:telegram:group:-1001234567890`

이는 각 그룹 채팅이 자체 대화 히스토리와 컨텍스트를 유지함을 의미합니다.

## 그룹 히스토리

그룹 컨텍스트 히스토리 제한을 구성합니다:

```json5
{
  messages: {
    groupChat: {
      historyLimit: 50,
    },
  },
}
```

또는 채널별:

```json5
{
  channels: {
    telegram: {
      historyLimit: 50,
    },
  },
}
```

## 도구 제한

그룹별 도구 접근을 제한합니다:

```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          tools: ["web_search", "calculator"],
        },
      },
    },
  },
}
```

빈 배열(`tools: []`)은 해당 그룹에서 모든 도구를 비활성화합니다.

## 발신자별 도구 제한

Slack의 경우 발신자별로 도구를 제한할 수 있습니다:

```json5
{
  channels: {
    slack: {
      channels: {
        "C12345": {
          toolsBySender: {
            "id:U12345": ["web_search"],
            "*": [],
          },
        },
      },
    },
  },
}
```

## 그룹별 시스템 프롬프트

그룹별 사용자 정의 시스템 프롬프트를 추가합니다:

```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          systemPrompt: "이 채팅에서 항상 한국어로 응답하십시오.",
        },
      },
    },
  },
}
```

## 그룹 발신자 허용 목록

그룹 내에서 봇을 트리거할 수 있는 사람을 제한합니다:

```json5
{
  channels: {
    telegram: {
      groupAllowFrom: ["123456789", "987654321"],
    },
  },
}
```

또는 그룹별:

```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          allowFrom: ["123456789"],
        },
      },
    },
  },
}
```

## 관련 문서

- [그룹](/channels/groups) - 그룹 정책 개요
- [채널 라우팅](/channels/channel-routing) - 세션 키 형태
- [Telegram](/channels/telegram)
- [Discord](/channels/discord)
- [Slack](/channels/slack)
