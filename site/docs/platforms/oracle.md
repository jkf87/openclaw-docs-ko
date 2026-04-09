---
title: "Oracle Cloud (플랫폼)"
description: "Oracle Cloud에서 OpenClaw (Always Free ARM)"
---

# Oracle Cloud (OCI)에서 OpenClaw

## 목표

Oracle Cloud의 **Always Free** ARM 티어에서 지속적인 OpenClaw 게이트웨이를 실행합니다.

Oracle의 무료 티어는 OpenClaw에 좋은 선택이 될 수 있지만 (특히 이미 OCI 계정이 있는 경우), 트레이드오프가 있습니다:

- ARM 아키텍처 (대부분 작동하지만 일부 바이너리는 x86 전용일 수 있음)
- 용량 및 가입이 까다로울 수 있음

## 비용 비교 (2026)

| 공급자       | 플랜            | 사양                   | 가격/월  | 비고                  |
| ------------ | --------------- | ---------------------- | -------- | --------------------- |
| Oracle Cloud | Always Free ARM | 최대 4 OCPU, 24GB RAM  | $0       | ARM, 제한된 용량      |
| Hetzner      | CX22            | 2 vCPU, 4GB RAM        | ~ $4     | 가장 저렴한 유료 옵션 |
| DigitalOcean | Basic           | 1 vCPU, 1GB RAM        | $6       | 쉬운 UI, 좋은 문서    |
| Vultr        | Cloud Compute   | 1 vCPU, 1GB RAM        | $6       | 많은 위치             |
| Linode       | Nanode          | 1 vCPU, 1GB RAM        | $5       | 현재 Akamai의 일부    |

---

## 사전 요구 사항

