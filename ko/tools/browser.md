---
summary: "통합 브라우저 제어 서비스 + 액션 명령"
read_when:
  - agent가 제어하는 browser 자동화를 추가할 때
  - openclaw가 개인 Chrome을 간섭하는 이유를 디버깅할 때
  - macOS 앱에서 browser 설정 + 수명 주기를 구현할 때
title: "Browser (OpenClaw 관리형)"
---

OpenClaw는 agent가 제어하는 **전용 Chrome/Brave/Edge/Chromium 프로필**을 실행할 수 있습니다.
개인 브라우저와는 격리되어 있으며, Gateway 내부의 소규모 로컬 제어 서비스(loopback 전용)를 통해 관리됩니다.

초심자 관점:

- **agent 전용의 별도 브라우저**라고 생각하시면 됩니다.
- `openclaw` 프로필은 개인 브라우저 프로필을 **건드리지 않습니다**.
- agent는 안전한 경로에서 **탭을 열고, 페이지를 읽고, 클릭하고, 입력**할 수 있습니다.
- 내장된 `user` 프로필은 Chrome MCP를 통해 실제 로그인된 Chrome 세션에 연결합니다.

## 제공되는 것

- **openclaw**라는 별도 브라우저 프로필 (기본 주황색 강조).
- 결정적인 탭 제어 (목록/열기/포커스/닫기).
- agent 액션 (클릭/입력/드래그/선택), 스냅샷, 스크린샷, PDF.
- 선택적 multi-profile 지원 (`openclaw`, `work`, `remote`, ...).

이 브라우저는 일상적으로 쓰는 브라우저가 **아닙니다**. agent 자동화와 검증을 위한 안전하고 격리된 표면입니다.

## 빠른 시작

```bash
openclaw browser --browser-profile openclaw status
openclaw browser --browser-profile openclaw start
openclaw browser --browser-profile openclaw open https://example.com
openclaw browser --browser-profile openclaw snapshot
```

"Browser disabled"가 표시되면 아래 설정에서 활성화하고 Gateway를 재시작하세요.

