---
title: "멀티 게이트웨이"
description: "한 호스트에서 여러 OpenClaw 게이트웨이 실행 (격리, 포트, 프로필)"
---

# 멀티 게이트웨이 (동일 호스트)

대부분의 설정은 단일 게이트웨이를 사용해야 합니다. 단일 게이트웨이는 여러 메시징 연결과 에이전트를 처리할 수 있기 때문입니다. 더 강력한 격리 또는 중복성이 필요한 경우(예: 복구 봇), 격리된 프로필/포트로 별도의 게이트웨이를 실행합니다.

## 격리 체크리스트 (필수)

- `OPENCLAW_CONFIG_PATH` — 인스턴스별 구성 파일
- `OPENCLAW_STATE_DIR` — 인스턴스별 세션, 자격 증명, 캐시
- `agents.defaults.workspace` — 인스턴스별 워크스페이스 루트
- `gateway.port` (또는 `--port`) — 인스턴스별 고유
- 파생 포트(브라우저/캔버스)는 겹치면 안 됩니다

이를 공유하면 구성 경합과 포트 충돌이 발생합니다.

## 권장 사항: 프로필 (`--profile`)

프로필은 `OPENCLAW_STATE_DIR` + `OPENCLAW_CONFIG_PATH`를 자동으로 범위 지정하고 서비스 이름에 접미사를 붙입니다.

```bash
# 메인
openclaw --profile main setup
openclaw --profile main gateway --port 18789

# 복구
openclaw --profile rescue setup
openclaw --profile rescue gateway --port 19001
```

프로필별 서비스:

```bash
openclaw --profile main gateway install
openclaw --profile rescue gateway install
```

## 복구 봇 가이드

자체적인 것을 갖춘 동일 호스트에서 두 번째 게이트웨이를 실행합니다:

- 프로필/구성
- 상태 디렉터리
- 워크스페이스
- 기본 포트 (파생 포트 포함)

이는 복구 봇을 메인 봇과 격리하여 주 봇이 다운된 경우 디버그하거나 구성 변경을 적용할 수 있습니다.

포트 간격: 파생 브라우저/캔버스/CDP 포트가 충돌하지 않도록 기본 포트 사이에 최소 20개의 포트를 남깁니다.

### 설치 방법 (복구 봇)

```bash
# 메인 봇 (기존 또는 새로운, --profile 파라미터 없음)
# 포트 18789 + Chrome CDC/Canvas/... 포트에서 실행됩니다
openclaw onboard
openclaw gateway install

# 복구 봇 (격리된 프로필 + 포트)
openclaw --profile rescue onboard
# 참고:
# - 기본적으로 워크스페이스 이름에 -rescue가 접미사로 붙습니다
# - 포트는 최소 18789 + 20 포트이어야 하고,
#   19789와 같이 완전히 다른 기본 포트를 선택하는 것이 좋습니다
# - 나머지 온보딩은 일반과 동일합니다

# 서비스 설치 (설정 중에 자동으로 발생하지 않은 경우)
openclaw --profile rescue gateway install
```

## 포트 매핑 (파생)

기본 포트 = `gateway.port` (또는 `OPENCLAW_GATEWAY_PORT` / `--port`).

- 브라우저 컨트롤 서비스 포트 = 기본 + 2 (루프백 전용)
- 캔버스 호스트는 게이트웨이 HTTP 서버에서 제공됩니다 (`gateway.port`와 동일 포트)
- 브라우저 프로필 CDP 포트는 `browser.controlPort + 9 .. + 108`에서 자동 할당됩니다

이 중 어느 것을 구성이나 환경에서 재정의하는 경우 인스턴스별로 고유하게 유지해야 합니다.

## 브라우저/CDP 참고 사항 (일반적인 실수)

- 여러 인스턴스에서 `browser.cdpUrl`을 동일한 값으로 **고정하지 마십시오**.
- 각 인스턴스에는 자체 브라우저 컨트롤 포트와 CDP 범위(게이트웨이 포트에서 파생)가 필요합니다.
- 명시적 CDP 포트가 필요한 경우 인스턴스별로 `browser.profiles.&lt;name&gt;.cdpPort`를 설정합니다.
- 원격 Chrome: 인스턴스별 프로필별로 `browser.profiles.&lt;name&gt;.cdpUrl`을 사용합니다.

## 수동 환경 예제

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw/main.json \
OPENCLAW_STATE_DIR=~/.openclaw-main \
openclaw gateway --port 18789

OPENCLAW_CONFIG_PATH=~/.openclaw/rescue.json \
OPENCLAW_STATE_DIR=~/.openclaw-rescue \
openclaw gateway --port 19001
```

## 빠른 체크

```bash
openclaw --profile main gateway status --deep
openclaw --profile rescue gateway status --deep
openclaw --profile rescue gateway probe
openclaw --profile main status
openclaw --profile rescue status
openclaw --profile rescue browser status
```

해석:

- `gateway status --deep`은 이전 설치에서 오래된 launchd/systemd/schtasks 서비스를 잡는 데 도움이 됩니다.
- `gateway probe` 경고 텍스트(예: `multiple reachable gateways detected`)는 의도적으로 두 개 이상의 격리된 게이트웨이를 실행할 때만 예상됩니다.
