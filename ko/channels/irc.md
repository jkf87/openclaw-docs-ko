---
summary: "IRC 플러그인 설정, 접근 제어 및 문제 해결"
title: IRC
read_when:
  - OpenClaw를 IRC 채널 또는 DM에 연결하려는 경우
  - IRC 허용 목록, 그룹 정책 또는 멘션 게이팅을 구성하는 경우
---

클래식 채널(`#room`)과 다이렉트 메시지에서 OpenClaw를 사용하려면 IRC를 활용하세요.
IRC는 번들 플러그인으로 제공되지만, 메인 설정의 `channels.irc` 아래에서 구성합니다.

## 빠른 시작

1. `~/.openclaw/openclaw.json`에서 IRC 설정을 활성화합니다.
2. 최소한 다음을 설정합니다:

```json5
{
  channels: {
    irc: {
      enabled: true,
      host: "irc.example.com",
      port: 6697,
      tls: true,
      nick: "openclaw-bot",
      channels: ["#openclaw"],
    },
  },
}
```

봇 조정(coordination)에는 프라이빗 IRC 서버 사용을 권장합니다. 공개 IRC 네트워크를 의도적으로 사용하는 경우 일반적인 선택지로는 Libera.Chat, OFTC, Snoonet이 있습니다. 봇이나 swarm 백채널 트래픽에는 예측 가능한 공개 채널을 피하세요.

3. 게이트웨이를 시작/재시작합니다:

```bash
openclaw gateway run
```

## 보안 기본값

- `channels.irc.dmPolicy`의 기본값은 `"pairing"`입니다.
- `channels.irc.groupPolicy`의 기본값은 `"allowlist"`입니다.
- `groupPolicy="allowlist"`인 경우, 허용된 채널을 정의하기 위해 `channels.irc.groups`를 설정합니다.
- 평문 전송을 의도적으로 수락하지 않는 한 TLS(`channels.irc.tls=true`)를 사용하세요.

## 접근 제어

IRC 채널에는 두 개의 분리된 "게이트"가 있습니다:

1. **채널 접근** (`groupPolicy` + `groups`): 봇이 해당 채널에서 메시지를 수락할지 여부.
2. **발신자 접근** (`groupAllowFrom` / 채널별 `groups["#channel"].allowFrom`): 해당 채널 내에서 봇을 트리거할 수 있는 사용자.

설정 키:

- DM 허용 목록 (DM 발신자 접근): `channels.irc.allowFrom`
- 그룹 발신자 허용 목록 (채널 발신자 접근): `channels.irc.groupAllowFrom`
- 채널별 제어 (채널 + 발신자 + 멘션 규칙): `channels.irc.groups["#channel"]`
- `channels.irc.groupPolicy="open"`은 구성되지 않은 채널을 허용합니다 (**여전히 기본적으로 멘션 게이팅됨**)

허용 목록 항목은 안정적인 발신자 식별자(`nick!user@host`)를 사용해야 합니다.
bare nick 매칭은 가변적이며 `channels.irc.dangerouslyAllowNameMatching: true`일 때만 활성화됩니다.

### 흔한 함정: `allowFrom`은 DM용이지 채널용이 아닙니다

다음과 같은 로그가 보인다면:

- `irc: drop group sender alice!ident@host (policy=allowlist)`

…이는 해당 발신자가 **그룹/채널** 메시지에 대해 허용되지 않았다는 의미입니다. 다음 중 하나로 수정하세요:

- `channels.irc.groupAllowFrom` 설정 (모든 채널에 대해 전역), 또는
- 채널별 발신자 허용 목록 설정: `channels.irc.groups["#channel"].allowFrom`

예제 (`#tuirc-dev`의 누구나 봇과 대화할 수 있도록 허용):

```json5
{
  channels: {
    irc: {
      groupPolicy: "allowlist",
      groups: {
        "#tuirc-dev": { allowFrom: ["*"] },
      },
    },
  },
}
```

## 응답 트리거링 (멘션)

채널이 허용되고(`groupPolicy` + `groups`를 통해) 발신자도 허용되더라도, OpenClaw는 기본적으로 그룹 컨텍스트에서 **멘션 게이팅**을 수행합니다.

이는 메시지에 봇과 일치하는 멘션 패턴이 포함되지 않은 한 `drop channel … (missing-mention)`과 같은 로그가 보일 수 있음을 의미합니다.

