---
summary: "`openclaw wiki`에 대한 CLI 참조 (메모리 위키 보관소 status, search, compile, lint, apply, bridge, Obsidian 도우미)"
read_when:
  - 메모리 위키 CLI를 사용하려는 경우
  - `openclaw wiki`를 문서화하거나 변경하는 경우
title: "wiki"
---

# `openclaw wiki`

`memory-wiki` 보관소를 검사하고 유지합니다.

번들 `memory-wiki` 플러그인에 의해 제공됩니다.

관련:

- [메모리 위키 플러그인](/plugins/memory-wiki)
- [메모리 개요](/concepts/memory)
- [CLI: memory](/cli/memory)

## 사용 목적

다음이 포함된 컴파일된 지식 보관소를 원할 때 `openclaw wiki`를 사용하세요:

- 위키 네이티브 검색 및 페이지 읽기
- 출처가 풍부한 합성
- 모순 및 신선도 보고서
- 활성 메모리 플러그인의 브리지 가져오기
- 선택적 Obsidian CLI 도우미

## 일반 명령

```bash
openclaw wiki status
openclaw wiki doctor
openclaw wiki init
openclaw wiki ingest ./notes/alpha.md
openclaw wiki compile
openclaw wiki lint
openclaw wiki search "alpha"
openclaw wiki get entity.alpha --from 1 --lines 80

openclaw wiki apply synthesis "Alpha Summary" \
  --body "Short synthesis body" \
  --source-id source.alpha

openclaw wiki apply metadata entity.alpha \
  --source-id source.alpha \
  --status review \
  --question "Still active?"

openclaw wiki bridge import
openclaw wiki unsafe-local import

openclaw wiki obsidian status
openclaw wiki obsidian search "alpha"
openclaw wiki obsidian open syntheses/alpha-summary.md
openclaw wiki obsidian command workspace:quick-switcher
openclaw wiki obsidian daily
```

## 명령

### `wiki status`

현재 보관소 모드, 상태, Obsidian CLI 가용성을 검사합니다.

보관소가 초기화되었는지, 브리지 모드가 건강한지, Obsidian 통합이 사용 가능한지 확실하지 않을 때 먼저 사용하세요.

### `wiki doctor`

위키 상태 확인을 실행하고 구성 또는 보관소 문제를 표면화합니다.

일반적인 문제:

- 공개 메모리 아티팩트 없이 브리지 모드 활성화
- 잘못되거나 누락된 보관소 레이아웃
- Obsidian 모드가 예상될 때 외부 Obsidian CLI 누락

### `wiki init`

위키 보관소 레이아웃과 스타터 페이지를 생성합니다.

루트 인덱스 및 캐시 디렉터리를 포함하여 루트 구조를 초기화합니다.

### `wiki ingest <path-or-url>`

위키 소스 레이어로 콘텐츠를 가져옵니다.

참고사항:

- URL 수집은 `ingest.allowUrlIngest`로 제어됩니다
- 가져온 소스 페이지는 frontmatter에 출처를 유지합니다
- 활성화될 때 수집 후 자동 컴파일이 실행될 수 있습니다

### `wiki compile`

인덱스, 관련 블록, 대시보드, 컴파일된 다이제스트를 재빌드합니다.

다음에 안정적인 기계 지향 아티팩트를 씁니다:

- `.openclaw-wiki/cache/agent-digest.json`
- `.openclaw-wiki/cache/claims.jsonl`

`render.createDashboards`가 활성화된 경우 컴파일은 보고서 페이지도 새로 고침합니다.

### `wiki lint`

보관소를 린트하고 다음을 보고합니다:

- 구조적 문제
- 출처 공백
- 모순
- 미해결 질문
- 낮은 신뢰도 페이지/클레임
- 오래된 페이지/클레임

의미 있는 위키 업데이트 후에 실행하세요.

### `wiki search <query>`

위키 콘텐츠를 검색합니다.

동작은 구성에 따라 다릅니다:

- `search.backend`: `shared` 또는 `local`
- `search.corpus`: `wiki`, `memory`, 또는 `all`

위키별 순위 지정 또는 출처 세부 정보를 원할 때 `wiki search`를 사용하세요.
하나의 광범위한 공유 회상 패스를 위해서는 활성 메모리 플러그인이 공유 검색을 노출하는 경우 `openclaw memory search`를 선호하세요.

### `wiki get <lookup>`

id 또는 상대 경로로 위키 페이지를 읽습니다.

예시:

```bash
openclaw wiki get entity.alpha
openclaw wiki get syntheses/alpha-summary.md --from 1 --lines 80
```

### `wiki apply`

자유 형식 페이지 수술 없이 좁은 변경을 적용합니다.

지원되는 흐름:

- 합성 페이지 생성/업데이트
- 페이지 메타데이터 업데이트
- 소스 id 첨부
- 질문 추가
- 모순 추가
- 신뢰도/상태 업데이트
- 구조화된 클레임 쓰기

이 명령은 관리된 블록을 수동으로 편집하지 않고 위키가 안전하게 발전할 수 있도록 존재합니다.

### `wiki bridge import`

활성 메모리 플러그인에서 공개 메모리 아티팩트를 브리지 백업 소스 페이지로 가져옵니다.

최신 내보낸 메모리 아티팩트를 위키 보관소로 가져오려는 `bridge` 모드에서 이를 사용하세요.

### `wiki unsafe-local import`

`unsafe-local` 모드에서 명시적으로 구성된 로컬 경로에서 가져옵니다.

의도적으로 실험적이며 동일 머신 전용입니다.

### `wiki obsidian ...`

Obsidian 친화적 모드에서 실행되는 보관소를 위한 Obsidian 도우미 명령.

하위 명령:

- `status`
- `search`
- `open`
- `command`
- `daily`

`obsidian.useOfficialCli`가 활성화된 경우 `PATH`에 공식 `obsidian` CLI가 필요합니다.

## 실용적인 사용 지침

- 출처와 페이지 신원이 중요할 때 `wiki search` + `wiki get`을 사용하세요.
- 관리된 생성 섹션을 직접 편집하는 대신 `wiki apply`를 사용하세요.
- 모순되거나 낮은 신뢰도 콘텐츠를 신뢰하기 전에 `wiki lint`를 사용하세요.
- 즉시 신선한 대시보드와 컴파일된 다이제스트를 원할 때 대량 가져오기나 소스 변경 후 `wiki compile`을 사용하세요.
- 브리지 모드가 새로 내보낸 메모리 아티팩트에 의존할 때 `wiki bridge import`를 사용하세요.

## 구성 연결

`openclaw wiki` 동작은 다음에 의해 형성됩니다:

- `plugins.entries.memory-wiki.config.vaultMode`
- `plugins.entries.memory-wiki.config.search.backend`
- `plugins.entries.memory-wiki.config.search.corpus`
- `plugins.entries.memory-wiki.config.bridge.*`
- `plugins.entries.memory-wiki.config.obsidian.*`
- `plugins.entries.memory-wiki.config.render.*`
- `plugins.entries.memory-wiki.config.context.includeCompiledDigestPrompt`

전체 구성 모델은 [메모리 위키 플러그인](/plugins/memory-wiki)을 참조하세요.
