---
title: "음성 웨이크"
description: "전역 음성 웨이크 단어 (게이트웨이 소유) 및 노드 간 동기화 방법"
---

# 음성 웨이크 (전역 웨이크 단어)

OpenClaw는 **웨이크 단어를 게이트웨이**가 소유하는 **단일 전역 목록**으로 처리합니다.

- **노드별 사용자 정의 웨이크 단어는 없습니다**.
- **모든 노드/앱 UI가 목록을 편집할 수 있습니다.** 변경 사항은 게이트웨이에 의해 유지되고 모두에게 브로드캐스트됩니다.
- macOS와 iOS는 로컬 **음성 웨이크 활성화/비활성화** 토글을 유지합니다 (로컬 UX + 권한이 다름).
- Android는 현재 음성 웨이크를 꺼둔 상태로 두고 음성 탭에서 수동 마이크 흐름을 사용합니다.

## 저장소 (게이트웨이 호스트)

웨이크 단어는 게이트웨이 머신에 저장됩니다:

- `~/.openclaw/settings/voicewake.json`

형식:

```json
{ "triggers": ["openclaw", "claude", "computer"], "updatedAtMs": 1730000000000 }
```

## 프로토콜

### 메서드

- `voicewake.get` → `{ triggers: string[] }`
- `voicewake.set` 매개변수 `{ triggers: string[] }` → `{ triggers: string[] }`

참고:

- 트리거는 정규화됩니다 (트리밍, 비어 있는 항목 제거). 빈 목록은 기본값으로 폴백합니다.
- 안전을 위해 제한이 적용됩니다 (수/길이 제한).

### 이벤트

- `voicewake.changed` 페이로드 `{ triggers: string[] }`

수신하는 대상:

- 모든 WebSocket 클라이언트 (macOS 앱, WebChat 등)
- 모든 연결된 노드 (iOS/Android), 그리고 노드 연결 시 초기 "현재 상태" 푸시.

## 클라이언트 동작

### macOS 앱

- 전역 목록을 사용하여 `VoiceWakeRuntime` 트리거를 게이팅합니다.
- 음성 웨이크 설정에서 "트리거 단어" 편집 시 `voicewake.set`을 호출하고 다른 클라이언트와 동기화를 유지하기 위해 브로드캐스트에 의존합니다.

### iOS 노드

- 전역 목록을 사용하여 `VoiceWakeManager` 트리거 감지를 수행합니다.
- 설정에서 웨이크 단어 편집 시 (게이트웨이 WS를 통해) `voicewake.set`을 호출하고 로컬 웨이크 단어 감지도 반응하게 유지합니다.

### Android 노드

- 음성 웨이크는 현재 Android 런타임/설정에서 비활성화되어 있습니다.
- Android 음성은 웨이크 단어 트리거 대신 음성 탭의 수동 마이크 캡처를 사용합니다.
