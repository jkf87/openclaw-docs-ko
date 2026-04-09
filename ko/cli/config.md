---
summary: "`openclaw config`에 대한 CLI 참조 (get/set/unset/file/schema/validate)"
read_when:
  - 비대화형으로 구성을 읽거나 편집하려는 경우
title: "config"
---

# `openclaw config`

`openclaw.json`의 비대화형 편집을 위한 구성 도우미: 경로로 값 get/set/unset/file/schema/validate 및 활성 구성 파일 출력. 하위 명령 없이 실행하면 구성 마법사를 엽니다 (`openclaw configure`와 동일).

루트 옵션:

- `--section <section>`: 하위 명령 없이 `openclaw config`를 실행할 때 반복 가능한 안내 설정 섹션 필터

지원되는 안내 섹션:

- `workspace`
- `model`
- `web`
- `gateway`
- `daemon`
- `channels`
- `plugins`
- `skills`
- `health`

## 예시

```bash
openclaw config file
openclaw config --section model
openclaw config --section gateway --section daemon
openclaw config schema
openclaw config get browser.executablePath
openclaw config set browser.executablePath "/usr/bin/google-chrome"
openclaw config set agents.defaults.heartbeat.every "2h"
openclaw config set agents.list[0].tools.exec.node "node-id-or-name"
openclaw config set channels.discord.token --ref-provider default --ref-source env --ref-id DISCORD_BOT_TOKEN
openclaw config set secrets.providers.vaultfile --provider-source file --provider-path /etc/openclaw/secrets.json --provider-mode json
openclaw config unset plugins.entries.brave.config.webSearch.apiKey
openclaw config set channels.discord.token --ref-provider default --ref-source env --ref-id DISCORD_BOT_TOKEN --dry-run
openclaw config validate
openclaw config validate --json
```

### `config schema`

`openclaw.json`에 대한 생성된 JSON 스키마를 JSON으로 stdout에 출력합니다.

포함 내용:

- 현재 루트 구성 스키마와 에디터 툴링을 위한 루트 `$schema` 문자열 필드
- Control UI에서 사용하는 필드 `title` 및 `description` 문서 메타데이터
- 중첩된 객체, 와일드카드 (`*`), 배열 항목 (`[]`) 노드는 일치하는 필드 문서가 존재하는 경우 동일한 `title` / `description` 메타데이터를 상속
- `anyOf` / `oneOf` / `allOf` 분기는 일치하는 필드 문서가 존재하는 경우 동일한 문서 메타데이터를 상속
- 런타임 매니페스트를 로드할 수 있는 경우 최선의 라이브 플러그인 + 채널 스키마 메타데이터
- 현재 구성이 유효하지 않은 경우에도 깔끔한 폴백 스키마

관련 런타임 RPC:

- `config.schema.lookup`은 정규화된 하나의 구성 경로를 얕은 스키마 노드 (`title`, `description`, `type`, `enum`, `const`, 일반 범위), 일치하는 UI 힌트 메타데이터, 즉시 하위 요약과 함께 반환합니다. Control UI 또는 사용자 정의 클라이언트에서 경로 범위 드릴다운에 사용하세요.

```bash
openclaw config schema
```

다른 도구로 검사하거나 검증하려면 파일로 파이프하세요:

```bash
openclaw config schema > openclaw.schema.json
```

### 경로

경로는 점 또는 괄호 표기법을 사용합니다:

```bash
openclaw config get agents.defaults.workspace
openclaw config get agents.list[0].id
```

에이전트 목록 인덱스를 사용하여 특정 에이전트를 대상으로 지정하세요:

```bash
openclaw config get agents.list
openclaw config set agents.list[1].tools.exec.node "node-id-or-name"
```

## 값

값은 가능하면 JSON5로 파싱됩니다. 그렇지 않으면 문자열로 처리됩니다. JSON5 파싱을 요구하려면 `--strict-json`을 사용하세요. `--json`은 레거시 별칭으로 계속 지원됩니다.

```bash
openclaw config set agents.defaults.heartbeat.every "0m"
openclaw config set gateway.port 19001 --strict-json
openclaw config set channels.whatsapp.groups '["*"]' --strict-json
```

`config get <path> --json`은 터미널 형식이 아닌 JSON으로 원시 값을 출력합니다.

## `config set` 모드

`openclaw config set`은 네 가지 할당 스타일을 지원합니다:

1. 값 모드: `openclaw config set <path> <value>`
2. SecretRef 빌더 모드:

