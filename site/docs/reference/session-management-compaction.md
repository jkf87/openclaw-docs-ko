---
title: "세션 관리 심층 분석"
description: "심층 분석: 세션 저장소 + 트랜스크립트, 라이프사이클, (자동)컴팩션 내부 구조"
---

# 세션 관리 및 컴팩션 (심층 분석)

이 문서는 OpenClaw가 세션을 종단 간으로 관리하는 방법을 설명합니다:

- **세션 라우팅** (인바운드 메시지가 `sessionKey`에 매핑되는 방식)
- **세션 저장소** (`sessions.json`) 및 추적 내용
- **트랜스크립트 지속성** (`*.jsonl`) 및 구조
- **트랜스크립트 위생** (실행 전 프로바이더별 수정)
- **컨텍스트 제한** (컨텍스트 창 대 추적 토큰)
- **컴팩션** (수동 + 자동 컴팩션) 및 사전 컴팩션 작업을 위한 훅 위치
- **사일런트 하우스키핑** (예: 사용자에게 표시되지 않아야 하는 메모리 쓰기)

높은 수준의 개요를 먼저 원하는 경우 다음을 참조하십시오:

- [/concepts/session](/concepts/session)
- [/concepts/compaction](/concepts/compaction)
- [/concepts/memory](/concepts/memory)
- [/concepts/memory-search](/concepts/memory-search)
- [/concepts/session-pruning](/concepts/session-pruning)
- [/reference/transcript-hygiene](/reference/transcript-hygiene)

---

## 신뢰의 원천: 게이트웨이

OpenClaw는 세션 상태를 소유하는 단일 **게이트웨이 프로세스**를 중심으로 설계됩니다.

- UI (macOS 앱, 웹 Control UI, TUI)는 세션 목록 및 토큰 수를 위해 게이트웨이를 쿼리해야 합니다.
- 원격 모드에서 세션 파일은 원격 호스트에 있습니다. "로컬 Mac 파일 확인"은 게이트웨이가 사용하는 내용을 반영하지 않습니다.

---

## 두 가지 지속성 레이어

OpenClaw는 두 레이어에 세션을 지속합니다:

1. **세션 저장소 (`sessions.json`)**
   - 키/값 맵: `sessionKey -> SessionEntry`
   - 소형, 가변형, 편집 (또는 항목 삭제)이 안전합니다
   - 세션 메타데이터 (현재 세션 ID, 마지막 활동, 토글, 토큰 카운터 등) 추적

2. **트랜스크립트 (`&lt;sessionId&gt;.jsonl`)**
   - 트리 구조를 가진 추가 전용 트랜스크립트 (항목에는 `id` + `parentId`가 있음)
   - 실제 대화 + 도구 호출 + 컴팩션 요약 저장
   - 미래 턴의 모델 컨텍스트를 재구성하는 데 사용됨

---

## 디스크 위치

게이트웨이 호스트의 에이전트별:

- 저장소: `~/.openclaw/agents/&lt;agentId&gt;/sessions/sessions.json`
- 트랜스크립트: `~/.openclaw/agents/&lt;agentId&gt;/sessions/&lt;sessionId&gt;.jsonl`
  - Telegram 주제 세션: `.../&lt;sessionId&gt;-topic-&lt;threadId&gt;.jsonl`

OpenClaw는 `src/config/sessions.ts`를 통해 이를 확인합니다.

---

## 저장소 유지 보수 및 디스크 컨트롤

세션 지속성에는 `sessions.json` 및 트랜스크립트 아티팩트에 대한 자동 유지 보수 컨트롤 (`session.maintenance`)이 있습니다:

- `mode`: `warn` (기본값) 또는 `enforce`
- `pruneAfter`: 오래된 항목 연령 기준 (기본값 `30d`)
- `maxEntries`: `sessions.json`의 항목 수 제한 (기본값 `500`)
- `rotateBytes`: 과도하게 큰 경우 `sessions.json` 교체 (기본값 `10mb`)
- `resetArchiveRetention`: `*.reset.&lt;timestamp&gt;` 트랜스크립트 아카이브 보존 (기본값: `pruneAfter`와 동일; `false`는 정리 비활성화)
- `maxDiskBytes`: 선택적 세션 디렉토리 예산
- `highWaterBytes`: 정리 후 선택적 대상 (기본값 `maxDiskBytes`의 `80%`)

