---
title: "브리지 프로토콜"
description: "과거 브리지 프로토콜 (레거시 노드): TCP JSONL, 페어링, 범위 지정 RPC"
---

# 브리지 프로토콜 (레거시 노드 전송)

::: warning
TCP 브리지가 **제거되었습니다**. 현재 OpenClaw 빌드는 브리지 리스너를 포함하지 않으며 `bridge.*` 구성 키는 더 이상 스키마에 없습니다. 이 페이지는 과거 참조를 위해 유지됩니다. 모든 노드/오퍼레이터 클라이언트에 대해 [게이트웨이 프로토콜](/gateway/protocol)을 사용하십시오.
:::


## 존재했던 이유

- **보안 경계**: 브리지는 전체 게이트웨이 API 표면 대신 소규모 허용 목록을 노출합니다.
- **페어링 + 노드 ID**: 노드 허가는 게이트웨이가 소유하며 노드별 토큰에 연결됩니다.
- **검색 UX**: 노드는 LAN에서 Bonjour를 통해 게이트웨이를 검색하거나, tailnet을 통해 직접 연결할 수 있습니다.
- **루프백 WS**: 전체 WS 컨트롤 플레인은 SSH를 통해 터널링되지 않는 한 로컬에 유지됩니다.

## 전송

- TCP, 줄당 하나의 JSON 객체(JSONL).
- 선택적 TLS (`bridge.tls.enabled`가 true인 경우).
- 과거 기본 리스너 포트는 `18790`이었습니다(현재 빌드는 TCP 브리지를 시작하지 않음).

TLS가 활성화된 경우, 검색 TXT 레코드에는 `bridgeTls=1`과 함께
`bridgeTlsSha256`가 비시크릿 힌트로 포함됩니다. Bonjour/mDNS TXT 레코드는
인증되지 않음에 유의하십시오; 클라이언트는 명시적인 사용자 의도나 다른 대역 외 검증 없이
광고된 지문을 권위 있는 핀으로 취급해서는 안 됩니다.

## 핸드셰이크 + 페어링

1. 클라이언트는 노드 메타데이터 + 토큰(이미 페어링된 경우)과 함께 `hello`를 보냅니다.
2. 페어링되지 않은 경우, 게이트웨이는 `error`(`NOT_PAIRED`/`UNAUTHORIZED`)로 응답합니다.
3. 클라이언트가 `pair-request`를 보냅니다.
4. 게이트웨이는 승인을 기다린 후 `pair-ok`와 `hello-ok`를 보냅니다.

과거에 `hello-ok`는 `serverName`을 반환하고 `canvasHostUrl`을 포함할 수 있었습니다.

## 프레임

클라이언트 → 게이트웨이:

- `req` / `res`: 범위 지정 게이트웨이 RPC (chat, sessions, config, health, voicewake, skills.bins)
- `event`: 노드 신호 (음성 기록, 에이전트 요청, 채팅 구독, exec 라이프사이클)

게이트웨이 → 클라이언트:

- `invoke` / `invoke-res`: 노드 명령 (`canvas.*`, `camera.*`, `screen.record`, `location.get`, `sms.send`)
- `event`: 구독된 세션의 채팅 업데이트
- `ping` / `pong`: 킵얼라이브

레거시 허용 목록 적용은 `src/gateway/server-bridge.ts`에 있었습니다(제거됨).

## Exec 라이프사이클 이벤트

노드는 system.run 활동을 표시하기 위해 `exec.finished` 또는 `exec.denied` 이벤트를 발송할 수 있습니다.
이는 게이트웨이의 시스템 이벤트에 매핑됩니다. (레거시 노드는 여전히 `exec.started`를 발송할 수 있습니다.)

페이로드 필드 (명시되지 않는 한 모두 선택적):

- `sessionKey` (필수): 시스템 이벤트를 받을 에이전트 세션.
- `runId`: 그룹화를 위한 고유한 exec id.
- `command`: 원시 또는 형식화된 명령 문자열.
- `exitCode`, `timedOut`, `success`, `output`: 완료 세부 정보 (완료된 경우에만).
- `reason`: 거부 이유 (거부된 경우에만).

## 과거 tailnet 사용

- 브리지를 tailnet IP에 바인딩: `~/.openclaw/openclaw.json`에서 `bridge.bind: "tailnet"` (과거에만; `bridge.*`는 더 이상 유효하지 않음).
- 클라이언트는 MagicDNS 이름이나 tailnet IP를 통해 연결됩니다.
- Bonjour는 네트워크를 **넘지 않습니다**; 필요한 경우 수동 호스트/포트 또는 광역 DNS-SD를 사용하십시오.

## 버전 관리

브리지는 **암묵적 v1**이었습니다(최소/최대 협상 없음). 이 섹션은
과거 참조 전용입니다; 현재 노드/오퍼레이터 클라이언트는 WebSocket
[게이트웨이 프로토콜](/gateway/protocol)을 사용합니다.
