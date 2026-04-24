---
summary: "Heartbeat 폴링 메시지 및 알림 규칙"
read_when:
  - Heartbeat 주기나 메시지를 조정할 때
  - 예약 작업에 heartbeat와 cron 중 무엇을 사용할지 결정할 때
title: "Heartbeat"
---

# Heartbeat (Gateway)

> **Heartbeat vs Cron?** 각각을 언제 사용해야 하는지에 대한 안내는 [자동화 & 작업](/automation/)을 참조하십시오.

Heartbeat는 메인 세션에서 **주기적인 에이전트 턴**을 실행하여, 모델이 스팸 없이 주의가 필요한 사항을 드러낼 수 있도록 합니다.

Heartbeat는 예약된 메인 세션 턴이며, [백그라운드 작업](/automation/tasks) 레코드를 **생성하지 않습니다**. 작업 레코드는 분리된 작업(ACP 실행, 서브에이전트, 격리된 cron 작업)을 위한 것입니다.

문제 해결: [예약 작업](/automation/cron-jobs#troubleshooting)

## 빠른 시작 (초급)

1. Heartbeat를 활성화 상태로 두거나(기본값 `30m`, Anthropic OAuth/토큰 인증인 경우 `1h`로, Claude CLI 재사용 포함) 원하는 주기를 설정하십시오.
2. 에이전트 워크스페이스에 작은 `HEARTBEAT.md` 체크리스트나 `tasks:` 블록을 생성하십시오(선택 사항이지만 권장).
3. Heartbeat 메시지를 어디로 보낼지 결정하십시오(`target: "none"`이 기본값; 마지막 연락처로 라우팅하려면 `target: "last"`로 설정).
4. 선택 사항: 투명성을 위해 heartbeat 추론(reasoning) 전달을 활성화하십시오.
5. 선택 사항: heartbeat 실행에 `HEARTBEAT.md`만 필요하다면 경량 부트스트랩 컨텍스트를 사용하십시오.
6. 선택 사항: 매 heartbeat마다 전체 대화 히스토리를 보내지 않도록 격리된(isolated) 세션을 활성화하십시오.
7. 선택 사항: heartbeat를 활성 시간대(로컬 시간)로 제한하십시오.

예제 구성:

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last", // explicit delivery to last contact (default is "none")
        directPolicy: "allow", // default: allow direct/DM targets; set "block" to suppress
        lightContext: true, // optional: only inject HEARTBEAT.md from bootstrap files
        isolatedSession: true, // optional: fresh session each run (no conversation history)
        // activeHours: { start: "08:00", end: "24:00" },
        // includeReasoning: true, // optional: send separate `Reasoning:` message too
      },
    },
  },
}
```

## 기본값

- 간격: `30m` (Anthropic OAuth/토큰 인증이 감지된 인증 모드인 경우 `1h`, Claude CLI 재사용 포함). `agents.defaults.heartbeat.every` 또는 에이전트별 `agents.list[].heartbeat.every`를 설정하십시오; 비활성화하려면 `0m`을 사용하십시오.
- 프롬프트 본문(`agents.defaults.heartbeat.prompt`로 설정 가능):
  `Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.`
- Heartbeat 프롬프트는 사용자 메시지로 **그대로** 전송됩니다. 시스템 프롬프트는 기본 에이전트에 대해 heartbeat가 활성화되어 있고 실행이 내부적으로 플래그되어 있는 경우에만 "Heartbeat" 섹션을 포함합니다.
- Heartbeat가 `0m`으로 비활성화되면, 일반 실행에서도 부트스트랩 컨텍스트에서 `HEARTBEAT.md`가 생략되어 모델이 heartbeat 전용 지침을 보지 않습니다.
- 활성 시간(`heartbeat.activeHours`)은 구성된 타임존에서 확인됩니다. 창(window) 밖에서는 창 안의 다음 틱까지 heartbeat가 건너뛰어집니다.

## Heartbeat 프롬프트의 용도

기본 프롬프트는 의도적으로 광범위합니다:

- **백그라운드 작업**: "Consider outstanding tasks"는 에이전트가 후속 조치(인박스, 캘린더, 알림, 대기 중인 작업)를 검토하고 긴급한 항목을 드러내도록 유도합니다.
- **사람 체크인**: "Checkup sometimes on your human during day time"은 가끔 가벼운 "필요한 것 있나요?" 메시지를 유도하되, 구성된 로컬 타임존을 사용하여 야간 스팸을 피합니다([/concepts/timezone](/concepts/timezone) 참조).

Heartbeat는 완료된 [백그라운드 작업](/automation/tasks)에 반응할 수 있지만, heartbeat 실행 자체는 작업 레코드를 생성하지 않습니다.

Heartbeat가 매우 특정한 작업(예: "Gmail PubSub 통계 확인" 또는 "gateway 상태 검증")을 수행하길 원한다면, `agents.defaults.heartbeat.prompt`(또는 `agents.list[].heartbeat.prompt`)를 사용자 정의 본문으로 설정하십시오(그대로 전송됨).

## 응답 계약

- 주의가 필요한 사항이 없으면 **`HEARTBEAT_OK`**로 응답하십시오.
- Heartbeat 실행 중에는, OpenClaw가 `HEARTBEAT_OK`를 응답의 **시작 또는 끝**에 나타날 때 ack로 처리합니다. 토큰이 제거되고, 남은 내용이 **`ackMaxChars` 이하**(기본값: 300)이면 응답이 드롭됩니다.
- `HEARTBEAT_OK`가 응답의 **중간**에 나타나면, 특수하게 처리되지 않습니다.
- 알림의 경우, `HEARTBEAT_OK`를 **포함하지 마십시오**; 알림 텍스트만 반환하십시오.

Heartbeat 외부에서는 메시지의 시작/끝에 있는 불필요한 `HEARTBEAT_OK`가 제거되고 기록됩니다; `HEARTBEAT_OK`만 포함된 메시지는 드롭됩니다.

## 구성

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m", // default: 30m (0m disables)
        model: "anthropic/claude-opus-4-6",
        includeReasoning: false, // default: false (deliver separate Reasoning: message when available)
        lightContext: false, // default: false; true keeps only HEARTBEAT.md from workspace bootstrap files
        isolatedSession: false, // default: false; true runs each heartbeat in a fresh session (no conversation history)
        target: "last", // default: none | options: last | none | <channel id> (core or plugin, e.g. "bluebubbles")
        to: "+15551234567", // optional channel-specific override
        accountId: "ops-bot", // optional multi-account channel id
        prompt: "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.",
        ackMaxChars: 300, // max chars allowed after HEARTBEAT_OK
      },
    },
  },
}
```

