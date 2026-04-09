---
summary: "`openclaw update`에 대한 CLI 참조 (안전한 소스 업데이트 + 게이트웨이 자동 재시작)"
read_when:
  - 소스 체크아웃을 안전하게 업데이트하려는 경우
  - `--update` 단축키 동작을 이해해야 하는 경우
title: "update"
---

# `openclaw update`

OpenClaw를 안전하게 업데이트하고 stable/beta/dev 채널 간에 전환합니다.

**npm/pnpm/bun**으로 설치한 경우 (git 메타데이터 없는 전역 설치),
업데이트는 [업데이트](/install/updating)의 패키지 관리자 흐름을 통해 이루어집니다.

## 사용법

```bash
openclaw update
openclaw update status
openclaw update wizard
openclaw update --channel beta
openclaw update --channel dev
openclaw update --tag beta
openclaw update --tag main
openclaw update --dry-run
openclaw update --no-restart
openclaw update --yes
openclaw update --json
openclaw --update
```

## 옵션

- `--no-restart`: 성공적인 업데이트 후 Gateway 서비스 재시작 건너뜀.
- `--channel <stable|beta|dev>`: 업데이트 채널 설정 (git + npm; 구성에 유지됨).
- `--tag <dist-tag|version|spec>`: 이 업데이트에만 패키지 대상을 재정의합니다. 패키지 설치의 경우 `main`은 `github:openclaw/openclaw#main`으로 매핑됩니다.
- `--dry-run`: 구성 쓰기, 설치, 플러그인 동기화, 재시작 없이 계획된 업데이트 액션을 미리 봅니다.
- `--json`: 기계 판독 가능한 `UpdateRunResult` JSON 출력.
- `--timeout <seconds>`: 단계별 타임아웃 (기본값 1200초).
- `--yes`: 확인 프롬프트 건너뜀 (예: 다운그레이드 확인)

참고: 다운그레이드는 이전 버전이 구성을 깰 수 있으므로 확인이 필요합니다.

## `update status`

활성 업데이트 채널 + git 태그/브랜치/SHA (소스 체크아웃의 경우)와 업데이트 가용성을 표시합니다.

```bash
openclaw update status
openclaw update status --json
openclaw update status --timeout 10
```

옵션:

- `--json`: 기계 판독 가능한 상태 JSON 출력.
- `--timeout <seconds>`: 확인을 위한 타임아웃 (기본값 3초).

## `update wizard`

업데이트 채널을 선택하고 업데이트 후 Gateway를 재시작할지 확인하는 인터랙티브 흐름
(기본값은 재시작). `dev`를 git 체크아웃 없이 선택하면 생성을 제안합니다.

옵션:

- `--timeout <seconds>`: 각 업데이트 단계에 대한 타임아웃 (기본값 `1200`)

## 수행 작업

채널을 명시적으로 전환할 때 (`--channel ...`) OpenClaw는 설치 방법도 정렬된 상태로 유지합니다:

- `dev` → git 체크아웃을 보장하고 (기본값: `~/openclaw`, `OPENCLAW_GIT_DIR`로 재정의),
  이를 업데이트하고 해당 체크아웃에서 전역 CLI를 설치합니다.
- `stable` → `latest`를 사용하여 npm에서 설치.
- `beta` → npm dist-tag `beta`를 선호하지만, beta가 누락되거나 현재 stable 릴리스보다
  이전인 경우 `latest`로 폴백합니다.

Gateway 코어 자동 업데이터 (구성을 통해 활성화될 때)는 동일한 업데이트 경로를 재사용합니다.

## Git 체크아웃 흐름

채널:

- `stable`: 최신 비베타 태그를 체크아웃하고, 빌드 + doctor를 실행합니다.
- `beta`: 최신 `-beta` 태그를 선호하지만, beta가 누락되거나 이전인 경우 최신 stable 태그로 폴백합니다.
- `dev`: `main`을 체크아웃하고 fetch + rebase를 실행합니다.

상위 수준:

1. 깨끗한 작업 트리가 필요합니다 (커밋되지 않은 변경 사항 없음).
2. 선택한 채널 (태그 또는 브랜치)로 전환합니다.
3. 업스트림을 가져옵니다 (dev만).
4. Dev만: 임시 작업 트리에서 사전 검사 린트 + TypeScript 빌드; 팁이 실패하면 가장 최신 깨끗한 빌드를 찾기 위해 최대 10개 커밋을 되돌아봅니다.
5. 선택한 커밋으로 리베이스합니다 (dev만).
6. 리포지토리 패키지 관리자로 의존성을 설치합니다. pnpm 체크아웃의 경우 업데이터는 pnpm 워크스페이스 내에서 `npm run build`를 실행하는 대신 온디맨드로 `pnpm`을 부트스트랩합니다 (먼저 `corepack`을 통해, 그런 다음 임시 `npm install pnpm@10` 폴백).
7. 빌드 + Control UI를 빌드합니다.
8. 최종 "안전 업데이트" 확인으로 `openclaw doctor`를 실행합니다.
9. 플러그인을 활성 채널로 동기화하고 (dev는 번들 확장 사용; stable/beta는 npm 사용) npm 설치된 플러그인을 업데이트합니다.

pnpm 부트스트랩이 여전히 실패하면 업데이터는 이제 체크아웃 내에서 `npm run build`를 시도하는 대신 패키지 관리자별 오류와 함께 일찍 중단합니다.

## `--update` 단축키

`openclaw --update`는 `openclaw update`로 재작성됩니다 (셸 및 런처 스크립트에 유용).

## 참고

- `openclaw doctor` (git 체크아웃에서 먼저 업데이트 실행을 제안)
- [개발 채널](/install/development-channels)
- [업데이트](/install/updating)
- [CLI 참조](/cli/)
