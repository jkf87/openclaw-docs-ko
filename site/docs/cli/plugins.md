---
title: "plugins"
description: "`openclaw plugins`에 대한 CLI 참조 (list, install, marketplace, uninstall, enable/disable, doctor)"
---

# `openclaw plugins`

Gateway 플러그인/확장, 훅 팩, 호환 번들을 관리합니다.

관련:

- 플러그인 시스템: [플러그인](/tools/plugin)
- 번들 호환성: [플러그인 번들](/plugins/bundles)
- 플러그인 매니페스트 + 스키마: [플러그인 매니페스트](/plugins/manifest)
- 보안 강화: [보안](/gateway/security)

## 명령

```bash
openclaw plugins list
openclaw plugins list --enabled
openclaw plugins list --verbose
openclaw plugins list --json
openclaw plugins install &lt;path-or-spec&gt;
openclaw plugins inspect &lt;id&gt;
openclaw plugins inspect &lt;id&gt; --json
openclaw plugins inspect --all
openclaw plugins info &lt;id&gt;
openclaw plugins enable &lt;id&gt;
openclaw plugins disable &lt;id&gt;
openclaw plugins uninstall &lt;id&gt;
openclaw plugins doctor
openclaw plugins update &lt;id&gt;
openclaw plugins update --all
openclaw plugins marketplace list &lt;marketplace&gt;
openclaw plugins marketplace list &lt;marketplace&gt; --json
```

번들 플러그인은 OpenClaw와 함께 제공됩니다. 일부는 기본적으로 활성화됩니다 (예: 번들 모델 프로바이더, 번들 음성 프로바이더, 번들 브라우저 플러그인); 다른 것들은 `plugins enable`이 필요합니다.

네이티브 OpenClaw 플러그인은 인라인 JSON 스키마 (`configSchema`, 비어 있더라도)가 있는 `openclaw.plugin.json`을 포함해야 합니다. 호환 번들은 자체 번들 매니페스트를 대신 사용합니다.

`plugins list`는 `Format: openclaw` 또는 `Format: bundle`을 표시합니다. 상세 목록/정보 출력은 번들 하위 유형 (`codex`, `claude`, 또는 `cursor`)과 감지된 번들 기능도 표시합니다.

### 설치

```bash
openclaw plugins install &lt;package&gt;                      # ClawHub 우선, 그다음 npm
openclaw plugins install clawhub:&lt;package&gt;              # ClawHub만
openclaw plugins install &lt;package&gt; --force              # 기존 설치 덮어쓰기
openclaw plugins install &lt;package&gt; --pin                # 버전 고정
openclaw plugins install &lt;package&gt; --dangerously-force-unsafe-install
openclaw plugins install &lt;path&gt;                         # 로컬 경로
openclaw plugins install &lt;plugin&gt;@&lt;marketplace&gt;         # 마켓플레이스
openclaw plugins install &lt;plugin&gt; --marketplace &lt;name&gt;  # 마켓플레이스 (명시적)
openclaw plugins install &lt;plugin&gt; --marketplace https://github.com/&lt;owner&gt;/&lt;repo&gt;
```

베어 패키지 이름은 먼저 ClawHub에 대해 확인되고, 그다음 npm에 대해 확인됩니다. 보안 참고: 플러그인 설치를 코드 실행처럼 처리하세요. 고정된 버전을 선호하세요.

구성이 유효하지 않으면 `plugins install`은 일반적으로 실패하고 먼저 `openclaw doctor --fix`를 실행하도록 안내합니다. 유일하게 문서화된 예외는 명시적으로 `openclaw.install.allowInvalidConfigRecovery`를 옵트인하는 플러그인에 대한 좁은 번들 플러그인 복구 경로입니다.

`--force`는 기존 설치 대상을 재사용하고 이미 설치된 플러그인 또는 훅 팩을 덮어씁니다. 새 로컬 경로, 아카이브, ClawHub 패키지, 또는 npm 아티팩트에서 동일한 id를 의도적으로 재설치할 때 사용하세요.

