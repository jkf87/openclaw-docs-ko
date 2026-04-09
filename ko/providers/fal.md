---
title: "fal"
summary: "OpenClaw에서 fal 이미지 및 동영상 생성 설정"
read_when:
  - OpenClaw에서 fal 이미지 생성을 사용하려는 경우
  - FAL_KEY 인증 흐름이 필요한 경우
  - image_generate 또는 video_generate에 대한 fal 기본값을 원하는 경우
---

# fal

OpenClaw는 호스팅 이미지 및 동영상 생성을 위한 번들 `fal` 프로바이더를 제공합니다.

- 프로바이더: `fal`
- 인증: `FAL_KEY` (표준; `FAL_API_KEY`도 폴백으로 작동)
- API: fal 모델 엔드포인트

## 빠른 시작

1. API 키 설정:

```bash
openclaw onboard --auth-choice fal-api-key
```

2. 기본 이미지 모델 설정:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "fal/fal-ai/flux/dev",
      },
    },
  },
}
```

## 이미지 생성

번들 `fal` 이미지 생성 프로바이더는 기본적으로
`fal/fal-ai/flux/dev`를 사용합니다.

- 생성: 요청당 최대 4개 이미지
- 편집 모드: 활성화, 참조 이미지 1개
- `size`, `aspectRatio`, `resolution` 지원
- 현재 편집 주의 사항: fal 이미지 편집 엔드포인트는 `aspectRatio` 재정의를 **지원하지 않습니다**

fal을 기본 이미지 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "fal/fal-ai/flux/dev",
      },
    },
  },
}
```

## 동영상 생성

번들 `fal` 동영상 생성 프로바이더는 기본적으로
`fal/fal-ai/minimax/video-01-live`를 사용합니다.

- 모드: 텍스트-동영상 및 단일 이미지 참조 흐름
- 런타임: 장기 실행 작업을 위한 큐 기반 제출/상태/결과 흐름

fal을 기본 동영상 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "fal/fal-ai/minimax/video-01-live",
      },
    },
  },
}
```

## 관련 항목

- [이미지 생성](/tools/image-generation)
- [동영상 생성](/tools/video-generation)
- [구성 참조](/gateway/configuration-reference#agent-defaults)
