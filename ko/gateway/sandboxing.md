---
summary: "OpenClaw 샌드박싱 작동 방식: 모드, 범위, 워크스페이스 접근, 이미지"
title: 샌드박싱
read_when: "샌드박싱에 대한 전용 설명을 원하거나 agents.defaults.sandbox를 튜닝해야 할 때."
status: active
---

OpenClaw는 영향 범위(blast radius)를 줄이기 위해 **툴을 sandbox 백엔드 내부에서 실행**할 수 있습니다.
이는 **선택 사항**이며 구성(`agents.defaults.sandbox` 또는
`agents.list[].sandbox`)으로 제어됩니다. 샌드박싱이 꺼져 있으면, 툴은 호스트에서 실행됩니다.
Gateway는 호스트에 남아 있습니다; 활성화된 경우 툴 실행은 격리된 sandbox에서
이루어집니다.

이것은 완벽한 보안 경계는 아니지만, 모델이 멍청한 짓을 할 때
파일 시스템 및 프로세스 접근을 실질적으로 제한합니다.

## 샌드박싱되는 대상

- 툴 실행(`exec`, `read`, `write`, `edit`, `apply_patch`, `process` 등).
- 선택적 샌드박싱된 브라우저(`agents.defaults.sandbox.browser`).
  - 기본적으로, 브라우저 툴이 필요로 할 때 sandbox 브라우저가 자동 시작됩니다(CDP가 도달 가능하도록 보장).
    `agents.defaults.sandbox.browser.autoStart` 및 `agents.defaults.sandbox.browser.autoStartTimeoutMs`로 구성합니다.
  - 기본적으로, sandbox 브라우저 컨테이너는 전역 `bridge` 네트워크 대신 전용 Docker 네트워크(`openclaw-sandbox-browser`)를 사용합니다.
    `agents.defaults.sandbox.browser.network`로 구성합니다.
  - 선택적 `agents.defaults.sandbox.browser.cdpSourceRange`는 CIDR allowlist로 컨테이너 엣지 CDP 수신을 제한합니다(예: `172.21.0.1/32`).
  - noVNC 관찰자 접근은 기본적으로 비밀번호로 보호됩니다; OpenClaw는 로컬 부트스트랩 페이지를 제공하고 URL fragment(쿼리/헤더 로그 아님)에 비밀번호와 함께 noVNC를 여는 단기 토큰 URL을 발행합니다.
  - `agents.defaults.sandbox.browser.allowHostControl`은 샌드박싱된 세션이 호스트 브라우저를 명시적으로 타겟팅할 수 있도록 합니다.
  - 선택적 allowlist는 `target: "custom"`을 게이팅합니다: `allowedControlUrls`, `allowedControlHosts`, `allowedControlPorts`.

샌드박싱되지 않는 대상:

- Gateway 프로세스 자체.
- sandbox 외부에서 실행이 명시적으로 허용된 툴(예: `tools.elevated`).
  - **Elevated exec는 샌드박싱을 우회하며 구성된 escape 경로(기본값은 `gateway`, exec 타겟이 `node`인 경우 `node`)를 사용합니다.**
  - 샌드박싱이 꺼져 있으면, `tools.elevated`는 실행을 변경하지 않습니다(이미 호스트에 있음). [Elevated 모드](/tools/elevated)를 참조하십시오.

## 모드

`agents.defaults.sandbox.mode`는 샌드박싱이 **언제** 사용되는지 제어합니다:

- `"off"`: 샌드박싱 없음.
- `"non-main"`: **non-main** 세션만 sandbox(호스트에서 일반 채팅을 원하는 경우 기본값).
- `"all"`: 모든 세션이 sandbox에서 실행됩니다.
  참고: `"non-main"`은 agent id가 아닌 `session.mainKey`(기본값 `"main"`)를 기반으로 합니다.
  Group/channel 세션은 자체 키를 사용하므로 non-main으로 계산되어 샌드박싱됩니다.

## 범위 (Scope)

`agents.defaults.sandbox.scope`는 **생성되는 컨테이너 수**를 제어합니다:

- `"agent"` (기본값): agent당 하나의 컨테이너.
- `"session"`: 세션당 하나의 컨테이너.
- `"shared"`: 모든 샌드박싱된 세션이 공유하는 하나의 컨테이너.

