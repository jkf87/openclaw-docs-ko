---
summary: "`openclaw tasks`에 대한 CLI 참조 (백그라운드 task 원장 및 Task Flow 상태)"
read_when:
  - 백그라운드 task 레코드를 검사, 감사, 또는 취소하려는 경우
  - `openclaw tasks flow` 아래의 Task Flow 명령을 문서화하는 경우
title: "`openclaw tasks`"
---

내구성 있는 백그라운드 task 및 Task Flow 상태를 검사합니다. 서브커맨드 없이
사용하면 `openclaw tasks`는 `openclaw tasks list`와 동일합니다.

라이프사이클과 전달 모델은 [백그라운드 Tasks](/automation/tasks)를 참조하십시오.

## 사용법

```bash
openclaw tasks
openclaw tasks list
openclaw tasks list --runtime acp
openclaw tasks list --status running
openclaw tasks show <lookup>
openclaw tasks notify <lookup> state_changes
openclaw tasks cancel <lookup>
openclaw tasks audit
openclaw tasks maintenance
openclaw tasks maintenance --apply
openclaw tasks flow list
openclaw tasks flow show <lookup>
openclaw tasks flow cancel <lookup>
```

## 루트 옵션

- `--json`: JSON 출력.
- `--runtime <name>`: 종류로 필터링: `subagent`, `acp`, `cron`, 또는 `cli`.
- `--status <name>`: 상태로 필터링: `queued`, `running`, `succeeded`, `failed`, `timed_out`, `cancelled`, 또는 `lost`.

## 서브커맨드

### `list`

```bash
openclaw tasks list [--runtime <name>] [--status <name>] [--json]
```

추적 중인 백그라운드 task를 최신순으로 나열합니다.

### `show`

```bash
openclaw tasks show <lookup> [--json]
```

task ID, 실행 ID, 또는 세션 키로 단일 task를 표시합니다.

### `notify`

```bash
openclaw tasks notify <lookup> <done_only|state_changes|silent>
```

실행 중인 task의 알림 정책을 변경합니다.

### `cancel`

```bash
openclaw tasks cancel <lookup>
```

실행 중인 백그라운드 task를 취소합니다.

### `audit`

```bash
openclaw tasks audit [--severity <warn|error>] [--code <name>] [--limit <n>] [--json]
```

오래되었거나, 소실되었거나, 전달 실패했거나, 그 외에 일관성 없는 task 및 Task Flow 레코드를 표면화합니다.

### `maintenance`

```bash
openclaw tasks maintenance [--apply] [--json]
```

task 및 Task Flow 정합성 조정, 정리 스탬핑, 가지치기를 미리 보거나 적용합니다.

### `flow`

```bash
openclaw tasks flow list [--status <name>] [--json]
openclaw tasks flow show <lookup> [--json]
openclaw tasks flow cancel <lookup>
```

task 원장 아래의 내구성 있는 Task Flow 상태를 검사하거나 취소합니다.

## 관련 항목

- [CLI 참조](/cli/)
- [백그라운드 tasks](/automation/tasks)
