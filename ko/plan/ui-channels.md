---
summary: 시맨틱 메시지 프레젠테이션을 채널 네이티브 UI 렌더러에서 분리합니다.
title: 채널 프레젠테이션 리팩터링 계획
read_when:
  - 채널 메시지 UI, 인터랙티브 페이로드 또는 네이티브 채널 렌더러를 리팩터링할 때
  - 메시지 도구 기능, 전달 힌트 또는 크로스-컨텍스트 마커를 변경할 때
  - Discord Carbon import 팬아웃 또는 채널 플러그인 런타임 지연 로딩을 디버깅할 때
---

## 상태 (Status)

공유 에이전트, CLI, 플러그인 capability, 아웃바운드 전달 표면에 대해 구현되었습니다:

- `ReplyPayload.presentation`이 시맨틱 메시지 UI를 운반합니다.
- `ReplyPayload.delivery.pin`이 전송된 메시지의 pin 요청을 운반합니다.
- 공유 메시지 액션은 프로바이더 네이티브 `components`, `blocks`, `buttons`, `card` 대신 `presentation`, `delivery`, `pin`을 노출합니다.
- Core는 플러그인이 선언한 아웃바운드 capability를 통해 presentation을 렌더링하거나 자동 다운그레이드합니다.
- Discord, Slack, Telegram, Mattermost, MS Teams, Feishu 렌더러가 제네릭 contract를 소비합니다.
- Discord 채널 control-plane 코드는 더 이상 Carbon 기반 UI 컨테이너를 import하지 않습니다.

정식 문서는 이제 [Message Presentation](/plugins/message-presentation)에 있습니다.
이 계획은 역사적 구현 컨텍스트로 유지하고, contract, 렌더러 또는 폴백 동작 변경 사항은
정식 가이드를 업데이트해 주십시오.

## 문제 (Problem)

채널 UI는 현재 호환되지 않는 여러 표면으로 분산되어 있습니다:

- Core가 `buildCrossContextComponents`를 통해 Discord 형태의 크로스-컨텍스트 렌더러 훅을 소유합니다.
- Discord `channel.ts`는 `DiscordUiContainer`를 통해 네이티브 Carbon UI를 import할 수 있으며, 이는 런타임 UI 의존성을 채널 플러그인 control plane으로 끌어들입니다.
- 에이전트와 CLI는 Discord `components`, Slack `blocks`, Telegram 또는 Mattermost `buttons`, Teams 또는 Feishu `card`와 같은 네이티브 페이로드 우회 경로를 노출합니다.
- `ReplyPayload.channelData`는 전송 힌트와 네이티브 UI 봉투를 모두 운반합니다.
- 제네릭 `interactive` 모델은 존재하지만, Discord, Slack, Teams, Feishu, LINE, Telegram, Mattermost가 이미 사용하는 풍부한 레이아웃보다 좁습니다.

이로 인해 core가 네이티브 UI 형태를 알게 되고, 플러그인 런타임 지연 로딩이 약화되며, 에이전트가 동일한 메시지 의도를 표현할 수 있는 프로바이더별 방법이 너무 많아집니다.

## 목표 (Goals)

- Core가 선언된 capability로부터 메시지에 최적의 시맨틱 프레젠테이션을 결정합니다.
- 확장(extension)이 capability를 선언하고 시맨틱 프레젠테이션을 네이티브 전송 페이로드로 렌더링합니다.
- Web Control UI는 채팅 네이티브 UI와 분리된 상태를 유지합니다.
- 네이티브 채널 페이로드는 공유 에이전트 또는 CLI 메시지 표면을 통해 노출되지 않습니다.
- 지원되지 않는 프레젠테이션 기능은 최적의 텍스트 표현으로 자동 다운그레이드됩니다.
- 전송된 메시지를 pin하는 것과 같은 전달(delivery) 동작은 프레젠테이션이 아니라 제네릭 전달 메타데이터입니다.

## 비목표 (Non Goals)

- `buildCrossContextComponents`를 위한 하위 호환성 shim 없음.
- `components`, `blocks`, `buttons`, `card`에 대한 공개 네이티브 우회 경로 없음.
- 채널 네이티브 UI 라이브러리에 대한 core import 없음.
- 번들 채널에 대한 프로바이더별 SDK 이음새 없음.

## 목표 모델 (Target Model)

`ReplyPayload`에 core 소유의 `presentation` 필드를 추가합니다.

```ts
type MessagePresentationTone = "neutral" | "info" | "success" | "warning" | "danger";

type MessagePresentation = {
  tone?: MessagePresentationTone;
  title?: string;
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
```

마이그레이션 중 `interactive`는 `presentation`의 부분 집합이 됩니다:

