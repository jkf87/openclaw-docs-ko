---
summary: "핵심 OpenClaw 키, 기본값(default), 전용 서브시스템 reference 링크를 포함한 Gateway configuration reference"
title: "Configuration reference"
read_when:
  - 정확한 field 수준의 구성 의미나 기본값(default)이 필요할 때
  - channel, model, gateway, 또는 tool 구성 블록을 검증할 때
---

`~/.openclaw/openclaw.json`에 대한 핵심 configuration reference입니다. 작업 중심의 개요는 [Configuration](/gateway/configuration)을 참조하십시오.

이 페이지는 주요 OpenClaw 구성 영역(surface)을 다루며, 서브시스템에 자체 심화 reference가 있는 경우 링크로 연결합니다. 모든 channel/plugin 소유 커맨드 카탈로그나 모든 심화 memory/QMD 설정을 한 페이지에 인라인으로 포함하려 **하지 않습니다**.

Code 기준(truth):

- `openclaw config schema`는 validation 및 Control UI에서 사용하는 실시간 JSON Schema를 출력하며, 가용한 경우 번들/플러그인/채널 metadata가 병합됩니다
- `config.schema.lookup`은 드릴다운 툴링을 위해 경로 범위 하나의 schema 노드를 반환합니다
- `pnpm config:docs:check` / `pnpm config:docs:gen`은 현재 schema 표면에 대해 config-doc 기준 해시를 검증합니다

전용 심화 reference:

- [Memory configuration reference](/reference/memory-config) — `agents.defaults.memorySearch.*`, `memory.qmd.*`, `memory.citations`, 그리고 `plugins.entries.memory-core.config.dreaming` 하위의 dreaming 구성
- [Slash Commands](/tools/slash-commands) — 현재 빌트인 및 번들 커맨드 카탈로그
- 채널별 커맨드 영역은 해당 channel/plugin 페이지를 참조

Config 형식은 **JSON5**입니다(주석 + 후행 쉼표 허용). 모든 field는 선택 사항이며 — 생략 시 OpenClaw가 안전한 기본값(default)을 사용합니다.

---

## Channels

채널별 구성 키는 전용 페이지로 이동했습니다 —
[Configuration — channels](/gateway/config-channels)를 참조하여 `channels.*`에 대한 내용을 확인하십시오.
Slack, Discord, Telegram, WhatsApp, Matrix, iMessage 및 기타 번들 채널(인증, 접근 제어, 멀티 계정, 멘션 게이팅 포함)을 다룹니다.

## Agent defaults, multi-agent, sessions, messages

전용 페이지로 이동했습니다 —
[Configuration — agents](/gateway/config-agents)에서 다음을 확인하십시오:

- `agents.defaults.*` (workspace, model, thinking, heartbeat, memory, media, skills, sandbox)
- `multiAgent.*` (멀티 에이전트 라우팅 및 바인딩)
- `session.*` (세션 수명 주기, compaction, pruning)
- `messages.*` (메시지 전달, TTS, 마크다운 렌더링)
- `talk.*` (Talk 모드)
  - `talk.silenceTimeoutMs`: 설정되지 않은 경우, Talk는 transcript를 전송하기 전에 플랫폼 기본(default) 일시 정지 윈도우를 유지합니다(`macOS 및 Android에서는 700 ms, iOS에서는 900 ms`).

## Tools and custom providers

Tool 정책, 실험적 토글, provider 기반 tool 구성, custom provider / base-URL 설정은 전용 페이지로 이동했습니다 —
[Configuration — tools and custom providers](/gateway/config-tools)를 참조하십시오.

## Skills

```json5
{
  skills: {
    allowBundled: ["gemini", "peekaboo"],
    load: {
      extraDirs: ["~/Projects/agent-scripts/skills"],
    },
    install: {
      preferBrew: true,
      nodeManager: "npm", // npm | pnpm | yarn | bun
    },
    entries: {
      "image-lab": {
        apiKey: { source: "env", provider: "default", id: "GEMINI_API_KEY" }, // 또는 평문 문자열
        env: { GEMINI_API_KEY: "GEMINI_KEY_HERE" },
      },
      peekaboo: { enabled: true },
      sag: { enabled: false },
    },
  },
}
```

- `allowBundled`: 번들 skill에만 해당하는 선택적 allowlist입니다(관리형/워크스페이스 skill은 영향을 받지 않음).
- `load.extraDirs`: 추가 공유 skill 루트(우선순위 가장 낮음).
- `install.preferBrew`: `true`인 경우 `brew`가 사용 가능할 때 다른 installer kind로 폴백하기 전에 Homebrew installer를 우선합니다.
- `install.nodeManager`: `metadata.openclaw.install` 스펙에 대한 node installer 선호도(`npm` | `pnpm` | `yarn` | `bun`).
- `entries.<skillKey>.enabled: false`는 번들/설치되어 있어도 해당 skill을 비활성화합니다.
- `entries.<skillKey>.apiKey`: primary env var를 선언하는 skill을 위한 편의 field(평문 문자열 또는 SecretRef 객체).

---

## Plugins

```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: [],
    load: {
      paths: ["~/Projects/oss/voice-call-plugin"],
    },
    entries: {
      "voice-call": {
        enabled: true,
        hooks: {
          allowPromptInjection: false,
        },
        config: { provider: "twilio" },
      },
    },
  },
}
```

- `~/.openclaw/extensions`, `<workspace>/.openclaw/extensions`, 그리고 `plugins.load.paths`에서 로드됩니다.
- Discovery는 native OpenClaw plugin과 호환 Codex bundle, Claude bundle(매니페스트가 없는 Claude default-layout bundle 포함)을 허용합니다.
- **구성 변경 시 gateway 재시작이 필요합니다.**
- `allow`: 선택적 allowlist(나열된 plugin만 로드). `deny`가 우선합니다.
- `plugins.entries.<id>.apiKey`: plugin 레벨 API key 편의 field(플러그인에서 지원하는 경우).
- `plugins.entries.<id>.env`: plugin 범위 env var 맵.
- `plugins.entries.<id>.hooks.allowPromptInjection`: `false`인 경우 core는 `before_prompt_build`를 차단하고 레거시 `before_agent_start`에서 prompt를 변경하는 field를 무시하며, 레거시 `modelOverride`와 `providerOverride`는 유지합니다. Native plugin hook 및 지원되는 bundle 제공 hook 디렉터리에 적용됩니다.
- `plugins.entries.<id>.subagent.allowModelOverride`: 백그라운드 subagent 실행에 대해 per-run `provider` 및 `model` override를 요청할 수 있도록 해당 plugin을 명시적으로 신뢰합니다.
- `plugins.entries.<id>.subagent.allowedModels`: 신뢰된 subagent override에 대한 표준 `provider/model` 타깃의 선택적 allowlist입니다. 의도적으로 어떤 모델이든 허용할 때만 `"*"`를 사용하십시오.
- `plugins.entries.<id>.config`: plugin 정의 구성 객체(native OpenClaw plugin schema가 있을 때 검증됨).
- `plugins.entries.firecrawl.config.webFetch`: Firecrawl web-fetch provider 설정.
  - `apiKey`: Firecrawl API key(SecretRef 허용). `plugins.entries.firecrawl.config.webSearch.apiKey`, 레거시 `tools.web.fetch.firecrawl.apiKey`, 또는 `FIRECRAWL_API_KEY` env var로 폴백합니다.
  - `baseUrl`: Firecrawl API base URL (default: `https://api.firecrawl.dev`).
  - `onlyMainContent`: 페이지에서 주 콘텐츠만 추출 (default: `true`).
  - `maxAgeMs`: 최대 캐시 age(밀리초) (default: `172800000` / 2일).
  - `timeoutSeconds`: scrape 요청 타임아웃(초) (default: `60`).
