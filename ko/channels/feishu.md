---
summary: "Feishu bot 개요, 기능 및 구성"
read_when:
  - Feishu/Lark bot 연결 시
  - Feishu 채널 구성 시
title: Feishu
---

# Feishu / Lark

Feishu/Lark는 팀이 채팅, 문서 공유, 일정 관리, 협업을 함께 수행하는 올인원 협업 플랫폼입니다.

**상태:** bot DM + 그룹 채팅에 대해 프로덕션 준비 완료. WebSocket이 기본 모드이며, webhook 모드는 선택적입니다.

---

## 빠른 시작

> **OpenClaw 2026.4.24 이상이 필요합니다.** 확인하려면 `openclaw --version`을 실행하세요. 업그레이드는 `openclaw update`로 수행합니다.

<Steps>
  <Step title="채널 설정 마법사 실행">
  ```bash
  openclaw channels login --channel feishu
  ```
  Feishu/Lark 모바일 앱으로 QR 코드를 스캔하면 Feishu/Lark bot이 자동 생성됩니다.
  </Step>
  
  <Step title="설정 완료 후 변경 사항을 적용하려면 게이트웨이를 재시작합니다">
  ```bash
  openclaw gateway restart
  ```
  </Step>
</Steps>

---

## 접근 제어

### Direct message

`dmPolicy`를 구성해 bot에 DM할 수 있는 사용자를 제어합니다:

- `"pairing"` — 알 수 없는 사용자는 페어링 코드를 받음. CLI로 승인
- `"allowlist"` — `allowFrom`에 나열된 사용자만 채팅 가능 (기본값: bot 소유자만)
- `"open"` — 모든 사용자 허용
- `"disabled"` — 모든 DM 비활성화

**페어링 요청 승인:**

```bash
openclaw pairing list feishu
openclaw pairing approve feishu <CODE>
```

### 그룹 채팅

**그룹 정책** (`channels.feishu.groupPolicy`):

| 값            | 동작                                          |
| ------------- | --------------------------------------------- |
| `"open"`      | 그룹의 모든 메시지에 응답                     |
| `"allowlist"` | `groupAllowFrom`에 있는 그룹에만 응답        |
| `"disabled"`  | 모든 그룹 메시지 비활성화                     |

기본값: `allowlist`

**@mention 요구** (`channels.feishu.requireMention`):

- `true` — @mention 필요 (기본값)
- `false` — @mention 없이 응답
- 그룹별 재정의: `channels.feishu.groups.<chat_id>.requireMention`

---

## 그룹 설정 예시

### 모든 그룹 허용, @mention 불필요

```json5
{
  channels: {
    feishu: {
      groupPolicy: "open",
    },
  },
}
```

### 모든 그룹 허용, 여전히 @mention 필요

```json5
{
  channels: {
    feishu: {
      groupPolicy: "open",
      requireMention: true,
    },
  },
}
```

### 특정 그룹만 허용

```json5
{
  channels: {
    feishu: {
      groupPolicy: "allowlist",
      // 그룹 ID는 다음과 같은 형태: oc_xxx
      groupAllowFrom: ["oc_xxx", "oc_yyy"],
    },
  },
}
```

### 그룹 내 발신자 제한

```json5
{
  channels: {
    feishu: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["oc_xxx"],
      groups: {
        oc_xxx: {
          // 사용자 open_id는 다음과 같은 형태: ou_xxx
          allowFrom: ["ou_user1", "ou_user2"],
        },
      },
    },
  },
}
```

---

<a id="get-groupuser-ids"></a>

## 그룹/사용자 ID 조회

### 그룹 ID (`chat_id`, 형식: `oc_xxx`)

Feishu/Lark에서 그룹을 열고 오른쪽 상단의 메뉴 아이콘을 클릭한 뒤 **Settings**로 이동합니다. 그룹 ID (`chat_id`)가 설정 페이지에 표시됩니다.

![Get Group ID](/images/feishu-get-group-id.png)

### 사용자 ID (`open_id`, 형식: `ou_xxx`)

게이트웨이를 시작하고 bot에 DM을 보낸 뒤 로그를 확인합니다:

```bash
openclaw logs --follow
```

로그 출력에서 `open_id`를 찾으세요. 대기 중인 페어링 요청도 확인할 수 있습니다:

```bash
openclaw pairing list feishu
```

---

## 주요 명령

| 명령      | 설명                         |
| --------- | ---------------------------- |
| `/status` | bot 상태 표시                |
| `/reset`  | 현재 세션 리셋               |
| `/model`  | AI 모델 표시 또는 전환       |

