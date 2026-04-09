---
title: "게이트웨이 로깅"
description: "로깅 표면, 파일 로그, WS 로그 스타일, 콘솔 형식"
---

# 로깅

사용자 대상 개요(CLI + Control UI + 구성)는 [/logging](/logging)을 참조하십시오.

OpenClaw에는 두 가지 로그 "표면"이 있습니다:

- **콘솔 출력** (터미널 / Debug UI에서 볼 수 있는 것).
- **파일 로그** (JSON 라인) 게이트웨이 로거에 의해 작성됨.

## 파일 기반 로거

- 기본 롤링 로그 파일은 `/tmp/openclaw/` 아래에 있습니다 (하루에 파일 하나): `openclaw-YYYY-MM-DD.log`
  - 날짜는 게이트웨이 호스트의 로컬 타임존을 사용합니다.
- 로그 파일 경로와 수준은 `~/.openclaw/openclaw.json`을 통해 구성할 수 있습니다:
  - `logging.file`
  - `logging.level`

파일 형식은 줄당 JSON 객체 하나입니다.

Control UI 로그 탭은 게이트웨이를 통해 이 파일을 tail합니다(`logs.tail`).
CLI도 동일하게 할 수 있습니다:

```bash
openclaw logs --follow
```

**Verbose vs. 로그 수준**

- **파일 로그**는 `logging.level`에 의해서만 제어됩니다.
- `--verbose`는 **콘솔 상세도**(및 WS 로그 스타일)에만 영향을 미칩니다; 파일 로그 수준을 올리지 **않습니다**.
- 파일 로그에서 verbose 전용 세부 정보를 캡처하려면 `logging.level`을 `debug` 또는 `trace`로 설정합니다.

## 콘솔 캡처

CLI는 `console.log/info/warn/error/debug/trace`를 캡처하여 파일 로그에 기록하고, stdout/stderr에도 인쇄합니다.

콘솔 상세도를 독립적으로 조정할 수 있습니다:

- `logging.consoleLevel` (기본값 `info`)
- `logging.consoleStyle` (`pretty` | `compact` | `json`)

## 도구 요약 편집

자세한 도구 요약(예: `🛠️ Exec: ...`)은 민감한 토큰을 콘솔 스트림에 전달하기 전에 마스킹할 수 있습니다. 이것은 **도구 전용**이며 파일 로그를 변경하지 않습니다.

- `logging.redactSensitive`: `off` | `tools` (기본값: `tools`)
- `logging.redactPatterns`: 정규식 문자열 배열 (기본값 재정의)
  - 원시 정규식 문자열(자동 `gi`) 또는 사용자 지정 플래그가 필요한 경우 `/pattern/flags`를 사용합니다.
  - 일치는 처음 6자 + 마지막 4자를 유지하여 마스킹합니다(길이 >= 18), 그렇지 않으면 `***`.
  - 기본값은 일반적인 키 할당, CLI 플래그, JSON 필드, bearer 헤더, PEM 블록, 인기 있는 토큰 접두사를 커버합니다.

## 게이트웨이 WebSocket 로그

게이트웨이는 두 가지 모드로 WebSocket 프로토콜 로그를 인쇄합니다:

- **일반 모드(`--verbose` 없음)**: "흥미로운" RPC 결과만 인쇄됩니다:
  - 오류 (`ok=false`)
  - 느린 호출 (기본 임계값: `>= 50ms`)
  - 파싱 오류
- **Verbose 모드(`--verbose`)**: 모든 WS 요청/응답 트래픽을 인쇄합니다.

### WS 로그 스타일

`openclaw gateway`는 게이트웨이별 스타일 스위치를 지원합니다:

- `--ws-log auto` (기본값): 일반 모드는 최적화됨; verbose 모드는 컴팩트 출력 사용
- `--ws-log compact`: verbose 시 컴팩트 출력 (짝을 이룬 요청/응답)
- `--ws-log full`: verbose 시 전체 프레임별 출력
- `--compact`: `--ws-log compact`의 별칭

예제:

```bash
# 최적화됨 (오류/느린 것만)
openclaw gateway

# 모든 WS 트래픽 표시 (짝을 이룸)
openclaw gateway --verbose --ws-log compact

# 모든 WS 트래픽 표시 (전체 메타)
openclaw gateway --verbose --ws-log full
```

## 콘솔 형식 (서브시스템 로깅)

콘솔 포매터는 **TTY 인식**이며 일관되고 접두사가 붙은 줄을 인쇄합니다.
서브시스템 로거는 출력을 그룹화하고 스캔 가능하게 유지합니다.

동작:

- 모든 줄에 **서브시스템 접두사** (예: `[gateway]`, `[canvas]`, `[tailscale]`)
- **서브시스템 색상** (서브시스템별 안정적) 플러스 수준 색상
- **TTY이거나 환경이 리치 터미널로 보일 때 색상** (`TERM`/`COLORTERM`/`TERM_PROGRAM`), `NO_COLOR` 준수
- **단축 서브시스템 접두사**: 선행 `gateway/` + `channels/` 제거, 마지막 2 세그먼트 유지 (예: `whatsapp/outbound`)
- **서브시스템별 서브 로거** (자동 접두사 + 구조화된 필드 `{ subsystem }`)
- **`logRaw()`** QR/UX 출력용 (접두사 없음, 형식 없음)
- **콘솔 스타일** (예: `pretty | compact | json`)
- **파일 로그 수준과 별개의 콘솔 로그 수준** (`logging.level`이 `debug`/`trace`로 설정된 경우 파일은 전체 세부 정보 유지)
- **WhatsApp 메시지 본문**은 `debug`에서 로깅됩니다 (보려면 `--verbose` 사용)

이는 기존 파일 로그를 안정적으로 유지하면서 인터랙티브 출력을 스캔 가능하게 합니다.
