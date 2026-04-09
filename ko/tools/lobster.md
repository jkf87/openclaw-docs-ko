---
title: Lobster
summary: "재개 가능한 승인 게이트가 있는 OpenClaw용 타입 지정 워크플로우 런타임."
read_when:
  - You want deterministic multi-step workflows with explicit approvals
  - You need to resume a workflow without re-running earlier steps
---

# Lobster

Lobster는 OpenClaw가 멀티 스텝 도구 시퀀스를 명시적 승인 체크포인트가 있는 단일하고 결정론적인 작업으로 실행할 수 있도록 하는 워크플로우 쉘입니다.

Lobster는 분리된 백그라운드 작업보다 한 단계 위의 작성 레이어입니다. 개별 작업 위의 흐름 오케스트레이션에 대해서는 [태스크 플로우](/automation/taskflow) (`openclaw tasks flow`)를 참조하십시오. 작업 활동 원장에 대해서는 [`openclaw tasks`](/automation/tasks)를 참조하십시오.

## 후크

어시스턴트는 자신을 관리하는 도구를 만들 수 있습니다. 워크플로우를 요청하면 30분 후에 하나의 호출로 실행되는 CLI와 파이프라인이 완성됩니다. Lobster는 빠진 조각입니다: 결정론적 파이프라인, 명시적 승인, 재개 가능한 상태.

## 이유

오늘날 복잡한 워크플로우는 많은 앞뒤 도구 호출이 필요합니다. 각 호출은 토큰을 소비하고 LLM이 모든 단계를 오케스트레이션해야 합니다. Lobster는 그 오케스트레이션을 타입 지정 런타임으로 이동시킵니다:

- **여러 호출 대신 하나의 호출**: OpenClaw는 하나의 Lobster 도구 호출을 실행하고 구조화된 결과를 얻습니다.
- **내장된 승인**: 부작용 (이메일 전송, 댓글 게시)은 명시적으로 승인될 때까지 워크플로우를 중단합니다.
- **재개 가능**: 중단된 워크플로우는 토큰을 반환합니다. 모든 것을 다시 실행하지 않고 승인 후 재개하십시오.

## 일반 프로그램 대신 DSL을 사용하는 이유

Lobster는 의도적으로 작습니다. 목표는 "새로운 언어"가 아니라 일급 승인 및 재개 토큰이 있는 예측 가능하고 AI 친화적인 파이프라인 사양입니다.

- **승인/재개가 내장됨**: 일반 프로그램은 인간에게 프롬프트를 표시할 수 있지만, 직접 그 런타임을 발명하지 않으면 내구성 있는 토큰으로 _일시 중지 및 재개_할 수 없습니다.
- **결정론 + 감사 가능성**: 파이프라인은 데이터이므로 로깅, 차이, 재생, 검토가 쉽습니다.
- **AI를 위한 제한된 표면**: 작은 문법 + JSON 파이핑은 "창의적인" 코드 경로를 줄이고 검증을 현실적으로 만듭니다.
- **정책 내장 안전**: 타임아웃, 출력 상한, 샌드박스 검사, 허용 목록이 각 스크립트가 아닌 런타임에 의해 적용됩니다.
- **여전히 프로그래밍 가능**: 각 단계는 모든 CLI 또는 스크립트를 호출할 수 있습니다. JS/TS를 원한다면 코드에서 `.lobster` 파일을 생성하십시오.

## 작동 방식

OpenClaw는 내장 실행기를 사용하여 **인프로세스**로 Lobster 워크플로우를 실행합니다. 외부 CLI 서브프로세스가 생성되지 않습니다. 워크플로우 엔진은 게이트웨이 프로세스 내에서 실행되고 직접 JSON 봉투를 반환합니다.
파이프라인이 승인을 위해 일시 중지되면 도구는 나중에 계속할 수 있도록 `resumeToken`을 반환합니다.

## 패턴: 작은 CLI + JSON 파이프 + 승인

JSON을 출력하는 작은 명령을 만들고 하나의 Lobster 호출로 연결하십시오. (아래 예시 명령 이름 - 자신의 것으로 바꾸십시오.)

```bash
inbox list --json
inbox categorize --json
inbox apply --json
```

```json
{
  "action": "run",
  "pipeline": "exec --json --shell 'inbox list --json' | exec --stdin json --shell 'inbox categorize --json' | exec --stdin json --shell 'inbox apply --json' | approve --preview-from-stdin --limit 5 --prompt 'Apply changes?'",
  "timeoutMs": 30000
}
```

파이프라인이 승인을 요청하면 토큰으로 재개합니다:

```json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
```

AI가 워크플로우를 트리거하고 Lobster가 단계를 실행합니다. 승인 게이트는 부작용을 명시적이고 감사 가능하게 유지합니다.

예시: 입력 항목을 도구 호출로 매핑합니다:

```bash
gog.gmail.search --query 'newer_than:1d' \
  | openclaw.invoke --tool message --action send --each --item-key message --args-json '{"provider":"telegram","to":"..."}'
```

## JSON 전용 LLM 단계 (llm-task)

**구조화된 LLM 단계**가 필요한 워크플로우의 경우 선택적 `llm-task` 플러그인 도구를 활성화하고 Lobster에서 호출하십시오. 이를 통해 모델로 분류/요약/초안을 작성하면서도 워크플로우가 결정론적으로 유지됩니다.

도구 활성화:

```json
{
  "plugins": {
    "entries": {
      "llm-task": { "enabled": true }
    }
  },
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": { "allow": ["llm-task"] }
      }
    ]
  }
}
```

파이프라인에서 사용합니다:

```lobster
openclaw.invoke --tool llm-task --action json --args-json '{
  "prompt": "Given the input email, return intent and draft.",
  "thinking": "low",
  "input": { "subject": "Hello", "body": "Can you help?" },
  "schema": {
    "type": "object",
    "properties": {
      "intent": { "type": "string" },
      "draft": { "type": "string" }
    },
    "required": ["intent", "draft"],
    "additionalProperties": false
  }
}'
```

자세한 내용 및 설정 옵션은 [LLM 태스크](/tools/llm-task)를 참조하십시오.

## 워크플로우 파일 (.lobster)

Lobster는 `name`, `args`, `steps`, `env`, `condition`, `approval` 필드가 있는 YAML/JSON 워크플로우 파일을 실행할 수 있습니다. OpenClaw 도구 호출에서 `pipeline`을 파일 경로로 설정하십시오.

```yaml
name: inbox-triage
args:
  tag:
    default: "family"
steps:
  - id: collect
    command: inbox list --json
  - id: categorize
    command: inbox categorize --json
    stdin: $collect.stdout
  - id: approve
    command: inbox apply --approve
    stdin: $categorize.stdout
    approval: required
  - id: execute
    command: inbox apply --execute
    stdin: $categorize.stdout
    condition: $approve.approved
```

참고 사항:

- `stdin: $step.stdout` 및 `stdin: $step.json`은 이전 단계의 출력을 전달합니다.
- `condition` (또는 `when`)은 `$step.approved`로 단계를 게이트할 수 있습니다.

## Lobster 설치

번들된 Lobster 워크플로우는 인프로세스로 실행됩니다. 별도의 `lobster` 바이너리가 필요하지 않습니다. 내장 실행기는 Lobster 플러그인과 함께 제공됩니다.

