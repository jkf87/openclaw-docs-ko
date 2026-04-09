---
title: "컴팩션"
description: "OpenClaw가 모델 한도 내에서 유지하기 위해 긴 대화를 요약하는 방법"
---

# 컴팩션

모든 모델에는 컨텍스트 윈도우 -- 처리할 수 있는 최대 토큰 수 -- 가 있습니다. 대화가 해당 한도에 근접하면 OpenClaw는 오래된 메시지를 요약으로 **컴팩션**하여 채팅을 계속 진행할 수 있게 합니다.

## 작동 방식

1. 오래된 대화 턴이 컴팩트 항목으로 요약됩니다.
2. 요약이 세션 트랜스크립트에 저장됩니다.
3. 최근 메시지는 그대로 유지됩니다.

OpenClaw가 히스토리를 컴팩션 청크로 분할할 때, 어시스턴트 도구 호출과 일치하는 `toolResult` 항목이 짝을 이루도록 유지합니다. 분할 지점이 도구 블록 내부에 놓이면, OpenClaw는 쌍이 함께 유지되고 현재 요약되지 않은 테일이 보존되도록 경계를 이동합니다.

전체 대화 히스토리는 디스크에 유지됩니다. 컴팩션은 모델이 다음 턴에서 보는 것만 변경합니다.

## 자동 컴팩션

자동 컴팩션은 기본적으로 켜져 있습니다. 세션이 컨텍스트 한도에 근접하거나, 모델이 컨텍스트 오버플로우 오류를 반환할 때 실행됩니다 (이 경우 OpenClaw는 컴팩션하고 재시도합니다). 일반적인 오버플로우 시그니처에는 `request_too_large`, `context length exceeded`, `input exceeds the maximum number of tokens`, `input token count exceeds the maximum number of input tokens`, `input is too long for the model`, 및 `ollama error: context length exceeded`가 포함됩니다.

::: info
컴팩션 전에 OpenClaw는 에이전트에게 중요한 메모를 [메모리](/concepts/memory) 파일에 저장하도록 자동으로 상기시킵니다. 이는 컨텍스트 손실을 방지합니다.
:::


`openclaw.json`의 `agents.defaults.compaction` 설정을 사용하여 컴팩션 동작 (모드, 대상 토큰 등)을 구성하십시오. 컴팩션 요약은 기본적으로 불투명 식별자를 보존합니다 (`identifierPolicy: "strict"`). `identifierPolicy: "off"`로 오버라이드하거나 `identifierPolicy: "custom"` 및 `identifierInstructions`로 사용자 정의 텍스트를 제공할 수 있습니다.

선택적으로 `agents.defaults.compaction.model`을 통해 컴팩션 요약에 다른 모델을 지정할 수 있습니다. 이는 기본 모델이 로컬 또는 소형 모델이고 더 능력 있는 모델로 컴팩션 요약을 생성하려는 경우 유용합니다. 오버라이드는 `provider/model-id` 문자열을 허용합니다:

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "model": "openrouter/anthropic/claude-sonnet-4-6"
      }
    }
  }
}
```

이는 로컬 모델에서도 작동합니다. 예를 들어, 요약 전용 Ollama 모델 또는 파인튜닝된 컴팩션 전문가 모델:

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "model": "ollama/llama3.1:8b"
      }
    }
  }
}
```

설정하지 않으면 컴팩션은 에이전트의 기본 모델을 사용합니다.

## 플러그 가능한 컴팩션 프로바이더

플러그인은 플러그인 API의 `registerCompactionProvider()`를 통해 사용자 정의 컴팩션 프로바이더를 등록할 수 있습니다. 프로바이더가 등록되고 구성되면 OpenClaw는 내장 LLM 파이프라인 대신 요약을 위임합니다.

