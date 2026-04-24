---
summary: "WhatsApp 채널 지원, 접근 제어, 전달 동작 및 운영"
read_when:
  - WhatsApp/웹 채널 동작 또는 인박스 라우팅 작업 시
title: "WhatsApp"
---

상태: WhatsApp Web(Baileys)을 통한 프로덕션 준비 완료. 게이트웨이가 연결된 세션을 소유합니다.

## 설치 (주문형)

- 온보딩(`openclaw onboard`) 및 `openclaw channels add --channel whatsapp`은
  처음 WhatsApp을 선택할 때 WhatsApp 플러그인 설치를 요청합니다.
- `openclaw channels login --channel whatsapp`도 플러그인이 아직 없는 경우
  설치 흐름을 제공합니다.
- 개발 채널 + git checkout: 로컬 플러그인 경로로 기본 설정됩니다.
- 안정/베타: npm 패키지 `@openclaw/whatsapp`으로 기본 설정됩니다.

수동 설치도 여전히 사용 가능합니다:

```bash
openclaw plugins install @openclaw/whatsapp
```

<CardGroup cols={3}>
  <Card title="페어링" icon="link" href="/channels/pairing">
    기본 DM 정책은 알 수 없는 발신자에 대해 페어링입니다.
  </Card>
  <Card title="채널 문제 해결" icon="wrench" href="/channels/troubleshooting">
    채널 간 진단 및 복구 플레이북입니다.
  </Card>
  <Card title="게이트웨이 구성" icon="settings" href="/gateway/configuration">
    전체 채널 구성 패턴과 예시입니다.
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

    특정 계정의 경우:

```bash
openclaw channels login --channel whatsapp --account work
```

  </Step>

  <Step title="게이트웨이 시작">

```bash
openclaw gateway
```

  </Step>

  <Step title="첫 페어링 요청 승인 (페어링 모드 사용 시)">

```bash
openclaw pairing list whatsapp
openclaw pairing approve whatsapp <CODE>
```

    페어링 요청은 1시간 후 만료됩니다. 대기 중인 요청은 채널당 최대 3개로 제한됩니다.

  </Step>
</Steps>

<Note>
OpenClaw는 가능하면 WhatsApp을 별도 번호에서 실행할 것을 권장합니다. (채널 메타데이터와 설정 흐름은 이 설정에 최적화되어 있지만, 개인 번호 설정도 지원됩니다.)
</Note>

## 배포 패턴

<AccordionGroup>
  <Accordion title="전용 번호 (권장)">
    가장 깔끔한 운영 모드입니다:

    - OpenClaw용 별도 WhatsApp 신원
    - 더 명확한 DM allowlist와 라우팅 경계
    - 자가 채팅(self-chat) 혼동 가능성 감소

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
    온보딩은 개인 번호 모드를 지원하며 self-chat 친화적인 기본값을 기록합니다:

    - `dmPolicy: "allowlist"`
    - `allowFrom`에 개인 번호 포함
    - `selfChatMode: true`

    런타임에서 self-chat 보호는 연결된 self 번호와 `allowFrom`을 기반으로 작동합니다.

  </Accordion>

  <Accordion title="WhatsApp Web 전용 채널 범위">
    메시징 플랫폼 채널은 현재 OpenClaw 채널 아키텍처에서 WhatsApp Web 기반(`Baileys`)입니다.

    내장 chat-channel 레지스트리에는 별도의 Twilio WhatsApp 메시징 채널이 없습니다.

  </Accordion>
</AccordionGroup>

## 런타임 모델

- 게이트웨이가 WhatsApp 소켓과 재연결 루프를 소유합니다.
- 아웃바운드 전송은 대상 계정에 대한 활성 WhatsApp listener가 필요합니다.
- Status 및 broadcast 채팅은 무시됩니다 (`@status`, `@broadcast`).
- 다이렉트 채팅은 DM 세션 규칙을 사용합니다 (`session.dmScope`; 기본값 `main`은 DM을 에이전트 main 세션으로 collapse).
- 그룹 세션은 격리됩니다 (`agent:<agentId>:whatsapp:group:<jid>`).
- WhatsApp Web transport는 게이트웨이 호스트의 표준 프록시 환경 변수(`HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY` / 소문자 변형)를 존중합니다. 채널별 WhatsApp 프록시 설정보다 호스트 수준 프록시 구성을 선호하세요.

