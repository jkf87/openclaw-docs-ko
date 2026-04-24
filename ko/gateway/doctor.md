---
summary: "Doctor 명령: 헬스 체크, 구성 마이그레이션, 복구 단계"
read_when:
  - doctor 마이그레이션을 추가하거나 수정할 때
  - 호환성을 깨는 구성 변경을 도입할 때
title: "Doctor"
---

`openclaw doctor`는 OpenClaw의 복구 + 마이그레이션 툴입니다. 오래된
config/state를 수정하고, 상태(health)를 확인하며, 실행 가능한 복구 단계를 제공합니다.

## 빠른 시작

```bash
openclaw doctor
```

### 헤드리스 / 자동화

```bash
openclaw doctor --yes
```

프롬프트 없이 기본값을 수락합니다(해당되는 경우 restart/service/sandbox 복구 단계 포함).

```bash
openclaw doctor --repair
```

프롬프트 없이 권장 복구(repair)를 적용합니다(안전한 경우 repair + restart).

```bash
openclaw doctor --repair --force
```

공격적인 복구도 적용합니다(사용자 정의 supervisor 구성을 덮어씁니다).

```bash
openclaw doctor --non-interactive
```

프롬프트 없이 실행하며 안전한 마이그레이션(구성 정규화 + 디스크 상태 이동)만 적용합니다. 사람의 확인이 필요한 restart/service/sandbox 작업은 건너뜁니다.
레거시 state 마이그레이션은 감지되면 자동으로 실행됩니다.

```bash
openclaw doctor --deep
```

추가 gateway 설치(launchd/systemd/schtasks)에 대해 시스템 서비스를 스캔합니다.

작성 전에 변경 사항을 검토하려면 먼저 config 파일을 열어보십시오:

```bash
cat ~/.openclaw/openclaw.json
```

## 수행하는 작업 (요약)

- git 설치에 대한 선택적 사전 업데이트(대화형에서만).
- UI 프로토콜 최신 상태 확인(프로토콜 스키마가 더 최신일 때 Control UI 재빌드).
- 헬스 체크 + 재시작 프롬프트.
- Skills 상태 요약(eligible/missing/blocked) 및 플러그인 상태.
- 레거시 값에 대한 구성 정규화.
- 레거시 flat `talk.*` 필드에서 `talk.provider` + `talk.providers.<provider>`로의 Talk 구성 마이그레이션.
- 레거시 Chrome 확장 구성 및 Chrome MCP 준비 상태에 대한 브라우저 마이그레이션 확인.
- OpenCode 프로바이더 재정의 경고(`models.providers.opencode` / `models.providers.opencode-go`).
- Codex OAuth 섀도잉 경고(`models.providers.openai-codex`).
- OpenAI Codex OAuth 프로파일에 대한 OAuth TLS 사전 요구 사항 확인.
- 레거시 디스크 state 마이그레이션(sessions/agent dir/WhatsApp auth).
- 레거시 플러그인 매니페스트 계약 키 마이그레이션(`speechProviders`, `realtimeTranscriptionProviders`, `realtimeVoiceProviders`, `mediaUnderstandingProviders`, `imageGenerationProviders`, `videoGenerationProviders`, `webFetchProviders`, `webSearchProviders` → `contracts`).
- 레거시 cron 저장소 마이그레이션(`jobId`, `schedule.cron`, 최상위 delivery/payload 필드, payload `provider`, 간단한 `notify: true` webhook 폴백 작업).
- 세션 lock 파일 검사 및 오래된 lock 정리.
- state 무결성 및 권한 확인(sessions, transcripts, state 디렉토리).
- 로컬 실행 시 구성 파일 권한 확인(chmod 600).
- 모델 인증 상태(health): OAuth 만료 확인, 만료 예정 토큰 새로 고침 가능, auth-profile 쿨다운/비활성화 상태 보고.
- 추가 workspace 디렉토리 감지(`~/openclaw`).
- 샌드박싱이 활성화된 경우 sandbox 이미지 복구.
- 레거시 서비스 마이그레이션 및 추가 gateway 감지.
- Matrix 채널 레거시 state 마이그레이션(`--fix` / `--repair` 모드에서).
- Gateway 런타임 확인(서비스가 설치되었지만 실행되지 않음; 캐시된 launchd 레이블).
- 채널 상태 경고(실행 중인 gateway에서 프로빙).
- Supervisor 구성 감사(audit)(launchd/systemd/schtasks)와 선택적 복구.
- Gateway 런타임 모범 사례 확인(Node vs Bun, 버전 관리자 경로).
- Gateway 포트 충돌 진단(기본값 `18789`).
- 공개 DM 정책에 대한 보안 경고.
- 로컬 token 모드에 대한 Gateway 인증 확인(token 소스가 없는 경우 token 생성 제공; token SecretRef 구성은 덮어쓰지 않음).
- 장치 페어링 문제 감지(대기 중인 최초 페어링 요청, 대기 중인 role/scope 업그레이드, 오래된 로컬 device-token 캐시 드리프트, 페어링된 레코드 인증 드리프트).
- Linux에서 systemd linger 확인.
- Workspace 부트스트랩 파일 크기 확인(context 파일에 대한 잘림/한계 근접 경고).
- Shell 자동 완성 상태 확인 및 자동 설치/업그레이드.
- Memory 검색 임베딩 프로바이더 준비 상태 확인(로컬 모델, 원격 API 키, 또는 QMD 바이너리).
- 소스 설치 확인(pnpm workspace 불일치, 누락된 UI 에셋, 누락된 tsx 바이너리).
- 업데이트된 구성 + wizard 메타데이터 작성.

