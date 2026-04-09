---
summary: "에이전트, 봉투, 프롬프트를 위한 타임존 처리"
read_when:
  - 모델에 대해 타임스탬프가 정규화되는 방법을 이해해야 하는 경우
  - 시스템 프롬프트를 위한 사용자 타임존 구성 시
title: "타임존"
---

# 타임존

OpenClaw는 모델이 **단일 참조 시간**을 볼 수 있도록 타임스탬프를 표준화합니다.

## 메시지 봉투 (기본값: 로컬)

인바운드 메시지는 다음과 같은 봉투로 래핑됩니다:

```
[Provider ... 2026-01-05 16:26 PST] message text
```

봉투의 타임스탬프는 기본적으로 **호스트 로컬**이며, 분 단위 정밀도입니다.

다음으로 오버라이드할 수 있습니다:

```json5
{
  agents: {
    defaults: {
      envelopeTimezone: "local", // "utc" | "local" | "user" | IANA 타임존
      envelopeTimestamp: "on", // "on" | "off"
      envelopeElapsed: "on", // "on" | "off"
    },
  },
}
```

- `envelopeTimezone: "utc"` UTC를 사용합니다.
- `envelopeTimezone: "user"` `agents.defaults.userTimezone`을 사용합니다 (호스트 타임존으로 폴백).
- 고정 오프셋을 위해 명시적 IANA 타임존 (예: `"Europe/Vienna"`)을 사용하십시오.
- `envelopeTimestamp: "off"` 봉투 헤더에서 절대 타임스탬프를 제거합니다.
- `envelopeElapsed: "off"` 경과 시간 접미사 (`+2m` 스타일)를 제거합니다.

### 예시

**로컬 (기본값):**

```
[Signal Alice +1555 2026-01-18 00:19 PST] hello
```

**고정 타임존:**

```
[Signal Alice +1555 2026-01-18 06:19 GMT+1] hello
```

**경과 시간:**

```
[Signal Alice +1555 +2m 2026-01-18T05:19Z] follow-up
```

## 도구 페이로드 (원시 프로바이더 데이터 + 정규화된 필드)

도구 호출 (`channels.discord.readMessages`, `channels.slack.readMessages` 등)은 **원시 프로바이더 타임스탬프**를 반환합니다. 일관성을 위해 정규화된 필드도 첨부합니다:

- `timestampMs` (UTC 에포크 밀리초)
- `timestampUtc` (ISO 8601 UTC 문자열)

원시 프로바이더 필드는 보존됩니다.

## 시스템 프롬프트를 위한 사용자 타임존

`agents.defaults.userTimezone`을 설정하여 모델에게 사용자의 로컬 시간대를 알려주십시오. 설정되지 않으면 OpenClaw는 런타임에 **호스트 타임존**을 해결합니다 (구성 쓰기 없음).

```json5
{
  agents: { defaults: { userTimezone: "America/Chicago" } },
}
```

시스템 프롬프트에는 다음이 포함됩니다:

- 로컬 시간 및 타임존이 있는 `Current Date & Time` 섹션
- `Time format: 12-hour` 또는 `24-hour`

`agents.defaults.timeFormat` (`auto` | `12` | `24`)으로 프롬프트 형식을 제어할 수 있습니다.

전체 동작 및 예시는 [날짜 및 시간](/date-time)을 참조하십시오.

## 관련 항목

- [하트비트](/gateway/heartbeat) — 활성 시간은 스케줄링을 위해 타임존을 사용합니다
- [Cron 작업](/automation/cron-jobs) — cron 표현식은 스케줄링을 위해 타임존을 사용합니다
- [날짜 및 시간](/date-time) — 전체 날짜/시간 동작 및 예시
