---
summary: "/think, /fast, /verbose 및 추론 가시성을 위한 지시자 구문"
read_when:
  - Adjusting thinking, fast-mode, or verbose directive parsing or defaults
title: "추론 수준"
---

# 추론 수준 (/think 지시자)

## 기능

- 모든 인바운드 본문의 인라인 지시자: `/t <level>`, `/think:<level>`, 또는 `/thinking <level>`.
- 수준 (별칭): `off | minimal | low | medium | high | xhigh | adaptive`
  - minimal → "think"
  - low → "think hard"
  - medium → "think harder"
  - high → "ultrathink" (최대 예산)
  - xhigh → "ultrathink+" (GPT-5.2 + Codex 모델 전용)
  - adaptive → 프로바이더 관리 적응형 추론 예산 (Anthropic Claude 4.6 모델 계열에서 지원됨)
  - `x-high`, `x_high`, `extra-high`, `extra high`, `extra_high`는 `xhigh`에 매핑됩니다.
  - `highest`, `max`는 `high`에 매핑됩니다.
- 프로바이더 참고 사항:
  - Anthropic Claude 4.6 모델은 명시적 추론 수준이 설정되지 않은 경우 기본적으로 `adaptive`를 사용합니다.
  - Anthropic 호환 스트리밍 경로의 MiniMax(`minimax/*`)는 모델 파라미터 또는 요청 파라미터에서 추론을 명시적으로 설정하지 않는 한 기본적으로 `thinking: { type: "disabled" }`로 설정됩니다. 이는 MiniMax의 비네이티브 Anthropic 스트림 형식에서 누출된 `reasoning_content` 델타를 방지합니다.
  - Z.AI(`zai/*`)는 이진 추론(`on`/`off`)만 지원합니다. `off`가 아닌 모든 수준은 `on`으로 처리됩니다(맵핑: `low`).
  - Moonshot(`moonshot/*`)은 `/think off`를 `thinking: { type: "disabled" }`로 매핑하고 `off`가 아닌 수준은 `thinking: { type: "enabled" }`로 매핑합니다. 추론이 활성화된 경우 Moonshot은 `tool_choice` `auto|none`만 허용합니다. OpenClaw는 호환되지 않는 값을 `auto`로 정규화합니다.

## 결정 순서

1. 메시지의 인라인 지시자 (해당 메시지에만 적용).
2. 세션 재정의 (지시자 전용 메시지를 전송하여 설정).
3. 에이전트별 기본값 (설정의 `agents.list[].thinkingDefault`).
4. 전역 기본값 (설정의 `agents.defaults.thinkingDefault`).
5. 폴백: Anthropic Claude 4.6 모델은 `adaptive`, 기타 추론 가능 모델은 `low`, 그 외는 `off`.

## 세션 기본값 설정

- **오직** 지시자만 포함된 메시지를 전송합니다 (공백 허용). 예: `/think:medium` 또는 `/t high`.
- 해당 설정은 현재 세션에 유지됩니다 (기본적으로 발신자별). `/think:off` 또는 세션 유휴 재설정으로 지워집니다.
- 확인 응답이 전송됩니다 (`Thinking level set to high.` / `Thinking disabled.`). 수준이 잘못된 경우 (예: `/thinking big`), 명령이 거부되고 힌트와 함께 세션 상태는 변경되지 않습니다.
- `/think` (또는 `/think:`)를 인수 없이 전송하면 현재 추론 수준을 확인할 수 있습니다.

## 에이전트별 적용

- **임베디드 Pi**: 결정된 수준이 인프로세스 Pi 에이전트 런타임에 전달됩니다.

## 빠른 모드 (/fast)

- 수준: `on|off`.
- 지시자 전용 메시지는 세션 빠른 모드 재정의를 전환하고 `Fast mode enabled.` / `Fast mode disabled.`로 응답합니다.
- `/fast` (또는 `/fast status`)를 모드 없이 전송하면 현재 유효한 빠른 모드 상태를 확인할 수 있습니다.
- OpenClaw는 다음 순서로 빠른 모드를 결정합니다:
  1. 인라인/지시자 전용 `/fast on|off`
  2. 세션 재정의
  3. 에이전트별 기본값 (`agents.list[].fastModeDefault`)
  4. 모델별 설정: `agents.defaults.models["<provider>/<model>"].params.fastMode`
  5. 폴백: `off`
- `openai/*`의 경우 빠른 모드는 지원되는 Responses 요청에서 `service_tier=priority`를 전송하여 OpenAI 우선 처리에 매핑됩니다.
- `openai-codex/*`의 경우 빠른 모드는 Codex Responses에 동일한 `service_tier=priority` 플래그를 전송합니다. OpenClaw는 두 인증 경로 모두에 걸쳐 하나의 공유 `/fast` 토글을 유지합니다.
- OAuth 인증 트래픽을 포함하여 직접 공개 `anthropic/*` 요청의 경우 빠른 모드는 Anthropic 서비스 티어에 매핑됩니다. `/fast on`은 `service_tier=auto`, `/fast off`는 `service_tier=standard_only`로 설정합니다.
- Anthropic 호환 경로의 `minimax/*`에서 `/fast on` (또는 `params.fastMode: true`)은 `MiniMax-M2.7`을 `MiniMax-M2.7-highspeed`로 재작성합니다.
- 명시적 Anthropic `serviceTier` / `service_tier` 모델 파라미터는 둘 다 설정된 경우 빠른 모드 기본값을 재정의합니다. OpenClaw는 비-Anthropic 프록시 베이스 URL에 대해 Anthropic 서비스 티어 주입을 건너뜁니다.

