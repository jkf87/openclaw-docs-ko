---
summary: "메시지 흐름, 세션, 큐잉, reasoning 가시성"
read_when:
  - 인바운드 메시지가 어떻게 응답으로 변환되는지 설명할 때
  - 세션, 큐잉 모드, 스트리밍 동작을 명확히 할 때
  - reasoning 가시성과 사용량에 미치는 영향을 문서화할 때
title: "메시지"
---

이 페이지는 OpenClaw가 인바운드 메시지, 세션, 큐잉, 스트리밍,
reasoning 가시성을 어떻게 처리하는지 한 자리에 모아 설명합니다.

## 메시지 흐름 (개요)

```
Inbound message
  -> routing/bindings -> session key
  -> queue (if a run is active)
  -> agent run (streaming + tools)
  -> outbound replies (channel limits + chunking)
```

주요 설정 값은 구성(configuration)에 있습니다:

- `messages.*`: 프리픽스, 큐잉, 그룹 동작.
- `agents.defaults.*`: 블록 스트리밍과 청킹 기본값.
- 채널별 오버라이드(`channels.whatsapp.*`, `channels.telegram.*` 등): 상한과 스트리밍 토글.

전체 스키마는 [Configuration](/gateway/configuration)을 참고하세요.

## 인바운드 중복 제거 (Dedupe)

채널은 재연결 후 같은 메시지를 다시 전달할 수 있습니다. OpenClaw는
channel/account/peer/session/message id 기반의 단기 캐시를 유지하여
중복 전달이 또 다른 에이전트 실행을 트리거하지 않도록 합니다.

## 인바운드 디바운싱 (Debouncing)

**동일 발신자**로부터의 연속된 빠른 메시지는 `messages.inbound`를 통해
하나의 에이전트 턴으로 배치(batch)될 수 있습니다. 디바운싱은 채널 + 대화
단위로 적용되며, reply 스레딩/ID에는 가장 최근 메시지를 사용합니다.

설정(전역 기본값 + 채널별 오버라이드):

```json5
{
  messages: {
    inbound: {
      debounceMs: 2000,
      byChannel: {
        whatsapp: 5000,
        slack: 1500,
        discord: 1500,
      },
    },
  },
}
```

참고 사항:

- 디바운싱은 **텍스트 전용** 메시지에만 적용됩니다. 미디어/첨부파일은 즉시 플러시됩니다.
- 컨트롤 명령(command)은 기본적으로 디바운싱을 우회하여 독립적으로 처리됩니다 — **단**, 채널이 same-sender DM coalescing에 명시적으로 옵트인한 경우(예: [BlueBubbles `coalesceSameSenderDms`](/channels/bluebubbles#coalescing-split-send-dms-command--url-in-one-composition))는 예외로, DM 명령이 디바운스 윈도우 내에서 대기하여 split-send 페이로드가 같은 에이전트 턴에 합쳐질 수 있게 됩니다.

## 세션과 디바이스

세션은 클라이언트가 아닌 게이트웨이(gateway)가 소유합니다.

- Direct chat은 에이전트의 메인 세션 키로 통합됩니다.
- 그룹/채널은 각자 자신만의 세션 키를 가집니다.
- 세션 저장소와 transcript는 게이트웨이 호스트에 있습니다.

여러 디바이스/채널이 같은 세션에 매핑될 수 있지만, 히스토리가 모든 클라이언트로
완전히 동기화되지는 않습니다. 권장: 긴 대화에서는 컨텍스트 분기를 피하기 위해
하나의 주 디바이스(primary device)를 사용하세요. Control UI와 TUI는 항상
게이트웨이 기반 세션 transcript를 표시하므로 이것이 진실의 원천(source of truth)입니다.

자세히: [세션 관리](/concepts/session).

## 인바운드 본문과 히스토리 컨텍스트

OpenClaw는 **프롬프트 본문(prompt body)** 과 **명령 본문(command body)** 을 분리합니다:

- `Body`: 에이전트에게 전달되는 프롬프트 텍스트. 채널 envelope와
  선택적인 히스토리 래퍼를 포함할 수 있습니다.
- `CommandBody`: 디렉티브/명령 파싱용 원시 사용자 텍스트.
- `RawBody`: `CommandBody`의 레거시 별칭(호환성 유지).

채널이 히스토리를 제공할 때는 공유 래퍼를 사용합니다:

- `[Chat messages since your last reply - for context]`
- `[Current message - respond to this]`

**non-direct chat**(그룹/채널/룸)에서는 **현재 메시지 본문** 이 발신자
라벨로 프리픽스됩니다(히스토리 항목과 동일한 스타일). 이로써 실시간 메시지와
큐잉/히스토리 메시지가 에이전트 프롬프트에서 일관성을 유지합니다.

히스토리 버퍼는 **대기 중인 것만 포함(pending-only)** 합니다. 즉, 실행을
트리거하지 _않은_ 그룹 메시지(예: 멘션 게이팅된 메시지)를 포함하고,
이미 세션 transcript에 있는 메시지는 **제외**합니다.

디렉티브 제거(directive stripping)는 히스토리를 그대로 보존하기 위해
**현재 메시지** 섹션에만 적용됩니다. 히스토리를 래핑하는 채널은
`CommandBody`(또는 `RawBody`)를 원본 메시지 텍스트로 설정하고 `Body`는
조합된 프롬프트로 유지해야 합니다. 히스토리 버퍼는
`messages.groupChat.historyLimit`(전역 기본값)과 `channels.slack.historyLimit`
또는 `channels.telegram.accounts.<id>.historyLimit` 같은 채널별 오버라이드로
설정 가능합니다(`0`이면 비활성화).

## 큐잉과 후속 처리 (Queueing and followups)

이미 실행이 활성화된 경우, 인바운드 메시지는 큐에 쌓이거나, 현재 실행으로
유도(steer)되거나, 다음 후속 턴을 위해 수집(collect)될 수 있습니다.

- `messages.queue`(및 `messages.queue.byChannel`)로 설정합니다.
- 모드: `interrupt`, `steer`, `followup`, `collect`, 그리고 backlog 변형.

자세히: [큐잉](/concepts/queue).

## 스트리밍, 청킹, 배칭

블록 스트리밍(block streaming)은 모델이 텍스트 블록을 생성하는 대로 부분 응답을 전송합니다.
청킹(chunking)은 채널 텍스트 제한을 존중하며 fenced code를 쪼개지 않도록 합니다.

주요 설정:

- `agents.defaults.blockStreamingDefault` (`on|off`, 기본값 off)
- `agents.defaults.blockStreamingBreak` (`text_end|message_end`)
- `agents.defaults.blockStreamingChunk` (`minChars|maxChars|breakPreference`)
- `agents.defaults.blockStreamingCoalesce` (idle 기반 배칭)
- `agents.defaults.humanDelay` (블록 응답 사이의 사람처럼 느껴지는 지연)
- 채널 오버라이드: `*.blockStreaming` 및 `*.blockStreamingCoalesce` (Telegram이 아닌 채널은 `*.blockStreaming: true`를 명시적으로 설정해야 함)

자세히: [스트리밍 + 청킹](/concepts/streaming).

## Reasoning 가시성과 토큰

OpenClaw는 모델의 reasoning을 노출하거나 숨길 수 있습니다:

- `/reasoning on|off|stream`으로 가시성을 제어합니다.
- 모델이 reasoning 콘텐츠를 생성하면, 그 내용은 여전히 토큰 사용량에 포함됩니다.
- Telegram은 reasoning 스트리밍을 draft bubble로 지원합니다.

자세히: [Thinking + reasoning 디렉티브](/tools/thinking) 및 [토큰 사용량](/reference/token-use).

## 프리픽스, 스레딩, 응답

아웃바운드 메시지 포맷은 `messages`에 중앙화되어 있습니다:

- `messages.responsePrefix`, `channels.<channel>.responsePrefix`, `channels.<channel>.accounts.<id>.responsePrefix` (아웃바운드 프리픽스 캐스케이드), 그리고 `channels.whatsapp.messagePrefix`(WhatsApp 인바운드 프리픽스)
- `replyToMode` 및 채널별 기본값을 통한 reply 스레딩

자세히: [Configuration](/gateway/config-agents#messages) 및 채널 문서.

## 조용한 응답 (Silent replies)

정확한 silent 토큰인 `NO_REPLY` / `no_reply`는 "사용자에게 보이는 응답을 전달하지 말 것"을 의미합니다.
OpenClaw는 대화 유형에 따라 이 동작을 결정합니다:

- Direct 대화에서는 기본적으로 silence를 허용하지 않으며, 단순한 silent
  응답은 짧은 visible fallback으로 재작성됩니다.
- 그룹/채널은 기본적으로 silence를 허용합니다.
- 내부 오케스트레이션(internal orchestration)은 기본적으로 silence를 허용합니다.

기본값은 `agents.defaults.silentReply`와 `agents.defaults.silentReplyRewrite`에
있으며, `surfaces.<id>.silentReply`와 `surfaces.<id>.silentReplyRewrite`로
surface별 오버라이드가 가능합니다.

부모 세션이 하나 이상의 대기 중(pending) 스폰된 서브에이전트(subagent) 실행을
가지고 있을 때는, bare silent 응답이 모든 surface에서 재작성 대신 드롭됩니다.
이렇게 하면 자식(child) 완료 이벤트가 실제 응답을 전달할 때까지 부모가 조용히 대기합니다.

## 관련 문서

- [스트리밍](/concepts/streaming) — 실시간 메시지 전달
- [재시도](/concepts/retry) — 메시지 전달 재시도 동작
- [큐](/concepts/queue) — 메시지 처리 큐
- [채널](/channels/) — 메시징 플랫폼 통합
