---
summary: "OpenClaw에서 Amazon Bedrock Mantle (OpenAI 호환) 모델 사용"
read_when:
  - OpenClaw에서 Bedrock Mantle 호스팅 OSS 모델을 사용하려는 경우
  - GPT-OSS, Qwen, Kimi, GLM을 위한 Mantle OpenAI 호환 엔드포인트가 필요한 경우
title: "Amazon Bedrock Mantle"
---

OpenClaw에는 Mantle OpenAI 호환 엔드포인트에 연결되는 번들 **Amazon Bedrock Mantle**
프로바이더가 포함되어 있습니다. Mantle은 Bedrock 인프라로 뒷받침되는
표준 `/v1/chat/completions` 인터페이스를 통해 오픈소스 및 서드파티 모델
(GPT-OSS, Qwen, Kimi, GLM 등)을 호스팅합니다.

| 속성           | 값                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------- |
| 프로바이더 ID  | `amazon-bedrock-mantle`                                                                     |
| API            | `openai-completions` (OpenAI 호환) 또는 `anthropic-messages` (Anthropic Messages 경로)      |
| 인증           | 명시적 `AWS_BEARER_TOKEN_BEDROCK` 또는 IAM 자격 증명 체인 베어러 토큰 생성                    |
| 기본 리전      | `us-east-1` (`AWS_REGION` 또는 `AWS_DEFAULT_REGION`으로 재정의)                              |

## 시작하기

선호하는 인증 방법을 선택하고 설정 단계를 따라 진행해 주십시오.

<Tabs>
  <Tab title="명시적 베어러 토큰">
    **적합한 경우:** Mantle 베어러 토큰을 이미 가지고 있는 환경.

    <Steps>
      <Step title="게이트웨이 호스트에 베어러 토큰 설정">
        ```bash
        export AWS_BEARER_TOKEN_BEDROCK="..."
        ```

        선택적으로 리전 설정 (기본값은 `us-east-1`):

        ```bash
        export AWS_REGION="us-west-2"
        ```
      </Step>
      <Step title="모델 검색 확인">
        ```bash
        openclaw models list
        ```

        검색된 모델은 `amazon-bedrock-mantle` 프로바이더 아래에 나타납니다. 기본값을
        재정의하려는 경우가 아니면 추가 구성이 필요하지 않습니다.
      </Step>
    </Steps>

  </Tab>

  <Tab title="IAM 자격 증명">
    **적합한 경우:** AWS SDK 호환 자격 증명 (공유 구성, SSO, 웹 ID, 인스턴스 또는 태스크 역할) 사용.

    <Steps>
      <Step title="게이트웨이 호스트에 AWS 자격 증명 구성">
        모든 AWS SDK 호환 인증 소스가 작동합니다:

        ```bash
        export AWS_PROFILE="default"
        export AWS_REGION="us-west-2"
        ```
      </Step>
      <Step title="모델 검색 확인">
        ```bash
        openclaw models list
        ```

        OpenClaw는 자격 증명 체인에서 Mantle 베어러 토큰을 자동으로 생성합니다.
      </Step>
    </Steps>

    <Tip>
    `AWS_BEARER_TOKEN_BEDROCK`이 설정되지 않은 경우 OpenClaw는 공유 자격 증명/구성 프로필, SSO, 웹 ID, 인스턴스 또는 태스크 역할을 포함한 AWS 기본 자격 증명 체인에서 베어러 토큰을 발급받습니다.
    </Tip>

  </Tab>
</Tabs>

## 자동 모델 검색

`AWS_BEARER_TOKEN_BEDROCK`이 설정된 경우 OpenClaw가 직접 사용합니다. 그렇지 않으면,
OpenClaw는 AWS 기본 자격 증명 체인에서 Mantle 베어러 토큰 생성을 시도합니다.
그런 다음 리전의 `/v1/models` 엔드포인트를 쿼리하여 사용 가능한 Mantle 모델을
검색합니다.

| 동작              | 세부 사항                     |
| ----------------- | ----------------------------- |
| 검색 캐시         | 결과는 1시간 동안 캐시됨       |
| IAM 토큰 갱신     | 매시간                        |

