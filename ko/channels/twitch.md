---
summary: "Twitch 채팅 봇 구성 및 설정"
read_when:
  - OpenClaw용 Twitch 채팅 통합을 설정할 때
title: "Twitch"
---

IRC 연결을 통한 Twitch 채팅 지원입니다. OpenClaw는 Twitch 사용자(봇 계정)로 연결하여 채널에서 메시지를 수신하고 전송합니다.

## 번들 플러그인

Twitch는 현재 OpenClaw 릴리스에 번들 플러그인으로 제공되므로, 일반 패키지 빌드에서는 별도 설치가 필요하지 않습니다.

이전 빌드를 사용 중이거나 Twitch를 제외한 사용자 정의 설치의 경우, 수동으로 설치하십시오.

CLI를 통한 설치(npm 레지스트리):

```bash
openclaw plugins install @openclaw/twitch
```

로컬 체크아웃(git 저장소에서 실행할 때):

```bash
openclaw plugins install ./path/to/local/twitch-plugin
```

자세한 내용: [플러그인](/tools/plugin)

## 빠른 설정 (초보자용)

1. Twitch 플러그인이 사용 가능한지 확인하십시오.
   - 현재 패키지로 제공되는 OpenClaw 릴리스에는 이미 번들로 포함되어 있습니다.
   - 이전/사용자 정의 설치의 경우 위 명령으로 수동 추가할 수 있습니다.
