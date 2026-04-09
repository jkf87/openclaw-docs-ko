---
title: "구성"
description: "구성 개요: 일반 작업, 빠른 설정, 전체 레퍼런스 링크"
---

# 구성

OpenClaw는 `~/.openclaw/openclaw.json`에서 선택적 &lt;Tooltip tip="JSON5는 주석과 후행 쉼표를 지원합니다"&gt;**JSON5**&lt;/Tooltip&gt; 구성을 읽습니다.

파일이 없으면 OpenClaw는 안전한 기본값을 사용합니다. 구성을 추가하는 일반적인 이유:

- 채널을 연결하고 봇에 메시지를 보낼 수 있는 사람을 제어
- 모델, 툴, 샌드박싱, 또는 자동화(cron, 훅) 설정
- 세션, 미디어, 네트워킹, 또는 UI 조정

모든 사용 가능한 필드는 [전체 레퍼런스](/gateway/configuration-reference)를 참조하십시오.

::: tip
**구성이 처음이신가요?** 대화형 설정을 위해 `openclaw onboard`로 시작하거나, 완전한 복사-붙여넣기 구성을 위해 [구성 예시](/gateway/configuration-examples) 가이드를 확인하십시오.
:::


## 최소 구성

```json5
// ~/.openclaw/openclaw.json
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } },
}
```

## 구성 편집

**대화형 마법사**

```bash
    openclaw onboard       # 전체 온보딩 흐름
    openclaw configure     # 구성 마법사
    ```


  **CLI (한 줄 명령)**

```bash
    openclaw config get agents.defaults.workspace
    openclaw config set agents.defaults.heartbeat.every "2h"
    openclaw config unset plugins.entries.brave.config.webSearch.apiKey
    ```


  **Control UI**