## 백엔드

`agents.defaults.sandbox.backend`는 sandbox를 제공하는 **어떤 런타임**을 제어합니다:

- `"docker"` (샌드박싱이 활성화된 경우 기본값): 로컬 Docker 기반 sandbox 런타임.
- `"ssh"`: 일반 SSH 기반 원격 sandbox 런타임.
- `"openshell"`: OpenShell 기반 sandbox 런타임.

SSH 전용 구성은 `agents.defaults.sandbox.ssh` 아래에 있습니다.
OpenShell 전용 구성은 `plugins.entries.openshell.config` 아래에 있습니다.

### 백엔드 선택

|                     | Docker                           | SSH                            | OpenShell                                           |
| ------------------- | -------------------------------- | ------------------------------ | --------------------------------------------------- |
| **실행 위치**       | 로컬 컨테이너                    | SSH로 접근 가능한 모든 호스트  | OpenShell 관리 sandbox                              |
| **설정**            | `scripts/sandbox-setup.sh`       | SSH 키 + 타겟 호스트           | OpenShell 플러그인 활성화                           |
| **워크스페이스 모델** | Bind-mount 또는 복사          | Remote-canonical (한 번 시드)  | `mirror` 또는 `remote`                              |
| **네트워크 제어**   | `docker.network` (기본값: 없음)  | 원격 호스트에 따라 다름        | OpenShell에 따라 다름                               |
| **브라우저 sandbox** | 지원                          | 지원 안 함                     | 아직 지원 안 함                                     |
| **Bind mount**      | `docker.binds`                   | N/A                            | N/A                                                 |
| **최적 용도**       | 로컬 개발, 완전한 격리           | 원격 머신으로 오프로딩         | 선택적 양방향 동기화가 있는 관리 원격 sandbox       |

### Docker 백엔드

샌드박싱은 기본적으로 꺼져 있습니다. 샌드박싱을 활성화하고 백엔드를 선택하지 않으면,
OpenClaw는 Docker 백엔드를 사용합니다. Docker 데몬 소켓(`/var/run/docker.sock`)을 통해
로컬로 툴과 sandbox 브라우저를 실행합니다. Sandbox 컨테이너
격리는 Docker namespace에 의해 결정됩니다.

**Docker-out-of-Docker (DooD) 제약 사항**:
OpenClaw Gateway 자체를 Docker 컨테이너로 배포하는 경우, 호스트의 Docker 소켓(DooD)을 사용하여 형제 sandbox 컨테이너를 오케스트레이션합니다. 이는 특정 경로 매핑 제약을 도입합니다:

- **구성에 호스트 경로 필요**: `openclaw.json`의 `workspace` 구성은 내부 Gateway 컨테이너 경로가 아닌 **호스트의 절대 경로**(예: `/home/user/.openclaw/workspaces`)를 포함해야 합니다. OpenClaw가 Docker 데몬에 sandbox를 spawn하도록 요청하면, 데몬은 Gateway namespace가 아닌 호스트 OS namespace에 상대적으로 경로를 평가합니다.
- **FS Bridge Parity (동일한 볼륨 맵)**: OpenClaw Gateway 네이티브 프로세스는 heartbeat와 bridge 파일도 `workspace` 디렉토리에 씁니다. Gateway가 자체 컨테이너화된 환경 내에서 정확히 동일한 문자열(호스트 경로)을 평가하기 때문에, Gateway 배포는 호스트 namespace를 네이티브로 연결하는 동일한 볼륨 맵(`-v /home/user/.openclaw:/home/user/.openclaw`)을 포함해야 합니다.

절대 호스트 parity 없이 경로를 내부적으로 매핑하면, 완전히 자격된 경로 문자열이 네이티브하게 존재하지 않기 때문에 OpenClaw는 컨테이너 환경 내부에서 heartbeat를 쓰려고 시도할 때 네이티브하게 `EACCES` 권한 오류를 발생시킵니다.

### SSH 백엔드

