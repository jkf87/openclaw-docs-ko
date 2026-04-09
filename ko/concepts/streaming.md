---
summary: "스트리밍 + 청킹 동작 (블록 응답, 채널 미리보기 스트리밍, 모드 매핑)"
read_when:
  - 채널에서 스트리밍 또는 청킹이 작동하는 방식 설명 시
  - 블록 스트리밍 또는 채널 청킹 동작 변경 시
  - 중복/조기 블록 응답 또는 채널 미리보기 스트리밍 디버깅 시
title: "스트리밍 및 청킹"
---

# 스트리밍 + 청킹

OpenClaw에는 두 개의 별도 스트리밍 레이어가 있습니다:

- **블록 스트리밍 (채널):** 어시스턴트가 작성하면서 완성된 **블록**을 내보냅니다. 이는 일반 채널 메시지입니다 (토큰 델타가 아님).
- **미리보기 스트리밍 (Telegram/Discord/Slack):** 생성하는 동안 임시 **미리보기 메시지**를 업데이트합니다.

현재 채널 메시지에 대한 **진정한 토큰 델타 스트리밍**은 없습니다. 미리보기 스트리밍은 메시지 기반입니다 (전송 + 편집/추가).

## 블록 스트리밍 (채널 메시지)

블록 스트리밍은 어시스턴트 출력이 사용 가능해지면서 거친 청크로 보냅니다.

```
모델 출력
  └─ text_delta/이벤트
       ├─ (blockStreamingBreak=text_end)
       │    └─ 버퍼가 증가하면서 청커가 블록을 내보냄
       └─ (blockStreamingBreak=message_end)
            └─ message_end에서 청커가 플러시
                   └─ 채널 전송 (블록 응답)
```

범례:

- `text_delta/이벤트`: 모델 스트림 이벤트 (비스트리밍 모델의 경우 희박할 수 있음).
- `청커`: 최소/최대 경계 + 중단 선호도를 적용하는 `EmbeddedBlockChunker`.
- `채널 전송`: 실제 아웃바운드 메시지 (블록 응답).

**제어:**

- `agents.defaults.blockStreamingDefault`: `"on"`/`"off"` (기본값 off).
- 채널 오버라이드: `*.blockStreaming` (및 계정별 변형)으로 채널별 `"on"`/`"off"` 강제.
- `agents.defaults.blockStreamingBreak`: `"text_end"` 또는 `"message_end"`.
- `agents.defaults.blockStreamingChunk`: `{ minChars, maxChars, breakPreference? }`.
- `agents.defaults.blockStreamingCoalesce`: `{ minChars?, maxChars?, idleMs? }` (전송 전 스트리밍된 블록 병합).
- 채널 하드 상한: `*.textChunkLimit` (예: `channels.whatsapp.textChunkLimit`).
- 채널 청크 모드: `*.chunkMode` (`length` 기본값, `newline`은 길이 청킹 전에 빈 줄 (단락 경계)에서 분리).
- Discord 소프트 상한: `channels.discord.maxLinesPerMessage` (기본값 17)은 UI 클리핑을 피하기 위해 긴 응답을 분리.

**경계 의미론:**

- `text_end`: 청커가 내보내는 즉시 스트림 블록; 각 `text_end`에서 플러시.
- `message_end`: 어시스턴트 메시지가 완료될 때까지 기다린 다음 버퍼된 출력 플러시.

`message_end`는 버퍼된 텍스트가 `maxChars`를 초과하면 여전히 청커를 사용하므로 끝에서 여러 청크를 내보낼 수 있습니다.

## 청킹 알고리즘 (낮음/높음 경계)

블록 청킹은 `EmbeddedBlockChunker`로 구현됩니다:

- **낮은 경계:** 버퍼가 `minChars` 이상이 될 때까지 내보내지 않습니다 (강제가 아닌 경우).
- **높은 경계:** `maxChars` 전에 분리를 선호합니다. 강제된 경우 `maxChars`에서 분리.
- **중단 선호도:** `paragraph` → `newline` → `sentence` → `whitespace` → 하드 중단.
- **코드 펜스:** 펜스 내부에서 절대 분리하지 않습니다. `maxChars`에서 강제된 경우, 펜스를 닫고 다시 열어 Markdown을 유효하게 유지합니다.

`maxChars`는 채널 `textChunkLimit`으로 제한되므로 채널별 상한을 초과할 수 없습니다.

## 통합 (스트리밍된 블록 병합)

블록 스트리밍이 활성화되면 OpenClaw는 **연속 블록 청크**를 전송하기 전에 **병합**할 수 있습니다. 이는 여전히 진행형 출력을 제공하면서 "단일 라인 스팸"을 줄입니다.

- 통합은 플러시 전에 **유휴 간격** (`idleMs`)을 기다립니다.
- 버퍼는 `maxChars`로 제한되며 초과하면 플러시됩니다.
- `minChars`는 충분한 텍스트가 누적될 때까지 작은 단편이 전송되지 않도록 합니다 (최종 플러시는 항상 나머지 텍스트를 보냄).
- 조이너는 `blockStreamingChunk.breakPreference`에서 파생됩니다 (`paragraph` → `\n\n`, `newline` → `\n`, `sentence` → 공백).
- 채널 오버라이드는 `*.blockStreamingCoalesce`를 통해 사용 가능합니다 (계정별 구성 포함).
- 기본 통합 `minChars`는 오버라이드되지 않는 한 Signal/Slack/Discord에 대해 1500으로 증가됩니다.

