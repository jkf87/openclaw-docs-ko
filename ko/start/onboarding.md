---
summary: "OpenClaw (macOS 앱)의 최초 실행 설정 흐름"
read_when:
  - macOS 온보딩 어시스턴트 설계
  - 인증 또는 신원 설정 구현
title: "온보딩 (macOS 앱)"
sidebarTitle: "온보딩: macOS 앱"
---

# 온보딩 (macOS 앱)

이 문서는 **현재** 최초 실행 설정 흐름을 설명합니다. 목표는 원활한 "0일차" 경험입니다: Gateway 실행 위치를 선택하고, 인증을 연결하고, 마법사를 실행하고, 에이전트가 스스로 부트스트랩하도록 합니다.
온보딩 경로에 대한 일반 개요는 [온보딩 개요](/start/onboarding-overview)를 참조하십시오.

<Steps>
<Step title="macOS 경고 승인">
<Frame>
<img src="/assets/macos-onboarding/01-macos-warning.jpeg" alt="" />
</Frame>
</Step>
<Step title="로컬 네트워크 찾기 승인">
<Frame>
<img src="/assets/macos-onboarding/02-local-networks.jpeg" alt="" />
</Frame>
</Step>
<Step title="환영 및 보안 공지">
<Frame caption="표시된 보안 공지를 읽고 그에 따라 결정하십시오">
<img src="/assets/macos-onboarding/03-security-notice.png" alt="" />
</Frame>

보안 신뢰 모델:

- 기본적으로 OpenClaw는 개인 에이전트입니다: 하나의 신뢰할 수 있는 운영자 경계.
- 공유/다중 사용자 설정에서는 잠금이 필요합니다 (분할 신뢰 경계, 최소 도구 접근 유지, [보안](/gateway/security) 준수).
- 로컬 온보딩은 이제 새 구성을 기본값으로 `tools.profile: "coding"`으로 설정하여 신선한 로컬 설정이 무제한 `full` 프로파일을 강제하지 않고 파일시스템/런타임 도구를 유지합니다.
- 훅/웹훅 또는 기타 신뢰할 수 없는 콘텐츠 피드가 활성화된 경우, 강력한 최신 모델 티어를 사용하고 엄격한 도구 정책/샌드박싱을 유지하십시오.

</Step>
<Step title="로컬 vs 원격">
<Frame>
<img src="/assets/macos-onboarding/04-choose-gateway.png" alt="" />
</Frame>

**Gateway**는 어디에서 실행됩니까?

- **이 Mac (로컬만):** 온보딩이 인증을 구성하고 자격 증명을 로컬에 기록할 수 있습니다.
- **원격 (SSH/Tailnet을 통해):** 온보딩이 로컬 인증을 구성하지 **않습니다**; 자격 증명은 게이트웨이 호스트에 있어야 합니다.
- **나중에 구성:** 설정을 건너뛰고 앱을 구성되지 않은 상태로 둡니다.

<Tip>
**게이트웨이 인증 팁:**

- 마법사는 이제 루프백의 경우에도 **토큰**을 생성하므로 로컬 WS 클라이언트는 인증해야 합니다.
- 인증을 비활성화하면 모든 로컬 프로세스가 연결할 수 있습니다; 완전히 신뢰할 수 있는 머신에서만 사용하십시오.
- 멀티 머신 접근 또는 루프백이 아닌 바인드에는 **토큰**을 사용하십시오.

</Tip>
</Step>
<Step title="권한">
<Frame caption="OpenClaw에 부여할 권한을 선택하십시오">
<img src="/assets/macos-onboarding/05-permissions.png" alt="" />
</Frame>

온보딩은 다음에 필요한 TCC 권한을 요청합니다:

- 자동화 (AppleScript)
- 알림
- 접근성
- 화면 녹화
- 마이크
- 음성 인식
- 카메라
- 위치

</Step>
<Step title="CLI">
  <Info>이 단계는 선택 사항입니다</Info>
  앱은 npm, pnpm 또는 bun을 통해 전역 `openclaw` CLI를 설치할 수 있습니다.
  npm을 먼저 선호하고, 그 다음 pnpm, 그 다음 감지된 유일한 패키지 관리자인 경우 bun을 사용합니다.
  Gateway 런타임의 경우 Node가 권장 경로입니다.
</Step>
<Step title="온보딩 채팅 (전용 세션)">
  설정 후 앱은 에이전트가 자신을 소개하고 다음 단계를 안내할 수 있도록 전용 온보딩 채팅 세션을 엽니다. 이렇게 하면 최초 실행 안내가 일반 대화와 분리됩니다. 첫 에이전트 실행 시 게이트웨이 호스트에서 발생하는 일은 [부트스트랩](/start/bootstrapping)을 참조하십시오.
</Step>
</Steps>
