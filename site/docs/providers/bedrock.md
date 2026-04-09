---
title: "Amazon Bedrock"
description: "OpenClaw에서 Amazon Bedrock (Converse API) 모델 사용"
---

# Amazon Bedrock

OpenClaw는 pi‑ai의 **Bedrock Converse** 스트리밍 프로바이더를 통해 **Amazon Bedrock** 모델을 사용할 수 있습니다. Bedrock 인증은 API 키가 아닌 **AWS SDK 기본 자격 증명 체인**을 사용합니다.

## pi-ai 지원 사항

- 프로바이더: `amazon-bedrock`
- API: `bedrock-converse-stream`
- 인증: AWS 자격 증명 (환경 변수, 공유 구성, 또는 인스턴스 역할)
- 리전: `AWS_REGION` 또는 `AWS_DEFAULT_REGION` (기본값: `us-east-1`)

## 자동 모델 검색

OpenClaw는 **스트리밍** 및 **텍스트 출력**을 지원하는 Bedrock 모델을 자동으로 검색할 수 있습니다. 검색에는 `bedrock:ListFoundationModels` 및 `bedrock:ListInferenceProfiles`가 사용되며, 결과는 캐시됩니다 (기본값: 1시간).

암묵적 프로바이더 활성화 방식:

- `plugins.entries.amazon-bedrock.config.discovery.enabled`가 `true`이면,
  OpenClaw는 AWS 환경 마커가 없더라도 검색을 시도합니다.
- `plugins.entries.amazon-bedrock.config.discovery.enabled`가 설정되지 않은 경우,
  OpenClaw는 다음 AWS 인증 마커 중 하나를 감지할 때만 암묵적 Bedrock 프로바이더를 자동으로 추가합니다:
  `AWS_BEARER_TOKEN_BEDROCK`, `AWS_ACCESS_KEY_ID` +
  `AWS_SECRET_ACCESS_KEY`, 또는 `AWS_PROFILE`.
- 실제 Bedrock 런타임 인증 경로는 여전히 AWS SDK 기본 체인을 사용하므로,
  검색에 `enabled: true`가 필요했더라도 공유 구성, SSO, IMDS 인스턴스 역할 인증이 작동할 수 있습니다.

구성 옵션은 `plugins.entries.amazon-bedrock.config.discovery` 아래에 있습니다:

```json5
{
  plugins: {
    entries: {
      "amazon-bedrock": {
        config: {
          discovery: {
            enabled: true,
            region: "us-east-1",
            providerFilter: ["anthropic", "amazon"],
            refreshInterval: 3600,
            defaultContextWindow: 32000,
            defaultMaxTokens: 4096,
          },
        },
      },
    },
  },
}
```

참고 사항:

- `enabled`는 기본적으로 자동 모드입니다. 자동 모드에서 OpenClaw는 지원되는 AWS 환경 마커를 감지할 때만 암묵적 Bedrock 프로바이더를 활성화합니다.
- `region`은 기본적으로 `AWS_REGION` 또는 `AWS_DEFAULT_REGION`, 그 다음 `us-east-1`입니다.
- `providerFilter`는 Bedrock 프로바이더 이름(예: `anthropic`)과 일치합니다.
- `refreshInterval`은 초 단위입니다; 캐싱을 비활성화하려면 `0`으로 설정하십시오.
- `defaultContextWindow` (기본값: `32000`) 및 `defaultMaxTokens` (기본값: `4096`)는
  검색된 모델에 사용됩니다 (모델 제한을 알고 있는 경우 재정의하십시오).
- 명시적 `models.providers["amazon-bedrock"]` 항목의 경우, OpenClaw는 `AWS_BEARER_TOKEN_BEDROCK`과 같은 AWS 환경 마커에서 Bedrock 환경 마커 인증을 조기에 처리할 수 있습니다. 실제 모델 호출 인증 경로는 여전히 AWS SDK 기본 체인을 사용합니다.

## 온보딩