- `plugins.entries.xai.config.xSearch`: xAI X Search (Grok web search) 설정.
  - `enabled`: X Search provider 활성화.
  - `model`: 검색에 사용할 Grok model (예: `"grok-4-1-fast"`).
- `plugins.entries.memory-core.config.dreaming`: memory dreaming 설정. 단계 및 임계값은 [Dreaming](/concepts/dreaming)을 참조하십시오.
  - `enabled`: dreaming 마스터 스위치 (default `false`).
  - `frequency`: 각 전체 dreaming 스윕의 cron 주기 (default `"0 3 * * *"`).
  - phase 정책과 임계값은 구현 세부 사항이며 사용자 대면 config key가 아닙니다.
- 전체 memory 구성은 [Memory configuration reference](/reference/memory-config)에 있습니다:
  - `agents.defaults.memorySearch.*`
  - `memory.backend`
  - `memory.citations`
  - `memory.qmd.*`
  - `plugins.entries.memory-core.config.dreaming`
- 활성화된 Claude bundle plugin은 `settings.json`에서 임베디드 Pi 기본값도 기여할 수 있습니다. OpenClaw는 이를 원시 OpenClaw config 패치가 아니라 정제된 agent settings로 적용합니다.
- `plugins.slots.memory`: 활성 memory plugin id를 선택하거나 `"none"`으로 memory plugin을 비활성화합니다.
- `plugins.slots.contextEngine`: 활성 context engine plugin id를 선택합니다. 다른 엔진을 설치하여 선택하지 않는 한 `"legacy"`가 기본값입니다.
- `plugins.installs`: `openclaw plugins update`에서 사용하는 CLI 관리 install metadata.
  - `source`, `spec`, `sourcePath`, `installPath`, `version`, `resolvedName`, `resolvedVersion`, `resolvedSpec`, `integrity`, `shasum`, `resolvedAt`, `installedAt`을 포함합니다.
  - `plugins.installs.*`는 관리 상태로 취급하고, 수동 편집보다 CLI 명령을 사용하십시오.

[Plugins](/tools/plugin)를 참조하십시오.

---

## Browser

```json5
{
  browser: {
    enabled: true,
    evaluateEnabled: true,
    defaultProfile: "user",
    ssrfPolicy: {
      // dangerouslyAllowPrivateNetwork: true, // 신뢰된 private-network 접근에만 opt in
      // allowPrivateNetwork: true, // 레거시 별칭
      // hostnameAllowlist: ["*.example.com", "example.com"],
      // allowedHostnames: ["localhost"],
    },
    profiles: {
      openclaw: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      user: { driver: "existing-session", attachOnly: true, color: "#00AA00" },
      brave: {
        driver: "existing-session",
        attachOnly: true,
        userDataDir: "~/Library/Application Support/BraveSoftware/Brave-Browser",
        color: "#FB542B",
      },
      remote: { cdpUrl: "http://10.0.0.42:9222", color: "#00AA00" },
    },
    color: "#FF4500",
    // headless: false,
    // noSandbox: false,
    // extraArgs: [],
    // executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    // attachOnly: false,
  },
}
```

- `evaluateEnabled: false`는 `act:evaluate`와 `wait --fn`을 비활성화합니다.
- `ssrfPolicy.dangerouslyAllowPrivateNetwork`는 설정되지 않으면 비활성화되므로, 브라우저 내비게이션은 기본적으로 엄격(strict) 상태를 유지합니다.
- 의도적으로 private-network 브라우저 내비게이션을 신뢰하는 경우에만 `ssrfPolicy.dangerouslyAllowPrivateNetwork: true`를 설정하십시오.
- strict 모드에서 remote CDP profile 엔드포인트(`profiles.*.cdpUrl`)는 reachability/discovery 검사 동안 동일한 private-network 차단의 적용을 받습니다.
- `ssrfPolicy.allowPrivateNetwork`는 레거시 별칭으로 계속 지원됩니다.
- strict 모드에서는 명시적 예외를 위해 `ssrfPolicy.hostnameAllowlist` 및 `ssrfPolicy.allowedHostnames`를 사용하십시오.
- Remote profile은 attach-only입니다(start/stop/reset 비활성).
- `profiles.*.cdpUrl`은 `http://`, `https://`, `ws://`, `wss://`를 허용합니다.
  OpenClaw가 `/json/version`을 discovery하도록 하려면 HTTP(S)를 사용하고, provider가 직접 DevTools WebSocket URL을 제공하는 경우에는 WS(S)를 사용하십시오.
- `existing-session` profile은 CDP 대신 Chrome MCP를 사용하며 선택된 host 또는 연결된 브라우저 노드를 통해 attach할 수 있습니다.
- `existing-session` profile은 `userDataDir`을 설정하여 Brave나 Edge 같은 특정 Chromium 기반 브라우저 profile을 타깃팅할 수 있습니다.
- `existing-session` profile은 현재 Chrome MCP 라우트 제한을 유지합니다: CSS selector 타깃팅 대신 snapshot/ref 기반 액션, 단일 파일 업로드 훅, 다이얼로그 타임아웃 override 없음, `wait --load networkidle` 없음, `responsebody`, PDF export, download interception, 배치 액션 없음.
- 로컬 관리형 `openclaw` profile은 `cdpPort`와 `cdpUrl`을 자동 할당합니다. remote CDP의 경우에만 `cdpUrl`을 명시적으로 설정하십시오.
- 자동 감지 순서: 기본 브라우저가 Chromium 기반인 경우 → Chrome → Brave → Edge → Chromium → Chrome Canary.
- Control 서비스: 루프백만(`gateway.port`에서 파생된 포트, default `18791`).
- `extraArgs`는 로컬 Chromium 시작 시 추가 launch 플래그를 append합니다(예: `--disable-gpu`, 윈도우 크기 조정 또는 디버그 플래그).

---

## UI

```json5
{
  ui: {
    seamColor: "#FF4500",
    assistant: {
      name: "OpenClaw",
      avatar: "CB", // 이모지, 짧은 텍스트, 이미지 URL, 또는 data URI
    },
  },
}
```

- `seamColor`: 네이티브 앱 UI 크롬의 액센트 색상(Talk Mode 버블 틴트 등).
- `assistant`: Control UI 아이덴티티 override. 활성 agent 아이덴티티로 폴백합니다.

---

## Gateway

```json5
{
  gateway: {
    mode: "local", // local | remote
    port: 18789,
    bind: "loopback",
    auth: {
      mode: "token", // none | token | password | trusted-proxy
      token: "your-token",
      // password: "your-password", // 또는 OPENCLAW_GATEWAY_PASSWORD
      // trustedProxy: { userHeader: "x-forwarded-user" }, // mode=trusted-proxy 용; /gateway/trusted-proxy-auth 참조
      allowTailscale: true,
      rateLimit: {
        maxAttempts: 10,
        windowMs: 60000,
        lockoutMs: 300000,
        exemptLoopback: true,
      },
    },
    tailscale: {
      mode: "off", // off | serve | funnel
      resetOnExit: false,
    },
    controlUi: {
      enabled: true,
      basePath: "/openclaw",
      // root: "dist/control-ui",
      // embedSandbox: "scripts", // strict | scripts | trusted
      // allowExternalEmbedUrls: false, // 위험: 절대 외부 http(s) embed URL 허용
      // allowedOrigins: ["https://control.example.com"], // 비루프백 Control UI에 필요
      // dangerouslyAllowHostHeaderOriginFallback: false, // 위험한 Host-header origin 폴백 모드
      // allowInsecureAuth: false,
      // dangerouslyDisableDeviceAuth: false,
    },
    remote: {
      url: "ws://gateway.tailnet:18789",
      transport: "ssh", // ssh | direct
      token: "your-token",
      // password: "your-password",
    },
    trustedProxies: ["10.0.0.1"],
    // 선택 사항. Default false.
    allowRealIpFallback: false,
    tools: {
      // 추가 /tools/invoke HTTP deny
      deny: ["browser"],
      // 기본 HTTP deny 목록에서 tool 제거
      allow: ["gateway"],
    },
    push: {
      apns: {
        relay: {
          baseUrl: "https://relay.example.com",
          timeoutMs: 10000,
        },
      },
    },
  },
}
```

