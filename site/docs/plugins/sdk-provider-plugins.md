---
title: "프로바이더 플러그인 빌드하기"
description: "OpenClaw용 모델 프로바이더 플러그인 빌드 단계별 가이드"
---

# 프로바이더 플러그인 빌드하기

이 가이드는 OpenClaw에 모델 프로바이더(LLM)를 추가하는 프로바이더 플러그인 빌드 방법을 안내합니다. 완료하면 모델 카탈로그, API 키 auth, 동적 모델 해결 기능을 갖춘 프로바이더가 만들어집니다.

::: info
OpenClaw 플러그인을 한 번도 빌드해 본 적 없다면 기본 패키지 구조 및 매니페스트 setup을 위해 먼저
  [시작하기](/plugins/building-plugins)를 읽으십시오.
:::


## 단계별 안내

<a id="step-1-package-and-manifest"></a>
  1. **패키지 및 매니페스트**

   ```json package.json
       {
         "name": "@myorg/openclaw-acme-ai",
         "version": "1.0.0",
         "type": "module",
         "openclaw": {
           "extensions": ["./index.ts"],
           "providers": ["acme-ai"],
           "compat": {
             "pluginApi": ">=2026.3.24-beta.2",
             "minGatewayVersion": "2026.3.24-beta.2"
           },
           "build": {
             "openclawVersion": "2026.3.24-beta.2",
             "pluginSdkVersion": "2026.3.24-beta.2"
           }
         }
       }
       ```
   
       ```json openclaw.plugin.json
       {
         "id": "acme-ai",
         "name": "Acme AI",
         "description": "Acme AI model provider",
         "providers": ["acme-ai"],
         "modelSupport": {
           "modelPrefixes": ["acme-"]
         },
         "providerAuthEnvVars": {
           "acme-ai": ["ACME_AI_API_KEY"]
         },
         "providerAuthAliases": {
           "acme-ai-coding": "acme-ai"
         },
         "providerAuthChoices": [
           {
             "provider": "acme-ai",
             "method": "api-key",
             "choiceId": "acme-ai-api-key",
             "choiceLabel": "Acme AI API key",
             "groupId": "acme-ai",
             "groupLabel": "Acme AI",
             "cliFlag": "--acme-ai-api-key",
             "cliOption": "--acme-ai-api-key &lt;key&gt;",
             "cliDescription": "Acme AI API key"
           }
         ],
         "configSchema": {
           "type": "object",
           "additionalProperties": false
         }
       }
       ```
       매니페스트는 플러그인 런타임을 로드하지 않고 자격 증명을 감지할 수 있도록 `providerAuthEnvVars`를 선언합니다. 프로바이더 변형이 다른 프로바이더 id의 auth를 재사용해야 할 때 `providerAuthAliases`를 추가하십시오. `modelSupport`는 선택 사항이며 런타임 훅이 존재하기 전에 `acme-large`와 같은 약식 모델 id에서 OpenClaw가 프로바이더 플러그인을 자동 로드하도록 합니다. ClawHub에 프로바이더를 게시한다면 `package.json`에 `openclaw.compat` 및 `openclaw.build` 필드가 필요합니다.


  2. **프로바이더 등록하기**

   최소 프로바이더에는 `id`, `label`, `auth`, `catalog`가 필요합니다:
   
       ```typescript index.ts
       import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
       import { createProviderApiKeyAuthMethod } from "openclaw/plugin-sdk/provider-auth";
   
       export default definePluginEntry({
         id: "acme-ai",
         name: "Acme AI",
         description: "Acme AI model provider",
         register(api) {
           api.registerProvider({
             id: "acme-ai",
             label: "Acme AI",
             docsPath: "/providers/acme-ai",
             envVars: ["ACME_AI_API_KEY"],
   
             auth: [
               createProviderApiKeyAuthMethod({
                 providerId: "acme-ai",
                 methodId: "api-key",
                 label: "Acme AI API key",
                 hint: "API key from your Acme AI dashboard",
                 optionKey: "acmeAiApiKey",
                 flagName: "--acme-ai-api-key",
                 envVar: "ACME_AI_API_KEY",
                 promptMessage: "Enter your Acme AI API key",
                 defaultModel: "acme-ai/acme-large",
               }),
             ],
   
             catalog: {
               order: "simple",
               run: async (ctx) => {
                 const apiKey =
                   ctx.resolveProviderApiKey("acme-ai").apiKey;
                 if (!apiKey) return null;
                 return {
                   provider: {
                     baseUrl: "https://api.acme-ai.com/v1",
                     apiKey,
                     api: "openai-completions",
                     models: [
                       {
                         id: "acme-large",
                         name: "Acme Large",
                         reasoning: true,
                         input: ["text", "image"],
                         cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
                         contextWindow: 200000,
                         maxTokens: 32768,
                       },
                       {
                         id: "acme-small",
                         name: "Acme Small",
                         reasoning: false,
                         input: ["text"],
                         cost: { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1.25 },
                         contextWindow: 128000,
                         maxTokens: 8192,
                       },
                     ],
                   },
                 };
               },
             },
           });
         },
       });
       ```
   
       이것이 작동하는 프로바이더입니다. 이제 사용자는 `openclaw onboard --acme-ai-api-key &lt;key&gt;`를 실행하고 `acme-ai/acme-large`를 모델로 선택할 수 있습니다.
   
       API 키 auth와 단일 카탈로그 기반 런타임을 가진 하나의 텍스트 프로바이더만 등록하는 번들 프로바이더에는 더 좁은 `defineSingleProviderPluginEntry(...)` 헬퍼를 선호하십시오:
   
       ```typescript
       import { defineSingleProviderPluginEntry } from "openclaw/plugin-sdk/provider-entry";
   
       export default defineSingleProviderPluginEntry({
         id: "acme-ai",
         name: "Acme AI",
         description: "Acme AI model provider",
         provider: {
           label: "Acme AI",
           docsPath: "/providers/acme-ai",
           auth: [
             {
               methodId: "api-key",
               label: "Acme AI API key",
               hint: "API key from your Acme AI dashboard",
               optionKey: "acmeAiApiKey",
               flagName: "--acme-ai-api-key",
               envVar: "ACME_AI_API_KEY",
               promptMessage: "Enter your Acme AI API key",
               defaultModel: "acme-ai/acme-large",
             },
           ],
           catalog: {
             buildProvider: () => ({
               api: "openai-completions",
               baseUrl: "https://api.acme-ai.com/v1",
               models: [{ id: "acme-large", name: "Acme Large" }],
             }),
           },
         },
       });
       ```
   
       auth 흐름이 온보딩 중에 `models.providers.*`, 별칭, 에이전트 기본 모델도 패치해야 한다면 `openclaw/plugin-sdk/provider-onboard`의 프리셋 헬퍼를 사용하십시오. 가장 좁은 헬퍼는 `createDefaultModelPresetAppliers(...)`, `createDefaultModelsPresetAppliers(...)`, `createModelCatalogPresetAppliers(...)`입니다.
   
       프로바이더의 네이티브 엔드포인트가 일반 `openai-completions` 전송에서 스트리밍된 사용량 블록을 지원한다면 프로바이더 id 확인을 하드코딩하는 대신 `openclaw/plugin-sdk/provider-catalog-shared`의 공유 카탈로그 헬퍼를 선호하십시오.


  3. **동적 모델 해결 추가하기**

   프로바이더가 임의의 모델 ID를 허용한다면(프록시나 라우터처럼) `resolveDynamicModel`을 추가하십시오:
   
       ```typescript
       api.registerProvider({
         // ... 위의 id, label, auth, catalog
   
         resolveDynamicModel: (ctx) => ({
           id: ctx.modelId,
           name: ctx.modelId,
           provider: "acme-ai",
           api: "openai-completions",
           baseUrl: "https://api.acme-ai.com/v1",
           reasoning: false,
           input: ["text"],
           cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
           contextWindow: 128000,
           maxTokens: 8192,
         }),
       });
       ```
   
       해결에 네트워크 호출이 필요하다면 비동기 워밍업을 위해 `prepareDynamicModel`을 사용하십시오 — 완료 후 `resolveDynamicModel`이 다시 실행됩니다.


  4. **런타임 훅 추가하기 (필요한 경우)**

   대부분의 프로바이더는 `catalog` + `resolveDynamicModel`만 필요합니다. 프로바이더에 필요한 경우 훅을 점진적으로 추가하십시오.
   
       공유 헬퍼 빌더는 이제 가장 일반적인 재실행/도구 호환성 패밀리를 다루므로 플러그인이 일반적으로 각 훅을 하나씩 수작업으로 연결할 필요가 없습니다:
   
       ```typescript
       import { buildProviderReplayFamilyHooks } from "openclaw/plugin-sdk/provider-model-shared";
       import { buildProviderStreamFamilyHooks } from "openclaw/plugin-sdk/provider-stream";
       import { buildProviderToolCompatFamilyHooks } from "openclaw/plugin-sdk/provider-tools";
   
       const GOOGLE_FAMILY_HOOKS = {
         ...buildProviderReplayFamilyHooks({ family: "google-gemini" }),
         ...buildProviderStreamFamilyHooks("google-thinking"),
         ...buildProviderToolCompatFamilyHooks("gemini"),
       };
   
       api.registerProvider({
         id: "acme-gemini-compatible",
         // ...
         ...GOOGLE_FAMILY_HOOKS,
       });
       ```
   
       현재 사용 가능한 재실행 패밀리:
   
       | 패밀리 | 연결되는 항목 |
       | --- | --- |
       | `openai-compatible` | 도구 호출 id 정리, 어시스턴트 우선 순서 수정, 제너릭 Gemini 턴 검증을 포함한 OpenAI 호환 전송을 위한 공유 OpenAI 스타일 재실행 정책 |
       | `anthropic-by-model` | `modelId`에 의해 선택된 Claude 인식 재실행 정책으로, Anthropic 메시지 전송이 해결된 모델이 실제로 Claude id인 경우에만 Claude 특정 thinking 블록 정리를 받습니다 |
       | `google-gemini` | 네이티브 Gemini 재실행 정책과 부트스트랩 재실행 정리 및 태그된 추론 출력 모드 |
       | `passthrough-gemini` | OpenAI 호환 프록시 전송을 통해 실행되는 Gemini 모델을 위한 Gemini 사고 서명 정리; 네이티브 Gemini 재실행 검증 또는 부트스트랩 재작성을 활성화하지 않습니다 |
       | `hybrid-anthropic-openai` | 하나의 플러그인에서 Anthropic 메시지와 OpenAI 호환 모델 표면을 혼합하는 프로바이더를 위한 하이브리드 정책; 선택적 Claude 전용 thinking 블록 드롭은 Anthropic 측에 스코프됩니다 |
   
       현재 사용 가능한 스트림 패밀리:
   
       | 패밀리 | 연결되는 항목 |
       | --- | --- |
       | `google-thinking` | 공유 스트림 경로에서 Gemini thinking 페이로드 정규화 |
       | `kilocode-thinking` | 공유 프록시 스트림 경로에서 Kilo 추론 래퍼 |
       | `moonshot-thinking` | 구성 + `/think` 수준의 Moonshot 바이너리 네이티브 thinking 페이로드 매핑 |
       | `minimax-fast-mode` | 공유 스트림 경로에서 MiniMax 빠른 모드 모델 재작성 |
       | `openai-responses-defaults` | 공유 네이티브 OpenAI/Codex Responses 래퍼 |
       | `openrouter-thinking` | 프록시 라우트를 위한 OpenRouter 추론 래퍼 |
       | `tool-stream-default-on` | Z.AI와 같이 명시적으로 비활성화되지 않으면 도구 스트리밍을 원하는 프로바이더를 위한 기본 켜짐 `tool_stream` 래퍼 |
   
       **토큰 교환**

