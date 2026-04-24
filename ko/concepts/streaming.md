---
summary: "스트리밍 + 청킹 동작(블록 응답, 채널 preview 스트리밍, 모드 매핑)"
read_when:
  - 채널에서 스트리밍이나 청킹이 어떻게 작동하는지 설명할 때
  - 블록 스트리밍이나 채널 청킹 동작을 변경할 때
  - 중복/조기 블록 응답 또는 채널 preview 스트리밍을 디버깅할 때
title: "스트리밍과 청킹"
---

# 스트리밍 + 청킹

OpenClaw에는 두 개의 별도 스트리밍 레이어가 있습니다:

- **블록 스트리밍 (채널용):** assistant가 작성하는 동안 완성된 **블록(block)** 을 내보냅니다. 이는 일반적인 채널 메시지입니다(token delta가 아님).
- **Preview 스트리밍 (Telegram/Discord/Slack):** 생성 중에 임시 **preview 메시지**를 업데이트합니다.

오늘날 채널 메시지에 대한 **진정한 token-delta 스트리밍은 없습니다.** Preview 스트리밍은 메시지 기반입니다(전송 + 편집/추가).

## 블록 스트리밍 (채널 메시지)

블록 스트리밍은 assistant 출력이 가용해지는 대로 거친(coarse) 청크 단위로 전송합니다.

```
Model output
  └─ text_delta/events
       ├─ (blockStreamingBreak=text_end)
       │    └─ chunker emits blocks as buffer grows
       └─ (blockStreamingBreak=message_end)
            └─ chunker flushes at message_end
                   └─ channel send (block replies)
```

범례:

- `text_delta/events`: 모델 스트림 이벤트(비스트리밍 모델의 경우 희박할 수 있음).
- `chunker`: min/max 경계 + break preference를 적용하는 `EmbeddedBlockChunker`.
- `channel send`: 실제 아웃바운드 메시지(블록 응답).

**제어 값:**

- `agents.defaults.blockStreamingDefault`: `"on"`/`"off"` (기본값 off).
- 채널 오버라이드: `*.blockStreaming`(및 계정별 변형)으로 채널별 `"on"`/`"off"` 강제.
- `agents.defaults.blockStreamingBreak`: `"text_end"` 또는 `"message_end"`.
- `agents.defaults.blockStreamingChunk`: `{ minChars, maxChars, breakPreference? }`.
- `agents.defaults.blockStreamingCoalesce`: `{ minChars?, maxChars?, idleMs? }` (전송 전에 스트리밍된 블록 병합).
- 채널 하드 캡(hard cap): `*.textChunkLimit` (예: `channels.whatsapp.textChunkLimit`).
- 채널 청크 모드: `*.chunkMode` (`length`가 기본값, `newline`은 length 청킹 전에 빈 줄(문단 경계)에서 분할).
- Discord soft cap: `channels.discord.maxLinesPerMessage` (기본값 17) — UI 잘림을 피하기 위해 세로로 긴 응답을 분할.

**경계 의미론:**

- `text_end`: chunker가 내보내는 대로 블록을 스트리밍하며, 각 `text_end`마다 플러시합니다.
- `message_end`: assistant 메시지가 끝날 때까지 대기한 후 버퍼링된 출력을 플러시합니다.

`message_end`도 버퍼링된 텍스트가 `maxChars`를 초과하면 chunker를 사용하므로,
끝에서 여러 청크를 내보낼 수 있습니다.

## 청킹 알고리즘 (low/high 경계)

블록 청킹은 `EmbeddedBlockChunker`로 구현됩니다:

- **Low bound:** (강제되지 않는 한) 버퍼가 `minChars` 이상이 될 때까지 내보내지 않음.
- **High bound:** `maxChars` 이전에서 분할 선호; 강제되면 `maxChars`에서 분할.
- **Break preference:** `paragraph` → `newline` → `sentence` → `whitespace` → hard break.
- **Code fence:** fence 내부에서는 절대 분할하지 않음; `maxChars`에서 강제 분할될 때는 Markdown을 유효하게 유지하기 위해 fence를 닫고 다시 엽니다.

