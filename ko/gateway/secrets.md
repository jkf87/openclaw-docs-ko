---
summary: "시크릿 관리: SecretRef 계약, 런타임 스냅샷 동작, 안전한 단방향 스크럽"
read_when:
  - 프로바이더 자격 증명 및 `auth-profiles.json` ref에 대한 SecretRef 구성 시
  - 프로덕션에서 시크릿 리로드, 감사, 구성, apply를 안전하게 운영할 때
  - 시작 시 빠른 실패, 비활성 표면 필터링, 마지막으로 알려진 양호한 동작 이해 시
title: "시크릿 관리"
---

# 시크릿 관리

OpenClaw는 지원되는 자격 증명을 구성에 일반 텍스트로 저장할 필요 없도록 additive SecretRef를 지원합니다.

일반 텍스트도 여전히 작동합니다. SecretRef는 자격 증명별로 선택 사항입니다.

## 목표 및 런타임 모델

시크릿은 인메모리 런타임 스냅샷으로 해결됩니다.

- 해결은 요청 경로에서 지연되지 않고 활성화 중에 즉시 수행됩니다.
- 효과적으로 활성화된 SecretRef를 해결할 수 없는 경우 시작 시 빠르게 실패합니다.
- 리로드는 원자적 스왑을 사용합니다: 완전 성공 또는 마지막으로 알려진 양호한 스냅샷을 유지합니다.
- SecretRef 정책 위반(예: SecretRef 입력과 결합된 OAuth 모드 인증 프로필)은 런타임 스왑 전에 활성화를 실패시킵니다.
- 런타임 요청은 활성 인메모리 스냅샷에서만 읽습니다.
- 첫 번째 성공적인 구성 활성화/로드 후 런타임 코드 경로는 성공적인 리로드가 스냅샷을 교체할 때까지 해당 활성 인메모리 스냅샷을 계속 읽습니다.
- 아웃바운드 전송 경로도 해당 활성 스냅샷에서 읽습니다(예: Discord 회신/스레드 전송 및 Telegram 작업 전송). 각 전송 시 SecretRef를 재해결하지 않습니다.

이렇게 하면 시크릿 프로바이더 중단이 핫 요청 경로에서 제외됩니다.

## 활성 표면 필터링

SecretRef는 효과적으로 활성화된 표면에서만 유효성이 검사됩니다.

- 활성화된 표면: 해결되지 않은 ref는 시작/리로드를 차단합니다.
- 비활성 표면: 해결되지 않은 ref는 시작/리로드를 차단하지 않습니다.
- 비활성 ref는 코드 `SECRETS_REF_IGNORED_INACTIVE_SURFACE`로 비치명적 진단을 내보냅니다.

비활성 표면의 예:

- 비활성화된 채널/계정 항목.
- 활성화된 계정이 상속하지 않는 최상위 채널 자격 증명.
- 비활성화된 도구/기능 표면.
- `tools.web.search.provider`에 의해 선택되지 않은 웹 검색 프로바이더별 키.
  자동 모드(프로바이더 미설정)에서는 프로바이더 자동 감지를 위해 우선순위에 따라 키가 참조됩니다.
  선택 후 선택되지 않은 프로바이더 키는 선택될 때까지 비활성으로 처리됩니다.
- 샌드박스 SSH 인증 자료(`agents.defaults.sandbox.ssh.identityData`,
  `certificateData`, `knownHostsData`, 에이전트별 재정의 포함)는 기본 에이전트 또는 활성화된 에이전트의 효과적인 샌드박스 백엔드가 `ssh`인 경우에만 활성화됩니다.
- `gateway.remote.token` / `gateway.remote.password` SecretRef는 다음 중 하나가 참인 경우 활성화됩니다:
  - `gateway.mode=remote`
  - `gateway.remote.url`이 구성됨
  - `gateway.tailscale.mode`가 `serve` 또는 `funnel`
  - 해당 원격 표면이 없는 로컬 모드에서:
    - `gateway.remote.token`은 토큰 인증이 이길 수 있고 env/인증 토큰이 구성되지 않은 경우 활성화됩니다.
    - `gateway.remote.password`는 비밀번호 인증이 이길 수 있고 env/인증 비밀번호가 구성되지 않은 경우에만 활성화됩니다.
