---
summary: "gateway, channels, automation, nodes, browser에 대한 심층 troubleshooting 런북"
read_when:
  - troubleshooting 허브가 심층 진단을 위해 여기로 안내한 경우
  - 정확한 명령어가 포함된 안정적인 증상 기반 런북 섹션이 필요할 때
title: "Troubleshooting"
---

# Gateway troubleshooting

이 페이지는 심층 런북입니다.
빠른 분류(triage) 흐름을 먼저 원하신다면 [/help/troubleshooting](/help/troubleshooting)에서 시작하십시오.

## 명령어 단계 (Command ladder)

다음을 이 순서대로 먼저 실행하십시오:

```bash
openclaw status
openclaw gateway status
openclaw logs --follow
openclaw doctor
openclaw channels status --probe
```

예상되는 정상 신호:

- `openclaw gateway status`가 `Runtime: running`, `Connectivity probe: ok`, 그리고 `Capability: ...` 라인을 표시합니다.
- `openclaw doctor`는 차단하는 구성/서비스 문제를 보고하지 않습니다.
- `openclaw channels status --probe`는 활성 계정별 transport 상태와, 지원되는 경우 `works` 또는 `audit ok` 같은 프로브/감사 결과를 표시합니다.

## Anthropic 429 긴 컨텍스트에 추가 사용 필요

로그/오류에 다음이 포함될 때 사용합니다:
`HTTP 429: rate_limit_error: Extra usage is required for long context requests`.

```bash
openclaw logs --follow
openclaw models status
openclaw config get agents.defaults.models
```

확인 사항:

- 선택된 Anthropic Opus/Sonnet 모델에 `params.context1m: true`가 있습니다.
- 현재 Anthropic 자격 증명이 긴 컨텍스트 사용 자격이 없습니다.
- 요청은 1M 베타 경로가 필요한 긴 세션/모델 실행에서만 실패합니다.

수정 옵션:

1. 해당 모델에서 `context1m`을 비활성화하여 일반 컨텍스트 창으로 폴백합니다.
2. 긴 컨텍스트 요청 자격이 있는 Anthropic 자격 증명을 사용하거나, Anthropic API 키로 전환합니다.
3. Anthropic 긴 컨텍스트 요청이 거부될 때 실행이 계속되도록 폴백 모델을 구성합니다.

관련:

- [/providers/anthropic](/providers/anthropic)
- [/reference/token-use](/reference/token-use)
- [/help/faq-first-run#why-am-i-seeing-http-429-ratelimiterror-from-anthropic](/help/faq-first-run#why-am-i-seeing-http-429-ratelimiterror-from-anthropic)

## 로컬 OpenAI 호환 백엔드는 직접 프로브를 통과하지만 에이전트 실행이 실패함

다음과 같을 때 사용합니다:

- `curl ... /v1/models`가 작동함
- 작은 직접 `/v1/chat/completions` 호출이 작동함
- OpenClaw 모델 실행이 일반 에이전트 턴에서만 실패함

```bash
curl http://127.0.0.1:1234/v1/models
curl http://127.0.0.1:1234/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<id>","messages":[{"role":"user","content":"hi"}],"stream":false}'
openclaw infer model run --model <provider/model> --prompt "hi" --json
openclaw logs --follow
```

확인 사항:

- 직접 작은 호출은 성공하지만, OpenClaw 실행은 더 큰 프롬프트에서만 실패함
- `messages[].content`가 문자열을 기대한다는 백엔드 오류
- 더 큰 prompt-token 카운트나 전체 에이전트 런타임 프롬프트에서만 나타나는 백엔드 크래시

일반적인 시그니처:

- `messages[...].content: invalid type: sequence, expected a string` → 백엔드가
  구조화된 Chat Completions content parts를 거부합니다. 수정:
  `models.providers.<provider>.models[].compat.requiresStringContent: true`로 설정합니다.
- 직접 작은 요청은 성공하지만, OpenClaw 에이전트 실행은 백엔드/모델 크래시로 실패함
  (예: 일부 `inferrs` 빌드의 Gemma) → OpenClaw transport는 이미 올바를 가능성이 높으며,
  백엔드가 더 큰 에이전트 런타임 프롬프트 형태에서 실패하는 것입니다.
- 도구를 비활성화한 후 실패가 줄어들지만 사라지지는 않음 → 도구 스키마가 압박의
  일부였지만, 남은 문제는 여전히 업스트림 모델/서버 용량 또는 백엔드 버그입니다.

수정 옵션:

1. 문자열 전용 Chat Completions 백엔드에 대해 `compat.requiresStringContent: true`로 설정합니다.
2. OpenClaw의 도구 스키마 표면을 안정적으로 처리할 수 없는 모델/백엔드에 대해
   `compat.supportsTools: false`로 설정합니다.
3. 가능한 경우 프롬프트 압박을 낮춥니다: 더 작은 워크스페이스 부트스트랩, 더 짧은
   세션 히스토리, 더 가벼운 로컬 모델, 또는 더 강력한 긴 컨텍스트 지원이 있는
   백엔드.
4. 작은 직접 요청은 계속 통과하는데 OpenClaw 에이전트 턴이 여전히 백엔드 내부에서
   크래시하는 경우, 이를 업스트림 서버/모델 제약으로 취급하고 수용된 payload 형태와
   함께 거기에 재현 리포트를 제출하십시오.

관련:

- [/gateway/local-models](/gateway/local-models)
- [/gateway/configuration](/gateway/configuration)
- [/gateway/configuration-reference#openai-compatible-endpoints](/gateway/configuration-reference#openai-compatible-endpoints)

## 응답 없음

채널이 올라와 있지만 아무도 응답하지 않는다면, 무언가를 다시 연결하기 전에 라우팅과 정책을 확인하십시오.

```bash
openclaw status
openclaw channels status --probe
openclaw pairing list --channel <channel> [--account <id>]
openclaw config get channels
openclaw logs --follow
```

확인 사항:

- DM 발신자에 대한 pairing 대기 중.
- 그룹 멘션 게이팅 (`requireMention`, `mentionPatterns`).
- 채널/그룹 allowlist 불일치.

일반적인 시그니처:

- `drop guild message (mention required` → 멘션이 있을 때까지 그룹 메시지 무시됨.
- `pairing request` → 발신자 승인 필요.
- `blocked` / `allowlist` → 정책에 의해 발신자/채널이 필터링됨.

관련:

- [/channels/troubleshooting](/channels/troubleshooting)
- [/channels/pairing](/channels/pairing)
- [/channels/groups](/channels/groups)

## 대시보드 컨트롤 UI 연결 문제

대시보드/Control UI가 연결되지 않을 때, URL, 인증 모드, 그리고 보안 컨텍스트 가정을 검증하십시오.

```bash
openclaw gateway status
openclaw status
openclaw logs --follow
openclaw doctor
openclaw gateway status --json
```

확인 사항:

- 올바른 프로브 URL과 대시보드 URL.
- 클라이언트와 게이트웨이 간 인증 모드/토큰 불일치.
- 디바이스 신원이 필요한 상황에서 HTTP 사용.

일반적인 시그니처:

- `device identity required` → 비보안 컨텍스트 또는 디바이스 인증 누락.
- `origin not allowed` → 브라우저의 `Origin`이 `gateway.controlUi.allowedOrigins`에
  없습니다 (또는 명시적 allowlist 없이 비루프백 브라우저 origin에서 연결하는 경우).
- `device nonce required` / `device nonce mismatch` → 클라이언트가 challenge 기반
  디바이스 인증 흐름(`connect.challenge` + `device.nonce`)을 완료하지 못합니다.
- `device signature invalid` / `device signature expired` → 클라이언트가 현재
  핸드셰이크에 잘못된 payload(또는 오래된 timestamp)를 서명했습니다.
- `AUTH_TOKEN_MISMATCH`와 `canRetryWithDeviceToken=true` → 클라이언트가 캐시된 디바이스 토큰으로 한 번의 신뢰할 수 있는 재시도를 할 수 있습니다.
- 해당 캐시된 토큰 재시도는 페어링된 디바이스 토큰과 함께 저장된 캐시된 scope 집합을
  재사용합니다. 명시적 `deviceToken` / 명시적 `scopes` 호출자는 대신 요청된 scope
  집합을 유지합니다.
- 해당 재시도 경로 외부에서, connect 인증 우선순위는 명시적 공유 토큰/비밀번호가
  먼저, 그다음 명시적 `deviceToken`, 그다음 저장된 디바이스 토큰, 그다음 bootstrap
  토큰입니다.
- 비동기 Tailscale Serve Control UI 경로에서, 동일한 `{scope, ip}`에 대한 실패
  시도는 limiter가 실패를 기록하기 전에 직렬화됩니다. 따라서 동일한 클라이언트의
  두 개의 잘못된 동시 재시도는 두 개의 일반 불일치 대신 두 번째 시도에서 `retry later`를
  표면화할 수 있습니다.
- 브라우저 origin 루프백 클라이언트의 `too many failed authentication attempts (retry later)` →
  동일한 정규화된 `Origin`의 반복 실패가 일시적으로 잠겼습니다; 다른 localhost
  origin은 별도의 버킷을 사용합니다.
- 해당 재시도 후 반복되는 `unauthorized` → 공유 토큰/디바이스 토큰 drift; 토큰 구성을 새로 고치고 필요시 디바이스 토큰을 재승인/교체하십시오.
- `gateway connect failed:` → 잘못된 host/port/url 타겟.

### 인증 detail code 빠른 매핑

실패한 `connect` 응답의 `error.details.code`를 사용하여 다음 조치를 선택하십시오:

| Detail code                  | 의미                                                                                                                                                                                      | 권장 조치                                                                                                                                                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_TOKEN_MISSING`         | 클라이언트가 필수 공유 토큰을 보내지 않았습니다.                                                                                                                                                 | 클라이언트에 토큰을 붙여넣기/설정하고 재시도합니다. 대시보드 경로의 경우: `openclaw config get gateway.auth.token`으로 확인 후 Control UI 설정에 붙여넣습니다.                                                                                                                              |
| `AUTH_TOKEN_MISMATCH`        | 공유 토큰이 게이트웨이 인증 토큰과 일치하지 않았습니다.                                                                                                                                               | `canRetryWithDeviceToken=true`인 경우, 한 번의 신뢰할 수 있는 재시도를 허용합니다. 캐시된 토큰 재시도는 저장된 승인된 scope를 재사용합니다; 명시적 `deviceToken` / `scopes` 호출자는 요청된 scope를 유지합니다. 여전히 실패하면 [토큰 drift 복구 체크리스트](/cli/devices#token-drift-recovery-checklist)를 실행하십시오. |
| `AUTH_DEVICE_TOKEN_MISMATCH` | 캐시된 디바이스별 토큰이 오래되었거나 취소되었습니다.                                                                                                                                                 | [devices CLI](/cli/devices)를 사용하여 디바이스 토큰을 교체/재승인한 후 다시 연결합니다.                                                                                                                                                                                                        |
| `PAIRING_REQUIRED`           | 디바이스 신원에 승인이 필요합니다. `error.details.reason`을 `not-paired`, `scope-upgrade`, `role-upgrade`, 또는 `metadata-upgrade` 중에서 확인하고, 있는 경우 `requestId` / `remediationHint`를 사용합니다. | 대기 중인 요청을 승인합니다: `openclaw devices list` 실행 후 `openclaw devices approve <requestId>`. Scope/역할 업그레이드는 요청된 액세스를 검토한 후 동일한 흐름을 사용합니다.                                                                                                               |

Device auth v2 마이그레이션 확인:

```bash
openclaw --version
openclaw doctor
openclaw gateway status
```

로그에 nonce/signature 오류가 표시되면, 연결하는 클라이언트를 업데이트하고 다음을 검증하십시오:

1. `connect.challenge`를 기다립니다
2. challenge 바인딩된 payload에 서명합니다
3. 동일한 challenge nonce와 함께 `connect.params.device.nonce`를 보냅니다

`openclaw devices rotate` / `revoke` / `remove`가 예기치 않게 거부되는 경우:

- 페어링된 디바이스 토큰 세션은 호출자가 `operator.admin`도 가지고 있지 않는 한
  **자체** 디바이스만 관리할 수 있습니다
- `openclaw devices rotate --scope ...`는 호출자 세션이 이미 보유한 오퍼레이터
  scope만 요청할 수 있습니다

관련:

- [/web/control-ui](/web/control-ui)
- [/gateway/configuration](/gateway/configuration) (gateway 인증 모드)
- [/gateway/trusted-proxy-auth](/gateway/trusted-proxy-auth)
- [/gateway/remote](/gateway/remote)
- [/cli/devices](/cli/devices)

## Gateway 서비스가 실행되지 않음

서비스가 설치되었지만 프로세스가 유지되지 않을 때 사용합니다.

```bash
openclaw gateway status
openclaw status
openclaw logs --follow
openclaw doctor
openclaw gateway status --deep   # 시스템 수준 서비스도 스캔
```

확인 사항:

- 종료 힌트가 있는 `Runtime: stopped`.
- 서비스 구성 불일치 (`Config (cli)` vs `Config (service)`).
- 포트/리스너 충돌.
- `--deep` 사용 시 추가 launchd/systemd/schtasks 설치 확인.
- `Other gateway-like services detected (best effort)` 정리 힌트.

일반적인 시그니처:

- `Gateway start blocked: set gateway.mode=local` 또는 `existing config is missing gateway.mode` → 로컬 게이트웨이 모드가 활성화되어 있지 않거나, 구성 파일이 손상되어 `gateway.mode`를 잃었습니다. 수정: 구성에 `gateway.mode="local"`을 설정하거나, `openclaw onboard --mode local` / `openclaw setup`을 다시 실행하여 예상되는 로컬 모드 구성을 다시 찍습니다. Podman을 통해 OpenClaw를 실행하는 경우, 기본 구성 경로는 `~/.openclaw/openclaw.json`입니다.
- `refusing to bind gateway ... without auth` → 유효한 게이트웨이 인증 경로(토큰/비밀번호, 또는 구성된 경우 trusted-proxy) 없이 비루프백 바인드.
- `another gateway instance is already listening` / `EADDRINUSE` → 포트 충돌.
- `Other gateway-like services detected (best effort)` → 오래되었거나 병렬인 launchd/systemd/schtasks 유닛이 존재합니다. 대부분의 설정은 머신당 하나의 게이트웨이를 유지해야 합니다; 둘 이상이 필요하면 포트 + config/state/workspace를 격리하십시오. [/gateway#multiple-gateways-same-host](/gateway/#multiple-gateways-same-host)를 참조하십시오.

관련:

- [/gateway/background-process](/gateway/background-process)
- [/gateway/configuration](/gateway/configuration)
- [/gateway/doctor](/gateway/doctor)

## Gateway가 last-known-good 구성을 복원함

게이트웨이는 시작되지만 로그에 `openclaw.json`을 복원했다고 표시될 때 사용합니다.

```bash
openclaw logs --follow
openclaw config file
openclaw config validate
openclaw doctor
```

확인 사항:

- `Config auto-restored from last-known-good`
- `gateway: invalid config was restored from last-known-good backup`
- `config reload restored last-known-good config after invalid-config`
- 활성 구성 옆의 timestamp가 있는 `openclaw.json.clobbered.*` 파일
- `Config recovery warning`으로 시작하는 메인 에이전트 시스템 이벤트

어떤 일이 발생했는가:

- 거부된 구성이 시작 또는 핫 리로드 중에 유효성 검사를 통과하지 못했습니다.
- OpenClaw가 거부된 payload를 `.clobbered.*`로 보존했습니다.
- 활성 구성이 마지막으로 검증된 last-known-good 복사본에서 복원되었습니다.
- 다음 메인 에이전트 턴은 거부된 구성을 맹목적으로 다시 쓰지 않도록 경고받습니다.

검사 및 복구:

```bash
CONFIG="$(openclaw config file)"
ls -lt "$CONFIG".clobbered.* "$CONFIG".rejected.* 2>/dev/null | head
diff -u "$CONFIG" "$(ls -t "$CONFIG".clobbered.* 2>/dev/null | head -n 1)"
openclaw config validate
openclaw doctor
```

일반적인 시그니처:

- `.clobbered.*`가 존재함 → 외부 직접 편집 또는 시작 읽기가 복원되었습니다.
- `.rejected.*`가 존재함 → OpenClaw 소유의 구성 쓰기가 commit 전에 스키마 또는 clobber 검사를 통과하지 못했습니다.
- `Config write rejected:` → 쓰기가 필수 형태를 떨어뜨리거나, 파일을 급격히 축소하거나, 유효하지 않은 구성을 유지하려고 했습니다.
- `missing-meta-vs-last-good`, `gateway-mode-missing-vs-last-good`, 또는 `size-drop-vs-last-good:*` → 시작 시 현재 파일이 last-known-good 백업과 비교하여 필드나 크기를 잃었기 때문에 clobbered로 처리했습니다.
- `Config last-known-good promotion skipped` → 후보에 `***` 같은 수정된 비밀 플레이스홀더가 포함되어 있었습니다.

수정 옵션:

1. 복원된 활성 구성이 올바르면 유지합니다.
2. `.clobbered.*` 또는 `.rejected.*`에서 의도한 키만 복사한 후, `openclaw config set` 또는 `config.patch`로 적용합니다.
3. 재시작하기 전에 `openclaw config validate`를 실행합니다.
4. 수동으로 편집하는 경우, 변경하려는 부분 객체가 아닌 전체 JSON5 구성을 유지하십시오.

관련:

- [/gateway/configuration#strict-validation](/gateway/configuration#strict-validation)
- [/gateway/configuration#config-hot-reload](/gateway/configuration#config-hot-reload)
- [/cli/config](/cli/config)
- [/gateway/doctor](/gateway/doctor)

## Gateway 프로브 경고

`openclaw gateway probe`가 무언가에 도달하지만 여전히 경고 블록을 출력할 때 사용합니다.

```bash
openclaw gateway probe
openclaw gateway probe --json
openclaw gateway probe --ssh user@gateway-host
```

확인 사항:

- JSON 출력의 `warnings[].code`와 `primaryTargetId`.
- 경고가 SSH 폴백, 다중 게이트웨이, 누락된 scope, 또는 해결되지 않은 인증 refs에 관한 것인지 여부.

일반적인 시그니처:

- `SSH tunnel failed to start; falling back to direct probes.` → SSH 설정이 실패했지만, 명령은 여전히 직접 구성된/루프백 타겟을 시도했습니다.
- `multiple reachable gateways detected` → 둘 이상의 타겟이 응답했습니다. 일반적으로 의도적인 다중 게이트웨이 설정이거나 오래된/중복된 리스너를 의미합니다.
- `Read-probe diagnostics are limited by gateway scopes (missing operator.read)` → 연결은 작동했지만, 상세 RPC는 scope 제한적입니다; 디바이스 신원을 페어링하거나 `operator.read`가 있는 자격 증명을 사용하십시오.
- `Capability: pairing-pending` 또는 `gateway closed (1008): pairing required` → 게이트웨이가 응답했지만, 이 클라이언트는 일반 오퍼레이터 액세스를 받기 전에 여전히 pairing/승인이 필요합니다.
- 해결되지 않은 `gateway.auth.*` / `gateway.remote.*` SecretRef 경고 텍스트 → 이 명령 경로에서 실패한 타겟에 대해 인증 자료를 사용할 수 없었습니다.

관련:

- [/cli/gateway](/cli/gateway)
- [/gateway#multiple-gateways-same-host](/gateway/#multiple-gateways-same-host)
- [/gateway/remote](/gateway/remote)

## 채널 연결됨 메시지 흐름이 없음

채널 상태가 연결됨이지만 메시지 흐름이 죽어 있다면, 정책, 권한, 그리고 채널별 전달 규칙에 집중하십시오.

```bash
openclaw channels status --probe
openclaw pairing list --channel <channel> [--account <id>]
openclaw status --deep
openclaw logs --follow
openclaw config get channels
```

확인 사항:

- DM 정책 (`pairing`, `allowlist`, `open`, `disabled`).
- 그룹 allowlist와 멘션 요구 사항.
- 누락된 채널 API 권한/scope.

일반적인 시그니처:

- `mention required` → 그룹 멘션 정책에 의해 메시지 무시됨.
- `pairing` / 대기 중인 승인 추적 → 발신자가 승인되지 않음.
- `missing_scope`, `not_in_channel`, `Forbidden`, `401/403` → 채널 인증/권한 문제.

관련:

- [/channels/troubleshooting](/channels/troubleshooting)
- [/channels/whatsapp](/channels/whatsapp)
- [/channels/telegram](/channels/telegram)
- [/channels/discord](/channels/discord)

## Cron과 heartbeat 전달

cron 또는 heartbeat가 실행되지 않았거나 전달되지 않은 경우, 먼저 scheduler 상태를, 그다음 전달 타겟을 검증하십시오.

```bash
openclaw cron status
openclaw cron list
openclaw cron runs --id <jobId> --limit 20
openclaw system heartbeat last
openclaw logs --follow
```

확인 사항:

- Cron이 활성화되고 다음 wake가 존재함.
- 작업 실행 히스토리 상태 (`ok`, `skipped`, `error`).
- Heartbeat 건너뛴 이유 (`quiet-hours`, `requests-in-flight`, `alerts-disabled`, `empty-heartbeat-file`, `no-tasks-due`).

일반적인 시그니처:

- `cron: scheduler disabled; jobs will not run automatically` → cron 비활성화됨.
- `cron: timer tick failed` → scheduler tick 실패; 파일/로그/런타임 오류를 확인하십시오.
- `heartbeat skipped`와 `reason=quiet-hours` → 활성 시간 창 외부.
- `heartbeat skipped`와 `reason=empty-heartbeat-file` → `HEARTBEAT.md`가 존재하지만 빈 줄 / markdown 헤더만 포함하므로 OpenClaw가 모델 호출을 건너뜁니다.
- `heartbeat skipped`와 `reason=no-tasks-due` → `HEARTBEAT.md`에 `tasks:` 블록이 포함되어 있지만, 이 tick에서 어떤 작업도 예정되지 않았습니다.
- `heartbeat: unknown accountId` → heartbeat 전달 타겟에 대한 유효하지 않은 account id.
- `heartbeat skipped`와 `reason=dm-blocked` → heartbeat 타겟이 DM 스타일 목적지로 확인되었고 `agents.defaults.heartbeat.directPolicy`(또는 에이전트별 재정의)가 `block`으로 설정되어 있습니다.

관련:

- [/automation/cron-jobs#troubleshooting](/automation/cron-jobs#troubleshooting)
- [/automation/cron-jobs](/automation/cron-jobs)
- [/gateway/heartbeat](/gateway/heartbeat)

## 페어링된 노드 도구 실패

노드가 페어링되었지만 도구가 실패하는 경우, foreground, 권한, 그리고 승인 상태를 격리하십시오.

```bash
openclaw nodes status
openclaw nodes describe --node <idOrNameOrIp>
openclaw approvals get --node <idOrNameOrIp>
openclaw logs --follow
openclaw status
```

확인 사항:

- 예상된 capability를 가진 노드 온라인 상태.
- camera/mic/location/screen에 대한 OS 권한 부여.
- Exec 승인과 allowlist 상태.

일반적인 시그니처:

- `NODE_BACKGROUND_UNAVAILABLE` → 노드 앱이 foreground여야 합니다.
- `*_PERMISSION_REQUIRED` / `LOCATION_PERMISSION_REQUIRED` → 누락된 OS 권한.
- `SYSTEM_RUN_DENIED: approval required` → exec 승인 대기 중.
- `SYSTEM_RUN_DENIED: allowlist miss` → allowlist에 의해 명령 차단됨.

관련:

- [/nodes/troubleshooting](/nodes/troubleshooting)
- [/nodes/index](/nodes/)
- [/tools/exec-approvals](/tools/exec-approvals)

## 브라우저 도구 실패

게이트웨이 자체는 정상인데 브라우저 도구 작업이 실패할 때 사용합니다.

```bash
openclaw browser status
openclaw browser start --browser-profile openclaw
openclaw browser profiles
openclaw logs --follow
openclaw doctor
```

확인 사항:

- `plugins.allow`가 설정되어 있고 `browser`를 포함하는지 여부.
- 유효한 브라우저 실행 파일 경로.
- CDP 프로파일 도달 가능성.
- `existing-session` / `user` 프로파일에 대한 로컬 Chrome 가용성.

일반적인 시그니처:

- `unknown command "browser"` 또는 `unknown command 'browser'` → 번들된 브라우저 플러그인이 `plugins.allow`에 의해 제외되었습니다.
- `browser.enabled=true`인데 브라우저 도구 누락 / 사용 불가 → `plugins.allow`가 `browser`를 제외하므로 플러그인이 로드되지 않았습니다.
- `Failed to start Chrome CDP on port` → 브라우저 프로세스 실행 실패.
- `browser.executablePath not found` → 구성된 경로가 유효하지 않음.
- `browser.cdpUrl must be http(s) or ws(s)` → 구성된 CDP URL이 `file:` 또는 `ftp:` 같은 지원되지 않는 스킴을 사용합니다.
- `browser.cdpUrl has invalid port` → 구성된 CDP URL에 잘못되었거나 범위를 벗어난 포트가 있습니다.
- `Could not find DevToolsActivePort for chrome` → Chrome MCP existing-session이 아직 선택한 브라우저 데이터 디렉토리에 연결할 수 없습니다. 브라우저 inspect 페이지를 열고, 원격 디버깅을 활성화하고, 브라우저를 열어두고, 첫 연결 프롬프트를 승인한 후, 재시도하십시오. 로그인 상태가 필요하지 않은 경우, 관리형 `openclaw` 프로파일을 선호하십시오.
- `No Chrome tabs found for profile="user"` → Chrome MCP 연결 프로파일에 열려 있는 로컬 Chrome 탭이 없습니다.
- `Remote CDP for profile "<name>" is not reachable` → 구성된 원격 CDP 엔드포인트가 게이트웨이 호스트에서 도달할 수 없습니다.
- `Browser attachOnly is enabled ... not reachable` 또는 `Browser attachOnly is enabled and CDP websocket ... is not reachable` → attach-only 프로파일에 도달 가능한 타겟이 없거나, HTTP 엔드포인트는 응답했지만 CDP WebSocket을 여전히 열 수 없었습니다.
- `Playwright is not available in this gateway build; '<feature>' is unsupported.` → 현재 게이트웨이 설치에 번들된 브라우저 플러그인의 `playwright-core` 런타임 종속성이 없습니다; `openclaw doctor --fix`를 실행한 후, 게이트웨이를 재시작하십시오. ARIA snapshot과 기본 페이지 screenshot은 여전히 작동할 수 있지만, navigation, AI snapshot, CSS-selector element screenshot, 그리고 PDF export는 사용할 수 없는 상태로 유지됩니다.
- `fullPage is not supported for element screenshots` → screenshot 요청이 `--full-page`를 `--ref` 또는 `--element`와 혼합했습니다.
- `element screenshots are not supported for existing-session profiles; use ref from snapshot.` → Chrome MCP / `existing-session` screenshot 호출은 CSS `--element`가 아닌 페이지 캡처 또는 snapshot `--ref`를 사용해야 합니다.
- `existing-session file uploads do not support element selectors; use ref/inputRef.` → Chrome MCP 업로드 훅은 CSS 셀렉터가 아닌 snapshot ref가 필요합니다.
- `existing-session file uploads currently support one file at a time.` → Chrome MCP 프로파일에서는 호출당 하나의 업로드만 보내십시오.
- `existing-session dialog handling does not support timeoutMs.` → Chrome MCP 프로파일의 다이얼로그 훅은 timeout 재정의를 지원하지 않습니다.
- `response body is not supported for existing-session profiles yet.` → `responsebody`는 여전히 관리형 브라우저 또는 원시 CDP 프로파일이 필요합니다.
- attach-only 또는 원격 CDP 프로파일의 오래된 viewport / 다크 모드 / 로케일 / 오프라인 재정의 → `openclaw browser stop --browser-profile <name>`을 실행하여 활성 제어 세션을 닫고 전체 게이트웨이를 재시작하지 않고 Playwright/CDP 에뮬레이션 상태를 해제하십시오.

관련:

- [/tools/browser-linux-troubleshooting](/tools/browser-linux-troubleshooting)
- [/tools/browser](/tools/browser)

## 업그레이드 후 갑자기 뭔가 깨진 경우

대부분의 업그레이드 후 문제는 구성 drift 또는 이제 시행되는 더 엄격한 기본값입니다.

### 1) 인증과 URL 재정의 동작이 변경됨

```bash
openclaw gateway status
openclaw config get gateway.mode
openclaw config get gateway.remote.url
openclaw config get gateway.auth.mode
```

확인할 것:

- `gateway.mode=remote`인 경우, CLI 호출이 remote를 타겟팅할 수 있지만 로컬 서비스는 정상일 수 있습니다.
- 명시적 `--url` 호출은 저장된 자격 증명으로 폴백하지 않습니다.

일반적인 시그니처:

- `gateway connect failed:` → 잘못된 URL 타겟.
- `unauthorized` → 엔드포인트는 도달 가능하지만 잘못된 인증.

### 2) Bind와 인증 가드레일이 더 엄격해짐

```bash
openclaw config get gateway.bind
openclaw config get gateway.auth.mode
openclaw config get gateway.auth.token
openclaw gateway status
openclaw logs --follow
```

확인할 것:

- 비루프백 bind(`lan`, `tailnet`, `custom`)는 유효한 게이트웨이 인증 경로가 필요합니다: 공유 토큰/비밀번호 인증, 또는 올바르게 구성된 비루프백 `trusted-proxy` 배포.
- `gateway.token` 같은 이전 키는 `gateway.auth.token`을 대체하지 않습니다.

일반적인 시그니처:

- `refusing to bind gateway ... without auth` → 유효한 게이트웨이 인증 경로 없는 비루프백 bind.
- 런타임이 실행 중인데 `Connectivity probe: failed` → 게이트웨이는 살아 있지만 현재 인증/url로 액세스 불가.

### 3) Pairing과 디바이스 신원 상태가 변경됨

```bash
openclaw devices list
openclaw pairing list --channel <channel> [--account <id>]
openclaw logs --follow
openclaw doctor
```

확인할 것:

- 대시보드/노드에 대한 대기 중인 디바이스 승인.
- 정책 또는 신원 변경 후 대기 중인 DM pairing 승인.

일반적인 시그니처:

- `device identity required` → 디바이스 인증이 충족되지 않음.
- `pairing required` → 발신자/디바이스가 승인되어야 함.

검사 후에도 서비스 구성과 런타임이 여전히 일치하지 않으면, 동일한 profile/state 디렉토리에서 서비스 메타데이터를 재설치하십시오:

```bash
openclaw gateway install --force
openclaw gateway restart
```

관련:

- [/gateway/pairing](/gateway/pairing)
- [/gateway/authentication](/gateway/authentication)
- [/gateway/background-process](/gateway/background-process)

## 관련

- [Gateway 런북](/gateway/)
- [Doctor](/gateway/doctor)
- [FAQ](/help/faq)
