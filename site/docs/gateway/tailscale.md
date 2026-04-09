---
title: "Tailscale"
description: "Tailscale Serve(tailnet 전용) 및 Funnel(공개)을 사용한 게이트웨이 노출"
---

# Tailscale

OpenClaw 게이트웨이는 **Tailscale Serve**(tailnet 전용) 또는 **Tailscale Funnel**(공개 인터넷)을 통해 노출할 수 있습니다.

일반적인 사용 사례:
- **Serve**: Tailscale 기기 간에만 게이트웨이에 액세스
- **Funnel**: 외부에서 도달 가능한 웹훅 엔드포인트(예: Discord 봇, WhatsApp 웹훅)

## 모드

`gateway.tailscale.mode`는 Tailscale이 사용되는 방식을 제어합니다:

- `"serve"` (tailnet 전용): Tailscale Serve를 통해 게이트웨이를 tailnet에 노출합니다. `wss://`를 통한 Tailscale 기기에서만 접근 가능합니다.
- `"funnel"` (공개): Tailscale Funnel을 사용하여 공개 HTTPS 엔드포인트를 노출합니다. 인터넷에서 접근 가능합니다.
- `"off"` (기본값): Tailscale 통합 비활성화됨.

## 인증

Tailscale 모드에서 게이트웨이는 기본적으로 Tailscale 신원 헤더를 통해 인증할 수 있습니다.

`gateway.auth.allowTailscale: true`를 설정하면 OpenClaw는 Tailscale Serve/Funnel이 주입한 신원 헤더를 신뢰합니다. Tailscale이 신원을 확인하므로 별도의 토큰이나 비밀번호가 필요하지 않습니다.

```json5
{
  gateway: {
    tailscale: {
      mode: "serve",
    },
    auth: {
      allowTailscale: true,
    },
  },
}
```

토큰이나 비밀번호를 통한 명시적 인증을 선호하거나 필요한 경우에도 사용 가능합니다:

```json5
{
  gateway: {
    auth: {
      token: "your-token",
    },
    tailscale: {
      mode: "serve",
    },
  },
}
```

## 구성 예제

### tailnet 전용 Serve (권장)

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: {
      mode: "serve",
    },
    auth: {
      allowTailscale: true,
    },
  },
}
```

- 게이트웨이는 루프백에 바인딩됩니다.
- Tailscale Serve가 tailnet에 `wss://`를 통해 노출합니다.
- Tailscale 신원으로 인증됩니다.

### Tailscale tailnet에 바인딩

게이트웨이를 Tailscale 네트워크 인터페이스에 직접 바인딩합니다:

```json5
{
  gateway: {
    bind: "tailnet",
    auth: {
      token: "your-token",
    },
  },
}
```

- Tailscale IP에 직접 바인딩합니다(Serve/Funnel 없이).
- 게이트웨이가 `ws://` tailnet IP에서 직접 접근 가능합니다.
- 토큰 또는 비밀번호 인증이 필요합니다.

### 공개 Funnel

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: {
      mode: "funnel",
    },
    auth: {
      token: "your-token",
    },
  },
}
```

- 인터넷에서 접근 가능한 HTTPS 엔드포인트를 노출합니다.
- 공개 노출이므로 항상 토큰 또는 비밀번호 인증을 사용합니다.

## CLI 예제

게이트웨이 Tailscale 상태 확인:

```bash
openclaw gateway status
openclaw gateway probe
```

Tailscale 주소 확인:

```bash
tailscale status
tailscale ip
```

Tailscale Serve 상태 확인:

```bash
tailscale serve status
```

## 참고 사항

- **Tailscale Serve**는 루프백 게이트웨이를 tailnet에 `wss://`로 프록시합니다. `gateway.bind`가 `loopback`이어야 합니다.
- **Tailscale Funnel**은 인터넷에 공개됩니다; 항상 인증을 활성화합니다.
- **`gateway.auth.allowTailscale: true`**는 Tailscale 신원 헤더를 신뢰합니다; 이는 신뢰할 수 있는 프록시 설정입니다. Tailscale이 신원 확인을 수행하므로 안전합니다.
- 브라우저 액세스가 필요한 경우 Tailscale Serve가 올바른 선택입니다: HTTPS를 처리하고 tailnet 내에서 신뢰할 수 있는 인증서를 제공합니다.
- Control UI는 WebSocket 엔드포인트와 동일한 포트에서 서빙됩니다. Tailscale Serve/Funnel은 두 경우 모두 적용됩니다.

## 전제 조건 및 제한

- Tailscale이 설치되고 기기에서 활성화되어 있어야 합니다.
- Serve/Funnel에는 Tailscale 계정이 필요합니다.
- Funnel을 사용하려면 tailnet에서 Funnel이 활성화되어 있어야 합니다 (일부 Tailscale 플랜 필요).
- Tailscale Serve는 표준 포트(80/443)로 프록시합니다; `gateway.port`는 루프백 포트입니다.

## 관련 문서

- [원격 액세스](/gateway/remote) -- SSH 터널 및 tailnet 설정
- [인증](/gateway/authentication) -- 게이트웨이 인증 모드
- [신뢰할 수 있는 프록시 인증](/gateway/trusted-proxy-auth) -- 신원 인식 프록시 설정
- [보안](/gateway/security)