개발 또는 외부 파이프라인을 위한 독립 실행형 Lobster CLI가 필요하면 [Lobster 레포](https://github.com/openclaw/lobster)에서 설치하고 `lobster`가 `PATH`에 있는지 확인하십시오.

## 도구 활성화

Lobster는 **선택적** 플러그인 도구입니다 (기본적으로 활성화되지 않음).

권장 (추가적, 안전):

```json
{
  "tools": {
    "alsoAllow": ["lobster"]
  }
}
```

또는 에이전트별:

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": {
          "alsoAllow": ["lobster"]
        }
      }
    ]
  }
}
```

제한적인 허용 목록 모드로 실행하려는 경우가 아니면 `tools.allow: ["lobster"]`를 사용하지 마십시오.

참고: 허용 목록은 선택적 플러그인에 대해 옵트인입니다. 허용 목록에 플러그인 도구만 지정하면 (예: `lobster`) OpenClaw는 코어 도구를 활성화된 상태로 유지합니다. 코어 도구를 제한하려면 허용 목록에 원하는 코어 도구나 그룹도 포함하십시오.

## 예시: 이메일 분류

Lobster 없이:

```
User: "Check my email and draft replies"
→ openclaw calls gmail.list
→ LLM summarizes
→ User: "draft replies to #2 and #5"
→ LLM drafts
→ User: "send #2"
→ openclaw calls gmail.send
(repeat daily, no memory of what was triaged)
```

Lobster 사용:

```json
{
  "action": "run",
  "pipeline": "email.triage --limit 20",
  "timeoutMs": 30000
}
```

JSON 봉투 반환 (축약됨):

```json
{
  "ok": true,
  "status": "needs_approval",
  "output": [{ "summary": "5 need replies, 2 need action" }],
  "requiresApproval": {
    "type": "approval_request",
    "prompt": "Send 2 draft replies?",
    "items": [],
    "resumeToken": "..."
  }
}
```

사용자 승인 → 재개:

```json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
```

하나의 워크플로우. 결정론적. 안전.

## 도구 파라미터

### `run`

도구 모드에서 파이프라인을 실행합니다.

```json
{
  "action": "run",
  "pipeline": "gog.gmail.search --query 'newer_than:1d' | email.triage",
  "cwd": "workspace",
  "timeoutMs": 30000,
  "maxStdoutBytes": 512000
}
```

인수와 함께 워크플로우 파일 실행:

```json
{
  "action": "run",
  "pipeline": "/path/to/inbox-triage.lobster",
  "argsJson": "{\"tag\":\"family\"}"
}
```

### `resume`

승인 후 중단된 워크플로우를 계속합니다.

```json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
```

### 선택적 입력

- `cwd`: 파이프라인의 상대 작업 디렉토리 (게이트웨이 작업 디렉토리 내에 있어야 함).
- `timeoutMs`: 이 시간을 초과하면 워크플로우를 중단합니다 (기본값: 20000).
- `maxStdoutBytes`: 출력이 이 크기를 초과하면 워크플로우를 중단합니다 (기본값: 512000).
- `argsJson`: `lobster run --args-json`에 전달된 JSON 문자열 (워크플로우 파일 전용).

## 출력 봉투

Lobster는 세 가지 상태 중 하나로 JSON 봉투를 반환합니다:

- `ok` → 성공적으로 완료됨
- `needs_approval` → 일시 중지됨; 재개하려면 `requiresApproval.resumeToken`이 필요함
- `cancelled` → 명시적으로 거부 또는 취소됨

도구는 `content` (예쁘게 출력된 JSON)와 `details` (원시 객체) 모두에서 봉투를 표시합니다.

## 승인

`requiresApproval`이 있으면 프롬프트를 검사하고 결정합니다:

- `approve: true` → 재개하고 부작용을 계속합니다
- `approve: false` → 취소하고 워크플로우를 완료합니다

사용자 지정 jq/heredoc 접착 없이 승인 요청에 JSON 미리 보기를 첨부하려면 `approve --preview-from-stdin --limit N`을 사용하십시오. 재개 토큰은 이제 컴팩트합니다. Lobster는 워크플로우 재개 상태를 상태 디렉토리에 저장하고 작은 토큰 키를 다시 전달합니다.

## OpenProse

OpenProse는 Lobster와 잘 짝을 이룹니다. `/prose`를 사용하여 멀티 에이전트 준비를 오케스트레이션하고 결정론적 승인을 위해 Lobster 파이프라인을 실행하십시오. Prose 프로그램이 Lobster를 필요로 하는 경우 `tools.subagents.tools`를 통해 서브 에이전트에 대해 `lobster` 도구를 허용하십시오. [OpenProse](/prose)를 참조하십시오.

## 안전

- **로컬 인프로세스 전용** — 워크플로우는 게이트웨이 프로세스 내에서 실행됩니다. 플러그인 자체에서 네트워크 호출이 없습니다.
- **비밀 없음** — Lobster는 OAuth를 관리하지 않습니다. OpenClaw 도구를 호출합니다.
- **샌드박스 인식** — 도구 컨텍스트가 샌드박스된 경우 비활성화됩니다.
- **강화됨** — 타임아웃과 출력 상한이 내장 실행기에 의해 적용됩니다.

## 문제 해결

- **`lobster timed out`** → `timeoutMs`를 늘리거나 긴 파이프라인을 분할하십시오.
- **`lobster output exceeded maxStdoutBytes`** → `maxStdoutBytes`를 늘리거나 출력 크기를 줄이십시오.
- **`lobster returned invalid JSON`** → 파이프라인이 도구 모드에서 실행되고 JSON만 출력하는지 확인하십시오.
- **`lobster failed`** → 내장 실행기 오류 세부 정보에 대한 게이트웨이 로그를 확인하십시오.

## 더 알아보기

- [플러그인](/tools/plugin)
- [플러그인 도구 작성](/plugins/building-plugins#registering-agent-tools)

## 사례 연구: 커뮤니티 워크플로우

하나의 공개 예시: 세 개의 Markdown 볼트 (개인, 파트너, 공유)를 관리하는 "두 번째 뇌" CLI + Lobster 파이프라인. CLI는 통계, 인박스 목록, 오래된 스캔에 대한 JSON을 내보냅니다. Lobster는 이러한 명령을 각각 승인 게이트가 있는 `weekly-review`, `inbox-triage`, `memory-consolidation`, `shared-task-sync` 같은 워크플로우로 연결합니다. AI는 사용 가능할 때 판단을 처리하고 (분류) 그렇지 않을 때는 결정론적 규칙으로 폴백합니다.

- 스레드: [https://x.com/plattenschieber/status/2014508656335770033](https://x.com/plattenschieber/status/2014508656335770033)
- 레포: [https://github.com/bloomedai/brain-cli](https://github.com/bloomedai/brain-cli)

## 관련 항목

- [자동화 및 작업](/automation) — Lobster 워크플로우 예약
- [자동화 개요](/automation) — 모든 자동화 메커니즘
- [도구 개요](/tools) — 모든 사용 가능한 에이전트 도구
