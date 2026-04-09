---
title: "macOS IPC"
description: "OpenClaw 앱, 게이트웨이 노드 전송, PeekabooBridge를 위한 macOS IPC 아키텍처"
---

# OpenClaw macOS IPC 아키텍처

**현재 모델:** 로컬 Unix 소켓이 **노드 호스트 서비스**와 **macOS 앱**을 exec 승인 + `system.run`으로 연결합니다. 검색/연결 확인을 위한 `openclaw-mac` 디버그 CLI가 있습니다. 에이전트 작업은 여전히 게이트웨이 WebSocket과 `node.invoke`를 통해 흐릅니다. UI 자동화는 PeekabooBridge를 사용합니다.

## 목표

- 모든 TCC 대면 작업 (알림, 화면 녹화, 마이크, 음성, AppleScript)을 소유하는 단일 GUI 앱 인스턴스.
- 자동화를 위한 작은 표면: 게이트웨이 + 노드 명령, UI 자동화를 위한 PeekabooBridge.
- 예측 가능한 권한: 항상 동일한 서명된 번들 ID, launchd에서 시작되므로 TCC 부여가 유지됩니다.

## 작동 방식

### 게이트웨이 + 노드 전송

- 앱이 게이트웨이를 실행하고 (로컬 모드) 노드로 연결합니다.
- 에이전트 작업은 `node.invoke`를 통해 수행됩니다 (예: `system.run`, `system.notify`, `canvas.*`).

### 노드 서비스 + 앱 IPC

- 헤드리스 노드 호스트 서비스가 게이트웨이 WebSocket에 연결합니다.
- `system.run` 요청은 로컬 Unix 소켓을 통해 macOS 앱으로 전달됩니다.
- 앱은 UI 컨텍스트에서 exec를 수행하고 필요한 경우 프롬프트를 표시하며 출력을 반환합니다.

다이어그램 (SCI):

```
Agent -> Gateway -> Node Service (WS)
                      |  IPC (UDS + token + HMAC + TTL)
                      v
                  Mac App (UI + TCC + system.run)
```

### PeekabooBridge (UI 자동화)

- UI 자동화는 별도의 `bridge.sock`이라는 UNIX 소켓과 PeekabooBridge JSON 프로토콜을 사용합니다.
- 호스트 선호 순서 (클라이언트 측): Peekaboo.app → Claude.app → OpenClaw.app → 로컬 실행.
- 보안: 브리지 호스트는 허용된 TeamID가 필요합니다. DEBUG 전용 동일-UID 탈출 해치는 `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1` (Peekaboo 관례)로 보호됩니다.
- 참조: 세부 사항은 [PeekabooBridge 사용](/platforms/mac/peekaboo).

## 운영 흐름

- 재시작/재빌드: `SIGN_IDENTITY="Apple Development: &lt;Developer Name&gt; (&lt;TEAMID&gt;)" scripts/restart-mac.sh`
  - 기존 인스턴스 종료
  - Swift 빌드 + 패키지
  - LaunchAgent 쓰기/부트스트랩/킥스타트
- 단일 인스턴스: 동일한 번들 ID를 가진 다른 인스턴스가 실행 중이면 앱이 일찍 종료됩니다.

## 강화 참고 사항

- 모든 권한 있는 표면에 TeamID 일치를 요구하는 것을 선호합니다.
- PeekabooBridge: `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1` (DEBUG 전용)은 로컬 개발을 위해 동일-UID 호출자를 허용할 수 있습니다.
- 모든 통신은 로컬 전용으로 유지됩니다. 네트워크 소켓은 노출되지 않습니다.
- TCC 프롬프트는 GUI 앱 번들에서만 발생합니다. 서명된 번들 ID를 재빌드 전반에 걸쳐 안정적으로 유지하십시오.
- IPC 강화: 소켓 모드 `0600`, 토큰, 피어-UID 확인, HMAC 챌린지/응답, 짧은 TTL.
