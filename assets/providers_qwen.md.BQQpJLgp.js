import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const c=JSON.parse('{"title":"Qwen","description":"OpenClaw의 번들 qwen 프로바이더를 통해 Qwen Cloud 사용","frontmatter":{"title":"Qwen","description":"OpenClaw의 번들 qwen 프로바이더를 통해 Qwen Cloud 사용"},"headers":[],"relativePath":"providers/qwen.md","filePath":"providers/qwen.md","lastUpdated":null}'),p={name:"providers/qwen.md"};function e(h,s,t,k,E,d){return a(),n("div",null,[...s[0]||(s[0]=[l(`<div class="warning custom-block"><p class="custom-block-title">WARNING</p><p><strong>Qwen OAuth가 제거되었습니다.</strong> <code>portal.qwen.ai</code> 엔드포인트를 사용하던 무료 티어 OAuth 통합 (<code>qwen-portal</code>)은 더 이상 사용할 수 없습니다. 배경은 <a href="https://github.com/openclaw/openclaw/issues/49557" target="_blank" rel="noreferrer">이슈 #49557</a>을 참조해 주십시오.</p></div><p>OpenClaw는 이제 Qwen을 표준 id <code>qwen</code>을 가진 1등급 번들 프로바이더로 취급합니다. 번들 프로바이더는 Qwen Cloud / Alibaba DashScope 및 Coding Plan 엔드포인트를 대상으로 하며, 레거시 <code>modelstudio</code> id는 호환 별칭으로 계속 작동합니다.</p><ul><li>프로바이더: <code>qwen</code></li><li>기본 환경 변수: <code>QWEN_API_KEY</code></li><li>호환용으로도 허용: <code>MODELSTUDIO_API_KEY</code>, <code>DASHSCOPE_API_KEY</code></li><li>API 스타일: OpenAI 호환</li></ul><div class="tip custom-block"><p class="custom-block-title">TIP</p><p><code>qwen3.6-plus</code>를 사용하고 싶다면 <strong>Standard (종량제)</strong> 엔드포인트를 선호해 주십시오. Coding Plan 지원은 공개 카탈로그보다 뒤처질 수 있습니다.</p></div><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><p>플랜 유형을 선택하고 설정 단계를 따라 진행해 주십시오.</p><p><strong>Coding Plan (구독)</strong></p><p><strong>적합한 경우:</strong> Qwen Coding Plan을 통한 구독 기반 액세스.</p><pre><code>1. **API 키 발급**
</code></pre><p><a href="https://home.qwencloud.com/api-keys" target="_blank" rel="noreferrer">home.qwencloud.com/api-keys</a>에서 API 키를 생성하거나 복사해 주십시오.</p><pre><code>  2. **온보딩 실행**
</code></pre><p><strong>글로벌</strong> 엔드포인트의 경우:</p><pre><code>       \`\`\`bash
       openclaw onboard --auth-choice qwen-api-key
       \`\`\`

       **중국** 엔드포인트의 경우:

       \`\`\`bash
       openclaw onboard --auth-choice qwen-api-key-cn
       \`\`\`

  3. **기본 모델 설정**
</code></pre><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;qwen/qwen3.5-plus&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. **모델 사용 가능 여부 확인**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        openclaw models list --provider qwen</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">레거시 \`modelstudio-*\` auth-choice id 및 \`modelstudio/...\` 모델 참조는 여전히</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 호환 별칭으로 작동하지만, 새로운 설정 플로우에서는 표준</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`qwen-*\` auth-choice id 및 \`qwen/...\` 모델 참조를 선호해 주십시오.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**Standard (종량제)**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**적합한 경우:** Standard Model Studio 엔드포인트를 통한 종량제 액세스. Coding Plan에서 사용할 수 없는 \`qwen</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-plus\` 같은 모델 포함.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. **API 키 발급**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">home.qwencloud.com/api-keys</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](https:</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//home.qwencloud.com/api-keys)에서 API 키를 생성하거나 복사해 주십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. **온보딩 실행**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**글로벌** 엔드포인트의 경우:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        openclaw onboard --auth-choice qwen-standard-api-key</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        **중국** 엔드포인트의 경우:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        openclaw onboard --auth-choice qwen-standard-api-key-cn</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. **기본 모델 설정**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;qwen/qwen3.5-plus&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. **모델 사용 가능 여부 확인**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        openclaw models list --provider qwen</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">레거시 \`modelstudio-*\` auth-choice id 및 \`modelstudio/...\` 모델 참조는 여전히</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 호환 별칭으로 작동하지만, 새로운 설정 플로우에서는 표준</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`qwen-*\` auth-choice id 및 \`qwen/...\` 모델 참조를 선호해 주십시오.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 플랜 유형 및 엔드포인트</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 플랜                       | 리전   | 인증 선택                   | 엔드포인트                                       |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| -------------------------- | ------ | -------------------------- | ------------------------------------------------ |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Standard (종량제)          | 중국   | \`qwen-standard-api-key-cn\` | \`dashscope.aliyuncs.com/compatible-mode/v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`      |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Standard (종량제)          | 글로벌 | \`qwen-standard-api-key\`    | \`dashscope-intl.aliyuncs.com/compatible-mode/v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Coding Plan (구독)         | 중국   | \`qwen-api-key-cn\`          | \`coding.dashscope.aliyuncs.com/v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`               |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Coding Plan (구독)         | 글로벌 | \`qwen-api-key\`             | \`coding-intl.dashscope.aliyuncs.com/v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`          |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">프로바이더는 인증 선택에 따라 엔드포인트를 자동으로 선택합니다. 표준 선택은</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`qwen-*\` 패밀리를 사용합니다; \`modelstudio-*\`는 호환 전용으로만 유지됩니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">구성에서 사용자 정의 \`baseUrl\`로 재정의할 수 있습니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: tip</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**키 관리:** [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">home.qwencloud.com/api-keys</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](https:</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//home.qwencloud.com/api-keys) |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**문서:** [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">docs.qwencloud.com</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](https:</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//docs.qwencloud.com/developer-guides/getting-started/introduction)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 내장 카탈로그</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw는 현재 다음의 번들 Qwen 카탈로그를 제공합니다. 구성된 카탈로그는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">엔드포인트를 인식합니다: Coding Plan 구성은 Standard 엔드포인트에서만 작동하는 것으로</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">알려진 모델을 생략합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 모델 참조                   | 입력             | 컨텍스트   | 참고 사항                                           |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| --------------------------- | ---------------- | ---------- | --------------------------------------------------- |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/qwen</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-plus\`         | 텍스트, 이미지    | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | 기본 모델                                            |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/qwen</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-plus\`         | 텍스트, 이미지    | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | 이 모델이 필요한 경우 Standard 엔드포인트를 선호     |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/qwen</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-max</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2026</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1-23</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` | 텍스트           | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">262,144</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   | Qwen Max 라인                                        |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/qwen</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-coder-next\`     | 텍스트           | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">262,144</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   | 코딩                                                  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/qwen</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-coder-plus\`     | 텍스트           | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | 코딩                                                  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/MiniMax-M</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`         | 텍스트           | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,00</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | 추론 활성화                                           |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/glm</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`                | 텍스트           | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">202,752</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   | GLM                                                  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/glm</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`              | 텍스트           | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">202,752</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   | GLM                                                  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`qwen/kimi-k</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`            | 텍스트, 이미지    | </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">262,144</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   | Alibaba를 통한 Moonshot AI                            |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 카탈로그에 모델이 포함되어 있더라도, 엔드포인트 및 청구 플랜에 따라</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">가용성이 달라질 수 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 멀티모달 부가 기능</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`qwen\` 플러그인은 **Standard** DashScope 엔드포인트 (Coding Plan 엔드포인트 아님)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">에서 멀티모달 기능도 제공합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- **비디오 이해**: \`qwen-vl-max-latest\`를 통해</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- **Wan 비디오 생성**: \`wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-t</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\` (기본값), \`wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-i</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\`, \`wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-r</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\`, \`wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-r</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v-flash\`, \`wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-r</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\`를 통해</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Qwen을 기본 비디오 프로바이더로 사용하려면:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   videoGenerationModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;qwen/wan2.6-t2v&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>공유 도구 파라미터, 프로바이더 선택, 페일오버 동작에 대해서는 <a href="/openclaw-docs-ko/tools/video-generation">비디오 생성</a>을 참조해 주십시오.</p></div><h2 id="고급-구성" tabindex="-1">고급 구성 <a class="header-anchor" href="#고급-구성" aria-label="Permalink to &quot;고급 구성&quot;">​</a></h2><details class="details custom-block"><summary>이미지 및 비디오 이해</summary><p>번들 Qwen 플러그인은 <strong>Standard</strong> DashScope 엔드포인트 (Coding Plan 엔드포인트 아님) 에서 이미지와 비디오에 대한 미디어 이해를 등록합니다.</p><pre><code>| 속성          | 값                    |
| ------------- | --------------------- |
| 모델          | \`qwen-vl-max-latest\`  |
| 지원 입력     | 이미지, 비디오         |

미디어 이해는 구성된 Qwen 인증에서 자동으로 해결됩니다 — 추가 구성이
필요하지 않습니다. 미디어 이해 지원을 위해서는 Standard (종량제)
엔드포인트를 사용하고 있는지 확인해 주십시오.
</code></pre></details><details class="details custom-block"><summary>Qwen 3.6 Plus 가용성</summary><p><code>qwen3.6-plus</code>는 Standard (종량제) Model Studio 엔드포인트에서 사용할 수 있습니다:</p><pre><code>- 중국: \`dashscope.aliyuncs.com/compatible-mode/v1\`
- 글로벌: \`dashscope-intl.aliyuncs.com/compatible-mode/v1\`

Coding Plan 엔드포인트가 \`qwen3.6-plus\`에 대해 &quot;unsupported model&quot; 오류를
반환하면 Coding Plan 엔드포인트/키 쌍 대신 Standard (종량제)로
전환해 주십시오.
</code></pre></details><details class="details custom-block"><summary>기능 계획</summary><p><code>qwen</code> 플러그인은 코딩/텍스트 모델만이 아닌 전체 Qwen Cloud 표면을 위한 벤더 홈으로 자리 잡고 있습니다.</p><pre><code>- **텍스트/채팅 모델:** 현재 번들됨
- **도구 호출, 구조화된 출력, 사고:** OpenAI 호환 전송에서 상속됨
- **이미지 생성:** 프로바이더 플러그인 레이어에서 계획됨
- **이미지/비디오 이해:** Standard 엔드포인트에서 현재 번들됨
- **음성/오디오:** 프로바이더 플러그인 레이어에서 계획됨
- **메모리 임베딩/재순위:** 임베딩 어댑터 표면을 통해 계획됨
- **비디오 생성:** 공유 비디오 생성 기능을 통해 현재 번들됨
</code></pre></details><details class="details custom-block"><summary>비디오 생성 세부 사항</summary><p>비디오 생성의 경우 OpenClaw는 작업을 제출하기 전에 구성된 Qwen 리전을 일치하는 DashScope AIGC 호스트에 매핑합니다:</p><pre><code>- 글로벌/국제: \`https://dashscope-intl.aliyuncs.com\`
- 중국: \`https://dashscope.aliyuncs.com\`

이는 Coding Plan 또는 Standard Qwen 호스트 중 하나를 가리키는 일반
\`models.providers.qwen.baseUrl\`도 비디오 생성을 올바른 리전 DashScope 비디오
엔드포인트에 유지한다는 뜻입니다.

현재 번들된 Qwen 비디오 생성 제한:

- 요청당 최대 **1**개 출력 비디오
- 최대 **1**개 입력 이미지
- 최대 **4**개 입력 비디오
- 최대 **10초** 길이
- \`size\`, \`aspectRatio\`, \`resolution\`, \`audio\`, \`watermark\` 지원
- 참조 이미지/비디오 모드는 현재 **원격 http(s) URL**이 필요합니다. DashScope 비디오
  엔드포인트가 해당 참조에 대해 업로드된 로컬 버퍼를 허용하지 않으므로
  로컬 파일 경로는 사전에 거부됩니다.
</code></pre></details><details class="details custom-block"><summary>스트리밍 사용 호환성</summary><p>네이티브 Model Studio 엔드포인트는 공유 <code>openai-completions</code> 전송에서 스트리밍 사용 호환성을 광고합니다. OpenClaw는 이제 엔드포인트 기능을 기반으로 하므로, 동일한 네이티브 호스트를 대상으로 하는 DashScope 호환 커스텀 프로바이더 id가 내장 <code>qwen</code> 프로바이더 id를 특별히 필요로 하는 대신 동일한 스트리밍 사용 동작을 상속합니다.</p><pre><code>네이티브 스트리밍 사용 호환성은 Coding Plan 호스트와 Standard DashScope 호환
호스트 모두에 적용됩니다:

- \`https://coding.dashscope.aliyuncs.com/v1\`
- \`https://coding-intl.dashscope.aliyuncs.com/v1\`
- \`https://dashscope.aliyuncs.com/compatible-mode/v1\`
- \`https://dashscope-intl.aliyuncs.com/compatible-mode/v1\`
</code></pre></details><details class="details custom-block"><summary>멀티모달 엔드포인트 리전</summary><p>멀티모달 표면 (비디오 이해 및 Wan 비디오 생성)은 Coding Plan 엔드포인트가 아닌 <strong>Standard</strong> DashScope 엔드포인트를 사용합니다:</p><pre><code>- 글로벌/국제 Standard 기본 URL: \`https://dashscope-intl.aliyuncs.com/compatible-mode/v1\`
- 중국 Standard 기본 URL: \`https://dashscope.aliyuncs.com/compatible-mode/v1\`
</code></pre></details><details class="details custom-block"><summary>환경 및 데몬 설정</summary><p>Gateway가 데몬 (launchd/systemd)으로 실행되는 경우, 해당 프로세스에서 <code>QWEN_API_KEY</code>를 사용할 수 있는지 확인해 주십시오 (예: <code>~/.openclaw/.env</code> 또는 <code>env.shellEnv</code>를 통해).</p></details><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더, 모델 참조, 페일오버 동작 선택.</p></blockquote><blockquote><p><strong>비디오 생성</strong> <a href="/openclaw-docs-ko/tools/video-generation">→</a> 공유 비디오 도구 파라미터 및 프로바이더 선택.</p></blockquote><blockquote><p><strong>Alibaba (ModelStudio)</strong> <a href="/openclaw-docs-ko/providers/alibaba">→</a> 레거시 ModelStudio 프로바이더 및 마이그레이션 노트.</p></blockquote><blockquote><p><strong>문제 해결</strong> <a href="/openclaw-docs-ko/help/troubleshooting">→</a> 일반 문제 해결 및 FAQ.</p></blockquote>`,28)])])}const o=i(p,[["render",e]]);export{c as __pageData,o as default};
