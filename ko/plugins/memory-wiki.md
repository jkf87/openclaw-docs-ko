---
summary: "memory-wiki: 출처(provenance), 클레임(claim), 대시보드, bridge 모드를 갖춘 컴파일된 지식 저장소"
read_when:
  - 일반 MEMORY.md 노트 이상의 지속적인 지식을 원할 때
  - 번들 memory-wiki 플러그인을 구성할 때
  - wiki_search, wiki_get, 또는 bridge 모드를 이해하고 싶을 때
title: "Memory wiki"
---

`memory-wiki`는 지속적인 memory를 컴파일된 지식 저장소(knowledge vault)로 변환하는 번들 플러그인입니다.

이것은 active memory 플러그인을 **대체하지 않습니다**. active memory 플러그인은 여전히 recall, promotion, indexing, dreaming을 담당합니다. `memory-wiki`는 그 옆에 위치하여 지속적인 지식을 결정론적 페이지, 구조화된 claim, 출처(provenance), 대시보드, 기계 판독 가능 다이제스트를 갖춘 탐색 가능한 wiki로 컴파일합니다.

memory가 Markdown 파일 더미보다는 유지 관리되는 지식 계층(knowledge layer)처럼 동작하기를 원할 때 사용하십시오.

## 추가되는 기능

- 결정론적 페이지 레이아웃을 가진 전용 wiki vault
- 단순 산문이 아닌 구조화된 claim 및 증거 메타데이터
- 페이지 수준의 출처(provenance), 신뢰도, 모순, 미해결 질문
- 에이전트/런타임 소비자를 위한 컴파일된 다이제스트
- Wiki 네이티브 search/get/apply/lint 도구
- active memory 플러그인에서 공개 artifact를 가져오는 선택적 bridge 모드
- 선택적 Obsidian 친화적 렌더 모드 및 CLI 통합

## memory와의 관계

분할을 다음과 같이 생각해 보십시오:

| 계층                                                              | 담당 영역                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Active memory 플러그인 (`memory-core`, QMD, Honcho 등)            | Recall, 의미 검색, promotion, dreaming, memory 런타임                                           |
| `memory-wiki`                                                     | 컴파일된 wiki 페이지, 출처가 풍부한 synthesis, 대시보드, wiki 전용 search/get/apply             |

active memory 플러그인이 공유 recall artifact를 노출하는 경우, OpenClaw는 `memory_search corpus=all`로 한 번에 두 계층 모두를 검색할 수 있습니다.

Wiki 전용 랭킹, 출처, 또는 직접 페이지 접근이 필요한 경우, wiki 네이티브 도구를 대신 사용하십시오.

## 권장 하이브리드 패턴

local-first 설정을 위한 강력한 기본값은 다음과 같습니다:

- recall 및 광범위한 의미 검색을 위한 active memory 백엔드로서 QMD
- 지속적이고 synthesize된 지식 페이지를 위한 `bridge` 모드의 `memory-wiki`

이 분할은 각 계층이 집중 상태를 유지하기 때문에 잘 작동합니다:

- QMD는 원시 노트, 세션 내보내기, 추가 컬렉션을 검색 가능하게 유지
- `memory-wiki`는 안정적인 엔티티, claim, 대시보드, 소스 페이지를 컴파일

실용적인 규칙:

- memory 전반에 걸쳐 한 번의 광범위한 recall 패스를 원할 때 `memory_search` 사용
- 출처를 인식하는 wiki 결과를 원할 때 `wiki_search` 및 `wiki_get` 사용
- 두 계층을 아우르는 공유 검색을 원할 때 `memory_search corpus=all` 사용

Bridge 모드가 내보낸 artifact를 0개로 보고하면, active memory 플러그인이 아직 공개 bridge 입력을 노출하지 않고 있는 것입니다. 먼저 `openclaw wiki doctor`를 실행한 다음, active memory 플러그인이 공개 artifact를 지원하는지 확인하십시오.

