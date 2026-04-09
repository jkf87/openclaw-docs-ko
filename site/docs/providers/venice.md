---
title: "Venice AI"
description: "OpenClaw에서 Venice AI 프라이버시 중심 모델 사용"
---

# Venice AI (Venice 하이라이트)

**Venice**는 선택적 익명 접근으로 독점 모델을 사용할 수 있는 프라이버시 우선 추론을 위한 Venice 하이라이트 설정입니다.

Venice AI는 검열되지 않은 모델 지원 및 익명화 프록시를 통한 주요 독점 모델 접근이 포함된 프라이버시 중심 AI 추론을 제공합니다. 모든 추론은 기본적으로 비공개입니다. 데이터 학습 없음, 로깅 없음.

## OpenClaw에서 Venice를 사용하는 이유

- 오픈 소스 모델을 위한 **비공개 추론** (로깅 없음).
- 필요 시 **검열되지 않은 모델**.
- 품질이 중요할 때 독점 모델(Opus/GPT/Gemini)에 대한 **익명 접근**.
- OpenAI 호환 `/v1` 엔드포인트.

## 프라이버시 모드

Venice는 두 가지 프라이버시 수준을 제공합니다. 모델 선택의 핵심입니다:

| 모드         | 설명                                                                                                                    | 모델                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **비공개**   | 완전히 비공개. 프롬프트/응답이 **저장되거나 로깅되지 않음**. 임시적.                                                    | Llama, Qwen, DeepSeek, Kimi, MiniMax, Venice Uncensored 등    |
| **익명화**   | 메타데이터가 제거된 채 Venice를 통해 프록시됨. 기반 프로바이더(OpenAI, Anthropic, Google, xAI)는 익명화된 요청을 봄.   | Claude, GPT, Gemini, Grok                                     |

## 기능

- **프라이버시 중심**: "비공개" (완전 비공개)와 "익명화" (프록시) 모드 중 선택
- **검열되지 않은 모델**: 콘텐츠 제한 없는 모델 접근
- **주요 모델 접근**: Venice의 익명화 프록시를 통해 Claude, GPT, Gemini, Grok 사용
- **OpenAI 호환 API**: 쉬운 통합을 위한 표준 `/v1` 엔드포인트
- **스트리밍**: 모든 모델에서 지원
- **함수 호출**: 일부 모델에서 지원 (API에서 모델 기능 확인)
- **비전**: 비전 기능이 있는 모델에서 지원
- **하드 속도 제한 없음**: 극단적 사용에는 공정 사용 제한이 적용될 수 있음

## 설정

### 1. API 키 발급

