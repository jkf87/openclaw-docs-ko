---
summary: "Matrix 지원 상태, 설정 및 구성 예시"
read_when:
  - OpenClaw에서 Matrix 설정 시
  - Matrix E2EE 및 검증 구성 시
title: "Matrix"
---

Matrix는 OpenClaw의 번들 채널 플러그인입니다.
공식 `matrix-js-sdk`를 사용하며 DM, room, thread, 미디어, 반응, 설문, 위치, E2EE를 지원합니다.

## 번들 플러그인

Matrix는 현재 OpenClaw 릴리스에 번들 플러그인으로 제공되므로, 일반 패키지 빌드에서는
별도의 설치가 필요하지 않습니다.

오래된 빌드 또는 Matrix를 제외한 커스텀 설치를 사용하는 경우, 수동으로 설치하세요:

npm에서 설치:

```bash
openclaw plugins install @openclaw/matrix
```

로컬 체크아웃에서 설치:

```bash
openclaw plugins install ./path/to/local/matrix-plugin
```

플러그인 동작 및 설치 규칙은 [플러그인](/tools/plugin)을 참조하세요.

## 설정

1. Matrix 플러그인이 사용 가능한지 확인하세요.
   - 현재 패키지 OpenClaw 릴리스는 이미 번들로 제공합니다.
   - 오래된/커스텀 설치는 위의 명령으로 수동으로 추가할 수 있습니다.
2. homeserver에 Matrix 계정을 생성합니다.
3. `channels.matrix`를 다음 중 하나로 구성합니다:
   - `homeserver` + `accessToken`, 또는
   - `homeserver` + `userId` + `password`.
4. 게이트웨이를 재시작합니다.
5. 봇과 DM을 시작하거나 room에 초대합니다.
   - 새로운 Matrix 초대는 `channels.matrix.autoJoin`이 허용하는 경우에만 작동합니다.

대화형 설정 경로:

```bash
openclaw channels add
openclaw configure --section channels
```

Matrix 마법사는 다음을 요청합니다:

- homeserver URL
- 인증 방법: access token 또는 password
- 사용자 ID (password 인증만)
- 선택적 device 이름
- E2EE 활성화 여부
- room 접근 및 초대 auto-join 구성 여부

주요 마법사 동작:

- Matrix 인증 환경 변수가 이미 존재하고 해당 계정이 아직 구성에 인증이 저장되어 있지 않은 경우, 마법사는 환경 변수에 인증을 유지하는 env 단축 옵션을 제공합니다.
- 계정 이름은 계정 ID로 정규화됩니다. 예를 들어 `Ops Bot`은 `ops-bot`이 됩니다.
- DM 허용 목록 항목은 `@user:server`를 직접 허용하며, 표시 이름은 라이브 디렉토리 조회가 정확히 하나의 일치를 찾는 경우에만 작동합니다.
- Room 허용 목록 항목은 room ID와 alias를 직접 허용합니다. `!room:server` 또는 `#alias:server`를 선호하세요; 해석되지 않은 이름은 런타임 허용 목록 해석에서 무시됩니다.
- 초대 auto-join 허용 목록 모드에서는 안정적인 초대 타겟만 사용하세요: `!roomId:server`, `#alias:server`, 또는 `*`. 일반 room 이름은 거부됩니다.
- 저장하기 전에 room 이름을 해석하려면 `openclaw channels resolve --channel matrix "Project Room"`을 사용하세요.

<Warning>
`channels.matrix.autoJoin`의 기본값은 `off`입니다.

설정하지 않으면 봇은 초대된 room이나 새로운 DM 스타일 초대에 참여하지 않으므로, 수동으로 먼저 참여하지 않는 한 새 그룹이나 초대된 DM에 나타나지 않습니다.

허용할 초대를 제한하려면 `autoJoin: "allowlist"`와 `autoJoinAllowlist`를 함께 설정하거나, 모든 초대에 참여하게 하려면 `autoJoin: "always"`로 설정하세요.

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

모든 초대에 참여:

```json5
{
  channels: {
    matrix: {
      autoJoin: "always",
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

Password 기반 설정 (로그인 후 토큰은 캐시됨):

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
기본 계정은 `credentials.json`을 사용하고, 명명된 계정은 `credentials-<account>.json`을 사용합니다.
그곳에 캐시된 자격 증명이 있으면, 현재 인증이 구성에서 직접 설정되지 않았더라도 OpenClaw는 설정, doctor, channel-status 발견을 위해 Matrix를 구성된 것으로 취급합니다.

환경 변수 동등물 (구성 키가 설정되지 않은 경우 사용):

- `MATRIX_HOMESERVER`
- `MATRIX_ACCESS_TOKEN`
- `MATRIX_USER_ID`
- `MATRIX_PASSWORD`
- `MATRIX_DEVICE_ID`
- `MATRIX_DEVICE_NAME`

기본값이 아닌 계정의 경우, 계정 범위 환경 변수를 사용하세요:

- `MATRIX_<ACCOUNT_ID>_HOMESERVER`
- `MATRIX_<ACCOUNT_ID>_ACCESS_TOKEN`
- `MATRIX_<ACCOUNT_ID>_USER_ID`
- `MATRIX_<ACCOUNT_ID>_PASSWORD`
- `MATRIX_<ACCOUNT_ID>_DEVICE_ID`
- `MATRIX_<ACCOUNT_ID>_DEVICE_NAME`

계정 `ops`의 예시:

- `MATRIX_OPS_HOMESERVER`
- `MATRIX_OPS_ACCESS_TOKEN`

정규화된 계정 ID `ops-bot`의 경우, 다음을 사용하세요:

- `MATRIX_OPS_X2D_BOT_HOMESERVER`
- `MATRIX_OPS_X2D_BOT_ACCESS_TOKEN`

Matrix는 범위 환경 변수를 충돌 없이 유지하기 위해 계정 ID의 구두점을 이스케이프합니다.
예를 들어 `-`는 `_X2D_`가 되므로 `ops-prod`는 `MATRIX_OPS_X2D_PROD_*`로 매핑됩니다.

대화형 마법사는 해당 인증 환경 변수가 이미 존재하고 선택된 계정이 아직 구성에 Matrix 인증이 저장되어 있지 않을 때만 env 단축 옵션을 제공합니다.

`MATRIX_HOMESERVER`는 워크스페이스 `.env`에서 설정할 수 없습니다; [워크스페이스 `.env` 파일](/gateway/security/)을 참조하세요.

## 구성 예시

이는 DM 페어링, room 허용 목록, E2EE가 활성화된 실용적인 기본 구성입니다:

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
      groupAllowFrom: ["@admin:example.org"],
      groups: {
        "!roomid:example.org": {
          requireMention: true,
        },
      },

      autoJoin: "allowlist",
      autoJoinAllowlist: ["!roomid:example.org"],
      threadReplies: "inbound",
      replyToMode: "off",
      streaming: "partial",
    },
  },
}
```

