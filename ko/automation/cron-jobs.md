---
summary: "게이트웨이 스케줄러의 예약 작업, 웹훅, Gmail PubSub 트리거"
read_when:
  - 백그라운드 작업 또는 깨우기를 예약할 때
  - 외부 트리거(웹훅, Gmail)를 OpenClaw에 연결할 때
  - 예약된 태스크에 하트비트와 크론 중에서 결정할 때
title: "예약된 태스크"
---

# 예약된 태스크 (크론)

크론은 게이트웨이의 내장 스케줄러입니다. 작업을 유지하고, 적시에 에이전트를 깨우며, 결과를 채팅 채널이나 웹훅 엔드포인트로 전달할 수 있습니다.

## 빠른 시작

```bash
# 일회성 알림 추가
openclaw cron add \
  --name "Reminder" \
  --at "2026-02-01T16:00:00Z" \
  --session main \
  --system-event "Reminder: check the cron docs draft" \
  --wake now \
  --delete-after-run

# 작업 목록 확인
openclaw cron list

# 실행 이력 조회
openclaw cron runs --id <job-id>
```

## 크론 작동 방식

- 크론은 모델 내부가 아닌 **게이트웨이** 프로세스 **내부**에서 실행됩니다.
- 작업은 `~/.openclaw/cron/jobs.json`에 유지되므로 재시작해도 일정이 유실되지 않습니다.
- 모든 크론 실행은 [백그라운드 태스크](/automation/tasks) 레코드를 생성합니다.
- 일회성 작업(`--at`)은 성공 후 기본적으로 자동 삭제됩니다.
- 독립 크론 실행은 실행 완료 시 해당 `cron:<jobId>` 세션의 추적된 브라우저 탭/프로세스를 최선 노력으로 종료하므로, 분리된 브라우저 자동화가 고아 프로세스를 남기지 않습니다.
- 독립 크론 실행은 오래된 확인 응답도 방어합니다. 첫 번째 결과가 단순 중간 상태 업데이트(`on it`, `pulling everything together` 등의 힌트)이고 최종 답변을 담당하는 하위 서브에이전트 실행이 없는 경우, OpenClaw는 실제 결과를 얻기 위해 한 번 더 프롬프트를 보냅니다.

크론의 태스크 조정은 런타임이 소유합니다: 크론 런타임이 해당 작업을 아직 실행 중으로 추적하는 동안은 활성 크론 태스크가 유지되며, 오래된 자식 세션 행이 존재하더라도 마찬가지입니다. 런타임이 작업 소유를 중단하고 5분 유예 기간이 지나면, 유지 관리가 태스크를 `lost`로 표시할 수 있습니다.

## 일정 유형

| 종류    | CLI 플래그 | 설명                                                     |
| ------- | ---------- | -------------------------------------------------------- |
| `at`    | `--at`    | 일회성 타임스탬프 (ISO 8601 또는 `20m`과 같은 상대적 값) |
| `every` | `--every` | 고정 간격                                                 |
| `cron`  | `--cron`  | 선택적 `--tz`가 있는 5필드 또는 6필드 크론 표현식        |

시간대가 없는 타임스탬프는 UTC로 처리됩니다. 로컬 벽시계 예약을 위해 `--tz America/New_York`을 추가하십시오.

매 정시 반복 표현식은 부하 급증을 줄이기 위해 최대 5분까지 자동으로 분산됩니다. 정확한 타이밍을 강제하려면 `--exact`를 사용하거나, 명시적 기간을 위해 `--stagger 30s`를 사용하십시오.

## 실행 스타일

| 스타일       | `--session` 값      | 실행 위치                | 적합한 경우                      |
| ------------ | ------------------- | ------------------------ | -------------------------------- |
| 메인 세션    | `main`              | 다음 하트비트 턴         | 알림, 시스템 이벤트              |
| 독립         | `isolated`          | 전용 `cron:<jobId>`      | 보고서, 백그라운드 작업          |
| 현재 세션    | `current`           | 생성 시 바인딩           | 컨텍스트 인식 반복 작업          |
| 커스텀 세션  | `session:custom-id` | 영구 명명된 세션         | 이력을 기반으로 하는 워크플로우  |

**메인 세션** 작업은 시스템 이벤트를 큐에 넣고 선택적으로 하트비트를 깨웁니다(`--wake now` 또는 `--wake next-heartbeat`). **독립** 작업은 새로운 세션으로 전용 에이전트 턴을 실행합니다. **커스텀 세션**(`session:xxx`)은 이전 요약을 기반으로 하는 일일 스탠드업과 같은 워크플로우를 가능하게 하여 실행 간 컨텍스트를 유지합니다.

