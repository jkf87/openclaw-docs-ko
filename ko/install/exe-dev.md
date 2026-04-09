---
summary: "원격 액세스를 위해 exe.dev (VM + HTTPS 프록시)에서 OpenClaw Gateway 실행"
read_when:
  - Gateway를 위한 저렴하고 상시 가동되는 Linux 호스트를 원하는 경우
  - 직접 VPS를 운영하지 않고 원격 Control UI 액세스를 원하는 경우
title: "exe.dev"
---

# exe.dev

목표: exe.dev VM에서 실행되고 `https://<vm-name>.exe.xyz`를 통해 노트북에서 도달할 수 있는 OpenClaw Gateway

이 페이지는 exe.dev의 기본 **exeuntu** 이미지를 가정합니다. 다른 배포판을 선택한 경우 패키지를 적절히 매핑하십시오.

## 초보자 빠른 경로

1. [https://exe.new/openclaw](https://exe.new/openclaw)
2. 필요에 따라 인증 키/토큰 입력
3. VM 옆의 "Agent"를 클릭하고 Shelley의 프로비저닝 완료를 기다립니다
4. `https://<vm-name>.exe.xyz/`를 열고 구성된 공유 시크릿으로 인증합니다(이 가이드는 기본적으로 토큰 인증을 사용하지만 `gateway.auth.mode`를 전환하면 비밀번호 인증도 작동합니다)
5. `openclaw devices approve <requestId>`로 보류 중인 장치 페어링 요청을 승인합니다

## 필요 사항

- exe.dev 계정
- [exe.dev](https://exe.dev) 가상 머신에 대한 `ssh exe.dev` 액세스 (선택적)

## Shelley를 사용한 자동 설치

[exe.dev](https://exe.dev)의 에이전트인 Shelley는 프롬프트를 통해 OpenClaw를 즉시 설치할 수 있습니다. 사용되는 프롬프트는 다음과 같습니다:

```
Set up OpenClaw (https://docs.openclaw.ai/install) on this VM. Use the non-interactive and accept-risk flags for openclaw onboarding. Add the supplied auth or token as needed. Configure nginx to forward from the default port 18789 to the root location on the default enabled site config, making sure to enable Websocket support. Pairing is done by "openclaw devices list" and "openclaw devices approve <request id>". Make sure the dashboard shows that OpenClaw's health is OK. exe.dev handles forwarding from port 8000 to port 80/443 and HTTPS for us, so the final "reachable" should be <vm-name>.exe.xyz, without port specification.
```

## 수동 설치

## 1) VM 생성

장치에서:

```bash
ssh exe.dev new
```

그런 다음 연결합니다:

```bash
ssh <vm-name>.exe.xyz
```

팁: 이 VM을 **상태 유지**로 유지합니다. OpenClaw는 `openclaw.json`, 에이전트별 `auth-profiles.json`, 세션 및 채널/제공자 상태를 `~/.openclaw/` 아래에, 작업 공간을 `~/.openclaw/workspace/` 아래에 저장합니다.

## 2) 사전 요구 사항 설치 (VM에서)

```bash
sudo apt-get update
sudo apt-get install -y git curl jq ca-certificates openssl
```

## 3) OpenClaw 설치

OpenClaw 설치 스크립트를 실행합니다:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

## 4) OpenClaw를 포트 8000으로 프록시하도록 nginx 설정

`/etc/nginx/sites-enabled/default`를 다음으로 편집합니다

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 8000;
    listen [::]:8000;

    server_name _;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;

        # WebSocket 지원
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 표준 프록시 헤더
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 장기 실행 연결을 위한 타임아웃 설정
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

클라이언트 제공 체인을 보존하는 대신 전달 헤더를 덮어씁니다.
OpenClaw는 명시적으로 구성된 프록시에서만 전달된 IP 메타데이터를 신뢰하며,
추가 방식 `X-Forwarded-For` 체인은 강화 위험으로 처리됩니다.

## 5) OpenClaw 액세스 및 권한 부여

`https://<vm-name>.exe.xyz/`에 액세스합니다(온보딩의 Control UI 출력 참조). 인증을 요청하면 VM에서 구성된 공유 시크릿을 붙여넣습니다. 이 가이드는 토큰 인증을 사용하므로 `openclaw config get gateway.auth.token`으로 `gateway.auth.token`을 검색합니다(또는 `openclaw doctor --generate-gateway-token`으로 생성합니다). 게이트웨이를 비밀번호 인증으로 변경한 경우 `gateway.auth.password` / `OPENCLAW_GATEWAY_PASSWORD`를 사용합니다.
`openclaw devices list` 및 `openclaw devices approve <requestId>`로 장치를 승인합니다. 확실하지 않은 경우 브라우저에서 Shelley를 사용하십시오!

## 원격 액세스

원격 액세스는 [exe.dev](https://exe.dev)의 인증으로 처리됩니다. 기본적으로 포트 8000의 HTTP 트래픽은 이메일 인증과 함께 `https://<vm-name>.exe.xyz`로 전달됩니다.

## 업데이트

```bash
npm i -g openclaw@latest
openclaw doctor
openclaw gateway restart
openclaw health
```

가이드: [업데이트](/install/updating)
