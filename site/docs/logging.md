---
title: "로깅 개요"
description: "로깅 개요: 파일 로그, 콘솔 출력, CLI 테일링, Control UI"
---

# 로깅

OpenClaw에는 두 가지 주요 로그 서피스가 있습니다:

- **파일 로그** (JSON 라인): 게이트웨이에 의해 기록됩니다.
- **콘솔 출력**: 터미널 및 게이트웨이 디버그 UI에 표시됩니다.

Control UI의 **Logs** 탭은 게이트웨이 파일 로그를 테일합니다. 이 페이지에서는 로그가 어디에 있는지, 어떻게 읽는지, 로그 레벨과 형식을 구성하는 방법을 설명합니다.

## 로그 위치

기본적으로 게이트웨이는 다음 경로에 롤링 로그 파일을 기록합니다:

`/tmp/openclaw/openclaw-YYYY-MM-DD.log`

날짜는 게이트웨이 호스트의 로컬 시간대를 사용합니다.

`~/.openclaw/openclaw.json`에서 재정의할 수 있습니다:

```json
{
  "logging": {
    "file": "/path/to/openclaw.log"
  }
}
```

## 로그 읽는 방법

### CLI: 라이브 테일 (권장)

CLI를 사용하여 RPC를 통해 게이트웨이 로그 파일을 테일하십시오:

```bash
openclaw logs --follow
```

유용한 현재 옵션:

- `--local-time`: 로컬 시간대로 타임스탬프 렌더링
- `--url &lt;url&gt;` / `--token &lt;token&gt;` / `--timeout &lt;ms&gt;`: 표준 게이트웨이 RPC 플래그
- `--expect-final`: 에이전트 기반 RPC 최종 응답 대기 플래그 (공유 클라이언트 레이어를 통해 여기서 허용)

출력 모드:

- **TTY 세션**: 예쁘고 색상화된 구조적 로그 라인.
- **비 TTY 세션**: 일반 텍스트.
- `--json`: 라인 구분 JSON (라인당 하나의 로그 이벤트).
- `--plain`: TTY 세션에서 일반 텍스트 강제.
- `--no-color`: ANSI 색상 비활성화.

명시적 `--url`을 전달하면 CLI는 구성이나 환경 자격 증명을 자동 적용하지 않습니다. 대상 게이트웨이에 인증이 필요한 경우 `--token`을 직접 포함하십시오.

JSON 모드에서 CLI는 `type` 태그가 붙은 객체를 내보냅니다:

- `meta`: 스트림 메타데이터 (파일, 커서, 크기)
- `log`: 파싱된 로그 항목
- `notice`: 잘림/순환 힌트
- `raw`: 파싱되지 않은 로그 라인

로컬 루프백 게이트웨이가 페어링을 요청하는 경우, `openclaw logs`는 구성된 로컬 로그 파일로 자동으로 폴백합니다. 명시적 `--url` 대상은 이 폴백을 사용하지 않습니다.

게이트웨이에 연결할 수 없는 경우 CLI는 다음을 실행하라는 짧은 힌트를 출력합니다:

```bash
openclaw doctor
```

### Control UI (웹)

Control UI의 **Logs** 탭은 `logs.tail`을 사용하여 동일한 파일을 테일합니다.
여는 방법은 [/web/control-ui](/web/control-ui)를 참조하십시오.

### 채널 전용 로그

채널 활동(WhatsApp/Telegram/등)을 필터링하려면 다음을 사용하십시오:

```bash
openclaw channels logs --channel whatsapp
```

## 로그 형식

### 파일 로그 (JSONL)

로그 파일의 각 줄은 JSON 객체입니다. CLI와 Control UI는 이러한 항목을 파싱하여 구조적 출력(시간, 레벨, 서브시스템, 메시지)을 렌더링합니다.

### 콘솔 출력

콘솔 로그는 **TTY 인식**이며 가독성을 위해 형식화됩니다:

- 서브시스템 접두사 (예: `gateway/channels/whatsapp`)
- 레벨 색상 (info/warn/error)
- 선택적 컴팩트 또는 JSON 모드

콘솔 형식화는 `logging.consoleStyle`로 제어됩니다.

### 게이트웨이 WebSocket 로그

`openclaw gateway`에는 RPC 트래픽에 대한 WebSocket 프로토콜 로깅도 있습니다:

