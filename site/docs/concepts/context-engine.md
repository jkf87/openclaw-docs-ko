---
title: "컨텍스트 엔진"
description: "컨텍스트 엔진: 플러그 가능한 컨텍스트 조립, 컴팩션, 서브에이전트 생명주기"
---

# 컨텍스트 엔진

**컨텍스트 엔진**은 OpenClaw가 각 실행에 대한 모델 컨텍스트를 빌드하는 방법을 제어합니다. 포함할 메시지, 오래된 히스토리 요약 방법, 서브에이전트 경계를 가로질러 컨텍스트를 관리하는 방법을 결정합니다.

OpenClaw는 내장 `legacy` 엔진을 제공합니다. 플러그인은 활성 컨텍스트 엔진 생명주기를 대체하는 대안 엔진을 등록할 수 있습니다.

## 빠른 시작

활성 엔진 확인:

```bash
openclaw doctor
# 또는 구성 직접 검사:
cat ~/.openclaw/openclaw.json | jq '.plugins.slots.contextEngine'
```

### 컨텍스트 엔진 플러그인 설치

컨텍스트 엔진 플러그인은 다른 OpenClaw 플러그인처럼 설치됩니다. 먼저 설치한 다음 슬롯에서 엔진을 선택하십시오:

```bash
# npm에서 설치
openclaw plugins install @martian-engineering/lossless-claw

# 또는 로컬 경로에서 설치 (개발용)
openclaw plugins install -l ./my-context-engine
```

그런 다음 구성에서 플러그인을 활성화하고 활성 엔진으로 선택하십시오:

```json5
// openclaw.json
{
  plugins: {
    slots: {
      contextEngine: "lossless-claw", // 플러그인의 등록된 엔진 ID와 일치해야 함
    },
    entries: {
      "lossless-claw": {
        enabled: true,
        // 플러그인별 구성은 여기에 (플러그인 문서 참조)
      },
    },
  },
}
```

설치 및 구성 후 게이트웨이를 재시작하십시오.

내장 엔진으로 돌아가려면 `contextEngine`을 `"legacy"`로 설정하거나 키를 완전히 제거하십시오 (`"legacy"`가 기본값입니다).

## 작동 방식

OpenClaw가 모델 프롬프트를 실행할 때마다, 컨텍스트 엔진은 4개의 생명주기 포인트에 참여합니다:

1. **Ingest** — 새 메시지가 세션에 추가될 때 호출됩니다. 엔진은 자체 데이터 저장소에 메시지를 저장하거나 인덱싱할 수 있습니다.
2. **Assemble** — 각 모델 실행 전에 호출됩니다. 엔진은 토큰 예산 내에 맞는 정렬된 메시지 세트 (및 선택적 `systemPromptAddition`)를 반환합니다.
3. **Compact** — 컨텍스트 윈도우가 가득 찼을 때, 또는 사용자가 `/compact`를 실행할 때 호출됩니다. 엔진은 공간을 확보하기 위해 오래된 히스토리를 요약합니다.
4. **After turn** — 실행 완료 후 호출됩니다. 엔진은 상태를 영속화하거나, 백그라운드 컴팩션을 트리거하거나, 인덱스를 업데이트할 수 있습니다.

### 서브에이전트 생명주기 (선택적)

OpenClaw는 현재 하나의 서브에이전트 생명주기 후크를 호출합니다:

- **onSubagentEnded** — 서브에이전트 세션이 완료되거나 정리될 때 정리합니다.

`prepareSubagentSpawn` 후크는 향후 사용을 위해 인터페이스의 일부이지만, 런타임은 아직 호출하지 않습니다.

### 시스템 프롬프트 추가

`assemble` 메서드는 `systemPromptAddition` 문자열을 반환할 수 있습니다. OpenClaw는 이를 실행의 시스템 프롬프트 앞에 추가합니다. 이를 통해 엔진은 정적 워크스페이스 파일을 필요로 하지 않고 동적 회상 지침, 검색 지침, 또는 컨텍스트 인식 힌트를 주입할 수 있습니다.

## 레거시 엔진

내장 `legacy` 엔진은 OpenClaw의 원래 동작을 보존합니다:

- **Ingest**: no-op (세션 관리자가 직접 메시지 영속화를 처리합니다).
- **Assemble**: 패스스루 (런타임의 기존 sanitize → validate → limit 파이프라인이 컨텍스트 조립을 처리합니다).
- **Compact**: 오래된 메시지의 단일 요약을 생성하고 최근 메시지를 그대로 유지하는 내장 요약 컴팩션에 위임합니다.
- **After turn**: no-op.