<Accordion title="Gateway field 세부 사항">

- `mode`: `local`(게이트웨이 실행) 또는 `remote`(원격 게이트웨이에 연결). `local`이 아닌 경우 gateway는 시작을 거부합니다.
- `port`: WS + HTTP용 단일 멀티플렉싱 port. 우선순위: `--port` > `OPENCLAW_GATEWAY_PORT` > `gateway.port` > `18789`.
- `bind`: `auto`, `loopback` (default), `lan` (`0.0.0.0`), `tailnet`(Tailscale IP만), 또는 `custom`.
- **레거시 bind 별칭**: 호스트 별칭(`0.0.0.0`, `127.0.0.1`, `localhost`, `::`, `::1`)이 아닌 bind 모드 값(`auto`, `loopback`, `lan`, `tailnet`, `custom`)을 `gateway.bind`에 사용하십시오.
- **Docker 참고**: 기본 `loopback` bind는 컨테이너 내부의 `127.0.0.1`에서 수신합니다. Docker bridge 네트워킹(`-p 18789:18789`)에서는 트래픽이 `eth0`으로 도착하므로 gateway에 도달할 수 없습니다. `--network host`를 사용하거나, 모든 인터페이스에서 수신하도록 `bind: "lan"`(또는 `bind: "custom"`과 `customBindHost: "0.0.0.0"`)을 설정하십시오.
- **Auth**: 기본적으로 필수입니다. 비루프백 bind는 gateway auth를 요구합니다. 실무적으로는 공유 token/password 또는 `gateway.auth.mode: "trusted-proxy"`를 갖춘 아이덴티티 인식 리버스 프록시를 의미합니다. 온보딩 마법사는 기본적으로 token을 생성합니다.
- `gateway.auth.token`과 `gateway.auth.password`가 모두 구성된 경우(SecretRef 포함) `gateway.auth.mode`를 `token` 또는 `password`로 명시적으로 설정해야 합니다. 둘 다 구성되었지만 mode가 미설정이면 시작 및 서비스 설치/복구 흐름이 실패합니다.
- `gateway.auth.mode: "none"`: 명시적 무인증 모드. 신뢰된 로컬 루프백 설정에만 사용하십시오. 온보딩 프롬프트에서는 의도적으로 제공되지 않습니다.
- `gateway.auth.mode: "trusted-proxy"`: 아이덴티티 인식 리버스 프록시에 인증을 위임하고 `gateway.trustedProxies`의 아이덴티티 헤더를 신뢰합니다([Trusted Proxy Auth](/gateway/trusted-proxy-auth) 참조). 이 모드는 **비루프백** 프록시 소스를 기대합니다. 동일 호스트 루프백 리버스 프록시는 trusted-proxy 인증을 만족시키지 못합니다.
- `gateway.auth.allowTailscale`: `true`인 경우, Tailscale Serve 아이덴티티 헤더가 Control UI/WebSocket 인증을 만족시킬 수 있습니다(`tailscale whois`를 통해 검증). HTTP API 엔드포인트는 해당 Tailscale 헤더 인증을 **사용하지 않으며**, gateway의 일반 HTTP auth 모드를 따릅니다. 이 토큰리스 흐름은 gateway 호스트가 신뢰된다고 가정합니다. `tailscale.mode = "serve"`인 경우 기본값은 `true`입니다.
- `gateway.auth.rateLimit`: 선택적 실패-인증 제한기. 클라이언트 IP별 및 auth scope별로 적용됩니다(shared-secret과 device-token은 독립적으로 추적). 차단된 시도는 `429` + `Retry-After`를 반환합니다.
  - 비동기 Tailscale Serve Control UI 경로에서 동일 `{scope, clientIp}`에 대한 실패 시도는 실패 기록 전에 직렬화됩니다. 따라서 동일 클라이언트의 동시 잘못된 시도는 둘 다 일반 불일치로 경쟁하지 않고 두 번째 요청에서 limiter를 발동시킬 수 있습니다.
  - `gateway.auth.rateLimit.exemptLoopback`은 기본값이 `true`입니다. localhost 트래픽도 의도적으로 rate-limit하려면(테스트 설정 또는 엄격한 프록시 배포용) `false`로 설정하십시오.
- 브라우저 origin WS 인증 시도는 루프백 exemption이 비활성화된 상태로 항상 스로틀됩니다(브라우저 기반 localhost 브루트포스 방어 심층화).
- 루프백에서는 해당 브라우저 origin 락아웃이 정규화된 `Origin`
  값별로 격리되므로, 한 localhost origin의 반복 실패가 다른 origin을
  자동으로 락아웃하지 않습니다.
- `tailscale.mode`: `serve`(테일넷만, 루프백 bind) 또는 `funnel`(공개, 인증 필요).
- `controlUi.allowedOrigins`: Gateway WebSocket 연결에 대한 명시적 브라우저 origin allowlist. 비루프백 origin에서 브라우저 클라이언트가 예상되는 경우 필수입니다.
- `controlUi.dangerouslyAllowHostHeaderOriginFallback`: Host-header origin 정책에 의도적으로 의존하는 배포를 위해 Host-header origin 폴백을 활성화하는 위험 모드입니다.
- `remote.transport`: `ssh` (default) 또는 `direct` (ws/wss). `direct`의 경우 `remote.url`은 `ws://` 또는 `wss://`여야 합니다.
- `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1`: 신뢰된 private-network IP에 대한 평문 `ws://`를 허용하는 클라이언트 측 비상 override입니다. 기본값은 평문의 경우 루프백만 허용으로 유지됩니다.
- `gateway.remote.token` / `.password`는 원격 클라이언트 자격 증명 field입니다. 자체적으로 gateway auth를 구성하지 않습니다.
- `gateway.push.apns.relay.baseUrl`: 공식/TestFlight iOS 빌드에서 relay 기반 등록을 gateway에 게시한 후 사용하는 외부 APNs relay의 기본 HTTPS URL입니다. 이 URL은 iOS 빌드에 컴파일된 relay URL과 일치해야 합니다.
- `gateway.push.apns.relay.timeoutMs`: gateway-to-relay 전송 타임아웃(밀리초). 기본값은 `10000`입니다.
- Relay 기반 등록은 특정 gateway 아이덴티티에 위임됩니다. 페어링된 iOS 앱은 `gateway.identity.get`을 가져와 해당 아이덴티티를 relay 등록에 포함하고, 등록 범위 send grant를 gateway에 전달합니다. 다른 gateway는 저장된 등록을 재사용할 수 없습니다.
- `OPENCLAW_APNS_RELAY_BASE_URL` / `OPENCLAW_APNS_RELAY_TIMEOUT_MS`: 위의 relay 구성에 대한 임시 env override.
- `OPENCLAW_APNS_RELAY_ALLOW_HTTP=true`: 루프백 HTTP relay URL을 위한 개발 전용 이스케이프 해치. 프로덕션 relay URL은 HTTPS를 유지해야 합니다.
- `gateway.channelHealthCheckMinutes`: 채널 health-monitor 간격(분). 글로벌로 health-monitor 재시작을 비활성화하려면 `0`으로 설정하십시오. Default: `5`.
- `gateway.channelStaleEventThresholdMinutes`: stale-socket 임계값(분). `gateway.channelHealthCheckMinutes` 이상으로 유지하십시오. Default: `30`.
- `gateway.channelMaxRestartsPerHour`: 롤링 1시간 내 채널/계정당 최대 health-monitor 재시작 횟수. Default: `10`.
- `channels.<provider>.healthMonitor.enabled`: 글로벌 모니터는 활성화된 상태로 두고 health-monitor 재시작을 위한 채널별 opt-out.
- `channels.<provider>.accounts.<accountId>.healthMonitor.enabled`: 다중 계정 채널에 대한 계정별 override. 설정된 경우 채널 레벨 override보다 우선합니다.
- 로컬 gateway 호출 경로는 `gateway.auth.*`가 설정되지 않은 경우에만 `gateway.remote.*`를 폴백으로 사용할 수 있습니다.
- `gateway.auth.token` / `gateway.auth.password`가 SecretRef로 명시적으로 구성되었으나 해결되지 않은 경우, 해결이 fail-closed로 처리됩니다(원격 폴백 마스킹 없음).
- `trustedProxies`: TLS를 종단하거나 forwarded-client 헤더를 주입하는 리버스 프록시 IP. 제어하는 프록시만 나열하십시오. 루프백 항목은 동일 호스트 프록시/로컬 감지 설정(예: Tailscale Serve 또는 로컬 리버스 프록시)에 대해서는 여전히 유효하지만, 루프백 요청이 `gateway.auth.mode: "trusted-proxy"` 대상이 되도록 **만들지는 않습니다**.
- `allowRealIpFallback`: `true`인 경우, `X-Forwarded-For`가 누락되면 gateway가 `X-Real-IP`를 허용합니다. fail-closed 동작을 위해 Default `false`.
- `gateway.tools.deny`: HTTP `POST /tools/invoke`에서 차단할 추가 tool 이름(기본 deny 목록을 확장).
- `gateway.tools.allow`: 기본 HTTP deny 목록에서 제거할 tool 이름.

