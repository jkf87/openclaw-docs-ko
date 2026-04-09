---
title: "Google Chat"
description: "Google Chat 채널 설정 및 구성"
---

# Google Chat

OpenClaw는 Google Chat 봇 및 채널을 통한 메시지를 지원합니다.

> **페어링**
> Google Chat DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

Google Chat 봇을 설정하려면 Google Cloud 프로젝트 및 서비스 계정이 필요합니다.

1. **Google Cloud 프로젝트 설정**

   [Google Cloud Console](https://console.cloud.google.com)에서 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.
   
       Google Chat API를 활성화합니다.


  2. **봇 구성**

   Google Chat API 구성 페이지에서 봇 이름과 아바타를 설정합니다.
   
       연결 설정에서 HTTP 엔드포인트 URL을 게이트웨이 URL로 설정합니다.


  3. **서비스 계정 자격 증명 구성**

   서비스 계정 JSON 키를 다운로드합니다.
   
   ```json5
   {
     channels: {
       googlechat: {
         enabled: true,
         serviceAccountKeyFile: "/path/to/service-account.json",
         dmPolicy: "pairing",
       },
     },
   }
   ```


  4. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

`channels.googlechat.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

그룹 접근:

- `channels.googlechat.groupPolicy`: `open | allowlist | disabled`

## 런타임 동작

- Google Chat은 HTTP 웹훅 이벤트를 통해 작동합니다.
- 게이트웨이는 Google Chat 플랫폼의 인바운드 이벤트를 수신합니다.

## 구성 참조

- `channels.googlechat.enabled`: 채널 활성화/비활성화.
- `channels.googlechat.serviceAccountKeyFile`: 서비스 계정 JSON 키 파일 경로.
- `channels.googlechat.dmPolicy`: DM 접근 정책.
- `channels.googlechat.allowFrom`: 허용된 사용자 ID 목록.
- `channels.googlechat.groupPolicy`: 그룹/스페이스 접근 정책.
- `channels.googlechat.webhookPath`: 웹훅 수신 경로.

## 관련 문서

- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
