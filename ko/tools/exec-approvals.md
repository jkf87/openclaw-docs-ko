---
summary: "Exec 승인, 허용 목록, 샌드박스 탈출 프롬프트"
read_when:
  - Exec 승인 또는 허용 목록(allowlist)을 설정할 때
  - macOS 앱에서 exec 승인 UX를 구현할 때
  - 샌드박스 탈출 프롬프트와 그 함의를 검토할 때
title: "Exec 승인"
---

Exec 승인은 샌드박스화된 에이전트가 실제 호스트(`gateway` 또는 `node`)에서
명령을 실행할 수 있도록 허용하는 **컴패니언 앱 / 노드 호스트 가드레일**입니다.
안전 인터락(interlock)으로서, 정책 + 허용 목록 + (선택적) 사용자 승인이 모두
일치할 때만 명령이 허용됩니다. Exec 승인은 툴 정책과 elevated 게이팅 위에
**적층(stack)**됩니다(단, elevated가 `full`로 설정되면 승인을 건너뜁니다).

<Note>
유효 정책(effective policy)은 `tools.exec.*`와 승인 기본값 중 **더 엄격한** 쪽입니다.
승인 필드가 생략되면 `tools.exec` 값이 사용됩니다. 호스트 exec은 해당 머신의
로컬 승인 상태도 함께 사용하므로 — `~/.openclaw/exec-approvals.json`의
호스트 로컬 `ask: "always"`는 세션이나 구성 기본값이 `ask: "on-miss"`를
요청하더라도 계속 프롬프트를 표시합니다.
</Note>

## 유효 정책 확인

- `openclaw approvals get`, `... --gateway`, `... --node <id|name|ip>` — 요청된 정책, 호스트 정책 소스, 유효 결과를 표시합니다.
- `openclaw exec-policy show` — 로컬 머신의 병합된 뷰.
- `openclaw exec-policy set|preset` — 로컬 요청 정책을 로컬 호스트 승인 파일과 한 번에 동기화합니다.

로컬 스코프가 `host=node`를 요청하면, `exec-policy show`는 해당 스코프를
런타임에 노드 관리(node-managed)로 보고하며, 로컬 승인 파일이 단일
진실 소스(source of truth)인 척하지 않습니다.

컴패니언 앱 UI를 **사용할 수 없는** 경우, 평소라면 프롬프트가 표시되어야 할
모든 요청은 **ask fallback**(기본값: deny)으로 해결됩니다.

<Tip>
네이티브 채팅 승인 클라이언트는 대기 중인 승인 메시지에 채널별 어포던스를
사전 구성(seed)할 수 있습니다. 예를 들어 Matrix는 리액션 단축키
(`✅` 한 번 허용, `❌` 거부, `♾️` 항상 허용)를 시딩하면서도 메시지에
`/approve ...` 명령을 폴백으로 남겨둡니다.
</Tip>

## 적용되는 범위

Exec 승인은 실행 호스트에서 로컬로 강제됩니다:

- **gateway 호스트** → 게이트웨이 머신의 `openclaw` 프로세스
- **node 호스트** → 노드 러너(macOS 컴패니언 앱 또는 헤드리스 노드 호스트)

신뢰 모델(Trust model) 참고:

- Gateway 인증된 호출자는 해당 Gateway에 대해 신뢰된 운영자입니다.
- 페어링된 노드는 그 신뢰된 운영자 권한을 노드 호스트로 확장합니다.
- Exec 승인은 우발적인 실행 위험을 줄이지만, 사용자별 인증 경계는 아닙니다.
- 승인된 노드 호스트 실행은 정규 실행 컨텍스트(canonical cwd, 정확한 argv,
  존재할 경우 env 바인딩, 해당 시 고정된 실행 파일 경로)에 바인딩됩니다.
