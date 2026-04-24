---
summary: "Ollama(클라우드 및 로컬 모델)로 OpenClaw 실행"
read_when:
  - Ollama를 통해 클라우드 또는 로컬 모델로 OpenClaw를 실행하고 싶을 때
  - Ollama 설정 및 구성 가이드가 필요할 때
  - 이미지 이해를 위한 Ollama 비전 모델을 사용하고 싶을 때
title: "Ollama"
---

OpenClaw는 Ollama의 네이티브 API(`/api/chat`)와 통합되어 호스팅 클라우드 모델과 로컬/셀프 호스팅 Ollama 서버를 지원합니다. Ollama는 세 가지 모드로 사용할 수 있습니다: 접근 가능한 Ollama 호스트를 통한 `Cloud + Local`, `https://ollama.com`을 사용하는 `Cloud only`, 또는 접근 가능한 Ollama 호스트를 사용하는 `Local only`.

<Warning>
**원격 Ollama 사용자**: OpenClaw와 함께 `/v1` OpenAI 호환 URL(`http://host:11434/v1`)을 사용하지 마세요. 이는 도구 호출(tool calling)을 깨뜨리며, 모델이 원시 도구 JSON을 평문으로 출력할 수 있습니다. 대신 네이티브 Ollama API URL을 사용하세요: `baseUrl: "http://host:11434"` (`/v1` 없이).
</Warning>

## 시작하기

선호하는 설정 방식과 모드를 선택하세요.