1. **게이트웨이 호스트**에서 AWS 자격 증명이 사용 가능한지 확인하십시오:

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
# 선택 사항:
export AWS_SESSION_TOKEN="..."
export AWS_PROFILE="your-profile"
# 선택 사항 (Bedrock API 키/베어러 토큰):
export AWS_BEARER_TOKEN_BEDROCK="..."
```

2. 구성에 Bedrock 프로바이더와 모델 추가 (`apiKey` 불필요):

```json5
{
  models: {
    providers: {
      "amazon-bedrock": {
        baseUrl: "https://bedrock-runtime.us-east-1.amazonaws.com",
        api: "bedrock-converse-stream",
        auth: "aws-sdk",
        models: [
          {
            id: "us.anthropic.claude-opus-4-6-v1:0",
            name: "Claude Opus 4.6 (Bedrock)",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 200000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
  agents: {
    defaults: {
      model: { primary: "amazon-bedrock/us.anthropic.claude-opus-4-6-v1:0" },
    },
  },
}
```

## EC2 인스턴스 역할

IAM 역할이 연결된 EC2 인스턴스에서 OpenClaw를 실행하는 경우, AWS SDK는 인스턴스 메타데이터 서비스(IMDS)를 인증에 사용할 수 있습니다. Bedrock 모델 검색을 위해, OpenClaw는 `plugins.entries.amazon-bedrock.config.discovery.enabled: true`를 명시적으로 설정하지 않는 한 AWS 환경 마커에서만 암묵적 프로바이더를 자동으로 활성화합니다.

IMDS 기반 호스트에 권장되는 설정:

- `plugins.entries.amazon-bedrock.config.discovery.enabled`를 `true`로 설정하십시오.
- `plugins.entries.amazon-bedrock.config.discovery.region`을 설정하거나 (또는 `AWS_REGION` 내보내기).
- 가짜 API 키는 **필요하지 않습니다**.
- 자동 모드를 위한 환경 마커 또는 상태 표면이 필요한 경우에만 `AWS_PROFILE=default`가 필요합니다.

```bash
# 권장: 명시적 검색 활성화 + 리전
openclaw config set plugins.entries.amazon-bedrock.config.discovery.enabled true
openclaw config set plugins.entries.amazon-bedrock.config.discovery.region us-east-1

# 선택 사항: 명시적 활성화 없이 자동 모드를 원하는 경우 환경 마커 추가
export AWS_PROFILE=default
export AWS_REGION=us-east-1
```

**EC2 인스턴스 역할에 필요한 IAM 권한**:

- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream`
- `bedrock:ListFoundationModels` (자동 검색용)
- `bedrock:ListInferenceProfiles` (추론 프로필 검색용)

또는 관리형 정책 `AmazonBedrockFullAccess`를 연결하십시오.

## 빠른 설정 (AWS 경로)

```bash
# 1. IAM 역할 및 인스턴스 프로필 생성
aws iam create-role --role-name EC2-Bedrock-Access \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy --role-name EC2-Bedrock-Access \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

aws iam create-instance-profile --instance-profile-name EC2-Bedrock-Access
aws iam add-role-to-instance-profile \
  --instance-profile-name EC2-Bedrock-Access \
  --role-name EC2-Bedrock-Access

# 2. EC2 인스턴스에 연결
aws ec2 associate-iam-instance-profile \
  --instance-id i-xxxxx \
  --iam-instance-profile Name=EC2-Bedrock-Access

# 3. EC2 인스턴스에서 검색 명시적으로 활성화
openclaw config set plugins.entries.amazon-bedrock.config.discovery.enabled true
openclaw config set plugins.entries.amazon-bedrock.config.discovery.region us-east-1

# 4. 선택 사항: 명시적 활성화 없이 자동 모드를 원하는 경우 환경 마커 추가
echo 'export AWS_PROFILE=default' >> ~/.bashrc
echo 'export AWS_REGION=us-east-1' >> ~/.bashrc
source ~/.bashrc

# 5. 모델 검색 확인
openclaw models list
```

## 추론 프로필

OpenClaw는 파운데이션 모델과 함께 **리전 및 글로벌 추론 프로필**을 검색합니다. 프로필이 알려진 파운데이션 모델에 매핑되면, 프로필은 해당 모델의 기능(컨텍스트 창, 최대 토큰, 추론, 비전)을 상속하고 올바른 Bedrock 요청 리전이 자동으로 주입됩니다. 이는 수동 프로바이더 재정의 없이 교차 리전 Claude 프로필이 작동함을 의미합니다.

추론 프로필 ID는 `us.anthropic.claude-opus-4-6-v1:0` (리전) 또는 `anthropic.claude-opus-4-6-v1:0` (글로벌) 형태입니다. 지원 모델이 이미 검색 결과에 있으면 프로필이 전체 기능 세트를 상속합니다; 그렇지 않으면 안전한 기본값이 적용됩니다.

추가 구성이 필요하지 않습니다. 검색이 활성화되고 IAM 주체에 `bedrock:ListInferenceProfiles` 권한이 있으면 `openclaw models list`에서 파운데이션 모델과 함께 프로필이 나타납니다.

## 참고 사항

- Bedrock은 AWS 계정/리전에서 **모델 액세스**가 활성화되어 있어야 합니다.
- 자동 검색에는 `bedrock:ListFoundationModels` 및 `bedrock:ListInferenceProfiles` 권한이 필요합니다.
- 자동 모드를 사용하는 경우 게이트웨이 호스트에 지원되는 AWS 인증 환경 마커 중 하나를 설정하십시오. 환경 마커 없이 IMDS/공유 구성 인증을 선호하는 경우 `plugins.entries.amazon-bedrock.config.discovery.enabled: true`를 설정하십시오.
- OpenClaw는 다음 순서로 자격 증명 소스를 처리합니다: `AWS_BEARER_TOKEN_BEDROCK`, `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`, `AWS_PROFILE`, 기본 AWS SDK 체인.
- 추론 지원은 모델에 따라 다릅니다; 현재 기능에 대한 Bedrock 모델 카드를 확인하십시오.
- 관리형 키 흐름을 선호하는 경우, Bedrock 앞에 OpenAI‑호환 프록시를 배치하고 OpenAI 프로바이더로 구성할 수도 있습니다.

## 가드레일

`amazon-bedrock` 플러그인 구성에 `guardrail` 객체를 추가하여 모든 Bedrock 모델 호출에 [Amazon Bedrock 가드레일](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)을 적용할 수 있습니다. 가드레일을 통해 콘텐츠 필터링, 주제 차단, 단어 필터, 민감한 정보 필터, 상황별 검증을 시행할 수 있습니다.

```json5
{
  plugins: {
    entries: {
      "amazon-bedrock": {
        config: {
          guardrail: {
            guardrailIdentifier: "abc123", // 가드레일 ID 또는 전체 ARN
            guardrailVersion: "1", // 버전 번호 또는 "DRAFT"
            streamProcessingMode: "sync", // 선택 사항: "sync" 또는 "async"
            trace: "enabled", // 선택 사항: "enabled", "disabled", 또는 "enabled_full"
          },
        },
      },
    },
  },
}
```

- `guardrailIdentifier` (필수)는 가드레일 ID(예: `abc123`) 또는 전체 ARN(예: `arn:aws:bedrock:us-east-1:123456789012:guardrail/abc123`)을 허용합니다.
- `guardrailVersion` (필수)는 사용할 게시된 버전 또는 작업 초안의 경우 `"DRAFT"`를 지정합니다.
- `streamProcessingMode` (선택 사항)는 스트리밍 중 가드레일 평가가 동기(`"sync"`) 또는 비동기(`"async"`)로 실행되는지 제어합니다. 생략하면 Bedrock의 기본 동작을 사용합니다.
- `trace` (선택 사항)는 API 응답에서 가드레일 추적 출력을 활성화합니다. 디버깅을 위해 `"enabled"` 또는 `"enabled_full"`로 설정하고; 프로덕션에서는 생략하거나 `"disabled"`로 설정하십시오.

게이트웨이에서 사용하는 IAM 주체는 표준 호출 권한에 추가로 `bedrock:ApplyGuardrail` 권한이 있어야 합니다.

## 메모리 검색을 위한 임베딩

Bedrock은 [메모리 검색](/concepts/memory-search)을 위한 임베딩 프로바이더로도 사용할 수 있습니다. 이는 추론 프로바이더와 별도로 구성됩니다 — `agents.defaults.memorySearch.provider`를 `"bedrock"`으로 설정하십시오:

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "bedrock",
        model: "amazon.titan-embed-text-v2:0", // 기본값
      },
    },
  },
}
```

Bedrock 임베딩은 추론과 동일한 AWS SDK 자격 증명 체인(인스턴스 역할, SSO, 액세스 키, 공유 구성, 웹 ID)을 사용합니다. API 키가 필요하지 않습니다. `provider`가 `"auto"`인 경우 해당 자격 증명 체인이 성공적으로 확인되면 Bedrock이 자동으로 감지됩니다.

지원되는 임베딩 모델로는 Amazon Titan Embed (v1, v2), Amazon Nova Embed, Cohere Embed (v3, v4), TwelveLabs Marengo가 있습니다. 전체 모델 목록 및 차원 옵션은 [메모리 구성 참조 — Bedrock](/reference/memory-config#bedrock-embedding-config)을 참조하십시오.
