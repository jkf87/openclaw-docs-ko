---
title: "Windows"
description: "Windows 지원: 네이티브 및 WSL2 설치 경로, 데몬, 현재 주의 사항"
---

# Windows

OpenClaw는 **네이티브 Windows**와 **WSL2** 모두를 지원합니다. WSL2가 더 안정적인 경로이며 완전한 경험을 위해 권장됩니다. CLI, 게이트웨이, 도구 모음이 Linux 내에서 완전한 호환성으로 실행됩니다. 네이티브 Windows는 아래에 명시된 몇 가지 주의 사항과 함께 핵심 CLI 및 게이트웨이 사용에 작동합니다.

네이티브 Windows 동반 앱은 계획 중입니다.

## WSL2 (권장)

- [시작하기](/start/getting-started) (WSL 내부에서 사용)
- [설치 및 업데이트](/install/updating)
- 공식 WSL2 가이드 (Microsoft): [https://learn.microsoft.com/windows/wsl/install](https://learn.microsoft.com/windows/wsl/install)

## 네이티브 Windows 상태

네이티브 Windows CLI 흐름이 개선되고 있지만 WSL2가 여전히 권장 경로입니다.

오늘날 네이티브 Windows에서 잘 작동하는 것:

- `install.ps1`을 통한 웹사이트 설치 프로그램
- `openclaw --version`, `openclaw doctor`, `openclaw plugins list --json`과 같은 로컬 CLI 사용
- 다음과 같은 임베디드 로컬 에이전트/공급자 스모크:

```powershell
openclaw agent --local --agent main --thinking low -m "Reply with exactly WINDOWS-HATCH-OK."
```

현재 주의 사항:

- `openclaw onboard --non-interactive`는 `--skip-health`를 전달하지 않는 한 여전히 도달 가능한 로컬 게이트웨이를 기대합니다
- `openclaw onboard --non-interactive --install-daemon`과 `openclaw gateway install`은 먼저 Windows 예약 작업을 시도합니다
- 예약 작업 생성이 거부되면 OpenClaw는 사용자별 시작 폴더 로그인 항목으로 대체하고 즉시 게이트웨이를 시작합니다
- `schtasks` 자체가 멈추거나 응답을 중지하면 OpenClaw는 이제 해당 경로를 빠르게 중단하고 영원히 중단되는 대신 대체합니다
- 예약 작업은 더 나은 감독자 상태를 제공하므로 사용 가능한 경우 여전히 선호됩니다

게이트웨이 서비스 설치 없이 네이티브 CLI만 원하는 경우 다음 중 하나를 사용하십시오:

```powershell
openclaw onboard --non-interactive --skip-health
openclaw gateway run
```

네이티브 Windows에서 관리된 시작을 원하는 경우:

```powershell
openclaw gateway install
openclaw gateway status --json
```

예약 작업 생성이 차단된 경우 대체 서비스 모드는 현재 사용자의 시작 폴더를 통해 로그인 후 자동으로 시작합니다.

## 게이트웨이

- [게이트웨이 런북](/gateway)
- [구성](/gateway/configuration)

## 게이트웨이 서비스 설치 (CLI)

WSL2 내부:

```
openclaw onboard --install-daemon
```

또는:

```
openclaw gateway install
```

또는:

```
openclaw configure
```

프롬프트가 표시되면 **Gateway service**를 선택합니다.

복구/마이그레이션:

```
openclaw doctor
```

## Windows 로그인 전 게이트웨이 자동 시작

헤드리스 설정의 경우 아무도 Windows에 로그인하지 않아도 전체 부팅 체인이 실행되도록 하십시오.

### 1) 로그인 없이 사용자 서비스 실행 유지

WSL 내부:

```bash
sudo loginctl enable-linger "$(whoami)"
```

### 2) OpenClaw 게이트웨이 사용자 서비스 설치

WSL 내부:

```bash
openclaw gateway install
```

### 3) Windows 부팅 시 WSL 자동 시작

PowerShell을 관리자 권한으로 실행:

```powershell
schtasks /create /tn "WSL Boot" /tr "wsl.exe -d Ubuntu --exec /bin/true" /sc onstart /ru SYSTEM
```

`Ubuntu`를 다음에서 얻은 배포 이름으로 교체하십시오:

```powershell
wsl --list --verbose
```

### 시작 체인 확인

재부팅 후 (Windows 로그인 전) WSL에서 확인:

```bash
systemctl --user is-enabled openclaw-gateway.service
systemctl --user status openclaw-gateway.service --no-pager
```

## 고급: LAN을 통해 WSL 서비스 노출 (portproxy)

WSL에는 자체 가상 네트워크가 있습니다. 다른 머신이 **WSL 내부**에서 실행 중인 서비스 (SSH, 로컬 TTS 서버, 또는 게이트웨이)에 도달해야 하는 경우 Windows 포트를 현재 WSL IP로 전달해야 합니다. WSL IP는 재시작 후 변경되므로 전달 규칙을 새로 고쳐야 할 수 있습니다.

예시 (PowerShell **관리자 권한**):

```powershell
$Distro = "Ubuntu-24.04"
$ListenPort = 2222
$TargetPort = 22

$WslIp = (wsl -d $Distro -- hostname -I).Trim().Split(" ")[0]
if (-not $WslIp) { throw "WSL IP not found." }

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$ListenPort `
  connectaddress=$WslIp connectport=$TargetPort
```

Windows 방화벽을 통해 포트 허용 (일회성):

```powershell
New-NetFirewallRule -DisplayName "WSL SSH $ListenPort" -Direction Inbound `
  -Protocol TCP -LocalPort $ListenPort -Action Allow
```

WSL 재시작 후 portproxy 새로 고침:

```powershell
netsh interface portproxy delete v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 | Out-Null
netsh interface portproxy add v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 `
  connectaddress=$WslIp connectport=$TargetPort | Out-Null
```

참고:

- 다른 머신에서의 SSH는 **Windows 호스트 IP**를 대상으로 합니다 (예: `ssh user@windows-host -p 2222`).
- 원격 노드는 **도달 가능한** 게이트웨이 URL을 가리켜야 합니다 (`127.0.0.1`이 아님); `openclaw status --all`로 확인하십시오.
- LAN 접근에는 `listenaddress=0.0.0.0`을 사용하고, 로컬 전용에는 `127.0.0.1`을 사용하십시오.
- 자동으로 만들고 싶다면 로그인 시 새로 고침 단계를 실행하는 예약 작업을 등록하십시오.

## 단계별 WSL2 설치

### 1) WSL2 + Ubuntu 설치

PowerShell (관리자)을 열어서:

```powershell
wsl --install
# 또는 명시적으로 배포 선택:
wsl --list --online
wsl --install -d Ubuntu-24.04
```

Windows가 요청하면 재부팅하십시오.

### 2) systemd 활성화 (게이트웨이 설치에 필요)

WSL 터미널에서:

```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```

그런 다음 PowerShell에서:

```powershell
wsl --shutdown
```

Ubuntu를 다시 열고 확인:

```bash
systemctl --user status
```

### 3) OpenClaw 설치 (WSL 내부)

WSL 내부에서 Linux 시작하기 흐름을 따르십시오:

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build # 첫 실행 시 UI 종속성 자동 설치
pnpm build
openclaw onboard
```

전체 가이드: [시작하기](/start/getting-started)

## Windows 동반 앱

Windows 동반 앱은 아직 없습니다. 이를 실현하고 싶다면 기여를 환영합니다.
