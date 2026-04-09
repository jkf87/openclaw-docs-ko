---
summary: "`openclaw pairing`에 대한 CLI 참조 (페어링 요청 승인/목록)"
read_when:
  - 페어링 모드 DM을 사용하고 발신자를 승인해야 하는 경우
title: "pairing"
---

# `openclaw pairing`

DM 페어링 요청을 승인하거나 검사합니다 (페어링을 지원하는 채널의 경우).

관련:

- 페어링 흐름: [페어링](/channels/pairing)

## 명령

```bash
openclaw pairing list telegram
openclaw pairing list --channel telegram --account work
openclaw pairing list telegram --json

openclaw pairing approve <code>
openclaw pairing approve telegram <code>
openclaw pairing approve --channel telegram --account work <code> --notify
```

## `pairing list`

하나의 채널에 대한 보류 중인 페어링 요청을 나열합니다.

옵션:

- `[channel]`: 위치 채널 id
- `--channel <channel>`: 명시적 채널 id
- `--account <accountId>`: 멀티 계정 채널을 위한 계정 id
- `--json`: 기계 판독 가능한 출력

참고사항:

- 여러 페어링 가능한 채널이 구성된 경우 위치 인자 또는 `--channel`을 통해 채널을 제공해야 합니다.
- 채널 id가 유효한 한 확장 채널이 허용됩니다.

## `pairing approve`

보류 중인 페어링 코드를 승인하고 해당 발신자를 허용합니다.

사용법:

- `openclaw pairing approve <channel> <code>`
- `openclaw pairing approve --channel <channel> <code>`
- 정확히 하나의 페어링 가능한 채널이 구성된 경우 `openclaw pairing approve <code>`

옵션:

- `--channel <channel>`: 명시적 채널 id
- `--account <accountId>`: 멀티 계정 채널을 위한 계정 id
- `--notify`: 요청자에게 동일한 채널로 확인 전송

## 참고사항

- 채널 입력: 위치 인자로 전달하거나 (`pairing list telegram`) `--channel <channel>`을 사용하세요.
- `pairing list`는 멀티 계정 채널을 위해 `--account <accountId>`를 지원합니다.
- `pairing approve`는 `--account <accountId>` 및 `--notify`를 지원합니다.
- 페어링 가능한 채널이 하나만 구성된 경우 `pairing approve <code>`가 허용됩니다.