- `gateway.auth.token` SecretRef는 `OPENCLAW_GATEWAY_TOKEN`이 설정된 경우 시작 인증 해결에 비활성입니다. env 토큰 입력이 해당 런타임에서 이기기 때문입니다.

## 게이트웨이 인증 표면 진단

`gateway.auth.token`, `gateway.auth.password`, `gateway.remote.token`, 또는 `gateway.remote.password`에 SecretRef가 구성된 경우 게이트웨이 시작/리로드는 표면 상태를 명시적으로 기록합니다:

- `active`: SecretRef는 효과적인 인증 표면의 일부이며 해결되어야 합니다.
- `inactive`: SecretRef는 다른 인증 표면이 이기거나 원격 인증이 비활성화/비활성 상태이므로 이 런타임에서 무시됩니다.

이러한 항목은 `SECRETS_GATEWAY_AUTH_SURFACE`로 기록되며 활성 표면 정책에서 사용한 이유가 포함되어 자격 증명이 활성 또는 비활성으로 처리된 이유를 확인할 수 있습니다.

## 온보딩 참조 사전 비행

온보딩이 대화형 모드로 실행되고 SecretRef 저장소를 선택하면 OpenClaw는 저장 전에 사전 비행 유효성 검사를 실행합니다:

- Env ref: env 변수 이름의 유효성을 검사하고 설정 중에 비어 있지 않은 값이 표시되는지 확인합니다.
- 프로바이더 ref(`file` 또는 `exec`): 프로바이더 선택을 유효성 검사하고 `id`를 해결하며 해결된 값 유형을 확인합니다.
- 빠른 시작 재사용 경로: `gateway.auth.token`이 이미 SecretRef인 경우 온보딩은 동일한 빠른 실패 게이트를 사용하여 프로브/대시보드 부트스트랩 전에 해결합니다(`env`, `file`, `exec` ref).

유효성 검사가 실패하면 온보딩은 오류를 표시하고 재시도할 수 있게 합니다.

## SecretRef 계약

모든 곳에서 하나의 객체 형태를 사용합니다:

```json5
{ source: "env" | "file" | "exec", provider: "default", id: "..." }
```

### `source: "env"`

```json5
{ source: "env", provider: "default", id: "OPENAI_API_KEY" }
```

유효성 검사:

- `provider`는 `^[a-z][a-z0-9_-]{0,63}$`와 일치해야 합니다
- `id`는 `^[A-Z][A-Z0-9_]{0,127}$`와 일치해야 합니다

### `source: "file"`

```json5
{ source: "file", provider: "filemain", id: "/providers/openai/apiKey" }
```

유효성 검사:

- `provider`는 `^[a-z][a-z0-9_-]{0,63}$`와 일치해야 합니다
- `id`는 절대 JSON 포인터(`/...`)여야 합니다
- 세그먼트에서 RFC6901 이스케이핑: `~` => `~0`, `/` => `~1`

### `source: "exec"`

```json5
{ source: "exec", provider: "vault", id: "providers/openai/apiKey" }
```

유효성 검사:

- `provider`는 `^[a-z][a-z0-9_-]{0,63}$`와 일치해야 합니다
- `id`는 `^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$`와 일치해야 합니다
- `id`는 슬래시로 구분된 경로 세그먼트로 `.` 또는 `..`을 포함하면 안 됩니다 (예: `a/../b`는 거부됨)

## 프로바이더 구성

`secrets.providers` 아래에 프로바이더를 정의합니다:

```json5
{
  secrets: {
    providers: {
      default: { source: "env" },
      filemain: {
        source: "file",
        path: "~/.openclaw/secrets.json",
        mode: "json", // 또는 "singleValue"
      },
      vault: {
        source: "exec",
        command: "/usr/local/bin/openclaw-vault-resolver",
        args: ["--profile", "prod"],
        passEnv: ["PATH", "VAULT_ADDR"],
        jsonOnly: true,
      },
    },
    defaults: {
      env: "default",
      file: "filemain",
      exec: "vault",
    },
    resolution: {
      maxProviderConcurrency: 4,
      maxRefsPerProvider: 512,
      maxBatchBytes: 262144,
    },
  },
}
```

### Env 프로바이더

- `allowlist`를 통한 선택적 허용 목록.
- 누락/빈 env 값은 해결에 실패합니다.

