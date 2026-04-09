---
summary: "`openclaw reset`에 대한 CLI 참조 (로컬 상태/구성 초기화)"
read_when:
  - CLI가 설치된 상태로 로컬 상태를 지우려는 경우
  - 제거될 항목의 드라이 런을 원하는 경우
title: "reset"
---

# `openclaw reset`

로컬 구성/상태를 초기화합니다 (CLI는 설치된 상태 유지).

옵션:

- `--scope <scope>`: `config`, `config+creds+sessions`, 또는 `full`
- `--yes`: 확인 프롬프트 건너뜀
- `--non-interactive`: 프롬프트 비활성화; `--scope`와 `--yes`가 필요
- `--dry-run`: 파일을 제거하지 않고 액션 출력

예시:

```bash
openclaw backup create
openclaw reset
openclaw reset --dry-run
openclaw reset --scope config --yes --non-interactive
openclaw reset --scope config+creds+sessions --yes --non-interactive
openclaw reset --scope full --yes --non-interactive
```

참고사항:

- 로컬 상태를 제거하기 전에 복원 가능한 스냅샷을 원하면 먼저 `openclaw backup create`를 실행하세요.
- `--scope`를 생략하면 `openclaw reset`은 인터랙티브 프롬프트를 사용하여 제거할 항목을 선택합니다.
- `--non-interactive`는 `--scope`와 `--yes`가 모두 설정된 경우에만 유효합니다.
