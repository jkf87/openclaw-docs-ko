---
summary: "GLM 모델 패밀리 개요 + OpenClaw에서 사용하는 방법"
read_when:
  - OpenClaw에서 GLM 모델을 원하는 경우
  - 모델 명명 규칙 및 설정이 필요한 경우
title: "GLM 모델"
---

# GLM 모델

GLM은 Z.AI 플랫폼을 통해 사용 가능한 **모델 패밀리**(회사가 아님)입니다. OpenClaw에서 GLM 모델은 `zai` 프로바이더와 `zai/glm-5`와 같은 모델 ID를 통해 액세스합니다.

## CLI 설정

```bash
# 엔드포인트 자동 감지를 사용한 일반 API 키 설정
openclaw onboard --auth-choice zai-api-key

# Coding Plan Global, Coding Plan 사용자에게 권장
openclaw onboard --auth-choice zai-coding-global

# Coding Plan CN (중국 리전), Coding Plan 사용자에게 권장
openclaw onboard --auth-choice zai-coding-cn

# 일반 API
openclaw onboard --auth-choice zai-global

# 일반 API CN (중국 리전)
openclaw onboard --auth-choice zai-cn
```

## 구성 스니펫

```json5
{
  env: { ZAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "zai/glm-5.1" } } },
}
```

`zai-api-key`를 사용하면 OpenClaw가 키에서 일치하는 Z.AI 엔드포인트를 감지하고 올바른 기본 URL을 자동으로 적용합니다. 특정 Coding Plan 또는 일반 API 인터페이스를 강제하려는 경우 명시적 리전 선택을 사용하십시오.

## 현재 번들 GLM 모델

OpenClaw는 현재 다음 GLM 참조로 번들 `zai` 프로바이더를 시드합니다:

- `glm-5.1`
- `glm-5`
- `glm-5-turbo`
- `glm-5v-turbo`
- `glm-4.7`
- `glm-4.7-flash`
- `glm-4.7-flashx`
- `glm-4.6`
- `glm-4.6v`
- `glm-4.5`
- `glm-4.5-air`
- `glm-4.5-flash`
- `glm-4.5v`

## 참고 사항

- GLM 버전 및 가용성은 변경될 수 있습니다; 최신 정보는 Z.AI 문서를 확인하십시오.
- 기본 번들 모델 참조는 `zai/glm-5.1`입니다.
- 프로바이더 세부 정보는 [/providers/zai](/providers/zai)를 참조하십시오.
