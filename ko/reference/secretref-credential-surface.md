---
summary: "지원되는 SecretRef 자격 증명 서페이스와 지원되지 않는 서페이스의 표준 정의"
read_when:
  - SecretRef 자격 증명 커버리지 확인 시
  - 자격 증명이 `secrets configure` 또는 `secrets apply`에 적합한지 감사 시
  - 자격 증명이 지원 서페이스 밖에 있는 이유 확인 시
title: "SecretRef 자격 증명 서페이스"
---

# SecretRef 자격 증명 서페이스

이 페이지는 표준 SecretRef 자격 증명 서페이스를 정의합니다.

범위 의도:

- 범위 내: OpenClaw가 발급하거나 교체하지 않는 순수 사용자 제공 자격 증명.
- 범위 외: 런타임 발급 또는 교체 자격 증명, OAuth 새로 고침 자료, 세션 유사 아티팩트.

## 지원되는 자격 증명

### `openclaw.json` 대상 (`secrets configure` + `secrets apply` + `secrets audit`)

[//]: # "secretref-supported-list-start"

- `models.providers.*.apiKey`
- `models.providers.*.headers.*`
- `models.providers.*.request.auth.token`
- `models.providers.*.request.auth.value`
- `models.providers.*.request.headers.*`
- `models.providers.*.request.proxy.tls.ca`
- `models.providers.*.request.proxy.tls.cert`
- `models.providers.*.request.proxy.tls.key`
- `models.providers.*.request.proxy.tls.passphrase`
- `models.providers.*.request.tls.ca`
- `models.providers.*.request.tls.cert`
- `models.providers.*.request.tls.key`
- `models.providers.*.request.tls.passphrase`
- `skills.entries.*.apiKey`
- `agents.defaults.memorySearch.remote.apiKey`
- `agents.list[].memorySearch.remote.apiKey`
- `talk.providers.*.apiKey`
- `messages.tts.providers.*.apiKey`
- `tools.web.fetch.firecrawl.apiKey`
- `plugins.entries.brave.config.webSearch.apiKey`
- `plugins.entries.google.config.webSearch.apiKey`
- `plugins.entries.xai.config.webSearch.apiKey`
- `plugins.entries.moonshot.config.webSearch.apiKey`
- `plugins.entries.perplexity.config.webSearch.apiKey`
- `plugins.entries.firecrawl.config.webSearch.apiKey`
- `plugins.entries.minimax.config.webSearch.apiKey`
- `plugins.entries.tavily.config.webSearch.apiKey`
- `tools.web.search.apiKey`
- `gateway.auth.password`
- `gateway.auth.token`
- `gateway.remote.token`
- `gateway.remote.password`
- `cron.webhookToken`
- `channels.telegram.botToken`
- `channels.telegram.webhookSecret`
- `channels.telegram.accounts.*.botToken`
- `channels.telegram.accounts.*.webhookSecret`
- `channels.slack.botToken`
- `channels.slack.appToken`
- `channels.slack.userToken`
- `channels.slack.signingSecret`
- `channels.slack.accounts.*.botToken`
- `channels.slack.accounts.*.appToken`
- `channels.slack.accounts.*.userToken`
- `channels.slack.accounts.*.signingSecret`
- `channels.discord.token`
- `channels.discord.pluralkit.token`
- `channels.discord.voice.tts.providers.*.apiKey`
- `channels.discord.accounts.*.token`
- `channels.discord.accounts.*.pluralkit.token`
- `channels.discord.accounts.*.voice.tts.providers.*.apiKey`
- `channels.irc.password`
- `channels.irc.nickserv.password`
- `channels.irc.accounts.*.password`
- `channels.irc.accounts.*.nickserv.password`
- `channels.bluebubbles.password`
- `channels.bluebubbles.accounts.*.password`
- `channels.feishu.appSecret`
- `channels.feishu.encryptKey`
- `channels.feishu.verificationToken`
- `channels.feishu.accounts.*.appSecret`
- `channels.feishu.accounts.*.encryptKey`
- `channels.feishu.accounts.*.verificationToken`
- `channels.msteams.appPassword`
- `channels.mattermost.botToken`
- `channels.mattermost.accounts.*.botToken`
- `channels.matrix.accessToken`
- `channels.matrix.password`
- `channels.matrix.accounts.*.accessToken`
- `channels.matrix.accounts.*.password`
- `channels.nextcloud-talk.botSecret`
- `channels.nextcloud-talk.apiPassword`
- `channels.nextcloud-talk.accounts.*.botSecret`
- `channels.nextcloud-talk.accounts.*.apiPassword`
- `channels.zalo.botToken`
- `channels.zalo.webhookSecret`
- `channels.zalo.accounts.*.botToken`
- `channels.zalo.accounts.*.webhookSecret`
- `channels.googlechat.serviceAccount` 형제 `serviceAccountRef`를 통해 (호환성 예외)
- `channels.googlechat.accounts.*.serviceAccount` 형제 `serviceAccountRef`를 통해 (호환성 예외)

### `auth-profiles.json` 대상 (`secrets configure` + `secrets apply` + `secrets audit`)

- `profiles.*.keyRef` (`type: "api_key"`; `auth.profiles.<id>.mode = "oauth"`인 경우 미지원)
- `profiles.*.tokenRef` (`type: "token"`; `auth.profiles.<id>.mode = "oauth"`인 경우 미지원)

[//]: # "secretref-supported-list-end"

메모:

- 인증 프로파일 계획 대상에는 `agentId`가 필요합니다.
- 계획 항목은 `profiles.*.key` / `profiles.*.token`을 대상으로 하고 형제 참조 (`keyRef` / `tokenRef`)를 씁니다.
- 인증 프로파일 참조는 런타임 확인 및 감사 커버리지에 포함됩니다.
- OAuth 정책 가드: `auth.profiles.<id>.mode = "oauth"`는 해당 프로파일의 SecretRef 입력과 결합할 수 없습니다. 이 정책이 위반되면 시작/재로드 및 인증 프로파일 확인이 빠르게 실패합니다.
- SecretRef 관리 모델 프로바이더의 경우 생성된 `agents/*/agent/models.json` 항목은 `apiKey`/헤더 서페이스에 대해 (확인된 시크릿 값이 아닌) 비시크릿 마커를 유지합니다.
- 마커 지속성은 소스 권한입니다: OpenClaw는 활성 소스 구성 스냅샷(사전 확인)에서 마커를 씁니다. 확인된 런타임 시크릿 값에서 쓰지 않습니다.
- 웹 검색의 경우:
  - 명시적 프로바이더 모드 (`tools.web.search.provider` 설정됨)에서는 선택된 프로바이더 키만 활성화됩니다.
  - 자동 모드 (`tools.web.search.provider` 설정되지 않음)에서는 우선순위로 확인되는 첫 번째 프로바이더 키만 활성화됩니다.
  - 자동 모드에서 선택되지 않은 프로바이더 참조는 선택될 때까지 비활성으로 취급됩니다.
  - 레거시 `tools.web.search.*` 프로바이더 경로는 호환성 창 동안 여전히 확인되지만 표준 SecretRef 서페이스는 `plugins.entries.<plugin>.config.webSearch.*`입니다.

## 지원되지 않는 자격 증명

범위 외 자격 증명은 다음을 포함합니다:

[//]: # "secretref-unsupported-list-start"

- `commands.ownerDisplaySecret`
- `hooks.token`
- `hooks.gmail.pushToken`
- `hooks.mappings[].sessionKey`
- `auth-profiles.oauth.*`
- `channels.discord.threadBindings.webhookToken`
- `channels.discord.accounts.*.threadBindings.webhookToken`
- `channels.whatsapp.creds.json`
- `channels.whatsapp.accounts.*.creds.json`

[//]: # "secretref-unsupported-list-end"

근거:

- 이 자격 증명은 읽기 전용 외부 SecretRef 확인에 맞지 않는 발급, 교체, 세션 보유, 또는 OAuth 내구성 클래스입니다.
