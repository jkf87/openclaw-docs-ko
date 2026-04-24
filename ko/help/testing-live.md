---
summary: "Live(네트워크를 거치는) 테스트: model matrix, CLI 백엔드, ACP, media provider, 자격 증명"
read_when:
  - Live model matrix / CLI 백엔드 / ACP / media-provider smoke 실행
  - Live-test 자격 증명 resolution 디버깅
  - 새로운 provider별 live test 추가
title: "Testing: live suites"
sidebarTitle: "Live tests"
---

빠른 시작, QA runner, unit/integration suite, Docker 흐름은 [Testing](/help/testing)을 참조하십시오. 이 페이지는 **live**(네트워크를 거치는) 테스트 suite인 model matrix, CLI 백엔드, ACP, media-provider live test와 자격 증명 처리를 다룹니다.

## Live: Android node capability sweep

- 테스트: `src/gateway/android-node.capabilities.live.test.ts`
- 스크립트: `pnpm android:test:integration`
- 목표: 연결된 Android node가 **현재 광고하는 모든 명령**을 호출하고 명령 계약 동작을 assert합니다.
- 범위:
  - 사전 조건/수동 설정 (이 suite는 앱을 설치/실행/페어링하지 않습니다).
  - 선택된 Android node에 대한 명령별 gateway `node.invoke` 검증.
- 필수 사전 설정:
  - Android 앱이 이미 gateway에 연결되고 페어링됨.
  - 앱이 foreground에 유지됨.
  - 통과를 기대하는 capability에 대한 권한/캡처 consent가 부여됨.
- 선택적 target 재정의:
  - `OPENCLAW_ANDROID_NODE_ID` 또는 `OPENCLAW_ANDROID_NODE_NAME`.
  - `OPENCLAW_ANDROID_GATEWAY_URL` / `OPENCLAW_ANDROID_GATEWAY_TOKEN` / `OPENCLAW_ANDROID_GATEWAY_PASSWORD`.
- 전체 Android 설정 세부사항: [Android App](/platforms/android)

## Live: model smoke (profile 키)

Live 테스트는 실패를 격리할 수 있도록 두 layer로 나뉘어 있습니다:

- "Direct model"은 주어진 키로 provider/model이 응답을 할 수 있는지 알려줍니다.
- "Gateway smoke"는 해당 model에 대해 전체 gateway+agent 파이프라인이 작동하는지 알려줍니다 (session, history, tool, sandbox 정책 등).

### Layer 1: Direct model completion (gateway 없음)

- 테스트: `src/agents/models.profiles.live.test.ts`
- 목표:
  - 발견된 model 열거
  - `getApiKeyForModel`을 사용해 자격 증명이 있는 model 선택
  - model별 작은 completion 실행 (필요 시 타겟 regression)
- 활성화 방법:
  - `pnpm test:live` (또는 Vitest를 직접 호출하는 경우 `OPENCLAW_LIVE_TEST=1`)
- 이 suite를 실제로 실행하려면 `OPENCLAW_LIVE_MODELS=modern` (또는 `all`, modern의 alias)을 설정하십시오; 그렇지 않으면 `pnpm test:live`가 gateway smoke에 집중할 수 있도록 건너뜁니다
- Model 선택 방법:
  - modern allowlist를 실행하려면 `OPENCLAW_LIVE_MODELS=modern` (Opus/Sonnet 4.6+, GPT-5.2 + Codex, Gemini 3, GLM 4.7, MiniMax M2.7, Grok 4)
  - `OPENCLAW_LIVE_MODELS=all`은 modern allowlist의 alias
  - 또는 `OPENCLAW_LIVE_MODELS="openai/gpt-5.2,openai-codex/gpt-5.2,anthropic/claude-opus-4-6,..."` (콤마 allowlist)
  - Modern/all sweep은 큐레이션된 high-signal cap을 default로 사용합니다; 전수 modern sweep의 경우 `OPENCLAW_LIVE_MAX_MODELS=0`을, 더 작은 cap의 경우 양수를 설정하십시오.
  - 전수 sweep은 전체 direct-model 테스트 timeout에 `OPENCLAW_LIVE_TEST_TIMEOUT_MS`를 사용합니다. Default: 60분.
  - Direct-model probe는 기본적으로 20-way 병렬로 실행됩니다; 재정의하려면 `OPENCLAW_LIVE_MODEL_CONCURRENCY`를 설정하십시오.
- Provider 선택 방법:
  - `OPENCLAW_LIVE_PROVIDERS="google,google-antigravity,google-gemini-cli"` (콤마 allowlist)
- 키 출처:
  - 기본: profile store와 env fallback
  - **profile store** 전용을 강제하려면 `OPENCLAW_LIVE_REQUIRE_PROFILE_KEYS=1`을 설정하십시오
