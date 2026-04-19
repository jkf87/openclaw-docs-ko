---
summary: "OpenClaw 에이전트 하네스 플러그인 SDK: 등록, 선택 정책, 전사 미러, PI 폴백 비활성화"
read_when:
  - 네이티브 세션 런타임용 에이전트 하네스를 구현하려는 경우
  - `embeddedHarness.runtime`/`fallback` 동작과 폴백 규칙이 궁금한 경우
title: "에이전트 하네스 플러그인"
---

# Agent Harness Plugins

**에이전트 하네스**는 준비된 하나의 OpenClaw 에이전트 턴에 대한 저수준 실행기입니다. 모델 제공자도, 채널도, 도구 레지스트리도 아닙니다.

이 서페이스는 번들된 또는 신뢰할 수 있는 네이티브 플러그인에만 사용하세요. 매개변수 타입이 현재 임베디드 러너를 의도적으로 반영하고 있어 계약은 여전히 실험적입니다.

## 하네스를 언제 사용하는가

모델 패밀리가 자체 네이티브 세션 런타임을 가지고 있고, 일반 OpenClaw 제공자 전송이 잘못된 추상화일 때 에이전트 하네스를 등록하세요.

예시:

- 스레드와 컴팩션을 소유하는 네이티브 코딩 에이전트 서버
- 네이티브 plan/reasoning/tool 이벤트를 스트리밍해야 하는 로컬 CLI 또는 데몬
- OpenClaw 세션 전사 외에 자체 resume id가 필요한 모델 런타임

새 LLM API를 추가하기 위해서는 하네스를 등록하지 **마세요**. 일반 HTTP 또는 WebSocket 모델 API는 [제공자 플러그인](/plugins/sdk-provider-plugins)을 빌드하세요.

## 코어가 여전히 소유하는 것

하네스가 선택되기 전에, OpenClaw는 이미 다음을 해석해둔 상태입니다:

- 제공자와 모델
- 런타임 인증 상태
- 사고 수준과 컨텍스트 예산
- OpenClaw 전사/세션 파일
- 워크스페이스, 샌드박스, 도구 정책
- 채널 응답 콜백과 스트리밍 콜백
- 모델 폴백과 라이브 모델 전환 정책

이 분리는 의도적입니다. 하네스는 준비된 시도를 실행합니다. 제공자를 고르거나, 채널 전달을 대체하거나, 조용히 모델을 전환하지 않습니다.

## 하네스 등록

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
    // 네이티브 스레드를 시작하거나 재개합니다.
    // params.prompt, params.tools, params.images, params.onPartialReply,
    // params.onAgentEvent 및 기타 준비된 시도 필드를 사용하세요.
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

OpenClaw는 제공자/모델 해석 후 하네스를 선택합니다:

1. `OPENCLAW_AGENT_RUNTIME=<id>`는 해당 id를 가진 등록된 하네스를 강제합니다.
2. `OPENCLAW_AGENT_RUNTIME=pi`는 내장 PI 하네스를 강제합니다.
3. `OPENCLAW_AGENT_RUNTIME=auto`는 등록된 하네스들에게 해석된 제공자/모델을 지원하는지 묻습니다.
4. 일치하는 등록된 하네스가 없으면, PI 폴백이 비활성화된 경우가 아닌 한 OpenClaw는 PI를 사용합니다.

강제된 플러그인 하네스 실패는 실행 실패로 노출됩니다. `auto` 모드에서는 선택된 플러그인 하네스가 부작용을 일으키기 전에 실패하면 OpenClaw가 PI로 폴백할 수 있습니다. 그 폴백을 하드 실패로 만들려면 `OPENCLAW_AGENT_HARNESS_FALLBACK=none` 또는 `embeddedHarness.fallback: "none"`으로 설정하세요.

번들 Codex 플러그인은 `codex`를 자신의 하네스 id로 등록합니다. 코어는 이를 일반 플러그인 하네스 id로 취급합니다. Codex 전용 별칭은 플러그인이나 운영자 설정에 속하지, 공유 런타임 셀렉터에 들어가지 않습니다.

