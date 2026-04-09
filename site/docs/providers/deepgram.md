---
title: "Deepgram"
description: "수신 음성 메모를 위한 Deepgram 전사"
---

# Deepgram (오디오 전사)

Deepgram은 음성-텍스트 API입니다. OpenClaw에서는 `tools.media.audio`를 통한 **수신 오디오/음성 메모 전사**에 사용됩니다.

활성화하면 OpenClaw가 오디오 파일을 Deepgram에 업로드하고 트랜스크립트를 응답 파이프라인에 주입합니다(`{{Transcript}}` + `[Audio]` 블록). 이는 **스트리밍이 아닙니다**; 사전 녹음된 전사 엔드포인트를 사용합니다.

웹사이트: [https://deepgram.com](https://deepgram.com)  
문서: [https://developers.deepgram.com](https://developers.deepgram.com)

## 빠른 시작

1. API 키 설정:

```
DEEPGRAM_API_KEY=dg_...
```

2. 프로바이더 활성화:

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [{ provider: "deepgram", model: "nova-3" }],
      },
    },
  },
}
```

## 옵션

- `model`: Deepgram 모델 id (기본값: `nova-3`)
- `language`: 언어 힌트 (선택 사항)
- `tools.media.audio.providerOptions.deepgram.detect_language`: 언어 감지 활성화 (선택 사항)
- `tools.media.audio.providerOptions.deepgram.punctuate`: 문장 부호 활성화 (선택 사항)
- `tools.media.audio.providerOptions.deepgram.smart_format`: 스마트 형식 지정 활성화 (선택 사항)

언어 사용 예시:

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [{ provider: "deepgram", model: "nova-3", language: "en" }],
      },
    },
  },
}
```

Deepgram 옵션 사용 예시:

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        providerOptions: {
          deepgram: {
            detect_language: true,
            punctuate: true,
            smart_format: true,
          },
        },
        models: [{ provider: "deepgram", model: "nova-3" }],
      },
    },
  },
}
```

## 참고 사항

- 인증은 표준 프로바이더 인증 순서를 따릅니다; `DEEPGRAM_API_KEY`가 가장 간단한 경로입니다.
- 프록시를 사용하는 경우 `tools.media.audio.baseUrl` 및 `tools.media.audio.headers`로 엔드포인트 또는 헤더를 재정의하십시오.
- 출력은 다른 프로바이더와 동일한 오디오 규칙(크기 제한, 타임아웃, 트랜스크립트 주입)을 따릅니다.