`maxChars`는 채널의 `textChunkLimit`에 clamp되므로 채널별 캡을 초과할 수 없습니다.

## 병합 (Coalescing) — 스트리밍된 블록 합치기

블록 스트리밍이 활성화되면, OpenClaw는 전송 전에 **연속된 블록 청크들을 병합**할 수 있습니다.
이는 점진적인 출력을 제공하면서도 "한 줄 스팸"을 줄입니다.

- Coalescing은 플러시 전에 **idle gap**(`idleMs`)을 기다립니다.
- 버퍼는 `maxChars`로 상한이 정해지며, 이를 초과하면 플러시됩니다.
- `minChars`는 충분한 텍스트가 모이기 전까지 작은 단편의 전송을 막습니다
  (최종 플러시는 항상 남은 텍스트를 전송).
- Joiner는 `blockStreamingChunk.breakPreference`에서 파생됩니다
  (`paragraph` → `\n\n`, `newline` → `\n`, `sentence` → space).
- 채널 오버라이드는 `*.blockStreamingCoalesce`(계정별 설정 포함)를 통해 제공됩니다.
- Signal/Slack/Discord의 기본 coalesce `minChars`는 오버라이드되지 않으면 1500으로 상향됩니다.

## 블록 사이의 사람스러운 페이싱

블록 스트리밍이 활성화되면, 블록 응답 사이(첫 블록 이후)에 **무작위 지연**을
추가할 수 있습니다. 이는 여러 bubble로 구성된 응답을 보다 자연스럽게 보이게 합니다.

- 설정: `agents.defaults.humanDelay` (에이전트별 오버라이드는 `agents.list[].humanDelay`를 사용).
- 모드: `off`(기본값), `natural`(800–2500ms), `custom`(`minMs`/`maxMs`).
- **블록 응답**에만 적용됩니다. 최종 응답이나 도구 요약에는 적용되지 않습니다.

## "청크를 스트리밍할지, 전부 한 번에 스트리밍할지"

다음으로 매핑됩니다:

- **청크 스트리밍:** `blockStreamingDefault: "on"` + `blockStreamingBreak: "text_end"` (진행되는 대로 내보냄). Telegram이 아닌 채널은 `*.blockStreaming: true`도 필요합니다.
- **끝에서 전부 스트리밍:** `blockStreamingBreak: "message_end"` (한 번 플러시; 매우 길면 여러 청크일 수 있음).
- **블록 스트리밍 없음:** `blockStreamingDefault: "off"` (최종 응답만).

**채널 참고:** 블록 스트리밍은 **`*.blockStreaming`이 명시적으로 `true`로
설정되지 않는 한 꺼져 있습니다.** 채널은 블록 응답 없이 라이브 preview를
스트리밍할 수 있습니다(`channels.<channel>.streaming`).

설정 위치 리마인더: `blockStreaming*` 기본값은 루트 config가 아닌
`agents.defaults` 아래에 있습니다.

## Preview 스트리밍 모드

정규 키(canonical key): `channels.<channel>.streaming`

모드:

- `off`: preview 스트리밍 비활성화.
- `partial`: 단일 preview를 최신 텍스트로 교체.
- `block`: preview를 청크/추가 단계로 업데이트.
- `progress`: 생성 중에는 progress/status preview, 완료 시 최종 답변.

### 채널 매핑

| 채널       | `off` | `partial` | `block` | `progress`        |
| ---------- | ----- | --------- | ------- | ----------------- |
| Telegram   | ✅    | ✅        | ✅      | `partial`로 매핑   |
| Discord    | ✅    | ✅        | ✅      | `partial`로 매핑   |
| Slack      | ✅    | ✅        | ✅      | ✅                |
| Mattermost | ✅    | ✅        | ✅      | ✅                |

Slack 전용:

- `channels.slack.streaming.nativeTransport`는 `channels.slack.streaming.mode="partial"`일 때 Slack 네이티브 스트리밍 API 호출을 토글합니다(기본값: `true`).
- Slack 네이티브 스트리밍과 Slack assistant 스레드 상태는 reply 스레드 타깃이 필요합니다. Top-level DM은 해당 스레드 스타일 preview를 보여주지 않습니다.