<Tabs>
  <Tab title="온보딩 (권장)">
    **적합한 경우:** Ollama 클라우드 또는 로컬 설정을 가장 빠르게 시작하고 싶은 경우.

    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard
        ```

        Provider 목록에서 **Ollama**를 선택하세요.
      </Step>
      <Step title="모드 선택">
        - **Cloud + Local** — 로컬 Ollama 호스트에 해당 호스트를 통해 라우팅되는 클라우드 모델 결합
        - **Cloud only** — `https://ollama.com`을 통한 호스팅 Ollama 모델
        - **Local only** — 로컬 모델만 사용
      </Step>
      <Step title="모델 선택">
        `Cloud only`는 `OLLAMA_API_KEY`를 요청하고 호스팅 클라우드 기본값을 제안합니다. `Cloud + Local` 및 `Local only`는 Ollama 베이스 URL을 요청하고, 사용 가능한 모델을 탐색하며, 아직 없는 경우 선택한 로컬 모델을 자동으로 풀합니다. `Cloud + Local`은 해당 Ollama 호스트가 클라우드 접근을 위해 로그인되어 있는지도 확인합니다.
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider ollama
        ```
      </Step>
    </Steps>

    ### 비대화형 모드

    ```bash
    openclaw onboard --non-interactive \
      --auth-choice ollama \
      --accept-risk
    ```

    선택적으로 커스텀 베이스 URL 또는 모델을 지정할 수 있습니다:

    ```bash
    openclaw onboard --non-interactive \
      --auth-choice ollama \
      --custom-base-url "http://ollama-host:11434" \
      --custom-model-id "qwen3.5:27b" \
      --accept-risk
    ```

  </Tab>

  <Tab title="수동 설정">
    **적합한 경우:** 클라우드 또는 로컬 설정을 완전히 제어하고 싶은 경우.

    <Steps>
      <Step title="클라우드 또는 로컬 선택">
        - **Cloud + Local**: Ollama를 설치하고, `ollama signin`으로 로그인한 후, 해당 호스트를 통해 클라우드 요청을 라우팅합니다
        - **Cloud only**: `OLLAMA_API_KEY`와 함께 `https://ollama.com`을 사용합니다
        - **Local only**: [ollama.com/download](https://ollama.com/download)에서 Ollama 설치
      </Step>
      <Step title="로컬 모델 풀 (로컬 전용)">
        ```bash
        ollama pull gemma4
        # 또는
        ollama pull gpt-oss:20b
        # 또는
        ollama pull llama3.3
        ```
      </Step>
      <Step title="OpenClaw에서 Ollama 활성화">
        `Cloud only`의 경우 실제 `OLLAMA_API_KEY`를 사용하세요. 호스트 기반 설정의 경우 어떤 placeholder 값도 동작합니다:

        ```bash
        # 클라우드
        export OLLAMA_API_KEY="your-ollama-api-key"

        # 로컬 전용
        export OLLAMA_API_KEY="ollama-local"

        # 또는 설정 파일에서 구성
        openclaw config set models.providers.ollama.apiKey "OLLAMA_API_KEY"
        ```
      </Step>
      <Step title="모델 검사 및 설정">
        ```bash
        openclaw models list
        openclaw models set ollama/gemma4
        ```

        또는 설정 파일에서 기본값을 지정:

        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "ollama/gemma4" },
            },
          },
        }
        ```
      </Step>
    </Steps>

  </Tab>
</Tabs>

## 클라우드 모델

<Tabs>
  <Tab title="Cloud + Local">
    `Cloud + Local`은 접근 가능한 Ollama 호스트를 로컬 및 클라우드 모델 모두의 제어 지점으로 사용합니다. 이는 Ollama의 권장 하이브리드 플로우입니다.

    설정 중 **Cloud + Local**을 사용하세요. OpenClaw는 Ollama 베이스 URL을 요청하고, 해당 호스트에서 로컬 모델을 탐색하며, 호스트가 `ollama signin`으로 클라우드 접근을 위해 로그인되어 있는지 확인합니다. 호스트가 로그인되어 있는 경우, OpenClaw는 `kimi-k2.5:cloud`, `minimax-m2.7:cloud`, `glm-5.1:cloud` 같은 호스팅 클라우드 기본값도 제안합니다.

    호스트가 아직 로그인되어 있지 않다면, OpenClaw는 `ollama signin`을 실행할 때까지 설정을 로컬 전용으로 유지합니다.

  </Tab>

  <Tab title="Cloud only">
    `Cloud only`는 `https://ollama.com`의 Ollama 호스팅 API에 대해 실행됩니다.

    설정 중 **Cloud only**를 사용하세요. OpenClaw는 `OLLAMA_API_KEY`를 요청하고, `baseUrl: "https://ollama.com"`을 설정한 후, 호스팅 클라우드 모델 목록을 시드합니다. 이 경로는 로컬 Ollama 서버나 `ollama signin`이 **필요하지 않습니다**.

    `openclaw onboard` 중에 표시되는 클라우드 모델 목록은 `https://ollama.com/api/tags`에서 라이브로 채워지며 최대 500개 항목으로 제한됩니다. 따라서 피커는 정적 시드가 아닌 현재 호스팅 카탈로그를 반영합니다. 설정 시점에 `ollama.com`에 접근할 수 없거나 모델이 반환되지 않으면, OpenClaw는 이전의 하드코딩된 제안으로 폴백하여 온보딩이 완료되도록 합니다.

  </Tab>

  <Tab title="Local only">
    로컬 전용 모드에서, OpenClaw는 설정된 Ollama 인스턴스에서 모델을 탐색합니다. 이 경로는 로컬 또는 셀프 호스팅 Ollama 서버를 위한 것입니다.

    OpenClaw는 현재 `gemma4`를 로컬 기본값으로 제안합니다.

  </Tab>
</Tabs>

## 모델 탐색 (암묵적 Provider)

`OLLAMA_API_KEY`(또는 인증 프로필)를 설정하고 `models.providers.ollama`를 정의하지 **않은** 경우, OpenClaw는 `http://127.0.0.1:11434`의 로컬 Ollama 인스턴스에서 모델을 탐색합니다.

| 동작                 | 세부 사항                                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 카탈로그 쿼리        | `/api/tags`를 쿼리합니다                                                                                                                                              |
| 기능 감지            | best-effort `/api/show` 조회를 사용하여 `contextWindow`를 읽고 기능(비전 포함)을 감지합니다                                                                           |
| 비전 모델            | `/api/show`에서 `vision` 기능을 보고한 모델은 이미지 처리 가능(`input: ["text", "image"]`)으로 표시되어, OpenClaw가 자동으로 이미지를 프롬프트에 주입합니다           |
| 추론 감지            | 모델 이름 휴리스틱(`r1`, `reasoning`, `think`)으로 `reasoning`을 표시합니다                                                                                           |
| 토큰 제한            | `maxTokens`를 OpenClaw에서 사용하는 기본 Ollama 최대 토큰 상한으로 설정합니다                                                                                         |
| 비용                 | 모든 비용을 `0`으로 설정합니다                                                                                                                                        |

