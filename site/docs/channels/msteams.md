---
title: "Microsoft Teams"
description: "Microsoft Teams 채널 설정 및 구성"
---

# Microsoft Teams

OpenClaw는 Microsoft Teams 채널을 통한 메시지를 지원합니다.

> **페어링**
> Teams DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

Microsoft Teams 봇을 설정하려면 Azure Bot Service 등록이 필요합니다.

1. **Azure Bot 등록**

   [Azure Portal](https://portal.azure.com)에서 새 Bot Service 리소스를 생성합니다.
   
       - 봇 ID 및 비밀번호 (앱 ID 및 앱 비밀번호)를 기록합니다.
       - 메시지 엔드포인트를 게이트웨이 URL로 설정합니다.


  2. **Microsoft Teams 채널 활성화**

   Azure Bot 리소스에서 채널을 클릭하고 Microsoft Teams를 활성화합니다.


  3. **OpenClaw 구성**

   ```json5
   {
     channels: {
       msteams: {
         enabled: true,
         appId: "your-app-id",
         appPassword: "your-app-password",
         dmPolicy: "pairing",
       },
     },
   }
   ```
   
       환경 변수 폴백:
   
   ```bash
   MSTEAMS_APP_ID=your-app-id
   MSTEAMS_APP_PASSWORD=your-app-password
   ```


  4. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

`channels.msteams.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

그룹 접근:

- `channels.msteams.groupPolicy`: `open | allowlist | disabled`

## 런타임 동작

- Microsoft Teams는 봇 프레임워크 웹훅을 통해 작동합니다.
- 게이트웨이는 Teams 플랫폼의 인바운드 이벤트를 수신합니다.
- 메시지 라우팅은 결정적입니다.

## 구성 참조

- `channels.msteams.enabled`: 채널 활성화/비활성화.
- `channels.msteams.appId`: Azure Bot 애플리케이션 ID.
- `channels.msteams.appPassword`: Azure Bot 애플리케이션 비밀번호.
- `channels.msteams.dmPolicy`: DM 접근 정책.
- `channels.msteams.allowFrom`: 허용된 사용자 ID 목록.
- `channels.msteams.groupPolicy`: 팀/채널 접근 정책.
- `channels.msteams.webhookPath`: 웹훅 수신 경로 (기본값 `/msteams/events`).

## 관련 문서

- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