- 이것이 존재하는 이유:
  - "provider API가 고장남 / 키가 유효하지 않음"과 "gateway agent 파이프라인이 고장남"을 분리합니다
  - 작고 격리된 regression을 포함합니다 (예: OpenAI Responses/Codex Responses reasoning replay + tool-call flow)

### Layer 2: Gateway + dev agent smoke ("@openclaw"이 실제로 하는 일)

- 테스트: `src/gateway/gateway-models.profiles.live.test.ts`
- 목표:
  - in-process gateway 기동
  - `agent:dev:*` session 생성/patch (실행별 model override)
  - 키가 있는 model을 반복하고 assert:
    - "의미 있는" 응답 (tool 없음)
    - 실제 tool invocation 작동 (read probe)
    - 선택적 추가 tool probe (exec+read probe)
    - OpenAI regression 경로 (tool-call-only → follow-up)가 계속 작동
- Probe 세부사항 (실패를 빠르게 설명할 수 있도록):
  - `read` probe: 테스트는 workspace에 nonce 파일을 쓰고 agent에게 `read`하고 nonce를 echo하도록 요청합니다.
  - `exec+read` probe: 테스트는 agent에게 `exec`으로 임시 파일에 nonce를 쓰고, 이를 다시 `read`하도록 요청합니다.
  - image probe: 테스트는 생성된 PNG (고양이 + 무작위 코드)를 첨부하고 model이 `cat <CODE>`를 반환하기를 기대합니다.
  - 구현 참조: `src/gateway/gateway-models.profiles.live.test.ts` 및 `src/gateway/live-image-probe.ts`.
- 활성화 방법:
  - `pnpm test:live` (또는 Vitest를 직접 호출하는 경우 `OPENCLAW_LIVE_TEST=1`)
- Model 선택 방법:
  - 기본: modern allowlist (Opus/Sonnet 4.6+, GPT-5.2 + Codex, Gemini 3, GLM 4.7, MiniMax M2.7, Grok 4)
  - `OPENCLAW_LIVE_GATEWAY_MODELS=all`은 modern allowlist의 alias
  - 또는 `OPENCLAW_LIVE_GATEWAY_MODELS="provider/model"` (또는 콤마 목록)로 좁히십시오
  - Modern/all gateway sweep은 큐레이션된 high-signal cap을 default로 사용합니다; 전수 modern sweep의 경우 `OPENCLAW_LIVE_GATEWAY_MAX_MODELS=0`을, 더 작은 cap의 경우 양수를 설정하십시오.
- Provider 선택 방법 ("OpenRouter 모든 것" 피하기):
  - `OPENCLAW_LIVE_GATEWAY_PROVIDERS="google,google-antigravity,google-gemini-cli,openai,anthropic,zai,minimax"` (콤마 allowlist)
- 이 live test에서 tool + image probe는 항상 켜져 있습니다:
  - `read` probe + `exec+read` probe (tool stress)
  - image probe는 model이 image 입력 지원을 광고할 때 실행됩니다
  - 흐름 (high level):
    - 테스트는 "CAT" + 랜덤 코드가 있는 작은 PNG를 생성합니다 (`src/gateway/live-image-probe.ts`)
    - `agent` `attachments: [{ mimeType: "image/png", content: "<base64>" }]`을 통해 전송합니다
    - Gateway는 attachment를 `images[]`로 파싱합니다 (`src/gateway/server-methods/agent.ts` + `src/gateway/chat-attachments.ts`)
    - 임베디드 agent가 multimodal user 메시지를 model에 전달합니다
    - Assertion: 응답에 `cat` + 코드가 포함됩니다 (OCR 허용 오차: 사소한 실수 허용)

팁: 머신에서 무엇을 테스트할 수 있는지(그리고 정확한 `provider/model` id) 보려면 다음을 실행하십시오:

```bash
openclaw models list
openclaw models list --json
```

## Live: CLI 백엔드 smoke (Claude, Codex, Gemini 또는 기타 로컬 CLI)

- 테스트: `src/gateway/gateway-cli-backend.live.test.ts`
- 목표: 기본 설정을 건드리지 않고 로컬 CLI 백엔드를 사용해 Gateway + agent 파이프라인을 검증합니다.
- 백엔드별 smoke default는 소유 확장의 `cli-backend.ts` 정의와 함께 있습니다.
- 활성화:
  - `pnpm test:live` (또는 Vitest를 직접 호출하는 경우 `OPENCLAW_LIVE_TEST=1`)
  - `OPENCLAW_LIVE_CLI_BACKEND=1`
- Default:
  - 기본 provider/model: `claude-cli/claude-sonnet-4-6`
  - Command/args/image 동작은 소유 CLI 백엔드 플러그인 메타데이터에서 옵니다.
