---
summary: "WhatsApp 채널 지원, 접근 제어, 전달 동작 및 운영"
read_when:
  - WhatsApp/웹 채널 동작 또는 인박스 라우팅 작업
title: "WhatsApp"
---

# WhatsApp (웹 채널)

상태: WhatsApp Web(Baileys)을 통해 프로덕션 준비 완료. 게이트웨이가 연결된 세션을 소유합니다.

## 설치 (주문형)

- 온보딩(`openclaw onboard`) 및 `openclaw channels add --channel whatsapp`은
  처음 WhatsApp을 선택할 때 WhatsApp 플러그인 설치를 요청합니다.
- `openclaw channels login --channel whatsapp`도 플러그인이 아직 없는 경우 설치 흐름을 제공합니다.
- 개발 채널 + git checkout: 로컬 플러그인 경로로 기본 설정됩니다.
- 안정/베타: npm 패키지 `@openclaw/whatsapp`으로 기본 설정됩니다.

수동 설치도 가능합니다:

```bash
openclaw plugins install @openclaw/whatsapp
```

<CardGroup cols={3}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    기본 DM 정책은 알 수 없는 발신자에 대해 페어링입니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    크로스 채널 진단 및 복구 플레이북.
  </Card>
  <Card title="게이트웨이 구성" icon="settings" href="/gateway/configuration">
    전체 채널 구성 패턴 및 예시.
  </Card>
</CardGroup>

## 빠른 설정

