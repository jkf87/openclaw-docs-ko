---
summary: "에이전트별 샌드박스 + 도구 제한, 우선순위 및 예시"
read_when:
  - You want per-agent sandboxing or per-agent tool allow/deny policies in a multi-agent gateway.
status: active
title: "멀티 에이전트 샌드박스 및 도구"
---

# 멀티 에이전트 샌드박스 및 도구 구성

멀티 에이전트 설정의 각 에이전트는 전역 샌드박스 및 도구 정책을 재정의할 수 있습니다. 이 페이지는 에이전트별 구성, 우선순위 규칙 및 예시를 다룹니다.

- **샌드박스 백엔드 및 모드**: [샌드박싱](/gateway/sandboxing)을 참조하십시오.
- **차단된 도구 디버깅**: [샌드박스 vs 도구 정책 vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated)와 `openclaw sandbox explain`을 참조하십시오.
- **Elevated exec**: [Elevated 모드](/tools/elevated)를 참조하십시오.

인증은 에이전트별입니다: 각 에이전트는 `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`에서 자체 `agentDir` 인증 스토어에서 읽습니다.
자격 증명은 에이전트 간에 **공유되지 않습니다**. 에이전트 간에 `agentDir`을 재사용하지 마십시오.
자격 증명을 공유하려면 다른 에이전트의 `agentDir`로 `auth-profiles.json`을 복사하십시오.

## 구성 예시

### 예시 1: 개인 + 제한된 가족 에이전트

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "Personal Assistant",
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "family",
        "name": "Family Bot",
        "workspace": "~/.openclaw/workspace-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch", "process", "browser"]
        }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "family",
      "match": {
        "provider": "whatsapp",
        "accountId": "*",
        "peer": {
          "kind": "group",
          "id": "120363424282127706@g.us"
        }
      }
    }
  ]
}
```

**결과:**
- `main` 에이전트: 호스트에서 실행, 전체 도구 액세스
- `family` 에이전트: Docker에서 실행 (에이전트당 하나의 컨테이너), `read` 도구만

### 예시 2: 공유 샌드박스가 있는 업무 에이전트

```json
{
  "agents": {
    "list": [
      {
        "id": "personal",
        "workspace": "~/.openclaw/workspace-personal",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "work",
        "workspace": "~/.openclaw/workspace-work",
        "sandbox": {
          "mode": "all",
          "scope": "shared",
          "workspaceRoot": "/tmp/work-sandboxes"
        },
        "tools": {
          "allow": ["read", "write", "apply_patch", "exec"],
          "deny": ["browser", "gateway", "discord"]
        }
      }
    ]
  }
}
```

### 예시 2b: 전역 코딩 프로파일 + 메시징 전용 에이전트

```json
{
  "tools": { "profile": "coding" },
  "agents": {
    "list": [
      {
        "id": "support",
        "tools": { "profile": "messaging", "allow": ["slack"] }
      }
    ]
  }
}
```

**결과:**
- 기본 에이전트는 코딩 도구를 받습니다
- `support` 에이전트는 메시징 전용 (+ Slack 도구)

### 예시 3: 에이전트별 다른 샌드박스 모드

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",
        "scope": "session"
      }
    },
    "list": [
      {
        "id": "main",
        "default": true,
        "sandbox": { "mode": "off" }
      },
      {
        "id": "coder",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        }
      }
    ]
  }
}
```

## 우선순위 규칙

### 샌드박스 구성

에이전트별 구성은 기본값을 재정의합니다:

```
agents.list[].sandbox.mode > agents.defaults.sandbox.mode
agents.list[].sandbox.scope > agents.defaults.sandbox.scope
agents.list[].sandbox.workspaceRoot > agents.defaults.sandbox.workspaceRoot
agents.list[].sandbox.workspaceAccess > agents.defaults.sandbox.workspaceAccess
agents.list[].sandbox.docker.* > agents.defaults.sandbox.docker.*
agents.list[].sandbox.browser.* > agents.defaults.sandbox.browser.*
agents.list[].sandbox.prune.* > agents.defaults.sandbox.prune.*
```

**참고:**
- `agents.list[].sandbox.{docker,browser,prune}.*`는 해당 에이전트에 대해 `agents.defaults.sandbox.{docker,browser,prune}.*`를 재정의합니다 (샌드박스 범위가 `"shared"`로 해결되는 경우 무시됨).

### 도구 제한

필터링 순서는 다음과 같습니다:

1. **도구 프로파일** (`tools.profile` 또는 `agents.list[].tools.profile`)
2. **프로바이더 도구 프로파일** (`tools.byProvider[provider].profile` 또는 `agents.list[].tools.byProvider[provider].profile`)
3. **전역 도구 정책** (`tools.allow` / `tools.deny`)
4. **프로바이더 도구 정책** (`tools.byProvider[provider].allow/deny`)
5. **에이전트별 도구 정책** (`agents.list[].tools.allow/deny`)
6. **에이전트 프로바이더 정책** (`agents.list[].tools.byProvider[provider].allow/deny`)
7. **샌드박스 도구 정책** (`tools.sandbox.tools` 또는 `agents.list[].tools.sandbox.tools`)
8. **서브에이전트 도구 정책** (`tools.subagents.tools`, 해당하는 경우)

