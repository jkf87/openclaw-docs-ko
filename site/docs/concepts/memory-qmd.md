---
title: "QMD 메모리 엔진"
description: "BM25, 벡터, 재순위화, 쿼리 확장이 있는 로컬 우선 검색 사이드카"
---

# QMD 메모리 엔진

[QMD](https://github.com/tobi/qmd)는 OpenClaw와 함께 실행되는 로컬 우선 검색 사이드카입니다. 단일 바이너리로 BM25, 벡터 검색, 재순위화를 결합하며, 워크스페이스 메모리 파일 이외의 콘텐츠도 인덱싱할 수 있습니다.

## 내장보다 추가되는 것

- 더 나은 회상을 위한 **재순위화 및 쿼리 확장**.
- **추가 디렉터리 인덱싱** -- 프로젝트 문서, 팀 메모, 디스크의 모든 것.
- **세션 트랜스크립트 인덱싱** -- 이전 대화를 회상합니다.
- **완전히 로컬** -- Bun + node-llama-cpp를 통해 실행되며, GGUF 모델을 자동으로 다운로드합니다.
- **자동 폴백** -- QMD를 사용할 수 없으면 OpenClaw는 내장 엔진으로 원활하게 폴백합니다.

## 시작하기

### 전제 조건

- QMD 설치: `npm install -g @tobilu/qmd` 또는 `bun install -g @tobilu/qmd`
- 확장을 허용하는 SQLite 빌드 (macOS에서 `brew install sqlite`).
- QMD는 게이트웨이의 `PATH`에 있어야 합니다.
- macOS 및 Linux는 즉시 작동합니다. Windows는 WSL2를 통해 가장 잘 지원됩니다.

### 활성화

```json5
{
  memory: {
    backend: "qmd",
  },
}
```

OpenClaw는 `~/.openclaw/agents/&lt;agentId&gt;/qmd/` 아래에 독립적인 QMD 홈을 생성하고 사이드카 생명주기를 자동으로 관리합니다 -- 컬렉션, 업데이트, 임베딩 실행이 자동으로 처리됩니다. 현재 QMD 컬렉션 및 MCP 쿼리 형식을 선호하지만, 필요한 경우 레거시 `--mask` 컬렉션 플래그와 이전 MCP 도구 이름으로도 폴백합니다.

## 사이드카 작동 방식

- OpenClaw는 워크스페이스 메모리 파일 및 구성된 `memory.qmd.paths`에서 컬렉션을 생성한 다음, 부팅 시와 주기적으로 (기본값 5분마다) `qmd update` + `qmd embed`를 실행합니다.
- 부팅 새로 고침은 백그라운드에서 실행되므로 채팅 시작이 차단되지 않습니다.
- 검색은 구성된 `searchMode` (기본값: `search`; `vsearch` 및 `query`도 지원)를 사용합니다. 모드가 실패하면 OpenClaw는 `qmd query`로 재시도합니다.
- QMD가 완전히 실패하면 OpenClaw는 내장 SQLite 엔진으로 폴백합니다.

::: info
첫 번째 검색은 느릴 수 있습니다 -- QMD는 첫 번째 `qmd query` 실행 시 재순위화 및 쿼리 확장을 위한 GGUF 모델 (~2 GB)을 자동으로 다운로드합니다.
:::


## 모델 오버라이드

QMD 모델 환경 변수는 게이트웨이 프로세스에서 변경 없이 통과되므로, 새 OpenClaw 구성을 추가하지 않고 전 세계적으로 QMD를 조정할 수 있습니다:

```bash
export QMD_EMBED_MODEL="hf:Qwen/Qwen3-Embedding-0.6B-GGUF/Qwen3-Embedding-0.6B-Q8_0.gguf"
export QMD_RERANK_MODEL="/absolute/path/to/reranker.gguf"
export QMD_GENERATE_MODEL="/absolute/path/to/generator.gguf"
```

임베딩 모델 변경 후, 인덱스가 새 벡터 공간과 일치하도록 임베딩을 다시 실행하십시오.

## 추가 경로 인덱싱

검색 가능하도록 QMD를 추가 디렉터리로 지정하십시오:

```json5
{
  memory: {
    backend: "qmd",
    qmd: {
      paths: [{ name: "docs", path: "~/notes", pattern: "**/*.md" }],
    },
  },
}
```

추가 경로의 스니펫은 검색 결과에 `qmd/&lt;collection&gt;/&lt;relative-path&gt;`로 나타납니다. `memory_get`은 이 접두사를 이해하고 올바른 컬렉션 루트에서 읽습니다.

## 세션 트랜스크립트 인덱싱

이전 대화를 회상하려면 세션 인덱싱을 활성화하십시오:

```json5
{
  memory: {
    backend: "qmd",
    qmd: {
      sessions: { enabled: true },
    },
  },
}
```

트랜스크립트는 `~/.openclaw/agents/&lt;id&gt;/qmd/sessions/` 아래의 전용 QMD 컬렉션에 정제된 User/Assistant 턴으로 내보내집니다.

## 검색 범위

기본적으로 QMD 검색 결과는 DM 세션에서만 표시됩니다 (그룹이나 채널은 아님). 이를 변경하려면 `memory.qmd.scope`를 구성하십시오:

```json5
{
  memory: {
    qmd: {
      scope: {
        default: "deny",
        rules: [{ action: "allow", match: { chatType: "direct" } }],
      },
    },
  },
}
```

범위가 검색을 거부하면 OpenClaw는 빈 결과를 더 쉽게 디버깅할 수 있도록 파생된 채널 및 채팅 유형과 함께 경고를 기록합니다.

## 인용

`memory.citations`가 `auto` 또는 `on`인 경우, 검색 스니펫에는 `Source: &lt;path#line&gt;` 풋터가 포함됩니다. 내부적으로 에이전트에 경로를 여전히 전달하면서 풋터를 생략하려면 `memory.citations = "off"`로 설정하십시오.

## 사용 시기

다음이 필요할 때 QMD를 선택하십시오:

- 더 높은 품질의 결과를 위한 재순위화.
- 워크스페이스 외부의 프로젝트 문서나 메모를 검색.
- 과거 세션 대화를 회상.
- API 키 없이 완전히 로컬 검색.

더 간단한 설정의 경우, 추가 종속성 없이 [내장 엔진](/concepts/memory-builtin)이 잘 작동합니다.

## 트러블슈팅

**QMD를 찾을 수 없습니까?** 바이너리가 게이트웨이의 `PATH`에 있는지 확인하십시오. OpenClaw가 서비스로 실행되면 심볼릭 링크를 생성하십시오:
`sudo ln -s ~/.bun/bin/qmd /usr/local/bin/qmd`.

**첫 번째 검색이 매우 느립니까?** QMD는 처음 사용할 때 GGUF 모델을 다운로드합니다. OpenClaw가 사용하는 동일한 XDG 디렉터리를 사용하여 `qmd query "test"`로 미리 워밍하십시오.

**검색 시간 초과입니까?** `memory.qmd.limits.timeoutMs`를 늘리십시오 (기본값: 4000ms). 느린 하드웨어의 경우 `120000`으로 설정하십시오.

**그룹 채팅에서 빈 결과입니까?** `memory.qmd.scope`를 확인하십시오 -- 기본값은 DM 세션만 허용합니다.

**워크스페이스에 보이는 임시 저장소로 인해 `ENAMETOOLONG` 또는 손상된 인덱싱이 발생합니까?** QMD 탐색은 현재 OpenClaw의 내장 심볼릭 링크 규칙이 아닌 기본 QMD 스캐너 동작을 따릅니다. QMD가 사이클 안전 탐색 또는 명시적 제외 제어를 노출할 때까지 임시 모노리포 체크아웃을 `.tmp/`와 같은 숨겨진 디렉터리나 인덱싱된 QMD 루트 외부에 보관하십시오.

## 구성

전체 구성 서피스 (`memory.qmd.*`), 검색 모드, 업데이트 간격, 범위 규칙, 기타 모든 설정은 [메모리 구성 참조](/reference/memory-config)를 참조하십시오.
