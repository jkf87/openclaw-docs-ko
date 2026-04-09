---
title: "모델 장애 조치"
description: "OpenClaw가 인증 프로파일을 로테이션하고 모델 간에 폴백하는 방법"
---

# 모델 장애 조치

OpenClaw는 두 단계로 장애를 처리합니다:

1. 현재 프로바이더 내에서 **인증 프로파일 로테이션**.
2. `agents.defaults.model.fallbacks`의 다음 모델로 **모델 폴백**.

이 문서는 런타임 규칙과 이를 뒷받침하는 데이터를 설명합니다.

## 런타임 흐름

일반 텍스트 실행의 경우, OpenClaw는 다음 순서로 후보를 평가합니다:

1. 현재 선택된 세션 모델.
2. 순서대로 구성된 `agents.defaults.model.fallbacks`.
3. 실행이 오버라이드로 시작된 경우 마지막에 구성된 기본 모델.

각 후보 내에서 OpenClaw는 다음 모델 후보로 진행하기 전에 인증 프로파일 장애 조치를 시도합니다.

상위 수준 순서:

1. 활성 세션 모델 및 인증 프로파일 선호도를 확인합니다.
2. 모델 후보 체인을 빌드합니다.
3. 인증 프로파일 로테이션/쿨다운 규칙으로 현재 프로바이더를 시도합니다.
4. 해당 프로바이더가 장애 조치에 해당하는 오류로 소진되면 다음 모델 후보로 이동합니다.
5. 재시도가 시작되기 전에 선택된 폴백 오버라이드를 영속화하여 다른 세션 리더가 실행자가 사용할 프로바이더/모델을 볼 수 있게 합니다.
6. 폴백 후보가 실패하면 해당 실패한 후보와 일치하는 경우에만 폴백 소유 세션 오버라이드 필드를 롤백합니다.
7. 모든 후보가 실패하면 쿨다운 만료가 알려진 경우 가장 빠른 쿨다운 만료와 함께 시도별 세부사항이 포함된 `FallbackSummaryError`를 발생시킵니다.

이는 의도적으로 "전체 세션을 저장 및 복원"보다 좁습니다. 응답 실행자는 폴백을 위해 소유하는 모델 선택 필드만 영속화합니다:

- `providerOverride`
- `modelOverride`
- `authProfileOverride`
- `authProfileOverrideSource`
- `authProfileOverrideCompactionCount`

이는 실패한 폴백 재시도가 실행이 진행되는 동안 발생한 수동 `/model` 변경이나 세션 로테이션 업데이트 같은 최신의 관련 없는 세션 변형을 덮어쓰는 것을 방지합니다.

## 인증 저장소 (키 + OAuth)

OpenClaw는 API 키와 OAuth 토큰 모두에 **인증 프로파일**을 사용합니다.

- 시크릿은 `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-profiles.json` (레거시: `~/.openclaw/agent/auth-profiles.json`)에 저장됩니다.
- 런타임 인증 라우팅 상태는 `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-state.json`에 있습니다.
- 구성 `auth.profiles` / `auth.order`는 **메타데이터 + 라우팅만** (시크릿 없음).
- 레거시 가져오기 전용 OAuth 파일: `~/.openclaw/credentials/oauth.json` (첫 사용 시 `auth-profiles.json`에 가져옴).

자세한 내용: [/concepts/oauth](/concepts/oauth)

자격 증명 유형:

- `type: "api_key"` → `{ provider, key }`
- `type: "oauth"` → `{ provider, access, refresh, expires, email? }` (일부 프로바이더에서 `projectId`/`enterpriseUrl` 포함)

## 프로파일 ID

OAuth 로그인은 여러 계정이 공존할 수 있도록 고유한 프로파일을 생성합니다.

- 기본값: 이메일을 사용할 수 없는 경우 `provider:default`.
- 이메일이 있는 OAuth: `provider:&lt;email&gt;` (예: `google-antigravity:user@gmail.com`).

프로파일은 `profiles` 아래의 `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-profiles.json`에 있습니다.

## 로테이션 순서

프로바이더에 여러 프로파일이 있는 경우, OpenClaw는 다음과 같이 순서를 선택합니다:

1. **명시적 구성**: `auth.order[provider]` (설정된 경우).
2. **구성된 프로파일**: 프로바이더로 필터링된 `auth.profiles`.
3. **저장된 프로파일**: 프로바이더의 `auth-profiles.json` 항목.

명시적 순서가 구성되지 않은 경우, OpenClaw는 라운드 로빈 순서를 사용합니다:

- **기본 키:** 프로파일 유형 (**API 키 전에 OAuth**).
- **보조 키:** `usageStats.lastUsed` (각 유형 내에서 가장 오래된 것 우선).
- **쿨다운/비활성화된 프로파일**은 가장 빠른 만료 순으로 끝으로 이동됩니다.

### 세션 고정 (캐시 친화적)

OpenClaw는 프로바이더 캐시를 따뜻하게 유지하기 위해 **세션당 선택된 인증 프로파일을 고정**합니다. 모든 요청에서 로테이션하지 않습니다. 고정된 프로파일은 다음 조건이 될 때까지 재사용됩니다:

- 세션이 재설정됨 (`/new` / `/reset`)
- 컴팩션이 완료됨 (컴팩션 수가 증가함)
- 프로파일이 쿨다운/비활성화 상태

`/model …@&lt;profileId&gt;`를 통한 수동 선택은 해당 세션에 대한 **사용자 오버라이드**를 설정하며, 새 세션이 시작될 때까지 자동 로테이션되지 않습니다.

자동 고정된 프로파일 (세션 라우터가 선택)은 **선호도**로 처리됩니다: 먼저 시도되지만 OpenClaw는 속도 제한/타임아웃 시 다른 프로파일로 로테이션할 수 있습니다. 사용자 고정 프로파일은 해당 프로파일에 잠깁니다; 실패하고 모델 폴백이 구성된 경우, OpenClaw는 프로파일을 전환하는 대신 다음 모델로 이동합니다.

### OAuth가 "사라진 것처럼 보이는" 이유

동일한 프로바이더에 대해 OAuth 프로파일과 API 키 프로파일이 모두 있는 경우, 고정하지 않으면 라운드 로빈이 메시지 간에 전환할 수 있습니다. 단일 프로파일을 강제하려면:

- `auth.order[provider] = ["provider:profileId"]`로 고정하거나,
- 프로파일 오버라이드로 `/model …`을 통한 세션별 오버라이드를 사용하십시오 (UI/채팅 서피스에서 지원하는 경우).

## 쿨다운

인증/속도 제한 오류 (또는 속도 제한처럼 보이는 타임아웃)로 인해 프로파일이 실패하면 OpenClaw는 이를 쿨다운으로 표시하고 다음 프로파일로 이동합니다. 해당 속도 제한 버킷은 일반 `429`보다 넓습니다: `Too many concurrent requests`, `ThrottlingException`, `concurrency limit reached`, `workers_ai ... quota limit exceeded`, `throttled`, `resource exhausted`, `weekly/monthly limit reached` 같은 프로바이더 메시지도 포함합니다. 형식/잘못된 요청 오류 (예: Cloud Code Assist 도구 호출 ID 검증 실패)는 장애 조치에 해당하며 동일한 쿨다운을 사용합니다. `Unhandled stop reason: error`, `stop reason: error`, `reason: error` 같은 OpenAI 호환 중지 이유 오류는 타임아웃/장애 조치 신호로 분류됩니다.

속도 제한 쿨다운은 모델 범위로 지정될 수 있습니다:

- OpenClaw는 실패하는 모델 ID가 알려진 경우 속도 제한 실패에 대해 `cooldownModel`을 기록합니다.
- 동일한 프로바이더의 형제 모델은 쿨다운이 다른 모델로 범위가 지정된 경우 여전히 시도할 수 있습니다.
- 청구/비활성화 윈도우는 여전히 모델 전체에 걸쳐 전체 프로파일을 차단합니다.

쿨다운은 지수적 백오프를 사용합니다:

- 1분
- 5분
- 25분
- 1시간 (상한)

상태는 `usageStats` 아래의 `auth-state.json`에 저장됩니다:

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

## 청구 비활성화

청구/크레딧 실패 (예: "insufficient credits" / "credit balance too low")는 장애 조치에 해당하지만, 일반적으로 일시적이지 않습니다. 짧은 쿨다운 대신 OpenClaw는 프로파일을 **비활성화** (더 긴 백오프로)로 표시하고 다음 프로파일/프로바이더로 로테이션합니다.

쿨다운은 지수적 백오프를 사용합니다:

- 청구 백오프는 **5시간**으로 시작하고, 청구 실패당 두 배가 되며, **24시간**에 상한이 있습니다.
- 백오프 카운터는 프로파일이 **24시간** 동안 실패하지 않으면 재설정됩니다 (구성 가능).
- 과부하 재시도는 모델 폴백 전에 **1번의 동일 프로바이더 프로파일 로테이션**을 허용합니다.
- 과부하 재시도는 기본적으로 **0ms 백오프**를 사용합니다.

