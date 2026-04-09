---
title: "Groq"
description: "Groq 설정 (인증 + 모델 선택)"
---

# Groq

[Groq](https://groq.com)은 커스텀 LPU 하드웨어를 사용하여 오픈소스 모델(Llama, Gemma, Mistral 등)에서 초고속 추론을 제공합니다. OpenClaw는 OpenAI 호환 API를 통해 Groq에 연결합니다.

- 프로바이더: `groq`
- 인증: `GROQ_API_KEY`
- API: OpenAI 호환

## 빠른 시작

1. [console.groq.com/keys](https://console.groq.com/keys)에서 API 키를 발급받으십시오.

2. API 키 설정:

```bash
export GROQ_API_KEY="gsk_..."
```

3. 기본 모델 설정:

```json5
{
  agents: {
    defaults: {
      model: { primary: "groq/llama-3.3-70b-versatile" },
    },
  },
}
```

## 구성 파일 예시

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

## 오디오 전사

Groq은 빠른 Whisper 기반 오디오 전사도 제공합니다. 미디어 이해 프로바이더로 구성된 경우, OpenClaw는 공유 `tools.media.audio` 인터페이스를 통해 Groq의 `whisper-large-v3-turbo` 모델을 사용하여 음성 메시지를 전사합니다.

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

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우, `GROQ_API_KEY`가 해당 프로세스에서 사용 가능한지 확인하십시오 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).

## 오디오 참고 사항

- 공유 구성 경로: `tools.media.audio`
- 기본 Groq 오디오 기본 URL: `https://api.groq.com/openai/v1`
- 기본 Groq 오디오 모델: `whisper-large-v3-turbo`
- Groq 오디오 전사는 OpenAI 호환 `/audio/transcriptions` 경로를 사용합니다

## 사용 가능한 모델

Groq의 모델 카탈로그는 자주 변경됩니다. `openclaw models list | grep groq`를 실행하여 현재 사용 가능한 모델을 확인하거나, [console.groq.com/docs/models](https://console.groq.com/docs/models)를 확인하십시오.

인기 있는 선택:

- **Llama 3.3 70B Versatile** - 범용, 큰 컨텍스트
- **Llama 3.1 8B Instant** - 빠르고 경량
- **Gemma 2 9B** - 소형, 효율적
- **Mixtral 8x7B** - MoE 아키텍처, 강력한 추론

## 링크

- [Groq Console](https://console.groq.com)
- [API 문서](https://console.groq.com/docs)
- [모델 목록](https://console.groq.com/docs/models)
- [가격](https://groq.com/pricing)
