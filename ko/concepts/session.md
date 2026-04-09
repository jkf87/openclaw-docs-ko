---
summary: "OpenClaw가 대화 세션을 관리하는 방법"
read_when:
  - 세션 라우팅 및 격리를 이해하려는 경우
  - 멀티 사용자 설정을 위한 DM 범위를 구성하려는 경우
title: "세션 관리"
---

# 세션 관리

OpenClaw는 대화를 **세션**으로 구성합니다. 각 메시지는 어디서 왔는지에 따라 세션으로 라우팅됩니다 -- DM, 그룹 채팅, cron 작업 등.

## 메시지 라우팅 방법

| 소스              | 동작                       |
| ----------------- | -------------------------- |
| 직접 메시지       | 기본적으로 공유 세션       |
| 그룹 채팅         | 그룹별 격리                |
| 룸/채널           | 룸별 격리                  |
| Cron 작업         | 실행별 새 세션             |
| 웹훅              | 훅별 격리                  |

## DM 격리

기본적으로 모든 DM은 연속성을 위해 하나의 세션을 공유합니다. 이는 단일 사용자 설정에 적합합니다.

<Warning>
여러 사람이 에이전트에게 메시지를 보낼 수 있는 경우, DM 격리를 활성화하십시오. 이 없이는 모든 사용자가 동일한 대화 컨텍스트를 공유합니다 -- Alice의 개인 메시지가 Bob에게 표시됩니다.
</Warning>

**해결 방법:**

```json5
{
  session: {
    dmScope: "per-channel-peer", // 채널 + 발신자별 격리
  },
}
```

기타 옵션:

- `main` (기본값) -- 모든 DM이 하나의 세션을 공유합니다.
- `per-peer` -- 발신자별 격리 (채널 간).
- `per-channel-peer` -- 채널 + 발신자별 격리 (권장).
- `per-account-channel-peer` -- 계정 + 채널 + 발신자별 격리.

<Tip>
동일한 사람이 여러 채널에서 연락하는 경우, `session.identityLinks`를 사용하여 자격을 연결하면 하나의 세션을 공유합니다.
</Tip>

`openclaw security audit`으로 설정을 확인하십시오.

## 세션 라이프사이클

세션은 만료될 때까지 재사용됩니다:

- **일별 재설정** (기본값) -- 게이트웨이 호스트의 로컬 시간 오전 4:00에 새 세션.
- **유휴 재설정** (선택적) -- 비활성 기간 후 새 세션. `session.reset.idleMinutes` 설정.
- **수동 재설정** -- 채팅에서 `/new` 또는 `/reset` 입력. `/new <model>`은 모델도 전환합니다.

일별 및 유휴 재설정 모두 구성된 경우, 먼저 만료되는 것이 우선합니다.

## 상태가 있는 위치

모든 세션 상태는 **게이트웨이**가 소유합니다. UI 클라이언트는 게이트웨이에 세션 데이터를 쿼리합니다.

- **저장소:** `~/.openclaw/agents/<agentId>/sessions/sessions.json`
- **트랜스크립트:** `~/.openclaw/agents/<agentId>/sessions/<sessionId>.jsonl`

## 세션 유지 관리

OpenClaw는 시간이 지남에 따라 세션 저장소를 자동으로 제한합니다. 기본적으로 `warn` 모드로 실행됩니다 (정리될 것을 보고). 자동 정리를 위해 `session.maintenance.mode`를 `"enforce"`로 설정하십시오:

```json5
{
  session: {
    maintenance: {
      mode: "enforce",
      pruneAfter: "30d",
      maxEntries: 500,
    },
  },
}
```

`openclaw sessions cleanup --dry-run`으로 미리 볼 수 있습니다.

## 세션 검사

- `openclaw status` -- 세션 저장소 경로 및 최근 활동.
- `openclaw sessions --json` -- 모든 세션 (`--active <minutes>`로 필터링).
- 채팅에서 `/status` -- 컨텍스트 사용량, 모델, 토글.
- 채팅에서 `/context list` -- 시스템 프롬프트에 있는 것.

## 추가 읽기

- [세션 프루닝](/concepts/session-pruning) -- 도구 결과 정리
- [컴팩션](/concepts/compaction) -- 긴 대화 요약
- [세션 도구](/concepts/session-tool) -- 크로스 세션 작업을 위한 에이전트 도구
- [세션 관리 심층 분석](/reference/session-management-compaction) -- 저장소 스키마, 트랜스크립트, 전송 정책, 출처 메타데이터, 고급 구성
- [멀티 에이전트](/concepts/multi-agent) — 에이전트 간 라우팅 및 세션 격리
- [백그라운드 태스크](/automation/tasks) — 분리된 작업이 세션 참조로 태스크 레코드를 생성하는 방법
- [채널 라우팅](/channels/channel-routing) — 인바운드 메시지가 세션으로 라우팅되는 방법
