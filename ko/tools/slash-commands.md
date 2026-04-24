---
summary: "슬래시 명령: 텍스트 vs 네이티브, 설정, 지원 명령"
read_when:
  - 채팅 명령을 사용하거나 구성하는 경우
  - 명령 라우팅 또는 권한을 디버깅하는 경우
title: "슬래시 명령"
---

명령은 게이트웨이가 처리합니다. 대부분의 명령은 `/`로 시작하는 **독립된** 메시지로 전송되어야 합니다.
호스트 전용 bash 채팅 명령은 `! <cmd>`를 사용합니다 (`/bash <cmd>`가 별칭입니다).

두 가지 관련 시스템이 있습니다:

- **Commands**: 독립된 `/...` 메시지.
- **Directives**: `/think`, `/fast`, `/verbose`, `/trace`, `/reasoning`, `/elevated`, `/exec`, `/model`, `/queue`.
  - Directive는 모델이 보기 전에 메시지에서 제거됩니다.
  - 일반 채팅 메시지(directive 전용이 아닌)에서는 "인라인 힌트"로 처리되며 세션 설정을 **유지하지 않습니다**.
  - Directive 전용 메시지(메시지에 directive만 포함)에서는 세션에 지속되며 확인 메시지로 응답합니다.
  - Directive는 **인가된 발신자**에 대해서만 적용됩니다. `commands.allowFrom`이 설정되어 있으면 이것이
    사용되는 유일한 허용 목록이며, 그렇지 않으면 인가는 채널 허용 목록/페어링과 `commands.useAccessGroups`에서 옵니다.
    인가되지 않은 발신자에게 directive는 일반 텍스트로 처리됩니다.

몇 가지 **인라인 단축키**(허용/인가된 발신자만)도 있습니다: `/help`, `/commands`, `/status`, `/whoami` (`/id`).
이들은 즉시 실행되며, 모델이 메시지를 보기 전에 제거되고, 나머지 텍스트는 일반 플로우를 계속 진행합니다.

## 설정

```json5
{
  commands: {
    native: "auto",
    nativeSkills: "auto",
    text: true,
    bash: false,
    bashForegroundMs: 2000,
    config: false,
    mcp: false,
    plugins: false,
    debug: false,
    restart: true,
    ownerAllowFrom: ["discord:123456789012345678"],
    ownerDisplay: "raw",
    ownerDisplaySecret: "${OWNER_ID_HASH_SECRET}",
    allowFrom: {
      "*": ["user1"],
      discord: ["user:123"],
    },
    useAccessGroups: true,
  },
}
```

- `commands.text` (기본값 `true`)는 채팅 메시지에서 `/...` 파싱을 활성화합니다.
  - 네이티브 명령이 없는 표면(WhatsApp/WebChat/Signal/iMessage/Google Chat/Microsoft Teams)에서는 `false`로 설정해도 텍스트 명령이 여전히 작동합니다.
- `commands.native` (기본값 `"auto"`)는 네이티브 명령을 등록합니다.
  - Auto: Discord/Telegram에서 켜짐, Slack에서 꺼짐(슬래시 명령을 추가할 때까지), 네이티브 지원이 없는 프로바이더에서는 무시됨.
  - 프로바이더별로 재정의하려면 `channels.discord.commands.native`, `channels.telegram.commands.native` 또는 `channels.slack.commands.native`를 설정합니다 (bool 또는 `"auto"`).
  - `false`는 시작 시 Discord/Telegram에 이전에 등록된 명령을 지웁니다. Slack 명령은 Slack 앱에서 관리되며 자동으로 제거되지 않습니다.
- `commands.nativeSkills` (기본값 `"auto"`)는 지원되는 경우 **스킬** 명령을 네이티브로 등록합니다.
  - Auto: Discord/Telegram에서 켜짐, Slack에서 꺼짐(Slack은 스킬마다 슬래시 명령 생성을 요구함).
  - 프로바이더별로 재정의하려면 `channels.discord.commands.nativeSkills`, `channels.telegram.commands.nativeSkills` 또는 `channels.slack.commands.nativeSkills`를 설정합니다 (bool 또는 `"auto"`).
