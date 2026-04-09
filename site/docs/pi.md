---
title: "Pi 통합 아키텍처"
description: "OpenClaw의 임베디드 Pi 에이전트 통합 및 세션 라이프사이클 아키텍처"
---

# Pi 통합 아키텍처

이 문서는 OpenClaw가 [pi-coding-agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)와 그 형제 패키지(`pi-ai`, `pi-agent-core`, `pi-tui`)와 통합하여 AI 에이전트 기능을 구동하는 방법을 설명합니다.

## 개요

OpenClaw는 Pi SDK를 사용하여 AI 코딩 에이전트를 메시징 게이트웨이 아키텍처에 임베드합니다. Pi를 서브프로세스로 생성하거나 RPC 모드를 사용하는 대신, OpenClaw는 `createAgentSession()`을 통해 Pi의 `AgentSession`을 직접 임포트하고 인스턴스화합니다. 이 임베디드 접근 방식은 다음을 제공합니다:

- 세션 라이프사이클 및 이벤트 처리에 대한 완전한 제어
- 커스텀 도구 주입 (메시징, 샌드박스, 채널별 동작)
- 채널/컨텍스트별 시스템 프롬프트 커스터마이징
- 브랜칭/압축 지원이 있는 세션 지속성
- 장애 조치가 포함된 다중 계정 인증 프로파일 순환
- 프로바이더 중립적 모델 전환

## 패키지 의존성

```json
{
  "@mariozechner/pi-agent-core": "0.64.0",
  "@mariozechner/pi-ai": "0.64.0",
  "@mariozechner/pi-coding-agent": "0.64.0",
  "@mariozechner/pi-tui": "0.64.0"
}
```

| 패키지            | 목적                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `pi-ai`           | 핵심 LLM 추상화: `Model`, `streamSimple`, 메시지 타입, 프로바이더 API                                 |
| `pi-agent-core`   | 에이전트 루프, 도구 실행, `AgentMessage` 타입                                                         |
| `pi-coding-agent` | 고수준 SDK: `createAgentSession`, `SessionManager`, `AuthStorage`, `ModelRegistry`, 내장 도구          |
| `pi-tui`          | 터미널 UI 컴포넌트 (OpenClaw의 로컬 TUI 모드에서 사용)                                                |

## 파일 구조

