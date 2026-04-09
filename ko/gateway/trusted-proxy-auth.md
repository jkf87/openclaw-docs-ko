---
title: "신뢰할 수 있는 프록시 인증"
summary: "신뢰할 수 있는 역방향 프록시(Pomerium, Caddy, nginx + OAuth)에 게이트웨이 인증 위임"
read_when:
  - 신원 인식 프록시 뒤에서 OpenClaw를 실행할 때
  - OpenClaw 앞에 OAuth가 있는 Pomerium, Caddy, 또는 nginx 설정 시
  - 역방향 프록시 설정에서 WebSocket 1008 권한 없음 오류 수정 시
  - HSTS 및 기타 HTTP 강화 헤더를 설정할 위치 결정 시
---

# 신뢰할 수 있는 프록시 인증

> ⚠️ **보안에 민감한 기능.** 이 모드는 인증을 역방향 프록시에 완전히 위임합니다. 잘못된 구성은 게이트웨이를 무단 액세스에 노출시킬 수 있습니다. 활성화하기 전에 이 페이지를 주의 깊게 읽으십시오.

## 사용 시기

다음과 같은 경우 `trusted-proxy` 인증 모드를 사용합니다:

- **신원 인식 프록시**(Pomerium, Caddy + OAuth, nginx + oauth2-proxy, Traefik + 포워드 인증) 뒤에서 OpenClaw를 실행할 때
- 프록시가 모든 인증을 처리하고 헤더를 통해 사용자 신원을 전달할 때
- 프록시가 게이트웨이로 가는 유일한 경로인 Kubernetes 또는 컨테이너 환경
- 브라우저가 WS 페이로드에서 토큰을 전달할 수 없어 WebSocket `1008 unauthorized` 오류가 발생할 때

## 사용하지 말아야 할 경우

- 프록시가 사용자를 인증하지 않는 경우(단순한 TLS 터미네이터 또는 로드 밸런서)
- 프록시를 우회하는 게이트웨이 경로가 있는 경우(방화벽 구멍, 내부 네트워크 액세스)
- 프록시가 전달된 헤더를 올바르게 제거/덮어쓰는지 확신하지 못하는 경우
- 개인 단일 사용자 액세스만 필요한 경우(더 간단한 설정을 위해 Tailscale Serve + 루프백 고려)

## 작동 방식

1. 역방향 프록시가 사용자를 인증합니다(OAuth, OIDC, SAML 등).
2. 프록시가 인증된 사용자 신원이 포함된 헤더를 추가합니다(예: `x-forwarded-user: nick@example.com`).
3. OpenClaw는 요청이 **신뢰할 수 있는 프록시 IP**(`gateway.trustedProxies`에 구성됨)에서 왔는지 확인합니다.
4. OpenClaw는 구성된 헤더에서 사용자 신원을 추출합니다.
5. 모든 것이 확인되면 요청이 승인됩니다.

## Control UI 페어링 동작

`gateway.auth.mode = "trusted-proxy"`가 활성화되고 요청이 신뢰할 수 있는 프록시 검사를 통과하면 Control UI WebSocket 세션은 기기 페어링 신원 없이 연결할 수 있습니다.

의미:

- 이 모드에서 페어링은 Control UI 액세스의 기본 게이트가 아닙니다.
- 역방향 프록시 인증 정책과 `allowUsers`가 효과적인 액세스 제어가 됩니다.
- 게이트웨이 인그레스는 신뢰할 수 있는 프록시 IP에만 잠겨 있어야 합니다(`gateway.trustedProxies` + 방화벽).

## 구성

```json5
{
  gateway: {
    // 신뢰할 수 있는 프록시 인증은 비루프백 신뢰할 수 있는 프록시 소스의 요청을 기대합니다
    bind: "lan",

    // 중요: 여기에 프록시 IP만 추가합니다
    trustedProxies: ["10.0.0.1", "172.17.0.1"],

    auth: {
      mode: "trusted-proxy",
      trustedProxy: {
        // 인증된 사용자 신원이 포함된 헤더 (필수)
        userHeader: "x-forwarded-user",

        // 선택 사항: 반드시 존재해야 하는 헤더 (프록시 검증)
        requiredHeaders: ["x-forwarded-proto", "x-forwarded-host"],

        // 선택 사항: 특정 사용자로 제한 (비어 있으면 모두 허용)
        allowUsers: ["nick@example.com", "admin@company.org"],
      },
    },
  },
}
```

중요 런타임 규칙:

- 신뢰할 수 있는 프록시 인증은 루프백 소스 요청(`127.0.0.1`, `::1`, 루프백 CIDR)을 거부합니다.
- 동일 호스트 루프백 역방향 프록시는 신뢰할 수 있는 프록시 인증을 **충족하지 않습니다**.
- 동일 호스트 루프백 프록시 설정의 경우 토큰/비밀번호 인증을 대신 사용하거나, OpenClaw가 확인할 수 있는 비루프백 신뢰할 수 있는 프록시 주소를 통해 라우팅합니다.
- 비루프백 Control UI 배포는 여전히 명시적인 `gateway.controlUi.allowedOrigins`가 필요합니다.

### 구성 참조

| 필드                                        | 필수 | 설명                                                                  |
| ------------------------------------------- | ---- | --------------------------------------------------------------------- |
| `gateway.trustedProxies`                    | 예   | 신뢰할 프록시 IP 주소 배열. 다른 IP의 요청은 거부됩니다.             |
| `gateway.auth.mode`                         | 예   | `"trusted-proxy"`이어야 합니다                                        |
| `gateway.auth.trustedProxy.userHeader`      | 예   | 인증된 사용자 신원이 포함된 헤더 이름                                 |
| `gateway.auth.trustedProxy.requiredHeaders` | 아니요 | 요청이 신뢰받기 위해 존재해야 하는 추가 헤더                        |
| `gateway.auth.trustedProxy.allowUsers`      | 아니요 | 사용자 신원 허용 목록. 비어 있으면 인증된 모든 사용자를 허용합니다. |

## TLS 종료 및 HSTS

하나의 TLS 종료 지점을 사용하고 거기에 HSTS를 적용합니다.

### 권장 패턴: 프록시 TLS 종료

역방향 프록시가 `https://control.example.com`에 대해 HTTPS를 처리할 때 해당 도메인의 프록시에서 `Strict-Transport-Security`를 설정합니다.

- 인터넷 노출 배포에 적합합니다.
- 인증서 + HTTP 강화 정책을 한 곳에 유지합니다.
- OpenClaw는 프록시 뒤에서 루프백 HTTP를 유지할 수 있습니다.

헤더 값 예제:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 게이트웨이 TLS 종료

OpenClaw가 HTTPS를 직접 제공하는 경우(TLS 종료 프록시 없음) 설정합니다:

```json5
{
  gateway: {
    tls: { enabled: true },
    http: {
      securityHeaders: {
        strictTransportSecurity: "max-age=31536000; includeSubDomains",
      },
    },
  },
}
```

`strictTransportSecurity`는 문자열 헤더 값을 허용하거나, 명시적으로 비활성화하려면 `false`를 허용합니다.

### 롤아웃 가이드

- 트래픽을 유효성 검사하는 동안 짧은 max age로 시작합니다(예: `max-age=300`).
- 확신이 높아진 후에만 오래된 값으로 늘립니다(예: `max-age=31536000`).
- 모든 서브도메인이 HTTPS 준비가 된 경우에만 `includeSubDomains`를 추가합니다.
- 전체 도메인 집합에 대한 사전 로드 요구 사항을 의도적으로 충족하는 경우에만 preload를 사용합니다.
- 루프백 전용 로컬 개발은 HSTS의 혜택을 받지 않습니다.

## 프록시 설정 예제

### Pomerium

Pomerium은 `x-pomerium-claim-email`(또는 다른 클레임 헤더)에 신원을 전달하고 `x-pomerium-jwt-assertion`에 JWT를 전달합니다.

```json5
{
  gateway: {
    bind: "lan",
    trustedProxies: ["10.0.0.1"], // Pomerium의 IP
    auth: {
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-pomerium-claim-email",
        requiredHeaders: ["x-pomerium-jwt-assertion"],
      },
    },
  },
}
```

Pomerium 구성 스니펫:

```yaml
routes:
  - from: https://openclaw.example.com
    to: http://openclaw-gateway:18789
    policy:
      - allow:
          or:
            - email:
                is: nick@example.com
    pass_identity_headers: true
```

### OAuth가 있는 Caddy

`caddy-security` 플러그인이 있는 Caddy는 사용자를 인증하고 신원 헤더를 전달할 수 있습니다.

```json5
{
  gateway: {
    bind: "lan",
    trustedProxies: ["10.0.0.1"], // Caddy/사이드카 프록시 IP
    auth: {
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-forwarded-user",
      },
    },
  },
}
```

Caddyfile 스니펫:

```
openclaw.example.com {
    authenticate with oauth2_provider
    authorize with policy1

    reverse_proxy openclaw:18789 {
        header_up X-Forwarded-User {http.auth.user.email}
    }
}
```

