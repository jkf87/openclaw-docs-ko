---
summary: "WeChat(Weixin) 채널 플러그인 설정, 로그인, 호환성, 문제 해결"
read_when:
  - OpenClaw를 WeChat에 연결하려는 경우
  - Tencent의 외부 `openclaw-weixin` 플러그인을 설치/업데이트하는 경우
  - WeChat 계정 여러 개를 라우팅하려는 경우
title: "WeChat"
---

# WeChat

OpenClaw는 Tencent의 외부 `@tencent-weixin/openclaw-weixin` 채널 플러그인을 통해 WeChat에 연결됩니다.

상태: 외부 플러그인. 1:1 채팅과 미디어는 지원됩니다. 그룹 채팅은 현재 플러그인 기능 메타데이터에서 명시되지 않습니다.

## 이름 표기

- **WeChat**은 문서에서 사용자에게 노출되는 이름입니다.
- **Weixin**은 Tencent 패키지와 플러그인 ID에서 사용되는 이름입니다.
- `openclaw-weixin`은 OpenClaw 채널 ID입니다.
- `@tencent-weixin/openclaw-weixin`은 npm 패키지 이름입니다.

CLI 명령과 설정 경로에서는 `openclaw-weixin`을 사용하세요.

## 작동 방식

WeChat 코드는 OpenClaw 코어 저장소에 들어 있지 않습니다. OpenClaw는 범용 채널 플러그인 계약을 제공하고, 외부 플러그인이 WeChat 전용 런타임을 제공합니다:

1. `openclaw plugins install`로 `@tencent-weixin/openclaw-weixin`을 설치합니다.
2. Gateway가 플러그인 매니페스트를 발견하고 진입점을 로드합니다.
3. 플러그인이 채널 ID `openclaw-weixin`을 등록합니다.
4. `openclaw channels login --channel openclaw-weixin`으로 QR 로그인을 시작합니다.
5. 플러그인이 OpenClaw 상태 디렉터리 아래에 계정 자격 증명을 저장합니다.
6. Gateway가 시작되면 플러그인이 각 설정된 계정에 대해 Weixin 모니터를 실행합니다.
7. 인바운드 WeChat 메시지는 채널 계약을 통해 정규화되어 선택된 OpenClaw 에이전트로 라우팅되고, 응답은 플러그인 아웃바운드 경로로 전송됩니다.

이 분리는 의도적입니다: OpenClaw 코어는 채널 비의존적으로 유지됩니다. WeChat 로그인, Tencent iLink API 호출, 미디어 업/다운로드, 컨텍스트 토큰, 계정 모니터링은 외부 플러그인이 소유합니다.

## 설치

빠른 설치:

```bash
npx -y @tencent-weixin/openclaw-weixin-cli install
```

수동 설치:

```bash
openclaw plugins install "@tencent-weixin/openclaw-weixin"
openclaw config set plugins.entries.openclaw-weixin.enabled true
```

설치 후 Gateway를 재시작하세요:

```bash
openclaw gateway restart
```

## 로그인

Gateway가 실행 중인 동일한 머신에서 QR 로그인을 실행합니다:

```bash
openclaw channels login --channel openclaw-weixin
```

휴대전화의 WeChat 앱으로 QR 코드를 스캔하고 로그인을 확인합니다. 스캔 성공 후 플러그인이 계정 토큰을 로컬에 저장합니다.

WeChat 계정을 더 추가하려면 동일한 로그인 명령을 다시 실행합니다. 여러 계정의 경우 계정, 채널, 발신자별로 DM 세션을 분리하세요:

```bash
openclaw config set session.dmScope per-account-channel-peer
```

## 접근 제어

1:1 메시지는 채널 플러그인에 대한 일반적인 OpenClaw 페어링 및 허용 목록 모델을 사용합니다.

새 발신자 승인:

```bash
openclaw pairing list openclaw-weixin
openclaw pairing approve openclaw-weixin <CODE>
```

전체 접근 제어 모델은 [페어링](/channels/pairing)을 참조하세요.

## 호환성

플러그인은 시작 시 호스트 OpenClaw 버전을 확인합니다.

| 플러그인 라인 | OpenClaw 버전           | npm 태그 |
| ------------- | ----------------------- | -------- |
| `2.x`         | `>=2026.3.22`           | `latest` |
| `1.x`         | `>=2026.1.0 <2026.3.22` | `legacy` |

플러그인이 OpenClaw 버전이 너무 오래되었다고 보고하면 OpenClaw를 업데이트하거나 레거시 플러그인 라인을 설치하세요:

```bash
openclaw plugins install @tencent-weixin/openclaw-weixin@legacy
```

## 사이드카 프로세스

WeChat 플러그인은 Tencent iLink API를 모니터링하는 동안 Gateway 옆에서 헬퍼 작업을 실행할 수 있습니다. 이슈 #68451에서 이 헬퍼 경로는 OpenClaw의 범용 stale Gateway 정리 로직에서 버그를 드러냈습니다: 자식 프로세스가 부모 Gateway 프로세스를 정리하려 시도해, systemd 같은 프로세스 매니저 아래에서 재시작 루프를 일으켰습니다.

현재 OpenClaw 시작 시 정리 로직은 현재 프로세스와 그 조상들을 제외하므로, 채널 헬퍼가 자기를 실행한 Gateway를 죽이지 않습니다. 이 수정은 범용이며 코어의 WeChat 전용 경로가 아닙니다.

## 문제 해결

설치 및 상태 확인:

```bash
openclaw plugins list
openclaw channels status --probe
openclaw --version
```

채널이 설치됨으로 표시되지만 연결되지 않으면 플러그인이 활성화되어 있는지 확인하고 재시작합니다:

```bash
openclaw config set plugins.entries.openclaw-weixin.enabled true
openclaw gateway restart
```

WeChat 활성화 후 Gateway가 반복해서 재시작되면 OpenClaw와 플러그인을 모두 업데이트합니다:

```bash
npm view @tencent-weixin/openclaw-weixin version
openclaw plugins install "@tencent-weixin/openclaw-weixin" --force
openclaw gateway restart
```

임시 비활성화:

```bash
openclaw config set plugins.entries.openclaw-weixin.enabled false
openclaw gateway restart
```

## 관련 문서

- 채널 개요: [채팅 채널](/channels/)
- 페어링: [페어링](/channels/pairing)
- 채널 라우팅: [채널 라우팅](/channels/channel-routing)
- 플러그인 아키텍처: [플러그인 아키텍처](/plugins/architecture)
- 채널 플러그인 SDK: [채널 플러그인 SDK](/plugins/sdk-channel-plugins)
- 외부 패키지: [@tencent-weixin/openclaw-weixin](https://www.npmjs.com/package/@tencent-weixin/openclaw-weixin)