`autoJoin`은 DM 스타일 초대를 포함한 모든 Matrix 초대에 적용됩니다. OpenClaw는 초대 시점에
초대된 room을 DM 또는 그룹으로 안정적으로 분류할 수 없으므로, 모든 초대는 먼저 `autoJoin`을
거칩니다. `dm.policy`는 봇이 참여하고 room이 DM으로 분류된 후에 적용됩니다.

## 스트리밍 미리보기

Matrix 응답 스트리밍은 opt-in입니다.

OpenClaw가 단일 라이브 미리보기 응답을 전송하고, 모델이 텍스트를 생성하는 동안 해당 미리보기를
제자리에서 편집한 다음, 응답이 완료되면 마무리하도록 하려면 `channels.matrix.streaming`을
`"partial"`로 설정하세요:

```json5
{
  channels: {
    matrix: {
      streaming: "partial",
    },
  },
}
```

- `streaming: "off"`가 기본값입니다. OpenClaw는 최종 응답을 기다린 후 한 번 전송합니다.
- `streaming: "partial"`은 일반 Matrix 텍스트 메시지를 사용하여 현재 assistant 블록에 대해 하나의 편집 가능한 미리보기 메시지를 생성합니다. 이는 Matrix의 레거시 미리보기 우선 알림 동작을 유지하므로, 기본 클라이언트는 완료된 블록 대신 첫 번째 스트림 미리보기 텍스트에서 알림을 받을 수 있습니다.
- `streaming: "quiet"`는 현재 assistant 블록에 대해 하나의 편집 가능한 조용한 미리보기 통지를 생성합니다. 마무리된 미리보기 편집을 위한 수신자 푸시 규칙도 구성할 때만 사용하세요.
- `blockStreaming: true`는 별도의 Matrix 진행 메시지를 활성화합니다. 미리보기 스트리밍이 활성화된 경우, Matrix는 현재 블록에 대한 라이브 초안을 유지하고 완료된 블록을 별도의 메시지로 보존합니다.
- 미리보기 스트리밍이 켜져 있고 `blockStreaming`이 꺼져 있으면, Matrix는 라이브 초안을 제자리에서 편집하고 블록 또는 턴이 완료되면 동일한 이벤트를 마무리합니다.
- 미리보기가 더 이상 하나의 Matrix 이벤트에 맞지 않으면, OpenClaw는 미리보기 스트리밍을 중지하고 일반 최종 전달로 폴백합니다.
- 미디어 응답은 여전히 첨부 파일을 정상적으로 전송합니다. 오래된 미리보기를 안전하게 재사용할 수 없으면, OpenClaw는 최종 미디어 응답을 전송하기 전에 redact합니다.
- 미리보기 편집은 추가 Matrix API 호출 비용이 발생합니다. 가장 보수적인 rate-limit 동작을 원한다면 스트리밍을 끄세요.

`blockStreaming`은 그 자체로 초안 미리보기를 활성화하지 않습니다.
미리보기 편집에는 `streaming: "partial"` 또는 `streaming: "quiet"`를 사용하세요; 그런 다음 완료된 assistant 블록이 별도의 진행 메시지로 계속 표시되도록 하려면 `blockStreaming: true`를 추가하세요.

커스텀 푸시 규칙 없이 기본 Matrix 알림이 필요하다면, 미리보기 우선 동작을 위해 `streaming: "partial"`을 사용하거나 최종 전용 전달을 위해 `streaming`을 off로 두세요. `streaming: "off"`의 경우:

- `blockStreaming: true`는 완료된 각 블록을 일반 알림 Matrix 메시지로 전송합니다.
- `blockStreaming: false`는 최종 완료된 응답만 일반 알림 Matrix 메시지로 전송합니다.

### 자체 호스팅 조용한 마무리 미리보기용 푸시 규칙

조용한 스트리밍(`streaming: "quiet"`)은 블록 또는 턴이 마무리될 때만 수신자에게 알립니다 — 사용자별 푸시 규칙이 마무리된 미리보기 마커와 일치해야 합니다. 전체 설정(수신자 토큰, pusher 확인, 규칙 설치, homeserver별 참고 사항)은 [조용한 미리보기를 위한 Matrix 푸시 규칙](/channels/matrix-push-rules)을 참조하세요.

## Bot-to-bot room

기본적으로 구성된 다른 OpenClaw Matrix 계정의 Matrix 메시지는 무시됩니다.

에이전트 간 Matrix 트래픽을 의도적으로 원할 때 `allowBots`를 사용하세요:

```json5
{
  channels: {
    matrix: {
      allowBots: "mentions", // true | "mentions"
      groups: {
        "!roomid:example.org": {
          requireMention: true,
        },
      },
    },
  },
}
```

- `allowBots: true`는 허용된 room과 DM에서 구성된 다른 Matrix 봇 계정의 메시지를 허용합니다.
- `allowBots: "mentions"`는 해당 메시지가 room에서 이 봇을 명시적으로 언급할 때만 허용합니다. DM은 여전히 허용됩니다.
- `groups.<room>.allowBots`는 특정 room에 대해 계정 수준 설정을 재정의합니다.
- OpenClaw는 자기 응답 루프를 피하기 위해 동일한 Matrix 사용자 ID의 메시지는 여전히 무시합니다.
- Matrix는 여기서 네이티브 봇 플래그를 노출하지 않습니다; OpenClaw는 "bot-authored"를 "이 OpenClaw 게이트웨이의 구성된 다른 Matrix 계정이 보낸"으로 취급합니다.

