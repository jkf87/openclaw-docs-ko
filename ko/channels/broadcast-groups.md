---
summary: "WhatsApp 메시지를 여러 에이전트로 broadcast"
read_when:
  - Broadcast group 구성 시
  - WhatsApp에서 다중 에이전트 응답 디버깅 시
status: experimental
title: "Broadcast groups"
---

**상태:** Experimental  
**버전:** 2026.1.9에 추가됨

## 개요

Broadcast Groups는 여러 에이전트가 동일한 메시지를 동시에 처리하고 응답할 수 있게 합니다. 이를 통해 하나의 전화번호를 사용하여 단일 WhatsApp group 또는 DM에서 함께 동작하는 전문 에이전트 팀을 구성할 수 있습니다.

현재 지원 범위: **WhatsApp 전용** (웹 채널).

Broadcast group은 채널 허용 목록과 group 활성화 규칙 이후에 평가됩니다. WhatsApp group에서는 OpenClaw가 일반적으로 응답하는 경우(예: group 설정에 따라 mention 시)에 broadcast가 발생합니다.

## 사용 사례

### 1. 전문 에이전트 팀

원자적이고 집중된 책임을 가진 여러 에이전트를 배포합니다.

```
Group: "Development Team"
Agents:
  - CodeReviewer (reviews code snippets)
  - DocumentationBot (generates docs)
  - SecurityAuditor (checks for vulnerabilities)
  - TestGenerator (suggests test cases)
```

각 에이전트는 동일한 메시지를 처리하고 전문 관점에서 응답을 제공합니다.

### 2. 다국어 지원

```
Group: "International Support"
Agents:
  - Agent_EN (responds in English)
  - Agent_DE (responds in German)
  - Agent_ES (responds in Spanish)
```

### 3. 품질 보증 워크플로우

```
Group: "Customer Support"
Agents:
  - SupportAgent (provides answer)
  - QAAgent (reviews quality, only responds if issues found)
```

### 4. 작업 자동화

```
Group: "Project Management"
Agents:
  - TaskTracker (updates task database)
  - TimeLogger (logs time spent)
  - ReportGenerator (creates summaries)
```

## 구성

### 기본 설정

최상위 `broadcast` 섹션을 추가합니다(`bindings` 옆). 키는 WhatsApp peer id입니다.

- group chat: group JID (예: `120363403215116621@g.us`)
- DM: E.164 전화번호 (예: `+15551234567`)

```json
{
  "broadcast": {
    "120363403215116621@g.us": ["alfred", "baerbel", "assistant3"]
  }
}
```

**결과:** OpenClaw가 이 chat에서 응답할 때, 세 에이전트를 모두 실행합니다.

### 처리 전략

에이전트가 메시지를 처리하는 방식을 제어합니다.

#### Parallel (기본값)

모든 에이전트가 동시에 처리합니다.

```json
{
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": ["alfred", "baerbel"]
  }
}
```

#### Sequential

에이전트가 순서대로 처리합니다(한 에이전트가 이전 에이전트를 기다림).

```json
{
  "broadcast": {
    "strategy": "sequential",
    "120363403215116621@g.us": ["alfred", "baerbel"]
  }
}
```

### 전체 예제

```json
{
  "agents": {
    "list": [
      {
        "id": "code-reviewer",
        "name": "Code Reviewer",
        "workspace": "/path/to/code-reviewer",
        "sandbox": { "mode": "all" }
      },
      {
        "id": "security-auditor",
        "name": "Security Auditor",
        "workspace": "/path/to/security-auditor",
        "sandbox": { "mode": "all" }
      },
      {
        "id": "docs-generator",
        "name": "Documentation Generator",
        "workspace": "/path/to/docs-generator",
        "sandbox": { "mode": "all" }
      }
    ]
  },
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": ["code-reviewer", "security-auditor", "docs-generator"],
    "120363424282127706@g.us": ["support-en", "support-de"],
    "+15555550123": ["assistant", "logger"]
  }
}
```

## 작동 방식

### 메시지 플로우

1. **인바운드 메시지**가 WhatsApp group에 도착합니다.
2. **Broadcast 확인**: 시스템이 peer ID가 `broadcast`에 있는지 확인합니다.
3. **Broadcast 목록에 있으면**:
   - 나열된 모든 에이전트가 메시지를 처리합니다.
   - 각 에이전트는 고유한 세션 키와 격리된 context를 가집니다.
   - 에이전트는 병렬로(기본값) 또는 순차적으로 처리합니다.
