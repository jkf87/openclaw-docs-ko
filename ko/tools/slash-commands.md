---
summary: "슬래시 명령: 텍스트 vs 네이티브, 설정, 지원 명령"
read_when:
  - Using or configuring chat commands
  - Debugging command routing or permissions
title: "슬래시 명령"
---

# 슬래시 명령

명령은 게이트웨이에서 처리됩니다. 대부분의 명령은 `/`로 시작하는 **독립** 메시지로 전송해야 합니다.
호스트 전용 bash 채팅 명령은 `! <cmd>`를 사용합니다 (`/bash <cmd>`가 별칭).

두 가지 관련 시스템이 있습니다:

- **명령**: 독립 `/...` 메시지.
- **지시자**: `/think`, `/fast`, `/verbose`, `/reasoning`, `/elevated`, `/exec`, `/model`, `/queue`.
  - 지시자는 모델이 보기 전에 메시지에서 제거됩니다.
  - 일반 채팅 메시지 (지시자 전용이 아닌)에서는 "인라인 힌트"로 처리되며 세션 설정을 **지속하지 않습니다**.
  - 지시자 전용 메시지 (메시지에 지시자만 포함)에서는 세션에 지속되고 확인으로 응답합니다.
  - 지시자는 **승인된 발신자**에게만 적용됩니다. `commands.allowFrom`이 설정된 경우 유일하게 사용되는 허용 목록입니다. 그렇지 않으면 승인은 채널 허용 목록/페어링 및 `commands.useAccessGroups`에서 옵니다.
    승인되지 않은 발신자는 지시자가 일반 텍스트로 처리됩니다.

또한 몇 가지 **인라인 단축키**도 있습니다 (허용 목록/승인된 발신자 전용): `/help`, `/commands`, `/status`, `/whoami` (`/id`).
즉시 실행되고 모델이 메시지를 보기 전에 제거되며 나머지 텍스트는 일반 흐름으로 계속됩니다.

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
  - 네이티브 명령이 없는 표면 (WhatsApp/WebChat/Signal/iMessage/Google Chat/Microsoft Teams)에서는 이것을 `false`로 설정해도 텍스트 명령이 계속 작동합니다.
- `commands.native` (기본값 `"auto"`)는 네이티브 명령을 등록합니다.
  - 자동: Discord/Telegram에서는 켜짐; Slack에서는 꺼짐 (슬래시 명령을 추가할 때까지); 네이티브 지원이 없는 프로바이더에서는 무시됨.
  - 프로바이더별로 재정의하려면 `channels.discord.commands.native`, `channels.telegram.commands.native`, `channels.slack.commands.native`를 설정하십시오 (bool 또는 `"auto"`).
  - `false`는 시작 시 Discord/Telegram에서 이전에 등록된 명령을 지웁니다. Slack 명령은 Slack 앱에서 관리되며 자동으로 제거되지 않습니다.
- `commands.nativeSkills` (기본값 `"auto"`)는 지원되는 경우 **스킬** 명령을 네이티브로 등록합니다.
  - 자동: Discord/Telegram에서는 켜짐; Slack에서는 꺼짐 (Slack은 스킬별 슬래시 명령 생성이 필요함).
  - 프로바이더별로 재정의하려면 `channels.discord.commands.nativeSkills`, `channels.telegram.commands.nativeSkills`, `channels.slack.commands.nativeSkills`를 설정하십시오 (bool 또는 `"auto"`).
