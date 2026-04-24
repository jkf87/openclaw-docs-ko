---
summary: "api.runtime -- 플러그인에 주입되는 런타임 헬퍼"
title: "플러그인 런타임 헬퍼"
sidebarTitle: "런타임 헬퍼"
read_when:
  - 플러그인에서 코어 헬퍼를 호출해야 할 때 (TTS, STT, image gen, web search, subagent, nodes)
  - api.runtime이 무엇을 노출하는지 이해하고 싶을 때
  - 플러그인 코드에서 config, agent, 또는 media 헬퍼에 접근할 때
---

등록(registration) 중에 모든 플러그인에 주입되는 `api.runtime` 객체에 대한 레퍼런스입니다. 호스트 내부를 직접 임포트하는 대신 이 헬퍼들을 사용하십시오.

<Tip>
  **walkthrough를 찾으시나요?** 이 헬퍼들을 맥락 안에서 보여주는 단계별 가이드는 [채널 플러그인](/plugins/sdk-channel-plugins) 또는 [프로바이더 플러그인](/plugins/sdk-provider-plugins)을 참조하십시오.
</Tip>

```typescript
register(api) {
  const runtime = api.runtime;
}
```

## 런타임 네임스페이스

### `api.runtime.agent`

Agent 아이덴티티, 디렉토리, 세션 관리.

```typescript
// Resolve the agent's working directory
const agentDir = api.runtime.agent.resolveAgentDir(cfg);

// Resolve agent workspace
const workspaceDir = api.runtime.agent.resolveAgentWorkspaceDir(cfg);

// Get agent identity
const identity = api.runtime.agent.resolveAgentIdentity(cfg);

// Get default thinking level
const thinking = api.runtime.agent.resolveThinkingDefault(cfg, provider, model);

// Get agent timeout
const timeoutMs = api.runtime.agent.resolveAgentTimeoutMs(cfg);

// Ensure workspace exists
await api.runtime.agent.ensureAgentWorkspace(cfg);

// Run an embedded agent turn
const agentDir = api.runtime.agent.resolveAgentDir(cfg);
const result = await api.runtime.agent.runEmbeddedAgent({
  sessionId: "my-plugin:task-1",
  runId: crypto.randomUUID(),
  sessionFile: path.join(agentDir, "sessions", "my-plugin-task-1.jsonl"),
  workspaceDir: api.runtime.agent.resolveAgentWorkspaceDir(cfg),
  prompt: "Summarize the latest changes",
  timeoutMs: api.runtime.agent.resolveAgentTimeoutMs(cfg),
});
```

`runEmbeddedAgent(...)`는 플러그인 코드에서 일반 OpenClaw agent turn을 시작하기 위한 중립 헬퍼입니다. 채널 트리거 답글과 동일한 provider/model 해결 및 agent-harness 선택을 사용합니다.

`runEmbeddedPiAgent(...)`는 호환성 별칭으로 남아있습니다.

**세션 스토어 헬퍼**는 `api.runtime.agent.session` 아래에 있습니다:

```typescript
const storePath = api.runtime.agent.session.resolveStorePath(cfg);
const store = api.runtime.agent.session.loadSessionStore(cfg);
await api.runtime.agent.session.saveSessionStore(cfg, store);
const filePath = api.runtime.agent.session.resolveSessionFilePath(cfg, sessionId);
```

### `api.runtime.agent.defaults`

기본 모델 및 provider 상수:

```typescript
const model = api.runtime.agent.defaults.model; // e.g. "anthropic/claude-sonnet-4-6"
const provider = api.runtime.agent.defaults.provider; // e.g. "anthropic"
```

### `api.runtime.subagent`

백그라운드 subagent 실행의 시작 및 관리.

