---
title: "프로바이더 디렉터리"
description: "OpenClaw에서 지원하는 모델 프로바이더 (LLM)"
---

# 모델 프로바이더

OpenClaw는 다양한 LLM 프로바이더를 사용할 수 있습니다. 프로바이더를 선택하고 인증한 후
기본 모델을 `provider/model` 형식으로 설정하십시오.

채널 문서(WhatsApp/Telegram/Discord/Slack/Mattermost (플러그인) 등)를 찾고 계십니까? [채널](/channels)을 참조하십시오.

## 빠른 시작

1. 프로바이더 인증 (보통 `openclaw onboard`를 통해).
2. 기본 모델 설정:

```json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-6" } } },
}
```

## 프로바이더 문서

- [Alibaba Model Studio](/providers/alibaba)
- [Amazon Bedrock](/providers/bedrock)
- [Anthropic (API + Claude CLI)](/providers/anthropic)
- [Arcee AI (Trinity 모델)](/providers/arcee)
- [BytePlus (국제)](/concepts/model-providers#byteplus-international)
- [Chutes](/providers/chutes)
- [ComfyUI](/providers/comfy)
- [Cloudflare AI Gateway](/providers/cloudflare-ai-gateway)
- [DeepSeek](/providers/deepseek)
- [fal](/providers/fal)
- [Fireworks](/providers/fireworks)
- [GitHub Copilot](/providers/github-copilot)
- [GLM 모델](/providers/glm)
- [Google (Gemini)](/providers/google)
- [Groq (LPU 추론)](/providers/groq)
- [Hugging Face (추론)](/providers/huggingface)
- [inferrs (로컬 모델)](/providers/inferrs)
- [Kilocode](/providers/kilocode)
- [LiteLLM (통합 게이트웨이)](/providers/litellm)
- [MiniMax](/providers/minimax)
- [Mistral](/providers/mistral)
- [Moonshot AI (Kimi + Kimi Coding)](/providers/moonshot)
- [NVIDIA](/providers/nvidia)
- [Ollama (클라우드 + 로컬 모델)](/providers/ollama)
- [OpenAI (API + Codex)](/providers/openai)
- [OpenCode](/providers/opencode)
- [OpenCode Go](/providers/opencode-go)
- [OpenRouter](/providers/openrouter)
- [Perplexity (웹 검색)](/providers/perplexity-provider)
- [Qianfan](/providers/qianfan)
- [Qwen Cloud](/providers/qwen)
- [Runway](/providers/runway)
- [SGLang (로컬 모델)](/providers/sglang)
- [StepFun](/providers/stepfun)
- [Synthetic](/providers/synthetic)
- [Together AI](/providers/together)
- [Venice (Venice AI, 프라이버시 중심)](/providers/venice)
- [Vercel AI Gateway](/providers/vercel-ai-gateway)
- [Vydra](/providers/vydra)
- [vLLM (로컬 모델)](/providers/vllm)
- [Volcengine (Doubao)](/providers/volcengine)
- [xAI](/providers/xai)
- [Xiaomi](/providers/xiaomi)
- [Z.AI](/providers/zai)

## 공유 개요 페이지

- [추가 번들 변형](/providers/models#additional-bundled-provider-variants) - Anthropic Vertex, Copilot Proxy, Gemini CLI OAuth
- [이미지 생성](/tools/image-generation) - 공유 `image_generate` 도구, 프로바이더 선택, 장애 조치
- [음악 생성](/tools/music-generation) - 공유 `music_generate` 도구, 프로바이더 선택, 장애 조치
- [동영상 생성](/tools/video-generation) - 공유 `video_generate` 도구, 프로바이더 선택, 장애 조치

## 전사 프로바이더

- [Deepgram (오디오 전사)](/providers/deepgram)

## 커뮤니티 도구

- [Claude Max API Proxy](/providers/claude-max-api-proxy) - Claude 구독 자격 증명을 위한 커뮤니티 프록시 (사용 전 Anthropic 정책/약관 확인 필요)

전체 프로바이더 카탈로그(xAI, Groq, Mistral 등) 및 고급 구성에 대해서는
[모델 프로바이더](/concepts/model-providers)를 참조하십시오.
