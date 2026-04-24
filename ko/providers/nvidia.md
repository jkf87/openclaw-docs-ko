---
summary: "OpenClaw에서 NVIDIA의 OpenAI 호환 API 사용하기"
read_when:
  - OpenClaw에서 오픈 모델을 무료로 사용하고 싶을 때
  - NVIDIA_API_KEY 설정이 필요할 때
title: "NVIDIA"
---

NVIDIA는 오픈 모델을 무료로 사용할 수 있도록 `https://integrate.api.nvidia.com/v1`에서
OpenAI 호환 API를 제공합니다. [build.nvidia.com](https://build.nvidia.com/settings/api-keys)에서
발급한 API 키로 인증하십시오.

## 시작하기

<Steps>
  <Step title="API 키 발급">
    [build.nvidia.com](https://build.nvidia.com/settings/api-keys)에서 API 키를 생성합니다.
  </Step>
  <Step title="키 내보내기 및 온보딩 실행">
    ```bash
    export NVIDIA_API_KEY="nvapi-..."
    openclaw onboard --auth-choice skip
    ```
  </Step>
  <Step title="NVIDIA 모델 설정">
    ```bash
    openclaw models set nvidia/nvidia/nemotron-3-super-120b-a12b
    ```
  </Step>
</Steps>

<Warning>
환경 변수 대신 `--token`을 전달하면 그 값이 셸 히스토리와 `ps` 출력에 남습니다.
가능하면 `NVIDIA_API_KEY` 환경 변수를 우선 사용하십시오.
</Warning>

## 설정 예시

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

## 내장 카탈로그

| 모델 ref                                   | 이름                         | 컨텍스트 | 최대 출력  |
| ------------------------------------------ | ---------------------------- | ------- | ---------- |
| `nvidia/nvidia/nemotron-3-super-120b-a12b` | NVIDIA Nemotron 3 Super 120B | 262,144 | 8,192      |
| `nvidia/moonshotai/kimi-k2.5`              | Kimi K2.5                    | 262,144 | 8,192      |
| `nvidia/minimaxai/minimax-m2.5`            | Minimax M2.5                 | 196,608 | 8,192      |
| `nvidia/z-ai/glm5`                         | GLM 5                        | 202,752 | 8,192      |

## 고급 설정

<AccordionGroup>
  <Accordion title="자동 활성화 동작">
    `NVIDIA_API_KEY` 환경 변수가 설정되면 프로바이더가 자동으로 활성화됩니다.
    키 이외의 명시적 프로바이더 설정은 필요하지 않습니다.
  </Accordion>

  <Accordion title="카탈로그와 가격 정책">
    번들된 카탈로그는 정적입니다. NVIDIA가 현재 해당 모델들에 대해 무료 API 접근을
    제공하므로 소스의 cost는 기본적으로 `0`으로 설정됩니다.
  </Accordion>

  <Accordion title="OpenAI 호환 엔드포인트">
    NVIDIA는 표준 `/v1` completions 엔드포인트를 사용합니다. 모든 OpenAI 호환
    도구는 NVIDIA base URL과 함께 별도 설정 없이 동작해야 합니다.
  </Accordion>
</AccordionGroup>

<Tip>
NVIDIA 모델은 현재 무료로 사용할 수 있습니다. 최신 가용성 및 rate limit 세부 사항은
[build.nvidia.com](https://build.nvidia.com/)에서 확인하십시오.
</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, failover 동작 선택.
  </Card>
  <Card title="구성 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    agent, 모델, 프로바이더에 대한 전체 구성 레퍼런스.
  </Card>
</CardGroup>
