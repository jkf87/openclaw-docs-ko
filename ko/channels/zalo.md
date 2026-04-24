---
summary: "Zalo 봇 지원 상태, 기능 및 구성"
read_when:
  - Zalo 기능 또는 webhook 작업 시
title: "Zalo"
---

# Zalo (Bot API)

상태: experimental. DM이 지원됩니다. 아래 [기능](#capabilities) 섹션은 현재 Marketplace 봇 동작을 반영합니다.

## 번들 플러그인

Zalo는 현재 OpenClaw 릴리스에 번들 플러그인으로 제공되므로, 일반적인 패키지 빌드에서는 별도 설치가 필요하지 않습니다.

이전 빌드이거나 Zalo가 제외된 커스텀 설치를 사용 중이라면, 다음과 같이 수동으로 설치하세요:

- CLI를 통한 설치: `openclaw plugins install @openclaw/zalo`
- 또는 소스 체크아웃에서 설치: `openclaw plugins install ./path/to/local/zalo-plugin`
- 자세한 내용: [플러그인](/tools/plugin)

## 빠른 설정 (초보자용)

1. Zalo 플러그인이 사용 가능한지 확인합니다.
   - 현재 패키지로 배포되는 OpenClaw 릴리스에는 이미 번들되어 있습니다.
   - 이전/커스텀 설치에서는 위 명령으로 수동 추가할 수 있습니다.
2. 토큰을 설정합니다:
   - 환경 변수: `ZALO_BOT_TOKEN=...`
   - 또는 구성: `channels.zalo.accounts.default.botToken: "..."`.
3. 게이트웨이를 재시작합니다(또는 설정을 완료합니다).
4. DM 접근은 기본적으로 pairing입니다. 최초 접촉 시 페어링 코드를 승인하세요.

최소 구성:

```json5
{
  channels: {
    zalo: {
      enabled: true,
      accounts: {
        default: {
          botToken: "12345689:abc-xyz",
          dmPolicy: "pairing",
        },
      },
    },
  },
}
```

## Zalo란 무엇인가

Zalo는 베트남 중심의 메시징 앱이며, Bot API를 통해 게이트웨이가 1:1 대화용 봇을 운영할 수 있습니다.
Zalo로 결정적 라우팅되는 응답이 필요한 고객 지원이나 알림 시나리오에 적합합니다.

이 페이지는 **Zalo Bot Creator / Marketplace 봇**에 대한 현재 OpenClaw 동작을 반영합니다.
**Zalo Official Account (OA) 봇**은 다른 Zalo 제품 영역이며 동작이 다를 수 있습니다.

- 게이트웨이가 소유하는 Zalo Bot API 채널.
- 결정적 라우팅: 응답은 Zalo로 다시 전달되며, 모델이 채널을 선택하지 않습니다.
- DM은 에이전트의 메인 세션을 공유합니다.
- 아래 [기능](#capabilities) 섹션은 현재 Marketplace 봇 지원 상태를 보여줍니다.

## 설정 (빠른 경로)

### 1) 봇 토큰 생성 (Zalo Bot Platform)

1. [https://bot.zaloplatforms.com](https://bot.zaloplatforms.com) 으로 이동하여 로그인합니다.
2. 새 봇을 생성하고 설정을 구성합니다.
3. 전체 봇 토큰을 복사합니다(일반적으로 `numeric_id:secret` 형식). Marketplace 봇의 경우, 사용 가능한 런타임 토큰이 봇 생성 후 환영 메시지에 표시될 수 있습니다.

### 2) 토큰 구성 (환경 변수 또는 구성 파일)

예시:

```json5
{
  channels: {
    zalo: {
      enabled: true,
      accounts: {
        default: {
          botToken: "12345689:abc-xyz",
          dmPolicy: "pairing",
        },
      },
    },
  },
}
```

나중에 그룹이 사용 가능한 Zalo 봇 영역으로 이동한다면, `groupPolicy` 및 `groupAllowFrom` 같은 그룹 관련 구성을 명시적으로 추가할 수 있습니다. 현재 Marketplace 봇 동작은 [기능](#capabilities)을 참고하세요.

환경 변수 옵션: `ZALO_BOT_TOKEN=...` (기본 계정에만 적용).

다중 계정 지원: `channels.zalo.accounts`를 사용하여 계정별 토큰과 선택적 `name`을 지정하세요.

3. 게이트웨이를 재시작합니다. 토큰이 해결되면(환경 변수 또는 구성) Zalo가 시작됩니다.
4. DM 접근은 기본적으로 pairing입니다. 봇에 처음 접촉할 때 코드를 승인하세요.

## 동작 방식

- 인바운드 메시지는 미디어 플레이스홀더와 함께 공유 채널 봉투로 정규화됩니다.
- 응답은 항상 동일한 Zalo 채팅으로 다시 라우팅됩니다.
- 기본은 long-polling입니다. `channels.zalo.webhookUrl`로 webhook 모드를 사용할 수 있습니다.

## 제한

- 아웃바운드 텍스트는 2000자로 청크 분할됩니다 (Zalo API 제한).
- 미디어 다운로드/업로드는 `channels.zalo.mediaMaxMb` (기본값 5)로 제한됩니다.
- 2000자 제한으로 스트리밍이 유용하지 않아 기본적으로 스트리밍은 차단됩니다.

## 접근 제어 (DM)

### DM 접근

- 기본값: `channels.zalo.dmPolicy = "pairing"`. 알 수 없는 발신자는 페어링 코드를 받으며, 승인되기 전까지 메시지는 무시됩니다(코드는 1시간 후 만료).
- 다음 방법으로 승인하세요:
  - `openclaw pairing list zalo`
  - `openclaw pairing approve zalo <CODE>`
- 페어링은 기본 토큰 교환 방식입니다. 자세한 내용: [페어링](/channels/pairing)
- `channels.zalo.allowFrom`은 숫자 사용자 ID를 허용합니다(사용자명 조회 불가).

## 접근 제어 (그룹)

**Zalo Bot Creator / Marketplace 봇**의 경우, 봇을 그룹에 추가하는 것 자체가 불가능했기 때문에 실제로 그룹 지원은 사용할 수 없었습니다.

즉, 아래의 그룹 관련 구성 키는 스키마에 존재하지만 Marketplace 봇에서는 사용할 수 없었습니다:

- `channels.zalo.groupPolicy`는 그룹 인바운드 처리를 제어합니다: `open | allowlist | disabled`.
- `channels.zalo.groupAllowFrom`은 그룹에서 봇을 트리거할 수 있는 발신자 ID를 제한합니다.
- `groupAllowFrom`이 설정되지 않으면 Zalo는 발신자 확인 시 `allowFrom`으로 폴백합니다.
- 런타임 참고: `channels.zalo`가 완전히 없는 경우에도 런타임은 안전을 위해 `groupPolicy="allowlist"`로 폴백합니다.

그룹 정책 값(봇 영역에서 그룹 접근이 가능한 경우)은 다음과 같습니다:

- `groupPolicy: "disabled"` — 모든 그룹 메시지를 차단합니다.
- `groupPolicy: "open"` — 모든 그룹 구성원 허용(언급 기반 게이팅).
- `groupPolicy: "allowlist"` — 실패 폐쇄 기본값. 허용된 발신자만 수락됩니다.

다른 Zalo 봇 제품 영역을 사용 중이고 그룹 동작이 작동함을 확인했다면, Marketplace 봇 흐름과 같다고 가정하지 말고 별도로 문서화하세요.

## Long-polling vs webhook

- 기본값: long-polling (공개 URL 불필요).
- Webhook 모드: `channels.zalo.webhookUrl`과 `channels.zalo.webhookSecret`을 설정합니다.
  - Webhook secret은 8-256자여야 합니다.
  - Webhook URL은 반드시 HTTPS를 사용해야 합니다.
  - Zalo는 검증을 위해 `X-Bot-Api-Secret-Token` 헤더와 함께 이벤트를 보냅니다.
  - 게이트웨이 HTTP는 `channels.zalo.webhookPath`(기본값은 webhook URL 경로)에서 webhook 요청을 처리합니다.
  - 요청은 `Content-Type: application/json` (또는 `+json` 미디어 타입)을 사용해야 합니다.
  - 짧은 재생 윈도우 동안 중복 이벤트(`event_name + message_id`)는 무시됩니다.
  - 버스트 트래픽은 경로/소스별로 속도 제한되며 HTTP 429를 반환할 수 있습니다.

**참고:** Zalo API 문서에 따르면 getUpdates (polling)와 webhook은 상호 배타적입니다.

## 지원되는 메시지 유형

빠른 지원 현황은 [기능](#capabilities)을 참고하세요. 아래 노트는 추가 설명이 필요한 동작에 대한 세부 사항입니다.

- **텍스트 메시지**: 2000자 청크 분할로 완전 지원.
- **텍스트 내 일반 URL**: 일반 텍스트 입력처럼 동작합니다.
- **링크 미리보기 / 리치 링크 카드**: [기능](#capabilities)의 Marketplace 봇 상태를 참고하세요. 안정적으로 응답을 트리거하지 못했습니다.
- **이미지 메시지**: [기능](#capabilities)의 Marketplace 봇 상태를 참고하세요. 인바운드 이미지 처리가 불안정했습니다(최종 응답 없이 타이핑 인디케이터만 표시).
- **스티커**: [기능](#capabilities)의 Marketplace 봇 상태를 참고하세요.
- **음성 메모 / 오디오 파일 / 비디오 / 일반 파일 첨부**: [기능](#capabilities)의 Marketplace 봇 상태를 참고하세요.
- **지원되지 않는 유형**: 로그에 기록됩니다(예: 보호된 사용자의 메시지).

## 기능

이 표는 OpenClaw에서 현재 **Zalo Bot Creator / Marketplace 봇** 동작을 요약한 것입니다.

| 기능                               | 상태                                         |
| ---------------------------------- | -------------------------------------------- |
| 다이렉트 메시지                    | ✅ 지원                                      |
| 그룹                               | ❌ Marketplace 봇에서 사용 불가              |
| 미디어 (인바운드 이미지)           | ⚠️ 제한적 / 자신의 환경에서 확인 필요         |
| 미디어 (아웃바운드 이미지)         | ⚠️ Marketplace 봇에서 재테스트되지 않음       |
| 텍스트 내 일반 URL                 | ✅ 지원                                      |
| 링크 미리보기                      | ⚠️ Marketplace 봇에서 불안정                  |
| 리액션                             | ❌ 지원되지 않음                             |
| 스티커                             | ⚠️ Marketplace 봇에서 에이전트 응답 없음      |
| 음성 메모 / 오디오 / 비디오        | ⚠️ Marketplace 봇에서 에이전트 응답 없음      |
| 파일 첨부                          | ⚠️ Marketplace 봇에서 에이전트 응답 없음      |
| 스레드                             | ❌ 지원되지 않음                             |
| 설문                               | ❌ 지원되지 않음                             |
| 네이티브 명령                      | ❌ 지원되지 않음                             |
| 스트리밍                           | ⚠️ 차단됨 (2000자 제한)                       |

## 전달 대상 (CLI/cron)

- 채팅 ID를 대상으로 사용합니다.
- 예시: `openclaw message send --channel zalo --target 123456789 --message "hi"`.

## 문제 해결

**봇이 응답하지 않음:**

- 토큰이 유효한지 확인: `openclaw channels status --probe`
- 발신자가 승인되었는지 확인(페어링 또는 allowFrom)
- 게이트웨이 로그 확인: `openclaw logs --follow`

**Webhook이 이벤트를 받지 못함:**

- Webhook URL이 HTTPS를 사용하는지 확인
- Secret 토큰이 8-256자인지 확인
- 구성된 경로에서 게이트웨이 HTTP 엔드포인트에 도달 가능한지 확인
- getUpdates polling이 실행되고 있지 않은지 확인(상호 배타적)

## 구성 참조 (Zalo)

전체 구성: [구성](/gateway/configuration)

최상위 플랫 키(`channels.zalo.botToken`, `channels.zalo.dmPolicy` 등)는 단일 계정용 레거시 단축 표기입니다. 새 구성에서는 `channels.zalo.accounts.<id>.*`를 선호하세요. 두 형식 모두 스키마에 존재하므로 이곳에 문서화되어 있습니다.

프로바이더 옵션:

- `channels.zalo.enabled`: 채널 시작 활성화/비활성화.
- `channels.zalo.botToken`: Zalo Bot Platform의 봇 토큰.
- `channels.zalo.tokenFile`: 일반 파일 경로에서 토큰을 읽습니다. 심볼릭 링크는 거부됩니다.
- `channels.zalo.dmPolicy`: `pairing | allowlist | open | disabled` (기본값: pairing).
- `channels.zalo.allowFrom`: DM 허용 목록(사용자 ID). `open`은 `"*"`가 필요합니다. 마법사는 숫자 ID를 묻습니다.
- `channels.zalo.groupPolicy`: `open | allowlist | disabled` (기본값: allowlist). 구성에 존재합니다. 현재 Marketplace 봇 동작은 [기능](#capabilities) 및 [접근 제어 (그룹)](#access-control-groups)를 참고하세요.
- `channels.zalo.groupAllowFrom`: 그룹 발신자 허용 목록(사용자 ID). 설정되지 않으면 `allowFrom`으로 폴백합니다.
- `channels.zalo.mediaMaxMb`: 인바운드/아웃바운드 미디어 상한(MB, 기본값 5).
- `channels.zalo.webhookUrl`: webhook 모드 활성화(HTTPS 필수).
- `channels.zalo.webhookSecret`: webhook secret (8-256자).
- `channels.zalo.webhookPath`: 게이트웨이 HTTP 서버상의 webhook 경로.
- `channels.zalo.proxy`: API 요청용 프록시 URL.

다중 계정 옵션:

- `channels.zalo.accounts.<id>.botToken`: 계정별 토큰.
- `channels.zalo.accounts.<id>.tokenFile`: 계정별 일반 토큰 파일. 심볼릭 링크는 거부됩니다.
- `channels.zalo.accounts.<id>.name`: 표시 이름.
- `channels.zalo.accounts.<id>.enabled`: 계정 활성화/비활성화.
- `channels.zalo.accounts.<id>.dmPolicy`: 계정별 DM 정책.
- `channels.zalo.accounts.<id>.allowFrom`: 계정별 허용 목록.
- `channels.zalo.accounts.<id>.groupPolicy`: 계정별 그룹 정책. 구성에 존재합니다. 현재 Marketplace 봇 동작은 [기능](#capabilities) 및 [접근 제어 (그룹)](#access-control-groups)를 참고하세요.
- `channels.zalo.accounts.<id>.groupAllowFrom`: 계정별 그룹 발신자 허용 목록.
- `channels.zalo.accounts.<id>.webhookUrl`: 계정별 webhook URL.
- `channels.zalo.accounts.<id>.webhookSecret`: 계정별 webhook secret.
- `channels.zalo.accounts.<id>.webhookPath`: 계정별 webhook 경로.
- `channels.zalo.accounts.<id>.proxy`: 계정별 프록시 URL.

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 언급 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 보안 강화