## 접근 제어 및 활성화

<Tabs>
  <Tab title="DM 정책">
    `channels.whatsapp.dmPolicy`는 다이렉트 채팅 접근을 제어합니다:

    - `pairing` (기본값)
    - `allowlist`
    - `open` (`allowFrom`에 `"*"` 포함 필요)
    - `disabled`

    `allowFrom`은 E.164 스타일 번호를 허용합니다 (내부적으로 정규화됨).

    Multi-account override: `channels.whatsapp.accounts.<id>.dmPolicy` (및 `allowFrom`)는 해당 계정에 대해 채널 수준 기본값보다 우선합니다.

    런타임 동작 세부 사항:

    - 페어링은 채널 allow-store에 지속되며 구성된 `allowFrom`과 병합됩니다
    - allowlist가 구성되지 않은 경우, 연결된 self 번호가 기본적으로 허용됩니다
    - OpenClaw는 아웃바운드 `fromMe` DM(연결된 기기에서 자신에게 보낸 메시지)을 자동 페어링하지 않습니다

  </Tab>

  <Tab title="그룹 정책 + allowlist">
    그룹 접근에는 두 개의 레이어가 있습니다:

    1. **그룹 멤버십 allowlist** (`channels.whatsapp.groups`)
       - `groups`가 생략되면, 모든 그룹이 자격을 얻습니다
       - `groups`가 있으면, 그룹 allowlist로 작동합니다 (`"*"` 허용됨)

    2. **그룹 발신자 정책** (`channels.whatsapp.groupPolicy` + `groupAllowFrom`)
       - `open`: 발신자 allowlist 우회
       - `allowlist`: 발신자가 `groupAllowFrom`과 일치해야 함 (또는 `*`)
       - `disabled`: 모든 그룹 인바운드 차단

    발신자 allowlist 폴백:

    - `groupAllowFrom`이 설정되지 않은 경우, 런타임은 사용 가능한 경우 `allowFrom`으로 폴백합니다
    - 발신자 allowlist는 멘션/답장 활성화 전에 평가됩니다

    참고: `channels.whatsapp` 블록이 전혀 없는 경우, `channels.defaults.groupPolicy`가 설정되어 있어도 런타임 group-policy 폴백은 `allowlist`입니다 (경고 로그와 함께).

  </Tab>

  <Tab title="멘션 + /activation">
    그룹 응답은 기본적으로 멘션이 필요합니다.

    멘션 감지는 다음을 포함합니다:

    - 봇 identity의 명시적 WhatsApp 멘션
    - 구성된 멘션 정규식 패턴 (`agents.list[].groupChat.mentionPatterns`, 폴백 `messages.groupChat.mentionPatterns`)
    - 암시적 reply-to-bot 감지 (답장 발신자가 봇 identity와 일치)

    보안 참고:

    - quote/reply는 멘션 게이팅만 충족하며, 발신자 인증을 부여하지 **않습니다**
    - `groupPolicy: "allowlist"`에서 non-allowlisted 발신자는 allowlisted 사용자의 메시지에 답장해도 여전히 차단됩니다

    세션 수준 activation 명령:

    - `/activation mention`
    - `/activation always`

    `activation`은 세션 상태를 업데이트합니다 (전역 구성이 아님). 소유자 게이팅됩니다.

  </Tab>
</Tabs>

## 개인 번호 및 self-chat 동작

연결된 self 번호가 `allowFrom`에도 존재하는 경우, WhatsApp self-chat 보호 장치가 활성화됩니다:

- self-chat 턴에 대해 읽음 영수증 건너뛰기
- 자신에게 ping을 보내는 멘션 JID 자동 트리거 동작 무시
- `messages.responsePrefix`가 설정되지 않은 경우, self-chat 응답은 기본값으로 `[{identity.name}]` 또는 `[openclaw]`를 사용합니다

