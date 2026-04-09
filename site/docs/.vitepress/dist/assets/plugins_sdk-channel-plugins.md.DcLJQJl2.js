import{_ as e,o as a,c as i,ae as t}from"./chunks/framework.C7FLYIpo.js";const h=JSON.parse('{"title":"채널 플러그인 빌드하기","description":"OpenClaw용 메시징 채널 플러그인을 빌드하는 단계별 가이드","frontmatter":{"title":"채널 플러그인 빌드하기","description":"OpenClaw용 메시징 채널 플러그인을 빌드하는 단계별 가이드"},"headers":[],"relativePath":"plugins/sdk-channel-plugins.md","filePath":"plugins/sdk-channel-plugins.md","lastUpdated":null}'),s={name:"plugins/sdk-channel-plugins.md"};function o(l,n,p,c,d,r){return a(),i("div",null,[...n[0]||(n[0]=[t(`<h1 id="채널-플러그인-빌드하기" tabindex="-1">채널 플러그인 빌드하기 <a class="header-anchor" href="#채널-플러그인-빌드하기" aria-label="Permalink to &quot;채널 플러그인 빌드하기&quot;">​</a></h1><p>이 가이드는 OpenClaw를 메시징 플랫폼에 연결하는 채널 플러그인 빌드를 안내합니다. 끝까지 따라하면 DM 보안, 페어링, 답장 스레딩, 아웃바운드 메시징이 있는 작동하는 채널이 완성됩니다.</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>OpenClaw 플러그인을 처음 빌드하는 경우, 기본 패키지 구조 및 매니페스트 설정을 위해 먼저 <a href="/openclaw-docs-ko/plugins/building-plugins">시작하기</a>를 읽으십시오.</p></div><h2 id="채널-플러그인-작동-방식" tabindex="-1">채널 플러그인 작동 방식 <a class="header-anchor" href="#채널-플러그인-작동-방식" aria-label="Permalink to &quot;채널 플러그인 작동 방식&quot;">​</a></h2><p>채널 플러그인은 자체 전송/편집/반응 도구가 필요하지 않습니다. OpenClaw는 코어에 하나의 공유 <code>message</code> 도구를 유지합니다. 플러그인이 소유하는 것:</p><ul><li><strong>구성</strong> — 계정 해결 및 설정 마법사</li><li><strong>보안</strong> — DM 정책 및 허용 목록</li><li><strong>페어링</strong> — DM 승인 흐름</li><li><strong>세션 문법</strong> — 프로바이더별 대화 id가 기본 채팅, 스레드 id, 부모 폴백으로 매핑되는 방법</li><li><strong>아웃바운드</strong> — 플랫폼으로 텍스트, 미디어, 투표 전송</li><li><strong>스레딩</strong> — 답장이 스레드되는 방법</li></ul><p>코어는 공유 메시지 도구, 프롬프트 배선, 외부 세션-키 형태, 일반 <code>:thread:</code> 관리, 및 디스패치를 소유합니다.</p><p>플랫폼이 대화 id 내에 추가 범위를 저장하는 경우, <code>messaging.resolveSessionConversation(...)</code>을 사용하여 플러그인에서 해당 파싱을 유지하십시오. 이것은 <code>rawId</code>를 기본 대화 id, 선택적 스레드 id, 명시적 <code>baseConversationId</code>, 및 <code>parentConversationCandidates</code>로 매핑하는 표준 훅입니다. <code>parentConversationCandidates</code>를 반환할 때, 가장 좁은 부모에서 가장 넓은/기본 대화 순으로 정렬하십시오.</p><p>채널 레지스트리가 부팅되기 전에 동일한 파싱이 필요한 번들 플러그인은 일치하는 <code>resolveSessionConversation(...)</code> 내보내기가 있는 최상위 <code>session-key-api.ts</code> 파일을 노출할 수 있습니다. 코어는 런타임 플러그인 레지스트리가 아직 없을 때만 해당 부트스트랩 안전 표면을 사용합니다.</p><p><code>messaging.resolveParentConversationCandidates(...)</code>는 플러그인이 일반/원시 id 위에 부모 폴백만 필요할 때 레거시 호환성 폴백으로 사용 가능합니다. 두 훅이 모두 있으면, 코어는 <code>resolveSessionConversation(...).parentConversationCandidates</code>를 먼저 사용하고 표준 훅에서 생략된 경우에만 <code>resolveParentConversationCandidates(...)</code>로 폴백합니다.</p><h2 id="승인-및-채널-기능" tabindex="-1">승인 및 채널 기능 <a class="header-anchor" href="#승인-및-채널-기능" aria-label="Permalink to &quot;승인 및 채널 기능&quot;">​</a></h2><p>대부분의 채널 플러그인은 승인 특정 코드가 필요하지 않습니다.</p><ul><li>코어는 동일 채팅 <code>/approve</code>, 공유 승인 버튼 페이로드, 및 일반 폴백 전달을 소유합니다.</li><li>채널에 승인 특정 동작이 필요할 때 플러그인에 하나의 <code>approvalCapability</code> 객체를 사용하십시오.</li><li><code>ChannelPlugin.approvals</code>는 제거되었습니다. 승인 전달/네이티브/렌더/인증 사실을 <code>approvalCapability</code>에 넣으십시오.</li><li><code>plugin.auth</code>는 로그인/로그아웃 전용입니다; 코어는 더 이상 해당 객체에서 승인 인증 훅을 읽지 않습니다.</li><li><code>approvalCapability.authorizeActorAction</code> 및 <code>approvalCapability.getActionAvailabilityState</code>는 표준 승인 인증 이음새입니다.</li><li>동일 채팅 승인 인증 가용성에는 <code>approvalCapability.getActionAvailabilityState</code>를 사용하십시오.</li><li>채널이 네이티브 exec 승인을 노출하는 경우, 시작 표면/네이티브 클라이언트 상태가 동일 채팅 승인 인증과 다를 때 <code>approvalCapability.getExecInitiatingSurfaceState</code>를 사용하십시오. 코어는 해당 exec 특정 훅을 사용하여 <code>enabled</code> 대 <code>disabled</code>를 구분하고, 시작 채널이 네이티브 exec 승인을 지원하는지 결정하고, 채널을 네이티브 클라이언트 폴백 안내에 포함시킵니다. <code>createApproverRestrictedNativeApprovalCapability(...)</code>는 일반적인 경우를 채웁니다.</li><li>채널별 페이로드 수명 주기 동작(예: 중복 로컬 승인 프롬프트 숨기기 또는 전달 전 타이핑 표시기 전송)에는 <code>outbound.shouldSuppressLocalPayloadPrompt</code> 또는 <code>outbound.beforeDeliverPayload</code>를 사용하십시오.</li><li>네이티브 승인 라우팅 또는 폴백 억제에만 <code>approvalCapability.delivery</code>를 사용하십시오.</li><li>채널 소유 네이티브 승인 사실에는 <code>approvalCapability.nativeRuntime</code>을 사용하십시오. 핫 채널 엔트리포인트에서 <code>createLazyChannelApprovalNativeRuntimeAdapter(...)</code>로 지연 로드하여 코어가 승인 수명 주기를 어셈블하는 동안 런타임 모듈을 온디맨드로 임포트할 수 있습니다.</li><li>채널에 공유 렌더러 대신 커스텀 승인 페이로드가 진정으로 필요할 때만 <code>approvalCapability.render</code>를 사용하십시오.</li><li>채널이 비활성화 경로 답장에서 네이티브 exec 승인을 활성화하는 데 필요한 정확한 구성 노브를 설명하고 싶을 때 <code>approvalCapability.describeExecApprovalSetup</code>을 사용하십시오. 훅은 <code>{ channel, channelLabel, accountId }</code>를 받습니다; 명명된 계정 채널은 최상위 기본값 대신 <code>channels.&amp;lt;channel&amp;gt;.accounts.&amp;lt;id&amp;gt;.execApprovals.*</code>와 같은 계정 범위 경로를 렌더링해야 합니다.</li><li>채널이 기존 구성에서 안정적인 소유자 같은 DM 신원을 추론할 수 있다면, 코어에 승인 특정 로직을 추가하지 않고 동일 채팅 <code>/approve</code>를 제한하기 위해 <code>openclaw/plugin-sdk/approval-runtime</code>의 <code>createResolvedApproverActionAuthAdapter</code>를 사용하십시오.</li><li>채널에 네이티브 승인 전달이 필요하면, 채널 코드를 대상 정규화 및 전송/프레젠테이션 사실에 집중하십시오. <code>openclaw/plugin-sdk/approval-runtime</code>의 <code>createChannelExecApprovalProfile</code>, <code>createChannelNativeOriginTargetResolver</code>, <code>createChannelApproverDmTargetResolver</code>, <code>createApproverRestrictedNativeApprovalCapability</code>를 사용하십시오. 채널별 사실을 <code>approvalCapability.nativeRuntime</code> 뒤에 넣으십시오, 이상적으로는 <code>createChannelApprovalNativeRuntimeAdapter(...)</code>나 <code>createLazyChannelApprovalNativeRuntimeAdapter(...)</code>를 통해, 코어가 핸들러를 어셈블하고 요청 필터링, 라우팅, 중복 제거, 만료, 게이트웨이 구독, 및 다른 곳으로 라우팅된 알림을 소유할 수 있도록 합니다. <code>nativeRuntime</code>은 몇 가지 더 작은 이음새로 분할됩니다:</li><li><code>availability</code> — 계정이 구성되었는지 및 요청을 처리해야 하는지</li><li><code>presentation</code> — 공유 승인 뷰 모델을 대기/해결/만료된 네이티브 페이로드 또는 최종 작업으로 매핑</li><li><code>transport</code> — 대상 준비 및 네이티브 승인 메시지 전송/업데이트/삭제</li><li><code>interactions</code> — 네이티브 버튼이나 반응을 위한 선택적 바인드/언바인드/클리어-액션 훅</li><li><code>observe</code> — 선택적 전달 진단 훅</li><li>채널에 클라이언트, 토큰, Bolt 앱, 웹훅 수신기와 같은 런타임 소유 객체가 필요하면, <code>openclaw/plugin-sdk/channel-runtime-context</code>를 통해 등록하십시오. 일반 런타임-컨텍스트 레지스트리를 사용하면 코어가 채널 시작 상태에서 기능 기반 핸들러를 부트스트랩할 수 있습니다.</li><li>기능 기반 이음새가 충분히 표현적이지 않을 때만 하위 수준의 <code>createChannelApprovalHandler</code> 또는 <code>createChannelNativeApprovalRuntime</code>을 사용하십시오.</li><li>네이티브 승인 채널은 해당 헬퍼를 통해 <code>accountId</code>와 <code>approvalKind</code>를 모두 라우팅해야 합니다. <code>accountId</code>는 올바른 봇 계정으로 범위가 지정된 멀티-계정 승인 정책을 유지하고, <code>approvalKind</code>는 코어에 하드코딩된 분기 없이 exec 대 플러그인 승인 동작을 채널에서 사용할 수 있게 합니다.</li><li>코어는 이제 승인 재라우팅 알림도 소유합니다. 채널 플러그인은 <code>createChannelNativeApprovalRuntime</code>에서 &quot;승인이 DM/다른 채널로 이동했습니다&quot; 후속 메시지를 자체적으로 전송하지 않아야 합니다; 대신 공유 승인 기능 헬퍼를 통해 정확한 원점 + 승인자-DM 라우팅을 노출하고 코어가 시작 채팅에 알림을 게시하기 전에 실제 전달을 집계하도록 하십시오.</li><li>전달된 승인 id 종류를 끝까지 보존하십시오. 네이티브 클라이언트는 채널 로컬 상태에서 exec 대 플러그인 승인 라우팅을 추측하거나 다시 쓰지 않아야 합니다.</li><li>다른 승인 종류는 의도적으로 다른 네이티브 표면을 노출할 수 있습니다. 현재 번들 예시: <ul><li>Slack은 exec 및 플러그인 id 모두에 네이티브 승인 라우팅을 사용 가능하게 유지합니다.</li><li>Matrix는 exec 및 플러그인 승인에 대해 동일한 네이티브 DM/채널 라우팅 및 반응 UX를 유지하면서, 승인 종류에 따라 인증이 달라지도록 합니다.</li></ul></li><li><code>createApproverRestrictedNativeApprovalAdapter</code>는 여전히 호환성 래퍼로 존재하지만, 새 코드는 기능 빌더를 사용하고 플러그인에 <code>approvalCapability</code>를 노출하는 것을 선호해야 합니다.</li></ul><p>핫 채널 엔트리포인트의 경우, 그 계열의 한 부분만 필요할 때 더 좁은 런타임 서브경로를 사용하십시오:</p><ul><li><code>openclaw/plugin-sdk/approval-auth-runtime</code></li><li><code>openclaw/plugin-sdk/approval-client-runtime</code></li><li><code>openclaw/plugin-sdk/approval-delivery-runtime</code></li><li><code>openclaw/plugin-sdk/approval-gateway-runtime</code></li><li><code>openclaw/plugin-sdk/approval-handler-adapter-runtime</code></li><li><code>openclaw/plugin-sdk/approval-handler-runtime</code></li><li><code>openclaw/plugin-sdk/approval-native-runtime</code></li><li><code>openclaw/plugin-sdk/approval-reply-runtime</code></li><li><code>openclaw/plugin-sdk/channel-runtime-context</code></li></ul><p>마찬가지로, 더 넓은 우산 표면이 필요하지 않을 때 <code>openclaw/plugin-sdk/setup-runtime</code>, <code>openclaw/plugin-sdk/setup-adapter-runtime</code>, <code>openclaw/plugin-sdk/reply-runtime</code>, <code>openclaw/plugin-sdk/reply-dispatch-runtime</code>, <code>openclaw/plugin-sdk/reply-reference</code>, 및 <code>openclaw/plugin-sdk/reply-chunking</code>을 사용하십시오.</p><h2 id="인바운드-멘션-정책" tabindex="-1">인바운드 멘션 정책 <a class="header-anchor" href="#인바운드-멘션-정책" aria-label="Permalink to &quot;인바운드 멘션 정책&quot;">​</a></h2><p>인바운드 멘션 처리를 두 레이어로 분리하십시오:</p><ul><li>플러그인 소유 증거 수집</li><li>공유 정책 평가</li></ul><p>공유 레이어에는 <code>openclaw/plugin-sdk/channel-inbound</code>를 사용하십시오.</p><p>플러그인 로컬 로직에 적합한 것:</p><ul><li>봇 응답-감지</li><li>봇 인용 감지</li><li>스레드-참여 검사</li><li>서비스/시스템-메시지 제외</li><li>봇 참여를 증명하는 데 필요한 플랫폼 네이티브 캐시</li></ul><p>공유 헬퍼에 적합한 것:</p><ul><li><code>requireMention</code></li><li>명시적 멘션 결과</li><li>암시적 멘션 허용 목록</li><li>명령어 우회</li><li>최종 건너뛰기 결정</li></ul><p>권장 흐름:</p><ol><li>로컬 멘션 사실을 계산합니다.</li><li>해당 사실을 <code>resolveInboundMentionDecision({ facts, policy })</code>에 전달합니다.</li><li>인바운드 게이트에서 <code>decision.effectiveWasMentioned</code>, <code>decision.shouldBypassMention</code>, <code>decision.shouldSkip</code>을 사용합니다.</li></ol><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  implicitMentionKindWhen,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  matchesMentionWithExplicit,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  resolveInboundMentionDecision,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;openclaw/plugin-sdk/channel-inbound&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> mentionMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> matchesMentionWithExplicit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(text, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mentionRegexes,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mentionPatterns,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> facts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  canDetectMention: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  wasMentioned: mentionMatch.matched,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  hasAnyMention: mentionMatch.hasExplicitMention,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  implicitMentionKinds: [</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    ...</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">implicitMentionKindWhen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;reply_to_bot&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, isReplyToBot),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    ...</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">implicitMentionKindWhen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;quoted_bot&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, isQuoteOfBot),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> decision</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> resolveInboundMentionDecision</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  facts,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  policy: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    isGroup,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    requireMention,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    allowedImplicitMentionKinds: requireExplicitMention </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;reply_to_bot&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;quoted_bot&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    allowTextCommands,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    hasControlCommand,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    commandAuthorized,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (decision.shouldSkip) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><p><code>api.runtime.channel.mentions</code>는 런타임 주입을 이미 사용하는 번들 채널 플러그인을 위해 동일한 공유 멘션 헬퍼를 노출합니다:</p><ul><li><code>buildMentionRegexes</code></li><li><code>matchesMentionPatterns</code></li><li><code>matchesMentionWithExplicit</code></li><li><code>implicitMentionKindWhen</code></li><li><code>resolveInboundMentionDecision</code></li></ul><p>이전의 <code>resolveMentionGating*</code> 헬퍼는 <code>openclaw/plugin-sdk/channel-inbound</code>에 호환성 내보내기로만 남아 있습니다. 새 코드는 <code>resolveInboundMentionDecision({ facts, policy })</code>를 사용해야 합니다.</p><h2 id="연습" tabindex="-1">연습 <a class="header-anchor" href="#연습" aria-label="Permalink to &quot;연습&quot;">​</a></h2><p><a id="step-1-package-and-manifest"></a></p><ol><li><strong>패키지 및 매니페스트</strong></li></ol><p>표준 플러그인 파일을 만드십시오. <code>package.json</code>의 <code>channel</code> 필드가 이것을 채널 플러그인으로 만드는 것입니다. 전체 패키지-메타데이터 표면은 <a href="/openclaw-docs-ko/plugins/sdk-setup#openclawchannel">플러그인 설정 및 구성</a>을 참조하십시오:</p><pre><code>   \`\`\`json package.json
   {
     &quot;name&quot;: &quot;@myorg/openclaw-acme-chat&quot;,
     &quot;version&quot;: &quot;1.0.0&quot;,
     &quot;type&quot;: &quot;module&quot;,
     &quot;openclaw&quot;: {
       &quot;extensions&quot;: [&quot;./index.ts&quot;],
       &quot;setupEntry&quot;: &quot;./setup-entry.ts&quot;,
       &quot;channel&quot;: {
         &quot;id&quot;: &quot;acme-chat&quot;,
         &quot;label&quot;: &quot;Acme Chat&quot;,
         &quot;blurb&quot;: &quot;Connect OpenClaw to Acme Chat.&quot;
       }
     }
   }
   \`\`\`

   \`\`\`json openclaw.plugin.json
   {
     &quot;id&quot;: &quot;acme-chat&quot;,
     &quot;kind&quot;: &quot;channel&quot;,
     &quot;channels&quot;: [&quot;acme-chat&quot;],
     &quot;name&quot;: &quot;Acme Chat&quot;,
     &quot;description&quot;: &quot;Acme Chat channel plugin&quot;,
     &quot;configSchema&quot;: {
       &quot;type&quot;: &quot;object&quot;,
       &quot;additionalProperties&quot;: false,
       &quot;properties&quot;: {
         &quot;acme-chat&quot;: {
           &quot;type&quot;: &quot;object&quot;,
           &quot;properties&quot;: {
             &quot;token&quot;: { &quot;type&quot;: &quot;string&quot; },
             &quot;allowFrom&quot;: {
               &quot;type&quot;: &quot;array&quot;,
               &quot;items&quot;: { &quot;type&quot;: &quot;string&quot; }
             }
           }
         }
       }
     }
   }
   \`\`\`
   2. **채널 플러그인 객체 빌드하기**
</code></pre><p><code>ChannelPlugin</code> 인터페이스에는 많은 선택적 어댑터 표면이 있습니다. 최솟값인 <code>id</code>와 <code>setup</code>으로 시작하고 필요에 따라 어댑터를 추가하십시오.</p><pre><code>   \`src/channel.ts\`를 만드십시오:

   \`\`\`typescript src/channel.ts
   import {
     createChatChannelPlugin,
     createChannelPluginBase,
   } from &quot;openclaw/plugin-sdk/channel-core&quot;;
   import type { OpenClawConfig } from &quot;openclaw/plugin-sdk/channel-core&quot;;
   import { acmeChatApi } from &quot;./client.js&quot;; // 플랫폼 API 클라이언트

   type ResolvedAccount = {
     accountId: string | null;
     token: string;
     allowFrom: string[];
     dmPolicy: string | undefined;
   };

   function resolveAccount(
     cfg: OpenClawConfig,
     accountId?: string | null,
   ): ResolvedAccount {
     const section = (cfg.channels as Record&amp;lt;string, any&amp;gt;)?.[&quot;acme-chat&quot;];
     const token = section?.token;
     if (!token) throw new Error(&quot;acme-chat: token is required&quot;);
     return {
       accountId: accountId ?? null,
       token,
       allowFrom: section?.allowFrom ?? [],
       dmPolicy: section?.dmSecurity,
     };
   }

   export const acmeChatPlugin = createChatChannelPlugin&amp;lt;ResolvedAccount&amp;gt;({
     base: createChannelPluginBase({
       id: &quot;acme-chat&quot;,
       setup: {
         resolveAccount,
         inspectAccount(cfg, accountId) {
           const section =
             (cfg.channels as Record&amp;lt;string, any&amp;gt;)?.[&quot;acme-chat&quot;];
           return {
             enabled: Boolean(section?.token),
             configured: Boolean(section?.token),
             tokenStatus: section?.token ? &quot;available&quot; : &quot;missing&quot;,
           };
         },
       },
     }),

     // DM 보안: 봇에게 메시지를 보낼 수 있는 사람
     security: {
       dm: {
         channelKey: &quot;acme-chat&quot;,
         resolvePolicy: (account) =&gt; account.dmPolicy,
         resolveAllowFrom: (account) =&gt; account.allowFrom,
         defaultPolicy: &quot;allowlist&quot;,
       },
     },

     // 페어링: 새 DM 연락처를 위한 승인 흐름
     pairing: {
       text: {
         idLabel: &quot;Acme Chat username&quot;,
         message: &quot;Send this code to verify your identity:&quot;,
         notify: async ({ target, code }) =&gt; {
           await acmeChatApi.sendDm(target, \`Pairing code: \${code}\`);
         },
       },
     },

     // 스레딩: 답장 전달 방식
     threading: { topLevelReplyToMode: &quot;reply&quot; },

     // 아웃바운드: 플랫폼으로 메시지 전송
     outbound: {
       attachedResults: {
         sendText: async (params) =&gt; {
           const result = await acmeChatApi.sendMessage(
             params.to,
             params.text,
           );
           return { messageId: result.id };
         },
       },
       base: {
         sendMedia: async (params) =&gt; {
           await acmeChatApi.sendFile(params.to, params.filePath);
         },
       },
     },
   });
   \`\`\`

   ::: details createChatChannelPlugin이 하는 일
</code></pre><p>하위 수준 어댑터 인터페이스를 수동으로 구현하는 대신, 선언적 옵션을 전달하면 빌더가 이를 구성합니다:</p><pre><code>     | 옵션 | 배선하는 것 |
     | --- | --- |
     | \`security.dm\` | 구성 필드에서 범위가 지정된 DM 보안 해결자 |
     | \`pairing.text\` | 코드 교환이 있는 텍스트 기반 DM 페어링 흐름 |
     | \`threading\` | 답장-모드 해결자(고정, 계정 범위, 또는 커스텀) |
     | \`outbound.attachedResults\` | 결과 메타데이터(메시지 id)를 반환하는 전송 함수 |

     전체 제어가 필요하면 선언적 옵션 대신 원시 어댑터 객체를 전달할 수도 있습니다.
</code></pre><p>:::</p><ol start="3"><li><strong>엔트리포인트 배선하기</strong></li></ol><p><code>index.ts</code>를 만드십시오:</p><pre><code>   \`\`\`typescript index.ts
   import { defineChannelPluginEntry } from &quot;openclaw/plugin-sdk/channel-core&quot;;
   import { acmeChatPlugin } from &quot;./src/channel.js&quot;;

   export default defineChannelPluginEntry({
     id: &quot;acme-chat&quot;,
     name: &quot;Acme Chat&quot;,
     description: &quot;Acme Chat channel plugin&quot;,
     plugin: acmeChatPlugin,
     registerCliMetadata(api) {
       api.registerCli(
         ({ program }) =&gt; {
           program
             .command(&quot;acme-chat&quot;)
             .description(&quot;Acme Chat management&quot;);
         },
         {
           descriptors: [
             {
               name: &quot;acme-chat&quot;,
               description: &quot;Acme Chat management&quot;,
               hasSubcommands: false,
             },
           ],
         },
       );
     },
     registerFull(api) {
       api.registerGatewayMethod(/* ... */);
     },
   });
   \`\`\`

   채널 소유 CLI 설명자를 \`registerCliMetadata(...)\`에 넣어 OpenClaw가 전체 채널 런타임을
   활성화하지 않고 루트 도움말에 표시할 수 있게 하고, 일반 전체 로드는 여전히 실제 명령
   등록을 위해 동일한 설명자를 가져옵니다. \`registerFull(...)\`은 런타임 전용 작업을 위해
   유지하십시오. \`registerFull(...)\`이 게이트웨이 RPC 메서드를 등록하면, 플러그인 특정
   접두사를 사용하십시오. 코어 관리자 네임스페이스(\`config.*\`, \`exec.approvals.*\`,
   \`wizard.*\`, \`update.*\`)는 예약되어 있으며 항상 \`operator.admin\`으로 확인됩니다.
   \`defineChannelPluginEntry\`는 등록 모드 분할을 자동으로 처리합니다. 모든
   옵션은 [엔트리 포인트](/plugins/sdk-entrypoints#definechannelpluginentry)를 참조하십시오.
</code></pre><ol start="4"><li><strong>설정 엔트리 추가하기</strong></li></ol><p>온보딩 중 경량 로딩을 위한 <code>setup-entry.ts</code>를 만드십시오:</p><pre><code>   \`\`\`typescript setup-entry.ts
   import { defineSetupPluginEntry } from &quot;openclaw/plugin-sdk/channel-core&quot;;
   import { acmeChatPlugin } from &quot;./src/channel.js&quot;;

   export default defineSetupPluginEntry(acmeChatPlugin);
   \`\`\`

   채널이 비활성화되거나 구성되지 않은 경우 OpenClaw는 전체 엔트리 대신 이것을 로드합니다.
   설정 흐름 중에 무거운 런타임 코드를 가져오는 것을 방지합니다.
   자세한 내용은 [설정 및 구성](/plugins/sdk-setup#setup-entry)을 참조하십시오.
</code></pre><ol start="5"><li><strong>인바운드 메시지 처리하기</strong></li></ol><p>플러그인은 플랫폼에서 메시지를 받아 OpenClaw로 전달해야 합니다. 일반적인 패턴은 요청을 검증하고 채널의 인바운드 핸들러를 통해 디스패치하는 웹훅입니다:</p><pre><code>   \`\`\`typescript
   registerFull(api) {
     api.registerHttpRoute({
       path: &quot;/acme-chat/webhook&quot;,
       auth: &quot;plugin&quot;, // 플러그인 관리 인증(직접 서명 검증)
       handler: async (req, res) =&gt; {
         const event = parseWebhookPayload(req);

         // 인바운드 핸들러가 메시지를 OpenClaw로 디스패치합니다.
         // 정확한 배선은 플랫폼 SDK에 따라 다릅니다 —
         // 번들 Microsoft Teams 또는 Google Chat 플러그인 패키지에서 실제 예시를 참조하십시오.
         await handleAcmeChatInbound(api, event);

         res.statusCode = 200;
         res.end(&quot;ok&quot;);
         return true;
       },
     });
   }
   \`\`\`

   ::: info NOTE
</code></pre><p>인바운드 메시지 처리는 채널에 따라 다릅니다. 각 채널 플러그인은 자체 인바운드 파이프라인을 소유합니다. 실제 패턴은 번들 채널 플러그인(예: Microsoft Teams 또는 Google Chat 플러그인 패키지)을 참조하십시오. :::</p><p><a id="step-6-test"></a> 6. <strong>테스트</strong></p><p><code>src/channel.test.ts</code>에 동일한 위치에 테스트를 작성하십시오:</p><pre><code>   \`\`\`typescript src/channel.test.ts
   import { describe, it, expect } from &quot;vitest&quot;;
   import { acmeChatPlugin } from &quot;./channel.js&quot;;

   describe(&quot;acme-chat plugin&quot;, () =&gt; {
     it(&quot;resolves account from config&quot;, () =&gt; {
       const cfg = {
         channels: {
           &quot;acme-chat&quot;: { token: &quot;test-token&quot;, allowFrom: [&quot;user1&quot;] },
         },
       } as any;
       const account = acmeChatPlugin.setup!.resolveAccount(cfg, undefined);
       expect(account.token).toBe(&quot;test-token&quot;);
     });

     it(&quot;inspects account without materializing secrets&quot;, () =&gt; {
       const cfg = {
         channels: { &quot;acme-chat&quot;: { token: &quot;test-token&quot; } },
       } as any;
       const result = acmeChatPlugin.setup!.inspectAccount!(cfg, undefined);
       expect(result.configured).toBe(true);
       expect(result.tokenStatus).toBe(&quot;available&quot;);
     });

     it(&quot;reports missing config&quot;, () =&gt; {
       const cfg = { channels: {} } as any;
       const result = acmeChatPlugin.setup!.inspectAccount!(cfg, undefined);
       expect(result.configured).toBe(false);
     });
   });
   \`\`\`

   \`\`\`bash
   pnpm test -- &amp;lt;bundled-plugin-root&amp;gt;/acme-chat/
   \`\`\`

   공유 테스트 헬퍼는 [테스팅](/plugins/sdk-testing)을 참조하십시오.
</code></pre><h2 id="파일-구조" tabindex="-1">파일 구조 <a class="header-anchor" href="#파일-구조" aria-label="Permalink to &quot;파일 구조&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&amp;lt;bundled-plugin-root&amp;gt;/acme-chat/</span></span>
<span class="line"><span>├── package.json              # openclaw.channel 메타데이터</span></span>
<span class="line"><span>├── openclaw.plugin.json      # 구성 스키마가 있는 매니페스트</span></span>
<span class="line"><span>├── index.ts                  # defineChannelPluginEntry</span></span>
<span class="line"><span>├── setup-entry.ts            # defineSetupPluginEntry</span></span>
<span class="line"><span>├── api.ts                    # 공개 내보내기(선택)</span></span>
<span class="line"><span>├── runtime-api.ts            # 내부 런타임 내보내기(선택)</span></span>
<span class="line"><span>└── src/</span></span>
<span class="line"><span>    ├── channel.ts            # createChatChannelPlugin을 통한 ChannelPlugin</span></span>
<span class="line"><span>    ├── channel.test.ts       # 테스트</span></span>
<span class="line"><span>    ├── client.ts             # 플랫폼 API 클라이언트</span></span>
<span class="line"><span>    └── runtime.ts            # 런타임 저장소(필요한 경우)</span></span></code></pre></div><h2 id="고급-주제" tabindex="-1">고급 주제 <a class="header-anchor" href="#고급-주제" aria-label="Permalink to &quot;고급 주제&quot;">​</a></h2><blockquote><p><strong>스레딩 옵션</strong> 고정, 계정 범위, 또는 커스텀 답장 모드</p></blockquote><blockquote><p><strong>메시지 도구 통합</strong> describeMessageTool 및 액션 검색</p></blockquote><blockquote><p><strong>대상 해결</strong> inferTargetChatType, looksLikeId, resolveTarget</p></blockquote><blockquote><p><strong>런타임 헬퍼</strong> api.runtime을 통한 TTS, STT, 미디어, 서브에이전트</p></blockquote><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>일부 번들 헬퍼 이음새는 번들 플러그인 유지 관리 및 호환성을 위해 여전히 존재합니다. 해당 번들 플러그인 계열을 직접 유지 관리하지 않는 한 새 채널 플러그인에 권장되는 패턴이 아닙니다; 공통 SDK 표면의 일반 채널/설정/답장/런타임 서브경로를 사용하십시오.</p></div><h2 id="다음-단계" tabindex="-1">다음 단계 <a class="header-anchor" href="#다음-단계" aria-label="Permalink to &quot;다음 단계&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/plugins/sdk-provider-plugins">프로바이더 플러그인</a> — 플러그인이 모델도 제공하는 경우</li><li><a href="/openclaw-docs-ko/plugins/sdk-overview">SDK 개요</a> — 전체 서브경로 임포트 참조</li><li><a href="/openclaw-docs-ko/plugins/sdk-testing">SDK 테스팅</a> — 테스트 유틸리티 및 계약 테스트</li><li><a href="/openclaw-docs-ko/plugins/manifest">플러그인 매니페스트</a> — 전체 매니페스트 스키마</li></ul>`,63)])])}const k=e(s,[["render",o]]);export{h as __pageData,k as default};