디스크 예산 정리 적용 순서 (`mode: "enforce"`):

1. 가장 오래된 아카이브 또는 고아 트랜스크립트 아티팩트를 먼저 제거합니다.
2. 여전히 대상 이상인 경우 가장 오래된 세션 항목과 해당 트랜스크립트 파일을 제거합니다.
3. 사용량이 `highWaterBytes` 이하가 될 때까지 계속합니다.

`mode: "warn"`에서 OpenClaw는 잠재적 제거를 보고하지만 저장소/파일을 변경하지 않습니다.

요청 시 유지 보수를 실행합니다:

```bash
openclaw sessions cleanup --dry-run
openclaw sessions cleanup --enforce
```

---

## Cron 세션 및 실행 로그

격리된 cron 실행도 세션 항목/트랜스크립트를 생성하며 전용 보존 컨트롤이 있습니다:

- `cron.sessionRetention` (기본값 `24h`)은 세션 저장소에서 이전 격리 cron 실행 세션을 프루닝합니다 (`false`는 비활성화).
- `cron.runLog.maxBytes` + `cron.runLog.keepLines`는 `~/.openclaw/cron/runs/&lt;jobId&gt;.jsonl` 파일을 프루닝합니다 (기본값: `2_000_000` 바이트 및 `2000` 줄).

---

## 세션 키 (`sessionKey`)

`sessionKey`는 _어떤 대화 버킷에 있는지_ 를 식별합니다 (라우팅 + 격리).

일반적인 패턴:

- 메인/다이렉트 채팅 (에이전트별): `agent:&lt;agentId&gt;:&lt;mainKey&gt;` (기본값 `main`)
- 그룹: `agent:&lt;agentId&gt;:&lt;channel&gt;:group:&lt;id&gt;`
- 룸/채널 (Discord/Slack): `agent:&lt;agentId&gt;:&lt;channel&gt;:channel:&lt;id&gt;` 또는 `...:room:&lt;id&gt;`
- Cron: `cron:&lt;job.id&gt;`
- 웹훅: `hook:&lt;uuid&gt;` (재정의하지 않는 한)

표준 규칙은 [/concepts/session](/concepts/session)에 문서화되어 있습니다.

---

## 세션 ID (`sessionId`)

각 `sessionKey`는 현재 `sessionId` (대화를 계속하는 트랜스크립트 파일)를 가리킵니다.

경험 법칙:

- **재설정** (`/new`, `/reset`)은 해당 `sessionKey`에 대한 새 `sessionId`를 생성합니다.
- **일일 재설정** (기본값 게이트웨이 호스트의 로컬 시간 오전 4시)은 재설정 경계 후 다음 메시지에 새 `sessionId`를 생성합니다.
- **유휴 만료** (`session.reset.idleMinutes` 또는 레거시 `session.idleMinutes`)는 유휴 창 후 메시지가 도착하면 새 `sessionId`를 생성합니다. 일일과 유휴가 모두 구성된 경우 먼저 만료되는 것이 우선합니다.
- **스레드 부모 포크 가드** (`session.parentForkMaxTokens`, 기본값 `100000`)는 부모 세션이 이미 너무 큰 경우 부모 트랜스크립트 포킹을 건너뜁니다. 새 스레드는 새로 시작됩니다. `0`으로 설정하면 비활성화됩니다.

구현 세부 사항: 결정은 `src/auto-reply/reply/session.ts`의 `initSessionState()`에서 발생합니다.

---

## 세션 저장소 스키마 (`sessions.json`)

저장소의 값 타입은 `src/config/sessions.ts`의 `SessionEntry`입니다.

주요 필드 (전체 목록 아님):