## 메시지 정규화 및 컨텍스트

<AccordionGroup>
  <Accordion title="인바운드 envelope + 답장 컨텍스트">
    들어오는 WhatsApp 메시지는 공유 인바운드 envelope로 래핑됩니다.

    인용 답장이 존재하면, 컨텍스트는 다음 형식으로 추가됩니다:

    ```text
    [Replying to <sender> id:<stanzaId>]
    <quoted body or media placeholder>
    [/Replying]
    ```

    답장 메타데이터 필드는 사용 가능할 때 채워집니다 (`ReplyToId`, `ReplyToBody`, `ReplyToSender`, 발신자 JID/E.164).

  </Accordion>

  <Accordion title="미디어 placeholder 및 위치/연락처 추출">
    미디어 전용 인바운드 메시지는 다음과 같은 placeholder로 정규화됩니다:

    - `<media:image>`
    - `<media:video>`
    - `<media:audio>`
    - `<media:document>`
    - `<media:sticker>`

    위치 본문은 간결한 좌표 텍스트를 사용합니다. 위치 라벨/주석과 연락처/vCard 세부 정보는 인라인 prompt 텍스트가 아닌 fenced untrusted 메타데이터로 렌더링됩니다.

  </Accordion>

  <Accordion title="대기 중인 그룹 히스토리 주입">
    그룹의 경우, 처리되지 않은 메시지를 버퍼링하여 봇이 최종적으로 트리거될 때 컨텍스트로 주입할 수 있습니다.

    - 기본 제한: `50`
    - config: `channels.whatsapp.historyLimit`
    - 폴백: `messages.groupChat.historyLimit`
    - `0`은 비활성화

    주입 마커:

    - `[Chat messages since your last reply - for context]`
    - `[Current message - respond to this]`

  </Accordion>

  <Accordion title="읽음 영수증">
    읽음 영수증은 수락된 인바운드 WhatsApp 메시지에 대해 기본적으로 활성화됩니다.

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

    계정별 override:

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

    Self-chat 턴은 전역적으로 활성화되어 있어도 읽음 영수증을 건너뜁니다.

  </Accordion>
</AccordionGroup>

## 전달, 청킹, 미디어

<AccordionGroup>
  <Accordion title="텍스트 청킹">
    - 기본 청크 제한: `channels.whatsapp.textChunkLimit = 4000`
    - `channels.whatsapp.chunkMode = "length" | "newline"`
    - `newline` 모드는 단락 경계(빈 줄)를 선호한 후, 길이 안전한 청킹으로 폴백합니다
  </Accordion>

  <Accordion title="아웃바운드 미디어 동작">
    - 이미지, 비디오, 오디오(PTT voice-note), 문서 페이로드 지원
    - `audio/ogg`는 voice-note 호환성을 위해 `audio/ogg; codecs=opus`로 재작성됩니다
    - 애니메이션 GIF 재생은 비디오 전송에서 `gifPlayback: true`를 통해 지원됩니다
    - 여러 미디어 답장 페이로드를 전송할 때 캡션은 첫 번째 미디어 항목에 적용됩니다
    - 미디어 소스는 HTTP(S), `file://` 또는 로컬 경로일 수 있습니다
  </Accordion>

  <Accordion title="미디어 크기 제한과 폴백 동작">
    - 인바운드 미디어 저장 한도: `channels.whatsapp.mediaMaxMb` (기본값 `50`)
    - 아웃바운드 미디어 전송 한도: `channels.whatsapp.mediaMaxMb` (기본값 `50`)
    - 계정별 override는 `channels.whatsapp.accounts.<accountId>.mediaMaxMb`를 사용합니다
    - 이미지는 제한에 맞추기 위해 자동 최적화됩니다 (리사이즈/품질 sweep)
    - 미디어 전송 실패 시, 응답을 조용히 drop하는 대신 첫 번째 항목 폴백으로 텍스트 경고를 전송합니다
  </Accordion>
</AccordionGroup>

## 답장 인용

WhatsApp은 네이티브 답장 인용을 지원하며, 아웃바운드 답장이 인바운드 메시지를 시각적으로 인용합니다. `channels.whatsapp.replyToMode`로 제어합니다.

