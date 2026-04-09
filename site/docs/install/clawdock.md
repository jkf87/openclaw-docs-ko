---
title: "ClawDock"
description: "Docker 기반 OpenClaw 설치를 위한 ClawDock 셸 헬퍼"
---

# ClawDock

ClawDock은 Docker 기반 OpenClaw 설치를 위한 소형 셸 헬퍼 레이어입니다.

더 긴 `docker compose ...` 호출 대신 `clawdock-start`, `clawdock-dashboard`, `clawdock-fix-token`과 같은 짧은 명령을 제공합니다.

아직 Docker를 설정하지 않았다면 [Docker](/install/docker)부터 시작하십시오.

## 설치

정식 헬퍼 경로를 사용합니다:

```bash
mkdir -p ~/.clawdock && curl -sL https://raw.githubusercontent.com/openclaw/openclaw/main/scripts/clawdock/clawdock-helpers.sh -o ~/.clawdock/clawdock-helpers.sh
echo 'source ~/.clawdock/clawdock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

이전에 `scripts/shell-helpers/clawdock-helpers.sh`에서 ClawDock을 설치했다면 새 `scripts/clawdock/clawdock-helpers.sh` 경로에서 재설치하십시오. 이전 raw GitHub 경로는 삭제되었습니다.

## 제공 내용

### 기본 작업

| 명령어             | 설명                   |
| ------------------ | ---------------------- |
| `clawdock-start`   | 게이트웨이 시작        |
| `clawdock-stop`    | 게이트웨이 중지        |
| `clawdock-restart` | 게이트웨이 재시작      |
| `clawdock-status`  | 컨테이너 상태 확인     |
| `clawdock-logs`    | 게이트웨이 로그 팔로우 |

### 컨테이너 액세스

| 명령어                    | 설명                                              |
| ------------------------- | ------------------------------------------------- |
| `clawdock-shell`          | 게이트웨이 컨테이너 내부에서 셸 열기             |
| `clawdock-cli &lt;command&gt;`  | Docker에서 OpenClaw CLI 명령 실행                |
| `clawdock-exec &lt;command&gt;` | 컨테이너에서 임의 명령 실행                      |

### Web UI 및 페어링

| 명령어                  | 설명                         |
| ----------------------- | ---------------------------- |
| `clawdock-dashboard`    | Control UI URL 열기          |
| `clawdock-devices`      | 보류 중인 장치 페어링 목록   |
| `clawdock-approve &lt;id&gt;` | 페어링 요청 승인             |

### 설정 및 유지 관리

| 명령어               | 설명                                             |
| -------------------- | ------------------------------------------------ |
| `clawdock-fix-token` | 컨테이너 내부에서 게이트웨이 토큰 구성           |
| `clawdock-update`    | 풀, 재빌드 및 재시작                             |
| `clawdock-rebuild`   | Docker 이미지만 재빌드                           |
| `clawdock-clean`     | 컨테이너 및 볼륨 제거                            |

### 유틸리티

| 명령어                 | 설명                                    |
| ---------------------- | --------------------------------------- |
| `clawdock-health`      | 게이트웨이 상태 확인 실행               |
| `clawdock-token`       | 게이트웨이 토큰 출력                    |
| `clawdock-cd`          | OpenClaw 프로젝트 디렉터리로 이동       |
| `clawdock-config`      | `~/.openclaw` 열기                      |
| `clawdock-show-config` | 값이 숨겨진 구성 파일 출력              |
| `clawdock-workspace`   | 작업 공간 디렉터리 열기                 |

## 최초 실행 흐름

```bash
clawdock-start
clawdock-fix-token
clawdock-dashboard
```

브라우저에서 페어링이 필요하다고 표시되는 경우:

```bash
clawdock-devices
clawdock-approve &lt;request-id&gt;
```

## 구성 및 시크릿

ClawDock은 [Docker](/install/docker)에 설명된 동일한 Docker 구성 분할로 작동합니다:

- `&lt;project&gt;/.env` -- 이미지 이름, 포트 및 게이트웨이 토큰과 같은 Docker 전용 값
- `~/.openclaw/.env` -- 환경 변수로 지원되는 제공자 키 및 봇 토큰
- `~/.openclaw/agents/&lt;agentId&gt;/agent/auth-profiles.json` -- 저장된 제공자 OAuth/API 키 인증
- `~/.openclaw/openclaw.json` -- 동작 구성

출력에서 `.env` 값을 숨기고 `.env` 파일과 `openclaw.json`을 빠르게 검사하려면 `clawdock-show-config`를 사용하십시오.

## 관련 페이지

- [Docker](/install/docker)
- [Docker VM 런타임](/install/docker-vm-runtime)
- [업데이트](/install/updating)
