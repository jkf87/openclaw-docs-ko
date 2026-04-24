---
summary: "WSL2 게이트웨이 + Windows Chrome 원격 CDP를 계층별로 트러블슈팅합니다"
read_when:
  - WSL2에서 OpenClaw 게이트웨이를 실행하면서 Chrome이 Windows에 있는 경우
  - WSL2와 Windows에 걸쳐 중첩된 브라우저/Control UI 오류가 보이는 경우
  - 분리 호스트 설정에서 호스트 로컬 Chrome MCP와 원시 원격 CDP 중 선택하는 경우
title: "WSL2 + Windows + 원격 Chrome CDP 트러블슈팅"
---

이 가이드는 다음과 같은 일반적인 분리 호스트 설정을 다룹니다:

- OpenClaw 게이트웨이가 WSL2 내부에서 실행됨
- Chrome이 Windows에서 실행됨
- 브라우저 제어가 WSL2/Windows 경계를 넘어야 함

또한 [issue #39369](https://github.com/openclaw/openclaw/issues/39369)의 계층화된 실패 패턴도 다룹니다: 여러 독립적인 문제가 동시에 나타나서 잘못된 계층이 먼저 고장난 것처럼 보이게 합니다.

## 먼저 올바른 브라우저 모드 선택

두 가지 유효한 패턴이 있습니다:

### 옵션 1: WSL2에서 Windows로의 원시 원격 CDP

WSL2에서 Windows Chrome CDP 엔드포인트를 가리키는 원격 브라우저 프로필을 사용합니다.

다음과 같을 때 선택하세요:

- 게이트웨이가 WSL2 내부에 머무름
- Chrome이 Windows에서 실행됨
- 브라우저 제어가 WSL2/Windows 경계를 넘어야 함

### 옵션 2: 호스트 로컬 Chrome MCP

게이트웨이 자체가 Chrome과 같은 호스트에서 실행될 때만 `existing-session` / `user`를 사용하세요.

다음과 같을 때 선택하세요:

- OpenClaw와 Chrome이 같은 머신에 있음
- 로컬에서 로그인된 브라우저 상태를 원함
- 크로스 호스트 브라우저 전송이 필요 없음
- `responsebody`, PDF
  export, 다운로드 인터셉트 또는 배치 액션과 같은 고급 관리형/원시-CDP-전용 경로가 필요 없음

WSL2 게이트웨이 + Windows Chrome의 경우 원시 원격 CDP를 선호하세요. Chrome MCP는 호스트 로컬이며, WSL2-Windows 브리지가 아닙니다.

## 작동하는 아키텍처

참조 형태:

- WSL2가 `127.0.0.1:18789`에서 게이트웨이를 실행
- Windows가 `http://127.0.0.1:18789/`의 일반 브라우저에서 Control UI를 엶
- Windows Chrome이 포트 `9222`에서 CDP 엔드포인트를 노출
- WSL2가 해당 Windows CDP 엔드포인트에 도달할 수 있음
- OpenClaw가 WSL2에서 도달 가능한 주소로 브라우저 프로필을 가리킴

## 이 설정이 혼란스러운 이유

여러 실패가 겹칠 수 있습니다:

- WSL2가 Windows CDP 엔드포인트에 도달할 수 없음
- Control UI가 비보안 오리진에서 열림
- `gateway.controlUi.allowedOrigins`가 페이지 오리진과 일치하지 않음
- 토큰 또는 페어링이 누락됨
- 브라우저 프로필이 잘못된 주소를 가리킴

그렇기 때문에 한 계층을 고쳐도 다른 오류가 여전히 보일 수 있습니다.

## Control UI에 대한 핵심 규칙

UI가 Windows에서 열릴 때는 의도적인 HTTPS 설정이 없는 한 Windows localhost를 사용하세요.

사용:

`http://127.0.0.1:18789/`

Control UI에 대해 LAN IP를 기본값으로 하지 마세요. LAN 또는 tailnet 주소의 일반 HTTP는 CDP 자체와 관련 없는 비보안 오리진/기기 인증 동작을 트리거할 수 있습니다. [Control UI](/web/control-ui)를 참고하세요.

## 계층별 검증

위에서 아래로 작업하세요. 건너뛰지 마세요.

### 계층 1: Windows에서 Chrome이 CDP를 제공하는지 확인

원격 디버깅을 활성화하여 Windows에서 Chrome을 시작합니다:

```powershell
chrome.exe --remote-debugging-port=9222
```

Windows에서 먼저 Chrome 자체를 확인합니다:

```powershell
curl http://127.0.0.1:9222/json/version
curl http://127.0.0.1:9222/json/list
```

이것이 Windows에서 실패하면 OpenClaw가 아직 문제가 아닙니다.

### 계층 2: WSL2가 해당 Windows 엔드포인트에 도달할 수 있는지 확인

WSL2에서 `cdpUrl`에 사용할 계획인 정확한 주소를 테스트합니다:

```bash
curl http://WINDOWS_HOST_OR_IP:9222/json/version
curl http://WINDOWS_HOST_OR_IP:9222/json/list
```

좋은 결과:

- `/json/version`이 Browser / Protocol-Version 메타데이터가 포함된 JSON을 반환
- `/json/list`가 JSON을 반환 (페이지가 열려 있지 않으면 빈 배열도 괜찮음)

이것이 실패하면:

- Windows가 아직 WSL2에 포트를 노출하지 않음
- WSL2 측에서 주소가 잘못됨
- 방화벽 / 포트 포워딩 / 로컬 프록시가 여전히 누락됨

OpenClaw 설정을 건드리기 전에 이것을 수정하세요.

### 계층 3: 올바른 브라우저 프로필 구성

원시 원격 CDP의 경우, OpenClaw를 WSL2에서 도달 가능한 주소로 가리킵니다:

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "remote",
    profiles: {
      remote: {
        cdpUrl: "http://WINDOWS_HOST_OR_IP:9222",
        attachOnly: true,
        color: "#00AA00",
      },
    },
  },
}
```

참고:

- Windows에서만 작동하는 것이 아닌 WSL2에서 도달 가능한 주소를 사용하세요
- 외부에서 관리되는 브라우저에는 `attachOnly: true`를 유지하세요
- `cdpUrl`은 `http://`, `https://`, `ws://` 또는 `wss://`가 될 수 있습니다
- OpenClaw가 `/json/version`을 발견하기를 원한다면 HTTP(S)를 사용하세요
- 브라우저 프로바이더가 직접 DevTools 소켓 URL을 제공할 때만 WS(S)를 사용하세요
- OpenClaw가 성공할 것을 기대하기 전에 `curl`로 동일한 URL을 테스트하세요

