---
title: "인증 자격 증명 시맨틱"
description: "인증 프로파일에 대한 표준 자격 증명 적격성 및 해결 시맨틱"
---

# 인증 자격 증명 시맨틱

이 문서는 다음에서 사용되는 표준 자격 증명 적격성 및 해결 시맨틱을 정의합니다:

- `resolveAuthProfileOrder`
- `resolveApiKeyForProfile`
- `models status --probe`
- `doctor-auth`

목표는 선택 시점 동작과 런타임 동작을 일치시키는 것입니다.

## 안정적인 프로브 이유 코드

- `ok`
- `excluded_by_auth_order`
- `missing_credential`
- `invalid_expires`
- `expired`
- `unresolved_ref`
- `no_model`

## 토큰 자격 증명

토큰 자격 증명(`type: "token"`)은 인라인 `token` 및/또는 `tokenRef`를 지원합니다.

### 적격성 규칙

1. `token`과 `tokenRef`가 모두 없는 경우 토큰 프로파일은 부적격합니다.
2. `expires`는 선택 사항입니다.
3. `expires`가 있는 경우 `0`보다 큰 유한 숫자여야 합니다.
4. `expires`가 유효하지 않은 경우(`NaN`, `0`, 음수, 비유한, 또는 잘못된 타입), 프로파일은 `invalid_expires`로 부적격합니다.
5. `expires`가 과거인 경우 프로파일은 `expired`로 부적격합니다.
6. `tokenRef`는 `expires` 유효성 검사를 우회하지 않습니다.

### 해결 규칙

1. 해결기 시맨틱은 `expires`에 대한 적격성 시맨틱과 일치합니다.
2. 적격한 프로파일의 경우, 토큰 자료는 인라인 값 또는 `tokenRef`에서 해결될 수 있습니다.
3. 해결 불가능한 ref는 `models status --probe` 출력에서 `unresolved_ref`를 생성합니다.

## 명시적 인증 순서 필터링

- 프로바이더에 대해 `auth.order.&lt;provider&gt;` 또는 인증 저장소 순서 재정의가 설정된 경우, `models status --probe`는 해당 프로바이더의 해결된 인증 순서에 남아 있는 프로파일 id만 프로브합니다.
- 명시적 순서에서 제외된 해당 프로바이더의 저장된 프로파일은 나중에 자동으로 시도되지 않습니다. 프로브 출력은 `reasonCode: excluded_by_auth_order` 및 세부 사항 `Excluded by auth.order for this provider.`로 보고합니다.

## 프로브 대상 해결

- 프로브 대상은 인증 프로파일, 환경 자격 증명, 또는 `models.json`에서 올 수 있습니다.
- 프로바이더에 자격 증명이 있지만 OpenClaw가 해당 프로바이더에 대해 프로브 가능한 모델 후보를 해결할 수 없는 경우, `models status --probe`는 `status: no_model` 및 `reasonCode: no_model`로 보고합니다.

## OAuth SecretRef 정책 가드

- SecretRef 입력은 정적 자격 증명 전용입니다.
- 프로파일 자격 증명이 `type: "oauth"`인 경우, 해당 프로파일 자격 증명 자료에는 SecretRef 객체가 지원되지 않습니다.
- `auth.profiles.&lt;id&gt;.mode`가 `"oauth"`인 경우, 해당 프로파일에 대한 SecretRef 기반 `keyRef`/`tokenRef` 입력은 거부됩니다.
- 위반은 시작/재로드 인증 해결 경로에서 하드 실패입니다.

## 레거시 호환 메시징

스크립트 호환성을 위해 프로브 오류는 이 첫 번째 줄을 변경 없이 유지합니다:

`Auth profile credentials are missing or expired.`

이후 줄에 사람이 읽기 쉬운 세부 사항과 안정적인 이유 코드가 추가될 수 있습니다.
