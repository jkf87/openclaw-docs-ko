---
title: "NVIDIA"
description: "OpenClaw에서 NVIDIA의 OpenAI 호환 API 사용"
---

# NVIDIA

NVIDIA는 오픈 모델을 무료로 제공하는 OpenAI 호환 API를 `https://integrate.api.nvidia.com/v1`에서 제공합니다. [build.nvidia.com](https://build.nvidia.com/settings/api-keys)에서 API 키로 인증하십시오.

## CLI 설정

키를 한 번 내보낸 후 온보딩을 실행하고 NVIDIA 모델을 설정하십시오:

```bash
export NVIDIA_API_KEY="nvapi-..."
openclaw onboard --auth-choice skip
openclaw models set nvidia/nvidia/nemotron-3-super-120b-a12b
```

여전히 `--token`을 전달하는 경우 셸 히스토리 및 `ps` 출력에 노출된다는 점에 유의하십시오; 가능하면 환경 변수를 사용하십시오.

## 구성 스니펫

```json5
{
  env: { NVIDIA_API_KEY: "nvapi-..." },
  models: {
    providers: {
      nvidia: {
        baseUrl: "https://integrate.api.nvidia.com/v1",
        api: "openai-completions",
      },
    },
  },
  agents: {
    defaults: {
      model: { primary: "nvidia/nvidia/nemotron-3-super-120b-a12b" },
    },
  },
}
```

## 모델 ID

| 모델 참조                                  | 이름                         | 컨텍스트  | 최대 출력 |
| ------------------------------------------ | ---------------------------- | --------- | --------- |
| `nvidia/nvidia/nemotron-3-super-120b-a12b` | NVIDIA Nemotron 3 Super 120B | 262,144   | 8,192     |
| `nvidia/moonshotai/kimi-k2.5`              | Kimi K2.5                    | 262,144   | 8,192     |
| `nvidia/minimaxai/minimax-m2.5`            | Minimax M2.5                 | 196,608   | 8,192     |
| `nvidia/z-ai/glm5`                         | GLM 5                        | 202,752   | 8,192     |

## 참고 사항

- OpenAI 호환 `/v1` 엔드포인트; [build.nvidia.com](https://build.nvidia.com/)에서 API 키를 사용하십시오.
- `NVIDIA_API_KEY`가 설정된 경우 프로바이더가 자동으로 활성화됩니다.
- 번들 카탈로그는 정적이며; 비용은 소스에서 기본적으로 `0`입니다.
