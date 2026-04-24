import{_ as i,o as a,c as n,ag as e}from"./chunks/framework.CTpQozEL.js";const E=JSON.parse('{"title":"Provider 플러그인 구축하기","description":"OpenClaw를 위한 모델 provider 플러그인 구축 단계별 가이드","frontmatter":{"title":"Provider 플러그인 구축하기","description":"OpenClaw를 위한 모델 provider 플러그인 구축 단계별 가이드"},"headers":[],"relativePath":"plugins/sdk-provider-plugins.md","filePath":"plugins/sdk-provider-plugins.md","lastUpdated":null}'),t={name:"plugins/sdk-provider-plugins.md"};function p(l,s,h,k,r,o){return a(),n("div",null,[...s[0]||(s[0]=[e(`<p>이 가이드는 OpenClaw에 모델 provider(LLM)를 추가하는 provider 플러그인을 구축하는 과정을 안내합니다. 이 가이드를 마치면 모델 catalog, API 키 auth, 동적 모델 해결 기능을 갖춘 provider를 완성하게 됩니다.</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>OpenClaw 플러그인을 한 번도 구축해본 적이 없다면, 기본 패키지 구조와 매니페스트 설정을 위해 <a href="/openclaw-docs-ko/plugins/building-plugins">시작하기</a>를 먼저 읽어보십시오.</p></div><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Provider 플러그인은 OpenClaw의 일반 추론 루프에 모델을 추가합니다. 만약 모델이 스레드, compaction, tool 이벤트를 소유하는 네이티브 에이전트 데몬을 통해 실행되어야 한다면, 데몬 프로토콜 세부 사항을 코어에 넣는 대신 <a href="/openclaw-docs-ko/plugins/sdk-agent-harness">agent harness</a>와 함께 provider를 페어링하십시오.</p></div><h2 id="단계별-안내" tabindex="-1">단계별 안내 <a class="header-anchor" href="#단계별-안내" aria-label="Permalink to &quot;단계별 안내&quot;">​</a></h2><ol><li><p><strong>패키지 및 매니페스트</strong></p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@myorg/openclaw-acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;version&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1.0.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;module&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;openclaw&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;extensions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;./index.ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;providers&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;compat&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;pluginApi&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&gt;=2026.3.24-beta.2&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;minGatewayVersion&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;2026.3.24-beta.2&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;build&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;openclawVersion&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;2026.3.24-beta.2&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;pluginSdkVersion&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;2026.3.24-beta.2&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`json openclaw.plugin.json</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme AI&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;description&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme AI model provider&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;providers&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;modelSupport&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;modelPrefixes&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;providerAuthEnvVars&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ACME_AI_API_KEY&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;providerAuthAliases&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;acme-ai-coding&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;providerAuthChoices&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;provider&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;method&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;api-key&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;choiceId&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai-api-key&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;choiceLabel&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme AI API key&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;groupId&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;groupLabel&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme AI&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;cliFlag&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;--acme-ai-api-key&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;cliOption&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;--acme-ai-api-key &lt;key&gt;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;cliDescription&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme AI API key&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;configSchema&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;object&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;additionalProperties&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    매니페스트는 \`providerAuthEnvVars\`를 선언하여 OpenClaw가 플러그인 런타임을</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    로드하지 않고도 자격 증명을 감지할 수 있도록 합니다. Provider 변형이 다른</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    provider id의 auth를 재사용해야 할 때는 \`providerAuthAliases\`를 추가하십시오.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`modelSupport\`는 선택 사항이며, \`acme-large\`와 같은 축약형 모델 id로부터</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    런타임 hook이 존재하기 전에 OpenClaw가 provider 플러그인을 자동 로드할 수</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    있도록 합니다. ClawHub에 provider를 게시하는 경우, \`package.json\`의</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`openclaw.compat\` 및 \`openclaw.build\` 필드가 필수입니다.</span></span></code></pre></div></li><li><p><strong>Provider 등록하기</strong></p></li></ol><p>최소한의 provider는 <code>id</code>, <code>label</code>, <code>auth</code>, <code>catalog</code>가 필요합니다:</p><pre><code>   \`\`\`typescript index.ts
   import { definePluginEntry } from &quot;openclaw/plugin-sdk/plugin-entry&quot;;
   import { createProviderApiKeyAuthMethod } from &quot;openclaw/plugin-sdk/provider-auth&quot;;

   export default definePluginEntry({
     id: &quot;acme-ai&quot;,
     name: &quot;Acme AI&quot;,
     description: &quot;Acme AI model provider&quot;,
     register(api) {
       api.registerProvider({
         id: &quot;acme-ai&quot;,
         label: &quot;Acme AI&quot;,
         docsPath: &quot;/providers/acme-ai&quot;,
         envVars: [&quot;ACME_AI_API_KEY&quot;],

         auth: [
           createProviderApiKeyAuthMethod({
             providerId: &quot;acme-ai&quot;,
             methodId: &quot;api-key&quot;,
             label: &quot;Acme AI API key&quot;,
             hint: &quot;API key from your Acme AI dashboard&quot;,
             optionKey: &quot;acmeAiApiKey&quot;,
             flagName: &quot;--acme-ai-api-key&quot;,
             envVar: &quot;ACME_AI_API_KEY&quot;,
             promptMessage: &quot;Enter your Acme AI API key&quot;,
             defaultModel: &quot;acme-ai/acme-large&quot;,
           }),
         ],

         catalog: {
           order: &quot;simple&quot;,
           run: async (ctx) =&gt; {
             const apiKey =
               ctx.resolveProviderApiKey(&quot;acme-ai&quot;).apiKey;
             if (!apiKey) return null;
             return {
               provider: {
                 baseUrl: &quot;https://api.acme-ai.com/v1&quot;,
                 apiKey,
                 api: &quot;openai-completions&quot;,
                 models: [
                   {
                     id: &quot;acme-large&quot;,
                     name: &quot;Acme Large&quot;,
                     reasoning: true,
                     input: [&quot;text&quot;, &quot;image&quot;],
                     cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
                     contextWindow: 200000,
                     maxTokens: 32768,
                   },
                   {
                     id: &quot;acme-small&quot;,
                     name: &quot;Acme Small&quot;,
                     reasoning: false,
                     input: [&quot;text&quot;],
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
   \`\`\`

   이것이 동작하는 provider입니다. 사용자는 이제
   \`openclaw onboard --acme-ai-api-key &lt;key&gt;\`를 실행하고 모델로
   \`acme-ai/acme-large\`를 선택할 수 있습니다.

   업스트림 provider가 OpenClaw와 다른 제어 토큰을 사용한다면, 스트림 경로를
   교체하는 대신 작은 양방향 텍스트 변환을 추가하십시오:

   \`\`\`typescript
   api.registerTextTransforms({
     input: [
       { from: /red basket/g, to: &quot;blue basket&quot; },
       { from: /paper ticket/g, to: &quot;digital ticket&quot; },
       { from: /left shelf/g, to: &quot;right shelf&quot; },
     ],
     output: [
       { from: /blue basket/g, to: &quot;red basket&quot; },
       { from: /digital ticket/g, to: &quot;paper ticket&quot; },
       { from: /right shelf/g, to: &quot;left shelf&quot; },
     ],
   });
   \`\`\`

   \`input\`은 transport 이전에 최종 시스템 프롬프트와 텍스트 메시지 콘텐츠를
   다시 씁니다. \`output\`은 OpenClaw가 자체 제어 마커를 파싱하거나 채널로
   전달하기 전에 어시스턴트 텍스트 delta와 최종 텍스트를 다시 씁니다.

   API 키 auth와 단일 catalog 기반 런타임을 가진 텍스트 provider 하나만
   등록하는 번들 provider의 경우, 더 좁은
   \`defineSingleProviderPluginEntry(...)\` 헬퍼를 선호하십시오:

   \`\`\`typescript
   import { defineSingleProviderPluginEntry } from &quot;openclaw/plugin-sdk/provider-entry&quot;;

   export default defineSingleProviderPluginEntry({
     id: &quot;acme-ai&quot;,
     name: &quot;Acme AI&quot;,
     description: &quot;Acme AI model provider&quot;,
     provider: {
       label: &quot;Acme AI&quot;,
       docsPath: &quot;/providers/acme-ai&quot;,
       auth: [
         {
           methodId: &quot;api-key&quot;,
           label: &quot;Acme AI API key&quot;,
           hint: &quot;API key from your Acme AI dashboard&quot;,
           optionKey: &quot;acmeAiApiKey&quot;,
           flagName: &quot;--acme-ai-api-key&quot;,
           envVar: &quot;ACME_AI_API_KEY&quot;,
           promptMessage: &quot;Enter your Acme AI API key&quot;,
           defaultModel: &quot;acme-ai/acme-large&quot;,
         },
       ],
       catalog: {
         buildProvider: () =&gt; ({
           api: &quot;openai-completions&quot;,
           baseUrl: &quot;https://api.acme-ai.com/v1&quot;,
           models: [{ id: &quot;acme-large&quot;, name: &quot;Acme Large&quot; }],
         }),
         buildStaticProvider: () =&gt; ({
           api: &quot;openai-completions&quot;,
           baseUrl: &quot;https://api.acme-ai.com/v1&quot;,
           models: [{ id: &quot;acme-large&quot;, name: &quot;Acme Large&quot; }],
         }),
       },
     },
   });
   \`\`\`

   \`buildProvider\`는 OpenClaw가 실제 provider auth를 해결할 수 있을 때 사용되는
   라이브 catalog 경로입니다. Provider별 디스커버리를 수행할 수 있습니다.
   \`buildStaticProvider\`는 auth가 구성되기 전에 보여주기 안전한 오프라인 행
   전용으로만 사용하십시오; 자격 증명을 요구하거나 네트워크 요청을 해서는
   안 됩니다. OpenClaw의 \`models list --all\` 표시는 현재 번들 provider
   플러그인에 대해서만 빈 config, 빈 env, agent/workspace 경로 없이 static
   catalog를 실행합니다.

   Auth 플로우가 온보딩 중에 \`models.providers.*\`, 별칭, 에이전트 기본 모델을
   패치해야 한다면, \`openclaw/plugin-sdk/provider-onboard\`의 preset 헬퍼를
   사용하십시오. 가장 좁은 헬퍼는
   \`createDefaultModelPresetAppliers(...)\`,
   \`createDefaultModelsPresetAppliers(...)\`,
   \`createModelCatalogPresetAppliers(...)\`입니다.

   Provider의 네이티브 엔드포인트가 일반 \`openai-completions\` transport에서
   스트림된 usage 블록을 지원할 때, provider-id 확인을 하드코딩하는 대신
   \`openclaw/plugin-sdk/provider-catalog-shared\`의 공유 catalog 헬퍼를
   선호하십시오. \`supportsNativeStreamingUsageCompat(...)\`와
   \`applyProviderNativeStreamingUsageCompat(...)\`는 엔드포인트 capability 맵에서
   지원을 감지하므로, 플러그인이 사용자 정의 provider id를 사용할 때도 네이티브
   Moonshot/DashScope 스타일 엔드포인트가 여전히 옵트인됩니다.
</code></pre><ol start="3"><li><strong>동적 모델 해결 추가하기</strong></li></ol><p>Provider가 임의의 모델 ID(프록시나 라우터처럼)를 받아들인다면, <code>resolveDynamicModel</code>을 추가하십시오:</p><pre><code>   \`\`\`typescript
   api.registerProvider({
     // ... 위의 id, label, auth, catalog

     resolveDynamicModel: (ctx) =&gt; ({
       id: ctx.modelId,
       name: ctx.modelId,
       provider: &quot;acme-ai&quot;,
       api: &quot;openai-completions&quot;,
       baseUrl: &quot;https://api.acme-ai.com/v1&quot;,
       reasoning: false,
       input: [&quot;text&quot;],
       cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
       contextWindow: 128000,
       maxTokens: 8192,
     }),
   });
   \`\`\`

   해결에 네트워크 호출이 필요하면 비동기 워밍업을 위해 \`prepareDynamicModel\`을
   사용하십시오 — \`resolveDynamicModel\`은 완료된 뒤 다시 실행됩니다.
</code></pre><ol start="4"><li><strong>런타임 hook 추가하기 (필요에 따라)</strong></li></ol><p>대부분의 provider는 <code>catalog</code> + <code>resolveDynamicModel</code>만 필요합니다. Provider가 요구하는 대로 hook을 점진적으로 추가하십시오.</p><pre><code>   공유 헬퍼 빌더는 이제 가장 흔한 replay/tool-compat 패밀리를 커버하므로,
   플러그인은 일반적으로 각 hook을 하나씩 수작업으로 배선할 필요가 없습니다:

   \`\`\`typescript
   import { buildProviderReplayFamilyHooks } from &quot;openclaw/plugin-sdk/provider-model-shared&quot;;
   import { buildProviderStreamFamilyHooks } from &quot;openclaw/plugin-sdk/provider-stream&quot;;
   import { buildProviderToolCompatFamilyHooks } from &quot;openclaw/plugin-sdk/provider-tools&quot;;

   const GOOGLE_FAMILY_HOOKS = {
     ...buildProviderReplayFamilyHooks({ family: &quot;google-gemini&quot; }),
     ...buildProviderStreamFamilyHooks(&quot;google-thinking&quot;),
     ...buildProviderToolCompatFamilyHooks(&quot;gemini&quot;),
   };

   api.registerProvider({
     id: &quot;acme-gemini-compatible&quot;,
     // ...
     ...GOOGLE_FAMILY_HOOKS,
   });
   \`\`\`

   현재 사용 가능한 replay 패밀리:

   | 패밀리 | 배선하는 내용 | 번들 예시 |
   | --- | --- | --- |
   | \`openai-compatible\` | OpenAI 호환 transport를 위한 공유 OpenAI 스타일 replay 정책, tool-call-id 소독, assistant-first 순서 수정, transport가 필요로 하는 일반 Gemini-turn 검증 포함 | \`moonshot\`, \`ollama\`, \`xai\`, \`zai\` |
   | \`anthropic-by-model\` | \`modelId\`로 선택되는 Claude 인식 replay 정책으로, Anthropic-message transport가 해결된 모델이 실제 Claude id일 때만 Claude 전용 thinking-block 정리를 받도록 함 | \`amazon-bedrock\`, \`anthropic-vertex\` |
   | \`google-gemini\` | 네이티브 Gemini replay 정책과 부트스트랩 replay 소독 및 태그된 reasoning-output 모드 | \`google\`, \`google-gemini-cli\` |
   | \`passthrough-gemini\` | OpenAI 호환 프록시 transport를 통해 실행되는 Gemini 모델을 위한 Gemini thought-signature 소독; 네이티브 Gemini replay 검증이나 부트스트랩 재작성은 활성화하지 않음 | \`openrouter\`, \`kilocode\`, \`opencode\`, \`opencode-go\` |
   | \`hybrid-anthropic-openai\` | 한 플러그인에서 Anthropic-message와 OpenAI 호환 모델 표면을 섞는 provider를 위한 하이브리드 정책; 선택적 Claude 전용 thinking-block 드롭은 Anthropic 쪽에만 스코프됨 | \`minimax\` |

   현재 사용 가능한 stream 패밀리:

   | 패밀리 | 배선하는 내용 | 번들 예시 |
   | --- | --- | --- |
   | \`google-thinking\` | 공유 stream 경로에서 Gemini thinking 페이로드 정규화 | \`google\`, \`google-gemini-cli\` |
   | \`kilocode-thinking\` | 공유 프록시 stream 경로에서 Kilo reasoning 래퍼, \`kilo/auto\`와 지원되지 않는 프록시 reasoning id는 주입된 thinking을 건너뜀 | \`kilocode\` |
   | \`moonshot-thinking\` | config + \`/think\` 레벨로부터의 Moonshot 바이너리 네이티브 thinking 페이로드 매핑 | \`moonshot\` |
   | \`minimax-fast-mode\` | 공유 stream 경로에서 MiniMax fast-mode 모델 재작성 | \`minimax\`, \`minimax-portal\` |
   | \`openai-responses-defaults\` | 공유 네이티브 OpenAI/Codex Responses 래퍼: 귀속 헤더, \`/fast\`/\`serviceTier\`, 텍스트 상세도, 네이티브 Codex 웹 검색, reasoning-compat 페이로드 형성, Responses 컨텍스트 관리 | \`openai\`, \`openai-codex\` |
   | \`openrouter-thinking\` | 프록시 라우트를 위한 OpenRouter reasoning 래퍼, 지원되지 않는 모델/\`auto\` 건너뛰기를 중앙에서 처리 | \`openrouter\` |
   | \`tool-stream-default-on\` | 명시적으로 비활성화하지 않는 한 tool streaming을 원하는 Z.AI 같은 provider를 위한 기본 활성화 \`tool_stream\` 래퍼 | \`zai\` |

   ::: details 패밀리 빌더를 뒷받침하는 SDK seam
</code></pre><p>각 패밀리 빌더는 같은 패키지에서 내보낸 하위 수준 공개 헬퍼로 구성되며, provider가 일반 패턴에서 벗어나야 할 때 이들에 접근할 수 있습니다:</p><pre><code>     - \`openclaw/plugin-sdk/provider-model-shared\` — \`ProviderReplayFamily\`, \`buildProviderReplayFamilyHooks(...)\`, 원시 replay 빌더(\`buildOpenAICompatibleReplayPolicy\`, \`buildAnthropicReplayPolicyForModel\`, \`buildGoogleGeminiReplayPolicy\`, \`buildHybridAnthropicOrOpenAIReplayPolicy\`). Gemini replay 헬퍼(\`sanitizeGoogleGeminiReplayHistory\`, \`resolveTaggedReasoningOutputMode\`)와 엔드포인트/모델 헬퍼(\`resolveProviderEndpoint\`, \`normalizeProviderId\`, \`normalizeGooglePreviewModelId\`, \`normalizeNativeXaiModelId\`)도 내보냅니다.
     - \`openclaw/plugin-sdk/provider-stream\` — \`ProviderStreamFamily\`, \`buildProviderStreamFamilyHooks(...)\`, \`composeProviderStreamWrappers(...)\`, 그리고 공유 OpenAI/Codex 래퍼(\`createOpenAIAttributionHeadersWrapper\`, \`createOpenAIFastModeWrapper\`, \`createOpenAIServiceTierWrapper\`, \`createOpenAIResponsesContextManagementWrapper\`, \`createCodexNativeWebSearchWrapper\`)와 공유 프록시/provider 래퍼(\`createOpenRouterWrapper\`, \`createToolStreamWrapper\`, \`createMinimaxFastModeWrapper\`).
     - \`openclaw/plugin-sdk/provider-tools\` — \`ProviderToolCompatFamily\`, \`buildProviderToolCompatFamilyHooks(&quot;gemini&quot;)\`, 기반 Gemini 스키마 헬퍼(\`normalizeGeminiToolSchemas\`, \`inspectGeminiToolSchemas\`), xAI 호환성 헬퍼(\`resolveXaiModelCompatPatch()\`, \`applyXaiModelCompat(model)\`). 번들된 xAI 플러그인은 이들과 함께 \`normalizeResolvedModel\` + \`contributeResolvedModelCompat\`를 사용해 xAI 규칙이 provider 소유로 유지되게 합니다.

     일부 stream 헬퍼는 의도적으로 provider-local로 남아 있습니다. \`@openclaw/anthropic-provider\`는 Claude OAuth beta 처리와 \`context1m\` 게이팅을 인코딩하기 때문에 \`wrapAnthropicProviderStream\`, \`resolveAnthropicBetas\`, \`resolveAnthropicFastMode\`, \`resolveAnthropicServiceTier\`, 그리고 하위 수준 Anthropic 래퍼 빌더를 자체 공개 \`api.ts\` / \`contract-api.ts\` seam에 보관합니다. xAI 플러그인도 유사하게 네이티브 xAI Responses 형성(\`/fast\` 별칭, 기본 \`tool_stream\`, 지원되지 않는 strict-tool 정리, xAI 특화 reasoning-payload 제거)을 자체 \`wrapStreamFn\`에 유지합니다.

     같은 패키지 루트 패턴은 \`@openclaw/openai-provider\`(provider 빌더, 기본 모델 헬퍼, realtime provider 빌더)와 \`@openclaw/openrouter-provider\`(provider 빌더와 온보딩/config 헬퍼)도 뒷받침합니다.
</code></pre><p>:::</p><pre><code>   **토큰 교환**
</code></pre><p>추론 호출 전마다 토큰 교환이 필요한 provider의 경우:</p><pre><code>       \`\`\`typescript
       prepareRuntimeAuth: async (ctx) =&gt; {
         const exchanged = await exchangeToken(ctx.apiKey);
         return {
           apiKey: exchanged.token,
           baseUrl: exchanged.baseUrl,
           expiresAt: exchanged.expiresAt,
         };
       },
       \`\`\`


     **사용자 정의 헤더**
</code></pre><p>사용자 정의 요청 헤더나 본문 수정이 필요한 provider의 경우:</p><pre><code>       \`\`\`typescript
       // wrapStreamFn은 ctx.streamFn에서 파생된 StreamFn을 반환합니다
       wrapStreamFn: (ctx) =&gt; {
         if (!ctx.streamFn) return undefined;
         const inner = ctx.streamFn;
         return async (params) =&gt; {
           params.headers = {
             ...params.headers,
             &quot;X-Acme-Version&quot;: &quot;2&quot;,
           };
           return inner(params);
         };
       },
       \`\`\`


     **네이티브 transport 아이덴티티**
</code></pre><p>일반 HTTP 또는 WebSocket transport에서 네이티브 요청/세션 헤더나 메타데이터가 필요한 provider의 경우:</p><pre><code>       \`\`\`typescript
       resolveTransportTurnState: (ctx) =&gt; ({
         headers: {
           &quot;x-request-id&quot;: ctx.turnId,
         },
         metadata: {
           session_id: ctx.sessionId ?? &quot;&quot;,
           turn_id: ctx.turnId,
         },
       }),
       resolveWebSocketSessionPolicy: (ctx) =&gt; ({
         headers: {
           &quot;x-session-id&quot;: ctx.sessionId ?? &quot;&quot;,
         },
         degradeCooldownMs: 60_000,
       }),
       \`\`\`


     **사용량 및 청구**
</code></pre><p>사용량/청구 데이터를 노출하는 provider의 경우:</p><pre><code>       \`\`\`typescript
       resolveUsageAuth: async (ctx) =&gt; {
         const auth = await ctx.resolveOAuthToken();
         return auth ? { token: auth.token } : null;
       },
       fetchUsageSnapshot: async (ctx) =&gt; {
         return await fetchAcmeUsage(ctx.token, ctx.timeoutMs);
       },
       \`\`\`



   ::: details 사용 가능한 모든 provider hook
</code></pre><p>OpenClaw는 이 순서로 hook을 호출합니다. 대부분의 provider는 2–3개만 사용합니다:</p><pre><code>     | # | Hook | 사용 시기 |
     | --- | --- | --- |
     | 1 | \`catalog\` | 모델 catalog 또는 base URL 기본값 |
     | 2 | \`applyConfigDefaults\` | config 머터리얼라이제이션 중 provider 소유의 전역 기본값 |
     | 3 | \`normalizeModelId\` | 조회 전 레거시/프리뷰 모델-id 별칭 정리 |
     | 4 | \`normalizeTransport\` | 일반 모델 조립 전 provider 패밀리 \`api\` / \`baseUrl\` 정리 |
     | 5 | \`normalizeConfig\` | \`models.providers.&lt;id&gt;\` config 정규화 |
     | 6 | \`applyNativeStreamingUsageCompat\` | config provider를 위한 네이티브 streaming-usage 호환 재작성 |
     | 7 | \`resolveConfigApiKey\` | Provider 소유의 env-marker auth 해결 |
     | 8 | \`resolveSyntheticAuth\` | 로컬/셀프 호스팅 또는 config 기반 synthetic auth |
     | 9 | \`shouldDeferSyntheticProfileAuth\` | env/config auth 뒤로 synthetic 저장된 프로필 플레이스홀더를 낮춤 |
     | 10 | \`resolveDynamicModel\` | 임의의 업스트림 모델 ID 허용 |
     | 11 | \`prepareDynamicModel\` | 해결 전 비동기 메타데이터 fetch |
     | 12 | \`normalizeResolvedModel\` | 러너 전 transport 재작성 |
     | 13 | \`contributeResolvedModelCompat\` | 다른 호환 transport 뒤의 벤더 모델을 위한 호환 플래그 |
     | 14 | \`capabilities\` | 레거시 정적 capability bag; 호환성 전용 |
     | 15 | \`normalizeToolSchemas\` | 등록 전 provider 소유의 tool-schema 정리 |
     | 16 | \`inspectToolSchemas\` | Provider 소유의 tool-schema 진단 |
     | 17 | \`resolveReasoningOutputMode\` | 태그된 vs 네이티브 reasoning-output 계약 |
     | 18 | \`prepareExtraParams\` | 기본 요청 파라미터 |
     | 19 | \`createStreamFn\` | 완전히 사용자 정의한 StreamFn transport |
     | 20 | \`wrapStreamFn\` | 일반 stream 경로에서 사용자 정의 헤더/본문 래퍼 |
     | 21 | \`resolveTransportTurnState\` | 네이티브 턴별 헤더/메타데이터 |
     | 22 | \`resolveWebSocketSessionPolicy\` | 네이티브 WS 세션 헤더/쿨다운 |
     | 23 | \`formatApiKey\` | 사용자 정의 런타임 토큰 형태 |
     | 24 | \`refreshOAuth\` | 사용자 정의 OAuth 갱신 |
     | 25 | \`buildAuthDoctorHint\` | Auth 복구 가이던스 |
     | 26 | \`matchesContextOverflowError\` | Provider 소유의 오버플로 감지 |
     | 27 | \`classifyFailoverReason\` | Provider 소유의 rate-limit/과부하 분류 |
     | 28 | \`isCacheTtlEligible\` | 프롬프트 캐시 TTL 게이팅 |
     | 29 | \`buildMissingAuthMessage\` | 사용자 정의 missing-auth 힌트 |
     | 30 | \`suppressBuiltInModel\` | 오래된 업스트림 행 숨김 |
     | 31 | \`augmentModelCatalog\` | 합성 forward-compat 행 |
     | 32 | \`resolveThinkingProfile\` | 모델별 \`/think\` 옵션 세트 |
     | 33 | \`isBinaryThinking\` | 이진 thinking on/off 호환성 |
     | 34 | \`supportsXHighThinking\` | \`xhigh\` reasoning 지원 호환성 |
     | 35 | \`resolveDefaultThinkingLevel\` | 기본 \`/think\` 정책 호환성 |
     | 36 | \`isModernModelRef\` | 라이브/스모크 모델 매칭 |
     | 37 | \`prepareRuntimeAuth\` | 추론 전 토큰 교환 |
     | 38 | \`resolveUsageAuth\` | 사용자 정의 사용량 자격 증명 파싱 |
     | 39 | \`fetchUsageSnapshot\` | 사용자 정의 사용량 엔드포인트 |
     | 40 | \`createEmbeddingProvider\` | 메모리/검색을 위한 provider 소유 임베딩 어댑터 |
     | 41 | \`buildReplayPolicy\` | 사용자 정의 transcript replay/compaction 정책 |
     | 42 | \`sanitizeReplayHistory\` | 일반 정리 후 provider 특화 replay 재작성 |
     | 43 | \`validateReplayTurns\` | 임베디드 러너 전 엄격한 replay-turn 검증 |
     | 44 | \`onModelSelected\` | 선택 후 콜백 (예: 텔레메트리) |

     런타임 폴백 참고 사항:

     - \`normalizeConfig\`는 매칭된 provider를 먼저 확인한 뒤, 실제로 config를
       변경하는 다른 hook 가능한 provider 플러그인을 확인합니다. Provider hook이
       지원되는 Google 패밀리 config 엔트리를 재작성하지 않으면, 번들된 Google
       config 정규화기가 여전히 적용됩니다.
     - \`resolveConfigApiKey\`는 노출될 때 provider hook을 사용합니다. 번들된
       \`amazon-bedrock\` 경로는 Bedrock 런타임 auth 자체가 여전히 AWS SDK 기본
       체인을 사용하더라도 여기에 내장된 AWS env-marker 해결기도 가지고 있습니다.
     - \`resolveSystemPromptContribution\`은 provider가 모델 패밀리에 대해
       캐시 인식 시스템 프롬프트 가이던스를 주입할 수 있도록 합니다. 동작이 하나의
       provider/모델 패밀리에 속하며 안정/동적 캐시 분할을 보존해야 할 때
       \`before_prompt_build\`보다 이를 선호하십시오.

     자세한 설명과 실제 예시는 [내부 구조: Provider 런타임 Hook](/plugins/architecture-internals#provider-runtime-hooks)를 참조하십시오.
</code></pre><p>:::</p><ol start="5"><li><strong>추가 capability 추가하기 (선택 사항)</strong></li></ol><p>Provider 플러그인은 텍스트 추론과 함께 speech, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성, 비디오 생성, 웹 fetch, 웹 검색을 등록할 수 있습니다. OpenClaw는 이를 <strong>하이브리드 capability</strong> 플러그인으로 분류합니다 — 회사 플러그인을 위한 권장 패턴입니다(벤더당 플러그인 하나). <a href="/openclaw-docs-ko/plugins/architecture#capability-ownership-model">내부 구조: Capability 소유권</a>를 참조하십시오.</p><pre><code>   각 capability를 기존 \`api.registerProvider(...)\` 호출과 함께 \`register(api)\`
   내부에 등록하십시오. 필요한 탭만 선택하십시오:

   **Speech (TTS)**
</code></pre><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           api.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">registerSpeechProvider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme Speech&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             isConfigured</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(config.messages?.tts),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             synthesize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">req</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">               audioBuffer: Buffer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* PCM data */</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">               outputFormat: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mp3&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">               fileExtension: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.mp3&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">               voiceCompatible: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         **실시간 전사**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createRealtimeTranscriptionWebSocketSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`을 선호하십시오 — 공유</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           헬퍼는 프록시 캡처, 재연결 백오프, close flush, ready 핸드셰이크, 오디오</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           큐잉, close-event 진단을 처리합니다. 플러그인은 업스트림 이벤트만</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           매핑하면 됩니다.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`\`\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typescript</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           api.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">registerRealtimeTranscriptionProvider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme Realtime Transcription&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             isConfigured</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             createSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">req</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">               const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> apiKey</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(req.providerConfig.apiKey </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">??</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">               return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createRealtimeTranscriptionWebSocketSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                 providerId: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                 callbacks: req,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                 url: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;wss://api.example.com/v1/realtime-transcription&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                 headers: { Authorization: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`Bearer \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">apiKey</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                 onMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transport</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                   if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (event.type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;session.created&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                     transport.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendJson</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;session.update&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                     transport.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">markReady</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                     return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                   }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                   if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (event.type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;transcript.final&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                     req.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onTranscript</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">?.(event.text);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                   }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                 },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                 sendAudio</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">audio</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transport</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                   transport.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendJson</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                     type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;audio.append&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                     audio: audio.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;base64&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                   });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                 },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                 onClose</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transport</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                   transport.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendJson</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;audio.end&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                 },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">               });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           멀티파트 오디오를 POST하는 배치 STT provider는</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">openclaw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plugin</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">sdk</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">provider</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">http</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`의</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">buildAudioTranscriptionFormData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`를 사용해야 합니다. 헬퍼는 호환</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           가능한 전사 API를 위해 M4A 스타일 파일명이 필요한 AAC 업로드를 포함해</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           업로드 파일명을 정규화합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         **실시간 음성**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typescript</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           api.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">registerRealtimeVoiceProvider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;acme-ai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Acme Realtime Voice&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             isConfigured</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">providerConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(providerConfig.apiKey),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             createBridge</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">req</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">               connect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">               sendAudio</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">               setMediaTimestamp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">               submitToolResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">               acknowledgeMark</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">               close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">               isConnected</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         **미디어 이해**</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">�OC_CODE_1�</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           api.registerWebFetchProvider({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             id: &quot;acme-ai-fetch&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             label: &quot;Acme Fetch&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             hint: &quot;Fetch pages through Acme&#39;s rendering backend.&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             envVars: [&quot;ACME_FETCH_API_KEY&quot;],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             placeholder: &quot;acme-...&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             signupUrl: &quot;https://acme.example.com/fetch&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             credentialPath: &quot;plugins.entries.acme.config.webFetch.apiKey&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             getCredentialValue: (fetchConfig) =&gt; fetchConfig?.acme?.apiKey,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             setCredentialValue: (fetchConfigTarget, value) =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">               const acme = (fetchConfigTarget.acme ??= {});</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">               acme.apiKey = value;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             createTool: () =&gt; ({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">               description: &quot;Fetch a page through Acme Fetch.&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">               parameters: {},</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">               execute: async (args) =&gt; ({ content: [] }),</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             }),</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           api.registerWebSearchProvider({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             id: &quot;acme-ai-search&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             label: &quot;Acme Search&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             search: async (req) =&gt; ({ content: [] }),</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  6.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> **</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">테스트</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   \`\`\`typescript src/provider.test.ts</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       import { describe, it, expect } from &quot;vitest&quot;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       // index.ts 또는 전용 파일에서 provider 구성 객체를 내보내십시오</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       import { acmeProvider } from &quot;./provider.js&quot;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       describe(&quot;acme-ai provider&quot;, () =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         it(&quot;resolves dynamic models&quot;, () =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           const model = acmeProvider.resolveDynamicModel!({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             modelId: &quot;acme-beta-v3&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           } as any);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           expect(model.id).toBe(&quot;acme-beta-v3&quot;);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           expect(model.provider).toBe(&quot;acme-ai&quot;);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         it(&quot;returns catalog when key is available&quot;, async () =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           const result = await acmeProvider.catalog!.run({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             resolveProviderApiKey: () =&gt; ({ apiKey: &quot;test-key&quot; }),</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           } as any);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           expect(result?.provider?.models).toHaveLength(2);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         it(&quot;returns null catalog when no key&quot;, async () =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           const result = await acmeProvider.catalog!.run({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             resolveProviderApiKey: () =&gt; ({ apiKey: undefined }),</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           } as any);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           expect(result).toBeNull();</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## ClawHub에 게시하기</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Provider 플러그인은 다른 외부 코드 플러그인과 동일한 방식으로 </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">게시됩니다</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">clawhub package publish your-org/your-plugin --dry-run</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">clawhub package publish your-org/your-plugin</span></span></code></pre></div><p>여기서는 레거시 skill 전용 publish 별칭을 사용하지 마십시오; 플러그인 패키지는 <code>clawhub package publish</code>를 사용해야 합니다.</p><h2 id="파일-구조" tabindex="-1">파일 구조 <a class="header-anchor" href="#파일-구조" aria-label="Permalink to &quot;파일 구조&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;bundled-plugin-root&gt;/acme-ai/</span></span>
<span class="line"><span>├── package.json              # openclaw.providers 메타데이터</span></span>
<span class="line"><span>├── openclaw.plugin.json      # Provider auth 메타데이터가 있는 매니페스트</span></span>
<span class="line"><span>├── index.ts                  # definePluginEntry + registerProvider</span></span>
<span class="line"><span>└── src/</span></span>
<span class="line"><span>    ├── provider.test.ts      # 테스트</span></span>
<span class="line"><span>    └── usage.ts              # 사용량 엔드포인트 (선택 사항)</span></span></code></pre></div><h2 id="catalog-순서-레퍼런스" tabindex="-1">Catalog 순서 레퍼런스 <a class="header-anchor" href="#catalog-순서-레퍼런스" aria-label="Permalink to &quot;Catalog 순서 레퍼런스&quot;">​</a></h2><p><code>catalog.order</code>는 내장 provider 대비 catalog가 병합되는 시점을 제어합니다:</p><table tabindex="0"><thead><tr><th>순서</th><th>시점</th><th>사용 사례</th></tr></thead><tbody><tr><td><code>simple</code></td><td>첫 번째 패스</td><td>일반 API 키 provider</td></tr><tr><td><code>profile</code></td><td>simple 이후</td><td>Auth 프로필에 게이트된 provider</td></tr><tr><td><code>paired</code></td><td>profile 이후</td><td>여러 관련 엔트리 합성</td></tr><tr><td><code>late</code></td><td>마지막 패스</td><td>기존 provider 재정의 (충돌 시 우선)</td></tr></tbody></table><h2 id="다음-단계" tabindex="-1">다음 단계 <a class="header-anchor" href="#다음-단계" aria-label="Permalink to &quot;다음 단계&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/plugins/sdk-channel-plugins">채널 플러그인</a> — 플러그인이 채널도 제공하는 경우</li><li><a href="/openclaw-docs-ko/plugins/sdk-runtime">SDK 런타임</a> — <code>api.runtime</code> 헬퍼 (TTS, 검색, 서브에이전트)</li><li><a href="/openclaw-docs-ko/plugins/sdk-overview">SDK 개요</a> — 전체 서브패스 임포트 레퍼런스</li><li><a href="/openclaw-docs-ko/plugins/architecture-internals#provider-runtime-hooks">플러그인 내부 구조</a> — hook 세부 사항과 번들 예시</li></ul><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/plugins/sdk-setup">플러그인 SDK setup</a></li><li><a href="/openclaw-docs-ko/plugins/building-plugins">플러그인 구축하기</a></li><li><a href="/openclaw-docs-ko/plugins/sdk-channel-plugins">채널 플러그인 구축하기</a></li></ul>`,42)])])}const c=i(t,[["render",p]]);export{E as __pageData,c as default};