공유 room에서 bot-to-bot 트래픽을 활성화할 때는 엄격한 room 허용 목록과 언급 요구 사항을 사용하세요.

## 암호화 및 검증

암호화된 (E2EE) room에서, 아웃바운드 이미지 이벤트는 `thumbnail_file`을 사용하므로 이미지 미리보기가 전체 첨부 파일과 함께 암호화됩니다. 암호화되지 않은 room은 여전히 일반 `thumbnail_url`을 사용합니다. 구성이 필요 없습니다 — 플러그인은 E2EE 상태를 자동으로 감지합니다.

암호화 활성화:

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

검증 명령 (모두 진단용 `--verbose`와 기계 판독 가능 출력용 `--json`을 지원):

| 명령                                                           | 목적                                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `openclaw matrix verify status`                                | 교차 서명 및 디바이스 검증 상태 확인                                       |
| `openclaw matrix verify status --include-recovery-key --json`  | 저장된 복구 키 포함                                                        |
| `openclaw matrix verify bootstrap`                             | 교차 서명 및 검증 부트스트랩 (아래 참조)                                   |
| `openclaw matrix verify bootstrap --force-reset-cross-signing` | 현재 교차 서명 ID를 폐기하고 새로 생성                                     |
| `openclaw matrix verify device "<recovery-key>"`               | 복구 키로 이 디바이스 검증                                                 |
| `openclaw matrix verify backup status`                         | Room-key 백업 상태 확인                                                    |
| `openclaw matrix verify backup restore`                        | 서버 백업에서 room key 복원                                                |
| `openclaw matrix verify backup reset --yes`                    | 현재 백업을 삭제하고 새 기준선 생성 (시크릿 스토리지를 재생성할 수 있음)   |

다중 계정 설정에서, Matrix CLI 명령은 `--account <id>`를 전달하지 않는 한 암시적 Matrix 기본 계정을 사용합니다.
여러 명명된 계정을 구성하는 경우, 먼저 `channels.matrix.defaultAccount`를 설정하세요. 그렇지 않으면 해당 암시적 CLI 작업은 중지되고 계정을 명시적으로 선택하도록 요청합니다.
검증 또는 디바이스 작업을 특정 명명된 계정으로 명시적으로 타겟하려면 `--account`를 사용하세요:

```bash
openclaw matrix verify status --account assistant
openclaw matrix verify backup restore --account assistant
openclaw matrix devices list --account assistant
```

명명된 계정에 대해 암호화가 비활성화되거나 사용할 수 없는 경우, Matrix 경고 및 검증 오류는 해당 계정의 구성 키를 가리킵니다 (예: `channels.matrix.accounts.assistant.encryption`).

<AccordionGroup>
  <Accordion title="검증됨의 의미">
    OpenClaw는 자신의 교차 서명 ID가 디바이스에 서명한 경우에만 검증된 것으로 취급합니다. `verify status --verbose`는 세 가지 신뢰 신호를 노출합니다:

    - `Locally trusted`: 이 클라이언트에서만 신뢰됨
    - `Cross-signing verified`: SDK가 교차 서명을 통한 검증을 보고함
    - `Signed by owner`: 자신의 자체 서명 키로 서명됨

    `Verified by owner`는 교차 서명 또는 소유자 서명이 있을 때만 `yes`가 됩니다. 로컬 신뢰만으로는 충분하지 않습니다.

  </Accordion>

  <Accordion title="Bootstrap이 하는 일">
    `verify bootstrap`은 암호화된 계정을 위한 복구 및 설정 명령입니다. 순서대로:

    - 시크릿 스토리지를 부트스트랩하고, 가능한 경우 기존 복구 키를 재사용
    - 교차 서명을 부트스트랩하고 누락된 공개 교차 서명 키를 업로드
    - 현재 디바이스를 표시하고 교차 서명
    - 존재하지 않으면 서버 측 room-key 백업 생성

    homeserver가 교차 서명 키를 업로드하는 데 UIA를 요구하는 경우, OpenClaw는 먼저 no-auth를 시도한 다음 `m.login.dummy`를, 그다음 `m.login.password`(`channels.matrix.password` 필요)를 시도합니다. 현재 ID를 의도적으로 폐기하는 경우에만 `--force-reset-cross-signing`을 사용하세요.

  </Accordion>

  <Accordion title="새로운 백업 기준선">
    미래의 암호화된 메시지 작동을 유지하고 복구 불가능한 이전 기록 손실을 수용하려는 경우:

```bash
openclaw matrix verify backup reset --yes
openclaw matrix verify backup status --verbose
openclaw matrix verify status
```

    명명된 계정을 타겟하려면 `--account <id>`를 추가하세요. 이는 현재 백업 시크릿을 안전하게 로드할 수 없는 경우 시크릿 스토리지도 재생성할 수 있습니다.

  </Accordion>

  <Accordion title="시작 동작">
    `encryption: true`인 경우, `startupVerification`의 기본값은 `"if-unverified"`입니다. 시작 시 검증되지 않은 디바이스는 다른 Matrix 클라이언트에서 자체 검증을 요청하며, 중복을 건너뛰고 쿨다운을 적용합니다. `startupVerificationCooldownHours`로 조정하거나 `startupVerification: "off"`로 비활성화하세요.

    시작 시에도 현재 시크릿 스토리지와 교차 서명 ID를 재사용하는 보수적인 암호화 부트스트랩 패스가 실행됩니다. 부트스트랩 상태가 깨진 경우, OpenClaw는 `channels.matrix.password` 없이도 보호된 복구를 시도합니다; homeserver가 password UIA를 요구하는 경우, 시작 시 경고를 기록하고 치명적이지 않은 상태를 유지합니다. 이미 소유자 서명된 디바이스는 보존됩니다.

    전체 업그레이드 흐름은 [Matrix 마이그레이션](/install/migrating-matrix)을 참조하세요.

  </Accordion>

  <Accordion title="검증 통지">
    Matrix는 엄격한 DM 검증 room에 검증 수명 주기 통지를 `m.notice` 메시지로 게시합니다: 요청, 준비 ("Verify by emoji" 안내 포함), 시작/완료, 사용 가능한 경우 SAS (이모지/소수점) 세부 정보.

    다른 Matrix 클라이언트의 수신 요청은 추적되고 자동 수락됩니다. 자체 검증의 경우, OpenClaw는 SAS 흐름을 자동으로 시작하고 이모지 검증이 가능해지면 자체 측을 확인합니다 — Matrix 클라이언트에서 "They match"를 비교하고 확인해야 합니다.

    검증 시스템 통지는 에이전트 채팅 파이프라인으로 전달되지 않습니다.

  </Accordion>

  <Accordion title="디바이스 위생">
    오래된 OpenClaw 관리 디바이스가 쌓일 수 있습니다. 목록 및 정리:

