---
title: "Exec 승인"
description: "Exec 승인, 허용 목록, 샌드박스 탈출 프롬프트"
---

# Exec 승인

Exec 승인은 샌드박스화된 에이전트가 실제 호스트(`gateway` 또는 `node`)에서 명령을 실행하도록 허용하기 위한 **컴패니언 앱 / 노드 호스트 가드레일**입니다. 안전 인터록처럼 생각하십시오:
명령은 정책 + 허용 목록 + (선택적) 사용자 승인이 모두 동의할 때만 허용됩니다.
Exec 승인은 도구 정책 및 elevated 게이팅에 **추가로** 적용됩니다 (elevated가 `full`로 설정된 경우 승인을 건너뜁니다).
유효 정책은 `tools.exec.*`와 승인 기본값 중 **더 엄격한** 것입니다; 승인 필드가 생략되면 `tools.exec` 값이 사용됩니다.
호스트 exec는 해당 머신의 로컬 승인 상태도 사용합니다. `~/.openclaw/exec-approvals.json`의 호스트 로컬 `ask: "always"`는 세션이나 구성 기본값이 `ask: "on-miss"`를 요청하더라도 계속 프롬프트를 표시합니다.
요청된 정책, 호스트 정책 소스 및 유효 결과를 검사하려면 `openclaw approvals get`, `openclaw approvals get --gateway`, 또는 `openclaw approvals get --node &lt;id|name|ip&gt;`를 사용하십시오.

컴패니언 앱 UI가 **사용할 수 없는** 경우, 프롬프트가 필요한 모든 요청은 **ask 폴백**(기본값: deny)으로 해결됩니다.

네이티브 채팅 승인 클라이언트는 보류 중인 승인 메시지에 채널별 어포던스를 노출할 수도 있습니다. 예를 들어, Matrix는 승인 프롬프트에 반응 바로 가기(`✅` 한 번 허용, `❌` 거부, `♾️` 항상 허용)를 심을 수 있으면서도 메시지에 `/approve ...` 명령어를 폴백으로 남겨둡니다.

## 적용 위치

Exec 승인은 실행 호스트에서 로컬로 적용됩니다:

- **게이트웨이 호스트** → 게이트웨이 머신의 `openclaw` 프로세스
- **노드 호스트** → 노드 러너 (macOS 컴패니언 앱 또는 헤드리스 노드 호스트)

신뢰 모델 참고:

- 게이트웨이 인증 호출자는 해당 게이트웨이의 신뢰된 운영자입니다.
- 페어링된 노드는 해당 신뢰된 운영자 기능을 노드 호스트로 확장합니다.
- Exec 승인은 우발적 실행 위험을 줄이지만, 사용자별 인증 경계가 아닙니다.
- 승인된 노드 호스트 실행은 정식 실행 컨텍스트를 바인딩합니다: 정식 cwd, 정확한 argv, 환경 바인딩(있는 경우), 적용 가능한 경우 고정된 실행 파일 경로.
- 쉘 스크립트와 직접 인터프리터/런타임 파일 호출의 경우 OpenClaw는 하나의 구체적인 로컬 파일 피연산자를 바인딩하려고 시도합니다. 승인 후 실행 전에 해당 바인딩된 파일이 변경되면 드리프트된 콘텐츠를 실행하는 대신 실행이 거부됩니다.
- 이 파일 바인딩은 의도적으로 모든 인터프리터/런타임 로더 경로의 완전한 의미론적 모델이 아닌 최선 노력 방식입니다. 승인 모드가 바인딩할 정확히 하나의 구체적인 로컬 파일을 식별할 수 없으면, 완전한 적용 범위인 척하는 대신 승인 지원 실행을 허가하기를 거부합니다.

macOS 분리:

- **노드 호스트 서비스**는 로컬 IPC를 통해 `system.run`을 **macOS 앱**에 전달합니다.
- **macOS 앱**은 UI 컨텍스트에서 승인 + 명령 실행을 시행합니다.

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

## 승인 없는 "YOLO" 모드

승인 프롬프트 없이 호스트 exec를 실행하려면 **두** 정책 레이어를 모두 열어야 합니다:

- OpenClaw 구성에서 요청된 exec 정책 (`tools.exec.*`)
- `~/.openclaw/exec-approvals.json`의 호스트 로컬 승인 정책

이것은 명시적으로 강화하지 않는 한 현재 기본 호스트 동작입니다:

- `tools.exec.security`: `gateway`/`node`에서 `full`
- `tools.exec.ask`: `off`
- 호스트 `askFallback`: `full`

중요한 구분:

- `tools.exec.host=auto`는 exec가 실행되는 위치를 선택합니다: 사용 가능한 경우 샌드박스, 그렇지 않으면 게이트웨이.
- YOLO는 호스트 exec가 승인되는 방식을 선택합니다: `security=full` + `ask=off`.
- YOLO 모드에서 OpenClaw는 구성된 호스트 exec 정책 위에 별도의 휴리스틱 명령 난독화 승인 게이트를 추가하지 않습니다.
- `auto`는 샌드박스화된 세션에서 게이트웨이 라우팅을 자유 재정의로 만들지 않습니다. 호출별 `host=node` 요청은 `auto`에서 허용되고, `host=gateway`는 활성 샌드박스 런타임이 없을 때만 `auto`에서 허용됩니다. 안정적인 비자동 기본값을 원한다면 `tools.exec.host`를 설정하거나 `/exec host=...`를 명시적으로 사용하십시오.

더 보수적인 설정을 원한다면 어느 레이어도 `allowlist` / `on-miss` 또는 `deny`로 다시 강화하십시오.

영구 게이트웨이 호스트 "절대 프롬프트 없음" 설정:

```bash
openclaw config set tools.exec.host gateway
openclaw config set tools.exec.security full
openclaw config set tools.exec.ask off
openclaw gateway restart
```

그런 다음 호스트 승인 파일을 일치하도록 설정하십시오:

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

노드 호스트의 경우 해당 노드에 동일한 승인 파일을 적용하십시오:

```bash
openclaw approvals set --node &lt;id|name|ip&gt; --stdin <<'EOF'
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

세션 전용 단축키:

- `/exec security=full ask=off`는 현재 세션만 변경합니다.
- `/elevated full`은 해당 세션에 대한 exec 승인도 건너뛰는 긴급 단축키입니다.

호스트 승인 파일이 구성보다 더 엄격하게 유지되면 더 엄격한 호스트 정책이 여전히 우선합니다.

## 정책 노브

### 보안 (`exec.security`)

- **deny**: 모든 호스트 exec 요청을 차단합니다.
- **allowlist**: 허용 목록에 있는 명령만 허용합니다.
- **full**: 모든 것을 허용합니다 (elevated와 동일).

### Ask (`exec.ask`)

- **off**: 절대 프롬프트하지 않습니다.
- **on-miss**: 허용 목록이 일치하지 않을 때만 프롬프트합니다.
- **always**: 모든 명령에서 프롬프트합니다.
- `allow-always` 지속적 신뢰는 유효 ask 모드가 `always`일 때 프롬프트를 억제하지 않습니다.

### Ask 폴백 (`askFallback`)

프롬프트가 필요하지만 UI에 연결할 수 없는 경우 폴백이 결정합니다:

- **deny**: 차단합니다.
- **allowlist**: 허용 목록이 일치하는 경우에만 허용합니다.
- **full**: 허용합니다.

### 인라인 인터프리터 eval 강화 (`tools.exec.strictInlineEval`)

`tools.exec.strictInlineEval=true`인 경우, OpenClaw는 인터프리터 바이너리 자체가 허용 목록에 있더라도 인라인 코드 eval 형식을 승인 전용으로 처리합니다.

예시:

- `python -c`
- `node -e`, `node --eval`, `node -p`
- `ruby -e`
- `perl -e`, `perl -E`
- `php -r`
- `lua -e`
- `osascript -e`

이것은 하나의 안정적인 파일 피연산자에 깔끔하게 매핑되지 않는 인터프리터 로더를 위한 심층 방어입니다. 엄격 모드에서:

- 이러한 명령은 여전히 명시적 승인이 필요합니다;
- `allow-always`는 이들에 대한 새 허용 목록 항목을 자동으로 지속하지 않습니다.

## 허용 목록 (에이전트별)

허용 목록은 **에이전트별**입니다. 여러 에이전트가 있는 경우 macOS 앱에서 편집 중인 에이전트를 전환하십시오. 패턴은 **대소문자를 구분하지 않는 글로브 일치**입니다.
패턴은 **바이너리 경로**로 해결되어야 합니다 (기본 이름만 있는 항목은 무시됩니다).
레거시 `agents.default` 항목은 로드 시 `agents.main`으로 마이그레이션됩니다.
`echo ok && pwd` 같은 쉘 체인은 여전히 모든 최상위 세그먼트가 허용 목록 규칙을 충족해야 합니다.

예시:

- `~/Projects/**/bin/peekaboo`
- `~/.local/bin/*`
- `/opt/homebrew/bin/rg`

각 허용 목록 항목은 다음을 추적합니다:

- **id** UI 아이덴티티에 사용되는 안정적인 UUID (선택적)
- **마지막 사용** 타임스탬프
- **마지막 사용 명령**
- **마지막 해결된 경로**

## 스킬 CLI 자동 허용

**스킬 CLI 자동 허용**이 활성화되면, 알려진 스킬에서 참조하는 실행 파일은 노드(macOS 노드 또는 헤드리스 노드 호스트)에서 허용 목록에 있는 것으로 취급됩니다. 이는 게이트웨이 RPC를 통해 스킬 bin 목록을 가져오기 위해 `skills.bins`를 사용합니다. 엄격한 수동 허용 목록이 필요한 경우 이것을 비활성화하십시오.

중요한 신뢰 참고 사항:

- 이것은 수동 경로 허용 목록 항목과 별개인 **암묵적 편의 허용 목록**입니다.
- 게이트웨이와 노드가 동일한 신뢰 경계에 있는 신뢰된 운영자 환경을 위한 것입니다.
- 엄격한 명시적 신뢰가 필요한 경우 `autoAllowSkills: false`를 유지하고 수동 경로 허용 목록 항목만 사용하십시오.

## 안전 빈 (stdin 전용)

`tools.exec.safeBins`는 허용 목록 항목 없이 허용 목록 모드에서 실행할 수 있는 **stdin 전용** 바이너리(예: `cut`)의 작은 목록을 정의합니다. 안전 빈은 위치 파일 인수와 경로 유사 토큰을 거부하므로 들어오는 스트림에서만 작동할 수 있습니다.
이것을 스트림 필터를 위한 좁은 빠른 경로로 처리하고, 일반 신뢰 목록으로 취급하지 마십시오.
인터프리터 또는 런타임 바이너리(예: `python3`, `node`, `ruby`, `bash`, `sh`, `zsh`)를 `safeBins`에 **추가하지 마십시오**.
명령이 코드를 평가하거나 하위 명령을 실행하거나 설계상 파일을 읽을 수 있는 경우 명시적 허용 목록 항목을 선호하고 승인 프롬프트를 활성화 상태로 유지하십시오.
사용자 정의 안전 빈은 `tools.exec.safeBinProfiles.&lt;bin&gt;`에 명시적 프로파일을 정의해야 합니다.
유효성 검사는 argv 형태에서만 결정론적입니다(호스트 파일 시스템 존재 확인 없음), 이는 허용/거부 차이로 인한 파일 존재 오라클 동작을 방지합니다.
기본 안전 빈에 대한 파일 지향 옵션은 거부됩니다(예: `sort -o`, `sort --output`, `sort --files0-from`, `sort --compress-program`, `sort --random-source`, `sort --temporary-directory`/`-T`, `wc --files0-from`, `jq -f/--from-file`, `grep -f/--file`).
안전 빈은 또한 stdin 전용 동작을 방해하는 옵션에 대해 바이너리별 명시적 플래그 정책을 시행합니다(예: `sort -o/--output/--compress-program` 및 grep 재귀 플래그).
긴 옵션은 안전 빈 모드에서 실패 폐쇄로 유효성이 검사됩니다: 알 수 없는 플래그와 모호한 약어는 거부됩니다.
안전 빈 프로파일에 의해 거부된 플래그:

[//]: # "SAFE_BIN_DENIED_FLAGS:START"

- `grep`: `--dereference-recursive`, `--directories`, `--exclude-from`, `--file`, `--recursive`, `-R`, `-d`, `-f`, `-r`
- `jq`: `--argfile`, `--from-file`, `--library-path`, `--rawfile`, `--slurpfile`, `-L`, `-f`
- `sort`: `--compress-program`, `--files0-from`, `--output`, `--random-source`, `--temporary-directory`, `-T`, `-o`
- `wc`: `--files0-from`

[//]: # "SAFE_BIN_DENIED_FLAGS:END"

안전 빈은 또한 stdin 전용 세그먼트에 대해 실행 시 argv 토큰이 **리터럴 텍스트**로 처리되도록 강제합니다(글로빙 및 `$VARS` 확장 없음), 따라서 `*` 또는 `$HOME/...` 같은 패턴은 파일 읽기를 밀수입하는 데 사용될 수 없습니다.
안전 빈은 또한 신뢰된 바이너리 디렉토리(시스템 기본값 및 선택적 `tools.exec.safeBinTrustedDirs`)에서 해결되어야 합니다. `PATH` 항목은 자동으로 신뢰되지 않습니다.
기본 신뢰된 안전 빈 디렉토리는 의도적으로 최소입니다: `/bin`, `/usr/bin`.
안전 빈 실행 파일이 패키지 매니저/사용자 경로(예: `/opt/homebrew/bin`, `/usr/local/bin`, `/opt/local/bin`, `/snap/bin`)에 있는 경우 `tools.exec.safeBinTrustedDirs`에 명시적으로 추가하십시오.
쉘 체인과 리디렉션은 허용 목록 모드에서 자동 허용되지 않습니다.

쉘 체인(`&&`, `||`, `;`)은 모든 최상위 세그먼트가 허용 목록(안전 빈 또는 스킬 자동 허용 포함)을 충족하는 경우 허용됩니다. 리디렉션은 허용 목록 모드에서 여전히 지원되지 않습니다.
명령 대체(`$()` / 백틱)는 허용 목록 파싱 중에 거부됩니다(큰따옴표 안쪽 포함); 리터럴 `$()` 텍스트가 필요한 경우 작은따옴표를 사용하십시오.
macOS 컴패니언 앱 승인에서 쉘 제어 또는 확장 구문(`&&`, `||`, `;`, `|`, `` ` ``, `$`, `<`, `>`, `(`, `)`)이 포함된 원시 쉘 텍스트는 쉘 바이너리 자체가 허용 목록에 없는 한 허용 목록 미스로 처리됩니다.
쉘 래퍼(`bash|sh|zsh ... -c/-lc`)의 경우, 요청 범위 환경 재정의는 작은 명시적 허용 목록(`TERM`, `LANG`, `LC_*`, `COLORTERM`, `NO_COLOR`, `FORCE_COLOR`)으로 축소됩니다.
허용 목록 모드에서 allow-always 결정의 경우, 알려진 디스패치 래퍼(`env`, `nice`, `nohup`, `stdbuf`, `timeout`)는 래퍼 경로 대신 내부 실행 파일 경로를 지속합니다. 쉘 멀티플렉서(`busybox`, `toybox`)도 쉘 애플릿(`sh`, `ash` 등)에 대해 언래핑되어 멀티플렉서 바이너리 대신 내부 실행 파일이 지속됩니다. 래퍼 또는 멀티플렉서를 안전하게 언래핑할 수 없는 경우 허용 목록 항목이 자동으로 지속되지 않습니다.
`python3` 또는 `node` 같은 인터프리터를 허용 목록에 추가하는 경우, 인라인 eval이 여전히 명시적 승인을 요구하도록 `tools.exec.strictInlineEval=true`를 선호하십시오. 엄격 모드에서 `allow-always`는 여전히 양성 인터프리터/스크립트 호출을 지속할 수 있지만, 인라인 eval 캐리어는 자동으로 지속되지 않습니다.

기본 안전 빈:

[//]: # "SAFE_BIN_DEFAULTS:START"

`cut`, `uniq`, `head`, `tail`, `tr`, `wc`

[//]: # "SAFE_BIN_DEFAULTS:END"

`grep`과 `sort`는 기본 목록에 없습니다. 옵트인하면 비 stdin 워크플로우에 대한 명시적 허용 목록 항목을 유지하십시오.
안전 빈 모드에서 `grep`의 경우 `-e`/`--regexp`로 패턴을 제공하십시오; 위치 패턴 형식은 거부되어 파일 피연산자가 모호한 위치 인수로 밀수입될 수 없습니다.

### 안전 빈 대 허용 목록

| 주제            | `tools.exec.safeBins`                                | 허용 목록 (`exec-approvals.json`)                              |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| 목표            | 좁은 stdin 필터 자동 허용                            | 특정 실행 파일 명시적 신뢰                                     |
| 일치 유형       | 실행 파일 이름 + 안전 빈 argv 정책                   | 해결된 실행 파일 경로 글로브 패턴                              |
| 인수 범위       | 안전 빈 프로파일 및 리터럴 토큰 규칙으로 제한        | 경로 일치만; 인수는 그 외에 사용자 책임                        |
| 일반적인 예시   | `head`, `tail`, `tr`, `wc`                           | `jq`, `python3`, `node`, `ffmpeg`, 사용자 정의 CLI             |
| 최적 사용       | 파이프라인에서 저위험 텍스트 변환                    | 더 넓은 동작이나 부작용이 있는 모든 도구                       |

구성 위치:

- `safeBins`는 구성에서 옵니다 (`tools.exec.safeBins` 또는 에이전트별 `agents.list[].tools.exec.safeBins`).
- `safeBinTrustedDirs`는 구성에서 옵니다 (`tools.exec.safeBinTrustedDirs` 또는 에이전트별 `agents.list[].tools.exec.safeBinTrustedDirs`).
- `safeBinProfiles`는 구성에서 옵니다 (`tools.exec.safeBinProfiles` 또는 에이전트별 `agents.list[].tools.exec.safeBinProfiles`). 에이전트별 프로파일 키는 전역 키를 재정의합니다.
- 허용 목록 항목은 `agents.&lt;id&gt;.allowlist` 아래 호스트 로컬 `~/.openclaw/exec-approvals.json`에 있습니다 (또는 Control UI / `openclaw approvals allowlist ...`를 통해).
- `openclaw security audit`는 `safeBins`에 명시적 프로파일 없이 인터프리터/런타임 빈이 나타날 때 `tools.exec.safe_bins_interpreter_unprofiled`로 경고합니다.
- `openclaw doctor --fix`는 누락된 사용자 정의 `safeBinProfiles.&lt;bin&gt;` 항목을 `{}`로 스캐폴딩할 수 있습니다 (이후 검토하고 강화하십시오). 인터프리터/런타임 빈은 자동 스캐폴딩되지 않습니다.

사용자 정의 프로파일 예시:

```json5
{
  tools: {
    exec: {
      safeBins: ["jq", "myfilter"],
      safeBinProfiles: {
        myfilter: {
          minPositional: 0,
          maxPositional: 0,
          allowedValueFlags: ["-n", "--limit"],
          deniedFlags: ["-f", "--file", "-c", "--command"],
        },
      },
    },
  },
}
```

`jq`를 `safeBins`에 명시적으로 옵트인하면 OpenClaw는 여전히 안전 빈 모드에서 `env` 내장을 거부하여 `jq -n env`가 명시적 허용 목록 경로나 승인 프롬프트 없이 호스트 프로세스 환경을 덤프할 수 없도록 합니다.

## Control UI 편집

**Control UI → 노드 → Exec 승인** 카드를 사용하여 기본값, 에이전트별 재정의 및 허용 목록을 편집하십시오. 범위(기본값 또는 에이전트)를 선택하고, 정책을 조정하고, 허용 목록 패턴을 추가/제거한 후 **저장**하십시오. UI는 목록을 깔끔하게 유지할 수 있도록 패턴별 **마지막 사용** 메타데이터를 표시합니다.

대상 선택기는 **게이트웨이**(로컬 승인) 또는 **노드**를 선택합니다. 노드는 `system.execApprovals.get/set`을 알려야 합니다 (macOS 앱 또는 헤드리스 노드 호스트).
노드가 아직 exec 승인을 알리지 않는 경우 해당 로컬 `~/.openclaw/exec-approvals.json`을 직접 편집하십시오.

CLI: `openclaw approvals`는 게이트웨이 또는 노드 편집을 지원합니다 ([승인 CLI](/cli/approvals) 참조).

## 승인 흐름

프롬프트가 필요한 경우 게이트웨이는 `exec.approval.requested`를 운영자 클라이언트에 브로드캐스트합니다.
Control UI와 macOS 앱은 `exec.approval.resolve`를 통해 해결한 후 게이트웨이가 승인된 요청을 노드 호스트에 전달합니다.

`host=node`의 경우 승인 요청에는 정식 `systemRunPlan` 페이로드가 포함됩니다. 게이트웨이는 승인된 `system.run` 요청을 전달할 때 해당 계획을 권한 있는 명령/cwd/세션 컨텍스트로 사용합니다.

이것은 비동기 승인 지연 시간에 중요합니다:

- 노드 exec 경로는 하나의 정식 계획을 미리 준비합니다
- 승인 레코드는 해당 계획과 바인딩 메타데이터를 저장합니다
- 승인되면 최종 전달된 `system.run` 호출은 나중에 호출자가 편집하는 것을 신뢰하는 대신 저장된 계획을 재사용합니다
- 승인 요청이 생성된 후 호출자가 `command`, `rawCommand`, `cwd`, `agentId`, 또는 `sessionKey`를 변경하면 게이트웨이는 전달된 실행을 승인 불일치로 거부합니다

## 인터프리터/런타임 명령

승인 지원 인터프리터/런타임 실행은 의도적으로 보수적입니다:

- 정확한 argv/cwd/env 컨텍스트가 항상 바인딩됩니다.
- 직접 쉘 스크립트와 직접 런타임 파일 형식은 하나의 구체적인 로컬 파일 스냅샷에 최선 노력으로 바인딩됩니다.
- 여전히 하나의 직접 로컬 파일로 해결되는 일반적인 패키지 매니저 래퍼 형식(예: `pnpm exec`, `pnpm node`, `npm exec`, `npx`)은 바인딩 전에 언래핑됩니다.
- OpenClaw가 인터프리터/런타임 명령에 대해 정확히 하나의 구체적인 로컬 파일을 식별할 수 없는 경우(예: 패키지 스크립트, eval 형식, 런타임별 로더 체인, 또는 모호한 다중 파일 형식), 승인 지원 실행은 완전한 적용 범위를 주장하는 대신 거부됩니다.
- 이러한 워크플로우의 경우 샌드박싱, 별도 호스트 경계, 또는 운영자가 더 넓은 런타임 의미론을 허용하는 명시적 신뢰된 허용 목록/full 워크플로우를 선호하십시오.

승인이 필요한 경우 exec 도구는 즉시 승인 ID와 함께 반환됩니다. 해당 ID를 사용하여 나중에 시스템 이벤트(`Exec finished` / `Exec denied`)와 상관 관계를 파악하십시오. 타임아웃 전에 결정이 도착하지 않으면 요청은 승인 타임아웃으로 처리되어 거부 이유로 표시됩니다.

### 후속 전달 동작

승인된 비동기 exec가 완료된 후 OpenClaw는 동일한 세션에 후속 `agent` 턴을 전송합니다.

- 유효한 외부 전달 대상(전달 가능한 채널 + 대상 `to`)이 존재하면 후속 전달은 해당 채널을 사용합니다.
- 외부 대상이 없는 웹챗 전용 또는 내부 세션 흐름에서 후속 전달은 세션 전용으로 유지됩니다 (`deliver: false`).
- 호출자가 해결 가능한 외부 채널 없이 엄격한 외부 전달을 명시적으로 요청하면 요청이 `INVALID_REQUEST`로 실패합니다.
- `bestEffortDeliver`가 활성화되고 외부 채널을 해결할 수 없는 경우 전달은 실패하는 대신 세션 전용으로 다운그레이드됩니다.

확인 대화 상자에는 다음이 포함됩니다:

- 명령 + 인수
- cwd
- 에이전트 id
- 해결된 실행 파일 경로
- 호스트 + 정책 메타데이터

작업:

- **한 번 허용** → 지금 실행
- **항상 허용** → 허용 목록에 추가 + 실행
- **거부** → 차단

## 채팅 채널로 승인 전달

exec 승인 프롬프트를 채팅 채널(플러그인 채널 포함)에 전달하고 `/approve`로 승인할 수 있습니다. 이것은 일반 아웃바운드 전달 파이프라인을 사용합니다.

구성:

```json5
{
  approvals: {
    exec: {
      enabled: true,
      mode: "session", // "session" | "targets" | "both"
      agentFilter: ["main"],
      sessionFilter: ["discord"], // 부분 문자열 또는 정규식
      targets: [
        { channel: "slack", to: "U12345678" },
        { channel: "telegram", to: "123456789" },
      ],
    },
  },
}
```

채팅에서 응답:

```
/approve &lt;id&gt; allow-once
/approve &lt;id&gt; allow-always
/approve &lt;id&gt; deny
```

`/approve` 명령은 exec 승인과 플러그인 승인을 모두 처리합니다. ID가 보류 중인 exec 승인과 일치하지 않으면 자동으로 플러그인 승인을 대신 확인합니다.

### 플러그인 승인 전달

플러그인 승인 전달은 exec 승인과 동일한 전달 파이프라인을 사용하지만 `approvals.plugin` 아래에 자체 독립 구성이 있습니다. 하나를 활성화하거나 비활성화해도 다른 하나에는 영향을 미치지 않습니다.

```json5
{
  approvals: {
    plugin: {
      enabled: true,
      mode: "targets",
      agentFilter: ["main"],
      targets: [
        { channel: "slack", to: "U12345678" },
        { channel: "telegram", to: "123456789" },
      ],
    },
  },
}
```

구성 형태는 `approvals.exec`와 동일합니다: `enabled`, `mode`, `agentFilter`, `sessionFilter`, `targets`가 동일하게 작동합니다.

공유 대화형 응답을 지원하는 채널은 exec 및 플러그인 승인 모두에 대해 동일한 승인 버튼을 렌더링합니다. 공유 대화형 UI가 없는 채널은 `/approve` 지침이 있는 일반 텍스트로 폴백합니다.

### 모든 채널에서 동일 채팅 승인

exec 또는 플러그인 승인 요청이 전달 가능한 채팅 표면에서 시작되면 이제 동일한 채팅에서 기본적으로 `/approve`로 승인할 수 있습니다. 이것은 기존 웹 UI 및 터미널 UI 흐름 외에 Slack, Matrix, Microsoft Teams 같은 채널에도 적용됩니다.

이 공유 텍스트 명령 경로는 해당 대화에 대한 일반 채널 인증 모델을 사용합니다. 시작 채팅이 이미 명령을 보내고 응답을 받을 수 있는 경우 승인 요청은 보류 상태를 유지하기 위해 별도의 네이티브 전달 어댑터가 더 이상 필요하지 않습니다.

Discord와 Telegram도 동일 채팅 `/approve`를 지원하지만, 해당 채널은 네이티브 승인 전달이 비활성화된 경우에도 인증을 위해 해결된 승인자 목록을 여전히 사용합니다.

Telegram 및 직접 게이트웨이를 호출하는 다른 네이티브 승인 클라이언트의 경우, 이 폴백은 "승인을 찾을 수 없음" 실패에 의도적으로 제한됩니다. 실제 exec 승인 거부/오류는 플러그인 승인으로 자동 재시도되지 않습니다.

### 네이티브 승인 전달

일부 채널은 네이티브 승인 클라이언트로도 작동할 수 있습니다. 네이티브 클라이언트는 공유 동일 채팅 `/approve` 흐름 위에 승인자 DM, 출처 채팅 팬아웃, 채널별 대화형 승인 UX를 추가합니다.

네이티브 승인 카드/버튼이 사용 가능한 경우 해당 네이티브 UI가 에이전트 대면 기본 경로입니다. 에이전트는 도구 결과가 채팅 승인을 사용할 수 없다거나 수동 승인이 유일한 남은 경로라고 명시적으로 말하지 않는 한 중복된 일반 채팅 `/approve` 명령을 에코하지 않아야 합니다.

일반 모델:

- 호스트 exec 정책은 여전히 exec 승인이 필요한지를 결정합니다
- `approvals.exec`는 승인 프롬프트를 다른 채팅 대상에 전달하는 것을 제어합니다
- `channels.&lt;channel&gt;.execApprovals`는 해당 채널이 네이티브 승인 클라이언트로 작동하는지를 제어합니다

네이티브 승인 클라이언트는 다음이 모두 true일 때 DM 우선 전달을 자동 활성화합니다:

- 채널이 네이티브 승인 전달을 지원합니다
- 명시적 `execApprovals.approvers` 또는 해당 채널의 문서화된 폴백 소스에서 승인자를 해결할 수 있습니다
- `channels.&lt;channel&gt;.execApprovals.enabled`가 설정되지 않았거나 `"auto"`입니다

명시적으로 네이티브 승인 클라이언트를 비활성화하려면 `enabled: false`를 설정하십시오. 승인자가 해결될 때 강제로 켜려면 `enabled: true`를 설정하십시오. 공개 출처 채팅 전달은 `channels.&lt;channel&gt;.execApprovals.target`을 통해 명시적으로 유지됩니다.

FAQ: [채팅 승인에 두 가지 exec 승인 구성이 있는 이유는 무엇입니까?](/help/faq#why-are-there-two-exec-approval-configs-for-chat-approvals)

- Discord: `channels.discord.execApprovals.*`
- Slack: `channels.slack.execApprovals.*`
- Telegram: `channels.telegram.execApprovals.*`

이 네이티브 승인 클라이언트는 공유 동일 채팅 `/approve` 흐름과 공유 승인 버튼 위에 DM 라우팅 및 선택적 채널 팬아웃을 추가합니다.

공유 동작:

- Slack, Matrix, Microsoft Teams 및 유사한 전달 가능한 채팅은 동일 채팅 `/approve`에 일반 채널 인증 모델을 사용합니다
- 네이티브 승인 클라이언트가 자동 활성화되면 기본 네이티브 전달 대상은 승인자 DM입니다
- Discord와 Telegram의 경우 해결된 승인자만 승인하거나 거부할 수 있습니다
- Discord 승인자는 명시적(`execApprovals.approvers`) 또는 `commands.ownerAllowFrom`에서 유추될 수 있습니다
- Telegram 승인자는 명시적(`execApprovals.approvers`) 또는 기존 소유자 구성(`allowFrom`, 지원되는 경우 DM `defaultTo`)에서 유추될 수 있습니다
- Slack 승인자는 명시적(`execApprovals.approvers`) 또는 `commands.ownerAllowFrom`에서 유추될 수 있습니다
- Slack 네이티브 버튼은 승인 ID 종류를 보존하여 `plugin:` ID가 두 번째 Slack 로컬 폴백 레이어 없이 플러그인 승인을 해결할 수 있습니다
- Matrix 네이티브 DM/채널 라우팅 및 반응 단축키는 exec 및 플러그인 승인을 모두 처리합니다; 플러그인 인증은 여전히 `channels.matrix.dm.allowFrom`에서 옵니다
- 요청자는 승인자일 필요가 없습니다
- 시작 채팅은 이미 명령과 응답을 지원하는 경우 `/approve`로 직접 승인할 수 있습니다
- 네이티브 Discord 승인 버튼은 승인 ID 종류별로 라우팅합니다: `plugin:` ID는 바로 플러그인 승인으로 가고, 그 외 모든 것은 exec 승인으로 갑니다
- 네이티브 Telegram 승인 버튼은 `/approve`와 동일한 바인딩된 exec-to-plugin 폴백을 따릅니다
- 네이티브 `target`이 출처 채팅 전달을 활성화하면 승인 프롬프트에 명령 텍스트가 포함됩니다
- 보류 중인 exec 승인은 기본적으로 30분 후 만료됩니다
- 운영자 UI나 구성된 승인 클라이언트가 요청을 수락할 수 없는 경우 프롬프트는 `askFallback`으로 폴백합니다

Telegram은 기본적으로 승인자 DM(`target: "dm"`)으로 설정됩니다. 승인 프롬프트가 시작 Telegram 채팅/주제에도 나타나도록 하려면 `channel` 또는 `both`로 전환할 수 있습니다. Telegram 포럼 주제의 경우 OpenClaw는 승인 프롬프트와 승인 후 후속 조치 모두에 대해 주제를 보존합니다.

참조:

- [Discord](/channels/discord)
- [Telegram](/channels/telegram)

### macOS IPC 흐름

```
게이트웨이 -> 노드 서비스 (WS)
                 |  IPC (UDS + 토큰 + HMAC + TTL)
                 v
             Mac 앱 (UI + 승인 + system.run)
```

보안 참고:

- Unix 소켓 모드 `0600`, 토큰은 `exec-approvals.json`에 저장됩니다.
- 동일 UID 피어 확인.
- 챌린지/응답 (논스 + HMAC 토큰 + 요청 해시) + 짧은 TTL.

## 시스템 이벤트

Exec 수명 주기는 시스템 메시지로 표시됩니다:

- `Exec running` (명령이 실행 중 알림 임계값을 초과하는 경우에만)
- `Exec finished`
- `Exec denied`

이들은 노드가 이벤트를 보고한 후 에이전트 세션에 게시됩니다.
게이트웨이 호스트 exec 승인은 명령이 완료될 때(및 선택적으로 임계값보다 오래 실행될 때) 동일한 수명 주기 이벤트를 발생시킵니다.
승인 게이팅 exec는 이러한 메시지에서 쉬운 상관 관계를 위해 `runId`로 승인 ID를 재사용합니다.

## 거부된 승인 동작

비동기 exec 승인이 거부되면 OpenClaw는 에이전트가 세션에서 동일한 명령의 이전 실행 출력을 재사용하지 못하도록 합니다. 거부 이유는 명령 출력이 없다는 명시적 안내와 함께 전달되어 에이전트가 새 출력이 있다고 주장하거나 이전 성공 실행의 오래된 결과로 거부된 명령을 반복하지 못하도록 합니다.

## 의미

- **full**은 강력합니다; 가능하면 허용 목록을 선호하십시오.
- **ask**는 빠른 승인을 허용하면서 루프에 유지합니다.
- 에이전트별 허용 목록은 한 에이전트의 승인이 다른 에이전트로 누출되는 것을 방지합니다.
- 승인은 **승인된 발신자**의 호스트 exec 요청에만 적용됩니다. 승인되지 않은 발신자는 `/exec`를 발행할 수 없습니다.
- `/exec security=full`은 승인된 운영자를 위한 세션 수준 편의 기능이며 설계상 승인을 건너뜁니다.
  호스트 exec를 하드 차단하려면 도구 정책을 통해 `exec` 도구를 거부하거나 승인 보안을 `deny`로 설정하십시오.

관련:

- [Exec 도구](/tools/exec)
- [Elevated 모드](/tools/elevated)
- [스킬](/tools/skills)

## 관련 항목

- [Exec](/tools/exec) — 쉘 명령 실행 도구
- [샌드박싱](/gateway/sandboxing) — 샌드박스 모드 및 워크스페이스 액세스
- [보안](/gateway/security) — 보안 모델 및 강화
- [샌드박스 vs 도구 정책 vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated) — 각각을 사용하는 경우
