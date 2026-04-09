---
summary: "OpenClaw의 고급 설정 및 개발 워크플로우"
read_when:
  - 새 머신 설정
  - 개인 설정을 망가뜨리지 않고 "최신 + 최고" 버전을 원할 때
title: "설정"
---

# 설정

<Note>
처음으로 설정하는 경우, [시작하기](/start/getting-started)부터 시작하십시오.
온보딩 세부 사항은 [온보딩 (CLI)](/start/wizard)를 참조하십시오.
</Note>

## 요약

- **맞춤 설정은 저장소 외부에 있습니다:** `~/.openclaw/workspace` (워크스페이스) + `~/.openclaw/openclaw.json` (구성).
- **안정적인 워크플로우:** macOS 앱을 설치하고 번들된 Gateway를 실행합니다.
- **최신 워크플로우:** `pnpm gateway:watch`를 통해 Gateway를 직접 실행하고 macOS 앱을 로컬 모드로 연결합니다.

## 사전 조건 (소스에서)

- Node 24 권장 (Node 22 LTS, 현재 `22.14+`, 여전히 지원됨)
- `pnpm` 권장 ([Bun 워크플로우](/install/bun)를 의도적으로 사용하는 경우 Bun)
- Docker (선택 사항; 컨테이너화된 설정/e2e에만 필요 — [Docker](/install/docker) 참조)

## 맞춤 설정 전략 (업데이트가 손상되지 않도록)

"100% 내 취향에 맞는" _그리고_ 쉬운 업데이트를 원한다면, 맞춤 설정을 다음에 유지하십시오:

- **구성:** `~/.openclaw/openclaw.json` (JSON/JSON5-ish)
- **워크스페이스:** `~/.openclaw/workspace` (스킬, 프롬프트, 메모리; 비공개 git 저장소로 만드십시오)

한 번 부트스트랩:

```bash
openclaw setup
```

이 저장소 내에서 로컬 CLI 엔트리를 사용하십시오:

```bash
openclaw setup
```

아직 전역 설치가 없는 경우 `pnpm openclaw setup`으로 실행하십시오 (Bun 워크플로우를 사용하는 경우 `bun run openclaw setup`).

## 이 저장소에서 Gateway 실행

`pnpm build` 후 패키지된 CLI를 직접 실행할 수 있습니다:

```bash
node openclaw.mjs gateway --port 18789 --verbose
```

## 안정적인 워크플로우 (macOS 앱 우선)

1. **OpenClaw.app** (메뉴 바)을 설치 + 실행합니다.
2. 온보딩/권한 체크리스트를 완료합니다 (TCC 프롬프트).
3. Gateway가 **로컬**로 실행 중인지 확인합니다 (앱이 관리합니다).
4. 표면 연결 (예: WhatsApp):

```bash
openclaw channels login
```

5. 정상 확인:

```bash
openclaw health
```

빌드에서 온보딩을 사용할 수 없는 경우:

- `openclaw setup`을 실행한 다음, `openclaw channels login`을 실행하고, Gateway를 수동으로 시작하십시오 (`openclaw gateway`).

## 최신 워크플로우 (터미널의 Gateway)

목표: TypeScript Gateway에서 작업하고, 핫 리로드를 사용하고, macOS 앱 UI를 연결 상태로 유지합니다.

### 0) (선택 사항) 소스에서도 macOS 앱 실행

macOS 앱도 최신 버전으로 사용하려면:

```bash
./scripts/restart-mac.sh
```

### 1) 개발 Gateway 시작

```bash
pnpm install
pnpm gateway:watch
```

`gateway:watch`는 게이트웨이를 감시 모드로 실행하고 관련 소스, 구성 및 번들 플러그인 메타데이터 변경 시 재로드합니다.

Bun 워크플로우를 의도적으로 사용하는 경우 동등한 명령은:

```bash
bun install
bun run gateway:watch
```

### 2) macOS 앱을 실행 중인 Gateway에 연결

**OpenClaw.app**에서:

- 연결 모드: **로컬**
  앱은 구성된 포트에서 실행 중인 게이트웨이에 연결합니다.

### 3) 확인

- 앱 내 Gateway 상태는 **"기존 게이트웨이 사용 중..."** 으로 표시되어야 합니다
- 또는 CLI를 통해:

```bash
openclaw health
```

### 일반적인 함정

- **잘못된 포트:** Gateway WS 기본값은 `ws://127.0.0.1:18789`입니다; 앱 + CLI를 동일한 포트로 유지하십시오.
- **상태가 사는 곳:**
  - 채널/프로바이더 상태: `~/.openclaw/credentials/`
  - 모델 인증 프로파일: `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
  - 세션: `~/.openclaw/agents/<agentId>/sessions/`
  - 로그: `/tmp/openclaw/`

## 자격 증명 저장소 지도

인증을 디버깅하거나 백업할 항목을 결정할 때 사용하십시오:

- **WhatsApp**: `~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
- **Telegram 봇 토큰**: 구성/환경 변수 또는 `channels.telegram.tokenFile` (일반 파일만; 심볼릭 링크 거부됨)
- **Discord 봇 토큰**: 구성/환경 변수 또는 SecretRef (env/file/exec 프로바이더)
- **Slack 토큰**: 구성/환경 변수 (`channels.slack.*`)
- **페어링 허용 목록**:
  - `~/.openclaw/credentials/<channel>-allowFrom.json` (기본 계정)
  - `~/.openclaw/credentials/<channel>-<accountId>-allowFrom.json` (비기본 계정)
- **모델 인증 프로파일**: `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- **파일 기반 비밀 페이로드 (선택 사항)**: `~/.openclaw/secrets.json`
- **레거시 OAuth 가져오기**: `~/.openclaw/credentials/oauth.json`
  자세한 내용: [보안](/gateway/security/#credential-storage-map).

## 설정 업데이트 (설정을 망가뜨리지 않고)

- `~/.openclaw/workspace`와 `~/.openclaw/`를 "내 항목"으로 유지하십시오; 개인 프롬프트/구성을 `openclaw` 저장소에 넣지 마십시오.
- 소스 업데이트: `git pull` + 선택한 패키지 관리자 설치 단계 (기본값 `pnpm install`; Bun 워크플로우의 경우 `bun install`) + 일치하는 `gateway:watch` 명령을 계속 사용하십시오.

## Linux (systemd 사용자 서비스)

Linux 설치는 systemd **사용자** 서비스를 사용합니다. 기본적으로 systemd는 로그아웃/유휴 시 사용자 서비스를 중지하여 Gateway를 종료합니다. 온보딩은 사용자를 위해 lingering을 활성화하려고 시도합니다 (sudo를 요청할 수 있습니다). 여전히 비활성화된 경우 실행하십시오:

```bash
sudo loginctl enable-linger $USER
```

항상 켜져 있거나 멀티 사용자 서버의 경우, 사용자 서비스 대신 **시스템** 서비스를 고려하십시오 (lingering 불필요). systemd 참고 사항은 [게이트웨이 런북](/gateway/)을 참조하십시오.

## 관련 문서

- [게이트웨이 런북](/gateway/) (플래그, 감독, 포트)
- [게이트웨이 구성](/gateway/configuration) (구성 스키마 + 예시)
- [Discord](/channels/discord) 및 [Telegram](/channels/telegram) (응답 태그 + replyToMode 설정)
- [OpenClaw 어시스턴트 설정](/start/openclaw)
- [macOS 앱](/platforms/macos) (게이트웨이 수명 주기)
