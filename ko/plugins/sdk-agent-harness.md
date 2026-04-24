---
summary: "저수준 임베디드 agent executor를 대체하는 플러그인을 위한 실험적 SDK 표면"
title: "Agent harness 플러그인"
sidebarTitle: "Agent Harness"
read_when:
  - 임베디드 agent 런타임 또는 harness 레지스트리를 변경하고 있을 때
  - 번들되거나 신뢰된 플러그인에서 agent harness를 등록하고 있을 때
  - Codex 플러그인이 모델 provider와 어떻게 관련되는지 이해해야 할 때
---

**Agent harness**는 준비된 하나의 OpenClaw agent turn에 대한 저수준 executor입니다. 모델 provider도, 채널도, 도구 레지스트리도 아닙니다.

이 표면은 번들되거나 신뢰된 네이티브 플러그인에만 사용하십시오. 파라미터 타입이 현재 임베디드 러너를 의도적으로 반영하므로 계약은 여전히 실험적입니다.

## 언제 harness를 사용하는가

모델 패밀리가 자체 네이티브 세션 런타임을 가지고 있고 일반 OpenClaw provider transport가 잘못된 추상화일 때 agent harness를 등록하십시오.

예시:

- 스레드와 compaction을 소유하는 네이티브 coding-agent 서버
- 네이티브 plan/reasoning/tool 이벤트를 스트리밍해야 하는 로컬 CLI 또는 데몬
- OpenClaw 세션 트랜스크립트 외에 자체 resume id가 필요한 모델 런타임

새로운 LLM API를 추가하기 위해서만 harness를 등록하지 **마십시오**. 일반 HTTP 또는 WebSocket 모델 API의 경우, [provider 플러그인](/plugins/sdk-provider-plugins)을 빌드하십시오.

## 코어가 여전히 소유하는 것

harness가 선택되기 전에 OpenClaw는 이미 다음을 해결했습니다:

- provider와 모델
- 런타임 auth 상태
- thinking 레벨과 컨텍스트 예산
- OpenClaw 트랜스크립트/세션 파일
- workspace, sandbox, 도구 정책
- 채널 reply 콜백과 스트리밍 콜백
- 모델 fallback과 라이브 모델 전환 정책

이 분리는 의도적입니다. harness는 준비된 시도(attempt)를 실행합니다; provider를 선택하거나, 채널 delivery를 대체하거나, 모델을 조용히 전환하지 않습니다.

## harness 등록

**임포트:** `openclaw/plugin-sdk/agent-harness`

```typescript
import type { AgentHarness } from "openclaw/plugin-sdk/agent-harness";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

const myHarness: AgentHarness = {
  id: "my-harness",
  label: "My native agent harness",

  supports(ctx) {
    return ctx.provider === "my-provider"
      ? { supported: true, priority: 100 }
      : { supported: false };
  },

  async runAttempt(params) {
    // Start or resume your native thread.
    // Use params.prompt, params.tools, params.images, params.onPartialReply,
    // params.onAgentEvent, and the other prepared attempt fields.
    return await runMyNativeTurn(params);
  },
};

export default definePluginEntry({
  id: "my-native-agent",
  name: "My Native Agent",
  description: "Runs selected models through a native agent daemon.",
  register(api) {
    api.registerAgentHarness(myHarness);
  },
});
```

## 선택 정책

OpenClaw는 provider/model 해결 후 harness를 선택합니다:

1. 기존 세션에 기록된 harness id가 우선합니다. config/env 변경이 해당 트랜스크립트를 다른 런타임으로 hot-switch하지 않도록 합니다.
2. `OPENCLAW_AGENT_RUNTIME=<id>`는 아직 고정되지 않은 세션에 대해 해당 id로 등록된 harness를 강제합니다.
3. `OPENCLAW_AGENT_RUNTIME=pi`는 내장된 PI harness를 강제합니다.
4. `OPENCLAW_AGENT_RUNTIME=auto`는 등록된 harness에 해결된 provider/model을 지원하는지 묻습니다.
5. 일치하는 등록된 harness가 없으면, PI fallback이 비활성화되지 않은 한 OpenClaw는 PI를 사용합니다.

플러그인 harness 실패는 실행 실패로 표면화됩니다. `auto` 모드에서는 등록된 플러그인 harness가 해결된 provider/model을 지원하지 않을 때만 PI fallback이 사용됩니다. 플러그인 harness가 실행을 claim하면, OpenClaw는 auth/runtime 시맨틱을 변경하거나 사이드 이펙트를 중복시킬 수 있기 때문에 동일한 turn을 PI를 통해 replay하지 않습니다.