- 재정의 (선택):
  - `OPENCLAW_LIVE_CLI_BACKEND_MODEL="codex-cli/gpt-5.2"`
  - `OPENCLAW_LIVE_CLI_BACKEND_COMMAND="/full/path/to/codex"`
  - `OPENCLAW_LIVE_CLI_BACKEND_ARGS='["exec","--json","--color","never","--sandbox","read-only","--skip-git-repo-check"]'`
  - 실제 image attachment를 보내려면 `OPENCLAW_LIVE_CLI_BACKEND_IMAGE_PROBE=1` (경로가 프롬프트에 주입됩니다).
  - image 파일 경로를 프롬프트 주입 대신 CLI args로 전달하려면 `OPENCLAW_LIVE_CLI_BACKEND_IMAGE_ARG="--image"`.
  - `IMAGE_ARG`가 설정된 경우 image args가 어떻게 전달되는지 제어하려면 `OPENCLAW_LIVE_CLI_BACKEND_IMAGE_MODE="repeat"` (또는 `"list"`).
  - 두 번째 턴을 보내고 resume 흐름을 검증하려면 `OPENCLAW_LIVE_CLI_BACKEND_RESUME_PROBE=1`.
  - 기본 Claude Sonnet -> Opus same-session continuity probe를 비활성화하려면 `OPENCLAW_LIVE_CLI_BACKEND_MODEL_SWITCH_PROBE=0` (선택된 model이 switch target을 지원할 때 강제로 켜려면 `1`로 설정).

예시:

```bash
OPENCLAW_LIVE_CLI_BACKEND=1 \
  OPENCLAW_LIVE_CLI_BACKEND_MODEL="codex-cli/gpt-5.2" \
  pnpm test:live src/gateway/gateway-cli-backend.live.test.ts
```

Docker 레시피:

```bash
pnpm test:docker:live-cli-backend
```

단일 provider Docker 레시피:

```bash
pnpm test:docker:live-cli-backend:claude
pnpm test:docker:live-cli-backend:claude-subscription
pnpm test:docker:live-cli-backend:codex
pnpm test:docker:live-cli-backend:gemini
```

참고:

- Docker runner는 `scripts/test-live-cli-backend-docker.sh`에 있습니다.
- repo Docker 이미지 내에서 non-root `node` 사용자로 live CLI-backend smoke를 실행합니다.
- 소유 확장에서 CLI smoke 메타데이터를 resolve한 다음, 일치하는 Linux CLI 패키지(`@anthropic-ai/claude-code`, `@openai/codex` 또는 `@google/gemini-cli`)를 `OPENCLAW_DOCKER_CLI_TOOLS_DIR`(default: `~/.cache/openclaw/docker-cli-tools`)에 캐시된 쓰기 가능한 prefix에 설치합니다.
- `pnpm test:docker:live-cli-backend:claude-subscription`은 `claudeAiOauth.subscriptionType`이 있는 `~/.claude/.credentials.json` 또는 `claude setup-token`으로 얻은 `CLAUDE_CODE_OAUTH_TOKEN`을 통해 portable Claude Code 구독 OAuth를 필요로 합니다. 먼저 Docker에서 direct `claude -p`를 증명한 다음, Anthropic API-key env var를 보존하지 않고 두 개의 Gateway CLI-backend turn을 실행합니다. 이 구독 lane은 Claude가 현재 third-party 앱 사용량을 일반 구독 plan 한도 대신 추가 사용량 청구로 라우팅하기 때문에 기본적으로 Claude MCP/tool 및 image probe를 비활성화합니다.
- live CLI-backend smoke는 이제 Claude, Codex, Gemini에 대해 동일한 end-to-end 흐름을 실행합니다: 텍스트 턴, 이미지 분류 턴, 그다음 gateway CLI를 통해 검증된 MCP `cron` tool call.
- Claude의 기본 smoke는 또한 session을 Sonnet에서 Opus로 patch하고 resume된 session이 여전히 이전 노트를 기억하는지 검증합니다.

## Live: ACP bind smoke (`/acp spawn ... --bind here`)

- 테스트: `src/gateway/gateway-acp-bind.live.test.ts`
- 목표: 실제 ACP conversation-bind 흐름을 live ACP agent와 함께 검증합니다:
  - `/acp spawn <agent> --bind here` 전송
  - 합성 message-channel conversation을 제자리에 bind
  - 동일한 conversation에 일반 follow-up 전송
  - follow-up이 bound ACP session transcript에 도달하는지 검증
- 활성화:
  - `pnpm test:live src/gateway/gateway-acp-bind.live.test.ts`
  - `OPENCLAW_LIVE_ACP_BIND=1`
- Default:
  - Docker의 ACP agent: `claude,codex,gemini`
  - direct `pnpm test:live ...`용 ACP agent: `claude`
  - 합성 채널: Slack DM 스타일 conversation 컨텍스트
  - ACP 백엔드: `acpx`