### nginx + oauth2-proxy

oauth2-proxy는 사용자를 인증하고 `x-auth-request-email`에 신원을 전달합니다.

```json5
{
  gateway: {
    bind: "lan",
    trustedProxies: ["10.0.0.1"], // nginx/oauth2-proxy IP
    auth: {
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-auth-request-email",
      },
    },
  },
}
```

nginx 구성 스니펫:

```nginx
location / {
    auth_request /oauth2/auth;
    auth_request_set $user $upstream_http_x_auth_request_email;

    proxy_pass http://openclaw:18789;
    proxy_set_header X-Auth-Request-Email $user;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 포워드 인증이 있는 Traefik

```json5
{
  gateway: {
    bind: "lan",
    trustedProxies: ["172.17.0.1"], // Traefik 컨테이너 IP
    auth: {
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-forwarded-user",
      },
    },
  },
}
```

## 혼합 토큰 구성

OpenClaw는 `gateway.auth.token`(또는 `OPENCLAW_GATEWAY_TOKEN`)과 `trusted-proxy` 모드가 동시에 활성화된 모호한 구성을 거부합니다. 혼합 토큰 구성은 루프백 요청이 잘못된 인증 경로에서 자동으로 인증되게 할 수 있습니다.

시작 시 `mixed_trusted_proxy_token` 오류가 표시되면:

- 신뢰할 수 있는 프록시 모드 사용 시 공유 토큰을 제거하거나,
- 토큰 기반 인증을 의도하는 경우 `gateway.auth.mode`를 `"token"`으로 전환합니다.

루프백 신뢰할 수 있는 프록시 인증도 페일 클로즈됩니다: 동일 호스트 호출자는 자동으로 인증되는 대신 신뢰할 수 있는 프록시를 통해 구성된 신원 헤더를 제공해야 합니다.

## 오퍼레이터 범위 헤더

신뢰할 수 있는 프록시 인증은 **신원 인식** HTTP 모드이므로 발신자는 선택적으로 `x-openclaw-scopes`로 오퍼레이터 범위를 선언할 수 있습니다.

예제:

- `x-openclaw-scopes: operator.read`
- `x-openclaw-scopes: operator.read,operator.write`
- `x-openclaw-scopes: operator.admin,operator.write`

동작:

- 헤더가 있는 경우 OpenClaw는 선언된 범위 집합을 준수합니다.
- 헤더가 있지만 비어 있는 경우 요청은 오퍼레이터 범위를 **없이** 선언합니다.
- 헤더가 없는 경우 일반 신원 인식 HTTP API는 표준 오퍼레이터 기본 범위 집합으로 폴백합니다.
- 게이트웨이 인증 **플러그인 HTTP 라우트**는 기본적으로 더 좁습니다: `x-openclaw-scopes`가 없는 경우 런타임 범위가 `operator.write`로 폴백합니다.
- 브라우저 출처 HTTP 요청은 신뢰할 수 있는 프록시 인증이 성공한 후에도 `gateway.controlUi.allowedOrigins`(또는 의도적 Host 헤더 폴백 모드)를 통과해야 합니다.

실용적 규칙:

- 신뢰할 수 있는 프록시 요청이 기본값보다 좁아지기를 원할 때나 게이트웨이 인증 플러그인 라우트가 쓰기 범위보다 강한 것이 필요할 때 `x-openclaw-scopes`를 명시적으로 보냅니다.

## 보안 체크리스트

신뢰할 수 있는 프록시 인증을 활성화하기 전에 확인합니다:

- [ ] **프록시가 유일한 경로**: 게이트웨이 포트가 프록시를 제외한 모든 것에서 방화벽으로 차단됨
- [ ] **trustedProxies는 최소**: 전체 서브넷이 아닌 실제 프록시 IP만
- [ ] **루프백 프록시 소스 없음**: 신뢰할 수 있는 프록시 인증은 루프백 소스 요청에 대해 페일 클로즈됨
- [ ] **프록시가 헤더를 제거**: 프록시가 클라이언트의 `x-forwarded-*` 헤더를 추가가 아닌 덮어씀
- [ ] **TLS 종료**: 프록시가 TLS를 처리; 사용자가 HTTPS를 통해 연결
- [ ] **allowedOrigins가 명시적**: 비루프백 Control UI는 명시적 `gateway.controlUi.allowedOrigins` 사용
- [ ] **allowUsers가 설정됨** (권장): 인증된 모든 사람을 허용하는 대신 알려진 사용자로 제한
- [ ] **혼합 토큰 구성 없음**: `gateway.auth.token`과 `gateway.auth.mode: "trusted-proxy"` 모두 설정하지 않음

## 보안 감사

`openclaw security audit`은 신뢰할 수 있는 프록시 인증을 **치명적** 심각도 결과로 플래그합니다. 이는 의도적인 것입니다. 보안을 프록시 설정에 위임하고 있다는 것을 상기시켜 줍니다.

감사 확인 사항:

- 기본 `gateway.trusted_proxy_auth` 경고/치명적 알림
- 누락된 `trustedProxies` 구성
- 누락된 `userHeader` 구성
- 비어 있는 `allowUsers`(인증된 모든 사용자 허용)
- 노출된 Control UI 표면에서 와일드카드 또는 누락된 브라우저 출처 정책

## 문제 해결

### "trusted_proxy_untrusted_source"

요청이 `gateway.trustedProxies`의 IP에서 오지 않았습니다. 확인:

- 프록시 IP가 올바릅니까? (Docker 컨테이너 IP가 변경될 수 있음)
- 프록시 앞에 로드 밸런서가 있습니까?
- `docker inspect` 또는 `kubectl get pods -o wide`를 사용하여 실제 IP를 찾습니다

### "trusted_proxy_loopback_source"

OpenClaw가 루프백 소스 신뢰할 수 있는 프록시 요청을 거부했습니다.

확인:

- 프록시가 `127.0.0.1` / `::1`에서 연결하고 있습니까?
- 동일 호스트 루프백 역방향 프록시로 신뢰할 수 있는 프록시 인증을 사용하려고 합니까?

수정:

- 동일 호스트 루프백 프록시 설정에 토큰/비밀번호 인증을 사용하거나,
- 비루프백 신뢰할 수 있는 프록시 주소를 통해 라우팅하고 해당 IP를 `gateway.trustedProxies`에 유지합니다.

### "trusted_proxy_user_missing"

사용자 헤더가 비어 있거나 누락됐습니다. 확인:

- 프록시가 신원 헤더를 전달하도록 구성됐습니까?
- 헤더 이름이 올바릅니까? (대소문자 구분 없음, 철자가 중요)
- 사용자가 프록시에서 실제로 인증됐습니까?

### "trusted_proxy_missing_header_\*"

필수 헤더가 없었습니다. 확인:

- 해당 특정 헤더에 대한 프록시 구성
- 체인 어딘가에서 헤더가 제거되고 있는지 여부

### "trusted_proxy_user_not_allowed"

사용자가 인증됐지만 `allowUsers`에 없습니다. 추가하거나 허용 목록을 제거합니다.

### "trusted_proxy_origin_not_allowed"

신뢰할 수 있는 프록시 인증이 성공했지만 브라우저 `Origin` 헤더가 Control UI 출처 확인을 통과하지 못했습니다.

확인:

- `gateway.controlUi.allowedOrigins`에 정확한 브라우저 출처가 포함됨
- 모두 허용 동작을 의도적으로 원하지 않는 한 와일드카드 출처에 의존하지 않음
- 의도적으로 Host 헤더 폴백 모드를 사용하는 경우 `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true`가 의도적으로 설정됨

### WebSocket이 여전히 실패함

프록시가 다음을 확인합니다:

- WebSocket 업그레이드를 지원함(`Upgrade: websocket`, `Connection: upgrade`)
- WebSocket 업그레이드 요청에 신원 헤더를 전달함(HTTP만이 아닌)
- WebSocket 연결에 대한 별도의 인증 경로가 없음

## 토큰 인증에서 마이그레이션

토큰 인증에서 신뢰할 수 있는 프록시로 이동하는 경우:

1. 사용자를 인증하고 헤더를 전달하도록 프록시를 구성합니다
2. 프록시 설정을 독립적으로 테스트합니다(헤더가 있는 curl)
3. 신뢰할 수 있는 프록시 인증으로 OpenClaw 구성을 업데이트합니다
4. 게이트웨이를 다시 시작합니다
5. Control UI에서 WebSocket 연결을 테스트합니다
6. `openclaw security audit`을 실행하고 결과를 검토합니다

## 관련 문서

- [보안](/gateway/security/) — 전체 보안 가이드
- [구성](/gateway/configuration) — 구성 참조
- [원격 액세스](/gateway/remote) — 기타 원격 액세스 패턴
- [Tailscale](/gateway/tailscale) — tailnet 전용 액세스를 위한 더 간단한 대안
