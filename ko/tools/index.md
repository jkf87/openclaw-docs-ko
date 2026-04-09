---
summary: "OpenClaw 도구 및 플러그인 개요: 에이전트가 할 수 있는 일과 확장 방법"
read_when:
  - You want to understand what tools OpenClaw provides
  - You need to configure, allow, or deny tools
  - You are deciding between built-in tools, skills, and plugins
title: "도구 및 플러그인"
---

# 도구 및 플러그인

에이전트가 텍스트 생성 외에 하는 모든 작업은 **도구**를 통해 이루어집니다.
도구는 에이전트가 파일을 읽고, 명령을 실행하고, 웹을 탐색하고, 메시지를 보내고, 기기와 상호작용하는 방법입니다.

## 도구, 스킬, 플러그인

OpenClaw에는 함께 작동하는 세 가지 레이어가 있습니다:

<Steps>
  <Step title="도구는 에이전트가 호출하는 것입니다">
    도구는 에이전트가 호출할 수 있는 타입이 지정된 함수입니다 (예: `exec`, `browser`,
    `web_search`, `message`). OpenClaw는 **내장 도구** 세트를 제공하며
    플러그인은 추가 도구를 등록할 수 있습니다.

    에이전트는 도구를 모델 API로 전송된 구조화된 함수 정의로 인식합니다.

  </Step>

  <Step title="스킬은 에이전트에게 언제, 어떻게 할지 가르칩니다">
    스킬은 시스템 프롬프트에 주입되는 마크다운 파일 (`SKILL.md`)입니다.
    스킬은 에이전트에게 도구를 효과적으로 사용하기 위한 컨텍스트, 제약, 단계별 지침을 제공합니다. 스킬은 워크스페이스, 공유 폴더, 또는 플러그인 내부에 있습니다.

    [스킬 레퍼런스](/tools/skills) | [스킬 만들기](/tools/creating-skills)

  </Step>

  <Step title="플러그인은 모든 것을 함께 패키징합니다">
    플러그인은 채널, 모델 프로바이더, 도구, 스킬, 음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성, 비디오 생성, 웹 페치, 웹 검색 등의 기능 조합을 등록할 수 있는 패키지입니다. 일부 플러그인은 **코어** (OpenClaw와 함께 제공됨)이고, 다른 것들은 **외부** (커뮤니티에서 npm에 게시됨)입니다.

    [플러그인 설치 및 구성](/tools/plugin) | [직접 만들기](/plugins/building-plugins)

  </Step>
</Steps>

## 내장 도구

이 도구들은 OpenClaw와 함께 제공되며 플러그인을 설치하지 않아도 사용할 수 있습니다:

| 도구                                       | 기능                                                                 | 페이지                                        |
| ------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------- |
| `exec` / `process`                         | 쉘 명령 실행, 백그라운드 프로세스 관리                               | [Exec](/tools/exec)                         |
| `code_execution`                           | 샌드박스 원격 Python 분석 실행                                       | [코드 실행](/tools/code-execution)          |
| `browser`                                  | Chromium 브라우저 제어 (탐색, 클릭, 스크린샷)                        | [브라우저](/tools/browser)                  |
| `web_search` / `x_search` / `web_fetch`    | 웹 검색, X 게시물 검색, 페이지 콘텐츠 가져오기                       | [웹](/tools/web)                            |
| `read` / `write` / `edit`                  | 워크스페이스의 파일 I/O                                              |                                             |
| `apply_patch`                              | 멀티 청크 파일 패치                                                  | [패치 적용](/tools/apply-patch)             |
| `message`                                  | 모든 채널에서 메시지 전송                                            | [에이전트 전송](/tools/agent-send)          |
| `canvas`                                   | 노드 Canvas 구동 (제시, 평가, 스냅샷)                                |                                             |
| `nodes`                                    | 페어링된 기기 검색 및 타겟팅                                         |                                             |
| `cron` / `gateway`                         | 예약 작업 관리; 게이트웨이 검사, 패치, 재시작 또는 업데이트          |                                             |
| `image` / `image_generate`                 | 이미지 분석 또는 생성                                                | [이미지 생성](/tools/image-generation)      |
| `music_generate`                           | 음악 트랙 생성                                                       | [음악 생성](/tools/music-generation)        |
| `video_generate`                           | 비디오 생성                                                          | [비디오 생성](/tools/video-generation)      |
| `tts`                                      | 일회성 텍스트 음성 변환                                              | [TTS](/tools/tts)                           |
| `sessions_*` / `subagents` / `agents_list` | 세션 관리, 상태, 서브 에이전트 오케스트레이션                        | [서브 에이전트](/tools/subagents)           |
| `session_status`                           | 경량 `/status` 스타일 읽기 및 세션 모델 재정의                       | [세션 도구](/concepts/session-tool)         |

이미지 작업의 경우 분석에는 `image`를, 생성 또는 편집에는 `image_generate`를 사용하십시오. `openai/*`, `google/*`, `fal/*`, 또는 다른 비기본 이미지 프로바이더를 대상으로 하는 경우 먼저 해당 프로바이더의 인증/API 키를 구성하십시오.

음악 작업의 경우 `music_generate`를 사용하십시오. `google/*`, `minimax/*`, 또는 다른 비기본 음악 프로바이더를 대상으로 하는 경우 먼저 해당 프로바이더의 인증/API 키를 구성하십시오.

비디오 작업의 경우 `video_generate`를 사용하십시오. `qwen/*` 또는 다른 비기본 비디오 프로바이더를 대상으로 하는 경우 먼저 해당 프로바이더의 인증/API 키를 구성하십시오.

