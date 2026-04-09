---
title: "헬스 체크"
description: "헬스 체크 명령 및 게이트웨이 헬스 모니터링"
---

# 헬스 체크 (CLI)

추측 없이 채널 연결을 확인하기 위한 간단한 가이드입니다.

## 빠른 체크

- `openclaw status` — 로컬 요약: 게이트웨이 연결 가능성/모드, 업데이트 힌트, 연결된 채널 인증 나이, 세션 + 최근 활동.
- `openclaw status --all` — 전체 로컬 진단 (읽기 전용, 색상, 디버깅을 위해 붙여넣기 안전).
- `openclaw status --deep` — 실행 중인 게이트웨이에 라이브 헬스 프로브(`probe:true`를 포함한 `health`)를 요청합니다. 지원되는 경우 계정별 채널 프로브 포함.
- `openclaw health` — 실행 중인 게이트웨이에 헬스 스냅샷을 요청합니다 (WS 전용; CLI에서 직접 채널 소켓 없음).
- `openclaw health --verbose` — 라이브 헬스 프로브를 강제하고 게이트웨이 연결 세부 사항을 인쇄합니다.
- `openclaw health --json` — 기계 가독 헬스 스냅샷 출력.
- 에이전트를 호출하지 않고 상태 응답을 받으려면 WhatsApp/WebChat에서 `/status`를 독립 메시지로 전송합니다.
- 로그: `/tmp/openclaw/openclaw-*.log`를 tail하고 `web-heartbeat`, `web-reconnect`, `web-auto-reply`, `web-inbound`를 필터링합니다.

## 심층 진단

- 디스크의 자격 증명: `ls -l ~/.openclaw/credentials/whatsapp/&lt;accountId&gt;/creds.json` (mtime이 최근이어야 함).
- 세션 스토어: `ls -l ~/.openclaw/agents/&lt;agentId&gt;/sessions/sessions.json`. 수 및 최근 수신자는 `status`를 통해 표면화됩니다.
- 재연결 흐름: 로그에 상태 코드 409–515 또는 `loggedOut`이 나타날 때 `openclaw channels logout && openclaw channels login --verbose`. (참고: QR 로그인 흐름은 페어링 후 상태 515에 대해 한 번 자동 재시작됩니다.)

## 헬스 모니터 구성

- `gateway.channelHealthCheckMinutes`: 게이트웨이가 채널 헬스를 체크하는 빈도. 기본값: `5`. 전역적으로 헬스 모니터 재시작을 비활성화하려면 `0`으로 설정.
- `gateway.channelStaleEventThresholdMinutes`: 연결된 채널이 헬스 모니터가 오래된 것으로 처리하고 재시작하기 전에 유휴 상태를 유지할 수 있는 기간. 기본값: `30`. `gateway.channelHealthCheckMinutes` 이상으로 유지하십시오.
- `gateway.channelMaxRestartsPerHour`: 채널/계정별 헬스 모니터 재시작에 대한 롤링 1시간 상한. 기본값: `10`.
- `channels.&lt;provider&gt;.healthMonitor.enabled`: 전역 모니터링을 활성화한 상태에서 특정 채널에 대한 헬스 모니터 재시작 비활성화.
- `channels.&lt;provider&gt;.accounts.&lt;accountId&gt;.healthMonitor.enabled`: 채널 수준 설정보다 우선하는 멀티 계정 재정의.
- 이러한 채널별 재정의는 오늘날 이를 노출하는 내장 채널 모니터에 적용됩니다: Discord, Google Chat, iMessage, Microsoft Teams, Signal, Slack, Telegram, WhatsApp.

## 문제 발생 시

- `logged out` 또는 상태 409–515 → `openclaw channels logout` 후 `openclaw channels login`으로 재연결.
- 게이트웨이 연결 불가 → 시작: `openclaw gateway --port 18789` (포트가 사용 중이면 `--force` 사용).
- 인바운드 메시지 없음 → 연결된 전화기가 온라인 상태이고 발신자가 허용되는지 확인 (`channels.whatsapp.allowFrom`); 그룹 채팅의 경우 허용 목록 + 언급 규칙이 일치하는지 확인 (`channels.whatsapp.groups`, `agents.list[].groupChat.mentionPatterns`).

## 전용 "health" 명령

`openclaw health`는 실행 중인 게이트웨이에 헬스 스냅샷을 요청합니다 (CLI에서 직접 채널 소켓 없음). 기본적으로 신선한 캐시된 게이트웨이 스냅샷을 반환할 수 있습니다; 그런 다음 게이트웨이는 백그라운드에서 해당 캐시를 새로 고칩니다. `openclaw health --verbose`는 라이브 프로브를 강제합니다. 이 명령은 연결된 자격 증명/인증 나이, 채널별 프로브 요약, 세션 스토어 요약, 프로브 기간을 보고합니다. 게이트웨이에 연결할 수 없거나 프로브가 실패/타임아웃되면 0이 아닌 값으로 종료됩니다.

옵션:

- `--json`: 기계 가독 JSON 출력
- `--timeout &lt;ms&gt;`: 기본 10초 프로브 타임아웃 재정의
- `--verbose`: 라이브 프로브를 강제하고 게이트웨이 연결 세부 사항 인쇄
- `--debug`: `--verbose`의 별칭

헬스 스냅샷에는 `ok` (불리언), `ts` (타임스탬프), `durationMs` (프로브 시간), 채널별 상태, 에이전트 가용성, 세션 스토어 요약이 포함됩니다.
