import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const o=JSON.parse('{"title":"Ollama","description":"Ollama(클라우드 및 로컬 모델)로 OpenClaw 실행","frontmatter":{"title":"Ollama","description":"Ollama(클라우드 및 로컬 모델)로 OpenClaw 실행"},"headers":[],"relativePath":"providers/ollama.md","filePath":"providers/ollama.md","lastUpdated":null}'),p={name:"providers/ollama.md"};function h(k,s,t,e,F,d){return a(),n("div",null,[...s[0]||(s[0]=[l(`<p>OpenClaw는 Ollama의 네이티브 API(<code>/api/chat</code>)와 통합되어 호스팅 클라우드 모델과 로컬/셀프 호스팅 Ollama 서버를 지원합니다. Ollama는 세 가지 모드로 사용할 수 있습니다: 접근 가능한 Ollama 호스트를 통한 <code>Cloud + Local</code>, <code>https://ollama.com</code>을 사용하는 <code>Cloud only</code>, 또는 접근 가능한 Ollama 호스트를 사용하는 <code>Local only</code>.</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p><strong>원격 Ollama 사용자</strong>: OpenClaw와 함께 <code>/v1</code> OpenAI 호환 URL(<code>http://host:11434/v1</code>)을 사용하지 마세요. 이는 도구 호출(tool calling)을 깨뜨리며, 모델이 원시 도구 JSON을 평문으로 출력할 수 있습니다. 대신 네이티브 Ollama API URL을 사용하세요: <code>baseUrl: &quot;http://host:11434&quot;</code> (<code>/v1</code> 없이).</p></div><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><p>선호하는 설정 방식과 모드를 선택하세요.</p><p><strong>온보딩 (권장)</strong></p><p><strong>적합한 경우:</strong> Ollama 클라우드 또는 로컬 설정을 가장 빠르게 시작하고 싶은 경우.</p><pre><code>1. **온보딩 실행**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        Provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 목록에서 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Ollama</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">를 선택하세요.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모드 선택</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud + Local</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> — 로컬 Ollama 호스트에 해당 호스트를 통해 라우팅되는 클라우드 모델 결합</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud only</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> — \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://ollama.com</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 통한 호스팅 Ollama 모델</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Local only</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> — 로컬 모델만 사용</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 선택</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> only\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OLLAMA_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 요청하고 호스팅 클라우드 기본값을 제안합니다. \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> +</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Local\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">및</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Local</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> only\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Ollama 베이스 URL을 요청하고, 사용 가능한 모델을 탐색하며, 아직 없는 경우 선택한 로컬 모델을 자동으로 풀합니다. \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> +</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Local\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">은</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 해당 Ollama 호스트가 클라우드 접근을 위해 로그인되어 있는지도 확인합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   4.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 사용 가능 여부 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ollama</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> ### 비대화형 모드</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --non-interactive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ollama</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   --accept-risk</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 선택적으로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 커스텀 베이스 URL 또는 모델을 지정할 수 있습니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --non-interactive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ollama</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   --custom-base-url</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;http://ollama-host:11434&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   --custom-model-id</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;qwen3.5:27b&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">   --accept-risk</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">**수동</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">적합한 경우:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 클라우드 또는 로컬 설정을 완전히 제어하고 싶은 경우.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">클라우드 또는 로컬 선택</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud + Local</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">: Ollama를 설치하고, \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> signin\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">으로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 로그인한 후, 해당 호스트를 통해 클라우드 요청을 라우팅합니다</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud only</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">: \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OLLAMA_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">와</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 함께 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://ollama.com</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용합니다</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Local only</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">: [ollama.com/download](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://ollama.com/download</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)에서 Ollama 설치</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">로컬 모델 풀 (로컬 전용)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gemma4</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 또는</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gpt-oss:20b</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 또는</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> llama3.3</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">OpenClaw에서 Ollama 활성화</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> only\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">의</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 경우 실제 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OLLAMA_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하세요. 호스트 기반 설정의 경우 어떤 placeholder 값도 동작합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 클라우드</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OLLAMA_API_KEY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;your-ollama-api-key&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 로컬 전용</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OLLAMA_API_KEY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ollama-local&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 또는 설정 파일에서 구성</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models.providers.ollama.apiKey</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;OLLAMA_API_KEY&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   4.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 검사 및 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ollama/gemma4</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정 파일에서 기본값을 지정:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">              model:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;ollama/gemma4&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 클라우드 모델</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud + Local</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> +</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Local\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">은</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 접근 가능한 Ollama 호스트를 로컬 및 클라우드 모델 모두의 제어 지점으로 사용합니다. 이는 Ollama의 권장 하이브리드 플로우입니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 설정</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 중 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud + Local</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">을 사용하세요. OpenClaw는 Ollama 베이스 URL을 요청하고, 해당 호스트에서 로컬 모델을 탐색하며, 호스트가 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> signin\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">으로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 클라우드 접근을 위해 로그인되어 있는지 확인합니다. 호스트가 로그인되어 있는 경우, OpenClaw는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kimi-k2.5:cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">minimax-m2.7:cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">glm-5.1:cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">같은</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 호스팅 클라우드 기본값도 제안합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 호스트가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 아직 로그인되어 있지 않다면, OpenClaw는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> signin\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 실행할 때까지 설정을 로컬 전용으로 유지합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud only</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Cloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> only\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://ollama.com</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">의</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Ollama 호스팅 API에 대해 실행됩니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 설정</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 중 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Cloud only</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">를 사용하세요. OpenClaw는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OLLAMA_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 요청하고, \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">baseUrl:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;https://ollama.com&quot;\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정한 후, 호스팅 클라우드 모델 목록을 시드합니다. 이 경로는 로컬 Ollama 서버나 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> signin\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">이</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">필요하지 않습니다</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">중에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 표시되는 클라우드 모델 목록은 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://ollama.com/api/tags</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 라이브로 채워지며 최대 500개 항목으로 제한됩니다. 따라서 피커는 정적 시드가 아닌 현재 호스팅 카탈로그를 반영합니다. 설정 시점에 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama.com</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 접근할 수 없거나 모델이 반환되지 않으면, OpenClaw는 이전의 하드코딩된 제안으로 폴백하여 온보딩이 완료되도록 합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Local only</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">로컬</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 전용 모드에서, OpenClaw는 설정된 Ollama 인스턴스에서 모델을 탐색합니다. 이 경로는 로컬 또는 셀프 호스팅 Ollama 서버를 위한 것입니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OpenClaw는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 현재 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gemma4</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 로컬 기본값으로 제안합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 모델 탐색 (암묵적 Provider)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OLLAMA_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 인증 프로필)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정하고 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models.providers.ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 정의하지 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">않은</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 경우, OpenClaw는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">http://127.0.0.1:11434</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">의</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 로컬 Ollama 인스턴스에서 모델을 탐색합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 동작</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                 |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 세부</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사항                                                                                                                                                             </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> --------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ---------------------------------------------------------------------------------------------------------------------------------------------------------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 카탈로그</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 쿼리        </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/api/tags</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 쿼리합니다                                                                                                                                              </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 기능</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 감지            </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> best-effort</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/api/show</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">조회를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하여 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contextWindow</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 읽고 기능(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">비전</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 포함)을 감지합니다                                                                           </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 비전</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델            </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/api/show</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">vision</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">기능을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 보고한 모델은 이미지 처리 가능(\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [&quot;text&quot;, &quot;image&quot;]\`)으로 표시되어, OpenClaw가 자동으로 이미지를 프롬프트에 주입합니다           </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 추론</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 감지            </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 모델</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 이름 휴리스틱(\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">r1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">reasoning</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">think</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`)으로 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">reasoning</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 표시합니다                                                                                           </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 토큰</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 제한            </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">maxTokens</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OpenClaw에서 사용하는 기본 Ollama 최대 토큰 상한으로 설정합니다                                                                                         </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 비용</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                 |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 모든</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 비용을 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">으로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정합니다                                                                                                                                        </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">이는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 로컬 Ollama 인스턴스와 카탈로그를 일치시키면서 수동 모델 입력을 피하게 해줍니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 사용 가능한 모델 확인</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span></code></pre></div><p>새 모델을 추가하려면 Ollama로 풀하기만 하면 됩니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mistral</span></span></code></pre></div><p>새로운 모델은 자동으로 탐색되어 사용할 수 있게 됩니다.</p><div class="info custom-block"><p class="custom-block-title">NOTE</p><p><code>models.providers.ollama</code>를 명시적으로 설정하면 자동 탐색이 건너뛰어지며 모델을 수동으로 정의해야 합니다. 아래의 명시적 설정 섹션을 참고하세요.</p></div><h2 id="비전-및-이미지-설명" tabindex="-1">비전 및 이미지 설명 <a class="header-anchor" href="#비전-및-이미지-설명" aria-label="Permalink to &quot;비전 및 이미지 설명&quot;">​</a></h2><p>번들된 Ollama 플러그인은 Ollama를 이미지 처리 가능한 미디어 이해 Provider로 등록합니다. 이를 통해 OpenClaw는 명시적인 이미지 설명 요청과 설정된 이미지 모델 기본값을 로컬 또는 호스팅 Ollama 비전 모델을 통해 라우팅할 수 있습니다.</p><p>로컬 비전을 위해 이미지를 지원하는 모델을 풀하세요:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ollama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> qwen2.5vl:7b</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OLLAMA_API_KEY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ollama-local&quot;</span></span></code></pre></div><p>그런 다음 infer CLI로 확인하세요:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> infer</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> image</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> describe</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --file</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ./photo.jpg</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --model</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ollama/qwen2.5vl:7b</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --json</span></span></code></pre></div><p><code>--model</code>은 전체 <code>&lt;provider/model&gt;</code> 참조여야 합니다. 이 값이 설정되면, <code>openclaw infer image describe</code>는 모델이 네이티브 비전을 지원한다는 이유로 설명을 건너뛰는 대신 해당 모델을 직접 실행합니다.</p><p>Ollama를 수신 미디어에 대한 기본 이미지 이해 모델로 지정하려면, <code>agents.defaults.imageModel</code>을 설정하세요:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      imageModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ollama/qwen2.5vl:7b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>models.providers.ollama.models</code>를 수동으로 정의하는 경우, 비전 모델을 이미지 입력 지원으로 표시하세요:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;qwen2.5vl:7b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;qwen2.5vl:7b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;image&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  contextWindow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">128000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  maxTokens</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8192</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>OpenClaw는 이미지 처리 가능으로 표시되지 않은 모델에 대한 이미지 설명 요청을 거부합니다. 암묵적 탐색에서는 <code>/api/show</code>가 비전 기능을 보고할 때 OpenClaw가 Ollama에서 이 값을 읽어옵니다.</p><h2 id="설정" tabindex="-1">설정 <a class="header-anchor" href="#설정" aria-label="Permalink to &quot;설정&quot;">​</a></h2><p><strong>기본 (암묵적 탐색)</strong></p><p>가장 간단한 로컬 전용 활성화 경로는 환경 변수를 사용하는 것입니다:</p><pre><code>\`\`\`bash
export OLLAMA_API_KEY=&quot;ollama-local&quot;
\`\`\`

::: tip
</code></pre><p><code>OLLAMA_API_KEY</code>가 설정되어 있으면, Provider 항목에서 <code>apiKey</code>를 생략할 수 있으며 OpenClaw가 가용성 검사를 위해 이를 채워줍니다. :::</p><p><strong>명시적 (수동 모델)</strong></p><p>다음의 경우 명시적 설정을 사용하세요: 호스팅 클라우드 설정을 원할 때, Ollama가 다른 호스트/포트에서 실행될 때, 특정 컨텍스트 윈도우나 모델 목록을 강제하고 싶을 때, 또는 완전한 수동 모델 정의를 원할 때.</p><pre><code>\`\`\`json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: &quot;https://ollama.com&quot;,
        apiKey: &quot;OLLAMA_API_KEY&quot;,
        api: &quot;ollama&quot;,
        models: [
          {
            id: &quot;kimi-k2.5:cloud&quot;,
            name: &quot;kimi-k2.5:cloud&quot;,
            reasoning: false,
            input: [&quot;text&quot;, &quot;image&quot;],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
\`\`\`
</code></pre><p><strong>커스텀 베이스 URL</strong></p><p>Ollama가 다른 호스트나 포트에서 실행되는 경우(명시적 설정은 자동 탐색을 비활성화하므로 모델을 수동으로 정의하세요):</p><pre><code>\`\`\`json5
{
  models: {
    providers: {
      ollama: {
        apiKey: &quot;ollama-local&quot;,
        baseUrl: &quot;http://ollama-host:11434&quot;, // /v1 없이 - 네이티브 Ollama API URL을 사용
        api: &quot;ollama&quot;, // 네이티브 도구 호출 동작을 보장하기 위해 명시적으로 설정
      },
    },
  },
}
\`\`\`

::: warning
</code></pre><p>URL에 <code>/v1</code>을 추가하지 마세요. <code>/v1</code> 경로는 OpenAI 호환 모드를 사용하며, 이 모드에서는 도구 호출이 신뢰할 수 없습니다. 경로 접미사 없이 기본 Ollama URL을 사용하세요. :::</p><h3 id="모델-선택" tabindex="-1">모델 선택 <a class="header-anchor" href="#모델-선택" aria-label="Permalink to &quot;모델 선택&quot;">​</a></h3><p>설정이 완료되면, 모든 Ollama 모델이 사용 가능합니다:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ollama/gpt-oss:20b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        fallbacks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ollama/llama3.3&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ollama/qwen2.5-coder:32b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="ollama-웹-검색" tabindex="-1">Ollama 웹 검색 <a class="header-anchor" href="#ollama-웹-검색" aria-label="Permalink to &quot;Ollama 웹 검색&quot;">​</a></h2><p>OpenClaw는 번들된 <code>web_search</code> Provider로 <strong>Ollama 웹 검색</strong>을 지원합니다.</p><table tabindex="0"><thead><tr><th>속성</th><th>세부 사항</th></tr></thead><tbody><tr><td>호스트</td><td>설정된 Ollama 호스트 사용(<code>models.providers.ollama.baseUrl</code>이 설정된 경우, 그렇지 않으면 <code>http://127.0.0.1:11434</code>)</td></tr><tr><td>인증</td><td>키 불필요</td></tr><tr><td>요구 사항</td><td>Ollama가 실행 중이고 <code>ollama signin</code>으로 로그인되어 있어야 함</td></tr></tbody></table><p><code>openclaw onboard</code> 또는 <code>openclaw configure --section web</code> 중에 <strong>Ollama 웹 검색</strong>을 선택하거나, 다음을 설정하세요:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  tools</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    web</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      search</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ollama&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>전체 설정 및 동작 세부 사항은 <a href="/openclaw-docs-ko/tools/ollama-search">Ollama 웹 검색</a>을 참고하세요.</p></div><h2 id="고급-설정" tabindex="-1">고급 설정 <a class="header-anchor" href="#고급-설정" aria-label="Permalink to &quot;고급 설정&quot;">​</a></h2><details class="details custom-block"><summary>레거시 OpenAI 호환 모드</summary><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p><strong>OpenAI 호환 모드에서는 도구 호출이 신뢰할 수 없습니다.</strong> OpenAI 포맷만 지원하는 프록시가 필요하고 네이티브 도구 호출 동작에 의존하지 않는 경우에만 이 모드를 사용하세요.</p></div></details><pre><code>OpenAI 호환 엔드포인트를 대신 사용해야 하는 경우(예: OpenAI 포맷만 지원하는 프록시 뒤에 있는 경우), \`api: &quot;openai-completions&quot;\`를 명시적으로 설정하세요:

\`\`\`json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: &quot;http://ollama-host:11434/v1&quot;,
        api: &quot;openai-completions&quot;,
        injectNumCtxForOpenAICompat: true, // 기본값: true
        apiKey: &quot;ollama-local&quot;,
        models: [...]
      }
    }
  }
}
\`\`\`

이 모드는 스트리밍과 도구 호출을 동시에 지원하지 않을 수 있습니다. 모델 설정에서 \`params: { streaming: false }\`로 스트리밍을 비활성화해야 할 수 있습니다.

\`api: &quot;openai-completions&quot;\`를 Ollama와 함께 사용할 때, OpenClaw는 기본적으로 \`options.num_ctx\`를 주입하여 Ollama가 조용히 4096 컨텍스트 윈도우로 폴백하지 않도록 합니다. 프록시/업스트림이 알 수 없는 \`options\` 필드를 거부하는 경우 이 동작을 비활성화하세요:

\`\`\`json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: &quot;http://ollama-host:11434/v1&quot;,
        api: &quot;openai-completions&quot;,
        injectNumCtxForOpenAICompat: false,
        apiKey: &quot;ollama-local&quot;,
        models: [...]
      }
    }
  }
}
\`\`\`
</code></pre><p>:::</p><details class="details custom-block"><summary>컨텍스트 윈도우</summary><p>자동 탐색된 모델의 경우, OpenClaw는 가능할 때 Ollama가 보고한 컨텍스트 윈도우를 사용하며, 그렇지 않으면 OpenClaw에서 사용하는 기본 Ollama 컨텍스트 윈도우로 폴백합니다.</p><pre><code>명시적 Provider 설정에서 \`contextWindow\`와 \`maxTokens\`를 재정의할 수 있습니다:

\`\`\`json5
{
  models: {
    providers: {
      ollama: {
        models: [
          {
            id: &quot;llama3.3&quot;,
            contextWindow: 131072,
            maxTokens: 65536,
          }
        ]
      }
    }
  }
}
\`\`\`
</code></pre></details><details class="details custom-block"><summary>추론 모델</summary><p>OpenClaw는 <code>deepseek-r1</code>, <code>reasoning</code>, <code>think</code>와 같은 이름의 모델을 기본적으로 추론 가능 모델로 취급합니다.</p><pre><code>\`\`\`bash
ollama pull deepseek-r1:32b
\`\`\`

추가 설정은 필요 없습니다 -- OpenClaw가 자동으로 표시합니다.
</code></pre></details><details class="details custom-block"><summary>모델 비용</summary><p>Ollama는 무료이며 로컬에서 실행되므로 모든 모델 비용이 $0으로 설정됩니다. 이는 자동 탐색 모델과 수동으로 정의한 모델 모두에 적용됩니다.</p></details><details class="details custom-block"><summary>메모리 임베딩</summary><p>번들된 Ollama 플러그인은 <a href="/openclaw-docs-ko/concepts/memory">메모리 검색</a>을 위한 메모리 임베딩 Provider를 등록합니다. 설정된 Ollama 베이스 URL과 API 키를 사용합니다.</p><pre><code>| 속성          | 값                  |
| ------------- | ------------------- |
| 기본 모델     | \`nomic-embed-text\`  |
| 자동 풀       | 예 — 로컬에 없는 경우 임베딩 모델이 자동으로 풀됩니다 |

Ollama를 메모리 검색 임베딩 Provider로 선택하려면:

\`\`\`json5
{
  agents: {
    defaults: {
      memorySearch: { provider: &quot;ollama&quot; },
    },
  },
}
\`\`\`
</code></pre></details><details class="details custom-block"><summary>스트리밍 설정</summary><p>OpenClaw의 Ollama 통합은 기본적으로 <strong>네이티브 Ollama API</strong>(<code>/api/chat</code>)를 사용하며, 이는 스트리밍과 도구 호출을 동시에 완전히 지원합니다. 특별한 설정은 필요하지 않습니다.</p><pre><code>네이티브 \`/api/chat\` 요청의 경우, OpenClaw는 thinking 컨트롤을 Ollama에 직접 전달합니다: \`/think off\` 및 \`openclaw agent --thinking off\`는 최상위 레벨 \`think: false\`를 전송하며, \`off\`가 아닌 thinking 수준은 \`think: true\`를 전송합니다.

::: tip
</code></pre><p>OpenAI 호환 엔드포인트를 사용해야 하는 경우, 위의 &quot;레거시 OpenAI 호환 모드&quot; 섹션을 참고하세요. 해당 모드에서는 스트리밍과 도구 호출이 동시에 동작하지 않을 수 있습니다.</p></details><p>:::</p><h2 id="문제-해결" tabindex="-1">문제 해결 <a class="header-anchor" href="#문제-해결" aria-label="Permalink to &quot;문제 해결&quot;">​</a></h2><details class="details custom-block"><summary>Ollama가 감지되지 않음</summary><p>Ollama가 실행 중이고 <code>OLLAMA_API_KEY</code>(또는 인증 프로필)가 설정되어 있는지 확인하세요. 그리고 명시적인 <code>models.providers.ollama</code> 항목을 정의하지 <strong>않았는지</strong> 확인하세요:</p><pre><code>\`\`\`bash
ollama serve
\`\`\`

API에 접근 가능한지 확인하세요:

\`\`\`bash
curl http://localhost:11434/api/tags
\`\`\`
</code></pre></details><details class="details custom-block"><summary>사용 가능한 모델 없음</summary><p>모델이 목록에 없는 경우, 모델을 로컬로 풀하거나 <code>models.providers.ollama</code>에 명시적으로 정의하세요.</p><pre><code>\`\`\`bash
ollama list  # 설치된 항목 확인
ollama pull gemma4
ollama pull gpt-oss:20b
ollama pull llama3.3     # 또는 다른 모델
\`\`\`
</code></pre></details><details class="details custom-block"><summary>Connection refused</summary><p>Ollama가 올바른 포트에서 실행 중인지 확인하세요:</p><pre><code>\`\`\`bash
# Ollama 실행 여부 확인
ps aux | grep ollama

# 또는 Ollama 재시작
ollama serve
\`\`\`
</code></pre></details><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>추가 도움말: <a href="/openclaw-docs-ko/help/troubleshooting">문제 해결</a> 및 <a href="/openclaw-docs-ko/help/faq">FAQ</a>.</p></div><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 모든 Provider, 모델 참조, 페일오버 동작 개요.</p></blockquote><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/models">→</a> 모델을 선택하고 설정하는 방법.</p></blockquote><blockquote><p><strong>Ollama 웹 검색</strong> <a href="/openclaw-docs-ko/tools/ollama-search">→</a> Ollama 기반 웹 검색의 전체 설정 및 동작 세부 사항.</p></blockquote><blockquote><p><strong>설정</strong> <a href="/openclaw-docs-ko/gateway/configuration">→</a> 전체 설정 참조.</p></blockquote>`,65)])])}const g=i(p,[["render",h]]);export{o as __pageData,g as default};
