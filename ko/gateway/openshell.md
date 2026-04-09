---
title: OpenShell
summary: "OpenClaw 에이전트의 관리형 샌드박스 백엔드로 OpenShell 사용"
read_when:
  - 로컬 Docker 대신 클라우드 관리형 샌드박스를 원할 때
  - OpenShell 플러그인을 설정할 때
  - mirror 및 remote 워크스페이스 모드 중 선택이 필요할 때
---

# OpenShell

OpenShell은 OpenClaw의 관리형 샌드박스 백엔드입니다. Docker 컨테이너를 로컬에서 실행하는 대신, OpenClaw는 샌드박스 라이프사이클을 `openshell` CLI에 위임하며, 이는 SSH 기반 명령 실행으로 원격 환경을 프로비저닝합니다.

OpenShell 플러그인은 일반 [SSH 백엔드](/gateway/sandboxing#ssh-backend)와 동일한 핵심 SSH 전송 및 원격 파일 시스템 브리지를 재사용합니다. OpenShell 특화 라이프사이클(`sandbox create/get/delete`, `sandbox ssh-config`)과 선택적 `mirror` 워크스페이스 모드를 추가합니다.

## 사전 요구 사항

- `openshell` CLI가 설치되고 `PATH`에 있어야 합니다 (또는 `plugins.entries.openshell.config.command`를 통해 사용자 지정 경로 설정)
- 샌드박스 액세스가 있는 OpenShell 계정
- 호스트에서 실행 중인 OpenClaw 게이트웨이

## 빠른 시작

1. 플러그인을 활성화하고 샌드박스 백엔드를 설정합니다:

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        backend: "openshell",
        scope: "session",
        workspaceAccess: "rw",
      },
    },
  },
  plugins: {
    entries: {
      openshell: {
        enabled: true,
        config: {
          from: "openclaw",
          mode: "remote",
        },
      },
    },
  },
}
```

2. 게이트웨이를 재시작합니다. 다음 에이전트 턴에서 OpenClaw는 OpenShell 샌드박스를 생성하고 도구 실행을 통해 라우팅합니다.

3. 확인합니다:

```bash
openclaw sandbox list
openclaw sandbox explain
```

## 워크스페이스 모드

OpenShell 사용 시 가장 중요한 결정입니다.

### `mirror`

**로컬 워크스페이스를 정식으로 유지하고 싶을 때** `plugins.entries.openshell.config.mode: "mirror"`를 사용합니다.

동작:

- `exec` 전에 OpenClaw는 로컬 워크스페이스를 OpenShell 샌드박스에 동기화합니다.
- `exec` 후에 OpenClaw는 원격 워크스페이스를 로컬 워크스페이스로 다시 동기화합니다.
- 파일 도구는 여전히 샌드박스 브리지를 통해 작동하지만 로컬 워크스페이스는 턴 간 신뢰 소스로 유지됩니다.

적합한 경우:

- OpenClaw 외부에서 로컬로 파일을 편집하고 해당 변경 사항이 샌드박스에서 자동으로 표시되기를 원할 때.
- OpenShell 샌드박스가 Docker 백엔드처럼 작동하기를 원할 때.
- 각 exec 턴 후 샌드박스 쓰기를 호스트 워크스페이스에 반영하고 싶을 때.

절충점: 각 exec 전후에 추가 동기화 비용이 있습니다.

### `remote`

**OpenShell 워크스페이스를 정식으로 만들고 싶을 때** `plugins.entries.openshell.config.mode: "remote"`를 사용합니다.

동작:

- 샌드박스가 처음 생성될 때 OpenClaw는 로컬 워크스페이스에서 원격 워크스페이스를 한 번 시딩합니다.
- 그 후 `exec`, `read`, `write`, `edit`, `apply_patch`는 원격 OpenShell 워크스페이스에 직접 작동합니다.
- OpenClaw는 원격 변경 사항을 로컬 워크스페이스로 다시 동기화하지 **않습니다**.

적합한 경우:

- 샌드박스가 주로 원격 측에 있어야 할 때.
- 낮은 턴별 동기화 오버헤드를 원할 때.
- 호스트 로컬 편집이 원격 샌드박스 상태를 조용히 덮어쓰는 것을 원하지 않을 때.

중요: 초기 시드 후 OpenClaw 외부에서 호스트의 파일을 편집하면 원격 샌드박스는 해당 변경 사항을 보지 **못합니다**. `openclaw sandbox recreate`를 사용하여 다시 시딩합니다.

### 모드 선택

|                          | `mirror`                   | `remote`                  |
| ------------------------ | -------------------------- | ------------------------- |
| **정식 워크스페이스**  | 로컬 호스트                | 원격 OpenShell          |
| **동기화 방향**       | 양방향 (각 exec)          | 일회성 시딩             |
| **턴별 오버헤드**    | 높음 (업로드 + 다운로드) | 낮음 (직접 원격 작업) |
| **로컬 편집 가시성?** | 예, 다음 exec에서          | 아니오, recreate 때까지  |
| **적합한 경우**             | 개발 워크플로우      | 장시간 실행 에이전트, CI   |

## 구성 참조

모든 OpenShell 구성은 `plugins.entries.openshell.config` 아래에 있습니다:

| 키                       | 유형                     | 기본값       | 설명                                           |
| ------------------------- | ------------------------ | ------------- | ----------------------------------------------------- |
| `mode`                    | `"mirror"` 또는 `"remote"` | `"mirror"`    | 워크스페이스 동기화 모드                                   |
| `command`                 | `string`                 | `"openshell"` | `openshell` CLI의 경로 또는 이름                   |
| `from`                    | `string`                 | `"openclaw"`  | 최초 생성 시 샌드박스 소스                  |
| `gateway`                 | `string`                 | —             | OpenShell 게이트웨이 이름 (`--gateway`)                  |
| `gatewayEndpoint`         | `string`                 | —             | OpenShell 게이트웨이 엔드포인트 URL (`--gateway-endpoint`) |
| `policy`                  | `string`                 | —             | 샌드박스 생성을 위한 OpenShell 정책 ID              |
| `providers`               | `string[]`               | `[]`          | 샌드박스 생성 시 첨부할 프로바이더 이름      |
| `gpu`                     | `boolean`                | `false`       | GPU 리소스 요청                                 |
| `autoProviders`           | `boolean`                | `true`        | 샌드박스 생성 시 `--auto-providers` 전달         |
| `remoteWorkspaceDir`      | `string`                 | `"/sandbox"`  | 샌드박스 내부의 기본 쓰기 가능 워크스페이스         |
| `remoteAgentWorkspaceDir` | `string`                 | `"/agent"`    | 에이전트 워크스페이스 마운트 경로 (읽기 전용 액세스)     |
| `timeoutSeconds`          | `number`                 | `120`         | `openshell` CLI 작업 타임아웃                |

샌드박스 수준 설정(`mode`, `scope`, `workspaceAccess`)은 모든 백엔드와 마찬가지로 `agents.defaults.sandbox` 아래에 구성됩니다. 전체 매트릭스는 [샌드박싱](/gateway/sandboxing)을 참조하십시오.

## 예제

### 최소 원격 설정

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        backend: "openshell",
      },
    },
  },
  plugins: {
    entries: {
      openshell: {
        enabled: true,
        config: {
          from: "openclaw",
          mode: "remote",
        },
      },
    },
  },
}
```

