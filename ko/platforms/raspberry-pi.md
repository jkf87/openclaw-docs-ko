---
summary: "Raspberry Pi에서 OpenClaw (저예산 자체 호스팅 설정)"
read_when:
  - Raspberry Pi에서 OpenClaw 설정 시
  - ARM 기기에서 OpenClaw 실행 시
  - 저렴하고 항상 켜져 있는 개인 AI 구축 시
title: "Raspberry Pi (플랫폼)"
---

# Raspberry Pi에서 OpenClaw

## 목표

Raspberry Pi에서 **~$35-80**의 일회성 비용 (월 요금 없음)으로 지속적이고 항상 켜져 있는 OpenClaw 게이트웨이를 실행합니다.

다음에 적합합니다:

- 24/7 개인 AI 어시스턴트
- 홈 자동화 허브
- 저전력, 항상 사용 가능한 Telegram/WhatsApp 봇

## 하드웨어 요구 사항

| Pi 모델         | RAM     | 작동 여부 | 비고                               |
| --------------- | ------- | --------- | ---------------------------------- |
| **Pi 5**        | 4GB/8GB | ✅ 최고   | 가장 빠름, 권장                    |
| **Pi 4**        | 4GB     | ✅ 좋음   | 대부분 사용자에게 적합             |
| **Pi 4**        | 2GB     | ✅ 가능   | 작동, 스왑 추가                    |
| **Pi 4**        | 1GB     | ⚠️ 빠듯함 | 스왑 및 최소 구성으로 가능         |
| **Pi 3B+**      | 1GB     | ⚠️ 느림   | 작동하지만 느림                    |
| **Pi Zero 2 W** | 512MB   | ❌        | 권장하지 않음                      |

**최소 사양:** 1GB RAM, 1 코어, 500MB 디스크  
**권장:** 2GB+ RAM, 64비트 OS, 16GB+ SD 카드 (또는 USB SSD)

## 필요한 것

- Raspberry Pi 4 또는 5 (2GB+ 권장)
- MicroSD 카드 (16GB+) 또는 USB SSD (성능 향상)
- 전원 공급 장치 (공식 Pi PSU 권장)
- 네트워크 연결 (이더넷 또는 WiFi)
- ~30분

## 1) OS 플래시

헤드리스 서버에는 데스크탑이 필요하지 않으므로 **Raspberry Pi OS Lite (64비트)**를 사용하십시오.

1. [Raspberry Pi Imager](https://www.raspberrypi.com/software/) 다운로드
2. OS 선택: **Raspberry Pi OS Lite (64비트)**
3. 기어 아이콘 (⚙️)을 클릭하여 사전 구성:
   - 호스트 이름 설정: `gateway-host`
   - SSH 활성화
   - 사용자 이름/비밀번호 설정
   - WiFi 구성 (이더넷 사용하지 않는 경우)
4. SD 카드 / USB 드라이브에 플래시
5. Pi를 삽입하고 부팅

## 2) SSH로 연결

```bash
ssh user@gateway-host
# 또는 IP 주소 사용
ssh user@192.168.x.x
```

## 3) 시스템 설정

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y git curl build-essential

# 시간대 설정 (크론/리마인더에 중요)
sudo timedatectl set-timezone America/Chicago  # 시간대 변경
```

## 4) Node.js 24 설치 (ARM64)

```bash
# NodeSource를 통해 Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# 확인
node --version  # v24.x.x가 표시되어야 함
npm --version
```

## 5) 스왑 추가 (2GB 이하에서 중요)

스왑은 메모리 부족 충돌을 방지합니다:

```bash
# 2GB 스왑 파일 만들기
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 낮은 RAM에 최적화 (swappiness 감소)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 6) OpenClaw 설치

### 옵션 A: 표준 설치 (권장)

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

### 옵션 B: 해킹 가능한 설치 (실험용)

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
npm install
npm run build
npm link
```

해킹 가능한 설치는 로그 및 코드에 직접 접근을 제공합니다. ARM 특정 문제 디버깅에 유용합니다.

## 7) 온보딩 실행

```bash
openclaw onboard --install-daemon
```

마법사를 따르십시오:

1. **게이트웨이 모드:** 로컬
2. **인증:** API 키 권장 (OAuth는 헤드리스 Pi에서 까다로울 수 있음)
3. **채널:** Telegram이 시작하기 가장 쉬움
4. **데몬:** 예 (systemd)

## 8) 설치 확인

```bash
# 상태 확인
openclaw status

