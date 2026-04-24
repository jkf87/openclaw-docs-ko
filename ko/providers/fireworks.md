---
summary: "Fireworks 설정 (인증 + 모델 선택)"
title: "Fireworks"
read_when:
  - OpenClaw에서 Fireworks를 사용하고 싶을 때
  - Fireworks API 키 환경 변수 또는 기본 모델 id가 필요할 때
---

[Fireworks](https://fireworks.ai)는 OpenAI 호환 API를 통해 open-weight 및 라우팅 모델을 제공합니다. OpenClaw는 번들 Fireworks 프로바이더 플러그인을 포함합니다.

| 속성       | 값                                                      |
| ---------- | ------------------------------------------------------- |
| 프로바이더 | `fireworks`                                             |
| 인증       | `FIREWORKS_API_KEY`                                     |
| API        | OpenAI 호환 chat/completions                            |
| Base URL   | `https://api.fireworks.ai/inference/v1`                 |
| 기본 모델  | `fireworks/accounts/fireworks/routers/kimi-k2p5-turbo`  |

## 시작하기

<Steps>
  <Step title="온보딩으로 Fireworks 인증 설정">
    ```bash
    openclaw onboard --auth-choice fireworks-api-key
    ```

    이 명령은 Fireworks 키를 OpenClaw 설정에 저장하고 Fire Pass 스타터 모델을 기본 모델로 설정합니다.

  </Step>
  <Step title="모델이 사용 가능한지 확인">
    ```bash
    openclaw models list --provider fireworks
    ```
  </Step>
</Steps>

## 비대화형 예시

스크립트 또는 CI 설정의 경우, 모든 값을 커맨드라인으로 전달하세요.

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice fireworks-api-key \
  --fireworks-api-key "$FIREWORKS_API_KEY" \
  --skip-health \
  --accept-risk
```

## 내장 카탈로그

| 모델 ref                                               | 이름                        | 입력       | 컨텍스트 | 최대 출력 | 비고                                                                                                                                                               |
| ------------------------------------------------------ | --------------------------- | ---------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fireworks/accounts/fireworks/models/kimi-k2p6`        | Kimi K2.6                   | text,image | 262,144  | 262,144   | Fireworks의 최신 Kimi 모델. Fireworks K2.6 요청에서는 thinking이 비활성화되어 있으며, Kimi thinking 출력이 필요하면 Moonshot을 통해 직접 라우팅하세요.             |
| `fireworks/accounts/fireworks/routers/kimi-k2p5-turbo` | Kimi K2.5 Turbo (Fire Pass) | text,image | 256,000  | 256,000   | Fireworks의 기본 번들 스타터 모델                                                                                                                                  |

<Tip>
Fireworks에서 새로운 Qwen이나 Gemma 릴리스 같은 신규 모델을 공개한다면, 번들 카탈로그 업데이트를 기다릴 필요 없이 해당 Fireworks 모델 id를 사용하여 바로 전환할 수 있습니다.
</Tip>

## 커스텀 Fireworks 모델 id

OpenClaw는 동적 Fireworks 모델 id도 허용합니다. Fireworks에서 표시하는 정확한 모델 id 또는 라우터 id를 사용하고 `fireworks/` 접두사를 붙이세요.

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "fireworks/accounts/fireworks/routers/kimi-k2p5-turbo",
      },
    },
  },
}
```

<AccordionGroup>
  <Accordion title="모델 id 접두사 동작 방식">
    OpenClaw의 모든 Fireworks 모델 ref는 `fireworks/`로 시작하고, 그 뒤에 Fireworks 플랫폼의 정확한 id 또는 라우터 경로가 따라옵니다. 예를 들면:

    - 라우터 모델: `fireworks/accounts/fireworks/routers/kimi-k2p5-turbo`
    - 직접 모델: `fireworks/accounts/fireworks/models/<model-name>`

    OpenClaw는 API 요청을 구성할 때 `fireworks/` 접두사를 제거하고 나머지 경로를 Fireworks 엔드포인트로 전송합니다.

  </Accordion>

  <Accordion title="환경 관련 주의사항">
    Gateway가 대화형 셸 밖에서 실행 중이라면, `FIREWORKS_API_KEY`가 해당 프로세스에서도 접근 가능한지 확인하세요.

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
