---
summary: "CLI 백엔드: 선택적 MCP 툴 브리지를 포함한 로컬 AI CLI 폴백"
read_when:
  - API 프로바이더 장애 시 신뢰할 수 있는 폴백이 필요한 경우
  - Codex CLI 또는 다른 로컬 AI CLI를 실행하고 재사용하려는 경우
  - CLI 백엔드 툴 접근을 위한 MCP 루프백 브리지를 이해하려는 경우
title: "CLI 백엔드"
---

# CLI 백엔드 (폴백 런타임)

OpenClaw는 API 프로바이더가 다운되거나, 속도 제한이 걸리거나, 일시적으로 오작동할 때 **텍스트 전용 폴백**으로 **로컬 AI CLI**를 실행할 수 있습니다. 이는 의도적으로 보수적입니다:

- **OpenClaw 툴이 직접 주입되지 않습니다**, 하지만 `bundleMcp: true`를 가진 백엔드는 루프백 MCP 브리지를 통해 게이트웨이 툴을 받을 수 있습니다.
- 이를 지원하는 CLI에 대한 **JSONL 스트리밍**.
- **세션이 지원됩니다**(따라서 후속 턴이 일관성을 유지합니다).
- CLI가 이미지 경로를 허용하는 경우 **이미지를 통과**시킬 수 있습니다.

이것은 주요 경로가 아닌 **안전망**으로 설계되었습니다. 외부 API에 의존하지 않고 "항상 작동하는" 텍스트 응답을 원할 때 사용하십시오.

ACP 세션 컨트롤, 백그라운드 작업, 스레드/대화 바인딩, 지속적인 외부 코딩 세션을 갖춘 완전한 하네스 런타임을 원한다면, 대신 [ACP 에이전트](/tools/acp-agents)를 사용하십시오. CLI 백엔드는 ACP가 아닙니다.

## 초보자 친화적인 빠른 시작

번들 OpenAI 플러그인이 기본 백엔드를 등록하므로 Codex CLI를 **구성 없이** 사용할 수 있습니다:

```bash
openclaw agent --message "hi" --model codex-cli/gpt-5.4
```

게이트웨이가 launchd/systemd에서 실행되고 PATH가 최소한인 경우, 명령 경로만 추가하십시오:

```json5
{
  agents: {
    defaults: {
      cliBackends: {
        "codex-cli": {
          command: "/opt/homebrew/bin/codex",
        },
      },
    },
  },
}
```

이것으로 충분합니다. CLI 자체 외에 키나 추가 인증 구성이 필요하지 않습니다.

번들 CLI 백엔드를 게이트웨이 호스트의 **주요 메시지 프로바이더**로 사용하는 경우, OpenClaw는 이제 구성이 모델 ref나 `agents.defaults.cliBackends` 아래에서 해당 백엔드를 명시적으로 참조할 때 소유하는 번들 플러그인을 자동으로 로드합니다.

## 폴백으로 사용

기본 모델이 실패할 때만 실행되도록 폴백 목록에 CLI 백엔드를 추가하십시오:

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["codex-cli/gpt-5.4"],
      },
      models: {
        "anthropic/claude-opus-4-6": { alias: "Opus" },
        "codex-cli/gpt-5.4": {},
      },
    },
  },
}
```

참고:

- `agents.defaults.models`(허용 목록)를 사용하는 경우, CLI 백엔드 모델도 거기에 포함해야 합니다.
- 기본 프로바이더가 실패하면(인증, 속도 제한, 타임아웃), OpenClaw는 다음으로 CLI 백엔드를 시도합니다.

## 구성 개요

모든 CLI 백엔드는 다음 위치에 있습니다:

```
agents.defaults.cliBackends
```

각 항목은 **프로바이더 id**(예: `codex-cli`, `my-cli`)로 키가 지정됩니다.
프로바이더 id는 모델 ref의 왼쪽이 됩니다:

```
<provider>/<model>
```

### 구성 예시

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
          input: "arg",
          modelArg: "--model",
          modelAliases: {
            "claude-opus-4-6": "opus",
            "claude-sonnet-4-6": "sonnet",
          },
          sessionArg: "--session",
          sessionMode: "existing",
          sessionIdFields: ["session_id", "conversation_id"],
          systemPromptArg: "--system",
          // Codex 스타일 CLI는 프롬프트 파일을 대신 가리킬 수 있습니다:
          // systemPromptFileConfigArg: "-c",
          // systemPromptFileConfigKey: "model_instructions_file",
          systemPromptWhen: "first",
          imageArg: "--image",
          imageMode: "repeat",
          serialize: true,
        },
      },
    },
  },
}
```

## 작동 방식