- `interactive` text 블록은 `presentation.blocks[].type = "text"`로 매핑됩니다.
- `interactive` buttons 블록은 `presentation.blocks[].type = "buttons"`로 매핑됩니다.
- `interactive` select 블록은 `presentation.blocks[].type = "select"`로 매핑됩니다.

외부 에이전트와 CLI 스키마는 이제 `presentation`을 사용하며, `interactive`는 기존 응답 프로듀서를 위한 내부 레거시 파서/렌더링 헬퍼로 남습니다.

## 전달 메타데이터 (Delivery Metadata)

UI가 아닌 전송 동작을 위한 core 소유의 `delivery` 필드를 추가합니다.

```ts
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

시맨틱:

- `delivery.pin = true`는 성공적으로 전달된 첫 번째 메시지를 pin한다는 의미입니다.
- `notify`는 기본값이 `false`입니다.
- `required`는 기본값이 `false`이며, 지원되지 않는 채널이나 실패한 pinning은 전달을 계속하여 자동 다운그레이드됩니다.
- 기존 메시지에 대한 수동 `pin`, `unpin`, `list-pins` 메시지 액션은 유지됩니다.

현재 Telegram ACP 토픽 바인딩은 `channelData.telegram.pin = true`에서 `delivery.pin = true`로 이동해야 합니다.

## 런타임 Capability Contract

control-plane 채널 플러그인이 아닌 런타임 아웃바운드 어댑터에 프레젠테이션 및 전달 렌더 훅을 추가합니다.

```ts
type ChannelPresentationCapabilities = {
  supported: boolean;
  buttons?: boolean;
  selects?: boolean;
  context?: boolean;
  divider?: boolean;
  tones?: MessagePresentationTone[];
};

type ChannelDeliveryCapabilities = {
  pinSentMessage?: boolean;
};

