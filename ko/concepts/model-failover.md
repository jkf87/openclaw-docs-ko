---
summary: "OpenClaw가 auth profile을 rotation하고 모델 간 failover하는 방식"
read_when:
  - auth profile rotation, cooldown, 또는 모델 fallback 동작을 진단할 때
  - auth profile 또는 모델에 대한 failover 규칙을 업데이트할 때
  - 세션 모델 오버라이드가 fallback 재시도와 어떻게 상호작용하는지 이해할 때
title: "모델 failover"
---

OpenClaw는 실패를 두 단계로 처리합니다:

1. 현재 provider 내에서의 **Auth profile rotation**.
2. `agents.defaults.model.fallbacks`의 다음 모델로의 **모델 fallback**.

이 문서는 런타임 규칙과 그것을 뒷받침하는 데이터를 설명합니다.

## 런타임 플로우

일반 텍스트 실행의 경우, OpenClaw는 이 순서로 후보(candidate)를 평가합니다:

1. 현재 선택된 세션 모델.
2. 구성된 `agents.defaults.model.fallbacks`를 순서대로.
3. 실행이 오버라이드에서 시작되었을 때 마지막에 구성된 primary 모델.

각 후보 내부에서, OpenClaw는 다음 모델 후보로 진행하기 전에 auth-profile failover를 먼저 시도합니다.

상위 수준 시퀀스:

1. 활성 세션 모델과 auth-profile 선호도(preference)를 해석(resolve)합니다.
2. 모델 후보 체인을 빌드합니다.
3. auth-profile rotation/cooldown 규칙으로 현재 provider를 시도합니다.
4. 해당 provider가 failover-worthy 에러로 소진되면, 다음 모델 후보로 이동합니다.
5. 다른 세션 reader가 runner가 사용하려는 것과 동일한 provider/model을 보도록 재시도가 시작되기 전에 선택된 fallback 오버라이드를 영속화(persist)합니다.
6. fallback 후보가 실패하면, 해당 실패한 후보와 여전히 일치할 때에 한해 fallback 소유의 세션 오버라이드 필드만 롤백합니다.
7. 모든 후보가 실패하면, per-attempt 상세 정보와 알려진 경우 가장 빠른 cooldown 만료 시간을 담은 `FallbackSummaryError`를 throw합니다.

이는 "전체 세션을 저장하고 복원"하는 것보다 의도적으로 더 좁은 범위입니다. reply runner는 fallback을 위해 자신이 소유한 모델 선택 필드만 영속화합니다:

- `providerOverride`
- `modelOverride`
- `authProfileOverride`
- `authProfileOverrideSource`
- `authProfileOverrideCompactionCount`

이는 실패한 fallback 재시도가 시도가 실행되는 동안 발생한 수동 `/model` 변경이나 세션 rotation 업데이트와 같은 더 새로운 관련 없는 세션 mutation을 덮어쓰는 것을 방지합니다.

## Auth 저장소 (키 + OAuth)

OpenClaw는 API 키와 OAuth 토큰 모두에 대해 **auth profile**을 사용합니다.

- Secret은 `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`에 있습니다 (레거시: `~/.openclaw/agent/auth-profiles.json`).
- 런타임 auth-routing 상태는 `~/.openclaw/agents/<agentId>/agent/auth-state.json`에 있습니다.
- Config `auth.profiles` / `auth.order`는 **metadata + routing만**입니다 (secret 없음).
- 레거시 import 전용 OAuth 파일: `~/.openclaw/credentials/oauth.json` (최초 사용 시 `auth-profiles.json`으로 import됨).

자세한 내용: [/concepts/oauth](/concepts/oauth)

자격 증명(credential) 타입:

- `type: "api_key"` → `{ provider, key }`
- `type: "oauth"` → `{ provider, access, refresh, expires, email? }` (일부 provider의 경우 + `projectId`/`enterpriseUrl`)

## Profile ID

OAuth 로그인은 여러 계정이 공존할 수 있도록 구별되는 profile을 생성합니다.