- 셸 스크립트 및 직접 인터프리터/런타임 파일 호출의 경우, OpenClaw는
  하나의 구체적인 로컬 파일 피연산자도 바인딩하려고 시도합니다. 승인 이후
  실행 전에 그 바인딩된 파일이 변경되면, 변경된 콘텐츠를 실행하는 대신
  실행을 거부합니다.
- 이 파일 바인딩은 의도적으로 최선 노력(best-effort)이며, 모든 인터프리터/
  런타임 로더 경로의 완전한 의미 모델은 아닙니다. 승인 모드가 바인딩할
  하나의 구체적인 로컬 파일을 정확히 식별할 수 없으면, 전체 커버리지를
  가장하는 대신 승인 기반 실행의 발급을 거부합니다.

macOS 분리:

- **노드 호스트 서비스**는 `system.run`을 로컬 IPC를 통해 **macOS 앱**으로 전달합니다.
- **macOS 앱**은 승인을 강제하고 UI 컨텍스트에서 명령을 실행합니다.

## 설정 및 저장소

승인은 실행 호스트의 로컬 JSON 파일에 저장됩니다:

`~/.openclaw/exec-approvals.json`

예시 스키마:

```json
{
  "version": 1,
  "socket": {
    "path": "~/.openclaw/exec-approvals.sock",
    "token": "base64url-token"
  },
  "defaults": {
    "security": "deny",
    "ask": "on-miss",
    "askFallback": "deny",
    "autoAllowSkills": false
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "askFallback": "deny",
      "autoAllowSkills": true,
      "allowlist": [
        {
          "id": "B0C8C0B3-2C2D-4F8A-9A3C-5A4B3C2D1E0F",
          "pattern": "~/Projects/**/bin/rg",
          "lastUsedAt": 1737150000000,
          "lastUsedCommand": "rg -n TODO",
          "lastResolvedPath": "/Users/user/Projects/.../bin/rg"
        }
      ]
    }
  }
}
```

## 무승인 "YOLO" 모드

호스트 exec이 승인 프롬프트 없이 실행되길 원한다면, **양쪽** 정책 레이어를
모두 열어야 합니다:

- OpenClaw 구성의 요청 exec 정책(`tools.exec.*`)
- `~/.openclaw/exec-approvals.json`의 호스트 로컬 승인 정책

이것은 이제 명시적으로 조이지 않는 한 기본 호스트 동작입니다:

- `tools.exec.security`: `gateway`/`node`에서 `full`
- `tools.exec.ask`: `off`
- 호스트 `askFallback`: `full`

중요한 구분:

- `tools.exec.host=auto`는 exec이 실행될 위치를 선택합니다: 샌드박스를 사용할 수 있으면 샌드박스, 그렇지 않으면 gateway.
- YOLO는 호스트 exec의 승인 방식을 선택합니다: `security=full`과 `ask=off`.
- 자체 비대화형 권한 모드를 노출하는 CLI 기반 프로바이더는 이 정책을 따를 수 있습니다.
  Claude CLI는 OpenClaw의 요청된 exec 정책이 YOLO일 때 `--permission-mode bypassPermissions`를 추가합니다.
  `agents.defaults.cliBackends.claude-cli.args` / `resumeArgs` 아래의
  명시적 Claude 인자(예: `--permission-mode default`, `acceptEdits`, `bypassPermissions`)로
  해당 백엔드 동작을 재정의할 수 있습니다.
- YOLO 모드에서 OpenClaw는 구성된 호스트 exec 정책 위에 별도의 휴리스틱 명령 난독화 승인 게이트나 스크립트 프리플라이트 거부 레이어를 추가하지 않습니다.
- `auto`는 샌드박스화된 세션에서 gateway 라우팅을 자유로운 재정의로 만들지 않습니다. `auto`에서 호출당 `host=node` 요청은 허용되며, `host=gateway`는 샌드박스 런타임이 활성화되지 않은 경우에만 `auto`에서 허용됩니다. 안정적인 non-auto 기본값을 원한다면, `tools.exec.host`를 설정하거나 `/exec host=...`를 명시적으로 사용하세요.

