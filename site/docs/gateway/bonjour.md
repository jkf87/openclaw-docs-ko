---
title: "Bonjour 검색"
description: "Bonjour/mDNS 검색 + 디버깅 (게이트웨이 비콘, 클라이언트, 일반적인 실패 모드)"
---

# Bonjour / mDNS 검색

OpenClaw는 활성 게이트웨이(WebSocket 엔드포인트)를 검색하기 위해 Bonjour(mDNS / DNS-SD)를 사용합니다.
멀티캐스트 `local.` 탐색은 **LAN 전용 편의 기능**입니다. 교차 네트워크 검색의 경우,
동일한 비콘을 구성된 광역 DNS-SD 도메인을 통해서도 게시할 수 있습니다. 검색은
여전히 최선 노력이며 SSH 또는 Tailnet 기반 연결을 **대체하지 않습니다**.

## Tailscale을 통한 광역 Bonjour (유니캐스트 DNS-SD)

노드와 게이트웨이가 다른 네트워크에 있는 경우, 멀티캐스트 mDNS는 경계를 넘지 못합니다.
Tailscale을 통한 **유니캐스트 DNS-SD**("광역 Bonjour")로 전환하여 동일한 검색 UX를 유지할 수 있습니다.

고수준 단계:

1. 게이트웨이 호스트에서 DNS 서버를 실행합니다(Tailnet을 통해 도달 가능).
2. 전용 영역(예: `openclaw.internal.`)에서 `_openclaw-gw._tcp`에 대한 DNS-SD 레코드를 게시합니다.
3. 선택한 도메인이 클라이언트(iOS 포함)의 해당 DNS 서버를 통해 해석되도록 Tailscale **분할 DNS**를 구성합니다.

OpenClaw는 모든 검색 도메인을 지원합니다; `openclaw.internal.`은 단순한 예시입니다.
iOS/Android 노드는 `local.`과 구성된 광역 도메인 모두를 탐색합니다.

### 게이트웨이 구성 (권장)

```json5
{
  gateway: { bind: "tailnet" }, // tailnet 전용 (권장)
  discovery: { wideArea: { enabled: true } }, // 광역 DNS-SD 게시 활성화
}
```

### 일회성 DNS 서버 설정 (게이트웨이 호스트)

```bash
openclaw dns setup --apply
```

이 명령은 CoreDNS를 설치하고 다음과 같이 구성합니다:

- 게이트웨이의 Tailscale 인터페이스에서만 포트 53에서 수신
- `~/.openclaw/dns/&lt;domain&gt;.db`에서 선택한 도메인(예: `openclaw.internal.`)을 제공

tailnet 연결 머신에서 검증:

```bash
dns-sd -B _openclaw-gw._tcp openclaw.internal.
dig @&lt;TAILNET_IPV4&gt; -p 53 _openclaw-gw._tcp.openclaw.internal PTR +short
```

### Tailscale DNS 설정

Tailscale 관리자 콘솔에서:

- 게이트웨이의 tailnet IP를 가리키는 네임서버를 추가합니다(UDP/TCP 53).
- 검색 도메인이 해당 네임서버를 사용하도록 분할 DNS를 추가합니다.

클라이언트가 tailnet DNS를 수락하면, iOS 노드와 CLI 검색이 멀티캐스트 없이
검색 도메인에서 `_openclaw-gw._tcp`를 탐색할 수 있습니다.

### 게이트웨이 리스너 보안 (권장)

게이트웨이 WS 포트(기본값 `18789`)는 기본적으로 루프백에 바인딩됩니다. LAN/tailnet
접근의 경우, 명시적으로 바인딩하고 인증을 활성화 상태로 유지하십시오.

tailnet 전용 설정의 경우:

- `~/.openclaw/openclaw.json`에서 `gateway.bind: "tailnet"`을 설정합니다.
- 게이트웨이를 재시작합니다(또는 macOS 메뉴바 앱을 재시작합니다).

## 광고하는 항목

게이트웨이만 `_openclaw-gw._tcp`를 광고합니다.

## 서비스 유형

- `_openclaw-gw._tcp` — 게이트웨이 전송 비콘 (macOS/iOS/Android 노드에서 사용).

## TXT 키 (비시크릿 힌트)

게이트웨이는 UI 흐름을 편리하게 하기 위해 소규모 비시크릿 힌트를 광고합니다:

- `role=gateway`
- `displayName=&lt;friendly name&gt;`
- `lanHost=&lt;hostname&gt;.local`
- `gatewayPort=&lt;port&gt;` (게이트웨이 WS + HTTP)
- `gatewayTls=1` (TLS가 활성화된 경우에만)
- `gatewayTlsSha256=&lt;sha256&gt;` (TLS가 활성화되고 지문을 사용할 수 있는 경우에만)
- `canvasPort=&lt;port&gt;` (캔버스 호스트가 활성화된 경우에만; 현재 `gatewayPort`와 동일)
- `transport=gateway`
- `tailnetDns=&lt;magicdns&gt;` (Tailnet을 사용할 수 있는 경우 선택적 힌트)
- `sshPort=&lt;port&gt;` (mDNS 전체 모드에서만; 광역 DNS-SD는 생략할 수 있음)
- `cliPath=&lt;path&gt;` (mDNS 전체 모드에서만; 광역 DNS-SD는 여전히 원격 설치 힌트로 작성)