- 기본값: email이 없을 때 `provider:default`.
- email이 있는 OAuth: `provider:<email>` (예: `google-antigravity:user@gmail.com`).

Profile은 `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`의 `profiles` 아래에 있습니다.

## Rotation 순서

provider에 여러 profile이 있을 때, OpenClaw는 다음과 같은 순서를 선택합니다:

1. **명시적 config**: `auth.order[provider]` (설정된 경우).
2. **구성된 profile**: provider로 필터링된 `auth.profiles`.
3. **저장된 profile**: provider에 대한 `auth-profiles.json`의 항목들.

명시적 순서가 구성되지 않은 경우, OpenClaw는 round-robin 순서를 사용합니다:

- **Primary 키:** profile 타입 (**API 키보다 OAuth 먼저**).
- **Secondary 키:** `usageStats.lastUsed` (각 타입 내에서 가장 오래된 것 먼저).
- **Cooldown/비활성화된 profile**은 가장 빠른 만료 순으로 끝으로 이동됩니다.

### 세션 stickiness (cache-friendly)

OpenClaw는 provider 캐시를 따뜻하게 유지하기 위해 **선택된 auth profile을 세션당 핀(pin)합니다**. 매 요청마다 rotation하지 **않습니다**. 핀된 profile은 다음까지 재사용됩니다:

- 세션이 리셋되는 경우 (`/new` / `/reset`)
- compaction이 완료되는 경우 (compaction 카운트 증가)
- profile이 cooldown/비활성화 상태인 경우

`/model …@<profileId>`를 통한 수동 선택은 해당 세션에 대한 **사용자 오버라이드**를 설정하며 새 세션이 시작될 때까지 자동 rotation되지 않습니다.

자동으로 핀된 profile (세션 라우터에 의해 선택됨)은 **선호도(preference)**로 취급됩니다: 먼저 시도되지만, OpenClaw는 rate limit/timeout 시 다른 profile로 rotation할 수 있습니다. 사용자 핀된 profile은 해당 profile에 잠긴 채로 유지됩니다; 실패하고 모델 fallback이 구성된 경우, OpenClaw는 profile을 전환하는 대신 다음 모델로 이동합니다.

### OAuth가 "사라진 것처럼 보이는" 이유

동일한 provider에 대해 OAuth profile과 API 키 profile 모두를 가지고 있는 경우, 핀되지 않는 한 round-robin이 메시지 간에 둘 사이를 전환할 수 있습니다. 단일 profile을 강제하려면:

- `auth.order[provider] = ["provider:profileId"]`로 핀하거나,
- profile 오버라이드가 있는 `/model …`을 통한 per-session 오버라이드를 사용하십시오 (UI/chat surface에서 지원되는 경우).

## Cooldown

profile이 auth/rate-limit 에러 (또는 rate limiting처럼 보이는 timeout)로 실패하면, OpenClaw는 그것을 cooldown으로 표시하고 다음 profile로 이동합니다. 해당 rate-limit 버킷은 단순한 `429`보다 더 광범위합니다: `Too many concurrent requests`, `ThrottlingException`, `concurrency limit reached`, `workers_ai ... quota limit exceeded`, `throttled`, `resource exhausted`, 그리고 `weekly/monthly limit reached`와 같은 주기적 usage-window 한도와 같은 provider 메시지도 포함합니다.
Format/invalid-request 에러 (예: Cloud Code Assist tool call ID 검증 실패)는 failover-worthy로 취급되며 동일한 cooldown을 사용합니다.
`Unhandled stop reason: error`, `stop reason: error`, `reason: error`와 같은 OpenAI-호환 stop-reason 에러는 timeout/failover 신호로 분류됩니다.
Provider-scoped 일반 서버 텍스트도 소스가 알려진 transient 패턴과 일치할 때 해당 timeout 버킷에 들어갈 수 있습니다. 예를 들어, Anthropic의 맨(bare) `An unknown error occurred`와 `internal server error`, `unknown error, 520`, `upstream error`, `backend error`와 같은 transient 서버 텍스트가 있는 JSON `api_error` payload는 failover-worthy timeout으로 취급됩니다. OpenRouter 전용의 맨 `Provider returned error`와 같은 일반적인 upstream 텍스트는 provider 컨텍스트가 실제로 OpenRouter일 때만 timeout으로 취급됩니다. `LLM request failed with an unknown error.`와 같은 일반 내부 폴백 텍스트는 보수적으로 유지되며 자체적으로 failover를 트리거하지 않습니다.

