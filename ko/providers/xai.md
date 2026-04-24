---
summary: "OpenClaw에서 xAI Grok 모델 사용"
read_when:
  - OpenClaw에서 Grok 모델을 사용하려는 경우
  - xAI 인증 또는 model ID를 구성하는 경우
title: "xAI"
---

OpenClaw는 Grok 모델용 번들 `xai` 프로바이더 플러그인을 제공합니다.

## 시작하기

<Steps>
  <Step title="API 키 생성">
    [xAI 콘솔](https://console.x.ai/)에서 API 키를 생성하십시오.
  </Step>
  <Step title="API 키 설정">
    `XAI_API_KEY`를 설정하거나 다음을 실행하십시오:

    ```bash
    openclaw onboard --auth-choice xai-api-key
    ```

  </Step>
  <Step title="모델 선택">
    ```json5
    {
      agents: { defaults: { model: { primary: "xai/grok-4" } } },
    }
    ```
  </Step>
</Steps>

<Note>
OpenClaw는 번들 xAI transport로 xAI Responses API를 사용합니다. 동일한
`XAI_API_KEY`는 Grok 기반 `web_search`, 일급 `x_search`,
그리고 원격 `code_execution`에도 사용될 수 있습니다.
xAI 키를 `plugins.entries.xai.config.webSearch.apiKey` 아래에 저장하면
번들 xAI 모델 프로바이더가 해당 키를 fallback으로도 재사용합니다.
`code_execution` 튜닝은 `plugins.entries.xai.config.codeExecution` 아래에 있습니다.
</Note>

## 내장 카탈로그

OpenClaw에는 기본으로 다음 xAI 모델 제품군이 포함됩니다:

| 제품군         | Model ID                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| Grok 3         | `grok-3`, `grok-3-fast`, `grok-3-mini`, `grok-3-mini-fast`               |
| Grok 4         | `grok-4`, `grok-4-0709`                                                  |
| Grok 4 Fast    | `grok-4-fast`, `grok-4-fast-non-reasoning`                               |
| Grok 4.1 Fast  | `grok-4-1-fast`, `grok-4-1-fast-non-reasoning`                           |
| Grok 4.20 Beta | `grok-4.20-beta-latest-reasoning`, `grok-4.20-beta-latest-non-reasoning` |
| Grok Code      | `grok-code-fast-1`                                                       |

플러그인은 동일한 API 형태를 따르는 경우 신규 `grok-4*` 및 `grok-code-fast*` ID도
forward-resolve 처리합니다.

<Tip>
`grok-4-fast`, `grok-4-1-fast`, 그리고 `grok-4.20-beta-*` 변형은
번들 카탈로그에서 현재 이미지 지원 가능한 Grok 참조입니다.
</Tip>

## OpenClaw 기능 지원 범위

번들 플러그인은 xAI의 현재 공개 API 표면을 OpenClaw의 공유
프로바이더 및 툴 계약에 매핑합니다. 공유 계약에 맞지 않는 기능
(예: streaming TTS 및 realtime voice)은 노출되지 않습니다. 아래 표를
참조하십시오.

| xAI 기능                    | OpenClaw 표면                               | 상태                                                                 |
| --------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| Chat / Responses            | `xai/<model>` 모델 프로바이더               | 지원                                                                 |
| 서버 측 web search          | `web_search` 프로바이더 `grok`              | 지원                                                                 |
| 서버 측 X 검색              | `x_search` 툴                               | 지원                                                                 |
| 서버 측 코드 실행           | `code_execution` 툴                         | 지원                                                                 |
| 이미지                      | `image_generate`                            | 지원                                                                 |
| 비디오                      | `video_generate`                            | 지원                                                                 |
| 배치 text-to-speech         | `messages.tts.provider: "xai"` / `tts`      | 지원                                                                 |
| Streaming TTS               | —                                           | 미노출; OpenClaw의 TTS 계약은 완전한 audio buffer를 반환함            |
| 배치 speech-to-text         | `tools.media.audio` / 미디어 이해           | 지원                                                                 |
| Streaming speech-to-text    | Voice Call `streaming.provider: "xai"`      | 지원                                                                 |
| Realtime voice              | —                                           | 아직 미노출; 다른 session/WebSocket 계약 필요                         |
| Files / batches             | 제네릭 모델 API 호환성만 해당               | 일급 OpenClaw 툴 아님                                                |

<Note>
OpenClaw는 미디어 생성, 음성, 배치 전사에 xAI의 REST image/video/TTS/STT API를,
실시간 음성 통화 전사에 xAI의 streaming STT WebSocket을, 그리고 모델, 검색,
code-execution 툴에 Responses API를 사용합니다. Realtime voice session처럼
다른 OpenClaw 계약이 필요한 기능은 숨겨진 플러그인 동작이 아니라
upstream 기능으로 여기에 문서화되어 있습니다.
</Note>

### Fast-mode 매핑

`/fast on` 또는 `agents.defaults.models["xai/<model>"].params.fastMode: true`는
네이티브 xAI 요청을 다음과 같이 재작성합니다:

| Source model  | Fast-mode 대상     |
| ------------- | ------------------ |
| `grok-3`      | `grok-3-fast`      |
| `grok-3-mini` | `grok-3-mini-fast` |
| `grok-4`      | `grok-4-fast`      |
| `grok-4-0709` | `grok-4-fast`      |

### 레거시 호환성 별칭

레거시 별칭은 여전히 정규 번들 ID로 정규화됩니다:

| 레거시 별칭               | 정규 ID                               |
| ------------------------- | ------------------------------------- |
| `grok-4-fast-reasoning`   | `grok-4-fast`                         |
| `grok-4-1-fast-reasoning` | `grok-4-1-fast`                       |
| `grok-4.20-reasoning`     | `grok-4.20-beta-latest-reasoning`     |
| `grok-4.20-non-reasoning` | `grok-4.20-beta-latest-non-reasoning` |

## 기능

<AccordionGroup>
  <Accordion title="Web search">
    번들 `grok` web-search 프로바이더도 `XAI_API_KEY`를 사용합니다:

    ```bash
    openclaw config set tools.web.search.provider grok
    ```

  </Accordion>

  <Accordion title="비디오 생성">
    번들 `xai` 플러그인은 공유 `video_generate` 툴을 통해 비디오 생성을
    등록합니다.

    - 기본 비디오 모델: `xai/grok-imagine-video`
    - 모드: text-to-video, image-to-video, 원격 비디오 편집, 원격 비디오
      확장
    - 종횡비: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`
    - 해상도: `480P`, `720P`
    - 길이: 생성/image-to-video는 1-15초, 확장은 2-10초

    <Warning>
    로컬 비디오 버퍼는 허용되지 않습니다. 비디오 편집/확장 입력에는
    원격 `http(s)` URL을 사용하십시오. Image-to-video는 OpenClaw가 이를
    xAI에 대한 data URL로 인코딩할 수 있으므로 로컬 이미지 버퍼를 허용합니다.
    </Warning>

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

    <Note>
    공유 툴 파라미터, 프로바이더 선택, failover 동작은 [비디오 생성](/tools/video-generation)을
    참조하십시오.
    </Note>

  </Accordion>

  <Accordion title="이미지 생성">
    번들 `xai` 플러그인은 공유 `image_generate` 툴을 통해 이미지 생성을
    등록합니다.

    - 기본 이미지 모델: `xai/grok-imagine-image`
    - 추가 모델: `xai/grok-imagine-image-pro`
    - 모드: text-to-image 및 reference-image 편집
    - 레퍼런스 입력: `image` 하나 또는 최대 다섯 개의 `images`
    - 종횡비: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2:3`, `3:2`
    - 해상도: `1K`, `2K`
    - 개수: 최대 4장

    OpenClaw는 생성된 미디어가 일반 채널 첨부 경로를 통해 저장되고 전달될 수
    있도록 xAI에 `b64_json` 이미지 응답을 요청합니다. 로컬 레퍼런스 이미지는
    data URL로 변환되며, 원격 `http(s)` 레퍼런스는 그대로 전달됩니다.

    xAI를 기본 이미지 프로바이더로 사용하려면:

    ```json5
    {
      agents: {
        defaults: {
          imageGenerationModel: {
            primary: "xai/grok-imagine-image",
          },
        },
      },
    }
    ```

    <Note>
    xAI는 `quality`, `mask`, `user`, 그리고 `1:2`, `2:1`, `9:20`, `20:9`와 같은
    추가 네이티브 종횡비도 문서화합니다. OpenClaw는 현재 공유 크로스-프로바이더
    이미지 컨트롤만 전달합니다. 지원되지 않는 네이티브 전용 옵션은 의도적으로
    `image_generate`를 통해 노출되지 않습니다.
    </Note>

  </Accordion>

  <Accordion title="Text-to-speech">
    번들 `xai` 플러그인은 공유 `tts` 프로바이더 표면을 통해 text-to-speech를
    등록합니다.

    - 보이스: `eve`, `ara`, `rex`, `sal`, `leo`, `una`
    - 기본 보이스: `eve`
    - 포맷: `mp3`, `wav`, `pcm`, `mulaw`, `alaw`
    - 언어: BCP-47 코드 또는 `auto`
    - 속도: 프로바이더 네이티브 속도 재정의
    - 네이티브 Opus voice-note 포맷은 지원되지 않음

    xAI를 기본 TTS 프로바이더로 사용하려면:

    ```json5
    {
      messages: {
        tts: {
          provider: "xai",
          providers: {
            xai: {
              voiceId: "eve",
            },
          },
        },
      },
    }
    ```

    <Note>
    OpenClaw는 xAI의 배치 `/v1/tts` 엔드포인트를 사용합니다. xAI는 WebSocket을
    통한 streaming TTS도 제공하지만, OpenClaw speech 프로바이더 계약은 현재
    응답 전달 전에 완전한 audio buffer를 기대합니다.
    </Note>

  </Accordion>

  <Accordion title="Speech-to-text">
    번들 `xai` 플러그인은 OpenClaw의 미디어 이해 전사 표면을 통해 배치
    speech-to-text를 등록합니다.

    - 기본 모델: `grok-stt`
    - 엔드포인트: xAI REST `/v1/stt`
    - 입력 경로: multipart 오디오 파일 업로드
    - Discord 음성 채널 세그먼트 및 채널 오디오 첨부를 포함하여
      인바운드 오디오 전사에 `tools.media.audio`를 사용하는 곳 어디서나
      OpenClaw에서 지원

    인바운드 오디오 전사에 xAI를 강제로 사용하려면:

    ```json5
    {
      tools: {
        media: {
          audio: {
            models: [
              {
                type: "provider",
                provider: "xai",
                model: "grok-stt",
              },
            ],
          },
        },
      },
    }
    ```

    언어는 공유 오디오 미디어 구성 또는 호출별 전사 요청을 통해 제공될 수
    있습니다. 프롬프트 힌트는 공유 OpenClaw 표면에서 허용되지만, xAI REST STT
    통합은 file, model, language만 전달합니다. 이는 현재 공개 xAI 엔드포인트에
    깔끔하게 매핑되기 때문입니다.

  </Accordion>

  <Accordion title="Streaming speech-to-text">
    번들 `xai` 플러그인은 또한 실시간 음성 통화 오디오에 대한 realtime 전사
    프로바이더를 등록합니다.

    - 엔드포인트: xAI WebSocket `wss://api.x.ai/v1/stt`
    - 기본 인코딩: `mulaw`
    - 기본 샘플 레이트: `8000`
    - 기본 endpointing: `800ms`
    - 중간 전사: 기본적으로 활성화

    Voice Call의 Twilio 미디어 스트림은 G.711 µ-law 오디오 프레임을 전송하므로,
    xAI 프로바이더는 transcoding 없이 해당 프레임을 직접 전달할 수 있습니다:

    ```json5
    {
      plugins: {
        entries: {
          "voice-call": {
            config: {
              streaming: {
                enabled: true,
                provider: "xai",
                providers: {
                  xai: {
                    apiKey: "${XAI_API_KEY}",
                    endpointingMs: 800,
                    language: "en",
                  },
                },
              },
            },
          },
        },
      },
    }
    ```

    프로바이더 소유 구성은
    `plugins.entries.voice-call.config.streaming.providers.xai` 아래에 있습니다.
    지원되는 키는 `apiKey`, `baseUrl`, `sampleRate`, `encoding` (`pcm`, `mulaw`,
    또는 `alaw`), `interimResults`, `endpointingMs`, `language`입니다.

    <Note>
    이 streaming 프로바이더는 Voice Call의 realtime 전사 경로를 위한 것입니다.
    Discord 음성은 현재 짧은 세그먼트를 녹음하고 대신 배치 `tools.media.audio`
    전사 경로를 사용합니다.
    </Note>

  </Accordion>

  <Accordion title="x_search 구성">
    번들 xAI 플러그인은 Grok을 통해 X (구 Twitter) 콘텐츠를 검색하기 위한
    OpenClaw 툴로 `x_search`를 노출합니다.

    구성 경로: `plugins.entries.xai.config.xSearch`

    | 키                 | 타입    | 기본값             | 설명                                 |
    | ------------------ | ------- | ------------------ | ------------------------------------ |
    | `enabled`          | boolean | —                  | x_search 활성화 또는 비활성화        |
    | `model`            | string  | `grok-4-1-fast`    | x_search 요청에 사용되는 모델        |
    | `inlineCitations`  | boolean | —                  | 결과에 인라인 인용 포함              |
    | `maxTurns`         | number  | —                  | 최대 대화 턴 수                      |
    | `timeoutSeconds`   | number  | —                  | 요청 타임아웃 (초)                   |
    | `cacheTtlMinutes`  | number  | —                  | 캐시 TTL (분)                        |

    ```json5
    {
      plugins: {
        entries: {
          xai: {
            config: {
              xSearch: {
                enabled: true,
                model: "grok-4-1-fast",
                inlineCitations: true,
              },
            },
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="Code execution 구성">
    번들 xAI 플러그인은 xAI의 샌드박스 환경에서 원격 코드 실행을 위한
    OpenClaw 툴로 `code_execution`을 노출합니다.

    구성 경로: `plugins.entries.xai.config.codeExecution`

    | 키                | 타입    | 기본값                       | 설명                                      |
    | ----------------- | ------- | ---------------------------- | ----------------------------------------- |
    | `enabled`         | boolean | `true` (키 사용 가능 시)     | 코드 실행 활성화 또는 비활성화            |
    | `model`           | string  | `grok-4-1-fast`              | 코드 실행 요청에 사용되는 모델            |
    | `maxTurns`        | number  | —                            | 최대 대화 턴 수                           |
    | `timeoutSeconds`  | number  | —                            | 요청 타임아웃 (초)                        |

    <Note>
    이는 원격 xAI 샌드박스 실행이며, 로컬 [`exec`](/tools/exec)이 아닙니다.
    </Note>

    ```json5
    {
      plugins: {
        entries: {
          xai: {
            config: {
              codeExecution: {
                enabled: true,
                model: "grok-4-1-fast",
              },
            },
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="알려진 제한 사항">
    - 현재 인증은 API 키 전용입니다. OpenClaw에는 아직 xAI OAuth나
      device-code flow가 없습니다.
    - `grok-4.20-multi-agent-experimental-beta-0304`은 표준 OpenClaw xAI
      transport와 다른 upstream API 표면을 필요로 하므로 일반 xAI 프로바이더
      경로에서 지원되지 않습니다.
    - xAI Realtime voice는 아직 OpenClaw 프로바이더로 등록되지 않았습니다.
      배치 STT 또는 streaming 전사와 다른 양방향 voice session 계약이 필요합니다.
    - xAI 이미지 `quality`, 이미지 `mask`, 추가 네이티브 전용 종횡비는
      공유 `image_generate` 툴이 대응하는 크로스-프로바이더 컨트롤을 가질
      때까지 노출되지 않습니다.
  </Accordion>

  <Accordion title="고급 참고 사항">
    - OpenClaw는 공유 runner 경로에서 xAI 고유의 tool-schema 및 tool-call 호환성
      수정을 자동으로 적용합니다.
    - 네이티브 xAI 요청은 기본적으로 `tool_stream: true`입니다. 비활성화하려면
      `agents.defaults.models["xai/<model>"].params.tool_stream`을 `false`로
      설정하십시오.
    - 번들 xAI 래퍼는 네이티브 xAI 요청을 보내기 전에 지원되지 않는 strict
      tool-schema 플래그와 reasoning payload 키를 제거합니다.
    - `web_search`, `x_search`, `code_execution`은 OpenClaw 툴로 노출됩니다.
      OpenClaw는 모든 채팅 턴에 모든 네이티브 툴을 연결하는 대신 각 툴 요청
      내에서 필요한 특정 xAI 내장 기능을 활성화합니다.
    - `x_search`와 `code_execution`은 핵심 모델 runtime에 하드코딩되지 않고
      번들 xAI 플러그인이 소유합니다.
    - `code_execution`은 원격 xAI 샌드박스 실행이며, 로컬 [`exec`](/tools/exec)이
      아닙니다.
  </Accordion>
</AccordionGroup>

## 라이브 테스트

xAI 미디어 경로는 단위 테스트와 opt-in 라이브 스위트로 커버됩니다. 라이브
명령은 `XAI_API_KEY`를 확인하기 전에 `~/.profile`을 포함한 로그인 셸에서
secrets를 로드합니다.

```bash
pnpm test extensions/xai
OPENCLAW_LIVE_TEST=1 OPENCLAW_LIVE_TEST_QUIET=1 pnpm test:live -- extensions/xai/xai.live.test.ts
OPENCLAW_LIVE_TEST=1 OPENCLAW_LIVE_TEST_QUIET=1 OPENCLAW_LIVE_IMAGE_GENERATION_PROVIDERS=xai pnpm test:live -- test/image-generation.runtime.live.test.ts
```

프로바이더별 라이브 파일은 일반 TTS, 전화 친화적 PCM TTS를 합성하고, xAI 배치
STT를 통해 오디오를 전사하며, 동일 PCM을 xAI realtime STT를 통해 스트리밍하고,
text-to-image 출력을 생성하고, 레퍼런스 이미지를 편집합니다. 공유 이미지 라이브
파일은 OpenClaw의 runtime 선택, fallback, 정규화, 미디어 첨부 경로를 통해
동일한 xAI 프로바이더를 검증합니다.

## 관련 항목

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 참조, failover 동작 선택.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    공유 비디오 툴 파라미터 및 프로바이더 선택.
  </Card>
  <Card title="모든 프로바이더" href="/providers/" icon="grid-2">
    보다 폭넓은 프로바이더 개요.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반적인 문제와 해결책.
  </Card>
</CardGroup>
