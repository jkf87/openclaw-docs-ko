import{_ as n,o as a,c as i,ag as t}from"./chunks/framework.CTpQozEL.js";const h=JSON.parse('{"title":"Channel plugin 빌드하기","description":"OpenClaw용 메시징 channel plugin을 빌드하는 단계별 가이드","frontmatter":{"title":"Channel plugin 빌드하기","description":"OpenClaw용 메시징 channel plugin을 빌드하는 단계별 가이드"},"headers":[],"relativePath":"plugins/sdk-channel-plugins.md","filePath":"plugins/sdk-channel-plugins.md","lastUpdated":null}'),o={name:"plugins/sdk-channel-plugins.md"};function l(s,e,p,c,r,d){return a(),i("div",null,[...e[0]||(e[0]=[t(`<p>이 가이드는 OpenClaw를 메시징 플랫폼에 연결하는 channel plugin을 빌드하는 과정을 안내합니다. 끝까지 따라오시면 DM 보안, pairing, 답장 스레딩, 아웃바운드 메시징이 작동하는 channel이 완성됩니다.</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>OpenClaw plugin을 한 번도 빌드해 본 적이 없으시다면, 기본 패키지 구조와 manifest 설정을 위해 먼저 <a href="/openclaw-docs-ko/plugins/building-plugins">시작하기</a>를 읽으십시오.</p></div><h2 id="channel-plugin의-작동-방식" tabindex="-1">Channel plugin의 작동 방식 <a class="header-anchor" href="#channel-plugin의-작동-방식" aria-label="Permalink to &quot;Channel plugin의 작동 방식&quot;">​</a></h2><p>Channel plugin은 자체 send/edit/react 도구가 필요하지 않습니다. OpenClaw는 코어에 하나의 공유 <code>message</code> 도구를 유지합니다. 플러그인이 소유하는 것:</p><ul><li><strong>Config</strong> — 계정 해결(account resolution) 및 setup 마법사</li><li><strong>Security</strong> — DM 정책 및 allowlist</li><li><strong>Pairing</strong> — DM 승인 흐름</li><li><strong>Session grammar</strong> — 프로바이더별 대화 id가 base chat, thread id, parent fallback으로 매핑되는 방식</li><li><strong>Outbound</strong> — 플랫폼으로 텍스트, 미디어, 투표(poll) 전송</li><li><strong>Threading</strong> — 답장이 스레드되는 방식</li><li><strong>Heartbeat typing</strong> — heartbeat delivery target을 위한 선택적 typing/busy 신호</li></ul><p>코어는 공유 message 도구, 프롬프트 배선, 외부 session-key 모양, 일반 <code>:thread:</code> 관리, 및 dispatch를 소유합니다.</p><p>Channel이 인바운드 답장 외부에서 typing 표시기를 지원한다면, channel plugin에 <code>heartbeat.sendTyping(...)</code>을 노출하십시오. 코어는 heartbeat 모델 실행이 시작되기 전에 해결된 heartbeat delivery target으로 이를 호출하며, 공유 typing keepalive/cleanup 수명 주기를 사용합니다. 플랫폼에 명시적 정지 신호가 필요한 경우 <code>heartbeat.clearTyping(...)</code>을 추가하십시오.</p><p>Channel이 media source를 전달하는 message-tool 파라미터를 추가한다면, 해당 파라미터 이름을 <code>describeMessageTool(...).mediaSourceParams</code>를 통해 노출하십시오. 코어는 이 명시적 목록을 sandbox 경로 정규화와 아웃바운드 media-access 정책에 사용하므로, plugin은 프로바이더별 avatar, attachment, cover-image 파라미터에 대해 shared-core 특수 케이스가 필요하지 않습니다. 관련 없는 action이 다른 action의 media 인자를 상속받지 않도록 <code>{ &quot;set-profile&quot;: [&quot;avatarUrl&quot;, &quot;avatarPath&quot;] }</code>와 같이 action-keyed 맵을 반환하는 것을 선호하십시오. 노출된 모든 action에 의도적으로 공유되는 파라미터의 경우 평탄한 배열도 여전히 작동합니다.</p><p>플랫폼이 대화 id 내부에 추가 scope를 저장한다면, 해당 파싱을 plugin 내부에 <code>messaging.resolveSessionConversation(...)</code>으로 유지하십시오. 이는 <code>rawId</code>를 base 대화 id, 선택적 thread id, 명시적 <code>baseConversationId</code>, 그리고 <code>parentConversationCandidates</code>로 매핑하는 표준(canonical) 훅입니다. <code>parentConversationCandidates</code>를 반환할 때는 가장 좁은 parent에서 가장 넓은/base 대화 순으로 정렬된 상태로 유지하십시오.</p><p>Channel registry가 부팅되기 전에 동일한 파싱이 필요한 번들 plugin은 일치하는 <code>resolveSessionConversation(...)</code> export가 있는 최상위 <code>session-key-api.ts</code> 파일도 노출할 수 있습니다. 코어는 runtime plugin registry를 아직 사용할 수 없을 때만 해당 bootstrap-safe 표면을 사용합니다.</p><p><code>messaging.resolveParentConversationCandidates(...)</code>는 plugin이 generic/raw id 위에 parent fallback만 필요한 경우를 위한 레거시 호환성 fallback으로 남아 있습니다. 두 훅이 모두 존재하면, 코어는 <code>resolveSessionConversation(...).parentConversationCandidates</code>를 먼저 사용하고, 표준 훅이 이를 생략했을 때만 <code>resolveParentConversationCandidates(...)</code>로 fallback합니다.</p><h2 id="approval-및-channel-capability" tabindex="-1">Approval 및 channel capability <a class="header-anchor" href="#approval-및-channel-capability" aria-label="Permalink to &quot;Approval 및 channel capability&quot;">​</a></h2><p>대부분의 channel plugin은 approval 전용 코드가 필요하지 않습니다.</p><ul><li>코어는 동일 채팅 <code>/approve</code>, 공유 approval 버튼 payload, 그리고 일반(generic) fallback delivery를 소유합니다.</li><li>Channel이 approval 전용 동작을 필요로 할 때 channel plugin에 하나의 <code>approvalCapability</code> 객체를 사용하는 것을 선호하십시오.</li><li><code>ChannelPlugin.approvals</code>는 제거되었습니다. approval delivery/native/render/auth 관련 사실은 <code>approvalCapability</code>에 넣으십시오.</li><li><code>plugin.auth</code>는 login/logout 전용입니다; 코어는 더 이상 해당 객체에서 approval auth 훅을 읽지 않습니다.</li><li><code>approvalCapability.authorizeActorAction</code>과 <code>approvalCapability.getActionAvailabilityState</code>가 표준(canonical) approval-auth seam입니다.</li><li>동일 채팅 approval auth 가용성에는 <code>approvalCapability.getActionAvailabilityState</code>를 사용하십시오.</li><li>Channel이 네이티브 exec approval을 노출하는 경우, initiating-surface/native-client 상태가 동일 채팅 approval auth와 다를 때 <code>approvalCapability.getExecInitiatingSurfaceState</code>를 사용하십시오. 코어는 해당 exec 전용 훅을 사용해 <code>enabled</code> 대 <code>disabled</code>를 구분하고, initiating channel이 네이티브 exec approval을 지원하는지 결정하며, native-client fallback 안내에 channel을 포함시킵니다. <code>createApproverRestrictedNativeApprovalCapability(...)</code>가 일반적인 경우를 채워 줍니다.</li><li>중복 로컬 approval 프롬프트 숨기기나 delivery 이전 typing 표시기 전송과 같은 channel 전용 payload 수명 주기 동작에는 <code>outbound.shouldSuppressLocalPayloadPrompt</code> 또는 <code>outbound.beforeDeliverPayload</code>를 사용하십시오.</li><li><code>approvalCapability.delivery</code>는 네이티브 approval 라우팅 또는 fallback 억제에만 사용하십시오.</li><li>Channel 소유 네이티브 approval 관련 사실에는 <code>approvalCapability.nativeRuntime</code>을 사용하십시오. 핫(hot) channel entrypoint에서는 <code>createLazyChannelApprovalNativeRuntimeAdapter(...)</code>를 사용해 lazy하게 유지하십시오. 이는 코어가 approval 수명 주기를 조립하도록 두면서도 runtime 모듈을 요청 시점에 import할 수 있게 합니다.</li><li>공유 renderer 대신 커스텀 approval payload가 정말로 필요할 때만 <code>approvalCapability.render</code>를 사용하십시오.</li><li>disabled-path 답장이 네이티브 exec approval을 활성화하는 데 필요한 정확한 config 노브(knob)를 설명하기를 원할 때 <code>approvalCapability.describeExecApprovalSetup</code>을 사용하십시오. 이 훅은 <code>{ channel, channelLabel, accountId }</code>를 받습니다; named-account channel은 최상위 기본값 대신 <code>channels.&lt;channel&gt;.accounts.&lt;id&gt;.execApprovals.*</code>와 같이 account-scoped 경로를 렌더링해야 합니다.</li><li>Channel이 기존 config에서 안정적인 owner-like DM 아이덴티티를 추론할 수 있다면, approval 전용 코어 로직을 추가하지 않고 동일 채팅 <code>/approve</code>를 제한하기 위해 <code>openclaw/plugin-sdk/approval-runtime</code>의 <code>createResolvedApproverActionAuthAdapter</code>를 사용하십시오.</li><li>Channel에 네이티브 approval delivery가 필요하다면, channel 코드는 target 정규화와 transport/presentation 관련 사실에 집중하십시오. <code>openclaw/plugin-sdk/approval-runtime</code>의 <code>createChannelExecApprovalProfile</code>, <code>createChannelNativeOriginTargetResolver</code>, <code>createChannelApproverDmTargetResolver</code>, <code>createApproverRestrictedNativeApprovalCapability</code>를 사용하십시오. Channel 전용 사실은 <code>approvalCapability.nativeRuntime</code> 뒤에 배치하되, 이상적으로는 <code>createChannelApprovalNativeRuntimeAdapter(...)</code> 또는 <code>createLazyChannelApprovalNativeRuntimeAdapter(...)</code>를 통해 배치해 코어가 handler를 조립하고 요청 필터링, 라우팅, 중복 제거(dedupe), 만료(expiry), gateway 구독, routed-elsewhere 알림을 소유할 수 있도록 하십시오. <code>nativeRuntime</code>은 몇 가지 더 작은 seam으로 분할됩니다:</li><li><code>availability</code> — 계정이 구성되었는지 여부와 요청이 처리되어야 하는지 여부</li><li><code>presentation</code> — 공유 approval 뷰 모델을 대기(pending)/해결(resolved)/만료(expired) 네이티브 payload 또는 최종 액션으로 매핑</li><li><code>transport</code> — target을 준비하고 네이티브 approval 메시지를 송신/업데이트/삭제</li><li><code>interactions</code> — 네이티브 버튼이나 반응을 위한 선택적 bind/unbind/clear-action 훅</li><li><code>observe</code> — 선택적 delivery 진단 훅</li><li>Channel에 client, token, Bolt app, webhook receiver 같은 runtime 소유 객체가 필요하다면, <code>openclaw/plugin-sdk/channel-runtime-context</code>를 통해 등록하십시오. 일반(generic) runtime-context registry는 approval 전용 wrapper glue를 추가하지 않고도 channel 시작 상태로부터 capability-driven handler를 코어가 bootstrap할 수 있게 해 줍니다.</li><li>capability-driven seam이 아직 충분히 표현력 있지 않을 때에만 하위 수준의 <code>createChannelApprovalHandler</code> 또는 <code>createChannelNativeApprovalRuntime</code>에 의존하십시오.</li><li>네이티브 approval channel은 해당 helper들을 통해 <code>accountId</code>와 <code>approvalKind</code>를 모두 라우팅해야 합니다. <code>accountId</code>는 멀티 계정 approval 정책을 올바른 봇 계정으로 scope한 상태로 유지하고, <code>approvalKind</code>는 코어에 하드코딩된 분기 없이 channel이 exec 대 plugin approval 동작을 구분할 수 있게 해 줍니다.</li><li>이제 코어가 approval reroute 알림도 소유합니다. Channel plugin은 <code>createChannelNativeApprovalRuntime</code>에서 자체적으로 &quot;approval이 DM으로/다른 channel로 이동했습니다&quot; 후속 메시지를 전송하지 않아야 합니다; 대신 공유 approval capability helper를 통해 정확한 origin + approver-DM 라우팅을 노출하고, 코어가 실제 delivery를 집계한 뒤 initiating chat에 알림을 게시하도록 두십시오.</li><li>전달된 approval id의 kind를 end-to-end로 보존하십시오. 네이티브 client는 channel-local 상태에서 exec 대 plugin approval 라우팅을 추측하거나 다시 쓰지 않아야 합니다.</li><li>서로 다른 approval kind는 의도적으로 서로 다른 네이티브 표면을 노출할 수 있습니다. 현재 번들된 예시: <ul><li>Slack은 exec와 plugin id 모두에 대해 네이티브 approval 라우팅을 사용 가능한 상태로 유지합니다.</li><li>Matrix는 exec와 plugin approval에 대해 동일한 네이티브 DM/channel 라우팅과 반응 UX를 유지하면서도, approval kind에 따라 auth가 달라질 수 있게 둡니다.</li></ul></li><li><code>createApproverRestrictedNativeApprovalAdapter</code>는 여전히 호환성 wrapper로 존재하지만, 새 코드는 capability 빌더를 선호하고 plugin에 <code>approvalCapability</code>를 노출해야 합니다.</li></ul><p>핫(hot) channel entrypoint의 경우, 해당 family에서 한 부분만 필요할 때는 더 좁은 runtime 서브패스를 선호하십시오:</p><ul><li><code>openclaw/plugin-sdk/approval-auth-runtime</code></li><li><code>openclaw/plugin-sdk/approval-client-runtime</code></li><li><code>openclaw/plugin-sdk/approval-delivery-runtime</code></li><li><code>openclaw/plugin-sdk/approval-gateway-runtime</code></li><li><code>openclaw/plugin-sdk/approval-handler-adapter-runtime</code></li><li><code>openclaw/plugin-sdk/approval-handler-runtime</code></li><li><code>openclaw/plugin-sdk/approval-native-runtime</code></li><li><code>openclaw/plugin-sdk/approval-reply-runtime</code></li><li><code>openclaw/plugin-sdk/channel-runtime-context</code></li></ul><p>마찬가지로, 더 넓은 우산(umbrella) 표면이 필요하지 않다면 <code>openclaw/plugin-sdk/setup-runtime</code>, <code>openclaw/plugin-sdk/setup-adapter-runtime</code>, <code>openclaw/plugin-sdk/reply-runtime</code>, <code>openclaw/plugin-sdk/reply-dispatch-runtime</code>, <code>openclaw/plugin-sdk/reply-reference</code>, <code>openclaw/plugin-sdk/reply-chunking</code>을 선호하십시오.</p><p>Setup의 경우 특히:</p><ul><li><code>openclaw/plugin-sdk/setup-runtime</code>은 runtime-safe setup helper를 다룹니다: import-safe setup patch adapter (<code>createPatchedAccountSetupAdapter</code>, <code>createEnvPatchedAccountSetupAdapter</code>, <code>createSetupInputPresenceValidator</code>), lookup-note 출력, <code>promptResolvedAllowFrom</code>, <code>splitSetupEntries</code>, 그리고 위임된(delegated) setup-proxy 빌더</li><li><code>openclaw/plugin-sdk/setup-adapter-runtime</code>은 <code>createEnvPatchedAccountSetupAdapter</code>를 위한 좁은 env-aware adapter seam입니다</li><li><code>openclaw/plugin-sdk/channel-setup</code>은 optional-install setup 빌더와 몇 가지 setup-safe 프리미티브를 다룹니다: <code>createOptionalChannelSetupSurface</code>, <code>createOptionalChannelSetupAdapter</code>,</li></ul><p>Channel이 env 기반 setup 또는 auth를 지원하고, runtime이 로드되기 전에 일반 startup/config 흐름이 해당 env 이름을 알아야 한다면, plugin manifest에서 <code>channelEnvVars</code>로 선언하십시오. Channel runtime <code>envVars</code> 또는 로컬 상수는 운영자 대면 문구 전용으로만 유지하십시오.</p><p>Channel이 plugin runtime이 시작되기 전에 <code>status</code>, <code>channels list</code>, <code>channels status</code>, 또는 SecretRef 스캔에 나타날 수 있다면, <code>package.json</code>에 <code>openclaw.setupEntry</code>를 추가하십시오. 해당 entrypoint는 read-only 명령 경로에서 import하기 안전해야 하며, 이러한 요약에 필요한 channel 메타데이터, setup-safe config adapter, status adapter, 그리고 channel secret target 메타데이터를 반환해야 합니다. Setup entry에서는 client, listener, transport runtime을 시작하지 마십시오.</p><p><code>createOptionalChannelSetupWizard</code>, <code>DEFAULT_ACCOUNT_ID</code>, <code>createTopLevelChannelDmPolicy</code>, <code>setSetupChannelEnabled</code>, <code>splitSetupEntries</code></p><ul><li><code>moveSingleAccountChannelSectionToDefaultAccount(...)</code>와 같은 더 무거운 공유 setup/config helper도 필요한 경우에만 더 넓은 <code>openclaw/plugin-sdk/setup</code> seam을 사용하십시오</li></ul><p>Channel이 setup 표면에서 &quot;이 plugin을 먼저 설치하세요&quot;만 광고하고 싶다면, <code>createOptionalChannelSetupSurface(...)</code>를 선호하십시오. 생성된 adapter/wizard는 config 쓰기와 finalization에서 fail-closed로 동작하며, validation, finalize, docs-link 문구 전반에 걸쳐 동일한 install-required 메시지를 재사용합니다.</p><p>다른 핫(hot) channel 경로의 경우, 더 넓은 레거시 표면보다는 좁은 helper를 선호하십시오:</p><ul><li>멀티 계정 config 및 default-account fallback용: <code>openclaw/plugin-sdk/account-core</code>, <code>openclaw/plugin-sdk/account-id</code>, <code>openclaw/plugin-sdk/account-resolution</code>, <code>openclaw/plugin-sdk/account-helpers</code></li><li>인바운드 라우트/envelope 및 record-and-dispatch 배선용: <code>openclaw/plugin-sdk/inbound-envelope</code> 및 <code>openclaw/plugin-sdk/inbound-reply-dispatch</code></li><li>Target 파싱/매칭용: <code>openclaw/plugin-sdk/messaging-targets</code></li><li>미디어 로딩 및 아웃바운드 아이덴티티/send delegate와 payload 계획용: <code>openclaw/plugin-sdk/outbound-media</code> 및 <code>openclaw/plugin-sdk/outbound-runtime</code></li><li><code>openclaw/plugin-sdk/channel-core</code>의 <code>buildThreadAwareOutboundSessionRoute(...)</code> — 아웃바운드 라우트가 명시적 <code>replyToId</code>/<code>threadId</code>를 보존하거나, base session key가 여전히 일치할 때 현재 <code>:thread:</code> session을 복구해야 할 때 사용합니다. 프로바이더 plugin은 플랫폼에 네이티브 스레드 delivery 의미론이 있을 때 우선순위, suffix 동작, thread id 정규화를 override할 수 있습니다.</li><li>스레드 바인딩 수명 주기와 adapter 등록용: <code>openclaw/plugin-sdk/thread-bindings-runtime</code></li><li>레거시 agent/media payload 필드 레이아웃이 여전히 필요한 경우에만: <code>openclaw/plugin-sdk/agent-media-payload</code></li><li>Telegram custom-command 정규화, 중복/충돌 검증, 그리고 fallback-stable command config contract용: <code>openclaw/plugin-sdk/telegram-command-config</code></li></ul><p>Auth 전용 channel은 일반적으로 기본 경로에서 멈출 수 있습니다: 코어가 approval을 처리하고 plugin은 outbound/auth capability만 노출합니다. Matrix, Slack, Telegram, 그리고 커스텀 채팅 transport와 같은 네이티브 approval channel은 자체 approval 수명 주기를 직접 만드는 대신 공유된 네이티브 helper를 사용해야 합니다.</p><h2 id="인바운드-mention-정책" tabindex="-1">인바운드 mention 정책 <a class="header-anchor" href="#인바운드-mention-정책" aria-label="Permalink to &quot;인바운드 mention 정책&quot;">​</a></h2><p>인바운드 mention 처리를 두 레이어로 분리해서 유지하십시오:</p><ul><li>plugin 소유 증거 수집</li><li>공유 정책 평가</li></ul><p>Mention 정책 결정에는 <code>openclaw/plugin-sdk/channel-mention-gating</code>을 사용하십시오. 더 넓은 인바운드 helper 배럴이 필요할 때에만 <code>openclaw/plugin-sdk/channel-inbound</code>를 사용하십시오.</p><p>Plugin 로컬 로직에 적합한 것:</p><ul><li>봇에 대한 답장(reply-to-bot) 감지</li><li>인용된 봇(quoted-bot) 감지</li><li>스레드 참여(thread-participation) 검사</li><li>service/system-message 제외</li><li>봇 참여를 증명하는 데 필요한 플랫폼 네이티브 캐시</li></ul><p>공유 helper에 적합한 것:</p><ul><li><code>requireMention</code></li><li>명시적 mention 결과</li><li>암시적 mention allowlist</li><li>명령어 bypass</li><li>최종 skip 결정</li></ul><p>권장되는 흐름:</p><ol><li>로컬 mention 사실을 계산합니다.</li><li>해당 사실을 <code>resolveInboundMentionDecision({ facts, policy })</code>에 전달합니다.</li><li>인바운드 게이트에서 <code>decision.effectiveWasMentioned</code>, <code>decision.shouldBypassMention</code>, <code>decision.shouldSkip</code>를 사용합니다.</li></ol><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
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
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (decision.shouldSkip) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><p><code>api.runtime.channel.mentions</code>는 이미 runtime 주입에 의존하는 번들 channel plugin을 위해 동일한 공유 mention helper를 노출합니다:</p><ul><li><code>buildMentionRegexes</code></li><li><code>matchesMentionPatterns</code></li><li><code>matchesMentionWithExplicit</code></li><li><code>implicitMentionKindWhen</code></li><li><code>resolveInboundMentionDecision</code></li></ul><p><code>implicitMentionKindWhen</code>과 <code>resolveInboundMentionDecision</code>만 필요하다면, 관련 없는 인바운드 runtime helper를 로드하지 않도록 <code>openclaw/plugin-sdk/channel-mention-gating</code>에서 import하십시오.</p><p>이전의 <code>resolveMentionGating*</code> helper는 <code>openclaw/plugin-sdk/channel-inbound</code>에 호환성 export로만 남아 있습니다. 새 코드는 <code>resolveInboundMentionDecision({ facts, policy })</code>를 사용해야 합니다.</p><h2 id="연습" tabindex="-1">연습 <a class="header-anchor" href="#연습" aria-label="Permalink to &quot;연습&quot;">​</a></h2><p><a id="step-1-package-and-manifest"></a></p><ol><li><strong>Package 및 manifest</strong></li></ol><p>표준 plugin 파일을 만드십시오. <code>package.json</code>의 <code>channel</code> 필드가 이것을 channel plugin으로 만들어 주는 요소입니다. 전체 package-metadata 표면은 <a href="/openclaw-docs-ko/plugins/sdk-setup#openclaw-channel">Plugin Setup 및 Config</a>를 참조하십시오:</p><pre><code>   \`\`\`json package.json
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
   2. **Channel plugin 객체 빌드하기**
</code></pre><p><code>ChannelPlugin</code> 인터페이스에는 많은 선택적 adapter 표면이 있습니다. 최소값인 <code>id</code>와 <code>setup</code>으로 시작하고 필요에 따라 adapter를 추가하십시오.</p><pre><code>   \`src/channel.ts\`를 만드십시오:

   \`\`\`typescript src/channel.ts
   import {
     createChatChannelPlugin,
     createChannelPluginBase,
   } from &quot;openclaw/plugin-sdk/channel-core&quot;;
   import type { OpenClawConfig } from &quot;openclaw/plugin-sdk/channel-core&quot;;
   import { acmeChatApi } from &quot;./client.js&quot;; // your platform API client

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
     const section = (cfg.channels as Record&lt;string, any&gt;)?.[&quot;acme-chat&quot;];
     const token = section?.token;
     if (!token) throw new Error(&quot;acme-chat: token is required&quot;);
     return {
       accountId: accountId ?? null,
       token,
       allowFrom: section?.allowFrom ?? [],
       dmPolicy: section?.dmSecurity,
     };
   }

   export const acmeChatPlugin = createChatChannelPlugin&lt;ResolvedAccount&gt;({
     base: createChannelPluginBase({
       id: &quot;acme-chat&quot;,
       setup: {
         resolveAccount,
         inspectAccount(cfg, accountId) {
           const section =
             (cfg.channels as Record&lt;string, any&gt;)?.[&quot;acme-chat&quot;];
           return {
             enabled: Boolean(section?.token),
             configured: Boolean(section?.token),
             tokenStatus: section?.token ? &quot;available&quot; : &quot;missing&quot;,
           };
         },
       },
     }),

     // DM security: who can message the bot
     security: {
       dm: {
         channelKey: &quot;acme-chat&quot;,
         resolvePolicy: (account) =&gt; account.dmPolicy,
         resolveAllowFrom: (account) =&gt; account.allowFrom,
         defaultPolicy: &quot;allowlist&quot;,
       },
     },

     // Pairing: approval flow for new DM contacts
     pairing: {
       text: {
         idLabel: &quot;Acme Chat username&quot;,
         message: &quot;Send this code to verify your identity:&quot;,
         notify: async ({ target, code }) =&gt; {
           await acmeChatApi.sendDm(target, \`Pairing code: \${code}\`);
         },
       },
     },

     // Threading: how replies are delivered
     threading: { topLevelReplyToMode: &quot;reply&quot; },

     // Outbound: send messages to the platform
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

   ::: details createChatChannelPlugin이 대신 해 주는 일
</code></pre><p>저수준 adapter 인터페이스를 수동으로 구현하는 대신, 선언적 옵션을 전달하면 빌더가 이를 조합해 줍니다:</p><pre><code>     | 옵션 | 배선되는 항목 |
     | --- | --- |
     | \`security.dm\` | config 필드로부터의 scope된 DM security resolver |
     | \`pairing.text\` | 코드 교환이 있는 텍스트 기반 DM pairing 흐름 |
     | \`threading\` | Reply-to-mode resolver (fixed, account-scoped, 또는 custom) |
     | \`outbound.attachedResults\` | 결과 메타데이터(message id)를 반환하는 send 함수 |

     전체 제어가 필요하다면 선언적 옵션 대신 원시(raw) adapter 객체를 전달할 수도
     있습니다.
</code></pre><p>:::</p><ol start="3"><li><strong>Entry point 배선하기</strong></li></ol><p><code>index.ts</code>를 만드십시오:</p><pre><code>   \`\`\`typescript index.ts
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

   Channel 소유의 CLI descriptor는 \`registerCliMetadata(...)\`에 넣어, 전체 channel runtime을
   활성화하지 않고도 OpenClaw가 root help에 표시할 수 있게 하십시오. 일반 full 로드에서는
   여전히 실제 명령 등록을 위해 동일한 descriptor를 가져옵니다. runtime 전용 작업은
   \`registerFull(...)\`에 남겨 두십시오.
   \`registerFull(...)\`이 gateway RPC 메서드를 등록한다면 plugin 전용 접두사를 사용하십시오.
   코어 admin 네임스페이스(\`config.*\`, \`exec.approvals.*\`, \`wizard.*\`, \`update.*\`)는
   예약된 상태로 유지되며 항상 \`operator.admin\`으로 해석됩니다.
   \`defineChannelPluginEntry\`는 등록 모드 분할을 자동으로 처리합니다. 모든 옵션은
   [Entry Points](/plugins/sdk-entrypoints#definechannelpluginentry)를 참조하십시오.
</code></pre><ol start="4"><li><strong>Setup entry 추가하기</strong></li></ol><p>온보딩 중 경량 로딩을 위해 <code>setup-entry.ts</code>를 만드십시오:</p><pre><code>   \`\`\`typescript setup-entry.ts
   import { defineSetupPluginEntry } from &quot;openclaw/plugin-sdk/channel-core&quot;;
   import { acmeChatPlugin } from &quot;./src/channel.js&quot;;

   export default defineSetupPluginEntry(acmeChatPlugin);
   \`\`\`

   Channel이 비활성화되거나 구성되지 않은 경우, OpenClaw는 full entry 대신 이것을 로드합니다.
   Setup 흐름 중 무거운 runtime 코드를 끌어들이는 것을 피합니다.
   자세한 내용은 [Setup 및 Config](/plugins/sdk-setup#setup-entry)를 참조하십시오.

   Setup-safe export를 sidecar 모듈로 분리하는 번들 workspace channel은 명시적 setup-time
   runtime setter도 필요할 때 \`openclaw/plugin-sdk/channel-entry-contract\`의
   \`defineBundledChannelSetupEntry(...)\`를 사용할 수 있습니다.
</code></pre><ol start="5"><li><strong>인바운드 메시지 처리하기</strong></li></ol><p>Plugin은 플랫폼으로부터 메시지를 받아 OpenClaw로 전달해야 합니다. 일반적인 패턴은 요청을 검증하고 channel의 인바운드 handler를 통해 dispatch하는 webhook입니다:</p><pre><code>   \`\`\`typescript
   registerFull(api) {
     api.registerHttpRoute({
       path: &quot;/acme-chat/webhook&quot;,
       auth: &quot;plugin&quot;, // plugin-managed auth (verify signatures yourself)
       handler: async (req, res) =&gt; {
         const event = parseWebhookPayload(req);

         // Your inbound handler dispatches the message to OpenClaw.
         // The exact wiring depends on your platform SDK —
         // see a real example in the bundled Microsoft Teams or Google Chat plugin package.
         await handleAcmeChatInbound(api, event);

         res.statusCode = 200;
         res.end(&quot;ok&quot;);
         return true;
       },
     });
   }
   \`\`\`

   ::: info NOTE
</code></pre><p>인바운드 메시지 처리는 channel마다 다릅니다. 각 channel plugin은 자체 인바운드 pipeline을 소유합니다. 실제 패턴은 번들 channel plugin(예: Microsoft Teams 또는 Google Chat plugin 패키지)을 참조하십시오. :::</p><p><a id="step-6-test"></a> 6. <strong>테스트</strong></p><p><code>src/channel.test.ts</code>에 colocated 테스트를 작성하십시오:</p><pre><code>   \`\`\`typescript src/channel.test.ts
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
   pnpm test -- &lt;bundled-plugin-root&gt;/acme-chat/
   \`\`\`

   공유 테스트 helper는 [Testing](/plugins/sdk-testing)을 참조하십시오.
</code></pre><h2 id="파일-구조" tabindex="-1">파일 구조 <a class="header-anchor" href="#파일-구조" aria-label="Permalink to &quot;파일 구조&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;bundled-plugin-root&gt;/acme-chat/</span></span>
<span class="line"><span>├── package.json              # openclaw.channel metadata</span></span>
<span class="line"><span>├── openclaw.plugin.json      # Manifest with config schema</span></span>
<span class="line"><span>├── index.ts                  # defineChannelPluginEntry</span></span>
<span class="line"><span>├── setup-entry.ts            # defineSetupPluginEntry</span></span>
<span class="line"><span>├── api.ts                    # Public exports (optional)</span></span>
<span class="line"><span>├── runtime-api.ts            # Internal runtime exports (optional)</span></span>
<span class="line"><span>└── src/</span></span>
<span class="line"><span>    ├── channel.ts            # ChannelPlugin via createChatChannelPlugin</span></span>
<span class="line"><span>    ├── channel.test.ts       # Tests</span></span>
<span class="line"><span>    ├── client.ts             # Platform API client</span></span>
<span class="line"><span>    └── runtime.ts            # Runtime store (if needed)</span></span></code></pre></div><h2 id="고급-주제" tabindex="-1">고급 주제 <a class="header-anchor" href="#고급-주제" aria-label="Permalink to &quot;고급 주제&quot;">​</a></h2><blockquote><p><strong>Threading 옵션</strong> Fixed, account-scoped, 또는 custom 답장 모드</p></blockquote><blockquote><p><strong>Message 도구 통합</strong> describeMessageTool 및 action 검색</p></blockquote><blockquote><p><strong>Target 해결</strong> inferTargetChatType, looksLikeId, resolveTarget</p></blockquote><blockquote><p><strong>Runtime helper</strong> api.runtime을 통한 TTS, STT, 미디어, subagent</p></blockquote><div class="info custom-block"><p class="custom-block-title">NOTE</p><p>일부 번들 helper seam은 번들 plugin 유지보수와 호환성을 위해 여전히 존재합니다. 해당 번들 plugin family를 직접 유지보수하고 있는 경우가 아니라면, 새 channel plugin에 권장되는 패턴은 아닙니다. 공통 SDK 표면의 일반 channel/setup/reply/runtime 서브패스를 선호하십시오.</p></div><h2 id="다음-단계" tabindex="-1">다음 단계 <a class="header-anchor" href="#다음-단계" aria-label="Permalink to &quot;다음 단계&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/plugins/sdk-provider-plugins">Provider Plugins</a> — plugin이 모델도 제공하는 경우</li><li><a href="/openclaw-docs-ko/plugins/sdk-overview">SDK 개요</a> — 전체 서브패스 import 레퍼런스</li><li><a href="/openclaw-docs-ko/plugins/sdk-testing">SDK 테스팅</a> — 테스트 유틸리티 및 contract 테스트</li><li><a href="/openclaw-docs-ko/plugins/manifest">Plugin Manifest</a> — 전체 manifest 스키마</li></ul><h2 id="관련-문서" tabindex="-1">관련 문서 <a class="header-anchor" href="#관련-문서" aria-label="Permalink to &quot;관련 문서&quot;">​</a></h2><ul><li><a href="/openclaw-docs-ko/plugins/sdk-setup">Plugin SDK setup</a></li><li><a href="/openclaw-docs-ko/plugins/building-plugins">Plugin 빌드하기</a></li><li><a href="/openclaw-docs-ko/plugins/sdk-agent-harness">Agent harness plugin</a></li></ul>`,77)])])}const g=n(o,[["render",l]]);export{h as __pageData,g as default};
