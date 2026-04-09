---
title: "테스트"
description: "테스트를 로컬에서 실행하는 방법 (vitest) 및 force/coverage 모드를 사용하는 경우"
---

# 테스트

- 전체 테스트 킷 (스위트, 라이브, Docker): [Testing](/help/testing)

- `pnpm test:force`: 기본 컨트롤 포트를 점유하고 있는 남은 게이트웨이 프로세스를 종료한 다음, 서버 테스트가 실행 중인 인스턴스와 충돌하지 않도록 격리된 게이트웨이 포트로 전체 Vitest 스위트를 실행합니다. 이전 게이트웨이 실행으로 인해 포트 18789가 점유된 경우 사용하십시오.
- `pnpm test:coverage`: `vitest.unit.config.ts`를 통해 V8 커버리지로 단위 스위트를 실행합니다. 전역 임계값은 줄/브랜치/함수/구문 70%입니다. 커버리지는 통합 집약적 진입점 (CLI 와이어링, 게이트웨이/telegram 브리지, 웹채팅 정적 서버)을 제외하여 단위 테스트 가능한 로직에 초점을 맞춥니다.
- `pnpm test:coverage:changed`: `origin/main` 이후 변경된 파일에 대해서만 단위 커버리지를 실행합니다.
- `pnpm test:changed`: diff가 라우팅 가능한 소스/테스트 파일만 수정하는 경우 변경된 git 경로를 범위가 지정된 Vitest 레인으로 확장합니다. 구성/설정 변경은 구성 편집이 필요할 때 와이어링 편집이 광범위하게 다시 실행되도록 네이티브 루트 프로젝트 실행으로 여전히 폴백합니다.
- `pnpm test`: 범위가 지정된 Vitest 레인을 통해 명시적 파일/디렉토리 대상을 라우팅합니다. 대상 없는 실행은 이제 하나의 거대한 루트 프로젝트 프로세스 대신 11개의 순차적 샤드 구성 (`vitest.full-core-unit-src.config.ts`, `vitest.full-core-unit-security.config.ts`, `vitest.full-core-unit-ui.config.ts`, `vitest.full-core-unit-support.config.ts`, `vitest.full-core-support-boundary.config.ts`, `vitest.full-core-contracts.config.ts`, `vitest.full-core-bundled.config.ts`, `vitest.full-core-runtime.config.ts`, `vitest.full-agentic.config.ts`, `vitest.full-auto-reply.config.ts`, `vitest.full-extensions.config.ts`)을 실행합니다.
- 선택된 `plugin-sdk` 및 `commands` 테스트 파일은 이제 `test/setup.ts`만 유지하는 전용 경량 레인을 통해 라우팅됩니다. 런타임 집약적 사례는 기존 레인에 있습니다.
- 선택된 `plugin-sdk` 및 `commands` 헬퍼 소스 파일도 `pnpm test:changed`를 해당 경량 레인의 명시적 형제 테스트에 매핑하므로 소형 헬퍼 편집이 무거운 런타임 기반 스위트를 다시 실행하지 않습니다.
- `auto-reply`도 이제 세 개의 전용 구성 (`core`, `top-level`, `reply`)으로 분할되어 응답 하네스가 더 가벼운 상위 레벨 상태/토큰/헬퍼 테스트를 지배하지 않습니다.
- 기본 Vitest 구성은 이제 `pool: "threads"` 및 `isolate: false`로 기본 설정되며 repo 구성 전반에 걸쳐 공유 비격리 러너가 활성화됩니다.
- `pnpm test:channels`는 `vitest.channels.config.ts`를 실행합니다.
- `pnpm test:extensions`는 `vitest.extensions.config.ts`를 실행합니다.
- `pnpm test:extensions`: 확장/플러그인 스위트를 실행합니다.
- `pnpm test:perf:imports`: Vitest 임포트 기간 + 임포트 분석 보고를 활성화하면서 명시적 파일/디렉토리 대상에 대해 범위가 지정된 레인 라우팅을 계속 사용합니다.
- `pnpm test:perf:imports:changed`: 동일한 임포트 프로파일링, 하지만 `origin/main` 이후 변경된 파일에 대해서만.
- `pnpm test:perf:changed:bench -- --ref &lt;git-ref&gt;`는 동일한 커밋된 git diff에 대한 네이티브 루트 프로젝트 실행과 라우팅된 변경 모드 경로를 벤치마킹합니다.
- `pnpm test:perf:changed:bench -- --worktree`는 먼저 커밋하지 않고 현재 워크트리 변경 세트를 벤치마킹합니다.
- `pnpm test:perf:profile:main`: Vitest 메인 스레드의 CPU 프로파일을 씁니다 (`.artifacts/vitest-main-profile`).
- `pnpm test:perf:profile:runner`: 단위 러너의 CPU + 힙 프로파일을 씁니다 (`.artifacts/vitest-runner-profile`).
- 게이트웨이 통합: `OPENCLAW_TEST_INCLUDE_GATEWAY=1 pnpm test` 또는 `pnpm test:gateway`를 통해 옵트인.
- `pnpm test:e2e`: 게이트웨이 종단 간 스모크 테스트 (멀티 인스턴스 WS/HTTP/노드 페어링)를 실행합니다. `vitest.e2e.config.ts`에서 `threads` + `isolate: false` 및 적응형 워커로 기본 설정됩니다. `OPENCLAW_E2E_WORKERS=&lt;n&gt;`으로 조정하고 자세한 로그는 `OPENCLAW_E2E_VERBOSE=1`을 설정하십시오.
- `pnpm test:live`: 프로바이더 라이브 테스트 (minimax/zai)를 실행합니다. API 키와 `LIVE=1` (또는 프로바이더별 `*_LIVE_TEST=1`)이 필요합니다.
- `pnpm test:docker:openwebui`: 도커화된 OpenClaw + Open WebUI를 시작하고, Open WebUI를 통해 로그인하고, `/api/models`를 확인한 다음, `/api/chat/completions`를 통해 실제 프록시 채팅을 실행합니다. 사용 가능한 라이브 모델 키 (예: `~/.profile`의 OpenAI), 외부 Open WebUI 이미지 풀이 필요하며 일반 단위/e2e 스위트처럼 CI가 안정적으로 예상되지 않습니다.
- `pnpm test:docker:mcp-channels`: 시드된 게이트웨이 컨테이너와 `openclaw mcp serve`를 생성하는 두 번째 클라이언트 컨테이너를 시작한 다음, 라우팅된 대화 검색, 트랜스크립트 읽기, 첨부 메타데이터, 라이브 이벤트 큐 동작, 아웃바운드 전송 라우팅, 실제 stdio 브리지를 통한 Claude 스타일 채널 + 권한 알림을 검증합니다. Claude 알림 어서션은 원시 stdio MCP 프레임을 직접 읽으므로 스모크는 브리지가 실제로 내보내는 내용을 반영합니다.