- 재정의:
  - `OPENCLAW_LIVE_ACP_BIND_AGENT=claude`
  - `OPENCLAW_LIVE_ACP_BIND_AGENT=codex`
  - `OPENCLAW_LIVE_ACP_BIND_AGENT=gemini`
  - `OPENCLAW_LIVE_ACP_BIND_AGENTS=claude,codex,gemini`
  - `OPENCLAW_LIVE_ACP_BIND_AGENT_COMMAND='npx -y @agentclientprotocol/claude-agent-acp@<version>'`
  - `OPENCLAW_LIVE_ACP_BIND_CODEX_MODEL=gpt-5.2`
  - `OPENCLAW_LIVE_ACP_BIND_PARENT_MODEL=openai/gpt-5.2`
- 참고:
  - 이 lane은 admin-only 합성 originating-route 필드가 있는 gateway `chat.send` 표면을 사용하여, 테스트가 외부로 배달하는 척하지 않고 message-channel 컨텍스트를 첨부할 수 있게 합니다.
  - `OPENCLAW_LIVE_ACP_BIND_AGENT_COMMAND`가 설정되지 않으면, 테스트는 선택된 ACP harness agent에 대해 임베디드 `acpx` 플러그인의 내장 agent registry를 사용합니다.

예시:

```bash
OPENCLAW_LIVE_ACP_BIND=1 \
  OPENCLAW_LIVE_ACP_BIND_AGENT=claude \
  pnpm test:live src/gateway/gateway-acp-bind.live.test.ts
```

Docker 레시피:

```bash
pnpm test:docker:live-acp-bind
```

단일 agent Docker 레시피:

```bash
pnpm test:docker:live-acp-bind:claude
pnpm test:docker:live-acp-bind:codex
pnpm test:docker:live-acp-bind:gemini
```

Docker 참고:

- Docker runner는 `scripts/test-live-acp-bind-docker.sh`에 있습니다.
- 기본적으로 지원되는 모든 live CLI agent에 대해 순차적으로 ACP bind smoke를 실행합니다: `claude`, `codex`, 그다음 `gemini`.
- matrix를 좁히려면 `OPENCLAW_LIVE_ACP_BIND_AGENTS=claude`, `OPENCLAW_LIVE_ACP_BIND_AGENTS=codex` 또는 `OPENCLAW_LIVE_ACP_BIND_AGENTS=gemini`를 사용하십시오.
- `~/.profile`을 source하고, 일치하는 CLI auth 자료를 컨테이너에 스테이징하며, `acpx`를 쓰기 가능한 npm prefix에 설치한 다음, 누락된 경우 요청된 live CLI (`@anthropic-ai/claude-code`, `@openai/codex` 또는 `@google/gemini-cli`)를 설치합니다.
- Docker 내부에서 runner는 `OPENCLAW_LIVE_ACP_BIND_ACPX_COMMAND=$HOME/.npm-global/bin/acpx`를 설정하여, acpx가 source된 profile의 provider env var를 하위 harness CLI가 사용할 수 있도록 유지합니다.

## Live: Codex app-server harness smoke

- 목표: 일반 gateway `agent` 메서드를 통해 플러그인 소유 Codex harness를 검증합니다:
  - 번들된 `codex` 플러그인 로드
  - `OPENCLAW_AGENT_RUNTIME=codex` 선택
  - Codex harness가 강제된 `openai/gpt-5.2`에 첫 번째 gateway agent 턴 전송
  - 동일한 OpenClaw session에 두 번째 턴 전송 및 app-server thread가 resume할 수 있는지 검증
  - 동일한 gateway 명령 경로를 통해 `/codex status` 및 `/codex models` 실행
  - 선택적으로 Guardian 검토가 된 두 개의 escalated shell probe 실행: 승인되어야 하는 benign 명령 하나와 거부되어 agent가 되물어야 하는 가짜 secret 업로드 하나
- 테스트: `src/gateway/gateway-codex-harness.live.test.ts`
- 활성화: `OPENCLAW_LIVE_CODEX_HARNESS=1`
- 기본 model: `openai/gpt-5.2`
- 선택적 image probe: `OPENCLAW_LIVE_CODEX_HARNESS_IMAGE_PROBE=1`
- 선택적 MCP/tool probe: `OPENCLAW_LIVE_CODEX_HARNESS_MCP_PROBE=1`
- 선택적 Guardian probe: `OPENCLAW_LIVE_CODEX_HARNESS_GUARDIAN_PROBE=1`
- smoke는 `OPENCLAW_AGENT_HARNESS_FALLBACK=none`을 설정해 고장난 Codex harness가 조용히 PI로 fallback하여 통과할 수 없도록 합니다.
- Auth: 로컬 Codex 구독 로그인에서 Codex app-server auth. Docker smoke는 해당되는 경우 non-Codex probe용으로 `OPENAI_API_KEY`와 선택적으로 복사된 `~/.codex/auth.json` 및 `~/.codex/config.toml`도 제공할 수 있습니다.

