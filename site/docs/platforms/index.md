---
title: "플랫폼"
description: "플랫폼 지원 개요 (게이트웨이 + 동반 앱)"
---

# 플랫폼

OpenClaw 코어는 TypeScript로 작성되어 있습니다. **Node가 권장 런타임입니다**.
게이트웨이에는 Bun을 권장하지 않습니다 (WhatsApp/Telegram 버그).

macOS(메뉴 바 앱) 및 모바일 노드(iOS/Android)용 동반 앱이 존재합니다. Windows 및
Linux 동반 앱은 계획 중이지만, 게이트웨이는 현재 완전히 지원됩니다.
Windows용 네이티브 동반 앱도 계획 중이며, 게이트웨이는 WSL2를 통해 권장됩니다.

## OS 선택

- macOS: [macOS](/platforms/macos)
- iOS: [iOS](/platforms/ios)
- Android: [Android](/platforms/android)
- Windows: [Windows](/platforms/windows)
- Linux: [Linux](/platforms/linux)

## VPS 및 호스팅

- VPS 허브: [VPS 호스팅](/vps)
- Fly.io: [Fly.io](/install/fly)
- Hetzner (Docker): [Hetzner](/install/hetzner)
- GCP (Compute Engine): [GCP](/install/gcp)
- Azure (Linux VM): [Azure](/install/azure)
- exe.dev (VM + HTTPS 프록시): [exe.dev](/install/exe-dev)

## 공통 링크

- 설치 가이드: [시작하기](/start/getting-started)
- 게이트웨이 런북: [게이트웨이](/gateway)
- 게이트웨이 구성: [구성](/gateway/configuration)
- 서비스 상태: `openclaw gateway status`

## 게이트웨이 서비스 설치 (CLI)

다음 중 하나를 사용하십시오 (모두 지원됨):

- 마법사 (권장): `openclaw onboard --install-daemon`
- 직접: `openclaw gateway install`
- 구성 흐름: `openclaw configure` → **Gateway service** 선택
- 복구/마이그레이션: `openclaw doctor` (서비스 설치 또는 수정 제안)

서비스 대상은 OS에 따라 다릅니다:

- macOS: LaunchAgent (`ai.openclaw.gateway` 또는 `ai.openclaw.&lt;profile&gt;`; 레거시 `com.openclaw.*`)
- Linux/WSL2: systemd 사용자 서비스 (`openclaw-gateway[-&lt;profile&gt;].service`)
- 네이티브 Windows: 예약된 작업 (`OpenClaw Gateway` 또는 `OpenClaw Gateway (&lt;profile&gt;)`), 작업 생성이 거부될 경우 사용자별 시작 폴더 로그인 항목 대체