`openclaw browser` 자체가 누락되어 있거나 agent가 browser 도구를 사용할 수 없다고 보고하면 [browser 명령 또는 도구 누락](/tools/browser#missing-browser-command-or-tool)으로 이동하세요.

## 플러그인 제어

기본 `browser` 도구는 번들 플러그인입니다. 동일한 `browser` 도구 이름을 등록하는 다른 플러그인으로 대체하려면 비활성화하세요.

```json5
{
  plugins: {
    entries: {
      browser: {
        enabled: false,
      },
    },
  },
}
```

기본값을 사용하려면 `plugins.entries.browser.enabled`와 `browser.enabled=true`가 **모두** 필요합니다. 플러그인만 비활성화하면 `openclaw browser` CLI, `browser.request` gateway 메서드, agent 도구, 제어 서비스가 하나의 단위로 제거되지만 `browser.*` 설정은 대체용으로 그대로 유지됩니다.

Browser 설정 변경은 플러그인이 서비스를 재등록할 수 있도록 Gateway 재시작이 필요합니다.

## browser 명령 또는 도구 누락

업그레이드 후 `openclaw browser`가 알려지지 않거나, `browser.request`가 누락되거나, agent가 browser 도구를 사용할 수 없다고 보고하면 일반적인 원인은 `plugins.allow` 목록에 `browser`가 빠진 경우입니다. 추가하세요.

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

`browser.enabled=true`, `plugins.entries.browser.enabled=true`, `tools.alsoAllow: ["browser"]`는 allowlist 멤버십을 대체하지 않습니다 — allowlist는 플러그인 로딩을 게이팅하며, 도구 정책은 로드 이후에만 실행됩니다. `plugins.allow`를 완전히 제거해도 기본값이 복원됩니다.

## 프로필: `openclaw` vs `user`

- `openclaw`: 관리되고 격리된 browser (extension 불필요).
- `user`: 실제 로그인된 Chrome 세션에 연결하기 위한 내장 Chrome MCP attach 프로필.

agent browser 도구 호출:

- 기본값: 격리된 `openclaw` 브라우저 사용.
- 기존 로그인 세션이 중요하고 사용자가 컴퓨터 앞에 있어 attach prompt를 클릭/승인할 수 있는 경우 `profile="user"`를 선호하세요.
- `profile`은 특정 브라우저 모드를 원할 때 명시적 override입니다.

관리형 모드를 기본으로 하려면 `browser.defaultProfile: "openclaw"`로 설정하세요.

## 설정

Browser 설정은 `~/.openclaw/openclaw.json`에 있습니다.

```json5
{
  browser: {
    enabled: true, // default: true
    ssrfPolicy: {
      // dangerouslyAllowPrivateNetwork: true, // opt in only for trusted private-network access
      // allowPrivateNetwork: true, // legacy alias
      // hostnameAllowlist: ["*.example.com", "example.com"],
      // allowedHostnames: ["localhost"],
    },
    // cdpUrl: "http://127.0.0.1:18792", // legacy single-profile override
    remoteCdpTimeoutMs: 1500, // remote CDP HTTP timeout (ms)
    remoteCdpHandshakeTimeoutMs: 3000, // remote CDP WebSocket handshake timeout (ms)
    defaultProfile: "openclaw",
    color: "#FF4500",
    headless: false,
    noSandbox: false,
    attachOnly: false,
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    profiles: {
      openclaw: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      user: {
        driver: "existing-session",
        attachOnly: true,
        color: "#00AA00",
      },
      brave: {
        driver: "existing-session",
        attachOnly: true,
        userDataDir: "~/Library/Application Support/BraveSoftware/Brave-Browser",
        color: "#FB542B",
      },
      remote: { cdpUrl: "http://10.0.0.42:9222", color: "#00AA00" },
    },
  },
}
```

<AccordionGroup>

<Accordion title="포트 및 도달 가능성">

- 제어 서비스는 `gateway.port`에서 파생된 포트(기본 `18791` = gateway + 2)로 loopback에 바인딩됩니다. `gateway.port` 또는 `OPENCLAW_GATEWAY_PORT`를 재정의하면 같은 계열의 파생 포트들이 함께 이동합니다.
- 로컬 `openclaw` 프로필은 `cdpPort`/`cdpUrl`을 자동 할당합니다. 원격 CDP에만 명시적으로 지정하세요. `cdpUrl`은 설정되지 않은 경우 관리되는 로컬 CDP 포트를 기본값으로 합니다.
- `remoteCdpTimeoutMs`는 원격(비 loopback) CDP HTTP 도달 가능성 검사에 적용됩니다. `remoteCdpHandshakeTimeoutMs`는 원격 CDP WebSocket 핸드셰이크에 적용됩니다.

</Accordion>

<Accordion title="SSRF 정책">

- Browser 내비게이션과 open-tab은 내비게이션 전에 SSRF 가드를 받으며, 이후 최종 `http(s)` URL에 대해 best-effort로 다시 검사됩니다.
- Strict SSRF 모드에서는 원격 CDP 엔드포인트 발견과 `/json/version` 프로브(`cdpUrl`)도 검사됩니다.
- `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork`는 기본적으로 꺼져 있습니다. private-network 브라우저 접근이 의도적으로 신뢰되는 경우에만 활성화하세요.
- `browser.ssrfPolicy.allowPrivateNetwork`는 legacy alias로 계속 지원됩니다.

</Accordion>

<Accordion title="프로필 동작">

- `attachOnly: true`는 로컬 브라우저를 절대 실행하지 않고 이미 실행 중인 경우에만 attach합니다.
- `color` (최상위 및 프로필별)는 브라우저 UI에 색조를 입혀 활성 프로필을 볼 수 있게 합니다.
- 기본 프로필은 `openclaw`(관리형 standalone)입니다. 로그인된 사용자 브라우저를 사용하려면 `defaultProfile: "user"`로 설정하세요.
- 자동 감지 순서: Chromium 기반이면 시스템 기본 브라우저. 그렇지 않으면 Chrome → Brave → Edge → Chromium → Chrome Canary.
- `driver: "existing-session"`은 raw CDP 대신 Chrome DevTools MCP를 사용합니다. 이 드라이버에는 `cdpUrl`을 설정하지 마세요.
- existing-session 프로필이 비기본 Chromium 사용자 프로필(Brave, Edge 등)에 attach해야 하는 경우 `browser.profiles.<name>.userDataDir`를 설정하세요.

</Accordion>

</AccordionGroup>

## Brave(또는 다른 Chromium 기반 브라우저) 사용

**시스템 기본** 브라우저가 Chromium 기반(Chrome/Brave/Edge 등)이면 OpenClaw가 자동으로 사용합니다. 자동 감지를 재정의하려면 `browser.executablePath`를 설정하세요.

```bash
openclaw config set browser.executablePath "/usr/bin/google-chrome"
```

또는 플랫폼별로 설정에 지정하세요.

<Tabs>
  <Tab title="macOS">
```json5
{
  browser: {
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  },
}
```
  </Tab>
  <Tab title="Windows">
```json5
{
  browser: {
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  },
}
```
  </Tab>
  <Tab title="Linux">
```json5
{
  browser: {
    executablePath: "/usr/bin/brave-browser",
  },
}
```
  </Tab>
</Tabs>

## 로컬 vs 원격 제어

- **로컬 제어(기본):** Gateway가 loopback 제어 서비스를 시작하고 로컬 브라우저를 실행할 수 있습니다.
- **원격 제어(node host):** 브라우저가 있는 머신에서 node host를 실행합니다. Gateway가 browser 액션을 그 host로 프록시합니다.
- **원격 CDP:** 원격 Chromium 기반 브라우저에 attach하려면 `browser.profiles.<name>.cdpUrl`(또는 `browser.cdpUrl`)을 설정하세요. 이 경우 OpenClaw는 로컬 브라우저를 실행하지 않습니다.

중지 동작은 프로필 모드에 따라 다릅니다.

- 로컬 관리형 프로필: `openclaw browser stop`은 OpenClaw가 실행한 브라우저 프로세스를 중지합니다.
- attach-only 및 원격 CDP 프로필: `openclaw browser stop`은 활성 제어 세션을 닫고 Playwright/CDP 에뮬레이션 override(viewport, color scheme, locale, timezone, offline mode 및 유사 상태)를 해제합니다. OpenClaw가 browser 프로세스를 실행하지 않았더라도 마찬가지입니다.

원격 CDP URL은 인증을 포함할 수 있습니다.

- Query 토큰 (예: `https://provider.example?token=<token>`)
- HTTP Basic auth (예: `https://user:pass@provider.example`)

OpenClaw는 `/json/*` 엔드포인트 호출 및 CDP WebSocket 연결 시 인증을 보존합니다. 토큰은 설정 파일에 커밋하기보다 환경 변수나 secrets manager를 선호하세요.

## Node browser proxy (zero-config 기본값)

브라우저가 있는 머신에서 **node host**를 실행하는 경우, 추가 browser 설정 없이 OpenClaw가 browser 도구 호출을 해당 노드로 자동 라우팅할 수 있습니다. 이것이 원격 게이트웨이의 기본 경로입니다.

참고사항:

- node host는 **proxy 명령**을 통해 로컬 browser 제어 서버를 노출합니다.
- 프로필은 node의 자체 `browser.profiles` 설정에서 가져옵니다(로컬과 동일).
- `nodeHost.browserProxy.allowProfiles`는 선택 사항입니다. legacy/기본 동작을 위해 비워두세요: 설정된 모든 프로필이 proxy를 통해 도달 가능하며 프로필 생성/삭제 라우트도 포함됩니다.
- `nodeHost.browserProxy.allowProfiles`를 설정하면 OpenClaw는 이를 최소 권한 경계로 처리합니다: allowlist에 있는 프로필만 타깃팅 가능하며 영구 프로필 생성/삭제 라우트는 proxy 표면에서 차단됩니다.
- 비활성화하려면:
  - node에서: `nodeHost.browserProxy.enabled=false`
  - gateway에서: `gateway.nodes.browser.mode="off"`

## Browserless (호스팅되는 원격 CDP)

[Browserless](https://browserless.io)는 HTTPS 및 WebSocket을 통해 CDP 연결 URL을 노출하는 호스팅 Chromium 서비스입니다. OpenClaw는 두 형식 모두 사용할 수 있지만, 원격 browser 프로필의 가장 간단한 옵션은 Browserless 연결 문서의 직접 WebSocket URL입니다.

예시:

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "browserless",
    remoteCdpTimeoutMs: 2000,
    remoteCdpHandshakeTimeoutMs: 4000,
    profiles: {
      browserless: {
        cdpUrl: "wss://production-sfo.browserless.io?token=<BROWSERLESS_API_KEY>",
        color: "#00AA00",
      },
    },
  },
}
```

참고사항:

- `<BROWSERLESS_API_KEY>`를 실제 Browserless 토큰으로 교체하세요.
- Browserless 계정과 일치하는 지역 엔드포인트를 선택하세요(그들의 문서 참조).
- Browserless가 HTTPS base URL을 제공하면 직접 CDP 연결을 위해 `wss://`로 변환하거나 HTTPS URL을 유지하고 OpenClaw가 `/json/version`을 발견하도록 할 수 있습니다.

