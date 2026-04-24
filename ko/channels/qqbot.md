---
summary: "QQ Bot 설정, 구성 및 사용법"
read_when:
  - OpenClaw를 QQ에 연결하려는 경우
  - QQ Bot 자격 증명 설정이 필요한 경우
  - QQ Bot 그룹 또는 개인 채팅 지원이 필요한 경우
title: QQ bot
---

QQ Bot은 공식 QQ Bot API(WebSocket 게이트웨이)를 통해 OpenClaw에 연결됩니다.
플러그인은 C2C 개인 채팅, 그룹 @메시지, 길드 채널 메시지를 지원하며
리치 미디어(이미지, 음성, 비디오, 파일)를 포함합니다.

상태: 번들 플러그인. 다이렉트 메시지, 그룹 채팅, 길드 채널,
미디어가 지원됩니다. 반응과 스레드는 지원되지 않습니다.

## 번들 플러그인

현재 OpenClaw 릴리스에는 QQ Bot이 번들되어 있으므로,
일반 패키지 빌드에서는 별도의 `openclaw plugins install` 단계가 필요하지 않습니다.

## 설정

1. [QQ Open Platform](https://q.qq.com/)으로 이동하여 휴대폰 QQ로 QR 코드를
   스캔하여 등록/로그인합니다.
2. **Create Bot**을 클릭하여 새 QQ 봇을 생성합니다.
3. 봇의 설정 페이지에서 **AppID**와 **AppSecret**을 찾아 복사합니다.

> AppSecret은 평문으로 저장되지 않습니다. 저장하지 않고 페이지를 떠나면
> 새로 재생성해야 합니다.

4. 채널을 추가합니다:

```bash
openclaw channels add --channel qqbot --token "AppID:AppSecret"
```

5. 게이트웨이를 재시작합니다.

대화식 설정 경로:

```bash
openclaw channels add
openclaw configure --section channels
```

## 구성

최소 구성:

```json5
{
  channels: {
    qqbot: {
      enabled: true,
      appId: "YOUR_APP_ID",
      clientSecret: "YOUR_APP_SECRET",
    },
  },
}
```

기본 계정 환경 변수:

- `QQBOT_APP_ID`
- `QQBOT_CLIENT_SECRET`

파일 기반 AppSecret:

```json5
{
  channels: {
    qqbot: {
      enabled: true,
      appId: "YOUR_APP_ID",
      clientSecretFile: "/path/to/qqbot-secret.txt",
    },
  },
}
```

참고 사항:

- 환경 변수 폴백은 기본 QQ Bot 계정에만 적용됩니다.
- `openclaw channels add --channel qqbot --token-file ...`는 AppSecret만 제공합니다.
  AppID는 이미 구성 또는 `QQBOT_APP_ID`에 설정되어 있어야 합니다.
- `clientSecret`은 평문 문자열뿐만 아니라 SecretRef 입력도 허용합니다.

### 멀티 계정 설정

하나의 OpenClaw 인스턴스에서 여러 QQ 봇을 실행합니다:

```json5
{
  channels: {
    qqbot: {
      enabled: true,
      appId: "111111111",
      clientSecret: "secret-of-bot-1",
      accounts: {
        bot2: {
          enabled: true,
          appId: "222222222",
          clientSecret: "secret-of-bot-2",
        },
      },
    },
  },
}
```

각 계정은 자체 WebSocket 연결을 시작하고 독립적인
토큰 캐시를 유지합니다 (`appId`로 격리).

CLI를 통해 두 번째 봇 추가:

```bash
openclaw channels add --channel qqbot --account bot2 --token "222222222:secret-of-bot-2"
```

### 음성 (STT / TTS)

STT와 TTS는 우선순위 폴백이 있는 2단계 구성을 지원합니다:

| 설정 | 플러그인별           | 프레임워크 폴백               |
| ---- | -------------------- | ----------------------------- |
| STT  | `channels.qqbot.stt` | `tools.media.audio.models[0]` |
| TTS  | `channels.qqbot.tts` | `messages.tts`                |

```json5
{
  channels: {
    qqbot: {
      stt: {
        provider: "your-provider",
        model: "your-stt-model",
      },
      tts: {
        provider: "your-provider",
        model: "your-tts-model",
        voice: "your-voice",
      },
    },
  },
}
```

둘 중 하나에서 `enabled: false`로 설정하면 비활성화됩니다.

아웃바운드 오디오 업로드/트랜스코드 동작은
`channels.qqbot.audioFormatPolicy`로도 튜닝할 수 있습니다:

- `sttDirectFormats`
- `uploadDirectFormats`
- `transcodeEnabled`

## 타겟 형식

| 형식                       | 설명              |
| -------------------------- | ----------------- |
| `qqbot:c2c:OPENID`         | 개인 채팅 (C2C)   |
| `qqbot:group:GROUP_OPENID` | 그룹 채팅         |
| `qqbot:channel:CHANNEL_ID` | 길드 채널         |

> 각 봇은 자체적인 사용자 OpenID 세트를 가집니다. Bot A가 수신한 OpenID는
> Bot B를 통해 메시지를 보내는 데 **사용할 수 없습니다**.

## 슬래시 명령

AI 큐 전에 가로채는 내장 명령:

| 명령           | 설명                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| `/bot-ping`    | 지연 시간 테스트                                                                            |
| `/bot-version` | OpenClaw 프레임워크 버전 표시                                                               |
| `/bot-help`    | 모든 명령 나열                                                                              |
| `/bot-upgrade` | QQBot 업그레이드 가이드 링크 표시                                                           |
| `/bot-logs`    | 최근 게이트웨이 로그를 파일로 내보내기                                                      |
| `/bot-approve` | 네이티브 플로우를 통해 대기 중인 QQ Bot 작업을 승인합니다 (예: C2C 또는 그룹 업로드 확인).  |

모든 명령 뒤에 `?`를 추가하면 사용법 도움말이 표시됩니다 (예: `/bot-upgrade ?`).

## 엔진 아키텍처

QQ Bot은 플러그인 내부에 자체 완결적인 엔진으로 제공됩니다:

- 각 계정은 `appId`로 키가 지정된 격리된 리소스 스택(WebSocket 연결, API 클라이언트, 토큰 캐시, 미디어 저장소 루트)을 소유합니다. 계정은 인바운드/아웃바운드 상태를 공유하지 않습니다.
- 멀티 계정 로거는 로그 라인에 소유 계정을 태그하므로 하나의 게이트웨이에서 여러 봇을 실행할 때도 진단이 분리 가능합니다.
- 인바운드, 아웃바운드 및 게이트웨이 브리지 경로는 `~/.openclaw/media` 아래의 단일 미디어 페이로드 루트를 공유하므로 업로드, 다운로드, 트랜스코드 캐시가 서브시스템별 트리가 아닌 하나의 보호된 디렉터리 아래에 배치됩니다.
- 자격 증명은 표준 OpenClaw 자격 증명 스냅샷의 일부로 백업 및 복원할 수 있습니다. 엔진은 복원 시 새 QR 코드 페어링을 요구하지 않고 각 계정의 리소스 스택을 다시 연결합니다.

## QR 코드 온보딩

`AppID:AppSecret`를 수동으로 붙여넣는 대신, 엔진은 QQ Bot을 OpenClaw에 연결하기 위한 QR 코드 온보딩 플로우를 지원합니다:

1. QQ Bot 설정 경로를 실행하고 (예: `openclaw channels add --channel qqbot`) 프롬프트 시 QR 코드 플로우를 선택합니다.
2. 대상 QQ Bot과 연결된 휴대폰 앱으로 생성된 QR 코드를 스캔합니다.
3. 휴대폰에서 페어링을 승인합니다. OpenClaw는 반환된 자격 증명을 올바른 계정 스코프 아래의 `credentials/`에 저장합니다.

봇 자체에서 생성된 승인 프롬프트(예: QQ Bot API에서 노출되는 "이 작업을 허용하시겠습니까?" 플로우)는 원시 QQ 클라이언트를 통해 응답하는 대신 `/bot-approve`로 수락할 수 있는 네이티브 OpenClaw 프롬프트로 표시됩니다.

## 문제 해결

- **봇이 "gone to Mars"로 응답:** 자격 증명이 구성되지 않았거나 게이트웨이가 시작되지 않음.
- **인바운드 메시지 없음:** `appId`와 `clientSecret`이 올바른지 확인하고,
  QQ Open Platform에서 봇이 활성화되어 있는지 확인합니다.
- **`--token-file`로 설정했지만 여전히 미구성 상태:** `--token-file`은
  AppSecret만 설정합니다. 구성 또는 `QQBOT_APP_ID`에 `appId`도 필요합니다.
- **프로액티브 메시지가 도착하지 않음:** 사용자가 최근에 상호작용하지 않은 경우
  QQ가 봇이 시작한 메시지를 가로챌 수 있습니다.
- **음성이 전사되지 않음:** STT가 구성되어 있고 프로바이더에 접근 가능한지 확인하세요.

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [채널 문제 해결](/channels/troubleshooting)