## 모델 폴백

프로바이더의 모든 프로파일이 실패하면 OpenClaw는 `agents.defaults.model.fallbacks`의 다음 모델로 이동합니다. 이는 인증 실패, 속도 제한, 프로파일 로테이션을 소진한 타임아웃에 적용됩니다 (다른 오류는 폴백을 진행하지 않습니다).

과부하 및 속도 제한 오류는 청구 쿨다운보다 더 공격적으로 처리됩니다. 기본적으로 OpenClaw는 하나의 동일 프로바이더 인증 프로파일 재시도를 허용한 다음 기다리지 않고 다음 구성된 모델 폴백으로 전환합니다. `auth.cooldowns.overloadedProfileRotations`, `auth.cooldowns.overloadedBackoffMs`, `auth.cooldowns.rateLimitedProfileRotations`로 조정하십시오.

실행이 모델 오버라이드 (후크 또는 CLI)로 시작된 경우, 폴백은 구성된 폴백을 시도한 후 여전히 `agents.defaults.model.primary`에서 끝납니다.

### 후보 체인 규칙

OpenClaw는 현재 요청된 `provider/model` 및 구성된 폴백에서 후보 목록을 빌드합니다.

규칙:

- 요청된 모델이 항상 첫 번째입니다.
- 명시적 구성된 폴백은 중복 제거되지만 모델 허용 목록으로 필터링되지 않습니다. 명시적 오퍼레이터 의도로 처리됩니다.
- 현재 실행이 동일한 프로바이더 계열의 구성된 폴백에 이미 있는 경우, OpenClaw는 전체 구성된 체인을 계속 사용합니다.
- 현재 실행이 구성과 다른 프로바이더에 있고 해당 현재 모델이 이미 구성된 폴백 체인의 일부가 아닌 경우, OpenClaw는 다른 프로바이더의 관련 없는 구성된 폴백을 추가하지 않습니다.
- 실행이 오버라이드로 시작된 경우, 구성된 기본 모델이 끝에 추가되어 이전 후보가 소진되면 체인이 일반 기본값으로 다시 안정화될 수 있습니다.

### 폴백을 진행하는 오류

모델 폴백은 다음에서 계속됩니다:

- 인증 실패
- 속도 제한 및 쿨다운 소진
- 과부하/프로바이더 바쁨 오류
- 타임아웃 형태의 장애 조치 오류
- 청구 비활성화
- `LiveSessionModelSwitchError` (낡은 영속화된 모델이 외부 재시도 루프를 생성하지 않도록 장애 조치 경로로 정규화됨)
- 남은 후보가 있을 때 다른 인식되지 않는 오류

모델 폴백은 다음에서 계속되지 않습니다:

- 타임아웃/장애 조치 형태가 아닌 명시적 중단
- 컴팩션/재시도 로직 내에 유지되어야 하는 컨텍스트 오버플로우 오류
- 후보가 남지 않았을 때 최종 알 수 없는 오류

## 관찰 가능성 및 실패 요약

`runWithModelFallback(...)`은 로그와 사용자 대면 쿨다운 메시지를 공급하는 시도별 세부사항을 기록합니다:

- 시도된 프로바이더/모델
- 이유 (`rate_limit`, `overloaded`, `billing`, `auth`, `model_not_found` 및 유사한 장애 조치 이유)
- 선택적 상태/코드
- 사람이 읽을 수 있는 오류 요약

모든 후보가 실패하면 OpenClaw는 `FallbackSummaryError`를 발생시킵니다. 외부 응답 실행자는 이를 사용하여 "모든 모델이 일시적으로 속도 제한됨" 같은 더 구체적인 메시지를 빌드하고 알려진 경우 가장 빠른 쿨다운 만료를 포함할 수 있습니다.

## 관련 구성

[게이트웨이 구성](/gateway/configuration)을 참조하십시오:

- `auth.profiles` / `auth.order`
- `auth.cooldowns.billingBackoffHours` / `auth.cooldowns.billingBackoffHoursByProvider`
- `auth.cooldowns.billingMaxHours` / `auth.cooldowns.failureWindowHours`
- `auth.cooldowns.overloadedProfileRotations` / `auth.cooldowns.overloadedBackoffMs`
- `auth.cooldowns.rateLimitedProfileRotations`
- `agents.defaults.model.primary` / `agents.defaults.model.fallbacks`
- `agents.defaults.imageModel` 라우팅

더 넓은 모델 선택 및 폴백 개요는 [모델](/concepts/models)을 참조하십시오.
