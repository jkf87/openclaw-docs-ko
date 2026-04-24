---
summary: "Exec 툴 사용법, stdin 모드, TTY 지원"
read_when:
  - exec 툴을 사용하거나 수정할 때
  - stdin 또는 TTY 동작을 디버깅할 때
title: "Exec 툴"
---

워크스페이스에서 셸 명령을 실행합니다. `process`를 통해 포그라운드 + 백그라운드 실행을 지원합니다.
`process`가 허용되지 않으면, `exec`는 동기적으로 실행되며 `yieldMs`/`background`를 무시합니다.
백그라운드 세션은 에이전트별로 스코프됩니다; `process`는 동일한 에이전트의 세션만 볼 수 있습니다.

## 매개변수(Parameters)

<ParamField path="command" type="string" required>
실행할 셸 명령.
</ParamField>

<ParamField path="workdir" type="string" default="cwd">
명령의 작업 디렉터리.
</ParamField>

<ParamField path="env" type="object">
상속된 환경 위에 병합되는 키/값 환경 재정의.
</ParamField>

<ParamField path="yieldMs" type="number" default="10000">
이 지연 시간(ms) 후 명령을 자동으로 백그라운드 처리합니다.
</ParamField>

<ParamField path="background" type="boolean" default="false">
`yieldMs`를 기다리지 않고 즉시 명령을 백그라운드로 보냅니다.
</ParamField>

<ParamField path="timeout" type="number" default="1800">
이 시간(초) 후 명령을 종료(kill)합니다.
</ParamField>

<ParamField path="pty" type="boolean" default="false">
사용 가능한 경우 의사 터미널(pseudo-terminal)에서 실행합니다. TTY 전용 CLI, 코딩 에이전트, 터미널 UI에 사용하세요.
</ParamField>

<ParamField path="host" type="'auto' | 'sandbox' | 'gateway' | 'node'" default="auto">
실행 위치. `auto`는 샌드박스 런타임이 활성화된 경우 `sandbox`로, 그렇지 않으면 `gateway`로 해석됩니다.
</ParamField>

<ParamField path="security" type="'deny' | 'allowlist' | 'full'">
`gateway` / `node` 실행에 대한 강제 모드.
</ParamField>

<ParamField path="ask" type="'off' | 'on-miss' | 'always'">
`gateway` / `node` 실행에 대한 승인 프롬프트 동작.
</ParamField>

<ParamField path="node" type="string">
`host=node`인 경우의 노드 id/이름.
</ParamField>

<ParamField path="elevated" type="boolean" default="false">
Elevated 모드 요청 — 구성된 호스트 경로로 샌드박스를 탈출합니다. `security=full`은 elevated가 `full`로 해석될 때만 강제됩니다.
</ParamField>

참고:

- `host`의 기본값은 `auto`입니다: 세션에 샌드박스 런타임이 활성화되어 있으면 sandbox, 그렇지 않으면 gateway.
- `auto`는 기본 라우팅 전략이며 와일드카드가 아닙니다. 호출당 `host=node`는 `auto`에서 허용됩니다; 호출당 `host=gateway`는 샌드박스 런타임이 활성화되지 않은 경우에만 허용됩니다.
- 추가 구성이 없어도 `host=auto`는 여전히 "바로 동작"합니다: 샌드박스가 없으면 `gateway`로 해석되고, 활성 샌드박스가 있으면 샌드박스에 머뭅니다.
- `elevated`는 구성된 호스트 경로로 샌드박스를 탈출합니다: 기본적으로 `gateway`, 또는 `tools.exec.host=node`인 경우(혹은 세션 기본값이 `host=node`인 경우) `node`. 현재 세션/프로바이더에 elevated 접근이 활성화된 경우에만 사용할 수 있습니다.
- `gateway`/`node` 승인은 `~/.openclaw/exec-approvals.json`으로 제어됩니다.
- `node`는 페어링된 노드(컴패니언 앱 또는 헤드리스 노드 호스트)가 필요합니다.
- 여러 노드를 사용할 수 있는 경우, `exec.node` 또는 `tools.exec.node`를 설정해 하나를 선택하세요.
- `exec host=node`는 노드에 대한 유일한 셸 실행 경로입니다; 레거시 `nodes.run` 래퍼는 제거되었습니다.
- 비Windows 호스트에서 exec은 `SHELL`이 설정된 경우 이를 사용합니다; `SHELL`이 `fish`인 경우,
  fish 비호환 스크립트를 피하기 위해 `PATH`에서 `bash`(또는 `sh`)를 선호하고,
  둘 다 없으면 `SHELL`로 폴백합니다.
