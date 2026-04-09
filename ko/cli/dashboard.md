---
summary: "`openclaw dashboard`에 대한 CLI 참조 (Control UI 열기)"
read_when:
  - 현재 토큰으로 Control UI를 열려는 경우
  - 브라우저를 실행하지 않고 URL을 출력하려는 경우
title: "dashboard"
---

# `openclaw dashboard`

현재 인증을 사용하여 Control UI를 엽니다.

```bash
openclaw dashboard
openclaw dashboard --no-open
```

참고사항:

- `dashboard`는 가능한 경우 구성된 `gateway.auth.token` SecretRef를 확인합니다.
- SecretRef 관리 토큰 (확인됨 또는 미확인됨)의 경우 `dashboard`는 터미널 출력, 클립보드 기록, 브라우저 실행 인수에서 외부 비밀이 노출되는 것을 방지하기 위해 토큰이 없는 URL을 출력/복사/엽니다.
- 이 명령 경로에서 `gateway.auth.token`이 SecretRef 관리이지만 확인되지 않은 경우 명령은 잘못된 토큰 자리 표시자를 포함하는 대신 토큰이 없는 URL과 명시적인 해결 안내를 출력합니다.
