---
title: "Alibaba Model Studio"
description: "OpenClaw에서 Alibaba Model Studio Wan 동영상 생성"
---

# Alibaba Model Studio

OpenClaw는 Alibaba Model Studio / DashScope의 Wan 모델을 위한 번들 `alibaba` 동영상 생성 프로바이더를 제공합니다.

- 프로바이더: `alibaba`
- 권장 인증: `MODELSTUDIO_API_KEY`
- 추가 허용: `DASHSCOPE_API_KEY`, `QWEN_API_KEY`
- API: DashScope / Model Studio 비동기 동영상 생성

## 빠른 시작

1. API 키 설정:

```bash
openclaw onboard --auth-choice qwen-standard-api-key
```

2. 기본 동영상 모델 설정:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "alibaba/wan2.6-t2v",
      },
    },
  },
}
```

## 내장 Wan 모델

번들 `alibaba` 프로바이더는 현재 다음을 등록합니다:

- `alibaba/wan2.6-t2v`
- `alibaba/wan2.6-i2v`
- `alibaba/wan2.6-r2v`
- `alibaba/wan2.6-r2v-flash`
- `alibaba/wan2.7-r2v`

## 현재 제한 사항

- 요청당 출력 동영상 최대 **1**개
- 입력 이미지 최대 **1**개
- 입력 동영상 최대 **4**개
- 최대 **10초** 길이
- `size`, `aspectRatio`, `resolution`, `audio`, `watermark` 지원
- 참조 이미지/동영상 모드는 현재 **원격 http(s) URL**이 필요합니다

## Qwen과의 관계

번들 `qwen` 프로바이더도 Wan 동영상 생성에 Alibaba 호스팅 DashScope 엔드포인트를 사용합니다. 다음과 같이 사용하십시오:

- `qwen/...`: 표준 Qwen 프로바이더 인터페이스를 원할 때
- `alibaba/...`: 직접 벤더 소유 Wan 동영상 인터페이스를 원할 때

## 관련 항목

- [동영상 생성](/tools/video-generation)
- [Qwen](/providers/qwen)
- [구성 참조](/gateway/configuration-reference#agent-defaults)
