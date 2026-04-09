---
summary: "Nostr 프로토콜 채널 설정 및 구성"
read_when:
  - Nostr 채널 설정 시
title: "Nostr"
---

# Nostr

OpenClaw는 Nostr 분산형 소셜 프로토콜을 통한 메시지를 지원합니다.

<CardGroup cols={2}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    Nostr DM 접근은 페어링 또는 허용 목록으로 제어됩니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 수리 플레이북.
  </Card>
</CardGroup>

## 설정

Nostr 봇 키 쌍을 생성하거나 기존 비공개 키를 사용합니다.

<Steps>
  <Step title="Nostr 키 준비">
    새 키 쌍을 생성하거나 기존 비공개 키(nsec 또는 16진수 형식)를 사용합니다.
  </Step>

  <Step title="OpenClaw 구성">

```json5
{
  channels: {
    nostr: {
      enabled: true,
      privateKey: "nsec1...",
      relays: [
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.nostr.band",
      ],
      dmPolicy: "pairing",
    },
  },
}
```

    환경 변수 폴백:

```bash
NOSTR_PRIVATE_KEY=nsec1...
```

  </Step>

  <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

  </Step>
</Steps>

## 접근 제어

`channels.nostr.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

`channels.nostr.allowFrom`은 npub 또는 16진수 형식의 공개 키를 허용합니다.

## 런타임 동작

- Nostr는 여러 릴레이에 WebSocket을 통해 연결합니다.
- 봇은 암호화된 DM(NIP-04 또는 NIP-17) 및 공개 언급을 수신합니다.
- 메시지는 구성된 릴레이를 통해 전송됩니다.

## 구성 참조

- `channels.nostr.enabled`: 채널 활성화/비활성화.
- `channels.nostr.privateKey`: Nostr 비공개 키 (nsec 또는 16진수 형식).
- `channels.nostr.relays`: 연결할 릴레이 URL 목록.
- `channels.nostr.dmPolicy`: DM 접근 정책.
- `channels.nostr.allowFrom`: 허용된 공개 키 목록.

## 관련 문서

- [페어링](/channels/pairing)
- [채널 문제 해결](/channels/troubleshooting)
