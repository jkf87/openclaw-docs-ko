---
summary: "`openclaw onboard`에 대한 CLI 참조 (인터랙티브 온보딩)"
read_when:
  - 게이트웨이, 워크스페이스, 인증, 채널, 스킬을 위한 안내 설정을 원하는 경우
title: "onboard"
---

# `openclaw onboard`

로컬 또는 원격 Gateway 설정을 위한 인터랙티브 온보딩.

## 관련 가이드

- CLI 온보딩 허브: [온보딩 (CLI)](/start/wizard)
- 온보딩 개요: [온보딩 개요](/start/onboarding-overview)
- CLI 온보딩 참조: [CLI 설정 참조](/start/wizard-cli-reference)
- CLI 자동화: [CLI 자동화](/start/wizard-cli-automation)
- macOS 온보딩: [온보딩 (macOS 앱)](/start/onboarding)

## 예시

```bash
openclaw onboard
openclaw onboard --flow quickstart
openclaw onboard --flow manual
openclaw onboard --mode remote --remote-url wss://gateway-host:18789
```

신뢰할 수 있는 네트워크 전용 일반 텍스트 사설망 `ws://` 대상의 경우
온보딩 프로세스 환경에서 `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1`을 설정하세요.

비인터랙티브 커스텀 프로바이더:

```bash
openclaw onboard --non-interactive \
  --auth-choice custom-api-key \
  --custom-base-url "https://llm.example.com/v1" \
  --custom-model-id "foo-large" \
  --custom-api-key "$CUSTOM_API_KEY" \
  --secret-input-mode plaintext \
  --custom-compatibility openai
```

`--custom-api-key`는 비인터랙티브 모드에서 선택 사항입니다. 생략하면 온보딩이 `CUSTOM_API_KEY`를 확인합니다.

비인터랙티브 Ollama:

```bash
openclaw onboard --non-interactive \
  --auth-choice ollama \
  --custom-base-url "http://ollama-host:11434" \
  --custom-model-id "qwen3.5:27b" \
  --accept-risk
```

`--custom-base-url`은 기본값이 `http://127.0.0.1:11434`입니다. `--custom-model-id`는 선택 사항입니다; 생략하면 온보딩이 Ollama의 제안된 기본값을 사용합니다. `kimi-k2.5:cloud`와 같은 클라우드 모델 ID도 여기서 작동합니다.

프로바이더 키를 일반 텍스트 대신 참조로 저장:

```bash
openclaw onboard --non-interactive \
  --auth-choice openai-api-key \
  --secret-input-mode ref \
  --accept-risk
```

`--secret-input-mode ref`를 사용하면 온보딩이 일반 텍스트 키 값 대신 환경 백업 참조를 씁니다.
인증 프로필 백업 프로바이더의 경우 `keyRef` 항목을 씁니다; 커스텀 프로바이더의 경우 `models.providers.<id>.apiKey`를 환경 참조로 씁니다 (예: `{ source: "env", provider: "default", id: "CUSTOM_API_KEY" }`).

비인터랙티브 `ref` 모드 계약:

- 온보딩 프로세스 환경에 프로바이더 환경 변수를 설정하세요 (예: `OPENAI_API_KEY`).
- 해당 환경 변수도 설정되지 않으면 인라인 키 플래그를 전달하지 마세요 (예: `--openai-api-key`).
- 필요한 환경 변수 없이 인라인 키 플래그가 전달되면 온보딩이 안내와 함께 빠르게 실패합니다.

비인터랙티브 모드의 게이트웨이 토큰 옵션:

- `--gateway-auth token --gateway-token <token>`은 일반 텍스트 토큰을 저장합니다.
- `--gateway-auth token --gateway-token-ref-env <name>`은 `gateway.auth.token`을 환경 SecretRef로 저장합니다.
- `--gateway-token`과 `--gateway-token-ref-env`는 상호 배타적입니다.
- `--gateway-token-ref-env`는 온보딩 프로세스 환경에서 비어 있지 않은 환경 변수가 필요합니다.
- `--install-daemon`을 사용하면 토큰 인증에 토큰이 필요한 경우 SecretRef 관리 게이트웨이 토큰이 유효성 검사되지만 슈퍼바이저 서비스 환경 메타데이터에 확인된 일반 텍스트로 유지되지 않습니다.
- `--install-daemon`을 사용하면 토큰 모드에 토큰이 필요하고 구성된 토큰 SecretRef가 확인되지 않은 경우 온보딩이 수정 안내와 함께 실패합니다.
- `--install-daemon`을 사용하면 `gateway.auth.token`과 `gateway.auth.password`가 모두 구성되고 `gateway.auth.mode`가 설정되지 않은 경우 모드가 명시적으로 설정될 때까지 온보딩이 설치를 차단합니다.
- 로컬 온보딩은 구성에 `gateway.mode="local"`을 씁니다. 이후 구성 파일에 `gateway.mode`가 누락된 경우 유효한 로컬 모드 단축키가 아닌 구성 손상 또는 불완전한 수동 편집으로 처리하세요.
- `--allow-unconfigured`는 별도의 게이트웨이 런타임 탈출 해치입니다. 온보딩이 `gateway.mode`를 생략할 수 있다는 의미가 아닙니다.