- `commands.bash` (기본값 `false`)는 `! <cmd>`로 호스트 셸 명령을 실행할 수 있게 합니다 (`/bash <cmd>`가 별칭이며, `tools.elevated` 허용 목록이 필요합니다).
- `commands.bashForegroundMs` (기본값 `2000`)는 bash가 백그라운드 모드로 전환하기 전에 대기하는 시간을 제어합니다 (`0`은 즉시 백그라운드로).
- `commands.config` (기본값 `false`)는 `/config` (`openclaw.json` 읽기/쓰기)를 활성화합니다.
- `commands.mcp` (기본값 `false`)는 `/mcp` (`mcp.servers` 아래 OpenClaw 관리 MCP 설정 읽기/쓰기)를 활성화합니다.
- `commands.plugins` (기본값 `false`)는 `/plugins` (플러그인 검색/상태 + 설치 및 활성화/비활성화 제어)를 활성화합니다.
- `commands.debug` (기본값 `false`)는 `/debug` (런타임 전용 재정의)를 활성화합니다.
- `commands.restart` (기본값 `true`)는 `/restart`와 게이트웨이 재시작 도구 액션을 활성화합니다.
- `commands.ownerAllowFrom` (선택)는 소유자 전용 명령/도구 표면에 대한 명시적 소유자 허용 목록을 설정합니다. 이는 `commands.allowFrom`과 별개입니다.
- 채널별 `channels.<channel>.commands.enforceOwnerForCommands` (선택, 기본값 `false`)는 소유자 전용 명령이 해당 표면에서 실행될 때 **소유자 신원**을 요구하도록 만듭니다. `true`일 때, 발신자는 해결된 소유자 후보(예: `commands.ownerAllowFrom`의 항목이나 프로바이더 네이티브 소유자 메타데이터)와 일치하거나 내부 메시지 채널에서 내부 `operator.admin` 스코프를 보유해야 합니다. 채널 `allowFrom`의 와일드카드 항목이나 비어 있거나 해결되지 않은 소유자 후보 목록은 **충분하지 않으며**, 해당 채널에서 소유자 전용 명령은 닫힌 상태로 실패합니다. 소유자 전용 명령을 `ownerAllowFrom`과 표준 명령 허용 목록으로만 게이팅하려면 이 옵션을 끄세요.
- `commands.ownerDisplay`는 시스템 프롬프트에 소유자 id가 어떻게 표시되는지 제어합니다: `raw` 또는 `hash`.
- `commands.ownerDisplaySecret`은 `commands.ownerDisplay="hash"`일 때 사용되는 HMAC 시크릿을 선택적으로 설정합니다.
- `commands.allowFrom` (선택)은 명령 인가를 위한 프로바이더별 허용 목록을 설정합니다. 구성되면 명령과 directive의
  유일한 인가 소스이며 (채널 허용 목록/페어링과 `commands.useAccessGroups`는 무시됨).
  전역 기본값에는 `"*"`를 사용하며, 프로바이더별 키가 이를 재정의합니다.
- `commands.useAccessGroups` (기본값 `true`)는 `commands.allowFrom`이 설정되지 않은 경우 명령에 대한 허용 목록/정책을 강제합니다.

## 명령 목록

현재 소스 기준:

- 핵심 내장 명령은 `src/auto-reply/commands-registry.shared.ts`에서 옵니다
- 생성된 dock 명령은 `src/auto-reply/commands-registry.data.ts`에서 옵니다
- 플러그인 명령은 플러그인의 `registerCommand()` 호출에서 옵니다
- 게이트웨이에서 실제 사용 가능성은 여전히 설정 플래그, 채널 표면 및 설치/활성화된 플러그인에 따라 달라집니다

### 핵심 내장 명령

현재 사용 가능한 내장 명령:

- `/new [model]`은 새 세션을 시작합니다; `/reset`은 reset 별칭입니다.
- `/reset soft [message]`는 현재 트랜스크립트를 유지하고, 재사용된 CLI 백엔드 세션 id를 삭제하며, 시작/시스템 프롬프트 로딩을 제자리에서 다시 실행합니다.
- `/compact [instructions]`는 세션 컨텍스트를 압축합니다. [/concepts/compaction](/concepts/compaction)을 참고하세요.
- `/stop`은 현재 실행을 중단합니다.
- `/session idle <duration|off>`와 `/session max-age <duration|off>`는 스레드 바인딩 만료를 관리합니다.
- `/think <level>`은 thinking 레벨을 설정합니다. 옵션은 활성 모델의 프로바이더 프로필에서 오며, 일반적인 레벨은 `off`, `minimal`, `low`, `medium`, `high`이며, `xhigh`, `adaptive`, `max` 같은 커스텀 레벨이나 이진 `on`은 지원되는 경우에만 제공됩니다. 별칭: `/thinking`, `/t`.
- `/verbose on|off|full`은 자세한 출력을 토글합니다. 별칭: `/v`.
- `/trace on|off`는 현재 세션에 대한 플러그인 추적 출력을 토글합니다.
- `/fast [status|on|off]`는 fast 모드를 표시하거나 설정합니다.
- `/reasoning [on|off|stream]`은 reasoning 가시성을 토글합니다. 별칭: `/reason`.
- `/elevated [on|off|ask|full]`은 elevated 모드를 토글합니다. 별칭: `/elev`.
- `/exec host=<auto|sandbox|gateway|node> security=<deny|allowlist|full> ask=<off|on-miss|always> node=<id>`는 exec 기본값을 표시하거나 설정합니다.
- `/model [name|#|status]`는 모델을 표시하거나 설정합니다.
- `/models [provider] [page] [limit=<n>|size=<n>|all]`은 프로바이더 또는 프로바이더의 모델을 나열합니다.
- `/queue <mode>`는 큐 동작을 관리합니다 (`steer`, `interrupt`, `followup`, `collect`, `steer-backlog`)과 `debounce:2s cap:25 drop:summarize` 같은 옵션.
- `/help`는 간단한 도움말 요약을 표시합니다.
- `/commands`는 생성된 명령 카탈로그를 표시합니다.
- `/tools [compact|verbose]`는 현재 에이전트가 지금 무엇을 사용할 수 있는지 표시합니다.
- `/status`는 런타임 상태를 표시하며, `Runtime`/`Runner` 레이블과 사용 가능한 경우 프로바이더 사용량/쿼터를 포함합니다.
- `/tasks`는 현재 세션의 활성/최근 백그라운드 작업을 나열합니다.
- `/context [list|detail|json]`은 컨텍스트가 어떻게 구성되는지 설명합니다.
- `/export-session [path]`는 현재 세션을 HTML로 내보냅니다. 별칭: `/export`.
- `/export-trajectory [path]`는 현재 세션에 대한 JSONL [trajectory bundle](/tools/trajectory)을 내보냅니다. 별칭: `/trajectory`.
- `/whoami`는 발신자 id를 표시합니다. 별칭: `/id`.
- `/skill <name> [input]`은 이름으로 스킬을 실행합니다.
- `/allowlist [list|add|remove] ...`는 허용 목록 항목을 관리합니다. 텍스트 전용.
- `/approve <id> <decision>`은 exec 승인 프롬프트를 해결합니다.
- `/btw <question>`은 향후 세션 컨텍스트를 변경하지 않고 부수적 질문을 합니다. [/tools/btw](/tools/btw)를 참고하세요.
- `/subagents list|kill|log|info|send|steer|spawn`은 현재 세션에 대한 서브 에이전트 실행을 관리합니다.
- `/acp spawn|cancel|steer|close|sessions|status|set-mode|set|cwd|permissions|timeout|model|reset-options|doctor|install|help`는 ACP 세션과 런타임 옵션을 관리합니다.
- `/focus <target>`은 현재 Discord 스레드 또는 Telegram 토픽/대화를 세션 타깃에 바인딩합니다.
- `/unfocus`는 현재 바인딩을 제거합니다.
- `/agents`는 현재 세션에 대한 스레드 바운드 에이전트를 나열합니다.
- `/kill <id|#|all>`은 하나 또는 모든 실행 중인 서브 에이전트를 중단합니다.
- `/steer <id|#> <message>`는 실행 중인 서브 에이전트로 조정을 보냅니다. 별칭: `/tell`.
- `/config show|get|set|unset`은 `openclaw.json`을 읽거나 씁니다. 소유자 전용. `commands.config: true`가 필요합니다.
- `/mcp show|get|set|unset`은 `mcp.servers` 아래 OpenClaw 관리 MCP 서버 설정을 읽거나 씁니다. 소유자 전용. `commands.mcp: true`가 필요합니다.
- `/plugins list|inspect|show|get|install|enable|disable`은 플러그인 상태를 검사하거나 변경합니다. `/plugin`이 별칭입니다. 쓰기는 소유자 전용. `commands.plugins: true`가 필요합니다.
- `/debug show|set|unset|reset`은 런타임 전용 설정 재정의를 관리합니다. 소유자 전용. `commands.debug: true`가 필요합니다.
- `/usage off|tokens|full|cost`는 응답당 사용량 푸터를 제어하거나 로컬 비용 요약을 출력합니다.
- `/tts on|off|status|provider|limit|summary|audio|help`는 TTS를 제어합니다. [/tools/tts](/tools/tts)를 참고하세요.
- `/restart`는 활성화된 경우 OpenClaw를 재시작합니다. 기본값: 활성화됨; 비활성화하려면 `commands.restart: false`로 설정하세요.
- `/activation mention|always`는 그룹 활성화 모드를 설정합니다.
- `/send on|off|inherit`는 전송 정책을 설정합니다. 소유자 전용.
- `/bash <command>`는 호스트 셸 명령을 실행합니다. 텍스트 전용. 별칭: `! <command>`. `commands.bash: true`와 `tools.elevated` 허용 목록이 필요합니다.
- `!poll [sessionId]`는 백그라운드 bash 작업을 확인합니다.
- `!stop [sessionId]`는 백그라운드 bash 작업을 중지합니다.

