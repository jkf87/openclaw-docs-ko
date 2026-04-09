---
summary: "`openclaw logs`에 대한 CLI 참조 (RPC를 통한 게이트웨이 로그 테일링)"
read_when:
  - SSH 없이 원격으로 Gateway 로그를 테일링해야 하는 경우
  - 도구를 위한 JSON 로그 라인이 필요한 경우
title: "logs"
---

# `openclaw logs`

RPC를 통해 Gateway 파일 로그를 테일링합니다 (원격 모드에서 작동).

관련:

- 로깅 개요: [로깅](/logging)
- Gateway CLI: [gateway](/cli/gateway)

## 옵션

- `--limit <n>`: 반환할 최대 로그 라인 수 (기본값 `200`)
- `--max-bytes <n>`: 로그 파일에서 읽을 최대 바이트 (기본값 `250000`)
- `--follow`: 로그 스트림 팔로우
- `--interval <ms>`: 팔로우 중 폴링 간격 (기본값 `1000`)
- `--json`: 라인 구분 JSON 이벤트 출력
- `--plain`: 스타일 없는 일반 텍스트 출력
- `--no-color`: ANSI 색상 비활성화
- `--local-time`: 로컬 타임존으로 타임스탬프 렌더링

## 공유 게이트웨이 RPC 옵션

`openclaw logs`는 표준 Gateway 클라이언트 플래그도 허용합니다:

- `--url <url>`: Gateway WebSocket URL
- `--token <token>`: Gateway 토큰
- `--timeout <ms>`: 타임아웃 (밀리초) (기본값 `30000`)
- `--expect-final`: Gateway 호출이 에이전트 기반일 때 최종 응답 대기

`--url`을 전달하면 CLI는 구성 또는 환경 자격 증명을 자동 적용하지 않습니다. 대상 Gateway가 인증을 요구하는 경우 `--token`을 명시적으로 포함하세요.

## 예시

```bash
openclaw logs
openclaw logs --follow
openclaw logs --follow --interval 2000
openclaw logs --limit 500 --max-bytes 500000
openclaw logs --json
openclaw logs --plain
openclaw logs --no-color
openclaw logs --limit 500
openclaw logs --local-time
openclaw logs --follow --local-time
openclaw logs --url ws://127.0.0.1:18789 --token "$OPENCLAW_GATEWAY_TOKEN"
```

## 참고사항

- `--local-time`을 사용하여 로컬 타임존으로 타임스탬프를 렌더링하세요.
- 로컬 루프백 Gateway가 페어링을 요청하는 경우, `openclaw logs`는 자동으로 구성된 로컬 로그 파일로 폴백합니다. 명시적 `--url` 대상은 이 폴백을 사용하지 않습니다.
