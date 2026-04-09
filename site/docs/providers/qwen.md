---
title: "Qwen"
description: "OpenClaw의 번들 qwen 프로바이더를 통해 Qwen Cloud 사용"
---

# Qwen

::: warning
**Qwen OAuth가 제거되었습니다.** `portal.qwen.ai` 엔드포인트를 사용하던 무료 티어 OAuth 통합(`qwen-portal`)은 더 이상 사용할 수 없습니다. 배경에 대해서는 [이슈 #49557](https://github.com/openclaw/openclaw/issues/49557)을 참조하십시오.
:::


## 권장 사항: Qwen Cloud

OpenClaw는 이제 Qwen을 표준 id `qwen`을 가진 1등급 번들 프로바이더로 취급합니다. 번들 프로바이더는 Qwen Cloud/Alibaba DashScope 및 Coding Plan 엔드포인트를 대상으로 하며 레거시 `modelstudio` id를 호환 별칭으로 유지합니다.

- 프로바이더: `qwen`
- 기본 환경 변수: `QWEN_API_KEY`
- 호환용으로 허용: `MODELSTUDIO_API_KEY`, `DASHSCOPE_API_KEY`
- API 스타일: OpenAI 호환

`qwen3.6-plus`를 원하면 **Standard (종량제)** 엔드포인트를 선호하십시오. Coding Plan 지원은 공개 카탈로그보다 뒤처질 수 있습니다.

```bash
# 글로벌 Coding Plan 엔드포인트
openclaw onboard --auth-choice qwen-api-key

# 중국 Coding Plan 엔드포인트
openclaw onboard --auth-choice qwen-api-key-cn

# 글로벌 Standard (종량제) 엔드포인트
openclaw onboard --auth-choice qwen-standard-api-key

# 중국 Standard (종량제) 엔드포인트
openclaw onboard --auth-choice qwen-standard-api-key-cn
```

레거시 `modelstudio-*` 인증 선택 id와 `modelstudio/...` 모델 참조는 여전히 호환 별칭으로 작동하지만, 새 설정 플로우에서는 표준 `qwen-*` 인증 선택 id와 `qwen/...` 모델 참조를 선호하십시오.

온보딩 후 기본 모델을 설정하십시오:

```json5
{
  agents: {
    defaults: {
      model: { primary: "qwen/qwen3.5-plus" },
    },
  },
}
```

## 플랜 유형 및 엔드포인트

| 플랜                      | 리전   | 인증 선택                   | 엔드포인트                                       |
| ------------------------- | ------ | --------------------------- | ------------------------------------------------ |
| Standard (종량제)          | 중국   | `qwen-standard-api-key-cn`  | `dashscope.aliyuncs.com/compatible-mode/v1`      |
| Standard (종량제)          | 글로벌 | `qwen-standard-api-key`     | `dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| Coding Plan (구독)         | 중국   | `qwen-api-key-cn`           | `coding.dashscope.aliyuncs.com/v1`               |
| Coding Plan (구독)         | 글로벌 | `qwen-api-key`              | `coding-intl.dashscope.aliyuncs.com/v1`          |

프로바이더는 인증 선택에 따라 엔드포인트를 자동으로 선택합니다. 표준 선택은 `qwen-*` 패밀리를 사용합니다; `modelstudio-*`는 호환용으로만 유지됩니다. 구성에서 사용자 정의 `baseUrl`로 재정의할 수 있습니다.

네이티브 Model Studio 엔드포인트는 공유 `openai-completions` 전송에서 스트리밍 사용 호환성을 광고합니다. OpenClaw는 이제 엔드포인트 기능을 기반으로 하므로, 동일한 네이티브 호스트를 대상으로 하는 DashScope 호환 커스텀 프로바이더 id는 내장 `qwen` 프로바이더 id를 특별히 필요로 하는 대신 동일한 스트리밍 사용 동작을 상속합니다.

## API 키 발급

- **키 관리**: [home.qwencloud.com/api-keys](https://home.qwencloud.com/api-keys)
- **문서**: [docs.qwencloud.com](https://docs.qwencloud.com/developer-guides/getting-started/introduction)

## 내장 카탈로그

OpenClaw는 현재 이 번들 Qwen 카탈로그를 제공합니다:

| 모델 참조                   | 입력         | 컨텍스트  | 참고 사항                                       |
| --------------------------- | ------------ | --------- | ----------------------------------------------- |
| `qwen/qwen3.5-plus`         | 텍스트, 이미지 | 1,000,000 | 기본 모델                                       |
| `qwen/qwen3.6-plus`         | 텍스트, 이미지 | 1,000,000 | 이 모델이 필요한 경우 Standard 엔드포인트 선호   |
| `qwen/qwen3-max-2026-01-23` | 텍스트       | 262,144   | Qwen Max 라인                                   |
| `qwen/qwen3-coder-next`     | 텍스트       | 262,144   | 코딩                                            |
| `qwen/qwen3-coder-plus`     | 텍스트       | 1,000,000 | 코딩                                            |
| `qwen/MiniMax-M2.5`         | 텍스트       | 1,000,000 | 추론 활성화                                     |
| `qwen/glm-5`                | 텍스트       | 202,752   | GLM                                             |
| `qwen/glm-4.7`              | 텍스트       | 202,752   | GLM                                             |
| `qwen/kimi-k2.5`            | 텍스트, 이미지 | 262,144   | Alibaba를 통한 Moonshot AI                      |

번들 카탈로그에 모델이 있더라도 엔드포인트 및 청구 플랜에 따라 가용성이 다를 수 있습니다.

네이티브 스트리밍 사용 호환성은 Coding Plan 호스트와 Standard DashScope 호환 호스트 모두에 적용됩니다:

- `https://coding.dashscope.aliyuncs.com/v1`
- `https://coding-intl.dashscope.aliyuncs.com/v1`
- `https://dashscope.aliyuncs.com/compatible-mode/v1`
- `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`

## Qwen 3.6 Plus 가용성

`qwen3.6-plus`는 Standard (종량제) Model Studio 엔드포인트에서 사용할 수 있습니다:

- 중국: `dashscope.aliyuncs.com/compatible-mode/v1`
- 글로벌: `dashscope-intl.aliyuncs.com/compatible-mode/v1`

Coding Plan 엔드포인트가 `qwen3.6-plus`에 대해 "지원되지 않는 모델" 오류를 반환하면 Coding Plan 엔드포인트/키 쌍 대신 Standard (종량제)로 전환하십시오.

## 기능 계획

`qwen` 확장은 코딩/텍스트 모델만이 아닌 전체 Qwen Cloud 표면을 위한 벤더 홈으로 자리 잡고 있습니다.

- 텍스트/채팅 모델: 현재 번들됨
- 도구 호출, 구조화된 출력, 사고: OpenAI 호환 전송에서 상속됨
- 이미지 생성: 프로바이더-플러그인 레이어에서 계획됨
- 이미지/비디오 이해: Standard 엔드포인트에서 현재 번들됨
- 음성/오디오: 프로바이더-플러그인 레이어에서 계획됨
- 메모리 임베딩/재순위: 임베딩 어댑터 표면을 통해 계획됨
- 비디오 생성: 공유 비디오 생성 기능을 통해 현재 번들됨

## 멀티모달 부가 기능

`qwen` 확장은 이제 다음도 노출합니다:

- `qwen-vl-max-latest`를 통한 비디오 이해
- 다음을 통한 Wan 비디오 생성:
  - `wan2.6-t2v` (기본값)
  - `wan2.6-i2v`
  - `wan2.6-r2v`
  - `wan2.6-r2v-flash`
  - `wan2.7-r2v`

이러한 멀티모달 표면은 Coding Plan 엔드포인트가 아닌 **Standard** DashScope 엔드포인트를 사용합니다.

- 글로벌/국제 Standard 기본 URL: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- 중국 Standard 기본 URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`

비디오 생성의 경우 OpenClaw는 작업을 제출하기 전에 구성된 Qwen 리전을 일치하는 DashScope AIGC 호스트에 매핑합니다:

- 글로벌/국제: `https://dashscope-intl.aliyuncs.com`
- 중국: `https://dashscope.aliyuncs.com`

즉, Coding Plan 또는 Standard Qwen 호스트 중 하나를 가리키는 일반 `models.providers.qwen.baseUrl`도 비디오 생성을 올바른 리전 DashScope 비디오 엔드포인트에 유지합니다.

비디오 생성의 경우 기본 모델을 명시적으로 설정하십시오:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: { primary: "qwen/wan2.6-t2v" },
    },
  },
}
```

현재 번들된 Qwen 비디오 생성 제한:

- 요청당 최대 **1**개 출력 비디오
- 최대 **1**개 입력 이미지
- 최대 **4**개 입력 비디오
- 최대 **10초** 길이
- `size`, `aspectRatio`, `resolution`, `audio`, `watermark` 지원
- 참조 이미지/비디오 모드는 현재 **원격 http(s) URL**이 필요합니다. DashScope 비디오 엔드포인트는 해당 참조에 대해 업로드된 로컬 버퍼를 허용하지 않으므로 로컬 파일 경로는 사전에 거부됩니다.

공유 도구 파라미터, 프로바이더 선택 및 페일오버 동작에 대해서는 [비디오 생성](/tools/video-generation)을 참조하십시오.

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우 해당 프로세스에서 `QWEN_API_KEY`를 사용할 수 있어야 합니다 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).
