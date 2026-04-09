---
title: "비디오 생성"
description: "12개 프로바이더 백엔드를 사용하여 텍스트, 이미지, 또는 기존 비디오에서 비디오 생성"
---

# 비디오 생성

OpenClaw 에이전트는 텍스트 프롬프트, 참조 이미지, 또는 기존 비디오에서 비디오를 생성할 수 있습니다. 12개의 프로바이더 백엔드가 지원되며, 각각 다른 모델 옵션, 입력 모드, 기능 세트를 가지고 있습니다. 에이전트는 설정 및 사용 가능한 API 키를 기반으로 올바른 프로바이더를 자동으로 선택합니다.

::: info NOTE
`video_generate` 도구는 적어도 하나의 비디오 생성 프로바이더를 사용할 수 있을 때만 나타납니다. 에이전트 도구에서 보이지 않으면 프로바이더 API 키를 설정하거나 `agents.defaults.videoGenerationModel`을 구성하십시오.
:::


OpenClaw는 비디오 생성을 세 가지 런타임 모드로 처리합니다:

- 참조 미디어 없이 텍스트에서 비디오 요청을 위한 `generate`
- 요청에 하나 이상의 참조 이미지가 포함된 경우의 `imageToVideo`
- 요청에 하나 이상의 참조 비디오가 포함된 경우의 `videoToVideo`

프로바이더는 이러한 모드의 임의 하위 집합을 지원할 수 있습니다. 도구는 제출 전에 활성 모드를 검증하고 `action=list`에서 지원되는 모드를 보고합니다.

## 빠른 시작

1. 지원되는 프로바이더에 대한 API 키를 설정합니다:

```bash
export GEMINI_API_KEY="your-key"
```

