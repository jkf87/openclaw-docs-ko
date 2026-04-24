---
summary: "네이티브 zca-js (QR 로그인)를 통한 Zalo 개인 계정 지원, 기능 및 구성"
read_when:
  - OpenClaw용 Zalo Personal을 설정할 때
  - Zalo Personal 로그인 또는 메시지 흐름을 디버깅할 때
title: "Zalo personal"
---

# Zalo Personal (비공식)

상태: experimental. 이 통합은 OpenClaw 내부에서 네이티브 `zca-js`를 통해 **Zalo 개인 계정**을 자동화합니다.

> **경고:** 비공식 통합이며 계정 정지/차단을 유발할 수 있습니다. 사용에 따른 책임은 본인에게 있습니다.

## 번들 플러그인

Zalo Personal은 현재 OpenClaw 릴리스에 번들 플러그인으로 제공되므로, 일반적인 패키지 빌드에서는 별도 설치가 필요하지 않습니다.

이전 빌드이거나 Zalo Personal이 제외된 커스텀 설치를 사용 중이라면, 다음과 같이 수동으로 설치하세요:

- CLI를 통한 설치: `openclaw plugins install @openclaw/zalouser`
- 또는 소스 체크아웃에서 설치: `openclaw plugins install ./path/to/local/zalouser-plugin`
- 자세한 내용: [플러그인](/tools/plugin)

외부 `zca`/`openzca` CLI 바이너리는 필요하지 않습니다.

## 빠른 설정 (초보자용)

1. Zalo Personal 플러그인이 사용 가능한지 확인합니다.
   - 현재 패키지로 배포되는 OpenClaw 릴리스에는 이미 번들되어 있습니다.
   - 이전/커스텀 설치에서는 위 명령으로 수동 추가할 수 있습니다.
2. 로그인 (QR, 게이트웨이 머신에서):
   - `openclaw channels login --channel zalouser`
   - Zalo 모바일 앱으로 QR 코드를 스캔합니다.
3. 채널을 활성화합니다:

```json5
{
  channels: {
    zalouser: {
      enabled: true,
      dmPolicy: "pairing",
    },
  },
}
```

4. 게이트웨이를 재시작합니다(또는 설정을 완료합니다).
5. DM 접근은 기본적으로 pairing입니다. 최초 접촉 시 페어링 코드를 승인하세요.

## Zalo Personal이란 무엇인가

- `zca-js`를 통해 프로세스 내부에서 완전히 실행됩니다.
- 네이티브 이벤트 리스너를 사용하여 인바운드 메시지를 수신합니다.
- JS API를 통해 직접 응답을 전송합니다(텍스트/미디어/링크).
- Zalo Bot API를 사용할 수 없는 "개인 계정" 사용 사례용으로 설계되었습니다.

## 명명

채널 ID는 `zalouser`로, **개인 Zalo 사용자 계정**(비공식)을 자동화함을 명시적으로 나타냅니다. `zalo`는 향후 공식 Zalo API 통합을 위해 예약되어 있습니다.

## ID 찾기 (디렉터리)

디렉터리 CLI를 사용하여 피어/그룹과 해당 ID를 찾으세요:

```bash
openclaw directory self --channel zalouser
openclaw directory peers list --channel zalouser --query "name"
openclaw directory groups list --channel zalouser --query "work"
```

## 제한

- 아웃바운드 텍스트는 약 2000자로 청크 분할됩니다 (Zalo 클라이언트 제한).
- 스트리밍은 기본적으로 차단됩니다.

## 접근 제어 (DM)

`channels.zalouser.dmPolicy`는 `pairing | allowlist | open | disabled` (기본값: `pairing`)을 지원합니다.

`channels.zalouser.allowFrom`은 사용자 ID 또는 이름을 허용합니다. 설정 중 이름은 플러그인의 프로세스 내 연락처 조회를 사용하여 ID로 해결됩니다.

다음 방법으로 승인하세요:

- `openclaw pairing list zalouser`
- `openclaw pairing approve zalouser <code>`

## 그룹 접근 (선택 사항)

- 기본값: `channels.zalouser.groupPolicy = "open"` (그룹 허용). 설정되지 않은 경우 `channels.defaults.groupPolicy`로 기본값을 재정의하세요.
- 허용 목록으로 제한:
  - `channels.zalouser.groupPolicy = "allowlist"`
  - `channels.zalouser.groups` (키는 안정적인 그룹 ID여야 합니다. 이름은 가능한 경우 시작 시 ID로 해결됩니다)
  - `channels.zalouser.groupAllowFrom` (허용된 그룹에서 봇을 트리거할 수 있는 발신자 제어)
