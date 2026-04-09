---
summary: "iOS 노드 앱: 게이트웨이 연결, 페어링, canvas, 문제 해결"
read_when:
  - iOS 노드 페어링 또는 재연결 시
  - 소스에서 iOS 앱 실행 시
  - 게이트웨이 검색 또는 canvas 명령 디버깅 시
title: "iOS 앱"
---

# iOS 앱 (노드)

가용성: 내부 미리 보기. iOS 앱은 아직 공개 배포되지 않았습니다.

## 기능

- WebSocket을 통해 게이트웨이에 연결합니다 (LAN 또는 tailnet).
- 노드 기능을 노출합니다: Canvas, 화면 스냅샷, 카메라 캡처, 위치, 말하기 모드, 음성 wake.
- `node.invoke` 명령을 수신하고 노드 상태 이벤트를 보고합니다.

## 요구 사항

- 다른 기기에서 실행 중인 게이트웨이 (macOS, Linux, 또는 WSL2를 통한 Windows).
- 네트워크 경로:
  - Bonjour를 통한 동일 LAN, **또는**
  - 유니캐스트 DNS-SD를 통한 Tailnet (예시 도메인: `openclaw.internal.`), **또는**
  - 수동 호스트/포트 (대체).

## 빠른 시작 (페어링 + 연결)

1. 게이트웨이를 시작합니다:

```bash
openclaw gateway --port 18789
```

2. iOS 앱에서 설정을 열고 검색된 게이트웨이를 선택합니다 (또는 수동 호스트를 활성화하고 호스트/포트를 입력합니다).

3. 게이트웨이 호스트에서 페어링 요청을 승인합니다:

```bash
openclaw devices list
openclaw devices approve <requestId>
```

앱이 변경된 인증 세부 정보 (역할/범위/공개 키)로 페어링을 다시 시도하면 이전 보류 중인 요청이 대체되고 새 `requestId`가 생성됩니다. 승인 전에 `openclaw devices list`를 다시 실행하십시오.

4. 연결을 확인합니다:

```bash
openclaw nodes status
openclaw gateway call node.list --params "{}"
```

## 공식 빌드를 위한 릴레이 기반 푸시

공식 배포 iOS 빌드는 게이트웨이에 원시 APNs 토큰을 게시하는 대신 외부 푸시 릴레이를 사용합니다.

게이트웨이 측 요구 사항:

```json5
{
  gateway: {
    push: {
      apns: {
        relay: {
          baseUrl: "https://relay.example.com",
        },
      },
    },
  },
}
```

흐름 작동 방식:

- iOS 앱은 App Attest와 앱 영수증을 사용하여 릴레이에 등록합니다.
- 릴레이는 불투명한 릴레이 핸들과 등록 범위의 전송 권한을 반환합니다.
- iOS 앱은 페어링된 게이트웨이 ID를 가져와 릴레이 등록에 포함시키므로 릴레이 기반 등록이 해당 특정 게이트웨이에 위임됩니다.
- 앱은 `push.apns.register`로 릴레이 기반 등록을 페어링된 게이트웨이에 전달합니다.
- 게이트웨이는 저장된 릴레이 핸들을 `push.test`, 백그라운드 wake, wake 넛지에 사용합니다.
- 게이트웨이 릴레이 기본 URL은 공식/TestFlight iOS 빌드에 내장된 릴레이 URL과 일치해야 합니다.
- 앱이 나중에 다른 게이트웨이 또는 다른 릴레이 기본 URL을 가진 빌드에 연결하면 이전 바인딩을 재사용하는 대신 릴레이 등록을 새로 고칩니다.

이 경로에서 게이트웨이가 필요로 **하지 않는** 것:

- 배포 전체 릴레이 토큰 불필요.
- 공식/TestFlight 릴레이 기반 전송을 위한 직접 APNs 키 불필요.

예상되는 운영자 흐름:

1. 공식/TestFlight iOS 빌드를 설치합니다.
2. 게이트웨이에 `gateway.push.apns.relay.baseUrl`을 설정합니다.
3. 앱을 게이트웨이에 페어링하고 연결을 완료합니다.
4. APNs 토큰이 있고 운영자 세션이 연결되고 릴레이 등록이 성공한 후 앱이 자동으로 `push.apns.register`를 게시합니다.
5. 그 후 `push.test`, 재연결 wake, wake 넛지가 저장된 릴레이 기반 등록을 사용할 수 있습니다.