</Accordion>

### OpenAI 호환 엔드포인트

- Chat Completions: 기본적으로 비활성화됩니다. `gateway.http.endpoints.chatCompletions.enabled: true`로 활성화하십시오.
- Responses API: `gateway.http.endpoints.responses.enabled`.
- Responses URL-input 강화:
  - `gateway.http.endpoints.responses.maxUrlParts`
  - `gateway.http.endpoints.responses.files.urlAllowlist`
  - `gateway.http.endpoints.responses.images.urlAllowlist`
    빈 allowlist는 미설정으로 처리됩니다. URL 페치를 비활성화하려면 `gateway.http.endpoints.responses.files.allowUrl=false`
    및/또는 `gateway.http.endpoints.responses.images.allowUrl=false`를 사용하십시오.
- 선택적 응답 강화 헤더:
  - `gateway.http.securityHeaders.strictTransportSecurity`(제어하는 HTTPS origin에만 설정하십시오. [Trusted Proxy Auth](/gateway/trusted-proxy-auth#tls-termination-and-hsts) 참조)

### 멀티 인스턴스 격리

고유 port와 state 디렉터리로 한 호스트에서 여러 gateway를 실행합니다:

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw/a.json \
OPENCLAW_STATE_DIR=~/.openclaw-a \
openclaw gateway --port 19001
```

편의 플래그: `--dev`(`~/.openclaw-dev` + port `19001` 사용), `--profile <name>`(`~/.openclaw-<name>` 사용).

[Multiple Gateways](/gateway/multiple-gateways)를 참조하십시오.

### `gateway.tls`

```json5
{
  gateway: {
    tls: {
      enabled: false,
      autoGenerate: false,
      certPath: "/etc/openclaw/tls/server.crt",
      keyPath: "/etc/openclaw/tls/server.key",
      caPath: "/etc/openclaw/tls/ca-bundle.crt",
    },
  },
}
```

- `enabled`: gateway listener에서 TLS 종단(HTTPS/WSS)을 활성화합니다 (default: `false`).
- `autoGenerate`: 명시적 파일이 구성되지 않은 경우 로컬 self-signed 인증서/키 쌍을 자동 생성합니다. 로컬/개발용 전용입니다.
- `certPath`: TLS 인증서 파일의 파일시스템 경로.
- `keyPath`: TLS private key 파일의 파일시스템 경로. 권한 제한을 유지하십시오.
- `caPath`: 클라이언트 검증 또는 커스텀 신뢰 체인을 위한 선택적 CA 번들 경로.

### `gateway.reload`

```json5
{
  gateway: {
    reload: {
      mode: "hybrid", // off | restart | hot | hybrid
      debounceMs: 500,
      deferralTimeoutMs: 300000,
    },
  },
}
```

- `mode`: 런타임에 config 편집을 어떻게 적용할지 제어합니다.
  - `"off"`: 라이브 편집 무시. 변경 사항은 명시적 재시작이 필요합니다.
  - `"restart"`: config 변경 시 항상 gateway 프로세스 재시작.
  - `"hot"`: 재시작 없이 in-process로 변경 적용.
  - `"hybrid"` (default): hot 리로드를 먼저 시도하고 필요 시 재시작으로 폴백.
- `debounceMs`: config 변경이 적용되기 전 디바운스 윈도우(ms, 음이 아닌 정수).
- `deferralTimeoutMs`: 재시작을 강제하기 전에 진행 중인 작업을 기다리는 최대 시간(ms) (default: `300000` = 5분).

---

## Hooks

```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
    maxBodyBytes: 262144,
    defaultSessionKey: "hook:ingress",
    allowRequestSessionKey: true,
    allowedSessionKeyPrefixes: ["hook:", "hook:gmail:"],
    allowedAgentIds: ["hooks", "main"],
    presets: ["gmail"],
    transformsDir: "~/.openclaw/hooks/transforms",
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        agentId: "hooks",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:&#123;&#123;messages[0].id&#125;&#125;",
        messageTemplate: "From: &#123;&#123;messages[0].from&#125;&#125;\nSubject: &#123;&#123;messages[0].subject&#125;&#125;\n&#123;&#123;messages[0].snippet&#125;&#125;",
        deliver: true,
        channel: "last",
        model: "openai/gpt-5.4-mini",
      },
    ],
  },
}
```

Auth: `Authorization: Bearer <token>` 또는 `x-openclaw-token: <token>`.
쿼리 문자열 hook token은 거부됩니다.

Validation 및 안전 노트:

- `hooks.enabled=true`는 비어 있지 않은 `hooks.token`을 요구합니다.
- `hooks.token`은 `gateway.auth.token`과 **구별되어야** 합니다. Gateway token 재사용은 거부됩니다.
- `hooks.path`는 `/`일 수 없습니다. `/hooks` 같은 전용 서브패스를 사용하십시오.
- `hooks.allowRequestSessionKey=true`인 경우 `hooks.allowedSessionKeyPrefixes`를 제약하십시오(예: `["hook:"]`).
- 매핑 또는 preset이 템플릿 `sessionKey`를 사용하는 경우 `hooks.allowedSessionKeyPrefixes`를 설정하고 `hooks.allowRequestSessionKey=true`로 설정하십시오. 정적 매핑 key는 해당 opt-in이 필요하지 않습니다.

**Endpoints:**

- `POST /hooks/wake` → `{ text, mode?: "now"|"next-heartbeat" }`
- `POST /hooks/agent` → `{ message, name?, agentId?, sessionKey?, wakeMode?, deliver?, channel?, to?, model?, thinking?, timeoutSeconds? }`
  - 요청 페이로드의 `sessionKey`는 `hooks.allowRequestSessionKey=true`일 때만 허용됩니다 (default: `false`).
- `POST /hooks/<name>` → `hooks.mappings`를 통해 해결
  - 템플릿 렌더링된 매핑 `sessionKey` 값은 외부 공급된 것으로 간주되며 `hooks.allowRequestSessionKey=true`도 필요합니다.

<Accordion title="매핑 세부 사항">

- `match.path`는 `/hooks` 이후의 서브패스와 일치합니다 (예: `/hooks/gmail` → `gmail`).
- `match.source`는 일반 경로의 페이로드 field와 일치합니다.
- `&#123;&#123;messages[0].subject&#125;&#125;`와 같은 템플릿은 페이로드에서 읽습니다.
- `transform`은 hook 액션을 반환하는 JS/TS 모듈을 가리킬 수 있습니다.
  - `transform.module`은 상대 경로여야 하며 `hooks.transformsDir` 내에 머무릅니다(절대 경로와 traversal은 거부됨).
