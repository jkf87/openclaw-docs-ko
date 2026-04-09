---
summary: "`openclaw qr`에 대한 CLI 참조 (모바일 페어링 QR + 설정 코드 생성)"
read_when:
  - 모바일 노드 앱을 게이트웨이와 빠르게 페어링하려는 경우
  - 원격/수동 공유를 위한 설정 코드 출력이 필요한 경우
title: "qr"
---

# `openclaw qr`

현재 Gateway 구성에서 모바일 페어링 QR 및 설정 코드를 생성합니다.

## 사용법

```bash
openclaw qr
openclaw qr --setup-code-only
openclaw qr --json
openclaw qr --remote
openclaw qr --url wss://gateway.example/ws
```

## 옵션

- `--remote`: `gateway.remote.url`을 선호합니다; 설정되지 않은 경우 `gateway.tailscale.mode=serve|funnel`이 여전히 원격 공개 URL을 제공할 수 있습니다
- `--url <url>`: 페이로드에서 사용되는 게이트웨이 URL 재정의
- `--public-url <url>`: 페이로드에서 사용되는 공개 URL 재정의
- `--token <token>`: 부트스트랩 흐름이 인증하는 게이트웨이 토큰 재정의
- `--password <password>`: 부트스트랩 흐름이 인증하는 게이트웨이 비밀번호 재정의
- `--setup-code-only`: 설정 코드만 출력
- `--no-ascii`: ASCII QR 렌더링 건너뜀
- `--json`: JSON 출력 (`setupCode`, `gatewayUrl`, `auth`, `urlSource`)

## 참고사항

- `--token`과 `--password`는 상호 배타적입니다.
- 설정 코드 자체는 이제 공유된 게이트웨이 토큰/비밀번호가 아닌 불투명한 단기 `bootstrapToken`을 포함합니다.
- 내장 노드/운영자 부트스트랩 흐름에서 기본 노드 토큰은 여전히 `scopes: []`로 제공됩니다.
- 부트스트랩 핸드오프가 운영자 토큰도 발행하는 경우 부트스트랩 허용 목록으로 제한됩니다: `operator.approvals`, `operator.read`, `operator.talk.secrets`, `operator.write`.
- 부트스트랩 범위 확인은 역할이 접두사로 붙습니다. 해당 운영자 허용 목록은 운영자 요청만 충족시킵니다; 비운영자 역할은 여전히 자신의 역할 접두사 아래에서 범위가 필요합니다.
- 모바일 페어링은 Tailscale/공개 `ws://` 게이트웨이 URL에 대해 실패합니다. 사설 LAN `ws://`는 계속 지원되지만 Tailscale/공개 모바일 경로는 Tailscale Serve/Funnel 또는 `wss://` 게이트웨이 URL을 사용해야 합니다.
- `--remote`를 사용하면 OpenClaw는 `gateway.remote.url` 또는 `gateway.tailscale.mode=serve|funnel`이 필요합니다.
- `--remote`를 사용하면 활성화된 원격 자격 증명이 SecretRef로 구성되고 `--token` 또는 `--password`를 전달하지 않으면 명령이 활성 게이트웨이 스냅샷에서 이를 확인합니다. 게이트웨이를 사용할 수 없으면 명령이 빠르게 실패합니다.
- `--remote` 없이 CLI 인증 재정의가 전달되지 않으면 로컬 게이트웨이 인증 SecretRef가 확인됩니다:
  - `gateway.auth.token`은 토큰 인증이 이길 수 있을 때 확인됩니다 (명시적 `gateway.auth.mode="token"` 또는 비밀번호 소스가 이기지 않는 추론된 모드).
  - `gateway.auth.password`는 비밀번호 인증이 이길 수 있을 때 확인됩니다 (명시적 `gateway.auth.mode="password"` 또는 인증/환경에서 이기는 토큰이 없는 추론된 모드).
- `gateway.auth.token`과 `gateway.auth.password` (SecretRef 포함)가 모두 구성되고 `gateway.auth.mode`가 설정되지 않은 경우 모드가 명시적으로 설정될 때까지 설정 코드 확인이 실패합니다.
- 게이트웨이 버전 불일치 참고: 이 명령 경로는 `secrets.resolve`를 지원하는 게이트웨이가 필요합니다; 이전 게이트웨이는 알 수 없는 메서드 오류를 반환합니다.
- 스캔 후 다음을 통해 디바이스 페어링을 승인하세요:
  - `openclaw devices list`
  - `openclaw devices approve <requestId>`
