---
title: "이미지 생성"
description: "구성된 프로바이더를 사용하여 이미지를 생성하고 편집 (OpenAI, Google Gemini, fal, MiniMax, ComfyUI, Vydra)"
---

# 이미지 생성

`image_generate` 도구를 사용하면 에이전트가 구성된 프로바이더를 사용하여 이미지를 생성하고 편집할 수 있습니다. 생성된 이미지는 에이전트 응답에서 미디어 첨부 파일로 자동 전달됩니다.

::: info NOTE
이 도구는 적어도 하나의 이미지 생성 프로바이더를 사용할 수 있을 때만 나타납니다. 에이전트 도구에서 `image_generate`가 보이지 않으면 `agents.defaults.imageGenerationModel`을 구성하거나 프로바이더 API 키를 설정하십시오.
:::


## 빠른 시작

1. 적어도 하나의 프로바이더에 대한 API 키를 설정합니다 (예: `OPENAI_API_KEY` 또는 `GEMINI_API_KEY`).
2. 선택적으로 선호하는 모델을 설정합니다:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "openai/gpt-image-1",
      },
    },
  },
}
```

3. 에이전트에 요청합니다: _"Generate an image of a friendly lobster mascot."_

에이전트는 자동으로 `image_generate`를 호출합니다. 도구 허용 목록 추가가 필요하지 않습니다. 프로바이더를 사용할 수 있을 때 기본적으로 활성화됩니다.

## 지원 프로바이더

| 프로바이더 | 기본 모델                        | 편집 지원                          | API 키                                                |
| ---------- | -------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| OpenAI     | `gpt-image-1`                    | Yes (최대 5개 이미지)              | `OPENAI_API_KEY`                                      |
| Google     | `gemini-3.1-flash-image-preview` | Yes                                | `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`                |
| fal        | `fal-ai/flux/dev`                | Yes                                | `FAL_KEY`                                             |
| MiniMax    | `image-01`                       | Yes (주제 참조)                    | `MINIMAX_API_KEY` 또는 MiniMax OAuth (`minimax-portal`) |
| ComfyUI    | `workflow`                       | Yes (이미지 1개, 워크플로우 구성)  | `COMFY_API_KEY` 또는 클라우드용 `COMFY_CLOUD_API_KEY` |
| Vydra      | `grok-imagine`                   | No                                 | `VYDRA_API_KEY`                                       |

런타임에 사용 가능한 프로바이더와 모델을 검사하려면 `action: "list"`를 사용하십시오:

```
/tool image_generate action=list
```

## 도구 파라미터

| 파라미터      | 유형     | 설명                                                                           |
| ------------- | -------- | ------------------------------------------------------------------------------ |
| `prompt`      | string   | 이미지 생성 프롬프트 (`action: "generate"`에 필수)                             |
| `action`      | string   | `"generate"` (기본값) 또는 프로바이더 검사를 위한 `"list"`                     |
| `model`       | string   | 프로바이더/모델 재정의, 예: `openai/gpt-image-1`                               |
| `image`       | string   | 편집 모드를 위한 단일 참조 이미지 경로 또는 URL                                |
| `images`      | string[] | 편집 모드를 위한 여러 참조 이미지 (최대 5개)                                   |
| `size`        | string   | 크기 힌트: `1024x1024`, `1536x1024`, `1024x1536`, `1024x1792`, `1792x1024`     |
| `aspectRatio` | string   | 종횡비: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` |
| `resolution`  | string   | 해상도 힌트: `1K`, `2K`, 또는 `4K`                                             |
| `count`       | number   | 생성할 이미지 수 (1-4)                                                         |
| `filename`    | string   | 출력 파일명 힌트                                                               |

모든 프로바이더가 모든 파라미터를 지원하는 것은 아닙니다. 폴백 프로바이더가 정확히 요청된 것 대신 근접한 기하학 옵션을 지원하는 경우 OpenClaw는 제출 전에 가장 가까운 지원 크기, 종횡비, 또는 해상도로 다시 매핑합니다. 진정으로 지원되지 않는 재정의는 도구 결과에서 계속 보고됩니다.

도구 결과는 적용된 설정을 보고합니다. OpenClaw가 프로바이더 폴백 중 기하학을 다시 매핑하는 경우, 반환된 `size`, `aspectRatio`, `resolution` 값은 실제로 전송된 내용을 반영하고 `details.normalization`은 요청-적용 변환을 캡처합니다.