- `commands.bash` (기본값 `false`)는 호스트 쉘 명령을 실행하는 `! <cmd>`를 활성화합니다 (`/bash <cmd>`는 별칭; `tools.elevated` 허용 목록 필요).
- `commands.bashForegroundMs` (기본값 `2000`)는 bash가 백그라운드 모드로 전환하기 전에 얼마나 기다릴지 제어합니다 (`0`은 즉시 백그라운드).
- `commands.config` (기본값 `false`)는 `/config`를 활성화합니다 (`openclaw.json` 읽기/쓰기).
- `commands.mcp` (기본값 `false`)는 `/mcp`를 활성화합니다 (`mcp.servers` 아래의 OpenClaw 관리 MCP 설정 읽기/쓰기).
- `commands.plugins` (기본값 `false`)는 `/plugins`를 활성화합니다 (플러그인 검색/상태 및 설치 + 활성화/비활성화 제어).
- `commands.debug` (기본값 `false`)는 `/debug`를 활성화합니다 (런타임 전용 재정의).
- `commands.restart` (기본값 `true`)는 `/restart` 및 게이트웨이 재시작 도구 액션을 활성화합니다.
- `commands.ownerAllowFrom` (선택 사항)은 소유자 전용 명령/도구 표면에 대한 명시적 소유자 허용 목록을 설정합니다. 이것은 `commands.allowFrom`과 별개입니다.
- `commands.ownerDisplay`는 소유자 ID가 시스템 프롬프트에 표시되는 방식을 제어합니다: `raw` 또는 `hash`.
- `commands.ownerDisplaySecret`은 `commands.ownerDisplay="hash"`일 때 사용되는 HMAC 비밀을 선택적으로 설정합니다.
- `commands.allowFrom` (선택 사항)은 명령 승인을 위한 프로바이더별 허용 목록을 설정합니다. 구성된 경우 명령 및 지시자에 대한 유일한 승인 소스입니다 (채널 허용 목록/페어링 및 `commands.useAccessGroups`는 무시됨). 전역 기본값에는 `"*"`를, 재정의에는 프로바이더별 키를 사용하십시오.
- `commands.useAccessGroups` (기본값 `true`)는 `commands.allowFrom`이 설정되지 않은 경우 명령에 대한 허용 목록/정책을 적용합니다.

## 명령 목록

현재 진실의 소스:

- 코어 내장 명령은 `src/auto-reply/commands-registry.shared.ts`에서 옵니다
- 생성된 독 명령은 `src/auto-reply/commands-registry.data.ts`에서 옵니다
- 플러그인 명령은 플러그인 `registerCommand()` 호출에서 옵니다
- 게이트웨이에서의 실제 가용성은 여전히 설정 플래그, 채널 표면, 설치/활성화된 플러그인에 따라 다릅니다

### 코어 내장 명령

현재 사용 가능한 내장 명령:

- `/new [model]`은 새 세션을 시작합니다. `/reset`은 재설정 별칭입니다.
- `/compact [instructions]`은 세션 컨텍스트를 압축합니다. [/concepts/compaction](/concepts/compaction)을 참조하십시오.
- `/stop`은 현재 실행을 중단합니다.
- `/session idle <duration|off>` 및 `/session max-age <duration|off>`는 스레드 바인딩 만료를 관리합니다.
- `/think <off|minimal|low|medium|high|xhigh>`는 추론 수준을 설정합니다. 별칭: `/thinking`, `/t`.
- `/verbose on|off|full`은 자세한 출력을 토글합니다. 별칭: `/v`.
- `/fast [status|on|off]`는 빠른 모드를 표시하거나 설정합니다.
- `/reasoning [on|off|stream]`은 추론 가시성을 토글합니다. 별칭: `/reason`.
- `/elevated [on|off|ask|full]`은 상승된 모드를 토글합니다. 별칭: `/elev`.
- `/exec host=<auto|sandbox|gateway|node> security=<deny|allowlist|full> ask=<off|on-miss|always> node=<id>`는 exec 기본값을 표시하거나 설정합니다.
- `/model [name|#|status]`는 모델을 표시하거나 설정합니다.
- `/models [provider] [page] [limit=<n>|size=<n>|all]`은 프로바이더 또는 프로바이더 모델을 나열합니다.
- `/queue <mode>`는 큐 동작을 관리합니다 (`steer`, `interrupt`, `followup`, `collect`, `steer-backlog`) 및 `debounce:2s cap:25 drop:summarize`와 같은 옵션.
- `/help`는 간단한 도움말 요약을 표시합니다.
- `/commands`는 생성된 명령 카탈로그를 표시합니다.
- `/tools [compact|verbose]`는 현재 에이전트가 지금 바로 사용할 수 있는 것을 표시합니다.
- `/status`는 사용 가능한 경우 프로바이더 사용량/할당량을 포함한 런타임 상태를 표시합니다.
- `/tasks`는 현재 세션의 활성/최근 백그라운드 작업을 나열합니다.
- `/context [list|detail|json]`은 컨텍스트가 어떻게 조합되는지 설명합니다.
- `/export-session [path]`는 현재 세션을 HTML로 내보냅니다. 별칭: `/export`.
- `/whoami`는 발신자 ID를 표시합니다. 별칭: `/id`.
- `/skill <name> [input]`은 이름으로 스킬을 실행합니다.
- `/allowlist [list|add|remove] ...`는 허용 목록 항목을 관리합니다. 텍스트 전용.
- `/approve <id> <decision>`은 exec 승인 프롬프트를 해결합니다.
- `/btw <question>`은 미래 세션 컨텍스트를 변경하지 않고 부가 질문을 합니다. [/tools/btw](/tools/btw)를 참조하십시오.
- `/subagents list|kill|log|info|send|steer|spawn`은 현재 세션의 서브 에이전트 실행을 관리합니다.
- `/acp spawn|cancel|steer|close|sessions|status|set-mode|set|cwd|permissions|timeout|model|reset-options|doctor|install|help`는 ACP 세션 및 런타임 옵션을 관리합니다.
- `/focus <target>`은 현재 Discord 스레드 또는 Telegram 토픽/대화를 세션 대상에 바인딩합니다.
- `/unfocus`는 현재 바인딩을 제거합니다.
- `/agents`는 현재 세션의 스레드 바인딩 에이전트를 나열합니다.
- `/kill <id|#|all>`은 하나 또는 모든 실행 중인 서브 에이전트를 중단합니다.
- `/steer <id|#> <message>`는 실행 중인 서브 에이전트에 조종 신호를 보냅니다. 별칭: `/tell`.
- `/config show|get|set|unset`은 `openclaw.json`을 읽거나 씁니다. 소유자 전용. `commands.config: true` 필요.
- `/mcp show|get|set|unset`은 `mcp.servers` 아래의 OpenClaw 관리 MCP 서버 설정을 읽거나 씁니다. 소유자 전용. `commands.mcp: true` 필요.
- `/plugins list|inspect|show|get|install|enable|disable`는 플러그인 상태를 검사하거나 변경합니다. `/plugin`은 별칭. 쓰기에는 소유자 전용. `commands.plugins: true` 필요.
- `/debug show|set|unset|reset`은 런타임 전용 설정 재정의를 관리합니다. 소유자 전용. `commands.debug: true` 필요.
- `/usage off|tokens|full|cost`는 응답별 사용량 푸터를 제어하거나 로컬 비용 요약을 출력합니다.
- `/tts on|off|status|provider|limit|summary|audio|help`는 TTS를 제어합니다. [/tools/tts](/tools/tts)를 참조하십시오.
- `/restart`는 활성화된 경우 OpenClaw를 재시작합니다. 기본값: 활성화됨. 비활성화하려면 `commands.restart: false`를 설정하십시오.
- `/activation mention|always`는 그룹 활성화 모드를 설정합니다.
- `/send on|off|inherit`는 전송 정책을 설정합니다. 소유자 전용.
- `/bash <command>`는 호스트 쉘 명령을 실행합니다. 텍스트 전용. 별칭: `! <command>`. `commands.bash: true` 및 `tools.elevated` 허용 목록 필요.
- `!poll [sessionId]`는 백그라운드 bash 작업을 확인합니다.
- `!stop [sessionId]`는 백그라운드 bash 작업을 중지합니다.

### 생성된 독 명령

독 명령은 네이티브 명령 지원이 있는 채널 플러그인에서 생성됩니다. 현재 번들된 세트:

- `/dock-discord` (별칭: `/dock_discord`)
- `/dock-mattermost` (별칭: `/dock_mattermost`)
- `/dock-slack` (별칭: `/dock_slack`)
- `/dock-telegram` (별칭: `/dock_telegram`)

### 번들된 플러그인 명령

번들된 플러그인은 더 많은 슬래시 명령을 추가할 수 있습니다. 이 레포의 현재 번들된 명령:

- `/dreaming [on|off|status|help]`는 메모리 드리밍을 토글합니다. [Dreaming](/concepts/dreaming)을 참조하십시오.
- `/pair [qr|status|pending|approve|cleanup|notify]`는 기기 페어링/설정 흐름을 관리합니다. [Pairing](/channels/pairing)을 참조하십시오.
- `/phone status|arm <camera|screen|writes|all> [duration]|disarm`은 고위험 폰 노드 명령을 일시적으로 활성화합니다.
- `/voice status|list [limit]|set <voiceId|name>`은 Talk 음성 설정을 관리합니다. Discord에서 네이티브 명령 이름은 `/talkvoice`입니다.
- `/card ...`는 LINE 리치 카드 프리셋을 전송합니다. [LINE](/channels/line)을 참조하십시오.
- QQBot 전용 명령:
  - `/bot-ping`
  - `/bot-version`
  - `/bot-help`
  - `/bot-upgrade`
  - `/bot-logs`

### 동적 스킬 명령

사용자 호출 가능 스킬도 슬래시 명령으로 노출됩니다:

- `/skill <name> [input]`은 항상 일반 진입점으로 작동합니다.
- 스킬/플러그인이 등록하는 경우 스킬은 `/prose`와 같은 직접 명령으로도 나타날 수 있습니다.
- 네이티브 스킬 명령 등록은 `commands.nativeSkills` 및 `channels.<provider>.commands.nativeSkills`로 제어됩니다.

참고 사항:

- 명령은 명령과 인수 사이에 선택적 `:`를 허용합니다 (예: `/think: high`, `/send: on`, `/help:`).
- `/new <model>`은 모델 별칭, `provider/model`, 또는 프로바이더 이름을 허용합니다 (퍼지 매치). 일치하는 것이 없으면 텍스트는 메시지 본문으로 처리됩니다.
- 전체 프로바이더 사용량 분류는 `openclaw status --usage`를 사용하십시오.
- `/allowlist add|remove`는 `commands.config=true` 및 채널 `configWrites`를 따릅니다.
- 멀티 계정 채널에서 설정 타겟 `/allowlist --account <id>` 및 `/config set channels.<provider>.accounts.<id>...`도 타겟 계정의 `configWrites`를 따릅니다.
- `/usage`는 응답별 사용량 푸터를 제어합니다. `/usage cost`는 OpenClaw 세션 로그에서 로컬 비용 요약을 출력합니다.
- `/restart`는 기본적으로 활성화됩니다. 비활성화하려면 `commands.restart: false`를 설정하십시오.
- `/plugins install <spec>`은 `openclaw plugins install`과 동일한 플러그인 사양을 허용합니다: 로컬 경로/아카이브, npm 패키지, 또는 `clawhub:<pkg>`.
- `/plugins enable|disable`은 플러그인 설정을 업데이트하고 재시작을 프롬프트할 수 있습니다.
- Discord 전용 네이티브 명령: `/vc join|leave|status`는 음성 채널을 제어합니다 (`channels.discord.voice` 및 네이티브 명령 필요; 텍스트로 사용 불가).
- Discord 스레드 바인딩 명령 (`/focus`, `/unfocus`, `/agents`, `/session idle`, `/session max-age`)은 유효한 스레드 바인딩이 활성화되어야 합니다 (`session.threadBindings.enabled` 및/또는 `channels.discord.threadBindings.enabled`).
- ACP 명령 레퍼런스 및 런타임 동작: [ACP 에이전트](/tools/acp-agents).
- `/verbose`는 디버깅 및 추가 가시성을 위한 것입니다. 일반 사용에서는 **꺼진** 상태를 유지하십시오.
- `/fast on|off`는 세션 재정의를 지속합니다. 세션 UI `inherit` 옵션을 사용하여 지우고 설정 기본값으로 폴백하십시오.
- `/fast`는 프로바이더별입니다: OpenAI/OpenAI Codex는 네이티브 Responses 엔드포인트에서 `service_tier=priority`로 매핑하고, `api.anthropic.com`으로 전송되는 OAuth 인증 트래픽을 포함한 직접 공개 Anthropic 요청은 `service_tier=auto` 또는 `standard_only`로 매핑합니다. [OpenAI](/providers/openai) 및 [Anthropic](/providers/anthropic)을 참조하십시오.
- 도구 실패 요약은 관련이 있을 때 여전히 표시되지만 자세한 실패 텍스트는 `/verbose`가 `on` 또는 `full`인 경우에만 포함됩니다.
- `/reasoning` (및 `/verbose`)은 그룹 설정에서 위험합니다: 의도하지 않게 노출하려 하지 않은 내부 추론이나 도구 출력을 드러낼 수 있습니다. 특히 그룹 채팅에서는 꺼진 상태를 유지하십시오.
- `/model`은 새 세션 모델을 즉시 지속합니다.
- 에이전트가 유휴 상태인 경우 다음 실행에서 즉시 사용됩니다.
- 실행이 이미 활성화된 경우 OpenClaw는 라이브 전환을 보류 중으로 표시하고 깨끗한 재시도 지점에서만 새 모델로 재시작합니다.
- 도구 활동 또는 응답 출력이 이미 시작된 경우 보류 중인 전환은 나중 재시도 기회나 다음 사용자 턴까지 대기열에 있을 수 있습니다.
- **빠른 경로:** 허용 목록 발신자의 명령 전용 메시지는 즉시 처리됩니다 (큐 + 모델 우회).
- **그룹 멘션 게이팅:** 허용 목록 발신자의 명령 전용 메시지는 멘션 요구 사항을 우회합니다.
- **인라인 단축키 (허용 목록 발신자 전용):** 특정 명령은 일반 메시지에 포함되어 있을 때도 작동하고 나머지 텍스트가 정상 흐름으로 계속되기 전에 제거됩니다.
  - 예시: `hey /status`는 상태 응답을 트리거하고 나머지 텍스트는 정상 흐름으로 계속됩니다.
- 현재: `/help`, `/commands`, `/status`, `/whoami` (`/id`).
- 승인되지 않은 명령 전용 메시지는 자동으로 무시되고 인라인 `/...` 토큰은 일반 텍스트로 처리됩니다.
- **스킬 명령:** `user-invocable` 스킬은 슬래시 명령으로 노출됩니다. 이름은 `a-z0-9_`로 정제됩니다 (최대 32자). 충돌은 숫자 접미사를 받습니다 (예: `_2`).
  - `/skill <name> [input]`은 이름으로 스킬을 실행합니다 (네이티브 명령 제한으로 스킬별 명령이 불가능할 때 유용).
  - 기본적으로 스킬 명령은 일반 요청으로 모델에 전달됩니다.
  - 스킬은 선택적으로 `command-dispatch: tool`을 선언하여 명령을 도구에 직접 라우팅할 수 있습니다 (결정론적, 모델 없음).
  - 예시: `/prose` (OpenProse 플러그인) — [OpenProse](/prose) 참조.
- **네이티브 명령 인수:** Discord는 동적 옵션에 자동 완성을 사용합니다 (필수 인수를 생략하면 버튼 메뉴). Telegram과 Slack은 명령이 선택지를 지원하고 인수를 생략하면 버튼 메뉴를 표시합니다.

## `/tools`

`/tools`는 설정 질문이 아닌 런타임 질문에 답합니다: **이 대화에서 지금 이 에이전트가 사용할 수 있는 것**.

