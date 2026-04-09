---
title: "OpenAI"
description: "OpenClaw에서 API 키 또는 Codex 구독으로 OpenAI 사용"
---

# OpenAI

OpenAI는 GPT 모델을 위한 개발자 API를 제공합니다. Codex는 구독 접근을 위한 **ChatGPT 로그인** 또는 사용량 기반 접근을 위한 **API 키** 로그인을 지원합니다. Codex 클라우드는 ChatGPT 로그인이 필요합니다. OpenAI는 OpenClaw와 같은 외부 도구/워크플로에서 구독 OAuth 사용을 명시적으로 지원합니다.

## 기본 인터랙션 스타일

OpenClaw는 `openai/*` 및 `openai-codex/*` 실행 모두에 소규모 OpenAI 특화 프롬프트 오버레이를 추가할 수 있습니다. 기본적으로 오버레이는 기본 OpenClaw 시스템 프롬프트를 대체하지 않으면서 어시스턴트를 따뜻하고, 협력적이며, 간결하고, 직접적이며, 다소 감정적으로 표현력 있게 유지합니다. 친근한 오버레이는 자연스럽게 맞는 경우 가끔 이모지도 허용하면서 전체 출력을 간결하게 유지합니다.

구성 키:

`plugins.entries.openai.config.personality`

허용 값:

- `"friendly"`: 기본값; OpenAI 특화 오버레이를 활성화합니다.
- `"on"`: `"friendly"`의 별칭.
- `"off"`: 오버레이를 비활성화하고 기본 OpenClaw 프롬프트만 사용합니다.

적용 범위:

- `openai/*` 모델에 적용됩니다.
- `openai-codex/*` 모델에 적용됩니다.
- 다른 프로바이더에는 영향을 미치지 않습니다.

이 동작은 기본적으로 활성화되어 있습니다. 향후 로컬 구성 변경에도 이를 유지하려면 `"friendly"`를 명시적으로 설정하십시오:

```json5
{
  plugins: {
    entries: {
      openai: {
        config: {
          personality: "friendly",
        },
      },
    },
  },
}
```

### OpenAI 프롬프트 오버레이 비활성화

수정되지 않은 기본 OpenClaw 프롬프트를 원하는 경우 오버레이를 `"off"`로 설정하십시오:

```json5
{
  plugins: {
    entries: {
      openai: {
        config: {
          personality: "off",
        },
      },
    },
  },
}
```

config CLI를 사용하여 직접 설정할 수도 있습니다:

```bash
openclaw config set plugins.entries.openai.config.personality off
```

OpenClaw는 런타임에 이 설정을 대소문자 구분 없이 정규화하므로 `"Off"`와 같은 값도 친근한 오버레이를 비활성화합니다.

## 옵션 A: OpenAI API 키 (OpenAI Platform)

**최적 용도:** 직접 API 접근 및 사용량 기반 청구.
OpenAI 대시보드에서 API 키를 발급받으십시오.

라우트 요약:

- `openai/gpt-5.4` = 직접 OpenAI Platform API 라우트
- `OPENAI_API_KEY` (또는 동일한 OpenAI 프로바이더 구성) 필요
- OpenClaw에서 ChatGPT/Codex 로그인은 `openai/*`가 아닌 `openai-codex/*`를 통해 라우팅됩니다

### CLI 설정

```bash
openclaw onboard --auth-choice openai-api-key
# 또는 비대화형
openclaw onboard --openai-api-key "$OPENAI_API_KEY"
```

### 구성 스니펫

```json5
{
  env: { OPENAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "openai/gpt-5.4" } } },
}
```

OpenAI의 현재 API 모델 문서에는 직접 OpenAI API 사용을 위한 `gpt-5.4` 및 `gpt-5.4-pro`가 나열되어 있습니다. OpenClaw는 둘 다 `openai/*` Responses 경로를 통해 전달합니다. OpenClaw는 실제 트래픽에서 직접 OpenAI API 호출이 거부하기 때문에 구식 `openai/gpt-5.3-codex-spark` 행을 의도적으로 억제합니다.

