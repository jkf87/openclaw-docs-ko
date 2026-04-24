import{_ as i,o as a,c as n,ag as e}from"./chunks/framework.CTpQozEL.js";const c=JSON.parse('{"title":"Inferrs","description":"OpenClaw를 inferrs(OpenAI 호환 로컬 서버)를 통해 실행하기","frontmatter":{"title":"Inferrs","description":"OpenClaw를 inferrs(OpenAI 호환 로컬 서버)를 통해 실행하기"},"headers":[],"relativePath":"providers/inferrs.md","filePath":"providers/inferrs.md","lastUpdated":null}'),t={name:"providers/inferrs.md"};function l(p,s,h,k,r,o){return a(),n("div",null,[...s[0]||(s[0]=[e(`<p><a href="https://github.com/ericcurtin/inferrs" target="_blank" rel="noreferrer">inferrs</a>는 OpenAI 호환 <code>/v1</code> API 뒷단에서 로컬 모델을 서빙할 수 있습니다. OpenClaw는 제네릭 <code>openai-completions</code> 경로를 통해 <code>inferrs</code>와 연동됩니다.</p><p><code>inferrs</code>는 현재 전용 OpenClaw 프로바이더 플러그인이 아니라 커스텀 자체 호스팅 OpenAI 호환 백엔드로 취급하는 것이 가장 좋습니다.</p><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><ol><li><p><strong>모델과 함께 inferrs 시작</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    inferrs</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> serve</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> google/gemma-4-E2B-it</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      --host</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 127.0.0.1</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      --port</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 8080</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      --device</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> metal</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span></code></pre></div></li><li><p><strong>서버 연결 가능 여부 확인</strong></p></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://127.0.0.1:8080/health</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://127.0.0.1:8080/v1/models</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">OpenClaw 프로바이더 항목 추가</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">명시적인</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 프로바이더 항목을 추가하고 기본 모델을 이 프로바이더로 지정하세요. 아래 전체 설정 예시를 참고하세요.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 전체 설정 예시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 예시는 로컬 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">inferrs</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">서버에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Gemma 4를 사용합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;inferrs/google/gemma-4-E2B-it&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     &quot;inferrs/google/gemma-4-E2B-it&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">       alias</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Gemma 4 (inferrs)&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mode:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;merge&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> providers:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   inferrs:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     baseUrl:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;http://127.0.0.1:8080/v1&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     apiKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;inferrs-local&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     api:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openai-completions&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     models:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;google/gemma-4-E2B-it&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Gemma 4 E2B (inferrs)&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 131072,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 4096,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         compat:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">           requiresStringContent:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="고급-설정" tabindex="-1">고급 설정 <a class="header-anchor" href="#고급-설정" aria-label="Permalink to &quot;고급 설정&quot;">​</a></h2><details class="details custom-block"><summary>requiresStringContent가 중요한 이유</summary><p>일부 <code>inferrs</code> Chat Completions 라우트는 구조화된 content-part 배열이 아닌 문자열 <code>messages[].content</code>만 허용합니다.</p><pre><code>::: warning
</code></pre><p>OpenClaw 실행이 다음과 같은 오류로 실패할 경우:</p><pre><code>\`\`\`text
messages[1].content: invalid type: sequence, expected a string
\`\`\`

모델 항목에 \`compat.requiresStringContent: true\`를 설정하세요.
</code></pre></details><pre><code>\`\`\`json5
compat: {
  requiresStringContent: true
}
\`\`\`

OpenClaw는 요청을 보내기 전에 순수 텍스트 content part를 일반 문자열로
평탄화합니다.
</code></pre><p>:::</p><details class="details custom-block"><summary>Gemma 및 도구 스키마 주의 사항</summary><p>일부 현재 <code>inferrs</code> + Gemma 조합은 작은 직접 <code>/v1/chat/completions</code> 요청은 받지만 전체 OpenClaw 에이전트 런타임 턴에서는 여전히 실패합니다.</p><pre><code>이런 경우 먼저 다음을 시도해 보세요.

\`\`\`json5
compat: {
  requiresStringContent: true,
  supportsTools: false
}
\`\`\`

이는 해당 모델에 대한 OpenClaw의 tool 스키마 표면을 비활성화하여 더 엄격한
로컬 백엔드에서 프롬프트 부담을 줄일 수 있습니다.

작은 직접 요청은 여전히 동작하지만 일반 OpenClaw 에이전트 턴에서 계속
\`inferrs\` 내부에서 크래시가 나는 경우, 남은 문제는 대체로 OpenClaw의 전송
계층이 아니라 업스트림 모델/서버 동작 때문입니다.
</code></pre></details><details class="details custom-block"><summary>수동 스모크 테스트</summary><p>설정이 끝나면 두 계층을 모두 테스트하세요.</p><pre><code>\`\`\`bash
curl http://127.0.0.1:8080/v1/chat/completions \\
  -H &#39;content-type: application/json&#39; \\
  -d &#39;{&quot;model&quot;:&quot;google/gemma-4-E2B-it&quot;,&quot;messages&quot;:[{&quot;role&quot;:&quot;user&quot;,&quot;content&quot;:&quot;What is 2 + 2?&quot;}],&quot;stream&quot;:false}&#39;
\`\`\`

\`\`\`bash
openclaw infer model run \\
  --model inferrs/google/gemma-4-E2B-it \\
  --prompt &quot;What is 2 + 2? Reply with one short sentence.&quot; \\
  --json
\`\`\`

첫 번째 명령은 성공하지만 두 번째가 실패하는 경우, 아래 트러블슈팅 섹션을 확인하세요.
</code></pre></details><details class="details custom-block"><summary>프록시 스타일 동작</summary><p><code>inferrs</code>는 네이티브 OpenAI 엔드포인트가 아닌 프록시 스타일 OpenAI 호환 <code>/v1</code> 백엔드로 취급됩니다.</p><pre><code>- 네이티브 OpenAI 전용 요청 정형화는 여기에 적용되지 않습니다
- \`service_tier\`, Responses \`store\`, 프롬프트 캐시 힌트, OpenAI
  reasoning-compat 페이로드 정형화는 사용되지 않습니다
- 숨겨진 OpenClaw 귀속 헤더(\`originator\`, \`version\`, \`User-Agent\`)는
  커스텀 \`inferrs\` base URL에서는 주입되지 않습니다
</code></pre></details><h2 id="트러블슈팅" tabindex="-1">트러블슈팅 <a class="header-anchor" href="#트러블슈팅" aria-label="Permalink to &quot;트러블슈팅&quot;">​</a></h2><details class="details custom-block"><summary>curl /v1/models가 실패함</summary><p><code>inferrs</code>가 실행되지 않았거나, 접근이 불가능하거나, 예상한 호스트/포트에 바인딩되지 않은 상태입니다. 서버가 시작되어 설정한 주소에서 수신 중인지 확인하세요.</p></details><details class="details custom-block"><summary>messages[].content expected a string</summary><p>모델 항목에 <code>compat.requiresStringContent: true</code>를 설정하세요. 위의 <code>requiresStringContent</code> 섹션에서 자세한 내용을 확인하세요.</p></details><details class="details custom-block"><summary>직접 /v1/chat/completions 호출은 성공하지만 openclaw infer model run이 실패함</summary><p><code>compat.supportsTools: false</code>로 설정하여 tool 스키마 표면을 비활성화해 보세요. 위의 Gemma 도구 스키마 주의 사항을 참고하세요.</p></details><details class="details custom-block"><summary>더 큰 에이전트 턴에서 inferrs가 여전히 크래시됨</summary><p>OpenClaw가 더 이상 스키마 오류를 내지 않지만 <code>inferrs</code>가 여전히 더 큰 에이전트 턴에서 크래시되는 경우, 이를 업스트림 <code>inferrs</code> 또는 모델의 한계로 간주하세요. 프롬프트 부담을 줄이거나 다른 로컬 백엔드 또는 모델로 전환하세요.</p></details><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>일반적인 도움말은 <a href="/openclaw-docs-ko/help/troubleshooting">트러블슈팅</a>과 <a href="/openclaw-docs-ko/help/faq">FAQ</a>를 참고하세요.</p></div><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>로컬 모델</strong> <a href="/openclaw-docs-ko/gateway/local-models">→</a> 로컬 모델 서버에 대해 OpenClaw 실행하기.</p></blockquote><blockquote><p><strong>게이트웨이 트러블슈팅</strong> <a href="/openclaw-docs-ko/gateway/troubleshooting#local-openai-compatible-backend-passes-direct-probes-but-agent-runs-fail">→</a> 직접 프로브는 통과하지만 에이전트 실행은 실패하는 로컬 OpenAI 호환 백엔드 디버깅.</p></blockquote><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 모든 프로바이더, 모델 레퍼런스, 페일오버 동작 개요.</p></blockquote>`,22)])])}const F=i(t,[["render",l]]);export{c as __pageData,F as default};