레거시 엔진은 도구를 등록하거나 `systemPromptAddition`을 제공하지 않습니다.

`plugins.slots.contextEngine`이 설정되지 않거나 `"legacy"`로 설정된 경우, 이 엔진이 자동으로 사용됩니다.

## 플러그인 엔진

플러그인은 플러그인 API를 사용하여 컨텍스트 엔진을 등록할 수 있습니다:

```ts
import { buildMemorySystemPromptAddition } from "openclaw/plugin-sdk/core";

export default function register(api) {
  api.registerContextEngine("my-engine", () => ({
    info: {
      id: "my-engine",
      name: "My Context Engine",
      ownsCompaction: true,
    },

    async ingest({ sessionId, message, isHeartbeat }) {
      // 데이터 저장소에 메시지 저장
      return { ingested: true };
    },

    async assemble({ sessionId, messages, tokenBudget, availableTools, citationsMode }) {
      // 예산에 맞는 메시지 반환
      return {
        messages: buildContext(messages, tokenBudget),
        estimatedTokens: countTokens(messages),
        systemPromptAddition: buildMemorySystemPromptAddition({
          availableTools: availableTools ?? new Set(),
          citationsMode,
        }),
      };
    },

    async compact({ sessionId, force }) {
      // 오래된 컨텍스트 요약
      return { ok: true, compacted: true };
    },
  }));
}
```

그런 다음 구성에서 활성화하십시오:

```json5
{
  plugins: {
    slots: {
      contextEngine: "my-engine",
    },
    entries: {
      "my-engine": {
        enabled: true,
      },
    },
  },
}
```

### ContextEngine 인터페이스

필수 멤버:

| 멤버               | 종류     | 목적                                                     |
| ------------------ | -------- | -------------------------------------------------------- |
| `info`             | 속성     | 엔진 ID, 이름, 버전, 컴팩션 소유 여부                    |
| `ingest(params)`   | 메서드   | 단일 메시지 저장                                         |
| `assemble(params)` | 메서드   | 모델 실행을 위한 컨텍스트 빌드 (`AssembleResult` 반환)   |
| `compact(params)`  | 메서드   | 컨텍스트 요약/축소                                       |

`assemble`은 다음을 포함하는 `AssembleResult`를 반환합니다:

- `messages` — 모델에 전송할 정렬된 메시지.
- `estimatedTokens` (필수, `number`) — 조립된 컨텍스트의 총 토큰에 대한 엔진의 추정치. OpenClaw는 이를 컴팩션 임계값 결정 및 진단 보고에 사용합니다.
- `systemPromptAddition` (선택적, `string`) — 시스템 프롬프트 앞에 추가됩니다.

선택적 멤버:

| 멤버                           | 종류   | 목적                                                                                                            |
| ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------- |
| `bootstrap(params)`            | 메서드 | 세션에 대한 엔진 상태 초기화. 엔진이 처음 세션을 볼 때 한 번 호출됩니다 (예: 히스토리 가져오기).               |
| `ingestBatch(params)`          | 메서드 | 완료된 턴을 배치로 수집합니다. 실행 완료 후, 해당 턴의 모든 메시지를 한 번에 호출합니다.                       |
| `afterTurn(params)`            | 메서드 | 실행 후 생명주기 작업 (상태 영속화, 백그라운드 컴팩션 트리거).                                                  |
| `prepareSubagentSpawn(params)` | 메서드 | 자식 세션을 위한 공유 상태 설정.                                                                                |
| `onSubagentEnded(params)`      | 메서드 | 서브에이전트 종료 후 정리.                                                                                      |
| `dispose()`                    | 메서드 | 리소스 해제. 게이트웨이 종료 또는 플러그인 리로드 중 호출됩니다 — 세션별이 아닙니다.                           |

### ownsCompaction

`ownsCompaction`은 실행 중 Pi의 내장 인시도 자동 컴팩션이 활성화된 상태를 유지할지 제어합니다:

- `true` — 엔진이 컴팩션 동작을 소유합니다. OpenClaw는 해당 실행에 대한 Pi의 내장 자동 컴팩션을 비활성화하며, 엔진의 `compact()` 구현이 `/compact`, 오버플로우 복구 컴팩션, 및 `afterTurn()`에서 원하는 모든 사전적 컴팩션을 담당합니다.
- `false` 또는 설정되지 않음 — Pi의 내장 자동 컴팩션이 프롬프트 실행 중에도 실행될 수 있지만, 활성 엔진의 `compact()` 메서드는 `/compact` 및 오버플로우 복구에 여전히 호출됩니다.