type ChannelOutboundAdapter = {
  presentationCapabilities?: ChannelPresentationCapabilities;

  renderPresentation?: (params: {
    payload: ReplyPayload;
    presentation: MessagePresentation;
    ctx: ChannelOutboundSendContext;
  }) => ReplyPayload | null;

  deliveryCapabilities?: ChannelDeliveryCapabilities;

  pinDeliveredMessage?: (params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    to: string;
    threadId?: string | number | null;
    messageId: string;
    notify: boolean;
  }) => Promise<void>;
};
```

Core 동작:

- 대상 채널과 런타임 어댑터를 확인합니다.
- 프레젠테이션 capability를 요청합니다.
- 렌더링 전에 지원되지 않는 블록을 다운그레이드합니다.
- `renderPresentation`을 호출합니다.
- 렌더러가 없으면 프레젠테이션을 텍스트 폴백으로 변환합니다.
- 전송이 성공한 후, `delivery.pin`이 요청되고 지원되면 `pinDeliveredMessage`를 호출합니다.

## 채널 매핑 (Channel Mapping)

Discord:

- `presentation`을 런타임 전용 모듈에서 components v2와 Carbon 컨테이너로 렌더링합니다.
- 강조 색상 헬퍼는 가벼운 모듈로 유지합니다.
- 채널 플러그인 control-plane 코드에서 `DiscordUiContainer` import를 제거합니다.

Slack:

- `presentation`을 Block Kit으로 렌더링합니다.
- 에이전트와 CLI의 `blocks` 입력을 제거합니다.

Telegram:

- text, context, divider를 텍스트로 렌더링합니다.
- actions와 select는 구성되어 있고 대상 표면에 대해 허용될 때 인라인 키보드로 렌더링합니다.
- 인라인 버튼이 비활성화된 경우 텍스트 폴백을 사용합니다.
- ACP 토픽 pinning을 `delivery.pin`으로 이동합니다.

Mattermost:

- 구성된 경우 actions를 인터랙티브 버튼으로 렌더링합니다.
- 다른 블록은 텍스트 폴백으로 렌더링합니다.

MS Teams:

- `presentation`을 Adaptive Cards로 렌더링합니다.
- 수동 pin/unpin/list-pins 액션을 유지합니다.
- 대상 대화에 대해 Graph 지원이 안정적이라면 선택적으로 `pinDeliveredMessage`를 구현합니다.

Feishu:

- `presentation`을 인터랙티브 카드로 렌더링합니다.
- 수동 pin/unpin/list-pins 액션을 유지합니다.
- API 동작이 안정적인 경우 전송된 메시지 pinning을 위해 선택적으로 `pinDeliveredMessage`를 구현합니다.

LINE:

- 가능한 경우 `presentation`을 Flex 또는 템플릿 메시지로 렌더링합니다.
- 지원되지 않는 블록은 텍스트로 폴백합니다.
- `channelData`에서 LINE UI 페이로드를 제거합니다.

일반 또는 제한된 채널:

- 보수적인 포매팅으로 프레젠테이션을 텍스트로 변환합니다.

## 리팩터링 단계 (Refactor Steps)

1. Carbon 기반 UI에서 `ui-colors.ts`를 분리하고 `extensions/discord/src/channel.ts`에서 `DiscordUiContainer`를 제거하는 Discord 릴리스 수정을 재적용합니다.
2. `ReplyPayload`, 아웃바운드 페이로드 정규화, 전달 요약, 훅 페이로드에 `presentation`과 `delivery`를 추가합니다.
3. 좁은 SDK/런타임 하위 경로에 `MessagePresentation` 스키마와 파서 헬퍼를 추가합니다.
4. `buttons`, `cards`, `components`, `blocks` 메시지 capability를 시맨틱 프레젠테이션 capability로 교체합니다.
5. 프레젠테이션 렌더링과 전달 pinning을 위한 런타임 아웃바운드 어댑터 훅을 추가합니다.
6. 크로스-컨텍스트 컴포넌트 구성을 `buildCrossContextPresentation`으로 교체합니다.
7. `src/infra/outbound/channel-adapters.ts`를 삭제하고 채널 플러그인 타입에서 `buildCrossContextComponents`를 제거합니다.
8. `maybeApplyCrossContextMarker`가 네이티브 params 대신 `presentation`을 첨부하도록 변경합니다.
9. 플러그인 디스패치 전송 경로를 시맨틱 프레젠테이션 및 전달 메타데이터만 소비하도록 업데이트합니다.
10. 에이전트와 CLI 네이티브 페이로드 params를 제거합니다: `components`, `blocks`, `buttons`, `card`.
11. 네이티브 메시지 도구 스키마를 생성하는 SDK 헬퍼를 제거하고 프레젠테이션 스키마 헬퍼로 교체합니다.
12. `channelData`에서 UI/네이티브 봉투를 제거합니다. 남은 각 필드를 검토할 때까지 전송 메타데이터만 유지합니다.
13. Discord, Slack, Telegram, Mattermost, MS Teams, Feishu, LINE 렌더러를 마이그레이션합니다.
14. 메시지 CLI, 채널 페이지, 플러그인 SDK, capability cookbook 문서를 업데이트합니다.
15. Discord 및 영향받은 채널 엔트리포인트에 대한 import 팬아웃 프로파일링을 실행합니다.

이 리팩터링에서는 공유 에이전트, CLI, 플러그인 capability, 아웃바운드 어댑터 contract에 대해 1-11단계와 13-14단계가 구현됩니다. 12단계는 프로바이더 내부의 `channelData` 전송 봉투에 대한 보다 깊은 내부 정리 패스로 남아 있습니다. 15단계는 타입/테스트 게이트를 넘어 정량화된 import 팬아웃 수치를 원하는 경우 후속 검증으로 남아 있습니다.

## 테스트 (Tests)

추가 또는 업데이트:

- 프레젠테이션 정규화 테스트.
- 지원되지 않는 블록에 대한 프레젠테이션 자동 다운그레이드 테스트.
- 플러그인 디스패치 및 core 전달 경로에 대한 크로스-컨텍스트 마커 테스트.
- Discord, Slack, Telegram, Mattermost, MS Teams, Feishu, LINE 및 텍스트 폴백에 대한 채널 렌더 매트릭스 테스트.
- 네이티브 필드가 사라졌음을 증명하는 메시지 도구 스키마 테스트.
- 네이티브 플래그가 사라졌음을 증명하는 CLI 테스트.
- Carbon을 커버하는 Discord 엔트리포인트 import 지연 로딩 회귀 테스트.
- Telegram 및 제네릭 폴백을 커버하는 전달 pin 테스트.

## 공개 질문 (Open Questions)

- `delivery.pin`을 첫 번째 패스에서 Discord, Slack, MS Teams, Feishu에 대해 구현해야 할까요, 아니면 Telegram만 먼저 구현해야 할까요?
- `delivery`가 결국 `replyToId`, `replyToCurrent`, `silent`, `audioAsVoice`와 같은 기존 필드를 흡수해야 할까요, 아니면 전송 후 동작에 집중해야 할까요?
- 프레젠테이션이 이미지나 파일 참조를 직접 지원해야 할까요, 아니면 미디어는 당분간 UI 레이아웃과 분리된 상태로 유지해야 할까요?

## 관련 (Related)

- [채널 개요](/channels/)
- [Message presentation](/plugins/message-presentation)
