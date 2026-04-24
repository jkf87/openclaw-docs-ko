---
summary: "한 호스트에서 여러 OpenClaw Gateway 실행(격리, 포트, 프로파일)"
read_when:
  - 동일 머신에서 하나 이상의 Gateway 실행 시
  - Gateway별로 격리된 config/state/ports가 필요할 때
title: "다중 게이트웨이 (Multiple gateways)"
---

# 다중 게이트웨이 (동일 호스트)

대부분의 설정은 하나의 Gateway를 사용해야 합니다. 단일 Gateway가 여러 메시징 연결과 에이전트를 처리할 수 있기 때문입니다. 더 강력한 격리 또는 중복성(예: 레스큐 봇)이 필요하다면, 격리된 프로파일/포트로 별도의 Gateway를 실행하십시오.

## 가장 권장되는 설정

대부분의 사용자에게 가장 단순한 레스큐 봇 설정은 다음과 같습니다:

- 메인 봇은 기본 프로파일에 유지
- 레스큐 봇은 `--profile rescue`로 실행
- 레스큐 계정용으로 완전히 별도의 Telegram 봇 사용
- 레스큐 봇은 `19789`와 같은 다른 베이스 포트에 유지

이렇게 하면 레스큐 봇이 메인 봇과 격리되어 유지되므로, 기본 봇이 다운되었을 때 디버깅하거나 config 변경 사항을 적용할 수 있습니다. 파생된 브라우저/캔버스/CDP 포트가 충돌하지 않도록 베이스 포트 사이에 최소 20개 포트를 남겨두십시오.

## 레스큐 봇 빠른 시작

다른 것을 할 강한 이유가 없다면 이것을 기본 경로로 사용하십시오:

```bash
# 레스큐 봇 (별도 Telegram 봇, 별도 프로파일, 포트 19789)
openclaw --profile rescue onboard
openclaw --profile rescue gateway install --port 19789
```

메인 봇이 이미 실행 중이라면, 일반적으로 그것이 필요한 전부입니다.

`openclaw --profile rescue onboard` 중에:

- 별도의 Telegram 봇 토큰을 사용하십시오
- `rescue` 프로파일을 유지하십시오
- 메인 봇보다 최소 20 높은 베이스 포트를 사용하십시오
- 이미 직접 관리 중이 아니라면 기본 레스큐 워크스페이스를 수락하십시오

온보딩이 이미 레스큐 서비스를 설치했다면, 마지막 `gateway install`은 필요하지 않습니다.

## 이것이 작동하는 이유

레스큐 봇은 자체적으로 다음을 가지고 있기 때문에 독립적으로 유지됩니다:

- 프로파일/config
- state 디렉토리
- 워크스페이스
- 베이스 포트(그리고 파생된 포트)
- Telegram 봇 토큰

대부분의 설정에서, 레스큐 프로파일용으로 완전히 별도의 Telegram 봇을 사용하십시오:

- 운영자 전용으로 유지하기 쉬움
- 별도의 봇 토큰과 아이덴티티
- 메인 봇의 채널/앱 설치로부터 독립적
- 메인 봇이 고장났을 때 간단한 DM 기반 복구 경로

## `--profile rescue onboard`가 변경하는 것

`openclaw --profile rescue onboard`는 일반 온보딩 플로우를 사용하지만, 모든 것을 별도의 프로파일에 기록합니다.

실질적으로, 이는 레스큐 봇이 자체적으로 다음을 가지게 됨을 의미합니다:

- config 파일
- state 디렉토리
- 워크스페이스(기본값 `~/.openclaw/workspace-rescue`)
- 관리되는 서비스 이름

프롬프트는 그렇지 않으면 일반 온보딩과 동일합니다.

## 일반 다중 게이트웨이 설정

위의 레스큐 봇 레이아웃이 가장 쉬운 기본값이지만, 동일한 격리 패턴이 한 호스트의 모든 Gateway 쌍 또는 그룹에 작동합니다.

