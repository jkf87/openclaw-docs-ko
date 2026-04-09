---
summary: "`openclaw cron`에 대한 CLI 참조 (백그라운드 작업 예약 및 실행)"
read_when:
  - 예약된 작업과 웨이크업을 원하는 경우
  - cron 실행 및 로그를 디버깅하는 경우
title: "cron"
---

# `openclaw cron`

Gateway 스케줄러의 cron 작업을 관리합니다.

관련:

- Cron 작업: [Cron 작업](/automation/cron-jobs)

팁: 전체 명령 표면은 `openclaw cron --help`를 실행하세요.

참고: 격리된 `cron add` 작업은 기본적으로 `--announce` 전달을 사용합니다. 출력을 내부적으로 유지하려면 `--no-deliver`를 사용하세요. `--deliver`는 더 이상 사용되지 않는 `--announce`의 별칭으로 유지됩니다.

참고: cron 소유 격리 실행은 일반 텍스트 요약을 기대하며 실행자가 최종 전송 경로를 소유합니다. `--no-deliver`는 실행을 내부적으로 유지하며 에이전트의 메시지 툴에 전달을 다시 넘기지 않습니다.

참고: 일회성 (`--at`) 작업은 기본적으로 성공 후 삭제됩니다. 유지하려면 `--keep-after-run`을 사용하세요.

참고: `--session`은 `main`, `isolated`, `current`, `session:<id>`를 지원합니다. 생성 시 활성 세션에 바인딩하려면 `current`를, 명시적 영구 세션 키를 위해서는 `session:<id>`를 사용하세요.

참고: 일회성 CLI 작업의 경우 오프셋 없는 `--at` 날짜/시간은 `--tz <iana>`도 전달하지 않으면 UTC로 처리됩니다. 후자는 해당 시간대에서 해당 로컬 벽시계 시간을 해석합니다.

참고: 반복 작업은 이제 연속 오류 후 지수 재시도 백오프를 사용합니다 (30s → 1m → 5m → 15m → 60m), 그런 다음 다음 성공적인 실행 후 정상 일정으로 돌아갑니다.

참고: `openclaw cron run`은 이제 수동 실행이 실행을 위해 큐에 추가되는 즉시 반환합니다. 성공적인 응답에는 `{ ok: true, enqueued: true, runId }`가 포함됩니다. `openclaw cron runs --id <job-id>`를 사용하여 최종 결과를 추적하세요.

참고: `openclaw cron run <job-id>`는 기본적으로 강제 실행됩니다. 이전의 "예정된 경우에만 실행" 동작을 유지하려면 `--due`를 사용하세요.

참고: 격리된 cron 턴은 오래된 승인 전용 응답을 억제합니다. 첫 번째 결과가 임시 상태 업데이트에 불과하고 후속 서브에이전트 실행이 최종 답변을 담당하지 않는 경우 cron은 전달 전에 실제 결과를 위해 한 번 더 프롬프트합니다.

참고: 격리된 cron 실행이 자동 토큰 (`NO_REPLY` / `no_reply`)만 반환하면 cron은 직접 발신 전달과 폴백 큐 요약 경로를 모두 억제하므로 채팅에 아무것도 게시되지 않습니다.

참고: `cron add|edit --model ...`은 해당 작업에 선택된 허용 모델을 사용합니다. 모델이 허용되지 않으면 cron은 경고하고 작업의 에이전트/기본 모델 선택으로 폴백합니다. 구성된 폴백 체인은 여전히 적용되지만 명시적인 작업별 폴백 목록 없이 단순 모델 재정의는 더 이상 에이전트 기본을 숨겨진 추가 재시도 대상으로 추가하지 않습니다.

참고: 격리된 cron 모델 우선순위는 Gmail 훅 재정의 우선, 그 다음 작업별 `--model`, 그 다음 저장된 cron 세션 모델 재정의, 그 다음 정상 에이전트/기본 선택입니다.

참고: 격리된 cron 빠른 모드는 확인된 라이브 모델 선택을 따릅니다. 모델 구성 `params.fastMode`는 기본적으로 적용되지만 저장된 세션 `fastMode` 재정의가 여전히 구성보다 우선합니다.