## Vault 모드

`memory-wiki`는 세 가지 vault 모드를 지원합니다:

### `isolated`

자체 vault, 자체 소스, `memory-core`에 대한 의존성 없음.

Wiki를 자체적으로 큐레이션된 지식 저장소로 만들고 싶을 때 사용하십시오.

### `bridge`

공개 플러그인 SDK 이음새(seam)를 통해 active memory 플러그인에서 공개 memory artifact와 memory 이벤트를 읽습니다.

Wiki가 비공개 플러그인 내부에 접근하지 않고 memory 플러그인의 내보낸 artifact를 컴파일하고 정리하기를 원할 때 사용하십시오.

Bridge 모드는 다음을 인덱싱할 수 있습니다:

- 내보낸 memory artifact
- dream 리포트
- 일일 노트
- memory root 파일
- memory 이벤트 로그

### `unsafe-local`

로컬 비공개 경로를 위한 동일 머신 명시적 escape hatch.

이 모드는 의도적으로 실험적이며 이식성이 없습니다. 신뢰 경계를 이해하고 있으며 bridge 모드가 제공할 수 없는 로컬 파일시스템 접근이 특별히 필요한 경우에만 사용하십시오.

## Vault 레이아웃

플러그인은 다음과 같이 vault를 초기화합니다:

```text
<vault>/
  AGENTS.md
  WIKI.md
  index.md
  inbox.md
  entities/
  concepts/
  syntheses/
  sources/
  reports/
  _attachments/
  _views/
  .openclaw-wiki/
```

관리되는 콘텐츠는 생성된 블록 내부에 유지됩니다. 사람이 작성한 노트 블록은 보존됩니다.

주요 페이지 그룹은 다음과 같습니다:

- 가져온 원시 자료와 bridge 기반 페이지를 위한 `sources/`
- 지속적인 사물, 사람, 시스템, 프로젝트, 객체를 위한 `entities/`
- 아이디어, 추상화, 패턴, 정책을 위한 `concepts/`
- 컴파일된 요약 및 유지 관리되는 롤업을 위한 `syntheses/`
- 생성된 대시보드를 위한 `reports/`

## 구조화된 claim 및 증거

페이지는 단순한 자유 형식 텍스트가 아닌 구조화된 `claims` 프런트매터를 담을 수 있습니다.

각 claim은 다음을 포함할 수 있습니다:

- `id`
- `text`
- `status`
- `confidence`
- `evidence[]`
- `updatedAt`

증거(evidence) 항목은 다음을 포함할 수 있습니다:

- `sourceId`
- `path`
- `lines`
- `weight`
- `note`
- `updatedAt`

이것이 wiki를 수동적인 노트 덤프가 아닌 신념(belief) 계층처럼 동작하게 만드는 요소입니다. Claim은 추적, 점수화, 이의 제기, 소스로의 해결이 가능합니다.

## Compile 파이프라인

Compile 단계는 wiki 페이지를 읽고, 요약을 정규화하고, 다음 아래에 안정적인 기계 친화적 artifact를 내보냅니다:

- `.openclaw-wiki/cache/agent-digest.json`
- `.openclaw-wiki/cache/claims.jsonl`

이러한 다이제스트는 에이전트와 런타임 코드가 Markdown 페이지를 스크레이프하지 않아도 되도록 존재합니다.

컴파일된 출력은 또한 다음을 지원합니다:

- search/get 플로우를 위한 1차 wiki 인덱싱
- claim id에서 소유 페이지로의 조회
- 압축된 프롬프트 보조 내용
- 리포트/대시보드 생성

## 대시보드 및 상태 리포트

`render.createDashboards`가 활성화되면, compile이 `reports/` 아래에 대시보드를 유지합니다.

내장 리포트는 다음과 같습니다:

- `reports/open-questions.md`
- `reports/contradictions.md`
- `reports/low-confidence.md`
- `reports/claim-health.md`
- `reports/stale-pages.md`

