---
summary: "Linux에서 OpenClaw 브라우저 제어를 위한 Chrome/Brave/Edge/Chromium CDP 시작 문제 해결"
read_when: "Linux에서 브라우저 제어가 실패하는 경우, 특히 snap Chromium 사용 시"
title: "브라우저 문제 해결"
---

# 브라우저 문제 해결 (Linux)

## 문제: "Failed to start Chrome CDP on port 18800"

OpenClaw의 브라우저 제어 서버가 다음 오류와 함께 Chrome/Brave/Edge/Chromium 실행에 실패합니다:

```
{"error":"Error: Failed to start Chrome CDP on port 18800 for profile \"openclaw\"."}
```

### 근본 원인

Ubuntu(및 많은 Linux 배포판)에서 기본 Chromium 설치는 **snap 패키지**입니다. Snap의 AppArmor 제한이 OpenClaw가 브라우저 프로세스를 생성하고 모니터링하는 방식을 방해합니다.

`apt install chromium` 명령은 snap으로 리다이렉트하는 스텁 패키지를 설치합니다:

```
Note, selecting 'chromium-browser' instead of 'chromium'
chromium-browser is already the newest version (2:1snap1-0ubuntu2).
```

이것은 실제 브라우저가 아닙니다 - 단순한 래퍼입니다.

### 해결책 1: Google Chrome 설치 (권장)

snap으로 샌드박스 처리되지 않은 공식 Google Chrome `.deb` 패키지를 설치합니다:

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --fix-broken install -y  # 의존성 오류가 있는 경우
```

그런 다음 OpenClaw 설정을 업데이트합니다 (`~/.openclaw/openclaw.json`):

```json
{
  "browser": {
    "enabled": true,
    "executablePath": "/usr/bin/google-chrome-stable",
    "headless": true,
    "noSandbox": true
  }
}
```

### 해결책 2: Attach-Only 모드로 Snap Chromium 사용

반드시 snap Chromium을 사용해야 하는 경우, 수동으로 시작된 브라우저에 연결하도록 OpenClaw를 설정합니다:

1. 설정 업데이트:

```json
{
  "browser": {
    "enabled": true,
    "attachOnly": true,
    "headless": true,
    "noSandbox": true
  }
}
```

2. Chromium을 수동으로 시작합니다:

```bash
chromium-browser --headless --no-sandbox --disable-gpu \
  --remote-debugging-port=18800 \
  --user-data-dir=$HOME/.openclaw/browser/openclaw/user-data \
  about:blank &
```

3. 선택적으로 Chrome을 자동 시작하는 systemd 사용자 서비스를 생성합니다:

```ini
# ~/.config/systemd/user/openclaw-browser.service
[Unit]
Description=OpenClaw Browser (Chrome CDP)
After=network.target

[Service]
ExecStart=/snap/bin/chromium --headless --no-sandbox --disable-gpu --remote-debugging-port=18800 --user-data-dir=%h/.openclaw/browser/openclaw/user-data about:blank
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

다음으로 활성화합니다: `systemctl --user enable --now openclaw-browser.service`

### 브라우저 작동 확인

상태 확인:

```bash
curl -s http://127.0.0.1:18791/ | jq '{running, pid, chosenBrowser}'
```

브라우징 테스트:

```bash
curl -s -X POST http://127.0.0.1:18791/start
curl -s http://127.0.0.1:18791/tabs
```

### 설정 레퍼런스

| 옵션                     | 설명                                                         | 기본값                                                      |
| ------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------- |
| `browser.enabled`        | 브라우저 제어 활성화                                         | `true`                                                      |
| `browser.executablePath` | Chromium 기반 브라우저 바이너리 경로 (Chrome/Brave/Edge/Chromium) | 자동 감지 (Chromium 기반인 경우 기본 브라우저 우선) |
| `browser.headless`       | GUI 없이 실행                                                | `false`                                                     |
| `browser.noSandbox`      | `--no-sandbox` 플래그 추가 (일부 Linux 설정에 필요)          | `false`                                                     |
| `browser.attachOnly`     | 브라우저를 실행하지 않고 기존 브라우저에만 연결              | `false`                                                     |
| `browser.cdpPort`        | Chrome DevTools Protocol 포트                                | `18800`                                                     |

### 문제: "No Chrome tabs found for profile=\"user\""

`existing-session` / Chrome MCP 프로파일을 사용하고 있습니다. OpenClaw는 로컬 Chrome을 인식할 수 있지만, 연결할 수 있는 열린 탭이 없습니다.

해결 방법:

1. **관리형 브라우저 사용:** `openclaw browser start --browser-profile openclaw`
   (또는 `browser.defaultProfile: "openclaw"` 설정).
2. **Chrome MCP 사용:** 로컬 Chrome이 최소 하나의 열린 탭과 함께 실행 중인지 확인하고, `--browser-profile user`로 다시 시도합니다.

참고 사항:

- `user`는 호스트 전용입니다. Linux 서버, 컨테이너 또는 원격 호스트의 경우 CDP 프로파일을 선호합니다.
- `user` / 기타 `existing-session` 프로파일은 현재 Chrome MCP 제한을 유지합니다:
  ref 기반 작업, 1회 파일 업로드 훅, 대화 타임아웃 재정의 불가,
  `wait --load networkidle` 불가, `responsebody`, PDF 내보내기, 다운로드
  인터셉션, 배치 작업 불가.
- 로컬 `openclaw` 프로파일은 `cdpPort`/`cdpUrl`을 자동 할당합니다. 원격 CDP에만 설정하십시오.
- 원격 CDP 프로파일은 `http://`, `https://`, `ws://`, `wss://`를 허용합니다.
  `/json/version` 검색에는 HTTP(S)를 사용하고, 브라우저 서비스가 직접 DevTools 소켓 URL을 제공하는 경우에만 WS(S)를 사용합니다.
