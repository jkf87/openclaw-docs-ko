---
summary: "memory-wiki: 출처, 클레임, 대시보드, 브리지 모드를 갖춘 컴파일된 지식 저장소"
read_when:
  - 일반 MEMORY.md 노트 이상의 지속적인 지식이 필요할 때
  - 번들 memory-wiki 플러그인을 구성할 때
  - wiki_search, wiki_get, 또는 브리지 모드를 이해하고 싶을 때
title: "Memory Wiki"
---

# Memory Wiki

`memory-wiki`는 내구성 있는 메모리를 컴파일된 지식 저장소로 변환하는 번들 플러그인입니다.

활성 메모리 플러그인을 **대체하지 않습니다**. 활성 메모리 플러그인은 여전히
회수, 승격, 인덱싱, 및 드리밍을 소유합니다. `memory-wiki`는 그 옆에 위치하여
내구성 있는 지식을 결정론적 페이지, 구조화된 클레임, 출처, 대시보드, 및
기계 판독 가능 다이제스트가 있는 탐색 가능한 위키로 컴파일합니다.

메모리가 마크다운 파일 더미보다 유지 관리되는 지식 레이어처럼 동작하기를 원할 때
사용하십시오.

## 추가하는 것

- 결정론적 페이지 레이아웃이 있는 전용 위키 저장소
- 단순한 산문이 아닌 구조화된 클레임 및 증거 메타데이터
- 페이지 수준 출처, 신뢰도, 모순, 및 열린 질문
- 에이전트/런타임 소비자를 위한 컴파일된 다이제스트
- 위키 네이티브 검색/가져오기/적용/린트 도구
- 활성 메모리 플러그인에서 공개 아티팩트를 임포트하는 선택적 브리지 모드
- 선택적 Obsidian 친화적 렌더 모드 및 CLI 통합

## 메모리와의 관계

이 분리를 다음과 같이 생각하십시오:

| 레이어                                                   | 소유                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 활성 메모리 플러그인 (`memory-core`, QMD, Honcho 등)    | 회수, 시맨틱 검색, 승격, 드리밍, 메모리 런타임                                             |
| `memory-wiki`                                           | 컴파일된 위키 페이지, 출처가 풍부한 합성, 대시보드, 위키 전용 검색/가져오기/적용           |

활성 메모리 플러그인이 공유 회수 아티팩트를 노출하면, OpenClaw는 `memory_search corpus=all`로
한 번에 두 레이어를 검색할 수 있습니다.

위키 특유의 순위, 출처, 또는 직접 페이지 액세스가 필요할 때는
대신 위키 네이티브 도구를 사용하십시오.

## 저장소 모드

`memory-wiki`는 세 가지 저장소 모드를 지원합니다:

### `isolated`

자체 저장소, 자체 소스, `memory-core`에 대한 의존성 없음.

위키가 자체 큐레이션된 지식 저장소가 되길 원할 때 사용하십시오.

### `bridge`

공개 플러그인 SDK 이음새를 통해 활성 메모리 플러그인에서 공개 메모리 아티팩트 및
메모리 이벤트를 읽습니다.

위키가 비공개 플러그인 내부에 접근하지 않고 메모리 플러그인의 내보낸 아티팩트를
컴파일하고 구성하기를 원할 때 사용하십시오.

브리지 모드는 다음을 인덱싱할 수 있습니다:

- 내보낸 메모리 아티팩트
- 드림 보고서
- 일일 노트
- 메모리 루트 파일
- 메모리 이벤트 로그

### `unsafe-local`

로컬 비공개 경로를 위한 명시적 동일 머신 이스케이프 해치.

이 모드는 의도적으로 실험적이고 이식 불가능합니다. 신뢰 경계를 이해하고 브리지 모드가
제공할 수 없는 로컬 파일시스템 액세스가 특별히 필요할 때만 사용하십시오.

## 저장소 레이아웃

플러그인은 다음과 같이 저장소를 초기화합니다:

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

관리되는 콘텐츠는 생성된 블록 내에 유지됩니다. 사람 노트 블록은 보존됩니다.

주요 페이지 그룹은:

- `sources/` - 임포트된 원자료 및 브리지 기반 페이지
- `entities/` - 내구성 있는 사물, 사람, 시스템, 프로젝트, 객체
- `concepts/` - 아이디어, 추상화, 패턴, 정책
- `syntheses/` - 컴파일된 요약 및 유지 관리 롤업
- `reports/` - 생성된 대시보드

## 구조화된 클레임 및 증거

페이지는 자유 형식 텍스트뿐만 아니라 구조화된 `claims` 프런트매터를 가질 수 있습니다.

각 클레임은 다음을 포함할 수 있습니다:

- `id`
- `text`
- `status`
- `confidence`
- `evidence[]`
- `updatedAt`

증거 항목은 다음을 포함할 수 있습니다:

- `sourceId`
- `path`
- `lines`
- `weight`
- `note`
- `updatedAt`

이것이 위키가 수동적인 노트 덤프보다 믿음 레이어처럼 동작하게 만드는 것입니다.
클레임을 추적, 점수 매기기, 이의 제기, 소스로 소급할 수 있습니다.

## 컴파일 파이프라인

컴파일 단계는 위키 페이지를 읽고, 요약을 정규화하고, 다음에 안정적인
기계 대면 아티팩트를 내보냅니다:

- `.openclaw-wiki/cache/agent-digest.json`
- `.openclaw-wiki/cache/claims.jsonl`

이러한 다이제스트는 에이전트 및 런타임 코드가 마크다운 페이지를 스크랩할 필요가
없도록 존재합니다.

컴파일된 출력은 또한 다음을 구동합니다:

