---
summary: "Google Meet 플러그인: Chrome 또는 Twilio를 통해 명시적인 Meet URL에 참여하며 실시간 음성을 기본값으로 사용"
read_when:
  - OpenClaw 에이전트가 Google Meet 통화에 참여하게 하고 싶을 때
  - Chrome, Chrome 노드, 또는 Twilio를 Google Meet 전송으로 구성할 때
title: "Google Meet 플러그인"
---

# Google Meet (플러그인)

OpenClaw를 위한 Google Meet 참가자 지원.

이 플러그인은 설계상 명시적입니다:

- 오직 명시적인 `https://meet.google.com/...` URL에만 참여합니다.
- `realtime` 음성이 기본 모드입니다.
- 더 깊은 추론이나 도구가 필요할 때 실시간 음성은 전체
  OpenClaw 에이전트로 콜백할 수 있습니다.
- 인증은 개인 Google OAuth 또는 이미 로그인된 Chrome 프로파일로 시작합니다.
- 자동 동의 안내는 없습니다.
- 기본 Chrome 오디오 백엔드는 `BlackHole 2ch`입니다.
- Chrome은 로컬에서 실행하거나 페어링된 노드 호스트에서 실행할 수 있습니다.
- Twilio는 dial-in 번호와 선택적 PIN 또는 DTMF 시퀀스를 허용합니다.
- CLI 명령어는 `googlemeet`이며, `meet`은 더 광범위한 에이전트
  원격 회의 워크플로우를 위해 예약되어 있습니다.

## 빠른 시작

로컬 오디오 의존성을 설치하고 실시간 프로바이더가 OpenAI를 사용할 수
있는지 확인하십시오:

```bash
brew install blackhole-2ch sox
export OPENAI_API_KEY=sk-...
```

`blackhole-2ch`는 `BlackHole 2ch` 가상 오디오 디바이스를 설치합니다. Homebrew의
설치 프로그램은 macOS가 디바이스를 노출하기 전에 재부팅이 필요합니다:

```bash
sudo reboot
```

재부팅 후 두 가지 모두 확인하십시오:

```bash
system_profiler SPAudioDataType | grep -i BlackHole
command -v rec play
```

플러그인을 활성화하십시오:

```json5
{
  plugins: {
    entries: {
      "google-meet": {
        enabled: true,
        config: {},
      },
    },
  },
}
```

설정을 확인하십시오:

```bash
openclaw googlemeet setup
```

회의에 참여하십시오:

```bash
openclaw googlemeet join https://meet.google.com/abc-defg-hij
```

또는 에이전트가 `google_meet` 도구를 통해 참여하게 하십시오:

```json
{
  "action": "join",
  "url": "https://meet.google.com/abc-defg-hij"
}
```

Chrome은 로그인된 Chrome 프로파일로 참여합니다. Meet에서 OpenClaw가 사용할
마이크/스피커 경로로 `BlackHole 2ch`를 선택하십시오. 깨끗한 양방향 오디오를 위해서는
별도의 가상 디바이스나 Loopback 스타일 그래프를 사용하십시오; 단일 BlackHole 디바이스는
첫 스모크 테스트에는 충분하지만 에코가 발생할 수 있습니다.

### 로컬 Gateway + Parallels Chrome

macOS VM이 Chrome을 소유하게 만들기 위해 VM 안에 전체 OpenClaw Gateway나
모델 API 키가 **필요하지 않습니다**. Gateway와 에이전트는 로컬에서 실행하고
VM에서 노드 호스트를 실행하십시오. VM에서 번들 플러그인을 한 번 활성화하여
노드가 Chrome 명령을 광고하도록 하십시오:

어디서 무엇이 실행되는지:

- Gateway 호스트: OpenClaw Gateway, 에이전트 워크스페이스, 모델/API 키, 실시간
  프로바이더, 그리고 Google Meet 플러그인 구성.
- Parallels macOS VM: OpenClaw CLI/노드 호스트, Google Chrome, SoX, BlackHole 2ch,
  그리고 Google에 로그인된 Chrome 프로파일.
- VM에 필요하지 않음: Gateway 서비스, 에이전트 구성, OpenAI/GPT 키, 또는 모델
  프로바이더 설정.

VM 의존성을 설치하십시오:

```bash
brew install blackhole-2ch sox
```

macOS가 `BlackHole 2ch`를 노출하도록 BlackHole을 설치한 후 VM을 재부팅하십시오:

```bash
sudo reboot
```

재부팅 후 VM이 오디오 디바이스와 SoX 명령을 볼 수 있는지 확인하십시오:

```bash
system_profiler SPAudioDataType | grep -i BlackHole
command -v rec play
```

VM에 OpenClaw를 설치하거나 업데이트한 다음 거기서 번들 플러그인을 활성화하십시오:

```bash
openclaw plugins enable google-meet
```

VM에서 노드 호스트를 시작하십시오:

```bash
openclaw node run --host <gateway-host> --port 18789 --display-name parallels-macos
```

`<gateway-host>`가 LAN IP이고 TLS를 사용하지 않는다면, 해당 신뢰된 프라이빗
네트워크에 대해 옵트인하지 않는 한 노드는 평문 WebSocket을 거부합니다:

```bash
OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1 \
  openclaw node run --host <gateway-lan-ip> --port 18789 --display-name parallels-macos
```

노드를 LaunchAgent로 설치할 때 동일한 환경 변수를 사용하십시오:

```bash
OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1 \
  openclaw node install --host <gateway-lan-ip> --port 18789 --display-name parallels-macos --force
openclaw node restart
```

Gateway 호스트에서 노드를 승인하십시오:

```bash
openclaw devices list
openclaw devices approve <requestId>
```

Gateway가 노드를 보고 있는지, 그리고 `googlemeet.chrome`을 광고하는지 확인하십시오:

```bash
openclaw nodes status
```

Gateway 호스트에서 해당 노드를 통해 Meet를 라우팅하십시오:

```json5
{
  gateway: {
    nodes: {
      allowCommands: ["googlemeet.chrome"],
    },
  },
  plugins: {
    entries: {
      "google-meet": {
        enabled: true,
        config: {
          defaultTransport: "chrome-node",
          chromeNode: {
            node: "parallels-macos",
          },
        },
      },
    },
  },
}
```

이제 Gateway 호스트에서 정상적으로 참여하십시오:

```bash
openclaw googlemeet join https://meet.google.com/abc-defg-hij
```

또는 에이전트에게 `transport: "chrome-node"`로 `google_meet` 도구를 사용하도록 요청하십시오.

`chromeNode.node`가 생략된 경우, `googlemeet.chrome`을 광고하는 연결된 노드가
정확히 하나일 때만 OpenClaw가 자동 선택합니다. 여러 개의 가능한 노드가
연결되어 있다면 `chromeNode.node`를 노드 id, 표시 이름, 또는 원격 IP로 설정하십시오.

일반적인 실패 점검 사항:

- `No connected Google Meet-capable node`: VM에서 `openclaw node run`을 시작하고,
  페어링을 승인하며, VM에서 `openclaw plugins enable google-meet`이 실행되었는지
  확인하십시오. 또한 Gateway 호스트가 `gateway.nodes.allowCommands: ["googlemeet.chrome"]`으로
  노드 명령을 허용하는지 확인하십시오.
- `BlackHole 2ch audio device not found on the node`: VM에 `blackhole-2ch`를
  설치하고 VM을 재부팅하십시오.
- Chrome은 열리지만 참여할 수 없음: VM 내부에서 Chrome에 로그인하고 해당 프로파일이
  수동으로 Meet URL에 참여할 수 있는지 확인하십시오.
- 오디오 없음: Meet에서 마이크/스피커를 OpenClaw가 사용하는 가상 오디오 디바이스
  경로로 라우팅하십시오; 깨끗한 양방향 오디오를 위해 별도의 가상 디바이스나
  Loopback 스타일 라우팅을 사용하십시오.

## 설치 참고 사항

Chrome 실시간 기본값은 두 개의 외부 도구를 사용합니다:

- `sox`: 명령줄 오디오 유틸리티. 플러그인은 기본 8 kHz G.711 mu-law 오디오
  브리지를 위해 `rec` 및 `play` 명령을 사용합니다.
- `blackhole-2ch`: macOS 가상 오디오 드라이버. Chrome/Meet가 라우팅할 수 있는
  `BlackHole 2ch` 오디오 디바이스를 생성합니다.

OpenClaw는 두 패키지 중 어느 것도 번들하거나 재배포하지 않습니다. 문서는 사용자들에게
Homebrew를 통해 호스트 의존성으로 설치하도록 요청합니다. SoX는
`LGPL-2.0-only AND GPL-2.0-only`로 라이선스되어 있습니다; BlackHole은 GPL-3.0입니다.
OpenClaw와 함께 BlackHole을 번들하는 설치 프로그램이나 어플라이언스를 빌드하는 경우,
BlackHole의 업스트림 라이선스 조건을 검토하거나 Existential Audio에서
별도의 라이선스를 받으십시오.

## 전송 (Transports)

### Chrome

Chrome 전송은 Google Chrome에서 Meet URL을 열고 로그인된 Chrome 프로파일로
참여합니다. macOS에서 플러그인은 실행 전에 `BlackHole 2ch`를 확인합니다.
구성된 경우, Chrome을 열기 전에 오디오 브리지 헬스 명령 및 시작 명령도
실행합니다. Chrome/오디오가 Gateway 호스트에 있을 때는 `chrome`을 사용하고,
Parallels macOS VM과 같은 페어링된 노드에 Chrome/오디오가 있을 때는
`chrome-node`를 사용하십시오.

