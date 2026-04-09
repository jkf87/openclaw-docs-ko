---
title: "설치"
description: "OpenClaw 설치 — 설치 프로그램 스크립트, npm/pnpm/bun, 소스에서, Docker 등"
---

# 설치

## 권장: 설치 프로그램 스크립트

가장 빠른 설치 방법입니다. OS를 감지하고, 필요한 경우 Node를 설치하고, OpenClaw를 설치하고, 온보딩을 시작합니다.

**macOS / Linux / WSL2**

```bash
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```


  **Windows (PowerShell)**

```powershell
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```



온보딩 실행 없이 설치하려면:

**macOS / Linux / WSL2**

```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
    ```


  **Windows (PowerShell)**

```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    ```



모든 플래그 및 CI/자동화 옵션은 [설치 프로그램 내부](/install/installer)를 참조하십시오.

## 시스템 요구 사항

- **Node 24** (권장) 또는 Node 22.14+ — 설치 프로그램 스크립트가 자동으로 처리
- **macOS, Linux 또는 Windows** — 네이티브 Windows와 WSL2 모두 지원됨. WSL2가 더 안정적입니다. [Windows](/platforms/windows) 참조.
- `pnpm`은 소스에서 빌드하는 경우에만 필요

## 대안 설치 방법

### 로컬 접두사 설치 프로그램 (`install-cli.sh`)

시스템 전체 Node 설치에 의존하지 않고 `~/.openclaw`와 같은 로컬 접두사 아래에 OpenClaw와 Node를 유지하려는 경우 사용합니다:

```bash
curl -fsSL https://openclaw.ai/install-cli.sh | bash
```

기본적으로 npm 설치를 지원하며 동일한 접두사 흐름 아래에서 git 체크아웃 설치도 지원합니다. 전체 참조: [설치 프로그램 내부](/install/installer#install-clish).

### npm, pnpm 또는 bun

이미 Node를 직접 관리하는 경우:

**npm**

```bash
    npm install -g openclaw@latest
    openclaw onboard --install-daemon
    ```


  **pnpm**

```bash
    pnpm add -g openclaw@latest
    pnpm approve-builds -g
    openclaw onboard --install-daemon
    ```

    ::: info NOTE
pnpm은 빌드 스크립트가 있는 패키지에 대해 명시적인 승인이 필요합니다. 첫 번째 설치 후 `pnpm approve-builds -g`를 실행합니다.
:::


  **bun**

```bash
    bun add -g openclaw@latest
    openclaw onboard --install-daemon
    ```

    ::: info NOTE
Bun은 전역 CLI 설치 경로에 대해 지원됩니다. Gateway 런타임의 경우 Node가 권장 데몬 런타임으로 유지됩니다.
:::



::: details 문제 해결: sharp 빌드 오류 (npm)
전역으로 설치된 libvips로 인해 `sharp`가 실패하는 경우:

```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```
:::


### 소스에서

기여자 또는 로컬 체크아웃에서 실행하려는 경우:

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install && pnpm ui:build && pnpm build
pnpm link --global
openclaw onboard --install-daemon
```

또는 링크를 건너뛰고 저장소 내에서 `pnpm openclaw ...`를 사용합니다. 전체 개발 워크플로우는 [설정](/start/setup)을 참조하십시오.

### GitHub main에서 설치

```bash
npm install -g github:openclaw/openclaw#main
```

### 컨테이너 및 패키지 관리자

> **Docker** [→](/install/docker)
> 컨테이너화 또는 헤드리스 배포.


  > **Podman** [→](/install/podman)
> Docker의 루트리스 컨테이너 대안.


  > **Nix** [→](/install/nix)
> Nix 플레이크를 통한 선언적 설치.


  > **Ansible** [→](/install/ansible)
> 자동화된 플릿 프로비저닝.


  > **Bun** [→](/install/bun)
> Bun 런타임을 통한 CLI 전용 사용.


## 설치 확인

```bash
openclaw --version      # CLI 사용 가능 여부 확인
openclaw doctor         # 구성 문제 확인
openclaw gateway status # Gateway가 실행 중인지 확인
```

설치 후 관리되는 시작을 원하는 경우:

- macOS: `openclaw onboard --install-daemon` 또는 `openclaw gateway install`을 통한 LaunchAgent
- Linux/WSL2: 동일한 명령을 통한 systemd 사용자 서비스
- 네이티브 Windows: 예약된 작업 우선, 작업 생성이 거부된 경우 사용자별 시작 폴더 로그인 항목으로 폴백

## 호스팅 및 배포

클라우드 서버 또는 VPS에 OpenClaw를 배포합니다:

> **VPS** [→](/vps)
> 모든 Linux VPS


  > **Docker VM** [→](/install/docker-vm-runtime)
> 공유 Docker 단계


  > **Kubernetes** [→](/install/kubernetes)
> K8s


  > **Fly.io** [→](/install/fly)
> Fly.io


  > **Hetzner** [→](/install/hetzner)
> Hetzner


  > **GCP** [→](/install/gcp)
> Google Cloud


  > **Azure** [→](/install/azure)
> Azure


  > **Railway** [→](/install/railway)
> Railway


  > **Render** [→](/install/render)
> Render


  > **Northflank** [→](/install/northflank)
> Northflank


## 업데이트, 마이그레이션 또는 제거

> **업데이트** [→](/install/updating)
> OpenClaw를 최신 상태로 유지합니다.


  > **마이그레이션** [→](/install/migrating)
> 새 머신으로 이동합니다.


  > **제거** [→](/install/uninstall)
> OpenClaw를 완전히 제거합니다.


## 문제 해결: `openclaw`를 찾을 수 없음

설치는 성공했지만 터미널에서 `openclaw`를 찾을 수 없는 경우:

```bash
node -v           # Node가 설치되었나요?
npm prefix -g     # 전역 패키지는 어디에 있나요?
echo "$PATH"      # 전역 bin 디렉터리가 PATH에 있나요?
```

`$(npm prefix -g)/bin`이 `$PATH`에 없는 경우 셸 시작 파일(`~/.zshrc` 또는 `~/.bashrc`)에 추가합니다:

```bash
export PATH="$(npm prefix -g)/bin:$PATH"
```

그런 다음 새 터미널을 엽니다. 자세한 내용은 [Node 설정](/install/node)을 참조하십시오.