로컬 레시피:

```bash
source ~/.profile
OPENCLAW_LIVE_CODEX_HARNESS=1 \
  OPENCLAW_LIVE_CODEX_HARNESS_IMAGE_PROBE=1 \
  OPENCLAW_LIVE_CODEX_HARNESS_MCP_PROBE=1 \
  OPENCLAW_LIVE_CODEX_HARNESS_GUARDIAN_PROBE=1 \
  OPENCLAW_LIVE_CODEX_HARNESS_MODEL=openai/gpt-5.2 \
  pnpm test:live -- src/gateway/gateway-codex-harness.live.test.ts
```

Docker 레시피:

```bash
source ~/.profile
pnpm test:docker:live-codex-harness
```

Docker 참고:

- Docker runner는 `scripts/test-live-codex-harness-docker.sh`에 있습니다.
- 마운트된 `~/.profile`을 source하고, `OPENAI_API_KEY`를 전달하며, 존재할 때 Codex CLI auth 파일을 복사하고, `@openai/codex`를 마운트된 쓰기 가능한 npm prefix에 설치하고, source tree를 스테이징한 다음, Codex-harness live 테스트만 실행합니다.
- Docker는 기본적으로 image, MCP/tool, Guardian probe를 활성화합니다. 더 좁은 디버그 실행이 필요하면 `OPENCLAW_LIVE_CODEX_HARNESS_IMAGE_PROBE=0` 또는 `OPENCLAW_LIVE_CODEX_HARNESS_MCP_PROBE=0` 또는 `OPENCLAW_LIVE_CODEX_HARNESS_GUARDIAN_PROBE=0`을 설정하십시오.
- Docker는 또한 `OPENCLAW_AGENT_HARNESS_FALLBACK=none`을 export하여, legacy alias나 PI fallback이 Codex harness regression을 숨기지 못하도록 live test 설정과 일치시킵니다.

### 권장 live 레시피

좁고 명시적인 allowlist가 가장 빠르고 가장 덜 flaky합니다:

- 단일 model, direct (gateway 없음):
  - `OPENCLAW_LIVE_MODELS="openai/gpt-5.2" pnpm test:live src/agents/models.profiles.live.test.ts`

- 단일 model, gateway smoke:
  - `OPENCLAW_LIVE_GATEWAY_MODELS="openai/gpt-5.2" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

- 여러 provider에 걸친 tool calling:
  - `OPENCLAW_LIVE_GATEWAY_MODELS="openai/gpt-5.2,openai-codex/gpt-5.2,anthropic/claude-opus-4-6,google/gemini-3-flash-preview,zai/glm-4.7,minimax/MiniMax-M2.7" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

- Google 집중 (Gemini API key + Antigravity):
  - Gemini (API key): `OPENCLAW_LIVE_GATEWAY_MODELS="google/gemini-3-flash-preview" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`
  - Antigravity (OAuth): `OPENCLAW_LIVE_GATEWAY_MODELS="google-antigravity/claude-opus-4-6-thinking,google-antigravity/gemini-3-pro-high" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

참고:

- `google/...`은 Gemini API (API 키)를 사용합니다.
- `google-antigravity/...`는 Antigravity OAuth bridge (Cloud Code Assist 스타일 agent 엔드포인트)를 사용합니다.
- `google-gemini-cli/...`는 머신의 로컬 Gemini CLI를 사용합니다 (별도 auth + tooling 특이점).
- Gemini API 대 Gemini CLI:
  - API: OpenClaw는 HTTP를 통해 Google의 호스팅된 Gemini API를 호출합니다 (API key / profile auth); 대부분의 사용자가 "Gemini"라고 하는 것입니다.
  - CLI: OpenClaw는 로컬 `gemini` 바이너리로 shell out합니다; 자체 auth가 있고 다르게 동작할 수 있습니다 (스트리밍/tool 지원/버전 차이).

## Live: model matrix (다루는 범위)

고정된 "CI model 목록"은 없지만 (live는 opt-in), 다음은 키가 있는 dev 머신에서 정기적으로 커버하는 **권장** model입니다.

### Modern smoke set (tool calling + image)

이것은 우리가 계속 작동하도록 유지하려는 "common models" 실행입니다:

- OpenAI (non-Codex): `openai/gpt-5.2`
- OpenAI Codex OAuth: `openai-codex/gpt-5.2`
- Anthropic: `anthropic/claude-opus-4-6` (또는 `anthropic/claude-sonnet-4-6`)
- Google (Gemini API): `google/gemini-3.1-pro-preview` 및 `google/gemini-3-flash-preview` (오래된 Gemini 2.x model 피하기)
- Google (Antigravity): `google-antigravity/claude-opus-4-6-thinking` 및 `google-antigravity/gemini-3-flash`
- Z.AI (GLM): `zai/glm-4.7`
- MiniMax: `minimax/MiniMax-M2.7`

tool + image를 포함한 gateway smoke 실행:
`OPENCLAW_LIVE_GATEWAY_MODELS="openai/gpt-5.2,openai-codex/gpt-5.2,anthropic/claude-opus-4-6,google/gemini-3.1-pro-preview,google/gemini-3-flash-preview,google-antigravity/claude-opus-4-6-thinking,google-antigravity/gemini-3-flash,zai/glm-4.7,minimax/MiniMax-M2.7" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

