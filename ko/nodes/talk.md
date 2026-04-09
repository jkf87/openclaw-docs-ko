---
summary: "Talk 모드: ElevenLabs TTS를 사용한 연속 음성 대화"
read_when:
  - Implementing Talk mode on macOS/iOS/Android
  - Changing voice/TTS/interrupt behavior
title: "Talk 모드"
---

# Talk 모드

Talk 모드는 연속 음성 대화 루프입니다:

1. 음성 청취
2. 전사 내용을 모델에 전송 (메인 세션, chat.send)
3. 응답 대기
4. 구성된 Talk 프로바이더(`talk.speak`)를 통해 음성으로 재생

## 동작 (macOS)

- Talk 모드가 활성화된 동안 **항상 표시 오버레이**.
- **청취 → 사고 → 발화** 단계 전환.
- **짧은 일시 정지**(침묵 창)에서 현재 전사 내용이 전송됩니다.
- 답변은 **WebChat에 작성됩니다** (타이핑과 동일).
- **음성으로 중단** (기본값 켜짐): 어시스턴트가 말하는 동안 사용자가 말을 시작하면 재생을 중지하고 다음 프롬프트에 대한 중단 타임스탬프를 기록합니다.

## 답변의 음성 지시문

어시스턴트는 답변 앞에 **단일 JSON 줄**을 붙여 음성을 제어할 수 있습니다:

```json
{ "voice": "<voice-id>", "once": true }
```

규칙:

- 첫 번째 비어 있지 않은 줄만.
- 알 수 없는 키는 무시됩니다.
- `once: true`는 현재 답변에만 적용됩니다.
- `once` 없이는 음성이 Talk 모드의 새 기본값이 됩니다.
- JSON 줄은 TTS 재생 전에 제거됩니다.

지원되는 키:

- `voice` / `voice_id` / `voiceId`
- `model` / `model_id` / `modelId`
- `speed`, `rate` (WPM), `stability`, `similarity`, `style`, `speakerBoost`
- `seed`, `normalize`, `lang`, `output_format`, `latency_tier`
- `once`

## 설정 (`~/.openclaw/openclaw.json`)

```json5
{
  talk: {
    voiceId: "elevenlabs_voice_id",
    modelId: "eleven_v3",
    outputFormat: "mp3_44100_128",
    apiKey: "elevenlabs_api_key",
    silenceTimeoutMs: 1500,
    interruptOnSpeech: true,
  },
}
```

기본값:

- `interruptOnSpeech`: true
- `silenceTimeoutMs`: 미설정 시, Talk는 전사 내용을 보내기 전에 플랫폼 기본 일시 정지 창을 유지합니다 (`macOS와 Android에서 700ms, iOS에서 900ms`)
- `voiceId`: `ELEVENLABS_VOICE_ID` / `SAG_VOICE_ID`로 폴백합니다 (API 키가 있는 경우 첫 번째 ElevenLabs 음성)
- `modelId`: 미설정 시 기본값 `eleven_v3`
- `apiKey`: `ELEVENLABS_API_KEY`로 폴백합니다 (게이트웨이 셸 프로필이 있는 경우)
- `outputFormat`: macOS/iOS에서 기본값 `pcm_44100`, Android에서 `pcm_24000` (MP3 스트리밍을 강제하려면 `mp3_*` 설정)

## macOS UI

- 메뉴 바 토글: **Talk**
- 설정 탭: **Talk 모드** 그룹 (음성 ID + 중단 토글)
- 오버레이:
  - **청취**: 마이크 레벨에 따라 구름이 맥동
  - **사고**: 가라앉는 애니메이션
  - **발화**: 방사형 링
  - 구름 클릭: 발화 중지
  - X 클릭: Talk 모드 종료

## 참고 사항

- 음성 + 마이크 권한이 필요합니다.
- 세션 키 `main`에 대해 `chat.send`를 사용합니다.
- 게이트웨이는 활성 Talk 프로바이더를 사용하여 `talk.speak`를 통해 Talk 재생을 확인합니다. Android는 해당 RPC를 사용할 수 없는 경우 로컬 시스템 TTS로만 폴백합니다.
- `eleven_v3`의 `stability`는 `0.0`, `0.5`, `1.0`으로 검증됩니다. 다른 모델은 `0..1`을 허용합니다.
- `latency_tier`는 설정된 경우 `0..4`로 검증됩니다.
- Android는 저지연 AudioTrack 스트리밍을 위해 `pcm_16000`, `pcm_22050`, `pcm_24000`, `pcm_44100` 출력 형식을 지원합니다.
