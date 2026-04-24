---
summary: "CLI backend: 선택적 MCP 툴 브리지를 갖춘 로컬 AI CLI 폴백"
read_when:
  - API 프로바이더 실패 시 신뢰할 수 있는 폴백을 원할 때
  - Codex CLI 또는 기타 로컬 AI CLI를 실행 중이고 재사용하고 싶을 때
  - CLI backend 툴 접근을 위한 MCP 루프백 브리지를 이해하고 싶을 때
title: "CLI backend"
---

# CLI backend (폴백 런타임)

OpenClaw는 API 프로바이더가 다운되거나, 속도 제한되거나, 일시적으로 오작동할 때 **로컬 AI CLI**를 **텍스트 전용 폴백**으로 실행할 수 있습니다. 이는 의도적으로 보수적입니다:

- **OpenClaw 툴은 직접 주입되지 않습니다**만, `bundleMcp: true`가 설정된 backend는 루프백 MCP 브리지를 통해 gateway 툴을 받을 수 있습니다.
- 지원하는 CLI에 대한 **JSONL 스트리밍**.
- **세션이 지원됩니다**(따라서 후속 턴이 일관되게 유지됩니다).
- CLI가 이미지 경로를 수락한다면 **이미지가 전달될 수 있습니다**.

이는 주 경로가 아닌 **안전망**으로 설계되었습니다. 외부 API에 의존하지 않고 "항상 작동하는" 텍스트 응답을 원할 때 사용하십시오.

ACP 세션 제어, 백그라운드 작업, 스레드/대화 바인딩, 지속적인 외부 코딩 세션을 갖춘 완전한 하네스 런타임을 원한다면 [ACP Agents](/tools/acp-agents)를 대신 사용하십시오. CLI backend는 ACP가 아닙니다.

## 초급자 친화적 빠른 시작

**구성 없이** Codex CLI를 사용할 수 있습니다(번들 OpenAI 플러그인이 기본 backend를 등록합니다):

```bash
openclaw agent --message "hi" --model codex-cli/gpt-5.5
```

gateway가 launchd/systemd에서 실행되고 PATH가 최소인 경우, 명령어 경로만 추가하십시오:

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

그게 전부입니다. 키도, CLI 자체 외에 추가 인증 구성도 필요 없습니다.

gateway 호스트에서 번들 CLI backend를 **주 메시지 프로바이더**로 사용하는 경우, 이제 구성이 모델 ref 또는 `agents.defaults.cliBackends` 아래에서 해당 backend를 명시적으로 참조하면 OpenClaw가 소유하는 번들 플러그인을 자동 로드합니다.

## 폴백으로 사용하기