### 생성된 dock 명령

Dock 명령은 네이티브 명령을 지원하는 채널 플러그인에서 생성됩니다. 현재 번들 세트:

- `/dock-discord` (별칭: `/dock_discord`)
- `/dock-mattermost` (별칭: `/dock_mattermost`)
- `/dock-slack` (별칭: `/dock_slack`)
- `/dock-telegram` (별칭: `/dock_telegram`)

### 번들 플러그인 명령

번들 플러그인은 더 많은 슬래시 명령을 추가할 수 있습니다. 이 저장소의 현재 번들 명령:

- `/dreaming [on|off|status|help]`은 메모리 드리밍을 토글합니다. [Dreaming](/concepts/dreaming)을 참고하세요.
- `/pair [qr|status|pending|approve|cleanup|notify]`는 기기 페어링/설정 플로우를 관리합니다. [Pairing](/channels/pairing)을 참고하세요.
- `/phone status|arm <camera|screen|writes|all> [duration]|disarm`은 고위험 phone 노드 명령을 일시적으로 암합니다.
- `/voice status|list [limit]|set <voiceId|name>`는 Talk voice 설정을 관리합니다. Discord에서 네이티브 명령 이름은 `/talkvoice`입니다.
- `/card ...`는 LINE 리치 카드 프리셋을 보냅니다. [LINE](/channels/line)을 참고하세요.
- `/codex status|models|threads|resume|compact|review|account|mcp|skills`는 번들된 Codex app-server 하네스를 검사하고 제어합니다. [Codex Harness](/plugins/codex-harness)를 참고하세요.
- QQBot 전용 명령:
  - `/bot-ping`
  - `/bot-version`
  - `/bot-help`
  - `/bot-upgrade`
  - `/bot-logs`