- 모든 그룹 차단: `channels.zalouser.groupPolicy = "disabled"`.
- configure 마법사는 그룹 허용 목록을 요청할 수 있습니다.
- 시작 시 OpenClaw는 허용 목록의 그룹/사용자 이름을 ID로 해결하고 매핑을 로그에 기록합니다.
- 그룹 허용 목록 매칭은 기본적으로 ID만 사용합니다. 해결되지 않은 이름은 `channels.zalouser.dangerouslyAllowNameMatching: true`가 활성화되지 않은 한 인증에서 무시됩니다.
- `channels.zalouser.dangerouslyAllowNameMatching: true`는 변경 가능한 그룹 이름 매칭을 다시 활성화하는 비상용 호환성 모드입니다.
- `groupAllowFrom`이 설정되지 않은 경우, 런타임은 그룹 발신자 확인 시 `allowFrom`으로 폴백합니다.
- 발신자 확인은 일반 그룹 메시지와 제어 명령 모두에 적용됩니다(예: `/new`, `/reset`).

예시:

```json5
{
  channels: {
    zalouser: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["1471383327500481391"],
      groups: {
        "123456789": { allow: true },
        "Work Chat": { allow: true },
      },
    },
  },
}
```

### 그룹 언급 게이팅

- `channels.zalouser.groups.<group>.requireMention`은 그룹 응답이 언급을 필요로 하는지 제어합니다.
- 해결 순서: 정확한 그룹 ID/이름 -> 정규화된 그룹 슬러그 -> `*` -> 기본값(`true`).
- 이는 허용 목록 그룹과 open 그룹 모드 모두에 적용됩니다.
- 봇 메시지에 대한 인용은 그룹 활성화를 위한 암시적 언급으로 간주됩니다.
- 인증된 제어 명령(예: `/new`)은 언급 게이팅을 우회할 수 있습니다.
- 언급이 필요하여 그룹 메시지가 건너뛰어진 경우, OpenClaw는 이를 보류 중인 그룹 히스토리로 저장하고 다음에 처리되는 그룹 메시지에 포함시킵니다.
- 그룹 히스토리 제한은 기본적으로 `messages.groupChat.historyLimit`(폴백 `50`)입니다. `channels.zalouser.historyLimit`로 계정별 재정의가 가능합니다.

예시:

```json5
{
  channels: {
    zalouser: {
      groupPolicy: "allowlist",
      groups: {
        "*": { allow: true, requireMention: true },
        "Work Chat": { allow: true, requireMention: false },
      },
    },
  },
}
```

## 다중 계정

계정은 OpenClaw 상태의 `zalouser` 프로필에 매핑됩니다. 예시:

```json5
{
  channels: {
    zalouser: {
      enabled: true,
      defaultAccount: "default",
      accounts: {
        work: { enabled: true, profile: "work" },
      },
    },
  },
}
```

## 타이핑, 리액션 및 전달 확인

- OpenClaw는 응답을 전송하기 전에 typing 이벤트를 보냅니다(최선 노력).
- 채널 액션에서 `zalouser`에 대해 메시지 리액션 액션 `react`가 지원됩니다.
  - 메시지에서 특정 리액션 이모지를 제거하려면 `remove: true`를 사용하세요.
  - 리액션 의미: [리액션](/tools/reactions)
- 이벤트 메타데이터를 포함하는 인바운드 메시지의 경우, OpenClaw는 delivered + seen 확인을 전송합니다(최선 노력).

## 문제 해결

**로그인이 유지되지 않음:**

- `openclaw channels status --probe`
- 재로그인: `openclaw channels logout --channel zalouser && openclaw channels login --channel zalouser`

**허용 목록/그룹 이름이 해결되지 않음:**

- `allowFrom`/`groupAllowFrom`/`groups`에서 숫자 ID를 사용하거나, 정확한 친구/그룹 이름을 사용하세요.

**이전 CLI 기반 설정에서 업그레이드한 경우:**

- 이전 외부 `zca` 프로세스 가정을 제거하세요.
- 채널은 이제 외부 CLI 바이너리 없이 OpenClaw 내부에서 완전히 실행됩니다.

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 흐름
- [그룹](/channels/groups) — 그룹 채팅 동작 및 언급 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 보안 강화
