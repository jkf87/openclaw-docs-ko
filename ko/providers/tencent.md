---
summary: "Hy3 preview를 위한 Tencent Cloud TokenHub 설정"
title: "Tencent Cloud (TokenHub)"
read_when:
  - OpenClaw에서 Tencent Hy3 preview를 사용하려는 경우
  - TokenHub API 키 설정이 필요한 경우
---

# Tencent Cloud TokenHub

Tencent Cloud는 OpenClaw에 **번들 provider 플러그인**으로 제공됩니다. TokenHub 엔드포인트(`tencent-tokenhub`)를 통해 Tencent Hy3 preview에 접근할 수 있게 해줍니다.

이 provider는 OpenAI 호환 API를 사용합니다.

| 속성          | 값                                         |
| ------------- | ------------------------------------------ |
| Provider      | `tencent-tokenhub`                         |
| 기본 모델     | `tencent-tokenhub/hy3-preview`             |
| 인증          | `TOKENHUB_API_KEY`                         |
| API           | OpenAI 호환 chat completions               |
| 기본 URL      | `https://tokenhub.tencentmaas.com/v1`      |
| 글로벌 URL    | `https://tokenhub-intl.tencentmaas.com/v1` |

## 빠른 시작

<Steps>
  <Step title="TokenHub API 키 생성">
    Tencent Cloud TokenHub에서 API 키를 생성하십시오. 키에 제한된 접근 범위를 선택하는 경우 허용 모델에 **Hy3 preview**를 포함시키십시오.
  </Step>
  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --auth-choice tokenhub-api-key
    ```
  </Step>
  <Step title="모델 확인">
    ```bash
    openclaw models list --provider tencent-tokenhub
    ```
  </Step>
</Steps>

## 비대화형 설정

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice tokenhub-api-key \
  --tokenhub-api-key "$TOKENHUB_API_KEY" \
  --skip-health \
  --accept-risk
```

## 내장 카탈로그

| 모델 참조                      | 이름                   | 입력  | 컨텍스트 | 최대 출력 | 비고                    |
| ------------------------------ | ---------------------- | ----- | -------- | --------- | ----------------------- |
| `tencent-tokenhub/hy3-preview` | Hy3 preview (TokenHub) | text  | 256,000  | 64,000    | 기본값; 추론 활성화     |

Hy3 preview는 Tencent Hunyuan의 추론, 롱컨텍스트 instruction following, 코드, 에이전트 워크플로를 위한 대규모 MoE 언어 모델입니다. Tencent의 OpenAI 호환 예제는 모델 id로 `hy3-preview`를 사용하며, 표준 chat-completions tool calling과 `reasoning_effort`를 지원합니다.

<Tip>
모델 id는 `hy3-preview`입니다. Tencent의 `HY-3D-*` 모델과 혼동하지 마십시오. 후자는 3D 생성 API이며 이 provider가 구성하는 OpenClaw 채팅 모델이 아닙니다.
</Tip>

## 엔드포인트 재정의

OpenClaw는 기본적으로 Tencent Cloud의 `https://tokenhub.tencentmaas.com/v1` 엔드포인트를 사용합니다. Tencent은 국제 TokenHub 엔드포인트도 문서화하고 있습니다:

```bash
openclaw config set models.providers.tencent-tokenhub.baseUrl "https://tokenhub-intl.tencentmaas.com/v1"
```

TokenHub 계정 또는 지역이 요구할 때만 엔드포인트를 재정의하십시오.

## 참고 사항

- TokenHub 모델 참조는 `tencent-tokenhub/<modelId>`를 사용합니다.
- 번들 카탈로그에는 현재 `hy3-preview`가 포함되어 있습니다.
- 플러그인은 Hy3 preview를 추론 가능 및 스트리밍 사용량 지원으로 표시합니다.
- 플러그인은 계층형 Hy3 가격 메타데이터와 함께 제공되므로 수동 가격 재정의 없이도 비용 추정이 채워집니다.
- 필요한 경우에만 `models.providers`에서 가격, 컨텍스트, 또는 엔드포인트 메타데이터를 재정의하십시오.

## 환경 참고 사항

Gateway가 데몬(launchd/systemd)으로 실행되는 경우 `TOKENHUB_API_KEY`가 해당 프로세스에서 사용 가능한지 확인하십시오 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).

## 관련 문서

- [OpenClaw 구성](/gateway/configuration)
- [모델 Providers](/concepts/model-providers)
- [Tencent TokenHub 제품 페이지](https://cloud.tencent.com/product/tokenhub)
- [Tencent TokenHub 텍스트 생성](https://cloud.tencent.com/document/product/1823/130079)
- [Hy3 preview용 Tencent TokenHub Cline 설정](https://cloud.tencent.com/document/product/1823/130932)
- [Tencent Hy3 preview 모델 카드](https://huggingface.co/tencent/Hy3-preview)
