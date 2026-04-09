import{_ as s,o as i,c as e,ae as l}from"./chunks/framework.C7FLYIpo.js";const k=JSON.parse('{"title":"WhatsApp","description":"WhatsApp 채널 지원, 접근 제어, 전달 동작 및 운영","frontmatter":{"title":"WhatsApp","description":"WhatsApp 채널 지원, 접근 제어, 전달 동작 및 운영"},"headers":[],"relativePath":"channels/whatsapp.md","filePath":"channels/whatsapp.md","lastUpdated":null}'),n={name:"channels/whatsapp.md"};function t(p,a,o,d,h,c){return i(),e("div",null,[...a[0]||(a[0]=[l(`<h1 id="whatsapp-웹-채널" tabindex="-1">WhatsApp (웹 채널) <a class="header-anchor" href="#whatsapp-웹-채널" aria-label="Permalink to &quot;WhatsApp (웹 채널)&quot;">​</a></h1><p>상태: WhatsApp Web(Baileys)을 통해 프로덕션 준비 완료. 게이트웨이가 연결된 세션을 소유합니다.</p><h2 id="설치-주문형" tabindex="-1">설치 (주문형) <a class="header-anchor" href="#설치-주문형" aria-label="Permalink to &quot;설치 (주문형)&quot;">​</a></h2><ul><li>온보딩(<code>openclaw onboard</code>) 및 <code>openclaw channels add --channel whatsapp</code>은 처음 WhatsApp을 선택할 때 WhatsApp 플러그인 설치를 요청합니다.</li><li><code>openclaw channels login --channel whatsapp</code>도 플러그인이 아직 없는 경우 설치 흐름을 제공합니다.</li><li>개발 채널 + git checkout: 로컬 플러그인 경로로 기본 설정됩니다.</li><li>안정/베타: npm 패키지 <code>@openclaw/whatsapp</code>으로 기본 설정됩니다.</li></ul><p>수동 설치도 가능합니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> plugins</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @openclaw/whatsapp</span></span></code></pre></div><blockquote><p><strong>페어링</strong> 기본 DM 정책은 알 수 없는 발신자에 대해 페어링입니다.</p></blockquote><blockquote><p><strong>채널 문제 해결</strong> 크로스 채널 진단 및 복구 플레이북.</p></blockquote><blockquote><p><strong>게이트웨이 구성</strong> 전체 채널 구성 패턴 및 예시.</p></blockquote><h2 id="빠른-설정" tabindex="-1">빠른 설정 <a class="header-anchor" href="#빠른-설정" aria-label="Permalink to &quot;빠른 설정&quot;">​</a></h2><ol><li><p><strong>WhatsApp 접근 정책 구성</strong></p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      dmPolicy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;pairing&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      allowFrom</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;+15551234567&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      groupPolicy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;allowlist&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      groupAllowFrom</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;+15551234567&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></li><li><p><strong>WhatsApp 연결 (QR)</strong></p></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> login</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --channel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span></span></code></pre></div><pre><code>   특정 계정용:
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> login</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --channel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --account</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> work</span></span></code></pre></div><ol start="3"><li><strong>게이트웨이 시작</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gateway</span></span></code></pre></div><ol start="4"><li><strong>첫 번째 페어링 요청 승인 (페어링 모드 사용 시)</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pairing</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pairing</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> approve</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">COD</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">E</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div><pre><code>   페어링 요청은 1시간 후 만료됩니다. 보류 중인 요청은 채널당 3개로 제한됩니다.
</code></pre><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>OpenClaw는 가능한 경우 별도의 번호로 WhatsApp을 실행할 것을 권장합니다. (채널 메타데이터와 설정 흐름은 해당 설정에 최적화되어 있지만, 개인 번호 설정도 지원됩니다.)</p></div><h2 id="배포-패턴" tabindex="-1">배포 패턴 <a class="header-anchor" href="#배포-패턴" aria-label="Permalink to &quot;배포 패턴&quot;">​</a></h2><details class="details custom-block"><summary>전용 번호 (권장)</summary><p>가장 깔끔한 운영 모드입니다:</p><pre><code>- OpenClaw를 위한 별도의 WhatsApp 신원
- 더 명확한 DM 허용 목록 및 라우팅 경계
- 자기 채팅 혼동 가능성 낮음

최소 정책 패턴:

\`\`\`json5
{
  channels: {
    whatsapp: {
      dmPolicy: &quot;allowlist&quot;,
      allowFrom: [&quot;+15551234567&quot;],
    },
  },
}
\`\`\`
</code></pre></details><details class="details custom-block"><summary>개인 번호 폴백</summary><p>온보딩은 개인 번호 모드를 지원하며 자기 채팅 친화적 기준을 작성합니다:</p><pre><code>- \`dmPolicy: &quot;allowlist&quot;\`
- \`allowFrom\`에 개인 번호 포함
- \`selfChatMode: true\`

런타임에서 자기 채팅 보호는 연결된 자기 번호와 \`allowFrom\`을 기반으로 합니다.
</code></pre></details><details class="details custom-block"><summary>WhatsApp 웹 전용 채널 범위</summary><p>메시징 플랫폼 채널은 현재 OpenClaw 채널 아키텍처에서 WhatsApp 웹 기반(<code>Baileys</code>)입니다.</p><pre><code>내장 채팅 채널 레지스트리에는 별도의 Twilio WhatsApp 메시징 채널이 없습니다.
</code></pre></details><h2 id="런타임-모델" tabindex="-1">런타임 모델 <a class="header-anchor" href="#런타임-모델" aria-label="Permalink to &quot;런타임 모델&quot;">​</a></h2><ul><li>게이트웨이가 WhatsApp 소켓 및 재연결 루프를 소유합니다.</li><li>아웃바운드 전송에는 대상 계정에 대한 활성 WhatsApp 리스너가 필요합니다.</li><li>상태 및 브로드캐스트 채팅은 무시됩니다(<code>@status</code>, <code>@broadcast</code>).</li><li>다이렉트 채팅은 DM 세션 규칙을 사용합니다(<code>session.dmScope</code>; 기본값 <code>main</code>은 DM을 에이전트 메인 세션으로 축소).</li><li>그룹 세션은 격리됩니다(<code>agent:&amp;lt;agentId&amp;gt;:whatsapp:group:&amp;lt;jid&amp;gt;</code>).</li><li>WhatsApp 웹 전송은 게이트웨이 호스트의 표준 프록시 환경 변수를 준수합니다(<code>HTTPS_PROXY</code>, <code>HTTP_PROXY</code>, <code>NO_PROXY</code> / 소문자 변형). 채널별 WhatsApp 프록시 설정보다 호스트 수준 프록시 구성을 선호하십시오.</li></ul><h2 id="접근-제어-및-활성화" tabindex="-1">접근 제어 및 활성화 <a class="header-anchor" href="#접근-제어-및-활성화" aria-label="Permalink to &quot;접근 제어 및 활성화&quot;">​</a></h2><p><strong>DM 정책</strong></p><p><code>channels.whatsapp.dmPolicy</code>는 다이렉트 채팅 접근을 제어합니다:</p><pre><code>- \`pairing\` (기본값)
- \`allowlist\`
- \`open\` (\`allowFrom\`에 \`&quot;*&quot;\` 포함 필요)
- \`disabled\`

\`allowFrom\`은 E.164 형식 번호를 허용합니다(내부적으로 정규화됨).

멀티 계정 오버라이드: \`channels.whatsapp.accounts.&amp;lt;id&amp;gt;.dmPolicy\`(및 \`allowFrom\`)는 해당 계정에 대해 채널 수준 기본값보다 우선합니다.

런타임 동작 세부 사항:

- 페어링은 채널 허용 저장소에 유지되고 구성된 \`allowFrom\`과 병합됩니다
- 허용 목록이 구성되지 않은 경우, 연결된 자기 번호가 기본적으로 허용됩니다
- 아웃바운드 \`fromMe\` DM은 자동으로 페어링되지 않습니다
</code></pre><p><strong>그룹 정책 + 허용 목록</strong></p><p>그룹 접근에는 두 가지 레이어가 있습니다:</p><pre><code>1. **그룹 멤버십 허용 목록** (\`channels.whatsapp.groups\`)
   - \`groups\`가 생략되면 모든 그룹이 적합합니다
   - \`groups\`가 있으면 그룹 허용 목록 역할을 합니다(\`&quot;*&quot;\` 허용)

2. **그룹 발신자 정책** (\`channels.whatsapp.groupPolicy\` + \`groupAllowFrom\`)
   - \`open\`: 발신자 허용 목록 우회
   - \`allowlist\`: 발신자가 \`groupAllowFrom\`(또는 \`*\`)과 일치해야 함
   - \`disabled\`: 모든 그룹 인바운드 차단

발신자 허용 목록 폴백:

- \`groupAllowFrom\`이 설정되지 않은 경우, 런타임은 \`allowFrom\`이 있을 때 폴백합니다
- 발신자 허용 목록은 언급/답장 활성화 전에 평가됩니다

참고: \`channels.whatsapp\` 블록이 전혀 없는 경우, 런타임 그룹 정책 폴백은 \`allowlist\`입니다(\`channels.defaults.groupPolicy\`가 설정되어 있어도 경고 로그 포함).
</code></pre><p><strong>언급 + /활성화</strong></p><p>그룹 답장은 기본적으로 언급이 필요합니다.</p><pre><code>언급 감지 포함:

- 봇 신원에 대한 명시적 WhatsApp 언급
- 구성된 언급 regex 패턴(\`agents.list[].groupChat.mentionPatterns\`, 폴백 \`messages.groupChat.mentionPatterns\`)
- 암묵적 봇 답장 감지(답장 발신자가 봇 신원과 일치)

보안 참고:

- 인용/답장은 언급 게이팅을 충족합니다. 발신자 인증은 **부여하지 않습니다**
- \`groupPolicy: &quot;allowlist&quot;\`에서는 허용 목록에 없는 발신자가 허용 목록 사용자의 메시지에 답장하더라도 여전히 차단됩니다

세션 수준 활성화 명령:

- \`/activation mention\`
- \`/activation always\`

\`activation\`은 세션 상태를 업데이트합니다(전역 구성 아님). 소유자 게이팅됩니다.
</code></pre><h2 id="개인-번호-및-자기-채팅-동작" tabindex="-1">개인 번호 및 자기 채팅 동작 <a class="header-anchor" href="#개인-번호-및-자기-채팅-동작" aria-label="Permalink to &quot;개인 번호 및 자기 채팅 동작&quot;">​</a></h2><p>연결된 자기 번호가 <code>allowFrom</code>에도 있으면 WhatsApp 자기 채팅 보호가 활성화됩니다:</p><ul><li>자기 채팅 턴에 대한 읽음 확인 건너뜀</li><li>자신에게 핑을 보낼 수 있는 언급-JID 자동 트리거 동작 무시</li><li><code>messages.responsePrefix</code>가 설정되지 않은 경우, 자기 채팅 답장은 기본적으로 <code>[{identity.name}]</code> 또는 <code>[openclaw]</code></li></ul><h2 id="메시지-정규화-및-컨텍스트" tabindex="-1">메시지 정규화 및 컨텍스트 <a class="header-anchor" href="#메시지-정규화-및-컨텍스트" aria-label="Permalink to &quot;메시지 정규화 및 컨텍스트&quot;">​</a></h2><details class="details custom-block"><summary>인바운드 봉투 + 답장 컨텍스트</summary><p>들어오는 WhatsApp 메시지는 공유 인바운드 봉투에 래핑됩니다.</p><pre><code>인용된 답장이 있는 경우 컨텍스트가 다음 형식으로 추가됩니다:

\`\`\`text
[Replying to &amp;lt;sender&amp;gt; id:&amp;lt;stanzaId&amp;gt;]
&amp;lt;quoted body or media placeholder&amp;gt;
[/Replying]
\`\`\`

답장 메타데이터 필드도 사용 가능한 경우 채워집니다(\`ReplyToId\`, \`ReplyToBody\`, \`ReplyToSender\`, 발신자 JID/E.164).
</code></pre></details><details class="details custom-block"><summary>미디어 플레이스홀더 및 위치/연락처 추출</summary><p>미디어 전용 인바운드 메시지는 다음과 같은 플레이스홀더로 정규화됩니다:</p><pre><code>- \`&amp;lt;media:image&amp;gt;\`
- \`&amp;lt;media:video&amp;gt;\`
- \`&amp;lt;media:audio&amp;gt;\`
- \`&amp;lt;media:document&amp;gt;\`
- \`&amp;lt;media:sticker&amp;gt;\`

위치 및 연락처 페이로드는 라우팅 전에 텍스트 컨텍스트로 정규화됩니다.
</code></pre></details><details class="details custom-block"><summary>보류 중인 그룹 기록 주입</summary><p>그룹의 경우, 처리되지 않은 메시지는 버퍼링되어 봇이 트리거될 때 컨텍스트로 주입될 수 있습니다.</p><pre><code>- 기본 제한: \`50\`
- 구성: \`channels.whatsapp.historyLimit\`
- 폴백: \`messages.groupChat.historyLimit\`
- \`0\`은 비활성화

주입 마커:

- \`[Chat messages since your last reply - for context]\`
- \`[Current message - respond to this]\`
</code></pre></details><details class="details custom-block"><summary>읽음 확인</summary><p>읽음 확인은 허용된 인바운드 WhatsApp 메시지에 대해 기본적으로 활성화됩니다.</p><pre><code>전역 비활성화:

\`\`\`json5
{
  channels: {
    whatsapp: {
      sendReadReceipts: false,
    },
  },
}
\`\`\`

계정별 오버라이드:

\`\`\`json5
{
  channels: {
    whatsapp: {
      accounts: {
        work: {
          sendReadReceipts: false,
        },
      },
    },
  },
}
\`\`\`

자기 채팅 턴은 전역 활성화되어 있어도 읽음 확인을 건너뜁니다.
</code></pre></details><h2 id="전달-청크-분할-미디어" tabindex="-1">전달, 청크 분할, 미디어 <a class="header-anchor" href="#전달-청크-분할-미디어" aria-label="Permalink to &quot;전달, 청크 분할, 미디어&quot;">​</a></h2><details class="details custom-block"><summary>텍스트 청크 분할</summary><ul><li>기본 청크 제한: <code>channels.whatsapp.textChunkLimit = 4000</code><ul><li><code>channels.whatsapp.chunkMode = &quot;length&quot; | &quot;newline&quot;</code></li><li><code>newline</code> 모드는 단락 경계(빈 줄)를 선호하고, 길이 안전 청크 분할로 폴백합니다</li></ul></li></ul></details><details class="details custom-block"><summary>아웃바운드 미디어 동작</summary><ul><li>이미지, 동영상, 오디오(PTT 음성 메모), 문서 페이로드 지원 <ul><li><code>audio/ogg</code>는 음성 메모 호환성을 위해 <code>audio/ogg; codecs=opus</code>로 재작성됩니다</li><li>애니메이션 GIF 재생은 동영상 전송 시 <code>gifPlayback: true</code>를 통해 지원됩니다</li><li>다중 미디어 답장 페이로드 전송 시 첫 번째 미디어 항목에 캡션이 적용됩니다</li><li>미디어 소스는 HTTP(S), <code>file://</code>, 또는 로컬 경로가 될 수 있습니다</li></ul></li></ul></details><details class="details custom-block"><summary>미디어 크기 제한 및 폴백 동작</summary><ul><li>인바운드 미디어 저장 한도: <code>channels.whatsapp.mediaMaxMb</code> (기본값 <code>50</code>) <ul><li>아웃바운드 미디어 전송 한도: <code>channels.whatsapp.mediaMaxMb</code> (기본값 <code>50</code>)</li><li>계정별 오버라이드는 <code>channels.whatsapp.accounts.&amp;lt;accountId&amp;gt;.mediaMaxMb</code> 사용</li><li>이미지는 제한에 맞게 자동 최적화됩니다(크기 조정/품질 스윕)</li><li>미디어 전송 실패 시, 첫 번째 항목 폴백으로 응답을 조용히 삭제하는 대신 텍스트 경고를 보냅니다</li></ul></li></ul></details><h2 id="반응-수준" tabindex="-1">반응 수준 <a class="header-anchor" href="#반응-수준" aria-label="Permalink to &quot;반응 수준&quot;">​</a></h2><p><code>channels.whatsapp.reactionLevel</code>은 에이전트가 WhatsApp에서 이모지 반응을 얼마나 광범위하게 사용하는지 제어합니다:</p><table tabindex="0"><thead><tr><th>수준</th><th>확인 반응</th><th>에이전트 시작 반응</th><th>설명</th></tr></thead><tbody><tr><td><code>&quot;off&quot;</code></td><td>아니오</td><td>아니오</td><td>반응 없음</td></tr><tr><td><code>&quot;ack&quot;</code></td><td>예</td><td>아니오</td><td>확인 반응만 (응답 전 영수증)</td></tr><tr><td><code>&quot;minimal&quot;</code></td><td>예</td><td>예 (보수적)</td><td>확인 + 보수적 지침으로 에이전트 반응</td></tr><tr><td><code>&quot;extensive&quot;</code></td><td>예</td><td>예 (권장)</td><td>확인 + 권장 지침으로 에이전트 반응</td></tr></tbody></table><p>기본값: <code>&quot;minimal&quot;</code>.</p><p>계정별 오버라이드는 <code>channels.whatsapp.accounts.&amp;lt;id&amp;gt;.reactionLevel</code> 사용.</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      reactionLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ack&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="확인-반응" tabindex="-1">확인 반응 <a class="header-anchor" href="#확인-반응" aria-label="Permalink to &quot;확인 반응&quot;">​</a></h2><p>WhatsApp은 <code>channels.whatsapp.ackReaction</code>을 통해 인바운드 수신 즉시 확인 반응을 지원합니다. 확인 반응은 <code>reactionLevel</code>에 의해 게이팅됩니다. <code>reactionLevel</code>이 <code>&quot;off&quot;</code>이면 억제됩니다.</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      ackReaction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        emoji</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;👀&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        direct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        group</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mentions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// always | mentions | never</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>동작 참고:</p><ul><li>인바운드가 수락된 직후(응답 전)에 전송됩니다</li><li>실패는 로그되지만 정상 응답 전달을 차단하지 않습니다</li><li>그룹 모드 <code>mentions</code>는 언급 트리거된 턴에 반응합니다. 그룹 활성화 <code>always</code>는 이 확인에 대한 우회 역할을 합니다</li><li>WhatsApp은 <code>channels.whatsapp.ackReaction</code>을 사용합니다(레거시 <code>messages.ackReaction</code>은 여기서 사용되지 않음)</li></ul><h2 id="멀티-계정-및-자격-증명" tabindex="-1">멀티 계정 및 자격 증명 <a class="header-anchor" href="#멀티-계정-및-자격-증명" aria-label="Permalink to &quot;멀티 계정 및 자격 증명&quot;">​</a></h2><details class="details custom-block"><summary>계정 선택 및 기본값</summary><ul><li>계정 ID는 <code>channels.whatsapp.accounts</code>에서 가져옵니다 <ul><li>기본 계정 선택: 있으면 <code>default</code>, 없으면 첫 번째로 구성된 계정 ID(정렬됨)</li><li>계정 ID는 조회를 위해 내부적으로 정규화됩니다</li></ul></li></ul></details><details class="details custom-block"><summary>자격 증명 경로 및 레거시 호환성</summary><ul><li>현재 인증 경로: <code>~/.openclaw/credentials/whatsapp/&amp;lt;accountId&amp;gt;/creds.json</code><ul><li>백업 파일: <code>creds.json.bak</code></li><li><code>~/.openclaw/credentials/</code>의 레거시 기본 인증은 기본 계정 흐름에서 여전히 인식/마이그레이션됩니다</li></ul></li></ul></details><details class="details custom-block"><summary>로그아웃 동작</summary><p><code>openclaw channels logout --channel whatsapp [--account &amp;lt;id&amp;gt;]</code>는 해당 계정의 WhatsApp 인증 상태를 지웁니다.</p><pre><code>레거시 인증 디렉토리에서 \`oauth.json\`은 보존되고 Baileys 인증 파일은 제거됩니다.
</code></pre></details><h2 id="도구-작업-및-구성-쓰기" tabindex="-1">도구, 작업 및 구성 쓰기 <a class="header-anchor" href="#도구-작업-및-구성-쓰기" aria-label="Permalink to &quot;도구, 작업 및 구성 쓰기&quot;">​</a></h2><ul><li>에이전트 도구 지원에는 WhatsApp 반응 작업(<code>react</code>)이 포함됩니다.</li><li>작업 게이트: <ul><li><code>channels.whatsapp.actions.reactions</code></li><li><code>channels.whatsapp.actions.polls</code></li></ul></li><li>채널 시작 구성 쓰기는 기본적으로 활성화됩니다(<code>channels.whatsapp.configWrites=false</code>로 비활성화).</li></ul><h2 id="문제-해결" tabindex="-1">문제 해결 <a class="header-anchor" href="#문제-해결" aria-label="Permalink to &quot;문제 해결&quot;">​</a></h2><details class="details custom-block"><summary>연결되지 않음 (QR 필요)</summary><p>증상: 채널 상태에 연결되지 않음으로 표시됩니다.</p><pre><code>수정:

\`\`\`bash
openclaw channels login --channel whatsapp
openclaw channels status
\`\`\`
</code></pre></details><details class="details custom-block"><summary>연결되었지만 연결 해제/재연결 루프</summary><p>증상: 반복적인 연결 해제 또는 재연결 시도가 있는 연결된 계정.</p><pre><code>수정:

\`\`\`bash
openclaw doctor
openclaw logs --follow
\`\`\`

필요한 경우 \`channels login\`으로 재연결합니다.
</code></pre></details><details class="details custom-block"><summary>전송 시 활성 리스너 없음</summary><p>대상 계정에 활성 게이트웨이 리스너가 없으면 아웃바운드 전송이 빠르게 실패합니다.</p><pre><code>게이트웨이가 실행 중이고 계정이 연결되어 있는지 확인하십시오.
</code></pre></details><details class="details custom-block"><summary>그룹 메시지가 예기치 않게 무시됨</summary><p>다음 순서로 확인하십시오:</p><pre><code>- \`groupPolicy\`
- \`groupAllowFrom\` / \`allowFrom\`
- \`groups\` 허용 목록 항목
- 언급 게이팅(\`requireMention\` + 언급 패턴)
- \`openclaw.json\`(JSON5)의 중복 키: 이후 항목이 이전 항목을 재정의하므로 범위당 단일 \`groupPolicy\`를 유지하십시오
</code></pre></details><details class="details custom-block"><summary>Bun 런타임 경고</summary><p>WhatsApp 게이트웨이 런타임은 Node를 사용해야 합니다. Bun은 안정적인 WhatsApp/Telegram 게이트웨이 작동에 호환되지 않는 것으로 표시됩니다.</p></details><h2 id="구성-참조-포인터" tabindex="-1">구성 참조 포인터 <a class="header-anchor" href="#구성-참조-포인터" aria-label="Permalink to &quot;구성 참조 포인터&quot;">​</a></h2><p>기본 참조:</p><ul><li><a href="/openclaw-docs-ko/gateway/configuration-reference#whatsapp">구성 참조 - WhatsApp</a></li></ul><p>중요 WhatsApp 필드:</p><ul><li>접근: <code>dmPolicy</code>, <code>allowFrom</code>, <code>groupPolicy</code>, <code>groupAllowFrom</code>, <code>groups</code></li><li>전달: <code>textChunkLimit</code>, <code>chunkMode</code>, <code>mediaMaxMb</code>, <code>sendReadReceipts</code>, <code>ackReaction</code>, <code>reactionLevel</code></li><li>멀티 계정: <code>accounts.&amp;lt;id&amp;gt;.enabled</code>, <code>accounts.&amp;lt;id&amp;gt;.authDir</code>, 계정 수준 오버라이드</li><li>운영: <code>configWrites</code>, <code>debounceMs</code>, <code>web.enabled</code>, <code>web.heartbeatSeconds</code>, <code>web.reconnect.*</code></li><li>세션 동작: <code>session.dmScope</code>, <code>historyLimit</code>, <code>dmHistoryLimit</code>, <code>dms.&amp;lt;id&amp;gt;.historyLimit</code></li></ul><h2 id="관련" tabindex="-1">관련 <a class="header-anchor" href="#관련" aria-label="Permalink to &quot;관련&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/channels/pairing">페어링</a></li><li><a href="/openclaw-docs-ko/channels/groups">그룹</a></li><li><a href="/openclaw-docs-ko/gateway/security">보안</a></li><li><a href="/openclaw-docs-ko/channels/channel-routing">채널 라우팅</a></li><li><a href="/openclaw-docs-ko/concepts/multi-agent">멀티 에이전트 라우팅</a></li><li><a href="/openclaw-docs-ko/channels/troubleshooting">문제 해결</a></li></ul>`,78)])])}const u=s(n,[["render",t]]);export{k as __pageData,u as default};
