---
summary: "`openclaw system`에 대한 CLI 참조 (시스템 이벤트, 하트비트, 프레즌스)"
read_when:
  - 크론 작업을 생성하지 않고 시스템 이벤트를 큐에 넣으려는 경우
  - 하트비트를 활성화하거나 비활성화해야 하는 경우
  - 시스템 프레즌스 항목을 검사하려는 경우
title: "system"
---

# `openclaw system`

Gateway를 위한 시스템 수준 도우미: 시스템 이벤트 큐에 추가, 하트비트 제어,
프레즌스 보기.

모든 `system` 하위 명령은 Gateway RPC를 사용하고 공유 클라이언트 플래그를 허용합니다:

- `--url <url>`
- `--token <token>`
- `--timeout <ms>`
- `--expect-final`

## 일반 명령

```bash
openclaw system event --text "Check for urgent follow-ups" --mode now
openclaw system event --text "Check for urgent follow-ups" --url ws://127.0.0.1:18789 --token "$OPENCLAW_GATEWAY_TOKEN"
openclaw system heartbeat enable
openclaw system heartbeat last
openclaw system presence
```

## `system event`

**main** 세션에 시스템 이벤트를 큐에 추가합니다. 다음 하트비트가 이를 프롬프트에서
`System:` 줄로 주입합니다. 즉시 하트비트를 트리거하려면 `--mode now`를 사용하세요;
`next-heartbeat`는 다음 예약된 틱을 기다립니다.

플래그:

- `--text <text>`: 필수 시스템 이벤트 텍스트.
- `--mode <mode>`: `now` 또는 `next-heartbeat` (기본값).
- `--json`: 기계 판독 가능한 출력.
- `--url`, `--token`, `--timeout`, `--expect-final`: 공유 Gateway RPC 플래그.

## `system heartbeat last|enable|disable`

하트비트 제어:

- `last`: 마지막 하트비트 이벤트 표시.
- `enable`: 하트비트 다시 켜기 (비활성화된 경우 사용).
- `disable`: 하트비트 일시 중지.

플래그:

- `--json`: 기계 판독 가능한 출력.
- `--url`, `--token`, `--timeout`, `--expect-final`: 공유 Gateway RPC 플래그.

## `system presence`

Gateway가 알고 있는 현재 시스템 프레즌스 항목을 나열합니다 (노드, 인스턴스, 유사한 상태 라인).

플래그:

- `--json`: 기계 판독 가능한 출력.
- `--url`, `--token`, `--timeout`, `--expect-final`: 공유 Gateway RPC 플래그.

## 참고사항

- 현재 구성(로컬 또는 원격)에서 도달 가능한 실행 중인 Gateway가 필요합니다.
- 시스템 이벤트는 임시이며 재시작 시 유지되지 않습니다.
