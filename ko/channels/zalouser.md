---
summary: "Zalo 개인 사용자 계정 채널 설정 및 구성"
read_when:
  - Zalo 개인 계정 채널 설정 시
title: "ZaloUser"
---

# ZaloUser

ZaloUser는 공식 계정(OA)이 아닌 개인 Zalo 사용자 계정을 통한 메시지를 지원합니다.

<Note>
개인 계정 자동화 사용에 관한 Zalo의 서비스 약관을 검토하십시오. 공식 비즈니스 통합을 위해서는 [Zalo OA](/channels/zalo) 방법을 사용하십시오.
</Note>

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    ZaloUser DM 접근은 페어링 또는 허용 목록으로 제어됩니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 플레이북.
  </Card>
</CardGroup>

## 설정

<Steps>
  <Step title="Zalo 계정 자격 증명 준비">
    자동화에 사용할 전화번호와 비밀번호를 준비합니다.
  </Step>

  <Step title="OpenClaw 구성">

```json5
{
  channels: {
    zalouser: {
      enabled: true,
      phone: "+84xxxxxxxxx",
      password: "your-password",
      dmPolicy: "pairing",
    },
  },
}
```

  </Step>

  <Step title="게이트웨이 시작 및 로그인">

```bash
openclaw gateway
openclaw channels login zalouser
```

  </Step>
</Steps>

## 접근 제어

`channels.zalouser.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

## 구성 참조

- `channels.zalouser.enabled`: 채널 활성화/비활성화.
- `channels.zalouser.phone`: Zalo 전화번호 (E.164 형식).
- `channels.zalouser.password`: Zalo 계정 비밀번호.
- `channels.zalouser.dmPolicy`: DM 접근 정책.
- `channels.zalouser.allowFrom`: 허용된 사용자 ID 목록.

## 관련 문서

- [Zalo](/channels/zalo) - 공식 계정 채널
- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
