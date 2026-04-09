---
title: "tui"
description: "`openclaw tui`에 대한 CLI 참조 (Gateway에 연결된 터미널 UI)"
---

# `openclaw tui`

Gateway에 연결된 터미널 UI를 엽니다.

관련:

- TUI 가이드: [TUI](/web/tui)

참고사항:

- `tui`는 가능한 경우 토큰/비밀번호 인증을 위해 구성된 게이트웨이 인증 SecretRef를 확인합니다 (`env`/`file`/`exec` 프로바이더).
- 구성된 에이전트 워크스페이스 디렉터리 내에서 실행될 때 TUI는 세션 키 기본값에 대해 해당 에이전트를 자동 선택합니다 (`--session`이 명시적으로 `agent:&lt;id&gt;:...`가 아닌 경우).

## 예시

```bash
openclaw tui
openclaw tui --url ws://127.0.0.1:18789 --token &lt;token&gt;
openclaw tui --session main --deliver
# 에이전트 워크스페이스 내에서 실행할 때 해당 에이전트를 자동으로 추론
openclaw tui --session bugfix
```