OpenClaw가 임의의 SSH로 접근 가능한 머신에서 `exec`, 파일 툴, 미디어 읽기를 샌드박싱하길 원할 때 `backend: "ssh"`를
사용하십시오.

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        backend: "ssh",
        scope: "session",
        workspaceAccess: "rw",
        ssh: {
          target: "user@gateway-host:22",
          workspaceRoot: "/tmp/openclaw-sandboxes",
          strictHostKeyChecking: true,
          updateHostKeys: true,
          identityFile: "~/.ssh/id_ed25519",
          certificateFile: "~/.ssh/id_ed25519-cert.pub",
          knownHostsFile: "~/.ssh/known_hosts",
          // Or use SecretRefs / inline contents instead of local files:
          // identityData: { source: "env", provider: "default", id: "SSH_IDENTITY" },
          // certificateData: { source: "env", provider: "default", id: "SSH_CERTIFICATE" },
          // knownHostsData: { source: "env", provider: "default", id: "SSH_KNOWN_HOSTS" },
        },
      },
    },
  },
}
```

작동 방식:

- OpenClaw는 `sandbox.ssh.workspaceRoot` 아래에 범위별 원격 루트를 생성합니다.
- 생성 또는 재생성 후 처음 사용할 때, OpenClaw는 로컬 workspace에서 해당 원격 workspace를 한 번 시드합니다.
- 그 후, `exec`, `read`, `write`, `edit`, `apply_patch`, 프롬프트 미디어 읽기 및 인바운드 미디어 스테이징이 SSH를 통해 원격 workspace에 직접 실행됩니다.
- OpenClaw는 원격 변경 사항을 로컬 workspace로 자동으로 다시 동기화하지 않습니다.

인증 자료:

- `identityFile`, `certificateFile`, `knownHostsFile`: 기존 로컬 파일을 사용하고 OpenSSH 구성을 통해 전달합니다.
- `identityData`, `certificateData`, `knownHostsData`: 인라인 문자열 또는 SecretRef를 사용합니다. OpenClaw는 일반 secrets 런타임 스냅샷을 통해 이를 해석하고, `0600`으로 temp 파일에 쓰며, SSH 세션이 종료되면 삭제합니다.
- 동일한 항목에 대해 `*File`과 `*Data`가 모두 설정된 경우, 해당 SSH 세션에 대해 `*Data`가 우선합니다.

이는 **remote-canonical** 모델입니다. 원격 SSH workspace는 초기 시드 후 실제 sandbox state가 됩니다.

중요한 결과:

- 시드 단계 후 OpenClaw 외부에서 만든 호스트 로컬 편집 사항은 sandbox를 재생성할 때까지 원격에서 보이지 않습니다.
- `openclaw sandbox recreate`는 범위별 원격 루트를 삭제하고 다음 사용 시 로컬에서 다시 시드합니다.
- 브라우저 샌드박싱은 SSH 백엔드에서 지원되지 않습니다.
- `sandbox.docker.*` 설정은 SSH 백엔드에 적용되지 않습니다.

### OpenShell 백엔드

OpenClaw가 OpenShell 관리 원격 환경에서 툴을 샌드박싱하길 원할 때 `backend: "openshell"`을
사용하십시오. 전체 설정 가이드, 구성
레퍼런스, workspace 모드 비교는 전용
[OpenShell 페이지](/gateway/openshell)를 참조하십시오.

OpenShell은 일반 SSH 백엔드와 동일한 코어 SSH 전송 및 원격 파일 시스템 bridge를 재사용하며,
OpenShell 전용 라이프사이클(`sandbox create/get/delete`, `sandbox ssh-config`)과 선택적 `mirror`
workspace 모드를 추가합니다.

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
          mode: "remote", // mirror | remote
          remoteWorkspaceDir: "/sandbox",
          remoteAgentWorkspaceDir: "/agent",
        },
      },
    },
  },
}
```

OpenShell 모드:

- `mirror` (기본값): 로컬 workspace가 canonical 상태로 유지됩니다. OpenClaw는 exec 전에 로컬 파일을 OpenShell로 동기화하고 exec 후에 원격 workspace를 다시 동기화합니다.
- `remote`: sandbox가 생성된 후 OpenShell workspace가 canonical입니다. OpenClaw는 로컬 workspace에서 원격 workspace를 한 번 시드한 다음, 파일 툴과 exec가 원격 sandbox에 대해 직접 실행되며 변경 사항을 다시 동기화하지 않습니다.

