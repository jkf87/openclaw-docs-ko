---
summary: "Tlon/Urbit 지원 상태, 기능 및 구성"
read_when:
  - Tlon/Urbit 채널 기능 작업 시
title: "Tlon"
---

Tlon은 Urbit 위에 구축된 분산형 메신저입니다. OpenClaw는 사용자의 Urbit 쉽(ship)에 연결하여 DM 및 그룹 채팅 메시지에 응답할 수 있습니다. 그룹 응답은 기본적으로 @ 멘션이 필요하며 허용 목록을 통해 추가로 제한할 수 있습니다.

상태: 번들 플러그인. DM, 그룹 멘션, 스레드 응답, 서식 있는 텍스트 포맷팅, 이미지 업로드가 지원됩니다. 반응 및 설문은 아직 지원되지 않습니다.

## 번들 플러그인

Tlon은 현재 OpenClaw 릴리스에 번들 플러그인으로 제공되므로, 일반 패키지 빌드에서는 별도 설치가 필요하지 않습니다.

이전 빌드를 사용 중이거나 Tlon을 제외한 사용자 정의 설치의 경우, 수동으로 설치하십시오.

CLI를 통한 설치(npm 레지스트리):

```bash
openclaw plugins install @openclaw/tlon
```

로컬 체크아웃(git 저장소에서 실행할 때):

```bash
openclaw plugins install ./path/to/local/tlon-plugin
```

자세한 내용: [플러그인](/tools/plugin)

## 설정

1. Tlon 플러그인이 사용 가능한지 확인하십시오.
   - 현재 패키지로 제공되는 OpenClaw 릴리스에는 이미 번들로 포함되어 있습니다.
   - 이전/사용자 정의 설치의 경우 위 명령으로 수동 추가할 수 있습니다.
2. 쉽(ship) URL 및 로그인 코드를 준비하십시오.
3. `channels.tlon`을 구성하십시오.
4. 게이트웨이를 재시작하십시오.
5. 봇에 DM을 보내거나 그룹 채널에서 멘션하십시오.

최소 구성(단일 계정):

```json5
{
  channels: {
    tlon: {
      enabled: true,
      ship: "~sampel-palnet",
      url: "https://your-ship-host",
      code: "lidlut-tabwed-pillex-ridrup",
      ownerShip: "~your-main-ship", // 권장: 본인의 ship, 항상 허용됨
    },
  },
}
```

## 프라이빗/LAN 쉽

기본적으로 OpenClaw는 SSRF 방지를 위해 프라이빗/내부 호스트 이름 및 IP 범위를 차단합니다.
쉽이 프라이빗 네트워크(localhost, LAN IP 또는 내부 호스트 이름)에서 실행 중인 경우, 명시적으로 옵트인해야 합니다:

```json5
{
  channels: {
    tlon: {
      url: "http://localhost:8080",
      allowPrivateNetwork: true,
    },
  },
}
```

이는 다음과 같은 URL에 적용됩니다:

- `http://localhost:8080`
- `http://192.168.x.x:8080`
- `http://my-ship.local:8080`

주의: 로컬 네트워크를 신뢰하는 경우에만 활성화하십시오. 이 설정은 쉽 URL 요청에 대한 SSRF 방어를 비활성화합니다.

## 그룹 채널

자동 탐색은 기본적으로 활성화되어 있습니다. 채널을 수동으로 고정할 수도 있습니다:

```json5
{
  channels: {
    tlon: {
      groupChannels: ["chat/~host-ship/general", "chat/~host-ship/support"],
    },
  },
}
```

자동 탐색 비활성화:

```json5
{
  channels: {
    tlon: {
      autoDiscoverChannels: false,
    },
  },
}
```

## 접근 제어

DM 허용 목록(비어 있음 = DM 허용 안 함, 승인 흐름에는 `ownerShip` 사용):

```json5
{
  channels: {
    tlon: {
      dmAllowlist: ["~zod", "~nec"],
    },
  },
}
```

그룹 인증(기본적으로 제한됨):

```json5
{
  channels: {
    tlon: {
      defaultAuthorizedShips: ["~zod"],
      authorization: {
        channelRules: {
          "chat/~host-ship/general": {
            mode: "restricted",
            allowedShips: ["~zod", "~nec"],
          },
          "chat/~host-ship/announcements": {
            mode: "open",
          },
        },
      },
    },
  },
}
```

## 소유자 및 승인 시스템

무단 사용자가 상호작용하려고 할 때 승인 요청을 받으려면 소유자 쉽을 설정하십시오:

```json5
{
  channels: {
    tlon: {
      ownerShip: "~your-main-ship",
    },
  },
}
```

소유자 쉽은 **모든 곳에서 자동으로 인증됩니다** — DM 초대는 자동 수락되고 채널 메시지는 항상 허용됩니다. 소유자를 `dmAllowlist` 또는 `defaultAuthorizedShips`에 추가할 필요가 없습니다.

설정되면 소유자는 다음에 대해 DM 알림을 받습니다:

- 허용 목록에 없는 쉽의 DM 요청
- 인증 없이 채널에서의 멘션
- 그룹 초대 요청

## 자동 수락 설정

DM 초대 자동 수락 (dmAllowlist의 쉽에 대해):

```json5
{
  channels: {
    tlon: {
      autoAcceptDmInvites: true,
    },
  },
}
```

그룹 초대 자동 수락:

```json5
{
  channels: {
    tlon: {
      autoAcceptGroupInvites: true,
    },
  },
}
```

## 전송 대상 (CLI/크론)

`openclaw message send` 또는 크론 전송에 다음을 사용하십시오:

- DM: `~sampel-palnet` 또는 `dm/~sampel-palnet`
- 그룹: `chat/~host-ship/channel` 또는 `group:~host-ship/channel`

## 번들 스킬

Tlon 플러그인에는 Tlon 작업에 대한 CLI 접근을 제공하는 번들 스킬([`@tloncorp/tlon-skill`](https://github.com/tloncorp/tlon-skill))이 포함되어 있습니다:

- **연락처**: 프로필 조회/업데이트, 연락처 목록
- **채널**: 목록, 생성, 메시지 게시, 이력 가져오기
- **그룹**: 목록, 생성, 구성원 관리
- **DM**: 메시지 전송, 메시지 반응
- **반응**: 게시물 및 DM에 이모지 반응 추가/제거
- **설정**: 슬래시 명령을 통한 플러그인 권한 관리

스킬은 플러그인이 설치되면 자동으로 사용할 수 있습니다.

## 기능

| 기능             | 상태                                         |
| ---------------- | -------------------------------------------- |
| 다이렉트 메시지  | 지원됨                                       |
| 그룹/채널        | 지원됨 (기본적으로 멘션 게이팅)              |
| 스레드           | 지원됨 (스레드 내 자동 응답)                 |
| 서식 있는 텍스트 | 마크다운이 Tlon 형식으로 변환됨              |
| 이미지           | Tlon 저장소에 업로드됨                       |
| 반응             | [번들 스킬](#번들-스킬)을 통해 지원          |
| 설문             | 아직 지원되지 않음                           |
| 네이티브 명령    | 지원됨 (기본적으로 소유자 전용)              |

## 문제 해결

먼저 다음 순서로 실행하십시오:

```bash
openclaw status
openclaw gateway status
openclaw logs --follow
openclaw doctor
```

일반적인 실패:

- **DM이 무시됨**: 발신자가 `dmAllowlist`에 없고 승인 흐름을 위한 `ownerShip`이 구성되지 않음.
- **그룹 메시지가 무시됨**: 채널이 탐색되지 않았거나 발신자가 인증되지 않음.
- **연결 오류**: 쉽 URL이 도달 가능한지 확인; 로컬 쉽의 경우 `allowPrivateNetwork`를 활성화.
- **인증 오류**: 로그인 코드가 최신인지 확인(코드는 주기적으로 갱신됨).

## 구성 참조

전체 구성: [구성](/gateway/configuration)

프로바이더 옵션:

- `channels.tlon.enabled`: 채널 시작 활성화/비활성화.
- `channels.tlon.ship`: 봇의 Urbit 쉽 이름 (예: `~sampel-palnet`).
- `channels.tlon.url`: 쉽 URL (예: `https://sampel-palnet.tlon.network`).
- `channels.tlon.code`: 쉽 로그인 코드.
- `channels.tlon.allowPrivateNetwork`: localhost/LAN URL 허용 (SSRF 우회).
- `channels.tlon.ownerShip`: 승인 시스템용 소유자 쉽 (항상 인증됨).
- `channels.tlon.dmAllowlist`: DM 허용된 쉽 (비어 있음 = 없음).
- `channels.tlon.autoAcceptDmInvites`: 허용 목록 쉽의 DM 자동 수락.
- `channels.tlon.autoAcceptGroupInvites`: 모든 그룹 초대 자동 수락.
- `channels.tlon.autoDiscoverChannels`: 그룹 채널 자동 탐색 (기본값: true).
- `channels.tlon.groupChannels`: 수동으로 고정된 채널 네스트.
- `channels.tlon.defaultAuthorizedShips`: 모든 채널에 인증된 쉽.
- `channels.tlon.authorization.channelRules`: 채널별 인증 규칙.
- `channels.tlon.showModelSignature`: 메시지에 모델 이름 추가.

## 참고 사항

- 그룹 응답은 응답하기 위해 멘션이 필요합니다 (예: `~your-bot-ship`).
- 스레드 응답: 인바운드 메시지가 스레드에 있는 경우 OpenClaw는 스레드 내에서 응답합니다.
- 서식 있는 텍스트: 마크다운 포맷팅(굵게, 기울임, 코드, 헤더, 목록)이 Tlon의 네이티브 형식으로 변환됩니다.
- 이미지: URL이 Tlon 저장소에 업로드되고 이미지 블록으로 임베드됩니다.

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 멘션 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지에 대한 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