`--pin`은 npm 설치에만 적용됩니다. 마켓플레이스 설치는 npm 스펙 대신 마켓플레이스 소스 메타데이터를 유지하기 때문에 `--marketplace`와 함께 지원되지 않습니다.

`--dangerously-force-unsafe-install`은 내장 위험 코드 스캐너의 오탐지를 위한 브레이크 글래스 옵션입니다. 내장 스캐너가 `critical` 발견을 보고하더라도 설치가 계속될 수 있게 하지만 플러그인 `before_install` 훅 정책 차단을 우회하거나 스캔 실패를 우회하지는 **않습니다**.

이 CLI 플래그는 플러그인 설치/업데이트 흐름에 적용됩니다. 게이트웨이 백업 스킬 의존성 설치는 일치하는 `dangerouslyForceUnsafeInstall` 요청 재정의를 사용하고, `openclaw skills install`은 별도의 ClawHub 스킬 다운로드/설치 흐름입니다.

`plugins install`은 `package.json`에 `openclaw.hooks`를 노출하는 훅 팩의 설치 표면이기도 합니다. 패키지 설치가 아닌 필터링된 훅 가시성 및 훅별 활성화에는 `openclaw hooks`를 사용하세요.

Npm 스펙은 **레지스트리 전용** (패키지 이름 + 선택적 **정확한 버전** 또는 **dist-tag**)입니다. Git/URL/파일 스펙과 semver 범위는 거부됩니다. 의존성 설치는 안전을 위해 `--ignore-scripts`로 실행됩니다.

베어 스펙과 `@latest`는 stable 트랙에 유지됩니다. npm이 둘 중 하나를 사전 릴리스로 확인하면 OpenClaw는 중단하고 `@beta`/`@rc` 또는 정확한 사전 릴리스 버전 `@1.2.3-beta.4`와 같은 사전 릴리스 태그로 명시적으로 옵트인하도록 요청합니다.

베어 설치 스펙이 번들 플러그인 id와 일치하면 (예: `diffs`) OpenClaw는 번들 플러그인을 직접 설치합니다. 동일한 이름의 npm 패키지를 설치하려면 명시적인 범위 스펙을 사용하세요 (예: `@scope/diffs`).

지원되는 아카이브: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Claude 마켓플레이스 설치도 지원됩니다.

ClawHub 설치는 명시적인 `clawhub:&lt;package&gt;` 로케이터를 사용합니다:

```bash
openclaw plugins install clawhub:openclaw-codex-app-server
openclaw plugins install clawhub:openclaw-codex-app-server@1.2.3
```

OpenClaw는 이제 베어 npm 안전 플러그인 스펙에 대해서도 ClawHub를 선호합니다. ClawHub에 해당 패키지나 버전이 없는 경우에만 npm으로 폴백합니다:

```bash
openclaw plugins install openclaw-codex-app-server
```

OpenClaw는 ClawHub에서 패키지 아카이브를 다운로드하고, 광고된 플러그인 API / 최소 게이트웨이 호환성을 확인한 후 일반 아카이브 경로를 통해 설치합니다. 기록된 설치는 이후 업데이트를 위해 ClawHub 소스 메타데이터를 유지합니다.

마켓플레이스 이름이 `~/.claude/plugins/known_marketplaces.json`의 Claude 로컬 레지스트리 캐시에 있을 때 `plugin@marketplace` 단축키를 사용하세요:

```bash
openclaw plugins marketplace list &lt;marketplace-name&gt;
openclaw plugins install &lt;plugin-name&gt;@&lt;marketplace-name&gt;
```

마켓플레이스 소스를 명시적으로 전달하려면 `--marketplace`를 사용하세요:

```bash
openclaw plugins install &lt;plugin-name&gt; --marketplace &lt;marketplace-name&gt;
openclaw plugins install &lt;plugin-name&gt; --marketplace &lt;owner/repo&gt;
openclaw plugins install &lt;plugin-name&gt; --marketplace https://github.com/&lt;owner&gt;/&lt;repo&gt;
openclaw plugins install &lt;plugin-name&gt; --marketplace ./my-marketplace
```

