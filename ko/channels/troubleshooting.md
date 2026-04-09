---
summary: "채널 수준의 빠른 문제 해결: 채널별 오류 유형 및 수정 방법"
read_when:
  - 채널 전송이 연결되었다고 표시되지만 응답이 실패하는 경우
  - 심층 프로바이더 문서 전에 채널별 검사가 필요한 경우
title: "채널 문제 해결"
---

# 채널 문제 해결

채널이 연결되었으나 동작이 잘못된 경우 이 페이지를 사용하십시오.

## 명령 사다리

먼저 다음 순서대로 실행하십시오:

```bash
openclaw status
openclaw gateway status
openclaw logs --follow
openclaw doctor
openclaw channels status --probe
```

정상 기준:

- `Runtime: running`
- `RPC probe: ok`
- 채널 프로브에서 전송 연결 표시, 지원되는 경우 `works` 또는 `audit ok`

## WhatsApp

### WhatsApp 오류 유형

| 증상                         | 가장 빠른 확인 방법                                  | 수정 방법                                                     |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 연결되었으나 DM 응답 없음    | `openclaw pairing list whatsapp`                     | 발신자를 승인하거나 DM 정책/허용 목록을 변경합니다.           |
| 그룹 메시지 무시됨           | 구성에서 `requireMention` + 언급 패턴 확인           | 봇을 언급하거나 해당 그룹의 언급 정책을 완화합니다.           |
| 무작위 연결 해제/재로그인 루프 | `openclaw channels status --probe` + 로그            | 재로그인하고 자격 증명 디렉토리 상태를 확인합니다.            |

