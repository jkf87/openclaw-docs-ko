---
title: "API 사용량 및 비용"
description: "비용이 발생할 수 있는 항목, 사용 중인 키, 사용량 확인 방법 감사"
---

# API 사용량 및 비용

이 문서는 **API 키를 호출할 수 있는 기능**과 비용이 어디에 표시되는지 나열합니다. 프로바이더 사용량 또는 유료 API 호출을 생성할 수 있는 OpenClaw 기능에 초점을 맞춥니다.

## 비용이 표시되는 위치 (채팅 + CLI)

**세션별 비용 스냅샷**

- `/status`는 현재 세션 모델, 컨텍스트 사용량, 마지막 응답 토큰을 표시합니다.
- 모델이 **API 키 인증**을 사용하는 경우, `/status`는 마지막 응답의 **예상 비용**도 표시합니다.
- 라이브 세션 메타데이터가 부족한 경우, `/status`는 최신 트랜스크립트 사용 항목에서 토큰/캐시 카운터와 활성 런타임 모델 레이블을 복구할 수 있습니다. 기존 0이 아닌 라이브 값이 여전히 우선하며, 저장된 총합이 없거나 더 작은 경우 프롬프트 크기의 트랜스크립트 총합이 우선할 수 있습니다.

**메시지별 비용 푸터**

- `/usage full`은 **예상 비용**(API 키 전용)을 포함한 사용량 푸터를 모든 응답에 추가합니다.
- `/usage tokens`는 토큰만 표시합니다. 구독 스타일 OAuth/토큰 및 CLI 흐름은 달러 비용을 숨깁니다.
- Gemini CLI 메모: CLI가 JSON 출력을 반환할 때 OpenClaw는 `stats`에서 사용량을 읽고, `stats.cached`를 `cacheRead`로 정규화하며, 필요 시 `stats.input_tokens - stats.cached`에서 입력 토큰을 도출합니다.

Anthropic 메모: Anthropic 직원들이 OpenClaw 스타일 Claude CLI 사용이 다시 허용된다고 알려주었으므로, OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 Claude CLI 재사용 및 `claude -p` 사용을 이 통합에 승인된 것으로 취급합니다.
Anthropic은 여전히 `/usage full`에서 OpenClaw가 표시할 수 있는 메시지별 달러 예상값을 노출하지 않습니다.

**CLI 사용량 창 (프로바이더 할당량)**

- `openclaw status --usage` 및 `openclaw channels list`는 프로바이더 **사용량 창** (메시지별 비용이 아닌 할당량 스냅샷)을 표시합니다.
- 사람이 읽을 수 있는 출력은 프로바이더 전반에 걸쳐 `X% left`로 정규화됩니다.
- 현재 사용량 창 프로바이더: Anthropic, GitHub Copilot, Gemini CLI, OpenAI Codex, MiniMax, Xiaomi, z.ai.
- MiniMax 메모: 원시 `usage_percent` / `usagePercent` 필드는 남은 할당량을 의미하므로 OpenClaw는 표시 전에 반전합니다. 개수 기반 필드가 있는 경우 여전히 우선합니다. 프로바이더가 `model_remains`를 반환하면 OpenClaw는 채팅 모델 항목을 선호하고, 필요 시 타임스탬프에서 창 레이블을 도출하며, 계획 레이블에 모델 이름을 포함합니다.
- 해당 할당량 창의 사용량 인증은 사용 가능한 경우 프로바이더별 훅에서 가져옵니다. 그렇지 않으면 OpenClaw는 인증 프로파일, 환경, 구성에서 일치하는 OAuth/API 키 자격 증명으로 폴백합니다.

자세한 내용과 예시는 [토큰 사용 및 비용](/reference/token-use)을 참조하십시오.

## 키 검색 방법

OpenClaw는 다음 위치에서 자격 증명을 가져올 수 있습니다:

- **인증 프로파일** (에이전트별, `auth-profiles.json`에 저장).
- **환경 변수** (예: `OPENAI_API_KEY`, `BRAVE_API_KEY`, `FIRECRAWL_API_KEY`).
- **구성** (`models.providers.*.apiKey`, `plugins.entries.*.config.webSearch.apiKey`,
  `plugins.entries.firecrawl.config.webFetch.apiKey`, `memorySearch.*`,
  `talk.providers.*.apiKey`).
