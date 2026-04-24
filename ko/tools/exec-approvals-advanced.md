---
summary: "고급 exec 승인: safe bin, 인터프리터 바인딩, 승인 전달, 네이티브 전달"
read_when:
  - safe bin 또는 커스텀 safe-bin 프로파일을 구성하는 경우
  - 승인을 Slack/Discord/Telegram 또는 다른 채팅 채널에 전달하는 경우
  - 채널을 위한 네이티브 승인 클라이언트를 구현하는 경우
title: "Exec 승인 — 고급"
---

고급 exec 승인 주제: `safeBins` 빠른 경로, 인터프리터/런타임
바인딩, 그리고 채팅 채널로의 승인 전달(네이티브 전달 포함).
핵심 정책 및 승인 흐름은 [Exec 승인](/tools/exec-approvals)을 참조하십시오.

## 안전 빈 (stdin 전용)

`tools.exec.safeBins`는 명시적 허용 목록 항목 **없이** 허용 목록 모드에서
실행할 수 있는 **stdin 전용** 바이너리(예: `cut`)의 작은 목록을 정의합니다.
안전 빈은 위치 파일 인수와 경로 유사 토큰을 거부하므로, 들어오는 스트림에서만 작동할 수 있습니다.
이것을 스트림 필터를 위한 좁은 빠른 경로로 처리하고, 일반 신뢰 목록으로 취급하지 마십시오.

<Warning>
인터프리터 또는 런타임 바이너리(예: `python3`, `node`,
`ruby`, `bash`, `sh`, `zsh`)를 `safeBins`에 추가하지 **마십시오**.
명령이 코드를 평가하거나, 하위 명령을 실행하거나, 설계상 파일을 읽을 수 있는 경우
명시적 허용 목록 항목을 선호하고 승인 프롬프트를 활성화 상태로 유지하십시오.
커스텀 safe bin은 `tools.exec.safeBinProfiles.<bin>`에 명시적 프로파일을 정의해야 합니다.
</Warning>

기본 안전 빈:

[//]: # "SAFE_BIN_DEFAULTS:START"

`cut`, `uniq`, `head`, `tail`, `tr`, `wc`

[//]: # "SAFE_BIN_DEFAULTS:END"

`grep`과 `sort`는 기본 목록에 없습니다. 옵트인하는 경우, 비 stdin 워크플로우에 대한
명시적 허용 목록 항목을 유지하십시오. safe-bin 모드의 `grep`의 경우,
`-e`/`--regexp`로 패턴을 제공하십시오; 위치 패턴 형식은 거부되므로
파일 피연산자가 모호한 위치 인수로 밀수입될 수 없습니다.

### Argv 유효성 검사 및 거부된 플래그

유효성 검사는 argv 형태에서만 결정론적입니다(호스트 파일 시스템 존재
확인 없음), 이는 허용/거부 차이로 인한 파일 존재 오라클 동작을
방지합니다. 파일 지향 옵션은 기본 안전 빈에 대해 거부됩니다; 긴
옵션은 fail-closed로 유효성이 검사됩니다(알 수 없는 플래그와 모호한 약어는
거부됨).

안전 빈 프로파일별로 거부된 플래그:

[//]: # "SAFE_BIN_DENIED_FLAGS:START"

- `grep`: `--dereference-recursive`, `--directories`, `--exclude-from`, `--file`, `--recursive`, `-R`, `-d`, `-f`, `-r`
- `jq`: `--argfile`, `--from-file`, `--library-path`, `--rawfile`, `--slurpfile`, `-L`, `-f`
- `sort`: `--compress-program`, `--files0-from`, `--output`, `--random-source`, `--temporary-directory`, `-T`, `-o`
- `wc`: `--files0-from`

[//]: # "SAFE_BIN_DENIED_FLAGS:END"

안전 빈은 또한 stdin 전용 세그먼트에 대해 실행 시 argv 토큰이
**리터럴 텍스트**로 처리되도록 강제합니다(글로빙 및 `$VARS` 확장 없음),
따라서 `*` 또는 `$HOME/...` 같은 패턴은 파일 읽기를 밀수입하는 데 사용될 수 없습니다.

### 신뢰된 바이너리 디렉토리

안전 빈은 신뢰된 바이너리 디렉토리(시스템 기본값 및
선택적 `tools.exec.safeBinTrustedDirs`)에서 해결되어야 합니다. `PATH` 항목은 자동으로 신뢰되지 않습니다.
기본 신뢰된 디렉토리는 의도적으로 최소입니다: `/bin`, `/usr/bin`.
안전 빈 실행 파일이 패키지 매니저/사용자 경로(예:
`/opt/homebrew/bin`, `/usr/local/bin`, `/opt/local/bin`, `/snap/bin`)에 있는 경우
`tools.exec.safeBinTrustedDirs`에 명시적으로 추가하십시오.

### 쉘 체이닝, 래퍼, 멀티플렉서

쉘 체이닝(`&&`, `||`, `;`)은 모든 최상위 세그먼트가 허용 목록
(안전 빈 또는 스킬 자동 허용 포함)을 충족하는 경우 허용됩니다. 리디렉션은
허용 목록 모드에서 여전히 지원되지 않습니다. 명령 대체(`$()` / 백틱)는
허용 목록 파싱 중에 거부됩니다(큰따옴표 안쪽 포함); 리터럴 `$()` 텍스트가 필요한 경우
작은따옴표를 사용하십시오.

macOS 컴패니언 앱 승인에서, 쉘 제어 또는
확장 구문(`&&`, `||`, `;`, `|`, `` ` ``, `$`, `<`, `>`, `(`, `)`)이 포함된 원시 쉘 텍스트는
쉘 바이너리 자체가 허용 목록에 없는 한 허용 목록 미스로 처리됩니다.

쉘 래퍼(`bash|sh|zsh ... -c/-lc`)의 경우, 요청 범위 환경 재정의는
작은 명시적 허용 목록(`TERM`, `LANG`, `LC_*`, `COLORTERM`,
`NO_COLOR`, `FORCE_COLOR`)으로 축소됩니다.

허용 목록 모드의 `allow-always` 결정의 경우, 알려진 디스패치 래퍼(`env`,
`nice`, `nohup`, `stdbuf`, `timeout`)는 래퍼 경로 대신 내부 실행 파일
경로를 지속합니다. 쉘 멀티플렉서(`busybox`, `toybox`)도 쉘
애플릿(`sh`, `ash` 등)에 대해 동일한 방식으로 언래핑됩니다. 래퍼 또는 멀티플렉서를
안전하게 언래핑할 수 없는 경우, 허용 목록 항목이 자동으로 지속되지 않습니다.

`python3` 또는 `node` 같은 인터프리터를 허용 목록에 추가하는 경우,
인라인 eval이 여전히 명시적 승인을 요구하도록 `tools.exec.strictInlineEval=true`를
선호하십시오. 엄격 모드에서 `allow-always`는 양성 인터프리터/스크립트 호출을
여전히 지속할 수 있지만, 인라인 eval 캐리어는
자동으로 지속되지 않습니다.

### 안전 빈 대 허용 목록

| 주제            | `tools.exec.safeBins`                                  | 허용 목록 (`exec-approvals.json`)                              |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| 목표            | 좁은 stdin 필터 자동 허용                              | 특정 실행 파일 명시적 신뢰                                     |
| 일치 유형       | 실행 파일 이름 + 안전 빈 argv 정책                     | 해결된 실행 파일 경로 글로브 패턴                              |
| 인수 범위       | 안전 빈 프로파일 및 리터럴 토큰 규칙으로 제한          | 경로 일치만; 인수는 그 외에 사용자 책임                        |
| 일반적인 예시   | `head`, `tail`, `tr`, `wc`                             | `jq`, `python3`, `node`, `ffmpeg`, 커스텀 CLI                  |
| 최적 사용       | 파이프라인에서 저위험 텍스트 변환                      | 더 넓은 동작이나 부작용이 있는 모든 도구                       |

구성 위치:

- `safeBins`는 구성에서 옵니다 (`tools.exec.safeBins` 또는 에이전트별 `agents.list[].tools.exec.safeBins`).
- `safeBinTrustedDirs`는 구성에서 옵니다 (`tools.exec.safeBinTrustedDirs` 또는 에이전트별 `agents.list[].tools.exec.safeBinTrustedDirs`).
- `safeBinProfiles`는 구성에서 옵니다 (`tools.exec.safeBinProfiles` 또는 에이전트별 `agents.list[].tools.exec.safeBinProfiles`). 에이전트별 프로파일 키는 전역 키를 재정의합니다.
- 허용 목록 항목은 `agents.<id>.allowlist` 아래 호스트 로컬 `~/.openclaw/exec-approvals.json`에 있습니다 (또는 Control UI / `openclaw approvals allowlist ...`를 통해).
- `openclaw security audit`는 `safeBins`에 명시적 프로파일 없이 인터프리터/런타임 빈이 나타날 때 `tools.exec.safe_bins_interpreter_unprofiled`로 경고합니다.
- `openclaw doctor --fix`는 누락된 커스텀 `safeBinProfiles.<bin>` 항목을 `{}`로 스캐폴딩할 수 있습니다(이후 검토하고 강화하십시오). 인터프리터/런타임 빈은 자동 스캐폴딩되지 않습니다.

커스텀 프로파일 예시:

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

`jq`를 `safeBins`에 명시적으로 옵트인하면, OpenClaw는 여전히 safe-bin 모드에서 `env` 내장을 거부하여
`jq -n env`가 명시적 허용 목록 경로나 승인 프롬프트 없이
호스트 프로세스 환경을 덤프할 수 없도록 합니다.

## 인터프리터/런타임 명령

승인 지원 인터프리터/런타임 실행은 의도적으로 보수적입니다:

- 정확한 argv/cwd/env 컨텍스트가 항상 바인딩됩니다.
- 직접 쉘 스크립트 및 직접 런타임 파일 형식은 하나의 구체적인 로컬
  파일 스냅샷에 최선 노력으로 바인딩됩니다.
- 여전히 하나의 직접 로컬 파일로 해결되는 일반적인 패키지 매니저 래퍼 형식(예:
  `pnpm exec`, `pnpm node`, `npm exec`, `npx`)은 바인딩 전에 언래핑됩니다.
- OpenClaw가 인터프리터/런타임 명령에 대해 정확히 하나의 구체적인 로컬 파일을 식별할 수 없는 경우
  (예: 패키지 스크립트, eval 형식, 런타임별 로더 체인, 또는 모호한 다중 파일
  형식), 승인 지원 실행은 가지지 않은 의미론적 적용 범위를 주장하는 대신
  거부됩니다.
- 이러한 워크플로우의 경우, 샌드박싱, 별도 호스트 경계, 또는 운영자가
  더 넓은 런타임 의미론을 허용하는 명시적 신뢰된 허용 목록/full 워크플로우를
  선호하십시오.

승인이 필요한 경우, exec 도구는 즉시 승인 ID와 함께 반환됩니다. 해당 ID를 사용하여
나중에 시스템 이벤트(`Exec finished` / `Exec denied`)와 상관 관계를 파악하십시오. 타임아웃 전에
결정이 도착하지 않으면, 요청은 승인 타임아웃으로 처리되어 거부 이유로 표시됩니다.

### 후속 전달 동작

승인된 비동기 exec가 완료된 후, OpenClaw는 동일한 세션에 후속 `agent` 턴을 전송합니다.

- 유효한 외부 전달 대상(전달 가능한 채널 + 대상 `to`)이 존재하면, 후속 전달은 해당 채널을 사용합니다.
- 외부 대상이 없는 웹챗 전용 또는 내부 세션 흐름에서, 후속 전달은 세션 전용(`deliver: false`)으로 유지됩니다.
- 호출자가 해결 가능한 외부 채널 없이 엄격한 외부 전달을 명시적으로 요청하면, 요청은 `INVALID_REQUEST`로 실패합니다.
- `bestEffortDeliver`가 활성화되고 외부 채널을 해결할 수 없는 경우, 전달은 실패하는 대신 세션 전용으로 다운그레이드됩니다.

## 채팅 채널로 승인 전달

exec 승인 프롬프트를 채팅 채널(플러그인 채널 포함)에 전달하고
`/approve`로 승인할 수 있습니다. 이것은 일반 아웃바운드 전달 파이프라인을 사용합니다.

구성:

```json5
{
  approvals: {
    exec: {
      enabled: true,
      mode: "session", // "session" | "targets" | "both"
      agentFilter: ["main"],
      sessionFilter: ["discord"], // substring or regex
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
/approve <id> allow-once
/approve <id> allow-always
/approve <id> deny
```

`/approve` 명령은 exec 승인과 플러그인 승인을 모두 처리합니다. ID가 보류 중인 exec 승인과 일치하지 않으면, 자동으로 대신 플러그인 승인을 확인합니다.

### 플러그인 승인 전달

플러그인 승인 전달은 exec 승인과 동일한 전달 파이프라인을 사용하지만,
`approvals.plugin` 아래에 독립된 자체 구성이 있습니다. 하나를 활성화하거나 비활성화해도 다른 하나에는 영향을 미치지 않습니다.

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

구성 형태는 `approvals.exec`와 동일합니다: `enabled`, `mode`, `agentFilter`,
`sessionFilter`, `targets`가 동일하게 작동합니다.

공유 대화형 응답을 지원하는 채널은 exec 및 플러그인 승인 모두에 대해
동일한 승인 버튼을 렌더링합니다. 공유 대화형 UI가 없는 채널은 `/approve`
지침이 있는 일반 텍스트로 폴백합니다.

### 모든 채널에서 동일 채팅 승인

exec 또는 플러그인 승인 요청이 전달 가능한 채팅 표면에서 시작되면, 이제 동일한 채팅에서
기본적으로 `/approve`로 승인할 수 있습니다. 이것은 기존 Web UI 및 터미널 UI 흐름 외에 Slack, Matrix,
Microsoft Teams 같은 채널에도 적용됩니다.

이 공유 텍스트 명령 경로는 해당 대화에 대한 일반 채널 인증 모델을 사용합니다. 시작 채팅이
이미 명령을 보내고 응답을 받을 수 있는 경우, 승인 요청은 보류 상태를 유지하기 위해
별도의 네이티브 전달 어댑터가 더 이상 필요하지 않습니다.

Discord와 Telegram도 동일 채팅 `/approve`를 지원하지만, 해당 채널은 네이티브 승인 전달이 비활성화된 경우에도
인증을 위해 해결된 승인자 목록을 여전히 사용합니다.

Telegram 및 Gateway를 직접 호출하는 다른 네이티브 승인 클라이언트의 경우,
이 폴백은 "approval not found" 실패에 의도적으로 제한됩니다. 실제
exec 승인 거부/에러는 플러그인 승인으로 자동 재시도되지 않습니다.

### 네이티브 승인 전달

일부 채널은 네이티브 승인 클라이언트로도 작동할 수 있습니다. 네이티브 클라이언트는 공유 동일 채팅 `/approve`
흐름 위에 승인자 DM, 출처 채팅 팬아웃, 채널별 대화형 승인 UX를
추가합니다.

네이티브 승인 카드/버튼이 사용 가능한 경우, 해당 네이티브 UI가 주요
에이전트 대면 경로입니다. 에이전트는 도구 결과가 채팅 승인을 사용할 수 없다거나
수동 승인이 유일한 남은 경로라고 명시적으로 말하지 않는 한 중복된 일반 채팅
`/approve` 명령을 에코하지 않아야 합니다.

일반 모델:

- 호스트 exec 정책은 여전히 exec 승인이 필요한지 결정합니다
- `approvals.exec`는 승인 프롬프트를 다른 채팅 대상에 전달하는 것을 제어합니다
- `channels.<channel>.execApprovals`는 해당 채널이 네이티브 승인 클라이언트로 작동하는지를 제어합니다

네이티브 승인 클라이언트는 다음이 모두 true일 때 DM 우선 전달을 자동 활성화합니다:

- 채널이 네이티브 승인 전달을 지원합니다
- 명시적 `execApprovals.approvers` 또는 해당
  채널의 문서화된 폴백 소스에서 승인자를 해결할 수 있습니다
- `channels.<channel>.execApprovals.enabled`가 설정되지 않았거나 `"auto"`입니다

명시적으로 네이티브 승인 클라이언트를 비활성화하려면 `enabled: false`를 설정하십시오. 승인자가 해결될 때
강제로 켜려면 `enabled: true`를 설정하십시오. 공개 출처 채팅 전달은
`channels.<channel>.execApprovals.target`을 통해 명시적으로 유지됩니다.

FAQ: [채팅 승인에 두 가지 exec 승인 구성이 있는 이유는 무엇입니까?](/help/faq-first-run#why-are-there-two-exec-approval-configs-for-chat-approvals)

- Discord: `channels.discord.execApprovals.*`
- Slack: `channels.slack.execApprovals.*`
- Telegram: `channels.telegram.execApprovals.*`

이 네이티브 승인 클라이언트는 공유 동일 채팅 `/approve` 흐름 및 공유 승인 버튼 위에
DM 라우팅 및 선택적 채널 팬아웃을 추가합니다.

공유 동작:

- Slack, Matrix, Microsoft Teams 및 유사한 전달 가능한 채팅은 동일 채팅 `/approve`에
  일반 채널 인증 모델을 사용합니다
- 네이티브 승인 클라이언트가 자동 활성화되면, 기본 네이티브 전달 대상은 승인자 DM입니다
- Discord와 Telegram의 경우, 해결된 승인자만 승인하거나 거부할 수 있습니다
- Discord 승인자는 명시적(`execApprovals.approvers`)이거나 `commands.ownerAllowFrom`에서 유추될 수 있습니다
- Telegram 승인자는 명시적(`execApprovals.approvers`)이거나 기존 소유자 구성(`allowFrom`, 지원되는 경우 DM `defaultTo`)에서 유추될 수 있습니다
- Slack 승인자는 명시적(`execApprovals.approvers`)이거나 `commands.ownerAllowFrom`에서 유추될 수 있습니다
- Slack 네이티브 버튼은 승인 ID 종류를 보존하므로, `plugin:` ID는 두 번째 Slack 로컬 폴백 레이어 없이
  플러그인 승인을 해결할 수 있습니다
- Matrix 네이티브 DM/채널 라우팅 및 반응 단축키는 exec 및 플러그인 승인을 모두 처리합니다;
  플러그인 인증은 여전히 `channels.matrix.dm.allowFrom`에서 옵니다
- 요청자는 승인자일 필요가 없습니다
- 시작 채팅은 해당 채팅이 이미 명령 및 응답을 지원하는 경우 `/approve`로 직접 승인할 수 있습니다
- 네이티브 Discord 승인 버튼은 승인 ID 종류별로 라우팅합니다: `plugin:` ID는 바로
  플러그인 승인으로 가고, 그 외 모든 것은 exec 승인으로 갑니다
- 네이티브 Telegram 승인 버튼은 `/approve`와 동일한 바인딩된 exec-to-plugin 폴백을 따릅니다
- 네이티브 `target`이 출처 채팅 전달을 활성화하면, 승인 프롬프트에 명령 텍스트가 포함됩니다
- 보류 중인 exec 승인은 기본적으로 30분 후 만료됩니다
- 운영자 UI나 구성된 승인 클라이언트가 요청을 수락할 수 없는 경우, 프롬프트는 `askFallback`으로 폴백합니다

Telegram은 기본적으로 승인자 DM(`target: "dm"`)으로 설정됩니다. 승인 프롬프트가
시작 Telegram 채팅/주제에도 나타나도록 하려면 `channel` 또는 `both`로 전환할 수 있습니다. Telegram 포럼
주제의 경우, OpenClaw는 승인 프롬프트와 승인 후 후속 조치 모두에 대해 주제를 보존합니다.

참조:

- [Discord](/channels/discord)
- [Telegram](/channels/telegram)

### macOS IPC 흐름

```
Gateway -> Node Service (WS)
                 |  IPC (UDS + token + HMAC + TTL)
                 v
             Mac App (UI + approvals + system.run)
```

보안 참고:

- Unix 소켓 모드 `0600`, 토큰은 `exec-approvals.json`에 저장됩니다.
- 동일 UID 피어 확인.
- 챌린지/응답 (논스 + HMAC 토큰 + 요청 해시) + 짧은 TTL.

## 관련 항목

- [Exec 승인](/tools/exec-approvals) — 핵심 정책 및 승인 흐름
- [Exec 도구](/tools/exec)
- [Elevated 모드](/tools/elevated)
- [스킬](/tools/skills) — 스킬 지원 자동 허용 동작
