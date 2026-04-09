---
description: "Fireworks 설정 (인증 + 모델 선택)"
---

# Fireworks

[Fireworks](https://fireworks.ai)는 OpenAI 호환 API를 통해 오픈웨이트 및 라우팅된 모델을 제공합니다. OpenClaw는 이제 번들 Fireworks 프로바이더 플러그인을 포함합니다.

- 프로바이더: `fireworks`
- 인증: `FIREWORKS_API_KEY`
- API: OpenAI 호환 chat/completions
- 기본 URL: `https://api.fireworks.ai/inference/v1`
- 기본 모델: `fireworks/accounts/fireworks/routers/kimi-k2p5-turbo`

## 빠른 시작

온보딩을 통해 Fireworks 인증을 설정하십시오:

```bash
openclaw onboard --auth-choice fireworks-api-key
```

이렇게 하면 Fireworks 키가 OpenClaw 구성에 저장되고 Fire Pass 스타터 모델이 기본값으로 설정됩니다.

## 비대화형 예시

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice fireworks-api-key \
  --fireworks-api-key "$FIREWORKS_API_KEY" \
  --skip-health \
  --accept-risk
```

## 환경 참고 사항

게이트웨이가 대화형 셸 외부에서 실행되는 경우, `FIREWORKS_API_KEY`가 해당 프로세스에서도 사용 가능한지 확인하십시오. `~/.profile`에만 있는 키는 해당 환경이 거기에 가져오지 않는 한 launchd/systemd 데몬에 도움이 되지 않습니다.

## 내장 카탈로그

| 모델 참조                                              | 이름                        | 입력           | 컨텍스트  | 최대 출력 | 참고 사항                                  |
| ------------------------------------------------------ | --------------------------- | -------------- | --------- | --------- | ------------------------------------------ |
| `fireworks/accounts/fireworks/routers/kimi-k2p5-turbo` | Kimi K2.5 Turbo (Fire Pass) | 텍스트, 이미지 | 256,000   | 256,000   | Fireworks의 기본 번들 스타터 모델          |

## 커스텀 Fireworks 모델 ID

OpenClaw는 동적 Fireworks 모델 ID도 허용합니다. Fireworks에서 표시하는 정확한 모델 또는 라우터 ID를 사용하고 `fireworks/`를 접두사로 추가하십시오.

예시:

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "fireworks/accounts/fireworks/routers/kimi-k2p5-turbo",
      },
    },
  },
}
```

Fireworks가 새로운 Qwen 또는 Gemma 릴리스와 같은 최신 모델을 게시하면, 번들 카탈로그 업데이트를 기다리지 않고 Fireworks 모델 ID를 사용하여 직접 전환할 수 있습니다.