일부 provider SDK는 OpenClaw로 제어를 반환하기 전에 긴 `Retry-After` 창 동안 sleep할 수 있습니다. Anthropic과 OpenAI와 같은 Stainless 기반 SDK의 경우, OpenClaw는 SDK 내부의 `retry-after-ms` / `retry-after` 대기 시간을 기본적으로 60초로 제한하고, 이 failover 경로가 실행될 수 있도록 더 긴 retryable 응답을 즉시 surface합니다. `OPENCLAW_SDK_RETRY_MAX_WAIT_SECONDS`로 제한을 조정하거나 비활성화하십시오; [/concepts/retry](/concepts/retry)를 참조하십시오.

Rate-limit cooldown은 model-scoped일 수도 있습니다:

- OpenClaw는 실패한 모델 id가 알려진 경우 rate-limit 실패에 대해 `cooldownModel`을 기록합니다.
- cooldown이 다른 모델로 범위가 지정된 경우 동일한 provider의 sibling 모델은 여전히 시도될 수 있습니다.
- Billing/비활성화 창은 여전히 모델 전반에 걸쳐 전체 profile을 차단합니다.

Cooldown은 지수 backoff를 사용합니다:

- 1분
- 5분
- 25분
- 1시간 (상한)

상태는 `auth-state.json`의 `usageStats` 아래에 저장됩니다:

```json
{
  "usageStats": {
    "provider:profile": {
      "lastUsed": 1736160000000,
      "cooldownUntil": 1736160600000,
      "errorCount": 2
    }
  }
}
```

## Billing 비활성화

Billing/credit 실패 (예: "insufficient credits" / "credit balance too low")는 failover-worthy로 취급되지만, 일반적으로 transient하지 않습니다. 짧은 cooldown 대신, OpenClaw는 profile을 **비활성화**로 표시하고 (더 긴 backoff와 함께) 다음 profile/provider로 rotation합니다.

모든 billing-shaped 응답이 `402`는 아니며, 모든 HTTP `402`가 여기에 해당하는 것도 아닙니다. OpenClaw는 provider가 `401`이나 `403`을 대신 반환하더라도 명시적인 billing 텍스트를 billing 레인에 유지하지만, provider-specific matcher는 그것을 소유한 provider로 범위가 지정된 채로 유지됩니다 (예: OpenRouter `403 Key limit exceeded`). 한편 임시 `402` usage-window 및 organization/workspace spend-limit 에러는 메시지가 retryable하게 보일 때 `rate_limit`으로 분류됩니다 (예: `weekly usage limit exhausted`, `daily limit reached, resets tomorrow`, `organization spending limit exceeded`). 이들은 긴 billing-disable 경로 대신 짧은 cooldown/failover 경로에 유지됩니다.

상태는 `auth-state.json`에 저장됩니다:

```json
{
  "usageStats": {
    "provider:profile": {
      "disabledUntil": 1736178000000,
      "disabledReason": "billing"
    }
  }
}
```

기본값:

- Billing backoff는 **5시간**에서 시작하여, billing 실패마다 두 배가 되며, **24시간**에서 상한이 걸립니다.
- profile이 **24시간** 동안 실패하지 않으면 backoff 카운터가 리셋됩니다 (구성 가능).
- Overloaded 재시도는 모델 fallback 전에 **1번의 same-provider profile rotation**을 허용합니다.
- Overloaded 재시도는 기본적으로 **0 ms backoff**를 사용합니다.

## 모델 fallback

