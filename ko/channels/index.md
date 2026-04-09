---
summary: "OpenClaw이 연결할 수 있는 메시징 플랫폼"
read_when:
  - OpenClaw에서 사용할 채팅 채널을 선택하려는 경우
  - 지원되는 메시징 플랫폼을 빠르게 파악하려는 경우
title: "채팅 채널"
---

# 채팅 채널

OpenClaw는 이미 사용 중인 채팅 앱과 통신할 수 있습니다. 각 채널은 게이트웨이를 통해 연결됩니다.
텍스트는 모든 채널에서 지원되며, 미디어 및 반응 기능은 채널마다 다릅니다.

## 지원되는 채널

- [BlueBubbles](/channels/bluebubbles) — **iMessage에 권장**; 전체 기능을 지원하는 BlueBubbles macOS 서버 REST API를 사용합니다(번들 플러그인; 편집, 전송 취소, 효과, 반응, 그룹 관리 — macOS 26 Tahoe에서 편집 기능 현재 작동 불가).
- [Discord](/channels/discord) — Discord Bot API + 게이트웨이; 서버, 채널, DM을 지원합니다.
- [Feishu](/channels/feishu) — WebSocket을 통한 Feishu/Lark 봇(번들 플러그인).
- [Google Chat](/channels/googlechat) — HTTP 웹훅을 통한 Google Chat API 앱.
- [iMessage (레거시)](/channels/imessage) — imsg CLI를 통한 레거시 macOS 연동(더 이상 사용되지 않음, 새 설정에는 BlueBubbles 사용 권장).
- [IRC](/channels/irc) — 클래식 IRC 서버; 채널 + DM, 페어링/허용 목록 제어.
- [LINE](/channels/line) — LINE Messaging API 봇(번들 플러그인).
- [Matrix](/channels/matrix) — Matrix 프로토콜(번들 플러그인).
- [Mattermost](/channels/mattermost) — Bot API + WebSocket; 채널, 그룹, DM(번들 플러그인).
- [Microsoft Teams](/channels/msteams) — Bot Framework; 엔터프라이즈 지원(번들 플러그인).
- [Nextcloud Talk](/channels/nextcloud-talk) — Nextcloud Talk를 통한 자체 호스팅 채팅(번들 플러그인).
- [Nostr](/channels/nostr) — NIP-04를 통한 분산형 DM(번들 플러그인).
- [QQ Bot](/channels/qqbot) — QQ Bot API; 개인 채팅, 그룹 채팅, 리치 미디어(번들 플러그인).
- [Signal](/channels/signal) — signal-cli; 프라이버시 중심.
- [Slack](/channels/slack) — Bolt SDK; 워크스페이스 앱.
- [Synology Chat](/channels/synology-chat) — 발신/수신 웹훅을 통한 Synology NAS Chat(번들 플러그인).
- [Telegram](/channels/telegram) — grammY를 통한 Bot API; 그룹을 지원합니다.
- [Tlon](/channels/tlon) — Urbit 기반 메신저(번들 플러그인).
- [Twitch](/channels/twitch) — IRC 연결을 통한 Twitch 채팅(번들 플러그인).
- [음성 통화](/plugins/voice-call) — Plivo 또는 Twilio를 통한 전화(플러그인, 별도 설치 필요).
- [WebChat](/web/webchat) — WebSocket을 통한 게이트웨이 WebChat UI.
- [WeChat](https://www.npmjs.com/package/@tencent-weixin/openclaw-weixin) — QR 로그인을 통한 Tencent iLink 봇 플러그인; 개인 채팅만 지원.
- [WhatsApp](/channels/whatsapp) — 가장 인기 있는 채널; Baileys를 사용하며 QR 페어링이 필요합니다.
- [Zalo](/channels/zalo) — Zalo Bot API; 베트남의 인기 메신저(번들 플러그인).
- [Zalo 개인](/channels/zalouser) — QR 로그인을 통한 Zalo 개인 계정(번들 플러그인).

## 참고 사항

- 채널은 동시에 실행할 수 있습니다. 여러 채널을 구성하면 OpenClaw가 채팅별로 라우팅합니다.
- 가장 빠른 설정은 일반적으로 **Telegram**입니다(간단한 봇 토큰). WhatsApp은 QR 페어링이 필요하고
  디스크에 더 많은 상태를 저장합니다.
- 그룹 동작은 채널마다 다릅니다. [그룹](/channels/groups)을 참조하십시오.
- DM 페어링 및 허용 목록은 보안을 위해 적용됩니다. [보안](/gateway/security)을 참조하십시오.
- 문제 해결: [채널 문제 해결](/channels/troubleshooting).
- 모델 프로바이더는 별도로 문서화되어 있습니다. [모델 프로바이더](/providers/models)를 참조하십시오.