- **스킬** (`skills.entries.&lt;name&gt;.apiKey`) - 스킬 프로세스 환경에 키를 내보낼 수 있습니다.

## 키를 소비할 수 있는 기능

### 1) 핵심 모델 응답 (채팅 + 도구)

모든 응답 또는 도구 호출은 **현재 모델 프로바이더** (OpenAI, Anthropic 등)를 사용합니다. 이것이 사용량과 비용의 주요 원천입니다.

여기에는 **OpenAI Codex**, **Alibaba Cloud Model Studio Coding Plan**, **MiniMax Coding Plan**, **Z.AI / GLM Coding Plan**, Anthropic의 **Extra Usage**가 활성화된 OpenClaw Claude 로그인 경로와 같이 OpenClaw 로컬 UI 외부에서 여전히 청구되는 구독 스타일 호스팅 프로바이더도 포함됩니다.

가격 구성은 [모델](/providers/models)을, 표시에 대한 자세한 내용은 [토큰 사용 및 비용](/reference/token-use)을 참조하십시오.

### 2) 미디어 이해 (오디오/이미지/비디오)

인바운드 미디어는 응답 실행 전에 요약/전사될 수 있습니다. 이는 모델/프로바이더 API를 사용합니다.

- 오디오: OpenAI / Groq / Deepgram / Google / Mistral.
- 이미지: OpenAI / OpenRouter / Anthropic / Google / MiniMax / Moonshot / Qwen / Z.AI.
- 비디오: Google / Qwen / Moonshot.

[미디어 이해](/nodes/media-understanding)를 참조하십시오.

### 3) 이미지 및 비디오 생성

공유 생성 기능도 프로바이더 키를 소비할 수 있습니다:

- 이미지 생성: OpenAI / Google / fal / MiniMax
- 비디오 생성: Qwen

이미지 생성은 `agents.defaults.imageGenerationModel`이 설정되지 않은 경우 인증 기반 프로바이더 기본값을 유추할 수 있습니다. 비디오 생성은 현재 `qwen/wan2.6-t2v`와 같이 명시적인 `agents.defaults.videoGenerationModel`이 필요합니다.

[이미지 생성](/tools/image-generation), [Qwen Cloud](/providers/qwen),
[모델](/concepts/models)을 참조하십시오.

### 4) 메모리 임베딩 + 시맨틱 검색

시맨틱 메모리 검색은 원격 프로바이더로 구성된 경우 **임베딩 API**를 사용합니다:

- `memorySearch.provider = "openai"` → OpenAI 임베딩
- `memorySearch.provider = "gemini"` → Gemini 임베딩
- `memorySearch.provider = "voyage"` → Voyage 임베딩
- `memorySearch.provider = "mistral"` → Mistral 임베딩
- `memorySearch.provider = "ollama"` → Ollama 임베딩 (로컬/자체 호스팅; 일반적으로 호스팅 API 청구 없음)
- 로컬 임베딩 실패 시 원격 프로바이더로의 선택적 폴백

`memorySearch.provider = "local"`로 로컬 상태를 유지할 수 있습니다 (API 사용 없음).

[메모리](/concepts/memory)를 참조하십시오.

### 5) 웹 검색 도구

`web_search`는 프로바이더에 따라 사용 요금이 발생할 수 있습니다:

- **Brave Search API**: `BRAVE_API_KEY` 또는 `plugins.entries.brave.config.webSearch.apiKey`
- **Exa**: `EXA_API_KEY` 또는 `plugins.entries.exa.config.webSearch.apiKey`
- **Firecrawl**: `FIRECRAWL_API_KEY` 또는 `plugins.entries.firecrawl.config.webSearch.apiKey`
- **Gemini (Google Search)**: `GEMINI_API_KEY` 또는 `plugins.entries.google.config.webSearch.apiKey`
- **Grok (xAI)**: `XAI_API_KEY` 또는 `plugins.entries.xai.config.webSearch.apiKey`
- **Kimi (Moonshot)**: `KIMI_API_KEY`, `MOONSHOT_API_KEY`, 또는 `plugins.entries.moonshot.config.webSearch.apiKey`
- **MiniMax Search**: `MINIMAX_CODE_PLAN_KEY`, `MINIMAX_CODING_API_KEY`, `MINIMAX_API_KEY`, 또는 `plugins.entries.minimax.config.webSearch.apiKey`
- **Ollama Web Search**: 기본적으로 키 불필요, 하지만 접근 가능한 Ollama 호스트 및 `ollama signin`이 필요합니다. 호스트에 필요한 경우 일반 Ollama 프로바이더 Bearer 인증도 재사용할 수 있습니다
- **Perplexity Search API**: `PERPLEXITY_API_KEY`, `OPENROUTER_API_KEY`, 또는 `plugins.entries.perplexity.config.webSearch.apiKey`
- **Tavily**: `TAVILY_API_KEY` 또는 `plugins.entries.tavily.config.webSearch.apiKey`
- **DuckDuckGo**: 키 불필요 폴백 (API 청구 없음, 비공식 HTML 기반)
- **SearXNG**: `SEARXNG_BASE_URL` 또는 `plugins.entries.searxng.config.webSearch.baseUrl` (키 불필요/자체 호스팅; 호스팅 API 청구 없음)

레거시 `tools.web.search.*` 프로바이더 경로는 임시 호환성 심을 통해 여전히 로드되지만 더 이상 권장 구성 서페이스가 아닙니다.

**Brave Search 무료 크레딧:** 각 Brave 플랜에는 매월 갱신되는 \$5 무료 크레딧이 포함됩니다. Search 플랜은 1,000 요청당 \$5이므로 크레딧으로 월 1,000 요청이 무료입니다. 예상치 못한 요금을 피하려면 Brave 대시보드에서 사용 한도를 설정하십시오.

[웹 도구](/tools/web)를 참조하십시오.

### 5) 웹 페치 도구 (Firecrawl)

`web_fetch`는 API 키가 있는 경우 **Firecrawl**을 호출할 수 있습니다:

- `FIRECRAWL_API_KEY` 또는 `plugins.entries.firecrawl.config.webFetch.apiKey`

Firecrawl이 구성되지 않은 경우 도구는 직접 페치 + 가독성 처리로 폴백합니다 (유료 API 없음).

[웹 도구](/tools/web)를 참조하십시오.

### 6) 프로바이더 사용량 스냅샷 (상태/상태 확인)

일부 상태 명령은 할당량 창이나 인증 상태를 표시하기 위해 **프로바이더 사용량 엔드포인트**를 호출합니다.
일반적으로 낮은 볼륨의 호출이지만 여전히 프로바이더 API를 사용합니다:

- `openclaw status --usage`
- `openclaw models status --json`

[모델 CLI](/cli/models)를 참조하십시오.

### 7) 컴팩션 안전망 요약

컴팩션 안전망은 **현재 모델**을 사용하여 세션 기록을 요약할 수 있습니다. 실행될 때 프로바이더 API를 호출합니다.

[세션 관리 + 컴팩션](/reference/session-management-compaction)을 참조하십시오.

### 8) 모델 스캔 / 프로브

`openclaw models scan`은 OpenRouter 모델을 프로브할 수 있으며 프로빙이 활성화된 경우 `OPENROUTER_API_KEY`를 사용합니다.

[모델 CLI](/cli/models)를 참조하십시오.

### 9) Talk (음성)

Talk 모드는 구성된 경우 **ElevenLabs**를 호출할 수 있습니다:

- `ELEVENLABS_API_KEY` 또는 `talk.providers.elevenlabs.apiKey`

[Talk 모드](/nodes/talk)를 참조하십시오.

### 10) 스킬 (서드파티 API)

스킬은 `skills.entries.&lt;name&gt;.apiKey`에 `apiKey`를 저장할 수 있습니다. 스킬이 외부 API에 해당 키를 사용하는 경우 스킬 프로바이더에 따라 비용이 발생할 수 있습니다.

[스킬](/tools/skills)을 참조하십시오.
