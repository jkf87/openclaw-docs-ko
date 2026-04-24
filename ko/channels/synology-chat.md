---
summary: "Synology Chat webhook 설정 및 OpenClaw 구성"
read_when:
  - OpenClaw와 Synology Chat 설정 시
  - Synology Chat webhook 라우팅 디버깅 시
title: "Synology Chat"
---

상태: Synology Chat webhook을 사용하는 번들 플러그인 다이렉트 메시지 채널.
이 플러그인은 Synology Chat outgoing webhook에서 인바운드 메시지를 수신하고
Synology Chat incoming webhook을 통해 응답을 전송합니다.

## 번들 플러그인

Synology Chat은 현재 OpenClaw 릴리스에 번들 플러그인으로 포함되어 있으므로,
일반 패키지 빌드에서는 별도 설치가 필요하지 않습니다.

구버전 빌드이거나 Synology Chat이 제외된 커스텀 설치를 사용 중인 경우
수동으로 설치하세요.

로컬 체크아웃에서 설치:

```bash
openclaw plugins install ./path/to/local/synology-chat-plugin
```

자세한 내용: [플러그인](/tools/plugin)

## 빠른 설정

1. Synology Chat 플러그인이 사용 가능한지 확인합니다.
   - 현재 패키지된 OpenClaw 릴리스에는 이미 번들되어 있습니다.
   - 구버전/커스텀 설치는 위의 명령으로 소스 체크아웃에서 수동 추가할 수 있습니다.
   - `openclaw onboard`는 이제 `openclaw channels add`와 동일한 채널 설정 목록에 Synology Chat을 표시합니다.
   - 비대화식 설정: `openclaw channels add --channel synology-chat --token <token> --url <incoming-webhook-url>`
2. Synology Chat 통합에서:
   - incoming webhook을 생성하고 URL을 복사합니다.
   - 비밀 토큰을 사용하여 outgoing webhook을 생성합니다.
3. outgoing webhook URL을 OpenClaw 게이트웨이로 지정합니다:
   - 기본값은 `https://gateway-host/webhook/synology`.
   - 또는 커스텀 `channels.synology-chat.webhookPath`.
4. OpenClaw에서 설정을 마무리합니다.
   - 가이드: `openclaw onboard`
   - 직접: `openclaw channels add --channel synology-chat --token <token> --url <incoming-webhook-url>`
5. 게이트웨이를 재시작하고 Synology Chat 봇에 DM을 보냅니다.

Webhook 인증 세부 사항:

- OpenClaw는 `body.token`에서 outgoing webhook 토큰을 수신한 후,
  `?token=...`, 그리고 헤더 순으로 수신합니다.
- 허용되는 헤더 형식:
  - `x-synology-token`
  - `x-webhook-token`
  - `x-openclaw-token`
  - `Authorization: Bearer <token>`
- 비어 있거나 누락된 토큰은 실패로 차단됩니다 (fail closed).

최소 구성:

```json5
{
  channels: {
    "synology-chat": {
      enabled: true,
      token: "synology-outgoing-token",
      incomingUrl: "https://nas.example.com/webapi/entry.cgi?api=SYNO.Chat.External&method=incoming&version=2&token=...",
      webhookPath: "/webhook/synology",
      dmPolicy: "allowlist",
      allowedUserIds: ["123456"],
      rateLimitPerMinute: 30,
      allowInsecureSsl: false,
    },
  },
}
```

## 환경 변수

기본 계정의 경우 환경 변수를 사용할 수 있습니다:

- `SYNOLOGY_CHAT_TOKEN`
- `SYNOLOGY_CHAT_INCOMING_URL`
- `SYNOLOGY_NAS_HOST`
- `SYNOLOGY_ALLOWED_USER_IDS` (쉼표로 구분)
- `SYNOLOGY_RATE_LIMIT`
- `OPENCLAW_BOT_NAME`

구성 값은 환경 변수를 재정의합니다.

`SYNOLOGY_CHAT_INCOMING_URL`은 워크스페이스 `.env`에서 설정할 수 없습니다. [워크스페이스 `.env` 파일](/gateway/security/)을 참조하세요.

## DM 정책 및 접근 제어

- `dmPolicy: "allowlist"`가 권장되는 기본값입니다.
- `allowedUserIds`는 Synology 사용자 ID 목록(또는 쉼표로 구분된 문자열)을 허용합니다.
- `allowlist` 모드에서 빈 `allowedUserIds` 목록은 오구성으로 간주되어 webhook 경로가 시작되지 않습니다 (모두 허용하려면 `dmPolicy: "open"`을 사용하세요).
- `dmPolicy: "open"`은 모든 발신자를 허용합니다.
- `dmPolicy: "disabled"`는 DM을 차단합니다.
- 응답 수신자 바인딩은 기본적으로 안정적인 숫자 `user_id`에 유지됩니다. `channels.synology-chat.dangerouslyAllowNameMatching: true`는 응답 전달을 위해 가변 사용자명/닉네임 조회를 다시 활성화하는 비상 호환 모드입니다.
- 페어링 승인 방법:
  - `openclaw pairing list synology-chat`
  - `openclaw pairing approve synology-chat <CODE>`

