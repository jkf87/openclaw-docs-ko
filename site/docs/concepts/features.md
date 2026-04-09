---
title: "기능"
description: "채널, 라우팅, 미디어, UX에 걸친 OpenClaw 기능."
---

# 기능

## 하이라이트

> **채널**
> 단일 게이트웨이로 Discord, iMessage, Signal, Slack, Telegram, WhatsApp, WebChat 등을 지원합니다.


  > **플러그인**
> 번들 플러그인은 일반 현재 릴리스에서 별도 설치 없이 Matrix, Nextcloud Talk, Nostr, Twitch, Zalo 등을 추가합니다.


  > **라우팅**
> 격리된 세션이 있는 멀티 에이전트 라우팅.


  > **미디어**
> 이미지, 오디오, 비디오, 문서, 이미지/비디오 생성.


  > **앱 및 UI**
> 웹 제어 UI 및 macOS 컴패니언 앱.


  > **모바일 노드**
> 페어링, 음성/채팅, 풍부한 장치 명령을 갖춘 iOS 및 Android 노드.


## 전체 목록

**채널:**

- 내장 채널: Discord, Google Chat, iMessage (레거시), IRC, Signal, Slack, Telegram, WebChat, WhatsApp
- 번들 플러그인 채널: iMessage용 BlueBubbles, Feishu, LINE, Matrix, Mattermost, Microsoft Teams, Nextcloud Talk, Nostr, QQ Bot, Synology Chat, Tlon, Twitch, Zalo, Zalo Personal
- 선택적 별도 설치 채널 플러그인: Voice Call 및 WeChat 같은 서드파티 패키지
- 서드파티 채널 플러그인으로 게이트웨이를 추가로 확장할 수 있습니다. 예: WeChat
- 멘션 기반 활성화를 통한 그룹 채팅 지원
- 허용 목록 및 페어링을 통한 DM 보안

**에이전트:**

- 도구 스트리밍이 있는 임베디드 에이전트 런타임
- 워크스페이스 또는 발신자별 격리된 세션이 있는 멀티 에이전트 라우팅
- 세션: 직접 채팅은 공유 `main`으로 통합; 그룹은 격리됨
- 긴 응답을 위한 스트리밍 및 청킹

**인증 및 프로바이더:**

- 35개 이상의 모델 프로바이더 (Anthropic, OpenAI, Google 등)
- OAuth를 통한 구독 인증 (예: OpenAI Codex)
- 사용자 지정 및 자체 호스팅 프로바이더 지원 (vLLM, SGLang, Ollama, 및 모든 OpenAI 호환 또는 Anthropic 호환 엔드포인트)

**미디어:**

- 이미지, 오디오, 비디오, 문서 입출력
- 공유 이미지 생성 및 비디오 생성 기능 서피스
- 음성 메모 변환
- 여러 프로바이더를 통한 텍스트 음성 변환

**앱 및 인터페이스:**

- WebChat 및 브라우저 제어 UI
- macOS 메뉴 바 컴패니언 앱
- 페어링, Canvas, 카메라, 화면 녹화, 위치, 음성이 있는 iOS 노드
- 페어링, 채팅, 음성, Canvas, 카메라, 장치 명령이 있는 Android 노드

**도구 및 자동화:**

- 브라우저 자동화, exec, 샌드박싱
- 웹 검색 (Brave, DuckDuckGo, Exa, Firecrawl, Gemini, Grok, Kimi, MiniMax Search, Ollama Web Search, Perplexity, SearXNG, Tavily)
- 크론 잡 및 하트비트 스케줄링
- 스킬, 플러그인, 워크플로우 파이프라인 (Lobster)
