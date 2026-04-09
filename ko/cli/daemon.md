---
summary: "`openclaw daemon`에 대한 CLI 참조 (게이트웨이 서비스 관리를 위한 레거시 별칭)"
read_when:
  - 스크립트에서 여전히 `openclaw daemon ...`을 사용하는 경우
  - 서비스 라이프사이클 명령 (install/start/stop/restart/status)이 필요한 경우
title: "daemon"
---

# `openclaw daemon`

Gateway 서비스 관리 명령을 위한 레거시 별칭.

`openclaw daemon ...`은 `openclaw gateway ...` 서비스 명령과 동일한 서비스 제어 표면에 매핑됩니다.

## 사용법

```bash
openclaw daemon status
openclaw daemon install
openclaw daemon start
openclaw daemon stop
openclaw daemon restart
openclaw daemon uninstall
```

## 하위 명령

- `status`: 서비스 설치 상태 표시 및 Gateway 상태 프로브
- `install`: 서비스 설치 (`launchd`/`systemd`/`schtasks`)
- `uninstall`: 서비스 제거
- `start`: 서비스 시작
- `stop`: 서비스 중지
- `restart`: 서비스 재시작

## 일반 옵션

- `status`: `--url`, `--token`, `--password`, `--timeout`, `--no-probe`, `--require-rpc`, `--deep`, `--json`
- `install`: `--port`, `--runtime <node|bun>`, `--token`, `--force`, `--json`
- 라이프사이클 (`uninstall|start|stop|restart`): `--json`

참고사항:

- `status`는 프로브 인증이 가능한 경우 구성된 인증 SecretRef를 확인합니다.
- 이 명령 경로에서 필수 인증 SecretRef가 확인되지 않은 경우 프로브 연결/인증이 실패할 때 `daemon status --json`은 `rpc.authWarning`을 보고합니다. `--token`/`--password`를 명시적으로 전달하거나 먼저 비밀 소스를 확인하세요.
- 프로브가 성공하면 확인되지 않은 인증 ref 경고는 거짓 양성을 방지하기 위해 억제됩니다.
- `status --deep`은 최선의 시스템 수준 서비스 스캔을 추가합니다. 다른 게이트웨이 유사 서비스를 발견하면 사람이 읽을 수 있는 출력은 정리 힌트를 출력하고 머신당 하나의 게이트웨이가 여전히 일반적인 권장 사항임을 경고합니다.
- Linux systemd 설치에서 `status` 토큰 드리프트 검사에는 `Environment=` 및 `EnvironmentFile=` 단위 소스가 모두 포함됩니다.
- 드리프트 검사는 서비스 명령 env 우선, 그 다음 프로세스 env 폴백의 병합된 런타임 env를 사용하여 `gateway.auth.token` SecretRef를 확인합니다.
- 토큰 인증이 효과적으로 활성화되지 않은 경우 (명시적 `gateway.auth.mode`가 `password`/`none`/`trusted-proxy`이거나, 비밀번호가 이길 수 있고 토큰 후보가 이길 수 없는 모드가 설정되지 않은 경우) 토큰 드리프트 검사는 구성 토큰 확인을 건너뜁니다.
- 토큰 인증에 토큰이 필요하고 `gateway.auth.token`이 SecretRef 관리인 경우 `install`은 SecretRef가 확인 가능한지 검증하지만 확인된 토큰을 서비스 환경 메타데이터에 유지하지 않습니다.
- 토큰 인증에 토큰이 필요하고 구성된 토큰 SecretRef가 확인되지 않으면 설치가 실패 처리됩니다.
- `gateway.auth.token`과 `gateway.auth.password`가 모두 구성되고 `gateway.auth.mode`가 설정되지 않은 경우 모드가 명시적으로 설정될 때까지 설치가 차단됩니다.
- 하나의 호스트에서 의도적으로 여러 게이트웨이를 실행하는 경우 포트, 구성/상태, 워크스페이스를 격리하세요. [/gateway#multiple-gateways-same-host](/gateway/#multiple-gateways-same-host)를 참조하세요.

## 권장 사항

현재 문서 및 예시는 [`openclaw gateway`](/cli/gateway)를 사용하세요.
