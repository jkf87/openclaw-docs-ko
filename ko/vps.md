---
summary: "Linux 서버 또는 클라우드 VPS에서 OpenClaw 실행 — 프로바이더 선택, 아키텍처, 튜닝"
read_when:
  - Linux 서버 또는 클라우드 VPS에서 게이트웨이를 실행하려는 경우
  - 호스팅 가이드의 빠른 지도가 필요할 때
  - OpenClaw를 위한 일반 Linux 서버 튜닝을 원할 때
title: "Linux 서버"
sidebarTitle: "Linux 서버"
---

# Linux 서버

모든 Linux 서버 또는 클라우드 VPS에서 OpenClaw 게이트웨이를 실행하십시오. 이 페이지는 프로바이더 선택을 도와주고, 클라우드 배포 방식을 설명하며, 어디서나 적용되는 일반 Linux 튜닝을 다룹니다.

## 프로바이더 선택

<CardGroup cols={2}>
  <Card title="Railway" href="/install/railway">원클릭, 브라우저 설정</Card>
  <Card title="Northflank" href="/install/northflank">원클릭, 브라우저 설정</Card>
  <Card title="DigitalOcean" href="/install/digitalocean">간단한 유료 VPS</Card>
  <Card title="Oracle Cloud" href="/install/oracle">Always Free ARM 티어</Card>
  <Card title="Fly.io" href="/install/fly">Fly Machines</Card>
  <Card title="Hetzner" href="/install/hetzner">Hetzner VPS의 Docker</Card>
  <Card title="GCP" href="/install/gcp">Compute Engine</Card>
  <Card title="Azure" href="/install/azure">Linux VM</Card>
  <Card title="exe.dev" href="/install/exe-dev">HTTPS 프록시가 있는 VM</Card>
  <Card title="Raspberry Pi" href="/install/raspberry-pi">ARM 자체 호스팅</Card>
</CardGroup>

**AWS (EC2 / Lightsail / 무료 티어)**도 잘 작동합니다.
커뮤니티 동영상 안내가
[x.com/techfrenAJ/status/2014934471095812547](https://x.com/techfrenAJ/status/2014934471095812547)에서 제공됩니다
(커뮤니티 리소스 -- 제공이 중단될 수 있습니다).

## 클라우드 설정 작동 방식

- **게이트웨이는 VPS에서 실행**되고 상태 + 워크스페이스를 소유합니다.
- **Control UI** 또는 **Tailscale/SSH**를 통해 노트북이나 휴대폰에서 연결합니다.
- VPS를 진실 소스로 취급하고 상태 + 워크스페이스를 정기적으로 **백업**하십시오.
- 안전한 기본값: 게이트웨이를 루프백에 유지하고 SSH 터널 또는 Tailscale Serve를 통해 접근하십시오. `lan` 또는 `tailnet`에 바인드하는 경우 `gateway.auth.token` 또는 `gateway.auth.password`를 요구하십시오.

관련 페이지: [게이트웨이 원격 접근](/gateway/remote), [플랫폼 허브](/platforms/).

## VPS에서 공유 회사 에이전트

모든 사용자가 동일한 신뢰 경계에 있고 에이전트가 비즈니스 전용인 경우, 팀을 위한 단일 에이전트 실행은 유효한 설정입니다.

- 전용 런타임(VPS/VM/컨테이너 + 전용 OS 사용자/계정)에 유지하십시오.
- 해당 런타임을 개인 Apple/Google 계정이나 개인 브라우저/패스워드 매니저 프로파일에 로그인하지 마십시오.
- 사용자들이 서로에게 적대적인 경우 게이트웨이/호스트/OS 사용자별로 분리하십시오.

보안 모델 세부 사항: [보안](/gateway/security/).

## VPS와 함께 노드 사용

클라우드에 게이트웨이를 유지하고 로컬 기기(Mac/iOS/Android/헤드리스)에 **노드**를 페어링할 수 있습니다. 노드는 게이트웨이가 클라우드에 있는 동안 로컬 화면/카메라/Canvas와 `system.run` 기능을 제공합니다.

문서: [노드](/nodes/), [노드 CLI](/cli/nodes).

## 소형 VM 및 ARM 호스트를 위한 시작 튜닝

저전력 VM(또는 ARM 호스트)에서 CLI 명령어가 느리게 느껴지는 경우 Node의 모듈 컴파일 캐시를 활성화하십시오:

```bash
grep -q 'NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache' ~/.bashrc || cat >> ~/.bashrc <<'EOF'
export NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache
mkdir -p /var/tmp/openclaw-compile-cache
export OPENCLAW_NO_RESPAWN=1
EOF
source ~/.bashrc
```

- `NODE_COMPILE_CACHE`는 반복 명령어 시작 시간을 개선합니다.
- `OPENCLAW_NO_RESPAWN=1`은 자체 재생성 경로의 추가 시작 오버헤드를 방지합니다.
- 첫 번째 명령어 실행이 캐시를 워밍하고, 이후 실행이 더 빠릅니다.
- Raspberry Pi 특이 사항은 [Raspberry Pi](/install/raspberry-pi)를 참조하십시오.

### systemd 튜닝 체크리스트 (선택 사항)

`systemd`를 사용하는 VM 호스트의 경우 다음을 고려하십시오:

- 안정적인 시작 경로를 위한 서비스 환경 추가:
  - `OPENCLAW_NO_RESPAWN=1`
  - `NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache`
- 재시작 동작을 명시적으로 유지:
  - `Restart=always`
  - `RestartSec=2`
  - `TimeoutStartSec=90`
- 랜덤 I/O 콜드 스타트 페널티를 줄이기 위해 상태/캐시 경로에 SSD 기반 디스크를 선호하십시오.

표준 `openclaw onboard --install-daemon` 경로의 경우 사용자 유닛을 편집하십시오:

```bash
systemctl --user edit openclaw-gateway.service
```

```ini
[Service]
Environment=OPENCLAW_NO_RESPAWN=1
Environment=NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache
Restart=always
RestartSec=2
TimeoutStartSec=90
```

대신 의도적으로 시스템 유닛을 설치한 경우
`sudo systemctl edit openclaw-gateway.service`를 통해 `openclaw-gateway.service`를 편집하십시오.

`Restart=` 정책이 자동화된 복구에 어떻게 도움이 되는지:
[systemd는 서비스 복구를 자동화할 수 있습니다](https://www.redhat.com/en/blog/systemd-automate-recovery).
