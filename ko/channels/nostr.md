---
summary: "NIP-04 암호화 메시지를 통한 Nostr DM 채널"
read_when:
  - OpenClaw가 Nostr를 통해 DM을 수신하도록 하려는 경우
  - 탈중앙화 메시징을 설정하는 경우
title: "Nostr"
---

**상태:** 선택적 번들 플러그인 (구성되기 전까지는 기본적으로 비활성화).

Nostr는 소셜 네트워킹을 위한 탈중앙화 프로토콜입니다. 이 채널은 OpenClaw가 NIP-04를 통해 암호화된 다이렉트 메시지(DM)를 수신하고 응답할 수 있게 합니다.

## 번들 플러그인

현재 OpenClaw 릴리스는 Nostr를 번들 플러그인으로 제공하므로, 일반적인 패키징된 빌드에서는 별도의 설치가 필요하지 않습니다.

### 구형/커스텀 설치

- 온보딩(`openclaw onboard`)과 `openclaw channels add`는 공유 채널 카탈로그에서 Nostr를 여전히 표시합니다.
- 빌드에서 번들된 Nostr를 제외하는 경우, 수동으로 설치합니다.

```bash
openclaw plugins install @openclaw/nostr
```

로컬 체크아웃을 사용합니다 (개발 워크플로):

```bash
openclaw plugins install --link <path-to-local-nostr-plugin>
```

플러그인을 설치하거나 활성화한 후 Gateway를 재시작하세요.

### 비대화형 설정

```bash
openclaw channels add --channel nostr --private-key "$NOSTR_PRIVATE_KEY"
openclaw channels add --channel nostr --private-key "$NOSTR_PRIVATE_KEY" --relay-urls "wss://relay.damus.io,wss://relay.primal.net"
```

키를 설정에 저장하는 대신 환경에 `NOSTR_PRIVATE_KEY`를 유지하려면 `--use-env`를 사용하세요.

## 빠른 설정

1. Nostr 키 쌍을 생성합니다 (필요한 경우):

```bash
# nak 사용
nak key generate
```

2. 설정에 추가합니다:

```json5
{
  channels: {
    nostr: {
      privateKey: "${NOSTR_PRIVATE_KEY}",
    },
  },
}
```

3. 키를 내보냅니다:

```bash
export NOSTR_PRIVATE_KEY="nsec1..."
```

4. Gateway를 재시작합니다.

## 구성 참조

| 키           | 타입     | 기본값                                      | 설명                                |
| ------------ | -------- | ------------------------------------------- | ----------------------------------- |
| `privateKey` | string   | 필수                                        | `nsec` 또는 hex 형식의 개인 키       |
| `relays`     | string[] | `['wss://relay.damus.io', 'wss://nos.lol']` | Relay URL (WebSocket)               |
| `dmPolicy`   | string   | `pairing`                                   | DM 접근 정책                        |
| `allowFrom`  | string[] | `[]`                                        | 허용된 발신자 pubkey                |
| `enabled`    | boolean  | `true`                                      | 채널 활성화/비활성화                |
| `name`       | string   | -                                           | 표시 이름                           |
| `profile`    | object   | -                                           | NIP-01 프로필 메타데이터            |

## 프로필 메타데이터

프로필 데이터는 NIP-01 `kind:0` 이벤트로 발행됩니다. Control UI (Channels -> Nostr -> Profile)에서 관리하거나 설정에 직접 지정할 수 있습니다.

예제:

```json5
{
  channels: {
    nostr: {
      privateKey: "${NOSTR_PRIVATE_KEY}",
      profile: {
        name: "openclaw",
        displayName: "OpenClaw",
        about: "Personal assistant DM bot",
        picture: "https://example.com/avatar.png",
        banner: "https://example.com/banner.png",
        website: "https://example.com",
        nip05: "openclaw@example.com",
        lud16: "openclaw@example.com",
      },
    },
  },
}
```

참고:

- 프로필 URL은 `https://`를 사용해야 합니다.
- relay에서 가져오기는 필드를 병합하고 로컬 재정의를 보존합니다.

## 접근 제어

### DM 정책

