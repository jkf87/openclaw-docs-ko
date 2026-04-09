---
title: "도구 루프 감지"
description: "반복적인 도구 호출 루프를 감지하는 가드레일 활성화 및 조정 방법"
---

# 도구 루프 감지

OpenClaw는 에이전트가 반복적인 도구 호출 패턴에 갇히는 것을 방지할 수 있습니다.
가드는 **기본적으로 비활성화되어 있습니다**.

엄격한 설정을 사용하면 합법적인 반복 호출을 차단할 수 있으므로 필요한 경우에만 활성화하십시오.

## 존재 이유

- 진행되지 않는 반복 시퀀스를 감지합니다.
- 고빈도 결과 없음 루프(동일 도구, 동일 입력, 반복 오류)를 감지합니다.
- 알려진 폴링 도구에 대한 특정 반복 호출 패턴을 감지합니다.

## 설정 블록

전역 기본값:

```json5
{
  tools: {
    loopDetection: {
      enabled: false,
      historySize: 30,
      warningThreshold: 10,
      criticalThreshold: 20,
      globalCircuitBreakerThreshold: 30,
      detectors: {
        genericRepeat: true,
        knownPollNoProgress: true,
        pingPong: true,
      },
    },
  },
}
```

에이전트별 재정의 (선택 사항):

```json5
{
  agents: {
    list: [
      {
        id: "safe-runner",
        tools: {
          loopDetection: {
            enabled: true,
            warningThreshold: 8,
            criticalThreshold: 16,
          },
        },
      },
    ],
  },
}
```

### 필드 동작

- `enabled`: 마스터 스위치. `false`는 루프 감지를 수행하지 않음을 의미합니다.
- `historySize`: 분석을 위해 유지되는 최근 도구 호출 수.
- `warningThreshold`: 패턴을 경고 전용으로 분류하기 전의 임계값.
- `criticalThreshold`: 반복 루프 패턴을 차단하기 위한 임계값.
- `globalCircuitBreakerThreshold`: 전역 진행 없음 차단기 임계값.
- `detectors.genericRepeat`: 동일 도구 + 동일 파라미터 패턴의 반복을 감지합니다.
- `detectors.knownPollNoProgress`: 상태 변경 없는 알려진 폴링 유사 패턴을 감지합니다.
- `detectors.pingPong`: 교대 핑퐁 패턴을 감지합니다.

## 권장 설정

- `enabled: true`로 시작하고 기본값을 유지합니다.
- `warningThreshold < criticalThreshold < globalCircuitBreakerThreshold` 순서를 유지합니다.
- 거짓 양성이 발생하는 경우:
  - `warningThreshold` 및/또는 `criticalThreshold`를 높입니다
  - (선택적으로) `globalCircuitBreakerThreshold`를 높입니다
  - 문제를 일으키는 감지기만 비활성화합니다
  - `historySize`를 줄여 더 적은 엄격한 이력 컨텍스트를 사용합니다

## 로그 및 예상 동작

루프가 감지되면 OpenClaw는 루프 이벤트를 보고하고 심각도에 따라 다음 도구 주기를 차단하거나 억제합니다.
이렇게 하면 사용자를 토큰 낭비와 잠금에서 보호하면서 일반 도구 접근을 유지합니다.

- 경고 및 임시 억제를 먼저 선호합니다.
- 반복적인 증거가 축적될 때만 에스컬레이션합니다.

## 참고 사항

- `tools.loopDetection`은 에이전트 수준 재정의와 병합됩니다.
- 에이전트별 설정은 전역 값을 완전히 재정의하거나 확장합니다.
- 설정이 없으면 가드레일이 꺼져 있습니다.
