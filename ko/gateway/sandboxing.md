---
summary: "OpenClaw 샌드박싱 작동 방식: 모드, 범위, 워크스페이스 액세스, 이미지"
title: 샌드박싱
read_when: "샌드박싱에 대한 전용 설명을 원하거나 agents.defaults.sandbox를 조정해야 할 때."
status: active
---

# 샌드박싱

OpenClaw는 폭발 반경을 줄이기 위해 **샌드박스 백엔드 내에서 도구를 실행**할 수 있습니다.
이는 **선택 사항**이며 구성으로 제어됩니다 (`agents.defaults.sandbox` 또는 `agents.list[].sandbox`). 샌드박싱이 꺼진 경우 도구는 호스트에서 실행됩니다.
게이트웨이는 호스트에 유지됩니다; 활성화된 경우 도구 실행은 격리된 샌드박스에서 실행됩니다.

이것은 완전한 보안 경계가 아니지만 모델이 어리석은 작업을 할 때 파일 시스템과 프로세스 액세스를 실질적으로 제한합니다.

## 샌드박스되는 것

- 도구 실행 (`exec`, `read`, `write`, `edit`, `apply_patch`, `process` 등).
- 선택적 샌드박스 브라우저 (`agents.defaults.sandbox.browser`).
  - 기본적으로 샌드박스 브라우저는 브라우저 도구가 필요할 때 자동 시작됩니다 (CDP에 연결 가능하도록 보장).
    `agents.defaults.sandbox.browser.autoStart` 및 `agents.defaults.sandbox.browser.autoStartTimeoutMs`를 통해 구성합니다.
  - 기본적으로 샌드박스 브라우저 컨테이너는 전역 `bridge` 네트워크 대신 전용 Docker 네트워크(`openclaw-sandbox-browser`)를 사용합니다.
    `agents.defaults.sandbox.browser.network`으로 구성합니다.
  - `agents.defaults.sandbox.browser.allowHostControl`은 샌드박스된 세션이 호스트 브라우저를 명시적으로 대상으로 하도록 합니다.

샌드박스되지 않는 것:

- 게이트웨이 프로세스 자체.
- 샌드박스 외부에서 실행하도록 명시적으로 허용된 모든 도구 (예: `tools.elevated`).
  - **상승된 exec는 샌드박싱을 우회하고 구성된 탈출 경로(`gateway` 기본값, 또는 exec 대상이 `node`인 경우 `node`)를 사용합니다.**

## 모드

`agents.defaults.sandbox.mode`는 샌드박싱이 사용되는 **시기**를 제어합니다:

- `"off"`: 샌드박싱 없음.
- `"non-main"`: **비메인** 세션만 샌드박스합니다 (호스트에서 일반 채팅을 원하는 경우 기본값).
- `"all"`: 모든 세션이 샌드박스에서 실행됩니다.
  참고: `"non-main"`은 에이전트 id가 아닌 `session.mainKey`(기본값 `"main"`)를 기반으로 합니다.
  그룹/채널 세션은 자체 키를 사용하므로 비메인으로 계산되어 샌드박스됩니다.

## 범위

`agents.defaults.sandbox.scope`는 생성되는 **컨테이너 수**를 제어합니다:

- `"agent"` (기본값): 에이전트당 하나의 컨테이너.
- `"session"`: 세션당 하나의 컨테이너.
- `"shared"`: 모든 샌드박스된 세션이 공유하는 하나의 컨테이너.

## 백엔드

`agents.defaults.sandbox.backend`는 샌드박스를 제공하는 **런타임**을 제어합니다:

- `"docker"` (기본값): 로컬 Docker 기반 샌드박스 런타임.
- `"ssh"`: 일반 SSH 기반 원격 샌드박스 런타임.
- `"openshell"`: OpenShell 기반 샌드박스 런타임.

SSH 특화 구성은 `agents.defaults.sandbox.ssh` 아래에 있습니다.
OpenShell 특화 구성은 `plugins.entries.openshell.config` 아래에 있습니다.

### 백엔드 선택

