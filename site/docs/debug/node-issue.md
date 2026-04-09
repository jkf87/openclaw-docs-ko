---
title: "Node + tsx 충돌"
description: "Node + tsx \"__name is not a function\" 충돌 참고 사항 및 해결 방법"
---

# Node + tsx "\_\_name is not a function" 충돌

## 요약

`tsx`를 사용하여 Node를 통해 OpenClaw를 실행하면 시작 시 다음 오류가 발생합니다:

```
[openclaw] Failed to start CLI: TypeError: __name is not a function
    at createSubsystemLogger (.../src/logging/subsystem.ts:203:25)
    at .../src/agents/auth-profiles/constants.ts:25:20
```

이 문제는 개발 스크립트를 Bun에서 `tsx`로 전환한 후 시작되었습니다 (커밋 `2871657e`, 2026-01-06). 동일한 런타임 경로가 Bun에서는 작동했습니다.

## 환경

- Node: v25.x (v25.3.0에서 관찰됨)
- tsx: 4.21.0
- OS: macOS (Node 25를 실행하는 다른 플랫폼에서도 재현 가능)

## 재현 방법 (Node 전용)

```bash
# 리포지토리 루트에서
node --version
pnpm install
node --import tsx src/entry.ts status
```

## 리포지토리의 최소 재현

```bash
node --import tsx scripts/repro/tsx-name-repro.ts
```

## Node 버전 확인

- Node 25.3.0: 실패
- Node 22.22.0 (Homebrew `node@22`): 실패
- Node 24: 아직 설치되지 않아 검증 필요

## 참고 / 가설

- `tsx`는 esbuild를 사용하여 TS/ESM을 변환합니다. esbuild의 `keepNames`는 `__name` 헬퍼를 내보내고 함수 정의를 `__name(...)`으로 래핑합니다.
- 충돌은 `__name`이 존재하지만 이 모듈의 Node 25 로더 경로에서 런타임에 함수가 아니라는 것을 나타내며, 이는 헬퍼가 없거나 덮어씌워졌음을 의미합니다.
- 헬퍼가 없거나 재작성된 경우 다른 esbuild 소비자에서도 유사한 `__name` 헬퍼 문제가 보고된 바 있습니다.

## 회귀 기록

- `2871657e` (2026-01-06): Bun을 선택 사항으로 만들기 위해 스크립트가 Bun에서 tsx로 변경됨.
- 그 이전 (Bun 경로), `openclaw status` 및 `gateway:watch`가 작동했음.

## 해결 방법

- 개발 스크립트에 Bun 사용 (현재 임시 복구).
- Node + tsc 감시 후 컴파일된 출력 실행:

  ```bash
  pnpm exec tsc --watch --preserveWatchOutput
  node --watch openclaw.mjs status
  ```

- 로컬 확인됨: `pnpm exec tsc -p tsconfig.json` + `node openclaw.mjs status`가 Node 25에서 작동함.
- 가능한 경우 TS 로더에서 esbuild keepNames 비활성화 (`__name` 헬퍼 삽입 방지); tsx는 현재 이것을 노출하지 않음.
- Node LTS (22/24)로 `tsx` 테스트하여 문제가 Node 25 특정인지 확인.

## 참조

- [https://opennext.js.org/cloudflare/howtos/keep_names](https://opennext.js.org/cloudflare/howtos/keep_names)
- [https://esbuild.github.io/api/#keep-names](https://esbuild.github.io/api/#keep-names)
- [https://github.com/evanw/esbuild/issues/1031](https://github.com/evanw/esbuild/issues/1031)

## 다음 단계

- Node 22/24에서 재현하여 Node 25 회귀 확인.
- 알려진 회귀가 있으면 `tsx` 야간 버전 테스트 또는 이전 버전 고정.
- Node LTS에서 재현되면 `__name` 스택 추적으로 업스트림에 최소 재현 파일 제출.
