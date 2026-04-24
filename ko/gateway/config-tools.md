---
summary: "Tools 구성(정책, 실험적 토글, 프로바이더 기반 tool)과 사용자 정의 provider/base-URL 설정"
read_when:
  - `tools.*` 정책, 허용 목록, 또는 실험적 기능을 구성할 때
  - 사용자 정의 provider를 등록하거나 base URL을 재정의할 때
  - OpenAI 호환 자체 호스팅 엔드포인트를 설정할 때
title: "구성 — tools 및 사용자 정의 provider"
---

`tools.*` config 키와 사용자 정의 provider / base-URL 설정입니다. 에이전트, 채널,
기타 최상위 config 키는
[구성 레퍼런스](/gateway/configuration-reference)를 참조하십시오.

## Tools

### Tool 프로파일

`tools.profile`은 `tools.allow`/`tools.deny` 이전에 기본 허용 목록을 설정합니다:

로컬 온보딩은 설정되지 않은 경우 새 로컬 config의 기본값을 `tools.profile: "coding"`으로 지정합니다(기존의 명시적 프로파일은 보존됩니다).

| 프로파일     | 포함                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `minimal`   | `session_status`만 포함                                                                                                         |
| `coding`    | `group:fs`, `group:runtime`, `group:web`, `group:sessions`, `group:memory`, `cron`, `image`, `image_generate`, `video_generate` |
| `messaging` | `group:messaging`, `sessions_list`, `sessions_history`, `sessions_send`, `session_status`                                       |
| `full`      | 제한 없음(설정되지 않은 것과 동일)                                                                                                  |

### Tool 그룹