|                     | Docker                           | SSH                            | OpenShell                                           |
| ------------------- | -------------------------------- | ------------------------------ | --------------------------------------------------- |
| **실행 위치**   | 로컬 컨테이너                  | SSH 접근 가능 호스트        | OpenShell 관리형 샌드박스                           |
| **설정**           | `scripts/sandbox-setup.sh`       | SSH 키 + 대상 호스트          | OpenShell 플러그인 활성화                            |
| **워크스페이스 모델** | 바인드 마운트 또는 복사               | 원격 정식 (한 번 시딩)   | `mirror` 또는 `remote`                                |
| **네트워크 제어** | `docker.network` (기본값: 없음) | 원격 호스트에 따라 다름         | OpenShell에 따라 다름                                |
| **브라우저 샌드박스** | 지원됨                        | 지원 안됨                  | 아직 지원 안됨                                   |
| **바인드 마운트**     | `docker.binds`                   | 없음                            | 없음                                                 |
| **적합한 경우**        | 로컬 개발, 완전 격리        | 원격 머신으로 오프로딩 | 선택적 양방향 동기화가 있는 관리형 원격 샌드박스 |

### SSH 백엔드

임의의 SSH 접근 가능 머신에서 OpenClaw가 `exec`, 파일 도구, 미디어 읽기를 샌드박스하도록 하려면 `backend: "ssh"`를 사용합니다.

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
          // 또는 로컬 파일 대신 SecretRef / 인라인 내용 사용:
          // identityData: { source: "env", provider: "default", id: "SSH_IDENTITY" },
        },
      },
    },
  },
}
```

작동 방식:

- OpenClaw는 `sandbox.ssh.workspaceRoot` 아래에 범위별 원격 루트를 생성합니다.
- 생성 또는 재생성 후 처음 사용 시 OpenClaw는 한 번 로컬 워크스페이스에서 원격 워크스페이스를 시딩합니다.
- 그 후 `exec`, `read`, `write`, `edit`, `apply_patch`, 프롬프트 미디어 읽기, 인바운드 미디어 스테이징이 SSH를 통해 원격 워크스페이스에 직접 실행됩니다.
- OpenClaw는 원격 변경 사항을 로컬 워크스페이스로 자동 동기화하지 않습니다.

이것은 **원격 정식** 모델입니다. 초기 시드 후 원격 SSH 워크스페이스가 실제 샌드박스 상태가 됩니다.

### OpenShell 백엔드

전체 설정 가이드, 구성 참조, 워크스페이스 모드 비교는 전용 [OpenShell 페이지](/gateway/openshell)를 참조하십시오.

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

- `mirror` (기본값): 로컬 워크스페이스가 정식으로 유지됩니다. OpenClaw는 exec 전에 로컬 파일을 OpenShell에 동기화하고 exec 후에 원격 워크스페이스를 다시 동기화합니다.
- `remote`: 샌드박스가 생성된 후 OpenShell 워크스페이스가 정식입니다. OpenClaw는 한 번 로컬 워크스페이스에서 원격 워크스페이스를 시딩한 후 파일 도구와 exec가 변경 사항을 동기화하지 않고 원격 샌드박스에 직접 실행됩니다.

## 워크스페이스 액세스

`agents.defaults.sandbox.workspaceAccess`는 **샌드박스가 볼 수 있는 것**을 제어합니다:

- `"none"` (기본값): 도구는 `~/.openclaw/sandboxes` 아래의 샌드박스 워크스페이스를 봅니다.
- `"ro"`: `/agent`에 에이전트 워크스페이스를 읽기 전용으로 마운트합니다 (`write`/`edit`/`apply_patch` 비활성화).
- `"rw"`: `/workspace`에 에이전트 워크스페이스를 읽기/쓰기로 마운트합니다.

## 사용자 지정 바인드 마운트

`agents.defaults.sandbox.docker.binds`는 추가 호스트 디렉터리를 컨테이너에 마운트합니다.
형식: `host:container:mode` (예: `"/home/user/source:/source:rw"`).

전역 및 에이전트별 바인드는 **병합됩니다** (교체되지 않음). `scope: "shared"` 아래에서 에이전트별 바인드는 무시됩니다.

예제 (읽기 전용 소스 + 추가 데이터 디렉터리):

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

- 바인드는 샌드박스 파일 시스템을 우회합니다: 설정한 모드로 호스트 경로를 노출합니다.
- OpenClaw는 위험한 바인드 소스를 차단합니다 (예: `docker.sock`, `/etc`, `/proc`, `/sys`, `/dev`).
- OpenClaw는 `~/.aws`, `~/.cargo`, `~/.config`, `~/.docker`, `~/.gnupg`, `~/.netrc`, `~/.npm`, `~/.ssh`와 같은 일반적인 홈 디렉터리 자격 증명 루트도 차단합니다.
- 민감한 마운트(시크릿, SSH 키, 서비스 자격 증명)는 절대적으로 필요하지 않는 한 `:ro`이어야 합니다.

## 이미지 + 설정

기본 Docker 이미지: `openclaw-sandbox:bookworm-slim`

한 번 빌드합니다:

```bash
scripts/sandbox-setup.sh
```

참고: 기본 이미지에는 Node가 포함되어 **있지 않습니다**. skill에 Node(또는 기타 런타임)가 필요한 경우 사용자 지정 이미지를 빌드하거나 `sandbox.docker.setupCommand`를 통해 설치합니다.

일반적인 도구(예: `curl`, `jq`, `nodejs`, `python3`, `git`)를 포함하는 더 기능적인 샌드박스 이미지를 원하면 빌드합니다:

```bash
scripts/sandbox-common-setup.sh
```

그런 다음 `agents.defaults.sandbox.docker.image`를 `openclaw-sandbox-common:bookworm-slim`으로 설정합니다.

샌드박스 브라우저 이미지:

```bash
scripts/sandbox-browser-setup.sh
```

기본적으로 Docker 샌드박스 컨테이너는 **네트워크 없이** 실행됩니다.
`agents.defaults.sandbox.docker.network`로 재정의합니다.

보안 기본값:

- `network: "host"`는 차단됩니다.
- `network: "container:<id>"`는 기본적으로 차단됩니다 (네임스페이스 조인 우회 위험).
- 파괴 방지 재정의: `agents.defaults.sandbox.docker.dangerouslyAllowContainerNamespaceJoin: true`.

## setupCommand (일회성 컨테이너 설정)

`setupCommand`는 샌드박스 컨테이너가 생성된 후 **한 번** 실행됩니다 (매 실행이 아닌).
`sh -lc`를 통해 컨테이너 내에서 실행됩니다.

일반적인 함정:

- 기본 `docker.network`는 `"none"` (이그레스 없음)이므로 패키지 설치가 실패합니다.
- `readOnlyRoot: true`는 쓰기를 방지합니다; `readOnlyRoot: false`를 설정하거나 사용자 지정 이미지를 빌드합니다.
- 샌드박스 exec는 호스트 `process.env`를 상속하지 **않습니다**.

## 도구 정책 + 탈출구

도구 허용/거부 정책은 여전히 샌드박스 규칙 전에 적용됩니다. 도구가 전역적으로 또는 에이전트별로 거부된 경우 샌드박싱은 이를 되살리지 않습니다.

`tools.elevated`는 샌드박스 외부에서 `exec`를 실행하는 명시적 탈출구입니다.

디버깅:

- 효과적인 샌드박스 모드, 도구 정책, 수정 구성 키를 검사하려면 `openclaw sandbox explain`을 사용합니다.

## 멀티 에이전트 재정의

각 에이전트는 샌드박스 + 도구를 재정의할 수 있습니다:
`agents.list[].sandbox` 및 `agents.list[].tools`.
우선순위는 [멀티 에이전트 샌드박스 및 도구](/tools/multi-agent-sandbox-tools)를 참조하십시오.

## 최소 활성화 예제

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

- [OpenShell](/gateway/openshell) -- 관리형 샌드박스 백엔드 설정, 워크스페이스 모드, 구성 참조
- [샌드박스 vs 도구 정책 vs 상승된 권한](/gateway/sandbox-vs-tool-policy-vs-elevated) -- "왜 차단됐나요?" 디버깅
- [멀티 에이전트 샌드박스 및 도구](/tools/multi-agent-sandbox-tools) -- 에이전트별 재정의 및 우선순위
- [보안](/gateway/security)
