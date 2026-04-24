---
summary: "Agent 기본값, 다중 agent 라우팅, session, messages, talk 구성"
read_when:
  - Agent 기본값을 튜닝할 때 (모델, thinking, workspace, heartbeat, 미디어, skills)
  - 다중 agent 라우팅 및 bindings를 구성할 때
  - Session, 메시지 전달, talk-mode 동작을 조정할 때
title: "구성 — agents"
---

`agents.*`, `multiAgent.*`, `session.*`, `messages.*`, `talk.*` 아래의 agent 범위 구성 키입니다. channels, tools, gateway 런타임 및 기타 최상위 키는 [구성 레퍼런스](/gateway/configuration-reference)를 참조하십시오.

## Agent 기본값

### `agents.defaults.workspace`

기본값: `~/.openclaw/workspace`.

```json5
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
}
```

### `agents.defaults.repoRoot`

시스템 프롬프트의 Runtime 줄에 표시되는 선택적 저장소 루트입니다. 설정되지 않은 경우 OpenClaw는 workspace에서 위쪽으로 순회하며 자동 감지합니다.

```json5
{
  agents: { defaults: { repoRoot: "~/Projects/openclaw" } },
}
```

### `agents.defaults.skills`

`agents.list[].skills`를 설정하지 않은 agent에 대한 선택적 기본 skill 허용 목록입니다.

```json5
{
  agents: {
    defaults: { skills: ["github", "weather"] },
    list: [
      { id: "writer" }, // github, weather 상속
      { id: "docs", skills: ["docs-search"] }, // 기본값 대체
      { id: "locked-down", skills: [] }, // skill 없음
    ],
  },
}
```

- 기본적으로 skill을 제한하지 않으려면 `agents.defaults.skills`를 생략하십시오.
- 기본값을 상속하려면 `agents.list[].skills`를 생략하십시오.
- skill을 사용하지 않으려면 `agents.list[].skills: []`로 설정하십시오.
- 비어 있지 않은 `agents.list[].skills` 목록은 해당 agent의 최종 집합이며; 기본값과 병합되지 **않습니다**.

### `agents.defaults.skipBootstrap`