- 검색/가져오기 흐름을 위한 첫 번째 패스 위키 인덱싱
- 소유 페이지로 클레임 id 조회 소급
- 압축 프롬프트 보충
- 보고서/대시보드 생성

## 대시보드 및 건강 보고서

`render.createDashboards`가 활성화되면 컴파일은 `reports/` 아래에 대시보드를 유지합니다.

내장 보고서에는 다음이 포함됩니다:

- `reports/open-questions.md`
- `reports/contradictions.md`
- `reports/low-confidence.md`
- `reports/claim-health.md`
- `reports/stale-pages.md`

이 보고서는 다음과 같은 것을 추적합니다:

- 모순 노트 클러스터
- 경쟁 클레임 클러스터
- 구조화된 증거가 없는 클레임
- 낮은 신뢰도 페이지 및 클레임
- 오래되거나 알 수 없는 신선도
- 미해결 질문이 있는 페이지

## 검색 및 검색

`memory-wiki`는 두 가지 검색 백엔드를 지원합니다:

- `shared`: 사용 가능한 경우 공유 메모리 검색 흐름 사용
- `local`: 위키를 로컬에서 검색

세 가지 코퍼스도 지원합니다:

- `wiki`
- `memory`
- `all`

중요한 동작:

- `wiki_search` 및 `wiki_get`은 가능할 때 컴파일된 다이제스트를 첫 번째 패스로 사용합니다
- 클레임 id는 소유 페이지로 소급할 수 있습니다
- 이의가 제기된/오래된/신선한 클레임은 순위에 영향을 줍니다
- 출처 레이블은 결과에 남을 수 있습니다

실용적 규칙:

- 하나의 광범위한 회수 패스에는 `memory_search corpus=all` 사용
- 위키 특유의 순위, 출처, 또는 페이지 수준 믿음 구조가 필요할 때는 `wiki_search` + `wiki_get` 사용

## 에이전트 도구

플러그인은 다음 도구를 등록합니다:

- `wiki_status`
- `wiki_search`
- `wiki_get`
- `wiki_apply`
- `wiki_lint`

역할:

- `wiki_status`: 현재 저장소 모드, 건강, Obsidian CLI 가용성
- `wiki_search`: 위키 페이지 검색 및 구성된 경우 공유 메모리 코퍼스 검색
- `wiki_get`: id/경로로 위키 페이지 읽거나 공유 메모리 코퍼스로 폴백
- `wiki_apply`: 자유 형식 페이지 수술 없이 좁은 합성/메타데이터 변형
- `wiki_lint`: 구조적 검사, 출처 공백, 모순, 열린 질문

플러그인은 또한 비독점 메모리 코퍼스 보충을 등록하여 활성 메모리 플러그인이
코퍼스 선택을 지원할 때 공유 `memory_search` 및 `memory_get`이 위키에 도달할 수 있게 합니다.

## 프롬프트 및 컨텍스트 동작

`context.includeCompiledDigestPrompt`가 활성화되면, 메모리 프롬프트 섹션은
`agent-digest.json`에서 압축된 컴파일 스냅샷을 추가합니다.

해당 스냅샷은 의도적으로 작고 높은 신호입니다:

- 상위 페이지만
- 상위 클레임만
- 모순 수
- 질문 수
- 신뢰도/신선도 한정어

이것은 프롬프트 형태를 변경하고 주로 메모리 보충을 명시적으로 소비하는
컨텍스트 엔진 또는 레거시 프롬프트 어셈블리에 유용하기 때문에 옵트인입니다.

## 구성

`plugins.entries.memory-wiki.config` 아래에 구성을 넣으십시오:

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
- `bridge.readMemoryArtifacts`: 활성 메모리 플러그인 공개 아티팩트 임포트
- `bridge.followMemoryEvents`: 브리지 모드에 이벤트 로그 포함
- `search.backend`: `shared` 또는 `local`
- `search.corpus`: `wiki`, `memory`, 또는 `all`
- `context.includeCompiledDigestPrompt`: 메모리 프롬프트 섹션에 압축 다이제스트 스냅샷 추가
- `render.createBacklinks`: 결정론적 관련 블록 생성
- `render.createDashboards`: 대시보드 페이지 생성

## CLI

`memory-wiki`는 최상위 CLI 표면도 노출합니다:

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

전체 명령 참조는 [CLI: wiki](/cli/wiki)를 참조하십시오.

## Obsidian 지원

`vault.renderMode`가 `obsidian`이면, 플러그인은 Obsidian 친화적 마크다운을 작성하고
선택적으로 공식 `obsidian` CLI를 사용할 수 있습니다.

지원되는 워크플로우에는 다음이 포함됩니다:

- 상태 프로빙
- 저장소 검색
- 페이지 열기
- Obsidian 명령 호출
- 일일 노트로 이동

이것은 선택 사항입니다. 위키는 Obsidian 없이 네이티브 모드에서도 작동합니다.

## 권장 워크플로우

1. 회수/승격/드리밍을 위한 활성 메모리 플러그인을 유지하십시오.
2. `memory-wiki`를 활성화하십시오.
3. 브리지 모드를 명시적으로 원하지 않는 한 `isolated` 모드로 시작하십시오.
4. 출처가 중요할 때 `wiki_search` / `wiki_get`을 사용하십시오.
5. 좁은 합성 또는 메타데이터 업데이트에는 `wiki_apply`를 사용하십시오.
6. 의미 있는 변경 후 `wiki_lint`를 실행하십시오.
7. 오래되거나 모순된 가시성을 원하면 대시보드를 켜십시오.

## 관련 문서

- [메모리 개요](/concepts/memory)
- [CLI: memory](/cli/memory)
- [CLI: wiki](/cli/wiki)
- [플러그인 SDK 개요](/plugins/sdk-overview)
