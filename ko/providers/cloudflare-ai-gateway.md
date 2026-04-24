---
summary: "Cloudflare AI Gateway 설정 (인증 + 모델 선택)"
title: "Cloudflare AI gateway"
read_when:
  - OpenClaw에서 Cloudflare AI Gateway를 사용하고 싶을 때
  - 계정 ID, 게이트웨이 ID, 또는 API 키 환경 변수가 필요할 때
---

Cloudflare AI Gateway는 프로바이더 API 앞단에 위치하여 애널리틱스, 캐싱, 컨트롤을 추가할 수 있게 해줍니다. Anthropic의 경우, OpenClaw는 Gateway 엔드포인트를 통해 Anthropic Messages API를 사용합니다.

| 속성          | 값                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------- |
| 프로바이더    | `cloudflare-ai-gateway`                                                                   |
| Base URL      | `https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway_id>/anthropic`                |
| 기본 모델     | `cloudflare-ai-gateway/claude-sonnet-4-6`                                                 |
| API 키        | `CLOUDFLARE_AI_GATEWAY_API_KEY` (Gateway를 통한 요청에 사용할 프로바이더 API 키)          |

<Note>
Cloudflare AI Gateway를 통해 라우팅되는 Anthropic 모델의 경우, 프로바이더 키로 **Anthropic API 키**를 사용합니다.
</Note>

## 시작하기

<Steps>
  <Step title="프로바이더 API 키와 Gateway 정보 설정">
    온보딩을 실행하고 Cloudflare AI Gateway 인증 옵션을 선택하세요.

    ```bash
    openclaw onboard --auth-choice cloudflare-ai-gateway-api-key
    ```

    이 과정에서 계정 ID, 게이트웨이 ID, API 키를 입력하라는 프롬프트가 표시됩니다.

  </Step>
  <Step title="기본 모델 설정">
    OpenClaw 설정에 모델을 추가하세요.

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "cloudflare-ai-gateway/claude-sonnet-4-6" },
        },
      },
    }
    ```

  </Step>
  <Step title="모델이 사용 가능한지 확인">
    ```bash
    openclaw models list --provider cloudflare-ai-gateway
    ```
  </Step>
</Steps>

## 비대화형 예시

스크립트 또는 CI 설정의 경우, 모든 값을 커맨드라인으로 전달하세요.

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice cloudflare-ai-gateway-api-key \
  --cloudflare-ai-gateway-account-id "your-account-id" \
  --cloudflare-ai-gateway-gateway-id "your-gateway-id" \
  --cloudflare-ai-gateway-api-key "$CLOUDFLARE_AI_GATEWAY_API_KEY"
```

## 고급 설정

<AccordionGroup>
  <Accordion title="인증이 필요한 게이트웨이">
    Cloudflare에서 Gateway 인증을 활성화한 경우, `cf-aig-authorization` 헤더를 추가하세요. 이는 프로바이더 API 키에 **추가로** 필요합니다.

    ```json5
    {
      models: {
        providers: {
          "cloudflare-ai-gateway": {
            headers: {
              "cf-aig-authorization": "Bearer <cloudflare-ai-gateway-token>",
            },
          },
        },
      },
    }
    ```

    <Tip>
    `cf-aig-authorization` 헤더는 Cloudflare Gateway 자체를 인증하고, 프로바이더 API 키(예: Anthropic 키)는 상류의 프로바이더를 인증합니다.
    </Tip>

  </Accordion>

  <Accordion title="환경 관련 주의사항">
    Gateway가 데몬(launchd/systemd)으로 실행 중이라면, `CLOUDFLARE_AI_GATEWAY_API_KEY`가 해당 프로세스에서 접근 가능한지 확인하세요.

    <Warning>
    `~/.profile`에만 설정된 키는 해당 환경이 거기에서도 임포트되지 않는 한 launchd/systemd 데몬에는 도움이 되지 않습니다. 게이트웨이 프로세스가 키를 읽을 수 있도록 `~/.openclaw/.env` 또는 `env.shellEnv`에 키를 설정하세요.
    </Warning>

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반 문제 해결 및 FAQ.
  </Card>
</CardGroup>
