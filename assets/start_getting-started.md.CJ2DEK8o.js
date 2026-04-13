import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const g=JSON.parse('{"title":"시작하기","description":"OpenClaw를 설치하고 몇 분 안에 첫 번째 채팅을 시작하십시오.","frontmatter":{"title":"시작하기","description":"OpenClaw를 설치하고 몇 분 안에 첫 번째 채팅을 시작하십시오."},"headers":[],"relativePath":"start/getting-started.md","filePath":"start/getting-started.md","lastUpdated":null}'),p={name:"start/getting-started.md"};function h(k,s,t,F,e,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h1><p>OpenClaw를 설치하고, 온보딩을 실행하고, AI 어시스턴트와 채팅하십시오 — 약 5분 내에 완료됩니다. 완료되면 실행 중인 Gateway, 구성된 인증, 그리고 작동하는 채팅 세션이 준비됩니다.</p><h2 id="필요한-것" tabindex="-1">필요한 것 <a class="header-anchor" href="#필요한-것" aria-label="Permalink to &quot;필요한 것&quot;">​</a></h2><ul><li><strong>Node.js</strong> — Node 24 권장 (Node 22.14+ 도 지원)</li><li>모델 프로바이더(Anthropic, OpenAI, Google 등)의 <strong>API 키</strong> — 온보딩 시 입력을 요청합니다</li></ul><div class="tip custom-block"><p class="custom-block-title">TIP</p><p><code>node --version</code>으로 Node 버전을 확인하십시오. <strong>Windows 사용자:</strong> 네이티브 Windows와 WSL2 모두 지원됩니다. WSL2가 더 안정적이며 전체 기능 사용에 권장됩니다. <a href="/openclaw-docs-ko/platforms/windows">Windows</a>를 참조하십시오. Node를 설치해야 하는 경우 <a href="/openclaw-docs-ko/install/node">Node 설정</a>을 참조하십시오.</p></div><h2 id="빠른-설정" tabindex="-1">빠른 설정 <a class="header-anchor" href="#빠른-설정" aria-label="Permalink to &quot;빠른 설정&quot;">​</a></h2><ol><li><p><strong>OpenClaw 설치</strong></p><p><strong>macOS / Linux</strong></p></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">           curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -fsSL</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://openclaw.ai/install.sh</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> bash</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">           &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">img</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     src</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/assets/install-script.svg&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     alt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Install Script Process&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     className</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rounded-lg&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   /</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&gt;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         **Windows</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> (PowerShell)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">powershell</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">           iwr</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -useb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://openclaw.ai/install.ps1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> iex</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">       :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   기타</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설치 방법 (Docker, Nix, npm): [설치](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">).</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   :::</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">온보딩 실행</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --install-daemon</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       마법사가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델 프로바이더 선택, API 키 설정, Gateway 구성 과정을 안내합니다. 약 2분 소요됩니다.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       전체</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 참조는 [온보딩 (CLI)](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/start/wizard</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)을 참조하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Gateway 실행 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gateway</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> status</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       Gateway가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 포트 18789에서 수신 대기 중인 것을 확인할 수 있습니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  4.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">대시보드 열기</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dashboard</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       브라우저에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Control UI를 엽니다. 로딩되면 모든 것이 정상적으로 작동하는 것입니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  5.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">첫 번째 메시지 보내기</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   Control</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> UI 채팅창에 메시지를 입력하면 AI 응답을 받을 수 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       대신</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 휴대폰에서 채팅하고 싶으신가요? 가장 빠르게 설정할 수 있는 채널은</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       [Telegram](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/channels/telegram</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">입니다</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> (봇 토큰만 필요). 모든 옵션은 [채널](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/channels/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)을 참조하십시오.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> details 고급: 맞춤형 Control UI 빌드 마운트</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">현지화되거나</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 맞춤 설정된 대시보드 빌드를 유지하는 경우,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gateway.controlUi.root</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 빌드된 정적 에셋과 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">index.html</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 포함된 디렉토리로 지정하십시오.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">�OC_CODE_1�</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">그런</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 다음 설정:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">�OC_CODE_2�</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">게이트웨이를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 재시작하고 대시보드를 다시 여십시오:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">�OC_CODE_3�</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 다음에 할 것</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">채널 연결</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [→](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/channels/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Discord, Feishu, iMessage, Matrix, Microsoft Teams, Signal, Slack, Telegram, WhatsApp, Zalo 등.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  &gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> **페어링</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 및 보안</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [→](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/channels/pairing</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 에이전트에게 메시지를 보낼 수 있는 사람을 제어합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  &gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> **Gateway</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 구성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [→](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/gateway/configuration</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델, 도구, 샌드박스 및 고급 설정.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  &gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> **도구</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 탐색</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [→](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/tools/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 브라우저, 실행, 웹 검색, 스킬 및 플러그인.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> details 고급: 환경 변수</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">서비스</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 계정으로 OpenClaw를 실행하거나 사용자 지정 경로를 원하는 경우:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENCLAW_HOME</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">—</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 내부 경로 확인을 위한 홈 디렉토리</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENCLAW_STATE_DIR</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">—</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 상태 디렉토리 재정의</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENCLAW_CONFIG_PATH</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">—</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 구성 파일 경로 재정의</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">전체</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 참조: [환경 변수](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/help/environment</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">).</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span></code></pre></div>`,8)])])}const C=i(p,[["render",h]]);export{g as __pageData,C as default};
