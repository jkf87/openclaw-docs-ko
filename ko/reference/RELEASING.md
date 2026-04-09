---
title: "릴리스 정책"
summary: "공개 릴리스 채널, 버전 명명 규칙, 릴리스 주기"
read_when:
  - 공개 릴리스 채널 정의 확인 시
  - 버전 명명 규칙 및 릴리스 주기 확인 시
---

# 릴리스 정책

OpenClaw에는 세 가지 공개 릴리스 레인이 있습니다:

- stable: npm `beta`에 기본적으로 게시되거나 명시적으로 요청된 경우 npm `latest`에 게시되는 태그 릴리스
- beta: npm `beta`에 게시되는 사전 릴리스 태그
- dev: `main`의 이동하는 헤드

## 버전 명명

- 안정 릴리스 버전: `YYYY.M.D`
  - Git 태그: `vYYYY.M.D`
- 안정 수정 릴리스 버전: `YYYY.M.D-N`
  - Git 태그: `vYYYY.M.D-N`
- 베타 사전 릴리스 버전: `YYYY.M.D-beta.N`
  - Git 태그: `vYYYY.M.D-beta.N`
- 월 또는 일에 앞에 0을 붙이지 마십시오
- `latest`는 현재 승격된 안정 npm 릴리스를 의미합니다
- `beta`는 현재 베타 설치 대상을 의미합니다
- 안정 및 안정 수정 릴리스는 기본적으로 npm `beta`에 게시됩니다. 릴리스 운영자는 명시적으로 `latest`를 대상으로 지정하거나 나중에 검증된 베타 빌드를 승격할 수 있습니다
- 모든 OpenClaw 릴리스는 npm 패키지와 macOS 앱을 함께 제공합니다

## 릴리스 주기

- 릴리스는 베타 우선으로 진행됩니다
- 안정 버전은 최신 베타가 검증된 후에만 출시됩니다
- 상세한 릴리스 절차, 승인, 자격 증명, 복구 메모는 메인테이너 전용입니다

## 릴리스 전 검사

- 패키지 검증 단계에서 예상되는 `dist/*` 릴리스 아티팩트와 Control UI 번들이 존재하도록 `pnpm release:check` 전에 `pnpm build && pnpm ui:build`를 실행하십시오
- 모든 태그 릴리스 전에 `pnpm release:check`를 실행하십시오
- 메인 브랜치 npm 프리플라이트는 또한 tarball 패키징 전에 `OPENAI_API_KEY`와 `ANTHROPIC_API_KEY` 워크플로우 시크릿을 모두 사용하여 `OPENCLAW_LIVE_TEST=1 OPENCLAW_LIVE_CACHE_TEST=1 pnpm test:live:cache`를 실행합니다
- 승인 전에 `RELEASE_TAG=vYYYY.M.D node --import tsx scripts/openclaw-npm-release-check.ts` (또는 일치하는 베타/수정 태그)를 실행하십시오
- npm 게시 후 새로운 임시 접두사에서 게시된 레지스트리 설치 경로를 검증하기 위해 `node --import tsx scripts/openclaw-npm-postpublish-verify.ts YYYY.M.D` (또는 일치하는 베타/수정 버전)를 실행하십시오
- 메인테이너 릴리스 자동화는 이제 프리플라이트-후-승격 방식을 사용합니다:
  - 실제 npm 게시는 성공적인 npm `preflight_run_id`를 통과해야 합니다
  - 안정 npm 릴리스는 기본적으로 `beta`를 사용합니다
  - 안정 npm 게시는 워크플로우 입력을 통해 명시적으로 `latest`를 대상으로 지정할 수 있습니다
  - `beta`에서 `latest`로의 안정 npm 승격은 신뢰할 수 있는 `OpenClaw NPM Release` 워크플로우의 명시적 수동 모드로 여전히 사용 가능합니다
  - 해당 승격 모드에는 `npm-release` 환경에 유효한 `NPM_TOKEN`이 필요합니다. npm `dist-tag` 관리가 신뢰할 수 있는 게시와 분리되어 있기 때문입니다
  - 공개 `macOS Release`는 검증 전용입니다
  - 실제 비공개 mac 게시는 성공적인 비공개 mac `preflight_run_id` 및 `validate_run_id`를 통과해야 합니다
  - 실제 게시 경로는 아티팩트를 다시 빌드하지 않고 준비된 아티팩트를 승격합니다
