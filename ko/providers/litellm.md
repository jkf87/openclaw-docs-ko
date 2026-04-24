---
summary: "LiteLLM Proxy를 통해 OpenClaw를 실행하여 통합 모델 접근 및 비용 추적 구현"
title: "LiteLLM"
read_when:
  - OpenClaw를 LiteLLM 프록시 경유로 라우팅하고 싶을 때
  - LiteLLM을 통한 비용 추적, 로깅, 모델 라우팅이 필요할 때
---

[LiteLLM](https://litellm.ai)은 오픈소스 LLM 게이트웨이로, 100개 이상의 모델 프로바이더에 대한 통합 API를 제공합니다. OpenClaw를 LiteLLM 경유로 라우팅하면 중앙 집중식 비용 추적, 로깅을 얻고, OpenClaw 설정을 바꾸지 않고도 백엔드를 자유롭게 전환할 수 있습니다.

<Tip>
**OpenClaw에 LiteLLM을 함께 사용하는 이유는?**

- **비용 추적** — 모든 모델에 걸쳐 OpenClaw가 정확히 얼마를 쓰는지 확인
- **모델 라우팅** — 설정 변경 없이 Claude, GPT-4, Gemini, Bedrock 간 전환
- **가상 키(Virtual keys)** — OpenClaw용으로 사용량 한도가 설정된 키 발급
- **로깅** — 디버깅을 위한 전체 요청/응답 로그
- **폴백(Fallbacks)** — 기본 프로바이더가 다운되었을 때 자동 페일오버

</Tip>

## 빠른 시작

<Tabs>
  <Tab title="온보딩 (권장)">
    **적합한 사용처:** 동작하는 LiteLLM 설정에 가장 빠르게 도달하는 경로.

    <Steps>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice litellm-api-key
        ```
      </Step>
    </Steps>

  </Tab>

  <Tab title="수동 설정">
    **적합한 사용처:** 설치 및 설정에 대한 완전한 제어가 필요할 때.

    <Steps>
      <Step title="LiteLLM Proxy 시작">
        ```bash
        pip install 'litellm[proxy]'
        litellm --model claude-opus-4-6
        ```
      </Step>
      <Step title="OpenClaw가 LiteLLM을 바라보도록 설정">
        ```bash
        export LITELLM_API_KEY="your-litellm-key"

        openclaw
        ```

        이게 전부입니다. 이제 OpenClaw가 LiteLLM 경유로 라우팅됩니다.
      </Step>
    </Steps>

  </Tab>
</Tabs>

## 설정

### 환경 변수

```bash
export LITELLM_API_KEY="sk-litellm-key"
```

### 설정 파일

```json5
{
  models: {
    providers: {
      litellm: {
        baseUrl: "http://localhost:4000",
        apiKey: "${LITELLM_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6",
            reasoning: true,
            input: ["text", "image"],
            contextWindow: 200000,
            maxTokens: 64000,
          },
          {
            id: "gpt-4o",
            name: "GPT-4o",
            reasoning: false,
            input: ["text", "image"],
            contextWindow: 128000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
  agents: {
    defaults: {
      model: { primary: "litellm/claude-opus-4-6" },
    },
  },
}
```

## 고급 설정

<AccordionGroup>
  <Accordion title="가상 키 (Virtual keys)">
    사용량 한도가 설정된 OpenClaw 전용 키를 생성합니다.

    ```bash
    curl -X POST "http://localhost:4000/key/generate" \
      -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "key_alias": "openclaw",
        "max_budget": 50.00,
        "budget_duration": "monthly"
      }'
    ```

    생성된 키를 `LITELLM_API_KEY`로 사용하세요.

  </Accordion>

  <Accordion title="모델 라우팅">
    LiteLLM은 모델 요청을 서로 다른 백엔드로 라우팅할 수 있습니다. LiteLLM `config.yaml`에 다음과 같이 설정합니다.

    ```yaml
    model_list:
      - model_name: claude-opus-4-6
        litellm_params:
          model: claude-opus-4-6
          api_key: os.environ/ANTHROPIC_API_KEY

      - model_name: gpt-4o
        litellm_params:
          model: gpt-4o
          api_key: os.environ/OPENAI_API_KEY
    ```

    OpenClaw는 계속 `claude-opus-4-6`을 요청하고, 라우팅은 LiteLLM이 처리합니다.

  </Accordion>

  <Accordion title="사용량 확인">
    LiteLLM 대시보드 또는 API에서 확인합니다.

    ```bash
    # 키 정보
    curl "http://localhost:4000/key/info" \
      -H "Authorization: Bearer sk-litellm-key"

    # 지출 로그
    curl "http://localhost:4000/spend/logs" \
      -H "Authorization: Bearer $LITELLM_MASTER_KEY"
    ```

  </Accordion>

  <Accordion title="프록시 동작에 대한 참고">
    - LiteLLM은 기본적으로 `http://localhost:4000`에서 실행됩니다
    - OpenClaw는 LiteLLM의 프록시 스타일 OpenAI 호환 `/v1`
      엔드포인트를 통해 연결됩니다
    - 네이티브 OpenAI 전용 요청 포맷팅(request shaping)은 LiteLLM 경유에서는 적용되지 않습니다.
      `service_tier`, Responses `store`, 프롬프트 캐시 힌트, OpenAI
      reasoning-compat 페이로드 포맷팅이 모두 적용되지 않습니다
    - 숨겨진 OpenClaw 귀속(attribution) 헤더(`originator`, `version`, `User-Agent`)는
      커스텀 LiteLLM base URL에서는 주입되지 않습니다
  </Accordion>
</AccordionGroup>

<Note>
일반적인 프로바이더 설정과 페일오버 동작은 [Model Providers](/concepts/model-providers)를 참고하세요.
</Note>

## 관련 문서

<CardGroup cols={2}>
  <Card title="LiteLLM 문서" href="https://docs.litellm.ai" icon="book">
    공식 LiteLLM 문서 및 API 레퍼런스.
  </Card>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    모든 프로바이더, 모델 ref, 페일오버 동작 개요.
  </Card>
  <Card title="설정" href="/gateway/configuration" icon="gear">
    전체 설정 레퍼런스.
  </Card>
  <Card title="모델 선택" href="/concepts/models" icon="brain">
    모델 선택과 설정 방법.
  </Card>
</CardGroup>