참고: 격리된 실행이 `LiveSessionModelSwitchError`를 발생시키면 cron은 재시도하기 전에 전환된 프로바이더/모델 (및 전환된 인증 프로파일 재정의가 있는 경우)을 유지합니다. 외부 재시도 루프는 초기 시도 후 2번의 전환 재시도로 제한된 후 무한 루프 대신 중단됩니다.

참고: 실패 알림은 `delivery.failureDestination` 우선, 그 다음 전역 `cron.failureDestination`, 그리고 명시적 실패 대상이 구성되지 않은 경우 작업의 기본 알림 대상으로 폴백합니다.

참고: 보존/정리는 구성에서 제어됩니다:

- `cron.sessionRetention` (기본값 `24h`)는 완료된 격리 실행 세션을 정리합니다.
- `cron.runLog.maxBytes` + `cron.runLog.keepLines`는 `~/.openclaw/cron/runs/<jobId>.jsonl`을 정리합니다.

업그레이드 참고: 현재 전달/저장 형식 이전의 이전 cron 작업이 있는 경우 `openclaw doctor --fix`를 실행하세요. Doctor는 이제 레거시 cron 작업 형태를 정규화합니다 (`jobId`, `schedule.cron`, 레거시 `threadId`를 포함한 최상위 전달 필드, 페이로드 `provider` 전달 별칭)하고 `cron.webhook`이 구성된 경우 단순 `notify: true` 웹훅 폴백 작업을 명시적 웹훅 전달로 마이그레이션합니다.

## 일반 편집

메시지를 변경하지 않고 전달 설정 업데이트:

```bash
openclaw cron edit <job-id> --announce --channel telegram --to "123456789"
```

격리된 작업에 대한 전달 비활성화:

```bash
openclaw cron edit <job-id> --no-deliver
```

격리된 작업에 대한 경량 부트스트랩 컨텍스트 활성화:

```bash
openclaw cron edit <job-id> --light-context
```

특정 채널에 알림:

```bash
openclaw cron edit <job-id> --announce --channel slack --to "channel:C1234567890"
```

경량 부트스트랩 컨텍스트로 격리된 작업 생성:

```bash
openclaw cron add \
  --name "Lightweight morning brief" \
  --cron "0 7 * * *" \
  --session isolated \
  --message "Summarize overnight updates." \
  --light-context \
  --no-deliver
```

`--light-context`는 격리된 에이전트 턴 작업에만 적용됩니다. cron 실행의 경우 경량 모드는 전체 워크스페이스 부트스트랩 세트를 주입하는 대신 부트스트랩 컨텍스트를 비워 둡니다.

전달 소유권 참고:

- Cron 소유 격리 작업은 항상 cron 실행자를 통해 최종 사용자 가시 전달을 라우팅합니다 (`announce`, `webhook`, 또는 내부 전용 `none`).
- 작업이 외부 수신자에게 메시지 전송을 언급하는 경우 에이전트는 직접 전송을 시도하는 대신 결과에 의도된 대상을 설명해야 합니다.

## 일반 관리 명령

수동 실행:

```bash
openclaw cron run <job-id>
openclaw cron run <job-id> --due
openclaw cron runs --id <job-id> --limit 50
```

에이전트/세션 재지정:

```bash
openclaw cron edit <job-id> --agent ops
openclaw cron edit <job-id> --clear-agent
openclaw cron edit <job-id> --session current
openclaw cron edit <job-id> --session "session:daily-brief"
```

전달 조정:

```bash
openclaw cron edit <job-id> --announce --channel slack --to "channel:C1234567890"
openclaw cron edit <job-id> --best-effort-deliver
openclaw cron edit <job-id> --no-best-effort-deliver
openclaw cron edit <job-id> --no-deliver
```

실패 전달 참고:

- `delivery.failureDestination`은 격리된 작업에 지원됩니다.
- 메인 세션 작업은 기본 전달 모드가 `webhook`인 경우에만 `delivery.failureDestination`을 사용할 수 있습니다.
- 실패 대상을 설정하지 않고 작업이 이미 채널에 알림을 보내는 경우 실패 알림은 동일한 알림 대상을 재사용합니다.
