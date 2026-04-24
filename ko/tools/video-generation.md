---
summary: "14개의 provider 백엔드를 사용하여 텍스트, 이미지 또는 기존 영상으로부터 video를 생성합니다"
read_when:
  - 에이전트를 통해 video를 생성할 때
  - video generation provider와 모델을 구성할 때
  - video_generate 도구 파라미터를 이해할 때
title: "비디오 생성 (Video generation)"
---

OpenClaw 에이전트는 텍스트 prompt, reference 이미지 또는 기존 영상으로부터 video를 생성할 수 있습니다. 14개의 provider 백엔드가 지원되며, 각 provider는 모델 옵션, 입력 모드, 기능이 다릅니다. 에이전트는 사용자의 구성과 사용 가능한 API key를 바탕으로 적절한 provider를 자동으로 선택합니다.

<Note>
`video_generate` 도구는 최소 하나의 video-generation provider가 사용 가능할 때만 노출됩니다. 에이전트 도구 목록에 보이지 않는다면 provider API key를 설정하거나 `agents.defaults.videoGenerationModel`을 구성하세요.
</Note>

OpenClaw는 video generation을 세 가지 런타임 모드로 취급합니다.

- `generate` — reference 미디어가 없는 text-to-video 요청
- `imageToVideo` — 요청에 하나 이상의 reference 이미지가 포함될 때
- `videoToVideo` — 요청에 하나 이상의 reference 영상이 포함될 때

Provider는 이 모드들 중 임의의 부분집합을 지원할 수 있습니다. 도구는 제출 전에 활성 모드를 검증하며, `action=list`에서 지원 모드를 보고합니다.

## 빠른 시작

1. 지원되는 아무 provider의 API key를 설정합니다.

```bash
export GEMINI_API_KEY="your-key"
```

