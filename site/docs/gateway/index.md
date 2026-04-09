---
title: "게이트웨이 런북"
description: "게이트웨이 서비스, 라이프사이클, 운영을 위한 런북"
---

# 게이트웨이 런북

이 페이지는 게이트웨이 서비스의 1일차 시작과 2일차 운영에 활용하십시오.

> **심층 문제 해결**
> 증상 기반 진단, 정확한 명령 사다리, 로그 시그니처를 제공합니다.


  > **구성**
> 작업 중심 설정 가이드 및 전체 구성 레퍼런스입니다.


  > **시크릿 관리**
> SecretRef 계약, 런타임 스냅샷 동작, 마이그레이션/리로드 작업입니다.


  > **시크릿 플랜 계약**
> 정확한 `secrets apply` 대상/경로 규칙 및 ref-only 인증 프로파일 동작입니다.


## 5분 로컬 시작

1. **게이트웨이 시작**

   ```bash
   openclaw gateway --port 18789
   # 디버그/트레이스를 stdio에 미러링
   openclaw gateway --port 18789 --verbose
   # 선택된 포트의 리스너를 강제 종료한 후 시작
   openclaw gateway --force
   ```


  2. **서비스 상태 확인**

   ```bash
   openclaw gateway status
   openclaw status
   openclaw logs --follow
   ```
   
   정상 기준: `Runtime: running` 및 `RPC probe: ok`.


  3. **채널 준비 상태 검증**

   ```bash
   openclaw channels status --probe
   ```
   
   게이트웨이에 연결할 수 있는 경우, 계정별 라이브 채널 프로브와 선택적 감사가 실행됩니다.
   게이트웨이에 연결할 수 없는 경우, CLI는 라이브 프로브 출력 대신 구성 전용 채널 요약으로 폴백합니다.


::: info NOTE
게이트웨이 구성 리로드는 활성 구성 파일 경로(프로파일/상태 기본값에서 해석되거나, 설정된 경우 `OPENCLAW_CONFIG_PATH`)를 감시합니다.
기본 모드는 `gateway.reload.mode="hybrid"`입니다.
첫 번째 성공적인 로드 후, 실행 중인 프로세스는 활성 인메모리 구성 스냅샷을 제공하며, 성공적인 리로드는 해당 스냅샷을 원자적으로 교체합니다.
:::


## 런타임 모델

- 라우팅, 컨트롤 플레인, 채널 연결을 위한 상시 실행 프로세스 하나.
- 단일 멀티플렉싱 포트:
  - WebSocket 컨트롤/RPC
  - HTTP API, OpenAI 호환 (`/v1/models`, `/v1/embeddings`, `/v1/chat/completions`, `/v1/responses`, `/tools/invoke`)
  - Control UI 및 훅
- 기본 바인드 모드: `loopback`.
- 기본적으로 인증이 필요합니다. 공유 시크릿 설정은
  `gateway.auth.token` / `gateway.auth.password` (또는
  `OPENCLAW_GATEWAY_TOKEN` / `OPENCLAW_GATEWAY_PASSWORD`)를 사용하고, 루프백이 아닌
  리버스 프록시 설정은 `gateway.auth.mode: "trusted-proxy"`를 사용할 수 있습니다.

## OpenAI 호환 엔드포인트

OpenClaw의 가장 높은 레버리지 호환성 표면은 현재 다음과 같습니다:

- `GET /v1/models`
- `GET /v1/models/{id}`
- `POST /v1/embeddings`
- `POST /v1/chat/completions`
- `POST /v1/responses`

이 집합이 중요한 이유:

- 대부분의 Open WebUI, LobeChat, LibreChat 통합은 먼저 `/v1/models`를 프로브합니다.
- 많은 RAG 및 메모리 파이프라인은 `/v1/embeddings`를 기대합니다.
- 에이전트 네이티브 클라이언트는 점점 `/v1/responses`를 선호합니다.

계획 참고:

- `/v1/models`는 에이전트 우선입니다: `openclaw`, `openclaw/default`, `openclaw/&lt;agentId&gt;`를 반환합니다.
- `openclaw/default`는 구성된 기본 에이전트에 항상 매핑되는 안정적인 별칭입니다.
- 백엔드 프로바이더/모델 재정의를 원하는 경우 `x-openclaw-model`을 사용하고, 그렇지 않으면 선택된 에이전트의 일반 모델과 임베딩 설정이 제어를 유지합니다.

이 모든 것은 메인 게이트웨이 포트에서 실행되며, 나머지 게이트웨이 HTTP API와 동일한 신뢰할 수 있는 오퍼레이터 인증 경계를 사용합니다.

### 포트 및 바인드 우선순위

