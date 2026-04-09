---
summary: "게이트웨이 웹 인터페이스: Control UI, 바인드 모드, 보안"
read_when:
  - You want to access the Gateway over Tailscale
  - You want the browser Control UI and config editing
title: "웹"
---

# 웹 (게이트웨이)

게이트웨이는 게이트웨이 WebSocket과 동일한 포트에서 작은 **브라우저 Control UI** (Vite + Lit)를 제공합니다:

- 기본값: `http://<host>:18789/`
- 선택적 접두사: `gateway.controlUi.basePath` 설정 (예: `/openclaw`)

기능은 [Control UI](/web/control-ui)에 있습니다.
이 페이지는 바인드 모드, 보안 및 웹 인터페이스에 초점을 맞춥니다.

## 웹훅

`hooks.enabled=true`인 경우 게이트웨이는 동일한 HTTP 서버에 작은 웹훅 엔드포인트도 노출합니다.
인증 + 페이로드에 대해서는 [게이트웨이 구성](/gateway/configuration) → `hooks`를 참조하십시오.

## 구성 (기본 활성화)

Control UI는 에셋이 있을 때 **기본으로 활성화**됩니다 (`dist/control-ui`).
구성을 통해 제어할 수 있습니다:

```json5
{
  gateway: {
    controlUi: { enabled: true, basePath: "/openclaw" }, // basePath 선택 사항
  },
}
```

## Tailscale 액세스

### 통합 Serve (권장)

게이트웨이를 루프백에 유지하고 Tailscale Serve가 프록시하도록 하십시오:

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "serve" },
  },
}
```

그런 다음 게이트웨이를 시작하십시오:

```bash
openclaw gateway
```

열기:

- `https://<magicdns>/` (또는 구성된 `gateway.controlUi.basePath`)

### Tailnet 바인드 + 토큰

```json5
{
  gateway: {
    bind: "tailnet",
    controlUi: { enabled: true },
    auth: { mode: "token", token: "your-token" },
  },
}
```

그런 다음 게이트웨이를 시작하십시오 (이 비루프백 예시는 공유 비밀 토큰 인증을 사용합니다):

```bash
openclaw gateway
```

열기:

- `http://<tailscale-ip>:18789/` (또는 구성된 `gateway.controlUi.basePath`)

### 공개 인터넷 (Funnel)

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "funnel" },
    auth: { mode: "password" }, // 또는 OPENCLAW_GATEWAY_PASSWORD
  },
}
```

## 보안 참고 사항

- 게이트웨이 인증은 기본적으로 필요합니다 (토큰, 비밀번호, trusted-proxy, 또는 활성화된 경우 Tailscale Serve 아이덴티티 헤더).
- 비루프백 바인드는 여전히 게이트웨이 인증이 **필요합니다**. 실제로는 토큰/비밀번호 인증 또는 `gateway.auth.mode: "trusted-proxy"`로 구성된 아이덴티티 인식 역방향 프록시를 의미합니다.
- 마법사는 기본적으로 공유 비밀 인증을 생성하며 일반적으로 게이트웨이 토큰을 생성합니다 (루프백에서도).
- 공유 비밀 모드에서 UI는 `connect.params.auth.token` 또는 `connect.params.auth.password`를 보냅니다.
- Tailscale Serve 또는 `trusted-proxy` 같은 아이덴티티 포함 모드에서 WebSocket 인증 확인은 요청 헤더에서 충족됩니다.
- 비루프백 Control UI 배포의 경우 `gateway.controlUi.allowedOrigins`를 명시적으로 설정하십시오 (전체 origin). 그렇지 않으면 게이트웨이 시작이 기본적으로 거부됩니다.
- `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true`는 호스트 헤더 origin 폴백 모드를 활성화하지만 위험한 보안 다운그레이드입니다.
- Serve의 경우 `gateway.auth.allowTailscale`이 `true`이면 Tailscale 아이덴티티 헤더가 Control UI/WebSocket 인증을 충족할 수 있습니다 (토큰/비밀번호 불필요).
  HTTP API 엔드포인트는 해당 Tailscale 아이덴티티 헤더를 사용하지 않고 게이트웨이의 일반 HTTP 인증 모드를 따릅니다. 명시적 자격 증명을 요구하려면 `gateway.auth.allowTailscale: false`를 설정하십시오. [Tailscale](/gateway/tailscale) 및 [보안](/gateway/security/)을 참조하십시오. 이 토큰 없는 흐름은 게이트웨이 호스트가 신뢰할 수 있다고 가정합니다.
- `gateway.tailscale.mode: "funnel"`은 `gateway.auth.mode: "password"` (공유 비밀번호)가 필요합니다.

## UI 빌드

게이트웨이는 `dist/control-ui`에서 정적 파일을 제공합니다. 다음으로 빌드하십시오:

```bash
pnpm ui:build # 첫 번째 실행 시 UI 의존성을 자동으로 설치합니다
```