- 일반 모드: 흥미로운 결과만 (오류, 파싱 오류, 느린 호출)
- `--verbose`: 모든 요청/응답 트래픽
- `--ws-log auto|compact|full`: 자세한 렌더링 스타일 선택
- `--compact`: `--ws-log compact`의 별칭

예시:

```bash
openclaw gateway
openclaw gateway --verbose --ws-log compact
openclaw gateway --verbose --ws-log full
```

## 로깅 구성

모든 로깅 구성은 `~/.openclaw/openclaw.json`의 `logging` 아래에 있습니다.

```json
{
  "logging": {
    "level": "info",
    "file": "/tmp/openclaw/openclaw-YYYY-MM-DD.log",
    "consoleLevel": "info",
    "consoleStyle": "pretty",
    "redactSensitive": "tools",
    "redactPatterns": ["sk-.*"]
  }
}
```

### 로그 레벨

- `logging.level`: **파일 로그** (JSONL) 레벨.
- `logging.consoleLevel`: **콘솔** 상세 수준.

**`OPENCLAW_LOG_LEVEL`** 환경 변수(예: `OPENCLAW_LOG_LEVEL=debug`)로 두 가지를 모두 재정의할 수 있습니다. 환경 변수는 구성 파일보다 우선하므로 `openclaw.json`을 편집하지 않고도 단일 실행의 상세 수준을 높일 수 있습니다. 전역 CLI 옵션 **`--log-level &lt;level&gt;`**(예: `openclaw --log-level debug gateway run`)을 전달할 수도 있으며, 이는 해당 명령어에 대해 환경 변수를 재정의합니다.

`--verbose`는 콘솔 출력과 WS 로그 상세 수준에만 영향을 미치며, 파일 로그 레벨은 변경하지 않습니다.

### 콘솔 스타일

`logging.consoleStyle`:

- `pretty`: 타임스탬프가 있는 사람 친화적, 색상화.
- `compact`: 더 압축된 출력 (긴 세션에 적합).
- `json`: 라인당 JSON (로그 프로세서용).

### 리댁션

도구 요약은 민감한 토큰이 콘솔에 도달하기 전에 리댁션할 수 있습니다:

- `logging.redactSensitive`: `off` | `tools` (기본값: `tools`)
- `logging.redactPatterns`: 기본 집합을 재정의하기 위한 정규식 문자열 목록

리댁션은 **콘솔 출력에만** 영향을 미치며 파일 로그는 변경하지 않습니다.

## 진단 + OpenTelemetry

진단은 모델 실행 **및** 메시지 플로 텔레메트리(웹훅, 큐잉, 세션 상태)를 위한 구조화되고 기계가 읽을 수 있는 이벤트입니다. 로그를 대체하지 않으며, 메트릭, 추적 및 기타 내보내기 도구에 공급하기 위해 존재합니다.

진단 이벤트는 인프로세스로 내보내지지만, 내보내기 도구는 진단 + 내보내기 플러그인이 활성화된 경우에만 연결됩니다.

### OpenTelemetry 대 OTLP

- **OpenTelemetry (OTel)**: 추적, 메트릭, 로그를 위한 데이터 모델 + SDK.
- **OTLP**: OTel 데이터를 수집기/백엔드로 내보내는 데 사용되는 와이어 프로토콜.
- OpenClaw는 현재 **OTLP/HTTP (protobuf)**를 통해 내보냅니다.

### 내보내는 신호

- **메트릭**: 카운터 + 히스토그램 (토큰 사용량, 메시지 플로, 큐잉).
- **추적**: 모델 사용량 + 웹훅/메시지 처리를 위한 스팬.
- **로그**: `diagnostics.otel.logs`가 활성화된 경우 OTLP를 통해 내보냅니다. 로그 볼륨이 높을 수 있으므로 `logging.level` 및 내보내기 필터에 유의하십시오.

### 진단 이벤트 카탈로그

모델 사용량:

- `model.usage`: 토큰, 비용, 지속 시간, 컨텍스트, 프로바이더/모델/채널, 세션 id.

메시지 플로:

- `webhook.received`: 채널별 웹훅 인그레스.
- `webhook.processed`: 웹훅 처리됨 + 지속 시간.
- `webhook.error`: 웹훅 핸들러 오류.
- `message.queued`: 처리를 위해 큐에 추가된 메시지.
- `message.processed`: 결과 + 지속 시간 + 선택적 오류.

