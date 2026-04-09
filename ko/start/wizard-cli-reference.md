---
summary: "CLI 설정 흐름, 인증/모델 설정, 출력 및 내부 구조에 대한 완전한 참조"
read_when:
  - openclaw onboard의 자세한 동작이 필요할 때
  - 온보딩 결과를 디버깅하거나 온보딩 클라이언트를 통합할 때
title: "CLI 설정 참조"
sidebarTitle: "CLI 참조"
---

# CLI 설정 참조

이 페이지는 `openclaw onboard`의 전체 참조입니다.
간단한 가이드는 [온보딩 (CLI)](/start/wizard)를 참조하십시오.

## 마법사가 수행하는 작업

로컬 모드 (기본값)는 다음을 안내합니다:

- 모델 및 인증 설정 (OpenAI Code 구독 OAuth, Anthropic Claude CLI 또는 API 키, MiniMax, GLM, Ollama, Moonshot, StepFun 및 AI Gateway 옵션 포함)
- 워크스페이스 위치 및 부트스트랩 파일
- Gateway 설정 (포트, 바인드, 인증, tailscale)
- 채널 및 프로바이더 (Telegram, WhatsApp, Discord, Google Chat, Mattermost, Signal, BlueBubbles 및 기타 번들 채널 플러그인)
- 데몬 설치 (LaunchAgent, systemd 사용자 유닛 또는 Startup 폴더 대체 기능이 있는 네이티브 Windows 예약 작업)
- 헬스 체크
- 스킬 설정

원격 모드는 이 머신이 다른 곳의 게이트웨이에 연결하도록 구성합니다.
원격 호스트에서는 아무것도 설치하거나 수정하지 않습니다.

## 로컬 흐름 세부 정보

