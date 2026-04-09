---
title: "온보딩 레퍼런스"
description: "CLI 온보딩 전체 레퍼런스: 모든 단계, 플래그, 구성 필드"
---

# 온보딩 레퍼런스

이것은 `openclaw onboard`의 전체 레퍼런스입니다.
높은 수준의 개요는 [온보딩 (CLI)](/start/wizard)을 참조하십시오.

## 흐름 세부 사항 (로컬 모드)

1. **기존 구성 감지**

   - `~/.openclaw/openclaw.json`이 있으면 **유지 / 수정 / 재설정**을 선택합니다.
       - 온보딩 재실행은 명시적으로 **재설정**을 선택하거나 `--reset`을 전달하지 않는 한 아무것도 지우지 **않습니다**.
       - CLI `--reset`은 기본값으로 `config+creds+sessions`입니다. 워크스페이스도 제거하려면 `--reset-scope full`을 사용하십시오.
       - 구성이 유효하지 않거나 레거시 키가 포함된 경우 마법사가 중단되고 계속하기 전에 `openclaw doctor`를 실행하도록 요청합니다.
       - 재설정은 `trash`를 사용합니다 (절대 `rm` 아님) 및 범위를 제공합니다:
         - 구성만
         - 구성 + 자격 증명 + 세션
         - 전체 재설정 (워크스페이스도 제거)

  2. **모델/인증**

   - **Anthropic API 키**: `ANTHROPIC_API_KEY`가 있으면 사용하거나 키를 입력하도록 요청한 다음 데몬 사용을 위해 저장합니다.
       - **Anthropic API 키**: 온보딩/구성에서 선호하는 Anthropic 어시스턴트 선택.
       - **Anthropic 설정 토큰**: 온보딩/구성에서 여전히 사용 가능하지만 사용 가능한 경우 OpenClaw는 이제 Claude CLI 재사용을 선호합니다.
       - **OpenAI Code (Codex) 구독 (Codex CLI)**: `~/.codex/auth.json`이 있으면 온보딩이 재사용할 수 있습니다. 재사용된 Codex CLI 자격 증명은 Codex CLI에 의해 관리됩니다. 만료 시 OpenClaw는 먼저 해당 소스를 다시 읽고, 프로바이더가 새로 고칠 수 있는 경우 새로 고친 자격 증명을 Codex 저장소에 다시 쓰는 대신 소유권을 갖지 않습니다.
       - **OpenAI Code (Codex) 구독 (OAuth)**: 브라우저 흐름; `code#state`를 붙여넣습니다.
         - 모델이 설정되지 않았거나 `openai/*`인 경우 `agents.defaults.model`을 `openai-codex/gpt-5.4`로 설정합니다.
       - **OpenAI API 키**: `OPENAI_API_KEY`가 있으면 사용하거나 키를 입력하도록 요청한 다음 인증 프로파일에 저장합니다.
         - 모델이 설정되지 않았거나, `openai/*`, 또는 `openai-codex/*`인 경우 `agents.defaults.model`을 `openai/gpt-5.4`로 설정합니다.
       - **xAI (Grok) API 키**: `XAI_API_KEY`를 요청하고 xAI를 모델 프로바이더로 구성합니다.
       - **OpenCode**: `OPENCODE_API_KEY` (또는 `OPENCODE_ZEN_API_KEY`, https://opencode.ai/auth 에서 받기)를 요청하고 Zen 또는 Go 카탈로그를 선택하게 합니다.
       - **Ollama**: Ollama 기본 URL을 요청하고, **클라우드 + 로컬** 또는 **로컬** 모드를 제공하고, 사용 가능한 모델을 검색하고, 필요 시 선택한 로컬 모델을 자동으로 풀합니다.
       - 자세한 내용: [Ollama](/providers/ollama)
       - **API 키**: 키를 저장합니다.
       - **Vercel AI Gateway (멀티 모델 프록시)**: `AI_GATEWAY_API_KEY`를 요청합니다.
       - 자세한 내용: [Vercel AI Gateway](/providers/vercel-ai-gateway)
       - **Cloudflare AI Gateway**: 계정 ID, 게이트웨이 ID, `CLOUDFLARE_AI_GATEWAY_API_KEY`를 요청합니다.
       - 자세한 내용: [Cloudflare AI Gateway](/providers/cloudflare-ai-gateway)
       - **MiniMax**: 구성이 자동으로 작성됩니다. 호스팅 기본값은 `MiniMax-M2.7`입니다.
         API 키 설정은 `minimax/...`를 사용하고, OAuth 설정은 `minimax-portal/...`을 사용합니다.
       - 자세한 내용: [MiniMax](/providers/minimax)
       - **StepFun**: 중국 또는 글로벌 엔드포인트의 StepFun 표준 또는 Step Plan에 대한 구성이 자동으로 작성됩니다.
       - 표준에는 현재 `step-3.5-flash`가 포함되며, Step Plan에는 `step-3.5-flash-2603`도 포함됩니다.
       - 자세한 내용: [StepFun](/providers/stepfun)
       - **Synthetic (Anthropic 호환)**: `SYNTHETIC_API_KEY`를 요청합니다.
       - 자세한 내용: [Synthetic](/providers/synthetic)
       - **Moonshot (Kimi K2)**: 구성이 자동으로 작성됩니다.
       - **Kimi Coding**: 구성이 자동으로 작성됩니다.
       - 자세한 내용: [Moonshot AI (Kimi + Kimi Coding)](/providers/moonshot)
       - **건너뛰기**: 아직 인증이 구성되지 않음.
       - 감지된 옵션에서 기본 모델을 선택하거나 provider/model을 수동으로 입력합니다. 최상의 품질과 낮은 프롬프트 주입 위험을 위해 프로바이더 스택에서 사용 가능한 가장 강력한 최신 모델을 선택하십시오.
       - 온보딩은 모델 검사를 실행하고 구성된 모델이 알 수 없거나 인증이 없는 경우 경고합니다.
       - API 키 저장 모드는 기본적으로 일반 텍스트 인증 프로파일 값입니다. 대신 환경 기반 참조를 저장하려면 `--secret-input-mode ref`를 사용하십시오 (예: `keyRef: { source: "env", provider: "default", id: "OPENAI_API_KEY" }`).
       - 인증 프로파일은 `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-profiles.json` (API 키 + OAuth)에 있습니다. `~/.openclaw/credentials/oauth.json`은 레거시 임포트 전용입니다.
       - 자세한 내용: [/concepts/oauth](/concepts/oauth)
       ::: info NOTE
   헤드리스/서버 팁: 브라우저가 있는 기기에서 OAuth를 완료한 다음,
       해당 에이전트의 `auth-profiles.json` (예:
       `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-profiles.json`, 또는 일치하는
       `$OPENCLAW_STATE_DIR/...` 경로)을 게이트웨이 호스트에 복사하십시오. `credentials/oauth.json`은
       레거시 임포트 소스에 불과합니다.
   :::

  3. **워크스페이스**

   - 기본값 `~/.openclaw/workspace` (구성 가능).
       - 에이전트 부트스트랩 의식에 필요한 워크스페이스 파일을 시드합니다.
       - 전체 워크스페이스 레이아웃 + 백업 가이드: [에이전트 워크스페이스](/concepts/agent-workspace)

  4. **게이트웨이**

   - 포트, 바인드, 인증 모드, tailscale 노출.
       - 인증 권장 사항: 로컬 WS 클라이언트가 인증해야 하도록 루프백에서도 **토큰**을 유지하십시오.
       - 토큰 모드에서 대화형 설정 제공:
         - **일반 텍스트 토큰 생성/저장** (기본값)
         - **SecretRef 사용** (옵트인)
         - 빠른 시작은 온보딩 프로브/대시보드 부트스트랩을 위해 `env`, `file`, `exec` 프로바이더 전반에 걸쳐 기존 `gateway.auth.token` SecretRef를 재사용합니다.
         - 해당 SecretRef가 구성되었지만 확인할 수 없는 경우 온보딩은 런타임 인증을 자동으로 저하하는 대신 명확한 수정 메시지와 함께 일찍 실패합니다.
       - 비밀번호 모드에서 대화형 설정도 일반 텍스트 또는 SecretRef 저장을 지원합니다.
       - 비대화형 토큰 SecretRef 경로: `--gateway-token-ref-env &lt;ENV_VAR&gt;`.
         - 온보딩 프로세스 환경에서 비어 있지 않은 환경 변수가 필요합니다.
         - `--gateway-token`과 결합할 수 없습니다.
       - 모든 로컬 프로세스를 완전히 신뢰하는 경우에만 인증을 비활성화하십시오.
       - 비 루프백 바인드는 여전히 인증이 필요합니다.

  5. **채널**

   - [WhatsApp](/channels/whatsapp): 선택적 QR 로그인.
       - [Telegram](/channels/telegram): 봇 토큰.
       - [Discord](/channels/discord): 봇 토큰.
       - [Google Chat](/channels/googlechat): 서비스 계정 JSON + 웹훅 대상.
       - [Mattermost](/channels/mattermost) (플러그인): 봇 토큰 + 기본 URL.
       - [Signal](/channels/signal): 선택적 `signal-cli` 설치 + 계정 구성.
       - [BlueBubbles](/channels/bluebubbles): **iMessage에 권장**; 서버 URL + 비밀번호 + 웹훅.
       - [iMessage](/channels/imessage): 레거시 `imsg` CLI 경로 + DB 액세스.
       - DM 보안: 기본값은 페어링. 첫 번째 DM은 코드를 전송합니다. `openclaw pairing approve &lt;channel&gt; <code>`를 통해 승인하거나 허용 목록을 사용하십시오.

  6. **웹 검색**

   - Brave, DuckDuckGo, Exa, Firecrawl, Gemini, Grok, Kimi, MiniMax Search, Ollama Web Search, Perplexity, SearXNG, Tavily와 같은 지원되는 프로바이더를 선택하거나 건너뜁니다.
       - API 기반 프로바이더는 빠른 설정을 위해 환경 변수 또는 기존 구성을 사용할 수 있습니다. 키 불필요 프로바이더는 프로바이더별 사전 요구 사항을 사용합니다.
       - `--skip-search`로 건너뜁니다.
       - 나중에 구성: `openclaw configure --section web`.

  7. **데몬 설치**

   - macOS: LaunchAgent
         - 로그인된 사용자 세션이 필요합니다. 헤드리스의 경우 사용자 정의 LaunchDaemon을 사용하십시오 (제공되지 않음).
       - Linux (및 WSL2를 통한 Windows): systemd 사용자 유닛
         - 온보딩은 로그아웃 후에도 게이트웨이가 계속 실행되도록 `loginctl enable-linger &lt;user&gt;`를 통해 lingering 활성화를 시도합니다.
         - sudo가 필요할 수 있습니다 (`/var/lib/systemd/linger`에 씁니다). 먼저 sudo 없이 시도합니다.
       - **런타임 선택:** Node (권장; WhatsApp/Telegram에 필요). Bun은 **권장되지 않습니다**.
       - 토큰 인증에 토큰이 필요하고 `gateway.auth.token`이 SecretRef 관리인 경우 데몬 설치는 이를 검증하지만 슈퍼바이저 서비스 환경 메타데이터에 확인된 일반 텍스트 토큰 값을 지속하지 않습니다.
       - 토큰 인증에 토큰이 필요하고 구성된 토큰 SecretRef가 확인되지 않는 경우 실행 가능한 지침과 함께 데몬 설치가 차단됩니다.
       - `gateway.auth.token`과 `gateway.auth.password`가 모두 구성되어 있고 `gateway.auth.mode`가 설정되지 않은 경우 모드가 명시적으로 설정될 때까지 데몬 설치가 차단됩니다.

  8. **상태 확인**

   - 게이트웨이를 시작 (필요한 경우)하고 `openclaw health`를 실행합니다.
       - 팁: `openclaw status --deep`은 채널 프로브 (지원되는 경우)를 포함한 라이브 게이트웨이 상태 프로브를 상태 출력에 추가합니다 (접근 가능한 게이트웨이가 필요합니다).

  9. **스킬 (권장)**

   - 사용 가능한 스킬을 읽고 요구 사항을 확인합니다.
       - 노드 관리자를 선택하게 합니다: **npm / pnpm** (bun은 권장되지 않음).
       - 선택적 종속성을 설치합니다 (일부는 macOS에서 Homebrew를 사용합니다).

  10. **완료**

   - iOS/Android/macOS 앱을 포함한 추가 기능에 대한 요약 + 다음 단계.


::: info NOTE
GUI가 감지되지 않으면 온보딩은 브라우저를 열지 않고 Control UI를 위한 SSH 포트 포워드 지침을 출력합니다.
Control UI 에셋이 없으면 온보딩은 빌드를 시도합니다. 폴백은 `pnpm ui:build`입니다 (UI 종속성 자동 설치).
:::


## 비대화형 모드

온보딩을 자동화하거나 스크립팅하려면 `--non-interactive`를 사용하십시오:

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice apiKey \
  --anthropic-api-key "$ANTHROPIC_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback \
  --install-daemon \
  --daemon-runtime node \
  --skip-skills
```

머신 읽기 가능한 요약을 위해 `--json`을 추가하십시오.

비대화형 모드에서 게이트웨이 토큰 SecretRef:

```bash
export OPENCLAW_GATEWAY_TOKEN="your-token"
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice skip \
  --gateway-auth token \
  --gateway-token-ref-env OPENCLAW_GATEWAY_TOKEN
```

`--gateway-token`과 `--gateway-token-ref-env`는 상호 배타적입니다.

::: info NOTE
`--json`은 비대화형 모드를 의미하지 **않습니다**. 스크립트에는 `--non-interactive` (및 `--workspace`)를 사용하십시오.
:::


프로바이더별 명령 예시는 [CLI 자동화](/start/wizard-cli-automation#provider-specific-examples)에 있습니다.
플래그 의미론 및 단계 순서는 이 레퍼런스 페이지를 사용하십시오.

### 에이전트 추가 (비대화형)

```bash
openclaw agents add work \
  --workspace ~/.openclaw/workspace-work \
  --model openai/gpt-5.4 \
  --bind whatsapp:biz \
  --non-interactive \
  --json
```

## 게이트웨이 마법사 RPC

게이트웨이는 RPC를 통해 온보딩 흐름을 노출합니다 (`wizard.start`, `wizard.next`, `wizard.cancel`, `wizard.status`).
클라이언트 (macOS 앱, Control UI)는 온보딩 로직을 다시 구현하지 않고 단계를 렌더링할 수 있습니다.

## Signal 설정 (signal-cli)

온보딩은 GitHub 릴리스에서 `signal-cli`를 설치할 수 있습니다:

- 적절한 릴리스 에셋을 다운로드합니다.
- `~/.openclaw/tools/signal-cli/&lt;version&gt;/` 아래에 저장합니다.
- `channels.signal.cliPath`를 구성에 씁니다.

메모:

- JVM 빌드에는 **Java 21**이 필요합니다.
- 사용 가능한 경우 네이티브 빌드가 사용됩니다.
- Windows는 WSL2를 사용합니다. signal-cli 설치는 WSL 내에서 Linux 흐름을 따릅니다.

## 마법사가 쓰는 내용

`~/.openclaw/openclaw.json`의 일반적인 필드:

- `agents.defaults.workspace`
- `agents.defaults.model` / `models.providers` (Minimax를 선택한 경우)
- `tools.profile` (로컬 온보딩은 설정되지 않은 경우 `"coding"`으로 기본 설정됩니다. 기존 명시적 값은 보존됩니다)
- `gateway.*` (모드, 바인드, 인증, tailscale)
- `session.dmScope` (동작 세부 사항: [CLI 설정 레퍼런스](/start/wizard-cli-reference#outputs-and-internals))
- `channels.telegram.botToken`, `channels.discord.token`, `channels.matrix.*`, `channels.signal.*`, `channels.imessage.*`
- 채널 허용 목록 (Slack/Discord/Matrix/Microsoft Teams) - 프롬프트 중에 옵트인하는 경우 (이름은 가능하면 ID로 확인됩니다).
- `skills.install.nodeManager`
  - `setup --node-manager`는 `npm`, `pnpm`, 또는 `bun`을 허용합니다.
  - 수동 구성은 `skills.install.nodeManager`를 직접 설정하여 `yarn`을 계속 사용할 수 있습니다.
- `wizard.lastRunAt`
- `wizard.lastRunVersion`
- `wizard.lastRunCommit`
- `wizard.lastRunCommand`
- `wizard.lastRunMode`

`openclaw agents add`는 `agents.list[]` 및 선택적 `bindings`를 씁니다.

WhatsApp 자격 증명은 `~/.openclaw/credentials/whatsapp/&lt;accountId&gt;/` 아래에 저장됩니다.
세션은 `~/.openclaw/agents/&lt;agentId&gt;/sessions/` 아래에 저장됩니다.

일부 채널은 플러그인으로 제공됩니다. 설정 중에 하나를 선택하면 온보딩이 구성하기 전에 설치하도록 요청합니다 (npm 또는 로컬 경로).

## 관련 문서

- 온보딩 개요: [온보딩 (CLI)](/start/wizard)
- macOS 앱 온보딩: [온보딩](/start/onboarding)
- 구성 레퍼런스: [게이트웨이 구성](/gateway/configuration)
- 프로바이더: [WhatsApp](/channels/whatsapp), [Telegram](/channels/telegram), [Discord](/channels/discord), [Google Chat](/channels/googlechat), [Signal](/channels/signal), [BlueBubbles](/channels/bluebubbles) (iMessage), [iMessage](/channels/imessage) (레거시)
- 스킬: [스킬](/tools/skills), [스킬 구성](/tools/skills-config)