## Dreams UI 백필 및 재설정

Control UI Dreams 장면에는 grounded dreaming 워크플로에 대한 **Backfill**, **Reset**, **Clear Grounded**
작업이 포함되어 있습니다. 이러한 작업은 gateway
doctor 스타일 RPC 메서드를 사용하지만, `openclaw doctor` CLI
복구/마이그레이션의 일부는 **아닙니다**.

수행하는 작업:

- **Backfill**은 활성 workspace의 과거 `memory/YYYY-MM-DD.md` 파일을 스캔하고,
  grounded REM diary 패스를 실행하며, 되돌릴 수 있는 백필 항목을
  `DREAMS.md`에 작성합니다.
- **Reset**은 `DREAMS.md`에서 마킹된 백필 diary 항목만 제거합니다.
- **Clear Grounded**는 과거 재생에서 발생했으며 아직 라이브 recall 또는 일일
  지원을 누적하지 않은 스테이징된 grounded 전용 단기 항목만 제거합니다.

이 작업이 스스로 수행하지 **않는** 것:

- `MEMORY.md`를 편집하지 않습니다
- 전체 doctor 마이그레이션을 실행하지 않습니다
- 먼저 스테이지된 CLI 경로를 명시적으로 실행하지 않는 한, grounded 후보를
  라이브 단기 승격 저장소에 자동으로 스테이징하지 않습니다

grounded 과거 재생이 일반 deep promotion lane에 영향을 주기를 원한다면,
대신 CLI flow를 사용하십시오:

```bash
openclaw memory rem-backfill --path ./memory --stage-short-term
```

이것은 `DREAMS.md`를 review surface로 유지하면서 grounded durable 후보를
단기 dreaming 저장소에 스테이징합니다.

## 상세 동작 및 근거

### 0) 선택적 업데이트 (git 설치)

이것이 git 체크아웃이고 doctor가 대화형으로 실행 중인 경우, doctor 실행 전에
업데이트(fetch/rebase/build)를 제안합니다.

### 1) 구성 정규화

구성에 레거시 값 shape(예: 채널별 재정의가 없는 `messages.ackReaction`)이
포함된 경우, doctor는 이를 현재 스키마로 정규화합니다.

여기에는 레거시 Talk flat 필드가 포함됩니다. 현재 공개 Talk 구성은
`talk.provider` + `talk.providers.<provider>`입니다. Doctor는 구 `talk.voiceId` /
`talk.voiceAliases` / `talk.modelId` / `talk.outputFormat` / `talk.apiKey`
shape를 프로바이더 맵으로 재작성합니다.

### 2) 레거시 구성 키 마이그레이션

구성에 더 이상 사용되지 않는 키가 포함된 경우, 다른 명령은 실행을 거부하고
`openclaw doctor`를 실행하도록 요청합니다.

Doctor는:

- 발견된 레거시 키가 무엇인지 설명합니다.
- 적용한 마이그레이션을 보여줍니다.
- 업데이트된 스키마로 `~/.openclaw/openclaw.json`을 재작성합니다.

Gateway는 또한 레거시 구성 형식을 감지하면 시작 시 doctor 마이그레이션을 자동으로 실행하므로,
오래된 구성은 수동 개입 없이 복구됩니다.
Cron 작업 저장소 마이그레이션은 `openclaw doctor --fix`가 처리합니다.

현재 마이그레이션:

- `routing.allowFrom` → `channels.whatsapp.allowFrom`
- `routing.groupChat.requireMention` → `channels.whatsapp/telegram/imessage.groups."*".requireMention`
- `routing.groupChat.historyLimit` → `messages.groupChat.historyLimit`
- `routing.groupChat.mentionPatterns` → `messages.groupChat.mentionPatterns`
- `routing.queue` → `messages.queue`
- `routing.bindings` → 최상위 `bindings`
- `routing.agents`/`routing.defaultAgentId` → `agents.list` + `agents.list[].default`
- 레거시 `talk.voiceId`/`talk.voiceAliases`/`talk.modelId`/`talk.outputFormat`/`talk.apiKey` → `talk.provider` + `talk.providers.<provider>`
- `routing.agentToAgent` → `tools.agentToAgent`
- `routing.transcribeAudio` → `tools.media.audio.models`
- `messages.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `messages.tts.providers.<provider>`
- `channels.discord.voice.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `channels.discord.voice.tts.providers.<provider>`
- `channels.discord.accounts.<id>.voice.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `channels.discord.accounts.<id>.voice.tts.providers.<provider>`
- `plugins.entries.voice-call.config.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `plugins.entries.voice-call.config.tts.providers.<provider>`
- `plugins.entries.voice-call.config.provider: "log"` → `"mock"`
- `plugins.entries.voice-call.config.twilio.from` → `plugins.entries.voice-call.config.fromNumber`
- `plugins.entries.voice-call.config.streaming.sttProvider` → `plugins.entries.voice-call.config.streaming.provider`
- `plugins.entries.voice-call.config.streaming.openaiApiKey|sttModel|silenceDurationMs|vadThreshold`
  → `plugins.entries.voice-call.config.streaming.providers.openai.*`
- `bindings[].match.accountID` → `bindings[].match.accountId`
- 명명된 `accounts`가 있지만 남아 있는 단일 계정 최상위 채널 값이 있는 채널의 경우, 해당 계정 범위 값을 해당 채널에 대해 선택된 승격된 계정으로 이동합니다(대부분의 채널에는 `accounts.default`; Matrix는 기존의 일치하는 명명된/기본 타겟을 보존할 수 있음)
- `identity` → `agents.list[].identity`
- `agent.*` → `agents.defaults` + `tools.*` (tools/elevated/exec/sandbox/subagents)
- `agent.model`/`allowedModels`/`modelAliases`/`modelFallbacks`/`imageModelFallbacks`
  → `agents.defaults.models` + `agents.defaults.model.primary/fallbacks` + `agents.defaults.imageModel.primary/fallbacks`
- `browser.ssrfPolicy.allowPrivateNetwork` → `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork`
- `browser.profiles.*.driver: "extension"` → `"existing-session"`
- `browser.relayBindHost` 제거(레거시 확장 중계 설정)

Doctor 경고에는 다중 계정 채널에 대한 계정 기본값 가이드도 포함됩니다:

- 둘 이상의 `channels.<channel>.accounts` 항목이 `channels.<channel>.defaultAccount` 또는 `accounts.default` 없이 구성된 경우, doctor는 폴백 라우팅이 예기치 않은 계정을 선택할 수 있다고 경고합니다.
- `channels.<channel>.defaultAccount`가 알 수 없는 계정 ID로 설정된 경우, doctor는 경고하고 구성된 계정 ID를 나열합니다.

### 2b) OpenCode 프로바이더 재정의

`models.providers.opencode`, `opencode-zen`, 또는 `opencode-go`를
수동으로 추가한 경우, `@mariozechner/pi-ai`의 내장 OpenCode 카탈로그를 재정의합니다.
이는 모델을 잘못된 API로 강제하거나 비용을 0으로 만들 수 있습니다. Doctor는 경고하므로
재정의를 제거하고 모델별 API 라우팅 + 비용을 복원할 수 있습니다.

### 2c) 브라우저 마이그레이션 및 Chrome MCP 준비 상태

브라우저 구성이 여전히 제거된 Chrome 확장 경로를 가리키는 경우, doctor는
이를 현재의 host-local Chrome MCP attach 모델로 정규화합니다:

- `browser.profiles.*.driver: "extension"`은 `"existing-session"`이 됩니다
- `browser.relayBindHost`가 제거됩니다

Doctor는 또한 `defaultProfile: "user"` 또는 구성된 `existing-session`
프로파일을 사용할 때 host-local Chrome MCP 경로를 감사합니다:

- 기본 자동 연결 프로파일에 대해 Google Chrome이 동일한 호스트에 설치되어 있는지
  확인합니다
- 감지된 Chrome 버전을 확인하고 Chrome 144 미만인 경우 경고합니다
- 브라우저 검사 페이지에서 원격 디버깅을 활성화하도록 상기시킵니다(예를 들어
  `chrome://inspect/#remote-debugging`, `brave://inspect/#remote-debugging`,
  또는 `edge://inspect/#remote-debugging`)

Doctor는 Chrome 측 설정을 활성화할 수 없습니다. Host-local Chrome MCP는
여전히 다음을 필요로 합니다:

- gateway/node 호스트에 Chromium 기반 브라우저 144+
- 브라우저가 로컬에서 실행 중
- 해당 브라우저에서 원격 디버깅 활성화
- 브라우저에서 최초 attach 동의 프롬프트 승인

여기에서의 준비 상태는 로컬 attach 사전 요구 사항에만 관한 것입니다. Existing-session은
현재 Chrome MCP 경로 제한을 유지합니다; `responsebody`, PDF
내보내기, 다운로드 인터셉션, batch 액션과 같은 고급 경로는 여전히 관리되는
브라우저 또는 raw CDP 프로파일이 필요합니다.

이 확인은 Docker, sandbox, remote-browser, 또는 기타
헤드리스 플로우에는 적용되지 **않습니다**. 이들은 계속 raw CDP를 사용합니다.

### 2d) OAuth TLS 사전 요구 사항

OpenAI Codex OAuth 프로파일이 구성된 경우, doctor는 로컬 Node/OpenSSL TLS 스택이
인증서 체인을 검증할 수 있는지 확인하기 위해 OpenAI 권한 부여 엔드포인트를
프로빙합니다. 프로브가 인증서 오류(예를 들어
`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, 만료된 cert, 또는 자체 서명된 cert)로 실패하는 경우,
doctor는 플랫폼별 수정 가이드를 출력합니다. Homebrew Node가 있는 macOS에서,
수정은 일반적으로 `brew postinstall ca-certificates`입니다. `--deep`에서는, gateway가 정상인
경우에도 프로브가 실행됩니다.

### 2c) Codex OAuth 프로바이더 재정의

이전에 `models.providers.openai-codex` 아래에 레거시 OpenAI 전송 설정을
추가한 경우, 새 릴리스가 자동으로 사용하는 내장 Codex OAuth
프로바이더 경로를 섀도잉할 수 있습니다. Doctor는 Codex OAuth와 함께 해당 구 전송 설정을
볼 때 경고하므로, 오래된 전송 재정의를 제거하거나 재작성하고 내장
라우팅/폴백 동작을 되찾을 수 있습니다. 사용자 정의 프록시 및 헤더 전용 재정의는 여전히
지원되며 이 경고를 트리거하지 않습니다.

### 3) 레거시 state 마이그레이션 (디스크 레이아웃)

Doctor는 이전 디스크 레이아웃을 현재 구조로 마이그레이션할 수 있습니다:

- Sessions 저장소 + transcripts:
  - `~/.openclaw/sessions/`에서 `~/.openclaw/agents/<agentId>/sessions/`로
- Agent dir:
  - `~/.openclaw/agent/`에서 `~/.openclaw/agents/<agentId>/agent/`로
- WhatsApp auth state (Baileys):
  - 레거시 `~/.openclaw/credentials/*.json`(`oauth.json` 제외)에서
  - `~/.openclaw/credentials/whatsapp/<accountId>/...`로(기본 계정 id: `default`)

이러한 마이그레이션은 best-effort이며 멱등적(idempotent)입니다; doctor는 백업으로
레거시 폴더를 남겨 둘 때 경고를 발생시킵니다. Gateway/CLI는 또한 시작 시
레거시 sessions + agent dir을 자동으로 마이그레이션하여 history/auth/models가
수동 doctor 실행 없이 agent별 경로에 도착하도록 합니다. WhatsApp auth는 의도적으로
`openclaw doctor`를 통해서만 마이그레이션됩니다. Talk provider/provider-map 정규화는 이제
구조적 동등성으로 비교하므로, 키 순서만 다른 diff는 더 이상
반복되는 no-op `doctor --fix` 변경을 트리거하지 않습니다.

### 3a) 레거시 플러그인 매니페스트 마이그레이션

Doctor는 설치된 모든 플러그인 매니페스트에서 더 이상 사용되지 않는 최상위 기능
키(`speechProviders`, `realtimeTranscriptionProviders`,
`realtimeVoiceProviders`, `mediaUnderstandingProviders`,
`imageGenerationProviders`, `videoGenerationProviders`, `webFetchProviders`,
`webSearchProviders`)를 스캔합니다. 발견되면, 이를 `contracts` 객체로 이동하고
매니페스트 파일을 제자리에서 재작성할 것을 제공합니다. 이 마이그레이션은 멱등적입니다;
`contracts` 키에 이미 동일한 값이 있으면, 레거시 키는 데이터를 중복하지 않고
제거됩니다.

### 3b) 레거시 cron 저장소 마이그레이션

Doctor는 또한 scheduler가 호환성을 위해 여전히 수용하는
오래된 작업 shape에 대해 cron 작업 저장소(`~/.openclaw/cron/jobs.json` 기본값, 또는
재정의된 경우 `cron.store`)를 확인합니다.

현재 cron 정리 작업은 다음을 포함합니다:

- `jobId` → `id`
- `schedule.cron` → `schedule.expr`
- 최상위 payload 필드(`message`, `model`, `thinking`, ...) → `payload`
- 최상위 delivery 필드(`deliver`, `channel`, `to`, `provider`, ...) → `delivery`
- payload `provider` delivery 별칭 → 명시적 `delivery.channel`
- 간단한 레거시 `notify: true` webhook 폴백 작업 → `delivery.to=cron.webhook`이 있는 명시적 `delivery.mode="webhook"`

Doctor는 동작을 변경하지 않고 할 수 있을 때만 `notify: true` 작업을
자동 마이그레이션합니다. 작업이 레거시 notify 폴백을 기존
비-webhook delivery 모드와 결합하는 경우, doctor는 경고하고 해당 작업을 수동 검토를 위해
남겨 둡니다.

### 3c) 세션 lock 정리

Doctor는 모든 agent 세션 디렉토리에서 오래된 write-lock 파일—세션이 비정상적으로
종료되었을 때 남겨진 파일—을 스캔합니다. 발견된 각 lock 파일에 대해 보고합니다:
경로, PID, PID가 여전히 활성 상태인지 여부, lock 나이, stale로
간주되는지(죽은 PID 또는 30분보다 오래됨) 여부. `--fix` / `--repair`
모드에서는 오래된 lock 파일을 자동으로 제거합니다; 그렇지 않으면 참고 사항을 출력하고
`--fix`로 다시 실행하도록 지시합니다.

### 4) State 무결성 검사 (세션 지속성, 라우팅, 안전성)

State 디렉토리는 운영 뇌간입니다. 사라지면 세션, 자격 증명, 로그,
구성을 잃게 됩니다(다른 곳에 백업이 없는 한).

Doctor는 다음을 확인합니다:

- **State dir missing**: 치명적인 state 손실에 대해 경고하고, 디렉토리를 다시 만들도록
  프롬프트하며, 누락된 데이터를 복구할 수 없다고 상기시킵니다.
- **State dir permissions**: 쓰기 가능성을 검증합니다; 권한 복구를 제공합니다
  (그리고 owner/group 불일치가 감지되면 `chown` 힌트를 발생시킵니다).
- **macOS cloud-synced state dir**: state가 iCloud Drive
  (`~/Library/Mobile Documents/com~apple~CloudDocs/...`) 또는
  `~/Library/CloudStorage/...` 아래로 해석될 때 경고합니다. 동기화 지원 경로는
  느린 I/O와 lock/sync race를 야기할 수 있기 때문입니다.
- **Linux SD or eMMC state dir**: state가 `mmcblk*` 마운트 소스로 해석될 때 경고합니다.
  SD 또는 eMMC 지원 랜덤 I/O는 세션 및 자격 증명 쓰기에서 더 느리고 더 빠르게
  마모될 수 있기 때문입니다.
- **Session dirs missing**: `sessions/` 및 세션 저장소 디렉토리는
  history를 유지하고 `ENOENT` 충돌을 피하기 위해 필수입니다.
- **Transcript mismatch**: 최근 세션 항목에 누락된
  transcript 파일이 있을 때 경고합니다.
- **Main session "1-line JSONL"**: 메인 transcript에 단 한 줄만 있을 때
  플래그를 지정합니다(history가 누적되지 않음).
- **Multiple state dirs**: 홈 디렉토리 전체에 여러 `~/.openclaw` 폴더가 존재하거나
  `OPENCLAW_STATE_DIR`이 다른 곳을 가리킬 때 경고합니다(history가 설치 간에
  분할될 수 있음).
- **Remote mode reminder**: `gateway.mode=remote`인 경우, doctor는 원격 호스트에서
  실행하라고 상기시킵니다(state는 거기에 있습니다).
- **Config file permissions**: `~/.openclaw/openclaw.json`이
  group/world 읽기 가능하면 경고하고 `600`으로 강화할 것을 제공합니다.

### 5) 모델 인증 상태 (OAuth 만료)

Doctor는 auth 저장소의 OAuth 프로파일을 검사하고, 토큰이
만료 예정/만료되었을 때 경고하며, 안전할 때 새로 고칠 수 있습니다. Anthropic
OAuth/token 프로파일이 오래되었으면, Anthropic API 키 또는
Anthropic setup-token 경로를 제안합니다.
Refresh 프롬프트는 대화형(TTY)으로 실행할 때만 나타납니다; `--non-interactive`는
refresh 시도를 건너뜁니다.

OAuth refresh가 영구적으로 실패할 때(예를 들어 `refresh_token_reused`,
`invalid_grant`, 또는 프로바이더가 다시 로그인하라고 알려줄 때), doctor는
re-auth가 필요하다고 보고하고 실행할 정확한 `openclaw models auth login --provider ...`
명령을 출력합니다.

Doctor는 또한 다음으로 인해 일시적으로 사용할 수 없는 auth 프로파일을 보고합니다:

- 짧은 쿨다운(rate limits/timeouts/auth failures)
- 더 긴 비활성화(billing/credit failures)

### 6) Hooks 모델 유효성 검사

`hooks.gmail.model`이 설정된 경우, doctor는 카탈로그 및 allowlist에 대해 모델 참조를
검증하고 해석되지 않거나 허용되지 않을 때 경고합니다.

### 7) Sandbox 이미지 복구

샌드박싱이 활성화된 경우, doctor는 Docker 이미지를 확인하고 현재 이미지가 누락된 경우
빌드하거나 레거시 이름으로 전환할 것을 제공합니다.

### 7b) 번들된 플러그인 런타임 의존성

Doctor는 현재 구성에서 활성화되어 있거나 번들된 매니페스트 기본값에 의해 활성화된
번들 플러그인에 대해서만 런타임 의존성을 검증합니다. 예를 들어
`plugins.entries.discord.enabled: true`, 레거시
`channels.discord.enabled: true`, 또는 기본 활성화된 번들 프로바이더. 누락된 경우,
doctor는 패키지를 보고하고 `openclaw doctor --fix` / `openclaw doctor --repair` 모드에서
설치합니다. 외부 플러그인은 여전히
`openclaw plugins install` / `openclaw plugins update`를 사용합니다; doctor는 임의의 플러그인 경로에 대한
의존성을 설치하지 않습니다.

### 8) Gateway 서비스 마이그레이션 및 정리 힌트

Doctor는 레거시 gateway 서비스(launchd/systemd/schtasks)를 감지하고
이를 제거하고 현재 gateway 포트를 사용하여 OpenClaw 서비스를 설치할 것을
제공합니다. 또한 추가 gateway와 같은 서비스를 스캔하고 정리 힌트를 출력할 수 있습니다.
프로파일 이름이 지정된 OpenClaw gateway 서비스는 first-class로 간주되며
"추가"로 플래그 지정되지 않습니다.

### 8b) 시작 Matrix 마이그레이션

Matrix 채널 계정에 보류 중이거나 실행 가능한 레거시 state 마이그레이션이 있을 때,
doctor(`--fix` / `--repair` 모드에서)는 사전 마이그레이션 스냅샷을 만든 다음
best-effort 마이그레이션 단계를 실행합니다: 레거시 Matrix state 마이그레이션 및 레거시
encrypted-state 준비. 두 단계 모두 비치명적입니다; 오류는 로그되고
시작은 계속됩니다. 읽기 전용 모드(`--fix` 없는 `openclaw doctor`)에서는 이 확인이
완전히 건너뜁니다.

### 8c) 장치 페어링 및 인증 드리프트

Doctor는 이제 일반 헬스 패스의 일부로 장치 페어링 state를 검사합니다.

보고 내용:

- 대기 중인 최초 페어링 요청
- 이미 페어링된 장치에 대한 대기 중인 role 업그레이드
- 이미 페어링된 장치에 대한 대기 중인 scope 업그레이드
- 장치 id는 여전히 일치하지만 장치
  identity가 승인된 레코드와 더 이상 일치하지 않는 공개 키 불일치 복구
- 승인된 role에 대한 활성 token이 없는 페어링된 레코드
- 승인된 페어링 기준을 벗어나 드리프트하는 페어링된 token 범위
- gateway 측 token 회전 이전이거나 오래된 scope 메타데이터를 가진
  현재 머신에 대한 로컬 캐시된 장치 토큰 항목

Doctor는 페어링 요청을 자동 승인하거나 장치 토큰을 자동 회전하지 않습니다.
대신 정확한 다음 단계를 출력합니다:

- `openclaw devices list`로 대기 중인 요청을 검사
- `openclaw devices approve <requestId>`로 정확한 요청 승인
- `openclaw devices rotate --device <deviceId> --role <role>`로 새 token 회전
- `openclaw devices remove <deviceId>`로 오래된 레코드 제거 및 재승인

이것은 일반적인 "이미 페어링되었지만 여전히 페어링이 필요함"
구멍을 닫습니다: doctor는 이제 최초 페어링을 대기 중인 role/scope 업그레이드
및 오래된 토큰/장치 identity 드리프트와 구별합니다.

### 9) 보안 경고

Doctor는 프로바이더가 allowlist 없이 DM에 공개되어 있거나 정책이
위험한 방식으로 구성된 경우 경고를 발생시킵니다.

### 10) systemd linger (Linux)

systemd 사용자 서비스로 실행 중인 경우, doctor는 로그아웃 후 gateway가 계속 실행되도록
lingering이 활성화되어 있는지 확인합니다.

### 11) Workspace 상태 (skills, plugins, 레거시 dirs)

Doctor는 기본 에이전트에 대한 workspace state 요약을 출력합니다:

- **Skills 상태**: eligible, missing-requirements, allowlist-blocked skills의 수를 셉니다.
- **레거시 workspace dirs**: `~/openclaw` 또는 기타 레거시 workspace 디렉토리가
  현재 workspace와 함께 존재할 때 경고합니다.
- **플러그인 상태**: loaded/disabled/errored 플러그인의 수를 셉니다; 오류가 있는 경우
  플러그인 ID를 나열합니다; 번들 플러그인 기능을 보고합니다.
- **플러그인 호환성 경고**: 현재 런타임과 호환성 문제가 있는
  플러그인을 플래그 지정합니다.
- **플러그인 진단**: 플러그인 레지스트리가 발생시킨 로드 시 경고 또는 오류를
  노출합니다.

### 11b) 부트스트랩 파일 크기

Doctor는 workspace 부트스트랩 파일(예: `AGENTS.md`,
`CLAUDE.md`, 또는 기타 주입된 context 파일)이 구성된 문자 예산 근처 또는 초과인지
확인합니다. 파일별 raw vs. injected 문자 수, 잘림
비율, 잘림 원인(`max/file` 또는 `max/total`), 총 예산 대비
총 주입된 문자 수를 비율로 보고합니다. 파일이 잘렸거나
한계에 가까울 때, doctor는 `agents.defaults.bootstrapMaxChars`
및 `agents.defaults.bootstrapTotalMaxChars` 튜닝 팁을 출력합니다.

### 11c) Shell 자동 완성

Doctor는 현재 shell(zsh, bash, fish, 또는 PowerShell)에 대해 tab 자동 완성이
설치되어 있는지 확인합니다:

- shell 프로파일이 느린 동적 자동 완성 패턴
  (`source <(openclaw completion ...)`)을 사용하는 경우, doctor는 이를 더 빠른
  캐시된 파일 변형으로 업그레이드합니다.
- 자동 완성이 프로파일에 구성되어 있지만 캐시 파일이 누락된 경우,
  doctor는 자동으로 캐시를 재생성합니다.
- 자동 완성이 전혀 구성되지 않은 경우, doctor는 설치를 프롬프트합니다
  (대화형 모드만; `--non-interactive`로는 건너뜀).

캐시를 수동으로 재생성하려면 `openclaw completion --write-state`를 실행하십시오.

### 12) Gateway 인증 확인 (local token)

Doctor는 로컬 gateway token 인증 준비 상태를 확인합니다.

- token 모드가 token을 필요로 하고 token 소스가 없는 경우, doctor는 생성을 제공합니다.
- `gateway.auth.token`이 SecretRef로 관리되지만 사용할 수 없는 경우, doctor는 경고하고 일반 텍스트로 덮어쓰지 않습니다.
- `openclaw doctor --generate-gateway-token`은 token SecretRef가 구성되지 않은 경우에만 생성을 강제합니다.

### 12b) 읽기 전용 SecretRef 인식 복구

일부 복구 플로우는 런타임 fail-fast 동작을 약화시키지 않고 구성된 자격 증명을 검사해야 합니다.

- `openclaw doctor --fix`는 이제 대상 구성 복구를 위해 status 계열 명령과 동일한 읽기 전용 SecretRef 요약 모델을 사용합니다.
- 예: Telegram `allowFrom` / `groupAllowFrom` `@username` 복구는 사용 가능한 경우 구성된 bot 자격 증명을 사용하려고 시도합니다.
- Telegram bot token이 SecretRef를 통해 구성되었지만 현재 명령 경로에서 사용할 수 없는 경우, doctor는 자격 증명이 구성되었지만 사용할 수 없다고 보고하고 충돌하거나 token을 누락으로 잘못 보고하는 대신 자동 해결을 건너뜁니다.

### 13) Gateway 헬스 체크 + 재시작

Doctor는 헬스 체크를 실행하고 gateway가 비정상으로 보일 때 재시작을
제공합니다.

### 13b) Memory 검색 준비 상태

Doctor는 구성된 memory 검색 임베딩 프로바이더가 기본 에이전트에 대해
준비되었는지 확인합니다. 동작은 구성된 백엔드와 프로바이더에 따라 다릅니다:

- **QMD 백엔드**: `qmd` 바이너리가 사용 가능하고 시작 가능한지 프로빙합니다.
  그렇지 않은 경우, npm 패키지 및 수동 바이너리 경로 옵션을 포함한 수정 가이드를 출력합니다.
- **명시적 로컬 프로바이더**: 로컬 모델 파일 또는 인식된
  원격/다운로드 가능 모델 URL을 확인합니다. 누락된 경우, 원격 프로바이더로 전환을 제안합니다.
- **명시적 원격 프로바이더** (`openai`, `voyage` 등): 환경 또는 auth 저장소에
  API 키가 있는지 확인합니다. 누락된 경우 실행 가능한 수정 힌트를 출력합니다.
- **Auto 프로바이더**: 먼저 로컬 모델 가용성을 확인한 다음, auto-selection 순서대로
  각 원격 프로바이더를 시도합니다.

gateway 프로브 결과가 사용 가능할 때(확인 시점에 gateway가 정상이었던 경우),
doctor는 그 결과를 CLI-visible 구성과 교차 참조하고
불일치를 기록합니다.

런타임에 임베딩 준비 상태를 확인하려면 `openclaw memory status --deep`을 사용하십시오.

### 14) 채널 상태 경고

gateway가 정상인 경우, doctor는 채널 상태 프로브를 실행하고
제안된 수정 사항과 함께 경고를 보고합니다.

### 15) Supervisor 구성 감사 + 복구

Doctor는 설치된 supervisor 구성(launchd/systemd/schtasks)에서
누락되었거나 오래된 기본값(예: systemd network-online 의존성 및
재시작 지연)을 확인합니다. 불일치를 발견하면 업데이트를 권장하고
서비스 파일/작업을 현재 기본값으로 재작성할 수 있습니다.

참고:

- `openclaw doctor`는 supervisor 구성을 재작성하기 전에 프롬프트합니다.
- `openclaw doctor --yes`는 기본 복구 프롬프트를 수락합니다.
- `openclaw doctor --repair`는 프롬프트 없이 권장 수정 사항을 적용합니다.
- `openclaw doctor --repair --force`는 사용자 정의 supervisor 구성을 덮어씁니다.
- token 인증이 token을 필요로 하고 `gateway.auth.token`이 SecretRef로 관리되는 경우, doctor 서비스 install/repair는 SecretRef를 검증하지만 해석된 일반 텍스트 token 값을 supervisor 서비스 환경 메타데이터에 유지하지 않습니다.
- token 인증이 token을 필요로 하고 구성된 token SecretRef가 해석되지 않은 경우, doctor는 실행 가능한 가이드와 함께 install/repair 경로를 차단합니다.
- `gateway.auth.token`과 `gateway.auth.password`가 모두 구성되어 있고 `gateway.auth.mode`가 설정되지 않은 경우, doctor는 mode가 명시적으로 설정될 때까지 install/repair를 차단합니다.
- Linux 사용자 systemd 유닛의 경우, doctor token 드리프트 확인은 이제 서비스 auth 메타데이터를 비교할 때 `Environment=`와 `EnvironmentFile=` 소스를 모두 포함합니다.
- `openclaw gateway install --force`를 통해 항상 전체 재작성을 강제할 수 있습니다.

### 16) Gateway 런타임 + 포트 진단

Doctor는 서비스 런타임(PID, 마지막 종료 상태)을 검사하고 서비스가
설치되었지만 실제로 실행되지 않을 때 경고합니다. 또한 gateway 포트의 포트 충돌
(기본값 `18789`)을 확인하고 가능한 원인(이미 실행 중인 gateway,
SSH 터널)을 보고합니다.

### 17) Gateway 런타임 모범 사례

Doctor는 gateway 서비스가 Bun 또는 버전 관리된 Node 경로
(`nvm`, `fnm`, `volta`, `asdf` 등)에서 실행될 때 경고합니다. WhatsApp + Telegram 채널은 Node를 필요로 하며,
버전 관리자 경로는 업그레이드 후 손상될 수 있습니다. 서비스가
shell init를 로드하지 않기 때문입니다. Doctor는 사용 가능한 경우 시스템 Node 설치
(Homebrew/apt/choco)로 마이그레이션을 제공합니다.

### 18) 구성 쓰기 + wizard 메타데이터

Doctor는 구성 변경 사항을 유지하고 doctor 실행을 기록하기 위해 wizard 메타데이터를
스탬프합니다.

### 19) Workspace 팁 (백업 + memory 시스템)

Doctor는 누락된 경우 workspace memory 시스템을 제안하고 workspace가 아직 git 아래에
없는 경우 백업 팁을 출력합니다.

workspace 구조 및 git 백업(권장 private GitHub 또는 GitLab)에 대한 전체 가이드는
[/concepts/agent-workspace](/concepts/agent-workspace)를 참조하십시오.

## 관련

- [Gateway 문제 해결](/gateway/troubleshooting)
- [Gateway 런북](/gateway/)