<Steps>
  <Step title="WhatsApp 접근 정책 구성">

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "pairing",
      allowFrom: ["+15551234567"],
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"],
    },
  },
}
```

  </Step>

  <Step title="WhatsApp 연결 (QR)">

```bash
openclaw channels login --channel whatsapp
```

    특정 계정용:

```bash
openclaw channels login --channel whatsapp --account work
```

  </Step>

  <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

  </Step>

  <Step title="첫 번째 페어링 요청 승인 (페어링 모드 사용 시)">

```bash
openclaw pairing list whatsapp
openclaw pairing approve whatsapp <CODE>
```

    페어링 요청은 1시간 후 만료됩니다. 보류 중인 요청은 채널당 3개로 제한됩니다.

  </Step>
</Steps>

<Note>
OpenClaw는 가능한 경우 별도의 번호로 WhatsApp을 실행할 것을 권장합니다. (채널 메타데이터와 설정 흐름은 해당 설정에 최적화되어 있지만, 개인 번호 설정도 지원됩니다.)
</Note>

## 배포 패턴

<AccordionGroup>
  <Accordion title="전용 번호 (권장)">
    가장 깔끔한 운영 모드입니다:

    - OpenClaw를 위한 별도의 WhatsApp 신원
    - 더 명확한 DM 허용 목록 및 라우팅 경계
    - 자기 채팅 혼동 가능성 낮음

    최소 정책 패턴:

    ```json5
    {
      channels: {
        whatsapp: {
          dmPolicy: "allowlist",
          allowFrom: ["+15551234567"],
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="개인 번호 폴백">
    온보딩은 개인 번호 모드를 지원하며 자기 채팅 친화적 기준을 작성합니다:

    - `dmPolicy: "allowlist"`
    - `allowFrom`에 개인 번호 포함
    - `selfChatMode: true`

    런타임에서 자기 채팅 보호는 연결된 자기 번호와 `allowFrom`을 기반으로 합니다.

  </Accordion>

  <Accordion title="WhatsApp 웹 전용 채널 범위">
    메시징 플랫폼 채널은 현재 OpenClaw 채널 아키텍처에서 WhatsApp 웹 기반(`Baileys`)입니다.

    내장 채팅 채널 레지스트리에는 별도의 Twilio WhatsApp 메시징 채널이 없습니다.

  </Accordion>
</AccordionGroup>

## 런타임 모델

- 게이트웨이가 WhatsApp 소켓 및 재연결 루프를 소유합니다.
- 아웃바운드 전송에는 대상 계정에 대한 활성 WhatsApp 리스너가 필요합니다.
- 상태 및 브로드캐스트 채팅은 무시됩니다(`@status`, `@broadcast`).
- 다이렉트 채팅은 DM 세션 규칙을 사용합니다(`session.dmScope`; 기본값 `main`은 DM을 에이전트 메인 세션으로 축소).
- 그룹 세션은 격리됩니다(`agent:<agentId>:whatsapp:group:<jid>`).
- WhatsApp 웹 전송은 게이트웨이 호스트의 표준 프록시 환경 변수를 준수합니다(`HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY` / 소문자 변형). 채널별 WhatsApp 프록시 설정보다 호스트 수준 프록시 구성을 선호하십시오.

## 접근 제어 및 활성화

<Tabs>
  <Tab title="DM 정책">
    `channels.whatsapp.dmPolicy`는 다이렉트 채팅 접근을 제어합니다:

    - `pairing` (기본값)
    - `allowlist`
    - `open` (`allowFrom`에 `"*"` 포함 필요)
    - `disabled`

    `allowFrom`은 E.164 형식 번호를 허용합니다(내부적으로 정규화됨).

    멀티 계정 오버라이드: `channels.whatsapp.accounts.<id>.dmPolicy`(및 `allowFrom`)는 해당 계정에 대해 채널 수준 기본값보다 우선합니다.

    런타임 동작 세부 사항:

    - 페어링은 채널 허용 저장소에 유지되고 구성된 `allowFrom`과 병합됩니다
    - 허용 목록이 구성되지 않은 경우, 연결된 자기 번호가 기본적으로 허용됩니다
    - 아웃바운드 `fromMe` DM은 자동으로 페어링되지 않습니다

  </Tab>

  <Tab title="그룹 정책 + 허용 목록">
    그룹 접근에는 두 가지 레이어가 있습니다:

    1. **그룹 멤버십 허용 목록** (`channels.whatsapp.groups`)
       - `groups`가 생략되면 모든 그룹이 적합합니다
       - `groups`가 있으면 그룹 허용 목록 역할을 합니다(`"*"` 허용)

    2. **그룹 발신자 정책** (`channels.whatsapp.groupPolicy` + `groupAllowFrom`)
       - `open`: 발신자 허용 목록 우회
       - `allowlist`: 발신자가 `groupAllowFrom`(또는 `*`)과 일치해야 함
       - `disabled`: 모든 그룹 인바운드 차단

    발신자 허용 목록 폴백:

    - `groupAllowFrom`이 설정되지 않은 경우, 런타임은 `allowFrom`이 있을 때 폴백합니다
    - 발신자 허용 목록은 언급/답장 활성화 전에 평가됩니다

    참고: `channels.whatsapp` 블록이 전혀 없는 경우, 런타임 그룹 정책 폴백은 `allowlist`입니다(`channels.defaults.groupPolicy`가 설정되어 있어도 경고 로그 포함).

  </Tab>

  <Tab title="언급 + /활성화">
    그룹 답장은 기본적으로 언급이 필요합니다.

    언급 감지 포함:

    - 봇 신원에 대한 명시적 WhatsApp 언급
    - 구성된 언급 regex 패턴(`agents.list[].groupChat.mentionPatterns`, 폴백 `messages.groupChat.mentionPatterns`)
    - 암묵적 봇 답장 감지(답장 발신자가 봇 신원과 일치)

    보안 참고:

    - 인용/답장은 언급 게이팅을 충족합니다. 발신자 인증은 **부여하지 않습니다**
    - `groupPolicy: "allowlist"`에서는 허용 목록에 없는 발신자가 허용 목록 사용자의 메시지에 답장하더라도 여전히 차단됩니다

    세션 수준 활성화 명령:

    - `/activation mention`
    - `/activation always`

    `activation`은 세션 상태를 업데이트합니다(전역 구성 아님). 소유자 게이팅됩니다.

  </Tab>
</Tabs>

## 개인 번호 및 자기 채팅 동작

연결된 자기 번호가 `allowFrom`에도 있으면 WhatsApp 자기 채팅 보호가 활성화됩니다:

- 자기 채팅 턴에 대한 읽음 확인 건너뜀
- 자신에게 핑을 보낼 수 있는 언급-JID 자동 트리거 동작 무시
- `messages.responsePrefix`가 설정되지 않은 경우, 자기 채팅 답장은 기본적으로 `[{identity.name}]` 또는 `[openclaw]`

## 메시지 정규화 및 컨텍스트

<AccordionGroup>
  <Accordion title="인바운드 봉투 + 답장 컨텍스트">
    들어오는 WhatsApp 메시지는 공유 인바운드 봉투에 래핑됩니다.

    인용된 답장이 있는 경우 컨텍스트가 다음 형식으로 추가됩니다:

    ```text
    [Replying to <sender> id:<stanzaId>]
    <quoted body or media placeholder>
    [/Replying]
    ```

    답장 메타데이터 필드도 사용 가능한 경우 채워집니다(`ReplyToId`, `ReplyToBody`, `ReplyToSender`, 발신자 JID/E.164).

  </Accordion>

  <Accordion title="미디어 플레이스홀더 및 위치/연락처 추출">
    미디어 전용 인바운드 메시지는 다음과 같은 플레이스홀더로 정규화됩니다:

    - `<media:image>`
    - `<media:video>`
    - `<media:audio>`
    - `<media:document>`
    - `<media:sticker>`

    위치 및 연락처 페이로드는 라우팅 전에 텍스트 컨텍스트로 정규화됩니다.

  </Accordion>

  <Accordion title="보류 중인 그룹 기록 주입">
    그룹의 경우, 처리되지 않은 메시지는 버퍼링되어 봇이 트리거될 때 컨텍스트로 주입될 수 있습니다.

    - 기본 제한: `50`
    - 구성: `channels.whatsapp.historyLimit`
    - 폴백: `messages.groupChat.historyLimit`
    - `0`은 비활성화

    주입 마커:

    - `[Chat messages since your last reply - for context]`
    - `[Current message - respond to this]`

  </Accordion>

  <Accordion title="읽음 확인">
    읽음 확인은 허용된 인바운드 WhatsApp 메시지에 대해 기본적으로 활성화됩니다.

    전역 비활성화:

    ```json5
    {
      channels: {
        whatsapp: {
          sendReadReceipts: false,
        },
      },
    }
    ```

    계정별 오버라이드:

    ```json5
    {
      channels: {
        whatsapp: {
          accounts: {
            work: {
              sendReadReceipts: false,
            },
          },
        },
      },
    }
    ```

    자기 채팅 턴은 전역 활성화되어 있어도 읽음 확인을 건너뜁니다.

  </Accordion>
</AccordionGroup>

## 전달, 청크 분할, 미디어

<AccordionGroup>
  <Accordion title="텍스트 청크 분할">
    - 기본 청크 제한: `channels.whatsapp.textChunkLimit = 4000`
    - `channels.whatsapp.chunkMode = "length" | "newline"`
    - `newline` 모드는 단락 경계(빈 줄)를 선호하고, 길이 안전 청크 분할로 폴백합니다
  </Accordion>

  <Accordion title="아웃바운드 미디어 동작">
    - 이미지, 동영상, 오디오(PTT 음성 메모), 문서 페이로드 지원
    - `audio/ogg`는 음성 메모 호환성을 위해 `audio/ogg; codecs=opus`로 재작성됩니다
    - 애니메이션 GIF 재생은 동영상 전송 시 `gifPlayback: true`를 통해 지원됩니다
    - 다중 미디어 답장 페이로드 전송 시 첫 번째 미디어 항목에 캡션이 적용됩니다
    - 미디어 소스는 HTTP(S), `file://`, 또는 로컬 경로가 될 수 있습니다
  </Accordion>

  <Accordion title="미디어 크기 제한 및 폴백 동작">
    - 인바운드 미디어 저장 한도: `channels.whatsapp.mediaMaxMb` (기본값 `50`)
    - 아웃바운드 미디어 전송 한도: `channels.whatsapp.mediaMaxMb` (기본값 `50`)
    - 계정별 오버라이드는 `channels.whatsapp.accounts.<accountId>.mediaMaxMb` 사용
    - 이미지는 제한에 맞게 자동 최적화됩니다(크기 조정/품질 스윕)
    - 미디어 전송 실패 시, 첫 번째 항목 폴백으로 응답을 조용히 삭제하는 대신 텍스트 경고를 보냅니다
  </Accordion>
</AccordionGroup>

## 반응 수준

`channels.whatsapp.reactionLevel`은 에이전트가 WhatsApp에서 이모지 반응을 얼마나 광범위하게 사용하는지 제어합니다:

| 수준          | 확인 반응 | 에이전트 시작 반응 | 설명                                           |
| ------------- | --------- | ------------------ | ---------------------------------------------- |
| `"off"`       | 아니오    | 아니오             | 반응 없음                                      |
| `"ack"`       | 예        | 아니오             | 확인 반응만 (응답 전 영수증)                   |
| `"minimal"`   | 예        | 예 (보수적)        | 확인 + 보수적 지침으로 에이전트 반응           |
| `"extensive"` | 예        | 예 (권장)          | 확인 + 권장 지침으로 에이전트 반응             |

기본값: `"minimal"`.

계정별 오버라이드는 `channels.whatsapp.accounts.<id>.reactionLevel` 사용.

```json5
{
  channels: {
    whatsapp: {
      reactionLevel: "ack",
    },
  },
}
```

## 확인 반응

WhatsApp은 `channels.whatsapp.ackReaction`을 통해 인바운드 수신 즉시 확인 반응을 지원합니다.
확인 반응은 `reactionLevel`에 의해 게이팅됩니다. `reactionLevel`이 `"off"`이면 억제됩니다.

```json5
{
  channels: {
    whatsapp: {
      ackReaction: {
        emoji: "👀",
        direct: true,
        group: "mentions", // always | mentions | never
      },
    },
  },
}
```

동작 참고:

- 인바운드가 수락된 직후(응답 전)에 전송됩니다
- 실패는 로그되지만 정상 응답 전달을 차단하지 않습니다
- 그룹 모드 `mentions`는 언급 트리거된 턴에 반응합니다. 그룹 활성화 `always`는 이 확인에 대한 우회 역할을 합니다
- WhatsApp은 `channels.whatsapp.ackReaction`을 사용합니다(레거시 `messages.ackReaction`은 여기서 사용되지 않음)

## 멀티 계정 및 자격 증명

<AccordionGroup>
  <Accordion title="계정 선택 및 기본값">
    - 계정 ID는 `channels.whatsapp.accounts`에서 가져옵니다
    - 기본 계정 선택: 있으면 `default`, 없으면 첫 번째로 구성된 계정 ID(정렬됨)
    - 계정 ID는 조회를 위해 내부적으로 정규화됩니다
  </Accordion>

  <Accordion title="자격 증명 경로 및 레거시 호환성">
    - 현재 인증 경로: `~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
    - 백업 파일: `creds.json.bak`
    - `~/.openclaw/credentials/`의 레거시 기본 인증은 기본 계정 흐름에서 여전히 인식/마이그레이션됩니다
  </Accordion>

  <Accordion title="로그아웃 동작">
    `openclaw channels logout --channel whatsapp [--account <id>]`는 해당 계정의 WhatsApp 인증 상태를 지웁니다.

    레거시 인증 디렉토리에서 `oauth.json`은 보존되고 Baileys 인증 파일은 제거됩니다.

  </Accordion>
</AccordionGroup>

## 도구, 작업 및 구성 쓰기

- 에이전트 도구 지원에는 WhatsApp 반응 작업(`react`)이 포함됩니다.
- 작업 게이트:
  - `channels.whatsapp.actions.reactions`
  - `channels.whatsapp.actions.polls`
- 채널 시작 구성 쓰기는 기본적으로 활성화됩니다(`channels.whatsapp.configWrites=false`로 비활성화).

## 문제 해결

<AccordionGroup>
  <Accordion title="연결되지 않음 (QR 필요)">
    증상: 채널 상태에 연결되지 않음으로 표시됩니다.

    수정:

    ```bash
    openclaw channels login --channel whatsapp
    openclaw channels status
    ```

  </Accordion>

  <Accordion title="연결되었지만 연결 해제/재연결 루프">
    증상: 반복적인 연결 해제 또는 재연결 시도가 있는 연결된 계정.

    수정:

    ```bash
    openclaw doctor
    openclaw logs --follow
    ```

    필요한 경우 `channels login`으로 재연결합니다.

  </Accordion>

  <Accordion title="전송 시 활성 리스너 없음">
    대상 계정에 활성 게이트웨이 리스너가 없으면 아웃바운드 전송이 빠르게 실패합니다.

    게이트웨이가 실행 중이고 계정이 연결되어 있는지 확인하십시오.

  </Accordion>

  <Accordion title="그룹 메시지가 예기치 않게 무시됨">
    다음 순서로 확인하십시오:

    - `groupPolicy`
    - `groupAllowFrom` / `allowFrom`
    - `groups` 허용 목록 항목
    - 언급 게이팅(`requireMention` + 언급 패턴)
    - `openclaw.json`(JSON5)의 중복 키: 이후 항목이 이전 항목을 재정의하므로 범위당 단일 `groupPolicy`를 유지하십시오

  </Accordion>

  <Accordion title="Bun 런타임 경고">
    WhatsApp 게이트웨이 런타임은 Node를 사용해야 합니다. Bun은 안정적인 WhatsApp/Telegram 게이트웨이 작동에 호환되지 않는 것으로 표시됩니다.
  </Accordion>
</AccordionGroup>

## 구성 참조 포인터

기본 참조:

- [구성 참조 - WhatsApp](/gateway/configuration-reference#whatsapp)

중요 WhatsApp 필드:

- 접근: `dmPolicy`, `allowFrom`, `groupPolicy`, `groupAllowFrom`, `groups`
- 전달: `textChunkLimit`, `chunkMode`, `mediaMaxMb`, `sendReadReceipts`, `ackReaction`, `reactionLevel`
- 멀티 계정: `accounts.<id>.enabled`, `accounts.<id>.authDir`, 계정 수준 오버라이드
- 운영: `configWrites`, `debounceMs`, `web.enabled`, `web.heartbeatSeconds`, `web.reconnect.*`
- 세션 동작: `session.dmScope`, `historyLimit`, `dmHistoryLimit`, `dms.<id>.historyLimit`

## 관련

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [보안](/gateway/security)
- [채널 라우팅](/channels/channel-routing)
- [멀티 에이전트 라우팅](/concepts/multi-agent)
- [문제 해결](/channels/troubleshooting)
