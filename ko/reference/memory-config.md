---
title: "메모리 구성 레퍼런스"
summary: "메모리 검색, 임베딩 프로바이더, QMD, 하이브리드 검색, 멀티모달 인덱싱을 위한 모든 구성 설정"
read_when:
  - 메모리 검색 프로바이더 또는 임베딩 모델 구성 시
  - QMD 백엔드 설정 시
  - 하이브리드 검색, MMR, 또는 시간적 감쇠 조정 시
  - 멀티모달 메모리 인덱싱 활성화 시
---

# 메모리 구성 레퍼런스

이 페이지는 OpenClaw 메모리 검색의 모든 구성 설정을 나열합니다. 개념적 개요는 다음을 참조하십시오:

- [메모리 개요](/concepts/memory) -- 메모리 작동 방식
- [내장 엔진](/concepts/memory-builtin) -- 기본 SQLite 백엔드
- [QMD 엔진](/concepts/memory-qmd) -- 로컬 우선 사이드카
- [메모리 검색](/concepts/memory-search) -- 검색 파이프라인 및 조정

모든 메모리 검색 설정은 별도로 명시되지 않는 한 `openclaw.json`의 `agents.defaults.memorySearch` 아래에 있습니다.

---

## 프로바이더 선택

| 키         | 타입      | 기본값           | 설명                                                                                        |
| ---------- | --------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `provider` | `string`  | 자동 감지        | 임베딩 어댑터 ID: `openai`, `gemini`, `voyage`, `mistral`, `bedrock`, `ollama`, `local` |
| `model`    | `string`  | 프로바이더 기본값 | 임베딩 모델 이름                                                                            |
| `fallback` | `string`  | `"none"`         | 기본 실패 시 폴백 어댑터 ID                                                                  |
| `enabled`  | `boolean` | `true`           | 메모리 검색 활성화 또는 비활성화                                                             |

### 자동 감지 순서

`provider`가 설정되지 않은 경우 OpenClaw는 사용 가능한 첫 번째를 선택합니다:

1. `local` -- `memorySearch.local.modelPath`가 구성되어 있고 파일이 존재하는 경우.
2. `openai` -- OpenAI 키를 확인할 수 있는 경우.
3. `gemini` -- Gemini 키를 확인할 수 있는 경우.
4. `voyage` -- Voyage 키를 확인할 수 있는 경우.
5. `mistral` -- Mistral 키를 확인할 수 있는 경우.
6. `bedrock` -- AWS SDK 자격 증명 체인이 확인되는 경우 (인스턴스 역할, 액세스 키, 프로파일, SSO, 웹 ID, 또는 공유 구성).

`ollama`는 지원되지만 자동 감지되지 않습니다 (명시적으로 설정하십시오).

### API 키 확인

원격 임베딩에는 API 키가 필요합니다. Bedrock은 대신 AWS SDK 기본 자격 증명 체인을 사용합니다 (인스턴스 역할, SSO, 액세스 키).

| 프로바이더 | 환경 변수                      | 구성 키                           |
| --------- | ------------------------------ | --------------------------------- |
| OpenAI   | `OPENAI_API_KEY`               | `models.providers.openai.apiKey`  |
| Gemini   | `GEMINI_API_KEY`               | `models.providers.google.apiKey`  |
| Voyage   | `VOYAGE_API_KEY`               | `models.providers.voyage.apiKey`  |
| Mistral  | `MISTRAL_API_KEY`              | `models.providers.mistral.apiKey` |
| Bedrock  | AWS 자격 증명 체인             | API 키 불필요                     |
| Ollama   | `OLLAMA_API_KEY` (플레이스홀더) | --                                |

Codex OAuth는 채팅/완성만 커버하며 임베딩 요청을 충족하지 않습니다.

---

## 원격 엔드포인트 구성

사용자 정의 OpenAI 호환 엔드포인트 또는 프로바이더 기본값 재정의 시:

| 키               | 타입     | 설명                                       |
| ---------------- | -------- | ------------------------------------------ |
| `remote.baseUrl` | `string` | 사용자 정의 API 기본 URL                   |
| `remote.apiKey`  | `string` | API 키 재정의                              |
| `remote.headers` | `object` | 추가 HTTP 헤더 (프로바이더 기본값과 병합됨) |

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "openai",
        model: "text-embedding-3-small",
        remote: {
          baseUrl: "https://api.example.com/v1/",
          apiKey: "YOUR_KEY",
        },
      },
    },
  },
}
```

---

## Gemini 특정 구성

| 키                     | 타입     | 기본값                 | 설명                                       |
| ---------------------- | -------- | ---------------------- | ------------------------------------------ |
| `model`                | `string` | `gemini-embedding-001` | `gemini-embedding-2-preview`도 지원됩니다  |
| `outputDimensionality` | `number` | `3072`                 | Embedding 2의 경우: 768, 1536, 또는 3072   |

<Warning>
모델 또는 `outputDimensionality`를 변경하면 자동 전체 재인덱싱이 트리거됩니다.
</Warning>

---

## Bedrock 임베딩 구성

Bedrock은 AWS SDK 기본 자격 증명 체인을 사용합니다 -- API 키가 필요하지 않습니다.
OpenClaw가 Bedrock 활성화 인스턴스 역할이 있는 EC2에서 실행되는 경우 프로바이더와 모델만 설정하면 됩니다:

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "bedrock",
        model: "amazon.titan-embed-text-v2:0",
      },
    },
  },
}
```

| 키                     | 타입     | 기본값                         | 설명                            |
| ---------------------- | -------- | ------------------------------ | ------------------------------- |
| `model`                | `string` | `amazon.titan-embed-text-v2:0` | 모든 Bedrock 임베딩 모델 ID     |
| `outputDimensionality` | `number` | 모델 기본값                    | Titan V2의 경우: 256, 512, 1024 |

### 지원 모델

다음 모델이 지원됩니다 (패밀리 감지 및 차원 기본값 포함):

| 모델 ID                                    | 프로바이더  | 기본 차원 | 구성 가능 차원       |
| ------------------------------------------ | ---------- | -------- | -------------------- |
| `amazon.titan-embed-text-v2:0`             | Amazon     | 1024     | 256, 512, 1024       |
| `amazon.titan-embed-text-v1`               | Amazon     | 1536     | --                   |
| `amazon.titan-embed-g1-text-02`            | Amazon     | 1536     | --                   |
| `amazon.titan-embed-image-v1`              | Amazon     | 1024     | --                   |
| `amazon.nova-2-multimodal-embeddings-v1:0` | Amazon     | 1024     | 256, 384, 1024, 3072 |
| `cohere.embed-english-v3`                  | Cohere     | 1024     | --                   |
| `cohere.embed-multilingual-v3`             | Cohere     | 1024     | --                   |
| `cohere.embed-v4:0`                        | Cohere     | 1536     | 256-1536             |
| `twelvelabs.marengo-embed-3-0-v1:0`        | TwelveLabs | 512      | --                   |
| `twelvelabs.marengo-embed-2-7-v1:0`        | TwelveLabs | 1024     | --                   |

처리량 접미사 변형 (예: `amazon.titan-embed-text-v1:2:8k`)은 기본 모델의 구성을 상속합니다.

### 인증

Bedrock 인증은 표준 AWS SDK 자격 증명 확인 순서를 사용합니다:

1. 환경 변수 (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`)
2. SSO 토큰 캐시
3. 웹 ID 토큰 자격 증명
4. 공유 자격 증명 및 구성 파일
5. ECS 또는 EC2 메타데이터 자격 증명

리전은 `AWS_REGION`, `AWS_DEFAULT_REGION`, `amazon-bedrock` 프로바이더 `baseUrl`에서 확인하거나 기본값 `us-east-1`을 사용합니다.

### IAM 권한

IAM 역할 또는 사용자에게 다음이 필요합니다:

```json
{
  "Effect": "Allow",
  "Action": "bedrock:InvokeModel",
  "Resource": "*"
}
```

최소 권한을 위해 `InvokeModel`의 범위를 특정 모델로 제한하십시오:

```
arn:aws:bedrock:*::foundation-model/amazon.titan-embed-text-v2:0
```

---

## 로컬 임베딩 구성

| 키                    | 타입     | 기본값                 | 설명                     |
| --------------------- | -------- | ---------------------- | ------------------------ |
| `local.modelPath`     | `string` | 자동 다운로드          | GGUF 모델 파일 경로      |
| `local.modelCacheDir` | `string` | node-llama-cpp 기본값  | 다운로드 모델 캐시 디렉토리 |

기본 모델: `embeddinggemma-300m-qat-Q8_0.gguf` (~0.6 GB, 자동 다운로드).
네이티브 빌드 필요: `pnpm approve-builds` 후 `pnpm rebuild node-llama-cpp`.

---

## 하이브리드 검색 구성

모두 `memorySearch.query.hybrid` 아래에 있습니다:

| 키                    | 타입      | 기본값  | 설명                              |
| --------------------- | --------- | ------- | --------------------------------- |
| `enabled`             | `boolean` | `true`  | 하이브리드 BM25 + 벡터 검색 활성화 |
| `vectorWeight`        | `number`  | `0.7`   | 벡터 점수 가중치 (0-1)            |
| `textWeight`          | `number`  | `0.3`   | BM25 점수 가중치 (0-1)            |
| `candidateMultiplier` | `number`  | `4`     | 후보 풀 크기 배수                  |

### MMR (다양성)

| 키            | 타입      | 기본값  | 설명                                  |
| ------------- | --------- | ------- | ------------------------------------- |
| `mmr.enabled` | `boolean` | `false` | MMR 재순위화 활성화                   |
| `mmr.lambda`  | `number`  | `0.7`   | 0 = 최대 다양성, 1 = 최대 관련성      |

### 시간적 감쇠 (최신성)

| 키                           | 타입      | 기본값  | 설명                   |
| ---------------------------- | --------- | ------- | ---------------------- |
| `temporalDecay.enabled`      | `boolean` | `false` | 최신성 부스트 활성화   |
| `temporalDecay.halfLifeDays` | `number`  | `30`    | N일마다 점수 절반 감소 |

상시 파일 (`MEMORY.md`, `memory/`의 날짜 없는 파일)은 감쇠되지 않습니다.

### 전체 예시

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        query: {
          hybrid: {
            vectorWeight: 0.7,
            textWeight: 0.3,
            mmr: { enabled: true, lambda: 0.7 },
            temporalDecay: { enabled: true, halfLifeDays: 30 },
          },
        },
      },
    },
  },
}
```

---

## 추가 메모리 경로

| 키           | 타입       | 설명                             |
| ------------ | ---------- | -------------------------------- |
| `extraPaths` | `string[]` | 인덱싱할 추가 디렉토리 또는 파일 |

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        extraPaths: ["../team-docs", "/srv/shared-notes"],
      },
    },
  },
}
```

경로는 절대 경로 또는 워크스페이스 상대 경로일 수 있습니다. 디렉토리는 `.md` 파일을 재귀적으로 스캔합니다. 심볼릭 링크 처리는 활성 백엔드에 따라 다릅니다: 내장 엔진은 심볼릭 링크를 무시하고, QMD는 기본 QMD 스캐너 동작을 따릅니다.

에이전트 범위 에이전트 간 트랜스크립트 검색의 경우 `memory.qmd.paths` 대신 `agents.list[].memorySearch.qmd.extraCollections`를 사용하십시오.
해당 추가 컬렉션은 동일한 `{ path, name, pattern? }` 형태를 따르지만 에이전트별로 병합되며 경로가 현재 워크스페이스 외부를 가리킬 때 명시적 공유 이름을 유지할 수 있습니다.
동일한 확인된 경로가 `memory.qmd.paths`와 `memorySearch.qmd.extraCollections` 모두에 있으면 QMD는 첫 번째 항목을 유지하고 중복을 건너뜁니다.

---

## 멀티모달 메모리 (Gemini)

Gemini Embedding 2를 사용하여 Markdown과 함께 이미지 및 오디오를 인덱싱합니다:

| 키                        | 타입       | 기본값     | 설명                                      |
| ------------------------- | ---------- | ---------- | ----------------------------------------- |
| `multimodal.enabled`      | `boolean`  | `false`    | 멀티모달 인덱싱 활성화                    |
| `multimodal.modalities`   | `string[]` | --         | `["image"]`, `["audio"]`, 또는 `["all"]` |
| `multimodal.maxFileBytes` | `number`   | `10000000` | 인덱싱을 위한 최대 파일 크기              |

`extraPaths`의 파일에만 적용됩니다. 기본 메모리 루트는 Markdown 전용을 유지합니다.
`gemini-embedding-2-preview`가 필요합니다. `fallback`은 `"none"`이어야 합니다.

지원 형식: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.heic`, `.heif`
(이미지); `.mp3`, `.wav`, `.ogg`, `.opus`, `.m4a`, `.aac`, `.flac` (오디오).

---

## 임베딩 캐시

| 키                 | 타입      | 기본값  | 설명                              |
| ------------------ | --------- | ------- | --------------------------------- |
| `cache.enabled`    | `boolean` | `false` | SQLite에 청크 임베딩 캐시         |
| `cache.maxEntries` | `number`  | `50000` | 최대 캐시된 임베딩 수             |

