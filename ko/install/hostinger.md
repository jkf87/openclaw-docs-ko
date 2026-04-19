---
summary: "Hostinger 1-Click 또는 VPS로 영속 OpenClaw Gateway 배포하기"
read_when:
  - Hostinger에서 OpenClaw를 배포하려는 경우
  - 1-Click 관리형 또는 VPS 옵션 중 선택이 필요한 경우
title: "Hostinger"
---

# Hostinger

[Hostinger](https://www.hostinger.com/openclaw)에서 **1-Click** 관리형 배포 또는 **VPS** 설치로 영속 OpenClaw Gateway를 실행할 수 있습니다.

## 사전 준비

- Hostinger 계정 ([가입](https://www.hostinger.com/openclaw))
- 약 5~10분의 시간

## 옵션 A: 1-Click OpenClaw

시작하는 가장 빠른 방법입니다. Hostinger가 인프라, Docker, 자동 업데이트를 처리합니다.

<Steps>
  <Step title="구매 및 실행">
    1. [Hostinger OpenClaw 페이지](https://www.hostinger.com/openclaw)에서 Managed OpenClaw 플랜을 선택하고 결제를 완료합니다.

    <Note>
      결제 중에 **Ready-to-Use AI** 크레딧을 선택할 수 있습니다. 사전 구매되어 OpenClaw 내부에 즉시 통합되므로 다른 제공업체의 외부 계정이나 API 키가 필요하지 않습니다. 바로 대화를 시작할 수 있습니다. 또는 설정 중에 Anthropic, OpenAI, Google Gemini, xAI의 자체 키를 제공할 수도 있습니다.
    </Note>
  </Step>

  <Step title="메시지 채널 선택">
    연결할 채널을 하나 이상 선택합니다:

    - **WhatsApp** — 설정 마법사에 표시된 QR 코드를 스캔합니다.
    - **Telegram** — [BotFather](https://t.me/BotFather)에서 봇 토큰을 붙여넣습니다.
  </Step>

  <Step title="설치 완료">
    **Finish**를 클릭하여 인스턴스를 배포합니다. 준비가 끝나면 hPanel의 **OpenClaw Overview**에서 OpenClaw 대시보드에 접근합니다.
  </Step>
</Steps>

## 옵션 B: VPS에서 OpenClaw 실행

서버에 대한 통제권이 더 큽니다. Hostinger가 VPS에 Docker로 OpenClaw를 배포하고, hPanel의 **Docker Manager**를 통해 관리합니다.

<Steps>
  <Step title="VPS 구매">
    1. [Hostinger OpenClaw 페이지](https://www.hostinger.com/openclaw)에서 OpenClaw on VPS 플랜을 선택하고 결제를 완료합니다.

    <Note>
      결제 중에 **Ready-to-Use AI** 크레딧을 선택할 수 있습니다. 사전 구매되어 OpenClaw 내부에 즉시 통합되므로 외부 계정이나 다른 제공업체의 API 키 없이도 바로 대화를 시작할 수 있습니다.
    </Note>
  </Step>

  <Step title="OpenClaw 설정">
    VPS가 프로비저닝되면 설정 필드를 채웁니다:

    - **Gateway 토큰** — 자동 생성됩니다. 나중에 사용할 수 있도록 저장해 두세요.
    - **WhatsApp 번호** — 국가 코드를 포함한 번호 (선택 사항).
    - **Telegram 봇 토큰** — [BotFather](https://t.me/BotFather)에서 발급 (선택 사항).
    - **API 키** — 결제 중 Ready-to-Use AI 크레딧을 선택하지 않은 경우에만 필요합니다.
  </Step>

  <Step title="OpenClaw 시작">
    **Deploy**를 클릭합니다. 실행되면 hPanel에서 **Open**을 클릭해 OpenClaw 대시보드를 엽니다.
  </Step>
</Steps>

로그, 재시작, 업데이트는 hPanel의 Docker Manager 인터페이스에서 직접 관리됩니다. 업데이트하려면 Docker Manager에서 **Update**를 누르세요. 최신 이미지를 가져옵니다.

## 설정 확인

연결한 채널에서 어시스턴트에게 "Hi"를 보내보세요. OpenClaw가 응답하며 초기 선호도 설정을 안내합니다.

## 문제 해결

**대시보드가 로드되지 않음** — 컨테이너 프로비저닝이 완료될 때까지 몇 분 기다리세요. hPanel의 Docker Manager 로그를 확인하세요.

**Docker 컨테이너가 계속 재시작됨** — Docker Manager 로그를 열고 설정 오류를 찾으세요 (누락된 토큰, 잘못된 API 키).

**Telegram 봇이 응답하지 않음** — 페어링 코드 메시지를 Telegram에서 OpenClaw 채팅 내부에 직접 메시지로 보내 연결을 완료하세요.

## 다음 단계

- [채널](/channels/) — Telegram, WhatsApp, Discord 등 연결
- [Gateway 설정](/gateway/configuration) — 모든 설정 옵션
