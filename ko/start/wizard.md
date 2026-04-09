---
summary: "게이트웨이, 워크스페이스, 채널 및 스킬을 위한 CLI 안내 설정"
read_when:
  - CLI 온보딩을 실행하거나 구성할 때
  - 새 머신 설정
title: "온보딩 (CLI)"
sidebarTitle: "온보딩: CLI"
---

# 온보딩 (CLI)

CLI 온보딩은 macOS, Linux 또는 Windows (WSL2를 통해; 강력히 권장)에서 OpenClaw를 설정하는 **권장** 방법입니다.
하나의 안내 흐름으로 로컬 Gateway 또는 원격 Gateway 연결과 채널, 스킬 및 워크스페이스 기본값을 구성합니다.

```bash
openclaw onboard
```

<Info>
가장 빠른 첫 번째 채팅: Control UI를 여십시오 (채널 설정 불필요). `openclaw dashboard`를 실행하고 브라우저에서 채팅하십시오. 문서: [대시보드](/web/dashboard).
</Info>

나중에 재구성하려면:

```bash
openclaw configure
openclaw agents add <name>
```

<Note>
`--json`은 비대화형 모드를 의미하지 않습니다. 스크립트에는 `--non-interactive`를 사용하십시오.
</Note>

<Tip>
CLI 온보딩에는 Brave, DuckDuckGo, Exa, Firecrawl, Gemini, Grok, Kimi, MiniMax Search,
Ollama Web Search, Perplexity, SearXNG 또는 Tavily와 같은 프로바이더를 선택할 수 있는 웹 검색 단계가 포함됩니다. 일부 프로바이더는 API 키가 필요하고 다른 일부는 키가 필요 없습니다. `openclaw configure --section web`으로 나중에 구성할 수도 있습니다. 문서: [웹 도구](/tools/web).
</Tip>

## 빠른 시작 vs 고급

온보딩은 **빠른 시작** (기본값) vs **고급** (전체 제어)으로 시작합니다.

