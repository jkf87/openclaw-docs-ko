---
summary: "설정된 provider(OpenAI, OpenAI Codex OAuth, Google Gemini, OpenRouter, fal, MiniMax, ComfyUI, Vydra, xAI)를 사용해 이미지를 생성하고 편집합니다"
read_when:
  - 에이전트를 통해 이미지를 생성할 때
  - image generation provider와 모델을 구성할 때
  - image_generate 도구 파라미터를 이해할 때
title: "이미지 생성 (Image generation)"
---

`image_generate` 도구를 사용하면 에이전트가 설정된 provider를 통해 이미지를 만들고 편집할 수 있습니다. 생성된 이미지는 에이전트 응답에 media attachment로 자동 전달됩니다.

<Note>
이 도구는 최소 하나 이상의 image generation provider가 사용 가능할 때만 표시됩니다. 에이전트 도구 목록에서 `image_generate`가 보이지 않는다면 `agents.defaults.imageGenerationModel`을 설정하거나, provider API key를 구성하거나, OpenAI Codex OAuth로 로그인하세요.
</Note>

## 빠른 시작

1. 최소 한 개의 provider에 대해 API key를 설정합니다(예: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`). 또는 OpenAI Codex OAuth로 로그인합니다.
2. 선택적으로 선호하는 모델을 지정합니다.

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "openai/gpt-image-2",
      },
    },
  },
}
```

Codex OAuth도 동일한 `openai/gpt-image-2` 모델 참조를 사용합니다. `openai-codex` OAuth 프로필이 구성되어 있으면, OpenClaw는 `OPENAI_API_KEY`를 먼저 시도하지 않고 해당 OAuth 프로필을 통해 이미지 요청을 라우팅합니다.
`models.providers.openai`에 API key나 커스텀/Azure base URL 같은 명시적 image 설정이 지정되어 있으면, 직접 OpenAI Images API 경로를 사용하도록 되돌아갑니다.
LocalAI 같은 OpenAI 호환 LAN 엔드포인트의 경우, 커스텀 `models.providers.openai.baseUrl`을 유지하고 `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork: true`로 명시적으로 opt-in 하세요. private/internal image 엔드포인트는 기본적으로 차단됩니다.

3. 에이전트에게 요청합니다: _"친근한 로봇 마스코트 이미지를 생성해줘."_

에이전트는 `image_generate`를 자동으로 호출합니다. 별도 도구 allow-list 설정은 필요 없으며, provider가 사용 가능하면 기본적으로 활성화됩니다.

## 지원 provider

| Provider   | 기본 모델                               | 편집 지원                          | 인증                                                    |
| ---------- | --------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| OpenAI     | `gpt-image-2`                           | 지원(최대 4장)                     | `OPENAI_API_KEY` 또는 OpenAI Codex OAuth                |
| OpenRouter | `google/gemini-3.1-flash-image-preview` | 지원(입력 이미지 최대 5장)         | `OPENROUTER_API_KEY`                                    |
| Google     | `gemini-3.1-flash-image-preview`        | 지원                               | `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`                  |
| fal        | `fal-ai/flux/dev`                       | 지원                               | `FAL_KEY`                                               |
| MiniMax    | `image-01`                              | 지원(subject reference)            | `MINIMAX_API_KEY` 또는 MiniMax OAuth (`minimax-portal`) |
| ComfyUI    | `workflow`                              | 지원(1장, workflow로 구성)         | 클라우드는 `COMFY_API_KEY` 또는 `COMFY_CLOUD_API_KEY`   |
| Vydra      | `grok-imagine`                          | 미지원                             | `VYDRA_API_KEY`                                         |
| xAI        | `grok-imagine-image`                    | 지원(최대 5장)                     | `XAI_API_KEY`                                           |

런타임에 사용 가능한 provider와 모델을 확인하려면 `action: "list"`를 사용하세요.

```
/tool image_generate action=list
```

## 도구 파라미터

<ParamField path="prompt" type="string" required>
이미지 생성 prompt입니다. `action: "generate"`에 필수입니다.
</ParamField>

<ParamField path="action" type="'generate' | 'list'" default="generate">
런타임에 사용 가능한 provider와 모델을 확인하려면 `"list"`를 사용하세요.
</ParamField>

<ParamField path="model" type="string">
Provider/모델 오버라이드입니다(예: `openai/gpt-image-2`).
</ParamField>

<ParamField path="image" type="string">
편집 모드용 단일 reference 이미지의 경로 또는 URL입니다.
</ParamField>

<ParamField path="images" type="string[]">
편집 모드용 다중 reference 이미지입니다(최대 5장).
</ParamField>

<ParamField path="size" type="string">
크기 힌트: `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, `3840x2160`.
</ParamField>

<ParamField path="aspectRatio" type="string">
Aspect ratio: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`.
</ParamField>

<ParamField path="resolution" type="'1K' | '2K' | '4K'">
해상도 힌트입니다.
</ParamField>

<ParamField path="quality" type="'low' | 'medium' | 'high' | 'auto'">
Provider가 지원할 때 적용되는 품질 힌트입니다.
</ParamField>

<ParamField path="outputFormat" type="'png' | 'jpeg' | 'webp'">
Provider가 지원할 때 적용되는 출력 포맷 힌트입니다.
</ParamField>

<ParamField path="count" type="number">
생성할 이미지 개수입니다(1–4).
</ParamField>

<ParamField path="timeoutMs" type="number">
선택적 provider 요청 타임아웃(밀리초)입니다.
</ParamField>

<ParamField path="filename" type="string">
출력 파일명 힌트입니다.
</ParamField>

<ParamField path="openai" type="object">
OpenAI 전용 힌트: `background`, `moderation`, `outputCompression`, `user`.
</ParamField>

모든 provider가 모든 파라미터를 지원하지는 않습니다. fallback provider가 요청된 값과 정확히 같은 옵션은 지원하지 않지만 인접한 geometry 옵션은 지원한다면, OpenClaw는 제출 전에 가장 가까운 지원 size, aspect ratio, resolution으로 remap 합니다. `quality`나 `outputFormat` 같은 미지원 출력 힌트는 지원을 선언하지 않은 provider에서는 드롭되며, 도구 결과에 해당 사실이 보고됩니다.

도구 결과는 실제로 적용된 설정을 보고합니다. OpenClaw가 provider fallback 중 geometry를 remap 하면, 반환되는 `size`, `aspectRatio`, `resolution` 값은 실제로 전송된 값을 반영하며, `details.normalization`에는 요청된 값에서 적용된 값으로의 변환 내용이 기록됩니다.

## 구성

### 모델 선택

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "openai/gpt-image-2",
        fallbacks: [
          "openrouter/google/gemini-3.1-flash-image-preview",
          "google/gemini-3.1-flash-image-preview",
          "fal/fal-ai/flux/dev",
        ],
      },
    },
  },
}
```

### Provider 선택 순서

이미지를 생성할 때 OpenClaw는 다음 순서로 provider를 시도합니다.

1. 도구 호출의 **`model` 파라미터**(에이전트가 지정한 경우)
2. config의 **`imageGenerationModel.primary`**
3. **`imageGenerationModel.fallbacks`** 순서대로
4. **자동 감지** — 인증이 가능한 provider 기본값만 사용
   - 현재 기본 provider를 먼저
   - 이후 등록된 image-generation provider들을 provider id 순서로

Provider가 실패하면(인증 오류, rate limit 등) 다음 후보가 자동으로 시도됩니다. 모두 실패하면 오류에 각 시도의 상세가 포함됩니다.

참고:

- 자동 감지는 auth-aware 입니다. Provider 기본값은 OpenClaw가 실제로 해당 provider를 인증할 수 있을 때만 후보 목록에 포함됩니다.
- 자동 감지는 기본적으로 활성화되어 있습니다. image generation이 명시적 `model`, `primary`, `fallbacks` 항목만 사용하도록 제한하려면 `agents.defaults.mediaGenerationAutoProviderFallback: false`로 설정하세요.
- 현재 등록된 provider들과 기본 모델, 인증 env-var 힌트를 확인하려면 `action: "list"`를 사용하세요.

### 이미지 편집

OpenAI, OpenRouter, Google, fal, MiniMax, ComfyUI, xAI는 reference 이미지 편집을 지원합니다. reference 이미지의 경로나 URL을 전달하세요.

```
"Generate a watercolor version of this photo" + image: "/path/to/photo.jpg"
```

OpenAI, OpenRouter, Google, xAI는 `images` 파라미터로 최대 5장까지의 reference 이미지를 지원합니다. fal, MiniMax, ComfyUI는 1장을 지원합니다.

### OpenRouter 이미지 모델

OpenRouter 이미지 생성은 동일한 `OPENROUTER_API_KEY`를 사용하며 OpenRouter의 chat completions image API를 통해 라우팅됩니다. OpenRouter 이미지 모델은 `openrouter/` prefix로 선택합니다.

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "openrouter/google/gemini-3.1-flash-image-preview",
      },
    },
  },
}
```

