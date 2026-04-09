---
summary: "게이트웨이 대시보드 (Control UI) 액세스 및 인증"
read_when:
  - Changing dashboard authentication or exposure modes
title: "대시보드"
---

# 대시보드 (Control UI)

게이트웨이 대시보드는 기본적으로 `/`에서 제공되는 브라우저 Control UI입니다
(`gateway.controlUi.basePath`로 재정의).

빠른 열기 (로컬 게이트웨이):

- [http://127.0.0.1:18789/](http://127.0.0.1:18789/) (또는 [http://localhost:18789/](http://localhost:18789/))

주요 참조:

- [Control UI](/web/control-ui) — 사용법 및 UI 기능.
- [Tailscale](/gateway/tailscale) — Serve/Funnel 자동화.
- [웹 인터페이스](/web) — 바인드 모드 및 보안 참고 사항.

인증은 구성된 게이트웨이 인증 경로를 통해 WebSocket 핸드셰이크에서 시행됩니다:

- `connect.params.auth.token`
- `connect.params.auth.password`
- `gateway.auth.allowTailscale: true`인 경우 Tailscale Serve 아이덴티티 헤더
- `gateway.auth.mode: "trusted-proxy"`인 경우 trusted-proxy 아이덴티티 헤더

[게이트웨이 구성](/gateway/configuration)에서 `gateway.auth`를 참조하십시오.

보안 참고: Control UI는 **관리자 인터페이스** (채팅, 구성, exec 승인)입니다.
공개적으로 노출하지 마십시오. UI는 현재 브라우저 탭 세션과 선택된 게이트웨이 URL에 대한 대시보드 URL 토큰을 sessionStorage에 유지하고 로드 후 URL에서 제거합니다.
localhost, Tailscale Serve, 또는 SSH 터널을 사용하는 것이 좋습니다.

## 빠른 경로 (권장)

- 온보딩 후 CLI는 자동으로 대시보드를 열고 깔끔한 (토큰화되지 않은) 링크를 출력합니다.
- 언제든지 다시 열기: `openclaw dashboard` (링크 복사, 가능하면 브라우저 열기, 헤드리스인 경우 SSH 힌트 표시).
- UI에서 공유 비밀 인증을 요청하면 구성된 토큰 또는 비밀번호를 Control UI 설정에 붙여넣으십시오.

## 인증 기본 사항 (로컬 vs 원격)

- **Localhost**: `http://127.0.0.1:18789/`를 여십시오.
- **공유 비밀 토큰 소스**: `gateway.auth.token` (또는 `OPENCLAW_GATEWAY_TOKEN`); `openclaw dashboard`는 일회성 부트스트랩을 위해 URL 프래그먼트를 통해 전달할 수 있으며 Control UI는 현재 브라우저 탭 세션과 선택된 게이트웨이 URL에 대해 sessionStorage에 유지합니다.
- `gateway.auth.token`이 SecretRef로 관리되는 경우 `openclaw dashboard`는 설계상 토큰화되지 않은 URL을 인쇄/복사/열기합니다. 이는 셸 로그, 클립보드 기록 또는 브라우저 실행 인수에 외부 관리 토큰이 노출되는 것을 방지합니다.
- **공유 비밀 비밀번호**: 구성된 `gateway.auth.password` (또는 `OPENCLAW_GATEWAY_PASSWORD`)를 사용하십시오. 대시보드는 리로드 시 비밀번호를 유지하지 않습니다.
- **아이덴티티 포함 모드**: `gateway.auth.allowTailscale: true`인 경우 Tailscale Serve는 아이덴티티 헤더를 통해 Control UI/WebSocket 인증을 충족할 수 있으며, 비루프백 아이덴티티 인식 역방향 프록시는 `gateway.auth.mode: "trusted-proxy"`를 충족할 수 있습니다. 이러한 모드에서 대시보드는 WebSocket을 위해 붙여넣은 공유 비밀이 필요하지 않습니다.
- **localhost가 아닌 경우**: Tailscale Serve, 비루프백 공유 비밀 바인드, `gateway.auth.mode: "trusted-proxy"`를 사용하는 비루프백 아이덴티티 인식 역방향 프록시, 또는 SSH 터널을 사용하십시오. [웹 인터페이스](/web)를 참조하십시오.

<a id="if-you-see-unauthorized-1008"></a>

## "unauthorized" / 1008이 표시되는 경우

- 게이트웨이에 도달할 수 있는지 확인하십시오 (로컬: `openclaw status`; 원격: SSH 터널 `ssh -N -L 18789:127.0.0.1:18789 user@host` 후 `http://127.0.0.1:18789/` 열기).
- `AUTH_TOKEN_MISMATCH`의 경우 게이트웨이가 재시도 힌트를 반환할 때 클라이언트는 캐시된 기기 토큰으로 한 번 신뢰할 수 있는 재시도를 할 수 있습니다. 그 후 인증이 계속 실패하면 토큰 드리프트를 수동으로 해결하십시오.
- 토큰 드리프트 수리 단계는 [토큰 드리프트 복구 체크리스트](/cli/devices#token-drift-recovery-checklist)를 따르십시오.
- 게이트웨이 호스트에서 공유 비밀을 가져오거나 제공하십시오:
  - 토큰: `openclaw config get gateway.auth.token`
  - 비밀번호: 구성된 `gateway.auth.password` 또는 `OPENCLAW_GATEWAY_PASSWORD` 해결
  - SecretRef로 관리되는 토큰: 외부 비밀 프로바이더를 해결하거나 이 셸에서 `OPENCLAW_GATEWAY_TOKEN`을 내보낸 후 `openclaw dashboard` 다시 실행
  - 공유 비밀이 구성되지 않은 경우: `openclaw doctor --generate-gateway-token`
- 대시보드 설정에서 토큰 또는 비밀번호를 인증 필드에 붙여넣은 후 연결하십시오.
- UI 언어 선택기는 **개요 -> 게이트웨이 액세스 -> 언어**에 있습니다. 모양 섹션이 아닌 액세스 카드의 일부입니다.
