---
summary: "키워드, 벡터, hybrid search를 지원하는 기본 SQLite 기반 memory 백엔드"
title: "Builtin memory 엔진"
read_when:
  - 기본 memory 백엔드를 이해하고 싶을 때
  - embedding 제공자나 hybrid search를 설정하고 싶을 때
---

builtin 엔진은 기본 memory 백엔드입니다. 에이전트별 SQLite 데이터베이스에 memory
인덱스를 저장하며, 시작하기 위한 추가 의존성이 필요 없습니다.

## 제공 기능

- **Keyword search** -- FTS5 풀텍스트 인덱싱(BM25 스코어링) 기반.
- **Vector search** -- 지원되는 모든 제공자의 embedding 사용.
- **Hybrid search** -- 최상의 결과를 위해 두 방식을 결합.
- **CJK 지원** -- 중국어, 일본어, 한국어를 위한 trigram 토큰화.
- **sqlite-vec 가속** -- 데이터베이스 내부 벡터 쿼리(선택 사항).

## 시작하기

OpenAI, Gemini, Voyage, Mistral 중 하나의 API 키가 있다면, builtin 엔진이 이를
자동 감지하여 벡터 검색을 활성화합니다. 별도 설정이 필요 없습니다.

제공자를 명시적으로 지정하려면 다음과 같이 설정합니다.

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "openai",
      },
    },
  },
}
```

embedding 제공자가 없으면 키워드 검색만 사용할 수 있습니다.

내장 로컬 embedding 제공자를 강제로 사용하려면, `local.modelPath`를 GGUF 파일로
지정하세요.

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "local",
        fallback: "none",
        local: {
          modelPath: "~/.node-llama-cpp/models/embeddinggemma-300m-qat-Q8_0.gguf",
        },
      },
    },
  },
}
```

## 지원 embedding 제공자

| 제공자   | ID        | 자동 감지     | 비고                                |
| -------- | --------- | ------------- | ----------------------------------- |
| OpenAI   | `openai`  | 지원          | 기본값: `text-embedding-3-small`    |
| Gemini   | `gemini`  | 지원          | 멀티모달(이미지 + 오디오) 지원      |
| Voyage   | `voyage`  | 지원          |                                     |
| Mistral  | `mistral` | 지원          |                                     |
| Ollama   | `ollama`  | 미지원        | 로컬, 명시적으로 설정해야 함        |
| Local    | `local`   | 지원(최우선)  | GGUF 모델, 약 0.6 GB 다운로드       |

자동 감지는 위에 표시된 순서대로 API 키를 확인할 수 있는 첫 번째 제공자를
선택합니다. 이를 재정의하려면 `memorySearch.provider`를 설정하세요.

## 인덱싱 동작 방식

OpenClaw는 `MEMORY.md`와 `memory/*.md`를 청크(약 400 토큰, 80 토큰 오버랩)로
인덱싱하여 에이전트별 SQLite 데이터베이스에 저장합니다.

- **인덱스 위치:** `~/.openclaw/memory/<agentId>.sqlite`
- **파일 감시:** memory 파일 변경 시 debounce된 재인덱싱(1.5초)이 트리거됩니다.
- **자동 재인덱싱:** embedding 제공자, 모델, chunking 설정이 바뀌면 전체 인덱스가
  자동으로 재구축됩니다.
- **수동 재인덱싱:** `openclaw memory index --force`

<Info>
`memorySearch.extraPaths`를 사용하면 워크스페이스 바깥의 Markdown 파일도 인덱싱할
수 있습니다. [설정 레퍼런스](/reference/memory-config#additional-memory-paths)를
참고하세요.
</Info>

## 사용 시점

builtin 엔진은 대부분의 사용자에게 적절한 선택입니다.

- 추가 의존성 없이 바로 동작합니다.
- 키워드 검색과 벡터 검색을 잘 처리합니다.
- 모든 embedding 제공자를 지원합니다.
- Hybrid search가 두 retrieval 방식의 장점을 결합합니다.

reranking, query expansion이 필요하거나 워크스페이스 바깥 디렉토리를 인덱싱하고
싶다면 [QMD](/concepts/memory-qmd)로 전환을 고려하세요.

자동 사용자 모델링이 포함된 크로스 세션 memory를 원한다면
[Honcho](/concepts/memory-honcho)를 고려하세요.

## 문제 해결

**Memory 검색이 비활성 상태인가요?** `openclaw memory status`를 확인하세요.
제공자가 감지되지 않으면 명시적으로 설정하거나 API 키를 추가하세요.

**Local 제공자가 감지되지 않나요?** 로컬 경로가 존재하는지 확인하고 다음을
실행하세요.

```bash
openclaw memory status --deep --agent main
openclaw memory index --force --agent main
```

독립 실행형 CLI 명령과 Gateway 모두 동일한 `local` 제공자 ID를 사용합니다.
제공자가 `auto`로 설정되어 있을 때, `memorySearch.local.modelPath`가 실제 로컬
파일을 가리키는 경우에만 로컬 embedding이 우선 고려됩니다.

**결과가 오래된 것 같나요?** `openclaw memory index --force`를 실행해 재구축하세요.
드문 엣지 케이스에서는 watcher가 변경을 놓칠 수 있습니다.

**sqlite-vec가 로드되지 않나요?** OpenClaw는 자동으로 프로세스 내 cosine 유사도로
fallback합니다. 구체적인 로드 오류는 로그에서 확인하세요.

## 설정

embedding 제공자 설정, hybrid search 튜닝(가중치, MMR, temporal decay), 일괄
인덱싱, 멀티모달 memory, sqlite-vec, extra paths를 비롯한 모든 설정 옵션은
[Memory 설정 레퍼런스](/reference/memory-config)를 참고하세요.

## 관련 문서

- [Memory 개요](/concepts/memory)
- [Memory search](/concepts/memory-search)
- [Active memory](/concepts/active-memory)
