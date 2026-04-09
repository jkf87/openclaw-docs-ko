---
summary: "`openclaw memory`에 대한 CLI 참조 (status/index/search/promote/promote-explain/rem-harness)"
read_when:
  - 시맨틱 메모리를 인덱싱하거나 검색하려는 경우
  - 메모리 가용성 또는 인덱싱을 디버깅하는 경우
  - 회상된 단기 메모리를 `MEMORY.md`로 승격하려는 경우
title: "memory"
---

# `openclaw memory`

시맨틱 메모리 인덱싱 및 검색을 관리합니다.
활성 메모리 플러그인에 의해 제공됩니다 (기본값: `memory-core`; `plugins.slots.memory = "none"`으로 비활성화).

관련:

- 메모리 개념: [메모리](/concepts/memory)
- 메모리 위키: [메모리 위키](/plugins/memory-wiki)
- 위키 CLI: [wiki](/cli/wiki)
- 플러그인: [플러그인](/tools/plugin)

## 예시

```bash
openclaw memory status
openclaw memory status --deep
openclaw memory status --fix
openclaw memory index --force
openclaw memory search "meeting notes"
openclaw memory search --query "deployment" --max-results 20
openclaw memory promote --limit 10 --min-score 0.75
openclaw memory promote --apply
openclaw memory promote --json --min-recall-count 0 --min-unique-queries 0
openclaw memory promote-explain "router vlan"
openclaw memory promote-explain "router vlan" --json
openclaw memory rem-harness
openclaw memory rem-harness --json
openclaw memory status --json
openclaw memory status --deep --index
openclaw memory status --deep --index --verbose
openclaw memory status --agent main
openclaw memory index --agent main --verbose
```

## 옵션

`memory status` 및 `memory index`:

- `--agent <id>`: 단일 에이전트로 범위 지정. 없으면 각 구성된 에이전트에 대해 실행됩니다; 에이전트 목록이 구성되지 않은 경우 기본 에이전트로 폴백합니다.
- `--verbose`: 프로브 및 인덱싱 중 상세 로그 출력.

`memory status`:

- `--deep`: 벡터 + 임베딩 가용성 프로브.
- `--index`: 저장소가 더러운 경우 재인덱스 실행 (`--deep` 포함).
- `--fix`: 오래된 회상 잠금을 복구하고 승격 메타데이터를 정규화.
- `--json`: JSON 출력 인쇄.

`memory index`:

- `--force`: 전체 재인덱스 강제.

`memory search`:

- 쿼리 입력: 위치 인자 `[query]` 또는 `--query <text>` 중 하나를 전달.
- 둘 다 제공되면 `--query`가 우선합니다.
- 둘 다 제공되지 않으면 명령이 오류와 함께 종료됩니다.
- `--agent <id>`: 단일 에이전트로 범위 지정 (기본값: 기본 에이전트).
- `--max-results <n>`: 반환되는 결과 수 제한.
- `--min-score <n>`: 낮은 점수 매칭 필터링.
- `--json`: JSON 결과 인쇄.

`memory promote`:

단기 메모리 승격을 미리 보고 적용합니다.

```bash
openclaw memory promote [--apply] [--limit <n>] [--include-promoted]
```

- `--apply` -- `MEMORY.md`에 승격 쓰기 (기본값: 미리 보기만).
- `--limit <n>` -- 표시되는 후보 수 제한.
- `--include-promoted` -- 이전 주기에서 이미 승격된 항목 포함.

전체 옵션:

- `memory/YYYY-MM-DD.md`에서 가중 승격 신호(`frequency`, `relevance`, `query diversity`, `recency`, `consolidation`, `conceptual richness`)를 사용하여 단기 후보를 순위 매깁니다.
- 메모리 회상과 일일 수집 패스의 단기 신호, 그리고 light/REM 단계 강화 신호를 사용합니다.
- 드리밍이 활성화되면 `memory-core`는 백그라운드에서 전체 스윕(`light -> REM -> deep`)을 실행하는 하나의 크론 작업을 자동 관리합니다 (수동 `openclaw cron add` 불필요).
- `--agent <id>`: 단일 에이전트로 범위 지정 (기본값: 기본 에이전트).
- `--limit <n>`: 반환/적용할 최대 후보 수.
- `--min-score <n>`: 최소 가중 승격 점수.
- `--min-recall-count <n>`: 후보에 필요한 최소 회상 횟수.
- `--min-unique-queries <n>`: 후보에 필요한 최소 고유 쿼리 수.
- `--apply`: 선택한 후보를 `MEMORY.md`에 추가하고 승격됨으로 표시.
- `--include-promoted`: 이미 승격된 후보를 출력에 포함.
- `--json`: JSON 출력 인쇄.

`memory promote-explain`:

특정 승격 후보와 점수 분류를 설명합니다.

```bash
openclaw memory promote-explain <selector> [--agent <id>] [--include-promoted] [--json]
```

