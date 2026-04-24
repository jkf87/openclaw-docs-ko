---
summary: "DeepSeek 설정 (인증 + 모델 선택)"
title: "DeepSeek"
read_when:
  - OpenClaw에서 DeepSeek를 사용하고 싶을 때
  - API 키 환경 변수 또는 CLI 인증 선택지가 필요할 때
---

[DeepSeek](https://www.deepseek.com)는 OpenAI 호환 API를 통해 강력한 AI 모델을 제공합니다.

| 속성       | 값                         |
| ---------- | -------------------------- |
| 프로바이더 | `deepseek`                 |
| 인증       | `DEEPSEEK_API_KEY`         |
| API        | OpenAI 호환                |
| Base URL   | `https://api.deepseek.com` |

## 시작하기

<Steps>
  <Step title="API 키 발급">
    [platform.deepseek.com](https://platform.deepseek.com/api_keys)에서 API 키를 생성하세요.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice deepseek-api-key
    ```

    이 명령은 API 키 입력을 요청하고 `deepseek/deepseek-chat`을 기본 모델로 설정합니다.

  </Step>
  <Step title="모델이 사용 가능한지 확인">
    ```bash
    openclaw models list --provider deepseek
    ```
  </Step>
</Steps>

<AccordionGroup>
  <Accordion title="비대화형 설정">
    스크립트 또는 헤드리스 설치의 경우, 모든 플래그를 직접 전달하세요.

    ```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice deepseek-api-key \
      --deepseek-api-key "$DEEPSEEK_API_KEY" \
      --skip-health \
      --accept-risk
    ```

  </Accordion>
</AccordionGroup>

<Warning>
Gateway가 데몬(launchd/systemd)으로 실행 중이라면, `DEEPSEEK_API_KEY`가
해당 프로세스에서 접근 가능한지 확인하세요 (예: `~/.openclaw/.env` 또는
`env.shellEnv`를 통해).
</Warning>

## 내장 카탈로그

| 모델 ref                     | 이름              | 입력 | 컨텍스트 | 최대 출력 | 비고                                                 |
| ---------------------------- | ----------------- | ---- | -------- | --------- | ---------------------------------------------------- |
| `deepseek/deepseek-chat`     | DeepSeek Chat     | text | 131,072  | 8,192     | 기본 모델; DeepSeek V3.2 non-thinking 표면           |
| `deepseek/deepseek-reasoner` | DeepSeek Reasoner | text | 131,072  | 65,536    | 추론(reasoning)이 활성화된 V3.2 표면                 |

<Tip>
번들된 두 모델 모두 현재 소스에서 스트리밍 사용량 호환성을 명시하고 있습니다.
</Tip>

## 설정 예시

```json5
{
  env: { DEEPSEEK_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "deepseek/deepseek-chat" },
    },
  },
}
```

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 ref, 페일오버 동작 선택.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    에이전트, 모델, 프로바이더에 대한 전체 설정 레퍼런스.
  </Card>
</CardGroup>