2. 선택적으로 기본 모델을 고정합니다:

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "google/veo-3.1-fast-generate-preview"
```

3. 에이전트에 요청합니다:

> Generate a 5-second cinematic video of a friendly lobster surfing at sunset.

에이전트는 자동으로 `video_generate`를 호출합니다. 도구 허용 목록 추가가 필요하지 않습니다.

## 비디오 생성 시 발생하는 일

비디오 생성은 비동기적입니다. 에이전트가 세션에서 `video_generate`를 호출하면:

1. OpenClaw는 요청을 프로바이더에 제출하고 즉시 작업 ID를 반환합니다.
2. 프로바이더는 백그라운드에서 작업을 처리합니다 (프로바이더 및 해상도에 따라 일반적으로 30초~5분 소요).
3. 비디오가 준비되면 OpenClaw는 내부 완료 이벤트로 동일한 세션을 깨웁니다.
4. 에이전트는 완성된 비디오를 원래 대화로 게시합니다.

작업이 진행 중인 동안 동일한 세션에서 중복 `video_generate` 호출은 새 생성을 시작하는 대신 현재 작업 상태를 반환합니다. CLI에서 `openclaw tasks list` 또는 `openclaw tasks show &lt;taskId&gt;`를 사용하여 진행 상황을 확인하십시오.

세션 기반 에이전트 실행 외부에서 (예: 직접 도구 호출), 도구는 인라인 생성으로 폴백하고 동일한 턴에서 최종 미디어 경로를 반환합니다.

### 작업 수명 주기

각 `video_generate` 요청은 네 가지 상태를 거칩니다:

1. **queued** -- 작업이 생성되고 프로바이더가 수락을 기다리는 중.
2. **running** -- 프로바이더가 처리 중 (프로바이더 및 해상도에 따라 일반적으로 30초~5분 소요).
3. **succeeded** -- 비디오 준비됨; 에이전트가 깨어나 대화에 게시합니다.
4. **failed** -- 프로바이더 오류 또는 타임아웃; 에이전트가 오류 세부 정보와 함께 깨어납니다.

CLI에서 상태 확인:

```bash
openclaw tasks list
openclaw tasks show &lt;taskId&gt;
openclaw tasks cancel &lt;taskId&gt;
```

중복 방지: 현재 세션에 대해 비디오 작업이 이미 `queued` 또는 `running` 상태인 경우 `video_generate`는 새 작업을 시작하는 대신 기존 작업 상태를 반환합니다. 새 생성을 트리거하지 않고 명시적으로 확인하려면 `action: "status"`를 사용하십시오.

## 지원 프로바이더

| 프로바이더 | 기본 모델                       | 텍스트 | 이미지 참조       | 비디오 참조      | API 키                                   |
| ---------- | ------------------------------- | ------ | ----------------- | ---------------- | ---------------------------------------- |
| Alibaba    | `wan2.6-t2v`                    | Yes    | Yes (원격 URL)    | Yes (원격 URL)   | `MODELSTUDIO_API_KEY`                    |
| BytePlus   | `seedance-1-0-lite-t2v-250428`  | Yes    | 이미지 1개        | No               | `BYTEPLUS_API_KEY`                       |
| ComfyUI    | `workflow`                      | Yes    | 이미지 1개        | No               | `COMFY_API_KEY` 또는 `COMFY_CLOUD_API_KEY` |
| fal        | `fal-ai/minimax/video-01-live`  | Yes    | 이미지 1개        | No               | `FAL_KEY`                                |
| Google     | `veo-3.1-fast-generate-preview` | Yes    | 이미지 1개        | 비디오 1개       | `GEMINI_API_KEY`                         |
| MiniMax    | `MiniMax-Hailuo-2.3`            | Yes    | 이미지 1개        | No               | `MINIMAX_API_KEY`                        |
| OpenAI     | `sora-2`                        | Yes    | 이미지 1개        | 비디오 1개       | `OPENAI_API_KEY`                         |
| Qwen       | `wan2.6-t2v`                    | Yes    | Yes (원격 URL)    | Yes (원격 URL)   | `QWEN_API_KEY`                           |
| Runway     | `gen4.5`                        | Yes    | 이미지 1개        | 비디오 1개       | `RUNWAYML_API_SECRET`                    |
| Together   | `Wan-AI/Wan2.2-T2V-A14B`        | Yes    | 이미지 1개        | No               | `TOGETHER_API_KEY`                       |
| Vydra      | `veo3`                          | Yes    | 이미지 1개 (`kling`) | No            | `VYDRA_API_KEY`                          |
| xAI        | `grok-imagine-video`            | Yes    | 이미지 1개        | 비디오 1개       | `XAI_API_KEY`                            |

일부 프로바이더는 추가 또는 대체 API 키 환경 변수를 허용합니다. 자세한 내용은 개별 [프로바이더 페이지](#related)를 참조하십시오.

런타임에 사용 가능한 프로바이더, 모델 및 런타임 모드를 검사하려면 `video_generate action=list`를 실행하십시오.

### 선언된 기능 매트릭스

이것은 `video_generate`, 계약 테스트, 공유 라이브 스윕에서 사용하는 명시적 모드 계약입니다.

| 프로바이더 | `generate` | `imageToVideo` | `videoToVideo` | 오늘의 공유 라이브 레인                                                                                                                   |
| ---------- | ---------- | -------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Alibaba    | Yes        | Yes            | Yes            | `generate`, `imageToVideo`; `videoToVideo`는 이 프로바이더가 원격 `http(s)` 비디오 URL이 필요하기 때문에 건너뜁니다                     |
| BytePlus   | Yes        | Yes            | No             | `generate`, `imageToVideo`                                                                                                               |
| ComfyUI    | Yes        | Yes            | No             | 공유 스윕에 없음; 워크플로우별 커버리지는 Comfy 테스트와 함께 있음                                                                      |
| fal        | Yes        | Yes            | No             | `generate`, `imageToVideo`                                                                                                               |
| Google     | Yes        | Yes            | Yes            | `generate`, `imageToVideo`; 공유 `videoToVideo`는 현재 버퍼 기반 Gemini/Veo 스윕이 해당 입력을 허용하지 않기 때문에 건너뜁니다          |
| MiniMax    | Yes        | Yes            | No             | `generate`, `imageToVideo`                                                                                                               |
| OpenAI     | Yes        | Yes            | Yes            | `generate`, `imageToVideo`; 공유 `videoToVideo`는 이 조직/입력 경로가 현재 프로바이더 측 inpaint/remix 액세스가 필요하기 때문에 건너뜁니다 |
| Qwen       | Yes        | Yes            | Yes            | `generate`, `imageToVideo`; `videoToVideo`는 이 프로바이더가 원격 `http(s)` 비디오 URL이 필요하기 때문에 건너뜁니다                     |
| Runway     | Yes        | Yes            | Yes            | `generate`, `imageToVideo`; `videoToVideo`는 선택된 모델이 `runway/gen4_aleph`일 때만 실행됩니다                                        |
| Together   | Yes        | Yes            | No             | `generate`, `imageToVideo`                                                                                                               |
| Vydra      | Yes        | Yes            | No             | `generate`; 공유 `imageToVideo`는 번들된 `veo3`가 텍스트 전용이고 번들된 `kling`이 원격 이미지 URL을 필요로 하기 때문에 건너뜁니다      |
| xAI        | Yes        | Yes            | Yes            | `generate`, `imageToVideo`; `videoToVideo`는 이 프로바이더가 현재 원격 MP4 URL이 필요하기 때문에 건너뜁니다                             |

## 도구 파라미터

### 필수

| 파라미터  | 유형   | 설명                                                                   |
| --------- | ------ | ---------------------------------------------------------------------- |
| `prompt`  | string | 생성할 비디오의 텍스트 설명 (`action: "generate"`에 필수)              |

### 콘텐츠 입력

| 파라미터  | 유형     | 설명                                   |
| --------- | -------- | -------------------------------------- |
| `image`   | string   | 단일 참조 이미지 (경로 또는 URL)       |
| `images`  | string[] | 여러 참조 이미지 (최대 5개)            |
| `video`   | string   | 단일 참조 비디오 (경로 또는 URL)       |
| `videos`  | string[] | 여러 참조 비디오 (최대 4개)            |

### 스타일 제어

| 파라미터          | 유형    | 설명                                                              |
| ----------------- | ------- | ----------------------------------------------------------------- |
| `aspectRatio`     | string  | `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` |
| `resolution`      | string  | `480P`, `720P`, `768P`, 또는 `1080P`                              |
| `durationSeconds` | number  | 목표 지속 시간 (초) (가장 가까운 프로바이더 지원 값으로 반올림)   |
| `size`            | string  | 프로바이더가 지원하는 경우 크기 힌트                              |
| `audio`           | boolean | 지원되는 경우 생성된 오디오 활성화                                |
| `watermark`       | boolean | 지원되는 경우 프로바이더 워터마킹 토글                            |

### 고급

| 파라미터   | 유형   | 설명                                       |
| ---------- | ------ | ------------------------------------------ |
| `action`   | string | `"generate"` (기본값), `"status"`, 또는 `"list"` |
| `model`    | string | 프로바이더/모델 재정의 (예: `runway/gen4.5`) |
| `filename` | string | 출력 파일명 힌트                           |

모든 프로바이더가 모든 파라미터를 지원하는 것은 아닙니다. OpenClaw는 이미 지속 시간을 가장 가까운 프로바이더 지원 값으로 정규화하며, 폴백 프로바이더가 다른 제어 표면을 노출하는 경우 크기-종횡비와 같은 변환된 기하학 힌트도 다시 매핑합니다. 진정으로 지원되지 않는 재정의는 최선 노력으로 무시되고 도구 결과에서 경고로 보고됩니다. 하드 기능 제한 (참조 입력 너무 많음 등)은 제출 전에 실패합니다.

도구 결과는 적용된 설정을 보고합니다. OpenClaw가 프로바이더 폴백 중 지속 시간 또는 기하학을 다시 매핑하는 경우, 반환된 `durationSeconds`, `size`, `aspectRatio`, `resolution` 값은 제출된 내용을 반영하고 `details.normalization`은 요청-적용 변환을 캡처합니다.

참조 입력은 런타임 모드도 선택합니다:

- 참조 미디어 없음: `generate`
- 이미지 참조 있음: `imageToVideo`
- 비디오 참조 있음: `videoToVideo`

혼합 이미지 및 비디오 참조는 안정적인 공유 기능 표면이 아닙니다.
요청당 하나의 참조 유형을 선호하십시오.

## 액션

- **generate** (기본값) -- 지정된 프롬프트 및 선택적 참조 입력에서 비디오를 생성합니다.
- **status** -- 새 생성을 시작하지 않고 현재 세션의 진행 중인 비디오 작업 상태를 확인합니다.
- **list** -- 사용 가능한 프로바이더, 모델 및 기능을 표시합니다.

## 모델 선택

비디오를 생성할 때 OpenClaw는 다음 순서로 모델을 결정합니다:

1. **`model` 도구 파라미터** -- 에이전트가 호출에서 하나를 지정하는 경우.
2. **`videoGenerationModel.primary`** -- 설정에서.
3. **`videoGenerationModel.fallbacks`** -- 순서대로 시도됩니다.
4. **자동 감지** -- 유효한 인증이 있는 프로바이더를 사용하며, 현재 기본 프로바이더부터 시작한 다음 알파벳 순서로 나머지 프로바이더를 사용합니다.

프로바이더가 실패하면 다음 후보가 자동으로 시도됩니다. 모든 후보가 실패하면 오류에 각 시도의 세부 정보가 포함됩니다.

명시적 `model`, `primary`, `fallbacks` 항목만 비디오 생성에 사용하려면 `agents.defaults.mediaGenerationAutoProviderFallback: false`를 설정하십시오.

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "google/veo-3.1-fast-generate-preview",
        fallbacks: ["runway/gen4.5", "qwen/wan2.6-t2v"],
      },
    },
  },
}
```