| 설정      | 해석 순서                                              |
| ------------ | ------------------------------------------------------------- |
| 게이트웨이 포트 | `--port` → `OPENCLAW_GATEWAY_PORT` → `gateway.port` → `18789` |
| 바인드 모드    | CLI/재정의 → `gateway.bind` → `loopback`                    |

### 핫 리로드 모드

| `gateway.reload.mode` | 동작                                   |
| --------------------- | ------------------------------------------ |
| `off`                 | 구성 리로드 없음                           |
| `hot`                 | 핫 세이프 변경 사항만 적용                |
| `restart`             | 리로드 필요 변경 사항 시 재시작         |
| `hybrid` (기본값)    | 안전한 경우 핫 적용, 필요 시 재시작 |

## 오퍼레이터 명령 집합

```bash
openclaw gateway status
openclaw gateway status --deep   # 시스템 레벨 서비스 스캔 추가
openclaw gateway status --json
openclaw gateway install
openclaw gateway restart
openclaw gateway stop
openclaw secrets reload
openclaw logs --follow
openclaw doctor
```

`gateway status --deep`은 추가 서비스 검색(LaunchDaemons/systemd 시스템 유닛/schtasks)을 위한 것으로, 더 깊은 RPC 상태 프로브가 아닙니다.

## 복수 게이트웨이 (동일 호스트)

대부분의 설치는 머신당 하나의 게이트웨이를 실행해야 합니다. 단일 게이트웨이는 여러 에이전트와 채널을 호스팅할 수 있습니다.

복수 게이트웨이는 격리 또는 구조 봇을 의도적으로 원하는 경우에만 필요합니다.

유용한 확인 명령:

```bash
openclaw gateway status --deep
openclaw gateway probe
```

예상 결과:

- `gateway status --deep`은 오래된 launchd/systemd/schtasks 설치가 남아 있는 경우 `Other gateway-like services detected (best effort)`를 보고하고 정리 힌트를 출력할 수 있습니다.
- `gateway probe`는 하나 이상의 대상이 응답할 때 `multiple reachable gateways`에 대해 경고할 수 있습니다.
- 의도적인 경우, 게이트웨이별로 포트, 구성/상태, 워크스페이스 루트를 격리하십시오.

자세한 설정: [/gateway/multiple-gateways](/gateway/multiple-gateways).

## 원격 접근

권장: Tailscale/VPN.
폴백: SSH 터널.

```bash
ssh -N -L 18789:127.0.0.1:18789 user@host
```

그런 다음 클라이언트를 로컬에서 `ws://127.0.0.1:18789`에 연결합니다.

::: warning
SSH 터널은 게이트웨이 인증을 우회하지 않습니다. 공유 시크릿 인증의 경우, 클라이언트는 터널을 통해서도 `token`/`password`를 보내야 합니다. ID 기반 모드의 경우, 요청은 여전히 해당 인증 경로를 충족해야 합니다.
:::


참고: [원격 게이트웨이](/gateway/remote), [인증](/gateway/authentication), [Tailscale](/gateway/tailscale).

## 감독 및 서비스 라이프사이클

프로덕션 수준의 안정성을 위해 감독 실행을 사용하십시오.

**macOS (launchd)**

```bash
openclaw gateway install
openclaw gateway status
openclaw gateway restart
openclaw gateway stop
```

LaunchAgent 레이블은 `ai.openclaw.gateway` (기본값) 또는 `ai.openclaw.&lt;profile&gt;` (명명된 프로파일)입니다. `openclaw doctor`는 서비스 구성 드리프트를 감사하고 복구합니다.



  **Linux (systemd user)**

```bash
openclaw gateway install
systemctl --user enable --now openclaw-gateway[-&lt;profile&gt;].service
openclaw gateway status
```

로그아웃 후 지속성을 위해 링거링을 활성화하십시오:

```bash
sudo loginctl enable-linger &lt;user&gt;
```

사용자 정의 설치 경로가 필요한 경우의 수동 사용자 유닛 예시:

```ini
[Unit]
Description=OpenClaw Gateway
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/openclaw gateway --port 18789
Restart=always
RestartSec=5
TimeoutStopSec=30
TimeoutStartSec=30
SuccessExitStatus=0 143
KillMode=control-group

[Install]
WantedBy=default.target
```



  **Windows (native)**

```powershell
openclaw gateway install
openclaw gateway status --json
openclaw gateway restart
openclaw gateway stop
```

네이티브 Windows 관리 시작은 `OpenClaw Gateway`(또는 명명된 프로파일의 경우 `OpenClaw Gateway (&lt;profile&gt;)`)라는 예약 작업을 사용합니다. 예약 작업 생성이 거부되면, OpenClaw는 상태 디렉토리 내의 `gateway.cmd`를 가리키는 사용자별 시작 폴더 런처로 폴백합니다.



  **Linux (system service)**

