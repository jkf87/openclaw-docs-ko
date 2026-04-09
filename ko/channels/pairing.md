---
summary: "페어링 개요: DM 가능 사용자 승인 및 참여 가능 노드 관리"
read_when:
  - DM 접근 제어 설정
  - 새 iOS/Android 노드 페어링
  - OpenClaw 보안 상태 검토
title: "페어링"
---

# 페어링

"페어링"은 OpenClaw의 명시적인 **소유자 승인** 단계입니다.
두 가지 상황에서 사용됩니다:

1. **DM 페어링** (봇과 대화할 수 있는 사용자)
2. **노드 페어링** (게이트웨이 네트워크에 참여 가능한 디바이스/노드)

보안 컨텍스트: [보안](/gateway/security)

## 1) DM 페어링 (인바운드 채팅 접근)

채널이 DM 정책 `pairing`으로 구성된 경우, 알 수 없는 발신자는 짧은 코드를 받고 승인될 때까지 메시지가 **처리되지 않습니다**.

기본 DM 정책은 다음에 문서화되어 있습니다: [보안](/gateway/security)

페어링 코드:

- 8자, 대문자, 모호한 문자(`0O1I`) 없음.
- **1시간 후 만료**. 봇은 새 요청이 생성될 때만 페어링 메시지를 전송합니다(발신자당 약 1시간에 한 번).
- 대기 중인 DM 페어링 요청은 기본적으로 **채널당 3개**로 제한됩니다. 하나가 만료되거나 승인될 때까지 추가 요청은 무시됩니다.

### 발신자 승인

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

지원 채널: `bluebubbles`, `discord`, `feishu`, `googlechat`, `imessage`, `irc`, `line`, `matrix`, `mattermost`, `msteams`, `nextcloud-talk`, `nostr`, `openclaw-weixin`, `signal`, `slack`, `synology-chat`, `telegram`, `twitch`, `whatsapp`, `zalo`, `zalouser`.

### 상태 저장 위치

`~/.openclaw/credentials/` 아래에 저장됩니다:

- 대기 중인 요청: `<channel>-pairing.json`
- 승인된 허용 목록 저장소:
  - 기본 계정: `<channel>-allowFrom.json`
  - 기본이 아닌 계정: `<channel>-<accountId>-allowFrom.json`

계정 범위 지정 동작:

- 기본이 아닌 계정은 범위가 지정된 허용 목록 파일만 읽기/쓰기합니다.
- 기본 계정은 채널 범위의 허용 목록 파일을 사용합니다.

이 파일들은 어시스턴트 접근을 제어하므로 민감하게 취급하십시오.

중요: 이 저장소는 DM 접근용입니다. 그룹 인증은 별도입니다.
DM 페어링 코드를 승인한다고 해서 해당 발신자가 그룹 명령을 실행하거나 그룹에서 봇을 제어할 수 있는 것은 아닙니다. 그룹 접근을 위해서는 채널의 명시적인 그룹 허용 목록(예: `groupAllowFrom`, `groups`, 또는 채널별 per-group/per-topic 오버라이드)을 구성하십시오.

## 2) 노드 디바이스 페어링 (iOS/Android/macOS/헤드리스 노드)

노드는 `role: node`로 게이트웨이에 **디바이스**로 연결됩니다. 게이트웨이는 승인이 필요한 디바이스 페어링 요청을 생성합니다.

### Telegram을 통한 페어링 (iOS에 권장)

`device-pair` 플러그인을 사용하면 Telegram에서 완전히 처음 디바이스 페어링을 할 수 있습니다:

1. Telegram에서 봇에게 메시지 보내기: `/pair`
2. 봇이 두 개의 메시지로 응답합니다: 안내 메시지와 별도의 **설정 코드** 메시지(Telegram에서 복사/붙여넣기 용이).
3. 휴대폰에서 OpenClaw iOS 앱 열기 → 설정 → 게이트웨이.
4. 설정 코드를 붙여넣고 연결합니다.
5. Telegram으로 돌아가서: `/pair pending`(요청 ID, 역할, 범위 검토) 후 승인.

설정 코드는 다음을 포함하는 base64로 인코딩된 JSON 페이로드입니다:

- `url`: 게이트웨이 WebSocket URL (`ws://...` 또는 `wss://...`)
- `bootstrapToken`: 초기 페어링 핸드셰이크에 사용되는 단기 단일 디바이스 부트스트랩 토큰

해당 부트스트랩 토큰에는 내장 페어링 부트스트랩 프로파일이 포함됩니다:

- 기본 핸드오프 `node` 토큰은 `scopes: []` 유지
- 핸드오프 `operator` 토큰은 부트스트랩 허용 목록으로 제한:
  `operator.approvals`, `operator.read`, `operator.talk.secrets`, `operator.write`
- 부트스트랩 범위 검사는 역할 접두사로 구분되며, 단일 플랫 범위 풀이 아닙니다:
  operator 범위 항목은 operator 요청만 충족하고, 비-operator 역할은
  자체 역할 접두사 아래에서 범위를 요청해야 합니다

설정 코드는 유효한 동안 비밀번호처럼 취급하십시오.

### 노드 디바이스 승인

```bash
openclaw devices list
openclaw devices approve <requestId>
openclaw devices reject <requestId>
```

동일한 디바이스가 다른 인증 정보(예: 다른 역할/범위/공개 키)로 재시도하면
이전 대기 중인 요청이 대체되고 새 `requestId`가 생성됩니다.

### 노드 페어링 상태 저장

`~/.openclaw/devices/` 아래에 저장됩니다:

- `pending.json` (단기; 대기 중인 요청 만료)
- `paired.json` (페어링된 디바이스 + 토큰)

### 참고 사항

- 레거시 `node.pair.*` API (CLI: `openclaw nodes pending|approve|reject|rename`)는
  별도의 게이트웨이 소유 페어링 저장소입니다. WS 노드는 여전히 디바이스 페어링이 필요합니다.
- 페어링 레코드는 승인된 역할의 영구적인 진실의 원천입니다. 활성
  디바이스 토큰은 해당 승인된 역할 집합으로 제한됩니다. 승인된 역할 외부의
  스트레이 토큰 항목은 새로운 접근을 생성하지 않습니다.

## 관련 문서

- 보안 모델 + 프롬프트 인젝션: [보안](/gateway/security)
- 안전하게 업데이트(doctor 실행): [업데이트](/install/updating)
- 채널 구성:
  - Telegram: [Telegram](/channels/telegram)
  - WhatsApp: [WhatsApp](/channels/whatsapp)
  - Signal: [Signal](/channels/signal)
  - BlueBubbles (iMessage): [BlueBubbles](/channels/bluebubbles)
  - iMessage (레거시): [iMessage](/channels/imessage)
  - Discord: [Discord](/channels/discord)
  - Slack: [Slack](/channels/slack)