### 범위 및 우선순위

- `agents.defaults.heartbeat`는 전역 heartbeat 동작을 설정합니다.
- `agents.list[].heartbeat`는 그 위에 병합됩니다; 어떤 에이전트에 `heartbeat` 블록이 있으면, **해당 에이전트만** heartbeat를 실행합니다.
- `channels.defaults.heartbeat`는 모든 채널에 대한 가시성 기본값을 설정합니다.
- `channels.<channel>.heartbeat`는 채널 기본값을 재정의합니다.
- `channels.<channel>.accounts.<id>.heartbeat`(다중 계정 채널)는 채널별 설정을 재정의합니다.

### 에이전트별 heartbeat

`agents.list[]` 항목에 `heartbeat` 블록이 포함되면, **해당 에이전트만** heartbeat를 실행합니다. 에이전트별 블록은 `agents.defaults.heartbeat` 위에 병합됩니다(따라서 공유 기본값을 한 번 설정하고 에이전트별로 재정의할 수 있습니다).

예: 두 개의 에이전트, 두 번째 에이전트만 heartbeat 실행.

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last", // explicit delivery to last contact (default is "none")
      },
    },
    list: [
      { id: "main", default: true },
      {
        id: "ops",
        heartbeat: {
          every: "1h",
          target: "whatsapp",
          to: "+15551234567",
          timeoutSeconds: 45,
          prompt: "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.",
        },
      },
    ],
  },
}
```

### 활성 시간 예제

특정 타임존의 업무 시간으로 heartbeat 제한:

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last", // explicit delivery to last contact (default is "none")
        activeHours: {
          start: "09:00",
          end: "22:00",
          timezone: "America/New_York", // optional; uses your userTimezone if set, otherwise host tz
        },
      },
    },
  },
}
```

