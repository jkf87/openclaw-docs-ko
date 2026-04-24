---
summary: "SGLang(OpenAI 호환 자체 호스팅 서버)으로 OpenClaw 실행하기"
read_when:
  - 로컬 SGLang 서버에 대해 OpenClaw를 실행하고 싶을 때
  - 자체 모델과 함께 OpenAI 호환 /v1 엔드포인트를 원할 때
title: "SGLang"
---

SGLang은 **OpenAI 호환** HTTP API를 통해 오픈 소스 모델을 서빙할 수 있습니다.
OpenClaw는 `openai-completions` API를 사용해서 SGLang에 연결할 수 있습니다.

또한 OpenClaw는 `SGLANG_API_KEY`로 옵트인하고(서버가 인증을 강제하지 않는 경우
어떤 값이든 동작) `models.providers.sglang` 항목을 명시적으로 정의하지 않는
경우, SGLang에서 사용 가능한 모델을 **자동 검색**할 수 있습니다.

OpenClaw는 `sglang`을 스트리밍 사용량(usage) 집계를 지원하는 로컬 OpenAI 호환
프로바이더로 취급하므로, `stream_options.include_usage` 응답으로부터 상태/컨텍스트
토큰 수를 업데이트할 수 있습니다.

## 시작하기

<Steps>
  <Step title="SGLang 시작">
    OpenAI 호환 서버로 SGLang을 실행하세요. base URL은 `/v1` 엔드포인트(예:
    `/v1/models`, `/v1/chat/completions`)를 노출해야 합니다. SGLang은 일반적으로
    다음 주소에서 실행됩니다.

    - `http://127.0.0.1:30000/v1`

  </Step>
  <Step title="API 키 설정">
    서버에 인증이 설정되지 않았다면 어떤 값이든 동작합니다.

    ```bash
    export SGLANG_API_KEY="sglang-local"
    ```

  </Step>
  <Step title="온보딩 실행 또는 모델 직접 설정">
    ```bash
    openclaw onboard
    ```

    또는 모델을 수동으로 설정하세요.

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "sglang/your-model-id" },
        },
      },
    }
    ```

  </Step>
</Steps>

## 모델 자동 검색 (암시적 프로바이더)

`SGLANG_API_KEY`가 설정되어 있거나(또는 인증 프로파일이 존재하고)
`models.providers.sglang`을 **정의하지 않은** 경우, OpenClaw는 다음을
쿼리합니다.

- `GET http://127.0.0.1:30000/v1/models`

그리고 반환된 ID를 모델 항목으로 변환합니다.

<Note>
`models.providers.sglang`을 명시적으로 설정하면 자동 검색은 건너뛰어지며,
모델을 수동으로 정의해야 합니다.
</Note>

## 명시적 설정 (수동 모델)

다음의 경우 명시적 설정을 사용하세요.

- SGLang이 다른 호스트/포트에서 실행될 때.
- `contextWindow`/`maxTokens` 값을 고정하고 싶을 때.
- 서버가 실제 API 키를 요구하거나 헤더를 제어하고 싶을 때.

```json5
{
  models: {
    providers: {
      sglang: {
        baseUrl: "http://127.0.0.1:30000/v1",
        apiKey: "${SGLANG_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "your-model-id",
            name: "Local SGLang Model",
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
    SGLang은 네이티브 OpenAI 엔드포인트가 아닌 프록시 스타일 OpenAI 호환 `/v1`
    백엔드로 취급됩니다.

    | 동작 | SGLang |
    |------|--------|
    | OpenAI 전용 요청 정형화 | 적용되지 않음 |
    | `service_tier`, Responses `store`, 프롬프트 캐시 힌트 | 전송되지 않음 |
    | Reasoning-compat 페이로드 정형화 | 적용되지 않음 |
    | 숨겨진 귀속 헤더(`originator`, `version`, `User-Agent`) | 커스텀 SGLang base URL에서는 주입되지 않음 |

  </Accordion>

  <Accordion title="트러블슈팅">
    **서버에 접근할 수 없음**

    서버가 실행 중이고 응답하는지 확인하세요.

    ```bash
    curl http://127.0.0.1:30000/v1/models
    ```

    **인증 오류**

    요청이 인증 오류로 실패하면, 서버 설정과 일치하는 실제 `SGLANG_API_KEY`를
    설정하거나 `models.providers.sglang`에서 프로바이더를 명시적으로
    설정하세요.

    <Tip>
    SGLang을 인증 없이 실행하는 경우, 비어 있지 않은 어떤 값이든
    `SGLANG_API_KEY`에 설정하면 모델 자동 검색에 옵트인하기 충분합니다.
    </Tip>

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 선택, 모델 레퍼런스, 페일오버 동작.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    프로바이더 항목을 포함한 전체 설정 스키마.
  </Card>
</CardGroup>
