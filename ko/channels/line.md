---
summary: "LINE Messaging API 플러그인 설정, 구성 및 사용법"
read_when:
  - OpenClaw를 LINE에 연결하려는 경우
  - LINE webhook + 자격 증명 설정이 필요한 경우
  - LINE 전용 메시지 옵션이 필요한 경우
title: LINE
---

LINE은 LINE Messaging API를 통해 OpenClaw에 연결됩니다. 플러그인은 게이트웨이에서 webhook
수신기로 실행되며, channel access token + channel secret을 인증에 사용합니다.

상태: 번들 플러그인. 다이렉트 메시지, 그룹 채팅, 미디어, 위치, Flex 메시지,
template 메시지, quick reply가 지원됩니다. 리액션과 스레드는
지원되지 않습니다.

## 번들 플러그인

LINE은 현재 OpenClaw 릴리스에 번들 플러그인으로 제공되므로, 일반적인
패키지 빌드에서는 별도 설치가 필요하지 않습니다.

이전 빌드이거나 LINE이 제외된 커스텀 설치를 사용 중이라면, 다음과 같이 수동으로
설치하세요:

```bash
openclaw plugins install @openclaw/line
```

로컬 체크아웃(git 저장소에서 실행 시):

```bash
openclaw plugins install ./path/to/local/line-plugin
```

## 설정