이 창 밖(미 동부 시간 오전 9시 이전 또는 오후 10시 이후)에서는 heartbeat가 건너뛰어집니다. 창 안의 다음 예정된 틱은 정상적으로 실행됩니다.

### 24/7 설정

하루 종일 heartbeat를 실행하려면, 다음 패턴 중 하나를 사용하십시오:

- `activeHours`를 완전히 생략하십시오(시간 창 제한 없음; 이것이 기본 동작).
- 전일 창 설정: `activeHours: { start: "00:00", end: "24:00" }`.

동일한 `start`와 `end` 시간을 설정하지 마십시오(예: `08:00`에서 `08:00`). 이는 너비가 0인 창으로 처리되어, heartbeat가 항상 건너뛰어집니다.

### 다중 계정 예제

Telegram과 같은 다중 계정 채널에서 특정 계정을 대상으로 하려면 `accountId`를 사용하십시오:

```json5
{
  agents: {
    list: [
      {
        id: "ops",
        heartbeat: {
          every: "1h",
          target: "telegram",
          to: "12345678:topic:42", // optional: route to a specific topic/thread
          accountId: "ops-bot",
        },
      },
    ],
  },
  channels: {
    telegram: {
      accounts: {
        "ops-bot": { botToken: "YOUR_TELEGRAM_BOT_TOKEN" },
      },
    },
  },
}
```

### 필드 참고 사항

- `every`: heartbeat 간격(기간 문자열; 기본 단위 = 분).
- `model`: heartbeat 실행을 위한 선택적 모델 재정의 (`provider/model`).
- `includeReasoning`: 활성화되면, 사용 가능한 경우 별도의 `Reasoning:` 메시지도 전달합니다(`/reasoning on`과 같은 형태).
- `lightContext`: true이면, heartbeat 실행이 경량 부트스트랩 컨텍스트를 사용하고 워크스페이스 부트스트랩 파일에서 `HEARTBEAT.md`만 유지합니다.
- `isolatedSession`: true이면, 각 heartbeat가 이전 대화 히스토리 없이 새로운 세션에서 실행됩니다. cron `sessionTarget: "isolated"`와 동일한 격리 패턴을 사용합니다. Heartbeat당 토큰 비용을 극적으로 줄입니다. 최대 절감을 위해 `lightContext: true`와 결합하십시오. 전달 라우팅은 여전히 메인 세션 컨텍스트를 사용합니다.
- `session`: heartbeat 실행을 위한 선택적 세션 키.
  - `main`(기본값): 에이전트 메인 세션.
  - 명시적 세션 키(`openclaw sessions --json` 또는 [sessions CLI](/cli/sessions)에서 복사).
  - 세션 키 형식: [Sessions](/concepts/session) 및 [Groups](/channels/groups) 참조.
- `target`:
  - `last`: 마지막으로 사용된 외부 채널로 전달합니다.
  - 명시적 채널: 구성된 채널 또는 플러그인 id(예: `discord`, `matrix`, `telegram`, `whatsapp`).
  - `none`(기본값): heartbeat를 실행하지만 외부로 **전달하지 않습니다**.
- `directPolicy`: 다이렉트/DM 전달 동작을 제어합니다:
  - `allow`(기본값): 다이렉트/DM heartbeat 전달 허용.
  - `block`: 다이렉트/DM 전달 억제 (`reason=dm-blocked`).
