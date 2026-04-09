---
summary: "모든 OpenClaw 문서로 연결되는 허브"
read_when:
  - 전체 문서 지도를 원할 때
title: "문서 허브"
---

# 문서 허브

<Note>
OpenClaw를 처음 사용하신다면 [시작하기](/start/getting-started)부터 시작하십시오.
</Note>

이 허브를 통해 왼쪽 내비게이션에 표시되지 않는 심층 분석 및 참조 문서를 포함한 모든 페이지를 탐색하십시오.

## 시작하기

- [색인](/)
- [시작하기](/start/getting-started)
- [온보딩](/start/onboarding)
- [온보딩 (CLI)](/start/wizard)
- [설정](/start/setup)
- [대시보드 (로컬 Gateway)](http://127.0.0.1:18789/)
- [도움말](/help/)
- [문서 디렉토리](/start/docs-directory)
- [구성](/gateway/configuration)
- [구성 예시](/gateway/configuration-examples)
- [OpenClaw 어시스턴트](/start/openclaw)
- [쇼케이스](/start/showcase)
- [로어](/start/lore)

## 설치 + 업데이트

- [Docker](/install/docker)
- [Nix](/install/nix)
- [업데이트 / 롤백](/install/updating)
- [Bun 워크플로우 (실험적)](/install/bun)

## 핵심 개념

- [아키텍처](/concepts/architecture)
- [기능](/concepts/features)
- [네트워크 허브](/network)
- [에이전트 런타임](/concepts/agent)
- [에이전트 워크스페이스](/concepts/agent-workspace)
- [메모리](/concepts/memory)
- [에이전트 루프](/concepts/agent-loop)
- [스트리밍 + 청킹](/concepts/streaming)
- [멀티 에이전트 라우팅](/concepts/multi-agent)
- [컴팩션](/concepts/compaction)
- [세션](/concepts/session)
- [세션 정리](/concepts/session-pruning)
- [세션 도구](/concepts/session-tool)
- [큐](/concepts/queue)
- [슬래시 명령](/tools/slash-commands)
- [RPC 어댑터](/reference/rpc)
- [TypeBox 스키마](/concepts/typebox)
- [시간대 처리](/concepts/timezone)
- [프레즌스](/concepts/presence)
- [디스커버리 + 트랜스포트](/gateway/discovery)
- [Bonjour](/gateway/bonjour)
- [채널 라우팅](/channels/channel-routing)
- [그룹](/channels/groups)
- [그룹 메시지](/channels/group-messages)
- [모델 페일오버](/concepts/model-failover)
- [OAuth](/concepts/oauth)

## 프로바이더 + 인그레스

- [채팅 채널 허브](/channels/)
- [모델 프로바이더 허브](/providers/models)
- [WhatsApp](/channels/whatsapp)
- [Telegram](/channels/telegram)
- [Slack](/channels/slack)
- [Discord](/channels/discord)
- [Mattermost](/channels/mattermost)
- [Signal](/channels/signal)
- [BlueBubbles (iMessage)](/channels/bluebubbles)
- [QQ Bot](/channels/qqbot)
- [iMessage (레거시)](/channels/imessage)
- [위치 파싱](/channels/location)
- [WebChat](/web/webchat)
- [웹훅](/automation/cron-jobs#webhooks)
- [Gmail Pub/Sub](/automation/cron-jobs#gmail-pubsub-integration)

## Gateway + 운영

- [게이트웨이 런북](/gateway/)
- [네트워크 모델](/gateway/network-model)
- [게이트웨이 페어링](/gateway/pairing)
- [게이트웨이 잠금](/gateway/gateway-lock)
- [백그라운드 프로세스](/gateway/background-process)
- [헬스](/gateway/health)
- [하트비트](/gateway/heartbeat)
- [닥터](/gateway/doctor)
- [로깅](/gateway/logging)
- [샌드박싱](/gateway/sandboxing)
- [대시보드](/web/dashboard)
- [Control UI](/web/control-ui)
- [원격 접근](/gateway/remote)
- [원격 게이트웨이 README](/gateway/remote-gateway-readme)
- [Tailscale](/gateway/tailscale)
- [보안](/gateway/security/)
- [문제 해결](/gateway/troubleshooting)

## 도구 + 자동화

- [도구 표면](/tools/)
- [OpenProse](/prose)
- [CLI 참조](/cli/)
- [Exec 도구](/tools/exec)
- [PDF 도구](/tools/pdf)
- [상승 모드](/tools/elevated)
- [크론 작업](/automation/cron-jobs)
- [자동화 및 작업](/automation/)
- [Thinking + 상세](/tools/thinking)
- [모델](/concepts/models)
- [서브 에이전트](/tools/subagents)
- [에이전트 전송 CLI](/tools/agent-send)
- [터미널 UI](/web/tui)
- [브라우저 제어](/tools/browser)
- [브라우저 (Linux 문제 해결)](/tools/browser-linux-troubleshooting)
- [폴](/cli/message)

## 노드, 미디어, 음성

- [노드 개요](/nodes/)
- [카메라](/nodes/camera)
- [이미지](/nodes/images)
- [오디오](/nodes/audio)
- [위치 명령](/nodes/location-command)
- [음성 웨이크](/nodes/voicewake)
- [토크 모드](/nodes/talk)

## 플랫폼

- [플랫폼 개요](/platforms/)
- [macOS](/platforms/macos)
- [iOS](/platforms/ios)
- [Android](/platforms/android)
- [Windows (WSL2)](/platforms/windows)
- [Linux](/platforms/linux)
- [웹 표면](/web/)

## macOS 컴패니언 앱 (고급)

- [macOS 개발 설정](/platforms/mac/dev-setup)
- [macOS 메뉴 바](/platforms/mac/menu-bar)
- [macOS 음성 웨이크](/platforms/mac/voicewake)
- [macOS 음성 오버레이](/platforms/mac/voice-overlay)
- [macOS WebChat](/platforms/mac/webchat)
- [macOS Canvas](/platforms/mac/canvas)
- [macOS 자식 프로세스](/platforms/mac/child-process)
- [macOS 헬스](/platforms/mac/health)
- [macOS 아이콘](/platforms/mac/icon)
- [macOS 로깅](/platforms/mac/logging)
- [macOS 권한](/platforms/mac/permissions)
- [macOS 원격](/platforms/mac/remote)
- [macOS 서명](/platforms/mac/signing)
- [macOS 게이트웨이 (launchd)](/platforms/mac/bundled-gateway)
- [macOS XPC](/platforms/mac/xpc)
- [macOS 스킬](/platforms/mac/skills)
- [macOS Peekaboo](/platforms/mac/peekaboo)

## 확장 + 플러그인

- [플러그인 개요](/tools/plugin)
- [플러그인 빌드](/plugins/building-plugins)
- [플러그인 매니페스트](/plugins/manifest)
- [에이전트 도구](/plugins/building-plugins#registering-agent-tools)
- [플러그인 번들](/plugins/bundles)
- [커뮤니티 플러그인](/plugins/community)
- [기능 쿡북](/tools/capability-cookbook)
- [음성 통화 플러그인](/plugins/voice-call)
- [Zalo 사용자 플러그인](/plugins/zalouser)

## 워크스페이스 + 템플릿

- [스킬](/tools/skills)
- [ClawHub](/tools/clawhub)
- [스킬 구성](/tools/skills-config)
- [기본 AGENTS](/reference/AGENTS.default)
- [템플릿: AGENTS](/reference/templates/AGENTS)
- [템플릿: BOOTSTRAP](/reference/templates/BOOTSTRAP)
- [템플릿: HEARTBEAT](/reference/templates/HEARTBEAT)
- [템플릿: IDENTITY](/reference/templates/IDENTITY)
- [템플릿: SOUL](/reference/templates/SOUL)
- [템플릿: TOOLS](/reference/templates/TOOLS)
- [템플릿: USER](/reference/templates/USER)

## 프로젝트

- [크레딧](/reference/credits)

## 테스트 + 릴리스

- [테스트](/reference/test)
- [릴리스 정책](/reference/RELEASING)
- [디바이스 모델](/reference/device-models)
