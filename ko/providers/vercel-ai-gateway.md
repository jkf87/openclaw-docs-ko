---
summary: "Vercel AI Gateway 설정 (인증 + 모델 선택)"
title: "Vercel AI gateway"
read_when:
  - OpenClaw에서 Vercel AI Gateway를 사용하고 싶을 때
  - API 키 환경 변수 또는 CLI 인증 선택지가 필요할 때
---

[Vercel AI Gateway](https://vercel.com/ai-gateway)는 단일 엔드포인트로 수백 개의
모델에 접근할 수 있는 통합 API를 제공합니다.

| 항목           | 값                                 |
| -------------- | -------------------------------- |
| Provider       | `vercel-ai-gateway`              |
| 인증           | `AI_GATEWAY_API_KEY`             |
| API            | Anthropic Messages 호환          |
| 모델 카탈로그  | `/v1/models`를 통한 자동 탐색    |

<Tip>
OpenClaw는 Gateway `/v1/models` 카탈로그를 자동으로 탐색하므로,
`/models vercel-ai-gateway`에는 `vercel-ai-gateway/openai/gpt-5.5`와
`vercel-ai-gateway/moonshotai/kimi-k2.6`와 같은 최신 모델 ref가 포함됩니다.
</Tip>

## 시작하기

<Steps>
  <Step title="API 키 설정">
    온보딩을 실행하고 AI Gateway 인증 옵션을 선택하십시오:

    ```bash
    openclaw onboard --auth-choice ai-gateway-api-key
    ```

  </Step>
  <Step title="기본 모델 설정">
    OpenClaw 설정에 모델을 추가하십시오:

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4.6" },
        },
      },
    }
    ```

  </Step>
  <Step title="모델 사용 가능 여부 확인">
    ```bash
    openclaw models list --provider vercel-ai-gateway
    ```
  </Step>
</Steps>

## 비대화형 예시

스크립트나 CI 설정에서는 모든 값을 커맨드 라인으로 전달하십시오:

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY"
```

## 모델 ID 단축 표기

OpenClaw는 Vercel Claude 단축 모델 ref를 허용하며 런타임에 정규화합니다:

| 입력 단축 표기                      | 정규화된 모델 ref                             |
| ----------------------------------- | --------------------------------------------- |
| `vercel-ai-gateway/claude-opus-4.6` | `vercel-ai-gateway/anthropic/claude-opus-4.6` |
| `vercel-ai-gateway/opus-4.6`        | `vercel-ai-gateway/anthropic/claude-opus-4-6` |

<Tip>
설정에서 단축 표기 또는 정규화된 모델 ref 중 어떤 것이든 사용할 수 있습니다.
OpenClaw가 canonical 형식으로 자동 해석합니다.
</Tip>

## 고급 설정

<AccordionGroup>
  <Accordion title="데몬 프로세스를 위한 환경 변수">
    OpenClaw Gateway가 데몬(launchd/systemd)으로 실행되는 경우, 해당 프로세스에서
    `AI_GATEWAY_API_KEY`를 사용할 수 있도록 하십시오.

    <Warning>
    `~/.profile`에만 설정된 키는 launchd/systemd 데몬이 해당 환경을 명시적으로
    가져오지 않는 한 보이지 않습니다. gateway 프로세스가 읽을 수 있도록
    `~/.openclaw/.env`나 `env.shellEnv`를 통해 키를 설정하십시오.
    </Warning>

  </Accordion>

  <Accordion title="프로바이더 라우팅">
    Vercel AI Gateway는 모델 ref 접두어를 기준으로 요청을 상위 프로바이더로
    라우팅합니다. 예를 들어 `vercel-ai-gateway/anthropic/claude-opus-4.6`은
    Anthropic으로, `vercel-ai-gateway/openai/gpt-5.5`는 OpenAI로,
    `vercel-ai-gateway/moonshotai/kimi-k2.6`은 MoonshotAI로 라우팅됩니다.
    단일 `AI_GATEWAY_API_KEY`가 모든 상위 프로바이더에 대한 인증을 처리합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, failover 동작 선택.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반적인 문제 해결 및 FAQ.
  </Card>
</CardGroup>
