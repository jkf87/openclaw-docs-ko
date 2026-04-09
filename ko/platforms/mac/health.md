---
summary: "macOS 앱이 게이트웨이/Baileys 상태를 보고하는 방법"
read_when:
  - mac 앱 상태 표시기 디버깅 시
title: "상태 확인 (macOS)"
---

# macOS에서 상태 확인

메뉴 바 앱에서 연결된 채널이 정상인지 확인하는 방법입니다.

## 메뉴 바

- 상태 점이 이제 Baileys 상태를 반영합니다:
  - 초록: 연결됨 + 최근 소켓 열림.
  - 주황: 연결 중/재시도 중.
  - 빨강: 로그아웃되었거나 프로브 실패.
- 보조 줄에는 "linked · auth 12m"이 표시되거나 실패 이유가 표시됩니다.
- "Run Health Check" 메뉴 항목이 주문형 프로브를 트리거합니다.

## 설정

- General 탭에 상태 카드가 추가됩니다. 표시 내용: 연결된 인증 기간, 세션 저장소 경로/수, 마지막 확인 시간, 마지막 오류/상태 코드, Run Health Check / Reveal Logs 버튼.
- 캐시된 스냅샷을 사용하므로 UI가 즉시 로드되고 오프라인 시 안정적으로 대체됩니다.
- **Channels 탭**은 WhatsApp/Telegram의 채널 상태 + 제어 (로그인 QR, 로그아웃, 프로브, 마지막 연결 해제/오류)를 표시합니다.

## 프로브 작동 방식

- 앱은 `ShellExecutor`를 통해 ~60초마다 및 주문형으로 `openclaw health --json`을 실행합니다. 프로브는 자격 증명을 로드하고 메시지를 보내지 않고 상태를 보고합니다.
- 플리커를 방지하기 위해 마지막 양호한 스냅샷과 마지막 오류를 별도로 캐시합니다. 각각의 타임스탬프를 표시합니다.

## 의심스러울 때

- [게이트웨이 상태](/gateway/health)의 CLI 흐름을 여전히 사용할 수 있습니다 (`openclaw status`, `openclaw status --deep`, `openclaw health --json`). `web-heartbeat` / `web-reconnect`에 대해 `/tmp/openclaw/openclaw-*.log`를 추적하십시오.
