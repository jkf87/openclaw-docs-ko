---
summary: "OpenClaw가 세션 간에 정보를 기억하는 방식"
title: "Memory 개요"
read_when:
  - memory가 어떻게 동작하는지 이해하고 싶을 때
  - 어떤 memory 파일을 작성해야 하는지 알고 싶을 때
---

OpenClaw는 에이전트의 워크스페이스에 **평범한 Markdown 파일**을 기록하는 방식으로
정보를 기억합니다. 모델은 디스크에 저장된 내용만 "기억"하며, 숨겨진 상태는
없습니다.

## 동작 방식

에이전트에는 memory 관련 세 가지 파일이 있습니다.

- **`MEMORY.md`** -- 장기 memory. 지속적인 사실, 선호, 결정 사항을 담습니다.
  모든 DM 세션 시작 시 자동으로 로드됩니다.
- **`memory/YYYY-MM-DD.md`** -- 일일 노트. 진행 중인 맥락과 관찰 내용을 기록합니다.
  오늘과 어제의 노트가 자동으로 로드됩니다.
- **`DREAMS.md`** (선택 사항) -- 사람이 검토할 수 있는 Dream Diary와 dreaming
  sweep 요약이 담깁니다. grounded historical backfill 항목도 포함됩니다.

이 파일들은 에이전트 워크스페이스(기본값: `~/.openclaw/workspace`)에 있습니다.

<Tip>
에이전트가 어떤 내용을 기억했으면 한다면, 그냥 "내가 TypeScript를 선호한다는 걸
기억해줘"라고 말씀하시면 됩니다. 적절한 파일에 알아서 기록해줍니다.
</Tip>

## Memory 도구

에이전트는 memory를 다루기 위한 두 가지 도구를 가지고 있습니다.

- **`memory_search`** -- 원래 문구와 표현이 달라도 의미 기반 검색으로 관련 노트를
  찾아냅니다.
- **`memory_get`** -- 특정 memory 파일이나 라인 범위를 읽습니다.

두 도구 모두 활성화된 memory 플러그인(기본값: `memory-core`)이 제공합니다.

## Memory Wiki 동반 플러그인

지속 memory가 원시 노트 수준을 넘어 관리되는 지식 베이스처럼 동작하길 원한다면,
번들로 제공되는 `memory-wiki` 플러그인을 사용하세요.

`memory-wiki`는 지속 지식을 wiki 저장소로 컴파일하며, 다음 기능을 제공합니다.

- 결정적(deterministic) 페이지 구조
- 구조화된 주장(claim)과 근거(evidence)
- 모순(contradiction)과 최신성(freshness) 추적
- 생성된 대시보드
- 에이전트/런타임 소비자를 위한 컴파일된 digest
- `wiki_search`, `wiki_get`, `wiki_apply`, `wiki_lint` 같은 wiki 전용 도구

이것은 활성 memory 플러그인을 대체하지 않습니다. 활성 memory 플러그인이 여전히
recall, promotion, dreaming을 담당하며, `memory-wiki`는 그 옆에 provenance가
풍부한 지식 계층을 추가합니다.

[Memory Wiki](/plugins/memory-wiki)를 참고하세요.

## Memory 검색

embedding 제공자가 설정되어 있으면, `memory_search`는 **hybrid search**를
사용합니다. 벡터 유사도(의미)와 키워드 매칭(ID나 코드 기호 같은 정확한 용어)을
결합한 방식입니다. 지원되는 제공자의 API 키가 있다면 추가 설정 없이도 바로
동작합니다.

<Info>
OpenClaw는 사용 가능한 API 키를 기반으로 embedding 제공자를 자동 감지합니다.
OpenAI, Gemini, Voyage, Mistral 키 중 하나가 설정되어 있다면 memory 검색이
자동으로 활성화됩니다.
</Info>

검색 동작 방식, 튜닝 옵션, 제공자 설정에 대한 자세한 내용은
[Memory Search](/concepts/memory-search)를 참고하세요.

## Memory 백엔드

<CardGroup cols={3}>
<Card title="Builtin (기본값)" icon="database" href="/concepts/memory-builtin">
SQLite 기반. 키워드 검색, 벡터 유사도, hybrid search가 바로 동작합니다. 추가
의존성이 없습니다.
</Card>
<Card title="QMD" icon="search" href="/concepts/memory-qmd">
reranking, query expansion, 워크스페이스 바깥 디렉토리 인덱싱 기능을 갖춘
local-first 사이드카입니다.
</Card>
<Card title="Honcho" icon="brain" href="/concepts/memory-honcho">
사용자 모델링, 의미 검색, 멀티 에이전트 인지 기능을 갖춘 AI 네이티브 크로스
세션 memory입니다. 플러그인 방식으로 설치합니다.
</Card>
</CardGroup>

## Knowledge wiki 계층