### 베이스라인: tool calling (Read + 선택적 Exec)

provider family당 최소 하나를 선택하십시오:

- OpenAI: `openai/gpt-5.2`
- Anthropic: `anthropic/claude-opus-4-6` (또는 `anthropic/claude-sonnet-4-6`)
- Google: `google/gemini-3-flash-preview` (또는 `google/gemini-3.1-pro-preview`)
- Z.AI (GLM): `zai/glm-4.7`
- MiniMax: `minimax/MiniMax-M2.7`

선택적 추가 커버리지 (있으면 좋은 것):

- xAI: `xai/grok-4` (또는 사용 가능한 최신)
- Mistral: `mistral/`… (활성화된 "tools" 가능 model 하나 선택)
- Cerebras: `cerebras/`… (접근 권한이 있는 경우)
- LM Studio: `lmstudio/`… (로컬; tool calling은 API 모드에 따라 다름)

### Vision: image send (attachment → multimodal message)

image probe를 실행하려면 `OPENCLAW_LIVE_GATEWAY_MODELS`에 image 가능 model을 하나 이상 포함하십시오 (Claude/Gemini/OpenAI vision-capable variant 등).

### Aggregator / 대체 gateway

키가 활성화되어 있으면 다음을 통한 테스트도 지원합니다:

- OpenRouter: `openrouter/...` (수백 개 model; tool+image 가능 후보를 찾으려면 `openclaw models scan` 사용)
- OpenCode: Zen은 `opencode/...`, Go는 `opencode-go/...` (auth는 `OPENCODE_API_KEY` / `OPENCODE_ZEN_API_KEY`)

live matrix에 포함할 수 있는 추가 provider (자격 증명/설정이 있는 경우):

- Built-in: `openai`, `openai-codex`, `anthropic`, `google`, `google-vertex`, `google-antigravity`, `google-gemini-cli`, `zai`, `openrouter`, `opencode`, `opencode-go`, `xai`, `groq`, `cerebras`, `mistral`, `github-copilot`
- `models.providers`를 통한 커스텀 엔드포인트: `minimax` (cloud/API), 그리고 OpenAI/Anthropic 호환 proxy (LM Studio, vLLM, LiteLLM 등)

팁: 문서에 "모든 model"을 하드코딩하지 마십시오. 권위 있는 목록은 머신에서 `discoverModels(...)`가 반환하는 것 + 사용 가능한 키입니다.

## 자격 증명 (절대 커밋하지 말 것)

Live 테스트는 CLI가 하는 방식과 동일하게 자격 증명을 발견합니다. 실용적 의미:

- CLI가 작동하면 live 테스트도 동일한 키를 찾아야 합니다.
- live 테스트가 "no creds"라고 하면, `openclaw models list` / model 선택을 디버그하는 방식과 동일하게 디버그하십시오.

- 에이전트별 auth profile: `~/.openclaw/agents/<agentId>/agent/auth-profiles.json` (이것이 live 테스트에서 "profile 키"가 의미하는 바입니다)
- 설정: `~/.openclaw/openclaw.json` (또는 `OPENCLAW_CONFIG_PATH`)
- Legacy state dir: `~/.openclaw/credentials/` (존재할 때 스테이징된 live home에 복사되지만, 메인 profile-key 저장소는 아님)
- Live 로컬 실행은 활성 설정, 에이전트별 `auth-profiles.json` 파일, legacy `credentials/`, 지원되는 외부 CLI auth 디렉토리를 기본적으로 임시 테스트 home에 복사합니다; 스테이징된 live home은 `workspace/` 및 `sandboxes/`를 건너뛰고, `agents.*.workspace` / `agentDir` 경로 재정의는 probe가 실제 호스트 workspace에 영향을 주지 않도록 제거됩니다.

env 키에 의존하고 싶다면 (예: `~/.profile`에서 export됨), `source ~/.profile` 후 로컬 테스트를 실행하거나 아래 Docker runner를 사용하십시오 (컨테이너에 `~/.profile`을 마운트할 수 있음).

## Deepgram live (오디오 전사)

