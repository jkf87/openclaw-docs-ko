---
title: "health"
description: "`openclaw health`에 대한 CLI 참조 (RPC를 통한 게이트웨이 상태 스냅샷)"
---

# `openclaw health`

실행 중인 Gateway에서 상태를 가져옵니다.

옵션:

- `--json`: 기계 판독 가능한 출력
- `--timeout &lt;ms&gt;`: 연결 타임아웃 (밀리초) (기본값 `10000`)
- `--verbose`: 상세 로깅
- `--debug`: `--verbose`의 별칭

예시:

```bash
openclaw health
openclaw health --json
openclaw health --timeout 2500
openclaw health --verbose
openclaw health --debug
```

참고사항:

- 기본 `openclaw health`는 실행 중인 게이트웨이에 상태 스냅샷을 요청합니다. 게이트웨이에 이미 새로운 캐시된 스냅샷이 있는 경우 해당 캐시된 페이로드를 반환하고 백그라운드에서 새로 고칠 수 있습니다.
- `--verbose`는 라이브 프로브를 강제하고, 게이트웨이 연결 세부사항을 출력하며, 모든 구성된 계정 및 에이전트에 걸쳐 사람이 읽을 수 있는 출력을 확장합니다.
- 출력에는 여러 에이전트가 구성된 경우 에이전트별 세션 저장소가 포함됩니다.