## 프로바이더 참고 사항

| 프로바이더 | 참고 사항                                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alibaba    | DashScope/Model Studio 비동기 엔드포인트 사용. 참조 이미지와 비디오는 원격 `http(s)` URL이어야 합니다.                                                    |
| BytePlus   | 단일 이미지 참조만 가능.                                                                                                                                    |
| ComfyUI    | 워크플로우 기반 로컬 또는 클라우드 실행. 구성된 그래프를 통해 텍스트-비디오 및 이미지-비디오를 지원합니다.                                                  |
| fal        | 장기 실행 작업에 대한 큐 기반 흐름 사용. 단일 이미지 참조만 가능.                                                                                          |
| Google     | Gemini/Veo 사용. 하나의 이미지 또는 하나의 비디오 참조를 지원합니다.                                                                                       |
| MiniMax    | 단일 이미지 참조만 가능.                                                                                                                                    |
| OpenAI     | `size` 재정의만 전달됩니다. 다른 스타일 재정의 (`aspectRatio`, `resolution`, `audio`, `watermark`)는 경고와 함께 무시됩니다.                                |
| Qwen       | Alibaba와 동일한 DashScope 백엔드. 참조 입력은 원격 `http(s)` URL이어야 합니다. 로컬 파일은 사전에 거부됩니다.                                              |
| Runway     | 데이터 URI를 통한 로컬 파일 지원. 비디오-비디오에는 `runway/gen4_aleph`가 필요합니다. 텍스트 전용 실행은 `16:9` 및 `9:16` 종횡비를 노출합니다.             |
| Together   | 단일 이미지 참조만 가능.                                                                                                                                    |
| Vydra      | 인증 드롭 리디렉션을 피하기 위해 `https://www.vydra.ai/api/v1`을 직접 사용합니다. `veo3`는 텍스트-비디오 전용으로 번들됩니다. `kling`은 원격 이미지 URL이 필요합니다. |
| xAI        | 텍스트-비디오, 이미지-비디오, 원격 비디오 편집/확장 흐름을 지원합니다.                                                                                    |

