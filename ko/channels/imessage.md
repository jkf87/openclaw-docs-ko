---
summary: "imsg (JSON-RPC over stdio)를 통한 레거시 iMessage 지원. 신규 설치는 BlueBubbles를 사용하세요."
read_when:
  - iMessage 지원 설정 시
  - iMessage 송수신 디버깅 시
title: "iMessage"
---

# iMessage (레거시: imsg)

<Warning>
신규 iMessage 배포에는 <a href="/channels/bluebubbles">BlueBubbles</a>를 사용하세요.

`imsg` 통합은 레거시이며 향후 릴리스에서 제거될 수 있습니다.
</Warning>

상태: 레거시 외부 CLI 통합. 게이트웨이는 `imsg rpc`를 spawn하고 stdio의 JSON-RPC로 통신합니다 (별도 데몬/포트 없음).

<CardGroup cols={3}>
  <Card title="BlueBubbles (권장)" icon="message-circle" href="/channels/bluebubbles">
    신규 설치를 위한 권장 iMessage 경로입니다.
  </Card>
  <Card title="페어링" icon="link" href="/channels/pairing">
    iMessage DM은 기본적으로 페어링 모드입니다.
  </Card>
  <Card title="구성 참조" icon="settings" href="/gateway/config-channels#imessage">
    iMessage 필드 전체 참조.
  </Card>
</CardGroup>

## 빠른 설정

<Tabs>
  <Tab title="로컬 Mac (fast path)">
    <Steps>
      <Step title="imsg 설치 및 확인">

```bash
brew install steipete/tap/imsg
imsg rpc --help
```

      </Step>

      <Step title="OpenClaw 구성">

```json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "/usr/local/bin/imsg",
      dbPath: "/Users/user/Library/Messages/chat.db",
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

      <Step title="첫 DM 페어링 승인 (기본 dmPolicy)">

```bash
openclaw pairing list imessage
openclaw pairing approve imessage <CODE>
```

        페어링 요청은 1시간 후 만료됩니다.
      </Step>
    </Steps>

  </Tab>

  <Tab title="SSH를 통한 원격 Mac">
    OpenClaw는 stdio 호환 `cliPath`만 요구하므로, 원격 Mac에 SSH로 접속해 `imsg`를 실행하는 래퍼 스크립트를 `cliPath`로 지정할 수 있습니다.

```bash
#!/usr/bin/env bash
exec ssh -T gateway-host imsg "$@"
```

    첨부 파일을 활성화한 경우 권장 구성:

```json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "~/.openclaw/scripts/imsg-ssh",
      remoteHost: "user@gateway-host", // SCP 첨부 파일 fetch에 사용
      includeAttachments: true,
      // 선택: 허용된 첨부 파일 root 재정의.
      // 기본값에는 /Users/*/Library/Messages/Attachments 포함
      attachmentRoots: ["/Users/*/Library/Messages/Attachments"],
      remoteAttachmentRoots: ["/Users/*/Library/Messages/Attachments"],
    },
  },
}
```

    `remoteHost`가 설정되지 않으면 OpenClaw는 SSH 래퍼 스크립트를 파싱해 자동 감지를 시도합니다.
    `remoteHost`는 `host` 또는 `user@host`여야 합니다 (공백이나 SSH 옵션 불가).
    OpenClaw는 SCP에 strict host-key checking을 사용하므로, 릴레이 host key가 `~/.ssh/known_hosts`에 이미 존재해야 합니다.
    첨부 파일 경로는 허용된 root (`attachmentRoots` / `remoteAttachmentRoots`)에 대해 검증됩니다.

  </Tab>
</Tabs>

## 요구 사항 및 권한 (macOS)

- `imsg`를 실행하는 Mac에 Messages가 로그인되어 있어야 합니다.
- OpenClaw/`imsg`를 실행하는 프로세스 컨텍스트에 Full Disk Access가 필요합니다 (Messages DB 접근).
- Messages.app을 통해 메시지를 보내려면 Automation 권한이 필요합니다.

<Tip>
권한은 프로세스 컨텍스트별로 부여됩니다. 게이트웨이가 headless (LaunchAgent/SSH)로 실행되는 경우, 동일한 컨텍스트에서 일회성 인터랙티브 명령을 실행해 프롬프트를 트리거하세요:

```bash
imsg chats --limit 1
# 또는
imsg send <handle> "test"
```

</Tip>

## 접근 제어 및 라우팅

<Tabs>
  <Tab title="DM 정책">
    `channels.imessage.dmPolicy`가 direct message를 제어합니다:

    - `pairing` (기본값)
    - `allowlist`
    - `open` (`allowFrom`에 `"*"`를 포함해야 함)
    - `disabled`

    허용 목록 필드: `channels.imessage.allowFrom`.

    허용 목록 항목은 handle 또는 chat 타겟 (`chat_id:*`, `chat_guid:*`, `chat_identifier:*`)이 될 수 있습니다.

  </Tab>

  <Tab title="그룹 정책 + mention">
    `channels.imessage.groupPolicy`가 그룹 처리를 제어합니다:

    - `allowlist` (구성 시 기본값)
    - `open`
    - `disabled`

    그룹 발신자 허용 목록: `channels.imessage.groupAllowFrom`.

    런타임 폴백: `groupAllowFrom`이 설정되지 않으면, iMessage 그룹 발신자 검사는 사용 가능할 때 `allowFrom`으로 폴백합니다.
    런타임 참고: `channels.imessage`가 완전히 누락되면 런타임은 `groupPolicy="allowlist"`로 폴백하고 경고를 기록합니다 (`channels.defaults.groupPolicy`가 설정되어 있어도 마찬가지).

    그룹에 대한 mention gating:

    - iMessage에는 네이티브 mention 메타데이터가 없습니다
    - mention 감지는 regex 패턴을 사용합니다 (`agents.list[].groupChat.mentionPatterns`, 폴백 `messages.groupChat.mentionPatterns`)
    - 구성된 패턴이 없으면 mention gating을 강제할 수 없습니다

    권한 있는 발신자의 control 명령은 그룹의 mention gating을 우회할 수 있습니다.

  </Tab>

  <Tab title="세션 및 결정론적 응답">
    - DM은 direct 라우팅을 사용하고, 그룹은 그룹 라우팅을 사용합니다.
    - 기본 `session.dmScope=main`에서는 iMessage DM이 에이전트 메인 세션으로 축소됩니다.
    - 그룹 세션은 격리됩니다 (`agent:<agentId>:imessage:group:<chat_id>`).
    - 응답은 원본 채널/타겟 메타데이터를 사용해 iMessage로 다시 라우팅됩니다.

    그룹-유사 스레드 동작:

    일부 멀티 참여자 iMessage 스레드는 `is_group=false`로 도착할 수 있습니다.
    해당 `chat_id`가 `channels.imessage.groups` 아래에 명시적으로 구성되어 있으면, OpenClaw는 이를 그룹 트래픽으로 취급합니다 (그룹 gating + 그룹 세션 격리).

  </Tab>
</Tabs>

## ACP 대화 바인딩

레거시 iMessage 채팅도 ACP 세션에 바인딩할 수 있습니다.

빠른 운영자 흐름:

- DM 또는 허용된 그룹 채팅 내에서 `/acp spawn codex --bind here`를 실행합니다.
- 같은 iMessage 대화의 이후 메시지는 spawn된 ACP 세션으로 라우팅됩니다.
- `/new`와 `/reset`은 동일한 바인딩된 ACP 세션을 그 자리에서 리셋합니다.
- `/acp close`는 ACP 세션을 닫고 바인딩을 제거합니다.

구성된 영구 바인딩은 `type: "acp"`와 `match.channel: "imessage"`를 사용하는 최상위 `bindings[]` 항목을 통해 지원됩니다.

`match.peer.id`에 사용할 수 있는 값:

- 정규화된 DM handle (예: `+15555550123` 또는 `user@example.com`)
- `chat_id:<id>` (안정적인 그룹 바인딩에 권장)
- `chat_guid:<guid>`
- `chat_identifier:<identifier>`

예시:

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: { agent: "codex", backend: "acpx", mode: "persistent" },
        },
      },
    ],
  },
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "imessage",
        accountId: "default",
        peer: { kind: "group", id: "chat_id:123" },
      },
      acp: { label: "codex-group" },
    },
  ],
}
```

