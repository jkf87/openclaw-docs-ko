---
title: "Hugging Face (추론)"
description: "Hugging Face 추론 설정 (인증 + 모델 선택)"
---

# Hugging Face (추론)

[Hugging Face 추론 프로바이더](https://huggingface.co/docs/inference-providers)는 단일 라우터 API를 통해 OpenAI 호환 채팅 완성을 제공합니다. 하나의 토큰으로 많은 모델(DeepSeek, Llama 등)에 액세스할 수 있습니다. OpenClaw는 **OpenAI 호환 엔드포인트**(채팅 완성만)를 사용합니다; 텍스트-이미지, 임베딩, 음성의 경우 [HF 추론 클라이언트](https://huggingface.co/docs/api-inference/quicktour)를 직접 사용하십시오.

- 프로바이더: `huggingface`
- 인증: `HUGGINGFACE_HUB_TOKEN` 또는 `HF_TOKEN` (**추론 프로바이더에 호출하기** 권한이 있는 세분화된 토큰)
- API: OpenAI 호환 (`https://router.huggingface.co/v1`)
- 청구: 단일 HF 토큰; [가격](https://huggingface.co/docs/inference-providers/pricing)은 무료 티어가 있는 프로바이더 요금을 따릅니다.

## 빠른 시작

1. **추론 프로바이더에 호출하기** 권한이 있는 세분화된 토큰을 [Hugging Face → 설정 → 토큰](https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained)에서 생성하십시오.
2. 온보딩을 실행하고 프로바이더 드롭다운에서 **Hugging Face**를 선택한 후 API 키를 입력하십시오:

```bash
openclaw onboard --auth-choice huggingface-api-key
```

3. **기본 Hugging Face 모델** 드롭다운에서 원하는 모델을 선택하십시오 (목록은 유효한 토큰이 있으면 추론 API에서 로드됩니다; 그렇지 않으면 내장 목록이 표시됩니다). 선택 사항이 기본 모델로 저장됩니다.
4. 나중에 구성에서 기본 모델을 설정하거나 변경할 수도 있습니다:

```json5
{
  agents: {
    defaults: {
      model: { primary: "huggingface/deepseek-ai/DeepSeek-R1" },
    },
  },
}
```

## 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice huggingface-api-key \
  --huggingface-api-key "$HF_TOKEN"
```

이렇게 하면 `huggingface/deepseek-ai/DeepSeek-R1`이 기본 모델로 설정됩니다.

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우, `HUGGINGFACE_HUB_TOKEN` 또는 `HF_TOKEN`이 해당 프로세스에서 사용 가능한지 확인하십시오 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).

## 모델 검색 및 온보딩 드롭다운

OpenClaw는 **추론 엔드포인트를 직접 호출**하여 모델을 검색합니다:

```bash
GET https://router.huggingface.co/v1/models
```

(선택 사항: `Authorization: Bearer $HUGGINGFACE_HUB_TOKEN` 또는 `$HF_TOKEN` 전송으로 전체 목록 조회; 일부 엔드포인트는 인증 없이 부분 목록만 반환합니다.) 응답은 OpenAI 스타일 `{ "object": "list", "data": [ { "id": "Qwen/Qwen3-8B", "owned_by": "Qwen", ... }, ... ] }`입니다.

Hugging Face API 키(`HUGGINGFACE_HUB_TOKEN`, `HF_TOKEN` 또는 온보딩을 통해)를 구성하면 OpenClaw는 이 GET을 사용하여 사용 가능한 채팅 완성 모델을 검색합니다. **대화형 설정** 중에 토큰을 입력한 후 해당 목록(또는 요청이 실패하면 내장 카탈로그)에서 채워진 **기본 Hugging Face 모델** 드롭다운이 표시됩니다. 런타임(예: 게이트웨이 시작 시) 키가 있으면 OpenClaw는 다시 **GET** `https://router.huggingface.co/v1/models`를 호출하여 카탈로그를 새로 고침합니다. 목록은 내장 카탈로그(컨텍스트 창 및 비용과 같은 메타데이터용)와 병합됩니다. 요청이 실패하거나 키가 설정되지 않은 경우 내장 카탈로그만 사용됩니다.

## 모델 이름 및 편집 가능한 옵션

- **API에서의 이름:** 모델 표시 이름은 API가 `name`, `title`, 또는 `display_name`을 반환할 때 **GET /v1/models에서 수화됩니다**; 그렇지 않으면 모델 id에서 유도됩니다 (예: `deepseek-ai/DeepSeek-R1` → "DeepSeek R1").
- **표시 이름 재정의:** 구성에서 모델별 커스텀 레이블을 설정하여 CLI 및 UI에서 원하는 방식으로 표시할 수 있습니다:

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

- **정책 접미사:** OpenClaw의 번들 Hugging Face 문서 및 헬퍼는 현재 다음 두 접미사를 내장 정책 변형으로 처리합니다:
  - **`:fastest`** — 최고 처리량.
  - **`:cheapest`** — 출력 토큰당 최저 비용.

  `models.providers.huggingface.models`에 별도 항목으로 추가하거나 접미사와 함께 `model.primary`를 설정할 수 있습니다. [추론 프로바이더 설정](https://hf.co/settings/inference-providers)에서 기본 프로바이더 순서를 설정할 수도 있습니다 (접미사 없음 = 해당 순서 사용).

- **구성 병합:** `models.providers.huggingface.models`의 기존 항목(예: `models.json`에서)은 구성이 병합될 때 유지됩니다. 따라서 설정한 커스텀 `name`, `alias`, 또는 모델 옵션이 보존됩니다.

## 모델 ID 및 구성 예시

모델 참조는 `huggingface/&lt;org&gt;/&lt;model&gt;` 형식을 사용합니다 (Hub 스타일 ID). 아래 목록은 **GET** `https://router.huggingface.co/v1/models`에서 가져온 것이며; 카탈로그에 더 많이 포함될 수 있습니다.

**예시 ID (추론 엔드포인트에서):**

| 모델                   | 참조 (`huggingface/` 접두사 필요)   |
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

모델 id에 `:fastest` 또는 `:cheapest`를 추가할 수 있습니다. [추론 프로바이더 설정](https://hf.co/settings/inference-providers)에서 기본 순서를 설정하십시오; 전체 목록은 [추론 프로바이더](https://huggingface.co/docs/inference-providers) 및 **GET** `https://router.huggingface.co/v1/models`를 참조하십시오.

### 완전한 구성 예시

**DeepSeek R1 기본 + Qwen 폴백:**

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

**Qwen을 기본으로, :cheapest 및 :fastest 변형 포함:**

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

**DeepSeek + Llama + GPT-OSS (별칭 포함):**

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

**정책 접미사를 사용한 다중 Qwen 및 DeepSeek 모델:**

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
