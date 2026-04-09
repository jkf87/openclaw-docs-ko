---
summary: "훅: 명령 및 수명 주기 이벤트를 위한 이벤트 기반 자동화"
read_when:
  - /new, /reset, /stop 및 에이전트 수명 주기 이벤트에 대한 이벤트 기반 자동화를 원할 때
  - 훅을 빌드, 설치하거나 디버그하고 싶을 때
title: "훅"
---

# 훅

훅은 게이트웨이 내부에서 무언가가 발생할 때 실행되는 소규모 스크립트입니다. 디렉터리에서 자동으로 검색되며 `openclaw hooks`로 검사할 수 있습니다.

OpenClaw에는 두 가지 종류의 훅이 있습니다:

- **내부 훅** (이 페이지): `/new`, `/reset`, `/stop` 또는 수명 주기 이벤트와 같은 에이전트 이벤트가 발생할 때 게이트웨이 내부에서 실행됩니다.
- **웹훅**: 다른 시스템이 OpenClaw에서 작업을 트리거할 수 있게 하는 외부 HTTP 엔드포인트입니다. [웹훅](/automation/cron-jobs#webhooks)을 참조하십시오.

훅은 플러그인 내부에 번들로 포함될 수도 있습니다. `openclaw hooks list`는 독립 실행형 훅과 플러그인 관리 훅을 모두 표시합니다.

## 빠른 시작

```bash
# 사용 가능한 훅 목록
openclaw hooks list

# 훅 활성화
openclaw hooks enable session-memory

# 훅 상태 확인
openclaw hooks check

# 상세 정보 조회
openclaw hooks info session-memory
```

## 이벤트 유형

| 이벤트                    | 발생 시점                                        |
| ------------------------- | ------------------------------------------------ |
| `command:new`             | `/new` 명령이 실행될 때                          |
| `command:reset`           | `/reset` 명령이 실행될 때                        |
| `command:stop`            | `/stop` 명령이 실행될 때                         |
| `command`                 | 임의의 명령 이벤트 (일반 리스너)                 |
| `session:compact:before`  | 압축이 이력을 요약하기 전                        |
| `session:compact:after`   | 압축이 완료된 후                                 |
| `session:patch`           | 세션 속성이 수정될 때                            |
| `agent:bootstrap`         | 작업 공간 부트스트랩 파일이 주입되기 전          |
| `gateway:startup`         | 채널이 시작되고 훅이 로드된 후                   |
| `message:received`        | 임의의 채널에서 인바운드 메시지가 수신될 때      |
| `message:transcribed`     | 오디오 변환이 완료된 후                          |
| `message:preprocessed`    | 모든 미디어 및 링크 이해가 완료된 후             |
| `message:sent`            | 아웃바운드 메시지가 전달된 후                    |

## 훅 작성

### 훅 구조

각 훅은 두 파일이 포함된 디렉터리입니다:

```
my-hook/
├── HOOK.md          # 메타데이터 + 문서
└── handler.ts       # 핸들러 구현
```

### HOOK.md 형식

```markdown
---
name: my-hook
description: "이 훅이 무엇을 하는지 간략한 설명"
metadata:
  { "openclaw": { "emoji": "🔗", "events": ["command:new"], "requires": { "bins": ["node"] } } }
---

# My Hook

상세 문서는 여기에 작성합니다.
```

**메타데이터 필드** (`metadata.openclaw`):

| 필드      | 설명                                                         |
| --------- | ------------------------------------------------------------ |
| `emoji`   | CLI 표시 이모지                                              |
| `events`  | 수신할 이벤트 배열                                           |
| `export`  | 사용할 명명된 내보내기 (기본값: `"default"`)                 |
| `os`      | 필수 플랫폼 (예: `["darwin", "linux"]`)                      |
| `requires`| 필수 `bins`, `anyBins`, `env`, 또는 `config` 경로           |
| `always`  | 적격성 확인 건너뜀 (불리언)                                  |
| `install` | 설치 방법                                                    |

### 핸들러 구현

```typescript
const handler = async (event) => {
  if (event.type !== "command" || event.action !== "new") {
    return;
  }

  console.log(`[my-hook] New command triggered`);
  // 여기에 로직을 작성합니다

  // 선택적으로 사용자에게 메시지 전송
  event.messages.push("Hook executed!");
};

export default handler;
```

각 이벤트에는 `type`, `action`, `sessionKey`, `timestamp`, `messages` (사용자에게 보내려면 push), `context` (이벤트별 데이터)가 포함됩니다.

### 이벤트 컨텍스트 주요 내용

**명령 이벤트** (`command:new`, `command:reset`): `context.sessionEntry`, `context.previousSessionEntry`, `context.commandSource`, `context.workspaceDir`, `context.cfg`.

**메시지 이벤트** (`message:received`): `context.from`, `context.content`, `context.channelId`, `context.metadata` (`senderId`, `senderName`, `guildId`를 포함한 공급자별 데이터).

**메시지 이벤트** (`message:sent`): `context.to`, `context.content`, `context.success`, `context.channelId`.

**메시지 이벤트** (`message:transcribed`): `context.transcript`, `context.from`, `context.channelId`, `context.mediaPath`.

**메시지 이벤트** (`message:preprocessed`): `context.bodyForAgent` (최종 보강된 본문), `context.from`, `context.channelId`.

**부트스트랩 이벤트** (`agent:bootstrap`): `context.bootstrapFiles` (수정 가능한 배열), `context.agentId`.

**세션 패치 이벤트** (`session:patch`): `context.sessionEntry`, `context.patch` (변경된 필드만), `context.cfg`. 권한이 있는 클라이언트만 패치 이벤트를 트리거할 수 있습니다.

**압축 이벤트**: `session:compact:before`에는 `messageCount`, `tokenCount`가 포함됩니다. `session:compact:after`에는 `compactedCount`, `summaryLength`, `tokensBefore`, `tokensAfter`가 추가됩니다.

## 훅 검색

훅은 다음 디렉터리에서 우선순위가 높아지는 순서로 검색됩니다:

1. **번들 훅**: OpenClaw에 포함된 훅
2. **플러그인 훅**: 설치된 플러그인 내부에 번들된 훅
3. **관리형 훅**: `~/.openclaw/hooks/` (사용자가 설치, 작업 공간 간 공유). `hooks.internal.load.extraDirs`의 추가 디렉터리도 이 우선순위를 공유합니다.
4. **작업 공간 훅**: `<workspace>/hooks/` (에이전트별, 명시적으로 활성화할 때까지 기본적으로 비활성화)

작업 공간 훅은 새 훅 이름을 추가할 수 있지만, 동일한 이름의 번들, 관리형, 또는 플러그인 제공 훅을 재정의할 수 없습니다.

### 훅 패키지

훅 패키지는 `package.json`의 `openclaw.hooks`를 통해 훅을 내보내는 npm 패키지입니다. 다음 명령으로 설치합니다:

```bash
openclaw plugins install <path-or-spec>
```

npm 스펙은 레지스트리 전용입니다 (패키지 이름 + 선택적 정확한 버전 또는 dist-tag). Git/URL/파일 스펙 및 semver 범위는 거부됩니다.

## 번들 훅

| 훅                    | 이벤트                         | 기능                                                          |
| --------------------- | ------------------------------ | ------------------------------------------------------------- |
| session-memory        | `command:new`, `command:reset` | 세션 컨텍스트를 `<workspace>/memory/`에 저장                  |
| bootstrap-extra-files | `agent:bootstrap`              | glob 패턴으로 추가 부트스트랩 파일 주입                       |
| command-logger        | `command`                      | 모든 명령을 `~/.openclaw/logs/commands.log`에 기록            |
| boot-md               | `gateway:startup`              | 게이트웨이 시작 시 `BOOT.md` 실행                             |

번들 훅 활성화:

```bash
openclaw hooks enable <hook-name>
```

### session-memory 상세 정보

마지막 15개의 사용자/어시스턴트 메시지를 추출하고, LLM을 통해 설명적인 파일명 슬러그를 생성하여 `<workspace>/memory/YYYY-MM-DD-slug.md`에 저장합니다. `workspace.dir`이 설정되어 있어야 합니다.

### bootstrap-extra-files 설정

```json
{
  "hooks": {
    "internal": {
      "entries": {
        "bootstrap-extra-files": {
          "enabled": true,
          "paths": ["packages/*/AGENTS.md", "packages/*/TOOLS.md"]
        }
      }
    }
  }
}
```

경로는 작업 공간 기준으로 확인됩니다. 인식된 부트스트랩 기본 이름만 로드됩니다 (`AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, `HEARTBEAT.md`, `BOOTSTRAP.md`, `MEMORY.md`).

## 플러그인 훅

플러그인은 플러그인 SDK를 통해 훅을 등록하여 더 깊은 통합을 제공할 수 있습니다: 도구 호출 가로채기, 프롬프트 수정, 메시지 플로우 제어 등. 플러그인 SDK는 모델 해석, 에이전트 수명 주기, 메시지 플로우, 도구 실행, 서브에이전트 조율, 게이트웨이 수명 주기를 포함하는 28개의 훅을 노출합니다.

`before_tool_call`, `before_agent_reply`, `before_install` 및 기타 모든 플러그인 훅을 포함한 전체 플러그인 훅 참조는 [플러그인 아키텍처](/plugins/architecture#provider-runtime-hooks)를 참조하십시오.

## 설정

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "session-memory": { "enabled": true },
        "command-logger": { "enabled": false }
      }
    }
  }
}
```

훅별 환경 변수:

```json
{
  "hooks": {
    "internal": {
      "entries": {
        "my-hook": {
          "enabled": true,
          "env": { "MY_CUSTOM_VAR": "value" }
        }
      }
    }
  }
}
```

추가 훅 디렉터리:

```json
{
  "hooks": {
    "internal": {
      "load": {
        "extraDirs": ["/path/to/more/hooks"]
      }
    }
  }
}
```

<Note>
레거시 `hooks.internal.handlers` 배열 설정 형식은 하위 호환성을 위해 계속 지원되지만, 새 훅은 검색 기반 시스템을 사용해야 합니다.
</Note>

## CLI 참조

```bash
# 모든 훅 목록 (--eligible, --verbose, --json 추가 가능)
openclaw hooks list

# 훅에 대한 상세 정보 표시
openclaw hooks info <hook-name>

# 적격성 요약 표시
openclaw hooks check

# 활성화/비활성화
openclaw hooks enable <hook-name>
openclaw hooks disable <hook-name>
```

## 모범 사례

- **핸들러를 빠르게 유지하십시오.** 훅은 명령 처리 중에 실행됩니다. `void processInBackground(event)`로 무거운 작업을 실행하고 잊으십시오.
- **오류를 우아하게 처리하십시오.** 위험한 작업을 try/catch로 감싸십시오; 다른 핸들러가 실행될 수 있도록 던지지 마십시오.
- **이벤트를 일찍 필터링하십시오.** 이벤트 유형/액션이 관련이 없으면 즉시 반환하십시오.
- **특정 이벤트 키를 사용하십시오.** 오버헤드를 줄이기 위해 `"events": ["command"]` 대신 `"events": ["command:new"]`를 선호하십시오.

## 문제 해결

### 훅이 검색되지 않는 경우

```bash
# 디렉터리 구조 확인
ls -la ~/.openclaw/hooks/my-hook/
# 다음이 표시되어야 합니다: HOOK.md, handler.ts

# 검색된 모든 훅 목록
openclaw hooks list
```

### 훅이 적격하지 않은 경우

```bash
openclaw hooks info my-hook
```

누락된 바이너리 (PATH), 환경 변수, 설정 값, 또는 OS 호환성을 확인하십시오.

### 훅이 실행되지 않는 경우

1. 훅이 활성화되었는지 확인합니다: `openclaw hooks list`
2. 훅이 다시 로드되도록 게이트웨이 프로세스를 재시작합니다.
3. 게이트웨이 로그를 확인합니다: `./scripts/clawlog.sh | grep hook`

## 관련 항목

- [CLI 참조: 훅](/cli/hooks)
- [웹훅](/automation/cron-jobs#webhooks)
- [플러그인 아키텍처](/plugins/architecture#provider-runtime-hooks) — 전체 플러그인 훅 참조
- [설정](/gateway/configuration-reference#hooks)
