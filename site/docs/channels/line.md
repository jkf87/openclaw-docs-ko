---
title: "LINE"
description: "LINE 메신저 채널 설정 및 구성"
---

# LINE

OpenClaw는 LINE 메신저 봇을 통한 메시지를 지원합니다.

> **페어링**
> LINE DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

LINE 봇을 설정하려면 [LINE Developers Console](https://developers.line.biz)에서 제공자 및 채널을 생성해야 합니다.

1. **LINE Developers에서 봇 채널 생성**

   LINE Developers Console에서 새 제공자를 생성하고 Messaging API 채널을 추가합니다.
   
       채널 액세스 토큰 및 채널 시크릿을 저장합니다.


  2. **웹훅 URL 설정**

   LINE Developers Console에서 웹훅 URL을 게이트웨이 URL로 설정합니다:
   
       `https://your-gateway-host/line/events`


  3. **OpenClaw 구성**

   ```json5
   {
     channels: {
       line: {
         enabled: true,
         channelAccessToken: "your-channel-access-token",
         channelSecret: "your-channel-secret",
         dmPolicy: "pairing",
       },
     },
   }
   ```
   
       환경 변수 폴백:
   
   ```bash
   LINE_CHANNEL_ACCESS_TOKEN=your-token
   LINE_CHANNEL_SECRET=your-secret
   ```


  4. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

`channels.line.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

그룹 접근:

- `channels.line.groupPolicy`: `open | allowlist | disabled`

## 런타임 동작

- LINE은 웹훅 이벤트를 통해 작동합니다.
- 게이트웨이는 LINE 플랫폼의 인바운드 이벤트를 수신합니다.
- 그룹 메시지는 기본적으로 언급 게이팅됩니다.

## 구성 참조

- `channels.line.enabled`: 채널 활성화/비활성화.
- `channels.line.channelAccessToken`: LINE 채널 액세스 토큰.
- `channels.line.channelSecret`: LINE 채널 시크릿.
- `channels.line.dmPolicy`: DM 접근 정책.
- `channels.line.allowFrom`: 허용된 사용자 ID 목록.
- `channels.line.groupPolicy`: 그룹 접근 정책.
- `channels.line.webhookPath`: 웹훅 수신 경로.

## 관련 문서

- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