> Feishu/Lark는 네이티브 슬래시 명령 메뉴를 지원하지 않으므로, 이들은 일반 텍스트 메시지로 전송하세요.

---

## 문제 해결

### bot이 그룹 채팅에서 응답하지 않음

1. bot이 그룹에 추가되어 있는지 확인
2. bot을 @mention하는지 확인 (기본적으로 필요)
3. `groupPolicy`가 `"disabled"`가 아닌지 확인
4. 로그 확인: `openclaw logs --follow`

### bot이 메시지를 수신하지 않음

1. bot이 Feishu Open Platform / Lark Developer에 게시되고 승인되었는지 확인
2. 이벤트 구독에 `im.message.receive_v1`이 포함되어 있는지 확인
3. **persistent connection** (WebSocket)이 선택되었는지 확인
4. 필요한 모든 권한 스코프가 부여되었는지 확인
5. 게이트웨이가 실행 중인지 확인: `openclaw gateway status`
6. 로그 확인: `openclaw logs --follow`

### App Secret 유출

1. Feishu Open Platform / Lark Developer에서 App Secret을 재설정
2. 구성에서 값을 업데이트
3. 게이트웨이 재시작: `openclaw gateway restart`

---

## 고급 구성

### 멀티 계정

```json5
{
  channels: {
    feishu: {
      defaultAccount: "main",
      accounts: {
        main: {
          appId: "cli_xxx",
          appSecret: "xxx",
          name: "Primary bot",
        },
        backup: {
          appId: "cli_yyy",
          appSecret: "yyy",
          name: "Backup bot",
          enabled: false,
        },
      },
    },
  },
}
```

`defaultAccount`는 아웃바운드 API가 `accountId`를 지정하지 않을 때 사용되는 계정을 제어합니다.

### 메시지 제한

- `textChunkLimit` — 아웃바운드 텍스트 청크 크기 (기본값: `2000` 문자)
- `mediaMaxMb` — 미디어 업로드/다운로드 제한 (기본값: `30` MB)

### 스트리밍

Feishu/Lark는 인터랙티브 카드를 통한 스트리밍 응답을 지원합니다. 활성화되면 bot은 텍스트를 생성하면서 카드를 실시간으로 업데이트합니다.

```json5
{
  channels: {
    feishu: {
      streaming: true, // 스트리밍 카드 출력 활성화 (기본값: true)
      blockStreaming: true, // 블록 단위 스트리밍 활성화 (기본값: true)
    },
  },
}
```

전체 응답을 하나의 메시지로 전송하려면 `streaming: false`로 설정하세요.

### 쿼터 최적화

두 가지 선택 플래그로 Feishu/Lark API 호출 횟수를 줄일 수 있습니다:

- `typingIndicator` (기본값 `true`): 타이핑 반응 호출을 건너뛰려면 `false`로 설정
- `resolveSenderNames` (기본값 `true`): 발신자 프로필 조회를 건너뛰려면 `false`로 설정

```json5
{
  channels: {
    feishu: {
      typingIndicator: false,
      resolveSenderNames: false,
    },
  },
}
```

### ACP 세션

Feishu/Lark는 DM과 그룹 스레드 메시지에 대해 ACP를 지원합니다. Feishu/Lark ACP는 텍스트 명령으로 구동됩니다. 네이티브 슬래시 명령 메뉴가 없으므로 대화에서 직접 `/acp ...` 메시지를 사용하세요.