원격 전송 세부 사항:

- OpenClaw는 `openshell sandbox ssh-config <name>`을 통해 OpenShell에 sandbox 전용 SSH 구성을 요청합니다.
- Core는 해당 SSH 구성을 temp 파일에 쓰고, SSH 세션을 열며, `backend: "ssh"`에서 사용하는 동일한 원격 파일 시스템 bridge를 재사용합니다.
- `mirror` 모드에서는 라이프사이클만 다릅니다: exec 전에 로컬에서 원격으로 동기화한 다음, exec 후에 다시 동기화.

현재 OpenShell 제한 사항:

- sandbox 브라우저는 아직 지원되지 않습니다
- `sandbox.docker.binds`는 OpenShell 백엔드에서 지원되지 않습니다
- `sandbox.docker.*` 아래의 Docker 전용 런타임 노브는 여전히 Docker 백엔드에만 적용됩니다

#### Workspace 모드

OpenShell에는 두 가지 workspace 모델이 있습니다. 이 부분이 실제로 가장 중요합니다.

##### `mirror`

**로컬 workspace를 canonical 상태로 유지**하려면 `plugins.entries.openshell.config.mode: "mirror"`를 사용하십시오.

동작:

- `exec` 전에, OpenClaw는 로컬 workspace를 OpenShell sandbox로 동기화합니다.
- `exec` 후에, OpenClaw는 원격 workspace를 로컬 workspace로 다시 동기화합니다.
- 파일 툴은 여전히 sandbox bridge를 통해 작동하지만, 로컬 workspace는 turn 사이에 source of truth로 유지됩니다.

사용 시기:

- OpenClaw 외부에서 로컬로 파일을 편집하고 해당 변경 사항이 sandbox에 자동으로 표시되기를 원할 때
- OpenShell sandbox가 가능한 한 Docker 백엔드처럼 동작하기를 원할 때
- 호스트 workspace가 각 exec turn 후 sandbox 쓰기를 반영하기를 원할 때

Tradeoff:

- exec 전후의 추가 동기화 비용

##### `remote`

**OpenShell workspace를 canonical 상태로 만들려면** `plugins.entries.openshell.config.mode: "remote"`를 사용하십시오.

동작:

- sandbox가 처음 생성될 때, OpenClaw는 로컬 workspace에서 원격 workspace를 한 번 시드합니다.
- 그 후, `exec`, `read`, `write`, `edit` 및 `apply_patch`는 원격 OpenShell workspace에 대해 직접 작동합니다.
- OpenClaw는 exec 후 원격 변경 사항을 로컬 workspace로 다시 동기화하지 **않습니다**.
- 파일 및 미디어 툴이 로컬 호스트 경로를 가정하는 대신 sandbox bridge를 통해 읽기 때문에 프롬프트 시 미디어 읽기는 여전히 작동합니다.
- 전송은 `openshell sandbox ssh-config`가 반환한 OpenShell sandbox로의 SSH입니다.

중요한 결과:

- 시드 단계 후 OpenClaw 외부에서 호스트의 파일을 편집하는 경우, 원격 sandbox는 해당 변경 사항을 자동으로 **보지 않습니다**.
- sandbox가 재생성되면, 원격 workspace는 로컬 workspace에서 다시 시드됩니다.
- `scope: "agent"` 또는 `scope: "shared"`를 사용하면, 해당 원격 workspace는 동일한 범위에서 공유됩니다.

사용 시기:

- sandbox가 주로 원격 OpenShell 쪽에 존재해야 할 때
- 더 낮은 turn당 동기화 오버헤드를 원할 때
- 호스트 로컬 편집이 원격 sandbox state를 조용히 덮어쓰지 않기를 원할 때

sandbox를 임시 실행 환경으로 생각한다면 `mirror`를 선택하십시오.
sandbox를 실제 workspace로 생각한다면 `remote`를 선택하십시오.

#### OpenShell 라이프사이클

OpenShell sandbox는 여전히 일반 sandbox 라이프사이클을 통해 관리됩니다:

- `openclaw sandbox list`는 Docker 런타임뿐만 아니라 OpenShell 런타임도 표시합니다
- `openclaw sandbox recreate`는 현재 런타임을 삭제하고 OpenClaw가 다음 사용 시 재생성하도록 합니다
- prune 로직도 백엔드 인식입니다