1. 프로바이더 접두사(`codex-cli/...`)를 기반으로 **백엔드를 선택**합니다.
2. 동일한 OpenClaw 프롬프트 + 워크스페이스 컨텍스트를 사용하여 **시스템 프롬프트를 구성**합니다.
3. 세션 id와 함께 **CLI를 실행**하여(지원되는 경우) 기록이 일관되게 유지되도록 합니다.
4. 출력(JSON 또는 일반 텍스트)을 **파싱**하고 최종 텍스트를 반환합니다.
5. 백엔드별로 **세션 id를 유지**하므로 후속 작업이 동일한 CLI 세션을 재사용합니다.

<Note>
번들 Anthropic `claude-cli` 백엔드가 다시 지원됩니다. Anthropic 직원은
OpenClaw 스타일의 Claude CLI 사용이 다시 허용된다고 밝혔으므로, OpenClaw는
Anthropic이 새 정책을 게시하지 않는 한 이 통합을 위해 `claude -p` 사용을
허가된 것으로 취급합니다.
</Note>

번들 OpenAI `codex-cli` 백엔드는 Codex의 `model_instructions_file` 구성 재정의(`-c model_instructions_file="..."`)를 통해 OpenClaw의 시스템 프롬프트를 전달합니다. Codex는 Claude 스타일의 `--append-system-prompt` 플래그를 노출하지 않으므로, OpenClaw는 각 새 Codex CLI 세션에 대해 조립된 프롬프트를 임시 파일에 작성합니다.

## 세션

- CLI가 세션을 지원하는 경우, ID를 여러 플래그에 삽입해야 할 때 `sessionArg`(예: `--session-id`) 또는 `sessionArgs`(플레이스홀더 `{sessionId}`)를 설정하십시오.
- CLI가 다른 플래그를 가진 **재개 하위 명령**을 사용하는 경우, `resumeArgs`(재개 시 `args` 대체) 및 선택적으로 `resumeOutput`(JSON이 아닌 재개의 경우)을 설정하십시오.
- `sessionMode`:
  - `always`: 항상 세션 id를 보냅니다(저장된 것이 없으면 새 UUID).
  - `existing`: 이전에 저장된 세션 id가 있는 경우에만 보냅니다.
  - `none`: 세션 id를 보내지 않습니다.

직렬화 참고:

- `serialize: true`는 동일한 레인 실행을 순서대로 유지합니다.
- 대부분의 CLI는 하나의 프로바이더 레인에서 직렬화합니다.
- OpenClaw는 재로그인, 토큰 순환, 또는 변경된 인증 프로파일 자격 증명을 포함하여 백엔드 인증 상태가 변경될 때 저장된 CLI 세션 재사용을 삭제합니다.

## 이미지 (통과)

CLI가 이미지 경로를 허용하는 경우, `imageArg`를 설정하십시오:

```json5
imageArg: "--image",
imageMode: "repeat"
```

OpenClaw는 base64 이미지를 임시 파일에 작성합니다. `imageArg`가 설정된 경우, 해당 경로가 CLI 인수로 전달됩니다. `imageArg`가 없으면, OpenClaw는 파일 경로를 프롬프트에 추가합니다(경로 주입), 이는 일반 경로에서 로컬 파일을 자동으로 로드하는 CLI에 충분합니다.

## 입력 / 출력

- `output: "json"` (기본값)은 JSON을 파싱하고 텍스트 + 세션 id를 추출하려고 시도합니다.
- Gemini CLI JSON 출력의 경우, OpenClaw는 `usage`가 없거나 비어 있을 때 `response`에서 응답 텍스트를, `stats`에서 사용량을 읽습니다.
- `output: "jsonl"`은 JSONL 스트림을 파싱하고(예: Codex CLI `--json`) 최종 에이전트 메시지와 세션 식별자(있는 경우)를 추출합니다.
- `output: "text"`는 stdout를 최종 응답으로 취급합니다.

입력 모드:

- `input: "arg"` (기본값)은 프롬프트를 마지막 CLI 인수로 전달합니다.
- `input: "stdin"`은 프롬프트를 stdin을 통해 보냅니다.
- 프롬프트가 매우 길고 `maxPromptArgChars`가 설정된 경우, stdin이 사용됩니다.

## 기본값 (플러그인 소유)

번들 OpenAI 플러그인도 `codex-cli`에 대한 기본값을 등록합니다:

- `command: "codex"`
- `args: ["exec","--json","--color","never","--sandbox","workspace-write","--skip-git-repo-check"]`
- `resumeArgs: ["exec","resume","{sessionId}","--color","never","--sandbox","workspace-write","--skip-git-repo-check"]`
- `output: "jsonl"`
- `resumeOutput: "text"`
- `modelArg: "--model"`
- `imageArg: "--image"`
- `sessionMode: "existing"`

