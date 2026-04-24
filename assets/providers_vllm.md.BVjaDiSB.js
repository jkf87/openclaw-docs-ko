import{_ as n,o as a,c as e,ag as p}from"./chunks/framework.CTpQozEL.js";const k=JSON.parse('{"title":"vLLM","description":"vLLM(OpenAI 호환 로컬 서버)으로 OpenClaw 실행","frontmatter":{"title":"vLLM","description":"vLLM(OpenAI 호환 로컬 서버)으로 OpenClaw 실행"},"headers":[],"relativePath":"providers/vllm.md","filePath":"providers/vllm.md","lastUpdated":null}'),l={name:"providers/vllm.md"};function t(o,s,i,d,c,r){return a(),e("div",null,[...s[0]||(s[0]=[p(`<p>vLLM은 오픈소스 모델(및 일부 커스텀 모델)을 <strong>OpenAI 호환</strong> HTTP API를 통해 서빙할 수 있습니다. OpenClaw는 <code>openai-completions</code> API를 사용하여 vLLM에 연결합니다.</p><p><code>VLLM_API_KEY</code>를 설정하여 옵트인하고(서버에서 인증을 강제하지 않는 경우 어떤 값이든 동작합니다) 명시적인 <code>models.providers.vllm</code> 항목을 정의하지 않으면, OpenClaw는 vLLM에서 사용 가능한 모델을 <strong>자동 탐색(auto-discover)</strong> 할 수도 있습니다.</p><p>OpenClaw는 <code>vllm</code>을 스트리밍 사용량 집계(streamed usage accounting)를 지원하는 로컬 OpenAI 호환 프로바이더로 취급하므로, 상태(status)/컨텍스트 토큰 카운트가 <code>stream_options.include_usage</code> 응답으로부터 업데이트될 수 있습니다.</p><table tabindex="0"><thead><tr><th>속성</th><th>값</th></tr></thead><tbody><tr><td>프로바이더 ID</td><td><code>vllm</code></td></tr><tr><td>API</td><td><code>openai-completions</code> (OpenAI 호환)</td></tr><tr><td>인증</td><td><code>VLLM_API_KEY</code> 환경 변수</td></tr><tr><td>기본 base URL</td><td><code>http://127.0.0.1:8000/v1</code></td></tr></tbody></table><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><ol><li><p><strong>OpenAI 호환 서버로 vLLM 시작</strong></p><p>base URL은 <code>/v1</code> 엔드포인트(예: <code>/v1/models</code>, <code>/v1/chat/completions</code>)를 노출해야 합니다. vLLM은 일반적으로 다음 주소에서 실행됩니다.</p><pre><code>\`\`\`
http://127.0.0.1:8000/v1
\`\`\`
</code></pre></li><li><p><strong>API 키 환경 변수 설정</strong></p></li></ol><p>서버에서 인증을 강제하지 않는 경우 어떤 값이든 동작합니다.</p><pre><code>   \`\`\`bash
   export VLLM_API_KEY=&quot;vllm-local&quot;
   \`\`\`
</code></pre><ol start="3"><li><strong>모델 선택</strong></li></ol><p>vLLM 모델 ID 중 하나로 교체하세요.</p><pre><code>   \`\`\`json5
   {
     agents: {
       defaults: {
         model: { primary: &quot;vllm/your-model-id&quot; },
       },
     },
   }
   \`\`\`
</code></pre><ol start="4"><li><strong>모델 사용 가능 여부 확인</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> vllm</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 모델 탐색 (암묵적 프로바이더)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VLLM_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정되어 있고(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 인증 프로파일이 존재하고) \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models.providers.vllm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">정의하지 않았다면</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">, OpenClaw는 다음을 조회합니다.</span></span></code></pre></div><p>GET <a href="http://127.0.0.1:8000/v1/models" target="_blank" rel="noreferrer">http://127.0.0.1:8000/v1/models</a></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>그리고 반환된 ID들을 모델 항목으로 변환합니다.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>::: info NOTE</span></span>
<span class="line"><span>\`models.providers.vllm\`을 명시적으로 설정하면 자동 탐색이 건너뛰어지며, 모델을 수동으로 정의해야 합니다.</span></span>
<span class="line"><span>:::</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 명시적 설정 (수동 모델)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>다음과 같은 경우 명시적 설정을 사용하세요.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- vLLM이 다른 호스트 또는 포트에서 실행되는 경우</span></span>
<span class="line"><span>- \`contextWindow\`나 \`maxTokens\` 값을 고정하고 싶은 경우</span></span>
<span class="line"><span>- 서버에 실제 API 키가 필요하거나(또는 헤더를 제어하고 싶은 경우)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`json5</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  models: {</span></span>
<span class="line"><span>    providers: {</span></span>
<span class="line"><span>      vllm: {</span></span>
<span class="line"><span>        baseUrl: &quot;http://127.0.0.1:8000/v1&quot;,</span></span>
<span class="line"><span>        apiKey: &quot;\${VLLM_API_KEY}&quot;,</span></span>
<span class="line"><span>        api: &quot;openai-completions&quot;,</span></span>
<span class="line"><span>        models: [</span></span>
<span class="line"><span>          {</span></span>
<span class="line"><span>            id: &quot;your-model-id&quot;,</span></span>
<span class="line"><span>            name: &quot;Local vLLM Model&quot;,</span></span>
<span class="line"><span>            reasoning: false,</span></span>
<span class="line"><span>            input: [&quot;text&quot;],</span></span>
<span class="line"><span>            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },</span></span>
<span class="line"><span>            contextWindow: 128000,</span></span>
<span class="line"><span>            maxTokens: 8192,</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>        ],</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="고급-설정" tabindex="-1">고급 설정 <a class="header-anchor" href="#고급-설정" aria-label="Permalink to &quot;고급 설정&quot;">​</a></h2><details class="details custom-block"><summary>프록시 스타일 동작</summary><p>vLLM은 네이티브 OpenAI 엔드포인트가 아닌, 프록시 스타일의 OpenAI 호환 <code>/v1</code> 백엔드로 취급됩니다. 이는 다음을 의미합니다.</p><pre><code>| 동작 | 적용 여부 |
|----------|----------|
| 네이티브 OpenAI 요청 셰이핑 | 아니오 |
| \`service_tier\` | 전송되지 않음 |
| Responses \`store\` | 전송되지 않음 |
| 프롬프트 캐시 힌트 | 전송되지 않음 |
| OpenAI reasoning-compat 페이로드 셰이핑 | 적용되지 않음 |
| 숨겨진 OpenClaw 속성(attribution) 헤더 | 커스텀 base URL에 주입되지 않음 |
</code></pre></details><details class="details custom-block"><summary>커스텀 base URL</summary><p>vLLM 서버가 기본이 아닌 호스트나 포트에서 실행되는 경우, 명시적 프로바이더 설정에서 <code>baseUrl</code>을 지정하세요.</p><pre><code>\`\`\`json5
{
  models: {
    providers: {
      vllm: {
        baseUrl: &quot;http://192.168.1.50:9000/v1&quot;,
        apiKey: &quot;\${VLLM_API_KEY}&quot;,
        api: &quot;openai-completions&quot;,
        models: [
          {
            id: &quot;my-custom-model&quot;,
            name: &quot;Remote vLLM Model&quot;,
            reasoning: false,
            input: [&quot;text&quot;],
            contextWindow: 64000,
            maxTokens: 4096,
          },
        ],
      },
    },
  },
}
\`\`\`
</code></pre></details><h2 id="문제-해결" tabindex="-1">문제 해결 <a class="header-anchor" href="#문제-해결" aria-label="Permalink to &quot;문제 해결&quot;">​</a></h2><details class="details custom-block"><summary>서버에 연결할 수 없음</summary><p>vLLM 서버가 실행 중이고 접근 가능한지 확인하세요.</p><pre><code>\`\`\`bash
curl http://127.0.0.1:8000/v1/models
\`\`\`

연결 오류가 발생하면 호스트, 포트, 그리고 vLLM이 OpenAI 호환 서버 모드로 시작되었는지 확인하세요.
</code></pre></details><details class="details custom-block"><summary>요청 시 인증 오류</summary><p>요청이 인증 오류로 실패하면, 서버 설정과 일치하는 실제 <code>VLLM_API_KEY</code>를 설정하거나, <code>models.providers.vllm</code> 아래에 프로바이더를 명시적으로 구성하세요.</p><pre><code>::: tip
</code></pre><p>vLLM 서버에서 인증을 강제하지 않는 경우, <code>VLLM_API_KEY</code>에 비어있지 않은 어떤 값이든 OpenClaw의 옵트인 신호로 동작합니다.</p></details><p>:::</p><details class="details custom-block"><summary>탐색된 모델이 없음</summary><p>자동 탐색은 <code>VLLM_API_KEY</code>가 설정되어 있어야 <strong>하며</strong> 명시적인 <code>models.providers.vllm</code> 설정 항목이 없어야 합니다. 프로바이더를 수동으로 정의한 경우, OpenClaw는 탐색을 건너뛰고 선언된 모델만 사용합니다.</p></details><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>추가 도움말: <a href="/openclaw-docs-ko/help/troubleshooting">문제 해결</a> 및 <a href="/openclaw-docs-ko/help/faq">FAQ</a>.</p></div><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더 선택, 모델 참조, 페일오버 동작.</p></blockquote><blockquote><p><strong>OpenAI</strong> <a href="/openclaw-docs-ko/providers/openai">→</a> 네이티브 OpenAI 프로바이더 및 OpenAI 호환 경로 동작.</p></blockquote><blockquote><p><strong>OAuth 및 인증</strong> <a href="/openclaw-docs-ko/gateway/authentication">→</a> 인증 세부 사항 및 자격 증명 재사용 규칙.</p></blockquote><blockquote><p><strong>문제 해결</strong> <a href="/openclaw-docs-ko/help/troubleshooting">→</a> 일반적인 문제와 해결 방법.</p></blockquote>`,29)])])}const u=n(l,[["render",t]]);export{k as __pageData,u as default};
