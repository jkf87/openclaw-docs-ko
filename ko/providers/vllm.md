---
summary: "vLLM(OpenAI 호환 로컬 서버)으로 OpenClaw 실행"
read_when:
  - 로컬 vLLM 서버에 대해 OpenClaw를 실행하려는 경우
  - 자체 모델로 OpenAI 호환 /v1 엔드포인트를 사용하려는 경우
title: "vLLM"
---

vLLM은 오픈소스 모델(및 일부 커스텀 모델)을 **OpenAI 호환** HTTP API를 통해 서빙할 수 있습니다. OpenClaw는 `openai-completions` API를 사용하여 vLLM에 연결합니다.

`VLLM_API_KEY`를 설정하여 옵트인하고(서버에서 인증을 강제하지 않는 경우 어떤 값이든 동작합니다) 명시적인 `models.providers.vllm` 항목을 정의하지 않으면, OpenClaw는 vLLM에서 사용 가능한 모델을 **자동 탐색(auto-discover)** 할 수도 있습니다.

OpenClaw는 `vllm`을 스트리밍 사용량 집계(streamed usage accounting)를 지원하는 로컬 OpenAI 호환 프로바이더로 취급하므로, 상태(status)/컨텍스트 토큰 카운트가 `stream_options.include_usage` 응답으로부터 업데이트될 수 있습니다.

| 속성             | 값                                       |
| ---------------- | ---------------------------------------- |
| 프로바이더 ID    | `vllm`                                   |
| API              | `openai-completions` (OpenAI 호환)       |
| 인증             | `VLLM_API_KEY` 환경 변수                 |
| 기본 base URL    | `http://127.0.0.1:8000/v1`               |

## 시작하기

<Steps>
  <Step title="OpenAI 호환 서버로 vLLM 시작">
    base URL은 `/v1` 엔드포인트(예: `/v1/models`, `/v1/chat/completions`)를 노출해야 합니다. vLLM은 일반적으로 다음 주소에서 실행됩니다.

    ```
    http://127.0.0.1:8000/v1
    ```

  </Step>
  <Step title="API 키 환경 변수 설정">
    서버에서 인증을 강제하지 않는 경우 어떤 값이든 동작합니다.

    ```bash
    export VLLM_API_KEY="vllm-local"
    ```

  </Step>
  <Step title="모델 선택">
    vLLM 모델 ID 중 하나로 교체하세요.

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "vllm/your-model-id" },
        },
      },
    }
    ```

  </Step>
  <Step title="모델 사용 가능 여부 확인">
    ```bash
    openclaw models list --provider vllm
    ```
  </Step>
</Steps>

## 모델 탐색 (암묵적 프로바이더)

`VLLM_API_KEY`가 설정되어 있고(또는 인증 프로파일이 존재하고) `models.providers.vllm`을 **정의하지 않았다면**, OpenClaw는 다음을 조회합니다.

```
GET http://127.0.0.1:8000/v1/models
```

그리고 반환된 ID들을 모델 항목으로 변환합니다.

<Note>
`models.providers.vllm`을 명시적으로 설정하면 자동 탐색이 건너뛰어지며, 모델을 수동으로 정의해야 합니다.
</Note>

## 명시적 설정 (수동 모델)

다음과 같은 경우 명시적 설정을 사용하세요.

- vLLM이 다른 호스트 또는 포트에서 실행되는 경우
- `contextWindow`나 `maxTokens` 값을 고정하고 싶은 경우
- 서버에 실제 API 키가 필요하거나(또는 헤더를 제어하고 싶은 경우)

```json5
{
  models: {
    providers: {
      vllm: {
        baseUrl: "http://127.0.0.1:8000/v1",
        apiKey: "${VLLM_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "your-model-id",
            name: "Local vLLM Model",
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

## 고급 설정

<AccordionGroup>
  <Accordion title="프록시 스타일 동작">
    vLLM은 네이티브 OpenAI 엔드포인트가 아닌, 프록시 스타일의 OpenAI 호환 `/v1` 백엔드로 취급됩니다. 이는 다음을 의미합니다.

    | 동작 | 적용 여부 |
    |----------|----------|
    | 네이티브 OpenAI 요청 셰이핑 | 아니오 |
    | `service_tier` | 전송되지 않음 |
    | Responses `store` | 전송되지 않음 |
    | 프롬프트 캐시 힌트 | 전송되지 않음 |
    | OpenAI reasoning-compat 페이로드 셰이핑 | 적용되지 않음 |
    | 숨겨진 OpenClaw 속성(attribution) 헤더 | 커스텀 base URL에 주입되지 않음 |

  </Accordion>

  <Accordion title="커스텀 base URL">
    vLLM 서버가 기본이 아닌 호스트나 포트에서 실행되는 경우, 명시적 프로바이더 설정에서 `baseUrl`을 지정하세요.

    ```json5
    {
      models: {
        providers: {
          vllm: {
            baseUrl: "http://192.168.1.50:9000/v1",
            apiKey: "${VLLM_API_KEY}",
            api: "openai-completions",
            models: [
              {
                id: "my-custom-model",
                name: "Remote vLLM Model",
                reasoning: false,
                input: ["text"],
                contextWindow: 64000,
                maxTokens: 4096,
              },
            ],
          },
        },
      },
    }
    ```

  </Accordion>
</AccordionGroup>

## 문제 해결

<AccordionGroup>
  <Accordion title="서버에 연결할 수 없음">
    vLLM 서버가 실행 중이고 접근 가능한지 확인하세요.

    ```bash
    curl http://127.0.0.1:8000/v1/models
    ```

    연결 오류가 발생하면 호스트, 포트, 그리고 vLLM이 OpenAI 호환 서버 모드로 시작되었는지 확인하세요.

  </Accordion>

  <Accordion title="요청 시 인증 오류">
    요청이 인증 오류로 실패하면, 서버 설정과 일치하는 실제 `VLLM_API_KEY`를 설정하거나, `models.providers.vllm` 아래에 프로바이더를 명시적으로 구성하세요.

    <Tip>
    vLLM 서버에서 인증을 강제하지 않는 경우, `VLLM_API_KEY`에 비어있지 않은 어떤 값이든 OpenClaw의 옵트인 신호로 동작합니다.
    </Tip>

  </Accordion>

  <Accordion title="탐색된 모델이 없음">
    자동 탐색은 `VLLM_API_KEY`가 설정되어 있어야 **하며** 명시적인 `models.providers.vllm` 설정 항목이 없어야 합니다. 프로바이더를 수동으로 정의한 경우, OpenClaw는 탐색을 건너뛰고 선언된 모델만 사용합니다.
  </Accordion>
</AccordionGroup>

<Warning>
추가 도움말: [문제 해결](/help/troubleshooting) 및 [FAQ](/help/faq).
</Warning>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 선택, 모델 참조, 페일오버 동작.
  </Card>
  <Card title="OpenAI" href="/providers/openai" icon="bolt">
    네이티브 OpenAI 프로바이더 및 OpenAI 호환 경로 동작.
  </Card>
  <Card title="OAuth 및 인증" href="/gateway/authentication" icon="key">
    인증 세부 사항 및 자격 증명 재사용 규칙.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반적인 문제와 해결 방법.
  </Card>
</CardGroup>
