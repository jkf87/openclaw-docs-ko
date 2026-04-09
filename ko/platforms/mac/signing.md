---
summary: "패키징 스크립트로 생성된 macOS 디버그 빌드 서명 단계"
read_when:
  - mac 디버그 빌드 빌드 또는 서명 시
title: "macOS 서명"
---

# mac 서명 (디버그 빌드)

이 앱은 보통 [`scripts/package-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/package-mac-app.sh)에서 빌드됩니다. 현재 이 스크립트는:

- 안정적인 디버그 번들 식별자를 설정합니다: `ai.openclaw.mac.debug`
- 해당 번들 ID로 Info.plist를 씁니다 (`BUNDLE_ID=...`로 재정의 가능)
- [`scripts/codesign-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/codesign-mac-app.sh)를 호출하여 메인 바이너리와 앱 번들에 서명하므로 macOS가 각 재빌드를 동일한 서명된 번들로 취급하고 TCC 권한 (알림, 접근성, 화면 녹화, 마이크, 음성)을 유지합니다. 안정적인 권한을 위해 실제 서명 ID를 사용하십시오. 애드혹은 선택 사항이며 취약합니다 ([macOS 권한](/platforms/mac/permissions) 참조).
- 기본적으로 `CODESIGN_TIMESTAMP=auto`를 사용합니다. Developer ID 서명에 신뢰할 수 있는 타임스탬프를 활성화합니다. 타임스탬핑을 건너뛰려면 `CODESIGN_TIMESTAMP=off`로 설정합니다 (오프라인 디버그 빌드).
- 빌드 메타데이터를 Info.plist에 삽입합니다: `OpenClawBuildTimestamp` (UTC) 및 `OpenClawGitCommit` (짧은 해시). About 창이 빌드, git, 디버그/릴리스 채널을 표시할 수 있습니다.
- **패키징 기본값은 Node 24입니다**: 스크립트가 TS 빌드와 Control UI 빌드를 실행합니다. 호환성을 위해 현재 `22.14+`인 Node 22 LTS도 지원됩니다.
- 환경에서 `SIGN_IDENTITY`를 읽습니다. 항상 인증서로 서명하려면 쉘 rc에 `export SIGN_IDENTITY="Apple Development: Your Name (TEAMID)"` (또는 Developer ID Application 인증서)를 추가하십시오. 애드혹 서명은 `ALLOW_ADHOC_SIGNING=1` 또는 `SIGN_IDENTITY="-"`로 명시적으로 선택해야 합니다 (권한 테스트에는 권장하지 않음).
- 서명 후 Team ID 감사를 실행하고 앱 번들 내의 Mach-O가 다른 Team ID로 서명된 경우 실패합니다. 건너뛰려면 `SKIP_TEAM_ID_CHECK=1`을 설정하십시오.

## 사용법

```bash
# 저장소 루트에서
scripts/package-mac-app.sh               # 자동으로 ID 선택; 없으면 오류
SIGN_IDENTITY="Developer ID Application: Your Name" scripts/package-mac-app.sh   # 실제 인증서
ALLOW_ADHOC_SIGNING=1 scripts/package-mac-app.sh    # 애드혹 (권한이 유지되지 않음)
SIGN_IDENTITY="-" scripts/package-mac-app.sh        # 명시적 애드혹 (동일한 주의 사항)
DISABLE_LIBRARY_VALIDATION=1 scripts/package-mac-app.sh   # 개발 전용 Sparkle Team ID 불일치 해결 방법
```

### 애드혹 서명 참고 사항

`SIGN_IDENTITY="-"` (애드혹)으로 서명할 때 스크립트는 자동으로 **Hardened Runtime** (`--options runtime`)을 비활성화합니다. 앱이 동일한 Team ID를 공유하지 않는 임베딩된 프레임워크 (예: Sparkle)를 로드하려고 할 때 충돌을 방지하기 위해 필요합니다. 애드혹 서명은 또한 TCC 권한 영속성을 깨뜨립니다. 복구 단계는 [macOS 권한](/platforms/mac/permissions)을 참조하십시오.

## About용 빌드 메타데이터

`package-mac-app.sh`는 번들에 다음을 스탬핑합니다:

- `OpenClawBuildTimestamp`: 패키지 시 ISO8601 UTC
- `OpenClawGitCommit`: 짧은 git 해시 (사용 불가 시 `unknown`)

About 탭은 이 키를 읽어 버전, 빌드 날짜, git 커밋, 디버그 빌드 여부 (`#if DEBUG`를 통해)를 표시합니다. 코드 변경 후 이 값을 새로 고치려면 패키저를 실행하십시오.

## 이유

TCC 권한은 번들 식별자 _및_ 코드 서명과 연결됩니다. 변경되는 UUID가 있는 서명되지 않은 디버그 빌드는 각 재빌드 후 macOS가 부여를 잊게 했습니다. 바이너리에 서명하고 (기본적으로 애드혹) 고정된 번들 ID/경로 (`dist/OpenClaw.app`)를 유지하면 빌드 간에 부여가 보존됩니다. VibeTunnel 접근 방식과 일치합니다.