provider에 대한 모든 profile이 실패하면, OpenClaw는 `agents.defaults.model.fallbacks`의 다음 모델로 이동합니다. 이는 auth 실패, rate limit, 그리고 profile rotation이 소진된 timeout에 적용됩니다 (다른 에러는 fallback을 진행시키지 않습니다).

Overloaded 및 rate-limit 에러는 billing cooldown보다 더 공격적으로 처리됩니다. 기본적으로, OpenClaw는 한 번의 same-provider auth-profile 재시도를 허용한 다음, 기다리지 않고 다음 구성된 모델 fallback으로 전환합니다. `ModelNotReadyException`과 같은 provider-busy 신호는 해당 overloaded 버킷에 들어갑니다. `auth.cooldowns.overloadedProfileRotations`, `auth.cooldowns.overloadedBackoffMs`, `auth.cooldowns.rateLimitedProfileRotations`로 이를 조정하십시오.

실행이 모델 오버라이드로 시작되는 경우 (hook 또는 CLI), fallback은 구성된 fallback을 시도한 후 여전히 `agents.defaults.model.primary`에서 종료됩니다.

### 후보 체인 규칙

OpenClaw는 현재 요청된 `provider/model`과 구성된 fallback으로부터 후보 리스트를 빌드합니다.

규칙:

- 요청된 모델이 항상 첫 번째입니다.
- 명시적으로 구성된 fallback은 중복 제거되지만 모델 allowlist로 필터링되지는 않습니다. 명시적 operator 의도로 취급됩니다.
- 현재 실행이 이미 동일한 provider 패밀리의 구성된 fallback에 있다면, OpenClaw는 전체 구성된 체인을 계속 사용합니다.
- 현재 실행이 config와 다른 provider에 있고 그 현재 모델이 이미 구성된 fallback 체인의 일부가 아니라면, OpenClaw는 다른 provider의 관련 없는 구성된 fallback을 추가하지 않습니다.
- 실행이 오버라이드에서 시작된 경우, 이전 후보가 소진된 후 체인이 정상 기본값으로 돌아와 안착할 수 있도록 구성된 primary가 끝에 추가됩니다.

### 어떤 에러가 fallback을 진행시키는가

모델 fallback은 다음에서 계속됩니다:

- auth 실패
- rate limit 및 cooldown 소진
- overloaded/provider-busy 에러
- timeout-shaped failover 에러
- billing 비활성화
- `LiveSessionModelSwitchError`, 이는 failover 경로로 정규화되어 stale하게 영속된 모델이 외부 재시도 루프를 만들지 않도록 합니다
- 여전히 남은 후보가 있을 때의 다른 인식되지 않은 에러

모델 fallback은 다음에서는 계속되지 않습니다:

- timeout/failover-shaped가 아닌 명시적 abort
- compaction/retry 로직 내부에 있어야 하는 context overflow 에러 (예: `request_too_large`, `INVALID_ARGUMENT: input exceeds the maximum number of tokens`, `input token count exceeds the maximum number of input tokens`, `The input is too long for the model`, `ollama error: context length exceeded`)
- 남은 후보가 없을 때의 최종 unknown 에러

### Cooldown skip 대 probe 동작

provider에 대한 모든 auth profile이 이미 cooldown 상태일 때, OpenClaw는 해당 provider를 영원히 자동으로 skip하지는 않습니다. per-candidate 결정을 내립니다:

- 지속적인 auth 실패는 전체 provider를 즉시 skip합니다.
- Billing 비활성화는 일반적으로 skip하지만, primary 후보는 여전히 throttle 상에서 probe될 수 있어 재시작 없이 복구가 가능합니다.
- primary 후보는 per-provider throttle과 함께 cooldown 만료 근처에서 probe될 수 있습니다.
- Same-provider fallback sibling은 실패가 transient해 보이는 경우 (`rate_limit`, `overloaded`, 또는 unknown) cooldown에도 불구하고 시도될 수 있습니다. 이는 rate limit이 model-scoped이고 sibling 모델이 여전히 즉시 복구될 수 있을 때 특히 관련이 있습니다.
- Transient cooldown probe는 단일 provider가 cross-provider fallback을 지연시키지 않도록 fallback 실행당 provider당 하나로 제한됩니다.

