---
title: "Synology Chat"
description: "Synology Chat 채널 설정 및 구성"
---

# Synology Chat

OpenClaw는 Synology Chat을 통한 메시지를 지원합니다.

> **페어링**
> Synology Chat DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

Synology Chat 봇을 설정하려면 Synology NAS에서 Chat 앱이 설치되어 있어야 합니다.

1. **Synology Chat에서 봇 생성**

   Synology Chat 설정 → 통합 → 봇으로 이동합니다.
   
       새 봇을 생성하고 수신 웹훅 URL 및 발신 웹훅 URL을 구성합니다.
   
       봇 토큰을 저장합니다.


  2. **OpenClaw 구성**

   ```json5
   {
     channels: {
       "synology-chat": {
         enabled: true,
         token: "your-bot-token",
         incomingWebhookUrl: "https://your-nas/webapi/entry.cgi?...",
         dmPolicy: "pairing",
       },
     },
   }
   ```
   
       환경 변수 폴백:
   
   ```bash
   SYNOLOGY_CHAT_TOKEN=your-bot-token
   SYNOLOGY_CHAT_INCOMING_WEBHOOK_URL=https://...
   ```


  3. **게이트웨이 시작**

   ```bash
   openclaw gateway
   ```


## 접근 제어

DM 접근 정책:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

## 구성 참조

- `channels["synology-chat"].enabled`: 채널 활성화/비활성화.
- `channels["synology-chat"].token`: Synology Chat 봇 토큰.
- `channels["synology-chat"].incomingWebhookUrl`: 발신 메시지를 위한 Synology 수신 웹훅 URL.
- `channels["synology-chat"].dmPolicy`: DM 접근 정책.
- `channels["synology-chat"].allowFrom`: 허용된 사용자 ID 목록.
- `channels["synology-chat"].webhookPath`: 수신 이벤트 경로.

## 관련 문서

- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
