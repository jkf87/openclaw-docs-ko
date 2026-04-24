---
summary: "OpenClaw browser control API, CLI 레퍼런스 및 스크립팅 액션"
read_when:
  - 로컬 control API로 에이전트 브라우저를 스크립팅하거나 디버깅하는 경우
  - `openclaw browser` CLI 레퍼런스를 찾는 경우
  - 스냅샷과 ref를 사용한 커스텀 브라우저 자동화를 추가하는 경우
title: "Browser control API"
---

설정, 구성, 트러블슈팅은 [Browser](/tools/browser)를 참조하십시오.
이 페이지는 로컬 control HTTP API, `openclaw browser` CLI, 그리고 스크립팅 패턴(스냅샷, ref, wait, 디버그 흐름)에 대한 레퍼런스입니다.

## Control API (선택 사항)

로컬 통합 전용으로, Gateway는 작은 루프백 HTTP API를 노출합니다:

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

모든 엔드포인트는 `?profile=<name>`을 받습니다.

공유 시크릿 gateway 인증이 구성된 경우, browser HTTP 라우트에도 인증이 필요합니다:

- `Authorization: Bearer <gateway token>`
- `x-openclaw-password: <gateway password>` 또는 해당 비밀번호를 사용한 HTTP Basic auth

참고 사항:

- 이 독립형 루프백 browser API는 trusted-proxy 또는
  Tailscale Serve 아이덴티티 헤더를 **사용하지 않습니다**.
- `gateway.auth.mode`가 `none` 또는 `trusted-proxy`인 경우, 이러한 루프백 browser
  라우트는 해당 아이덴티티 전달 모드를 상속하지 않습니다; 루프백 전용으로 유지하십시오.

### `/act` 에러 계약

`POST /act`는 라우트 수준 유효성 검사 및
정책 실패에 대해 구조화된 에러 응답을 사용합니다:

```json
{ "error": "<message>", "code": "ACT_*" }
```

현재 `code` 값:

- `ACT_KIND_REQUIRED` (HTTP 400): `kind`가 누락되었거나 인식되지 않습니다.
- `ACT_INVALID_REQUEST` (HTTP 400): 액션 페이로드의 정규화 또는 유효성 검사가 실패했습니다.
- `ACT_SELECTOR_UNSUPPORTED` (HTTP 400): `selector`가 지원되지 않는 액션 kind와 함께 사용되었습니다.
- `ACT_EVALUATE_DISABLED` (HTTP 403): `evaluate` (또는 `wait --fn`)가 구성에 의해 비활성화되었습니다.
- `ACT_TARGET_ID_MISMATCH` (HTTP 403): 최상위 또는 배치된 `targetId`가 요청 타겟과 충돌합니다.
- `ACT_EXISTING_SESSION_UNSUPPORTED` (HTTP 501): 액션이 existing-session 프로필에 대해 지원되지 않습니다.

다른 런타임 실패는 `code` 필드 없이 `{ "error": "<message>" }`를
반환할 수 있습니다.

### Playwright 요구 사항

일부 기능(navigate/act/AI 스냅샷/role 스냅샷, 엘리먼트 스크린샷,
PDF)은 Playwright가 필요합니다. Playwright가 설치되지 않은 경우, 해당 엔드포인트는
명확한 501 에러를 반환합니다.

Playwright 없이도 여전히 작동하는 것:

- ARIA 스냅샷
- 탭별 CDP WebSocket이 사용 가능한 경우 관리되는 `openclaw` 브라우저의
  페이지 스크린샷
- `existing-session` / Chrome MCP 프로필에 대한 페이지 스크린샷
- 스냅샷 출력으로부터 `existing-session` ref 기반 스크린샷(`--ref`)

여전히 Playwright가 필요한 것:

- `navigate`
- `act`
- AI 스냅샷 / role 스냅샷
- CSS-selector 엘리먼트 스크린샷 (`--element`)
- 전체 브라우저 PDF 내보내기

엘리먼트 스크린샷은 `--full-page`도 거부합니다; 라우트는 `fullPage is
not supported for element screenshots`를 반환합니다.

