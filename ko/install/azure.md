---
summary: "내구성 있는 상태를 갖춘 Azure Linux VM에서 24/7 OpenClaw Gateway 실행"
read_when:
  - Network Security Group 강화가 적용된 Azure에서 OpenClaw를 24/7 실행하려는 경우
  - 자체 Azure Linux VM에서 프로덕션 수준의 상시 OpenClaw Gateway를 원하시는 경우
  - Azure Bastion SSH를 통한 안전한 관리를 원하시는 경우
title: "Azure"
---

# Azure Linux VM에서의 OpenClaw

이 가이드는 Azure CLI를 사용하여 Azure Linux VM을 설정하고, NSG(네트워크 보안 그룹) 강화를 적용하며, SSH 액세스를 위해 Azure Bastion을 구성하고 OpenClaw를 설치합니다.

## 수행 작업

- Azure CLI를 사용하여 Azure 네트워킹(VNet, 서브넷, NSG) 및 컴퓨팅 리소스 생성
- VM SSH가 Azure Bastion에서만 허용되도록 네트워크 보안 그룹 규칙 적용
- SSH 액세스에 Azure Bastion 사용 (VM에 공용 IP 없음)
- 설치 프로그램 스크립트로 OpenClaw 설치
- Gateway 확인

## 필요 사항

