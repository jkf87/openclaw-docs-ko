---
summary: "DigitalOcean Droplet에서 OpenClaw 호스팅"
read_when:
  - DigitalOcean에서 OpenClaw 설정 중인 경우
  - OpenClaw를 위한 간단한 유료 VPS를 찾는 경우
title: "DigitalOcean"
---

# DigitalOcean

DigitalOcean Droplet에서 영구적인 OpenClaw Gateway를 실행합니다.

## 사전 요구 사항

- DigitalOcean 계정 ([가입](https://cloud.digitalocean.com/registrations/new))
- SSH 키 쌍 (또는 비밀번호 인증 사용 의향)
- 약 20분

## 설정

<Steps>
  <Step title="Droplet 생성">
    <Warning>
    깨끗한 기본 이미지(Ubuntu 24.04 LTS)를 사용하십시오. 시작 스크립트와 방화벽 기본값을 검토하지 않은 한 타사 Marketplace 1-클릭 이미지는 피하십시오.
    </Warning>

    1. [DigitalOcean](https://cloud.digitalocean.com/)에 로그인합니다.
    2. **Create > Droplets**를 클릭합니다.
    3. 다음을 선택합니다:
       - **지역:** 가장 가까운 곳
       - **이미지:** Ubuntu 24.04 LTS
       - **크기:** Basic, Regular, 1 vCPU / 1 GB RAM / 25 GB SSD
       - **인증:** SSH 키 (권장) 또는 비밀번호
    4. **Create Droplet**을 클릭하고 IP 주소를 기록합니다.

  </Step>

  <Step title="연결 및 설치">
    ```bash
    ssh root@YOUR_DROPLET_IP

    apt update && apt upgrade -y

    # Node.js 24 설치
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    apt install -y nodejs

    # OpenClaw 설치
    curl -fsSL https://openclaw.ai/install.sh | bash
    openclaw --version
    ```

  </Step>

  <Step title="온보딩 실행">
    ```bash
    openclaw onboard --install-daemon
    ```

    마법사는 모델 인증, 채널 설정, 게이트웨이 토큰 생성 및 데몬 설치(systemd) 과정을 안내합니다.

  </Step>

  <Step title="스왑 추가 (1 GB Droplet에 권장)">
    ```bash
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    ```
  </Step>

  <Step title="게이트웨이 확인">
    ```bash
    openclaw status
    systemctl --user status openclaw-gateway.service
    journalctl --user -u openclaw-gateway.service -f
    ```
  </Step>

  <Step title="Control UI 액세스">
    게이트웨이는 기본적으로 루프백에 바인딩됩니다. 다음 옵션 중 하나를 선택하십시오.

    **옵션 A: SSH 터널 (가장 간단)**

    ```bash
    # 로컬 머신에서
    ssh -L 18789:localhost:18789 root@YOUR_DROPLET_IP
    ```

    그런 다음 `http://localhost:18789`를 엽니다.

    **옵션 B: Tailscale Serve**

    ```bash
    curl -fsSL https://tailscale.com/install.sh | sh
    tailscale up
    openclaw config set gateway.tailscale.mode serve
    openclaw gateway restart
    ```

    그런 다음 tailnet의 모든 장치에서 `https://<magicdns>/`를 엽니다.

    **옵션 C: Tailnet 바인딩 (Serve 없이)**

    ```bash
    openclaw config set gateway.bind tailnet
    openclaw gateway restart
    ```

    그런 다음 `http://<tailscale-ip>:18789`를 엽니다(토큰 필요).

  </Step>
</Steps>

## 문제 해결

**게이트웨이가 시작되지 않습니다** -- `openclaw doctor --non-interactive`를 실행하고 `journalctl --user -u openclaw-gateway.service -n 50`으로 로그를 확인합니다.

**포트가 이미 사용 중입니다** -- `lsof -i :18789`를 실행하여 프로세스를 찾은 후 중지합니다.

**메모리 부족** -- `free -h`로 스왑이 활성화되어 있는지 확인합니다. 여전히 OOM이 발생하면 로컬 모델 대신 API 기반 모델(Claude, GPT)을 사용하거나 2 GB Droplet으로 업그레이드하십시오.

## 다음 단계

- [채널](/channels/) -- Telegram, WhatsApp, Discord 등 연결
- [Gateway 구성](/gateway/configuration) -- 모든 구성 옵션
- [업데이트](/install/updating) -- OpenClaw를 최신 상태로 유지
