---
title: "Pi 개발 워크플로"
description: "Pi 통합을 위한 개발자 워크플로: 빌드, 테스트, 라이브 유효성 검사"
---

# Pi 개발 워크플로

이 가이드는 OpenClaw의 Pi 통합 작업을 위한 합리적인 워크플로를 요약합니다.

## 타입 체크 및 린팅

- 기본 로컬 게이트: `pnpm check`
- 변경 사항이 빌드 출력, 패키징, 또는 레이지 로딩/모듈 경계에 영향을 줄 수 있는 경우 빌드 게이트: `pnpm build`
- Pi 중심 변경 사항의 전체 랜딩 게이트: `pnpm check && pnpm test`

## Pi 테스트 실행

Vitest로 Pi 중심 테스트 세트를 직접 실행하십시오:

```bash
pnpm test \
  "src/agents/pi-*.test.ts" \
  "src/agents/pi-embedded-*.test.ts" \
  "src/agents/pi-tools*.test.ts" \
  "src/agents/pi-settings.test.ts" \
  "src/agents/pi-tool-definition-adapter*.test.ts" \
  "src/agents/pi-hooks/**/*.test.ts"
```

라이브 프로바이더 실행을 포함하려면:

```bash
OPENCLAW_LIVE_TEST=1 pnpm test src/agents/pi-embedded-runner-extraparams.live.test.ts
```

다음 주요 Pi 단위 스위트를 포함합니다:

- `src/agents/pi-*.test.ts`
- `src/agents/pi-embedded-*.test.ts`
- `src/agents/pi-tools*.test.ts`
- `src/agents/pi-settings.test.ts`
- `src/agents/pi-tool-definition-adapter.test.ts`
- `src/agents/pi-hooks/*.test.ts`

## 수동 테스트

권장 플로:

- dev 모드로 게이트웨이 실행:
  - `pnpm gateway:dev`
- 에이전트 직접 트리거:
  - `pnpm openclaw agent --message "Hello" --thinking low`
- 인터랙티브 디버깅에 TUI 사용:
  - `pnpm tui`

도구 호출 동작을 확인하려면 `read` 또는 `exec` 동작을 프롬프트하여 도구 스트리밍과 페이로드 처리를 확인하십시오.

## 클린 슬레이트 재설정

상태는 OpenClaw 상태 디렉토리 아래에 있습니다. 기본값은 `~/.openclaw`입니다. `OPENCLAW_STATE_DIR`이 설정된 경우 해당 디렉토리를 사용하십시오.

모든 것을 재설정하려면:

- `openclaw.json` (구성)
- `agents/&lt;agentId&gt;/agent/auth-profiles.json` (모델 인증 프로파일, API 키 + OAuth)
- `credentials/` (인증 프로파일 저장소 외부에 여전히 있는 프로바이더/채널 상태)
- `agents/&lt;agentId&gt;/sessions/` (에이전트 세션 히스토리)
- `agents/&lt;agentId&gt;/sessions/sessions.json` (세션 인덱스)
- `sessions/` (레거시 경로가 있는 경우)
- `workspace/` (빈 워크스페이스를 원하는 경우)

세션만 재설정하려면 해당 에이전트의 `agents/&lt;agentId&gt;/sessions/`를 삭제하십시오. 인증을 유지하려면 `agents/&lt;agentId&gt;/agent/auth-profiles.json`과 `credentials/` 아래의 프로바이더 상태를 그대로 두십시오.

## 참조

- [테스트](/help/testing)
- [시작하기](/start/getting-started)
