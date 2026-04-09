---
summary: "`openclaw approvals`에 대한 CLI 참조 (게이트웨이 또는 노드 호스트에 대한 exec 승인)"
read_when:
  - CLI에서 exec 승인을 편집하려는 경우
  - 게이트웨이 또는 노드 호스트의 허용 목록을 관리해야 하는 경우
title: "approvals"
---

# `openclaw approvals`

**로컬 호스트**, **게이트웨이 호스트**, 또는 **노드 호스트**에 대한 exec 승인 관리.
기본적으로 명령은 디스크의 로컬 승인 파일을 대상으로 합니다. 게이트웨이를 대상으로 하려면 `--gateway`를, 특정 노드를 대상으로 하려면 `--node`를 사용하세요.

별칭: `openclaw exec-approvals`

관련:

- Exec 승인: [Exec 승인](/tools/exec-approvals)
- 노드: [노드](/nodes)

## 일반 명령

```bash
openclaw approvals get
openclaw approvals get --node <id|name|ip>
openclaw approvals get --gateway
```

`openclaw approvals get`은 이제 로컬, 게이트웨이, 노드 대상에 대한 유효한 exec 정책을 표시합니다:

- 요청된 `tools.exec` 정책
- 호스트 승인 파일 정책
- 우선순위 규칙이 적용된 후 유효한 결과

우선순위는 의도적입니다:

- 호스트 승인 파일은 시행 가능한 신뢰의 소스입니다.
- 요청된 `tools.exec` 정책은 의도를 좁히거나 넓힐 수 있지만, 유효한 결과는 여전히 호스트 규칙에서 파생됩니다.
- `--node`는 노드 호스트 승인 파일과 게이트웨이 `tools.exec` 정책을 결합합니다. 둘 다 런타임에 여전히 적용되기 때문입니다.
- 게이트웨이 구성을 사용할 수 없는 경우 CLI는 노드 승인 스냅샷으로 폴백하고 최종 런타임 정책을 계산할 수 없었다고 표시합니다.

## 파일에서 승인 교체

```bash
openclaw approvals set --file ./exec-approvals.json
openclaw approvals set --stdin <<'EOF'
{ version: 1, defaults: { security: "full", ask: "off" } }
EOF
openclaw approvals set --node <id|name|ip> --file ./exec-approvals.json
openclaw approvals set --gateway --file ./exec-approvals.json
```

`set`은 엄격한 JSON이 아닌 JSON5를 허용합니다. `--file` 또는 `--stdin`을 사용하되 둘 다는 사용하지 마세요.

## "프롬프트 없음" / YOLO 예시

exec 승인에서 절대로 중단되지 않아야 하는 호스트의 경우 호스트 승인 기본값을 `full` + `off`로 설정하세요:

```bash
openclaw approvals set --stdin <<'EOF'
{
  version: 1,
  defaults: {
    security: "full",
    ask: "off",
    askFallback: "full"
  }
}
EOF
```

노드 변형:

```bash
openclaw approvals set --node <id|name|ip> --stdin <<'EOF'
{
  version: 1,
  defaults: {
    security: "full",
    ask: "off",
    askFallback: "full"
  }
}
EOF
```

이는 **호스트 승인 파일**만 변경합니다. 요청된 OpenClaw 정책을 맞추려면 다음도 설정하세요:

```bash
openclaw config set tools.exec.host gateway
openclaw config set tools.exec.security full
openclaw config set tools.exec.ask off
```

이 예시에서 `tools.exec.host=gateway`인 이유:

- `host=auto`는 여전히 "샌드박스를 사용할 수 있으면 샌드박스, 그렇지 않으면 게이트웨이"를 의미합니다.
- YOLO는 승인에 관한 것이지 라우팅에 관한 것이 아닙니다.
- 샌드박스가 구성된 경우에도 호스트 exec를 원한다면 `gateway` 또는 `/exec host=gateway`로 호스트 선택을 명시하세요.

이는 현재 호스트 기본 YOLO 동작과 일치합니다. 승인이 필요하면 강화하세요.

## 허용 목록 도우미

```bash
openclaw approvals allowlist add "~/Projects/**/bin/rg"
openclaw approvals allowlist add --agent main --node <id|name|ip> "/usr/bin/uptime"
openclaw approvals allowlist add --agent "*" "/usr/bin/uname"

openclaw approvals allowlist remove "~/Projects/**/bin/rg"
```

## 일반 옵션

`get`, `set`, `allowlist add|remove` 모두 지원:

- `--node <id|name|ip>`
- `--gateway`
- 공유 노드 RPC 옵션: `--url`, `--token`, `--timeout`, `--json`

대상 참고사항:

- 대상 플래그 없음은 디스크의 로컬 승인 파일을 의미합니다.
- `--gateway`는 게이트웨이 호스트 승인 파일을 대상으로 합니다.
- `--node`는 id, 이름, IP, 또는 id 접두사를 확인한 후 하나의 노드 호스트를 대상으로 합니다.

`allowlist add|remove`는 추가로 지원합니다:

- `--agent <id>` (기본값: `*`)

## 참고사항

- `--node`는 `openclaw nodes`와 동일한 확인자를 사용합니다 (id, 이름, ip, 또는 id 접두사).
- `--agent`는 기본값이 `"*"`로 모든 에이전트에 적용됩니다.
- 노드 호스트는 `system.execApprovals.get/set`을 알려야 합니다 (macOS 앱 또는 헤드리스 노드 호스트).
- 승인 파일은 `~/.openclaw/exec-approvals.json`에 호스트별로 저장됩니다.
