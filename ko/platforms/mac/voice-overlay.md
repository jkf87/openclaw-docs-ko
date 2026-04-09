---
summary: "wake 단어와 push-to-talk이 겹칠 때의 음성 오버레이 라이프사이클"
read_when:
  - 음성 오버레이 동작 조정 시
title: "음성 오버레이"
---

# 음성 오버레이 라이프사이클 (macOS)

대상: macOS 앱 기여자. 목표: wake 단어와 push-to-talk이 겹칠 때 음성 오버레이를 예측 가능하게 유지합니다.

## 현재 의도

- wake 단어로 인해 오버레이가 이미 표시된 상태에서 사용자가 핫키를 누르면 핫키 세션이 텍스트를 초기화하는 대신 _기존 텍스트를 채택합니다_. 오버레이는 핫키가 눌려 있는 동안 유지됩니다. 사용자가 해제하면: 트리밍된 텍스트가 있으면 전송하고, 없으면 닫습니다.
- Wake 단어만 있는 경우 여전히 침묵 시 자동 전송됩니다. Push-to-talk은 해제 시 즉시 전송됩니다.

## 구현됨 (2025년 12월 9일)

- 오버레이 세션은 이제 캡처 (wake 단어 또는 push-to-talk)당 토큰을 가집니다. 토큰이 일치하지 않으면 부분/최종/전송/닫기/레벨 업데이트가 삭제되어 오래된 콜백을 방지합니다.
- Push-to-talk은 접두사로 표시되는 오버레이 텍스트를 채택합니다 (핫키를 누르는 동안 wake 오버레이가 올라가 있으면 텍스트를 유지하고 새 음성을 추가). 최종 전사를 위해 최대 1.5초 기다린 후 현재 텍스트로 대체됩니다.
- 차임/오버레이 로깅은 카테고리 `voicewake.overlay`, `voicewake.ptt`, `voicewake.chime`에서 `info`로 내보내집니다 (세션 시작, 부분, 최종, 전송, 닫기, 차임 이유).

## 다음 단계

1. **VoiceSessionCoordinator (actor)**
   - 한 번에 정확히 하나의 `VoiceSession`을 소유합니다.
   - API (토큰 기반): `beginWakeCapture`, `beginPushToTalk`, `updatePartial`, `endCapture`, `cancel`, `applyCooldown`.
   - 오래된 토큰을 가진 콜백을 삭제합니다 (이전 인식기가 오버레이를 다시 열지 못하도록 방지).
2. **VoiceSession (model)**
   - 필드: `token`, `source` (wakeWord|pushToTalk), 커밋된/휘발성 텍스트, 차임 플래그, 타이머 (자동 전송, 유휴), `overlayMode` (display|editing|sending), 쿨다운 기한.
3. **오버레이 바인딩**
   - `VoiceSessionPublisher` (`ObservableObject`)가 활성 세션을 SwiftUI에 미러링합니다.
   - `VoiceWakeOverlayView`는 게시자를 통해서만 렌더링합니다. 글로벌 싱글톤을 직접 변경하지 않습니다.
   - 오버레이 사용자 작업 (`sendNow`, `dismiss`, `edit`)은 세션 토큰으로 코디네이터에 콜백합니다.
4. **통합 전송 경로**
   - `endCapture` 시: 트리밍된 텍스트가 비어 있으면 → 닫기; 그렇지 않으면 `performSend(session:)` (전송 차임 한 번 재생, 전달, 닫기).
   - Push-to-talk: 지연 없음; wake 단어: 자동 전송을 위한 선택적 지연.
   - Push-to-talk이 완료된 후 wake 런타임에 짧은 쿨다운을 적용하여 wake 단어가 즉시 재트리거되지 않도록 합니다.
5. **로깅**
   - 코디네이터는 서브시스템 `ai.openclaw`, 카테고리 `voicewake.overlay` 및 `voicewake.chime`에서 `.info` 로그를 내보냅니다.
   - 주요 이벤트: `session_started`, `adopted_by_push_to_talk`, `partial`, `finalized`, `send`, `dismiss`, `cancel`, `cooldown`.

## 디버깅 체크리스트

- 고착된 오버레이를 재현하는 동안 로그를 스트리밍합니다:

  ```bash
  sudo log stream --predicate 'subsystem == "ai.openclaw" AND category CONTAINS "voicewake"' --level info --style compact
  ```

- 활성 세션 토큰이 하나만 있는지 확인합니다. 오래된 콜백은 코디네이터에서 삭제되어야 합니다.
- Push-to-talk 해제가 항상 활성 토큰으로 `endCapture`를 호출하는지 확인합니다. 텍스트가 비어 있으면 차임이나 전송 없이 `dismiss`가 예상됩니다.

## 마이그레이션 단계 (제안)

1. `VoiceSessionCoordinator`, `VoiceSession`, `VoiceSessionPublisher`를 추가합니다.
2. `VoiceWakeRuntime`을 `VoiceWakeOverlayController`를 직접 건드리는 대신 세션을 생성/업데이트/종료하도록 리팩토링합니다.
3. `VoicePushToTalk`을 기존 세션을 채택하고 해제 시 `endCapture`를 호출하도록 리팩토링합니다. 런타임 쿨다운을 적용합니다.
4. `VoiceWakeOverlayController`를 게시자에 연결합니다. 런타임/PTT에서 직접 호출을 제거합니다.
5. 세션 채택, 쿨다운, 빈 텍스트 닫기에 대한 통합 테스트를 추가합니다.
