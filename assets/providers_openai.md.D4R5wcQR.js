import{_ as i,o as a,c as n,ag as p}from"./chunks/framework.CTpQozEL.js";const E=JSON.parse('{"title":"OpenAI","description":"OpenClaw에서 API 키 또는 Codex 구독으로 OpenAI 사용","frontmatter":{"title":"OpenAI","description":"OpenClaw에서 API 키 또는 Codex 구독으로 OpenAI 사용"},"headers":[],"relativePath":"providers/openai.md","filePath":"providers/openai.md","lastUpdated":null}'),l={name:"providers/openai.md"};function h(k,s,t,e,d,r){return a(),n("div",null,[...s[0]||(s[0]=[p(`<p>OpenAI는 GPT 모델을 위한 개발자 API를 제공합니다. OpenClaw는 세 가지 OpenAI 계열 경로를 지원합니다. 모델 prefix가 경로를 선택합니다:</p><ul><li><strong>API key</strong> — 사용량 기반 청구를 사용하는 OpenAI Platform 직접 액세스 (<code>openai/*</code> 모델)</li><li><strong>PI를 통한 Codex 구독</strong> — 구독 액세스를 사용하는 ChatGPT/Codex 로그인 (<code>openai-codex/*</code> 모델)</li><li><strong>Codex app-server 하니스</strong> — 네이티브 Codex app-server 실행 (<code>openai/*</code> 모델 + <code>agents.defaults.embeddedHarness.runtime: &quot;codex&quot;</code>)</li></ul><p>OpenAI는 OpenClaw와 같은 외부 도구 및 워크플로에서 구독 OAuth 사용을 명시적으로 지원합니다.</p><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>GPT-5.5는 현재 구독/OAuth 경로를 통해 OpenClaw에서 사용할 수 있습니다: PI 러너와 함께 <code>openai-codex/gpt-5.5</code>, 또는 Codex app-server 하니스와 함께 <code>openai/gpt-5.5</code>. <code>openai/gpt-5.5</code>에 대한 직접 API 키 액세스는 OpenAI가 공개 API에서 GPT-5.5를 활성화하면 지원되며, 그 전까지는 <code>OPENAI_API_KEY</code> 설정에 대해 <code>openai/gpt-5.4</code>와 같은 API 지원 모델을 사용하십시오.</p></div><h2 id="openclaw-기능-커버리지" tabindex="-1">OpenClaw 기능 커버리지 <a class="header-anchor" href="#openclaw-기능-커버리지" aria-label="Permalink to &quot;OpenClaw 기능 커버리지&quot;">​</a></h2><table tabindex="0"><thead><tr><th>OpenAI 기능</th><th>OpenClaw 표면</th><th>상태</th></tr></thead><tbody><tr><td>Chat / Responses</td><td><code>openai/&lt;model&gt;</code> 모델 프로바이더</td><td>지원</td></tr><tr><td>Codex 구독 모델</td><td><code>openai-codex</code> OAuth를 사용하는 <code>openai-codex/&lt;model&gt;</code></td><td>지원</td></tr><tr><td>Codex app-server 하니스</td><td><code>embeddedHarness.runtime: codex</code>를 사용하는 <code>openai/&lt;model&gt;</code></td><td>지원</td></tr><tr><td>서버 사이드 웹 검색</td><td>네이티브 OpenAI Responses 도구</td><td>웹 검색이 활성화되고 프로바이더가 고정되지 않은 경우 지원</td></tr><tr><td>이미지</td><td><code>image_generate</code></td><td>지원</td></tr><tr><td>비디오</td><td><code>video_generate</code></td><td>지원</td></tr><tr><td>텍스트 투 스피치</td><td><code>messages.tts.provider: &quot;openai&quot;</code> / <code>tts</code></td><td>지원</td></tr><tr><td>배치 음성 투 텍스트</td><td><code>tools.media.audio</code> / 미디어 이해</td><td>지원</td></tr><tr><td>스트리밍 음성 투 텍스트</td><td>Voice Call <code>streaming.provider: &quot;openai&quot;</code></td><td>지원</td></tr><tr><td>실시간 음성</td><td>Voice Call <code>realtime.provider: &quot;openai&quot;</code> / Control UI Talk</td><td>지원</td></tr><tr><td>Embeddings</td><td>메모리 embedding 프로바이더</td><td>지원</td></tr></tbody></table><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><p>원하는 인증 방식을 선택하고 설정 단계를 따르십시오.</p><p><strong>API 키 (OpenAI Platform)</strong></p><p><strong>적합한 경우:</strong> 직접 API 액세스 및 사용량 기반 청구.</p><pre><code>1. **API 키 받기**
</code></pre><p><a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">OpenAI Platform 대시보드</a>에서 API 키를 생성하거나 복사하십시오.</p><pre><code>  2. **온보딩 실행**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openai-api-key</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 키를 직접 전달:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --openai-api-key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$OPENAI_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 사용 가능 여부 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openai</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 경로 요약</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 모델</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 경로</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 인증</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-----------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-5.4</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Platform API 직접 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENAI_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-5.4-mini</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Platform API 직접 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENAI_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-5.5</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> API에서 GPT-5.5를 활성화하면 사용되는 향후 직접 API 경로 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENAI_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/*</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Codex app-server 하니스를 명시적으로 강제하지 않는 한 직접</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> API 키 경로입니다. GPT-5.5 자체는 현재 구독/OAuth 전용이므로,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 기본</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> PI 러너를 통한 Codex OAuth에는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai-codex/*</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하십시오.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 구성 예시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   env:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OPENAI_API_KEY:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;sk-...&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openai/gpt-5.4&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> warning</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OpenClaw는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-5.3-codex-spark</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 노출하지 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">않습니다</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">. 실제 OpenAI API 요청은 해당 모델을 거부하며, 현재 Codex 카탈로그도 이를 노출하지 않습니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Codex 구독</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">적합한 경우:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 별도의 API 키 대신 ChatGPT/Codex 구독을 사용합니다. Codex cloud는 ChatGPT 로그인이 필요합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Codex OAuth 실행</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openai-codex</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OAuth를 직접 실행:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> auth</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> login</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openai-codex</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        헤드리스</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 또는 콜백이 제한된 환경의 경우, \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">--device-code</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 추가하여 localhost 브라우저 콜백 대신 ChatGPT 디바이스 코드 플로우로 로그인하십시오:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> auth</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> login</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openai-codex</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --device-code</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">기본 모델 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> agents.defaults.model.primary</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openai-codex/gpt-5.5</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 사용 가능 여부 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openai-codex</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 경로 요약</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 모델</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 경로</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 인증</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-----------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai-codex/gpt-5.5</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PI를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 통한 ChatGPT/Codex OAuth </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 로그인 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-5.5</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">embeddedHarness.runtime:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;codex&quot;\` </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app-server 하니스 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app-server 인증 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">인증/프로필</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 명령에는 계속 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai-codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> id를 사용하십시오.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai-codex/*</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">모델</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> prefix는 Codex OAuth의 명시적 PI 경로이기도 합니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 구성 예시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openai-codex/gpt-5.5&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">온보딩은</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 더 이상 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">~/.codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OAuth 자료를 가져오지 않습니다. 브라우저 OAuth(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">기본값</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">) 또는 위의 디바이스 코드 플로우로 로그인하십시오 — OpenClaw는 결과 자격 증명을 자체 에이전트 인증 저장소에서 관리합니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 상태 표시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Chat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/status</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 현재 세션에 활성화된 임베디드 하니스를 보여줍니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 기본</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> PI 하니스는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Runner:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pi</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (embedded)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 표시되며 별도의 배지를</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 추가하지</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 않습니다. 번들된 Codex app-server 하니스가 선택되면,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/status</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Fast</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">옆에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> PI가 아닌 하니스 id를 덧붙입니다(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">예:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Fast</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> · codex\`). 기존 세션은 기록된 하니스 id를 유지하므로,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">embeddedHarness</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">변경</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 후 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/status</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 새로운 PI/Codex 선택이</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 반영되게</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 하려면 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/new</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/reset</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### Context window 제한</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenClaw는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델 메타데이터와 런타임 context 제한을 별도의 값으로 취급합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OAuth를 통한 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai-codex/gpt-5.5</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">의</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 경우:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 네이티브 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contextWindow</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">1000000</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 기본 런타임 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contextTokens</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">제한:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">272000</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 더</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 작은 기본 제한은 실제로 더 나은 지연 시간 및 품질 특성을 가집니다. \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contextTokens</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 재정의하십시오:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     providers:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       &quot;openai-codex&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         models:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;gpt-5.5&quot;,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> contextTokens:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 160000</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> }],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">네이티브</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델 메타데이터를 선언하려면 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contextWindow</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하십시오. 런타임 context 예산을 제한하려면 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contextTokens</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하십시오.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 이미지 생성</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">번들</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">플러그인은</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">image_generate</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">도구를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 통해 이미지 생성을 등록합니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> API 키 이미지 생성과 Codex OAuth 이미지 생성을 동일한</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-image-2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">모델</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ref를 통해 모두 지원합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 기능</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                       |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> API 키                        </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OAuth                            </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> -------------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ------------------------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> --------------------------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 모델</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ref                   </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-image-2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`                 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openai/gpt-image-2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`                   </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 인증</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                       |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENAI_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`                     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Codex OAuth 로그인               </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 전송</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                       |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Images API                    </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Codex</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Responses 백엔드                  </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 요청당</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 최대 이미지 수       </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 4</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 4</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                      |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 편집</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모드                   </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 활성화</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> (최대 5개 참조 이미지)          </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 활성화</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> (최대 5개 참조 이미지)            </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 크기</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 재정의                 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 2K/4K</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 크기를 포함하여 지원             </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 2K/4K</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 크기를 포함하여 지원               </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Aspect</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ratio / 해상도      </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenAI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Images API로 전달되지 않음     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 안전한</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 경우 지원되는 크기로 매핑         </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   imageGenerationModel:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openai/gpt-image-2&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작은 <a href="/openclaw-docs-ko/tools/image-generation">이미지 생성</a>을 참조하십시오.</p></div><p><code>gpt-image-2</code>는 OpenAI 텍스트 투 이미지 생성 및 이미지 편집 모두의 기본값입니다. <code>gpt-image-1</code>은 명시적 모델 재정의로 계속 사용할 수 있지만, 새로운 OpenAI 이미지 워크플로는 <code>openai/gpt-image-2</code>를 사용해야 합니다.</p><p>Codex OAuth 설치의 경우 동일한 <code>openai/gpt-image-2</code> ref를 유지하십시오. <code>openai-codex</code> OAuth 프로필이 구성된 경우, OpenClaw는 저장된 OAuth 액세스 토큰을 해석하고 Codex Responses 백엔드를 통해 이미지 요청을 보냅니다. 먼저 <code>OPENAI_API_KEY</code>를 시도하거나 해당 요청에 대해 API 키로 자동 폴백하지 않습니다. 직접 OpenAI Images API 경로를 원하는 경우 <code>models.providers.openai</code>에 API 키, 커스텀 base URL 또는 Azure 엔드포인트를 명시적으로 구성하십시오. 해당 커스텀 이미지 엔드포인트가 신뢰할 수 있는 LAN/프라이빗 주소에 있는 경우, <code>browser.ssrfPolicy.dangerouslyAllowPrivateNetwork: true</code>도 설정하십시오; OpenClaw는 이 opt-in이 없으면 프라이빗/내부 OpenAI 호환 이미지 엔드포인트를 차단합니다.</p><p>생성:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/tool image_generate model=openai/gpt-image-2 prompt=&quot;A polished launch poster for OpenClaw on macOS&quot; size=3840x2160 count=1</span></span></code></pre></div><p>편집:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/tool image_generate model=openai/gpt-image-2 prompt=&quot;Preserve the object shape, change the material to translucent glass&quot; image=/path/to/reference.png size=1024x1536</span></span></code></pre></div><h2 id="비디오-생성" tabindex="-1">비디오 생성 <a class="header-anchor" href="#비디오-생성" aria-label="Permalink to &quot;비디오 생성&quot;">​</a></h2><p>번들 <code>openai</code> 플러그인은 <code>video_generate</code> 도구를 통해 비디오 생성을 등록합니다.</p><table tabindex="0"><thead><tr><th>기능</th><th>값</th></tr></thead><tbody><tr><td>기본 모델</td><td><code>openai/sora-2</code></td></tr><tr><td>모드</td><td>텍스트 투 비디오, 이미지 투 비디오, 단일 비디오 편집</td></tr><tr><td>참조 입력</td><td>이미지 1개 또는 비디오 1개</td></tr><tr><td>크기 재정의</td><td>지원</td></tr><tr><td>기타 재정의</td><td><code>aspectRatio</code>, <code>resolution</code>, <code>audio</code>, <code>watermark</code>는 도구 경고와 함께 무시됨</td></tr></tbody></table><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      videoGenerationModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;openai/sora-2&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작은 <a href="/openclaw-docs-ko/tools/video-generation">비디오 생성</a>을 참조하십시오.</p></div><h2 id="gpt-5-프롬프트-기여" tabindex="-1">GPT-5 프롬프트 기여 <a class="header-anchor" href="#gpt-5-프롬프트-기여" aria-label="Permalink to &quot;GPT-5 프롬프트 기여&quot;">​</a></h2><p>OpenClaw는 프로바이더 간 GPT-5 계열 실행을 위한 공유 GPT-5 프롬프트 기여를 추가합니다. 이는 모델 id별로 적용되므로, <code>openai-codex/gpt-5.5</code>, <code>openai/gpt-5.4</code>, <code>openrouter/openai/gpt-5.5</code>, <code>opencode/gpt-5.5</code>, 기타 호환 GPT-5 ref는 동일한 오버레이를 받습니다. 이전 GPT-4.x 모델은 받지 않습니다.</p><p>번들된 네이티브 Codex 하니스는 Codex app-server 개발자 지침을 통해 동일한 GPT-5 동작 및 하트비트 오버레이를 사용하므로, <code>embeddedHarness.runtime: &quot;codex&quot;</code>를 통해 강제된 <code>openai/gpt-5.x</code> 세션은 Codex가 나머지 하니스 프롬프트를 소유하더라도 동일한 follow-through 및 사전 하트비트 가이드를 유지합니다.</p><p>GPT-5 기여는 페르소나 지속성, 실행 안전성, 도구 규율, 출력 형태, 완료 확인 및 검증을 위한 태그된 동작 계약을 추가합니다. 채널별 회신 및 silent-message 동작은 공유 OpenClaw 시스템 프롬프트 및 아웃바운드 전달 정책에 유지됩니다. GPT-5 가이드는 매칭 모델에 대해 항상 활성화됩니다. 친근한 상호 작용 스타일 계층은 별도이며 구성 가능합니다.</p><table tabindex="0"><thead><tr><th>값</th><th>효과</th></tr></thead><tbody><tr><td><code>&quot;friendly&quot;</code> (기본값)</td><td>친근한 상호 작용 스타일 계층 활성화</td></tr><tr><td><code>&quot;on&quot;</code></td><td><code>&quot;friendly&quot;</code>의 별칭</td></tr><tr><td><code>&quot;off&quot;</code></td><td>친근한 스타일 계층만 비활성화</td></tr></tbody></table><p><strong>구성</strong></p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          promptOverlays</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            gpt5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">personality</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;friendly&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  **CLI**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    openclaw config set agents.defaults.promptOverlays.gpt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.personality off</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: tip</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">런타임에서 값은 대소문자를 구분하지 않으므로, \`</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Off&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`와 \`</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;off&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` 모두 친근한 스타일 계층을 비활성화합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">레거시 \`plugins.entries.openai.config.personality\`는 공유 \`agents.defaults.promptOverlays.gpt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.personality\` 설정이 지정되지 않은 경우 호환성 폴백으로 계속 읽힙니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 음성 및 스피치</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details 음성 합성 (TTS)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`openai\` 플러그인은 \`messages.tts\` 표면에 대한 음성 합성을 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 설정 | 구성 경로 | 기본값 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    |---------|------------|---------|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 모델 | \`messages.tts.providers.openai.model\` | \`gpt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">o-mini-tts\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | Voice | \`messages.tts.providers.openai.voice\` | \`coral\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 속도 | \`messages.tts.providers.openai.speed\` | (미설정) |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 지침 | \`messages.tts.providers.openai.instructions\` | (미설정, \`gpt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">o-mini-tts\` 전용) |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 포맷 | \`messages.tts.providers.openai.responseFormat\` | 음성 노트는 \`opus\`, 파일은 \`mp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | API 키 | \`messages.tts.providers.openai.apiKey\` | \`OPENAI_API_KEY\`로 폴백 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | Base URL | \`messages.tts.providers.openai.baseUrl\` | \`https:</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//api.openai.com/v1\` |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    사용 가능한 모델: \`gpt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">o-mini-tts\`, \`tts</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`tts</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-hd\`. 사용 가능한 voice: \`alloy\`, \`ash\`, \`ballad\`, \`cedar\`, \`coral\`, \`echo\`, \`fable\`, \`juniper\`, \`marin\`, \`onyx\`, \`nova\`, \`sage\`, \`shimmer\`, \`verse\`.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      messages</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        tts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          providers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            openai</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;gpt-4o-mini-tts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">voice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;coral&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Chat API 엔드포인트에 영향을 주지 않고 TTS base URL을 재정의하려면 \`OPENAI_TTS_BASE_URL\`을 설정하십시오.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ::: details 음성 투 텍스트</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`openai\` 플러그인은 OpenClaw의 미디어 이해 전사 표면을 통해</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    배치 음성 투 텍스트를 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - 기본 모델: \`gpt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">o-transcribe\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - 엔드포인트: OpenAI REST \`/v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/audio/transcriptions\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - 입력 경로: 멀티파트 오디오 파일 업로드</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - Discord 음성 채널 세그먼트 및 채널 오디오 첨부 파일을 포함하여</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      인바운드 오디오 전사에 \`tools.media.audio\`를 사용하는 모든 곳에서</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      OpenClaw가 지원</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    인바운드 오디오 전사에 OpenAI를 강제하려면:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      tools</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        media</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          audio</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">              {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;provider&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;openai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;gpt-4o-transcribe&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">              },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    공유 오디오 미디어 구성 또는 호출별 전사 요청에서 제공되는 경우</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    언어 및 프롬프트 힌트가 OpenAI로 전달됩니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ::: details 실시간 전사</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`openai\` 플러그인은 Voice Call 플러그인에 대한 실시간 전사를 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 설정 | 구성 경로 | 기본값 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    |---------|------------|---------|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 모델 | \`plugins.entries.voice-call.config.streaming.providers.openai.model\` | \`gpt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">o-transcribe\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 언어 | \`...openai.language\` | (미설정) |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 프롬프트 | \`...openai.prompt\` | (미설정) |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | Silence duration | \`...openai.silenceDurationMs\` | \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">800</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | VAD threshold | \`...openai.vadThreshold\` | \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | API 키 | \`...openai.apiKey\` | \`OPENAI_API_KEY\`로 폴백 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.711</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> u-law (\`g</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">711</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">_ulaw\` / \`audio/pcmu\`) 오디오로 \`wss:</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//api.openai.com/v1/realtime\`에 WebSocket 연결을 사용합니다. 이 스트리밍 프로바이더는 Voice Call의 실시간 전사 경로 전용이며; Discord 음성은 현재 짧은 세그먼트를 기록하고 대신 배치 \`tools.media.audio\` 전사 경로를 사용합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ::: details 실시간 음성</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`openai\` 플러그인은 Voice Call 플러그인에 대한 실시간 음성을 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 설정 | 구성 경로 | 기본값 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    |---------|------------|---------|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | 모델 | \`plugins.entries.voice-call.config.realtime.providers.openai.model\` | \`gpt-realtime</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-1.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | Voice | \`...openai.voice\` | \`alloy\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | Temperature | \`...openai.temperature\` | \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | VAD threshold | \`...openai.vadThreshold\` | \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | Silence duration | \`...openai.silenceDurationMs\` | \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">500</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    | API 키 | \`...openai.apiKey\` | \`OPENAI_API_KEY\`로 폴백 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`azureEndpoint\` 및 \`azureDeployment\` 구성 키를 통해 Azure OpenAI를 지원합니다. 양방향 도구 호출을 지원합니다. G</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.711</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> u-law 오디오 포맷을 사용합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## Azure OpenAI 엔드포인트</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`openai\` 프로바이더는 base URL을 재정의하여 이미지 생성을 위한</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure OpenAI 리소스를 대상으로 할 수 있습니다. 이미지 생성 경로에서</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw는 \`models.providers.openai.baseUrl\`의 Azure 호스트명을 감지하고</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure의 요청 형태로 자동 전환합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">실시간 음성은 별도의 구성 경로</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(\`plugins.entries.voice-call.config.realtime.providers.openai.azureEndpoint\`)를</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">사용하며 \`models.providers.openai.baseUrl\`의 영향을 받지 않습니다. Azure</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">설정은 [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">음성</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> 및</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> 스피치</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](#voice-and-speech) 아래의 **실시간 음성**</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">아코디언을 참조하십시오.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">다음 경우 Azure OpenAI를 사용하십시오:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- 이미 Azure OpenAI 구독, 쿼터 또는 엔터프라이즈 계약이 있는 경우</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- Azure가 제공하는 리전 데이터 주권 또는 규정 준수 제어가 필요한 경우</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- 기존 Azure 테넌시 내에서 트래픽을 유지하고 싶은 경우</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### 구성</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`openai\` 프로바이더를 통한 Azure 이미지 생성의 경우,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`models.providers.openai.baseUrl\`을 Azure 리소스로 지정하고 \`apiKey\`를</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure OpenAI 키(OpenAI Platform 키 아님)로 설정하십시오:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">�OC_CODE_</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">�</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw는 Azure 이미지 생성 경로에 대해 다음 Azure 호스트 접미사를 인식합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- \`*.openai.azure.com\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- \`*.services.ai.azure.com\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- \`*.cognitiveservices.azure.com\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">인식된 Azure 호스트의 이미지 생성 요청에 대해 OpenClaw는:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- \`Authorization: Bearer\` 대신 \`api-key\` 헤더를 전송</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- deployment 범위 경로 사용 (\`/openai/deployments/{</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">deployment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}/...\`)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- 각 요청에 \`?api-version=...\` 추가</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">다른 base URL (공개 OpenAI, OpenAI 호환 프록시)은 표준 OpenAI 이미지 요청 형태를 유지합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`openai\` 프로바이더의 이미지 생성 경로에 대한 Azure 라우팅에는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2026.4.22</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 이상이 필요합니다. 이전 버전은 모든 커스텀</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`openai.baseUrl\`을 공개 OpenAI 엔드포인트처럼 취급하며 Azure 이미지</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">deployment에 대해 실패합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### API 버전</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure 이미지 생성 경로에 대해 특정 Azure preview 또는 GA 버전을 고정하려면</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`AZURE_OPENAI_API_VERSION\`을 설정하십시오:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">�OC_CODE_</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">�</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">변수가 미설정인 경우 기본값은 \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2024-12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-preview\`입니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### 모델 이름은 deployment 이름입니다</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure OpenAI는 모델을 deployment에 바인딩합니다. 번들 \`openai\` 프로바이더를</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">통해 라우팅된 Azure 이미지 생성 요청의 경우, OpenClaw의 \`model\` 필드는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">공개 OpenAI 모델 id가 아니라 Azure 포털에서 구성한 **Azure deployment</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">이름**이어야 합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`gpt-image</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`를 제공하는 \`gpt-image</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-prod\`라는 deployment를 생성한 경우:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">�OC_CODE_</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">�</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`openai\` 프로바이더를 통해 라우팅된 이미지 생성 호출에도 동일한 deployment 이름 규칙이 적용됩니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### 리전 가용성</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure 이미지 생성은 현재 일부 리전(예: \`eastus</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`swedencentral\`,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`polandcentral\`, \`westus</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`uaenorth\`)에서만 사용할 수 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">deployment를 생성하기 전에 Microsoft의 현재 리전 목록을 확인하고,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">특정 모델이 해당 리전에서 제공되는지 확인하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### 파라미터 차이</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure OpenAI와 공개 OpenAI는 동일한 이미지 파라미터를 항상 허용하는 것은</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">아닙니다. Azure는 공개 OpenAI가 허용하는 옵션을 거부하거나(예:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`gpt-image</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`의 특정 \`background\` 값) 특정 모델 버전에서만 노출할 수</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">있습니다. 이러한 차이는 OpenClaw가 아니라 Azure와 기본 모델에서 옵니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure 요청이 검증 오류로 실패하는 경우, Azure 포털에서 특정 deployment</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">및 API 버전에서 지원되는 파라미터 세트를 확인하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure OpenAI는 네이티브 전송 및 호환 동작을 사용하지만 OpenClaw의 숨겨진</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">attribution 헤더는 받지 않습니다 — [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">고급</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> 구성</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](#advanced-configuration)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">아래의 **네이티브 vs OpenAI 호환 경로** 아코디언을 참조하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure의 chat 또는 Responses 트래픽(이미지 생성 이상)의 경우, 온보딩</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">플로우나 전용 Azure 프로바이더 구성을 사용하십시오 — \`openai.baseUrl\`만으로는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Azure API/인증 형태를 가져오지 않습니다. 별도의 \`azure-openai-responses</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*\`</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">프로바이더가 있습니다; 아래의 서버 사이드 compaction 아코디언을 참조하십시오.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 고급 구성</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">::: details 전송 (WebSocket vs SSE)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">OpenClaw는 \`openai/*\` 및 \`openai-codex/*\` 모두에 대해 WebSocket 우선, SSE 폴백(\`&quot;auto&quot;\`)을 사용합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`&quot;auto&quot;\` 모드에서 OpenClaw는:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 초기 WebSocket 실패를 한 번 재시도한 후 SSE로 폴백</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 실패 후 WebSocket을 약 60초 동안 저하로 표시하고 쿨다운 동안 SSE 사용</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 재시도 및 재연결을 위해 안정적인 세션 및 턴 identity 헤더 첨부</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 전송 변형 간 사용량 카운터(\`input_tokens\` / \`prompt_tokens\`) 정규화</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    | 값 | 동작 |</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    |-------|----------|</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    | \`&quot;auto&quot;\` (기본값) | WebSocket 우선, SSE 폴백 |</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    | \`&quot;sse&quot;\` | SSE만 강제 |</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    | \`&quot;websocket&quot;\` | WebSocket만 강제 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`json5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      agents: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        defaults: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          models: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            &quot;openai/gpt-5.4&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              params: { transport: &quot;auto&quot; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            &quot;openai-codex/gpt-5.5&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              params: { transport: &quot;auto&quot; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    관련 OpenAI 문서:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - [WebSocket을 사용한 Realtime API](https://platform.openai.com/docs/guides/realtime-websocket)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - [스트리밍 API 응답 (SSE)](https://platform.openai.com/docs/guides/streaming-responses)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  ::: details WebSocket 워밍업</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">OpenClaw는 첫 턴 지연 시간을 줄이기 위해 \`openai/*\` 및 \`openai-codex/*\`에 대해 기본적으로 WebSocket 워밍업을 활성화합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`json5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 워밍업 비활성화</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      agents: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        defaults: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          models: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            &quot;openai/gpt-5.4&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              params: { openaiWsWarmup: false },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  ::: details 빠른 모드</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">OpenClaw는 \`openai/*\` 및 \`openai-codex/*\`에 대해 공유 빠른 모드 토글을 노출합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - **Chat/UI:** \`/fast status|on|off\`</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - **구성:** \`agents.defaults.models[&quot;&lt;provider&gt;/&lt;model&gt;&quot;].params.fastMode\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    활성화되면, OpenClaw는 빠른 모드를 OpenAI priority processing(\`service_tier = &quot;priority&quot;\`)에 매핑합니다. 기존 \`service_tier\` 값은 보존되며, 빠른 모드는 \`reasoning\` 또는 \`text.verbosity\`를 다시 쓰지 않습니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`json5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      agents: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        defaults: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          models: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            &quot;openai/gpt-5.4&quot;: { params: { fastMode: true } },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">세션 재정의는 구성보다 우선합니다. Sessions UI에서 세션 재정의를 제거하면 세션이 구성된 기본값으로 돌아갑니다.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  ::: details Priority processing (service_tier)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">OpenAI의 API는 \`service_tier\`를 통해 priority processing을 노출합니다. OpenClaw에서 모델별로 설정하십시오:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`json5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      agents: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        defaults: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          models: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            &quot;openai/gpt-5.4&quot;: { params: { serviceTier: &quot;priority&quot; } },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    지원 값: \`auto\`, \`default\`, \`flex\`, \`priority\`.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ::: warning</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">\`serviceTier\`는 네이티브 OpenAI 엔드포인트(\`api.openai.com\`)와 네이티브 Codex 엔드포인트(\`chatgpt.com/backend-api\`)에만 전달됩니다. 프로바이더 중 하나를 프록시를 통해 라우팅하는 경우, OpenClaw는 \`service_tier\`를 변경하지 않습니다.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  ::: details 서버 사이드 compaction (Responses API)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">직접 OpenAI Responses 모델(\`api.openai.com\`의 \`openai/*\`)의 경우, OpenAI 플러그인의 Pi 하니스 스트림 래퍼는 서버 사이드 compaction을 자동으로 활성화합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - \`store: true\` 강제(모델 호환성이 \`supportsStore: false\`로 설정되지 않은 경우)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - \`context_management: [{ type: &quot;compaction&quot;, compact_threshold: ... }]\` 주입</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 기본 \`compact_threshold\`: \`contextWindow\`의 70% (또는 사용 불가능한 경우 \`80000\`)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    이는 임베디드 실행에 사용되는 내장 Pi 하니스 경로 및 OpenAI 프로바이더 후크에 적용됩니다. 네이티브 Codex app-server 하니스는 Codex를 통해 자체 context를 관리하며 \`agents.defaults.embeddedHarness.runtime\`으로 별도로 구성됩니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    **명시적으로 활성화**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Azure OpenAI Responses와 같은 호환 엔드포인트에 유용합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        \`\`\`json5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          agents: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            defaults: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              models: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                &quot;azure-openai-responses/gpt-5.5&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  params: { responsesServerCompaction: true },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      **커스텀 임계값**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">�OC_CODE_8�</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          agents: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            defaults: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              models: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                &quot;openai/gpt-5.4&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  params: { responsesServerCompaction: false },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">\`responsesServerCompaction\`은 \`context_management\` 주입만 제어합니다. 직접 OpenAI Responses 모델은 호환성이 \`supportsStore: false\`를 설정하지 않는 한 여전히 \`store: true\`를 강제합니다.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  ::: details 엄격 에이전틱 GPT 모드</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">\`openai/*\`의 GPT-5 계열 실행에 대해, OpenClaw는 더 엄격한 임베디드 실행 계약을 사용할 수 있습니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`json5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      agents: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        defaults: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          embeddedPi: { executionContract: &quot;strict-agentic&quot; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    \`strict-agentic\`을 사용하면, OpenClaw는:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 도구 액션이 사용 가능한 경우 계획만 있는 턴을 더 이상 성공적인 진행으로 취급하지 않음</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - act-now 스티어로 턴을 재시도</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 상당한 작업에 대해 \`update_plan\`을 자동 활성화</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 모델이 액션 없이 계획만 계속하는 경우 명시적인 차단 상태를 표시</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">OpenAI 및 Codex GPT-5 계열 실행에만 범위가 지정됩니다. 다른 프로바이더와 이전 모델 계열은 기본 동작을 유지합니다.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  ::: details 네이티브 vs OpenAI 호환 경로</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">OpenClaw는 직접 OpenAI, Codex, Azure OpenAI 엔드포인트를 일반 OpenAI 호환 \`/v1\` 프록시와 다르게 취급합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    **네이티브 경로** (\`openai/*\`, Azure OpenAI):</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - OpenAI \`none\` effort를 지원하는 모델에 대해서만 \`reasoning: { effort: &quot;none&quot; }\`을 유지</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - \`reasoning.effort: &quot;none&quot;\`을 거부하는 모델 또는 프록시에 대해서는 비활성화된 reasoning을 생략</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 도구 스키마 기본값을 strict 모드로 설정</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 검증된 네이티브 호스트에서만 숨겨진 attribution 헤더 첨부</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - OpenAI 전용 요청 shaping 유지(\`service_tier\`, \`store\`, reasoning 호환성, prompt-cache 힌트)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    **프록시/호환 경로:**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - 더 느슨한 호환 동작 사용</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    - strict 도구 스키마 또는 네이티브 전용 헤더를 강제하지 않음</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    Azure OpenAI는 네이티브 전송 및 호환 동작을 사용하지만 숨겨진 attribution 헤더는 받지 않습니다.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 관련 문서</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&gt; **모델 선택** [→](/concepts/model-providers)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&gt; 프로바이더, 모델 ref, 페일오버 동작 선택.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  &gt; **이미지 생성** [→](/tools/image-generation)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&gt; 공유 이미지 도구 파라미터 및 프로바이더 선택.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  &gt; **비디오 생성** [→](/tools/video-generation)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&gt; 공유 비디오 도구 파라미터 및 프로바이더 선택.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  &gt; **OAuth 및 인증** [→](/gateway/authentication)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&gt; 인증 세부 정보 및 자격 증명 재사용 규칙.</span></span></code></pre></div>`,33)])])}const g=i(l,[["render",h]]);export{E as __pageData,g as default};
