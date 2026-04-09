---
summary: "OpenClaw에서 Z.AI (GLM 모델) 사용"
read_when:
  - OpenClaw에서 Z.AI / GLM 모델을 원하는 경우
  - 간단한 ZAI_API_KEY 설정이 필요한 경우
title: "Z.AI"
---

# Z.AI

Z.AI는 **GLM** 모델을 위한 API 플랫폼입니다. GLM을 위한 REST API를 제공하며 API 키로 인증합니다. Z.AI 콘솔에서 API 키를 생성하십시오. OpenClaw는 Z.AI API 키와 함께 `zai` 프로바이더를 사용합니다.

## CLI 설정

```bash
# 엔드포인트 자동 감지를 통한 일반 API 키 설정
openclaw onboard --auth-choice zai-api-key

# 글로벌 Coding Plan, Coding Plan 사용자에게 권장
openclaw onboard --auth-choice zai-coding-global

# 중국 리전 Coding Plan, Coding Plan 사용자에게 권장
openclaw onboard --auth-choice zai-coding-cn

# 일반 API
openclaw onboard --auth-choice zai-global

# 중국 리전 일반 API
openclaw onboard --auth-choice zai-cn
```

## 구성 스니펫

```json5
{
  env: { ZAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "zai/glm-5.1" } } },
}
```

`zai-api-key`를 사용하면 OpenClaw가 키에서 일치하는 Z.AI 엔드포인트를 감지하고 올바른 기본 URL을 자동으로 적용합니다. 특정 Coding Plan 또는 일반 API 표면을 강제하려면 명시적 리전 선택을 사용하십시오.

## 번들 GLM 카탈로그

OpenClaw는 현재 번들 `zai` 프로바이더에 다음을 초기 설정합니다:

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

- GLM 모델은 `zai/<model>`로 사용할 수 있습니다 (예: `zai/glm-5`).
- 기본 번들 모델 참조: `zai/glm-5.1`
- 알 수 없는 `glm-5*` id는 번들 프로바이더 경로에서 id가 현재 GLM-5 패밀리 형태와 일치할 때 `glm-4.7` 템플릿에서 프로바이더 소유 메타데이터를 합성하여 전방 해석됩니다.
- Z.AI 도구 호출 스트리밍에서 `tool_stream`이 기본적으로 활성화됩니다. 비활성화하려면 `agents.defaults.models["zai/<model>"].params.tool_stream`을 `false`로 설정하십시오.
- 모델 패밀리 개요는 [/providers/glm](/providers/glm)을 참조하십시오.
- Z.AI는 API 키와 함께 Bearer 인증을 사용합니다.