이러한 리포트는 다음과 같은 것들을 추적합니다:

- 모순 노트 클러스터
- 경쟁하는 claim 클러스터
- 구조화된 증거가 없는 claim
- 신뢰도가 낮은 페이지 및 claim
- 오래되었거나 최신성이 알려지지 않은 것
- 미해결 질문이 있는 페이지

## 검색 및 조회

`memory-wiki`는 두 가지 검색 백엔드를 지원합니다:

- `shared`: 사용 가능할 때 공유 memory 검색 플로우 사용
- `local`: wiki를 로컬에서 검색

또한 세 가지 코퍼스를 지원합니다:

- `wiki`
- `memory`
- `all`

중요한 동작:

- `wiki_search`와 `wiki_get`은 가능할 때 컴파일된 다이제스트를 1차 패스로 사용합니다
- claim id는 소유 페이지로 해결될 수 있습니다
- 논쟁 중/오래된/신선한 claim이 랭킹에 영향을 미칩니다
- 출처(provenance) 레이블이 결과까지 전달될 수 있습니다

실용적인 규칙:

- 한 번의 광범위한 recall 패스를 위해서는 `memory_search corpus=all` 사용
- wiki 전용 랭킹, 출처, 페이지 수준 신념 구조에 신경 쓸 때는 `wiki_search` + `wiki_get` 사용

## 에이전트 도구

플러그인은 다음 도구를 등록합니다:

- `wiki_status`
- `wiki_search`
- `wiki_get`
- `wiki_apply`
- `wiki_lint`

각각의 역할:

- `wiki_status`: 현재 vault 모드, 상태, Obsidian CLI 가용성
- `wiki_search`: wiki 페이지를 검색하고, 구성된 경우 공유 memory 코퍼스도 검색
- `wiki_get`: id/경로로 wiki 페이지를 읽거나 공유 memory 코퍼스로 폴백
- `wiki_apply`: 자유 형식 페이지 수술 없이 좁은 synthesis/메타데이터 변경
- `wiki_lint`: 구조 확인, 출처 누락, 모순, 미해결 질문

플러그인은 또한 비배타적 memory 코퍼스 보조 내용을 등록하므로, active memory 플러그인이 코퍼스 선택을 지원할 때 공유 `memory_search`와 `memory_get`이 wiki에 도달할 수 있습니다.

## 프롬프트 및 컨텍스트 동작

`context.includeCompiledDigestPrompt`가 활성화되면, memory 프롬프트 섹션이 `agent-digest.json`의 간결한 컴파일된 스냅샷을 추가합니다.

해당 스냅샷은 의도적으로 작고 신호 밀도가 높습니다:

- 상위 페이지만
- 상위 claim만
- 모순 수
- 질문 수
- 신뢰도/신선도 한정자

이것은 프롬프트 형태를 변경하고 주로 memory 보조 내용을 명시적으로 소비하는 컨텍스트 엔진이나 레거시 프롬프트 조립에 유용하기 때문에 opt-in입니다.

## 구성

구성을 `plugins.entries.memory-wiki.config` 아래에 두십시오:

```json5
{
  plugins: {
    entries: {
      "memory-wiki": {
        enabled: true,
        config: {
          vaultMode: "isolated",
          vault: {
            path: "~/.openclaw/wiki/main",
            renderMode: "obsidian",
          },
          obsidian: {
            enabled: true,
            useOfficialCli: true,
            vaultName: "OpenClaw Wiki",
            openAfterWrites: false,
          },
          bridge: {
            enabled: false,
            readMemoryArtifacts: true,
            indexDreamReports: true,
            indexDailyNotes: true,
            indexMemoryRoot: true,
            followMemoryEvents: true,
          },
          ingest: {
            autoCompile: true,
            maxConcurrentJobs: 1,
            allowUrlIngest: true,
          },
          search: {
            backend: "shared",
            corpus: "wiki",
          },
          context: {
            includeCompiledDigestPrompt: false,
          },
          render: {
            preserveHumanBlocks: true,
            createBacklinks: true,
            createDashboards: true,
          },
        },
      },
    },
  },
}
```