### 동적 스킬 명령

사용자가 호출할 수 있는 스킬도 슬래시 명령으로 노출됩니다:

- `/skill <name> [input]`은 항상 일반 진입점으로 작동합니다.
- 스킬/플러그인이 등록하면 스킬은 `/prose`처럼 직접 명령으로도 나타날 수 있습니다.
- 네이티브 스킬-명령 등록은 `commands.nativeSkills`와 `channels.<provider>.commands.nativeSkills`로 제어됩니다.

참고:

- 명령은 명령과 인자 사이에 선택적 `:`를 허용합니다 (예: `/think: high`, `/send: on`, `/help:`).
- `/new <model>`은 모델 별칭, `provider/model` 또는 프로바이더 이름(퍼지 매치)을 허용합니다. 일치하지 않으면 텍스트가 메시지 본문으로 처리됩니다.
- 전체 프로바이더 사용량 분석에는 `openclaw status --usage`를 사용하세요.
- `/allowlist add|remove`는 `commands.config=true`가 필요하며 채널 `configWrites`를 준수합니다.
- 멀티 계정 채널에서 설정 대상 `/allowlist --account <id>` 및 `/config set channels.<provider>.accounts.<id>...`도 대상 계정의 `configWrites`를 준수합니다.
- `/usage`는 응답당 사용량 푸터를 제어합니다; `/usage cost`는 OpenClaw 세션 로그에서 로컬 비용 요약을 출력합니다.
- `/restart`는 기본적으로 활성화되어 있습니다; 비활성화하려면 `commands.restart: false`로 설정하세요.
- `/plugins install <spec>`은 `openclaw plugins install`과 동일한 플러그인 스펙을 허용합니다: 로컬 경로/아카이브, npm 패키지 또는 `clawhub:<pkg>`.
- `/plugins enable|disable`은 플러그인 설정을 업데이트하며 재시작을 요청할 수 있습니다.
- Discord 전용 네이티브 명령: `/vc join|leave|status`는 음성 채널을 제어합니다 (`channels.discord.voice`와 네이티브 명령이 필요; 텍스트로는 사용할 수 없음).
- Discord 스레드 바인딩 명령(`/focus`, `/unfocus`, `/agents`, `/session idle`, `/session max-age`)은 유효한 스레드 바인딩이 활성화되어 있어야 합니다 (`session.threadBindings.enabled` 및/또는 `channels.discord.threadBindings.enabled`).
- ACP 명령 레퍼런스와 런타임 동작: [ACP Agents](/tools/acp-agents).
- `/verbose`는 디버깅과 추가 가시성을 위한 것입니다; 일반 사용에서는 **끄세요**.
- `/trace`는 `/verbose`보다 좁습니다: 플러그인 소유 추적/디버그 라인만 드러내며 일반 verbose 도구 수다는 꺼진 상태로 유지합니다.
- `/fast on|off`는 세션 재정의를 유지합니다. 설정 기본값으로 돌아가려면 Sessions UI `inherit` 옵션을 사용하여 지우세요.
- `/fast`는 프로바이더 특정입니다: OpenAI/OpenAI Codex는 네이티브 Responses 엔드포인트에서 `service_tier=priority`로 매핑하며, `api.anthropic.com`에 전송되는 OAuth 인증 트래픽을 포함한 직접 공개 Anthropic 요청은 `service_tier=auto` 또는 `standard_only`로 매핑합니다. [OpenAI](/providers/openai)와 [Anthropic](/providers/anthropic)을 참고하세요.
- 도구 실패 요약은 여전히 관련될 때 표시되지만, 자세한 실패 텍스트는 `/verbose`가 `on` 또는 `full`일 때만 포함됩니다.
- `/reasoning`, `/verbose`, `/trace`는 그룹 환경에서 위험합니다: 의도하지 않게 노출하고 싶지 않은 내부 추론, 도구 출력 또는 플러그인 진단을 드러낼 수 있습니다. 특히 그룹 채팅에서는 끄는 것을 선호하세요.
- `/model`은 새 세션 모델을 즉시 유지합니다.
- 에이전트가 유휴 상태라면 다음 실행이 즉시 이를 사용합니다.
- 실행이 이미 활성 상태라면 OpenClaw는 라이브 전환을 대기 중으로 표시하고 새 모델로 깨끗한 재시도 지점에서만 재시작합니다.
- 도구 활동이나 응답 출력이 이미 시작되었다면, 대기 중인 전환은 나중의 재시도 기회나 다음 사용자 턴까지 큐에 머물 수 있습니다.
- **Fast path:** 허용 목록에 있는 발신자의 명령 전용 메시지는 즉시 처리됩니다 (큐 + 모델 우회).
- **그룹 멘션 게이팅:** 허용 목록에 있는 발신자의 명령 전용 메시지는 멘션 요구사항을 우회합니다.
- **인라인 단축키 (허용 목록 발신자만):** 특정 명령은 일반 메시지에 포함되어 있을 때도 작동하며, 모델이 나머지 텍스트를 보기 전에 제거됩니다.
  - 예: `hey /status`는 상태 응답을 트리거하고, 나머지 텍스트는 일반 플로우를 계속합니다.
