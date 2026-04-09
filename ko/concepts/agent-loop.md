---
summary: "에이전트 루프 생명주기, 스트림, 대기 시맨틱"
read_when:
  - 에이전트 루프 또는 생명주기 이벤트의 정확한 흐름을 파악해야 할 때
title: "에이전트 루프"
---

# 에이전트 루프 (OpenClaw)

에이전트 루프는 에이전트의 완전한 "실제" 실행 흐름입니다: 입력 수신 → 컨텍스트 조립 → 모델 추론 → 도구 실행 → 스트리밍 응답 → 영속화. 이는 메시지를 액션과 최종 응답으로 변환하면서 세션 상태를 일관되게 유지하는 권위 있는 경로입니다.

OpenClaw에서 루프는 모델이 사고하고, 도구를 호출하고, 출력을 스트리밍하는 동안 생명주기 및 스트림 이벤트를 방출하는 세션당 단일 직렬화된 실행입니다. 이 문서에서는 이 루프가 엔드-투-엔드로 어떻게 연결되는지 설명합니다.

## 진입점

- 게이트웨이 RPC: `agent` 및 `agent.wait`.
- CLI: `agent` 명령어.

## 작동 방식 (상위 수준)

1. `agent` RPC는 파라미터를 검증하고, 세션(sessionKey/sessionId)을 확인하며, 세션 메타데이터를 영속화하고, 즉시 `{ runId, acceptedAt }`를 반환합니다.
2. `agentCommand`가 에이전트를 실행합니다:
   - 모델 + 사고/상세 기본값을 확인합니다
   - 스킬 스냅샷을 로드합니다
   - `runEmbeddedPiAgent`(pi-agent-core 런타임)를 호출합니다
   - 임베디드 루프가 생명주기 end/error를 방출하지 않으면 직접 방출합니다
3. `runEmbeddedPiAgent`:
   - 세션당 + 글로벌 큐를 통해 실행을 직렬화합니다
   - 모델 + 인증 프로파일을 확인하고 pi 세션을 빌드합니다
   - pi 이벤트를 구독하고 어시스턴트/도구 델타를 스트리밍합니다
   - 타임아웃을 강제 적용 → 초과 시 실행을 중단합니다
   - 페이로드 + 사용 메타데이터를 반환합니다
4. `subscribeEmbeddedPiSession`은 pi-agent-core 이벤트를 OpenClaw `agent` 스트림으로 브리지합니다:
   - 도구 이벤트 => `stream: "tool"`
   - 어시스턴트 델타 => `stream: "assistant"`
   - 생명주기 이벤트 => `stream: "lifecycle"` (`phase: "start" | "end" | "error"`)
5. `agent.wait`는 `waitForAgentRun`을 사용합니다:
   - `runId`에 대한 **생명주기 end/error**를 기다립니다
   - `{ status: ok|error|timeout, startedAt, endedAt, error? }`를 반환합니다

## 큐잉 + 동시성

- 실행은 세션 키(세션 레인)마다 직렬화되며, 선택적으로 글로벌 레인을 통해 처리됩니다.
- 이는 도구/세션 경합을 방지하고 세션 히스토리를 일관되게 유지합니다.
- 메시징 채널은 이 레인 시스템에 피드되는 큐 모드(collect/steer/followup)를 선택할 수 있습니다.
  [커맨드 큐](/concepts/queue)를 참조하십시오.

## 세션 + 워크스페이스 준비

- 워크스페이스가 확인되고 생성됩니다; 샌드박스 실행은 샌드박스 워크스페이스 루트로 리다이렉트될 수 있습니다.
- 스킬이 로드(또는 스냅샷에서 재사용)되어 환경 변수와 프롬프트에 주입됩니다.
- 부트스트랩/컨텍스트 파일이 확인되어 시스템 프롬프트 보고서에 주입됩니다.
- 세션 쓰기 잠금이 획득됩니다; 스트리밍 전에 `SessionManager`가 열리고 준비됩니다.

## 프롬프트 조립 + 시스템 프롬프트

- 시스템 프롬프트는 OpenClaw의 기본 프롬프트, 스킬 프롬프트, 부트스트랩 컨텍스트, 실행별 오버라이드로 구성됩니다.
- 모델별 한도 및 컴팩션 예약 토큰이 적용됩니다.
- 모델이 보는 내용은 [시스템 프롬프트](/concepts/system-prompt)를 참조하십시오.

