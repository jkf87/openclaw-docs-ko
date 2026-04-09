---
title: "설치 프로그램 내부"
description: "설치 프로그램 스크립트 작동 방식 (install.sh, install-cli.sh, install.ps1), 플래그 및 자동화"
---

# 설치 프로그램 내부

OpenClaw는 `openclaw.ai`에서 제공하는 세 가지 설치 프로그램 스크립트를 제공합니다.

| 스크립트                               | 플랫폼               | 수행 작업                                                                                                      |
| -------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`install.sh`](#installsh)             | macOS / Linux / WSL  | 필요한 경우 Node를 설치하고, npm(기본값) 또는 git을 통해 OpenClaw를 설치하며, 온보딩을 실행할 수 있습니다.     |
| [`install-cli.sh`](#install-clish)     | macOS / Linux / WSL  | npm 또는 git 체크아웃 모드로 로컬 접두사(`~/.openclaw`)에 Node + OpenClaw를 설치합니다. 루트 불필요.           |
| [`install.ps1`](#installps1)           | Windows (PowerShell) | 필요한 경우 Node를 설치하고, npm(기본값) 또는 git을 통해 OpenClaw를 설치하며, 온보딩을 실행할 수 있습니다.     |

## 빠른 명령어

**install.sh**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```

    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --help
    ```


  **install-cli.sh**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
    ```

    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --help
    ```


  **install.ps1**

```powershell
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```

    ```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -Tag beta -NoOnboard -DryRun
    ```



::: info NOTE
설치는 성공했지만 새 터미널에서 `openclaw`를 찾을 수 없는 경우 [Node.js 문제 해결](/install/node#troubleshooting)을 참조하십시오.
:::


---

<a id="installsh"></a>

## install.sh

::: tip
macOS/Linux/WSL에서 대부분의 대화형 설치에 권장됩니다.
:::


### 흐름 (install.sh)

1. **OS 감지**

   macOS 및 Linux (WSL 포함)를 지원합니다. macOS가 감지되면 Homebrew가 없는 경우 설치합니다.

  2. **기본적으로 Node.js 24 확인**

   Node 버전을 확인하고 필요한 경우 Node 24를 설치합니다 (macOS에서는 Homebrew, Linux에서는 NodeSource 설정 스크립트 사용). OpenClaw는 호환성을 위해 Node 22 LTS, 현재 `22.14+`를 계속 지원합니다.

  3. **Git 확인**

   없는 경우 Git을 설치합니다.

  4. **OpenClaw 설치**

   - `npm` 방법 (기본값): 전역 npm 설치
       - `git` 방법: 저장소 복제/업데이트, pnpm으로 종속성 설치, 빌드, 그런 다음 `~/.local/bin/openclaw`에 래퍼 설치

  5. **설치 후 작업**

   - 로드된 게이트웨이 서비스를 최선의 노력으로 새로 고침 (`openclaw gateway install --force`, 그런 다음 재시작)
       - 업그레이드 및 git 설치 시 `openclaw doctor --non-interactive` 실행 (최선의 노력)
       - 적절한 경우 온보딩 시도 (TTY 사용 가능, 온보딩 비활성화 안 됨, 부트스트랩/구성 확인 통과)
       - 기본적으로 `SHARP_IGNORE_GLOBAL_LIBVIPS=1`


### 소스 체크아웃 감지

OpenClaw 체크아웃(`package.json` + `pnpm-workspace.yaml`) 내에서 실행되면 스크립트가 다음을 제안합니다:

- 체크아웃 사용 (`git`), 또는
- 전역 설치 사용 (`npm`)

TTY를 사용할 수 없고 설치 방법이 설정되지 않은 경우 `npm`으로 기본 설정하고 경고합니다.

잘못된 방법 선택 또는 잘못된 `--install-method` 값의 경우 코드 `2`로 스크립트가 종료됩니다.

### 예제 (install.sh)

**기본**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```


  **온보딩 건너뛰기**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --no-onboard
    ```


  **Git 설치**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```


  **npm을 통한 GitHub main**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --version main
    ```


  **드라이 런**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --dry-run
    ```



::: details 플래그 참조
| 플래그                                  | 설명                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| `--install-method npm\|git`             | 설치 방법 선택 (기본값: `npm`). 별칭: `--method`           |
| `--npm`                                 | npm 방법 단축키                                            |
| `--git`                                 | git 방법 단축키. 별칭: `--github`                          |
| `--version &lt;version\|dist-tag\|spec&gt;`   | npm 버전, dist-tag 또는 패키지 스펙 (기본값: `latest`)     |
| `--beta`                                | 사용 가능한 경우 beta dist-tag 사용, 그렇지 않으면 `latest`로 폴백 |
| `--git-dir &lt;path&gt;`                      | 체크아웃 디렉터리 (기본값: `~/openclaw`). 별칭: `--dir`    |
| `--no-git-update`                       | 기존 체크아웃에 대해 `git pull` 건너뛰기                   |
| `--no-prompt`                           | 프롬프트 비활성화                                          |
| `--no-onboard`                          | 온보딩 건너뛰기                                            |
| `--onboard`                             | 온보딩 활성화                                              |
| `--dry-run`                             | 변경 사항을 적용하지 않고 작업 출력                        |
| `--verbose`                             | 디버그 출력 활성화 (`set -x`, npm 알림 수준 로그)          |
| `--help`                                | 사용법 표시 (`-h`)                                         |
:::


  ::: details 환경 변수 참조
| 변수                                                    | 설명                                          |
| ------------------------------------------------------- | --------------------------------------------- |
| `OPENCLAW_INSTALL_METHOD=git\|npm`                      | 설치 방법                                     |
| `OPENCLAW_VERSION=latest\|next\|main\|&lt;semver&gt;\|&lt;spec&gt;` | npm 버전, dist-tag 또는 패키지 스펙           |
| `OPENCLAW_BETA=0\|1`                                    | 사용 가능한 경우 beta 사용                    |
| `OPENCLAW_GIT_DIR=&lt;path&gt;`                               | 체크아웃 디렉터리                             |
| `OPENCLAW_GIT_UPDATE=0\|1`                              | git 업데이트 토글                             |
| `OPENCLAW_NO_PROMPT=1`                                  | 프롬프트 비활성화                             |
| `OPENCLAW_NO_ONBOARD=1`                                 | 온보딩 건너뛰기                               |
| `OPENCLAW_DRY_RUN=1`                                    | 드라이 런 모드                                |
| `OPENCLAW_VERBOSE=1`                                    | 디버그 모드                                   |
| `OPENCLAW_NPM_LOGLEVEL=error\|warn\|notice`             | npm 로그 수준                                 |
| `SHARP_IGNORE_GLOBAL_LIBVIPS=0\|1`                      | sharp/libvips 동작 제어 (기본값: `1`)         |
:::

---

<a id="install-clish"></a>

## install-cli.sh

::: info
로컬 접두사(기본값 `~/.openclaw`) 아래에 모든 것을 원하고 시스템 Node 종속성이 없는 환경을 위해 설계되었습니다. 기본적으로 npm 설치를 지원하며 동일한 접두사 흐름 아래에서 git 체크아웃 설치도 지원합니다.
:::


### 흐름 (install-cli.sh)

1. **로컬 Node 런타임 설치**

   고정된 지원 Node LTS 타르볼(버전은 스크립트에 내장되고 독립적으로 업데이트됨)을 `&lt;prefix&gt;/tools/node-v&lt;version&gt;`에 다운로드하고 SHA-256을 검증합니다.

  2. **Git 확인**

   Git가 없는 경우 Linux에서는 apt/dnf/yum을 통해, macOS에서는 Homebrew를 통해 설치를 시도합니다.

  3. **접두사 아래에 OpenClaw 설치**

   - `npm` 방법 (기본값): 접두사 아래에 npm으로 설치한 다음 `&lt;prefix&gt;/bin/openclaw`에 래퍼 작성
       - `git` 방법: 체크아웃 복제/업데이트 (기본값 `~/openclaw`) 및 여전히 `&lt;prefix&gt;/bin/openclaw`에 래퍼 작성

  4. **로드된 게이트웨이 서비스 새로 고침**

   해당 동일한 접두사에서 게이트웨이 서비스가 이미 로드된 경우 스크립트는 `openclaw gateway install --force`, 그런 다음 `openclaw gateway restart`를 실행하고 게이트웨이 헬스를 최선의 노력으로 프로브합니다.


### 예제 (install-cli.sh)

**기본**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
    ```


  **사용자 정의 접두사 + 버전**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --prefix /opt/openclaw --version latest
    ```


  **Git 설치**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --install-method git --git-dir ~/openclaw
    ```


  **자동화 JSON 출력**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --json --prefix /opt/openclaw
    ```


  **온보딩 실행**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --onboard
    ```



::: details 플래그 참조
| 플래그                      | 설명                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| `--prefix &lt;path&gt;`           | 설치 접두사 (기본값: `~/.openclaw`)                                      |
| `--install-method npm\|git` | 설치 방법 선택 (기본값: `npm`). 별칭: `--method`                         |
| `--npm`                     | npm 방법 단축키                                                          |
| `--git`, `--github`         | git 방법 단축키                                                          |
| `--git-dir &lt;path&gt;`          | Git 체크아웃 디렉터리 (기본값: `~/openclaw`). 별칭: `--dir`              |
| `--version &lt;ver&gt;`           | OpenClaw 버전 또는 dist-tag (기본값: `latest`)                           |
| `--node-version &lt;ver&gt;`      | Node 버전 (기본값: `22.22.0`)                                            |
| `--json`                    | NDJSON 이벤트 출력                                                       |
| `--onboard`                 | 설치 후 `openclaw onboard` 실행                                          |
| `--no-onboard`              | 온보딩 건너뛰기 (기본값)                                                 |
| `--set-npm-prefix`          | Linux에서 현재 접두사가 쓰기 불가능한 경우 npm 접두사를 `~/.npm-global`로 강제 설정 |
| `--help`                    | 사용법 표시 (`-h`)                                                       |
:::


  ::: details 환경 변수 참조
| 변수                                        | 설명                                          |
| ------------------------------------------- | --------------------------------------------- |
| `OPENCLAW_PREFIX=&lt;path&gt;`                    | 설치 접두사                                   |
| `OPENCLAW_INSTALL_METHOD=git\|npm`          | 설치 방법                                     |
| `OPENCLAW_VERSION=&lt;ver&gt;`                    | OpenClaw 버전 또는 dist-tag                   |
| `OPENCLAW_NODE_VERSION=&lt;ver&gt;`               | Node 버전                                     |
| `OPENCLAW_GIT_DIR=&lt;path&gt;`                   | git 설치를 위한 Git 체크아웃 디렉터리         |
| `OPENCLAW_GIT_UPDATE=0\|1`                  | 기존 체크아웃의 git 업데이트 토글             |
| `OPENCLAW_NO_ONBOARD=1`                     | 온보딩 건너뛰기                               |
| `OPENCLAW_NPM_LOGLEVEL=error\|warn\|notice` | npm 로그 수준                                 |
| `SHARP_IGNORE_GLOBAL_LIBVIPS=0\|1`          | sharp/libvips 동작 제어 (기본값: `1`)         |
:::

---

<a id="installps1"></a>

## install.ps1

### 흐름 (install.ps1)

1. **PowerShell + Windows 환경 확인**

   PowerShell 5+가 필요합니다.

  2. **기본적으로 Node.js 24 확인**

   없는 경우 winget, 그런 다음 Chocolatey, 그런 다음 Scoop을 통해 설치를 시도합니다. Node 22 LTS, 현재 `22.14+`는 호환성을 위해 계속 지원됩니다.

  3. **OpenClaw 설치**

   - `npm` 방법 (기본값): 선택한 `-Tag`를 사용하여 전역 npm 설치
       - `git` 방법: 저장소 복제/업데이트, pnpm으로 설치/빌드, `%USERPROFILE%\.local\bin\openclaw.cmd`에 래퍼 설치

  4. **설치 후 작업**

   - 가능한 경우 사용자 PATH에 필요한 bin 디렉터리 추가
       - 로드된 게이트웨이 서비스를 최선의 노력으로 새로 고침 (`openclaw gateway install --force`, 그런 다음 재시작)
       - 업그레이드 및 git 설치 시 `openclaw doctor --non-interactive` 실행 (최선의 노력)


### 예제 (install.ps1)

**기본**

```powershell
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```


  **Git 설치**

```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -InstallMethod git
    ```


  **npm을 통한 GitHub main**

```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -Tag main
    ```


  **사용자 정의 git 디렉터리**

```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -InstallMethod git -GitDir "C:\openclaw"
    ```


  **드라이 런**

```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -DryRun
    ```


  **디버그 추적**

```powershell
    # install.ps1에는 아직 전용 -Verbose 플래그가 없습니다.
    Set-PSDebug -Trace 1
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    Set-PSDebug -Trace 0
    ```



::: details 플래그 참조
| 플래그                      | 설명                                                       |
| --------------------------- | ---------------------------------------------------------- |
| `-InstallMethod npm\|git`   | 설치 방법 (기본값: `npm`)                                  |
| `-Tag &lt;tag\|version\|spec&gt;` | npm dist-tag, 버전 또는 패키지 스펙 (기본값: `latest`)     |
| `-GitDir &lt;path&gt;`            | 체크아웃 디렉터리 (기본값: `%USERPROFILE%\openclaw`)       |
| `-NoOnboard`                | 온보딩 건너뛰기                                            |
| `-NoGitUpdate`              | `git pull` 건너뛰기                                        |
| `-DryRun`                   | 작업만 출력                                                |
:::


  ::: details 환경 변수 참조
| 변수                               | 설명               |
| ---------------------------------- | ------------------ |
| `OPENCLAW_INSTALL_METHOD=git\|npm` | 설치 방법          |
| `OPENCLAW_GIT_DIR=&lt;path&gt;`          | 체크아웃 디렉터리  |
| `OPENCLAW_NO_ONBOARD=1`            | 온보딩 건너뛰기    |
| `OPENCLAW_GIT_UPDATE=0`            | git pull 비활성화  |
| `OPENCLAW_DRY_RUN=1`               | 드라이 런 모드     |
:::

::: info NOTE
`-InstallMethod git`를 사용하고 Git가 없는 경우 스크립트가 종료되고 Git for Windows 링크를 출력합니다.
:::


---

## CI 및 자동화

예측 가능한 실행을 위해 비대화형 플래그/환경 변수를 사용합니다.

**install.sh (비대화형 npm)**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --no-prompt --no-onboard
    ```


  **install.sh (비대화형 git)**

```bash
    OPENCLAW_INSTALL_METHOD=git OPENCLAW_NO_PROMPT=1 \
      curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```


  **install-cli.sh (JSON)**

```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --json --prefix /opt/openclaw
    ```


  **install.ps1 (온보딩 건너뛰기)**

```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    ```



---

## 문제 해결

::: details Git가 왜 필요한가요?
`git` 설치 방법에는 Git가 필요합니다. `npm` 설치의 경우 종속성이 git URL을 사용할 때 `spawn git ENOENT` 오류를 피하기 위해 Git를 여전히 확인/설치합니다.
:::


  ::: details Linux에서 npm이 EACCES를 반환하는 이유는 무엇인가요?
일부 Linux 설정에서는 npm 전역 접두사가 루트 소유 경로를 가리킵니다. `install.sh`는 접두사를 `~/.npm-global`로 전환하고 해당 파일이 존재하는 경우 셸 rc 파일에 PATH 내보내기를 추가할 수 있습니다.
:::


  ::: details sharp/libvips 문제
스크립트는 기본적으로 `SHARP_IGNORE_GLOBAL_LIBVIPS=1`로 설정하여 sharp가 시스템 libvips를 기반으로 빌드되는 것을 방지합니다. 재정의하려면:

    ```bash
    SHARP_IGNORE_GLOBAL_LIBVIPS=0 curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```
:::


  &lt;Accordion title='Windows: "npm error spawn git / ENOENT"'&gt;
    Git for Windows를 설치하고 PowerShell을 다시 열고 설치 프로그램을 다시 실행합니다.
  &lt;/Accordion&gt;

  &lt;Accordion title='Windows: "openclaw is not recognized"'&gt;
    `npm config get prefix`를 실행하고 해당 디렉터리를 사용자 PATH에 추가합니다(Windows에서는 `\bin` 접미사가 필요 없음). 그런 다음 PowerShell을 다시 엽니다.
  &lt;/Accordion&gt;

  ::: details Windows: 상세 설치 프로그램 출력 가져오기
`install.ps1`은 현재 `-Verbose` 스위치를 노출하지 않습니다.
    스크립트 수준 진단을 위해 PowerShell 추적을 사용합니다:

    ```powershell
    Set-PSDebug -Trace 1
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    Set-PSDebug -Trace 0
    ```
:::


  ::: details 설치 후 openclaw를 찾을 수 없음
일반적으로 PATH 문제입니다. [Node.js 문제 해결](/install/node#troubleshooting)을 참조하십시오.
:::