```
src/agents/
├── pi-embedded-runner.ts          # Re-exports from pi-embedded-runner/
├── pi-embedded-runner/
│   ├── run.ts                     # Main entry: runEmbeddedPiAgent()
│   ├── run/
│   │   ├── attempt.ts             # Single attempt logic with session setup
│   │   ├── params.ts              # RunEmbeddedPiAgentParams type
│   │   ├── payloads.ts            # Build response payloads from run results
│   │   ├── images.ts              # Vision model image injection
│   │   └── types.ts               # EmbeddedRunAttemptResult
│   ├── abort.ts                   # Abort error detection
│   ├── cache-ttl.ts               # Cache TTL tracking for context pruning
│   ├── compact.ts                 # Manual/auto compaction logic
│   ├── extensions.ts              # Load pi extensions for embedded runs
│   ├── extra-params.ts            # Provider-specific stream params
│   ├── google.ts                  # Google/Gemini turn ordering fixes
│   ├── history.ts                 # History limiting (DM vs group)
│   ├── lanes.ts                   # Session/global command lanes
│   ├── logger.ts                  # Subsystem logger
│   ├── model.ts                   # Model resolution via ModelRegistry
│   ├── runs.ts                    # Active run tracking, abort, queue
│   ├── sandbox-info.ts            # Sandbox info for system prompt
│   ├── session-manager-cache.ts   # SessionManager instance caching
│   ├── session-manager-init.ts    # Session file initialization
│   ├── system-prompt.ts           # System prompt builder
│   ├── tool-split.ts              # Split tools into builtIn vs custom
│   ├── types.ts                   # EmbeddedPiAgentMeta, EmbeddedPiRunResult
│   └── utils.ts                   # ThinkLevel mapping, error description
├── pi-embedded-subscribe.ts       # Session event subscription/dispatch
├── pi-embedded-subscribe.types.ts # SubscribeEmbeddedPiSessionParams
├── pi-embedded-subscribe.handlers.ts # Event handler factory
├── pi-embedded-subscribe.handlers.lifecycle.ts
├── pi-embedded-subscribe.handlers.types.ts
├── pi-embedded-block-chunker.ts   # Streaming block reply chunking
├── pi-embedded-messaging.ts       # Messaging tool sent tracking
├── pi-embedded-helpers.ts         # Error classification, turn validation
├── pi-embedded-helpers/           # Helper modules
├── pi-embedded-utils.ts           # Formatting utilities
├── pi-tools.ts                    # createOpenClawCodingTools()
├── pi-tools.abort.ts              # AbortSignal wrapping for tools
├── pi-tools.policy.ts             # Tool allowlist/denylist policy
├── pi-tools.read.ts               # Read tool customizations
├── pi-tools.schema.ts             # Tool schema normalization
├── pi-tools.types.ts              # AnyAgentTool type alias
├── pi-tool-definition-adapter.ts  # AgentTool -> ToolDefinition adapter
├── pi-settings.ts                 # Settings overrides
├── pi-hooks/                      # Custom pi hooks
│   ├── compaction-safeguard.ts    # Safeguard extension
│   ├── compaction-safeguard-runtime.ts
│   ├── context-pruning.ts         # Cache-TTL context pruning extension
│   └── context-pruning/
├── model-auth.ts                  # Auth profile resolution
├── auth-profiles.ts               # Profile store, cooldown, failover
├── model-selection.ts             # Default model resolution
├── models-config.ts               # models.json generation
├── model-catalog.ts               # Model catalog cache
├── context-window-guard.ts        # Context window validation
├── failover-error.ts              # FailoverError class
├── defaults.ts                    # DEFAULT_PROVIDER, DEFAULT_MODEL
├── system-prompt.ts               # buildAgentSystemPrompt()
├── system-prompt-params.ts        # System prompt parameter resolution
├── system-prompt-report.ts        # Debug report generation
├── tool-summaries.ts              # Tool description summaries
├── tool-policy.ts                 # Tool policy resolution
├── transcript-policy.ts           # Transcript validation policy
├── skills.ts                      # Skill snapshot/prompt building
├── skills/                        # Skill subsystem
├── sandbox.ts                     # Sandbox context resolution
├── sandbox/                       # Sandbox subsystem
├── channel-tools.ts               # Channel-specific tool injection
├── openclaw-tools.ts              # OpenClaw-specific tools
├── bash-tools.ts                  # exec/process tools
├── apply-patch.ts                 # apply_patch tool (OpenAI)
├── tools/                         # Individual tool implementations
│   ├── browser-tool.ts
│   ├── canvas-tool.ts
│   ├── cron-tool.ts
│   ├── gateway-tool.ts
│   ├── image-tool.ts
│   ├── message-tool.ts
│   ├── nodes-tool.ts
│   ├── session*.ts
│   ├── web-*.ts
│   └── ...
└── ...
```

채널별 메시지 동작 런타임은 이제 `src/agents/tools` 아래가 아닌 플러그인 소유 익스텐션 디렉토리에 있습니다. 예를 들면:

- Discord 플러그인 동작 런타임 파일들
- Slack 플러그인 동작 런타임 파일
- Telegram 플러그인 동작 런타임 파일
- WhatsApp 플러그인 동작 런타임 파일

## 핵심 통합 플로

### 1. 임베디드 에이전트 실행

주 진입점은 `pi-embedded-runner/run.ts`의 `runEmbeddedPiAgent()`입니다:

```typescript
import { runEmbeddedPiAgent } from "./agents/pi-embedded-runner.js";

const result = await runEmbeddedPiAgent({
  sessionId: "user-123",
  sessionKey: "main:whatsapp:+1234567890",
  sessionFile: "/path/to/session.jsonl",
  workspaceDir: "/path/to/workspace",
  config: openclawConfig,
  prompt: "Hello, how are you?",
  provider: "anthropic",
  model: "claude-sonnet-4-6",
  timeoutMs: 120_000,
  runId: "run-abc",
  onBlockReply: async (payload) => {
    await sendToChannel(payload.text, payload.mediaUrls);
  },
});
```

### 2. 세션 생성

`runEmbeddedAttempt()`(`runEmbeddedPiAgent()`가 호출) 내부에서 Pi SDK가 사용됩니다:

```typescript
import {
  createAgentSession,
  DefaultResourceLoader,
  SessionManager,
  SettingsManager,
} from "@mariozechner/pi-coding-agent";

const resourceLoader = new DefaultResourceLoader({
  cwd: resolvedWorkspace,
  agentDir,
  settingsManager,
  additionalExtensionPaths,
});
await resourceLoader.reload();

const { session } = await createAgentSession({
  cwd: resolvedWorkspace,
  agentDir,
  authStorage: params.authStorage,
  modelRegistry: params.modelRegistry,
  model: params.model,
  thinkingLevel: mapThinkingLevel(params.thinkLevel),
  tools: builtInTools,
  customTools: allCustomTools,
  sessionManager,
  settingsManager,
  resourceLoader,
});

applySystemPromptOverrideToSession(session, systemPromptOverride);
```

### 3. 이벤트 구독

`subscribeEmbeddedPiSession()`은 Pi의 `AgentSession` 이벤트를 구독합니다:

```typescript
const subscription = subscribeEmbeddedPiSession({
  session: activeSession,
  runId: params.runId,
  verboseLevel: params.verboseLevel,
  reasoningMode: params.reasoningLevel,
  toolResultFormat: params.toolResultFormat,
  onToolResult: params.onToolResult,
  onReasoningStream: params.onReasoningStream,
  onBlockReply: params.onBlockReply,
  onPartialReply: params.onPartialReply,
  onAgentEvent: params.onAgentEvent,
});
```

처리되는 이벤트:

- `message_start` / `message_end` / `message_update` (스트리밍 텍스트/사고)
- `tool_execution_start` / `tool_execution_update` / `tool_execution_end`
- `turn_start` / `turn_end`
- `agent_start` / `agent_end`
- `auto_compaction_start` / `auto_compaction_end`

### 4. 프롬프팅

설정 후 세션이 프롬프트됩니다:

```typescript
await session.prompt(effectivePrompt, { images: imageResult.images });
```

SDK가 전체 에이전트 루프를 처리합니다: LLM에 보내기, 도구 호출 실행, 응답 스트리밍.

이미지 주입은 프롬프트 로컬입니다: OpenClaw는 현재 프롬프트에서 이미지 참조를 로드하고 해당 턴에만 `images`를 통해 전달합니다. 이미지 페이로드를 다시 주입하기 위해 이전 히스토리 턴을 재스캔하지 않습니다.

## 도구 아키텍처

### 도구 파이프라인

1. **기본 도구**: Pi의 `codingTools` (read, bash, edit, write)
2. **커스텀 교체**: OpenClaw는 bash를 `exec`/`process`로 교체, 샌드박스용 read/edit/write 커스터마이징
3. **OpenClaw 도구**: 메시징, 브라우저, Canvas, 세션, cron, 게이트웨이 등
4. **채널 도구**: Discord/Telegram/Slack/WhatsApp별 동작 도구
5. **정책 필터링**: 프로파일, 프로바이더, 에이전트, 그룹, 샌드박스 정책으로 필터링된 도구
6. **스키마 정규화**: Gemini/OpenAI 특이점에 맞게 정리된 스키마
7. **AbortSignal 래핑**: abort 신호를 존중하도록 래핑된 도구

### 도구 정의 어댑터

pi-agent-core의 `AgentTool`은 pi-coding-agent의 `ToolDefinition`과 다른 `execute` 서명을 가집니다. `pi-tool-definition-adapter.ts`의 어댑터가 이를 연결합니다:

```typescript
export function toToolDefinitions(tools: AnyAgentTool[]): ToolDefinition[] {
  return tools.map((tool) => ({
    name: tool.name,
    label: tool.label ?? name,
    description: tool.description ?? "",
    parameters: tool.parameters,
    execute: async (toolCallId, params, onUpdate, _ctx, signal) => {
      // pi-coding-agent signature differs from pi-agent-core
      return await tool.execute(toolCallId, params, signal, onUpdate);
    },
  }));
}
```

### 도구 분할 전략

`splitSdkTools()`는 모든 도구를 `customTools`를 통해 전달합니다:

```typescript
export function splitSdkTools(options: { tools: AnyAgentTool[]; sandboxEnabled: boolean }) {
  return {
    builtInTools: [], // Empty. We override everything
    customTools: toToolDefinitions(options.tools),
  };
}
```

이렇게 하면 OpenClaw의 정책 필터링, 샌드박스 통합, 확장된 도구셋이 프로바이더 전반에서 일관성을 유지합니다.

## 시스템 프롬프트 구성

시스템 프롬프트는 `buildAgentSystemPrompt()`(`system-prompt.ts`)에서 빌드됩니다. 툴링, 도구 호출 스타일, 안전 가드레일, OpenClaw CLI 참조, 스킬, 문서, 워크스페이스, 샌드박스, 메시징, 응답 태그, 음성, 무음 응답, 하트비트, 런타임 메타데이터 섹션을 포함하는 전체 프롬프트를 조합하고, 활성화된 경우 메모리와 반응을 추가하며, 선택적 컨텍스트 파일과 추가 시스템 프롬프트 콘텐츠를 포함합니다. 서브에이전트가 사용하는 최소 프롬프트 모드를 위해 섹션이 트리밍됩니다.

프롬프트는 `applySystemPromptOverrideToSession()`을 통해 세션 생성 후 적용됩니다:

```typescript
const systemPromptOverride = createSystemPromptOverride(appendPrompt);
applySystemPromptOverrideToSession(session, systemPromptOverride);
```

## 세션 관리

### 세션 파일

세션은 트리 구조(id/parentId 링크)를 가진 JSONL 파일입니다. Pi의 `SessionManager`가 지속성을 처리합니다:

```typescript
const sessionManager = SessionManager.open(params.sessionFile);
```

OpenClaw는 도구 결과 안전성을 위해 `guardSessionManager()`로 이를 래핑합니다.

### 세션 캐싱

`session-manager-cache.ts`는 반복적인 파일 파싱을 피하기 위해 SessionManager 인스턴스를 캐시합니다:

```typescript
await prewarmSessionFile(params.sessionFile);
sessionManager = SessionManager.open(params.sessionFile);
trackSessionManagerAccess(params.sessionFile);
```

### 히스토리 제한

`limitHistoryTurns()`는 채널 타입(DM 대 그룹)에 따라 대화 히스토리를 트리밍합니다.

### 압축

자동 압축은 컨텍스트 오버플로 시 트리거됩니다. 일반적인 오버플로 시그니처에는 `request_too_large`, `context length exceeded`, `input exceeds the maximum number of tokens`, `input token count exceeds the maximum number of input tokens`, `input is too long for the model`, `ollama error: context length exceeded`가 포함됩니다. `compactEmbeddedPiSessionDirect()`가 수동 압축을 처리합니다:

```typescript
const compactResult = await compactEmbeddedPiSessionDirect({
  sessionId, sessionFile, provider, model, ...
});
```

## 인증 및 모델 해결

### 인증 프로파일

OpenClaw는 프로바이더당 여러 API 키를 가진 인증 프로파일 저장소를 유지합니다:

```typescript
const authStore = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
const profileOrder = resolveAuthProfileOrder({ cfg, store: authStore, provider, preferredProfile });
```

프로파일은 쿨다운 추적과 함께 실패 시 순환됩니다:

```typescript
await markAuthProfileFailure({ store, profileId, reason, cfg, agentDir });
const rotated = await advanceAuthProfile();
```

### 모델 해결

```typescript
import { resolveModel } from "./pi-embedded-runner/model.js";

const { model, error, authStorage, modelRegistry } = resolveModel(
  provider,
  modelId,
  agentDir,
  config,
);

// Uses pi's ModelRegistry and AuthStorage
authStorage.setRuntimeApiKey(model.provider, apiKeyInfo.apiKey);
```

### 장애 조치

`FailoverError`는 구성된 경우 모델 폴백을 트리거합니다:

```typescript
if (fallbackConfigured && isFailoverErrorMessage(errorText)) {
  throw new FailoverError(errorText, {
    reason: promptFailoverReason ?? "unknown",
    provider,
    model: modelId,
    profileId,
    status: resolveFailoverStatus(promptFailoverReason),
  });
}
```

## Pi 익스텐션

OpenClaw는 특수 동작을 위해 커스텀 Pi 익스텐션을 로드합니다:

### 압축 세이프가드

`src/agents/pi-hooks/compaction-safeguard.ts`는 적응형 토큰 예산 산정, 도구 실패 및 파일 작업 요약을 포함하여 압축에 가드레일을 추가합니다:

```typescript
if (resolveCompactionMode(params.cfg) === "safeguard") {
  setCompactionSafeguardRuntime(params.sessionManager, { maxHistoryShare });
  paths.push(resolvePiExtensionPath("compaction-safeguard"));
}
```

### 컨텍스트 프루닝

`src/agents/pi-hooks/context-pruning.ts`는 캐시-TTL 기반 컨텍스트 프루닝을 구현합니다:

```typescript
if (cfg?.agents?.defaults?.contextPruning?.mode === "cache-ttl") {
  setContextPruningRuntime(params.sessionManager, {
    settings,
    contextWindowTokens,
    isToolPrunable,
    lastCacheTouchAt,
  });
  paths.push(resolvePiExtensionPath("context-pruning"));
}
```

## 스트리밍 & 블록 응답

### 블록 청킹

`EmbeddedBlockChunker`는 스트리밍 텍스트를 개별 응답 블록으로 관리합니다:

```typescript
const blockChunker = blockChunking ? new EmbeddedBlockChunker(blockChunking) : null;
```

### 사고/최종 태그 제거

스트리밍 출력은 `&lt;think&gt;`/`&lt;thinking&gt;` 블록을 제거하고 `&lt;final&gt;` 콘텐츠를 추출하도록 처리됩니다:

```typescript
const stripBlockTags = (text: string, state: { thinking: boolean; final: boolean }) => {
  // Strip &lt;think&gt;...&lt;/think&gt; content
  // If enforceFinalTag, only return &lt;final&gt;...&lt;/final&gt; content
};
```

### 응답 지시문

`[[media:url]]`, `[[voice]]`, `[[reply:id]]` 같은 응답 지시문이 파싱되고 추출됩니다:

```typescript
const { text: cleanedText, mediaUrls, audioAsVoice, replyToId } = consumeReplyDirectives(chunk);
```

## 오류 처리

### 오류 분류

`pi-embedded-helpers.ts`는 적절한 처리를 위해 오류를 분류합니다:

```typescript
isContextOverflowError(errorText)     // Context too large
isCompactionFailureError(errorText)   // Compaction failed
isAuthAssistantError(lastAssistant)   // Auth failure
isRateLimitAssistantError(...)        // Rate limited
isFailoverAssistantError(...)         // Should failover
classifyFailoverReason(errorText)     // "auth" | "rate_limit" | "quota" | "timeout" | ...
```

### 사고 레벨 폴백

사고 레벨이 지원되지 않는 경우 폴백됩니다:

```typescript
const fallbackThinking = pickFallbackThinkingLevel({
  message: errorText,
  attempted: attemptedThinking,
});
if (fallbackThinking) {
  thinkLevel = fallbackThinking;
  continue;
}
```

