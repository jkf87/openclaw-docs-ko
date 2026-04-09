---
summary: "OpenClaw이 프롬프트 컨텍스트를 구성하고 토큰 사용량 + 비용을 보고하는 방법"
read_when:
  - 토큰 사용량, 비용, 또는 컨텍스트 창을 설명할 때
  - 컨텍스트 성장 또는 컴팩션 동작을 디버깅할 때
title: "토큰 사용 및 비용"
---

# 토큰 사용 및 비용

OpenClaw는 문자가 아닌 **토큰**을 추적합니다. 토큰은 모델별로 다르지만 대부분의 OpenAI 스타일 모델은 영어 텍스트에서 토큰당 평균 ~4자입니다.

## 시스템 프롬프트 구성 방법

OpenClaw는 모든 실행 시 자체 시스템 프롬프트를 조합합니다. 포함 내용:

- 도구 목록 + 간단한 설명
- 스킬 목록 (메타데이터만; 지침은 `read`로 필요 시 로드됨)
- 자체 업데이트 지침
- 워크스페이스 + 부트스트랩 파일 (`AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, `HEARTBEAT.md`, 새로운 경우 `BOOTSTRAP.md`, 있는 경우 `MEMORY.md` 또는 소문자 폴백으로 `memory.md`). 대형 파일은 `agents.defaults.bootstrapMaxChars` (기본값: 20000)로 잘리고, 총 부트스트랩 주입은 `agents.defaults.bootstrapTotalMaxChars` (기본값: 150000)로 제한됩니다. `memory/*.md` 파일은 메모리 도구를 통해 요청 시 사용 가능하며 자동으로 주입되지 않습니다.
- 시간 (UTC + 사용자 시간대)
- 응답 태그 + 하트비트 동작
- 런타임 메타데이터 (호스트/OS/모델/thinking)

전체 분석은 [시스템 프롬프트](/concepts/system-prompt)를 참조하십시오.

## 컨텍스트 창에서 계산되는 내용

모델이 받는 모든 것이 컨텍스트 제한을 향해 계산됩니다:

- 시스템 프롬프트 (위에 나열된 모든 섹션)
- 대화 기록 (사용자 + 어시스턴트 메시지)
- 도구 호출 및 도구 결과
- 첨부/트랜스크립트 (이미지, 오디오, 파일)
- 컴팩션 요약 및 프루닝 아티팩트
- 프로바이더 래퍼 또는 보안 헤더 (표시되지 않지만 계산됨)

이미지의 경우 OpenClaw는 프로바이더 호출 전에 트랜스크립트/도구 이미지 페이로드를 다운스케일합니다.
`agents.defaults.imageMaxDimensionPx` (기본값: `1200`)를 사용하여 이를 조정합니다:

- 낮은 값은 일반적으로 비전 토큰 사용량과 페이로드 크기를 줄입니다.
- 높은 값은 OCR/UI 집약적 스크린샷에 대해 더 많은 시각적 세부 사항을 보존합니다.

실용적인 분석 (주입된 파일, 도구, 스킬, 시스템 프롬프트 크기별)은 `/context list` 또는 `/context detail`을 사용하십시오. [컨텍스트](/concepts/context)를 참조하십시오.

## 현재 토큰 사용량 확인 방법

채팅에서 다음을 사용하십시오:

- `/status` → 세션 모델, 컨텍스트 사용량, 마지막 응답 입력/출력 토큰, **예상 비용** (API 키 전용)이 있는 **이모지 풍부 상태 카드**.
- `/usage off|tokens|full` → 모든 응답에 **응답별 사용량 푸터**를 추가합니다.
  - 세션별로 지속됩니다 (`responseUsage`로 저장됨).
  - OAuth 인증은 **비용을 숨깁니다** (토큰만).
- `/usage cost` → OpenClaw 세션 로그에서 로컬 비용 요약을 표시합니다.

기타 서페이스:

- **TUI/웹 TUI:** `/status` + `/usage`가 지원됩니다.
- **CLI:** `openclaw status --usage` 및 `openclaw channels list`는 정규화된 프로바이더 할당량 창 (`X% left`, 응답별 비용 아님)을 표시합니다.
  현재 사용량 창 프로바이더: Anthropic, GitHub Copilot, Gemini CLI, OpenAI Codex, MiniMax, Xiaomi, z.ai.

사용량 서페이스는 표시 전에 일반적인 프로바이더 네이티브 필드 별칭을 정규화합니다.
OpenAI 패밀리 Responses 트래픽의 경우 `input_tokens` / `output_tokens`와 `prompt_tokens` / `completion_tokens` 모두를 포함하므로 전송별 필드 이름이 `/status`, `/usage`, 또는 세션 요약을 변경하지 않습니다.
Gemini CLI JSON 사용량도 정규화됩니다: 응답 텍스트는 `response`에서 가져오고, `stats.cached`는 `cacheRead`에 매핑되며, CLI가 명시적 `stats.input` 필드를 생략하면 `stats.input_tokens - stats.cached`가 사용됩니다.
네이티브 OpenAI 패밀리 Responses 트래픽의 경우 WebSocket/SSE 사용량 별칭도 동일한 방식으로 정규화되며, `total_tokens`가 없거나 `0`인 경우 총합이 정규화된 입력 + 출력으로 폴백합니다.
현재 세션 스냅샷이 부족한 경우 `/status` 및 `session_status`는 가장 최근 트랜스크립트 사용 로그에서 토큰/캐시 카운터와 활성 런타임 모델 레이블을 복구할 수도 있습니다. 기존 0이 아닌 라이브 값은 여전히 트랜스크립트 폴백 값보다 우선하며, 더 큰 프롬프트 지향 트랜스크립트 총합은 저장된 총합이 없거나 더 작은 경우 우선할 수 있습니다.
프로바이더 할당량 창의 사용량 인증은 사용 가능한 경우 프로바이더별 훅에서 가져옵니다. 그렇지 않으면 OpenClaw는 인증 프로파일, 환경, 구성에서 일치하는 OAuth/API 키 자격 증명으로 폴백합니다.

## 비용 추정 (표시되는 경우)

비용은 모델 가격 구성에서 추정됩니다:

```
models.providers.<provider>.models[].cost
```

이것은 `input`, `output`, `cacheRead`, `cacheWrite`에 대한 **1M 토큰당 USD**입니다. 가격이 없으면 OpenClaw는 토큰만 표시합니다. OAuth 토큰은 달러 비용을 표시하지 않습니다.

## 캐시 TTL 및 프루닝 영향

프로바이더 프롬프트 캐싱은 캐시 TTL 창 내에서만 적용됩니다. OpenClaw는 선택적으로 **cache-ttl 프루닝**을 실행할 수 있습니다: 캐시 TTL이 만료되면 세션을 프루닝한 다음 캐시 창을 재설정하여 후속 요청이 전체 기록을 다시 캐싱하는 대신 새로 캐시된 컨텍스트를 재사용할 수 있습니다. 이렇게 하면 세션이 TTL을 초과하여 유휴 상태가 될 때 캐시 쓰기 비용이 낮게 유지됩니다.

[게이트웨이 구성](/gateway/configuration)에서 구성하고 [세션 프루닝](/concepts/session-pruning)에서 동작 세부 사항을 확인하십시오.

하트비트는 유휴 간격에 걸쳐 캐시를 **워밍** 상태로 유지할 수 있습니다. 모델 캐시 TTL이 `1h`인 경우 하트비트 간격을 그 이하로 설정 (예: `55m`)하면 전체 프롬프트의 재캐싱을 피하고 캐시 쓰기 비용을 줄일 수 있습니다.

멀티 에이전트 설정에서 하나의 공유 모델 구성을 유지하고 `agents.list[].params.cacheRetention`으로 에이전트별 캐시 동작을 조정할 수 있습니다.

전체 설정별 가이드는 [프롬프트 캐싱](/reference/prompt-caching)을 참조하십시오.

Anthropic API 가격의 경우 캐시 읽기는 입력 토큰보다 훨씬 저렴하고, 캐시 쓰기는 더 높은 배수로 청구됩니다. 최신 요금 및 TTL 배수는 Anthropic의 프롬프트 캐싱 가격을 참조하십시오:
[https://docs.anthropic.com/docs/build-with-claude/prompt-caching](https://docs.anthropic.com/docs/build-with-claude/prompt-caching)

### 예시: 하트비트로 1h 캐시 워밍 유지

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-opus-4-6"
    models:
      "anthropic/claude-opus-4-6":
        params:
          cacheRetention: "long"
    heartbeat:
      every: "55m"
```

### 예시: 에이전트별 캐시 전략이 있는 혼합 트래픽

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-opus-4-6"
    models:
      "anthropic/claude-opus-4-6":
        params:
          cacheRetention: "long" # 대부분의 에이전트에 대한 기본 기준선
  list:
    - id: "research"
      default: true
      heartbeat:
        every: "55m" # 딥 세션을 위해 긴 캐시 워밍 유지
    - id: "alerts"
      params:
        cacheRetention: "none" # 버스트 알림에 대한 캐시 쓰기 방지
```

`agents.list[].params`는 선택된 모델의 `params` 위에 병합되므로 `cacheRetention`만 재정의하고 다른 모델 기본값은 그대로 상속할 수 있습니다.

### 예시: Anthropic 1M 컨텍스트 베타 헤더 활성화

Anthropic의 1M 컨텍스트 창은 현재 베타 게이팅됩니다. OpenClaw는 지원되는 Opus 또는 Sonnet 모델에서 `context1m`을 활성화하면 필요한 `anthropic-beta` 값을 주입할 수 있습니다.

```yaml
agents:
  defaults:
    models:
      "anthropic/claude-opus-4-6":
        params:
          context1m: true
```

이것은 Anthropic의 `context-1m-2025-08-07` 베타 헤더에 매핑됩니다.

이것은 해당 모델 항목에서 `context1m: true`가 설정된 경우에만 적용됩니다.

요구 사항: 자격 증명이 장문 컨텍스트 사용에 적합해야 합니다. 그렇지 않으면 Anthropic이 해당 요청에 대해 프로바이더 측 속도 제한 오류로 응답합니다.

OAuth/구독 토큰 (`sk-ant-oat-*`)으로 Anthropic을 인증하는 경우 Anthropic이 현재 해당 조합을 HTTP 401로 거부하기 때문에 OpenClaw는 `context-1m-*` 베타 헤더를 건너뜁니다.

## 토큰 압박 줄이기 팁

- `/compact`를 사용하여 긴 세션을 요약하십시오.
- 워크플로우에서 대형 도구 출력을 줄이십시오.
- 스크린샷이 많은 세션에는 `agents.defaults.imageMaxDimensionPx`를 낮추십시오.
- 스킬 설명을 짧게 유지하십시오 (스킬 목록은 프롬프트에 주입됨).
- 장황하고 탐색적인 작업에는 소형 모델을 선호하십시오.

정확한 스킬 목록 오버헤드 공식은 [스킬](/tools/skills)을 참조하십시오.