2. 선택적으로 기본 모델을 고정합니다.

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "google/veo-3.1-fast-generate-preview"
```

3. 에이전트에게 요청합니다.

> 노을 속에서 서핑하는 친근한 랍스터의 5초짜리 cinematic video를 생성해줘.

에이전트는 `video_generate`를 자동으로 호출합니다. 도구 allow-list 설정은 필요 없습니다.

## 비디오 생성 시 일어나는 일

Video generation은 비동기입니다. 에이전트가 세션에서 `video_generate`를 호출하면 다음과 같이 동작합니다.

1. OpenClaw가 요청을 provider에 제출하고 즉시 task ID를 반환합니다.
2. Provider가 백그라운드에서 작업을 처리합니다(일반적으로 provider와 해상도에 따라 30초에서 5분).
3. 비디오가 준비되면 OpenClaw가 내부 completion event로 같은 세션을 깨웁니다.
4. 에이전트가 완성된 video를 원래 대화에 다시 게시합니다.

작업이 진행 중인 동안 같은 세션에서 발생하는 중복 `video_generate` 호출은 새 generation을 시작하지 않고 현재 task 상태를 반환합니다. CLI에서 진행 상황을 확인하려면 `openclaw tasks list` 또는 `openclaw tasks show <taskId>`를 사용하세요.

세션 기반 에이전트 실행이 아닌 경우(예: 직접 도구 호출)에는 도구가 인라인 generation으로 fallback 하여 같은 턴에 최종 미디어 경로를 반환합니다.

### Task 라이프사이클

`video_generate` 요청은 네 가지 상태를 거칩니다.

1. **queued** — task 생성됨, provider가 수락하기를 대기 중.
2. **running** — provider가 처리 중(provider와 해상도에 따라 일반적으로 30초에서 5분).
3. **succeeded** — 비디오 준비 완료; 에이전트가 깨어나 대화에 게시.
4. **failed** — provider 오류 또는 타임아웃; 에이전트가 오류 상세와 함께 깨어남.

CLI에서 상태 확인:

```bash
openclaw tasks list
openclaw tasks show <taskId>
openclaw tasks cancel <taskId>
```

중복 방지: 현재 세션에 이미 `queued` 또는 `running` 상태인 video task가 있으면, `video_generate`는 새 task를 시작하지 않고 기존 task 상태를 반환합니다. 새 generation을 트리거하지 않고 명시적으로 확인하려면 `action: "status"`를 사용하세요.

## 지원 provider

| Provider              | 기본 모델                       | 텍스트 | 이미지 ref                                       | 비디오 ref        | API key                                    |
| --------------------- | ------------------------------- | ------ | ------------------------------------------------ | ----------------- | ------------------------------------------ |
| Alibaba               | `wan2.6-t2v`                    | 지원   | 지원(remote URL)                                 | 지원(remote URL)  | `MODELSTUDIO_API_KEY`                      |
| BytePlus (1.0)        | `seedance-1-0-pro-250528`       | 지원   | 최대 2장(I2V 모델만, first + last frame)         | 미지원            | `BYTEPLUS_API_KEY`                         |
| BytePlus Seedance 1.5 | `seedance-1-5-pro-251215`       | 지원   | 최대 2장(role로 first + last frame 지정)         | 미지원            | `BYTEPLUS_API_KEY`                         |
| BytePlus Seedance 2.0 | `dreamina-seedance-2-0-260128`  | 지원   | 최대 9장의 reference 이미지                      | 최대 3개의 비디오 | `BYTEPLUS_API_KEY`                         |
| ComfyUI               | `workflow`                      | 지원   | 1장                                              | 미지원            | `COMFY_API_KEY` 또는 `COMFY_CLOUD_API_KEY` |
| fal                   | `fal-ai/minimax/video-01-live`  | 지원   | 1장                                              | 미지원            | `FAL_KEY`                                  |
| Google                | `veo-3.1-fast-generate-preview` | 지원   | 1장                                              | 1개               | `GEMINI_API_KEY`                           |
| MiniMax               | `MiniMax-Hailuo-2.3`            | 지원   | 1장                                              | 미지원            | `MINIMAX_API_KEY`                          |
| OpenAI                | `sora-2`                        | 지원   | 1장                                              | 1개               | `OPENAI_API_KEY`                           |
| Qwen                  | `wan2.6-t2v`                    | 지원   | 지원(remote URL)                                 | 지원(remote URL)  | `QWEN_API_KEY`                             |
| Runway                | `gen4.5`                        | 지원   | 1장                                              | 1개               | `RUNWAYML_API_SECRET`                      |
| Together              | `Wan-AI/Wan2.2-T2V-A14B`        | 지원   | 1장                                              | 미지원            | `TOGETHER_API_KEY`                         |
| Vydra                 | `veo3`                          | 지원   | 1장(`kling`)                                     | 미지원            | `VYDRA_API_KEY`                            |
| xAI                   | `grok-imagine-video`            | 지원   | 1장                                              | 1개               | `XAI_API_KEY`                              |

일부 provider는 추가적이거나 대체 API key 환경변수를 허용합니다. 자세한 내용은 각 [provider 페이지](#관련-문서)를 참고하세요.

런타임에 사용 가능한 provider, 모델, 런타임 모드를 확인하려면 `video_generate action=list`를 실행하세요.

### 선언된 capability 매트릭스

이것은 `video_generate`, contract 테스트, 그리고 공용 라이브 스윕에서 사용되는 명시적 모드 계약입니다.

| Provider | `generate` | `imageToVideo` | `videoToVideo` | 현재 공용 라이브 레인                                                                                                                    |
| -------- | ---------- | -------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Alibaba  | 지원       | 지원           | 지원           | `generate`, `imageToVideo`; 이 provider는 remote `http(s)` 비디오 URL이 필요하므로 `videoToVideo`는 스킵                                 |
| BytePlus | 지원       | 지원           | 미지원         | `generate`, `imageToVideo`                                                                                                               |
| ComfyUI  | 지원       | 지원           | 미지원         | 공용 스윕 대상 아님; workflow별 커버리지는 Comfy 테스트에서 관리                                                                         |
| fal      | 지원       | 지원           | 미지원         | `generate`, `imageToVideo`                                                                                                               |
| Google   | 지원       | 지원           | 지원           | `generate`, `imageToVideo`; 현재 buffer 기반 Gemini/Veo 스윕은 해당 입력을 허용하지 않아 공용 `videoToVideo`는 스킵                      |
| MiniMax  | 지원       | 지원           | 미지원         | `generate`, `imageToVideo`                                                                                                               |
| OpenAI   | 지원       | 지원           | 지원           | `generate`, `imageToVideo`; 이 org/입력 경로는 현재 provider 측 inpaint/remix 접근이 필요해 공용 `videoToVideo`는 스킵                   |
| Qwen     | 지원       | 지원           | 지원           | `generate`, `imageToVideo`; 이 provider는 remote `http(s)` 비디오 URL이 필요하므로 `videoToVideo`는 스킵                                 |
| Runway   | 지원       | 지원           | 지원           | `generate`, `imageToVideo`; 선택된 모델이 `runway/gen4_aleph`일 때만 `videoToVideo` 실행                                                 |
| Together | 지원       | 지원           | 미지원         | `generate`, `imageToVideo`                                                                                                               |
| Vydra    | 지원       | 지원           | 미지원         | `generate`; 번들된 `veo3`는 text-only이고 번들된 `kling`은 remote 이미지 URL을 요구하므로 공용 `imageToVideo`는 스킵                     |
| xAI      | 지원       | 지원           | 지원           | `generate`, `imageToVideo`; 이 provider는 현재 remote MP4 URL이 필요하므로 `videoToVideo`는 스킵                                         |

## 도구 파라미터

### 필수

| 파라미터 | 타입   | 설명                                                         |
| -------- | ------ | ------------------------------------------------------------ |
| `prompt` | string | 생성할 비디오의 텍스트 설명(`action: "generate"`에서 필수)  |

### 콘텐츠 입력

| 파라미터     | 타입     | 설명                                                                                                                         |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `image`      | string   | 단일 reference 이미지(경로 또는 URL)                                                                                         |
| `images`     | string[] | 다중 reference 이미지(최대 9장)                                                                                              |
| `imageRoles` | string[] | 결합된 이미지 리스트와 병렬로 위치별 role 힌트를 지정합니다. 정식 값: `first_frame`, `last_frame`, `reference_image`         |
| `video`      | string   | 단일 reference 비디오(경로 또는 URL)                                                                                         |
| `videos`     | string[] | 다중 reference 비디오(최대 4개)                                                                                              |
| `videoRoles` | string[] | 결합된 비디오 리스트와 병렬로 위치별 role 힌트를 지정합니다. 정식 값: `reference_video`                                      |
| `audioRef`   | string   | 단일 reference 오디오(경로 또는 URL). provider가 오디오 입력을 지원할 때 배경 음악이나 목소리 reference 등에 사용            |
| `audioRefs`  | string[] | 다중 reference 오디오(최대 3개)                                                                                              |
| `audioRoles` | string[] | 결합된 오디오 리스트와 병렬로 위치별 role 힌트를 지정합니다. 정식 값: `reference_audio`                                      |

Role 힌트는 그대로 provider로 전달됩니다. 정식 값은 `VideoGenerationAssetRole` union에서 가져오지만, provider에 따라 추가 role 문자열을 허용할 수 있습니다. `*Roles` 배열은 대응하는 reference 리스트보다 항목이 많을 수 없으며, off-by-one 실수는 명확한 오류로 실패합니다. 슬롯을 비워두려면 빈 문자열을 사용하세요.

### 스타일 제어

| 파라미터          | 타입    | 설명                                                                                    |
| ----------------- | ------- | --------------------------------------------------------------------------------------- |
| `aspectRatio`     | string  | `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` 또는 `adaptive` |
| `resolution`      | string  | `480P`, `720P`, `768P`, `1080P`                                                         |
| `durationSeconds` | number  | 목표 길이(초)(가장 가까운 provider 지원 값으로 반올림)                                  |
| `size`            | string  | provider가 지원할 때 적용되는 size 힌트                                                 |
| `audio`           | boolean | 지원 시 출력에 생성된 오디오 포함. `audioRef*`(입력)와는 별개                           |
| `watermark`       | boolean | 지원 시 provider watermark 토글                                                         |

`adaptive`는 provider별 sentinel 값입니다. capability에 `adaptive`를 선언한 provider(예: BytePlus Seedance는 입력 이미지 크기로부터 비율을 자동 감지)에 그대로 전달됩니다. `adaptive`를 선언하지 않은 provider에서는 도구 결과의 `details.ignoredOverrides`를 통해 해당 드롭이 가시화됩니다.

### 고급

| 파라미터          | 타입   | 설명                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `action`          | string | `"generate"`(기본), `"status"`, `"list"`                                                                                                                                                                                                                                                                                                           |
| `model`           | string | Provider/모델 오버라이드(예: `runway/gen4.5`)                                                                                                                                                                                                                                                                                                      |
| `filename`        | string | 출력 파일명 힌트                                                                                                                                                                                                                                                                                                                                   |
| `timeoutMs`       | number | 선택적 provider 요청 타임아웃(밀리초)                                                                                                                                                                                                                                                                                                              |
| `providerOptions` | object | Provider별 옵션을 JSON 객체로 전달(예: `{"seed": 42, "draft": true}`). 타입이 정의된 스키마를 선언한 provider는 키와 타입을 검증하며, 알 수 없는 키나 불일치는 fallback 중 후보를 스킵합니다. 스키마를 선언하지 않은 provider는 옵션을 그대로 받습니다. 각 provider가 허용하는 항목은 `video_generate action=list`로 확인하세요 |

모든 provider가 모든 파라미터를 지원하지는 않습니다. OpenClaw는 duration을 provider가 지원하는 가장 가까운 값으로 이미 정규화하며, fallback provider가 다른 제어 surface를 노출할 경우 size-to-aspect-ratio 같은 변환된 geometry 힌트도 remap 합니다. 진짜로 지원되지 않는 오버라이드는 best-effort로 무시되며 도구 결과에 경고로 보고됩니다. 하드한 capability 한계(예: reference 입력 수 초과)는 제출 전에 실패합니다.

도구 결과는 실제 적용된 설정을 보고합니다. OpenClaw가 provider fallback 중 duration이나 geometry를 remap 하면, 반환되는 `durationSeconds`, `size`, `aspectRatio`, `resolution` 값은 실제로 제출된 값을 반영하며, `details.normalization`에는 요청된 값에서 적용된 값으로의 변환이 기록됩니다.

Reference 입력은 런타임 모드도 선택합니다.

- Reference 미디어 없음: `generate`
- 이미지 reference 있음: `imageToVideo`
- 비디오 reference 있음: `videoToVideo`
- Reference 오디오 입력은 결정된 모드를 바꾸지 않습니다. 이미지/비디오 reference가 선택한 모드 위에 적용되며, `maxInputAudios`를 선언한 provider에서만 동작합니다

이미지와 비디오 reference를 섞는 것은 안정적인 공용 capability surface가 아닙니다. 요청당 하나의 reference 타입을 선호하세요.

#### Fallback과 typed options

일부 capability 검사는 도구 경계가 아니라 fallback 계층에서 적용됩니다. 이렇게 해야 primary provider의 한계를 초과하는 요청도 더 유능한 fallback에서 실행될 수 있습니다.

- 활성 후보가 `maxInputAudios`를 선언하지 않거나 `0`으로 선언한 경우, 요청에 오디오 reference가 포함되면 해당 후보는 스킵되고 다음 후보가 시도됩니다.
- 활성 후보의 `maxDurationSeconds`가 요청된 `durationSeconds`보다 작고 후보가 `supportedDurationSeconds` 리스트를 선언하지 않은 경우, 스킵됩니다.
- 요청에 `providerOptions`가 포함되어 있고 활성 후보가 명시적으로 typed `providerOptions` 스키마를 선언한 경우, 제공된 키가 스키마에 없거나 값 타입이 일치하지 않으면 해당 후보는 스킵됩니다. 아직 스키마를 선언하지 않은 provider는 옵션을 그대로 받습니다(하위 호환 pass-through). Provider는 빈 스키마(`capabilities.providerOptions: {}`)를 선언하여 모든 provider options를 명시적으로 거부할 수 있으며, 이는 타입 불일치와 동일한 스킵을 유발합니다.

요청에서 첫 번째 스킵 사유는 `warn` 레벨로 로깅되어 운영자가 primary provider가 건너뛰어졌음을 볼 수 있게 합니다. 이후 스킵은 긴 fallback 체인을 조용하게 유지하기 위해 `debug` 레벨로 로깅됩니다. 모든 후보가 스킵되면 aggregated 오류에 각 후보의 스킵 사유가 포함됩니다.

## Actions

- **generate** (기본) — 주어진 prompt와 선택적 reference 입력으로 video를 생성합니다.
- **status** — 현재 세션의 진행 중인 video task 상태를, 새 generation을 시작하지 않고 확인합니다.
- **list** — 사용 가능한 provider, 모델, capability를 보여줍니다.

## 모델 선택

비디오를 생성할 때 OpenClaw는 다음 순서로 모델을 결정합니다.

1. **`model` 도구 파라미터** — 에이전트가 호출에서 지정한 경우.
2. **`videoGenerationModel.primary`** — config에서.
3. **`videoGenerationModel.fallbacks`** — 순서대로 시도.
4. **자동 감지** — 유효한 인증을 가진 provider를 사용하며, 현재 기본 provider부터 시작한 뒤 나머지 provider를 알파벳 순서로 시도합니다.

Provider가 실패하면 다음 후보가 자동으로 시도됩니다. 모든 후보가 실패하면 오류에 각 시도의 상세가 포함됩니다.

Video generation이 명시적 `model`, `primary`, `fallbacks` 항목만 사용하도록 제한하려면 `agents.defaults.mediaGenerationAutoProviderFallback: false`로 설정하세요.

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

## Provider 노트

<AccordionGroup>
  <Accordion title="Alibaba">
    DashScope / Model Studio 비동기 엔드포인트를 사용합니다. Reference 이미지와 비디오는 remote `http(s)` URL이어야 합니다.
  </Accordion>

  <Accordion title="BytePlus (1.0)">
    Provider id: `byteplus`.

    모델: `seedance-1-0-pro-250528`(기본), `seedance-1-0-pro-t2v-250528`, `seedance-1-0-pro-fast-251015`, `seedance-1-0-lite-t2v-250428`, `seedance-1-0-lite-i2v-250428`.

    T2V 모델(`*-t2v-*`)은 이미지 입력을 받지 않습니다. I2V 모델과 일반 `*-pro-*` 모델은 단일 reference 이미지(first frame)를 지원합니다. 이미지를 positional로 전달하거나 `role: "first_frame"`을 설정하세요. 이미지가 제공되면 T2V 모델 ID는 자동으로 해당 I2V variant로 전환됩니다.

    지원되는 `providerOptions` 키: `seed`(number), `draft`(boolean — 480p로 강제), `camera_fixed`(boolean).

  </Accordion>

  <Accordion title="BytePlus Seedance 1.5">
    [`@openclaw/byteplus-modelark`](https://www.npmjs.com/package/@openclaw/byteplus-modelark) 플러그인이 필요합니다. Provider id: `byteplus-seedance15`. 모델: `seedance-1-5-pro-251215`.

    통합 `content[]` API를 사용합니다. 입력 이미지는 최대 2장(`first_frame` + `last_frame`)을 지원합니다. 모든 입력은 remote `https://` URL이어야 합니다. 각 이미지에 `role: "first_frame"` / `"last_frame"`을 설정하거나 positional로 전달하세요.

    `aspectRatio: "adaptive"`는 입력 이미지로부터 비율을 자동 감지합니다. `audio: true`는 `generate_audio`로 매핑됩니다. `providerOptions.seed`(number)는 그대로 전달됩니다.

  </Accordion>

  <Accordion title="BytePlus Seedance 2.0">
    [`@openclaw/byteplus-modelark`](https://www.npmjs.com/package/@openclaw/byteplus-modelark) 플러그인이 필요합니다. Provider id: `byteplus-seedance2`. 모델: `dreamina-seedance-2-0-260128`, `dreamina-seedance-2-0-fast-260128`.

    통합 `content[]` API를 사용합니다. 최대 9장의 reference 이미지, 3개의 reference 비디오, 3개의 reference 오디오를 지원합니다. 모든 입력은 remote `https://` URL이어야 합니다. 각 asset에 `role`을 설정하세요 — 지원 값: `"first_frame"`, `"last_frame"`, `"reference_image"`, `"reference_video"`, `"reference_audio"`.

    `aspectRatio: "adaptive"`는 입력 이미지로부터 비율을 자동 감지합니다. `audio: true`는 `generate_audio`로 매핑됩니다. `providerOptions.seed`(number)는 그대로 전달됩니다.

  </Accordion>

  <Accordion title="ComfyUI">
    Workflow 기반 로컬 또는 클라우드 실행입니다. 구성된 graph를 통해 text-to-video와 image-to-video를 지원합니다.
  </Accordion>

  <Accordion title="fal">
    장시간 실행 작업을 위한 queue 기반 흐름을 사용합니다. 단일 이미지 reference만 지원합니다.
  </Accordion>

  <Accordion title="Google (Gemini / Veo)">
    하나의 이미지 또는 하나의 비디오 reference를 지원합니다.
  </Accordion>

  <Accordion title="MiniMax">
    단일 이미지 reference만 지원합니다.
  </Accordion>

  <Accordion title="OpenAI">
    `size` 오버라이드만 전달됩니다. 다른 스타일 오버라이드(`aspectRatio`, `resolution`, `audio`, `watermark`)는 경고와 함께 무시됩니다.
  </Accordion>

  <Accordion title="Qwen">
    Alibaba와 동일한 DashScope 백엔드입니다. Reference 입력은 remote `http(s)` URL이어야 하며, 로컬 파일은 사전에 거부됩니다.
  </Accordion>

  <Accordion title="Runway">
    Data URI를 통해 로컬 파일을 지원합니다. Video-to-video에는 `runway/gen4_aleph`이 필요합니다. Text-only 실행은 `16:9`와 `9:16` aspect ratio를 노출합니다.
  </Accordion>

  <Accordion title="Together">
    단일 이미지 reference만 지원합니다.
  </Accordion>

  <Accordion title="Vydra">
    auth-dropping redirect를 피하기 위해 `https://www.vydra.ai/api/v1`을 직접 사용합니다. `veo3`는 text-to-video 전용으로 번들되어 있으며, `kling`은 remote 이미지 URL을 요구합니다.
  </Accordion>

  <Accordion title="xAI">
    text-to-video, image-to-video, 그리고 remote video edit/extend 흐름을 지원합니다.
  </Accordion>
</AccordionGroup>

## Provider capability 모드

공용 video-generation 계약은 이제 provider가 단순 집계 한계만이 아니라 모드별 capability를 선언할 수 있게 합니다. 새로운 provider 구현은 명시적 모드 블록을 선호해야 합니다.

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

`maxInputImages`와 `maxInputVideos` 같은 flat 집계 필드만으로는 transform-mode 지원을 광고하기에 충분하지 않습니다. Provider는 `generate`, `imageToVideo`, `videoToVideo`를 명시적으로 선언해야 라이브 테스트, contract 테스트, 공용 `video_generate` 도구가 모드 지원을 결정적으로 검증할 수 있습니다.

## 라이브 테스트

공용 번들 provider에 대한 opt-in 라이브 커버리지:

```bash
OPENCLAW_LIVE_TEST=1 pnpm test:live -- extensions/video-generation-providers.live.test.ts
```

리포지토리 래퍼:

```bash
pnpm test:live:media video
```

이 라이브 파일은 `~/.profile`에서 누락된 provider 환경변수를 로드하고, 기본적으로 저장된 auth 프로필보다 live/env API key를 우선하며, 기본적으로 release-safe smoke를 실행합니다.

- 스윕 내 모든 비 FAL provider에 대해 `generate`
- 1초 짜리 lobster prompt
- `OPENCLAW_LIVE_VIDEO_GENERATION_TIMEOUT_MS`(기본 `180000`)로부터 결정되는 provider별 작업 cap

FAL은 provider 측 queue 지연이 릴리스 시간을 지배할 수 있어 opt-in 입니다.

```bash
pnpm test:live:media video --video-providers fal
```

공용 스윕이 로컬 미디어로 안전하게 실행할 수 있는, 선언된 transform 모드도 함께 실행하려면 `OPENCLAW_LIVE_VIDEO_GENERATION_FULL_MODES=1`을 설정하세요.

- `capabilities.imageToVideo.enabled`일 때 `imageToVideo`
- `capabilities.videoToVideo.enabled`이고 provider/모델이 공용 스윕에서 buffer 기반 로컬 비디오 입력을 수용할 때 `videoToVideo`

오늘 공용 `videoToVideo` 라이브 레인은 다음을 커버합니다.

- `runway`는 `runway/gen4_aleph`을 선택했을 때만

## 구성

OpenClaw config에서 기본 video generation 모델을 설정합니다.

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

## 관련 문서

- [도구 개요](/tools/)
- [백그라운드 작업](/automation/tasks) — 비동기 video generation을 위한 task 추적
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
- [Configuration Reference](/gateway/config-agents#agent-defaults)
- [Models](/concepts/models)