호환성 참고 사항:

- `OPENCLAW_APNS_RELAY_BASE_URL`은 여전히 게이트웨이의 임시 환경 재정의로 작동합니다.

## 인증 및 신뢰 흐름

릴레이는 공식 iOS 빌드에 대해 직접 APNs-on-gateway가 제공할 수 없는 두 가지 제약을 시행하기 위해 존재합니다:

- Apple을 통해 배포된 정품 OpenClaw iOS 빌드만 호스팅 릴레이를 사용할 수 있습니다.
- 게이트웨이는 해당 특정 게이트웨이와 페어링된 iOS 기기에 대해서만 릴레이 기반 푸시를 보낼 수 있습니다.

단계별:

1. `iOS 앱 -> 게이트웨이`
   - 앱은 먼저 일반 게이트웨이 인증 흐름을 통해 게이트웨이와 페어링합니다.
   - 이를 통해 앱은 인증된 노드 세션과 인증된 운영자 세션을 얻습니다.
   - 운영자 세션은 `gateway.identity.get`을 호출하는 데 사용됩니다.

2. `iOS 앱 -> 릴레이`
   - 앱은 HTTPS를 통해 릴레이 등록 엔드포인트를 호출합니다.
   - 등록에는 App Attest 증명과 앱 영수증이 포함됩니다.
   - 릴레이는 번들 ID, App Attest 증명, Apple 영수증을 검증하고 공식/프로덕션 배포 경로를 요구합니다.
   - 이것이 로컬 Xcode/dev 빌드가 호스팅 릴레이를 사용하지 못하도록 차단합니다. 로컬 빌드는 서명될 수 있지만 릴레이가 기대하는 공식 Apple 배포 증명을 충족하지 않습니다.

3. `게이트웨이 ID 위임`
   - 릴레이 등록 전에 앱은 `gateway.identity.get`에서 페어링된 게이트웨이 ID를 가져옵니다.
   - 앱은 해당 게이트웨이 ID를 릴레이 등록 페이로드에 포함시킵니다.
   - 릴레이는 해당 게이트웨이 ID에 위임된 릴레이 핸들과 등록 범위의 전송 권한을 반환합니다.

4. `게이트웨이 -> 릴레이`
   - 게이트웨이는 `push.apns.register`에서 릴레이 핸들과 전송 권한을 저장합니다.
   - `push.test`, 재연결 wake, wake 넛지 시 게이트웨이는 자체 기기 ID로 전송 요청에 서명합니다.
   - 릴레이는 등록의 위임된 게이트웨이 ID에 대해 저장된 전송 권한과 게이트웨이 서명을 모두 검증합니다.
   - 다른 게이트웨이는 핸들을 얻더라도 저장된 등록을 재사용할 수 없습니다.

5. `릴레이 -> APNs`
   - 릴레이는 공식 빌드의 프로덕션 APNs 자격 증명과 원시 APNs 토큰을 소유합니다.
   - 게이트웨이는 릴레이 기반 공식 빌드의 원시 APNs 토큰을 저장하지 않습니다.
   - 릴레이는 페어링된 게이트웨이를 대신하여 APNs에 최종 푸시를 보냅니다.

이 설계가 만들어진 이유:

- 프로덕션 APNs 자격 증명을 사용자 게이트웨이 밖에 유지하기 위해.
- 게이트웨이에 원시 공식 빌드 APNs 토큰을 저장하지 않기 위해.
- 공식/TestFlight OpenClaw 빌드에 대해서만 호스팅 릴레이 사용을 허용하기 위해.
- 한 게이트웨이가 다른 게이트웨이 소유의 iOS 기기에 wake 푸시를 보내는 것을 방지하기 위해.

로컬/수동 빌드는 직접 APNs를 계속 사용합니다. 릴레이 없이 해당 빌드를 테스트하는 경우 게이트웨이에는 직접 APNs 자격 증명이 필요합니다:

```bash
export OPENCLAW_APNS_TEAM_ID="TEAMID"
export OPENCLAW_APNS_KEY_ID="KEYID"
export OPENCLAW_APNS_PRIVATE_KEY_P8="$(cat /path/to/AuthKey_KEYID.p8)"
```

