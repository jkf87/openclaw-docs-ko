import{_ as i,o as a,c as n,ag as l}from"./chunks/framework.CTpQozEL.js";const E=JSON.parse('{"title":"Discord","description":"Discord 봇 지원 상태, 기능 및 구성","frontmatter":{"title":"Discord","description":"Discord 봇 지원 상태, 기능 및 구성"},"headers":[],"relativePath":"channels/discord.md","filePath":"channels/discord.md","lastUpdated":null}'),e={name:"channels/discord.md"};function t(p,s,h,k,d,o){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="discord-bot-api" tabindex="-1">Discord (Bot API) <a class="header-anchor" href="#discord-bot-api" aria-label="Permalink to &quot;Discord (Bot API)&quot;">​</a></h1><p>상태: 공식 Discord 게이트웨이를 통한 DM 및 길드 채널에서 준비 완료.</p><blockquote><p><strong>페어링</strong> Discord DM은 기본적으로 페어링 모드입니다.</p></blockquote><blockquote><p><strong>슬래시 명령</strong> 네이티브 명령 동작 및 명령 카탈로그.</p></blockquote><blockquote><p><strong>채널 문제 해결</strong> 채널 간 진단 및 수리 흐름.</p></blockquote><h2 id="빠른-설정" tabindex="-1">빠른 설정 <a class="header-anchor" href="#빠른-설정" aria-label="Permalink to &quot;빠른 설정&quot;">​</a></h2><p>새 봇이 있는 애플리케이션을 만들고, 봇을 서버에 추가하고, OpenClaw에 페어링해야 합니다. 개인 비공개 서버에 봇을 추가하는 것을 권장합니다. 아직 없는 경우 <a href="https://support.discord.com/hc/en-us/articles/204849977-How-do-I-create-a-server" target="_blank" rel="noreferrer">먼저 서버를 생성하십시오</a> (<strong>내 서버 만들기 &gt; 나와 내 친구들용</strong> 선택).</p><ol><li><p><strong>Discord 애플리케이션 및 봇 생성</strong></p><p><a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer">Discord 개발자 포털</a>로 이동하여 <strong>새 애플리케이션</strong>을 클릭합니다. &quot;OpenClaw&quot; 같은 이름을 입력합니다.</p><pre><code>사이드바에서 **봇**을 클릭합니다. **사용자 이름**을 OpenClaw 에이전트 이름으로 설정합니다.
</code></pre></li><li><p><strong>특권 인텐트 활성화</strong></p></li></ol><p><strong>봇</strong> 페이지에서 <strong>특권 게이트웨이 인텐트</strong>로 스크롤하여 다음을 활성화합니다:</p><pre><code>   - **메시지 콘텐츠 인텐트** (필수)
   - **서버 멤버 인텐트** (권장; 역할 허용 목록 및 이름-ID 매칭에 필요)
   - **존재 인텐트** (선택 사항; 존재 업데이트에만 필요)
</code></pre><ol start="3"><li><strong>봇 토큰 복사</strong></li></ol><p><strong>봇</strong> 페이지에서 위로 스크롤하여 <strong>토큰 재설정</strong>을 클릭합니다.</p><pre><code>   ::: info NOTE
</code></pre><p>이름과 달리 이 작업은 첫 번째 토큰을 생성하는 것입니다. 아무것도 &quot;재설정&quot;되지 않습니다. :::</p><pre><code>   토큰을 복사하고 저장합니다. 이것이 **봇 토큰**이며 곧 필요합니다.
</code></pre><ol start="4"><li><strong>초대 URL 생성 및 서버에 봇 추가</strong></li></ol><p>사이드바에서 <strong>OAuth2</strong>를 클릭합니다. 서버에 봇을 추가할 올바른 권한으로 초대 URL을 생성합니다.</p><pre><code>   **OAuth2 URL 생성기**로 스크롤하여 다음을 활성화합니다:

   - \`bot\`
   - \`applications.commands\`

   아래에 **봇 권한** 섹션이 나타납니다. 다음을 활성화합니다:

   - 채널 보기
   - 메시지 보내기
   - 메시지 기록 읽기
   - 링크 임베드
   - 파일 첨부
   - 반응 추가 (선택 사항)

   하단에서 생성된 URL을 복사하여 브라우저에 붙여넣고, 서버를 선택하고, **계속**을 클릭합니다. 이제 Discord 서버에서 봇을 볼 수 있어야 합니다.
</code></pre><ol start="5"><li><strong>개발자 모드 활성화 및 ID 수집</strong></li></ol><p>Discord 앱으로 돌아가서 내부 ID를 복사할 수 있도록 개발자 모드를 활성화해야 합니다.</p><pre><code>   1. **사용자 설정** (아바타 옆 기어 아이콘) → **고급** → **개발자 모드** 켜기
   2. 사이드바에서 **서버 아이콘** 우클릭 → **서버 ID 복사**
   3. **자신의 아바타** 우클릭 → **사용자 ID 복사**

   **서버 ID**와 **사용자 ID**를 봇 토큰 옆에 저장합니다. 다음 단계에서 이 세 가지를 모두 OpenClaw에 전달합니다.
</code></pre><ol start="6"><li><strong>서버 멤버에서 DM 허용</strong></li></ol><p>페어링이 작동하려면 Discord가 봇이 사용자에게 DM을 보낼 수 있도록 해야 합니다. <strong>서버 아이콘</strong> 우클릭 → <strong>개인 정보 설정</strong> → <strong>다이렉트 메시지</strong> 켜기.</p><pre><code>   이렇게 하면 서버 멤버(봇 포함)가 DM을 보낼 수 있습니다.
</code></pre><ol start="7"><li><strong>봇 토큰 안전하게 설정 (채팅에서 전송 금지)</strong></li></ol><p>Discord 봇 토큰은 비밀입니다(비밀번호와 같음). OpenClaw를 실행하는 기기에서 에이전트에 메시지를 보내기 전에 설정하십시오.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> DISCORD_BOT_TOKEN</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;YOUR_BOT_TOKEN&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels.discord.token</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --ref-provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> default</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --ref-source</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> env</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --ref-id</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> DISCORD_BOT_TOKEN</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --dry-run</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels.discord.token</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --ref-provider</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> default</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --ref-source</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> env</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --ref-id</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> DISCORD_BOT_TOKEN</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels.discord.enabled</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --strict-json</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gateway</span></span></code></pre></div><ol start="8"><li><strong>OpenClaw 구성 및 페어링</strong></li></ol><p><strong>에이전트에게 요청</strong></p><p>기존 채널 (예: Telegram)에서 OpenClaw 에이전트와 채팅하여 알립니다. Discord가 첫 번째 채널이라면 대신 CLI/구성 탭을 사용하십시오.</p><pre><code>       &gt; &quot;이미 구성에서 Discord 봇 토큰을 설정했습니다. 사용자 ID \`&amp;lt;user_id&amp;gt;\`와 서버 ID \`&amp;lt;server_id&amp;gt;\`로 Discord 설정을 완료해주세요.&quot;


     **CLI / 구성**
</code></pre><p>파일 기반 구성을 선호하는 경우 다음을 설정합니다:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    discord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      token</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        source</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;env&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;default&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;DISCORD_BOT_TOKEN&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><pre><code>       기본 계정의 환경 변수 폴백:
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">DISCORD_BOT_TOKEN</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">...</span></span></code></pre></div><ol start="9"><li><strong>첫 번째 DM 페어링 승인</strong></li></ol><p>게이트웨이가 실행될 때까지 기다린 다음 Discord에서 봇에게 DM을 보냅니다. 봇이 페어링 코드로 응답합니다.</p><pre><code>   **에이전트에게 요청**
</code></pre><p>기존 채널에서 에이전트에게 페어링 코드를 전송합니다:</p><pre><code>       &gt; &quot;이 Discord 페어링 코드를 승인해주세요: \`&lt;CODE&gt;\`&quot;


     **CLI**
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pairing</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> discord</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pairing</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> approve</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> discord</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">COD</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">E</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div><pre><code>   페어링 코드는 1시간 후 만료됩니다.

   이제 Discord DM을 통해 에이전트와 채팅할 수 있어야 합니다.
</code></pre><h2 id="권장-길드-워크스페이스-설정" tabindex="-1">권장: 길드 워크스페이스 설정 <a class="header-anchor" href="#권장-길드-워크스페이스-설정" aria-label="Permalink to &quot;권장: 길드 워크스페이스 설정&quot;">​</a></h2><p>DM이 작동하면 Discord 서버를 각 채널이 자체 컨텍스트로 에이전트 세션을 갖는 전체 워크스페이스로 설정할 수 있습니다.</p><ol><li><p><strong>길드 허용 목록에 서버 추가</strong></p><p><strong>에이전트에게 요청</strong></p></li></ol><blockquote><p>&quot;내 Discord 서버 ID <code>&amp;lt;server_id&amp;gt;</code>를 길드 허용 목록에 추가해주세요&quot;</p></blockquote><pre><code>     **구성**
</code></pre><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">     channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">       discord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         groupPolicy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;allowlist&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">         guilds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           YOUR_SERVER_ID</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             requireMention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">             users</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;YOUR_USER_ID&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">           },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   }</span></span></code></pre></div><ol start="2"><li><strong>@언급 없이 응답 허용</strong></li></ol><p>기본적으로 에이전트는 @언급 시에만 길드 채널에서 응답합니다. 비공개 서버의 경우 모든 메시지에 응답하도록 하는 것이 좋습니다.</p><pre><code>   **에이전트에게 요청**
</code></pre><blockquote><p>&quot;이 서버에서 @언급 없이도 에이전트가 응답할 수 있도록 허용해주세요&quot;</p></blockquote><pre><code>     **구성**
</code></pre><p>길드 구성에서 <code>requireMention: false</code>를 설정합니다:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    discord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      guilds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        YOUR_SERVER_ID</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          requireMention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><ol start="3"><li><strong>길드 채널에서 메모리 계획</strong></li></ol><p>기본적으로 장기 메모리(MEMORY.md)는 DM 세션에서만 로드됩니다. 길드 채널은 MEMORY.md를 자동으로 로드하지 않습니다.</p><pre><code>   **에이전트에게 요청**
</code></pre><blockquote><p>&quot;Discord 채널에서 질문할 때 MEMORY.md의 장기 컨텍스트가 필요하면 memory_search 또는 memory_get을 사용해주세요.&quot;</p></blockquote><pre><code>     **수동**
</code></pre><p>모든 채널에서 공유 컨텍스트가 필요한 경우 안정적인 지침을 <code>AGENTS.md</code> 또는 <code>USER.md</code>에 넣으십시오.</p><p>이제 Discord 서버에서 채널을 만들고 채팅을 시작합니다. 에이전트는 채널 이름을 볼 수 있으며, 각 채널은 자체 격리된 세션을 가집니다.</p><h2 id="런타임-모델" tabindex="-1">런타임 모델 <a class="header-anchor" href="#런타임-모델" aria-label="Permalink to &quot;런타임 모델&quot;">​</a></h2><ul><li>게이트웨이가 Discord 연결을 소유합니다.</li><li>응답 라우팅은 결정적입니다: Discord 인바운드는 Discord로 다시 응답합니다.</li><li>기본적으로 (<code>session.dmScope=main</code>) 다이렉트 채팅은 에이전트 메인 세션을 공유합니다 (<code>agent:main:main</code>).</li><li>길드 채널은 격리된 세션 키입니다 (<code>agent:&amp;lt;agentId&amp;gt;:discord:channel:&amp;lt;channelId&amp;gt;</code>).</li><li>그룹 DM은 기본적으로 무시됩니다 (<code>channels.discord.dm.groupEnabled=false</code>).</li></ul><h2 id="포럼-채널" tabindex="-1">포럼 채널 <a class="header-anchor" href="#포럼-채널" aria-label="Permalink to &quot;포럼 채널&quot;">​</a></h2><p>Discord 포럼 및 미디어 채널은 스레드 게시물만 허용합니다. OpenClaw는 두 가지 방법으로 생성을 지원합니다:</p><ul><li>포럼 부모 (<code>channel:&amp;lt;forumId&amp;gt;</code>)에 메시지를 보내 스레드를 자동 생성합니다.</li><li><code>openclaw message thread create</code>를 사용하여 스레드를 직접 생성합니다.</li></ul><p>포럼 상위에 메시지를 보내 스레드 생성 예시:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> message</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> send</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --channel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> discord</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --target</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channel:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">forumId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  --message</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;주제 제목\\n게시물 본문&quot;</span></span></code></pre></div><h2 id="인터랙티브-컴포넌트" tabindex="-1">인터랙티브 컴포넌트 <a class="header-anchor" href="#인터랙티브-컴포넌트" aria-label="Permalink to &quot;인터랙티브 컴포넌트&quot;">​</a></h2><p>OpenClaw는 에이전트 메시지에 Discord 컴포넌트 v2 컨테이너를 지원합니다.</p><p>지원 블록:</p><ul><li><code>text</code>, <code>section</code>, <code>separator</code>, <code>actions</code>, <code>media-gallery</code>, <code>file</code></li><li>액션 행은 최대 5개의 버튼 또는 단일 선택 메뉴를 허용합니다</li></ul><p>예시:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;discord&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;send&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;channel:123456789012345678&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;선택적 폴백 텍스트&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  components</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    reusable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;경로를 선택하세요&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    blocks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;actions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        buttons</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            label</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;승인&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;success&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            allowedUsers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;123456789012345678&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">label</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;거부&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;danger&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="접근-제어-및-라우팅" tabindex="-1">접근 제어 및 라우팅 <a class="header-anchor" href="#접근-제어-및-라우팅" aria-label="Permalink to &quot;접근 제어 및 라우팅&quot;">​</a></h2><p><strong>DM 정책</strong></p><p><code>channels.discord.dmPolicy</code>는 DM 접근을 제어합니다:</p><pre><code>- \`pairing\` (기본값)
- \`allowlist\`
- \`open\` (\`channels.discord.allowFrom\`에 \`&quot;*&quot;\` 포함 필요)
- \`disabled\`
</code></pre><p><strong>길드 정책</strong></p><p>길드 처리는 <code>channels.discord.groupPolicy</code>로 제어됩니다:</p><pre><code>- \`open\`
- \`allowlist\`
- \`disabled\`

\`channels.discord\` 존재 시 보안 기준은 \`allowlist\`입니다.

예시:
</code></pre><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    discord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      groupPolicy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;allowlist&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      guilds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;123456789012345678&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          requireMention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          ignoreOtherMentions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          users</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;987654321098765432&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          roles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;123456789012345678&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            general</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">allow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            help</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">allow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">requireMention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>언급 및 그룹 DM</strong></p><p>길드 메시지는 기본적으로 언급 게이팅됩니다.</p><pre><code>언급 감지 포함:

- 명시적 봇 언급
- 구성된 언급 패턴
- 지원되는 경우 암시적 봇-응답 동작

그룹 DM:

- 기본값: 무시됨 (\`dm.groupEnabled=false\`)
- \`dm.groupChannels\`를 통한 선택적 허용 목록
</code></pre><h3 id="역할-기반-에이전트-라우팅" tabindex="-1">역할 기반 에이전트 라우팅 <a class="header-anchor" href="#역할-기반-에이전트-라우팅" aria-label="Permalink to &quot;역할 기반 에이전트 라우팅&quot;">​</a></h3><p><code>bindings[].match.roles</code>를 사용하여 역할 ID별로 Discord 길드 멤버를 다른 에이전트로 라우팅합니다.</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  bindings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      agentId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;opus&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        channel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;discord&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        guildId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;123456789012345678&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        roles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;111111111111111111&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      agentId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sonnet&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        channel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;discord&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        guildId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;123456789012345678&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="개발자-포털-설정" tabindex="-1">개발자 포털 설정 <a class="header-anchor" href="#개발자-포털-설정" aria-label="Permalink to &quot;개발자 포털 설정&quot;">​</a></h2><details class="details custom-block"><summary>앱 및 봇 생성</summary><ol><li>Discord 개발자 포털 → <strong>애플리케이션</strong> → <strong>새 애플리케이션</strong> 2. <strong>봇</strong> → <strong>봇 추가</strong> 3. 봇 토큰 복사</li></ol></details><details class="details custom-block"><summary>특권 인텐트</summary><p><strong>봇 → 특권 게이트웨이 인텐트</strong>에서 다음을 활성화합니다:</p><pre><code>- 메시지 콘텐츠 인텐트
- 서버 멤버 인텐트 (권장)
</code></pre></details><details class="details custom-block"><summary>OAuth 범위 및 기본 권한</summary><p>OAuth URL 생성기:</p><pre><code>- 범위: \`bot\`, \`applications.commands\`

일반적인 기본 권한:

- 채널 보기
- 메시지 보내기
- 메시지 기록 읽기
- 링크 임베드
- 파일 첨부
- 반응 추가 (선택 사항)

명시적으로 필요한 경우가 아니면 \`Administrator\`를 피하십시오.
</code></pre></details><details class="details custom-block"><summary>ID 복사</summary><p>Discord 개발자 모드를 활성화한 다음 다음을 복사합니다:</p><pre><code>- 서버 ID
- 채널 ID
- 사용자 ID

안정적인 감사 및 프로브를 위해 OpenClaw 구성에서 숫자 ID를 사용하십시오.
</code></pre></details><h2 id="네이티브-명령-및-명령-인증" tabindex="-1">네이티브 명령 및 명령 인증 <a class="header-anchor" href="#네이티브-명령-및-명령-인증" aria-label="Permalink to &quot;네이티브 명령 및 명령 인증&quot;">​</a></h2><ul><li><code>commands.native</code>는 기본적으로 <code>&quot;auto&quot;</code>이며 Discord에 대해 활성화됩니다.</li><li>채널별 재정의: <code>channels.discord.commands.native</code>.</li><li><code>commands.native=false</code>는 이전에 등록된 Discord 네이티브 명령을 명시적으로 지웁니다.</li></ul><p><a href="/openclaw-docs-ko/tools/slash-commands">슬래시 명령</a> 참조.</p><p>기본 슬래시 명령 설정:</p><ul><li><code>ephemeral: true</code></li></ul><h2 id="기능-세부-사항" tabindex="-1">기능 세부 사항 <a class="header-anchor" href="#기능-세부-사항" aria-label="Permalink to &quot;기능 세부 사항&quot;">​</a></h2><details class="details custom-block"><summary>응답 태그 및 네이티브 응답</summary><p>Discord는 에이전트 출력에서 응답 태그를 지원합니다:</p><pre><code>- \`[[reply_to_current]]\`
- \`[[reply_to:&amp;lt;id&amp;gt;]]\`

\`channels.discord.replyToMode\`로 제어:

- \`off\` (기본값)
- \`first\`
- \`all\`
- \`batched\`
</code></pre></details><details class="details custom-block"><summary>라이브 스트림 미리보기</summary><p>OpenClaw는 임시 메시지를 보내고 텍스트가 도착하면 편집하여 초안 응답을 스트리밍할 수 있습니다.</p><pre><code>- \`channels.discord.streaming\`은 미리보기 스트리밍을 제어합니다 (\`off\` | \`partial\` | \`block\` | \`progress\`, 기본값: \`off\`).

예시:
</code></pre><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    discord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      streaming</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;partial&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></details><details class="details custom-block"><summary>히스토리, 컨텍스트 및 스레드 동작</summary><p>길드 히스토리 컨텍스트:</p><pre><code>- \`channels.discord.historyLimit\` 기본값 \`20\`
- \`0\` 비활성화

스레드 동작:

- Discord 스레드는 채널 세션으로 라우팅됩니다
- 스레드 구성은 스레드별 항목이 없으면 부모 채널 구성을 상속합니다
</code></pre></details><details class="details custom-block"><summary>반응 알림</summary><p>길드별 반응 알림 모드:</p><pre><code>- \`off\`
- \`own\` (기본값)
- \`all\`
- \`allowlist\` (\`guilds.&amp;lt;id&amp;gt;.users\` 사용)
</code></pre></details><details class="details custom-block"><summary>확인 반응</summary><p><code>ackReaction</code>은 OpenClaw가 인바운드 메시지를 처리하는 동안 확인 이모지를 전송합니다.</p><pre><code>확인 순서:

- \`channels.discord.accounts.&amp;lt;accountId&amp;gt;.ackReaction\`
- \`channels.discord.ackReaction\`
- \`messages.ackReaction\`
- 에이전트 ID 이모지 폴백 (없으면 &quot;👀&quot;)
</code></pre></details><details class="details custom-block"><summary>음성 채널</summary><p>OpenClaw는 실시간 연속 대화를 위해 Discord 음성 채널에 참여할 수 있습니다.</p><pre><code>요구 사항:

- 네이티브 명령 활성화 (\`commands.native\` 또는 \`channels.discord.commands.native\`).
- \`channels.discord.voice\` 구성.
- 봇에게 대상 음성 채널에서 연결 + 말하기 권한 필요.

Discord 전용 네이티브 명령 \`/vc join|leave|status\`를 사용하여 세션을 제어합니다.

자동 참여 예시:
</code></pre><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    discord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      voice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        autoJoin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            guildId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;123456789012345678&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            channelId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;234567890123456789&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        tts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;openai&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          openai</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">voice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;alloy&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></details><h2 id="도구-및-액션-게이트" tabindex="-1">도구 및 액션 게이트 <a class="header-anchor" href="#도구-및-액션-게이트" aria-label="Permalink to &quot;도구 및 액션 게이트&quot;">​</a></h2><p>Discord 메시지 액션에는 메시지, 채널 관리, 모더레이션, 존재 및 메타데이터 액션이 포함됩니다.</p><p>핵심 예시:</p><ul><li>메시지: <code>sendMessage</code>, <code>readMessages</code>, <code>editMessage</code>, <code>deleteMessage</code>, <code>threadReply</code></li><li>반응: <code>react</code>, <code>reactions</code>, <code>emojiList</code></li><li>모더레이션: <code>timeout</code>, <code>kick</code>, <code>ban</code></li><li>존재: <code>setPresence</code></li></ul><p>액션 게이트는 <code>channels.discord.actions.*</code> 아래에 있습니다.</p><p>기본 게이트 동작:</p><table tabindex="0"><thead><tr><th>액션 그룹</th><th>기본값</th></tr></thead><tbody><tr><td>reactions, messages, threads, pins, polls, search, memberInfo, roleInfo 등</td><td>활성화</td></tr><tr><td>roles</td><td>비활성화</td></tr><tr><td>moderation</td><td>비활성화</td></tr><tr><td>presence</td><td>비활성화</td></tr></tbody></table><h2 id="문제-해결" tabindex="-1">문제 해결 <a class="header-anchor" href="#문제-해결" aria-label="Permalink to &quot;문제 해결&quot;">​</a></h2><details class="details custom-block"><summary>사용된 인텐트 오류 또는 봇이 길드 메시지를 보지 못함</summary><ul><li>메시지 콘텐츠 인텐트 활성화 <ul><li>사용자/멤버 확인에 의존하는 경우 서버 멤버 인텐트 활성화</li><li>인텐트 변경 후 게이트웨이 재시작</li></ul></li></ul></details><details class="details custom-block"><summary>예상치 않게 길드 메시지 차단됨</summary><ul><li><p><code>groupPolicy</code> 확인</p><ul><li><code>channels.discord.guilds</code> 아래의 길드 허용 목록 확인</li><li>길드 <code>channels</code> 맵이 있는 경우 나열된 채널만 허용됩니다</li></ul><p>유용한 확인:</p></li></ul><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> doctor</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> status</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --probe</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> logs</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --follow</span></span></code></pre></div></details><details class="details custom-block"><summary>DM 및 페어링 문제</summary><ul><li>DM 비활성화: <code>channels.discord.dm.enabled=false</code><ul><li>DM 정책 비활성화: <code>channels.discord.dmPolicy=&quot;disabled&quot;</code></li><li><code>pairing</code> 모드에서 페어링 승인 대기 중</li></ul></li></ul></details><details class="details custom-block"><summary>봇 간 루프</summary><p>기본적으로 봇이 작성한 메시지는 무시됩니다.</p><pre><code>\`channels.discord.allowBots=true\`를 설정하는 경우 루프 동작을 방지하기 위해 엄격한 언급 및 허용 목록 규칙을 사용하십시오.
</code></pre></details><h2 id="구성-참조-포인터" tabindex="-1">구성 참조 포인터 <a class="header-anchor" href="#구성-참조-포인터" aria-label="Permalink to &quot;구성 참조 포인터&quot;">​</a></h2><p>기본 참조:</p><ul><li><a href="/openclaw-docs-ko/gateway/configuration-reference#discord">구성 참조 - Discord</a></li></ul><p>주요 Discord 필드:</p><ul><li>시작/인증: <code>enabled</code>, <code>token</code>, <code>accounts.*</code>, <code>allowBots</code></li><li>정책: <code>groupPolicy</code>, <code>dm.*</code>, <code>guilds.*</code>, <code>guilds.*.channels.*</code></li><li>명령: <code>commands.native</code>, <code>configWrites</code>, <code>slashCommand.*</code></li><li>응답/히스토리: <code>replyToMode</code>, <code>historyLimit</code>, <code>dmHistoryLimit</code></li><li>전달: <code>textChunkLimit</code>, <code>chunkMode</code>, <code>maxLinesPerMessage</code></li><li>스트리밍: <code>streaming</code>, <code>draftChunk</code></li><li>미디어/재시도: <code>mediaMaxMb</code>, <code>retry</code></li><li>액션: <code>actions.*</code></li><li>기능: <code>threadBindings</code>, <code>pluralkit</code>, <code>execApprovals</code>, <code>voice</code></li></ul><h2 id="안전-및-운영" tabindex="-1">안전 및 운영 <a class="header-anchor" href="#안전-및-운영" aria-label="Permalink to &quot;안전 및 운영&quot;">​</a></h2><p>OpenClaw는 Discord 연결 상태를 모니터링합니다. 봇이 예상치 않게 오프라인 상태가 되거나 응답하지 않는 경우 <code>openclaw channels status --probe</code>와 <code>openclaw logs --follow</code>를 실행하십시오.</p><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/channels/pairing">페어링</a></li><li><a href="/openclaw-docs-ko/channels/groups">그룹</a></li><li><a href="/openclaw-docs-ko/gateway/security">보안</a></li><li><a href="/openclaw-docs-ko/channels/channel-routing">채널 라우팅</a></li><li><a href="/openclaw-docs-ko/channels/troubleshooting">문제 해결</a></li><li><a href="/openclaw-docs-ko/tools/slash-commands">슬래시 명령</a></li></ul>`,127)])])}const c=i(e,[["render",t]]);export{E as __pageData,c as default};