```typescript
// Start a subagent run
const { runId } = await api.runtime.subagent.run({
  sessionKey: "agent:main:subagent:search-helper",
  message: "Expand this query into focused follow-up searches.",
  provider: "openai", // optional override
  model: "gpt-4.1-mini", // optional override
  deliver: false,
});

// Wait for completion
const result = await api.runtime.subagent.waitForRun({ runId, timeoutMs: 30000 });

// Read session messages
const { messages } = await api.runtime.subagent.getSessionMessages({
  sessionKey: "agent:main:subagent:search-helper",
  limit: 10,
});

// Delete a session
await api.runtime.subagent.deleteSession({
  sessionKey: "agent:main:subagent:search-helper",
});
```

<Warning>
  모델 오버라이드(`provider`/`model`)는 config에서 `plugins.entries.<id>.subagent.allowModelOverride: true`를 통한 운영자 opt-in이 필요합니다. 신뢰되지 않은 플러그인도 여전히 subagent를 실행할 수 있지만, 오버라이드 요청은 거부됩니다.
</Warning>

### `api.runtime.nodes`

연결된 노드를 나열하고 Gateway에서 로드된 플러그인 코드로부터 node-host 명령을 호출합니다. 플러그인이 다른 Mac의 브라우저 또는 오디오 브리지와 같이 페어링된 장치에서 로컬 작업을 소유할 때 사용합니다.

```typescript
const { nodes } = await api.runtime.nodes.list({ connected: true });

const result = await api.runtime.nodes.invoke({
  nodeId: "mac-studio",
  command: "my-plugin.command",
  params: { action: "start" },
  timeoutMs: 30000,
});
```

이 런타임은 Gateway 내에서만 사용 가능합니다. Node 명령은 여전히 일반 Gateway 노드 페어링, 명령 allowlist, node-local 명령 처리를 거칩니다.

### `api.runtime.taskFlow`

Task Flow 런타임을 기존 OpenClaw 세션 키 또는 신뢰된 도구 컨텍스트에 바인딩한 다음, 매 호출마다 owner를 전달하지 않고 Task Flow를 생성하고 관리합니다.

```typescript
const taskFlow = api.runtime.taskFlow.fromToolContext(ctx);

const created = taskFlow.createManaged({
  controllerId: "my-plugin/review-batch",
  goal: "Review new pull requests",
});

const child = taskFlow.runTask({
  flowId: created.flowId,
  runtime: "acp",
  childSessionKey: "agent:main:subagent:reviewer",
  task: "Review PR #123",
  status: "running",
  startedAt: Date.now(),
});

const waiting = taskFlow.setWaiting({
  flowId: created.flowId,
  expectedRevision: created.revision,
  currentStep: "await-human-reply",
  waitJson: { kind: "reply", channel: "telegram" },
});
```

이미 자체 바인딩 레이어에서 신뢰된 OpenClaw 세션 키를 가지고 있을 때는 `bindSession({ sessionKey, requesterOrigin })`을 사용하십시오. 원시 사용자 입력에서 바인딩하지 마십시오.

### `api.runtime.tts`

Text-to-speech 합성.

```typescript
// Standard TTS
const clip = await api.runtime.tts.textToSpeech({
  text: "Hello from OpenClaw",
  cfg: api.config,
});

// Telephony-optimized TTS
const telephonyClip = await api.runtime.tts.textToSpeechTelephony({
  text: "Hello from OpenClaw",
  cfg: api.config,
});

// List available voices
const voices = await api.runtime.tts.listVoices({
  provider: "elevenlabs",
  cfg: api.config,
});
```

코어 `messages.tts` 구성과 provider 선택을 사용합니다. PCM 오디오 버퍼 + 샘플레이트를 반환합니다.

### `api.runtime.mediaUnderstanding`

이미지, 오디오, 비디오 분석.

```typescript
// Describe an image
const image = await api.runtime.mediaUnderstanding.describeImageFile({
  filePath: "/tmp/inbound-photo.jpg",
  cfg: api.config,
  agentDir: "/tmp/agent",
});

// Transcribe audio
const { text } = await api.runtime.mediaUnderstanding.transcribeAudioFile({
  filePath: "/tmp/inbound-audio.ogg",
  cfg: api.config,
  mime: "audio/ogg", // optional, for when MIME cannot be inferred
});

// Describe a video
const video = await api.runtime.mediaUnderstanding.describeVideoFile({
  filePath: "/tmp/inbound-video.mp4",
  cfg: api.config,
});

// Generic file analysis
const result = await api.runtime.mediaUnderstanding.runFile({
  filePath: "/tmp/inbound-file.pdf",
  cfg: api.config,
});
```