더 보수적인 설정을 원한다면, 어느 한 레이어를 다시 `allowlist` / `on-miss`
또는 `deny`로 조이세요.

영구적인 gateway 호스트 "프롬프트 없음" 설정:

```bash
openclaw config set tools.exec.host gateway
openclaw config set tools.exec.security full
openclaw config set tools.exec.ask off
openclaw gateway restart
```

그런 다음 호스트 승인 파일을 일치하도록 설정합니다:

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

현재 머신에서 동일한 gateway 호스트 정책을 위한 로컬 단축:

```bash
openclaw exec-policy preset yolo
```

이 로컬 단축은 다음 두 가지를 모두 업데이트합니다:

- 로컬 `tools.exec.host/security/ask`
- 로컬 `~/.openclaw/exec-approvals.json` 기본값

의도적으로 로컬 전용입니다. gateway 호스트 또는 노드 호스트 승인을 원격으로
변경해야 한다면, 계속해서 `openclaw approvals set --gateway` 또는
`openclaw approvals set --node <id|name|ip>`를 사용하세요.

노드 호스트의 경우, 해당 노드에 동일한 승인 파일을 대신 적용합니다:

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

중요한 로컬 전용 제한:

- `openclaw exec-policy`는 노드 승인을 동기화하지 않습니다
- `openclaw exec-policy set --host node`는 거부됩니다
- 노드 exec 승인은 런타임에 노드에서 가져오므로, 노드 대상 업데이트는 `openclaw approvals --node ...`를 사용해야 합니다

세션 전용 단축:

- `/exec security=full ask=off`는 현재 세션만 변경합니다.
- `/elevated full`은 해당 세션의 exec 승인도 건너뛰는 긴급(break-glass) 단축입니다.

호스트 승인 파일이 구성보다 더 엄격하게 유지되면, 더 엄격한 호스트 정책이 여전히 우선합니다.

## 정책 노브(Policy knobs)

### Security (`exec.security`)

- **deny**: 모든 호스트 exec 요청을 차단합니다.
- **allowlist**: 허용 목록에 있는 명령만 허용합니다.
- **full**: 모든 것을 허용합니다(elevated와 동등).

### Ask (`exec.ask`)

- **off**: 프롬프트 없음.
- **on-miss**: 허용 목록이 일치하지 않을 때만 프롬프트.
- **always**: 모든 명령에 대해 프롬프트.
- 유효 ask 모드가 `always`인 경우 `allow-always` 영구 신뢰는 프롬프트를 억제하지 않습니다

### Ask fallback (`askFallback`)

프롬프트가 필요하지만 UI에 도달할 수 없는 경우, 폴백이 결정합니다:

- **deny**: 차단.
- **allowlist**: 허용 목록이 일치하는 경우에만 허용.
- **full**: 허용.

### 인라인 인터프리터 eval 하드닝 (`tools.exec.strictInlineEval`)

`tools.exec.strictInlineEval=true`인 경우, OpenClaw는 인터프리터 바이너리
자체가 허용 목록에 있더라도 인라인 코드 eval 형식을 승인 전용으로 취급합니다.

예시:

- `python -c`
- `node -e`, `node --eval`, `node -p`
- `ruby -e`
- `perl -e`, `perl -E`
- `php -r`
- `lua -e`
- `osascript -e`

이는 하나의 안정적인 파일 피연산자로 깔끔하게 매핑되지 않는 인터프리터
로더에 대한 다중 방어(defense-in-depth)입니다. 엄격 모드에서는:

- 이러한 명령은 여전히 명시적 승인이 필요합니다;
- `allow-always`는 이들에 대해 새로운 허용 목록 항목을 자동으로 영구 저장하지 않습니다.