```bash
openclaw googlemeet join https://meet.google.com/abc-defg-hij --transport chrome
openclaw googlemeet join https://meet.google.com/abc-defg-hij --transport chrome-node
```

Chrome의 마이크 및 스피커 오디오를 로컬 OpenClaw 오디오 브리지를 통해 라우팅합니다.
`BlackHole 2ch`가 설치되어 있지 않으면, 오디오 경로 없이 조용히 참여하는 대신
설정 오류로 참여가 실패합니다.

### Twilio

Twilio 전송은 Voice Call 플러그인에 위임된 엄격한 dial 플랜입니다. Meet
페이지에서 전화번호를 파싱하지 않습니다.

```bash
openclaw googlemeet join https://meet.google.com/abc-defg-hij \
  --transport twilio \
  --dial-in-number +15551234567 \
  --pin 123456
```

회의에 커스텀 시퀀스가 필요한 경우 `--dtmf-sequence`를 사용하십시오:

```bash
openclaw googlemeet join https://meet.google.com/abc-defg-hij \
  --transport twilio \
  --dial-in-number +15551234567 \
  --dtmf-sequence ww123456#
```

## OAuth 및 preflight

Google Meet Media API 접근은 먼저 개인 OAuth 클라이언트를 사용합니다.
`oauth.clientId`와 선택적으로 `oauth.clientSecret`을 구성한 다음 실행하십시오:

```bash
openclaw googlemeet auth login --json
```

이 명령은 refresh 토큰이 포함된 `oauth` 구성 블록을 출력합니다. PKCE,
`http://localhost:8085/oauth2callback`의 localhost 콜백, 그리고 `--manual`을 사용한
수동 복사/붙여넣기 흐름을 사용합니다.

다음 환경 변수들이 폴백으로 허용됩니다:

- `OPENCLAW_GOOGLE_MEET_CLIENT_ID` 또는 `GOOGLE_MEET_CLIENT_ID`
- `OPENCLAW_GOOGLE_MEET_CLIENT_SECRET` 또는 `GOOGLE_MEET_CLIENT_SECRET`
- `OPENCLAW_GOOGLE_MEET_REFRESH_TOKEN` 또는 `GOOGLE_MEET_REFRESH_TOKEN`
- `OPENCLAW_GOOGLE_MEET_ACCESS_TOKEN` 또는 `GOOGLE_MEET_ACCESS_TOKEN`
- `OPENCLAW_GOOGLE_MEET_ACCESS_TOKEN_EXPIRES_AT` 또는
  `GOOGLE_MEET_ACCESS_TOKEN_EXPIRES_AT`
- `OPENCLAW_GOOGLE_MEET_DEFAULT_MEETING` 또는 `GOOGLE_MEET_DEFAULT_MEETING`
- `OPENCLAW_GOOGLE_MEET_PREVIEW_ACK` 또는 `GOOGLE_MEET_PREVIEW_ACK`

`spaces.get`을 통해 Meet URL, 코드, 또는 `spaces/{id}`를 해석하십시오:

```bash
openclaw googlemeet resolve-space --meeting https://meet.google.com/abc-defg-hij
```

미디어 작업 전에 preflight를 실행하십시오:

```bash
openclaw googlemeet preflight --meeting https://meet.google.com/abc-defg-hij
```

Cloud 프로젝트, OAuth principal, 그리고 회의 참가자가 Meet 미디어 API를 위한
Google Workspace Developer Preview Program에 등록되어 있음을 확인한 후에만
`preview.enrollmentAcknowledged: true`를 설정하십시오.

## 구성

일반적인 Chrome 실시간 경로에는 플러그인 활성화, BlackHole, SoX, 그리고
OpenAI 키만 있으면 됩니다:

```bash
brew install blackhole-2ch sox
export OPENAI_API_KEY=sk-...
```

`plugins.entries.google-meet.config` 아래에 플러그인 구성을 설정하십시오:

```json5
{
  plugins: {
    entries: {
      "google-meet": {
        enabled: true,
        config: {},
      },
    },
  },
}
```

기본값:

- `defaultTransport: "chrome"`
- `defaultMode: "realtime"`
- `chromeNode.node`: `chrome-node`용 선택적 노드 id/이름/IP
- `chrome.audioBackend: "blackhole-2ch"`
- `chrome.audioInputCommand`: 8 kHz G.711 mu-law 오디오를 stdout에 쓰는
  SoX `rec` 명령
- `chrome.audioOutputCommand`: stdin에서 8 kHz G.711 mu-law 오디오를 읽는
  SoX `play` 명령