## 로컬 PR 게이트

로컬 PR 랜드/게이트 검사를 위해 다음을 실행합니다:

- `pnpm check`
- `pnpm build`
- `pnpm test`
- `pnpm check:docs`

`pnpm test`가 부하가 많은 호스트에서 불안정한 경우 회귀로 취급하기 전에 한 번 다시 실행한 다음 `pnpm test &lt;path/to/test&gt;`로 격리하십시오. 메모리 제한 호스트의 경우 다음을 사용하십시오:

- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test`
- `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/tmp/openclaw-vitest-cache pnpm test:changed`

## 모델 지연 벤치 (로컬 키)

스크립트: [`scripts/bench-model.ts`](https://github.com/openclaw/openclaw/blob/main/scripts/bench-model.ts)

사용법:

- `source ~/.profile && pnpm tsx scripts/bench-model.ts --runs 10`
- 선택적 환경 변수: `MINIMAX_API_KEY`, `MINIMAX_BASE_URL`, `MINIMAX_MODEL`, `ANTHROPIC_API_KEY`
- 기본 프롬프트: "Reply with a single word: ok. No punctuation or extra text."

마지막 실행 (2025-12-31, 20회):

- minimax 중앙값 1279ms (최소 1114, 최대 2431)
- opus 중앙값 2454ms (최소 1224, 최대 3170)

## CLI 시작 벤치

스크립트: [`scripts/bench-cli-startup.ts`](https://github.com/openclaw/openclaw/blob/main/scripts/bench-cli-startup.ts)

사용법:

- `pnpm test:startup:bench`
- `pnpm test:startup:bench:smoke`
- `pnpm test:startup:bench:save`
- `pnpm test:startup:bench:update`
- `pnpm test:startup:bench:check`
- `pnpm tsx scripts/bench-cli-startup.ts`
- `pnpm tsx scripts/bench-cli-startup.ts --runs 12`
- `pnpm tsx scripts/bench-cli-startup.ts --preset real`
- `pnpm tsx scripts/bench-cli-startup.ts --preset real --case status --case gatewayStatus --runs 3`
- `pnpm tsx scripts/bench-cli-startup.ts --entry openclaw.mjs --entry-secondary dist/entry.js --preset all`
- `pnpm tsx scripts/bench-cli-startup.ts --preset all --output .artifacts/cli-startup-bench-all.json`
- `pnpm tsx scripts/bench-cli-startup.ts --preset real --case gatewayStatusJson --output .artifacts/cli-startup-bench-smoke.json`
- `pnpm tsx scripts/bench-cli-startup.ts --preset real --cpu-prof-dir .artifacts/cli-cpu`
- `pnpm tsx scripts/bench-cli-startup.ts --json`

프리셋:

- `startup`: `--version`, `--help`, `health`, `health --json`, `status --json`, `status`
- `real`: `health`, `status`, `status --json`, `sessions`, `sessions --json`, `agents list --json`, `gateway status`, `gateway status --json`, `gateway health --json`, `config get gateway.port`
- `all`: 두 프리셋 모두

출력에는 `sampleCount`, 평균, p50, p95, 최소/최대, 종료 코드/신호 분포, 각 명령의 최대 RSS 요약이 포함됩니다. 선택적 `--cpu-prof-dir` / `--heap-prof-dir`는 타이밍과 프로파일 캡처가 동일한 하네스를 사용하도록 실행당 V8 프로파일을 씁니다.

저장된 출력 규칙:

- `pnpm test:startup:bench:smoke`는 `.artifacts/cli-startup-bench-smoke.json`에 대상 스모크 아티팩트를 씁니다
- `pnpm test:startup:bench:save`는 `runs=5` 및 `warmup=1`을 사용하여 `.artifacts/cli-startup-bench-all.json`에 전체 스위트 아티팩트를 씁니다
- `pnpm test:startup:bench:update`는 `runs=5` 및 `warmup=1`을 사용하여 `test/fixtures/cli-startup-bench.json`에서 체크인된 기준 픽스처를 새로 고침합니다

체크인된 픽스처:

- `test/fixtures/cli-startup-bench.json`
- `pnpm test:startup:bench:update`로 새로 고침
- `pnpm test:startup:bench:check`로 현재 결과를 픽스처와 비교

## 온보딩 E2E (Docker)

Docker는 선택 사항입니다. 이것은 컨테이너화된 온보딩 스모크 테스트에만 필요합니다.

깨끗한 Linux 컨테이너에서 전체 콜드 스타트 흐름:

```bash
scripts/e2e/onboard-docker.sh
```

이 스크립트는 의사 tty를 통해 대화형 마법사를 구동하고, 구성/워크스페이스/세션 파일을 확인한 다음, 게이트웨이를 시작하고 `openclaw health`를 실행합니다.

## QR 임포트 스모크 (Docker)

지원되는 Docker Node 런타임 (기본 Node 24, Node 22 호환)에서 `qrcode-terminal`이 로드되는지 확인합니다:

```bash
pnpm test:docker:qr
```