이는 로컬 Ollama 인스턴스와 카탈로그를 일치시키면서 수동 모델 입력을 피하게 해줍니다.

```bash
# 사용 가능한 모델 확인
ollama list
openclaw models list
```

새 모델을 추가하려면 Ollama로 풀하기만 하면 됩니다:

```bash
ollama pull mistral
```

새로운 모델은 자동으로 탐색되어 사용할 수 있게 됩니다.

<Note>
`models.providers.ollama`를 명시적으로 설정하면 자동 탐색이 건너뛰어지며 모델을 수동으로 정의해야 합니다. 아래의 명시적 설정 섹션을 참고하세요.
</Note>

## 비전 및 이미지 설명

번들된 Ollama 플러그인은 Ollama를 이미지 처리 가능한 미디어 이해 Provider로 등록합니다. 이를 통해 OpenClaw는 명시적인 이미지 설명 요청과 설정된 이미지 모델 기본값을 로컬 또는 호스팅 Ollama 비전 모델을 통해 라우팅할 수 있습니다.

로컬 비전을 위해 이미지를 지원하는 모델을 풀하세요:

```bash
ollama pull qwen2.5vl:7b
export OLLAMA_API_KEY="ollama-local"
```

그런 다음 infer CLI로 확인하세요:

```bash
openclaw infer image describe \
  --file ./photo.jpg \
  --model ollama/qwen2.5vl:7b \
  --json
```

`--model`은 전체 `<provider/model>` 참조여야 합니다. 이 값이 설정되면, `openclaw infer image describe`는 모델이 네이티브 비전을 지원한다는 이유로 설명을 건너뛰는 대신 해당 모델을 직접 실행합니다.

Ollama를 수신 미디어에 대한 기본 이미지 이해 모델로 지정하려면, `agents.defaults.imageModel`을 설정하세요:

```json5
{
  agents: {
    defaults: {
      imageModel: {
        primary: "ollama/qwen2.5vl:7b",
      },
    },
  },
}
```

`models.providers.ollama.models`를 수동으로 정의하는 경우, 비전 모델을 이미지 입력 지원으로 표시하세요:

```json5
{
  id: "qwen2.5vl:7b",
  name: "qwen2.5vl:7b",
  input: ["text", "image"],
  contextWindow: 128000,
  maxTokens: 8192,
}
```

OpenClaw는 이미지 처리 가능으로 표시되지 않은 모델에 대한 이미지 설명 요청을 거부합니다. 암묵적 탐색에서는 `/api/show`가 비전 기능을 보고할 때 OpenClaw가 Ollama에서 이 값을 읽어옵니다.

## 설정

<Tabs>
  <Tab title="기본 (암묵적 탐색)">
    가장 간단한 로컬 전용 활성화 경로는 환경 변수를 사용하는 것입니다:

    ```bash
    export OLLAMA_API_KEY="ollama-local"
    ```

    <Tip>
    `OLLAMA_API_KEY`가 설정되어 있으면, Provider 항목에서 `apiKey`를 생략할 수 있으며 OpenClaw가 가용성 검사를 위해 이를 채워줍니다.
    </Tip>

  </Tab>

  <Tab title="명시적 (수동 모델)">
    다음의 경우 명시적 설정을 사용하세요: 호스팅 클라우드 설정을 원할 때, Ollama가 다른 호스트/포트에서 실행될 때, 특정 컨텍스트 윈도우나 모델 목록을 강제하고 싶을 때, 또는 완전한 수동 모델 정의를 원할 때.

    ```json5
    {
      models: {
        providers: {
          ollama: {
            baseUrl: "https://ollama.com",
            apiKey: "OLLAMA_API_KEY",
            api: "ollama",
            models: [
              {
                id: "kimi-k2.5:cloud",
                name: "kimi-k2.5:cloud",
                reasoning: false,
                input: ["text", "image"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 128000,
                maxTokens: 8192
              }
            ]
          }
        }
      }
    }
    ```

  </Tab>

  <Tab title="커스텀 베이스 URL">
    Ollama가 다른 호스트나 포트에서 실행되는 경우(명시적 설정은 자동 탐색을 비활성화하므로 모델을 수동으로 정의하세요):

    ```json5
    {
      models: {
        providers: {
          ollama: {
            apiKey: "ollama-local",
            baseUrl: "http://ollama-host:11434", // /v1 없이 - 네이티브 Ollama API URL을 사용
            api: "ollama", // 네이티브 도구 호출 동작을 보장하기 위해 명시적으로 설정
          },
        },
      },
    }
    ```

    <Warning>
    URL에 `/v1`을 추가하지 마세요. `/v1` 경로는 OpenAI 호환 모드를 사용하며, 이 모드에서는 도구 호출이 신뢰할 수 없습니다. 경로 접미사 없이 기본 Ollama URL을 사용하세요.
    </Warning>

  </Tab>
