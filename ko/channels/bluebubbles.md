---
summary: "BlueBubbles 서버를 통한 iMessage 채널 설정"
read_when:
  - BlueBubbles를 통한 iMessage 채널 설정 시
title: "BlueBubbles"
---

# BlueBubbles (iMessage)

BlueBubbles는 macOS의 iMessage에 접근하기 위한 권장 방법입니다. macOS에서 실행되는 별도의 서버 앱을 통해 작동합니다.

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    BlueBubbles DM 접근은 페어링 또는 허용 목록으로 제어됩니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 플레이북.
  </Card>
</CardGroup>

## 설정

<Steps>
  <Step title="BlueBubbles 서버 설치">
    macOS에서 [BlueBubbles 서버](https://bluebubbles.app)를 다운로드하여 설치합니다.

    서버를 시작하고 구성 단계를 완료합니다.
  </Step>

  <Step title="웹훅 구성">
    BlueBubbles 서버 설정에서 웹훅 URL을 OpenClaw 게이트웨이 URL로 설정합니다:

    `http://localhost:8788/bluebubbles/events` (또는 게이트웨이 URL)

    비밀번호를 기록합니다.
  </Step>

  <Step title="OpenClaw 구성">

```json5
{
  channels: {
    bluebubbles: {
      enabled: true,
      serverUrl: "http://localhost:1234",
      password: "your-bluebubbles-password",
      dmPolicy: "pairing",
    },
  },
}
```

    환경 변수 폴백:

```bash
BLUEBUBBLES_SERVER_URL=http://localhost:1234
BLUEBUBBLES_PASSWORD=your-password
```

  </Step>

  <Step title="게이트웨이 시작 및 첫 번째 DM 승인">

```bash
openclaw gateway
openclaw pairing list bluebubbles
openclaw pairing approve bluebubbles <CODE>
```

  </Step>
</Steps>

## 접근 제어

`channels.bluebubbles.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

`channels.bluebubbles.allowFrom`은 E.164 형식의 전화번호 또는 이메일 주소를 허용합니다.

## 런타임 동작

- BlueBubbles는 게이트웨이와 BlueBubbles 서버 앱 간의 웹훅을 통해 작동합니다.
- BlueBubbles 서버가 macOS에서 실행되어야 합니다.
- 게이트웨이는 다른 컴퓨터에서 실행될 수 있습니다.

## 구성 참조

- `channels.bluebubbles.enabled`: 채널 활성화/비활성화.
- `channels.bluebubbles.serverUrl`: BlueBubbles 서버 URL.
- `channels.bluebubbles.password`: BlueBubbles 서버 비밀번호.
- `channels.bluebubbles.dmPolicy`: DM 접근 정책.
- `channels.bluebubbles.allowFrom`: 허용된 발신자 목록 (전화번호/이메일).
- `channels.bluebubbles.webhookPath`: 웹훅 수신 경로.

## 문제 해결

<AccordionGroup>
  <Accordion title="인바운드 이벤트 없음">

    - BlueBubbles 서버 URL 및 비밀번호 확인
    - 웹훅 URL이 올바르게 구성되었는지 확인
    - BlueBubbles 서버 상태 확인

  </Accordion>

  <Accordion title="DM 발신자 차단됨">

    - `openclaw pairing list bluebubbles`로 대기 중인 페어링 확인
    - `openclaw pairing approve bluebubbles <CODE>`로 발신자 승인

  </Accordion>
</AccordionGroup>

## 관련 문서

- [iMessage](/channels/imessage) - 레거시 iMessage 방법
- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