다중 사용자/상시 실행 호스트에는 시스템 유닛을 사용하십시오.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now openclaw-gateway[-&lt;profile&gt;].service
```

사용자 유닛과 동일한 서비스 본문을 사용하되,
`/etc/systemd/system/openclaw-gateway[-&lt;profile&gt;].service`에 설치하고
`openclaw` 바이너리가 다른 곳에 있으면 `ExecStart=`를 조정하십시오.



## 한 호스트의 복수 게이트웨이

대부분의 설정은 **하나**의 게이트웨이를 실행해야 합니다.
엄격한 격리/이중화(예: 구조 프로파일)에만 복수를 사용하십시오.

인스턴스별 체크리스트:

- 고유한 `gateway.port`
- 고유한 `OPENCLAW_CONFIG_PATH`
- 고유한 `OPENCLAW_STATE_DIR`
- 고유한 `agents.defaults.workspace`

예시:

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw/a.json OPENCLAW_STATE_DIR=~/.openclaw-a openclaw gateway --port 19001
OPENCLAW_CONFIG_PATH=~/.openclaw/b.json OPENCLAW_STATE_DIR=~/.openclaw-b openclaw gateway --port 19002
```

참고: [복수 게이트웨이](/gateway/multiple-gateways).

### 개발 프로파일 빠른 경로

```bash
openclaw --dev setup
openclaw --dev gateway --allow-unconfigured
openclaw --dev status
```

기본값에는 격리된 상태/구성과 기본 게이트웨이 포트 `19001`이 포함됩니다.

## 프로토콜 빠른 참조 (오퍼레이터 뷰)

- 첫 번째 클라이언트 프레임은 `connect`여야 합니다.
- 게이트웨이는 `hello-ok` 스냅샷(`presence`, `health`, `stateVersion`, `uptimeMs`, 제한/정책)을 반환합니다.
- `hello-ok.features.methods` / `events`는 모든 호출 가능한 헬퍼 라우트의 생성된 덤프가 아닌 보수적인 검색 목록입니다.
- 요청: `req(method, params)` → `res(ok/payload|error)`.
- 일반적인 이벤트에는 `connect.challenge`, `agent`, `chat`,
  `session.message`, `session.tool`, `sessions.changed`, `presence`, `tick`,
  `health`, `heartbeat`, 페어링/승인 라이프사이클 이벤트, `shutdown`이 포함됩니다.

에이전트 실행은 2단계입니다:

1. 즉각적인 수락 확인 (`status:"accepted"`)
2. 최종 완료 응답 (`status:"ok"|"error"`), 그 사이에 스트리밍된 `agent` 이벤트 포함.

전체 프로토콜 문서: [게이트웨이 프로토콜](/gateway/protocol).

## 운영 확인

### 활성 확인

- WS를 열고 `connect`를 보냅니다.
- 스냅샷과 함께 `hello-ok` 응답을 기대합니다.

### 준비 상태 확인

```bash
openclaw gateway status
openclaw channels status --probe
openclaw health
```

### 갭 복구

이벤트는 재생되지 않습니다. 시퀀스 갭이 있으면 계속하기 전에 상태를 새로 고침(`health`, `system-presence`)하십시오.

## 일반적인 실패 시그니처

| 시그니처                                                      | 가능한 문제                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `refusing to bind gateway ... without auth`                    | 유효한 게이트웨이 인증 경로 없이 루프백이 아닌 바인드                             |
| `another gateway instance is already listening` / `EADDRINUSE` | 포트 충돌                                                                   |
| `Gateway start blocked: set gateway.mode=local`                | 구성이 원격 모드로 설정되었거나, 손상된 구성에서 로컬 모드 스탬프 누락 |
| `unauthorized` during connect                                  | 클라이언트와 게이트웨이 간 인증 불일치                                        |

전체 진단 사다리는 [게이트웨이 문제 해결](/gateway/troubleshooting)을 사용하십시오.

## 안전 보장

- 게이트웨이 프로토콜 클라이언트는 게이트웨이를 사용할 수 없을 때 빠르게 실패합니다(암묵적인 직접 채널 폴백 없음).
- 유효하지 않은/connect가 아닌 첫 번째 프레임은 거부되고 닫힙니다.
- 정상 종료는 소켓 닫기 전에 `shutdown` 이벤트를 발송합니다.

---

관련:

- [문제 해결](/gateway/troubleshooting)
- [백그라운드 프로세스](/gateway/background-process)
- [구성](/gateway/configuration)
- [상태](/gateway/health)
- [Doctor](/gateway/doctor)
- [인증](/gateway/authentication)
