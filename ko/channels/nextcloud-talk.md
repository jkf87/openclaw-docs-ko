---
summary: "Nextcloud Talk 채널 설정 및 구성"
read_when:
  - Nextcloud Talk 채널 설정 시
title: "Nextcloud Talk"
---

# Nextcloud Talk

OpenClaw는 Nextcloud Talk를 통한 메시지를 지원합니다.

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Nextcloud Talk DM 접근은 페어링 또는 허용 목록으로 제어됩니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 플레이북.
  </Card>
</CardGroup>

## 설정

Nextcloud Talk 봇을 설정하려면 Nextcloud 인스턴스에 대한 액세스가 필요합니다.

<Steps>
  <Step title="Nextcloud Talk 봇 계정 생성">
    Nextcloud 관리자 계정으로 봇 전용 사용자 계정을 생성합니다.

    앱 비밀번호를 생성합니다.
  </Step>

  <Step title="OpenClaw 구성">

```json5
{
  channels: {
    "nextcloud-talk": {
      enabled: true,
      serverUrl: "https://nextcloud.example.com",
      username: "openclaw-bot",
      password: "your-app-password",
      dmPolicy: "pairing",
    },
  },
}
```

    환경 변수 폴백:

```bash
NEXTCLOUD_TALK_SERVER_URL=https://nextcloud.example.com
NEXTCLOUD_TALK_USERNAME=openclaw-bot
NEXTCLOUD_TALK_PASSWORD=your-app-password
```

  </Step>

  <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

  </Step>
</Steps>

## 접근 제어

DM 접근 정책:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

그룹/채팅 접근:

- `groupPolicy`: `open | allowlist | disabled`

## 구성 참조

- `channels["nextcloud-talk"].enabled`: 채널 활성화/비활성화.
- `channels["nextcloud-talk"].serverUrl`: Nextcloud 서버 URL.
- `channels["nextcloud-talk"].username`: 봇 사용자 이름.
- `channels["nextcloud-talk"].password`: 봇 비밀번호 또는 앱 비밀번호.
- `channels["nextcloud-talk"].dmPolicy`: DM 접근 정책.
- `channels["nextcloud-talk"].allowFrom`: 허용된 사용자 ID 목록.
- `channels["nextcloud-talk"].groupPolicy`: 그룹/채팅 접근 정책.

## 관련 문서

- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
