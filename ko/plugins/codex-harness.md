---
summary: "번들된 `codex` 플러그인을 통한 Codex 앱 서버 하네스 설정, 선택 정책, 문제 해결"
read_when:
  - `codex/*` 모델을 Codex 앱 서버로 실행하려는 경우
  - PI 대비 Codex 하네스의 경계와 폴백 정책을 이해해야 하는 경우
title: "Codex Harness"
---

# Codex Harness

번들된 `codex` 플러그인은 OpenClaw가 내장 PI 하네스 대신 Codex 앱 서버를 통해 임베디드 에이전트 턴을 실행할 수 있게 해줍니다.

Codex가 저수준 에이전트 세션(모델 탐색, 네이티브 스레드 재개, 네이티브 컴팩션, 앱 서버 실행)을 소유하길 원할 때 사용하세요. OpenClaw는 여전히 채팅 채널, 세션 파일, 모델 선택, 도구, 승인, 미디어 전달, 가시 전사 미러를 소유합니다.

이 하네스는 기본적으로 꺼져 있습니다. `codex` 플러그인이 활성화되고 해석된 모델이 `codex/*` 모델이거나, `embeddedHarness.runtime: "codex"` 또는 `OPENCLAW_AGENT_RUNTIME=codex`를 명시적으로 강제할 때만 선택됩니다. `codex/*`를 구성하지 않으면 기존 PI, OpenAI, Anthropic, Gemini, 로컬, 커스텀 제공자 실행은 현재 동작을 유지합니다.

## 적합한 모델 접두사 선택

OpenClaw에는 OpenAI와 Codex 형태 접근을 위한 별도 경로가 있습니다:

| 모델 참조              | 런타임 경로                               | 사용 시점                                                                |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `openai/gpt-5.4`       | OpenAI 제공자 (OpenClaw/PI 파이프라인)    | `OPENAI_API_KEY`로 직접 OpenAI 플랫폼 API에 접근하려는 경우              |
| `openai-codex/gpt-5.4` | PI를 통한 OpenAI Codex OAuth 제공자       | Codex 앱 서버 하네스 없이 ChatGPT/Codex OAuth만 원하는 경우              |
| `codex/gpt-5.4`        | 번들 Codex 제공자 + Codex 하네스          | 임베디드 에이전트 턴에 네이티브 Codex 앱 서버 실행을 원하는 경우         |

Codex 하네스는 `codex/*` 모델 참조만 주장합니다. 기존 `openai/*`, `openai-codex/*`, Anthropic, Gemini, xAI, 로컬, 커스텀 제공자 참조는 일반 경로를 유지합니다.

## 요구사항

- 번들 `codex` 플러그인이 사용 가능한 OpenClaw.
- Codex 앱 서버 `0.118.0` 이상.
- 앱 서버 프로세스에서 사용 가능한 Codex 인증.

플러그인은 구버전 또는 버전이 없는 앱 서버 핸드셰이크를 차단합니다. 이는 OpenClaw가 테스트된 프로토콜 서페이스에만 머물도록 보장합니다.

라이브 및 Docker 스모크 테스트의 경우, 인증은 보통 `OPENAI_API_KEY`와 선택적 Codex CLI 파일(`~/.codex/auth.json`, `~/.codex/config.toml`)에서 옵니다. 로컬 Codex 앱 서버가 사용하는 인증 자료와 동일한 것을 사용하세요.

## 최소 설정