## 프로바이더 기능 모드

공유 비디오 생성 계약은 이제 프로바이더가 평면적 집계 제한만이 아닌 모드별 기능을 선언할 수 있도록 합니다. 새 프로바이더 구현은 명시적 모드 블록을 선호해야 합니다:

```typescript
capabilities: {
  generate: {
    maxVideos: 1,
    maxDurationSeconds: 10,
    supportsResolution: true,
  },
  imageToVideo: {
    enabled: true,
    maxVideos: 1,
    maxInputImages: 1,
    maxDurationSeconds: 5,
  },
  videoToVideo: {
    enabled: true,
    maxVideos: 1,
    maxInputVideos: 1,
    maxDurationSeconds: 5,
  },
}
```

`maxInputImages` 및 `maxInputVideos`와 같은 평면적 집계 필드는 변환 모드 지원을 광고하기에 충분하지 않습니다. 프로바이더는 라이브 테스트, 계약 테스트, 공유 `video_generate` 도구가 모드 지원을 결정론적으로 검증할 수 있도록 `generate`, `imageToVideo`, `videoToVideo`를 명시적으로 선언해야 합니다.

## 라이브 테스트

공유 번들 프로바이더에 대한 옵트인 라이브 커버리지:

```bash
OPENCLAW_LIVE_TEST=1 pnpm test:live -- extensions/video-generation-providers.live.test.ts
```

