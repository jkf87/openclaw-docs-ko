---
title: "LLM 태스크"
description: "워크플로우용 JSON 전용 LLM 태스크 (선택적 플러그인 도구)"
---

# LLM 태스크

`llm-task`는 JSON 전용 LLM 태스크를 실행하고 구조화된 출력(선택적으로 JSON Schema에 대해 검증됨)을 반환하는 **선택적 플러그인 도구**입니다.

이것은 Lobster와 같은 워크플로우 엔진에 이상적입니다: 각 워크플로우에 대한 커스텀 OpenClaw 코드를 작성하지 않고도 단일 LLM 단계를 추가할 수 있습니다.

## 플러그인 활성화

1. 플러그인을 활성화합니다:

```json
{
  "plugins": {
    "entries": {
      "llm-task": { "enabled": true }
    }
  }
}
```

2. 도구를 허용 목록에 추가합니다 (`optional: true`로 등록됨):

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": { "allow": ["llm-task"] }
      }
    ]
  }
}
```

## 설정 (선택 사항)

```json
{
  "plugins": {
    "entries": {
      "llm-task": {
        "enabled": true,
        "config": {
          "defaultProvider": "openai-codex",
          "defaultModel": "gpt-5.4",
          "defaultAuthProfileId": "main",
          "allowedModels": ["openai-codex/gpt-5.4"],
          "maxTokens": 800,
          "timeoutMs": 30000
        }
      }
    }
  }
}
```

`allowedModels`는 `provider/model` 문자열의 허용 목록입니다. 설정된 경우 목록 외부의 요청은 거부됩니다.

## 도구 파라미터

- `prompt` (문자열, 필수)
- `input` (임의, 선택 사항)
- `schema` (객체, 선택적 JSON Schema)
- `provider` (문자열, 선택 사항)
- `model` (문자열, 선택 사항)
- `thinking` (문자열, 선택 사항)
- `authProfileId` (문자열, 선택 사항)
- `temperature` (숫자, 선택 사항)
- `maxTokens` (숫자, 선택 사항)
- `timeoutMs` (숫자, 선택 사항)

`thinking`은 `low` 또는 `medium`과 같은 표준 OpenClaw 추론 프리셋을 허용합니다.

## 출력

파싱된 JSON이 포함된 `details.json`을 반환합니다 (`schema`가 제공된 경우 해당 스키마에 대해 검증).

## 예시: Lobster 워크플로우 단계

```lobster
openclaw.invoke --tool llm-task --action json --args-json '{
  "prompt": "Given the input email, return intent and draft.",
  "thinking": "low",
  "input": {
    "subject": "Hello",
    "body": "Can you help?"
  },
  "schema": {
    "type": "object",
    "properties": {
      "intent": { "type": "string" },
      "draft": { "type": "string" }
    },
    "required": ["intent", "draft"],
    "additionalProperties": false
  }
}'
```

## 안전 참고 사항

- 도구는 **JSON 전용**이며 모델이 JSON만 출력하도록 지시합니다 (코드 펜스 없음, 주석 없음).
- 이 실행에 대해 모델에 도구가 노출되지 않습니다.
- `schema`로 검증하지 않는 한 출력을 신뢰할 수 없는 것으로 처리합니다.
- 부작용이 있는 단계(전송, 게시, exec) 앞에 승인을 배치합니다.