공유 ACP 바인딩 동작은 [ACP 에이전트](/tools/acp-agents)를 참고하세요.

## 배포 패턴

<AccordionGroup>
  <Accordion title="전용 bot macOS 사용자 (별도 iMessage 아이덴티티)">
    전용 Apple ID와 macOS 사용자를 사용해 bot 트래픽을 개인 Messages 프로필과 격리합니다.

    일반적인 흐름:

    1. 전용 macOS 사용자를 생성/로그인합니다.
    2. 해당 사용자에서 bot Apple ID로 Messages에 로그인합니다.
    3. 해당 사용자에 `imsg`를 설치합니다.
    4. OpenClaw가 해당 사용자 컨텍스트에서 `imsg`를 실행할 수 있도록 SSH 래퍼를 만듭니다.
    5. `channels.imessage.accounts.<id>.cliPath`와 `.dbPath`를 해당 사용자 프로필로 설정합니다.

    첫 실행에서는 해당 bot 사용자 세션에서 GUI 승인 (Automation + Full Disk Access)이 필요할 수 있습니다.

  </Accordion>

  <Accordion title="Tailscale을 통한 원격 Mac (예시)">
    일반적인 토폴로지:

    - 게이트웨이는 Linux/VM에서 실행
    - iMessage + `imsg`는 tailnet의 Mac에서 실행
    - `cliPath` 래퍼가 SSH로 `imsg` 실행
    - `remoteHost`로 SCP 첨부 파일 fetch 활성화

    예시:

```json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "~/.openclaw/scripts/imsg-ssh",
      remoteHost: "bot@mac-mini.tailnet-1234.ts.net",
      includeAttachments: true,
      dbPath: "/Users/bot/Library/Messages/chat.db",
    },
  },
}
```

