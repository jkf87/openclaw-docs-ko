---
title: "문제 해결"
description: "게이트웨이, 채널, 자동화, 노드, 브라우저에 대한 심층 문제 해결 런북"
---

# 게이트웨이 문제 해결

이 페이지는 심층 런북입니다.
빠른 분류 흐름을 먼저 원하면 [/help/troubleshooting](/help/troubleshooting)에서 시작하십시오.

## 명령 단계

이 순서대로 먼저 실행합니다:

```bash
openclaw status
openclaw gateway status
openclaw logs --follow
openclaw doctor
openclaw channels status --probe
```

예상되는 정상 신호:

- `openclaw gateway status`는 `Runtime: running` 및 `RPC probe: ok`를 표시합니다.
- `openclaw doctor`는 차단하는 구성/서비스 문제를 보고하지 않습니다.
- `openclaw channels status --probe`는 활성 계정별 전송 상태와, 지원되는 경우 `works` 또는 `audit ok`와 같은 프로브/감사 결과를 표시합니다.

## Anthropic 429 긴 컨텍스트에 추가 사용 필요

로그/오류에 다음이 포함된 경우 사용합니다:
`HTTP 429: rate_limit_error: Extra usage is required for long context requests`.

```bash
openclaw logs --follow
openclaw models status
openclaw config get agents.defaults.models
```

확인 사항:

- 선택된 Anthropic Opus/Sonnet 모델에 `params.context1m: true`가 있습니다.
- 현재 Anthropic 자격 증명은 긴 컨텍스트 사용 자격이 없습니다.
- 요청은 1M 베타 경로가 필요한 긴 세션/모델 실행에서만 실패합니다.

수정 옵션:

1. 해당 모델에 대해 `context1m`을 비활성화하여 일반 컨텍스트 창으로 폴백합니다.
2. 긴 컨텍스트 요청 자격이 있는 Anthropic 자격 증명을 사용하거나 Anthropic API 키로 전환합니다.
3. Anthropic 긴 컨텍스트 요청이 거부될 때 실행이 계속되도록 폴백 모델을 구성합니다.

관련:

