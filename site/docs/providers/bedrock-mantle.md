---
title: "Amazon Bedrock Mantle"
description: "OpenClaw에서 Amazon Bedrock Mantle (OpenAI 호환) 모델 사용"
---

# Amazon Bedrock Mantle

OpenClaw에는 Mantle OpenAI 호환 엔드포인트에 연결하는 번들 **Amazon Bedrock Mantle** 프로바이더가 포함되어 있습니다. Mantle은 Bedrock 인프라를 통해 표준 `/v1/chat/completions` 인터페이스를 제공하는 오픈소스 및 서드파티 모델(GPT-OSS, Qwen, Kimi, GLM 등)을 호스팅합니다.

## OpenClaw 지원 사항

- 프로바이더: `amazon-bedrock-mantle`
- API: `openai-completions` (OpenAI 호환)
- 인증: 명시적 `AWS_BEARER_TOKEN_BEDROCK` 또는 IAM 자격 증명 체인 베어러 토큰 생성
- 리전: `AWS_REGION` 또는 `AWS_DEFAULT_REGION` (기본값: `us-east-1`)

## 자동 모델 검색

`AWS_BEARER_TOKEN_BEDROCK`이 설정된 경우 OpenClaw가 직접 사용합니다. 그렇지 않으면 OpenClaw는 공유 자격 증명/구성 프로필, SSO, 웹 ID, 인스턴스 또는 태스크 역할을 포함한 AWS 기본 자격 증명 체인에서 Mantle 베어러 토큰 생성을 시도합니다. 그런 다음 리전의 `/v1/models` 엔드포인트를 쿼리하여 사용 가능한 Mantle 모델을 검색합니다. 검색 결과는 1시간 동안 캐시되며 IAM 파생 베어러 토큰은 매시간 갱신됩니다.

지원 리전: `us-east-1`, `us-east-2`, `us-west-2`, `ap-northeast-1`,
`ap-south-1`, `ap-southeast-3`, `eu-central-1`, `eu-west-1`, `eu-west-2`,
`eu-south-1`, `eu-north-1`, `sa-east-1`.

## 온보딩

1. **게이트웨이 호스트**에서 인증 경로 중 하나를 선택하십시오:

명시적 베어러 토큰:

```bash
export AWS_BEARER_TOKEN_BEDROCK="..."
# 선택 사항 (기본값: us-east-1):
export AWS_REGION="us-west-2"
```

IAM 자격 증명:

```bash
# 여기에 AWS SDK 호환 인증 소스가 작동합니다, 예를 들어:
export AWS_PROFILE="default"
export AWS_REGION="us-west-2"
```

2. 모델 검색 확인:

```bash
openclaw models list
```

검색된 모델은 `amazon-bedrock-mantle` 프로바이더 아래에 나타납니다. 기본값을 재정의하려는 경우가 아니면 추가 구성이 필요하지 않습니다.

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

## 참고 사항

- `AWS_BEARER_TOKEN_BEDROCK`이 설정되지 않은 경우 OpenClaw는 AWS SDK 호환 IAM 자격 증명에서 Mantle 베어러 토큰을 생성할 수 있습니다.
- 베어러 토큰은 표준 [Amazon Bedrock](/providers/bedrock) 프로바이더에서 사용하는 것과 동일한 `AWS_BEARER_TOKEN_BEDROCK`입니다.
- 추론 지원은 `thinking`, `reasoner`, `gpt-oss-120b`와 같은 패턴을 포함하는 모델 ID에서 추론됩니다.
- Mantle 엔드포인트를 사용할 수 없거나 모델을 반환하지 않는 경우, 프로바이더는 자동으로 건너뜁니다.