레거시 키 마이그레이션:

- Telegram: `streamMode` + boolean `streaming`은 `streaming` enum으로 자동 마이그레이션됩니다.
- Discord: `streamMode` + boolean `streaming`은 `streaming` enum으로 자동 마이그레이션됩니다.
- Slack: `streamMode`는 `streaming.mode`로 자동 마이그레이션되고, boolean `streaming`은 `streaming.mode`와 `streaming.nativeTransport`로, 레거시 `nativeStreaming`은 `streaming.nativeTransport`로 자동 마이그레이션됩니다.

### 런타임 동작

Telegram:

- DM과 그룹/토픽 전반에서 `sendMessage` + `editMessageText` preview 업데이트를 사용합니다.
- Telegram 블록 스트리밍이 명시적으로 활성화된 경우에는 preview 스트리밍이 건너뛰어집니다(이중 스트리밍 방지).
- `/reasoning stream`은 reasoning을 preview에 쓸 수 있습니다.

Discord:

- send + edit preview 메시지를 사용합니다.
- `block` 모드는 draft chunking(`draftChunk`)을 사용합니다.
- Discord 블록 스트리밍이 명시적으로 활성화된 경우에는 preview 스트리밍이 건너뛰어집니다.
- 최종 media, error, explicit-reply 페이로드는 새 draft를 플러시하지 않고 대기 중인 preview를 취소한 뒤 일반 전달을 사용합니다.

Slack:

- `partial`은 가능한 경우 Slack 네이티브 스트리밍(`chat.startStream`/`append`/`stop`)을 사용할 수 있습니다.
- `block`은 append 스타일 draft preview를 사용합니다.
- `progress`는 status preview 텍스트를 사용한 뒤 최종 답변을 사용합니다.
- 최종 media/error 페이로드와 progress final은 throwaway draft 메시지를 만들지 않습니다. preview를 편집할 수 있는 텍스트/블록 final만 대기 중인 draft 텍스트를 플러시합니다.

Mattermost:

- thinking, 도구 활동, 부분 응답 텍스트를 하나의 draft preview 포스트로 스트리밍하며, 최종 답변을 전송해도 안전할 때 그 자리에서 확정(finalize)합니다.
- preview 포스트가 삭제되었거나 finalize 시점에 사용할 수 없는 경우 새 최종 포스트를 전송하도록 폴백합니다.
- 최종 media/error 페이로드는 임시 preview 포스트를 플러시하지 않고 대기 중인 preview 업데이트를 취소한 뒤 일반 전달을 사용합니다.

Matrix:

- Draft preview는 최종 텍스트가 preview 이벤트를 재사용할 수 있을 때 그 자리에서 확정됩니다.
- Media-only, error, reply-target-mismatch final은 일반 전달 전에 대기 중인 preview 업데이트를 취소합니다. 이미 보여진 stale preview는 redact됩니다.

### 도구 진행(tool-progress) preview 업데이트

Preview 스트리밍은 **도구 진행(tool-progress)** 업데이트도 포함할 수 있습니다 — "searching the web", "reading file", "calling tool" 같은 짧은 상태 줄이 도구 실행 중에 같은 preview 메시지 내에서 최종 응답 이전에 나타납니다. 이는 여러 단계로 이루어진 도구 턴을 시각적으로 살아 있게 유지하여, 첫 thinking preview와 최종 답변 사이에 침묵하지 않도록 합니다.

지원되는 surface:

- **Discord**, **Slack**, **Telegram**은 라이브 preview 편집으로 tool-progress를 스트리밍합니다.
- **Mattermost**는 이미 도구 활동을 단일 draft preview 포스트에 통합하고 있습니다(위 참조).
- Tool-progress 편집은 활성 preview 스트리밍 모드를 따릅니다. preview 스트리밍이 `off`이거나 블록 스트리밍이 메시지를 차지한 경우에는 건너뛰어집니다.

## 관련 문서

- [메시지](/concepts/messages) — 메시지 라이프사이클 및 전달
- [재시도](/concepts/retry) — 전달 실패 시 재시도 동작
- [채널](/channels/) — 채널별 스트리밍 지원