# 서비스 확인 (표준 설치 = systemd 사용자 유닛)
systemctl --user status openclaw-gateway.service

# 로그 보기
journalctl --user -u openclaw-gateway.service -f
```

## 9) OpenClaw 대시보드 접근

`user@gateway-host`를 Pi 사용자 이름과 호스트 이름 또는 IP 주소로 교체합니다.

컴퓨터에서 Pi에게 새 대시보드 URL을 출력하도록 요청합니다:

```bash
ssh user@gateway-host 'openclaw dashboard --no-open'
```

명령은 `Dashboard URL:`을 출력합니다. `gateway.auth.token`이 구성된 방식에 따라 URL은 일반 `http://127.0.0.1:18789/` 링크이거나 `#token=...`이 포함된 링크일 수 있습니다.

컴퓨터의 다른 터미널에서 SSH 터널을 만듭니다:

```bash
ssh -N -L 18789:127.0.0.1:18789 user@gateway-host
```

그런 다음 로컬 브라우저에서 출력된 대시보드 URL을 엽니다.

UI가 공유 비밀 인증을 요청하면 구성된 토큰 또는 비밀번호를 Control UI 설정에 붙여넣습니다. 토큰 인증의 경우 `gateway.auth.token` (또는 `OPENCLAW_GATEWAY_TOKEN`)을 사용합니다.

항상 켜져 있는 원격 접근은 [Tailscale](/gateway/tailscale)을 참조하십시오.

---

## 성능 최적화

### USB SSD 사용 (큰 개선)

SD 카드는 느리고 마모됩니다. USB SSD는 성능을 크게 향상시킵니다:

```bash
# USB에서 부팅 중인지 확인
lsblk
```

