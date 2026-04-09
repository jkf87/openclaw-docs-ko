---
summary: "OpenClaw에서 xAI Grok 모델 사용"
read_when:
  - OpenClaw에서 Grok 모델을 사용하려는 경우
  - xAI 인증 또는 모델 id를 구성하는 경우
title: "xAI"
---

# xAI

OpenClaw는 Grok 모델을 위한 번들 `xai` 프로바이더 플러그인을 제공합니다.

## 설정

1. xAI 콘솔에서 API 키를 생성하십시오.
2. `XAI_API_KEY`를 설정하거나 다음을 실행하십시오:

```bash
openclaw onboard --auth-choice xai-api-key
```

3. 다음과 같은 모델을 선택하십시오:

```json5
{
  agents: { defaults: { model: { primary: "xai/grok-4" } } },
}
```

OpenClaw는 이제 번들 xAI 전송으로 xAI Responses API를 사용합니다. 동일한 `XAI_API_KEY`는 Grok 기반 `web_search`, 1등급 `x_search`, 원격 `code_execution`도 지원할 수 있습니다. `plugins.entries.xai.config.webSearch.apiKey` 아래에 xAI 키를 저장하면 번들 xAI 모델 프로바이더가 이제 해당 키를 폴백으로도 재사용합니다. `code_execution` 조정은 `plugins.entries.xai.config.codeExecution` 아래에 있습니다.

## 현재 번들 모델 카탈로그

OpenClaw는 이제 다음 xAI 모델 패밀리를 기본으로 포함합니다:

- `grok-3`, `grok-3-fast`, `grok-3-mini`, `grok-3-mini-fast`
- `grok-4`, `grok-4-0709`
- `grok-4-fast`, `grok-4-fast-non-reasoning`
- `grok-4-1-fast`, `grok-4-1-fast-non-reasoning`
- `grok-4.20-beta-latest-reasoning`, `grok-4.20-beta-latest-non-reasoning`
- `grok-code-fast-1`

플러그인은 동일한 API 모양을 따르는 경우 더 새로운 `grok-4*` 및 `grok-code-fast*` id도 전방 해석합니다.

빠른 모델 참고 사항:

- `grok-4-fast`, `grok-4-1-fast`, `grok-4.20-beta-*` 변형은 번들 카탈로그에서 현재 이미지 지원 Grok 참조입니다.
- `/fast on` 또는 `agents.defaults.models["xai/<model>"].params.fastMode: true`는 네이티브 xAI 요청을 다음과 같이 재작성합니다:
  - `grok-3` -> `grok-3-fast`
  - `grok-3-mini` -> `grok-3-mini-fast`
  - `grok-4` -> `grok-4-fast`
  - `grok-4-0709` -> `grok-4-fast`

레거시 호환 별칭은 여전히 표준 번들 id로 정규화됩니다. 예를 들어:

- `grok-4-fast-reasoning` -> `grok-4-fast`
- `grok-4-1-fast-reasoning` -> `grok-4-1-fast`
- `grok-4.20-reasoning` -> `grok-4.20-beta-latest-reasoning`
- `grok-4.20-non-reasoning` -> `grok-4.20-beta-latest-non-reasoning`

## 웹 검색

번들 `grok` 웹 검색 프로바이더도 `XAI_API_KEY`를 사용합니다:

```bash
openclaw config set tools.web.search.provider grok
```

## 비디오 생성

번들 `xai` 플러그인은 공유 `video_generate` 도구를 통해 비디오 생성도 등록합니다.

- 기본 비디오 모델: `xai/grok-imagine-video`
- 모드: 텍스트-투-비디오, 이미지-투-비디오, 원격 비디오 편집/연장 플로우
- `aspectRatio` 및 `resolution` 지원
- 현재 제한: 로컬 비디오 버퍼는 허용되지 않습니다; 비디오 참조/편집 입력에는 원격 `http(s)` URL을 사용하십시오

xAI를 기본 비디오 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "xai/grok-imagine-video",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작에 대해서는 [비디오 생성](/tools/video-generation)을 참조하십시오.

## 알려진 제한 사항

- 인증은 오늘날 API 키만 지원합니다. OpenClaw에는 아직 xAI OAuth/디바이스 코드 플로우가 없습니다.
- `grok-4.20-multi-agent-experimental-beta-0304`는 표준 OpenClaw xAI 전송과 다른 업스트림 API 표면이 필요하므로 일반 xAI 프로바이더 경로에서 지원되지 않습니다.

## 참고 사항

- OpenClaw는 공유 실행기 경로에서 xAI 특화 도구 스키마 및 도구 호출 호환성 수정을 자동으로 적용합니다.
- 네이티브 xAI 요청은 기본적으로 `tool_stream: true`입니다. 비활성화하려면 `agents.defaults.models["xai/<model>"].params.tool_stream`을 `false`로 설정하십시오.
- 번들 xAI 래퍼는 네이티브 xAI 요청을 보내기 전에 지원되지 않는 엄격한 도구 스키마 플래그와 추론 페이로드 키를 제거합니다.
- `web_search`, `x_search`, `code_execution`은 OpenClaw 도구로 노출됩니다. OpenClaw는 모든 채팅 턴에 모든 네이티브 도구를 첨부하는 대신 각 도구 요청 내에서 필요한 특정 xAI 내장 도구를 활성화합니다.
- `x_search`와 `code_execution`은 코어 모델 런타임에 하드코딩되지 않고 번들 xAI 플러그인이 소유합니다.
- `code_execution`은 원격 xAI 샌드박스 실행이며, 로컬 [`exec`](/tools/exec)가 아닙니다.
- 더 넓은 프로바이더 개요는 [모델 프로바이더](/providers/index)를 참조하십시오.
