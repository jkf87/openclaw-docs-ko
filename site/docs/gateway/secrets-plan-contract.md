---
title: "Secrets Apply 플랜 계약"
description: "`secrets apply` 플랜 계약: 대상 유효성 검사, 경로 매칭, `auth-profiles.json` 대상 범위"
---

# Secrets apply 플랜 계약

이 페이지는 `openclaw secrets apply`에 의해 적용되는 엄격한 계약을 정의합니다.

대상이 이 규칙과 일치하지 않으면 구성을 변경하기 전에 apply가 실패합니다.

## 플랜 파일 형태

`openclaw secrets apply --from &lt;plan.json&gt;`은 플랜 대상의 `targets` 배열을 기대합니다:

```json5
{
  version: 1,
  protocolVersion: 1,
  targets: [
    {
      type: "models.providers.apiKey",
      path: "models.providers.openai.apiKey",
      pathSegments: ["models", "providers", "openai", "apiKey"],
      providerId: "openai",
      ref: { source: "env", provider: "default", id: "OPENAI_API_KEY" },
    },
    {
      type: "auth-profiles.api_key.key",
      path: "profiles.openai:default.key",
      pathSegments: ["profiles", "openai:default", "key"],
      agentId: "main",
      ref: { source: "env", provider: "default", id: "OPENAI_API_KEY" },
    },
  ],
}
```

## 지원되는 대상 범위

플랜 대상은 다음의 지원되는 자격 증명 경로에 허용됩니다:

- [SecretRef 자격 증명 표면](/reference/secretref-credential-surface)

## 대상 유형 동작

일반 규칙:

- `target.type`은 인식되어야 하고 정규화된 `target.path` 형태와 일치해야 합니다.

기존 플랜에 대해 호환성 별칭이 계속 허용됩니다:

- `models.providers.apiKey`
- `skills.entries.apiKey`
- `channels.googlechat.serviceAccount`

## 경로 유효성 검사 규칙

각 대상은 다음 모든 항목으로 유효성이 검사됩니다:

- `type`은 인식된 대상 유형이어야 합니다.
- `path`는 비어 있지 않은 점 경로이어야 합니다.
- `pathSegments`는 생략할 수 있습니다. 제공된 경우 `path`와 정확히 동일한 경로로 정규화되어야 합니다.
- 금지된 세그먼트는 거부됩니다: `__proto__`, `prototype`, `constructor`.
- 정규화된 경로는 대상 유형에 대해 등록된 경로 형태와 일치해야 합니다.
- `providerId` 또는 `accountId`가 설정된 경우 경로에 인코딩된 id와 일치해야 합니다.
- `auth-profiles.json` 대상은 `agentId`가 필요합니다.
- 새 `auth-profiles.json` 매핑을 생성할 때 `authProfileProvider`를 포함합니다.

## 실패 동작

대상이 유효성 검사에 실패하면 apply는 다음과 같은 오류로 종료됩니다:

```text
Invalid plan target path for models.providers.apiKey: models.providers.openai.baseUrl
```

유효하지 않은 플랜에 대해서는 쓰기가 커밋되지 않습니다.

## Exec 프로바이더 동의 동작

- `--dry-run`은 기본적으로 exec SecretRef 체크를 건너뜁니다.
- exec SecretRef/프로바이더가 포함된 플랜은 `--allow-exec`가 설정되지 않는 한 쓰기 모드에서 거부됩니다.
- exec가 포함된 플랜을 유효성 검사/적용할 때 dry-run과 쓰기 명령 모두에서 `--allow-exec`를 전달합니다.

## 런타임 및 감사 범위 참고 사항

- Ref 전용 `auth-profiles.json` 항목(`keyRef`/`tokenRef`)은 런타임 해결 및 감사 범위에 포함됩니다.
- `secrets apply`는 지원되는 `openclaw.json` 대상, 지원되는 `auth-profiles.json` 대상, 선택적 스크럽 대상을 씁니다.

## 오퍼레이터 체크

```bash
# 쓰기 없이 플랜 유효성 검사
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --dry-run

# 그런 다음 실제로 적용
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json

# exec가 포함된 플랜의 경우 두 모드에서 명시적으로 동의
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --dry-run --allow-exec
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --allow-exec
```

유효하지 않은 대상 경로 메시지로 apply가 실패하면 `openclaw secrets configure`로 플랜을 재생성하거나 대상 경로를 위의 지원되는 형태로 수정합니다.

## 관련 문서

- [시크릿 관리](/gateway/secrets)
- [CLI `secrets`](/cli/secrets)
- [SecretRef 자격 증명 표면](/reference/secretref-credential-surface)
- [구성 참조](/gateway/configuration-reference)