- `<selector>`: 조회할 후보 키, 경로 조각, 또는 스니펫 조각.
- `--agent <id>`: 단일 에이전트로 범위 지정 (기본값: 기본 에이전트).
- `--include-promoted`: 이미 승격된 후보 포함.
- `--json`: JSON 출력 인쇄.

`memory rem-harness`:

아무것도 쓰지 않고 REM 반성, 후보 진실, 딥 승격 출력을 미리 봅니다.

```bash
openclaw memory rem-harness [--agent <id>] [--include-promoted] [--json]
```

- `--agent <id>`: 단일 에이전트로 범위 지정 (기본값: 기본 에이전트).
- `--include-promoted`: 이미 승격된 딥 후보 포함.
- `--json`: JSON 출력 인쇄.

## 드리밍 (실험적)

드리밍은 세 가지 협력 단계로 이루어진 백그라운드 메모리 통합 시스템입니다: **light** (단기 자료 정렬/스테이징), **deep** (`MEMORY.md`에 내구성 있는 사실 승격), **REM** (반성 및 테마 표면화).

- `plugins.entries.memory-core.config.dreaming.enabled: true`로 활성화.
- 채팅에서 `/dreaming on|off`로 전환 (또는 `/dreaming status`로 검사).
- 드리밍은 하나의 관리되는 스윕 일정(`dreaming.frequency`)에서 실행되며 단계를 순서대로 실행: light, REM, deep.
- deep 단계만 `MEMORY.md`에 내구성 있는 메모리를 씁니다.
- 사람이 읽을 수 있는 단계 출력과 일기 항목은 `DREAMS.md` (또는 기존 `dreams.md`)에 쓰여지며, `memory/dreaming/<phase>/YYYY-MM-DD.md`에 선택적 단계별 보고서가 있습니다.
- 순위 지정은 가중 신호를 사용합니다: 회상 빈도, 검색 관련성, 쿼리 다양성, 시간적 최신성, 다일 간 통합, 파생 개념 풍부함.
- 승격은 `MEMORY.md`에 쓰기 전에 라이브 일일 노트를 다시 읽으므로 편집되거나 삭제된 단기 스니펫이 오래된 회상 저장소 스냅샷에서 승격되지 않습니다.
- 예약된 수동 `memory promote` 실행은 CLI 임계값 재정의를 전달하지 않는 한 동일한 딥 단계 기본값을 공유합니다.
- 자동 실행은 구성된 메모리 워크스페이스 전체에 걸쳐 팬아웃됩니다.

기본 예약:

- **스윕 간격**: `dreaming.frequency = 0 3 * * *`
- **딥 임계값**: `minScore=0.8`, `minRecallCount=3`, `minUniqueQueries=3`, `recencyHalfLifeDays=14`, `maxAgeDays=30`

예시:

```json
{
  "plugins": {
    "entries": {
      "memory-core": {
        "config": {
          "dreaming": {
            "enabled": true
          }
        }
      }
    }
  }
}
```

참고사항:

- `memory index --verbose`는 단계별 세부 정보를 출력합니다 (프로바이더, 모델, 소스, 배치 활동).
- `memory status`는 `memorySearch.extraPaths`를 통해 구성된 추가 경로를 포함합니다.
- 활성화된 메모리 원격 API 키 필드가 SecretRef로 구성된 경우 명령은 활성 게이트웨이 스냅샷에서 해당 값을 확인합니다. 게이트웨이를 사용할 수 없으면 명령이 빠르게 실패합니다.
- 게이트웨이 버전 불일치 참고: 이 명령 경로는 `secrets.resolve`를 지원하는 게이트웨이가 필요합니다; 이전 게이트웨이는 알 수 없는 메서드 오류를 반환합니다.
- `dreaming.frequency`로 예약된 스윕 간격을 조정하세요. 딥 승격 정책은 그렇지 않으면 내부입니다; 일회성 수동 재정의가 필요한 경우 `memory promote`에서 CLI 플래그를 사용하세요.
- `memory rem-harness --path <file-or-dir> --grounded`는 아무것도 쓰지 않고 역사적 일일 노트에서 접지된 `What Happened`, `Reflections`, `Possible Lasting Updates`를 미리 봅니다.
- `memory rem-backfill --path <file-or-dir>`는 UI 검토를 위해 `DREAMS.md`에 역전 가능한 접지된 일기 항목을 씁니다.
- `memory rem-backfill --path <file-or-dir> --stage-short-term`은 또한 일반 딥 단계가 순위를 매길 수 있도록 라이브 단기 승격 저장소에 접지된 내구성 후보를 시드합니다.
- `memory rem-backfill --rollback`은 이전에 쓰여진 접지된 일기 항목을 제거하고, `memory rem-backfill --rollback-short-term`은 이전에 스테이징된 접지된 단기 후보를 제거합니다.
- 전체 단계 설명 및 구성 참조는 [드리밍](/concepts/dreaming)을 참조하세요.