번들 Google 플러그인도 `google-gemini-cli`에 대한 기본값을 등록합니다:

- `command: "gemini"`
- `args: ["--output-format", "json", "--prompt", "{prompt}"]`
- `resumeArgs: ["--resume", "{sessionId}", "--output-format", "json", "--prompt", "{prompt}"]`
- `imageArg: "@"`
- `imagePathScope: "workspace"`
- `modelArg: "--model"`
- `sessionMode: "existing"`
- `sessionIdFields: ["session_id", "sessionId"]`

사전 조건: 로컬 Gemini CLI가 설치되어 있고 `PATH`에서 `gemini`로 사용 가능해야 합니다(`brew install gemini-cli` 또는 `npm install -g @google/gemini-cli`).

Gemini CLI JSON 참고:

- 응답 텍스트는 JSON `response` 필드에서 읽힙니다.
- `usage`가 없거나 비어 있으면 사용량이 `stats`로 폴백됩니다.
- `stats.cached`는 OpenClaw `cacheRead`로 정규화됩니다.
- `stats.input`이 없으면, OpenClaw는 `stats.input_tokens - stats.cached`에서 입력 토큰을 파생합니다.

필요한 경우에만 재정의하십시오(일반적: 절대 `command` 경로).

## 플러그인 소유 기본값

CLI 백엔드 기본값은 이제 플러그인 표면의 일부입니다:

- 플러그인은 `api.registerCliBackend(...)`로 등록합니다.
- 백엔드 `id`는 모델 refs의 프로바이더 접두사가 됩니다.
- `agents.defaults.cliBackends.<id>`의 사용자 구성은 여전히 플러그인 기본값을 재정의합니다.
- 백엔드별 구성 정리는 선택적 `normalizeConfig` 훅을 통해 플러그인 소유로 유지됩니다.

## 번들 MCP 오버레이

CLI 백엔드는 OpenClaw 툴 호출을 직접 받지 **않습니다**, 하지만 백엔드는 `bundleMcp: true`로 생성된 MCP 구성 오버레이를 선택할 수 있습니다.

현재 번들 동작:

- `claude-cli`: 생성된 strict MCP 구성 파일
- `codex-cli`: `mcp_servers`에 대한 인라인 구성 재정의
- `google-gemini-cli`: 생성된 Gemini 시스템 설정 파일

번들 MCP가 활성화된 경우, OpenClaw는:

- CLI 프로세스에 게이트웨이 툴을 노출하는 루프백 HTTP MCP 서버를 생성합니다
- 세션별 토큰(`OPENCLAW_MCP_TOKEN`)으로 브리지를 인증합니다
- 현재 세션, 계정, 채널 컨텍스트에 대한 툴 접근을 범위 지정합니다
- 현재 워크스페이스에 대해 활성화된 번들 MCP 서버를 로드합니다
- 기존 백엔드 MCP 구성/설정 형태와 병합합니다
- 소유 확장 프로그램의 백엔드 소유 통합 모드를 사용하여 실행 구성을 다시 작성합니다

MCP 서버가 활성화되지 않은 경우에도, 백엔드가 번들 MCP를 선택하면 백그라운드 실행이 격리된 상태로 유지되도록 OpenClaw는 여전히 strict 구성을 주입합니다.

## 제한 사항

- **직접 OpenClaw 툴 호출 없음.** OpenClaw는 툴 호출을 CLI 백엔드 프로토콜에 주입하지 않습니다. 백엔드는 `bundleMcp: true`를 선택할 때만 게이트웨이 툴을 볼 수 있습니다.
- **스트리밍은 백엔드별입니다.** 일부 백엔드는 JSONL을 스트리밍하고, 다른 것은 종료까지 버퍼링합니다.
- **구조화된 출력**은 CLI의 JSON 형식에 따라 다릅니다.
- **Codex CLI 세션**은 텍스트 출력을 통해 재개됩니다(JSONL 없음), 이는 초기 `--json` 실행보다 덜 구조화되어 있습니다. OpenClaw 세션은 여전히 정상적으로 작동합니다.

## 문제 해결

- **CLI를 찾을 수 없음**: `command`를 전체 경로로 설정하십시오.
- **잘못된 모델 이름**: `modelAliases`를 사용하여 `provider/model` → CLI 모델을 매핑하십시오.
- **세션 연속성 없음**: `sessionArg`가 설정되어 있고 `sessionMode`가 `none`이 아닌지 확인하십시오(Codex CLI는 현재 JSON 출력으로 재개할 수 없습니다).
- **이미지 무시됨**: `imageArg`를 설정하십시오(그리고 CLI가 파일 경로를 지원하는지 확인하십시오).