출력이 생성되지 않을 때는 `{ text: undefined }`를 반환합니다 (예: 건너뛴 입력).

<Info>
  `api.runtime.stt.transcribeAudioFile(...)`는 `api.runtime.mediaUnderstanding.transcribeAudioFile(...)`의 호환성 별칭으로 남아있습니다.
</Info>

### `api.runtime.imageGeneration`

이미지 생성.

```typescript
const result = await api.runtime.imageGeneration.generate({
  prompt: "A robot painting a sunset",
  cfg: api.config,
});

const providers = api.runtime.imageGeneration.listProviders({ cfg: api.config });
```

### `api.runtime.webSearch`

웹 검색.

```typescript
const providers = api.runtime.webSearch.listProviders({ config: api.config });

const result = await api.runtime.webSearch.search({
  config: api.config,
  args: { query: "OpenClaw plugin SDK", count: 5 },
});
```

### `api.runtime.media`

저수준 미디어 유틸리티.

```typescript
const webMedia = await api.runtime.media.loadWebMedia(url);
const mime = await api.runtime.media.detectMime(buffer);
const kind = api.runtime.media.mediaKindFromMime("image/jpeg"); // "image"
const isVoice = api.runtime.media.isVoiceCompatibleAudio(filePath);
const metadata = await api.runtime.media.getImageMetadata(filePath);
const resized = await api.runtime.media.resizeToJpeg(buffer, { maxWidth: 800 });
const terminalQr = await api.runtime.media.renderQrTerminal("https://openclaw.ai");
const pngQr = await api.runtime.media.renderQrPngBase64("https://openclaw.ai", {
  scale: 6, // 1-12
  marginModules: 4, // 0-16
});
const pngQrDataUrl = await api.runtime.media.renderQrPngDataUrl("https://openclaw.ai");
const tmpRoot = resolvePreferredOpenClawTmpDir();
const pngQrFile = await api.runtime.media.writeQrPngTempFile("https://openclaw.ai", {
  tmpRoot,
  dirPrefix: "my-plugin-qr-",
  fileName: "qr.png",
});
```

### `api.runtime.config`

Config load 및 write.

```typescript
const cfg = await api.runtime.config.loadConfig();
await api.runtime.config.writeConfigFile(cfg);
```

### `api.runtime.system`

시스템 수준 유틸리티.

```typescript
await api.runtime.system.enqueueSystemEvent(event);
api.runtime.system.requestHeartbeatNow();
const output = await api.runtime.system.runCommandWithTimeout(cmd, args, opts);
const hint = api.runtime.system.formatNativeDependencyHint(pkg);
```

### `api.runtime.events`

이벤트 구독.

```typescript
api.runtime.events.onAgentEvent((event) => {
  /* ... */
});
api.runtime.events.onSessionTranscriptUpdate((update) => {
  /* ... */
});
```

### `api.runtime.logging`

로깅.

```typescript
const verbose = api.runtime.logging.shouldLogVerbose();
const childLogger = api.runtime.logging.getChildLogger({ plugin: "my-plugin" }, { level: "debug" });
```

### `api.runtime.modelAuth`

모델 및 provider auth 해결.

```typescript
const auth = await api.runtime.modelAuth.getApiKeyForModel({ model, cfg });
const providerAuth = await api.runtime.modelAuth.resolveApiKeyForProvider({
  provider: "openai",
  cfg,
});
```

### `api.runtime.state`

상태 디렉토리 해결.

```typescript
const stateDir = api.runtime.state.resolveStateDir();
```

### `api.runtime.tools`

Memory tool factory 및 CLI.