이것들은 게이트웨이 호스트 런타임 환경 변수이며 Fastlane 설정이 아닙니다. `apps/ios/fastlane/.env`는 `ASC_KEY_ID` 및 `ASC_ISSUER_ID`와 같은 App Store Connect / TestFlight 인증만 저장하며 로컬 iOS 빌드에 대한 직접 APNs 전송을 구성하지 않습니다.

권장 게이트웨이 호스트 스토리지:

```bash
mkdir -p ~/.openclaw/credentials/apns
chmod 700 ~/.openclaw/credentials/apns
mv /path/to/AuthKey_KEYID.p8 ~/.openclaw/credentials/apns/AuthKey_KEYID.p8
chmod 600 ~/.openclaw/credentials/apns/AuthKey_KEYID.p8
export OPENCLAW_APNS_PRIVATE_KEY_PATH="$HOME/.openclaw/credentials/apns/AuthKey_KEYID.p8"
```

`.p8` 파일을 커밋하거나 저장소 체크아웃 아래에 두지 마십시오.

## 검색 경로

### Bonjour (LAN)

iOS 앱은 `local.`과 구성된 경우 동일한 광역 DNS-SD 검색 도메인에서 `_openclaw-gw._tcp`를 탐색합니다. 동일 LAN 게이트웨이는 `local.`에서 자동으로 나타납니다. 크로스 네트워크 검색은 비콘 유형을 변경하지 않고 구성된 광역 도메인을 사용할 수 있습니다.

### Tailnet (크로스 네트워크)

mDNS가 차단된 경우 유니캐스트 DNS-SD 구역 (도메인 선택; 예: `openclaw.internal.`)과 Tailscale split DNS를 사용하십시오.
CoreDNS 예시는 [Bonjour](/gateway/bonjour)를 참조하십시오.

### 수동 호스트/포트

설정에서 **Manual Host**를 활성화하고 게이트웨이 호스트 + 포트 (기본값 `18789`)를 입력합니다.

## Canvas + A2UI

iOS 노드는 WKWebView canvas를 렌더링합니다. `node.invoke`를 사용하여 구동합니다:

```bash
openclaw nodes invoke --node "iOS Node" --command canvas.navigate --params '{"url":"http://<gateway-host>:18789/__openclaw__/canvas/"}'
```

참고:

- 게이트웨이 canvas 호스트는 `/__openclaw__/canvas/`와 `/__openclaw__/a2ui/`를 제공합니다.
- 게이트웨이 HTTP 서버에서 제공됩니다 (`gateway.port`와 동일한 포트, 기본값 `18789`).
- iOS 노드는 canvas 호스트 URL이 광고되면 연결 시 A2UI로 자동 이동합니다.
- `canvas.navigate`와 `{"url":""}`로 내장 스캐폴드로 돌아갑니다.

### Canvas eval / snapshot

```bash
openclaw nodes invoke --node "iOS Node" --command canvas.eval --params '{"javaScript":"(() => { const {ctx} = window.__openclaw; ctx.clearRect(0,0,innerWidth,innerHeight); ctx.lineWidth=6; ctx.strokeStyle=\"#ff2d55\"; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(innerWidth-40, innerHeight-40); ctx.stroke(); return \"ok\"; })()"}'
```

```bash
openclaw nodes invoke --node "iOS Node" --command canvas.snapshot --params '{"maxWidth":900,"format":"jpeg"}'
```

## 음성 wake + 말하기 모드

- 음성 wake와 말하기 모드는 설정에서 사용할 수 있습니다.
- iOS는 백그라운드 오디오를 일시 중지할 수 있습니다. 앱이 활성 상태가 아닐 때는 음성 기능을 최선 노력으로 처리하십시오.

## 일반적인 오류

- `NODE_BACKGROUND_UNAVAILABLE`: iOS 앱을 전경으로 가져오십시오 (canvas/카메라/화면 명령에 필요).
- `A2UI_HOST_NOT_CONFIGURED`: 게이트웨이가 canvas 호스트 URL을 광고하지 않았습니다. [게이트웨이 구성](/gateway/configuration)에서 `canvasHost`를 확인하십시오.
- 페어링 프롬프트가 표시되지 않음: `openclaw devices list`를 실행하고 수동으로 승인하십시오.
- 재설치 후 재연결 실패: Keychain 페어링 토큰이 지워졌습니다. 노드를 다시 페어링하십시오.

## 관련 문서

- [페어링](/channels/pairing)
- [검색](/gateway/discovery)
- [Bonjour](/gateway/bonjour)