```bash
openclaw matrix devices list
openclaw matrix devices prune-stale
```

  </Accordion>

  <Accordion title="암호화 저장소">
    Matrix E2EE는 `fake-indexeddb`를 IndexedDB shim으로 사용하는 공식 `matrix-js-sdk` Rust 암호화 경로를 사용합니다. 암호화 상태는 `crypto-idb-snapshot.json`(제한된 파일 권한)에 유지됩니다.

    암호화된 런타임 상태는 `~/.openclaw/matrix/accounts/<account>/<homeserver>__<user>/<token-hash>/` 아래에 있으며 sync store, crypto store, 복구 키, IDB 스냅샷, 스레드 바인딩, 시작 검증 상태를 포함합니다. 토큰이 변경되지만 계정 ID가 동일하게 유지되면, OpenClaw는 가장 좋은 기존 루트를 재사용하여 이전 상태가 계속 표시되도록 합니다.

  </Accordion>
</AccordionGroup>

## 프로필 관리

다음으로 선택한 계정의 Matrix 자체 프로필을 업데이트하세요:

```bash
openclaw matrix profile set --name "OpenClaw Assistant"
openclaw matrix profile set --avatar-url https://cdn.example.org/avatar.png
```

명명된 Matrix 계정을 명시적으로 타겟하려면 `--account <id>`를 추가하세요.

Matrix는 `mxc://` 아바타 URL을 직접 허용합니다. `http://` 또는 `https://` 아바타 URL을 전달하면, OpenClaw는 먼저 이를 Matrix에 업로드하고 해석된 `mxc://` URL을 `channels.matrix.avatarUrl`(또는 선택된 계정 재정의)에 다시 저장합니다.

## 스레드

Matrix는 자동 응답과 메시지 도구 전송 모두에 대해 네이티브 Matrix 스레드를 지원합니다.

- `dm.sessionScope: "per-user"` (기본값)는 Matrix DM 라우팅을 발신자 범위로 유지하므로, 여러 DM room이 동일한 피어로 해석될 때 하나의 세션을 공유할 수 있습니다.
- `dm.sessionScope: "per-room"`은 정상 DM 인증 및 허용 목록 확인을 계속 사용하면서 각 Matrix DM room을 자체 세션 키로 격리합니다.
- 명시적 Matrix 대화 바인딩은 여전히 `dm.sessionScope`보다 우선하므로, 바인딩된 room과 스레드는 선택된 대상 세션을 유지합니다.
- `threadReplies: "off"`는 응답을 최상위 수준으로 유지하고 수신 스레드 메시지를 상위 세션에 유지합니다.
- `threadReplies: "inbound"`는 인바운드 메시지가 이미 해당 스레드에 있었을 때만 스레드 내부에서 응답합니다.
- `threadReplies: "always"`는 트리거 메시지에 루트가 있는 스레드에서 room 응답을 유지하고, 첫 번째 트리거 메시지부터 일치하는 스레드 범위 세션을 통해 해당 대화를 라우팅합니다.
- `dm.threadReplies`는 DM만을 위해 최상위 수준 설정을 재정의합니다. 예를 들어, DM을 평면으로 유지하면서 room 스레드를 격리할 수 있습니다.
- 인바운드 스레드 메시지는 추가 에이전트 컨텍스트로 스레드 루트 메시지를 포함합니다.
- 메시지 도구 전송은 대상이 동일한 room이거나 동일한 DM 사용자 타겟인 경우 명시적 `threadId`가 제공되지 않는 한 현재 Matrix 스레드를 자동 상속합니다.
- 동일 세션 DM 사용자 타겟 재사용은 현재 세션 메타데이터가 동일한 Matrix 계정에서 동일한 DM 피어임을 증명할 때만 작동합니다; 그렇지 않으면 OpenClaw는 일반 사용자 범위 라우팅으로 폴백합니다.
- OpenClaw가 Matrix DM room이 동일한 공유 Matrix DM 세션에서 다른 DM room과 충돌하는 것을 볼 때, 스레드 바인딩이 활성화된 경우 해당 room에 `/focus` 비상 탈출구와 `dm.sessionScope` 힌트를 포함한 일회성 `m.notice`를 게시합니다.
- 런타임 스레드 바인딩은 Matrix에서 지원됩니다. `/focus`, `/unfocus`, `/agents`, `/session idle`, `/session max-age`, 스레드 바인딩 `/acp spawn`이 Matrix room과 DM에서 작동합니다.
- 최상위 Matrix room/DM `/focus`는 `threadBindings.spawnSubagentSessions=true`일 때 새 Matrix 스레드를 생성하고 대상 세션에 바인딩합니다.
- 기존 Matrix 스레드 내부에서 `/focus` 또는 `/acp spawn --thread here`를 실행하면 해당 현재 스레드를 바인딩합니다.

## ACP 대화 바인딩

Matrix room, DM, 기존 Matrix 스레드는 채팅 표면을 변경하지 않고 지속 가능한 ACP 워크스페이스로 전환될 수 있습니다.

빠른 운영자 흐름:

- 계속 사용하려는 Matrix DM, room, 또는 기존 스레드 내부에서 `/acp spawn codex --bind here`를 실행하세요.
- 최상위 Matrix DM 또는 room에서는, 현재 DM/room이 채팅 표면으로 유지되고 향후 메시지는 생성된 ACP 세션으로 라우팅됩니다.
- 기존 Matrix 스레드 내부에서, `--bind here`는 해당 현재 스레드를 제자리에서 바인딩합니다.
- `/new` 및 `/reset`은 동일한 바인딩된 ACP 세션을 제자리에서 재설정합니다.
- `/acp close`는 ACP 세션을 닫고 바인딩을 제거합니다.