`codex/gpt-5.4`를 사용하고, 번들 플러그인을 활성화하며, `codex` 하네스를 강제합니다:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
  agents: {
    defaults: {
      model: "codex/gpt-5.4",
      embeddedHarness: {
        runtime: "codex",
        fallback: "none",
      },
    },
  },
}
```

설정이 `plugins.allow`를 사용한다면 거기에도 `codex`를 포함하세요:

```json5
{
  plugins: {
    allow: ["codex"],
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
}
```

`agents.defaults.model` 또는 에이전트 모델을 `codex/<model>`로 설정하면 번들 `codex` 플러그인이 자동으로 활성화됩니다. 공유 설정에서는 배포 의도를 명확히 하기 위해 명시적 플러그인 엔트리가 여전히 유용합니다.

## 다른 모델을 대체하지 않고 Codex 추가

`codex/*` 모델에는 Codex를, 그 외에는 PI를 사용하려면 `runtime: "auto"`를 유지하세요:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
  agents: {
    defaults: {
      model: {
        primary: "codex/gpt-5.4",
        fallbacks: ["openai/gpt-5.4", "anthropic/claude-opus-4-6"],
      },
      models: {
        "codex/gpt-5.4": { alias: "codex" },
        "codex/gpt-5.4-mini": { alias: "codex-mini" },
        "openai/gpt-5.4": { alias: "gpt" },
        "anthropic/claude-opus-4-6": { alias: "opus" },
      },
      embeddedHarness: {
        runtime: "auto",
        fallback: "pi",
      },
    },
  },
}
```

이 구성에서:

- `/model codex` 또는 `/model codex/gpt-5.4`는 Codex 앱 서버 하네스를 사용합니다.
- `/model gpt` 또는 `/model openai/gpt-5.4`는 OpenAI 제공자 경로를 사용합니다.
- `/model opus`는 Anthropic 제공자 경로를 사용합니다.
- Codex 이외 모델이 선택되면 PI가 호환 하네스로 남습니다.

## Codex 전용 배포

모든 임베디드 에이전트 턴이 Codex 하네스를 사용함을 증명해야 할 때는 PI 폴백을 비활성화합니다:

```json5
{
  agents: {
    defaults: {
      model: "codex/gpt-5.4",
      embeddedHarness: {
        runtime: "codex",
        fallback: "none",
      },
    },
  },
}
```

환경 변수 오버라이드:

```bash
OPENCLAW_AGENT_RUNTIME=codex \
OPENCLAW_AGENT_HARNESS_FALLBACK=none \
openclaw gateway run
```

폴백이 비활성화된 상태에서 Codex 플러그인이 꺼져 있거나, 요청된 모델이 `codex/*`가 아니거나, 앱 서버가 너무 오래되었거나, 앱 서버가 시작되지 않으면 OpenClaw는 조기에 실패합니다.

## 에이전트별 Codex 설정

한 에이전트를 Codex 전용으로 만들고, 기본 에이전트는 일반 자동 선택을 유지할 수 있습니다:

```json5
{
  agents: {
    defaults: {
      embeddedHarness: {
        runtime: "auto",
        fallback: "pi",
      },
    },
    list: [
      {
        id: "main",
        default: true,
        model: "anthropic/claude-opus-4-6",
      },
      {
        id: "codex",
        name: "Codex",
        model: "codex/gpt-5.4",
        embeddedHarness: {
          runtime: "codex",
          fallback: "none",
        },
      },
    ],
  },
}
```

일반 세션 명령으로 에이전트와 모델을 전환합니다. `/new`는 새 OpenClaw 세션을 만들고, 필요에 따라 Codex 하네스가 사이드카 앱 서버 스레드를 생성하거나 재개합니다. `/reset`은 해당 스레드의 OpenClaw 세션 바인딩을 지웁니다.

## 모델 탐색

기본적으로 Codex 플러그인은 앱 서버에 사용 가능한 모델을 요청합니다. 탐색이 실패하거나 타임아웃되면 번들된 폴백 카탈로그를 사용합니다:

- `codex/gpt-5.4`
- `codex/gpt-5.4-mini`
- `codex/gpt-5.2`

`plugins.entries.codex.config.discovery` 아래에서 탐색을 조정할 수 있습니다:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          discovery: {
            enabled: true,
            timeoutMs: 2500,
          },
        },
      },
    },
  },
}
```

시작 시 Codex를 탐색하지 않고 폴백 카탈로그에 머무르려면 탐색을 비활성화하세요:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          discovery: {
            enabled: false,
          },
        },
      },
    },
  },
}
```

## 앱 서버 연결 및 정책

기본적으로 플러그인은 Codex를 로컬에서 다음과 같이 시작합니다:

```bash
codex app-server --listen stdio://
```

이 기본값을 유지하면서 Codex 네이티브 정책만 조정할 수 있습니다:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          appServer: {
            approvalPolicy: "on-request",
            sandbox: "workspace-write",
            serviceTier: "priority",
          },
        },
      },
    },
  },
}
```

이미 실행 중인 앱 서버의 경우 WebSocket 전송을 사용하세요:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          appServer: {
            transport: "websocket",
            url: "ws://127.0.0.1:39175",
            authToken: "${CODEX_APP_SERVER_TOKEN}",
            requestTimeoutMs: 60000,
          },
        },
      },
    },
  },
}
```

지원되는 `appServer` 필드:

| 필드                | 기본값                                   | 의미                                                                             |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| `transport`         | `"stdio"`                                | `"stdio"`는 Codex를 스폰하고, `"websocket"`은 `url`에 연결합니다.                |
| `command`           | `"codex"`                                | stdio 전송용 실행 파일.                                                          |
| `args`              | `["app-server", "--listen", "stdio://"]` | stdio 전송용 인자.                                                               |
| `url`               | 설정 안 됨                               | WebSocket 앱 서버 URL.                                                           |
| `authToken`         | 설정 안 됨                               | WebSocket 전송용 베어러 토큰.                                                    |
| `headers`           | `{}`                                     | 추가 WebSocket 헤더.                                                             |
| `requestTimeoutMs`  | `60000`                                  | 앱 서버 제어 평면 호출 타임아웃.                                                 |
| `approvalPolicy`    | `"never"`                                | 스레드 시작/재개/턴에 전송되는 네이티브 Codex 승인 정책.                         |
| `sandbox`           | `"workspace-write"`                      | 스레드 시작/재개에 전송되는 네이티브 Codex 샌드박스 모드.                        |
| `approvalsReviewer` | `"user"`                                 | `"guardian_subagent"`로 설정하면 Codex guardian이 네이티브 승인을 검토합니다.    |
| `serviceTier`       | 설정 안 됨                               | 선택적 Codex 서비스 티어 (예: `"priority"`).                                     |

기존 환경 변수는 해당 설정 필드가 설정되지 않은 경우 로컬 테스트용 폴백으로 여전히 작동합니다:

- `OPENCLAW_CODEX_APP_SERVER_BIN`
- `OPENCLAW_CODEX_APP_SERVER_ARGS`
- `OPENCLAW_CODEX_APP_SERVER_APPROVAL_POLICY`
- `OPENCLAW_CODEX_APP_SERVER_SANDBOX`
- `OPENCLAW_CODEX_APP_SERVER_GUARDIAN=1`

반복 가능한 배포에는 설정이 권장됩니다.

## 일반적인 레시피

기본 stdio 전송으로 로컬 Codex 실행:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
}
```

PI 폴백을 비활성화한 Codex 전용 하네스 검증:

```json5
{
  embeddedHarness: {
    fallback: "none",
  },
  plugins: {
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
}
```

Guardian이 검토하는 Codex 승인:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          appServer: {
            approvalPolicy: "on-request",
            approvalsReviewer: "guardian_subagent",
            sandbox: "workspace-write",
          },
        },
      },
    },
  },
}
```

명시적 헤더가 있는 원격 앱 서버:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          appServer: {
            transport: "websocket",
            url: "ws://gateway-host:39175",
            headers: {
              "X-OpenClaw-Agent": "main",
            },
          },
        },
      },
    },
  },
}
```

모델 전환은 OpenClaw가 계속 제어합니다. OpenClaw 세션이 기존 Codex 스레드에 연결된 경우, 다음 턴은 현재 선택된 `codex/*` 모델, 제공자, 승인 정책, 샌드박스, 서비스 티어를 앱 서버에 다시 전송합니다. `codex/gpt-5.4`에서 `codex/gpt-5.2`로 전환해도 스레드 바인딩은 유지되고, Codex가 새로 선택된 모델로 계속 이어가도록 요청합니다.

## Codex 명령

번들 플러그인은 `/codex`를 인증된 슬래시 명령으로 등록합니다. 이는 범용이며 OpenClaw 텍스트 명령을 지원하는 모든 채널에서 작동합니다.

일반적인 형식:

- `/codex status`는 라이브 앱 서버 연결, 모델, 계정, 속도 제한, MCP 서버, 스킬을 표시합니다.
- `/codex models`는 라이브 Codex 앱 서버 모델을 나열합니다.
- `/codex threads [filter]`는 최근 Codex 스레드를 나열합니다.
- `/codex resume <thread-id>`는 현재 OpenClaw 세션을 기존 Codex 스레드에 연결합니다.
- `/codex compact`는 Codex 앱 서버에 연결된 스레드를 컴팩션하도록 요청합니다.
- `/codex review`는 연결된 스레드에 대한 Codex 네이티브 리뷰를 시작합니다.
- `/codex account`는 계정 및 속도 제한 상태를 표시합니다.
- `/codex mcp`는 Codex 앱 서버 MCP 서버 상태를 나열합니다.
- `/codex skills`는 Codex 앱 서버 스킬을 나열합니다.

`/codex resume`은 하네스가 일반 턴에 사용하는 것과 동일한 사이드카 바인딩 파일을 씁니다. 다음 메시지에서 OpenClaw는 해당 Codex 스레드를 재개하고, 현재 선택된 OpenClaw `codex/*` 모델을 앱 서버로 전달하며, 확장 히스토리를 활성 상태로 유지합니다.

명령 서페이스는 Codex 앱 서버 `0.118.0` 이상을 요구합니다. 개별 제어 메서드는, 미래 또는 커스텀 앱 서버가 해당 JSON-RPC 메서드를 노출하지 않으면 `unsupported by this Codex app-server`로 보고됩니다.

## 도구, 미디어, 컴팩션

Codex 하네스는 저수준 임베디드 에이전트 실행기만 변경합니다.

OpenClaw는 여전히 도구 목록을 구성하고 하네스로부터 동적 도구 결과를 받습니다. 텍스트, 이미지, 동영상, 음악, TTS, 승인, 메시징 도구 출력은 일반 OpenClaw 전달 경로를 계속 사용합니다.

선택된 모델이 Codex 하네스를 사용할 때 네이티브 스레드 컴팩션은 Codex 앱 서버에 위임됩니다. OpenClaw는 채널 히스토리, 검색, `/new`, `/reset`, 향후 모델/하네스 전환을 위해 전사 미러를 유지합니다. 미러에는 사용자 프롬프트, 최종 어시스턴트 텍스트, 그리고 앱 서버가 방출하는 가벼운 Codex 추론/계획 레코드가 포함됩니다.

미디어 생성은 PI를 필요로 하지 않습니다. 이미지, 동영상, 음악, PDF, TTS, 미디어 이해는 `agents.defaults.imageGenerationModel`, `videoGenerationModel`, `pdfModel`, `messages.tts` 같은 일치하는 제공자/모델 설정을 계속 사용합니다.

## 문제 해결

**`/model`에 Codex가 나타나지 않음:** `plugins.entries.codex.enabled`를 활성화하거나, `codex/*` 모델 참조를 설정하거나, `plugins.allow`가 `codex`를 제외하고 있는지 확인하세요.

**OpenClaw가 PI로 폴백함:** 테스트 중에는 `embeddedHarness.fallback: "none"` 또는 `OPENCLAW_AGENT_HARNESS_FALLBACK=none`을 설정하세요.

**앱 서버가 거부됨:** 앱 서버 핸드셰이크가 버전 `0.118.0` 이상을 보고하도록 Codex를 업그레이드하세요.

**모델 탐색이 느림:** `plugins.entries.codex.config.discovery.timeoutMs`를 낮추거나 탐색을 비활성화하세요.

**WebSocket 전송이 즉시 실패함:** `appServer.url`, `authToken`을 확인하고, 원격 앱 서버가 동일한 Codex 앱 서버 프로토콜 버전을 쓰는지 확인하세요.

**Codex가 아닌 모델이 PI를 사용함:** 예상된 동작입니다. Codex 하네스는 `codex/*` 모델 참조만 주장합니다.

## 관련 항목

- [에이전트 하네스 플러그인](/plugins/sdk-agent-harness)
- [모델 제공자](/concepts/model-providers)
- [설정 참조](/gateway/configuration-reference)
- [테스트](/help/testing#live-codex-app-server-harness-smoke)
