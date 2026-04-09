import{_ as i,o as a,c as n,ae as l}from"./chunks/framework.C7FLYIpo.js";const g=JSON.parse('{"title":"GCP","description":"내구성 있는 상태를 갖춘 GCP Compute Engine VM (Docker)에서 24/7 OpenClaw Gateway 실행","frontmatter":{"title":"GCP","description":"내구성 있는 상태를 갖춘 GCP Compute Engine VM (Docker)에서 24/7 OpenClaw Gateway 실행"},"headers":[],"relativePath":"install/gcp.md","filePath":"install/gcp.md","lastUpdated":null}'),p={name:"install/gcp.md"};function h(k,s,t,e,F,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="gcp-compute-engine에서의-openclaw-docker-프로덕션-vps-가이드" tabindex="-1">GCP Compute Engine에서의 OpenClaw (Docker, 프로덕션 VPS 가이드) <a class="header-anchor" href="#gcp-compute-engine에서의-openclaw-docker-프로덕션-vps-가이드" aria-label="Permalink to &quot;GCP Compute Engine에서의 OpenClaw (Docker, 프로덕션 VPS 가이드)&quot;">​</a></h1><h2 id="목표" tabindex="-1">목표 <a class="header-anchor" href="#목표" aria-label="Permalink to &quot;목표&quot;">​</a></h2><p>내구성 있는 상태, 베이킹된 바이너리 및 안전한 재시작 동작을 갖춘 Docker를 사용하여 GCP Compute Engine VM에서 영구적인 OpenClaw Gateway를 실행합니다.</p><p>&quot;월 ~$5-12에 24/7 OpenClaw&quot;를 원한다면 이것이 Google Cloud에서 신뢰할 수 있는 설정입니다. 가격은 머신 유형 및 지역에 따라 다릅니다. 작업 부하에 맞는 가장 작은 VM을 선택하고 OOM이 발생하면 확장합니다.</p><h2 id="수행-작업-간단한-용어" tabindex="-1">수행 작업 (간단한 용어) <a class="header-anchor" href="#수행-작업-간단한-용어" aria-label="Permalink to &quot;수행 작업 (간단한 용어)&quot;">​</a></h2><ul><li>GCP 프로젝트 생성 및 결제 활성화</li><li>Compute Engine VM 생성</li><li>Docker 설치 (격리된 앱 런타임)</li><li>Docker에서 OpenClaw Gateway 시작</li><li>호스트에서 <code>~/.openclaw</code> + <code>~/.openclaw/workspace</code> 지속 (재시작/재빌드 후에도 유지)</li><li>SSH 터널을 통해 노트북에서 Control UI 액세스</li></ul><p>해당 마운트된 <code>~/.openclaw</code> 상태에는 <code>openclaw.json</code>, 에이전트별 <code>agents/&lt;agentId&gt;/agent/auth-profiles.json</code> 및 <code>.env</code>가 포함됩니다.</p><p>Gateway는 다음을 통해 액세스할 수 있습니다:</p><ul><li>노트북에서 SSH 포트 포워딩</li><li>방화벽 및 토큰을 직접 관리하는 경우 직접 포트 노출</li></ul><p>이 가이드는 GCP Compute Engine에서 Debian을 사용합니다. Ubuntu도 작동합니다. 패키지를 적절히 매핑합니다. 일반 Docker 흐름은 <a href="/openclaw-docs-ko/install/docker">Docker</a>를 참조하십시오.</p><hr><h2 id="빠른-경로-숙련된-운영자" tabindex="-1">빠른 경로 (숙련된 운영자) <a class="header-anchor" href="#빠른-경로-숙련된-운영자" aria-label="Permalink to &quot;빠른 경로 (숙련된 운영자)&quot;">​</a></h2><ol><li>GCP 프로젝트 생성 + Compute Engine API 활성화</li><li>Compute Engine VM 생성 (e2-small, Debian 12, 20GB)</li><li>VM에 SSH 접속</li><li>Docker 설치</li><li>OpenClaw 저장소 복제</li><li>지속 호스트 디렉터리 생성</li><li><code>.env</code> 및 <code>docker-compose.yml</code> 구성</li><li>필요한 바이너리 베이킹, 빌드 및 실행</li></ol><hr><h2 id="필요-사항" tabindex="-1">필요 사항 <a class="header-anchor" href="#필요-사항" aria-label="Permalink to &quot;필요 사항&quot;">​</a></h2><ul><li>GCP 계정 (e2-micro 무료 티어 사용 가능)</li><li>gcloud CLI 설치 (또는 Cloud Console 사용)</li><li>노트북에서 SSH 액세스</li><li>SSH + 복사/붙여넣기에 대한 기본적인 편안함</li><li>약 20-30분</li><li>Docker 및 Docker Compose</li><li>모델 인증 자격 증명</li><li>선택적 제공자 자격 증명 <ul><li>WhatsApp QR</li><li>Telegram 봇 토큰</li><li>Gmail OAuth</li></ul></li></ul><hr><ol><li><p><strong>gcloud CLI 설치 (또는 Console 사용)</strong></p><p><strong>옵션 A: gcloud CLI</strong> (자동화에 권장)</p><pre><code>[https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)에서 설치

초기화 및 인증:

\`\`\`bash
gcloud init
gcloud auth login
\`\`\`

**옵션 B: Cloud Console**

[https://console.cloud.google.com](https://console.cloud.google.com)의 웹 UI를 통해 모든 단계를 수행할 수 있습니다.
</code></pre></li><li><p><strong>GCP 프로젝트 생성</strong></p></li></ol><p><strong>CLI:</strong></p><pre><code>   \`\`\`bash
   gcloud projects create my-openclaw-project --name=&quot;OpenClaw Gateway&quot;
   gcloud config set project my-openclaw-project
   \`\`\`

   [https://console.cloud.google.com/billing](https://console.cloud.google.com/billing)에서 결제를 활성화합니다 (Compute Engine에 필요).

   Compute Engine API 활성화:

   \`\`\`bash
   gcloud services enable compute.googleapis.com
   \`\`\`

   **Console:**

   1. IAM &amp; Admin &gt; Create Project로 이동
   2. 이름을 지정하고 생성
   3. 프로젝트에 대한 결제 활성화
   4. APIs &amp; Services &gt; Enable APIs &gt; &quot;Compute Engine API&quot; 검색 &gt; 활성화
</code></pre><ol start="3"><li><strong>VM 생성</strong></li></ol><p><strong>머신 유형:</strong></p><pre><code>   | 유형      | 사양                     | 비용               | 참고 사항                                            |
   | --------- | ------------------------ | ------------------ | ---------------------------------------------------- |
   | e2-medium | 2 vCPU, 4GB RAM          | ~월 $25            | 로컬 Docker 빌드에 가장 신뢰할 수 있음              |
   | e2-small  | 2 vCPU, 2GB RAM          | ~월 $12            | Docker 빌드에 최소 권장 사항                         |
   | e2-micro  | 2 vCPU (공유), 1GB RAM   | 무료 티어 사용 가능 | Docker 빌드 OOM (종료 코드 137)으로 자주 실패        |

   **CLI:**

   \`\`\`bash
   gcloud compute instances create openclaw-gateway \\
     --zone=us-central1-a \\
     --machine-type=e2-small \\
     --boot-disk-size=20GB \\
     --image-family=debian-12 \\
     --image-project=debian-cloud
   \`\`\`

   **Console:**

   1. Compute Engine &gt; VM instances &gt; Create instance로 이동
   2. 이름: \`openclaw-gateway\`
   3. 지역: \`us-central1\`, 존: \`us-central1-a\`
   4. 머신 유형: \`e2-small\`
   5. 부트 디스크: Debian 12, 20GB
   6. 생성
</code></pre><ol start="4"><li><strong>VM에 SSH 접속</strong></li></ol><p><strong>CLI:</strong></p><pre><code>   \`\`\`bash
   gcloud compute ssh openclaw-gateway --zone=us-central1-a
   \`\`\`

   **Console:**

   Compute Engine 대시보드에서 VM 옆의 &quot;SSH&quot; 버튼을 클릭합니다.

   참고: SSH 키 전파는 VM 생성 후 1-2분이 걸릴 수 있습니다. 연결이 거부되면 기다렸다가 재시도합니다.
</code></pre><ol start="5"><li><strong>Docker 설치 (VM에서)</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apt-get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -y</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca-certificates</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -fsSL</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://get.docker.com</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> sh</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> usermod</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -aG</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docker</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $USER</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    그룹</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 변경이 적용되도록 로그아웃 후 다시 로그인합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    exit</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    그런</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 다음 다시 SSH 접속:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compute</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-gateway</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --zone=us-central1-a</span></span>
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
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">6.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">OpenClaw 저장소 복제</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clone</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/openclaw/openclaw.git</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 가이드는 바이너리 지속성을 보장하기 위해 사용자 정의 이미지를 빌드하는 것으로 가정합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">7.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">지속 호스트 디렉터리 생성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 컨테이너는 임시입니다.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    모든</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 장기 상태는 호스트에 있어야 합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.openclaw</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.openclaw/workspace</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">8.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">환경 변수 구성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">저장소</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 루트에 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.env</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 생성합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_IMAGE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">openclaw:latest</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_GATEWAY_TOKEN</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">change-me-now</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_GATEWAY_BIND</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">lan</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_GATEWAY_PORT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">18789</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_CONFIG_DIR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/home/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$USER</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/.openclaw</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OPENCLAW_WORKSPACE_DIR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/home/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$USER</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/.openclaw/workspace</span></span>
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
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">9.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Docker Compose 구성</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
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
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # 권장: VM에서 Gateway를 루프백 전용으로 유지하고 SSH 터널을 통해 액세스합니다.</span></span>
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
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">10.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">공유 Docker VM 런타임 단계</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">일반적인</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Docker 호스트 흐름을 위해 공유 런타임 가이드를 사용합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [이미지에 필요한 바이너리 베이킹](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#bake-required-binaries-into-the-image</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [빌드 및 실행](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#build-and-launch</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [지속 위치](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#what-persists-where</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    -</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [업데이트](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#updates</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">11.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">GCP 특정 실행 참고 사항</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">GCP에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --frozen-lockfile</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">중에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Killed</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 종료 코드 137로 빌드가 실패하면 VM의 메모리가 부족합니다. 최소 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">e2-small</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용하거나 더 신뢰할 수 있는 첫 번째 빌드를 위해 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">e2-medium</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">을</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 사용합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    LAN에</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 바인딩할 때(\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">OPENCLAW_GATEWAY_BIND</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">lan\`), 계속하기 전에 신뢰할 수 있는 브라우저 오리진을 구성합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --rm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-cli</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gateway.controlUi.allowedOrigins</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;[&quot;http://127.0.0.1:18789&quot;]&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --strict-json</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    게이트웨이</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 포트를 변경한 경우 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">18789</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">를</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 구성된 포트로 교체합니다.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">12.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> **</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">노트북에서 액세스</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Gateway</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 포트를 전달하는 SSH 터널 생성:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compute</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-gateway</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --zone=us-central1-a</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -L</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 18789:127.0.0.1:18789</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    브라우저에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 열기:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">http://127.0.0.1:18789/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    깨끗한</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 대시보드 링크 재출력:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --rm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-cli</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dashboard</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --no-open</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    UI에서</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 공유 시크릿 인증을 요청하면 구성된 토큰 또는 비밀번호를 Control UI 설정에 붙여넣습니다. 이 Docker 흐름은 기본적으로 토큰을 씁니다. 컨테이너 구성을 비밀번호 인증으로 전환한 경우 해당 비밀번호를 사용합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    Control</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> UI에 \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unauthorized</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">또는</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">disconnected</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (1008): pairing required</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">가</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 표시되면 브라우저 장치를 승인합니다:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --rm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-cli</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> devices</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --rm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-cli</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> devices</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> approve</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">requestI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    \`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    공유</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 지속성 및 업데이트 참조가 필요한 경우</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    [Docker VM 런타임](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#what-persists-where</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">및</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> [Docker VM 런타임 업데이트](</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/install/docker-vm-runtime#updates</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)를 참조하십시오.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">---</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## 문제 해결</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">SSH 연결 거부됨</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SSH</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 키 전파는 VM 생성 후 1-2분이 걸릴 수 있습니다. 기다렸다가 재시도합니다.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">OS 로그인 문제</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OS</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 로그인 프로파일 확인:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compute</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> os-login</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> describe-profile</span></span></code></pre></div><p>계정에 필요한 IAM 권한(Compute OS Login 또는 Compute OS Admin Login)이 있는지 확인합니다.</p><p><strong>메모리 부족 (OOM)</strong></p><p>Docker 빌드가 <code>Killed</code> 및 종료 코드 137로 실패하면 VM이 OOM 종료된 것입니다. e2-small(최소) 또는 e2-medium(신뢰할 수 있는 로컬 빌드에 권장)으로 업그레이드합니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># VM을 먼저 중지</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compute</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> instances</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> stop</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-gateway</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --zone=us-central1-a</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 머신 유형 변경</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compute</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> instances</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set-machine-type</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-gateway</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --zone=us-central1-a</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --machine-type=e2-small</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># VM 시작</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compute</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> instances</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> start</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-gateway</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --zone=us-central1-a</span></span></code></pre></div><hr><h2 id="서비스-계정-보안-모범-사례" tabindex="-1">서비스 계정 (보안 모범 사례) <a class="header-anchor" href="#서비스-계정-보안-모범-사례" aria-label="Permalink to &quot;서비스 계정 (보안 모범 사례)&quot;">​</a></h2><p>개인 사용의 경우 기본 사용자 계정으로 충분합니다.</p><p>자동화 또는 CI/CD 파이프라인의 경우 최소 권한을 가진 전용 서비스 계정을 생성합니다:</p><ol><li><p>서비스 계정 생성:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> iam</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> service-accounts</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> openclaw-deploy</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --display-name=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;OpenClaw Deployment&quot;</span></span></code></pre></div></li><li><p>Compute Instance Admin 역할(또는 더 좁은 사용자 정의 역할) 부여:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gcloud</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> projects</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add-iam-policy-binding</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-openclaw-project</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --member=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;serviceAccount:openclaw-deploy@my-openclaw-project.iam.gserviceaccount.com&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --role=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;roles/compute.instanceAdmin.v1&quot;</span></span></code></pre></div></li></ol><p>자동화에 Owner 역할을 사용하지 마십시오. 최소 권한 원칙을 사용합니다.</p><p>IAM 역할 세부 정보는 <a href="https://cloud.google.com/iam/docs/understanding-roles" target="_blank" rel="noreferrer">https://cloud.google.com/iam/docs/understanding-roles</a>를 참조하십시오.</p><hr><h2 id="다음-단계" tabindex="-1">다음 단계 <a class="header-anchor" href="#다음-단계" aria-label="Permalink to &quot;다음 단계&quot;">​</a></h2><ul><li>메시징 채널 설정: <a href="/openclaw-docs-ko/channels/">채널</a></li><li>로컬 장치를 노드로 페어링: <a href="/openclaw-docs-ko/nodes/">노드</a></li><li>Gateway 구성: <a href="/openclaw-docs-ko/gateway/configuration">Gateway 구성</a></li></ul>`,42)])])}const C=i(p,[["render",h]]);export{g as __pageData,C as default};