### File 프로바이더

- `path`에서 로컬 파일을 읽습니다.
- `mode: "json"`은 JSON 객체 페이로드를 기대하고 `id`를 포인터로 해결합니다.
- `mode: "singleValue"`는 ref id `"value"`를 기대하고 파일 내용을 반환합니다.
- 경로는 소유권/권한 검사를 통과해야 합니다.
- Windows 페일-클로즈 참고: 경로에 대한 ACL 확인이 불가능한 경우 해결이 실패합니다. 신뢰할 수 있는 경로에 한해 경로 보안 검사를 우회하려면 해당 프로바이더에 `allowInsecurePath: true`를 설정합니다.

### Exec 프로바이더

- 구성된 절대 바이너리 경로를 실행하며 셸을 사용하지 않습니다.
- 기본적으로 `command`는 일반 파일을 가리켜야 합니다(심볼릭 링크 아님).
- 심볼릭 링크 명령 경로를 허용하려면(예: Homebrew 심) `allowSymlinkCommand: true`를 설정합니다. OpenClaw는 해결된 대상 경로를 유효성 검사합니다.
- 패키지 관리자 경로(예: `["/opt/homebrew"]`)에는 `allowSymlinkCommand`와 `trustedDirs`를 함께 사용합니다.
- 타임아웃, 출력 없는 타임아웃, 출력 바이트 제한, env 허용 목록, 신뢰할 수 있는 디렉터리를 지원합니다.
- Windows 페일-클로즈 참고: 명령 경로에 대한 ACL 확인이 불가능한 경우 해결이 실패합니다. 신뢰할 수 있는 경로에 한해 경로 보안 검사를 우회하려면 해당 프로바이더에 `allowInsecurePath: true`를 설정합니다.

요청 페이로드(stdin):

```json
{ "protocolVersion": 1, "provider": "vault", "ids": ["providers/openai/apiKey"] }
```

응답 페이로드(stdout):

```jsonc
{ "protocolVersion": 1, "values": { "providers/openai/apiKey": "<openai-api-key>" } } // pragma: allowlist secret
```

id별 선택적 오류:

```json
{
  "protocolVersion": 1,
  "values": {},
  "errors": { "providers/openai/apiKey": { "message": "not found" } }
}
```

## Exec 통합 예제

### 1Password CLI

```json5
{
  secrets: {
    providers: {
      onepassword_openai: {
        source: "exec",
        command: "/opt/homebrew/bin/op",
        allowSymlinkCommand: true, // Homebrew 심볼릭 링크 바이너리에 필요
        trustedDirs: ["/opt/homebrew"],
        args: ["read", "op://Personal/OpenClaw QA API Key/password"],
        passEnv: ["HOME"],
        jsonOnly: false,
      },
    },
  },
  models: {
    providers: {
      openai: {
        baseUrl: "https://api.openai.com/v1",
        models: [{ id: "gpt-5", name: "gpt-5" }],
        apiKey: { source: "exec", provider: "onepassword_openai", id: "value" },
      },
    },
  },
}
```

### HashiCorp Vault CLI

```json5
{
  secrets: {
    providers: {
      vault_openai: {
        source: "exec",
        command: "/opt/homebrew/bin/vault",
        allowSymlinkCommand: true, // Homebrew 심볼릭 링크 바이너리에 필요
        trustedDirs: ["/opt/homebrew"],
        args: ["kv", "get", "-field=OPENAI_API_KEY", "secret/openclaw"],
        passEnv: ["VAULT_ADDR", "VAULT_TOKEN"],
        jsonOnly: false,
      },
    },
  },
  models: {
    providers: {
      openai: {
        baseUrl: "https://api.openai.com/v1",
        models: [{ id: "gpt-5", name: "gpt-5" }],
        apiKey: { source: "exec", provider: "vault_openai", id: "value" },
      },
    },
  },
}
```

### `sops`

