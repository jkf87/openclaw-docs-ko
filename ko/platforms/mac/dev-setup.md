---
summary: "OpenClaw macOS 앱 작업을 위한 개발자 설정 가이드"
read_when:
  - macOS 개발 환경 설정 시
title: "macOS 개발 설정"
---

# macOS 개발자 설정

이 가이드는 소스에서 OpenClaw macOS 애플리케이션을 빌드하고 실행하는 데 필요한 단계를 다룹니다.

## 사전 요구 사항

앱을 빌드하기 전에 다음이 설치되어 있는지 확인하십시오:

1. **Xcode 26.2+**: Swift 개발에 필요합니다.
2. **Node.js 24 & pnpm**: 게이트웨이, CLI, 패키징 스크립트에 권장됩니다. 호환성을 위해 현재 `22.14+`인 Node 22 LTS도 지원됩니다.

## 1. 종속성 설치

프로젝트 전체 종속성을 설치합니다:

```bash
pnpm install
```

## 2. 앱 빌드 및 패키징

macOS 앱을 빌드하고 `dist/OpenClaw.app`으로 패키징하려면 다음을 실행하십시오:

```bash
./scripts/package-mac-app.sh
```

Apple Developer ID 인증서가 없는 경우 스크립트가 자동으로 **애드혹 서명** (`-`)을 사용합니다.

개발 실행 모드, 서명 플래그, Team ID 문제 해결은 macOS 앱 README를 참조하십시오:
[https://github.com/openclaw/openclaw/blob/main/apps/macos/README.md](https://github.com/openclaw/openclaw/blob/main/apps/macos/README.md)

> **참고**: 애드혹 서명된 앱은 보안 프롬프트를 트리거할 수 있습니다. 앱이 "Abort trap 6"으로 즉시 충돌하면 [문제 해결](#문제-해결) 섹션을 참조하십시오.

## 3. CLI 설치

macOS 앱은 백그라운드 작업을 관리하기 위해 전역 `openclaw` CLI 설치를 기대합니다.

**설치하려면 (권장):**

1. OpenClaw 앱을 엽니다.
2. **General** 설정 탭으로 이동합니다.
3. **"Install CLI"**를 클릭합니다.

또는 수동으로 설치:

```bash
npm install -g openclaw@<version>
```

`pnpm add -g openclaw@<version>`과 `bun add -g openclaw@<version>`도 작동합니다. 게이트웨이 런타임은 Node가 권장 경로로 유지됩니다.

## 문제 해결

### 빌드 실패: 툴체인 또는 SDK 불일치

macOS 앱 빌드는 최신 macOS SDK와 Swift 6.2 툴체인을 기대합니다.

**시스템 종속성 (필수):**

- **소프트웨어 업데이트에서 사용 가능한 최신 macOS 버전** (Xcode 26.2 SDK에 필요)
- **Xcode 26.2** (Swift 6.2 툴체인)

**확인:**

```bash
xcodebuild -version
xcrun swift --version
```

버전이 일치하지 않으면 macOS/Xcode를 업데이트하고 빌드를 다시 실행하십시오.

### 권한 부여 시 앱 충돌

**음성 인식** 또는 **마이크** 접근을 허용하려고 할 때 앱이 충돌하면 TCC 캐시가 손상되었거나 서명이 불일치할 수 있습니다.

**수정:**

1. TCC 권한 재설정:

   ```bash
   tccutil reset All ai.openclaw.mac.debug
   ```

2. 실패하면 macOS에서 "깨끗한 슬레이트"를 강제하기 위해 [`scripts/package-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/package-mac-app.sh)에서 `BUNDLE_ID`를 임시로 변경하십시오.

### 게이트웨이 "Starting..." 상태 지속

게이트웨이 상태가 "Starting..."에 머물러 있으면 좀비 프로세스가 포트를 점유하고 있는지 확인하십시오:

```bash
openclaw gateway status
openclaw gateway stop

# LaunchAgent를 사용하지 않는 경우 (개발 모드 / 수동 실행), 리스너 찾기:
lsof -nP -iTCP:18789 -sTCP:LISTEN
```

수동 실행이 포트를 점유하고 있으면 해당 프로세스를 중지하십시오 (Ctrl+C). 최후 수단으로 위에서 찾은 PID를 종료하십시오.
