---
title: "플러그인 런타임 헬퍼"
description: "api.runtime -- 플러그인에서 사용 가능한 주입된 런타임 헬퍼"
---

# 플러그인 런타임 헬퍼

등록 중 모든 플러그인에 주입되는 `api.runtime` 객체에 대한 레퍼런스입니다. 호스트 내부를 직접 임포트하는 대신 이 헬퍼를 사용하십시오.

::: tip
**단계별 안내가 필요하신가요?** 이 헬퍼를 문맥 속에서 보여주는 단계별 가이드는
  [채널 플러그인](/plugins/sdk-channel-plugins) 또는
  [프로바이더 플러그인](/plugins/sdk-provider-plugins)을 참조하십시오.
:::


```typescript
register(api) {
  const runtime = api.runtime;
}
```

## 런타임 네임스페이스

### `api.runtime.agent`

에이전트 아이덴티티, 디렉토리, 세션 관리.

```typescript
// 에이전트의 작업 디렉토리 확인
const agentDir = api.runtime.agent.resolveAgentDir(cfg);

// 에이전트 워크스페이스 확인
const workspaceDir = api.runtime.agent.resolveAgentWorkspaceDir(cfg);

// 에이전트 아이덴티티 가져오기
const identity = api.runtime.agent.resolveAgentIdentity(cfg);

// 기본 사고 수준 가져오기
const thinking = api.runtime.agent.resolveThinkingDefault(cfg, provider, model);

// 에이전트 타임아웃 가져오기
const timeoutMs = api.runtime.agent.resolveAgentTimeoutMs(cfg);

// 워크스페이스 존재 확인
await api.runtime.agent.ensureAgentWorkspace(cfg);

// 임베디드 Pi 에이전트 실행
const agentDir = api.runtime.agent.resolveAgentDir(cfg);
const result = await api.runtime.agent.runEmbeddedPiAgent({
  sessionId: "my-plugin:task-1",
  runId: crypto.randomUUID(),
  sessionFile: path.join(agentDir, "sessions", "my-plugin-task-1.jsonl"),
  workspaceDir: api.runtime.agent.resolveAgentWorkspaceDir(cfg),
  prompt: "Summarize the latest changes",
  timeoutMs: api.runtime.agent.resolveAgentTimeoutMs(cfg),
});
```

**세션 스토어 헬퍼**는 `api.runtime.agent.session` 아래에 있습니다:

```typescript
const storePath = api.runtime.agent.session.resolveStorePath(cfg);
const store = api.runtime.agent.session.loadSessionStore(cfg);
await api.runtime.agent.session.saveSessionStore(cfg, store);
const filePath = api.runtime.agent.session.resolveSessionFilePath(cfg, sessionId);
```

### `api.runtime.agent.defaults`

기본 모델 및 프로바이더 상수:

```typescript
const model = api.runtime.agent.defaults.model; // 예: "anthropic/claude-sonnet-4-6"
const provider = api.runtime.agent.defaults.provider; // 예: "anthropic"
```

### `api.runtime.subagent`

백그라운드 서브에이전트 실행 시작 및 관리.

```typescript
// 서브에이전트 실행 시작
const { runId } = await api.runtime.subagent.run({
  sessionKey: "agent:main:subagent:search-helper",
  message: "Expand this query into focused follow-up searches.",
  provider: "openai", // 선택적 재정의
  model: "gpt-4.1-mini", // 선택적 재정의
  deliver: false,
});

// 완료 대기
const result = await api.runtime.subagent.waitForRun({ runId, timeoutMs: 30000 });

// 세션 메시지 읽기
const { messages } = await api.runtime.subagent.getSessionMessages({
  sessionKey: "agent:main:subagent:search-helper",
  limit: 10,
});

// 세션 삭제
await api.runtime.subagent.deleteSession({
  sessionKey: "agent:main:subagent:search-helper",
});
```

::: warning
모델 재정의(`provider`/`model`)는 구성에서 `plugins.entries.&lt;id&gt;.subagent.allowModelOverride: true`를 통한 운영자 옵트인이 필요합니다.
  신뢰할 수 없는 플러그인도 서브에이전트를 실행할 수 있지만 재정의 요청은 거부됩니다.
:::


### `api.runtime.taskFlow`

Task Flow 런타임을 기존 OpenClaw 세션 키 또는 신뢰할 수 있는 도구 컨텍스트에 바인딩하고, 모든 호출에 소유자를 전달하지 않고 Task Flow를 생성하고 관리합니다.

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

자체 바인딩 레이어에서 이미 신뢰할 수 있는 OpenClaw 세션 키를 보유하고 있을 때는 `bindSession({ sessionKey, requesterOrigin })`을 사용하십시오. 원시 사용자 입력에서 바인딩하지 마십시오.

### `api.runtime.tts`

텍스트 음성 변환(TTS) 합성.

```typescript
// 표준 TTS
const clip = await api.runtime.tts.textToSpeech({
  text: "Hello from OpenClaw",
  cfg: api.config,
});

// 전화 최적화 TTS
const telephonyClip = await api.runtime.tts.textToSpeechTelephony({
  text: "Hello from OpenClaw",
  cfg: api.config,
});

// 사용 가능한 음성 목록
const voices = await api.runtime.tts.listVoices({
  provider: "elevenlabs",
  cfg: api.config,
});
```

