import{_ as a,o as i,c as e,ag as t}from"./chunks/framework.CTpQozEL.js";const k=JSON.parse('{"title":"WhatsApp","description":"WhatsApp 채널 지원, 접근 제어, 전달 동작 및 운영","frontmatter":{"title":"WhatsApp","description":"WhatsApp 채널 지원, 접근 제어, 전달 동작 및 운영"},"headers":[],"relativePath":"channels/whatsapp.md","filePath":"channels/whatsapp.md","lastUpdated":null}'),l={name:"channels/whatsapp.md"};function n(o,s,p,h,d,c){return i(),e("div",null,[...s[0]||(s[0]=[t(`<p>상태: WhatsApp Web(Baileys)을 통한 프로덕션 준비 완료. 게이트웨이가 연결된 세션을 소유합니다.</p><h2 id="설치-주문형" tabindex="-1">설치 (주문형) <a class="header-anchor" href="#설치-주문형" aria-label="Permalink to &quot;설치 (주문형)&quot;">​</a></h2><ul><li>온보딩(<code>openclaw onboard</code>) 및 <code>openclaw channels add --channel whatsapp</code>은 처음 WhatsApp을 선택할 때 WhatsApp 플러그인 설치를 요청합니다.</li><li><code>openclaw channels login --channel whatsapp</code>도 플러그인이 아직 없는 경우 설치 흐름을 제공합니다.</li><li>개발 채널 + git checkout: 로컬 플러그인 경로로 기본 설정됩니다.</li><li>안정/베타: npm 패키지 <code>@openclaw/whatsapp</code>으로 기본 설정됩니다.</li></ul><p>수동 설치도 여전히 사용 가능합니다:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> plugins</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @openclaw/whatsapp</span></span></code></pre></div><blockquote><p><strong>페어링</strong> 기본 DM 정책은 알 수 없는 발신자에 대해 페어링입니다.</p></blockquote><blockquote><p><strong>채널 문제 해결</strong> 채널 간 진단 및 복구 플레이북입니다.</p></blockquote><blockquote><p><strong>게이트웨이 구성</strong> 전체 채널 구성 패턴과 예시입니다.</p></blockquote><h2 id="빠른-설정" tabindex="-1">빠른 설정 <a class="header-anchor" href="#빠른-설정" aria-label="Permalink to &quot;빠른 설정&quot;">​</a></h2><ol><li><p><strong>WhatsApp 접근 정책 구성</strong></p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      dmPolicy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;pairing&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      allowFrom</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;+15551234567&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      groupPolicy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;allowlist&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      groupAllowFrom</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;+15551234567&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></li><li><p><strong>WhatsApp 연결 (QR)</strong></p></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> login</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --channel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span></span></code></pre></div><pre><code>   특정 계정의 경우:
</code></pre><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> channels</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> login</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --channel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --account</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> work</span></span></code></pre></div><ol start="3"><li><strong>게이트웨이 시작</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> gateway</span></span></code></pre></div><ol start="4"><li><strong>첫 페어링 요청 승인 (페어링 모드 사용 시)</strong></li></ol><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pairing</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openclaw</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pairing</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> approve</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> whatsapp</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">COD</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">E</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div><pre><code>   페어링 요청은 1시간 후 만료됩니다. 대기 중인 요청은 채널당 최대 3개로 제한됩니다.
</code></pre><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>OpenClaw는 가능하면 WhatsApp을 별도 번호에서 실행할 것을 권장합니다. (채널 메타데이터와 설정 흐름은 이 설정에 최적화되어 있지만, 개인 번호 설정도 지원됩니다.)</p></div><h2 id="배포-패턴" tabindex="-1">배포 패턴 <a class="header-anchor" href="#배포-패턴" aria-label="Permalink to &quot;배포 패턴&quot;">​</a></h2><details class="details custom-block"><summary>전용 번호 (권장)</summary><p>가장 깔끔한 운영 모드입니다:</p><pre><code>- OpenClaw용 별도 WhatsApp 신원
- 더 명확한 DM allowlist와 라우팅 경계
- 자가 채팅(self-chat) 혼동 가능성 감소

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
</code></pre></details><details class="details custom-block"><summary>개인 번호 폴백</summary><p>온보딩은 개인 번호 모드를 지원하며 self-chat 친화적인 기본값을 기록합니다:</p><pre><code>- \`dmPolicy: &quot;allowlist&quot;\`
- \`allowFrom\`에 개인 번호 포함
- \`selfChatMode: true\`

런타임에서 self-chat 보호는 연결된 self 번호와 \`allowFrom\`을 기반으로 작동합니다.
</code></pre></details><details class="details custom-block"><summary>WhatsApp Web 전용 채널 범위</summary><p>메시징 플랫폼 채널은 현재 OpenClaw 채널 아키텍처에서 WhatsApp Web 기반(<code>Baileys</code>)입니다.</p><pre><code>내장 chat-channel 레지스트리에는 별도의 Twilio WhatsApp 메시징 채널이 없습니다.
</code></pre></details><h2 id="런타임-모델" tabindex="-1">런타임 모델 <a class="header-anchor" href="#런타임-모델" aria-label="Permalink to &quot;런타임 모델&quot;">​</a></h2><ul><li>게이트웨이가 WhatsApp 소켓과 재연결 루프를 소유합니다.</li><li>아웃바운드 전송은 대상 계정에 대한 활성 WhatsApp listener가 필요합니다.</li><li>Status 및 broadcast 채팅은 무시됩니다 (<code>@status</code>, <code>@broadcast</code>).</li><li>다이렉트 채팅은 DM 세션 규칙을 사용합니다 (<code>session.dmScope</code>; 기본값 <code>main</code>은 DM을 에이전트 main 세션으로 collapse).</li><li>그룹 세션은 격리됩니다 (<code>agent:&lt;agentId&gt;:whatsapp:group:&lt;jid&gt;</code>).</li><li>WhatsApp Web transport는 게이트웨이 호스트의 표준 프록시 환경 변수(<code>HTTPS_PROXY</code>, <code>HTTP_PROXY</code>, <code>NO_PROXY</code> / 소문자 변형)를 존중합니다. 채널별 WhatsApp 프록시 설정보다 호스트 수준 프록시 구성을 선호하세요.</li></ul><h2 id="접근-제어-및-활성화" tabindex="-1">접근 제어 및 활성화 <a class="header-anchor" href="#접근-제어-및-활성화" aria-label="Permalink to &quot;접근 제어 및 활성화&quot;">​</a></h2><p><strong>DM 정책</strong></p><p><code>channels.whatsapp.dmPolicy</code>는 다이렉트 채팅 접근을 제어합니다:</p><pre><code>- \`pairing\` (기본값)
- \`allowlist\`
- \`open\` (\`allowFrom\`에 \`&quot;*&quot;\` 포함 필요)
- \`disabled\`

\`allowFrom\`은 E.164 스타일 번호를 허용합니다 (내부적으로 정규화됨).

Multi-account override: \`channels.whatsapp.accounts.&lt;id&gt;.dmPolicy\` (및 \`allowFrom\`)는 해당 계정에 대해 채널 수준 기본값보다 우선합니다.

런타임 동작 세부 사항:

- 페어링은 채널 allow-store에 지속되며 구성된 \`allowFrom\`과 병합됩니다
- allowlist가 구성되지 않은 경우, 연결된 self 번호가 기본적으로 허용됩니다
- OpenClaw는 아웃바운드 \`fromMe\` DM(연결된 기기에서 자신에게 보낸 메시지)을 자동 페어링하지 않습니다
</code></pre><p><strong>그룹 정책 + allowlist</strong></p><p>그룹 접근에는 두 개의 레이어가 있습니다:</p><pre><code>1. **그룹 멤버십 allowlist** (\`channels.whatsapp.groups\`)
   - \`groups\`가 생략되면, 모든 그룹이 자격을 얻습니다
   - \`groups\`가 있으면, 그룹 allowlist로 작동합니다 (\`&quot;*&quot;\` 허용됨)

2. **그룹 발신자 정책** (\`channels.whatsapp.groupPolicy\` + \`groupAllowFrom\`)
   - \`open\`: 발신자 allowlist 우회
   - \`allowlist\`: 발신자가 \`groupAllowFrom\`과 일치해야 함 (또는 \`*\`)
   - \`disabled\`: 모든 그룹 인바운드 차단

발신자 allowlist 폴백:

- \`groupAllowFrom\`이 설정되지 않은 경우, 런타임은 사용 가능한 경우 \`allowFrom\`으로 폴백합니다
- 발신자 allowlist는 멘션/답장 활성화 전에 평가됩니다

참고: \`channels.whatsapp\` 블록이 전혀 없는 경우, \`channels.defaults.groupPolicy\`가 설정되어 있어도 런타임 group-policy 폴백은 \`allowlist\`입니다 (경고 로그와 함께).
</code></pre><p><strong>멘션 + /activation</strong></p><p>그룹 응답은 기본적으로 멘션이 필요합니다.</p><pre><code>멘션 감지는 다음을 포함합니다:

- 봇 identity의 명시적 WhatsApp 멘션
- 구성된 멘션 정규식 패턴 (\`agents.list[].groupChat.mentionPatterns\`, 폴백 \`messages.groupChat.mentionPatterns\`)
- 암시적 reply-to-bot 감지 (답장 발신자가 봇 identity와 일치)

보안 참고:

- quote/reply는 멘션 게이팅만 충족하며, 발신자 인증을 부여하지 **않습니다**
- \`groupPolicy: &quot;allowlist&quot;\`에서 non-allowlisted 발신자는 allowlisted 사용자의 메시지에 답장해도 여전히 차단됩니다

세션 수준 activation 명령:

- \`/activation mention\`
- \`/activation always\`

\`activation\`은 세션 상태를 업데이트합니다 (전역 구성이 아님). 소유자 게이팅됩니다.
</code></pre><h2 id="개인-번호-및-self-chat-동작" tabindex="-1">개인 번호 및 self-chat 동작 <a class="header-anchor" href="#개인-번호-및-self-chat-동작" aria-label="Permalink to &quot;개인 번호 및 self-chat 동작&quot;">​</a></h2><p>연결된 self 번호가 <code>allowFrom</code>에도 존재하는 경우, WhatsApp self-chat 보호 장치가 활성화됩니다:</p><ul><li>self-chat 턴에 대해 읽음 영수증 건너뛰기</li><li>자신에게 ping을 보내는 멘션 JID 자동 트리거 동작 무시</li><li><code>messages.responsePrefix</code>가 설정되지 않은 경우, self-chat 응답은 기본값으로 <code>[{identity.name}]</code> 또는 <code>[openclaw]</code>를 사용합니다</li></ul><h2 id="메시지-정규화-및-컨텍스트" tabindex="-1">메시지 정규화 및 컨텍스트 <a class="header-anchor" href="#메시지-정규화-및-컨텍스트" aria-label="Permalink to &quot;메시지 정규화 및 컨텍스트&quot;">​</a></h2><details class="details custom-block"><summary>인바운드 envelope + 답장 컨텍스트</summary><p>들어오는 WhatsApp 메시지는 공유 인바운드 envelope로 래핑됩니다.</p><pre><code>인용 답장이 존재하면, 컨텍스트는 다음 형식으로 추가됩니다:

\`\`\`text
[Replying to &lt;sender&gt; id:&lt;stanzaId&gt;]
&lt;quoted body or media placeholder&gt;
[/Replying]
\`\`\`

답장 메타데이터 필드는 사용 가능할 때 채워집니다 (\`ReplyToId\`, \`ReplyToBody\`, \`ReplyToSender\`, 발신자 JID/E.164).
</code></pre></details><details class="details custom-block"><summary>미디어 placeholder 및 위치/연락처 추출</summary><p>미디어 전용 인바운드 메시지는 다음과 같은 placeholder로 정규화됩니다:</p><pre><code>- \`&lt;media:image&gt;\`
- \`&lt;media:video&gt;\`
- \`&lt;media:audio&gt;\`
- \`&lt;media:document&gt;\`
- \`&lt;media:sticker&gt;\`

위치 본문은 간결한 좌표 텍스트를 사용합니다. 위치 라벨/주석과 연락처/vCard 세부 정보는 인라인 prompt 텍스트가 아닌 fenced untrusted 메타데이터로 렌더링됩니다.
</code></pre></details><details class="details custom-block"><summary>대기 중인 그룹 히스토리 주입</summary><p>그룹의 경우, 처리되지 않은 메시지를 버퍼링하여 봇이 최종적으로 트리거될 때 컨텍스트로 주입할 수 있습니다.</p><pre><code>- 기본 제한: \`50\`
- config: \`channels.whatsapp.historyLimit\`
- 폴백: \`messages.groupChat.historyLimit\`
- \`0\`은 비활성화

주입 마커:

- \`[Chat messages since your last reply - for context]\`
- \`[Current message - respond to this]\`
</code></pre></details><details class="details custom-block"><summary>읽음 영수증</summary><p>읽음 영수증은 수락된 인바운드 WhatsApp 메시지에 대해 기본적으로 활성화됩니다.</p><pre><code>전역 비활성화:

\`\`\`json5
{
  channels: {
    whatsapp: {
      sendReadReceipts: false,
    },
  },
}
\`\`\`

계정별 override:

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

Self-chat 턴은 전역적으로 활성화되어 있어도 읽음 영수증을 건너뜁니다.
</code></pre></details><h2 id="전달-청킹-미디어" tabindex="-1">전달, 청킹, 미디어 <a class="header-anchor" href="#전달-청킹-미디어" aria-label="Permalink to &quot;전달, 청킹, 미디어&quot;">​</a></h2><details class="details custom-block"><summary>텍스트 청킹</summary><ul><li>기본 청크 제한: <code>channels.whatsapp.textChunkLimit = 4000</code><ul><li><code>channels.whatsapp.chunkMode = &quot;length&quot; | &quot;newline&quot;</code></li><li><code>newline</code> 모드는 단락 경계(빈 줄)를 선호한 후, 길이 안전한 청킹으로 폴백합니다</li></ul></li></ul></details><details class="details custom-block"><summary>아웃바운드 미디어 동작</summary><ul><li>이미지, 비디오, 오디오(PTT voice-note), 문서 페이로드 지원 <ul><li><code>audio/ogg</code>는 voice-note 호환성을 위해 <code>audio/ogg; codecs=opus</code>로 재작성됩니다</li><li>애니메이션 GIF 재생은 비디오 전송에서 <code>gifPlayback: true</code>를 통해 지원됩니다</li><li>여러 미디어 답장 페이로드를 전송할 때 캡션은 첫 번째 미디어 항목에 적용됩니다</li><li>미디어 소스는 HTTP(S), <code>file://</code> 또는 로컬 경로일 수 있습니다</li></ul></li></ul></details><details class="details custom-block"><summary>미디어 크기 제한과 폴백 동작</summary><ul><li>인바운드 미디어 저장 한도: <code>channels.whatsapp.mediaMaxMb</code> (기본값 <code>50</code>) <ul><li>아웃바운드 미디어 전송 한도: <code>channels.whatsapp.mediaMaxMb</code> (기본값 <code>50</code>)</li><li>계정별 override는 <code>channels.whatsapp.accounts.&lt;accountId&gt;.mediaMaxMb</code>를 사용합니다</li><li>이미지는 제한에 맞추기 위해 자동 최적화됩니다 (리사이즈/품질 sweep)</li><li>미디어 전송 실패 시, 응답을 조용히 drop하는 대신 첫 번째 항목 폴백으로 텍스트 경고를 전송합니다</li></ul></li></ul></details><h2 id="답장-인용" tabindex="-1">답장 인용 <a class="header-anchor" href="#답장-인용" aria-label="Permalink to &quot;답장 인용&quot;">​</a></h2><p>WhatsApp은 네이티브 답장 인용을 지원하며, 아웃바운드 답장이 인바운드 메시지를 시각적으로 인용합니다. <code>channels.whatsapp.replyToMode</code>로 제어합니다.</p><table tabindex="0"><thead><tr><th>값</th><th>동작</th></tr></thead><tbody><tr><td><code>&quot;auto&quot;</code></td><td>공급자가 지원할 때 인바운드 메시지를 인용하고, 그렇지 않으면 인용을 건너뜁니다</td></tr><tr><td><code>&quot;on&quot;</code></td><td>항상 인바운드 메시지를 인용하고, 인용이 거부되면 일반 전송으로 폴백합니다</td></tr><tr><td><code>&quot;off&quot;</code></td><td>절대 인용하지 않고, 일반 메시지로 전송합니다</td></tr></tbody></table><p>기본값은 <code>&quot;auto&quot;</code>입니다. 계정별 override는 <code>channels.whatsapp.accounts.&lt;id&gt;.replyToMode</code>를 사용합니다.</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      replyToMode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;on&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="reaction-레벨" tabindex="-1">Reaction 레벨 <a class="header-anchor" href="#reaction-레벨" aria-label="Permalink to &quot;Reaction 레벨&quot;">​</a></h2><p><code>channels.whatsapp.reactionLevel</code>은 에이전트가 WhatsApp에서 이모지 reaction을 얼마나 광범위하게 사용하는지 제어합니다:</p><table tabindex="0"><thead><tr><th>레벨</th><th>Ack reaction</th><th>에이전트 주도 reaction</th><th>설명</th></tr></thead><tbody><tr><td><code>&quot;off&quot;</code></td><td>아니오</td><td>아니오</td><td>reaction 없음</td></tr><tr><td><code>&quot;ack&quot;</code></td><td>예</td><td>아니오</td><td>Ack reaction만 (응답 전 수신 확인)</td></tr><tr><td><code>&quot;minimal&quot;</code></td><td>예</td><td>예 (보수적)</td><td>Ack + 보수적 가이드와 함께 에이전트 reaction</td></tr><tr><td><code>&quot;extensive&quot;</code></td><td>예</td><td>예 (권장)</td><td>Ack + 권장 가이드와 함께 에이전트 reaction</td></tr></tbody></table><p>기본값: <code>&quot;minimal&quot;</code>.</p><p>계정별 override는 <code>channels.whatsapp.accounts.&lt;id&gt;.reactionLevel</code>을 사용합니다.</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      reactionLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ack&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="확인-acknowledgment-reactions" tabindex="-1">확인(acknowledgment) reactions <a class="header-anchor" href="#확인-acknowledgment-reactions" aria-label="Permalink to &quot;확인(acknowledgment) reactions&quot;">​</a></h2><p>WhatsApp은 <code>channels.whatsapp.ackReaction</code>을 통해 인바운드 수신 시 즉시 ack reaction을 지원합니다. Ack reaction은 <code>reactionLevel</code>에 의해 게이팅되며 — <code>reactionLevel</code>이 <code>&quot;off&quot;</code>일 때 억제됩니다.</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      ackReaction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        emoji</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;👀&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        direct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        group</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mentions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// always | mentions | never</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>동작 참고:</p><ul><li>인바운드가 수락된 직후(응답 전)에 전송됩니다</li><li>실패는 기록되지만 정상 답장 전달을 차단하지 않습니다</li><li>그룹 모드 <code>mentions</code>는 멘션으로 트리거된 턴에 reaction합니다. 그룹 activation <code>always</code>는 이 체크를 우회합니다</li><li>WhatsApp은 <code>channels.whatsapp.ackReaction</code>을 사용합니다 (레거시 <code>messages.ackReaction</code>은 여기서 사용되지 않음)</li></ul><h2 id="multi-account-및-자격-증명" tabindex="-1">Multi-account 및 자격 증명 <a class="header-anchor" href="#multi-account-및-자격-증명" aria-label="Permalink to &quot;Multi-account 및 자격 증명&quot;">​</a></h2><details class="details custom-block"><summary>계정 선택 및 기본값</summary><ul><li>계정 ID는 <code>channels.whatsapp.accounts</code>에서 제공됩니다 <ul><li>기본 계정 선택: <code>default</code>가 있으면 <code>default</code>, 그렇지 않으면 첫 번째 구성된 계정 ID (정렬됨)</li><li>계정 ID는 조회를 위해 내부적으로 정규화됩니다</li></ul></li></ul></details><details class="details custom-block"><summary>자격 증명 경로 및 레거시 호환성</summary><ul><li>현재 auth 경로: <code>~/.openclaw/credentials/whatsapp/&lt;accountId&gt;/creds.json</code><ul><li>백업 파일: <code>creds.json.bak</code></li><li><code>~/.openclaw/credentials/</code>의 레거시 기본 auth는 기본 계정 흐름에서 여전히 인식/마이그레이션됩니다</li></ul></li></ul></details><details class="details custom-block"><summary>로그아웃 동작</summary><p><code>openclaw channels logout --channel whatsapp [--account &lt;id&gt;]</code>는 해당 계정의 WhatsApp auth 상태를 지웁니다.</p><pre><code>레거시 auth 디렉토리에서는 \`oauth.json\`이 보존되고 Baileys auth 파일이 제거됩니다.
</code></pre></details><h2 id="도구-액션-구성-쓰기" tabindex="-1">도구, 액션, 구성 쓰기 <a class="header-anchor" href="#도구-액션-구성-쓰기" aria-label="Permalink to &quot;도구, 액션, 구성 쓰기&quot;">​</a></h2><ul><li>에이전트 도구 지원에는 WhatsApp reaction 액션 (<code>react</code>)이 포함됩니다.</li><li>액션 게이트: <ul><li><code>channels.whatsapp.actions.reactions</code></li><li><code>channels.whatsapp.actions.polls</code></li></ul></li><li>채널 주도 구성 쓰기는 기본적으로 활성화됩니다 (<code>channels.whatsapp.configWrites=false</code>로 비활성화).</li></ul><h2 id="문제-해결" tabindex="-1">문제 해결 <a class="header-anchor" href="#문제-해결" aria-label="Permalink to &quot;문제 해결&quot;">​</a></h2><details class="details custom-block"><summary>연결되지 않음 (QR 필요)</summary><p>증상: 채널 상태가 연결되지 않음을 보고합니다.</p><pre><code>해결:

\`\`\`bash
openclaw channels login --channel whatsapp
openclaw channels status
\`\`\`
</code></pre></details><details class="details custom-block"><summary>연결되었지만 연결이 끊김 / 재연결 루프</summary><p>증상: 연결된 계정이 반복적인 연결 끊김 또는 재연결 시도를 겪음.</p><pre><code>해결:

\`\`\`bash
openclaw doctor
openclaw logs --follow
\`\`\`

필요한 경우 \`channels login\`으로 다시 연결하세요.
</code></pre></details><details class="details custom-block"><summary>전송 시 활성 listener 없음</summary><p>아웃바운드 전송은 대상 계정에 활성 게이트웨이 listener가 없을 때 빠르게 실패합니다.</p><pre><code>게이트웨이가 실행 중이고 계정이 연결되어 있는지 확인하세요.
</code></pre></details><details class="details custom-block"><summary>그룹 메시지가 예기치 않게 무시됨</summary><p>다음 순서로 확인하세요:</p><pre><code>- \`groupPolicy\`
- \`groupAllowFrom\` / \`allowFrom\`
- \`groups\` allowlist 항목
- 멘션 게이팅 (\`requireMention\` + 멘션 패턴)
- \`openclaw.json\` (JSON5)의 중복 키: 뒤 항목이 앞 항목을 override하므로 각 scope당 \`groupPolicy\`를 하나만 유지하세요
</code></pre></details><details class="details custom-block"><summary>Bun 런타임 경고</summary><p>WhatsApp 게이트웨이 런타임은 Node를 사용해야 합니다. Bun은 안정적인 WhatsApp/Telegram 게이트웨이 운영에 호환되지 않는 것으로 표시됩니다.</p></details><h2 id="시스템-프롬프트" tabindex="-1">시스템 프롬프트 <a class="header-anchor" href="#시스템-프롬프트" aria-label="Permalink to &quot;시스템 프롬프트&quot;">​</a></h2><p>WhatsApp은 <code>groups</code>와 <code>direct</code> 맵을 통해 그룹과 다이렉트 채팅에 대해 Telegram 스타일 시스템 프롬프트를 지원합니다.</p><p>그룹 메시지의 해석 계층:</p><p>유효한 <code>groups</code> 맵이 먼저 결정됩니다: 계정이 자체 <code>groups</code>를 정의하면, 루트 <code>groups</code> 맵을 완전히 대체합니다 (deep merge 없음). 프롬프트 조회는 그런 다음 결과 단일 맵에서 실행됩니다:</p><ol><li><strong>그룹별 시스템 프롬프트</strong> (<code>groups[&quot;&lt;groupId&gt;&quot;].systemPrompt</code>): 특정 그룹 항목이 <code>systemPrompt</code>를 정의하면 사용됩니다.</li><li><strong>그룹 와일드카드 시스템 프롬프트</strong> (<code>groups[&quot;*&quot;].systemPrompt</code>): 특정 그룹 항목이 없거나 <code>systemPrompt</code>를 정의하지 않을 때 사용됩니다.</li></ol><p>다이렉트 메시지의 해석 계층:</p><p>유효한 <code>direct</code> 맵이 먼저 결정됩니다: 계정이 자체 <code>direct</code>를 정의하면, 루트 <code>direct</code> 맵을 완전히 대체합니다 (deep merge 없음). 프롬프트 조회는 그런 다음 결과 단일 맵에서 실행됩니다:</p><ol><li><strong>피어별 시스템 프롬프트</strong> (<code>direct[&quot;&lt;peerId&gt;&quot;].systemPrompt</code>): 특정 피어 항목이 <code>systemPrompt</code>를 정의하면 사용됩니다.</li><li><strong>다이렉트 와일드카드 시스템 프롬프트</strong> (<code>direct[&quot;*&quot;].systemPrompt</code>): 특정 피어 항목이 없거나 <code>systemPrompt</code>를 정의하지 않을 때 사용됩니다.</li></ol><p>참고: <code>dms</code>는 여전히 가벼운 per-DM 히스토리 override 버킷입니다 (<code>dms.&lt;id&gt;.historyLimit</code>). 프롬프트 override는 <code>direct</code> 아래에 있습니다.</p><p><strong>Telegram multi-account 동작과의 차이점:</strong> Telegram에서는 multi-account 설정의 모든 계정에 대해 루트 <code>groups</code>가 의도적으로 억제됩니다 — 자체 <code>groups</code>를 정의하지 않은 계정에 대해서도 — 봇이 속하지 않은 그룹의 메시지를 수신하는 것을 방지하기 위함입니다. WhatsApp은 이 가드를 적용하지 않습니다: 루트 <code>groups</code>와 루트 <code>direct</code>는 계정 수준 override를 정의하지 않는 계정에서 항상 상속되며, 얼마나 많은 계정이 구성되었는지와 관계없습니다. Multi-account WhatsApp 설정에서 계정별 그룹 또는 다이렉트 프롬프트를 원하면, 루트 수준 기본값에 의존하기보다는 각 계정 아래에 전체 맵을 명시적으로 정의하세요.</p><p>중요한 동작:</p><ul><li><code>channels.whatsapp.groups</code>는 per-group 구성 맵이자 채팅 수준 그룹 allowlist입니다. 루트 또는 계정 scope에서 <code>groups[&quot;*&quot;]</code>는 해당 scope에서 &quot;모든 그룹이 허용됨&quot;을 의미합니다.</li><li>해당 scope가 이미 모든 그룹을 허용하길 원할 때만 와일드카드 그룹 <code>systemPrompt</code>를 추가하세요. 고정된 그룹 ID 세트만 자격을 얻도록 하려면, 프롬프트 기본값으로 <code>groups[&quot;*&quot;]</code>를 사용하지 마세요. 대신 각 명시적으로 allowlisted된 그룹 항목에 프롬프트를 반복하세요.</li><li>그룹 승인과 발신자 인증은 별개의 체크입니다. <code>groups[&quot;*&quot;]</code>는 그룹 처리에 도달할 수 있는 그룹 세트를 확장하지만, 그 자체로는 해당 그룹의 모든 발신자를 인증하지 않습니다. 발신자 접근은 여전히 <code>channels.whatsapp.groupPolicy</code>와 <code>channels.whatsapp.groupAllowFrom</code>에 의해 별도로 제어됩니다.</li><li><code>channels.whatsapp.direct</code>는 DM에 대해 동일한 부작용이 없습니다. <code>direct[&quot;*&quot;]</code>는 DM이 <code>dmPolicy</code> + <code>allowFrom</code> 또는 pairing-store 규칙에 의해 이미 승인된 후에만 기본 다이렉트 채팅 구성을 제공합니다.</li></ul><p>예시:</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  channels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    whatsapp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      groups</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Use only if all groups should be admitted at the root scope.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Applies to all accounts that do not define their own groups map.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;*&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">systemPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Default prompt for all groups.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      direct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Applies to all accounts that do not define their own direct map.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;*&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">systemPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Default prompt for all direct chats.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      accounts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        work</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          groups</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // This account defines its own groups, so root groups are fully</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // replaced. To keep a wildcard, define &quot;*&quot; explicitly here too.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;120363406415684625@g.us&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              requireMention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              systemPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Focus on project management.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Use only if all groups should be admitted in this account.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;*&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">systemPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Default prompt for work groups.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          direct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // This account defines its own direct map, so root direct entries are</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // fully replaced. To keep a wildcard, define &quot;*&quot; explicitly here too.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;+15551234567&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">systemPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Prompt for a specific work direct chat.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;*&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">systemPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Default prompt for work direct chats.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="구성-참조-포인터" tabindex="-1">구성 참조 포인터 <a class="header-anchor" href="#구성-참조-포인터" aria-label="Permalink to &quot;구성 참조 포인터&quot;">​</a></h2><p>기본 참조:</p><ul><li><a href="/openclaw-docs-ko/gateway/config-channels#whatsapp">구성 참조 - WhatsApp</a></li></ul><p>주요 WhatsApp 필드:</p><ul><li>접근: <code>dmPolicy</code>, <code>allowFrom</code>, <code>groupPolicy</code>, <code>groupAllowFrom</code>, <code>groups</code></li><li>전달: <code>textChunkLimit</code>, <code>chunkMode</code>, <code>mediaMaxMb</code>, <code>sendReadReceipts</code>, <code>ackReaction</code>, <code>reactionLevel</code></li><li>multi-account: <code>accounts.&lt;id&gt;.enabled</code>, <code>accounts.&lt;id&gt;.authDir</code>, 계정 수준 override</li><li>운영: <code>configWrites</code>, <code>debounceMs</code>, <code>web.enabled</code>, <code>web.heartbeatSeconds</code>, <code>web.reconnect.*</code></li><li>세션 동작: <code>session.dmScope</code>, <code>historyLimit</code>, <code>dmHistoryLimit</code>, <code>dms.&lt;id&gt;.historyLimit</code></li><li>프롬프트: <code>groups.&lt;id&gt;.systemPrompt</code>, <code>groups[&quot;*&quot;].systemPrompt</code>, <code>direct.&lt;id&gt;.systemPrompt</code>, <code>direct[&quot;*&quot;].systemPrompt</code></li></ul><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/channels/pairing">페어링</a></li><li><a href="/openclaw-docs-ko/channels/groups">그룹</a></li><li><a href="/openclaw-docs-ko/gateway/security/">보안</a></li><li><a href="/openclaw-docs-ko/channels/channel-routing">채널 라우팅</a></li><li><a href="/openclaw-docs-ko/concepts/multi-agent">멀티 에이전트 라우팅</a></li><li><a href="/openclaw-docs-ko/channels/troubleshooting">문제 해결</a></li></ul>`,96)])])}const u=a(l,[["render",n]]);export{k as __pageData,u as default};
