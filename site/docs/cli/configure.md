---
title: "configure"
description: "`openclaw configure`에 대한 CLI 참조 (대화형 구성 프롬프트)"
---

# `openclaw configure`

자격 증명, 장치, 에이전트 기본값을 설정하기 위한 대화형 프롬프트.

참고: **모델** 섹션에는 이제 `agents.defaults.models` 허용 목록 (`/model` 및 모델 선택기에 표시되는 항목)에 대한 다중 선택이 포함됩니다.

구성이 프로바이더 인증 선택에서 시작되면 기본 모델 및 허용 목록 선택기가 해당 프로바이더를 자동으로 선호합니다. Volcengine/BytePlus와 같은 쌍 프로바이더의 경우 동일한 선호도가 코딩 플랜 변형 (`volcengine-plan/*`, `byteplus-plan/*`)도 일치시킵니다. 선호 프로바이더 필터가 빈 목록을 생성하면 구성은 빈 선택기를 표시하는 대신 필터링되지 않은 카탈로그로 폴백합니다.

팁: 하위 명령 없는 `openclaw config`는 동일한 마법사를 엽니다. 비대화형 편집에는 `openclaw config get|set|unset`을 사용하세요.

웹 검색의 경우 `openclaw configure --section web`을 통해 프로바이더를 선택하고 자격 증명을 구성할 수 있습니다. 일부 프로바이더는 프로바이더별 후속 프롬프트도 표시합니다:

- **Grok**은 동일한 `XAI_API_KEY`로 선택적 `x_search` 설정을 제공하고 `x_search` 모델을 선택할 수 있습니다.
- **Kimi**는 Moonshot API 지역 (`api.moonshot.ai` vs `api.moonshot.cn`)과 기본 Kimi 웹 검색 모델을 요청할 수 있습니다.

관련:

- Gateway 구성 참조: [구성](/gateway/configuration)
- Config CLI: [Config](/cli/config)

## 옵션

- `--section <section>`: 반복 가능한 섹션 필터

사용 가능한 섹션:

- `workspace`
- `model`
- `web`
- `gateway`
- `daemon`
- `channels`
- `plugins`
- `skills`
- `health`

참고사항:

- Gateway 실행 위치를 선택하면 항상 `gateway.mode`가 업데이트됩니다. 그것만 필요하다면 다른 섹션 없이 "계속"을 선택할 수 있습니다.
- 채널 지향 서비스 (Slack/Discord/Matrix/Microsoft Teams)는 설정 중 채널/방 허용 목록을 프롬프트합니다. 이름 또는 ID를 입력할 수 있으며 마법사는 가능한 경우 이름을 ID로 확인합니다.
- 데몬 설치 단계를 실행하는 경우 토큰 인증에 토큰이 필요하고 `gateway.auth.token`이 SecretRef 관리인 경우 구성은 SecretRef를 검증하지만 확인된 일반 텍스트 토큰 값을 슈퍼바이저 서비스 환경 메타데이터에 유지하지 않습니다.
- 토큰 인증에 토큰이 필요하고 구성된 토큰 SecretRef가 이 명령 경로에서 확인되지 않으면 구성은 실행 가능한 해결 안내와 함께 데몬 설치를 차단합니다.
- `gateway.auth.token`과 `gateway.auth.password`가 모두 구성되고 `gateway.auth.mode`가 설정되지 않은 경우 구성은 모드가 명시적으로 설정될 때까지 데몬 설치를 차단합니다.

## 예시

```bash
openclaw configure
openclaw configure --section web
openclaw configure --section model --section channels
openclaw configure --section gateway --section daemon
```
