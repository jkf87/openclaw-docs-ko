---
summary: "Mattermost bot 설정 및 OpenClaw 구성"
read_when:
  - Mattermost 설정 시
  - Mattermost 라우팅 디버깅 시
title: "Mattermost"
---

상태: 번들 플러그인 (bot 토큰 + WebSocket 이벤트). 채널, 그룹, DM이 모두 지원됩니다.
Mattermost는 자체 호스팅 가능한 팀 메시징 플랫폼입니다. 제품 세부 정보 및 다운로드는
[mattermost.com](https://mattermost.com) 공식 사이트를 참고하세요.

## 번들 플러그인

Mattermost는 현재 OpenClaw 릴리스에 번들 플러그인으로 포함되어 있으므로
일반 패키지 빌드에서는 별도 설치가 필요하지 않습니다.

구형 빌드 또는 Mattermost를 제외한 커스텀 설치라면 수동으로 설치합니다:

CLI로 설치 (npm 레지스트리):

```bash
openclaw plugins install @openclaw/mattermost
```

로컬 체크아웃 (git 저장소에서 실행 시):

```bash
openclaw plugins install ./path/to/local/mattermost-plugin
```

자세한 내용: [플러그인](/tools/plugin)

## 빠른 설정

1. Mattermost 플러그인이 사용 가능한지 확인합니다.
   - 현재 패키지 OpenClaw 릴리스에는 이미 번들되어 있습니다.
   - 구형/커스텀 설치의 경우 위 명령으로 수동 추가할 수 있습니다.
2. Mattermost bot 계정을 생성하고 **bot 토큰**을 복사합니다.
3. Mattermost **base URL**을 복사합니다 (예: `https://chat.example.com`).
4. OpenClaw를 구성하고 게이트웨이를 시작합니다.

최소 구성:

```json5
{
  channels: {
    mattermost: {
      enabled: true,
      botToken: "mm-token",
      baseUrl: "https://chat.example.com",
      dmPolicy: "pairing",
    },
  },
}
```

## 네이티브 슬래시 명령

네이티브 슬래시 명령은 옵트인 방식입니다. 활성화하면 OpenClaw가 Mattermost API를 통해
`oc_*` 슬래시 명령을 등록하고, 게이트웨이 HTTP 서버에서 콜백 POST를 수신합니다.

```json5
{
  channels: {
    mattermost: {
      commands: {
        native: true,
        nativeSkills: true,
        callbackPath: "/api/channels/mattermost/command",
        // Mattermost가 게이트웨이에 직접 접근할 수 없을 때 사용 (reverse proxy/공개 URL).
        callbackUrl: "https://gateway.example.com/api/channels/mattermost/command",
      },
    },
  },
}
```

참고 사항:

- `native: "auto"`는 Mattermost에서 기본적으로 비활성화됩니다. 활성화하려면 `native: true`로 설정하세요.
- `callbackUrl`을 생략하면 OpenClaw는 게이트웨이 host/port + `callbackPath`로부터 URL을 유도합니다.
- 멀티 계정 구성에서는 `commands`를 최상위에 설정하거나
  `channels.mattermost.accounts.<id>.commands` 아래에 설정할 수 있습니다 (계정 값이 최상위 값을 재정의).
- 명령 콜백은 OpenClaw가 `oc_*` 명령을 등록할 때 Mattermost가 반환하는 명령별 토큰으로 검증됩니다.
- 슬래시 콜백은 등록 실패, 시작이 부분적으로만 완료되었거나
  콜백 토큰이 등록된 명령 중 어느 것과도 일치하지 않으면 fail closed 처리됩니다.
- 도달성 요건: 콜백 엔드포인트는 Mattermost 서버에서 접근 가능해야 합니다.
  - Mattermost가 OpenClaw와 동일한 host/네트워크 네임스페이스에서 실행되지 않는 한 `callbackUrl`을 `localhost`로 설정하지 마세요.
  - 해당 URL이 `/api/channels/mattermost/command`를 OpenClaw로 reverse-proxy하지 않는 한 `callbackUrl`을 Mattermost base URL로 설정하지 마세요.
  - 빠른 점검 방법은 `curl https://<gateway-host>/api/channels/mattermost/command`이며, GET은 OpenClaw에서 `404`가 아닌 `405 Method Not Allowed`를 반환해야 합니다.
- Mattermost egress allowlist 요건:
  - 콜백이 private/tailnet/internal 주소를 대상으로 한다면 Mattermost
    `ServiceSettings.AllowedUntrustedInternalConnections`에 콜백 host/도메인을 포함하도록 설정하세요.
  - 전체 URL이 아니라 host/도메인 항목을 사용하세요.
    - 올바른 예: `gateway.tailnet-name.ts.net`
    - 잘못된 예: `https://gateway.tailnet-name.ts.net`

## 환경 변수 (기본 계정)

환경 변수 사용을 선호하는 경우 게이트웨이 호스트에서 다음을 설정합니다:

- `MATTERMOST_BOT_TOKEN=...`
- `MATTERMOST_URL=https://chat.example.com`

환경 변수는 **기본** 계정 (`default`)에만 적용됩니다. 다른 계정은 반드시 설정 값을 사용해야 합니다.

`MATTERMOST_URL`은 workspace `.env`에서 설정할 수 없습니다. [Workspace `.env` 파일](/gateway/security/)을 참고하세요.

## 채팅 모드

Mattermost는 DM에 자동으로 응답합니다. 채널 동작은 `chatmode`로 제어됩니다:

- `oncall` (기본값): 채널에서 @mention된 경우에만 응답.
- `onmessage`: 모든 채널 메시지에 응답.
- `onchar`: 메시지가 trigger prefix로 시작할 때 응답.

설정 예시:

```json5
{
  channels: {
    mattermost: {
      chatmode: "onchar",
      oncharPrefixes: [">", "!"],
    },
  },
}
```

참고 사항:

- `onchar`도 명시적 @mention에는 여전히 응답합니다.
- `channels.mattermost.requireMention`은 기존 설정 호환을 위해 유지되지만 `chatmode`가 권장됩니다.

## 스레딩 및 세션

`channels.mattermost.replyToMode`를 사용해 채널/그룹 응답이 메인 채널에 머물지
또는 트리거 게시물 아래에 스레드를 시작할지 제어합니다.

- `off` (기본값): 인바운드 게시물이 이미 스레드에 있는 경우에만 스레드로 응답.
- `first`: 최상위 채널/그룹 게시물의 경우 해당 게시물 아래에 스레드를 시작하고
  대화를 thread-scoped 세션으로 라우팅.
- `all`: Mattermost에서는 현재 `first`와 동일 동작.
- Direct message는 이 설정을 무시하고 non-threaded 상태를 유지합니다.

설정 예시:

```json5
{
  channels: {
    mattermost: {
      replyToMode: "all",
    },
  },
}
```

참고 사항:

- Thread-scoped 세션은 트리거 게시물 ID를 thread root로 사용합니다.
- `first`와 `all`은 현재 동일합니다. 일단 Mattermost에 thread root가 생기면
  후속 청크와 미디어가 동일한 스레드에서 계속되기 때문입니다.

## 접근 제어 (DM)

- 기본값: `channels.mattermost.dmPolicy = "pairing"` (알 수 없는 발신자는 페어링 코드를 받음).
- 승인 방법:
  - `openclaw pairing list mattermost`
  - `openclaw pairing approve mattermost <CODE>`
- 공개 DM: `channels.mattermost.dmPolicy="open"` 및 `channels.mattermost.allowFrom=["*"]`.

## 채널 (그룹)

- 기본값: `channels.mattermost.groupPolicy = "allowlist"` (mention-gated).
- `channels.mattermost.groupAllowFrom`으로 발신자를 허용 목록에 추가 (사용자 ID 권장).
- 채널별 mention 재정의는 `channels.mattermost.groups.<channelId>.requireMention`
  또는 기본값을 위해 `channels.mattermost.groups["*"].requireMention` 아래에 있습니다.
- `@username` 매칭은 변경 가능하며 `channels.mattermost.dangerouslyAllowNameMatching: true`일 때만 활성화됩니다.
- 공개 채널: `channels.mattermost.groupPolicy="open"` (mention-gated).
- 런타임 참고: `channels.mattermost`가 완전히 누락되면 런타임은 그룹 검사에 대해 `groupPolicy="allowlist"`로 폴백합니다 (`channels.defaults.groupPolicy`가 설정되어 있어도 마찬가지).

예시:

```json5
{
  channels: {
    mattermost: {
      groupPolicy: "open",
      groups: {
        "*": { requireMention: true },
        "team-channel-id": { requireMention: false },
      },
    },
  },
}
```

## 아웃바운드 전달 타겟

`openclaw message send` 또는 cron/webhook과 함께 다음 타겟 형식을 사용합니다:

- `channel:<id>` - 채널
- `user:<id>` - DM
- `@username` - DM (Mattermost API를 통해 해석)

Bare opaque ID (예: `64ifufp...`)는 Mattermost에서 **모호**합니다 (사용자 ID vs 채널 ID).

OpenClaw는 이를 **사용자 우선**으로 해석합니다:

- ID가 사용자로 존재하면 (`GET /api/v4/users/<id>`가 성공), OpenClaw는 `/api/v4/channels/direct`를 통해 direct 채널을 해석하여 **DM**을 보냅니다.
- 그렇지 않으면 ID는 **채널 ID**로 취급됩니다.

결정론적 동작이 필요하다면 항상 명시적 prefix (`user:<id>` / `channel:<id>`)를 사용하세요.

## DM 채널 재시도

OpenClaw가 Mattermost DM 타겟으로 보낼 때 먼저 direct 채널을 해석해야 하는 경우,
일시적인 direct-channel 생성 실패에 대해 기본적으로 재시도합니다.

Mattermost 플러그인의 전역 동작을 조정하려면 `channels.mattermost.dmChannelRetry`를,
단일 계정에 대해서는 `channels.mattermost.accounts.<id>.dmChannelRetry`를 사용하세요.

```json5
{
  channels: {
    mattermost: {
      dmChannelRetry: {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        timeoutMs: 30000,
      },
    },
  },
}
```

참고 사항:

- 이는 DM 채널 생성 (`/api/v4/channels/direct`)에만 적용되며 모든 Mattermost API 호출에 적용되지는 않습니다.
- 재시도는 rate limit, 5xx 응답, 네트워크/타임아웃 오류 같은 일시적 실패에만 적용됩니다.
- `429`가 아닌 4xx 클라이언트 오류는 영구적인 것으로 간주되어 재시도되지 않습니다.

## 미리보기 스트리밍

Mattermost는 thinking, 도구 활동, 부분 응답 텍스트를 단일 **초안 미리보기 게시물**로 스트리밍하고,
최종 답변을 안전하게 보낼 수 있을 때 해당 게시물에서 그대로 마무리합니다. 미리보기는 청크별로 채널을
채우는 대신 동일한 게시물 ID에서 업데이트됩니다. 미디어/오류 최종본은 대기 중인 미리보기 편집을 취소하고
버려지는 미리보기 게시물을 flush하는 대신 일반 전달 방식을 사용합니다.

`channels.mattermost.streaming`으로 활성화합니다:

```json5
{
  channels: {
    mattermost: {
      streaming: "partial", // off | partial | block | progress
    },
  },
}
```

참고 사항:

- `partial`이 일반적인 선택입니다: 응답이 늘어나면서 편집되는 미리보기 게시물 하나가 완성된 답변으로 최종화됩니다.
- `block`은 미리보기 게시물 안에서 append 방식의 초안 청크를 사용합니다.
- `progress`는 생성 중 상태 미리보기를 표시하고 완료 시에만 최종 답변을 게시합니다.
- `off`는 미리보기 스트리밍을 비활성화합니다.
- 스트림을 제자리에서 최종화할 수 없으면 (예: 스트림 중간에 게시물이 삭제됨), OpenClaw는 새로운 최종 게시물 전송으로 폴백하므로 응답이 손실되지 않습니다.
- Reasoning-only 페이로드는 `> Reasoning:` blockquote로 도착하는 텍스트를 포함해 채널 게시물에서 억제됩니다. 다른 surface에서 thinking을 보려면 `/reasoning on`을 설정하세요. Mattermost 최종 게시물은 답변만 유지합니다.
- 채널 매핑 매트릭스는 [스트리밍](/concepts/streaming#preview-streaming-modes)을 참고하세요.

## 반응 (message 도구)

- `channel=mattermost`로 `message action=react`를 사용합니다.
- `messageId`는 Mattermost post ID입니다.
- `emoji`는 `thumbsup` 또는 `:+1:` 같은 이름을 허용합니다 (colon은 선택적).
- 반응을 제거하려면 `remove=true` (boolean)를 설정합니다.
- 반응 추가/제거 이벤트는 라우팅된 에이전트 세션에 시스템 이벤트로 전달됩니다.

예시:

```
message action=react channel=mattermost target=channel:<channelId> messageId=<postId> emoji=thumbsup
message action=react channel=mattermost target=channel:<channelId> messageId=<postId> emoji=thumbsup remove=true
```

설정:

- `channels.mattermost.actions.reactions`: 반응 action 활성화/비활성화 (기본값 true).
- 계정별 재정의: `channels.mattermost.accounts.<id>.actions.reactions`.

## 인터랙티브 버튼 (message 도구)

클릭 가능한 버튼이 포함된 메시지를 보냅니다. 사용자가 버튼을 클릭하면 에이전트가 선택 값을 수신하고 응답할 수 있습니다.

채널 capabilities에 `inlineButtons`를 추가해 버튼을 활성화합니다:

```json5
{
  channels: {
    mattermost: {
      capabilities: ["inlineButtons"],
    },
  },
}
```

`buttons` 파라미터와 함께 `message action=send`를 사용합니다. 버튼은 2차원 배열 (버튼 행들)입니다:

```
message action=send channel=mattermost target=channel:<channelId> buttons=[[{"text":"Yes","callback_data":"yes"},{"text":"No","callback_data":"no"}]]
```

버튼 필드:

- `text` (필수): 표시 레이블.
- `callback_data` (필수): 클릭 시 반환되는 값 (action ID로 사용).
- `style` (선택): `"default"`, `"primary"`, `"danger"`.

사용자가 버튼을 클릭하면:

1. 모든 버튼이 확인 라인으로 대체됩니다 (예: "✓ **Yes** selected by @user").
2. 에이전트는 선택을 인바운드 메시지로 수신하고 응답합니다.

참고 사항:

- 버튼 콜백은 HMAC-SHA256 검증을 사용합니다 (자동, 설정 불필요).
- Mattermost는 API 응답에서 콜백 데이터를 제거하므로 (보안 기능), 클릭 시 모든 버튼이 제거됩니다. 부분 제거는 불가능합니다.
- 하이픈 또는 언더스코어를 포함한 Action ID는 자동으로 sanitize됩니다 (Mattermost 라우팅 제약).

설정:

- `channels.mattermost.capabilities`: capability 문자열의 배열. 에이전트 시스템 프롬프트에서 버튼 도구 설명을 활성화하려면 `"inlineButtons"`를 추가합니다.
- `channels.mattermost.interactions.callbackBaseUrl`: 버튼 콜백을 위한 선택적 외부 base URL (예: `https://gateway.example.com`). Mattermost가 게이트웨이의 bind host에 직접 접근할 수 없을 때 사용합니다.
- 멀티 계정 구성에서는 같은 필드를 `channels.mattermost.accounts.<id>.interactions.callbackBaseUrl` 아래에 설정할 수도 있습니다.
- `interactions.callbackBaseUrl`이 생략되면 OpenClaw는 `gateway.customBindHost` + `gateway.port`에서 콜백 URL을 유도한 뒤 `http://localhost:<port>`로 폴백합니다.
- 도달성 규칙: 버튼 콜백 URL은 Mattermost 서버에서 접근 가능해야 합니다. `localhost`는 Mattermost와 OpenClaw가 같은 host/네트워크 네임스페이스에서 실행될 때만 동작합니다.
- 콜백 타겟이 private/tailnet/internal이라면 해당 host/도메인을 Mattermost `ServiceSettings.AllowedUntrustedInternalConnections`에 추가하세요.

### 직접 API 통합 (외부 스크립트)

외부 스크립트와 webhook은 에이전트의 `message` 도구를 거치지 않고 Mattermost REST API를 통해 버튼을
직접 게시할 수 있습니다. 가능하면 플러그인의 `buildButtonAttachments()`를 사용하세요. raw JSON을 게시한다면
다음 규칙을 따르세요:

**Payload 구조:**

```json5
{
  channel_id: "<channelId>",
  message: "Choose an option:",
  props: {
    attachments: [
      {
        actions: [
          {
            id: "mybutton01", // 알파벳과 숫자만 — 아래 참고
            type: "button", // 필수, 없으면 클릭이 조용히 무시됨
            name: "Approve", // 표시 레이블
            style: "primary", // 선택: "default", "primary", "danger"
            integration: {
              url: "https://gateway.example.com/mattermost/interactions/default",
              context: {
                action_id: "mybutton01", // 버튼 id와 일치해야 함 (이름 조회용)
                action: "approve",
                // ... 임의의 커스텀 필드 ...
                _token: "<hmac>", // 아래 HMAC 섹션 참고
              },
            },
          },
        ],
      },
    ],
  },
}
```

**주요 규칙:**

1. Attachment는 최상위 `attachments`가 아닌 `props.attachments`에 들어갑니다 (조용히 무시됨).
2. 모든 action에는 `type: "button"`이 필요합니다. 없으면 클릭이 조용히 무시됩니다.
3. 모든 action에는 `id` 필드가 필요합니다. Mattermost는 ID 없는 action을 무시합니다.
4. Action `id`는 **알파벳과 숫자만** (`[a-zA-Z0-9]`) 사용해야 합니다. 하이픈과 언더스코어는
   Mattermost의 서버 측 action 라우팅을 깨뜨립니다 (404 반환). 사용 전에 제거하세요.
5. `context.action_id`는 버튼의 `id`와 일치해야 확인 메시지가 raw ID 대신 버튼 이름 (예: "Approve")을 표시합니다.
6. `context.action_id`는 필수입니다. 없으면 interaction 핸들러가 400을 반환합니다.

**HMAC 토큰 생성:**

게이트웨이는 HMAC-SHA256으로 버튼 클릭을 검증합니다. 외부 스크립트는 게이트웨이의 검증 로직과 일치하는 토큰을 생성해야 합니다:

1. bot 토큰에서 secret을 유도합니다:
   `HMAC-SHA256(key="openclaw-mattermost-interactions", data=botToken)`
2. `_token`을 **제외한** 모든 필드로 context 객체를 구성합니다.
3. **정렬된 key**와 **공백 없음**으로 직렬화합니다 (게이트웨이는 정렬된 key와 함께 `JSON.stringify`를 사용하며, 이는 compact 출력을 생성).
4. 서명: `HMAC-SHA256(key=secret, data=serializedContext)`
5. 결과 hex digest를 context에 `_token`으로 추가합니다.

Python 예시:

```python
import hmac, hashlib, json

secret = hmac.new(
    b"openclaw-mattermost-interactions",
    bot_token.encode(), hashlib.sha256
).hexdigest()

ctx = {"action_id": "mybutton01", "action": "approve"}
payload = json.dumps(ctx, sort_keys=True, separators=(",", ":"))
token = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

context = {**ctx, "_token": token}
```

흔한 HMAC 함정:

- Python의 `json.dumps`는 기본적으로 공백을 추가합니다 (`{"key": "val"}`). JavaScript의 compact 출력 (`{"key":"val"}`)과 일치시키려면 `separators=(",", ":")`를 사용하세요.
- 항상 **모든** context 필드 (`_token` 제외)에 서명합니다. 게이트웨이는 `_token`을 제거한 뒤 남은 모든 것에 서명합니다. 부분 집합에 서명하면 조용한 검증 실패가 발생합니다.
- `sort_keys=True`를 사용하세요. 게이트웨이는 서명 전에 key를 정렬하며 Mattermost가 payload를 저장할 때 context 필드를 재정렬할 수 있습니다.
- random 바이트가 아닌 bot 토큰에서 secret을 유도하세요 (결정론적). 버튼을 생성하는 프로세스와 검증하는 게이트웨이에서 secret이 동일해야 합니다.

## 디렉토리 어댑터

Mattermost 플러그인에는 Mattermost API를 통해 채널 및 사용자 이름을 해석하는 디렉토리 어댑터가 포함되어 있습니다.
이를 통해 `openclaw message send` 및 cron/webhook 전달에서 `#channel-name` 및 `@username` 타겟을 사용할 수 있습니다.

별도 설정이 필요 없습니다. 어댑터는 계정 설정의 bot 토큰을 사용합니다.

## 멀티 계정

Mattermost는 `channels.mattermost.accounts` 아래에서 여러 계정을 지원합니다:

```json5
{
  channels: {
    mattermost: {
      accounts: {
        default: { name: "Primary", botToken: "mm-token", baseUrl: "https://chat.example.com" },
        alerts: { name: "Alerts", botToken: "mm-token-2", baseUrl: "https://alerts.example.com" },
      },
    },
  },
}
```

## 문제 해결

- 채널에서 응답 없음: bot이 채널에 있고 언급했는지 (oncall), trigger prefix를 사용했는지 (onchar), 또는 `chatmode: "onmessage"`로 설정했는지 확인하세요.
- 인증 오류: bot 토큰, base URL, 계정 활성화 여부를 확인하세요.
- 멀티 계정 문제: 환경 변수는 `default` 계정에만 적용됩니다.
- 네이티브 슬래시 명령이 `Unauthorized: invalid command token.`을 반환: OpenClaw가
  콜백 토큰을 받아들이지 않았습니다. 일반적인 원인:
  - 시작 시 슬래시 명령 등록이 실패했거나 일부만 완료됨
  - 콜백이 잘못된 게이트웨이/계정으로 전달됨
  - Mattermost에 여전히 이전 콜백 타겟을 가리키는 구 명령이 남아 있음
  - 슬래시 명령을 재활성화하지 않은 채 게이트웨이가 재시작됨
- 네이티브 슬래시 명령이 동작하지 않으면 로그에서
  `mattermost: failed to register slash commands` 또는
  `mattermost: native slash commands enabled but no commands could be registered`를 확인하세요.
- `callbackUrl`이 생략되고 로그가 콜백이 `http://127.0.0.1:18789/...`로 해석되었다고 경고하면,
  해당 URL은 Mattermost가 OpenClaw와 동일한 host/네트워크 네임스페이스에서 실행될 때만 접근 가능할 가능성이 큽니다.
  명시적으로 외부에서 접근 가능한 `commands.callbackUrl`을 설정하세요.
- 버튼이 흰 박스로 표시됨: 에이전트가 잘못된 버튼 데이터를 전송할 수 있습니다. 각 버튼에 `text`와 `callback_data` 필드가 모두 있는지 확인하세요.
- 버튼은 렌더되지만 클릭이 동작하지 않음: Mattermost 서버 설정의 `AllowedUntrustedInternalConnections`가 `127.0.0.1 localhost`를 포함하는지, 그리고 `ServiceSettings`에서 `EnablePostActionIntegration`이 `true`인지 확인하세요.
- 버튼 클릭 시 404 반환: 버튼 `id`에 하이픈 또는 언더스코어가 포함되어 있을 가능성이 큽니다. Mattermost의 action 라우터는 알파벳/숫자가 아닌 ID에서 깨집니다. `[a-zA-Z0-9]`만 사용하세요.
- 게이트웨이 로그에 `invalid _token`: HMAC 불일치. 모든 context 필드 (부분 집합 아님)에 서명하고, 정렬된 key와 compact JSON (공백 없음)을 사용하는지 확인하세요. 위의 HMAC 섹션을 참고하세요.
- 게이트웨이 로그에 `missing _token in context`: 버튼의 context에 `_token` 필드가 없습니다. integration payload를 구성할 때 포함되어 있는지 확인하세요.
- 확인 메시지가 버튼 이름 대신 raw ID를 표시: `context.action_id`가 버튼의 `id`와 일치하지 않습니다. 둘을 동일한 sanitized 값으로 설정하세요.
- 에이전트가 버튼을 인식하지 못함: Mattermost 채널 설정에 `capabilities: ["inlineButtons"]`를 추가하세요.

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 mention gating
- [채널 라우팅](/channels/channel-routing) — 메시지 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 하드닝
