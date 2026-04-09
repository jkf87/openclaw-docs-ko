---
summary: "Matrix 지원 상태, 설정 및 구성 예시"
read_when:
  - OpenClaw에서 Matrix 설정 시
  - Matrix E2EE 및 검증 구성 시
title: "Matrix"
---

# Matrix

Matrix는 OpenClaw의 번들 채널 플러그인입니다.
공식 `matrix-js-sdk`를 사용하며 DM, 방, 스레드, 미디어, 반응, 설문, 위치 및 E2EE를 지원합니다.

## 번들 플러그인

Matrix는 현재 OpenClaw 릴리스에서 번들 플러그인으로 제공되므로 일반 패키지 빌드에는 별도의 설치가 필요하지 않습니다.

이전 빌드 또는 Matrix가 제외된 사용자 정의 설치의 경우 수동으로 설치합니다:

npm에서 설치:

```bash
openclaw plugins install @openclaw/matrix
```

로컬 체크아웃에서 설치:

```bash
openclaw plugins install ./path/to/local/matrix-plugin
```

## 설정

1. Matrix 플러그인이 사용 가능한지 확인합니다.
2. 홈서버에서 Matrix 계정을 생성합니다.
3. 다음 중 하나로 `channels.matrix`를 구성합니다:
   - `homeserver` + `accessToken`, 또는
   - `homeserver` + `userId` + `password`.
4. 게이트웨이를 재시작합니다.
5. 봇에게 DM을 보내거나 방에 초대합니다.
   - `channels.matrix.autoJoin`이 허용할 때만 새 Matrix 초대가 작동합니다.

인터랙티브 설정 경로:

```bash
openclaw channels add
openclaw configure --section channels
```

<Warning>
`channels.matrix.autoJoin`은 기본적으로 `off`입니다.

설정하지 않으면 봇은 초대된 방 또는 새 DM 초대에 참여하지 않으므로 먼저 수동으로 참여하지 않으면 새 그룹 또는 초대된 DM에 나타나지 않습니다.

초대를 허용하는 대상을 제한하려면 `autoJoin: "allowlist"`와 `autoJoinAllowlist`를 함께 설정하거나, 모든 초대에 참여하려면 `autoJoin: "always"`를 설정합니다.

`allowlist` 모드에서 `autoJoinAllowlist`는 `!roomId:server`, `#alias:server`, 또는 `*`만 허용합니다.
</Warning>

허용 목록 예시:

```json5
{
  channels: {
    matrix: {
      autoJoin: "allowlist",
      autoJoinAllowlist: ["!ops:example.org", "#support:example.org"],
      groups: {
        "!ops:example.org": {
          requireMention: true,
        },
      },
    },
  },
}
```

최소 토큰 기반 설정:

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_xxx",
      dm: { policy: "pairing" },
    },
  },
}
```

비밀번호 기반 설정 (로그인 후 토큰이 캐시됨):

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      userId: "@bot:example.org",
      password: "replace-me", // pragma: allowlist secret
      deviceName: "OpenClaw Gateway",
    },
  },
}
```

Matrix는 캐시된 자격 증명을 `~/.openclaw/credentials/matrix/`에 저장합니다.

환경 변수 동등값:

- `MATRIX_HOMESERVER`
- `MATRIX_ACCESS_TOKEN`
- `MATRIX_USER_ID`
- `MATRIX_PASSWORD`
- `MATRIX_DEVICE_ID`
- `MATRIX_DEVICE_NAME`

## 구성 예시

DM 페어링, 방 허용 목록 및 E2EE가 활성화된 실용적인 기준 구성:

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_xxx",
      encryption: true,

      dm: {
        policy: "pairing",
        sessionScope: "per-room",
        threadReplies: "off",
      },

      groupPolicy: "allowlist",
      groups: {
        "!ops:example.org": { requireMention: true },
        "!general:example.org": { requireMention: false },
      },
    },
  },
}
```

## E2EE 및 검증

E2EE를 활성화하면 검증이 중요해집니다. `openclaw matrix verify` 명령은 이 상태를 관리합니다.

최소 E2EE 설정:

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_xxx",
      encryption: true,
      dm: { policy: "pairing" },
    },
  },
}
```

