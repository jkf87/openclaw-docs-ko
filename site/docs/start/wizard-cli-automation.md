---
title: "CLI 자동화"
description: "OpenClaw CLI의 스크립트화된 온보딩 및 에이전트 설정"
---

# CLI 자동화

`--non-interactive`를 사용하여 `openclaw onboard`를 자동화하십시오.

::: info NOTE
`--json`은 비대화형 모드를 의미하지 않습니다. 스크립트에는 `--non-interactive` (및 `--workspace`)를 사용하십시오.
:::


## 기본 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice apiKey \
  --anthropic-api-key "$ANTHROPIC_API_KEY" \
  --secret-input-mode plaintext \
  --gateway-port 18789 \
  --gateway-bind loopback \
  --install-daemon \
  --daemon-runtime node \
  --skip-skills
```

머신 판독 가능한 요약을 위해 `--json`을 추가하십시오.

평문 값 대신 인증 프로파일에 환경 변수 기반 참조를 저장하려면 `--secret-input-mode ref`를 사용하십시오.
온보딩 흐름에서 환경 변수 참조와 구성된 프로바이더 참조 (`file` 또는 `exec`) 사이의 대화형 선택이 가능합니다.

비대화형 `ref` 모드에서, 프로바이더 환경 변수는 프로세스 환경에 설정되어 있어야 합니다.
일치하는 환경 변수 없이 인라인 키 플래그를 전달하면 빠르게 실패합니다.

예시:

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice openai-api-key \
  --secret-input-mode ref \
  --accept-risk
```

## 프로바이더별 예시

::: details Anthropic API 키 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice apiKey \
      --anthropic-api-key "$ANTHROPIC_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details Gemini 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice gemini-api-key \
      --gemini-api-key "$GEMINI_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details Z.AI 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice zai-api-key \
      --zai-api-key "$ZAI_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details Vercel AI Gateway 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice ai-gateway-api-key \
      --ai-gateway-api-key "$AI_GATEWAY_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details Cloudflare AI Gateway 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice cloudflare-ai-gateway-api-key \
      --cloudflare-ai-gateway-account-id "your-account-id" \
      --cloudflare-ai-gateway-gateway-id "your-gateway-id" \
      --cloudflare-ai-gateway-api-key "$CLOUDFLARE_AI_GATEWAY_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details Moonshot 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice moonshot-api-key \
      --moonshot-api-key "$MOONSHOT_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details Mistral 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice mistral-api-key \
      --mistral-api-key "$MISTRAL_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details Synthetic 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice synthetic-api-key \
      --synthetic-api-key "$SYNTHETIC_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details OpenCode 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice opencode-zen \
      --opencode-zen-api-key "$OPENCODE_API_KEY" \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
    Go 카탈로그를 사용하려면 `--auth-choice opencode-go --opencode-go-api-key "$OPENCODE_API_KEY"`로 교체하십시오.
:::

  ::: details Ollama 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice ollama \
      --custom-model-id "qwen3.5:27b" \
      --accept-risk \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```
:::

  ::: details 맞춤형 프로바이더 예시
```bash
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice custom-api-key \
      --custom-base-url "https://llm.example.com/v1" \
      --custom-model-id "foo-large" \
      --custom-api-key "$CUSTOM_API_KEY" \
      --custom-provider-id "my-custom" \
      --custom-compatibility anthropic \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```

    `--custom-api-key`는 선택 사항입니다. 생략하면 온보딩이 `CUSTOM_API_KEY`를 확인합니다.

    참조 모드 변형:

    ```bash
    export CUSTOM_API_KEY="your-key"
    openclaw onboard --non-interactive \
      --mode local \
      --auth-choice custom-api-key \
      --custom-base-url "https://llm.example.com/v1" \
      --custom-model-id "foo-large" \
      --secret-input-mode ref \
      --custom-provider-id "my-custom" \
      --custom-compatibility anthropic \
      --gateway-port 18789 \
      --gateway-bind loopback
    ```

    이 모드에서 온보딩은 `apiKey`를 `{ source: "env", provider: "default", id: "CUSTOM_API_KEY" }`로 저장합니다.
:::

Anthropic 설정 토큰은 지원되는 온보딩 토큰 경로로 계속 사용 가능하지만, OpenClaw는 이제 가능할 때 Claude CLI 재사용을 선호합니다.
프로덕션의 경우 Anthropic API 키를 선호하십시오.

## 다른 에이전트 추가

`openclaw agents add &lt;name&gt;`을 사용하여 자체 워크스페이스, 세션 및 인증 프로파일을 가진 별도의 에이전트를 생성하십시오.
`--workspace` 없이 실행하면 마법사가 시작됩니다.

```bash
openclaw agents add work \
  --workspace ~/.openclaw/workspace-work \
  --model openai/gpt-5.4 \
  --bind whatsapp:biz \
  --non-interactive \
  --json
```

설정 항목:

- `agents.list[].name`
- `agents.list[].workspace`
- `agents.list[].agentDir`

참고:

- 기본 워크스페이스는 `~/.openclaw/workspace-&lt;agentId&gt;`를 따릅니다.
- 인바운드 메시지 라우팅을 위해 `bindings`를 추가하십시오 (마법사가 이를 수행할 수 있습니다).
- 비대화형 플래그: `--model`, `--agent-dir`, `--bind`, `--non-interactive`.

## 관련 문서

- 온보딩 허브: [온보딩 (CLI)](/start/wizard)
- 전체 참조: [CLI 설정 참조](/start/wizard-cli-reference)
- 명령 참조: [`openclaw onboard`](/cli/onboard)
