---
summary: "`openclaw nodes`에 대한 CLI 참조 (status, 페어링, 호출, 카메라/캔버스/화면)"
read_when:
  - 페어링된 노드 (카메라, 화면, 캔버스)를 관리하는 경우
  - 요청을 승인하거나 노드 명령을 호출해야 하는 경우
title: "nodes"
---

# `openclaw nodes`

페어링된 노드 (디바이스)를 관리하고 노드 기능을 호출합니다.

관련:

- 노드 개요: [노드](/nodes/)
- 카메라: [카메라 노드](/nodes/camera)
- 이미지: [이미지 노드](/nodes/images)

공통 옵션:

- `--url`, `--token`, `--timeout`, `--json`

## 일반 명령

```bash
openclaw nodes list
openclaw nodes list --connected
openclaw nodes list --last-connected 24h
openclaw nodes pending
openclaw nodes approve <requestId>
openclaw nodes reject <requestId>
openclaw nodes rename --node <id|name|ip> --name <displayName>
openclaw nodes status
openclaw nodes status --connected
openclaw nodes status --last-connected 24h
```

`nodes list`는 보류/페어링 테이블을 출력합니다. 페어링된 행에는 가장 최근 연결 경과 시간 (Last Connect)이 포함됩니다.
현재 연결된 노드만 표시하려면 `--connected`를 사용하세요. 기간 내에 연결된 노드로 필터링하려면 `--last-connected <duration>`을 사용하세요 (예: `24h`, `7d`).

승인 참고:

- `openclaw nodes pending`은 페어링 범위만 필요합니다.
- `openclaw nodes approve <requestId>`는 보류 중인 요청에서 추가 범위 요구 사항을 상속합니다:
  - 명령 없는 요청: 페어링만
  - exec 이외의 노드 명령: 페어링 + 쓰기
  - `system.run` / `system.run.prepare` / `system.which`: 페어링 + 관리자

## 호출

```bash
openclaw nodes invoke --node <id|name|ip> --command <command> --params <json>
```

호출 플래그:

- `--params <json>`: JSON 객체 문자열 (기본값 `{}`).
- `--invoke-timeout <ms>`: 노드 호출 타임아웃 (기본값 `15000`).
- `--idempotency-key <key>`: 선택적 멱등성 키.
- `system.run` 및 `system.run.prepare`는 여기서 차단됩니다; 셸 실행에는 `host=node`가 있는 `exec` 툴을 사용하세요.

노드에서 셸 실행은 `openclaw nodes run` 대신 `host=node`가 있는 `exec` 툴을 사용하세요.
`nodes` CLI는 이제 기능 중심입니다: `nodes invoke`를 통한 직접 RPC, 그리고 페어링, 카메라, 화면, 위치, 캔버스, 알림.