<CardGroup cols={1}>
<Card title="Memory Wiki" icon="book" href="/plugins/memory-wiki">
지속 memory를 provenance가 풍부한 wiki 저장소로 컴파일합니다. claim, 대시보드,
bridge mode, Obsidian 친화 워크플로우를 제공합니다.
</Card>
</CardGroup>

## 자동 memory flush

[compaction](/concepts/compaction)이 대화를 요약하기 전에, OpenClaw는 에이전트에게
중요한 맥락을 memory 파일에 저장하라고 상기시키는 조용한 턴(silent turn)을
실행합니다. 이 기능은 기본 활성화되어 있으며 별도 설정이 필요 없습니다.

<Tip>
memory flush는 compaction 과정에서 맥락이 손실되는 것을 방지합니다. 대화 중에
아직 파일로 저장되지 않은 중요한 사실이 있다면, 요약이 일어나기 전에 자동으로
저장됩니다.
</Tip>

## Dreaming

Dreaming은 memory의 선택적 백그라운드 통합 과정입니다. 단기 신호를 수집하고,
후보를 점수화한 뒤, 기준을 통과한 항목만 장기 memory(`MEMORY.md`)로 승격합니다.

장기 memory의 신호 밀도를 높게 유지하도록 설계되어 있습니다.

- **Opt-in**: 기본 비활성화.
- **Scheduled**: 활성화되면 `memory-core`가 전체 dreaming sweep을 위한 반복 cron
  작업 하나를 자동 관리합니다.
- **Thresholded**: 승격은 score, recall 빈도, 쿼리 다양성 게이트를 통과해야
  합니다.
- **Reviewable**: phase 요약과 diary 항목이 사람이 검토할 수 있도록
  `DREAMS.md`에 기록됩니다.

phase 동작, 점수화 신호, Dream Diary 세부 사항은
[Dreaming](/concepts/dreaming)을 참고하세요.

## Grounded backfill과 live promotion

dreaming 시스템에는 이제 긴밀하게 연관된 두 가지 리뷰 레인이 있습니다.

- **Live dreaming**은 `memory/.dreams/` 아래의 단기 dreaming 저장소에서 동작하며,
  일반 deep phase가 `MEMORY.md`로 graduate할 대상을 결정할 때 사용하는 방식입니다.
- **Grounded backfill**은 과거 `memory/YYYY-MM-DD.md` 노트를 독립 day 파일로 읽고,
  구조화된 리뷰 출력을 `DREAMS.md`에 기록합니다.

Grounded backfill은 `MEMORY.md`를 수동으로 편집하지 않고 오래된 노트를 재생하며
시스템이 무엇을 지속(durable) 항목으로 판단하는지 점검하고 싶을 때 유용합니다.

다음을 실행하면,

```bash
openclaw memory rem-backfill --path ./memory --stage-short-term
```

grounded durable 후보는 바로 승격되지 않습니다. 일반 deep phase가 이미 사용하는
동일한 단기 dreaming 저장소에 스테이징됩니다. 즉,

- `DREAMS.md`는 사람이 검토하는 surface로 유지됩니다.
- 단기 저장소는 기계가 사용하는 ranking surface로 유지됩니다.
- `MEMORY.md`는 여전히 deep promotion을 통해서만 기록됩니다.

재생이 유용하지 않았다고 판단되면, 일반 diary 항목이나 일반 recall 상태를 건드리지
않고 스테이징된 아티팩트를 제거할 수 있습니다.

```bash
openclaw memory rem-backfill --rollback
openclaw memory rem-backfill --rollback-short-term
```

## CLI

```bash
openclaw memory status          # Check index status and provider
openclaw memory search "query"  # Search from the command line
openclaw memory index --force   # Rebuild the index
```

## 더 읽어보기

- [Builtin Memory Engine](/concepts/memory-builtin) -- 기본 SQLite 백엔드
- [QMD Memory Engine](/concepts/memory-qmd) -- 고급 local-first 사이드카
- [Honcho Memory](/concepts/memory-honcho) -- AI 네이티브 크로스 세션 memory
- [Memory Wiki](/plugins/memory-wiki) -- 컴파일된 지식 저장소와 wiki 네이티브 도구
- [Memory Search](/concepts/memory-search) -- 검색 파이프라인, 제공자, 튜닝
- [Dreaming](/concepts/dreaming) -- 단기 recall에서 장기 memory로의 백그라운드
  promotion
- [Memory 설정 레퍼런스](/reference/memory-config) -- 모든 설정 옵션
- [Compaction](/concepts/compaction) -- compaction과 memory의 상호작용

## 관련 문서

- [Active memory](/concepts/active-memory)
- [Memory search](/concepts/memory-search)
- [Builtin memory engine](/concepts/memory-builtin)
- [Honcho memory](/concepts/memory-honcho)