- 현재: `/help`, `/commands`, `/status`, `/whoami` (`/id`).
- 인가되지 않은 명령 전용 메시지는 조용히 무시되며, 인라인 `/...` 토큰은 일반 텍스트로 처리됩니다.
- **스킬 명령:** `user-invocable` 스킬은 슬래시 명령으로 노출됩니다. 이름은 `a-z0-9_`(최대 32자)로 정제됩니다; 충돌이 있으면 숫자 접미사(예: `_2`)를 받습니다.
  - `/skill <name> [input]`은 이름으로 스킬을 실행합니다 (네이티브 명령 제한이 스킬별 명령을 방해할 때 유용함).
  - 기본적으로 스킬 명령은 일반 요청으로 모델에 전달됩니다.
  - 스킬은 선택적으로 `command-dispatch: tool`을 선언하여 명령을 도구로 직접 라우팅할 수 있습니다 (결정론적, 모델 없음).
  - 예: `/prose` (OpenProse 플러그인) — [OpenProse](/prose)를 참고하세요.
- **네이티브 명령 인자:** Discord는 동적 옵션에 대해 자동 완성을 사용하며(필수 인자를 생략하면 버튼 메뉴), Telegram과 Slack은 명령이 선택지를 지원하고 인자를 생략하면 버튼 메뉴를 표시합니다.

## `/tools`

`/tools`는 설정 질문이 아닌 런타임 질문에 답합니다: **이 에이전트가 이 대화에서 지금 무엇을 사용할 수 있는가**.

- 기본 `/tools`는 간결하며 빠른 스캔에 최적화되어 있습니다.
- `/tools verbose`는 짧은 설명을 추가합니다.
- 인자를 지원하는 네이티브 명령 표면은 `compact|verbose`와 동일한 모드 스위치를 노출합니다.
- 결과는 세션 범위이므로 에이전트, 채널, 스레드, 발신자 인가 또는 모델을 변경하면
  출력이 바뀔 수 있습니다.
- `/tools`는 코어 도구, 연결된 플러그인 도구, 채널 소유 도구를 포함하여 런타임에 실제로
  도달 가능한 도구를 포함합니다.

프로필과 재정의 편집은 `/tools`를 정적 카탈로그로 취급하는 대신 Control UI Tools 패널이나 설정/카탈로그 표면을
사용하세요.

## 사용량 표면 (무엇이 어디에 표시되는가)

