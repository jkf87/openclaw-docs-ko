---
summary: "하트비트 폴링 메시지 및 알림 규칙"
read_when:
  - 하트비트 주기 또는 메시징 조정 시
  - 예약 작업에 하트비트와 cron 중 선택 시
title: "하트비트"
---

# 하트비트 (게이트웨이)

> **하트비트 vs Cron?** 각각을 언제 사용할지에 대한 가이드는 [자동화 및 작업](/automation)을 참조하십시오.

하트비트는 메인 세션에서 **주기적인 에이전트 턴**을 실행하여 모델이 스팸 없이 주의가 필요한 것을 표면화할 수 있습니다.

하트비트는 예약된 메인 세션 턴입니다 — [백그라운드 작업](/automation/tasks) 레코드를 생성하지 **않습니다**.
작업 레코드는 분리된 작업(ACP 실행, 서브에이전트, 격리된 cron 작업)을 위한 것입니다.

문제 해결: [예약 작업](/automation/cron-jobs#troubleshooting)

## 빠른 시작 (초보자)

1. 하트비트를 활성화된 상태로 두거나(기본값은 `30m`, Anthropic OAuth/토큰 인증(Claude CLI 재사용 포함)의 경우 `1h`) 자신의 주기를 설정합니다.
2. 에이전트 워크스페이스에 작은 `HEARTBEAT.md` 체크리스트 또는 `tasks:` 블록을 생성합니다(선택 사항이지만 권장).
3. 하트비트 메시지가 어디로 가야 하는지 결정합니다(`target: "none"`이 기본값; 마지막 연락처로 라우팅하려면 `target: "last"` 설정).
4. 선택 사항: 투명성을 위해 하트비트 추론 전달을 활성화합니다.
5. 선택 사항: 하트비트 실행에 `HEARTBEAT.md`만 필요한 경우 경량 부트스트랩 컨텍스트를 사용합니다.
6. 선택 사항: 격리된 세션을 활성화하여 각 하트비트마다 전체 대화 기록을 전송하지 않습니다.
7. 선택 사항: 활성 시간(로컬 시간)으로 하트비트를 제한합니다.

예제 구성:

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last", // 마지막 연락처에 명시적 전달 (기본값은 "none")
        directPolicy: "allow", // 기본값: 직접/DM 대상 허용; "block"으로 억제
        lightContext: true, // 선택 사항: 부트스트랩 파일에서 HEARTBEAT.md만 주입
        isolatedSession: true, // 선택 사항: 실행마다 새 세션 (대화 기록 없음)
        // activeHours: { start: "08:00", end: "24:00" },
        // includeReasoning: true, // 선택 사항: 별도 `Reasoning:` 메시지도 전송
      },
    },
  },
}
```

## 기본값

- 간격: `30m` (Anthropic OAuth/토큰 인증이 감지된 인증 모드인 경우 `1h`, Claude CLI 재사용 포함). `agents.defaults.heartbeat.every` 또는 에이전트별 `agents.list[].heartbeat.every`를 설정합니다; 비활성화하려면 `0m` 사용.
- 프롬프트 본문(`agents.defaults.heartbeat.prompt`을 통해 구성 가능):
  `Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.`
- 하트비트 프롬프트는 사용자 메시지로 **그대로** 전송됩니다. 시스템 프롬프트에는 기본 에이전트에 대해 하트비트가 활성화된 경우에만 "하트비트" 섹션이 포함되며, 실행은 내부적으로 플래그가 지정됩니다.
- `0m`으로 하트비트가 비활성화되면, 일반 실행도 부트스트랩 컨텍스트에서 `HEARTBEAT.md`를 생략하므로 모델이 하트비트 전용 지침을 보지 않습니다.

## 하트비트 프롬프트의 용도

기본 프롬프트는 의도적으로 광범위합니다:

- **백그라운드 작업**: "미결 작업 고려"는 에이전트가 후속 조치(받은 편지함, 캘린더, 알림, 대기 중인 작업)를 검토하고 긴급한 것을 표면화하도록 유도합니다.
- **인간 체크인**: "낮 시간에 인간을 가끔 체크하기"는 가끔씩 가벼운 "필요한 것이 있나요?" 메시지를 유도하지만, 구성된 로컬 타임존을 사용하여 야간 스팸을 피합니다([/concepts/timezone](/concepts/timezone) 참조).

하트비트는 완료된 [백그라운드 작업](/automation/tasks)에 반응할 수 있지만, 하트비트 실행 자체는 작업 레코드를 생성하지 않습니다.

## 응답 계약

- 주의가 필요한 것이 없으면 **`HEARTBEAT_OK`**로 응답합니다.
- 하트비트 실행 중에 OpenClaw는 응답의 **시작 또는 끝**에 `HEARTBEAT_OK`가 나타날 때 이를 ack로 처리합니다. 토큰이 제거되고 나머지 콘텐츠가 **≤ `ackMaxChars`** (기본값: 300)인 경우 응답이 삭제됩니다.
- `HEARTBEAT_OK`가 응답 **중간**에 나타나면 특별히 처리되지 않습니다.
- 경보의 경우 `HEARTBEAT_OK`를 **포함하지 마십시오**; 경보 텍스트만 반환합니다.

## 구성

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m", // 기본값: 30m (0m은 비활성화)
        model: "anthropic/claude-opus-4-6",
        includeReasoning: false, // 기본값: false
        lightContext: false, // 기본값: false; true는 워크스페이스 부트스트랩 파일에서 HEARTBEAT.md만 유지
        isolatedSession: false, // 기본값: false; true는 새 세션에서 실행
        target: "last", // 기본값: none | 옵션: last | none | <채널 id>
        to: "+15551234567", // 선택적 채널별 재정의
        accountId: "ops-bot", // 선택적 멀티 계정 채널 id
        prompt: "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.",
        ackMaxChars: 300, // HEARTBEAT_OK 이후 허용되는 최대 문자 수
      },
    },
  },
}
```

