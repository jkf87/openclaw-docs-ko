---
title: "QQ Bot"
description: "QQ Bot 채널 설정 및 구성"
---

# QQ Bot

OpenClaw는 QQ 오픈 플랫폼을 통한 QQ Bot을 지원합니다.

> **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


  > **게이트웨이 구성**
> 전체 채널 구성 패턴 및 예시.


## 설정

QQ Bot을 설정하려면 [QQ 오픈 플랫폼](https://q.qq.com)에서 앱을 등록해야 합니다.

1. **QQ 오픈 플랫폼에서 앱 생성**

   QQ 오픈 플랫폼에서 새 봇 앱을 생성합니다.
   
       앱 ID 및 클라이언트 시크릿을 저장합니다.


  2. **OpenClaw 구성**

   ```json5
   {
     channels: {
       qqbot: {
         enabled: true,
         appId: "your-app-id",
         clientSecret: "your-client-secret",
         dmPolicy: "open",
       },
     },
   }
   ```
   
       환경 변수 폴백:
   
   ```bash
   QQBOT_APP_ID=your-app-id
   QQBOT_CLIENT_SECRET=your-client-secret
   ```


  3. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

`channels.qqbot.dmPolicy`는 DM 접근을 제어합니다:

- `open`
- `allowlist`
- `pairing`
- `disabled`

그룹 접근:

- `channels.qqbot.groupPolicy`: `open | allowlist | disabled`

## 런타임 동작

- QQ Bot은 QQ 오픈 플랫폼 WebSocket 게이트웨이를 통해 작동합니다.
- 봇은 공개 채널, 그룹 및 DM 메시지를 수신합니다.
- QQ는 최근 상호 작용 없이 봇이 시작한 메시지를 차단할 수 있습니다.

## 음성 트랜스크립션

QQ Bot은 음성 메시지 트랜스크립션을 지원합니다:

- `channels.qqbot.stt` 또는 `tools.media.audio`에서 STT 프로바이더를 구성합니다.

## 구성 참조

- `channels.qqbot.enabled`: 채널 활성화/비활성화.
- `channels.qqbot.appId`: QQ 오픈 플랫폼 앱 ID.
- `channels.qqbot.clientSecret`: QQ 클라이언트 시크릿.
- `channels.qqbot.dmPolicy`: DM 접근 정책.
- `channels.qqbot.allowFrom`: 허용된 사용자 ID 목록.
- `channels.qqbot.groupPolicy`: 그룹/채널 접근 정책.
- `channels.qqbot.stt`: 음성-텍스트 변환 구성.

## 문제 해결

::: details 봇이 'gone to Mars' 응답
- 구성에서 `appId` 및 `clientSecret` 확인
    - 자격 증명을 설정하거나 게이트웨이를 재시작합니다.
:::


  ::: details 인바운드 메시지 없음
- `openclaw channels status --probe`로 연결 상태 확인
    - QQ 오픈 플랫폼에서 자격 증명 확인
:::


  ::: details 음성 트랜스크립트 없음
- STT 프로바이더 구성 확인
    - `channels.qqbot.stt` 또는 `tools.media.audio`를 구성합니다.
:::

## 관련 문서

- [채널 문제 해결](/channels/troubleshooting)
- [구성](/gateway/configuration)
