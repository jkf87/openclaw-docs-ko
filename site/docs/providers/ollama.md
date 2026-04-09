---
title: "Ollama"
description: "Ollama (클라우드 및 로컬 모델)를 사용하여 OpenClaw 실행"
---

# Ollama

Ollama는 머신에서 오픈소스 모델을 쉽게 실행할 수 있는 로컬 LLM 런타임입니다. OpenClaw는 Ollama의 네이티브 API(`/api/chat`)와 통합되어 스트리밍 및 도구 호출을 지원하며, `OLLAMA_API_KEY` (또는 인증 프로필)로 옵트인하고 명시적 `models.providers.ollama` 항목을 정의하지 않으면 로컬 Ollama 모델을 자동으로 검색할 수 있습니다.

::: warning
**원격 Ollama 사용자**: OpenClaw에서 `/v1` OpenAI 호환 URL(`http://host:11434/v1`)을 사용하지 마십시오. 이렇게 하면 도구 호출이 중단되고 모델이 원시 도구 JSON을 일반 텍스트로 출력할 수 있습니다. 대신 네이티브 Ollama API URL을 사용하십시오: `baseUrl: "http://host:11434"` (자세한 내용은 `/v1` 없음).
:::


## 빠른 시작

### 온보딩 (권장)

Ollama를 설정하는 가장 빠른 방법은 온보딩을 통해서입니다:

```bash
openclaw onboard
```

프로바이더 목록에서 **Ollama**를 선택하십시오. 온보딩은:

1. 인스턴스에 접근할 수 있는 Ollama 기본 URL을 물어봅니다 (기본값 `http://127.0.0.1:11434`).
2. **Cloud + Local** (클라우드 모델 및 로컬 모델) 또는 **Local** (로컬 모델만)을 선택하게 합니다.
3. **Cloud + Local**을 선택하고 ollama.com에 로그인되어 있지 않은 경우 브라우저 로그인 흐름을 엽니다.
4. 사용 가능한 모델을 검색하고 기본값을 제안합니다.
5. 로컬에서 선택한 모델을 사용할 수 없으면 자동으로 가져옵니다.

비대화형 모드도 지원됩니다:

```bash
openclaw onboard --non-interactive \
  --auth-choice ollama \
  --accept-risk
```

선택적으로 커스텀 기본 URL 또는 모델 지정:

```bash
openclaw onboard --non-interactive \
  --auth-choice ollama \
  --custom-base-url "http://ollama-host:11434" \
  --custom-model-id "qwen3.5:27b" \
  --accept-risk
```

### 수동 설정

