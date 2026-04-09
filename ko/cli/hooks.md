---
summary: "`openclaw hooks`에 대한 CLI 참조 (에이전트 훅)"
read_when:
  - 에이전트 훅을 관리하려는 경우
  - 훅 가용성을 검사하거나 워크스페이스 훅을 활성화하려는 경우
title: "hooks"
---

# `openclaw hooks`

에이전트 훅 관리 (`/new`, `/reset`, 게이트웨이 시작과 같은 명령에 대한 이벤트 기반 자동화).

하위 명령 없이 `openclaw hooks`를 실행하는 것은 `openclaw hooks list`와 동일합니다.

관련:

- 훅: [훅](/automation/hooks)
- 플러그인 훅: [플러그인 훅](/plugins/architecture#provider-runtime-hooks)

## 모든 훅 나열

```bash
openclaw hooks list
```

워크스페이스, 관리, 추가, 번들 디렉터리에서 발견된 모든 훅을 나열합니다.

**옵션:**

- `--eligible`: 적합한 훅만 표시 (요구 사항 충족)
- `--json`: JSON으로 출력
- `-v, --verbose`: 누락된 요구 사항을 포함한 자세한 정보 표시

**출력 예시:**

```
Hooks (4/4 ready)

Ready:
  🚀 boot-md ✓ - Run BOOT.md on gateway startup
  📎 bootstrap-extra-files ✓ - Inject extra workspace bootstrap files during agent bootstrap
  📝 command-logger ✓ - Log all command events to a centralized audit file
  💾 session-memory ✓ - Save session context to memory when /new or /reset command is issued
```

**예시 (상세):**

```bash
openclaw hooks list --verbose
```

적합하지 않은 훅의 누락된 요구 사항을 표시합니다.

**예시 (JSON):**

```bash
openclaw hooks list --json
```

프로그래밍 방식으로 사용하기 위한 구조화된 JSON을 반환합니다.

## 훅 정보 가져오기

```bash
openclaw hooks info <name>
```

특정 훅에 대한 자세한 정보를 표시합니다.

**인수:**

- `<name>`: 훅 이름 또는 훅 키 (예: `session-memory`)

**옵션:**

- `--json`: JSON으로 출력

**예시:**

```bash
openclaw hooks info session-memory
```

**출력:**

```
💾 session-memory ✓ Ready

Save session context to memory when /new or /reset command is issued

Details:
  Source: openclaw-bundled
  Path: /path/to/openclaw/hooks/bundled/session-memory/HOOK.md
  Handler: /path/to/openclaw/hooks/bundled/session-memory/handler.ts
  Homepage: https://docs.openclaw.ai/automation/hooks#session-memory
  Events: command:new, command:reset

Requirements:
  Config: ✓ workspace.dir
```

## 훅 적합성 확인

```bash
openclaw hooks check
```

훅 적합성 상태 요약을 표시합니다 (준비된 것 대 준비되지 않은 것).

**옵션:**

- `--json`: JSON으로 출력

**출력 예시:**

```
Hooks Status

Total hooks: 4
Ready: 4
Not ready: 0
```

## 훅 활성화

```bash
openclaw hooks enable <name>
```

구성에 추가하여 특정 훅을 활성화합니다 (기본적으로 `~/.openclaw/openclaw.json`).

**참고:** 워크스페이스 훅은 여기 또는 구성에서 활성화할 때까지 기본적으로 비활성화됩니다. 플러그인에 의해 관리되는 훅은 `openclaw hooks list`에서 `plugin:<id>`로 표시되며 여기서 활성화/비활성화할 수 없습니다. 대신 플러그인을 활성화/비활성화하세요.

**인수:**

- `<name>`: 훅 이름 (예: `session-memory`)

**예시:**

```bash
openclaw hooks enable session-memory
```

**출력:**

```
✓ Enabled hook: 💾 session-memory
```

**수행 작업:**

- 훅이 존재하고 적합한지 확인
- 구성에서 `hooks.internal.entries.<name>.enabled = true` 업데이트
- 구성을 디스크에 저장

훅이 `<workspace>/hooks/`에서 온 경우 Gateway가 로드하려면 이 옵트인 단계가 필요합니다.

**활성화 후:**

- 훅이 다시 로드되도록 게이트웨이를 재시작하세요 (macOS에서 메뉴 바 앱 재시작 또는 개발에서 게이트웨이 프로세스 재시작).

## 훅 비활성화

```bash
openclaw hooks disable <name>
```

구성을 업데이트하여 특정 훅을 비활성화합니다.

**인수:**

- `<name>`: 훅 이름 (예: `command-logger`)

**예시:**

```bash
openclaw hooks disable command-logger
```

**출력:**

```
⏸ Disabled hook: 📝 command-logger
```

**비활성화 후:**

- 훅이 다시 로드되도록 게이트웨이를 재시작하세요.

## 참고사항

- `openclaw hooks list --json`, `info --json`, `check --json`은 구조화된 JSON을 직접 stdout에 씁니다.
- 플러그인 관리 훅은 여기서 활성화하거나 비활성화할 수 없습니다. 대신 소유 플러그인을 활성화하거나 비활성화하세요.

## 훅 팩 설치

```bash
openclaw plugins install <package>        # ClawHub 우선, 그 다음 npm
openclaw plugins install <package> --pin  # 버전 고정
openclaw plugins install <path>           # 로컬 경로
```

통합 플러그인 설치 프로그램을 통해 훅 팩을 설치합니다.

`openclaw hooks install`은 호환성 별칭으로 여전히 작동하지만 더 이상 사용되지 않는다는 경고를 출력하고 `openclaw plugins install`로 전달합니다.

Npm 스펙은 **레지스트리 전용** (패키지 이름 + 선택적 **정확한 버전** 또는 **dist-tag**)입니다. Git/URL/파일 스펙과 semver 범위는 거부됩니다. 종속성 설치는 안전을 위해 `--ignore-scripts`로 실행됩니다.

기본 스펙과 `@latest`는 안정 트랙에 유지됩니다. npm이 둘 중 하나를 사전 릴리스로 확인하면 OpenClaw는 중단하고 `@beta`/`@rc` 또는 정확한 사전 릴리스 버전과 같은 사전 릴리스 태그로 명시적으로 옵트인하도록 요청합니다.

**수행 작업:**

- 훅 팩을 `~/.openclaw/hooks/<id>`에 복사
- `hooks.internal.entries.*`에서 설치된 훅 활성화
- `hooks.internal.installs`에 설치 기록

**옵션:**

- `-l, --link`: 복사 대신 로컬 디렉터리 링크 (`hooks.internal.load.extraDirs`에 추가)
- `--pin`: npm 설치를 `hooks.internal.installs`에 정확한 확인된 `name@version`으로 기록

**지원되는 아카이브:** `.zip`, `.tgz`, `.tar.gz`, `.tar`

**예시:**

```bash
# 로컬 디렉터리
openclaw plugins install ./my-hook-pack

# 로컬 아카이브
openclaw plugins install ./my-hook-pack.zip

# NPM 패키지
openclaw plugins install @openclaw/my-hook-pack

# 복사 없이 로컬 디렉터리 링크
openclaw plugins install -l ./my-hook-pack
```

링크된 훅 팩은 워크스페이스 훅이 아닌 운영자 구성 디렉터리의 관리 훅으로 처리됩니다.

## 훅 팩 업데이트

```bash
openclaw plugins update <id>
openclaw plugins update --all
```

통합 플러그인 업데이터를 통해 추적된 npm 기반 훅 팩을 업데이트합니다.

`openclaw hooks update`는 호환성 별칭으로 여전히 작동하지만 더 이상 사용되지 않는다는 경고를 출력하고 `openclaw plugins update`로 전달합니다.

**옵션:**

- `--all`: 추적된 모든 훅 팩 업데이트
- `--dry-run`: 작성 없이 변경될 내용 표시

저장된 무결성 해시가 존재하고 가져온 아티팩트 해시가 변경되면 OpenClaw는 경고를 출력하고 진행하기 전에 확인을 요청합니다. CI/비대화형 실행에서 프롬프트를 우회하려면 전역 `--yes`를 사용하세요.

## 번들 훅

### session-memory

`/new` 또는 `/reset`을 실행할 때 세션 컨텍스트를 메모리에 저장합니다.

**활성화:**

```bash
openclaw hooks enable session-memory
```

**출력:** `~/.openclaw/workspace/memory/YYYY-MM-DD-slug.md`

**참조:** [session-memory 문서](/automation/hooks#session-memory)

### bootstrap-extra-files

`agent:bootstrap` 중에 추가 부트스트랩 파일 (예: 모노레포 로컬 `AGENTS.md` / `TOOLS.md`)을 주입합니다.

**활성화:**

```bash
openclaw hooks enable bootstrap-extra-files
```

**참조:** [bootstrap-extra-files 문서](/automation/hooks#bootstrap-extra-files)

### command-logger

모든 명령 이벤트를 중앙 집중식 감사 파일에 기록합니다.

**활성화:**

```bash
openclaw hooks enable command-logger
```

**출력:** `~/.openclaw/logs/commands.log`

**로그 보기:**

```bash
# 최근 명령
tail -n 20 ~/.openclaw/logs/commands.log

# 형식화 출력
cat ~/.openclaw/logs/commands.log | jq .

# 작업별 필터
grep '"action":"new"' ~/.openclaw/logs/commands.log | jq .
```

**참조:** [command-logger 문서](/automation/hooks#command-logger)

### boot-md

게이트웨이 시작 시 (채널 시작 후) `BOOT.md`를 실행합니다.

**이벤트**: `gateway:startup`

**활성화**:

```bash
openclaw hooks enable boot-md
```

**참조:** [boot-md 문서](/automation/hooks#boot-md)
