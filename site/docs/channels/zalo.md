---
title: "Zalo"
description: "Zalo 공식 계정 채널 설정 및 구성"
---

# Zalo

OpenClaw는 Zalo 공식 계정(OA)을 통한 메시지를 지원합니다.

> **페어링**
> Zalo DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

Zalo OA 채널을 설정하려면 [Zalo Developers](https://developers.zalo.me)에서 공식 계정 앱을 등록해야 합니다.

1. **Zalo 공식 계정 생성**

   Zalo OA에서 공식 계정을 생성하고 개발자 포털에서 앱을 등록합니다.
   
       앱 ID, 시크릿 키 및 액세스 토큰을 저장합니다.


  2. **웹훅 URL 설정**

   Zalo 개발자 콘솔에서 웹훅 URL을 게이트웨이 URL로 설정합니다.


  3. **OpenClaw 구성**

   ```json5
   {
     channels: {
       zalo: {
         enabled: true,
         appId: "your-app-id",
         appSecret: "your-app-secret",
         accessToken: "your-access-token",
         dmPolicy: "pairing",
       },
     },
   }
   ```
   
       환경 변수 폴백:
   
   ```bash
   ZALO_APP_ID=your-app-id
   ZALO_APP_SECRET=your-app-secret
   ZALO_ACCESS_TOKEN=your-access-token
   ```


  4. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

`channels.zalo.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

## 구성 참조

- `channels.zalo.enabled`: 채널 활성화/비활성화.
- `channels.zalo.appId`: Zalo 앱 ID.
- `channels.zalo.appSecret`: Zalo 앱 시크릿.
- `channels.zalo.accessToken`: OA 액세스 토큰.
- `channels.zalo.dmPolicy`: DM 접근 정책.
- `channels.zalo.allowFrom`: 허용된 사용자 ID 목록.
- `channels.zalo.webhookPath`: 웹훅 수신 경로.

## 관련 문서

- [ZaloUser](/channels/zalouser) - 개인 Zalo 계정 채널
- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