참고:

- `--bind here`는 자식 Matrix 스레드를 생성하지 않습니다.
- `threadBindings.spawnAcpSessions`는 OpenClaw가 자식 Matrix 스레드를 생성하거나 바인딩해야 하는 `/acp spawn --thread auto|here`에만 필요합니다.

### 스레드 바인딩 구성

Matrix는 `session.threadBindings`에서 전역 기본값을 상속하며, 채널별 재정의도 지원합니다:

- `threadBindings.enabled`
- `threadBindings.idleHours`
- `threadBindings.maxAgeHours`
- `threadBindings.spawnSubagentSessions`
- `threadBindings.spawnAcpSessions`

Matrix 스레드 바인딩 spawn 플래그는 opt-in입니다:

- 최상위 수준 `/focus`가 새 Matrix 스레드를 생성하고 바인딩하도록 허용하려면 `threadBindings.spawnSubagentSessions: true`로 설정하세요.
- `/acp spawn --thread auto|here`가 ACP 세션을 Matrix 스레드에 바인딩하도록 허용하려면 `threadBindings.spawnAcpSessions: true`로 설정하세요.

## 반응

Matrix는 아웃바운드 반응 액션, 인바운드 반응 알림, 인바운드 ack 반응을 지원합니다.

- 아웃바운드 반응 도구는 `channels["matrix"].actions.reactions`로 게이트됩니다.
- `react`는 특정 Matrix 이벤트에 반응을 추가합니다.
- `reactions`는 특정 Matrix 이벤트의 현재 반응 요약을 나열합니다.
- `emoji=""`는 해당 이벤트에서 봇 계정의 자체 반응을 제거합니다.
- `remove: true`는 봇 계정에서 지정된 이모지 반응만 제거합니다.

Ack 반응은 표준 OpenClaw 해석 순서를 사용합니다:

- `channels["matrix"].accounts.<accountId>.ackReaction`
- `channels["matrix"].ackReaction`
- `messages.ackReaction`
- 에이전트 ID 이모지 폴백

Ack 반응 범위는 다음 순서로 해석됩니다:

- `channels["matrix"].accounts.<accountId>.ackReactionScope`
- `channels["matrix"].ackReactionScope`
- `messages.ackReactionScope`

반응 알림 모드는 다음 순서로 해석됩니다:

- `channels["matrix"].accounts.<accountId>.reactionNotifications`
- `channels["matrix"].reactionNotifications`
- 기본값: `own`

동작:

- `reactionNotifications: "own"`은 봇이 작성한 Matrix 메시지를 타겟으로 할 때 추가된 `m.reaction` 이벤트를 전달합니다.
- `reactionNotifications: "off"`는 반응 시스템 이벤트를 비활성화합니다.
- Matrix는 반응 제거를 독립 실행형 `m.reaction` 제거가 아닌 redaction으로 표시하므로, 반응 제거는 시스템 이벤트로 합성되지 않습니다.

## 히스토리 컨텍스트

- `channels.matrix.historyLimit`은 Matrix room 메시지가 에이전트를 트리거할 때 `InboundHistory`로 포함되는 최근 room 메시지 수를 제어합니다. `messages.groupChat.historyLimit`로 폴백합니다; 둘 다 설정되지 않은 경우 유효 기본값은 `0`입니다. `0`으로 설정하여 비활성화합니다.
- Matrix room 기록은 room 전용입니다. DM은 일반 세션 기록을 계속 사용합니다.
- Matrix room 기록은 pending 전용입니다: OpenClaw는 아직 응답을 트리거하지 않은 room 메시지를 버퍼링한 다음, 언급 또는 다른 트리거가 도착할 때 해당 창을 스냅샷합니다.
- 현재 트리거 메시지는 `InboundHistory`에 포함되지 않습니다; 해당 턴의 메인 인바운드 본문에 유지됩니다.
- 동일한 Matrix 이벤트의 재시도는 새로운 room 메시지로 이동하는 대신 원래 기록 스냅샷을 재사용합니다.

## 컨텍스트 가시성

Matrix는 가져온 응답 텍스트, 스레드 루트, pending 기록과 같은 보조 room 컨텍스트에 대해 공유 `contextVisibility` 제어를 지원합니다.

- `contextVisibility: "all"`이 기본값입니다. 보조 컨텍스트는 수신된 대로 유지됩니다.
- `contextVisibility: "allowlist"`는 활성 room/사용자 허용 목록 확인에서 허용된 발신자로 보조 컨텍스트를 필터링합니다.
- `contextVisibility: "allowlist_quote"`는 `allowlist`처럼 동작하지만 하나의 명시적 인용 응답은 계속 유지합니다.

이 설정은 인바운드 메시지 자체가 응답을 트리거할 수 있는지가 아니라 보조 컨텍스트 가시성에 영향을 줍니다.
트리거 인증은 여전히 `groupPolicy`, `groups`, `groupAllowFrom`, DM 정책 설정에서 나옵니다.

## DM 및 room 정책

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

언급 게이팅 및 허용 목록 동작은 [그룹](/channels/groups)을 참조하세요.

Matrix DM용 페어링 예시:

```bash
openclaw pairing list matrix
openclaw pairing approve matrix <CODE>
```

승인되지 않은 Matrix 사용자가 승인 전에 계속 메시지를 보내는 경우, OpenClaw는 동일한 pending 페어링 코드를 재사용하고 새 코드를 발행하는 대신 짧은 쿨다운 후 다시 알림 응답을 보낼 수 있습니다.

공유 DM 페어링 흐름 및 저장소 레이아웃은 [페어링](/channels/pairing)을 참조하세요.

## 직접 room 복구

다이렉트 메시지 상태가 동기화되지 않으면, OpenClaw는 라이브 DM 대신 오래된 단독 room을 가리키는 오래된 `m.direct` 매핑을 가질 수 있습니다. 다음으로 피어의 현재 매핑을 검사하세요:

```bash
openclaw matrix direct inspect --user-id @alice:example.org
```

다음으로 복구하세요:

```bash
openclaw matrix direct repair --user-id @alice:example.org
```

복구 흐름:

- `m.direct`에 이미 매핑된 엄격한 1:1 DM을 선호합니다
- 해당 사용자와 현재 참여 중인 엄격한 1:1 DM으로 폴백합니다
- 건강한 DM이 없으면 새 다이렉트 room을 생성하고 `m.direct`를 다시 씁니다

복구 흐름은 이전 room을 자동으로 삭제하지 않습니다. 건강한 DM을 선택하고 새 Matrix 전송, 검증 통지, 기타 다이렉트 메시지 흐름이 다시 올바른 room을 타겟하도록 매핑을 업데이트할 뿐입니다.

## Exec 승인

Matrix는 Matrix 계정에 대한 네이티브 승인 클라이언트로 작동할 수 있습니다. 네이티브
DM/채널 라우팅 노브는 여전히 exec 승인 구성 아래에 있습니다:

- `channels.matrix.execApprovals.enabled`
- `channels.matrix.execApprovals.approvers` (선택 사항; `channels.matrix.dm.allowFrom`으로 폴백)
- `channels.matrix.execApprovals.target` (`dm` | `channel` | `both`, 기본값: `dm`)
- `channels.matrix.execApprovals.agentFilter`
- `channels.matrix.execApprovals.sessionFilter`

승인자는 `@owner:example.org` 같은 Matrix 사용자 ID여야 합니다. Matrix는 `enabled`가 설정되지 않았거나 `"auto"`이고 최소 한 명의 승인자가 해석될 수 있을 때 네이티브 승인을 자동 활성화합니다. Exec 승인은 먼저 `execApprovals.approvers`를 사용하며 `channels.matrix.dm.allowFrom`으로 폴백할 수 있습니다. 플러그인 승인은 `channels.matrix.dm.allowFrom`을 통해 인증합니다. Matrix를 네이티브 승인 클라이언트로 명시적으로 비활성화하려면 `enabled: false`로 설정하세요. 그렇지 않으면 승인 요청은 다른 구성된 승인 경로 또는 승인 폴백 정책으로 폴백됩니다.

Matrix 네이티브 라우팅은 두 가지 승인 종류를 모두 지원합니다:

- `channels.matrix.execApprovals.*`는 Matrix 승인 프롬프트의 네이티브 DM/채널 팬아웃 모드를 제어합니다.
- Exec 승인은 `execApprovals.approvers` 또는 `channels.matrix.dm.allowFrom`의 exec 승인자 세트를 사용합니다.
- 플러그인 승인은 `channels.matrix.dm.allowFrom`의 Matrix DM 허용 목록을 사용합니다.
- Matrix 반응 단축키 및 메시지 업데이트는 exec 및 플러그인 승인 모두에 적용됩니다.

전달 규칙:

- `target: "dm"`은 승인자 DM에 승인 프롬프트를 전송합니다
- `target: "channel"`은 원본 Matrix room 또는 DM으로 프롬프트를 다시 전송합니다
- `target: "both"`는 승인자 DM과 원본 Matrix room 또는 DM 모두에 전송합니다

Matrix 승인 프롬프트는 기본 승인 메시지에 반응 단축키를 시드합니다:

- `✅` = 일회성 허용
- `❌` = 거부
- `♾️` = 유효한 exec 정책이 해당 결정을 허용하는 경우 항상 허용

승인자는 해당 메시지에 반응하거나 폴백 슬래시 명령을 사용할 수 있습니다: `/approve <id> allow-once`, `/approve <id> allow-always`, 또는 `/approve <id> deny`.

해석된 승인자만 승인하거나 거부할 수 있습니다. Exec 승인의 경우, 채널 전달은 명령 텍스트를 포함하므로 신뢰할 수 있는 room에서만 `channel` 또는 `both`를 활성화하세요.

계정별 재정의:

- `channels.matrix.accounts.<account>.execApprovals`

관련 문서: [Exec 승인](/tools/exec-approvals)

## 슬래시 명령

Matrix 슬래시 명령 (예: `/new`, `/reset`, `/model`)은 DM에서 직접 작동합니다. Room에서는, OpenClaw는 봇 자체 Matrix 언급으로 접두사가 붙은 슬래시 명령도 인식하므로, `@bot:server /new`는 커스텀 언급 정규식 없이 명령 경로를 트리거합니다. 이는 사용자가 명령을 입력하기 전에 봇을 tab-complete할 때 Element 및 유사한 클라이언트가 발행하는 room 스타일 `@mention /command` 게시물에 봇이 응답하도록 유지합니다.

인증 규칙은 여전히 적용됩니다: 명령 발신자는 일반 메시지처럼 DM 또는 room 허용 목록/소유자 정책을 충족해야 합니다.

