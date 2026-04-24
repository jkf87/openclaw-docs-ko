---
summary: "Together AI 설정 (인증 + 모델 선택)"
title: "Together AI"
read_when:
  - OpenClaw에서 Together AI를 사용하고 싶을 때
  - API 키 환경 변수 또는 CLI 인증 선택지가 필요할 때
---

[Together AI](https://together.ai)는 Llama, DeepSeek, Kimi 등 주요 오픈소스
모델을 통합 API로 제공하는 플랫폼입니다.

| 항목     | 값                            |
| -------- | ----------------------------- |
| Provider | `together`                    |
| 인증     | `TOGETHER_API_KEY`            |
| API      | OpenAI 호환                   |
| Base URL | `https://api.together.xyz/v1` |

## 시작하기

<Steps>
  <Step title="API 키 발급">
    [api.together.ai/settings/api-keys](https://api.together.ai/settings/api-keys)에서
    API 키를 생성합니다.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice together-api-key
    ```
  </Step>
  <Step title="기본 모델 설정">
    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "together/moonshotai/Kimi-K2.5" },
        },
      },
    }
    ```
  </Step>
</Steps>

### 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice together-api-key \
  --together-api-key "$TOGETHER_API_KEY"
```

<Note>
온보딩 프리셋은 기본 모델을 `together/moonshotai/Kimi-K2.5`로 설정합니다.
</Note>

## 내장 카탈로그

OpenClaw는 다음 Together 카탈로그를 번들로 제공합니다:

| 모델 ref                                                      | 이름                                   | 입력        | 컨텍스트    | 비고                                      |
| ------------------------------------------------------------ | -------------------------------------- | ----------- | ---------- | ----------------------------------------- |
| `together/moonshotai/Kimi-K2.5`                              | Kimi K2.5                              | text, image | 262,144    | 기본 모델; reasoning 활성화                |
| `together/zai-org/GLM-4.7`                                   | GLM 4.7 Fp8                            | text        | 202,752    | 범용 텍스트 모델                           |
| `together/meta-llama/Llama-3.3-70B-Instruct-Turbo`           | Llama 3.3 70B Instruct Turbo           | text        | 131,072    | 빠른 instruct 모델                         |
| `together/meta-llama/Llama-4-Scout-17B-16E-Instruct`         | Llama 4 Scout 17B 16E Instruct         | text, image | 10,000,000 | 멀티모달                                   |
| `together/meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | Llama 4 Maverick 17B 128E Instruct FP8 | text, image | 20,000,000 | 멀티모달                                   |
| `together/deepseek-ai/DeepSeek-V3.1`                         | DeepSeek V3.1                          | text        | 131,072    | 범용 텍스트 모델                           |
| `together/deepseek-ai/DeepSeek-R1`                           | DeepSeek R1                            | text        | 131,072    | Reasoning 모델                             |
| `together/moonshotai/Kimi-K2-Instruct-0905`                  | Kimi K2-Instruct 0905                  | text        | 262,144    | 보조 Kimi 텍스트 모델                      |

## 비디오 생성

번들 `together` 플러그인은 공유 `video_generate` 도구를 통해 비디오 생성 기능도
등록합니다.

| 항목                 | 값                                    |
| -------------------- | ------------------------------------- |
| 기본 비디오 모델     | `together/Wan-AI/Wan2.2-T2V-A14B`     |
| 모드                 | text-to-video, 단일 이미지 reference  |
| 지원 파라미터        | `aspectRatio`, `resolution`           |

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

<Tip>
공유 도구 파라미터, 프로바이더 선택, failover 동작에 대해서는
[비디오 생성](/tools/video-generation)을 참조하십시오.
</Tip>

<AccordionGroup>
  <Accordion title="환경 변수 참고">
    Gateway가 데몬(launchd/systemd)으로 실행되는 경우, 해당 프로세스에서
    `TOGETHER_API_KEY`에 접근할 수 있도록 하십시오 (예: `~/.openclaw/.env`
    또는 `env.shellEnv` 설정).

    <Warning>
    대화형 셸에서만 설정된 키는 데몬으로 관리되는 gateway 프로세스에는 보이지
    않습니다. 지속적으로 사용하려면 `~/.openclaw/.env` 또는 `env.shellEnv`
    설정을 사용하십시오.
    </Warning>

  </Accordion>

  <Accordion title="문제 해결">
    - 키 동작 확인: `openclaw models list --provider together`
    - 모델이 나타나지 않으면 gateway 프로세스가 있는 환경에 API 키가 올바르게
      설정되었는지 확인하십시오.
    - 모델 ref는 `together/<model-id>` 형식을 사용합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 규칙, 모델 ref, failover 동작.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    공유 비디오 생성 도구 파라미터와 프로바이더 선택.
  </Card>
  <Card title="구성 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    프로바이더 설정을 포함한 전체 구성 스키마.
  </Card>
  <Card title="Together AI" href="https://together.ai" icon="arrow-up-right-from-square">
    Together AI 대시보드, API 문서, 가격 정보.
  </Card>
</CardGroup>
