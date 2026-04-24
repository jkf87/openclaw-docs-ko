---
summary: "채널 플러그인을 위한 시맨틱 메시지 카드, 버튼, select, fallback 텍스트, 전달 힌트"
title: "메시지 presentation"
read_when:
  - 메시지 카드, 버튼, select 렌더링을 추가하거나 수정할 때
  - 리치 아웃바운드 메시지를 지원하는 채널 플러그인을 빌드할 때
  - 메시지 도구 presentation 또는 전달 기능(capability)을 변경할 때
  - 프로바이더별 card/block/component 렌더링 회귀를 디버깅할 때
---

메시지 presentation은 리치 아웃바운드 채팅 UI를 위한 OpenClaw의 공유 계약입니다.
이를 통해 에이전트, CLI 커맨드, 승인 흐름, 플러그인이 메시지 의도를
한 번만 기술하고, 각 채널 플러그인은 자신이 할 수 있는 최선의 네이티브 형태로 렌더링합니다.

이식 가능한 메시지 UI에는 presentation을 사용하십시오:

- text 섹션
- 작은 context/footer 텍스트
- divider
- buttons
- select 메뉴
- 카드 title과 tone

공유 메시지 도구에 Discord `components`, Slack `blocks`, Telegram `buttons`,
Teams `card`, Feishu `card`와 같은 새로운 프로바이더 네이티브 필드를 추가하지 마십시오.
이들은 채널 플러그인이 소유하는 렌더러 출력입니다.

## 계약

플러그인 작성자는 다음에서 공개 계약을 임포트합니다:

```ts
import type {
  MessagePresentation,
  ReplyPayloadDelivery,
} from "openclaw/plugin-sdk/interactive-runtime";
```

형태:

```ts
type MessagePresentation = {
  title?: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  blocks: MessagePresentationBlock[];
};

type MessagePresentationBlock =
  | { type: "text"; text: string }
  | { type: "context"; text: string }
  | { type: "divider" }
  | { type: "buttons"; buttons: MessagePresentationButton[] }
  | { type: "select"; placeholder?: string; options: MessagePresentationOption[] };

type MessagePresentationButton = {
  label: string;
  value?: string;
  url?: string;
  style?: "primary" | "secondary" | "success" | "danger";
};

type MessagePresentationOption = {
  label: string;
  value: string;
};

type ReplyPayloadDelivery = {
  pin?:
    | boolean
    | {
        enabled: boolean;
        notify?: boolean;
        required?: boolean;
      };
};
```

버튼 시맨틱:

- `value`는 채널이 클릭 가능한 컨트롤을 지원할 때 채널의 기존 상호작용 경로를 통해
  되돌아오는 애플리케이션 액션 값입니다.
- `url`은 링크 버튼입니다. `value` 없이도 존재할 수 있습니다.
- `label`은 필수이며 텍스트 fallback에도 사용됩니다.
- `style`은 권고사항입니다. 렌더러는 지원되지 않는 스타일을 안전한
  기본값에 매핑해야 하며, 전송을 실패시키지 않아야 합니다.

Select 시맨틱:

- `options[].value`는 선택된 애플리케이션 값입니다.
- `placeholder`는 권고사항이며 네이티브 select 지원이 없는 채널에서는
  무시될 수 있습니다.
- 채널이 select를 지원하지 않으면 fallback 텍스트가 label 목록을 나열합니다.

## 프로듀서 예시

간단한 카드:

```json
{
  "title": "Deploy approval",
  "tone": "warning",
  "blocks": [
    { "type": "text", "text": "Canary is ready to promote." },
    { "type": "context", "text": "Build 1234, staging passed." },
    {
      "type": "buttons",
      "buttons": [
        { "label": "Approve", "value": "deploy:approve", "style": "success" },
        { "label": "Decline", "value": "deploy:decline", "style": "danger" }
      ]
    }
  ]
}
```

URL 전용 링크 버튼:

```json
{
  "blocks": [
    { "type": "text", "text": "Release notes are ready." },
    {
      "type": "buttons",
      "buttons": [{ "label": "Open notes", "url": "https://example.com/release" }]
    }
  ]
}
```

Select 메뉴:

```json
{
  "title": "Choose environment",
  "blocks": [
    {
      "type": "select",
      "placeholder": "Environment",
      "options": [
        { "label": "Canary", "value": "env:canary" },
        { "label": "Production", "value": "env:prod" }
      ]
    }
  ]
}
```

CLI 전송:

```bash
openclaw message send --channel slack \
  --target channel:C123 \
  --message "Deploy approval" \
  --presentation '{"title":"Deploy approval","tone":"warning","blocks":[{"type":"text","text":"Canary is ready."},{"type":"buttons","buttons":[{"label":"Approve","value":"deploy:approve","style":"success"},{"label":"Decline","value":"deploy:decline","style":"danger"}]}]}'
```

고정(pin) 전달:

```bash
openclaw message send --channel telegram \
  --target -1001234567890 \
  --message "Topic opened" \
  --pin
```

명시적인 JSON으로 고정 전달:

```json
{
  "pin": {
    "enabled": true,
    "notify": true,
    "required": false
  }
}
```

## 렌더러 계약

채널 플러그인은 자신의 아웃바운드 어댑터에 렌더링 지원을 선언합니다:

```ts
const adapter: ChannelOutboundAdapter = {
  deliveryMode: "direct",
  presentationCapabilities: {
    supported: true,
    buttons: true,
    selects: true,
    context: true,
    divider: true,
  },
  deliveryCapabilities: {
    pin: true,
  },
  renderPresentation({ payload, presentation, ctx }) {
    return renderNativePayload(payload, presentation, ctx);
  },
  async pinDeliveredMessage({ target, messageId, pin }) {
    await pinNativeMessage(target, messageId, { notify: pin.notify === true });
  },
};
```

Capability 필드는 의도적으로 단순한 boolean입니다. 이들은 렌더러가 상호작용 가능하게
만들 수 있는 것을 기술하며, 모든 네이티브 플랫폼 한계를 기술하는 것이 아닙니다.
렌더러는 여전히 최대 버튼 수, 블록 수, 카드 크기와 같은 플랫폼별 한계를 소유합니다.

## 코어 렌더 흐름

`ReplyPayload` 또는 메시지 액션에 `presentation`이 포함되면, 코어는 다음을 수행합니다:

1. presentation payload를 정규화합니다.
2. 대상 채널의 아웃바운드 어댑터를 해결합니다.
3. `presentationCapabilities`를 읽습니다.
4. 어댑터가 payload를 렌더링할 수 있으면 `renderPresentation`을 호출합니다.
5. 어댑터가 없거나 렌더링할 수 없으면 보수적인 텍스트로 fallback합니다.
6. 결과 payload를 일반적인 채널 전달 경로로 전송합니다.
7. 첫 번째 성공적으로 전송된 메시지 이후 `delivery.pin`과 같은 전달 메타데이터를
   적용합니다.

코어가 fallback 동작을 소유하므로 프로듀서는 채널과 무관하게 유지될 수 있습니다.
채널 플러그인은 네이티브 렌더링과 상호작용 처리를 소유합니다.

## 저하(Degradation) 규칙

Presentation은 제한된 채널에서도 안전하게 전송될 수 있어야 합니다.

Fallback 텍스트에 포함되는 것:

- 첫 줄로서의 `title`
- 일반 단락으로서의 `text` 블록
- 컴팩트한 context 줄로서의 `context` 블록
- 시각적 구분자로서의 `divider` 블록
- 링크 버튼을 위한 URL을 포함한 버튼 label
- select 옵션 label

지원되지 않는 네이티브 컨트롤은 전체 전송을 실패시키는 대신 저하되어야 합니다.
예시:

- 인라인 버튼이 비활성화된 Telegram은 텍스트 fallback을 전송합니다.
- select 지원이 없는 채널은 select 옵션을 텍스트로 나열합니다.
- URL 전용 버튼은 네이티브 링크 버튼이 되거나 fallback URL 줄이 됩니다.
- 선택적 pin 실패는 전달된 메시지를 실패시키지 않습니다.

주된 예외는 `delivery.pin.required: true`입니다; pin이 필수로 요청되었는데
채널이 전송된 메시지를 고정할 수 없으면 전달은 실패를 보고합니다.

## 프로바이더 매핑

현재 번들된 렌더러:

