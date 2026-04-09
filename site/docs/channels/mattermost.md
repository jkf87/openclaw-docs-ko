---
title: "Mattermost"
description: "Mattermost 채널 설정 및 구성"
---

# Mattermost

OpenClaw는 Mattermost 워크스페이스와의 통합을 지원합니다.

> **페어링**
> Mattermost DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

1. **Mattermost 봇 계정 생성**

   Mattermost 관리 콘솔에서 봇 계정을 생성하거나 시스템 계정으로 봇을 구성합니다.
   
       봇 토큰을 저장합니다.


  2. **OpenClaw 구성**

   ```json5
   {
     channels: {
       mattermost: {
         enabled: true,
         serverUrl: "https://mattermost.example.com",
         token: "your-bot-token",
         dmPolicy: "pairing",
       },
     },
   }
   ```
   
       환경 변수 폴백:
   
   ```bash
   MATTERMOST_SERVER_URL=https://mattermost.example.com
   MATTERMOST_TOKEN=your-bot-token
   ```


  3. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

`channels.mattermost.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

그룹 접근:

- `channels.mattermost.groupPolicy`: `open | allowlist | disabled`
- `channels.mattermost.teams`: 허용된 팀 ID 맵
- `channels.mattermost.channels`: 허용된 채널 ID 맵

## 런타임 동작

- Mattermost는 웹소켓 또는 웹훅 이벤트를 통해 작동합니다.
- 게이트웨이는 Mattermost 서버에서 이벤트를 수신합니다.
- 그룹 채널 메시지는 기본적으로 언급 게이팅됩니다.

## 구성 참조

- `channels.mattermost.enabled`: 채널 활성화/비활성화.
- `channels.mattermost.serverUrl`: Mattermost 서버 URL.
- `channels.mattermost.token`: 봇 계정 토큰.
- `channels.mattermost.dmPolicy`: DM 접근 정책.
- `channels.mattermost.allowFrom`: 허용된 사용자 ID 목록.
- `channels.mattermost.groupPolicy`: 채널/팀 접근 정책.
- `channels.mattermost.teams`: 팀 허용 목록.
- `channels.mattermost.channels`: 채널 허용 목록.

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [채널 문제 해결](/channels/troubleshooting)
