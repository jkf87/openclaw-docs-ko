---
title: "기능 추가 (기여자 가이드)"
description: "OpenClaw 플러그인 시스템에 새로운 공유 기능을 추가하기 위한 기여자 가이드"
---

# 기능 추가

::: info
이것은 OpenClaw 코어 개발자를 위한 **기여자 가이드**입니다. 외부 플러그인을 개발하는 경우,
  대신 [플러그인 개발](/plugins/building-plugins)을 참조하십시오.
:::


이미지 생성, 비디오 생성, 또는 일부 미래의 벤더 기반 기능 영역과 같은 새로운 도메인이 OpenClaw에 필요할 때 사용하십시오.

규칙:

- 플러그인 = 소유권 경계
- 기능 = 공유 코어 계약

즉, 벤더를 채널이나 도구에 직접 연결하는 것부터 시작해서는 안 됩니다. 기능을 정의하는 것부터 시작하십시오.

## 기능 생성 시기

다음 조건이 모두 충족될 때 새 기능을 생성합니다:

1. 둘 이상의 벤더가 구현할 수 있는 경우
2. 채널, 도구, 또는 기능 플러그인이 벤더에 관계없이 소비할 수 있어야 하는 경우
3. 코어가 폴백, 정책, 설정, 또는 전달 동작을 소유해야 하는 경우

벤더 전용 작업이고 아직 공유 계약이 없는 경우, 먼저 계약을 정의하십시오.

## 표준 순서

1. 타입이 지정된 코어 계약을 정의합니다.
2. 해당 계약에 대한 플러그인 등록을 추가합니다.
3. 공유 런타임 헬퍼를 추가합니다.
4. 하나의 실제 벤더 플러그인을 증거로 연결합니다.
5. 기능/채널 소비자를 런타임 헬퍼로 이전합니다.
6. 계약 테스트를 추가합니다.
7. 운영자용 설정 및 소유권 모델을 문서화합니다.

## 어디에 무엇이 들어가는지

코어:

- 요청/응답 타입
- 프로바이더 레지스트리 + 해결
- 폴백 동작
- 중첩된 객체, 와일드카드, 배열 항목, 구성 노드에 전파된 `title` / `description` 문서 메타데이터가 있는 설정 스키마
- 런타임 헬퍼 표면

벤더 플러그인:

- 벤더 API 호출
- 벤더 인증 처리
- 벤더별 요청 정규화
- 기능 구현 등록

기능/채널 플러그인:

- `api.runtime.*` 또는 일치하는 `plugin-sdk/*-runtime` 헬퍼 호출
- 벤더 구현을 직접 호출하지 않음

## 파일 체크리스트

새 기능의 경우 다음 영역을 수정해야 합니다:

- `src/&lt;capability&gt;/types.ts`
- `src/&lt;capability&gt;/...registry/runtime.ts`
- `src/plugins/types.ts`
- `src/plugins/registry.ts`
- `src/plugins/captured-registration.ts`
- `src/plugins/contracts/registry.ts`
- `src/plugins/runtime/types-core.ts`
- `src/plugins/runtime/index.ts`
- `src/plugin-sdk/&lt;capability&gt;.ts`
- `src/plugin-sdk/&lt;capability&gt;-runtime.ts`
- 하나 이상의 번들 플러그인 패키지
- 설정/문서/테스트

## 예시: 이미지 생성

이미지 생성은 표준 형태를 따릅니다:

1. 코어가 `ImageGenerationProvider`를 정의합니다
2. 코어가 `registerImageGenerationProvider(...)`를 노출합니다
3. 코어가 `runtime.imageGeneration.generate(...)`를 노출합니다
4. `openai`, `google`, `fal`, `minimax` 플러그인이 벤더 기반 구현을 등록합니다
5. 미래 벤더는 채널/도구를 변경하지 않고 동일한 계약을 등록할 수 있습니다

설정 키는 비전 분석 라우팅과 구분됩니다:

- `agents.defaults.imageModel` = 이미지 분석
- `agents.defaults.imageGenerationModel` = 이미지 생성

폴백과 정책이 명시적으로 유지되도록 이 두 가지를 구분하십시오.

## 검토 체크리스트

새 기능을 출시하기 전에 다음을 확인하십시오:

- 채널/도구가 벤더 코드를 직접 임포트하지 않음
- 런타임 헬퍼가 공유 경로임
- 최소 하나의 계약 테스트가 번들된 소유권을 검증함
- 설정 문서에 새 모델/설정 키가 명시됨
- 플러그인 문서에 소유권 경계가 설명됨

PR이 기능 계층을 건너뛰고 채널/도구에 벤더 동작을 하드코딩하면, 계약을 먼저 정의하도록 반려하십시오.