1. [venice.ai](https://venice.ai)에서 가입
2. **Settings → API Keys → Create new key**로 이동
3. API 키 복사 (형식: `vapi_xxxxxxxxxxxx`)

### 2. OpenClaw 구성

**옵션 A: 환경 변수**

```bash
export VENICE_API_KEY="vapi_xxxxxxxxxxxx"
```

**옵션 B: 대화형 설정 (권장)**

```bash
openclaw onboard --auth-choice venice-api-key
```

이렇게 하면:

1. API 키 입력 요청 (또는 기존 `VENICE_API_KEY` 사용)
2. 모든 사용 가능한 Venice 모델 표시
3. 기본 모델 선택 가능
4. 프로바이더 자동 구성

**옵션 C: 비대화형**

```bash
openclaw onboard --non-interactive \
  --auth-choice venice-api-key \
  --venice-api-key "vapi_xxxxxxxxxxxx"
```

### 3. 설정 확인

```bash
openclaw agent --model venice/kimi-k2-5 --message "Hello, are you working?"
```

## 모델 선택

설정 후 OpenClaw는 사용 가능한 모든 Venice 모델을 표시합니다. 필요에 따라 선택하십시오:

- **기본 모델**: 강력한 비공개 추론과 비전을 위한 `venice/kimi-k2-5`.
- **고성능 옵션**: 가장 강력한 익명화 Venice 경로를 위한 `venice/claude-opus-4-6`.
- **프라이버시**: 완전히 비공개 추론을 위해 "비공개" 모델을 선택하십시오.
- **기능**: Venice의 프록시를 통해 Claude, GPT, Gemini에 접근하려면 "익명화" 모델을 선택하십시오.

언제든지 기본 모델을 변경하십시오:

```bash
openclaw models set venice/kimi-k2-5
openclaw models set venice/claude-opus-4-6
```

모든 사용 가능한 모델 나열:

```bash
openclaw models list | grep venice
```

## `openclaw configure`를 통한 구성

1. `openclaw configure` 실행
2. **Model/auth** 선택
3. **Venice AI** 선택

## 어떤 모델을 사용해야 할까요?

| 사용 사례                  | 권장 모델                          | 이유                                         |
| -------------------------- | ---------------------------------- | -------------------------------------------- |
| **일반 채팅 (기본값)**      | `kimi-k2-5`                        | 강력한 비공개 추론과 비전                    |
| **최고 품질**               | `claude-opus-4-6`                  | 가장 강력한 익명화 Venice 옵션               |
| **프라이버시 + 코딩**       | `qwen3-coder-480b-a35b-instruct`   | 대용량 컨텍스트의 비공개 코딩 모델           |
| **비공개 비전**             | `kimi-k2-5`                        | 비공개 모드를 유지하면서 비전 지원           |
| **빠르고 저렴하게**         | `qwen3-4b`                         | 가벼운 추론 모델                             |
| **복잡한 비공개 작업**      | `deepseek-v3.2`                    | 강력한 추론, 단 Venice 도구 지원 없음        |
| **검열 없음**               | `venice-uncensored`                | 콘텐츠 제한 없음                             |

## 사용 가능한 모델 (총 41개)

### 비공개 모델 (26개) - 완전 비공개, 로깅 없음

| 모델 ID                                | 이름                                | 컨텍스트 | 기능                       |
| -------------------------------------- | ----------------------------------- | -------- | -------------------------- |
| `kimi-k2-5`                            | Kimi K2.5                           | 256k     | 기본, 추론, 비전            |
| `kimi-k2-thinking`                     | Kimi K2 Thinking                    | 256k     | 추론                       |
| `llama-3.3-70b`                        | Llama 3.3 70B                       | 128k     | 범용                       |
| `llama-3.2-3b`                         | Llama 3.2 3B                        | 128k     | 범용                       |
| `hermes-3-llama-3.1-405b`              | Hermes 3 Llama 3.1 405B             | 128k     | 범용, 도구 비활성화         |
| `qwen3-235b-a22b-thinking-2507`        | Qwen3 235B Thinking                 | 128k     | 추론                       |
| `qwen3-235b-a22b-instruct-2507`        | Qwen3 235B Instruct                 | 128k     | 범용                       |
| `qwen3-coder-480b-a35b-instruct`       | Qwen3 Coder 480B                    | 256k     | 코딩                       |
| `qwen3-coder-480b-a35b-instruct-turbo` | Qwen3 Coder 480B Turbo              | 256k     | 코딩                       |
| `qwen3-5-35b-a3b`                      | Qwen3.5 35B A3B                     | 256k     | 추론, 비전                  |
| `qwen3-next-80b`                       | Qwen3 Next 80B                      | 256k     | 범용                       |
| `qwen3-vl-235b-a22b`                   | Qwen3 VL 235B (비전)                | 256k     | 비전                       |
| `qwen3-4b`                             | Venice Small (Qwen3 4B)             | 32k      | 빠름, 추론                  |
| `deepseek-v3.2`                        | DeepSeek V3.2                       | 160k     | 추론, 도구 비활성화         |
| `venice-uncensored`                    | Venice Uncensored (Dolphin-Mistral) | 32k      | 검열 없음, 도구 비활성화    |
| `mistral-31-24b`                       | Venice Medium (Mistral)             | 128k     | 비전                       |
| `google-gemma-3-27b-it`                | Google Gemma 3 27B Instruct         | 198k     | 비전                       |
| `openai-gpt-oss-120b`                  | OpenAI GPT OSS 120B                 | 128k     | 범용                       |
| `nvidia-nemotron-3-nano-30b-a3b`       | NVIDIA Nemotron 3 Nano 30B          | 128k     | 범용                       |
| `olafangensan-glm-4.7-flash-heretic`   | GLM 4.7 Flash Heretic               | 128k     | 추론                       |
| `zai-org-glm-4.6`                      | GLM 4.6                             | 198k     | 범용                       |
| `zai-org-glm-4.7`                      | GLM 4.7                             | 198k     | 추론                       |
| `zai-org-glm-4.7-flash`                | GLM 4.7 Flash                       | 128k     | 추론                       |
| `zai-org-glm-5`                        | GLM 5                               | 198k     | 추론                       |
| `minimax-m21`                          | MiniMax M2.1                        | 198k     | 추론                       |
| `minimax-m25`                          | MiniMax M2.5                        | 198k     | 추론                       |

### 익명화 모델 (15개) - Venice 프록시 경유

| 모델 ID                         | 이름                             | 컨텍스트 | 기능                      |
| ------------------------------- | -------------------------------- | -------- | ------------------------- |
| `claude-opus-4-6`               | Claude Opus 4.6 (Venice 경유)    | 1M       | 추론, 비전                 |
| `claude-opus-4-5`               | Claude Opus 4.5 (Venice 경유)    | 198k     | 추론, 비전                 |
| `claude-sonnet-4-6`             | Claude Sonnet 4.6 (Venice 경유)  | 1M       | 추론, 비전                 |
| `claude-sonnet-4-5`             | Claude Sonnet 4.5 (Venice 경유)  | 198k     | 추론, 비전                 |
| `openai-gpt-54`                 | GPT-5.4 (Venice 경유)            | 1M       | 추론, 비전                 |
| `openai-gpt-53-codex`           | GPT-5.3 Codex (Venice 경유)      | 400k     | 추론, 비전, 코딩           |
| `openai-gpt-52`                 | GPT-5.2 (Venice 경유)            | 256k     | 추론                      |
| `openai-gpt-52-codex`           | GPT-5.2 Codex (Venice 경유)      | 256k     | 추론, 비전, 코딩           |
| `openai-gpt-4o-2024-11-20`      | GPT-4o (Venice 경유)             | 128k     | 비전                      |
| `openai-gpt-4o-mini-2024-07-18` | GPT-4o Mini (Venice 경유)        | 128k     | 비전                      |
| `gemini-3-1-pro-preview`        | Gemini 3.1 Pro (Venice 경유)     | 1M       | 추론, 비전                 |
| `gemini-3-pro-preview`          | Gemini 3 Pro (Venice 경유)       | 198k     | 추론, 비전                 |
| `gemini-3-flash-preview`        | Gemini 3 Flash (Venice 경유)     | 256k     | 추론, 비전                 |
| `grok-41-fast`                  | Grok 4.1 Fast (Venice 경유)      | 1M       | 추론, 비전                 |
| `grok-code-fast-1`              | Grok Code Fast 1 (Venice 경유)   | 256k     | 추론, 코딩                 |

## 모델 발견

`VENICE_API_KEY`가 설정되면 OpenClaw는 Venice API에서 모델을 자동으로 발견합니다. API에 연결할 수 없으면 정적 카탈로그로 폴백합니다.

`/models` 엔드포인트는 공개되어 있습니다 (목록 조회에 인증 불필요). 단, 추론에는 유효한 API 키가 필요합니다.

## 스트리밍 및 도구 지원

| 기능              | 지원                                                    |
| ----------------- | ------------------------------------------------------- |
| **스트리밍**       | 모든 모델에서 지원                                      |
| **함수 호출**      | 대부분의 모델 지원 (API에서 `supportsFunctionCalling` 확인) |
| **비전/이미지**    | "Vision" 기능이 표시된 모델에서 지원                    |
| **JSON 모드**      | `response_format`을 통해 지원                           |

## 요금

Venice는 크레딧 기반 시스템을 사용합니다. 현재 요율은 [venice.ai/pricing](https://venice.ai/pricing)을 확인하십시오:

- **비공개 모델**: 일반적으로 더 낮은 비용
- **익명화 모델**: 직접 API 요금 + 소규모 Venice 수수료와 유사

## 비교: Venice vs 직접 API

| 측면         | Venice (익명화)                | 직접 API            |
| ------------ | ------------------------------ | ------------------- |
| **프라이버시** | 메타데이터 제거, 익명화       | 계정 연결           |
| **지연 시간** | +10-50ms (프록시)              | 직접                |
| **기능**     | 대부분의 기능 지원             | 전체 기능           |
| **청구**     | Venice 크레딧                  | 프로바이더 청구     |

## 사용 예시

```bash
# 기본 비공개 모델 사용
openclaw agent --model venice/kimi-k2-5 --message "Quick health check"

# Venice를 통해 Claude Opus 사용 (익명화)
openclaw agent --model venice/claude-opus-4-6 --message "Summarize this task"

# 검열되지 않은 모델 사용
openclaw agent --model venice/venice-uncensored --message "Draft options"

# 이미지와 함께 비전 모델 사용
openclaw agent --model venice/qwen3-vl-235b-a22b --message "Review attached image"

# 코딩 모델 사용
openclaw agent --model venice/qwen3-coder-480b-a35b-instruct --message "Refactor this function"
```

## 문제 해결

### API 키 인식되지 않음

```bash
echo $VENICE_API_KEY
openclaw models list | grep venice
```

키가 `vapi_`로 시작하는지 확인하십시오.

### 모델을 사용할 수 없음

Venice 모델 카탈로그는 동적으로 업데이트됩니다. 현재 사용 가능한 모델을 보려면 `openclaw models list`를 실행하십시오. 일부 모델은 일시적으로 오프라인 상태일 수 있습니다.

### 연결 문제

Venice API는 `https://api.venice.ai/api/v1`에 있습니다. 네트워크에서 HTTPS 연결을 허용하는지 확인하십시오.

## 구성 파일 예시

```json5
{
  env: { VENICE_API_KEY: "vapi_..." },
  agents: { defaults: { model: { primary: "venice/kimi-k2-5" } } },
  models: {
    mode: "merge",
    providers: {
      venice: {
        baseUrl: "https://api.venice.ai/api/v1",
        apiKey: "${VENICE_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "kimi-k2-5",
            name: "Kimi K2.5",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 256000,
            maxTokens: 65536,
          },
        ],
      },
    },
  },
}
```

## 링크

- [Venice AI](https://venice.ai)
- [API 문서](https://docs.venice.ai)
- [요금](https://venice.ai/pricing)
- [상태](https://status.venice.ai)