| Channel         | 네이티브 렌더 대상                   | 비고                                                                                                                                              |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Discord         | Components 및 컴포넌트 컨테이너      | 기존 프로바이더 네이티브 payload 프로듀서를 위해 레거시 `channelData.discord.components`를 보존하지만, 새로운 공유 전송은 `presentation`을 사용해야 합니다. |
| Slack           | Block Kit                           | 기존 프로바이더 네이티브 payload 프로듀서를 위해 레거시 `channelData.slack.blocks`를 보존하지만, 새로운 공유 전송은 `presentation`을 사용해야 합니다.       |
| Telegram        | 텍스트 및 인라인 키보드              | 버튼/select는 대상 표면의 인라인 버튼 기능이 필요합니다; 그렇지 않으면 텍스트 fallback이 사용됩니다.                                                     |
| Mattermost      | 텍스트 및 인터랙티브 props           | 다른 블록은 텍스트로 저하됩니다.                                                                                                                   |
| Microsoft Teams | Adaptive Cards                      | 둘 다 제공되면 일반 `message` 텍스트가 카드와 함께 포함됩니다.                                                                                         |
| Feishu          | 인터랙티브 카드                     | 카드 헤더는 `title`을 사용할 수 있습니다; 본문은 해당 제목을 중복하지 않습니다.                                                                           |
| Plain channels  | 텍스트 fallback                     | 렌더러가 없는 채널도 읽을 수 있는 출력을 받습니다.                                                                                                   |

프로바이더 네이티브 payload 호환성은 기존 reply 프로듀서를 위한 전환 수단입니다.
새로운 공유 네이티브 필드를 추가할 이유가 되지 않습니다.

## Presentation 대 InteractiveReply

`InteractiveReply`는 승인 및 상호작용 헬퍼가 사용하는 오래된 내부 하위 집합입니다.
다음을 지원합니다:

- text
- buttons
- selects

`MessagePresentation`은 정규(canonical) 공유 전송 계약입니다. 다음을 추가합니다:

- title
- tone
- context
- divider
- URL 전용 버튼
- `ReplyPayload.delivery`를 통한 일반 전달 메타데이터

오래된 코드를 브리징할 때는 `openclaw/plugin-sdk/interactive-runtime`의
헬퍼를 사용하십시오:

```ts
import {
  interactiveReplyToPresentation,
  normalizeMessagePresentation,
  presentationToInteractiveReply,
  renderMessagePresentationFallbackText,
} from "openclaw/plugin-sdk/interactive-runtime";
```

새 코드는 `MessagePresentation`을 직접 받거나 생성해야 합니다.

## 전달 고정(Delivery Pin)

고정은 presentation이 아니라 전달 동작입니다. `channelData.telegram.pin`과
같은 프로바이더 네이티브 필드 대신 `delivery.pin`을 사용하십시오.

시맨틱:

- `pin: true`는 첫 번째로 성공적으로 전달된 메시지를 고정합니다.
- `pin.notify`의 기본값은 `false`입니다.
- `pin.required`의 기본값은 `false`입니다.
- 선택적 pin 실패는 저하되며 전송된 메시지를 온전하게 남깁니다.
- 필수 pin 실패는 전달을 실패시킵니다.
- 청크 메시지는 꼬리 청크가 아니라 첫 번째로 전달된 청크를 고정합니다.

프로바이더가 해당 작업을 지원하는 기존 메시지에 대해서는 수동 `pin`, `unpin`,
`pins` 메시지 액션이 여전히 존재합니다.

## 플러그인 작성자 체크리스트

- 채널이 시맨틱 presentation을 렌더링하거나 안전하게 저하할 수 있을 때
  `describeMessageTool(...)`에서 `presentation`을 선언하십시오.
- 런타임 아웃바운드 어댑터에 `presentationCapabilities`를 추가하십시오.
- 컨트롤 플레인 플러그인 설정 코드가 아니라 런타임 코드에 `renderPresentation`을
  구현하십시오.
- 핫 setup/catalog 경로에서 네이티브 UI 라이브러리를 배제하십시오.
- 렌더러와 테스트에서 플랫폼 한계를 보존하십시오.
- 지원되지 않는 버튼, select, URL 버튼, title/text 중복, `message`와
  `presentation`이 섞인 전송에 대한 fallback 테스트를 추가하십시오.
- 프로바이더가 전송된 메시지 id를 고정할 수 있을 때만 `deliveryCapabilities.pin`과
  `pinDeliveredMessage`를 통해 전달 고정 지원을 추가하십시오.
- 공유 메시지 액션 스키마를 통해 새로운 프로바이더 네이티브 card/block/component/button
  필드를 노출하지 마십시오.

## 관련 문서

- [Message CLI](/cli/message)
- [플러그인 SDK 개요](/plugins/sdk-overview)
- [플러그인 아키텍처](/plugins/architecture-internals#message-tool-schemas)
- [채널 Presentation 리팩토링 계획](/plan/ui-channels)
