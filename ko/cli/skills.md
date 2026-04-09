---
summary: "`openclaw skills`에 대한 CLI 참조 (search/install/update/list/info/check)"
read_when:
  - 사용 가능하고 실행 준비된 스킬을 확인하려는 경우
  - ClawHub에서 스킬을 검색, 설치, 또는 업데이트하려는 경우
  - 스킬을 위한 누락된 바이너리/환경/구성을 디버깅하려는 경우
title: "skills"
---

# `openclaw skills`

로컬 스킬을 검사하고 ClawHub에서 스킬을 설치/업데이트합니다.

관련:

- 스킬 시스템: [스킬](/tools/skills)
- 스킬 구성: [스킬 구성](/tools/skills-config)
- ClawHub 설치: [ClawHub](/tools/clawhub)

## 명령

```bash
openclaw skills search "calendar"
openclaw skills search --limit 20 --json
openclaw skills install <slug>
openclaw skills install <slug> --version <version>
openclaw skills install <slug> --force
openclaw skills update <slug>
openclaw skills update --all
openclaw skills list
openclaw skills list --eligible
openclaw skills list --json
openclaw skills list --verbose
openclaw skills info <name>
openclaw skills info <name> --json
openclaw skills check
openclaw skills check --json
```

`search`/`install`/`update`는 ClawHub를 직접 사용하고 활성 워크스페이스 `skills/` 디렉터리에 설치합니다. `list`/`info`/`check`는 현재 워크스페이스 및 구성에서 보이는 로컬 스킬을 검사합니다.

이 CLI `install` 명령은 ClawHub에서 스킬 폴더를 다운로드합니다. 온보딩 또는 스킬 설정에서 트리거된 게이트웨이 백업 스킬 의존성 설치는 별도의 `skills.install` 요청 경로를 대신 사용합니다.

참고사항:

- `search [query...]`는 선택적 쿼리를 허용합니다; 기본 ClawHub 검색 피드를 탐색하려면 생략하세요.
- `search --limit <n>`은 반환되는 결과를 제한합니다.
- `install --force`는 동일한 슬러그에 대한 기존 워크스페이스 스킬 폴더를 덮어씁니다.
- `update --all`은 활성 워크스페이스에서 추적된 ClawHub 설치만 업데이트합니다.
- `list`는 하위 명령이 제공되지 않을 때 기본 액션입니다.
- `list`, `info`, `check`는 렌더링된 출력을 stdout에 씁니다. `--json`을 사용하면 기계 판독 가능한 페이로드가 파이프 및 스크립트를 위해 stdout에 유지됩니다.