보안 참고:

- Bonjour/mDNS TXT 레코드는 **인증되지 않습니다**. 클라이언트는 TXT를 권위 있는 라우팅으로 취급해서는 안 됩니다.
- 클라이언트는 해석된 서비스 엔드포인트(SRV + A/AAAA)를 사용하여 라우팅해야 합니다. `lanHost`, `tailnetDns`, `gatewayPort`, `gatewayTlsSha256`는 힌트로만 취급하십시오.
- SSH 자동 타겟팅도 TXT 전용 힌트가 아닌 해석된 서비스 호스트를 사용해야 합니다.
- TLS 피닝은 광고된 `gatewayTlsSha256`가 이전에 저장된 핀을 재정의하는 것을 허용해서는 안 됩니다.
- iOS/Android 노드는 검색 기반 직접 연결을 **TLS 전용**으로 취급하고, 처음 지문을 신뢰하기 전에 명시적인 사용자 확인을 요구해야 합니다.

## macOS에서 디버깅

유용한 내장 툴:

- 인스턴스 탐색:

  ```bash
  dns-sd -B _openclaw-gw._tcp local.
  ```

- 하나의 인스턴스 해석 (`&lt;instance&gt;`를 대체):

  ```bash
  dns-sd -L "&lt;instance&gt;" _openclaw-gw._tcp local.
  ```

탐색은 작동하지만 해석이 실패하는 경우, 일반적으로 LAN 정책이나 mDNS 해석기 문제에 부딪히고 있는 것입니다.

## 게이트웨이 로그에서 디버깅

게이트웨이는 롤링 로그 파일을 작성합니다(시작 시 `gateway log file: ...`으로 출력됨). `bonjour:` 줄을 찾으십시오, 특히:

- `bonjour: advertise failed ...`
- `bonjour: ... name conflict resolved` / `hostname conflict resolved`
- `bonjour: watchdog detected non-announced service ...`

## iOS 노드에서 디버깅

iOS 노드는 `NWBrowser`를 사용하여 `_openclaw-gw._tcp`를 검색합니다.

로그 캡처 방법:

- 설정 → 게이트웨이 → 고급 → **Discovery Debug Logs**
- 설정 → 게이트웨이 → 고급 → **Discovery Logs** → 재현 → **복사**

로그에는 브라우저 상태 전환과 결과 집합 변경이 포함됩니다.

## 일반적인 실패 모드

- **Bonjour가 네트워크를 넘지 않음**: Tailnet 또는 SSH를 사용하십시오.
- **멀티캐스트 차단됨**: 일부 Wi-Fi 네트워크는 mDNS를 비활성화합니다.
- **절전 / 인터페이스 변동**: macOS가 일시적으로 mDNS 결과를 삭제할 수 있습니다; 재시도하십시오.
- **탐색은 되지만 해석 실패**: 머신 이름을 단순하게 유지하십시오(이모지나 구두점 사용 금지). 그런 다음 게이트웨이를 재시작하십시오. 서비스 인스턴스 이름은 호스트 이름에서 파생되므로, 너무 복잡한 이름은 일부 해석기를 혼란스럽게 할 수 있습니다.

## 이스케이프된 인스턴스 이름 (`\032`)

Bonjour/DNS-SD는 종종 서비스 인스턴스 이름의 바이트를 십진수 `\DDD` 시퀀스로 이스케이프합니다(예: 공백은 `\032`가 됨).

- 이는 프로토콜 레벨에서 정상입니다.
- UI는 표시를 위해 디코딩해야 합니다(iOS는 `BonjourEscapes.decode` 사용).

## 비활성화 / 구성

- `OPENCLAW_DISABLE_BONJOUR=1`은 광고를 비활성화합니다(레거시: `OPENCLAW_DISABLE_BONJOUR`).
- `~/.openclaw/openclaw.json`의 `gateway.bind`는 게이트웨이 바인드 모드를 제어합니다.
- `OPENCLAW_SSH_PORT`는 `sshPort`가 광고될 때 SSH 포트를 재정의합니다(레거시: `OPENCLAW_SSH_PORT`).
- `OPENCLAW_TAILNET_DNS`는 TXT에 MagicDNS 힌트를 게시합니다(레거시: `OPENCLAW_TAILNET_DNS`).
- `OPENCLAW_CLI_PATH`는 광고된 CLI 경로를 재정의합니다(레거시: `OPENCLAW_CLI_PATH`).

## 관련 문서

- 검색 정책 및 전송 선택: [검색](/gateway/discovery)
- 노드 페어링 + 승인: [게이트웨이 페어링](/gateway/pairing)
