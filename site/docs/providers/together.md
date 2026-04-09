---
title: "Together AI"
description: "Together AI 설정 (인증 + 모델 선택)"
---

# Together AI

[Together AI](https://together.ai)는 통합 API를 통해 Llama, DeepSeek, Kimi 등의 주요 오픈 소스 모델에 접근할 수 있습니다.

- 프로바이더: `together`
- 인증: `TOGETHER_API_KEY`
- API: OpenAI 호환
- 기본 URL: `https://api.together.xyz/v1`

## 빠른 시작

1. API 키 설정 (권장: 게이트웨이용으로 저장):

```bash
openclaw onboard --auth-choice together-api-key
```

2. 기본 모델 설정:

```json5
{
  agents: {
    defaults: {
      model: { primary: "together/moonshotai/Kimi-K2.5" },
    },
  },
}
```

## 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice together-api-key \
  --together-api-key "$TOGETHER_API_KEY"
```

이렇게 하면 `together/moonshotai/Kimi-K2.5`가 기본 모델로 설정됩니다.

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우 해당 프로세스에서 `TOGETHER_API_KEY`를 사용할 수 있어야 합니다 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).

## 내장 카탈로그

OpenClaw는 현재 이 번들 Together 카탈로그를 제공합니다:

| 모델 참조                                                    | 이름                                   | 입력         | 컨텍스트   | 참고 사항                         |
| ------------------------------------------------------------ | -------------------------------------- | ------------ | ---------- | --------------------------------- |
| `together/moonshotai/Kimi-K2.5`                              | Kimi K2.5                              | 텍스트, 이미지 | 262,144    | 기본 모델; 추론 활성화             |
| `together/zai-org/GLM-4.7`                                   | GLM 4.7 Fp8                            | 텍스트       | 202,752    | 범용 텍스트 모델                  |
| `together/meta-llama/Llama-3.3-70B-Instruct-Turbo`           | Llama 3.3 70B Instruct Turbo           | 텍스트       | 131,072    | 빠른 지시 모델                    |
| `together/meta-llama/Llama-4-Scout-17B-16E-Instruct`         | Llama 4 Scout 17B 16E Instruct         | 텍스트, 이미지 | 10,000,000 | 멀티모달                          |
| `together/meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | Llama 4 Maverick 17B 128E Instruct FP8 | 텍스트, 이미지 | 20,000,000 | 멀티모달                          |
| `together/deepseek-ai/DeepSeek-V3.1`                         | DeepSeek V3.1                          | 텍스트       | 131,072    | 범용 텍스트 모델                  |
| `together/deepseek-ai/DeepSeek-R1`                           | DeepSeek R1                            | 텍스트       | 131,072    | 추론 모델                         |
| `together/moonshotai/Kimi-K2-Instruct-0905`                  | Kimi K2-Instruct 0905                  | 텍스트       | 262,144    | 보조 Kimi 텍스트 모델             |

온보딩 프리셋은 `together/moonshotai/Kimi-K2.5`를 기본 모델로 설정합니다.

## 비디오 생성

번들 `together` 플러그인은 공유 `video_generate` 도구를 통해 비디오 생성도 등록합니다.

- 기본 비디오 모델: `together/Wan-AI/Wan2.2-T2V-A14B`
- 모드: 텍스트-투-비디오 및 단일 이미지 참조 플로우
- `aspectRatio` 및 `resolution` 지원

Together를 기본 비디오 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "together/Wan-AI/Wan2.2-T2V-A14B",
      },
    },
  },
}
```

공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작에 대해서는 [비디오 생성](/tools/video-generation)을 참조하십시오.
