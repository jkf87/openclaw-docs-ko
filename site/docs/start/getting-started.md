---
title: "시작하기"
description: "OpenClaw를 설치하고 몇 분 안에 첫 번째 채팅을 시작하십시오."
---

# 시작하기

OpenClaw를 설치하고, 온보딩을 실행하고, AI 어시스턴트와 채팅하십시오 — 약 5분 내에 완료됩니다. 완료되면 실행 중인 Gateway, 구성된 인증, 그리고 작동하는 채팅 세션이 준비됩니다.

## 필요한 것

- **Node.js** — Node 24 권장 (Node 22.14+ 도 지원)
- 모델 프로바이더(Anthropic, OpenAI, Google 등)의 **API 키** — 온보딩 시 입력을 요청합니다

::: tip
`node --version`으로 Node 버전을 확인하십시오.
**Windows 사용자:** 네이티브 Windows와 WSL2 모두 지원됩니다. WSL2가 더 안정적이며 전체 기능 사용에 권장됩니다. [Windows](/platforms/windows)를 참조하십시오.
Node를 설치해야 하는 경우 [Node 설정](/install/node)을 참조하십시오.
:::


## 빠른 설정

1. **OpenClaw 설치**

   **macOS / Linux**

```bash
           curl -fsSL https://openclaw.ai/install.sh | bash
           ```
           <img
     src="/assets/install-script.svg"
     alt="Install Script Process"
     className="rounded-lg"
   />


         **Windows (PowerShell)**

```powershell
           iwr -useb https://openclaw.ai/install.ps1 | iex
           ```


   
       ::: info NOTE
   기타 설치 방법 (Docker, Nix, npm): [설치](/install).
   :::

  2. **온보딩 실행**

   ```bash
       openclaw onboard --install-daemon
       ```
   
       마법사가 모델 프로바이더 선택, API 키 설정, Gateway 구성 과정을 안내합니다. 약 2분 소요됩니다.
   
       전체 참조는 [온보딩 (CLI)](/start/wizard)을 참조하십시오.

  3. **Gateway 실행 확인**

   ```bash
       openclaw gateway status
       ```
   
       Gateway가 포트 18789에서 수신 대기 중인 것을 확인할 수 있습니다.

  4. **대시보드 열기**

   ```bash
       openclaw dashboard
       ```
   
       브라우저에서 Control UI를 엽니다. 로딩되면 모든 것이 정상적으로 작동하는 것입니다.

  5. **첫 번째 메시지 보내기**

   Control UI 채팅창에 메시지를 입력하면 AI 응답을 받을 수 있습니다.
   
       대신 휴대폰에서 채팅하고 싶으신가요? 가장 빠르게 설정할 수 있는 채널은
       [Telegram](/channels/telegram)입니다 (봇 토큰만 필요). 모든 옵션은 [채널](/channels)을 참조하십시오.


::: details 고급: 맞춤형 Control UI 빌드 마운트
현지화되거나 맞춤 설정된 대시보드 빌드를 유지하는 경우,
  `gateway.controlUi.root`를 빌드된 정적 에셋과 `index.html`이 포함된 디렉토리로 지정하십시오.

```bash
mkdir -p "$HOME/.openclaw/control-ui-custom"
# 빌드된 정적 파일을 해당 디렉토리에 복사하십시오.
```

그런 다음 설정:

```json
{
  "gateway": {
    "controlUi": {
      "enabled": true,
      "root": "$HOME/.openclaw/control-ui-custom"
    }
  }
}
```

게이트웨이를 재시작하고 대시보드를 다시 여십시오:

```bash
openclaw gateway restart
openclaw dashboard
```
:::


## 다음에 할 것

> **채널 연결** [→](/channels)
> Discord, Feishu, iMessage, Matrix, Microsoft Teams, Signal, Slack, Telegram, WhatsApp, Zalo 등.


  > **페어링 및 보안** [→](/channels/pairing)
> 에이전트에게 메시지를 보낼 수 있는 사람을 제어합니다.


  > **Gateway 구성** [→](/gateway/configuration)
> 모델, 도구, 샌드박스 및 고급 설정.


  > **도구 탐색** [→](/tools)
> 브라우저, 실행, 웹 검색, 스킬 및 플러그인.


::: details 고급: 환경 변수
서비스 계정으로 OpenClaw를 실행하거나 사용자 지정 경로를 원하는 경우:

- `OPENCLAW_HOME` — 내부 경로 확인을 위한 홈 디렉토리
- `OPENCLAW_STATE_DIR` — 상태 디렉토리 재정의
- `OPENCLAW_CONFIG_PATH` — 구성 파일 경로 재정의

전체 참조: [환경 변수](/help/environment).
:::