| 그룹              | Tools                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `group:runtime`    | `exec`, `process`, `code_execution` (`bash`는 `exec`의 별칭으로 허용됨)                                         |
| `group:fs`         | `read`, `write`, `edit`, `apply_patch`                                                                                  |
| `group:sessions`   | `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `sessions_yield`, `subagents`, `session_status` |
| `group:memory`     | `memory_search`, `memory_get`                                                                                           |
| `group:web`        | `web_search`, `x_search`, `web_fetch`                                                                                   |
| `group:ui`         | `browser`, `canvas`                                                                                                     |
| `group:automation` | `cron`, `gateway`                                                                                                       |
| `group:messaging`  | `message`                                                                                                               |
| `group:nodes`      | `nodes`                                                                                                                 |
| `group:agents`     | `agents_list`                                                                                                           |
| `group:media`      | `image`, `image_generate`, `video_generate`, `tts`                                                                      |
| `group:openclaw`   | 모든 내장 tool(프로바이더 플러그인 제외)                                                                          |

### `tools.allow` / `tools.deny`

전역 tool 허용/거부 정책(거부 우선). 대소문자 구분 없음, `*` 와일드카드 지원. Docker 샌드박스가 꺼져 있어도 적용됩니다.

```json5
{
  tools: { deny: ["browser", "canvas"] },
}
```

### `tools.byProvider`

특정 provider 또는 모델에 대해 tool을 추가로 제한합니다. 순서: 기본 프로파일 → provider 프로파일 → allow/deny.

```json5
{
  tools: {
    profile: "coding",
    byProvider: {
      "google-antigravity": { profile: "minimal" },
      "openai/gpt-5.4": { allow: ["group:fs", "sessions_list"] },
    },
  },
}
```

### `tools.elevated`

샌드박스 외부에서의 elevated exec 접근을 제어합니다:

```json5
{
  tools: {
    elevated: {
      enabled: true,
      allowFrom: {
        whatsapp: ["+15555550123"],
        discord: ["1234567890123", "987654321098765432"],
      },
    },
  },
}
```

- 에이전트별 재정의(`agents.list[].tools.elevated`)는 추가 제한만 가능합니다.
- `/elevated on|off|ask|full`은 세션별로 상태를 저장하며, 인라인 지시문은 단일 메시지에 적용됩니다.
- Elevated `exec`는 샌드박싱을 우회하고 구성된 escape 경로를 사용합니다(기본값 `gateway`, exec 대상이 `node`인 경우 `node`).

### `tools.exec`

```json5
{
  tools: {
    exec: {
      backgroundMs: 10000,
      timeoutSec: 1800,
      cleanupMs: 1800000,
      notifyOnExit: true,
      notifyOnExitEmptySuccess: false,
      applyPatch: {
        enabled: false,
        allowModels: ["gpt-5.5"],
      },
    },
  },
}
```

### `tools.loopDetection`

Tool 루프 안전 검사는 **기본적으로 비활성화**되어 있습니다. 감지를 활성화하려면 `enabled: true`로 설정하십시오.
설정은 `tools.loopDetection`에서 전역으로 정의하고 `agents.list[].tools.loopDetection`에서 에이전트별로 재정의할 수 있습니다.

```json5
{
  tools: {
    loopDetection: {
      enabled: true,
      historySize: 30,
      warningThreshold: 10,
      criticalThreshold: 20,
      globalCircuitBreakerThreshold: 30,
      detectors: {
        genericRepeat: true,
        knownPollNoProgress: true,
        pingPong: true,
      },
    },
  },
}
```

- `historySize`: 루프 분석을 위해 유지되는 최대 tool 호출 이력.
- `warningThreshold`: 경고를 위한 반복적 no-progress 패턴 임계값.
- `criticalThreshold`: 중요 루프를 차단하기 위한 더 높은 반복 임계값.
- `globalCircuitBreakerThreshold`: 모든 no-progress 실행에 대한 하드 스톱 임계값.
- `detectors.genericRepeat`: 동일 tool/동일 인자 호출 반복 시 경고.
- `detectors.knownPollNoProgress`: 알려진 polling tool(`process.poll`, `command_status` 등)에 대해 경고/차단.
- `detectors.pingPong`: 교차 no-progress 쌍 패턴에 대해 경고/차단.
- `warningThreshold >= criticalThreshold` 또는 `criticalThreshold >= globalCircuitBreakerThreshold`인 경우 유효성 검사가 실패합니다.

### `tools.web`

```json5
{
  tools: {
    web: {
      search: {
        enabled: true,
        apiKey: "brave_api_key", // or BRAVE_API_KEY env
        maxResults: 5,
        timeoutSeconds: 30,
        cacheTtlMinutes: 15,
      },
      fetch: {
        enabled: true,
        provider: "firecrawl", // optional; omit for auto-detect
        maxChars: 50000,
        maxCharsCap: 50000,
        maxResponseBytes: 2000000,
        timeoutSeconds: 30,
        cacheTtlMinutes: 15,
        maxRedirects: 3,
        readability: true,
        userAgent: "custom-ua",
      },
    },
  },
}
```

### `tools.media`

인바운드 미디어 이해(이미지/오디오/비디오)를 구성합니다:

```json5
{
  tools: {
    media: {
      concurrency: 2,
      asyncCompletion: {
        directSend: false, // opt-in: send finished async music/video directly to the channel
      },
      audio: {
        enabled: true,
        maxBytes: 20971520,
        scope: {
          default: "deny",
          rules: [{ action: "allow", match: { chatType: "direct" } }],
        },
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" },
          { type: "cli", command: "whisper", args: ["--model", "base", "{{MediaPath}}"] },
        ],
      },
      video: {
        enabled: true,
        maxBytes: 52428800,
        models: [{ provider: "google", model: "gemini-3-flash-preview" }],
      },
    },
  },
}
```

<Accordion title="미디어 모델 엔트리 필드">

**Provider 엔트리** (`type: "provider"` 또는 생략):

- `provider`: API provider id (`openai`, `anthropic`, `google`/`gemini`, `groq` 등)
- `model`: 모델 id 재정의
- `profile` / `preferredProfile`: `auth-profiles.json` 프로파일 선택

**CLI 엔트리** (`type: "cli"`):

- `command`: 실행할 실행 파일
- `args`: 템플릿 인자(`{{MediaPath}}`, `{{Prompt}}`, `{{MaxChars}}` 등 지원)

**공통 필드:**

- `capabilities`: 선택적 목록(`image`, `audio`, `video`). 기본값: `openai`/`anthropic`/`minimax` → image, `google` → image+audio+video, `groq` → audio.
- `prompt`, `maxChars`, `maxBytes`, `timeoutSeconds`, `language`: 엔트리별 재정의.
- 실패 시 다음 엔트리로 폴백합니다.

Provider 인증은 표준 순서를 따릅니다: `auth-profiles.json` → env vars → `models.providers.*.apiKey`.

**비동기 완료 필드:**

- `asyncCompletion.directSend`: `true`일 때, 완료된 비동기 `music_generate`
  및 `video_generate` 작업이 먼저 직접 채널 전달을 시도합니다. 기본값: `false`
  (레거시 요청자-세션 wake/모델 전달 경로).

</Accordion>

### `tools.agentToAgent`

```json5
{
  tools: {
    agentToAgent: {
      enabled: false,
      allow: ["home", "work"],
    },
  },
}
```

### `tools.sessions`

세션 tool(`sessions_list`, `sessions_history`, `sessions_send`)이 대상으로 삼을 수 있는 세션을 제어합니다.

기본값: `tree`(현재 세션 + 해당 세션에서 spawn된 세션, 예: 서브에이전트).

```json5
{
  tools: {
    sessions: {
      // "self" | "tree" | "agent" | "all"
      visibility: "tree",
    },
  },
}
```

참고:

- `self`: 현재 세션 키만.
- `tree`: 현재 세션 + 현재 세션에서 spawn된 세션(서브에이전트).
- `agent`: 현재 에이전트 id에 속하는 모든 세션(동일한 에이전트 id 아래에서 발신자별 세션을 실행하는 경우 다른 사용자를 포함할 수 있음).
- `all`: 모든 세션. 에이전트 간 대상 지정은 여전히 `tools.agentToAgent`가 필요합니다.
- 샌드박스 클램프: 현재 세션이 샌드박스화되어 있고 `agents.defaults.sandbox.sessionToolsVisibility="spawned"`인 경우, `tools.sessions.visibility="all"`이더라도 visibility는 `tree`로 강제됩니다.

### `tools.sessions_spawn`

`sessions_spawn`에 대한 인라인 첨부 파일 지원을 제어합니다.

```json5
{
  tools: {
    sessions_spawn: {
      attachments: {
        enabled: false, // opt-in: set true to allow inline file attachments
        maxTotalBytes: 5242880, // 5 MB total across all files
        maxFiles: 50,
        maxFileBytes: 1048576, // 1 MB per file
        retainOnSessionKeep: false, // keep attachments when cleanup="keep"
      },
    },
  },
}
```

참고:

- 첨부 파일은 `runtime: "subagent"`에서만 지원됩니다. ACP 런타임은 이를 거부합니다.
- 파일은 자식 워크스페이스의 `.openclaw/attachments/<uuid>/`에 `.manifest.json`과 함께 materialize됩니다.
- 첨부 파일 내용은 트랜스크립트 지속성에서 자동으로 redact됩니다.
- Base64 입력은 엄격한 알파벳/패딩 검사 및 디코드 전 크기 가드로 유효성이 검사됩니다.
- 파일 권한은 디렉토리는 `0700`, 파일은 `0600`입니다.
- 정리는 `cleanup` 정책을 따릅니다: `delete`는 항상 첨부 파일을 제거합니다; `keep`은 `retainOnSessionKeep: true`일 때만 유지합니다.

<a id="toolsexperimental"></a>

### `tools.experimental`

실험적 내장 tool 플래그. strict-agentic GPT-5 자동 활성화 규칙이 적용되지 않는 한 기본값은 꺼짐입니다.

```json5
{
  tools: {
    experimental: {
      planTool: true, // enable experimental update_plan
    },
  },
}
```

참고:

- `planTool`: 중요한 다단계 작업 추적을 위한 구조화된 `update_plan` tool을 활성화합니다.
- 기본값: OpenAI 또는 OpenAI Codex GPT-5 계열 실행에 대해 `agents.defaults.embeddedPi.executionContract`(또는 에이전트별 재정의)가 `"strict-agentic"`으로 설정되지 않은 한 `false`. 해당 범위 외에서 tool을 강제로 켜려면 `true`로 설정하거나, strict-agentic GPT-5 실행에서도 끄려면 `false`로 설정하십시오.
- 활성화되면 시스템 프롬프트에도 사용 가이드가 추가되어 모델이 실질적인 작업에만 이를 사용하고 한 번에 최대 하나의 단계만 `in_progress` 상태로 유지하도록 합니다.

### `agents.defaults.subagents`

```json5
{
  agents: {
    defaults: {
      subagents: {
        allowAgents: ["research"],
        model: "minimax/MiniMax-M2.7",
        maxConcurrent: 8,
        runTimeoutSeconds: 900,
        archiveAfterMinutes: 60,
      },
    },
  },
}
```

- `model`: spawn된 서브에이전트의 기본 모델. 생략하면 서브에이전트는 호출자의 모델을 상속합니다.
- `allowAgents`: 요청자 에이전트가 자체 `subagents.allowAgents`를 설정하지 않은 경우 `sessions_spawn`의 대상 에이전트 id에 대한 기본 허용 목록(`["*"]` = 모두; 기본값: 동일 에이전트만).
- `runTimeoutSeconds`: tool 호출이 `runTimeoutSeconds`를 생략한 경우 `sessions_spawn`의 기본 타임아웃(초). `0`은 타임아웃 없음을 의미합니다.
- 서브에이전트별 tool 정책: `tools.subagents.tools.allow` / `tools.subagents.tools.deny`.

---

## 사용자 정의 provider 및 base URL

OpenClaw는 내장 모델 카탈로그를 사용합니다. config의 `models.providers` 또는 `~/.openclaw/agents/<agentId>/agent/models.json`을 통해 사용자 정의 provider를 추가하십시오.

```json5
{
  models: {
    mode: "merge", // merge (default) | replace
    providers: {
      "custom-proxy": {
        baseUrl: "http://localhost:4000/v1",
        apiKey: "LITELLM_KEY",
        api: "openai-completions", // openai-completions | openai-responses | anthropic-messages | google-generative-ai
        models: [
          {
            id: "llama-3.1-8b",
            name: "Llama 3.1 8B",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            contextTokens: 96000,
            maxTokens: 32000,
          },
        ],
      },
    },
  },
}
```

- 사용자 정의 인증 요구 사항에는 `authHeader: true` + `headers`를 사용하십시오.
- 에이전트 config 루트를 `OPENCLAW_AGENT_DIR`(또는 레거시 환경 변수 별칭 `PI_CODING_AGENT_DIR`)로 재정의하십시오.
- 일치하는 provider ID에 대한 병합 우선순위:
  - 비어 있지 않은 에이전트 `models.json` `baseUrl` 값이 우선합니다.
  - 비어 있지 않은 에이전트 `apiKey` 값은 현재 config/auth-profile 컨텍스트에서 해당 provider가 SecretRef로 관리되지 않는 경우에만 우선합니다.
  - SecretRef로 관리되는 provider `apiKey` 값은 해결된 시크릿을 지속시키는 대신 소스 마커(env ref의 경우 `ENV_VAR_NAME`, file/exec ref의 경우 `secretref-managed`)에서 새로 고쳐집니다.
  - SecretRef로 관리되는 provider 헤더 값은 소스 마커(env ref의 경우 `secretref-env:ENV_VAR_NAME`, file/exec ref의 경우 `secretref-managed`)에서 새로 고쳐집니다.
  - 비어 있거나 누락된 에이전트 `apiKey`/`baseUrl`은 config의 `models.providers`로 폴백됩니다.
  - 일치하는 모델 `contextWindow`/`maxTokens`는 명시적 config와 암시적 카탈로그 값 중 더 높은 값을 사용합니다.
  - 일치하는 모델 `contextTokens`는 존재하는 경우 명시적 런타임 상한을 보존합니다; 네이티브 모델 메타데이터를 변경하지 않고 실질적인 컨텍스트를 제한하는 데 사용하십시오.
  - config가 `models.json`을 완전히 다시 쓰도록 하려면 `models.mode: "replace"`를 사용하십시오.
  - 마커 지속성은 소스 권위적입니다: 마커는 해결된 런타임 시크릿 값이 아닌 활성 소스 config 스냅샷(해결 전)에서 기록됩니다.

### Provider 필드 세부 정보

- `models.mode`: provider 카탈로그 동작(`merge` 또는 `replace`).
- `models.providers`: provider id로 키가 지정된 사용자 정의 provider 맵.
  - 안전한 편집: 추가 업데이트에는 `openclaw config set models.providers.<id> '<json>' --strict-json --merge` 또는 `openclaw config set models.providers.<id>.models '<json-array>' --strict-json --merge`를 사용하십시오. `config set`은 `--replace`를 전달하지 않는 한 파괴적 교체를 거부합니다.
- `models.providers.*.api`: 요청 어댑터(`openai-completions`, `openai-responses`, `anthropic-messages`, `google-generative-ai` 등).
- `models.providers.*.apiKey`: provider 자격 증명(SecretRef/env 치환 선호).
- `models.providers.*.auth`: 인증 전략(`api-key`, `token`, `oauth`, `aws-sdk`).
- `models.providers.*.injectNumCtxForOpenAICompat`: Ollama + `openai-completions`의 경우, 요청에 `options.num_ctx`를 주입합니다(기본값: `true`).
- `models.providers.*.authHeader`: 필요한 경우 `Authorization` 헤더에 자격 증명 전송을 강제합니다.
- `models.providers.*.baseUrl`: 업스트림 API base URL.
- `models.providers.*.headers`: 프록시/테넌트 라우팅을 위한 추가 정적 헤더.
- `models.providers.*.request`: 모델-provider HTTP 요청에 대한 전송 재정의.
  - `request.headers`: 추가 헤더(provider 기본값과 병합). 값은 SecretRef를 허용합니다.
  - `request.auth`: 인증 전략 재정의. 모드: `"provider-default"`(provider의 내장 인증 사용), `"authorization-bearer"`(`token` 포함), `"header"`(`headerName`, `value`, 선택적 `prefix` 포함).
  - `request.proxy`: HTTP 프록시 재정의. 모드: `"env-proxy"`(`HTTP_PROXY`/`HTTPS_PROXY` 환경 변수 사용), `"explicit-proxy"`(`url` 포함). 두 모드 모두 선택적 `tls` 하위 객체를 허용합니다.
  - `request.tls`: 직접 연결을 위한 TLS 재정의. 필드: `ca`, `cert`, `key`, `passphrase`(모두 SecretRef 허용), `serverName`, `insecureSkipVerify`.
  - `request.allowPrivateNetwork`: `true`일 때, DNS가 private, CGNAT 또는 유사 범위로 해석되는 `baseUrl`에 대한 HTTPS를 provider HTTP fetch 가드를 통해 허용합니다(신뢰할 수 있는 자체 호스팅 OpenAI 호환 엔드포인트에 대한 운영자 opt-in). WebSocket은 헤더/TLS에 대해 동일한 `request`를 사용하지만 해당 fetch SSRF 게이트는 사용하지 않습니다. 기본값 `false`.
- `models.providers.*.models`: 명시적 provider 모델 카탈로그 엔트리.
- `models.providers.*.models.*.contextWindow`: 네이티브 모델 context window 메타데이터.
- `models.providers.*.models.*.contextTokens`: 선택적 런타임 context 상한. 모델의 네이티브 `contextWindow`보다 작은 실질적인 컨텍스트 예산을 원할 때 사용하십시오.
- `models.providers.*.models.*.compat.supportsDeveloperRole`: 선택적 호환성 힌트. 비어 있지 않은 비네이티브 `baseUrl`(호스트가 `api.openai.com`이 아님)을 가진 `api: "openai-completions"`의 경우, OpenClaw는 런타임에 이를 `false`로 강제합니다. 비어 있거나 생략된 `baseUrl`은 기본 OpenAI 동작을 유지합니다.
- `models.providers.*.models.*.compat.requiresStringContent`: 문자열 전용 OpenAI 호환 채팅 엔드포인트에 대한 선택적 호환성 힌트. `true`일 때 OpenClaw는 요청을 보내기 전에 순수 텍스트 `messages[].content` 배열을 일반 문자열로 평탄화합니다.
- `plugins.entries.amazon-bedrock.config.discovery`: Bedrock 자동 디스커버리 설정 루트.
- `plugins.entries.amazon-bedrock.config.discovery.enabled`: 암시적 디스커버리 켜기/끄기.
- `plugins.entries.amazon-bedrock.config.discovery.region`: 디스커버리를 위한 AWS 리전.
- `plugins.entries.amazon-bedrock.config.discovery.providerFilter`: 타겟 디스커버리를 위한 선택적 provider-id 필터.
- `plugins.entries.amazon-bedrock.config.discovery.refreshInterval`: 디스커버리 새로 고침을 위한 폴링 간격.
- `plugins.entries.amazon-bedrock.config.discovery.defaultContextWindow`: 발견된 모델의 폴백 context window.
- `plugins.entries.amazon-bedrock.config.discovery.defaultMaxTokens`: 발견된 모델의 폴백 최대 출력 토큰.

### Provider 예제

<Accordion title="Cerebras (GLM 4.6 / 4.7)">

```json5
{
  env: { CEREBRAS_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: {
        primary: "cerebras/zai-glm-4.7",
        fallbacks: ["cerebras/zai-glm-4.6"],
      },
      models: {
        "cerebras/zai-glm-4.7": { alias: "GLM 4.7 (Cerebras)" },
        "cerebras/zai-glm-4.6": { alias: "GLM 4.6 (Cerebras)" },
      },
    },
  },
  models: {
    mode: "merge",
    providers: {
      cerebras: {
        baseUrl: "https://api.cerebras.ai/v1",
        apiKey: "${CEREBRAS_API_KEY}",
        api: "openai-completions",
        models: [
          { id: "zai-glm-4.7", name: "GLM 4.7 (Cerebras)" },
          { id: "zai-glm-4.6", name: "GLM 4.6 (Cerebras)" },
        ],
      },
    },
  },
}
```

Cerebras에는 `cerebras/zai-glm-4.7`을 사용하고, Z.AI 직접 연결에는 `zai/glm-4.7`을 사용하십시오.

</Accordion>

<Accordion title="OpenCode">

```json5
{
  agents: {
    defaults: {
      model: { primary: "opencode/claude-opus-4-6" },
      models: { "opencode/claude-opus-4-6": { alias: "Opus" } },
    },
  },
}
```

`OPENCODE_API_KEY`(또는 `OPENCODE_ZEN_API_KEY`)를 설정하십시오. Zen 카탈로그에는 `opencode/...` ref를, Go 카탈로그에는 `opencode-go/...` ref를 사용하십시오. 단축 명령: `openclaw onboard --auth-choice opencode-zen` 또는 `openclaw onboard --auth-choice opencode-go`.

</Accordion>

<Accordion title="Z.AI (GLM-4.7)">

```json5
{
  agents: {
    defaults: {
      model: { primary: "zai/glm-4.7" },
      models: { "zai/glm-4.7": {} },
    },
  },
}
```

`ZAI_API_KEY`를 설정하십시오. `z.ai/*` 및 `z-ai/*`는 허용되는 별칭입니다. 단축 명령: `openclaw onboard --auth-choice zai-api-key`.

- 일반 엔드포인트: `https://api.z.ai/api/paas/v4`
- 코딩 엔드포인트(기본값): `https://api.z.ai/api/coding/paas/v4`
- 일반 엔드포인트의 경우 base URL 재정의로 사용자 정의 provider를 정의하십시오.

</Accordion>

<Accordion title="Moonshot AI (Kimi)">

```json5
{
  env: { MOONSHOT_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "moonshot/kimi-k2.6" },
      models: { "moonshot/kimi-k2.6": { alias: "Kimi K2.6" } },
    },
  },
  models: {
    mode: "merge",
    providers: {
      moonshot: {
        baseUrl: "https://api.moonshot.ai/v1",
        apiKey: "${MOONSHOT_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "kimi-k2.6",
            name: "Kimi K2.6",
            reasoning: false,
            input: ["text", "image"],
            cost: { input: 0.95, output: 4, cacheRead: 0.16, cacheWrite: 0 },
            contextWindow: 262144,
            maxTokens: 262144,
          },
        ],
      },
    },
  },
}
```

중국 엔드포인트의 경우: `baseUrl: "https://api.moonshot.cn/v1"` 또는 `openclaw onboard --auth-choice moonshot-api-key-cn`.

네이티브 Moonshot 엔드포인트는 공유된 `openai-completions` 전송에서 스트리밍 사용량 호환성을
광고하며, OpenClaw는 내장 provider id만이 아닌 엔드포인트 기능을 기반으로 이를 키잉합니다.

</Accordion>

<Accordion title="Kimi Coding">

```json5
{
  env: { KIMI_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "kimi/kimi-code" },
      models: { "kimi/kimi-code": { alias: "Kimi Code" } },
    },
  },
}
```

Anthropic 호환, 내장 provider. 단축 명령: `openclaw onboard --auth-choice kimi-code-api-key`.

</Accordion>

<Accordion title="Synthetic (Anthropic 호환)">

```json5
{
  env: { SYNTHETIC_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "synthetic/hf:MiniMaxAI/MiniMax-M2.5" },
      models: { "synthetic/hf:MiniMaxAI/MiniMax-M2.5": { alias: "MiniMax M2.5" } },
    },
  },
  models: {
    mode: "merge",
    providers: {
      synthetic: {
        baseUrl: "https://api.synthetic.new/anthropic",
        apiKey: "${SYNTHETIC_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "hf:MiniMaxAI/MiniMax-M2.5",
            name: "MiniMax M2.5",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 192000,
            maxTokens: 65536,
          },
        ],
      },
    },
  },
}
```

Base URL은 `/v1`을 생략해야 합니다(Anthropic 클라이언트가 이를 추가함). 단축 명령: `openclaw onboard --auth-choice synthetic-api-key`.

</Accordion>

<Accordion title="MiniMax M2.7 (직접)">

```json5
{
  agents: {
    defaults: {
      model: { primary: "minimax/MiniMax-M2.7" },
      models: {
        "minimax/MiniMax-M2.7": { alias: "Minimax" },
      },
    },
  },
  models: {
    mode: "merge",
    providers: {
      minimax: {
        baseUrl: "https://api.minimax.io/anthropic",
        apiKey: "${MINIMAX_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "MiniMax-M2.7",
            name: "MiniMax M2.7",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0.3, output: 1.2, cacheRead: 0.06, cacheWrite: 0.375 },
            contextWindow: 204800,
            maxTokens: 131072,
          },
        ],
      },
    },
  },
}
```

`MINIMAX_API_KEY`를 설정하십시오. 단축 명령:
`openclaw onboard --auth-choice minimax-global-api` 또는
`openclaw onboard --auth-choice minimax-cn-api`.
모델 카탈로그는 기본적으로 M2.7만 지정합니다.
Anthropic 호환 스트리밍 경로에서 OpenClaw는 `thinking`을 명시적으로 직접 설정하지 않는 한
기본적으로 MiniMax thinking을 비활성화합니다. `/fast on` 또는
`params.fastMode: true`는 `MiniMax-M2.7`을
`MiniMax-M2.7-highspeed`로 다시 씁니다.

</Accordion>

<Accordion title="로컬 모델 (LM Studio)">

[로컬 모델](/gateway/local-models)을 참조하십시오. 요약: 적절한 하드웨어에서 LM Studio Responses API를 통해 대형 로컬 모델을 실행하고, 폴백을 위해 호스팅된 모델을 병합 상태로 유지하십시오.

</Accordion>

---

## 관련

- [구성 레퍼런스](/gateway/configuration-reference) — 기타 최상위 키
- [구성 — 에이전트](/gateway/config-agents)
- [구성 — 채널](/gateway/config-channels)
- [Tools 및 플러그인](/tools/)
