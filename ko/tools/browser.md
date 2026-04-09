---
summary: "통합 브라우저 제어 서비스 + 액션 명령"
read_when:
  - Adding agent-controlled browser automation
  - Debugging why openclaw is interfering with your own Chrome
  - Implementing browser settings + lifecycle in the macOS app
title: "브라우저 (OpenClaw 관리형)"
---

# 브라우저 (openclaw 관리형)

OpenClaw는 에이전트가 제어하는 **전용 Chrome/Brave/Edge/Chromium 프로파일**을 실행할 수 있습니다.
개인 브라우저와 격리되어 있으며 게이트웨이 내부의 소형 로컬 제어 서비스를 통해 관리됩니다(루프백 전용).

초보자 관점:

- **에이전트 전용 별도 브라우저**로 생각하십시오.
- `openclaw` 프로파일은 개인 브라우저 프로파일을 **건드리지 않습니다**.
- 에이전트는 안전한 레인에서 **탭을 열고, 페이지를 읽고, 클릭하고, 입력**할 수 있습니다.
- 내장된 `user` 프로파일은 Chrome MCP를 통해 실제 로그인된 Chrome 세션에 연결됩니다.

## 제공 기능

- **openclaw**라는 별도의 브라우저 프로파일 (기본값으로 주황색 강조).
- 결정론적 탭 제어 (목록/열기/포커스/닫기).
- 에이전트 액션 (클릭/입력/드래그/선택), 스냅샷, 스크린샷, PDF.
- 선택적 멀티 프로파일 지원 (`openclaw`, `work`, `remote`, ...).

이 브라우저는 **일상 용도가 아닙니다**. 에이전트 자동화 및 검증을 위한 안전하고 격리된 표면입니다.

## 빠른 시작

```bash
openclaw browser --browser-profile openclaw status
openclaw browser --browser-profile openclaw start
openclaw browser --browser-profile openclaw open https://example.com
openclaw browser --browser-profile openclaw snapshot
```

"Browser disabled"가 나타나면 구성에서 활성화하고 (아래 참조) 게이트웨이를 재시작하십시오.