## 샌드박스 통합

샌드박스 모드가 활성화된 경우 도구와 경로가 제한됩니다:

```typescript
const sandbox = await resolveSandboxContext({
  config: params.config,
  sessionKey: sandboxSessionKey,
  workspaceDir: resolvedWorkspace,
});

if (sandboxRoot) {
  // Use sandboxed read/edit/write tools
  // Exec runs in container
  // Browser uses bridge URL
}
```

## 프로바이더별 처리

### Anthropic

- 거부 매직 문자열 스크러빙
- 연속 역할에 대한 턴 유효성 검사
- 엄격한 업스트림 Pi 도구 매개변수 유효성 검사

### Google/Gemini

- 플러그인 소유 도구 스키마 정리

### OpenAI

- Codex 모델용 `apply_patch` 도구
- 사고 레벨 다운그레이드 처리

## TUI 통합

OpenClaw에는 pi-tui 컴포넌트를 직접 사용하는 로컬 TUI 모드도 있습니다:

```typescript
// src/tui/tui.ts
import { ... } from "@mariozechner/pi-tui";
```

이는 Pi의 네이티브 모드와 유사한 인터랙티브 터미널 경험을 제공합니다.

## Pi CLI와의 주요 차이점

| 측면            | Pi CLI                  | OpenClaw 임베디드                                                                              |
| --------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| 호출            | `pi` 명령어 / RPC       | `createAgentSession()`을 통한 SDK                                                              |
| 도구            | 기본 코딩 도구          | 커스텀 OpenClaw 도구 스위트                                                                    |
| 시스템 프롬프트 | AGENTS.md + 프롬프트    | 채널/컨텍스트별 동적                                                                           |
| 세션 저장소     | `~/.pi/agent/sessions/` | `~/.openclaw/agents/&lt;agentId&gt;/sessions/` (또는 `$OPENCLAW_STATE_DIR/agents/&lt;agentId&gt;/sessions/`) |
| 인증            | 단일 자격 증명          | 순환이 있는 다중 프로파일                                                                      |
| 익스텐션        | 디스크에서 로드         | 프로그래밍 방식 + 디스크 경로                                                                  |
| 이벤트 처리     | TUI 렌더링              | 콜백 기반 (onBlockReply 등)                                                                    |

## 향후 고려사항

잠재적 재작업 영역:

1. **도구 서명 정렬**: 현재 pi-agent-core와 pi-coding-agent 서명 간 어댑팅 중
2. **세션 매니저 래핑**: `guardSessionManager`가 안전성을 추가하지만 복잡성이 증가
3. **익스텐션 로딩**: Pi의 `ResourceLoader`를 더 직접적으로 사용 가능
4. **스트리밍 핸들러 복잡성**: `subscribeEmbeddedPiSession`이 커짐
5. **프로바이더 특이점**: Pi가 잠재적으로 처리할 수 있는 많은 프로바이더별 코드 경로

## 테스트

Pi 통합 커버리지는 다음 스위트에 걸쳐 있습니다:

- `src/agents/pi-*.test.ts`
- `src/agents/pi-auth-json.test.ts`
- `src/agents/pi-embedded-*.test.ts`
- `src/agents/pi-embedded-helpers*.test.ts`
- `src/agents/pi-embedded-runner*.test.ts`
- `src/agents/pi-embedded-runner/**/*.test.ts`
- `src/agents/pi-embedded-subscribe*.test.ts`
- `src/agents/pi-tools*.test.ts`
- `src/agents/pi-tool-definition-adapter*.test.ts`
- `src/agents/pi-settings.test.ts`
- `src/agents/pi-hooks/**/*.test.ts`

라이브/옵트인:

- `src/agents/pi-embedded-runner-extraparams.live.test.ts` (`OPENCLAW_LIVE_TEST=1` 활성화)

현재 실행 명령어는 [Pi 개발 워크플로](/pi-dev)를 참조하십시오.