각 추론 호출 전에 토큰 교환이 필요한 프로바이더:
   
           ```typescript
           prepareRuntimeAuth: async (ctx) => {
             const exchanged = await exchangeToken(ctx.apiKey);
             return {
               apiKey: exchanged.token,
               baseUrl: exchanged.baseUrl,
               expiresAt: exchanged.expiresAt,
             };
           },
           ```


         **사용자 정의 헤더**

사용자 정의 요청 헤더 또는 본문 수정이 필요한 프로바이더:
   
           ```typescript
           // wrapStreamFn은 ctx.streamFn에서 파생된 StreamFn을 반환합니다
           wrapStreamFn: (ctx) => {
             if (!ctx.streamFn) return undefined;
             const inner = ctx.streamFn;
             return async (params) => {
               params.headers = {
                 ...params.headers,
                 "X-Acme-Version": "2",
               };
               return inner(params);
             };
           },
           ```


         **네이티브 전송 아이덴티티**

범용 HTTP 또는 WebSocket 전송에서 네이티브 요청/세션 헤더 또는 메타데이터가 필요한 프로바이더:
   
           ```typescript
           resolveTransportTurnState: (ctx) => ({
             headers: {
               "x-request-id": ctx.turnId,
             },
             metadata: {
               session_id: ctx.sessionId ?? "",
               turn_id: ctx.turnId,
             },
           }),
           resolveWebSocketSessionPolicy: (ctx) => ({
             headers: {
               "x-session-id": ctx.sessionId ?? "",
             },
             degradeCooldownMs: 60_000,
           }),
           ```


         **사용량 및 청구**