- `to`: 선택적 수신자 재정의(채널별 id, 예: WhatsApp의 E.164 또는 Telegram 채팅 id). Telegram 토픽/스레드의 경우, `<chatId>:topic:<messageThreadId>`를 사용하십시오.
- `accountId`: 다중 계정 채널을 위한 선택적 계정 id. `target: "last"`인 경우, 계정 id는 계정을 지원한다면 해결된 마지막 채널에 적용됩니다; 그렇지 않으면 무시됩니다. 계정 id가 해결된 채널에 대해 구성된 계정과 일치하지 않으면, 전달이 건너뛰어집니다.
- `prompt`: 기본 프롬프트 본문을 재정의합니다(병합되지 않음).
- `ackMaxChars`: 전달 전 `HEARTBEAT_OK` 뒤에 허용되는 최대 문자 수.
- `suppressToolErrorWarnings`: true이면, heartbeat 실행 중 툴 오류 경고 페이로드를 억제합니다.
- `activeHours`: heartbeat 실행을 시간 창으로 제한합니다. `start`(HH:MM, 포함; 하루 시작의 경우 `00:00` 사용), `end`(HH:MM 미포함; 하루 끝에 `24:00` 허용), 선택적 `timezone`을 포함한 객체.
  - 생략되거나 `"user"`: 설정된 경우 `agents.defaults.userTimezone`을 사용하고, 그렇지 않으면 호스트 시스템 타임존으로 폴백합니다.
  - `"local"`: 항상 호스트 시스템 타임존을 사용합니다.
  - 모든 IANA 식별자(예: `America/New_York`): 직접 사용됩니다; 유효하지 않으면 위의 `"user"` 동작으로 폴백됩니다.
  - 활성 창에는 `start`와 `end`가 같으면 안 됩니다; 동일한 값은 너비가 0(항상 창 외부)으로 처리됩니다.
  - 활성 창 외부에서는 창 안의 다음 틱까지 heartbeat가 건너뛰어집니다.

## 전달 동작

- Heartbeat는 기본적으로 에이전트의 메인 세션(`agent:<id>:<mainKey>`)에서 실행되거나, `session.scope = "global"`인 경우 `global`에서 실행됩니다. 특정 채널 세션(Discord/WhatsApp 등)으로 재정의하려면 `session`을 설정하십시오.
- `session`은 실행 컨텍스트에만 영향을 미칩니다; 전달은 `target`과 `to`에 의해 제어됩니다.
- 특정 채널/수신자에게 전달하려면, `target` + `to`를 설정하십시오. `target: "last"`인 경우, 전달은 해당 세션의 마지막 외부 채널을 사용합니다.
- Heartbeat 전달은 기본적으로 다이렉트/DM 대상을 허용합니다. Heartbeat 턴은 계속 실행하면서 다이렉트 대상 전송을 억제하려면 `directPolicy: "block"`을 설정하십시오.
- 메인 큐가 바쁘면, heartbeat가 건너뛰어지고 나중에 재시도됩니다.
- `target`이 외부 대상으로 해결되지 않으면, 실행은 여전히 발생하지만 아웃바운드 메시지는 전송되지 않습니다.
- `showOk`, `showAlerts`, `useIndicator`가 모두 비활성화되면, 실행은 `reason=alerts-disabled`로 미리 건너뛰어집니다.
- 알림 전달만 비활성화된 경우, OpenClaw는 여전히 heartbeat를 실행하고, 기한이 된 작업의 타임스탬프를 업데이트하고, 세션 idle 타임스탬프를 복원하고, 외부 알림 페이로드를 억제할 수 있습니다.
- 해결된 heartbeat 대상이 typing을 지원하면, OpenClaw는 heartbeat 실행이 활성인 동안 typing을 표시합니다. 이는 heartbeat가 채팅 출력을 전송할 동일한 대상을 사용하며, `typingMode: "never"`로 비활성화됩니다.
- Heartbeat 전용 응답은 세션을 살아있게 **유지하지 않습니다**; 마지막 `updatedAt`이 복원되어 idle 만료가 정상적으로 동작합니다.
- 분리된 [백그라운드 작업](/automation/tasks)은 메인 세션이 무언가를 빠르게 알아차려야 할 때 시스템 이벤트를 큐에 넣고 heartbeat를 깨울 수 있습니다. 이 깨우기는 heartbeat 실행을 백그라운드 작업으로 만들지 않습니다.

## 가시성 제어

기본적으로, 알림 내용이 전달되는 동안 `HEARTBEAT_OK` 확인(ack)은 억제됩니다. 채널별 또는 계정별로 조정할 수 있습니다:

```yaml
channels:
  defaults:
    heartbeat:
      showOk: false # Hide HEARTBEAT_OK (default)
      showAlerts: true # Show alert messages (default)
      useIndicator: true # Emit indicator events (default)
  telegram:
    heartbeat:
      showOk: true # Show OK acknowledgments on Telegram
  whatsapp:
    accounts:
      work:
        heartbeat:
          showAlerts: false # Suppress alert delivery for this account
```

