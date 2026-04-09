---
description: "DeepSeek 설정 (인증 + 모델 선택)"
---

# DeepSeek

[DeepSeek](https://www.deepseek.com)은 OpenAI 호환 API를 통해 강력한 AI 모델을 제공합니다.

- 프로바이더: `deepseek`
- 인증: `DEEPSEEK_API_KEY`
- API: OpenAI 호환
- 기본 URL: `https://api.deepseek.com`

## 빠른 시작

API 키 설정 (권장: 게이트웨이에 저장):

```bash
openclaw onboard --auth-choice deepseek-api-key
```

API 키를 입력하라는 메시지가 표시되고 `deepseek/deepseek-chat`이 기본 모델로 설정됩니다.

## 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice deepseek-api-key \
  --deepseek-api-key "$DEEPSEEK_API_KEY" \
  --skip-health \
  --accept-risk
```

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우, `DEEPSEEK_API_KEY`가 해당 프로세스에서 사용 가능한지 확인하십시오 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).

## 내장 카탈로그

| 모델 참조                    | 이름              | 입력   | 컨텍스트 | 최대 출력 | 참고 사항                                         |
| ---------------------------- | ----------------- | ------ | -------- | --------- | ------------------------------------------------- |
| `deepseek/deepseek-chat`     | DeepSeek Chat     | 텍스트 | 131,072  | 8,192     | 기본 모델; DeepSeek V3.2 비사고 인터페이스        |
| `deepseek/deepseek-reasoner` | DeepSeek Reasoner | 텍스트 | 131,072  | 65,536    | 추론 활성화된 V3.2 인터페이스                     |

두 번들 모델 모두 현재 소스에서 스트리밍 사용 호환성을 광고합니다.

[platform.deepseek.com](https://platform.deepseek.com/api_keys)에서 API 키를 발급받으십시오.
