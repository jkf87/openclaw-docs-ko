---
title: "directory"
description: "`openclaw directory`에 대한 CLI 참조 (self, peers, groups)"
---

# `openclaw directory`

지원하는 채널에 대한 디렉터리 조회 (연락처/피어, 그룹, "me").

## 공통 플래그

- `--channel &lt;name&gt;`: 채널 id/별칭 (여러 채널이 구성된 경우 필수; 하나만 구성된 경우 자동)
- `--account &lt;id&gt;`: 계정 id (기본값: 채널 기본)
- `--json`: JSON 출력

## 참고사항

- `directory`는 다른 명령 (특히 `openclaw message send --target ...`)에 붙여 넣을 수 있는 ID를 찾는 데 도움을 주기 위한 것입니다.
- 많은 채널의 경우 결과는 라이브 프로바이더 디렉터리가 아닌 구성 기반 (허용 목록 / 구성된 그룹)입니다.
- 기본 출력은 탭으로 구분된 `id` (및 때로는 `name`)입니다. 스크립팅에는 `--json`을 사용하세요.

## `message send`와 함께 결과 사용

```bash
openclaw directory peers list --channel slack --query "U0"
openclaw message send --channel slack --target user:U012ABCDEF --message "hello"
```

## ID 형식 (채널별)

- WhatsApp: `+15551234567` (DM), `1234567890-1234567890@g.us` (그룹)
- Telegram: `@username` 또는 숫자 채팅 id; 그룹은 숫자 id
- Slack: `user:U…` 및 `channel:C…`
- Discord: `user:&lt;id&gt;` 및 `channel:&lt;id&gt;`
- Matrix (플러그인): `user:@user:server`, `room:!roomId:server`, 또는 `#alias:server`
- Microsoft Teams (플러그인): `user:&lt;id&gt;` 및 `conversation:&lt;id&gt;`
- Zalo (플러그인): 사용자 id (Bot API)
- Zalo Personal / `zalouser` (플러그인): `zca`의 스레드 id (DM/그룹) (`me`, `friend list`, `group list`)

## 자신 ("me")

```bash
openclaw directory self --channel zalouser
```

## 피어 (연락처/사용자)

```bash
openclaw directory peers list --channel zalouser
openclaw directory peers list --channel zalouser --query "name"
openclaw directory peers list --channel zalouser --limit 50
```

## 그룹

```bash
openclaw directory groups list --channel zalouser
openclaw directory groups list --channel zalouser --query "work"
openclaw directory groups members --channel zalouser --group-id &lt;id&gt;
```