독립 작업의 경우, 런타임 종료에는 해당 크론 세션에 대한 최선 노력 브라우저 정리가 포함됩니다. 정리 실패는 무시되므로 실제 크론 결과가 우선합니다.

독립 크론 실행이 서브에이전트를 조율할 때, 전달도 오래된 부모 중간 텍스트보다 최종 하위 출력을 선호합니다. 하위 항목이 아직 실행 중인 경우, OpenClaw는 부분 부모 업데이트를 발표하는 대신 억제합니다.

### 독립 작업의 페이로드 옵션

- `--message`: 프롬프트 텍스트 (독립 실행 시 필수)
- `--model` / `--thinking`: 모델 및 사고 수준 재정의
- `--light-context`: 작업 공간 부트스트랩 파일 주입 건너뜀
- `--tools exec,read`: 작업이 사용할 수 있는 도구 제한

`--model`은 해당 작업에 대해 선택된 허용 모델을 사용합니다. 요청된 모델이 허용되지 않으면, 크론은 경고를 기록하고 작업의 에이전트/기본 모델 선택으로 대체합니다. 구성된 대체 체인은 계속 적용되지만, 명시적 작업별 대체 목록이 없는 일반 모델 재정의는 더 이상 에이전트 기본값을 숨겨진 추가 재시도 대상으로 추가하지 않습니다.

독립 작업의 모델 선택 우선순위:

1. Gmail 훅 모델 재정의 (실행이 Gmail에서 왔고 해당 재정의가 허용된 경우)
2. 작업별 페이로드 `model`
3. 저장된 크론 세션 모델 재정의
4. 에이전트/기본 모델 선택

빠른 모드도 해결된 라이브 선택을 따릅니다. 선택된 모델 설정에 `params.fastMode`가 있으면, 독립 크론은 기본적으로 이를 사용합니다. 저장된 세션 `fastMode` 재정의는 어느 방향으로든 설정보다 우선합니다.

독립 실행이 라이브 모델 전환 핸드오프에 도달하면, 크론은 전환된 공급자/모델로 재시도하고 재시도 전에 해당 라이브 선택을 유지합니다. 전환에 새 인증 프로파일도 포함된 경우, 크론은 해당 인증 프로파일 재정의도 유지합니다. 재시도는 제한됩니다: 초기 시도 후 2번의 전환 재시도 후에 크론은 무한 루프 대신 중단합니다.

## 전달 및 출력

| 모드       | 동작                                                 |
| ---------- | ---------------------------------------------------- |
| `announce` | 대상 채널에 요약 전달 (독립 실행 기본값)             |
| `webhook`  | 완료된 이벤트 페이로드를 URL에 POST                  |
| `none`     | 내부 전용, 전달 없음                                 |

채널 전달에는 `--announce --channel telegram --to "-1001234567890"`을 사용하십시오. Telegram 포럼 주제에는 `-1001234567890:topic:123`을 사용하십시오. Slack/Discord/Mattermost 대상은 명시적 접두사(`channel:<id>`, `user:<id>`)를 사용해야 합니다.

크론 소유 독립 작업의 경우, 실행기가 최종 전달 경로를 소유합니다. 에이전트는 일반 텍스트 요약을 반환하도록 프롬프트를 받으며, 해당 요약은 `announce`, `webhook`을 통해 전송되거나 `none`의 경우 내부에 보관됩니다. `--no-deliver`는 전달을 에이전트에 넘기지 않으며, 실행을 내부로 유지합니다.

원래 태스크에 특정 외부 수신자에게 메시지를 보내라는 내용이 명시적으로 포함된 경우, 에이전트는 직접 보내려 하는 대신 출력에 메시지를 보내야 할 대상/위치를 기록해야 합니다.

실패 알림은 별도의 대상 경로를 따릅니다:

- `cron.failureDestination`은 실패 알림의 전역 기본값을 설정합니다.
- `job.delivery.failureDestination`은 작업별로 이를 재정의합니다.
- 둘 다 설정되지 않고 작업이 이미 `announce`를 통해 전달하는 경우, 실패 알림은 이제 해당 기본 announce 대상으로 대체됩니다.
- `delivery.failureDestination`은 기본 전달 모드가 `webhook`이 아닌 한 `sessionTarget="isolated"` 작업에서만 지원됩니다.

## CLI 예시

일회성 알림 (메인 세션):

```bash
openclaw cron add \
  --name "Calendar check" \
  --at "20m" \
  --session main \
  --system-event "Next heartbeat: check calendar." \
  --wake now
```

전달이 있는 반복 독립 작업:

```bash
openclaw cron add \
  --name "Morning brief" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize overnight updates." \
  --announce \
  --channel slack \
  --to "channel:C1234567890"
```

