---
summary: "OpenClaw에서 지원하는 모델 프로바이더 (LLM)"
read_when:
  - 모델 프로바이더를 선택하려는 경우
  - LLM 인증 + 모델 선택에 대한 빠른 설정 예시가 필요한 경우
title: "모델 프로바이더 빠른 시작"
---

# 모델 프로바이더

OpenClaw는 다양한 LLM 프로바이더를 사용할 수 있습니다. 하나를 선택하고 인증한 후 기본
모델을 `provider/model` 형식으로 설정하십시오.

## 빠른 시작 (두 단계)

1. 프로바이더 인증 (보통 `openclaw onboard`를 통해).
2. 기본 모델 설정:

```json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-6" } } },
}
```

## 지원 프로바이더 (스타터 세트)

- [Alibaba Model Studio](/providers/alibaba)
- [Anthropic (API + Claude CLI)](/providers/anthropic)
- [Amazon Bedrock](/providers/bedrock)
- [BytePlus (국제)](/concepts/model-providers#byteplus-international)
- [Chutes](/providers/chutes)
- [ComfyUI](/providers/comfy)
- [Cloudflare AI Gateway](/providers/cloudflare-ai-gateway)
- [fal](/providers/fal)
- [Fireworks](/providers/fireworks)
- [GLM 모델](/providers/glm)
- [MiniMax](/providers/minimax)
- [Mistral](/providers/mistral)
- [Moonshot AI (Kimi + Kimi Coding)](/providers/moonshot)
- [OpenAI (API + Codex)](/providers/openai)
- [OpenCode (Zen + Go)](/providers/opencode)
- [OpenRouter](/providers/openrouter)
- [Qianfan](/providers/qianfan)
- [Qwen](/providers/qwen)
- [Runway](/providers/runway)
- [StepFun](/providers/stepfun)
- [Synthetic](/providers/synthetic)
- [Vercel AI Gateway](/providers/vercel-ai-gateway)
- [Venice (Venice AI)](/providers/venice)
- [xAI](/providers/xai)
- [Z.AI](/providers/zai)

## 추가 번들 프로바이더 변형

- `anthropic-vertex` - Google Vertex 자격 증명이 사용 가능한 경우 암묵적 Anthropic on Google Vertex 지원; 별도 온보딩 인증 선택 없음
- `copilot-proxy` - 로컬 VS Code Copilot Proxy 브리지; `openclaw onboard --auth-choice copilot-proxy` 사용
- `google-gemini-cli` - 비공식 Gemini CLI OAuth 흐름; 로컬 `gemini` 설치 필요 (`brew install gemini-cli` 또는 `npm install -g @google/gemini-cli`); 기본 모델 `google-gemini-cli/gemini-3-flash-preview`; `openclaw onboard --auth-choice google-gemini-cli` 또는 `openclaw models auth login --provider google-gemini-cli --set-default` 사용

전체 프로바이더 카탈로그(xAI, Groq, Mistral 등) 및 고급 구성에 대해서는
[모델 프로바이더](/concepts/model-providers)를 참조하십시오.
