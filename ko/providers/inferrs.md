---
summary: "OpenClaw를 inferrs(OpenAI 호환 로컬 서버)를 통해 실행하기"
read_when:
  - 로컬 inferrs 서버에 대해 OpenClaw를 실행하고 싶을 때
  - inferrs를 통해 Gemma 또는 다른 모델을 서빙할 때
  - inferrs에 대한 정확한 OpenClaw compat 플래그가 필요할 때
title: "Inferrs"
---

[inferrs](https://github.com/ericcurtin/inferrs)는 OpenAI 호환 `/v1` API
뒷단에서 로컬 모델을 서빙할 수 있습니다. OpenClaw는 제네릭 `openai-completions`
경로를 통해 `inferrs`와 연동됩니다.

`inferrs`는 현재 전용 OpenClaw 프로바이더 플러그인이 아니라 커스텀 자체 호스팅
OpenAI 호환 백엔드로 취급하는 것이 가장 좋습니다.

## 시작하기

<Steps>
  <Step title="모델과 함께 inferrs 시작">
    ```bash
    inferrs serve google/gemma-4-E2B-it \
      --host 127.0.0.1 \
      --port 8080 \
      --device metal
    ```
  </Step>
  <Step title="서버 연결 가능 여부 확인">
    ```bash
    curl http://127.0.0.1:8080/health
    curl http://127.0.0.1:8080/v1/models
    ```
  </Step>
  <Step title="OpenClaw 프로바이더 항목 추가">
    명시적인 프로바이더 항목을 추가하고 기본 모델을 이 프로바이더로 지정하세요. 아래 전체 설정 예시를 참고하세요.
  </Step>
</Steps>

## 전체 설정 예시

이 예시는 로컬 `inferrs` 서버에서 Gemma 4를 사용합니다.

```json5
{
  agents: {
    defaults: {
      model: { primary: "inferrs/google/gemma-4-E2B-it" },
      models: {
        "inferrs/google/gemma-4-E2B-it": {
          alias: "Gemma 4 (inferrs)",
        },
      },
    },
  },
  models: {
    mode: "merge",
    providers: {
      inferrs: {
        baseUrl: "http://127.0.0.1:8080/v1",
        apiKey: "inferrs-local",
        api: "openai-completions",
        models: [
          {
            id: "google/gemma-4-E2B-it",
            name: "Gemma 4 E2B (inferrs)",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 131072,
            maxTokens: 4096,
            compat: {
              requiresStringContent: true,
            },
          },
        ],
      },
    },
  },
}
```

## 고급 설정

<AccordionGroup>
  <Accordion title="requiresStringContent가 중요한 이유">
    일부 `inferrs` Chat Completions 라우트는 구조화된 content-part 배열이 아닌
    문자열 `messages[].content`만 허용합니다.

    <Warning>
    OpenClaw 실행이 다음과 같은 오류로 실패할 경우:

    ```text
    messages[1].content: invalid type: sequence, expected a string
    ```

    모델 항목에 `compat.requiresStringContent: true`를 설정하세요.
    </Warning>

    ```json5
    compat: {
      requiresStringContent: true
    }
    ```

    OpenClaw는 요청을 보내기 전에 순수 텍스트 content part를 일반 문자열로
    평탄화합니다.

  </Accordion>

  <Accordion title="Gemma 및 도구 스키마 주의 사항">
    일부 현재 `inferrs` + Gemma 조합은 작은 직접 `/v1/chat/completions`
    요청은 받지만 전체 OpenClaw 에이전트 런타임 턴에서는 여전히 실패합니다.

    이런 경우 먼저 다음을 시도해 보세요.

    ```json5
    compat: {
      requiresStringContent: true,
      supportsTools: false
    }
    ```

    이는 해당 모델에 대한 OpenClaw의 tool 스키마 표면을 비활성화하여 더 엄격한
    로컬 백엔드에서 프롬프트 부담을 줄일 수 있습니다.

    작은 직접 요청은 여전히 동작하지만 일반 OpenClaw 에이전트 턴에서 계속
    `inferrs` 내부에서 크래시가 나는 경우, 남은 문제는 대체로 OpenClaw의 전송
    계층이 아니라 업스트림 모델/서버 동작 때문입니다.

  </Accordion>

  <Accordion title="수동 스모크 테스트">
    설정이 끝나면 두 계층을 모두 테스트하세요.

    ```bash
    curl http://127.0.0.1:8080/v1/chat/completions \
      -H 'content-type: application/json' \
      -d '{"model":"google/gemma-4-E2B-it","messages":[{"role":"user","content":"What is 2 + 2?"}],"stream":false}'
    ```

    ```bash
    openclaw infer model run \
      --model inferrs/google/gemma-4-E2B-it \
      --prompt "What is 2 + 2? Reply with one short sentence." \
      --json
    ```

    첫 번째 명령은 성공하지만 두 번째가 실패하는 경우, 아래 트러블슈팅 섹션을 확인하세요.

  </Accordion>

  <Accordion title="프록시 스타일 동작">
    `inferrs`는 네이티브 OpenAI 엔드포인트가 아닌 프록시 스타일 OpenAI 호환
    `/v1` 백엔드로 취급됩니다.

    - 네이티브 OpenAI 전용 요청 정형화는 여기에 적용되지 않습니다
    - `service_tier`, Responses `store`, 프롬프트 캐시 힌트, OpenAI
      reasoning-compat 페이로드 정형화는 사용되지 않습니다
    - 숨겨진 OpenClaw 귀속 헤더(`originator`, `version`, `User-Agent`)는
      커스텀 `inferrs` base URL에서는 주입되지 않습니다

  </Accordion>
</AccordionGroup>

## 트러블슈팅

<AccordionGroup>
  <Accordion title="curl /v1/models가 실패함">
    `inferrs`가 실행되지 않았거나, 접근이 불가능하거나, 예상한 호스트/포트에
    바인딩되지 않은 상태입니다. 서버가 시작되어 설정한 주소에서 수신 중인지
    확인하세요.
  </Accordion>

  <Accordion title="messages[].content expected a string">
    모델 항목에 `compat.requiresStringContent: true`를 설정하세요. 위의
    `requiresStringContent` 섹션에서 자세한 내용을 확인하세요.
  </Accordion>

  <Accordion title="직접 /v1/chat/completions 호출은 성공하지만 openclaw infer model run이 실패함">
    `compat.supportsTools: false`로 설정하여 tool 스키마 표면을 비활성화해
    보세요. 위의 Gemma 도구 스키마 주의 사항을 참고하세요.
  </Accordion>

  <Accordion title="더 큰 에이전트 턴에서 inferrs가 여전히 크래시됨">
    OpenClaw가 더 이상 스키마 오류를 내지 않지만 `inferrs`가 여전히 더 큰 에이전트
    턴에서 크래시되는 경우, 이를 업스트림 `inferrs` 또는 모델의 한계로 간주하세요.
    프롬프트 부담을 줄이거나 다른 로컬 백엔드 또는 모델로 전환하세요.
  </Accordion>
</AccordionGroup>

<Tip>
일반적인 도움말은 [트러블슈팅](/help/troubleshooting)과 [FAQ](/help/faq)를 참고하세요.
</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="로컬 모델" href="/gateway/local-models" icon="server">
    로컬 모델 서버에 대해 OpenClaw 실행하기.
  </Card>
  <Card title="게이트웨이 트러블슈팅" href="/gateway/troubleshooting#local-openai-compatible-backend-passes-direct-probes-but-agent-runs-fail" icon="wrench">
    직접 프로브는 통과하지만 에이전트 실행은 실패하는 로컬 OpenAI 호환 백엔드 디버깅.
  </Card>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    모든 프로바이더, 모델 레퍼런스, 페일오버 동작 개요.
  </Card>
</CardGroup>