## 직접 WebSocket CDP 제공자

일부 호스팅 브라우저 서비스는 표준 HTTP 기반 CDP 발견(`/json/version`) 대신 **직접 WebSocket** 엔드포인트를 노출합니다. OpenClaw는 세 가지 CDP URL 형태를 수용하고 적절한 연결 전략을 자동으로 선택합니다.

- **HTTP(S) 발견** — `http://host[:port]` 또는 `https://host[:port]`.
  OpenClaw가 `/json/version`을 호출해 WebSocket debugger URL을 발견한 후 연결합니다. WebSocket fallback은 없습니다.
- **직접 WebSocket 엔드포인트** — `ws://host[:port]/devtools/<kind>/<id>` 또는
  `/devtools/browser|page|worker|shared_worker|service_worker/<id>` 경로를 가진 `wss://...`. OpenClaw는 WebSocket 핸드셰이크를 통해 직접 연결하며 `/json/version`을 완전히 건너뜁니다.
- **베어 WebSocket 루트** — `/devtools/...` 경로가 없는 `ws://host[:port]` 또는 `wss://host[:port]` (예: [Browserless](https://browserless.io), [Browserbase](https://www.browserbase.com)). OpenClaw는 먼저 HTTP `/json/version` 발견을 시도하고(스킴을 `http`/`https`로 정규화), 발견이 `webSocketDebuggerUrl`을 반환하면 사용하고, 그렇지 않으면 베어 루트에서 직접 WebSocket 핸드셰이크로 fallback합니다. 이를 통해 로컬 Chrome을 가리키는 베어 `ws://`도 연결 가능한데, Chrome은 `/json/version`의 target별 특정 경로에서만 WebSocket 업그레이드를 수락하기 때문입니다.

### Browserbase

[Browserbase](https://www.browserbase.com)는 내장 CAPTCHA 해결, stealth 모드, 주거용 프록시가 있는 headless 브라우저를 실행하기 위한 클라우드 플랫폼입니다.

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "browserbase",
    remoteCdpTimeoutMs: 3000,
    remoteCdpHandshakeTimeoutMs: 5000,
    profiles: {
      browserbase: {
        cdpUrl: "wss://connect.browserbase.com?apiKey=<BROWSERBASE_API_KEY>",
        color: "#F97316",
      },
    },
  },
}
```

참고사항:

- [가입](https://www.browserbase.com/sign-up)하고 [Overview 대시보드](https://www.browserbase.com/overview)에서 **API Key**를 복사하세요.
- `<BROWSERBASE_API_KEY>`를 실제 Browserbase API 키로 교체하세요.
- Browserbase는 WebSocket 연결 시 browser 세션을 자동으로 생성하므로 수동 세션 생성 단계는 필요하지 않습니다.
- 무료 티어는 동시 세션 1개와 월 1 browser 시간을 허용합니다. 유료 요금제 한도는 [가격](https://www.browserbase.com/pricing)을 참조하세요.
- 전체 API 참조, SDK 가이드, 통합 예제는 [Browserbase 문서](https://docs.browserbase.com)를 참조하세요.

## 보안

핵심 아이디어:

- Browser 제어는 loopback 전용이며, 접근은 Gateway의 auth 또는 node pairing을 통해 흐릅니다.
- standalone loopback browser HTTP API는 **공유 비밀 auth만** 사용합니다: gateway 토큰 bearer auth, `x-openclaw-password`, 또는 설정된 gateway 비밀번호를 사용한 HTTP Basic auth.
- Tailscale Serve identity 헤더와 `gateway.auth.mode: "trusted-proxy"`는 이 standalone loopback browser API를 **인증하지 않습니다**.
- browser 제어가 활성화되어 있고 공유 비밀 auth가 설정되어 있지 않으면 OpenClaw는 시작 시 `gateway.auth.token`을 자동 생성하여 설정에 저장합니다.
- `gateway.auth.mode`가 이미 `password`, `none`, 또는 `trusted-proxy`인 경우 OpenClaw는 해당 토큰을 **자동 생성하지 않습니다**.
- Gateway와 node host를 private 네트워크(Tailscale)에 유지하세요. 공개 노출은 피하세요.
- 원격 CDP URL/토큰을 비밀로 취급하세요. 환경 변수나 secrets manager를 선호하세요.

원격 CDP 팁:

- 가능한 경우 암호화된 엔드포인트(HTTPS 또는 WSS)와 짧은 수명의 토큰을 선호하세요.
- 설정 파일에 장기 토큰을 직접 포함하지 마세요.

## 프로필 (multi-browser)

OpenClaw는 여러 명명된 프로필(라우팅 설정)을 지원합니다. 프로필은 다음일 수 있습니다.

- **openclaw-managed**: 자체 사용자 데이터 디렉토리 + CDP 포트가 있는 전용 Chromium 기반 브라우저 인스턴스
- **remote**: 명시적 CDP URL (다른 곳에서 실행 중인 Chromium 기반 브라우저)
- **existing session**: Chrome DevTools MCP 자동 연결을 통한 기존 Chrome 프로필

기본값:

- `openclaw` 프로필은 누락되면 자동 생성됩니다.
- `user` 프로필은 Chrome MCP existing-session attach를 위한 내장 프로필입니다.
- `user` 외의 existing-session 프로필은 opt-in입니다. `--driver existing-session`으로 생성하세요.
- 로컬 CDP 포트는 기본적으로 **18800–18899**에서 할당됩니다.
- 프로필을 삭제하면 해당 로컬 데이터 디렉토리가 휴지통으로 이동됩니다.

모든 제어 엔드포인트는 `?profile=<name>`을 수락합니다. CLI는 `--browser-profile`을 사용합니다.

## Chrome DevTools MCP를 통한 Existing-session

OpenClaw는 공식 Chrome DevTools MCP 서버를 통해 실행 중인 Chromium 기반 browser 프로필에 attach할 수도 있습니다. 이는 해당 browser 프로필에 이미 열려 있는 탭과 로그인 상태를 재사용합니다.

공식 배경 및 설정 참조:

- [Chrome for Developers: Use Chrome DevTools MCP with your browser session](https://developer.chrome.com/blog/chrome-devtools-mcp-debug-your-browser-session)
- [Chrome DevTools MCP README](https://github.com/ChromeDevTools/chrome-devtools-mcp)

내장 프로필:

- `user`

선택 사항: 다른 이름, 색상, 또는 browser 데이터 디렉토리를 원하는 경우 사용자 정의 existing-session 프로필을 만드세요.

기본 동작:

- 내장 `user` 프로필은 Chrome MCP auto-connect를 사용하며, 기본 로컬 Google Chrome 프로필을 타깃팅합니다.

Brave, Edge, Chromium, 또는 비기본 Chrome 프로필에는 `userDataDir`를 사용하세요.

```json5
{
  browser: {
    profiles: {
      brave: {
        driver: "existing-session",
        attachOnly: true,
        userDataDir: "~/Library/Application Support/BraveSoftware/Brave-Browser",
        color: "#FB542B",
      },
    },
  },
}
```

그런 다음 일치하는 브라우저에서:

1. 원격 디버깅을 위해 해당 브라우저의 inspect 페이지를 엽니다.
2. 원격 디버깅을 활성화합니다.
3. 브라우저를 실행 중인 상태로 유지하고 OpenClaw가 attach할 때 연결 프롬프트를 승인합니다.

일반적인 inspect 페이지:

- Chrome: `chrome://inspect/#remote-debugging`
- Brave: `brave://inspect/#remote-debugging`
- Edge: `edge://inspect/#remote-debugging`

라이브 attach smoke 테스트:

```bash
openclaw browser --browser-profile user start
openclaw browser --browser-profile user status
openclaw browser --browser-profile user tabs
openclaw browser --browser-profile user snapshot --format ai
```

성공의 모습:

- `status`가 `driver: existing-session`을 표시
- `status`가 `transport: chrome-mcp`를 표시
- `status`가 `running: true`를 표시
- `tabs`가 이미 열려 있는 browser 탭을 나열
- `snapshot`이 선택된 라이브 탭의 ref를 반환

attach가 작동하지 않을 경우 확인 사항:

- 대상 Chromium 기반 브라우저가 버전 `144+`인지
- 해당 브라우저의 inspect 페이지에서 원격 디버깅이 활성화되어 있는지
- 브라우저에 attach 동의 프롬프트가 표시되고 수락했는지
- `openclaw doctor`는 오래된 extension 기반 browser 설정을 마이그레이션하고 기본 auto-connect 프로필을 위해 Chrome이 로컬에 설치되어 있는지 확인하지만, browser 측 원격 디버깅은 활성화해줄 수 없음

agent 사용:

- 사용자의 로그인된 browser 상태가 필요할 때 `profile="user"`를 사용하세요.
- 사용자 정의 existing-session 프로필을 사용하는 경우 해당 명시적 프로필 이름을 전달하세요.
- 사용자가 컴퓨터 앞에서 attach 프롬프트를 승인할 수 있을 때만 이 모드를 선택하세요.
- Gateway 또는 node host는 `npx chrome-devtools-mcp@latest --autoConnect`를 spawn할 수 있습니다.

참고사항:

- 이 경로는 격리된 `openclaw` 프로필보다 위험이 높은데, 로그인된 browser 세션 내부에서 동작할 수 있기 때문입니다.
- OpenClaw는 이 드라이버를 위해 브라우저를 실행하지 않습니다. 오직 attach만 합니다.
- OpenClaw는 여기서 공식 Chrome DevTools MCP `--autoConnect` 흐름을 사용합니다. `userDataDir`가 설정되면 해당 사용자 데이터 디렉토리를 타깃팅하도록 전달됩니다.
- Existing-session은 선택된 host 또는 연결된 browser node를 통해 attach할 수 있습니다. Chrome이 다른 곳에 있고 browser node가 연결되어 있지 않으면 원격 CDP 또는 node host를 사용하세요.

<Accordion title="Existing-session 기능 제한">

관리형 `openclaw` 프로필과 비교했을 때 existing-session 드라이버는 더 제약이 있습니다.

- **스크린샷** — 페이지 캡처와 `--ref` 요소 캡처는 작동합니다. CSS `--element` 선택자는 작동하지 않습니다. `--full-page`는 `--ref` 또는 `--element`와 결합할 수 없습니다. 페이지 또는 ref 기반 요소 스크린샷에는 Playwright가 필요하지 않습니다.
- **액션** — `click`, `type`, `hover`, `scrollIntoView`, `drag`, `select`는 snapshot ref가 필요합니다(CSS 선택자 불가). `click`은 왼쪽 버튼만 가능합니다. `type`은 `slowly=true`를 지원하지 않습니다. `fill` 또는 `press`를 사용하세요. `press`는 `delayMs`를 지원하지 않습니다. `hover`, `scrollIntoView`, `drag`, `select`, `fill`, `evaluate`는 호출별 타임아웃을 지원하지 않습니다. `select`는 단일 값을 수락합니다.
- **Wait / upload / dialog** — `wait --url`은 exact, substring, glob 패턴을 지원합니다. `wait --load networkidle`은 지원되지 않습니다. Upload hook은 `ref` 또는 `inputRef`가 필요하며, 한 번에 하나의 파일, CSS `element` 없음. Dialog hook은 타임아웃 override를 지원하지 않습니다.
- **관리형 전용 기능** — batch 액션, PDF export, download interception, `responsebody`는 여전히 관리형 browser 경로가 필요합니다.

</Accordion>

## 격리 보장

- **전용 사용자 데이터 디렉토리**: 개인 browser 프로필을 건드리지 않습니다.
- **전용 포트**: 개발 워크플로와의 충돌을 방지하기 위해 `9222`를 피합니다.
- **결정적인 탭 제어**: "마지막 탭"이 아니라 `targetId`로 탭을 타깃팅합니다.

## 브라우저 선택

로컬로 실행할 때 OpenClaw는 사용 가능한 첫 번째를 선택합니다.

1. Chrome
2. Brave
3. Edge
4. Chromium
5. Chrome Canary

`browser.executablePath`로 재정의할 수 있습니다.

플랫폼:

- macOS: `/Applications` 및 `~/Applications` 확인.
- Linux: `google-chrome`, `brave`, `microsoft-edge`, `chromium` 등 찾음.
- Windows: 일반적인 설치 위치 확인.

## 제어 API (선택 사항)

스크립팅 및 디버깅을 위해 Gateway는 작은 **loopback 전용 HTTP 제어 API**와 일치하는 `openclaw browser` CLI(스냅샷, ref, wait power-up, JSON 출력, 디버그 워크플로)를 노출합니다. 전체 참조는 [Browser 제어 API](/tools/browser-control)를 참조하세요.

## 문제 해결

Linux 특정 문제(특히 snap Chromium)는 [Browser 문제 해결](/tools/browser-linux-troubleshooting)을 참조하세요.

WSL2 Gateway + Windows Chrome split-host 설정은 [WSL2 + Windows + 원격 Chrome CDP 문제 해결](/tools/browser-wsl2-windows-remote-cdp-troubleshooting)을 참조하세요.

### CDP 시작 실패 vs 내비게이션 SSRF 차단

이들은 서로 다른 실패 클래스이며 다른 코드 경로를 가리킵니다.

- **CDP 시작 또는 readiness 실패**는 OpenClaw가 browser 제어 평면이 건강한지 확인할 수 없음을 의미합니다.
- **내비게이션 SSRF 차단**은 browser 제어 평면이 건강하지만 페이지 내비게이션 대상이 정책에 의해 거부됨을 의미합니다.

일반적인 예:

- CDP 시작 또는 readiness 실패:
  - `Chrome CDP websocket for profile "openclaw" is not reachable after start`
  - `Remote CDP for profile "<name>" is not reachable at <cdpUrl>`
- 내비게이션 SSRF 차단:
  - `start`와 `tabs`는 여전히 작동하는데 `open`, `navigate`, snapshot 또는 탭 열기 흐름이 browser/network 정책 오류로 실패

두 가지를 구분하려면 이 최소 시퀀스를 사용하세요.

```bash
openclaw browser --browser-profile openclaw start
openclaw browser --browser-profile openclaw tabs
openclaw browser --browser-profile openclaw open https://example.com
```

결과를 읽는 방법:

- `start`가 `not reachable after start`로 실패하면 먼저 CDP readiness를 문제 해결하세요.
- `start`가 성공하지만 `tabs`가 실패하면 제어 평면이 여전히 건강하지 않습니다. 이를 페이지 내비게이션 문제가 아닌 CDP 도달 가능성 문제로 취급하세요.
- `start`와 `tabs`는 성공하지만 `open` 또는 `navigate`가 실패하면 browser 제어 평면이 작동하며 실패는 내비게이션 정책이나 대상 페이지에 있습니다.
- `start`, `tabs`, `open`이 모두 성공하면 기본 관리형 browser 제어 경로가 건강합니다.

중요한 동작 세부사항:

- `browser.ssrfPolicy`를 설정하지 않아도 Browser 설정은 기본적으로 fail-closed SSRF 정책 객체를 가집니다.
- 로컬 loopback `openclaw` 관리형 프로필의 경우 CDP 상태 검사는 OpenClaw 자체 로컬 제어 평면에 대해 의도적으로 browser SSRF 도달 가능성 시행을 건너뜁니다.
- 내비게이션 보호는 별개입니다. 성공적인 `start` 또는 `tabs` 결과가 이후의 `open` 또는 `navigate` 대상이 허용됨을 의미하지는 않습니다.

보안 지침:

- 기본적으로 browser SSRF 정책을 완화하지 **마세요**.
- 광범위한 private-network 접근보다 `hostnameAllowlist` 또는 `allowedHostnames` 같은 좁은 호스트 예외를 선호하세요.
- `dangerouslyAllowPrivateNetwork: true`는 private-network browser 접근이 요구되고 검토된 의도적으로 신뢰할 수 있는 환경에서만 사용하세요.

## agent 도구 + 제어 작동 방식

agent는 browser 자동화를 위한 **하나의 도구**를 얻습니다.

- `browser` — status/start/stop/tabs/open/focus/close/snapshot/screenshot/navigate/act

매핑 방법:

- `browser snapshot`은 안정적인 UI 트리(AI 또는 ARIA)를 반환합니다.
- `browser act`는 snapshot `ref` ID를 사용해 클릭/입력/드래그/선택합니다.
- `browser screenshot`은 픽셀을 캡처합니다(전체 페이지 또는 요소).
- `browser`는 다음을 수락합니다:
  - `profile`: 명명된 browser 프로필 선택(openclaw, chrome, 또는 원격 CDP).
  - `target` (`sandbox` | `host` | `node`): 브라우저가 있는 위치 선택.
  - 샌드박스 세션에서 `target: "host"`는 `agents.defaults.sandbox.browser.allowHostControl=true`가 필요합니다.
  - `target`이 생략되면: 샌드박스 세션은 `sandbox`, 비 샌드박스 세션은 `host`로 기본값.
  - browser 지원 node가 연결되어 있으면 `target="host"` 또는 `target="node"`로 고정하지 않는 한 도구가 자동으로 그곳으로 라우팅될 수 있습니다.

이는 agent를 결정적으로 유지하고 취약한 선택자를 피합니다.

## 관련

- [도구 개요](/tools/) — 사용 가능한 모든 agent 도구
- [샌드박싱](/gateway/sandboxing) — 샌드박스 환경에서의 browser 제어
- [보안](/gateway/security/) — browser 제어 위험 및 강화
