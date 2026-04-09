---
summary: "OpenClaw가 환경 변수를 로드하는 위치와 우선 순위"
read_when:
  - You need to know which env vars are loaded, and in what order
  - You are debugging missing API keys in the Gateway
  - You are documenting provider auth or deployment environments
title: "환경 변수"
---

# 환경 변수

OpenClaw는 여러 소스에서 환경 변수를 가져옵니다. 규칙은 **기존 값을 덮어쓰지 않는 것**입니다.

## 우선 순위 (높음 → 낮음)

1. **프로세스 환경** (게이트웨이 프로세스가 부모 셸/데몬에서 이미 보유한 것).
2. **현재 작업 디렉토리의 `.env`** (dotenv 기본값; 덮어쓰지 않음).
3. **전역 `.env`** `~/.openclaw/.env`에 위치 (또는 `$OPENCLAW_STATE_DIR/.env`; 덮어쓰지 않음).
4. **`~/.openclaw/openclaw.json`의 `env` 블록 설정** (누락된 경우만 적용).
5. **선택적 로그인 셸 가져오기** (`env.shellEnv.enabled` 또는 `OPENCLAW_LOAD_SHELL_ENV=1`), 누락된 예상 키에 대해서만 적용.

기본 상태 디렉토리를 사용하는 Ubuntu 새 설치에서 OpenClaw는 또한 `~/.config/openclaw/gateway.env`를 전역 `.env` 이후의 호환성 폴백으로 처리합니다. 두 파일이 모두 존재하고 불일치하는 경우 OpenClaw는 `~/.openclaw/.env`를 유지하고 경고를 출력합니다.

설정 파일이 완전히 없으면 4단계는 건너뜁니다. 활성화된 경우 셸 가져오기는 계속 실행됩니다.

## 설정 `env` 블록

인라인 환경 변수를 설정하는 두 가지 동등한 방법 (둘 다 덮어쓰지 않음):

```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-...",
    },
  },
}
```

## 셸 환경 가져오기

`env.shellEnv`는 로그인 셸을 실행하고 **누락된** 예상 키만 가져옵니다:

```json5
{
  env: {
    shellEnv: {
      enabled: true,
      timeoutMs: 15000,
    },
  },
}
```

동등한 환경 변수:

- `OPENCLAW_LOAD_SHELL_ENV=1`
- `OPENCLAW_SHELL_ENV_TIMEOUT_MS=15000`

## 런타임 삽입 환경 변수

OpenClaw는 또한 스폰된 자식 프로세스에 컨텍스트 마커를 삽입합니다:

- `OPENCLAW_SHELL=exec`: `exec` 도구를 통해 실행되는 명령에 설정됩니다.
- `OPENCLAW_SHELL=acp`: ACP 런타임 백엔드 프로세스 스폰(예: `acpx`)에 설정됩니다.
- `OPENCLAW_SHELL=acp-client`: `openclaw acp client`가 ACP 브리지 프로세스를 스폰할 때 설정됩니다.
- `OPENCLAW_SHELL=tui-local`: 로컬 TUI `!` 셸 명령에 설정됩니다.

이것은 런타임 마커입니다 (필수 사용자 구성이 아님). 셸/프로필 로직에서 컨텍스트별 규칙을 적용하는 데 사용할 수 있습니다.

## UI 환경 변수

- `OPENCLAW_THEME=light`: 터미널의 배경이 밝은 경우 밝은 TUI 팔레트를 강제합니다.
- `OPENCLAW_THEME=dark`: 어두운 TUI 팔레트를 강제합니다.
- `COLORFGBG`: 터미널이 내보내면 OpenClaw는 배경 색상 힌트를 사용하여 TUI 팔레트를 자동 선택합니다.

## 설정의 환경 변수 치환

설정 문자열 값에서 `${VAR_NAME}` 구문을 사용하여 환경 변수를 직접 참조할 수 있습니다:

```json5
{
  models: {
    providers: {
      "vercel-gateway": {
        apiKey: "${VERCEL_GATEWAY_API_KEY}",
      },
    },
  },
}
```

