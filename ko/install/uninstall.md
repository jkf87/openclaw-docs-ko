---
summary: "OpenClaw 완전 제거 (CLI, 서비스, 상태, 작업 공간)"
read_when:
  - 머신에서 OpenClaw를 제거하려는 경우
  - 제거 후에도 게이트웨이 서비스가 계속 실행 중인 경우
title: "제거"
---

# 제거

두 가지 경로가 있습니다:

- `openclaw`가 아직 설치되어 있는 경우 **간편 경로**.
- CLI는 없지만 서비스가 계속 실행 중인 경우 **수동 서비스 제거**.

## 간편 경로 (CLI가 아직 설치된 경우)

권장: 내장 제거 프로그램을 사용합니다:

```bash
openclaw uninstall
```

비대화형 (자동화 / npx):

```bash
openclaw uninstall --all --yes --non-interactive
npx -y openclaw uninstall --all --yes --non-interactive
```

수동 단계 (동일한 결과):

1. 게이트웨이 서비스를 중지합니다:

```bash
openclaw gateway stop
```

2. 게이트웨이 서비스를 제거합니다 (launchd/systemd/schtasks):

```bash
openclaw gateway uninstall
```

3. 상태 및 구성을 삭제합니다:

```bash
rm -rf "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
```

`OPENCLAW_CONFIG_PATH`를 상태 디렉터리 외부의 사용자 정의 위치로 설정한 경우 해당 파일도 삭제합니다.

4. 작업 공간을 삭제합니다 (선택 사항, 에이전트 파일 제거):

```bash
rm -rf ~/.openclaw/workspace
```

5. CLI 설치를 제거합니다 (사용한 방법에 맞게 선택):

```bash
npm rm -g openclaw
pnpm remove -g openclaw
bun remove -g openclaw
```

6. macOS 앱을 설치한 경우:

```bash
rm -rf /Applications/OpenClaw.app
```

참고:

- 프로파일(`--profile` / `OPENCLAW_PROFILE`)을 사용한 경우 각 상태 디렉터리에 대해 3단계를 반복합니다 (기본값은 `~/.openclaw-<profile>`).
- 원격 모드에서는 상태 디렉터리가 **게이트웨이 호스트**에 있으므로 그곳에서도 1~4단계를 실행합니다.

## 수동 서비스 제거 (CLI가 설치되지 않은 경우)

게이트웨이 서비스가 계속 실행 중이지만 `openclaw`가 없는 경우 이 방법을 사용합니다.

### macOS (launchd)

기본 레이블은 `ai.openclaw.gateway` (또는 `ai.openclaw.<profile>`; 레거시 `com.openclaw.*`가 여전히 존재할 수 있음):

```bash
launchctl bootout gui/$UID/ai.openclaw.gateway
rm -f ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

프로파일을 사용한 경우 레이블과 plist 이름을 `ai.openclaw.<profile>`로 교체합니다. 레거시 `com.openclaw.*` plist가 있으면 제거합니다.

### Linux (systemd 사용자 유닛)

기본 유닛 이름은 `openclaw-gateway.service` (또는 `openclaw-gateway-<profile>.service`):

```bash
systemctl --user disable --now openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service
systemctl --user daemon-reload
```

### Windows (예약된 작업)

기본 작업 이름은 `OpenClaw Gateway` (또는 `OpenClaw Gateway (<profile>)`).
작업 스크립트는 상태 디렉터리 아래에 있습니다.

```powershell
schtasks /Delete /F /TN "OpenClaw Gateway"
Remove-Item -Force "$env:USERPROFILE\.openclaw\gateway.cmd"
```

프로파일을 사용한 경우 일치하는 작업 이름과 `~\.openclaw-<profile>\gateway.cmd`를 삭제합니다.

## 일반 설치 vs 소스 체크아웃

### 일반 설치 (install.sh / npm / pnpm / bun)

`https://openclaw.ai/install.sh` 또는 `install.ps1`을 사용한 경우 CLI는 `npm install -g openclaw@latest`로 설치되었습니다.
`npm rm -g openclaw`로 제거합니다 (해당 방법으로 설치한 경우 `pnpm remove -g` / `bun remove -g`).

### 소스 체크아웃 (git clone)

저장소 체크아웃(`git clone` + `openclaw ...` / `bun run openclaw ...`)에서 실행하는 경우:

1. 저장소를 삭제하기 **전에** 게이트웨이 서비스를 제거합니다 (위의 간편 경로 또는 수동 서비스 제거 사용).
2. 저장소 디렉터리를 삭제합니다.
3. 위에 표시된 대로 상태 및 작업 공간을 제거합니다.
