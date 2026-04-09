---
title: CI 파이프라인
summary: "CI 작업 그래프, 범위 게이트, 로컬 명령어 동등 항목"
read_when:
  - CI 작업이 실행된 이유 또는 실행되지 않은 이유를 파악해야 할 때
  - 실패한 GitHub Actions 체크를 디버깅할 때
---

# CI 파이프라인

CI는 `main`에 대한 모든 푸시와 모든 풀 리퀘스트에서 실행됩니다. 관련 없는 영역만 변경된 경우 비용이 많이 드는 작업을 건너뛰는 스마트 범위 지정을 사용합니다.

## 작업 개요

| 작업                     | 목적                                                                                     | 실행 시점                           |
| ------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `preflight`              | 문서 전용 변경 감지, 변경된 범위, 변경된 익스텐션, CI 매니페스트 빌드                   | 초안이 아닌 푸시 및 PR에서 항상     |
| `security-fast`          | 비밀 키 감지, `zizmor`를 통한 워크플로 감사, 프로덕션 의존성 감사                       | 초안이 아닌 푸시 및 PR에서 항상     |
| `build-artifacts`        | `dist/`와 Control UI를 한 번 빌드, 다운스트림 작업을 위해 재사용 가능한 아티팩트 업로드  | Node 관련 변경 시                   |
| `checks-fast-core`       | 번들/플러그인 계약/프로토콜 체크 같은 빠른 Linux 정확성 레인                            | Node 관련 변경 시                   |
| `checks-fast-extensions` | `checks-fast-extensions-shard` 완료 후 익스텐션 샤드 레인 집계                          | Node 관련 변경 시                   |
| `extension-fast`         | 변경된 번들 플러그인에 대한 집중 테스트                                                  | 익스텐션 변경 감지 시               |
| `check`                  | CI의 주 로컬 게이트: `pnpm check` 및 `pnpm build:strict-smoke`                          | Node 관련 변경 시                   |
| `check-additional`       | 아키텍처 및 경계 가드, 게이트웨이 watch 회귀 하네스                                     | Node 관련 변경 시                   |
| `build-smoke`            | 빌드된 CLI 스모크 테스트 및 시작 메모리 스모크                                           | Node 관련 변경 시                   |
| `checks`                 | 더 무거운 Linux Node 레인: 전체 테스트, 채널 테스트, 푸시 전용 Node 22 호환성           | Node 관련 변경 시                   |
| `check-docs`             | 문서 포맷팅, 린트, 깨진 링크 체크                                                        | 문서 변경 시                        |
| `skills-python`          | Python 기반 스킬을 위한 Ruff + pytest                                                    | Python 스킬 관련 변경 시            |
| `checks-windows`         | Windows 특화 테스트 레인                                                                 | Windows 관련 변경 시                |
| `macos-node`             | 공유 빌드 아티팩트를 사용한 macOS TypeScript 테스트 레인                                 | macOS 관련 변경 시                  |
| `macos-swift`            | macOS 앱을 위한 Swift 린트, 빌드, 테스트                                                 | macOS 관련 변경 시                  |
| `android`                | Android 빌드 및 테스트 매트릭스                                                          | Android 관련 변경 시                |

## 빠른 실패 순서

저렴한 체크가 비용이 많이 드는 체크보다 먼저 실패하도록 작업이 정렬됩니다:

1. `preflight`가 어떤 레인이 존재하는지 결정합니다. `docs-scope`와 `changed-scope` 로직은 독립 작업이 아닌 이 작업 내의 단계입니다.
2. `security-fast`, `check`, `check-additional`, `check-docs`, `skills-python`은 더 무거운 아티팩트 및 플랫폼 매트릭스 작업을 기다리지 않고 빠르게 실패합니다.
3. `build-artifacts`는 빠른 Linux 레인과 겹쳐서 다운스트림 소비자가 공유 빌드가 준비되는 즉시 시작할 수 있습니다.
4. 더 무거운 플랫폼 및 런타임 레인이 이후에 팬아웃됩니다: `checks-fast-core`, `checks-fast-extensions`, `extension-fast`, `checks`, `checks-windows`, `macos-node`, `macos-swift`, `android`.

범위 로직은 `scripts/ci-changed-scope.mjs`에 있으며 `src/scripts/ci-changed-scope.test.ts`의 단위 테스트로 커버됩니다.
별도의 `install-smoke` 워크플로는 자체 `preflight` 작업을 통해 동일한 범위 스크립트를 재사용합니다. 더 좁은 changed-smoke 신호에서 `run_install_smoke`를 계산하므로 Docker/설치 스모크는 설치, 패키징, 컨테이너 관련 변경 시에만 실행됩니다.

푸시 시 `checks` 매트릭스에 푸시 전용 `compat-node22` 레인이 추가됩니다. 풀 리퀘스트에서는 해당 레인이 건너뛰어지고 매트릭스는 일반 테스트/채널 레인에 집중됩니다.

## 러너

| 러너                             | 작업                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `blacksmith-16vcpu-ubuntu-2404`  | `preflight`, `security-fast`, `build-artifacts`, Linux 체크, 문서 체크, Python 스킬, `android` |
| `blacksmith-32vcpu-windows-2025` | `checks-windows`                                                                                     |
| `macos-latest`                   | `macos-node`, `macos-swift`                                                                          |

## 로컬 동등 명령어

```bash
pnpm check          # types + lint + format
pnpm build:strict-smoke
pnpm test:gateway:watch-regression
pnpm test           # vitest tests
pnpm test:channels
pnpm check:docs     # docs format + lint + broken links
pnpm build          # build dist when CI artifact/build-smoke lanes matter
```
