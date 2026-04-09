---
summary: "Nix를 사용하여 선언적으로 OpenClaw 설치"
read_when:
  - 재현 가능하고 롤백 가능한 설치를 원하는 경우
  - 이미 Nix/NixOS/Home Manager를 사용 중인 경우
  - 모든 것을 고정하고 선언적으로 관리하려는 경우
title: "Nix"
---

# Nix 설치

**[nix-openclaw](https://github.com/openclaw/nix-openclaw)**를 사용하여 선언적으로 OpenClaw를 설치합니다 -- 배터리가 포함된 Home Manager 모듈.

<Info>
[nix-openclaw](https://github.com/openclaw/nix-openclaw) 저장소는 Nix 설치의 단일 진실 공급원입니다. 이 페이지는 간략한 개요입니다.
</Info>

## 제공 내용

- Gateway + macOS 앱 + 도구 (whisper, spotify, cameras) -- 모두 고정됨
- 재부팅 후에도 유지되는 Launchd 서비스
- 선언적 구성이 포함된 플러그인 시스템
- 즉각적인 롤백: `home-manager switch --rollback`

## 빠른 시작

<Steps>
  <Step title="Determinate Nix 설치">
    Nix가 아직 설치되지 않은 경우 [Determinate Nix 설치 프로그램](https://github.com/DeterminateSystems/nix-installer) 지침을 따릅니다.
  </Step>
  <Step title="로컬 플레이크 생성">
    nix-openclaw 저장소의 에이전트 우선 템플릿을 사용합니다:
    ```bash
    mkdir -p ~/code/openclaw-local
    # nix-openclaw 저장소에서 templates/agent-first/flake.nix 복사
    ```
  </Step>
  <Step title="시크릿 구성">
    메시징 봇 토큰 및 모델 제공자 API 키를 설정합니다. `~/.secrets/`의 일반 파일로 충분합니다.
  </Step>
  <Step title="템플릿 플레이스홀더 채우기 및 전환">
    ```bash
    home-manager switch
    ```
  </Step>
  <Step title="확인">
    launchd 서비스가 실행 중이고 봇이 메시지에 응답하는지 확인합니다.
  </Step>
</Steps>

전체 모듈 옵션 및 예제는 [nix-openclaw README](https://github.com/openclaw/nix-openclaw)를 참조하십시오.

## Nix 모드 런타임 동작

`OPENCLAW_NIX_MODE=1`이 설정되면(nix-openclaw로 자동 설정) OpenClaw는 자동 설치 흐름을 비활성화하는 결정론적 모드에 진입합니다.

수동으로 설정할 수도 있습니다:

```bash
export OPENCLAW_NIX_MODE=1
```

macOS에서 GUI 앱은 셸 환경 변수를 자동으로 상속하지 않습니다. 대신 defaults를 통해 Nix 모드를 활성화합니다:

```bash
defaults write ai.openclaw.mac openclaw.nixMode -bool true
```

### Nix 모드에서 변경되는 사항

- 자동 설치 및 자기 변경 흐름이 비활성화됩니다
- 누락된 종속성이 Nix 전용 수정 메시지를 표시합니다
- UI가 읽기 전용 Nix 모드 배너를 표시합니다

### 구성 및 상태 경로

OpenClaw는 `OPENCLAW_CONFIG_PATH`에서 JSON5 구성을 읽고 변경 가능한 데이터를 `OPENCLAW_STATE_DIR`에 저장합니다. Nix에서 실행할 때 런타임 상태와 구성이 불변 저장소를 벗어나도록 Nix 관리 위치로 이것들을 명시적으로 설정합니다.

| 변수                   | 기본값                                  |
| ---------------------- | --------------------------------------- |
| `OPENCLAW_HOME`        | `HOME` / `USERPROFILE` / `os.homedir()` |
| `OPENCLAW_STATE_DIR`   | `~/.openclaw`                           |
| `OPENCLAW_CONFIG_PATH` | `$OPENCLAW_STATE_DIR/openclaw.json`     |

## 관련 항목

- [nix-openclaw](https://github.com/openclaw/nix-openclaw) -- 전체 설정 가이드
- [마법사](/start/wizard) -- Nix를 사용하지 않는 CLI 설정
- [Docker](/install/docker) -- 컨테이너화된 설정
