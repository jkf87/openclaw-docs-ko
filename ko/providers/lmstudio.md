---
summary: "LM Studio 로컬 모델 제공자 설정, 온보딩, 문제 해결"
read_when:
  - LM Studio로 로컬 모델을 실행하려는 경우
  - OpenClaw 온보딩에서 LM Studio 토큰/모델을 구성하려는 경우
title: "LM Studio"
---

# LM Studio

LM Studio는 자체 하드웨어에서 오픈 웨이트 모델을 실행할 수 있는 사용자 친화적이면서도 강력한 앱입니다. llama.cpp(GGUF) 또는 MLX 모델(Apple Silicon)을 실행할 수 있으며, GUI 패키지와 헤드리스 데몬(`llmster`)으로 제공됩니다. 제품과 설치 문서는 [lmstudio.ai](https://lmstudio.ai/)를 참조하세요.

## 빠른 시작

1. LM Studio(데스크톱) 또는 `llmster`(헤드리스)를 설치한 후 로컬 서버를 시작합니다:

```bash
curl -fsSL https://lmstudio.ai/install.sh | bash
```

2. 서버 시작

데스크톱 앱을 시작하거나 다음 명령으로 데몬을 실행하세요:

```bash
lms daemon up
```

```bash
lms server start --port 1234
```

앱을 사용한다면 부드러운 경험을 위해 JIT를 활성화했는지 확인하세요. 자세한 내용은 [LM Studio JIT 및 TTL 가이드](https://lmstudio.ai/docs/developer/core/ttl-and-auto-evict)를 참고하세요.

3. OpenClaw는 LM Studio 토큰 값을 요구합니다. `LM_API_TOKEN`을 설정합니다:

```bash
export LM_API_TOKEN="your-lm-studio-api-token"
```

LM Studio 인증이 비활성화된 경우 비어 있지 않은 임의의 토큰 값을 사용하세요:

```bash
export LM_API_TOKEN="placeholder-key"
```

LM Studio 인증 설정은 [LM Studio Authentication](https://lmstudio.ai/docs/developer/core/authentication)을 참조하세요.

4. 온보딩을 실행하고 `LM Studio`를 선택합니다:

```bash
openclaw onboard
```

5. 온보딩에서 `Default model` 프롬프트를 사용해 LM Studio 모델을 선택합니다.

나중에 설정하거나 변경할 수도 있습니다:

```bash
openclaw models set lmstudio/qwen/qwen3.5-9b
```

LM Studio 모델 키는 `author/model-name` 형식을 따릅니다 (예: `qwen/qwen3.5-9b`). OpenClaw 모델 참조는 제공자 이름을 앞에 붙입니다: `lmstudio/qwen/qwen3.5-9b`. 모델의 정확한 키는 `curl http://localhost:1234/api/v1/models`를 실행하고 `key` 필드를 확인해 찾을 수 있습니다.

## 비대화형 온보딩

CI, 프로비저닝, 원격 부트스트랩처럼 설정을 스크립팅하려면 비대화형 온보딩을 사용하세요:

```bash
openclaw onboard \
  --non-interactive \
  --accept-risk \
  --auth-choice lmstudio
```

또는 base URL이나 API 키가 포함된 모델을 지정:

```bash
openclaw onboard \
  --non-interactive \
  --accept-risk \
  --auth-choice lmstudio \
  --custom-base-url http://localhost:1234/v1 \
  --lmstudio-api-key "$LM_API_TOKEN" \
  --custom-model-id qwen/qwen3.5-9b
```

`--custom-model-id`는 LM Studio가 반환하는 모델 키를 받습니다 (예: `qwen/qwen3.5-9b`). `lmstudio/` 제공자 접두사 없이 사용하세요.

비대화형 온보딩에는 `--lmstudio-api-key`(또는 환경의 `LM_API_TOKEN`)가 필요합니다. 인증이 없는 LM Studio 서버의 경우 비어 있지 않은 임의의 토큰 값이면 됩니다.

`--custom-api-key`도 호환성을 위해 계속 지원되지만, LM Studio에서는 `--lmstudio-api-key`가 권장됩니다.

이는 `models.providers.lmstudio`를 작성하고, 기본 모델을 `lmstudio/<custom-model-id>`로 설정하며, `lmstudio:default` 인증 프로필을 작성합니다.

대화형 설정은 선호하는 로드 컨텍스트 길이(선택 사항)를 물어보고, 설정에 저장하는 발견된 LM Studio 모델 전체에 이를 적용합니다.

## 구성

### 명시적 구성

```json5
{
  models: {
    providers: {
      lmstudio: {
        baseUrl: "http://localhost:1234/v1",
        apiKey: "${LM_API_TOKEN}",
        api: "openai-completions",
        models: [
          {
            id: "qwen/qwen3-coder-next",
            name: "Qwen 3 Coder Next",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
}
```

## 문제 해결

### LM Studio가 감지되지 않음

LM Studio가 실행 중이며 `LM_API_TOKEN`이 설정되어 있는지 확인하세요 (인증 없는 서버의 경우 비어 있지 않은 임의의 토큰 값이면 됩니다):

```bash
# 데스크톱 앱으로 시작하거나 헤드리스로:
lms server start --port 1234
```

API 접근 가능 여부 확인:

```bash
curl http://localhost:1234/api/v1/models
```

### 인증 오류 (HTTP 401)

설정이 HTTP 401을 보고한다면 API 키를 확인하세요:

- `LM_API_TOKEN`이 LM Studio에 설정된 키와 일치하는지 확인합니다.
- LM Studio 인증 설정 상세: [LM Studio Authentication](https://lmstudio.ai/docs/developer/core/authentication).
- 서버가 인증을 요구하지 않는다면 `LM_API_TOKEN`에 비어 있지 않은 임의의 토큰 값을 사용하세요.

### Just-in-time 모델 로딩

LM Studio는 첫 요청 시 모델을 로드하는 just-in-time(JIT) 모델 로딩을 지원합니다. 'Model not loaded' 오류를 피하려면 이 기능이 활성화되어 있는지 확인하세요.
