---
summary: "Gateway 소유 노드 페어링(Option B): iOS 및 기타 원격 노드용"
read_when:
  - macOS UI 없이 노드 페어링 승인을 구현할 때
  - 원격 노드 승인을 위한 CLI 플로우 추가 시
  - 노드 관리로 게이트웨이 프로토콜을 확장할 때
title: "Gateway 소유 페어링 (pairing)"
---

# Gateway 소유 페어링 (Option B)

Gateway 소유 페어링에서는 **Gateway**가 어떤 노드가 조인할 수 있는지에 대한 진실의 원천입니다. UI(macOS 앱, 향후 클라이언트)는 대기 중인 요청을 승인하거나 거부하는 프론트엔드일 뿐입니다.

**중요:** WS 노드는 `connect` 중에 **장치 페어링**(role `node`)을 사용합니다. `node.pair.*`는 별도의 페어링 저장소이며 WS 핸드셰이크를 **게이트하지 않습니다**. 명시적으로 `node.pair.*`를 호출하는 클라이언트만 이 플로우를 사용합니다.

## 개념

- **Pending request**: 노드가 조인을 요청했으며, 승인이 필요합니다.
- **Paired node**: 승인된 노드로, auth token이 발급되었습니다.
- **Transport**: Gateway WS 엔드포인트는 요청을 전달하지만 멤버십을 결정하지 않습니다. (레거시 TCP 브리지 지원은 제거되었습니다.)

## 페어링 작동 방식

1. 노드가 Gateway WS에 연결하고 페어링을 요청합니다.
2. Gateway가 **pending request**를 저장하고 `node.pair.requested`를 발행합니다.
3. 요청을 승인하거나 거부합니다(CLI 또는 UI).
4. 승인 시, Gateway가 **새 token**을 발급합니다(재페어링 시 토큰이 로테이션됩니다).
5. 노드가 토큰을 사용하여 재연결하고 이제 "paired" 상태가 됩니다.

Pending request는 **5분** 후 자동으로 만료됩니다.

## CLI 워크플로 (헤드리스 친화적)

```bash
openclaw nodes pending
openclaw nodes approve <requestId>
openclaw nodes reject <requestId>
openclaw nodes status
openclaw nodes rename --node <id|name|ip> --name "Living Room iPad"
```

`nodes status`는 paired/connected 노드와 그 capability를 보여줍니다.

## API 표면 (게이트웨이 프로토콜)

Events:

- `node.pair.requested` — 새 pending request가 생성될 때 발행됩니다.
- `node.pair.resolved` — 요청이 승인/거부/만료될 때 발행됩니다.

Methods:

- `node.pair.request` — pending request 생성 또는 재사용.
- `node.pair.list` — pending + paired 노드 목록(`operator.pairing`).
- `node.pair.approve` — pending request 승인(토큰 발급).
- `node.pair.reject` — pending request 거부.
- `node.pair.verify` — `{ nodeId, token }` 검증.

참고 사항:

- `node.pair.request`는 노드별로 멱등적입니다: 반복 호출은 동일한 pending request를 반환합니다.
- 동일한 pending 노드에 대한 반복 요청은 저장된 노드 메타데이터와 운영자 가시성을 위한 최신 허용 목록 선언 명령 스냅샷도 갱신합니다.
- 승인은 **항상** 새 토큰을 생성합니다. `node.pair.request`에서는 토큰이 반환되지 않습니다.
- 요청에는 자동 승인 플로우용 힌트로 `silent: true`가 포함될 수 있습니다.
- `node.pair.approve`는 pending request의 선언된 명령을 사용하여 추가 승인 스코프를 강제합니다:
  - 명령 없는 요청: `operator.pairing`
  - 비 exec 명령 요청: `operator.pairing` + `operator.write`
  - `system.run` / `system.run.prepare` / `system.which` 요청: `operator.pairing` + `operator.admin`

중요:

- 노드 페어링은 신뢰/아이덴티티 플로우와 토큰 발급입니다.
- 이는 노드별 라이브 노드 명령 표면을 **고정하지 않습니다**.
- 라이브 노드 명령은 게이트웨이의 전역 노드 명령 정책(`gateway.nodes.allowCommands` / `denyCommands`)이 적용된 후 노드가 connect 시 선언하는 것에서 옵니다.
- 노드별 `system.run` allow/ask 정책은 페어링 레코드가 아닌 노드의 `exec.approvals.node.*`에 있습니다.

## 노드 명령 게이팅 (2026.3.31+)

<Warning>
**Breaking change:** `2026.3.31`부터 노드 페어링이 승인될 때까지 노드 명령이 비활성화됩니다. 장치 페어링만으로는 더 이상 선언된 노드 명령을 노출하기에 충분하지 않습니다.
</Warning>