## 허용 목록(에이전트별)

허용 목록은 **에이전트별**입니다. 여러 에이전트가 존재하는 경우,
macOS 앱에서 편집 중인 에이전트를 전환하세요. 패턴은
**대소문자를 구분하지 않는 glob 매치**입니다. 패턴은 **바이너리 경로**로
해석되어야 합니다(basename만 있는 항목은 무시됨). 레거시 `agents.default`
항목은 로드 시 `agents.main`으로 마이그레이션됩니다. `echo ok && pwd`
같은 셸 체인은 여전히 모든 최상위 세그먼트가 허용 목록 규칙을 만족해야 합니다.

예시:

- `~/Projects/**/bin/peekaboo`
- `~/.local/bin/*`
- `/opt/homebrew/bin/rg`

각 허용 목록 항목은 다음을 추적합니다:

- **id** UI 식별에 사용되는 안정된 UUID (선택)
- **last used** 타임스탬프
- **last used command**
- **last resolved path**

## skill CLI 자동 허용(Auto-allow skill CLIs)

**Auto-allow skill CLIs**가 활성화되면, 알려진 skill이 참조하는 실행 파일은
노드(macOS 노드 또는 헤드리스 노드 호스트)에서 허용 목록에 있는 것으로 취급됩니다.
이것은 skill bin 목록을 가져오기 위해 Gateway RPC를 통해 `skills.bins`를
사용합니다. 엄격한 수동 허용 목록을 원한다면 이것을 비활성화하세요.

중요한 신뢰 참고사항:

- 이는 수동 경로 허용 목록 항목과 별도의 **암묵적 편의 허용 목록**입니다.
- Gateway와 노드가 동일한 신뢰 경계 안에 있는 신뢰된 운영자 환경을 위한 것입니다.
- 엄격한 명시적 신뢰가 필요하다면, `autoAllowSkills: false`를 유지하고 수동 경로 허용 목록 항목만 사용하세요.

## Safe bin과 승인 전달(Safe bins and approval forwarding)

safe bin(stdin 전용 고속 경로), 인터프리터 바인딩 세부사항, Slack/Discord/Telegram에
승인 프롬프트를 전달하는 방법(또는 네이티브 승인 클라이언트로 실행하는 방법)에 대해서는
[Exec 승인 — 고급](/tools/exec-approvals-advanced)을 참조하세요.

<!-- moved to /tools/exec-approvals-advanced -->

## Control UI 편집

**Control UI → Nodes → Exec approvals** 카드를 사용해 기본값, 에이전트별
재정의, 허용 목록을 편집합니다. 스코프(Defaults 또는 에이전트)를 선택하고,
정책을 조정하고, 허용 목록 패턴을 추가/제거한 후 **Save**하세요.
UI는 패턴별 **last used** 메타데이터를 표시하여 목록을 깔끔하게 유지할 수 있습니다.

타겟 셀렉터는 **Gateway**(로컬 승인) 또는 **Node**를 선택합니다. 노드는
`system.execApprovals.get/set`을 광고해야 합니다(macOS 앱 또는 헤드리스 노드 호스트).
노드가 아직 exec 승인을 광고하지 않는다면, 해당 노드의 로컬
`~/.openclaw/exec-approvals.json`을 직접 편집하세요.

CLI: `openclaw approvals`는 gateway 또는 노드 편집을 지원합니다([승인 CLI](/cli/approvals) 참조).

## 승인 흐름(Approval flow)

프롬프트가 필요한 경우, gateway는 운영자 클라이언트에 `exec.approval.requested`를 브로드캐스트합니다.
Control UI와 macOS 앱은 `exec.approval.resolve`를 통해 이를 해결한 후, gateway는
승인된 요청을 노드 호스트로 전달합니다.

`host=node`의 경우, 승인 요청에는 정규 `systemRunPlan` 페이로드가 포함됩니다. gateway는
승인된 `system.run` 요청을 전달할 때 해당 계획을 권위 있는 command/cwd/session 컨텍스트로 사용합니다.