`remote` 모드에서는 recreate가 특히 중요합니다:

- recreate는 해당 범위의 canonical 원격 workspace를 삭제합니다
- 다음 사용은 로컬 workspace에서 새 원격 workspace를 시드합니다

`mirror` 모드의 경우, 로컬 workspace가 어쨌든 canonical 상태로 유지되므로
recreate는 주로 원격 실행 환경을 재설정합니다.

## Workspace 접근

`agents.defaults.sandbox.workspaceAccess`는 **sandbox가 볼 수 있는 것**을 제어합니다:

- `"none"` (기본값): 툴은 `~/.openclaw/sandboxes` 아래의 sandbox workspace를 봅니다.
- `"ro"`: agent workspace를 `/agent`에 읽기 전용으로 마운트합니다(`write`/`edit`/`apply_patch` 비활성화).
- `"rw"`: agent workspace를 `/workspace`에 읽기/쓰기로 마운트합니다.

OpenShell 백엔드 사용 시:

- `mirror` 모드는 exec turn 사이에 로컬 workspace를 canonical 소스로 계속 사용합니다
- `remote` 모드는 초기 시드 후 원격 OpenShell workspace를 canonical 소스로 사용합니다
- `workspaceAccess: "ro"` 및 `"none"`은 여전히 동일한 방식으로 쓰기 동작을 제한합니다

인바운드 미디어는 활성 sandbox workspace(`media/inbound/*`)로 복사됩니다.
Skills 참고: `read` 툴은 sandbox 루트입니다. `workspaceAccess: "none"`을 사용하면,
OpenClaw는 자격을 갖춘 skills를 sandbox workspace(`.../skills`)에 미러링하여
읽을 수 있도록 합니다. `"rw"`를 사용하면, workspace skills는
`/workspace/skills`에서 읽을 수 있습니다.

## 사용자 정의 Bind mount

`agents.defaults.sandbox.docker.binds`는 추가 호스트 디렉토리를 컨테이너에 마운트합니다.
형식: `host:container:mode` (예: `"/home/user/source:/source:rw"`).

전역 및 agent별 bind는 **병합**됩니다(대체되지 않음). `scope: "shared"`에서는, agent별 bind가 무시됩니다.

`agents.defaults.sandbox.browser.binds`는 **sandbox 브라우저** 컨테이너에만 추가 호스트 디렉토리를 마운트합니다.

- 설정된 경우(`[]` 포함), 브라우저 컨테이너에 대해 `agents.defaults.sandbox.docker.binds`를 대체합니다.
- 생략하면, 브라우저 컨테이너는 `agents.defaults.sandbox.docker.binds`로 폴백됩니다(하위 호환).

예 (읽기 전용 source + 추가 데이터 디렉토리):

```json5
{
  agents: {
    defaults: {
      sandbox: {
        docker: {
          binds: ["/home/user/source:/source:ro", "/var/data/myapp:/data:ro"],
        },
      },
    },
    list: [
      {
        id: "build",
        sandbox: {
          docker: {
            binds: ["/mnt/cache:/cache:rw"],
          },
        },
      },
    ],
  },
}
```

보안 참고 사항:

- Bind는 sandbox 파일 시스템을 우회합니다: 설정한 모드(`:ro` 또는 `:rw`)로 호스트 경로를 노출합니다.
- OpenClaw는 위험한 bind 소스를 차단합니다(예: `docker.sock`, `/etc`, `/proc`, `/sys`, `/dev`, 그리고 이를 노출할 수 있는 상위 마운트).
- OpenClaw는 또한 `~/.aws`, `~/.cargo`, `~/.config`, `~/.docker`, `~/.gnupg`, `~/.netrc`, `~/.npm`, `~/.ssh`와 같은 일반적인 홈 디렉토리 자격 증명 루트를 차단합니다.
- Bind 유효성 검사는 단순 문자열 매칭이 아닙니다. OpenClaw는 소스 경로를 정규화한 다음, 차단된 경로 및 허용된 루트를 다시 확인하기 전에 가장 깊이 존재하는 조상을 통해 다시 해석합니다.
- 이는 최종 leaf가 아직 존재하지 않아도 symlink-parent 이스케이프가 여전히 fail closed된다는 의미입니다. 예: `run-link`가 거기를 가리키면 `/workspace/run-link/new-file`은 여전히 `/var/run/...`으로 해석됩니다.
- 허용된 소스 루트도 동일한 방식으로 canonical화되므로, symlink 해석 전에만 allowlist 내부를 보는 경로는 여전히 `outside allowed roots`로 거부됩니다.
- 민감한 마운트(secrets, SSH 키, 서비스 자격 증명)는 절대적으로 필요하지 않은 한 `:ro`여야 합니다.
- workspace에 대한 읽기 전용 접근만 필요하면 `workspaceAccess: "ro"`와 결합하십시오; bind 모드는 독립적으로 유지됩니다.
- bind가 tool policy 및 elevated exec와 상호 작용하는 방식에 대해서는 [Sandbox vs Tool Policy vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated)를 참조하십시오.

