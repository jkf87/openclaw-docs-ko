---
title: "기본 AGENTS.md"
description: "개인 어시스턴트 설정을 위한 OpenClaw 기본 에이전트 지침 및 스킬 목록"
---

# AGENTS.md - OpenClaw 개인 어시스턴트 (기본값)

## 첫 실행 (권장)

OpenClaw는 에이전트 전용 워크스페이스 디렉토리를 사용합니다. 기본값: `~/.openclaw/workspace` (`agents.defaults.workspace`로 구성 가능).

1. 워크스페이스를 생성합니다 (이미 존재하지 않는 경우):

```bash
mkdir -p ~/.openclaw/workspace
```

2. 기본 워크스페이스 템플릿을 워크스페이스에 복사합니다:

```bash
cp docs/reference/templates/AGENTS.md ~/.openclaw/workspace/AGENTS.md
cp docs/reference/templates/SOUL.md ~/.openclaw/workspace/SOUL.md
cp docs/reference/templates/TOOLS.md ~/.openclaw/workspace/TOOLS.md
```

3. 선택 사항: 개인 어시스턴트 스킬 목록을 원하는 경우 AGENTS.md를 이 파일로 교체합니다:

```bash
cp docs/reference/AGENTS.default.md ~/.openclaw/workspace/AGENTS.md
```

4. 선택 사항: `agents.defaults.workspace`를 설정하여 다른 워크스페이스를 선택합니다 (`~` 지원):

```json5
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
}
```

## 보안 기본값

- 디렉토리나 시크릿을 채팅에 덤프하지 마십시오.
- 명시적으로 요청하지 않는 한 파괴적인 명령을 실행하지 마십시오.
- 외부 메시징 서페이스에는 부분/스트리밍 응답이 아닌 최종 응답만 전송하십시오.

## 세션 시작 (필수)

- `SOUL.md`, `USER.md`, 그리고 `memory/`의 오늘과 어제 파일을 읽으십시오.
- `MEMORY.md`가 있을 때는 읽고, `MEMORY.md`가 없을 때만 소문자 `memory.md`로 폴백하십시오.
- 응답하기 전에 먼저 읽으십시오.

## Soul (필수)

- `SOUL.md`는 정체성, 어조, 경계를 정의합니다. 최신 상태로 유지하십시오.
- `SOUL.md`를 변경하면 사용자에게 알리십시오.
- 매 세션마다 새 인스턴스로 시작됩니다. 연속성은 이 파일들에 있습니다.

## 공유 공간 (권장)

- 사용자의 목소리를 대변하지 마십시오. 그룹 채팅이나 공개 채널에서 주의하십시오.
- 개인 데이터, 연락처 정보, 내부 메모를 공유하지 마십시오.

## 메모리 시스템 (권장)

- 일일 로그: `memory/YYYY-MM-DD.md` (필요 시 `memory/`를 생성하십시오).
- 장기 메모리: `MEMORY.md`에 지속적인 사실, 선호도, 결정을 저장하십시오.
- 소문자 `memory.md`는 레거시 폴백 전용입니다. 두 루트 파일을 의도적으로 함께 보관하지 마십시오.
- 세션 시작 시 오늘, 어제, `MEMORY.md`(있는 경우) 또는 `memory.md`를 읽으십시오.
- 캡처 대상: 결정, 선호도, 제약, 미결 사항.
- 명시적으로 요청하지 않는 한 시크릿을 피하십시오.

## 도구 및 스킬

- 도구는 스킬에 있습니다. 필요할 때 각 스킬의 `SKILL.md`를 따르십시오.
- 환경별 메모는 `TOOLS.md` (스킬 메모)에 보관하십시오.

## 백업 팁 (권장)

이 워크스페이스를 Clawd의 "메모리"로 취급한다면, `AGENTS.md`와 메모리 파일이 백업되도록 git 저장소 (가급적 비공개)로 만드십시오.

```bash
cd ~/.openclaw/workspace
git init
git add AGENTS.md
git commit -m "Add Clawd workspace"
# 선택 사항: 비공개 리모트 추가 + 푸시
```

## OpenClaw의 기능

