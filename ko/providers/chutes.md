---
summary: "Chutes 설정 (OAuth 또는 API 키, 모델 디스커버리, 별칭)"
title: "Chutes"
read_when:
  - OpenClaw에서 Chutes를 사용하고 싶을 때
  - OAuth 또는 API 키 설정 경로가 필요할 때
  - 기본 모델, 별칭, 디스커버리 동작을 확인하고 싶을 때
---

[Chutes](https://chutes.ai)는 OpenAI 호환 API를 통해 오픈소스 모델 카탈로그를
노출합니다. OpenClaw는 번들 `chutes` 프로바이더에 대해 브라우저 OAuth와 직접
API 키 인증을 모두 지원합니다.

| 속성       | 값                              |
| ---------- | ------------------------------- |
| 프로바이더 | `chutes`                        |
| API        | OpenAI 호환                     |
| Base URL   | `https://llm.chutes.ai/v1`      |
| 인증       | OAuth 또는 API 키 (아래 참조)   |

## 시작하기

<Tabs>
  <Tab title="OAuth">
    <Steps>
      <Step title="OAuth 온보딩 플로우 실행">
        ```bash
        openclaw onboard --auth-choice chutes
        ```
        OpenClaw는 로컬에서 브라우저 플로우를 실행하거나, 원격/헤드리스 호스트에서는
        URL + 리다이렉트 붙여넣기 플로우를 표시합니다. OAuth 토큰은 OpenClaw 인증
        프로파일을 통해 자동으로 갱신됩니다.
      </Step>
      <Step title="기본 모델 확인">
        온보딩이 끝나면 기본 모델은 `chutes/zai-org/GLM-4.7-TEE`로 설정되고,
        번들 Chutes 카탈로그가 등록됩니다.
      </Step>
    </Steps>
  </Tab>
  <Tab title="API 키">
    <Steps>
      <Step title="API 키 발급">
        [chutes.ai/settings/api-keys](https://chutes.ai/settings/api-keys)에서
        키를 생성하세요.
      </Step>
      <Step title="API 키 온보딩 플로우 실행">
        ```bash
        openclaw onboard --auth-choice chutes-api-key
        ```
      </Step>
      <Step title="기본 모델 확인">
        온보딩이 끝나면 기본 모델은 `chutes/zai-org/GLM-4.7-TEE`로 설정되고,
        번들 Chutes 카탈로그가 등록됩니다.
      </Step>
    </Steps>
  </Tab>
</Tabs>

<Note>
두 인증 경로 모두 번들 Chutes 카탈로그를 등록하고 기본 모델을
`chutes/zai-org/GLM-4.7-TEE`로 설정합니다. 런타임 환경 변수: `CHUTES_API_KEY`,
`CHUTES_OAUTH_TOKEN`.
</Note>

## 디스커버리 동작

Chutes 인증이 가능한 경우, OpenClaw는 해당 자격증명으로 Chutes 카탈로그를
조회하고 발견된 모델을 사용합니다. 디스커버리에 실패하면, OpenClaw는 번들된
정적 카탈로그로 폴백하여 온보딩과 시작 과정이 계속 동작하도록 합니다.

## 기본 별칭

OpenClaw는 번들 Chutes 카탈로그에 대해 편의 별칭 세 개를 등록합니다.

| 별칭            | 대상 모델                                              |
| --------------- | ------------------------------------------------------ |
| `chutes-fast`   | `chutes/zai-org/GLM-4.7-FP8`                           |
| `chutes-pro`    | `chutes/deepseek-ai/DeepSeek-V3.2-TEE`                 |
| `chutes-vision` | `chutes/chutesai/Mistral-Small-3.2-24B-Instruct-2506`  |

## 내장 스타터 카탈로그

번들 폴백 카탈로그에는 현재 Chutes ref가 포함되어 있습니다.

| 모델 ref                                              |
| ----------------------------------------------------- |
| `chutes/zai-org/GLM-4.7-TEE`                          |
| `chutes/zai-org/GLM-5-TEE`                            |
| `chutes/deepseek-ai/DeepSeek-V3.2-TEE`                |
| `chutes/deepseek-ai/DeepSeek-R1-0528-TEE`             |
| `chutes/moonshotai/Kimi-K2.5-TEE`                     |
| `chutes/chutesai/Mistral-Small-3.2-24B-Instruct-2506` |
| `chutes/Qwen/Qwen3-Coder-Next-TEE`                    |
| `chutes/openai/gpt-oss-120b-TEE`                      |

## 설정 예시

```json5
{
  agents: {
    defaults: {
      model: { primary: "chutes/zai-org/GLM-4.7-TEE" },
      models: {
        "chutes/zai-org/GLM-4.7-TEE": { alias: "Chutes GLM 4.7" },
        "chutes/deepseek-ai/DeepSeek-V3.2-TEE": { alias: "Chutes DeepSeek V3.2" },
      },
    },
  },
}
```

<AccordionGroup>
  <Accordion title="OAuth 오버라이드">
    선택적 환경 변수를 사용해 OAuth 플로우를 커스터마이즈할 수 있습니다.

    | 변수 | 용도 |
    | ---- | ---- |
    | `CHUTES_CLIENT_ID` | 커스텀 OAuth 클라이언트 ID |
    | `CHUTES_CLIENT_SECRET` | 커스텀 OAuth 클라이언트 시크릿 |
    | `CHUTES_OAUTH_REDIRECT_URI` | 커스텀 리다이렉트 URI |
    | `CHUTES_OAUTH_SCOPES` | 커스텀 OAuth 스코프 |

    리다이렉트 앱 요구사항과 도움말은
    [Chutes OAuth 문서](https://chutes.ai/docs/sign-in-with-chutes/overview)를
    참고하세요.

  </Accordion>

  <Accordion title="참고">
    - API 키와 OAuth 디스커버리 모두 동일한 `chutes` 프로바이더 id를 사용합니다.
    - Chutes 모델은 `chutes/<model-id>` 형태로 등록됩니다.
    - 시작 시 디스커버리에 실패하면, 번들된 정적 카탈로그가 자동으로 사용됩니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 규칙, 모델 ref, 페일오버 동작.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    프로바이더 설정을 포함한 전체 설정 스키마.
  </Card>
  <Card title="Chutes" href="https://chutes.ai" icon="arrow-up-right-from-square">
    Chutes 대시보드와 API 문서.
  </Card>
  <Card title="Chutes API 키" href="https://chutes.ai/settings/api-keys" icon="key">
    Chutes API 키 생성 및 관리.
  </Card>
</CardGroup>