`Playwright is not available in this gateway build`가 표시되면, 번들된 브라우저 플러그인 런타임
의존성을 복구하여 `playwright-core`가 설치되도록 한 뒤
gateway를 재시작하십시오. 패키지 설치의 경우 `openclaw doctor --fix`를 실행하십시오.
Docker의 경우 아래와 같이 Chromium 브라우저 바이너리도 설치하십시오.

#### Docker Playwright 설치

Gateway가 Docker에서 실행되는 경우, `npx playwright`는 피하십시오(npm override 충돌).
대신 번들된 CLI를 사용하십시오:

```bash
docker compose run --rm openclaw-cli \
  node /app/node_modules/playwright-core/cli.js install chromium
```

브라우저 다운로드를 영구화하려면 `PLAYWRIGHT_BROWSERS_PATH`(예:
`/home/node/.cache/ms-playwright`)를 설정하고 `/home/node`가
`OPENCLAW_HOME_VOLUME` 또는 바인드 마운트를 통해 영구화되도록 하십시오. [Docker](/install/docker)를 참조하십시오.

## 작동 방식 (내부)

작은 루프백 제어 서버가 HTTP 요청을 받고 CDP를 통해 Chromium 기반 브라우저에 연결합니다. 고급 액션(click/type/snapshot/PDF)은 CDP 위에 있는 Playwright를 거칩니다; Playwright가 없는 경우 Playwright가 필요하지 않은 작업만 사용 가능합니다. 에이전트는 로컬/원격 브라우저와 프로필이 아래에서 자유롭게 교체되는 동안 하나의 안정적인 인터페이스를 봅니다.

## CLI 빠른 레퍼런스

모든 명령은 특정 프로필을 타게팅하기 위해 `--browser-profile <name>`을 받고, 기계 판독 가능한 출력을 위해 `--json`을 받습니다.

<AccordionGroup>

<Accordion title="기본: 상태, 탭, 열기/포커스/닫기">

```bash
openclaw browser status
openclaw browser start
openclaw browser stop            # also clears emulation on attach-only/remote CDP
openclaw browser tabs
openclaw browser tab             # shortcut for current tab
openclaw browser tab new
openclaw browser tab select 2
openclaw browser tab close 2
openclaw browser open https://example.com
openclaw browser focus abcd1234
openclaw browser close abcd1234
```

</Accordion>

<Accordion title="검사: 스크린샷, 스냅샷, 콘솔, 에러, 요청">

```bash
openclaw browser screenshot
openclaw browser screenshot --full-page
openclaw browser screenshot --ref 12        # or --ref e12
openclaw browser snapshot
openclaw browser snapshot --format aria --limit 200
openclaw browser snapshot --interactive --compact --depth 6
openclaw browser snapshot --efficient
openclaw browser snapshot --labels
openclaw browser snapshot --selector "#main" --interactive
openclaw browser snapshot --frame "iframe#main" --interactive
openclaw browser console --level error
openclaw browser errors --clear
openclaw browser requests --filter api --clear
openclaw browser pdf
openclaw browser responsebody "**/api" --max-chars 5000
```

</Accordion>

<Accordion title="액션: navigate, click, type, drag, wait, evaluate">

```bash
openclaw browser navigate https://example.com
openclaw browser resize 1280 720
openclaw browser click 12 --double           # or e12 for role refs
openclaw browser type 23 "hello" --submit
openclaw browser press Enter
openclaw browser hover 44
openclaw browser scrollintoview e12
openclaw browser drag 10 11
openclaw browser select 9 OptionA OptionB
openclaw browser download e12 report.pdf
openclaw browser waitfordownload report.pdf
openclaw browser upload /tmp/openclaw/uploads/file.pdf
openclaw browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]'
openclaw browser dialog --accept
openclaw browser wait --text "Done"
openclaw browser wait "#main" --url "**/dash" --load networkidle --fn "window.ready===true"
openclaw browser evaluate --fn '(el) => el.textContent' --ref 7
openclaw browser highlight e12
openclaw browser trace start
openclaw browser trace stop
```