- `YYYY.M.D-N`과 같은 안정 수정 릴리스의 경우, 게시 후 검증기는 `YYYY.M.D`에서 `YYYY.M.D-N`으로의 동일한 임시 접두사 업그레이드 경로도 확인하여 릴리스 수정이 이전 기본 안정 페이로드의 전역 설치를 자동으로 남겨두지 않도록 합니다
- npm 릴리스 프리플라이트는 tarball에 `dist/control-ui/index.html`과 비어 있지 않은 `dist/control-ui/assets/` 페이로드가 모두 포함되지 않으면 닫힌 상태로 실패합니다. 빈 브라우저 대시보드를 다시 제공하지 않기 위해서입니다
- 릴리스 작업이 CI 계획, 확장 타이밍 매니페스트, 또는 빠른 테스트 매트릭스에 영향을 미쳤다면, 릴리스 노트가 오래된 CI 레이아웃을 설명하지 않도록 승인 전에 `.github/workflows/ci.yml`에서 플래너 소유 `checks-fast-extensions` 워크플로우 매트릭스 출력을 재생성하고 검토하십시오
- 안정 macOS 릴리스 준비는 업데이터 서페이스도 포함합니다:
  - GitHub 릴리스에는 패키지된 `.zip`, `.dmg`, `.dSYM.zip`이 있어야 합니다
  - 게시 후 `main`의 `appcast.xml`은 새 안정 zip을 가리켜야 합니다
  - 패키지된 앱은 비디버그 번들 ID, 비어 있지 않은 Sparkle 피드 URL, 해당 릴리스 버전의 표준 Sparkle 빌드 플로어 이상의 `CFBundleVersion`을 유지해야 합니다

## NPM 워크플로우 입력

`OpenClaw NPM Release`는 다음과 같은 운영자 제어 입력을 허용합니다:

- `tag`: `v2026.4.2`, `v2026.4.2-1`, 또는 `v2026.4.2-beta.1`과 같은 필수 릴리스 태그
- `preflight_only`: 검증/빌드/패키지만 할 경우 `true`, 실제 게시 경로의 경우 `false`
- `preflight_run_id`: 워크플로우가 성공한 프리플라이트 실행의 준비된 tarball을 재사용하도록 실제 게시 경로에서 필수
- `npm_dist_tag`: 게시 경로를 위한 npm 대상 태그. 기본값은 `beta`
- `promote_beta_to_latest`: 이미 게시된 안정 `beta` 빌드를 `latest`로 이동하고 게시를 건너뛰려면 `true`

규칙:

- 안정 및 수정 태그는 `beta` 또는 `latest` 중 하나에 게시할 수 있습니다
- 베타 사전 릴리스 태그는 `beta`에만 게시할 수 있습니다
- 실제 게시 경로는 프리플라이트 중에 사용된 것과 동일한 `npm_dist_tag`를 사용해야 합니다. 워크플로우는 게시 전에 해당 메타데이터를 검증합니다
- 승격 모드는 안정 또는 수정 태그, `preflight_only=false`, 빈 `preflight_run_id`, `npm_dist_tag=beta`를 사용해야 합니다
- 승격 모드에는 `npm-release` 환경에 유효한 `NPM_TOKEN`이 필요합니다. `npm dist-tag add`는 여전히 일반 npm 인증이 필요하기 때문입니다

## 안정 npm 릴리스 시퀀스

안정 npm 릴리스를 자를 때:

1. `preflight_only=true`로 `OpenClaw NPM Release`를 실행합니다
2. 일반 베타 우선 흐름에는 `npm_dist_tag=beta`를 선택하거나, 직접 안정 게시를 의도할 때만 `latest`를 선택합니다
3. 성공적인 `preflight_run_id`를 저장합니다
4. `preflight_only=false`, 동일한 `tag`, 동일한 `npm_dist_tag`, 저장된 `preflight_run_id`로 `OpenClaw NPM Release`를 다시 실행합니다
5. 릴리스가 `beta`에 도착했다면, 나중에 해당 게시된 빌드를 `latest`로 이동하려면 동일한 안정 `tag`, `promote_beta_to_latest=true`, `preflight_only=false`, 빈 `preflight_run_id`, `npm_dist_tag=beta`로 `OpenClaw NPM Release`를 실행합니다

승격 모드는 여전히 `npm-release` 환경 승인과 해당 환경의 유효한 `NPM_TOKEN`이 필요합니다.

이렇게 하면 직접 게시 경로와 베타 우선 승격 경로 모두 문서화되고 운영자가 볼 수 있는 상태로 유지됩니다.

## 공개 참조

- [`.github/workflows/openclaw-npm-release.yml`](https://github.com/openclaw/openclaw/blob/main/.github/workflows/openclaw-npm-release.yml)
- [`scripts/openclaw-npm-release-check.ts`](https://github.com/openclaw/openclaw/blob/main/scripts/openclaw-npm-release-check.ts)
- [`scripts/package-mac-dist.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/package-mac-dist.sh)
- [`scripts/make_appcast.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/make_appcast.sh)

메인테이너는 실제 런북을 위해
[`openclaw/maintainers/release/README.md`](https://github.com/openclaw/maintainers/blob/main/release/README.md)의 비공개 릴리스 문서를 사용합니다.