- **프로바이더 사용량/쿼터** (예: "Claude 80% 남음")는 사용량 추적이 활성화된 경우 현재 모델 프로바이더에 대해 `/status`에 표시됩니다. OpenClaw는 프로바이더 윈도우를 `% 남음`으로 정규화합니다; MiniMax의 경우 잔량 전용 퍼센트 필드는 표시 전에 반전되며, `model_remains` 응답은 채팅 모델 항목과 모델 태그된 플랜 레이블을 선호합니다.
- `/status`의 **토큰/캐시 라인**은 라이브 세션 스냅샷이 희박할 때 최신 트랜스크립트 사용량 항목으로 폴백할 수 있습니다. 기존 0이 아닌 라이브 값이 여전히 우선되며, 트랜스크립트 폴백은 저장된 총계가 누락되거나 더 작을 때 활성 런타임 모델 레이블과 더 큰 프롬프트 지향 총계도 복구할 수 있습니다.
- **Runtime vs runner:** `/status`는 유효한 실행 경로와 샌드박스 상태에 대해 `Runtime`을 보고하고, 실제로 세션을 실행하는 주체에 대해 `Runner`를 보고합니다: 임베디드 Pi, CLI 백엔드 프로바이더 또는 ACP 하네스/백엔드.
- **응답당 토큰/비용**은 `/usage off|tokens|full`로 제어됩니다 (일반 응답에 추가됨).
- `/model status`는 사용량이 아닌 **모델/인증/엔드포인트**에 관한 것입니다.

## 모델 선택 (`/model`)

`/model`은 directive로 구현됩니다.

예:

```
/model
/model list
/model 3
/model openai/gpt-5.4
/model opus@anthropic:default
/model status
```

참고:

- `/model`과 `/model list`는 간결한 번호 매겨진 선택기를 표시합니다 (모델 계열 + 사용 가능한 프로바이더).
- Discord에서 `/model`과 `/models`는 프로바이더와 모델 드롭다운 + Submit 단계가 있는 대화형 선택기를 엽니다.
- `/model <#>`는 그 선택기에서 선택합니다 (가능한 경우 현재 프로바이더를 선호함).
- `/model status`는 사용 가능한 경우 구성된 프로바이더 엔드포인트(`baseUrl`)와 API 모드(`api`)를 포함한 자세한 뷰를 표시합니다.

## 디버그 재정의

`/debug`는 **런타임 전용** 설정 재정의(메모리, 디스크 아님)를 설정할 수 있게 해줍니다. 소유자 전용. 기본적으로 비활성화됨; `commands.debug: true`로 활성화하세요.

예:

```
/debug show
/debug set messages.responsePrefix="[openclaw]"
/debug set channels.whatsapp.allowFrom=["+1555","+4477"]
/debug unset messages.responsePrefix
/debug reset
```

참고:

- 재정의는 새 설정 읽기에 즉시 적용되지만 `openclaw.json`에는 **쓰지 않습니다**.
- 모든 재정의를 지우고 디스크의 설정으로 돌아가려면 `/debug reset`을 사용하세요.

## 플러그인 추적 출력

`/trace`는 전체 verbose 모드를 켜지 않고 **세션 범위 플러그인 추적/디버그 라인**을 토글할 수 있게 해줍니다.

예:

```text
/trace
/trace on
/trace off
```

참고:

- 인자 없는 `/trace`는 현재 세션 추적 상태를 표시합니다.
- `/trace on`은 현재 세션에 대한 플러그인 추적 라인을 활성화합니다.
- `/trace off`는 다시 비활성화합니다.
- 플러그인 추적 라인은 `/status`와 일반 어시스턴트 응답 후 후속 진단 메시지로 나타날 수 있습니다.
- `/trace`는 `/debug`를 대체하지 않습니다; `/debug`는 여전히 런타임 전용 설정 재정의를 관리합니다.
- `/trace`는 `/verbose`를 대체하지 않습니다; 일반 verbose 도구/상태 출력은 여전히 `/verbose`에 속합니다.

## 설정 업데이트

`/config`는 디스크의 설정(`openclaw.json`)에 씁니다. 소유자 전용. 기본적으로 비활성화됨; `commands.config: true`로 활성화하세요.

예:

```
/config show
/config show messages.responsePrefix
/config get messages.responsePrefix
/config set messages.responsePrefix="[openclaw]"
/config unset messages.responsePrefix
```