선택된 harness id는 임베디드 실행 후 세션 id와 함께 지속됩니다. harness pin 이전에 생성된 레거시 세션은 트랜스크립트 기록이 있으면 PI-pinned로 취급됩니다. PI와 네이티브 플러그인 harness 사이를 전환할 때는 새로운/리셋된 세션을 사용하십시오. `/status`는 `codex`와 같은 기본값이 아닌 harness id를 `Fast` 옆에 표시합니다; PI는 기본 호환성 경로이므로 숨겨진 상태로 유지됩니다. 선택된 harness가 예상치 못한 것이라면, `agents/harness` 디버그 로깅을 활성화하고 gateway의 구조화된 `agent harness selected` 레코드를 검사하십시오. 선택된 harness id, 선택 이유, runtime/fallback 정책, 그리고 `auto` 모드에서는 각 플러그인 후보의 지원 결과를 포함합니다.

번들된 Codex 플러그인은 harness id로 `codex`를 등록합니다. 코어는 이를 일반 플러그인 harness id로 취급합니다; Codex 전용 별칭은 공유 런타임 선택자가 아닌 플러그인 또는 운영자 config에 속합니다.

## Provider와 harness 페어링

대부분의 harness는 provider도 등록해야 합니다. provider는 모델 ref, auth 상태, 모델 메타데이터, 그리고 `/model` 선택을 OpenClaw의 나머지 부분에서 볼 수 있게 만듭니다. 그런 다음 harness는 `supports(...)`에서 해당 provider를 claim합니다.

번들된 Codex 플러그인은 이 패턴을 따릅니다:

- provider id: `codex`
- 사용자 모델 ref: `openai/gpt-5.5`에 `embeddedHarness.runtime: "codex"` 추가; 레거시 `codex/gpt-*` ref는 호환성을 위해 허용된 상태로 남아있습니다
- harness id: `codex`
- auth: 합성(synthetic) provider 가용성. Codex harness가 네이티브 Codex 로그인/세션을 소유하기 때문입니다
- app-server 요청: OpenClaw는 bare 모델 id를 Codex로 보내고 harness가 네이티브 app-server 프로토콜과 통신하도록 합니다

Codex 플러그인은 additive입니다. 일반 `openai/gpt-*` ref는 `embeddedHarness.runtime: "codex"`로 Codex harness를 강제하지 않는 한 일반 OpenClaw provider 경로를 계속 사용합니다. 더 오래된 `codex/gpt-*` ref도 호환성을 위해 여전히 Codex provider와 harness를 선택합니다.

운영자 setup, 모델 prefix 예시, Codex 전용 config는 [Codex Harness](/plugins/codex-harness)를 참조하십시오.

OpenClaw는 Codex app-server `0.118.0` 이상을 요구합니다. Codex 플러그인은 app-server initialize 핸드셰이크를 확인하고 더 오래되거나 버전이 없는 서버를 차단하여 OpenClaw가 테스트된 프로토콜 표면에서만 실행되도록 합니다.

### Codex app-server tool-result 미들웨어

번들된 플러그인은 manifest가 `contracts.embeddedExtensionFactories: ["codex-app-server"]`를 선언할 때 `api.registerCodexAppServerExtensionFactory(...)`를 통해 Codex app-server 전용 `tool_result` 미들웨어를 연결할 수도 있습니다. 이는 tool 출력이 OpenClaw 트랜스크립트로 투영되기 전에 네이티브 Codex harness 내부에서 실행되어야 하는 비동기 tool-result 변환을 위한 신뢰된 플러그인 이음새입니다.

### 네이티브 Codex harness 모드

번들된 `codex` harness는 임베디드 OpenClaw agent turn을 위한 네이티브 Codex 모드입니다. 먼저 번들된 `codex` 플러그인을 활성화하고, config에서 제한적인 allowlist를 사용한다면 `plugins.allow`에 `codex`를 포함하십시오. 네이티브 app-server config는 `openai/gpt-*`와 `embeddedHarness.runtime: "codex"`를 사용해야 합니다. PI를 통한 Codex OAuth에는 대신 `openai-codex/*`를 사용하십시오. 레거시 `codex/*` 모델 ref는 네이티브 harness를 위한 호환성 별칭으로 남아있습니다.

이 모드가 실행될 때, Codex는 네이티브 thread id, resume 동작, compaction, app-server 실행을 소유합니다. OpenClaw는 여전히 채팅 채널, 가시적 트랜스크립트 mirror, 도구 정책, 승인, 미디어 delivery, 세션 선택을 소유합니다. Codex app-server 경로만이 실행을 claim할 수 있다는 것을 증명해야 할 때 `embeddedHarness.runtime: "codex"`와 `embeddedHarness.fallback: "none"`을 사용하십시오. 해당 config는 선택 가드일 뿐입니다: Codex app-server 실패는 PI를 통해 재시도하지 않고 이미 직접 실패합니다.

## PI fallback 비활성화

기본적으로 OpenClaw는 `agents.defaults.embeddedHarness`가 `{ runtime: "auto", fallback: "pi" }`로 설정된 상태에서 임베디드 agent를 실행합니다. `auto` 모드에서 등록된 플러그인 harness는 provider/model 쌍을 claim할 수 있습니다. 일치하지 않으면, OpenClaw는 PI로 fallback합니다.

