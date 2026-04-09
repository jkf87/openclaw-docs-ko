---
title: "webhooks"
description: "`openclaw webhooks`에 대한 CLI 참조 (웹훅 도우미 + Gmail Pub/Sub)"
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

- `--account &lt;email&gt;`

옵션:

- `--project &lt;id&gt;`
- `--topic &lt;name&gt;`
- `--subscription &lt;name&gt;`
- `--label <label>`
- `--hook-url &lt;url&gt;`
- `--hook-token &lt;token&gt;`
- `--push-token &lt;token&gt;`
- `--bind &lt;host&gt;`
- `--port &lt;port&gt;`
- `--path &lt;path&gt;`
- `--include-body`
- `--max-bytes &lt;n&gt;`
- `--renew-minutes &lt;n&gt;`
- `--tailscale &lt;funnel|serve|off&gt;`
- `--tailscale-path &lt;path&gt;`
- `--tailscale-target &lt;target&gt;`
- `--push-endpoint &lt;url&gt;`
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

- `--account &lt;email&gt;`
- `--topic &lt;topic&gt;`
- `--subscription &lt;name&gt;`
- `--label <label>`
- `--hook-url &lt;url&gt;`
- `--hook-token &lt;token&gt;`
- `--push-token &lt;token&gt;`
- `--bind &lt;host&gt;`
- `--port &lt;port&gt;`
- `--path &lt;path&gt;`
- `--include-body`
- `--max-bytes &lt;n&gt;`
- `--renew-minutes &lt;n&gt;`
- `--tailscale &lt;funnel|serve|off&gt;`
- `--tailscale-path &lt;path&gt;`
- `--tailscale-target &lt;target&gt;`

예시:

```bash
openclaw webhooks gmail run --account you@example.com
```

엔드 투 엔드 설정 흐름 및 운영 세부 정보는 [Gmail Pub/Sub 문서](/automation/cron-jobs#gmail-pubsub-integration)를 참조하세요.