비동기 승인 대기 시간(latency)에 중요합니다:

- 노드 exec 경로는 미리 하나의 정규 계획을 준비합니다
- 승인 기록은 그 계획과 바인딩 메타데이터를 저장합니다
- 승인되면, 최종 전달되는 `system.run` 호출은 나중의 호출자 편집을 신뢰하는 대신
  저장된 계획을 재사용합니다
- 승인 요청이 생성된 후 호출자가 `command`, `rawCommand`, `cwd`, `agentId`, 또는
  `sessionKey`를 변경하면, gateway는 전달된 실행을 승인 불일치로 거부합니다

## 시스템 이벤트

Exec 라이프사이클은 시스템 메시지로 표면화됩니다:

- `Exec running` (명령이 실행 중 알림 임계값을 초과하는 경우에만)
- `Exec finished`
- `Exec denied`

이들은 노드가 이벤트를 보고한 후 에이전트의 세션에 게시됩니다.
Gateway 호스트 exec 승인은 명령이 완료될 때(그리고 선택적으로 임계값보다 오래 실행될 때) 동일한 라이프사이클 이벤트를 방출합니다.
승인 게이트된 exec은 손쉬운 상관관계를 위해 이러한 메시지에서 승인 id를 `runId`로 재사용합니다.

## 승인 거부 동작

비동기 exec 승인이 거부되면, OpenClaw는 에이전트가 세션에서 동일한 명령의
이전 실행 출력을 재사용하지 못하도록 합니다. 거부 사유는 사용 가능한 명령 출력이
없다는 명시적 안내와 함께 전달되며, 에이전트가 새 출력이 있다고 주장하거나
이전 성공적 실행의 오래된 결과로 거부된 명령을 반복하는 것을 막습니다.

## 함의

- **full**은 강력합니다; 가능하면 허용 목록을 선호하세요.
- **ask**는 여전히 빠른 승인을 허용하면서 여러분을 루프에 유지시킵니다.
- 에이전트별 허용 목록은 한 에이전트의 승인이 다른 에이전트로 누출되는 것을 방지합니다.
- 승인은 **권한 있는 발신자**의 호스트 exec 요청에만 적용됩니다. 권한 없는 발신자는 `/exec`를 발급할 수 없습니다.
- `/exec security=full`은 권한 있는 운영자를 위한 세션 수준 편의이며 설계상 승인을 건너뜁니다. 호스트 exec을 완전히 차단하려면, 승인 security를 `deny`로 설정하거나 툴 정책을 통해 `exec` 툴을 거부하세요.

## 관련 문서

<CardGroup cols={2}>
  <Card title="Exec 승인 — 고급" href="/tools/exec-approvals-advanced" icon="gear">
    Safe bin, 인터프리터 바인딩, 채팅으로의 승인 전달.
  </Card>
  <Card title="Exec 툴" href="/tools/exec" icon="terminal">
    셸 명령 실행 툴.
  </Card>
  <Card title="Elevated 모드" href="/tools/elevated" icon="shield-exclamation">
    승인도 건너뛰는 긴급(break-glass) 경로.
  </Card>
  <Card title="샌드박싱" href="/gateway/sandboxing" icon="box">
    샌드박스 모드 및 워크스페이스 접근.
  </Card>
  <Card title="보안" href="/gateway/security/" icon="lock">
    보안 모델 및 하드닝.
  </Card>
  <Card title="샌드박스 vs 툴 정책 vs elevated" href="/gateway/sandbox-vs-tool-policy-vs-elevated" icon="sliders">
    각 제어 수단을 언제 사용할지.
  </Card>
  <Card title="Skill" href="/tools/skills" icon="sparkles">
    Skill 기반 자동 허용 동작.
  </Card>
</CardGroup>