- 기본 `/tools`는 컴팩트하고 빠른 스캔에 최적화됩니다.
- `/tools verbose`는 짧은 설명을 추가합니다.
- 인수를 지원하는 네이티브 명령 표면은 동일한 모드 전환 `compact|verbose`를 노출합니다.
- 결과는 세션 범위이므로 에이전트, 채널, 스레드, 발신자 승인, 또는 모델 변경은 출력을 변경할 수 있습니다.
- `/tools`는 코어 도구, 연결된 플러그인 도구, 채널 소유 도구를 포함하여 런타임에 실제로 도달 가능한 도구를 포함합니다.

프로파일 및 재정의 편집의 경우 `/tools`를 정적 카탈로그로 처리하는 대신 컨트롤 UI 도구 패널이나 설정/카탈로그 표면을 사용하십시오.

## 사용량 표면 (어디에 무엇이 표시되는지)

- **프로바이더 사용량/할당량** (예: "Claude 80% left")은 사용량 추적이 활성화된 경우 현재 모델 프로바이더에 대한 `/status`에 표시됩니다. OpenClaw는 프로바이더 창을 `% left`로 정규화합니다. MiniMax의 경우 남은 전용 퍼센트 필드는 표시 전에 반전되고 `model_remains` 응답은 모델 태그 계획 레이블과 함께 채팅 모델 항목을 선호합니다.
- `/status`의 **토큰/캐시 라인**은 라이브 세션 스냅샷이 스파스한 경우 최신 트랜스크립트 사용 항목으로 폴백할 수 있습니다. 기존의 0이 아닌 라이브 값이 여전히 우선하고 트랜스크립트 폴백은 저장된 합계가 누락되거나 더 작은 경우 활성 런타임 모델 레이블과 더 큰 프롬프트 지향 합계도 복구할 수 있습니다.
- **응답별 토큰/비용**은 `/usage off|tokens|full`로 제어됩니다 (일반 응답에 추가됨).
- `/model status`는 사용량이 아닌 **모델/인증/엔드포인트**에 관한 것입니다.

## 모델 선택 (`/model`)

`/model`은 지시자로 구현됩니다.

예시:

```
/model
/model list
/model 3
/model openai/gpt-5.4
/model opus@anthropic:default
/model status
```

참고 사항:

- `/model` 및 `/model list`는 컴팩트한 번호 선택기를 표시합니다 (모델 패밀리 + 사용 가능한 프로바이더).
- Discord에서 `/model` 및 `/models`는 프로바이더 및 모델 드롭다운과 제출 단계가 있는 인터랙티브 선택기를 엽니다.
- `/model <#>`은 해당 선택기에서 선택합니다 (가능한 경우 현재 프로바이더를 선호).
- `/model status`는 사용 가능한 경우 구성된 프로바이더 엔드포인트 (`baseUrl`) 및 API 모드 (`api`)를 포함한 자세한 뷰를 표시합니다.

## 디버그 재정의

`/debug`를 사용하면 **런타임 전용** 설정 재정의를 설정할 수 있습니다 (메모리, 디스크 아님). 소유자 전용. 기본적으로 비활성화됨. `commands.debug: true`로 활성화하십시오.

예시:

```
/debug show
/debug set messages.responsePrefix="[openclaw]"
/debug set channels.whatsapp.allowFrom=["+1555","+4477"]
/debug unset messages.responsePrefix
/debug reset
```

참고 사항:

- 재정의는 새 설정 읽기에 즉시 적용되지만 `openclaw.json`에 **쓰지 않습니다**.
- `/debug reset`을 사용하여 모든 재정의를 지우고 디스크 설정으로 돌아가십시오.

## 설정 업데이트

`/config`는 디스크 설정 (`openclaw.json`)에 씁니다. 소유자 전용. 기본적으로 비활성화됨. `commands.config: true`로 활성화하십시오.

예시:

```
/config show
/config show messages.responsePrefix
/config get messages.responsePrefix
/config set messages.responsePrefix="[openclaw]"
/config unset messages.responsePrefix
```