레포 래퍼:

```bash
pnpm test:live:media video
```

이 라이브 파일은 `~/.profile`에서 누락된 프로바이더 환경 변수를 로드하고, 저장된 인증 프로파일보다 라이브/환경 API 키를 우선시하며, 로컬 미디어로 안전하게 실행할 수 있는 선언된 모드를 실행합니다:

- 스윕의 모든 프로바이더에 대해 `generate`
- `capabilities.imageToVideo.enabled`인 경우 `imageToVideo`
- `capabilities.videoToVideo.enabled`이고 프로바이더/모델이 공유 스윕에서 버퍼 기반 로컬 비디오 입력을 허용하는 경우 `videoToVideo`

오늘 공유 `videoToVideo` 라이브 레인은 다음을 커버합니다:

- `runway/gen4_aleph`을 선택한 경우에만 `runway`

## 설정

OpenClaw 설정에서 기본 비디오 생성 모델을 설정합니다:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "qwen/wan2.6-t2v",
        fallbacks: ["qwen/wan2.6-r2v-flash"],
      },
    },
  },
}
```

또는 CLI를 통해:

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "qwen/wan2.6-t2v"
```

## 관련 항목

- [도구 개요](/tools)
- [백그라운드 작업](/automation/tasks) -- 비동기 비디오 생성을 위한 작업 추적
- [Alibaba Model Studio](/providers/alibaba)
- [BytePlus](/concepts/model-providers#byteplus-international)
- [ComfyUI](/providers/comfy)
- [fal](/providers/fal)
- [Google (Gemini)](/providers/google)
- [MiniMax](/providers/minimax)
- [OpenAI](/providers/openai)
- [Qwen](/providers/qwen)
- [Runway](/providers/runway)
- [Together AI](/providers/together)
- [Vydra](/providers/vydra)
- [xAI](/providers/xai)
- [설정 레퍼런스](/gateway/configuration-reference#agent-defaults)
- [모델](/concepts/models)