</Accordion>

<Accordion title="상태: 쿠키, 스토리지, 오프라인, 헤더, geo, 디바이스">

```bash
openclaw browser cookies
openclaw browser cookies set session abc123 --url "https://example.com"
openclaw browser cookies clear
openclaw browser storage local get
openclaw browser storage local set theme dark
openclaw browser storage session clear
openclaw browser set offline on
openclaw browser set headers --headers-json '{"X-Debug":"1"}'
openclaw browser set credentials user pass            # --clear to remove
openclaw browser set geo 37.7749 -122.4194 --origin "https://example.com"
openclaw browser set media dark
openclaw browser set timezone America/New_York
openclaw browser set locale en-US
openclaw browser set device "iPhone 14"
```

</Accordion>

</AccordionGroup>

참고 사항:

- `upload`와 `dialog`는 **arming** 호출입니다; chooser/dialog를 트리거하는 click/press 전에 실행하십시오.
- `click`/`type`/등은 `snapshot`의 `ref`(숫자 `12` 또는 role ref `e12`)가 필요합니다. CSS selector는 액션에 대해 의도적으로 지원되지 않습니다.
- 다운로드, 트레이스, 업로드 경로는 OpenClaw 임시 루트로 제한됩니다: `/tmp/openclaw{,/downloads,/uploads}` (폴백: `${os.tmpdir()}/openclaw/...`).
- `upload`는 `--input-ref` 또는 `--element`를 통해 파일 입력을 직접 설정할 수도 있습니다.

스냅샷 플래그 한눈에 보기:

- `--format ai` (Playwright 기본값): 숫자 ref(`aria-ref="<n>"`)가 있는 AI 스냅샷.
- `--format aria`: 접근성 트리, ref 없음; 검사 전용.
- `--efficient` (또는 `--mode efficient`): 컴팩트 role 스냅샷 프리셋. 이것을 기본값으로 만들려면 `browser.snapshotDefaults.mode: "efficient"`를 설정하십시오([Gateway 구성](/gateway/configuration-reference#browser) 참조).
- `--interactive`, `--compact`, `--depth`, `--selector`는 `ref=e12` ref가 있는 role 스냅샷을 강제합니다. `--frame "<iframe>"`은 role 스냅샷을 iframe으로 범위 지정합니다.
- `--labels`는 ref 레이블이 오버레이된 뷰포트 전용 스크린샷을 추가합니다(`MEDIA:<path>`를 출력함).

## 스냅샷과 ref

OpenClaw는 두 가지 "스냅샷" 스타일을 지원합니다:

- **AI 스냅샷 (숫자 ref)**: `openclaw browser snapshot` (기본값; `--format ai`)
  - 출력: 숫자 ref가 포함된 텍스트 스냅샷.
  - 액션: `openclaw browser click 12`, `openclaw browser type 23 "hello"`.
  - 내부적으로, ref는 Playwright의 `aria-ref`를 통해 해결됩니다.

- **Role 스냅샷 (`e12` 같은 role ref)**: `openclaw browser snapshot --interactive` (또는 `--compact`, `--depth`, `--selector`, `--frame`)
  - 출력: `[ref=e12]`(및 선택적 `[nth=1]`)가 있는 role 기반 리스트/트리.
  - 액션: `openclaw browser click e12`, `openclaw browser highlight e12`.
  - 내부적으로, ref는 `getByRole(...)`(그리고 중복에 대한 `nth()`)을 통해 해결됩니다.
  - `--labels`를 추가하여 `e12` 레이블이 오버레이된 뷰포트 스크린샷을 포함하십시오.

Ref 동작:

- Ref는 **탐색 간 안정적이지 않습니다**; 무언가 실패하면 `snapshot`을 다시 실행하고 새 ref를 사용하십시오.
- role 스냅샷을 `--frame`으로 촬영한 경우, role ref는 다음 role 스냅샷까지 해당 iframe으로 범위가 지정됩니다.

## Wait 파워업

시간/텍스트 이상을 기다릴 수 있습니다:

- URL 대기 (Playwright가 지원하는 glob):
  - `openclaw browser wait --url "**/dash"`
- load 상태 대기:
  - `openclaw browser wait --load networkidle`
- JS 술어 대기:
  - `openclaw browser wait --fn "window.ready===true"`
- selector가 표시될 때까지 대기:
  - `openclaw browser wait "#main"`

이들을 결합할 수 있습니다:

```bash
openclaw browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
```

## 디버그 워크플로우

액션이 실패할 때(예: "not visible", "strict mode violation", "covered"):

1. `openclaw browser snapshot --interactive`
2. `click <ref>` / `type <ref>` 사용(대화형 모드에서는 role ref 선호)
3. 여전히 실패하면: `openclaw browser highlight <ref>`로 Playwright가 타게팅하는 것을 확인
4. 페이지가 이상하게 동작하면:
   - `openclaw browser errors --clear`
   - `openclaw browser requests --filter api --clear`
5. 심층 디버깅을 위해: 트레이스 기록:
   - `openclaw browser trace start`
   - 문제 재현
   - `openclaw browser trace stop` (`TRACE:<path>`를 출력함)

## JSON 출력

`--json`은 스크립팅 및 구조화된 도구용입니다.

예시:

```bash
openclaw browser status --json
openclaw browser snapshot --interactive --json
openclaw browser requests --filter api --json
openclaw browser cookies --json
```

JSON의 role 스냅샷은 `refs`와 함께 작은 `stats` 블록(lines/chars/refs/interactive)을 포함하므로, 도구가 페이로드 크기와 밀도에 대해 추론할 수 있습니다.

## 상태 및 환경 노브

이들은 "사이트를 X처럼 동작하게 만들기" 워크플로우에 유용합니다:

- Cookies: `cookies`, `cookies set`, `cookies clear`
- Storage: `storage local|session get|set|clear`
- Offline: `set offline on|off`
- Headers: `set headers --headers-json '{"X-Debug":"1"}'` (레거시 `set headers --json '{"X-Debug":"1"}'`도 계속 지원됨)
- HTTP basic auth: `set credentials user pass` (또는 `--clear`)
- Geolocation: `set geo <lat> <lon> --origin "https://example.com"` (또는 `--clear`)
- Media: `set media dark|light|no-preference|none`
- Timezone / locale: `set timezone ...`, `set locale ...`
- Device / viewport:
  - `set device "iPhone 14"` (Playwright 디바이스 프리셋)
  - `set viewport 1280 720`

## 보안 및 프라이버시

- openclaw 브라우저 프로필은 로그인된 세션을 포함할 수 있습니다; 민감한 것으로 취급하십시오.
- `browser act kind=evaluate` / `openclaw browser evaluate` 및 `wait --fn`은
  페이지 컨텍스트에서 임의의 JavaScript를 실행합니다. 프롬프트 주입이 이를 조종할 수
  있습니다. 필요하지 않으면 `browser.evaluateEnabled=false`로 비활성화하십시오.
- 로그인 및 anti-bot 참고 사항(X/Twitter 등)은 [Browser 로그인 + X/Twitter 포스팅](/tools/browser-login)을 참조하십시오.
- Gateway/노드 호스트를 비공개(루프백 또는 tailnet 전용)로 유지하십시오.
- 원격 CDP 엔드포인트는 강력합니다; 터널링하고 보호하십시오.

엄격 모드 예시(기본적으로 프라이빗/내부 대상 차단):

```json5
{
  browser: {
    ssrfPolicy: {
      dangerouslyAllowPrivateNetwork: false,
      hostnameAllowlist: ["*.example.com", "example.com"],
      allowedHostnames: ["localhost"], // optional exact allow
    },
  },
}
```

## 관련 항목

- [Browser](/tools/browser) — 개요, 구성, 프로필, 보안
- [Browser 로그인](/tools/browser-login) — 사이트에 로그인
- [Browser Linux 트러블슈팅](/tools/browser-linux-troubleshooting)
- [Browser WSL2 트러블슈팅](/tools/browser-wsl2-windows-remote-cdp-troubleshooting)