전체 문제 해결: [/channels/whatsapp#troubleshooting](/channels/whatsapp#troubleshooting)

## Telegram

### Telegram 오류 유형

| 증상                             | 가장 빠른 확인 방법                                | 수정 방법                                                                          |
| -------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/start` 후 사용 가능한 응답 없음 | `openclaw pairing list telegram`                   | 페어링을 승인하거나 DM 정책을 변경합니다.                                          |
| 봇 온라인이지만 그룹 응답 없음   | 언급 요구 사항 및 봇 개인 정보 모드 확인           | 그룹 가시성을 위해 개인 정보 모드를 비활성화하거나 봇을 언급합니다.               |
| 네트워크 오류로 전송 실패        | Telegram API 호출 실패 로그 확인                   | `api.telegram.org`에 대한 DNS/IPv6/프록시 라우팅을 수정합니다.                    |
| 시작 시 `setMyCommands` 거부     | `BOT_COMMANDS_TOO_MUCH` 로그 확인                  | 플러그인/스킬/커스텀 Telegram 명령을 줄이거나 네이티브 메뉴를 비활성화합니다.     |
| 업그레이드 후 허용 목록이 차단함 | `openclaw security audit` 및 구성 허용 목록        | `openclaw doctor --fix` 실행 또는 `@username`을 숫자 발신자 ID로 교체합니다.      |

전체 문제 해결: [/channels/telegram#troubleshooting](/channels/telegram#troubleshooting)

## Discord

### Discord 오류 유형

| 증상                         | 가장 빠른 확인 방법                     | 수정 방법                                                         |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| 봇 온라인이지만 길드 응답 없음 | `openclaw channels status --probe`      | 길드/채널을 허용하고 메시지 콘텐츠 인텐트를 확인합니다.           |
| 그룹 메시지 무시됨            | 언급 게이팅 드롭 로그 확인              | 봇을 언급하거나 길드/채널에 `requireMention: false`를 설정합니다. |
| DM 응답 없음                 | `openclaw pairing list discord`         | DM 페어링을 승인하거나 DM 정책을 조정합니다.                      |

전체 문제 해결: [/channels/discord#troubleshooting](/channels/discord#troubleshooting)

## Slack

### Slack 오류 유형

| 증상                                   | 가장 빠른 확인 방법                       | 수정 방법                                                                                                                                                  |
| -------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 소켓 모드 연결되었으나 응답 없음       | `openclaw channels status --probe`        | 앱 토큰 + 봇 토큰 및 필수 범위 확인; SecretRef 기반 설정에서 `botTokenStatus` / `appTokenStatus = configured_unavailable` 여부 확인. |
| DM 차단됨                              | `openclaw pairing list slack`             | 페어링을 승인하거나 DM 정책을 완화합니다.                                                                                                                  |
| 채널 메시지 무시됨                     | `groupPolicy` 및 채널 허용 목록 확인      | 채널을 허용하거나 정책을 `open`으로 변경합니다.                                                                                                            |

전체 문제 해결: [/channels/slack#troubleshooting](/channels/slack#troubleshooting)

## iMessage 및 BlueBubbles

### iMessage 및 BlueBubbles 오류 유형

| 증상                              | 가장 빠른 확인 방법                                                     | 수정 방법                                                   |
| --------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| 인바운드 이벤트 없음              | 웹훅/서버 접근성 및 앱 권한 확인                                        | 웹훅 URL 또는 BlueBubbles 서버 상태를 수정합니다.           |
| 보낼 수 있지만 macOS에서 수신 없음 | Messages 자동화를 위한 macOS 개인 정보 권한 확인                        | TCC 권한을 재부여하고 채널 프로세스를 재시작합니다.         |
| DM 발신자 차단됨                  | `openclaw pairing list imessage` 또는 `openclaw pairing list bluebubbles` | 페어링을 승인하거나 허용 목록을 업데이트합니다.             |

전체 문제 해결:

- [/channels/imessage#troubleshooting](/channels/imessage#troubleshooting)
- [/channels/bluebubbles#troubleshooting](/channels/bluebubbles#troubleshooting)

## Signal

### Signal 오류 유형

| 증상                         | 가장 빠른 확인 방법                        | 수정 방법                                                        |
| ---------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| 데몬 접근 가능하지만 봇 응답 없음 | `openclaw channels status --probe`         | `signal-cli` 데몬 URL/계정 및 수신 모드를 확인합니다.           |
| DM 차단됨                    | `openclaw pairing list signal`             | 발신자를 승인하거나 DM 정책을 조정합니다.                       |
| 그룹 응답 미트리거            | 그룹 허용 목록 및 언급 패턴 확인           | 발신자/그룹을 추가하거나 게이팅을 완화합니다.                   |

전체 문제 해결: [/channels/signal#troubleshooting](/channels/signal#troubleshooting)

## QQ Bot

### QQ Bot 오류 유형

| 증상                         | 가장 빠른 확인 방법                         | 수정 방법                                                               |
| ---------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| 봇이 "gone to Mars" 응답     | 구성에서 `appId` 및 `clientSecret` 확인     | 자격 증명을 설정하거나 게이트웨이를 재시작합니다.                       |
| 인바운드 메시지 없음         | `openclaw channels status --probe`          | QQ 오픈 플랫폼에서 자격 증명을 확인합니다.                              |
| 음성 트랜스크립트 없음       | STT 프로바이더 구성 확인                    | `channels.qqbot.stt` 또는 `tools.media.audio`를 구성합니다.            |
| 프로액티브 메시지 미도착     | QQ 플랫폼 상호 작용 요구 사항 확인          | QQ는 최근 상호 작용 없이 봇이 시작한 메시지를 차단할 수 있습니다.      |

전체 문제 해결: [/channels/qqbot#troubleshooting](/channels/qqbot#troubleshooting)

## Matrix

### Matrix 오류 유형

| 증상                              | 가장 빠른 확인 방법                        | 수정 방법                                                                         |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| 로그인됐으나 방 메시지 무시됨     | `openclaw channels status --probe`         | `groupPolicy`, 방 허용 목록, 언급 게이팅을 확인합니다.                           |
| DM 처리 안 됨                    | `openclaw pairing list matrix`             | 발신자를 승인하거나 DM 정책을 조정합니다.                                        |
| 암호화된 방 실패                 | `openclaw matrix verify status`            | 디바이스를 재확인한 다음 `openclaw matrix verify backup status`를 확인합니다.    |
| 백업 복원 대기 중/손상됨         | `openclaw matrix verify backup status`     | `openclaw matrix verify backup restore` 실행 또는 복구 키로 재실행합니다.        |
| 크로스 서명/부트스트랩 상태 잘못됨 | `openclaw matrix verify bootstrap`         | 비밀 저장소, 크로스 서명 및 백업 상태를 한 번에 복구합니다.                      |

전체 설정 및 구성: [Matrix](/channels/matrix)
