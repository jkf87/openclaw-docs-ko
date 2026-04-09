---
title: "Raspberry Pi"
description: "Raspberry Pi에서 OpenClaw 게이트웨이를 항상 켜져 있는 서버로 실행"
---

# Raspberry Pi

Raspberry Pi를 항상 켜져 있는 저전력 OpenClaw 게이트웨이 서버로 사용합니다.

## 사전 요구 사항

- **Raspberry Pi 4 또는 5** (권장; Pi 3도 가능하지만 더 느림)
- **2GB 이상의 RAM** (4GB 이상 권장)
- **64비트 OS** (Raspberry Pi OS 64비트 또는 Ubuntu Server 64비트)
- **8GB 이상의 microSD 카드** (빠른 클래스 10 카드 권장)
- 네트워크 연결 (이더넷 또는 Wi-Fi)

## 설정

1. **OS 설치**

   [Raspberry Pi Imager](https://www.raspberrypi.com/software/)를 사용하여 microSD 카드에 **Raspberry Pi OS Lite (64비트)** 또는 **Ubuntu Server 24.04 LTS (64비트)**를 플래시합니다.
   
       Raspberry Pi Imager에서 고급 설정을 사용하여:
       - 호스트 이름 설정 (예: `openclaw`)
       - SSH 활성화
       - Wi-Fi 자격 증명 구성 (해당하는 경우)
       - 사용자 이름/비밀번호 설정


  2. **연결 및 시스템 업데이트**

   ```bash
       ssh pi@openclaw.local
       # 또는 IP 주소 사용: ssh pi@&lt;ip-address&gt;
   
       sudo apt update && sudo apt upgrade -y
       sudo apt install -y curl git build-essential
       ```


  3. **스왑 추가 (2GB RAM Pi에 권장)**

   RAM이 2GB인 Pi에서는 스왑을 늘리면 메모리 부족 오류를 방지하는 데 도움이 됩니다:
   
       ```bash
       sudo dphys-swapfile swapoff
       sudo nano /etc/dphys-swapfile
       # CONF_SWAPSIZE=100 을 CONF_SWAPSIZE=1024 로 변경
       sudo dphys-swapfile setup
       sudo dphys-swapfile swapon
       ```


  4. **Node.js 24 설치**

   ```bash
       curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
       sudo apt-get install -y nodejs
       node -v  # v24.x.x가 출력되어야 함
       ```


  5. **OpenClaw 설치**

   ```bash
       curl -fsSL https://openclaw.ai/install.sh | bash
       source ~/.bashrc
       ```
   
       "봇을 어떻게 부화시키시겠습니까?"라는 프롬프트가 나타나면 **나중에 하기**를 선택합니다.


  6. **게이트웨이 구성**

   원격 액세스를 위해 Tailscale Serve와 함께 토큰 인증을 사용합니다:
   
       ```bash
       openclaw config set gateway.bind loopback
       openclaw config set gateway.auth.mode token
       openclaw doctor --generate-gateway-token
       ```
   
       Tailscale을 통한 원격 액세스의 경우:
   
       ```bash
       curl -fsSL https://tailscale.com/install.sh | sh
       sudo tailscale up --ssh --hostname=openclaw
       openclaw config set gateway.tailscale.mode serve
       openclaw config set gateway.trustedProxies '["127.0.0.1"]'
       systemctl --user restart openclaw-gateway.service
       ```


  7. **부팅 지속성 활성화**

   Pi가 재시작될 때 게이트웨이가 자동으로 시작되도록 합니다:
   
       ```bash
       sudo loginctl enable-linger "$USER"
       systemctl --user enable openclaw-gateway.service
       ```


  8. **확인**

   ```bash
       openclaw --version
       systemctl --user status openclaw-gateway.service
       curl http://localhost:18789
       ```
   
       Tailscale을 통해 원격으로 액세스합니다:
   
       ```
       https://openclaw.&lt;tailnet-name&gt;.ts.net/
       ```


## 성능 팁

**microSD 카드 수명 연장:**

로그 및 임시 파일을 tmpfs에 마운트하여 SD 카드 쓰기를 줄입니다:

```bash
echo "tmpfs /tmp tmpfs defaults,noatime,nosuid,size=100m 0 0" | sudo tee -a /etc/fstab
echo "tmpfs /var/log tmpfs defaults,noatime,nosuid,mode=0755,size=100m 0 0" | sudo tee -a /etc/fstab
```

**USB SSD로 루트 이동 (선택 사항):**

더 나은 성능과 안정성을 위해 USB SSD로 부팅하는 것을 고려합니다. Raspberry Pi Imager를 사용하여 microSD 대신 USB 드라이브에 OS를 설치합니다.

**GPU 메모리 최소화:**

헤드리스 서버에서는 GPU 메모리를 줄여 RAM을 절약합니다:

```bash
echo "gpu_mem=16" | sudo tee -a /boot/firmware/config.txt
sudo reboot
```

## 문제 해결

**메모리 부족 오류** -- `free -h`로 사용 가능한 메모리를 확인합니다. 설정 단계에서 스왑 공간을 늘리지 않았다면 스왑 공간을 늘립니다.

**Node.js가 너무 느림** -- `node -v`를 실행하여 64비트 Node.js를 사용 중인지 확인합니다 (`v24.x.x` 이상이어야 함). 32비트 Pi OS를 사용하는 경우 64비트 버전으로 전환합니다.

**게이트웨이가 시작되지 않음** -- `journalctl --user -u openclaw-gateway.service -n 50`으로 로그를 확인합니다. `openclaw doctor --non-interactive`를 실행하여 구성 문제를 진단합니다.

**재시작 후 게이트웨이가 자동 시작되지 않음** -- `systemctl --user is-enabled openclaw-gateway.service`를 확인합니다. `enabled`가 아닌 경우 `systemctl --user enable openclaw-gateway.service`를 실행합니다. `sudo loginctl enable-linger "$USER"`도 실행했는지 확인합니다.

**SD 카드 속도가 느림** -- 클래스 10 또는 UHS-I 등급의 빠른 microSD 카드를 사용합니다. 또는 USB SSD로 부팅하는 것을 고려합니다.

## 다음 단계

- [채널](/channels) -- Telegram, WhatsApp, Discord 등 연결
- [Tailscale](/gateway/tailscale) -- 안전한 원격 액세스 설정
- [업데이트](/install/updating) -- OpenClaw를 최신 상태로 유지