누락된 플러그인 harness 선택이 PI를 사용하는 대신 실패하도록 할 때는 `fallback: "none"`을 설정하십시오. 선택된 플러그인 harness 실패는 이미 hard하게 실패합니다. 이는 명시적인 `runtime: "pi"` 또는 `OPENCLAW_AGENT_RUNTIME=pi`를 차단하지 않습니다.

Codex 전용 임베디드 실행을 위해:

```json
{
  "agents": {
    "defaults": {
      "model": "openai/gpt-5.5",
      "embeddedHarness": {
        "runtime": "codex",
        "fallback": "none"
      }
    }
  }
}
```

등록된 플러그인 harness가 일치하는 모델을 claim하게 하되 OpenClaw가 조용히 PI로 fallback하는 것을 원하지 않는다면, `runtime: "auto"`를 유지하고 fallback을 비활성화하십시오:

```json
{
  "agents": {
    "defaults": {
      "embeddedHarness": {
        "runtime": "auto",
        "fallback": "none"
      }
    }
  }
}
```

Agent별 오버라이드는 동일한 모양을 사용합니다:

```json
{
  "agents": {
    "defaults": {
      "embeddedHarness": {
        "runtime": "auto",
        "fallback": "pi"
      }
    },
    "list": [
      {
        "id": "codex-only",
        "model": "openai/gpt-5.5",
        "embeddedHarness": {
          "runtime": "codex",
          "fallback": "none"
        }
      }
    ]
  }
}
```

`OPENCLAW_AGENT_RUNTIME`은 여전히 구성된 런타임을 오버라이드합니다. 환경에서 PI fallback을 비활성화하려면 `OPENCLAW_AGENT_HARNESS_FALLBACK=none`을 사용하십시오.

```bash
OPENCLAW_AGENT_RUNTIME=codex \
OPENCLAW_AGENT_HARNESS_FALLBACK=none \
openclaw gateway run
```

fallback이 비활성화된 상태에서, 요청된 harness가 등록되지 않았거나, 해결된 provider/model을 지원하지 않거나, turn 사이드 이펙트를 생성하기 전에 실패하면 세션이 일찍 실패합니다. 이는 Codex 전용 배포와 Codex app-server 경로가 실제로 사용되고 있음을 증명해야 하는 라이브 테스트에 의도적입니다.

이 설정은 임베디드 agent harness만 제어합니다. 이미지, 비디오, 음악, TTS, PDF, 기타 provider 전용 모델 라우팅을 비활성화하지 않습니다.

## 네이티브 세션과 트랜스크립트 mirror

harness는 네이티브 세션 id, thread id, 또는 daemon-side resume 토큰을 유지할 수 있습니다. 해당 바인딩을 OpenClaw 세션과 명시적으로 연결된 상태로 유지하고, 사용자에게 보이는 assistant/tool 출력을 OpenClaw 트랜스크립트로 계속 mirror하십시오.

OpenClaw 트랜스크립트는 다음을 위한 호환성 레이어로 남습니다:

- 채널에 보이는 세션 기록
- 트랜스크립트 검색 및 인덱싱
- 이후 turn에서 내장된 PI harness로 다시 전환
- 일반 `/new`, `/reset`, 세션 삭제 동작

harness가 sidecar 바인딩을 저장한다면, 소유한 OpenClaw 세션이 리셋될 때 OpenClaw가 이를 정리할 수 있도록 `reset(...)`을 구현하십시오.

## Tool 및 미디어 결과

코어는 OpenClaw tool 목록을 구성하여 준비된 시도로 전달합니다. harness가 동적 tool 호출을 실행할 때, 채널 미디어를 직접 보내는 대신 tool 결과를 harness 결과 모양으로 다시 반환하십시오.

이는 텍스트, 이미지, 비디오, 음악, TTS, 승인, messaging-tool 출력을 PI-backed 실행과 동일한 delivery 경로에 유지합니다.

## 현재 제한 사항

- 공개 임포트 경로는 범용적이지만, 일부 attempt/result 타입 별칭은 호환성을 위해 여전히 `Pi` 이름을 가지고 있습니다.
- 서드파티 harness 설치는 실험적입니다. 네이티브 세션 런타임이 필요할 때까지 provider 플러그인을 선호하십시오.
- Harness 전환은 turn 사이에서 지원됩니다. 네이티브 tool, 승인, assistant 텍스트, 또는 메시지 전송이 시작된 후 turn 중간에 harness를 전환하지 마십시오.

## 관련 문서

- [SDK 개요](/plugins/sdk-overview)
- [런타임 헬퍼](/plugins/sdk-runtime)
- [프로바이더 플러그인](/plugins/sdk-provider-plugins)
- [Codex Harness](/plugins/codex-harness)
- [모델 프로바이더](/concepts/model-providers)
