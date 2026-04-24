---
summary: "FAQ: model 기본값, 선택, alias, 전환, failover, auth profile"
read_when:
  - model 선택 또는 전환, alias 구성
  - model failover / "All models failed" 디버깅
  - auth profile의 개념과 관리 방법 이해
title: "FAQ: 모델 및 인증"
sidebarTitle: "Models FAQ"
---

Model 및 auth profile 관련 Q&A입니다. 설정, 세션, gateway, 채널 및 문제 해결에 대해서는 메인 [FAQ](/help/faq)를 참조하십시오.

## 모델: 기본값, 선택, alias, 전환

<AccordionGroup>
  <Accordion title='"default model"이란 무엇인가요?'>
    OpenClaw의 default model은 다음과 같이 설정한 값입니다:

    ```
    agents.defaults.model.primary
    ```

    Model은 `provider/model` 형식으로 참조됩니다 (예: `openai/gpt-5.4` 또는 `openai-codex/gpt-5.5`). provider를 생략하면 OpenClaw는 먼저 alias를 시도하고, 그다음 해당 정확한 model id에 대해 고유하게 구성된 provider 매치를 시도하며, 그 후에야 deprecated된 호환성 경로로서 구성된 default provider로 fallback합니다. 해당 provider가 더 이상 구성된 default model을 노출하지 않으면, OpenClaw는 제거된 provider의 오래된 default를 드러내는 대신 처음 구성된 provider/model로 fallback합니다. 그래도 `provider/model`을 **명시적으로** 설정하는 것이 좋습니다.

  </Accordion>

  <Accordion title="어떤 model을 권장하나요?">
    **권장 default:** provider 스택에서 사용 가능한 최신 세대의 가장 강력한 model을 사용하십시오.
    **tool이 활성화되었거나 신뢰할 수 없는 입력을 다루는 에이전트의 경우:** 비용보다 model 성능을 우선하십시오.
    **일상적/저위험 채팅의 경우:** 더 저렴한 fallback model을 사용하고 에이전트 역할별로 라우팅하십시오.

    MiniMax에는 자체 문서가 있습니다: [MiniMax](/providers/minimax) 및
    [Local models](/gateway/local-models).

    경험칙: 고위험 작업에는 **감당할 수 있는 최고의 model**을, 일상적인 채팅이나 요약에는 더 저렴한 model을 사용하십시오. 에이전트별로 model을 라우팅할 수 있으며 sub-agent를 사용해 긴 작업을 병렬화할 수 있습니다 (각 sub-agent는 토큰을 소비합니다). [Models](/concepts/models) 및 [Sub-agents](/tools/subagents)를 참조하십시오.

    강력한 경고: 더 약하거나 과도하게 quantize된 model은 prompt injection 및 안전하지 않은 동작에 더 취약합니다. [Security](/gateway/security/)를 참조하십시오.

    추가 컨텍스트: [Models](/concepts/models).

  </Accordion>

  <Accordion title="설정을 날리지 않고 model을 전환하는 방법은?">
    **model 명령어**를 사용하거나 **model** 필드만 편집하십시오. 전체 설정 교체는 피하십시오.

    안전한 옵션:

    - 채팅에서 `/model` (빠름, 세션별)
    - `openclaw models set ...` (model 설정만 업데이트)
    - `openclaw configure --section model` (인터랙티브)
    - `~/.openclaw/openclaw.json`의 `agents.defaults.model` 편집

    전체 설정을 교체하려는 의도가 아니라면 부분 객체로 `config.apply`를 사용하지 마십시오.
    RPC 편집의 경우, 먼저 `config.schema.lookup`으로 검사하고 `config.patch`를 선호하십시오. lookup 페이로드는 정규화된 경로, 얕은 schema 문서/제약, 즉시 하위 요약을 제공합니다.
    부분 업데이트용.
    설정을 덮어썼다면 백업에서 복원하거나 `openclaw doctor`를 다시 실행해 복구하십시오.

    문서: [Models](/concepts/models), [Configure](/cli/configure), [Config](/cli/config), [Doctor](/gateway/doctor).

  </Accordion>

  <Accordion title="self-hosted model(llama.cpp, vLLM, Ollama)을 사용할 수 있나요?">
    네. Ollama가 로컬 model에 가장 쉬운 경로입니다.

    가장 빠른 설정:

    1. `https://ollama.com/download`에서 Ollama 설치
    2. `ollama pull gemma4` 같은 로컬 model pull
    3. 클라우드 model도 원한다면 `ollama signin` 실행
    4. `openclaw onboard` 실행 후 `Ollama` 선택
    5. `Local` 또는 `Cloud + Local` 선택

    참고:

    - `Cloud + Local`은 클라우드 model과 로컬 Ollama model을 함께 제공합니다
    - `kimi-k2.5:cloud` 같은 클라우드 model은 로컬 pull이 필요 없습니다
    - 수동 전환은 `openclaw models list` 및 `openclaw models set ollama/<model>`을 사용하십시오

    보안 참고: 더 작거나 많이 quantize된 model은 prompt injection에 더 취약합니다. tool을 사용할 수 있는 모든 봇에는 **대형 model**을 강력히 권장합니다. 그래도 소형 model을 원한다면 sandboxing과 엄격한 tool allowlist를 활성화하십시오.

    문서: [Ollama](/providers/ollama), [Local models](/gateway/local-models),
    [Model providers](/concepts/model-providers), [Security](/gateway/security/),
    [Sandboxing](/gateway/sandboxing).

  </Accordion>

  <Accordion title="OpenClaw, Flawd, Krill는 어떤 model을 사용하나요?">
    - 이러한 배포는 다를 수 있고 시간에 따라 변경될 수 있으므로 고정된 provider 권장 사항은 없습니다.
    - 각 gateway의 현재 런타임 설정은 `openclaw models status`로 확인하십시오.
    - 보안이 중요하거나 tool이 활성화된 에이전트에는 사용 가능한 최신 세대의 가장 강력한 model을 사용하십시오.
  </Accordion>

  <Accordion title="재시작 없이 즉석에서 model을 전환하려면?">
    `/model` 명령을 독립 메시지로 사용하십시오:

    ```
    /model sonnet
    /model opus
    /model gpt
    /model gpt-mini
    /model gemini
    /model gemini-flash
    /model gemini-flash-lite
    ```

    이것은 내장 alias입니다. 커스텀 alias는 `agents.defaults.models`를 통해 추가할 수 있습니다.

    사용 가능한 model은 `/model`, `/model list` 또는 `/model status`로 나열할 수 있습니다.

    `/model` (및 `/model list`)은 컴팩트한 번호 매겨진 picker를 표시합니다. 번호로 선택:

    ```
    /model 3
    ```

    provider에 대해 특정 auth profile을 강제할 수도 있습니다 (세션별):

    ```
    /model opus@anthropic:default
    /model opus@anthropic:work
    ```

    팁: `/model status`는 어떤 에이전트가 활성 상태인지, 어떤 `auth-profiles.json` 파일이 사용되고 있는지, 다음에 시도될 auth profile이 무엇인지 보여줍니다.
    가능한 경우 구성된 provider 엔드포인트(`baseUrl`)와 API 모드(`api`)도 표시합니다.

    **@profile로 설정한 profile을 해제하려면?**

    `@profile` 접미사 **없이** `/model`을 다시 실행하십시오:

    ```
    /model anthropic/claude-opus-4-6
    ```

    default로 돌아가고 싶다면 `/model`에서 선택하십시오 (또는 `/model <default provider/model>`을 보내십시오).
    어떤 auth profile이 활성 상태인지 확인하려면 `/model status`를 사용하십시오.

  </Accordion>

  <Accordion title="일상 작업에는 GPT 5.5를, 코딩에는 Codex 5.5를 사용할 수 있나요?">
    네. 하나를 default로 설정하고 필요에 따라 전환하십시오:

    - **빠른 전환 (세션별):** 현재 direct OpenAI API-key 작업의 경우 `/model openai/gpt-5.4`, 또는 GPT-5.5 Codex OAuth 작업의 경우 `/model openai-codex/gpt-5.5`.
    - **default:** API-key 사용의 경우 `agents.defaults.model.primary`를 `openai/gpt-5.4`로, GPT-5.5 Codex OAuth 사용의 경우 `openai-codex/gpt-5.5`로 설정하십시오.
    - **Sub-agent:** 코딩 작업을 다른 default model을 가진 sub-agent로 라우팅하십시오.

    `openai/gpt-5.5`에 대한 direct API-key 접근은 OpenAI가 public API에서 GPT-5.5를 활성화하면 지원됩니다. 그때까지 GPT-5.5는 구독/OAuth 전용입니다.

    [Models](/concepts/models) 및 [Slash commands](/tools/slash-commands)를 참조하십시오.

  </Accordion>

  <Accordion title="GPT 5.5의 fast mode를 구성하는 방법은?">
    세션 토글 또는 설정 default 중 하나를 사용하십시오:

    - **세션별:** 세션이 `openai/gpt-5.4` 또는 `openai-codex/gpt-5.5`를 사용하는 동안 `/fast on`을 보냅니다.
    - **model별 default:** `agents.defaults.models["openai/gpt-5.4"].params.fastMode` 또는 `agents.defaults.models["openai-codex/gpt-5.5"].params.fastMode`를 `true`로 설정합니다.

    예시:

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "openai/gpt-5.4": {
              params: {
                fastMode: true,
              },
            },
          },
        },
      },
    }
    ```

    OpenAI의 경우 fast mode는 지원되는 native Responses 요청에서 `service_tier = "priority"`로 매핑됩니다. 세션 `/fast` 재정의는 설정 default를 이깁니다.

    [Thinking and fast mode](/tools/thinking) 및 [OpenAI fast mode](/providers/openai#fast-mode)를 참조하십시오.

  </Accordion>

  <Accordion title='"Model ... is not allowed"가 나오고 응답이 없는 이유는?'>
    `agents.defaults.models`가 설정되면, 이것은 `/model` 및 모든 세션 재정의에 대한 **allowlist**가 됩니다. 해당 목록에 없는 model을 선택하면 다음을 반환합니다:

    ```
    Model "provider/model" is not allowed. Use /model to list available models.
    ```

    이 오류는 정상 응답 **대신** 반환됩니다. 수정: `agents.defaults.models`에 model을 추가하거나, allowlist를 제거하거나, `/model list`에서 model을 선택하십시오.

  </Accordion>

  <Accordion title='"Unknown model: minimax/MiniMax-M2.7"이 나오는 이유는?'>
    이것은 **provider가 구성되지 않았음**(MiniMax provider 설정이나 auth profile을 찾지 못함)을 의미하므로 model을 resolve할 수 없습니다.

    수정 체크리스트:

    1. 현재 OpenClaw release로 업그레이드하거나 source `main`에서 실행한 다음 gateway를 재시작하십시오.
    2. MiniMax가 구성되었는지 (wizard 또는 JSON), 또는 env/auth profile에 MiniMax auth가 존재해 매칭되는 provider가 주입될 수 있는지 확인하십시오 (`minimax`는 `MINIMAX_API_KEY`, `minimax-portal`은 `MINIMAX_OAUTH_TOKEN` 또는 저장된 MiniMax OAuth).
    3. auth 경로에 맞는 정확한 model id(대소문자 구분)를 사용하십시오:
       API-key 설정의 경우 `minimax/MiniMax-M2.7` 또는 `minimax/MiniMax-M2.7-highspeed`, OAuth 설정의 경우 `minimax-portal/MiniMax-M2.7` / `minimax-portal/MiniMax-M2.7-highspeed`.
    4. 실행:

       ```bash
       openclaw models list
       ```

       그리고 목록에서 선택하십시오 (또는 채팅에서 `/model list`).

    [MiniMax](/providers/minimax) 및 [Models](/concepts/models)를 참조하십시오.

  </Accordion>

  <Accordion title="MiniMax를 default로 사용하고 복잡한 작업에는 OpenAI를 사용할 수 있나요?">
    네. **MiniMax를 default**로 사용하고 필요할 때 **세션별로** model을 전환하십시오.
    Fallback은 "어려운 작업"이 아닌 **오류**에 대한 것이므로 `/model` 또는 별도의 에이전트를 사용하십시오.

    **옵션 A: 세션별 전환**

    ```json5
    {
      env: { MINIMAX_API_KEY: "sk-...", OPENAI_API_KEY: "sk-..." },
      agents: {
        defaults: {
          model: { primary: "minimax/MiniMax-M2.7" },
          models: {
            "minimax/MiniMax-M2.7": { alias: "minimax" },
            "openai/gpt-5.4": { alias: "gpt" },
          },
        },
      },
    }
    ```

    그런 다음:

    ```
    /model gpt
    ```

    **옵션 B: 별도의 에이전트**

    - 에이전트 A default: MiniMax
    - 에이전트 B default: OpenAI
    - 에이전트별로 라우팅하거나 `/agent`를 사용해 전환

    문서: [Models](/concepts/models), [Multi-Agent Routing](/concepts/multi-agent), [MiniMax](/providers/minimax), [OpenAI](/providers/openai).

  </Accordion>

  <Accordion title="opus / sonnet / gpt는 내장 단축키인가요?">
    네. OpenClaw는 몇 가지 default 단축키를 제공합니다 (model이 `agents.defaults.models`에 존재할 때만 적용됨):

    - `opus` → `anthropic/claude-opus-4-6`
    - `sonnet` → `anthropic/claude-sonnet-4-6`
    - `gpt` → API-key 설정의 경우 `openai/gpt-5.4`, Codex OAuth용으로 구성된 경우 `openai-codex/gpt-5.5`
    - `gpt-mini` → `openai/gpt-5.4-mini`
    - `gpt-nano` → `openai/gpt-5.4-nano`
    - `gemini` → `google/gemini-3.1-pro-preview`
    - `gemini-flash` → `google/gemini-3-flash-preview`
    - `gemini-flash-lite` → `google/gemini-3.1-flash-lite-preview`

    동일한 이름으로 자신의 alias를 설정하면 사용자의 값이 우선합니다.

  </Accordion>

  <Accordion title="model 단축키(alias)를 정의/재정의하는 방법은?">
    Alias는 `agents.defaults.models.<modelId>.alias`에서 옵니다. 예시:

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "anthropic/claude-opus-4-6" },
          models: {
            "anthropic/claude-opus-4-6": { alias: "opus" },
            "anthropic/claude-sonnet-4-6": { alias: "sonnet" },
            "anthropic/claude-haiku-4-5": { alias: "haiku" },
          },
        },
      },
    }
    ```

    그러면 `/model sonnet` (또는 지원되는 경우 `/<alias>`)은 해당 model ID로 resolve됩니다.

  </Accordion>

  <Accordion title="OpenRouter나 Z.AI 같은 다른 provider의 model을 추가하는 방법은?">
    OpenRouter (토큰당 과금; 많은 model):

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "openrouter/anthropic/claude-sonnet-4-6" },
          models: { "openrouter/anthropic/claude-sonnet-4-6": {} },
        },
      },
      env: { OPENROUTER_API_KEY: "sk-or-..." },
    }
    ```

    Z.AI (GLM model):

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "zai/glm-5" },
          models: { "zai/glm-5": {} },
        },
      },
      env: { ZAI_API_KEY: "..." },
    }
    ```

    provider/model을 참조했지만 필요한 provider 키가 누락된 경우 런타임 auth 오류가 발생합니다 (예: `No API key found for provider "zai"`).

    **새 에이전트를 추가한 후 provider에 대한 API 키를 찾을 수 없음**

    이것은 보통 **새 에이전트**의 auth store가 비어 있다는 뜻입니다. Auth는 에이전트별로 저장됩니다:

    ```
    ~/.openclaw/agents/<agentId>/agent/auth-profiles.json
    ```

    수정 옵션:

    - `openclaw agents add <id>`를 실행하고 wizard에서 auth를 구성하십시오.
    - 또는 메인 에이전트의 `agentDir`에서 새 에이전트의 `agentDir`로 `auth-profiles.json`을 복사하십시오.

    **`agentDir`을 에이전트 간에 재사용하지 마십시오**; auth/세션 충돌을 일으킵니다.

  </Accordion>
