import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const d=JSON.parse('{"title":"xAI","description":"OpenClaw에서 xAI Grok 모델 사용","frontmatter":{"title":"xAI","description":"OpenClaw에서 xAI Grok 모델 사용"},"headers":[],"relativePath":"providers/xai.md","filePath":"providers/xai.md","lastUpdated":null}'),p={name:"providers/xai.md"};function k(h,s,E,t,e,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<p>OpenClaw는 Grok 모델용 번들 <code>xai</code> 프로바이더 플러그인을 제공합니다.</p><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><ol><li><p><strong>API 키 생성</strong></p><p><a href="https://console.x.ai/" target="_blank" rel="noreferrer">xAI 콘솔</a>에서 API 키를 생성하십시오.</p></li><li><p><strong>API 키 설정</strong></p></li></ol><p><code>XAI_API_KEY</code>를 설정하거나 다음을 실행하십시오:</p><pre><code>   \`\`\`bash
   openclaw onboard --auth-choice xai-api-key
   \`\`\`
</code></pre><ol start="3"><li><strong>모델 선택</strong></li></ol><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai/grok-4&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } } },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw는 번들 xAI transport로 xAI Responses API를 사용합니다. 동일한</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`XAI_API_KEY\`는 Grok 기반 \`web_search\`, 일급 \`x_search\`,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">그리고 원격 \`code_execution\`에도 사용될 수 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xAI 키를 \`plugins.entries.xai.config.webSearch.apiKey\` 아래에 저장하면</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 xAI 모델 프로바이더가 해당 키를 fallback으로도 재사용합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`code_execution\` 튜닝은 \`plugins.entries.xai.config.codeExecution\` 아래에 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 내장 카탈로그</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw에는 기본으로 다음 xAI 모델 제품군이 포함됩니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 제품군         | Model ID                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| -------------- | ------------------------------------------------------------------------ |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Grok </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-mini\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-mini-fast\`               |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Grok </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">709</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`                                                  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Grok </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Fast    | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast-non-reasoning\`                               |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Grok </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4.1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Fast  | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast-non-reasoning\`                           |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Grok </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Beta | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-beta-latest-reasoning\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-beta-latest-non-reasoning\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Grok Code      | \`grok-code-fast</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`                                                       |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">플러그인은 동일한 API 형태를 따르는 경우 신규 \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">*\` 및 \`grok-code-fast*\` ID도</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">forward-resolve 처리합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: tip</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`, \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`, 그리고 \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-beta-*\` 변형은</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 카탈로그에서 현재 이미지 지원 가능한 Grok 참조입니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## OpenClaw 기능 지원 범위</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 플러그인은 xAI의 현재 공개 API 표면을 OpenClaw의 공유</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">프로바이더 및 툴 계약에 매핑합니다. 공유 계약에 맞지 않는 기능</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(예: streaming TTS 및 realtime voice)은 노출되지 않습니다. 아래 표를</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">참조하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| xAI 기능                    | OpenClaw 표면                               | 상태                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| --------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Chat / Responses            | \`xai/&lt;model&gt;\` 모델 프로바이더               | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 서버 측 web search          | \`web_search\` 프로바이더 \`grok\`              | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 서버 측 X 검색              | \`x_search\` 툴                               | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 서버 측 코드 실행           | \`code_execution\` 툴                         | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 이미지                      | \`image_generate\`                            | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 비디오                      | \`video_generate\`                            | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 배치 text-to-speech         | \`messages.tts.provider: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` / \`tts\`      | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Streaming TTS               | —                                           | 미노출; OpenClaw의 TTS 계약은 완전한 audio buffer를 반환함            |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 배치 speech-to-text         | \`tools.media.audio\` / 미디어 이해           | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Streaming speech-to-text    | Voice Call \`streaming.provider: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`      | 지원                                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Realtime voice              | —                                           | 아직 미노출; 다른 session/WebSocket 계약 필요                         |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Files / batches             | 제네릭 모델 API 호환성만 해당               | 일급 OpenClaw 툴 아님                                                |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw는 미디어 생성, 음성, 배치 전사에 xAI의 REST image/video/TTS/STT API를,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">실시간 음성 통화 전사에 xAI의 streaming STT WebSocket을, 그리고 모델, 검색,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">code-execution 툴에 Responses API를 사용합니다. Realtime voice session처럼</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">다른 OpenClaw 계약이 필요한 기능은 숨겨진 플러그인 동작이 아니라</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">upstream 기능으로 여기에 문서화되어 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### Fast-mode 매핑</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`/fast on\` 또는 \`agents.defaults.models[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai/&lt;model&gt;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">].params.fastMode: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">네이티브 xAI 요청을 다음과 같이 재작성합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Source model  | Fast-mode 대상     |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| ------------- | ------------------ |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`      | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`      |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-mini\` | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-mini-fast\` |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`      | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`      |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">709</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`      |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### 레거시 호환성 별칭</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">레거시 별칭은 여전히 정규 번들 ID로 정규화됩니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 레거시 별칭               | 정규 ID                               |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| ------------------------- | ------------------------------------- |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast-reasoning\`   | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`                         |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast-reasoning\` | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`                       |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-reasoning\`     | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-beta-latest-reasoning\`     |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-non-reasoning\` | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-beta-latest-non-reasoning\` |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 기능</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details Web search</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`grok\` web-search 프로바이더도 \`XAI_API_KEY\`를 사용합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> openclaw config set tools.web.search.provider grok</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details 비디오 생성</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`xai\` 플러그인은 공유 \`video_generate\` 툴을 통해 비디오 생성을</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 기본 비디오 모델: \`xai/grok-imagine-video\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 모드: text-to-video, image-to-video, 원격 비디오 편집, 원격 비디오</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   확장</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 종횡비: \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 해상도: \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">480</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">P\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">720</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">P\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 길이: 생성/image-to-video는 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1-15</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">초, 확장은 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2-10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">초</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: warning</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">로컬 비디오 버퍼는 허용되지 않습니다. 비디오 편집/확장 입력에는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 원격 \`http(s)\` URL을 사용하십시오. Image-to-video는 OpenClaw가 이를</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> xAI에 대한 data URL로 인코딩할 수 있으므로 로컬 이미지 버퍼를 허용합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> xAI를 기본 비디오 프로바이더로 사용하려면:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       videoGenerationModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai/grok-imagine-video&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">공유 툴 파라미터, 프로바이더 선택, failover 동작은 [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">비디오</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> 생성</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](/tools/video-generation)을</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 참조하십시오.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details 이미지 생성</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`xai\` 플러그인은 공유 \`image_generate\` 툴을 통해 이미지 생성을</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 기본 이미지 모델: \`xai/grok-imagine-image\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 추가 모델: \`xai/grok-imagine-image-pro\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 모드: text-to-image 및 reference-image 편집</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 레퍼런스 입력: \`image\` 하나 또는 최대 다섯 개의 \`images\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 종횡비: \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 해상도: \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">K\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">K\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 개수: 최대 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">장</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OpenClaw는 생성된 미디어가 일반 채널 첨부 경로를 통해 저장되고 전달될 수</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 있도록 xAI에 \`b</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">_json\` 이미지 응답을 요청합니다. 로컬 레퍼런스 이미지는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data URL로 변환되며, 원격 \`http(s)\` 레퍼런스는 그대로 전달됩니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> xAI를 기본 이미지 프로바이더로 사용하려면:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       imageGenerationModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai/grok-imagine-image&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xAI는 \`quality\`, \`mask\`, \`user\`, 그리고 \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`와 같은</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 추가 네이티브 종횡비도 문서화합니다. OpenClaw는 현재 공유 크로스-프로바이더</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 이미지 컨트롤만 전달합니다. 지원되지 않는 네이티브 전용 옵션은 의도적으로</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`image_generate\`를 통해 노출되지 않습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details Text-to-speech</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`xai\` 플러그인은 공유 \`tts\` 프로바이더 표면을 통해 text-to-speech를</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 보이스: \`eve\`, \`ara\`, \`rex\`, \`sal\`, \`leo\`, \`una\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 기본 보이스: \`eve\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 포맷: \`mp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`, \`wav\`, \`pcm\`, \`mulaw\`, \`alaw\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 언어: BCP</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-47</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 코드 또는 \`auto\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 속도: 프로바이더 네이티브 속도 재정의</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 네이티브 Opus voice-note 포맷은 지원되지 않음</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> xAI를 기본 TTS 프로바이더로 사용하려면:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   messages</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     tts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       providers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         xai</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           voiceId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;eve&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw는 xAI의 배치 \`/v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/tts\` 엔드포인트를 사용합니다. xAI는 WebSocket을</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 통한 streaming TTS도 제공하지만, OpenClaw speech 프로바이더 계약은 현재</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 응답 전달 전에 완전한 audio buffer를 기대합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details Speech-to-text</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`xai\` 플러그인은 OpenClaw의 미디어 이해 전사 표면을 통해 배치</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> speech-to-text를 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 기본 모델: \`grok-stt\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 엔드포인트: xAI REST \`/v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/stt\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 입력 경로: multipart 오디오 파일 업로드</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - Discord 음성 채널 세그먼트 및 채널 오디오 첨부를 포함하여</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   인바운드 오디오 전사에 \`tools.media.audio\`를 사용하는 곳 어디서나</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   OpenClaw에서 지원</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 인바운드 오디오 전사에 xAI를 강제로 사용하려면:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   tools</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     media</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       audio</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;provider&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;grok-stt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 언어는 공유 오디오 미디어 구성 또는 호출별 전사 요청을 통해 제공될 수</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 있습니다. 프롬프트 힌트는 공유 OpenClaw 표면에서 허용되지만, xAI REST STT</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 통합은 file, model, language만 전달합니다. 이는 현재 공개 xAI 엔드포인트에</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 깔끔하게 매핑되기 때문입니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details Streaming speech-to-text</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`xai\` 플러그인은 또한 실시간 음성 통화 오디오에 대한 realtime 전사</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 프로바이더를 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 엔드포인트: xAI WebSocket \`wss:</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//api.x.ai/v1/stt\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 기본 인코딩: \`mulaw\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 기본 샘플 레이트: \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 기본 endpointing: \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">800</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ms\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 중간 전사: 기본적으로 활성화</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Voice Call의 Twilio 미디어 스트림은 G</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.711</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> µ-law 오디오 프레임을 전송하므로,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> xAI 프로바이더는 transcoding 없이 해당 프레임을 직접 전달할 수 있습니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     entries</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       &quot;voice-call&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           streaming</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             providers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">               xai</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                 apiKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;\${XAI_API_KEY}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                 endpointingMs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">800</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                 language</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;en&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">               },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">             },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 프로바이더 소유 구성은</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`plugins.entries.voice-call.config.streaming.providers.xai\` 아래에 있습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 지원되는 키는 \`apiKey\`, \`baseUrl\`, \`sampleRate\`, \`encoding\` (\`pcm\`, \`mulaw\`,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 또는 \`alaw\`), \`interimResults\`, \`endpointingMs\`, \`language\`입니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">이 streaming 프로바이더는 Voice Call의 realtime 전사 경로를 위한 것입니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Discord 음성은 현재 짧은 세그먼트를 녹음하고 대신 배치 \`tools.media.audio\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 전사 경로를 사용합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details x_search 구성</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 xAI 플러그인은 Grok을 통해 X (구 Twitter) 콘텐츠를 검색하기 위한</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OpenClaw 툴로 \`x_search\`를 노출합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 구성 경로: \`plugins.entries.xai.config.xSearch\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | 키                 | 타입    | 기본값             | 설명                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | ------------------ | ------- | ------------------ | ------------------------------------ |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`enabled\`          | boolean | —                  | x_search 활성화 또는 비활성화        |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`model\`            | string  | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`    | x_search 요청에 사용되는 모델        |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`inlineCitations\`  | boolean | —                  | 결과에 인라인 인용 포함              |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`maxTurns\`         | number  | —                  | 최대 대화 턴 수                      |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`timeoutSeconds\`   | number  | —                  | 요청 타임아웃 (초)                   |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`cacheTtlMinutes\`  | number  | —                  | 캐시 TTL (분)                        |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     entries</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       xai</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           xSearch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;grok-4-1-fast&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             inlineCitations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details Code execution 구성</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 xAI 플러그인은 xAI의 샌드박스 환경에서 원격 코드 실행을 위한</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OpenClaw 툴로 \`code_execution\`을 노출합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 구성 경로: \`plugins.entries.xai.config.codeExecution\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | 키                | 타입    | 기본값                       | 설명                                      |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | ----------------- | ------- | ---------------------------- | ----------------------------------------- |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`enabled\`         | boolean | \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\` (키 사용 가능 시)     | 코드 실행 활성화 또는 비활성화            |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`model\`           | string  | \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4-1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-fast\`              | 코드 실행 요청에 사용되는 모델            |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`maxTurns\`        | number  | —                            | 최대 대화 턴 수                           |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> | \`timeoutSeconds\`  | number  | —                            | 요청 타임아웃 (초)                        |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">이는 원격 xAI 샌드박스 실행이며, 로컬 [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">\`exec\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](/tools/exec)이 아닙니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`json</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     entries</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       xai</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           codeExecution</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;grok-4-1-fast&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details 알려진 제한 사항</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- 현재 인증은 API 키 전용입니다. OpenClaw에는 아직 xAI OAuth나</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   device-code flow가 없습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - \`grok</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-4.20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-multi-agent-experimental-beta-0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">304</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`은 표준 OpenClaw xAI</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   transport와 다른 upstream API 표면을 필요로 하므로 일반 xAI 프로바이더</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   경로에서 지원되지 않습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - xAI Realtime voice는 아직 OpenClaw 프로바이더로 등록되지 않았습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   배치 STT 또는 streaming 전사와 다른 양방향 voice session 계약이 필요합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - xAI 이미지 \`quality\`, 이미지 \`mask\`, 추가 네이티브 전용 종횡비는</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   공유 \`image_generate\` 툴이 대응하는 크로스-프로바이더 컨트롤을 가질</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   때까지 노출되지 않습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details 고급 참고 사항</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- OpenClaw는 공유 runner 경로에서 xAI 고유의 tool-schema 및 tool-call 호환성</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   수정을 자동으로 적용합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 네이티브 xAI 요청은 기본적으로 \`tool_stream: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`입니다. 비활성화하려면</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   \`agents.defaults.models[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xai/&lt;model&gt;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">].params.tool_stream\`을 \`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`로</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   설정하십시오.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 번들 xAI 래퍼는 네이티브 xAI 요청을 보내기 전에 지원되지 않는 strict</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   tool-schema 플래그와 reasoning payload 키를 제거합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - \`web_search\`, \`x_search\`, \`code_execution\`은 OpenClaw 툴로 노출됩니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   OpenClaw는 모든 채팅 턴에 모든 네이티브 툴을 연결하는 대신 각 툴 요청</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   내에서 필요한 특정 xAI 내장 기능을 활성화합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - \`x_search\`와 \`code_execution\`은 핵심 모델 runtime에 하드코딩되지 않고</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   번들 xAI 플러그인이 소유합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - \`code_execution\`은 원격 xAI 샌드박스 실행이며, 로컬 [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">\`exec\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](/tools/exec)이</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   아닙니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 라이브 테스트</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xAI 미디어 경로는 단위 테스트와 opt-in 라이브 스위트로 커버됩니다. 라이브</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">명령은 \`XAI_API_KEY\`를 확인하기 전에 \`~/.profile\`을 포함한 로그인 셸에서</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">secrets를 로드합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pnpm test extensions/xai</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OPENCLAW_LIVE_TEST=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OPENCLAW_LIVE_TEST_QUIET=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pnpm test:live -- extensions/xai/xai.live.test.ts</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OPENCLAW_LIVE_TEST=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OPENCLAW_LIVE_TEST_QUIET=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OPENCLAW_LIVE_IMAGE_GENERATION_PROVIDERS=xai pnpm test:live -- test/image-generation.runtime.live.test.ts</span></span></code></pre></div><p>프로바이더별 라이브 파일은 일반 TTS, 전화 친화적 PCM TTS를 합성하고, xAI 배치 STT를 통해 오디오를 전사하며, 동일 PCM을 xAI realtime STT를 통해 스트리밍하고, text-to-image 출력을 생성하고, 레퍼런스 이미지를 편집합니다. 공유 이미지 라이브 파일은 OpenClaw의 runtime 선택, fallback, 정규화, 미디어 첨부 경로를 통해 동일한 xAI 프로바이더를 검증합니다.</p><h2 id="관련-항목" tabindex="-1">관련 항목 <a class="header-anchor" href="#관련-항목" aria-label="Permalink to &quot;관련 항목&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더, 모델 참조, failover 동작 선택.</p></blockquote><blockquote><p><strong>비디오 생성</strong> <a href="/openclaw-docs-ko/tools/video-generation">→</a> 공유 비디오 툴 파라미터 및 프로바이더 선택.</p></blockquote><blockquote><p><strong>모든 프로바이더</strong> <a href="/openclaw-docs-ko/providers/">→</a> 보다 폭넓은 프로바이더 개요.</p></blockquote><blockquote><p><strong>문제 해결</strong> <a href="/openclaw-docs-ko/help/troubleshooting">→</a> 일반적인 문제와 해결책.</p></blockquote>`,13)])])}const y=i(p,[["render",k]]);export{d as __pageData,y as default};
