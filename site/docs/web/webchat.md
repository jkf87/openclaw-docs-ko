---
title: "웹챗"
description: "루프백 웹챗 정적 호스트 및 채팅 UI를 위한 게이트웨이 WS 사용"
---

# 웹챗 (게이트웨이 WebSocket UI)

상태: macOS/iOS SwiftUI 채팅 UI는 게이트웨이 WebSocket에 직접 연결합니다.

## 개요

- 게이트웨이를 위한 네이티브 채팅 UI (임베디드 브라우저 없음, 로컬 정적 서버 없음).
- 다른 채널과 동일한 세션 및 라우팅 규칙을 사용합니다.
- 결정론적 라우팅: 응답은 항상 웹챗으로 돌아갑니다.

## 빠른 시작

1. 게이트웨이를 시작하십시오.
2. 웹챗 UI (macOS/iOS 앱) 또는 Control UI 채팅 탭을 여십시오.
3. 유효한 게이트웨이 인증 경로가 구성되어 있는지 확인하십시오 (루프백에서도 기본적으로 공유 비밀).

## 작동 방식 (동작)

- UI는 게이트웨이 WebSocket에 연결하고 `chat.history`, `chat.send`, `chat.inject`를 사용합니다.
- `chat.history`는 안정성을 위해 제한됩니다: 게이트웨이는 긴 텍스트 필드를 잘라내고, 무거운 메타데이터를 생략하고, 과도하게 큰 항목을 `[chat.history omitted: message too large]`로 대체할 수 있습니다.
- `chat.history`는 또한 표시 정규화됩니다: `[[reply_to_*]]` 및 `[[audio_as_voice]]` 같은 인라인 전달 지시어 태그, 일반 텍스트 도구 호출 XML 페이로드, 유출된 ASCII/전각 모델 제어 토큰이 표시 텍스트에서 제거되고, 전체 표시 텍스트가 정확히 `NO_REPLY` / `no_reply` 토큰만인 어시스턴트 항목은 생략됩니다.
- `chat.inject`는 어시스턴트 노트를 직접 트랜스크립트에 추가하고 UI에 브로드캐스트합니다 (에이전트 실행 없음).
- 중단된 실행은 UI에서 부분적인 어시스턴트 출력을 표시할 수 있습니다.
- 게이트웨이는 버퍼링된 출력이 있는 경우 중단된 부분 어시스턴트 텍스트를 트랜스크립트 히스토리에 유지하고 해당 항목에 중단 메타데이터를 표시합니다.
- 히스토리는 항상 게이트웨이에서 가져옵니다 (로컬 파일 감시 없음).
- 게이트웨이에 도달할 수 없는 경우 웹챗은 읽기 전용입니다.

## Control UI 에이전트 도구 패널

- Control UI `/agents` 도구 패널에는 두 개의 별도 보기가 있습니다:
  - **지금 사용 가능한 것**은 `tools.effective(sessionKey=...)`를 사용하여 현재 세션이 런타임에 실제로 사용할 수 있는 것을 보여줍니다. 여기에는 핵심, 플러그인 및 채널 소유 도구가 포함됩니다.
  - **도구 구성**은 `tools.catalog`를 사용하여 프로필, 재정의 및 카탈로그 의미론에 집중합니다.
- 런타임 가용성은 세션 범위입니다. 동일한 에이전트에서 세션을 전환하면 **지금 사용 가능한 것** 목록이 변경될 수 있습니다.
- 구성 편집기는 런타임 가용성을 의미하지 않습니다. 유효한 액세스는 여전히 정책 우선 순위 (`allow`/`deny`, 에이전트별 및 프로바이더/채널 재정의)를 따릅니다.

## 원격 사용

- 원격 모드는 SSH/Tailscale을 통해 게이트웨이 WebSocket을 터널링합니다.
- 별도의 웹챗 서버를 실행할 필요가 없습니다.

## 구성 참조 (웹챗)

전체 구성: [구성](/gateway/configuration)

웹챗 옵션:

- `gateway.webchat.chatHistoryMaxChars`: `chat.history` 응답에서 텍스트 필드의 최대 문자 수. 트랜스크립트 항목이 이 제한을 초과하면 게이트웨이는 긴 텍스트 필드를 잘라내고 과도하게 큰 메시지를 자리 표시자로 대체할 수 있습니다. 클라이언트가 단일 `chat.history` 호출에 대해 이 기본값을 재정의하기 위해 요청당 `maxChars`를 전송할 수도 있습니다.

관련 전역 옵션:

- `gateway.port`, `gateway.bind`: WebSocket 호스트/포트.
- `gateway.auth.mode`, `gateway.auth.token`, `gateway.auth.password`: 공유 비밀 WebSocket 인증.
- `gateway.auth.allowTailscale`: Tailscale Serve 아이덴티티 헤더가 활성화된 경우 브라우저 Control UI 채팅 탭에서 사용할 수 있습니다.
- `gateway.auth.mode: "trusted-proxy"`: 아이덴티티 인식 **비루프백** 프록시 소스 뒤의 브라우저 클라이언트를 위한 역방향 프록시 인증 ([신뢰할 수 있는 프록시 인증](/gateway/trusted-proxy-auth) 참조).
- `gateway.remote.url`, `gateway.remote.token`, `gateway.remote.password`: 원격 게이트웨이 대상.
- `session.*`: 세션 저장소 및 기본 키 기본값.