참고:

- 설정은 쓰기 전에 검증되며, 잘못된 변경은 거부됩니다.
- `/config` 업데이트는 재시작 간에도 유지됩니다.

## MCP 업데이트

`/mcp`는 `mcp.servers` 아래 OpenClaw 관리 MCP 서버 정의를 씁니다. 소유자 전용. 기본적으로 비활성화됨; `commands.mcp: true`로 활성화하세요.

예:

```text
/mcp show
/mcp show context7
/mcp set context7={"command":"uvx","args":["context7-mcp"]}
/mcp unset context7
```

참고:

- `/mcp`는 Pi 소유 프로젝트 설정이 아닌 OpenClaw 설정에 구성을 저장합니다.
- 런타임 어댑터가 실제로 어떤 전송이 실행 가능한지 결정합니다.

## 플러그인 업데이트

`/plugins`는 운영자가 발견된 플러그인을 검사하고 설정에서 활성화를 토글할 수 있게 해줍니다. 읽기 전용 플로우는 `/plugin`을 별칭으로 사용할 수 있습니다. 기본적으로 비활성화됨; `commands.plugins: true`로 활성화하세요.

예:

```text
/plugins
/plugins list
/plugin show context7
/plugins enable context7
/plugins disable context7
```

참고:

- `/plugins list`와 `/plugins show`는 현재 워크스페이스와 디스크의 설정에 대한 실제 플러그인 디스커버리를 사용합니다.
- `/plugins enable|disable`은 플러그인 설정만 업데이트하며, 플러그인을 설치하거나 제거하지 않습니다.
- 활성화/비활성화 변경 후, 이를 적용하려면 게이트웨이를 재시작하세요.

## 표면 참고 사항

- **텍스트 명령**은 일반 채팅 세션에서 실행됩니다 (DM은 `main`을 공유, 그룹은 자체 세션을 가짐).
- **네이티브 명령**은 격리된 세션을 사용합니다:
  - Discord: `agent:<agentId>:discord:slash:<userId>`
  - Slack: `agent:<agentId>:slack:slash:<userId>` (`channels.slack.slashCommand.sessionPrefix`로 접두사 구성 가능)
  - Telegram: `telegram:slash:<userId>` (`CommandTargetSessionKey`를 통해 채팅 세션을 타깃)
- **`/stop`**은 현재 실행을 중단할 수 있도록 활성 채팅 세션을 타깃합니다.
- **Slack:** `channels.slack.slashCommand`는 여전히 단일 `/openclaw` 스타일 명령에 대해 지원됩니다. `commands.native`를 활성화하면 각 내장 명령(`/help`와 동일한 이름)마다 Slack 슬래시 명령을 하나씩 생성해야 합니다. Slack용 명령 인자 메뉴는 임시 Block Kit 버튼으로 전달됩니다.
  - Slack 네이티브 예외: Slack은 `/status`를 예약하므로 `/status`가 아닌 `/agentstatus`를 등록하세요. 텍스트 `/status`는 Slack 메시지에서 여전히 작동합니다.

## BTW 부수 질문

`/btw`는 현재 세션에 대한 빠른 **부수 질문**입니다.

일반 채팅과 달리:

- 현재 세션을 배경 컨텍스트로 사용하며,
- 별도의 **도구 없는** 원샷 호출로 실행되고,
- 향후 세션 컨텍스트를 변경하지 않으며,
- 트랜스크립트 이력에 기록되지 않고,
- 일반 어시스턴트 메시지 대신 라이브 부수 결과로 전달됩니다.

이는 주요 작업이 계속 진행되는 동안 임시 명확화를 원할 때 `/btw`가 유용하게 만듭니다.

예:

```text
/btw 우리가 지금 뭘 하고 있지?
```

전체 동작과 클라이언트 UX 세부 사항은 [BTW Side Questions](/tools/btw)를 참고하세요.

## 관련

- [Skills](/tools/skills)
- [Skills config](/tools/skills-config)
- [Creating skills](/tools/creating-skills)