### 계층 4: Control UI 계층을 별도로 확인

Windows에서 UI를 엽니다:

`http://127.0.0.1:18789/`

그런 다음 확인합니다:

- 페이지 오리진이 `gateway.controlUi.allowedOrigins`가 기대하는 것과 일치
- 토큰 인증 또는 페어링이 올바르게 구성됨
- Control UI 인증 문제를 브라우저 문제처럼 디버깅하고 있지 않음

유용한 페이지:

- [Control UI](/web/control-ui)

### 계층 5: 엔드투엔드 브라우저 제어 확인

WSL2에서:

```bash
openclaw browser open https://example.com --browser-profile remote
openclaw browser tabs --browser-profile remote
```

좋은 결과:

- 탭이 Windows Chrome에서 열림
- `openclaw browser tabs`가 대상을 반환
- 이후 액션(`snapshot`, `screenshot`, `navigate`)이 같은 프로필에서 작동

## 흔한 오해를 부르는 오류

각 메시지를 계층별 단서로 취급하세요:

- `control-ui-insecure-auth`
  - UI 오리진 / 보안 컨텍스트 문제이지 CDP 전송 문제가 아님
- `token_missing`
  - 인증 구성 문제
- `pairing required`
  - 기기 승인 문제
- `Remote CDP for profile "remote" is not reachable`
  - WSL2가 구성된 `cdpUrl`에 도달할 수 없음
- `Browser attachOnly is enabled and CDP websocket for profile "remote" is not reachable`
  - HTTP 엔드포인트는 응답했지만 DevTools WebSocket은 여전히 열 수 없음
- 원격 세션 후 오래된 뷰포트 / 다크 모드 / 로케일 / 오프라인 재정의
  - `openclaw browser stop --browser-profile remote`를 실행
  - 이는 활성 제어 세션을 닫고 게이트웨이나 외부 브라우저를 재시작하지 않고 Playwright/CDP 에뮬레이션 상태를 해제함
- `gateway timeout after 1500ms`
  - 여전히 CDP 도달성 또는 느린/도달 불가능한 원격 엔드포인트인 경우가 많음
- `No Chrome tabs found for profile="user"`
  - 호스트 로컬 탭이 없는 곳에서 로컬 Chrome MCP 프로필이 선택됨

## 빠른 분류 체크리스트

1. Windows: `curl http://127.0.0.1:9222/json/version`이 작동하는가?
2. WSL2: `curl http://WINDOWS_HOST_OR_IP:9222/json/version`이 작동하는가?
3. OpenClaw 설정: `browser.profiles.<name>.cdpUrl`이 정확히 그 WSL2 도달 가능한 주소를 사용하는가?
4. Control UI: LAN IP 대신 `http://127.0.0.1:18789/`를 열고 있는가?
5. 원시 원격 CDP 대신 WSL2와 Windows에 걸쳐 `existing-session`을 사용하려고 하는가?

## 실용적인 요점

이 설정은 일반적으로 실현 가능합니다. 어려운 부분은 브라우저 전송, Control UI 오리진 보안, 토큰/페어링이 각각 독립적으로 실패할 수 있지만 사용자 측에서 비슷하게 보인다는 것입니다.

의심스러울 때:

- 먼저 Windows Chrome 엔드포인트를 로컬에서 확인
- 두 번째로 WSL2에서 동일한 엔드포인트 확인
- 그다음에만 OpenClaw 설정 또는 Control UI 인증을 디버깅

## 관련

- [Browser](/tools/browser)
- [Browser login](/tools/browser-login)
- [Browser Linux troubleshooting](/tools/browser-linux-troubleshooting)
