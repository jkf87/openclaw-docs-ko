import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const o=JSON.parse('{"title":"Fly.io","description":"지속 저장소 및 HTTPS를 갖춘 OpenClaw의 단계별 Fly.io 배포","frontmatter":{"title":"Fly.io","description":"지속 저장소 및 HTTPS를 갖춘 OpenClaw의 단계별 Fly.io 배포"},"headers":[],"relativePath":"install/fly.md","filePath":"install/fly.md","lastUpdated":null}'),p={name:"install/fly.md"};function t(h,s,k,e,F,d){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="fly-io-배포" tabindex="-1">Fly.io 배포 <a class="header-anchor" href="#fly-io-배포" aria-label="Permalink to &quot;Fly.io 배포&quot;">​</a></h1><p><strong>목표:</strong> 지속 저장소, 자동 HTTPS 및 Discord/채널 액세스가 포함된 <a href="https://fly.io" target="_blank" rel="noreferrer">Fly.io</a> 머신에서 실행되는 OpenClaw Gateway.</p><h2 id="필요-사항" tabindex="-1">필요 사항 <a class="header-anchor" href="#필요-사항" aria-label="Permalink to &quot;필요 사항&quot;">​</a></h2><ul><li><a href="https://fly.io/docs/hands-on/install-flyctl/" target="_blank" rel="noreferrer">flyctl CLI</a> 설치됨</li><li>Fly.io 계정 (무료 티어 사용 가능)</li><li>모델 인증: 선택한 모델 제공자의 API 키</li><li>채널 자격 증명: Discord 봇 토큰, Telegram 토큰 등</li></ul><h2 id="초보자-빠른-경로" tabindex="-1">초보자 빠른 경로 <a class="header-anchor" href="#초보자-빠른-경로" aria-label="Permalink to &quot;초보자 빠른 경로&quot;">​</a></h2><ol><li><p>저장소 복제 → <code>fly.toml</code> 커스터마이즈</p></li><li><p>앱 + 볼륨 생성 → 시크릿 설정</p></li><li><p><code>fly deploy</code>로 배포</p></li><li><p>SSH를 통해 접속하여 구성 생성 또는 Control UI 사용</p></li><li><p><strong>Fly 앱 생성</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 저장소 복제</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clone</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/openclaw/openclaw.git</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 새 Fly 앱 생성 (원하는 이름 선택)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apps</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 지속 볼륨 생성 (보통 1GB로 충분)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> volumes</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw_data</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --size</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --region</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> iad</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    **팁:**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 가까운 지역을 선택합니다. 일반적인 옵션: \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lhr</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">런던</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">iad</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">버지니아</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sjc</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">산호세</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.</span></span></code></pre></div></li><li><p><strong>fly.toml 구성</strong></p></li></ol><p>앱 이름과 요구 사항에 맞게 <code>fly.toml</code>을 편집합니다.</p><pre><code>   **보안 참고:** 기본 구성은 공용 URL을 노출합니다. 공용 IP가 없는 강화된 배포의 경우 [비공개 배포](#private-deployment-hardened)를 참조하거나 \`fly.private.toml\`을 사용합니다.

   \`\`\`toml
   app = &quot;my-openclaw&quot;  # 앱 이름
   primary_region = &quot;iad&quot;

   [build]
     dockerfile = &quot;Dockerfile&quot;

   [env]
     NODE_ENV = &quot;production&quot;
     OPENCLAW_PREFER_PNPM = &quot;1&quot;
     OPENCLAW_STATE_DIR = &quot;/data&quot;
     NODE_OPTIONS = &quot;--max-old-space-size=1536&quot;

   [processes]
     app = &quot;node dist/index.js gateway --allow-unconfigured --port 3000 --bind lan&quot;

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = false
     auto_start_machines = true
     min_machines_running = 1
     processes = [&quot;app&quot;]

   [[vm]]
     size = &quot;shared-cpu-2x&quot;
     memory = &quot;2048mb&quot;

   [mounts]
     source = &quot;openclaw_data&quot;
     destination = &quot;/data&quot;
   \`\`\`

   **주요 설정:**

   | 설정                           | 이유                                                                          |
   | ------------------------------ | ----------------------------------------------------------------------------- |
   | \`--bind lan\`                   | Fly의 프록시가 게이트웨이에 도달할 수 있도록 \`0.0.0.0\`에 바인딩              |
   | \`--allow-unconfigured\`         | 구성 파일 없이 시작 (나중에 생성 예정)                                        |
   | \`internal_port = 3000\`         | Fly 헬스 체크를 위해 \`--port 3000\` (또는 \`OPENCLAW_GATEWAY_PORT\`)과 일치해야 함 |
   | \`memory = &quot;2048mb&quot;\`            | 512MB는 너무 작음; 2GB 권장                                                   |
   | \`OPENCLAW_STATE_DIR = &quot;/data&quot;\` | 볼륨에 상태 지속                                                              |
</code></pre><ol start="3"><li><strong>시크릿 설정</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 필수: 게이트웨이 토큰 (비루프백 바인딩용)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> secrets</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OPENCLAW_GATEWAY_TOKEN=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openssl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> rand</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -hex</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 32</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 모델 제공자 API 키</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> secrets</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ANTHROPIC_API_KEY=sk-ant-...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 선택적: 다른 제공자</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> secrets</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OPENAI_API_KEY=sk-...</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> secrets</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> GOOGLE_API_KEY=...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 채널 토큰</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> secrets</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> DISCORD_BOT_TOKEN=MTQ...</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    **참고:**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 비루프백 바인딩(\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">--bind</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> lan\`)에는 유효한 게이트웨이 인증 경로가 필요합니다. 이 Fly.io 예제는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENCLAW_GATEWAY_TOKEN</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하지만, \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gateway.auth.password</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 올바르게 구성된 비루프백 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trusted-proxy</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">배포도</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 요구 사항을 충족합니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 이러한 토큰을 비밀번호처럼 취급합니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">구성 파일보다 환경 변수를 선호합니다.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 이렇게 하면 실수로 노출되거나 로그에 기록될 수 있는 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw.json</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 시크릿을 제외할 수 있습니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">4.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">배포</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deploy</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    첫</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 번째 배포는 Docker 이미지를 빌드합니다(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">약</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 2-3분). 이후 배포는 더 빠릅니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    배포</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 후 확인:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> status</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> logs</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    다음이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 표시되어야 합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [gateway] </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">listening</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> on</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ws://0.0.0.0:3000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (PID </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">xxx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [discord] </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">logged</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> in</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> to</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> discord</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> as</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> xxx</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">5.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">구성 파일 생성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">머신에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> SSH로 접속하여 적절한 구성을 생성합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> console</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    구성</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 디렉터리와 파일을 생성합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /data</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /data/openclaw.json</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;EOF&#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;agents&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;defaults&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;model&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;primary&quot;: &quot;anthropic/claude-opus-4-6&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;fallbacks&quot;: [&quot;anthropic/claude-sonnet-4-6&quot;, &quot;openai/gpt-5.4&quot;]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;maxConcurrent&quot;: 4</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;list&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;id&quot;: &quot;main&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;default&quot;: true</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;auth&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;profiles&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;anthropic:default&quot;: { &quot;mode&quot;: &quot;token&quot;, &quot;provider&quot;: &quot;anthropic&quot; },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;openai:default&quot;: { &quot;mode&quot;: &quot;token&quot;, &quot;provider&quot;: &quot;openai&quot; }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;bindings&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;agentId&quot;: &quot;main&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;match&quot;: { &quot;channel&quot;: &quot;discord&quot; }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      ],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;channels&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;discord&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;enabled&quot;: true,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;groupPolicy&quot;: &quot;allowlist&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;guilds&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;YOUR_GUILD_ID&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              &quot;channels&quot;: { &quot;general&quot;: { &quot;allow&quot;: true } },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              &quot;requireMention&quot;: false</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;gateway&quot;: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;mode&quot;: &quot;local&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;bind&quot;: &quot;auto&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;meta&quot;: {}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    EOF</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    **참고:** \`OPENCLAW_STATE_DIR=/data\`를 사용하면 구성 경로는 \`/data/openclaw.json\`입니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    **참고:** Discord 토큰은 다음 중 하나에서 올 수 있습니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    - 환경 변수: \`DISCORD_BOT_TOKEN\` (시크릿에 권장)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    - 구성 파일: \`channels.discord.token\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    환경 변수를 사용하는 경우 구성에 토큰을 추가할 필요가 없습니다. 게이트웨이는 \`DISCORD_BOT_TOKEN\`을 자동으로 읽습니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    적용을 위해 재시작:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    exit</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    fly machine restart &amp;lt;machine-id&amp;gt;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">6. **Gateway 액세스**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### Control UI</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    브라우저에서 열기:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    fly open</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    또는 \`https://my-openclaw.fly.dev/\` 방문</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    구성된 공유 시크릿으로 인증합니다. 이 가이드는 \`OPENCLAW_GATEWAY_TOKEN\`의 게이트웨이 토큰을 사용합니다. 비밀번호 인증으로 전환한 경우 해당 비밀번호를 사용합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    ### 로그</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    fly logs              # 실시간 로그</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    fly logs --no-tail    # 최근 로그</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    ### SSH 콘솔</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    fly ssh console</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 문제 해결</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### &quot;App is not listening on expected address&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">게이트웨이가 \`0.0.0.0\` 대신 \`127.0.0.1\`에 바인딩되고 있습니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**수정:** \`fly.toml\`의 프로세스 명령에 \`--bind lan\`을 추가합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 헬스 체크 실패 / 연결 거부됨</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Fly가 구성된 포트에서 게이트웨이에 도달할 수 없습니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**수정:** \`internal_port\`이 게이트웨이 포트와 일치하는지 확인합니다(\`--port 3000\` 또는 \`OPENCLAW_GATEWAY_PORT=3000\` 설정).</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### OOM / 메모리 문제</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">컨테이너가 계속 재시작되거나 종료됩니다. 증상: \`SIGABRT\`, \`v8::internal::Runtime_AllocateInYoungGeneration\` 또는 자동 재시작.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**수정:** \`fly.toml\`에서 메모리를 늘립니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`toml</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[[vm]]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">memory = &quot;2048mb&quot;</span></span></code></pre></div><p>또는 기존 머신을 업데이트합니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> machine</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">machine-id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">--vm-memory</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2048</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span></span></code></pre></div><p><strong>참고:</strong> 512MB는 너무 작습니다. 1GB는 작동할 수 있지만 과부하 또는 상세 로깅 시 OOM이 발생할 수 있습니다. <strong>2GB를 권장합니다.</strong></p><h3 id="gateway-잠금-문제" tabindex="-1">Gateway 잠금 문제 <a class="header-anchor" href="#gateway-잠금-문제" aria-label="Permalink to &quot;Gateway 잠금 문제&quot;">​</a></h3><p>&quot;already running&quot; 오류로 게이트웨이가 시작을 거부합니다.</p><p>이는 컨테이너가 재시작되지만 PID 잠금 파일이 볼륨에 남아 있을 때 발생합니다.</p><p><strong>수정:</strong> 잠금 파일 삭제:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> console</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --command</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;rm -f /data/gateway.*.lock&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> machine</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> restart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">machine-id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><p>잠금 파일은 <code>/data/gateway.*.lock</code>에 있습니다(하위 디렉터리가 아님).</p><h3 id="구성이-읽히지-않음" tabindex="-1">구성이 읽히지 않음 <a class="header-anchor" href="#구성이-읽히지-않음" aria-label="Permalink to &quot;구성이 읽히지 않음&quot;">​</a></h3><p><code>--allow-unconfigured</code>는 시작 가드만 우회합니다. <code>/data/openclaw.json</code>을 생성하거나 복구하지 않으므로 일반 로컬 게이트웨이 시작을 원할 때 실제 구성이 존재하고 <code>gateway.mode=&quot;local&quot;</code>을 포함하는지 확인합니다.</p><p>구성이 존재하는지 확인:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> console</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --command</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;cat /data/openclaw.json&quot;</span></span></code></pre></div><h3 id="ssh를-통한-구성-작성" tabindex="-1">SSH를 통한 구성 작성 <a class="header-anchor" href="#ssh를-통한-구성-작성" aria-label="Permalink to &quot;SSH를 통한 구성 작성&quot;">​</a></h3><p><code>fly ssh console -C</code> 명령은 셸 리디렉션을 지원하지 않습니다. 구성 파일을 작성하려면:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># echo + tee 사용 (로컬에서 원격으로 파이프)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">echo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;{&quot;your&quot;:&quot;config&quot;}&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> console</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -C</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;tee /data/openclaw.json&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 또는 sftp 사용</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> sftp</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> shell</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> put /local/path/config.json /data/openclaw.json</span></span></code></pre></div><p><strong>참고:</strong> 파일이 이미 존재하는 경우 <code>fly sftp</code>가 실패할 수 있습니다. 먼저 삭제합니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> console</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --command</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;rm /data/openclaw.json&quot;</span></span></code></pre></div><h3 id="상태가-지속되지-않음" tabindex="-1">상태가 지속되지 않음 <a class="header-anchor" href="#상태가-지속되지-않음" aria-label="Permalink to &quot;상태가 지속되지 않음&quot;">​</a></h3><p>재시작 후 인증 프로파일, 채널/제공자 상태 또는 세션이 손실되면 상태 디렉터리가 컨테이너 파일 시스템에 쓰고 있습니다.</p><p><strong>수정:</strong> <code>fly.toml</code>에서 <code>OPENCLAW_STATE_DIR=/data</code>가 설정되어 있는지 확인하고 재배포합니다.</p><h2 id="업데이트" tabindex="-1">업데이트 <a class="header-anchor" href="#업데이트" aria-label="Permalink to &quot;업데이트&quot;">​</a></h2><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 최신 변경 사항 가져오기</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 재배포</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deploy</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 헬스 확인</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> status</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> logs</span></span></code></pre></div><h3 id="머신-명령-업데이트" tabindex="-1">머신 명령 업데이트 <a class="header-anchor" href="#머신-명령-업데이트" aria-label="Permalink to &quot;머신 명령 업데이트&quot;">​</a></h3><p>전체 재배포 없이 시작 명령을 변경해야 하는 경우:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 머신 ID 가져오기</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> machines</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 명령 업데이트</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> machine</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">machine-id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">--command</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;node dist/index.js gateway --port 3000 --bind lan&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 또는 메모리 증가와 함께</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> machine</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">machine-id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">--vm-memory</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2048</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --command</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;node dist/index.js gateway --port 3000 --bind lan&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span></span></code></pre></div><p><strong>참고:</strong> <code>fly deploy</code> 후 머신 명령이 <code>fly.toml</code>의 내용으로 재설정될 수 있습니다. 수동 변경을 했다면 배포 후 다시 적용합니다.</p><h2 id="비공개-배포-강화됨" tabindex="-1">비공개 배포 (강화됨) <a class="header-anchor" href="#비공개-배포-강화됨" aria-label="Permalink to &quot;비공개 배포 (강화됨)&quot;">​</a></h2><p>기본적으로 Fly는 공용 IP를 할당하여 게이트웨이가 <code>https://your-app.fly.dev</code>에서 접근 가능합니다. 이는 편리하지만 인터넷 스캐너(Shodan, Censys 등)에서 배포가 검색 가능하다는 것을 의미합니다.</p><p><strong>공개 노출이 없는</strong> 강화된 배포를 위해 비공개 템플릿을 사용합니다.</p><h3 id="비공개-배포를-사용해야-하는-경우" tabindex="-1">비공개 배포를 사용해야 하는 경우 <a class="header-anchor" href="#비공개-배포를-사용해야-하는-경우" aria-label="Permalink to &quot;비공개 배포를 사용해야 하는 경우&quot;">​</a></h3><ul><li><strong>아웃바운드</strong> 호출/메시지만 만드는 경우 (인바운드 웹훅 없음)</li><li>웹훅 콜백에 <strong>ngrok 또는 Tailscale</strong> 터널을 사용하는 경우</li><li><strong>SSH, 프록시 또는 WireGuard</strong>를 통해 게이트웨이에 액세스하는 경우</li><li>인터넷 스캐너에서 배포를 <strong>숨기려는</strong> 경우</li></ul><h3 id="설정" tabindex="-1">설정 <a class="header-anchor" href="#설정" aria-label="Permalink to &quot;설정&quot;">​</a></h3><p>표준 구성 대신 <code>fly.private.toml</code>을 사용합니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 비공개 구성으로 배포</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deploy</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -c</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> fly.private.toml</span></span></code></pre></div><p>또는 기존 배포를 변환합니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 현재 IP 목록</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ips</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 공용 IP 해제</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ips</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> release</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">public-ipv4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ips</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> release</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">public-ipv6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 미래 배포에서 공용 IP를 재할당하지 않도록 비공개 구성으로 전환</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ([http_service] 제거 또는 비공개 템플릿으로 배포)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deploy</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -c</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> fly.private.toml</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 비공개 전용 IPv6 할당</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ips</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> allocate-v6</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --private</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw</span></span></code></pre></div><p>이후 <code>fly ips list</code>에는 <code>private</code> 유형 IP만 표시되어야 합니다:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>VERSION  IP                   TYPE             REGION</span></span>
<span class="line"><span>v6       fdaa:x:x:x:x::x      private          global</span></span></code></pre></div><h3 id="비공개-배포-접근-방법" tabindex="-1">비공개 배포 접근 방법 <a class="header-anchor" href="#비공개-배포-접근-방법" aria-label="Permalink to &quot;비공개 배포 접근 방법&quot;">​</a></h3><p>공용 URL이 없으므로 다음 방법 중 하나를 사용합니다:</p><p><strong>옵션 1: 로컬 프록시 (가장 간단)</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 로컬 포트 3000을 앱으로 전달</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> proxy</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 3000:3000</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 그런 다음 브라우저에서 http://localhost:3000 열기</span></span></code></pre></div><p><strong>옵션 2: WireGuard VPN</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># WireGuard 구성 생성 (1회)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> wireguard</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># WireGuard 클라이언트에 가져온 후 내부 IPv6를 통해 접근</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 예: http://[fdaa:x:x:x:x::x]:3000</span></span></code></pre></div><p><strong>옵션 3: SSH만 사용</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> console</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw</span></span></code></pre></div><h3 id="비공개-배포와-웹훅" tabindex="-1">비공개 배포와 웹훅 <a class="header-anchor" href="#비공개-배포와-웹훅" aria-label="Permalink to &quot;비공개 배포와 웹훅&quot;">​</a></h3><p>공개 노출 없이 웹훅 콜백이 필요한 경우(Twilio, Telnyx 등):</p><ol><li><strong>ngrok 터널</strong> - 컨테이너 또는 사이드카로 ngrok 실행</li><li><strong>Tailscale Funnel</strong> - Tailscale을 통해 특정 경로 노출</li><li><strong>아웃바운드 전용</strong> - 일부 제공자(Twilio)는 웹훅 없이 아웃바운드 호출에서 잘 작동</li></ol><p>ngrok을 사용한 음성 통화 구성 예제:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    entries</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;voice-call&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;twilio&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          tunnel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ngrok&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          webhookSecurity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            allowedHosts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;example.ngrok.app&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>ngrok 터널은 컨테이너 내에서 실행되며 Fly 앱 자체를 노출하지 않고 공용 웹훅 URL을 제공합니다. 전달된 호스트 헤더가 허용되도록 <code>webhookSecurity.allowedHosts</code>를 공용 터널 호스트 이름으로 설정합니다.</p><h3 id="보안-이점" tabindex="-1">보안 이점 <a class="header-anchor" href="#보안-이점" aria-label="Permalink to &quot;보안 이점&quot;">​</a></h3><table tabindex="0"><thead><tr><th>측면</th><th>공개</th><th>비공개</th></tr></thead><tbody><tr><td>인터넷 스캐너</td><td>검색 가능</td><td>숨겨짐</td></tr><tr><td>직접 공격</td><td>가능</td><td>차단됨</td></tr><tr><td>Control UI 액세스</td><td>브라우저</td><td>프록시/VPN</td></tr><tr><td>웹훅 전달</td><td>직접</td><td>터널 경유</td></tr></tbody></table><h2 id="참고-사항" tabindex="-1">참고 사항 <a class="header-anchor" href="#참고-사항" aria-label="Permalink to &quot;참고 사항&quot;">​</a></h2><ul><li>Fly.io는 <strong>x86 아키텍처</strong>를 사용합니다 (ARM 아님)</li><li>Dockerfile은 두 아키텍처와 호환됩니다</li><li>WhatsApp/Telegram 온보딩은 <code>fly ssh console</code>을 사용합니다</li><li>지속 데이터는 <code>/data</code>의 볼륨에 있습니다</li><li>Signal에는 Java + signal-cli가 필요합니다. 사용자 정의 이미지를 사용하고 메모리를 2GB+로 유지합니다.</li></ul><h2 id="비용" tabindex="-1">비용 <a class="header-anchor" href="#비용" aria-label="Permalink to &quot;비용&quot;">​</a></h2><p>권장 구성(<code>shared-cpu-2x</code>, 2GB RAM)의 경우:</p><ul><li>사용량에 따라 월 약 $10-15</li><li>무료 티어에 일부 허용량 포함</li></ul><p>자세한 내용은 <a href="https://fly.io/docs/about/pricing/" target="_blank" rel="noreferrer">Fly.io 가격</a>을 참조하십시오.</p><h2 id="다음-단계" tabindex="-1">다음 단계 <a class="header-anchor" href="#다음-단계" aria-label="Permalink to &quot;다음 단계&quot;">​</a></h2><ul><li>메시징 채널 설정: <a href="/openclaw-docs-ko/channels">채널</a></li><li>Gateway 구성: <a href="/openclaw-docs-ko/gateway/configuration">Gateway 구성</a></li><li>OpenClaw를 최신 상태로 유지: <a href="/openclaw-docs-ko/install/updating">업데이트</a></li></ul>`,73)])])}const g=i(p,[["render",t]]);export{o as __pageData,g as default};
