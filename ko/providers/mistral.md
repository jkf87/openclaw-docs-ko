---
summary: "OpenClaw에서 Mistral 모델과 Voxtral 전사를 사용하는 방법"
read_when:
  - OpenClaw에서 Mistral 모델을 사용하고자 할 때
  - Voice Call을 위한 Voxtral 실시간 전사가 필요할 때
  - Mistral API 키 온보딩과 모델 레퍼런스가 필요할 때
title: "Mistral"
---

OpenClaw는 Mistral을 텍스트/이미지 모델 라우팅(`mistral/...`)과 미디어 이해
파이프라인의 Voxtral 오디오 전사 모두에서 지원합니다.
Mistral은 메모리 임베딩(`memorySearch.provider = "mistral"`)에도 사용할 수 있습니다.

- Provider: `mistral`
- 인증: `MISTRAL_API_KEY`
- API: Mistral Chat Completions (`https://api.mistral.ai/v1`)

## 시작하기

<Steps>
  <Step title="API 키 발급">
    [Mistral Console](https://console.mistral.ai/)에서 API 키를 생성하세요.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice mistral-api-key
    ```

    또는 키를 직접 전달하세요.

    ```bash
    openclaw onboard --mistral-api-key "$MISTRAL_API_KEY"
    ```

  </Step>
  <Step title="기본 모델 설정">
    ```json5
    {
      env: { MISTRAL_API_KEY: "sk-..." },
      agents: { defaults: { model: { primary: "mistral/mistral-large-latest" } } },
    }
    ```
  </Step>
  <Step title="모델 사용 가능 여부 확인">
    ```bash
    openclaw models list --provider mistral
    ```
  </Step>
</Steps>

## 내장 LLM 카탈로그

OpenClaw는 현재 다음과 같은 번들 Mistral 카탈로그를 제공합니다.

| 모델 레퍼런스                    | 입력        | 컨텍스트 | 최대 출력  | 비고                                                              |
| -------------------------------- | ----------- | ------- | ---------- | ---------------------------------------------------------------- |
| `mistral/mistral-large-latest`   | text, image | 262,144 | 16,384     | 기본 모델                                                        |
| `mistral/mistral-medium-2508`    | text, image | 262,144 | 8,192      | Mistral Medium 3.1                                               |
| `mistral/mistral-small-latest`   | text, image | 128,000 | 16,384     | Mistral Small 4; API `reasoning_effort`를 통한 추론 수준 조절 가능 |
| `mistral/pixtral-large-latest`   | text, image | 128,000 | 32,768     | Pixtral                                                          |
| `mistral/codestral-latest`       | text        | 256,000 | 4,096      | 코딩                                                             |
| `mistral/devstral-medium-latest` | text        | 262,144 | 32,768     | Devstral 2                                                       |
| `mistral/magistral-small`        | text        | 128,000 | 40,000     | 추론 기능 활성화                                                 |

## 오디오 전사 (Voxtral)

Voxtral을 미디어 이해 파이프라인을 통해 배치(batch) 오디오 전사에 사용하세요.

```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [{ provider: "mistral", model: "voxtral-mini-latest" }],
      },
    },
  },
}
```

<Tip>
미디어 전사 경로는 `/v1/audio/transcriptions`를 사용합니다. Mistral의 기본 오디오 모델은 `voxtral-mini-latest`입니다.
</Tip>

## Voice Call 스트리밍 STT

번들된 `mistral` 플러그인은 Voxtral Realtime을 Voice Call
스트리밍 STT 프로바이더로 등록합니다.

| 설정         | 설정 경로                                                              | 기본값                                  |
| ------------ | ---------------------------------------------------------------------- | --------------------------------------- |
| API 키       | `plugins.entries.voice-call.config.streaming.providers.mistral.apiKey` | `MISTRAL_API_KEY`로 폴백                |
| 모델         | `...mistral.model`                                                     | `voxtral-mini-transcribe-realtime-2602` |
| 인코딩       | `...mistral.encoding`                                                  | `pcm_mulaw`                             |
| 샘플레이트   | `...mistral.sampleRate`                                                | `8000`                                  |
| 타깃 지연    | `...mistral.targetStreamingDelayMs`                                    | `800`                                   |

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          streaming: {
            enabled: true,
            provider: "mistral",
            providers: {
              mistral: {
                apiKey: "${MISTRAL_API_KEY}",
                targetStreamingDelayMs: 800,
              },
            },
          },
        },
      },
    },
  },
}
```

<Note>
OpenClaw는 Mistral 실시간 STT의 기본값을 8 kHz `pcm_mulaw`로 설정하여 Voice Call이
Twilio 미디어 프레임을 그대로 전달할 수 있도록 합니다. 업스트림 스트림이 이미
원본 PCM이라면 `encoding: "pcm_s16le"`와 일치하는 `sampleRate`를 사용하세요.
</Note>

## 고급 설정

<AccordionGroup>
  <Accordion title="추론 수준 조절 (mistral-small-latest)">
    `mistral/mistral-small-latest`는 Mistral Small 4에 매핑되며 Chat Completions API의 `reasoning_effort`를 통한 [추론 수준 조절](https://docs.mistral.ai/capabilities/reasoning/adjustable)을 지원합니다(`none`은 출력에서 추가 사고를 최소화, `high`는 최종 답변 전에 전체 사고 과정을 노출).

    OpenClaw는 세션의 **thinking** 수준을 Mistral API에 다음과 같이 매핑합니다.

    | OpenClaw thinking 수준                           | Mistral `reasoning_effort` |
    | ------------------------------------------------ | -------------------------- |
    | **off** / **minimal**                            | `none`                     |
    | **low** / **medium** / **high** / **xhigh** / **adaptive** / **max** | `high`     |

    <Note>
    번들된 다른 Mistral 카탈로그 모델은 이 파라미터를 사용하지 않습니다. Mistral의 네이티브 추론 우선 동작을 원하는 경우 `magistral-*` 모델을 계속 사용하세요.
    </Note>

  </Accordion>

  <Accordion title="메모리 임베딩">
    Mistral은 `/v1/embeddings`를 통해 메모리 임베딩을 제공할 수 있습니다(기본 모델: `mistral-embed`).

    ```json5
    {
      memorySearch: { provider: "mistral" },
    }
    ```

  </Accordion>

  <Accordion title="인증 및 base URL">
    - Mistral 인증은 `MISTRAL_API_KEY`를 사용합니다.
    - 프로바이더 base URL의 기본값은 `https://api.mistral.ai/v1`입니다.
    - 온보딩 기본 모델은 `mistral/mistral-large-latest`입니다.
    - Z.AI는 API 키로 Bearer 인증을 사용합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 레퍼런스, 페일오버 동작 선택 방법.
  </Card>
  <Card title="미디어 이해" href="/nodes/media-understanding" icon="microphone">
    오디오 전사 설정과 프로바이더 선택.
  </Card>
</CardGroup>