OpenClaw는 직접 OpenAI API 경로에서 `openai/gpt-5.3-codex-spark`를 노출하지 않습니다. `pi-ai`는 해당 모델의 내장 행을 계속 제공하지만, 실제 OpenAI API 요청은 현재 이를 거부합니다. Spark는 OpenClaw에서 Codex 전용으로 처리됩니다.

## 이미지 생성

번들 `openai` 플러그인은 공유 `image_generate` 도구를 통해 이미지 생성도 등록합니다.

- 기본 이미지 모델: `openai/gpt-image-1`
- 생성: 요청당 최대 4개 이미지
- 편집 모드: 활성화, 최대 5개 참조 이미지
- `size` 지원
- 현재 OpenAI 특화 주의사항: OpenClaw는 현재 `aspectRatio` 또는 `resolution` 재정의를 OpenAI Images API로 전달하지 않습니다

OpenAI를 기본 이미지 프로바이더로 사용하려면:

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

공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작에 대해서는 [이미지 생성](/tools/image-generation)을 참조하십시오.

## 비디오 생성

번들 `openai` 플러그인은 공유 `video_generate` 도구를 통해 비디오 생성도 등록합니다.

- 기본 비디오 모델: `openai/sora-2`
- 모드: 텍스트-투-비디오, 이미지-투-비디오, 단일 비디오 참조/편집 플로우
- 현재 제한: 이미지 1개 또는 비디오 참조 입력 1개
- 현재 OpenAI 특화 주의사항: OpenClaw는 현재 네이티브 OpenAI 비디오 생성에 대해 `size` 재정의만 전달합니다. `aspectRatio`, `resolution`, `audio`, `watermark`와 같은 지원되지 않는 선택적 재정의는 무시되고 도구 경고로 보고됩니다.

OpenAI를 기본 비디오 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "openai/sora-2",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작에 대해서는 [비디오 생성](/tools/video-generation)을 참조하십시오.

## 옵션 B: OpenAI Code (Codex) 구독

**최적 용도:** API 키 대신 ChatGPT/Codex 구독 접근 사용.
Codex 클라우드는 ChatGPT 로그인이 필요하며, Codex CLI는 ChatGPT 또는 API 키 로그인을 지원합니다.

라우트 요약:

- `openai-codex/gpt-5.4` = ChatGPT/Codex OAuth 라우트
- ChatGPT/Codex 로그인 사용 (직접 OpenAI Platform API 키 아님)
- `openai-codex/*`의 프로바이더 측 제한은 ChatGPT 웹/앱 경험과 다를 수 있습니다

### CLI 설정 (Codex OAuth)

```bash
# 마법사에서 Codex OAuth 실행
openclaw onboard --auth-choice openai-codex

# 또는 OAuth 직접 실행
openclaw models auth login --provider openai-codex
```

### 구성 스니펫 (Codex 구독)

```json5
{
  agents: { defaults: { model: { primary: "openai-codex/gpt-5.4" } } },
}
```

OpenAI의 현재 Codex 문서는 `gpt-5.4`를 현재 Codex 모델로 나열합니다. OpenClaw는 ChatGPT/Codex OAuth 사용을 위해 이를 `openai-codex/gpt-5.4`에 매핑합니다.

이 라우트는 `openai/gpt-5.4`와 의도적으로 분리되어 있습니다. 직접 OpenAI Platform API 경로를 원하면 API 키와 함께 `openai/*`를 사용하십시오. ChatGPT/Codex 로그인을 원하면 `openai-codex/*`를 사용하십시오.

온보딩이 기존 Codex CLI 로그인을 재사용하는 경우 해당 자격 증명은 Codex CLI에서 관리됩니다. 만료 시 OpenClaw는 먼저 외부 Codex 소스를 다시 읽고, 프로바이더가 새로 고침할 수 있으면 OpenClaw 전용 별도 복사본을 소유하는 대신 Codex 저장소에 새로 고쳐진 자격 증명을 다시 씁니다.

Codex 계정이 Codex Spark를 받을 자격이 있는 경우 OpenClaw는 다음도 지원합니다:

- `openai-codex/gpt-5.3-codex-spark`

