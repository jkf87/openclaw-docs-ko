---
summary: "`openclaw setup`에 대한 CLI 참조 (구성 + 워크스페이스 초기화)"
read_when:
  - 전체 CLI 온보딩 없이 최초 실행 설정을 하는 경우
  - 기본 워크스페이스 경로를 설정하려는 경우
title: "setup"
---

# `openclaw setup`

`~/.openclaw/openclaw.json`과 에이전트 워크스페이스를 초기화합니다.

관련:

- 시작하기: [시작하기](/start/getting-started)
- CLI 온보딩: [온보딩 (CLI)](/start/wizard)

## 예시

```bash
openclaw setup
openclaw setup --workspace ~/.openclaw/workspace
openclaw setup --wizard
openclaw setup --non-interactive --mode remote --remote-url wss://gateway-host:18789 --remote-token <token>
```

## 옵션

- `--workspace <dir>`: 에이전트 워크스페이스 디렉터리 (`agents.defaults.workspace`로 저장됨)
- `--wizard`: 온보딩 실행
- `--non-interactive`: 프롬프트 없이 온보딩 실행
- `--mode <local|remote>`: 온보딩 모드
- `--remote-url <url>`: 원격 Gateway WebSocket URL
- `--remote-token <token>`: 원격 Gateway 토큰

설정을 통해 온보딩을 실행하려면:

```bash
openclaw setup --wizard
```

참고사항:

- 일반 `openclaw setup`은 전체 온보딩 흐름 없이 구성 + 워크스페이스를 초기화합니다.
- 온보딩 플래그가 있으면 온보딩이 자동으로 실행됩니다 (`--wizard`, `--non-interactive`, `--mode`, `--remote-url`, `--remote-token`).