- `agentId`는 특정 agent로 라우팅합니다. 알 수 없는 ID는 기본값으로 폴백합니다.
- `allowedAgentIds`: 명시적 라우팅을 제한합니다(`*` 또는 생략 시 = 모두 허용, `[]` = 모두 거부).
- `defaultSessionKey`: 명시적 `sessionKey` 없이 hook agent 실행을 위한 선택적 고정 session key.
- `allowRequestSessionKey`: `/hooks/agent` 호출자와 템플릿 기반 매핑 session key가 `sessionKey`를 설정하도록 허용 (default: `false`).
- `allowedSessionKeyPrefixes`: 명시적 `sessionKey` 값(요청 + 매핑)에 대한 선택적 접두사 allowlist(예: `["hook:"]`). 매핑이나 preset이 템플릿 `sessionKey`를 사용할 때 필수가 됩니다.
- `deliver: true`는 최종 응답을 채널로 보냅니다. `channel`의 default는 `last`입니다.
- `model`은 이 hook 실행의 LLM을 override합니다(model 카탈로그가 설정된 경우 허용되어야 함).

</Accordion>

### Gmail 통합

- 내장 Gmail preset은 `sessionKey: "hook:gmail:&#123;&#123;messages[0].id&#125;&#125;"`를 사용합니다.
- 메시지별 라우팅을 유지하는 경우 `hooks.allowRequestSessionKey: true`를 설정하고 `hooks.allowedSessionKeyPrefixes`를 Gmail 네임스페이스와 일치하도록 제약하십시오(예: `["hook:", "hook:gmail:"]`).
- `hooks.allowRequestSessionKey: false`가 필요한 경우 템플릿 기본값 대신 정적 `sessionKey`로 preset을 override하십시오.

```json5
{
  hooks: {
    gmail: {
      account: "openclaw@gmail.com",
      topic: "projects/<project-id>/topics/gog-gmail-watch",
      subscription: "gog-gmail-watch-push",
      pushToken: "shared-push-token",
      hookUrl: "http://127.0.0.1:18789/hooks/gmail",
      includeBody: true,
      maxBytes: 20000,
      renewEveryMinutes: 720,
      serve: { bind: "127.0.0.1", port: 8788, path: "/" },
      tailscale: { mode: "funnel", path: "/gmail-pubsub" },
      model: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      thinking: "off",
    },
  },
}
```

- 구성되면 Gateway는 부팅 시 `gog gmail watch serve`를 자동 시작합니다. 비활성화하려면 `OPENCLAW_SKIP_GMAIL_WATCHER=1`을 설정하십시오.
- Gateway와 함께 별도의 `gog gmail watch serve`를 실행하지 마십시오.

---

## Canvas host

```json5
{
  canvasHost: {
    root: "~/.openclaw/workspace/canvas",
    liveReload: true,
    // enabled: false, // 또는 OPENCLAW_SKIP_CANVAS_HOST=1
  },
}
```

- Gateway 포트 아래 HTTP에서 agent가 편집 가능한 HTML/CSS/JS와 A2UI를 제공합니다:
  - `http://<gateway-host>:<gateway.port>/__openclaw__/canvas/`
  - `http://<gateway-host>:<gateway.port>/__openclaw__/a2ui/`
- 로컬 전용: `gateway.bind: "loopback"`(default)를 유지하십시오.
- 비루프백 bind: canvas 라우트는 다른 Gateway HTTP 영역과 마찬가지로 Gateway 인증(token/password/trusted-proxy)을 요구합니다.
- Node WebView는 일반적으로 auth 헤더를 보내지 않습니다. 노드가 페어링되고 연결된 후 Gateway는 canvas/A2UI 접근을 위한 노드 범위 capability URL을 광고합니다.
- Capability URL은 활성 노드 WS 세션에 바인딩되며 빠르게 만료됩니다. IP 기반 폴백은 사용되지 않습니다.
- 제공된 HTML에 live-reload 클라이언트를 주입합니다.
- 비어 있는 경우 스타터 `index.html`을 자동 생성합니다.
- `/__openclaw__/a2ui/`에서도 A2UI를 제공합니다.
- 변경 사항은 gateway 재시작이 필요합니다.
- 큰 디렉터리 또는 `EMFILE` 오류의 경우 live reload를 비활성화하십시오.

---

## Discovery

### mDNS (Bonjour)

```json5
{
  discovery: {
    mdns: {
      mode: "minimal", // minimal | full | off
    },
  },
}
```

- `minimal` (default): TXT 레코드에서 `cliPath` + `sshPort` 생략.
- `full`: `cliPath` + `sshPort` 포함.
- 호스트명의 default는 `openclaw`입니다. `OPENCLAW_MDNS_HOSTNAME`으로 override 합니다.

### 광역 (DNS-SD)

```json5
{
  discovery: {
    wideArea: { enabled: true },
  },
}
```

`~/.openclaw/dns/`에 유니캐스트 DNS-SD 존을 작성합니다. 네트워크 간 discovery의 경우 DNS 서버(CoreDNS 권장) + Tailscale split DNS와 페어링하십시오.

Setup: `openclaw dns setup --apply`.

---

## Environment

### `env` (인라인 env var)

```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-...",
    },
    shellEnv: {
      enabled: true,
      timeoutMs: 15000,
    },
  },
}
```

- 인라인 env var는 프로세스 env에 해당 key가 없을 때만 적용됩니다.
- `.env` 파일: CWD `.env` + `~/.openclaw/.env`(둘 다 기존 var를 덮어쓰지 않음).
- `shellEnv`: 로그인 셸 프로필에서 누락된 예상 key를 가져옵니다.
- 전체 우선순위는 [Environment](/help/environment)를 참조하십시오.

### Env var 치환

어떤 config 문자열에서도 `${VAR_NAME}`으로 env var를 참조합니다:

```json5
{
  gateway: {
    auth: { token: "${OPENCLAW_GATEWAY_TOKEN}" },
  },
}
```

- 대문자 이름만 일치: `[A-Z_][A-Z0-9_]*`.
- 누락/빈 var는 config 로드 시 오류를 발생시킵니다.
- 리터럴 `${VAR}`의 경우 `$${VAR}`로 이스케이프.
- `$include`와 함께 작동합니다.

---

## Secrets

Secret ref는 추가적입니다. 평문 값도 여전히 작동합니다.

### `SecretRef`

다음 객체 형태 중 하나를 사용하십시오:

```json5
{ source: "env" | "file" | "exec", provider: "default", id: "..." }
```

Validation:

- `provider` 패턴: `^[a-z][a-z0-9_-]{0,63}$`
- `source: "env"` id 패턴: `^[A-Z][A-Z0-9_]{0,127}$`
- `source: "file"` id: 절대 JSON pointer (예: `"/providers/openai/apiKey"`)
- `source: "exec"` id 패턴: `^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$`
- `source: "exec"` id는 `.` 또는 `..` 슬래시 구분 경로 세그먼트를 포함하면 안 됩니다(예: `a/../b`는 거부됨)

### 지원되는 자격 증명 영역

- 표준 매트릭스: [SecretRef Credential Surface](/reference/secretref-credential-surface)
- `secrets apply`는 지원되는 `openclaw.json` 자격 증명 경로를 타깃으로 합니다.
- `auth-profiles.json` ref는 런타임 해결과 audit 커버리지에 포함됩니다.

