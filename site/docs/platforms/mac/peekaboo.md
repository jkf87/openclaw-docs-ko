---
title: "Peekaboo 브리지"
description: "macOS UI 자동화를 위한 PeekabooBridge 통합"
---

# Peekaboo 브리지 (macOS UI 자동화)

OpenClaw는 **PeekabooBridge**를 로컬 권한 인식 UI 자동화 브로커로 호스팅할 수 있습니다. 이를 통해 `peekaboo` CLI가 macOS 앱의 TCC 권한을 재사용하면서 UI 자동화를 구동할 수 있습니다.

## 이것이 무엇인지 (그리고 무엇이 아닌지)

- **호스트**: OpenClaw.app은 PeekabooBridge 호스트 역할을 할 수 있습니다.
- **클라이언트**: `peekaboo` CLI를 사용합니다 (별도의 `openclaw ui ...` 표면 없음).
- **UI**: 시각적 오버레이는 Peekaboo.app에 유지됩니다. OpenClaw는 얇은 브로커 호스트입니다.

## 브리지 활성화

macOS 앱에서:

- 설정 → **Enable Peekaboo Bridge**

활성화되면 OpenClaw는 로컬 UNIX 소켓 서버를 시작합니다. 비활성화되면 호스트가 중지되고 `peekaboo`는 다른 사용 가능한 호스트로 대체됩니다.

## 클라이언트 검색 순서

Peekaboo 클라이언트는 일반적으로 이 순서로 호스트를 시도합니다:

1. Peekaboo.app (전체 UX)
2. Claude.app (설치된 경우)
3. OpenClaw.app (얇은 브로커)

`peekaboo bridge status --verbose`를 사용하여 어떤 호스트가 활성 상태이고 어떤 소켓 경로가 사용 중인지 확인합니다. 다음으로 재정의할 수 있습니다:

```bash
export PEEKABOO_BRIDGE_SOCKET=/path/to/bridge.sock
```

## 보안 및 권한

- 브리지는 **발신자 코드 서명**을 검증합니다. TeamID의 허용 목록이 시행됩니다 (Peekaboo 호스트 TeamID + OpenClaw 앱 TeamID).
- 요청은 ~10초 후 타임아웃됩니다.
- 필요한 권한이 없는 경우 브리지는 System Settings를 시작하는 대신 명확한 오류 메시지를 반환합니다.

## 스냅샷 동작 (자동화)

스냅샷은 메모리에 저장되고 짧은 시간 후 자동으로 만료됩니다. 더 오래 보유해야 하는 경우 클라이언트에서 다시 캡처하십시오.

## 문제 해결

- `peekaboo`가 "bridge client is not authorized"를 보고하면 클라이언트가 올바르게 서명되어 있는지 확인하거나 **디버그** 모드에서만 `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1`로 호스트를 실행하십시오.
- 호스트가 없으면 호스트 앱 중 하나 (Peekaboo.app 또는 OpenClaw.app)를 열고 권한이 부여되었는지 확인하십시오.