#### 영구 ACP 바인딩

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace/openclaw",
          },
        },
      },
    ],
  },
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "feishu",
        accountId: "default",
        peer: { kind: "direct", id: "ou_1234567890" },
      },
    },
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "feishu",
        accountId: "default",
        peer: { kind: "group", id: "oc_group_chat:topic:om_topic_root" },
      },
      acp: { label: "codex-feishu-topic" },
    },
  ],
}
```

#### 채팅에서 ACP 생성

Feishu/Lark DM 또는 스레드에서:

```text
/acp spawn codex --thread here
```

`--thread here`는 DM과 Feishu/Lark 스레드 메시지 모두에서 동작합니다. 바인딩된 대화의 후속 메시지는 해당 ACP 세션으로 직접 라우팅됩니다.

### 멀티 에이전트 라우팅

`bindings`를 사용해 Feishu/Lark DM 또는 그룹을 서로 다른 에이전트로 라우팅합니다.

```json5
{
  agents: {
    list: [
      { id: "main" },
      { id: "agent-a", workspace: "/home/user/agent-a" },
      { id: "agent-b", workspace: "/home/user/agent-b" },
    ],
  },
  bindings: [
    {
      agentId: "agent-a",
      match: {
        channel: "feishu",
        peer: { kind: "direct", id: "ou_xxx" },
      },
    },
    {
      agentId: "agent-b",
      match: {
        channel: "feishu",
        peer: { kind: "group", id: "oc_zzz" },
      },
    },
  ],
}
```

라우팅 필드:

- `match.channel`: `"feishu"`
- `match.peer.kind`: `"direct"` (DM) 또는 `"group"` (그룹 채팅)
- `match.peer.id`: 사용자 Open ID (`ou_xxx`) 또는 그룹 ID (`oc_xxx`)

조회 방법은 [그룹/사용자 ID 조회](#get-groupuser-ids)를 참고하세요.

---

## 구성 참조

전체 구성: [게이트웨이 구성](/gateway/configuration)

| 설정                                               | 설명                                         | 기본값            |
| -------------------------------------------------- | -------------------------------------------- | ----------------- |
| `channels.feishu.enabled`                          | 채널 활성화/비활성화                         | `true`            |
| `channels.feishu.domain`                           | API 도메인 (`feishu` 또는 `lark`)           | `feishu`          |
| `channels.feishu.connectionMode`                   | 이벤트 전송 (`websocket` 또는 `webhook`)    | `websocket`       |
| `channels.feishu.defaultAccount`                   | 아웃바운드 라우팅의 기본 계정                | `default`         |
| `channels.feishu.verificationToken`                | webhook 모드에서 필수                        | —                 |
| `channels.feishu.encryptKey`                       | webhook 모드에서 필수                        | —                 |
| `channels.feishu.webhookPath`                      | webhook 경로                                 | `/feishu/events`  |
| `channels.feishu.webhookHost`                      | webhook bind host                            | `127.0.0.1`       |
| `channels.feishu.webhookPort`                      | webhook bind port                            | `3000`            |
| `channels.feishu.accounts.<id>.appId`              | App ID                                       | —                 |
| `channels.feishu.accounts.<id>.appSecret`          | App Secret                                   | —                 |
| `channels.feishu.accounts.<id>.domain`             | 계정별 도메인 재정의                         | `feishu`          |
| `channels.feishu.dmPolicy`                         | DM 정책                                      | `allowlist`       |
| `channels.feishu.allowFrom`                        | DM 허용 목록 (open_id 리스트)                | [BotOwnerId]      |
| `channels.feishu.groupPolicy`                      | 그룹 정책                                    | `allowlist`       |
| `channels.feishu.groupAllowFrom`                   | 그룹 허용 목록                               | —                 |
| `channels.feishu.requireMention`                   | 그룹에서 @mention 필요                       | `true`            |
| `channels.feishu.groups.<chat_id>.requireMention`  | 그룹별 @mention 재정의                       | 상속됨            |
| `channels.feishu.groups.<chat_id>.enabled`         | 특정 그룹 활성화/비활성화                    | `true`            |
| `channels.feishu.textChunkLimit`                   | 메시지 청크 크기                             | `2000`            |
| `channels.feishu.mediaMaxMb`                       | 미디어 크기 제한                             | `30`              |
| `channels.feishu.streaming`                        | 스트리밍 카드 출력                           | `true`            |
| `channels.feishu.blockStreaming`                   | 블록 단위 스트리밍                           | `true`            |
| `channels.feishu.typingIndicator`                  | 타이핑 반응 전송                             | `true`            |
| `channels.feishu.resolveSenderNames`               | 발신자 표시 이름 해석                        | `true`            |

---

## 지원되는 메시지 유형

### 수신

- ✅ 텍스트
- ✅ Rich text (post)
- ✅ 이미지
- ✅ 파일
- ✅ 오디오
- ✅ 비디오/미디어
- ✅ 스티커

### 전송

- ✅ 텍스트
- ✅ 이미지
- ✅ 파일
- ✅ 오디오
- ✅ 비디오/미디어
- ✅ 인터랙티브 카드 (스트리밍 업데이트 포함)
- ⚠️ Rich text (post 스타일 서식; Feishu/Lark의 모든 작성 기능을 지원하지는 않음)

### 스레드 및 응답

- ✅ 인라인 응답
- ✅ 스레드 응답
- ✅ 스레드 메시지에 응답할 때 미디어 응답도 스레드를 유지

---

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 mention gating
- [채널 라우팅](/channels/channel-routing) — 메시지 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 하드닝