## 이미지 + 설정

기본 Docker 이미지: `openclaw-sandbox:bookworm-slim`

한 번 빌드합니다:

```bash
scripts/sandbox-setup.sh
```

참고: 기본 이미지는 Node를 포함하지 **않습니다**. skill에 Node(또는
다른 런타임)가 필요하면, 사용자 정의 이미지를 bake하거나
`sandbox.docker.setupCommand`를 통해 설치하십시오(네트워크 egress + 쓰기 가능한 root +
root 사용자 필요).

공통 도구(예: `curl`, `jq`, `nodejs`, `python3`, `git`)를 포함한 더 기능적인 sandbox
이미지를 원한다면, 다음을 빌드하십시오:

```bash
scripts/sandbox-common-setup.sh
```

그런 다음 `agents.defaults.sandbox.docker.image`를
`openclaw-sandbox-common:bookworm-slim`으로 설정합니다.

샌드박싱된 브라우저 이미지:

```bash
scripts/sandbox-browser-setup.sh
```

기본적으로, Docker sandbox 컨테이너는 **네트워크 없이** 실행됩니다.
`agents.defaults.sandbox.docker.network`로 재정의하십시오.

번들된 sandbox 브라우저 이미지는 또한 컨테이너화된 워크로드에 대한 보수적인 Chromium 시작 기본값을 적용합니다.
현재 컨테이너 기본값은 다음을 포함합니다:

- `--remote-debugging-address=127.0.0.1`
- `--remote-debugging-port=<derived from OPENCLAW_BROWSER_CDP_PORT>`
- `--user-data-dir=${HOME}/.chrome`
- `--no-first-run`
- `--no-default-browser-check`
- `--disable-3d-apis`
- `--disable-gpu`
- `--disable-dev-shm-usage`
- `--disable-background-networking`
- `--disable-extensions`
- `--disable-features=TranslateUI`
- `--disable-breakpad`
- `--disable-crash-reporter`
- `--disable-software-rasterizer`
- `--no-zygote`
- `--metrics-recording-only`
- `--renderer-process-limit=2`
- `noSandbox`가 활성화된 경우 `--no-sandbox`와 `--disable-setuid-sandbox`.
- 세 가지 그래픽 하드닝 플래그(`--disable-3d-apis`,
  `--disable-software-rasterizer`, `--disable-gpu`)는 선택 사항이며
  컨테이너에 GPU 지원이 없을 때 유용합니다. 워크로드에 WebGL 또는 다른 3D/브라우저 기능이 필요한 경우
  `OPENCLAW_BROWSER_DISABLE_GRAPHICS_FLAGS=0`으로 설정하십시오.
- `--disable-extensions`는 기본적으로 활성화되어 있으며 확장에 의존하는 플로우의 경우
  `OPENCLAW_BROWSER_DISABLE_EXTENSIONS=0`으로 비활성화할 수 있습니다.
- `--renderer-process-limit=2`는 `OPENCLAW_BROWSER_RENDERER_PROCESS_LIMIT=<N>`으로 제어되며,
  여기서 `0`은 Chromium의 기본값을 유지합니다.

다른 런타임 프로파일이 필요한 경우, 사용자 정의 브라우저 이미지를 사용하고
자체 엔트리포인트를 제공하십시오. 로컬(비컨테이너) Chromium 프로파일의 경우,
`browser.extraArgs`를 사용하여 추가 시작 플래그를 추가하십시오.