재인덱싱 또는 트랜스크립트 업데이트 중 변경되지 않은 텍스트의 재임베딩을 방지합니다.

---

## 배치 인덱싱

| 키                            | 타입      | 기본값  | 설명                      |
| ----------------------------- | --------- | ------- | ------------------------- |
| `remote.batch.enabled`        | `boolean` | `false` | 배치 임베딩 API 활성화    |
| `remote.batch.concurrency`    | `number`  | `2`     | 병렬 배치 작업 수         |
| `remote.batch.wait`           | `boolean` | `true`  | 배치 완료 대기            |
| `remote.batch.pollIntervalMs` | `number`  | --      | 폴링 간격                 |
| `remote.batch.timeoutMinutes` | `number`  | --      | 배치 타임아웃             |

`openai`, `gemini`, `voyage`에서 사용 가능합니다. OpenAI 배치는 일반적으로 대량 백필에 가장 빠르고 저렴합니다.

---

## 세션 메모리 검색 (실험적)

세션 트랜스크립트를 인덱싱하고 `memory_search`를 통해 표면화합니다:

| 키                            | 타입       | 기본값       | 설명                           |
| ----------------------------- | ---------- | ------------ | ------------------------------ |
| `experimental.sessionMemory`  | `boolean`  | `false`      | 세션 인덱싱 활성화             |
| `sources`                     | `string[]` | `["memory"]` | 트랜스크립트 포함을 위해 `"sessions"` 추가 |
| `sync.sessions.deltaBytes`    | `number`   | `100000`     | 재인덱싱을 위한 바이트 임계값  |
| `sync.sessions.deltaMessages` | `number`   | `50`         | 재인덱싱을 위한 메시지 임계값  |

세션 인덱싱은 옵트인이며 비동기적으로 실행됩니다. 결과가 약간 오래될 수 있습니다. 세션 로그는 디스크에 저장되므로 파일 시스템 액세스를 신뢰 경계로 취급하십시오.

---

## SQLite 벡터 가속 (sqlite-vec)

| 키                           | 타입      | 기본값  | 설명                           |
| ---------------------------- | --------- | ------- | ------------------------------ |
| `store.vector.enabled`       | `boolean` | `true`  | 벡터 쿼리에 sqlite-vec 사용    |
| `store.vector.extensionPath` | `string`  | 번들됨  | sqlite-vec 경로 재정의         |

sqlite-vec를 사용할 수 없는 경우 OpenClaw는 자동으로 인프로세스 코사인 유사도로 폴백합니다.

---

## 인덱스 저장소

| 키                    | 타입     | 기본값                                | 설명                                              |
| --------------------- | -------- | ------------------------------------- | ------------------------------------------------- |
| `store.path`          | `string` | `~/.openclaw/memory/{agentId}.sqlite` | 인덱스 위치 (`{agentId}` 토큰 지원)               |
| `store.fts.tokenizer` | `string` | `unicode61`                           | FTS5 토크나이저 (`unicode61` 또는 `trigram`)      |

---

## QMD 백엔드 구성

활성화하려면 `memory.backend = "qmd"`를 설정하십시오. 모든 QMD 설정은 `memory.qmd` 아래에 있습니다:

| 키                       | 타입      | 기본값   | 설명                                          |
| ------------------------ | --------- | -------- | --------------------------------------------- |
| `command`                | `string`  | `qmd`    | QMD 실행 파일 경로                            |
| `searchMode`             | `string`  | `search` | 검색 명령: `search`, `vsearch`, `query`       |
| `includeDefaultMemory`   | `boolean` | `true`   | `MEMORY.md` + `memory/**/*.md` 자동 인덱싱   |
| `paths[]`                | `array`   | --       | 추가 경로: `{ name, path, pattern? }`         |
| `sessions.enabled`       | `boolean` | `false`  | 세션 트랜스크립트 인덱싱                      |
| `sessions.retentionDays` | `number`  | --       | 트랜스크립트 보존 기간                        |
| `sessions.exportDir`     | `string`  | --       | 내보내기 디렉토리                             |

OpenClaw는 현재 QMD 컬렉션 및 MCP 쿼리 형태를 선호하지만, 필요 시 레거시 `--mask` 컬렉션 플래그와 이전 MCP 도구 이름으로 폴백하여 이전 QMD 릴리스와의 호환성을 유지합니다.