`ownsCompaction: false`는 OpenClaw가 자동으로 레거시 엔진의 컴팩션 경로로 폴백한다는 의미가 **아닙니다**.

즉, 두 가지 유효한 플러그인 패턴이 있습니다:

- **소유 모드** — 자체 컴팩션 알고리즘을 구현하고 `ownsCompaction: true`를 설정합니다.
- **위임 모드** — `ownsCompaction: false`를 설정하고 `compact()`에서 `openclaw/plugin-sdk/core`의 `delegateCompactionToRuntime(...)`을 호출하여 OpenClaw의 내장 컴팩션 동작을 사용합니다.

활성 비소유 엔진에 대한 no-op `compact()`는 해당 엔진 슬롯에 대한 일반 `/compact` 및 오버플로우 복구 컴팩션 경로를 비활성화하기 때문에 안전하지 않습니다.

## 구성 참조

```json5
{
  plugins: {
    slots: {
      // 활성 컨텍스트 엔진 선택. 기본값: "legacy".
      // 플러그인 엔진을 사용하려면 플러그인 ID로 설정하십시오.
      contextEngine: "legacy",
    },
  },
}
```

슬롯은 런타임에 배타적입니다 — 주어진 실행 또는 컴팩션 작업에 대해 하나의 등록된 컨텍스트 엔진만 확인됩니다. 다른 활성화된 `kind: "context-engine"` 플러그인은 여전히 등록 코드를 로드하고 실행할 수 있습니다; `plugins.slots.contextEngine`은 컨텍스트 엔진이 필요할 때 OpenClaw가 어떤 등록된 엔진 ID를 확인할지만 선택합니다.

## 컴팩션 및 메모리와의 관계

- **컴팩션**은 컨텍스트 엔진의 하나의 책임입니다. 레거시 엔진은 OpenClaw의 내장 요약에 위임합니다. 플러그인 엔진은 모든 컴팩션 전략 (DAG 요약, 벡터 검색 등)을 구현할 수 있습니다.
- **메모리 플러그인** (`plugins.slots.memory`)은 컨텍스트 엔진과 별개입니다. 메모리 플러그인은 검색/검색을 제공하며; 컨텍스트 엔진은 모델이 보는 것을 제어합니다. 함께 작동할 수 있습니다 — 컨텍스트 엔진은 조립 중에 메모리 플러그인 데이터를 사용할 수 있습니다. 활성 메모리 프롬프트 경로를 원하는 플러그인 엔진은 `openclaw/plugin-sdk/core`의 `buildMemorySystemPromptAddition(...)`을 선호해야 합니다. 이는 활성 메모리 프롬프트 섹션을 준비-추가 가능한 `systemPromptAddition`으로 변환합니다. 엔진이 하위 수준 제어가 필요하면 `buildActiveMemoryPromptSection(...)`을 통해 `openclaw/plugin-sdk/memory-host-core`에서 원시 라인을 직접 가져올 수도 있습니다.
- **세션 프루닝** (인메모리에서 오래된 도구 결과 자르기)은 어떤 컨텍스트 엔진이 활성화되어 있든 관계없이 실행됩니다.

## 팁

- `openclaw doctor`를 사용하여 엔진이 올바르게 로드되는지 확인하십시오.
- 엔진을 전환하면 기존 세션은 현재 히스토리를 계속 유지합니다. 새 엔진은 향후 실행을 위해 이어받습니다.
- 엔진 오류는 로그에 기록되고 진단에 표시됩니다. 플러그인 엔진이 등록에 실패하거나 선택된 엔진 ID를 확인할 수 없으면 OpenClaw는 자동으로 폴백하지 않습니다; 플러그인을 수정하거나 `plugins.slots.contextEngine`을 `"legacy"`로 다시 전환할 때까지 실행이 실패합니다.
- 개발을 위해 `openclaw plugins install -l ./my-engine`을 사용하여 복사 없이 로컬 플러그인 디렉터리를 링크하십시오.

참조: [컴팩션](/concepts/compaction), [컨텍스트](/concepts/context), [플러그인](/tools/plugin), [플러그인 매니페스트](/plugins/manifest).

## 관련 항목

- [컨텍스트](/concepts/context) — 에이전트 턴을 위한 컨텍스트 빌드 방법
- [플러그인 아키텍처](/plugins/architecture) — 컨텍스트 엔진 플러그인 등록
- [컴팩션](/concepts/compaction) — 긴 대화 요약