```json5
{
  secrets: {
    providers: {
      sops_openai: {
        source: "exec",
        command: "/opt/homebrew/bin/sops",
        allowSymlinkCommand: true, // Homebrew 심볼릭 링크 바이너리에 필요
        trustedDirs: ["/opt/homebrew"],
        args: ["-d", "--extract", '["providers"]["openai"]["apiKey"]', "/path/to/secrets.enc.json"],
        passEnv: ["SOPS_AGE_KEY_FILE"],
        jsonOnly: false,
      },
    },
  },
  models: {
    providers: {
      openai: {
        baseUrl: "https://api.openai.com/v1",
        models: [{ id: "gpt-5", name: "gpt-5" }],
        apiKey: { source: "exec", provider: "sops_openai", id: "value" },
      },
    },
  },
}
```

## MCP 서버 환경 변수

`plugins.entries.acpx.config.mcpServers`를 통해 구성된 MCP 서버 env 변수는 SecretInput을 지원합니다. 이렇게 하면 API 키와 토큰을 일반 텍스트 구성에서 제외할 수 있습니다:

```json5
{
  plugins: {
    entries: {
      acpx: {
        enabled: true,
        config: {
          mcpServers: {
            github: {
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-github"],
              env: {
                GITHUB_PERSONAL_ACCESS_TOKEN: {
                  source: "env",
                  provider: "default",
                  id: "MCP_GITHUB_PAT",
                },
              },
            },
          },
        },
      },
    },
  },
}
```

일반 텍스트 문자열 값도 여전히 작동합니다. `${MCP_SERVER_API_KEY}`와 같은 env 템플릿 ref 및 SecretRef 객체는 MCP 서버 프로세스가 생성되기 전에 게이트웨이 활성화 중에 해결됩니다. 다른 SecretRef 표면과 마찬가지로 해결되지 않은 ref는 `acpx` 플러그인이 효과적으로 활성화된 경우에만 활성화를 차단합니다.

## 샌드박스 SSH 인증 자료