| 값       | 동작                                                                                |
| -------- | --------------------------------------------------------------------------------- |
| `"auto"` | 공급자가 지원할 때 인바운드 메시지를 인용하고, 그렇지 않으면 인용을 건너뜁니다                                |
| `"on"`   | 항상 인바운드 메시지를 인용하고, 인용이 거부되면 일반 전송으로 폴백합니다                                   |
| `"off"`  | 절대 인용하지 않고, 일반 메시지로 전송합니다                                                      |

기본값은 `"auto"`입니다. 계정별 override는 `channels.whatsapp.accounts.<id>.replyToMode`를 사용합니다.

```json5
{
  channels: {
    whatsapp: {
      replyToMode: "on",
    },
  },
}
```

## Reaction 레벨

`channels.whatsapp.reactionLevel`은 에이전트가 WhatsApp에서 이모지 reaction을 얼마나 광범위하게 사용하는지 제어합니다:

| 레벨          | Ack reaction | 에이전트 주도 reaction | 설명                                                 |
| ------------- | ------------- | --------------------- | -------------------------------------------------- |
| `"off"`       | 아니오          | 아니오                  | reaction 없음                                        |
| `"ack"`       | 예             | 아니오                  | Ack reaction만 (응답 전 수신 확인)                         |
| `"minimal"`   | 예             | 예 (보수적)             | Ack + 보수적 가이드와 함께 에이전트 reaction                    |
| `"extensive"` | 예             | 예 (권장)              | Ack + 권장 가이드와 함께 에이전트 reaction                     |

기본값: `"minimal"`.

계정별 override는 `channels.whatsapp.accounts.<id>.reactionLevel`을 사용합니다.

```json5
{
  channels: {
    whatsapp: {
      reactionLevel: "ack",
    },
  },
}
```

## 확인(acknowledgment) reactions

WhatsApp은 `channels.whatsapp.ackReaction`을 통해 인바운드 수신 시 즉시 ack reaction을 지원합니다.
Ack reaction은 `reactionLevel`에 의해 게이팅되며 — `reactionLevel`이 `"off"`일 때 억제됩니다.

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
- 실패는 기록되지만 정상 답장 전달을 차단하지 않습니다
- 그룹 모드 `mentions`는 멘션으로 트리거된 턴에 reaction합니다. 그룹 activation `always`는 이 체크를 우회합니다
- WhatsApp은 `channels.whatsapp.ackReaction`을 사용합니다 (레거시 `messages.ackReaction`은 여기서 사용되지 않음)

## Multi-account 및 자격 증명

