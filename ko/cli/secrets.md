---
summary: "`openclaw secrets`에 대한 CLI 참조 (reload, audit, configure, apply)"
read_when:
  - 런타임에서 비밀 참조를 재확인하는 경우
  - 일반 텍스트 잔여물과 확인되지 않은 참조를 감사하는 경우
  - SecretRef를 구성하고 단방향 스크럽 변경 사항을 적용하는 경우
title: "secrets"
---

# `openclaw secrets`

`openclaw secrets`를 사용하여 SecretRef를 관리하고 활성 런타임 스냅샷을 건강하게 유지하세요.

명령 역할:

- `reload`: SecretRef를 재확인하고 전체 성공 시에만 런타임 스냅샷을 교체하는 게이트웨이 RPC (`secrets.reload`) (구성 쓰기 없음).
- `audit`: 구성/인증/생성된 모델 저장소 및 레거시 잔여물에서 일반 텍스트, 확인되지 않은 참조, 우선순위 드리프트에 대한 읽기 전용 스캔 (`--allow-exec`이 설정되지 않으면 exec 참조는 건너뜀).
- `configure`: 프로바이더 설정, 대상 매핑, 사전 검사를 위한 인터랙티브 플래너 (TTY 필요).
- `apply`: 저장된 플랜 실행 (`--dry-run`으로 유효성 검사만; 드라이 런은 기본적으로 exec 확인을 건너뛰며, 쓰기 모드는 `--allow-exec`이 설정되지 않으면 exec 포함 플랜을 거부), 그런 다음 대상 일반 텍스트 잔여물을 스크럽.

권장 운영자 루프:

```bash
openclaw secrets audit --check
openclaw secrets configure
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --dry-run
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json
openclaw secrets audit --check
openclaw secrets reload
```

플랜에 `exec` SecretRef/프로바이더가 포함된 경우 드라이 런과 쓰기 적용 명령 모두에 `--allow-exec`를 전달하세요.

CI/게이트에 대한 종료 코드 참고:

- `audit --check`는 발견 시 `1`을 반환합니다.
- 확인되지 않은 참조는 `2`를 반환합니다.

관련:

- 비밀 가이드: [비밀 관리](/gateway/secrets)
- 자격 증명 표면: [SecretRef 자격 증명 표면](/reference/secretref-credential-surface)
- 보안 가이드: [보안](/gateway/security/)

## 런타임 스냅샷 재로드

비밀 참조를 재확인하고 런타임 스냅샷을 원자적으로 교체합니다.

```bash
openclaw secrets reload
openclaw secrets reload --json
openclaw secrets reload --url ws://127.0.0.1:18789 --token <token>
```

참고사항:

- 게이트웨이 RPC 메서드 `secrets.reload`를 사용합니다.
- 확인이 실패하면 게이트웨이는 마지막으로 알려진 좋은 스냅샷을 유지하고 오류를 반환합니다 (부분 활성화 없음).
- JSON 응답에는 `warningCount`가 포함됩니다.

옵션:

- `--url <url>`
- `--token <token>`
- `--timeout <ms>`
- `--json`

## 감사

다음에 대해 OpenClaw 상태를 스캔합니다:

- 일반 텍스트 비밀 저장
- 확인되지 않은 참조
- 우선순위 드리프트 (`auth-profiles.json` 자격 증명이 `openclaw.json` 참조를 가리는 경우)
- 생성된 `agents/*/agent/models.json` 잔여물 (프로바이더 `apiKey` 값 및 민감한 프로바이더 헤더)
- 레거시 잔여물 (레거시 인증 저장소 항목, OAuth 알림)

헤더 잔여물 참고:

- 민감한 프로바이더 헤더 감지는 이름 휴리스틱 기반입니다 (`authorization`, `x-api-key`, `token`, `secret`, `password`, `credential` 같은 일반적인 인증/자격 증명 헤더 이름 및 조각).

```bash
openclaw secrets audit
openclaw secrets audit --check
openclaw secrets audit --json
openclaw secrets audit --allow-exec
```

종료 동작:

- `--check`는 발견 시 0이 아닌 코드로 종료합니다.
- 확인되지 않은 참조는 더 높은 우선순위의 0이 아닌 코드로 종료합니다.

보고서 형태 하이라이트:

- `status`: `clean | findings | unresolved`
- `resolution`: `refsChecked`, `skippedExecRefs`, `resolvabilityComplete`
- `summary`: `plaintextCount`, `unresolvedRefCount`, `shadowedRefCount`, `legacyResidueCount`
- 발견 코드:
  - `PLAINTEXT_FOUND`
  - `REF_UNRESOLVED`
  - `REF_SHADOWED`
  - `LEGACY_RESIDUE`

## 구성 (인터랙티브 도우미)

인터랙티브로 프로바이더 및 SecretRef 변경 사항을 빌드하고, 사전 검사를 실행하고, 선택적으로 적용합니다:

```bash
openclaw secrets configure
openclaw secrets configure --plan-out /tmp/openclaw-secrets-plan.json
openclaw secrets configure --apply --yes
openclaw secrets configure --providers-only
openclaw secrets configure --skip-provider-setup
openclaw secrets configure --agent ops
openclaw secrets configure --json
```

흐름:

- 먼저 프로바이더 설정 (`secrets.providers` 별칭에 대한 `add/edit/remove`).
- 그런 다음 자격 증명 매핑 (필드 선택 및 `{source, provider, id}` 참조 할당).
- 마지막으로 사전 검사 및 선택적 적용.

플래그:

- `--providers-only`: `secrets.providers`만 구성, 자격 증명 매핑 건너뜀.
- `--skip-provider-setup`: 프로바이더 설정 건너뛰고 기존 프로바이더에 자격 증명 매핑.
- `--agent <id>`: `auth-profiles.json` 대상 검색 및 쓰기를 하나의 에이전트 저장소로 범위 지정.
- `--allow-exec`: 사전 검사/적용 중 exec SecretRef 확인 허용 (프로바이더 명령을 실행할 수 있음).

참고사항:

- 인터랙티브 TTY가 필요합니다.
- `--providers-only`와 `--skip-provider-setup`을 결합할 수 없습니다.
- `configure`는 선택한 에이전트 범위에 대한 `openclaw.json`과 `auth-profiles.json`의 비밀 관련 필드를 대상으로 합니다.
- `configure`는 선택기 흐름에서 새 `auth-profiles.json` 매핑 생성을 직접 지원합니다.
- 정규 지원 표면: [SecretRef 자격 증명 표면](/reference/secretref-credential-surface).
- 적용 전에 사전 검사 확인을 수행합니다.
- 사전 검사/적용에 exec 참조가 포함된 경우 두 단계 모두에 `--allow-exec`를 설정하세요.
- 생성된 플랜은 기본적으로 스크럽 옵션으로 설정됩니다 (`scrubEnv`, `scrubAuthProfilesForProviderTargets`, `scrubLegacyAuthJson` 모두 활성화).
- 적용 경로는 스크럽된 일반 텍스트 값에 대해 단방향입니다.
- `--apply` 없이 CLI는 사전 검사 후에도 `지금 이 플랜을 적용하시겠습니까?`를 프롬프트합니다.
- `--apply`를 사용하면 (그리고 `--yes` 없이) CLI는 추가적인 되돌릴 수 없는 확인을 프롬프트합니다.
- `--json`은 플랜 + 사전 검사 보고서를 출력하지만 명령은 여전히 인터랙티브 TTY가 필요합니다.

Exec 프로바이더 안전 참고:

- Homebrew 설치는 종종 `/opt/homebrew/bin/*` 아래에 심볼릭 링크된 바이너리를 노출합니다.
- 신뢰할 수 있는 패키지 관리자 경로에 필요한 경우에만 `allowSymlinkCommand: true`를 설정하고, `trustedDirs`와 함께 사용하세요 (예: `["/opt/homebrew"]`).
- Windows에서 프로바이더 경로에 대한 ACL 확인을 사용할 수 없는 경우 OpenClaw는 실패합니다. 신뢰할 수 있는 경로에 한해 해당 프로바이더에서 `allowInsecurePath: true`를 설정하여 경로 보안 확인을 우회하세요.

## 저장된 플랜 적용

이전에 생성된 플랜을 적용하거나 사전 검사합니다:

```bash
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --allow-exec
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --dry-run
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --dry-run --allow-exec
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --json
```

Exec 동작:

- `--dry-run`은 파일을 쓰지 않고 사전 검사를 유효성 검사합니다.
- exec SecretRef 확인은 드라이 런에서 기본적으로 건너뜁니다.
- 쓰기 모드는 `--allow-exec`이 설정되지 않으면 exec SecretRef/프로바이더를 포함하는 플랜을 거부합니다.
- `--allow-exec`를 사용하여 어느 모드에서든 exec 프로바이더 확인/실행에 옵트인하세요.

플랜 계약 세부 사항 (허용된 대상 경로, 유효성 검사 규칙, 실패 의미):

- [비밀 적용 플랜 계약](/gateway/secrets-plan-contract)

`apply`가 업데이트할 수 있는 항목:

- `openclaw.json` (SecretRef 대상 + 프로바이더 추가/삭제)
- `auth-profiles.json` (프로바이더 대상 스크러빙)
- 레거시 `auth.json` 잔여물
- `~/.openclaw/.env` 마이그레이션된 값의 알려진 비밀 키

## 롤백 백업이 없는 이유

`secrets apply`는 의도적으로 이전 일반 텍스트 값을 포함하는 롤백 백업을 쓰지 않습니다.

안전성은 엄격한 사전 검사 + 실패 시 최선의 메모리 내 복원을 통한 원자적 적용에서 비롯됩니다.

## 예시

```bash
openclaw secrets audit --check
openclaw secrets configure
openclaw secrets audit --check
```

`audit --check`가 여전히 일반 텍스트 발견을 보고하면 나머지 보고된 대상 경로를 업데이트하고 감사를 다시 실행하세요.
