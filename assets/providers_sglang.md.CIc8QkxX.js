import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const g=JSON.parse('{"title":"SGLang","description":"SGLang(OpenAI 호환 자체 호스팅 서버)으로 OpenClaw 실행하기","frontmatter":{"title":"SGLang","description":"SGLang(OpenAI 호환 자체 호스팅 서버)으로 OpenClaw 실행하기"},"headers":[],"relativePath":"providers/sglang.md","filePath":"providers/sglang.md","lastUpdated":null}'),p={name:"providers/sglang.md"};function h(t,s,k,e,F,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<p>SGLang은 <strong>OpenAI 호환</strong> HTTP API를 통해 오픈 소스 모델을 서빙할 수 있습니다. OpenClaw는 <code>openai-completions</code> API를 사용해서 SGLang에 연결할 수 있습니다.</p><p>또한 OpenClaw는 <code>SGLANG_API_KEY</code>로 옵트인하고(서버가 인증을 강제하지 않는 경우 어떤 값이든 동작) <code>models.providers.sglang</code> 항목을 명시적으로 정의하지 않는 경우, SGLang에서 사용 가능한 모델을 <strong>자동 검색</strong>할 수 있습니다.</p><p>OpenClaw는 <code>sglang</code>을 스트리밍 사용량(usage) 집계를 지원하는 로컬 OpenAI 호환 프로바이더로 취급하므로, <code>stream_options.include_usage</code> 응답으로부터 상태/컨텍스트 토큰 수를 업데이트할 수 있습니다.</p><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><ol><li><p><strong>SGLang 시작</strong></p><p>OpenAI 호환 서버로 SGLang을 실행하세요. base URL은 <code>/v1</code> 엔드포인트(예: <code>/v1/models</code>, <code>/v1/chat/completions</code>)를 노출해야 합니다. SGLang은 일반적으로 다음 주소에서 실행됩니다.</p><pre><code>- \`http://127.0.0.1:30000/v1\`
</code></pre></li><li><p><strong>API 키 설정</strong></p></li></ol><p>서버에 인증이 설정되지 않았다면 어떤 값이든 동작합니다.</p><pre><code>   \`\`\`bash
   export SGLANG_API_KEY=&quot;sglang-local&quot;
   \`\`\`
</code></pre><ol start="3"><li><strong>온보딩 실행 또는 모델 직접 설정</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델을 수동으로 설정하세요.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;sglang/your-model-id&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 모델 자동 검색 (암시적 프로바이더)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SGLANG_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정되어 있거나(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 인증 프로파일이 존재하고)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models.providers.sglang</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">정의하지 않은</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 경우, OpenClaw는 다음을</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">쿼리합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">GET</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://127.0.0.1:30000/v1/models\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">그리고</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 반환된 ID를 모델 항목으로 변환합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models.providers.sglang</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 명시적으로 설정하면 자동 검색은 건너뛰어지며,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">모델을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 수동으로 정의해야 합니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 명시적 설정 (수동 모델)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">다음의</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 경우 명시적 설정을 사용하세요.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> SGLang이 다른 호스트/포트에서 실행될 때.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contextWindow</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">maxTokens</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">값을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 고정하고 싶을 때.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 서버가 실제 API 키를 요구하거나 헤더를 제어하고 싶을 때.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> providers:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   sglang:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     baseUrl:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;http://127.0.0.1:30000/v1&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     apiKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SGLANG_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     api:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openai-completions&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     models:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;your-model-id&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Local SGLang Model&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 128000,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 8192,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="고급-설정" tabindex="-1">고급 설정 <a class="header-anchor" href="#고급-설정" aria-label="Permalink to &quot;고급 설정&quot;">​</a></h2><details class="details custom-block"><summary>프록시 스타일 동작</summary><p>SGLang은 네이티브 OpenAI 엔드포인트가 아닌 프록시 스타일 OpenAI 호환 <code>/v1</code> 백엔드로 취급됩니다.</p><pre><code>| 동작 | SGLang |
|------|--------|
| OpenAI 전용 요청 정형화 | 적용되지 않음 |
| \`service_tier\`, Responses \`store\`, 프롬프트 캐시 힌트 | 전송되지 않음 |
| Reasoning-compat 페이로드 정형화 | 적용되지 않음 |
| 숨겨진 귀속 헤더(\`originator\`, \`version\`, \`User-Agent\`) | 커스텀 SGLang base URL에서는 주입되지 않음 |
</code></pre></details><details class="details custom-block"><summary>트러블슈팅</summary><p><strong>서버에 접근할 수 없음</strong></p><pre><code>서버가 실행 중이고 응답하는지 확인하세요.

\`\`\`bash
curl http://127.0.0.1:30000/v1/models
\`\`\`

**인증 오류**

요청이 인증 오류로 실패하면, 서버 설정과 일치하는 실제 \`SGLANG_API_KEY\`를
설정하거나 \`models.providers.sglang\`에서 프로바이더를 명시적으로
설정하세요.

::: tip
</code></pre><p>SGLang을 인증 없이 실행하는 경우, 비어 있지 않은 어떤 값이든 <code>SGLANG_API_KEY</code>에 설정하면 모델 자동 검색에 옵트인하기 충분합니다.</p></details><p>:::</p><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더 선택, 모델 레퍼런스, 페일오버 동작.</p></blockquote><blockquote><p><strong>설정 레퍼런스</strong> <a href="/openclaw-docs-ko/gateway/configuration-reference">→</a> 프로바이더 항목을 포함한 전체 설정 스키마.</p></blockquote>`,16)])])}const o=i(p,[["render",h]]);export{g as __pageData,o as default};