등록된 프로바이더를 사용하려면 구성에서 프로바이더 ID를 설정하십시오:

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "provider": "my-provider"
      }
    }
  }
}
```

`provider`를 설정하면 자동으로 `mode: "safeguard"`가 강제됩니다. 프로바이더는 내장 경로와 동일한 컴팩션 지침 및 식별자 보존 정책을 받으며, OpenClaw는 프로바이더 출력 이후에도 최근 턴 및 분할 턴 접미사 컨텍스트를 보존합니다. 프로바이더가 실패하거나 빈 결과를 반환하면 OpenClaw는 내장 LLM 요약으로 폴백합니다.

## 자동 컴팩션 (기본적으로 켜짐)

세션이 모델의 컨텍스트 윈도우에 근접하거나 초과하면 OpenClaw는 자동 컴팩션을 트리거하고 컴팩션된 컨텍스트를 사용하여 원래 요청을 재시도할 수 있습니다.

다음을 볼 수 있습니다:

- 상세 모드에서 `🧹 Auto-compaction complete`
- `/status`에서 `🧹 Compactions: &lt;count&gt;` 표시

컴팩션 전에 OpenClaw는 디스크에 내구성 있는 메모를 저장하기 위한 **자동 메모리 플러시** 턴을 실행할 수 있습니다. 세부사항 및 구성은 [메모리](/concepts/memory)를 참조하십시오.

## 수동 컴팩션

채팅에서 `/compact`를 입력하여 컴팩션을 강제합니다. 요약을 안내하기 위해 지침을 추가할 수 있습니다:

```
/compact Focus on the API design decisions
```

## 다른 모델 사용

기본적으로 컴팩션은 에이전트의 기본 모델을 사용합니다. 더 나은 요약을 위해 더 능력 있는 모델을 사용할 수 있습니다:

```json5
{
  agents: {
    defaults: {
      compaction: {
        model: "openrouter/anthropic/claude-sonnet-4-6",
      },
    },
  },
}
```

## 컴팩션 시작 알림

기본적으로 컴팩션은 자동으로 실행됩니다. 컴팩션이 시작될 때 간단한 알림을 표시하려면 `notifyUser`를 활성화하십시오:

```json5
{
  agents: {
    defaults: {
      compaction: {
        notifyUser: true,
      },
    },
  },
}
```

활성화되면 사용자는 각 컴팩션 실행 시작 시 짧은 메시지 (예: "Compacting context...")를 볼 수 있습니다.

## 컴팩션 대 프루닝

|                | 컴팩션                        | 프루닝                          |
| -------------- | ----------------------------- | -------------------------------- |
| **기능**       | 오래된 대화를 요약합니다      | 오래된 도구 결과를 자릅니다      |
| **저장?**      | 예 (세션 트랜스크립트에)       | 아니오 (인메모리만, 요청당)      |
| **범위**       | 전체 대화                     | 도구 결과만                      |

[세션 프루닝](/concepts/session-pruning)은 요약 없이 도구 출력을 자르는 더 가벼운 보완 방법입니다.

## 트러블슈팅

**너무 자주 컴팩션됩니까?** 모델의 컨텍스트 윈도우가 작거나 도구 출력이 클 수 있습니다. [세션 프루닝](/concepts/session-pruning) 활성화를 시도하십시오.

**컴팩션 후 컨텍스트가 오래된 느낌입니까?** `/compact Focus on &lt;topic&gt;`을 사용하여 요약을 안내하거나, [메모리 플러시](/concepts/memory)를 활성화하여 메모가 유지되도록 하십시오.

**깨끗한 시작이 필요합니까?** `/new`는 컴팩션 없이 새 세션을 시작합니다.

고급 구성 (예약 토큰, 식별자 보존, 사용자 정의 컨텍스트 엔진, OpenAI 서버 측 컴팩션)은 [세션 관리 심층 분석](/reference/session-management-compaction)을 참조하십시오.

## 관련 항목

- [세션](/concepts/session) — 세션 관리 및 생명주기
- [세션 프루닝](/concepts/session-pruning) — 도구 결과 자르기
- [컨텍스트](/concepts/context) — 에이전트 턴을 위한 컨텍스트 빌드 방법
- [후크](/automation/hooks) — 컴팩션 생명주기 후크 (before_compaction, after_compaction)
