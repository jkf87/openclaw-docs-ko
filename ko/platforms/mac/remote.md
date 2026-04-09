---
summary: "SSH를 통해 원격 OpenClaw 게이트웨이를 제어하는 macOS 앱 흐름"
read_when:
  - 원격 mac 제어 설정 또는 디버깅 시
title: "원격 제어"
---

# 원격 OpenClaw (macOS ⇄ 원격 호스트)

이 흐름을 통해 macOS 앱이 다른 호스트 (데스크탑/서버)에서 실행 중인 OpenClaw 게이트웨이의 완전한 원격 제어 역할을 할 수 있습니다. 앱의 **Remote over SSH** (원격 실행) 기능입니다. 상태 확인, Voice Wake 전달, Web Chat을 포함한 모든 기능이 _설정 → General_의 동일한 원격 SSH 구성을 재사용합니다.

## 모드

- **로컬 (이 Mac)**: 모든 것이 노트북에서 실행됩니다. SSH 관여 없음.
- **Remote over SSH (기본값)**: OpenClaw 명령이 원격 호스트에서 실행됩니다. mac 앱은 `-o BatchMode`와 선택한 ID/키 및 로컬 포트 포워딩으로 SSH 연결을 엽니다.
- **원격 직접 (ws/wss)**: SSH 터널 없음. mac 앱이 게이트웨이 URL에 직접 연결합니다 (예: Tailscale Serve 또는 공용 HTTPS 역방향 프록시를 통해).

## 원격 전송

원격 모드는 두 가지 전송을 지원합니다:

- **SSH 터널** (기본값): `ssh -N -L ...`을 사용하여 게이트웨이 포트를 로컬호스트로 전달합니다. 터널이 루프백이므로 게이트웨이는 노드 IP를 `127.0.0.1`로 봅니다.
- **직접 (ws/wss)**: 게이트웨이 URL에 바로 연결합니다. 게이트웨이는 실제 클라이언트 IP를 봅니다.

## 원격 호스트의 사전 요구 사항

1. Node + pnpm을 설치하고 OpenClaw CLI를 빌드/설치합니다 (`pnpm install && pnpm build && pnpm link --global`).
2. 비대화형 쉘의 PATH에 `openclaw`가 있는지 확인합니다 (필요한 경우 `/usr/local/bin` 또는 `/opt/homebrew/bin`에 심링크).
3. 키 인증으로 SSH를 엽니다. LAN 외부에서 안정적인 도달 가능성을 위해 **Tailscale** IP를 권장합니다.

## macOS 앱 설정

1. _설정 → General_을 엽니다.
2. **OpenClaw runs** 아래에서 **Remote over SSH**를 선택하고 다음을 설정합니다:
   - **전송**: **SSH tunnel** 또는 **Direct (ws/wss)**.
   - **SSH 대상**: `user@host` (선택적 `:port`).
     - 게이트웨이가 동일 LAN에 있고 Bonjour를 광고하는 경우 검색된 목록에서 선택하면 이 필드가 자동으로 채워집니다.
   - **게이트웨이 URL** (직접만): `wss://gateway.example.ts.net` (또는 로컬/LAN의 경우 `ws://...`).
   - **ID 파일** (고급): 키 경로.
   - **프로젝트 루트** (고급): 명령에 사용되는 원격 체크아웃 경로.
   - **CLI 경로** (고급): 실행 가능한 `openclaw` 진입점/바이너리의 선택적 경로 (광고된 경우 자동 채워짐).
3. **Test remote**를 클릭합니다. 성공은 원격 `openclaw status --json`이 올바르게 실행됨을 나타냅니다. 실패는 보통 PATH/CLI 문제를 의미합니다. exit 127은 원격에서 CLI를 찾을 수 없음을 의미합니다.
4. 상태 확인과 Web Chat이 이제 이 SSH 터널을 통해 자동으로 실행됩니다.

## Web Chat

- **SSH 터널**: Web Chat이 전달된 WebSocket 제어 포트 (기본값 18789)를 통해 게이트웨이에 연결합니다.
- **직접 (ws/wss)**: Web Chat이 구성된 게이트웨이 URL에 바로 연결합니다.
- 더 이상 별도의 WebChat HTTP 서버가 없습니다.

## 권한

- 원격 호스트에는 로컬과 동일한 TCC 승인이 필요합니다 (자동화, 접근성, 화면 녹화, 마이크, 음성 인식, 알림). 해당 머신에서 온보딩을 실행하여 한 번 부여하십시오.
- 노드는 `node.list` / `node.describe`를 통해 권한 상태를 광고하므로 에이전트가 무엇이 허용되는지 알 수 있습니다.

## 보안 참고 사항

- 원격 호스트에서 루프백 바인드를 선호하고 SSH 또는 Tailscale을 통해 연결하십시오.
- SSH 터널링은 엄격한 호스트 키 확인을 사용합니다. `~/.ssh/known_hosts`에 존재하도록 먼저 호스트 키를 신뢰하십시오.
- 게이트웨이를 루프백이 아닌 인터페이스에 바인딩하는 경우 유효한 게이트웨이 인증이 필요합니다: 토큰, 비밀번호, 또는 `gateway.auth.mode: "trusted-proxy"`가 있는 ID 인식 역방향 프록시.
- [보안](/gateway/security/) 및 [Tailscale](/gateway/tailscale)을 참조하십시오.

## WhatsApp 로그인 흐름 (원격)

- **원격 호스트에서** `openclaw channels login --verbose`를 실행합니다. 전화기의 WhatsApp으로 QR을 스캔합니다.
- 인증이 만료되면 해당 호스트에서 로그인을 다시 실행합니다. 상태 확인이 링크 문제를 표시합니다.

## 문제 해결

- **exit 127 / not found**: 비로그인 쉘의 PATH에 `openclaw`가 없습니다. `/etc/paths`, 쉘 rc에 추가하거나 `/usr/local/bin`/`/opt/homebrew/bin`에 심링크하십시오.
- **상태 프로브 실패**: SSH 도달 가능성, PATH, Baileys 로그인 여부 (`openclaw status --json`)를 확인하십시오.
- **Web Chat 멈춤**: 게이트웨이가 원격 호스트에서 실행 중인지, 전달된 포트가 게이트웨이 WS 포트와 일치하는지 확인하십시오. UI는 정상적인 WS 연결이 필요합니다.
- **노드 IP가 127.0.0.1 표시**: SSH 터널에서 예상됩니다. 게이트웨이가 실제 클라이언트 IP를 보도록 하려면 **전송**을 **직접 (ws/wss)**로 전환하십시오.
- **Voice Wake**: 트리거 구문은 원격 모드에서 자동으로 전달됩니다. 별도의 포워더가 필요하지 않습니다.

## 알림 소리

스크립트에서 `openclaw`와 `node.invoke`를 사용하여 알림당 소리를 선택합니다. 예:

```bash
openclaw nodes notify --node <id> --title "Ping" --body "Remote gateway ready" --sound Glass
```

앱에 더 이상 전역 "기본 소리" 토글이 없습니다. 발신자가 요청당 소리 (또는 없음)를 선택합니다.
