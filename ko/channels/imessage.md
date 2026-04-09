---
summary: "macOS의 iMessage 채널 설정 (레거시 방법)"
read_when:
  - macOS에서 iMessage 채널 설정 시
title: "iMessage"
---

# iMessage (레거시)

iMessage 지원은 macOS의 Messages.app 자동화를 통해 제공됩니다.

<Note>
iMessage 설정을 위한 권장 방법은 [BlueBubbles](/channels/bluebubbles)입니다. BlueBubbles는 더 안정적이고 macOS의 직접 Messages.app 자동화에 의존하지 않습니다.
</Note>

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    iMessage DM 접근은 페어링 또는 허용 목록으로 제어됩니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 플레이북.
  </Card>
</CardGroup>

## 설정

iMessage 레거시 방법은 macOS의 Messages.app 자동화를 사용합니다.

<Steps>
  <Step title="macOS 권한 구성">
    **시스템 환경설정 → 개인 정보 보호 및 보안 → 자동화**로 이동합니다.

    OpenClaw(또는 게이트웨이 프로세스)에게 Messages.app 제어 권한을 부여합니다.
  </Step>

  <Step title="OpenClaw 구성">

```json5
{
  channels: {
    imessage: {
      enabled: true,
      dmPolicy: "pairing",
    },
  },
}
```

  </Step>

  <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

  </Step>
</Steps>

## 접근 제어

`channels.imessage.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

## 런타임 동작

- iMessage는 macOS의 Messages.app 자동화를 통해 작동합니다.
- 인바운드 메시지 수신을 위해 macOS 개인 정보 권한이 필요합니다.
- 게이트웨이는 macOS에서 실행되어야 합니다.

## 문제 해결

<AccordionGroup>
  <Accordion title="인바운드 이벤트 없음">

    - macOS **시스템 환경설정 → 개인 정보 보호 및 보안 → 자동화**에서 Messages 자동화 권한 확인
    - TCC 권한을 재부여하고 채널 프로세스를 재시작합니다.

  </Accordion>

  <Accordion title="보낼 수 있지만 수신 안 됨">

    - Messages 자동화를 위한 macOS 개인 정보 권한 확인
    - TCC 권한을 재부여하고 채널 프로세스를 재시작합니다.

  </Accordion>

  <Accordion title="DM 발신자 차단됨">

    - `openclaw pairing list imessage`로 대기 중인 페어링 확인
    - `openclaw pairing approve imessage <CODE>`로 발신자 승인

  </Accordion>
</AccordionGroup>

## 관련 문서

- [BlueBubbles](/channels/bluebubbles) - 권장 iMessage 방법
- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