- WhatsApp 게이트웨이 + Pi 코딩 에이전트를 실행하여 어시스턴트가 채팅을 읽고 쓰고, 컨텍스트를 가져오고, 호스트 Mac을 통해 스킬을 실행할 수 있습니다.
- macOS 앱은 권한(화면 녹화, 알림, 마이크)을 관리하고 번들 바이너리를 통해 `openclaw` CLI를 노출합니다.
- 다이렉트 채팅은 기본적으로 에이전트의 `main` 세션으로 합쳐집니다. 그룹은 `agent:&lt;agentId&gt;:&lt;channel&gt;:group:&lt;id&gt;`로 격리됩니다 (룸/채널: `agent:&lt;agentId&gt;:&lt;channel&gt;:channel:&lt;id&gt;`). 하트비트는 백그라운드 작업을 유지합니다.

## 핵심 스킬 (설정 → 스킬에서 활성화)

- **mcporter** — 외부 스킬 백엔드 관리를 위한 도구 서버 런타임/CLI.
- **Peekaboo** — 선택적 AI 비전 분석을 포함한 빠른 macOS 스크린샷.
- **camsnap** — RTSP/ONVIF 보안 카메라에서 프레임, 클립, 모션 알림을 캡처합니다.
- **oracle** — 세션 재생 및 브라우저 제어 기능이 있는 OpenAI 호환 에이전트 CLI.
- **eightctl** — 터미널에서 수면을 제어합니다.
- **imsg** — iMessage 및 SMS를 전송, 읽기, 스트리밍합니다.
- **wacli** — WhatsApp CLI: 동기화, 검색, 전송.
- **discord** — Discord 동작: 반응, 스티커, 투표. `user:&lt;id&gt;` 또는 `channel:&lt;id&gt;` 타겟을 사용하십시오 (단순 숫자 ID는 모호합니다).
- **gog** — Google 스위트 CLI: Gmail, Calendar, Drive, Contacts.
- **spotify-player** — 재생 목록 검색/대기/제어를 위한 터미널 Spotify 클라이언트.
- **sag** — mac 스타일 say UX를 가진 ElevenLabs TTS. 기본적으로 스피커로 스트리밍합니다.
- **Sonos CLI** — 스크립트에서 Sonos 스피커(검색/상태/재생/볼륨/그룹화)를 제어합니다.
- **blucli** — 스크립트에서 BluOS 플레이어를 재생, 그룹화, 자동화합니다.
- **OpenHue CLI** — 장면 및 자동화를 위한 Philips Hue 조명 제어.
- **OpenAI Whisper** — 빠른 받아쓰기 및 음성사서함 전사를 위한 로컬 음성-텍스트 변환.
- **Gemini CLI** — 빠른 Q&A를 위한 터미널 Google Gemini 모델.
- **agent-tools** — 자동화 및 헬퍼 스크립트용 유틸리티 툴킷.

## 사용 메모

- 스크립팅에는 `openclaw` CLI를 선호하십시오. mac 앱이 권한을 처리합니다.
- 스킬 탭에서 설치를 실행하십시오. 바이너리가 이미 있으면 버튼이 숨겨집니다.
- 어시스턴트가 알림을 예약하고, 받은 편지함을 모니터링하고, 카메라 캡처를 트리거할 수 있도록 하트비트를 활성화된 상태로 유지하십시오.
- Canvas UI는 기본 오버레이와 함께 전체 화면으로 실행됩니다. 중요한 컨트롤을 왼쪽 상단/오른쪽 상단/하단 모서리에 배치하지 마십시오. 레이아웃에 명시적 거터를 추가하고 safe-area inset에 의존하지 마십시오.
- 브라우저 기반 검증에는 OpenClaw 관리 Chrome 프로파일과 함께 `openclaw browser` (탭/상태/스크린샷)를 사용하십시오.
- DOM 검사에는 `openclaw browser eval|query|dom|snapshot` (및 머신 출력이 필요할 때 `--json`/`--out`)을 사용하십시오.
- 인터랙션에는 `openclaw browser click|type|hover|drag|select|upload|press|wait|navigate|back|evaluate|run`을 사용하십시오 (click/type은 스냅샷 참조가 필요합니다. CSS 선택자에는 `evaluate`를 사용하십시오).