노드가 처음 연결될 때, 페어링이 자동으로 요청됩니다. 페어링 요청이 승인될 때까지, 해당 노드의 모든 pending 노드 명령은 필터링되며 실행되지 않습니다. 페어링 승인을 통해 신뢰가 확립되면, 노드의 선언된 명령은 정상적인 명령 정책의 대상이 되어 사용 가능해집니다.

이는 다음을 의미합니다:

- 이전에 장치 페어링만으로 명령을 노출하는 데 의존했던 노드는 이제 노드 페어링을 완료해야 합니다.
- 페어링 승인 이전에 큐에 들어간 명령은 지연(deferred)되지 않고 삭제(dropped)됩니다.

## 노드 이벤트 신뢰 경계 (2026.3.31+)

<Warning>
**Breaking change:** 노드에서 시작된 실행은 이제 축소된 신뢰 표면에 머뭅니다.
</Warning>

노드에서 시작된 요약 및 관련 세션 이벤트는 의도된 신뢰 표면으로 제한됩니다. 이전에 더 넓은 호스트 또는 세션 툴 접근에 의존했던 알림 기반 또는 노드 트리거 플로우는 조정이 필요할 수 있습니다. 이 강화는 노드 이벤트가 노드의 신뢰 경계가 허용하는 것을 넘어 호스트 레벨 툴 접근으로 상승하는 것을 방지합니다.

## 자동 승인 (macOS 앱)

macOS 앱은 다음의 경우 선택적으로 **silent 승인**을 시도할 수 있습니다:

- 요청이 `silent`로 표시되어 있고
- 앱이 동일한 사용자로 게이트웨이 호스트에 대한 SSH 연결을 검증할 수 있는 경우.

silent 승인이 실패하면, 일반적인 "Approve/Reject" 프롬프트로 폴백됩니다.

## 메타데이터 업그레이드 자동 승인

이미 페어링된 장치가 민감하지 않은 메타데이터 변경(예: 표시 이름 또는 클라이언트 플랫폼 힌트)만으로 재연결하는 경우, OpenClaw는 이를 `metadata-upgrade`로 취급합니다. Silent 자동 승인은 좁게 제한됩니다: loopback을 통해 공유 토큰 또는 password의 소유를 이미 증명한 신뢰할 수 있는 로컬 CLI/helper 재연결에만 적용됩니다. 브라우저/Control UI 클라이언트와 원격 클라이언트는 여전히 명시적 재승인 플로우를 사용합니다. 스코프 업그레이드(read에서 write/admin으로) 및 공개 키 변경은 메타데이터 업그레이드 자동 승인의 **대상이 아닙니다** — 이는 명시적 재승인 요청으로 유지됩니다.

## QR 페어링 헬퍼

`/pair qr`은 페어링 페이로드를 구조화된 미디어로 렌더링하여 모바일 및 브라우저 클라이언트가 직접 스캔할 수 있도록 합니다.

장치를 삭제하면 해당 장치 id에 대한 모든 오래된 pending 페어링 요청도 정리되므로, 취소 후에는 `nodes pending`에 고아 행이 표시되지 않습니다.

## 로컬리티(locality) 및 forwarded 헤더

Gateway pairing은 raw 소켓과 상위 프록시 증거가 모두 일치할 때만 연결을 loopback으로 취급합니다. 요청이 loopback에 도착했지만 비로컬 원본을 가리키는 `X-Forwarded-For` / `X-Forwarded-Host` / `X-Forwarded-Proto` 헤더를 포함하는 경우, 해당 forwarded-header 증거가 loopback 로컬리티 주장을 실격시킵니다. 그러면 페어링 경로는 요청을 동일 호스트 연결로 조용히 취급하는 대신 명시적 승인을 요구합니다. 운영자 인증에 대한 동등한 규칙은 [신뢰할 수 있는 프록시 인증](/gateway/trusted-proxy-auth)을 참조하십시오.

## 저장소 (로컬, 비공개)

페어링 상태는 Gateway state 디렉토리(기본값 `~/.openclaw`) 아래에 저장됩니다:

- `~/.openclaw/nodes/paired.json`
- `~/.openclaw/nodes/pending.json`

`OPENCLAW_STATE_DIR`을 재정의하면, `nodes/` 폴더가 그와 함께 이동합니다.

보안 참고:

- 토큰은 시크릿입니다. `paired.json`을 민감 정보로 취급하십시오.
- 토큰을 로테이션하려면 재승인(또는 노드 항목 삭제)이 필요합니다.

## Transport 동작

- Transport는 **stateless**입니다. 멤버십을 저장하지 않습니다.
- Gateway가 오프라인이거나 페어링이 비활성화된 경우, 노드는 페어링할 수 없습니다.
- Gateway가 원격 모드인 경우, 페어링은 여전히 원격 Gateway의 저장소에 대해 수행됩니다.

## 관련

- [채널 페어링](/channels/pairing)
- [노드](/nodes/)
- [Devices CLI](/cli/devices)
