---
title: "node"
description: "`openclaw node`에 대한 CLI 참조 (헤드리스 노드 호스트)"
---

# `openclaw node`

Gateway WebSocket에 연결하고 이 머신에서 `system.run` / `system.which`를 노출하는 **헤드리스 노드 호스트**를 실행합니다.

## 노드 호스트를 사용하는 이유

전체 macOS 컴패니언 앱을 설치하지 않고 네트워크의 다른 머신에서 **에이전트가 명령을 실행**하도록 하려면 노드 호스트를 사용하세요.

일반적인 사용 사례:

- 원격 Linux/Windows 박스 (빌드 서버, 실험실 머신, NAS)에서 명령 실행.
- 게이트웨이에서는 exec **샌드박스화**를 유지하면서 승인된 실행을 다른 호스트에 위임.
- 자동화 또는 CI 노드를 위한 경량 헤드리스 실행 대상 제공.

실행은 노드 호스트의 **exec 승인** 및 에이전트별 허용 목록으로 계속 보호되므로 명령 액세스를 범위 지정하고 명시적으로 유지할 수 있습니다.

## 브라우저 프록시 (제로 구성)

노드 호스트는 노드에서 `browser.enabled`가 비활성화되지 않은 경우 브라우저 프록시를 자동으로 광고합니다. 이를 통해 에이전트는 추가 구성 없이 해당 노드에서 브라우저 자동화를 사용할 수 있습니다.

기본적으로 프록시는 노드의 일반 브라우저 프로필 표면을 노출합니다. `nodeHost.browserProxy.allowProfiles`를 설정하면 프록시가 제한적이 됩니다: 허용 목록에 없는 프로필 대상 지정은 거부되고, 영속적 프로필 생성/삭제 경로는 프록시를 통해 차단됩니다.

필요한 경우 노드에서 비활성화:

```json5
{
  nodeHost: {
    browserProxy: {
      enabled: false,
    },
  },
}
```

## 실행 (포그라운드)

```bash
openclaw node run --host &lt;gateway-host&gt; --port 18789
```

옵션:

- `--host &lt;host&gt;`: Gateway WebSocket 호스트 (기본값: `127.0.0.1`)
- `--port &lt;port&gt;`: Gateway WebSocket 포트 (기본값: `18789`)
- `--tls`: 게이트웨이 연결에 TLS 사용
- `--tls-fingerprint &lt;sha256&gt;`: 예상되는 TLS 인증서 지문 (sha256)
- `--node-id &lt;id&gt;`: 노드 id 재정의 (페어링 토큰 지움)
- `--display-name &lt;name&gt;`: 노드 표시 이름 재정의

## 노드 호스트를 위한 게이트웨이 인증

`openclaw node run`과 `openclaw node install`은 구성/환경에서 게이트웨이 인증을 확인합니다 (노드 명령에는 `--token`/`--password` 플래그 없음):

- `OPENCLAW_GATEWAY_TOKEN` / `OPENCLAW_GATEWAY_PASSWORD`가 먼저 확인됩니다.
- 그런 다음 로컬 구성 폴백: `gateway.auth.token` / `gateway.auth.password`.
- 로컬 모드에서 노드 호스트는 의도적으로 `gateway.remote.token` / `gateway.remote.password`를 상속하지 않습니다.
- `gateway.auth.token` / `gateway.auth.password`가 SecretRef를 통해 명시적으로 구성되고 확인되지 않은 경우 노드 인증 확인이 실패합니다 (원격 폴백 마스킹 없음).
- `gateway.mode=remote`에서 원격 클라이언트 필드(`gateway.remote.token` / `gateway.remote.password`)도 원격 우선순위 규칙에 따라 적격합니다.
- 노드 호스트 인증 확인은 `OPENCLAW_GATEWAY_*` 환경 변수만 허용합니다.

## 서비스 (백그라운드)

헤드리스 노드 호스트를 사용자 서비스로 설치합니다.

```bash
openclaw node install --host &lt;gateway-host&gt; --port 18789
```

옵션:

- `--host &lt;host&gt;`: Gateway WebSocket 호스트 (기본값: `127.0.0.1`)
- `--port &lt;port&gt;`: Gateway WebSocket 포트 (기본값: `18789`)
- `--tls`: 게이트웨이 연결에 TLS 사용
- `--tls-fingerprint &lt;sha256&gt;`: 예상되는 TLS 인증서 지문 (sha256)
- `--node-id &lt;id&gt;`: 노드 id 재정의 (페어링 토큰 지움)
- `--display-name &lt;name&gt;`: 노드 표시 이름 재정의
- `--runtime &lt;runtime&gt;`: 서비스 런타임 (`node` 또는 `bun`)
- `--force`: 이미 설치된 경우 재설치/덮어쓰기

서비스 관리:

```bash
openclaw node status
openclaw node stop
openclaw node restart
openclaw node uninstall
```

포그라운드 노드 호스트 (서비스 없음)는 `openclaw node run`을 사용하세요.

서비스 명령은 기계 판독 가능한 출력을 위해 `--json`을 허용합니다.

## 페어링

첫 번째 연결은 Gateway에서 보류 중인 디바이스 페어링 요청 (`role: node`)을 생성합니다.
다음을 통해 승인하세요:

```bash
openclaw devices list
openclaw devices approve &lt;requestId&gt;
```

노드가 변경된 인증 세부 정보(역할/범위/공개 키)로 페어링을 재시도하면
이전 보류 중인 요청이 대체되고 새로운 `requestId`가 생성됩니다.
승인 전에 `openclaw devices list`를 다시 실행하세요.

노드 호스트는 `~/.openclaw/node.json`에 노드 id, 토큰, 표시 이름, 게이트웨이 연결 정보를 저장합니다.

## Exec 승인

`system.run`은 로컬 exec 승인으로 게이트됩니다:

- `~/.openclaw/exec-approvals.json`
- [Exec 승인](/tools/exec-approvals)
- `openclaw approvals --node &lt;id|name|ip&gt;` (게이트웨이에서 편집)

승인된 비동기 노드 exec의 경우, OpenClaw는 프롬프트 전에 정규 `systemRunPlan`을 준비합니다. 이후 승인된 `system.run` 포워드는 저장된 플랜을 재사용하므로, 승인 요청이 생성된 후 command/cwd/session 필드에 대한 편집은 노드가 실행하는 내용을 변경하는 대신 거부됩니다.
