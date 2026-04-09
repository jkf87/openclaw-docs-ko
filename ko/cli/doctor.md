---
summary: "`openclaw doctor`에 대한 CLI 참조 (상태 점검 + 안내 수리)"
read_when:
  - 연결/인증 문제가 있고 안내된 수정을 원하는 경우
  - 업데이트 후 정상 점검을 원하는 경우
title: "doctor"
---

# `openclaw doctor`

게이트웨이와 채널에 대한 상태 점검 + 빠른 수정.

관련:

- 문제 해결: [문제 해결](/gateway/troubleshooting)
- 보안 감사: [보안](/gateway/security/)

## 예시

```bash
openclaw doctor
openclaw doctor --repair
openclaw doctor --deep
openclaw doctor --repair --non-interactive
openclaw doctor --generate-gateway-token
```

## 옵션

- `--no-workspace-suggestions`: 워크스페이스 메모리/검색 제안 비활성화
- `--yes`: 프롬프트 없이 기본값 수락
- `--repair`: 프롬프트 없이 권장 수리 적용
- `--fix`: `--repair`의 별칭
- `--force`: 필요한 경우 사용자 정의 서비스 구성 덮어쓰기를 포함한 강제 수리 적용
- `--non-interactive`: 프롬프트 없이 실행; 안전한 마이그레이션만
- `--generate-gateway-token`: 게이트웨이 토큰 생성 및 구성
- `--deep`: 추가 게이트웨이 설치를 위해 시스템 서비스 스캔

참고사항:

- 대화형 프롬프트 (키체인/OAuth 수정 등)는 stdin이 TTY이고 `--non-interactive`가 설정되지 **않은** 경우에만 실행됩니다. 헤드리스 실행 (cron, Telegram, 터미널 없음)은 프롬프트를 건너뜁니다.
- `--fix` (`--repair`의 별칭)는 `~/.openclaw/openclaw.json.bak`에 백업을 작성하고 알 수 없는 구성 키를 삭제하며 각 제거를 나열합니다.
- 상태 무결성 검사는 이제 세션 디렉터리의 고아 기록 파일을 감지하고 안전하게 공간을 회수하기 위해 `.deleted.<timestamp>`로 아카이브할 수 있습니다.
- Doctor는 또한 `~/.openclaw/cron/jobs.json` (또는 `cron.store`)에서 레거시 cron 작업 형태를 스캔하고 스케줄러가 런타임에 자동으로 정규화하기 전에 제자리에서 다시 작성할 수 있습니다.
- Doctor는 레거시 플랫 Talk 구성 (`talk.voiceId`, `talk.modelId` 등)을 `talk.provider` + `talk.providers.<provider>`로 자동 마이그레이션합니다.
- 반복적인 `doctor --fix` 실행은 유일한 차이가 객체 키 순서인 경우 더 이상 Talk 정규화를 보고/적용하지 않습니다.
- Doctor는 메모리 검색 준비 상태 검사를 포함하며 임베딩 자격 증명이 누락된 경우 `openclaw configure --section model`을 권장할 수 있습니다.
- 샌드박스 모드가 활성화되었지만 Docker를 사용할 수 없는 경우 doctor는 해결 방법 (`Docker 설치` 또는 `openclaw config set agents.defaults.sandbox.mode off`)과 함께 높은 신호의 경고를 보고합니다.
- `gateway.auth.token`/`gateway.auth.password`가 SecretRef 관리이고 이 명령 경로에서 사용할 수 없는 경우 doctor는 읽기 전용 경고를 보고하고 일반 텍스트 폴백 자격 증명을 작성하지 않습니다.
- 수정 경로에서 채널 SecretRef 검사가 실패하면 doctor는 일찍 종료하는 대신 계속하고 경고를 보고합니다.
- Telegram `allowFrom` 사용자 이름 자동 확인 (`doctor --fix`)은 현재 명령 경로에서 확인 가능한 Telegram 토큰이 필요합니다. 토큰 검사를 사용할 수 없는 경우 doctor는 경고를 보고하고 해당 패스에 대한 자동 확인을 건너뜁니다.

## macOS: `launchctl` 환경 변수 재정의

이전에 `launchctl setenv OPENCLAW_GATEWAY_TOKEN ...` (또는 `...PASSWORD`)를 실행한 경우 해당 값이 구성 파일을 재정의하고 지속적인 "unauthorized" 오류를 유발할 수 있습니다.

```bash
launchctl getenv OPENCLAW_GATEWAY_TOKEN
launchctl getenv OPENCLAW_GATEWAY_PASSWORD

launchctl unsetenv OPENCLAW_GATEWAY_TOKEN
launchctl unsetenv OPENCLAW_GATEWAY_PASSWORD
```
