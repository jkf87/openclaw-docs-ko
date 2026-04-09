---
title: "프롬프트 캐싱"
description: "프롬프트 캐싱 설정, 병합 순서, 프로바이더 동작, 조정 패턴"
---

# 프롬프트 캐싱

프롬프트 캐싱은 모델 프로바이더가 매번 다시 처리하는 대신 변경되지 않은 프롬프트 접두사(일반적으로 시스템/개발자 지침 및 기타 안정적인 컨텍스트)를 턴 간에 재사용할 수 있음을 의미합니다. OpenClaw는 업스트림 API가 해당 카운터를 직접 노출하는 경우 프로바이더 사용량을 `cacheRead` 및 `cacheWrite`로 정규화합니다.

상태 서페이스는 라이브 세션 스냅샷이 없는 경우 가장 최근 트랜스크립트 사용 로그에서 캐시 카운터를 복구할 수도 있습니다. 따라서 `/status`는 부분적인 세션 메타데이터 손실 후에도 캐시 라인을 계속 표시할 수 있습니다. 기존 0이 아닌 라이브 캐시 값은 여전히 트랜스크립트 폴백 값보다 우선합니다.

이것이 중요한 이유: 낮은 토큰 비용, 빠른 응답, 장기 실행 세션의 예측 가능한 성능. 캐싱 없이는 대부분의 입력이 변경되지 않아도 반복된 프롬프트는 매 턴마다 전체 프롬프트 비용을 지불합니다.

이 페이지는 프롬프트 재사용 및 토큰 비용에 영향을 미치는 모든 캐시 관련 설정을 다룹니다.

프로바이더 참조:

- Anthropic 프롬프트 캐싱: [https://platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- OpenAI 프롬프트 캐싱: [https://developers.openai.com/api/docs/guides/prompt-caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- OpenAI API 헤더 및 요청 ID: [https://developers.openai.com/api/reference/overview](https://developers.openai.com/api/reference/overview)
- Anthropic 요청 ID 및 오류: [https://platform.claude.com/docs/en/api/errors](https://platform.claude.com/docs/en/api/errors)

## 주요 설정

### `cacheRetention` (전역 기본값, 모델, 에이전트별)

모든 모델에 대한 전역 기본값으로 캐시 보존을 설정합니다:

```yaml
agents:
  defaults:
    params:
      cacheRetention: "long" # none | short | long
```

모델별 재정의:

```yaml
agents:
  defaults:
    models:
      "anthropic/claude-opus-4-6":
        params:
          cacheRetention: "short" # none | short | long
```

에이전트별 재정의:

```yaml
agents:
  list:
    - id: "alerts"
      params:
        cacheRetention: "none"
```

구성 병합 순서:

1. `agents.defaults.params` (전역 기본값 — 모든 모델에 적용)
2. `agents.defaults.models["provider/model"].params` (모델별 재정의)
3. `agents.list[].params` (에이전트 ID 일치; 키로 재정의)

### `contextPruning.mode: "cache-ttl"`

캐시 TTL 창 이후 이전 도구 결과 컨텍스트를 프루닝하여 유휴 후 요청이 과도하게 큰 기록을 재캐싱하지 않도록 합니다.

```yaml
agents:
  defaults:
    contextPruning:
      mode: "cache-ttl"
      ttl: "1h"
```

전체 동작은 [세션 프루닝](/concepts/session-pruning)을 참조하십시오.

### 하트비트 워밍

하트비트는 캐시 창을 워밍된 상태로 유지하고 유휴 간격 후 반복된 캐시 쓰기를 줄일 수 있습니다.

```yaml
agents:
  defaults:
    heartbeat:
      every: "55m"
```

에이전트별 하트비트는 `agents.list[].heartbeat`에서 지원됩니다.

## 프로바이더 동작

### Anthropic (직접 API)

- `cacheRetention`이 지원됩니다.
- Anthropic API 키 인증 프로파일에서 설정되지 않은 경우 OpenClaw는 Anthropic 모델 참조에 `cacheRetention: "short"`를 초기값으로 설정합니다.
- Anthropic 네이티브 Messages 응답은 `cache_read_input_tokens`와 `cache_creation_input_tokens` 모두를 노출하므로 OpenClaw는 `cacheRead`와 `cacheWrite` 모두를 표시할 수 있습니다.
- 네이티브 Anthropic 요청의 경우 `cacheRetention: "short"`는 기본 5분 임시 캐시에 매핑되고, `cacheRetention: "long"`은 직접 `api.anthropic.com` 호스트에서만 1시간 TTL로 업그레이드됩니다.

### OpenAI (직접 API)

- 지원되는 최신 모델에서 프롬프트 캐싱이 자동으로 적용됩니다. OpenClaw는 블록 수준 캐시 마커를 삽입할 필요가 없습니다.
- OpenClaw는 `prompt_cache_key`를 사용하여 턴 간 캐시 라우팅을 안정적으로 유지하고 직접 OpenAI 호스트에서 `cacheRetention: "long"`을 선택한 경우에만 `prompt_cache_retention: "24h"`를 사용합니다.
- OpenAI 응답은 `usage.prompt_tokens_details.cached_tokens` (또는 Responses API 이벤트의 `input_tokens_details.cached_tokens`)를 통해 캐시된 프롬프트 토큰을 노출합니다. OpenClaw는 이를 `cacheRead`에 매핑합니다.
- OpenAI는 별도의 캐시 쓰기 토큰 카운터를 노출하지 않으므로 프로바이더가 캐시를 워밍하더라도 OpenAI 경로에서 `cacheWrite`는 `0`으로 유지됩니다.
- OpenAI는 `x-request-id`, `openai-processing-ms`, `x-ratelimit-*`와 같은 유용한 추적 및 속도 제한 헤더를 반환하지만 캐시 적중 계산은 헤더가 아닌 사용량 페이로드에서 가져와야 합니다.
- 실제로 OpenAI는 Anthropic 스타일의 이동하는 전체 기록 재사용보다 초기 접두사 캐시처럼 동작하는 경향이 있습니다. 안정적인 긴 접두사 텍스트 턴은 현재 라이브 프로브에서 캐시된 토큰 `4864` 고원 근처에 도달할 수 있으며, 도구 집약적이거나 MCP 스타일 트랜스크립트는 정확한 반복에서도 약 `4608` 캐시된 토큰 근처에 고원화됩니다.

### Anthropic Vertex

- Vertex AI의 Anthropic 모델 (`anthropic-vertex/*`)은 직접 Anthropic과 동일한 방식으로 `cacheRetention`을 지원합니다.
- `cacheRetention: "long"`은 Vertex AI 엔드포인트에서 실제 1시간 프롬프트 캐시 TTL에 매핑됩니다.
- `anthropic-vertex`의 기본 캐시 보존은 직접 Anthropic 기본값과 일치합니다.
- Vertex 요청은 경계 인식 캐시 셰이핑을 통해 라우팅되어 캐시 재사용이 프로바이더가 실제로 받는 것과 일치합니다.

### Amazon Bedrock

- Anthropic Claude 모델 참조 (`amazon-bedrock/*anthropic.claude*`)는 명시적인 `cacheRetention` 패스스루를 지원합니다.
- 비 Anthropic Bedrock 모델은 런타임에 `cacheRetention: "none"`으로 강제됩니다.

### OpenRouter Anthropic 모델

`openrouter/anthropic/*` 모델 참조의 경우 OpenClaw는 요청이 여전히 검증된 OpenRouter 경로를 대상으로 하는 경우에만 (`openrouter` 기본 엔드포인트 또는 `openrouter.ai`로 확인되는 모든 프로바이더/기본 URL) 프롬프트 캐시 재사용을 개선하기 위해 시스템/개발자 프롬프트 블록에 Anthropic `cache_control`을 삽입합니다.

임의의 OpenAI 호환 프록시 URL을 모델에 지정하면 OpenClaw는 해당 OpenRouter 특정 Anthropic 캐시 마커 삽입을 중단합니다.

### 기타 프로바이더

프로바이더가 이 캐시 모드를 지원하지 않으면 `cacheRetention`은 효과가 없습니다.

### Google Gemini 직접 API

- 직접 Gemini 전송 (`api: "google-generative-ai"`)은 업스트림 `cachedContentTokenCount`를 통해 캐시 적중을 보고합니다. OpenClaw는 이를 `cacheRead`에 매핑합니다.
- 직접 Gemini 모델에 `cacheRetention`이 설정된 경우 OpenClaw는 Google AI Studio 실행에서 시스템 프롬프트에 대한 `cachedContents` 리소스를 자동으로 생성, 재사용, 새로 고침합니다. 이제 캐시된 콘텐츠 핸들을 사전에 생성할 필요가 없습니다.
- 구성된 모델에서 `params.cachedContent` (또는 레거시 `params.cached_content`)를 통해 기존 Gemini 캐시된 콘텐츠 핸들을 전달할 수 있습니다.
- 이는 Anthropic/OpenAI 프롬프트 접두사 캐싱과는 별개입니다. Gemini의 경우 OpenClaw는 캐시 마커를 요청에 삽입하는 대신 프로바이더 네이티브 `cachedContents` 리소스를 관리합니다.

### Gemini CLI JSON 사용량

- Gemini CLI JSON 출력은 `stats.cached`를 통해 캐시 적중을 표면화할 수도 있습니다. OpenClaw는 이를 `cacheRead`에 매핑합니다.
- CLI가 직접 `stats.input` 값을 생략하는 경우 OpenClaw는 `stats.input_tokens - stats.cached`에서 입력 토큰을 도출합니다.
- 이것은 사용량 정규화만입니다. OpenClaw가 Gemini CLI에 대한 Anthropic/OpenAI 스타일 프롬프트 캐시 마커를 생성한다는 의미가 아닙니다.

## 시스템 프롬프트 캐시 경계

OpenClaw는 시스템 프롬프트를 내부 캐시 접두사 경계로 구분된 **안정적인 접두사**와 **휘발성 접미사**로 분할합니다. 경계 위의 콘텐츠 (도구 정의, 스킬 메타데이터, 워크스페이스 파일 및 기타 비교적 정적인 컨텍스트)는 턴 간에 바이트가 동일하게 유지되도록 정렬됩니다. 경계 아래의 콘텐츠 (예: `HEARTBEAT.md`, 런타임 타임스탬프 및 기타 턴별 메타데이터)는 캐시된 접두사를 무효화하지 않고 변경할 수 있습니다.

주요 설계 선택:

- 안정적인 워크스페이스 프로젝트 컨텍스트 파일은 `HEARTBEAT.md` 이전에 정렬되므로 하트비트 변동이 안정적인 접두사를 버스트하지 않습니다.
- 경계는 Anthropic 패밀리, OpenAI 패밀리, Google, CLI 전송 셰이핑 전반에 걸쳐 적용되므로 지원되는 모든 프로바이더가 동일한 접두사 안정성 혜택을 받습니다.
- Codex Responses 및 Anthropic Vertex 요청은 경계 인식 캐시 셰이핑을 통해 라우팅되므로 캐시 재사용이 프로바이더가 실제로 받는 것과 일치합니다.
- 시스템 프롬프트 지문은 (공백, 줄 끝, 훅 추가 컨텍스트, 런타임 기능 순서) 정규화되어 의미상 변경되지 않은 프롬프트가 턴 간에 KV/캐시를 공유합니다.

구성 또는 워크스페이스 변경 후 예상치 못한 `cacheWrite` 스파이크가 발생하면 변경이 캐시 경계 위 또는 아래에 있는지 확인하십시오. 휘발성 콘텐츠를 경계 아래로 이동하거나 안정화하면 문제가 종종 해결됩니다.

## OpenClaw 캐시 안정성 가드

OpenClaw는 또한 요청이 프로바이더에 도달하기 전에 여러 캐시 민감 페이로드 형태를 결정론적으로 유지합니다:

- 번들 MCP 도구 카탈로그는 도구 등록 전에 결정론적으로 정렬되므로 `listTools()` 순서 변경이 도구 블록을 변경하고 프롬프트 캐시 접두사를 버스트하지 않습니다.
- 지속된 이미지 블록이 있는 레거시 세션은 **가장 최근에 완료된 3개의 턴**을 그대로 유지합니다. 더 오래된 이미 처리된 이미지 블록은 이미지 집약적인 후속 조치가 큰 오래된 페이로드를 계속 재전송하지 않도록 마커로 교체될 수 있습니다.

## 조정 패턴

### 혼합 트래픽 (권장 기본값)

주 에이전트에 장기 기준선을 유지하고, 버스트 알림 에이전트에서는 캐싱을 비활성화합니다:

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-opus-4-6"
    models:
      "anthropic/claude-opus-4-6":
        params:
          cacheRetention: "long"
  list:
    - id: "research"
      default: true
      heartbeat:
        every: "55m"
    - id: "alerts"
      params:
        cacheRetention: "none"
```

### 비용 우선 기준선

- 기준 `cacheRetention: "short"` 설정.
- `contextPruning.mode: "cache-ttl"` 활성화.
- 워밍된 캐시의 혜택을 받는 에이전트에 대해서만 TTL 이하로 하트비트를 유지합니다.

## 캐시 진단

OpenClaw는 임베디드 에이전트 실행을 위한 전용 캐시 추적 진단을 노출합니다.

일반 사용자 대면 진단의 경우 `/status` 및 기타 사용량 요약은 라이브 세션 항목에 해당 카운터가 없을 때 최신 트랜스크립트 사용 항목을 `cacheRead` / `cacheWrite`의 폴백 소스로 사용할 수 있습니다.

## 라이브 회귀 테스트

OpenClaw는 반복 접두사, 도구 턴, 이미지 턴, MCP 스타일 도구 트랜스크립트, Anthropic 노 캐시 컨트롤에 대한 하나의 결합된 라이브 캐시 회귀 게이트를 유지합니다.

- `src/agents/live-cache-regression.live.test.ts`
- `src/agents/live-cache-regression-baseline.ts`

좁은 라이브 게이트를 다음으로 실행합니다:

```sh
OPENCLAW_LIVE_TEST=1 OPENCLAW_LIVE_CACHE_TEST=1 pnpm test:live:cache
```

기준 파일은 가장 최근 관찰된 라이브 번호와 테스트에서 사용하는 프로바이더별 회귀 플로어를 저장합니다.
러너는 또한 실행당 새 세션 ID와 프롬프트 네임스페이스를 사용하여 이전 캐시 상태가 현재 회귀 샘플을 오염시키지 않도록 합니다.

이 테스트는 프로바이더 전반에 걸쳐 동일한 성공 기준을 의도적으로 사용하지 않습니다.

### Anthropic 라이브 기대값

- `cacheWrite`를 통한 명시적 워밍업 쓰기를 기대합니다.
- Anthropic 캐시 제어가 대화를 통해 캐시 중단점을 진행시키기 때문에 반복 턴에서 거의 전체 기록 재사용을 기대합니다.
- 현재 라이브 어서션은 안정적, 도구, 이미지 경로에 대한 높은 적중률 임계값을 여전히 사용합니다.

### OpenAI 라이브 기대값

- `cacheRead`만 기대합니다. `cacheWrite`는 `0`으로 유지됩니다.
- 반복 턴 캐시 재사용을 Anthropic 스타일의 이동하는 전체 기록 재사용이 아닌 프로바이더별 고원으로 취급합니다.
- 현재 라이브 어서션은 `gpt-5.4-mini`에서 관찰된 라이브 동작에서 도출된 보수적인 플로어 검사를 사용합니다:
  - 안정적 접두사: `cacheRead >= 4608`, 적중률 `>= 0.90`
  - 도구 트랜스크립트: `cacheRead >= 4096`, 적중률 `>= 0.85`
  - 이미지 트랜스크립트: `cacheRead >= 3840`, 적중률 `>= 0.82`
  - MCP 스타일 트랜스크립트: `cacheRead >= 4096`, 적중률 `>= 0.85`

2026-04-04 신선한 결합 라이브 검증 결과:

- 안정적 접두사: `cacheRead=4864`, 적중률 `0.966`
- 도구 트랜스크립트: `cacheRead=4608`, 적중률 `0.896`
- 이미지 트랜스크립트: `cacheRead=4864`, 적중률 `0.954`
- MCP 스타일 트랜스크립트: `cacheRead=4608`, 적중률 `0.891`

결합 게이트의 최근 로컬 벽시계 시간은 약 `88초`였습니다.

어서션이 다른 이유:

- Anthropic은 명시적인 캐시 중단점과 이동하는 대화 기록 재사용을 노출합니다.
- OpenAI 프롬프트 캐싱은 여전히 정확한 접두사에 민감하지만 라이브 Responses 트래픽에서 효과적인 재사용 가능한 접두사는 전체 프롬프트보다 일찍 고원화될 수 있습니다.
- 그로 인해 Anthropic과 OpenAI를 단일 프로바이더 간 백분율 임계값으로 비교하면 잘못된 회귀가 발생합니다.

### `diagnostics.cacheTrace` 구성

```yaml
diagnostics:
  cacheTrace:
    enabled: true
    filePath: "~/.openclaw/logs/cache-trace.jsonl" # 선택 사항
    includeMessages: false # 기본값 true
    includePrompt: false # 기본값 true
    includeSystem: false # 기본값 true
```

기본값:

- `filePath`: `$OPENCLAW_STATE_DIR/logs/cache-trace.jsonl`
- `includeMessages`: `true`
- `includePrompt`: `true`
- `includeSystem`: `true`

### 환경 변수 토글 (일회성 디버깅)

- `OPENCLAW_CACHE_TRACE=1` 캐시 추적을 활성화합니다.
- `OPENCLAW_CACHE_TRACE_FILE=/path/to/cache-trace.jsonl` 출력 경로를 재정의합니다.
- `OPENCLAW_CACHE_TRACE_MESSAGES=0|1` 전체 메시지 페이로드 캡처를 전환합니다.
- `OPENCLAW_CACHE_TRACE_PROMPT=0|1` 프롬프트 텍스트 캡처를 전환합니다.
- `OPENCLAW_CACHE_TRACE_SYSTEM=0|1` 시스템 프롬프트 캡처를 전환합니다.

### 검사할 내용

- 캐시 추적 이벤트는 JSONL이며 `session:loaded`, `prompt:before`, `stream:context`, `session:after`와 같은 단계별 스냅샷을 포함합니다.
- 턴별 캐시 토큰 영향은 `cacheRead` 및 `cacheWrite`를 통해 일반 사용량 서페이스에서 볼 수 있습니다 (예: `/usage full` 및 세션 사용량 요약).
- Anthropic의 경우 캐싱이 활성화되면 `cacheRead`와 `cacheWrite` 모두를 기대합니다.
- OpenAI의 경우 캐시 적중 시 `cacheRead`를 기대하고 `cacheWrite`는 `0`으로 유지됩니다. OpenAI는 별도의 캐시 쓰기 토큰 필드를 게시하지 않습니다.
- 요청 추적이 필요한 경우 요청 ID와 속도 제한 헤더를 캐시 메트릭과 별도로 기록하십시오. OpenClaw의 현재 캐시 추적 출력은 원시 프로바이더 응답 헤더가 아닌 프롬프트/세션 형태 및 정규화된 토큰 사용량에 초점을 맞춥니다.

## 빠른 문제 해결

- 대부분의 턴에서 높은 `cacheWrite`: 휘발성 시스템 프롬프트 입력을 확인하고 모델/프로바이더가 캐시 설정을 지원하는지 확인하십시오.
- Anthropic에서 높은 `cacheWrite`: 종종 캐시 중단점이 매 요청마다 변경되는 콘텐츠에 도달한다는 의미입니다.
- 낮은 OpenAI `cacheRead`: 안정적인 접두사가 맨 앞에 있는지, 반복 접두사가 최소 1024 토큰인지, 동일한 `prompt_cache_key`가 캐시를 공유해야 하는 턴에 재사용되는지 확인하십시오.
- `cacheRetention` 효과 없음: 모델 키가 `agents.defaults.models["provider/model"]`과 일치하는지 확인하십시오.
- 캐시 설정이 있는 Bedrock Nova/Mistral 요청: 예상되는 런타임 강제 `none`.

관련 문서:

- [Anthropic](/providers/anthropic)
- [토큰 사용 및 비용](/reference/token-use)
- [세션 프루닝](/concepts/session-pruning)
- [게이트웨이 구성 레퍼런스](/gateway/configuration-reference)