2. 봇 전용 Twitch 계정을 생성하십시오(또는 기존 계정을 사용하십시오).
3. 자격 증명을 생성하십시오: [Twitch Token Generator](https://twitchtokengenerator.com/)
   - **Bot Token** 선택
   - `chat:read` 및 `chat:write` 스코프가 선택되었는지 확인
   - **Client ID**와 **Access Token**을 복사
4. Twitch 사용자 ID를 찾으십시오: [https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/)
5. 토큰을 구성하십시오:
   - 환경 변수: `OPENCLAW_TWITCH_ACCESS_TOKEN=...` (기본 계정 전용)
   - 또는 구성: `channels.twitch.accessToken`
   - 둘 다 설정된 경우 구성이 우선합니다(환경 변수 폴백은 기본 계정 전용).
6. 게이트웨이를 시작하십시오.

**주의:** 무단 사용자가 봇을 트리거하지 못하도록 접근 제어(`allowFrom` 또는 `allowedRoles`)를 추가하십시오. `requireMention`의 기본값은 `true`입니다.

최소 구성:

```json5
{
  channels: {
    twitch: {
      enabled: true,
      username: "openclaw", // 봇의 Twitch 계정
      accessToken: "oauth:abc123...", // OAuth Access Token (또는 OPENCLAW_TWITCH_ACCESS_TOKEN 환경 변수 사용)
      clientId: "xyz789...", // Token Generator에서 발급한 Client ID
      channel: "vevisk", // 참여할 Twitch 채널의 채팅 (필수)
      allowFrom: ["123456789"], // (권장) 본인의 Twitch 사용자 ID만 - https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/ 에서 확인
    },
  },
}
```

## 개요

- 게이트웨이가 소유한 Twitch 채널입니다.
- 결정적 라우팅: 응답은 항상 Twitch로 돌아갑니다.
- 각 계정은 격리된 세션 키 `agent:<agentId>:twitch:<accountName>`에 매핑됩니다.
- `username`은 봇의 계정(인증 주체)이며, `channel`은 참여할 채팅방입니다.

## 상세 설정

### 자격 증명 생성

[Twitch Token Generator](https://twitchtokengenerator.com/)를 사용하십시오:

- **Bot Token** 선택
- `chat:read` 및 `chat:write` 스코프가 선택되었는지 확인
- **Client ID**와 **Access Token**을 복사

수동 앱 등록은 필요하지 않습니다. 토큰은 몇 시간 후 만료됩니다.

### 봇 구성

**환경 변수(기본 계정 전용):**

```bash
OPENCLAW_TWITCH_ACCESS_TOKEN=oauth:abc123...
```

**또는 구성:**

```json5
{
  channels: {
    twitch: {
      enabled: true,
      username: "openclaw",
      accessToken: "oauth:abc123...",
      clientId: "xyz789...",
      channel: "vevisk",
    },
  },
}
```

환경 변수와 구성이 모두 설정된 경우 구성이 우선합니다.

### 접근 제어 (권장)

```json5
{
  channels: {
    twitch: {
      allowFrom: ["123456789"], // (권장) 본인의 Twitch 사용자 ID만
    },
  },
}
```

엄격한 허용 목록을 위해서는 `allowFrom`을 선호하십시오. 역할 기반 접근을 원하면 `allowedRoles`를 대신 사용하십시오.

**사용 가능한 역할:** `"moderator"`, `"owner"`, `"vip"`, `"subscriber"`, `"all"`.

**왜 사용자 ID인가?** 사용자 이름은 변경될 수 있어 사칭이 가능합니다. 사용자 ID는 영구적입니다.

Twitch 사용자 ID 찾기: [https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/) (Twitch 사용자 이름을 ID로 변환)

## 토큰 갱신 (선택)

[Twitch Token Generator](https://twitchtokengenerator.com/)에서 발급한 토큰은 자동으로 갱신할 수 없습니다 - 만료 시 재생성하십시오.

자동 토큰 갱신을 위해서는 [Twitch Developer Console](https://dev.twitch.tv/console)에서 자체 Twitch 애플리케이션을 생성하고 구성에 추가하십시오:

```json5
{
  channels: {
    twitch: {
      clientSecret: "your_client_secret",
      refreshToken: "your_refresh_token",
    },
  },
}
```

봇은 만료 전에 자동으로 토큰을 갱신하고 갱신 이벤트를 로그에 기록합니다.

## 다중 계정 지원

`channels.twitch.accounts`와 계정별 토큰을 사용하십시오. 공유 패턴은 [`gateway/configuration`](/gateway/configuration)을 참조하십시오.

예시(하나의 봇 계정으로 두 개의 채널 참여):

```json5
{
  channels: {
    twitch: {
      accounts: {
        channel1: {
          username: "openclaw",
          accessToken: "oauth:abc123...",
          clientId: "xyz789...",
          channel: "vevisk",
        },
        channel2: {
          username: "openclaw",
          accessToken: "oauth:def456...",
          clientId: "uvw012...",
          channel: "secondchannel",
        },
      },
    },
  },
}
```

**참고:** 각 계정은 자체 토큰이 필요합니다(채널당 토큰 하나).

## 접근 제어

### 역할 기반 제한

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          allowedRoles: ["moderator", "vip"],
        },
      },
    },
  },
}
```

### 사용자 ID 기반 허용 목록 (가장 안전)

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          allowFrom: ["123456789", "987654321"],
        },
      },
    },
  },
}
```

### 역할 기반 접근 (대안)

`allowFrom`은 엄격한 허용 목록입니다. 설정하면 해당 사용자 ID만 허용됩니다.
역할 기반 접근을 원하면 `allowFrom`을 설정하지 않고 `allowedRoles`를 대신 구성하십시오:

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          allowedRoles: ["moderator"],
        },
      },
    },
  },
}
```

### @멘션 요구 사항 비활성화

기본적으로 `requireMention`은 `true`입니다. 비활성화하고 모든 메시지에 응답하려면:

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          requireMention: false,
        },
      },
    },
  },
}
```

## 문제 해결

먼저 진단 명령을 실행하십시오:

```bash
openclaw doctor
openclaw channels status --probe
```

### 봇이 메시지에 응답하지 않음

**접근 제어 확인:** 사용자 ID가 `allowFrom`에 있는지 확인하거나, 테스트를 위해 임시로 `allowFrom`을 제거하고 `allowedRoles: ["all"]`을 설정하십시오.

**봇이 채널에 있는지 확인:** 봇은 `channel`에 지정된 채널에 참여해야 합니다.

### 토큰 문제

**"Failed to connect" 또는 인증 오류:**

- `accessToken`이 OAuth 액세스 토큰 값인지 확인하십시오(일반적으로 `oauth:` 접두사로 시작)
- 토큰에 `chat:read` 및 `chat:write` 스코프가 있는지 확인
- 토큰 갱신을 사용하는 경우 `clientSecret`과 `refreshToken`이 설정되었는지 확인

