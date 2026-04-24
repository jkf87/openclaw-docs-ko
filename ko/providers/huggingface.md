---
summary: "Hugging Face Inference 설정 (인증 + 모델 선택)"
read_when:
  - OpenClaw에서 Hugging Face Inference를 사용하고 싶을 때
  - HF 토큰 환경변수 또는 CLI 인증 선택이 필요할 때
title: "Hugging Face (inference)"
---

[Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers)는 단일 라우터 API를 통해 OpenAI 호환 채팅 완성(chat completions)을 제공합니다. 하나의 토큰으로 다수의 모델(DeepSeek, Llama 등)에 접근할 수 있습니다. OpenClaw는 **OpenAI 호환 엔드포인트**(채팅 완성만 지원)를 사용합니다. 텍스트-투-이미지, 임베딩, 음성은 [HF inference 클라이언트](https://huggingface.co/docs/api-inference/quicktour)를 직접 사용하세요.

- 프로바이더: `huggingface`
- 인증: `HUGGINGFACE_HUB_TOKEN` 또는 `HF_TOKEN` (**Make calls to Inference Providers** 권한이 있는 fine-grained 토큰)
- API: OpenAI 호환 (`https://router.huggingface.co/v1`)
- 결제: 단일 HF 토큰. [가격 정책](https://huggingface.co/docs/inference-providers/pricing)은 프로바이더 요율을 따르며 무료 등급도 포함합니다.

## 시작하기

<Steps>
  <Step title="fine-grained 토큰 생성">
    [Hugging Face Settings Tokens](https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained)로 이동하여 새 fine-grained 토큰을 생성합니다.

    <Warning>
    토큰에는 **Make calls to Inference Providers** 권한이 활성화되어 있어야 하며, 그렇지 않으면 API 요청이 거부됩니다.
    </Warning>

  </Step>
  <Step title="온보딩 실행">
    프로바이더 드롭다운에서 **Hugging Face**를 선택한 다음, 프롬프트가 표시되면 API 키를 입력합니다.

    ```bash
    openclaw onboard --auth-choice huggingface-api-key
    ```

  </Step>
  <Step title="기본 모델 선택">
    **Default Hugging Face model** 드롭다운에서 원하는 모델을 선택하세요. 유효한 토큰이 있으면 목록은 Inference API에서 로드되며, 그렇지 않으면 내장 목록이 표시됩니다. 선택한 값은 기본 모델로 저장됩니다.

    이후에도 설정 파일에서 기본 모델을 설정하거나 변경할 수 있습니다.

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "huggingface/deepseek-ai/DeepSeek-R1" },
        },
      },
    }
    ```

  </Step>
  <Step title="모델이 사용 가능한지 확인">
    ```bash
    openclaw models list --provider huggingface
    ```
  </Step>
</Steps>

### 비대화형 설정

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice huggingface-api-key \
  --huggingface-api-key "$HF_TOKEN"
```

이 경우 `huggingface/deepseek-ai/DeepSeek-R1`이 기본 모델로 설정됩니다.

## 모델 ID

모델 ref는 `huggingface/<org>/<model>` 형식(Hub 스타일 ID)을 사용합니다. 아래 목록은 **GET** `https://router.huggingface.co/v1/models`에서 가져온 것으로, 실제 카탈로그에는 더 많은 모델이 포함될 수 있습니다.

| 모델                    | Ref (`huggingface/` 접두)            |
| ---------------------- | ----------------------------------- |
| DeepSeek R1            | `deepseek-ai/DeepSeek-R1`           |
| DeepSeek V3.2          | `deepseek-ai/DeepSeek-V3.2`         |
| Qwen3 8B               | `Qwen/Qwen3-8B`                     |
| Qwen2.5 7B Instruct    | `Qwen/Qwen2.5-7B-Instruct`          |
| Qwen3 32B              | `Qwen/Qwen3-32B`                    |
| Llama 3.3 70B Instruct | `meta-llama/Llama-3.3-70B-Instruct` |
| Llama 3.1 8B Instruct  | `meta-llama/Llama-3.1-8B-Instruct`  |
| GPT-OSS 120B           | `openai/gpt-oss-120b`               |
| GLM 4.7                | `zai-org/GLM-4.7`                   |
| Kimi K2.5              | `moonshotai/Kimi-K2.5`              |