- Windows 호스트에서 exec은 PowerShell 7(`pwsh`) 검색(Program Files, ProgramW6432, 그 다음 PATH)을 선호한 후,
  Windows PowerShell 5.1로 폴백합니다.
- 호스트 실행(`gateway`/`node`)은 바이너리 하이재킹이나 주입된 코드를 방지하기 위해
  `env.PATH`와 로더 재정의(`LD_*`/`DYLD_*`)를 거부합니다.
- OpenClaw는 생성된 명령 환경(PTY 및 샌드박스 실행 포함)에 `OPENCLAW_SHELL=exec`을 설정하여, 셸/프로파일 규칙이 exec 툴 컨텍스트를 감지할 수 있게 합니다.
- 중요: 샌드박싱은 **기본적으로 꺼져 있습니다**. 샌드박싱이 꺼져 있으면, 암묵적 `host=auto`는
  `gateway`로 해석됩니다. 명시적 `host=sandbox`는 여전히 gateway 호스트에서 조용히
  실행되는 대신 fail-closed됩니다. 샌드박싱을 활성화하거나 승인과 함께 `host=gateway`를 사용하세요.
- 스크립트 프리플라이트 체크(일반적인 Python/Node 셸 구문 오류에 대한)는 유효 `workdir` 경계 내부의
  파일만 검사합니다. 스크립트 경로가 `workdir` 외부로 해석되면, 해당 파일에 대한 프리플라이트는
  건너뜁니다.
- 지금 시작되는 장기 실행 작업의 경우, 한 번 시작한 후 자동 완료 웨이크가 활성화되어 있고
  명령이 출력을 방출하거나 실패할 때 일어나는 것에 의존하세요.
  로그, 상태, 입력 또는 개입에는 `process`를 사용하세요; sleep 루프, timeout 루프,
  반복 폴링으로 스케줄링을 에뮬레이트하지 마세요.
- 나중에 또는 일정에 맞춰 일어나야 하는 작업의 경우, `exec` sleep/지연 패턴 대신
  cron을 사용하세요.

## 구성(Config)