Workspace bootstrap 파일(`AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, `HEARTBEAT.md`, `BOOTSTRAP.md`)의 자동 생성을 비활성화합니다.

```json5
{
  agents: { defaults: { skipBootstrap: true } },
}
```

### `agents.defaults.contextInjection`

Workspace bootstrap 파일이 시스템 프롬프트에 주입되는 시점을 제어합니다. 기본값: `"always"`.

- `"continuation-skip"`: 안전한 연속 턴(완료된 assistant 응답 이후)에서는 workspace bootstrap 재주입을 건너뛰어 프롬프트 크기를 줄입니다. Heartbeat 실행과 컴팩션 이후 재시도는 여전히 컨텍스트를 재구성합니다.

```json5
{
  agents: { defaults: { contextInjection: "continuation-skip" } },
}
```

### `agents.defaults.bootstrapMaxChars`

잘림 전 workspace bootstrap 파일당 최대 문자 수입니다. 기본값: `12000`.

```json5
{
  agents: { defaults: { bootstrapMaxChars: 12000 } },
}
```

### `agents.defaults.bootstrapTotalMaxChars`

모든 workspace bootstrap 파일에 걸쳐 주입되는 최대 총 문자 수입니다. 기본값: `60000`.

```json5
{
  agents: { defaults: { bootstrapTotalMaxChars: 60000 } },
}
```

### `agents.defaults.bootstrapPromptTruncationWarning`

Bootstrap 컨텍스트가 잘릴 때 agent에 보이는 경고 텍스트를 제어합니다.
기본값: `"once"`.

- `"off"`: 시스템 프롬프트에 경고 텍스트를 절대 주입하지 않습니다.
- `"once"`: 고유한 잘림 시그니처당 한 번만 경고를 주입합니다(권장).
- `"always"`: 잘림이 존재하는 모든 실행에서 경고를 주입합니다.

```json5
{
  agents: { defaults: { bootstrapPromptTruncationWarning: "once" } }, // off | once | always
}
```

### 컨텍스트 예산 소유권 맵

OpenClaw는 여러 고볼륨 프롬프트/컨텍스트 예산을 가지며, 하나의 제너릭 노브를 통해 모두 흐르는 대신 의도적으로 서브시스템별로 분리되어 있습니다.

- `agents.defaults.bootstrapMaxChars` /
  `agents.defaults.bootstrapTotalMaxChars`:
  일반 workspace bootstrap 주입.
- `agents.defaults.startupContext.*`:
  최근 일일 `memory/*.md` 파일을 포함한 일회성 `/new` 및 `/reset` 시작 프렐류드.
- `skills.limits.*`:
  시스템 프롬프트에 주입되는 컴팩트 skills 목록.
- `agents.defaults.contextLimits.*`:
  제한된 런타임 발췌 및 주입되는 런타임 소유 블록.
- `memory.qmd.limits.*`:
  인덱싱된 메모리 검색 스니펫 및 주입 크기 조정.

하나의 agent가 다른 예산을 필요로 할 때만 agent별 재정의를 사용하십시오:

- `agents.list[].skillsLimits.maxSkillsPromptChars`
- `agents.list[].contextLimits.*`

#### `agents.defaults.startupContext`

순수 `/new` 및 `/reset` 실행에서 첫 번째 턴에 주입되는 시작 프렐류드를 제어합니다.

```json5
{
  agents: {
    defaults: {
      startupContext: {
        enabled: true,
        applyOn: ["new", "reset"],
        dailyMemoryDays: 2,
        maxFileBytes: 16384,
        maxFileChars: 1200,
        maxTotalChars: 2800,
      },
    },
  },
}
```

#### `agents.defaults.contextLimits`

제한된 런타임 컨텍스트 표면에 대한 공유 기본값입니다.

```json5
{
  agents: {
    defaults: {
      contextLimits: {
        memoryGetMaxChars: 12000,
        memoryGetDefaultLines: 120,
        toolResultMaxChars: 16000,
        postCompactionMaxChars: 1800,
      },
    },
  },
}
```

- `memoryGetMaxChars`: 잘림 메타데이터와 연속 알림이 추가되기 전 기본 `memory_get` 발췌 상한.
- `memoryGetDefaultLines`: `lines`가 생략된 경우의 기본 `memory_get` 줄 윈도우.
- `toolResultMaxChars`: 지속되는 결과와 오버플로 복구에 사용되는 실시간 tool-result 상한.
- `postCompactionMaxChars`: 컴팩션 후 리프레시 주입 시 사용되는 AGENTS.md 발췌 상한.

#### `agents.list[].contextLimits`

공유 `contextLimits` 노브에 대한 agent별 재정의입니다. 생략된 필드는 `agents.defaults.contextLimits`에서 상속됩니다.

```json5
{
  agents: {
    defaults: {
      contextLimits: {
        memoryGetMaxChars: 12000,
        toolResultMaxChars: 16000,
      },
    },
    list: [
      {
        id: "tiny-local",
        contextLimits: {
          memoryGetMaxChars: 6000,
          toolResultMaxChars: 8000,
        },
      },
    ],
  },
}
```

#### `skills.limits.maxSkillsPromptChars`

시스템 프롬프트에 주입되는 컴팩트 skills 목록에 대한 전역 상한입니다. 이는 요청 시 `SKILL.md` 파일을 읽는 것에는 영향을 미치지 않습니다.

```json5
{
  skills: {
    limits: {
      maxSkillsPromptChars: 18000,
    },
  },
}
```

#### `agents.list[].skillsLimits.maxSkillsPromptChars`

Skills 프롬프트 예산에 대한 agent별 재정의입니다.

```json5
{
  agents: {
    list: [
      {
        id: "tiny-local",
        skillsLimits: {
          maxSkillsPromptChars: 6000,
        },
      },
    ],
  },
}
```

### `agents.defaults.imageMaxDimensionPx`

Provider 호출 전 transcript/tool 이미지 블록에서 이미지 최장변의 최대 픽셀 크기입니다.
기본값: `1200`.

낮은 값은 일반적으로 스크린샷이 많은 실행에서 비전 토큰 사용량과 요청 페이로드 크기를 줄입니다.
높은 값은 더 많은 시각적 세부 정보를 보존합니다.

```json5
{
  agents: { defaults: { imageMaxDimensionPx: 1200 } },
}
```

### `agents.defaults.userTimezone`

시스템 프롬프트 컨텍스트용 시간대입니다(메시지 타임스탬프가 아님). 호스트 시간대로 폴백됩니다.

```json5
{
  agents: { defaults: { userTimezone: "America/Chicago" } },
}
```

### `agents.defaults.timeFormat`

시스템 프롬프트의 시간 형식입니다. 기본값: `auto`(OS 기본 설정).

```json5
{
  agents: { defaults: { timeFormat: "auto" } }, // auto | 12 | 24
}
```

### `agents.defaults.model`

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": { alias: "opus" },
        "minimax/MiniMax-M2.7": { alias: "minimax" },
      },
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["minimax/MiniMax-M2.7"],
      },
      imageModel: {
        primary: "openrouter/qwen/qwen-2.5-vl-72b-instruct:free",
        fallbacks: ["openrouter/google/gemini-2.0-flash-vision:free"],
      },
      imageGenerationModel: {
        primary: "openai/gpt-image-2",
        fallbacks: ["google/gemini-3.1-flash-image-preview"],
      },
      videoGenerationModel: {
        primary: "qwen/wan2.6-t2v",
        fallbacks: ["qwen/wan2.6-i2v"],
      },
      pdfModel: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["openai/gpt-5.4-mini"],
      },
      params: { cacheRetention: "long" }, // 전역 기본 provider 파라미터
      embeddedHarness: {
        runtime: "auto", // auto | pi | 등록된 harness id, 예: codex
        fallback: "pi", // pi | none
      },
      pdfMaxBytesMb: 10,
      pdfMaxPages: 20,
      thinkingDefault: "low",
      verboseDefault: "off",
      elevatedDefault: "on",
      timeoutSeconds: 600,
      mediaMaxMb: 5,
      contextTokens: 200000,
      maxConcurrent: 3,
    },
  },
}
```

- `model`: 문자열(`"provider/model"`) 또는 객체(`{ primary, fallbacks }`) 중 하나를 허용합니다.
  - 문자열 형식은 primary 모델만 설정합니다.
  - 객체 형식은 primary와 순서가 있는 failover 모델을 설정합니다.
- `imageModel`: 문자열(`"provider/model"`) 또는 객체(`{ primary, fallbacks }`) 중 하나를 허용합니다.
  - `image` tool 경로에서 비전 모델 구성으로 사용됩니다.
  - 또한 선택된/기본 모델이 이미지 입력을 받아들일 수 없을 때 폴백 라우팅으로도 사용됩니다.
- `imageGenerationModel`: 문자열(`"provider/model"`) 또는 객체(`{ primary, fallbacks }`) 중 하나를 허용합니다.
  - 공유 이미지 생성 기능과 이미지를 생성하는 향후 tool/plugin 표면에서 사용됩니다.
  - 일반적인 값: 네이티브 Gemini 이미지 생성의 경우 `google/gemini-3.1-flash-image-preview`, fal의 경우 `fal/fal-ai/flux/dev`, OpenAI Images의 경우 `openai/gpt-image-2`.
  - Provider/모델을 직접 선택하는 경우, 일치하는 provider 인증도 구성하십시오(예: `google/*`의 경우 `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`, `openai/gpt-image-2`의 경우 `OPENAI_API_KEY` 또는 OpenAI Codex OAuth, `fal/*`의 경우 `FAL_KEY`).
  - 생략된 경우, `image_generate`는 여전히 인증 기반 provider 기본값을 추론할 수 있습니다. 먼저 현재 기본 provider를 시도한 다음, 나머지 등록된 이미지 생성 provider를 provider-id 순서로 시도합니다.
- `musicGenerationModel`: 문자열(`"provider/model"`) 또는 객체(`{ primary, fallbacks }`) 중 하나를 허용합니다.
  - 공유 음악 생성 기능과 내장 `music_generate` tool에서 사용됩니다.
  - 일반적인 값: `google/lyria-3-clip-preview`, `google/lyria-3-pro-preview`, `minimax/music-2.5+`.
  - 생략된 경우, `music_generate`는 여전히 인증 기반 provider 기본값을 추론할 수 있습니다. 먼저 현재 기본 provider를 시도한 다음, 나머지 등록된 음악 생성 provider를 provider-id 순서로 시도합니다.
  - Provider/모델을 직접 선택하는 경우, 일치하는 provider 인증/API 키도 구성하십시오.
- `videoGenerationModel`: 문자열(`"provider/model"`) 또는 객체(`{ primary, fallbacks }`) 중 하나를 허용합니다.
  - 공유 비디오 생성 기능과 내장 `video_generate` tool에서 사용됩니다.
  - 일반적인 값: `qwen/wan2.6-t2v`, `qwen/wan2.6-i2v`, `qwen/wan2.6-r2v`, `qwen/wan2.6-r2v-flash`, `qwen/wan2.7-r2v`.
  - 생략된 경우, `video_generate`는 여전히 인증 기반 provider 기본값을 추론할 수 있습니다. 먼저 현재 기본 provider를 시도한 다음, 나머지 등록된 비디오 생성 provider를 provider-id 순서로 시도합니다.
  - Provider/모델을 직접 선택하는 경우, 일치하는 provider 인증/API 키도 구성하십시오.
  - 번들된 Qwen 비디오 생성 provider는 최대 1개의 출력 비디오, 1개의 입력 이미지, 4개의 입력 비디오, 10초 지속 시간, 그리고 provider 레벨 `size`, `aspectRatio`, `resolution`, `audio`, `watermark` 옵션을 지원합니다.
- `pdfModel`: 문자열(`"provider/model"`) 또는 객체(`{ primary, fallbacks }`) 중 하나를 허용합니다.
  - `pdf` tool이 모델 라우팅에 사용합니다.
  - 생략된 경우, PDF tool은 `imageModel`로 폴백된 다음, 해결된 session/기본 모델로 폴백됩니다.
- `pdfMaxBytesMb`: 호출 시 `maxBytesMb`가 전달되지 않을 때 `pdf` tool의 기본 PDF 크기 제한.
- `pdfMaxPages`: `pdf` tool의 추출 폴백 모드에서 고려되는 기본 최대 페이지 수.
- `verboseDefault`: agent의 기본 verbose 레벨입니다. 값: `"off"`, `"on"`, `"full"`. 기본값: `"off"`.
- `elevatedDefault`: agent의 기본 elevated 출력 레벨입니다. 값: `"off"`, `"on"`, `"ask"`, `"full"`. 기본값: `"on"`.
- `model.primary`: 형식 `provider/model`(예: API 키 액세스의 경우 `openai/gpt-5.4` 또는 Codex OAuth의 경우 `openai-codex/gpt-5.5`). Provider를 생략하면 OpenClaw는 먼저 alias를 시도한 다음, 해당 정확한 모델 id에 대한 고유한 구성된 provider 매칭을 시도하고, 그런 다음에야 구성된 기본 provider로 폴백됩니다(더 이상 사용되지 않는 호환성 동작이므로 명시적인 `provider/model`을 선호하십시오). 해당 provider가 더 이상 구성된 기본 모델을 노출하지 않는 경우, OpenClaw는 오래된 제거된 provider 기본값을 표면화하는 대신 첫 번째 구성된 provider/모델로 폴백됩니다.
- `models`: `/model`에 대해 구성된 모델 카탈로그 및 허용 목록입니다. 각 항목은 `alias`(단축키)와 `params`(provider별, 예: `temperature`, `maxTokens`, `cacheRetention`, `context1m`, `responsesServerCompaction`, `responsesCompactThreshold`)를 포함할 수 있습니다.
  - 안전한 편집: 항목을 추가하려면 `openclaw config set agents.defaults.models '<json>' --strict-json --merge`를 사용하십시오. `config set`은 `--replace`를 전달하지 않으면 기존 허용 목록 항목을 제거하는 대체를 거부합니다.
  - Provider 범위의 configure/onboarding 흐름은 선택된 provider 모델을 이 맵에 병합하고 이미 구성된 관련 없는 provider를 보존합니다.
  - 직접 OpenAI Responses 모델의 경우 서버 측 컴팩션이 자동으로 활성화됩니다. `context_management` 주입을 중지하려면 `params.responsesServerCompaction: false`를 사용하거나, 임계값을 재정의하려면 `params.responsesCompactThreshold`를 사용하십시오. [OpenAI 서버 측 컴팩션](/providers/openai#server-side-compaction-responses-api)을 참조하십시오.
- `params`: 모든 모델에 적용되는 전역 기본 provider 파라미터입니다. `agents.defaults.params`에서 설정합니다(예: `{ cacheRetention: "long" }`).
- `params` 병합 우선순위(config): `agents.defaults.params`(전역 기본)는 `agents.defaults.models["provider/model"].params`(모델별)에 의해 재정의되고, 그런 다음 `agents.list[].params`(일치하는 agent id)가 키별로 재정의합니다. 자세한 내용은 [프롬프트 캐싱](/reference/prompt-caching)을 참조하십시오.
- `embeddedHarness`: 기본 저수준 임베디드 agent 런타임 정책입니다. 등록된 plugin harness가 지원되는 모델을 클레임하도록 하려면 `runtime: "auto"`를 사용하고, 내장 PI harness를 강제하려면 `runtime: "pi"`를 사용하거나, `runtime: "codex"`와 같은 등록된 harness id를 사용하십시오. 자동 PI 폴백을 비활성화하려면 `fallback: "none"`으로 설정하십시오.
- 이러한 필드를 변경하는 구성 작성자(예: `/models set`, `/models set-image` 및 폴백 추가/제거 명령)는 정규 객체 형식을 저장하고 가능한 경우 기존 폴백 목록을 보존합니다.
- `maxConcurrent`: 세션 전반에 걸친 최대 병렬 agent 실행 수입니다(각 세션은 여전히 직렬화됨). 기본값: 4.

### `agents.defaults.embeddedHarness`

`embeddedHarness`는 임베디드 agent 턴을 실행하는 저수준 executor를 제어합니다.
대부분의 배포는 기본값 `{ runtime: "auto", fallback: "pi" }`를 유지해야 합니다.
신뢰할 수 있는 plugin이 번들된 Codex app-server harness와 같은 네이티브 harness를 제공할 때 사용하십시오.

```json5
{
  agents: {
    defaults: {
      model: "openai/gpt-5.5",
      embeddedHarness: {
        runtime: "codex",
        fallback: "none",
      },
    },
  },
}
```

- `runtime`: `"auto"`, `"pi"`, 또는 등록된 plugin harness id. 번들된 Codex plugin은 `codex`를 등록합니다.
- `fallback`: `"pi"` 또는 `"none"`. `"pi"`는 plugin harness가 선택되지 않았을 때 호환성 폴백으로 내장 PI harness를 유지합니다. `"none"`은 누락되거나 지원되지 않는 plugin harness 선택이 PI를 조용히 사용하는 대신 실패하도록 합니다. 선택된 plugin harness 실패는 항상 직접 표면화됩니다.
- 환경 재정의: `OPENCLAW_AGENT_RUNTIME=<id|auto|pi>`는 `runtime`을 재정의하고; `OPENCLAW_AGENT_HARNESS_FALLBACK=none`은 해당 프로세스에 대해 PI 폴백을 비활성화합니다.
- Codex 전용 배포의 경우, `model: "openai/gpt-5.5"`, `embeddedHarness.runtime: "codex"`, `embeddedHarness.fallback: "none"`으로 설정하십시오.
- Harness 선택은 첫 번째 임베디드 실행 이후 session id별로 고정됩니다. 구성/환경 변경은 새 또는 재설정된 세션에 영향을 미치며 기존 transcript에는 영향을 미치지 않습니다. Transcript 기록이 있지만 기록된 pin이 없는 레거시 세션은 PI-pinned로 취급됩니다. `/status`는 `Fast` 옆에 `codex`와 같은 non-PI harness id를 표시합니다.
- 이는 임베디드 chat harness만 제어합니다. 미디어 생성, 비전, PDF, 음악, 비디오, TTS는 여전히 자체 provider/모델 설정을 사용합니다.

**내장 별칭 단축키** (모델이 `agents.defaults.models`에 있을 때만 적용):

| 별칭                | 모델                                               |
| ------------------- | -------------------------------------------------- |
| `opus`              | `anthropic/claude-opus-4-6`                        |
| `sonnet`            | `anthropic/claude-sonnet-4-6`                      |
| `gpt`               | `openai/gpt-5.4` 또는 구성된 Codex OAuth GPT-5.5   |
| `gpt-mini`          | `openai/gpt-5.4-mini`                              |
| `gpt-nano`          | `openai/gpt-5.4-nano`                              |
| `gemini`            | `google/gemini-3.1-pro-preview`                    |
| `gemini-flash`      | `google/gemini-3-flash-preview`                    |
| `gemini-flash-lite` | `google/gemini-3.1-flash-lite-preview`             |

구성된 별칭은 항상 기본값보다 우선합니다.

Z.AI GLM-4.x 모델은 `--thinking off`를 설정하거나 `agents.defaults.models["zai/<model>"].params.thinking`을 직접 정의하지 않는 한 thinking 모드를 자동으로 활성화합니다.
Z.AI 모델은 tool call 스트리밍을 위해 기본적으로 `tool_stream`을 활성화합니다. 비활성화하려면 `agents.defaults.models["zai/<model>"].params.tool_stream`을 `false`로 설정하십시오.
Anthropic Claude 4.6 모델은 명시적인 thinking 레벨이 설정되지 않을 때 기본적으로 `adaptive` thinking을 사용합니다.

### `agents.defaults.cliBackends`

텍스트 전용 폴백 실행(tool 호출 없음)을 위한 선택적 CLI backend입니다. API provider가 실패할 때 백업으로 유용합니다.

```json5
{
  agents: {
    defaults: {
      cliBackends: {
        "codex-cli": {
          command: "/opt/homebrew/bin/codex",
        },
        "my-cli": {
          command: "my-cli",
          args: ["--json"],
          output: "json",
          modelArg: "--model",
          sessionArg: "--session",
          sessionMode: "existing",
          systemPromptArg: "--system",
          systemPromptWhen: "first",
          imageArg: "--image",
          imageMode: "repeat",
        },
      },
    },
  },
}
```

- CLI backend는 텍스트 우선이며; tool은 항상 비활성화됩니다.
- `sessionArg`가 설정된 경우 session이 지원됩니다.
- `imageArg`가 파일 경로를 허용하는 경우 이미지 pass-through가 지원됩니다.

### `agents.defaults.systemPromptOverride`

OpenClaw가 어셈블한 전체 시스템 프롬프트를 고정된 문자열로 대체합니다. 기본 레벨(`agents.defaults.systemPromptOverride`) 또는 agent별(`agents.list[].systemPromptOverride`)로 설정하십시오. Agent별 값이 우선하며; 비어 있거나 공백만 있는 값은 무시됩니다. 제어된 프롬프트 실험에 유용합니다.

```json5
{
  agents: {
    defaults: {
      systemPromptOverride: "You are a helpful assistant.",
    },
  },
}
```

### `agents.defaults.promptOverlays`

모델 패밀리별로 적용되는 provider 독립적 프롬프트 오버레이입니다. GPT-5 패밀리 모델 id는 provider 전반에 걸쳐 공유된 동작 계약을 받으며; `personality`는 친근한 상호작용 스타일 레이어만 제어합니다.

```json5
{
  agents: {
    defaults: {
      promptOverlays: {
        gpt5: {
          personality: "friendly", // friendly | on | off
        },
      },
    },
  },
}
```

- `"friendly"`(기본값)와 `"on"`은 친근한 상호작용 스타일 레이어를 활성화합니다.
- `"off"`는 친근한 레이어만 비활성화하며; 태깅된 GPT-5 동작 계약은 활성화된 상태로 유지됩니다.
- 이 공유 설정이 설정되지 않은 경우 레거시 `plugins.entries.openai.config.personality`가 여전히 읽힙니다.

### `agents.defaults.heartbeat`

주기적 heartbeat 실행입니다.

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m", // 0m은 비활성화
        model: "openai/gpt-5.4-mini",
        includeReasoning: false,
        includeSystemPromptSection: true, // 기본값: true; false는 시스템 프롬프트에서 Heartbeat 섹션 생략
        lightContext: false, // 기본값: false; true는 workspace bootstrap 파일 중 HEARTBEAT.md만 유지
        isolatedSession: false, // 기본값: false; true는 각 heartbeat를 새 session에서 실행 (대화 기록 없음)
        session: "main",
        to: "+15555550123",
        directPolicy: "allow", // allow (기본값) | block
        target: "none", // 기본값: none | 옵션: last | whatsapp | telegram | discord | ...
        prompt: "Read HEARTBEAT.md if it exists...",
        ackMaxChars: 300,
        suppressToolErrorWarnings: false,
        timeoutSeconds: 45,
      },
    },
  },
}
```

- `every`: 기간 문자열(ms/s/m/h). 기본값: `30m`(API 키 인증) 또는 `1h`(OAuth 인증). 비활성화하려면 `0m`으로 설정하십시오.
- `includeSystemPromptSection`: false인 경우, 시스템 프롬프트에서 Heartbeat 섹션을 생략하고 bootstrap 컨텍스트에 `HEARTBEAT.md` 주입을 건너뜁니다. 기본값: `true`.
- `suppressToolErrorWarnings`: true인 경우, heartbeat 실행 중 tool 오류 경고 페이로드를 억제합니다.
- `timeoutSeconds`: heartbeat agent 턴이 중단되기 전 허용되는 최대 시간(초)입니다. `agents.defaults.timeoutSeconds`를 사용하려면 설정하지 않은 상태로 두십시오.
- `directPolicy`: direct/DM 전달 정책입니다. `allow`(기본값)는 direct-target 전달을 허용합니다. `block`은 direct-target 전달을 억제하고 `reason=dm-blocked`를 내보냅니다.
- `lightContext`: true인 경우, heartbeat 실행은 경량 bootstrap 컨텍스트를 사용하고 workspace bootstrap 파일 중 `HEARTBEAT.md`만 유지합니다.
- `isolatedSession`: true인 경우, 각 heartbeat는 이전 대화 기록이 없는 새 session에서 실행됩니다. Cron `sessionTarget: "isolated"`와 동일한 격리 패턴입니다. Heartbeat당 토큰 비용을 ~100K에서 ~2-5K 토큰으로 줄입니다.
- Agent별: `agents.list[].heartbeat`를 설정하십시오. 어떤 agent라도 `heartbeat`를 정의하면 **해당 agent만** heartbeat를 실행합니다.
- Heartbeat는 전체 agent 턴을 실행합니다 — 더 짧은 간격은 더 많은 토큰을 소비합니다.

### `agents.defaults.compaction`

```json5
{
  agents: {
    defaults: {
      compaction: {
        mode: "safeguard", // default | safeguard
        provider: "my-provider", // 등록된 compaction provider plugin의 id (선택 사항)
        timeoutSeconds: 900,
        reserveTokensFloor: 24000,
        identifierPolicy: "strict", // strict | off | custom
        identifierInstructions: "Preserve deployment IDs, ticket IDs, and host:port pairs exactly.", // identifierPolicy=custom일 때 사용
        postCompactionSections: ["Session Startup", "Red Lines"], // []는 재주입 비활성화
        model: "openrouter/anthropic/claude-sonnet-4-6", // 선택적 compaction 전용 모델 재정의
        notifyUser: true, // compaction 시작 및 완료 시 간단한 알림 전송 (기본값: false)
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 6000,
          systemPrompt: "Session nearing compaction. Store durable memories now.",
          prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with the exact silent token NO_REPLY if nothing to store.",
        },
      },
    },
  },
}
```

- `mode`: `default` 또는 `safeguard`(긴 기록에 대한 청크 요약). [컴팩션](/concepts/compaction)을 참조하십시오.
- `provider`: 등록된 compaction provider plugin의 id입니다. 설정되면 내장 LLM 요약 대신 provider의 `summarize()`가 호출됩니다. 실패 시 내장으로 폴백됩니다. Provider 설정은 `mode: "safeguard"`를 강제합니다. [컴팩션](/concepts/compaction)을 참조하십시오.
- `timeoutSeconds`: OpenClaw가 중단하기 전에 단일 compaction 작업에 허용되는 최대 시간(초)입니다. 기본값: `900`.
- `identifierPolicy`: `strict`(기본값), `off`, `custom`. `strict`는 compaction 요약 중 내장된 불투명 식별자 보존 가이드를 앞에 추가합니다.
- `identifierInstructions`: `identifierPolicy=custom`일 때 사용되는 선택적 사용자 정의 식별자 보존 텍스트입니다.
- `postCompactionSections`: compaction 후 재주입할 선택적 AGENTS.md H2/H3 섹션 이름입니다. 기본값은 `["Session Startup", "Red Lines"]`이며; 재주입을 비활성화하려면 `[]`로 설정하십시오. 설정되지 않거나 명시적으로 해당 기본 쌍으로 설정된 경우, 이전 `Every Session`/`Safety` 헤딩도 레거시 폴백으로 허용됩니다.
- `model`: compaction 요약 전용을 위한 선택적 `provider/model-id` 재정의입니다. 메인 session은 하나의 모델을 유지하되 compaction 요약은 다른 모델에서 실행되어야 할 때 사용하십시오; 설정되지 않은 경우 compaction은 session의 primary 모델을 사용합니다.
- `notifyUser`: `true`인 경우 compaction이 시작되고 완료될 때 사용자에게 간단한 알림을 보냅니다(예: "Compacting context..." 및 "Compaction complete"). Compaction을 조용하게 유지하기 위해 기본적으로 비활성화됩니다.
- `memoryFlush`: 지속적인 메모리를 저장하기 위해 자동 compaction 전의 조용한 agentic 턴입니다. Workspace가 읽기 전용일 때 건너뜁니다.

### `agents.defaults.contextPruning`

LLM에 전송하기 전 인메모리 컨텍스트에서 **오래된 tool 결과**를 정리합니다. 디스크의 session 기록은 수정하지 **않습니다**.

```json5
{
  agents: {
    defaults: {
      contextPruning: {
        mode: "cache-ttl", // off | cache-ttl
        ttl: "1h", // 기간 (ms/s/m/h), 기본 단위: 분
        keepLastAssistants: 3,
        softTrimRatio: 0.3,
        hardClearRatio: 0.5,
        minPrunableToolChars: 50000,
        softTrim: { maxChars: 4000, headChars: 1500, tailChars: 1500 },
        hardClear: { enabled: true, placeholder: "[Old tool result content cleared]" },
        tools: { deny: ["browser", "canvas"] },
      },
    },
  },
}
```

<Accordion title="cache-ttl 모드 동작">

- `mode: "cache-ttl"`은 정리 패스를 활성화합니다.
- `ttl`은 정리가 다시 실행될 수 있는 빈도(마지막 캐시 터치 이후)를 제어합니다.
- 정리는 먼저 초과 크기의 tool 결과를 soft-trim한 다음, 필요한 경우 오래된 tool 결과를 hard-clear합니다.

**Soft-trim**은 처음 + 끝을 유지하고 중간에 `...`을 삽입합니다.

**Hard-clear**는 전체 tool 결과를 placeholder로 대체합니다.

참고:

- 이미지 블록은 절대 trim/clear되지 않습니다.
- 비율은 문자 기반(근사치)이며 정확한 토큰 수가 아닙니다.
- assistant 메시지가 `keepLastAssistants`보다 적으면 정리가 건너뛰어집니다.

</Accordion>

동작 세부 사항은 [Session Pruning](/concepts/session-pruning)을 참조하십시오.

### 블록 스트리밍

```json5
{
  agents: {
    defaults: {
      blockStreamingDefault: "off", // on | off
      blockStreamingBreak: "text_end", // text_end | message_end
      blockStreamingChunk: { minChars: 800, maxChars: 1200 },
      blockStreamingCoalesce: { idleMs: 1000 },
      humanDelay: { mode: "natural" }, // off | natural | custom (minMs/maxMs 사용)
    },
  },
}
```

- Telegram이 아닌 채널은 블록 응답을 활성화하려면 명시적인 `*.blockStreaming: true`가 필요합니다.
- 채널 재정의: `channels.<channel>.blockStreamingCoalesce`(및 계정별 변형). Signal/Slack/Discord/Google Chat은 기본값 `minChars: 1500`.
- `humanDelay`: 블록 응답 사이의 무작위 일시 중지입니다. `natural` = 800–2500ms. Agent별 재정의: `agents.list[].humanDelay`.

동작 + 청킹 세부 사항은 [스트리밍](/concepts/streaming)을 참조하십시오.

### 타이핑 표시기

```json5
{
  agents: {
    defaults: {
      typingMode: "instant", // never | instant | thinking | message
      typingIntervalSeconds: 6,
    },
  },
}
```

- 기본값: direct 채팅/언급의 경우 `instant`, 언급되지 않은 그룹 채팅의 경우 `message`.
- Session별 재정의: `session.typingMode`, `session.typingIntervalSeconds`.

[타이핑 표시기](/concepts/typing-indicators)를 참조하십시오.

<a id="agentsdefaultssandbox"></a>

### `agents.defaults.sandbox`

임베디드 agent에 대한 선택적 샌드박싱입니다. 전체 가이드는 [샌드박싱](/gateway/sandboxing)을 참조하십시오.

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // off | non-main | all
        backend: "docker", // docker | ssh | openshell
        scope: "agent", // session | agent | shared
        workspaceAccess: "none", // none | ro | rw
        workspaceRoot: "~/.openclaw/sandboxes",
        docker: {
          image: "openclaw-sandbox:bookworm-slim",
          containerPrefix: "openclaw-sbx-",
          workdir: "/workspace",
          readOnlyRoot: true,
          tmpfs: ["/tmp", "/var/tmp", "/run"],
          network: "none",
          user: "1000:1000",
          capDrop: ["ALL"],
          env: { LANG: "C.UTF-8" },
          setupCommand: "apt-get update && apt-get install -y git curl jq",
          pidsLimit: 256,
          memory: "1g",
          memorySwap: "2g",
          cpus: 1,
          ulimits: {
            nofile: { soft: 1024, hard: 2048 },
            nproc: 256,
          },
          seccompProfile: "/path/to/seccomp.json",
          apparmorProfile: "openclaw-sandbox",
          dns: ["1.1.1.1", "8.8.8.8"],
          extraHosts: ["internal.service:10.0.0.5"],
          binds: ["/home/user/source:/source:rw"],
        },
        ssh: {
          target: "user@gateway-host:22",
          command: "ssh",
          workspaceRoot: "/tmp/openclaw-sandboxes",
          strictHostKeyChecking: true,
          updateHostKeys: true,
          identityFile: "~/.ssh/id_ed25519",
          certificateFile: "~/.ssh/id_ed25519-cert.pub",
          knownHostsFile: "~/.ssh/known_hosts",
          // SecretRefs / 인라인 콘텐츠도 지원:
          // identityData: { source: "env", provider: "default", id: "SSH_IDENTITY" },
          // certificateData: { source: "env", provider: "default", id: "SSH_CERTIFICATE" },
          // knownHostsData: { source: "env", provider: "default", id: "SSH_KNOWN_HOSTS" },
        },
        browser: {
          enabled: false,
          image: "openclaw-sandbox-browser:bookworm-slim",
          network: "openclaw-sandbox-browser",
          cdpPort: 9222,
          cdpSourceRange: "172.21.0.1/32",
          vncPort: 5900,
          noVncPort: 6080,
          headless: false,
          enableNoVnc: true,
          allowHostControl: false,
          autoStart: true,
          autoStartTimeoutMs: 12000,
        },
        prune: {
          idleHours: 24,
          maxAgeDays: 7,
        },
      },
    },
  },
  tools: {
    sandbox: {
      tools: {
        allow: [
          "exec",
          "process",
          "read",
          "write",
          "edit",
          "apply_patch",
          "sessions_list",
          "sessions_history",
          "sessions_send",
          "sessions_spawn",
          "session_status",
        ],
        deny: ["browser", "canvas", "nodes", "cron", "discord", "gateway"],
      },
    },
  },
}
```

<Accordion title="Sandbox 세부 정보">

**Backend:**

- `docker`: 로컬 Docker 런타임(기본값)
- `ssh`: 일반 SSH 기반 원격 런타임
- `openshell`: OpenShell 런타임

`backend: "openshell"`이 선택되면 런타임별 설정은 `plugins.entries.openshell.config`로 이동합니다.

**SSH backend 구성:**

- `target`: `user@host[:port]` 형식의 SSH 대상
- `command`: SSH 클라이언트 명령(기본값: `ssh`)
- `workspaceRoot`: scope별 workspace에 사용되는 절대 원격 루트
- `identityFile` / `certificateFile` / `knownHostsFile`: OpenSSH에 전달되는 기존 로컬 파일
- `identityData` / `certificateData` / `knownHostsData`: 런타임에 OpenClaw가 임시 파일로 구체화하는 인라인 콘텐츠 또는 SecretRef
- `strictHostKeyChecking` / `updateHostKeys`: OpenSSH 호스트 키 정책 노브

**SSH 인증 우선순위:**

- `identityData`가 `identityFile`보다 우선
- `certificateData`가 `certificateFile`보다 우선
- `knownHostsData`가 `knownHostsFile`보다 우선
- SecretRef 기반 `*Data` 값은 sandbox session이 시작되기 전 활성 secrets 런타임 스냅샷에서 해결됩니다

**SSH backend 동작:**

- create 또는 recreate 이후 원격 workspace를 한 번 시드
- 그런 다음 원격 SSH workspace를 정규로 유지
- `exec`, 파일 tool, 미디어 경로를 SSH를 통해 라우팅
- 원격 변경 사항을 호스트로 자동 동기화하지 않음
- sandbox 브라우저 컨테이너를 지원하지 않음

**Workspace 접근:**

- `none`: `~/.openclaw/sandboxes` 아래의 scope별 sandbox workspace
- `ro`: `/workspace`의 sandbox workspace, agent workspace가 `/agent`에 읽기 전용으로 마운트됨
- `rw`: agent workspace가 `/workspace`에 읽기/쓰기로 마운트됨

**Scope:**

- `session`: session별 컨테이너 + workspace
- `agent`: agent당 하나의 컨테이너 + workspace(기본값)
- `shared`: 공유 컨테이너 및 workspace(session 간 격리 없음)

**OpenShell plugin 구성:**

```json5
{
  plugins: {
    entries: {
      openshell: {
        enabled: true,
        config: {
          mode: "mirror", // mirror | remote
          from: "openclaw",
          remoteWorkspaceDir: "/sandbox",
          remoteAgentWorkspaceDir: "/agent",
          gateway: "lab", // 선택 사항
          gatewayEndpoint: "https://lab.example", // 선택 사항
          policy: "strict", // 선택적 OpenShell 정책 id
          providers: ["openai"], // 선택 사항
          autoProviders: true,
          timeoutSeconds: 120,
        },
      },
    },
  },
}
```

**OpenShell 모드:**

- `mirror`: exec 전 로컬에서 원격을 시드하고 exec 후 다시 동기화; 로컬 workspace가 정규로 유지됨
- `remote`: sandbox가 생성될 때 원격을 한 번 시드한 다음 원격 workspace를 정규로 유지

`remote` 모드에서는 OpenClaw 외부에서 이루어진 호스트 로컬 편집이 시드 단계 이후 sandbox로 자동 동기화되지 않습니다.
전송은 OpenShell sandbox로의 SSH이지만, plugin이 sandbox 라이프사이클과 선택적 mirror 동기화를 소유합니다.

**`setupCommand`**는 컨테이너 생성 후 한 번 실행됩니다(`sh -lc`를 통해). 네트워크 송출, 쓰기 가능한 루트, root 사용자가 필요합니다.

**컨테이너는 기본적으로 `network: "none"`입니다** — agent가 송출 접근이 필요한 경우 `"bridge"`(또는 사용자 정의 브리지 네트워크)로 설정하십시오.
`"host"`는 차단됩니다. `"container:<id>"`는 `sandbox.docker.dangerouslyAllowContainerNamespaceJoin: true`(비상 해제)를 명시적으로 설정하지 않는 한 기본적으로 차단됩니다.

**인바운드 첨부 파일**은 활성 workspace의 `media/inbound/*`에 스테이징됩니다.

**`docker.binds`**는 추가 호스트 디렉토리를 마운트하며; 전역 및 agent별 binds가 병합됩니다.

**샌드박싱된 브라우저** (`sandbox.browser.enabled`): 컨테이너의 Chromium + CDP. noVNC URL이 시스템 프롬프트에 주입됩니다. `openclaw.json`에서 `browser.enabled`를 요구하지 않습니다.
noVNC 관찰자 접근은 기본적으로 VNC 인증을 사용하며 OpenClaw는 단기 토큰 URL을 내보냅니다(공유 URL에 비밀번호를 노출하는 대신).

- `allowHostControl: false`(기본값)는 샌드박싱된 session이 호스트 브라우저를 대상으로 하는 것을 차단합니다.
- `network`는 기본적으로 `openclaw-sandbox-browser`(전용 브리지 네트워크)입니다. 글로벌 브리지 연결을 명시적으로 원할 때만 `bridge`로 설정하십시오.
- `cdpSourceRange`는 선택적으로 컨테이너 가장자리에서 CDP 인그레스를 CIDR 범위(예: `172.21.0.1/32`)로 제한합니다.
- `sandbox.browser.binds`는 sandbox 브라우저 컨테이너에만 추가 호스트 디렉토리를 마운트합니다. 설정된 경우(`[]` 포함), 브라우저 컨테이너에 대해 `docker.binds`를 대체합니다.
- 시작 기본값은 `scripts/sandbox-browser-entrypoint.sh`에 정의되어 있으며 컨테이너 호스트에 맞게 튜닝되어 있습니다:
  - `--remote-debugging-address=127.0.0.1`
  - `--remote-debugging-port=<OPENCLAW_BROWSER_CDP_PORT에서 파생됨>`
  - `--user-data-dir=${HOME}/.chrome`
  - `--no-first-run`
  - `--no-default-browser-check`
  - `--disable-3d-apis`
  - `--disable-gpu`
  - `--disable-software-rasterizer`
  - `--disable-dev-shm-usage`
  - `--disable-background-networking`
  - `--disable-features=TranslateUI`
  - `--disable-breakpad`
  - `--disable-crash-reporter`
  - `--renderer-process-limit=2`
  - `--no-zygote`
  - `--metrics-recording-only`
  - `--disable-extensions` (기본적으로 활성화됨)
  - `--disable-3d-apis`, `--disable-software-rasterizer`, `--disable-gpu`는
    기본적으로 활성화되어 있으며 WebGL/3D 사용이 필요한 경우
    `OPENCLAW_BROWSER_DISABLE_GRAPHICS_FLAGS=0`으로 비활성화할 수 있습니다.
  - `OPENCLAW_BROWSER_DISABLE_EXTENSIONS=0`은 워크플로우가 의존하는 경우
    extension을 다시 활성화합니다.
  - `--renderer-process-limit=2`는
    `OPENCLAW_BROWSER_RENDERER_PROCESS_LIMIT=<N>`으로 변경할 수 있습니다; Chromium의 기본
    프로세스 제한을 사용하려면 `0`으로 설정하십시오.
  - 그리고 `noSandbox`가 활성화된 경우 `--no-sandbox`와 `--disable-setuid-sandbox`가 추가됩니다.
  - 기본값은 컨테이너 이미지 기준선입니다; 컨테이너 기본값을 변경하려면 사용자 정의 entrypoint가 있는
    사용자 정의 브라우저 이미지를 사용하십시오.

</Accordion>

브라우저 샌드박싱과 `sandbox.docker.binds`는 Docker 전용입니다.

이미지 빌드:

```bash
scripts/sandbox-setup.sh           # 메인 sandbox 이미지
scripts/sandbox-browser-setup.sh   # 선택적 브라우저 이미지
```

### `agents.list` (agent별 재정의)

```json5
{
  agents: {
    list: [
      {
        id: "main",
        default: true,
        name: "Main Agent",
        workspace: "~/.openclaw/workspace",
        agentDir: "~/.openclaw/agents/main/agent",
        model: "anthropic/claude-opus-4-6", // 또는 { primary, fallbacks }
        thinkingDefault: "high", // agent별 thinking 레벨 재정의
        reasoningDefault: "on", // agent별 reasoning 가시성 재정의
        fastModeDefault: false, // agent별 fast 모드 재정의
        embeddedHarness: { runtime: "auto", fallback: "pi" },
        params: { cacheRetention: "none" }, // defaults.models params를 키별로 재정의
        skills: ["docs-search"], // 설정 시 agents.defaults.skills 대체
        identity: {
          name: "Samantha",
          theme: "helpful sloth",
          emoji: "🦥",
          avatar: "avatars/samantha.png",
        },
        groupChat: { mentionPatterns: ["@openclaw"] },
        sandbox: { mode: "off" },
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace/openclaw",
          },
        },
        subagents: { allowAgents: ["*"] },
        tools: {
          profile: "coding",
          allow: ["browser"],
          deny: ["canvas"],
          elevated: { enabled: true },
        },
      },
    ],
  },
}
```

- `id`: 안정적인 agent id(필수).
- `default`: 여러 개가 설정된 경우 첫 번째가 우선합니다(경고 기록됨). 설정되지 않은 경우 list의 첫 번째 항목이 기본값입니다.
- `model`: 문자열 형식은 `primary`만 재정의합니다; 객체 형식 `{ primary, fallbacks }`는 둘 다 재정의합니다(`[]`는 전역 폴백을 비활성화). `primary`만 재정의하는 cron job은 `fallbacks: []`로 설정하지 않는 한 여전히 기본 폴백을 상속합니다.
- `params`: `agents.defaults.models`의 선택된 모델 항목에 병합되는 agent별 스트림 파라미터입니다. 전체 모델 카탈로그를 복제하지 않고 `cacheRetention`, `temperature`, `maxTokens`와 같은 agent별 재정의에 이를 사용하십시오.
- `skills`: 선택적 agent별 skill 허용 목록입니다. 생략된 경우, agent는 설정된 경우 `agents.defaults.skills`를 상속하며; 명시적 목록은 병합 대신 기본값을 대체하고, `[]`는 skill이 없음을 의미합니다.
- `thinkingDefault`: 선택적 agent별 기본 thinking 레벨(`off | minimal | low | medium | high | xhigh | adaptive | max`). 메시지별 또는 session 재정의가 설정되지 않을 때 이 agent에 대해 `agents.defaults.thinkingDefault`를 재정의합니다.
- `reasoningDefault`: 선택적 agent별 기본 reasoning 가시성(`on | off | stream`). 메시지별 또는 session reasoning 재정의가 설정되지 않았을 때 적용됩니다.
- `fastModeDefault`: 선택적 agent별 fast 모드 기본값(`true | false`). 메시지별 또는 session fast-mode 재정의가 설정되지 않았을 때 적용됩니다.
- `embeddedHarness`: 선택적 agent별 저수준 harness 정책 재정의입니다. 다른 agent가 기본 PI 폴백을 유지하는 동안 하나의 agent를 Codex 전용으로 만들려면 `{ runtime: "codex", fallback: "none" }`을 사용하십시오.
- `runtime`: 선택적 agent별 런타임 기술자입니다. Agent가 기본적으로 ACP harness session을 사용해야 하는 경우 `runtime.acp` 기본값(`agent`, `backend`, `mode`, `cwd`)과 함께 `type: "acp"`를 사용하십시오.
- `identity.avatar`: workspace 상대 경로, `http(s)` URL, 또는 `data:` URI.
- `identity`는 기본값을 도출합니다: `emoji`에서 `ackReaction`, `name`/`emoji`에서 `mentionPatterns`.
- `subagents.allowAgents`: `sessions_spawn`에 대한 agent id 허용 목록(`["*"]` = 모두; 기본값: 동일 agent만).
- Sandbox 상속 가드: 요청자 session이 샌드박싱된 경우, `sessions_spawn`은 샌드박싱 없이 실행될 대상을 거부합니다.
- `subagents.requireAgentId`: true인 경우, `agentId`를 생략한 `sessions_spawn` 호출을 차단합니다(명시적 프로파일 선택 강제; 기본값: false).

---

## 다중 agent 라우팅

하나의 Gateway 내에서 여러 격리된 agent를 실행합니다. [다중 agent](/concepts/multi-agent)를 참조하십시오.

```json5
{
  agents: {
    list: [
      { id: "home", default: true, workspace: "~/.openclaw/workspace-home" },
      { id: "work", workspace: "~/.openclaw/workspace-work" },
    ],
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },
  ],
}
```

### Binding match 필드

- `type` (선택 사항): 일반 라우팅의 경우 `route`(타입 누락 시 기본적으로 route), 지속적인 ACP 대화 binding의 경우 `acp`.
- `match.channel` (필수)
- `match.accountId` (선택 사항; `*` = 모든 계정; 생략 시 = 기본 계정)
- `match.peer` (선택 사항; `{ kind: direct|group|channel, id }`)
- `match.guildId` / `match.teamId` (선택 사항; 채널별)
- `acp` (선택 사항; `type: "acp"`에만 해당): `{ mode, label, cwd, backend }`

**결정론적 매칭 순서:**

1. `match.peer`
2. `match.guildId`
3. `match.teamId`
4. `match.accountId` (정확 일치, peer/guild/team 없음)
5. `match.accountId: "*"` (채널 전체)
6. 기본 agent

각 계층 내에서 첫 번째로 일치하는 `bindings` 항목이 우선합니다.

`type: "acp"` 항목의 경우, OpenClaw는 정확한 대화 identity(`match.channel` + 계정 + `match.peer.id`)로 해결하며 위의 route binding 계층 순서를 사용하지 않습니다.

### Agent별 접근 프로파일

<Accordion title="전체 접근 (sandbox 없음)">

```json5
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/.openclaw/workspace-personal",
        sandbox: { mode: "off" },
      },
    ],
  },
}
```

</Accordion>

<Accordion title="읽기 전용 tool + workspace">

```json5
{
  agents: {
    list: [
      {
        id: "family",
        workspace: "~/.openclaw/workspace-family",
        sandbox: { mode: "all", scope: "agent", workspaceAccess: "ro" },
        tools: {
          allow: [
            "read",
            "sessions_list",
            "sessions_history",
            "sessions_send",
            "sessions_spawn",
            "session_status",
          ],
          deny: ["write", "edit", "apply_patch", "exec", "process", "browser"],
        },
      },
    ],
  },
}
```

</Accordion>

<Accordion title="파일시스템 접근 없음 (메시징 전용)">

```json5
{
  agents: {
    list: [
      {
        id: "public",
        workspace: "~/.openclaw/workspace-public",
        sandbox: { mode: "all", scope: "agent", workspaceAccess: "none" },
        tools: {
          allow: [
            "sessions_list",
            "sessions_history",
            "sessions_send",
            "sessions_spawn",
            "session_status",
            "whatsapp",
            "telegram",
            "slack",
            "discord",
            "gateway",
          ],
          deny: [
            "read",
            "write",
            "edit",
            "apply_patch",
            "exec",
            "process",
            "browser",
            "canvas",
            "nodes",
            "cron",
            "gateway",
            "image",
          ],
        },
      },
    ],
  },
}
```

</Accordion>

우선순위 세부 사항은 [다중 agent Sandbox 및 Tools](/tools/multi-agent-sandbox-tools)를 참조하십시오.

---

## Session

```json5
{
  session: {
    scope: "per-sender",
    dmScope: "main", // main | per-peer | per-channel-peer | per-account-channel-peer
    identityLinks: {
      alice: ["telegram:123456789", "discord:987654321012345678"],
    },
    reset: {
      mode: "daily", // daily | idle
      atHour: 4,
      idleMinutes: 60,
    },
    resetByType: {
      thread: { mode: "daily", atHour: 4 },
      direct: { mode: "idle", idleMinutes: 240 },
      group: { mode: "idle", idleMinutes: 120 },
    },
    resetTriggers: ["/new", "/reset"],
    store: "~/.openclaw/agents/{agentId}/sessions/sessions.json",
    parentForkMaxTokens: 100000, // 이 토큰 수 이상에서 parent-thread fork 건너뛰기 (0은 비활성화)
    maintenance: {
      mode: "warn", // warn | enforce
      pruneAfter: "30d",
      maxEntries: 500,
      rotateBytes: "10mb",
      resetArchiveRetention: "30d", // 기간 또는 false
      maxDiskBytes: "500mb", // 선택적 하드 예산
      highWaterBytes: "400mb", // 선택적 정리 목표
    },
    threadBindings: {
      enabled: true,
      idleHours: 24, // 기본 비활성 자동 unfocus 시간 (`0`은 비활성화)
      maxAgeHours: 0, // 기본 하드 최대 수명 시간 (`0`은 비활성화)
    },
    mainKey: "main", // 레거시 (런타임은 항상 "main"을 사용)
    agentToAgent: { maxPingPongTurns: 5 },
    sendPolicy: {
      rules: [{ action: "deny", match: { channel: "discord", chatType: "group" } }],
      default: "allow",
    },
  },
}
```

<Accordion title="Session 필드 세부 정보">

- **`scope`**: 그룹 채팅 컨텍스트에 대한 기본 session 그룹화 전략입니다.
  - `per-sender`(기본값): 각 발신자는 채널 컨텍스트 내에서 격리된 session을 얻습니다.
  - `global`: 채널 컨텍스트의 모든 참여자가 단일 session을 공유합니다(공유 컨텍스트가 의도된 경우에만 사용).
- **`dmScope`**: DM이 그룹화되는 방식입니다.
  - `main`: 모든 DM이 메인 session을 공유합니다.
  - `per-peer`: 채널 전반에 걸쳐 발신자 id로 격리합니다.
  - `per-channel-peer`: 채널 + 발신자당 격리합니다(다중 사용자 인박스에 권장).
  - `per-account-channel-peer`: 계정 + 채널 + 발신자당 격리합니다(다중 계정에 권장).
- **`identityLinks`**: 채널 간 session 공유를 위해 정규 id를 provider 접두사 peer에 매핑합니다.
- **`reset`**: 기본 reset 정책입니다. `daily`는 로컬 시간 `atHour`에 리셋하고; `idle`은 `idleMinutes` 후 리셋합니다. 둘 다 구성된 경우 먼저 만료되는 것이 우선합니다.
- **`resetByType`**: 타입별 재정의(`direct`, `group`, `thread`). 레거시 `dm`은 `direct`의 별칭으로 허용됩니다.
- **`parentForkMaxTokens`**: fork된 thread session을 생성할 때 허용되는 최대 parent-session `totalTokens`(기본값 `100000`).
  - Parent `totalTokens`가 이 값을 초과하면, OpenClaw는 parent transcript 기록을 상속하는 대신 새로운 thread session을 시작합니다.
  - 이 가드를 비활성화하고 항상 parent forking을 허용하려면 `0`으로 설정하십시오.
- **`mainKey`**: 레거시 필드입니다. 런타임은 메인 direct-chat 버킷에 대해 항상 `"main"`을 사용합니다.
- **`agentToAgent.maxPingPongTurns`**: agent 간 교환 중 agent 간의 최대 reply-back 턴(정수, 범위: `0`–`5`). `0`은 ping-pong 체이닝을 비활성화합니다.
- **`sendPolicy`**: `channel`, `chatType`(`direct|group|channel`, 레거시 `dm` 별칭 포함), `keyPrefix`, 또는 `rawKeyPrefix`로 매칭합니다. 첫 번째 deny가 우선합니다.
- **`maintenance`**: session 저장소 정리 + 보존 제어.
  - `mode`: `warn`은 경고만 내보내고; `enforce`는 정리를 적용합니다.
  - `pruneAfter`: 오래된 항목의 나이 컷오프(기본값 `30d`).
  - `maxEntries`: `sessions.json`의 최대 항목 수(기본값 `500`).
  - `rotateBytes`: 이 크기를 초과할 때 `sessions.json`을 회전(기본값 `10mb`).
  - `resetArchiveRetention`: `*.reset.<timestamp>` transcript 아카이브에 대한 보존. 기본값은 `pruneAfter`; 비활성화하려면 `false`로 설정하십시오.
  - `maxDiskBytes`: 선택적 sessions 디렉토리 디스크 예산. `warn` 모드에서는 경고를 기록하고; `enforce` 모드에서는 가장 오래된 artifact/session을 먼저 제거합니다.
  - `highWaterBytes`: 예산 정리 후 선택적 목표. 기본값은 `maxDiskBytes`의 `80%`.
- **`threadBindings`**: thread 바인딩된 session 기능에 대한 전역 기본값.
  - `enabled`: 마스터 기본 스위치(provider가 재정의할 수 있음; Discord는 `channels.discord.threadBindings.enabled` 사용)
  - `idleHours`: 기본 비활성 자동 unfocus 시간(`0`은 비활성화; provider가 재정의할 수 있음)
  - `maxAgeHours`: 기본 하드 최대 수명 시간(`0`은 비활성화; provider가 재정의할 수 있음)

</Accordion>

---

## Messages

```json5
{
  messages: {
    responsePrefix: "🦞", // 또는 "auto"
    ackReaction: "👀",
    ackReactionScope: "group-mentions", // group-mentions | group-all | direct | all
    removeAckAfterReply: false,
    queue: {
      mode: "collect", // steer | followup | collect | steer-backlog | steer+backlog | queue | interrupt
      debounceMs: 1000,
      cap: 20,
      drop: "summarize", // old | new | summarize
      byChannel: {
        whatsapp: "collect",
        telegram: "collect",
      },
    },
    inbound: {
      debounceMs: 2000, // 0은 비활성화
      byChannel: {
        whatsapp: 5000,
        slack: 1500,
      },
    },
  },
}
```

### 응답 접두사

채널/계정별 재정의: `channels.<channel>.responsePrefix`, `channels.<channel>.accounts.<id>.responsePrefix`.

해결(가장 구체적인 것이 우선): 계정 → 채널 → 전역. `""`은 비활성화하고 계단식을 중지합니다. `"auto"`는 `[{identity.name}]`을 도출합니다.

**템플릿 변수:**

| 변수              | 설명                   | 예제                        |
| ----------------- | ---------------------- | --------------------------- |
| `{model}`         | 짧은 모델 이름         | `claude-opus-4-6`           |
| `{modelFull}`     | 전체 모델 식별자       | `anthropic/claude-opus-4-6` |
| `{provider}`      | Provider 이름          | `anthropic`                 |
| `{thinkingLevel}` | 현재 thinking 레벨     | `high`, `low`, `off`        |
| `{identity.name}` | Agent identity 이름    | (`"auto"`와 동일)           |

변수는 대소문자를 구분하지 않습니다. `{think}`는 `{thinkingLevel}`의 별칭입니다.

### Ack 반응

- 활성 agent의 `identity.emoji`로 기본 설정되며, 그렇지 않으면 `"👀"`입니다. 비활성화하려면 `""`로 설정하십시오.
- 채널별 재정의: `channels.<channel>.ackReaction`, `channels.<channel>.accounts.<id>.ackReaction`.
- 해결 순서: 계정 → 채널 → `messages.ackReaction` → identity 폴백.
- Scope: `group-mentions`(기본값), `group-all`, `direct`, `all`.
- `removeAckAfterReply`: Slack, Discord, Telegram에서 응답 후 ack를 제거합니다.
- `messages.statusReactions.enabled`: Slack, Discord, Telegram에서 라이프사이클 상태 반응을 활성화합니다.
  Slack과 Discord에서는, 설정되지 않은 경우 ack 반응이 활성화되어 있을 때 상태 반응이 활성 상태로 유지됩니다.
  Telegram에서는, 라이프사이클 상태 반응을 활성화하려면 명시적으로 `true`로 설정하십시오.

### 인바운드 debounce

동일한 발신자로부터의 빠른 텍스트 전용 메시지를 단일 agent 턴으로 배치합니다. 미디어/첨부 파일은 즉시 플러시됩니다. 제어 명령은 debounce를 우회합니다.

### TTS (text-to-speech)

```json5
{
  messages: {
    tts: {
      auto: "always", // off | always | inbound | tagged
      mode: "final", // final | all
      provider: "elevenlabs",
      summaryModel: "openai/gpt-4.1-mini",
      modelOverrides: { enabled: true },
      maxTextLength: 4000,
      timeoutMs: 30000,
      prefsPath: "~/.openclaw/settings/tts.json",
      elevenlabs: {
        apiKey: "elevenlabs_api_key",
        baseUrl: "https://api.elevenlabs.io",
        voiceId: "voice_id",
        modelId: "eleven_multilingual_v2",
        seed: 42,
        applyTextNormalization: "auto",
        languageCode: "en",
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true,
          speed: 1.0,
        },
      },
      openai: {
        apiKey: "openai_api_key",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4o-mini-tts",
        voice: "alloy",
      },
    },
  },
}
```

- `auto`는 기본 자동 TTS 모드를 제어합니다: `off`, `always`, `inbound`, `tagged`. `/tts on|off`는 로컬 설정을 재정의할 수 있으며, `/tts status`는 유효 상태를 보여줍니다.
- `summaryModel`은 자동 요약을 위해 `agents.defaults.model.primary`를 재정의합니다.
- `modelOverrides`는 기본적으로 활성화되어 있으며; `modelOverrides.allowProvider`는 기본적으로 `false`입니다(옵트인).
- API 키는 `ELEVENLABS_API_KEY`/`XI_API_KEY` 및 `OPENAI_API_KEY`로 폴백됩니다.
- `openai.baseUrl`은 OpenAI TTS 엔드포인트를 재정의합니다. 해결 순서는 config, 그런 다음 `OPENAI_TTS_BASE_URL`, 그런 다음 `https://api.openai.com/v1`입니다.
- `openai.baseUrl`이 OpenAI가 아닌 엔드포인트를 가리키는 경우, OpenClaw는 이를 OpenAI 호환 TTS 서버로 취급하고 모델/음성 유효성 검사를 완화합니다.

---

## Talk

Talk 모드(macOS/iOS/Android)의 기본값입니다.

```json5
{
  talk: {
    provider: "elevenlabs",
    providers: {
      elevenlabs: {
        voiceId: "elevenlabs_voice_id",
        voiceAliases: {
          Clawd: "EXAVITQu4vr4xnSDxMaL",
          Roger: "CwhRBWXzGAHq8TQ4Fs17",
        },
        modelId: "eleven_v3",
        outputFormat: "mp3_44100_128",
        apiKey: "elevenlabs_api_key",
      },
    },
    silenceTimeoutMs: 1500,
    interruptOnSpeech: true,
  },
}
```

- 여러 Talk provider가 구성된 경우 `talk.provider`는 `talk.providers`의 키와 일치해야 합니다.
- 레거시 플랫 Talk 키(`talk.voiceId`, `talk.voiceAliases`, `talk.modelId`, `talk.outputFormat`, `talk.apiKey`)는 호환성 전용이며 `talk.providers.<provider>`로 자동 마이그레이션됩니다.
- Voice ID는 `ELEVENLABS_VOICE_ID` 또는 `SAG_VOICE_ID`로 폴백됩니다.
- `providers.*.apiKey`는 일반 텍스트 문자열 또는 SecretRef 객체를 허용합니다.
- `ELEVENLABS_API_KEY` 폴백은 Talk API 키가 구성되지 않은 경우에만 적용됩니다.
- `providers.*.voiceAliases`는 Talk 지시문이 친근한 이름을 사용할 수 있도록 합니다.
- `silenceTimeoutMs`는 Talk 모드가 사용자 침묵 후 transcript를 전송하기 전에 기다리는 시간을 제어합니다. 설정되지 않은 경우 플랫폼 기본 일시 중지 윈도우를 유지합니다(`macOS 및 Android에서 700ms, iOS에서 900ms`).

---

## 관련

- [구성 레퍼런스](/gateway/configuration-reference) — 기타 모든 구성 키
- [구성](/gateway/configuration) — 일반 작업 및 빠른 설정
- [구성 예시](/gateway/configuration-examples)