## 후크 포인트 (인터셉트 가능한 위치)

OpenClaw에는 두 가지 후크 시스템이 있습니다:

- **내부 후크** (게이트웨이 후크): 명령 및 생명주기 이벤트를 위한 이벤트 기반 스크립트.
- **플러그인 후크**: 에이전트/도구 생명주기 및 게이트웨이 파이프라인 내부의 확장 포인트.

### 내부 후크 (게이트웨이 후크)

- **`agent:bootstrap`**: 시스템 프롬프트가 확정되기 전에 부트스트랩 파일을 빌드하는 동안 실행됩니다.
  부트스트랩 컨텍스트 파일을 추가/제거하는 데 사용합니다.
- **커맨드 후크**: `/new`, `/reset`, `/stop`, 기타 명령 이벤트 (후크 문서 참조).

설정 및 예제는 [후크](/automation/hooks)를 참조하십시오.

### 플러그인 후크 (에이전트 + 게이트웨이 생명주기)

이들은 에이전트 루프 또는 게이트웨이 파이프라인 내부에서 실행됩니다:

- **`before_model_resolve`**: 세션 이전(`messages` 없음)에 실행되어 모델 확인 전에 프로바이더/모델을 결정론적으로 오버라이드합니다.
- **`before_prompt_build`**: 세션 로드 후(`messages` 포함) 실행되어 프롬프트 제출 전에 `prependContext`, `systemPrompt`, `prependSystemContext`, 또는 `appendSystemContext`를 주입합니다. 턴별 동적 텍스트에는 `prependContext`를, 시스템 프롬프트 영역에 안정적으로 위치해야 하는 지침에는 system-context 필드를 사용하십시오.
- **`before_agent_start`**: 두 단계 중 하나에서 실행될 수 있는 레거시 호환성 후크입니다; 위의 명시적 후크를 선호하십시오.
- **`before_agent_reply`**: 인라인 액션 이후, LLM 호출 전에 실행되어 플러그인이 턴을 점유하고 합성 응답을 반환하거나 턴을 완전히 침묵시킬 수 있습니다.
- **`agent_end`**: 완료 후 최종 메시지 목록과 실행 메타데이터를 검사합니다.
- **`before_compaction` / `after_compaction`**: 컴팩션 사이클을 관찰하거나 주석을 달 수 있습니다.
- **`before_tool_call` / `after_tool_call`**: 도구 파라미터/결과를 인터셉트합니다.
- **`before_install`**: 내장 스캔 결과를 검사하고 선택적으로 스킬 또는 플러그인 설치를 차단합니다.
- **`tool_result_persist`**: 도구 결과를 세션 트랜스크립트에 쓰기 전에 동기적으로 변환합니다.
- **`message_received` / `message_sending` / `message_sent`**: 인바운드 + 아웃바운드 메시지 후크.
- **`session_start` / `session_end`**: 세션 생명주기 경계.
- **`gateway_start` / `gateway_stop`**: 게이트웨이 생명주기 이벤트.

아웃바운드/도구 가드에 대한 후크 결정 규칙:

- `before_tool_call`: `{ block: true }`는 터미널이며 하위 우선순위 핸들러를 중단합니다.
- `before_tool_call`: `{ block: false }`는 no-op이며 이전 블록을 해제하지 않습니다.
- `before_install`: `{ block: true }`는 터미널이며 하위 우선순위 핸들러를 중단합니다.
- `before_install`: `{ block: false }`는 no-op이며 이전 블록을 해제하지 않습니다.
- `message_sending`: `{ cancel: true }`는 터미널이며 하위 우선순위 핸들러를 중단합니다.
- `message_sending`: `{ cancel: false }`는 no-op이며 이전 취소를 해제하지 않습니다.