CLI backend를 폴백 목록에 추가하여 주 모델이 실패할 때만 실행되도록 하십시오:

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["codex-cli/gpt-5.5"],
      },
      models: {
        "anthropic/claude-opus-4-6": { alias: "Opus" },
        "codex-cli/gpt-5.5": {},
      },
    },
  },
}
```

참고 사항:

- `agents.defaults.models`(허용 목록)을 사용하는 경우, CLI backend 모델도 거기에 포함해야 합니다.
- 주 프로바이더가 실패하면(인증, 속도 제한, 타임아웃), OpenClaw는 다음으로 CLI backend를 시도합니다.

## 구성 개요

모든 CLI backend는 다음 아래에 있습니다:

```
agents.defaults.cliBackends
```

각 항목은 **프로바이더 id**(예: `codex-cli`, `my-cli`)로 키됩니다. 프로바이더 id는 모델 ref의 왼쪽이 됩니다:

```
<provider>/<model>
```

### 예제 구성

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
          // Codex-style CLIs can point at a prompt file instead:
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

1. 프로바이더 접두사(`codex-cli/...`)에 따라 **backend를 선택**합니다.
2. 동일한 OpenClaw 프롬프트 + 워크스페이스 컨텍스트를 사용하여 **시스템 프롬프트를 빌드**합니다.
3. 히스토리가 일관되게 유지되도록 세션 id와 함께(지원하는 경우) **CLI를 실행**합니다. 번들 `claude-cli` backend는 OpenClaw 세션당 Claude stdio 프로세스를 살아있게 유지하고 stream-json stdin을 통해 후속 턴을 보냅니다.
4. **출력을 파싱**하고(JSON 또는 일반 텍스트) 최종 텍스트를 반환합니다.
5. backend별로 **세션 id를 유지**하므로, 후속 조치는 동일한 CLI 세션을 재사용합니다.

<Note>
번들 Anthropic `claude-cli` backend가 다시 지원됩니다. Anthropic 직원은 OpenClaw 스타일의 Claude CLI 사용이 다시 허용된다고 말했으므로, OpenClaw는 Anthropic이 새로운 정책을 게시하지 않는 한 이 통합에 대해 `claude -p` 사용이 승인된 것으로 간주합니다.
</Note>

번들 OpenAI `codex-cli` backend는 Codex의 `model_instructions_file` 구성 재정의(`-c model_instructions_file="..."`)를 통해 OpenClaw의 시스템 프롬프트를 전달합니다. Codex는 Claude 스타일의 `--append-system-prompt` 플래그를 노출하지 않으므로, OpenClaw는 각 새로운 Codex CLI 세션에 대해 조립된 프롬프트를 임시 파일에 씁니다.

번들 Anthropic `claude-cli` backend는 OpenClaw 스킬 스냅샷을 두 가지 방식으로 받습니다: 첨부된 시스템 프롬프트의 간결한 OpenClaw 스킬 카탈로그와, `--plugin-dir`로 전달되는 임시 Claude Code 플러그인. 플러그인에는 해당 에이전트/세션에 적격한 스킬만 포함되므로, Claude Code의 네이티브 스킬 리졸버는 OpenClaw가 그렇지 않았다면 프롬프트에 광고했을 동일한 필터링된 세트를 봅니다. 스킬 env/API 키 재정의는 실행을 위해 OpenClaw가 자식 프로세스 환경에 여전히 적용합니다.

Claude CLI에는 자체 비대화형 권한 모드도 있습니다. OpenClaw는 Claude 특정 구성을 추가하는 대신 이를 기존 exec 정책에 매핑합니다: 유효한 요청 exec 정책이 YOLO(`tools.exec.security: "full"` 및 `tools.exec.ask: "off"`)이면, OpenClaw는 `--permission-mode bypassPermissions`를 추가합니다. 에이전트별 `agents.list[].tools.exec` 설정은 해당 에이전트에 대해 전역 `tools.exec`를 재정의합니다. 다른 Claude 모드를 강제하려면, `agents.defaults.cliBackends.claude-cli.args` 아래에 `--permission-mode default` 또는 `--permission-mode acceptEdits`와 같은 명시적 원시 backend args를 설정하고 일치하는 `resumeArgs`도 설정하십시오.

OpenClaw가 번들 `claude-cli` backend를 사용하기 전에, Claude Code 자체가 동일한 호스트에서 이미 로그인되어 있어야 합니다:

```bash
claude auth login
claude auth status --text
openclaw models auth login --provider anthropic --method cli --set-default
```

`claude` 바이너리가 `PATH`에 이미 없는 경우에만 `agents.defaults.cliBackends.claude-cli.command`를 사용하십시오.

## 세션

- CLI가 세션을 지원하는 경우, `sessionArg`(예: `--session-id`)를 설정하거나, ID를 여러 플래그에 삽입해야 할 때는 `sessionArgs`(플레이스홀더 `{sessionId}`)를 설정하십시오.
- CLI가 다른 플래그를 가진 **resume 하위 명령**을 사용하는 경우, `resumeArgs`(resume 시 `args` 대체) 및 선택적으로 `resumeOutput`(JSON이 아닌 resume용)을 설정하십시오.
- `sessionMode`:
  - `always`: 항상 세션 id 전송(저장된 것이 없으면 새로운 UUID).
  - `existing`: 이전에 저장된 세션 id가 있는 경우에만 세션 id 전송.
  - `none`: 세션 id를 전혀 전송하지 않음.
- `claude-cli`는 `liveSession: "claude-stdio"`, `output: "jsonl"`, `input: "stdin"`을 기본값으로 하여, Claude 프로세스가 활성인 동안 후속 턴이 라이브 Claude 프로세스를 재사용하도록 합니다. 웜 stdio는 이제 전송 필드를 생략하는 사용자 정의 구성을 포함하여 기본값입니다. Gateway가 재시작하거나 idle 프로세스가 종료되면, OpenClaw는 저장된 Claude 세션 id에서 resume합니다. 저장된 세션 id는 resume 전에 기존의 읽을 수 있는 프로젝트 트랜스크립트와 대조하여 검증되므로, 팬텀 바인딩이 `--resume` 아래에서 조용히 새로운 Claude CLI 세션을 시작하는 대신 `reason=transcript-missing`으로 정리됩니다.
- 저장된 CLI 세션은 프로바이더 소유의 연속성입니다. 암묵적 일일 세션 리셋은 이를 끊지 않습니다; `/reset` 및 명시적 `session.reset` 정책은 여전히 끊습니다.

직렬화 참고 사항:

- `serialize: true`는 동일한 lane 실행을 순서대로 유지합니다.
- 대부분의 CLI는 하나의 프로바이더 lane에서 직렬화합니다.
- OpenClaw는 선택된 인증 identity가 변경되면 저장된 CLI 세션 재사용을 드롭하며, 이는 변경된 인증 프로파일 id, 정적 API 키, 정적 토큰, 또는 CLI가 노출하는 OAuth 계정 identity를 포함합니다. OAuth 액세스 및 refresh 토큰 로테이션은 저장된 CLI 세션을 끊지 않습니다. CLI가 안정적인 OAuth 계정 id를 노출하지 않으면, OpenClaw는 해당 CLI가 resume 권한을 강제하도록 놔둡니다.

## 이미지 (전달)

CLI가 이미지 경로를 수락하는 경우, `imageArg`를 설정하십시오:

```json5
imageArg: "--image",
imageMode: "repeat"
```

OpenClaw는 base64 이미지를 임시 파일에 씁니다. `imageArg`가 설정된 경우, 해당 경로는 CLI args로 전달됩니다. `imageArg`가 없으면, OpenClaw는 파일 경로를 프롬프트에 추가합니다(경로 주입), 이는 일반 경로에서 로컬 파일을 자동 로드하는 CLI에 충분합니다.

## 입력 / 출력

- `output: "json"`(기본값)은 JSON을 파싱하고 텍스트 + 세션 id를 추출하려고 시도합니다.
- Gemini CLI JSON 출력의 경우, OpenClaw는 `response`에서 응답 텍스트를 읽고 `usage`가 없거나 비어 있을 때 `stats`에서 사용량을 읽습니다.
- `output: "jsonl"`은 JSONL 스트림(예: Codex CLI `--json`)을 파싱하고 최종 에이전트 메시지와 세션 식별자(있는 경우)를 추출합니다.
- `output: "text"`는 stdout을 최종 응답으로 처리합니다.

입력 모드:

- `input: "arg"`(기본값)는 프롬프트를 마지막 CLI arg로 전달합니다.
- `input: "stdin"`은 프롬프트를 stdin을 통해 전송합니다.
- 프롬프트가 매우 길고 `maxPromptArgChars`가 설정된 경우, stdin이 사용됩니다.

## 기본값 (플러그인 소유)

번들 OpenAI 플러그인은 `codex-cli`에 대한 기본값도 등록합니다:

- `command: "codex"`
- `args: ["exec","--json","--color","never","--sandbox","workspace-write","--skip-git-repo-check"]`
- `resumeArgs: ["exec","resume","{sessionId}","-c","sandbox_mode=\"workspace-write\"","--skip-git-repo-check"]`
- `output: "jsonl"`
- `resumeOutput: "text"`
- `modelArg: "--model"`
- `imageArg: "--image"`
- `sessionMode: "existing"`

번들 Google 플러그인은 `google-gemini-cli`에 대한 기본값도 등록합니다:

- `command: "gemini"`
- `args: ["--output-format", "json", "--prompt", "{prompt}"]`
- `resumeArgs: ["--resume", "{sessionId}", "--output-format", "json", "--prompt", "{prompt}"]`
- `imageArg: "@"`
- `imagePathScope: "workspace"`
- `modelArg: "--model"`
- `sessionMode: "existing"`
- `sessionIdFields: ["session_id", "sessionId"]`

전제 조건: 로컬 Gemini CLI가 설치되어 있고 `PATH`에서 `gemini`로 사용 가능해야 합니다 (`brew install gemini-cli` 또는 `npm install -g @google/gemini-cli`).

Gemini CLI JSON 참고 사항:

- 응답 텍스트는 JSON `response` 필드에서 읽습니다.
- `usage`가 없거나 비어 있을 때 사용량은 `stats`로 폴백됩니다.
- `stats.cached`는 OpenClaw `cacheRead`로 정규화됩니다.
- `stats.input`이 없으면, OpenClaw는 `stats.input_tokens - stats.cached`에서 입력 토큰을 도출합니다.

필요한 경우에만 재정의하십시오(일반적: 절대 `command` 경로).

## 플러그인 소유 기본값

CLI backend 기본값은 이제 플러그인 표면의 일부입니다:

- 플러그인은 `api.registerCliBackend(...)`로 이를 등록합니다.
- Backend `id`는 모델 ref의 프로바이더 접두사가 됩니다.
- `agents.defaults.cliBackends.<id>`의 사용자 구성은 여전히 플러그인 기본값을 재정의합니다.
- Backend별 구성 정리는 선택적 `normalizeConfig` 훅을 통해 플러그인 소유로 유지됩니다.

작은 프롬프트/메시지 호환성 쉼(shim)이 필요한 플러그인은 프로바이더나 CLI backend를 대체하지 않고 양방향 텍스트 변환을 선언할 수 있습니다:

```typescript
api.registerTextTransforms({
  input: [
    { from: /red basket/g, to: "blue basket" },
    { from: /paper ticket/g, to: "digital ticket" },
    { from: /left shelf/g, to: "right shelf" },
  ],
  output: [
    { from: /blue basket/g, to: "red basket" },
    { from: /digital ticket/g, to: "paper ticket" },
    { from: /right shelf/g, to: "left shelf" },
  ],
});
```

`input`은 CLI로 전달되는 시스템 프롬프트와 사용자 프롬프트를 다시 씁니다. `output`은 OpenClaw가 자체 제어 마커와 채널 전달을 처리하기 전에 스트리밍된 어시스턴트 델타와 파싱된 최종 텍스트를 다시 씁니다.

Claude Code stream-json 호환 JSONL을 발생시키는 CLI의 경우, 해당 backend의 구성에 `jsonlDialect: "claude-stream-json"`을 설정하십시오.

## Bundle MCP 오버레이

CLI backend는 OpenClaw 툴 호출을 직접 **받지 않습니다**만, backend는 `bundleMcp: true`로 생성된 MCP 구성 오버레이에 옵트인할 수 있습니다.

현재 번들 동작:

- `claude-cli`: 생성된 엄격한 MCP 구성 파일
- `codex-cli`: `mcp_servers`에 대한 인라인 구성 재정의; 생성된 OpenClaw 루프백 서버는 Codex의 서버별 툴 승인 모드로 표시되어 MCP 호출이 로컬 승인 프롬프트에서 멈추지 않도록 합니다
- `google-gemini-cli`: 생성된 Gemini 시스템 설정 파일

Bundle MCP가 활성화되면, OpenClaw는:

- gateway 툴을 CLI 프로세스에 노출하는 루프백 HTTP MCP 서버를 생성합니다
- 세션별 토큰(`OPENCLAW_MCP_TOKEN`)으로 브리지를 인증합니다
- 툴 접근을 현재 세션, 계정, 채널 컨텍스트로 범위화합니다
- 현재 워크스페이스에 대해 활성화된 bundle-MCP 서버를 로드합니다
- 기존 backend MCP 구성/설정 형태와 병합합니다
- 소유 확장의 backend 소유 통합 모드를 사용하여 실행 구성을 다시 씁니다

MCP 서버가 활성화되지 않은 경우에도, backend가 bundle MCP에 옵트인하면 OpenClaw는 여전히 엄격한 구성을 주입하여 백그라운드 실행이 격리된 상태로 유지되도록 합니다.

## 제한 사항

- **직접 OpenClaw 툴 호출 없음.** OpenClaw는 CLI backend 프로토콜에 툴 호출을 주입하지 않습니다. Backend는 `bundleMcp: true`에 옵트인할 때만 gateway 툴을 봅니다.
- **스트리밍은 backend별입니다.** 일부 backend는 JSONL을 스트리밍합니다; 다른 backend는 종료까지 버퍼링합니다.
- **구조화된 출력**은 CLI의 JSON 형식에 따라 달라집니다.
- **Codex CLI 세션**은 텍스트 출력을 통해 resume되며(JSONL 없음), 초기 `--json` 실행보다 덜 구조화됩니다. OpenClaw 세션은 여전히 정상적으로 작동합니다.

## 문제 해결

- **CLI를 찾을 수 없음**: `command`를 전체 경로로 설정하십시오.
- **잘못된 모델 이름**: `modelAliases`를 사용하여 `provider/model` → CLI 모델로 매핑하십시오.
- **세션 연속성 없음**: `sessionArg`가 설정되어 있고 `sessionMode`가 `none`이 아닌지 확인하십시오(Codex CLI는 현재 JSON 출력으로 resume할 수 없습니다).
- **이미지 무시됨**: `imageArg`를 설정하고(CLI가 파일 경로를 지원하는지 확인) 하십시오.

## 관련 문서

- [Gateway 런북](/gateway/)
- [로컬 모델](/gateway/local-models)