참고 사항:

- 설정은 쓰기 전에 검증됩니다. 유효하지 않은 변경 사항은 거부됩니다.
- `/config` 업데이트는 재시작 후에도 지속됩니다.

## MCP 업데이트

`/mcp`는 `mcp.servers` 아래에 OpenClaw 관리 MCP 서버 정의를 씁니다. 소유자 전용. 기본적으로 비활성화됨. `commands.mcp: true`로 활성화하십시오.

예시:

```text
/mcp show
/mcp show context7
/mcp set context7={"command":"uvx","args":["context7-mcp"]}
/mcp unset context7
```

참고 사항:

- `/mcp`는 Pi 소유 프로젝트 설정이 아닌 OpenClaw 설정에 설정을 저장합니다.
- 런타임 어댑터는 실제로 실행 가능한 전송을 결정합니다.

## 플러그인 업데이트

`/plugins`를 사용하면 운영자가 검색된 플러그인을 검사하고 설정에서 활성화를 토글할 수 있습니다. 읽기 전용 흐름은 `/plugin`을 별칭으로 사용할 수 있습니다. 기본적으로 비활성화됨. `commands.plugins: true`로 활성화하십시오.

예시:

```text
/plugins
/plugins list
/plugin show context7
/plugins enable context7
/plugins disable context7
```

참고 사항:

- `/plugins list` 및 `/plugins show`는 현재 워크스페이스와 디스크 설정에 대해 실제 플러그인 검색을 사용합니다.
- `/plugins enable|disable`은 플러그인 설정만 업데이트합니다. 플러그인을 설치하거나 제거하지 않습니다.
- 활성화/비활성화 변경 후 게이트웨이를 재시작하여 적용하십시오.

## 표면 참고 사항

- **텍스트 명령**은 일반 채팅 세션에서 실행됩니다 (DM은 `main`을 공유하고 그룹은 자체 세션을 가집니다).
- **네이티브 명령**은 격리된 세션을 사용합니다:
  - Discord: `agent:<agentId>:discord:slash:<userId>`
  - Slack: `agent:<agentId>:slack:slash:<userId>` (접두사는 `channels.slack.slashCommand.sessionPrefix`를 통해 설정 가능)
  - Telegram: `telegram:slash:<userId>` (`CommandTargetSessionKey`를 통해 채팅 세션을 대상으로 함)
- **`/stop`**은 현재 실행을 중단할 수 있도록 활성 채팅 세션을 대상으로 합니다.
- **Slack:** `channels.slack.slashCommand`는 단일 `/openclaw` 스타일 명령에 대해 여전히 지원됩니다. `commands.native`를 활성화하는 경우 내장 명령별로 하나의 Slack 슬래시 명령을 만들어야 합니다 (`/help`와 동일한 이름). Slack에 대한 명령 인수 메뉴는 임시 Block Kit 버튼으로 전달됩니다.
  - Slack 네이티브 예외: Slack이 `/status`를 예약하므로 `/status` 대신 `/agentstatus`를 등록하십시오. 텍스트 `/status`는 Slack 메시지에서 여전히 작동합니다.

## BTW 부가 질문

`/btw`는 현재 세션에 대한 빠른 **부가 질문**입니다.

일반 채팅과 달리:

- 현재 세션을 배경 컨텍스트로 사용합니다,
- 별도의 **도구 없는** 일회성 호출로 실행됩니다,
- 미래 세션 컨텍스트를 변경하지 않습니다,
- 트랜스크립트 기록에 기록되지 않습니다,
- 일반 어시스턴트 메시지 대신 라이브 부가 결과로 전달됩니다.

이를 통해 `/btw`는 주요 작업이 계속되는 동안 임시 설명이 필요할 때 유용합니다.

예시:

```text
/btw what are we doing right now?
```

전체 동작 및 클라이언트 UX 세부 정보는 [BTW 부가 질문](/tools/btw)을 참조하십시오.