- Oracle Cloud 계정 ([가입](https://www.oracle.com/cloud/free/)) — 문제가 발생하면 [커뮤니티 가입 가이드](https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd) 참조
- Tailscale 계정 ([tailscale.com](https://tailscale.com)에서 무료)
- ~30분

## 1) OCI 인스턴스 생성

1. [Oracle Cloud Console](https://cloud.oracle.com/)에 로그인합니다
2. **Compute → Instances → Create Instance**로 이동합니다
3. 구성:
   - **이름:** `openclaw`
   - **이미지:** Ubuntu 24.04 (aarch64)
   - **셰이프:** `VM.Standard.A1.Flex` (Ampere ARM)
   - **OCPU:** 2 (또는 최대 4)
   - **메모리:** 12 GB (또는 최대 24 GB)
   - **부팅 볼륨:** 50 GB (최대 200 GB 무료)
   - **SSH 키:** 공개 키 추가
4. **Create** 클릭
5. 공개 IP 주소를 기록합니다

**팁:** "Out of capacity"로 인스턴스 생성이 실패하면 다른 가용성 도메인을 시도하거나 나중에 다시 시도하십시오. 무료 티어 용량은 제한되어 있습니다.

## 2) 연결 및 업데이트

```bash
# 공개 IP를 통해 연결
ssh ubuntu@YOUR_PUBLIC_IP

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential
```

**참고:** `build-essential`은 일부 종속성의 ARM 컴파일에 필요합니다.

## 3) 사용자 및 호스트 이름 구성

```bash
# 호스트 이름 설정
sudo hostnamectl set-hostname openclaw

# ubuntu 사용자의 비밀번호 설정
sudo passwd ubuntu

# 링거링 활성화 (로그아웃 후에도 사용자 서비스 실행 유지)
sudo loginctl enable-linger ubuntu
```

## 4) Tailscale 설치

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh --hostname=openclaw
```

이를 통해 Tailscale SSH가 활성화되므로 tailnet의 어느 기기에서든 `ssh openclaw`로 연결할 수 있습니다. 공개 IP가 필요하지 않습니다.

확인:

```bash
tailscale status
```

**이제부터 Tailscale을 통해 연결하십시오:** `ssh ubuntu@openclaw` (또는 Tailscale IP 사용).

## 5) OpenClaw 설치

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
source ~/.bashrc
```

"봇을 어떻게 시작하시겠습니까?"라는 프롬프트가 표시되면 **"나중에 하기"**를 선택합니다.

> 참고: ARM 네이티브 빌드 문제가 발생하면 Homebrew에 의존하기 전에 시스템 패키지 (예: `sudo apt install -y build-essential`)로 시작하십시오.

## 6) 게이트웨이 구성 (루프백 + 토큰 인증) 및 Tailscale Serve 활성화

기본값으로 토큰 인증을 사용하십시오. 예측 가능하고 "안전하지 않은 인증" Control UI 플래그가 필요하지 않습니다.

```bash
# VM에서 게이트웨이를 비공개로 유지
openclaw config set gateway.bind loopback

# 게이트웨이 + Control UI에 인증 요구
openclaw config set gateway.auth.mode token
openclaw doctor --generate-gateway-token

# Tailscale Serve를 통해 노출 (HTTPS + tailnet 접근)
openclaw config set gateway.tailscale.mode serve
openclaw config set gateway.trustedProxies '["127.0.0.1"]'

systemctl --user restart openclaw-gateway.service
```

`gateway.trustedProxies=["127.0.0.1"]`은 여기서 로컬 Tailscale Serve 프록시의 전달된 IP/로컬 클라이언트 처리에만 사용됩니다. 이것은 `gateway.auth.mode: "trusted-proxy"`가 **아닙니다**. 이 설정에서 diff 뷰어 경로는 실패 시 안전한 동작을 유지합니다. 공유 가능한 뷰어 링크가 필요한 경우 `mode=file` / `mode=both`를 사용하거나 원격 뷰어를 의도적으로 활성화하고 `plugins.entries.diffs.config.viewerBaseUrl`을 설정하십시오 (또는 프록시 `baseUrl` 전달).

## 7) 확인

```bash
# 버전 확인
openclaw --version

# 데몬 상태 확인
systemctl --user status openclaw-gateway.service

# Tailscale Serve 확인
tailscale serve status

# 로컬 응답 테스트
curl http://localhost:18789
```

## 8) VCN 보안 잠금

모든 것이 작동하면 Tailscale을 제외한 모든 트래픽을 차단하도록 VCN을 잠급니다. OCI의 Virtual Cloud Network는 네트워크 엣지에서 방화벽 역할을 합니다. 트래픽이 인스턴스에 도달하기 전에 차단됩니다.

1. OCI 콘솔에서 **Networking → Virtual Cloud Networks**로 이동합니다
2. VCN 클릭 → **Security Lists** → Default Security List
3. 다음을 제외한 모든 수신 규칙 **제거**:
   - `0.0.0.0/0 UDP 41641` (Tailscale)
4. 기본 송신 규칙 유지 (모든 아웃바운드 허용)

이렇게 하면 네트워크 엣지에서 포트 22의 SSH, HTTP, HTTPS 및 기타 모든 것이 차단됩니다. 이제 Tailscale을 통해서만 연결할 수 있습니다.

---

## Control UI 접근

Tailscale 네트워크의 어느 기기에서나:

```
https://openclaw.&lt;tailnet-name&gt;.ts.net/
```

`&lt;tailnet-name&gt;`을 tailnet 이름으로 교체합니다 (`tailscale status`에서 확인 가능).

SSH 터널이 필요하지 않습니다. Tailscale이 제공합니다:

- HTTPS 암호화 (자동 인증서)
- Tailscale ID를 통한 인증
- tailnet의 모든 기기에서 접근 (노트북, 전화 등)

---

## 보안: VCN + Tailscale (권장 기준)

VCN이 잠겨 있고 (UDP 41641만 열려 있음) 게이트웨이가 루프백에 바인딩되면 강력한 심층 방어를 얻습니다. 공개 트래픽은 네트워크 엣지에서 차단되고 관리자 접근은 tailnet을 통해 이루어집니다.

이 설정은 인터넷 전반에 걸친 SSH 무차별 대입 공격을 막기 위한 추가 호스트 기반 방화벽 규칙의 _필요성_을 제거하는 경우가 많습니다. 하지만 여전히 OS를 업데이트하고 `openclaw security audit`을 실행하며 공개 인터페이스에서 실수로 수신 대기하지 않는지 확인해야 합니다.

### 이미 보호됨

| 전통적인 단계       | 필요 여부?  | 이유                                                                          |
| ------------------- | ----------- | ----------------------------------------------------------------------------- |
| UFW 방화벽          | 아니오      | VCN이 인스턴스에 도달하기 전에 차단                                            |
| fail2ban            | 아니오      | VCN에서 포트 22가 차단되면 무차별 대입 없음                                    |
| sshd 강화           | 아니오      | Tailscale SSH는 sshd를 사용하지 않음                                           |
| 루트 로그인 비활성화 | 아니오      | Tailscale은 시스템 사용자가 아닌 Tailscale ID를 사용                           |
| SSH 키 전용 인증    | 아니오      | Tailscale이 tailnet을 통해 인증                                               |
| IPv6 강화           | 보통 아니오 | VCN/서브넷 설정에 따라 다름; 실제로 할당/노출된 것을 확인하십시오              |

### 여전히 권장됨

- **자격 증명 권한:** `chmod 700 ~/.openclaw`
- **보안 감사:** `openclaw security audit`
- **시스템 업데이트:** 정기적으로 `sudo apt update && sudo apt upgrade`
- **Tailscale 모니터링:** [Tailscale 관리 콘솔](https://login.tailscale.com/admin)에서 기기 검토

### 보안 자세 확인

```bash
# 공개 포트가 수신 대기하지 않음 확인
sudo ss -tlnp | grep -v '127.0.0.1\|::1'

# Tailscale SSH가 활성 상태인지 확인
tailscale status | grep -q 'offers: ssh' && echo "Tailscale SSH active"

# 선택 사항: sshd 완전 비활성화
sudo systemctl disable --now ssh
```

---

## 대체: SSH 터널

Tailscale Serve가 작동하지 않는 경우 SSH 터널을 사용하십시오:

```bash
# 로컬 머신에서 (Tailscale을 통해)
ssh -L 18789:127.0.0.1:18789 ubuntu@openclaw
```

그런 다음 `http://localhost:18789`를 엽니다.

---

## 문제 해결

### 인스턴스 생성 실패 ("Out of capacity")

무료 티어 ARM 인스턴스는 인기가 많습니다. 시도해 보십시오:

- 다른 가용성 도메인
- 사용량이 적은 시간대 재시도 (이른 아침)
- 셰이프 선택 시 "Always Free" 필터 사용

### Tailscale 연결 안 됨

```bash
# 상태 확인
sudo tailscale status

# 재인증
sudo tailscale up --ssh --hostname=openclaw --reset
```

### 게이트웨이 시작 안 됨

```bash
openclaw gateway status
openclaw doctor --non-interactive
journalctl --user -u openclaw-gateway.service -n 50
```

### Control UI에 접근할 수 없음

```bash
# Tailscale Serve가 실행 중인지 확인
tailscale serve status

# 게이트웨이가 수신 대기 중인지 확인
curl http://localhost:18789

# 필요한 경우 재시작
systemctl --user restart openclaw-gateway.service
```

### ARM 바이너리 문제

일부 도구는 ARM 빌드가 없을 수 있습니다. 확인:

```bash
uname -m  # aarch64가 표시되어야 함
```

대부분의 npm 패키지는 정상적으로 작동합니다. 바이너리의 경우 `linux-arm64` 또는 `aarch64` 릴리스를 찾으십시오.

---

## 영속성

모든 상태는 다음에 저장됩니다:

- `~/.openclaw/` — `openclaw.json`, 에이전트별 `auth-profiles.json`, 채널/공급자 상태, 세션 데이터
- `~/.openclaw/workspace/` — 작업 공간 (SOUL.md, 메모리, 아티팩트)

주기적으로 백업하십시오:

```bash
openclaw backup create
```

---

## 참고 자료

- [게이트웨이 원격 접근](/gateway/remote) — 기타 원격 접근 패턴
- [Tailscale 통합](/gateway/tailscale) — 전체 Tailscale 문서
- [게이트웨이 구성](/gateway/configuration) — 모든 구성 옵션
- [DigitalOcean 가이드](/platforms/digitalocean) — 유료 + 쉬운 가입 원하는 경우
- [Hetzner 가이드](/install/hetzner) — Docker 기반 대안
