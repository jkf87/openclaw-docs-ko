---
summary: "원클릭 템플릿으로 Railway에 OpenClaw 배포"
read_when:
  - Railway에서 OpenClaw를 호스팅하려는 경우
  - 서버에 터미널 없이 가장 쉬운 배포 경로를 찾는 경우
title: "Railway"
---

# Railway

원클릭 템플릿으로 Railway에 OpenClaw를 배포하고 웹 Control UI를 통해 접근합니다.
"서버에 터미널 없음" 경로 중 가장 쉬운 방법입니다 — Railway가 게이트웨이를 대신 실행해 줍니다.

## 빠른 체크리스트 (신규 사용자)

1. 아래 **Deploy on Railway** 를 클릭합니다.
2. `/data`에 마운트된 **Volume** 을 추가합니다.
3. 필수 **Variables** 를 설정합니다 (최소 `OPENCLAW_GATEWAY_PORT` 와 `OPENCLAW_GATEWAY_TOKEN`).
4. `8080` 포트에서 **HTTP Proxy** 를 활성화합니다.
5. `https://<your-railway-domain>/openclaw`를 열고 설정한 공유 시크릿으로 연결합니다. 이 템플릿은 기본적으로 `OPENCLAW_GATEWAY_TOKEN` 을 사용합니다. 비밀번호 인증으로 교체했다면 해당 비밀번호를 사용합니다.

## 원클릭 배포

<a href="https://railway.com/deploy/clawdbot-railway-template" target="_blank" rel="noreferrer">
  Deploy on Railway
</a>

배포 후, **Railway → 서비스 → Settings → Domains** 에서 공개 URL을 확인합니다.

Railway는 다음 중 하나를 제공합니다:

* 자동 생성된 도메인 (보통 `https://<something>.up.railway.app`), 또는
* 연결한 사용자 정의 도메인.

그런 다음 다음 주소를 엽니다:

* `https://<your-railway-domain>/openclaw` — Control UI

## 제공되는 것

* 호스팅된 OpenClaw Gateway + Control UI
* Railway Volume(`/data`) 을 통한 영구 저장소 — `openclaw.json`,
  에이전트별 `auth-profiles.json`, 채널/프로바이더 상태, 세션, 워크스페이스가
  재배포 후에도 유지됩니다.

## 필수 Railway 설정

### Public Networking

서비스에 대해 **HTTP Proxy** 를 활성화합니다.

* Port: `8080`

### Volume (필수)

다음 위치에 마운트된 볼륨을 연결합니다:

* `/data`

### Variables

서비스에 다음 변수를 설정합니다:

* `OPENCLAW_GATEWAY_PORT=8080` (필수 — Public Networking의 포트와 일치해야 함)
* `OPENCLAW_GATEWAY_TOKEN` (필수; 관리자 시크릿으로 취급)
* `OPENCLAW_STATE_DIR=/data/.openclaw` (권장)
* `OPENCLAW_WORKSPACE_DIR=/data/workspace` (권장)

## 채널 연결

`/openclaw`의 Control UI를 사용하거나 Railway의 셸을 통해 `openclaw onboard` 를 실행해 채널 설정 방법을 확인합니다:

* [Telegram](/channels/telegram) (가장 빠름 — 봇 토큰만 있으면 됨)
* [Discord](/channels/discord)
* [모든 채널](/channels/)

## 백업 및 마이그레이션

상태, 구성, 인증 프로필, 워크스페이스를 내보냅니다:

```bash
openclaw backup create
```

이 명령은 OpenClaw 상태와 구성된 워크스페이스를 포함한 이식 가능한 백업 아카이브를 생성합니다. 자세한 내용은 [백업](/cli/backup) 을 참조하세요.

## 다음 단계

* 메시징 채널 설정: [채널](/channels/)
* 게이트웨이 구성: [게이트웨이 구성](/gateway/configuration)
* OpenClaw 최신 상태 유지: [업데이트](/install/updating)
