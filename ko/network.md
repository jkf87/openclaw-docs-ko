---
summary: "네트워크 허브: 게이트웨이 서피스, 페어링, 디스커버리, 보안"
read_when:
  - 네트워크 아키텍처 + 보안 개요가 필요할 때
  - 로컬 대 테일넷 접근 또는 페어링 디버깅 시
  - 네트워킹 문서의 표준 목록을 원할 때
title: "네트워크"
---

# 네트워크 허브

이 허브는 OpenClaw가 localhost, LAN, 테일넷을 통해 기기를 연결, 페어링, 보안 설정하는 방법에 관한 핵심 문서를 연결합니다.

## 핵심 모델

대부분의 작업은 게이트웨이(`openclaw gateway`)를 통해 흐릅니다. 게이트웨이는 채널 연결과 WebSocket 컨트롤 플레인을 소유하는 단일 장기 실행 프로세스입니다.

- **루프백 우선**: 게이트웨이 WS는 기본적으로 `ws://127.0.0.1:18789`입니다. 비루프백 바인드에는 유효한 게이트웨이 인증 경로가 필요합니다: 공유 비밀 토큰/패스워드 인증, 또는 올바르게 구성된 비루프백 `trusted-proxy` 배포.
- **호스트당 하나의 게이트웨이**를 권장합니다. 격리를 위해서는 격리된 프로파일과 포트로 여러 게이트웨이를 실행하십시오([다중 게이트웨이](/gateway/multiple-gateways)).
- **Canvas 호스트**는 게이트웨이와 동일한 포트에서 제공됩니다(`/__openclaw__/canvas/`, `/__openclaw__/a2ui/`), 루프백 너머로 바인드될 때 게이트웨이 인증으로 보호됩니다.
- **원격 접근**은 일반적으로 SSH 터널 또는 Tailscale VPN입니다([원격 접근](/gateway/remote)).

주요 참조:

- [게이트웨이 아키텍처](/concepts/architecture)
- [게이트웨이 프로토콜](/gateway/protocol)
- [게이트웨이 런북](/gateway/)
- [웹 서피스 + 바인드 모드](/web/)

## 페어링 + 신원

- [페어링 개요 (DM + 노드)](/channels/pairing)
- [게이트웨이 소유 노드 페어링](/gateway/pairing)
- [기기 CLI (페어링 + 토큰 순환)](/cli/devices)
- [페어링 CLI (DM 승인)](/cli/pairing)

로컬 신뢰:

- 직접 로컬 루프백 연결은 동일 호스트 UX를 원활하게 유지하기 위해 페어링에 자동 승인될 수 있습니다.
- OpenClaw에는 신뢰할 수 있는 공유 비밀 헬퍼 플로를 위한 좁은 백엔드/컨테이너 로컬 자체 연결 경로도 있습니다.
- 동일 호스트 테일넷 바인드를 포함한 테일넷 및 LAN 클라이언트는 여전히 명시적 페어링 승인이 필요합니다.

## 디스커버리 + 전송

- [디스커버리 & 전송](/gateway/discovery)
- [Bonjour / mDNS](/gateway/bonjour)
- [원격 접근 (SSH)](/gateway/remote)
- [Tailscale](/gateway/tailscale)

## 노드 + 전송

- [노드 개요](/nodes/)
- [브리지 프로토콜 (레거시 노드, 역사적)](/gateway/bridge-protocol)
- [노드 런북: iOS](/platforms/ios)
- [노드 런북: Android](/platforms/android)

## 보안

- [보안 개요](/gateway/security/)
- [게이트웨이 구성 참조](/gateway/configuration)
- [문제 해결](/gateway/troubleshooting)
- [Doctor](/gateway/doctor)
