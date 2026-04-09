---
summary: "Android 앱 (노드): 연결 런북 + Connect/Chat/Voice/Canvas 명령 표면"
read_when:
  - Android 노드 페어링 또는 재연결 시
  - Android 게이트웨이 검색 또는 인증 디버깅 시
  - 클라이언트 간 채팅 기록 일관성 확인 시
title: "Android 앱"
---

# Android 앱 (노드)

> **참고:** Android 앱은 아직 공개 배포되지 않았습니다. 소스 코드는 `apps/android` 경로 아래 [OpenClaw 저장소](https://github.com/openclaw/openclaw)에서 확인할 수 있습니다. Java 17과 Android SDK를 사용하여 직접 빌드할 수 있습니다 (`./gradlew :app:assemblePlayDebug`). 빌드 방법은 [apps/android/README.md](https://github.com/openclaw/openclaw/blob/main/apps/android/README.md)를 참조하십시오.

## 지원 스냅샷

- 역할: 동반 노드 앱 (Android는 게이트웨이를 호스팅하지 않음).
- 게이트웨이 필요 여부: 예 (macOS, Linux, 또는 WSL2를 통한 Windows에서 실행).
- 설치: [시작하기](/start/getting-started) + [페어링](/channels/pairing).
- 게이트웨이: [런북](/gateway) + [구성](/gateway/configuration).
  - 프로토콜: [게이트웨이 프로토콜](/gateway/protocol) (노드 + 제어 플레인).

## 시스템 제어

시스템 제어 (launchd/systemd)는 게이트웨이 호스트에 있습니다. [게이트웨이](/gateway)를 참조하십시오.

## 연결 런북

Android 노드 앱 ⇄ (mDNS/NSD + WebSocket) ⇄ **게이트웨이**

Android는 게이트웨이 WebSocket에 직접 연결하고 장치 페어링 (`role: node`)을 사용합니다.

Tailscale 또는 공용 호스트의 경우 Android에는 보안 엔드포인트가 필요합니다:

- 권장: Tailscale Serve / Funnel (`https://<magicdns>` / `wss://<magicdns>` 사용)
- 지원됨: 실제 TLS 엔드포인트가 있는 다른 `wss://` 게이트웨이 URL
- 평문 `ws://`는 개인 LAN 주소 / `.local` 호스트, 그리고 `localhost`, `127.0.0.1`, Android 에뮬레이터 브리지 (`10.0.2.2`)에서 계속 지원됩니다

### 사전 요구 사항

- "마스터" 머신에서 게이트웨이를 실행할 수 있습니다.
- Android 기기/에뮬레이터가 게이트웨이 WebSocket에 도달 가능해야 합니다:
  - mDNS/NSD를 사용하는 동일 LAN, **또는**
  - Wide-Area Bonjour / 유니캐스트 DNS-SD를 사용하는 동일 Tailscale tailnet (아래 참조), **또는**
  - 수동 게이트웨이 호스트/포트 (대체)
- Tailnet/공용 모바일 페어링은 원시 tailnet IP `ws://` 엔드포인트를 사용하지 **않습니다**. 대신 Tailscale Serve 또는 다른 `wss://` URL을 사용하십시오.
- 게이트웨이 머신에서 CLI (`openclaw`)를 실행할 수 있습니다 (또는 SSH를 통해).

### 1) 게이트웨이 시작

```bash
openclaw gateway --port 18789 --verbose
```

로그에서 다음과 같은 내용이 확인되어야 합니다:

- `listening on ws://0.0.0.0:18789`

Tailscale을 통한 원격 Android 접근의 경우, 원시 tailnet 바인드 대신 Serve/Funnel을 권장합니다:

```bash
openclaw gateway --tailscale serve
```

이를 통해 Android에 보안 `wss://` / `https://` 엔드포인트가 제공됩니다. 단순 `gateway.bind: "tailnet"` 설정만으로는 TLS를 별도로 종료하지 않는 한 처음 원격 Android 페어링에 충분하지 않습니다.

### 2) 검색 확인 (선택 사항)

게이트웨이 머신에서:

```bash
dns-sd -B _openclaw-gw._tcp local.
```

추가 디버깅 정보: [Bonjour](/gateway/bonjour).

광역 검색 도메인도 구성한 경우 다음과 비교하십시오:

```bash
openclaw gateway discover --json
```

이 명령은 한 번에 `local.`과 구성된 광역 도메인을 표시하고, TXT 전용 힌트 대신 확인된 서비스 엔드포인트를 사용합니다.

#### Tailnet (비엔나 ⇄ 런던) 유니캐스트 DNS-SD를 통한 검색

Android NSD/mDNS 검색은 네트워크를 가로질러 작동하지 않습니다. Android 노드와 게이트웨이가 서로 다른 네트워크에 있지만 Tailscale로 연결된 경우, Wide-Area Bonjour / 유니캐스트 DNS-SD를 사용하십시오.

검색만으로는 tailnet/공용 Android 페어링에 충분하지 않습니다. 검색된 경로에는 여전히 보안 엔드포인트 (`wss://` 또는 Tailscale Serve)가 필요합니다:

1. 게이트웨이 호스트에 DNS-SD 구역 (예: `openclaw.internal.`)을 설정하고 `_openclaw-gw._tcp` 레코드를 게시합니다.
2. 해당 DNS 서버를 가리키는 선택한 도메인에 대한 Tailscale split DNS를 구성합니다.

세부 사항 및 CoreDNS 구성 예시: [Bonjour](/gateway/bonjour).

### 3) Android에서 연결

Android 앱에서:

- 앱은 **전경 서비스** (지속 알림)를 통해 게이트웨이 연결을 유지합니다.
- **Connect** 탭을 엽니다.
- **Setup Code** 또는 **Manual** 모드를 사용합니다.
- 검색이 차단된 경우 **Advanced controls**에서 수동 호스트/포트를 사용합니다. 개인 LAN 호스트의 경우 `ws://`가 여전히 작동합니다. Tailscale/공용 호스트의 경우 TLS를 켜고 `wss://` / Tailscale Serve 엔드포인트를 사용하십시오.

첫 번째 페어링 성공 후 Android는 시작 시 자동으로 재연결됩니다:

- 수동 엔드포인트 (활성화된 경우), 그렇지 않으면
- 마지막으로 검색된 게이트웨이 (최선 노력).

### 4) 페어링 승인 (CLI)

게이트웨이 머신에서:

```bash
openclaw devices list
openclaw devices approve <requestId>
openclaw devices reject <requestId>
```

페어링 세부 사항: [페어링](/channels/pairing).

### 5) 노드 연결 확인

- 노드 상태를 통해:

  ```bash
  openclaw nodes status
  ```

- 게이트웨이를 통해:

  ```bash
  openclaw gateway call node.list --params "{}"
  ```

### 6) 채팅 + 기록

Android 채팅 탭은 세션 선택을 지원합니다 (기본값 `main`, 그 외 기존 세션):

- 기록: `chat.history` (표시 정규화; 인라인 지시어 태그는 표시 텍스트에서 제거되고, 일반 텍스트 도구 호출 XML 페이로드 (`<tool_call>...</tool_call>`, `<function_call>...</function_call>`, `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>` 포함) 및 잘린 도구 호출 블록과 누출된 ASCII/전각 모델 제어 토큰은 제거되며, 정확히 `NO_REPLY` / `no_reply`인 순수 무음 토큰 어시스턴트 행은 생략되고, 크기가 큰 행은 플레이스홀더로 교체될 수 있음)
- 전송: `chat.send`
- 푸시 업데이트 (최선 노력): `chat.subscribe` → `event:"chat"`

### 7) Canvas + 카메라

#### 게이트웨이 Canvas 호스트 (웹 콘텐츠에 권장)

노드에 에이전트가 디스크에서 편집할 수 있는 실제 HTML/CSS/JS를 표시하려면 노드를 게이트웨이 canvas 호스트로 지정하십시오.

참고: 노드는 게이트웨이 HTTP 서버에서 canvas를 로드합니다 (`gateway.port`와 동일한 포트, 기본값 `18789`).

1. 게이트웨이 호스트에 `~/.openclaw/workspace/canvas/index.html`을 만듭니다.

2. 노드를 탐색합니다 (LAN):

```bash
openclaw nodes invoke --node "<Android Node>" --command canvas.navigate --params '{"url":"http://<gateway-hostname>.local:18789/__openclaw__/canvas/"}'
```

Tailnet (선택 사항): 두 장치가 모두 Tailscale에 있는 경우, `.local` 대신 MagicDNS 이름 또는 tailnet IP를 사용하십시오 (예: `http://<gateway-magicdns>:18789/__openclaw__/canvas/`).

이 서버는 HTML에 라이브 리로드 클라이언트를 삽입하고 파일 변경 시 리로드합니다.
A2UI 호스트는 `http://<gateway-host>:18789/__openclaw__/a2ui/`에 있습니다.

Canvas 명령 (전경에서만):

- `canvas.eval`, `canvas.snapshot`, `canvas.navigate` (`{"url":""}` 또는 `{"url":"/"}` 사용으로 기본 스캐폴드로 돌아감). `canvas.snapshot`은 `{ format, base64 }`를 반환합니다 (기본값 `format="jpeg"`).
- A2UI: `canvas.a2ui.push`, `canvas.a2ui.reset` (`canvas.a2ui.pushJSONL` 레거시 별칭)

카메라 명령 (전경에서만; 권한 필요):

- `camera.snap` (jpg)
- `camera.clip` (mp4)

매개변수 및 CLI 도우미는 [카메라 노드](/nodes/camera)를 참조하십시오.

### 8) 음성 + 확장된 Android 명령 표면

- 음성: Android는 Voice 탭에서 단일 마이크 켜기/끄기 흐름을 사용하며 전사 캡처 및 `talk.speak` 재생을 지원합니다. `talk.speak`를 사용할 수 없는 경우에만 로컬 시스템 TTS가 사용됩니다. 앱이 전경에서 벗어나면 음성이 중지됩니다.
- 음성 wake/talk-mode 토글은 현재 Android UX/런타임에서 제거되었습니다.
- 추가 Android 명령 패밀리 (기기 + 권한에 따라 가용성이 다름):
  - `device.status`, `device.info`, `device.permissions`, `device.health`
  - `notifications.list`, `notifications.actions` (아래 [알림 전달](#알림-전달) 참조)
  - `photos.latest`
  - `contacts.search`, `contacts.add`
  - `calendar.events`, `calendar.add`
  - `callLog.search`
  - `sms.search`
  - `motion.activity`, `motion.pedometer`

## 어시스턴트 진입점

Android는 시스템 어시스턴트 트리거 (Google Assistant)에서 OpenClaw를 시작하는 것을 지원합니다. 구성이 완료되면 홈 버튼을 길게 누르거나 "Hey Google, OpenClaw에게 물어봐..."라고 말하면 앱이 열리고 프롬프트가 채팅 작성기로 전달됩니다.

이 기능은 앱 매니페스트에 선언된 Android **App Actions** 메타데이터를 사용합니다. 게이트웨이 측에서 추가 구성이 필요하지 않습니다. 어시스턴트 인텐트는 Android 앱에서 완전히 처리되어 일반 채팅 메시지로 전달됩니다.

<Note>
App Actions 가용성은 기기, Google Play Services 버전, 그리고 사용자가 OpenClaw를 기본 어시스턴트 앱으로 설정했는지 여부에 따라 다릅니다.
</Note>

## 알림 전달

Android는 장치 알림을 이벤트로 게이트웨이에 전달할 수 있습니다. 여러 제어를 통해 어떤 알림이 언제 전달되는지 범위를 지정할 수 있습니다.

| 키                               | 유형           | 설명                                                                                       |
| -------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `notifications.allowPackages`    | string[]       | 이 패키지 이름의 알림만 전달합니다. 설정된 경우 다른 모든 패키지는 무시됩니다.              |
| `notifications.denyPackages`     | string[]       | 이 패키지 이름의 알림은 절대 전달하지 않습니다. `allowPackages` 이후에 적용됩니다.          |
| `notifications.quietHours.start` | string (HH:mm) | 방해 금지 시간 시작 (로컬 기기 시간). 이 시간 동안 알림이 억제됩니다.                       |
| `notifications.quietHours.end`   | string (HH:mm) | 방해 금지 시간 종료.                                                                        |
| `notifications.rateLimit`        | number         | 패키지당 분당 최대 전달 알림 수. 초과 알림은 삭제됩니다.                                     |

알림 선택기는 또한 전달된 알림 이벤트에 대해 더 안전한 동작을 사용하여 민감한 시스템 알림의 우발적인 전달을 방지합니다.

구성 예시:

```json5
{
  notifications: {
    allowPackages: ["com.slack", "com.whatsapp"],
    denyPackages: ["com.android.systemui"],
    quietHours: {
      start: "22:00",
      end: "07:00",
    },
    rateLimit: 5,
  },
}
```

<Note>
알림 전달을 사용하려면 Android 알림 리스너 권한이 필요합니다. 앱은 설정 중에 이 권한을 요청합니다.
</Note>