<AccordionGroup>
  <Accordion title="계정 선택 및 기본값">
    - 계정 ID는 `channels.whatsapp.accounts`에서 제공됩니다
    - 기본 계정 선택: `default`가 있으면 `default`, 그렇지 않으면 첫 번째 구성된 계정 ID (정렬됨)
    - 계정 ID는 조회를 위해 내부적으로 정규화됩니다
  </Accordion>

  <Accordion title="자격 증명 경로 및 레거시 호환성">
    - 현재 auth 경로: `~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
    - 백업 파일: `creds.json.bak`
    - `~/.openclaw/credentials/`의 레거시 기본 auth는 기본 계정 흐름에서 여전히 인식/마이그레이션됩니다
  </Accordion>

  <Accordion title="로그아웃 동작">
    `openclaw channels logout --channel whatsapp [--account <id>]`는 해당 계정의 WhatsApp auth 상태를 지웁니다.

    레거시 auth 디렉토리에서는 `oauth.json`이 보존되고 Baileys auth 파일이 제거됩니다.

  </Accordion>
</AccordionGroup>

## 도구, 액션, 구성 쓰기

- 에이전트 도구 지원에는 WhatsApp reaction 액션 (`react`)이 포함됩니다.
- 액션 게이트:
  - `channels.whatsapp.actions.reactions`
  - `channels.whatsapp.actions.polls`
- 채널 주도 구성 쓰기는 기본적으로 활성화됩니다 (`channels.whatsapp.configWrites=false`로 비활성화).

## 문제 해결

<AccordionGroup>
  <Accordion title="연결되지 않음 (QR 필요)">
    증상: 채널 상태가 연결되지 않음을 보고합니다.

    해결:

    ```bash
    openclaw channels login --channel whatsapp
    openclaw channels status
    ```

  </Accordion>

  <Accordion title="연결되었지만 연결이 끊김 / 재연결 루프">
    증상: 연결된 계정이 반복적인 연결 끊김 또는 재연결 시도를 겪음.

    해결:

    ```bash
    openclaw doctor
    openclaw logs --follow
    ```

    필요한 경우 `channels login`으로 다시 연결하세요.

  </Accordion>

  <Accordion title="전송 시 활성 listener 없음">
    아웃바운드 전송은 대상 계정에 활성 게이트웨이 listener가 없을 때 빠르게 실패합니다.

    게이트웨이가 실행 중이고 계정이 연결되어 있는지 확인하세요.

  </Accordion>

  <Accordion title="그룹 메시지가 예기치 않게 무시됨">
    다음 순서로 확인하세요:

    - `groupPolicy`
    - `groupAllowFrom` / `allowFrom`
    - `groups` allowlist 항목
    - 멘션 게이팅 (`requireMention` + 멘션 패턴)
    - `openclaw.json` (JSON5)의 중복 키: 뒤 항목이 앞 항목을 override하므로 각 scope당 `groupPolicy`를 하나만 유지하세요

  </Accordion>

  <Accordion title="Bun 런타임 경고">
    WhatsApp 게이트웨이 런타임은 Node를 사용해야 합니다. Bun은 안정적인 WhatsApp/Telegram 게이트웨이 운영에 호환되지 않는 것으로 표시됩니다.
  </Accordion>
</AccordionGroup>

## 시스템 프롬프트

WhatsApp은 `groups`와 `direct` 맵을 통해 그룹과 다이렉트 채팅에 대해 Telegram 스타일 시스템 프롬프트를 지원합니다.

그룹 메시지의 해석 계층:

유효한 `groups` 맵이 먼저 결정됩니다: 계정이 자체 `groups`를 정의하면, 루트 `groups` 맵을 완전히 대체합니다 (deep merge 없음). 프롬프트 조회는 그런 다음 결과 단일 맵에서 실행됩니다:

1. **그룹별 시스템 프롬프트** (`groups["<groupId>"].systemPrompt`): 특정 그룹 항목이 `systemPrompt`를 정의하면 사용됩니다.
2. **그룹 와일드카드 시스템 프롬프트** (`groups["*"].systemPrompt`): 특정 그룹 항목이 없거나 `systemPrompt`를 정의하지 않을 때 사용됩니다.

다이렉트 메시지의 해석 계층:

유효한 `direct` 맵이 먼저 결정됩니다: 계정이 자체 `direct`를 정의하면, 루트 `direct` 맵을 완전히 대체합니다 (deep merge 없음). 프롬프트 조회는 그런 다음 결과 단일 맵에서 실행됩니다:

1. **피어별 시스템 프롬프트** (`direct["<peerId>"].systemPrompt`): 특정 피어 항목이 `systemPrompt`를 정의하면 사용됩니다.
2. **다이렉트 와일드카드 시스템 프롬프트** (`direct["*"].systemPrompt`): 특정 피어 항목이 없거나 `systemPrompt`를 정의하지 않을 때 사용됩니다.

참고: `dms`는 여전히 가벼운 per-DM 히스토리 override 버킷입니다 (`dms.<id>.historyLimit`). 프롬프트 override는 `direct` 아래에 있습니다.

**Telegram multi-account 동작과의 차이점:** Telegram에서는 multi-account 설정의 모든 계정에 대해 루트 `groups`가 의도적으로 억제됩니다 — 자체 `groups`를 정의하지 않은 계정에 대해서도 — 봇이 속하지 않은 그룹의 메시지를 수신하는 것을 방지하기 위함입니다. WhatsApp은 이 가드를 적용하지 않습니다: 루트 `groups`와 루트 `direct`는 계정 수준 override를 정의하지 않는 계정에서 항상 상속되며, 얼마나 많은 계정이 구성되었는지와 관계없습니다. Multi-account WhatsApp 설정에서 계정별 그룹 또는 다이렉트 프롬프트를 원하면, 루트 수준 기본값에 의존하기보다는 각 계정 아래에 전체 맵을 명시적으로 정의하세요.

중요한 동작:

- `channels.whatsapp.groups`는 per-group 구성 맵이자 채팅 수준 그룹 allowlist입니다. 루트 또는 계정 scope에서 `groups["*"]`는 해당 scope에서 "모든 그룹이 허용됨"을 의미합니다.
- 해당 scope가 이미 모든 그룹을 허용하길 원할 때만 와일드카드 그룹 `systemPrompt`를 추가하세요. 고정된 그룹 ID 세트만 자격을 얻도록 하려면, 프롬프트 기본값으로 `groups["*"]`를 사용하지 마세요. 대신 각 명시적으로 allowlisted된 그룹 항목에 프롬프트를 반복하세요.
- 그룹 승인과 발신자 인증은 별개의 체크입니다. `groups["*"]`는 그룹 처리에 도달할 수 있는 그룹 세트를 확장하지만, 그 자체로는 해당 그룹의 모든 발신자를 인증하지 않습니다. 발신자 접근은 여전히 `channels.whatsapp.groupPolicy`와 `channels.whatsapp.groupAllowFrom`에 의해 별도로 제어됩니다.
- `channels.whatsapp.direct`는 DM에 대해 동일한 부작용이 없습니다. `direct["*"]`는 DM이 `dmPolicy` + `allowFrom` 또는 pairing-store 규칙에 의해 이미 승인된 후에만 기본 다이렉트 채팅 구성을 제공합니다.

예시:

```json5
{
  channels: {
    whatsapp: {
      groups: {
        // Use only if all groups should be admitted at the root scope.
        // Applies to all accounts that do not define their own groups map.
        "*": { systemPrompt: "Default prompt for all groups." },
      },
      direct: {
        // Applies to all accounts that do not define their own direct map.
        "*": { systemPrompt: "Default prompt for all direct chats." },
      },
      accounts: {
        work: {
          groups: {
            // This account defines its own groups, so root groups are fully
            // replaced. To keep a wildcard, define "*" explicitly here too.
            "120363406415684625@g.us": {
              requireMention: false,
              systemPrompt: "Focus on project management.",
            },
            // Use only if all groups should be admitted in this account.
            "*": { systemPrompt: "Default prompt for work groups." },
          },
          direct: {
            // This account defines its own direct map, so root direct entries are
            // fully replaced. To keep a wildcard, define "*" explicitly here too.
            "+15551234567": { systemPrompt: "Prompt for a specific work direct chat." },
            "*": { systemPrompt: "Default prompt for work direct chats." },
          },
        },
      },
    },
  },
}
```

## 구성 참조 포인터

기본 참조:

- [구성 참조 - WhatsApp](/gateway/config-channels#whatsapp)

주요 WhatsApp 필드:

- 접근: `dmPolicy`, `allowFrom`, `groupPolicy`, `groupAllowFrom`, `groups`
- 전달: `textChunkLimit`, `chunkMode`, `mediaMaxMb`, `sendReadReceipts`, `ackReaction`, `reactionLevel`
- multi-account: `accounts.<id>.enabled`, `accounts.<id>.authDir`, 계정 수준 override
- 운영: `configWrites`, `debounceMs`, `web.enabled`, `web.heartbeatSeconds`, `web.reconnect.*`
- 세션 동작: `session.dmScope`, `historyLimit`, `dmHistoryLimit`, `dms.<id>.historyLimit`
- 프롬프트: `groups.<id>.systemPrompt`, `groups["*"].systemPrompt`, `direct.<id>.systemPrompt`, `direct["*"].systemPrompt`

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [보안](/gateway/security/)
- [채널 라우팅](/channels/channel-routing)
- [멀티 에이전트 라우팅](/concepts/multi-agent)
- [문제 해결](/channels/troubleshooting)
