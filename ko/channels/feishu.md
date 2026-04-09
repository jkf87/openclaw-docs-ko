---
summary: "Feishu/Lark 채널 설정 및 구성"
read_when:
  - Feishu 또는 Lark 채널 설정 시
title: "Feishu"
---

# Feishu (飞书 / Lark)

OpenClaw는 Feishu(비국제 버전) 및 Lark(국제 버전)를 통한 메시지를 지원합니다.

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Feishu DM 접근은 페어링 또는 허용 목록으로 제어됩니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 플레이북.
  </Card>
</CardGroup>

## 설정

Feishu 봇을 설정하려면 Feishu 오픈 플랫폼에서 앱을 등록해야 합니다.

<Steps>
  <Step title="Feishu 오픈 플랫폼에서 앱 생성">
    [Feishu 오픈 플랫폼](https://open.feishu.cn)에서 새 앱을 생성합니다.

    앱 ID 및 앱 시크릿을 저장합니다.
  </Step>

  <Step title="이벤트 구독 구성">
    앱 구성에서 이벤트 구독을 활성화하고 이벤트 콜백 URL을 게이트웨이 URL로 설정합니다.
  </Step>

  <Step title="OpenClaw 구성">

```json5
{
  channels: {
    feishu: {
      enabled: true,
      appId: "cli_xxx",
      appSecret: "your-app-secret",
      verificationToken: "your-verification-token",
      dmPolicy: "pairing",
    },
  },
}
```

    환경 변수 폴백:

```bash
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=your-app-secret
FEISHU_VERIFICATION_TOKEN=your-token
```

  </Step>

  <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

  </Step>
</Steps>

## 접근 제어

`channels.feishu.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

그룹 접근:

- `channels.feishu.groupPolicy`: `open | allowlist | disabled`

## 구성 참조

- `channels.feishu.enabled`: 채널 활성화/비활성화.
- `channels.feishu.appId`: Feishu 앱 ID.
- `channels.feishu.appSecret`: Feishu 앱 시크릿.
- `channels.feishu.verificationToken`: 이벤트 검증 토큰.
- `channels.feishu.encryptKey`: 이벤트 암호화 키 (선택 사항).
- `channels.feishu.dmPolicy`: DM 접근 정책.
- `channels.feishu.allowFrom`: 허용된 사용자 ID 목록.
- `channels.feishu.groupPolicy`: 그룹/채널 접근 정책.
- `channels.feishu.webhookPath`: 웹훅 수신 경로.

## 관련 문서

- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
