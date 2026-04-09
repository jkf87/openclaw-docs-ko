---
summary: "터미널 UI (TUI): 모든 머신에서 게이트웨이에 연결"
read_when:
  - You want a beginner-friendly walkthrough of the TUI
  - You need the complete list of TUI features, commands, and shortcuts
title: "TUI"
---

# TUI (터미널 UI)

## 빠른 시작

1. 게이트웨이를 시작하십시오.

```bash
openclaw gateway
```

2. TUI를 여십시오.

```bash
openclaw tui
```

3. 메시지를 입력하고 Enter를 누르십시오.

원격 게이트웨이:

```bash
openclaw tui --url ws://<host>:<port> --token <gateway-token>
```

게이트웨이가 비밀번호 인증을 사용하는 경우 `--password`를 사용하십시오.

## 화면 구성

- 헤더: 연결 URL, 현재 에이전트, 현재 세션.
- 채팅 로그: 사용자 메시지, 어시스턴트 응답, 시스템 알림, 도구 카드.
- 상태 표시줄: 연결/실행 상태 (연결 중, 실행 중, 스트리밍, 대기 중, 오류).
- 푸터: 연결 상태 + 에이전트 + 세션 + 모델 + 생각/빠른/상세/추론 + 토큰 수 + 전달.
- 입력: 자동 완성이 있는 텍스트 편집기.

## 개념적 모델: 에이전트 + 세션

- 에이전트는 고유한 슬러그입니다 (예: `main`, `research`). 게이트웨이가 목록을 노출합니다.
- 세션은 현재 에이전트에 속합니다.
- 세션 키는 `agent:<agentId>:<sessionKey>`로 저장됩니다.
  - `/session main`을 입력하면 TUI가 `agent:<currentAgent>:main`으로 확장합니다.
  - `/session agent:other:main`을 입력하면 해당 에이전트 세션으로 명시적으로 전환합니다.
- 세션 범위:
  - `per-sender` (기본값): 각 에이전트에 많은 세션이 있습니다.
  - `global`: TUI가 항상 `global` 세션을 사용합니다 (선택기가 비어 있을 수 있음).
- 현재 에이전트 + 세션은 항상 푸터에 표시됩니다.

## 전송 + 전달

- 메시지는 게이트웨이로 전송됩니다. 프로바이더에 대한 전달은 기본적으로 꺼져 있습니다.
- 전달 켜기:
  - `/deliver on`
  - 또는 설정 패널
  - 또는 `openclaw tui --deliver`로 시작

## 선택기 + 오버레이

- 모델 선택기: 사용 가능한 모델을 나열하고 세션 재정의를 설정합니다.
- 에이전트 선택기: 다른 에이전트를 선택합니다.
- 세션 선택기: 현재 에이전트의 세션만 표시합니다.
- 설정: 전달, 도구 출력 확장 및 생각 가시성을 토글합니다.

## 키보드 단축키

- Enter: 메시지 전송
- Esc: 활성 실행 중단
- Ctrl+C: 입력 지우기 (두 번 누르면 종료)
- Ctrl+D: 종료
- Ctrl+L: 모델 선택기
- Ctrl+G: 에이전트 선택기
- Ctrl+P: 세션 선택기
- Ctrl+O: 도구 출력 확장 토글
- Ctrl+T: 생각 가시성 토글 (히스토리 다시 로드)

## 슬래시 명령

핵심:

- `/help`
- `/status`
- `/agent <id>` (또는 `/agents`)
- `/session <key>` (또는 `/sessions`)
- `/model <provider/model>` (또는 `/models`)

세션 제어:

- `/think <off|minimal|low|medium|high>`
- `/fast <status|on|off>`
- `/verbose <on|full|off>`
- `/reasoning <on|off|stream>`
- `/usage <off|tokens|full>`
- `/elevated <on|off|ask|full>` (별칭: `/elev`)
- `/activation <mention|always>`
- `/deliver <on|off>`

세션 수명 주기:

- `/new` 또는 `/reset` (세션 초기화)
- `/abort` (활성 실행 중단)
- `/settings`
- `/exit`

다른 게이트웨이 슬래시 명령 (예: `/context`)은 게이트웨이로 전달되어 시스템 출력으로 표시됩니다. [슬래시 명령](/tools/slash-commands)을 참조하십시오.

