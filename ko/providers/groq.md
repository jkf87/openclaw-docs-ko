---
summary: "Groq 설정 (인증 + 모델 선택)"
title: "Groq"
read_when:
  - OpenClaw에서 Groq를 사용하고 싶을 때
  - API 키 환경 변수 또는 CLI 인증 선택지가 필요할 때
---

[Groq](https://groq.com)는 커스텀 LPU 하드웨어를 사용해 오픈소스 모델
(Llama, Gemma, Mistral 등)에서 초고속 추론을 제공합니다. OpenClaw는 OpenAI
호환 API를 통해 Groq에 연결합니다.

| 속성       | 값             |
| ---------- | -------------- |
| 프로바이더 | `groq`         |
| 인증       | `GROQ_API_KEY` |
| API        | OpenAI 호환    |

## 시작하기

<Steps>
  <Step title="API 키 발급">
    [console.groq.com/keys](https://console.groq.com/keys)에서 API 키를 생성하세요.
  </Step>
  <Step title="API 키 설정">
    ```bash
    export GROQ_API_KEY="gsk_..."
    ```
  </Step>
  <Step title="기본 모델 설정">
    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "groq/llama-3.3-70b-versatile" },
        },
      },
    }
    ```
  </Step>
</Steps>

### 설정 파일 예시

```json5
{
  env: { GROQ_API_KEY: "gsk_..." },
  agents: {
    defaults: {
      model: { primary: "groq/llama-3.3-70b-versatile" },
    },
  },
}
```

## 내장 카탈로그

Groq의 모델 카탈로그는 자주 변경됩니다. 현재 사용 가능한 모델을 보려면
`openclaw models list | grep groq`를 실행하거나,
[console.groq.com/docs/models](https://console.groq.com/docs/models)를
확인하세요.

| 모델                        | 비고                                  |
| --------------------------- | ------------------------------------- |
| **Llama 3.3 70B Versatile** | 범용, 대용량 컨텍스트                 |
| **Llama 3.1 8B Instant**    | 빠르고 가벼움                         |
| **Gemma 2 9B**              | 컴팩트, 효율적                        |
| **Mixtral 8x7B**            | MoE 아키텍처, 강력한 추론             |

<Tip>
계정에서 사용 가능한 최신 모델 목록은 `openclaw models list --provider groq`를
사용하세요.
</Tip>

## 오디오 전사(Transcription)

Groq는 Whisper 기반의 빠른 오디오 전사도 제공합니다. 미디어 이해 프로바이더로
구성되면, OpenClaw는 공유 `tools.media.audio` 표면을 통해 Groq의
`whisper-large-v3-turbo` 모델로 음성 메시지를 전사합니다.

```json5
{
  tools: {
    media: {
      audio: {
        models: [{ provider: "groq" }],
      },
    },
  },
}
```

<AccordionGroup>
  <Accordion title="오디오 전사 세부 정보">
    | 속성 | 값 |
    |------|-----|
    | 공유 설정 경로   | `tools.media.audio` |
    | 기본 base URL    | `https://api.groq.com/openai/v1` |
    | 기본 모델        | `whisper-large-v3-turbo` |
    | API 엔드포인트   | OpenAI 호환 `/audio/transcriptions` |
  </Accordion>

  <Accordion title="환경 관련 주의사항">
    Gateway가 데몬(launchd/systemd)으로 실행 중이라면, `GROQ_API_KEY`가 해당
    프로세스에서 접근 가능한지 확인하세요 (예: `~/.openclaw/.env` 또는
    `env.shellEnv`를 통해).

    <Warning>
    대화형 셸에만 설정된 키는 데몬 관리형 게이트웨이 프로세스에서 보이지
    않습니다. 지속적인 접근성을 위해 `~/.openclaw/.env` 또는 `env.shellEnv`
    설정을 사용하세요.
    </Warning>

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    프로바이더 및 오디오 설정을 포함한 전체 설정 스키마.
  </Card>
  <Card title="Groq Console" href="https://console.groq.com" icon="arrow-up-right-from-square">
    Groq 대시보드, API 문서, 가격.
  </Card>
  <Card title="Groq 모델 목록" href="https://console.groq.com/docs/models" icon="list">
    공식 Groq 모델 카탈로그.
  </Card>
</CardGroup>