</AccordionGroup>

## Model failover 및 "All models failed"

<AccordionGroup>
  <Accordion title="failover는 어떻게 작동하나요?">
    Failover는 두 단계로 일어납니다:

    1. 동일 provider 내에서의 **Auth profile rotation**.
    2. `agents.defaults.model.fallbacks`의 다음 model로의 **Model fallback**.

    실패하는 profile에는 cooldown이 적용되므로 (exponential backoff), provider가 rate-limit되거나 일시적으로 실패하더라도 OpenClaw는 계속 응답할 수 있습니다.

    Rate-limit 버킷은 단순 `429` 응답 이상을 포함합니다. OpenClaw는 `Too many concurrent requests`, `ThrottlingException`, `concurrency limit reached`, `workers_ai ... quota limit exceeded`, `resource exhausted` 같은 메시지와 주기적 사용 window 제한(`weekly/monthly limit reached`)도 failover 가치가 있는 rate limit으로 취급합니다.

    일부 billing처럼 보이는 응답은 `402`가 아니며, 일부 HTTP `402` 응답도 해당 일시적 버킷에 머무릅니다. provider가 `401` 또는 `403`에 명시적 billing 텍스트를 반환하면 OpenClaw는 이를 billing lane에 유지할 수 있지만, provider별 텍스트 매처는 해당 provider에 범위가 한정됩니다 (예: OpenRouter `Key limit exceeded`). `402` 메시지가 재시도 가능한 사용 window 또는 organization/workspace 지출 한도(`daily limit reached, resets tomorrow`, `organization spending limit exceeded`)처럼 보이면, OpenClaw는 긴 billing 비활성화가 아닌 `rate_limit`으로 취급합니다.

    컨텍스트 오버플로우 오류는 다릅니다: `request_too_large`, `input exceeds the maximum number of tokens`, `input token count exceeds the maximum number of input tokens`, `input is too long for the model`, 또는 `ollama error: context length exceeded` 같은 시그니처는 model fallback을 진행하는 대신 compaction/재시도 경로에 머무릅니다.

    일반적인 서버 오류 텍스트는 "unknown/error를 포함하는 모든 것"보다 의도적으로 더 좁습니다. OpenClaw는 provider 컨텍스트가 일치할 때 Anthropic의 단순 `An unknown error occurred`, OpenRouter의 단순 `Provider returned error`, `Unhandled stop reason: error` 같은 stop-reason 오류, 일시적 서버 텍스트가 포함된 JSON `api_error` 페이로드(`internal server error`, `unknown error, 520`, `upstream error`, `backend error`), `ModelNotReadyException` 같은 provider-busy 오류와 같은 provider 범위의 일시적 형태를 failover 가치가 있는 timeout/overloaded 신호로 취급합니다.
    `LLM request failed with an unknown error.` 같은 일반 내부 fallback 텍스트는 보수적으로 유지되며 그 자체로는 model fallback을 트리거하지 않습니다.

  </Accordion>

  <Accordion title='"No credentials found for profile anthropic:default"는 무엇을 의미하나요?'>
    시스템이 `anthropic:default` auth profile ID를 사용하려고 시도했지만, 예상 auth store에서 그에 대한 자격 증명을 찾을 수 없다는 뜻입니다.

    **수정 체크리스트:**

    - **auth profile이 어디에 있는지 확인** (신규 대 legacy 경로)
      - 현재: `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
      - Legacy: `~/.openclaw/agent/*` (`openclaw doctor`에 의해 마이그레이션됨)
    - **env var가 Gateway에 로드되는지 확인**
      - shell에서 `ANTHROPIC_API_KEY`를 설정했지만 Gateway를 systemd/launchd를 통해 실행하면 상속되지 않을 수 있습니다. `~/.openclaw/.env`에 넣거나 `env.shellEnv`를 활성화하십시오.
    - **올바른 에이전트를 편집하는지 확인**
      - Multi-agent 설정은 여러 `auth-profiles.json` 파일이 있을 수 있음을 의미합니다.
    - **model/auth 상태 sanity check**
      - 구성된 model과 provider가 인증되었는지 확인하려면 `openclaw models status`를 사용하십시오.

    **"No credentials found for profile anthropic" 수정 체크리스트**

    이것은 실행이 Anthropic auth profile에 고정되어 있지만, Gateway가 auth store에서 해당 profile을 찾을 수 없다는 뜻입니다.

    - **Claude CLI 사용**
      - gateway 호스트에서 `openclaw models auth login --provider anthropic --method cli --set-default`를 실행하십시오.
    - **API 키를 대신 사용하려는 경우**
      - **gateway 호스트**의 `~/.openclaw/.env`에 `ANTHROPIC_API_KEY`를 넣으십시오.
      - 누락된 profile을 강제하는 고정된 순서를 모두 지우십시오:

        ```bash
        openclaw models auth order clear --provider anthropic
        ```

    - **명령을 gateway 호스트에서 실행하는지 확인**
      - remote mode에서는 auth profile이 사용자 노트북이 아닌 gateway 머신에 있습니다.

  </Accordion>

  <Accordion title="왜 Google Gemini도 시도하고 실패했나요?">
    model 설정에 Google Gemini가 fallback으로 포함되어 있거나(또는 Gemini 단축키로 전환한 경우), OpenClaw는 model fallback 중에 이를 시도합니다. Google 자격 증명을 구성하지 않았다면 `No API key found for provider "google"`이 표시됩니다.

    수정: Google auth를 제공하거나, `agents.defaults.model.fallbacks` / alias에서 Google model을 제거/피해서 fallback이 그쪽으로 라우팅되지 않도록 하십시오.

    **LLM request rejected: thinking signature required (Google Antigravity)**

    원인: 세션 기록에 **signature가 없는 thinking 블록**이 포함되어 있습니다 (종종 중단된/부분 스트림에서 발생). Google Antigravity는 thinking 블록에 signature를 요구합니다.

    수정: OpenClaw는 이제 Google Antigravity Claude에 대해 서명되지 않은 thinking 블록을 제거합니다. 여전히 나타나면 **새 세션**을 시작하거나 해당 에이전트에 대해 `/thinking off`를 설정하십시오.

  </Accordion>
</AccordionGroup>

## Auth profile: 무엇이고 어떻게 관리하나

관련: [/concepts/oauth](/concepts/oauth) (OAuth 흐름, 토큰 저장, 멀티 계정 패턴)

<AccordionGroup>
  <Accordion title="auth profile이란 무엇인가요?">
    Auth profile은 provider에 연결된 이름 있는 자격 증명 레코드(OAuth 또는 API 키)입니다. Profile은 다음에 저장됩니다:

    ```
    ~/.openclaw/agents/<agentId>/agent/auth-profiles.json
    ```

  </Accordion>

  <Accordion title="일반적인 profile ID는 무엇인가요?">
    OpenClaw는 provider-prefixed ID를 사용합니다:

    - `anthropic:default` (email identity가 없을 때 일반적)
    - OAuth identity의 경우 `anthropic:<email>`
    - 사용자가 선택한 커스텀 ID (예: `anthropic:work`)

  </Accordion>

  <Accordion title="어떤 auth profile이 먼저 시도될지 제어할 수 있나요?">
    네. 설정은 profile에 대한 선택적 메타데이터와 provider별 순서(`auth.order.<provider>`)를 지원합니다. 이것은 secret을 저장하지 **않습니다**; ID를 provider/mode에 매핑하고 rotation 순서를 설정합니다.

    OpenClaw는 profile이 짧은 **cooldown** 상태(rate limit/timeout/auth failure)이거나 더 긴 **disabled** 상태(billing/크레딧 부족)인 경우 일시적으로 건너뛸 수 있습니다. 이를 검사하려면 `openclaw models status --json`을 실행하고 `auth.unusableProfiles`를 확인하십시오. 튜닝: `auth.cooldowns.billingBackoffHours*`.

    Rate-limit cooldown은 model 범위일 수 있습니다. 한 model에 대해 cooldown 중인 profile은 동일 provider의 형제 model에 대해서는 여전히 사용 가능할 수 있으며, billing/disabled window는 여전히 전체 profile을 차단합니다.

    CLI를 통해 **에이전트별** 순서 재정의도 설정할 수 있습니다 (해당 에이전트의 `auth-state.json`에 저장됨):

    ```bash
    # 구성된 기본 에이전트로 기본 설정됨 (--agent 생략)
    openclaw models auth order get --provider anthropic

    # rotation을 단일 profile로 lock (이것만 시도)
    openclaw models auth order set --provider anthropic anthropic:default

    # 또는 명시적 순서 설정 (provider 내 fallback)
    openclaw models auth order set --provider anthropic anthropic:work anthropic:default

    # 재정의 clear (설정 auth.order / round-robin으로 fallback)
    openclaw models auth order clear --provider anthropic
    ```

    특정 에이전트를 대상으로 하려면:

    ```bash
    openclaw models auth order set --provider anthropic --agent main anthropic:default
    ```

    실제로 무엇이 시도될지 확인하려면 다음을 사용하십시오:

    ```bash
    openclaw models status --probe
    ```

    저장된 profile이 명시적 순서에서 생략되면, probe는 해당 profile에 대해 조용히 시도하지 않고 `excluded_by_auth_order`를 보고합니다.

  </Accordion>

  <Accordion title="OAuth 대 API 키 - 차이점은?">
    OpenClaw는 두 가지 모두 지원합니다:

    - **OAuth**는 종종 구독 접근을 활용합니다 (해당되는 경우).
    - **API 키**는 토큰당 과금을 사용합니다.

    Wizard는 Anthropic Claude CLI, OpenAI Codex OAuth, API 키를 명시적으로 지원합니다.

  </Accordion>
</AccordionGroup>

## 관련

- [FAQ](/help/faq) — 메인 FAQ
- [FAQ — 빠른 시작 및 첫 실행 설정](/help/faq-first-run)
- [Model selection](/concepts/model-providers)
- [Model failover](/concepts/model-failover)