마켓플레이스 소스는 다음이 될 수 있습니다:

- `~/.claude/plugins/known_marketplaces.json`의 Claude 알려진 마켓플레이스 이름
- 로컬 마켓플레이스 루트 또는 `marketplace.json` 경로
- `owner/repo` 같은 GitHub 리포지토리 단축키
- `https://github.com/owner/repo` 같은 GitHub 리포지토리 URL
- git URL

GitHub 또는 git에서 로드된 원격 마켓플레이스의 경우 플러그인 항목은 복제된 마켓플레이스 리포지토리 내에 있어야 합니다. OpenClaw는 해당 리포지토리에서 상대 경로 소스를 허용하고 원격 매니페스트에서 HTTP(S), 절대 경로, git, GitHub 및 기타 비경로 플러그인 소스를 거부합니다.

로컬 경로 및 아카이브의 경우 OpenClaw는 자동 감지합니다:

- 네이티브 OpenClaw 플러그인 (`openclaw.plugin.json`)
- Codex 호환 번들 (`.codex-plugin/plugin.json`)
- Claude 호환 번들 (`.claude-plugin/plugin.json` 또는 기본 Claude 컴포넌트 레이아웃)
- Cursor 호환 번들 (`.cursor-plugin/plugin.json`)

호환 번들은 일반 확장 루트에 설치되고 동일한 목록/정보/활성화/비활성화 흐름에 참여합니다. 현재 번들 스킬, Claude 명령 스킬, Claude `settings.json` 기본값, Claude `.lsp.json` / 매니페스트 선언 `lspServers` 기본값, Cursor 명령 스킬, 호환 Codex 훅 디렉터리가 지원됩니다; 감지된 다른 번들 기능은 진단/정보에 표시되지만 아직 런타임 실행에 연결되지 않습니다.

### 목록

```bash
openclaw plugins list
openclaw plugins list --enabled
openclaw plugins list --verbose
openclaw plugins list --json
```

로드된 플러그인만 표시하려면 `--enabled`를 사용하세요. 테이블 보기에서 소스/출처/버전/활성화 메타데이터가 있는 플러그인별 상세 라인으로 전환하려면 `--verbose`를 사용하세요. 기계 판독 가능한 인벤토리와 레지스트리 진단을 위해 `--json`을 사용하세요.

로컬 디렉터리를 복사하지 않으려면 `--link`를 사용하세요 (`plugins.load.paths`에 추가됩니다):

```bash
openclaw plugins install -l ./my-plugin
```

링크된 설치는 복사본이 있는 관리되는 설치 대상 대신 소스 경로를 재사용하기 때문에 `--force`는 `--link`와 함께 지원되지 않습니다.

해결된 정확한 스펙 (`name@version`)을 `plugins.installs`에 저장하면서 기본 동작을 고정되지 않은 상태로 유지하려면 npm 설치에 `--pin`을 사용하세요.

### 제거

```bash
openclaw plugins uninstall &lt;id&gt;
openclaw plugins uninstall &lt;id&gt; --dry-run
openclaw plugins uninstall &lt;id&gt; --keep-files
```

`uninstall`은 `plugins.entries`, `plugins.installs`, 플러그인 허용 목록, 그리고 적용 가능한 경우 연결된 `plugins.load.paths` 항목에서 플러그인 레코드를 제거합니다. 활성 메모리 플러그인의 경우 메모리 슬롯이 `memory-core`로 재설정됩니다.

기본적으로 제거는 활성 상태 디렉터리 플러그인 루트 아래의 플러그인 설치 디렉터리도 제거합니다. 디스크에 파일을 유지하려면 `--keep-files`를 사용하세요.

`--keep-config`는 `--keep-files`의 더 이상 사용되지 않는 별칭으로 지원됩니다.

### 업데이트

