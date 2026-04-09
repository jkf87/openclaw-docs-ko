---
title: "백그라운드 Exec 및 프로세스 툴"
description: "백그라운드 exec 실행 및 프로세스 관리"
---

# 백그라운드 Exec + 프로세스 툴

OpenClaw는 `exec` 툴을 통해 셸 명령을 실행하고 장기 실행 작업을 메모리에 유지합니다. `process` 툴은 해당 백그라운드 세션을 관리합니다.

## exec 툴

주요 파라미터:

- `command` (필수)
- `yieldMs` (기본값 10000): 이 지연 후 자동으로 백그라운드 전환
- `background` (bool): 즉시 백그라운드 전환
- `timeout` (초, 기본값 1800): 이 타임아웃 후 프로세스 종료
- `elevated` (bool): elevated 모드가 활성화/허용된 경우 샌드박스 외부에서 실행 (기본값은 `gateway`, exec 대상이 `node`인 경우 `node`)
- 실제 TTY가 필요합니까? `pty: true`로 설정하십시오.
- `workdir`, `env`

동작:

- 포그라운드 실행은 출력을 직접 반환합니다.
- 백그라운드로 전환된 경우(명시적 또는 타임아웃), 툴은 `status: "running"` + `sessionId`와 짧은 테일을 반환합니다.
- 출력은 세션이 폴링되거나 지워질 때까지 메모리에 유지됩니다.
- `process` 툴이 허용되지 않으면, `exec`는 동기적으로 실행되고 `yieldMs`/`background`를 무시합니다.
- 생성된 exec 명령은 컨텍스트 인식 셸/프로파일 규칙을 위해 `OPENCLAW_SHELL=exec`를 받습니다.
- 지금 시작하는 장기 실행 작업의 경우, 한 번 시작하고 자동 완료 깨우기가 활성화되어 명령이 출력을 내보내거나 실패할 때 의존하십시오.
- 자동 완료 깨우기를 사용할 수 없거나, 출력 없이 정상 종료된 명령에 대한 조용한 성공 확인이 필요한 경우, `process`를 사용하여 완료를 확인하십시오.
- `sleep` 루프나 반복 폴링으로 미리 알림이나 지연된 후속 작업을 에뮬레이트하지 마십시오; 향후 작업에는 cron을 사용하십시오.

## 자식 프로세스 브리징

exec/process 툴 외부에서 장기 실행 자식 프로세스를 생성하는 경우(예: CLI 재생성 또는 게이트웨이 헬퍼), 자식 프로세스 브리지 헬퍼를 연결하여 종료 신호가 전달되고 종료/오류 시 리스너가 분리되도록 하십시오. 이는 systemd에서 고아 프로세스를 방지하고 플랫폼 간 종료 동작을 일관되게 유지합니다.

환경 변수 재정의:

- `PI_BASH_YIELD_MS`: 기본 양보 (ms)
- `PI_BASH_MAX_OUTPUT_CHARS`: 인메모리 출력 한도 (chars)
- `OPENCLAW_BASH_PENDING_MAX_OUTPUT_CHARS`: 스트림별 보류 중인 stdout/stderr 한도 (chars)
- `PI_BASH_JOB_TTL_MS`: 완료된 세션의 TTL (ms, 1m~3h 제한)

구성 (권장):

- `tools.exec.backgroundMs` (기본값 10000)
- `tools.exec.timeoutSec` (기본값 1800)
- `tools.exec.cleanupMs` (기본값 1800000)
- `tools.exec.notifyOnExit` (기본값 true): 백그라운드 exec가 종료될 때 시스템 이벤트를 큐에 추가하고 하트비트를 요청합니다.
- `tools.exec.notifyOnExitEmptySuccess` (기본값 false): true인 경우, 출력이 없는 성공적인 백그라운드 실행에 대해서도 완료 이벤트를 큐에 추가합니다.

## process 툴

액션:

- `list`: 실행 중 + 완료된 세션
- `poll`: 세션의 새 출력 드레인 (종료 상태도 보고)
- `log`: 집계된 출력 읽기 (`offset` + `limit` 지원)
- `write`: stdin 보내기 (`data`, 선택적 `eof`)
- `send-keys`: PTY 기반 세션에 명시적 키 토큰 또는 바이트 보내기
- `submit`: PTY 기반 세션에 Enter / 캐리지 리턴 보내기
- `paste`: 선택적으로 괄호로 묶인 붙여넣기 모드로 래핑하여 리터럴 텍스트 보내기
- `kill`: 백그라운드 세션 종료
- `clear`: 메모리에서 완료된 세션 제거
- `remove`: 실행 중이면 종료, 완료된 경우 지우기

참고:

- 백그라운드로 전환된 세션만 메모리에 나열/저장됩니다.
- 세션은 프로세스 재시작 시 손실됩니다(디스크 지속성 없음).
- 세션 로그는 `process poll/log`를 실행하고 툴 결과가 기록된 경우에만 채팅 기록에 저장됩니다.
- `process`는 에이전트별로 범위가 지정됩니다; 해당 에이전트가 시작한 세션만 볼 수 있습니다.
- 상태, 로그, 조용한 성공 확인, 또는 자동 완료 깨우기를 사용할 수 없는 경우의 완료 확인을 위해 `poll` / `log`를 사용하십시오.
- 입력이나 개입이 필요한 경우 `write` / `send-keys` / `submit` / `paste` / `kill`을 사용하십시오.
- `process list`는 빠른 스캔을 위해 파생된 `name`(명령 동사 + 대상)을 포함합니다.
- `process log`는 줄 기반 `offset`/`limit`를 사용합니다.
- `offset`과 `limit`가 모두 생략된 경우, 마지막 200줄을 반환하고 페이징 힌트를 포함합니다.
- `offset`이 제공되고 `limit`가 생략된 경우, `offset`부터 끝까지 반환합니다(200으로 제한 없음).
- 폴링은 온디맨드 상태를 위한 것이지, 대기 루프 스케줄링이 아닙니다. 나중에 작업이 발생해야 하는 경우, 대신 cron을 사용하십시오.

## 예시

긴 작업 실행 후 나중에 폴링:

```json
{ "tool": "exec", "command": "sleep 5 && echo done", "yieldMs": 1000 }
```

```json
{ "tool": "process", "action": "poll", "sessionId": "&lt;id&gt;" }
```

즉시 백그라운드에서 시작:

```json
{ "tool": "exec", "command": "npm run build", "background": true }
```

stdin 보내기:

```json
{ "tool": "process", "action": "write", "sessionId": "&lt;id&gt;", "data": "y\n" }
```

PTY 키 보내기:

```json
{ "tool": "process", "action": "send-keys", "sessionId": "&lt;id&gt;", "keys": ["C-c"] }
```

현재 줄 제출:

```json
{ "tool": "process", "action": "submit", "sessionId": "&lt;id&gt;" }
```

리터럴 텍스트 붙여넣기:

```json
{ "tool": "process", "action": "paste", "sessionId": "&lt;id&gt;", "text": "line1\nline2\n" }
```
