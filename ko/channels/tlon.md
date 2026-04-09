---
summary: "Tlon/Urbit 채널 설정 및 구성"
read_when:
  - Tlon 또는 Urbit 채널 설정 시
title: "Tlon"
---

# Tlon (Urbit)

OpenClaw는 Tlon 앱(Urbit 기반 채팅 플랫폼)을 통한 메시지를 지원합니다.

<CardGroup cols={2}>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 플레이북.
  </Card>
  <Card title="게이트웨이 구성" icon="settings" href="/gateway/configuration">
    전체 채널 구성 패턴 및 예시.
  </Card>
</CardGroup>

## 설정

Tlon 채널을 설정하려면 Urbit 노드(선박)가 필요합니다.

<Steps>
  <Step title="Urbit 선박 준비">
    실행 중인 Urbit 선박이 있는지 확인합니다 (혜성, 행성, 달, 별 또는 은하).

    Urbit 웹 UI URL 및 접근 코드를 메모합니다.
  </Step>

  <Step title="OpenClaw 구성">

```json5
{
  channels: {
    tlon: {
      enabled: true,
      shipUrl: "http://localhost:8080",
      code: "your-access-code",
      dmPolicy: "pairing",
    },
  },
}
```

    환경 변수 폴백:

```bash
TLON_SHIP_URL=http://localhost:8080
TLON_CODE=your-access-code
```

  </Step>

  <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

  </Step>
</Steps>

## 접근 제어

`channels.tlon.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

`channels.tlon.allowFrom`은 `~sampel-palnet` 형식의 Urbit 포인트를 허용합니다.

## 런타임 동작

- Tlon은 Urbit의 HTTP API를 통해 작동합니다.
- 봇은 DM 및 그룹 채팅(갤럭시)에 참여할 수 있습니다.

## 구성 참조

- `channels.tlon.enabled`: 채널 활성화/비활성화.
- `channels.tlon.shipUrl`: Urbit 선박 URL.
- `channels.tlon.code`: Urbit 선박 접근 코드.
- `channels.tlon.dmPolicy`: DM 접근 정책.
- `channels.tlon.allowFrom`: 허용된 Urbit 포인트 목록 (`~sampel-palnet` 형식).

## 관련 문서

- [채널 문제 해결](/channels/troubleshooting)