1. LINE Developers 계정을 만들고 Console을 엽니다:
   [https://developers.line.biz/console/](https://developers.line.biz/console/)
2. Provider를 만들거나 선택한 후 **Messaging API** 채널을 추가합니다.
3. 채널 설정에서 **Channel access token**과 **Channel secret**을 복사합니다.
4. Messaging API 설정에서 **Use webhook**을 활성화합니다.
5. webhook URL을 게이트웨이 엔드포인트로 설정합니다(HTTPS 필수):

```
https://gateway-host/line/webhook
```

게이트웨이는 LINE의 webhook 확인(GET)과 인바운드 이벤트(POST)에 응답합니다.
커스텀 경로가 필요하면 `channels.line.webhookPath` 또는
`channels.line.accounts.<id>.webhookPath`를 설정하고 URL을 그에 맞게 업데이트하세요.

보안 참고:

- LINE 서명 검증은 본문 종속적입니다(원시 본문에 대한 HMAC). 따라서 OpenClaw는 검증 전에 엄격한 사전 인증 본문 크기 제한과 타임아웃을 적용합니다.
- OpenClaw는 검증된 원시 요청 바이트에서 webhook 이벤트를 처리합니다. 서명 무결성 안전을 위해 상위 미들웨어에서 변환된 `req.body` 값은 무시됩니다.

## 구성

최소 구성:

```json5
{
  channels: {
    line: {
      enabled: true,
      channelAccessToken: "LINE_CHANNEL_ACCESS_TOKEN",
      channelSecret: "LINE_CHANNEL_SECRET",
      dmPolicy: "pairing",
    },
  },
}
```

환경 변수 (기본 계정에만 적용):

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

토큰/시크릿 파일:

```json5
{
  channels: {
    line: {
      tokenFile: "/path/to/line-token.txt",
      secretFile: "/path/to/line-secret.txt",
    },
  },
}
```

`tokenFile`과 `secretFile`은 일반 파일을 가리켜야 합니다. 심볼릭 링크는 거부됩니다.

다중 계정:

```json5
{
  channels: {
    line: {
      accounts: {
        marketing: {
          channelAccessToken: "...",
          channelSecret: "...",
          webhookPath: "/line/marketing",
        },
      },
    },
  },
}
```

## 접근 제어

다이렉트 메시지는 기본적으로 pairing입니다. 알 수 없는 발신자는 페어링 코드를 받고
승인되기 전까지 메시지가 무시됩니다.

```bash
openclaw pairing list line
openclaw pairing approve line <CODE>
```

허용 목록 및 정책:

- `channels.line.dmPolicy`: `pairing | allowlist | open | disabled`
- `channels.line.allowFrom`: DM용 허용된 LINE 사용자 ID
- `channels.line.groupPolicy`: `allowlist | open | disabled`
- `channels.line.groupAllowFrom`: 그룹용 허용된 LINE 사용자 ID
- 그룹별 재정의: `channels.line.groups.<groupId>.allowFrom`
- 런타임 참고: `channels.line`이 완전히 없는 경우, 런타임은 그룹 검사 시 `groupPolicy="allowlist"`로 폴백합니다(`channels.defaults.groupPolicy`가 설정되어 있더라도).

LINE ID는 대소문자를 구분합니다. 유효한 ID 형식:

- User: `U` + 32자리 hex
- Group: `C` + 32자리 hex
- Room: `R` + 32자리 hex

## 메시지 동작

- 텍스트는 5000자에서 청크 분할됩니다.
- Markdown 포맷팅은 제거됩니다. 코드 블록과 테이블은 가능한 경우 Flex
  카드로 변환됩니다.
- 스트리밍 응답은 버퍼링됩니다. LINE은 에이전트가 작업하는 동안 로딩 애니메이션과
  함께 전체 청크를 받습니다.
- 미디어 다운로드는 `channels.line.mediaMaxMb` (기본값 10)로 제한됩니다.

## 채널 데이터 (리치 메시지)

`channelData.line`을 사용하여 quick reply, 위치, Flex 카드 또는 template
메시지를 보낼 수 있습니다.

```json5
{
  text: "Here you go",
  channelData: {
    line: {
      quickReplies: ["Status", "Help"],
      location: {
        title: "Office",
        address: "123 Main St",
        latitude: 35.681236,
        longitude: 139.767125,
      },
      flexMessage: {
        altText: "Status card",
        contents: {
          /* Flex payload */
        },
      },
      templateMessage: {
        type: "confirm",
        text: "Proceed?",
        confirmLabel: "Yes",
        confirmData: "yes",
        cancelLabel: "No",
        cancelData: "no",
      },
    },
  },
}
```

LINE 플러그인은 Flex 메시지 프리셋을 위한 `/card` 명령도 제공합니다:

```
/card info "Welcome" "Thanks for joining!"
```

## ACP 지원

LINE은 ACP (Agent Communication Protocol) 대화 바인딩을 지원합니다:

- `/acp spawn <agent> --bind here`는 현재 LINE 채팅을 하위 스레드를 생성하지 않고 ACP 세션에 바인딩합니다.
- 구성된 ACP 바인딩과 활성화된 대화 바인딩 ACP 세션은 다른 대화 채널과 동일하게 LINE에서 작동합니다.

자세한 내용은 [ACP 에이전트](/tools/acp-agents)를 참고하세요.

## 아웃바운드 미디어

LINE 플러그인은 에이전트 메시지 도구를 통해 이미지, 비디오, 오디오 파일 전송을 지원합니다. 미디어는 적절한 미리보기 및 추적 처리와 함께 LINE 전용 전달 경로를 통해 전송됩니다:

- **이미지**: 자동 미리보기 생성과 함께 LINE 이미지 메시지로 전송됩니다.
- **비디오**: 명시적 미리보기 및 content-type 처리와 함께 전송됩니다.
- **오디오**: LINE 오디오 메시지로 전송됩니다.

아웃바운드 미디어 URL은 공개 HTTPS URL이어야 합니다. OpenClaw는 LINE에 URL을 전달하기 전에 대상 호스트명을 검증하고 loopback, link-local, private-network 대상을 거부합니다.

일반 미디어 전송은 LINE 전용 경로가 사용 불가능한 경우 기존 이미지 전용 경로로 폴백합니다.

## 문제 해결

- **Webhook 검증 실패:** webhook URL이 HTTPS인지, `channelSecret`이 LINE 콘솔과
  일치하는지 확인하세요.
- **인바운드 이벤트 없음:** webhook 경로가 `channels.line.webhookPath`와 일치하고
  LINE에서 게이트웨이에 도달 가능한지 확인하세요.
- **미디어 다운로드 오류:** 미디어가 기본 제한을 초과하는 경우
  `channels.line.mediaMaxMb`를 높이세요.

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 언급 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 보안 강화