- [/providers/anthropic](/providers/anthropic)
- [/reference/token-use](/reference/token-use)
- [/help/faq#why-am-i-seeing-http-429-ratelimiterror-from-anthropic](/help/faq#why-am-i-seeing-http-429-ratelimiterror-from-anthropic)

## 로컬 OpenAI 호환 백엔드가 직접 프로브는 통과하지만 에이전트 실행이 실패함

다음과 같은 경우 사용합니다:

- `curl ... /v1/models` 작동
- 작은 직접 `/v1/chat/completions` 호출 작동
- OpenClaw 모델 실행이 일반 에이전트 턴에서만 실패

```bash
curl http://127.0.0.1:1234/v1/models
curl http://127.0.0.1:1234/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"&lt;id&gt;","messages":[{"role":"user","content":"hi"}],"stream":false}'
openclaw infer model run --model &lt;provider/model&gt; --prompt "hi" --json
openclaw logs --follow
```

확인 사항:

- 직접 작은 호출은 성공하지만 OpenClaw 실행은 더 큰 프롬프트에서만 실패
- `messages[].content`가 문자열을 기대한다는 백엔드 오류
- 더 큰 프롬프트-토큰 수 또는 전체 에이전트 런타임 프롬프트에서만 나타나는 백엔드 충돌

일반적인 특징:

- `messages[...].content: invalid type: sequence, expected a string` → 백엔드가 구조화된 Chat Completions 콘텐츠 파트를 거부합니다. 수정: `models.providers.&lt;provider&gt;.models[].compat.requiresStringContent: true` 설정.
- 직접 작은 요청은 성공하지만 OpenClaw 에이전트 실행은 백엔드/모델 충돌로 실패(예: 일부 `inferrs` 빌드의 Gemma) → OpenClaw 전송은 이미 올바를 가능성이 높습니다. 백엔드가 더 큰 에이전트 런타임 프롬프트 형태에서 실패하고 있습니다.
- 도구를 비활성화하면 실패가 줄어들지만 사라지지 않음 → 도구 스키마가 압력의 일부였지만 남은 문제는 여전히 업스트림 모델/서버 용량 또는 백엔드 버그입니다.

수정 옵션:

1. 문자열 전용 Chat Completions 백엔드에 대해 `compat.requiresStringContent: true`를 설정합니다.
2. OpenClaw의 도구 스키마 표면을 신뢰할 수 없는 모델/백엔드에 대해 `compat.supportsTools: false`를 설정합니다.
3. 프롬프트 압력을 가능한 경우 낮춥니다: 더 작은 워크스페이스 부트스트랩, 더 짧은 세션 기록, 더 가벼운 로컬 모델, 또는 더 강한 긴 컨텍스트 지원이 있는 백엔드.
4. 작은 직접 요청이 계속 통과하는 동안 OpenClaw 에이전트 턴이 여전히 백엔드 내에서 충돌하면 업스트림 서버/모델 제한으로 처리하고 수락된 페이로드 형태로 재현 사례를 제출합니다.

관련:

- [/gateway/local-models](/gateway/local-models)
- [/gateway/configuration#models](/gateway/configuration#models)
- [/gateway/configuration-reference#openai-compatible-endpoints](/gateway/configuration-reference#openai-compatible-endpoints)

## 회신 없음

채널은 작동하지만 아무것도 응답하지 않으면 무엇이든 재연결하기 전에 라우팅 및 정책을 확인합니다.

```bash
openclaw status
openclaw channels status --probe
openclaw pairing list --channel &lt;channel&gt; [--account &lt;id&gt;]
openclaw config get channels
openclaw logs --follow
```

확인 사항:

- DM 발신자에 대해 페어링 대기 중.
- 그룹 언급 게이팅(`requireMention`, `mentionPatterns`).
- 채널/그룹 허용 목록 불일치.

일반적인 특징:

- `drop guild message (mention required` → 언급 전까지 그룹 메시지가 무시됩니다.
- `pairing request` → 발신자가 승인이 필요합니다.
- `blocked` / `allowlist` → 발신자/채널이 정책에 의해 필터링됩니다.

관련:

- [/channels/troubleshooting](/channels/troubleshooting)
- [/channels/pairing](/channels/pairing)
- [/channels/groups](/channels/groups)

## 대시보드 Control UI 연결

대시보드/Control UI가 연결되지 않을 때 URL, 인증 모드, 보안 컨텍스트 가정을 유효성 검사합니다.

```bash
openclaw gateway status
openclaw status
openclaw logs --follow
openclaw doctor
openclaw gateway status --json
```

확인 사항:

- 올바른 프로브 URL 및 대시보드 URL.
- 클라이언트와 게이트웨이 간의 인증 모드/토큰 불일치.
- 기기 신원이 필요한 곳에서 HTTP 사용.

일반적인 특징:

- `device identity required` → 비보안 컨텍스트 또는 기기 인증 누락.
- `origin not allowed` → 브라우저 `Origin`이 `gateway.controlUi.allowedOrigins`에 없습니다(또는 명시적 허용 목록 없이 비루프백 브라우저 출처에서 연결하고 있습니다).
- `device nonce required` / `device nonce mismatch` → 클라이언트가 챌린지 기반 기기 인증 흐름(`connect.challenge` + `device.nonce`)을 완료하지 않고 있습니다.
- `device signature invalid` / `device signature expired` → 클라이언트가 현재 핸드셰이크에 대해 잘못된 페이로드(또는 오래된 타임스탬프)에 서명했습니다.
- `canRetryWithDeviceToken=true`인 `AUTH_TOKEN_MISMATCH` → 클라이언트는 캐시된 기기 토큰으로 신뢰할 수 있는 한 번의 재시도를 수행할 수 있습니다.
  해당 캐시된 토큰 재시도는 페어링된 기기 토큰과 함께 저장된 캐시된 범위 집합을 재사용합니다. 명시적 `deviceToken` / 명시적 `scopes` 발신자는 요청된 범위 집합을 대신 유지합니다.
- 해당 재시도 경로 밖에서 연결 인증 우선순위는 명시적 공유 토큰/비밀번호 먼저, 그런 다음 명시적 `deviceToken`, 그런 다음 저장된 기기 토큰, 그런 다음 부트스트랩 토큰입니다.
- 비동기 Tailscale Serve Control UI 경로에서 동일한 `{scope, ip}`에 대한 실패한 시도는 제한기가 실패를 기록하기 전에 직렬화됩니다. 따라서 동일한 클라이언트의 두 개의 잘못된 동시 재시도는 두 개의 일반 불일치 대신 두 번째 시도에서 `retry later`를 표면화할 수 있습니다.
- 브라우저-출처 루프백 클라이언트의 `too many failed authentication attempts (retry later)` → 동일한 정규화된 `Origin`에서의 반복 실패가 일시적으로 잠깁니다. 다른 localhost 출처는 별도의 버킷을 사용합니다.
- 해당 재시도 후 반복된 `unauthorized` → 공유 토큰/기기 토큰 드리프트; 토큰 구성을 새로 고침하고 필요한 경우 기기 토큰을 재승인/교체합니다.
- `gateway connect failed:` → 잘못된 호스트/포트/URL 대상.

### 인증 세부 코드 빠른 맵

실패한 `connect` 응답의 `error.details.code`를 사용하여 다음 작업을 선택합니다:

| 세부 코드                    | 의미                                                 | 권장 작업                                                                                                                                                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_TOKEN_MISSING`         | 클라이언트가 필수 공유 토큰을 보내지 않았습니다.     | 클라이언트에서 토큰을 붙여넣기/설정하고 재시도합니다. 대시보드 경로의 경우: `openclaw config get gateway.auth.token`을 실행한 후 Control UI 설정에 붙여넣습니다.                                                                                                                       |
| `AUTH_TOKEN_MISMATCH`        | 공유 토큰이 게이트웨이 인증 토큰과 일치하지 않습니다. | `canRetryWithDeviceToken=true`이면 신뢰할 수 있는 한 번의 재시도를 허용합니다. 캐시된 토큰 재시도는 저장된 승인된 범위를 재사용합니다. 명시적 `deviceToken` / `scopes` 발신자는 요청된 범위를 유지합니다. 여전히 실패하면 [토큰 드리프트 복구 체크리스트](/cli/devices#token-drift-recovery-checklist)를 실행합니다. |
| `AUTH_DEVICE_TOKEN_MISMATCH` | 캐시된 기기별 토큰이 오래됐거나 취소됐습니다.         | [devices CLI](/cli/devices)를 사용하여 기기 토큰을 교체/재승인한 후 재연결합니다.                                                                                                                                                                                                     |
| `PAIRING_REQUIRED`           | 기기 신원은 알려졌지만 이 역할에 대해 승인되지 않았습니다. | 대기 중인 요청 승인: `openclaw devices list`를 실행한 후 `openclaw devices approve &lt;requestId&gt;`.                                                                                                                                                                                       |

기기 인증 v2 마이그레이션 확인:

```bash
openclaw --version
openclaw doctor
openclaw gateway status
```

로그에 nonce/서명 오류가 표시되면 연결하는 클라이언트를 업데이트하고 확인합니다:

1. `connect.challenge`를 기다립니다
2. 챌린지 바인딩 페이로드에 서명합니다
3. 동일한 챌린지 nonce와 함께 `connect.params.device.nonce`를 보냅니다

예기치 않게 `openclaw devices rotate` / `revoke` / `remove`가 거부된 경우:

- 페어링된 기기 토큰 세션은 발신자가 `operator.admin`도 가진 경우가 아닌 한 **자신의** 기기만 관리할 수 있습니다
- `openclaw devices rotate --scope ...`는 발신자 세션이 이미 보유한 오퍼레이터 범위만 요청할 수 있습니다

관련:

- [/web/control-ui](/web/control-ui)
- [/gateway/configuration](/gateway/configuration) (게이트웨이 인증 모드)
- [/gateway/trusted-proxy-auth](/gateway/trusted-proxy-auth)
- [/gateway/remote](/gateway/remote)
- [/cli/devices](/cli/devices)

## 게이트웨이 서비스가 실행되지 않음

서비스는 설치됐지만 프로세스가 유지되지 않을 때 사용합니다.

```bash
openclaw gateway status
openclaw status
openclaw logs --follow
openclaw doctor
openclaw gateway status --deep   # 시스템 수준 서비스도 스캔
```

확인 사항:

- 종료 힌트가 있는 `Runtime: stopped`.
- 서비스 구성 불일치(`Config (cli)` vs `Config (service)`).
- 포트/리스너 충돌.
- `--deep` 사용 시 추가 launchd/systemd/schtasks 설치.
- `Other gateway-like services detected (best effort)` 정리 힌트.

일반적인 특징:

- `Gateway start blocked: set gateway.mode=local` 또는 `existing config is missing gateway.mode` → 로컬 게이트웨이 모드가 활성화되지 않았거나 구성 파일이 덮어쓰여 `gateway.mode`를 잃었습니다. 수정: 구성에서 `gateway.mode="local"`을 설정하거나 `openclaw onboard --mode local` / `openclaw setup`을 다시 실행하여 예상되는 로컬 모드 구성을 재스탬프합니다. Podman을 통해 OpenClaw를 실행하는 경우 기본 구성 경로는 `~/.openclaw/openclaw.json`입니다.
- `refusing to bind gateway ... without auth` → 유효한 게이트웨이 인증 경로(토큰/비밀번호, 또는 구성된 경우 신뢰할 수 있는 프록시) 없이 비루프백 바인딩.
- `another gateway instance is already listening` / `EADDRINUSE` → 포트 충돌.
- `Other gateway-like services detected (best effort)` → 오래된 또는 병렬 launchd/systemd/schtasks 유닛이 존재합니다. 대부분의 설정은 머신당 하나의 게이트웨이를 유지해야 합니다. 둘 이상이 필요한 경우 포트 + 구성/상태/워크스페이스를 격리합니다. [/gateway#multiple-gateways-same-host](/gateway#multiple-gateways-same-host)를 참조하십시오.

관련:

- [/gateway/background-process](/gateway/background-process)
- [/gateway/configuration](/gateway/configuration)
- [/gateway/doctor](/gateway/doctor)

## 게이트웨이 프로브 경고

`openclaw gateway probe`가 무언가에 도달하지만 여전히 경고 블록을 출력할 때 사용합니다.

```bash
openclaw gateway probe
openclaw gateway probe --json
openclaw gateway probe --ssh user@gateway-host
```

확인 사항:

- JSON 출력의 `warnings[].code` 및 `primaryTargetId`.
- 경고가 SSH 폴백, 여러 게이트웨이, 누락된 범위, 또는 해결되지 않은 인증 ref에 관한 것인지 여부.

일반적인 특징:

- `SSH tunnel failed to start; falling back to direct probes.` → SSH 설정이 실패했지만 명령은 여전히 직접 구성/루프백 대상을 시도했습니다.
- `multiple reachable gateways detected` → 둘 이상의 대상이 응답했습니다. 일반적으로 의도적인 멀티 게이트웨이 설정이나 오래된/중복 리스너를 의미합니다.
- `Probe diagnostics are limited by gateway scopes (missing operator.read)` → 연결은 성공했지만 세부 RPC는 범위가 제한됩니다. `operator.read`가 있는 기기 신원 페어링 또는 자격 증명을 사용합니다.
- 해결되지 않은 `gateway.auth.*` / `gateway.remote.*` SecretRef 경고 텍스트 → 실패한 대상의 이 명령 경로에서 인증 자료를 사용할 수 없었습니다.

관련:

- [/cli/gateway](/cli/gateway)
- [/gateway#multiple-gateways-same-host](/gateway#multiple-gateways-same-host)
- [/gateway/remote](/gateway/remote)

## 채널 연결됐지만 메시지가 흐르지 않음

채널 상태는 연결됐지만 메시지 흐름이 중단된 경우 정책, 권한, 채널별 전송 규칙에 집중합니다.

```bash
openclaw channels status --probe
openclaw pairing list --channel &lt;channel&gt; [--account &lt;id&gt;]
openclaw status --deep
openclaw logs --follow
openclaw config get channels
```

확인 사항:

- DM 정책(`pairing`, `allowlist`, `open`, `disabled`).
- 그룹 허용 목록 및 언급 요구 사항.
- 누락된 채널 API 권한/범위.

일반적인 특징:

- `mention required` → 그룹 언급 정책으로 메시지가 무시됩니다.
- `pairing` / 대기 중인 승인 추적 → 발신자가 승인되지 않았습니다.
- `missing_scope`, `not_in_channel`, `Forbidden`, `401/403` → 채널 인증/권한 문제.

관련:

- [/channels/troubleshooting](/channels/troubleshooting)
- [/channels/whatsapp](/channels/whatsapp)
- [/channels/telegram](/channels/telegram)
- [/channels/discord](/channels/discord)

## Cron 및 하트비트 전송

Cron 또는 하트비트가 실행되지 않거나 전송되지 않은 경우 먼저 스케줄러 상태를 확인한 후 전송 대상을 확인합니다.

```bash
openclaw cron status
openclaw cron list
openclaw cron runs --id &lt;jobId&gt; --limit 20
openclaw system heartbeat last
openclaw logs --follow
```

확인 사항:

- Cron 활성화 및 다음 깨우기 존재.
- 작업 실행 기록 상태(`ok`, `skipped`, `error`).
- 하트비트 건너뛰기 이유(`quiet-hours`, `requests-in-flight`, `alerts-disabled`, `empty-heartbeat-file`, `no-tasks-due`).

일반적인 특징:

- `cron: scheduler disabled; jobs will not run automatically` → cron 비활성화됨.
- `cron: timer tick failed` → 스케줄러 틱 실패; 파일/로그/런타임 오류 확인.
- `reason=quiet-hours`인 `heartbeat skipped` → 활성 시간 창 밖입니다.
- `reason=empty-heartbeat-file`인 `heartbeat skipped` → `HEARTBEAT.md`가 존재하지만 빈 줄/마크다운 헤더만 포함되어 OpenClaw가 모델 호출을 건너뜁니다.
- `reason=no-tasks-due`인 `heartbeat skipped` → `HEARTBEAT.md`에 `tasks:` 블록이 포함되어 있지만 이 틱에 만료된 작업이 없습니다.
- `heartbeat: unknown accountId` → 하트비트 전송 대상의 잘못된 계정 id.
- `reason=dm-blocked`인 `heartbeat skipped` → 하트비트 대상이 DM 스타일 목적지로 해결됐지만 `agents.defaults.heartbeat.directPolicy`(또는 에이전트별 재정의)가 `block`으로 설정됨.

관련:

- [/automation/cron-jobs#troubleshooting](/automation/cron-jobs#troubleshooting)
- [/automation/cron-jobs](/automation/cron-jobs)
- [/gateway/heartbeat](/gateway/heartbeat)

## 노드 페어링된 도구 실패

노드가 페어링됐지만 도구가 실패하면 포그라운드, 권한, 승인 상태를 격리합니다.

```bash
openclaw nodes status
openclaw nodes describe --node &lt;idOrNameOrIp&gt;
openclaw approvals get --node &lt;idOrNameOrIp&gt;
openclaw logs --follow
openclaw status
```

확인 사항:

- 예상되는 기능이 있는 노드 온라인 상태.
- 카메라/마이크/위치/화면에 대한 OS 권한 부여.
- Exec 승인 및 허용 목록 상태.

일반적인 특징:

- `NODE_BACKGROUND_UNAVAILABLE` → 노드 앱이 포그라운드에 있어야 합니다.
- `*_PERMISSION_REQUIRED` / `LOCATION_PERMISSION_REQUIRED` → OS 권한 누락.
- `SYSTEM_RUN_DENIED: approval required` → exec 승인 대기 중.
- `SYSTEM_RUN_DENIED: allowlist miss` → 명령이 허용 목록에 의해 차단됩니다.

관련:

- [/nodes/troubleshooting](/nodes/troubleshooting)
- [/nodes/index](/nodes/index)
- [/tools/exec-approvals](/tools/exec-approvals)

## 브라우저 도구 실패

게이트웨이 자체는 정상이지만 브라우저 도구 작업이 실패할 때 사용합니다.

```bash
openclaw browser status
openclaw browser start --browser-profile openclaw
openclaw browser profiles
openclaw logs --follow
openclaw doctor
```

확인 사항:

- `plugins.allow`가 설정됐고 `browser`를 포함하는지.
- 유효한 브라우저 실행 파일 경로.
- CDP 프로필 도달 가능성.
- `existing-session` / `user` 프로필에 대한 로컬 Chrome 가용성.

일반적인 특징:

- `unknown command "browser"` 또는 `unknown command 'browser'` → 번들 브라우저 플러그인이 `plugins.allow`에 의해 제외됩니다.
- `browser.enabled=true`이지만 브라우저 도구 누락/사용 불가 → `plugins.allow`가 `browser`를 제외하여 플러그인이 로드되지 않았습니다.
- `Failed to start Chrome CDP on port` → 브라우저 프로세스 시작 실패.
- `browser.executablePath not found` → 구성된 경로가 잘못됐습니다.
- `browser.cdpUrl must be http(s) or ws(s)` → 구성된 CDP URL이 `file:` 또는 `ftp:`와 같은 지원되지 않는 스키마를 사용합니다.
- `browser.cdpUrl has invalid port` → 구성된 CDP URL에 잘못됐거나 범위를 벗어난 포트가 있습니다.
- `No Chrome tabs found for profile="user"` → Chrome MCP 연결 프로필에 열린 로컬 Chrome 탭이 없습니다.
- `Remote CDP for profile "&lt;name&gt;" is not reachable` → 구성된 원격 CDP 엔드포인트가 게이트웨이 호스트에서 접근 불가합니다.
- `Browser attachOnly is enabled ... not reachable` 또는 `Browser attachOnly is enabled and CDP websocket ... is not reachable` → 연결 전용 프로필에 접근 가능한 대상이 없거나, HTTP 엔드포인트가 응답했지만 CDP WebSocket을 열 수 없었습니다.
- `Playwright is not available in this gateway build; '&lt;feature&gt;' is unsupported.` → 현재 게이트웨이 설치에 전체 Playwright 패키지가 없습니다. ARIA 스냅샷과 기본 페이지 스크린샷은 여전히 작동할 수 있지만, 탐색, AI 스냅샷, CSS 선택기 요소 스크린샷, PDF 내보내기는 사용할 수 없습니다.
- `fullPage is not supported for element screenshots` → 스크린샷 요청이 `--full-page`와 `--ref` 또는 `--element`를 혼합했습니다.
- `element screenshots are not supported for existing-session profiles; use ref from snapshot.` → Chrome MCP / `existing-session` 스크린샷 호출은 페이지 캡처 또는 스냅샷 `--ref`를 사용해야 하며 CSS `--element`는 사용할 수 없습니다.
- `existing-session file uploads do not support element selectors; use ref/inputRef.` → Chrome MCP 업로드 훅은 CSS 선택기가 아닌 스냅샷 ref가 필요합니다.
- `existing-session file uploads currently support one file at a time.` → Chrome MCP 프로필에서 호출당 하나의 업로드를 보냅니다.
- `existing-session dialog handling does not support timeoutMs.` → Chrome MCP 프로필의 대화 상자 훅은 타임아웃 재정의를 지원하지 않습니다.
- `response body is not supported for existing-session profiles yet.` → `responsebody`는 여전히 관리형 브라우저 또는 원시 CDP 프로필이 필요합니다.
- 연결 전용 또는 원격 CDP 프로필의 오래된 뷰포트/다크 모드/로케일/오프라인 재정의 → `openclaw browser stop --browser-profile &lt;name&gt;`을 실행하여 전체 게이트웨이를 다시 시작하지 않고 활성 제어 세션을 닫고 Playwright/CDP 에뮬레이션 상태를 해제합니다.

관련:

- [/tools/browser-linux-troubleshooting](/tools/browser-linux-troubleshooting)
- [/tools/browser](/tools/browser)

## 업그레이드 후 갑자기 무언가 작동하지 않는 경우

대부분의 업그레이드 후 중단은 구성 드리프트 또는 이제 더 엄격하게 적용되는 기본값입니다.

### 1) 인증 및 URL 재정의 동작 변경

```bash
openclaw gateway status
openclaw config get gateway.mode
openclaw config get gateway.remote.url
openclaw config get gateway.auth.mode
```

확인 사항:

- `gateway.mode=remote`인 경우 CLI 호출이 로컬 서비스는 정상이지만 원격을 대상으로 할 수 있습니다.
- 명시적 `--url` 호출은 저장된 자격 증명으로 폴백하지 않습니다.

일반적인 특징:

- `gateway connect failed:` → 잘못된 URL 대상.
- `unauthorized` → 엔드포인트는 접근 가능하지만 인증이 잘못됩니다.

### 2) 바인딩 및 인증 가드레일이 더 엄격해짐

```bash
openclaw config get gateway.bind
openclaw config get gateway.auth.mode
openclaw config get gateway.auth.token
openclaw gateway status
openclaw logs --follow
```

확인 사항:

- 비루프백 바인딩(`lan`, `tailnet`, `custom`)은 유효한 게이트웨이 인증 경로가 필요합니다: 공유 토큰/비밀번호 인증, 또는 올바르게 구성된 비루프백 `trusted-proxy` 배포.
- `gateway.token`과 같은 이전 키는 `gateway.auth.token`을 대체하지 않습니다.

일반적인 특징:

- `refusing to bind gateway ... without auth` → 유효한 게이트웨이 인증 경로 없는 비루프백 바인딩.
- 런타임이 실행 중인 동안 `RPC probe: failed` → 게이트웨이는 활성이지만 현재 인증/URL로 접근 불가합니다.

### 3) 페어링 및 기기 신원 상태 변경

```bash
openclaw devices list
openclaw pairing list --channel &lt;channel&gt; [--account &lt;id&gt;]
openclaw logs --follow
openclaw doctor
```

확인 사항:

- 대시보드/노드에 대한 대기 중인 기기 승인.
- 정책 또는 신원 변경 후 대기 중인 DM 페어링 승인.

일반적인 특징:

- `device identity required` → 기기 인증이 충족되지 않았습니다.
- `pairing required` → 발신자/기기가 승인되어야 합니다.

확인 후에도 서비스 구성과 런타임이 여전히 일치하지 않으면 동일한 프로필/상태 디렉터리에서 서비스 메타데이터를 재설치합니다:

```bash
openclaw gateway install --force
openclaw gateway restart
```

관련:

- [/gateway/pairing](/gateway/pairing)
- [/gateway/authentication](/gateway/authentication)
- [/gateway/background-process](/gateway/background-process)