<Tabs>
  <Tab title="빠른 시작 (기본값)">
    - 로컬 게이트웨이 (루프백)
    - 워크스페이스 기본값 (또는 기존 워크스페이스)
    - 게이트웨이 포트 **18789**
    - 게이트웨이 인증 **토큰** (자동 생성, 루프백에서도)
    - 새 로컬 설정의 기본 도구 정책: `tools.profile: "coding"` (기존 명시적 프로파일은 보존됩니다)
    - DM 격리 기본값: 로컬 온보딩은 설정되지 않은 경우 `session.dmScope: "per-channel-peer"`를 작성합니다. 자세한 내용: [CLI 설정 참조](/start/wizard-cli-reference#outputs-and-internals)
    - Tailscale 노출 **끄기**
    - Telegram + WhatsApp DM은 기본적으로 **허용 목록**을 사용합니다 (전화번호를 입력하도록 요청합니다)
  </Tab>
  <Tab title="고급 (전체 제어)">
    - 모든 단계를 노출합니다 (모드, 워크스페이스, 게이트웨이, 채널, 데몬, 스킬).
  </Tab>
</Tabs>

## 온보딩이 구성하는 항목

**로컬 모드 (기본값)**는 다음 단계를 안내합니다:

1. **모델/인증** — 지원되는 모든 프로바이더/인증 흐름을 선택합니다 (API 키, OAuth 또는 프로바이더별 수동 인증), Custom Provider 포함
   (OpenAI 호환, Anthropic 호환 또는 알 수 없음 자동 감지). 기본 모델을 선택합니다.
   보안 참고: 이 에이전트가 도구를 실행하거나 웹훅/훅 콘텐츠를 처리할 경우, 사용 가능한 가장 강력한 최신 세대 모델을 선호하고 도구 정책을 엄격하게 유지하십시오. 약한/오래된 티어는 프롬프트 인젝션이 더 쉽습니다.
   비대화형 실행의 경우, `--secret-input-mode ref`는 평문 API 키 값 대신 환경 변수 기반 참조를 인증 프로파일에 저장합니다.
   비대화형 `ref` 모드에서, 프로바이더 환경 변수가 설정되어 있어야 합니다; 해당 환경 변수 없이 인라인 키 플래그를 전달하면 빠르게 실패합니다.
   대화형 실행에서, 비밀 참조 모드를 선택하면 환경 변수 또는 구성된 프로바이더 참조 (`file` 또는 `exec`)를 가리킬 수 있으며, 저장 전 빠른 사전 검증이 실행됩니다.
   Anthropic의 경우, 대화형 온보딩/구성은 기본 로컬 경로로 **Anthropic Claude CLI**를 제공하고 권장 프로덕션 경로로 **Anthropic API 키**를 제공합니다. Anthropic 설정 토큰도 지원되는 토큰 인증 경로로 계속 사용 가능합니다.
2. **워크스페이스** — 에이전트 파일의 위치 (기본값 `~/.openclaw/workspace`). 부트스트랩 파일을 초기화합니다.
3. **Gateway** — 포트, 바인드 주소, 인증 모드, Tailscale 노출.
   대화형 토큰 모드에서, 기본 평문 토큰 저장 또는 SecretRef 옵트인을 선택합니다.
   비대화형 토큰 SecretRef 경로: `--gateway-token-ref-env <ENV_VAR>`.
4. **채널** — BlueBubbles, Discord, Feishu, Google Chat, Mattermost, Microsoft Teams, QQ Bot, Signal, Slack, Telegram, WhatsApp 등의 내장 및 번들 채팅 채널.
5. **데몬** — LaunchAgent (macOS), systemd 사용자 유닛 (Linux/WSL2) 또는 사용자별 Startup 폴더 대체 기능이 있는 네이티브 Windows 예약 작업을 설치합니다.
   토큰 인증에 토큰이 필요하고 `gateway.auth.token`이 SecretRef로 관리되는 경우, 데몬 설치가 이를 검증하지만 확인된 토큰을 감독자 서비스 환경 메타데이터에 유지하지 않습니다.
   토큰 인증에 토큰이 필요하고 구성된 토큰 SecretRef가 확인되지 않은 경우, 데몬 설치가 실행 가능한 안내와 함께 차단됩니다.
   `gateway.auth.token`과 `gateway.auth.password` 모두 구성되어 있고 `gateway.auth.mode`가 설정되지 않은 경우, 모드가 명시적으로 설정될 때까지 데몬 설치가 차단됩니다.
6. **헬스 체크** — Gateway를 시작하고 실행 중인지 확인합니다.
7. **스킬** — 권장 스킬 및 선택적 의존성을 설치합니다.

<Note>
온보딩을 다시 실행해도 명시적으로 **재설정**을 선택 (또는 `--reset`을 전달)하지 않는 한 아무것도 지우지 **않습니다**.
CLI `--reset`은 기본적으로 구성, 자격 증명 및 세션을 재설정합니다; 워크스페이스를 포함하려면 `--reset-scope full`을 사용하십시오.
구성이 잘못되었거나 레거시 키가 포함된 경우, 온보딩은 먼저 `openclaw doctor`를 실행하도록 요청합니다.
</Note>

**원격 모드**는 로컬 클라이언트가 다른 곳의 Gateway에 연결하도록만 구성합니다.
원격 호스트에서는 아무것도 설치하거나 변경하지 **않습니다**.

## 다른 에이전트 추가

`openclaw agents add <name>`을 사용하여 자체 워크스페이스, 세션 및 인증 프로파일을 가진 별도의 에이전트를 생성하십시오. `--workspace` 없이 실행하면 온보딩이 시작됩니다.

설정 항목:

- `agents.list[].name`
- `agents.list[].workspace`
- `agents.list[].agentDir`

참고:

- 기본 워크스페이스는 `~/.openclaw/workspace-<agentId>`를 따릅니다.
- 인바운드 메시지 라우팅을 위해 `bindings`를 추가하십시오 (온보딩이 이를 수행할 수 있습니다).
- 비대화형 플래그: `--model`, `--agent-dir`, `--bind`, `--non-interactive`.

## 전체 참조

단계별 세부 분류 및 구성 출력에 대해서는
[CLI 설정 참조](/start/wizard-cli-reference)를 참조하십시오.
비대화형 예시는 [CLI 자동화](/start/wizard-cli-automation)를 참조하십시오.
RPC 세부 정보를 포함한 더 깊은 기술 참조는
[온보딩 참조](/reference/wizard)를 참조하십시오.

## 관련 문서

- CLI 명령 참조: [`openclaw onboard`](/cli/onboard)
- 온보딩 개요: [온보딩 개요](/start/onboarding-overview)
- macOS 앱 온보딩: [온보딩](/start/onboarding)
- 에이전트 최초 실행 의식: [에이전트 부트스트랩](/start/bootstrapping)
