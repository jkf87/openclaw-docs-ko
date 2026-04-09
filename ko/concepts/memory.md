---
title: "메모리 개요"
summary: "OpenClaw가 세션 간에 것들을 기억하는 방법"
read_when:
  - 메모리 작동 방식을 이해하려는 경우
  - 어떤 메모리 파일에 써야 하는지 알고 싶을 때
---

# 메모리 개요

OpenClaw는 에이전트의 워크스페이스에 **일반 마크다운 파일**을 작성하여 것들을 기억합니다. 모델은 디스크에 저장된 것만 "기억합니다" -- 숨겨진 상태는 없습니다.

## 작동 방식

에이전트에는 메모리와 관련된 세 가지 파일이 있습니다:

- **`MEMORY.md`** -- 장기 메모리. 내구성 있는 사실, 선호도, 결정. 모든 DM 세션 시작 시 로드됩니다.
- **`memory/YYYY-MM-DD.md`** -- 일별 메모. 실행 중인 컨텍스트와 관찰. 오늘과 어제의 메모가 자동으로 로드됩니다.
- **`DREAMS.md`** (실험적, 선택적) -- Dream Diary 및 드리밍 스윕 요약 (기반 히스토리 백필 항목 포함)을 사람이 검토합니다.

이 파일들은 에이전트 워크스페이스 (기본값 `~/.openclaw/workspace`)에 있습니다.

<Tip>
에이전트가 무언가를 기억하기를 원하면 그냥 물어보십시오: "TypeScript를 선호한다는 것을 기억해." 에이전트가 적절한 파일에 씁니다.
</Tip>

## 메모리 도구

에이전트에는 메모리 작업을 위한 두 가지 도구가 있습니다:

- **`memory_search`** -- 표현이 원본과 다를 때도 시맨틱 검색을 사용하여 관련 메모를 찾습니다.
- **`memory_get`** -- 특정 메모리 파일 또는 라인 범위를 읽습니다.

두 도구 모두 활성 메모리 플러그인 (기본값: `memory-core`)이 제공합니다.

## 메모리 위키 컴패니언 플러그인

내구성 있는 메모리가 원시 메모보다 유지 관리되는 지식 베이스처럼 동작하기를 원한다면 번들된 `memory-wiki` 플러그인을 사용하십시오.

`memory-wiki`는 내구성 있는 지식을 다음과 같은 위키 볼트로 컴파일합니다:

- 결정론적 페이지 구조
- 구조화된 주장 및 증거
- 모순 및 신선도 추적
- 생성된 대시보드
- 에이전트/런타임 소비자를 위한 컴파일된 요약
- `wiki_search`, `wiki_get`, `wiki_apply`, `wiki_lint` 같은 위키 네이티브 도구

이는 활성 메모리 플러그인을 대체하지 않습니다. 활성 메모리 플러그인은 여전히 회상, 승격, 드리밍을 소유합니다. `memory-wiki`는 옆에 출처가 풍부한 지식 레이어를 추가합니다.

[메모리 위키](/plugins/memory-wiki)를 참조하십시오.

## 메모리 검색

임베딩 프로바이더가 구성된 경우, `memory_search`는 **하이브리드 검색** -- 벡터 유사성 (시맨틱 의미)과 키워드 매칭 (ID 및 코드 기호 같은 정확한 용어)을 결합 -- 을 사용합니다. 지원되는 프로바이더의 API 키가 있으면 즉시 작동합니다.

<Info>
OpenClaw는 사용 가능한 API 키에서 임베딩 프로바이더를 자동 감지합니다. OpenAI, Gemini, Voyage, 또는 Mistral 키가 구성되어 있으면 메모리 검색이 자동으로 활성화됩니다.
</Info>

검색 작동 방식, 조정 옵션, 프로바이더 설정은 [메모리 검색](/concepts/memory-search)을 참조하십시오.

## 메모리 백엔드

<CardGroup cols={3}>
<Card title="내장 (기본값)" icon="database" href="/concepts/memory-builtin">
SQLite 기반. 키워드 검색, 벡터 유사성, 하이브리드 검색으로 즉시 작동합니다. 추가 종속성 없습니다.
</Card>
<Card title="QMD" icon="search" href="/concepts/memory-qmd">
재순위화, 쿼리 확장, 워크스페이스 외부 디렉터리 인덱싱 기능이 있는 로컬 우선 사이드카.
</Card>
<Card title="Honcho" icon="brain" href="/concepts/memory-honcho">
사용자 모델링, 시맨틱 검색, 멀티 에이전트 인식이 있는 AI 네이티브 크로스 세션 메모리. 플러그인 설치 필요.
</Card>
</CardGroup>

## 지식 위키 레이어

