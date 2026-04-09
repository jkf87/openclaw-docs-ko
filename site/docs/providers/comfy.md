---
title: "ComfyUI"
description: "OpenClaw에서 ComfyUI 워크플로우 이미지, 동영상, 음악 생성 설정"
---

# ComfyUI

OpenClaw는 워크플로우 기반 ComfyUI 실행을 위한 번들 `comfy` 플러그인을 제공합니다.

- 프로바이더: `comfy`
- 모델: `comfy/workflow`
- 공유 인터페이스: `image_generate`, `video_generate`, `music_generate`
- 인증: 로컬 ComfyUI는 없음; Comfy Cloud는 `COMFY_API_KEY` 또는 `COMFY_CLOUD_API_KEY`
- API: ComfyUI `/prompt` / `/history` / `/view` 및 Comfy Cloud `/api/*`

## 지원 기능

- 워크플로우 JSON에서 이미지 생성
- 1개의 업로드된 참조 이미지로 이미지 편집
- 워크플로우 JSON에서 동영상 생성
- 1개의 업로드된 참조 이미지로 동영상 생성
- 공유 `music_generate` 도구를 통한 음악 또는 오디오 생성
- 구성된 노드 또는 모든 일치하는 출력 노드에서 출력 다운로드

번들 플러그인은 워크플로우 기반이므로 OpenClaw는 일반적인 `size`, `aspectRatio`, `resolution`, `durationSeconds`, 또는 TTS 스타일 제어를 그래프에 매핑하려고 하지 않습니다.

## 구성 레이아웃

Comfy는 공유 최상위 연결 설정과 기능별 워크플로우 섹션을 지원합니다:

```json5
{
  models: {
    providers: {
      comfy: {
        mode: "local",
        baseUrl: "http://127.0.0.1:8188",
        image: {
          workflowPath: "./workflows/flux-api.json",
          promptNodeId: "6",
          outputNodeId: "9",
        },
        video: {
          workflowPath: "./workflows/video-api.json",
          promptNodeId: "12",
          outputNodeId: "21",
        },
        music: {
          workflowPath: "./workflows/music-api.json",
          promptNodeId: "3",
          outputNodeId: "18",
        },
      },
    },
  },
}
```

공유 키:

- `mode`: `local` 또는 `cloud`
- `baseUrl`: 로컬은 기본적으로 `http://127.0.0.1:8188`, 클라우드는 `https://cloud.comfy.org`
- `apiKey`: 환경 변수 대신 인라인 키 대안 (선택 사항)
- `allowPrivateNetwork`: 클라우드 모드에서 비공개/LAN `baseUrl` 허용

`image`, `video`, 또는 `music` 아래의 기능별 키:

- `workflow` 또는 `workflowPath`: 필수
- `promptNodeId`: 필수
- `promptInputName`: 기본값 `text`
- `outputNodeId`: 선택 사항
- `pollIntervalMs`: 선택 사항
- `timeoutMs`: 선택 사항

이미지 및 동영상 섹션에도 추가로 지원:

- `inputImageNodeId`: 참조 이미지를 전달할 때 필수
- `inputImageInputName`: 기본값 `image`

## 하위 호환성

기존 최상위 이미지 구성이 계속 작동합니다:

```json5
{
  models: {
    providers: {
      comfy: {
        workflowPath: "./workflows/flux-api.json",
        promptNodeId: "6",
        outputNodeId: "9",
      },
    },
  },
}
```

OpenClaw는 해당 레거시 형태를 이미지 워크플로우 구성으로 처리합니다.

## 이미지 워크플로우

기본 이미지 모델 설정:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "comfy/workflow",
      },
    },
  },
}
```

참조 이미지 편집 예시:

```json5
{
  models: {
    providers: {
      comfy: {
        image: {
          workflowPath: "./workflows/edit-api.json",
          promptNodeId: "6",
          inputImageNodeId: "7",
          inputImageInputName: "image",
          outputNodeId: "9",
        },
      },
    },
  },
}
```

## 동영상 워크플로우

기본 동영상 모델 설정:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "comfy/workflow",
      },
    },
  },
}
```

Comfy 동영상 워크플로우는 현재 구성된 그래프를 통해 텍스트-동영상 및 이미지-동영상을 지원합니다. OpenClaw는 Comfy 워크플로우에 입력 동영상을 전달하지 않습니다.

## 음악 워크플로우

번들 플러그인은 공유 `music_generate` 도구를 통해 노출되는 워크플로우 정의 오디오 또는 음악 출력을 위한 음악 생성 프로바이더를 등록합니다:

```text
/tool music_generate prompt="Warm ambient synth loop with soft tape texture"
```

`music` 구성 섹션을 사용하여 오디오 워크플로우 JSON 및 출력 노드를 지정하십시오.

## Comfy Cloud

`mode: "cloud"` 플러스 다음 중 하나를 사용하십시오:

- `COMFY_API_KEY`
- `COMFY_CLOUD_API_KEY`
- `models.providers.comfy.apiKey`

클라우드 모드는 동일한 `image`, `video`, `music` 워크플로우 섹션을 계속 사용합니다.

## 라이브 테스트

번들 플러그인에 대한 선택적 라이브 커버리지가 존재합니다:

```bash
OPENCLAW_LIVE_TEST=1 COMFY_LIVE_TEST=1 pnpm test:live -- extensions/comfy/comfy.live.test.ts
```

라이브 테스트는 일치하는 Comfy 워크플로우 섹션이 구성되지 않은 경우 개별 이미지, 동영상, 음악 케이스를 건너뜁니다.

## 관련 항목

- [이미지 생성](/tools/image-generation)
- [동영상 생성](/tools/video-generation)
- [음악 생성](/tools/music-generation)
- [프로바이더 디렉터리](/providers/index)
- [구성 참조](/gateway/configuration-reference#agent-defaults)