설정은 [Pi USB 부팅 가이드](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#usb-mass-storage-boot)를 참조하십시오.

### CLI 시작 속도 향상 (모듈 컴파일 캐시)

저전력 Pi 호스트에서 Node의 모듈 컴파일 캐시를 활성화하면 반복 CLI 실행이 빨라집니다:

```bash
grep -q 'NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache' ~/.bashrc || cat >> ~/.bashrc <<'EOF' # pragma: allowlist secret
export NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache
mkdir -p /var/tmp/openclaw-compile-cache
export OPENCLAW_NO_RESPAWN=1
EOF
source ~/.bashrc
```

참고:

- `NODE_COMPILE_CACHE`는 이후 실행 속도를 향상시킵니다 (`status`, `health`, `--help`).
- `/var/tmp`는 `/tmp`보다 재부팅 후에도 더 잘 유지됩니다.
- `OPENCLAW_NO_RESPAWN=1`은 CLI 자체 재생성으로 인한 추가 시작 비용을 방지합니다.
- 첫 번째 실행으로 캐시가 워밍되고 이후 실행이 가장 많은 이점을 얻습니다.

### systemd 시작 조정 (선택 사항)

이 Pi가 주로 OpenClaw를 실행하는 경우 재시작 지터를 줄이고 시작 환경을 안정적으로 유지하기 위해 서비스 드롭인을 추가합니다:

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

그런 다음 적용:

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
```

가능하면 OpenClaw 상태/캐시를 SSD 지원 스토리지에 유지하여 콜드 스타트 중 SD 카드 랜덤 I/O 병목 현상을 피하십시오.

헤드리스 Pi인 경우 로그아웃 후에도 사용자 서비스가 유지되도록 한 번 링거링을 활성화하십시오:

```bash
sudo loginctl enable-linger "$(whoami)"
```

`Restart=` 정책이 자동 복구를 지원하는 방법:
[systemd는 서비스 복구를 자동화할 수 있습니다](https://www.redhat.com/en/blog/systemd-automate-recovery).

### 메모리 사용량 줄이기

```bash
# GPU 메모리 할당 비활성화 (헤드리스)
echo 'gpu_mem=16' | sudo tee -a /boot/config.txt

# 필요하지 않은 경우 Bluetooth 비활성화
sudo systemctl disable bluetooth
```

### 리소스 모니터링

```bash
# 메모리 확인
free -h

# CPU 온도 확인
vcgencmd measure_temp

# 실시간 모니터링
htop
```

---

## ARM 특정 참고 사항

### 바이너리 호환성

대부분의 OpenClaw 기능은 ARM64에서 작동하지만 일부 외부 바이너리는 ARM 빌드가 필요할 수 있습니다:

| 도구               | ARM64 상태   | 비고                                |
| ------------------ | ------------ | ----------------------------------- |
| Node.js            | ✅           | 잘 작동                             |
| WhatsApp (Baileys) | ✅           | 순수 JS, 문제 없음                  |
| Telegram           | ✅           | 순수 JS, 문제 없음                  |
| gog (Gmail CLI)    | ⚠️           | ARM 릴리스 확인                     |
| Chromium (browser) | ✅           | `sudo apt install chromium-browser` |

플러그인이 실패하면 바이너리에 ARM 빌드가 있는지 확인하십시오. 많은 Go/Rust 도구는 있지만 일부는 없습니다.

### 32비트 vs 64비트

**항상 64비트 OS를 사용하십시오.** Node.js 및 많은 최신 도구가 필요합니다. 확인:

```bash
uname -m
# aarch64 (64비트)가 표시되어야 함, armv7l (32비트)이 아님
```

---

## 권장 모델 설정

Pi는 게이트웨이 역할만 하므로 (모델은 클라우드에서 실행됨) API 기반 모델을 사용하십시오:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-6",
        "fallbacks": ["openai/gpt-5.4-mini"]
      }
    }
  }
}
```

**Pi에서 로컬 LLM 실행을 시도하지 마십시오** — 작은 모델조차도 너무 느립니다. Claude/GPT가 무거운 작업을 처리하도록 하십시오.

---

## 부팅 시 자동 시작

온보딩이 이것을 설정하지만 확인하려면:

```bash
# 서비스가 활성화되어 있는지 확인
systemctl --user is-enabled openclaw-gateway.service

# 활성화되지 않은 경우 활성화
systemctl --user enable openclaw-gateway.service

# 부팅 시 시작
systemctl --user start openclaw-gateway.service
```

---

## 문제 해결

### 메모리 부족 (OOM)

```bash
# 메모리 확인
free -h

# 스왑 추가 (5단계 참조)
# 또는 Pi에서 실행 중인 서비스 줄이기
```

### 느린 성능

- SD 카드 대신 USB SSD 사용
- 사용하지 않는 서비스 비활성화: `sudo systemctl disable cups bluetooth avahi-daemon`
- CPU 스로틀링 확인: `vcgencmd get_throttled` (0x0이 반환되어야 함)

### 서비스 시작 안 됨

```bash
# 로그 확인
journalctl --user -u openclaw-gateway.service --no-pager -n 100

# 일반적인 수정: 재빌드
cd ~/openclaw  # 해킹 가능한 설치 사용 시
npm run build
systemctl --user restart openclaw-gateway.service
```

### ARM 바이너리 문제

플러그인이 "exec format error"로 실패하는 경우:

1. 바이너리에 ARM64 빌드가 있는지 확인
2. 소스에서 빌드 시도
3. 또는 ARM 지원이 있는 Docker 컨테이너 사용

### WiFi 끊김

WiFi의 헤드리스 Pi:

```bash
# WiFi 전원 관리 비활성화
sudo iwconfig wlan0 power off

# 영구 설정
echo 'wireless-power off' | sudo tee -a /etc/network/interfaces
```

---

## 비용 비교

| 설정           | 일회성 비용 | 월 비용    | 비고                      |
| -------------- | ----------- | ---------- | ------------------------- |
| **Pi 4 (2GB)** | ~$45        | $0         | + 전기 (~$5/년)           |
| **Pi 4 (4GB)** | ~$55        | $0         | 권장                      |
| **Pi 5 (4GB)** | ~$60        | $0         | 최고 성능                 |
| **Pi 5 (8GB)** | ~$80        | $0         | 과도하지만 미래 대비      |
| DigitalOcean   | $0          | $6/월      | $72/년                    |
| Hetzner        | $0          | €3.79/월   | ~$50/년                   |

**손익분기점:** Pi는 클라우드 VPS 대비 약 6-12개월 만에 본전을 찾습니다.

---

## 참고 자료

- [Linux 가이드](/platforms/linux) — 일반 Linux 설정
- [DigitalOcean 가이드](/platforms/digitalocean) — 클라우드 대안
- [Hetzner 가이드](/install/hetzner) — Docker 설정
- [Tailscale](/gateway/tailscale) — 원격 접근
- [노드](/nodes) — 노트북/전화를 Pi 게이트웨이와 페어링
