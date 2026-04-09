---
summary: "ClawHub 가이드: 공개 레지스트리, 기본 OpenClaw 설치 플로우, ClawHub CLI 워크플로우"
read_when:
  - 새 사용자에게 ClawHub를 소개하는 경우
  - 스킬 또는 플러그인 설치, 검색, 또는 게시하는 경우
  - ClawHub CLI 플래그 및 동기화 동작을 설명하는 경우
title: "ClawHub"
---

# ClawHub

ClawHub는 **OpenClaw 스킬 및 플러그인**을 위한 공개 레지스트리입니다.

- 기본 `openclaw` 명령을 사용하여 스킬을 검색/설치/업데이트하고 ClawHub에서 플러그인을 설치합니다.
- 레지스트리 인증, 게시, 삭제, 삭제 취소, 또는 동기화 워크플로우가 필요한 경우 별도의 `clawhub` CLI를 사용합니다.

사이트: [clawhub.ai](https://clawhub.ai)

## 기본 OpenClaw 플로우

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

npm 안전한 플러그인 사양도 npm 전에 ClawHub에서 먼저 시도됩니다:

```bash
openclaw plugins install openclaw-codex-app-server
```

기본 `openclaw` 명령은 활성 워크스페이스에 설치하고 소스 메타데이터를 유지하여 이후 `update` 호출이 ClawHub에 머물 수 있습니다.

플러그인 설치는 아카이브 설치가 실행되기 전에 advertised `pluginApi` 및 `minGatewayVersion` 호환성을 검증하므로 호환되지 않는 호스트는 패키지를 부분적으로 설치하는 대신 일찍 종료됩니다.

`openclaw plugins install clawhub:...`은 설치 가능한 플러그인 패밀리만 허용합니다.
ClawHub 패키지가 실제로 스킬인 경우, OpenClaw는 중지하고 `openclaw skills install <slug>`를 안내합니다.

## ClawHub란

- OpenClaw 스킬 및 플러그인을 위한 공개 레지스트리.
- 스킬 번들 및 메타데이터의 버전 저장소.
- 검색, 태그, 사용 신호를 통한 검색 표면.

## 작동 방식

1. 사용자가 스킬 번들(파일 + 메타데이터)을 게시합니다.
2. ClawHub가 번들을 저장하고, 메타데이터를 파싱하며, 버전을 할당합니다.
3. 레지스트리가 검색 및 검색을 위해 스킬을 인덱싱합니다.
4. 사용자가 OpenClaw에서 스킬을 탐색, 다운로드 및 설치합니다.

## 할 수 있는 것

- 새 스킬 및 기존 스킬의 새 버전을 게시합니다.
- 이름, 태그, 또는 검색으로 스킬을 검색합니다.
- 스킬 번들을 다운로드하고 파일을 검사합니다.
- 남용 또는 안전하지 않은 스킬을 신고합니다.
- 모더레이터인 경우, 숨기기, 숨기기 취소, 삭제, 또는 차단합니다.

## 대상 (초보자 친화적)

OpenClaw 에이전트에 새 기능을 추가하려는 경우, ClawHub가 스킬을 찾고 설치하는 가장 쉬운 방법입니다. 백엔드 작동 방식을 알 필요 없이:

- 일반 언어로 스킬을 검색합니다.
- 스킬을 워크스페이스에 설치합니다.
- 한 명령으로 나중에 스킬을 업데이트합니다.
- 게시하여 자신의 스킬을 백업합니다.

## 빠른 시작 (비기술적)

1. 필요한 것을 검색합니다:
   - `openclaw skills search "calendar"`
2. 스킬을 설치합니다:
   - `openclaw skills install <skill-slug>`
3. 새 OpenClaw 세션을 시작하여 새 스킬을 가져옵니다.
4. 게시 또는 레지스트리 인증을 원하는 경우 별도의 `clawhub` CLI도 설치합니다.

## ClawHub CLI 설치

레지스트리 인증 워크플로우(게시/동기화 등)에만 필요합니다:

```bash
npm i -g clawhub
```

```bash
pnpm add -g clawhub
```

## OpenClaw와의 통합

기본 `openclaw skills install`은 활성 워크스페이스 `skills/` 디렉토리에 설치합니다. `openclaw plugins install clawhub:...`은 일반 관리형 플러그인 설치에 ClawHub 소스 메타데이터를 추가합니다.

익명 ClawHub 플러그인 설치는 비공개 패키지에 대해서도 종료됩니다.
커뮤니티 또는 기타 비공식 채널은 여전히 설치할 수 있지만, OpenClaw는 운영자가 활성화하기 전에 소스 및 검증을 검토할 수 있도록 경고합니다.

별도의 `clawhub` CLI도 현재 작업 디렉토리 아래의 `./skills`에 스킬을 설치합니다. OpenClaw 워크스페이스가 설정된 경우, `clawhub`는 `--workdir`(또는 `CLAWHUB_WORKDIR`)을 재정의하지 않는 한 해당 워크스페이스로 폴백합니다. OpenClaw는 `<workspace>/skills`에서 워크스페이스 스킬을 로드하며 **다음** 세션에서 가져옵니다. 이미 `~/.openclaw/skills` 또는 번들된 스킬을 사용하는 경우 워크스페이스 스킬이 우선합니다.

스킬이 로드, 공유 및 게이트되는 방법에 대한 자세한 내용은 [스킬](/tools/skills)을 참조하십시오.

## 스킬 시스템 개요

스킬은 OpenClaw에 특정 작업을 수행하는 방법을 가르치는 버전 관리된 파일 번들입니다. 각 게시는 새 버전을 생성하며, 레지스트리는 버전 이력을 유지하므로 사용자가 변경 사항을 감사할 수 있습니다.

일반적인 스킬에는 다음이 포함됩니다:

- 기본 설명과 사용 방법이 있는 `SKILL.md` 파일.
- 스킬에서 사용하는 선택적 설정, 스크립트, 또는 지원 파일.
- 태그, 요약, 설치 요구 사항과 같은 메타데이터.

ClawHub는 메타데이터를 사용하여 검색을 지원하고 스킬 기능을 안전하게 노출합니다. 레지스트리는 또한 사용 신호(별점 및 다운로드 수 등)를 추적하여 순위 및 가시성을 향상시킵니다.

## 서비스 제공 기능

- 스킬 및 `SKILL.md` 콘텐츠의 **공개 탐색**.
- 키워드가 아닌 임베딩(벡터 검색)으로 지원되는 **검색**.
- 시맨틱 버전, 변경 로그, 태그(`latest` 포함)를 포함한 **버전 관리**.
- 버전별 zip으로 **다운로드**.
- 커뮤니티 피드백을 위한 **별점 및 댓글**.
- 승인 및 감사를 위한 **모더레이션** 훅.
- 자동화 및 스크립팅을 위한 **CLI 친화적 API**.

## 보안 및 모더레이션

ClawHub는 기본적으로 개방되어 있습니다. 누구나 스킬을 업로드할 수 있지만 게시하려면 GitHub 계정이 최소 1주일이 지나야 합니다. 이는 합법적인 기여자를 차단하지 않으면서 남용을 늦추는 데 도움이 됩니다.

신고 및 모더레이션:

- 로그인한 모든 사용자가 스킬을 신고할 수 있습니다.
- 신고 이유는 필수이며 기록됩니다.
- 각 사용자는 한 번에 최대 20개의 활성 신고를 할 수 있습니다.
- 3개 이상의 고유 신고를 받은 스킬은 기본적으로 자동으로 숨겨집니다.
- 모더레이터는 숨겨진 스킬을 보고, 숨기기 취소, 삭제, 또는 사용자를 차단할 수 있습니다.
- 신고 기능을 남용하면 계정 차단이 될 수 있습니다.

모더레이터가 되는 데 관심이 있으신가요? OpenClaw Discord에서 문의하고 모더레이터나 유지 관리자에게 연락하십시오.

## CLI 명령 및 파라미터

전역 옵션 (모든 명령에 적용):

- `--workdir <dir>`: 작업 디렉토리 (기본값: 현재 dir; OpenClaw 워크스페이스로 폴백).
- `--dir <dir>`: 스킬 디렉토리, workdir 기준 상대 경로 (기본값: `skills`).
- `--site <url>`: 사이트 기본 URL (브라우저 로그인).
- `--registry <url>`: 레지스트리 API 기본 URL.
- `--no-input`: 프롬프트 비활성화 (비대화형).
- `-V, --cli-version`: CLI 버전 출력.

인증:

- `clawhub login` (브라우저 플로우) 또는 `clawhub login --token <token>`
- `clawhub logout`
- `clawhub whoami`

옵션:

- `--token <token>`: API 토큰 붙여넣기.
- `--label <label>`: 브라우저 로그인 토큰에 저장되는 레이블 (기본값: `CLI token`).
- `--no-browser`: 브라우저를 열지 않음 (`--token` 필요).

검색:

- `clawhub search "query"`
- `--limit <n>`: 최대 결과 수.

설치:

- `clawhub install <slug>`
- `--version <version>`: 특정 버전 설치.
- `--force`: 폴더가 이미 있으면 덮어쓰기.

업데이트:

- `clawhub update <slug>`
- `clawhub update --all`
- `--version <version>`: 특정 버전으로 업데이트 (단일 slug만 해당).
- `--force`: 로컬 파일이 게시된 버전과 일치하지 않을 때 덮어쓰기.

목록:

- `clawhub list` (`.clawhub/lock.json` 읽기)

스킬 게시:

- `clawhub skill publish <path>`
- `--slug <slug>`: 스킬 slug.
- `--name <name>`: 표시 이름.
- `--version <version>`: Semver 버전.
- `--changelog <text>`: 변경 로그 텍스트 (비어 있을 수 있음).
- `--tags <tags>`: 쉼표로 구분된 태그 (기본값: `latest`).

플러그인 게시:

- `clawhub package publish <source>`
- `<source>`는 로컬 폴더, `owner/repo`, `owner/repo@ref`, 또는 GitHub URL이 될 수 있습니다.
- `--dry-run`: 아무것도 업로드하지 않고 정확한 게시 계획을 빌드합니다.
- `--json`: CI를 위한 기계 판독 가능한 출력을 내보냅니다.
- `--source-repo`, `--source-commit`, `--source-ref`: 자동 감지가 충분하지 않을 때 선택적 재정의.

삭제/삭제 취소 (소유자/관리자만):

- `clawhub delete <slug> --yes`
- `clawhub undelete <slug> --yes`

동기화 (로컬 스킬 스캔 + 신규/업데이트된 것 게시):

- `clawhub sync`
- `--root <dir...>`: 추가 스캔 루트.
- `--all`: 프롬프트 없이 모두 업로드.
- `--dry-run`: 업로드될 항목 표시.
- `--bump <type>`: 업데이트용 `patch|minor|major` (기본값: `patch`).
- `--changelog <text>`: 비대화형 업데이트용 변경 로그.
- `--tags <tags>`: 쉼표로 구분된 태그 (기본값: `latest`).
- `--concurrency <n>`: 레지스트리 확인 (기본값: 4).

## 에이전트를 위한 일반 워크플로우

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

한 번에 많은 스킬을 스캔하고 백업하려면:

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
    "extensions": ["./index.ts"],
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

## 고급 세부 정보 (기술적)

### 버전 관리 및 태그

- 각 게시는 새 **semver** `SkillVersion`을 생성합니다.
- 태그(예: `latest`)는 버전을 가리킵니다; 태그를 이동하면 롤백이 가능합니다.
- 변경 로그는 버전별로 첨부되며 동기화 또는 게시 업데이트 시 비어 있을 수 있습니다.

### 로컬 변경 vs 레지스트리 버전

업데이트는 콘텐츠 해시를 사용하여 로컬 스킬 콘텐츠를 레지스트리 버전과 비교합니다. 로컬 파일이 게시된 버전과 일치하지 않으면 CLI는 덮어쓰기 전에 묻습니다(비대화형 실행에서는 `--force` 필요).

### 동기화 스캔 및 폴백 루트

`clawhub sync`는 먼저 현재 workdir를 스캔합니다. 스킬이 없으면 알려진 레거시 위치(예: `~/openclaw/skills` 및 `~/.openclaw/skills`)로 폴백합니다. 이는 추가 플래그 없이 이전 스킬 설치를 찾도록 설계되었습니다.

### 저장소 및 잠금 파일

- 설치된 스킬은 workdir 아래의 `.clawhub/lock.json`에 기록됩니다.
- 인증 토큰은 ClawHub CLI 설정 파일에 저장됩니다 (`CLAWHUB_CONFIG_PATH`로 재정의).

### 텔레메트리 (설치 카운트)

로그인한 상태에서 `clawhub sync`를 실행하면 CLI는 설치 카운트 계산을 위한 최소 스냅샷을 보냅니다. 완전히 비활성화하려면:

```bash
export CLAWHUB_DISABLE_TELEMETRY=1
```

## 환경 변수

- `CLAWHUB_SITE`: 사이트 URL 재정의.
- `CLAWHUB_REGISTRY`: 레지스트리 API URL 재정의.
- `CLAWHUB_CONFIG_PATH`: CLI가 토큰/설정을 저장하는 위치 재정의.
- `CLAWHUB_WORKDIR`: 기본 workdir 재정의.
- `CLAWHUB_DISABLE_TELEMETRY=1`: `sync`에서 텔레메트리 비활성화.