### 범위 및 우선순위

- `agents.defaults.heartbeat`은 전역 하트비트 동작을 설정합니다.
- `agents.list[].heartbeat`은 위에 병합됩니다; 에이전트에 `heartbeat` 블록이 있으면 **해당 에이전트만** 하트비트를 실행합니다.
- `channels.defaults.heartbeat`은 모든 채널의 가시성 기본값을 설정합니다.
- `channels.<channel>.heartbeat`은 채널 기본값을 재정의합니다.
- `channels.<channel>.accounts.<id>.heartbeat` (멀티 계정 채널)은 채널별 설정을 재정의합니다.

### 에이전트별 하트비트

`agents.list[]` 항목에 `heartbeat` 블록이 포함된 경우, **해당 에이전트만** 하트비트를 실행합니다. 에이전트별 블록은 `agents.defaults.heartbeat` 위에 병합됩니다.

예제: 두 에이전트, 두 번째 에이전트만 하트비트를 실행합니다.

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last",
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
          prompt: "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.",
        },
      },
    ],
  },
}
```

### 활성 시간 예제

특정 타임존에서 업무 시간으로 하트비트를 제한합니다:

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last",
        activeHours: {
          start: "09:00",
          end: "22:00",
          timezone: "America/New_York", // 선택 사항; 설정된 경우 userTimezone 사용
        },
      },
    },
  },
}
```

이 창 외부(동부 시간 오전 9시 이전 또는 오후 10시 이후)에는 하트비트가 건너뜁니다.

### 24/7 설정

하트비트가 종일 실행되도록 하려면:

- `activeHours`를 완전히 생략합니다(시간 창 제한 없음; 기본 동작).
- 전체 하루 창 설정: `activeHours: { start: "00:00", end: "24:00" }`.

같은 `start`와 `end` 시간을 설정하지 마십시오. 이는 너비가 0인 창으로 처리되어 하트비트가 항상 건너뜁니다.