- `sessionId`: 현재 트랜스크립트 ID (파일 이름은 `sessionFile`이 설정되지 않는 한 여기서 파생됨)
- `updatedAt`: 마지막 활동 타임스탬프
- `sessionFile`: 선택적 명시적 트랜스크립트 경로 재정의
- `chatType`: `direct | group | room` (UI 및 전송 정책에 도움이 됨)
- `provider`, `subject`, `room`, `space`, `displayName`: 그룹/채널 레이블링을 위한 메타데이터
- 토글:
  - `thinkingLevel`, `verboseLevel`, `reasoningLevel`, `elevatedLevel`
  - `sendPolicy` (세션별 재정의)
- 모델 선택:
  - `providerOverride`, `modelOverride`, `authProfileOverride`
- 토큰 카운터 (최선의 노력 / 프로바이더 의존적):
  - `inputTokens`, `outputTokens`, `totalTokens`, `contextTokens`
- `compactionCount`: 이 세션 키에 대해 자동 컴팩션이 완료된 횟수
- `memoryFlushAt`: 마지막 사전 컴팩션 메모리 플러시의 타임스탬프
- `memoryFlushCompactionCount`: 마지막 플러시가 실행된 시점의 컴팩션 횟수

저장소는 편집이 안전하지만 게이트웨이가 권한입니다: 세션이 실행될 때 항목을 다시 쓰거나 재수화할 수 있습니다.

---

## 트랜스크립트 구조 (`*.jsonl`)

트랜스크립트는 `@mariozechner/pi-coding-agent`의 `SessionManager`에 의해 관리됩니다.

파일은 JSONL입니다:

- 첫 번째 줄: 세션 헤더 (`type: "session"`, `id`, `cwd`, `timestamp`, 선택적 `parentSession` 포함)
- 그 다음: `id` + `parentId`가 있는 세션 항목 (트리)

주요 항목 타입:

- `message`: 사용자/어시스턴트/도구 결과 메시지
- `custom_message`: 모델 컨텍스트에 _들어가는_ 확장 주입 메시지 (UI에서 숨길 수 있음)
- `custom`: 모델 컨텍스트에 _들어가지 않는_ 확장 상태
- `compaction`: `firstKeptEntryId` 및 `tokensBefore`가 있는 지속된 컴팩션 요약
- `branch_summary`: 트리 브랜치 탐색 시 지속된 요약

OpenClaw는 트랜스크립트를 의도적으로 "수정"하지 않습니다. 게이트웨이는 `SessionManager`를 사용하여 읽기/쓰기합니다.

---

## 컨텍스트 창 대 추적 토큰

두 가지 다른 개념이 중요합니다:

1. **모델 컨텍스트 창**: 모델당 하드 상한 (모델에 표시되는 토큰)
2. **세션 저장소 카운터**: `sessions.json`에 기록된 롤링 통계 (/status 및 대시보드에 사용됨)

제한을 조정하는 경우:

- 컨텍스트 창은 모델 카탈로그에서 가져옵니다 (구성으로 재정의할 수 있음).
- 저장소의 `contextTokens`는 런타임 추정/보고 값입니다. 엄격한 보장으로 취급하지 마십시오.

자세한 내용은 [/token-use](/reference/token-use)를 참조하십시오.

---

## 컴팩션: 개념

컴팩션은 이전 대화를 트랜스크립트의 지속된 `compaction` 항목으로 요약하고 최근 메시지는 그대로 유지합니다.

컴팩션 후 미래 턴은 다음을 보게 됩니다:

- 컴팩션 요약
- `firstKeptEntryId` 이후의 메시지

컴팩션은 **지속적**입니다 (세션 프루닝과 달리). [/concepts/session-pruning](/concepts/session-pruning)을 참조하십시오.

## 컴팩션 청크 경계 및 도구 페어링

OpenClaw가 긴 트랜스크립트를 컴팩션 청크로 분할할 때 어시스턴트 도구 호출을 일치하는 `toolResult` 항목과 페어링된 상태로 유지합니다.

- 토큰 공유 분할이 도구 호출과 결과 사이에 도달하면 OpenClaw는 페어를 분리하는 대신 경계를 어시스턴트 도구 호출 메시지로 이동합니다.
- 후행 도구 결과 블록이 청크를 대상 이상으로 밀어붙이는 경우 OpenClaw는 해당 보류 중인 도구 블록을 보존하고 요약되지 않은 꼬리를 그대로 유지합니다.
- 중단/오류 도구 호출 블록은 보류 중인 분할을 열어두지 않습니다.