1. Ollama 설치: [https://ollama.com/download](https://ollama.com/download)

2. 로컬 추론을 원하면 로컬 모델 가져오기:

```bash
ollama pull gemma4
# 또는
ollama pull gpt-oss:20b
# 또는
ollama pull llama3.3
```

3. 클라우드 모델도 원하면 로그인:

```bash
ollama signin
```

4. 온보딩을 실행하고 `Ollama`를 선택하십시오:

```bash
openclaw onboard
```

- `Local`: 로컬 모델만
- `Cloud + Local`: 로컬 모델 및 클라우드 모델
- `kimi-k2.5:cloud`, `minimax-m2.7:cloud`, `glm-5.1:cloud`와 같은 클라우드 모델은 로컬 `ollama pull`이 **필요하지 않습니다**

OpenClaw는 현재 다음을 제안합니다:

- 로컬 기본값: `gemma4`
- 클라우드 기본값: `kimi-k2.5:cloud`, `minimax-m2.7:cloud`, `glm-5.1:cloud`

5. 수동 설정을 선호하는 경우 OpenClaw에 대해 직접 Ollama를 활성화하십시오 (어떤 값이든 작동합니다; Ollama는 실제 키가 필요하지 않습니다):

```bash
# 환경 변수 설정
export OLLAMA_API_KEY="ollama-local"

# 또는 구성 파일에서 구성
openclaw config set models.providers.ollama.apiKey "ollama-local"
```

6. 모델 검사 또는 전환:

```bash
openclaw models list
openclaw models set ollama/gemma4
```

7. 또는 구성에서 기본값 설정:

```json5
{
  agents: {
    defaults: {
      model: { primary: "ollama/gemma4" },
    },
  },
}
```

## 모델 검색 (암묵적 프로바이더)

`OLLAMA_API_KEY` (또는 인증 프로필)를 설정하고 `models.providers.ollama`를 정의하지 **않으면**, OpenClaw는 `http://127.0.0.1:11434`의 로컬 Ollama 인스턴스에서 모델을 검색합니다:

- `/api/tags` 쿼리
- `contextWindow` 읽기 및 기능 감지(비전 포함)를 위해 최선의 `/api/show` 조회 사용
- `/api/show`가 보고한 `vision` 기능이 있는 모델은 이미지 가능(`input: ["text", "image"]`)으로 표시되어 OpenClaw가 해당 모델에 대해 이미지를 프롬프트에 자동 주입합니다
- 모델 이름 휴리스틱(`r1`, `reasoning`, `think`)으로 `reasoning` 표시
- OpenClaw에서 사용하는 기본 Ollama 최대 토큰 한도로 `maxTokens` 설정
- 모든 비용을 `0`으로 설정

이렇게 하면 수동 모델 항목을 피하면서 카탈로그를 로컬 Ollama 인스턴스와 정렬합니다.

사용 가능한 모델 확인:

```bash
ollama list
openclaw models list
```

새 모델 추가 시 Ollama로 가져오면 됩니다:

```bash
ollama pull mistral
```

새 모델이 자동으로 검색되어 사용 가능해집니다.

`models.providers.ollama`를 명시적으로 설정하면 자동 검색이 건너뛰어지고 수동으로 모델을 정의해야 합니다 (아래 참조).

## 구성

### 기본 설정 (암묵적 검색)

Ollama를 활성화하는 가장 간단한 방법은 환경 변수를 통해서입니다:

```bash
export OLLAMA_API_KEY="ollama-local"
```

### 명시적 설정 (수동 모델)

다음의 경우 명시적 구성을 사용하십시오:

- Ollama가 다른 호스트/포트에서 실행됩니다.
- 특정 컨텍스트 창 또는 모델 목록을 강제하려는 경우.
- 완전히 수동 모델 정의를 원하는 경우.

```json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: "http://ollama-host:11434",
        apiKey: "ollama-local",
        api: "ollama",
        models: [
          {
            id: "gpt-oss:20b",
            name: "GPT-OSS 20B",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 8192,
            maxTokens: 8192 * 10
          }
        ]
      }
    }
  }
}
```

`OLLAMA_API_KEY`가 설정된 경우 프로바이더 항목에서 `apiKey`를 생략하면 OpenClaw가 가용성 확인을 위해 채웁니다.

### 커스텀 기본 URL (명시적 구성)

Ollama가 다른 호스트 또는 포트에서 실행 중인 경우 (명시적 구성은 자동 검색을 비활성화하므로 수동으로 모델을 정의하십시오):

```json5
{
  models: {
    providers: {
      ollama: {
        apiKey: "ollama-local",
        baseUrl: "http://ollama-host:11434", // /v1 없음 - 네이티브 Ollama API URL 사용
        api: "ollama", // 네이티브 도구 호출 동작을 보장하기 위해 명시적으로 설정
      },
    },
  },
}
```

::: warning
URL에 `/v1`을 추가하지 마십시오. `/v1` 경로는 OpenAI 호환 모드를 사용하며, 도구 호출이 안정적이지 않습니다. 경로 접미사 없이 기본 Ollama URL을 사용하십시오.
:::


### 모델 선택

구성 후 모든 Ollama 모델을 사용할 수 있습니다:

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "ollama/gpt-oss:20b",
        fallbacks: ["ollama/llama3.3", "ollama/qwen2.5-coder:32b"],
      },
    },
  },
}
```

## 클라우드 모델

클라우드 모델을 사용하면 로컬 모델과 함께 클라우드 호스팅 모델(예: `kimi-k2.5:cloud`, `minimax-m2.7:cloud`, `glm-5.1:cloud`)을 실행할 수 있습니다.

클라우드 모델을 사용하려면 설정 중에 **Cloud + Local** 모드를 선택하십시오. 마법사는 로그인 여부를 확인하고 필요한 경우 브라우저 로그인 흐름을 엽니다. 인증을 확인할 수 없으면 마법사는 로컬 모델 기본값으로 폴백합니다.

[ollama.com/signin](https://ollama.com/signin)에서 직접 로그인할 수도 있습니다.

## Ollama 웹 검색

OpenClaw는 또한 번들 `web_search` 프로바이더로 **Ollama 웹 검색**을 지원합니다.

- 구성된 Ollama 호스트를 사용합니다 (설정된 경우 `models.providers.ollama.baseUrl`, 그렇지 않으면 `http://127.0.0.1:11434`).
- 키가 필요하지 않습니다.
- Ollama가 실행 중이고 `ollama signin`으로 로그인되어 있어야 합니다.

