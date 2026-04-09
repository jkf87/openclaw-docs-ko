---
title: "IRC"
description: "IRC 채널 지원 - 연결, 채널, 닉네임 구성"
---

# IRC

OpenClaw는 IRC 서버 연결을 지원합니다.

> **페어링**
> IRC DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

```json5
{
  channels: {
    irc: {
      enabled: true,
      server: "irc.example.com",
      port: 6697,
      tls: true,
      nick: "openclaw-bot",
      channels: ["#general", "#help"],
      dmPolicy: "pairing",
    },
  },
}
```

환경 변수 폴백 (기본 계정):

```bash
IRC_SERVER=irc.example.com
IRC_NICK=openclaw-bot
IRC_PASSWORD=...
```

## 접근 제어

`channels.irc.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

그룹 접근:

- `channels.irc.groupPolicy`: `open | allowlist | disabled`
- `channels.irc.allowFrom`: 허용된 닉네임 목록

## 런타임 동작

- IRC는 게이트웨이 프로세스가 소유합니다.
- 봇은 구성된 IRC 서버에 연결하고 지정된 채널에 참여합니다.
- 그룹 메시지는 기본적으로 언급 게이팅됩니다.

## 구성 참조

- `channels.irc.enabled`: 채널 활성화/비활성화.
- `channels.irc.server`: IRC 서버 호스트명.
- `channels.irc.port`: 서버 포트 (TLS의 경우 기본값 6697, 비TLS의 경우 6667).
- `channels.irc.tls`: TLS 연결 활성화.
- `channels.irc.nick`: 봇 닉네임.
- `channels.irc.password`: 서버 또는 NickServ 비밀번호.
- `channels.irc.channels`: 참여할 채널 목록.
- `channels.irc.dmPolicy`: DM 접근 정책.
- `channels.irc.groupPolicy`: 그룹/채널 접근 정책.
- `channels.irc.allowFrom`: 허용된 닉네임 목록.
- `channels.irc.requireMention`: 채널 메시지에 언급 필요 여부.

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [채널 문제 해결](/channels/troubleshooting)
