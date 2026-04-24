import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const o=JSON.parse('{"title":"Amazon Bedrock Mantle","description":"OpenClaw에서 Amazon Bedrock Mantle (OpenAI 호환) 모델 사용","frontmatter":{"title":"Amazon Bedrock Mantle","description":"OpenClaw에서 Amazon Bedrock Mantle (OpenAI 호환) 모델 사용"},"headers":[],"relativePath":"providers/bedrock-mantle.md","filePath":"providers/bedrock-mantle.md","lastUpdated":null}'),p={name:"providers/bedrock-mantle.md"};function h(k,s,t,e,F,d){return a(),n("div",null,[...s[0]||(s[0]=[l(`<p>OpenClaw에는 Mantle OpenAI 호환 엔드포인트에 연결되는 번들 <strong>Amazon Bedrock Mantle</strong> 프로바이더가 포함되어 있습니다. Mantle은 Bedrock 인프라로 뒷받침되는 표준 <code>/v1/chat/completions</code> 인터페이스를 통해 오픈소스 및 서드파티 모델 (GPT-OSS, Qwen, Kimi, GLM 등)을 호스팅합니다.</p><table tabindex="0"><thead><tr><th>속성</th><th>값</th></tr></thead><tbody><tr><td>프로바이더 ID</td><td><code>amazon-bedrock-mantle</code></td></tr><tr><td>API</td><td><code>openai-completions</code> (OpenAI 호환) 또는 <code>anthropic-messages</code> (Anthropic Messages 경로)</td></tr><tr><td>인증</td><td>명시적 <code>AWS_BEARER_TOKEN_BEDROCK</code> 또는 IAM 자격 증명 체인 베어러 토큰 생성</td></tr><tr><td>기본 리전</td><td><code>us-east-1</code> (<code>AWS_REGION</code> 또는 <code>AWS_DEFAULT_REGION</code>으로 재정의)</td></tr></tbody></table><h2 id="시작하기" tabindex="-1">시작하기 <a class="header-anchor" href="#시작하기" aria-label="Permalink to &quot;시작하기&quot;">​</a></h2><p>선호하는 인증 방법을 선택하고 설정 단계를 따라 진행해 주십시오.</p><p><strong>명시적 베어러 토큰</strong></p><p><strong>적합한 경우:</strong> Mantle 베어러 토큰을 이미 가지고 있는 환경.</p><pre><code>1. **게이트웨이 호스트에 베어러 토큰 설정**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> AWS_BEARER_TOKEN_BEDROCK</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;...&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        선택적으로</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 리전 설정 (기본값은 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">us-east-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`):</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> AWS_REGION</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;us-west-2&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 검색 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        검색된</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 모델은 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">amazon-bedrock-mantle</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">프로바이더</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 아래에 나타납니다. 기본값을</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        재정의하려는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 경우가 아니면 추가 구성이 필요하지 않습니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">IAM 자격 증명</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">적합한 경우:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> AWS SDK 호환 자격 증명 (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">공유</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 구성, SSO, 웹 ID, 인스턴스 또는 태스크 역할) 사용.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">게이트웨이 호스트에 AWS 자격 증명 구성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">모든</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> AWS SDK 호환 인증 소스가 작동합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> AWS_PROFILE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;default&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> AWS_REGION</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;us-west-2&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   2.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">모델 검색 확인</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        OpenClaw는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 자격 증명 체인에서 Mantle 베어러 토큰을 자동으로 생성합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tip</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AWS_BEARER_TOKEN_BEDROCK</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정되지 않은 경우 OpenClaw는 공유 자격 증명/구성 프로필, SSO, 웹 ID, 인스턴스 또는 태스크 역할을 포함한 AWS 기본 자격 증명 체인에서 베어러 토큰을 발급받습니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 자동 모델 검색</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AWS_BEARER_TOKEN_BEDROCK</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 설정된 경우 OpenClaw가 직접 사용합니다. 그렇지 않으면,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OpenClaw는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> AWS 기본 자격 증명 체인에서 Mantle 베어러 토큰 생성을 시도합니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">그런</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 다음 리전의 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/v1/models</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">엔드포인트를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 쿼리하여 사용 가능한 Mantle 모델을</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">검색합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 동작</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">              |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 세부</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사항                     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> -----------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> -----------------------------</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 검색</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 캐시         </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 결과는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 1시간 동안 캐시됨       </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> IAM</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 토큰 갱신     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 매시간</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                        |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> info NOTE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">베어러</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 토큰은 표준 [Amazon Bedrock](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/providers/bedrock</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">) 프로바이더가 사용하는 것과 동일한 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AWS_BEARER_TOKEN_BEDROCK</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">입니다.</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:::</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### 지원 리전</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">us-east-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">us-east-2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">us-west-2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ap-northeast-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ap-south-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ap-southeast-3</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">eu-central-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">eu-west-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">eu-west-2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">eu-south-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">eu-north-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sa-east-1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 수동 구성</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">자동</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 검색 대신 명시적 구성을 선호하는 경우:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">models:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> providers:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   &quot;amazon-bedrock-mantle&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     baseUrl:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;https://bedrock-mantle.us-east-1.api.aws/v1&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     api:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openai-completions&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     auth:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;api-key&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     apiKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;env:AWS_BEARER_TOKEN_BEDROCK&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">     models:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         id:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;gpt-oss-120b&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;GPT-OSS 120B&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         reasoning:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         input:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         cost:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> input:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> output:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheRead:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 0,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cacheWrite:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         contextWindow:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 32000,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         maxTokens:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 4096,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="고급-구성" tabindex="-1">고급 구성 <a class="header-anchor" href="#고급-구성" aria-label="Permalink to &quot;고급 구성&quot;">​</a></h2><details class="details custom-block"><summary>추론 지원</summary><p>추론 지원은 <code>thinking</code>, <code>reasoner</code>, <code>gpt-oss-120b</code> 같은 패턴을 포함하는 모델 ID에서 추론됩니다. OpenClaw는 검색 중 일치하는 모델에 대해 <code>reasoning: true</code>를 자동으로 설정합니다.</p></details><details class="details custom-block"><summary>엔드포인트 가용 불가</summary><p>Mantle 엔드포인트를 사용할 수 없거나 모델을 반환하지 않는 경우, 프로바이더는 자동으로 건너뜁니다. OpenClaw는 오류를 발생시키지 않으며; 다른 구성된 프로바이더는 정상적으로 계속 작동합니다.</p></details><details class="details custom-block"><summary>Anthropic Messages 경로를 통한 Claude Opus 4.7</summary><p>Mantle은 동일한 베어러 인증 스트리밍 경로를 통해 Claude 모델을 전달하는 Anthropic Messages 경로도 노출합니다. Claude Opus 4.7 (<code>amazon-bedrock-mantle/claude-opus-4.7</code>)은 프로바이더 소유 스트리밍을 사용하여 이 경로를 통해 호출할 수 있으므로, AWS 베어러 토큰이 Anthropic API 키처럼 취급되지 않습니다.</p><pre><code>Mantle 프로바이더에서 Anthropic Messages 모델을 고정하면, OpenClaw는 해당 모델에 대해 \`openai-completions\` 대신 \`anthropic-messages\` API 표면을 사용합니다. 인증은 여전히 \`AWS_BEARER_TOKEN_BEDROCK\` (또는 발급된 IAM 베어러 토큰)에서 가져옵니다.

\`\`\`json5
{
  models: {
    providers: {
      &quot;amazon-bedrock-mantle&quot;: {
        models: [
          {
            id: &quot;claude-opus-4.7&quot;,
            name: &quot;Claude Opus 4.7&quot;,
            api: &quot;anthropic-messages&quot;,
            reasoning: true,
            input: [&quot;text&quot;, &quot;image&quot;],
            contextWindow: 1000000,
            maxTokens: 32000,
          },
        ],
      },
    },
  },
}
\`\`\`
</code></pre></details><details class="details custom-block"><summary>Amazon Bedrock 프로바이더와의 관계</summary><p>Bedrock Mantle은 표준 <a href="/openclaw-docs-ko/providers/bedrock">Amazon Bedrock</a> 프로바이더와는 별개의 프로바이더입니다. Mantle은 OpenAI 호환 <code>/v1</code> 표면을 사용하는 반면, 표준 Bedrock 프로바이더는 네이티브 Bedrock API를 사용합니다.</p><pre><code>두 프로바이더는 존재하는 경우 동일한 \`AWS_BEARER_TOKEN_BEDROCK\` 자격 증명을
공유합니다.
</code></pre></details><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><blockquote><p><strong>Amazon Bedrock</strong> <a href="/openclaw-docs-ko/providers/bedrock">→</a> Anthropic Claude, Titan 및 기타 모델을 위한 네이티브 Bedrock 프로바이더.</p></blockquote><blockquote><p><strong>모델 선택</strong> <a href="/openclaw-docs-ko/concepts/model-providers">→</a> 프로바이더, 모델 참조, 페일오버 동작 선택.</p></blockquote><blockquote><p><strong>OAuth 및 인증</strong> <a href="/openclaw-docs-ko/gateway/authentication">→</a> 인증 세부 사항 및 자격 증명 재사용 규칙.</p></blockquote><blockquote><p><strong>문제 해결</strong> <a href="/openclaw-docs-ko/help/troubleshooting">→</a> 일반적인 문제 및 해결 방법.</p></blockquote>`,18)])])}const g=i(p,[["render",h]]);export{o as __pageData,g as default};