### GPU를 사용한 mirror 모드

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        backend: "openshell",
        scope: "agent",
        workspaceAccess: "rw",
      },
    },
  },
  plugins: {
    entries: {
      openshell: {
        enabled: true,
        config: {
          from: "openclaw",
          mode: "mirror",
          gpu: true,
          providers: ["openai"],
          timeoutSeconds: 180,
        },
      },
    },
  },
}
```

### 사용자 지정 게이트웨이를 사용한 에이전트별 OpenShell

```json5
{
  agents: {
    defaults: {
      sandbox: { mode: "off" },
    },
    list: [
      {
        id: "researcher",
        sandbox: {
          mode: "all",
          backend: "openshell",
          scope: "agent",
          workspaceAccess: "rw",
        },
      },
    ],
  },
  plugins: {
    entries: {
      openshell: {
        enabled: true,
        config: {
          from: "openclaw",
          mode: "remote",
          gateway: "lab",
          gatewayEndpoint: "https://lab.example",
          policy: "strict",
        },
      },
    },
  },
}
```

## 라이프사이클 관리

OpenShell 샌드박스는 일반 샌드박스 CLI를 통해 관리됩니다:

```bash
# 모든 샌드박스 런타임 목록 (Docker + OpenShell)
openclaw sandbox list

# 효과적인 정책 검사
openclaw sandbox explain

# 재생성 (원격 워크스페이스 삭제, 다음 사용 시 다시 시딩)
openclaw sandbox recreate --all
```

`remote` 모드의 경우, **recreate가 특히 중요합니다**: 해당 범위의 정식 원격 워크스페이스를 삭제합니다. 다음 사용 시 로컬 워크스페이스에서 새 원격 워크스페이스를 시딩합니다.

### 재생성 시기

다음 중 하나를 변경한 후 재생성합니다:

- `agents.defaults.sandbox.backend`
- `plugins.entries.openshell.config.from`
- `plugins.entries.openshell.config.mode`
- `plugins.entries.openshell.config.policy`

```bash
openclaw sandbox recreate --all
```

## 현재 제한 사항

- 샌드박스 브라우저는 OpenShell 백엔드에서 지원되지 않습니다.
- `sandbox.docker.binds`는 OpenShell에 적용되지 않습니다.
- `sandbox.docker.*` 아래의 Docker 특화 런타임 설정은 Docker 백엔드에만 적용됩니다.

## 작동 방식

1. OpenClaw는 `openshell sandbox create`를 호출합니다 (구성에 따라 `--from`, `--gateway`, `--policy`, `--providers`, `--gpu` 플래그 포함).
2. OpenClaw는 `openshell sandbox ssh-config <name>`을 호출하여 샌드박스의 SSH 연결 세부 정보를 가져옵니다.
3. 코어는 SSH 구성을 임시 파일에 쓰고 일반 SSH 백엔드와 동일한 원격 파일 시스템 브리지를 사용하여 SSH 세션을 엽니다.
4. `mirror` 모드에서: exec 전에 로컬에서 원격으로 동기화하고, 실행하고, exec 후에 다시 동기화합니다.
5. `remote` 모드에서: 생성 시 한 번 시딩한 다음 원격 워크스페이스에서 직접 작동합니다.

## 참조

- [샌드박싱](/gateway/sandboxing) -- 모드, 범위, 백엔드 비교
- [샌드박스 vs 도구 정책 vs 상승된 권한](/gateway/sandbox-vs-tool-policy-vs-elevated) -- 차단된 도구 디버깅
- [멀티 에이전트 샌드박스 및 도구](/tools/multi-agent-sandbox-tools) -- 에이전트별 재정의
- [샌드박스 CLI](/cli/sandbox) -- `openclaw sandbox` 명령