## 설정

### 모델 선택

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "openai/gpt-image-1",
        fallbacks: ["google/gemini-3.1-flash-image-preview", "fal/fal-ai/flux/dev"],
      },
    },
  },
}
```

### 프로바이더 선택 순서

이미지를 생성할 때 OpenClaw는 다음 순서로 프로바이더를 시도합니다:

1. 도구 호출의 **`model` 파라미터** (에이전트가 하나를 지정하는 경우)
2. 설정의 **`imageGenerationModel.primary`**
3. 순서대로 **`imageGenerationModel.fallbacks`**
4. **자동 감지** — 인증 기반 프로바이더 기본값만 사용:
   - 현재 기본 프로바이더 먼저
   - 나머지 등록된 이미지 생성 프로바이더를 프로바이더 ID 순서로

프로바이더가 실패하면 (인증 오류, 속도 제한 등) 다음 후보가 자동으로 시도됩니다. 모두 실패하면 오류에 각 시도의 세부 정보가 포함됩니다.

참고 사항:

- 자동 감지는 인증을 인식합니다. 프로바이더 기본값은 OpenClaw가 실제로 해당 프로바이더를 인증할 수 있는 경우에만 후보 목록에 들어갑니다.
- 자동 감지는 기본적으로 활성화됩니다. 이미지 생성이 명시적 `model`, `primary`, `fallbacks` 항목만 사용하도록 하려면 `agents.defaults.mediaGenerationAutoProviderFallback: false`를 설정하십시오.
- 현재 등록된 프로바이더, 기본 모델, 인증 환경 변수 힌트를 검사하려면 `action: "list"`를 사용하십시오.

### 이미지 편집

OpenAI, Google, fal, MiniMax, ComfyUI는 참조 이미지 편집을 지원합니다. 참조 이미지 경로 또는 URL을 전달하십시오:

```
"Generate a watercolor version of this photo" + image: "/path/to/photo.jpg"
```

OpenAI와 Google은 `images` 파라미터를 통해 최대 5개의 참조 이미지를 지원합니다. fal, MiniMax, ComfyUI는 1개를 지원합니다.

MiniMax 이미지 생성은 두 가지 번들 MiniMax 인증 경로 모두를 통해 사용할 수 있습니다:

- API 키 설정의 경우 `minimax/image-01`
- OAuth 설정의 경우 `minimax-portal/image-01`

## 프로바이더 기능

| 기능                  | OpenAI               | Google               | fal                 | MiniMax                    | ComfyUI                            | Vydra   |
| --------------------- | -------------------- | -------------------- | ------------------- | -------------------------- | ---------------------------------- | ------- |
| 생성                  | Yes (최대 4개)       | Yes (최대 4개)       | Yes (최대 4개)      | Yes (최대 9개)             | Yes (워크플로우 정의 출력)          | Yes (1) |
| 편집/참조             | Yes (최대 5개 이미지) | Yes (최대 5개 이미지) | Yes (1개 이미지)   | Yes (1개 이미지, 주제 참조) | Yes (1개 이미지, 워크플로우 구성)  | No      |
| 크기 제어             | Yes                  | Yes                  | Yes                 | No                         | No                                 | No      |
| 종횡비                | No                   | Yes                  | Yes (생성만 해당)   | Yes                        | No                                 | No      |
| 해상도 (1K/2K/4K)     | No                   | Yes                  | Yes                 | No                         | No                                 | No      |

## 관련 항목

- [도구 개요](/tools) — 모든 사용 가능한 에이전트 도구
- [fal](/providers/fal) — fal 이미지 및 비디오 프로바이더 설정
- [ComfyUI](/providers/comfy) — 로컬 ComfyUI 및 Comfy Cloud 워크플로우 설정
- [Google (Gemini)](/providers/google) — Gemini 이미지 프로바이더 설정
- [MiniMax](/providers/minimax) — MiniMax 이미지 프로바이더 설정
- [OpenAI](/providers/openai) — OpenAI 이미지 프로바이더 설정
- [Vydra](/providers/vydra) — Vydra 이미지, 비디오, 음성 설정
- [설정 레퍼런스](/gateway/configuration-reference#agent-defaults) — `imageGenerationModel` 설정
- [모델](/concepts/models) — 모델 설정 및 장애 조치