워크플로우 기반 오디오 생성의 경우 ComfyUI와 같은 플러그인이 등록할 때 `music_generate`를 사용하십시오. 이것은 텍스트 음성 변환인 `tts`와 별개입니다.

`session_status`는 세션 그룹의 경량 상태/읽기 도구입니다.
현재 세션에 대한 `/status` 스타일 질문에 답변하고 선택적으로 세션별 모델 재정의를 설정할 수 있습니다. `model=default`는 해당 재정의를 지웁니다. `/status`와 마찬가지로 최신 트랜스크립트 사용 항목에서 스파스 토큰/캐시 카운터와 활성 런타임 모델 레이블을 역채울 수 있습니다.

`gateway`는 게이트웨이 작업을 위한 소유자 전용 런타임 도구입니다:

- 편집 전 하나의 경로 범위 설정 하위 트리를 위한 `config.schema.lookup`
- 현재 설정 스냅샷 + 해시를 위한 `config.get`
- 재시작과 함께 부분 설정 업데이트를 위한 `config.patch`
- 전체 설정 교체만을 위한 `config.apply`
- 명시적 자체 업데이트 + 재시작을 위한 `update.run`

부분 변경의 경우 `config.schema.lookup` 다음에 `config.patch`를 선호하십시오. 전체 설정을 의도적으로 교체하는 경우에만 `config.apply`를 사용하십시오.
이 도구는 `tools.exec.ask` 또는 `tools.exec.security` 변경을 거부합니다. 레거시 `tools.bash.*` 별칭은 동일한 보호된 exec 경로로 정규화됩니다.

### 플러그인 제공 도구

플러그인은 추가 도구를 등록할 수 있습니다. 몇 가지 예시:

- [Lobster](/tools/lobster) — 재개 가능한 승인 게이트가 있는 타입 지정 워크플로우 런타임
- [LLM 태스크](/tools/llm-task) — 구조화된 출력을 위한 JSON 전용 LLM 단계
- [음악 생성](/tools/music-generation) — 워크플로우 기반 프로바이더가 있는 공유 `music_generate` 도구
- [Diffs](/tools/diffs) — 차이점 뷰어 및 렌더러
- [OpenProse](/prose) — 마크다운 우선 워크플로우 오케스트레이션

## 도구 설정

### 허용 및 거부 목록

설정의 `tools.allow` / `tools.deny`를 통해 에이전트가 호출할 수 있는 도구를 제어합니다. 거부는 항상 허용보다 우선합니다.

```json5
{
  tools: {
    allow: ["group:fs", "browser", "web_search"],
    deny: ["exec"],
  },
}
```

### 도구 프로파일

`tools.profile`은 `allow`/`deny`가 적용되기 전에 기본 허용 목록을 설정합니다.
에이전트별 재정의: `agents.list[].tools.profile`.

| 프로파일    | 포함 항목                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `full`      | 제한 없음 (설정되지 않은 것과 동일)                                                                                                               |
| `coding`    | `group:fs`, `group:runtime`, `group:web`, `group:sessions`, `group:memory`, `cron`, `image`, `image_generate`, `music_generate`, `video_generate` |
| `messaging` | `group:messaging`, `sessions_list`, `sessions_history`, `sessions_send`, `session_status`                                                         |
| `minimal`   | `session_status`만                                                                                                                                |

### 도구 그룹

허용/거부 목록에서 `group:*` 약칭을 사용하십시오:

| 그룹               | 도구                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `group:runtime`    | exec, process, code_execution (`bash`는 `exec`의 별칭으로 허용됨)                                        |
| `group:fs`         | read, write, edit, apply_patch                                                                           |
| `group:sessions`   | sessions_list, sessions_history, sessions_send, sessions_spawn, sessions_yield, subagents, session_status |
| `group:memory`     | memory_search, memory_get                                                                                |
| `group:web`        | web_search, x_search, web_fetch                                                                          |
| `group:ui`         | browser, canvas                                                                                          |
| `group:automation` | cron, gateway                                                                                            |
| `group:messaging`  | message                                                                                                  |
| `group:nodes`      | nodes                                                                                                    |
| `group:agents`     | agents_list                                                                                              |
| `group:media`      | image, image_generate, music_generate, video_generate, tts                                               |
| `group:openclaw`   | 모든 내장 OpenClaw 도구 (플러그인 도구 제외)                                                             |

`sessions_history`는 경계가 지정된, 안전성이 필터링된 회상 뷰를 반환합니다. 추론 태그, `<relevant-memories>` 스캐폴딩, 일반 텍스트 도구 호출 XML 페이로드 (`<tool_call>...</tool_call>`, `<function_call>...</function_call>`, `<tool_calls>...</tool_calls>`, `<function_calls>...</function_calls>` 및 잘린 도구 호출 블록 포함), 다운그레이드된 도구 호출 스캐폴딩, 누출된 ASCII/전각 모델 제어 토큰, 그리고 어시스턴트 텍스트에서 잘못된 MiniMax 도구 호출 XML을 제거합니다. 그런 다음 원시 트랜스크립트 덤프가 아닌 수정/잘림 및 가능한 크기 초과 행 자리 표시자를 적용합니다.

### 프로바이더별 제한

전역 기본값을 변경하지 않고 특정 프로바이더에 대한 도구를 제한하려면 `tools.byProvider`를 사용하십시오:

```json5
{
  tools: {
    profile: "coding",
    byProvider: {
      "google-antigravity": { profile: "minimal" },
    },
  },
}
```