코어 `messages.tts` 구성 및 프로바이더 선택을 사용합니다. PCM 오디오 버퍼 + 샘플 레이트를 반환합니다.

### `api.runtime.mediaUnderstanding`

이미지, 오디오, 비디오 분석.

```typescript
// 이미지 설명
const image = await api.runtime.mediaUnderstanding.describeImageFile({
  filePath: "/tmp/inbound-photo.jpg",
  cfg: api.config,
  agentDir: "/tmp/agent",
});

// 오디오 전사
const { text } = await api.runtime.mediaUnderstanding.transcribeAudioFile({
  filePath: "/tmp/inbound-audio.ogg",
  cfg: api.config,
  mime: "audio/ogg", // MIME을 유추할 수 없을 때 선택 사항
});

// 비디오 설명
const video = await api.runtime.mediaUnderstanding.describeVideoFile({
  filePath: "/tmp/inbound-video.mp4",
  cfg: api.config,
});

// 범용 파일 분석
const result = await api.runtime.mediaUnderstanding.runFile({
  filePath: "/tmp/inbound-file.pdf",
  cfg: api.config,
});
```

출력이 없을 때(예: 건너뛴 입력) `{ text: undefined }`를 반환합니다.

::: info
`api.runtime.stt.transcribeAudioFile(...)`은 `api.runtime.mediaUnderstanding.transcribeAudioFile(...)`의 호환성 별칭으로 남아 있습니다.
:::


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
```

### `api.runtime.config`

구성 로드 및 쓰기.

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

모델 및 프로바이더 auth 해결.

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

메모리 도구 팩토리 및 CLI.

```typescript
const getTool = api.runtime.tools.createMemoryGetTool(/* ... */);
const searchTool = api.runtime.tools.createMemorySearchTool(/* ... */);
api.runtime.tools.registerMemoryCli(/* ... */);
```

### `api.runtime.channel`

채널별 런타임 헬퍼(채널 플러그인이 로드될 때 사용 가능).

`api.runtime.channel.mentions`는 런타임 주입을 사용하는 번들 채널 플러그인을 위한 공유 인바운드 언급 정책 표면입니다:

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

사용 가능한 언급 헬퍼:

- `buildMentionRegexes`
- `matchesMentionPatterns`
- `matchesMentionWithExplicit`
- `implicitMentionKindWhen`
- `resolveInboundMentionDecision`

`api.runtime.channel.mentions`는 의도적으로 구형 `resolveMentionGating*` 호환성 헬퍼를 노출하지 않습니다. 정규화된 `{ facts, policy }` 경로를 선호하십시오.

## 런타임 참조 저장하기

`register` 콜백 외부에서 사용할 런타임 참조를 저장하려면 `createPluginRuntimeStore`를 사용하십시오:

```typescript
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
import type { PluginRuntime } from "openclaw/plugin-sdk/runtime-store";

const store = createPluginRuntimeStore&lt;PluginRuntime&gt;("my-plugin runtime not initialized");

// 엔트리포인트에서
export default defineChannelPluginEntry({
  id: "my-plugin",
  name: "My Plugin",
  description: "Example",
  plugin: myPlugin,
  setRuntime: store.setRuntime,
});

// 다른 파일에서
export function getRuntime() {
  return store.getRuntime(); // 초기화되지 않았으면 던집니다
}

export function tryGetRuntime() {
  return store.tryGetRuntime(); // 초기화되지 않았으면 null 반환
}
```

## 기타 최상위 `api` 필드

`api.runtime` 외에도 API 객체는 다음을 제공합니다:

| 필드                     | 타입                      | 설명                                                                                        |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------------------- |
| `api.id`                 | `string`                  | 플러그인 id                                                                                  |
| `api.name`               | `string`                  | 플러그인 표시 이름                                                                           |
| `api.config`             | `OpenClawConfig`          | 현재 구성 스냅샷(사용 가능할 때 활성 인메모리 런타임 스냅샷)                                |
| `api.pluginConfig`       | `Record&lt;string, unknown&gt;` | `plugins.entries.&lt;id&gt;.config`의 플러그인별 구성                                             |
| `api.logger`             | `PluginLogger`            | 스코프된 로거 (`debug`, `info`, `warn`, `error`)                                            |
| `api.registrationMode`   | `PluginRegistrationMode`  | 현재 로드 모드; `"setup-runtime"`은 경량 사전 전체 엔트리 시작/setup 창입니다               |
| `api.resolvePath(input)` | `(string) => string`      | 플러그인 루트에 상대적인 경로 해결                                                           |

## 관련 문서

- [SDK 개요](/plugins/sdk-overview) — 서브패스 레퍼런스
- [SDK 엔트리포인트](/plugins/sdk-entrypoints) — `definePluginEntry` 옵션
- [플러그인 내부 구조](/plugins/architecture) — 역량 모델 및 레지스트리