### 멀티 계정 예제

Telegram과 같은 멀티 계정 채널에서 특정 계정을 대상으로 하려면 `accountId`를 사용합니다:

```json5
{
  agents: {
    list: [
      {
        id: "ops",
        heartbeat: {
          every: "1h",
          target: "telegram",
          to: "12345678:topic:42",
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

- `every`: 하트비트 간격 (기간 문자열; 기본 단위 = 분).
- `model`: 하트비트 실행을 위한 선택적 모델 재정의 (`provider/model`).
- `includeReasoning`: 활성화 시 별도의 `Reasoning:` 메시지도 전달합니다.
- `lightContext`: true이면 하트비트 실행에 워크스페이스 부트스트랩 파일에서 `HEARTBEAT.md`만 포함합니다.
- `isolatedSession`: true이면 각 하트비트가 이전 대화 기록 없이 새 세션에서 실행됩니다.
- `target`:
  - `last`: 마지막 사용된 외부 채널에 전달.
  - 명시적 채널: 구성된 채널 또는 플러그인 id.
  - `none` (기본값): 하트비트를 실행하지만 외부에 전달하지 **않음**.
- `directPolicy`:
  - `allow` (기본값): 직접/DM 하트비트 전달 허용.
  - `block`: 직접/DM 전달 억제 (`reason=dm-blocked`).
- `to`: 선택적 수신자 재정의.
- `accountId`: 멀티 계정 채널을 위한 선택적 계정 id.
- `prompt`: 기본 프롬프트 본문을 재정의합니다.
- `ackMaxChars`: 전달 전 `HEARTBEAT_OK` 이후 허용되는 최대 문자 수.
- `activeHours`: 하트비트 실행을 시간 창으로 제한합니다.

## 전달 동작

- 하트비트는 기본적으로 에이전트의 메인 세션(`agent:<id>:<mainKey>`)에서 실행됩니다.
- `session`은 실행 컨텍스트에만 영향을 미칩니다; 전달은 `target`과 `to`로 제어됩니다.
- 메인 큐가 바쁘면 하트비트는 건너뛰고 나중에 재시도합니다.
- `showOk`, `showAlerts`, `useIndicator`가 모두 비활성화되면 실행은 `reason=alerts-disabled`로 앞에서 건너뜁니다.

## 가시성 제어

기본적으로 `HEARTBEAT_OK` 확인은 억제되고 경보 콘텐츠는 전달됩니다. 채널 또는 계정별로 조정할 수 있습니다:

```yaml
channels:
  defaults:
    heartbeat:
      showOk: false # HEARTBEAT_OK 숨기기 (기본값)
      showAlerts: true # 경보 메시지 표시 (기본값)
      useIndicator: true # 인디케이터 이벤트 내보내기 (기본값)
  telegram:
    heartbeat:
      showOk: true # Telegram에서 OK 확인 표시
  whatsapp:
    accounts:
      work:
        heartbeat:
          showAlerts: false # 이 계정에 대한 경보 전달 억제