<Tip>
어떤 모델 ID에든 `:fastest` 또는 `:cheapest`를 붙일 수 있습니다. 기본 우선순위는 [Inference Provider 설정](https://hf.co/settings/inference-providers)에서 지정하세요. 전체 목록은 [Inference Providers](https://huggingface.co/docs/inference-providers)와 **GET** `https://router.huggingface.co/v1/models`를 참고하세요.
</Tip>

## 고급 설정

<AccordionGroup>
  <Accordion title="모델 디스커버리 및 온보딩 드롭다운">
    OpenClaw는 **Inference 엔드포인트를 직접 호출**하여 모델을 디스커버리합니다.

    ```bash
    GET https://router.huggingface.co/v1/models
    ```

    (선택 사항: 전체 목록을 받으려면 `Authorization: Bearer $HUGGINGFACE_HUB_TOKEN` 또는 `$HF_TOKEN`을 전송하세요. 일부 엔드포인트는 인증이 없으면 일부 목록만 반환합니다.) 응답은 OpenAI 스타일로 `{ "object": "list", "data": [ { "id": "Qwen/Qwen3-8B", "owned_by": "Qwen", ... }, ... ] }` 형태입니다.

    Hugging Face API 키가 설정되면(온보딩, `HUGGINGFACE_HUB_TOKEN`, 또는 `HF_TOKEN`을 통해) OpenClaw는 이 GET 호출로 사용 가능한 채팅 완성 모델을 디스커버리합니다. **대화형 설정** 중에는 토큰을 입력한 뒤 해당 목록으로 채워진 **Default Hugging Face model** 드롭다운을 보게 됩니다(요청이 실패하면 내장 카탈로그가 표시됩니다). 런타임(예: Gateway 시작)에서도 키가 있으면 OpenClaw는 **GET** `https://router.huggingface.co/v1/models`를 다시 호출해 카탈로그를 새로 고칩니다. 이 목록은 내장 카탈로그(컨텍스트 윈도우, 비용 등 메타데이터)와 병합됩니다. 요청이 실패하거나 키가 없으면 내장 카탈로그만 사용됩니다.

  </Accordion>

  <Accordion title="모델 이름, 별칭(alias), 정책 접미사">
    - **API에서 가져온 이름:** 모델 표시 이름은 API가 `name`, `title`, `display_name`을 반환할 때 **GET /v1/models에서 하이드레이션(hydration)** 됩니다. 그렇지 않으면 모델 ID에서 파생됩니다(예: `deepseek-ai/DeepSeek-R1` → "DeepSeek R1").
    - **표시 이름 오버라이드:** 설정에서 모델마다 커스텀 라벨을 지정해 CLI와 UI에 원하는 대로 표시되도록 할 수 있습니다.

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "huggingface/deepseek-ai/DeepSeek-R1": { alias: "DeepSeek R1 (fast)" },
            "huggingface/deepseek-ai/DeepSeek-R1:cheapest": { alias: "DeepSeek R1 (cheap)" },
          },
        },
      },
    }
    ```

    - **정책 접미사:** OpenClaw에 번들된 Hugging Face 문서와 헬퍼는 현재 다음 두 접미사를 내장 정책 변형으로 취급합니다.
      - **`:fastest`** — 최고 처리량(throughput).
      - **`:cheapest`** — 출력 토큰당 최저 비용.

      이들을 `models.providers.huggingface.models`에 별도 항목으로 추가하거나, `model.primary`를 접미사와 함께 설정할 수 있습니다. 또한 [Inference Provider 설정](https://hf.co/settings/inference-providers)에서 기본 프로바이더 우선순위를 지정할 수 있습니다(접미사가 없으면 그 우선순위를 사용합니다).

    - **설정 병합:** `models.providers.huggingface.models`(예: `models.json`)의 기존 항목은 설정이 병합될 때 유지됩니다. 따라서 그곳에 설정한 커스텀 `name`, `alias`, 모델 옵션은 보존됩니다.

  </Accordion>

  <Accordion title="환경 및 데몬 설정">
    Gateway가 데몬(launchd/systemd)으로 실행되는 경우, `HUGGINGFACE_HUB_TOKEN` 또는 `HF_TOKEN`이 해당 프로세스에서 사용 가능한지(예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해) 확인하세요.

    <Note>
    OpenClaw는 `HUGGINGFACE_HUB_TOKEN`과 `HF_TOKEN`을 모두 환경변수 별칭(alias)으로 허용합니다. 둘 중 어느 쪽이든 동작하며, 둘 다 설정되어 있으면 `HUGGINGFACE_HUB_TOKEN`이 우선 적용됩니다.
    </Note>

  </Accordion>

  <Accordion title="설정: Qwen 폴백을 포함한 DeepSeek R1">
    ```json5
    {
      agents: {
        defaults: {
          model: {
            primary: "huggingface/deepseek-ai/DeepSeek-R1",
            fallbacks: ["huggingface/Qwen/Qwen3-8B"],
          },
          models: {
            "huggingface/deepseek-ai/DeepSeek-R1": { alias: "DeepSeek R1" },
            "huggingface/Qwen/Qwen3-8B": { alias: "Qwen3 8B" },
          },
        },
      },
    }
    ```
  </Accordion>

  <Accordion title="설정: cheapest와 fastest 변형을 포함한 Qwen">
    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "huggingface/Qwen/Qwen3-8B" },
          models: {
            "huggingface/Qwen/Qwen3-8B": { alias: "Qwen3 8B" },
            "huggingface/Qwen/Qwen3-8B:cheapest": { alias: "Qwen3 8B (cheapest)" },
            "huggingface/Qwen/Qwen3-8B:fastest": { alias: "Qwen3 8B (fastest)" },
          },
        },
      },
    }
    ```
  </Accordion>

  <Accordion title="설정: 별칭이 포함된 DeepSeek + Llama + GPT-OSS">
    ```json5
    {
      agents: {
        defaults: {
          model: {
            primary: "huggingface/deepseek-ai/DeepSeek-V3.2",
            fallbacks: [
              "huggingface/meta-llama/Llama-3.3-70B-Instruct",
              "huggingface/openai/gpt-oss-120b",
            ],
          },
          models: {
            "huggingface/deepseek-ai/DeepSeek-V3.2": { alias: "DeepSeek V3.2" },
            "huggingface/meta-llama/Llama-3.3-70B-Instruct": { alias: "Llama 3.3 70B" },
            "huggingface/openai/gpt-oss-120b": { alias: "GPT-OSS 120B" },
          },
        },
      },
    }
    ```
  </Accordion>

  <Accordion title="설정: 정책 접미사를 포함한 다수의 Qwen 및 DeepSeek">
    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "huggingface/Qwen/Qwen2.5-7B-Instruct:cheapest" },
          models: {
            "huggingface/Qwen/Qwen2.5-7B-Instruct": { alias: "Qwen2.5 7B" },
            "huggingface/Qwen/Qwen2.5-7B-Instruct:cheapest": { alias: "Qwen2.5 7B (cheap)" },
            "huggingface/deepseek-ai/DeepSeek-R1:fastest": { alias: "DeepSeek R1 (fast)" },
            "huggingface/meta-llama/Llama-3.1-8B-Instruct": { alias: "Llama 3.1 8B" },
          },
        },
      },
    }
    ```
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    모든 프로바이더, 모델 ref, 페일오버 동작 개요.
  </Card>
  <Card title="모델 선택" href="/concepts/models" icon="brain">
    모델 선택과 설정 방법.
  </Card>
  <Card title="Inference Providers 문서" href="https://huggingface.co/docs/inference-providers" icon="book">
    공식 Hugging Face Inference Providers 문서.
  </Card>
  <Card title="설정" href="/gateway/configuration" icon="gear">
    전체 설정 레퍼런스.
  </Card>
</CardGroup>