## 다중 계정

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
            threadReplies: "off",
          },
        },
      },
    },
  },
}
```

최상위 수준 `channels.matrix` 값은 계정이 재정의하지 않는 한 명명된 계정의 기본값으로 작동합니다.
`groups.<room>.account`로 상속된 room 항목을 하나의 Matrix 계정으로 범위를 지정할 수 있습니다.
`account` 없는 항목은 모든 Matrix 계정에서 공유되며, `account: "default"`인 항목은 기본 계정이 최상위 수준 `channels.matrix.*`에 직접 구성된 경우에도 작동합니다.
부분 공유 인증 기본값은 그 자체로 별도의 암시적 기본 계정을 생성하지 않습니다. OpenClaw는 해당 기본값에 새 인증(`homeserver` 및 `accessToken`, 또는 `homeserver` 및 `userId` 및 `password`)이 있을 때만 최상위 `default` 계정을 합성합니다; 명명된 계정은 캐시된 자격 증명이 나중에 인증을 충족할 때 `homeserver` 및 `userId`로부터 계속 발견 가능할 수 있습니다.
Matrix에 정확히 하나의 명명된 계정이 있거나 `defaultAccount`가 기존 명명된 계정 키를 가리키는 경우, 단일 계정에서 다중 계정으로의 복구/설정 승격은 새 `accounts.default` 항목을 만드는 대신 해당 계정을 보존합니다. Matrix 인증/부트스트랩 키만 승격된 계정으로 이동하며, 공유 전달 정책 키는 최상위 수준에 유지됩니다.
OpenClaw가 암시적 라우팅, 프로빙 및 CLI 작업에 대해 하나의 명명된 Matrix 계정을 선호하게 하려면 `defaultAccount`를 설정하세요.
여러 Matrix 계정이 구성되어 있고 하나의 계정 ID가 `default`인 경우, OpenClaw는 `defaultAccount`가 설정되지 않아도 해당 계정을 암시적으로 사용합니다.
여러 명명된 계정을 구성하는 경우, 암시적 계정 선택에 의존하는 CLI 명령에 대해 `defaultAccount`를 설정하거나 `--account <id>`를 전달하세요.
하나의 명령에 대해 해당 암시적 선택을 재정의하려면 `openclaw matrix verify ...` 및 `openclaw matrix devices ...`에 `--account <id>`를 전달하세요.

공유 다중 계정 패턴은 [구성 참조](/gateway/config-channels#multi-account-all-channels)를 참조하세요.

## 비공개/LAN homeserver

기본적으로 OpenClaw는 계정별로 명시적으로 opt-in하지 않는 한 SSRF 보호를 위해 비공개/내부 Matrix homeserver를
차단합니다.

homeserver가 localhost, LAN/Tailscale IP 또는 내부 호스트 이름에서 실행되는 경우, 해당 Matrix 계정에 대해
`network.dangerouslyAllowPrivateNetwork`를 활성화하세요:

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

CLI 설정 예시:

```bash
openclaw matrix account add \
  --account ops \
  --homeserver http://matrix-synapse:8008 \
  --allow-private-network \
  --access-token syt_ops_xxx
```

이 opt-in은 신뢰할 수 있는 비공개/내부 타겟만 허용합니다. `http://matrix.example.org:8008` 같은
공개 cleartext homeserver는 여전히 차단됩니다. 가능한 한 `https://`를 선호하세요.

## Matrix 트래픽 프록시

Matrix 배포가 명시적 아웃바운드 HTTP(S) 프록시가 필요한 경우, `channels.matrix.proxy`를 설정하세요:

```json5
{
  channels: {
    matrix: {
      homeserver: "https://matrix.example.org",
      accessToken: "syt_bot_xxx",
      proxy: "http://127.0.0.1:7890",
    },
  },
}
```

명명된 계정은 `channels.matrix.accounts.<id>.proxy`로 최상위 수준 기본값을 재정의할 수 있습니다.
OpenClaw는 런타임 Matrix 트래픽과 계정 상태 프로브에 동일한 프록시 설정을 사용합니다.

## 타겟 해석

Matrix는 OpenClaw가 room 또는 사용자 타겟을 요청하는 모든 곳에서 다음 타겟 형식을 허용합니다:

- 사용자: `@user:server`, `user:@user:server`, 또는 `matrix:user:@user:server`
- Room: `!room:server`, `room:!room:server`, 또는 `matrix:room:!room:server`
- Alias: `#alias:server`, `channel:#alias:server`, 또는 `matrix:channel:#alias:server`

라이브 디렉토리 조회는 로그인된 Matrix 계정을 사용합니다:

- 사용자 조회는 해당 homeserver의 Matrix 사용자 디렉토리를 쿼리합니다.
- Room 조회는 명시적 room ID와 alias를 직접 허용한 다음, 해당 계정에 대해 참여 room 이름 검색으로 폴백합니다.
- 참여 room 이름 조회는 최선 노력입니다. Room 이름을 ID 또는 alias로 해석할 수 없으면, 런타임 허용 목록 해석에서 무시됩니다.

## 구성 참조