---

## 자동 컴팩션이 발생하는 시점 (Pi 런타임)

임베디드 Pi 에이전트에서 자동 컴팩션은 두 가지 경우에 트리거됩니다:

1. **오버플로우 복구**: 모델이 컨텍스트 오버플로우 오류를 반환함
   (`request_too_large`, `context length exceeded`, `input exceeds the maximum
number of tokens`, `input token count exceeds the maximum number of input
tokens`, `input is too long for the model`, `ollama error: context length
exceeded`, 및 유사한 프로바이더 형태 변형) → 컴팩션 → 재시도.
2. **임계값 유지**: 성공적인 턴 후:

`contextTokens > contextWindow - reserveTokens`

여기서:

- `contextWindow`는 모델의 컨텍스트 창
- `reserveTokens`는 프롬프트 + 다음 모델 출력을 위해 예약된 여유 공간

이것은 Pi 런타임 의미론입니다 (OpenClaw는 이벤트를 소비하지만 Pi가 컴팩션 시점을 결정합니다).

---

## 컴팩션 설정 (`reserveTokens`, `keepRecentTokens`)

Pi의 컴팩션 설정은 Pi 설정에 있습니다:

```json5
{
  compaction: {
    enabled: true,
    reserveTokens: 16384,
    keepRecentTokens: 20000,
  },
}
```

OpenClaw는 임베디드 실행에 대한 안전 플로어도 적용합니다:

- `compaction.reserveTokens < reserveTokensFloor`이면 OpenClaw가 올립니다.
- 기본 플로어는 `20000` 토큰입니다.
- `agents.defaults.compaction.reserveTokensFloor: 0`으로 플로어를 비활성화합니다.
- 이미 더 높은 경우 OpenClaw는 그대로 둡니다.

이유: 컴팩션이 불가피해지기 전에 멀티 턴 "하우스키핑" (메모리 쓰기 등)을 위한 충분한 여유 공간을 남겨두기 위해서입니다.

구현: `src/agents/pi-settings.ts`의 `ensurePiCompactionReserveTokens()`
(`src/agents/pi-embedded-runner.ts`에서 호출됨).

---

## 플러그형 컴팩션 프로바이더

플러그인은 플러그인 API의 `registerCompactionProvider()`를 통해 컴팩션 프로바이더를 등록할 수 있습니다. `agents.defaults.compaction.provider`가 등록된 프로바이더 ID로 설정된 경우 안전망 확장은 내장된 `summarizeInStages` 파이프라인 대신 해당 프로바이더에게 요약을 위임합니다.

- `provider`: 등록된 컴팩션 프로바이더 플러그인의 ID. 기본 LLM 요약은 설정하지 않습니다.
- `provider`를 설정하면 `mode: "safeguard"`가 강제됩니다.
- 프로바이더는 내장 경로와 동일한 컴팩션 지침 및 식별자 보존 정책을 받습니다.
- 안전망은 프로바이더 출력 후에도 최근 턴 및 분할 턴 접미사 컨텍스트를 보존합니다.
- 프로바이더가 실패하거나 빈 결과를 반환하면 OpenClaw는 자동으로 내장 LLM 요약으로 폴백합니다.
- 중단/타임아웃 신호는 호출자 취소를 존중하기 위해 삼켜지지 않고 다시 던져집니다.

소스: `src/plugins/compaction-provider.ts`, `src/agents/pi-hooks/compaction-safeguard.ts`.

---

## 사용자 대면 서페이스

다음을 통해 컴팩션 및 세션 상태를 관찰할 수 있습니다:

- `/status` (모든 채팅 세션에서)
- `openclaw status` (CLI)
- `openclaw sessions` / `sessions --json`
- 자세한 모드: `🧹 자동 컴팩션 완료` + 컴팩션 횟수

---

## 사일런트 하우스키핑 (`NO_REPLY`)

