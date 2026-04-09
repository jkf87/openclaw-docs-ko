---
summary: "Oracle Cloud의 Always Free ARM 티어에서 OpenClaw 호스팅"
read_when:
  - Oracle Cloud에서 OpenClaw 설정 중인 경우
  - OpenClaw를 위한 무료 VPS 호스팅을 찾는 경우
  - 소형 서버에서 24/7 OpenClaw를 원하는 경우
title: "Oracle Cloud"
---

# Oracle Cloud

Oracle Cloud의 **Always Free** ARM 티어(최대 4 OCPU, 24 GB RAM, 200 GB 스토리지)에서 비용 없이 영구적인 OpenClaw Gateway를 실행합니다.

## 사전 요구 사항

- Oracle Cloud 계정 ([가입](https://www.oracle.com/cloud/free/)) -- 문제가 발생하면 [커뮤니티 가입 가이드](https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd) 참조
- Tailscale 계정 ([tailscale.com](https://tailscale.com)에서 무료)
- SSH 키 쌍
- 약 30분

## 설정

<Steps>
  <Step title="OCI 인스턴스 생성">
    1. [Oracle Cloud Console](https://cloud.oracle.com/)에 로그인합니다.
    2. **Compute > Instances > Create Instance**로 이동합니다.
    3. 구성:
       - **이름:** `openclaw`
       - **이미지:** Ubuntu 24.04 (aarch64)
       - **Shape:** `VM.Standard.A1.Flex` (Ampere ARM)
       - **OCPU:** 2 (최대 4까지)
       - **메모리:** 12 GB (최대 24 GB까지)
       - **부트 볼륨:** 50 GB (최대 200 GB 무료)
       - **SSH 키:** 공개 키 추가
    4. **Create**를 클릭하고 공용 IP 주소를 기록합니다.

    <Tip>
    인스턴스 생성이 "Out of capacity"로 실패하면 다른 가용 도메인을 시도하거나 나중에 재시도합니다. 무료 티어 용량은 제한되어 있습니다.
    </Tip>

  </Step>

  <Step title="연결 및 시스템 업데이트">
    ```bash
    ssh ubuntu@YOUR_PUBLIC_IP

    sudo apt update && sudo apt upgrade -y
    sudo apt install -y build-essential
    ```

    `build-essential`은 일부 종속성의 ARM 컴파일에 필요합니다.

  </Step>

  <Step title="사용자 및 호스트 이름 구성">
    ```bash
    sudo hostnamectl set-hostname openclaw
    sudo passwd ubuntu
    sudo loginctl enable-linger ubuntu
    ```

    링거를 활성화하면 로그아웃 후에도 사용자 서비스가 계속 실행됩니다.

  </Step>

  <Step title="Tailscale 설치">
    ```bash
    curl -fsSL https://tailscale.com/install.sh | sh
    sudo tailscale up --ssh --hostname=openclaw
    ```

    이제부터 Tailscale을 통해 연결합니다: `ssh ubuntu@openclaw`.

  </Step>

  <Step title="OpenClaw 설치">
    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash
    source ~/.bashrc
    ```

    "봇을 어떻게 부화시키시겠습니까?"라는 프롬프트가 나타나면 **나중에 하기**를 선택합니다.

  </Step>

  <Step title="게이트웨이 구성">
    Tailscale Serve를 통한 안전한 원격 액세스를 위해 토큰 인증을 사용합니다.

    ```bash
    openclaw config set gateway.bind loopback
    openclaw config set gateway.auth.mode token
    openclaw doctor --generate-gateway-token
    openclaw config set gateway.tailscale.mode serve
    openclaw config set gateway.trustedProxies '["127.0.0.1"]'

    systemctl --user restart openclaw-gateway.service
    ```

    여기서 `gateway.trustedProxies=["127.0.0.1"]`는 로컬 Tailscale Serve 프록시의 전달된 IP/로컬 클라이언트 처리를 위한 것입니다. 이것은 `gateway.auth.mode: "trusted-proxy"`가 **아닙니다**. 이 설정에서 diff 뷰어 경로는 실패 닫힘 동작을 유지합니다. 전달된 프록시 헤더 없이 원시 `127.0.0.1` 뷰어 요청은 `Diff not found`를 반환할 수 있습니다. 첨부 파일에는 `mode=file` / `mode=both`를 사용하거나, 공유 가능한 뷰어 링크가 필요한 경우 원격 뷰어를 의도적으로 활성화하고 `plugins.entries.diffs.config.viewerBaseUrl`을 설정합니다(또는 프록시 `baseUrl` 전달).

  </Step>

  <Step title="VCN 보안 잠금">
    네트워크 엣지에서 Tailscale을 제외한 모든 트래픽을 차단합니다:

    1. OCI 콘솔에서 **Networking > Virtual Cloud Networks**로 이동합니다.
    2. VCN을 클릭한 다음 **Security Lists > Default Security List**를 클릭합니다.
    3. `0.0.0.0/0 UDP 41641` (Tailscale)을 제외한 모든 인그레스 규칙을 **제거**합니다.
    4. 기본 이그레스 규칙을 유지합니다(모든 아웃바운드 허용).

    이를 통해 포트 22의 SSH, HTTP, HTTPS 및 네트워크 엣지의 다른 모든 것이 차단됩니다. 이 시점부터 Tailscale을 통해서만 연결할 수 있습니다.

  </Step>

  <Step title="확인">
    ```bash
    openclaw --version
    systemctl --user status openclaw-gateway.service
    tailscale serve status
    curl http://localhost:18789
    ```

    tailnet의 모든 장치에서 Control UI에 액세스합니다:

    ```
    https://openclaw.<tailnet-name>.ts.net/
    ```

    `<tailnet-name>`을 tailnet 이름으로 교체합니다(`tailscale status`에서 확인 가능).

  </Step>
</Steps>

## 대안: SSH 터널

Tailscale Serve가 작동하지 않는 경우 로컬 머신에서 SSH 터널을 사용합니다:

```bash
ssh -L 18789:127.0.0.1:18789 ubuntu@openclaw
```

그런 다음 `http://localhost:18789`를 엽니다.

## 문제 해결

**인스턴스 생성 실패 ("Out of capacity")** -- 무료 티어 ARM 인스턴스가 인기가 많습니다. 다른 가용 도메인을 시도하거나 비성수기에 재시도합니다.

**Tailscale이 연결되지 않습니다** -- `sudo tailscale up --ssh --hostname=openclaw --reset`을 실행하여 재인증합니다.

**게이트웨이가 시작되지 않습니다** -- `openclaw doctor --non-interactive`를 실행하고 `journalctl --user -u openclaw-gateway.service -n 50`으로 로그를 확인합니다.

**ARM 바이너리 문제** -- 대부분의 npm 패키지는 ARM64에서 작동합니다. 네이티브 바이너리의 경우 `linux-arm64` 또는 `aarch64` 릴리즈를 찾습니다. `uname -m`으로 아키텍처를 확인합니다.

## 다음 단계

- [채널](/channels/) -- Telegram, WhatsApp, Discord 등 연결
- [Gateway 구성](/gateway/configuration) -- 모든 구성 옵션
- [업데이트](/install/updating) -- OpenClaw를 최신 상태로 유지