우선순위: 계정별 → 채널별 → 채널 기본값 → 내장 기본값.

### 각 플래그의 역할

- `showOk`: 모델이 OK 전용 응답을 반환할 때 `HEARTBEAT_OK` 확인(ack)을 전송합니다.
- `showAlerts`: 모델이 OK가 아닌 응답을 반환할 때 알림 내용을 전송합니다.
- `useIndicator`: UI 상태 표면을 위한 인디케이터 이벤트를 발생시킵니다.

**셋 모두** false이면, OpenClaw는 heartbeat 실행을 완전히 건너뜁니다(모델 호출 없음).

### 채널별 vs 계정별 예제

```yaml
channels:
  defaults:
    heartbeat:
      showOk: false
      showAlerts: true
      useIndicator: true
  slack:
    heartbeat:
      showOk: true # all Slack accounts
    accounts:
      ops:
        heartbeat:
          showAlerts: false # suppress alerts for the ops account only
  telegram:
    heartbeat:
      showOk: true
```

### 일반적인 패턴

| 목표                                     | 구성                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| 기본 동작 (조용한 OK, 알림 켜짐)         | _(구성 불필요)_                                                                          |
| 완전 조용함 (메시지 없음, 인디케이터 없음) | `channels.defaults.heartbeat: { showOk: false, showAlerts: false, useIndicator: false }` |
| 인디케이터만 (메시지 없음)               | `channels.defaults.heartbeat: { showOk: false, showAlerts: false, useIndicator: true }`  |
| 한 채널에서만 OK                         | `channels.telegram.heartbeat: { showOk: true }`                                          |

## HEARTBEAT.md (선택 사항)

워크스페이스에 `HEARTBEAT.md` 파일이 있으면, 기본 프롬프트는 에이전트에게 그것을 읽으라고 지시합니다. "Heartbeat 체크리스트"로 생각하십시오: 작고, 안정적이며, 30분마다 포함해도 안전합니다.

일반 실행에서는, 기본 에이전트에 대해 heartbeat 안내가 활성화된 경우에만 `HEARTBEAT.md`가 주입됩니다. `0m`으로 heartbeat 주기를 비활성화하거나 `includeSystemPromptSection: false`를 설정하면 일반 부트스트랩 컨텍스트에서 생략됩니다.

`HEARTBEAT.md`가 존재하지만 사실상 비어 있으면(빈 줄과 `# Heading` 같은 마크다운 헤더만), OpenClaw는 API 호출을 절약하기 위해 heartbeat 실행을 건너뜁니다. 그 건너뜀은 `reason=empty-heartbeat-file`로 보고됩니다. 파일이 없으면, heartbeat는 여전히 실행되고 모델이 무엇을 할지 결정합니다.

프롬프트 비대화를 피하기 위해 작게 유지하십시오(짧은 체크리스트나 알림).

예제 `HEARTBEAT.md`:

```md
# Heartbeat checklist

- Quick scan: anything urgent in inboxes?
- If it's daytime, do a lightweight check-in if nothing else is pending.
- If a task is blocked, write down _what is missing_ and ask Peter next time.
```

### `tasks:` 블록

`HEARTBEAT.md`는 heartbeat 자체 내에서 간격 기반 확인을 위한 작은 구조화된 `tasks:` 블록도 지원합니다.

예제:

```md
tasks:

- name: inbox-triage
  interval: 30m
  prompt: "Check for urgent unread emails and flag anything time sensitive."
- name: calendar-scan
  interval: 2h
  prompt: "Check for upcoming meetings that need prep or follow-up."

# Additional instructions

- Keep alerts short.
- If nothing needs attention after all due tasks, reply HEARTBEAT_OK.
```

동작:

- OpenClaw는 `tasks:` 블록을 파싱하고 각 작업을 자체 `interval`에 대해 확인합니다.
- 해당 틱의 heartbeat 프롬프트에는 **기한이 된** 작업만 포함됩니다.
- 기한이 된 작업이 없으면, 낭비되는 모델 호출을 피하기 위해 heartbeat가 완전히 건너뛰어집니다 (`reason=no-tasks-due`).
- `HEARTBEAT.md`의 작업이 아닌 내용은 보존되며 기한이 된 작업 목록 뒤에 추가 컨텍스트로 첨부됩니다.
- 작업의 마지막 실행 타임스탬프는 세션 상태(`heartbeatTaskState`)에 저장되므로, 일반 재시작에도 간격이 유지됩니다.
- 작업 타임스탬프는 heartbeat 실행이 정상적인 응답 경로를 완료한 후에만 진행됩니다. 건너뛴 `empty-heartbeat-file` / `no-tasks-due` 실행은 작업을 완료로 표시하지 않습니다.

매 틱마다 모든 작업에 대해 비용을 지불하지 않고 하나의 heartbeat 파일에 여러 주기적 확인을 담고 싶을 때 task 모드가 유용합니다.

### 에이전트가 HEARTBEAT.md를 업데이트할 수 있나요?

네 — 요청하면 됩니다.

`HEARTBEAT.md`는 에이전트 워크스페이스의 일반 파일일 뿐이므로, 일반 채팅에서 에이전트에게 다음과 같이 말할 수 있습니다:

- "`HEARTBEAT.md`를 업데이트하여 일일 캘린더 확인을 추가해."
- "`HEARTBEAT.md`를 짧게 다시 작성하고 인박스 후속 조치에 집중해."

이것이 사전에 발생하길 원한다면, heartbeat 프롬프트에 다음과 같은 명시적 줄을 포함할 수도 있습니다: "체크리스트가 오래되면, 더 나은 것으로 HEARTBEAT.md를 업데이트하라."

안전 참고: `HEARTBEAT.md`에 시크릿(API 키, 전화번호, 개인 토큰)을 넣지 마십시오 — 프롬프트 컨텍스트의 일부가 됩니다.

## 수동 깨우기 (온디맨드)

다음으로 시스템 이벤트를 큐에 넣고 즉시 heartbeat를 트리거할 수 있습니다:

```bash
openclaw system event --text "Check for urgent follow-ups" --mode now
```

여러 에이전트가 `heartbeat`를 구성한 경우, 수동 깨우기는 해당 에이전트 heartbeat 각각을 즉시 실행합니다.

다음 예정된 틱을 기다리려면 `--mode next-heartbeat`를 사용하십시오.

## Reasoning 전달 (선택 사항)

기본적으로, heartbeat는 최종 "답변" 페이로드만 전달합니다.

투명성을 원한다면, 활성화하십시오:

- `agents.defaults.heartbeat.includeReasoning: true`

활성화되면, heartbeat는 `Reasoning:`으로 접두사가 붙은 별도의 메시지(`/reasoning on`과 같은 형태)도 전달합니다. 에이전트가 여러 세션/codex를 관리 중이고 왜 당신에게 핑했는지 보고 싶을 때 유용할 수 있습니다 — 하지만 원하는 것보다 더 많은 내부 세부 정보를 유출할 수도 있습니다. 그룹 채팅에서는 꺼두는 것을 선호하십시오.

## 비용 인식

Heartbeat는 전체 에이전트 턴을 실행합니다. 짧은 간격은 더 많은 토큰을 소모합니다. 비용을 줄이려면:

- 전체 대화 히스토리를 보내지 않기 위해 `isolatedSession: true`를 사용하십시오(~100K 토큰에서 실행당 ~2-5K로 감소).
- 부트스트랩 파일을 `HEARTBEAT.md`로만 제한하기 위해 `lightContext: true`를 사용하십시오.
- 더 저렴한 `model`을 설정하십시오(예: `ollama/llama3.2:1b`).
- `HEARTBEAT.md`를 작게 유지하십시오.
- 내부 상태 업데이트만 원한다면 `target: "none"`을 사용하십시오.

## 관련 문서

- [자동화 & 작업](/automation/) — 한눈에 보는 모든 자동화 메커니즘
- [백그라운드 작업](/automation/tasks) — 분리된 작업이 추적되는 방법
- [타임존](/concepts/timezone) — 타임존이 heartbeat 스케줄링에 미치는 영향
- [문제 해결](/automation/cron-jobs#troubleshooting) — 자동화 문제 디버깅