검증 상태 확인:

```bash
openclaw matrix verify status
```

상세 상태 (전체 진단):

```bash
openclaw matrix verify status --verbose
```

크로스 서명 및 검증 상태 부트스트랩:

```bash
openclaw matrix verify bootstrap
```

복구 키로 디바이스 검증:

```bash
openclaw matrix verify device "<your-recovery-key>"
```

방 키 백업 상태 확인:

```bash
openclaw matrix verify backup status
```

서버 백업에서 방 키 복원:

```bash
openclaw matrix verify backup restore
```

현재 서버 백업 삭제 및 새 백업 기준 생성:

```bash
openclaw matrix verify backup reset --yes
```

### "검증됨"의 의미

OpenClaw는 자체 크로스 서명 ID로 검증된 경우에만 이 Matrix 디바이스를 검증된 것으로 처리합니다.

### 부트스트랩이 하는 일

`openclaw matrix verify bootstrap`은 암호화된 Matrix 계정의 수리 및 설정 명령입니다:

- 기존 복구 키를 재사용하여 비밀 저장소를 부트스트랩합니다
- 크로스 서명을 부트스트랩하고 누락된 공개 크로스 서명 키를 업로드합니다
- 현재 디바이스를 표시하고 크로스 서명을 시도합니다
- 서버 측 방 키 백업이 없는 경우 새로 생성합니다

### 디바이스 위생

오래된 OpenClaw 관리 Matrix 디바이스를 나열합니다:

```bash
openclaw matrix devices list
```

오래된 OpenClaw 관리 디바이스를 제거합니다:

```bash
openclaw matrix devices prune-stale
```

## 프로필 관리

선택한 계정의 Matrix 셀프 프로필을 업데이트합니다:

```bash
openclaw matrix profile set --name "OpenClaw Assistant"
openclaw matrix profile set --avatar-url https://cdn.example.org/avatar.png
```

## 스레드

Matrix는 자동 응답 및 메시지 도구 전송 모두에 대해 네이티브 Matrix 스레드를 지원합니다.

- `dm.sessionScope: "per-user"` (기본값) - Matrix DM 라우팅이 발신자 범위
- `dm.sessionScope: "per-room"` - 각 Matrix DM 방을 자체 세션 키로 격리
- `threadReplies: "off"` - 응답을 최상위로 유지
- `threadReplies: "inbound"` - 인바운드 메시지가 이미 스레드에 있을 때만 스레드 내 응답
- `threadReplies: "always"` - 방 응답을 트리거 메시지에 루팅된 스레드에 유지

## ACP 대화 바인딩

Matrix 방, DM 및 기존 Matrix 스레드를 채팅 표면을 변경하지 않고 내구성 있는 ACP 워크스페이스로 전환할 수 있습니다.

빠른 운영자 흐름:

- 계속 사용하려는 Matrix DM, 방 또는 기존 스레드 내에서 `/acp spawn codex --bind here`를 실행합니다.

## 반응

- 아웃바운드 반응 도구는 `channels["matrix"].actions.reactions`로 게이팅됩니다.
- `react` - 특정 Matrix 이벤트에 반응 추가
- `emoji=""`는 해당 이벤트에서 봇 계정의 자체 반응을 제거합니다.

## 히스토리 컨텍스트

- `channels.matrix.historyLimit`은 Matrix 방 메시지가 에이전트를 트리거할 때 `InboundHistory`로 포함되는 최근 방 메시지 수를 제어합니다.

## DM 및 방 정책

