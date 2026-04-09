---
summary: "`openclaw` 명령, 하위 명령, 옵션에 대한 OpenClaw CLI 참조"
read_when:
  - CLI 명령 또는 옵션을 추가하거나 수정하는 경우
  - 새로운 명령 표면을 문서화하는 경우
title: "CLI 참조"
---

# CLI 참조

이 페이지는 현재 CLI 동작을 설명합니다. 명령이 변경되면 이 문서를 업데이트하세요.

## 명령 페이지

- [`setup`](/cli/setup)
- [`onboard`](/cli/onboard)
- [`configure`](/cli/configure)
- [`config`](/cli/config)
- [`completion`](/cli/completion)
- [`doctor`](/cli/doctor)
- [`dashboard`](/cli/dashboard)
- [`backup`](/cli/backup)
- [`reset`](/cli/reset)
- [`uninstall`](/cli/uninstall)
- [`update`](/cli/update)
- [`message`](/cli/message)
- [`agent`](/cli/agent)
- [`agents`](/cli/agents)
- [`acp`](/cli/acp)
- [`mcp`](/cli/mcp)
- [`status`](/cli/status)
- [`health`](/cli/health)
- [`sessions`](/cli/sessions)
- [`gateway`](/cli/gateway)
- [`logs`](/cli/logs)
- [`system`](/cli/system)
- [`models`](/cli/models)
- [`infer`](/cli/infer)
- [`memory`](/cli/memory)
- [`wiki`](/cli/wiki)
- [`directory`](/cli/directory)
- [`nodes`](/cli/nodes)
- [`devices`](/cli/devices)
- [`node`](/cli/node)
- [`approvals`](/cli/approvals)
- [`sandbox`](/cli/sandbox)
- [`tui`](/cli/tui)
- [`browser`](/cli/browser)
- [`cron`](/cli/cron)
- [`tasks`](/cli/index#tasks)
- [`flows`](/cli/flows)
- [`dns`](/cli/dns)
- [`docs`](/cli/docs)
- [`hooks`](/cli/hooks)
- [`webhooks`](/cli/webhooks)
- [`pairing`](/cli/pairing)
- [`qr`](/cli/qr)
- [`plugins`](/cli/plugins) (플러그인 명령)
- [`channels`](/cli/channels)
- [`security`](/cli/security)
- [`secrets`](/cli/secrets)
- [`skills`](/cli/skills)
- [`daemon`](/cli/daemon) (게이트웨이 서비스 명령의 레거시 별칭)
- [`clawbot`](/cli/clawbot) (레거시 별칭 네임스페이스)
- [`voicecall`](/cli/voicecall) (플러그인; 설치된 경우)

## 전역 플래그

- `--dev`: `~/.openclaw-dev` 아래에 상태를 격리하고 기본 포트를 변경합니다.
- `--profile <name>`: `~/.openclaw-<name>` 아래에 상태를 격리합니다.
- `--container <name>`: 실행을 위한 명명된 컨테이너를 대상으로 합니다.
- `--no-color`: ANSI 색상을 비활성화합니다.
- `--update`: `openclaw update`의 단축키 (소스 설치 전용).
- `-V`, `--version`, `-v`: 버전을 출력하고 종료합니다.

## 출력 스타일링

- ANSI 색상과 진행 표시기는 TTY 세션에서만 렌더링됩니다.
- OSC-8 하이퍼링크는 지원되는 터미널에서 클릭 가능한 링크로 렌더링됩니다; 그렇지 않으면 일반 URL로 폴백합니다.
- `--json` (및 지원되는 경우 `--plain`)은 깨끗한 출력을 위해 스타일링을 비활성화합니다.
- `--no-color`는 ANSI 스타일링을 비활성화합니다; `NO_COLOR=1`도 허용됩니다.
- 오래 실행되는 명령은 진행 표시기를 표시합니다 (지원되는 경우 OSC 9;4).

## 색상 팔레트

OpenClaw는 CLI 출력에 랍스터 팔레트를 사용합니다.

- `accent` (#FF5A2D): 제목, 레이블, 기본 하이라이트.
- `accentBright` (#FF7A3D): 명령 이름, 강조.
- `accentDim` (#D14A22): 보조 하이라이트 텍스트.
- `info` (#FF8A5B): 정보 값.
- `success` (#2FBF71): 성공 상태.
- `warn` (#FFB020): 경고, 폴백, 주의.
- `error` (#E23D2D): 오류, 실패.
- `muted` (#8B7F77): 강조 해제, 메타데이터.

팔레트 소스: `src/terminal/palette.ts` ("랍스터 팔레트").

## 명령 트리

```
openclaw [--dev] [--profile <name>] <command>
  setup
  onboard
  configure
  config
    get
    set
    unset
    file
    schema
    validate
  completion
  doctor
  dashboard
  backup
    create
    verify
  security
    audit
  secrets
    reload
    audit
    configure
    apply
  reset
  uninstall
  update
    wizard
    status
  channels
    list
    status
    capabilities
    resolve
    logs
    add
    remove
    login
    logout
  directory
    self
    peers list
    groups list|members
  skills
    search
    install
    update
    list
    info
    check
  plugins
    list
    inspect
    install
    uninstall
    update
    enable
    disable
    doctor
    marketplace list
  memory
    status
    index
    search
  wiki
    status
    doctor
    init
    ingest
    compile
    lint
    search
    get
    apply
    bridge import
    unsafe-local import
    obsidian status|search|open|command|daily
  message
    send
    broadcast
    poll
    react
    reactions
    read
    edit
    delete
    pin
    unpin
    pins
    permissions
    search
    thread create|list|reply
    emoji list|upload
    sticker send|upload
    role info|add|remove
    channel info|list
    member info
    voice status
    event list|create
    timeout
    kick
    ban
  agent
  agents
    list
    add
    delete
    bindings
    bind
    unbind
    set-identity
  acp
  mcp
    serve
    list
    show
    set
    unset
  status
  health
  sessions
    cleanup
  tasks
    list
    audit
    maintenance
    show
    notify
    cancel
    flow list|show|cancel
  gateway
    call
    usage-cost
    health
    status
    probe
    discover
    install
    uninstall
    start
    stop
    restart
    run
  daemon
    status
    install
    uninstall
    start
    stop
    restart
  logs
  system
    event
    heartbeat last|enable|disable
    presence
  models
    list
    status
    set
    set-image
    aliases list|add|remove
    fallbacks list|add|remove|clear
    image-fallbacks list|add|remove|clear
    scan
  infer (alias: capability)
    list
    inspect
    model run|list|inspect|providers|auth login|logout|status
    image generate|edit|describe|describe-many|providers
    audio transcribe|providers
    tts convert|voices|providers|status|enable|disable|set-provider
    video generate|describe|providers
    web search|fetch|providers
    embedding create|providers
    auth add|login|login-github-copilot|setup-token|paste-token
    auth order get|set|clear
  sandbox
    list
    recreate
    explain
  cron
    status
    list
    add
    edit
    rm
    enable
    disable
    runs
    run
  nodes
    status
    describe
    list
    pending
    approve
    reject
    rename
    invoke
    notify
    push
    canvas snapshot|present|hide|navigate|eval
    canvas a2ui push|reset
    camera list|snap|clip
    screen record
    location get
  devices
    list
    remove
    clear
    approve
    reject
    rotate
    revoke
  node
    run
    status
    install
    uninstall
    stop
    restart
  approvals
    get
    set
    allowlist add|remove
  browser
    status
    start
    stop
    reset-profile
    tabs
    open
    focus
    close
    profiles
    create-profile
    delete-profile
    screenshot
    snapshot
    navigate
    resize
    click
    type
    press
    hover
    drag
    select
    upload
    fill
    dialog
    wait
    evaluate
    console
    pdf
  hooks
    list
    info
    check
    enable
    disable
    install
    update
  webhooks
    gmail setup|run
  pairing
    list
    approve
  qr
  clawbot
    qr
  docs
  dns
    setup
  tui
```

참고: 플러그인은 추가 최상위 명령을 추가할 수 있습니다 (예: `openclaw voicecall`).

## 보안

- `openclaw security audit` — 일반적인 보안 문제를 위한 구성 + 로컬 상태 감사.
- `openclaw security audit --deep` — 최선의 라이브 Gateway 프로브.
- `openclaw security audit --fix` — 안전한 기본값 및 상태/구성 권한 강화.

## 비밀

### `secrets`

SecretRef 및 관련 런타임/구성 위생을 관리합니다.

하위 명령:

- `secrets reload`
- `secrets audit`
- `secrets configure`
- `secrets apply --from <path>`

`secrets reload` 옵션:

- `--url`, `--token`, `--timeout`, `--expect-final`, `--json`

`secrets audit` 옵션:

- `--check`
- `--allow-exec`
- `--json`

`secrets configure` 옵션:

- `--apply`
- `--yes`
- `--providers-only`
- `--skip-provider-setup`
- `--agent <id>`
- `--allow-exec`
- `--plan-out <path>`
- `--json`

`secrets apply --from <path>` 옵션:

- `--dry-run`
- `--allow-exec`
- `--json`

참고사항:

- `reload`는 Gateway RPC이며 확인이 실패할 때 마지막으로 알려진 좋은 런타임 스냅샷을 유지합니다.
- `audit --check`는 발견 시 0이 아닌 코드를 반환합니다; 확인되지 않은 참조는 더 높은 우선순위의 0이 아닌 종료 코드를 사용합니다.
- 드라이 런 exec 확인은 기본적으로 건너뜁니다; 옵트인하려면 `--allow-exec`를 사용하세요.

## 플러그인

확장 및 구성을 관리합니다:

- `openclaw plugins list` — 플러그인 검색 (기계 출력에는 `--json` 사용).
- `openclaw plugins inspect <id>` — 플러그인 세부 정보 표시 (`info`는 별칭).
- `openclaw plugins install <path|.tgz|npm-spec|plugin@marketplace>` — 플러그인 설치 (또는 `plugins.load.paths`에 플러그인 경로 추가; 기존 설치 대상을 덮어쓰려면 `--force` 사용).
- `openclaw plugins marketplace list <marketplace>` — 설치 전 마켓플레이스 항목 나열.
- `openclaw plugins enable <id>` / `disable <id>` — `plugins.entries.<id>.enabled` 전환.
- `openclaw plugins doctor` — 플러그인 로드 오류 보고.

대부분의 플러그인 변경은 게이트웨이 재시작이 필요합니다. [/plugin](/tools/plugin) 참조.

## 메모리

`MEMORY.md` + `memory/*.md`에 대한 벡터 검색:

- `openclaw memory status` — 인덱스 통계 표시; 벡터 + 임베딩 준비 확인에는 `--deep` 사용, 오래된 회상/승격 아티팩트를 수정하려면 `--fix` 사용.
- `openclaw memory index` — 메모리 파일 재인덱스.
- `openclaw memory search "<query>"` (또는 `--query "<query>"`) — 메모리에 대한 시맨틱 검색.
- `openclaw memory promote` — 단기 회상을 순위 지정하고 선택적으로 최상위 항목을 `MEMORY.md`에 추가.

## 샌드박스

격리된 에이전트 실행을 위한 샌드박스 런타임을 관리합니다. [/cli/sandbox](/cli/sandbox) 참조.

하위 명령:

- `sandbox list [--browser] [--json]`
- `sandbox recreate [--all] [--session <key>] [--agent <id>] [--browser] [--force]`
- `sandbox explain [--session <key>] [--agent <id>] [--json]`

참고사항:

- `sandbox recreate`는 기존 런타임을 제거하여 다음 사용 시 현재 구성으로 다시 시드합니다.
- `ssh` 및 OpenShell `remote` 백엔드의 경우 recreate는 선택한 범위에 대한 정규 원격 워크스페이스를 삭제합니다.

## 채팅 슬래시 명령

채팅 메시지는 `/...` 명령을 지원합니다 (텍스트 및 네이티브). [/tools/slash-commands](/tools/slash-commands) 참조.

하이라이트:

- `/status` — 빠른 진단.
- `/config` — 유지되는 구성 변경.
- `/debug` — 런타임 전용 구성 재정의 (메모리, 디스크 아님; `commands.debug: true` 필요).

## 설정 + 온보딩

### `completion`

셸 완성 스크립트를 생성하고 선택적으로 셸 프로파일에 설치합니다.

옵션:

- `-s, --shell <zsh|bash|powershell|fish>`
- `-i, --install`
- `--write-state`
- `-y, --yes`

참고사항:

- `--install` 또는 `--write-state` 없이 `completion`은 스크립트를 stdout에 출력합니다.
- `--install`은 셸 프로파일에 `OpenClaw Completion` 블록을 쓰고 OpenClaw 상태 디렉터리 아래의 캐시된 스크립트를 가리킵니다.

### `setup`

구성 + 워크스페이스를 초기화합니다.

옵션:

- `--workspace <dir>`: 에이전트 워크스페이스 경로 (기본값 `~/.openclaw/workspace`).
- `--wizard`: 온보딩 실행.
- `--non-interactive`: 프롬프트 없이 온보딩 실행.
- `--mode <local|remote>`: 온보딩 모드.
- `--remote-url <url>`: 원격 Gateway URL.
- `--remote-token <token>`: 원격 Gateway 토큰.

온보딩 플래그가 있으면 온보딩이 자동으로 실행됩니다 (`--non-interactive`, `--mode`, `--remote-url`, `--remote-token`).

### `onboard`

게이트웨이, 워크스페이스, 스킬을 위한 인터랙티브 온보딩.

옵션:

- `--workspace <dir>`
- `--reset` (온보딩 전 구성 + 자격 증명 + 세션 초기화)
- `--reset-scope <config|config+creds+sessions|full>` (기본값 `config+creds+sessions`; 워크스페이스도 제거하려면 `full` 사용)
- `--non-interactive`
- `--mode <local|remote>`
- `--flow <quickstart|advanced|manual>` (manual은 advanced의 별칭)
- `--auth-choice <choice>` 여기서 `<choice>`는 다음 중 하나입니다:
  `chutes`, `deepseek-api-key`, `openai-codex`, `openai-api-key`,
  `openrouter-api-key`, `kilocode-api-key`, `litellm-api-key`, `ai-gateway-api-key`,
  `cloudflare-ai-gateway-api-key`, `moonshot-api-key`, `moonshot-api-key-cn`,
  `kimi-code-api-key`, `synthetic-api-key`, `venice-api-key`, `together-api-key`,
  `huggingface-api-key`, `apiKey`, `gemini-api-key`, `google-gemini-cli`, `zai-api-key`,
  `zai-coding-global`, `zai-coding-cn`, `zai-global`, `zai-cn`, `xiaomi-api-key`,
  `minimax-global-oauth`, `minimax-global-api`, `minimax-cn-oauth`, `minimax-cn-api`,
  `opencode-zen`, `opencode-go`, `github-copilot`, `copilot-proxy`, `xai-api-key`,
  `mistral-api-key`, `volcengine-api-key`, `byteplus-api-key`, `qianfan-api-key`,
  `qwen-standard-api-key-cn`, `qwen-standard-api-key`, `qwen-api-key-cn`, `qwen-api-key`,
  `modelstudio-standard-api-key-cn`, `modelstudio-standard-api-key`,
  `modelstudio-api-key-cn`, `modelstudio-api-key`, `custom-api-key`, `skip`
- Qwen 참고: `qwen-*`는 정규 auth-choice 패밀리입니다. `modelstudio-*` id는 레거시 호환성 별칭으로만 허용됩니다.
- `--secret-input-mode <plaintext|ref>` (기본값 `plaintext`; 일반 텍스트 키 대신 프로바이더 기본 환경 참조를 저장하려면 `ref` 사용)
- `--anthropic-api-key <key>`
- `--openai-api-key <key>`
- `--mistral-api-key <key>`
- `--openrouter-api-key <key>`
- `--ai-gateway-api-key <key>`
- `--moonshot-api-key <key>`
- `--kimi-code-api-key <key>`
- `--gemini-api-key <key>`
- `--zai-api-key <key>`
- `--minimax-api-key <key>`
- `--opencode-zen-api-key <key>`
- `--opencode-go-api-key <key>`
- `--custom-base-url <url>` (비인터랙티브; `--auth-choice custom-api-key`와 함께 사용)
- `--custom-model-id <id>` (비인터랙티브; `--auth-choice custom-api-key`와 함께 사용)
- `--custom-api-key <key>` (비인터랙티브; 선택 사항; `--auth-choice custom-api-key`와 함께 사용; 생략하면 `CUSTOM_API_KEY`로 폴백)
- `--custom-provider-id <id>` (비인터랙티브; 선택적 커스텀 프로바이더 id)
- `--custom-compatibility <openai|anthropic>` (비인터랙티브; 선택 사항; 기본값 `openai`)
- `--gateway-port <port>`
- `--gateway-bind <loopback|lan|tailnet|auto|custom>`
- `--gateway-auth <token|password>`
- `--gateway-token <token>`
- `--gateway-token-ref-env <name>` (비인터랙티브; `gateway.auth.token`을 환경 SecretRef로 저장; 해당 환경 변수가 설정되어 있어야 함; `--gateway-token`과 결합 불가)
- `--gateway-password <password>`
- `--remote-url <url>`
- `--remote-token <token>`
- `--tailscale <off|serve|funnel>`
- `--tailscale-reset-on-exit`
- `--install-daemon`
- `--no-install-daemon` (별칭: `--skip-daemon`)
- `--daemon-runtime <node|bun>`
- `--skip-channels`
- `--skip-skills`
- `--skip-search`
- `--skip-health`
- `--skip-ui`
- `--cloudflare-ai-gateway-account-id <id>`
- `--cloudflare-ai-gateway-gateway-id <id>`
- `--node-manager <npm|pnpm|bun>` (스킬을 위한 설정/온보딩 노드 관리자; pnpm 권장, bun도 지원)
- `--json`

### `configure`

인터랙티브 구성 마법사 (모델, 채널, 스킬, 게이트웨이).

옵션:

- `--section <section>` (반복 가능; 특정 섹션으로 마법사를 제한)

### `config`

비인터랙티브 구성 도우미 (get/set/unset/file/schema/validate). 하위 명령 없이 `openclaw config`를 실행하면 마법사가 시작됩니다.

하위 명령:

- `config get <path>`: 구성 값 출력 (점/괄호 경로).
- `config set`: 네 가지 할당 모드를 지원합니다:
  - 값 모드: `config set <path> <value>` (JSON5 또는 문자열 파싱)
  - SecretRef 빌더 모드: `config set <path> --ref-provider <provider> --ref-source <source> --ref-id <id>`
  - 프로바이더 빌더 모드: `config set secrets.providers.<alias> --provider-source <env|file|exec> ...`
  - 배치 모드: `config set --batch-json '<json>'` 또는 `config set --batch-file <path>`
- `config set --dry-run`: `openclaw.json`을 쓰지 않고 할당을 유효성 검사합니다 (exec SecretRef 확인은 기본적으로 건너뜁니다).
- `config set --allow-exec --dry-run`: exec SecretRef 드라이 런 확인에 옵트인합니다 (프로바이더 명령을 실행할 수 있음).
- `config set --dry-run --json`: 기계 판독 가능한 드라이 런 출력을 출력합니다 (확인 + 완전성 신호, 작업, 참조 확인/건너뜀, 오류).
- `config set --strict-json`: 경로/값 입력에 JSON5 파싱을 요구합니다. `--json`은 드라이 런 출력 모드 외부에서 엄격한 파싱을 위한 레거시 별칭으로 유지됩니다.
- `config unset <path>`: 값을 제거합니다.
- `config file`: 활성 구성 파일 경로를 출력합니다.
- `config schema`: `openclaw.json`에 대한 생성된 JSON 스키마를 출력합니다. 중첩된 객체, 와일드카드, 배열 항목, 컴포지션 브랜치 전체에 전파된 필드 `title` / `description` 문서 메타데이터, 그리고 최선의 라이브 플러그인/채널 스키마 메타데이터를 포함합니다.
- `config validate`: 게이트웨이를 시작하지 않고 현재 구성을 스키마에 대해 유효성 검사합니다.
- `config validate --json`: 기계 판독 가능한 JSON 출력을 출력합니다.

### `doctor`

상태 확인 + 빠른 수정 (구성 + 게이트웨이 + 레거시 서비스).

옵션:

- `--no-workspace-suggestions`: 워크스페이스 메모리 힌트를 비활성화합니다.
- `--yes`: 프롬프트 없이 기본값을 수락합니다 (헤드리스).
- `--non-interactive`: 프롬프트를 건너뜁니다; 안전한 마이그레이션만 적용합니다.
- `--deep`: 추가 게이트웨이 설치를 위한 시스템 서비스를 스캔합니다.
- `--repair` (별칭: `--fix`): 감지된 문제에 대한 자동 수정을 시도합니다.
- `--force`: 엄격히 필요하지 않더라도 수정을 강제합니다.
- `--generate-gateway-token`: 새 게이트웨이 인증 토큰을 생성합니다.

### `dashboard`

현재 토큰으로 Control UI를 엽니다.

옵션:

- `--no-open`: URL을 출력하지만 브라우저를 시작하지 않습니다

참고사항:

- SecretRef 관리 게이트웨이 토큰의 경우 `dashboard`는 터미널 출력이나 브라우저 시작 인수에서 비밀을 노출하는 대신 토큰 없는 URL을 출력하거나 엽니다.

### `update`

설치된 CLI를 업데이트합니다.

루트 옵션:

- `--json`
- `--no-restart`
- `--dry-run`
- `--channel <stable|beta|dev>`
- `--tag <dist-tag|version|spec>`
- `--timeout <seconds>`
- `--yes`

하위 명령:

- `update status`
- `update wizard`

`update status` 옵션:

- `--json`
- `--timeout <seconds>`

`update wizard` 옵션:

- `--timeout <seconds>`

참고사항:

- `openclaw --update`는 `openclaw update`로 재작성됩니다.

### `backup`

OpenClaw 상태에 대한 로컬 백업 아카이브를 생성하고 확인합니다.

하위 명령:

- `backup create`
- `backup verify <archive>`

`backup create` 옵션:

- `--output <path>`
- `--json`
- `--dry-run`
- `--verify`
- `--only-config`
- `--no-include-workspace`

`backup verify <archive>` 옵션:

- `--json`

## 채널 도우미

### `channels`

채팅 채널 계정을 관리합니다 (WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost (플러그인)/Signal/iMessage/Microsoft Teams).

하위 명령:

- `channels list`: 구성된 채널 및 인증 프로파일을 표시합니다.
- `channels status`: 게이트웨이 도달 가능성 및 채널 상태를 확인합니다 (`--probe`는 게이트웨이에 도달 가능할 때 계정별 라이브 프로브/감사 확인을 실행합니다; 그렇지 않으면 구성 전용 채널 요약으로 폴백합니다. 더 넓은 게이트웨이 상태 프로브에는 `openclaw health` 또는 `openclaw status --deep` 사용).
- 팁: `channels status`는 일반적인 잘못된 구성을 감지할 수 있을 때 제안된 수정과 함께 경고를 출력합니다 (그런 다음 `openclaw doctor`로 안내).
- `channels logs`: 게이트웨이 로그 파일에서 최근 채널 로그를 표시합니다.
- `channels add`: 플래그가 전달되지 않으면 마법사 스타일 설정 실행; 플래그는 비인터랙티브 모드로 전환합니다.
  - 단일 계정 최상위 구성을 여전히 사용하는 채널에 기본이 아닌 계정을 추가할 때 OpenClaw는 새 계정을 쓰기 전에 계정 범위 값을 채널 계정 맵으로 승격합니다. 대부분의 채널은 `accounts.default`를 사용합니다; Matrix는 기존 일치하는 명명된/기본 대상을 대신 보존할 수 있습니다.
  - 비인터랙티브 `channels add`는 바인딩을 자동 생성/업그레이드하지 않습니다; 채널 전용 바인딩은 기본 계정을 계속 일치시킵니다.
- `channels remove`: 기본적으로 비활성화합니다; 프롬프트 없이 구성 항목을 제거하려면 `--delete`를 전달합니다.
- `channels login`: 인터랙티브 채널 로그인 (WhatsApp Web만).
- `channels logout`: 채널 세션에서 로그아웃합니다 (지원되는 경우).

공통 옵션:

- `--channel <name>`: `whatsapp|telegram|discord|googlechat|slack|mattermost|signal|imessage|msteams`
- `--account <id>`: 채널 계정 id (기본값 `default`)
- `--name <label>`: 계정 표시 이름

`channels login` 옵션:

- `--channel <channel>` (기본값 `whatsapp`; `whatsapp`/`web` 지원)
- `--account <id>`
- `--verbose`

`channels logout` 옵션:

- `--channel <channel>` (기본값 `whatsapp`)
- `--account <id>`

`channels list` 옵션:

- `--no-usage`: 모델 프로바이더 사용/할당량 스냅샷을 건너뜁니다 (OAuth/API 백업만).
- `--json`: JSON 출력 (`--no-usage`가 설정되지 않은 한 사용량 포함).

`channels status` 옵션:

- `--probe`
- `--timeout <ms>`
- `--json`

`channels capabilities` 옵션:

- `--channel <name>`
- `--account <id>` (`--channel`과 함께만)
- `--target <dest>`
- `--timeout <ms>`
- `--json`

`channels resolve` 옵션:

- `<entries...>`
- `--channel <name>`
- `--account <id>`
- `--kind <auto|user|group>`
- `--json`

`channels logs` 옵션:

- `--channel <name|all>` (기본값 `all`)
- `--lines <n>` (기본값 `200`)
- `--json`

참고사항:

- `channels login`은 `--verbose`를 지원합니다.
- `channels capabilities --account`는 `--channel`이 설정된 경우에만 적용됩니다.
- `channels status --probe`는 채널 지원에 따라 전송 상태와 프로브/감사 결과 (`works`, `probe failed`, `audit ok`, 또는 `audit failed`)를 표시할 수 있습니다.

자세한 내용: [/concepts/oauth](/concepts/oauth)

예시:

```bash
openclaw channels add --channel telegram --account alerts --name "Alerts Bot" --token $TELEGRAM_BOT_TOKEN
openclaw channels add --channel discord --account work --name "Work Bot" --token $DISCORD_BOT_TOKEN
openclaw channels remove --channel discord --account work --delete
openclaw channels status --probe
openclaw status --deep
```

### `directory`

디렉터리 표면을 노출하는 채널에 대한 자체, 피어, 그룹 ID를 조회합니다. [`openclaw directory`](/cli/directory) 참조.

공통 옵션:

- `--channel <name>`
- `--account <id>`
- `--json`

하위 명령:

- `directory self`
- `directory peers list [--query <text>] [--limit <n>]`
- `directory groups list [--query <text>] [--limit <n>]`
- `directory groups members --group-id <id> [--limit <n>]`

### `skills`

사용 가능한 스킬 및 준비 정보를 나열하고 검사합니다.

하위 명령:

- `skills search [query...]`: ClawHub 스킬을 검색합니다.
- `skills search --limit <n> --json`: 검색 결과를 제한하거나 기계 판독 가능한 출력을 출력합니다.
- `skills install <slug>`: 활성 워크스페이스에 ClawHub에서 스킬을 설치합니다.
- `skills install <slug> --version <version>`: 특정 ClawHub 버전을 설치합니다.
- `skills install <slug> --force`: 기존 워크스페이스 스킬 폴더를 덮어씁니다.
- `skills update <slug|--all>`: 추적된 ClawHub 스킬을 업데이트합니다.
- `skills list`: 스킬을 나열합니다 (하위 명령이 없을 때 기본값).
- `skills list --json`: stdout에 기계 판독 가능한 스킬 인벤토리를 출력합니다.
- `skills list --verbose`: 테이블에 누락된 요구 사항을 포함합니다.
- `skills info <name>`: 하나의 스킬 세부 정보를 표시합니다.
- `skills info <name> --json`: stdout에 기계 판독 가능한 세부 정보를 출력합니다.
- `skills check`: 준비된 것 대 누락된 요구 사항 요약.
- `skills check --json`: stdout에 기계 판독 가능한 준비 출력을 출력합니다.

옵션:

- `--eligible`: 준비된 스킬만 표시합니다.
- `--json`: JSON 출력 (스타일 없음).
- `-v`, `--verbose`: 누락된 요구 사항 세부 정보를 포함합니다.

팁: ClawHub 백업 스킬에는 `openclaw skills search`, `openclaw skills install`, `openclaw skills update`를 사용하세요.

### `pairing`

채널 전체에서 DM 페어링 요청을 승인합니다.

하위 명령:

- `pairing list [channel] [--channel <channel>] [--account <id>] [--json]`
- `pairing approve <channel> <code> [--account <id>] [--notify]`
- `pairing approve --channel <channel> [--account <id>] <code> [--notify]`

참고사항:

- 정확히 하나의 페어링 가능한 채널이 구성된 경우 `pairing approve <code>`도 허용됩니다.
- `list`와 `approve` 모두 멀티 계정 채널을 위해 `--account <id>`를 지원합니다.

### `devices`

게이트웨이 디바이스 페어링 항목 및 역할별 디바이스 토큰을 관리합니다.

하위 명령:

- `devices list [--json]`
- `devices approve [requestId] [--latest]`
- `devices reject <requestId>`
- `devices remove <deviceId>`
- `devices clear --yes [--pending]`
- `devices rotate --device <id> --role <role> [--scope <scope...>]`
- `devices revoke --device <id> --role <role>`

참고사항:

- `devices list`와 `devices approve`는 직접 페어링 범위를 사용할 수 없을 때 로컬 루프백에서 로컬 페어링 파일로 폴백할 수 있습니다.
- `requestId`가 전달되지 않거나 `--latest`가 설정된 경우 `devices approve`는 가장 최신 보류 중인 요청을 자동 선택합니다.
- 저장된 토큰 재연결은 토큰의 캐시된 승인된 범위를 재사용합니다; 명시적 `devices rotate --scope ...`는 이후 캐시된 토큰 재연결을 위해 해당 저장된 범위 세트를 업데이트합니다.
- `devices rotate`와 `devices revoke`는 JSON 페이로드를 반환합니다.

### `qr`

현재 Gateway 구성에서 모바일 페어링 QR 및 설정 코드를 생성합니다. [`openclaw qr`](/cli/qr) 참조.

옵션:

- `--remote`
- `--url <url>`
- `--public-url <url>`
- `--token <token>`
- `--password <password>`
- `--setup-code-only`
- `--no-ascii`
- `--json`

참고사항:

- `--token`과 `--password`는 상호 배타적입니다.
- 설정 코드는 공유된 게이트웨이 토큰/비밀번호가 아닌 단기 부트스트랩 토큰을 포함합니다.
- 내장 부트스트랩 핸드오프는 기본 노드 토큰을 `scopes: []`로 유지합니다.
- 핸드오프된 운영자 부트스트랩 토큰은 `operator.approvals`, `operator.read`, `operator.talk.secrets`, `operator.write`로 제한됩니다.
- 부트스트랩 범위 확인은 역할 접두사가 붙으므로 해당 운영자 허용 목록은 운영자 요청만 충족시킵니다; 비운영자 역할은 여전히 자신의 역할 접두사 아래에서 범위가 필요합니다.
- `--remote`는 `gateway.remote.url` 또는 활성 Tailscale Serve/Funnel URL을 사용할 수 있습니다.
- 스캔 후 `openclaw devices list` / `openclaw devices approve <requestId>`로 요청을 승인하세요.

### `clawbot`

레거시 별칭 네임스페이스. 현재 [`openclaw qr`](/cli/qr)로 매핑되는 `openclaw clawbot qr`을 지원합니다.

### `hooks`

내부 에이전트 훅을 관리합니다.

하위 명령:

- `hooks list`
- `hooks info <name>`
- `hooks check`
- `hooks enable <name>`
- `hooks disable <name>`
- `hooks install <path-or-spec>` (`openclaw plugins install`의 더 이상 사용되지 않는 별칭)
- `hooks update [id]` (`openclaw plugins update`의 더 이상 사용되지 않는 별칭)

공통 옵션:

- `--json`
- `--eligible`
- `-v`, `--verbose`

참고사항:

- 플러그인 관리 훅은 `openclaw hooks`를 통해 활성화하거나 비활성화할 수 없습니다; 소유 플러그인을 활성화하거나 비활성화하세요.
- `hooks install`과 `hooks update`는 여전히 호환성 별칭으로 작동하지만 더 이상 사용되지 않는다는 경고를 출력하고 플러그인 명령으로 전달합니다.

### `webhooks`

웹훅 도우미. 현재 내장 표면은 Gmail Pub/Sub 설정 + 런너입니다:

- `webhooks gmail setup`
- `webhooks gmail run`

### `webhooks gmail`

Gmail Pub/Sub 훅 설정 + 런너. [Gmail Pub/Sub](/automation/cron-jobs#gmail-pubsub-integration) 참조.

하위 명령:

- `webhooks gmail setup` (`--account <email>` 필요; `--project`, `--topic`, `--subscription`, `--label`, `--hook-url`, `--hook-token`, `--push-token`, `--bind`, `--port`, `--path`, `--include-body`, `--max-bytes`, `--renew-minutes`, `--tailscale`, `--tailscale-path`, `--tailscale-target`, `--push-endpoint`, `--json` 지원)
- `webhooks gmail run` (동일한 플래그에 대한 런타임 재정의)

참고사항:

- `setup`은 Gmail watch와 OpenClaw 대면 푸시 경로를 구성합니다.
- `run`은 선택적 런타임 재정의와 함께 로컬 Gmail 감시자/갱신 루프를 시작합니다.

### `dns`

광역 검색 DNS 도우미 (CoreDNS + Tailscale). 현재 내장 표면:

- `dns setup [--domain <domain>] [--apply]`

### `dns setup`

광역 검색 DNS 도우미 (CoreDNS + Tailscale). [/gateway/discovery](/gateway/discovery) 참조.

옵션:

- `--domain <domain>`
- `--apply`: CoreDNS 구성 설치/업데이트 (sudo 필요; macOS만).

참고사항:

- `--apply` 없이 이것은 권장 OpenClaw + Tailscale DNS 구성을 출력하는 계획 도우미입니다.
- `--apply`는 현재 Homebrew CoreDNS가 있는 macOS만 지원합니다.

## 메시징 + 에이전트

### `message`

통합 아웃바운드 메시징 + 채널 액션.

참조: [/cli/message](/cli/message)

하위 명령:

- `message send|poll|react|reactions|read|edit|delete|pin|unpin|pins|permissions|search|timeout|kick|ban`
- `message thread <create|list|reply>`
- `message emoji <list|upload>`
- `message sticker <send|upload>`
- `message role <info|add|remove>`
- `message channel <info|list>`
- `message member info`
- `message voice status`
- `message event <list|create>`

예시:

- `openclaw message send --target +15555550123 --message "Hi"`
- `openclaw message poll --channel discord --target channel:123 --poll-question "Snack?" --poll-option Pizza --poll-option Sushi`

### `agent`

Gateway를 통해 하나의 에이전트 턴을 실행합니다 (또는 `--local` 임베디드).

세션 선택기를 하나 이상 전달하세요: `--to`, `--session-id`, 또는 `--agent`.

필수:

- `-m, --message <text>`

옵션:

- `-t, --to <dest>` (세션 키 및 선택적 전달)
- `--session-id <id>`
- `--agent <id>` (에이전트 id; 라우팅 바인딩을 재정의)
- `--thinking <off|minimal|low|medium|high|xhigh>` (프로바이더 지원 다양; CLI 수준에서 모델 게이트되지 않음)
- `--verbose <on|off>`
- `--channel <channel>` (전달 채널; 주 세션 채널을 사용하려면 생략)
- `--reply-to <target>` (전달 대상 재정의, 세션 라우팅과 별도)
- `--reply-channel <channel>` (전달 채널 재정의)
- `--reply-account <id>` (전달 계정 id 재정의)
- `--local` (임베디드 실행; 플러그인 레지스트리는 여전히 먼저 사전 로드됨)
- `--deliver`
- `--json`
- `--timeout <seconds>`

참고사항:

- Gateway 모드는 Gateway 요청이 실패할 때 임베디드 에이전트로 폴백합니다.
- `--local`은 여전히 플러그인 레지스트리를 사전 로드하므로 플러그인 제공 프로바이더, 툴, 채널은 임베디드 실행 중에도 사용 가능합니다.
- `--channel`, `--reply-channel`, `--reply-account`는 라우팅이 아닌 답장 전달에 영향을 미칩니다.

### `agents`

격리된 에이전트 (워크스페이스 + 인증 + 라우팅)를 관리합니다.

하위 명령 없이 `openclaw agents`를 실행하는 것은 `openclaw agents list`와 동일합니다.

#### `agents list`

구성된 에이전트를 나열합니다.

옵션:

- `--json`
- `--bindings`

#### `agents add [name]`

새로운 격리된 에이전트를 추가합니다. 플래그 (또는 `--non-interactive`)가 전달되지 않으면 안내 마법사를 실행합니다; `--workspace`는 비인터랙티브 모드에서 필수입니다.

옵션:

- `--workspace <dir>`
- `--model <id>`
- `--agent-dir <dir>`
- `--bind <channel[:accountId]>` (반복 가능)
- `--non-interactive`
- `--json`

바인딩 스펙은 `channel[:accountId]`를 사용합니다. `accountId`가 생략되면 OpenClaw는 채널 기본값/플러그인 훅을 통해 계정 범위를 확인할 수 있습니다; 그렇지 않으면 명시적 계정 범위 없는 채널 바인딩입니다.
명시적 추가 플래그를 전달하면 명령이 비인터랙티브 경로로 전환됩니다. `main`은 예약되어 있으며 새 에이전트 id로 사용할 수 없습니다.

#### `agents bindings`

라우팅 바인딩을 나열합니다.

옵션:

- `--agent <id>`
- `--json`

#### `agents bind`

에이전트에 대한 라우팅 바인딩을 추가합니다.

옵션:

- `--agent <id>` (기본값은 현재 기본 에이전트)
- `--bind <channel[:accountId]>` (반복 가능)
- `--json`

#### `agents unbind`

에이전트에 대한 라우팅 바인딩을 제거합니다.

옵션:

- `--agent <id>` (기본값은 현재 기본 에이전트)
- `--bind <channel[:accountId]>` (반복 가능)
- `--all`
- `--json`

`--all` 또는 `--bind` 중 하나를 사용하고, 둘 다 사용하지 마세요.

#### `agents delete <id>`

에이전트와 워크스페이스 + 상태를 삭제합니다.

옵션:

- `--force`
- `--json`

참고사항:

- `main`은 삭제할 수 없습니다.
- `--force` 없이 인터랙티브 확인이 필요합니다.

#### `agents set-identity`

에이전트 신원 (이름/테마/이모지/아바타)을 업데이트합니다.

옵션:

- `--agent <id>`
- `--workspace <dir>`
- `--identity-file <path>`
- `--from-identity`
- `--name <name>`
- `--theme <theme>`
- `--emoji <emoji>`
- `--avatar <value>`
- `--json`

참고사항:

- `--agent` 또는 `--workspace`를 사용하여 대상 에이전트를 선택할 수 있습니다.
- 명시적 신원 필드가 제공되지 않으면 명령은 `IDENTITY.md`를 읽습니다.

### `acp`

IDE를 Gateway에 연결하는 ACP 브리지를 실행합니다.

루트 옵션:

- `--url <url>`
- `--token <token>`
- `--token-file <path>`
- `--password <password>`
- `--password-file <path>`
- `--session <key>`
- `--session-label <label>`
- `--require-existing`
- `--reset-session`
- `--no-prefix-cwd`
- `--provenance <off|meta|meta+receipt>`
- `--verbose`

#### `acp client`

브리지 디버깅을 위한 인터랙티브 ACP 클라이언트.

옵션:

- `--cwd <dir>`
- `--server <command>`
- `--server-args <args...>`
- `--server-verbose`
- `--verbose`

전체 동작, 보안 참고사항, 예시는 [`acp`](/cli/acp)를 참조하세요.

### `mcp`

저장된 MCP 서버 정의를 관리하고 OpenClaw 채널을 MCP stdio를 통해 노출합니다.

#### `mcp serve`

라우팅된 OpenClaw 채널 대화를 MCP stdio를 통해 노출합니다.

옵션:

- `--url <url>`
- `--token <token>`
- `--token-file <path>`
- `--password <password>`
- `--password-file <path>`
- `--claude-channel-mode <auto|on|off>`
- `--verbose`

#### `mcp list`

저장된 MCP 서버 정의를 나열합니다.

옵션:

- `--json`

#### `mcp show [name]`

하나의 저장된 MCP 서버 정의 또는 전체 저장된 MCP 서버 객체를 표시합니다.

옵션:

- `--json`

#### `mcp set <name> <value>`

JSON 객체에서 하나의 MCP 서버 정의를 저장합니다.

#### `mcp unset <name>`

하나의 저장된 MCP 서버 정의를 제거합니다.

### `approvals`

exec 승인을 관리합니다. 별칭: `exec-approvals`.

#### `approvals get`

exec 승인 스냅샷 및 효과적인 정책을 가져옵니다.

옵션:

- `--node <node>`
- `--gateway`
- `--json`
- `openclaw nodes`의 노드 RPC 옵션

#### `approvals set`

파일 또는 stdin에서 JSON으로 exec 승인을 교체합니다.

옵션:

- `--node <node>`
- `--gateway`
- `--file <path>`
- `--stdin`
- `--json`
- `openclaw nodes`의 노드 RPC 옵션

#### `approvals allowlist add|remove`

에이전트별 exec 허용 목록을 편집합니다.

옵션:

- `--node <node>`
- `--gateway`
- `--agent <id>` (기본값 `*`)
- `--json`
- `openclaw nodes`의 노드 RPC 옵션

### `status`

연결된 세션 상태 및 최근 수신자를 표시합니다.

옵션:

- `--json`
- `--all` (전체 진단; 읽기 전용, 붙여넣기 가능)
- `--deep` (지원되는 경우 채널 프로브를 포함한 라이브 상태 프로브를 위해 게이트웨이에 요청)
- `--usage` (모델 프로바이더 사용/할당량 표시)
- `--timeout <ms>`
- `--verbose`
- `--debug` (`--verbose`의 별칭)

참고사항:

- 개요에는 사용 가능한 경우 Gateway + 노드 호스트 서비스 상태가 포함됩니다.
- `--usage`는 정규화된 프로바이더 사용 창을 `X% left`로 출력합니다.

### 사용량 추적

OpenClaw는 OAuth/API 자격 증명을 사용할 수 있을 때 프로바이더 사용/할당량을 표면화할 수 있습니다.

표면:

- `/status` (사용 가능할 때 짧은 프로바이더 사용 라인 추가)
- `openclaw status --usage` (전체 프로바이더 분류 출력)
- macOS 메뉴 바 (컨텍스트 아래의 사용량 섹션)

참고사항:

- 데이터는 프로바이더 사용 엔드포인트에서 직접 가져옵니다 (추정 없음).
- 사람이 읽을 수 있는 출력은 프로바이더 전체에서 `X% left`로 정규화됩니다.
- 현재 사용 창이 있는 프로바이더: Anthropic, GitHub Copilot, Gemini CLI, OpenAI Codex, MiniMax, Xiaomi, z.ai.
- MiniMax 참고: 원시 `usage_percent` / `usagePercent`는 남은 할당량을 의미하므로 OpenClaw는 표시 전에 반전합니다; 카운트 기반 필드가 있으면 여전히 우선합니다. `model_remains` 응답은 채팅 모델 항목을 선호하고, 필요할 때 타임스탬프에서 창 레이블을 도출하며, 플랜 레이블에 모델 이름을 포함합니다.
- 사용 인증은 가능한 경우 프로바이더별 훅에서 가져옵니다; 그렇지 않으면 OpenClaw는 인증 프로파일, 환경, 또는 구성에서 일치하는 OAuth/API 키 자격 증명으로 폴백합니다. 확인되지 않으면 사용량은 숨겨집니다.
- 자세한 내용: [사용량 추적](/concepts/usage-tracking) 참조.

### `health`

실행 중인 Gateway에서 상태를 가져옵니다.

옵션:

- `--json`
- `--timeout <ms>`
- `--verbose` (라이브 프로브를 강제하고 게이트웨이 연결 세부 정보를 출력)
- `--debug` (`--verbose`의 별칭)

참고사항:

- 기본 `health`는 신선한 캐시된 게이트웨이 스냅샷을 반환할 수 있습니다.
- `health --verbose`는 라이브 프로브를 강제하고 구성된 모든 계정 및 에이전트에 걸쳐 사람이 읽을 수 있는 출력을 확장합니다.

### `sessions`

저장된 대화 세션을 나열합니다.

옵션:

- `--json`
- `--verbose`
- `--store <path>`
- `--active <minutes>`
- `--agent <id>` (에이전트별 세션 필터링)
- `--all-agents` (모든 에이전트에 걸쳐 세션 표시)

하위 명령:

- `sessions cleanup` — 만료되거나 고아가 된 세션을 제거

참고사항:

- `sessions cleanup`은 트랜스크립트 파일이 사라진 항목을 정리하는 `--fix-missing`도 지원합니다.

## 초기화 / 제거

### `reset`

로컬 구성/상태를 초기화합니다 (CLI는 설치된 상태 유지).

옵션:

- `--scope <config|config+creds+sessions|full>`
- `--yes`
- `--non-interactive`
- `--dry-run`

참고사항:

- `--non-interactive`는 `--scope`와 `--yes`가 필요합니다.

### `uninstall`

게이트웨이 서비스 + 로컬 데이터를 제거합니다 (CLI 유지).

옵션:

- `--service`
- `--state`
- `--workspace`
- `--app`
- `--all`
- `--yes`
- `--non-interactive`
- `--dry-run`

참고사항:

- `--non-interactive`는 `--yes`와 명시적 범위 (또는 `--all`)가 필요합니다.
- `--all`은 서비스, 상태, 워크스페이스, 앱을 함께 제거합니다.

### `tasks`

에이전트 전체에서 [백그라운드 태스크](/automation/tasks) 실행을 나열하고 관리합니다.

- `tasks list` — 활성 및 최근 태스크 실행 표시
- `tasks show <id>` — 특정 태스크 실행의 세부 정보 표시
- `tasks notify <id>` — 태스크 실행에 대한 알림 정책 변경
- `tasks cancel <id>` — 실행 중인 태스크 취소
- `tasks audit` — 운영 문제 표면화 (오래된, 손실된, 전달 실패)
- `tasks maintenance [--apply] [--json]` — 태스크와 TaskFlow 정리/조정 미리 보기 또는 적용 (ACP/하위 에이전트 자식 세션, 활성 크론 작업, 라이브 CLI 실행)
- `tasks flow list` — 활성 및 최근 태스크 흐름 목록
- `tasks flow show <lookup>` — id 또는 조회 키로 흐름 검사
- `tasks flow cancel <lookup>` — 실행 중인 흐름과 활성 태스크 취소

### `flows`

레거시 문서 단축키. 흐름 명령은 `openclaw tasks flow` 아래에 있습니다:

- `tasks flow list [--json]`
- `tasks flow show <lookup>`
- `tasks flow cancel <lookup>`

## Gateway

### `gateway`

WebSocket Gateway를 실행합니다.

옵션:

- `--port <port>`
- `--bind <loopback|tailnet|lan|auto|custom>`
- `--token <token>`
- `--auth <token|password>`
- `--password <password>`
- `--password-file <path>`
- `--tailscale <off|serve|funnel>`
- `--tailscale-reset-on-exit`
- `--allow-unconfigured`
- `--dev`
- `--reset` (개발 구성 + 자격 증명 + 세션 + 워크스페이스 초기화)
- `--force` (포트에서 기존 리스너를 종료)
- `--verbose`
- `--cli-backend-logs`
- `--ws-log <auto|full|compact>`
- `--compact` (`--ws-log compact`의 별칭)
- `--raw-stream`
- `--raw-stream-path <path>`

### `gateway service`

Gateway 서비스를 관리합니다 (launchd/systemd/schtasks).

하위 명령:

- `gateway status` (기본적으로 Gateway RPC를 프로브)
- `gateway install` (서비스 설치)
- `gateway uninstall`
- `gateway start`
- `gateway stop`
- `gateway restart`

참고사항:

- `gateway status`는 기본적으로 서비스의 확인된 포트/구성을 사용하여 Gateway RPC를 프로브합니다 (`--url/--token/--password`로 재정의).
- `gateway status`는 스크립팅을 위해 `--no-probe`, `--deep`, `--require-rpc`, `--json`을 지원합니다.
- `gateway status`는 감지할 수 있을 때 레거시 또는 추가 게이트웨이 서비스도 표면화합니다 (`--deep`은 시스템 수준 스캔을 추가). 프로파일 명명된 OpenClaw 서비스는 1급으로 처리되며 "추가"로 표시되지 않습니다.
- `gateway status`는 로컬 CLI 구성이 누락되거나 유효하지 않더라도 진단을 위해 사용 가능합니다.
- `gateway status`는 확인된 파일 로그 경로, CLI 대 서비스 구성 경로/유효성 스냅샷, 확인된 프로브 대상 URL을 출력합니다.
- 현재 명령 경로에서 게이트웨이 인증 SecretRef가 확인되지 않은 경우 `gateway status --json`은 프로브 연결/인증이 실패할 때만 `rpc.authWarning`을 보고합니다 (프로브가 성공하면 경고가 억제됨).
- Linux systemd 설치에서 상태 토큰 드리프트 확인은 `Environment=`와 `EnvironmentFile=` 유닛 소스 모두를 포함합니다.
- `gateway install|uninstall|start|stop|restart`는 스크립팅을 위해 `--json`을 지원합니다 (기본 출력은 사람 친화적으로 유지됨).
- `gateway install`은 기본값이 Node 런타임입니다; bun은 **권장되지 않습니다** (WhatsApp/Telegram 버그).
- `gateway install` 옵션: `--port`, `--runtime`, `--token`, `--force`, `--json`.

### `daemon`

게이트웨이 서비스 관리 명령의 레거시 별칭. [/cli/daemon](/cli/daemon) 참조.

하위 명령:

- `daemon status`
- `daemon install`
- `daemon uninstall`
- `daemon start`
- `daemon stop`
- `daemon restart`

공통 옵션:

- `status`: `--url`, `--token`, `--password`, `--timeout`, `--no-probe`, `--require-rpc`, `--deep`, `--json`
- `install`: `--port`, `--runtime <node|bun>`, `--token`, `--force`, `--json`
- `uninstall|start|stop|restart`: `--json`

### `logs`

RPC를 통해 Gateway 파일 로그를 테일링합니다.

옵션:

- `--limit <n>`: 반환할 최대 로그 라인 수
- `--max-bytes <n>`: 로그 파일에서 읽을 최대 바이트
- `--follow`: 로그 파일 팔로우 (tail -f 스타일)
- `--interval <ms>`: 팔로우 중 폴링 간격 (밀리초)
- `--local-time`: 로컬 시간으로 타임스탬프 표시
- `--json`: 라인 구분 JSON 출력
- `--plain`: 구조화된 형식 비활성화
- `--no-color`: ANSI 색상 비활성화
- `--url <url>`: 명시적 Gateway WebSocket URL
- `--token <token>`: Gateway 토큰
- `--timeout <ms>`: Gateway RPC 타임아웃
- `--expect-final`: 필요할 때 최종 응답 대기

예시:

```bash
openclaw logs --follow
openclaw logs --limit 200
openclaw logs --plain
openclaw logs --json
openclaw logs --no-color
```

참고사항:

- `--url`을 전달하면 CLI는 구성 또는 환경 자격 증명을 자동 적용하지 않습니다.
- 로컬 루프백 페어링 실패는 구성된 로컬 로그 파일로 폴백합니다; 명시적 `--url` 대상은 그렇지 않습니다.

### `gateway <subcommand>`

Gateway CLI 도우미 (RPC 하위 명령에는 `--url`, `--token`, `--password`, `--timeout`, `--expect-final` 사용).
`--url`을 전달하면 CLI는 구성 또는 환경 자격 증명을 자동 적용하지 않습니다.
`--token` 또는 `--password`를 명시적으로 포함하세요. 명시적 자격 증명이 누락된 것은 오류입니다.

하위 명령:

- `gateway call <method> [--params <json>] [--url <url>] [--token <token>] [--password <password>] [--timeout <ms>] [--expect-final] [--json]`
- `gateway health`
- `gateway status`
- `gateway probe`
- `gateway discover`
- `gateway install|uninstall|start|stop|restart`
- `gateway run`

참고사항:

- `gateway status --deep`은 시스템 수준 서비스 스캔을 추가합니다. 더 깊은 런타임 프로브 세부 정보에는 `gateway probe`, `health --verbose`, 또는 최상위 `status --deep`을 사용하세요.

일반적인 RPC:

- `config.schema.lookup` (얕은 스키마 노드, 일치된 힌트 메타데이터, 즉각적인 자식 요약으로 하나의 구성 하위 트리를 검사)
- `config.get` (현재 구성 스냅샷 + 해시 읽기)
- `config.set` (유효성 검사 + 전체 구성 쓰기; 낙관적 동시성을 위해 `baseHash` 사용)
- `config.apply` (유효성 검사 + 구성 쓰기 + 재시작 + 웨이크)
- `config.patch` (부분 업데이트 병합 + 재시작 + 웨이크)
- `update.run` (업데이트 실행 + 재시작 + 웨이크)

팁: `config.set`/`config.apply`/`config.patch`를 직접 호출할 때 구성이 이미 있으면 `config.get`에서 `baseHash`를 전달하세요.
팁: 부분 편집의 경우 먼저 `config.schema.lookup`으로 검사하고 `config.patch`를 선호하세요.
팁: 이러한 구성 쓰기 RPC는 제출된 구성 페이로드의 참조에 대한 활성 SecretRef 확인을 사전 검사하고 효과적으로 활성인 제출된 참조가 확인되지 않으면 쓰기를 거부합니다.
팁: 소유자 전용 `gateway` 런타임 툴은 여전히 `tools.exec.ask` 또는 `tools.exec.security`를 다시 쓰는 것을 거부합니다; 레거시 `tools.bash.*` 별칭은 동일하게 보호된 exec 경로로 정규화됩니다.

## 모델

폴백 동작 및 스캔 전략은 [/concepts/models](/concepts/models)를 참조하세요.

Anthropic 참고: Anthropic 직원들이 OpenClaw 스타일 Claude CLI 사용이 다시 허용된다고 알려줬으므로 OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 이 통합에 대해 Claude CLI 재사용 및 `claude -p` 사용을 허가된 것으로 처리합니다. 프로덕션의 경우 Anthropic API 키 또는 OpenAI Codex, Alibaba Cloud Model Studio 코딩 플랜, MiniMax 코딩 플랜, Z.AI / GLM 코딩 플랜과 같은 지원되는 구독 스타일 프로바이더를 선호하세요.

Anthropic setup-token은 지원되는 토큰 인증 경로로 남아 있지만, OpenClaw는 이제 가능한 경우 Claude CLI 재사용 및 `claude -p`를 선호합니다.

### `models` (루트)

`openclaw models`는 `models status`의 별칭입니다.

루트 옵션:

- `--status-json` (`models status --json`의 별칭)
- `--status-plain` (`models status --plain`의 별칭)

### `models list`

옵션:

- `--all`
- `--local`
- `--provider <name>`
- `--json`
- `--plain`

### `models status`

옵션:

- `--json`
- `--plain`
- `--check` (exit 1=만료됨/없음, 2=만료 예정)
- `--probe` (구성된 인증 프로파일의 라이브 프로브)
- `--probe-provider <name>`
- `--probe-profile <id>` (반복 또는 쉼표로 구분)
- `--probe-timeout <ms>`
- `--probe-concurrency <n>`
- `--probe-max-tokens <n>`
- `--agent <id>`

인증 저장소의 프로파일에 대한 인증 개요 및 OAuth 만료 상태를 항상 포함합니다.
`--probe`는 라이브 요청을 실행합니다 (토큰을 소비하고 속도 제한을 트리거할 수 있음).
프로브 행은 인증 프로파일, 환경 자격 증명, 또는 `models.json`에서 가져올 수 있습니다.
`ok`, `auth`, `rate_limit`, `billing`, `timeout`, `format`, `unknown`, `no_model` 같은 프로브 상태를 예상하세요.
명시적 `auth.order.<provider>`가 저장된 프로파일을 생략하면 프로브는 해당 프로파일을 자동으로 시도하는 대신 `excluded_by_auth_order`를 보고합니다.

### `models set <model>`

`agents.defaults.model.primary`를 설정합니다.

### `models set-image <model>`

`agents.defaults.imageModel.primary`를 설정합니다.

### `models aliases list|add|remove`

옵션:

- `list`: `--json`, `--plain`
- `add <alias> <model>`
- `remove <alias>`

### `models fallbacks list|add|remove|clear`

옵션:

- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models image-fallbacks list|add|remove|clear`

옵션:

- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models scan`

옵션:

- `--min-params <b>`
- `--max-age-days <days>`
- `--provider <name>`
- `--max-candidates <n>`
- `--timeout <ms>`
- `--concurrency <n>`
- `--no-probe`
- `--yes`
- `--no-input`
- `--set-default`
- `--set-image`
- `--json`

### `models auth add|login|login-github-copilot|setup-token|paste-token`

옵션:

- `add`: 인터랙티브 인증 도우미 (프로바이더 인증 흐름 또는 토큰 붙여넣기)
- `login`: `--provider <name>`, `--method <method>`, `--set-default`
- `login-github-copilot`: GitHub Copilot OAuth 로그인 흐름 (`--yes`)
- `setup-token`: `--provider <name>`, `--yes`
- `paste-token`: `--provider <name>`, `--profile-id <id>`, `--expires-in <duration>`

참고사항:

- `setup-token`과 `paste-token`은 토큰 인증 방법을 노출하는 프로바이더를 위한 일반 토큰 명령입니다.
- `setup-token`은 인터랙티브 TTY가 필요하며 프로바이더의 토큰 인증 방법을 실행합니다.
- `paste-token`은 토큰 값을 프롬프트하고 `--profile-id`가 생략되면 기본 인증 프로파일 id `<provider>:manual`을 사용합니다.
- Anthropic `setup-token` / `paste-token`은 지원되는 OpenClaw 토큰 경로로 남아 있지만, OpenClaw는 이제 가능한 경우 Claude CLI 재사용 및 `claude -p`를 선호합니다.

### `models auth order get|set|clear`

옵션:

- `get`: `--provider <name>`, `--agent <id>`, `--json`
- `set`: `--provider <name>`, `--agent <id>`, `<profileIds...>`
- `clear`: `--provider <name>`, `--agent <id>`

## 시스템

### `system event`

시스템 이벤트를 큐에 추가하고 선택적으로 하트비트를 트리거합니다 (Gateway RPC).

필수:

- `--text <text>`

옵션:

- `--mode <now|next-heartbeat>`
- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

### `system heartbeat last|enable|disable`

하트비트 제어 (Gateway RPC).

옵션:

- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

### `system presence`

시스템 프레즌스 항목을 나열합니다 (Gateway RPC).

옵션:

- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

## 크론

예약된 작업을 관리합니다 (Gateway RPC). [/automation/cron-jobs](/automation/cron-jobs) 참조.

하위 명령:

- `cron status [--json]`
- `cron list [--all] [--json]` (기본적으로 테이블 출력; 원시 데이터에는 `--json` 사용)
- `cron add` (별칭: `create`; `--name`과 `--at` | `--every` | `--cron` 중 정확히 하나, 그리고 `--system-event` | `--message` 중 정확히 하나의 페이로드 필요)
- `cron edit <id>` (필드 패치)
- `cron rm <id>` (별칭: `remove`, `delete`)
- `cron enable <id>`
- `cron disable <id>`
- `cron runs --id <id> [--limit <n>]`
- `cron run <id> [--due]`

모든 `cron` 명령은 `--url`, `--token`, `--timeout`, `--expect-final`을 허용합니다.

`cron add|edit --model ...`은 해당 선택된 허용 모델을 작업에 사용합니다. 모델이 허용되지 않으면 크론은 경고하고 작업의 에이전트/기본 모델 선택으로 폴백합니다. 구성된 폴백 체인은 여전히 적용되지만, 명시적 작업별 폴백 목록 없는 일반 모델 재정의는 더 이상 에이전트 기본값을 숨겨진 추가 재시도 대상으로 추가하지 않습니다.

## 노드 호스트

### `node`

`node`는 **헤드리스 노드 호스트**를 실행하거나 백그라운드 서비스로 관리합니다. [`openclaw node`](/cli/node) 참조.

하위 명령:

- `node run --host <gateway-host> --port 18789`
- `node status`
- `node install [--host <gateway-host>] [--port <port>] [--tls] [--tls-fingerprint <sha256>] [--node-id <id>] [--display-name <name>] [--runtime <node|bun>] [--force]`
- `node uninstall`
- `node stop`
- `node restart`

인증 참고:

- `node`는 환경/구성에서 게이트웨이 인증을 확인합니다 (`--token`/`--password` 플래그 없음): `OPENCLAW_GATEWAY_TOKEN` / `OPENCLAW_GATEWAY_PASSWORD`, 그런 다음 `gateway.auth.*`. 로컬 모드에서 노드 호스트는 의도적으로 `gateway.remote.*`를 무시합니다; `gateway.mode=remote`에서 `gateway.remote.*`는 원격 우선순위 규칙에 따라 참여합니다.
- 노드 호스트 인증 확인은 `OPENCLAW_GATEWAY_*` 환경 변수만 허용합니다.

## 노드

`nodes`는 Gateway와 통신하고 페어링된 노드를 대상으로 합니다. [/nodes](/nodes) 참조.

공통 옵션:

- `--url`, `--token`, `--timeout`, `--json`

하위 명령:

- `nodes status [--connected] [--last-connected <duration>]`
- `nodes describe --node <id|name|ip>`
- `nodes list [--connected] [--last-connected <duration>]`
- `nodes pending`
- `nodes approve <requestId>`
- `nodes reject <requestId>`
- `nodes rename --node <id|name|ip> --name <displayName>`
- `nodes invoke --node <id|name|ip> --command <command> [--params <json>] [--invoke-timeout <ms>] [--idempotency-key <key>]`
- `nodes notify --node <id|name|ip> [--title <text>] [--body <text>] [--sound <name>] [--priority <passive|active|timeSensitive>] [--delivery <system|overlay|auto>] [--invoke-timeout <ms>]` (mac 전용)

카메라:

- `nodes camera list --node <id|name|ip>`
- `nodes camera snap --node <id|name|ip> [--facing front|back|both] [--device-id <id>] [--max-width <px>] [--quality <0-1>] [--delay-ms <ms>] [--invoke-timeout <ms>]`
- `nodes camera clip --node <id|name|ip> [--facing front|back] [--device-id <id>] [--duration <ms|10s|1m>] [--no-audio] [--invoke-timeout <ms>]`

캔버스 + 화면:

- `nodes canvas snapshot --node <id|name|ip> [--format png|jpg|jpeg] [--max-width <px>] [--quality <0-1>] [--invoke-timeout <ms>]`
- `nodes canvas present --node <id|name|ip> [--target <urlOrPath>] [--x <px>] [--y <px>] [--width <px>] [--height <px>] [--invoke-timeout <ms>]`
- `nodes canvas hide --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas navigate <url> --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas eval [<js>] --node <id|name|ip> [--js <code>] [--invoke-timeout <ms>]`
- `nodes canvas a2ui push --node <id|name|ip> (--jsonl <path> | --text <text>) [--invoke-timeout <ms>]`
- `nodes canvas a2ui reset --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes screen record --node <id|name|ip> [--screen <index>] [--duration <ms|10s>] [--fps <n>] [--no-audio] [--out <path>] [--invoke-timeout <ms>]`

위치:

- `nodes location get --node <id|name|ip> [--max-age <ms>] [--accuracy <coarse|balanced|precise>] [--location-timeout <ms>] [--invoke-timeout <ms>]`

## 브라우저

브라우저 제어 CLI (전용 Chrome/Brave/Edge/Chromium). [`openclaw browser`](/cli/browser) 및 [브라우저 툴](/tools/browser) 참조.

공통 옵션:

- `--url`, `--token`, `--timeout`, `--expect-final`, `--json`
- `--browser-profile <name>`

관리:

- `browser status`
- `browser start`
- `browser stop`
- `browser reset-profile`
- `browser tabs`
- `browser open <url>`
- `browser focus <targetId>`
- `browser close [targetId]`
- `browser profiles`
- `browser create-profile --name <name> [--color <hex>] [--cdp-url <url>] [--driver existing-session] [--user-data-dir <path>]`
- `browser delete-profile --name <name>`

검사:

- `browser screenshot [targetId] [--full-page] [--ref <ref>] [--element <selector>] [--type png|jpeg]`
- `browser snapshot [--format aria|ai] [--target-id <id>] [--limit <n>] [--interactive] [--compact] [--depth <n>] [--selector <sel>] [--out <path>]`

액션:

- `browser navigate <url> [--target-id <id>]`
- `browser resize <width> <height> [--target-id <id>]`
- `browser click <ref> [--double] [--button <left|right|middle>] [--modifiers <csv>] [--target-id <id>]`
- `browser type <ref> <text> [--submit] [--slowly] [--target-id <id>]`
- `browser press <key> [--target-id <id>]`
- `browser hover <ref> [--target-id <id>]`
- `browser drag <startRef> <endRef> [--target-id <id>]`
- `browser select <ref> <values...> [--target-id <id>]`
- `browser upload <paths...> [--ref <ref>] [--input-ref <ref>] [--element <selector>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser fill [--fields <json>] [--fields-file <path>] [--target-id <id>]`
- `browser dialog --accept|--dismiss [--prompt <text>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser wait [--time <ms>] [--text <value>] [--text-gone <value>] [--target-id <id>]`
- `browser evaluate --fn <code> [--ref <ref>] [--target-id <id>]`
- `browser console [--level <error|warn|info>] [--target-id <id>]`
- `browser pdf [--target-id <id>]`

## 음성 통화

### `voicecall`

플러그인 제공 음성 통화 유틸리티. 음성 통화 플러그인이 설치되고 활성화된 경우에만 나타납니다. [`openclaw voicecall`](/cli/voicecall) 참조.

일반 명령:

- `voicecall call --to <phone> --message <text> [--mode notify|conversation]`
- `voicecall start --to <phone> [--message <text>] [--mode notify|conversation]`
- `voicecall continue --call-id <id> --message <text>`
- `voicecall speak --call-id <id> --message <text>`
- `voicecall end --call-id <id>`
- `voicecall status --call-id <id>`
- `voicecall tail [--file <path>] [--since <n>] [--poll <ms>]`
- `voicecall latency [--file <path>] [--last <n>]`
- `voicecall expose [--mode off|serve|funnel] [--path <path>] [--port <port>] [--serve-path <path>]`

## 문서 검색

### `docs`

라이브 OpenClaw 문서 인덱스를 검색합니다.

### `docs [query...]`

라이브 문서 인덱스를 검색합니다.

## TUI

### `tui`

Gateway에 연결된 터미널 UI를 엽니다.

옵션:

- `--url <url>`
- `--token <token>`
- `--password <password>`
- `--session <key>`
- `--deliver`
- `--thinking <level>`
- `--message <text>`
- `--timeout-ms <ms>` (기본값은 `agents.defaults.timeoutSeconds`)
- `--history-limit <n>`
