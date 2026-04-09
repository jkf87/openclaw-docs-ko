---
title: "Twitch"
description: "Twitch 채팅 채널 설정 및 구성"
---

# Twitch

OpenClaw는 Twitch 채팅 채널을 통한 메시지를 지원합니다.

> **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


  > **게이트웨이 구성**
> 전체 채널 구성 패턴 및 예시.


## 설정

Twitch 봇을 설정하려면 봇 계정과 OAuth 토큰이 필요합니다.

1. **Twitch 봇 계정 준비**

   봇 전용 Twitch 계정을 만들거나 기존 계정을 사용합니다.
   
       [Twitch Chat OAuth 비밀번호 생성기](https://twitchapps.com/tmi/)를 사용하여 OAuth 토큰을 생성합니다 (`oauth:...` 형식).


  2. **OpenClaw 구성**

   ```json5
   {
     channels: {
       twitch: {
         enabled: true,
         username: "your-bot-username",
         oauthToken: "oauth:your-token",
         channels: ["channel1", "channel2"],
         dmPolicy: "open",
       },
     },
   }
   ```
   
       환경 변수 폴백:
   
   ```bash
   TWITCH_USERNAME=your-bot-username
   TWITCH_OAUTH_TOKEN=oauth:your-token
   ```


  3. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

`channels.twitch.dmPolicy`는 DM(Twitch 위스퍼) 접근을 제어합니다:

- `open` (기본값)
- `allowlist`
- `pairing`
- `disabled`

그룹(채팅) 접근:

- `channels.twitch.groupPolicy`: `open | allowlist | disabled`
- `channels.twitch.channels`: 참여할 Twitch 채널 목록

## 런타임 동작

- Twitch는 IRC 기반 채팅 프로토콜을 통해 작동합니다.
- 봇은 구성된 채널에 참여하고 채팅 메시지를 수신합니다.
- 그룹 채팅 메시지는 기본적으로 언급 게이팅됩니다.

## 구성 참조

- `channels.twitch.enabled`: 채널 활성화/비활성화.
- `channels.twitch.username`: 봇 Twitch 사용자 이름.
- `channels.twitch.oauthToken`: Twitch OAuth 토큰 (`oauth:...` 형식).
- `channels.twitch.channels`: 참여할 Twitch 채널 목록.
- `channels.twitch.dmPolicy`: 위스퍼(DM) 접근 정책.
- `channels.twitch.groupPolicy`: 채팅 채널 접근 정책.
- `channels.twitch.allowFrom`: 허용된 Twitch 사용자 이름 목록.
- `channels.twitch.requireMention`: 채팅에서 언급 필요 여부.

## 관련 문서

- [채널 문제 해결](/channels/troubleshooting)
- [구성](/gateway/configuration)
