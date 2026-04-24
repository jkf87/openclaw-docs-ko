---
summary: "버그 리포트를 위한 공유 가능한 Gateway diagnostics 번들 생성"
title: "Diagnostics export"
read_when:
  - 버그 리포트 또는 지원 요청을 준비할 때
  - Gateway 크래시, 재시작, 메모리 압박, 또는 과대 페이로드를 디버깅할 때
  - 어떤 diagnostics 데이터가 기록되거나 redact되는지 검토할 때
---

OpenClaw는 버그 리포트에 첨부해도 안전한 로컬 diagnostics zip을 생성할 수 있습니다.
이는 sanitize된 Gateway 상태, health, 로그, config 형태, 최근 페이로드 없는 stability
이벤트를 결합합니다.

## 빠른 시작

```bash
openclaw gateway diagnostics export
```

이 명령은 작성된 zip 경로를 출력합니다. 경로를 선택하려면:

```bash
openclaw gateway diagnostics export --output openclaw-diagnostics.zip
```

자동화용:

```bash
openclaw gateway diagnostics export --json
```

## Export에 포함되는 내용

zip은 다음을 포함합니다:

- `summary.md`: 지원팀을 위한 사람이 읽을 수 있는 개요.
- `diagnostics.json`: config, 로그, 상태, health, stability 데이터의
  기계 읽기 가능 요약.
- `manifest.json`: export 메타데이터 및 파일 목록.
- Sanitize된 config 형태 및 비시크릿 config 세부 정보.
- Sanitize된 로그 요약 및 최근 redact된 로그 라인.
- Best-effort Gateway 상태 및 health 스냅샷.
- `stability/latest.json`: 가용한 경우 가장 최신의 persist된 stability 번들.

Export는 Gateway가 비정상 상태일 때도 유용합니다. Gateway가 상태 또는 health
요청에 응답할 수 없는 경우에도, 가용한 경우 로컬 로그, config 형태, 최신
stability 번들이 여전히 수집됩니다.

## 프라이버시 모델

Diagnostics는 공유 가능하도록 설계되었습니다. Export는 디버깅에 도움이 되는
운영 데이터를 유지합니다. 예를 들어:

- 서브시스템 이름, 플러그인 id, provider id, 채널 id, 구성된 모드
- 상태 코드, 지속 시간, 바이트 수, 큐 상태, 메모리 리딩
- Sanitize된 로그 메타데이터 및 redact된 운영 메시지
- config 형태 및 비시크릿 기능 설정

Export는 다음을 생략하거나 redact합니다:

- 채팅 텍스트, 프롬프트, 지시문, webhook 본문, tool 출력
- 자격 증명, API 키, 토큰, 쿠키, 시크릿 값
- 원시 요청 또는 응답 본문
- 계정 id, 메시지 id, 원시 세션 id, 호스트명, 로컬 사용자명

로그 메시지가 사용자, 채팅, 프롬프트 또는 tool 페이로드 텍스트처럼 보이는 경우,
export는 메시지가 생략되었다는 사실과 바이트 수만 유지합니다.

## Stability 레코더

Gateway는 diagnostics가 활성화되어 있을 때 기본적으로 경계가 있는 페이로드 없는
stability 스트림을 기록합니다. 이는 콘텐츠가 아닌 운영 사실을 위한 것입니다.

라이브 레코더 검사:

```bash
openclaw gateway stability
openclaw gateway stability --type payload.large
openclaw gateway stability --json
```

치명적 종료, 셧다운 타임아웃, 또는 재시작 시작 실패 후 가장 최신의 persist된 stability
번들을 검사하려면:

```bash
openclaw gateway stability --bundle latest
```

가장 최신의 persist된 번들에서 diagnostics zip 생성:

```bash
openclaw gateway stability --bundle latest --export
```

Persist된 번들은 이벤트가 있을 때 `~/.openclaw/logs/stability/` 아래에 저장됩니다.

## 유용한 옵션

```bash
openclaw gateway diagnostics export \
  --output openclaw-diagnostics.zip \
  --log-lines 5000 \
  --log-bytes 1000000
```

- `--output <path>`: 특정 zip 경로에 기록합니다.
- `--log-lines <count>`: 포함할 최대 sanitize된 로그 라인 수.
- `--log-bytes <bytes>`: 검사할 최대 로그 바이트 수.
- `--url <url>`: 상태 및 health 스냅샷을 위한 Gateway WebSocket URL.
- `--token <token>`: 상태 및 health 스냅샷을 위한 Gateway 토큰.
- `--password <password>`: 상태 및 health 스냅샷을 위한 Gateway 비밀번호.
- `--timeout <ms>`: 상태 및 health 스냅샷 타임아웃.
- `--no-stability-bundle`: persist된 stability 번들 조회를 건너뜁니다.
- `--json`: 기계 읽기 가능 export 메타데이터를 출력합니다.

## Diagnostics 비활성화

Diagnostics는 기본적으로 활성화되어 있습니다. Stability 레코더 및 diagnostic
이벤트 수집을 비활성화하려면:

```json5
{
  diagnostics: {
    enabled: false,
  },
}
```

Diagnostics를 비활성화하면 버그 리포트 세부 정보가 감소합니다. 이는 일반적인
Gateway 로깅에는 영향을 주지 않습니다.

## 관련 문서

- [Health Checks](/gateway/health)
- [Gateway CLI](/cli/gateway#gateway-diagnostics-export)
- [Gateway Protocol](/gateway/protocol#system-and-identity)
- [Logging](/logging)