사용량/청구 데이터를 노출하는 프로바이더:
   
           ```typescript
           resolveUsageAuth: async (ctx) => {
             const auth = await ctx.resolveOAuthToken();
             return auth ? { token: auth.token } : null;
           },
           fetchUsageSnapshot: async (ctx) => {
             return await fetchAcmeUsage(ctx.token, ctx.timeoutMs);
           },
           ```


   
       ::: details 모든 사용 가능한 프로바이더 훅
   OpenClaw는 이 순서로 훅을 호출합니다. 대부분의 프로바이더는 2-3개만 사용합니다:
   
         | # | 훅 | 사용 시기 |
         | --- | --- | --- |
         | 1 | `catalog` | 모델 카탈로그 또는 기본 URL 기본값 |
         | 2 | `applyConfigDefaults` | 구성 구체화 중 프로바이더 소유 글로벌 기본값 |
         | 3 | `normalizeModelId` | 조회 전 레거시/미리보기 모델 id 별칭 정리 |
         | 4 | `normalizeTransport` | 범용 모델 어셈블리 전 프로바이더 패밀리 `api` / `baseUrl` 정리 |
         | 5 | `normalizeConfig` | `models.providers.&lt;id&gt;` 구성 정규화 |
         | 6 | `applyNativeStreamingUsageCompat` | 구성 프로바이더의 네이티브 스트리밍 사용량 호환성 재작성 |
         | 7 | `resolveConfigApiKey` | 프로바이더 소유 환경 마커 auth 해결 |
         | 8 | `resolveSyntheticAuth` | 로컬/셀프 호스팅 또는 구성 기반 합성 auth |
         | 9 | `shouldDeferSyntheticProfileAuth` | env/구성 auth 뒤에서 합성 저장 프로필 플레이스홀더 낮추기 |
         | 10 | `resolveDynamicModel` | 임의의 업스트림 모델 ID 허용 |
         | 11 | `prepareDynamicModel` | 해결 전 비동기 메타데이터 fetch |
         | 12 | `normalizeResolvedModel` | 러너 전 전송 재작성 |
         | 13 | `contributeResolvedModelCompat` | 다른 호환 전송 뒤의 벤더 모델을 위한 호환성 플래그 |
         | 14 | `capabilities` | 레거시 정적 역량 백; 호환성만 |
         | 15 | `normalizeToolSchemas` | 등록 전 프로바이더 소유 도구 스키마 정리 |
         | 16 | `inspectToolSchemas` | 프로바이더 소유 도구 스키마 진단 |
         | 17 | `resolveReasoningOutputMode` | 태그된 vs 네이티브 추론 출력 계약 |
         | 18 | `prepareExtraParams` | 기본 요청 파라미터 |
         | 19 | `createStreamFn` | 완전 커스텀 StreamFn 전송 |
         | 20 | `wrapStreamFn` | 일반 스트림 경로의 사용자 정의 헤더/본문 래퍼 |
         | 21 | `resolveTransportTurnState` | 네이티브 턴별 헤더/메타데이터 |
         | 22 | `resolveWebSocketSessionPolicy` | 네이티브 WS 세션 헤더/쿨다운 |
         | 23 | `formatApiKey` | 사용자 정의 런타임 토큰 형태 |
         | 24 | `refreshOAuth` | 사용자 정의 OAuth 갱신 |
         | 25 | `buildAuthDoctorHint` | Auth 복구 안내 |
         | 26 | `matchesContextOverflowError` | 프로바이더 소유 오버플로 감지 |
         | 27 | `classifyFailoverReason` | 프로바이더 소유 속도 제한/과부하 분류 |
         | 28 | `isCacheTtlEligible` | 프롬프트 캐시 TTL 게이팅 |
         | 29 | `buildMissingAuthMessage` | 사용자 정의 auth 누락 힌트 |
         | 30 | `suppressBuiltInModel` | 구형 업스트림 행 숨기기 |
         | 31 | `augmentModelCatalog` | 합성 순방향 호환성 행 |
         | 32 | `isBinaryThinking` | 바이너리 thinking 켜기/끄기 |
         | 33 | `supportsXHighThinking` | `xhigh` 추론 지원 |
         | 34 | `resolveDefaultThinkingLevel` | 기본 `/think` 정책 |
         | 35 | `isModernModelRef` | 라이브/스모크 모델 매칭 |
         | 36 | `prepareRuntimeAuth` | 추론 전 토큰 교환 |
         | 37 | `resolveUsageAuth` | 사용자 정의 사용량 자격 증명 파싱 |
         | 38 | `fetchUsageSnapshot` | 사용자 정의 사용량 엔드포인트 |
         | 39 | `createEmbeddingProvider` | 메모리/검색을 위한 프로바이더 소유 임베딩 어댑터 |
         | 40 | `buildReplayPolicy` | 사용자 정의 전사 재실행/압축 정책 |
         | 41 | `sanitizeReplayHistory` | 범용 정리 후 프로바이더별 재실행 재작성 |
         | 42 | `validateReplayTurns` | 임베디드 러너 전 엄격한 재실행 턴 검증 |
         | 43 | `onModelSelected` | 선택 후 콜백 (예: 텔레메트리) |
   :::


  5. **추가 역량 추가하기 (선택 사항)**

   <a id="step-5-add-extra-capabilities"></a>
       프로바이더 플러그인은 텍스트 추론과 함께 음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성, 비디오 생성, 웹 fetch, 웹 검색을 등록할 수 있습니다:
   
       ```typescript
       register(api) {
         api.registerProvider({ id: "acme-ai", /* ... */ });
   
         api.registerSpeechProvider({
           id: "acme-ai",
           label: "Acme Speech",
           isConfigured: ({ config }) => Boolean(config.messages?.tts),
           synthesize: async (req) => ({
             audioBuffer: Buffer.from(/* PCM 데이터 */),
             outputFormat: "mp3",
             fileExtension: ".mp3",
             voiceCompatible: false,
           }),
         });
   
         api.registerRealtimeTranscriptionProvider({
           id: "acme-ai",
           label: "Acme Realtime Transcription",
           isConfigured: () => true,
           createSession: (req) => ({
             connect: async () => {},
             sendAudio: () => {},
             close: () => {},
             isConnected: () => true,
           }),
         });
   
         api.registerRealtimeVoiceProvider({
           id: "acme-ai",
           label: "Acme Realtime Voice",
           isConfigured: ({ providerConfig }) => Boolean(providerConfig.apiKey),
           createBridge: (req) => ({
             connect: async () => {},
             sendAudio: () => {},
             setMediaTimestamp: () => {},
             submitToolResult: () => {},
             acknowledgeMark: () => {},
             close: () => {},
             isConnected: () => true,
           }),
         });
   
         api.registerMediaUnderstandingProvider({
           id: "acme-ai",
           capabilities: ["image", "audio"],
           describeImage: async (req) => ({ text: "A photo of..." }),
           transcribeAudio: async (req) => ({ text: "Transcript..." }),
         });
   
         api.registerImageGenerationProvider({
           id: "acme-ai",
           label: "Acme Images",
           generate: async (req) => ({ /* 이미지 결과 */ }),
         });
   
         api.registerVideoGenerationProvider({
           id: "acme-ai",
           label: "Acme Video",
           capabilities: {
             generate: {
               maxVideos: 1,
               maxDurationSeconds: 10,
               supportsResolution: true,
             },
             imageToVideo: {
               enabled: true,
               maxVideos: 1,
               maxInputImages: 1,
               maxDurationSeconds: 5,
             },
             videoToVideo: {
               enabled: false,
             },
           },
           generateVideo: async (req) => ({ videos: [] }),
         });
   
         api.registerWebFetchProvider({
           id: "acme-ai-fetch",
           label: "Acme Fetch",
           hint: "Fetch pages through Acme's rendering backend.",
           envVars: ["ACME_FETCH_API_KEY"],
           placeholder: "acme-...",
           signupUrl: "https://acme.example.com/fetch",
           credentialPath: "plugins.entries.acme.config.webFetch.apiKey",
           getCredentialValue: (fetchConfig) => fetchConfig?.acme?.apiKey,
           setCredentialValue: (fetchConfigTarget, value) => {
             const acme = (fetchConfigTarget.acme ??= {});
             acme.apiKey = value;
           },
           createTool: () => ({
             description: "Fetch a page through Acme Fetch.",
             parameters: {},
             execute: async (args) => ({ content: [] }),
           }),
         });
   
         api.registerWebSearchProvider({
           id: "acme-ai-search",
           label: "Acme Search",
           search: async (req) => ({ content: [] }),
         });
       }
       ```
   
       OpenClaw는 이를 **hybrid-capability** 플러그인으로 분류합니다. 이것이 회사 플러그인(벤더당 하나의 플러그인)에 권장되는 패턴입니다. [내부 구조: 역량 소유권](/plugins/architecture#capability-ownership-model)을 참조하십시오.


  6. **테스트**

   <a id="step-6-test"></a>
       ```typescript src/provider.test.ts
       import { describe, it, expect } from "vitest";
       // index.ts 또는 전용 파일에서 프로바이더 구성 객체를 내보내십시오
       import { acmeProvider } from "./provider.js";
   
       describe("acme-ai provider", () => {
         it("resolves dynamic models", () => {
           const model = acmeProvider.resolveDynamicModel!({
             modelId: "acme-beta-v3",
           } as any);
           expect(model.id).toBe("acme-beta-v3");
           expect(model.provider).toBe("acme-ai");
         });
   
         it("returns catalog when key is available", async () => {
           const result = await acmeProvider.catalog!.run({
             resolveProviderApiKey: () => ({ apiKey: "test-key" }),
           } as any);
           expect(result?.provider?.models).toHaveLength(2);
         });
   
         it("returns null catalog when no key", async () => {
           const result = await acmeProvider.catalog!.run({
             resolveProviderApiKey: () => ({ apiKey: undefined }),
           } as any);
           expect(result).toBeNull();
         });
       });
       ```


## ClawHub에 게시하기

프로바이더 플러그인은 다른 외부 코드 플러그인과 동일한 방식으로 게시됩니다:

```bash
clawhub package publish your-org/your-plugin --dry-run
clawhub package publish your-org/your-plugin
```

여기서 레거시 스킬 전용 게시 별칭을 사용하지 마십시오; 플러그인 패키지는 `clawhub package publish`를 사용해야 합니다.

## 파일 구조

```
&lt;bundled-plugin-root&gt;/acme-ai/
├── package.json              # openclaw.providers 메타데이터
├── openclaw.plugin.json      # 프로바이더 auth 메타데이터가 있는 매니페스트
├── index.ts                  # definePluginEntry + registerProvider
└── src/
    ├── provider.test.ts      # 테스트
    └── usage.ts              # 사용량 엔드포인트 (선택 사항)
```

## 카탈로그 순서 레퍼런스

`catalog.order`는 내장 프로바이더에 상대적으로 카탈로그가 언제 병합되는지 제어합니다:

| 순서      | 시기           | 사용 사례                                         |
| --------- | -------------- | ------------------------------------------------- |
| `simple`  | 첫 번째 패스   | 일반 API 키 프로바이더                            |
| `profile` | simple 이후    | auth 프로필에 게이팅된 프로바이더                 |
| `paired`  | profile 이후   | 여러 관련 항목 합성                               |
| `late`    | 마지막 패스    | 기존 프로바이더 재정의 (충돌 시 승리)             |

## 다음 단계

- [채널 플러그인](/plugins/sdk-channel-plugins) — 플러그인이 채널도 제공한다면
- [SDK 런타임](/plugins/sdk-runtime) — `api.runtime` 헬퍼 (TTS, 검색, 서브에이전트)
- [SDK 개요](/plugins/sdk-overview) — 전체 서브패스 임포트 레퍼런스
- [플러그인 내부 구조](/plugins/architecture#provider-runtime-hooks) — 훅 세부 정보 및 번들 예시
