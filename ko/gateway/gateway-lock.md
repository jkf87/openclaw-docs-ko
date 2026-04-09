---
summary: "WebSocket 리스너 바인딩을 사용하는 게이트웨이 싱글톤 가드"
read_when:
  - 게이트웨이 프로세스를 실행하거나 디버깅할 때
  - 단일 인스턴스 적용 조사 시
title: "게이트웨이 잠금"
---

# 게이트웨이 잠금

## 이유

- 동일 호스트의 기본 포트당 하나의 게이트웨이 인스턴스만 실행되도록 보장합니다; 추가 게이트웨이는 격리된 프로필과 고유한 포트를 사용해야 합니다.
- 오래된 잠금 파일을 남기지 않고 충돌/SIGKILL에서 살아남습니다.
- 컨트롤 포트가 이미 점유된 경우 명확한 오류와 함께 빠르게 실패합니다.

## 메커니즘

- 게이트웨이는 시작 시 즉시 전용 TCP 리스너를 사용하여 WebSocket 리스너(기본 `ws://127.0.0.1:18789`)를 바인딩합니다.
- 바인딩이 `EADDRINUSE`로 실패하면 시작이 `GatewayLockError("another gateway instance is already listening on ws://127.0.0.1:<port>")`를 발생시킵니다.
- OS는 충돌 및 SIGKILL을 포함한 모든 프로세스 종료 시 리스너를 자동으로 해제합니다—별도의 잠금 파일이나 정리 단계가 필요 없습니다.
- 종료 시 게이트웨이는 WebSocket 서버와 기본 HTTP 서버를 닫아 포트를 즉시 해제합니다.

## 오류 표면

- 다른 프로세스가 포트를 보유하고 있으면 시작이 `GatewayLockError("another gateway instance is already listening on ws://127.0.0.1:<port>")`를 발생시킵니다.
- 다른 바인딩 실패는 `GatewayLockError("failed to bind gateway socket on ws://127.0.0.1:<port>: …")`로 표면화됩니다.

## 운영 참고 사항

- 포트가 _다른_ 프로세스에 의해 점유된 경우 오류는 동일합니다; 포트를 해제하거나 `openclaw gateway --port <port>`로 다른 포트를 선택하십시오.
- macOS 앱은 게이트웨이를 생성하기 전에 자체 경량 PID 가드를 여전히 유지합니다; 런타임 잠금은 WebSocket 바인딩에 의해 적용됩니다.

## 관련 항목

- [멀티 게이트웨이](/gateway/multiple-gateways) — 고유한 포트로 여러 인스턴스 실행
- [문제 해결](/gateway/troubleshooting) — `EADDRINUSE` 및 포트 충돌 진단