OpenClaw는 Codex Spark를 Codex 전용으로 처리합니다. 직접 `openai/gpt-5.3-codex-spark` API 키 경로를 노출하지 않습니다.

OpenClaw는 `pi-ai`가 이를 발견할 때 `openai-codex/gpt-5.3-codex-spark`도 보존합니다. 이를 자격 증명 의존적이고 실험적인 것으로 취급하십시오: Codex Spark는 GPT-5.4 `/fast`와 별개이며, 가용성은 로그인한 Codex/ChatGPT 계정에 따라 다릅니다.

### Codex 컨텍스트 윈도우 상한

OpenClaw는 Codex 모델 메타데이터와 런타임 컨텍스트 상한을 별도 값으로 처리합니다.

`openai-codex/gpt-5.4`의 경우:

- 네이티브 `contextWindow`: `1050000`
- 기본 런타임 `contextTokens` 상한: `272000`

이는 실제로 더 나은 지연 시간과 품질 특성을 가진 더 작은 기본 런타임 윈도우를 보존하면서 모델 메타데이터를 정확하게 유지합니다.

다른 유효 상한을 원하면 `models.providers.&lt;provider&gt;.models[].contextTokens`를 설정하십시오:

```json5
{
  models: {
    providers: {
      "openai-codex": {
        models: [
          {
            id: "gpt-5.4",
            contextTokens: 160000,
          },
        ],
      },
    },
  },
}
```

네이티브 모델 메타데이터를 선언하거나 재정의할 때만 `contextWindow`를 사용하십시오. 런타임 컨텍스트 예산을 제한하려면 `contextTokens`를 사용하십시오.

### 전송 기본값

OpenClaw는 모델 스트리밍에 `pi-ai`를 사용합니다. `openai/*` 및 `openai-codex/*` 모두 기본 전송은 `"auto"` (WebSocket 우선, 그 다음 SSE 폴백)입니다.

`"auto"` 모드에서 OpenClaw는 SSE로 폴백하기 전에 초기의 재시도 가능한 WebSocket 실패를 한 번 더 재시도합니다. 강제 `"websocket"` 모드는 여전히 폴백 뒤에 숨기지 않고 전송 오류를 직접 표시합니다.

`"auto"` 모드에서 연결 또는 초기 턴 WebSocket 실패 후 OpenClaw는 약 60초 동안 해당 세션의 WebSocket 경로를 저하된 것으로 표시하고, 전송 간에 전환하는 대신 냉각 기간 동안 SSE를 통해 후속 턴을 보냅니다.

네이티브 OpenAI 패밀리 엔드포인트(`openai/*`, `openai-codex/*`, Azure OpenAI Responses)의 경우 OpenClaw는 재시도, 재연결, SSE 폴백이 동일한 대화 식별자로 정렬되도록 요청에 안정적인 세션 및 턴 식별자 상태를 연결합니다. 네이티브 OpenAI 패밀리 라우트에서 이는 안정적인 세션/턴 요청 식별자 헤더와 일치하는 전송 메타데이터를 포함합니다.

OpenClaw는 전송 변형 간에 OpenAI 사용 카운터를 정규화한 다음 세션/상태 표면에 전달합니다. 네이티브 OpenAI/Codex Responses 트래픽은 `input_tokens` / `output_tokens` 또는 `prompt_tokens` / `completion_tokens`로 사용량을 보고할 수 있습니다. OpenClaw는 이를 `/status`, `/usage`, 세션 로그에 대한 동일한 입력 및 출력 카운터로 처리합니다. 네이티브 WebSocket 트래픽이 `total_tokens`를 생략하거나 `0`으로 보고하면 OpenClaw는 세션/상태 디스플레이가 채워진 상태를 유지하도록 정규화된 입력 + 출력 합계로 폴백합니다.

`agents.defaults.models.&lt;provider/model&gt;.params.transport`를 설정할 수 있습니다:

- `"sse"`: SSE 강제
- `"websocket"`: WebSocket 강제
- `"auto"`: WebSocket 시도 후 SSE 폴백

`openai/*` (Responses API)의 경우 WebSocket 전송 사용 시 OpenClaw는 기본적으로 WebSocket 워밍업을 활성화합니다 (`openaiWsWarmup: true`).

