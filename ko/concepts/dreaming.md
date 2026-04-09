---
title: "드리밍 (실험적)"
summary: "라이트, 딥, REM 단계와 Dream Diary를 포함한 백그라운드 메모리 통합"
read_when:
  - 메모리 승격이 자동으로 실행되길 원할 때
  - 각 드리밍 단계가 무엇을 하는지 이해하려는 경우
  - MEMORY.md를 오염시키지 않고 통합을 조정하려는 경우
---

# 드리밍 (실험적)

드리밍은 `memory-core`의 백그라운드 메모리 통합 시스템입니다. OpenClaw가 강한 단기 신호를 내구성 있는 메모리로 이동시키는 동시에 프로세스를 설명 가능하고 검토 가능하게 유지하는 데 도움을 줍니다.

드리밍은 **옵트인**이며 기본적으로 비활성화되어 있습니다.

## 드리밍이 쓰는 것

드리밍은 두 종류의 출력을 유지합니다:

- `memory/.dreams/`의 **머신 상태** (회상 저장소, 단계 신호, 수집 체크포인트, 잠금).
- `DREAMS.md` (또는 기존 `dreams.md`) 및 `memory/dreaming/<phase>/YYYY-MM-DD.md` 아래의 선택적 단계 보고서 파일의 **사람이 읽을 수 있는 출력**.

장기 승격은 여전히 `MEMORY.md`에만 씁니다.

## 단계 모델

드리밍은 세 가지 협력 단계를 사용합니다:

| 단계  | 목적                                      | 내구성 쓰기        |
| ----- | ----------------------------------------- | ------------------ |
| 라이트 | 최근 단기 자료를 정렬하고 준비합니다      | 아니오             |
| 딥    | 내구성 후보를 점수화하고 승격합니다       | 예 (`MEMORY.md`)   |
| REM   | 테마와 반복 아이디어를 반영합니다         | 아니오             |

이 단계들은 내부 구현 세부사항이며, 별도의 사용자 구성 "모드"가 아닙니다.

### 라이트 단계

라이트 단계는 최근 일별 메모리 신호와 회상 추적을 수집하고, 중복을 제거하고, 후보 라인을 준비합니다.

- 단기 회상 상태, 최근 일별 메모리 파일, 사용 가능한 경우 수정된 세션 트랜스크립트에서 읽습니다.
- 저장소가 인라인 출력을 포함할 때 관리되는 `## Light Sleep` 블록을 씁니다.
- 나중의 딥 순위를 위한 강화 신호를 기록합니다.
- `MEMORY.md`에 절대 쓰지 않습니다.

### 딥 단계

딥 단계는 장기 메모리가 될 것을 결정합니다.

- 가중 점수화 및 임계값 게이트를 사용하여 후보를 순위 매깁니다.
- `minScore`, `minRecallCount`, 및 `minUniqueQueries`가 통과해야 합니다.
- 쓰기 전에 라이브 일별 파일에서 스니펫을 재수화하여 오래되거나 삭제된 스니펫을 건너뜁니다.
- 승격된 항목을 `MEMORY.md`에 추가합니다.
- `DREAMS.md`에 `## Deep Sleep` 요약을 쓰고 선택적으로 `memory/dreaming/deep/YYYY-MM-DD.md`를 씁니다.

### REM 단계

REM 단계는 패턴과 반사 신호를 추출합니다.

- 최근 단기 추적에서 테마와 반사 요약을 빌드합니다.
- 저장소가 인라인 출력을 포함할 때 관리되는 `## REM Sleep` 블록을 씁니다.
- 딥 순위에 사용되는 REM 강화 신호를 기록합니다.
- `MEMORY.md`에 절대 쓰지 않습니다.

## 세션 트랜스크립트 수집

드리밍은 수정된 세션 트랜스크립트를 드리밍 코퍼스에 수집할 수 있습니다. 트랜스크립트를 사용할 수 있는 경우, 일별 메모리 신호 및 회상 추적과 함께 라이트 단계에 공급됩니다. 개인 및 민감한 콘텐츠는 수집 전에 수정됩니다.

## Dream Diary

드리밍은 또한 `DREAMS.md`에 내러티브 **Dream Diary**를 유지합니다. 각 단계에 충분한 자료가 축적된 후, `memory-core`는 최선 노력 백그라운드 서브에이전트 턴 (기본 런타임 모델 사용)을 실행하고 짧은 일기 항목을 추가합니다.

이 일기는 Dreams UI에서 사람이 읽기 위한 것이며, 승격 소스가 아닙니다.

기록 검토 및 복구 작업을 위한 기반 히스토리 백필 레인도 있습니다:

- `memory rem-harness --path ... --grounded`는 히스토리 `YYYY-MM-DD.md` 메모에서 기반 일기 출력을 미리 봅니다.
- `memory rem-backfill --path ...`는 가역적인 기반 일기 항목을 `DREAMS.md`에 씁니다.
- `memory rem-backfill --path ... --stage-short-term`은 기반 내구성 후보를 일반 딥 단계가 이미 사용하는 동일한 단기 증거 저장소에 준비합니다.
- `memory rem-backfill --rollback` 및 `--rollback-short-term`은 일반 일기 항목이나 라이브 단기 회상에 영향을 주지 않고 해당 백필 아티팩트를 제거합니다.

제어 UI는 Dreams 장면에서 결과를 검사한 후 기반 후보가 승격을 받을 자격이 있는지 결정할 수 있도록 동일한 일기 백필/재설정 흐름을 노출합니다. 장면은 또한 별도의 기반 레인을 표시하여 어떤 준비된 단기 항목이 히스토리 재생에서 왔는지, 어떤 승격된 항목이 기반 주도였는지 볼 수 있게 하며, 일반 라이브 단기 상태를 건드리지 않고 기반 전용 준비 항목만 지울 수 있게 합니다.

## 딥 순위 신호

딥 순위는 단계 강화와 함께 6개의 가중 기본 신호를 사용합니다:

| 신호              | 가중치 | 설명                                              |
| ----------------- | ------ | ------------------------------------------------- |
| 빈도              | 0.24   | 항목이 누적한 단기 신호 수                        |
| 관련성            | 0.30   | 항목의 평균 검색 품질                             |
| 쿼리 다양성       | 0.15   | 항목을 표면화한 고유 쿼리/일별 컨텍스트           |
| 최신성            | 0.15   | 시간 감쇠된 신선도 점수                           |
| 통합              | 0.10   | 다일별 재발 강도                                  |
| 개념적 풍부함     | 0.06   | 스니펫/경로에서 개념 태그 밀도                    |

라이트 및 REM 단계 히트는 `memory/.dreams/phase-signals.json`에서 작은 최신성 감쇠 부스트를 추가합니다.

## 스케줄링

활성화되면 `memory-core`는 완전한 드리밍 스윕을 위해 하나의 크론 잡을 자동 관리합니다. 각 스윕은 순서대로 단계를 실행합니다: light -> REM -> deep.

기본 케이던스 동작:

| 설정                 | 기본값      |
| -------------------- | ----------- |
| `dreaming.frequency` | `0 3 * * *` |

## 빠른 시작

드리밍 활성화:

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

사용자 지정 스윕 케이던스로 드리밍 활성화:

```json
{
  "plugins": {
    "entries": {
      "memory-core": {
        "config": {
          "dreaming": {
            "enabled": true,
            "timezone": "America/Los_Angeles",
            "frequency": "0 */6 * * *"
          }
        }
      }
    }
  }
}
```

## 슬래시 커맨드

```
/dreaming status
/dreaming on
/dreaming off
/dreaming help
```

## CLI 워크플로우

미리 보기 또는 수동 적용을 위해 CLI 승격을 사용하십시오:

```bash
openclaw memory promote
openclaw memory promote --apply
openclaw memory promote --limit 5
openclaw memory status --deep
```

수동 `memory promote`는 CLI 플래그로 오버라이드하지 않는 한 기본적으로 딥 단계 임계값을 사용합니다.

특정 후보가 승격되거나 승격되지 않을 이유를 설명:

```bash
openclaw memory promote-explain "router vlan"
openclaw memory promote-explain "router vlan" --json
```

아무것도 쓰지 않고 REM 반사, 후보 진실, 딥 승격 출력을 미리 보기:

```bash
openclaw memory rem-harness
openclaw memory rem-harness --json
```

## 주요 기본값

모든 설정은 `plugins.entries.memory-core.config.dreaming` 아래에 있습니다.

| 키          | 기본값      |
| ----------- | ----------- |
| `enabled`   | `false`     |
| `frequency` | `0 3 * * *` |

단계 정책, 임계값, 저장소 동작은 내부 구현 세부사항입니다 (사용자 대면 구성이 아님).

전체 키 목록은 [메모리 구성 참조](/reference/memory-config#dreaming-experimental)를 참조하십시오.

## Dreams UI

활성화되면 게이트웨이 **Dreams** 탭에 다음이 표시됩니다:

- 현재 드리밍 활성화 상태
- 단계 수준 상태 및 관리 스윕 존재 여부
- 단기, 기반, 신호, 및 오늘 승격된 카운트
- 다음 예약 실행 시간
- 준비된 히스토리 재생 항목을 위한 별도의 기반 장면 레인
- `doctor.memory.dreamDiary`로 백업되는 확장 가능한 Dream Diary 리더

## 관련 항목

- [메모리](/concepts/memory)
- [메모리 검색](/concepts/memory-search)
- [memory CLI](/cli/memory)
- [메모리 구성 참조](/reference/memory-config)