각 레벨은 도구를 더 제한할 수 있지만 이전 레벨에서 거부된 도구를 다시 부여할 수 없습니다.

`agents.list[].tools.sandbox.tools`가 설정된 경우 해당 에이전트에 대해 `tools.sandbox.tools`를 대체합니다.
`agents.list[].tools.profile`이 설정된 경우 해당 에이전트에 대해 `tools.profile`을 재정의합니다.

프로바이더 도구 키는 `provider`(예: `google-antigravity`) 또는 `provider/model`(예: `openai/gpt-5.4`) 중 하나를 허용합니다.

도구 정책은 여러 도구로 확장되는 `group:*` 단축키를 지원합니다. 전체 목록은 [도구 그룹](/gateway/sandbox-vs-tool-policy-vs-elevated#tool-groups-shorthands)을 참조하십시오.

에이전트별 elevated 재정의 (`agents.list[].tools.elevated`)는 특정 에이전트에 대한 elevated exec를 더 제한할 수 있습니다. 자세한 내용은 [Elevated 모드](/tools/elevated)를 참조하십시오.

## 단일 에이전트에서 마이그레이션

**이전 (단일 에이전트):**

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "sandbox": {
        "mode": "non-main"
      }
    }
  },
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["read", "write", "apply_patch", "exec"],
        "deny": []
      }
    }
  }
}
```

**이후 (다른 프로파일을 가진 멀티 에이전트):**

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      }
    ]
  }
}
```

레거시 `agent.*` 구성은 `openclaw doctor`에 의해 마이그레이션됩니다; 앞으로는 `agents.defaults` + `agents.list`를 선호하십시오.

## 도구 제한 예시

### 읽기 전용 에이전트

```json
{
  "tools": {
    "allow": ["read"],
    "deny": ["exec", "write", "edit", "apply_patch", "process"]
  }
}
```

### 안전 실행 에이전트 (파일 수정 없음)

```json
{
  "tools": {
    "allow": ["read", "exec", "process"],
    "deny": ["write", "edit", "apply_patch", "browser", "gateway"]
  }
}
```

### 커뮤니케이션 전용 에이전트

```json
{
  "tools": {
    "sessions": { "visibility": "tree" },
    "allow": ["sessions_list", "sessions_send", "sessions_history", "session_status"],
    "deny": ["exec", "write", "edit", "apply_patch", "read", "browser"]
  }
}
```

이 프로파일의 `sessions_history`는 여전히 원시 트랜스크립트 덤프가 아닌 제한적이고 정제된 리콜 보기를 반환합니다. 어시스턴트 리콜은 사고 태그, `<relevant-memories>` 스캐폴딩, 평문 텍스트 도구 호출 XML 페이로드 (`<tool_call>...</tool_call>`, `<function_call>...</function_call>`, `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>`, 및 잘린 도구 호출 블록), 다운그레이드된 도구 호출 스캐폴딩, 누출된 ASCII/전각 모델 제어 토큰, 잘못된 형식의 MiniMax 도구 호출 XML을 편집/잘라내기 전에 제거합니다.

## 일반적인 함정: "non-main"

`agents.defaults.sandbox.mode: "non-main"`은 에이전트 id가 아닌 `session.mainKey`(기본값 `"main"`)를 기반으로 합니다. 그룹/채널 세션은 항상 자체 키를 가지므로 non-main으로 취급되어 샌드박스화됩니다. 에이전트가 절대 샌드박스화되지 않도록 하려면 `agents.list[].sandbox.mode: "off"`를 설정하십시오.

## 테스트

멀티 에이전트 샌드박스 및 도구를 구성한 후:

1. **에이전트 해결 확인:**
   ```exec
   openclaw agents list --bindings
   ```
2. **샌드박스 컨테이너 확인:**
   ```exec
   docker ps --filter "name=openclaw-sbx-"
   ```
3. **도구 제한 테스트:**
   - 제한된 도구가 필요한 메시지 전송
   - 에이전트가 거부된 도구를 사용할 수 없는지 확인
4. **로그 모니터링:**
   ```exec
   tail -f "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}/logs/gateway.log" | grep -E "routing|sandbox|tools"
   ```

## 문제 해결

### `mode: "all"` 설정에도 불구하고 에이전트가 샌드박스화되지 않는 경우

- 이를 재정의하는 전역 `agents.defaults.sandbox.mode`가 있는지 확인
- 에이전트별 구성이 우선하므로 `agents.list[].sandbox.mode: "all"` 설정

### 거부 목록에도 불구하고 도구가 여전히 사용 가능한 경우

- 도구 필터링 순서 확인: 전역 → 에이전트 → 샌드박스 → 서브에이전트
- 각 레벨은 더 제한할 수만 있고 다시 부여할 수 없습니다
- 로그로 확인: `[tools] filtering tools for agent:${agentId}`

### 에이전트별로 컨테이너가 격리되지 않는 경우

- 에이전트별 샌드박스 구성에서 `scope: "agent"` 설정
- 기본값은 세션당 하나의 컨테이너를 생성하는 `"session"`입니다

## 참조

- [샌드박싱](/gateway/sandboxing) -- 전체 샌드박스 레퍼런스 (모드, 범위, 백엔드, 이미지)
- [샌드박스 vs 도구 정책 vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated) -- "왜 차단되었나요?" 디버깅
- [Elevated 모드](/tools/elevated)