## 블록 간 인간적 페이싱

블록 스트리밍이 활성화된 경우, 블록 응답 사이에 **무작위화된 일시 정지**를 추가할 수 있습니다 (첫 번째 블록 이후). 이는 멀티 버블 응답을 더 자연스럽게 느끼게 합니다.

- 구성: `agents.defaults.humanDelay` (`agents.list[].humanDelay`를 통해 에이전트별 오버라이드).
- 모드: `off` (기본값), `natural` (800~2500ms), `custom` (`minMs`/`maxMs`).
- **블록 응답**에만 적용됩니다. 최종 응답이나 도구 요약에는 적용되지 않습니다.

## "청크 스트리밍 또는 전체"

다음에 매핑됩니다:

- **청크 스트리밍:** `blockStreamingDefault: "on"` + `blockStreamingBreak: "text_end"` (진행하면서 내보냄). 비Telegram 채널은 `*.blockStreaming: true`도 필요합니다.
- **끝에서 전체 스트리밍:** `blockStreamingBreak: "message_end"` (한 번 플러시, 매우 길면 여러 청크 가능).
- **블록 스트리밍 없음:** `blockStreamingDefault: "off"` (최종 응답만).

**채널 참고:** 블록 스트리밍은 `*.blockStreaming`이 명시적으로 `true`로 설정되지 않으면 **꺼져 있습니다**. 채널은 블록 응답 없이 라이브 미리보기를 스트리밍할 수 있습니다 (`channels.<channel>.streaming`).

구성 위치 참고: `blockStreaming*` 기본값은 루트 구성이 아닌 `agents.defaults` 아래에 있습니다.

## 미리보기 스트리밍 모드

정식 키: `channels.<channel>.streaming`

모드:

- `off`: 미리보기 스트리밍 비활성화.
- `partial`: 최신 텍스트로 대체되는 단일 미리보기.
- `block`: 청크/추가 단계로 업데이트되는 미리보기.
- `progress`: 생성 중 진행/상태 미리보기, 완료 시 최종 응답.

### 채널 매핑

| 채널     | `off` | `partial` | `block` | `progress`        |
| -------- | ----- | --------- | ------- | ----------------- |
| Telegram | ✅    | ✅        | ✅      | `partial`로 매핑  |
| Discord  | ✅    | ✅        | ✅      | `partial`로 매핑  |
| Slack    | ✅    | ✅        | ✅      | ✅                |

Slack 전용:

- `channels.slack.streaming.nativeTransport`는 `channels.slack.streaming.mode="partial"` (기본값: `true`)일 때 Slack 네이티브 스트리밍 API 호출을 토글합니다.
- Slack 네이티브 스트리밍 및 Slack 어시스턴트 스레드 상태는 응답 스레드 대상이 필요합니다. 최상위 DM은 그 스레드 스타일 미리보기를 표시하지 않습니다.

레거시 키 마이그레이션:

- Telegram: `streamMode` + 불리언 `streaming`은 `streaming` 열거형으로 자동 마이그레이션.
- Discord: `streamMode` + 불리언 `streaming`은 `streaming` 열거형으로 자동 마이그레이션.
- Slack: `streamMode`는 `streaming.mode`로 자동 마이그레이션. 불리언 `streaming`은 `streaming.mode` + `streaming.nativeTransport`로 자동 마이그레이션. 레거시 `nativeStreaming`은 `streaming.nativeTransport`로 자동 마이그레이션.

### 런타임 동작

Telegram:

- DM 및 그룹/토픽에서 `sendMessage` + `editMessageText` 미리보기 업데이트를 사용합니다.
- Telegram 블록 스트리밍이 명시적으로 활성화된 경우 미리보기 스트리밍을 건너뜁니다 (이중 스트리밍 방지).
- `/reasoning stream`은 추론을 미리보기에 쓸 수 있습니다.

Discord:

- 전송 + 편집 미리보기 메시지를 사용합니다.
- `block` 모드는 초안 청킹 (`draftChunk`)을 사용합니다.
- Discord 블록 스트리밍이 명시적으로 활성화된 경우 미리보기 스트리밍을 건너뜁니다.

Slack:

- `partial`은 사용 가능한 경우 Slack 네이티브 스트리밍 (`chat.startStream`/`append`/`stop`)을 사용할 수 있습니다.
- `block`은 추가 스타일 초안 미리보기를 사용합니다.
- `progress`는 상태 미리보기 텍스트를 사용한 다음 최종 응답을 보냅니다.

## 관련 항목

- [메시지](/concepts/messages) — 메시지 라이프사이클 및 전달
- [재시도](/concepts/retry) — 전달 실패 시 재시도 동작
- [채널](/channels) — 채널별 스트리밍 지원