`openclaw browser`가 완전히 누락되거나 에이전트가 브라우저 도구를 사용할 수 없다고 하면 [누락된 브라우저 명령 또는 도구](/tools/browser#missing-browser-command-or-tool)로 이동하십시오.

## 플러그인 제어

기본 `browser` 도구는 이제 기본적으로 활성화되어 제공되는 번들 플러그인입니다. 즉, OpenClaw의 플러그인 시스템 나머지를 제거하지 않고 비활성화하거나 교체할 수 있습니다:

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

동일한 `browser` 도구 이름을 제공하는 다른 플러그인을 설치하기 전에 번들 플러그인을 비활성화하십시오. 기본 브라우저 경험에는 두 가지가 모두 필요합니다:

- `plugins.entries.browser.enabled`가 비활성화되지 않음
- `browser.enabled=true`

플러그인만 끄면 번들 브라우저 CLI(`openclaw browser`), 게이트웨이 메서드(`browser.request`), 에이전트 도구, 기본 브라우저 제어 서비스가 모두 함께 사라집니다. `browser.*` 구성은 교체 플러그인이 재사용할 수 있도록 그대로 유지됩니다.

번들 브라우저 플러그인은 이제 브라우저 런타임 구현을 소유합니다.
코어는 공유 Plugin SDK 도우미와 이전 내부 임포트 경로에 대한 호환성 재내보내기만 유지합니다. 실제로 브라우저 플러그인 패키지를 제거하거나 교체하면 두 번째 코어 소유 런타임을 남기는 대신 브라우저 기능 세트가 제거됩니다.

브라우저 구성 변경은 번들 플러그인이 새 설정으로 브라우저 서비스를 재등록할 수 있도록 게이트웨이 재시작이 여전히 필요합니다.

## 누락된 브라우저 명령 또는 도구

업그레이드 후 `openclaw browser`가 갑자기 알 수 없는 명령이 되거나, 에이전트가 브라우저 도구가 누락되었다고 보고하는 경우, 가장 일반적인 원인은 `browser`를 포함하지 않는 제한적인 `plugins.allow` 목록입니다.

잘못된 구성 예시:

```json5
{
  plugins: {
    allow: ["telegram"],
  },
}
```

플러그인 허용 목록에 `browser`를 추가하여 수정하십시오:

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

중요 참고 사항:

- `browser.enabled=true`만으로는 `plugins.allow`가 설정된 경우 충분하지 않습니다.
- `plugins.entries.browser.enabled=true`만으로도 `plugins.allow`가 설정된 경우 충분하지 않습니다.
- `tools.alsoAllow: ["browser"]`는 번들 브라우저 플러그인을 **로드하지 않습니다**. 플러그인이 이미 로드된 후 도구 정책만 조정합니다.
- 제한적인 플러그인 허용 목록이 필요하지 않은 경우 `plugins.allow`를 제거하면 기본 번들 브라우저 동작도 복원됩니다.

일반적인 증상:

- `openclaw browser`가 알 수 없는 명령입니다.
- `browser.request`가 누락되었습니다.
- 에이전트가 브라우저 도구를 사용할 수 없거나 누락되었다고 보고합니다.

## 프로파일: `openclaw` vs `user`

- `openclaw`: 관리되고 격리된 브라우저 (확장 프로그램 불필요).
- `user`: **실제 로그인된 Chrome** 세션에 대한 내장 Chrome MCP 연결 프로파일.

에이전트 브라우저 도구 호출의 경우:

- 기본값: 격리된 `openclaw` 브라우저 사용.
- 기존 로그인 세션이 중요하고 사용자가 연결/승인 프롬프트를 클릭/승인하기 위해 컴퓨터 앞에 있을 때 `profile="user"`를 선호하십시오.
- `profile`은 특정 브라우저 모드를 원할 때 명시적 재정의입니다.

관리 모드를 기본값으로 원한다면 `browser.defaultProfile: "openclaw"`를 설정하십시오.

## 구성

브라우저 설정은 `~/.openclaw/openclaw.json`에 있습니다.

```json5
{
  browser: {
    enabled: true, // 기본값: true
    ssrfPolicy: {
      dangerouslyAllowPrivateNetwork: true, // 기본값 신뢰된 네트워크 모드
      // allowPrivateNetwork: true, // 레거시 별칭
      // hostnameAllowlist: ["*.example.com", "example.com"],
      // allowedHostnames: ["localhost"],
    },
    // cdpUrl: "http://127.0.0.1:18792", // 레거시 단일 프로파일 재정의
    remoteCdpTimeoutMs: 1500, // 원격 CDP HTTP 타임아웃 (ms)
    remoteCdpHandshakeTimeoutMs: 3000, // 원격 CDP WebSocket 핸드셰이크 타임아웃 (ms)
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

참고:

- 브라우저 제어 서비스는 `gateway.port`에서 파생된 포트의 루프백에 바인딩됩니다 (기본값: `18791`, 즉 게이트웨이 + 2).
- 게이트웨이 포트(`gateway.port` 또는 `OPENCLAW_GATEWAY_PORT`)를 재정의하면 파생된 브라우저 포트가 동일한 "패밀리"에 유지되도록 이동합니다.
- `cdpUrl`은 설정되지 않은 경우 관리되는 로컬 CDP 포트로 기본 설정됩니다.
- `remoteCdpTimeoutMs`는 원격 (비루프백) CDP 접근성 확인에 적용됩니다.
- `remoteCdpHandshakeTimeoutMs`는 원격 CDP WebSocket 접근성 확인에 적용됩니다.
- 브라우저 탐색/탭 열기는 탐색 전 SSRF 가드되고 탐색 후 최종 `http(s)` URL에서 최선 노력으로 재확인됩니다.
- 엄격한 SSRF 모드에서 원격 CDP 엔드포인트 검색/프로브(`cdpUrl`, `/json/version` 조회 포함)도 확인됩니다.
- `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork`는 기본값이 `true`(신뢰된 네트워크 모델)입니다. 엄격한 공개 전용 브라우징을 위해 `false`로 설정하십시오.
- `browser.ssrfPolicy.allowPrivateNetwork`는 호환성을 위한 레거시 별칭으로 여전히 지원됩니다.
- `attachOnly: true`는 "절대 로컬 브라우저를 시작하지 않음; 이미 실행 중인 경우에만 연결"을 의미합니다.
- `color` + 프로파일별 `color`는 어느 프로파일이 활성화되었는지 볼 수 있도록 브라우저 UI를 착색합니다.
- 기본 프로파일은 `openclaw`(OpenClaw 관리형 독립 브라우저)입니다. 서명된 사용자 브라우저를 선택하려면 `defaultProfile: "user"`를 사용하십시오.
- 자동 감지 순서: Chromium 기반인 경우 시스템 기본 브라우저; 그렇지 않으면 Chrome → Brave → Edge → Chromium → Chrome Canary.
- 로컬 `openclaw` 프로파일은 자동으로 `cdpPort`/`cdpUrl`을 할당합니다 — 원격 CDP에 대해서만 설정하십시오.
- `driver: "existing-session"`은 원시 CDP 대신 Chrome DevTools MCP를 사용합니다. 해당 드라이버에 `cdpUrl`을 설정하지 마십시오.
- 기존 세션 프로파일이 Brave 또는 Edge 같은 비기본 Chromium 사용자 프로파일에 연결해야 하는 경우 `browser.profiles.<name>.userDataDir`을 설정하십시오.

## Brave (또는 다른 Chromium 기반 브라우저) 사용

**시스템 기본** 브라우저가 Chromium 기반(Chrome/Brave/Edge/등)인 경우 OpenClaw가 자동으로 사용합니다. 자동 감지를 재정의하려면 `browser.executablePath`를 설정하십시오:

CLI 예시:

```bash
openclaw config set browser.executablePath "/usr/bin/google-chrome"
```

```json5
// macOS
{
  browser: {
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  }
}

// Windows
{
  browser: {
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
  }
}

// Linux
{
  browser: {
    executablePath: "/usr/bin/brave-browser"
  }
}
```

## 로컬 vs 원격 제어

- **로컬 제어 (기본값):** 게이트웨이가 루프백 제어 서비스를 시작하고 로컬 브라우저를 시작할 수 있습니다.
- **원격 제어 (노드 호스트):** 브라우저가 있는 머신에서 노드 호스트를 실행합니다; 게이트웨이는 브라우저 액션을 프록시합니다.
- **원격 CDP:** 원격 Chromium 기반 브라우저에 연결하려면 `browser.profiles.<name>.cdpUrl`(또는 `browser.cdpUrl`)을 설정하십시오. 이 경우 OpenClaw는 로컬 브라우저를 시작하지 않습니다.

중지 동작은 프로파일 모드에 따라 다릅니다:

- 로컬 관리 프로파일: `openclaw browser stop`은 OpenClaw가 시작한 브라우저 프로세스를 중지합니다
- 연결 전용 및 원격 CDP 프로파일: `openclaw browser stop`은 활성 제어 세션을 닫고 Playwright/CDP 에뮬레이션 재정의(뷰포트, 색 구성표, 로케일, 시간대, 오프라인 모드 및 유사한 상태)를 해제합니다. OpenClaw가 브라우저 프로세스를 시작하지 않더라도 마찬가지입니다

원격 CDP URL에는 인증이 포함될 수 있습니다:

- 쿼리 토큰 (예: `https://provider.example?token=<token>`)
- HTTP Basic 인증 (예: `https://user:pass@provider.example`)

OpenClaw는 `/json/*` 엔드포인트를 호출하고 CDP WebSocket에 연결할 때 인증을 보존합니다. 구성 파일에 커밋하는 대신 환경 변수 또는 시크릿 매니저를 사용하십시오.

## 노드 브라우저 프록시 (기본값 제로 구성)

브라우저가 있는 머신에서 **노드 호스트**를 실행하면 OpenClaw는 추가 브라우저 구성 없이 브라우저 도구 호출을 해당 노드로 자동 라우팅할 수 있습니다. 이것은 원격 게이트웨이의 기본 경로입니다.

참고:

- 노드 호스트는 **프록시 명령**을 통해 로컬 브라우저 제어 서버를 노출합니다.
- 프로파일은 노드 자체 `browser.profiles` 구성에서 옵니다 (로컬과 동일).
- `nodeHost.browserProxy.allowProfiles`는 선택적입니다. 레거시/기본 동작을 위해 비워두십시오: 구성된 모든 프로파일은 프로파일 생성/삭제 라우트를 포함하여 프록시를 통해 연결 가능합니다.
- `nodeHost.browserProxy.allowProfiles`를 설정하면 OpenClaw는 최소 권한 경계로 취급합니다: 허용 목록에 있는 프로파일만 대상으로 지정할 수 있고, 영구 프로파일 생성/삭제 라우트는 프록시 표면에서 차단됩니다.
- 원하지 않으면 비활성화하십시오:
  - 노드에서: `nodeHost.browserProxy.enabled=false`
  - 게이트웨이에서: `gateway.nodes.browser.mode="off"`

## Browserless (호스팅된 원격 CDP)

[Browserless](https://browserless.io)는 HTTPS 및 WebSocket을 통해 CDP 연결 URL을 노출하는 호스팅된 Chromium 서비스입니다. OpenClaw는 두 형식을 모두 사용할 수 있지만 원격 브라우저 프로파일의 경우 가장 간단한 옵션은 Browserless 연결 문서의 직접 WebSocket URL입니다.

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

참고:

- `<BROWSERLESS_API_KEY>`를 실제 Browserless 토큰으로 교체하십시오.
- Browserless 계정과 일치하는 지역 엔드포인트를 선택하십시오 (해당 문서 참조).
- Browserless가 HTTPS 기본 URL을 제공하는 경우 직접 CDP 연결을 위해 `wss://`로 변환하거나 HTTPS URL을 유지하고 OpenClaw가 `/json/version`을 검색하도록 할 수 있습니다.

## 직접 WebSocket CDP 프로바이더

일부 호스팅된 브라우저 서비스는 표준 HTTP 기반 CDP 검색(`/json/version`) 대신 **직접 WebSocket** 엔드포인트를 노출합니다. OpenClaw는 두 가지를 모두 지원합니다:

- **HTTP(S) 엔드포인트** — OpenClaw는 WebSocket 디버거 URL을 검색하기 위해 `/json/version`을 호출한 후 연결합니다.
- **WebSocket 엔드포인트** (`ws://` / `wss://`) — OpenClaw는 `/json/version`을 건너뛰고 직접 연결합니다. [Browserless](https://browserless.io), [Browserbase](https://www.browserbase.com), 또는 WebSocket URL을 제공하는 프로바이더에 사용하십시오.

### Browserbase

[Browserbase](https://www.browserbase.com)는 내장 CAPTCHA 해결, 스텔스 모드 및 주거용 프록시를 갖춘 헤드리스 브라우저 실행을 위한 클라우드 플랫폼입니다.

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

참고:

- [가입](https://www.browserbase.com/sign-up)하고 [개요 대시보드](https://www.browserbase.com/overview)에서 **API 키**를 복사하십시오.
- `<BROWSERBASE_API_KEY>`를 실제 Browserbase API 키로 교체하십시오.
- Browserbase는 WebSocket 연결 시 브라우저 세션을 자동 생성하므로 수동 세션 생성 단계가 필요 없습니다.
- 무료 티어는 하나의 동시 세션과 월 한 시간의 브라우저를 허용합니다. 유료 플랜 제한은 [가격](https://www.browserbase.com/pricing)을 참조하십시오.
- 전체 API 레퍼런스, SDK 가이드, 통합 예시는 [Browserbase 문서](https://docs.browserbase.com)를 참조하십시오.

## 보안

핵심 아이디어:

- 브라우저 제어는 루프백 전용입니다; 액세스는 게이트웨이의 인증이나 노드 페어링을 통해 흐릅니다.
- 독립형 루프백 브라우저 HTTP API는 **공유 시크릿 인증만** 사용합니다:
  게이트웨이 토큰 bearer 인증, `x-openclaw-password`, 또는 구성된 게이트웨이 비밀번호로 HTTP Basic 인증.
- Tailscale Serve 아이덴티티 헤더와 `gateway.auth.mode: "trusted-proxy"`는 이 독립형 루프백 브라우저 API를 **인증하지 않습니다**.
- 브라우저 제어가 활성화되고 공유 시크릿 인증이 구성되지 않은 경우 OpenClaw는 시작 시 `gateway.auth.token`을 자동 생성하고 구성에 유지합니다.
- `gateway.auth.mode`가 이미 `password`, `none`, 또는 `trusted-proxy`인 경우 OpenClaw는 해당 토큰을 자동 생성하지 않습니다.
- 게이트웨이와 노드 호스트를 개인 네트워크(Tailscale)에 유지하십시오; 공개 노출을 피하십시오.
- 원격 CDP URL/토큰을 시크릿으로 취급하십시오; 환경 변수 또는 시크릿 매니저를 선호하십시오.

원격 CDP 팁:

- 가능한 경우 암호화된 엔드포인트(HTTPS 또는 WSS)와 수명이 짧은 토큰을 선호하십시오.
- 구성 파일에 수명이 긴 토큰을 직접 포함하지 마십시오.

## 프로파일 (멀티 브라우저)

OpenClaw는 여러 명명된 프로파일(라우팅 구성)을 지원합니다. 프로파일은 다음과 같습니다:

- **openclaw 관리형**: 자체 사용자 데이터 디렉토리 + CDP 포트가 있는 전용 Chromium 기반 브라우저 인스턴스
- **원격**: 명시적 CDP URL (다른 곳에서 실행 중인 Chromium 기반 브라우저)
- **기존 세션**: Chrome DevTools MCP 자동 연결을 통한 기존 Chrome 프로파일

기본값:

- `openclaw` 프로파일이 없으면 자동으로 생성됩니다.
- `user` 프로파일은 Chrome MCP 기존 세션 연결을 위해 내장됩니다.
- 기존 세션 프로파일은 `user` 이외에는 옵트인입니다; `--driver existing-session`으로 생성하십시오.
- 로컬 CDP 포트는 기본적으로 **18800–18899**에서 할당됩니다.
- 프로파일을 삭제하면 로컬 데이터 디렉토리가 휴지통으로 이동됩니다.

모든 제어 엔드포인트는 `?profile=<name>`을 허용합니다; CLI는 `--browser-profile`을 사용합니다.

## Chrome DevTools MCP를 통한 기존 세션

OpenClaw는 공식 Chrome DevTools MCP 서버를 통해 실행 중인 Chromium 기반 브라우저 프로파일에도 연결할 수 있습니다. 이것은 해당 브라우저 프로파일에서 이미 열려 있는 탭과 로그인 상태를 재사용합니다.

공식 배경 및 설정 참조:

- [Chrome for Developers: Chrome DevTools MCP로 브라우저 세션 사용](https://developer.chrome.com/blog/chrome-devtools-mcp-debug-your-browser-session)
- [Chrome DevTools MCP README](https://github.com/ChromeDevTools/chrome-devtools-mcp)

내장 프로파일:

- `user`

선택적: 다른 이름, 색상 또는 브라우저 데이터 디렉토리를 원하는 경우 사용자 정의 기존 세션 프로파일을 생성하십시오.

기본 동작:

- 내장 `user` 프로파일은 기본 로컬 Google Chrome 프로파일을 대상으로 하는 Chrome MCP 자동 연결을 사용합니다.

Brave, Edge, Chromium, 또는 비기본 Chrome 프로파일에는 `userDataDir`을 사용하십시오:

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

1. 원격 디버깅을 위한 브라우저의 검사 페이지를 여십시오.
2. 원격 디버깅을 활성화하십시오.
3. 브라우저를 실행 상태로 유지하고 OpenClaw가 연결할 때 연결 프롬프트를 승인하십시오.

일반적인 검사 페이지:

- Chrome: `chrome://inspect/#remote-debugging`
- Brave: `brave://inspect/#remote-debugging`
- Edge: `edge://inspect/#remote-debugging`

라이브 연결 연기 테스트:

```bash
openclaw browser --browser-profile user start
openclaw browser --browser-profile user status
openclaw browser --browser-profile user tabs
openclaw browser --browser-profile user snapshot --format ai
```

성공의 모습:

- `status`는 `driver: existing-session`을 표시합니다
- `status`는 `transport: chrome-mcp`를 표시합니다
- `status`는 `running: true`를 표시합니다
- `tabs`는 이미 열린 브라우저 탭을 나열합니다
- `snapshot`은 선택된 라이브 탭에서 참조를 반환합니다

연결이 작동하지 않는 경우 확인 사항:

- 대상 Chromium 기반 브라우저가 버전 `144+`입니다
- 해당 브라우저의 검사 페이지에서 원격 디버깅이 활성화됩니다
- 브라우저가 표시되고 연결 동의 프롬프트를 수락했습니다
- `openclaw doctor`는 이전 확장 프로그램 기반 브라우저 구성을 마이그레이션하고 기본 자동 연결 프로파일에 대해 Chrome이 로컬로 설치되어 있는지 확인하지만, 사용자 대신 브라우저 측 원격 디버깅을 활성화할 수 없습니다

에이전트 사용:

- 사용자의 로그인된 브라우저 상태가 필요한 경우 `profile="user"`를 사용하십시오.
- 사용자 정의 기존 세션 프로파일을 사용하는 경우 해당 명시적 프로파일 이름을 전달하십시오.
- 사용자가 연결 프롬프트를 승인하기 위해 컴퓨터 앞에 있을 때만 이 모드를 선택하십시오.
- 게이트웨이 또는 노드 호스트는 `npx chrome-devtools-mcp@latest --autoConnect`를 생성할 수 있습니다

참고:

- 이 경로는 로그인된 브라우저 세션 내에서 작동할 수 있기 때문에 격리된 `openclaw` 프로파일보다 위험성이 높습니다.
- OpenClaw는 이 드라이버에 대해 브라우저를 시작하지 않습니다; 기존 세션에만 연결합니다.
- OpenClaw는 여기서 공식 Chrome DevTools MCP `--autoConnect` 흐름을 사용합니다. `userDataDir`이 설정된 경우 OpenClaw는 해당 명시적 Chromium 사용자 데이터 디렉토리를 대상으로 전달합니다.
- 기존 세션 스크린샷은 페이지 캡처와 스냅샷의 `--ref` 요소 캡처를 지원하지만 CSS `--element` 선택기는 지원하지 않습니다.
- 기존 세션 페이지 스크린샷은 Chrome MCP를 통해 Playwright 없이 작동합니다. 참조 기반 요소 스크린샷(`--ref`)도 거기서 작동하지만 `--full-page`는 `--ref` 또는 `--element`와 결합될 수 없습니다.
- 기존 세션 액션은 여전히 관리 브라우저 경로보다 더 제한적입니다:
  - `click`, `type`, `hover`, `scrollIntoView`, `drag`, `select`는 CSS 선택기 대신 스냅샷 참조가 필요합니다
  - `click`은 왼쪽 버튼만 (버튼 재정의나 수정자 없음)
  - `type`은 `slowly=true`를 지원하지 않습니다; `fill` 또는 `press`를 사용하십시오
  - `press`는 `delayMs`를 지원하지 않습니다
  - `hover`, `scrollIntoView`, `drag`, `select`, `fill`, `evaluate`는 호출별 타임아웃 재정의를 지원하지 않습니다
  - `select`는 현재 단일 값만 지원합니다
- 기존 세션 `wait --url`은 다른 브라우저 드라이버처럼 정확, 부분 문자열, 글로브 패턴을 지원합니다. `wait --load networkidle`은 아직 지원되지 않습니다.
- 기존 세션 업로드 훅은 `ref` 또는 `inputRef`가 필요하고, 한 번에 하나의 파일을 지원하며, CSS `element` 타겟팅을 지원하지 않습니다.
- 기존 세션 대화 훅은 타임아웃 재정의를 지원하지 않습니다.
- 일부 기능은 여전히 관리 브라우저 경로가 필요합니다. 배치 액션, PDF 내보내기, 다운로드 인터셉션, `responsebody` 포함.
- 기존 세션은 호스트 로컬입니다. Chrome이 다른 머신이나 다른 네트워크 네임스페이스에 있는 경우 원격 CDP 또는 노드 호스트를 사용하십시오.

## 격리 보장

- **전용 사용자 데이터 디렉토리**: 개인 브라우저 프로파일을 절대 건드리지 않습니다.
- **전용 포트**: 개발 워크플로우와의 충돌을 방지하기 위해 `9222`를 피합니다.
- **결정론적 탭 제어**: "마지막 탭"이 아닌 `targetId`로 탭을 대상으로 합니다.

## 브라우저 선택

로컬에서 시작할 때 OpenClaw는 첫 번째로 사용 가능한 것을 선택합니다:

1. Chrome
2. Brave
3. Edge
4. Chromium
5. Chrome Canary

`browser.executablePath`로 재정의할 수 있습니다.

플랫폼:

- macOS: `/Applications` 및 `~/Applications`를 확인합니다.
- Linux: `google-chrome`, `brave`, `microsoft-edge`, `chromium` 등을 찾습니다.
- Windows: 일반적인 설치 위치를 확인합니다.

## 제어 API (선택적)

로컬 통합 전용으로 게이트웨이는 소형 루프백 HTTP API를 노출합니다:

- 상태/시작/중지: `GET /`, `POST /start`, `POST /stop`
- 탭: `GET /tabs`, `POST /tabs/open`, `POST /tabs/focus`, `DELETE /tabs/:targetId`
- 스냅샷/스크린샷: `GET /snapshot`, `POST /screenshot`
- 액션: `POST /navigate`, `POST /act`
- 훅: `POST /hooks/file-chooser`, `POST /hooks/dialog`
- 다운로드: `POST /download`, `POST /wait/download`
- 디버깅: `GET /console`, `POST /pdf`
- 디버깅: `GET /errors`, `GET /requests`, `POST /trace/start`, `POST /trace/stop`, `POST /highlight`
- 네트워크: `POST /response/body`
- 상태: `GET /cookies`, `POST /cookies/set`, `POST /cookies/clear`
- 상태: `GET /storage/:kind`, `POST /storage/:kind/set`, `POST /storage/:kind/clear`
- 설정: `POST /set/offline`, `POST /set/headers`, `POST /set/credentials`, `POST /set/geolocation`, `POST /set/media`, `POST /set/timezone`, `POST /set/locale`, `POST /set/device`

모든 엔드포인트는 `?profile=<name>`을 허용합니다.

공유 시크릿 게이트웨이 인증이 구성된 경우 브라우저 HTTP 라우트도 인증이 필요합니다:

- `Authorization: Bearer <게이트웨이 토큰>`
- `x-openclaw-password: <게이트웨이 비밀번호>` 또는 해당 비밀번호로 HTTP Basic 인증

참고:

- 이 독립형 루프백 브라우저 API는 신뢰 프록시 또는 Tailscale Serve 아이덴티티 헤더를 **사용하지 않습니다**.
- `gateway.auth.mode`가 `none` 또는 `trusted-proxy`인 경우 이 루프백 브라우저 라우트는 해당 아이덴티티 보유 모드를 상속하지 않습니다; 루프백 전용으로 유지하십시오.

### Playwright 요구 사항

일부 기능(navigate/act/AI 스냅샷/역할 스냅샷, 요소 스크린샷, PDF)은 Playwright가 필요합니다. Playwright가 설치되지 않은 경우 해당 엔드포인트는 명확한 501 오류를 반환합니다.

Playwright 없이도 작동하는 기능:

- ARIA 스냅샷
- 탭별 CDP WebSocket이 사용 가능한 경우 관리 `openclaw` 브라우저의 페이지 스크린샷
- `existing-session` / Chrome MCP 프로파일의 페이지 스크린샷
- 스냅샷 출력에서 `existing-session` 참조 기반 스크린샷(`--ref`)

여전히 Playwright가 필요한 기능:

- `navigate`
- `act`
- AI 스냅샷 / 역할 스냅샷
- CSS 선택기 요소 스크린샷(`--element`)
- 전체 브라우저 PDF 내보내기

요소 스크린샷은 또한 `--full-page`를 거부합니다; 라우트는 `fullPage is not supported for element screenshots`를 반환합니다.

`Playwright is not available in this gateway build`가 보이면 전체 Playwright 패키지(playwright-core가 아님)를 설치하고 게이트웨이를 재시작하거나, 브라우저 지원으로 OpenClaw를 재설치하십시오.

#### Docker Playwright 설치

게이트웨이가 Docker에서 실행되는 경우 `npx playwright`를 피하십시오(npm 재정의 충돌). 번들된 CLI를 대신 사용하십시오:

```bash
docker compose run --rm openclaw-cli \
  node /app/node_modules/playwright-core/cli.js install chromium
```

브라우저 다운로드를 유지하려면 `PLAYWRIGHT_BROWSERS_PATH`를 설정하고(예: `/home/node/.cache/ms-playwright`) `/home/node`가 `OPENCLAW_HOME_VOLUME` 또는 바인드 마운트를 통해 유지되도록 하십시오. [Docker](/install/docker)를 참조하십시오.

## 작동 방식 (내부)

개요 흐름:

- 소형 **제어 서버**가 HTTP 요청을 수락합니다.
- **CDP**를 통해 Chromium 기반 브라우저(Chrome/Brave/Edge/Chromium)에 연결됩니다.
- 고급 액션(클릭/입력/스냅샷/PDF)에는 CDP 위에 **Playwright**를 사용합니다.
- Playwright가 없으면 비 Playwright 작업만 사용 가능합니다.

이 설계는 에이전트를 안정적이고 결정론적인 인터페이스에 유지하면서 로컬/원격 브라우저 및 프로파일을 교체할 수 있게 합니다.

## CLI 빠른 참조

모든 명령은 특정 프로파일을 대상으로 하는 `--browser-profile <name>`을 허용합니다.
모든 명령은 또한 머신 읽기 가능한 출력(안정적인 페이로드)을 위한 `--json`을 허용합니다.

기본:

- `openclaw browser status`
- `openclaw browser start`
- `openclaw browser stop`
- `openclaw browser tabs`
- `openclaw browser tab`
- `openclaw browser tab new`
- `openclaw browser tab select 2`
- `openclaw browser tab close 2`
- `openclaw browser open https://example.com`
- `openclaw browser focus abcd1234`
- `openclaw browser close abcd1234`

검사:

- `openclaw browser screenshot`
- `openclaw browser screenshot --full-page`
- `openclaw browser screenshot --ref 12`
- `openclaw browser screenshot --ref e12`
- `openclaw browser snapshot`
- `openclaw browser snapshot --format aria --limit 200`
- `openclaw browser snapshot --interactive --compact --depth 6`
- `openclaw browser snapshot --efficient`
- `openclaw browser snapshot --labels`
- `openclaw browser snapshot --selector "#main" --interactive`
- `openclaw browser snapshot --frame "iframe#main" --interactive`
- `openclaw browser console --level error`

수명 주기 참고:

- 연결 전용 및 원격 CDP 프로파일의 경우 `openclaw browser stop`은 테스트 후에도 올바른 정리 명령입니다. 기반 브라우저를 종료하는 대신 활성 제어 세션을 닫고 임시 에뮬레이션 재정의를 지웁니다.
- `openclaw browser errors --clear`
- `openclaw browser requests --filter api --clear`
- `openclaw browser pdf`
- `openclaw browser responsebody "**/api" --max-chars 5000`

액션:

- `openclaw browser navigate https://example.com`
- `openclaw browser resize 1280 720`
- `openclaw browser click 12 --double`
- `openclaw browser click e12 --double`
- `openclaw browser type 23 "hello" --submit`
- `openclaw browser press Enter`
- `openclaw browser hover 44`
- `openclaw browser scrollintoview e12`
- `openclaw browser drag 10 11`
- `openclaw browser select 9 OptionA OptionB`
- `openclaw browser download e12 report.pdf`
- `openclaw browser waitfordownload report.pdf`
- `openclaw browser upload /tmp/openclaw/uploads/file.pdf`
- `openclaw browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]'`
- `openclaw browser dialog --accept`
- `openclaw browser wait --text "Done"`
- `openclaw browser wait "#main" --url "**/dash" --load networkidle --fn "window.ready===true"`
- `openclaw browser evaluate --fn '(el) => el.textContent' --ref 7`
- `openclaw browser highlight e12`
- `openclaw browser trace start`
- `openclaw browser trace stop`

상태:

- `openclaw browser cookies`
- `openclaw browser cookies set session abc123 --url "https://example.com"`
- `openclaw browser cookies clear`
- `openclaw browser storage local get`
- `openclaw browser storage local set theme dark`
- `openclaw browser storage session clear`
- `openclaw browser set offline on`
- `openclaw browser set headers --headers-json '{"X-Debug":"1"}'`
- `openclaw browser set credentials user pass`
- `openclaw browser set credentials --clear`
- `openclaw browser set geo 37.7749 -122.4194 --origin "https://example.com"`
- `openclaw browser set geo --clear`
- `openclaw browser set media dark`
- `openclaw browser set timezone America/New_York`
- `openclaw browser set locale en-US`
- `openclaw browser set device "iPhone 14"`

참고:

- `upload`과 `dialog`는 **준비** 호출입니다; 선택기/대화 상자를 트리거하는 클릭/누르기 전에 실행하십시오.
- 다운로드 및 추적 출력 경로는 OpenClaw 임시 루트로 제한됩니다:
  - 추적: `/tmp/openclaw` (폴백: `${os.tmpdir()}/openclaw`)
  - 다운로드: `/tmp/openclaw/downloads` (폴백: `${os.tmpdir()}/openclaw/downloads`)
- 업로드 경로는 OpenClaw 임시 업로드 루트로 제한됩니다:
  - 업로드: `/tmp/openclaw/uploads` (폴백: `${os.tmpdir()}/openclaw/uploads`)
- `upload`은 `--input-ref` 또는 `--element`를 통해 파일 입력을 직접 설정할 수도 있습니다.
- `snapshot`:
  - `--format ai` (Playwright가 설치된 경우 기본값): 숫자 참조(`aria-ref="<n>"`)가 있는 AI 스냅샷을 반환합니다.
  - `--format aria`: 접근성 트리를 반환합니다 (참조 없음; 검사 전용).
  - `--efficient` (또는 `--mode efficient`): 간결한 역할 스냅샷 프리셋 (interactive + compact + depth + 낮은 maxChars).
  - 구성 기본값 (도구/CLI만): `browser.snapshotDefaults.mode: "efficient"`를 설정하면 호출자가 모드를 전달하지 않을 때 효율적인 스냅샷을 사용합니다 ([게이트웨이 구성](/gateway/configuration-reference#browser) 참조).
  - 역할 스냅샷 옵션(`--interactive`, `--compact`, `--depth`, `--selector`)은 `ref=e12` 같은 참조가 있는 역할 기반 스냅샷을 강제합니다.
  - `--frame "<iframe selector>"`는 역할 스냅샷을 iframe으로 범위를 지정합니다 (`e12` 같은 역할 참조와 함께 사용).
  - `--interactive`는 대화형 요소의 플랫하고 선택하기 쉬운 목록을 출력합니다 (액션 구동에 최적).
  - `--labels`는 참조 레이블이 오버레이된 뷰포트 전용 스크린샷을 추가합니다 (`MEDIA:<path>` 출력).
- `click`/`type`/등은 `snapshot`의 `ref`가 필요합니다 (숫자 `12` 또는 역할 참조 `e12`).
  CSS 선택기는 액션에 대해 의도적으로 지원되지 않습니다.

## 스냅샷 및 참조

OpenClaw는 두 가지 "스냅샷" 스타일을 지원합니다:

- **AI 스냅샷 (숫자 참조)**: `openclaw browser snapshot` (기본값; `--format ai`)
  - 출력: 숫자 참조가 포함된 텍스트 스냅샷.
  - 액션: `openclaw browser click 12`, `openclaw browser type 23 "hello"`.
  - 내부적으로 참조는 Playwright의 `aria-ref`를 통해 해결됩니다.

- **역할 스냅샷 (`e12` 같은 역할 참조)**: `openclaw browser snapshot --interactive` (또는 `--compact`, `--depth`, `--selector`, `--frame`)
  - 출력: `[ref=e12]` (및 선택적 `[nth=1]`)이 있는 역할 기반 목록/트리.
  - 액션: `openclaw browser click e12`, `openclaw browser highlight e12`.
  - 내부적으로 참조는 `getByRole(...)`(중복에는 `nth()` 추가)를 통해 해결됩니다.
  - `--labels`를 추가하면 오버레이된 `e12` 레이블이 있는 뷰포트 스크린샷이 포함됩니다.

참조 동작:

- 참조는 **탐색 전반에 걸쳐 안정적이지 않습니다**; 무언가가 실패하면 `snapshot`을 다시 실행하고 새 참조를 사용하십시오.
- 역할 스냅샷이 `--frame`으로 찍힌 경우 역할 참조는 다음 역할 스냅샷까지 해당 iframe으로 범위가 지정됩니다.

## 대기 강화 기능

단순한 시간/텍스트 이상을 기다릴 수 있습니다:

- URL 대기 (Playwright가 지원하는 글로브):
  - `openclaw browser wait --url "**/dash"`
- 로드 상태 대기:
  - `openclaw browser wait --load networkidle`
- JS 조건 대기:
  - `openclaw browser wait --fn "window.ready===true"`
- 선택기가 표시될 때까지 대기:
  - `openclaw browser wait "#main"`

이것들은 결합될 수 있습니다:

```bash
openclaw browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
```

## 디버그 워크플로우

액션이 실패할 때 (예: "not visible", "strict mode violation", "covered"):

1. `openclaw browser snapshot --interactive`
2. `click <ref>` / `type <ref>` 사용 (interactive 모드에서 역할 참조 선호)
3. 여전히 실패하면: `openclaw browser highlight <ref>`로 Playwright가 대상으로 하는 것을 확인
4. 페이지가 이상하게 작동하면:
   - `openclaw browser errors --clear`
   - `openclaw browser requests --filter api --clear`
5. 심층 디버깅: 추적 기록:
   - `openclaw browser trace start`
   - 문제 재현
   - `openclaw browser trace stop` (`TRACE:<path>` 출력)

## JSON 출력

`--json`은 스크립팅 및 구조화된 도구를 위한 것입니다.

예시:

```bash
openclaw browser status --json
openclaw browser snapshot --interactive --json
openclaw browser requests --filter api --json
openclaw browser cookies --json
```

JSON의 역할 스냅샷에는 도구가 페이로드 크기와 밀도에 대해 추론할 수 있도록 `refs`와 소형 `stats` 블록(줄/문자/참조/interactive)이 포함됩니다.

## 상태 및 환경 노브

이것들은 "사이트를 X처럼 작동하게 만들기" 워크플로우에 유용합니다:

- 쿠키: `cookies`, `cookies set`, `cookies clear`
- 저장소: `storage local|session get|set|clear`
- 오프라인: `set offline on|off`
- 헤더: `set headers --headers-json '{"X-Debug":"1"}'` (레거시 `set headers --json '{"X-Debug":"1"}'`는 여전히 지원됨)
- HTTP 기본 인증: `set credentials user pass` (또는 `--clear`)
- 지리위치: `set geo <lat> <lon> --origin "https://example.com"` (또는 `--clear`)
- 미디어: `set media dark|light|no-preference|none`
- 시간대 / 로케일: `set timezone ...`, `set locale ...`
- 장치 / 뷰포트:
  - `set device "iPhone 14"` (Playwright 장치 프리셋)
  - `set viewport 1280 720`

## 보안 및 프라이버시

- openclaw 브라우저 프로파일에는 로그인된 세션이 포함될 수 있습니다; 민감하게 취급하십시오.
- `browser act kind=evaluate` / `openclaw browser evaluate` 및 `wait --fn`은 페이지 컨텍스트에서 임의의 JavaScript를 실행합니다. 프롬프트 인젝션이 이것을 조종할 수 있습니다. 필요하지 않으면 `browser.evaluateEnabled=false`로 비활성화하십시오.
- 로그인 및 봇 방지 참고 사항(X/Twitter 등)은 [브라우저 로그인 + X/Twitter 게시](/tools/browser-login)를 참조하십시오.
- 게이트웨이/노드 호스트를 비공개로 유지하십시오 (루프백 또는 tailnet 전용).
- 원격 CDP 엔드포인트는 강력합니다; 터널링하고 보호하십시오.

엄격 모드 예시 (기본적으로 비공개/내부 대상 차단):

```json5
{
  browser: {
    ssrfPolicy: {
      dangerouslyAllowPrivateNetwork: false,
      hostnameAllowlist: ["*.example.com", "example.com"],
      allowedHostnames: ["localhost"], // 선택적 정확 허용
    },
  },
}
```

## 문제 해결

Linux 특정 문제(특히 snap Chromium)는
[브라우저 문제 해결](/tools/browser-linux-troubleshooting)을 참조하십시오.

WSL2 게이트웨이 + Windows Chrome 분리 호스트 설정은
[WSL2 + Windows + 원격 Chrome CDP 문제 해결](/tools/browser-wsl2-windows-remote-cdp-troubleshooting)을 참조하십시오.

## 에이전트 도구 + 제어 작동 방식

에이전트는 브라우저 자동화를 위해 **하나의 도구**를 받습니다:

- `browser` — 상태/시작/중지/탭/열기/포커스/닫기/스냅샷/스크린샷/탐색/액션

매핑 방법:

- `browser snapshot`은 안정적인 UI 트리(AI 또는 ARIA)를 반환합니다.
- `browser act`는 스냅샷 `ref` ID를 사용하여 클릭/입력/드래그/선택합니다.
- `browser screenshot`은 픽셀(전체 페이지 또는 요소)을 캡처합니다.
- `browser`는 다음을 허용합니다:
  - `profile`로 명명된 브라우저 프로파일을 선택합니다 (openclaw, chrome, 또는 원격 CDP).
  - `target` (`sandbox` | `host` | `node`)으로 브라우저가 있는 위치를 선택합니다.
  - 샌드박스화된 세션에서 `target: "host"`는 `agents.defaults.sandbox.browser.allowHostControl=true`가 필요합니다.
  - `target`이 생략된 경우: 샌드박스화된 세션은 기본값으로 `sandbox`, 비샌드박스 세션은 기본값으로 `host`입니다.
  - 브라우저 지원 노드가 연결된 경우 도구는 `target="host"` 또는 `target="node"`를 고정하지 않는 한 자동으로 라우팅될 수 있습니다.

이것은 에이전트를 결정론적으로 유지하고 취약한 선택기를 피합니다.

## 관련 항목

- [도구 개요](/tools) — 모든 사용 가능한 에이전트 도구
- [샌드박싱](/gateway/sandboxing) — 샌드박스 환경에서 브라우저 제어
- [보안](/gateway/security) — 브라우저 제어 위험 및 강화