### 토큰 갱신이 작동하지 않음

**로그에서 갱신 이벤트 확인:**

```
Using env token source for mybot
Access token refreshed for user 123456 (expires in 14400s)
```

"token refresh disabled (no refresh token)"가 보이면:

- `clientSecret`이 제공되었는지 확인
- `refreshToken`이 제공되었는지 확인

## 구성

**계정 구성:**

- `username` - 봇 사용자 이름
- `accessToken` - `chat:read` 및 `chat:write`가 있는 OAuth 액세스 토큰
- `clientId` - Twitch Client ID (Token Generator 또는 자체 앱에서)
- `channel` - 참여할 채널 (필수)
- `enabled` - 이 계정 활성화 (기본값: `true`)
- `clientSecret` - 선택: 자동 토큰 갱신용
- `refreshToken` - 선택: 자동 토큰 갱신용
- `expiresIn` - 토큰 만료 시간(초)
- `obtainmentTimestamp` - 토큰 획득 타임스탬프
- `allowFrom` - 사용자 ID 허용 목록
- `allowedRoles` - 역할 기반 접근 제어 (`"moderator" | "owner" | "vip" | "subscriber" | "all"`)
- `requireMention` - @멘션 필수 (기본값: `true`)

**프로바이더 옵션:**

- `channels.twitch.enabled` - 채널 시작 활성화/비활성화
- `channels.twitch.username` - 봇 사용자 이름 (단순화된 단일 계정 구성)
- `channels.twitch.accessToken` - OAuth 액세스 토큰 (단순화된 단일 계정 구성)
- `channels.twitch.clientId` - Twitch Client ID (단순화된 단일 계정 구성)
- `channels.twitch.channel` - 참여할 채널 (단순화된 단일 계정 구성)
- `channels.twitch.accounts.<accountName>` - 다중 계정 구성 (위의 모든 계정 필드)

전체 예시:

```json5
{
  channels: {
    twitch: {
      enabled: true,
      username: "openclaw",
      accessToken: "oauth:abc123...",
      clientId: "xyz789...",
      channel: "vevisk",
      clientSecret: "secret123...",
      refreshToken: "refresh456...",
      allowFrom: ["123456789"],
      allowedRoles: ["moderator", "vip"],
      accounts: {
        default: {
          username: "mybot",
          accessToken: "oauth:abc123...",
          clientId: "xyz789...",
          channel: "your_channel",
          enabled: true,
          clientSecret: "secret123...",
          refreshToken: "refresh456...",
          expiresIn: 14400,
          obtainmentTimestamp: 1706092800000,
          allowFrom: ["123456789", "987654321"],
          allowedRoles: ["moderator"],
        },
      },
    },
  },
}
```

## 도구 액션

에이전트는 다음 액션과 함께 `twitch`를 호출할 수 있습니다:

- `send` - 채널에 메시지 전송

예시:

```json5
{
  action: "twitch",
  params: {
    message: "Hello Twitch!",
    to: "#mychannel",
  },
}
```

## 안전 및 운영

- **토큰을 비밀번호처럼 취급하십시오** - 토큰을 git에 커밋하지 마십시오
- 장시간 실행되는 봇에는 **자동 토큰 갱신을 사용하십시오**
- 접근 제어에는 사용자 이름 대신 **사용자 ID 허용 목록을 사용하십시오**
- 토큰 갱신 이벤트 및 연결 상태에 대해 **로그를 모니터링하십시오**
- **토큰 스코프를 최소화하십시오** - `chat:read` 및 `chat:write`만 요청
- **문제가 지속되는 경우**: 다른 프로세스가 세션을 소유하고 있지 않은지 확인한 후 게이트웨이를 재시작하십시오

## 제한

- 메시지당 **500자** (단어 경계에서 자동 청킹)
- 청킹 전에 마크다운이 제거됩니다
- 속도 제한 없음 (Twitch의 내장 속도 제한 사용)

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 멘션 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지에 대한 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
