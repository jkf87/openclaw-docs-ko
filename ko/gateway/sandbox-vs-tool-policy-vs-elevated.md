---
title: 샌드박스 vs 도구 정책 vs 상승된 권한
summary: "도구가 차단된 이유: 샌드박스 런타임, 도구 허용/거부 정책, 상승된 exec 게이트"
read_when: "'sandbox jail'에 부딪히거나 도구/상승 거부를 보고 변경할 정확한 구성 키를 원할 때."
status: active
---

# 샌드박스 vs 도구 정책 vs 상승된 권한

OpenClaw에는 세 가지 관련된(하지만 다른) 제어가 있습니다:

1. **샌드박스** (`agents.defaults.sandbox.*` / `agents.list[].sandbox.*`)는 **도구가 실행되는 위치**를 결정합니다 (Docker vs 호스트).
2. **도구 정책** (`tools.*`, `tools.sandbox.tools.*`, `agents.list[].tools.*`)는 **어떤 도구를 사용할 수 있는지/허용되는지**를 결정합니다.
3. **상승된 권한** (`tools.elevated.*`, `agents.list[].tools.elevated.*`)은 샌드박스 상태일 때 샌드박스 외부에서 실행하기 위한 **exec 전용 탈출구**입니다(기본적으로 `gateway`, 또는 exec 대상이 `node`로 구성된 경우 `node`).

## 빠른 디버그

인스펙터를 사용하여 OpenClaw가 실제로 수행하는 작업을 확인합니다:

```bash
openclaw sandbox explain
openclaw sandbox explain --session agent:main:main
openclaw sandbox explain --agent work
openclaw sandbox explain --json
```

출력 내용:

- 효과적인 샌드박스 모드/범위/워크스페이스 액세스
- 세션이 현재 샌드박스됨(메인 vs 비메인) 여부
- 효과적인 샌드박스 도구 허용/거부 (에이전트/전역/기본값에서 온 것인지 여부 포함)
- 상승된 게이트 및 수정 키 경로

## 샌드박스: 도구가 실행되는 위치

샌드박싱은 `agents.defaults.sandbox.mode`로 제어됩니다:

- `"off"`: 모든 것이 호스트에서 실행됩니다.
- `"non-main"`: 비메인 세션만 샌드박스됩니다 (그룹/채널에 대한 일반적인 "놀라움").
- `"all"`: 모든 것이 샌드박스됩니다.

전체 매트릭스(범위, 워크스페이스 마운트, 이미지)는 [샌드박싱](/gateway/sandboxing)을 참조하십시오.

### 바인드 마운트 (보안 빠른 체크)

- `docker.binds`는 샌드박스 파일 시스템을 _관통합니다_: 마운트한 것이 설정한 모드(`:ro` 또는 `:rw`)로 컨테이너 내에 표시됩니다.
- 모드를 생략하면 기본값은 읽기-쓰기입니다; 소스/시크릿에는 `:ro`를 사용합니다.
- `scope: "shared"`는 에이전트별 바인드를 무시합니다 (전역 바인드만 적용).
- OpenClaw는 바인드 소스를 두 번 검증합니다: 먼저 정규화된 소스 경로에서, 그런 다음 가장 깊은 기존 조상을 통해 해결한 후. 심링크-부모 탈출은 차단된 경로 또는 허용된 루트 검사를 우회하지 않습니다.
- `/var/run/docker.sock`을 바인딩하면 호스트 제어를 샌드박스에 효과적으로 넘깁니다; 의도적으로만 수행합니다.

## 도구 정책: 어떤 도구가 존재/호출 가능한지

두 가지 레이어가 중요합니다:

- **도구 프로필**: `tools.profile` 및 `agents.list[].tools.profile` (기본 허용 목록)
- **프로바이더 도구 프로필**: `tools.byProvider[provider].profile` 및 `agents.list[].tools.byProvider[provider].profile`
- **전역/에이전트별 도구 정책**: `tools.allow`/`tools.deny` 및 `agents.list[].tools.allow`/`agents.list[].tools.deny`
- **샌드박스 도구 정책** (샌드박스 상태일 때만 적용): `tools.sandbox.tools.allow`/`tools.sandbox.tools.deny` 및 `agents.list[].tools.sandbox.tools.*`

경험칙:

- `deny`는 항상 이깁니다.
- `allow`가 비어 있지 않으면 다른 모든 것은 차단된 것으로 취급됩니다.
- 도구 정책은 완전 차단입니다: `/exec`은 거부된 `exec` 도구를 재정의할 수 없습니다.
- `/exec`는 인증된 발신자에 대한 세션 기본값만 변경합니다; 도구 액세스를 부여하지 않습니다.

### 도구 그룹 (약어)

도구 정책(전역, 에이전트, 샌드박스)은 여러 도구로 확장되는 `group:*` 항목을 지원합니다:

```json5
{
  tools: {
    sandbox: {
      tools: {
        allow: ["group:runtime", "group:fs", "group:sessions", "group:memory"],
      },
    },
  },
}
```

사용 가능한 그룹:

- `group:runtime`: `exec`, `process`, `code_execution`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `sessions_yield`, `subagents`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:web`: `web_search`, `x_search`, `web_fetch`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:agents`: `agents_list`
- `group:media`: `image`, `image_generate`, `video_generate`, `tts`
- `group:openclaw`: 모든 내장 OpenClaw 도구 (프로바이더 플러그인 제외)

## 상승된 권한: exec 전용 "호스트에서 실행"

상승된 권한은 추가 도구를 **부여하지 않습니다**; `exec`에만 영향을 미칩니다.

- 샌드박스 상태이면 `/elevated on`(또는 `elevated: true`인 `exec`)이 샌드박스 외부에서 실행됩니다 (승인이 여전히 적용될 수 있음).
- 세션에 대한 exec 승인을 건너뛰려면 `/elevated full`을 사용합니다.
- 이미 직접 실행 중이라면 상승된 권한은 사실상 아무런 효과가 없습니다 (여전히 게이팅됨).
- 상승된 권한은 skill 범위가 아니며 도구 허용/거부를 재정의하지 **않습니다**.

게이트:

- 활성화: `tools.elevated.enabled` (및 선택적으로 `agents.list[].tools.elevated.enabled`)
- 발신자 허용 목록: `tools.elevated.allowFrom.<provider>` (및 선택적으로 `agents.list[].tools.elevated.allowFrom.<provider>`)

[상승된 모드](/tools/elevated) 참조.

## 일반적인 "sandbox jail" 수정

### "도구 X가 샌드박스 도구 정책에 의해 차단됨"

수정 키 (하나 선택):

- 샌드박스 비활성화: `agents.defaults.sandbox.mode=off` (또는 에이전트별 `agents.list[].sandbox.mode=off`)
- 샌드박스 내에서 도구 허용:
  - `tools.sandbox.tools.deny`에서 제거 (또는 에이전트별 `agents.list[].tools.sandbox.tools.deny`)
  - 또는 `tools.sandbox.tools.allow`에 추가 (또는 에이전트별 허용)

### "이것이 메인이라고 생각했는데, 왜 샌드박스됐나요?"

`"non-main"` 모드에서 그룹/채널 키는 메인이 _아닙니다_. 메인 세션 키(`sandbox explain`으로 표시됨)를 사용하거나 모드를 `"off"`로 전환합니다.

## 참조

- [샌드박싱](/gateway/sandboxing) -- 전체 샌드박스 참조 (모드, 범위, 백엔드, 이미지)
- [멀티 에이전트 샌드박스 및 도구](/tools/multi-agent-sandbox-tools) -- 에이전트별 재정의 및 우선순위
- [상승된 모드](/tools/elevated)
