---
summary: "ClawHub 가이드: 공개 레지스트리, 네이티브 OpenClaw 설치 플로우, ClawHub CLI 워크플로우"
read_when:
  - 새 사용자에게 ClawHub를 소개하는 경우
  - 스킬 또는 플러그인을 설치, 검색, 게시하는 경우
  - ClawHub CLI 플래그와 동기화 동작을 설명하는 경우
title: "ClawHub"
---

ClawHub는 **OpenClaw 스킬과 플러그인**을 위한 공개 레지스트리입니다.

- 네이티브 `openclaw` 명령을 사용하여 ClawHub에서 스킬을 검색/설치/업데이트하고
  플러그인을 설치할 수 있습니다.
- 레지스트리 인증, 게시, 삭제, 복원 또는 동기화 워크플로우가 필요할 때는
  별도의 `clawhub` CLI를 사용하세요.

사이트: [clawhub.ai](https://clawhub.ai)

## 네이티브 OpenClaw 플로우

스킬:

```bash
openclaw skills search "calendar"
openclaw skills install <skill-slug>
openclaw skills update --all
```

플러그인:

```bash
openclaw plugins install clawhub:<package>
openclaw plugins update --all
```

단순한 npm-safe 플러그인 스펙도 npm 전에 ClawHub에서 먼저 시도됩니다:

```bash
openclaw plugins install openclaw-codex-app-server
```

네이티브 `openclaw` 명령은 활성 워크스페이스에 설치되며, 이후 `update` 호출이
ClawHub에 유지될 수 있도록 소스 메타데이터를 지속합니다.

플러그인 설치는 아카이브 설치 실행 전에 알려진 `pluginApi`와 `minGatewayVersion`
호환성을 검증하므로, 호환되지 않는 호스트는 패키지를 부분적으로 설치하지 않고
조기에 실패합니다.

`openclaw plugins install clawhub:...`는 설치 가능한 플러그인 계열만
허용합니다. ClawHub 패키지가 실제로는 스킬이라면 OpenClaw는 중단하고
대신 `openclaw skills install <slug>`를 안내합니다.

## ClawHub란

- OpenClaw 스킬과 플러그인을 위한 공개 레지스트리입니다.
- 스킬 번들과 메타데이터의 버전 저장소입니다.
- 검색, 태그, 사용 신호를 위한 디스커버리 표면입니다.

## 동작 방식

1. 사용자가 스킬 번들(파일 + 메타데이터)을 게시합니다.
2. ClawHub가 번들을 저장하고, 메타데이터를 파싱하고, 버전을 할당합니다.
3. 레지스트리가 검색과 디스커버리를 위해 스킬을 색인화합니다.
4. 사용자가 OpenClaw에서 스킬을 탐색, 다운로드, 설치합니다.

## 할 수 있는 일

- 새 스킬과 기존 스킬의 새 버전을 게시합니다.
- 이름, 태그 또는 검색으로 스킬을 발견합니다.
- 스킬 번들을 다운로드하고 파일을 검사합니다.
- 악의적이거나 안전하지 않은 스킬을 신고합니다.
- 모더레이터라면 숨기기, 숨김 해제, 삭제 또는 차단할 수 있습니다.

## 대상 (초보자 친화적)

OpenClaw 에이전트에 새 기능을 추가하고 싶다면, ClawHub는 스킬을 찾고 설치하는 가장 쉬운 방법입니다. 백엔드가 어떻게 동작하는지 알 필요는 없습니다. 다음을 할 수 있습니다:

- 자연어로 스킬을 검색합니다.
- 스킬을 워크스페이스에 설치합니다.
- 나중에 한 번의 명령으로 스킬을 업데이트합니다.
- 자신의 스킬을 게시하여 백업합니다.

## 빠른 시작 (비기술자용)

1. 필요한 것을 검색합니다:
   - `openclaw skills search "calendar"`
2. 스킬을 설치합니다:
   - `openclaw skills install <skill-slug>`
3. 새 스킬을 인식하도록 새로운 OpenClaw 세션을 시작합니다.
4. 게시하거나 레지스트리 인증을 관리하려면 별도의 `clawhub` CLI도
   설치하세요.

## ClawHub CLI 설치

게시/동기화와 같은 레지스트리 인증이 필요한 워크플로우에만 필요합니다:

```bash
npm i -g clawhub
```

```bash
pnpm add -g clawhub
```

## OpenClaw와의 통합 방식

네이티브 `openclaw skills install`은 활성 워크스페이스의 `skills/`
디렉터리에 설치합니다. `openclaw plugins install clawhub:...`는 일반 관리형
플러그인 설치와 함께 업데이트를 위한 ClawHub 소스 메타데이터를 기록합니다.

익명 ClawHub 플러그인 설치도 비공개 패키지에 대해서는 닫힌 상태로 실패합니다.
커뮤니티나 기타 비공식 채널에서도 여전히 설치할 수 있지만, OpenClaw가 경고하여
운영자가 활성화 전에 소스와 검증을 검토할 수 있습니다.

별도의 `clawhub` CLI도 현재 작업 디렉터리 아래 `./skills`에 스킬을 설치합니다.
OpenClaw 워크스페이스가 구성되어 있으면, `clawhub`는 `--workdir` (또는
`CLAWHUB_WORKDIR`)로 재정의하지 않는 한 해당 워크스페이스로 폴백합니다.
OpenClaw는 `<workspace>/skills`에서 워크스페이스 스킬을 로드하며
**다음** 세션에서 이를 인식합니다. 이미 `~/.openclaw/skills` 또는 번들된 스킬을
사용 중이라면 워크스페이스 스킬이 우선합니다.

스킬이 로드되고, 공유되고, 게이팅되는 방식에 대한 자세한 내용은
[Skills](/tools/skills)를 참고하세요.

## 스킬 시스템 개요

스킬은 OpenClaw에게 특정 작업을 수행하는 방법을 가르치는 파일의 버전 번들입니다.
각 게시는 새 버전을 생성하며, 레지스트리는 사용자가 변경 사항을 감사할 수
있도록 버전 이력을 유지합니다.

일반적인 스킬은 다음을 포함합니다:

- 주요 설명과 사용법이 담긴 `SKILL.md` 파일.
- 스킬에서 사용하는 선택적 설정, 스크립트 또는 지원 파일.
- 태그, 요약, 설치 요구사항과 같은 메타데이터.

ClawHub는 메타데이터를 활용하여 디스커버리를 강화하고 스킬 기능을 안전하게 노출합니다.
레지스트리는 또한 랭킹과 가시성을 개선하기 위해 사용 신호(예: 별점과 다운로드 수)를
추적합니다.

## 서비스 제공 기능

- 스킬과 해당 `SKILL.md` 콘텐츠의 **공개 탐색**.
- 키워드만이 아닌 임베딩(벡터 검색)으로 구동되는 **검색**.
- semver, 체인지로그, 태그(`latest` 포함)를 포함한 **버전 관리**.
- 버전별 zip으로의 **다운로드**.
- 커뮤니티 피드백을 위한 **별점 및 댓글**.
- 승인과 감사를 위한 **모더레이션** 훅.
- 자동화와 스크립팅을 위한 **CLI 친화적 API**.

## 보안과 모더레이션

ClawHub는 기본적으로 공개되어 있습니다. 누구나 스킬을 업로드할 수 있지만,
게시하려면 GitHub 계정이 최소 1주일 이상이어야 합니다. 이는 합법적인 기여자를
차단하지 않으면서 악용을 늦추는 데 도움이 됩니다.

신고와 모더레이션:

- 로그인한 모든 사용자는 스킬을 신고할 수 있습니다.
- 신고 사유는 필수이며 기록됩니다.
- 각 사용자는 한 번에 최대 20개의 활성 신고를 보유할 수 있습니다.
- 3명 이상의 고유한 신고가 있는 스킬은 기본적으로 자동 숨김 처리됩니다.
- 모더레이터는 숨겨진 스킬을 보고, 숨김 해제하고, 삭제하고, 사용자를 차단할 수 있습니다.
- 신고 기능을 남용하면 계정이 차단될 수 있습니다.

모더레이터가 되는 데 관심이 있으신가요? OpenClaw Discord에서 질문하고 모더레이터나
메인테이너에게 연락하세요.

## CLI 명령과 매개변수

전역 옵션 (모든 명령에 적용):

- `--workdir <dir>`: 작업 디렉터리 (기본값: 현재 디렉터리, OpenClaw 워크스페이스로 폴백).
- `--dir <dir>`: workdir 기준 스킬 디렉터리 (기본값: `skills`).
- `--site <url>`: 사이트 기본 URL (브라우저 로그인).
- `--registry <url>`: 레지스트리 API 기본 URL.
- `--no-input`: 프롬프트 비활성화 (비대화형).
- `-V, --cli-version`: CLI 버전 출력.

인증:

- `clawhub login` (브라우저 플로우) 또는 `clawhub login --token <token>`
- `clawhub logout`
- `clawhub whoami`

옵션:

- `--token <token>`: API 토큰을 붙여넣습니다.
- `--label <label>`: 브라우저 로그인 토큰에 저장되는 레이블 (기본값: `CLI token`).
- `--no-browser`: 브라우저를 열지 않습니다 (`--token` 필요).

검색:

- `clawhub search "query"`
- `--limit <n>`: 최대 결과 수.

설치:

- `clawhub install <slug>`
- `--version <version>`: 특정 버전을 설치합니다.
- `--force`: 폴더가 이미 존재하면 덮어씁니다.

업데이트:

- `clawhub update <slug>`
- `clawhub update --all`
- `--version <version>`: 특정 버전으로 업데이트합니다 (단일 slug만).
- `--force`: 로컬 파일이 게시된 버전과 일치하지 않을 때 덮어씁니다.

목록:

- `clawhub list` (`.clawhub/lock.json`을 읽습니다)

스킬 게시:

- `clawhub skill publish <path>`
- `--slug <slug>`: 스킬 slug.
- `--name <name>`: 표시 이름.
- `--version <version>`: Semver 버전.
- `--changelog <text>`: 체인지로그 텍스트 (비워도 됨).
- `--tags <tags>`: 쉼표로 구분된 태그 (기본값: `latest`).

플러그인 게시:

- `clawhub package publish <source>`
- `<source>`는 로컬 폴더, `owner/repo`, `owner/repo@ref` 또는 GitHub URL이 될 수 있습니다.
- `--dry-run`: 업로드 없이 정확한 게시 계획을 빌드합니다.
- `--json`: CI용 기계 판독 가능 출력을 내보냅니다.
- `--source-repo`, `--source-commit`, `--source-ref`: 자동 감지가 충분하지 않을 때의 선택적 재정의.

삭제/복원 (소유자/관리자 전용):

- `clawhub delete <slug> --yes`
- `clawhub undelete <slug> --yes`

동기화 (로컬 스킬 스캔 + 신규/업데이트 게시):

- `clawhub sync`
- `--root <dir...>`: 추가 스캔 루트.
- `--all`: 프롬프트 없이 모두 업로드합니다.
- `--dry-run`: 업로드될 내용을 보여줍니다.
- `--bump <type>`: 업데이트의 경우 `patch|minor|major` (기본값: `patch`).
- `--changelog <text>`: 비대화형 업데이트용 체인지로그.
- `--tags <tags>`: 쉼표로 구분된 태그 (기본값: `latest`).
- `--concurrency <n>`: 레지스트리 검사 (기본값: 4).

## 에이전트를 위한 일반적인 워크플로우

### 스킬 검색

```bash
clawhub search "postgres backups"
```

### 새 스킬 다운로드

```bash
clawhub install my-skill-pack
```

### 설치된 스킬 업데이트

```bash
clawhub update --all
```

### 스킬 백업 (게시 또는 동기화)

단일 스킬 폴더의 경우:

```bash
clawhub skill publish ./my-skill --slug my-skill --name "My Skill" --version 1.0.0 --tags latest
```

여러 스킬을 한 번에 스캔하고 백업하려면:

```bash
clawhub sync --all
```

### GitHub에서 플러그인 게시

```bash
clawhub package publish your-org/your-plugin --dry-run
clawhub package publish your-org/your-plugin
clawhub package publish your-org/your-plugin@v1.0.0
clawhub package publish https://github.com/your-org/your-plugin
```

코드 플러그인은 `package.json`에 필수 OpenClaw 메타데이터를 포함해야 합니다:

```json
{
  "name": "@myorg/openclaw-my-plugin",
  "version": "1.0.0",
  "type": "module",
  "openclaw": {
    "extensions": ["./src/index.ts"],
    "runtimeExtensions": ["./dist/index.js"],
    "compat": {
      "pluginApi": ">=2026.3.24-beta.2",
      "minGatewayVersion": "2026.3.24-beta.2"
    },
    "build": {
      "openclawVersion": "2026.3.24-beta.2",
      "pluginSdkVersion": "2026.3.24-beta.2"
    }
  }
}
```

게시된 패키지는 빌드된 JavaScript를 포함해야 하며 `runtimeExtensions`가 그
출력을 가리키도록 해야 합니다. Git 체크아웃 설치는 빌드된 파일이 없을 때
여전히 TypeScript 소스로 폴백할 수 있지만, 빌드된 런타임 항목은 시작, doctor,
플러그인 로딩 경로에서 런타임 TypeScript 컴파일을 피할 수 있습니다.

## 고급 세부 사항 (기술적)

### 버전 관리와 태그

- 각 게시는 새로운 **semver** `SkillVersion`을 생성합니다.
- 태그(예: `latest`)는 버전을 가리키며, 태그를 이동시키면 롤백할 수 있습니다.
- 체인지로그는 버전별로 첨부되며 동기화 또는 업데이트 게시 시 비워둘 수 있습니다.

### 로컬 변경 vs 레지스트리 버전

업데이트는 콘텐츠 해시를 사용하여 로컬 스킬 콘텐츠를 레지스트리 버전과 비교합니다. 로컬 파일이 게시된 버전과 일치하지 않으면 CLI가 덮어쓰기 전에 묻습니다 (비대화형 실행에서는 `--force`가 필요합니다).

### 동기화 스캔과 폴백 루트

`clawhub sync`는 현재 workdir을 먼저 스캔합니다. 스킬이 발견되지 않으면 알려진 레거시 위치(예: `~/openclaw/skills` 및 `~/.openclaw/skills`)로 폴백합니다. 이는 추가 플래그 없이 오래된 스킬 설치를 찾도록 설계되었습니다.

### 스토리지와 잠금 파일

- 설치된 스킬은 workdir 아래 `.clawhub/lock.json`에 기록됩니다.
- 인증 토큰은 ClawHub CLI 구성 파일에 저장됩니다 (`CLAWHUB_CONFIG_PATH`로 재정의).

### 텔레메트리 (설치 카운트)

로그인한 상태에서 `clawhub sync`를 실행하면, CLI는 설치 수를 계산하기 위해 최소한의 스냅샷을 전송합니다. 이를 완전히 비활성화할 수 있습니다:

```bash
export CLAWHUB_DISABLE_TELEMETRY=1
```

## 환경 변수

- `CLAWHUB_SITE`: 사이트 URL을 재정의합니다.
- `CLAWHUB_REGISTRY`: 레지스트리 API URL을 재정의합니다.
- `CLAWHUB_CONFIG_PATH`: CLI가 토큰/구성을 저장하는 위치를 재정의합니다.
- `CLAWHUB_WORKDIR`: 기본 workdir을 재정의합니다.
- `CLAWHUB_DISABLE_TELEMETRY=1`: `sync`에서 텔레메트리를 비활성화합니다.

## 관련

- [Plugin](/tools/plugin)
- [Skills](/tools/skills)
- [Community plugins](/plugins/community)