```bash
openclaw plugins update &lt;id-or-npm-spec&gt;
openclaw plugins update --all
openclaw plugins update &lt;id-or-npm-spec&gt; --dry-run
openclaw plugins update @openclaw/voice-call@beta
openclaw plugins update openclaw-codex-app-server --dangerously-force-unsafe-install
```

업데이트는 `plugins.installs`의 추적된 설치와 `hooks.internal.installs`의 추적된 훅 팩 설치에 적용됩니다.

플러그인 id를 전달하면 OpenClaw는 해당 플러그인의 기록된 설치 스펙을 재사용합니다. 즉, `@beta` 같은 이전에 저장된 dist-tag와 정확한 고정된 버전은 이후 `update &lt;id&gt;` 실행에서 계속 사용됩니다.

npm 설치의 경우 dist-tag 또는 정확한 버전이 있는 명시적 npm 패키지 스펙도 전달할 수 있습니다. OpenClaw는 해당 패키지 이름을 추적된 플러그인 레코드로 다시 확인하고, 해당 설치된 플러그인을 업데이트하고, 이후 id 기반 업데이트를 위해 새 npm 스펙을 기록합니다.

저장된 무결성 해시가 존재하고 가져온 아티팩트 해시가 변경되면 OpenClaw는 경고를 출력하고 진행하기 전에 확인을 요청합니다. CI/비인터랙티브 실행에서 프롬프트를 우회하려면 전역 `--yes`를 사용하세요.

`--dangerously-force-unsafe-install`은 플러그인 업데이트 중 내장 위험 코드 스캔 오탐지를 위한 브레이크 글래스 재정의로 `plugins update`에서도 사용 가능합니다. 플러그인 `before_install` 정책 차단 또는 스캔 실패 차단을 우회하지 않으며, 플러그인 업데이트에만 적용됩니다 (훅 팩 업데이트는 아님).

### 검사

```bash
openclaw plugins inspect &lt;id&gt;
openclaw plugins inspect &lt;id&gt; --json
```

단일 플러그인에 대한 깊은 내부 검사. 신원, 로드 상태, 소스, 등록된 기능, 훅, 툴, 명령, 서비스, 게이트웨이 메서드, HTTP 경로, 정책 플래그, 진단, 설치 메타데이터, 번들 기능, 그리고 감지된 MCP 또는 LSP 서버 지원을 표시합니다.

각 플러그인은 런타임에 실제로 등록하는 내용에 따라 분류됩니다:

- **plain-capability** — 하나의 기능 유형 (예: 프로바이더 전용 플러그인)
- **hybrid-capability** — 여러 기능 유형 (예: 텍스트 + 음성 + 이미지)
- **hook-only** — 훅만, 기능이나 표면 없음
- **non-capability** — 툴/명령/서비스이지만 기능 없음

기능 모델에 대한 자세한 내용은 [플러그인 형태](/plugins/architecture#plugin-shapes)를 참조하세요.

`--json` 플래그는 스크립팅 및 감사에 적합한 기계 판독 가능한 보고서를 출력합니다.

`inspect --all`은 형태, 기능 종류, 호환성 공지, 번들 기능, 훅 요약 열이 있는 플릿 전체 테이블을 렌더링합니다.

`info`는 `inspect`의 별칭입니다.

### Doctor

```bash
openclaw plugins doctor
```

`doctor`는 플러그인 로드 오류, 매니페스트/검색 진단, 호환성 공지를 보고합니다. 모든 것이 깨끗하면 `No plugin issues detected.`를 출력합니다.

### 마켓플레이스

```bash
openclaw plugins marketplace list <source>
openclaw plugins marketplace list <source> --json
```

마켓플레이스 목록은 로컬 마켓플레이스 경로, `marketplace.json` 경로, `owner/repo` 같은 GitHub 단축키, GitHub 리포지토리 URL, 또는 git URL을 허용합니다. `--json`은 확인된 소스 레이블과 파싱된 마켓플레이스 매니페스트 및 플러그인 항목을 출력합니다.