<CardGroup cols={1}>
<Card title="메모리 위키" icon="book" href="/plugins/memory-wiki">
내구성 있는 메모리를 주장, 대시보드, 브리지 모드, Obsidian 친화적 워크플로우가 있는 출처 풍부한 위키 볼트로 컴파일합니다.
</Card>
</CardGroup>

## 자동 메모리 플러시

[컴팩션](/concepts/compaction)이 대화를 요약하기 전에 OpenClaw는 에이전트에게 중요한 컨텍스트를 메모리 파일에 저장하도록 상기시키는 자동 턴을 실행합니다. 이는 기본적으로 켜져 있습니다 -- 아무것도 구성할 필요가 없습니다.

<Tip>
메모리 플러시는 컴팩션 중 컨텍스트 손실을 방지합니다. 에이전트가 아직 파일에 쓰지 않은 중요한 사실이 대화에 있다면, 요약이 발생하기 전에 자동으로 저장됩니다.
</Tip>

## 드리밍 (실험적)

드리밍은 메모리를 위한 선택적 백그라운드 통합 패스입니다. 단기 신호를 수집하고, 후보를 점수화하며, 자격을 갖춘 항목만 장기 메모리 (`MEMORY.md`)로 승격합니다.

장기 메모리를 고품질로 유지하도록 설계되었습니다:

- **옵트인**: 기본적으로 비활성화됨.
- **예약됨**: 활성화되면 `memory-core`가 전체 드리밍 스윕을 위한 하나의 반복 크론 잡을 자동 관리합니다.
- **임계값 적용**: 승격은 점수, 회상 빈도, 쿼리 다양성 게이트를 통과해야 합니다.
- **검토 가능**: 단계 요약 및 일기 항목이 사람이 검토할 수 있도록 `DREAMS.md`에 씁니다.

단계 동작, 점수화 신호, Dream Diary 세부사항은 [드리밍 (실험적)](/concepts/dreaming)을 참조하십시오.

## 기반 백필 및 라이브 승격

드리밍 시스템에는 이제 두 가지 밀접하게 관련된 검토 레인이 있습니다:

- **라이브 드리밍**은 `memory/.dreams/` 아래의 단기 드리밍 저장소에서 작동하며, 일반 딥 단계가 `MEMORY.md`로 졸업할 수 있는 것을 결정할 때 사용합니다.
- **기반 백필**은 히스토리 `memory/YYYY-MM-DD.md` 메모를 독립 실행형 일 파일로 읽고 구조화된 검토 출력을 `DREAMS.md`에 씁니다.

기반 백필은 `MEMORY.md`를 수동으로 편집하지 않고 오래된 메모를 재생하고 시스템이 내구성 있다고 생각하는 것을 검사하려는 경우에 유용합니다.

다음을 사용할 때:

```bash
openclaw memory rem-backfill --path ./memory --stage-short-term
```

기반 내구성 후보가 직접 승격되지 않습니다. 일반 딥 단계가 이미 사용하는 동일한 단기 드리밍 저장소에 준비됩니다. 이는 다음을 의미합니다:

- `DREAMS.md`는 사람이 검토하는 서피스로 유지됩니다.
- 단기 저장소는 머신 대면 순위 서피스로 유지됩니다.
- `MEMORY.md`는 여전히 딥 승격으로만 씁니다.

재생이 유용하지 않다고 결정하면 일반 일기 항목이나 일반 회상 상태를 건드리지 않고 준비된 아티팩트를 제거할 수 있습니다:

```bash
openclaw memory rem-backfill --rollback
openclaw memory rem-backfill --rollback-short-term
```

## CLI

```bash
openclaw memory status          # 인덱스 상태 및 프로바이더 확인
openclaw memory search "query"  # 커맨드 라인에서 검색
openclaw memory index --force   # 인덱스 재빌드
```

## 추가 읽기

- [내장 메모리 엔진](/concepts/memory-builtin) -- 기본 SQLite 백엔드
- [QMD 메모리 엔진](/concepts/memory-qmd) -- 고급 로컬 우선 사이드카
- [Honcho 메모리](/concepts/memory-honcho) -- AI 네이티브 크로스 세션 메모리
- [메모리 위키](/plugins/memory-wiki) -- 컴파일된 지식 볼트 및 위키 네이티브 도구
- [메모리 검색](/concepts/memory-search) -- 검색 파이프라인, 프로바이더, 조정
- [드리밍 (실험적)](/concepts/dreaming) -- 단기 회상에서 장기 메모리로 백그라운드 승격
- [메모리 구성 참조](/reference/memory-config) -- 모든 구성 설정
- [컴팩션](/concepts/compaction) -- 컴팩션이 메모리와 상호작용하는 방법