자세한 내용은 [구성: 환경 변수 치환](/gateway/configuration-reference#env-var-substitution)을 참조하십시오.

## 시크릿 참조 대 `${ENV}` 문자열

OpenClaw는 두 가지 환경 기반 패턴을 지원합니다:

- 설정 값의 `${VAR}` 문자열 치환.
- 시크릿 참조를 지원하는 필드를 위한 SecretRef 객체 (`{ source: "env", provider: "default", id: "VAR" }`).

둘 다 활성화 시 프로세스 환경에서 확인됩니다. SecretRef 세부 정보는 [시크릿 관리](/gateway/secrets)에 설명되어 있습니다.

## 경로 관련 환경 변수

| 변수                   | 용도                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPENCLAW_HOME`        | 모든 내부 경로 확인(`~/.openclaw/`, 에이전트 디렉토리, 세션, 자격 증명)에 사용되는 홈 디렉토리를 재정의합니다. 전용 서비스 사용자로 OpenClaw를 실행할 때 유용합니다. |
| `OPENCLAW_STATE_DIR`   | 상태 디렉토리를 재정의합니다 (기본값 `~/.openclaw`).                                                                                                                            |
| `OPENCLAW_CONFIG_PATH` | 설정 파일 경로를 재정의합니다 (기본값 `~/.openclaw/openclaw.json`).                                                                                                             |

## 로깅

| 변수                 | 용도                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPENCLAW_LOG_LEVEL` | 파일 및 콘솔 모두에 대한 로그 레벨을 재정의합니다 (예: `debug`, `trace`). 설정의 `logging.level` 및 `logging.consoleLevel`보다 우선합니다. 잘못된 값은 경고와 함께 무시됩니다. |

### `OPENCLAW_HOME`

설정된 경우 `OPENCLAW_HOME`은 모든 내부 경로 확인에서 시스템 홈 디렉토리(`$HOME` / `os.homedir()`)를 대체합니다. 이를 통해 헤드리스 서비스 계정에 대한 완전한 파일 시스템 격리가 가능합니다.

**우선 순위:** `OPENCLAW_HOME` > `$HOME` > `USERPROFILE` > `os.homedir()`

**예시** (macOS LaunchDaemon):

```xml
<key>EnvironmentVariables</key>
<dict>
  <key>OPENCLAW_HOME</key>
  <string>/Users/user</string>
</dict>
```

`OPENCLAW_HOME`은 틸드 경로(예: `~/svc`)로 설정할 수도 있으며, 사용 전에 `$HOME`을 사용하여 확장됩니다.

## nvm 사용자: web_fetch TLS 실패

Node.js가 **nvm** (시스템 패키지 관리자가 아닌)을 통해 설치된 경우, 내장 `fetch()`는
nvm의 번들된 CA 저장소를 사용하며 최신 루트 CA(Let's Encrypt의 ISRG Root X1/X2,
DigiCert Global Root G2 등)가 없을 수 있습니다. 이로 인해 `web_fetch`가 대부분의 HTTPS 사이트에서 `"fetch failed"`로 실패합니다.

Linux에서 OpenClaw는 nvm을 자동으로 감지하고 실제 시작 환경에서 수정을 적용합니다:

- `openclaw gateway install`은 systemd 서비스 환경에 `NODE_EXTRA_CA_CERTS`를 씁니다
- `openclaw` CLI 진입점은 Node 시작 전에 `NODE_EXTRA_CA_CERTS`가 설정된 상태로 자신을 재실행합니다

**수동 수정 (이전 버전 또는 직접 `node ...` 실행의 경우):**

OpenClaw 시작 전에 변수를 내보내십시오:

```bash
export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
openclaw gateway run
```

이 변수를 위해 `~/.openclaw/.env`에만 쓰는 것에 의존하지 마십시오. Node는
프로세스 시작 시 `NODE_EXTRA_CA_CERTS`를 읽습니다.

## 관련

- [게이트웨이 구성](/gateway/configuration)
- [FAQ: 환경 변수 및 .env 로딩](/help/faq#env-vars-and-env-loading)
- [모델 개요](/concepts/models)
