---
title: "GitHub Copilot"
description: "장치 흐름을 사용하여 OpenClaw에서 GitHub Copilot에 로그인"
---

# GitHub Copilot

## GitHub Copilot이란?

GitHub Copilot은 GitHub의 AI 코딩 어시스턴트입니다. GitHub 계정 및 플랜에 대한 Copilot 모델에 액세스할 수 있습니다. OpenClaw는 두 가지 방법으로 Copilot을 모델 프로바이더로 사용할 수 있습니다.

## OpenClaw에서 Copilot을 사용하는 두 가지 방법

### 1) 내장 GitHub Copilot 프로바이더 (`github-copilot`)

네이티브 장치 로그인 흐름을 사용하여 GitHub 토큰을 받은 후 OpenClaw 실행 시 Copilot API 토큰으로 교환합니다. VS Code가 필요하지 않기 때문에 이것이 **기본** 및 가장 간단한 경로입니다.

### 2) Copilot Proxy 플러그인 (`copilot-proxy`)

**Copilot Proxy** VS Code 확장을 로컬 브리지로 사용합니다. OpenClaw는 프록시의 `/v1` 엔드포인트와 통신하며 구성한 모델 목록을 사용합니다. VS Code에서 이미 Copilot Proxy를 실행 중이거나 이를 통해 라우팅해야 할 때 선택하십시오. 플러그인을 활성화하고 VS Code 확장을 실행 상태로 유지해야 합니다.

GitHub Copilot을 모델 프로바이더(`github-copilot`)로 사용하십시오. 로그인 명령은 GitHub 장치 흐름을 실행하고, 인증 프로필을 저장하며, 해당 프로필을 사용하도록 구성을 업데이트합니다.

## CLI 설정

```bash
openclaw models auth login-github-copilot
```

URL을 방문하고 일회용 코드를 입력하라는 메시지가 표시됩니다. 완료될 때까지 터미널을 열어두십시오.

### 선택적 플래그

```bash
openclaw models auth login-github-copilot --yes
```

한 번에 프로바이더의 권장 기본 모델도 적용하려면 대신 일반 인증 명령을 사용하십시오:

```bash
openclaw models auth login --provider github-copilot --method device --set-default
```

## 기본 모델 설정

```bash
openclaw models set github-copilot/gpt-4o
```

### 구성 스니펫

```json5
{
  agents: { defaults: { model: { primary: "github-copilot/gpt-4o" } } },
}
```

## 참고 사항

- 대화형 TTY가 필요합니다; 터미널에서 직접 실행하십시오.
- Copilot 모델 가용성은 플랜에 따라 다릅니다; 모델이 거부되면 다른 ID를 시도하십시오 (예: `github-copilot/gpt-4.1`).
- Claude 모델 ID는 Anthropic Messages 전송을 자동으로 사용합니다; GPT, o-시리즈, Gemini 모델은 OpenAI Responses 전송을 유지합니다.
- 로그인은 인증 프로필 저장소에 GitHub 토큰을 저장하고 OpenClaw 실행 시 Copilot API 토큰으로 교환합니다.