### Secret provider 구성

```json5
{
  secrets: {
    providers: {
      default: { source: "env" }, // 선택적 명시 env provider
      filemain: {
        source: "file",
        path: "~/.openclaw/secrets.json",
        mode: "json",
        timeoutMs: 5000,
      },
      vault: {
        source: "exec",
        command: "/usr/local/bin/openclaw-vault-resolver",
        passEnv: ["PATH", "VAULT_ADDR"],
      },
    },
    defaults: {
      env: "default",
      file: "filemain",
      exec: "vault",
    },
  },
}
```

참고:

- `file` provider는 `mode: "json"` 및 `mode: "singleValue"`를 지원합니다(singleValue 모드에서 `id`는 `"value"`여야 함).
- File 및 exec provider 경로는 Windows ACL 검증을 사용할 수 없을 때 fail-closed로 처리됩니다. 검증할 수 없는 신뢰 경로에만 `allowInsecurePath: true`를 설정하십시오.
- `exec` provider는 절대 `command` 경로를 요구하고 stdin/stdout에서 프로토콜 페이로드를 사용합니다.
- 기본적으로 심볼릭 링크 command 경로는 거부됩니다. 심볼릭 링크 경로를 허용하되 해결된 타깃 경로를 검증하려면 `allowSymlinkCommand: true`를 설정하십시오.
- `trustedDirs`가 구성된 경우 trusted-dir 검사는 해결된 타깃 경로에 적용됩니다.
- `exec` 자식 환경은 기본적으로 최소입니다. 필요한 변수는 `passEnv`로 명시적으로 전달하십시오.
- Secret ref는 활성화 시점에 in-memory 스냅샷으로 해결되며, 요청 경로는 스냅샷만 읽습니다.
- 활성 영역 필터링은 활성화 중에 적용됩니다. 활성화된 영역의 해결되지 않은 ref는 시작/리로드를 실패하게 하지만, 비활성 영역은 진단과 함께 건너뜁니다.

---

## Auth 저장

```json5
{
  auth: {
    profiles: {
      "anthropic:default": { provider: "anthropic", mode: "api_key" },
      "anthropic:work": { provider: "anthropic", mode: "api_key" },
      "openai-codex:personal": { provider: "openai-codex", mode: "oauth" },
    },
    order: {
      anthropic: ["anthropic:default", "anthropic:work"],
      "openai-codex": ["openai-codex:personal"],
    },
  },
}
```

- Agent별 profile은 `<agentDir>/auth-profiles.json`에 저장됩니다.
- `auth-profiles.json`은 정적 자격 증명 모드에 대해 값 수준 ref(`api_key`용 `keyRef`, `token`용 `tokenRef`)를 지원합니다.
- OAuth 모드 profile(`auth.profiles.<id>.mode = "oauth"`)은 SecretRef 기반 auth-profile 자격 증명을 지원하지 않습니다.
- 정적 런타임 자격 증명은 in-memory 해결 스냅샷에서 제공됩니다. 레거시 정적 `auth.json` 항목은 발견 시 정리됩니다.
- `~/.openclaw/credentials/oauth.json`의 레거시 OAuth 가져오기.
- [OAuth](/concepts/oauth)를 참조하십시오.
- Secrets 런타임 동작과 `audit/configure/apply` 툴링: [Secrets Management](/gateway/secrets).

### `auth.cooldowns`

```json5
{
  auth: {
    cooldowns: {
      billingBackoffHours: 5,
      billingBackoffHoursByProvider: { anthropic: 3, openai: 8 },
      billingMaxHours: 24,
      authPermanentBackoffMinutes: 10,
      authPermanentMaxMinutes: 60,
      failureWindowHours: 24,
      overloadedProfileRotations: 1,
      overloadedBackoffMs: 0,
      rateLimitedProfileRotations: 1,
    },
  },
}
```

- `billingBackoffHours`: profile이 진짜 청구/잔액 부족 오류로 실패할 때의 기본 backoff(시간) (default: `5`).
  명시적 청구 텍스트는 `401`/`403` 응답에서도 여기로 들어올 수 있지만, provider 특정 텍스트
  매처는 그것을 소유한 provider에만 한정됩니다(예: OpenRouter
  `Key limit exceeded`). 재시도 가능한 HTTP `402` 사용량 윈도우 또는
  조직/워크스페이스 지출 한도 메시지는 여기 대신 `rate_limit` 경로에
  머무릅니다.
- `billingBackoffHoursByProvider`: 청구 backoff 시간에 대한 선택적 provider별 override.
- `billingMaxHours`: 청구 backoff 지수 성장의 시간 단위 상한 (default: `24`).
- `authPermanentBackoffMinutes`: 높은 신뢰도의 `auth_permanent` 실패에 대한 기본 backoff(분) (default: `10`).
- `authPermanentMaxMinutes`: `auth_permanent` backoff 성장의 분 단위 상한 (default: `60`).
- `failureWindowHours`: backoff 카운터에 사용되는 롤링 윈도우(시간) (default: `24`).
- `overloadedProfileRotations`: 모델 폴백으로 전환하기 전 overloaded 오류에 대한 최대 동일 provider auth-profile 회전 수 (default: `1`). `ModelNotReadyException` 같은 provider-busy 형태가 여기에 속합니다.
- `overloadedBackoffMs`: overloaded provider/profile 회전을 재시도하기 전 고정 지연 (default: `0`).
- `rateLimitedProfileRotations`: 모델 폴백으로 전환하기 전 rate-limit 오류에 대한 최대 동일 provider auth-profile 회전 수 (default: `1`). 해당 rate-limit 버킷에는 `Too many concurrent requests`, `ThrottlingException`, `concurrency limit reached`, `workers_ai ... quota limit exceeded`, `resource exhausted` 같은 provider 형태 텍스트가 포함됩니다.

---

## Logging

```json5
{
  logging: {
    level: "info",
    file: "/tmp/openclaw/openclaw.log",
    consoleLevel: "info",
    consoleStyle: "pretty", // pretty | compact | json
    redactSensitive: "tools", // off | tools
    redactPatterns: ["\\bTOKEN\\b\\s*[=:]\\s*([\"']?)([^\\s\"']+)\\1"],
  },
}
```

- 기본 로그 파일: `/tmp/openclaw/openclaw-YYYY-MM-DD.log`.
- 안정적인 경로를 위해 `logging.file`을 설정하십시오.
- `consoleLevel`은 `--verbose`일 때 `debug`로 올라갑니다.
- `maxFileBytes`: 쓰기가 억제되기 전의 로그 파일 최대 크기(바이트) (양의 정수; default: `524288000` = 500 MB). 프로덕션 배포에는 외부 로그 로테이션을 사용하십시오.

---

## Diagnostics

```json5
{
  diagnostics: {
    enabled: true,
    flags: ["telegram.*"],
    stuckSessionWarnMs: 30000,

    otel: {
      enabled: false,
      endpoint: "https://otel-collector.example.com:4318",
      protocol: "http/protobuf", // http/protobuf | grpc
      headers: { "x-tenant-id": "my-org" },
      serviceName: "openclaw-gateway",
      traces: true,
      metrics: true,
      logs: false,
      sampleRate: 1.0,
      flushIntervalMs: 5000,
    },

    cacheTrace: {
      enabled: false,
      filePath: "~/.openclaw/logs/cache-trace.jsonl",
      includeMessages: true,
      includePrompt: true,
      includeSystem: true,
    },
  },
}
```