후크 API 및 등록 세부사항은 [플러그인 후크](/plugins/architecture#provider-runtime-hooks)를 참조하십시오.

## 스트리밍 + 부분 응답

- 어시스턴트 델타는 pi-agent-core에서 스트리밍되어 `assistant` 이벤트로 방출됩니다.
- 블록 스트리밍은 `text_end` 또는 `message_end`에서 부분 응답을 방출할 수 있습니다.
- 추론 스트리밍은 별도의 스트림 또는 블록 응답으로 방출될 수 있습니다.
- 청킹 및 블록 응답 동작은 [스트리밍](/concepts/streaming)을 참조하십시오.

## 도구 실행 + 메시징 도구

- 도구 시작/업데이트/종료 이벤트가 `tool` 스트림에서 방출됩니다.
- 도구 결과는 로깅/방출 전에 크기 및 이미지 페이로드에 대해 정제됩니다.
- 메시징 도구 전송은 중복 어시스턴트 확인을 억제하기 위해 추적됩니다.

## 응답 형성 + 억제

- 최종 페이로드는 다음으로 조립됩니다:
  - 어시스턴트 텍스트 (및 선택적 추론)
  - 인라인 도구 요약 (verbose + 허용된 경우)
  - 모델 오류 시 어시스턴트 오류 텍스트
- 정확한 침묵 토큰 `NO_REPLY` / `no_reply`는 아웃고잉 페이로드에서 필터링됩니다.
- 메시징 도구 중복은 최종 페이로드 목록에서 제거됩니다.
- 렌더링 가능한 페이로드가 남지 않고 도구가 오류를 일으킨 경우, 폴백 도구 오류 응답이 방출됩니다 (메시징 도구가 이미 사용자에게 보이는 응답을 전송하지 않은 경우).

## 컴팩션 + 재시도

- 자동 컴팩션은 `compaction` 스트림 이벤트를 방출하며 재시도를 트리거할 수 있습니다.
- 재시도 시, 중복 출력을 방지하기 위해 인메모리 버퍼와 도구 요약이 재설정됩니다.
- 컴팩션 파이프라인은 [컴팩션](/concepts/compaction)을 참조하십시오.

## 이벤트 스트림 (현재)

- `lifecycle`: `subscribeEmbeddedPiSession`에 의해 방출됨 (그리고 `agentCommand`의 폴백으로)
- `assistant`: pi-agent-core에서 스트리밍된 델타
- `tool`: pi-agent-core에서 스트리밍된 도구 이벤트

## 채팅 채널 처리

- 어시스턴트 델타는 채팅 `delta` 메시지로 버퍼링됩니다.
- **생명주기 end/error** 시 채팅 `final`이 방출됩니다.

## 타임아웃

- `agent.wait` 기본값: 30초 (대기만). `timeoutMs` 파라미터로 오버라이드 가능합니다.
- 에이전트 런타임: `agents.defaults.timeoutSeconds` 기본값 172800초(48시간); `runEmbeddedPiAgent` 중단 타이머에서 적용됩니다.
- LLM 유휴 타임아웃: `agents.defaults.llm.idleTimeoutSeconds`는 유휴 윈도우 이전에 응답 청크가 도착하지 않으면 모델 요청을 중단합니다. 느린 로컬 모델이나 추론/도구 호출 프로바이더에 명시적으로 설정하십시오; 비활성화하려면 0으로 설정하십시오. 설정하지 않으면 OpenClaw는 `agents.defaults.timeoutSeconds`가 구성된 경우 이를 사용하며, 그렇지 않으면 60초를 사용합니다. 명시적 LLM 또는 에이전트 타임아웃이 없는 크론 트리거 실행은 유휴 감시자를 비활성화하고 크론 외부 타임아웃에 의존합니다.

## 조기 종료될 수 있는 위치

- 에이전트 타임아웃 (중단)
- AbortSignal (취소)
- 게이트웨이 연결 해제 또는 RPC 타임아웃
- `agent.wait` 타임아웃 (대기만, 에이전트를 중단하지 않음)

## 관련 항목

- [도구](/tools/) — 사용 가능한 에이전트 도구
- [후크](/automation/hooks) — 에이전트 생명주기 이벤트에 의해 트리거되는 이벤트 기반 스크립트
- [컴팩션](/concepts/compaction) — 긴 대화를 요약하는 방법
- [실행 승인](/tools/exec-approvals) — 셸 명령어에 대한 승인 게이트
- [사고](/tools/thinking) — 사고/추론 수준 구성
