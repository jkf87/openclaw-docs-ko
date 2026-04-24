import{_ as i,o as a,c as n,ag as h}from"./chunks/framework.CTpQozEL.js";const o=JSON.parse('{"title":"Moonshot AI","description":"Moonshot K2 대 Kimi Coding 구성 (별도 프로바이더 + 키)","frontmatter":{"title":"Moonshot AI","description":"Moonshot K2 대 Kimi Coding 구성 (별도 프로바이더 + 키)"},"headers":[],"relativePath":"providers/moonshot.md","filePath":"providers/moonshot.md","lastUpdated":null}'),k={name:"providers/moonshot.md"};function l(p,s,t,e,F,d){return a(),n("div",null,[...s[0]||(s[0]=[h(`<h1 id="moonshot-ai-kimi" tabindex="-1">Moonshot AI (Kimi) <a class="header-anchor" href="#moonshot-ai-kimi" aria-label="Permalink to &quot;Moonshot AI (Kimi)&quot;">​</a></h1><p>Moonshot은 OpenAI 호환 엔드포인트가 포함된 Kimi API를 제공합니다. 프로바이더를 구성하고 기본 모델을 <code>moonshot/kimi-k2.6</code>으로 설정하거나, <code>kimi/kimi-code</code>와 함께 Kimi Coding을 사용하십시오.</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>Moonshot과 Kimi Coding은 <strong>별도 프로바이더</strong>입니다. 키는 서로 호환되지 않고, 엔드포인트가 다르며, model 참조도 다릅니다 (<code>moonshot/...</code> 대 <code>kimi/...</code>).</p></div><h2 id="내장-model-카탈로그" tabindex="-1">내장 model 카탈로그 <a class="header-anchor" href="#내장-model-카탈로그" aria-label="Permalink to &quot;내장 model 카탈로그&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Model 참조</th><th>이름</th><th>Reasoning</th><th>입력</th><th>Context</th><th>최대 출력</th></tr></thead><tbody><tr><td><code>moonshot/kimi-k2.6</code></td><td>Kimi K2.6</td><td>No</td><td>text, image</td><td>262,144</td><td>262,144</td></tr><tr><td><code>moonshot/kimi-k2.5</code></td><td>Kimi K2.5</td><td>No</td><td>text, image</td><td>262,144</td><td>262,144</td></tr><tr><td><code>moonshot/kimi-k2-thinking</code></td><td>Kimi K2 Thinking</td><td>Yes</td><td>text</td><td>262,144</td><td>262,144</td></tr><tr><td><code>moonshot/kimi-k2-thinking-turbo</code></td><td>Kimi K2 Thinking Turbo</td><td>Yes</td><td>text</td><td>262,144</td><td>262,144</td></tr><tr><td><code>moonshot/kimi-k2-turbo</code></td><td>Kimi K2 Turbo</td><td>No</td><td>text</td><td>256,000</td><td>16,384</td></tr></tbody></table><p>현재 Moonshot 호스팅 K2 모델에 대한 번들 비용 추정치는 Moonshot이 공개한 pay-as-you-go 요율을 사용합니다: Kimi K2.6은 $0.16/MTok 캐시 적중, $0.95/MTok 입력, $4.00/MTok 출력이며; Kimi K2.5는 $0.10/MTok 캐시 적중, $0.60/MTok 입력, $3.00/MTok 출력입니다. 다른 레거시 카탈로그 항목은 구성에서 재정의하지 않는 한 비용 0 자리표시자를 유지합니다.</p><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><p>프로바이더를 선택하고 설정 단계를 따르십시오.</p><p><strong>Moonshot API</strong></p><p><strong>적합한 경우:</strong> Moonshot Open Platform을 통한 Kimi K2 모델.</p><pre><code>1. **엔드포인트 리전 선택**
</code></pre><p>| 인증 선택 | 엔드포인트 | 리전 | | ---------------------- | ------------------------------ | ------------- | | <code>moonshot-api-key</code> | <code>https://api.moonshot.ai/v1</code> | International | | <code>moonshot-api-key-cn</code> | <code>https://api.moonshot.cn/v1</code> | China |</p><pre><code>  2. **온보딩 실행**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> moonshot-api-key</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> China 엔드포인트의 경우:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> moonshot-api-key-cn</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">기본 모델 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">              model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;moonshot/kimi-k2.6&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   4.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 사용 가능 여부 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> moonshot</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   5.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">라이브 smoke test 실행</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">일반</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 세션을 건드리지 않고 모델 액세스 및 비용 추적을 검증하고 싶을 때</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        격리된</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> state 디렉토리를 사용하십시오:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        OPENCLAW_CONFIG_PATH</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/tmp/openclaw-kimi/openclaw.json</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        OPENCLAW_STATE_DIR=/tmp/openclaw-kimi</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> agent</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --local</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          --session-id</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> live-kimi-cost</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          --message</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Reply exactly: KIMI_LIVE_OK&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          --thinking</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> off</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          --json</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        JSON</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 응답은 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">provider:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;moonshot&quot;\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">및</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi-k2.6&quot;\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 보고해야 합니다. Assistant 전사 항목은 Moonshot이</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        usage</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 메타데이터를 반환할 때 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">usage.cost</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">아래에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 정규화된 token 사용량과</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        추정</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 비용을 저장합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 구성 예시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   env:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MOONSHOT_API_KEY:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;sk-...&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;moonshot/kimi-k2.6&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         //</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> moonshot-kimi-k2-aliases:start</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         &quot;moonshot/kimi-k2.6&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> alias:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2.6&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         &quot;moonshot/kimi-k2.5&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> alias:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2.5&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         &quot;moonshot/kimi-k2-thinking&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> alias:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2 Thinking&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         &quot;moonshot/kimi-k2-thinking-turbo&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> alias:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2 Thinking Turbo&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         &quot;moonshot/kimi-k2-turbo&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> alias:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2 Turbo&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         //</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> moonshot-kimi-k2-aliases:end</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     mode:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;merge&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     providers:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       moonshot:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         baseUrl:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;https://api.moonshot.ai/v1&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         apiKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">MOONSHOT_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         api:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openai-completions&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         models:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">           //</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> moonshot-kimi-k2-models:start</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi-k2.6&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2.6&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;image&quot;],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0.95,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 4,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0.16,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi-k2.5&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2.5&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;image&quot;],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0.6,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 3,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0.1,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi-k2-thinking&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2 Thinking&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi-k2-thinking-turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2 Thinking Turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 262144,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi-k2-turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi K2 Turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 256000,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">             maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 16384,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">           //</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> moonshot-kimi-k2-models:end</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">**Kimi</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Coding</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">적합한 경우:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Kimi Coding 엔드포인트를 통한 코드 중심 작업.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Kimi</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Coding은 Moonshot (\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">moonshot/...</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`)과 다른 API 키 및 프로바이더 접두사 (\`kimi/...\`)를 사용합니다. 레거시 model 참조 \`kimi/k2p5\`는 호환성 ID로 계속 허용됩니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">온보딩 실행</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kimi-code-api-key</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">기본 모델 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">              model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi/kimi-code&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 사용 가능 여부 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kimi</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 구성 예시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   env:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> KIMI_API_KEY:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;sk-...&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi/kimi-code&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         &quot;kimi/kimi-code&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> alias:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Kimi&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Kimi web search</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OpenClaw는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 또한 Moonshot web search로 지원되는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">web_search</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">프로바이더로</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Kimi</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">를 제공합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">대화형 web search 설정 실행</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> configure</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --section</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> web</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    web-search</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 섹션에서 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Kimi</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">를 선택하여</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plugins.entries.moonshot.config.webSearch.*</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 저장하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">web search 리전 및 모델 구성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">대화형</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정은 다음을 묻습니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 설정</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 옵션</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> -------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> --------------------------------------------------------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> API</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 리전            </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://api.moonshot.ai/v1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">international</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://api.moonshot.cn/v1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">China</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Web</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> search 모델     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 기본값</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kimi-k2.6</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`                                                   </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">구성은</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plugins.entries.moonshot.config.webSearch</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">아래에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 있습니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plugins:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> entries:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   moonshot:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     config:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       webSearch:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         apiKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;sk-...&quot;,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> //</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> KIMI_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MOONSHOT_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         baseUrl:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;https://api.moonshot.ai/v1&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi-k2.6&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tools:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> web:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   search:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     provider:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kimi&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="고급-구성" tabindex="-1">고급 구성 <a class="header-anchor" href="#고급-구성" aria-label="Permalink to &quot;고급 구성&quot;">​</a></h2><details class="details custom-block"><summary>네이티브 thinking 모드</summary><p>Moonshot Kimi는 이진 네이티브 thinking을 지원합니다:</p><pre><code>- \`thinking: { type: &quot;enabled&quot; }\`
- \`thinking: { type: &quot;disabled&quot; }\`

\`agents.defaults.models.&lt;provider/model&gt;.params\`를 통해 모델별로 구성하십시오:

\`\`\`json5
{
  agents: {
    defaults: {
      models: {
        &quot;moonshot/kimi-k2.6&quot;: {
          params: {
            thinking: { type: &quot;disabled&quot; },
          },
        },
      },
    },
  },
}
\`\`\`

OpenClaw는 또한 Moonshot에 대해 runtime \`/think\` 수준을 매핑합니다:

| \`/think\` 수준        | Moonshot 동작              |
| -------------------- | -------------------------- |
| \`/think off\`         | \`thinking.type=disabled\`   |
| off가 아닌 모든 수준 | \`thinking.type=enabled\`    |

::: warning
</code></pre><p>Moonshot thinking이 활성화되면 <code>tool_choice</code>는 <code>auto</code> 또는 <code>none</code>이어야 합니다. OpenClaw는 호환성을 위해 호환되지 않는 <code>tool_choice</code> 값을 <code>auto</code>로 정규화합니다.</p></details><pre><code>Kimi K2.6은 또한 \`reasoning_content\`의 다중 턴 유지를 제어하는 선택적
\`thinking.keep\` 필드를 허용합니다. 턴 전체에서 전체 reasoning을 유지하려면
\`&quot;all&quot;\`로 설정하고, 서버 기본 전략을 사용하려면 생략하거나 \`null\`로
두십시오. OpenClaw는 \`moonshot/kimi-k2.6\`에 대해서만 \`thinking.keep\`을
전달하며, 다른 모델에서는 이를 제거합니다.

\`\`\`json5
{
  agents: {
    defaults: {
      models: {
        &quot;moonshot/kimi-k2.6&quot;: {
          params: {
            thinking: { type: &quot;enabled&quot;, keep: &quot;all&quot; },
          },
        },
      },
    },
  },
}
\`\`\`
</code></pre><p>:::</p><details class="details custom-block"><summary>Tool call ID 정규화</summary><p>Moonshot Kimi는 <code>functions.&lt;name&gt;:&lt;index&gt;</code> 형태의 tool_call ID를 제공합니다. OpenClaw는 다중 턴 tool call이 계속 작동할 수 있도록 이를 변경하지 않고 보존합니다.</p><pre><code>커스텀 OpenAI 호환 프로바이더에서 엄격한 정규화를 강제하려면 \`sanitizeToolCallIds: true\`를 설정하십시오:

\`\`\`json5
{
  models: {
    providers: {
      &quot;my-kimi-proxy&quot;: {
        api: &quot;openai-completions&quot;,
        sanitizeToolCallIds: true,
      },
    },
  },
}
\`\`\`
</code></pre></details><details class="details custom-block"><summary>Streaming usage 호환성</summary><p>네이티브 Moonshot 엔드포인트 (<code>https://api.moonshot.ai/v1</code> 및 <code>https://api.moonshot.cn/v1</code>)는 공유 <code>openai-completions</code> transport에서 streaming usage 호환성을 광고합니다. OpenClaw는 이를 엔드포인트 capability에 맞춰 처리하므로, 동일한 네이티브 Moonshot 호스트를 대상으로 하는 호환 커스텀 프로바이더 ID는 동일한 streaming-usage 동작을 상속합니다.</p><pre><code>번들 K2.6 요금제에서는, 입력, 출력, 캐시 읽기 token을 포함하는 스트리밍된
usage도 \`/status\`, \`/usage full\`, \`/usage cost\`, 그리고 전사 기반 세션
회계를 위해 로컬 추정 USD 비용으로 변환됩니다.
</code></pre></details><details class="details custom-block"><summary>엔드포인트 및 model 참조 참고</summary><p>| 프로바이더 | Model 참조 접두사 | 엔드포인트 | 인증 환경 변수 | | ------------ | ----------------- | ----------------------------- | ------------------- | | Moonshot | <code>moonshot/</code> | <code>https://api.moonshot.ai/v1</code> | <code>MOONSHOT_API_KEY</code> | | Moonshot CN | <code>moonshot/</code> | <code>https://api.moonshot.cn/v1</code> | <code>MOONSHOT_API_KEY</code> | | Kimi Coding | <code>kimi/</code> | Kimi Coding 엔드포인트 | <code>KIMI_API_KEY</code> | | Web search | N/A | Moonshot API 리전과 동일 | <code>KIMI_API_KEY</code> 또는 <code>MOONSHOT_API_KEY</code> |</p><pre><code>- Kimi web search는 \`KIMI_API_KEY\` 또는 \`MOONSHOT_API_KEY\`를 사용하며, model \`kimi-k2.6\`과 함께 \`https://api.moonshot.ai/v1\`로 기본 설정됩니다.
- 필요한 경우 \`models.providers\`에서 가격과 context 메타데이터를 재정의하십시오.
- Moonshot이 모델에 대해 다른 context 제한을 게시하면 그에 맞게 \`contextWindow\`를 조정하십시오.
</code></pre></details><h2 id="관련-항목" tabindex="-1">관련 항목 <a class="header-anchor" href="#관련-항목" aria-label="Permalink to &quot;관련 항목&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더, model 참조, failover 동작 선택.</p></blockquote><blockquote><p><strong>Web search</strong> <a href="/openclaw-docs-ko/tools/web">→</a> Kimi를 포함한 web search 프로바이더 구성.</p></blockquote><blockquote><p><strong>구성 레퍼런스</strong> <a href="/openclaw-docs-ko/gateway/configuration-reference">→</a> 프로바이더, 모델, 플러그인의 전체 구성 스키마.</p></blockquote><blockquote><p><strong>Moonshot Open Platform</strong> <a href="https://platform.moonshot.ai" target="_blank" rel="noreferrer">→</a> Moonshot API 키 관리 및 문서.</p></blockquote>`,26)])])}const g=i(k,[["render",l]]);export{o as __pageData,g as default};
