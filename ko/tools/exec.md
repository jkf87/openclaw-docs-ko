---
summary: "Exec 도구 사용, stdin 모드, TTY 지원"
read_when:
  - Using or modifying the exec tool
  - Debugging stdin or TTY behavior
title: "Exec 도구"
---

# Exec 도구

워크스페이스에서 쉘 명령을 실행합니다. `process`를 통한 포그라운드 + 백그라운드 실행을 지원합니다.
`process`가 허용되지 않으면 `exec`는 동기적으로 실행되고 `yieldMs`/`background`를 무시합니다.
백그라운드 세션은 에이전트별로 범위가 지정됩니다; `process`는 동일한 에이전트의 세션만 봅니다.

## 파라미터

- `command` (필수)
- `workdir` (기본값 cwd)
- `env` (키/값 재정의)
- `yieldMs` (기본값 10000): 지연 후 자동 백그라운드
- `background` (bool): 즉시 백그라운드
- `timeout` (초, 기본값 1800): 만료 시 종료
- `pty` (bool): 사용 가능한 경우 의사 터미널에서 실행 (TTY 전용 CLI, 코딩 에이전트, 터미널 UI)
- `host` (`auto | sandbox | gateway | node`): 실행 위치
- `security` (`deny | allowlist | full`): `gateway`/`node`에 대한 시행 모드
- `ask` (`off | on-miss | always`): `gateway`/`node`에 대한 승인 프롬프트
- `node` (string): `host=node`에 대한 노드 id/이름
- `elevated` (bool): elevated 모드 요청 (샌드박스를 구성된 호스트 경로로 탈출); `security=full`은 elevated가 `full`로 해결될 때만 강제됩니다

참고:

- `host`는 기본값이 `auto`입니다: 세션에 샌드박스 런타임이 활성화된 경우 샌드박스, 그렇지 않으면 게이트웨이.
- `auto`는 기본 라우팅 전략이며 와일드카드가 아닙니다. 호출별 `host=node`는 `auto`에서 허용됩니다; `host=gateway`는 활성 샌드박스 런타임이 없을 때만 허용됩니다.
- 추가 구성 없이 `host=auto`는 여전히 "그냥 작동"합니다: 샌드박스가 없으면 게이트웨이로 해결되고; 라이브 샌드박스가 있으면 샌드박스에 유지됩니다.
- `elevated`는 샌드박스를 구성된 호스트 경로로 탈출합니다: 기본값으로 `gateway`, 또는 `tools.exec.host=node`인 경우 `node` (또는 세션 기본값이 `host=node`). elevated 액세스가 현재 세션/프로바이더에 대해 활성화된 경우에만 사용 가능합니다.
- `gateway`/`node` 승인은 `~/.openclaw/exec-approvals.json`으로 제어됩니다.
- `node`는 페어링된 노드(컴패니언 앱 또는 헤드리스 노드 호스트)가 필요합니다.
- 여러 노드를 사용할 수 있는 경우 `exec.node` 또는 `tools.exec.node`를 설정하여 하나를 선택하십시오.
- `exec host=node`는 노드에 대한 유일한 쉘 실행 경로입니다; 레거시 `nodes.run` 래퍼는 제거되었습니다.
- 비 Windows 호스트에서 exec는 `SHELL`이 설정된 경우 사용합니다; `SHELL`이 `fish`인 경우 `PATH`에서 `bash`(또는 `sh`)를 선호하여 fish 호환되지 않는 스크립트를 방지한 후 둘 다 존재하지 않으면 `SHELL`로 폴백합니다.
- Windows 호스트에서 exec는 PowerShell 7(`pwsh`) 검색을 선호합니다(Program Files, ProgramW6432, 그런 다음 PATH), Windows PowerShell 5.1로 폴백합니다.
- 호스트 실행(`gateway`/`node`)은 바이너리 하이재킹이나 삽입된 코드를 방지하기 위해 `env.PATH` 및 로더 재정의(`LD_*`/`DYLD_*`)를 거부합니다.
- OpenClaw는 생성된 명령 환경(PTY 및 샌드박스 실행 포함)에 `OPENCLAW_SHELL=exec`를 설정하여 쉘/프로파일 규칙이 exec 도구 컨텍스트를 감지할 수 있도록 합니다.
- 중요: 샌드박싱은 **기본적으로 비활성화**됩니다. 샌드박싱이 꺼져 있으면 암묵적 `host=auto`는 `gateway`로 해결됩니다. 명시적 `host=sandbox`는 여전히 게이트웨이 호스트에서 자동으로 실행하는 대신 실패 폐쇄합니다. 샌드박싱을 활성화하거나 승인과 함께 `host=gateway`를 사용하십시오.
- 스크립트 프리플라이트 검사(일반적인 Python/Node 쉘 구문 오류)는 유효 `workdir` 경계 내부의 파일만 검사합니다. 스크립트 경로가 `workdir` 외부로 해결되면 해당 파일에 대한 프리플라이트를 건너뜁니다.
- 지금 시작되는 장기 실행 작업의 경우 한 번 시작하고 자동 완료 웨이크가 활성화되고 명령이 출력을 내보내거나 실패할 때를 기다리십시오.
  슬립 루프, 타임아웃 루프, 또는 반복 폴링으로 예약을 에뮬레이트하는 데 `process`를 사용하지 마십시오.
