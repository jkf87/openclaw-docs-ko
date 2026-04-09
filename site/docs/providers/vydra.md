---
title: "Vydra"
description: "OpenClaw에서 Vydra 이미지, 비디오, 음성 사용"
---

# Vydra

번들 Vydra 플러그인은 다음을 추가합니다:

- `vydra/grok-imagine`을 통한 이미지 생성
- `vydra/veo3` 및 `vydra/kling`을 통한 비디오 생성
- Vydra의 ElevenLabs 기반 TTS 라우트를 통한 음성 합성

OpenClaw는 세 가지 기능 모두에 동일한 `VYDRA_API_KEY`를 사용합니다.

## 중요한 기본 URL

`https://www.vydra.ai/api/v1`을 사용하십시오.

Vydra의 최상위 호스트(`https://vydra.ai/api/v1`)는 현재 `www`로 리디렉션됩니다. 일부 HTTP 클라이언트는 해당 크로스 호스트 리디렉션에서 `Authorization`을 제거하여 유효한 API 키를 오해의 소지가 있는 인증 실패로 바꿉니다. 번들 플러그인은 이를 방지하기 위해 `www` 기본 URL을 직접 사용합니다.

## 설정

대화형 온보딩:

```bash
openclaw onboard --auth-choice vydra-api-key
```

또는 환경 변수를 직접 설정하십시오:

```bash
export VYDRA_API_KEY="vydra_live_..."
```

## 이미지 생성

기본 이미지 모델:

- `vydra/grok-imagine`

기본 이미지 프로바이더로 설정:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "vydra/grok-imagine",
      },
    },
  },
}
```

현재 번들 지원은 텍스트-투-이미지만 지원합니다. Vydra의 호스팅 편집 라우트는 원격 이미지 URL을 기대하며, OpenClaw는 번들 플러그인에 Vydra 특화 업로드 브리지를 아직 추가하지 않았습니다.

공유 도구 동작은 [이미지 생성](/tools/image-generation)을 참조하십시오.

## 비디오 생성

등록된 비디오 모델:

- 텍스트-투-비디오용 `vydra/veo3`
- 이미지-투-비디오용 `vydra/kling`

Vydra를 기본 비디오 프로바이더로 설정:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "vydra/veo3",
      },
    },
  },
}
```

참고 사항:

- `vydra/veo3`는 텍스트-투-비디오 전용으로 번들됩니다.
- `vydra/kling`은 현재 원격 이미지 URL 참조가 필요합니다. 로컬 파일 업로드는 사전에 거부됩니다.
- Vydra의 현재 `kling` HTTP 라우트는 `image_url` 또는 `video_url`을 요구하는지에 대해 일관성이 없었습니다; 번들 프로바이더는 동일한 원격 이미지 URL을 두 필드 모두에 매핑합니다.
- 번들 플러그인은 종횡비, 해상도, 워터마크, 생성된 오디오와 같은 문서화되지 않은 스타일 조정을 전달하지 않습니다.

프로바이더 특화 라이브 커버리지:

```bash
OPENCLAW_LIVE_TEST=1 \
OPENCLAW_LIVE_VYDRA_VIDEO=1 \
pnpm test:live -- extensions/vydra/vydra.live.test.ts
```

번들 Vydra 라이브 파일은 이제 다음을 커버합니다:

- `vydra/veo3` 텍스트-투-비디오
- 원격 이미지 URL을 사용한 `vydra/kling` 이미지-투-비디오

필요 시 원격 이미지 픽스처를 재정의하십시오:

```bash
export OPENCLAW_LIVE_VYDRA_KLING_IMAGE_URL="https://example.com/reference.png"
```

공유 도구 동작은 [비디오 생성](/tools/video-generation)을 참조하십시오.

## 음성 합성

Vydra를 음성 프로바이더로 설정:

```json5
{
  messages: {
    tts: {
      provider: "vydra",
      providers: {
        vydra: {
          apiKey: "${VYDRA_API_KEY}",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
        },
      },
    },
  },
}
```

기본값:

- 모델: `elevenlabs/tts`
- 음성 id: `21m00Tcm4TlvDq8ikWAM`

번들 플러그인은 현재 알려진 하나의 좋은 기본 음성을 노출하고 MP3 오디오 파일을 반환합니다.

## 관련

- [프로바이더 디렉토리](/providers/index)
- [이미지 생성](/tools/image-generation)
- [비디오 생성](/tools/video-generation)
