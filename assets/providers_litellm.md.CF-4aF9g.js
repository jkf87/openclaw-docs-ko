import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const d=JSON.parse('{"title":"LiteLLM","description":"LiteLLM Proxy를 통해 OpenClaw를 실행하여 통합 모델 접근 및 비용 추적 구현","frontmatter":{"title":"LiteLLM","description":"LiteLLM Proxy를 통해 OpenClaw를 실행하여 통합 모델 접근 및 비용 추적 구현"},"headers":[],"relativePath":"providers/litellm.md","filePath":"providers/litellm.md","lastUpdated":null}'),t={name:"providers/litellm.md"};function p(e,s,h,k,r,o){return a(),n("div",null,[...s[0]||(s[0]=[l(`<p><a href="https://litellm.ai" target="_blank" rel="noreferrer">LiteLLM</a>은 오픈소스 LLM 게이트웨이로, 100개 이상의 모델 프로바이더에 대한 통합 API를 제공합니다. OpenClaw를 LiteLLM 경유로 라우팅하면 중앙 집중식 비용 추적, 로깅을 얻고, OpenClaw 설정을 바꾸지 않고도 백엔드를 자유롭게 전환할 수 있습니다.</p><div class="tip custom-block"><p class="custom-block-title">TIP</p><p><strong>OpenClaw에 LiteLLM을 함께 사용하는 이유는?</strong></p><ul><li><strong>비용 추적</strong> — 모든 모델에 걸쳐 OpenClaw가 정확히 얼마를 쓰는지 확인</li><li><strong>모델 라우팅</strong> — 설정 변경 없이 Claude, GPT-4, Gemini, Bedrock 간 전환</li><li><strong>가상 키(Virtual keys)</strong> — OpenClaw용으로 사용량 한도가 설정된 키 발급</li><li><strong>로깅</strong> — 디버깅을 위한 전체 요청/응답 로그</li><li><strong>폴백(Fallbacks)</strong> — 기본 프로바이더가 다운되었을 때 자동 페일오버</li></ul></div><h2 id="빠른-시작" tabindex="-1">빠른 시작 <a class="header-anchor" href="#빠른-시작" aria-label="Permalink to &quot;빠른 시작&quot;">​</a></h2><p><strong>온보딩 (권장)</strong></p><p><strong>적합한 사용처:</strong> 동작하는 LiteLLM 설정에 가장 빠르게 도달하는 경로.</p><pre><code>1. **온보딩 실행**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> litellm-api-key</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">**수동</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">적합한 사용처:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설치 및 설정에 대한 완전한 제어가 필요할 때.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">LiteLLM Proxy 시작</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        pip</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;litellm[proxy]&#39;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        litellm</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --model</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> claude-opus-4-6</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">OpenClaw가 LiteLLM을 바라보도록 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LITELLM_API_KEY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;your-litellm-key&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        이게</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 전부입니다. 이제 OpenClaw가 LiteLLM 경유로 라우팅됩니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 설정</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### 환경 변수</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LITELLM_API_KEY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sk-litellm-key&quot;</span></span></code></pre></div><h3 id="설정-파일" tabindex="-1">설정 파일 <a class="header-anchor" href="#설정-파일" aria-label="Permalink to &quot;설정 파일&quot;">​</a></h3><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    providers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      litellm</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        baseUrl</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;http://localhost:4000&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        apiKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;\${LITELLM_API_KEY}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        api</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;openai-completions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;claude-opus-4-6&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Claude Opus 4.6&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            reasoning</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;image&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            contextWindow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            maxTokens</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">64000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;gpt-4o&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;GPT-4o&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            reasoning</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;image&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            contextWindow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">128000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            maxTokens</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8192</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;litellm/claude-opus-4-6&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="고급-설정" tabindex="-1">고급 설정 <a class="header-anchor" href="#고급-설정" aria-label="Permalink to &quot;고급 설정&quot;">​</a></h2><details class="details custom-block"><summary>가상 키 (Virtual keys)</summary><p>사용량 한도가 설정된 OpenClaw 전용 키를 생성합니다.</p><pre><code>\`\`\`bash
curl -X POST &quot;http://localhost:4000/key/generate&quot; \\
  -H &quot;Authorization: Bearer $LITELLM_MASTER_KEY&quot; \\
  -H &quot;Content-Type: application/json&quot; \\
  -d &#39;{
    &quot;key_alias&quot;: &quot;openclaw&quot;,
    &quot;max_budget&quot;: 50.00,
    &quot;budget_duration&quot;: &quot;monthly&quot;
  }&#39;
\`\`\`

생성된 키를 \`LITELLM_API_KEY\`로 사용하세요.
</code></pre></details><details class="details custom-block"><summary>모델 라우팅</summary><p>LiteLLM은 모델 요청을 서로 다른 백엔드로 라우팅할 수 있습니다. LiteLLM <code>config.yaml</code>에 다음과 같이 설정합니다.</p><pre><code>\`\`\`yaml
model_list:
  - model_name: claude-opus-4-6
    litellm_params:
      model: claude-opus-4-6
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY
\`\`\`

OpenClaw는 계속 \`claude-opus-4-6\`을 요청하고, 라우팅은 LiteLLM이 처리합니다.
</code></pre></details><details class="details custom-block"><summary>사용량 확인</summary><p>LiteLLM 대시보드 또는 API에서 확인합니다.</p><pre><code>\`\`\`bash
# 키 정보
curl &quot;http://localhost:4000/key/info&quot; \\
  -H &quot;Authorization: Bearer sk-litellm-key&quot;

# 지출 로그
curl &quot;http://localhost:4000/spend/logs&quot; \\
  -H &quot;Authorization: Bearer $LITELLM_MASTER_KEY&quot;
\`\`\`
</code></pre></details><details class="details custom-block"><summary>프록시 동작에 대한 참고</summary><ul><li>LiteLLM은 기본적으로 <code>http://localhost:4000</code>에서 실행됩니다 <ul><li>OpenClaw는 LiteLLM의 프록시 스타일 OpenAI 호환 <code>/v1</code> 엔드포인트를 통해 연결됩니다</li><li>네이티브 OpenAI 전용 요청 포맷팅(request shaping)은 LiteLLM 경유에서는 적용되지 않습니다. <code>service_tier</code>, Responses <code>store</code>, 프롬프트 캐시 힌트, OpenAI reasoning-compat 페이로드 포맷팅이 모두 적용되지 않습니다</li><li>숨겨진 OpenClaw 귀속(attribution) 헤더(<code>originator</code>, <code>version</code>, <code>User-Agent</code>)는 커스텀 LiteLLM base URL에서는 주입되지 않습니다</li></ul></li></ul></details><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>일반적인 프로바이더 설정과 페일오버 동작은 <a href="/openclaw-docs-ko/concepts/model-providers">Model Providers</a>를 참고하세요.</p></div><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>LiteLLM 문서</strong> <a href="https://docs.litellm.ai" target="_blank" rel="noreferrer">→</a> 공식 LiteLLM 문서 및 API 레퍼런스.</p></blockquote><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 모든 프로바이더, 모델 ref, 페일오버 동작 개요.</p></blockquote><blockquote><p><strong>설정</strong> <a href="/openclaw-docs-ko/gateway/configuration">→</a> 전체 설정 레퍼런스.</p></blockquote><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/models">→</a> 모델 선택과 설정 방법.</p></blockquote>`,20)])])}const F=i(t,[["render",p]]);export{d as __pageData,F as default};