<Steps>
  <Step title="기존 구성 감지">
    - `~/.openclaw/openclaw.json`이 존재하면 유지, 수정 또는 재설정을 선택합니다.
    - 마법사를 다시 실행해도 재설정을 명시적으로 선택하지 않는 한 (또는 `--reset`을 전달하지 않는 한) 아무것도 지우지 않습니다.
    - CLI `--reset`은 기본값으로 `config+creds+sessions`입니다; 워크스페이스도 제거하려면 `--reset-scope full`을 사용하십시오.
    - 구성이 잘못되었거나 레거시 키가 포함된 경우, 마법사는 계속하기 전에 `openclaw doctor`를 실행하도록 요청합니다.
    - 재설정은 `trash`를 사용하고 다음 범위를 제공합니다:
      - 구성만
      - 구성 + 자격 증명 + 세션
      - 전체 재설정 (워크스페이스도 제거)
  </Step>
  <Step title="모델 및 인증">
    - 전체 옵션 매트릭스는 [인증 및 모델 옵션](#auth-and-model-options)에 있습니다.
  </Step>
  <Step title="워크스페이스">
    - 기본값 `~/.openclaw/workspace` (구성 가능).
    - 최초 실행 부트스트랩 의식에 필요한 워크스페이스 파일을 초기화합니다.
    - 워크스페이스 레이아웃: [에이전트 워크스페이스](/concepts/agent-workspace).
  </Step>
  <Step title="Gateway">
    - 포트, 바인드, 인증 모드 및 tailscale 노출에 대한 프롬프트.
    - 권장: 로컬 WS 클라이언트가 인증해야 하도록 루프백에서도 토큰 인증을 활성화한 상태로 유지하십시오.
    - 토큰 모드에서, 대화형 설정은 다음을 제공합니다:
      - **평문 토큰 생성/저장** (기본값)
      - **SecretRef 사용** (옵트인)
    - 비밀번호 모드에서, 대화형 설정도 평문 또는 SecretRef 저장을 지원합니다.
    - 비대화형 토큰 SecretRef 경로: `--gateway-token-ref-env <ENV_VAR>`.
      - 온보딩 프로세스 환경에서 비어 있지 않은 환경 변수가 필요합니다.
      - `--gateway-token`과 결합할 수 없습니다.
    - 모든 로컬 프로세스를 완전히 신뢰하는 경우에만 인증을 비활성화하십시오.
    - 루프백이 아닌 바인드에는 여전히 인증이 필요합니다.
  </Step>
  <Step title="채널">
    - [WhatsApp](/channels/whatsapp): 선택적 QR 로그인
    - [Telegram](/channels/telegram): 봇 토큰
    - [Discord](/channels/discord): 봇 토큰
    - [Google Chat](/channels/googlechat): 서비스 계정 JSON + 웹훅 대상
    - [Mattermost](/channels/mattermost): 봇 토큰 + 기본 URL
    - [Signal](/channels/signal): 선택적 `signal-cli` 설치 + 계정 구성
    - [BlueBubbles](/channels/bluebubbles): iMessage에 권장; 서버 URL + 비밀번호 + 웹훅
    - [iMessage](/channels/imessage): 레거시 `imsg` CLI 경로 + DB 접근
    - DM 보안: 기본값은 페어링입니다. 첫 번째 DM은 코드를 보냅니다;
      `openclaw pairing approve <channel> <code>`를 통해 승인하거나 허용 목록을 사용하십시오.
  </Step>
  <Step title="데몬 설치">
    - macOS: LaunchAgent
      - 로그인된 사용자 세션이 필요합니다; 헤드리스의 경우 맞춤 LaunchDaemon을 사용하십시오 (제공되지 않음).
    - WSL2를 통한 Linux 및 Windows: systemd 사용자 유닛
      - 마법사는 로그아웃 후에도 게이트웨이가 계속 실행되도록 `loginctl enable-linger <user>`를 시도합니다.
      - sudo를 요청할 수 있습니다 (`/var/lib/systemd/linger`를 작성합니다); 먼저 sudo 없이 시도합니다.
    - 네이티브 Windows: 예약 작업 우선
      - 작업 생성이 거부되면 OpenClaw는 사용자별 Startup 폴더 로그인 항목으로 대체하고 즉시 게이트웨이를 시작합니다.
      - 더 나은 감독 상태를 제공하므로 예약 작업이 선호됩니다.
    - 런타임 선택: Node (권장; WhatsApp 및 Telegram에 필요). Bun은 권장하지 않습니다.
  </Step>
  <Step title="헬스 체크">
    - 게이트웨이를 시작하고 (필요한 경우) `openclaw health`를 실행합니다.
    - `openclaw status --deep`은 채널 프로브가 지원될 때 채널 프로브를 포함한 라이브 게이트웨이 헬스 프로브를 상태 출력에 추가합니다.
  </Step>
  <Step title="스킬">
    - 사용 가능한 스킬을 읽고 요구 사항을 확인합니다.
    - 노드 관리자 선택: npm, pnpm 또는 bun.
    - 선택적 의존성을 설치합니다 (일부는 macOS에서 Homebrew를 사용합니다).
  </Step>
  <Step title="완료">
    - 요약 및 iOS, Android 및 macOS 앱 옵션을 포함한 다음 단계.
  </Step>
</Steps>

<Note>
GUI가 감지되지 않으면, 마법사는 브라우저를 여는 대신 Control UI에 대한 SSH 포트 포워드 지침을 출력합니다.
Control UI 에셋이 없으면 마법사가 빌드를 시도합니다; 대체는 `pnpm ui:build`입니다 (UI 의존성 자동 설치).
</Note>

## 원격 모드 세부 정보

원격 모드는 이 머신이 다른 곳의 게이트웨이에 연결하도록 구성합니다.

<Info>
원격 모드는 원격 호스트에서 아무것도 설치하거나 수정하지 않습니다.
</Info>

설정 항목:

- 원격 게이트웨이 URL (`ws://...`)
- 원격 게이트웨이 인증이 필요한 경우 토큰 (권장)

<Note>
- 게이트웨이가 루프백 전용인 경우 SSH 터널링 또는 tailnet을 사용하십시오.
- 디스커버리 힌트:
  - macOS: Bonjour (`dns-sd`)
  - Linux: Avahi (`avahi-browse`)
</Note>

## 인증 및 모델 옵션

<AccordionGroup>
  <Accordion title="Anthropic API 키">
    `ANTHROPIC_API_KEY`가 있으면 사용하거나 키를 요청한 후 데몬 사용을 위해 저장합니다.
  </Accordion>
  <Accordion title="OpenAI Code 구독 (Codex CLI 재사용)">
    `~/.codex/auth.json`이 존재하면 마법사가 재사용할 수 있습니다.
    재사용된 Codex CLI 자격 증명은 Codex CLI에서 관리됩니다; 만료 시 OpenClaw는
    해당 소스를 먼저 다시 읽고, 프로바이더가 이를 새로 고침할 수 있을 때는
    소유권을 가져가는 대신 새로 고침된 자격 증명을 Codex 저장소에 다시 씁니다.
  </Accordion>
  <Accordion title="OpenAI Code 구독 (OAuth)">
    브라우저 흐름; `code#state`를 붙여넣으십시오.

    모델이 설정되지 않았거나 `openai/*`인 경우 `agents.defaults.model`을 `openai-codex/gpt-5.4`로 설정합니다.

  </Accordion>
  <Accordion title="OpenAI API 키">
    `OPENAI_API_KEY`가 있으면 사용하거나 키를 요청한 후 인증 프로파일에 자격 증명을 저장합니다.

    모델이 설정되지 않았거나 `openai/*` 또는 `openai-codex/*`인 경우 `agents.defaults.model`을 `openai/gpt-5.4`로 설정합니다.

  </Accordion>
  <Accordion title="xAI (Grok) API 키">
    `XAI_API_KEY`를 요청하고 xAI를 모델 프로바이더로 구성합니다.
  </Accordion>
  <Accordion title="OpenCode">
    `OPENCODE_API_KEY` (또는 `OPENCODE_ZEN_API_KEY`)를 요청하고 Zen 또는 Go 카탈로그를 선택합니다.
    설정 URL: [opencode.ai/auth](https://opencode.ai/auth).
  </Accordion>
  <Accordion title="API 키 (일반)">
    키를 저장합니다.
  </Accordion>
  <Accordion title="Vercel AI Gateway">
    `AI_GATEWAY_API_KEY`를 요청합니다.
    자세한 내용: [Vercel AI Gateway](/providers/vercel-ai-gateway).
  </Accordion>
  <Accordion title="Cloudflare AI Gateway">
    계정 ID, 게이트웨이 ID 및 `CLOUDFLARE_AI_GATEWAY_API_KEY`를 요청합니다.
    자세한 내용: [Cloudflare AI Gateway](/providers/cloudflare-ai-gateway).
  </Accordion>
  <Accordion title="MiniMax">
    구성이 자동으로 작성됩니다. 호스팅된 기본값은 `MiniMax-M2.7`입니다; API 키 설정은
    `minimax/...`를 사용하고, OAuth 설정은 `minimax-portal/...`를 사용합니다.
    자세한 내용: [MiniMax](/providers/minimax).
  </Accordion>
  <Accordion title="StepFun">
    중국 또는 글로벌 엔드포인트의 StepFun 표준 또는 Step Plan에 대해 구성이 자동으로 작성됩니다.
    표준에는 현재 `step-3.5-flash`가 포함되며, Step Plan에도 `step-3.5-flash-2603`이 포함됩니다.
    자세한 내용: [StepFun](/providers/stepfun).
  </Accordion>
  <Accordion title="Synthetic (Anthropic 호환)">
    `SYNTHETIC_API_KEY`를 요청합니다.
    자세한 내용: [Synthetic](/providers/synthetic).
  </Accordion>
  <Accordion title="Ollama (클라우드 및 로컬 오픈 모델)">
    기본 URL (기본값 `http://127.0.0.1:11434`)을 요청한 후 클라우드 + 로컬 또는 로컬 모드를 제공합니다.
    사용 가능한 모델을 검색하고 기본값을 제안합니다.
    자세한 내용: [Ollama](/providers/ollama).
  </Accordion>
  <Accordion title="Moonshot 및 Kimi Coding">
    Moonshot (Kimi K2) 및 Kimi Coding 구성이 자동으로 작성됩니다.
    자세한 내용: [Moonshot AI (Kimi + Kimi Coding)](/providers/moonshot).
  </Accordion>
  <Accordion title="맞춤형 프로바이더">
    OpenAI 호환 및 Anthropic 호환 엔드포인트와 함께 작동합니다.

    대화형 온보딩은 다른 프로바이더 API 키 흐름과 동일한 API 키 저장 선택을 지원합니다:
    - **지금 API 키 붙여넣기** (평문)
    - **비밀 참조 사용** (환경 변수 참조 또는 구성된 프로바이더 참조, 사전 검증 포함)

    비대화형 플래그:
    - `--auth-choice custom-api-key`
    - `--custom-base-url`
    - `--custom-model-id`
    - `--custom-api-key` (선택 사항; `CUSTOM_API_KEY`로 대체됨)
    - `--custom-provider-id` (선택 사항)
    - `--custom-compatibility <openai|anthropic>` (선택 사항; 기본값 `openai`)

  </Accordion>
  <Accordion title="건너뛰기">
    인증을 구성되지 않은 상태로 둡니다.
  </Accordion>
</AccordionGroup>

모델 동작:

- 감지된 옵션에서 기본 모델을 선택하거나 프로바이더 및 모델을 수동으로 입력합니다.
- 온보딩이 프로바이더 인증 선택에서 시작되면, 모델 선택기는 해당 프로바이더를 자동으로 선호합니다. Volcengine 및 BytePlus의 경우, 동일한 선호도가 코딩 플랜 변형 (`volcengine-plan/*`, `byteplus-plan/*`)에도 적용됩니다.
- 선호 프로바이더 필터가 비어 있으면, 선택기는 모델이 없는 상태로 표시하는 대신 전체 카탈로그로 대체됩니다.
- 마법사는 모델 확인을 실행하고 구성된 모델이 알 수 없거나 인증이 없는 경우 경고합니다.

자격 증명 및 프로파일 경로:

- 인증 프로파일 (API 키 + OAuth): `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- 레거시 OAuth 가져오기: `~/.openclaw/credentials/oauth.json`

자격 증명 저장 모드:

- 기본 온보딩 동작은 API 키를 인증 프로파일의 평문 값으로 유지합니다.
- `--secret-input-mode ref`는 평문 키 저장 대신 참조 모드를 활성화합니다.
  대화형 설정에서 다음 중 하나를 선택할 수 있습니다:
  - 환경 변수 참조 (예: `keyRef: { source: "env", provider: "default", id: "OPENAI_API_KEY" }`)
  - 구성된 프로바이더 참조 (`file` 또는 `exec`) (프로바이더 별칭 + id 포함)
- 대화형 참조 모드는 저장 전 빠른 사전 검증을 실행합니다.
  - 환경 변수 참조: 현재 온보딩 환경에서 변수 이름 + 비어 있지 않은 값을 검증합니다.
  - 프로바이더 참조: 프로바이더 구성을 검증하고 요청된 id를 확인합니다.
  - 사전 검증이 실패하면 온보딩이 오류를 표시하고 재시도할 수 있습니다.
- 비대화형 모드에서 `--secret-input-mode ref`는 환경 변수 기반만 지원합니다.
  - 온보딩 프로세스 환경에서 프로바이더 환경 변수를 설정하십시오.
  - 인라인 키 플래그 (예: `--openai-api-key`)는 해당 환경 변수가 설정되어 있어야 합니다; 그렇지 않으면 온보딩이 빠르게 실패합니다.
  - 맞춤형 프로바이더의 경우, 비대화형 `ref` 모드는 `models.providers.<id>.apiKey`를 `{ source: "env", provider: "default", id: "CUSTOM_API_KEY" }`로 저장합니다.
  - 해당 맞춤형 프로바이더 경우, `--custom-api-key`는 `CUSTOM_API_KEY`가 설정되어 있어야 합니다; 그렇지 않으면 온보딩이 빠르게 실패합니다.
- Gateway 인증 자격 증명은 대화형 설정에서 평문 및 SecretRef 선택을 지원합니다:
  - 토큰 모드: **평문 토큰 생성/저장** (기본값) 또는 **SecretRef 사용**.
  - 비밀번호 모드: 평문 또는 SecretRef.
- 비대화형 토큰 SecretRef 경로: `--gateway-token-ref-env <ENV_VAR>`.
- 기존 평문 설정은 변경 없이 계속 작동합니다.

<Note>
헤드리스 및 서버 팁: 브라우저가 있는 머신에서 OAuth를 완료한 후,
해당 에이전트의 `auth-profiles.json` (예:
`~/.openclaw/agents/<agentId>/agent/auth-profiles.json` 또는 일치하는
`$OPENCLAW_STATE_DIR/...` 경로)을 게이트웨이 호스트로 복사하십시오. `credentials/oauth.json`은
레거시 가져오기 소스일 뿐입니다.
</Note>

## 출력 및 내부 구조

`~/.openclaw/openclaw.json`의 일반적인 필드:

- `agents.defaults.workspace`
- `agents.defaults.model` / `models.providers` (Minimax 선택 시)
- `tools.profile` (로컬 온보딩은 설정되지 않은 경우 기본값으로 `"coding"`을 사용합니다; 기존 명시적 값은 보존됩니다)
- `gateway.*` (모드, 바인드, 인증, tailscale)
- `session.dmScope` (로컬 온보딩은 설정되지 않은 경우 이를 `per-channel-peer`로 기본 설정합니다; 기존 명시적 값은 보존됩니다)
- `channels.telegram.botToken`, `channels.discord.token`, `channels.matrix.*`, `channels.signal.*`, `channels.imessage.*`
- 채널 허용 목록 (Slack, Discord, Matrix, Microsoft Teams) — 프롬프트에서 옵트인할 때 (이름이 가능한 경우 ID로 확인됩니다)
- `skills.install.nodeManager`
  - `setup --node-manager` 플래그는 `npm`, `pnpm` 또는 `bun`을 허용합니다.
  - 수동 구성은 나중에 `skills.install.nodeManager: "yarn"`을 설정할 수 있습니다.
- `wizard.lastRunAt`
- `wizard.lastRunVersion`
- `wizard.lastRunCommit`
- `wizard.lastRunCommand`
- `wizard.lastRunMode`

`openclaw agents add`는 `agents.list[]` 및 선택적 `bindings`를 작성합니다.

WhatsApp 자격 증명은 `~/.openclaw/credentials/whatsapp/<accountId>/` 아래에 있습니다.
세션은 `~/.openclaw/agents/<agentId>/sessions/` 아래에 저장됩니다.

<Note>
일부 채널은 플러그인으로 제공됩니다. 설정 중 선택하면 마법사가
채널 구성 전에 플러그인을 설치하도록 요청합니다 (npm 또는 로컬 경로).
</Note>

Gateway 마법사 RPC:

- `wizard.start`
- `wizard.next`
- `wizard.cancel`
- `wizard.status`

클라이언트 (macOS 앱 및 Control UI)는 온보딩 로직을 다시 구현하지 않고도 단계를 렌더링할 수 있습니다.

Signal 설정 동작:

- 적절한 릴리스 에셋을 다운로드합니다
- `~/.openclaw/tools/signal-cli/<version>/` 아래에 저장합니다
- 구성에 `channels.signal.cliPath`를 작성합니다
- JVM 빌드에는 Java 21이 필요합니다
- 가능한 경우 네이티브 빌드를 사용합니다
- Windows는 WSL2를 사용하고 WSL 내에서 Linux signal-cli 흐름을 따릅니다

## 관련 문서

- 온보딩 허브: [온보딩 (CLI)](/start/wizard)
- 자동화 및 스크립트: [CLI 자동화](/start/wizard-cli-automation)
- 명령 참조: [`openclaw onboard`](/cli/onboard)