OpenClaw는 사용자가 중간 출력을 보지 않아야 하는 백그라운드 작업을 위한 "사일런트" 턴을 지원합니다.

관례:

- 어시스턴트는 출력을 정확한 사일런트 토큰 `NO_REPLY` /
  `no_reply`로 시작하여 "사용자에게 응답을 전달하지 마십시오"를 나타냅니다.
- OpenClaw는 전달 레이어에서 이를 제거/억제합니다.
- 정확한 사일런트 토큰 억제는 대소문자를 구분하지 않습니다. 전체 페이로드가 사일런트 토큰인 경우 `NO_REPLY`와 `no_reply` 모두 해당됩니다.
- 이것은 진정한 백그라운드/무전달 턴만을 위한 것입니다. 일반적인 실행 가능한 사용자 요청에 대한 단축키가 아닙니다.

`2026.1.10`부터 OpenClaw는 부분 청크가 `NO_REPLY`로 시작될 때 **드래프트/타이핑 스트리밍**도 억제합니다. 따라서 사일런트 작업이 턴 중간에 부분 출력을 누설하지 않습니다.

---

## 사전 컴팩션 "메모리 플러시" (구현됨)

목표: 자동 컴팩션이 발생하기 전에 사일런트 에이전틱 턴을 실행하여 컴팩션이 중요한 컨텍스트를 지울 수 없도록 내구성 있는 상태를 디스크 (예: 에이전트 워크스페이스의 `memory/YYYY-MM-DD.md`)에 씁니다.

OpenClaw는 **사전 임계값 플러시** 접근 방식을 사용합니다:

1. 세션 컨텍스트 사용량을 모니터링합니다.
2. "소프트 임계값" (Pi의 컴팩션 임계값 이하)을 초과하면 에이전트에게 사일런트 "지금 메모리 쓰기" 지시문을 실행합니다.
3. 사용자가 아무것도 보지 않도록 정확한 사일런트 토큰 `NO_REPLY` / `no_reply`를 사용합니다.

구성 (`agents.defaults.compaction.memoryFlush`):

- `enabled` (기본값: `true`)
- `softThresholdTokens` (기본값: `4000`)
- `prompt` (플러시 턴을 위한 사용자 메시지)
- `systemPrompt` (플러시 턴을 위해 추가되는 추가 시스템 프롬프트)

메모:

- 기본 프롬프트/시스템 프롬프트에는 전달을 억제하기 위한 `NO_REPLY` 힌트가 포함됩니다.
- 플러시는 컴팩션 주기당 한 번 실행됩니다 (`sessions.json`에서 추적됨).
- 플러시는 임베디드 Pi 세션에 대해서만 실행됩니다 (CLI 백엔드는 건너뜁니다).
- 세션 워크스페이스가 읽기 전용 (`workspaceAccess: "ro"` 또는 `"none"`)인 경우 플러시가 건너뜁니다.
- 워크스페이스 파일 레이아웃 및 쓰기 패턴은 [메모리](/concepts/memory)를 참조하십시오.

Pi는 확장 API에서 `session_before_compact` 훅을 노출하지만 OpenClaw의 플러시 로직은 현재 게이트웨이 측에 있습니다.

---

## 문제 해결 체크리스트

- 세션 키가 잘못되었습니까? [/concepts/session](/concepts/session)에서 시작하여 `/status`에서 `sessionKey`를 확인하십시오.
- 저장소 대 트랜스크립트 불일치? `openclaw status`에서 게이트웨이 호스트 및 저장소 경로를 확인하십시오.
- 컴팩션 스팸? 확인:
  - 모델 컨텍스트 창 (너무 작음)
  - 컴팩션 설정 (`reserveTokens`가 모델 창에 비해 너무 높으면 더 일찍 컴팩션이 발생할 수 있음)
  - 도구 결과 팽창: 세션 프루닝 활성화/조정
- 사일런트 턴 누설? 응답이 `NO_REPLY`로 시작하는지 (대소문자 구분 없이 정확한 토큰) 확인하고 스트리밍 억제 수정이 포함된 빌드에 있는지 확인하십시오.