[http://127.0.0.1:18789](http://127.0.0.1:18789)를 열고 **Config** 탭을 사용하십시오.
    Control UI는 라이브 구성 스키마에서 양식을 렌더링하며, 가용한 경우 필드 `title`/`description` 문서 메타데이터와 플러그인 및 채널 스키마를 포함하고, **Raw JSON** 편집기를 이스케이프 해치로 제공합니다. 드릴다운 UI 및 기타 툴링을 위해 게이트웨이는 `config.schema.lookup`도 노출하여 하나의 경로 범위 스키마 노드와 즉각적인 자식 요약을 가져올 수 있습니다.


  **직접 편집**

`~/.openclaw/openclaw.json`을 직접 편집하십시오. 게이트웨이는 파일을 감시하고 변경 사항을 자동으로 적용합니다([핫 리로드](#config-hot-reload) 참조).



## 엄격한 유효성 검사

::: warning
OpenClaw는 스키마와 완전히 일치하는 구성만 허용합니다. 알 수 없는 키, 잘못된 유형, 또는 유효하지 않은 값은 게이트웨이가 **시작을 거부**하도록 합니다. 유일한 루트 레벨 예외는 `$schema`(문자열)이며, 편집기가 JSON 스키마 메타데이터를 첨부할 수 있습니다.
:::


스키마 툴링 참고:

- `openclaw config schema`는 Control UI 및 구성 유효성 검사에서 사용하는 동일한 JSON 스키마 패밀리를 출력합니다.
- 해당 스키마 출력을 `openclaw.json`의 표준 기계 읽기 가능 계약으로 처리하십시오.
- `pnpm config:docs:check`는 현재 스키마 표면에 대한 문서 대면 구성 기준 아티팩트 드리프트를 감지합니다.

유효성 검사가 실패하는 경우:

- 게이트웨이가 부팅되지 않습니다
- 진단 명령만 작동합니다(`openclaw doctor`, `openclaw logs`, `openclaw health`, `openclaw status`)
- `openclaw doctor`를 실행하여 정확한 문제 확인
- `openclaw doctor --fix`(또는 `--yes`)를 실행하여 수정 적용

## 일반 작업

::: details 채널 설정 (WhatsApp, Telegram, Discord 등)
각 채널에는 `channels.&lt;provider&gt;` 아래에 자체 구성 섹션이 있습니다. 설정 단계는 전용 채널 페이지를 참조하십시오:

    - [WhatsApp](/channels/whatsapp) — `channels.whatsapp`
    - [Telegram](/channels/telegram) — `channels.telegram`
    - [Discord](/channels/discord) — `channels.discord`
    - [Feishu](/channels/feishu) — `channels.feishu`
    - [Google Chat](/channels/googlechat) — `channels.googlechat`
    - [Microsoft Teams](/channels/msteams) — `channels.msteams`
    - [Slack](/channels/slack) — `channels.slack`
    - [Signal](/channels/signal) — `channels.signal`
    - [iMessage](/channels/imessage) — `channels.imessage`
    - [Mattermost](/channels/mattermost) — `channels.mattermost`

    모든 채널은 동일한 DM 정책 패턴을 공유합니다:

    ```json5
    {
      channels: {
        telegram: {
          enabled: true,
          botToken: "123:abc",
          dmPolicy: "pairing",   // pairing | allowlist | open | disabled
          allowFrom: ["tg:123"], // allowlist/open에만 필요
        },
      },
    }
    ```
:::


  ::: details 모델 선택 및 구성
기본 모델과 선택적 폴백 설정:

    ```json5
    {
      agents: {
        defaults: {
          model: {
            primary: "anthropic/claude-sonnet-4-6",
            fallbacks: ["openai/gpt-5.4"],
          },
          models: {
            "anthropic/claude-sonnet-4-6": { alias: "Sonnet" },
            "openai/gpt-5.4": { alias: "GPT" },
          },
        },
      },
    }
    ```

    - `agents.defaults.models`는 모델 카탈로그를 정의하고 `/model`의 허용 목록 역할을 합니다.
    - 모델 refs는 `provider/model` 형식을 사용합니다(예: `anthropic/claude-opus-4-6`).
    - 사용자 정의/자가 호스팅 프로바이더의 경우, 레퍼런스의 [사용자 정의 프로바이더](/gateway/configuration-reference#custom-providers-and-base-urls)를 참조하십시오.
:::


  ::: details 봇에 메시지를 보낼 수 있는 사람 제어
DM 접근은 `dmPolicy`를 통해 채널별로 제어됩니다:

    - `"pairing"` (기본값): 알 수 없는 발신자는 승인을 위한 일회용 페어링 코드를 받습니다
    - `"allowlist"`: `allowFrom`에 있는 발신자만(또는 페어링된 허용 저장소)
    - `"open"`: 모든 인바운드 DM 허용(`allowFrom: ["*"]` 필요)
    - `"disabled"`: 모든 DM 무시

    그룹의 경우, `groupPolicy` + `groupAllowFrom` 또는 채널별 허용 목록을 사용하십시오.

    채널별 세부 정보는 [전체 레퍼런스](/gateway/configuration-reference#dm-and-group-access)를 참조하십시오.
:::


  ::: details 그룹 채팅 언급 게이팅 설정
그룹 메시지는 기본적으로 **언급 필요**합니다. 에이전트별 패턴 구성:

    ```json5
    {
      agents: {
        list: [
          {
            id: "main",
            groupChat: {
              mentionPatterns: ["@openclaw", "openclaw"],
            },
          },
        ],
      },
      channels: {
        whatsapp: {
          groups: { "*": { requireMention: true } },
        },
      },
    }
    ```
:::


  ::: details 에이전트별 스킬 제한
공유 기준에 `agents.defaults.skills`를 사용하고, `agents.list[].skills`로 특정 에이전트 재정의:

    ```json5
    {
      agents: {
        defaults: {
          skills: ["github", "weather"],
        },
        list: [
          { id: "writer" }, // github, weather 상속
          { id: "docs", skills: ["docs-search"] }, // 기본값 대체
          { id: "locked-down", skills: [] }, // 스킬 없음
        ],
      },
    }
    ```
:::


  ::: details 샌드박싱 활성화
격리된 Docker 컨테이너에서 에이전트 세션 실행:

    ```json5
    {
      agents: {
        defaults: {
          sandbox: {
            mode: "non-main",  // off | non-main | all
            scope: "agent",    // session | agent | shared
          },
        },
      },
    }
    ```

    먼저 이미지를 빌드하십시오: `scripts/sandbox-setup.sh`

    전체 가이드는 [샌드박싱](/gateway/sandboxing)을 참조하십시오.
:::


  ::: details 하트비트 설정 (주기적 체크인)
```json5
    {
      agents: {
        defaults: {
          heartbeat: {
            every: "30m",
            target: "last",
          },
        },
      },
    }
    ```

    - `every`: 기간 문자열 (`30m`, `2h`). 비활성화하려면 `0m`으로 설정.
    - `target`: `last` | `none` | `&lt;channel-id&gt;`
    - 전체 가이드는 [하트비트](/gateway/heartbeat)를 참조하십시오.
:::


  ::: details 다중 에이전트 라우팅 구성
별도의 워크스페이스와 세션을 가진 여러 격리된 에이전트 실행:

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

    바인딩 규칙 및 에이전트별 접근 프로파일은 [다중 에이전트](/concepts/multi-agent) 및 [전체 레퍼런스](/gateway/configuration-reference#multi-agent-routing)를 참조하십시오.
:::


  ::: details 구성을 여러 파일로 분할 ($include)
`$include`를 사용하여 큰 구성 구성:

    ```json5
    // ~/.openclaw/openclaw.json
    {
      gateway: { port: 18789 },
      agents: { $include: "./agents.json5" },
      broadcast: {
        $include: ["./clients/a.json5", "./clients/b.json5"],
      },
    }
    ```

    - **단일 파일**: 포함하는 객체를 대체합니다
    - **파일 배열**: 순서대로 깊이 병합됩니다(나중 것이 우선)
    - **형제 키**: 포함 후 병합됩니다(포함된 값을 재정의)
    - **중첩 포함**: 최대 10레벨 깊이까지 지원
:::

## 구성 핫 리로드

게이트웨이는 `~/.openclaw/openclaw.json`을 감시하고 변경 사항을 자동으로 적용합니다 — 대부분의 설정에서 수동 재시작이 필요하지 않습니다.

### 리로드 모드

| 모드                   | 동작                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **`hybrid`** (기본값) | 안전한 변경 사항을 즉시 핫 적용합니다. 중요한 변경 사항은 자동으로 재시작합니다.           |
| **`hot`**              | 안전한 변경 사항만 핫 적용합니다. 재시작이 필요할 때 경고를 기록합니다 — 직접 처리해야 합니다. |
| **`restart`**          | 안전 여부에 관계없이 모든 구성 변경 시 게이트웨이를 재시작합니다.                                 |
| **`off`**              | 파일 감시를 비활성화합니다. 변경 사항은 다음 수동 재시작 시 적용됩니다.                 |

```json5
{
  gateway: {
    reload: { mode: "hybrid", debounceMs: 300 },
  },
}
```

### 핫 적용 vs 재시작이 필요한 항목

대부분의 필드는 중단 없이 핫 적용됩니다. `hybrid` 모드에서는 재시작 필요 변경 사항이 자동으로 처리됩니다.

| 카테고리            | 필드                                                               | 재시작 필요? |
| ------------------- | -------------------------------------------------------------------- | --------------- |
| 채널            | `channels.*`, `web` (WhatsApp) — 모든 내장 및 확장 채널 | 아니요              |
| 에이전트 및 모델      | `agent`, `agents`, `models`, `routing`                               | 아니요              |
| 자동화          | `hooks`, `cron`, `agent.heartbeat`                                   | 아니요              |
| 세션 및 메시지 | `session`, `messages`                                                | 아니요              |
| 툴 및 미디어       | `tools`, `browser`, `skills`, `audio`, `talk`                        | 아니요              |
| UI 및 기타           | `ui`, `logging`, `identity`, `bindings`                              | 아니요              |
| 게이트웨이 서버      | `gateway.*` (포트, 바인드, 인증, tailscale, TLS, HTTP)                 | **예**         |
| 인프라      | `discovery`, `canvasHost`, `plugins`                                 | **예**         |

::: info NOTE
`gateway.reload`와 `gateway.remote`는 예외입니다 — 이를 변경해도 재시작이 **발생하지 않습니다**.
:::


## 구성 RPC (프로그래밍 방식 업데이트)

::: info NOTE
컨트롤 플레인 쓰기 RPC(`config.apply`, `config.patch`, `update.run`)는 `deviceId+clientIp`당 **60초당 3개 요청**으로 속도가 제한됩니다. 제한되면 RPC는 `retryAfterMs`와 함께 `UNAVAILABLE`을 반환합니다.
:::


안전/기본 흐름:

- `config.schema.lookup`: 얕은 스키마 노드, 일치하는 힌트 메타데이터, 드릴다운 툴링을 위한 즉각적인 자식 요약과 함께 하나의 경로 범위 구성 서브트리 검사
- `config.get`: 현재 스냅샷 + 해시 가져오기
- `config.patch`: 선호되는 부분 업데이트 경로
- `config.apply`: 전체 구성 교체만
- `update.run`: 명시적 자체 업데이트 + 재시작

전체 구성을 대체하지 않는 경우, `config.schema.lookup`을 먼저 사용한 후 `config.patch`를 선호하십시오.

::: details config.apply (전체 교체)
전체 구성을 한 번에 유효성 검사 + 작성하고 게이트웨이를 재시작합니다.

    ::: warning
`config.apply`는 **전체 구성**을 대체합니다. 부분 업데이트에는 `config.patch`를 사용하거나, 단일 키에는 `openclaw config set`를 사용하십시오.
:::


    ```bash
    openclaw gateway call config.get --params '{}'  # payload.hash 캡처
    openclaw gateway call config.apply --params '{
      "raw": "{ agents: { defaults: { workspace: \"~/.openclaw/workspace\" } } }",
      "baseHash": "&lt;hash&gt;",
      "sessionKey": "agent:main:whatsapp:direct:+15555550123"
    }'
    ```
:::


  ::: details config.patch (부분 업데이트)
기존 구성에 부분 업데이트를 병합합니다(JSON 병합 패치 시맨틱):

    - 객체는 재귀적으로 병합됩니다
    - `null`은 키를 삭제합니다
    - 배열은 대체됩니다

    ```bash
    openclaw gateway call config.patch --params '{
      "raw": "{ channels: { telegram: { groups: { \"*\": { requireMention: false } } } } }",
      "baseHash": "&lt;hash&gt;"
    }'
    ```
:::

## 환경 변수

OpenClaw는 부모 프로세스의 환경 변수와 다음에서 환경 변수를 읽습니다:

- 현재 작업 디렉토리의 `.env`(있는 경우)
- `~/.openclaw/.env`(전역 폴백)

두 파일 모두 기존 환경 변수를 재정의하지 않습니다. 구성에서 인라인 환경 변수를 설정할 수도 있습니다:

```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: { GROQ_API_KEY: "gsk-..." },
  },
}
```

::: details 셸 환경 임포트 (선택적)
활성화하고 예상 키가 설정되지 않은 경우, OpenClaw는 로그인 셸을 실행하고 누락된 키만 임포트합니다:

```json5
{
  env: {
    shellEnv: { enabled: true, timeoutMs: 15000 },
  },
}
```

환경 변수 동등: `OPENCLAW_LOAD_SHELL_ENV=1`
:::


::: details 구성 값의 환경 변수 치환
`${VAR_NAME}`으로 모든 구성 문자열 값에서 환경 변수 참조:

```json5
{
  gateway: { auth: { token: "${OPENCLAW_GATEWAY_TOKEN}" } },
  models: { providers: { custom: { apiKey: "${CUSTOM_API_KEY}" } } },
}
```

규칙:

- 대문자 이름만 일치: `[A-Z_][A-Z0-9_]*`
- 누락/빈 변수는 로드 시 오류를 발생시킵니다
- 리터럴 출력을 위해 `$${VAR}`로 이스케이프
- `$include` 파일 내에서 작동
- 인라인 치환: `"${BASE}/v1"` → `"https://api.example.com/v1"`
:::


::: details 시크릿 refs (env, file, exec)
SecretRef 객체를 지원하는 필드의 경우 다음을 사용할 수 있습니다:

```json5
{
  models: {
    providers: {
      openai: { apiKey: { source: "env", provider: "default", id: "OPENAI_API_KEY" } },
    },
  },
  skills: {
    entries: {
      "image-lab": {
        apiKey: {
          source: "file",
          provider: "filemain",
          id: "/skills/entries/image-lab/apiKey",
        },
      },
    },
  },
}
```

SecretRef 세부 정보는 [시크릿 관리](/gateway/secrets)를 참조하십시오.
지원되는 자격 증명 경로는 [SecretRef 자격 증명 표면](/reference/secretref-credential-surface)에 나열되어 있습니다.
:::


전체 우선순위 및 소스는 [환경](/help/environment)을 참조하십시오.

## 전체 레퍼런스

완전한 필드별 레퍼런스는 **[구성 레퍼런스](/gateway/configuration-reference)**를 참조하십시오.

---

_관련: [구성 예시](/gateway/configuration-examples) · [구성 레퍼런스](/gateway/configuration-reference) · [Doctor](/gateway/doctor)_