OpenClaw는 `prompt`, `count`, reference 이미지, Gemini 호환 `aspectRatio` / `resolution` 힌트를 OpenRouter로 전달합니다. 현재 내장된 OpenRouter 이미지 모델 단축키에는 `google/gemini-3.1-flash-image-preview`, `google/gemini-3-pro-image-preview`, `openai/gpt-5.4-image-2`가 포함됩니다. 설정된 플러그인이 노출하는 목록은 `action: "list"`로 확인하세요.

### OpenAI `gpt-image-2`

OpenAI 이미지 생성은 기본적으로 `openai/gpt-image-2`를 사용합니다. `openai-codex` OAuth 프로필이 구성되어 있으면, OpenClaw는 Codex 구독 chat 모델이 사용하는 동일한 OAuth 프로필을 재사용하여 Codex Responses 백엔드를 통해 이미지 요청을 전송하며, 해당 요청에 대해 조용히 `OPENAI_API_KEY`로 fallback 하지 않습니다. 직접 OpenAI Images API 라우팅을 강제하려면 `models.providers.openai`에 API key, 커스텀 base URL, Azure 엔드포인트 중 하나를 명시적으로 구성하세요. 구형 `openai/gpt-image-1` 모델은 명시적으로 선택해 계속 사용할 수 있지만, 새로운 OpenAI 이미지 생성/편집 요청에는 `gpt-image-2`를 사용해야 합니다.