모델 및 사고 재정의가 있는 독립 작업:

```bash
openclaw cron add \
  --name "Deep analysis" \
  --cron "0 6 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Weekly deep analysis of project progress." \
  --model "opus" \
  --thinking high \
  --announce
```

## 웹훅

게이트웨이는 외부 트리거를 위한 HTTP 웹훅 엔드포인트를 노출할 수 있습니다. 설정에서 활성화:

```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
  },
}
```

### 인증

모든 요청에는 헤더를 통해 훅 토큰이 포함되어야 합니다:

- `Authorization: Bearer <token>` (권장)
- `x-openclaw-token: <token>`

쿼리 문자열 토큰은 거부됩니다.

### POST /hooks/wake

메인 세션에 시스템 이벤트를 큐에 넣습니다:

```bash
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"text":"New email received","mode":"now"}'
```

- `text` (필수): 이벤트 설명
- `mode` (선택): `now` (기본값) 또는 `next-heartbeat`

### POST /hooks/agent

독립 에이전트 턴을 실행합니다:

```bash
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"message":"Summarize inbox","name":"Email","model":"openai/gpt-5.4-mini"}'
```

필드: `message` (필수), `name`, `agentId`, `wakeMode`, `deliver`, `channel`, `to`, `model`, `thinking`, `timeoutSeconds`.

### 매핑된 훅 (POST /hooks/\<name\>)

커스텀 훅 이름은 설정의 `hooks.mappings`를 통해 확인됩니다. 매핑은 임의의 페이로드를 템플릿이나 코드 변환을 사용하여 `wake` 또는 `agent` 액션으로 변환할 수 있습니다.

### 보안

- 훅 엔드포인트를 루프백, tailnet, 또는 신뢰할 수 있는 리버스 프록시 뒤에 유지하십시오.
- 전용 훅 토큰을 사용하십시오; 게이트웨이 인증 토큰을 재사용하지 마십시오.
- `hooks.path`를 전용 서브 경로에 유지하십시오; `/`는 거부됩니다.
- 명시적 `agentId` 라우팅을 제한하려면 `hooks.allowedAgentIds`를 설정하십시오.
- 호출자가 선택한 세션이 필요하지 않은 한 `hooks.allowRequestSessionKey=false`를 유지하십시오.
- `hooks.allowRequestSessionKey`를 활성화하는 경우, 허용된 세션 키 형식을 제한하기 위해 `hooks.allowedSessionKeyPrefixes`도 설정하십시오.
- 훅 페이로드는 기본적으로 안전 경계로 래핑됩니다.

## Gmail PubSub 통합

Google PubSub을 통해 Gmail 받은 편지함 트리거를 OpenClaw에 연결합니다.

**사전 요구 사항**: `gcloud` CLI, `gog` (gogcli), OpenClaw 훅 활성화, 공개 HTTPS 엔드포인트를 위한 Tailscale.

### 마법사 설정 (권장)

```bash
openclaw webhooks gmail setup --account openclaw@gmail.com
```

이 명령은 `hooks.gmail` 설정을 작성하고, Gmail 프리셋을 활성화하며, 푸시 엔드포인트에 Tailscale Funnel을 사용합니다.

### 게이트웨이 자동 시작

`hooks.enabled=true`이고 `hooks.gmail.account`가 설정된 경우, 게이트웨이는 부팅 시 `gog gmail watch serve`를 시작하고 자동으로 감시를 갱신합니다. 옵트아웃하려면 `OPENCLAW_SKIP_GMAIL_WATCHER=1`을 설정하십시오.

### 수동 일회성 설정

1. `gog`에서 사용하는 OAuth 클라이언트를 소유하는 GCP 프로젝트를 선택합니다:

```bash
gcloud auth login
gcloud config set project <project-id>
gcloud services enable gmail.googleapis.com pubsub.googleapis.com
```

2. 주제를 생성하고 Gmail 푸시 액세스를 부여합니다:

```bash
gcloud pubsub topics create gog-gmail-watch
gcloud pubsub topics add-iam-policy-binding gog-gmail-watch \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher
```

3. 감시를 시작합니다:

```bash
gog gmail watch start \
  --account openclaw@gmail.com \
  --label INBOX \
  --topic projects/<project-id>/topics/gog-gmail-watch
```

### Gmail 모델 재정의

```json5
{
  hooks: {
    gmail: {
      model: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      thinking: "off",
    },
  },
}
```

## 작업 관리