- `tools.exec.notifyOnExit` (기본값: true): true인 경우 백그라운드 exec 세션은 종료 시 시스템 이벤트를 큐에 넣고 하트비트를 요청합니다.
- `tools.exec.approvalRunningNoticeMs` (기본값: 10000): 승인 게이트된 exec이 이보다 오래 실행되면 단일 "running" 알림을 방출합니다(0은 비활성화).
- `tools.exec.host` (기본값: `auto`; 샌드박스 런타임이 활성화된 경우 `sandbox`로, 그렇지 않으면 `gateway`로 해석)
- `tools.exec.security` (기본값: 샌드박스의 경우 `deny`, 설정되지 않은 경우 gateway + node에 대해 `full`)
- `tools.exec.ask` (기본값: `off`)
- 무승인 호스트 exec이 gateway + node의 기본값입니다. 승인/허용 목록 동작을 원한다면, `tools.exec.*`와 호스트 `~/.openclaw/exec-approvals.json`을 모두 조이세요; [Exec 승인](/tools/exec-approvals#no-approval-yolo-mode)을 참조하세요.
- YOLO는 `host=auto`가 아닌 호스트 정책 기본값(`security=full`, `ask=off`)에서 옵니다. gateway 또는 node 라우팅을 강제하려면, `tools.exec.host`를 설정하거나 `/exec host=...`를 사용하세요.
- `security=full`에 `ask=off` 모드에서 호스트 exec은 구성된 정책을 직접 따릅니다; 추가 휴리스틱 명령 난독화 사전 필터나 스크립트 프리플라이트 거부 레이어는 없습니다.
- `tools.exec.node` (기본값: 설정되지 않음)
- `tools.exec.strictInlineEval` (기본값: false): true인 경우 `python -c`, `node -e`, `ruby -e`, `perl -e`, `php -r`, `lua -e`, `osascript -e` 같은 인라인 인터프리터 eval 형식은 항상 명시적 승인이 필요합니다. `allow-always`는 여전히 무해한 인터프리터/스크립트 호출을 영구 저장할 수 있지만, 인라인 eval 형식은 여전히 매번 프롬프트됩니다.
- `tools.exec.pathPrepend`: exec 실행에 대해 `PATH` 앞에 추가할 디렉터리 목록(gateway + sandbox 전용).
- `tools.exec.safeBins`: 명시적 허용 목록 항목 없이 실행할 수 있는 stdin 전용 안전 바이너리. 동작 세부사항은 [Safe bins](/tools/exec-approvals-advanced#safe-bins-stdin-only)를 참조하세요.
- `tools.exec.safeBinTrustedDirs`: `safeBins` 경로 체크에 신뢰되는 추가 명시적 디렉터리. `PATH` 항목은 결코 자동으로 신뢰되지 않습니다. 내장 기본값은 `/bin`과 `/usr/bin`입니다.
- `tools.exec.safeBinProfiles`: safe bin별 선택적 커스텀 argv 정책(`minPositional`, `maxPositional`, `allowedValueFlags`, `deniedFlags`).

예시:

```json5
{
  tools: {
    exec: {
      pathPrepend: ["~/bin", "/opt/oss/bin"],
    },
  },
}
```

### PATH 처리

- `host=gateway`: 로그인 셸의 `PATH`를 exec 환경으로 병합합니다. 호스트 실행에 대해 `env.PATH` 재정의는
  거부됩니다. 데몬 자체는 여전히 최소한의 `PATH`로 실행됩니다:
  - macOS: `/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, `/bin`
  - Linux: `/usr/local/bin`, `/usr/bin`, `/bin`
- `host=sandbox`: 컨테이너 내부에서 `sh -lc`(로그인 셸)를 실행하므로 `/etc/profile`이 `PATH`를 재설정할 수 있습니다.
  OpenClaw는 내부 env 변수를 통해 프로파일 소싱 후 `env.PATH`를 prepend합니다(셸 보간 없음);
  `tools.exec.pathPrepend`도 여기에 적용됩니다.
- `host=node`: 여러분이 전달한 non-blocked env 재정의만 노드로 전송됩니다. 호스트 실행에 대해 `env.PATH`
  재정의는 거부되고 노드 호스트에 의해 무시됩니다. 노드에 추가 PATH 항목이 필요한 경우,
  노드 호스트 서비스 환경(systemd/launchd)을 구성하거나 표준 위치에 툴을 설치하세요.

에이전트별 노드 바인딩(구성에서 에이전트 목록 인덱스 사용):

```bash
openclaw config get agents.list
openclaw config set agents.list[0].tools.exec.node "node-id-or-name"
```

Control UI: Nodes 탭에는 동일한 설정을 위한 작은 "Exec node binding" 패널이 포함되어 있습니다.

## 세션 재정의 (`/exec`)

`/exec`를 사용해 `host`, `security`, `ask`, `node`의 **세션별** 기본값을 설정합니다.
인자 없이 `/exec`를 보내면 현재 값을 표시합니다.

예시:

```
/exec host=auto security=allowlist ask=on-miss node=mac-1
```

## 권한 모델

`/exec`는 **권한 있는 발신자**(채널 허용 목록/페어링 + `commands.useAccessGroups`)에 대해서만 존중됩니다.
**세션 상태만** 업데이트하며 구성을 쓰지 않습니다. exec을 완전히 비활성화하려면, 툴 정책
(`tools.deny: ["exec"]` 또는 에이전트별)을 통해 거부하세요. 호스트 승인은 `security=full`과 `ask=off`를
명시적으로 설정하지 않는 한 여전히 적용됩니다.

## Exec 승인 (컴패니언 앱 / 노드 호스트)

샌드박스화된 에이전트는 gateway 또는 노드 호스트에서 `exec`이 실행되기 전에 요청별 승인을 요구할 수 있습니다.
정책, 허용 목록, UI 흐름은 [Exec 승인](/tools/exec-approvals)을 참조하세요.

승인이 필요한 경우, exec 툴은 `status: "approval-pending"`과 승인 id로 즉시 반환됩니다.
승인(또는 거부 / 시간 초과)되면, Gateway는 시스템 이벤트(`Exec finished` / `Exec denied`)를 방출합니다.
명령이 `tools.exec.approvalRunningNoticeMs` 후에도 여전히 실행 중이면, 단일 `Exec running` 알림이 방출됩니다.
네이티브 승인 카드/버튼이 있는 채널에서 에이전트는 먼저 그 네이티브 UI에 의존해야 하며,
툴 결과가 채팅 승인을 사용할 수 없거나 수동 승인이 유일한 경로라고 명시적으로 말할 때만
수동 `/approve` 명령을 포함해야 합니다.

## 허용 목록 + safe bins

수동 허용 목록 강제는 **해석된 바이너리 경로에만** 매치합니다(basename 매치 없음).
`security=allowlist`인 경우, 셸 명령은 모든 파이프라인 세그먼트가 허용 목록에 있거나
safe bin인 경우에만 자동 허용됩니다. 체이닝(`;`, `&&`, `||`)과 리다이렉션은 허용 목록 모드에서
모든 최상위 세그먼트가 허용 목록(safe bin 포함)을 만족하지 않는 한 거부됩니다.
리다이렉션은 여전히 지원되지 않습니다.
영구 `allow-always` 신뢰는 이 규칙을 우회하지 않습니다: 체이닝된 명령은 여전히 모든
최상위 세그먼트가 매치되어야 합니다.

`autoAllowSkills`는 exec 승인의 별도 편의 경로입니다. 수동 경로 허용 목록 항목과는 다릅니다.
엄격한 명시적 신뢰를 원한다면, `autoAllowSkills`를 비활성화된 상태로 유지하세요.

두 가지 제어 수단을 서로 다른 작업에 사용하세요:

- `tools.exec.safeBins`: 작은, stdin 전용 스트림 필터.
- `tools.exec.safeBinTrustedDirs`: safe bin 실행 파일 경로를 위한 명시적 추가 신뢰 디렉터리.
- `tools.exec.safeBinProfiles`: 커스텀 safe bin에 대한 명시적 argv 정책.
- 허용 목록: 실행 파일 경로에 대한 명시적 신뢰.

`safeBins`를 일반 허용 목록으로 취급하지 말고, 인터프리터/런타임 바이너리(예: `python3`, `node`, `ruby`, `bash`)를 추가하지 마세요. 그런 것이 필요하다면, 명시적 허용 목록 항목을 사용하고 승인 프롬프트를 활성화 상태로 유지하세요.
`openclaw security audit`은 인터프리터/런타임 `safeBins` 항목에 명시적 프로필이 누락되었을 때 경고하며, `openclaw doctor --fix`는 누락된 커스텀 `safeBinProfiles` 항목을 스캐폴딩할 수 있습니다.
`openclaw security audit`과 `openclaw doctor`는 또한 `jq` 같은 광범위 동작 bin을 `safeBins`에 명시적으로 다시 추가할 때 경고합니다.
인터프리터를 명시적으로 허용 목록에 추가한다면, 인라인 코드 eval 형식이 여전히 새로운 승인을 요구하도록 `tools.exec.strictInlineEval`을 활성화하세요.

전체 정책 세부사항과 예시는 [Exec 승인](/tools/exec-approvals-advanced#safe-bins-stdin-only)과 [Safe bins 대 허용 목록](/tools/exec-approvals-advanced#safe-bins-versus-allowlist)을 참조하세요.

## 예시

포그라운드:

```json
{ "tool": "exec", "command": "ls -la" }
```

백그라운드 + 폴링:

```json
{"tool":"exec","command":"npm run build","yieldMs":1000}
{"tool":"process","action":"poll","sessionId":"<id>"}
```

폴링은 대기 루프가 아닌 온디맨드 상태를 위한 것입니다. 자동 완료 웨이크가 활성화되어 있으면,
명령이 출력을 방출하거나 실패할 때 세션을 깨울 수 있습니다.

키 전송(tmux 스타일):

```json
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Enter"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["C-c"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Up","Up","Enter"]}
```

제출 (CR만 전송):

```json
{ "tool": "process", "action": "submit", "sessionId": "<id>" }
```

붙여넣기 (기본적으로 bracketed):

```json
{ "tool": "process", "action": "paste", "sessionId": "<id>", "text": "line1\nline2\n" }
```

## apply_patch

`apply_patch`는 구조화된 다중 파일 편집을 위한 `exec`의 하위 툴입니다.
OpenAI 및 OpenAI Codex 모델에 대해 기본적으로 활성화됩니다. 비활성화하거나
특정 모델로 제한하려는 경우에만 구성을 사용하세요:

```json5
{
  tools: {
    exec: {
      applyPatch: { workspaceOnly: true, allowModels: ["gpt-5.5"] },
    },
  },
}
```

참고:

- OpenAI/OpenAI Codex 모델에서만 사용할 수 있습니다.
- 툴 정책은 여전히 적용됩니다; `allow: ["write"]`는 암묵적으로 `apply_patch`를 허용합니다.
- 구성은 `tools.exec.applyPatch` 아래에 있습니다.
- `tools.exec.applyPatch.enabled`의 기본값은 `true`입니다; OpenAI 모델에 대해 툴을 비활성화하려면 `false`로 설정하세요.
- `tools.exec.applyPatch.workspaceOnly`의 기본값은 `true`입니다(워크스페이스 포함). `apply_patch`가 워크스페이스 디렉터리 외부에 쓰기/삭제하는 것을 의도적으로 원하는 경우에만 `false`로 설정하세요.

## 관련 문서

- [Exec 승인](/tools/exec-approvals) — 셸 명령을 위한 승인 게이트
- [샌드박싱](/gateway/sandboxing) — 샌드박스 환경에서 명령 실행
- [백그라운드 프로세스](/gateway/background-process) — 장기 실행 exec과 process 툴
- [보안](/gateway/security/) — 툴 정책과 elevated 접근
