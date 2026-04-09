---
summary: "DigitalOcean에서 OpenClaw 실행 (간단한 유료 VPS 옵션)"
read_when:
  - DigitalOcean에서 OpenClaw 설정 시
  - OpenClaw를 위한 저렴한 VPS 호스팅 찾을 때
title: "DigitalOcean (플랫폼)"
---

# DigitalOcean에서 OpenClaw

## 목표

DigitalOcean에서 월 **$6** (예약 가격 기준 월 $4)에 지속적인 OpenClaw 게이트웨이를 실행합니다.

$0/월 옵션을 원하고 ARM + 공급자별 설정이 괜찮다면 [Oracle Cloud 가이드](/platforms/oracle)를 참조하십시오.

## 비용 비교 (2026)

| 공급자       | 플랜            | 사양                   | 가격/월     | 비고                                  |
| ------------ | --------------- | ---------------------- | ----------- | ------------------------------------- |
| Oracle Cloud | Always Free ARM | 최대 4 OCPU, 24GB RAM  | $0          | ARM, 제한된 용량 / 가입 이슈          |
| Hetzner      | CX22            | 2 vCPU, 4GB RAM        | €3.79 (~$4) | 가장 저렴한 유료 옵션                 |
| DigitalOcean | Basic           | 1 vCPU, 1GB RAM        | $6          | 쉬운 UI, 좋은 문서                    |
| Vultr        | Cloud Compute   | 1 vCPU, 1GB RAM        | $6          | 많은 위치                             |
| Linode       | Nanode          | 1 vCPU, 1GB RAM        | $5          | 현재 Akamai의 일부                    |

**공급자 선택:**

- DigitalOcean: 가장 간단한 UX + 예측 가능한 설정 (이 가이드)
- Hetzner: 좋은 가격/성능 ([Hetzner 가이드](/install/hetzner) 참조)
- Oracle Cloud: 월 $0 가능하지만 더 까다롭고 ARM 전용 ([Oracle 가이드](/platforms/oracle) 참조)

---

## 사전 요구 사항

