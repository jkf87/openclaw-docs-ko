---
summary: "레퍼런스: 프로바이더별 트랜스크립트 정리 및 수정 규칙"
read_when:
  - 트랜스크립트 형태와 관련된 프로바이더 요청 거부를 디버깅할 때
  - 트랜스크립트 정리 또는 도구 호출 수정 로직을 변경할 때
  - 프로바이더 간 도구 호출 ID 불일치를 조사할 때
title: "트랜스크립트 위생"
---

# 트랜스크립트 위생 (프로바이더 수정)

이 문서는 실행 전 (모델 컨텍스트 구성) 트랜스크립트에 적용되는 **프로바이더별 수정**을 설명합니다. 이것은 엄격한 프로바이더 요구 사항을 충족하기 위해 사용되는 **인메모리** 조정입니다. 이 위생 단계는 디스크에 저장된 JSONL 트랜스크립트를 다시 쓰지 **않습니다**. 그러나 세션이 로드되기 전에 잘못된 JSONL 파일을 수정하는 별도의 세션 파일 수정 패스가 유효하지 않은 줄을 삭제하여 파일을 다시 쓸 수 있습니다. 수정이 발생하면 원본 파일이 세션 파일 옆에 백업됩니다.

범위:

- 도구 호출 ID 정리
- 도구 호출 입력 검증
- 도구 결과 페어링 수정
- 턴 검증 / 순서 지정
- 사고 서명 정리
- 이미지 페이로드 정리
- 사용자 입력 출처 태깅 (세션 간 라우팅된 프롬프트)

트랜스크립트 저장 세부 사항이 필요한 경우 다음을 참조하십시오:

- [/reference/session-management-compaction](/reference/session-management-compaction)

---

## 실행 위치

모든 트랜스크립트 위생은 임베디드 러너에 중앙화되어 있습니다:

- 정책 선택: `src/agents/transcript-policy.ts`
- 정리/수정 적용: `src/agents/pi-embedded-runner/google.ts`의 `sanitizeSessionHistory`

정책은 `provider`, `modelApi`, `modelId`를 사용하여 적용할 내용을 결정합니다.

트랜스크립트 위생과 별도로, 세션 파일은 로드 전에 필요한 경우 수정됩니다:

- `src/agents/session-file-repair.ts`의 `repairSessionFileIfNeeded`
- `run/attempt.ts` 및 `compact.ts` (임베디드 러너)에서 호출됨

---

## 전역 규칙: 이미지 정리

이미지 페이로드는 크기 제한으로 인한 프로바이더 측 거부를 방지하기 위해 항상 정리됩니다 (과도한 base64 이미지 다운스케일/재압축).

이것은 또한 비전 가능 모델에 대한 이미지 기반 토큰 압박을 제어하는 데 도움이 됩니다.
낮은 최대 크기는 일반적으로 토큰 사용량을 줄입니다. 높은 크기는 세부 사항을 보존합니다.

구현:

- `src/agents/pi-embedded-helpers/images.ts`의 `sanitizeSessionMessagesImages`
- `src/agents/tool-images.ts`의 `sanitizeContentBlocksImages`
- 최대 이미지 면은 `agents.defaults.imageMaxDimensionPx` (기본값: `1200`)로 구성 가능합니다.

---

## 전역 규칙: 잘못된 도구 호출

`input`과 `arguments` 모두 없는 어시스턴트 도구 호출 블록은 모델 컨텍스트가 구성되기 전에 삭제됩니다. 이는 부분적으로 지속된 도구 호출 (예: 속도 제한 실패 후)로 인한 프로바이더 거부를 방지합니다.

구현:

- `src/agents/session-transcript-repair.ts`의 `sanitizeToolCallInputs`
- `src/agents/pi-embedded-runner/google.ts`의 `sanitizeSessionHistory`에서 적용됨

---

## 전역 규칙: 세션 간 입력 출처

에이전트가 `sessions_send`를 통해 다른 세션으로 프롬프트를 보낼 때 (에이전트 간 응답/알림 단계 포함), OpenClaw는 생성된 사용자 턴을 다음과 함께 지속합니다:

- `message.provenance.kind = "inter_session"`

이 메타데이터는 트랜스크립트 추가 시 작성되며 역할을 변경하지 않습니다
(`role: "user"`는 프로바이더 호환성을 위해 유지됨). 트랜스크립트 리더는 이를 사용하여 라우팅된 내부 프롬프트를 최종 사용자 작성 지침으로 취급하는 것을 피할 수 있습니다.

컨텍스트 재구성 중에 OpenClaw는 인메모리에서 해당 사용자 턴 앞에 짧은 `[Inter-session message]` 마커를 추가하여 모델이 외부 최종 사용자 지침과 구별할 수 있도록 합니다.

---

## 프로바이더 매트릭스 (현재 동작)

**OpenAI / OpenAI Codex**

- 이미지 정리만.
- OpenAI Responses/Codex 트랜스크립트에 대해 고아 추론 서명 (뒤따르는 콘텐츠 블록 없이 독립적인 추론 항목) 삭제.
- 도구 호출 ID 정리 없음.
- 도구 결과 페어링 수정 없음.
- 턴 검증 또는 재순서화 없음.
- 합성 도구 결과 없음.
- 사고 서명 제거 없음.

**Google (Generative AI / Gemini CLI / Antigravity)**

- 도구 호출 ID 정리: 엄격한 영숫자.
- 도구 결과 페어링 수정 및 합성 도구 결과.
- 턴 검증 (Gemini 스타일 턴 교대).
- Google 턴 순서 수정 (기록이 어시스턴트로 시작하면 작은 사용자 부트스트랩 추가).
- Antigravity Claude: 사고 서명 정규화; 서명되지 않은 사고 블록 삭제.

**Anthropic / Minimax (Anthropic 호환)**

- 도구 결과 페어링 수정 및 합성 도구 결과.
- 턴 검증 (엄격한 교대를 충족하기 위해 연속 사용자 턴 병합).

**Mistral (모델 ID 기반 감지 포함)**

- 도구 호출 ID 정리: strict9 (영숫자 길이 9).

**OpenRouter Gemini**

- 사고 서명 정리: 비 base64 `thought_signature` 값 제거 (base64 유지).

**그 외 모든 것**

- 이미지 정리만.

---

## 이전 동작 (2026.1.22 이전)

2026.1.22 릴리스 이전에 OpenClaw는 여러 레이어의 트랜스크립트 위생을 적용했습니다:

- **트랜스크립트 정리 확장**이 모든 컨텍스트 빌드에서 실행되며:
  - 도구 사용/결과 페어링 수정.
  - 도구 호출 ID 정리 (`_`/`-`를 보존하는 비엄격 모드 포함).
- 러너도 프로바이더별 정리를 수행하여 작업이 중복되었습니다.
- 다음을 포함한 정책 외부에서 추가 변형이 발생했습니다:
  - 지속 전에 어시스턴트 텍스트에서 `<final>` 태그 제거.
  - 빈 어시스턴트 오류 턴 삭제.
  - 도구 호출 후 어시스턴트 콘텐츠 트리밍.

이 복잡성은 크로스 프로바이더 회귀 (특히 `openai-responses` `call_id|fc_id` 페어링)를 일으켰습니다. 2026.1.22 정리는 확장을 제거하고, 러너에 로직을 중앙화하고, OpenAI를 이미지 정리 외에는 **변경 없음**으로 만들었습니다.