- `realtime.provider: "openai"`
- `realtime.toolPolicy: "safe-read-only"`
- `realtime.instructions`: 간결한 음성 응답, 더 깊은 답변을 위해
  `openclaw_agent_consult` 사용

선택적 재정의:

```json5
{
  defaults: {
    meeting: "https://meet.google.com/abc-defg-hij",
  },
  chrome: {
    browserProfile: "Default",
  },
  chromeNode: {
    node: "parallels-macos",
  },
  realtime: {
    toolPolicy: "owner",
  },
}
```

Twilio 전용 구성:

```json5
{
  defaultTransport: "twilio",
  twilio: {
    defaultDialInNumber: "+15551234567",
    defaultPin: "123456",
  },
  voiceCall: {
    gatewayUrl: "ws://127.0.0.1:18789",
  },
}
```

## 도구

에이전트는 `google_meet` 도구를 사용할 수 있습니다:

```json
{
  "action": "join",
  "url": "https://meet.google.com/abc-defg-hij",
  "transport": "chrome-node",
  "mode": "realtime"
}
```

Chrome이 Gateway 호스트에서 실행될 때는 `transport: "chrome"`을 사용하십시오.
Chrome이 Parallels VM과 같은 페어링된 노드에서 실행될 때는
`transport: "chrome-node"`를 사용하십시오. 두 경우 모두 실시간 모델과
`openclaw_agent_consult`는 Gateway 호스트에서 실행되므로 모델 자격 증명은
거기에 유지됩니다.

활성 세션을 나열하거나 세션 ID를 검사하려면 `action: "status"`를 사용하십시오.
세션을 종료됨으로 표시하려면 `action: "leave"`를 사용하십시오.

## 실시간 에이전트 consult

Chrome 실시간 모드는 라이브 음성 루프에 최적화되어 있습니다. 실시간 음성
프로바이더는 회의 오디오를 듣고 구성된 오디오 브리지를 통해 말합니다.
실시간 모델이 더 깊은 추론, 최신 정보, 또는 일반 OpenClaw 도구가 필요할 때
`openclaw_agent_consult`를 호출할 수 있습니다.

consult 도구는 최근 회의 transcript 컨텍스트와 함께 뒤에서 일반 OpenClaw
에이전트를 실행하고 실시간 음성 세션에 간결한 음성 답변을 반환합니다.
그러면 음성 모델이 그 답변을 회의로 다시 말할 수 있습니다.

`realtime.toolPolicy`가 consult 실행을 제어합니다:

- `safe-read-only`: consult 도구를 노출하고 일반 에이전트를 `read`,
  `web_search`, `web_fetch`, `x_search`, `memory_search`, `memory_get`으로
  제한합니다.
- `owner`: consult 도구를 노출하고 일반 에이전트가 일반 에이전트 도구 정책을
  사용하도록 허용합니다.
- `none`: 실시간 음성 모델에 consult 도구를 노출하지 않습니다.

consult 세션 키는 Meet 세션별로 범위가 지정되므로, 후속 consult 호출은
동일한 회의 중에 이전 consult 컨텍스트를 재사용할 수 있습니다.

## 참고 사항

Google Meet의 공식 미디어 API는 수신 지향적이므로, Meet 통화에 말하려면
여전히 참가자 경로가 필요합니다. 이 플러그인은 해당 경계를 가시적으로
유지합니다: Chrome이 브라우저 참여 및 로컬 오디오 라우팅을 처리하고;
Twilio가 전화 dial-in 참여를 처리합니다.

Chrome 실시간 모드에는 다음 중 하나가 필요합니다:

- `chrome.audioInputCommand`와 `chrome.audioOutputCommand`: OpenClaw가 실시간
  모델 브리지를 소유하고 해당 명령들과 선택된 실시간 음성 프로바이더 사이에서
  8 kHz G.711 mu-law 오디오를 파이핑합니다.
- `chrome.audioBridgeCommand`: 외부 브리지 명령이 전체 로컬 오디오 경로를
  소유하며, 데몬을 시작하거나 검증한 후 종료해야 합니다.

깨끗한 양방향 오디오를 위해 Meet 출력과 Meet 마이크를 별도의 가상 디바이스나
Loopback 스타일 가상 디바이스 그래프를 통해 라우팅하십시오. 단일 공유
BlackHole 디바이스는 다른 참가자를 통화로 다시 에코할 수 있습니다.

`googlemeet leave`는 Chrome 세션의 명령-쌍 실시간 오디오 브리지를 중지합니다.
Voice Call 플러그인을 통해 위임된 Twilio 세션의 경우, 기본 음성 통화도
종료(hang up)합니다.

## 관련 자료

- [Voice call 플러그인](/plugins/voice-call)
- [Talk 모드](/nodes/talk)
- [플러그인 구축](/plugins/building-plugins)