코어 `ssh` 샌드박스 백엔드도 SSH 인증 자료에 대한 SecretRef를 지원합니다:

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        backend: "ssh",
        ssh: {
          target: "user@gateway-host:22",
          identityData: { source: "env", provider: "default", id: "SSH_IDENTITY" },
          certificateData: { source: "env", provider: "default", id: "SSH_CERTIFICATE" },
          knownHostsData: { source: "env", provider: "default", id: "SSH_KNOWN_HOSTS" },
        },
      },
    },
  },
}
```

런타임 동작:

- OpenClaw는 각 SSH 호출 시 지연이 아닌 샌드박스 활성화 중에 이러한 ref를 해결합니다.
- 해결된 값은 제한적인 권한이 있는 임시 파일에 작성되고 생성된 SSH 구성에 사용됩니다.
- 효과적인 샌드박스 백엔드가 `ssh`가 아닌 경우 이러한 ref는 비활성 상태로 유지되고 시작을 차단하지 않습니다.

## 지원되는 자격 증명 표면

정식 지원 및 미지원 자격 증명은 다음에 나열됩니다:

- [SecretRef 자격 증명 표면](/reference/secretref-credential-surface)

런타임 발행 또는 회전 자격 증명 및 OAuth 새로 고침 자료는 읽기 전용 SecretRef 해결에서 의도적으로 제외됩니다.

## 필수 동작 및 우선순위

- ref가 없는 필드: 변경 없음.
- ref가 있는 필드: 활성화 중 활성 표면에서 필수.
- 일반 텍스트와 ref가 모두 있는 경우 지원되는 우선순위 경로에서 ref가 우선합니다.
- 스크럽 센티넬 `__OPENCLAW_REDACTED__`은 내부 구성 스크럽/복원을 위해 예약되어 있으며 리터럴 제출된 구성 데이터로는 거부됩니다.

경고 및 감사 신호:

- `SECRETS_REF_OVERRIDES_PLAINTEXT` (런타임 경고)
- `REF_SHADOWED` (`auth-profiles.json` 자격 증명이 `openclaw.json` ref보다 우선하는 경우의 감사 결과)

Google Chat 호환성 동작:

- `serviceAccountRef`는 일반 텍스트 `serviceAccount`보다 우선합니다.
- 형제 ref가 설정된 경우 일반 텍스트 값은 무시됩니다.

## 활성화 트리거

시크릿 활성화는 다음에서 실행됩니다:

- 시작(사전 비행 및 최종 활성화)
- 구성 리로드 핫 적용 경로
- 구성 리로드 재시작 확인 경로
- `secrets.reload`를 통한 수동 리로드
- 게이트웨이 구성 쓰기 RPC 사전 비행(`config.set` / `config.apply` / `config.patch`): 편집을 유지하기 전에 제출된 구성 페이로드 내의 활성 표면 SecretRef 해결 가능성 확인

활성화 계약:

- 성공은 스냅샷을 원자적으로 교체합니다.
- 시작 실패는 게이트웨이 시작을 중단합니다.
- 런타임 리로드 실패는 마지막으로 알려진 양호한 스냅샷을 유지합니다.
- 쓰기 RPC 사전 비행 실패는 제출된 구성을 거부하고 디스크 구성과 활성 런타임 스냅샷을 모두 변경하지 않습니다.
- 아웃바운드 헬퍼/도구 호출에 명시적 호출당 채널 토큰을 제공해도 SecretRef 활성화가 트리거되지 않습니다. 활성화 지점은 시작, 리로드, 명시적 `secrets.reload`로 유지됩니다.

## 저하 및 복구 신호

리로드 시 활성화가 정상 상태 후 실패하면 OpenClaw는 저하된 시크릿 상태로 전환됩니다.

일회성 시스템 이벤트 및 로그 코드:

- `SECRETS_RELOADER_DEGRADED`
- `SECRETS_RELOADER_RECOVERED`

동작:

- 저하: 런타임은 마지막으로 알려진 양호한 스냅샷을 유지합니다.
- 복구: 다음 성공적인 활성화 후 한 번 내보냅니다.
- 이미 저하된 상태에서의 반복 실패는 경고를 기록하지만 이벤트를 스팸하지 않습니다.
- 시작 빠른 실패는 런타임이 활성화된 적이 없으므로 저하 이벤트를 내보내지 않습니다.

## 명령 경로 해결

명령 경로는 게이트웨이 스냅샷 RPC를 통해 지원되는 SecretRef 해결을 선택할 수 있습니다.

두 가지 광범위한 동작이 있습니다:

- 엄격한 명령 경로(예: `openclaw memory` 원격 메모리 경로 및 원격 공유 시크릿 ref가 필요한 경우 `openclaw qr --remote`)는 활성 스냅샷에서 읽고 필수 SecretRef를 사용할 수 없는 경우 빠르게 실패합니다.
- 읽기 전용 명령 경로(예: `openclaw status`, `openclaw status --all`, `openclaw channels status`, `openclaw channels resolve`, `openclaw security audit`, 읽기 전용 doctor/구성 수정 흐름)도 활성 스냅샷을 선호하지만 해당 명령 경로에서 대상 SecretRef를 사용할 수 없는 경우 중단하는 대신 저하됩니다.

읽기 전용 동작:

- 게이트웨이가 실행 중인 경우 이러한 명령은 먼저 활성 스냅샷에서 읽습니다.
- 게이트웨이 해결이 불완전하거나 게이트웨이를 사용할 수 없는 경우 특정 명령 표면에 대한 대상 로컬 폴백을 시도합니다.
- 대상 SecretRef를 여전히 사용할 수 없는 경우 명령은 저하된 읽기 전용 출력과 함께 계속 진행하며 "이 명령 경로에서 구성되었지만 사용할 수 없음"과 같은 명시적 진단을 제공합니다.
- 이 저하된 동작은 명령 로컬입니다. 런타임 시작, 리로드, 또는 전송/인증 경로를 약화시키지 않습니다.

기타 참고 사항:

- 백엔드 시크릿 교체 후 스냅샷 새로 고침은 `openclaw secrets reload`로 처리됩니다.
- 이러한 명령 경로에서 사용하는 게이트웨이 RPC 메서드: `secrets.resolve`.

## 감사 및 구성 워크플로

기본 오퍼레이터 흐름:

```bash
openclaw secrets audit --check
openclaw secrets configure
openclaw secrets audit --check
```

### `secrets audit`

결과에 포함됩니다:

- 저장된 일반 텍스트 값(`openclaw.json`, `auth-profiles.json`, `.env`, 생성된 `agents/*/agent/models.json`)
- 생성된 `models.json` 항목의 일반 텍스트 민감한 프로바이더 헤더 잔재
- 해결되지 않은 ref
- 우선순위 그림자(`auth-profiles.json`가 `openclaw.json` ref보다 우선)
- 레거시 잔재(`auth.json`, OAuth 알림)

Exec 참고:

- 기본적으로 감사는 명령 부작용을 피하기 위해 exec SecretRef 해결 가능성 검사를 건너뜁니다.
- 감사 중 exec 프로바이더를 실행하려면 `openclaw secrets audit --allow-exec`를 사용합니다.

헤더 잔재 참고:

- 민감한 프로바이더 헤더 감지는 이름 휴리스틱 기반입니다(`authorization`, `x-api-key`, `token`, `secret`, `password`, `credential` 등 일반적인 인증/자격 증명 헤더 이름 및 단편).

### `secrets configure`

다음을 수행하는 대화형 도우미:

- `secrets.providers` 먼저 구성(`env`/`file`/`exec`, 추가/편집/제거)
- `openclaw.json`의 지원되는 시크릿 보유 필드와 하나의 에이전트 범위에 대한 `auth-profiles.json`을 선택할 수 있습니다
- 대상 선택기에서 새 `auth-profiles.json` 매핑을 직접 생성할 수 있습니다
- SecretRef 세부 사항(`source`, `provider`, `id`) 캡처
- 사전 비행 해결 실행
- 즉시 적용 가능

Exec 참고:

- `--allow-exec`가 설정되지 않는 한 사전 비행은 exec SecretRef 검사를 건너뜁니다.
- `configure --apply`에서 직접 적용하고 플랜에 exec ref/프로바이더가 포함된 경우 apply 단계에서도 `--allow-exec`를 유지합니다.

유용한 모드:

- `openclaw secrets configure --providers-only`
- `openclaw secrets configure --skip-provider-setup`
- `openclaw secrets configure --agent <id>`

`configure` apply 기본값:

- 대상 프로바이더에 대해 `auth-profiles.json`에서 일치하는 정적 자격 증명을 스크럽
- `auth.json`에서 레거시 정적 `api_key` 항목을 스크럽
- `<config-dir>/.env`에서 일치하는 알려진 시크릿 라인을 스크럽

### `secrets apply`

저장된 플랜 적용:

```bash
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --allow-exec
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --dry-run
openclaw secrets apply --from /tmp/openclaw-secrets-plan.json --dry-run --allow-exec
```

Exec 참고:

- `--allow-exec`가 설정되지 않는 한 dry-run은 exec 검사를 건너뜁니다.
- 쓰기 모드는 `--allow-exec`가 설정되지 않는 한 exec SecretRef/프로바이더를 포함하는 플랜을 거부합니다.

엄격한 대상/경로 계약 세부 사항 및 정확한 거부 규칙은 다음을 참조하십시오:

- [Secrets Apply 플랜 계약](/gateway/secrets-plan-contract)

## 단방향 안전 정책

OpenClaw는 의도적으로 과거 일반 텍스트 시크릿 값을 포함하는 롤백 백업을 작성하지 않습니다.

안전 모델:

- 쓰기 모드 전에 사전 비행이 성공해야 합니다
- 런타임 활성화는 커밋 전에 유효성이 검사됩니다
- apply는 원자적 파일 교체를 사용하여 파일을 업데이트하고 실패 시 최선의 복원을 수행합니다

## 레거시 인증 호환성 참고

정적 자격 증명의 경우 런타임은 더 이상 일반 텍스트 레거시 인증 저장소에 의존하지 않습니다.

- 런타임 자격 증명 소스는 해결된 인메모리 스냅샷입니다.
- 레거시 정적 `api_key` 항목은 발견될 때 스크럽됩니다.
- OAuth 관련 호환성 동작은 별도로 유지됩니다.

## Web UI 참고

일부 SecretInput 유니온은 폼 모드보다 원시 편집기 모드에서 구성하기 더 쉽습니다.

## 관련 문서

- CLI 명령: [secrets](/cli/secrets)
- 플랜 계약 세부 사항: [Secrets Apply 플랜 계약](/gateway/secrets-plan-contract)
- 자격 증명 표면: [SecretRef 자격 증명 표면](/reference/secretref-credential-surface)
- 인증 설정: [인증](/gateway/authentication)
- 보안 자세: [보안](/gateway/security/)
- 환경 우선순위: [환경 변수](/help/environment)
