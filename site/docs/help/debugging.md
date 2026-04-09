---
title: "디버깅"
description: "디버깅 도구: 감시 모드, 원시 모델 스트림, 추론 누출 추적"
---

# 디버깅

이 페이지는 스트리밍 출력을 위한 디버깅 헬퍼를 다룹니다. 특히
프로바이더가 추론을 일반 텍스트에 혼합하는 경우를 다룹니다.

## 런타임 디버그 재정의

채팅에서 `/debug`를 사용하여 **런타임 전용** 설정 재정의(메모리, 디스크 아님)를 설정하십시오.
`/debug`는 기본적으로 비활성화되어 있습니다. `commands.debug: true`로 활성화하십시오.
`openclaw.json`을 편집하지 않고 불명확한 설정을 토글해야 할 때 유용합니다.

예시:

```
/debug show
/debug set messages.responsePrefix="[openclaw]"
/debug unset messages.responsePrefix
/debug reset
```

`/debug reset`은 모든 재정의를 지우고 디스크의 설정으로 돌아갑니다.

## 게이트웨이 감시 모드

빠른 반복을 위해 파일 감시자 아래에서 게이트웨이를 실행하십시오:

```bash
pnpm gateway:watch
```

이것은 다음으로 매핑됩니다:

```bash
node scripts/watch-node.mjs gateway --force
```

감시자는 `src/` 아래의 빌드 관련 파일, 확장 소스 파일,
확장 `package.json` 및 `openclaw.plugin.json` 메타데이터, `tsconfig.json`,
`package.json`, `tsdown.config.ts`에서 재시작합니다. 확장 메타데이터 변경 시
`tsdown` 재빌드를 강제하지 않고 게이트웨이가 재시작됩니다. 소스 및 설정 변경 시에는
먼저 `dist`를 재빌드합니다.

`gateway:watch` 뒤에 게이트웨이 CLI 플래그를 추가하면 각 재시작 시 전달됩니다. 동일한 리포지토리/플래그 세트에 대해 동일한 감시 명령을 다시 실행하면 이제 중복 감시자 부모를 남기는 대신 이전 감시자를 대체합니다.

## 개발 프로필 + 개발 게이트웨이 (--dev)

디버깅을 위해 상태를 격리하고 안전하고 일회용 설정을 가동하려면 개발 프로필을 사용하십시오. **두 개**의 `--dev` 플래그가 있습니다:

- **전역 `--dev` (프로필):** `~/.openclaw-dev` 아래의 상태를 격리하고
  게이트웨이 포트를 `19001`로 기본 설정합니다 (파생 포트도 이동).
- **`gateway --dev`: 게이트웨이에 누락된 경우 기본 설정 + 워크스페이스 자동 생성**을 지시합니다 (BOOTSTRAP.md 건너뜀).

권장 흐름 (개발 프로필 + 개발 부트스트랩):

```bash
pnpm gateway:dev
OPENCLAW_PROFILE=dev openclaw tui
```

아직 전역 설치가 없다면 `pnpm openclaw ...`를 통해 CLI를 실행하십시오.

수행 내용:

1. **프로필 격리** (전역 `--dev`)
   - `OPENCLAW_PROFILE=dev`
   - `OPENCLAW_STATE_DIR=~/.openclaw-dev`
   - `OPENCLAW_CONFIG_PATH=~/.openclaw-dev/openclaw.json`
   - `OPENCLAW_GATEWAY_PORT=19001` (브라우저/캔버스가 그에 따라 이동)

2. **개발 부트스트랩** (`gateway --dev`)
   - 누락된 경우 최소 설정을 작성합니다 (`gateway.mode=local`, 루프백 바인딩).
   - `agent.workspace`를 개발 워크스페이스로 설정합니다.
   - `agent.skipBootstrap=true` (BOOTSTRAP.md 없음)를 설정합니다.
   - 누락된 경우 워크스페이스 파일을 시드합니다:
     `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, `HEARTBEAT.md`.
   - 기본 ID: **C3-PO** (프로토콜 드로이드).
   - 개발 모드에서 채널 프로바이더를 건너뜁니다 (`OPENCLAW_SKIP_CHANNELS=1`).

초기화 흐름 (새로 시작):

```bash
pnpm gateway:dev:reset
```

참고: `--dev`는 **전역** 프로필 플래그이며 일부 실행기에서 소비됩니다.
명시적으로 지정해야 하는 경우 환경 변수 형식을 사용하십시오:

```bash
OPENCLAW_PROFILE=dev openclaw gateway --dev --reset
```

`--reset`은 설정, 자격 증명, 세션, 개발 워크스페이스를 지우고 (`trash`를 사용, `rm` 아님)
기본 개발 설정을 다시 만듭니다.

팁: 비개발 게이트웨이가 이미 실행 중인 경우 (launchd/systemd), 먼저 중지하십시오:

```bash
openclaw gateway stop
```

## 원시 스트림 로깅 (OpenClaw)

OpenClaw는 필터링/형식 지정 전에 **원시 어시스턴트 스트림**을 기록할 수 있습니다.
추론이 일반 텍스트 델타로 도착하는지(별도의 사고 블록이 아닌지) 확인하는 가장 좋은 방법입니다.

CLI를 통해 활성화:

```bash
pnpm gateway:watch --raw-stream
```

선택적 경로 재정의:

```bash
pnpm gateway:watch --raw-stream --raw-stream-path ~/.openclaw/logs/raw-stream.jsonl
```

동등한 환경 변수:

```bash
OPENCLAW_RAW_STREAM=1
OPENCLAW_RAW_STREAM_PATH=~/.openclaw/logs/raw-stream.jsonl
```

기본 파일:

`~/.openclaw/logs/raw-stream.jsonl`

## 원시 청크 로깅 (pi-mono)

블록으로 파싱되기 전에 **원시 OpenAI 호환 청크**를 캡처하려면
pi-mono가 별도의 로거를 노출합니다:

```bash
PI_RAW_STREAM=1
```

선택적 경로:

```bash
PI_RAW_STREAM_PATH=~/.pi-mono/logs/raw-openai-completions.jsonl
```

기본 파일:

`~/.pi-mono/logs/raw-openai-completions.jsonl`

> 참고: 이것은 pi-mono의
> `openai-completions` 프로바이더를 사용하는 프로세스에서만 방출됩니다.

## 안전 참고 사항

- 원시 스트림 로그에는 전체 프롬프트, 도구 출력, 사용자 데이터가 포함될 수 있습니다.
- 로그를 로컬에 유지하고 디버깅 후 삭제하십시오.
- 로그를 공유하는 경우 먼저 비밀과 개인 식별 정보를 제거하십시오.
