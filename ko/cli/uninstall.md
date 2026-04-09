---
summary: "`openclaw uninstall`에 대한 CLI 참조 (게이트웨이 서비스 + 로컬 데이터 제거)"
read_when:
  - 게이트웨이 서비스 및/또는 로컬 상태를 제거하려는 경우
  - 먼저 드라이 런을 원하는 경우
title: "uninstall"
---

# `openclaw uninstall`

게이트웨이 서비스 + 로컬 데이터를 제거합니다 (CLI는 유지됨).

옵션:

- `--service`: 게이트웨이 서비스 제거
- `--state`: 상태 및 구성 제거
- `--workspace`: 워크스페이스 디렉터리 제거
- `--app`: macOS 앱 제거
- `--all`: 서비스, 상태, 워크스페이스, 앱 제거
- `--yes`: 확인 프롬프트 건너뜀
- `--non-interactive`: 프롬프트 비활성화; `--yes` 필요
- `--dry-run`: 파일을 제거하지 않고 액션 출력

예시:

```bash
openclaw backup create
openclaw uninstall
openclaw uninstall --service --yes --non-interactive
openclaw uninstall --state --workspace --yes --non-interactive
openclaw uninstall --all --yes
openclaw uninstall --dry-run
```

참고사항:

- 상태 또는 워크스페이스를 제거하기 전에 복원 가능한 스냅샷을 원하면 먼저 `openclaw backup create`를 실행하세요.
- `--all`은 서비스, 상태, 워크스페이스, 앱을 함께 제거하는 단축키입니다.
- `--non-interactive`는 `--yes`가 필요합니다.
