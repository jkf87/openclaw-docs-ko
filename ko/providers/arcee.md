---
summary: "Arcee AI 설정 (인증 + 모델 선택)"
title: "Arcee AI"
read_when:
  - OpenClaw에서 Arcee AI를 사용하고 싶을 때
  - API 키 환경 변수 또는 CLI 인증 선택지가 필요할 때
---

[Arcee AI](https://arcee.ai)는 OpenAI 호환 API를 통해 Trinity 계열의 mixture-of-experts 모델에 대한 접근을 제공합니다. 모든 Trinity 모델은 Apache 2.0 라이선스로 배포됩니다.

Arcee AI 모델은 Arcee 플랫폼에서 직접 접근하거나 [OpenRouter](/providers/openrouter)를 통해 접근할 수 있습니다.

| 속성       | 값                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------- |
| 프로바이더 | `arcee`                                                                                   |
| 인증       | `ARCEEAI_API_KEY` (직접) 또는 `OPENROUTER_API_KEY` (OpenRouter 경유)                     |
| API        | OpenAI 호환                                                                               |
| Base URL   | `https://api.arcee.ai/api/v1` (직접) 또는 `https://openrouter.ai/api/v1` (OpenRouter)    |

## 시작하기

<Tabs>
  <Tab title="직접 (Arcee 플랫폼)">
    <Steps>
      <Step title="API 키 발급">
        [Arcee AI](https://chat.arcee.ai/)에서 API 키를 생성하세요.
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice arceeai-api-key
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "arcee/trinity-large-thinking" },
            },
          },
        }
        ```
      </Step>
    </Steps>
  </Tab>

  <Tab title="OpenRouter 경유">
    <Steps>
      <Step title="API 키 발급">
        [OpenRouter](https://openrouter.ai/keys)에서 API 키를 생성하세요.
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard --auth-choice arceeai-openrouter
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "arcee/trinity-large-thinking" },
            },
          },
        }
        ```

        동일한 모델 ref가 직접 설정과 OpenRouter 설정 모두에서 동작합니다(예: `arcee/trinity-large-thinking`).
      </Step>
    </Steps>

  </Tab>
</Tabs>

## 비대화형 설정

<Tabs>
  <Tab title="직접 (Arcee 플랫폼)">
    ```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice arceeai-api-key \
      --arceeai-api-key "$ARCEEAI_API_KEY"
    ```
  </Tab>

  <Tab title="OpenRouter 경유">
    ```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice arceeai-openrouter \
      --openrouter-api-key "$OPENROUTER_API_KEY"
    ```
  </Tab>
</Tabs>

## 내장 카탈로그

OpenClaw는 현재 다음의 번들 Arcee 카탈로그를 제공합니다.

| 모델 ref                       | 이름                   | 입력 | 컨텍스트 | 비용 (입력/출력 per 1M) | 비고                                         |
| ------------------------------ | ---------------------- | ---- | -------- | ----------------------- | -------------------------------------------- |
| `arcee/trinity-large-thinking` | Trinity Large Thinking | text | 256K     | $0.25 / $0.90           | 기본 모델; 추론(reasoning) 활성화            |
| `arcee/trinity-large-preview`  | Trinity Large Preview  | text | 128K     | $0.25 / $1.00           | 범용; 400B 파라미터, 13B 활성                |
| `arcee/trinity-mini`           | Trinity Mini 26B       | text | 128K     | $0.045 / $0.15          | 빠르고 비용 효율적; function calling 지원    |

<Tip>
온보딩 프리셋은 `arcee/trinity-large-thinking`를 기본 모델로 설정합니다.
</Tip>

## 지원 기능

| 기능                                          | 지원 여부                     |
| --------------------------------------------- | ----------------------------- |
| 스트리밍                                      | 지원                          |
| 툴 사용 / function calling                    | 지원                          |
| 구조화된 출력 (JSON 모드 및 JSON schema)      | 지원                          |
| 확장 사고(extended thinking)                  | 지원 (Trinity Large Thinking) |

<AccordionGroup>
  <Accordion title="환경 관련 주의사항">
    Gateway가 데몬(launchd/systemd)으로 실행 중이라면, `ARCEEAI_API_KEY`
    (또는 `OPENROUTER_API_KEY`)가 해당 프로세스에서 접근 가능한지 확인하세요
    (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).
  </Accordion>

  <Accordion title="OpenRouter 라우팅">
    OpenRouter를 통해 Arcee 모델을 사용할 때도 동일한 `arcee/*` 모델 ref가
    적용됩니다. OpenClaw는 인증 선택에 따라 투명하게 라우팅을 처리합니다.
    OpenRouter 고유의 설정 세부 사항은
    [OpenRouter 프로바이더 문서](/providers/openrouter)를 참고하세요.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="OpenRouter" href="/providers/openrouter" icon="shuffle">
    하나의 API 키로 Arcee 모델과 여러 모델에 접근.
  </Card>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택.
  </Card>
</CardGroup>
