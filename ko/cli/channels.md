---
summary: "`openclaw channels`에 대한 CLI 참조 (계정, 상태, 로그인/로그아웃, 로그)"
read_when:
  - 채널 계정을 추가/제거하려는 경우 (WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost (플러그인)/Signal/iMessage/Matrix)
  - 채널 상태를 확인하거나 채널 로그를 추적하려는 경우
title: "channels"
---

# `openclaw channels`

Gateway에서 채팅 채널 계정과 런타임 상태를 관리합니다.

관련 문서:

- 채널 가이드: [채널](/channels/)
- Gateway 구성: [구성](/gateway/configuration)

## 일반 명령

```bash
openclaw channels list
openclaw channels status
openclaw channels capabilities
openclaw channels capabilities --channel discord --target channel:123
openclaw channels resolve --channel slack "#general" "@jane"
openclaw channels logs --channel all
```

## 상태 / 기능 / 확인 / 로그

- `channels status`: `--probe`, `--timeout <ms>`, `--json`
- `channels capabilities`: `--channel <name>`, `--account <id>` (`--channel`과만 사용), `--target <dest>`, `--timeout <ms>`, `--json`
- `channels resolve`: `<entries...>`, `--channel <name>`, `--account <id>`, `--kind <auto|user|group>`, `--json`
- `channels logs`: `--channel <name|all>`, `--lines <n>`, `--json`

`channels status --probe`는 라이브 경로입니다: 도달 가능한 게이트웨이에서 계정별 `probeAccount` 및 선택적 `auditAccount` 검사를 실행하므로 출력에 전송 상태와 `works`, `probe failed`, `audit ok`, `audit failed`와 같은 프로브 결과가 포함될 수 있습니다. 게이트웨이에 연결할 수 없는 경우 `channels status`는 라이브 프로브 출력 대신 구성 전용 요약으로 폴백합니다.

## 계정 추가 / 제거

```bash
openclaw channels add --channel telegram --token <bot-token>
openclaw channels add --channel nostr --private-key "$NOSTR_PRIVATE_KEY"
openclaw channels remove --channel telegram --delete
```

팁: `openclaw channels add --help`는 채널별 플래그 (토큰, 개인 키, 앱 토큰, signal-cli 경로 등)를 표시합니다.

일반적인 비대화형 추가 표면에는 다음이 포함됩니다:

- 봇 토큰 채널: `--token`, `--bot-token`, `--app-token`, `--token-file`
- Signal/iMessage 전송 필드: `--signal-number`, `--cli-path`, `--http-url`, `--http-host`, `--http-port`, `--db-path`, `--service`, `--region`
- Google Chat 필드: `--webhook-path`, `--webhook-url`, `--audience-type`, `--audience`
- Matrix 필드: `--homeserver`, `--user-id`, `--access-token`, `--password`, `--device-name`, `--initial-sync-limit`
- Nostr 필드: `--private-key`, `--relay-urls`
- Tlon 필드: `--ship`, `--url`, `--code`, `--group-channels`, `--dm-allowlist`, `--auto-discover-channels`
- 지원되는 경우 기본 계정 env 기반 인증에는 `--use-env`

플래그 없이 `openclaw channels add`를 실행하면 대화형 마법사가 다음을 프롬프트할 수 있습니다:

- 선택한 채널당 계정 id
- 해당 계정의 선택적 표시 이름
- `지금 구성된 채널 계정을 에이전트에 바인딩하시겠습니까?`

지금 바인딩을 확인하면 마법사는 각 구성된 채널 계정을 소유해야 하는 에이전트를 묻고 계정 범위 라우팅 바인딩을 씁니다.

나중에 `openclaw agents bindings`, `openclaw agents bind`, `openclaw agents unbind`로 동일한 라우팅 규칙을 관리할 수도 있습니다 ([agents](/cli/agents) 참조).

단일 계정 최상위 설정을 여전히 사용하는 채널에 비기본 계정을 추가하면 OpenClaw는 새 계정을 쓰기 전에 계정 범위 최상위 값을 채널의 계정 맵으로 승격합니다. 대부분의 채널은 해당 값을 `channels.<channel>.accounts.default`에 배치하지만 번들 채널은 기존 일치 승격 계정을 대신 보존할 수 있습니다. Matrix가 현재 예시입니다: 하나의 명명된 계정이 이미 존재하거나 `defaultAccount`가 기존 명명된 계정을 가리키는 경우 승격은 새 `accounts.default`를 생성하는 대신 해당 계정을 보존합니다.

