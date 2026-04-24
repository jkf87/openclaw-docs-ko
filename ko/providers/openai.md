---
summary: "OpenClaw에서 API 키 또는 Codex 구독으로 OpenAI 사용"
read_when:
  - OpenClaw에서 OpenAI 모델을 사용하려는 경우
  - API 키 대신 Codex 구독 인증을 사용하려는 경우
  - 더 엄격한 GPT-5 에이전트 실행 동작이 필요한 경우
title: "OpenAI"
---

OpenAI는 GPT 모델을 위한 개발자 API를 제공합니다. OpenClaw는 세 가지 OpenAI 계열 경로를 지원합니다. 모델 prefix가 경로를 선택합니다:

- **API key** — 사용량 기반 청구를 사용하는 OpenAI Platform 직접 액세스 (`openai/*` 모델)
- **PI를 통한 Codex 구독** — 구독 액세스를 사용하는 ChatGPT/Codex 로그인 (`openai-codex/*` 모델)
- **Codex app-server 하니스** — 네이티브 Codex app-server 실행 (`openai/*` 모델 + `agents.defaults.embeddedHarness.runtime: "codex"`)

OpenAI는 OpenClaw와 같은 외부 도구 및 워크플로에서 구독 OAuth 사용을 명시적으로 지원합니다.

<Note>
GPT-5.5는 현재 구독/OAuth 경로를 통해 OpenClaw에서 사용할 수 있습니다:
PI 러너와 함께 `openai-codex/gpt-5.5`, 또는 Codex app-server 하니스와 함께
`openai/gpt-5.5`. `openai/gpt-5.5`에 대한 직접 API 키 액세스는 OpenAI가
공개 API에서 GPT-5.5를 활성화하면 지원되며, 그 전까지는 `OPENAI_API_KEY`
설정에 대해 `openai/gpt-5.4`와 같은 API 지원 모델을 사용하십시오.
</Note>

## OpenClaw 기능 커버리지

| OpenAI 기능                | OpenClaw 표면                                              | 상태                                                      |
| ------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Chat / Responses          | `openai/<model>` 모델 프로바이더                           | 지원                                                      |
| Codex 구독 모델            | `openai-codex` OAuth를 사용하는 `openai-codex/<model>`     | 지원                                                      |
| Codex app-server 하니스    | `embeddedHarness.runtime: codex`를 사용하는 `openai/<model>` | 지원                                                    |
| 서버 사이드 웹 검색         | 네이티브 OpenAI Responses 도구                             | 웹 검색이 활성화되고 프로바이더가 고정되지 않은 경우 지원 |
| 이미지                     | `image_generate`                                           | 지원                                                      |
| 비디오                     | `video_generate`                                           | 지원                                                      |
| 텍스트 투 스피치            | `messages.tts.provider: "openai"` / `tts`                  | 지원                                                      |
| 배치 음성 투 텍스트         | `tools.media.audio` / 미디어 이해                          | 지원                                                      |
| 스트리밍 음성 투 텍스트     | Voice Call `streaming.provider: "openai"`                  | 지원                                                      |
| 실시간 음성                 | Voice Call `realtime.provider: "openai"` / Control UI Talk | 지원                                                      |
| Embeddings                | 메모리 embedding 프로바이더                                 | 지원                                                      |

## 시작하기

원하는 인증 방식을 선택하고 설정 단계를 따르십시오.