## 아웃바운드 전달

타겟으로 숫자 Synology Chat 사용자 ID를 사용하세요.

예시:

```bash
openclaw message send --channel synology-chat --target 123456 --text "Hello from OpenClaw"
openclaw message send --channel synology-chat --target synology-chat:123456 --text "Hello again"
```

미디어 전송은 URL 기반 파일 전달을 통해 지원됩니다.
아웃바운드 파일 URL은 `http` 또는 `https`를 사용해야 하며, OpenClaw가 URL을 NAS webhook으로 전달하기 전에 프라이빗 또는 차단된 네트워크 대상은 거부됩니다.

## 멀티 계정

`channels.synology-chat.accounts` 아래에서 여러 Synology Chat 계정이 지원됩니다.
각 계정은 토큰, incoming URL, webhook 경로, DM 정책 및 제한을 재정의할 수 있습니다.
다이렉트 메시지 세션은 계정 및 사용자별로 격리되므로, 두 개의 서로 다른 Synology 계정에서
동일한 숫자 `user_id`가 트랜스크립트 상태를 공유하지 않습니다.
활성화된 각 계정에 고유한 `webhookPath`를 부여하세요. OpenClaw는 이제 중복된 정확한 경로를 거부하며
멀티 계정 설정에서 공유 webhook 경로만 상속하는 명명된 계정은 시작을 거부합니다.
명명된 계정에 대해 의도적으로 레거시 상속이 필요한 경우 해당 계정 또는 `channels.synology-chat`에서
`dangerouslyAllowInheritedWebhookPath: true`를 설정하되,
중복된 정확한 경로는 여전히 실패로 차단됩니다 (fail-closed). 계정별 명시적 경로를 선호하세요.

```json5
{
  channels: {
    "synology-chat": {
      enabled: true,
      accounts: {
        default: {
          token: "token-a",
          incomingUrl: "https://nas-a.example.com/...token=...",
        },
        alerts: {
          token: "token-b",
          incomingUrl: "https://nas-b.example.com/...token=...",
          webhookPath: "/webhook/synology-alerts",
          dmPolicy: "allowlist",
          allowedUserIds: ["987654"],
        },
      },
    },
  },
}
```

## 보안 참고

- `token`을 비밀로 유지하고 유출 시 교체하세요.
- 자체 서명된 로컬 NAS 인증서를 명시적으로 신뢰하지 않는 한 `allowInsecureSsl: false`를 유지하세요.
- 인바운드 webhook 요청은 토큰 검증되며 발신자별로 속도 제한됩니다.
- 잘못된 토큰 검사는 상수 시간 비밀 비교를 사용하며 실패로 차단됩니다.
- 프로덕션에서는 `dmPolicy: "allowlist"`를 선호하세요.
- 레거시 사용자명 기반 응답 전달이 명시적으로 필요하지 않은 한 `dangerouslyAllowNameMatching`을 끄세요.
- 멀티 계정 설정에서 공유 경로 라우팅 위험을 명시적으로 수용하지 않는 한 `dangerouslyAllowInheritedWebhookPath`를 끄세요.

## 문제 해결

- `Missing required fields (token, user_id, text)`:
  - outgoing webhook 페이로드에 필수 필드 중 하나가 누락됨
  - Synology가 헤더로 토큰을 보내는 경우, 게이트웨이/프록시가 해당 헤더를 보존하는지 확인
- `Invalid token`:
  - outgoing webhook 비밀이 `channels.synology-chat.token`과 일치하지 않음
  - 요청이 잘못된 계정/webhook 경로에 도달함
  - 역방향 프록시가 요청이 OpenClaw에 도달하기 전에 토큰 헤더를 제거함
- `Rate limit exceeded`:
  - 같은 소스의 잘못된 토큰 시도가 너무 많으면 해당 소스가 일시적으로 잠길 수 있음
  - 인증된 발신자에게도 별도의 사용자별 메시지 속도 제한이 적용됨
- `Allowlist is empty. Configure allowedUserIds or use dmPolicy=open.`:
  - `dmPolicy="allowlist"`가 활성화되었지만 구성된 사용자가 없음
- `User not authorized`:
  - 발신자의 숫자 `user_id`가 `allowedUserIds`에 없음

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 플로우
- [그룹](/channels/groups) — 그룹 채팅 동작 및 멘션 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지의 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