라우팅 동작은 일관성을 유지합니다:

- 기존 채널 전용 바인딩 (`accountId` 없음)은 계속 기본 계정과 일치합니다.
- `channels add`는 비대화형 모드에서 바인딩을 자동 생성하거나 재작성하지 않습니다.
- 대화형 설정은 선택적으로 계정 범위 바인딩을 추가할 수 있습니다.

구성이 이미 혼합 상태 (명명된 계정이 있고 최상위 단일 계정 값이 여전히 설정됨)인 경우 `openclaw doctor --fix`를 실행하여 계정 범위 값을 해당 채널에 선택된 승격 계정으로 이동하세요. 대부분의 채널은 `accounts.default`로 승격합니다. Matrix는 기존 명명된/기본 대상을 대신 보존할 수 있습니다.

## 로그인 / 로그아웃 (대화형)

```bash
openclaw channels login --channel whatsapp
openclaw channels logout --channel whatsapp
```

참고사항:

- `channels login`은 `--verbose`를 지원합니다.
- `channels login` / `logout`은 지원되는 로그인 대상이 하나만 구성된 경우 채널을 유추할 수 있습니다.

## 문제 해결

- 광범위한 프로브를 위해 `openclaw status --deep`을 실행하세요.
- 안내된 수정을 위해 `openclaw doctor`를 사용하세요.
- `openclaw channels list`에 `Claude: HTTP 403 ... user:profile`이 표시되는 경우 → 사용 스냅샷에 `user:profile` 범위가 필요합니다. `--no-usage`를 사용하거나 claude.ai 세션 키 (`CLAUDE_WEB_SESSION_KEY` / `CLAUDE_WEB_COOKIE`)를 제공하거나 Claude CLI를 통해 재인증하세요.
- `openclaw channels status`는 게이트웨이에 연결할 수 없는 경우 구성 전용 요약으로 폴백합니다. 지원되는 채널 자격 증명이 SecretRef를 통해 구성되었지만 현재 명령 경로에서 사용할 수 없는 경우 해당 계정을 구성되지 않은 것으로 표시하는 대신 저하된 참고사항과 함께 구성된 것으로 보고합니다.

## 기능 프로브

인텐트/범위 (사용 가능한 경우)와 정적 기능 지원을 포함한 프로바이더 기능 힌트를 가져옵니다:

```bash
openclaw channels capabilities
openclaw channels capabilities --channel discord --target channel:123
```

참고사항:

- `--channel`은 선택 사항입니다. 모든 채널 (확장 포함)을 나열하려면 생략하세요.
- `--account`는 `--channel`과만 유효합니다.
- `--target`은 `channel:<id>` 또는 원시 숫자 채널 id를 허용하며 Discord에만 적용됩니다.
- 프로브는 프로바이더별: Discord 인텐트 + 선택적 채널 권한; Slack 봇 + 사용자 범위; Telegram 봇 플래그 + 웹훅; Signal 데몬 버전; Microsoft Teams 앱 토큰 + Graph 역할/범위 (알려진 경우 주석). 프로브가 없는 채널은 `Probe: unavailable`을 보고합니다.

## ID로 이름 확인

프로바이더 디렉터리를 사용하여 채널/사용자 이름을 ID로 확인합니다:

```bash
openclaw channels resolve --channel slack "#general" "@jane"
openclaw channels resolve --channel discord "My Server/#support" "@someone"
openclaw channels resolve --channel matrix "Project Room"
```

참고사항:

- `--kind user|group|auto`를 사용하여 대상 유형을 강제합니다.
- 여러 항목이 동일한 이름을 공유하는 경우 확인은 활성 일치를 선호합니다.
- `channels resolve`는 읽기 전용입니다. 선택된 계정이 SecretRef를 통해 구성되었지만 해당 자격 증명이 현재 명령 경로에서 사용할 수 없는 경우 전체 실행을 중단하는 대신 참고사항과 함께 저하된 미확인 결과를 반환합니다.