```typescript
const getTool = api.runtime.tools.createMemoryGetTool(/* ... */);
const searchTool = api.runtime.tools.createMemorySearchTool(/* ... */);
api.runtime.tools.registerMemoryCli(/* ... */);
```

### `api.runtime.channel`

채널 전용 런타임 헬퍼 (채널 플러그인이 로드될 때 사용 가능).

`api.runtime.channel.mentions`는 런타임 주입을 사용하는 번들된 채널 플러그인을 위한 공유 inbound mention-policy 표면입니다:

```typescript
const mentionMatch = api.runtime.channel.mentions.matchesMentionWithExplicit(text, {
  mentionRegexes,
  mentionPatterns,
});

const decision = api.runtime.channel.mentions.resolveInboundMentionDecision({
  facts: {
    canDetectMention: true,
    wasMentioned: mentionMatch.matched,
    implicitMentionKinds: api.runtime.channel.mentions.implicitMentionKindWhen(
      "reply_to_bot",
      isReplyToBot,
    ),
  },
  policy: {
    isGroup,
    requireMention,
    allowTextCommands,
    hasControlCommand,
    commandAuthorized,
  },
});
```

사용 가능한 mention 헬퍼:

- `buildMentionRegexes`
- `matchesMentionPatterns`
- `matchesMentionWithExplicit`
- `implicitMentionKindWhen`
- `resolveInboundMentionDecision`

`api.runtime.channel.mentions`는 의도적으로 기존의 `resolveMentionGating*` 호환성 헬퍼를 노출하지 않습니다. 정규화된 `{ facts, policy }` 경로를 선호하십시오.

## 런타임 참조 저장

`register` 콜백 외부에서 사용하기 위해 런타임 참조를 저장하려면 `createPluginRuntimeStore`를 사용하십시오:

```typescript
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
import type { PluginRuntime } from "openclaw/plugin-sdk/runtime-store";

const store = createPluginRuntimeStore<PluginRuntime>({
  pluginId: "my-plugin",
  errorMessage: "my-plugin runtime not initialized",
});

// In your entry point
export default defineChannelPluginEntry({
  id: "my-plugin",
  name: "My Plugin",
  description: "Example",
  plugin: myPlugin,
  setRuntime: store.setRuntime,
});

// In other files
export function getRuntime() {
  return store.getRuntime(); // throws if not initialized
}

export function tryGetRuntime() {
  return store.tryGetRuntime(); // returns null if not initialized
}
```

runtime-store 아이덴티티로는 `pluginId`를 선호하십시오. 더 낮은 수준의 `key` 형식은 한 플러그인이 의도적으로 둘 이상의 runtime 슬롯이 필요한 드문 경우를 위한 것입니다.

## 기타 최상위 `api` 필드

`api.runtime` 외에도 API 객체는 다음을 제공합니다:

| 필드                     | 타입                      | 설명                                                                                            |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------- |
| `api.id`                 | `string`                  | 플러그인 id                                                                                     |
| `api.name`               | `string`                  | 플러그인 표시 이름                                                                              |
| `api.config`             | `OpenClawConfig`          | 현재 구성 스냅샷 (사용 가능한 경우 활성 in-memory 런타임 스냅샷)                                |
| `api.pluginConfig`       | `Record<string, unknown>` | `plugins.entries.<id>.config`에서의 플러그인 전용 구성                                          |
| `api.logger`             | `PluginLogger`            | 스코프된 logger (`debug`, `info`, `warn`, `error`)                                              |
| `api.registrationMode`   | `PluginRegistrationMode`  | 현재 로드 모드; `"setup-runtime"`는 경량 사전 전체 엔트리 시작/setup 기간입니다                 |
| `api.resolvePath(input)` | `(string) => string`      | 플러그인 루트 기준 상대 경로 해결                                                                |

## 관련 문서

- [SDK 개요](/plugins/sdk-overview) -- 서브패스 레퍼런스
- [SDK 엔트리포인트](/plugins/sdk-entrypoints) -- `definePluginEntry` 옵션
- [플러그인 내부 구조](/plugins/architecture) -- capability 모델 및 레지스트리