```bash
openclaw config set channels.discord.token \
  --ref-provider default \
  --ref-source env \
  --ref-id DISCORD_BOT_TOKEN
```

3. 프로바이더 빌더 모드 (`secrets.providers.<alias>` 경로만):

```bash
openclaw config set secrets.providers.vault \
  --provider-source exec \
  --provider-command /usr/local/bin/openclaw-vault \
  --provider-arg read \
  --provider-arg openai/api-key \
  --provider-timeout-ms 5000
```

4. 배치 모드 (`--batch-json` 또는 `--batch-file`):

```bash
openclaw config set --batch-json '[
  {
    "path": "secrets.providers.default",
    "provider": { "source": "env" }
  },
  {
    "path": "channels.discord.token",
    "ref": { "source": "env", "provider": "default", "id": "DISCORD_BOT_TOKEN" }
  }
]'
```

```bash
openclaw config set --batch-file ./config-set.batch.json --dry-run
```

정책 참고사항:

- SecretRef 할당은 지원되지 않는 런타임 변경 가능 표면 (예: `hooks.token`, `commands.ownerDisplaySecret`, Discord 스레드 바인딩 웹훅 토큰, WhatsApp 자격 증명 JSON)에서 거부됩니다. [SecretRef 자격 증명 표면](/reference/secretref-credential-surface)을 참조하세요.

배치 파싱은 항상 배치 페이로드 (`--batch-json`/`--batch-file`)를 신뢰의 소스로 사용합니다. `--strict-json` / `--json`은 배치 파싱 동작을 변경하지 않습니다.

JSON 경로/값 모드는 SecretRef와 프로바이더 모두에 대해 계속 지원됩니다:

```bash
openclaw config set channels.discord.token \
  '{"source":"env","provider":"default","id":"DISCORD_BOT_TOKEN"}' \
  --strict-json

openclaw config set secrets.providers.vaultfile \
  '{"source":"file","path":"/etc/openclaw/secrets.json","mode":"json"}' \
  --strict-json
```

## 프로바이더 빌더 플래그

프로바이더 빌더 대상은 `secrets.providers.<alias>`를 경로로 사용해야 합니다.

공통 플래그:

- `--provider-source <env|file|exec>`
- `--provider-timeout-ms <ms>` (`file`, `exec`)

Env 프로바이더 (`--provider-source env`):

- `--provider-allowlist <ENV_VAR>` (반복 가능)

파일 프로바이더 (`--provider-source file`):

- `--provider-path <path>` (필수)
- `--provider-mode <singleValue|json>`
- `--provider-max-bytes <bytes>`

Exec 프로바이더 (`--provider-source exec`):

- `--provider-command <path>` (필수)
- `--provider-arg <arg>` (반복 가능)
- `--provider-no-output-timeout-ms <ms>`
- `--provider-max-output-bytes <bytes>`
- `--provider-json-only`
- `--provider-env <KEY=VALUE>` (반복 가능)
- `--provider-pass-env <ENV_VAR>` (반복 가능)
- `--provider-trusted-dir <path>` (반복 가능)
- `--provider-allow-insecure-path`
- `--provider-allow-symlink-command`

강화된 exec 프로바이더 예시:

```bash
openclaw config set secrets.providers.vault \
  --provider-source exec \
  --provider-command /usr/local/bin/openclaw-vault \
  --provider-arg read \
  --provider-arg openai/api-key \
  --provider-json-only \
  --provider-pass-env VAULT_TOKEN \
  --provider-trusted-dir /usr/local/bin \
  --provider-timeout-ms 5000
```

## 드라이 런

`openclaw.json`을 작성하지 않고 변경사항을 검증하려면 `--dry-run`을 사용하세요.

```bash
openclaw config set channels.discord.token \
  --ref-provider default \
  --ref-source env \
  --ref-id DISCORD_BOT_TOKEN \
  --dry-run

openclaw config set channels.discord.token \
  --ref-provider default \
  --ref-source env \
  --ref-id DISCORD_BOT_TOKEN \
  --dry-run \
  --json

openclaw config set channels.discord.token \
  --ref-provider vault \
  --ref-source exec \
  --ref-id discord/token \
  --dry-run \
  --allow-exec
```

드라이 런 동작:

- 빌더 모드: 변경된 ref/프로바이더에 대한 SecretRef 확인 가능성 검사를 실행합니다.
- JSON 모드 (`--strict-json`, `--json`, 또는 배치 모드): 스키마 검증과 SecretRef 확인 가능성 검사를 실행합니다.
- 정책 검증도 알려진 지원되지 않는 SecretRef 대상 표면에 대해 실행됩니다.
- 정책 검사는 전체 변경 후 구성을 평가하므로 상위 객체 쓰기 (예: 객체로 `hooks` 설정)가 지원되지 않는 표면 검증을 우회할 수 없습니다.
- 명령 부작용을 방지하기 위해 Exec SecretRef 검사는 드라이 런 중에 기본적으로 건너뜁니다.
- exec SecretRef 검사를 옵트인하려면 `--dry-run`과 함께 `--allow-exec`를 사용하세요 (이 경우 프로바이더 명령이 실행될 수 있습니다).
- `--allow-exec`는 드라이 런 전용이며 `--dry-run` 없이 사용하면 오류가 발생합니다.

`--dry-run --json`은 기계 판독 가능한 보고서를 출력합니다:

- `ok`: 드라이 런 통과 여부
- `operations`: 평가된 할당 수
- `checks`: 스키마/확인 가능성 검사 실행 여부
- `checks.resolvabilityComplete`: 확인 가능성 검사가 완료까지 실행되었는지 여부 (exec ref가 건너뛰어진 경우 false)
- `refsChecked`: 드라이 런 중 실제로 확인된 ref 수
- `skippedExecRefs`: `--allow-exec`가 설정되지 않아 건너뛰어진 exec ref 수
- `errors`: `ok=false`인 경우 구조화된 스키마/확인 가능성 실패

### JSON 출력 형태

```json5
{
  ok: boolean,
  operations: number,
  configPath: string,
  inputModes: ["value" | "json" | "builder", ...],
  checks: {
    schema: boolean,
    resolvability: boolean,
    resolvabilityComplete: boolean,
  },
  refsChecked: number,
  skippedExecRefs: number,
  errors?: [
    {
      kind: "schema" | "resolvability",
      message: string,
      ref?: string, // 확인 가능성 오류의 경우 존재
    },
  ],
}
```

성공 예시:

```json
{
  "ok": true,
  "operations": 1,
  "configPath": "~/.openclaw/openclaw.json",
  "inputModes": ["builder"],
  "checks": {
    "schema": false,
    "resolvability": true,
    "resolvabilityComplete": true
  },
  "refsChecked": 1,
  "skippedExecRefs": 0
}
```

실패 예시:

```json
{
  "ok": false,
  "operations": 1,
  "configPath": "~/.openclaw/openclaw.json",
  "inputModes": ["builder"],
  "checks": {
    "schema": false,
    "resolvability": true,
    "resolvabilityComplete": true
  },
  "refsChecked": 1,
  "skippedExecRefs": 0,
  "errors": [
    {
      "kind": "resolvability",
      "message": "Error: Environment variable \"MISSING_TEST_SECRET\" is not set.",
      "ref": "env:default:MISSING_TEST_SECRET"
    }
  ]
}
```

드라이 런 실패 시:

- `config schema validation failed`: 변경 후 구성 형태가 유효하지 않습니다. 경로/값 또는 프로바이더/ref 객체 형태를 수정하세요.
- `Config policy validation failed: unsupported SecretRef usage`: 해당 자격 증명을 일반 텍스트/문자열 입력으로 되돌리고 SecretRef는 지원되는 표면에만 유지하세요.
- `SecretRef assignment(s) could not be resolved`: 참조된 프로바이더/ref가 현재 확인할 수 없습니다 (누락된 환경 변수, 잘못된 파일 포인터, exec 프로바이더 실패, 또는 프로바이더/소스 불일치).
- `Dry run note: skipped <n> exec SecretRef resolvability check(s)`: 드라이 런이 exec ref를 건너뛰었습니다. exec 확인 가능성 검증이 필요하면 `--allow-exec`로 다시 실행하세요.
- 배치 모드의 경우 실패한 항목을 수정하고 작성하기 전에 `--dry-run`을 다시 실행하세요.

## 하위 명령

- `config file`: 활성 구성 파일 경로 출력 (`OPENCLAW_CONFIG_PATH`에서 또는 기본 위치에서 확인).

편집 후 게이트웨이를 재시작하세요.

## 검증

게이트웨이를 시작하지 않고 현재 구성을 활성 스키마에 대해 검증합니다.

```bash
openclaw config validate
openclaw config validate --json
```