- `enabled`: instrumentation 출력의 마스터 토글 (default: `true`).
- `flags`: 타깃 로그 출력을 활성화하는 플래그 문자열 배열(`"telegram.*"` 또는 `"*"` 같은 와일드카드 지원).
- `stuckSessionWarnMs`: 세션이 처리 상태에 머무르는 동안 stuck-session 경고를 발생시키는 age 임계값(ms).
- `otel.enabled`: OpenTelemetry export 파이프라인을 활성화 (default: `false`).
- `otel.endpoint`: OTel export를 위한 collector URL.
- `otel.protocol`: `"http/protobuf"` (default) 또는 `"grpc"`.
- `otel.headers`: OTel export 요청과 함께 전송되는 추가 HTTP/gRPC metadata 헤더.
- `otel.serviceName`: resource attribute의 서비스 이름.
- `otel.traces` / `otel.metrics` / `otel.logs`: trace, metrics, 또는 log export 활성화.
- `otel.sampleRate`: trace 샘플링 비율 `0`–`1`.
- `otel.flushIntervalMs`: 주기적 telemetry 플러시 간격(ms).
- `cacheTrace.enabled`: 임베디드 실행에 대한 캐시 트레이스 스냅샷 로그 (default: `false`).
- `cacheTrace.filePath`: 캐시 트레이스 JSONL의 출력 경로 (default: `$OPENCLAW_STATE_DIR/logs/cache-trace.jsonl`).
- `cacheTrace.includeMessages` / `includePrompt` / `includeSystem`: 캐시 트레이스 출력에 포함되는 내용 제어 (모두 default: `true`).

---

## Update

```json5
{
  update: {
    channel: "stable", // stable | beta | dev
    checkOnStart: true,

    auto: {
      enabled: false,
      stableDelayHours: 6,
      stableJitterHours: 12,
      betaCheckIntervalHours: 1,
    },
  },
}
```

- `channel`: npm/git 설치에 대한 릴리스 채널 — `"stable"`, `"beta"`, 또는 `"dev"`.
- `checkOnStart`: gateway 시작 시 npm 업데이트를 확인 (default: `true`).
- `auto.enabled`: 패키지 설치에 대한 백그라운드 자동 업데이트 활성화 (default: `false`).
- `auto.stableDelayHours`: stable 채널 자동 적용 전 최소 지연(시간) (default: `6`; max: `168`).
- `auto.stableJitterHours`: stable 채널 롤아웃 확산 윈도우 추가 시간 (default: `12`; max: `168`).
- `auto.betaCheckIntervalHours`: beta 채널 확인 실행 주기(시간) (default: `1`; max: `24`).

---

## ACP

```json5
{
  acp: {
    enabled: false,
    dispatch: { enabled: true },
    backend: "acpx",
    defaultAgent: "main",
    allowedAgents: ["main", "ops"],
    maxConcurrentSessions: 10,

    stream: {
      coalesceIdleMs: 50,
      maxChunkChars: 1000,
      repeatSuppression: true,
      deliveryMode: "live", // live | final_only
      hiddenBoundarySeparator: "paragraph", // none | space | newline | paragraph
      maxOutputChars: 50000,
      maxSessionUpdateChars: 500,
    },

    runtime: {
      ttlMinutes: 30,
    },
  },
}
```

- `enabled`: 글로벌 ACP 기능 게이트 (default: `false`).
- `dispatch.enabled`: ACP 세션 turn 디스패치에 대한 독립적 게이트 (default: `true`). 실행은 차단하면서 ACP 명령을 사용 가능하게 유지하려면 `false`로 설정하십시오.
- `backend`: 기본 ACP 런타임 백엔드 id(등록된 ACP runtime plugin과 일치해야 함).
- `defaultAgent`: spawn이 명시적 타깃을 지정하지 않을 때의 폴백 ACP 타깃 agent id.
- `allowedAgents`: ACP runtime 세션에 허용되는 agent id의 allowlist. 비어 있으면 추가 제한 없음.
- `maxConcurrentSessions`: 동시에 활성화되는 ACP 세션의 최대 수.
- `stream.coalesceIdleMs`: 스트리밍 텍스트의 idle 플러시 윈도우(ms).
- `stream.maxChunkChars`: 스트리밍 블록 프로젝션을 분할하기 전 최대 청크 크기.
- `stream.repeatSuppression`: turn당 반복되는 상태/tool 라인 억제 (default: `true`).
- `stream.deliveryMode`: `"live"`는 증분 스트리밍, `"final_only"`는 turn 종료 이벤트까지 버퍼링.
- `stream.hiddenBoundarySeparator`: 숨겨진 tool 이벤트 이후 가시 텍스트 앞의 구분자 (default: `"paragraph"`).
- `stream.maxOutputChars`: ACP turn당 프로젝트되는 assistant 출력 문자의 최대 수.
- `stream.maxSessionUpdateChars`: 프로젝트된 ACP status/update 라인의 최대 문자 수.
- `stream.tagVisibility`: 스트리밍 이벤트에 대한 태그 이름-불리언 가시성 override 레코드.
- `runtime.ttlMinutes`: 정리 대상이 되기 전 ACP 세션 워커의 idle TTL(분).
- `runtime.installCommand`: ACP runtime 환경 부트스트래핑 시 실행할 선택적 install 명령.

---

## CLI

```json5
{
  cli: {
    banner: {
      taglineMode: "off", // random | default | off
    },
  },
}
```

- `cli.banner.taglineMode`는 배너 tagline 스타일을 제어합니다:
  - `"random"` (default): 회전되는 재미있는/시즌별 tagline.
  - `"default"`: 고정된 중립 tagline (`All your chats, one OpenClaw.`).
  - `"off"`: tagline 텍스트 없음(배너 title/version은 여전히 표시됨).
- 배너 전체를 숨기려면(tagline뿐만 아니라) env `OPENCLAW_HIDE_BANNER=1`을 설정하십시오.

---

## Wizard

CLI 가이드 설정 흐름(`onboard`, `configure`, `doctor`)이 작성하는 metadata:

```json5
{
  wizard: {
    lastRunAt: "2026-01-01T00:00:00.000Z",
    lastRunVersion: "2026.1.4",
    lastRunCommit: "abc1234",
    lastRunCommand: "configure",
    lastRunMode: "local",
  },
}
```

---

## Identity