```json5
{
  channels: {
    matrix: {
      dm: {
        policy: "allowlist",
        allowFrom: ["@admin:example.org"],
        threadReplies: "off",
      },
      groupPolicy: "allowlist",
      groupAllowFrom: ["@admin:example.org"],
      groups: {
        "!roomid:example.org": {
          requireMention: true,
        },
      },
    },
  },
}
```

Matrix DM의 페어링 예시:

```bash
openclaw pairing list matrix
openclaw pairing approve matrix <CODE>
```

## 다이렉트 방 수리

다이렉트 메시지 상태가 동기화되지 않는 경우:

피어의 현재 매핑 검사:

```bash
openclaw matrix direct inspect --user-id @alice:example.org
```

수리:

```bash
openclaw matrix direct repair --user-id @alice:example.org
```

## 실행 승인

Matrix는 Matrix 계정의 네이티브 승인 클라이언트로 작동할 수 있습니다.

구성 경로:

- `channels.matrix.execApprovals.enabled`
- `channels.matrix.execApprovals.approvers` (선택 사항; `channels.matrix.dm.allowFrom`으로 폴백)
- `channels.matrix.execApprovals.target` (`dm` | `channel` | `both`, 기본값: `dm`)

Matrix 승인 프롬프트는 기본 승인 메시지에 반응 단축키를 씁니다:

- `✅` = 한 번 허용
- `❌` = 거부
- `♾️` = 항상 허용

## 멀티 계정

```json5
{
  channels: {
    matrix: {
      enabled: true,
      defaultAccount: "assistant",
      dm: { policy: "pairing" },
      accounts: {
        assistant: {
          homeserver: "https://matrix.example.org",
          accessToken: "syt_assistant_xxx",
          encryption: true,
        },
        alerts: {
          homeserver: "https://matrix.example.org",
          accessToken: "syt_alerts_xxx",
          dm: {
            policy: "allowlist",
            allowFrom: ["@ops:example.org"],
          },
        },
      },
    },
  },
}
```

## 프라이빗/LAN 홈서버

기본적으로 OpenClaw는 SSRF 보호를 위해 명시적으로 옵트인하지 않는 한 프라이빗/내부 Matrix 홈서버를 차단합니다.

홈서버가 localhost, LAN/Tailscale IP 또는 내부 호스트명에서 실행되는 경우 해당 Matrix 계정에 대해 `network.dangerouslyAllowPrivateNetwork`를 활성화합니다:

```json5
{
  channels: {
    matrix: {
      homeserver: "http://matrix-synapse:8008",
      network: {
        dangerouslyAllowPrivateNetwork: true,
      },
      accessToken: "syt_internal_xxx",
    },
  },
}
```

## 구성 참조

- `enabled`: 채널 활성화 또는 비활성화.
- `homeserver`: 홈서버 URL (예: `https://matrix.example.org`).
- `userId`: 전체 Matrix 사용자 ID (예: `@bot:example.org`).
- `accessToken`: 토큰 기반 인증을 위한 액세스 토큰.
- `password`: 비밀번호 기반 로그인을 위한 비밀번호.
- `deviceName`: 비밀번호 로그인을 위한 디바이스 표시 이름.
- `encryption`: E2EE 활성화.
- `groupPolicy`: `open`, `allowlist`, 또는 `disabled`.
- `groupAllowFrom`: 방 트래픽을 위한 사용자 ID 허용 목록.
- `historyLimit`: 그룹 히스토리 컨텍스트로 포함되는 최대 방 메시지 수.
- `autoJoin`: 초대 자동 참여 정책 (`always`, `allowlist`, `off`). 기본값: `off`.
- `dm`: DM 정책 블록 (`enabled`, `policy`, `allowFrom`, `sessionScope`, `threadReplies`).
- `execApprovals`: Matrix 네이티브 실행 승인 전달.
- `accounts`: 명명된 계정별 재정의.
- `groups`: 방별 정책 맵.

## 관련 문서

- [채널 개요](/channels/)
- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [채널 라우팅](/channels/channel-routing)
- [보안](/gateway/security/)
