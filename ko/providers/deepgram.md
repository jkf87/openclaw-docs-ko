---
summary: "인바운드 음성 메모 전사를 위한 Deepgram 전사"
read_when:
  - 오디오 첨부파일에 대한 Deepgram 음성-텍스트 변환이 필요할 때
  - Voice Call을 위한 Deepgram 스트리밍 전사가 필요할 때
  - 빠른 Deepgram 설정 예시가 필요할 때
title: "Deepgram"
---

# Deepgram (오디오 전사)

Deepgram은 음성-텍스트 변환(speech-to-text) API입니다. OpenClaw에서는 `tools.media.audio`를
통한 인바운드 오디오/음성 메모 전사와 `plugins.entries.voice-call.config.streaming`을
통한 Voice Call 스트리밍 STT에 사용됩니다.

배치 전사의 경우, OpenClaw는 전체 오디오 파일을 Deepgram에 업로드하고
전사 결과를 응답 파이프라인(`{{Transcript}}` + `[Audio]` 블록)에 주입합니다.
Voice Call 스트리밍의 경우, OpenClaw는 실시간 G.711 u-law 프레임을 Deepgram의
WebSocket `listen` 엔드포인트로 전달하고 Deepgram이 반환하는 대로 부분 또는
최종 전사를 내보냅니다.

| 항목          | 값                                                         |
| ------------- | ---------------------------------------------------------- |
| 웹사이트      | [deepgram.com](https://deepgram.com)                       |
| 문서          | [developers.deepgram.com](https://developers.deepgram.com) |
| 인증          | `DEEPGRAM_API_KEY`                                         |
| 기본 모델     | `nova-3`                                                   |

## 시작하기

<Steps>
  <Step title="API 키 설정">
    Deepgram API 키를 환경 변수에 추가하세요.

    ```
    DEEPGRAM_API_KEY=dg_...
    ```

  </Step>
  <Step title="오디오 프로바이더 활성화">
    ```json5
    {
      tools: {
        media: {
          audio: {
            enabled: true,
            models: [{ provider: "deepgram", model: "nova-3" }],
          },
        },
      },
    }
    ```
  </Step>
  <Step title="음성 메모 전송">
    연결된 채널 중 하나로 오디오 메시지를 전송하세요. OpenClaw는 Deepgram을 통해
    이를 전사하고 응답 파이프라인에 전사 결과를 주입합니다.
  </Step>
</Steps>

## 설정 옵션

| 옵션              | 경로                                                         | 설명                                  |
| ----------------- | ------------------------------------------------------------ | ------------------------------------- |
| `model`           | `tools.media.audio.models[].model`                           | Deepgram 모델 ID (기본값: `nova-3`)    |
| `language`        | `tools.media.audio.models[].language`                        | 언어 힌트 (선택)                       |
| `detect_language` | `tools.media.audio.providerOptions.deepgram.detect_language` | 언어 감지 활성화 (선택)                |
| `punctuate`       | `tools.media.audio.providerOptions.deepgram.punctuate`       | 구두점 활성화 (선택)                   |
| `smart_format`    | `tools.media.audio.providerOptions.deepgram.smart_format`    | 스마트 포맷팅 활성화 (선택)            |

<Tabs>
  <Tab title="언어 힌트 포함">
    ```json5
    {
      tools: {
        media: {
          audio: {
            enabled: true,
            models: [{ provider: "deepgram", model: "nova-3", language: "en" }],
          },
        },
      },
    }
    ```
  </Tab>
  <Tab title="Deepgram 옵션 포함">
    ```json5
    {
      tools: {
        media: {
          audio: {
            enabled: true,
            providerOptions: {
              deepgram: {
                detect_language: true,
                punctuate: true,
                smart_format: true,
              },
            },
            models: [{ provider: "deepgram", model: "nova-3" }],
          },
        },
      },
    }
    ```
  </Tab>
</Tabs>

## Voice Call 스트리밍 STT

번들된 `deepgram` 플러그인은 Voice Call 플러그인을 위한 실시간 전사 프로바이더도
등록합니다.

| 설정            | 설정 경로                                                               | 기본값                           |
| --------------- | ----------------------------------------------------------------------- | -------------------------------- |
| API 키          | `plugins.entries.voice-call.config.streaming.providers.deepgram.apiKey` | `DEEPGRAM_API_KEY`로 폴백        |
| 모델            | `...deepgram.model`                                                     | `nova-3`                         |
| 언어            | `...deepgram.language`                                                  | (미설정)                         |
| 인코딩          | `...deepgram.encoding`                                                  | `mulaw`                          |
| 샘플레이트      | `...deepgram.sampleRate`                                                | `8000`                           |
| 엔드포인팅      | `...deepgram.endpointingMs`                                             | `800`                            |
| 중간 결과       | `...deepgram.interimResults`                                            | `true`                           |

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          streaming: {
            enabled: true,
            provider: "deepgram",
            providers: {
              deepgram: {
                apiKey: "${DEEPGRAM_API_KEY}",
                model: "nova-3",
                endpointingMs: 800,
                language: "en-US",
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
Voice Call은 전화 통신 오디오를 8 kHz G.711 u-law로 수신합니다. Deepgram
스트리밍 프로바이더의 기본값은 `encoding: "mulaw"`와 `sampleRate: 8000`이므로
Twilio 미디어 프레임을 그대로 전달할 수 있습니다.
</Note>

## 참고 사항

<AccordionGroup>
  <Accordion title="인증">
    인증은 표준 프로바이더 인증 순서를 따릅니다. `DEEPGRAM_API_KEY`가
    가장 간단한 경로입니다.
  </Accordion>
  <Accordion title="프록시 및 커스텀 엔드포인트">
    프록시를 사용하는 경우 `tools.media.audio.baseUrl`과
    `tools.media.audio.headers`로 엔드포인트나 헤더를 재정의하세요.
  </Accordion>
  <Accordion title="출력 동작">
    출력은 다른 프로바이더와 동일한 오디오 규칙(크기 제한, 타임아웃,
    전사 주입)을 따릅니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="미디어 도구" href="/tools/media-overview" icon="photo-film">
    오디오, 이미지, 비디오 처리 파이프라인 개요.
  </Card>
  <Card title="설정" href="/gateway/configuration" icon="gear">
    미디어 도구 설정을 포함한 전체 설정 레퍼런스.
  </Card>
  <Card title="트러블슈팅" href="/help/troubleshooting" icon="wrench">
    일반적인 문제와 디버깅 단계.
  </Card>
  <Card title="FAQ" href="/help/faq" icon="circle-question">
    OpenClaw 설정에 관한 자주 묻는 질문.
  </Card>
</CardGroup>