## 로컬 셸 명령

- 라인 앞에 `!`를 붙여 TUI 호스트에서 로컬 셸 명령을 실행합니다.
- TUI는 세션당 한 번 로컬 실행을 허용하라는 메시지를 표시합니다. 거부하면 세션에 대해 `!`가 비활성화된 상태로 유지됩니다.
- 명령은 TUI 작업 디렉토리의 새로운 비대화형 셸에서 실행됩니다 (영구적인 `cd`/env 없음).
- 로컬 셸 명령은 환경에서 `OPENCLAW_SHELL=tui-local`을 받습니다.
- 단독 `!`는 일반 메시지로 전송됩니다. 앞의 공백은 로컬 exec를 트리거하지 않습니다.

## 도구 출력

- 도구 호출은 인수 + 결과가 있는 카드로 표시됩니다.
- Ctrl+O로 축소/확장 보기 간 전환합니다.
- 도구가 실행되는 동안 부분 업데이트가 동일한 카드로 스트리밍됩니다.

## 터미널 색상

- TUI는 어시스턴트 본문 텍스트를 터미널의 기본 전경색으로 유지하여 어두운 터미널과 밝은 터미널 모두 읽기 쉽게 합니다.
- 터미널이 밝은 배경을 사용하고 자동 감지가 잘못된 경우 `openclaw tui`를 시작하기 전에 `OPENCLAW_THEME=light`를 설정하십시오.
- 대신 원래의 어두운 팔레트를 강제하려면 `OPENCLAW_THEME=dark`를 설정하십시오.

## 히스토리 + 스트리밍

- 연결 시 TUI는 최신 히스토리를 로드합니다 (기본 200개 메시지).
- 스트리밍 응답은 최종화될 때까지 제자리에서 업데이트됩니다.
- TUI는 더 풍부한 도구 카드를 위해 에이전트 도구 이벤트도 수신합니다.

## 연결 세부 정보

- TUI는 `mode: "tui"`로 게이트웨이에 등록합니다.
- 재연결은 시스템 메시지를 표시합니다. 이벤트 간격이 로그에 표시됩니다.

## 옵션

- `--url <url>`: 게이트웨이 WebSocket URL (구성 또는 `ws://127.0.0.1:<port>`가 기본값)
- `--token <token>`: 게이트웨이 토큰 (필요한 경우)
- `--password <password>`: 게이트웨이 비밀번호 (필요한 경우)
- `--session <key>`: 세션 키 (기본값: `main`, 또는 범위가 global인 경우 `global`)
- `--deliver`: 어시스턴트 응답을 프로바이더에 전달 (기본적으로 꺼짐)
- `--thinking <level>`: 전송을 위한 생각 레벨 재정의
- `--message <text>`: 연결 후 초기 메시지 전송
- `--timeout-ms <ms>`: 에이전트 타임아웃 (ms 단위, `agents.defaults.timeoutSeconds`가 기본값)
- `--history-limit <n>`: 로드할 히스토리 항목 (기본값 `200`)

참고: `--url`을 설정하면 TUI는 구성 또는 환경 자격 증명으로 폴백하지 않습니다.
`--token` 또는 `--password`를 명시적으로 전달하십시오. 명시적 자격 증명이 없는 것은 오류입니다.

## 문제 해결

메시지 전송 후 출력이 없는 경우:

- TUI에서 `/status`를 실행하여 게이트웨이가 연결되어 있고 대기/사용 중인지 확인하십시오.
- 게이트웨이 로그 확인: `openclaw logs --follow`.
- 에이전트가 실행될 수 있는지 확인: `openclaw status` 및 `openclaw models status`.
- 채팅 채널에서 메시지를 기대하는 경우 전달을 활성화하십시오 (`/deliver on` 또는 `--deliver`).

## 연결 문제 해결

- `disconnected`: 게이트웨이가 실행 중인지, `--url/--token/--password`가 올바른지 확인하십시오.
- 선택기에 에이전트 없음: `openclaw agents list`와 라우팅 구성을 확인하십시오.
- 세션 선택기 비어 있음: global 범위에 있거나 아직 세션이 없을 수 있습니다.

## 관련

- [Control UI](/web/control-ui) — 웹 기반 제어 인터페이스
- [CLI 참조](/cli/) — 전체 CLI 명령 참조