- 나중에 또는 일정에 따라 발생해야 하는 작업의 경우 `exec` 슬립/지연 패턴 대신 크론을 사용하십시오.

## 구성

- `tools.exec.notifyOnExit` (기본값: true): true인 경우 백그라운드 exec 세션이 종료 시 시스템 이벤트를 대기열에 넣고 하트비트를 요청합니다.
- `tools.exec.approvalRunningNoticeMs` (기본값: 10000): 승인 게이팅 exec가 이보다 오래 실행될 때 단일 "실행 중" 알림을 내보냅니다 (0은 비활성화).
- `tools.exec.host` (기본값: `auto`; 샌드박스 런타임이 활성화된 경우 `sandbox`로, 그렇지 않으면 `gateway`로 해결)
- `tools.exec.security` (기본값: 샌드박스의 경우 `deny`, 설정되지 않은 경우 게이트웨이 + 노드의 경우 `full`)
- `tools.exec.ask` (기본값: `off`)
- 게이트웨이 + 노드에 대한 승인 없는 호스트 exec가 기본값입니다. 승인/허용 목록 동작을 원한다면 `tools.exec.*`와 호스트 `~/.openclaw/exec-approvals.json` 모두를 강화하십시오; [Exec 승인](/tools/exec-approvals#no-approval-yolo-mode)을 참조하십시오.
- YOLO는 `host=auto`가 아닌 호스트 정책 기본값(`security=full`, `ask=off`)에서 옵니다. 게이트웨이 또는 노드 라우팅을 강제하려면 `tools.exec.host`를 설정하거나 `/exec host=...`를 사용하십시오.
- `security=full` 및 `ask=off` 모드에서 호스트 exec는 구성된 정책을 직접 따릅니다; 추가 휴리스틱 명령 난독화 사전 필터가 없습니다.
- `tools.exec.node` (기본값: 설정되지 않음)
- `tools.exec.strictInlineEval` (기본값: false): true인 경우 `python -c`, `node -e`, `ruby -e`, `perl -e`, `php -r`, `lua -e`, `osascript -e` 같은 인라인 인터프리터 eval 형식은 항상 명시적 승인이 필요합니다. `allow-always`는 여전히 양성 인터프리터/스크립트 호출을 지속할 수 있지만 인라인 eval 형식은 매번 프롬프트됩니다.
- `tools.exec.pathPrepend`: exec 실행을 위해 `PATH`에 앞에 추가할 디렉토리 목록 (게이트웨이 + 샌드박스만).
- `tools.exec.safeBins`: 명시적 허용 목록 항목 없이 실행할 수 있는 stdin 전용 안전 바이너리. 동작 세부 정보는 [안전 빈](/tools/exec-approvals#safe-bins-stdin-only)을 참조하십시오.
- `tools.exec.safeBinTrustedDirs`: `safeBins` 경로 확인을 위해 신뢰된 추가 명시적 디렉토리. `PATH` 항목은 자동으로 신뢰되지 않습니다. 내장 기본값은 `/bin`과 `/usr/bin`입니다.
- `tools.exec.safeBinProfiles`: 안전 빈별 선택적 사용자 정의 argv 정책 (`minPositional`, `maxPositional`, `allowedValueFlags`, `deniedFlags`).

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

- `host=gateway`: 로그인 쉘 `PATH`를 exec 환경에 병합합니다. `env.PATH` 재정의는 호스트 실행에 대해 거부됩니다. 데몬 자체는 최소한의 `PATH`로 실행됩니다:
  - macOS: `/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, `/bin`
  - Linux: `/usr/local/bin`, `/usr/bin`, `/bin`
- `host=sandbox`: 컨테이너 내부에서 `sh -lc`(로그인 쉘)를 실행하므로 `/etc/profile`이 `PATH`를 재설정할 수 있습니다.
  OpenClaw는 내부 환경 변수를 통해 프로파일 소싱 후 `env.PATH`를 앞에 추가합니다(쉘 보간 없음); `tools.exec.pathPrepend`도 여기에 적용됩니다.
- `host=node`: 전달하는 비 차단된 환경 재정의만 노드로 전송됩니다. `env.PATH` 재정의는 호스트 실행에 대해 거부되고 노드 호스트에서 무시됩니다. 노드에 추가 PATH 항목이 필요한 경우 노드 호스트 서비스 환경(systemd/launchd)을 구성하거나 표준 위치에 도구를 설치하십시오.

에이전트별 노드 바인딩(구성에서 에이전트 목록 인덱스 사용):

```bash
openclaw config get agents.list
openclaw config set agents.list[0].tools.exec.node "node-id-or-name"
```

Control UI: 노드 탭에는 동일한 설정을 위한 작은 "Exec 노드 바인딩" 패널이 포함됩니다.

## 세션 재정의 (`/exec`)

`/exec`를 사용하여 `host`, `security`, `ask`, `node`에 대한 **세션별** 기본값을 설정하십시오.
인수 없이 `/exec`를 전송하면 현재 값이 표시됩니다.

예시:

```
/exec host=auto security=allowlist ask=on-miss node=mac-1
```

## 인증 모델

`/exec`는 **승인된 발신자**에 대해서만 적용됩니다 (채널 허용 목록/페어링 및 `commands.useAccessGroups`).
**세션 상태만** 업데이트하며 구성을 작성하지 않습니다. exec를 하드 비활성화하려면 도구 정책을 통해 거부하십시오 (`tools.deny: ["exec"]` 또는 에이전트별). 호스트 승인은 `security=full` 및 `ask=off`를 명시적으로 설정하지 않는 한 여전히 적용됩니다.

## Exec 승인 (컴패니언 앱 / 노드 호스트)

샌드박스화된 에이전트는 `exec`가 게이트웨이 또는 노드 호스트에서 실행되기 전에 요청별 승인을 요구할 수 있습니다.
정책, 허용 목록, UI 흐름은 [Exec 승인](/tools/exec-approvals)을 참조하십시오.

승인이 필요한 경우 exec 도구는 즉시 `status: "approval-pending"` 및 승인 ID와 함께 반환됩니다. 승인(또는 거부 / 타임아웃)되면 게이트웨이는 시스템 이벤트(`Exec finished` / `Exec denied`)를 발생시킵니다. `tools.exec.approvalRunningNoticeMs` 후에도 명령이 여전히 실행 중이면 단일 `Exec running` 알림이 발생됩니다.
네이티브 승인 카드/버튼이 있는 채널에서 에이전트는 해당 네이티브 UI에 먼저 의존해야 하며 도구 결과가 채팅 승인을 사용할 수 없다거나 수동 승인이 유일한 남은 경로라고 명시적으로 말하는 경우에만 수동 `/approve` 명령을 포함해야 합니다.

## 허용 목록 + 안전 빈

수동 허용 목록 시행은 **해결된 바이너리 경로만** 일치합니다 (기본 이름 일치 없음). `security=allowlist`인 경우 쉘 명령은 모든 파이프라인 세그먼트가 허용 목록에 있거나 안전 빈인 경우에만 자동 허용됩니다. 체이닝(`;`, `&&`, `||`) 및 리디렉션은 모든 최상위 세그먼트가 허용 목록을 충족하는 경우를 제외하고 허용 목록 모드에서 거부됩니다(안전 빈 포함). 리디렉션은 여전히 지원되지 않습니다.
지속적인 `allow-always` 신뢰는 해당 규칙을 우회하지 않습니다: 체인된 명령은 모든 최상위 세그먼트가 일치하도록 여전히 요구됩니다.

`autoAllowSkills`는 exec 승인의 별도 편의 경로입니다. 수동 경로 허용 목록 항목과 동일하지 않습니다. 엄격한 명시적 신뢰의 경우 `autoAllowSkills`를 비활성화 상태로 유지하십시오.

두 컨트롤을 다른 용도로 사용하십시오:

- `tools.exec.safeBins`: 작고 stdin 전용인 스트림 필터.
- `tools.exec.safeBinTrustedDirs`: 안전 빈 실행 파일 경로를 위한 명시적 추가 신뢰된 디렉토리.
- `tools.exec.safeBinProfiles`: 사용자 정의 안전 빈을 위한 명시적 argv 정책.
- 허용 목록: 실행 파일 경로에 대한 명시적 신뢰.

`safeBins`를 일반 허용 목록으로 취급하지 마십시오. 인터프리터/런타임 바이너리(예: `python3`, `node`, `ruby`, `bash`)를 추가하지 마십시오. 이것들이 필요하면 명시적 허용 목록 항목을 사용하고 승인 프롬프트를 활성화 상태로 유지하십시오.
`openclaw security audit`는 명시적 프로파일이 없는 인터프리터/런타임 `safeBins` 항목에 대해 경고하고, `openclaw doctor --fix`는 누락된 사용자 정의 `safeBinProfiles` 항목을 스캐폴딩할 수 있습니다.
`openclaw security audit`와 `openclaw doctor`는 `jq` 같은 광범위한 동작 빈을 `safeBins`에 명시적으로 다시 추가할 때도 경고합니다.
인터프리터를 명시적으로 허용 목록에 추가하는 경우 인라인 코드 eval 형식이 여전히 새 승인을 요구하도록 `tools.exec.strictInlineEval`을 활성화하십시오.

전체 정책 세부 정보 및 예시는 [Exec 승인](/tools/exec-approvals#safe-bins-stdin-only) 및 [안전 빈 대 허용 목록](/tools/exec-approvals#safe-bins-versus-allowlist)을 참조하십시오.

## 예시

포그라운드:

```json
{ "tool": "exec", "command": "ls -la" }
```

백그라운드 + 폴:

```json
{"tool":"exec","command":"npm run build","yieldMs":1000}
{"tool":"process","action":"poll","sessionId":"<id>"}
```

폴링은 온디맨드 상태 확인용입니다. 자동 완료 웨이크가 활성화된 경우 명령은 출력을 내보내거나 실패할 때 세션을 깨울 수 있습니다.

키 전송 (tmux 스타일):

```json
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Enter"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["C-c"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Up","Up","Enter"]}
```

제출 (CR만 전송):

```json
{ "tool": "process", "action": "submit", "sessionId": "<id>" }
```

붙여넣기 (기본값으로 괄호 포함):

```json
{ "tool": "process", "action": "paste", "sessionId": "<id>", "text": "line1\nline2\n" }
```

## apply_patch

`apply_patch`는 구조화된 다중 파일 편집을 위한 `exec`의 하위 도구입니다.
OpenAI 및 OpenAI Codex 모델에 대해 기본적으로 활성화됩니다. 비활성화하거나 특정 모델로 제한하려는 경우에만 구성을 사용하십시오:

```json5
{
  tools: {
    exec: {
      applyPatch: { workspaceOnly: true, allowModels: ["gpt-5.4"] },
    },
  },
}
```

참고:

- OpenAI/OpenAI Codex 모델에서만 사용 가능합니다.
- 도구 정책이 여전히 적용됩니다; `allow: ["write"]`는 암묵적으로 `apply_patch`를 허용합니다.
- 구성은 `tools.exec.applyPatch` 아래에 있습니다.
- `tools.exec.applyPatch.enabled`는 기본값이 `true`입니다; OpenAI 모델에 대해 도구를 비활성화하려면 `false`로 설정하십시오.
- `tools.exec.applyPatch.workspaceOnly`는 기본값이 `true`(워크스페이스 포함)입니다. `apply_patch`가 워크스페이스 디렉토리 외부에 쓰거나 삭제할 수 있도록 의도적으로 원하는 경우에만 `false`로 설정하십시오.

## 관련 항목

- [Exec 승인](/tools/exec-approvals) — 쉘 명령에 대한 승인 게이트
- [샌드박싱](/gateway/sandboxing) — 샌드박스 환경에서 명령 실행
- [백그라운드 프로세스](/gateway/background-process) — 장기 실행 exec 및 프로세스 도구
- [보안](/gateway/security/) — 도구 정책 및 elevated 액세스
