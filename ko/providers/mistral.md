---
summary: "OpenClaw에서 Mistral 모델 및 Voxtral 전사 사용"
read_when:
  - OpenClaw에서 Mistral 모델을 사용하려는 경우
  - Mistral API 키 온보딩 및 모델 참조가 필요한 경우
title: "Mistral"
---

# Mistral

OpenClaw는 텍스트/이미지 모델 라우팅(`mistral/...`)과 미디어 이해에서 Voxtral을 통한 오디오 전사 모두에 Mistral을 지원합니다.
Mistral은 메모리 임베딩(`memorySearch.provider = "mistral"`)에도 사용할 수 있습니다.

## CLI 설정

```bash
openclaw onboard --auth-choice mistral-api-key
# 또는 비대화형
openclaw onboard --mistral-api-key "$MISTRAL_API_KEY"
```

## 구성 스니펫 (LLM 프로바이더)

```json5
{
  env: { MISTRAL_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "mistral/mistral-large-latest" } } },
}
```

## 내장 LLM 카탈로그

OpenClaw는 현재 다음 번들 Mistral 카탈로그를 제공합니다:

| 모델 참조                        | 입력           | 컨텍스트  | 최대 출력 | 참고 사항                                                        |
| -------------------------------- | -------------- | --------- | --------- | ---------------------------------------------------------------- |
| `mistral/mistral-large-latest`   | 텍스트, 이미지 | 262,144   | 16,384    | 기본 모델                                                        |
| `mistral/mistral-medium-2508`    | 텍스트, 이미지 | 262,144   | 8,192     | Mistral Medium 3.1                                               |
| `mistral/mistral-small-latest`   | 텍스트, 이미지 | 128,000   | 16,384    | Mistral Small 4; API `reasoning_effort`를 통한 조정 가능한 추론  |
| `mistral/pixtral-large-latest`   | 텍스트, 이미지 | 128,000   | 32,768    | Pixtral                                                          |
| `mistral/codestral-latest`       | 텍스트         | 256,000   | 4,096     | 코딩                                                             |
| `mistral/devstral-medium-latest` | 텍스트         | 262,144   | 32,768    | Devstral 2                                                       |
| `mistral/magistral-small`        | 텍스트         | 128,000   | 40,000    | 추론 활성화                                                      |

## 구성 스니펫 (Voxtral을 사용한 오디오 전사)

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

## 조정 가능한 추론 (`mistral-small-latest`)

`mistral/mistral-small-latest`는 Mistral Small 4에 매핑되며 Chat Completions API에서 `reasoning_effort` (`none`은 출력의 추가 사고를 최소화합니다; `high`는 최종 답변 전에 전체 사고 추적을 표시합니다)를 통해 [조정 가능한 추론](https://docs.mistral.ai/capabilities/reasoning/adjustable)을 지원합니다.

OpenClaw는 세션 **사고** 수준을 Mistral의 API에 매핑합니다:

- **off** / **minimal** → `none`
- **low** / **medium** / **high** / **xhigh** / **adaptive** → `high`

다른 번들 Mistral 카탈로그 모델은 이 파라미터를 사용하지 않습니다; Mistral의 네이티브 추론 우선 동작을 원할 때는 `magistral-*` 모델을 계속 사용하십시오.

## 참고 사항

- Mistral 인증은 `MISTRAL_API_KEY`를 사용합니다.
- 프로바이더 기본 URL은 기본적으로 `https://api.mistral.ai/v1`입니다.
- 온보딩 기본 모델은 `mistral/mistral-large-latest`입니다.
- Mistral에 대한 미디어 이해 기본 오디오 모델은 `voxtral-mini-latest`입니다.
- 미디어 전사 경로는 `/v1/audio/transcriptions`를 사용합니다.
- 메모리 임베딩 경로는 `/v1/embeddings`를 사용합니다 (기본 모델: `mistral-embed`).
