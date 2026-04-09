import{_ as i,o as a,c as n,ae as l}from"./chunks/framework.C7FLYIpo.js";const g=JSON.parse('{"title":"Hetzner","description":"내구성 있는 상태와 베이킹된 바이너리를 갖춘 저렴한 Hetzner VPS (Docker)에서 24/7 OpenClaw Gateway 실행","frontmatter":{"title":"Hetzner","description":"내구성 있는 상태와 베이킹된 바이너리를 갖춘 저렴한 Hetzner VPS (Docker)에서 24/7 OpenClaw Gateway 실행"},"headers":[],"relativePath":"install/hetzner.md","filePath":"install/hetzner.md","lastUpdated":null}'),p={name:"install/hetzner.md"};function h(k,s,t,e,F,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="hetzner에서의-openclaw-docker-프로덕션-vps-가이드" tabindex="-1">Hetzner에서의 OpenClaw (Docker, 프로덕션 VPS 가이드) <a class="header-anchor" href="#hetzner에서의-openclaw-docker-프로덕션-vps-가이드" aria-label="Permalink to &quot;Hetzner에서의 OpenClaw (Docker, 프로덕션 VPS 가이드)&quot;">​</a></h1><h2 id="목표" tabindex="-1">목표 <a class="header-anchor" href="#목표" aria-label="Permalink to &quot;목표&quot;">​</a></h2><p>내구성 있는 상태, 베이킹된 바이너리 및 안전한 재시작 동작을 갖춘 Docker를 사용하여 Hetzner VPS에서 영구적인 OpenClaw Gateway를 실행합니다.</p><p>&quot;~$5에 24/7 OpenClaw&quot;를 원한다면 이것이 가장 간단하고 신뢰할 수 있는 설정입니다. Hetzner 가격은 변경됩니다. 가장 작은 Debian/Ubuntu VPS를 선택하고 OOM이 발생하면 확장합니다.</p><p>보안 모델 참고 사항:</p><ul><li>회사 공유 에이전트는 모든 사람이 동일한 신뢰 경계에 있고 런타임이 비즈니스 전용인 경우 괜찮습니다.</li><li>엄격한 분리를 유지합니다: 전용 VPS/런타임 + 전용 계정; 해당 호스트에 개인 Apple/Google/브라우저/비밀번호 관리자 프로파일 없음.</li><li>사용자가 서로에게 적대적인 경우 게이트웨이/호스트/OS 사용자별로 분리합니다.</li></ul><p><a href="/openclaw-docs-ko/gateway/security/">보안</a> 및 <a href="/openclaw-docs-ko/vps">VPS 호스팅</a>을 참조하십시오.</p><h2 id="수행-작업-간단한-용어" tabindex="-1">수행 작업 (간단한 용어) <a class="header-anchor" href="#수행-작업-간단한-용어" aria-label="Permalink to &quot;수행 작업 (간단한 용어)&quot;">​</a></h2><ul><li>소형 Linux 서버 임대 (Hetzner VPS)</li><li>Docker 설치 (격리된 앱 런타임)</li><li>Docker에서 OpenClaw Gateway 시작</li><li>호스트에서 <code>~/.openclaw</code> + <code>~/.openclaw/workspace</code> 지속 (재시작/재빌드 후에도 유지)</li><li>SSH 터널을 통해 노트북에서 Control UI 액세스</li></ul><p>해당 마운트된 <code>~/.openclaw</code> 상태에는 <code>openclaw.json</code>, 에이전트별 <code>agents/&lt;agentId&gt;/agent/auth-profiles.json</code> 및 <code>.env</code>가 포함됩니다.</p><p>Gateway는 다음을 통해 액세스할 수 있습니다:</p><ul><li>노트북에서 SSH 포트 포워딩</li><li>방화벽 및 토큰을 직접 관리하는 경우 직접 포트 노출</li></ul><p>이 가이드는 Hetzner에서 Ubuntu 또는 Debian을 가정합니다. 다른 Linux VPS를 사용하는 경우 패키지를 적절히 매핑합니다. 일반 Docker 흐름은 <a href="/openclaw-docs-ko/install/docker">Docker</a>를 참조하십시오.</p><hr><h2 id="빠른-경로-숙련된-운영자" tabindex="-1">빠른 경로 (숙련된 운영자) <a class="header-anchor" href="#빠른-경로-숙련된-운영자" aria-label="Permalink to &quot;빠른 경로 (숙련된 운영자)&quot;">​</a></h2><ol><li>Hetzner VPS 프로비저닝</li><li>Docker 설치</li><li>OpenClaw 저장소 복제</li><li>지속 호스트 디렉터리 생성</li><li><code>.env</code> 및 <code>docker-compose.yml</code> 구성</li><li>이미지에 필요한 바이너리 베이킹</li><li><code>docker compose up -d</code></li><li>지속성 및 Gateway 액세스 확인</li></ol><hr><h2 id="필요-사항" tabindex="-1">필요 사항 <a class="header-anchor" href="#필요-사항" aria-label="Permalink to &quot;필요 사항&quot;">​</a></h2><ul><li>루트 액세스가 있는 Hetzner VPS</li><li>노트북에서 SSH 액세스</li><li>SSH + 복사/붙여넣기에 대한 기본적인 편안함</li><li>약 20분</li><li>Docker 및 Docker Compose</li><li>모델 인증 자격 증명</li><li>선택적 제공자 자격 증명 <ul><li>WhatsApp QR</li><li>Telegram 봇 토큰</li><li>Gmail OAuth</li></ul></li></ul><hr><ol><li><p><strong>VPS 프로비저닝</strong></p><p>Hetzner에서 Ubuntu 또는 Debian VPS를 생성합니다.</p><pre><code>루트로 연결:

\`\`\`bash
ssh root@YOUR_VPS_IP
\`\`\`

이 가이드는 VPS가 상태 유지인 것으로 가정합니다.
일회용 인프라로 취급하지 마십시오.
</code></pre></li><li><p><strong>Docker 설치 (VPS에서)</strong></p></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca-certificates</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -fsSL</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://get.docker.com</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sh</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    확인:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    docker</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --version</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> version</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">3.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">OpenClaw 저장소 복제</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clone</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/openclaw/openclaw.git</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 가이드는 바이너리 지속성을 보장하기 위해 사용자 정의 이미지를 빌드하는 것으로 가정합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">4.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">지속 호스트 디렉터리 생성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 컨테이너는 임시입니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    모든</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 장기 상태는 호스트에 있어야 합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /root/.openclaw/workspace</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 컨테이너 사용자에게 소유권 설정 (uid 1000):</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    chown</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -R</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 1000:1000</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /root/.openclaw</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">5.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">환경 변수 구성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">저장소</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 루트에 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.env</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 생성합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_IMAGE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">openclaw:latest</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_GATEWAY_TOKEN</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">change-me-now</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_GATEWAY_BIND</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">lan</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_GATEWAY_PORT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">18789</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_CONFIG_DIR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/root/.openclaw</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_WORKSPACE_DIR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/root/.openclaw/workspace</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    GOG_KEYRING_PASSWORD</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">change-me-now</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    XDG_CONFIG_HOME</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/home/node/.openclaw</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    강력한</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 시크릿 생성:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    openssl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> rand</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -hex</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 32</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    **이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 파일을 커밋하지 마십시오.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.env</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">파일은</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OPENCLAW_GATEWAY_TOKEN</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">과</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 같은 컨테이너/런타임 환경 변수용입니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    저장된</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 제공자 OAuth/API 키 인증은 마운트된</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">~/.openclaw/agents/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;agentId&gt;/agent/auth-profiles.json</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 있습니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">6.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Docker Compose 구성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker-compose.yml</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 생성하거나 업데이트합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yaml</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    services:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      openclaw-gateway:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        image:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \${OPENCLAW_IMAGE}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        build:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> .</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        restart:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> unless-stopped</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        env_file:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> .env</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        environment:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> HOME=/home/node</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> NODE_ENV=production</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> TERM=xterm-256color</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OPENCLAW_GATEWAY_BIND=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${OPENCLAW_GATEWAY_BIND}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OPENCLAW_GATEWAY_PORT=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${OPENCLAW_GATEWAY_PORT}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OPENCLAW_GATEWAY_TOKEN=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${OPENCLAW_GATEWAY_TOKEN}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> GOG_KEYRING_PASSWORD=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${GOG_KEYRING_PASSWORD}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> XDG_CONFIG_HOME=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${XDG_CONFIG_HOME}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        volumes:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \${OPENCLAW_CONFIG_DIR}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:/home/node/.openclaw</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \${OPENCLAW_WORKSPACE_DIR}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:/home/node/.openclaw/workspace</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        ports:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # 권장: VPS에서 Gateway를 루프백 전용으로 유지하고 SSH 터널을 통해 액세스합니다.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # 공개적으로 노출하려면 \`127.0.0.1:\` 접두사를 제거하고 방화벽을 적절히 설정합니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;127.0.0.1:\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OPENCLAW_GATEWAY_PORT</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}:18789&quot;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        command</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;node&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;dist/index.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;gateway&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;--bind&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OPENCLAW_GATEWAY_BIND</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;--port&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OPENCLAW_GATEWAY_PORT</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;--allow-unconfigured&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">--allow-unconfigured</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 부트스트랩 편의를 위한 것일 뿐, 적절한 게이트웨이 구성의 대체가 아닙니다. 여전히 인증(\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gateway.auth.token</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 비밀번호)을 설정하고 배포에 안전한 바인드 설정을 사용합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">7.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">공유 Docker VM 런타임 단계</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">일반적인</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Docker 호스트 흐름을 위해 공유 런타임 가이드를 사용합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [이미지에 필요한 바이너리 베이킹](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#bake-required-binaries-into-the-image</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [빌드 및 실행](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#build-and-launch</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [지속 위치](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#what-persists-where</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [업데이트](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#updates</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">8.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Hetzner 특정 액세스</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">공유</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 빌드 및 실행 단계 후 노트북에서 터널을 연결합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    ssh</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -N</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -L</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 18789:127.0.0.1:18789</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> root@YOUR_VPS_IP</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    열기:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">http://127.0.0.1:18789/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    구성된</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 공유 시크릿을 붙여넣습니다. 이 가이드는 기본적으로 게이트웨이 토큰을 사용합니다. 비밀번호 인증으로 전환한 경우 해당 비밀번호를 사용합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">공유</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 지속성 맵은 [Docker VM 런타임](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#what-persists-where</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)에 있습니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 코드로서의 인프라 (Terraform)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">인프라</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 코드 워크플로우를 선호하는 팀을 위해 커뮤니티에서 유지 관리하는 Terraform 설정이 다음을 제공합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 원격 상태 관리가 포함된 모듈식 Terraform 구성</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cloud-init을 통한 자동화된 프로비저닝</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 배포 스크립트 (부트스트랩, 배포, 백업/복원)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 보안 강화 (방화벽, UFW, SSH 전용 액세스)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 게이트웨이 액세스를 위한 SSH 터널 구성</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">저장소:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 인프라: [openclaw-terraform-hetzner](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://github.com/andreesg/openclaw-terraform-hetzner</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Docker 구성: [openclaw-docker-config](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">https://github.com/andreesg/openclaw-docker-config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 접근 방식은 재현 가능한 배포, 버전 관리 인프라 및 자동화된 재해 복구를 통해 위의 Docker 설정을 보완합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">참고:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 커뮤니티에서 유지 관리합니다. 문제나 기여는 위의 저장소 링크를 참조하십시오.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 다음 단계</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 메시징 채널 설정: [채널](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/channels/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Gateway 구성: [Gateway 구성](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/gateway/configuration</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> OpenClaw를 최신 상태로 유지: [업데이트](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/updating</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span></code></pre></div>`,22)])])}const y=i(p,[["render",h]]);export{g as __pageData,y as default};