- 테스트: `extensions/deepgram/audio.live.test.ts`
- 활성화: `DEEPGRAM_API_KEY=... DEEPGRAM_LIVE_TEST=1 pnpm test:live extensions/deepgram/audio.live.test.ts`

## BytePlus coding plan live

- 테스트: `extensions/byteplus/live.test.ts`
- 활성화: `BYTEPLUS_API_KEY=... BYTEPLUS_LIVE_TEST=1 pnpm test:live extensions/byteplus/live.test.ts`
- 선택적 model 재정의: `BYTEPLUS_CODING_MODEL=ark-code-latest`

## ComfyUI workflow media live

- 테스트: `extensions/comfy/comfy.live.test.ts`
- 활성화: `OPENCLAW_LIVE_TEST=1 COMFY_LIVE_TEST=1 pnpm test:live -- extensions/comfy/comfy.live.test.ts`
- 범위:
  - 번들된 comfy image, video, `music_generate` 경로 실행
  - `models.providers.comfy.<capability>`가 구성되지 않으면 각 capability 건너뛰기
  - comfy workflow 제출, polling, 다운로드 또는 플러그인 등록을 변경한 후 유용

## Image generation live

- 테스트: `test/image-generation.runtime.live.test.ts`
- 명령: `pnpm test:live test/image-generation.runtime.live.test.ts`
- Harness: `pnpm test:live:media image`
- 범위:
  - 등록된 모든 image-generation provider 플러그인 열거
  - probing 전에 로그인 shell (`~/.profile`)에서 누락된 provider env var 로드
  - 기본적으로 저장된 auth profile보다 live/env API 키를 우선 사용하므로, `auth-profiles.json`의 오래된 테스트 키가 실제 shell 자격 증명을 가리지 않습니다
  - 사용 가능한 auth/profile/model이 없는 provider 건너뛰기
  - 공유 런타임 capability를 통해 stock image-generation variant 실행:
    - `google:flash-generate`
    - `google:pro-generate`
    - `google:pro-edit`
    - `openai:default-generate`
- 현재 커버되는 번들 provider:
  - `fal`
  - `google`
  - `minimax`
  - `openai`
  - `openrouter`
  - `vydra`
  - `xai`
- 선택적 좁히기:
  - `OPENCLAW_LIVE_IMAGE_GENERATION_PROVIDERS="openai,google,openrouter,xai"`
  - `OPENCLAW_LIVE_IMAGE_GENERATION_MODELS="openai/gpt-image-2,google/gemini-3.1-flash-image-preview,openrouter/google/gemini-3.1-flash-image-preview,xai/grok-imagine-image"`
  - `OPENCLAW_LIVE_IMAGE_GENERATION_CASES="google:flash-generate,google:pro-edit,openrouter:generate,xai:default-generate,xai:default-edit"`
- 선택적 auth 동작:
  - profile-store auth를 강제하고 env 전용 재정의를 무시하려면 `OPENCLAW_LIVE_REQUIRE_PROFILE_KEYS=1`

## Music generation live

- 테스트: `extensions/music-generation-providers.live.test.ts`
- 활성화: `OPENCLAW_LIVE_TEST=1 pnpm test:live -- extensions/music-generation-providers.live.test.ts`
- Harness: `pnpm test:live:media music`
- 범위:
  - 공유 번들 music-generation provider 경로 실행
  - 현재 Google 및 MiniMax 커버
  - probing 전에 로그인 shell (`~/.profile`)에서 provider env var 로드
  - 기본적으로 저장된 auth profile보다 live/env API 키를 우선 사용하므로, `auth-profiles.json`의 오래된 테스트 키가 실제 shell 자격 증명을 가리지 않습니다
  - 사용 가능한 auth/profile/model이 없는 provider 건너뛰기
  - 가능한 경우 선언된 런타임 모드 모두 실행:
    - 프롬프트 전용 입력으로 `generate`
    - provider가 `capabilities.edit.enabled`를 선언할 때 `edit`
  - 현재 공유 lane 커버리지:
    - `google`: `generate`, `edit`
    - `minimax`: `generate`
    - `comfy`: 별도의 Comfy live 파일, 이 공유 sweep 아님
- 선택적 좁히기:
  - `OPENCLAW_LIVE_MUSIC_GENERATION_PROVIDERS="google,minimax"`
  - `OPENCLAW_LIVE_MUSIC_GENERATION_MODELS="google/lyria-3-clip-preview,minimax/music-2.5+"`
- 선택적 auth 동작:
  - profile-store auth를 강제하고 env 전용 재정의를 무시하려면 `OPENCLAW_LIVE_REQUIRE_PROFILE_KEYS=1`

## Video generation live