- DigitalOcean 계정 ([무료 크레딧 $200로 가입](https://m.do.co/c/signup))
- SSH 키 쌍 (또는 비밀번호 인증 사용 의향)
- ~20분

## 1) Droplet 생성

<Warning>
깨끗한 기본 이미지 (Ubuntu 24.04 LTS)를 사용하십시오. 시작 스크립트와 방화벽 기본값을 검토하지 않은 경우 타사 Marketplace 1-클릭 이미지는 피하십시오.
</Warning>

1. [DigitalOcean](https://cloud.digitalocean.com/)에 로그인합니다
2. **Create → Droplets** 클릭
3. 선택:
   - **Region:** 가장 가까운 위치 (또는 사용자)
   - **Image:** Ubuntu 24.04 LTS
   - **Size:** Basic → Regular → **$6/월** (1 vCPU, 1GB RAM, 25GB SSD)
   - **Authentication:** SSH 키 (권장) 또는 비밀번호
4. **Create Droplet** 클릭
5. IP 주소를 기록합니다

## 2) SSH로 연결

```bash
ssh root@YOUR_DROPLET_IP
```

## 3) OpenClaw 설치

```bash
# 시스템 업데이트
apt update && apt upgrade -y

# Node.js 24 설치
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# OpenClaw 설치
curl -fsSL https://openclaw.ai/install.sh | bash

# 확인
openclaw --version
```

## 4) 온보딩 실행

```bash
openclaw onboard --install-daemon
```

마법사가 다음 과정을 안내합니다:

- 모델 인증 (API 키 또는 OAuth)
- 채널 설정 (Telegram, WhatsApp, Discord 등)
- 게이트웨이 토큰 (자동 생성)
- 데몬 설치 (systemd)

## 5) 게이트웨이 확인

```bash
# 상태 확인
openclaw status

# 서비스 확인
systemctl --user status openclaw-gateway.service

# 로그 보기
journalctl --user -u openclaw-gateway.service -f
```

## 6) 대시보드 접근

게이트웨이는 기본적으로 루프백에 바인딩됩니다. Control UI에 접근하려면:

**옵션 A: SSH 터널 (권장)**

```bash
# 로컬 머신에서
ssh -L 18789:localhost:18789 root@YOUR_DROPLET_IP

# 그런 다음 열기: http://localhost:18789
```

**옵션 B: Tailscale Serve (HTTPS, 루프백 전용)**

```bash
# Droplet에서
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# 게이트웨이가 Tailscale Serve를 사용하도록 구성
openclaw config set gateway.tailscale.mode serve
openclaw gateway restart
```

열기: `https://<magicdns>/`

참고:

- Serve는 게이트웨이를 루프백 전용으로 유지하고 Tailscale ID 헤더를 통해 Control UI/WebSocket 트래픽을 인증합니다 (토큰 없는 인증은 신뢰할 수 있는 게이트웨이 호스트를 가정합니다; HTTP API는 해당 Tailscale 헤더를 사용하지 않고 게이트웨이의 일반 HTTP 인증 모드를 따릅니다).
- 명시적인 공유 비밀 자격 증명을 요구하려면 `gateway.auth.allowTailscale: false`를 설정하고 `gateway.auth.mode: "token"` 또는 `"password"`를 사용하십시오.

**옵션 C: Tailnet 바인드 (Serve 없음)**

```bash
openclaw config set gateway.bind tailnet
openclaw gateway restart
```

열기: `http://<tailscale-ip>:18789` (토큰 필요).

## 7) 채널 연결

### Telegram

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

### WhatsApp

```bash
openclaw channels login whatsapp
# QR 코드 스캔
```

다른 공급자는 [채널](/channels)을 참조하십시오.

---

## 1GB RAM 최적화

$6 Droplet에는 1GB RAM만 있습니다. 원활하게 실행하려면:

### 스왑 추가 (권장)

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 더 가벼운 모델 사용

OOM이 발생하는 경우 다음을 고려하십시오:

- 로컬 모델 대신 API 기반 모델 사용 (Claude, GPT)
- `agents.defaults.model.primary`를 더 작은 모델로 설정

### 메모리 모니터링

```bash
free -h
htop
```

---

## 영속성

모든 상태는 다음에 저장됩니다:

- `~/.openclaw/` — `openclaw.json`, 에이전트별 `auth-profiles.json`, 채널/공급자 상태, 세션 데이터
- `~/.openclaw/workspace/` — 작업 공간 (SOUL.md, 메모리 등)

재부팅 후에도 유지됩니다. 주기적으로 백업하십시오:

```bash
openclaw backup create
```

---

## Oracle Cloud 무료 대안

Oracle Cloud는 여기에 있는 어떤 유료 옵션보다 훨씬 강력한 **Always Free** ARM 인스턴스를 월 $0에 제공합니다.

| 제공 사항          | 사양                   |
| ------------------ | ---------------------- |
| **4 OCPUs**        | ARM Ampere A1          |
| **24GB RAM**       | 충분한 용량            |
| **200GB 스토리지** | 블록 볼륨              |
| **영구 무료**      | 신용카드 청구 없음     |

**주의 사항:**

- 가입이 까다로울 수 있습니다 (실패하면 다시 시도)
- ARM 아키텍처 — 대부분 작동하지만 일부 바이너리는 ARM 빌드가 필요함

전체 설정 가이드는 [Oracle Cloud](/platforms/oracle)를 참조하십시오. 가입 팁 및 등록 프로세스 문제 해결은 이 [커뮤니티 가이드](https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd)를 참조하십시오.

---

## 문제 해결

### 게이트웨이가 시작되지 않음

```bash
openclaw gateway status
openclaw doctor --non-interactive
journalctl --user -u openclaw-gateway.service --no-pager -n 50
```

### 포트 이미 사용 중

```bash
lsof -i :18789
kill <PID>
```

### 메모리 부족

```bash
# 메모리 확인
free -h

# 스왑 추가
# 또는 $12/월 Droplet (2GB RAM)으로 업그레이드
```

---

## 참고 자료

- [Hetzner 가이드](/install/hetzner) — 더 저렴하고 강력함
- [Docker 설치](/install/docker) — 컨테이너화된 설정
- [Tailscale](/gateway/tailscale) — 보안 원격 접근
- [구성](/gateway/configuration) — 전체 구성 레퍼런스