[Agent defaults](/gateway/config-agents#agent-defaults) 아래의 `agents.list` 아이덴티티 field를 참조하십시오.

---

## Bridge (레거시, 제거됨)

현재 빌드는 더 이상 TCP bridge를 포함하지 않습니다. 노드는 Gateway WebSocket을 통해 연결됩니다. `bridge.*` key는 더 이상 config schema의 일부가 아닙니다(제거할 때까지 validation 실패. `openclaw doctor --fix`가 알 수 없는 key를 제거할 수 있음).

<Accordion title="레거시 bridge 구성 (역사적 참고)">

```json
{
  "bridge": {
    "enabled": true,
    "port": 18790,
    "bind": "tailnet",
    "tls": {
      "enabled": true,
      "autoGenerate": true
    }
  }
}
```

</Accordion>

---

## Cron

```json5
{
  cron: {
    enabled: true,
    maxConcurrentRuns: 2,
    webhook: "https://example.invalid/legacy", // 저장된 notify:true 작업에 대한 deprecated 폴백
    webhookToken: "replace-with-dedicated-token", // 아웃바운드 webhook 인증용 선택적 bearer token
    sessionRetention: "24h", // duration 문자열 또는 false
    runLog: {
      maxBytes: "2mb", // default 2_000_000 바이트
      keepLines: 2000, // default 2000
    },
  },
}
```

- `sessionRetention`: 완료된 격리 cron run 세션을 `sessions.json`에서 pruning하기 전까지 유지하는 기간. 아카이브된 삭제 cron transcript의 정리도 제어합니다. Default: `24h`. 비활성화하려면 `false`로 설정.
- `runLog.maxBytes`: pruning 전 실행 로그 파일(`cron/runs/<jobId>.jsonl`)의 최대 크기. Default: `2_000_000` 바이트.
- `runLog.keepLines`: 실행 로그 pruning이 트리거될 때 유지되는 가장 새로운 라인. Default: `2000`.
- `webhookToken`: cron webhook POST 전송(`delivery.mode = "webhook"`)에 사용되는 bearer token. 생략 시 auth 헤더가 전송되지 않습니다.
- `webhook`: 여전히 `notify: true`를 가진 저장된 작업에만 사용되는 deprecated 레거시 폴백 webhook URL(http/https).

### `cron.retry`

```json5
{
  cron: {
    retry: {
      maxAttempts: 3,
      backoffMs: [30000, 60000, 300000],
      retryOn: ["rate_limit", "overloaded", "network", "timeout", "server_error"],
    },
  },
}
```

- `maxAttempts`: 일회성 작업의 일시적 오류에 대한 최대 재시도 수 (default: `3`; 범위: `0`–`10`).
- `backoffMs`: 각 재시도 시도에 대한 backoff 지연 배열(ms) (default: `[30000, 60000, 300000]`; 1–10 항목).
- `retryOn`: 재시도를 트리거하는 오류 유형 — `"rate_limit"`, `"overloaded"`, `"network"`, `"timeout"`, `"server_error"`. 모든 일시적 유형을 재시도하려면 생략하십시오.

일회성 cron 작업에만 적용됩니다. 반복 작업은 별도의 실패 처리를 사용합니다.

### `cron.failureAlert`

```json5
{
  cron: {
    failureAlert: {
      enabled: false,
      after: 3,
      cooldownMs: 3600000,
      mode: "announce",
      accountId: "main",
    },
  },
}
```

- `enabled`: cron 작업에 대한 실패 알림 활성화 (default: `false`).
- `after`: 알림이 발동되기 전 연속 실패 수 (양의 정수, min: `1`).
- `cooldownMs`: 동일 작업에 대한 반복 알림 사이의 최소 밀리초 (음이 아닌 정수).
- `mode`: 전달 모드 — `"announce"`는 채널 메시지를 통해 전송. `"webhook"`은 구성된 webhook에 POST.
- `accountId`: 알림 전달의 범위를 지정할 선택적 계정 또는 채널 id.

### `cron.failureDestination`

```json5
{
  cron: {
    failureDestination: {
      mode: "announce",
      channel: "last",
      to: "channel:C1234567890",
      accountId: "main",
    },
  },
}
```

- 모든 작업에 걸친 cron 실패 알림의 기본 목적지.
- `mode`: `"announce"` 또는 `"webhook"`. 충분한 타깃 데이터가 존재할 때 default는 `"announce"`.
- `channel`: announce 전달을 위한 채널 override. `"last"`는 마지막으로 알려진 전달 채널을 재사용합니다.
- `to`: 명시적 announce 타깃 또는 webhook URL. webhook 모드에 필수.
- `accountId`: 전달을 위한 선택적 계정 override.
- 작업별 `delivery.failureDestination`은 이 글로벌 default를 override합니다.
- 글로벌 또는 작업별 실패 목적지가 설정되지 않은 경우, 이미 `announce`를 통해 전달되는 작업은 실패 시 해당 primary announce 타깃으로 폴백합니다.
- `delivery.failureDestination`은 작업의 primary `delivery.mode`가 `"webhook"`이 아닌 한 `sessionTarget="isolated"` 작업에만 지원됩니다.

[Cron Jobs](/automation/cron-jobs)를 참조하십시오. 격리된 cron 실행은 [백그라운드 작업](/automation/tasks)으로 추적됩니다.

---

## 미디어 모델 템플릿 변수

`tools.media.models[].args`에서 확장되는 템플릿 플레이스홀더:

| 변수                | 설명                                          |
| ------------------ | -------------------------------------------- |
| `&#123;&#123;Body&#125;&#125;`         | 전체 인바운드 메시지 본문                        |
| `&#123;&#123;RawBody&#125;&#125;`      | 원시 본문(히스토리/발신자 래퍼 없음)               |
| `&#123;&#123;BodyStripped&#125;&#125;` | 그룹 멘션이 제거된 본문                          |
| `&#123;&#123;From&#125;&#125;`         | 발신자 식별자                                  |
| `&#123;&#123;To&#125;&#125;`           | 대상 식별자                                    |
| `&#123;&#123;MessageSid&#125;&#125;`   | 채널 메시지 id                                |
| `&#123;&#123;SessionId&#125;&#125;`    | 현재 세션 UUID                                |
| `&#123;&#123;IsNewSession&#125;&#125;` | 새 세션 생성 시 `"true"`                       |
| `&#123;&#123;MediaUrl&#125;&#125;`     | 인바운드 미디어 pseudo-URL                     |
| `&#123;&#123;MediaPath&#125;&#125;`    | 로컬 미디어 경로                                |
| `&#123;&#123;MediaType&#125;&#125;`    | 미디어 유형 (image/audio/document/…)          |
| `&#123;&#123;Transcript&#125;&#125;`   | 오디오 transcript                             |
| `&#123;&#123;Prompt&#125;&#125;`       | CLI 항목에 대한 해결된 미디어 prompt             |
| `&#123;&#123;MaxChars&#125;&#125;`     | CLI 항목에 대한 해결된 최대 출력 문자 수          |
| `&#123;&#123;ChatType&#125;&#125;`     | `"direct"` 또는 `"group"`                    |
| `&#123;&#123;GroupSubject&#125;&#125;` | 그룹 제목 (최선 노력)                           |
| `&#123;&#123;GroupMembers&#125;&#125;` | 그룹 멤버 미리보기 (최선 노력)                   |
| `&#123;&#123;SenderName&#125;&#125;`   | 발신자 표시 이름 (최선 노력)                    |
| `&#123;&#123;SenderE164&#125;&#125;`   | 발신자 전화번호 (최선 노력)                     |
| `&#123;&#123;Provider&#125;&#125;`     | Provider 힌트 (whatsapp, telegram, discord 등) |

---

## Config includes (`$include`)

여러 파일로 config를 분할:

```json5
// ~/.openclaw/openclaw.json
{
  gateway: { port: 18789 },
  agents: { $include: "./agents.json5" },
  broadcast: {
    $include: ["./clients/mueller.json5", "./clients/schmidt.json5"],
  },
}
```

**병합 동작:**

- 단일 파일: 포함하는 객체를 대체합니다.
- 파일 배열: 순서대로 deep-merge됩니다(나중 것이 이전 것을 덮어씀).
- 형제 key: include 이후에 병합됩니다(포함된 값을 override).
- 중첩 include: 최대 10단계 깊이.
- 경로: 포함하는 파일을 기준으로 해결되지만, 최상위 config 디렉터리(`openclaw.json`의 `dirname`) 내에 있어야 합니다. 절대/`../` 형식은 해당 경계 내로 해결되는 경우에만 허용됩니다.
- 단일 파일 include에 의해 뒷받침되는 하나의 최상위 섹션만 변경하는 OpenClaw 소유 쓰기는 해당 포함 파일로 통과됩니다. 예를 들어 `plugins install`은 `plugins.json5`에서 `plugins: { $include: "./plugins.json5" }`를 업데이트하고 `openclaw.json`은 그대로 둡니다.
- 루트 include, include 배열, 형제 override가 있는 include는 OpenClaw 소유 쓰기에 대해 읽기 전용입니다. 해당 쓰기는 config를 평탄화하는 대신 fail-closed됩니다.
- 오류: 누락된 파일, 파싱 오류, 순환 include에 대한 명확한 메시지.

---

_관련: [Configuration](/gateway/configuration) · [Configuration Examples](/gateway/configuration-examples) · [Doctor](/gateway/doctor)_

## 관련

- [Configuration](/gateway/configuration)
- [Configuration examples](/gateway/configuration-examples)