보안 기본값:

- `network: "host"`는 차단됩니다.
- `network: "container:<id>"`는 기본적으로 차단됩니다(namespace 조인 우회 위험).
- Break-glass 재정의: `agents.defaults.sandbox.docker.dangerouslyAllowContainerNamespaceJoin: true`.

Docker 설치 및 컨테이너화된 gateway는 여기에 있습니다:
[Docker](/install/docker)

Docker gateway 배포의 경우, `scripts/docker/setup.sh`가 sandbox 구성을 부트스트랩할 수 있습니다.
해당 경로를 활성화하려면 `OPENCLAW_SANDBOX=1`(또는 `true`/`yes`/`on`)로 설정하십시오. 다음으로
소켓 위치를 재정의할 수 있습니다: `OPENCLAW_DOCKER_SOCKET`. 전체 설정 및 env
레퍼런스: [Docker](/install/docker#agent-sandbox).

## setupCommand (일회성 컨테이너 설정)

`setupCommand`는 sandbox 컨테이너가 생성된 후 **한 번** 실행됩니다(매 실행이 아님).
컨테이너 내부에서 `sh -lc`를 통해 실행됩니다.

경로:

- 전역: `agents.defaults.sandbox.docker.setupCommand`
- Agent별: `agents.list[].sandbox.docker.setupCommand`

일반적인 함정:

- 기본 `docker.network`는 `"none"`(egress 없음)이므로 패키지 설치가 실패합니다.
- `docker.network: "container:<id>"`는 `dangerouslyAllowContainerNamespaceJoin: true`가 필요하며 break-glass 전용입니다.
- `readOnlyRoot: true`는 쓰기를 방지합니다; `readOnlyRoot: false`로 설정하거나 사용자 정의 이미지를 bake하십시오.
- `user`는 패키지 설치를 위해 root여야 합니다(`user`를 생략하거나 `user: "0:0"`으로 설정).
- Sandbox exec는 호스트 `process.env`를 상속하지 **않습니다**. skill API 키의 경우
  `agents.defaults.sandbox.docker.env`(또는 사용자 정의 이미지)를 사용하십시오.

## Tool policy + escape hatch

Tool allow/deny 정책은 여전히 sandbox 규칙보다 먼저 적용됩니다. 툴이 전역적으로 또는
agent별로 거부되는 경우, 샌드박싱이 이를 다시 가져오지 않습니다.

`tools.elevated`는 sandbox 외부(기본값 `gateway`, exec 타겟이 `node`인 경우 `node`)에서 `exec`를 실행하는 명시적 escape hatch입니다.
`/exec` 지시문은 승인된 발신자에게만 적용되며 세션별로 유지됩니다; `exec`를 완전히 비활성화하려면
tool policy 거부를 사용하십시오([Sandbox vs Tool Policy vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated) 참조).

디버깅:

- 효과적인 sandbox 모드, tool policy, fix-it 구성 키를 검사하려면 `openclaw sandbox explain`을 사용하십시오.
- "왜 이것이 차단되는가?" 멘탈 모델은 [Sandbox vs Tool Policy vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated)를 참조하십시오.
  잠궈 두십시오.

## Multi-agent 재정의

각 agent는 sandbox + tools를 재정의할 수 있습니다:
`agents.list[].sandbox` 및 `agents.list[].tools`(sandbox tool policy에는 `agents.list[].tools.sandbox.tools`).
우선순위는 [Multi-Agent Sandbox & Tools](/tools/multi-agent-sandbox-tools)를 참조하십시오.

## 최소 활성화 예시

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "none",
      },
    },
  },
}
```

## 관련 문서

- [OpenShell](/gateway/openshell) -- 관리 sandbox 백엔드 설정, workspace 모드, 구성 레퍼런스
- [Sandbox 구성](/gateway/config-agents#agentsdefaultssandbox)
- [Sandbox vs Tool Policy vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated) -- "왜 이것이 차단되는가?" 디버깅
- [Multi-Agent Sandbox & Tools](/tools/multi-agent-sandbox-tools) -- agent별 재정의 및 우선순위
- [보안](/gateway/security/)