- **pairing** (기본값): 알 수 없는 발신자는 페어링 코드를 받습니다.
- **allowlist**: `allowFrom`의 pubkey만 DM을 보낼 수 있습니다.
- **open**: 공개 인바운드 DM (`allowFrom: ["*"]` 필요).
- **disabled**: 인바운드 DM 무시.

적용 참고 사항:

- 인바운드 이벤트 서명은 발신자 정책과 NIP-04 복호화 전에 검증되므로, 위조된 이벤트는 조기에 거부됩니다.
- 페어링 응답은 원본 DM 본문을 처리하지 않고 전송됩니다.
- 인바운드 DM은 속도 제한이 적용되며, 복호화 전에 과도한 크기의 페이로드는 드롭됩니다.

### 허용 목록 예제

```json5
{
  channels: {
    nostr: {
      privateKey: "${NOSTR_PRIVATE_KEY}",
      dmPolicy: "allowlist",
      allowFrom: ["npub1abc...", "npub1xyz..."],
    },
  },
}
```

## 키 형식

허용되는 형식:

- **개인 키:** `nsec...` 또는 64자 hex
- **Pubkey (`allowFrom`):** `npub...` 또는 hex

## Relay

기본값: `relay.damus.io` 및 `nos.lol`.

```json5
{
  channels: {
    nostr: {
      privateKey: "${NOSTR_PRIVATE_KEY}",
      relays: ["wss://relay.damus.io", "wss://relay.primal.net", "wss://nostr.wine"],
    },
  },
}
```

팁:

- 중복성을 위해 2~3개의 relay를 사용합니다.
- 너무 많은 relay는 피하세요 (지연, 중복).
- 유료 relay는 안정성을 높일 수 있습니다.
- 테스트에는 로컬 relay도 적합합니다 (`ws://localhost:7777`).

## 프로토콜 지원

| NIP    | 상태       | 설명                                  |
| ------ | ---------- | ------------------------------------- |
| NIP-01 | 지원       | 기본 이벤트 포맷 + 프로필 메타데이터  |
| NIP-04 | 지원       | 암호화된 DM (`kind:4`)                |
| NIP-17 | 계획됨     | Gift-wrapped DM                       |
| NIP-44 | 계획됨     | 버전 관리 암호화                      |

## 테스트

### 로컬 relay

```bash
# strfry 시작
docker run -p 7777:7777 ghcr.io/hoytech/strfry
```

```json5
{
  channels: {
    nostr: {
      privateKey: "${NOSTR_PRIVATE_KEY}",
      relays: ["ws://localhost:7777"],
    },
  },
}
```

### 수동 테스트

1. 로그에서 봇 pubkey(npub)를 확인합니다.
2. Nostr 클라이언트(Damus, Amethyst 등)를 엽니다.
3. 봇 pubkey로 DM을 보냅니다.
4. 응답을 확인합니다.

## 문제 해결

### 메시지를 수신하지 못함

- 개인 키가 유효한지 확인합니다.
- relay URL에 접근 가능하고 `wss://`(또는 로컬의 경우 `ws://`)를 사용하는지 확인합니다.
- `enabled`가 `false`가 아닌지 확인합니다.
- Gateway 로그에서 relay 연결 오류를 확인합니다.

### 응답을 보내지 못함

- relay가 쓰기를 수락하는지 확인합니다.
- 아웃바운드 연결을 확인합니다.
- relay 속도 제한을 주시합니다.

### 중복 응답

- 여러 relay를 사용하는 경우 예상되는 동작입니다.
- 메시지는 이벤트 ID로 중복 제거되며, 첫 번째 전달만 응답을 트리거합니다.

## 보안

- 개인 키를 커밋하지 마세요.
- 키에는 환경 변수를 사용하세요.
- 프로덕션 봇에는 `allowlist`를 고려하세요.
- 서명은 발신자 정책 전에 검증되고 발신자 정책은 복호화 전에 적용되므로, 위조된 이벤트는 조기에 거부되고 알 수 없는 발신자는 전체 암호화 작업을 강제할 수 없습니다.

## 제한 사항 (MVP)

- 다이렉트 메시지만 지원 (그룹 채팅 없음).
- 미디어 첨부 없음.
- NIP-04만 지원 (NIP-17 gift-wrap 계획됨).

## 관련

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 플로우
- [그룹](/channels/groups) — 그룹 채팅 동작 및 멘션 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지용 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
