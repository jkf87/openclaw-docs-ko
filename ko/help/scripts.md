---
summary: "리포지토리 스크립트: 목적, 범위, 안전 참고 사항"
read_when:
  - Running scripts from the repo
  - Adding or changing scripts under ./scripts
title: "스크립트"
---

# 스크립트

`scripts/` 디렉토리에는 로컬 워크플로우 및 운영 작업을 위한 헬퍼 스크립트가 포함되어 있습니다.
작업이 스크립트와 명확히 연관된 경우에 사용하십시오. 그렇지 않은 경우 CLI를 사용하는 것이 좋습니다.

## 규칙

- 스크립트는 문서나 릴리스 체크리스트에서 참조되지 않는 한 **선택 사항**입니다.
- 가능한 경우 CLI 인터페이스를 사용하십시오 (예: 인증 모니터링은 `openclaw models status --check` 사용).
- 스크립트는 호스트별로 다를 수 있으므로 새 머신에서 실행하기 전에 먼저 읽어 보십시오.

## 인증 모니터링 스크립트

인증 모니터링은 [인증](/gateway/authentication)에서 다룹니다. `scripts/` 아래의 스크립트는 systemd/Termux 전화 워크플로우를 위한 선택적 추가 기능입니다.

## GitHub 읽기 헬퍼

일반적인 쓰기 작업에는 개인 로그인을 사용하는 `gh`를 남겨두면서 리포지토리 범위의 읽기 호출에 GitHub App 설치 토큰을 사용하려면 `scripts/gh-read`를 사용하십시오.

필수 환경 변수:

- `OPENCLAW_GH_READ_APP_ID`
- `OPENCLAW_GH_READ_PRIVATE_KEY_FILE`

선택적 환경 변수:

- `OPENCLAW_GH_READ_INSTALLATION_ID` — 리포지토리 기반 설치 조회를 건너뛰려는 경우
- `OPENCLAW_GH_READ_PERMISSIONS` — 요청할 읽기 권한 하위 집합의 쉼표 구분 재정의

리포지토리 확인 순서:

- `gh ... -R owner/repo`
- `GH_REPO`
- `git remote origin`

예시:

- `scripts/gh-read pr view 123`
- `scripts/gh-read run list -R openclaw/openclaw`
- `scripts/gh-read api repos/openclaw/openclaw/pulls/123`

## 스크립트 추가 시

- 스크립트를 집중적으로 작성하고 문서화하십시오.
- 관련 문서에 짧은 항목을 추가하십시오 (없으면 새로 만드십시오).
