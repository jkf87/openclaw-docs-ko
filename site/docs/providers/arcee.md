---
title: "Arcee AI"
description: "Arcee AI 설정 (인증 + 모델 선택)"
---

# Arcee AI

[Arcee AI](https://arcee.ai)는 OpenAI 호환 API를 통해 혼합 전문가(mixture-of-experts) 모델인 Trinity 패밀리에 대한 액세스를 제공합니다. 모든 Trinity 모델은 Apache 2.0 라이선스입니다.

Arcee AI 모델은 Arcee 플랫폼을 통해 직접 액세스하거나 [OpenRouter](/providers/openrouter)를 통해 액세스할 수 있습니다.

- 프로바이더: `arcee`
- 인증: `ARCEEAI_API_KEY` (직접) 또는 `OPENROUTER_API_KEY` (OpenRouter 경유)
- API: OpenAI 호환
- 기본 URL: `https://api.arcee.ai/api/v1` (직접) 또는 `https://openrouter.ai/api/v1` (OpenRouter)

## 빠른 시작

1. [Arcee AI](https://chat.arcee.ai/) 또는 [OpenRouter](https://openrouter.ai/keys)에서 API 키를 발급받으십시오.

2. API 키 설정 (권장: 게이트웨이에 저장):

```bash
# 직접 (Arcee 플랫폼)
openclaw onboard --auth-choice arceeai-api-key

# OpenRouter 경유
openclaw onboard --auth-choice arceeai-openrouter
```

3. 기본 모델 설정:

```json5
{
  agents: {
    defaults: {
      model: { primary: "arcee/trinity-large-thinking" },
    },
  },
}
```

## 비대화형 예시

```bash
# 직접 (Arcee 플랫폼)
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice arceeai-api-key \
  --arceeai-api-key "$ARCEEAI_API_KEY"

# OpenRouter 경유
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice arceeai-openrouter \
  --openrouter-api-key "$OPENROUTER_API_KEY"
```

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우, `ARCEEAI_API_KEY`
(또는 `OPENROUTER_API_KEY`)가 해당 프로세스에서 사용 가능한지 확인하십시오 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).

## 내장 카탈로그

OpenClaw는 현재 다음 번들 Arcee 카탈로그를 제공합니다:

| 모델 참조                      | 이름                   | 입력 | 컨텍스트 | 비용 (입력/출력 백만 토큰당) | 참고 사항                                  |
| ------------------------------ | ---------------------- | ---- | -------- | ---------------------------- | ------------------------------------------ |
| `arcee/trinity-large-thinking` | Trinity Large Thinking | 텍스트 | 256K   | $0.25 / $0.90                | 기본 모델; 추론 활성화                    |
| `arcee/trinity-large-preview`  | Trinity Large Preview  | 텍스트 | 128K   | $0.25 / $1.00                | 범용; 400B 파라미터, 13B 활성              |
| `arcee/trinity-mini`           | Trinity Mini 26B       | 텍스트 | 128K   | $0.045 / $0.15               | 빠르고 비용 효율적; 함수 호출             |

동일한 모델 참조는 직접 및 OpenRouter 설정 모두에서 사용할 수 있습니다 (예: `arcee/trinity-large-thinking`).

온보딩 프리셋은 `arcee/trinity-large-thinking`을 기본 모델로 설정합니다.

## 지원 기능

- 스트리밍
- 도구 사용 / 함수 호출
- 구조화된 출력 (JSON 모드 및 JSON 스키마)
- 확장 사고 (Trinity Large Thinking)