- `enabled`: 채널을 활성화 또는 비활성화합니다.
- `name`: 계정의 선택적 레이블.
- `defaultAccount`: 여러 Matrix 계정이 구성된 경우 선호되는 계정 ID.
- `homeserver`: homeserver URL, 예: `https://matrix.example.org`.
- `network.dangerouslyAllowPrivateNetwork`: 이 Matrix 계정이 비공개/내부 homeserver에 연결하도록 허용합니다. Homeserver가 `localhost`, LAN/Tailscale IP 또는 `matrix-synapse` 같은 내부 호스트로 해석될 때 활성화하세요.
- `proxy`: Matrix 트래픽용 선택적 HTTP(S) 프록시 URL. 명명된 계정은 자체 `proxy`로 최상위 수준 기본값을 재정의할 수 있습니다.
- `userId`: 전체 Matrix 사용자 ID, 예: `@bot:example.org`.
- `accessToken`: 토큰 기반 인증을 위한 access token. Plaintext 값과 SecretRef 값은 `channels.matrix.accessToken` 및 `channels.matrix.accounts.<id>.accessToken`에 대해 env/file/exec 프로바이더 전반에서 지원됩니다. [시크릿 관리](/gateway/secrets)를 참조하세요.
- `password`: password 기반 로그인용 password. Plaintext 값과 SecretRef 값이 지원됩니다.
- `deviceId`: 명시적 Matrix device ID.
- `deviceName`: password 로그인용 device 표시 이름.
- `avatarUrl`: 프로필 동기화 및 `profile set` 업데이트용 저장된 자체 아바타 URL.
- `initialSyncLimit`: 시작 동기화 중 가져올 최대 이벤트 수.
- `encryption`: E2EE 활성화.
- `allowlistOnly`: `true`일 때, `open` room 정책을 `allowlist`로 업그레이드하고, `disabled`를 제외한 모든 활성 DM 정책(`pairing` 및 `open` 포함)을 `allowlist`로 강제합니다. `disabled` 정책에는 영향을 주지 않습니다.
- `allowBots`: 구성된 다른 OpenClaw Matrix 계정의 메시지를 허용 (`true` 또는 `"mentions"`).
- `groupPolicy`: `open`, `allowlist`, 또는 `disabled`.
- `contextVisibility`: 보조 room 컨텍스트 가시성 모드 (`all`, `allowlist`, `allowlist_quote`).
- `groupAllowFrom`: Room 트래픽용 사용자 ID 허용 목록. 전체 Matrix 사용자 ID가 가장 안전합니다; 정확한 디렉토리 일치는 시작 시와 모니터 실행 중에 허용 목록이 변경될 때 해석됩니다. 해석되지 않은 이름은 무시됩니다.
- `historyLimit`: 그룹 기록 컨텍스트로 포함할 최대 room 메시지 수. `messages.groupChat.historyLimit`로 폴백합니다; 둘 다 설정되지 않은 경우 유효 기본값은 `0`입니다. `0`으로 설정하여 비활성화합니다.
- `replyToMode`: `off`, `first`, `all`, 또는 `batched`.
- `markdown`: 아웃바운드 Matrix 텍스트의 선택적 Markdown 렌더링 구성.
- `streaming`: `off` (기본값), `"partial"`, `"quiet"`, `true`, 또는 `false`. `"partial"` 및 `true`는 일반 Matrix 텍스트 메시지로 미리보기 우선 초안 업데이트를 활성화합니다. `"quiet"`는 자체 호스팅 푸시 규칙 설정을 위해 비알림 미리보기 통지를 사용합니다. `false`는 `"off"`와 동일합니다.
- `blockStreaming`: `true`는 초안 미리보기 스트리밍이 활성화된 동안 완료된 assistant 블록에 대해 별도의 진행 메시지를 활성화합니다.
- `threadReplies`: `off`, `inbound`, 또는 `always`.
- `threadBindings`: 스레드 바인딩 세션 라우팅 및 수명 주기에 대한 채널별 재정의.
- `startupVerification`: 시작 시 자동 자체 검증 요청 모드 (`if-unverified`, `off`).
- `startupVerificationCooldownHours`: 자동 시작 검증 요청을 재시도하기 전 쿨다운.
- `textChunkLimit`: 아웃바운드 메시지 청크 크기(문자 수) (`chunkMode`가 `length`일 때 적용).
- `chunkMode`: `length`는 문자 수로 메시지를 분할; `newline`은 줄 경계에서 분할.
- `responsePrefix`: 이 채널의 모든 아웃바운드 응답 앞에 추가되는 선택적 문자열.
- `ackReaction`: 이 채널/계정에 대한 선택적 ack 반응 재정의.
- `ackReactionScope`: 선택적 ack 반응 범위 재정의 (`group-mentions`, `group-all`, `direct`, `all`, `none`, `off`).
- `reactionNotifications`: 인바운드 반응 알림 모드 (`own`, `off`).
- `mediaMaxMb`: 아웃바운드 전송 및 인바운드 미디어 처리에 대한 MB 단위 미디어 크기 상한.
- `autoJoin`: 초대 auto-join 정책 (`always`, `allowlist`, `off`). 기본값: `off`. DM 스타일 초대를 포함한 모든 Matrix 초대에 적용됩니다.
- `autoJoinAllowlist`: `autoJoin`이 `allowlist`일 때 허용되는 room/alias. Alias 항목은 초대 처리 중에 room ID로 해석됩니다; OpenClaw는 초대된 room이 주장하는 alias 상태를 신뢰하지 않습니다.
- `dm`: DM 정책 블록 (`enabled`, `policy`, `allowFrom`, `sessionScope`, `threadReplies`).
- `dm.policy`: OpenClaw가 room에 참여하고 DM으로 분류한 후의 DM 접근을 제어합니다. 초대가 auto-join되는지 여부는 변경하지 않습니다.
- `dm.allowFrom`: DM 트래픽용 사용자 ID 허용 목록. 전체 Matrix 사용자 ID가 가장 안전합니다; 정확한 디렉토리 일치는 시작 시와 모니터 실행 중에 허용 목록이 변경될 때 해석됩니다. 해석되지 않은 이름은 무시됩니다.
- `dm.sessionScope`: `per-user` (기본값) 또는 `per-room`. 피어가 동일하더라도 각 Matrix DM room이 별도의 컨텍스트를 유지하도록 하려면 `per-room`을 사용하세요.
- `dm.threadReplies`: DM 전용 스레드 정책 재정의 (`off`, `inbound`, `always`). DM에서 응답 배치와 세션 격리 모두에 대해 최상위 수준 `threadReplies` 설정을 재정의합니다.
- `execApprovals`: Matrix 네이티브 exec 승인 전달 (`enabled`, `approvers`, `target`, `agentFilter`, `sessionFilter`).
- `execApprovals.approvers`: Exec 요청을 승인할 수 있는 Matrix 사용자 ID. `dm.allowFrom`이 이미 승인자를 식별하는 경우 선택 사항.
- `execApprovals.target`: `dm | channel | both` (기본값: `dm`).
- `accounts`: 명명된 계정별 재정의. 최상위 수준 `channels.matrix` 값은 이러한 항목의 기본값으로 작동합니다.
- `groups`: Room별 정책 맵. Room ID 또는 alias를 선호하세요; 해석되지 않은 room 이름은 런타임에서 무시됩니다. 세션/그룹 ID는 해석 후 안정적인 room ID를 사용합니다.
- `groups.<room>.account`: 다중 계정 설정에서 하나의 상속된 room 항목을 특정 Matrix 계정으로 제한합니다.
- `groups.<room>.allowBots`: 구성된 봇 발신자에 대한 room 수준 재정의 (`true` 또는 `"mentions"`).
- `groups.<room>.users`: Room별 발신자 허용 목록.
- `groups.<room>.tools`: Room별 도구 허용/거부 재정의.
- `groups.<room>.autoReply`: Room 수준 언급 게이팅 재정의. `true`는 해당 room에 대한 언급 요구 사항을 비활성화합니다; `false`는 다시 강제합니다.
- `groups.<room>.skills`: 선택적 room 수준 스킬 필터.
- `groups.<room>.systemPrompt`: 선택적 room 수준 시스템 프롬프트 스니펫.
- `rooms`: `groups`의 레거시 alias.
- `actions`: 액션별 도구 게이팅 (`messages`, `reactions`, `pins`, `profile`, `memberInfo`, `channelInfo`, `verification`).

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 언급 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지의 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
