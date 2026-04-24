import{_ as a,o as i,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const c=JSON.parse('{"title":"Anthropic","description":"OpenClaw에서 API 키 또는 Claude CLI를 통해 Anthropic Claude 사용","frontmatter":{"title":"Anthropic","description":"OpenClaw에서 API 키 또는 Claude CLI를 통해 Anthropic Claude 사용"},"headers":[],"relativePath":"providers/anthropic.md","filePath":"providers/anthropic.md","lastUpdated":null}'),t={name:"providers/anthropic.md"};function p(e,s,h,k,r,d){return i(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="anthropic-claude" tabindex="-1">Anthropic (Claude) <a class="header-anchor" href="#anthropic-claude" aria-label="Permalink to &quot;Anthropic (Claude)&quot;">​</a></h1><p>Anthropic은 <strong>Claude</strong> 모델 패밀리를 만듭니다. OpenClaw는 두 가지 인증 경로를 지원합니다.</p><ul><li><strong>API 키</strong> — 사용량 기반 과금을 통한 직접 Anthropic API 접근 (<code>anthropic/*</code> 모델)</li><li><strong>Claude CLI</strong> — 동일 호스트의 기존 Claude CLI 로그인 재사용</li></ul><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>Anthropic 측은 OpenClaw 스타일의 Claude CLI 사용이 다시 허용된다고 알려왔으므로, OpenClaw는 Anthropic이 새 정책을 발표하지 않는 한 Claude CLI 재사용 및 <code>claude -p</code> 사용을 승인된 것으로 취급합니다.</p><p>장기 운영되는 게이트웨이 호스트의 경우, Anthropic API 키가 여전히 가장 명확하고 예측 가능한 프로덕션 경로입니다.</p><p>Anthropic의 현재 공개 문서:</p><ul><li><a href="https://code.claude.com/docs/en/cli-reference" target="_blank" rel="noreferrer">Claude Code CLI 레퍼런스</a></li><li><a href="https://platform.claude.com/docs/en/agent-sdk/overview" target="_blank" rel="noreferrer">Claude Agent SDK 개요</a></li><li><a href="https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan" target="_blank" rel="noreferrer">Pro 또는 Max 플랜에서 Claude Code 사용</a></li><li><a href="https://support.anthropic.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan/" target="_blank" rel="noreferrer">Team 또는 Enterprise 플랜에서 Claude Code 사용</a></li></ul></div><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><p><strong>API 키</strong></p><p><strong>적합한 경우:</strong> 표준 API 접근 및 사용량 기반 과금.</p><pre><code>1. **API 키 발급**
</code></pre><p><a href="https://console.anthropic.com/" target="_blank" rel="noreferrer">Anthropic Console</a>에서 API 키를 생성하세요.</p><pre><code>  2. **온보딩 실행**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 선택: Anthropic API key</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 키를 직접 전달:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --anthropic-api-key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$ANTHROPIC_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 사용 가능 여부 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> anthropic</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 설정 예시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   env:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ANTHROPIC_API_KEY:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;sk-ant-...&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;anthropic/claude-opus-4-6&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">**Claude</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> CLI</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">적합한 경우:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 별도 API 키 없이 기존 Claude CLI 로그인을 재사용.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Claude CLI 설치 및 로그인 상태 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">다음으로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 확인:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        claude</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --version</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">온보딩 실행</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 선택: Claude CLI</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        OpenClaw가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 기존 Claude CLI 자격 증명을 감지하고 재사용합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 사용 가능 여부 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> anthropic</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Claude</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> CLI 백엔드의 설정 및 런타임 세부 사항은 [CLI 백엔드](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/gateway/cli-backends</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)에 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tip</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">가장</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 명확한 과금 경로를 원한다면 Anthropic API 키를 대신 사용하세요. OpenClaw는 [OpenAI Codex](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/providers/openai</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">), [Qwen Cloud](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/providers/qwen</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">), [MiniMax](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/providers/minimax</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">), [Z.AI / GLM](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/providers/glm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)의 구독 방식 옵션도 지원합니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Thinking 기본값 (Claude 4.6)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Claude</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4.6</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델은 명시적인 thinking 레벨이 설정되지 않으면 OpenClaw에서 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">adaptive</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">thinking을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 기본값으로 사용합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">메시지별로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/think:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;level&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 재정의하거나 모델 파라미터에서 설정:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     &quot;anthropic/claude-opus-4-6&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       params:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> thinking:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;adaptive&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>관련 Anthropic 문서:</p><ul><li><a href="https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking" target="_blank" rel="noreferrer">Adaptive thinking</a></li><li><a href="https://platform.claude.com/docs/en/build-with-claude/extended-thinking" target="_blank" rel="noreferrer">Extended thinking</a></li></ul></div><h2 id="프롬프트-캐싱" tabindex="-1">프롬프트 캐싱 <a class="header-anchor" href="#프롬프트-캐싱" aria-label="Permalink to &quot;프롬프트 캐싱&quot;">​</a></h2><p>OpenClaw는 API 키 인증에 대해 Anthropic의 프롬프트 캐싱 기능을 지원합니다.</p><table tabindex="0"><thead><tr><th>값</th><th>캐시 지속시간</th><th>설명</th></tr></thead><tbody><tr><td><code>&quot;short&quot;</code> (기본값)</td><td>5분</td><td>API 키 인증에 대해 자동으로 적용</td></tr><tr><td><code>&quot;long&quot;</code></td><td>1시간</td><td>확장 캐시</td></tr><tr><td><code>&quot;none&quot;</code></td><td>캐싱 없음</td><td>프롬프트 캐싱 비활성화</td></tr></tbody></table><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;anthropic/claude-opus-4-6&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">cacheRetention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;long&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><details class="details custom-block"><summary>에이전트별 캐시 재정의</summary><p>모델 레벨 파라미터를 기본으로 사용한 다음, <code>agents.list[].params</code>를 통해 특정 에이전트를 재정의하세요.</p><pre><code>\`\`\`json5
{
  agents: {
    defaults: {
      model: { primary: &quot;anthropic/claude-opus-4-6&quot; },
      models: {
        &quot;anthropic/claude-opus-4-6&quot;: {
          params: { cacheRetention: &quot;long&quot; },
        },
      },
    },
    list: [
      { id: &quot;research&quot;, default: true },
      { id: &quot;alerts&quot;, params: { cacheRetention: &quot;none&quot; } },
    ],
  },
}
\`\`\`

설정 병합 순서:

1. \`agents.defaults.models[&quot;provider/model&quot;].params\`
2. \`agents.list[].params\` (일치하는 \`id\`, 키 단위로 재정의)

이를 통해 한 에이전트는 장기 캐시를 유지하면서, 동일 모델의 다른 에이전트는 버스트성/저재사용 트래픽에 대해 캐싱을 비활성화할 수 있습니다.
</code></pre></details><details class="details custom-block"><summary>Bedrock Claude 참고 사항</summary><ul><li>Bedrock의 Anthropic Claude 모델(<code>amazon-bedrock/*anthropic.claude*</code>)은 구성된 경우 <code>cacheRetention</code> 패스스루(pass-through)를 허용합니다. <ul><li>Bedrock의 Anthropic 외 모델은 런타임에서 강제로 <code>cacheRetention: &quot;none&quot;</code>으로 설정됩니다.</li><li>API 키 스마트 기본값도 명시적 값이 설정되지 않은 경우 Claude-on-Bedrock 참조에 대해 <code>cacheRetention: &quot;short&quot;</code>을 시드합니다.</li></ul></li></ul></details><h2 id="고급-설정" tabindex="-1">고급 설정 <a class="header-anchor" href="#고급-설정" aria-label="Permalink to &quot;고급 설정&quot;">​</a></h2><details class="details custom-block"><summary>Fast 모드</summary><p>OpenClaw의 공유 <code>/fast</code> 토글은 직접 Anthropic 트래픽(API 키 및 <code>api.anthropic.com</code>에 대한 OAuth)을 지원합니다.</p><pre><code>| 명령어 | 매핑 |
|---------|---------|
| \`/fast on\` | \`service_tier: &quot;auto&quot;\` |
| \`/fast off\` | \`service_tier: &quot;standard_only&quot;\` |

\`\`\`json5
{
  agents: {
    defaults: {
      models: {
        &quot;anthropic/claude-sonnet-4-6&quot;: {
          params: { fastMode: true },
        },
      },
    },
  },
}
\`\`\`

::: info NOTE
</code></pre><ul><li>직접 <code>api.anthropic.com</code> 요청에만 주입됩니다. 프록시 경로는 <code>service_tier</code>를 건드리지 않습니다. <ul><li>명시적인 <code>serviceTier</code> 또는 <code>service_tier</code> 파라미터는 둘 다 설정된 경우 <code>/fast</code>를 재정의합니다.</li><li>Priority Tier 용량이 없는 계정에서는 <code>service_tier: &quot;auto&quot;</code>가 <code>standard</code>로 해석될 수 있습니다.</li></ul></li></ul></details><p>:::</p><details class="details custom-block"><summary>미디어 이해 (이미지 및 PDF)</summary><p>번들된 Anthropic 플러그인은 이미지 및 PDF 이해 기능을 등록합니다. OpenClaw는 구성된 Anthropic 인증으로부터 미디어 기능을 자동 해석하므로, 추가 설정이 필요하지 않습니다.</p><pre><code>| 속성           | 값                   |
| -------------- | -------------------- |
| 기본 모델      | \`claude-opus-4-6\`    |
| 지원 입력      | 이미지, PDF 문서     |

이미지 또는 PDF가 대화에 첨부되면, OpenClaw는 자동으로 Anthropic 미디어 이해 프로바이더를 통해 라우팅합니다.
</code></pre></details><details class="details custom-block"><summary>1M 컨텍스트 윈도우 (베타)</summary><p>Anthropic의 1M 컨텍스트 윈도우는 베타로 게이팅됩니다. 모델별로 활성화하세요.</p><pre><code>\`\`\`json5
{
  agents: {
    defaults: {
      models: {
        &quot;anthropic/claude-opus-4-6&quot;: {
          params: { context1m: true },
        },
      },
    },
  },
}
\`\`\`

OpenClaw는 이를 요청 시 \`anthropic-beta: context-1m-2025-08-07\`로 매핑합니다.

::: warning
</code></pre><p>Anthropic 자격 증명에 장기 컨텍스트(long-context) 접근이 필요합니다. 레거시 토큰 인증(<code>sk-ant-oat-*</code>)은 1M 컨텍스트 요청에서 거부됩니다 — OpenClaw는 경고를 기록하고 표준 컨텍스트 윈도우로 폴백합니다.</p></details><p>:::</p><details class="details custom-block"><summary>Claude Opus 4.7 1M 컨텍스트</summary><p><code>anthropic/claude-opus-4.7</code> 및 그 <code>claude-cli</code> 변형은 기본적으로 1M 컨텍스트 윈도우를 가집니다 — <code>params.context1m: true</code>가 필요 없습니다.</p></details><h2 id="문제-해결" tabindex="-1">문제 해결 <a class="header-anchor" href="#문제-해결" aria-label="Permalink to &quot;문제 해결&quot;">​</a></h2><details class="details custom-block"><summary>401 오류 / 토큰이 갑자기 무효화됨</summary><p>Anthropic 토큰 인증은 만료되거나 취소될 수 있습니다. 새 설정의 경우 Anthropic API 키를 대신 사용하세요.</p></details><p>&lt;Accordion title=&#39;&quot;anthropic&quot; 프로바이더에 대한 API 키를 찾을 수 없음&#39;&gt; Anthropic 인증은 <strong>에이전트별</strong>입니다 — 새 에이전트는 메인 에이전트의 키를 상속하지 않습니다. 해당 에이전트에 대해 온보딩을 다시 실행하거나(또는 게이트웨이 호스트에 API 키를 설정하세요), 그다음 <code>openclaw models status</code>로 확인하세요. &lt;/Accordion&gt;</p><p>&lt;Accordion title=&#39;&quot;anthropic:default&quot; 프로파일에 대한 자격 증명을 찾을 수 없음&#39;&gt; <code>openclaw models status</code>를 실행하여 활성 인증 프로파일을 확인하세요. 온보딩을 다시 실행하거나, 해당 프로파일 경로에 대한 API 키를 설정하세요. &lt;/Accordion&gt;</p><details class="details custom-block"><summary>사용 가능한 인증 프로파일 없음 (모두 쿨다운 중)</summary><p><code>openclaw models status --json</code>에서 <code>auth.unusableProfiles</code>를 확인하세요. Anthropic 레이트 리밋 쿨다운은 모델 단위로 적용될 수 있으므로, 형제 Anthropic 모델은 여전히 사용 가능할 수 있습니다. 다른 Anthropic 프로파일을 추가하거나 쿨다운이 끝나기를 기다리세요.</p></details><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>추가 도움말: <a href="/openclaw-docs-ko/help/troubleshooting">문제 해결</a> 및 <a href="/openclaw-docs-ko/help/faq">FAQ</a>.</p></div><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더 선택, 모델 참조, 페일오버 동작.</p></blockquote><blockquote><p><strong>CLI 백엔드</strong> <a href="/openclaw-docs-ko/gateway/cli-backends">→</a> Claude CLI 백엔드 설정 및 런타임 세부 사항.</p></blockquote><blockquote><p><strong>프롬프트 캐싱</strong> <a href="/openclaw-docs-ko/reference/prompt-caching">→</a> 프로바이더 전반에서 프롬프트 캐싱이 동작하는 방식.</p></blockquote><blockquote><p><strong>OAuth 및 인증</strong> <a href="/openclaw-docs-ko/gateway/authentication">→</a> 인증 세부 사항 및 자격 증명 재사용 규칙.</p></blockquote>`,36)])])}const F=a(t,[["render",p]]);export{c as __pageData,F as default};