```

우선순위: 계정별 → 채널별 → 채널 기본값 → 내장 기본값.

### 각 플래그의 역할

- `showOk`: 모델이 OK 전용 응답을 반환할 때 `HEARTBEAT_OK` 확인을 전송합니다.
- `showAlerts`: 모델이 비 OK 응답을 반환할 때 경보 콘텐츠를 전송합니다.
- `useIndicator`: UI 상태 표면을 위한 인디케이터 이벤트를 내보냅니다.

**세 가지 모두** false이면 OpenClaw는 하트비트 실행을 완전히 건너뜁니다 (모델 호출 없음).

### 일반적인 패턴

| 목표 | 구성 |
| ---- | ---- |
| 기본 동작 (무음 OK, 경보 켜짐) | _(구성 불필요)_ |
| 완전 무음 (메시지 없음, 인디케이터 없음) | `channels.defaults.heartbeat: { showOk: false, showAlerts: false, useIndicator: false }` |
| 인디케이터 전용 (메시지 없음) | `channels.defaults.heartbeat: { showOk: false, showAlerts: false, useIndicator: true }` |
| 한 채널에서만 OK | `channels.telegram.heartbeat: { showOk: true }` |

## HEARTBEAT.md (선택 사항)

워크스페이스에 `HEARTBEAT.md` 파일이 있으면 기본 프롬프트는 에이전트에게 이를 읽도록 지시합니다. "하트비트 체크리스트"로 생각하십시오: 작고, 안정적이며, 30분마다 포함하기에 안전합니다.

`HEARTBEAT.md`가 존재하지만 실질적으로 비어 있으면 (공백 줄과 마크다운 헤더만), OpenClaw는 API 호출을 절약하기 위해 하트비트 실행을 건너뜁니다. 그 건너뜀은 `reason=empty-heartbeat-file`로 보고됩니다.

작게 유지하십시오 (짧은 체크리스트 또는 알림) 프롬프트 비대화를 피하기 위해.

예제 `HEARTBEAT.md`:

```md
# Heartbeat checklist

- Quick scan: anything urgent in inboxes?
- If it's daytime, do a lightweight check-in if nothing else is pending.
- If a task is blocked, write down _what is missing_ and ask Peter next time.
```

### `tasks:` 블록

`HEARTBEAT.md`는 하트비트 자체 내에서 간격 기반 체크를 위한 작은 구조화된 `tasks:` 블록도 지원합니다.

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

- OpenClaw는 `tasks:` 블록을 파싱하고 각 작업을 자체 `interval`에 대해 체크합니다.
- **기한이 된** 작업만 해당 틱의 하트비트 프롬프트에 포함됩니다.
- 기한이 된 작업이 없으면 하트비트를 완전히 건너뜁니다 (`reason=no-tasks-due`).
- 작업 마지막 실행 타임스탬프는 세션 상태(`heartbeatTaskState`)에 저장되므로 간격은 일반 재시작 후에도 유지됩니다.

## 수동 깨우기 (온디맨드)

시스템 이벤트를 대기열에 추가하고 즉각적인 하트비트를 트리거할 수 있습니다:

```bash
openclaw system event --text "Check for urgent follow-ups" --mode now
```

`--mode next-heartbeat`를 사용하면 다음 예약된 틱을 기다립니다.

## 추론 전달 (선택 사항)

기본적으로 하트비트는 최종 "답변" 페이로드만 전달합니다.

투명성을 원하면 활성화합니다:

- `agents.defaults.heartbeat.includeReasoning: true`

활성화되면 하트비트는 `Reasoning:` 접두사가 붙은 별도의 메시지도 전달합니다. 그룹 채팅에서는 비활성화 상태로 유지하는 것이 좋습니다.

## 비용 인식

하트비트는 전체 에이전트 턴을 실행합니다. 짧은 간격은 더 많은 토큰을 소비합니다. 비용을 줄이려면:

- 전체 대화 기록 전송을 피하기 위해 `isolatedSession: true`를 사용합니다.
- 부트스트랩 파일을 `HEARTBEAT.md`만으로 제한하기 위해 `lightContext: true`를 사용합니다.
- 더 저렴한 `model`을 설정합니다 (예: `ollama/llama3.2:1b`).
- `HEARTBEAT.md`를 작게 유지합니다.
- 내부 상태 업데이트만 원하는 경우 `target: "none"`을 사용합니다.

## 관련 항목

- [자동화 및 작업](/automation) — 한눈에 보는 모든 자동화 메커니즘
- [백그라운드 작업](/automation/tasks) — 분리된 작업 추적 방법
- [타임존](/concepts/timezone) — 타임존이 하트비트 스케줄링에 미치는 영향
- [문제 해결](/automation/cron-jobs#troubleshooting) — 자동화 문제 디버깅
