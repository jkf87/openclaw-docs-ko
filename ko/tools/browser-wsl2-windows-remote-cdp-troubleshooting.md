---
summary: "WSL2 Gateway와 Windows Chrome 분리 호스트 설정에서의 원격 CDP 문제 해결"
read_when: "WSL2에서 게이트웨이를 실행하고 Windows Chrome에 연결할 때 브라우저 도구가 실패하는 경우"
title: "브라우저 문제 해결 (WSL2 + Windows)"
---

# 브라우저 문제 해결 (WSL2 + Windows 원격 Chrome CDP)

## 설정

- **게이트웨이**: WSL2 (Ubuntu) 내에서 실행
- **브라우저**: Windows Chrome (WSL2 외부)
- **목표**: OpenClaw가 원격 CDP로 Windows Chrome을 제어하도록 설정

## 1단계: Windows Chrome을 디버그 포트와 함께 시작

Windows PowerShell 또는 CMD에서:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="C:\Users\<YourUsername>\AppData\Local\Google\Chrome\openclaw-remote"
```

기억할 사항:

- `user-data-dir`을 변경하면 별도의 Chrome 프로필을 제공합니다 (기존 세션 유지).
- 포트 `9222`는 이미 사용 중이면 다른 포트로 변경하십시오.
- 매번 이 플래그로 Chrome을 실행해야 합니다.

## 2단계: WSL2에서 Windows 호스트 IP 가져오기

WSL2에서:

```bash
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
```

또는:

```bash
ip route show | grep default | awk '{print $3}'
```

이 IP가 Windows 호스트 IP (일반적으로 `172.x.x.x`)입니다.

## 3단계: WSL2에서 연결 테스트

```bash
curl -s http://<WINDOWS-HOST-IP>:9222/json/version
```

성공 시 다음과 유사한 JSON이 표시됩니다:

```json
{
  "Browser": "Chrome/...",
  "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/..."
}
```

이것이 작동하지 않으면 Windows 방화벽이 포트 `9222`를 차단하고 있을 수 있습니다. 다음을 참조하십시오: [방화벽 문제 해결](#방화벽-문제-해결).

## 4단계: OpenClaw 설정 업데이트

WSL2의 OpenClaw 설정에서 (`~/.openclaw/openclaw.json`):

```json5
{
  browser: {
    enabled: true,
    profiles: {
      windows-chrome: {
        cdpUrl: "http://<WINDOWS-HOST-IP>:9222",
        color: "#4285F4",
      },
    },
    defaultProfile: "windows-chrome",
    remoteCdpTimeoutMs: 3000,
    remoteCdpHandshakeTimeoutMs: 5000,
  },
}
```

`<WINDOWS-HOST-IP>`를 2단계의 실제 IP로 교체하십시오.

## 5단계: 연결 확인

게이트웨이를 재시작한 후:

```bash
openclaw browser --browser-profile windows-chrome status
openclaw browser --browser-profile windows-chrome tabs
```

## 방화벽 문제 해결

Windows 방화벽이 WSL2에서의 연결을 차단할 수 있습니다.

**옵션 A: 특정 포트에 대한 방화벽 규칙 추가 (권장)**

관리자 권한으로 PowerShell에서:

```powershell
New-NetFirewallRule -DisplayName "Chrome CDP WSL2" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 9222 `
  -Action Allow `
  -Profile Private
```

**옵션 B: 개발 중 임시로 방화벽 비활성화**

이것은 안전하지 않습니다. 가능하면 옵션 A를 사용하십시오.

## 고정 Windows 호스트 IP 설정 (선택사항)

WSL2 IP는 재시작 시 변경될 수 있습니다. 안정적인 IP를 위해:

1. WSL2에서 `/etc/hosts`에 추가:

```bash
echo "$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}') windows-host" | sudo tee -a /etc/hosts
```

2. 그런 다음 설정에서 IP 대신 `windows-host`를 사용하십시오:

```json5
{
  browser: {
    profiles: {
      windows-chrome: {
        cdpUrl: "http://windows-host:9222",
      },
    },
  },
}
```

## 관련 항목

- [브라우저](/tools/browser) — 전체 브라우저 문서
- [브라우저 문제 해결 (Linux)](/tools/browser-linux-troubleshooting) — Linux 특정 문제