## 제공자와 하네스 페어링

대부분의 하네스는 제공자도 함께 등록해야 합니다. 제공자는 모델 참조, 인증 상태, 모델 메타데이터, `/model` 선택을 OpenClaw의 나머지 부분에 노출합니다. 그런 다음 하네스가 `supports(...)`에서 해당 제공자를 주장합니다.

번들 Codex 플러그인은 이 패턴을 따릅니다:

- 제공자 id: `codex`
- 사용자 모델 참조: `codex/gpt-5.4`, `codex/gpt-5.2` 또는 Codex 앱 서버가 반환하는 다른 모델
- 하네스 id: `codex`
- 인증: Codex 하네스가 네이티브 Codex 로그인/세션을 소유하므로 합성(synthetic) 제공자 가용성
- 앱 서버 요청: OpenClaw가 Codex에 순수 모델 id를 보내고, 하네스가 네이티브 앱 서버 프로토콜과 통신하게 합니다.

Codex 플러그인은 추가(additive) 방식입니다. 평범한 `openai/gpt-*` 참조는 OpenAI 제공자 참조로 남아 일반 OpenClaw 제공자 경로를 계속 사용합니다. Codex 관리 인증, Codex 모델 탐색, 네이티브 스레드, Codex 앱 서버 실행을 원할 때 `codex/gpt-*`를 선택하세요. `/model`은 OpenAI 제공자 자격 증명 없이도 Codex 앱 서버가 반환하는 Codex 모델 중에서 전환할 수 있습니다.

운영자 설정, 모델 접두사 예시, Codex 전용 설정은 [Codex Harness](/plugins/codex-harness)를 참조하세요.

OpenClaw는 Codex 앱 서버 `0.118.0` 이상을 요구합니다. Codex 플러그인은 앱 서버의 initialize 핸드셰이크를 확인하고, OpenClaw가 테스트된 프로토콜 서페이스에서만 실행되도록 구버전 또는 버전 없는 서버를 차단합니다.

### 네이티브 Codex 하네스 모드

번들 `codex` 하네스는 임베디드 OpenClaw 에이전트 턴을 위한 네이티브 Codex 모드입니다. 먼저 번들 `codex` 플러그인을 활성화하고, 제한된 allowlist를 사용하는 설정이라면 `plugins.allow`에 `codex`를 포함하세요. `openai-codex/*`와는 다릅니다:

- `openai-codex/*`는 일반 OpenClaw 제공자 경로를 통해 ChatGPT/Codex OAuth를 사용합니다.
- `codex/*`는 번들 Codex 제공자를 사용하고 턴을 Codex 앱 서버를 통해 라우팅합니다.

이 모드가 실행되면 Codex가 네이티브 스레드 id, 재개 동작, 컴팩션, 앱 서버 실행을 소유합니다. OpenClaw는 여전히 채팅 채널, 가시 전사 미러, 도구 정책, 승인, 미디어 전달, 세션 선택을 소유합니다. Codex 앱 서버 경로가 실제로 사용되고 PI 폴백이 망가진 네이티브 하네스를 감추지 않음을 증명해야 할 때 `embeddedHarness.runtime: "codex"`와 `embeddedHarness.fallback: "none"`을 사용하세요.

## PI 폴백 비활성화

기본적으로 OpenClaw는 임베디드 에이전트를 `agents.defaults.embeddedHarness`가 `{ runtime: "auto", fallback: "pi" }`로 설정된 상태로 실행합니다. `auto` 모드에서 등록된 플러그인 하네스가 제공자/모델 쌍을 주장할 수 있습니다. 일치하는 것이 없거나, 자동 선택된 플러그인 하네스가 출력 생성 전에 실패하면 OpenClaw는 PI로 폴백합니다.

플러그인 하네스가 실제로 실행되는 유일한 런타임임을 증명해야 할 때 `fallback: "none"`으로 설정하세요. 이는 자동 PI 폴백을 비활성화하며, 명시적 `runtime: "pi"`나 `OPENCLAW_AGENT_RUNTIME=pi`는 차단하지 않습니다.