QMD 모델 재정의는 OpenClaw 구성이 아닌 QMD 측에 있습니다. QMD 모델을 전역으로 재정의해야 하는 경우 게이트웨이 런타임 환경에서 `QMD_EMBED_MODEL`, `QMD_RERANK_MODEL`, `QMD_GENERATE_MODEL`과 같은 환경 변수를 설정하십시오.

### 업데이트 일정

| 키                        | 타입      | 기본값  | 설명                              |
| ------------------------- | --------- | ------- | --------------------------------- |
| `update.interval`         | `string`  | `5m`    | 새로 고침 간격                    |
| `update.debounceMs`       | `number`  | `15000` | 파일 변경 디바운스                |
| `update.onBoot`           | `boolean` | `true`  | 시작 시 새로 고침                 |
| `update.waitForBootSync`  | `boolean` | `false` | 새로 고침 완료까지 시작 차단      |
| `update.embedInterval`    | `string`  | --      | 별도의 임베드 주기                |
| `update.commandTimeoutMs` | `number`  | --      | QMD 명령 타임아웃                 |
| `update.updateTimeoutMs`  | `number`  | --      | QMD 업데이트 작업 타임아웃        |
| `update.embedTimeoutMs`   | `number`  | --      | QMD 임베드 작업 타임아웃          |

### 제한

| 키                        | 타입     | 기본값  | 설명                    |
| ------------------------- | -------- | ------- | ----------------------- |
| `limits.maxResults`       | `number` | `6`     | 최대 검색 결과 수       |
| `limits.maxSnippetChars`  | `number` | --      | 스니펫 길이 제한        |
| `limits.maxInjectedChars` | `number` | --      | 총 주입 문자 수 제한    |
| `limits.timeoutMs`        | `number` | `4000`  | 검색 타임아웃           |

### 범위

QMD 검색 결과를 받을 수 있는 세션을 제어합니다. [`session.sendPolicy`](/gateway/configuration-reference#session)와 동일한 스키마:

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

기본값은 DM 전용입니다. `match.keyPrefix`는 정규화된 세션 키와 일치합니다. `match.rawKeyPrefix`는 `agent:<id>:`를 포함한 원시 키와 일치합니다.

### 인용

`memory.citations`는 모든 백엔드에 적용됩니다:

| 값               | 동작                                                |
| ---------------- | --------------------------------------------------- |
| `auto` (기본값)  | 스니펫에 `Source: <path#line>` 푸터 포함            |
| `on`             | 항상 푸터 포함                                      |
| `off`            | 푸터 생략 (경로는 내부적으로 에이전트에게 전달됨)   |

### 전체 QMD 예시

```json5
{
  memory: {
    backend: "qmd",
    citations: "auto",
    qmd: {
      includeDefaultMemory: true,
      update: { interval: "5m", debounceMs: 15000 },
      limits: { maxResults: 6, timeoutMs: 4000 },
      scope: {
        default: "deny",
        rules: [{ action: "allow", match: { chatType: "direct" } }],
      },
      paths: [{ name: "docs", path: "~/notes", pattern: "**/*.md" }],
    },
  },
}
```

---

## 드리밍 (실험적)

드리밍은 `agents.defaults.memorySearch`가 아닌 `plugins.entries.memory-core.config.dreaming` 아래에 구성됩니다.

드리밍은 하나의 예약된 스윕으로 실행되며 구현 세부 사항으로 내부적으로 light/deep/REM 단계를 사용합니다.

개념적 동작 및 슬래시 명령은 [드리밍](/concepts/dreaming)을 참조하십시오.

### 사용자 설정

| 키          | 타입      | 기본값      | 설명                                          |
| ----------- | --------- | ----------- | --------------------------------------------- |
| `enabled`   | `boolean` | `false`     | 드리밍 전체 활성화 또는 비활성화              |
| `frequency` | `string`  | `0 3 * * *` | 전체 드리밍 스윕을 위한 선택적 cron 주기      |

### 예시

```json5
{
  plugins: {
    entries: {
      "memory-core": {
        config: {
          dreaming: {
            enabled: true,
            frequency: "0 3 * * *",
          },
        },
      },
    },
  },
}
```

메모:

- 드리밍은 머신 상태를 `memory/.dreams/`에 씁니다.
- 드리밍은 사람이 읽을 수 있는 내러티브 출력을 `DREAMS.md` (또는 기존 `dreams.md`)에 씁니다.
- light/deep/REM 단계 정책 및 임계값은 내부 동작으로 사용자 대면 구성이 아닙니다.