`openclaw onboard` 또는 `openclaw configure --section web` 중에 **Ollama 웹 검색**을 선택하거나 설정하십시오:

```json5
{
  tools: {
    web: {
      search: {
        provider: "ollama",
      },
    },
  },
}
```

전체 설정 및 동작 세부 정보는 [Ollama 웹 검색](/tools/ollama-search)을 참조하십시오.

## 고급

### 추론 모델

OpenClaw는 `deepseek-r1`, `reasoning`, `think`와 같은 이름의 모델을 기본적으로 추론 가능한 것으로 처리합니다:

```bash
ollama pull deepseek-r1:32b
```

### 모델 비용

Ollama는 무료이며 로컬에서 실행되므로 모든 모델 비용이 $0으로 설정됩니다.

### 스트리밍 구성

OpenClaw의 Ollama 통합은 기본적으로 **네이티브 Ollama API**(`/api/chat`)를 사용하며, 스트리밍과 도구 호출을 동시에 완전히 지원합니다. 특별한 구성이 필요하지 않습니다.

#### 레거시 OpenAI 호환 모드

::: warning
**도구 호출은 OpenAI 호환 모드에서 안정적이지 않습니다.** OpenAI 형식만 지원하는 프록시가 필요하고 네이티브 도구 호출 동작에 의존하지 않는 경우에만 이 모드를 사용하십시오.
:::


대신 OpenAI 호환 엔드포인트를 사용해야 하는 경우 (예: OpenAI 형식만 지원하는 프록시 뒤에서), `api: "openai-completions"`를 명시적으로 설정하십시오:

```json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: "http://ollama-host:11434/v1",
        api: "openai-completions",
        injectNumCtxForOpenAICompat: true, // 기본값: true
        apiKey: "ollama-local",
        models: [...]
      }
    }
  }
}
```

이 모드는 스트리밍과 도구 호출을 동시에 지원하지 않을 수 있습니다. 모델 구성에서 `params: { streaming: false }`로 스트리밍을 비활성화해야 할 수 있습니다.

`api: "openai-completions"`가 Ollama와 함께 사용되면, OpenClaw는 기본적으로 `options.num_ctx`를 주입하여 Ollama가 4096 컨텍스트 창으로 조용히 폴백하지 않도록 합니다. 프록시/업스트림이 알 수 없는 `options` 필드를 거부하는 경우 이 동작을 비활성화하십시오:

```json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: "http://ollama-host:11434/v1",
        api: "openai-completions",
        injectNumCtxForOpenAICompat: false,
        apiKey: "ollama-local",
        models: [...]
      }
    }
  }
}
```

### 컨텍스트 창

자동 검색된 모델의 경우, OpenClaw는 Ollama에서 보고된 컨텍스트 창을 사용하며 사용 불가능한 경우 OpenClaw에서 사용하는 기본 Ollama 컨텍스트 창으로 폴백합니다. 명시적 프로바이더 구성에서 `contextWindow` 및 `maxTokens`를 재정의할 수 있습니다.

## 문제 해결

### Ollama가 감지되지 않음

Ollama가 실행 중인지, `OLLAMA_API_KEY` (또는 인증 프로필)를 설정했는지, 명시적 `models.providers.ollama` 항목을 정의하지 **않았는지** 확인하십시오:

```bash
ollama serve
```

API에 접근 가능한지 확인하십시오:

```bash
curl http://localhost:11434/api/tags
```

### 사용 가능한 모델 없음

모델이 목록에 없으면:

- 로컬에서 모델을 가져오거나,
- `models.providers.ollama`에 모델을 명시적으로 정의하십시오.

모델 추가 방법:

```bash
ollama list  # 설치된 항목 확인
ollama pull gemma4
ollama pull gpt-oss:20b
ollama pull llama3.3     # 또는 다른 모델
```

### 연결 거부됨

Ollama가 올바른 포트에서 실행 중인지 확인하십시오:

```bash
# Ollama가 실행 중인지 확인
ps aux | grep ollama

# 또는 Ollama 재시작
ollama serve
```

## 참조

- [모델 프로바이더](/concepts/model-providers) - 모든 프로바이더 개요
- [모델 선택](/concepts/models) - 모델 선택 방법
- [구성](/gateway/configuration) - 전체 구성 참조