봇이 IRC 채널에서 **멘션 없이** 응답하도록 하려면 해당 채널의 멘션 게이팅을 비활성화합니다:

```json5
{
  channels: {
    irc: {
      groupPolicy: "allowlist",
      groups: {
        "#tuirc-dev": {
          requireMention: false,
          allowFrom: ["*"],
        },
      },
    },
  },
}
```

또는 **모든** IRC 채널을 허용하고(채널별 허용 목록 없이) 멘션 없이 응답하려면:

```json5
{
  channels: {
    irc: {
      groupPolicy: "open",
      groups: {
        "*": { requireMention: false, allowFrom: ["*"] },
      },
    },
  },
}
```

## 보안 참고 사항 (공개 채널에 권장)

공개 채널에서 `allowFrom: ["*"]`을 허용하는 경우 누구나 봇에게 프롬프트를 보낼 수 있습니다.
위험을 줄이기 위해 해당 채널의 도구를 제한하세요.

### 채널의 모든 사람에게 동일한 도구

```json5
{
  channels: {
    irc: {
      groups: {
        "#tuirc-dev": {
          allowFrom: ["*"],
          tools: {
            deny: ["group:runtime", "group:fs", "gateway", "nodes", "cron", "browser"],
          },
        },
      },
    },
  },
}
```

### 발신자별 다른 도구 (소유자는 더 많은 권한)

`toolsBySender`를 사용하여 `"*"`에는 더 엄격한 정책을, 본인 nick에는 더 느슨한 정책을 적용합니다:

```json5
{
  channels: {
    irc: {
      groups: {
        "#tuirc-dev": {
          allowFrom: ["*"],
          toolsBySender: {
            "*": {
              deny: ["group:runtime", "group:fs", "gateway", "nodes", "cron", "browser"],
            },
            "id:eigen": {
              deny: ["gateway", "nodes", "cron"],
            },
          },
        },
      },
    },
  },
}
```

참고:

- `toolsBySender` 키는 IRC 발신자 신원 값에 `id:`를 사용해야 합니다:
  `id:eigen` 또는 더 강한 매칭을 위해 `id:eigen!~eigen@174.127.248.171`.
- 레거시 접두사 없는 키도 여전히 수락되며 `id:`로만 매칭됩니다.
- 첫 번째로 매칭되는 발신자 정책이 승리하며, `"*"`는 와일드카드 폴백입니다.

그룹 접근 대 멘션 게이팅(그리고 이들이 상호작용하는 방식)에 대한 자세한 내용은 [/channels/groups](/channels/groups)를 참조하세요.

## NickServ

연결 후 NickServ로 식별하려면:

```json5
{
  channels: {
    irc: {
      nickserv: {
        enabled: true,
        service: "NickServ",
        password: "your-nickserv-password",
      },
    },
  },
}
```

연결 시 선택적 일회성 등록:

```json5
{
  channels: {
    irc: {
      nickserv: {
        register: true,
        registerEmail: "bot@example.com",
      },
    },
  },
}
```

nick이 등록된 후에는 반복된 REGISTER 시도를 피하기 위해 `register`를 비활성화하세요.

## 환경 변수

기본 계정은 다음을 지원합니다:

- `IRC_HOST`
- `IRC_PORT`
- `IRC_TLS`
- `IRC_NICK`
- `IRC_USERNAME`
- `IRC_REALNAME`
- `IRC_PASSWORD`
- `IRC_CHANNELS` (쉼표로 구분)
- `IRC_NICKSERV_PASSWORD`
- `IRC_NICKSERV_REGISTER_EMAIL`

`IRC_HOST`는 워크스페이스 `.env`에서 설정할 수 없습니다. [워크스페이스 `.env` 파일](/gateway/security/)을 참조하세요.

## 문제 해결

- 봇이 연결되지만 채널에서 응답하지 않는 경우, `channels.irc.groups` **그리고** 멘션 게이팅이 메시지를 드롭하고 있는지(`missing-mention`) 확인하세요. 핑 없이 응답하도록 하려면 해당 채널에 `requireMention:false`를 설정합니다.
- 로그인에 실패하면 nick 가용성과 서버 비밀번호를 확인합니다.
- 커스텀 네트워크에서 TLS가 실패하면 host/port 및 인증서 설정을 확인합니다.

## 관련

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 플로우
- [그룹](/channels/groups) — 그룹 채팅 동작 및 멘션 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지용 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
