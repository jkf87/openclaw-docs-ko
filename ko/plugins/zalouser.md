---
summary: "Zalo Personal 플러그인: QR 로그인 + 네이티브 zca-js를 통한 메시징 (플러그인 설치 + 채널 구성 + 도구)"
read_when:
  - OpenClaw에서 Zalo Personal(비공식) 지원을 원할 때
  - zalouser 플러그인을 구성하거나 개발할 때
title: "Zalo Personal 플러그인"
---

# Zalo Personal (플러그인)

네이티브 `zca-js`를 사용하여 일반 Zalo 사용자 계정을 자동화하는 플러그인을 통한 OpenClaw용 Zalo Personal 지원입니다.

> **경고:** 비공식 자동화는 계정 정지/차단으로 이어질 수 있습니다. 위험을 감수하고 사용하십시오.

## 명명

채널 id는 `zalouser`이며 이것이 **개인 Zalo 사용자 계정**(비공식)을 자동화한다는 것을 명시합니다. 향후 잠재적인 공식 Zalo API 통합을 위해 `zalo`는 예약해 둡니다.

## 실행 위치

이 플러그인은 **게이트웨이 프로세스 내에서** 실행됩니다.

원격 게이트웨이를 사용한다면 **게이트웨이를 실행하는 머신**에 설치/구성한 다음 게이트웨이를 재시작하십시오.

외부 `zca`/`openzca` CLI 바이너리는 필요하지 않습니다.

## 설치

### 옵션 A: npm에서 설치

```bash
openclaw plugins install @openclaw/zalouser
```

이후 게이트웨이를 재시작하십시오.

### 옵션 B: 로컬 폴더에서 설치 (개발)

```bash
PLUGIN_SRC=./path/to/local/zalouser-plugin
openclaw plugins install "$PLUGIN_SRC"
cd "$PLUGIN_SRC" && pnpm install
```

이후 게이트웨이를 재시작하십시오.

## 구성

채널 구성은 `channels.zalouser` 아래에 있습니다(`plugins.entries.*`가 아님):

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

## CLI

```bash
openclaw channels login --channel zalouser
openclaw channels logout --channel zalouser
openclaw channels status --probe
openclaw message send --channel zalouser --target <threadId> --message "Hello from OpenClaw"
openclaw directory peers list --channel zalouser --query "name"
```

## 에이전트 도구

도구 이름: `zalouser`

액션: `send`, `image`, `link`, `friends`, `groups`, `me`, `status`

채널 메시지 액션은 메시지 반응을 위한 `react`도 지원합니다.