더 일반적인 설정의 경우, 각 추가 Gateway에 자체 명명된 프로파일과 자체 베이스 포트를 부여하십시오:

```bash
# main (기본 프로파일)
openclaw setup
openclaw gateway --port 18789

# 추가 게이트웨이
openclaw --profile ops setup
openclaw --profile ops gateway --port 19789
```

두 Gateway 모두 명명된 프로파일을 사용하기를 원한다면, 그것도 작동합니다:

```bash
openclaw --profile main setup
openclaw --profile main gateway --port 18789

openclaw --profile ops setup
openclaw --profile ops gateway --port 19789
```

서비스도 동일한 패턴을 따릅니다:

```bash
openclaw gateway install
openclaw --profile ops gateway install --port 19789
```

폴백 운영자 레인을 원할 때는 레스큐 봇 빠른 시작을 사용하십시오. 서로 다른 채널, 테넌트, 워크스페이스 또는 운영 역할을 위해 여러 개의 장기 실행 Gateway를 원할 때는 일반 프로파일 패턴을 사용하십시오.

## 격리 체크리스트

Gateway 인스턴스별로 다음을 고유하게 유지하십시오:

- `OPENCLAW_CONFIG_PATH` — 인스턴스별 config 파일
- `OPENCLAW_STATE_DIR` — 인스턴스별 세션, 자격 증명, 캐시
- `agents.defaults.workspace` — 인스턴스별 워크스페이스 루트
- `gateway.port` (또는 `--port`) — 인스턴스별 고유
- 파생된 브라우저/캔버스/CDP 포트

이것들이 공유되면, config 경합과 포트 충돌이 발생합니다.

## 포트 매핑 (파생)

베이스 포트 = `gateway.port` (또는 `OPENCLAW_GATEWAY_PORT` / `--port`).

- 브라우저 제어 서비스 포트 = base + 2 (loopback 전용)
- 캔버스 호스트는 Gateway HTTP 서버에서 서비스됩니다(`gateway.port`와 동일한 포트)
- 브라우저 프로파일 CDP 포트는 `browser.controlPort + 9 .. + 108`에서 자동 할당됩니다

config 또는 env에서 이들 중 하나라도 재정의하는 경우, 인스턴스별로 고유하게 유지해야 합니다.

## 브라우저/CDP 참고 (흔한 함정)

- 여러 인스턴스에서 `browser.cdpUrl`을 동일한 값으로 **고정하지 마십시오**.
- 각 인스턴스는 자체 브라우저 제어 포트와 CDP 범위(해당 gateway 포트에서 파생됨)가 필요합니다.
- 명시적 CDP 포트가 필요한 경우, 인스턴스별로 `browser.profiles.<name>.cdpPort`를 설정하십시오.
- 원격 Chrome: `browser.profiles.<name>.cdpUrl`을 사용하십시오(프로파일별, 인스턴스별).

## 수동 환경 변수 예시

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw/main.json \
OPENCLAW_STATE_DIR=~/.openclaw \
openclaw gateway --port 18789

OPENCLAW_CONFIG_PATH=~/.openclaw/rescue.json \
OPENCLAW_STATE_DIR=~/.openclaw-rescue \
openclaw gateway --port 19789
```

## 빠른 확인

```bash
openclaw gateway status --deep
openclaw --profile rescue gateway status --deep
openclaw --profile rescue gateway probe
openclaw status
openclaw --profile rescue status
openclaw --profile rescue browser status
```

해석:

- `gateway status --deep`은 이전 설치의 오래된 launchd/systemd/schtasks 서비스를 잡는 데 도움이 됩니다.
- `gateway probe` 경고 텍스트(예: `multiple reachable gateways detected`)는 의도적으로 하나 이상의 격리된 gateway를 실행하는 경우에만 예상됩니다.

## 관련

- [Gateway 런북](/gateway/)
- [Gateway 잠금](/gateway/gateway-lock)
- [구성](/gateway/configuration)