- 테스트: `extensions/video-generation-providers.live.test.ts`
- 활성화: `OPENCLAW_LIVE_TEST=1 pnpm test:live -- extensions/video-generation-providers.live.test.ts`
- Harness: `pnpm test:live:media video`
- 범위:
  - 공유 번들 video-generation provider 경로 실행
  - release-safe smoke 경로를 default로 사용: non-FAL provider, provider당 하나의 text-to-video 요청, 1초 랍스터 프롬프트, 그리고 `OPENCLAW_LIVE_VIDEO_GENERATION_TIMEOUT_MS` (default `180000`)의 provider별 operation cap
  - FAL은 provider 측 queue latency가 release 시간을 지배할 수 있으므로 기본적으로 건너뜁니다; 명시적으로 실행하려면 `--video-providers fal` 또는 `OPENCLAW_LIVE_VIDEO_GENERATION_PROVIDERS="fal"`을 전달하십시오
  - probing 전에 로그인 shell (`~/.profile`)에서 provider env var 로드
  - 기본적으로 저장된 auth profile보다 live/env API 키를 우선 사용하므로, `auth-profiles.json`의 오래된 테스트 키가 실제 shell 자격 증명을 가리지 않습니다
  - 사용 가능한 auth/profile/model이 없는 provider 건너뛰기
  - 기본적으로 `generate`만 실행
  - 가능한 경우 선언된 transform 모드도 실행하려면 `OPENCLAW_LIVE_VIDEO_GENERATION_FULL_MODES=1`을 설정하십시오:
    - provider가 `capabilities.imageToVideo.enabled`를 선언하고 선택된 provider/model이 공유 sweep에서 buffer-backed 로컬 image 입력을 받을 때 `imageToVideo`
    - provider가 `capabilities.videoToVideo.enabled`를 선언하고 선택된 provider/model이 공유 sweep에서 buffer-backed 로컬 video 입력을 받을 때 `videoToVideo`
  - 공유 sweep에서 현재 선언되었지만 건너뛴 `imageToVideo` provider:
    - `vydra` - 번들된 `veo3`는 텍스트 전용이고 번들된 `kling`은 원격 image URL이 필요하기 때문
  - Provider별 Vydra 커버리지:
    - `OPENCLAW_LIVE_TEST=1 OPENCLAW_LIVE_VYDRA_VIDEO=1 pnpm test:live -- extensions/vydra/vydra.live.test.ts`
    - 이 파일은 `veo3` text-to-video와 기본적으로 원격 image URL fixture를 사용하는 `kling` lane을 실행합니다
  - 현재 `videoToVideo` live 커버리지:
    - 선택된 model이 `runway/gen4_aleph`일 때만 `runway`
  - 공유 sweep에서 현재 선언되었지만 건너뛴 `videoToVideo` provider:
    - `alibaba`, `qwen`, `xai` - 해당 경로가 현재 원격 `http(s)` / MP4 참조 URL을 요구하기 때문
    - `google` - 현재 공유 Gemini/Veo lane이 로컬 buffer-backed 입력을 사용하고 해당 경로가 공유 sweep에서 허용되지 않기 때문
    - `openai` - 현재 공유 lane에 조직별 video inpaint/remix 접근 보장이 부족하기 때문
- 선택적 좁히기:
  - `OPENCLAW_LIVE_VIDEO_GENERATION_PROVIDERS="google,openai,runway"`
  - `OPENCLAW_LIVE_VIDEO_GENERATION_MODELS="google/veo-3.1-fast-generate-preview,openai/sora-2,runway/gen4_aleph"`
  - FAL을 포함한 모든 provider를 default sweep에 포함하려면 `OPENCLAW_LIVE_VIDEO_GENERATION_SKIP_PROVIDERS=""`
  - 공격적인 smoke 실행을 위해 각 provider operation cap을 줄이려면 `OPENCLAW_LIVE_VIDEO_GENERATION_TIMEOUT_MS=60000`
- 선택적 auth 동작:
  - profile-store auth를 강제하고 env 전용 재정의를 무시하려면 `OPENCLAW_LIVE_REQUIRE_PROFILE_KEYS=1`

## Media live harness

- 명령: `pnpm test:live:media`
- 목적:
  - 공유 image, music, video live suite를 하나의 repo-native 엔트리포인트로 실행
  - `~/.profile`에서 누락된 provider env var 자동 로드
  - 기본적으로 현재 사용 가능한 auth가 있는 provider로 각 suite 자동 좁히기
  - `scripts/test-live.mjs`를 재사용하므로 heartbeat 및 quiet-mode 동작이 일관되게 유지됨
- 예시:
  - `pnpm test:live:media`
  - `pnpm test:live:media image video --providers openai,google,minimax`
  - `pnpm test:live:media video --video-providers openai,runway --all-providers`
  - `pnpm test:live:media music --quiet`

## 관련

- [Testing](/help/testing) — unit, integration, QA, Docker suite