## 자세한 지시자 (/verbose 또는 /v)

- 수준: `on` (최소) | `full` | `off` (기본값).
- 지시자 전용 메시지는 세션 자세한 출력을 전환하고 `Verbose logging enabled.` / `Verbose logging disabled.`로 응답합니다. 잘못된 수준은 상태를 변경하지 않고 힌트를 반환합니다.
- `/verbose off`는 명시적 세션 재정의를 저장합니다. 세션 UI에서 `inherit`를 선택하여 지울 수 있습니다.
- 인라인 지시자는 해당 메시지에만 영향을 미칩니다. 그 외에는 세션/전역 기본값이 적용됩니다.
- `/verbose` (또는 `/verbose:`)를 인수 없이 전송하면 현재 자세한 출력 수준을 확인할 수 있습니다.
- 자세한 출력이 켜져 있으면 구조화된 도구 결과를 내보내는 에이전트 (Pi, 기타 JSON 에이전트)는 각 도구 호출을 자체 메타데이터 전용 메시지로 전송합니다. 사용 가능한 경우 `<emoji> <tool-name>: <arg>` (경로/명령)로 접두사가 붙습니다. 이 도구 요약은 각 도구가 시작되는 즉시 전송됩니다 (별도 버블, 스트리밍 델타가 아님).
- 도구 실패 요약은 일반 모드에서도 표시되지만 자세한 출력이 `on` 또는 `full`이 아닌 경우 원시 오류 세부 정보 접미사는 숨겨집니다.
- 자세한 출력이 `full`인 경우 도구 출력도 완료 후 전달됩니다 (별도 버블, 안전한 길이로 잘림). 실행 중에 `/verbose on|full|off`를 전환하면 이후 도구 버블은 새 설정을 따릅니다.

## 추론 가시성 (/reasoning)

- 수준: `on|off|stream`.
- 지시자 전용 메시지는 응답에 추론 블록이 표시되는지 여부를 전환합니다.
- 활성화된 경우 추론은 `Reasoning:`으로 접두사가 붙은 **별도 메시지**로 전송됩니다.
- `stream` (Telegram 전용): 응답이 생성되는 동안 Telegram 초안 버블에 추론을 스트리밍한 다음 추론 없이 최종 답변을 전송합니다.
- 별칭: `/reason`.
- `/reasoning` (또는 `/reasoning:`)을 인수 없이 전송하면 현재 추론 수준을 확인할 수 있습니다.
- 결정 순서: 인라인 지시자, 세션 재정의, 에이전트별 기본값 (`agents.list[].reasoningDefault`), 폴백 (`off`).

## 관련 항목

- 상승된 모드 문서는 [상승된 모드](/tools/elevated)에 있습니다.

## 하트비트

- 하트비트 프로브 본문은 구성된 하트비트 프롬프트입니다 (기본값: `Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.`). 하트비트 메시지의 인라인 지시자는 일반적으로 적용됩니다 (단, 하트비트에서 세션 기본값 변경은 피하십시오).
- 하트비트 전달은 기본적으로 최종 페이로드만 전달합니다. 별도의 `Reasoning:` 메시지도 전송하려면 (사용 가능한 경우) `agents.defaults.heartbeat.includeReasoning: true` 또는 에이전트별 `agents.list[].heartbeat.includeReasoning: true`를 설정하십시오.

## 웹 채팅 UI

- 웹 채팅 추론 선택기는 페이지 로드 시 인바운드 세션 저장소/설정에서 저장된 세션의 수준을 미러링합니다.
- 다른 수준을 선택하면 다음 전송을 기다리지 않고 `sessions.patch`를 통해 세션 재정의가 즉시 작성됩니다. 이것은 일회성 `thinkingOnce` 재정의가 아닙니다.
- 첫 번째 옵션은 항상 `Default (<resolved level>)`이며, 여기서 결정된 기본값은 활성 세션 모델에서 가져옵니다. Anthropic/Bedrock의 Claude 4.6은 `adaptive`, 기타 추론 가능 모델은 `low`, 그 외는 `off`.
- 선택기는 프로바이더를 인식합니다:
  - 대부분의 프로바이더는 `off | minimal | low | medium | high | adaptive`를 표시합니다
  - Z.AI는 이진 `off | on`을 표시합니다
- `/think:<level>`은 계속 작동하며 동일한 저장된 세션 수준을 업데이트하므로 채팅 지시자와 선택기는 동기화된 상태를 유지합니다.
