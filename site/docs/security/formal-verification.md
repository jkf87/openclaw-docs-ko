---
title: "형식 검증 (보안 모델)"
description: "OpenClaw의 최고 위험 경로에 대한 기계 검증 보안 모델."
---

# 형식 검증 (보안 모델)

이 페이지는 OpenClaw의 **형식 보안 모델** (오늘은 TLA+/TLC; 필요에 따라 더 추가)을 추적합니다.

> 참고: 일부 오래된 링크는 이전 프로젝트 이름을 참조할 수 있습니다.

**목표 (북극성):** OpenClaw가 명시적 가정 하에 의도된 보안 정책(인증, 세션 격리, 도구 게이팅, 잘못된 구성 안전성)을 시행한다는 기계 검증된 논증을 제공합니다.

**현재 상태:** 실행 가능한, 공격자 주도의 **보안 회귀 스위트**:

- 각 주장은 유한 상태 공간에 대해 실행 가능한 모델 검사가 있습니다.
- 많은 주장에는 현실적인 버그 클래스에 대한 반례 추적을 생성하는 **음성 모델**이 쌍으로 있습니다.

**아직 아닌 것:** "OpenClaw가 모든 면에서 안전하다" 또는 전체 TypeScript 구현이 올바르다는 증명.

## 모델이 있는 위치

모델은 별도의 리포지토리에 유지됩니다: [vignesh07/openclaw-formal-models](https://github.com/vignesh07/openclaw-formal-models).

## 중요한 주의 사항

- 이것은 **모델**이지 전체 TypeScript 구현이 아닙니다. 모델과 코드 간의 드리프트가 가능합니다.
- 결과는 TLC가 탐색하는 상태 공간에 의해 제한됩니다. "녹색"이 모델화된 가정과 경계를 넘어서는 보안을 의미하지 않습니다.
- 일부 주장은 명시적 환경 가정(예: 올바른 배포, 올바른 구성 입력)에 의존합니다.

## 결과 재현

현재 결과는 모델 리포지토리를 로컬로 복제하고 TLC를 실행하여 재현됩니다 (아래 참조). 향후 반복에서는 다음을 제공할 수 있습니다:

- 공개 아티팩트가 있는 CI 실행 모델 (반례 추적, 실행 로그)
- 소규모 제한 검사를 위한 호스팅된 "이 모델 실행" 워크플로

시작하기:

```bash
git clone https://github.com/vignesh07/openclaw-formal-models
cd openclaw-formal-models

# Java 11+ 필요 (TLC는 JVM에서 실행됨).
# 리포지토리는 고정된 `tla2tools.jar` (TLA+ 도구)를 제공하고 `bin/tlc` + Make 대상을 제공합니다.

make &lt;target&gt;
```

### 게이트웨이 노출 및 열린 게이트웨이 잘못 구성

**주장:** 인증 없이 루프백을 초과하는 바인딩은 원격 손상을 가능하게 하거나 노출을 증가시킬 수 있습니다. 토큰/비밀번호는 미인증 공격자를 차단합니다 (모델 가정에 따름).

- 녹색 실행:
  - `make gateway-exposure-v2`
  - `make gateway-exposure-v2-protected`
- 빨간색 (예상):
  - `make gateway-exposure-v2-negative`

모델 리포지토리의 `docs/gateway-exposure-matrix.md`도 참조하십시오.

### 노드 exec 파이프라인 (최고 위험 기능)

**주장:** `exec host=node`는 (a) 노드 명령 허용 목록 및 선언된 명령과 (b) 구성된 경우 라이브 승인이 필요합니다. 승인은 재생을 방지하기 위해 토큰화됩니다 (모델에서).

- 녹색 실행:
  - `make nodes-pipeline`
  - `make approvals-token`
- 빨간색 (예상):
  - `make nodes-pipeline-negative`
  - `make approvals-token-negative`

### 페어링 저장소 (DM 게이팅)

**주장:** 페어링 요청은 TTL과 대기 요청 한도를 준수합니다.

- 녹색 실행:
  - `make pairing`
  - `make pairing-cap`
- 빨간색 (예상):
  - `make pairing-negative`
  - `make pairing-cap-negative`

### 인그레스 게이팅 (멘션 + 제어 명령 우회)

**주장:** 멘션이 필요한 그룹 컨텍스트에서 미승인 "제어 명령"은 멘션 게이팅을 우회할 수 없습니다.

- 녹색:
  - `make ingress-gating`
- 빨간색 (예상):
  - `make ingress-gating-negative`

### 라우팅/세션 키 격리

**주장:** 서로 다른 피어의 DM은 명시적으로 연결/구성되지 않는 한 동일한 세션으로 합쳐지지 않습니다.

- 녹색:
  - `make routing-isolation`
- 빨간색 (예상):
  - `make routing-isolation-negative`

## v1++: 추가 제한 모델 (동시성, 재시도, 추적 정확성)

이것은 실제 실패 모드 (비원자적 업데이트, 재시도, 메시지 팬아웃) 주변의 신뢰성을 강화하는 후속 모델입니다.

### 페어링 저장소 동시성 / 멱등성

**주장:** 페어링 저장소는 인터리빙 하에서도 `MaxPending`과 멱등성을 시행해야 합니다 (즉, "확인-후-쓰기"는 원자적/잠금 상태여야 합니다; 새로 고침은 중복을 생성하지 않아야 합니다).

- 녹색 실행:
  - `make pairing-race` (원자적/잠금 한도 확인)
  - `make pairing-idempotency`
  - `make pairing-refresh`
  - `make pairing-refresh-race`
- 빨간색 (예상):
  - `make pairing-race-negative` (비원자적 begin/commit 한도 경쟁)
  - `make pairing-idempotency-negative`
  - `make pairing-refresh-negative`
  - `make pairing-refresh-race-negative`

### 인그레스 추적 상관관계 / 멱등성

**주장:** 수집은 팬아웃 전체에서 추적 상관관계를 보존하고 프로바이더 재시도 하에서 멱등적이어야 합니다.

- 녹색:
  - `make ingress-trace`
  - `make ingress-trace2`
  - `make ingress-idempotency`
  - `make ingress-dedupe-fallback`
- 빨간색 (예상):
  - `make ingress-trace-negative`
  - `make ingress-trace2-negative`
  - `make ingress-idempotency-negative`
  - `make ingress-dedupe-fallback-negative`

### 라우팅 dmScope 우선 순위 + identityLinks

**주장:** 라우팅은 기본적으로 DM 세션을 격리하고 명시적으로 구성된 경우에만 세션을 합칩니다 (채널 우선 순위 + 아이덴티티 링크).

- 녹색:
  - `make routing-precedence`
  - `make routing-identitylinks`
- 빨간색 (예상):
  - `make routing-precedence-negative`
  - `make routing-identitylinks-negative`
