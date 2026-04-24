---
summary: "Google Chat 앱 지원 상태, 기능 및 구성"
read_when:
  - Google Chat 채널 기능 작업 시
title: "Google Chat"
---

상태: Google Chat API 웹훅을 통한 DM + space에서 사용 가능 (HTTP 전용).

## 빠른 설정 (초보자용)

1. Google Cloud 프로젝트를 생성하고 **Google Chat API**를 활성화합니다.
   - 이동: [Google Chat API 자격 증명](https://console.cloud.google.com/apis/api/chat.googleapis.com/credentials)
   - API가 아직 활성화되지 않았다면 활성화합니다.
2. **서비스 계정(Service Account)**을 생성합니다:
   - **자격 증명 만들기(Create Credentials)** > **서비스 계정(Service Account)**을 누릅니다.
   - 원하는 이름을 지정합니다 (예: `openclaw-chat`).
   - 권한은 비워둡니다 (**계속(Continue)** 클릭).
   - 액세스 권한이 있는 주체는 비워둡니다 (**완료(Done)** 클릭).
3. **JSON 키**를 생성하고 다운로드합니다:
   - 서비스 계정 목록에서 방금 생성한 계정을 클릭합니다.
   - **키(Keys)** 탭으로 이동합니다.
   - **키 추가(Add Key)** > **새 키 만들기(Create new key)**를 클릭합니다.
   - **JSON**을 선택하고 **만들기(Create)**를 누릅니다.
4. 다운로드된 JSON 파일을 게이트웨이 호스트에 저장합니다 (예: `~/.openclaw/googlechat-service-account.json`).
5. [Google Cloud Console Chat 구성](https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat)에서 Google Chat 앱을 생성합니다:
   - **애플리케이션 정보(Application info)** 작성:
     - **앱 이름(App name)**: (예: `OpenClaw`)
     - **아바타 URL(Avatar URL)**: (예: `https://openclaw.ai/logo.png`)
     - **설명(Description)**: (예: `Personal AI Assistant`)
   - **인터랙티브 기능(Interactive features)**을 활성화합니다.
   - **기능(Functionality)** 아래에서 **space 및 그룹 대화 참여(Join spaces and group conversations)**를 체크합니다.
   - **연결 설정(Connection settings)** 아래에서 **HTTP 엔드포인트 URL(HTTP endpoint URL)**을 선택합니다.
   - **트리거(Triggers)** 아래에서 **모든 트리거에 공통 HTTP 엔드포인트 URL 사용(Use a common HTTP endpoint URL for all triggers)**을 선택하고, 게이트웨이의 공개 URL 뒤에 `/googlechat`을 붙여 설정합니다.
     - _팁: `openclaw status`를 실행하면 게이트웨이의 공개 URL을 찾을 수 있습니다._
   - **공개 범위(Visibility)** 아래에서 **`<도메인>` 내의 특정 사람 및 그룹에게만 이 Chat 앱 제공(Make this Chat app available to specific people and groups in `<Your Domain>`)**을 체크합니다.
   - 텍스트 상자에 이메일 주소를 입력합니다 (예: `user@example.com`).
   - 하단의 **저장(Save)**을 클릭합니다.
6. **앱 상태 활성화**:
   - 저장 후 **페이지를 새로고침**합니다.
   - **앱 상태(App status)** 섹션을 찾습니다 (저장 후 주로 상단 또는 하단 근처에 표시).
   - 상태를 **라이브 - 사용자에게 제공(Live - available to users)**으로 변경합니다.
   - **저장(Save)**을 다시 클릭합니다.
7. 서비스 계정 경로 + 웹훅 audience와 함께 OpenClaw를 구성합니다:
   - 환경 변수: `GOOGLE_CHAT_SERVICE_ACCOUNT_FILE=/path/to/service-account.json`
   - 또는 설정: `channels.googlechat.serviceAccountFile: "/path/to/service-account.json"`.
8. 웹훅 audience 유형 + 값을 설정합니다 (Chat 앱 구성과 일치해야 함).
9. 게이트웨이를 시작합니다. Google Chat은 웹훅 경로로 POST 요청을 보냅니다.

## Google Chat에 추가

게이트웨이가 실행 중이고 공개 범위 목록에 이메일이 추가되면:

1. [Google Chat](https://chat.google.com/)으로 이동합니다.
2. **Direct Messages(다이렉트 메시지)** 옆의 **+** (플러스) 아이콘을 클릭합니다.
3. 검색창(일반적으로 사람을 추가하는 곳)에 Google Cloud Console에서 구성한 **앱 이름(App name)**을 입력합니다.
   - **참고**: 이 봇은 비공개 앱이므로 "Marketplace" 탐색 목록에는 _나타나지 않습니다_. 이름으로 검색해야 합니다.
4. 결과에서 봇을 선택합니다.
5. **추가(Add)** 또는 **채팅(Chat)**을 클릭하여 1:1 대화를 시작합니다.
6. "Hello"를 보내 어시스턴트를 트리거합니다!

## 공개 URL (웹훅 전용)

Google Chat 웹훅은 공개 HTTPS 엔드포인트가 필요합니다. 보안을 위해 **`/googlechat` 경로만 인터넷에 노출**하십시오. OpenClaw 대시보드 및 기타 민감한 엔드포인트는 프라이빗 네트워크에 유지합니다.

### 옵션 A: Tailscale Funnel (권장)

프라이빗 대시보드는 Tailscale Serve로, 공개 웹훅 경로는 Funnel로 노출합니다. 이렇게 하면 `/`는 비공개로 유지하면서 `/googlechat`만 노출할 수 있습니다.

1. **게이트웨이가 바인딩된 주소를 확인합니다:**

   ```bash
   ss -tlnp | grep 18789
   ```

   IP 주소를 기록합니다 (예: `127.0.0.1`, `0.0.0.0`, 또는 `100.x.x.x`와 같은 Tailscale IP).

2. **대시보드를 tailnet에만 노출합니다 (포트 8443):**

   ```bash
   # localhost에 바인딩된 경우 (127.0.0.1 또는 0.0.0.0):
   tailscale serve --bg --https 8443 http://127.0.0.1:18789

   # Tailscale IP에만 바인딩된 경우 (예: 100.106.161.80):
   tailscale serve --bg --https 8443 http://100.106.161.80:18789
   ```

3. **웹훅 경로만 공개적으로 노출합니다:**

   ```bash
   # localhost에 바인딩된 경우 (127.0.0.1 또는 0.0.0.0):
   tailscale funnel --bg --set-path /googlechat http://127.0.0.1:18789/googlechat

   # Tailscale IP에만 바인딩된 경우 (예: 100.106.161.80):
   tailscale funnel --bg --set-path /googlechat http://100.106.161.80:18789/googlechat
   ```

4. **Funnel 접근을 위해 노드를 승인합니다:**
   프롬프트가 표시되면 출력에 표시된 승인 URL을 방문하여 tailnet 정책에서 이 노드의 Funnel을 활성화합니다.

5. **구성을 확인합니다:**

   ```bash
   tailscale serve status
   tailscale funnel status
   ```

공개 웹훅 URL은 다음과 같습니다:
`https://<node-name>.<tailnet>.ts.net/googlechat`

프라이빗 대시보드는 tailnet 전용으로 유지됩니다:
`https://<node-name>.<tailnet>.ts.net:8443/`

Google Chat 앱 구성에는 공개 URL(`:8443` 없이)을 사용하세요.

> 참고: 이 구성은 재부팅 후에도 유지됩니다. 나중에 제거하려면 `tailscale funnel reset` 및 `tailscale serve reset`을 실행합니다.

### 옵션 B: 리버스 프록시 (Caddy)

Caddy와 같은 리버스 프록시를 사용하는 경우 특정 경로만 프록시합니다:

```caddy
your-domain.com {
    reverse_proxy /googlechat* localhost:18789
}
```

이 설정으로 `your-domain.com/`에 대한 모든 요청은 무시되거나 404로 반환되며, `your-domain.com/googlechat`은 안전하게 OpenClaw로 라우팅됩니다.

### 옵션 C: Cloudflare Tunnel

웹훅 경로만 라우팅하도록 터널의 ingress 규칙을 구성합니다:

- **경로**: `/googlechat` -> `http://localhost:18789/googlechat`
- **기본 규칙**: HTTP 404 (Not Found)

## 작동 방식

1. Google Chat은 게이트웨이로 웹훅 POST를 보냅니다. 각 요청에는 `Authorization: Bearer <token>` 헤더가 포함됩니다.
   - OpenClaw는 헤더가 있는 경우 전체 웹훅 본문을 읽고 파싱하기 전에 bearer 인증을 검증합니다.
   - 본문에 `authorizationEventObject.systemIdToken`을 포함하는 Google Workspace Add-on 요청은 더 엄격한 사전 인증 본문 예산으로 지원됩니다.
2. OpenClaw는 구성된 `audienceType` + `audience`에 대해 토큰을 검증합니다:
   - `audienceType: "app-url"` → audience는 HTTPS 웹훅 URL입니다.
   - `audienceType: "project-number"` → audience는 Cloud 프로젝트 번호입니다.
3. 메시지는 space별로 라우팅됩니다:
   - DM은 세션 키 `agent:<agentId>:googlechat:direct:<spaceId>`를 사용합니다.
   - Space는 세션 키 `agent:<agentId>:googlechat:group:<spaceId>`를 사용합니다.
4. DM 접근은 기본적으로 페어링 방식입니다. 알 수 없는 발신자는 페어링 코드를 받으며, 다음 명령으로 승인합니다:
   - `openclaw pairing approve googlechat <code>`
5. 그룹 space는 기본적으로 @-멘션이 필요합니다. 멘션 감지에 앱의 사용자 이름이 필요한 경우 `botUser`를 사용합니다.

## 타겟

전달 및 허용 목록에는 다음 식별자를 사용합니다:

- 다이렉트 메시지: `users/<userId>` (권장).
- 원시 이메일 `name@example.com`은 가변적이며, `channels.googlechat.dangerouslyAllowNameMatching: true`일 때만 직접 허용 목록 매칭에 사용됩니다.
- 사용 중단됨: `users/<email>`은 이메일 허용 목록이 아닌 사용자 ID로 취급됩니다.
- Space: `spaces/<spaceId>`.

## 구성 하이라이트

```json5
{
  channels: {
    googlechat: {
      enabled: true,
      serviceAccountFile: "/path/to/service-account.json",
      // or serviceAccountRef: { source: "file", provider: "filemain", id: "/channels/googlechat/serviceAccount" }
      audienceType: "app-url",
      audience: "https://gateway.example.com/googlechat",
      webhookPath: "/googlechat",
      botUser: "users/1234567890", // optional; helps mention detection
      dm: {
        policy: "pairing",
        allowFrom: ["users/1234567890"],
      },
      groupPolicy: "allowlist",
      groups: {
        "spaces/AAAA": {
          allow: true,
          requireMention: true,
          users: ["users/1234567890"],
          systemPrompt: "Short answers only.",
        },
      },
      actions: { reactions: true },
      typingIndicator: "message",
      mediaMaxMb: 20,
    },
  },
}
```

참고:

- 서비스 계정 자격 증명은 `serviceAccount`(JSON 문자열)로 인라인 전달도 가능합니다.
- `serviceAccountRef`도 지원됩니다 (env/file SecretRef). `channels.googlechat.accounts.<id>.serviceAccountRef`를 통한 계정별 참조 포함.
- `webhookPath`가 설정되지 않은 경우 기본 웹훅 경로는 `/googlechat`입니다.
- `dangerouslyAllowNameMatching`은 허용 목록을 위한 가변 이메일 principal 매칭을 다시 활성화합니다 (비상용 호환 모드).
- `actions.reactions`가 활성화된 경우 `reactions` 도구와 `channels action`을 통해 reaction 기능을 사용할 수 있습니다.
- 메시지 액션은 텍스트용 `send`와 명시적 첨부 전송을 위한 `upload-file`을 노출합니다. `upload-file`은 `media` / `filePath` / `path`와 선택적 `message`, `filename`, 스레드 타겟팅을 받습니다.
- `typingIndicator`는 `none`, `message`(기본값), `reaction`(reaction은 사용자 OAuth 필요)을 지원합니다.
- 첨부 파일은 Chat API를 통해 다운로드되어 미디어 파이프라인에 저장됩니다 (`mediaMaxMb`로 크기 제한).

시크릿 참조 세부사항: [시크릿 관리](/gateway/secrets).

## 문제 해결

### 405 Method Not Allowed

Google Cloud Logs Explorer에 다음과 같은 오류가 표시되는 경우:

```
status code: 405, reason phrase: HTTP error response: HTTP/1.1 405 Method Not Allowed
```

이는 웹훅 핸들러가 등록되지 않았음을 의미합니다. 일반적인 원인:

1. **채널이 구성되지 않음**: 설정에 `channels.googlechat` 섹션이 누락되었습니다. 다음으로 확인:

   ```bash
   openclaw config get channels.googlechat
   ```

   "Config path not found"가 반환되면 구성을 추가합니다 ([구성 하이라이트](#config-highlights) 참조).

2. **플러그인이 활성화되지 않음**: 플러그인 상태를 확인합니다:

   ```bash
   openclaw plugins list | grep googlechat
   ```

   "disabled"로 표시되면 설정에 `plugins.entries.googlechat.enabled: true`를 추가합니다.

3. **게이트웨이가 재시작되지 않음**: 설정을 추가한 후 게이트웨이를 재시작합니다:

   ```bash
   openclaw gateway restart
   ```

채널이 실행 중인지 확인:

```bash
openclaw channels status
# Should show: Google Chat default: enabled, configured, ...
```

### 기타 문제

- 인증 오류 또는 누락된 audience 구성은 `openclaw channels status --probe`로 확인합니다.
- 메시지가 도착하지 않으면 Chat 앱의 웹훅 URL + 이벤트 구독을 확인합니다.
- 멘션 게이팅이 응답을 차단하는 경우 `botUser`를 앱의 사용자 리소스 이름으로 설정하고 `requireMention`을 확인합니다.
- 테스트 메시지를 보내는 동안 `openclaw logs --follow`를 사용하여 요청이 게이트웨이에 도달하는지 확인합니다.

관련 문서:

- [게이트웨이 구성](/gateway/configuration)
- [보안](/gateway/security/)
- [Reactions](/tools/reactions)

## 관련

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 플로우
- [그룹](/channels/groups) — 그룹 채팅 동작 및 멘션 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지용 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
