---
summary: "OpenClaw 에이전트용 관리형 샌드박스 백엔드로 OpenShell 사용"
title: OpenShell
read_when:
  - 로컬 Docker 대신 클라우드 관리형 샌드박스를 사용하고 싶을 때
  - OpenShell 플러그인을 설정할 때
  - mirror와 remote 워크스페이스 모드 중 선택이 필요할 때
---

OpenShell은 OpenClaw용 관리형 샌드박스 백엔드입니다. Docker 컨테이너를
로컬에서 실행하는 대신, OpenClaw는 샌드박스 라이프사이클을 `openshell` CLI에
위임하며, 이 CLI는 SSH 기반 명령 실행이 가능한 원격 환경을 프로비저닝합니다.

OpenShell 플러그인은 일반 [SSH 백엔드](/gateway/sandboxing#ssh-backend)와 동일한
core SSH 전송 계층과 원격 파일시스템 브리지를 재사용합니다. 여기에 OpenShell
고유의 라이프사이클(`sandbox create/get/delete`, `sandbox ssh-config`)과 선택적
`mirror` 워크스페이스 모드가 추가됩니다.

## 사전 준비

- `openshell` CLI가 설치되어 `PATH`에 등록되어 있어야 함 (또는
  `plugins.entries.openshell.config.command`로 사용자 정의 경로 설정)
- 샌드박스 접근 권한이 있는 OpenShell 계정
- 호스트에서 실행 중인 OpenClaw Gateway

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

2. Gateway를 재시작합니다. 다음 에이전트 턴에서 OpenClaw가 OpenShell
   샌드박스를 생성하고 툴 실행을 그 샌드박스로 라우팅합니다.

3. 확인:

```bash
openclaw sandbox list
openclaw sandbox explain
```

## 워크스페이스 모드

OpenShell을 사용할 때 가장 중요한 결정 사항입니다.

### `mirror`

**로컬 워크스페이스를 정본(canonical)으로 유지**하고 싶을 때
`plugins.entries.openshell.config.mode: "mirror"`를 사용하십시오.

동작 방식:

- `exec` 이전에 OpenClaw가 로컬 워크스페이스를 OpenShell 샌드박스로 동기화합니다.
- `exec` 이후에 OpenClaw가 원격 워크스페이스를 로컬 워크스페이스로 다시 동기화합니다.
- 파일 툴은 여전히 샌드박스 브리지를 통해 작동하지만, 턴 사이에는 로컬
  워크스페이스가 진실의 원천(source of truth)으로 유지됩니다.

다음에 적합합니다:

- OpenClaw 외부에서 로컬로 파일을 편집하고, 그 변경 사항이 샌드박스에
  자동으로 반영되기를 원하는 경우.
- OpenShell 샌드박스가 가능한 한 Docker 백엔드처럼 동작하기를 원하는 경우.
- 각 exec 턴 이후 호스트 워크스페이스가 샌드박스 쓰기를 반영하기를 원하는 경우.

트레이드오프: 각 exec 전후에 추가 동기화 비용이 발생합니다.

### `remote`

**OpenShell 워크스페이스를 정본(canonical)으로** 사용하고 싶을 때
`plugins.entries.openshell.config.mode: "remote"`를 사용하십시오.

동작 방식:

- 샌드박스가 처음 생성될 때, OpenClaw가 로컬 워크스페이스로부터 원격
  워크스페이스를 한 번 시드(seed)합니다.
- 이후에는 `exec`, `read`, `write`, `edit`, `apply_patch`가 원격 OpenShell
  워크스페이스를 대상으로 직접 동작합니다.
- OpenClaw는 원격 변경 사항을 로컬 워크스페이스로 **다시 동기화하지 않습니다**.
- 파일과 미디어 툴이 샌드박스 브리지를 통해 읽기 때문에 프롬프트 시점의
  미디어 읽기는 계속 동작합니다.

다음에 적합합니다:

- 샌드박스가 주로 원격 쪽에 존재해야 하는 경우.
- 턴당 동기화 오버헤드를 낮추고 싶은 경우.
- 호스트 로컬 편집이 원격 샌드박스 상태를 조용히 덮어쓰지 않기를 원하는 경우.

중요: 초기 시드 이후 호스트에서 OpenClaw 외부로 파일을 편집하면, 원격
샌드박스는 그 변경 사항을 **보지 못합니다**. 다시 시드하려면
`openclaw sandbox recreate`를 사용하십시오.

### 모드 선택

|                            | `mirror`                   | `remote`                  |
| -------------------------- | -------------------------- | ------------------------- |
| **정본 워크스페이스**      | 로컬 호스트                | 원격 OpenShell            |
| **동기화 방향**            | 양방향 (각 exec마다)       | 일회성 시드               |
| **턴당 오버헤드**          | 높음 (업로드 + 다운로드)   | 낮음 (직접 원격 작업)     |
| **로컬 편집 가시성?**      | 예, 다음 exec에서          | 아니요, recreate 전까지   |
| **적합한 용도**            | 개발 워크플로우            | 장기 에이전트, CI         |

## 구성 레퍼런스

모든 OpenShell 구성은 `plugins.entries.openshell.config` 아래에 위치합니다:

| 키                        | 타입                       | 기본값        | 설명                                                    |
| ------------------------- | -------------------------- | ------------- | ------------------------------------------------------- |
| `mode`                    | `"mirror"` 또는 `"remote"` | `"mirror"`    | 워크스페이스 동기화 모드                                |
| `command`                 | `string`                   | `"openshell"` | `openshell` CLI의 경로 또는 이름                        |
| `from`                    | `string`                   | `"openclaw"`  | 최초 생성 시 샌드박스 소스                              |
| `gateway`                 | `string`                   | —             | OpenShell gateway 이름 (`--gateway`)                    |
| `gatewayEndpoint`         | `string`                   | —             | OpenShell gateway 엔드포인트 URL (`--gateway-endpoint`) |
| `policy`                  | `string`                   | —             | 샌드박스 생성용 OpenShell 정책 ID                       |
| `providers`               | `string[]`                 | `[]`          | 샌드박스 생성 시 연결할 provider 이름                   |
| `gpu`                     | `boolean`                  | `false`       | GPU 리소스 요청                                         |
| `autoProviders`           | `boolean`                  | `true`        | 샌드박스 생성 중 `--auto-providers` 전달                |
| `remoteWorkspaceDir`      | `string`                   | `"/sandbox"`  | 샌드박스 내부 주요 쓰기 가능 워크스페이스               |
| `remoteAgentWorkspaceDir` | `string`                   | `"/agent"`    | 에이전트 워크스페이스 마운트 경로 (읽기 전용 접근용)    |
| `timeoutSeconds`          | `number`                   | `120`         | `openshell` CLI 작업의 타임아웃                         |

샌드박스 레벨 설정(`mode`, `scope`, `workspaceAccess`)은 다른 백엔드와 마찬가지로
`agents.defaults.sandbox` 아래에 구성합니다. 전체 매트릭스는
[샌드박싱](/gateway/sandboxing)을 참조하십시오.

## 예시

### 최소 remote 설정

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

### GPU가 포함된 Mirror 모드

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

### 사용자 정의 gateway를 사용하는 에이전트별 OpenShell

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
# 모든 샌드박스 런타임 나열 (Docker + OpenShell)
openclaw sandbox list

# 적용 중인 정책 확인
openclaw sandbox explain

# 재생성 (원격 워크스페이스 삭제, 다음 사용 시 재시드)
openclaw sandbox recreate --all
```

`remote` 모드에서는 **recreate가 특히 중요합니다**: 해당 스코프의 정본 원격
워크스페이스를 삭제합니다. 다음 사용 시 로컬 워크스페이스로부터 새로운 원격
워크스페이스를 시드합니다.

`mirror` 모드에서는 로컬 워크스페이스가 정본으로 유지되기 때문에 recreate가
주로 원격 실행 환경을 리셋하는 역할을 합니다.

### 언제 recreate를 해야 하는가

다음 항목 중 하나라도 변경한 후에는 recreate하십시오:

- `agents.defaults.sandbox.backend`
- `plugins.entries.openshell.config.from`
- `plugins.entries.openshell.config.mode`
- `plugins.entries.openshell.config.policy`

```bash
openclaw sandbox recreate --all
```

## 보안 강화

OpenShell은 워크스페이스 루트 fd를 고정(pin)하고 각 읽기 전에 샌드박스 신원을
재확인하므로, 심볼릭 링크 교체나 워크스페이스 재마운트가 의도된 원격
워크스페이스 바깥으로 읽기를 리다이렉트할 수 없습니다.

## 현재 제한 사항

- OpenShell 백엔드에서는 샌드박스 브라우저가 지원되지 않습니다.
- `sandbox.docker.binds`는 OpenShell에 적용되지 않습니다.
- `sandbox.docker.*` 아래의 Docker 전용 런타임 설정은 Docker 백엔드에만
  적용됩니다.

## 동작 원리

1. OpenClaw가 `openshell sandbox create`를 호출합니다 (구성된 대로 `--from`,
   `--gateway`, `--policy`, `--providers`, `--gpu` 플래그 사용).
2. OpenClaw가 `openshell sandbox ssh-config <name>`을 호출하여 샌드박스의 SSH
   연결 세부 정보를 가져옵니다.
3. Core가 SSH 구성을 임시 파일에 기록하고, 일반 SSH 백엔드와 동일한 원격
   파일시스템 브리지를 사용해 SSH 세션을 엽니다.
4. `mirror` 모드: exec 전에 로컬 → 원격 동기화, 실행, exec 후에 다시 동기화.
5. `remote` 모드: 생성 시 한 번 시드하고, 이후에는 원격 워크스페이스에서
   직접 동작.

## 관련 문서

- [샌드박싱](/gateway/sandboxing) -- 모드, 스코프, 백엔드 비교
- [Sandbox vs Tool Policy vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated) -- 차단된 툴 디버깅
- [다중 에이전트 샌드박스와 툴](/tools/multi-agent-sandbox-tools) -- 에이전트별 재정의
- [Sandbox CLI](/cli/sandbox) -- `openclaw sandbox` 명령어