<Note>
베어러 토큰은 표준 [Amazon Bedrock](/providers/bedrock) 프로바이더가 사용하는 것과 동일한 `AWS_BEARER_TOKEN_BEDROCK`입니다.
</Note>

### 지원 리전

`us-east-1`, `us-east-2`, `us-west-2`, `ap-northeast-1`,
`ap-south-1`, `ap-southeast-3`, `eu-central-1`, `eu-west-1`, `eu-west-2`,
`eu-south-1`, `eu-north-1`, `sa-east-1`.

## 수동 구성

자동 검색 대신 명시적 구성을 선호하는 경우:

```json5
{
  models: {
    providers: {
      "amazon-bedrock-mantle": {
        baseUrl: "https://bedrock-mantle.us-east-1.api.aws/v1",
        api: "openai-completions",
        auth: "api-key",
        apiKey: "env:AWS_BEARER_TOKEN_BEDROCK",
        models: [
          {
            id: "gpt-oss-120b",
            name: "GPT-OSS 120B",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 32000,
            maxTokens: 4096,
          },
        ],
      },
    },
  },
}
```

## 고급 구성

<AccordionGroup>
  <Accordion title="추론 지원">
    추론 지원은 `thinking`, `reasoner`, `gpt-oss-120b` 같은 패턴을 포함하는
    모델 ID에서 추론됩니다. OpenClaw는 검색 중 일치하는 모델에 대해
    `reasoning: true`를 자동으로 설정합니다.
  </Accordion>

  <Accordion title="엔드포인트 가용 불가">
    Mantle 엔드포인트를 사용할 수 없거나 모델을 반환하지 않는 경우, 프로바이더는
    자동으로 건너뜁니다. OpenClaw는 오류를 발생시키지 않으며; 다른 구성된
    프로바이더는 정상적으로 계속 작동합니다.
  </Accordion>

  <Accordion title="Anthropic Messages 경로를 통한 Claude Opus 4.7">
    Mantle은 동일한 베어러 인증 스트리밍 경로를 통해 Claude 모델을 전달하는 Anthropic Messages 경로도 노출합니다. Claude Opus 4.7 (`amazon-bedrock-mantle/claude-opus-4.7`)은 프로바이더 소유 스트리밍을 사용하여 이 경로를 통해 호출할 수 있으므로, AWS 베어러 토큰이 Anthropic API 키처럼 취급되지 않습니다.

    Mantle 프로바이더에서 Anthropic Messages 모델을 고정하면, OpenClaw는 해당 모델에 대해 `openai-completions` 대신 `anthropic-messages` API 표면을 사용합니다. 인증은 여전히 `AWS_BEARER_TOKEN_BEDROCK` (또는 발급된 IAM 베어러 토큰)에서 가져옵니다.

    ```json5
    {
      models: {
        providers: {
          "amazon-bedrock-mantle": {
            models: [
              {
                id: "claude-opus-4.7",
                name: "Claude Opus 4.7",
                api: "anthropic-messages",
                reasoning: true,
                input: ["text", "image"],
                contextWindow: 1000000,
                maxTokens: 32000,
              },
            ],
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="Amazon Bedrock 프로바이더와의 관계">
    Bedrock Mantle은 표준 [Amazon Bedrock](/providers/bedrock) 프로바이더와는
    별개의 프로바이더입니다. Mantle은 OpenAI 호환 `/v1` 표면을 사용하는 반면,
    표준 Bedrock 프로바이더는 네이티브 Bedrock API를 사용합니다.

    두 프로바이더는 존재하는 경우 동일한 `AWS_BEARER_TOKEN_BEDROCK` 자격 증명을
    공유합니다.

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Amazon Bedrock" href="/providers/bedrock" icon="cloud">
    Anthropic Claude, Titan 및 기타 모델을 위한 네이티브 Bedrock 프로바이더.
  </Card>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 참조, 페일오버 동작 선택.
  </Card>
  <Card title="OAuth 및 인증" href="/gateway/authentication" icon="key">
    인증 세부 사항 및 자격 증명 재사용 규칙.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반적인 문제 및 해결 방법.
  </Card>
</CardGroup>
