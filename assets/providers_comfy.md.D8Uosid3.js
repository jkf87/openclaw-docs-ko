import{_ as i,o as a,c as n,ag as t}from"./chunks/framework.CTpQozEL.js";const F=JSON.parse('{"title":"ComfyUI","description":"OpenClaw에서 ComfyUI 워크플로 기반 이미지, 비디오, 음악 생성 설정","frontmatter":{"title":"ComfyUI","description":"OpenClaw에서 ComfyUI 워크플로 기반 이미지, 비디오, 음악 생성 설정"},"headers":[],"relativePath":"providers/comfy.md","filePath":"providers/comfy.md","lastUpdated":null}'),l={name:"providers/comfy.md"};function p(e,s,h,k,d,o){return a(),n("div",null,[...s[0]||(s[0]=[t(`<p>OpenClaw는 워크플로 기반 ComfyUI 실행을 위한 번들 <code>comfy</code> 플러그인을 제공합니다. 이 플러그인은 전적으로 워크플로 중심이므로, OpenClaw는 일반적인 <code>size</code>, <code>aspectRatio</code>, <code>resolution</code>, <code>durationSeconds</code> 또는 TTS 스타일 컨트롤을 여러분의 그래프에 매핑하려고 시도하지 않습니다.</p><table tabindex="0"><thead><tr><th>속성</th><th>세부 사항</th></tr></thead><tbody><tr><td>Provider</td><td><code>comfy</code></td></tr><tr><td>Models</td><td><code>comfy/workflow</code></td></tr><tr><td>공유 표면(Surface)</td><td><code>image_generate</code>, <code>video_generate</code>, <code>music_generate</code></td></tr><tr><td>인증</td><td>로컬 ComfyUI는 불필요. Comfy Cloud는 <code>COMFY_API_KEY</code> 또는 <code>COMFY_CLOUD_API_KEY</code> 필요</td></tr><tr><td>API</td><td>ComfyUI <code>/prompt</code> / <code>/history</code> / <code>/view</code> 및 Comfy Cloud <code>/api/*</code></td></tr></tbody></table><h2 id="지원-기능" tabindex="-1">지원 기능 <a class="header-anchor" href="#지원-기능" aria-label="Permalink to &quot;지원 기능&quot;">​</a></h2><ul><li>워크플로 JSON으로부터 이미지 생성</li><li>참조 이미지 1장을 업로드한 이미지 편집</li><li>워크플로 JSON으로부터 비디오 생성</li><li>참조 이미지 1장으로 비디오 생성</li><li>공유 <code>music_generate</code> 도구를 통한 음악 또는 오디오 생성</li><li>설정된 노드 또는 일치하는 모든 출력 노드로부터 결과 다운로드</li></ul><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><p>자신의 기기에서 ComfyUI를 실행할지, Comfy Cloud를 사용할지 선택하세요.</p><p><strong>로컬(Local)</strong></p><p><strong>적합한 경우:</strong> 여러분의 기기 또는 LAN에서 자체 ComfyUI 인스턴스를 실행하는 경우.</p><pre><code>1. **로컬 ComfyUI 실행**
</code></pre><p>로컬 ComfyUI 인스턴스가 실행 중인지 확인하세요(기본값: <code>http://127.0.0.1:8188</code>).</p><pre><code>  2. **워크플로 JSON 준비**
</code></pre><p>ComfyUI 워크플로 JSON 파일을 내보내거나 생성하세요. 프롬프트 입력 노드와 OpenClaw가 읽어갈 출력 노드의 ID를 기록해두세요.</p><pre><code>  3. **Provider 설정**
</code></pre><p><code>mode: &quot;local&quot;</code>로 설정하고 워크플로 파일을 가리키세요. 다음은 최소한의 이미지 예시입니다:</p><pre><code>       \`\`\`json5
       {
         models: {
           providers: {
             comfy: {
               mode: &quot;local&quot;,
               baseUrl: &quot;http://127.0.0.1:8188&quot;,
               image: {
                 workflowPath: &quot;./workflows/flux-api.json&quot;,
                 promptNodeId: &quot;6&quot;,
                 outputNodeId: &quot;9&quot;,
               },
             },
           },
         },
       }
       \`\`\`

  4. **기본 모델 설정**
</code></pre><p>설정한 기능에 대해 OpenClaw가 <code>comfy/workflow</code> 모델을 사용하도록 지정하세요:</p><pre><code>       \`\`\`json5
       {
         agents: {
           defaults: {
             imageGenerationModel: {
               primary: &quot;comfy/workflow&quot;,
             },
           },
         },
       }
       \`\`\`

  5. **확인**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> comfy</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">**Comfy</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Cloud</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">적합한 경우:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 로컬 GPU 리소스를 관리하지 않고 Comfy Cloud에서 워크플로를 실행하는 경우.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">API 키 발급</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[comfy.org](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://comfy.org</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)에서 가입한 후 계정 대시보드에서 API 키를 생성하세요.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">API 키 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">다음</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 중 한 가지 방법으로 키를 제공하세요:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 환경 변수 (권장)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> COMFY_API_KEY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;your-key&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 대체 환경 변수</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> COMFY_CLOUD_API_KEY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;your-key&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 또는 설정 파일에 인라인으로</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models.providers.comfy.apiKey</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;your-key&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">워크플로 JSON 준비</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ComfyUI</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 워크플로 JSON 파일을 내보내거나 생성하세요. 프롬프트 입력 노드와 출력 노드의 ID를 기록해두세요.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   4.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Provider 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mode:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;cloud&quot;\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정하고 워크플로 파일을 가리키세요:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            providers:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">              comfy:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                mode:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;cloud&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                image:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                  workflowPath:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;./workflows/flux-api.json&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                  promptNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;6&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                  outputNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;9&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">              },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tip</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">클라우드</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모드에서 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">baseUrl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">의</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 기본값은 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://cloud.comfy.org</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">입니다.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 커스텀 클라우드 엔드포인트를 사용하는 경우에만 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">baseUrl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정하면 됩니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   5.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">기본 모델 설정</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          agents:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            defaults:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">              imageGenerationModel:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                primary:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;comfy/workflow&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">              },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   6.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> comfy</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 설정</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Comfy는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 공유 최상위 연결 설정과 기능별 워크플로 섹션(\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">image</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">video</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">music</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`)을 지원합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> providers:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   comfy:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     mode:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;local&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     baseUrl:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;http://127.0.0.1:8188&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     image:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       workflowPath:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;./workflows/flux-api.json&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       promptNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;6&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       outputNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;9&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     video:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       workflowPath:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;./workflows/video-api.json&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       promptNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;12&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       outputNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;21&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     music:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       workflowPath:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;./workflows/music-api.json&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       promptNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;3&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       outputNodeId:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;18&quot;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="공유-키" tabindex="-1">공유 키 <a class="header-anchor" href="#공유-키" aria-label="Permalink to &quot;공유 키&quot;">​</a></h3><table tabindex="0"><thead><tr><th>키</th><th>타입</th><th>설명</th></tr></thead><tbody><tr><td><code>mode</code></td><td><code>&quot;local&quot;</code> 또는 <code>&quot;cloud&quot;</code></td><td>연결 모드.</td></tr><tr><td><code>baseUrl</code></td><td>string</td><td>로컬은 <code>http://127.0.0.1:8188</code>, 클라우드는 <code>https://cloud.comfy.org</code>가 기본값입니다.</td></tr><tr><td><code>apiKey</code></td><td>string</td><td>선택적 인라인 키. <code>COMFY_API_KEY</code> / <code>COMFY_CLOUD_API_KEY</code> 환경 변수의 대체입니다.</td></tr><tr><td><code>allowPrivateNetwork</code></td><td>boolean</td><td>클라우드 모드에서 private/LAN <code>baseUrl</code>을 허용합니다.</td></tr></tbody></table><h3 id="기능별-키" tabindex="-1">기능별 키 <a class="header-anchor" href="#기능별-키" aria-label="Permalink to &quot;기능별 키&quot;">​</a></h3><p>다음 키들은 <code>image</code>, <code>video</code>, <code>music</code> 섹션 내부에 적용됩니다:</p><table tabindex="0"><thead><tr><th>키</th><th>필수 여부</th><th>기본값</th><th>설명</th></tr></thead><tbody><tr><td><code>workflow</code> 또는 <code>workflowPath</code></td><td>예</td><td>--</td><td>ComfyUI 워크플로 JSON 파일의 경로.</td></tr><tr><td><code>promptNodeId</code></td><td>예</td><td>--</td><td>텍스트 프롬프트를 받는 노드 ID.</td></tr><tr><td><code>promptInputName</code></td><td>아니오</td><td><code>&quot;text&quot;</code></td><td>프롬프트 노드의 입력 이름.</td></tr><tr><td><code>outputNodeId</code></td><td>아니오</td><td>--</td><td>출력을 읽을 노드 ID. 생략하면 일치하는 모든 출력 노드가 사용됩니다.</td></tr><tr><td><code>pollIntervalMs</code></td><td>아니오</td><td>--</td><td>작업 완료를 위한 폴링 간격(밀리초).</td></tr><tr><td><code>timeoutMs</code></td><td>아니오</td><td>--</td><td>워크플로 실행에 대한 타임아웃(밀리초).</td></tr></tbody></table><p><code>image</code> 및 <code>video</code> 섹션은 다음도 지원합니다:</p><table tabindex="0"><thead><tr><th>키</th><th>필수 여부</th><th>기본값</th><th>설명</th></tr></thead><tbody><tr><td><code>inputImageNodeId</code></td><td>예 (참조 이미지를 전달하는 경우)</td><td>--</td><td>업로드된 참조 이미지를 받는 노드 ID.</td></tr><tr><td><code>inputImageInputName</code></td><td>아니오</td><td><code>&quot;image&quot;</code></td><td>이미지 노드의 입력 이름.</td></tr></tbody></table><h2 id="워크플로-세부-사항" tabindex="-1">워크플로 세부 사항 <a class="header-anchor" href="#워크플로-세부-사항" aria-label="Permalink to &quot;워크플로 세부 사항&quot;">​</a></h2><details class="details custom-block"><summary>이미지 워크플로</summary><p>기본 이미지 모델을 <code>comfy/workflow</code>로 설정하세요:</p><pre><code>\`\`\`json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: &quot;comfy/workflow&quot;,
      },
    },
  },
}
\`\`\`

**참조 이미지 편집 예시:**

업로드된 참조 이미지로 이미지 편집을 활성화하려면, 이미지 설정에 \`inputImageNodeId\`를 추가하세요:

\`\`\`json5
{
  models: {
    providers: {
      comfy: {
        image: {
          workflowPath: &quot;./workflows/edit-api.json&quot;,
          promptNodeId: &quot;6&quot;,
          inputImageNodeId: &quot;7&quot;,
          inputImageInputName: &quot;image&quot;,
          outputNodeId: &quot;9&quot;,
        },
      },
    },
  },
}
\`\`\`
</code></pre></details><details class="details custom-block"><summary>비디오 워크플로</summary><p>기본 비디오 모델을 <code>comfy/workflow</code>로 설정하세요:</p><pre><code>\`\`\`json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: &quot;comfy/workflow&quot;,
      },
    },
  },
}
\`\`\`

Comfy 비디오 워크플로는 설정된 그래프를 통해 텍스트-투-비디오 및 이미지-투-비디오를 지원합니다.

::: info NOTE
</code></pre><p>OpenClaw는 입력 비디오를 Comfy 워크플로에 전달하지 않습니다. 입력으로는 텍스트 프롬프트와 단일 참조 이미지만 지원됩니다.</p></details><p>:::</p><details class="details custom-block"><summary>음악 워크플로</summary><p>번들된 플러그인은 워크플로로 정의된 오디오 또는 음악 출력을 위한 음악 생성 Provider를 등록하며, 공유 <code>music_generate</code> 도구를 통해 노출됩니다:</p><pre><code>\`\`\`text
/tool music_generate prompt=&quot;Warm ambient synth loop with soft tape texture&quot;
\`\`\`

\`music\` 설정 섹션을 사용하여 오디오 워크플로 JSON과 출력 노드를 지정하세요.
</code></pre></details><details class="details custom-block"><summary>하위 호환성</summary><p>기존의 최상위 레벨 이미지 설정(중첩된 <code>image</code> 섹션 없이)도 여전히 동작합니다:</p><pre><code>\`\`\`json5
{
  models: {
    providers: {
      comfy: {
        workflowPath: &quot;./workflows/flux-api.json&quot;,
        promptNodeId: &quot;6&quot;,
        outputNodeId: &quot;9&quot;,
      },
    },
  },
}
\`\`\`

OpenClaw는 이러한 레거시 형태를 이미지 워크플로 설정으로 처리합니다. 즉시 마이그레이션할 필요는 없지만, 새로운 설정에는 중첩된 \`image\` / \`video\` / \`music\` 섹션을 권장합니다.

::: tip
</code></pre><p>이미지 생성만 사용하는 경우, 레거시 플랫 설정과 새로운 중첩 <code>image</code> 섹션은 기능적으로 동등합니다.</p></details><p>:::</p><details class="details custom-block"><summary>라이브 테스트</summary><p>번들된 플러그인에 대한 옵트인 라이브 커버리지가 존재합니다:</p><pre><code>\`\`\`bash
OPENCLAW_LIVE_TEST=1 COMFY_LIVE_TEST=1 pnpm test:live -- extensions/comfy/comfy.live.test.ts
\`\`\`

라이브 테스트는 일치하는 Comfy 워크플로 섹션이 설정되어 있지 않으면 개별 이미지, 비디오, 음악 케이스를 건너뜁니다.
</code></pre></details><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>이미지 생성</strong> <a href="/openclaw-docs-ko/tools/image-generation">→</a> 이미지 생성 도구 설정 및 사용법.</p></blockquote><blockquote><p><strong>비디오 생성</strong> <a href="/openclaw-docs-ko/tools/video-generation">→</a> 비디오 생성 도구 설정 및 사용법.</p></blockquote><blockquote><p><strong>음악 생성</strong> <a href="/openclaw-docs-ko/tools/music-generation">→</a> 음악 및 오디오 생성 도구 설정.</p></blockquote><blockquote><p><strong>Provider 디렉토리</strong> <a href="/openclaw-docs-ko/providers/">→</a> 모든 Provider 및 모델 참조에 대한 개요.</p></blockquote><blockquote><p><strong>설정 참조</strong> <a href="/openclaw-docs-ko/gateway/config-agents#agent-defaults">→</a> 에이전트 기본값을 포함한 전체 설정 참조.</p></blockquote>`,39)])])}const c=i(l,[["render",p]]);export{F as __pageData,c as default};
