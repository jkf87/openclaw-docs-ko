---
title: "온보딩 개요"
description: "OpenClaw 온보딩 옵션 및 흐름 개요"
---

# 온보딩 개요

OpenClaw에는 두 가지 온보딩 경로가 있습니다. 둘 다 인증, Gateway 및 선택적 채팅 채널을 구성하며 — 설정과 상호작용하는 방식만 다릅니다.

## 어떤 경로를 사용해야 합니까?

|                | CLI 온보딩                             | macOS 앱 온보딩       |
| -------------- | -------------------------------------- | --------------------- |
| **플랫폼**     | macOS, Linux, Windows (네이티브 또는 WSL2) | macOS 전용         |
| **인터페이스** | 터미널 마법사                          | 앱 내 안내 UI        |
| **최적 용도**  | 서버, 헤드리스, 완전 제어              | 데스크톱 Mac, 시각적 설정 |
| **자동화**     | 스크립트를 위한 `--non-interactive`    | 수동만 가능          |
| **명령**       | `openclaw onboard`                     | 앱 실행              |

대부분의 사용자는 **CLI 온보딩**으로 시작해야 합니다 — 어디서나 작동하며 가장 많은 제어권을 제공합니다.

## 온보딩이 구성하는 항목

어떤 경로를 선택하더라도 온보딩은 다음을 설정합니다:

1. **모델 프로바이더 및 인증** — 선택한 프로바이더의 API 키, OAuth 또는 설정 토큰
2. **워크스페이스** — 에이전트 파일, 부트스트랩 템플릿 및 메모리를 위한 디렉토리
3. **Gateway** — 포트, 바인드 주소, 인증 모드
4. **채널** (선택 사항) — BlueBubbles, Discord, Feishu, Google Chat, Mattermost, Microsoft Teams, Telegram, WhatsApp 등의 내장 및 번들 채팅 채널
5. **데몬** (선택 사항) — Gateway가 자동으로 시작되도록 하는 백그라운드 서비스

## CLI 온보딩

어떤 터미널에서든 실행:

```bash
openclaw onboard
```

한 번에 백그라운드 서비스도 설치하려면 `--install-daemon`을 추가하십시오.

전체 참조: [온보딩 (CLI)](/start/wizard)
CLI 명령 문서: [`openclaw onboard`](/cli/onboard)

## macOS 앱 온보딩

OpenClaw 앱을 엽니다. 첫 실행 마법사가 시각적 인터페이스로 동일한 단계를 안내합니다.

전체 참조: [온보딩 (macOS 앱)](/start/onboarding)

## 맞춤형 또는 목록에 없는 프로바이더

프로바이더가 온보딩에 목록에 없는 경우, **Custom Provider**를 선택하고 다음을 입력하십시오:

- API 호환성 모드 (OpenAI 호환, Anthropic 호환 또는 자동 감지)
- 기본 URL 및 API 키
- 모델 ID 및 선택적 별칭

여러 맞춤형 엔드포인트가 공존할 수 있으며 — 각각 자체 엔드포인트 ID를 가집니다.
