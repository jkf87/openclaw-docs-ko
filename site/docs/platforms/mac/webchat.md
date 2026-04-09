---
title: "WebChat (macOS)"
description: "mac 앱이 게이트웨이 WebChat을 임베딩하는 방법 및 디버깅 방법"
---

# WebChat (macOS 앱)

macOS 메뉴 바 앱은 WebChat UI를 네이티브 SwiftUI 뷰로 임베딩합니다. 게이트웨이에 연결하고 선택된 에이전트의 **main 세션**을 기본으로 합니다 (다른 세션을 위한 세션 스위처 포함).

- **로컬 모드**: 로컬 게이트웨이 WebSocket에 직접 연결합니다.
- **원격 모드**: SSH를 통해 게이트웨이 제어 포트를 전달하고 해당 터널을 데이터 플레인으로 사용합니다.

## 시작 및 디버깅

- 수동: Lobster 메뉴 → "Open Chat".
- 테스트를 위한 자동 열기:

  ```bash
  dist/OpenClaw.app/Contents/MacOS/OpenClaw --webchat
  ```

- 로그: `./scripts/clawlog.sh` (서브시스템 `ai.openclaw`, 카테고리 `WebChatSwiftUI`).

## 연결 방식

- 데이터 플레인: 게이트웨이 WS 메서드 `chat.history`, `chat.send`, `chat.abort`, `chat.inject` 및 이벤트 `chat`, `agent`, `presence`, `tick`, `health`.
- `chat.history`는 표시 정규화된 전사 행을 반환합니다. 인라인 지시어 태그는 표시 텍스트에서 제거되고, 일반 텍스트 도구 호출 XML 페이로드 (`&lt;tool_call&gt;...&lt;/tool_call&gt;`, `&lt;function_call&gt;...&lt;/function_call&gt;`, `&lt;tool_calls&gt;...&lt;/tool_calls&gt;`, `&lt;function_calls&gt;...&lt;/function_calls&gt;` 포함) 및 잘린 도구 호출 블록과 누출된 ASCII/전각 모델 제어 토큰은 제거되며, 정확히 `NO_REPLY` / `no_reply`인 순수 무음 토큰 어시스턴트 행은 생략되고, 크기가 큰 행은 플레이스홀더로 교체될 수 있습니다.
- 세션: 기본값은 기본 세션 (`main`, 또는 범위가 전역인 경우 `global`). UI는 세션 간에 전환할 수 있습니다.
- 온보딩은 최초 실행 설정을 별도로 유지하기 위해 전용 세션을 사용합니다.

## 보안 표면

- 원격 모드는 SSH를 통해 게이트웨이 WebSocket 제어 포트만 전달합니다.

## 알려진 제한 사항

- UI는 채팅 세션에 최적화되어 있습니다 (전체 브라우저 샌드박스 아님).