## 세션 오버라이드와 live 모델 전환

세션 모델 변경은 공유 상태입니다. 활성 runner, `/model` 명령, compaction/세션 업데이트, 그리고 live-session reconciliation 모두 동일한 세션 엔트리의 일부를 읽거나 씁니다.

이는 fallback 재시도가 live 모델 전환과 조율되어야 함을 의미합니다:

- 명시적 사용자 주도 모델 변경만 pending live switch를 표시합니다. 여기에는 `/model`, `session_status(model=...)`, `sessions.patch`가 포함됩니다.
- fallback rotation, heartbeat 오버라이드, 또는 compaction과 같은 시스템 주도 모델 변경은 자체적으로 pending live switch를 표시하지 않습니다.
- fallback 재시도가 시작되기 전에, reply runner는 선택된 fallback 오버라이드 필드를 세션 엔트리에 영속화합니다.
- Live-session reconciliation은 stale한 런타임 모델 필드보다 영속된 세션 오버라이드를 선호합니다.
- fallback 시도가 실패하면, runner는 자신이 쓴 오버라이드 필드만 롤백하며, 그 필드가 여전히 실패한 후보와 일치할 때에 한해 그렇습니다.

이는 고전적인 race condition을 방지합니다:

1. Primary가 실패합니다.
2. 메모리에서 fallback 후보가 선택됩니다.
3. 세션 저장소는 여전히 이전 primary를 말합니다.
4. Live-session reconciliation이 stale한 세션 상태를 읽습니다.
5. fallback 시도가 시작되기 전에 재시도가 이전 모델로 되돌아갑니다.

영속된 fallback 오버라이드가 그 창을 닫으며, 좁은 범위의 롤백은 더 새로운 수동 또는 런타임 세션 변경을 손상시키지 않고 유지합니다.

## 관찰 가능성(Observability)과 실패 요약

`runWithModelFallback(...)`은 로그와 사용자 대상 cooldown 메시징에 공급되는 per-attempt 상세 정보를 기록합니다:

- 시도된 provider/model
- 이유 (`rate_limit`, `overloaded`, `billing`, `auth`, `model_not_found`, 그리고 유사한 failover 이유)
- 선택적 status/code
- 사람이 읽을 수 있는 에러 요약

모든 후보가 실패하면, OpenClaw는 `FallbackSummaryError`를 throw합니다. 외부 reply runner는 그것을 사용하여 "모든 모델이 일시적으로 rate-limit되었습니다"와 같은 더 구체적인 메시지를 빌드하고 알려진 경우 가장 빠른 cooldown 만료 시간을 포함할 수 있습니다.

해당 cooldown 요약은 model-aware입니다:

- 관련 없는 model-scoped rate limit은 시도된 provider/model 체인에 대해 무시됩니다
- 남은 차단(block)이 일치하는 model-scoped rate limit이라면, OpenClaw는 그 모델을 여전히 차단하는 마지막 일치 만료 시간을 보고합니다

## 관련 구성

다음에 대해서는 [Gateway 구성](/gateway/configuration)을 참조하십시오:

- `auth.profiles` / `auth.order`
- `auth.cooldowns.billingBackoffHours` / `auth.cooldowns.billingBackoffHoursByProvider`
- `auth.cooldowns.billingMaxHours` / `auth.cooldowns.failureWindowHours`
- `auth.cooldowns.overloadedProfileRotations` / `auth.cooldowns.overloadedBackoffMs`
- `auth.cooldowns.rateLimitedProfileRotations`
- `agents.defaults.model.primary` / `agents.defaults.model.fallbacks`
- `agents.defaults.imageModel` 라우팅

광범위한 모델 선택 및 fallback 개요는 [모델](/concepts/models)을 참조하십시오.
