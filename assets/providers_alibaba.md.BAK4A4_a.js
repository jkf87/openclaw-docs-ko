import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const c=JSON.parse('{"title":"Alibaba Model Studio","description":"OpenClaw에서 Alibaba Model Studio Wan 영상 생성 사용하기","frontmatter":{"title":"Alibaba Model Studio","description":"OpenClaw에서 Alibaba Model Studio Wan 영상 생성 사용하기"},"headers":[],"relativePath":"providers/alibaba.md","filePath":"providers/alibaba.md","lastUpdated":null}'),p={name:"providers/alibaba.md"};function h(t,s,k,e,E,d){return a(),n("div",null,[...s[0]||(s[0]=[l(`<p>OpenClaw는 Alibaba Model Studio / DashScope에서 Wan 모델을 사용하기 위한 번들 <code>alibaba</code> 영상 생성 프로바이더를 제공합니다.</p><ul><li>프로바이더: <code>alibaba</code></li><li>선호 인증: <code>MODELSTUDIO_API_KEY</code></li><li>허용되는 추가 인증: <code>DASHSCOPE_API_KEY</code>, <code>QWEN_API_KEY</code></li><li>API: DashScope / Model Studio 비동기 영상 생성</li></ul><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><ol><li><p><strong>API 키 설정</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> onboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --auth-choice</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> qwen-standard-api-key</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span></code></pre></div></li><li><p><strong>기본 영상 모델 설정</strong></p></li></ol><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          videoGenerationModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            primary</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;alibaba/wan2.6-t2v&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. **프로바이더가 사용 가능한지 확인**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    openclaw models list --provider alibaba</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: info NOTE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">허용되는 인증 키(\`MODELSTUDIO_API_KEY\`, \`DASHSCOPE_API_KEY\`, \`QWEN_API_KEY\`) 중 어느 것이든 동작합니다. \`qwen-standard-api-key\` 온보딩 선택지는 공유 DashScope 자격증명을 구성합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 내장 Wan 모델</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`alibaba\` 프로바이더는 현재 다음을 등록합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 모델 ref                   | 모드                       |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| -------------------------- | -------------------------- |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`alibaba/wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-t</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\`       | Text-to-video              |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`alibaba/wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-i</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\`       | Image-to-video             |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`alibaba/wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-r</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\`       | Reference-to-video         |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`alibaba/wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-r</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v-flash\` | Reference-to-video (고속)  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| \`alibaba/wan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">-r</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v\`       | Reference-to-video         |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 현재 제한</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 파라미터              | 제한                                                          |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| --------------------- | ------------------------------------------------------------- |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 출력 영상             | 요청당 최대 **</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**개                                           |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 입력 이미지           | 최대 **</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**개                                                  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 입력 영상             | 최대 **</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">**개                                                  |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 길이                  | 최대 **</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">초**                                                 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 지원 컨트롤           | \`size\`, \`aspectRatio\`, \`resolution\`, \`audio\`, \`watermark\`     |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 레퍼런스 이미지/영상  | 원격 \`http(s)\` URL만 지원                                     |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: warning</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">레퍼런스 이미지/영상 모드는 현재 **원격 http(s) URL**만 요구합니다. 레퍼런스 입력에는 로컬 파일 경로가 지원되지 않습니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 고급 설정</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details Qwen과의 관계</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">번들 \`qwen\` 프로바이더 또한 Wan 영상 생성을 위해 Alibaba 호스팅 DashScope</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 엔드포인트를 사용합니다. 다음과 같이 사용하세요.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 정식 Qwen 프로바이더 표면을 원하면 \`qwen/...\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> - 벤더 직속 Wan 영상 표면을 원하면 \`alibaba/...\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 자세한 내용은 [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">Qwen</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> 프로바이더</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> 문서</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](/providers/qwen)를 참고하세요.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::: details 인증 키 우선순위</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OpenClaw는 다음 순서로 인증 키를 확인합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. \`MODELSTUDIO_API_KEY\` (선호)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. \`DASHSCOPE_API_KEY\`</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">. \`QWEN_API_KEY\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 이 중 어느 것이든 \`alibaba\` 프로바이더를 인증합니다.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 관련 문서</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; **영상 생성** [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">→</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](/tools/video-generation)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; 공유 영상 도구 파라미터와 프로바이더 선택.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; **Qwen** [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">→</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](/providers/qwen)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; Qwen 프로바이더 설정과 DashScope 연동.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; **설정 레퍼런스** [</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">→</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">](/gateway/config-agents#agent-defaults)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; 에이전트 기본값과 모델 설정.</span></span></code></pre></div>`,5)])])}const g=i(p,[["render",h]]);export{c as __pageData,g as default};
