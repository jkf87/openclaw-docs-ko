---
title: "Ansible"
description: "Ansible, Tailscale VPN, 방화벽 격리를 통한 자동화된 강화된 OpenClaw 설치"
---

# Ansible 설치

**[openclaw-ansible](https://github.com/openclaw/openclaw-ansible)**을 사용하여 프로덕션 서버에 OpenClaw를 배포합니다. 이는 보안 우선 아키텍처를 갖춘 자동화된 설치 프로그램입니다.

::: info
[openclaw-ansible](https://github.com/openclaw/openclaw-ansible) 저장소는 Ansible 배포의 단일 진실 공급원입니다. 이 페이지는 간략한 개요입니다.
:::


## 사전 요구 사항

| 요구 사항 | 세부 사항                                                   |
| ----------- | --------------------------------------------------------- |
| **OS**      | Debian 11+ 또는 Ubuntu 20.04+                               |
| **액세스**  | 루트 또는 sudo 권한                                         |
| **네트워크** | 패키지 설치를 위한 인터넷 연결                              |
| **Ansible** | 2.14+ (빠른 시작 스크립트에 의해 자동으로 설치됨)           |

## 제공 내용

- **방화벽 우선 보안** -- UFW + Docker 격리 (SSH + Tailscale만 접근 가능)
- **Tailscale VPN** -- 서비스를 공개적으로 노출하지 않고 안전한 원격 액세스
- **Docker** -- 격리된 샌드박스 컨테이너, 로컬호스트 전용 바인딩
- **심층 방어** -- 4계층 보안 아키텍처
- **Systemd 통합** -- 강화 기능이 포함된 부팅 시 자동 시작
- **원클릭 설정** -- 몇 분 안에 완전한 배포 완료

## 빠른 시작

원클릭 설치:

```bash
curl -fsSL https://raw.githubusercontent.com/openclaw/openclaw-ansible/main/install.sh | bash
```

## 설치 내용

Ansible 플레이북은 다음을 설치 및 구성합니다:

1. **Tailscale** -- 안전한 원격 액세스를 위한 메시 VPN
2. **UFW 방화벽** -- SSH + Tailscale 포트만 허용
3. **Docker CE + Compose V2** -- 에이전트 샌드박스용
4. **Node.js 24 + pnpm** -- 런타임 종속성 (Node 22 LTS, 현재 `22.14+`도 지원됨)
5. **OpenClaw** -- 호스트 기반, 컨테이너화 없음
6. **Systemd 서비스** -- 보안 강화가 포함된 자동 시작

::: info NOTE
게이트웨이는 (Docker가 아닌) 호스트에서 직접 실행되지만, 에이전트 샌드박스는 격리를 위해 Docker를 사용합니다. 자세한 내용은 [샌드박싱](/gateway/sandboxing)을 참조하십시오.
:::


## 설치 후 설정

1. **openclaw 사용자로 전환**

   ```bash
       sudo -i -u openclaw
       ```

  2. **온보딩 마법사 실행**

   설치 후 스크립트가 OpenClaw 설정 구성을 안내합니다.

  3. **메시징 제공자 연결**

   WhatsApp, Telegram, Discord, 또는 Signal에 로그인합니다:
       ```bash
       openclaw channels login
       ```

  4. **설치 확인**

   ```bash
       sudo systemctl status openclaw
       sudo journalctl -u openclaw -f
       ```

  5. **Tailscale에 연결**

   안전한 원격 액세스를 위해 VPN 메시에 참여합니다.


### 빠른 명령어

```bash
# 서비스 상태 확인
sudo systemctl status openclaw

# 실시간 로그 보기
sudo journalctl -u openclaw -f

# 게이트웨이 재시작
sudo systemctl restart openclaw

# 제공자 로그인 (openclaw 사용자로 실행)
sudo -i -u openclaw
openclaw channels login
```

## 보안 아키텍처

배포는 4계층 방어 모델을 사용합니다:

1. **방화벽 (UFW)** -- SSH (22) + Tailscale (41641/udp)만 공개적으로 노출
2. **VPN (Tailscale)** -- VPN 메시를 통해서만 게이트웨이 접근 가능
3. **Docker 격리** -- 외부 포트 노출을 방지하는 DOCKER-USER iptables 체인
4. **Systemd 강화** -- NoNewPrivileges, PrivateTmp, 비권한 사용자

외부 공격 표면 확인:

```bash
nmap -p- YOUR_SERVER_IP
```

포트 22 (SSH)만 열려 있어야 합니다. 다른 모든 서비스(게이트웨이, Docker)는 잠겨 있습니다.

Docker는 게이트웨이 자체를 실행하기 위한 것이 아니라 에이전트 샌드박스(격리된 도구 실행)용으로 설치됩니다. 샌드박스 구성에 대한 내용은 [멀티 에이전트 샌드박스 및 도구](/tools/multi-agent-sandbox-tools)를 참조하십시오.

## 수동 설치

자동화보다 수동 제어를 선호하는 경우:

1. **사전 요구 사항 설치**

   ```bash
       sudo apt update && sudo apt install -y ansible git
       ```

  2. **저장소 복제**

   ```bash
       git clone https://github.com/openclaw/openclaw-ansible.git
       cd openclaw-ansible
       ```

  3. **Ansible 컬렉션 설치**

   ```bash
       ansible-galaxy collection install -r requirements.yml
       ```

  4. **플레이북 실행**

   ```bash
       ./run-playbook.sh
       ```
   
       또는 직접 실행한 후 수동으로 설정 스크립트를 실행합니다:
       ```bash
       ansible-playbook playbook.yml --ask-become-pass
       # 그런 다음 실행: /tmp/openclaw-setup.sh
       ```


## 업데이트

Ansible 설치 프로그램은 수동 업데이트를 위해 OpenClaw를 설정합니다. 표준 업데이트 흐름은 [업데이트](/install/updating)를 참조하십시오.

구성 변경 등을 위해 Ansible 플레이북을 다시 실행하려면:

```bash
cd openclaw-ansible
./run-playbook.sh
```

이 작업은 멱등성이 있어 여러 번 실행해도 안전합니다.

## 문제 해결

::: details 방화벽이 연결을 차단합니다
- 먼저 Tailscale VPN을 통해 접근할 수 있는지 확인하십시오
    - SSH 액세스 (포트 22)는 항상 허용됩니다
    - 게이트웨이는 설계상 Tailscale을 통해서만 접근 가능합니다
:::

  ::: details 서비스가 시작되지 않습니다
```bash
    # 로그 확인
    sudo journalctl -u openclaw -n 100

    # 권한 확인
    sudo ls -la /opt/openclaw

    # 수동 시작 테스트
    sudo -i -u openclaw
    cd ~/openclaw
    openclaw gateway run
    ```
:::

  ::: details Docker 샌드박스 문제
```bash
    # Docker 실행 중 확인
    sudo systemctl status docker

    # 샌드박스 이미지 확인
    sudo docker images | grep openclaw-sandbox

    # 샌드박스 이미지가 없는 경우 빌드
    cd /opt/openclaw/openclaw
    sudo -u openclaw ./scripts/sandbox-setup.sh
    ```
:::

  ::: details 제공자 로그인 실패
`openclaw` 사용자로 실행 중인지 확인하십시오:
    ```bash
    sudo -i -u openclaw
    openclaw channels login
    ```
:::

## 고급 구성

자세한 보안 아키텍처 및 문제 해결에 대한 내용은 openclaw-ansible 저장소를 참조하십시오:

- [보안 아키텍처](https://github.com/openclaw/openclaw-ansible/blob/main/docs/security.md)
- [기술 세부 사항](https://github.com/openclaw/openclaw-ansible/blob/main/docs/architecture.md)
- [문제 해결 가이드](https://github.com/openclaw/openclaw-ansible/blob/main/docs/troubleshooting.md)

## 관련 항목

- [openclaw-ansible](https://github.com/openclaw/openclaw-ansible) -- 전체 배포 가이드
- [Docker](/install/docker) -- 컨테이너화된 게이트웨이 설정
- [샌드박싱](/gateway/sandboxing) -- 에이전트 샌드박스 구성
- [멀티 에이전트 샌드박스 및 도구](/tools/multi-agent-sandbox-tools) -- 에이전트별 격리