주요 토글:

- `vaultMode`: `isolated`, `bridge`, `unsafe-local`
- `vault.renderMode`: `native` 또는 `obsidian`
- `bridge.readMemoryArtifacts`: active memory 플러그인 공개 artifact 가져오기
- `bridge.followMemoryEvents`: bridge 모드에서 이벤트 로그 포함
- `search.backend`: `shared` 또는 `local`
- `search.corpus`: `wiki`, `memory`, 또는 `all`
- `context.includeCompiledDigestPrompt`: memory 프롬프트 섹션에 간결한 다이제스트 스냅샷 추가
- `render.createBacklinks`: 결정론적 관련 블록 생성
- `render.createDashboards`: 대시보드 페이지 생성

### 예시: QMD + bridge 모드

recall에는 QMD를, 유지 관리되는 지식 계층에는 `memory-wiki`를 사용하고 싶을 때 이것을 사용하십시오:

```json5
{
  memory: {
    backend: "qmd",
      "memory-wiki": {
        enabled: true,
        config: {
          vaultMode: "bridge",
          bridge: {
            enabled: true,
            readMemoryArtifacts: true,
            indexDreamReports: true,
            indexDailyNotes: true,
            indexMemoryRoot: true,
            followMemoryEvents: true,
          },
          search: {
            backend: "shared",
            corpus: "all",
          },
          context: {
            includeCompiledDigestPrompt: false,
          },
        },
      },
    },
  },
}
```

이것은 다음을 유지합니다:

- active memory recall을 담당하는 QMD
- 컴파일된 페이지 및 대시보드에 집중하는 `memory-wiki`
- 컴파일된 다이제스트 프롬프트를 의도적으로 활성화할 때까지 변경되지 않는 프롬프트 형태

## CLI

`memory-wiki`는 또한 최상위 CLI 표면도 노출합니다:

```bash
openclaw wiki status
openclaw wiki doctor
openclaw wiki init
openclaw wiki ingest ./notes/alpha.md
openclaw wiki compile
openclaw wiki lint
openclaw wiki search "alpha"
openclaw wiki get entity.alpha
openclaw wiki apply synthesis "Alpha Summary" --body "..." --source-id source.alpha
openclaw wiki bridge import
openclaw wiki obsidian status
```

전체 명령 레퍼런스는 [CLI: wiki](/cli/wiki)를 참조하십시오.

## Obsidian 지원

`vault.renderMode`가 `obsidian`일 때, 플러그인은 Obsidian 친화적 Markdown을 작성하며 선택적으로 공식 `obsidian` CLI를 사용할 수 있습니다.

지원되는 워크플로우는 다음과 같습니다:

- 상태 탐색
- vault 검색
- 페이지 열기
- Obsidian 명령 호출
- 일일 노트로 점프

이것은 선택 사항입니다. Wiki는 Obsidian 없이 네이티브 모드에서도 여전히 작동합니다.

## 권장 워크플로우

1. recall/promotion/dreaming을 위한 active memory 플러그인을 유지합니다.
2. `memory-wiki`를 활성화합니다.
3. 명시적으로 bridge 모드를 원하지 않는 한 `isolated` 모드로 시작합니다.
4. 출처가 중요할 때 `wiki_search` / `wiki_get`을 사용합니다.
5. 좁은 synthesis 또는 메타데이터 업데이트에는 `wiki_apply`를 사용합니다.
6. 의미 있는 변경 후에는 `wiki_lint`를 실행합니다.
7. 오래된 내용/모순 가시성을 원하면 대시보드를 켭니다.

## 관련 문서

- [Memory 개요](/concepts/memory)
- [CLI: memory](/cli/memory)
- [CLI: wiki](/cli/wiki)
- [플러그인 SDK 개요](/plugins/sdk-overview)