<Tabs>
  <Tab title="API 키 (OpenAI Platform)">
    **적합한 경우:** 직접 API 액세스 및 사용량 기반 청구.

    <Steps>
      <Step title="API 키 받기">
        [OpenAI Platform 대시보드](https://platform.openai.com/api-keys)에서 API 키를 생성하거나 복사하십시오.
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice openai-api-key
        ```

        또는 키를 직접 전달:

        ```bash
        openclaw onboard --openai-api-key "$OPENAI_API_KEY"
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider openai
        ```
      </Step>
    </Steps>

    ### 경로 요약

    | 모델 ref | 경로 | 인증 |
    |-----------|-------|------|
    | `openai/gpt-5.4` | OpenAI Platform API 직접 | `OPENAI_API_KEY` |
    | `openai/gpt-5.4-mini` | OpenAI Platform API 직접 | `OPENAI_API_KEY` |
    | `openai/gpt-5.5` | OpenAI가 API에서 GPT-5.5를 활성화하면 사용되는 향후 직접 API 경로 | `OPENAI_API_KEY` |

    <Note>
    `openai/*`는 Codex app-server 하니스를 명시적으로 강제하지 않는 한 직접
    OpenAI API 키 경로입니다. GPT-5.5 자체는 현재 구독/OAuth 전용이므로,
    기본 PI 러너를 통한 Codex OAuth에는 `openai-codex/*`를 사용하십시오.
    </Note>

    ### 구성 예시

    ```json5
    {
      env: { OPENAI_API_KEY: "sk-..." },
      agents: { defaults: { model: { primary: "openai/gpt-5.4" } } },
    }
    ```

    <Warning>
    OpenClaw는 `openai/gpt-5.3-codex-spark`를 노출하지 **않습니다**. 실제 OpenAI API 요청은 해당 모델을 거부하며, 현재 Codex 카탈로그도 이를 노출하지 않습니다.
    </Warning>

  </Tab>

  <Tab title="Codex 구독">
    **적합한 경우:** 별도의 API 키 대신 ChatGPT/Codex 구독을 사용합니다. Codex cloud는 ChatGPT 로그인이 필요합니다.

    <Steps>
      <Step title="Codex OAuth 실행">
        ```bash
        openclaw onboard --auth-choice openai-codex
        ```

        또는 OAuth를 직접 실행:

        ```bash
        openclaw models auth login --provider openai-codex
        ```

        헤드리스 또는 콜백이 제한된 환경의 경우, `--device-code`를 추가하여 localhost 브라우저 콜백 대신 ChatGPT 디바이스 코드 플로우로 로그인하십시오:

        ```bash
        openclaw models auth login --provider openai-codex --device-code
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```bash
        openclaw config set agents.defaults.model.primary openai-codex/gpt-5.5
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider openai-codex
        ```
      </Step>
    </Steps>

    ### 경로 요약

    | 모델 ref | 경로 | 인증 |
    |-----------|-------|------|
    | `openai-codex/gpt-5.5` | PI를 통한 ChatGPT/Codex OAuth | Codex 로그인 |
    | `openai/gpt-5.5` + `embeddedHarness.runtime: "codex"` | Codex app-server 하니스 | Codex app-server 인증 |

    <Note>
    인증/프로필 명령에는 계속 `openai-codex` provider id를 사용하십시오.
    `openai-codex/*` 모델 prefix는 Codex OAuth의 명시적 PI 경로이기도 합니다.
    </Note>

    ### 구성 예시

    ```json5
    {
      agents: { defaults: { model: { primary: "openai-codex/gpt-5.5" } } },
    }
    ```

    <Note>
    온보딩은 더 이상 `~/.codex`에서 OAuth 자료를 가져오지 않습니다. 브라우저 OAuth(기본값) 또는 위의 디바이스 코드 플로우로 로그인하십시오 — OpenClaw는 결과 자격 증명을 자체 에이전트 인증 저장소에서 관리합니다.
    </Note>

    ### 상태 표시

    Chat `/status`는 현재 세션에 활성화된 임베디드 하니스를 보여줍니다.
    기본 PI 하니스는 `Runner: pi (embedded)`로 표시되며 별도의 배지를
    추가하지 않습니다. 번들된 Codex app-server 하니스가 선택되면,
    `/status`는 `Fast` 옆에 PI가 아닌 하니스 id를 덧붙입니다(예:
    `Fast · codex`). 기존 세션은 기록된 하니스 id를 유지하므로,
    `embeddedHarness` 변경 후 `/status`에 새로운 PI/Codex 선택이
    반영되게 하려면 `/new` 또는 `/reset`을 사용하십시오.

    ### Context window 제한

    OpenClaw는 모델 메타데이터와 런타임 context 제한을 별도의 값으로 취급합니다.

    Codex OAuth를 통한 `openai-codex/gpt-5.5`의 경우:

    - 네이티브 `contextWindow`: `1000000`
    - 기본 런타임 `contextTokens` 제한: `272000`

    더 작은 기본 제한은 실제로 더 나은 지연 시간 및 품질 특성을 가집니다. `contextTokens`로 재정의하십시오:

    ```json5
    {
      models: {
        providers: {
          "openai-codex": {
            models: [{ id: "gpt-5.5", contextTokens: 160000 }],
          },
        },
      },
    }
    ```

    <Note>
    네이티브 모델 메타데이터를 선언하려면 `contextWindow`를 사용하십시오. 런타임 context 예산을 제한하려면 `contextTokens`를 사용하십시오.
    </Note>

  </Tab>
</Tabs>

## 이미지 생성

번들 `openai` 플러그인은 `image_generate` 도구를 통해 이미지 생성을 등록합니다.
OpenAI API 키 이미지 생성과 Codex OAuth 이미지 생성을 동일한
`openai/gpt-image-2` 모델 ref를 통해 모두 지원합니다.

| 기능                       | OpenAI API 키                        | Codex OAuth                            |
| ------------------------- | ------------------------------------ | -------------------------------------- |
| 모델 ref                   | `openai/gpt-image-2`                 | `openai/gpt-image-2`                   |
| 인증                       | `OPENAI_API_KEY`                     | OpenAI Codex OAuth 로그인               |
| 전송                       | OpenAI Images API                    | Codex Responses 백엔드                  |
| 요청당 최대 이미지 수       | 4                                    | 4                                      |
| 편집 모드                   | 활성화 (최대 5개 참조 이미지)          | 활성화 (최대 5개 참조 이미지)            |
| 크기 재정의                 | 2K/4K 크기를 포함하여 지원             | 2K/4K 크기를 포함하여 지원               |
| Aspect ratio / 해상도      | OpenAI Images API로 전달되지 않음     | 안전한 경우 지원되는 크기로 매핑         |

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: { primary: "openai/gpt-image-2" },
    },
  },
}
```

<Note>
공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작은 [이미지 생성](/tools/image-generation)을 참조하십시오.
</Note>

`gpt-image-2`는 OpenAI 텍스트 투 이미지 생성 및 이미지 편집 모두의 기본값입니다.
`gpt-image-1`은 명시적 모델 재정의로 계속 사용할 수 있지만, 새로운
OpenAI 이미지 워크플로는 `openai/gpt-image-2`를 사용해야 합니다.

Codex OAuth 설치의 경우 동일한 `openai/gpt-image-2` ref를 유지하십시오.
`openai-codex` OAuth 프로필이 구성된 경우, OpenClaw는 저장된 OAuth
액세스 토큰을 해석하고 Codex Responses 백엔드를 통해 이미지 요청을
보냅니다. 먼저 `OPENAI_API_KEY`를 시도하거나 해당 요청에 대해 API 키로
자동 폴백하지 않습니다. 직접 OpenAI Images API 경로를 원하는 경우
`models.providers.openai`에 API 키, 커스텀 base URL 또는 Azure 엔드포인트를
명시적으로 구성하십시오.
해당 커스텀 이미지 엔드포인트가 신뢰할 수 있는 LAN/프라이빗 주소에 있는 경우,
`browser.ssrfPolicy.dangerouslyAllowPrivateNetwork: true`도 설정하십시오;
OpenClaw는 이 opt-in이 없으면 프라이빗/내부 OpenAI 호환 이미지 엔드포인트를
차단합니다.

생성:

```
/tool image_generate model=openai/gpt-image-2 prompt="A polished launch poster for OpenClaw on macOS" size=3840x2160 count=1
```

편집:

```
/tool image_generate model=openai/gpt-image-2 prompt="Preserve the object shape, change the material to translucent glass" image=/path/to/reference.png size=1024x1536
```

## 비디오 생성

번들 `openai` 플러그인은 `video_generate` 도구를 통해 비디오 생성을 등록합니다.

| 기능              | 값                                                                                |
| ---------------- | --------------------------------------------------------------------------------- |
| 기본 모델         | `openai/sora-2`                                                                   |
| 모드             | 텍스트 투 비디오, 이미지 투 비디오, 단일 비디오 편집                                  |
| 참조 입력         | 이미지 1개 또는 비디오 1개                                                          |
| 크기 재정의       | 지원                                                                               |
| 기타 재정의       | `aspectRatio`, `resolution`, `audio`, `watermark`는 도구 경고와 함께 무시됨           |

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: { primary: "openai/sora-2" },
    },
  },
}
```

<Note>
공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작은 [비디오 생성](/tools/video-generation)을 참조하십시오.
</Note>

## GPT-5 프롬프트 기여

OpenClaw는 프로바이더 간 GPT-5 계열 실행을 위한 공유 GPT-5 프롬프트 기여를 추가합니다. 이는 모델 id별로 적용되므로, `openai-codex/gpt-5.5`, `openai/gpt-5.4`, `openrouter/openai/gpt-5.5`, `opencode/gpt-5.5`, 기타 호환 GPT-5 ref는 동일한 오버레이를 받습니다. 이전 GPT-4.x 모델은 받지 않습니다.

번들된 네이티브 Codex 하니스는 Codex app-server 개발자 지침을 통해 동일한 GPT-5 동작 및 하트비트 오버레이를 사용하므로, `embeddedHarness.runtime: "codex"`를 통해 강제된 `openai/gpt-5.x` 세션은 Codex가 나머지 하니스 프롬프트를 소유하더라도 동일한 follow-through 및 사전 하트비트 가이드를 유지합니다.

GPT-5 기여는 페르소나 지속성, 실행 안전성, 도구 규율, 출력 형태, 완료 확인 및 검증을 위한 태그된 동작 계약을 추가합니다. 채널별 회신 및 silent-message 동작은 공유 OpenClaw 시스템 프롬프트 및 아웃바운드 전달 정책에 유지됩니다. GPT-5 가이드는 매칭 모델에 대해 항상 활성화됩니다. 친근한 상호 작용 스타일 계층은 별도이며 구성 가능합니다.

| 값                       | 효과                                         |
| ----------------------- | ------------------------------------------- |
| `"friendly"` (기본값)    | 친근한 상호 작용 스타일 계층 활성화           |
| `"on"`                  | `"friendly"`의 별칭                          |
| `"off"`                 | 친근한 스타일 계층만 비활성화                 |

<Tabs>
  <Tab title="구성">
    ```json5
    {
      agents: {
        defaults: {
          promptOverlays: {
            gpt5: { personality: "friendly" },
          },
        },
      },
    }
    ```
  </Tab>
  <Tab title="CLI">
    ```bash
    openclaw config set agents.defaults.promptOverlays.gpt5.personality off
    ```
  </Tab>
</Tabs>

<Tip>
런타임에서 값은 대소문자를 구분하지 않으므로, `"Off"`와 `"off"` 모두 친근한 스타일 계층을 비활성화합니다.
</Tip>

<Note>
레거시 `plugins.entries.openai.config.personality`는 공유 `agents.defaults.promptOverlays.gpt5.personality` 설정이 지정되지 않은 경우 호환성 폴백으로 계속 읽힙니다.
</Note>

## 음성 및 스피치

<AccordionGroup>
  <Accordion title="음성 합성 (TTS)">
    번들 `openai` 플러그인은 `messages.tts` 표면에 대한 음성 합성을 등록합니다.

    | 설정 | 구성 경로 | 기본값 |
    |---------|------------|---------|
    | 모델 | `messages.tts.providers.openai.model` | `gpt-4o-mini-tts` |
    | Voice | `messages.tts.providers.openai.voice` | `coral` |
    | 속도 | `messages.tts.providers.openai.speed` | (미설정) |
    | 지침 | `messages.tts.providers.openai.instructions` | (미설정, `gpt-4o-mini-tts` 전용) |
    | 포맷 | `messages.tts.providers.openai.responseFormat` | 음성 노트는 `opus`, 파일은 `mp3` |
    | API 키 | `messages.tts.providers.openai.apiKey` | `OPENAI_API_KEY`로 폴백 |
    | Base URL | `messages.tts.providers.openai.baseUrl` | `https://api.openai.com/v1` |

    사용 가능한 모델: `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`. 사용 가능한 voice: `alloy`, `ash`, `ballad`, `cedar`, `coral`, `echo`, `fable`, `juniper`, `marin`, `onyx`, `nova`, `sage`, `shimmer`, `verse`.

    ```json5
    {
      messages: {
        tts: {
          providers: {
            openai: { model: "gpt-4o-mini-tts", voice: "coral" },
          },
        },
      },
    }
    ```

    <Note>
    Chat API 엔드포인트에 영향을 주지 않고 TTS base URL을 재정의하려면 `OPENAI_TTS_BASE_URL`을 설정하십시오.
    </Note>

  </Accordion>

  <Accordion title="음성 투 텍스트">
    번들 `openai` 플러그인은 OpenClaw의 미디어 이해 전사 표면을 통해
    배치 음성 투 텍스트를 등록합니다.

    - 기본 모델: `gpt-4o-transcribe`
    - 엔드포인트: OpenAI REST `/v1/audio/transcriptions`
    - 입력 경로: 멀티파트 오디오 파일 업로드
    - Discord 음성 채널 세그먼트 및 채널 오디오 첨부 파일을 포함하여
      인바운드 오디오 전사에 `tools.media.audio`를 사용하는 모든 곳에서
      OpenClaw가 지원

    인바운드 오디오 전사에 OpenAI를 강제하려면:

    ```json5
    {
      tools: {
        media: {
          audio: {
            models: [
              {
                type: "provider",
                provider: "openai",
                model: "gpt-4o-transcribe",
              },
            ],
          },
        },
      },
    }
    ```

    공유 오디오 미디어 구성 또는 호출별 전사 요청에서 제공되는 경우
    언어 및 프롬프트 힌트가 OpenAI로 전달됩니다.

  </Accordion>

  <Accordion title="실시간 전사">
    번들 `openai` 플러그인은 Voice Call 플러그인에 대한 실시간 전사를 등록합니다.

    | 설정 | 구성 경로 | 기본값 |
    |---------|------------|---------|
    | 모델 | `plugins.entries.voice-call.config.streaming.providers.openai.model` | `gpt-4o-transcribe` |
    | 언어 | `...openai.language` | (미설정) |
    | 프롬프트 | `...openai.prompt` | (미설정) |
    | Silence duration | `...openai.silenceDurationMs` | `800` |
    | VAD threshold | `...openai.vadThreshold` | `0.5` |
    | API 키 | `...openai.apiKey` | `OPENAI_API_KEY`로 폴백 |

    <Note>
    G.711 u-law (`g711_ulaw` / `audio/pcmu`) 오디오로 `wss://api.openai.com/v1/realtime`에 WebSocket 연결을 사용합니다. 이 스트리밍 프로바이더는 Voice Call의 실시간 전사 경로 전용이며; Discord 음성은 현재 짧은 세그먼트를 기록하고 대신 배치 `tools.media.audio` 전사 경로를 사용합니다.
    </Note>

  </Accordion>

  <Accordion title="실시간 음성">
    번들 `openai` 플러그인은 Voice Call 플러그인에 대한 실시간 음성을 등록합니다.

    | 설정 | 구성 경로 | 기본값 |
    |---------|------------|---------|
    | 모델 | `plugins.entries.voice-call.config.realtime.providers.openai.model` | `gpt-realtime-1.5` |
    | Voice | `...openai.voice` | `alloy` |
    | Temperature | `...openai.temperature` | `0.8` |
    | VAD threshold | `...openai.vadThreshold` | `0.5` |
    | Silence duration | `...openai.silenceDurationMs` | `500` |
    | API 키 | `...openai.apiKey` | `OPENAI_API_KEY`로 폴백 |

    <Note>
    `azureEndpoint` 및 `azureDeployment` 구성 키를 통해 Azure OpenAI를 지원합니다. 양방향 도구 호출을 지원합니다. G.711 u-law 오디오 포맷을 사용합니다.
    </Note>

  </Accordion>
</AccordionGroup>

## Azure OpenAI 엔드포인트

번들 `openai` 프로바이더는 base URL을 재정의하여 이미지 생성을 위한
Azure OpenAI 리소스를 대상으로 할 수 있습니다. 이미지 생성 경로에서
OpenClaw는 `models.providers.openai.baseUrl`의 Azure 호스트명을 감지하고
Azure의 요청 형태로 자동 전환합니다.

<Note>
실시간 음성은 별도의 구성 경로
(`plugins.entries.voice-call.config.realtime.providers.openai.azureEndpoint`)를
사용하며 `models.providers.openai.baseUrl`의 영향을 받지 않습니다. Azure
설정은 [음성 및 스피치](#voice-and-speech) 아래의 **실시간 음성**
아코디언을 참조하십시오.
</Note>

다음 경우 Azure OpenAI를 사용하십시오:

- 이미 Azure OpenAI 구독, 쿼터 또는 엔터프라이즈 계약이 있는 경우
- Azure가 제공하는 리전 데이터 주권 또는 규정 준수 제어가 필요한 경우
- 기존 Azure 테넌시 내에서 트래픽을 유지하고 싶은 경우

### 구성

번들 `openai` 프로바이더를 통한 Azure 이미지 생성의 경우,
`models.providers.openai.baseUrl`을 Azure 리소스로 지정하고 `apiKey`를
Azure OpenAI 키(OpenAI Platform 키 아님)로 설정하십시오:

```json5
{
  models: {
    providers: {
      openai: {
        baseUrl: "https://<your-resource>.openai.azure.com",
        apiKey: "<azure-openai-api-key>",
      },
    },
  },
}
```

OpenClaw는 Azure 이미지 생성 경로에 대해 다음 Azure 호스트 접미사를 인식합니다:

- `*.openai.azure.com`
- `*.services.ai.azure.com`
- `*.cognitiveservices.azure.com`

인식된 Azure 호스트의 이미지 생성 요청에 대해 OpenClaw는:

- `Authorization: Bearer` 대신 `api-key` 헤더를 전송
- deployment 범위 경로 사용 (`/openai/deployments/{deployment}/...`)
- 각 요청에 `?api-version=...` 추가

다른 base URL (공개 OpenAI, OpenAI 호환 프록시)은 표준 OpenAI 이미지 요청 형태를 유지합니다.

<Note>
`openai` 프로바이더의 이미지 생성 경로에 대한 Azure 라우팅에는
OpenClaw 2026.4.22 이상이 필요합니다. 이전 버전은 모든 커스텀
`openai.baseUrl`을 공개 OpenAI 엔드포인트처럼 취급하며 Azure 이미지
deployment에 대해 실패합니다.
</Note>

### API 버전

Azure 이미지 생성 경로에 대해 특정 Azure preview 또는 GA 버전을 고정하려면
`AZURE_OPENAI_API_VERSION`을 설정하십시오:

```bash
export AZURE_OPENAI_API_VERSION="2024-12-01-preview"
```

변수가 미설정인 경우 기본값은 `2024-12-01-preview`입니다.

### 모델 이름은 deployment 이름입니다

Azure OpenAI는 모델을 deployment에 바인딩합니다. 번들 `openai` 프로바이더를
통해 라우팅된 Azure 이미지 생성 요청의 경우, OpenClaw의 `model` 필드는
공개 OpenAI 모델 id가 아니라 Azure 포털에서 구성한 **Azure deployment
이름**이어야 합니다.

`gpt-image-2`를 제공하는 `gpt-image-2-prod`라는 deployment를 생성한 경우:

```
/tool image_generate model=openai/gpt-image-2-prod prompt="A clean poster" size=1024x1024 count=1
```

번들 `openai` 프로바이더를 통해 라우팅된 이미지 생성 호출에도 동일한 deployment 이름 규칙이 적용됩니다.

### 리전 가용성

Azure 이미지 생성은 현재 일부 리전(예: `eastus2`, `swedencentral`,
`polandcentral`, `westus3`, `uaenorth`)에서만 사용할 수 있습니다.
deployment를 생성하기 전에 Microsoft의 현재 리전 목록을 확인하고,
특정 모델이 해당 리전에서 제공되는지 확인하십시오.

### 파라미터 차이

Azure OpenAI와 공개 OpenAI는 동일한 이미지 파라미터를 항상 허용하는 것은
아닙니다. Azure는 공개 OpenAI가 허용하는 옵션을 거부하거나(예:
`gpt-image-2`의 특정 `background` 값) 특정 모델 버전에서만 노출할 수
있습니다. 이러한 차이는 OpenClaw가 아니라 Azure와 기본 모델에서 옵니다.
Azure 요청이 검증 오류로 실패하는 경우, Azure 포털에서 특정 deployment
및 API 버전에서 지원되는 파라미터 세트를 확인하십시오.

<Note>
Azure OpenAI는 네이티브 전송 및 호환 동작을 사용하지만 OpenClaw의 숨겨진
attribution 헤더는 받지 않습니다 — [고급 구성](#advanced-configuration)
아래의 **네이티브 vs OpenAI 호환 경로** 아코디언을 참조하십시오.

Azure의 chat 또는 Responses 트래픽(이미지 생성 이상)의 경우, 온보딩
플로우나 전용 Azure 프로바이더 구성을 사용하십시오 — `openai.baseUrl`만으로는
Azure API/인증 형태를 가져오지 않습니다. 별도의 `azure-openai-responses/*`
프로바이더가 있습니다; 아래의 서버 사이드 compaction 아코디언을 참조하십시오.
</Note>

## 고급 구성

<AccordionGroup>
  <Accordion title="전송 (WebSocket vs SSE)">
    OpenClaw는 `openai/*` 및 `openai-codex/*` 모두에 대해 WebSocket 우선, SSE 폴백(`"auto"`)을 사용합니다.

    `"auto"` 모드에서 OpenClaw는:
    - 초기 WebSocket 실패를 한 번 재시도한 후 SSE로 폴백
    - 실패 후 WebSocket을 약 60초 동안 저하로 표시하고 쿨다운 동안 SSE 사용
    - 재시도 및 재연결을 위해 안정적인 세션 및 턴 identity 헤더 첨부
    - 전송 변형 간 사용량 카운터(`input_tokens` / `prompt_tokens`) 정규화

    | 값 | 동작 |
    |-------|----------|
    | `"auto"` (기본값) | WebSocket 우선, SSE 폴백 |
    | `"sse"` | SSE만 강제 |
    | `"websocket"` | WebSocket만 강제 |

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "openai/gpt-5.4": {
              params: { transport: "auto" },
            },
            "openai-codex/gpt-5.5": {
              params: { transport: "auto" },
            },
          },
        },
      },
    }
    ```

    관련 OpenAI 문서:
    - [WebSocket을 사용한 Realtime API](https://platform.openai.com/docs/guides/realtime-websocket)
    - [스트리밍 API 응답 (SSE)](https://platform.openai.com/docs/guides/streaming-responses)

  </Accordion>

  <Accordion title="WebSocket 워밍업">
    OpenClaw는 첫 턴 지연 시간을 줄이기 위해 `openai/*` 및 `openai-codex/*`에 대해 기본적으로 WebSocket 워밍업을 활성화합니다.

    ```json5
    // 워밍업 비활성화
    {
      agents: {
        defaults: {
          models: {
            "openai/gpt-5.4": {
              params: { openaiWsWarmup: false },
            },
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="빠른 모드">
    OpenClaw는 `openai/*` 및 `openai-codex/*`에 대해 공유 빠른 모드 토글을 노출합니다:

    - **Chat/UI:** `/fast status|on|off`
    - **구성:** `agents.defaults.models["<provider>/<model>"].params.fastMode`

    활성화되면, OpenClaw는 빠른 모드를 OpenAI priority processing(`service_tier = "priority"`)에 매핑합니다. 기존 `service_tier` 값은 보존되며, 빠른 모드는 `reasoning` 또는 `text.verbosity`를 다시 쓰지 않습니다.

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "openai/gpt-5.4": { params: { fastMode: true } },
          },
        },
      },
    }
    ```

    <Note>
    세션 재정의는 구성보다 우선합니다. Sessions UI에서 세션 재정의를 제거하면 세션이 구성된 기본값으로 돌아갑니다.
    </Note>

  </Accordion>

  <Accordion title="Priority processing (service_tier)">
    OpenAI의 API는 `service_tier`를 통해 priority processing을 노출합니다. OpenClaw에서 모델별로 설정하십시오:

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "openai/gpt-5.4": { params: { serviceTier: "priority" } },
          },
        },
      },
    }
    ```

    지원 값: `auto`, `default`, `flex`, `priority`.

    <Warning>
    `serviceTier`는 네이티브 OpenAI 엔드포인트(`api.openai.com`)와 네이티브 Codex 엔드포인트(`chatgpt.com/backend-api`)에만 전달됩니다. 프로바이더 중 하나를 프록시를 통해 라우팅하는 경우, OpenClaw는 `service_tier`를 변경하지 않습니다.
    </Warning>

  </Accordion>

  <Accordion title="서버 사이드 compaction (Responses API)">
    직접 OpenAI Responses 모델(`api.openai.com`의 `openai/*`)의 경우, OpenAI 플러그인의 Pi 하니스 스트림 래퍼는 서버 사이드 compaction을 자동으로 활성화합니다:

    - `store: true` 강제(모델 호환성이 `supportsStore: false`로 설정되지 않은 경우)
    - `context_management: [{ type: "compaction", compact_threshold: ... }]` 주입
    - 기본 `compact_threshold`: `contextWindow`의 70% (또는 사용 불가능한 경우 `80000`)

    이는 임베디드 실행에 사용되는 내장 Pi 하니스 경로 및 OpenAI 프로바이더 후크에 적용됩니다. 네이티브 Codex app-server 하니스는 Codex를 통해 자체 context를 관리하며 `agents.defaults.embeddedHarness.runtime`으로 별도로 구성됩니다.

    <Tabs>
      <Tab title="명시적으로 활성화">
        Azure OpenAI Responses와 같은 호환 엔드포인트에 유용합니다:

        ```json5
        {
          agents: {
            defaults: {
              models: {
                "azure-openai-responses/gpt-5.5": {
                  params: { responsesServerCompaction: true },
                },
              },
            },
          },
        }
        ```
      </Tab>
      <Tab title="커스텀 임계값">
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
      </Tab>
      <Tab title="비활성화">
        ```json5
        {
          agents: {
            defaults: {
              models: {
                "openai/gpt-5.4": {
                  params: { responsesServerCompaction: false },
                },
              },
            },
          },
        }
        ```
      </Tab>
    </Tabs>

    <Note>
    `responsesServerCompaction`은 `context_management` 주입만 제어합니다. 직접 OpenAI Responses 모델은 호환성이 `supportsStore: false`를 설정하지 않는 한 여전히 `store: true`를 강제합니다.
    </Note>

  </Accordion>

  <Accordion title="엄격 에이전틱 GPT 모드">
    `openai/*`의 GPT-5 계열 실행에 대해, OpenClaw는 더 엄격한 임베디드 실행 계약을 사용할 수 있습니다:

    ```json5
    {
      agents: {
        defaults: {
          embeddedPi: { executionContract: "strict-agentic" },
        },
      },
    }
    ```

    `strict-agentic`을 사용하면, OpenClaw는:
    - 도구 액션이 사용 가능한 경우 계획만 있는 턴을 더 이상 성공적인 진행으로 취급하지 않음
    - act-now 스티어로 턴을 재시도
    - 상당한 작업에 대해 `update_plan`을 자동 활성화
    - 모델이 액션 없이 계획만 계속하는 경우 명시적인 차단 상태를 표시

    <Note>
    OpenAI 및 Codex GPT-5 계열 실행에만 범위가 지정됩니다. 다른 프로바이더와 이전 모델 계열은 기본 동작을 유지합니다.
    </Note>

  </Accordion>

  <Accordion title="네이티브 vs OpenAI 호환 경로">
    OpenClaw는 직접 OpenAI, Codex, Azure OpenAI 엔드포인트를 일반 OpenAI 호환 `/v1` 프록시와 다르게 취급합니다:

    **네이티브 경로** (`openai/*`, Azure OpenAI):
    - OpenAI `none` effort를 지원하는 모델에 대해서만 `reasoning: { effort: "none" }`을 유지
    - `reasoning.effort: "none"`을 거부하는 모델 또는 프록시에 대해서는 비활성화된 reasoning을 생략
    - 도구 스키마 기본값을 strict 모드로 설정
    - 검증된 네이티브 호스트에서만 숨겨진 attribution 헤더 첨부
    - OpenAI 전용 요청 shaping 유지(`service_tier`, `store`, reasoning 호환성, prompt-cache 힌트)

    **프록시/호환 경로:**
    - 더 느슨한 호환 동작 사용
    - strict 도구 스키마 또는 네이티브 전용 헤더를 강제하지 않음

    Azure OpenAI는 네이티브 전송 및 호환 동작을 사용하지만 숨겨진 attribution 헤더는 받지 않습니다.

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택.
  </Card>
  <Card title="이미지 생성" href="/tools/image-generation" icon="image">
    공유 이미지 도구 파라미터 및 프로바이더 선택.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    공유 비디오 도구 파라미터 및 프로바이더 선택.
  </Card>
  <Card title="OAuth 및 인증" href="/gateway/authentication" icon="key">
    인증 세부 정보 및 자격 증명 재사용 규칙.
  </Card>
</CardGroup>