4. **Broadcast 목록에 없으면**:
   - 일반 라우팅이 적용됩니다(첫 번째 매칭 바인딩).

참고: broadcast group은 채널 허용 목록이나 group 활성화 규칙(mention/명령어 등)을 우회하지 않습니다. 메시지가 처리 가능한 경우 _어떤 에이전트가 실행되는지_ 만 변경합니다.

### 세션 격리

Broadcast group의 각 에이전트는 다음을 완전히 분리하여 유지합니다.

- **세션 키** (`agent:alfred:whatsapp:group:120363...` vs `agent:baerbel:whatsapp:group:120363...`)
- **대화 히스토리** (에이전트는 다른 에이전트의 메시지를 보지 않음)
- **워크스페이스** (설정된 경우 별도의 샌드박스)
- **도구 접근** (서로 다른 allow/deny 목록)
- **메모리/context** (별도의 IDENTITY.md, SOUL.md 등)
- **Group context 버퍼** (context에 사용되는 최근 group 메시지)는 peer별로 공유되므로, 모든 broadcast 에이전트가 트리거될 때 동일한 context를 봅니다.

이를 통해 각 에이전트는 다음을 가질 수 있습니다.

- 서로 다른 페르소나
- 서로 다른 도구 접근(예: 읽기 전용 vs 읽기-쓰기)
- 서로 다른 모델(예: opus vs sonnet)
- 서로 다른 스킬 설치

### 예제: 격리된 세션

Group `120363403215116621@g.us`에서 에이전트 `["alfred", "baerbel"]`인 경우:

**Alfred의 context:**

```
Session: agent:alfred:whatsapp:group:120363403215116621@g.us
History: [user message, alfred's previous responses]
Workspace: /Users/user/openclaw-alfred/
Tools: read, write, exec
```

**Bärbel의 context:**

```
Session: agent:baerbel:whatsapp:group:120363403215116621@g.us
History: [user message, baerbel's previous responses]
Workspace: /Users/user/openclaw-baerbel/
Tools: read only
```

## 모범 사례

### 1. 에이전트를 집중되게 유지하세요

각 에이전트를 단일하고 명확한 책임으로 설계하세요.

```json
{
  "broadcast": {
    "DEV_GROUP": ["formatter", "linter", "tester"]
  }
}
```

좋음: 각 에이전트가 하나의 역할을 담당  
나쁨: 하나의 범용 "dev-helper" 에이전트

### 2. 설명적인 이름을 사용하세요

각 에이전트가 무엇을 하는지 명확히 하세요.

```json
{
  "agents": {
    "security-scanner": { "name": "Security Scanner" },
    "code-formatter": { "name": "Code Formatter" },
    "test-generator": { "name": "Test Generator" }
  }
}
```

### 3. 도구 접근을 다르게 구성하세요

에이전트에게 필요한 도구만 부여하세요.

```json
{
  "agents": {
    "reviewer": {
      "tools": { "allow": ["read", "exec"] } // Read-only
    },
    "fixer": {
      "tools": { "allow": ["read", "write", "edit", "exec"] } // Read-write
    }
  }
}
```

### 4. 성능을 모니터링하세요

많은 에이전트를 사용할 때 고려할 점:

- 속도를 위해 `"strategy": "parallel"` (기본값) 사용
- Broadcast group을 에이전트 5-10개로 제한
- 간단한 에이전트는 더 빠른 모델 사용

### 5. 실패를 우아하게 처리하세요

에이전트는 독립적으로 실패합니다. 한 에이전트의 오류가 다른 에이전트를 차단하지 않습니다.

```
Message → [Agent A ✓, Agent B ✗ error, Agent C ✓]
Result: Agent A and C respond, Agent B logs error
```

## 호환성

### 프로바이더

Broadcast group은 현재 다음에서 동작합니다.

- WhatsApp (구현됨)
- Telegram (계획됨)
- Discord (계획됨)
- Slack (계획됨)

### 라우팅

Broadcast group은 기존 라우팅과 함께 작동합니다.

```json
{
  "bindings": [
    {
      "match": { "channel": "whatsapp", "peer": { "kind": "group", "id": "GROUP_A" } },
      "agentId": "alfred"
    }
  ],
  "broadcast": {
    "GROUP_B": ["agent1", "agent2"]
  }
}
```