```bash
# 모든 작업 목록
openclaw cron list

# 작업 편집
openclaw cron edit <jobId> --message "Updated prompt" --model "opus"

# 지금 작업 강제 실행
openclaw cron run <jobId>

# 기한이 된 경우에만 실행
openclaw cron run <jobId> --due

# 실행 이력 조회
openclaw cron runs --id <jobId> --limit 50

# 작업 삭제
openclaw cron remove <jobId>

# 에이전트 선택 (멀티 에이전트 설정)
openclaw cron add --name "Ops sweep" --cron "0 6 * * *" --session isolated --message "Check ops queue" --agent ops
openclaw cron edit <jobId> --clear-agent
```

모델 재정의 참고:

- `openclaw cron add|edit --model ...`은 작업의 선택된 모델을 변경합니다.
- 모델이 허용된 경우, 정확한 공급자/모델이 독립 에이전트 실행에 전달됩니다.
- 허용되지 않은 경우, 크론은 경고를 표시하고 작업의 에이전트/기본 모델 선택으로 대체합니다.
- 구성된 대체 체인은 계속 적용되지만, 명시적 작업별 대체 목록이 없는 일반 `--model` 재정의는 더 이상 에이전트 기본값을 조용한 추가 재시도 대상으로 사용하지 않습니다.

## 설정

```json5
{
  cron: {
    enabled: true,
    store: "~/.openclaw/cron/jobs.json",
    maxConcurrentRuns: 1,
    retry: {
      maxAttempts: 3,
      backoffMs: [60000, 120000, 300000],
      retryOn: ["rate_limit", "overloaded", "network", "server_error"],
    },
    webhookToken: "replace-with-dedicated-webhook-token",
    sessionRetention: "24h",
    runLog: { maxBytes: "2mb", keepLines: 2000 },
  },
}
```

크론 비활성화: `cron.enabled: false` 또는 `OPENCLAW_SKIP_CRON=1`.

**일회성 재시도**: 일시적 오류 (속도 제한, 과부하, 네트워크, 서버 오류)는 지수 백오프로 최대 3회 재시도합니다. 영구적 오류는 즉시 비활성화됩니다.

**반복 재시도**: 재시도 간 지수 백오프 (30초에서 60분). 다음 성공적인 실행 후 백오프가 재설정됩니다.

**유지 관리**: `cron.sessionRetention` (기본값 `24h`)은 독립 실행 세션 항목을 정리합니다. `cron.runLog.maxBytes` / `cron.runLog.keepLines`는 실행 로그 파일을 자동 정리합니다.

## 문제 해결

### 명령 순서

```bash
openclaw status
openclaw gateway status
openclaw cron status
openclaw cron list
openclaw cron runs --id <jobId> --limit 20
openclaw system heartbeat last
openclaw logs --follow
openclaw doctor
```

### 크론이 실행되지 않는 경우

- `cron.enabled` 및 `OPENCLAW_SKIP_CRON` 환경 변수를 확인하십시오.
- 게이트웨이가 지속적으로 실행 중인지 확인하십시오.
- `cron` 일정의 경우, 호스트 시간대 대비 시간대(`--tz`)를 확인하십시오.
- 실행 출력의 `reason: not-due`는 `openclaw cron run <jobId> --due`로 수동 실행했지만 작업 기한이 아직 아님을 의미합니다.

### 크론이 실행되었지만 전달이 없는 경우

- 전달 모드가 `none`이면 외부 메시지가 예상되지 않습니다.
- 전달 대상 누락/잘못됨 (`channel`/`to`)은 아웃바운드가 건너뛰어졌음을 의미합니다.
- 채널 인증 오류 (`unauthorized`, `Forbidden`)는 자격 증명으로 인해 전달이 차단되었음을 의미합니다.
- 독립 실행이 무음 토큰(`NO_REPLY` / `no_reply`)만 반환하는 경우, OpenClaw는 직접 아웃바운드 전달을 억제하고 대체 큐에 넣어진 요약 경로도 억제하여 채팅에 아무것도 게시되지 않습니다.
- 크론 소유 독립 작업의 경우, 에이전트가 대체로 메시지 도구를 사용할 것을 기대하지 마십시오. 실행기가 최종 전달을 소유하며; `--no-deliver`는 직접 전송을 허용하는 대신 내부로 유지합니다.

### 시간대 주의 사항

- `--tz` 없는 크론은 게이트웨이 호스트 시간대를 사용합니다.
- 시간대 없는 `at` 일정은 UTC로 처리됩니다.
- 하트비트 `activeHours`는 구성된 시간대 해석을 사용합니다.

## 관련 항목

- [자동화 및 태스크](/automation/) — 한눈에 보는 모든 자동화 메커니즘
- [백그라운드 태스크](/automation/tasks) — 크론 실행을 위한 태스크 원장
- [하트비트](/gateway/heartbeat) — 주기적인 메인 세션 턴
- [시간대](/concepts/timezone) — 시간대 설정
