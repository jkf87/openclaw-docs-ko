---
summary: "안정, 베타, 개발 채널: 의미론, 전환, 고정 및 태깅"
read_when:
  - stable/beta/dev 간 전환을 원하는 경우
  - 특정 버전, 태그 또는 SHA를 고정하려는 경우
  - 프리릴리즈 태깅 또는 게시 중인 경우
title: "릴리즈 채널"
sidebarTitle: "릴리즈 채널"
---

# 개발 채널

OpenClaw는 세 가지 업데이트 채널을 제공합니다:

- **stable**: npm dist-tag `latest`. 대부분의 사용자에게 권장됩니다.
- **beta**: 현재 상태일 때 npm dist-tag `beta`. beta가 없거나 최신 안정 릴리즈보다 오래된 경우
  업데이트 흐름은 `latest`로 폴백합니다.
- **dev**: `main`의 이동 헤드 (git). npm dist-tag: `dev` (게시된 경우).
  `main` 브랜치는 실험 및 활발한 개발을 위한 것입니다. 불완전한 기능이나 호환성을 깨는 변경 사항이 포함될 수 있습니다. 프로덕션 게이트웨이에는 사용하지 마십시오.

일반적으로 안정 빌드를 **beta**에 먼저 제공하고 테스트한 후, 버전 번호를 변경하지 않고 검증된 빌드를 `latest`로 이동하는 명시적인 프로모션 단계를 실행합니다. 유지 관리자는 필요한 경우 안정 릴리즈를 `latest`에 직접 게시할 수도 있습니다. Dist-tag는 npm 설치의 단일 진실 공급원입니다.

## 채널 전환

```bash
openclaw update --channel stable
openclaw update --channel beta
openclaw update --channel dev
```

`--channel`은 구성(`update.channel`)에 선택 사항을 저장하고 설치 방법을 맞춥니다:

- **`stable`** (패키지 설치): npm dist-tag `latest`를 통해 업데이트합니다.
- **`beta`** (패키지 설치): npm dist-tag `beta`를 선호하지만 `beta`가 없거나
  현재 안정 태그보다 오래된 경우 `latest`로 폴백합니다.
- **`stable`** (git 설치): 최신 안정 git 태그를 체크아웃합니다.
- **`beta`** (git 설치): 최신 beta git 태그를 선호하지만 beta가 없거나 오래된 경우
  최신 안정 git 태그로 폴백합니다.
- **`dev`**: git 체크아웃을 확인합니다(기본값 `~/openclaw`, `OPENCLAW_GIT_DIR`로 재정의), `main`으로 전환하고 업스트림에서 리베이스하고 빌드한 후 해당 체크아웃에서 전역 CLI를 설치합니다.

팁: stable과 dev를 병렬로 원한다면 두 개의 클론을 유지하고 게이트웨이를 안정적인 것으로 지정하십시오.

## 일회성 버전 또는 태그 타겟팅

저장된 채널을 변경하지 않고 단일 업데이트를 위해 특정 dist-tag, 버전 또는 패키지 스펙을 타겟으로 지정하려면 `--tag`를 사용합니다:

```bash
# 특정 버전 설치
openclaw update --tag 2026.4.1-beta.1

# beta dist-tag에서 설치 (일회성, 저장되지 않음)
openclaw update --tag beta

# GitHub main 브랜치에서 설치 (npm tarball)
openclaw update --tag main

# 특정 npm 패키지 스펙 설치
openclaw update --tag openclaw@2026.4.1-beta.1
```

참고 사항:

- `--tag`는 **패키지 (npm) 설치에만** 적용됩니다. Git 설치는 무시합니다.
- 태그는 저장되지 않습니다. 다음 `openclaw update`는 평소와 같이 구성된 채널을 사용합니다.
- 다운그레이드 보호: 대상 버전이 현재 버전보다 오래된 경우 OpenClaw가 확인을 요청합니다(`--yes`로 건너뜀).
- `--channel beta`는 `--tag beta`와 다릅니다: 채널 흐름은 beta가 없거나 오래된 경우 stable/latest로 폴백할 수 있지만, `--tag beta`는 해당 실행을 위해 raw `beta` dist-tag를 대상으로 합니다.

## 드라이 런

변경 없이 `openclaw update`가 수행할 작업을 미리 봅니다:

```bash
openclaw update --dry-run
openclaw update --channel beta --dry-run
openclaw update --tag 2026.4.1-beta.1 --dry-run
openclaw update --dry-run --json
```

드라이 런은 효과적인 채널, 대상 버전, 계획된 작업 및 다운그레이드 확인이 필요한지 여부를 보여줍니다.

## 플러그인 및 채널

`openclaw update`로 채널을 전환하면 OpenClaw가 플러그인 소스도 동기화합니다:

- `dev`는 git 체크아웃에서 번들된 플러그인을 선호합니다.
- `stable` 및 `beta`는 npm에서 설치된 플러그인 패키지를 복원합니다.
- npm에서 설치된 플러그인은 코어 업데이트 완료 후 업데이트됩니다.

## 현재 상태 확인

```bash
openclaw update status
```

활성 채널, 설치 종류(git 또는 패키지), 현재 버전 및 소스(구성, git 태그, git 브랜치 또는 기본값)를 보여줍니다.

## 태깅 모범 사례

- git 체크아웃이 착지하기를 원하는 릴리즈를 태깅합니다(stable은 `vYYYY.M.D`, beta는 `vYYYY.M.D-beta.N`).
- `vYYYY.M.D.beta.N`도 호환성을 위해 인식되지만 `-beta.N`을 선호합니다.
- 레거시 `vYYYY.M.D-<patch>` 태그는 여전히 안정(비베타)으로 인식됩니다.
- 태그는 변경 불가하게 유지합니다: 태그를 이동하거나 재사용하지 마십시오.
- npm dist-tag는 npm 설치의 단일 진실 공급원으로 유지됩니다:
  - `latest` -> stable
  - `beta` -> 후보 빌드 또는 beta 우선 안정 빌드
  - `dev` -> main 스냅샷 (선택적)

## macOS 앱 가용성

Beta 및 dev 빌드에는 macOS 앱 릴리즈가 **포함되지 않을 수 있습니다**. 이는 괜찮습니다:

- git 태그와 npm dist-tag는 여전히 게시될 수 있습니다.
- 릴리즈 노트 또는 변경 로그에 "이 베타에는 macOS 빌드 없음"을 명시합니다.