- `GROUP_A`: alfred만 응답(일반 라우팅)
- `GROUP_B`: agent1 AND agent2가 응답(broadcast)

**우선순위:** `broadcast`는 `bindings`보다 우선합니다.

## 문제 해결

### 에이전트가 응답하지 않음

**확인:**

1. Agent ID가 `agents.list`에 존재하는지
2. Peer ID 형식이 올바른지(예: `120363403215116621@g.us`)
3. 에이전트가 deny 목록에 없는지

**디버그:**

```bash
tail -f ~/.openclaw/logs/gateway.log | grep broadcast
```

### 하나의 에이전트만 응답함

**원인:** Peer ID가 `bindings`에는 있지만 `broadcast`에는 없을 수 있습니다.

**해결:** broadcast 구성에 추가하거나 bindings에서 제거하세요.

### 성능 문제

**에이전트가 많아 느린 경우:**

- Group당 에이전트 수를 줄이세요.
- 더 가벼운 모델(opus 대신 sonnet)을 사용하세요.
- 샌드박스 시작 시간을 확인하세요.

## 예제

### 예제 1: 코드 리뷰 팀

```json
{
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": [
      "code-formatter",
      "security-scanner",
      "test-coverage",
      "docs-checker"
    ]
  },
  "agents": {
    "list": [
      {
        "id": "code-formatter",
        "workspace": "~/agents/formatter",
        "tools": { "allow": ["read", "write"] }
      },
      {
        "id": "security-scanner",
        "workspace": "~/agents/security",
        "tools": { "allow": ["read", "exec"] }
      },
      {
        "id": "test-coverage",
        "workspace": "~/agents/testing",
        "tools": { "allow": ["read", "exec"] }
      },
      { "id": "docs-checker", "workspace": "~/agents/docs", "tools": { "allow": ["read"] } }
    ]
  }
}
```

**사용자 전송:** 코드 스니펫  
**응답:**

- code-formatter: "Fixed indentation and added type hints"
- security-scanner: "⚠️ SQL injection vulnerability in line 12"
- test-coverage: "Coverage is 45%, missing tests for error cases"
- docs-checker: "Missing docstring for function `process_data`"

### 예제 2: 다국어 지원

```json
{
  "broadcast": {
    "strategy": "sequential",
    "+15555550123": ["detect-language", "translator-en", "translator-de"]
  },
  "agents": {
    "list": [
      { "id": "detect-language", "workspace": "~/agents/lang-detect" },
      { "id": "translator-en", "workspace": "~/agents/translate-en" },
      { "id": "translator-de", "workspace": "~/agents/translate-de" }
    ]
  }
}
```

## API 참조

### 구성 스키마

```typescript
interface OpenClawConfig {
  broadcast?: {
    strategy?: "parallel" | "sequential";
    [peerId: string]: string[];
  };
}
```

### 필드

- `strategy` (선택): 에이전트 처리 방식
  - `"parallel"` (기본값): 모든 에이전트가 동시에 처리
  - `"sequential"`: 에이전트가 배열 순서대로 처리
- `[peerId]`: WhatsApp group JID, E.164 번호, 또는 기타 peer ID
  - 값: 메시지를 처리할 agent ID의 배열

## 제한 사항

1. **최대 에이전트 수:** 하드 제한은 없지만, 10개 이상이면 느릴 수 있음
2. **공유 context:** 에이전트는 서로의 응답을 보지 않음(설계상)
3. **메시지 순서:** 병렬 응답은 임의의 순서로 도착할 수 있음
4. **속도 제한:** 모든 에이전트가 WhatsApp 속도 제한에 반영됨

## 향후 개선 사항

계획된 기능:

- [ ] 공유 context 모드(에이전트가 서로의 응답을 봄)
- [ ] 에이전트 조정(에이전트가 서로 신호 가능)
- [ ] 동적 에이전트 선택(메시지 내용에 따라 에이전트 선택)
- [ ] 에이전트 우선순위(일부 에이전트가 먼저 응답)

## 관련 문서

- [Groups](/channels/groups)
- [채널 라우팅](/channels/channel-routing)
- [페어링](/channels/pairing)
- [다중 에이전트 샌드박스 도구](/tools/multi-agent-sandbox-tools)
- [세션 관리](/concepts/session)
