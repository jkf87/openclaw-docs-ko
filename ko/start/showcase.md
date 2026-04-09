---
title: "쇼케이스"
summary: "OpenClaw를 기반으로 한 커뮤니티 구축 프로젝트 및 통합"
read_when:
  - 실제 OpenClaw 사용 예시를 찾을 때
  - 커뮤니티 프로젝트 하이라이트 업데이트
---

# 쇼케이스

커뮤니티의 실제 프로젝트입니다. 사람들이 OpenClaw로 무엇을 만들고 있는지 확인하십시오.

<Info>
**소개를 원하십니까?** [Discord의 #self-promotion](https://discord.gg/clawd)에서 프로젝트를 공유하거나 [X에서 @openclaw를 태그](https://x.com/openclaw)하십시오.
</Info>

## 🎥 OpenClaw 실제 동작

VelvetShark의 전체 설정 안내 (28분).

<div
  style={{
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: 16,
  }}
>
  <iframe
    src="https://www.youtube-nocookie.com/embed/SaWSPZoPX34"
    title="OpenClaw: The self-hosted AI that Siri should have been (Full setup)"
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    frameBorder="0"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

[YouTube에서 시청](https://www.youtube.com/watch?v=SaWSPZoPX34)

<div
  style={{
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: 16,
  }}
>
  <iframe
    src="https://www.youtube-nocookie.com/embed/mMSKQvlmFuQ"
    title="OpenClaw showcase video"
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    frameBorder="0"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

[YouTube에서 시청](https://www.youtube.com/watch?v=mMSKQvlmFuQ)

<div
  style={{
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: 16,
  }}
>
  <iframe
    src="https://www.youtube-nocookie.com/embed/5kkIJNUGFho"
    title="OpenClaw community showcase"
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    frameBorder="0"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

[YouTube에서 시청](https://www.youtube.com/watch?v=5kkIJNUGFho)

## 🆕 Discord에서 신선한 소식

<CardGroup cols={2}>

<Card title="PR 리뷰 → Telegram 피드백" icon="code-pull-request" href="https://x.com/i/status/2010878524543131691">
  **@bangnokia** • `review` `github` `telegram`

OpenCode가 변경을 완료하면 → PR을 열고 → OpenClaw가 diff를 검토하고 "사소한 제안" 및 명확한 병합 결과 (먼저 적용할 중요 수정 포함)를 Telegram으로 응답합니다.

  <img src="/assets/showcase/pr-review-telegram.jpg" alt="OpenClaw PR review feedback delivered in Telegram" />
</Card>

<Card title="몇 분 만에 와인 셀러 스킬" icon="wine-glass" href="https://x.com/i/status/2010916352454791216">
  **@prades_maxime** • `skills` `local` `csv`

"Robby"(@openclaw)에게 로컬 와인 셀러 스킬을 요청했습니다. CSV 내보내기 샘플과 저장 위치를 요청한 후, 빠르게 스킬을 구축/테스트합니다 (예시에서 962병).

  <img src="/assets/showcase/wine-cellar-skill.jpg" alt="OpenClaw building a local wine cellar skill from CSV" />
</Card>

<Card title="Tesco 쇼핑 자동 조종" icon="cart-shopping" href="https://x.com/i/status/2009724862470689131">
  **@marchattonhere** • `automation` `browser` `shopping`

주간 식단 계획 → 정기 품목 → 배송 슬롯 예약 → 주문 확인. API 없이 브라우저 제어만 사용합니다.

  <img src="/assets/showcase/tesco-shop.jpg" alt="Tesco shop automation via chat" />
</Card>

<Card title="SNAG 스크린샷-마크다운 변환" icon="scissors" href="https://github.com/am-will/snag">
  **@am-will** • `devtools` `screenshots` `markdown`

화면 영역 단축키 → Gemini 비전 → 즉시 클립보드에 마크다운.

  <img src="/assets/showcase/snag.png" alt="SNAG screenshot-to-markdown tool" />
</Card>

<Card title="Agents UI" icon="window-maximize" href="https://releaseflow.net/kitze/agents-ui">
  **@kitze** • `ui` `skills` `sync`

Agents, Claude, Codex 및 OpenClaw에서 스킬/명령을 관리하는 데스크톱 앱.

  <img src="/assets/showcase/agents-ui.jpg" alt="Agents UI app" />
</Card>

<Card title="Telegram 음성 메모 (papla.media)" icon="microphone" href="https://papla.media/docs">
  **커뮤니티** • `voice` `tts` `telegram`

papla.media TTS를 래핑하고 결과를 Telegram 음성 메모로 전송합니다 (성가신 자동 재생 없음).

  <img src="/assets/showcase/papla-tts.jpg" alt="Telegram voice note output from TTS" />
</Card>

<Card title="CodexMonitor" icon="eye" href="https://clawhub.ai/odrobnik/codexmonitor">
  **@odrobnik** • `devtools` `codex` `brew`

로컬 OpenAI Codex 세션을 목록/검사/감시하는 Homebrew 설치 헬퍼 (CLI + VS Code).

  <img src="/assets/showcase/codexmonitor.png" alt="CodexMonitor on ClawHub" />
</Card>

<Card title="Bambu 3D 프린터 제어" icon="print" href="https://clawhub.ai/tobiasbischoff/bambu-cli">
  **@tobiasbischoff** • `hardware` `3d-printing` `skill`

BambuLab 프린터 제어 및 문제 해결: 상태, 작업, 카메라, AMS, 캘리브레이션 등.

  <img src="/assets/showcase/bambu-cli.png" alt="Bambu CLI skill on ClawHub" />
</Card>

<Card title="빈 교통 (Wiener Linien)" icon="train" href="https://clawhub.ai/hjanuschka/wienerlinien">
  **@hjanuschka** • `travel` `transport` `skill`

빈 대중교통의 실시간 출발, 혼잡, 엘리베이터 상태 및 경로 안내.

  <img src="/assets/showcase/wienerlinien.png" alt="Wiener Linien skill on ClawHub" />
</Card>

<Card title="ParentPay 학교 급식" icon="utensils" href="#">
  **@George5562** • `automation` `browser` `parenting`

ParentPay를 통한 영국 학교 급식 자동 예약. 신뢰할 수 있는 테이블 셀 클릭을 위해 마우스 좌표를 사용합니다.
</Card>

<Card title="R2 업로드 (내 파일 보내기)" icon="cloud-arrow-up" href="https://clawhub.ai/skills/r2-upload">
  **@julianengel** • `files` `r2` `presigned-urls`

Cloudflare R2/S3에 업로드하고 보안 사전 서명 다운로드 링크를 생성합니다. 원격 OpenClaw 인스턴스에 적합합니다.
</Card>

<Card title="Telegram을 통한 iOS 앱" icon="mobile" href="#">
  **@coard** • `ios` `xcode` `testflight`

지도와 음성 녹음이 포함된 완전한 iOS 앱을 구축하고 Telegram 채팅만으로 TestFlight에 배포했습니다.

  <img src="/assets/showcase/ios-testflight.jpg" alt="iOS app on TestFlight" />
</Card>

<Card title="Oura 링 건강 어시스턴트" icon="heart-pulse" href="#">
  **@AS** • `health` `oura` `calendar`

Oura 링 데이터를 캘린더, 약속 및 체육관 일정과 통합하는 개인 AI 건강 어시스턴트.

  <img src="/assets/showcase/oura-health.png" alt="Oura ring health assistant" />
</Card>
<Card title="Kev의 드림팀 (14개+ 에이전트)" icon="robot" href="https://github.com/adam91holt/orchestrated-ai-articles">
  **@adam91holt** • `multi-agent` `orchestration` `architecture` `manifesto`

하나의 게이트웨이 하에 14개 이상의 에이전트, Opus 4.5 오케스트레이터가 Codex 워커에게 위임합니다. Dream Team 목록, 모델 선택, 샌드박싱, 웹훅, 하트비트 및 위임 흐름을 다루는 포괄적인 [기술 문서](https://github.com/adam91holt/orchestrated-ai-articles). 에이전트 샌드박싱을 위한 [Clawdspace](https://github.com/adam91holt/clawdspace). [블로그 포스트](https://adams-ai-journey.ghost.io/2026-the-year-of-the-orchestrator/).
</Card>

<Card title="Linear CLI" icon="terminal" href="https://github.com/Finesssee/linear-cli">
  **@NessZerra** • `devtools` `linear` `cli` `issues`

에이전트 워크플로우 (Claude Code, OpenClaw)와 통합되는 Linear용 CLI. 터미널에서 이슈, 프로젝트 및 워크플로우를 관리합니다. 첫 번째 외부 PR 병합!
</Card>

<Card title="Beeper CLI" icon="message" href="https://github.com/blqke/beepcli">
  **@jules** • `messaging` `beeper` `cli` `automation`

Beeper Desktop을 통해 메시지를 읽고, 보내고, 보관합니다. Beeper 로컬 MCP API를 사용하여 에이전트가 한 곳에서 모든 채팅 (iMessage, WhatsApp 등)을 관리할 수 있습니다.
</Card>

</CardGroup>

## 🤖 자동화 및 워크플로우

<CardGroup cols={2}>

<Card title="Winix 공기청정기 제어" icon="wind" href="https://x.com/antonplex/status/2010518442471006253">
  **@antonplex** • `automation` `hardware` `air-quality`

Claude Code가 공기청정기 제어를 발견하고 확인한 후, OpenClaw가 인계받아 실내 공기질을 관리합니다.

  <img src="/assets/showcase/winix-air-purifier.jpg" alt="Winix air purifier control via OpenClaw" />
</Card>

<Card title="아름다운 하늘 카메라 촬영" icon="camera" href="https://x.com/signalgaining/status/2010523120604746151">
  **@signalgaining** • `automation` `camera` `skill` `images`

옥상 카메라에 의해 트리거: 하늘이 아름다워 보일 때마다 OpenClaw에게 하늘 사진을 찍도록 요청 — 스킬을 설계하고 사진을 찍었습니다.

  <img src="/assets/showcase/roof-camera-sky.jpg" alt="Roof camera sky snapshot captured by OpenClaw" />
</Card>

<Card title="시각적 아침 브리핑 장면" icon="robot" href="https://x.com/buddyhadry/status/2010005331925954739">
  **@buddyhadry** • `automation` `briefing` `images` `telegram`

예약된 프롬프트가 매일 아침 OpenClaw 페르소나를 통해 단일 "장면" 이미지를 생성합니다 (날씨, 작업, 날짜, 좋아하는 게시물/인용).
</Card>

<Card title="패델 코트 예약" icon="calendar-check" href="https://github.com/joshp123/padel-cli">
  **@joshp123** • `automation` `booking` `cli`
  
  Playtomic 가용성 확인 + 예약 CLI. 더 이상 빈 코트를 놓치지 마십시오.
  
  <img src="/assets/showcase/padel-screenshot.jpg" alt="padel-cli screenshot" />
</Card>

<Card title="회계 접수" icon="file-invoice-dollar">
  **커뮤니티** • `automation` `email` `pdf`
  
  이메일에서 PDF를 수집하고 세금 컨설턴트를 위한 문서를 준비합니다. 월간 회계를 자동 조종으로.
</Card>

<Card title="카우치 포테이토 개발 모드" icon="couch" href="https://davekiss.com">
  **@davekiss** • `telegram` `website` `migration` `astro`

Netflix 시청 중 Telegram으로 전체 개인 사이트를 재구축 — Notion → Astro, 18개 게시물 마이그레이션, Cloudflare로 DNS. 노트북을 열지 않았습니다.
</Card>

<Card title="구직 에이전트" icon="briefcase">
  **@attol8** • `automation` `api` `skill`

구직 목록을 검색하고 CV 키워드와 매칭하여 링크와 함께 관련 기회를 반환합니다. JSearch API를 사용하여 30분 만에 구축했습니다.
</Card>

<Card title="Jira 스킬 빌더" icon="diagram-project" href="https://x.com/jdrhyne/status/2008336434827002232">
  **@jdrhyne** • `automation` `jira` `skill` `devtools`

OpenClaw가 Jira에 연결된 후 즉석에서 새 스킬을 생성했습니다 (ClawHub에 존재하기 전).
</Card>

<Card title="Telegram을 통한 Todoist 스킬" icon="list-check" href="https://x.com/iamsubhrajyoti/status/2009949389884920153">
  **@iamsubhrajyoti** • `automation` `todoist` `skill` `telegram`

Todoist 작업을 자동화하고 OpenClaw가 Telegram 채팅에서 스킬을 직접 생성하도록 했습니다.
</Card>

<Card title="TradingView 분석" icon="chart-line">
  **@bheem1798** • `finance` `browser` `automation`

브라우저 자동화를 통해 TradingView에 로그인하고, 차트를 스크린샷하고, 요청에 따라 기술적 분석을 수행합니다. API 불필요 — 브라우저 제어만 사용합니다.
</Card>

<Card title="Slack 자동 지원" icon="slack">
  **@henrymascot** • `slack` `automation` `support`

회사 Slack 채널을 감시하고, 도움이 되는 응답을 하며, Telegram으로 알림을 전달합니다. 요청 없이 자율적으로 배포된 앱의 프로덕션 버그를 수정했습니다.
</Card>

</CardGroup>

## 🧠 지식 및 메모리

<CardGroup cols={2}>

<Card title="xuezh 중국어 학습" icon="language" href="https://github.com/joshp123/xuezh">
  **@joshp123** • `learning` `voice` `skill`
  
  OpenClaw를 통한 발음 피드백 및 학습 흐름이 있는 중국어 학습 엔진.
  
  <img src="/assets/showcase/xuezh-pronunciation.jpeg" alt="xuezh pronunciation feedback" />
</Card>

<Card title="WhatsApp 메모리 볼트" icon="vault">
  **커뮤니티** • `memory` `transcription` `indexing`
  
  전체 WhatsApp 내보내기를 가져오고, 1k개 이상의 음성 메모를 전사하고, git 로그와 교차 확인하고, 연결된 마크다운 보고서를 출력합니다.
</Card>

<Card title="Karakeep 시맨틱 검색" icon="magnifying-glass" href="https://github.com/jamesbrooksco/karakeep-semantic-search">
  **@jamesbrooksco** • `search` `vector` `bookmarks`
  
  Qdrant + OpenAI/Ollama 임베딩을 사용하여 Karakeep 북마크에 벡터 검색을 추가합니다.
</Card>

<Card title="Inside-Out-2 메모리" icon="brain">
  **커뮤니티** • `memory` `beliefs` `self-model`
  
  세션 파일을 메모리 → 믿음 → 진화하는 자기 모델로 변환하는 별도의 메모리 관리자.
</Card>

</CardGroup>

## 🎙️ 음성 및 전화

<CardGroup cols={2}>

<Card title="Clawdia 전화 브리지" icon="phone" href="https://github.com/alejandroOPI/clawdia-bridge">
  **@alejandroOPI** • `voice` `vapi` `bridge`
  
  Vapi 음성 어시스턴트 ↔ OpenClaw HTTP 브리지. 에이전트와 거의 실시간 전화 통화.
</Card>

<Card title="OpenRouter 전사" icon="microphone" href="https://clawhub.ai/obviyus/openrouter-transcribe">
  **@obviyus** • `transcription` `multilingual` `skill`

OpenRouter (Gemini 등)를 통한 다국어 오디오 전사. ClawHub에서 이용 가능.
</Card>

</CardGroup>

## 🏗️ 인프라 및 배포

<CardGroup cols={2}>

<Card title="Home Assistant 애드온" icon="home" href="https://github.com/ngutman/openclaw-ha-addon">
  **@ngutman** • `homeassistant` `docker` `raspberry-pi`
  
  SSH 터널 지원 및 영구 상태를 갖춘 Home Assistant OS에서 실행되는 OpenClaw 게이트웨이.
</Card>

<Card title="Home Assistant 스킬" icon="toggle-on" href="https://clawhub.ai/skills/homeassistant">
  **ClawHub** • `homeassistant` `skill` `automation`
  
  자연어를 통해 Home Assistant 디바이스를 제어하고 자동화합니다.
</Card>

<Card title="Nix 패키징" icon="snowflake" href="https://github.com/openclaw/nix-openclaw">
  **@openclaw** • `nix` `packaging` `deployment`
  
  재현 가능한 배포를 위한 배터리 포함 nixified OpenClaw 구성.
</Card>

<Card title="CalDAV 캘린더" icon="calendar" href="https://clawhub.ai/skills/caldav-calendar">
  **ClawHub** • `calendar` `caldav` `skill`
  
  khal/vdirsyncer를 사용하는 캘린더 스킬. 셀프 호스팅 캘린더 통합.
</Card>

</CardGroup>

## 🏠 홈 및 하드웨어

<CardGroup cols={2}>

<Card title="GoHome 자동화" icon="house-signal" href="https://github.com/joshp123/gohome">
  **@joshp123** • `home` `nix` `grafana`
  
  OpenClaw를 인터페이스로 사용하는 Nix 네이티브 홈 자동화, 아름다운 Grafana 대시보드 포함.
  
  <img src="/assets/showcase/gohome-grafana.png" alt="GoHome Grafana dashboard" />
</Card>

<Card title="Roborock 청소기" icon="robot" href="https://github.com/joshp123/gohome/tree/main/plugins/roborock">
  **@joshp123** • `vacuum` `iot` `plugin`
  
  자연스러운 대화를 통해 Roborock 로봇 청소기를 제어합니다.
  
  <img src="/assets/showcase/roborock-screenshot.jpg" alt="Roborock status" />
</Card>

</CardGroup>

## 🌟 커뮤니티 프로젝트

<CardGroup cols={2}>

<Card title="StarSwap 마켓플레이스" icon="star" href="https://star-swap.com/">
  **커뮤니티** • `marketplace` `astronomy` `webapp`
  
  전체 천문 장비 마켓플레이스. OpenClaw 생태계와 함께/주변에 구축.
</Card>

</CardGroup>

---

## 프로젝트 제출

공유할 것이 있으십니까? 소개해 드리겠습니다!

<Steps>
  <Step title="공유하기">
    [Discord의 #self-promotion](https://discord.gg/clawd)에 게시하거나 [@openclaw 트윗](https://x.com/openclaw)하십시오
  </Step>
  <Step title="세부 정보 포함">
    기능, 저장소/데모 링크, 스크린샷이 있으면 공유하십시오
  </Step>
  <Step title="소개 받기">
    뛰어난 프로젝트를 이 페이지에 추가하겠습니다
  </Step>
</Steps>
