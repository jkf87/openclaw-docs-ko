---
title: "Signal"
description: "Signal 채널 설정 및 signal-cli 데몬 구성"
---

# Signal

Signal은 `signal-cli` 데몬을 통해 지원됩니다.

> **페어링**
> Signal DM 접근은 페어링 또는 허용 목록으로 제어됩니다.


  > **채널 문제 해결**
> 채널 간 진단 및 수리 플레이북.


## 설정

1. **signal-cli 설치 및 등록**

   [signal-cli 릴리스 페이지](https://github.com/AsamK/signal-cli/releases)에서 signal-cli를 설치하고 전화번호를 등록합니다.
   
       데몬 모드:
   
   ```bash
   signal-cli -a +15555550100 daemon --socket /tmp/signal.sock
   ```


  2. **OpenClaw 구성**

   ```json5
   {
     channels: {
       signal: {
         enabled: true,
         account: "+15555550100",
         socketPath: "/tmp/signal.sock",
         dmPolicy: "pairing",
       },
     },
   }
   ```
   
       환경 변수 폴백 (기본 계정):
   
   ```bash
   SIGNAL_ACCOUNT=+15555550100
   SIGNAL_SOCKET_PATH=/tmp/signal.sock
   ```


  3. **게이트웨이 시작 및 첫 번째 DM 승인**

   ```bash
   openclaw gateway
   openclaw pairing list signal
   openclaw pairing approve signal <CODE>
   ```


## 접근 제어

`channels.signal.dmPolicy`는 DM 접근을 제어합니다:

- `pairing` (기본값)
- `allowlist`
- `open`
- `disabled`

`channels.signal.allowFrom`은 E.164 형식의 전화번호를 허용합니다.

그룹 접근:

- `channels.signal.groupPolicy`: `open | allowlist | disabled`
- `channels.signal.groups`: 허용된 Signal 그룹 ID의 맵

## 런타임 동작

- Signal은 `signal-cli` JSON-RPC 데몬을 통해 작동합니다.
- 소켓 경로(`socketPath`) 또는 TCP 주소(`tcpAddress`)를 구성합니다.
- 수신 모드: `subscribe` (기본값) 또는 `receive`.

## 구성 참조

- `channels.signal.enabled`: 채널 활성화/비활성화.
- `channels.signal.account`: Signal 계정 전화번호 (E.164 형식).
- `channels.signal.socketPath`: signal-cli 데몬 유닉스 소켓 경로.
- `channels.signal.tcpAddress`: 소켓 대신 TCP 주소 (예: `localhost:7583`).
- `channels.signal.dmPolicy`: DM 접근 정책.
- `channels.signal.allowFrom`: DM 허용 목록 (E.164 전화번호).
- `channels.signal.groupPolicy`: 그룹 접근 정책.
- `channels.signal.groups`: 그룹 ID 허용 목록.

## 문제 해결

::: details 데몬 접근 가능하지만 봇 응답 없음
- `openclaw channels status --probe`로 signal-cli 데몬 URL/계정 확인
    - `socketPath` 또는 `tcpAddress` 올바르게 설정되었는지 확인
    - 수신 모드 설정 확인
:::


  ::: details DM 차단됨
- `openclaw pairing list signal`로 대기 중인 페어링 확인
    - `openclaw pairing approve signal <CODE>`로 발신자 승인
:::

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [채널 문제 해결](/channels/troubleshooting)