- 컴퓨팅 및 네트워크 리소스를 생성할 권한이 있는 Azure 구독
- Azure CLI 설치 (필요한 경우 [Azure CLI 설치 단계](https://learn.microsoft.com/cli/azure/install-azure-cli) 참조)
- SSH 키 쌍 (필요한 경우 가이드에서 생성 방법 설명)
- 약 20-30분

## 배포 구성

<Steps>
  <Step title="Azure CLI에 로그인">
    ```bash
    az login
    az extension add -n ssh
    ```

    `ssh` 확장 기능은 Azure Bastion 네이티브 SSH 터널링에 필요합니다.

  </Step>

  <Step title="필수 리소스 공급자 등록 (1회)">
    ```bash
    az provider register --namespace Microsoft.Compute
    az provider register --namespace Microsoft.Network
    ```

    등록을 확인합니다. 두 항목 모두 `Registered`로 표시될 때까지 기다립니다.

    ```bash
    az provider show --namespace Microsoft.Compute --query registrationState -o tsv
    az provider show --namespace Microsoft.Network --query registrationState -o tsv
    ```

  </Step>

  <Step title="배포 변수 설정">
    ```bash
    RG="rg-openclaw"
    LOCATION="westus2"
    VNET_NAME="vnet-openclaw"
    VNET_PREFIX="10.40.0.0/16"
    VM_SUBNET_NAME="snet-openclaw-vm"
    VM_SUBNET_PREFIX="10.40.2.0/24"
    BASTION_SUBNET_PREFIX="10.40.1.0/26"
    NSG_NAME="nsg-openclaw-vm"
    VM_NAME="vm-openclaw"
    ADMIN_USERNAME="openclaw"
    BASTION_NAME="bas-openclaw"
    BASTION_PIP_NAME="pip-openclaw-bastion"
    ```

    환경에 맞게 이름과 CIDR 범위를 조정합니다. Bastion 서브넷은 최소 `/26`이어야 합니다.

  </Step>

  <Step title="SSH 키 선택">
    기존 공개 키가 있는 경우 사용합니다:

    ```bash
    SSH_PUB_KEY="$(cat ~/.ssh/id_ed25519.pub)"
    ```

    SSH 키가 없는 경우 생성합니다:

    ```bash
    ssh-keygen -t ed25519 -a 100 -f ~/.ssh/id_ed25519 -C "you@example.com"
    SSH_PUB_KEY="$(cat ~/.ssh/id_ed25519.pub)"
    ```

  </Step>

  <Step title="VM 크기 및 OS 디스크 크기 선택">
    ```bash
    VM_SIZE="Standard_B2as_v2"
    OS_DISK_SIZE_GB=64
    ```

    구독 및 지역에서 사용 가능한 VM 크기와 OS 디스크 크기를 선택합니다:

    - 경량 사용을 위해 더 작은 크기로 시작하고 나중에 확장
    - 더 많은 자동화, 채널 또는 대형 모델/도구 작업에는 더 많은 vCPU/RAM/디스크 사용
    - VM 크기가 지역 또는 구독 할당량에서 사용 불가한 경우 가장 가까운 SKU 선택

    대상 지역에서 사용 가능한 VM 크기 목록:

    ```bash
    az vm list-skus --location "${LOCATION}" --resource-type virtualMachines -o table
    ```

    현재 vCPU 및 디스크 사용량/할당량 확인:

    ```bash
    az vm list-usage --location "${LOCATION}" -o table
    ```

  </Step>
</Steps>

## Azure 리소스 배포

<Steps>
  <Step title="리소스 그룹 생성">
    ```bash
    az group create -n "${RG}" -l "${LOCATION}"
    ```
  </Step>

  <Step title="네트워크 보안 그룹 생성">
    NSG를 생성하고 Bastion 서브넷만 VM에 SSH를 허용하는 규칙을 추가합니다.

    ```bash
    az network nsg create \
      -g "${RG}" -n "${NSG_NAME}" -l "${LOCATION}"

    # Bastion 서브넷에서만 SSH 허용
    az network nsg rule create \
      -g "${RG}" --nsg-name "${NSG_NAME}" \
      -n AllowSshFromBastionSubnet --priority 100 \
      --access Allow --direction Inbound --protocol Tcp \
      --source-address-prefixes "${BASTION_SUBNET_PREFIX}" \
      --destination-port-ranges 22

    # 공용 인터넷에서 SSH 차단
    az network nsg rule create \
      -g "${RG}" --nsg-name "${NSG_NAME}" \
      -n DenyInternetSsh --priority 110 \
      --access Deny --direction Inbound --protocol Tcp \
      --source-address-prefixes Internet \
      --destination-port-ranges 22

    # 다른 VNet 소스에서 SSH 차단
    az network nsg rule create \
      -g "${RG}" --nsg-name "${NSG_NAME}" \
      -n DenyVnetSsh --priority 120 \
      --access Deny --direction Inbound --protocol Tcp \
      --source-address-prefixes VirtualNetwork \
      --destination-port-ranges 22
    ```

    규칙은 우선 순위(낮은 숫자 우선)에 따라 평가됩니다. Bastion 트래픽은 100에서 허용되고, 다른 모든 SSH는 110 및 120에서 차단됩니다.

  </Step>

  <Step title="가상 네트워크 및 서브넷 생성">
    VM 서브넷(NSG 연결)이 포함된 VNet을 생성한 다음 Bastion 서브넷을 추가합니다.

    ```bash
    az network vnet create \
      -g "${RG}" -n "${VNET_NAME}" -l "${LOCATION}" \
      --address-prefixes "${VNET_PREFIX}" \
      --subnet-name "${VM_SUBNET_NAME}" \
      --subnet-prefixes "${VM_SUBNET_PREFIX}"

    # NSG를 VM 서브넷에 연결
    az network vnet subnet update \
      -g "${RG}" --vnet-name "${VNET_NAME}" \
      -n "${VM_SUBNET_NAME}" --nsg "${NSG_NAME}"

    # AzureBastionSubnet — Azure에서 이름이 필요합니다
    az network vnet subnet create \
      -g "${RG}" --vnet-name "${VNET_NAME}" \
      -n AzureBastionSubnet \
      --address-prefixes "${BASTION_SUBNET_PREFIX}"
    ```

  </Step>

  <Step title="VM 생성">
    VM에는 공용 IP가 없습니다. SSH 액세스는 Azure Bastion을 통해서만 가능합니다.

    ```bash
    az vm create \
      -g "${RG}" -n "${VM_NAME}" -l "${LOCATION}" \
      --image "Canonical:ubuntu-24_04-lts:server:latest" \
      --size "${VM_SIZE}" \
      --os-disk-size-gb "${OS_DISK_SIZE_GB}" \
      --storage-sku StandardSSD_LRS \
      --admin-username "${ADMIN_USERNAME}" \
      --ssh-key-values "${SSH_PUB_KEY}" \
      --vnet-name "${VNET_NAME}" \
      --subnet "${VM_SUBNET_NAME}" \
      --public-ip-address "" \
      --nsg ""
    ```

    `--public-ip-address ""`는 공용 IP 할당을 방지합니다. `--nsg ""`는 NIC별 NSG 생성을 건너뜁니다(서브넷 수준 NSG가 보안을 처리합니다).

    **재현성:** 위 명령은 Ubuntu 이미지에 `latest`를 사용합니다. 특정 버전을 고정하려면 사용 가능한 버전을 나열하고 `latest`를 교체합니다:

    ```bash
    az vm image list \
      --publisher Canonical --offer ubuntu-24_04-lts \
      --sku server --all -o table
    ```

  </Step>

  <Step title="Azure Bastion 생성">
    Azure Bastion은 공용 IP를 노출하지 않고 VM에 관리형 SSH 액세스를 제공합니다. CLI 기반 `az network bastion ssh`를 사용하려면 터널링이 포함된 Standard SKU가 필요합니다.

    ```bash
    az network public-ip create \
      -g "${RG}" -n "${BASTION_PIP_NAME}" -l "${LOCATION}" \
      --sku Standard --allocation-method Static

    az network bastion create \
      -g "${RG}" -n "${BASTION_NAME}" -l "${LOCATION}" \
      --vnet-name "${VNET_NAME}" \
      --public-ip-address "${BASTION_PIP_NAME}" \
      --sku Standard --enable-tunneling true
    ```

    Bastion 프로비저닝은 일반적으로 5-10분이 걸리지만 일부 지역에서는 최대 15-30분이 걸릴 수 있습니다.

  </Step>
</Steps>

## OpenClaw 설치

<Steps>
  <Step title="Azure Bastion을 통해 VM에 SSH 접속">
    ```bash
    VM_ID="$(az vm show -g "${RG}" -n "${VM_NAME}" --query id -o tsv)"

    az network bastion ssh \
      --name "${BASTION_NAME}" \
      --resource-group "${RG}" \
      --target-resource-id "${VM_ID}" \
      --auth-type ssh-key \
      --username "${ADMIN_USERNAME}" \
      --ssh-key ~/.ssh/id_ed25519
    ```

  </Step>

  <Step title="OpenClaw 설치 (VM 셸에서)">
    ```bash
    curl -fsSL https://openclaw.ai/install.sh -o /tmp/install.sh
    bash /tmp/install.sh
    rm -f /tmp/install.sh
    ```

    설치 프로그램은 아직 없는 경우 Node LTS 및 종속성을 설치하고, OpenClaw를 설치한 후 온보딩 마법사를 시작합니다. 자세한 내용은 [설치](/install)를 참조하십시오.

  </Step>

  <Step title="Gateway 확인">
    온보딩이 완료된 후:

    ```bash
    openclaw gateway status
    ```

    대부분의 엔터프라이즈 Azure 팀은 이미 GitHub Copilot 라이선스를 보유하고 있습니다. 해당하는 경우 OpenClaw 온보딩 마법사에서 GitHub Copilot 제공자를 선택하는 것을 권장합니다. [GitHub Copilot 제공자](/providers/github-copilot)를 참조하십시오.

  </Step>
</Steps>

## 비용 고려 사항

Azure Bastion Standard SKU는 월 약 **\$140**이 들고, VM (Standard_B2as_v2)은 월 약 **\$55**가 듭니다.

비용 절감 방법:

- **VM을 할당 해제**하여 사용하지 않을 때 (컴퓨팅 요금이 중지되지만 디스크 요금은 계속 발생). VM이 할당 해제된 동안에는 OpenClaw Gateway에 도달할 수 없습니다. 다시 필요할 때 재시작합니다:

  ```bash
  az vm deallocate -g "${RG}" -n "${VM_NAME}"
  az vm start -g "${RG}" -n "${VM_NAME}"   # 나중에 재시작
  ```

- **필요하지 않을 때 Bastion 삭제** 후 SSH 액세스가 필요할 때 재생성합니다. Bastion은 가장 큰 비용 요소이며 몇 분만 걸립니다.
- CLI 터널링(`az network bastion ssh`)이 필요 없고 포털 기반 SSH만 필요한 경우 **Basic Bastion SKU** (~월 \$38) 사용.

## 정리

이 가이드에서 생성한 모든 리소스를 삭제하려면:

```bash
az group delete -n "${RG}" --yes --no-wait
```

이렇게 하면 리소스 그룹 및 그 안의 모든 항목(VM, VNet, NSG, Bastion, 공용 IP)이 제거됩니다.

## 다음 단계

- 메시징 채널 설정: [채널](/channels)
- 로컬 장치를 노드로 페어링: [노드](/nodes)
- Gateway 구성: [Gateway 구성](/gateway/configuration)
- GitHub Copilot 모델 제공자를 사용한 Azure OpenClaw 배포에 대한 자세한 내용: [GitHub Copilot을 사용한 Azure OpenClaw](https://github.com/johnsonshi/openclaw-azure-github-copilot)
