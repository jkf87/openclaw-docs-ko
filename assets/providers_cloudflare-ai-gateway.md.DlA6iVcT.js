import{_ as s,o as i,c as t,ag as e}from"./chunks/framework.CTpQozEL.js";const k=JSON.parse('{"title":"Cloudflare AI gateway","description":"Cloudflare AI Gateway 설정 (인증 + 모델 선택)","frontmatter":{"title":"Cloudflare AI gateway","description":"Cloudflare AI Gateway 설정 (인증 + 모델 선택)"},"headers":[],"relativePath":"providers/cloudflare-ai-gateway.md","filePath":"providers/cloudflare-ai-gateway.md","lastUpdated":null}'),n={name:"providers/cloudflare-ai-gateway.md"};function l(o,a,p,d,r,h){return i(),t("div",null,[...a[0]||(a[0]=[e(`<p>Cloudflare AI Gateway는 프로바이더 API 앞단에 위치하여 애널리틱스, 캐싱, 컨트롤을 추가할 수 있게 해줍니다. Anthropic의 경우, OpenClaw는 Gateway 엔드포인트를 통해 Anthropic Messages API를 사용합니다.</p><table tabindex="0"><thead><tr><th>속성</th><th>값</th></tr></thead><tbody><tr><td>프로바이더</td><td><code>cloudflare-ai-gateway</code></td></tr><tr><td>Base URL</td><td><code>https://gateway.ai.cloudflare.com/v1/&lt;account_id&gt;/&lt;gateway_id&gt;/anthropic</code></td></tr><tr><td>기본 모델</td><td><code>cloudflare-ai-gateway/claude-sonnet-4-6</code></td></tr><tr><td>API 키</td><td><code>CLOUDFLARE_AI_GATEWAY_API_KEY</code> (Gateway를 통한 요청에 사용할 프로바이더 API 키)</td></tr></tbody></table><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>Cloudflare AI Gateway를 통해 라우팅되는 Anthropic 모델의 경우, 프로바이더 키로 <strong>Anthropic API 키</strong>를 사용합니다.</p></div><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><ol><li><p><strong>프로바이더 API 키와 Gateway 정보 설정</strong></p><p>온보딩을 실행하고 Cloudflare AI Gateway 인증 옵션을 선택하세요.</p><pre><code>\`\`\`bash
openclaw onboard --auth-choice cloudflare-ai-gateway-api-key
\`\`\`

이 과정에서 계정 ID, 게이트웨이 ID, API 키를 입력하라는 프롬프트가 표시됩니다.
</code></pre></li><li><p><strong>기본 모델 설정</strong></p></li></ol><p>OpenClaw 설정에 모델을 추가하세요.</p><pre><code>   \`\`\`json5
   {
     agents: {
       defaults: {
         model: { primary: &quot;cloudflare-ai-gateway/claude-sonnet-4-6&quot; },
       },
     },
   }
   \`\`\`
</code></pre><ol start="3"><li><strong>모델이 사용 가능한지 확인</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cloudflare-ai-gateway</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 비대화형 예시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">스크립트</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 또는 CI 설정의 경우, 모든 값을 커맨드라인으로 전달하세요.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --non-interactive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">--mode </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">local</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">--auth-choice </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">cloudflare-ai-gateway-api-key</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">--cloudflare-ai-gateway-account-id </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;your-account-id&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">--cloudflare-ai-gateway-gateway-id </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;your-gateway-id&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">--cloudflare-ai-gateway-api-key </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$CLOUDFLARE_AI_GATEWAY_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span></code></pre></div><h2 id="고급-설정" tabindex="-1">고급 설정 <a class="header-anchor" href="#고급-설정" aria-label="Permalink to &quot;고급 설정&quot;">​</a></h2><details class="details custom-block"><summary>인증이 필요한 게이트웨이</summary><p>Cloudflare에서 Gateway 인증을 활성화한 경우, <code>cf-aig-authorization</code> 헤더를 추가하세요. 이는 프로바이더 API 키에 <strong>추가로</strong> 필요합니다.</p><pre><code>\`\`\`json5
{
  models: {
    providers: {
      &quot;cloudflare-ai-gateway&quot;: {
        headers: {
          &quot;cf-aig-authorization&quot;: &quot;Bearer &lt;cloudflare-ai-gateway-token&gt;&quot;,
        },
      },
    },
  },
}
\`\`\`

::: tip
</code></pre><p><code>cf-aig-authorization</code> 헤더는 Cloudflare Gateway 자체를 인증하고, 프로바이더 API 키(예: Anthropic 키)는 상류의 프로바이더를 인증합니다.</p></details><p>:::</p><details class="details custom-block"><summary>환경 관련 주의사항</summary><p>Gateway가 데몬(launchd/systemd)으로 실행 중이라면, <code>CLOUDFLARE_AI_GATEWAY_API_KEY</code>가 해당 프로세스에서 접근 가능한지 확인하세요.</p><pre><code>::: warning
</code></pre><p><code>~/.profile</code>에만 설정된 키는 해당 환경이 거기에서도 임포트되지 않는 한 launchd/systemd 데몬에는 도움이 되지 않습니다. 게이트웨이 프로세스가 키를 읽을 수 있도록 <code>~/.openclaw/.env</code> 또는 <code>env.shellEnv</code>에 키를 설정하세요.</p></details><p>:::</p><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더, 모델 ref, 페일오버 동작 선택.</p></blockquote><blockquote><p><strong>문제 해결</strong> <a href="/openclaw-docs-ko/help/troubleshooting">→</a> 일반 문제 해결 및 FAQ.</p></blockquote>`,17)])])}const u=s(n,[["render",l]]);export{k as __pageData,u as default};