큐 + 세션:

- `queue.lane.enqueue`: 커맨드 큐 레인 큐에 추가 + 깊이.
- `queue.lane.dequeue`: 커맨드 큐 레인 큐에서 제거 + 대기 시간.
- `session.state`: 세션 상태 전환 + 이유.
- `session.stuck`: 세션 고착 경고 + 연령.
- `run.attempt`: 실행 재시도/시도 메타데이터.
- `diagnostic.heartbeat`: 집계 카운터 (웹훅/큐/세션).

### 진단 활성화 (내보내기 없이)

플러그인이나 커스텀 싱크에서 진단 이벤트를 사용 가능하게 하려면 다음을 사용하십시오:

```json
{
  "diagnostics": {
    "enabled": true
  }
}
```

### 진단 플래그 (대상 로그)

`logging.level`을 높이지 않고도 추가적인 대상 디버그 로그를 켜는 데 플래그를 사용하십시오.
플래그는 대소문자를 구분하지 않으며 와일드카드를 지원합니다(예: `telegram.*` 또는 `*`).

```json
{
  "diagnostics": {
    "flags": ["telegram.http"]
  }
}
```

환경 재정의 (일회성):

```
OPENCLAW_DIAGNOSTICS=telegram.http,telegram.payload
```

참고:

- 플래그 로그는 표준 로그 파일(`logging.file`과 동일)로 이동합니다.
- 출력은 `logging.redactSensitive`에 따라 여전히 리댁션됩니다.
- 전체 가이드: [/diagnostics/flags](/diagnostics/flags).

### OpenTelemetry로 내보내기

진단은 `diagnostics-otel` 플러그인(OTLP/HTTP)을 통해 내보낼 수 있습니다. 이는 OTLP/HTTP를 허용하는 모든 OpenTelemetry 수집기/백엔드와 함께 작동합니다.

```json
{
  "plugins": {
    "allow": ["diagnostics-otel"],
    "entries": {
      "diagnostics-otel": {
        "enabled": true
      }
    }
  },
  "diagnostics": {
    "enabled": true,
    "otel": {
      "enabled": true,
      "endpoint": "http://otel-collector:4318",
      "protocol": "http/protobuf",
      "serviceName": "openclaw-gateway",
      "traces": true,
      "metrics": true,
      "logs": true,
      "sampleRate": 0.2,
      "flushIntervalMs": 60000
    }
  }
}
```

참고:

- `openclaw plugins enable diagnostics-otel`로도 플러그인을 활성화할 수 있습니다.
- `protocol`은 현재 `http/protobuf`만 지원합니다. `grpc`는 무시됩니다.
- 메트릭에는 토큰 사용량, 비용, 컨텍스트 크기, 실행 지속 시간, 메시지 플로 카운터/히스토그램(웹훅, 큐잉, 세션 상태, 큐 깊이/대기)이 포함됩니다.
- 추적/메트릭은 `traces` / `metrics`로 토글할 수 있습니다(기본값: on). 추적에는 활성화 시 모델 사용량 스팬과 웹훅/메시지 처리 스팬이 포함됩니다.
- 수집기에 인증이 필요한 경우 `headers`를 설정하십시오.
- 지원되는 환경 변수: `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_PROTOCOL`.

### 내보낸 메트릭 (이름 + 타입)

모델 사용량:

- `openclaw.tokens` (카운터, 속성: `openclaw.token`, `openclaw.channel`, `openclaw.provider`, `openclaw.model`)
- `openclaw.cost.usd` (카운터, 속성: `openclaw.channel`, `openclaw.provider`, `openclaw.model`)
- `openclaw.run.duration_ms` (히스토그램, 속성: `openclaw.channel`, `openclaw.provider`, `openclaw.model`)
- `openclaw.context.tokens` (히스토그램, 속성: `openclaw.context`, `openclaw.channel`, `openclaw.provider`, `openclaw.model`)

메시지 플로:

- `openclaw.webhook.received` (카운터, 속성: `openclaw.channel`, `openclaw.webhook`)
- `openclaw.webhook.error` (카운터, 속성: `openclaw.channel`, `openclaw.webhook`)
- `openclaw.webhook.duration_ms` (히스토그램, 속성: `openclaw.channel`, `openclaw.webhook`)
- `openclaw.message.queued` (카운터, 속성: `openclaw.channel`, `openclaw.source`)
- `openclaw.message.processed` (카운터, 속성: `openclaw.channel`, `openclaw.outcome`)
- `openclaw.message.duration_ms` (히스토그램, 속성: `openclaw.channel`, `openclaw.outcome`)

큐 + 세션:

- `openclaw.queue.lane.enqueue` (카운터, 속성: `openclaw.lane`)
- `openclaw.queue.lane.dequeue` (카운터, 속성: `openclaw.lane`)
- `openclaw.queue.depth` (히스토그램, 속성: `openclaw.lane` 또는 `openclaw.channel=heartbeat`)
- `openclaw.queue.wait_ms` (히스토그램, 속성: `openclaw.lane`)
- `openclaw.session.state` (카운터, 속성: `openclaw.state`, `openclaw.reason`)
- `openclaw.session.stuck` (카운터, 속성: `openclaw.state`)
- `openclaw.session.stuck_age_ms` (히스토그램, 속성: `openclaw.state`)
- `openclaw.run.attempt` (카운터, 속성: `openclaw.attempt`)

### 내보낸 스팬 (이름 + 주요 속성)

- `openclaw.model.usage`
  - `openclaw.channel`, `openclaw.provider`, `openclaw.model`
  - `openclaw.sessionKey`, `openclaw.sessionId`
  - `openclaw.tokens.*` (input/output/cache_read/cache_write/total)
- `openclaw.webhook.processed`
  - `openclaw.channel`, `openclaw.webhook`, `openclaw.chatId`
- `openclaw.webhook.error`
  - `openclaw.channel`, `openclaw.webhook`, `openclaw.chatId`, `openclaw.error`
- `openclaw.message.processed`
  - `openclaw.channel`, `openclaw.outcome`, `openclaw.chatId`, `openclaw.messageId`, `openclaw.sessionKey`, `openclaw.sessionId`, `openclaw.reason`
- `openclaw.session.stuck`
  - `openclaw.state`, `openclaw.ageMs`, `openclaw.queueDepth`, `openclaw.sessionKey`, `openclaw.sessionId`

### 샘플링 + 플러싱

- 추적 샘플링: `diagnostics.otel.sampleRate` (0.0–1.0, 루트 스팬만).
- 메트릭 내보내기 간격: `diagnostics.otel.flushIntervalMs` (최소 1000ms).

### 프로토콜 참고

- OTLP/HTTP 엔드포인트는 `diagnostics.otel.endpoint` 또는 `OTEL_EXPORTER_OTLP_ENDPOINT`를 통해 설정할 수 있습니다.
- 엔드포인트에 이미 `/v1/traces` 또는 `/v1/metrics`가 포함된 경우 그대로 사용됩니다.
- 엔드포인트에 이미 `/v1/logs`가 포함된 경우 로그에 그대로 사용됩니다.
- `diagnostics.otel.logs`는 메인 로거 출력에 대한 OTLP 로그 내보내기를 활성화합니다.

### 로그 내보내기 동작

- OTLP 로그는 `logging.file`에 기록된 것과 동일한 구조적 레코드를 사용합니다.
- `logging.level`(파일 로그 레벨)을 준수합니다. 콘솔 리댁션은 OTLP 로그에 **적용되지 않습니다**.
- 대용량 설치에서는 OTLP 수집기 샘플링/필터링을 선호하십시오.

## 문제 해결 팁

- **게이트웨이에 연결할 수 없습니까?** 먼저 `openclaw doctor`를 실행하십시오.
- **로그가 비어 있습니까?** 게이트웨이가 실행 중이고 `logging.file`의 파일 경로에 기록 중인지 확인하십시오.
- **더 많은 세부 정보가 필요합니까?** `logging.level`을 `debug` 또는 `trace`로 설정하고 다시 시도하십시오.

## 관련 항목

- [게이트웨이 로깅 내부](/gateway/logging) — WS 로그 스타일, 서브시스템 접두사, 콘솔 캡처
- [진단](/gateway/configuration-reference#diagnostics) — OpenTelemetry 내보내기 및 캐시 추적 구성