</Tabs>

### 모델 선택

설정이 완료되면, 모든 Ollama 모델이 사용 가능합니다:

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

## Ollama 웹 검색

OpenClaw는 번들된 `web_search` Provider로 **Ollama 웹 검색**을 지원합니다.

| 속성        | 세부 사항                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| 호스트      | 설정된 Ollama 호스트 사용(`models.providers.ollama.baseUrl`이 설정된 경우, 그렇지 않으면 `http://127.0.0.1:11434`)   |
| 인증        | 키 불필요                                                                                                            |
| 요구 사항   | Ollama가 실행 중이고 `ollama signin`으로 로그인되어 있어야 함                                                        |

`openclaw onboard` 또는 `openclaw configure --section web` 중에 **Ollama 웹 검색**을 선택하거나, 다음을 설정하세요:

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

<Note>
전체 설정 및 동작 세부 사항은 [Ollama 웹 검색](/tools/ollama-search)을 참고하세요.
</Note>

## 고급 설정

<AccordionGroup>
  <Accordion title="레거시 OpenAI 호환 모드">
    <Warning>
    **OpenAI 호환 모드에서는 도구 호출이 신뢰할 수 없습니다.** OpenAI 포맷만 지원하는 프록시가 필요하고 네이티브 도구 호출 동작에 의존하지 않는 경우에만 이 모드를 사용하세요.
    </Warning>

    OpenAI 호환 엔드포인트를 대신 사용해야 하는 경우(예: OpenAI 포맷만 지원하는 프록시 뒤에 있는 경우), `api: "openai-completions"`를 명시적으로 설정하세요:

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

    이 모드는 스트리밍과 도구 호출을 동시에 지원하지 않을 수 있습니다. 모델 설정에서 `params: { streaming: false }`로 스트리밍을 비활성화해야 할 수 있습니다.

    `api: "openai-completions"`를 Ollama와 함께 사용할 때, OpenClaw는 기본적으로 `options.num_ctx`를 주입하여 Ollama가 조용히 4096 컨텍스트 윈도우로 폴백하지 않도록 합니다. 프록시/업스트림이 알 수 없는 `options` 필드를 거부하는 경우 이 동작을 비활성화하세요:

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

  </Accordion>

  <Accordion title="컨텍스트 윈도우">
    자동 탐색된 모델의 경우, OpenClaw는 가능할 때 Ollama가 보고한 컨텍스트 윈도우를 사용하며, 그렇지 않으면 OpenClaw에서 사용하는 기본 Ollama 컨텍스트 윈도우로 폴백합니다.

    명시적 Provider 설정에서 `contextWindow`와 `maxTokens`를 재정의할 수 있습니다:

    ```json5
    {
      models: {
        providers: {
          ollama: {
            models: [
              {
                id: "llama3.3",
                contextWindow: 131072,
                maxTokens: 65536,
              }
            ]
          }
        }
      }
    }
    ```

  </Accordion>

  <Accordion title="추론 모델">
    OpenClaw는 `deepseek-r1`, `reasoning`, `think`와 같은 이름의 모델을 기본적으로 추론 가능 모델로 취급합니다.

    ```bash
    ollama pull deepseek-r1:32b
    ```

    추가 설정은 필요 없습니다 -- OpenClaw가 자동으로 표시합니다.

  </Accordion>

  <Accordion title="모델 비용">
    Ollama는 무료이며 로컬에서 실행되므로 모든 모델 비용이 $0으로 설정됩니다. 이는 자동 탐색 모델과 수동으로 정의한 모델 모두에 적용됩니다.
  </Accordion>

  <Accordion title="메모리 임베딩">
    번들된 Ollama 플러그인은 [메모리 검색](/concepts/memory)을 위한
    메모리 임베딩 Provider를 등록합니다. 설정된 Ollama 베이스 URL과
    API 키를 사용합니다.

    | 속성          | 값                  |
    | ------------- | ------------------- |
    | 기본 모델     | `nomic-embed-text`  |
    | 자동 풀       | 예 — 로컬에 없는 경우 임베딩 모델이 자동으로 풀됩니다 |

    Ollama를 메모리 검색 임베딩 Provider로 선택하려면:

    ```json5
    {
      agents: {
        defaults: {
          memorySearch: { provider: "ollama" },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="스트리밍 설정">
    OpenClaw의 Ollama 통합은 기본적으로 **네이티브 Ollama API**(`/api/chat`)를 사용하며, 이는 스트리밍과 도구 호출을 동시에 완전히 지원합니다. 특별한 설정은 필요하지 않습니다.

    네이티브 `/api/chat` 요청의 경우, OpenClaw는 thinking 컨트롤을 Ollama에 직접 전달합니다: `/think off` 및 `openclaw agent --thinking off`는 최상위 레벨 `think: false`를 전송하며, `off`가 아닌 thinking 수준은 `think: true`를 전송합니다.

    <Tip>
    OpenAI 호환 엔드포인트를 사용해야 하는 경우, 위의 "레거시 OpenAI 호환 모드" 섹션을 참고하세요. 해당 모드에서는 스트리밍과 도구 호출이 동시에 동작하지 않을 수 있습니다.
    </Tip>

  </Accordion>
</AccordionGroup>

## 문제 해결

<AccordionGroup>
  <Accordion title="Ollama가 감지되지 않음">
    Ollama가 실행 중이고 `OLLAMA_API_KEY`(또는 인증 프로필)가 설정되어 있는지 확인하세요. 그리고 명시적인 `models.providers.ollama` 항목을 정의하지 **않았는지** 확인하세요:

    ```bash
    ollama serve
    ```

    API에 접근 가능한지 확인하세요:

    ```bash
    curl http://localhost:11434/api/tags
    ```

  </Accordion>

  <Accordion title="사용 가능한 모델 없음">
    모델이 목록에 없는 경우, 모델을 로컬로 풀하거나 `models.providers.ollama`에 명시적으로 정의하세요.

    ```bash
    ollama list  # 설치된 항목 확인
    ollama pull gemma4
    ollama pull gpt-oss:20b
    ollama pull llama3.3     # 또는 다른 모델
    ```

  </Accordion>

  <Accordion title="Connection refused">
    Ollama가 올바른 포트에서 실행 중인지 확인하세요:

    ```bash
    # Ollama 실행 여부 확인
    ps aux | grep ollama

    # 또는 Ollama 재시작
    ollama serve
    ```

  </Accordion>
</AccordionGroup>

<Note>
추가 도움말: [문제 해결](/help/troubleshooting) 및 [FAQ](/help/faq).
</Note>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    모든 Provider, 모델 참조, 페일오버 동작 개요.
  </Card>
  <Card title="모델 선택" href="/concepts/models" icon="brain">
    모델을 선택하고 설정하는 방법.
  </Card>
  <Card title="Ollama 웹 검색" href="/tools/ollama-search" icon="magnifying-glass">
    Ollama 기반 웹 검색의 전체 설정 및 동작 세부 사항.
  </Card>
  <Card title="설정" href="/gateway/configuration" icon="gear">
    전체 설정 참조.
  </Card>
</CardGroup>