예시:

```bash
export OPENCLAW_GATEWAY_TOKEN="your-token"
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice skip \
  --gateway-auth token \
  --gateway-token-ref-env OPENCLAW_GATEWAY_TOKEN \
  --accept-risk
```

비인터랙티브 로컬 게이트웨이 상태:

- `--skip-health`를 전달하지 않으면 온보딩이 성공적으로 종료되기 전에 도달 가능한 로컬 게이트웨이를 기다립니다.
- `--install-daemon`은 먼저 관리되는 게이트웨이 설치 경로를 시작합니다. 없이는 `openclaw gateway run`과 같이 이미 실행 중인 로컬 게이트웨이가 있어야 합니다.
- 자동화에서 구성/워크스페이스/부트스트랩 쓰기만 원하는 경우 `--skip-health`를 사용하세요.
- 기본 Windows에서 `--install-daemon`은 먼저 예약된 작업을 시도하고 작업 생성이 거부되면 사용자별 시작 폴더 로그인 항목으로 폴백합니다.

참조 모드를 사용한 인터랙티브 온보딩 동작:

- 프롬프트될 때 **비밀 참조 사용**을 선택하세요.
- 그런 다음 다음 중 하나를 선택하세요:
  - 환경 변수
  - 구성된 비밀 프로바이더 (`file` 또는 `exec`)
- 온보딩은 참조를 저장하기 전에 빠른 사전 검증을 수행합니다.
  - 유효성 검사가 실패하면 온보딩이 오류를 표시하고 재시도할 수 있게 합니다.

비인터랙티브 Z.AI 엔드포인트 선택:

참고: `--auth-choice zai-api-key`는 이제 키에 가장 적합한 Z.AI 엔드포인트를 자동 감지합니다 (`zai/glm-5.1`이 있는 일반 API 선호).
GLM Coding Plan 엔드포인트가 특별히 필요한 경우 `zai-coding-global` 또는 `zai-coding-cn`을 선택하세요.

```bash
# 프롬프트 없는 엔드포인트 선택
openclaw onboard --non-interactive \
  --auth-choice zai-coding-global \
  --zai-api-key "$ZAI_API_KEY"

# 다른 Z.AI 엔드포인트 선택:
# --auth-choice zai-coding-cn
# --auth-choice zai-global
# --auth-choice zai-cn
```

비인터랙티브 Mistral 예시:

```bash
openclaw onboard --non-interactive \
  --auth-choice mistral-api-key \
  --mistral-api-key "$MISTRAL_API_KEY"
```

흐름 참고사항:

- `quickstart`: 최소한의 프롬프트, 게이트웨이 토큰 자동 생성.
- `manual`: 포트/바인드/인증에 대한 전체 프롬프트 (`advanced`의 별칭).
- 인증 선택이 선호 프로바이더를 의미하는 경우 온보딩은 기본 모델 및 허용 목록 선택기를 해당 프로바이더로 사전 필터링합니다. Volcengine 및 BytePlus의 경우 코딩 플랜 변형도 일치합니다 (`volcengine-plan/*`, `byteplus-plan/*`).
- 선호 프로바이더 필터가 로드된 모델을 아직 생성하지 않으면 온보딩은 선택기를 비워두는 대신 필터링되지 않은 카탈로그로 폴백합니다.
- 웹 검색 단계에서 일부 프로바이더는 프로바이더별 후속 프롬프트를 트리거할 수 있습니다:
  - **Grok**은 동일한 `XAI_API_KEY`와 `x_search` 모델 선택으로 선택적 `x_search` 설정을 제공할 수 있습니다.
  - **Kimi**는 Moonshot API 리전 (`api.moonshot.ai` 대 `api.moonshot.cn`)과 기본 Kimi 웹 검색 모델을 요청할 수 있습니다.
- 로컬 온보딩 DM 범위 동작: [CLI 설정 참조](/start/wizard-cli-reference#outputs-and-internals).
- 가장 빠른 첫 번째 채팅: `openclaw dashboard` (Control UI, 채널 설정 불필요).
- 커스텀 프로바이더: OpenAI 또는 Anthropic 호환 엔드포인트에 연결하며, 목록에 없는 호스팅된 프로바이더 포함. 자동 감지하려면 Unknown을 사용하세요.

## 일반적인 후속 명령

```bash
openclaw configure
openclaw agents add <name>
```

<Note>
`--json`은 비인터랙티브 모드를 의미하지 않습니다. 스크립트에는 `--non-interactive`를 사용하세요.
</Note>