Codex 전용 임베디드 실행:

```json
{
  "agents": {
    "defaults": {
      "model": "codex/gpt-5.4",
      "embeddedHarness": {
        "runtime": "codex",
        "fallback": "none"
      }
    }
  }
}
```

일치하는 모델이 있으면 어떤 등록된 플러그인 하네스든 주장할 수 있게 하되, OpenClaw가 조용히 PI로 폴백하는 일이 없도록 하려면 `runtime: "auto"`를 유지하고 폴백을 비활성화하세요:

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

에이전트별 오버라이드는 동일한 형태를 사용합니다:

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
        "model": "codex/gpt-5.4",
        "embeddedHarness": {
          "runtime": "codex",
          "fallback": "none"
        }
      }
    ]
  }
}
```

`OPENCLAW_AGENT_RUNTIME`은 여전히 설정된 런타임을 오버라이드합니다. 환경에서 PI 폴백을 비활성화하려면 `OPENCLAW_AGENT_HARNESS_FALLBACK=none`을 사용하세요.

```bash
OPENCLAW_AGENT_RUNTIME=codex \
OPENCLAW_AGENT_HARNESS_FALLBACK=none \
openclaw gateway run
```

폴백이 비활성화된 상태에서는, 요청된 하네스가 등록되지 않았거나, 해석된 제공자/모델을 지원하지 않거나, 턴 부작용 생성 전에 실패하면 세션이 조기에 실패합니다. 이는 Codex 전용 배포와, Codex 앱 서버 경로가 실제로 사용 중임을 증명해야 하는 라이브 테스트에 의도적인 동작입니다.

이 설정은 임베디드 에이전트 하네스만 제어합니다. 이미지, 동영상, 음악, TTS, PDF 또는 기타 제공자별 모델 라우팅은 비활성화하지 않습니다.

## 네이티브 세션과 전사 미러

하네스는 네이티브 세션 id, 스레드 id 또는 데몬 측 재개 토큰을 유지할 수 있습니다. 해당 바인딩을 OpenClaw 세션과 명시적으로 연관시키고, 사용자가 보는 어시스턴트/도구 출력을 OpenClaw 전사로 계속 미러링하세요.

OpenClaw 전사는 다음을 위한 호환성 계층으로 남습니다:

- 채널에 보이는 세션 히스토리
- 전사 검색 및 인덱싱
- 이후 턴에서 내장 PI 하네스로 돌아가기
- 범용 `/new`, `/reset`, 세션 삭제 동작

하네스가 사이드카 바인딩을 저장한다면, 소유하는 OpenClaw 세션이 재설정될 때 OpenClaw가 그것을 지울 수 있도록 `reset(...)`을 구현하세요.

## 도구와 미디어 결과

코어가 OpenClaw 도구 목록을 구성하고 준비된 시도에 전달합니다. 하네스가 동적 도구 호출을 실행할 때, 채널 미디어를 직접 보내지 말고 하네스 결과 형태를 통해 도구 결과를 되돌려주세요.

이렇게 하면 텍스트, 이미지, 동영상, 음악, TTS, 승인, 메시징 도구 출력이 PI 기반 실행과 동일한 전달 경로에 남습니다.

## 현재 제한 사항

- 공개 임포트 경로는 범용적이지만, 일부 attempt/result 타입 별칭은 호환성을 위해 여전히 `Pi` 이름을 달고 있습니다.
- 서드파티 하네스 설치는 실험적입니다. 네이티브 세션 런타임이 필요할 때까지는 제공자 플러그인을 선호하세요.
- 하네스 전환은 턴 사이에 지원됩니다. 네이티브 도구, 승인, 어시스턴트 텍스트, 메시지 전송이 시작된 후 턴 중간에 하네스를 전환하지 마세요.

## 관련 항목

- [SDK 개요](/plugins/sdk-overview)
- [런타임 헬퍼](/plugins/sdk-runtime)
- [제공자 플러그인](/plugins/sdk-provider-plugins)
- [Codex Harness](/plugins/codex-harness)
- [모델 제공자](/concepts/model-providers)