관련 OpenAI 문서:

- [WebSocket을 사용한 Realtime API](https://platform.openai.com/docs/guides/realtime-websocket)
- [스트리밍 API 응답 (SSE)](https://platform.openai.com/docs/guides/streaming-responses)

```json5
{
  agents: {
    defaults: {
      model: { primary: "openai-codex/gpt-5.4" },
      models: {
        "openai-codex/gpt-5.4": {
          params: {
            transport: "auto",
          },
        },
      },
    },
  },
}
```

### OpenAI WebSocket 워밍업

OpenAI 문서는 워밍업을 선택 사항으로 설명합니다. OpenClaw는 WebSocket 전송 사용 시 첫 번째 턴 지연 시간을 줄이기 위해 `openai/*`에 대해 기본적으로 이를 활성화합니다.

### 워밍업 비활성화

```json5
{
  agents: {
    defaults: {
      models: {
        "openai/gpt-5.4": {
          params: {
            openaiWsWarmup: false,
          },
        },
      },
    },
  },
}
```

### 워밍업 명시적 활성화

```json5
{
  agents: {
    defaults: {
      models: {
        "openai/gpt-5.4": {
          params: {
            openaiWsWarmup: true,
          },
        },
      },
    },
  },
}
```

### OpenAI 및 Codex 우선 처리

OpenAI의 API는 `service_tier=priority`를 통해 우선 처리를 노출합니다. OpenClaw에서 `agents.defaults.models["&lt;provider&gt;/&lt;model&gt;"].params.serviceTier`를 설정하면 네이티브 OpenAI/Codex Responses 엔드포인트에서 해당 필드를 전달합니다.

```json5
{
  agents: {
    defaults: {
      models: {
        "openai/gpt-5.4": {
          params: {
            serviceTier: "priority",
          },
        },
        "openai-codex/gpt-5.4": {
          params: {
            serviceTier: "priority",
          },
        },
      },
    },
  },
}
```

지원 값: `auto`, `default`, `flex`, `priority`.

OpenClaw는 해당 모델이 네이티브 OpenAI/Codex 엔드포인트를 가리킬 때 직접 `openai/*` Responses 요청과 `openai-codex/*` Codex Responses 요청 모두에 `params.serviceTier`를 전달합니다.

중요한 동작:

- 직접 `openai/*`는 `api.openai.com`을 대상으로 해야 합니다
- `openai-codex/*`는 `chatgpt.com/backend-api`를 대상으로 해야 합니다
- 두 프로바이더 중 하나를 다른 기본 URL 또는 프록시를 통해 라우팅하면 OpenClaw는 `service_tier`를 그대로 둡니다

### OpenAI 빠른 모드

OpenClaw는 `openai/*` 및 `openai-codex/*` 세션 모두에 공유 빠른 모드 토글을 노출합니다:

- 채팅/UI: `/fast status|on|off`
- 구성: `agents.defaults.models["&lt;provider&gt;/&lt;model&gt;"].params.fastMode`

빠른 모드가 활성화되면 OpenClaw는 이를 OpenAI 우선 처리에 매핑합니다:

- `api.openai.com`의 직접 `openai/*` Responses 호출은 `service_tier = "priority"`를 보냅니다
- `chatgpt.com/backend-api`의 `openai-codex/*` Responses 호출도 `service_tier = "priority"`를 보냅니다
- 기존 페이로드 `service_tier` 값은 보존됩니다
- 빠른 모드는 `reasoning` 또는 `text.verbosity`를 재작성하지 않습니다

GPT 5.4의 경우 가장 일반적인 설정은 다음과 같습니다:

- `openai/gpt-5.4` 또는 `openai-codex/gpt-5.4`를 사용하는 세션에서 `/fast on` 전송
- 또는 `agents.defaults.models["openai/gpt-5.4"].params.fastMode = true` 설정
- Codex OAuth도 사용하는 경우 `agents.defaults.models["openai-codex/gpt-5.4"].params.fastMode = true`도 설정하십시오

예시:

```json5
{
  agents: {
    defaults: {
      models: {
        "openai/gpt-5.4": {
          params: {
            fastMode: true,
          },
        },
        "openai-codex/gpt-5.4": {
          params: {
            fastMode: true,
          },
        },
      },
    },
  },
}
```

세션 재정의는 구성보다 우선합니다. Sessions UI에서 세션 재정의를 지우면 세션이 구성된 기본값으로 돌아갑니다.

### 네이티브 OpenAI 대 OpenAI 호환 라우트

OpenClaw는 직접 OpenAI, Codex, Azure OpenAI 엔드포인트를 일반 OpenAI 호환 `/v1` 프록시와 다르게 처리합니다:

- 네이티브 `openai/*`, `openai-codex/*`, Azure OpenAI 라우트는 추론을 명시적으로 비활성화할 때 `reasoning: { effort: "none" }`을 유지합니다
- 네이티브 OpenAI 패밀리 라우트는 도구 스키마를 기본적으로 엄격 모드로 설정합니다
- 숨겨진 OpenClaw 귀속 헤더(`originator`, `version`, `User-Agent`)는 검증된 네이티브 OpenAI 호스트(`api.openai.com`)와 네이티브 Codex 호스트(`chatgpt.com/backend-api`)에서만 첨부됩니다
- 네이티브 OpenAI/Codex 라우트는 `service_tier`, Responses `store`, OpenAI 추론 호환 페이로드, 프롬프트 캐시 힌트와 같은 OpenAI 전용 요청 형성을 유지합니다
- 프록시 스타일 OpenAI 호환 라우트는 더 느슨한 호환 동작을 유지하며, 엄격한 도구 스키마, 네이티브 전용 요청 형성, 숨겨진 OpenAI/Codex 귀속 헤더를 강제하지 않습니다

Azure OpenAI는 전송 및 호환 동작을 위해 네이티브 라우팅 버킷에 있지만, 숨겨진 OpenAI/Codex 귀속 헤더는 수신하지 않습니다.

이는 서드파티 `/v1` 백엔드에 구형 OpenAI 호환 심을 강제하지 않고 현재 네이티브 OpenAI Responses 동작을 보존합니다.

### OpenAI Responses 서버 측 압축

직접 OpenAI Responses 모델(`api.openai.com`의 `baseUrl`과 `api: "openai-responses"`를 사용하는 `openai/*`)의 경우 OpenClaw는 이제 OpenAI 서버 측 압축 페이로드 힌트를 자동으로 활성화합니다:

- `store: true` 강제 (모델 호환이 `supportsStore: false`로 설정하지 않는 한)
- `context_management: [{ type: "compaction", compact_threshold: ... }]` 주입

기본적으로 `compact_threshold`는 모델 `contextWindow`의 `70%` (사용 불가 시 `80000`)입니다.

### 서버 측 압축 명시적 활성화

호환 Responses 모델(예: Azure OpenAI Responses)에 `context_management` 주입을 강제하려면 이를 사용하십시오:

```json5
{
  agents: {
    defaults: {
      models: {
        "azure-openai-responses/gpt-5.4": {
          params: {
            responsesServerCompaction: true,
          },
        },
      },
    },
  },
}
```

### 사용자 정의 임계값으로 활성화

```json5
{
  agents: {
    defaults: {
      models: {
        "openai/gpt-5.4": {
          params: {
            responsesServerCompaction: true,
            responsesCompactThreshold: 120000,
          },
        },
      },
    },
  },
}
```

### 서버 측 압축 비활성화

```json5
{
  agents: {
    defaults: {
      models: {
        "openai/gpt-5.4": {
          params: {
            responsesServerCompaction: false,
          },
        },
      },
    },
  },
}
```

`responsesServerCompaction`은 `context_management` 주입만 제어합니다. 직접 OpenAI Responses 모델은 호환이 `supportsStore: false`로 설정하지 않는 한 여전히 `store: true`를 강제합니다.

## 참고 사항

- 모델 참조는 항상 `provider/model`을 사용합니다 ([/concepts/models](/concepts/models) 참조).
- 인증 세부 사항 및 재사용 규칙은 [/concepts/oauth](/concepts/oauth)에 있습니다.
