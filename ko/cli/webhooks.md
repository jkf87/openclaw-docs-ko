---
summary: "`openclaw webhooks`에 대한 CLI 참조 (웹훅 도우미 + Gmail Pub/Sub)"
read_when:
  - Gmail Pub/Sub 이벤트를 OpenClaw로 연결하려는 경우
  - 웹훅 도우미 명령을 원하는 경우
title: "webhooks"
---

# `openclaw webhooks`

웹훅 도우미 및 통합 (Gmail Pub/Sub, 웹훅 도우미).

관련:

- 웹훅: [웹훅](/automation/cron-jobs#webhooks)
- Gmail Pub/Sub: [Gmail Pub/Sub](/automation/cron-jobs#gmail-pubsub-integration)

## Gmail

```bash
openclaw webhooks gmail setup --account you@example.com
openclaw webhooks gmail run
```

### `webhooks gmail setup`

Gmail watch, Pub/Sub, OpenClaw 웹훅 전달을 구성합니다.

필수:

- `--account <email>`

옵션:

- `--project <id>`
- `--topic <name>`
- `--subscription <name>`
- `--label <label>`
- `--hook-url <url>`
- `--hook-token <token>`
- `--push-token <token>`
- `--bind <host>`
- `--port <port>`
- `--path <path>`
- `--include-body`
- `--max-bytes <n>`
- `--renew-minutes <n>`
- `--tailscale <funnel|serve|off>`
- `--tailscale-path <path>`
- `--tailscale-target <target>`
- `--push-endpoint <url>`
- `--json`

예시:

```bash
openclaw webhooks gmail setup --account you@example.com
openclaw webhooks gmail setup --account you@example.com --project my-gcp-project --json
openclaw webhooks gmail setup --account you@example.com --hook-url https://gateway.example.com/hooks/gmail
```

### `webhooks gmail run`

`gog watch serve`와 watch 자동 갱신 루프를 실행합니다.

옵션:

- `--account <email>`
- `--topic <topic>`
- `--subscription <name>`
- `--label <label>`
- `--hook-url <url>`
- `--hook-token <token>`
- `--push-token <token>`
- `--bind <host>`
- `--port <port>`
- `--path <path>`
- `--include-body`
- `--max-bytes <n>`
- `--renew-minutes <n>`
- `--tailscale <funnel|serve|off>`
- `--tailscale-path <path>`
- `--tailscale-target <target>`

예시:

```bash
openclaw webhooks gmail run --account you@example.com
```

엔드 투 엔드 설정 흐름 및 운영 세부 정보는 [Gmail Pub/Sub 문서](/automation/cron-jobs#gmail-pubsub-integration)를 참조하세요.