`gpt-image-2`는 동일한 `image_generate` 도구를 통해 text-to-image 생성과 reference-image 편집을 모두 지원합니다. OpenClaw는 `prompt`, `count`, `size`, `quality`, `outputFormat`, reference 이미지를 OpenAI로 전달합니다. OpenAI는 `aspectRatio`나 `resolution`을 직접 받지 않으며, 가능한 경우 OpenClaw가 이 값들을 지원되는 `size`로 매핑합니다. 그렇지 않으면 무시된 오버라이드로 보고됩니다.

OpenAI 전용 옵션은 `openai` 객체 아래에 지정합니다.

```json
{
  "quality": "low",
  "outputFormat": "jpeg",
  "openai": {
    "background": "opaque",
    "moderation": "low",
    "outputCompression": 60,
    "user": "end-user-42"
  }
}
```

`openai.background`는 `transparent`, `opaque`, `auto`를 허용합니다. transparent 출력을 위해서는 `outputFormat`이 `png` 또는 `webp`여야 합니다. `openai.outputCompression`은 JPEG/WebP 출력에 적용됩니다.

4K 가로형 이미지 한 장 생성:

```
/tool image_generate action=generate model=openai/gpt-image-2 prompt="A clean editorial poster for OpenClaw image generation" size=3840x2160 count=1
```

정사각형 이미지 두 장 생성:

```
/tool image_generate action=generate model=openai/gpt-image-2 prompt="Two visual directions for a calm productivity app icon" size=1024x1024 count=2
```

로컬 reference 이미지 한 장 편집:

```
/tool image_generate action=generate model=openai/gpt-image-2 prompt="Keep the subject, replace the background with a bright studio setup" image=/path/to/reference.png size=1024x1536
```

여러 reference 이미지로 편집:

```
/tool image_generate action=generate model=openai/gpt-image-2 prompt="Combine the character identity from the first image with the color palette from the second" images='["/path/to/character.png","/path/to/palette.jpg"]' size=1536x1024
```

OpenAI 이미지 생성을 `api.openai.com` 대신 Azure OpenAI deployment로 라우팅하려면 OpenAI provider 문서의 [Azure OpenAI 엔드포인트](/providers/openai#azure-openai-endpoints)를 참고하세요.

MiniMax 이미지 생성은 번들된 두 가지 MiniMax 인증 경로를 통해 제공됩니다.

- API-key 기반: `minimax/image-01`
- OAuth 기반: `minimax-portal/image-01`

## Provider 기능

| 기능                  | OpenAI               | Google               | fal                 | MiniMax                    | ComfyUI                            | Vydra     | xAI                  |
| --------------------- | -------------------- | -------------------- | ------------------- | -------------------------- | ---------------------------------- | --------- | -------------------- |
| 생성                  | 지원(최대 4장)       | 지원(최대 4장)       | 지원(최대 4장)      | 지원(최대 9장)             | 지원(workflow가 정의한 출력 수)    | 지원(1장) | 지원(최대 4장)       |
| 편집/reference        | 지원(최대 5장)       | 지원(최대 5장)       | 지원(1장)           | 지원(1장, subject ref)     | 지원(1장, workflow로 구성)         | 미지원    | 지원(최대 5장)       |
| Size 제어             | 지원(최대 4K)        | 지원                 | 지원                | 미지원                     | 미지원                             | 미지원    | 미지원               |
| Aspect ratio          | 미지원               | 지원                 | 지원(생성만)        | 지원                       | 미지원                             | 미지원    | 지원                 |
| 해상도 (1K/2K/4K)     | 미지원               | 지원                 | 지원                | 미지원                     | 미지원                             | 미지원    | 지원(1K/2K)          |

### xAI `grok-imagine-image`

번들된 xAI provider는 prompt 전용 요청에는 `/v1/images/generations`를, `image` 또는 `images`가 포함된 경우에는 `/v1/images/edits`를 사용합니다.

- 모델: `xai/grok-imagine-image`, `xai/grok-imagine-image-pro`
- Count: 최대 4
- Reference: `image` 1장 또는 `images` 최대 5장
- Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2:3`, `3:2`
- 해상도: `1K`, `2K`
- 출력: OpenClaw가 관리하는 image attachment로 반환

OpenClaw는 xAI-native `quality`, `mask`, `user`나 추가적인 native 전용 aspect ratio는 공용 cross-provider `image_generate` 계약에 해당 컨트롤이 존재하기 전까지는 의도적으로 노출하지 않습니다.

## 관련 문서

- [도구 개요](/tools/) — 사용 가능한 전체 에이전트 도구
- [fal](/providers/fal) — fal 이미지/비디오 provider 설정
- [ComfyUI](/providers/comfy) — 로컬 ComfyUI 및 Comfy Cloud workflow 설정
- [Google (Gemini)](/providers/google) — Gemini 이미지 provider 설정
- [MiniMax](/providers/minimax) — MiniMax 이미지 provider 설정
- [OpenAI](/providers/openai) — OpenAI Images provider 설정
- [Vydra](/providers/vydra) — Vydra 이미지, 비디오, speech 설정
- [xAI](/providers/xai) — Grok 이미지, 비디오, search, code execution, TTS 설정
- [Configuration Reference](/gateway/config-agents#agent-defaults) — `imageGenerationModel` 설정
- [Models](/concepts/models) — 모델 구성과 failover