```bash
#!/usr/bin/env bash
exec ssh -T bot@mac-mini.tailnet-1234.ts.net imsg "$@"
```

    SSH와 SCP 모두 non-interactive로 동작하도록 SSH key를 사용하세요.
    host key가 먼저 신뢰되도록 (예: `ssh bot@mac-mini.tailnet-1234.ts.net`) `known_hosts`가 채워졌는지 확인하세요.

  </Accordion>

  <Accordion title="멀티 계정 패턴">
    iMessage는 `channels.imessage.accounts` 아래에서 계정별 구성을 지원합니다.

    각 계정은 `cliPath`, `dbPath`, `allowFrom`, `groupPolicy`, `mediaMaxMb`, 히스토리 설정, 첨부 파일 root 허용 목록 등의 필드를 재정의할 수 있습니다.

  </Accordion>
</AccordionGroup>

## 미디어, 청크 및 전달 타겟

<AccordionGroup>
  <Accordion title="첨부 파일 및 미디어">
    - 인바운드 첨부 파일 수집은 선택적: `channels.imessage.includeAttachments`
    - `remoteHost`가 설정된 경우 원격 첨부 파일 경로를 SCP로 fetch 가능
    - 첨부 파일 경로는 허용된 root와 일치해야 합니다:
      - `channels.imessage.attachmentRoots` (로컬)
      - `channels.imessage.remoteAttachmentRoots` (원격 SCP 모드)
      - 기본 root 패턴: `/Users/*/Library/Messages/Attachments`
    - SCP는 strict host-key checking을 사용합니다 (`StrictHostKeyChecking=yes`)
    - 아웃바운드 미디어 크기는 `channels.imessage.mediaMaxMb` 사용 (기본값 16 MB)
  </Accordion>

  <Accordion title="아웃바운드 청크">
    - 텍스트 청크 제한: `channels.imessage.textChunkLimit` (기본값 4000)
    - 청크 모드: `channels.imessage.chunkMode`
      - `length` (기본값)
      - `newline` (단락 우선 분할)
  </Accordion>

  <Accordion title="주소 형식">
    명시적 타겟 (권장):

    - `chat_id:123` (안정적인 라우팅에 권장)
    - `chat_guid:...`
    - `chat_identifier:...`

    Handle 타겟도 지원됩니다:

    - `imessage:+1555...`
    - `sms:+1555...`
    - `user@example.com`

```bash
imsg chats --limit 20
```

  </Accordion>
</AccordionGroup>

## 설정 쓰기

iMessage는 기본적으로 채널-초기 설정 쓰기를 허용합니다 (`commands.config: true`일 때 `/config set|unset`용).

비활성화:

```json5
{
  channels: {
    imessage: {
      configWrites: false,
    },
  },
}
```

## 문제 해결

<AccordionGroup>
  <Accordion title="imsg를 찾을 수 없거나 RPC 미지원">
    바이너리와 RPC 지원을 검증합니다:

```bash
imsg rpc --help
openclaw channels status --probe
```

    probe가 RPC 미지원을 보고하면 `imsg`를 업데이트하세요.

  </Accordion>

  <Accordion title="DM이 무시됨">
    확인:

    - `channels.imessage.dmPolicy`
    - `channels.imessage.allowFrom`
    - 페어링 승인 (`openclaw pairing list imessage`)

  </Accordion>

  <Accordion title="그룹 메시지가 무시됨">
    확인:

    - `channels.imessage.groupPolicy`
    - `channels.imessage.groupAllowFrom`
    - `channels.imessage.groups` 허용 목록 동작
    - mention 패턴 설정 (`agents.list[].groupChat.mentionPatterns`)

  </Accordion>

  <Accordion title="원격 첨부 파일 실패">
    확인:

    - `channels.imessage.remoteHost`
    - `channels.imessage.remoteAttachmentRoots`
    - 게이트웨이 호스트에서의 SSH/SCP key 인증
    - 게이트웨이 호스트의 `~/.ssh/known_hosts`에 host key 존재
    - Messages를 실행 중인 Mac에서 원격 경로의 읽기 가능 여부

  </Accordion>

  <Accordion title="macOS 권한 프롬프트를 놓친 경우">
    같은 사용자/세션 컨텍스트의 인터랙티브 GUI 터미널에서 재실행하고 프롬프트를 승인합니다:

```bash
imsg chats --limit 1
imsg send <handle> "test"
```

    OpenClaw/`imsg`를 실행하는 프로세스 컨텍스트에 Full Disk Access와 Automation이 부여되었는지 확인하세요.

  </Accordion>
</AccordionGroup>

## 구성 참조 포인터

- [구성 참조 - iMessage](/gateway/config-channels#imessage)
- [게이트웨이 구성](/gateway/configuration)
- [페어링](/channels/pairing)
- [BlueBubbles](/channels/bluebubbles)

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 mention gating
- [채널 라우팅](/channels/channel-routing) — 메시지 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 하드닝
