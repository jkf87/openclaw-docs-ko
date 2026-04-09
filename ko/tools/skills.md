---
summary: "스킬: 관리 vs 워크스페이스, 게이팅 규칙, 설정/환경 변수 연결"
read_when:
  - Adding or modifying skills
  - Changing skill gating or load rules
title: "스킬"
---

# 스킬 (OpenClaw)

OpenClaw는 **[AgentSkills](https://agentskills.io) 호환** 스킬 폴더를 사용하여 에이전트에게 도구 사용 방법을 가르칩니다. 각 스킬은 YAML 프론트매터와 지침이 포함된 `SKILL.md`가 있는 디렉토리입니다. OpenClaw는 **번들된 스킬**과 선택적 로컬 재정의를 로드하고 환경, 설정, 바이너리 유무에 따라 로드 시간에 필터링합니다.

## 위치 및 우선순위

OpenClaw는 다음 소스에서 스킬을 로드합니다:

1. **추가 스킬 폴더**: `skills.load.extraDirs`로 구성됨
2. **번들된 스킬**: 설치와 함께 제공됨 (npm 패키지 또는 OpenClaw.app)
3. **관리/로컬 스킬**: `~/.openclaw/skills`
4. **개인 에이전트 스킬**: `~/.agents/skills`
5. **프로젝트 에이전트 스킬**: `<workspace>/.agents/skills`
6. **워크스페이스 스킬**: `<workspace>/skills`

스킬 이름이 충돌하면 우선순위는:

`<workspace>/skills` (최고) → `<workspace>/.agents/skills` → `~/.agents/skills` → `~/.openclaw/skills` → 번들된 스킬 → `skills.load.extraDirs` (최저)

## 에이전트별 vs 공유 스킬

**멀티 에이전트** 설정에서 각 에이전트는 자체 워크스페이스를 가집니다. 즉:

- **에이전트별 스킬**은 해당 에이전트에만 적용되는 `<workspace>/skills`에 있습니다.
- **프로젝트 에이전트 스킬**은 `<workspace>/.agents/skills`에 있으며 일반 워크스페이스 `skills/` 폴더 앞에 해당 워크스페이스에 적용됩니다.
- **개인 에이전트 스킬**은 `~/.agents/skills`에 있으며 해당 머신의 여러 워크스페이스에 적용됩니다.
- **공유 스킬**은 `~/.openclaw/skills` (관리/로컬)에 있으며 동일한 머신의 **모든 에이전트**에게 표시됩니다.
- **공유 폴더**는 여러 에이전트가 사용하는 공통 스킬 팩을 원하는 경우 `skills.load.extraDirs` (가장 낮은 우선순위)를 통해 추가할 수도 있습니다.

동일한 스킬 이름이 두 개 이상의 위치에 있으면 일반적인 우선순위가 적용됩니다: 워크스페이스가 우선, 그런 다음 프로젝트 에이전트 스킬, 그런 다음 개인 에이전트 스킬, 그런 다음 관리/로컬, 그런 다음 번들됨, 그런 다음 추가 디렉토리.

## 에이전트 스킬 허용 목록

스킬 **위치**와 스킬 **가시성**은 별도의 제어입니다.

- 위치/우선순위는 같은 이름의 스킬 중 어떤 복사본이 우선하는지 결정합니다.
- 에이전트 허용 목록은 에이전트가 실제로 사용할 수 있는 스킬을 결정합니다.

공유 기본값에 `agents.defaults.skills`를 사용하고 `agents.list[].skills`로 에이전트별로 재정의하십시오:

```json5
{
  agents: {
    defaults: {
      skills: ["github", "weather"],
    },
    list: [
      { id: "writer" }, // github, weather 상속
      { id: "docs", skills: ["docs-search"] }, // 기본값 대체
      { id: "locked-down", skills: [] }, // 스킬 없음
    ],
  },
}
```

규칙:

- 기본적으로 스킬을 제한 없이 유지하려면 `agents.defaults.skills`를 생략하십시오.
- `agents.defaults.skills`를 상속하려면 `agents.list[].skills`를 생략하십시오.
- 스킬 없음에는 `agents.list[].skills: []`를 설정하십시오.
- 비어 있지 않은 `agents.list[].skills` 목록은 해당 에이전트의 최종 세트입니다. 기본값과 병합되지 않습니다.

OpenClaw는 프롬프트 빌드, 스킬 슬래시 명령 검색, 샌드박스 동기화, 스킬 스냅샷에 걸쳐 유효한 에이전트 스킬 세트를 적용합니다.

## 플러그인 + 스킬

플러그인은 `openclaw.plugin.json`에 `skills` 디렉토리를 나열하여 자체 스킬을 제공할 수 있습니다 (플러그인 루트에 상대적인 경로). 플러그인 스킬은 플러그인이 활성화될 때 로드됩니다. 현재 이 디렉토리는 `skills.load.extraDirs`와 동일한 낮은 우선순위 경로에 병합되므로 같은 이름의 번들, 관리, 에이전트, 워크스페이스 스킬이 이를 재정의합니다.
플러그인의 설정 항목에 `metadata.openclaw.requires.config`를 통해 이를 게이트할 수 있습니다. 검색/설정은 [플러그인](/tools/plugin)을, 스킬이 가르치는 도구 표면은 [도구](/tools)를 참조하십시오.

## ClawHub (설치 + 동기화)

ClawHub는 OpenClaw의 공개 스킬 레지스트리입니다. [https://clawhub.ai](https://clawhub.ai)에서 탐색하십시오. 네이티브 `openclaw skills` 명령을 사용하여 스킬을 검색/설치/업데이트하거나 게시/동기화 워크플로우가 필요한 경우 별도의 `clawhub` CLI를 사용하십시오.
전체 가이드: [ClawHub](/tools/clawhub).

일반적인 흐름:

- 워크스페이스에 스킬 설치:
  - `openclaw skills install <skill-slug>`
- 설치된 모든 스킬 업데이트:
  - `openclaw skills update --all`
- 동기화 (스캔 + 업데이트 게시):
  - `clawhub sync --all`

네이티브 `openclaw skills install`은 활성 워크스페이스 `skills/` 디렉토리에 설치합니다. 별도의 `clawhub` CLI도 현재 작업 디렉토리 아래의 `./skills`에 설치합니다 (또는 구성된 OpenClaw 워크스페이스로 폴백). OpenClaw는 다음 세션에서 해당 것을 `<workspace>/skills`로 선택합니다.

## 보안 참고 사항

- 서드파티 스킬을 **신뢰할 수 없는 코드**로 취급하십시오. 활성화하기 전에 읽으십시오.
- 신뢰할 수 없는 입력 및 위험한 도구에는 샌드박스 실행을 선호하십시오. [샌드박싱](/gateway/sandboxing)을 참조하십시오.
- 워크스페이스 및 추가 디렉토리 스킬 검색은 구성된 루트 내에 남아 있는 스킬 루트와 `SKILL.md` 파일만 허용합니다.
- 게이트웨이 기반 스킬 종속성 설치 (`skills.install`, 온보딩, 스킬 설정 UI)는 설치 프로그램 메타데이터를 실행하기 전에 내장된 위험 코드 스캐너를 실행합니다. `critical` 결과는 호출자가 위험 재정의를 명시적으로 설정하지 않는 한 기본적으로 차단됩니다. 의심스러운 결과는 여전히 경고만 합니다.
- `openclaw skills install <slug>`는 다릅니다: ClawHub 스킬 폴더를 워크스페이스에 다운로드하며 위의 설치 프로그램 메타데이터 경로를 사용하지 않습니다.
- `skills.entries.*.env` 및 `skills.entries.*.apiKey`는 해당 에이전트 실행에 대해 비밀을 **호스트** 프로세스에 주입합니다 (샌드박스가 아님). 프롬프트와 로그에서 비밀을 제외하십시오.
- 더 광범위한 위협 모델 및 체크리스트는 [보안](/gateway/security)을 참조하십시오.

## 형식 (AgentSkills + Pi 호환)

`SKILL.md`는 적어도 다음을 포함해야 합니다:

```markdown
---
name: image-lab
description: Generate or edit images via a provider-backed image workflow
---
```

참고 사항:

- 레이아웃/의도에 대해 AgentSkills 사양을 따릅니다.
- 임베디드 에이전트가 사용하는 파서는 **단일 줄** 프론트매터 키만 지원합니다.
- `metadata`는 **단일 줄 JSON 객체**여야 합니다.
- 스킬 폴더 경로를 참조하려면 지침에서 `{baseDir}`를 사용하십시오.
- 선택적 프론트매터 키:
  - `homepage` — macOS 스킬 UI에서 "Website"로 표시되는 URL (`metadata.openclaw.homepage`를 통해서도 지원됨).
  - `user-invocable` — `true|false` (기본값: `true`). `true`이면 스킬이 사용자 슬래시 명령으로 노출됩니다.
  - `disable-model-invocation` — `true|false` (기본값: `false`). `true`이면 스킬이 모델 프롬프트에서 제외됩니다 (사용자 호출을 통해 여전히 사용 가능).
  - `command-dispatch` — `tool` (선택 사항). `tool`로 설정하면 슬래시 명령이 모델을 우회하고 도구에 직접 디스패치됩니다.
  - `command-tool` — `command-dispatch: tool`이 설정된 경우 호출할 도구 이름.
  - `command-arg-mode` — `raw` (기본값). 도구 디스패치의 경우 원시 인수 문자열을 도구로 전달합니다 (코어 파싱 없음).

    도구는 다음 파라미터로 호출됩니다:
    `{ command: "<raw args>", commandName: "<slash command>", skillName: "<skill name>" }`.

## 게이팅 (로드 시간 필터)

OpenClaw는 `metadata` (단일 줄 JSON)를 사용하여 **로드 시간에 스킬을 필터링합니다**:

```markdown
---
name: image-lab
description: Generate or edit images via a provider-backed image workflow
metadata:
  {
    "openclaw":
      {
        "requires": { "bins": ["uv"], "env": ["GEMINI_API_KEY"], "config": ["browser.enabled"] },
        "primaryEnv": "GEMINI_API_KEY",
      },
  }
---
```

`metadata.openclaw` 아래의 필드:

- `always: true` — 항상 스킬을 포함합니다 (다른 게이트를 건너뜀).
- `emoji` — macOS 스킬 UI에서 사용하는 선택적 이모지.
- `homepage` — macOS 스킬 UI에서 "Website"로 표시되는 선택적 URL.
- `os` — 선택적 플랫폼 목록 (`darwin`, `linux`, `win32`). 설정된 경우 스킬은 해당 OS에서만 적합합니다.
- `requires.bins` — 목록; 각각이 `PATH`에 있어야 합니다.
- `requires.anyBins` — 목록; 적어도 하나가 `PATH`에 있어야 합니다.
- `requires.env` — 목록; 환경 변수가 있어야 하거나 설정에서 제공되어야 합니다.
- `requires.config` — truthy해야 하는 `openclaw.json` 경로 목록.
- `primaryEnv` — `skills.entries.<name>.apiKey`와 연결된 환경 변수 이름.
- `install` — macOS 스킬 UI에서 사용하는 선택적 설치 프로그램 사양 배열 (brew/node/go/uv/download).

샌드박싱에 대한 참고 사항:

- `requires.bins`는 스킬 로드 시간에 **호스트**에서 확인됩니다.
- 에이전트가 샌드박스된 경우 바이너리는 **컨테이너 내부**에도 있어야 합니다.
  `agents.defaults.sandbox.docker.setupCommand` (또는 사용자 지정 이미지)를 통해 설치하십시오.
  `setupCommand`는 컨테이너가 생성된 후 한 번 실행됩니다.
  패키지 설치는 네트워크 이그레스, 쓰기 가능한 루트 파일 시스템, 샌드박스의 루트 사용자도 필요합니다.
  예시: `summarize` 스킬 (`skills/summarize/SKILL.md`)은 거기에서 실행하려면 샌드박스 컨테이너에 `summarize` CLI가 필요합니다.

설치 프로그램 예시:

```markdown
---
name: gemini
description: Use Gemini CLI for coding assistance and Google search lookups.
metadata:
  {
    "openclaw":
      {
        "emoji": "♊️",
        "requires": { "bins": ["gemini"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "gemini-cli",
              "bins": ["gemini"],
              "label": "Install Gemini CLI (brew)",
            },
          ],
      },
  }
---
```

참고 사항:

- 여러 설치 프로그램이 나열되면 게이트웨이는 **단일** 선호 옵션을 선택합니다 (사용 가능한 경우 brew, 그렇지 않으면 node).
- 모든 설치 프로그램이 `download`인 경우 OpenClaw는 사용 가능한 아티팩트를 볼 수 있도록 각 항목을 나열합니다.
- 설치 프로그램 사양에는 플랫폼별 옵션을 필터링하기 위한 `os: ["darwin"|"linux"|"win32"]`가 포함될 수 있습니다.
- 노드 설치는 `openclaw.json`의 `skills.install.nodeManager`를 따릅니다 (기본값: npm; 옵션: npm/pnpm/yarn/bun).
  이것은 **스킬 설치**에만 영향을 미칩니다. 게이트웨이 런타임은 여전히 Node이어야 합니다
  (Bun은 WhatsApp/Telegram에 권장하지 않습니다).
- 게이트웨이 기반 설치 프로그램 선택은 설정 기반이지 노드 전용이 아닙니다: 설치 사양이 종류를 혼합할 때 OpenClaw는 `skills.install.preferBrew`가 활성화되고 `brew`가 있으면 Homebrew를 선호하고, 그런 다음 `uv`, 그런 다음 구성된 노드 관리자, 그런 다음 `go` 또는 `download`와 같은 다른 폴백을 선호합니다.
- 모든 설치 사양이 `download`이면 OpenClaw는 하나의 선호 설치 프로그램으로 축소하는 대신 모든 다운로드 옵션을 표시합니다.
- Go 설치: `go`가 없고 `brew`를 사용할 수 있는 경우 게이트웨이는 먼저 Homebrew를 통해 Go를 설치하고 가능한 경우 `GOBIN`을 Homebrew의 `bin`으로 설정합니다.
- 다운로드 설치: `url` (필수), `archive` (`tar.gz` | `tar.bz2` | `zip`), `extract` (기본값: 아카이브 감지 시 자동), `stripComponents`, `targetDir` (기본값: `~/.openclaw/tools/<skillKey>`).

`metadata.openclaw`가 없으면 스킬은 항상 적합합니다 (설정에서 비활성화되거나 번들된 스킬에 대해 `skills.allowBundled`로 차단되지 않는 한).

## 설정 재정의 (`~/.openclaw/openclaw.json`)

번들/관리 스킬은 토글하고 환경 변수를 제공할 수 있습니다:

```json5
{
  skills: {
    entries: {
      "image-lab": {
        enabled: true,
        apiKey: { source: "env", provider: "default", id: "GEMINI_API_KEY" }, // 또는 평문 문자열
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE",
        },
        config: {
          endpoint: "https://example.invalid",
          model: "nano-pro",
        },
      },
      peekaboo: { enabled: true },
      sag: { enabled: false },
    },
  },
}
```

참고: 스킬 이름에 하이픈이 포함된 경우 키를 인용하십시오 (JSON5는 인용된 키를 허용합니다).

OpenClaw 자체에서 재고 이미지 생성/편집을 원한다면 번들된 스킬 대신 `agents.defaults.imageGenerationModel`과 함께 코어 `image_generate` 도구를 사용하십시오. 여기의 스킬 예시는 사용자 지정 또는 서드파티 워크플로우를 위한 것입니다.

네이티브 이미지 분석의 경우 `agents.defaults.imageModel`과 함께 `image` 도구를 사용하십시오.
네이티브 이미지 생성/편집의 경우 `agents.defaults.imageGenerationModel`과 함께 `image_generate`를 사용하십시오. `openai/*`, `google/*`, `fal/*`, 또는 다른 프로바이더별 이미지 모델을 선택하는 경우 해당 프로바이더의 인증/API 키도 추가하십시오.

설정 키는 기본적으로 **스킬 이름**과 일치합니다. 스킬이 `metadata.openclaw.skillKey`를 정의하는 경우 `skills.entries` 아래에서 해당 키를 사용하십시오.

규칙:

- `enabled: false`는 번들/설치된 스킬이더라도 비활성화합니다.
- `env`: 변수가 프로세스에 아직 설정되지 않은 경우에만 **주입됩니다**.
- `apiKey`: `metadata.openclaw.primaryEnv`를 선언하는 스킬에 대한 편의. 평문 문자열 또는 SecretRef 객체 (`{ source, provider, id }`)를 지원합니다.
- `config`: 사용자 지정 스킬별 필드를 위한 선택적 컨테이너. 사용자 지정 키는 여기에 있어야 합니다.
- `allowBundled`: **번들된** 스킬에만 적용되는 선택적 허용 목록. 설정된 경우 목록의 번들된 스킬만 적합합니다 (관리/워크스페이스 스킬에는 영향 없음).

## 환경 주입 (에이전트 실행별)

에이전트 실행이 시작될 때 OpenClaw는:

1. 스킬 메타데이터를 읽습니다.
2. `skills.entries.<key>.env` 또는 `skills.entries.<key>.apiKey`를 `process.env`에 적용합니다.
3. **적합한** 스킬로 시스템 프롬프트를 빌드합니다.
4. 실행이 끝난 후 원래 환경을 복원합니다.

이것은 전역 쉘 환경이 아닌 **에이전트 실행으로 범위가 지정됩니다**.

## 세션 스냅샷 (성능)

OpenClaw는 **세션이 시작될 때** 적합한 스킬을 스냅샷하고 동일한 세션의 후속 턴에 해당 목록을 재사용합니다. 스킬 또는 설정 변경 사항은 다음 새 세션에서 적용됩니다.

스킬은 스킬 감시자가 활성화되거나 새 적합한 원격 노드가 나타날 때 세션 중간에도 새로 고침될 수 있습니다 (아래 참조). 이것을 **핫 리로드**로 생각하십시오: 새로 고침된 목록은 다음 에이전트 턴에서 선택됩니다.

해당 세션에 대한 유효한 에이전트 스킬 허용 목록이 변경되면 OpenClaw는 표시되는 스킬이 현재 에이전트와 일치하도록 스냅샷을 새로 고침합니다.

## 원격 macOS 노드 (Linux 게이트웨이)

게이트웨이가 Linux에서 실행 중이지만 **macOS 노드**가 **`system.run`이 허용된** 상태로 연결되어 있는 경우 (Exec 승인 보안이 `deny`로 설정되지 않음), OpenClaw는 필요한 바이너리가 해당 노드에 있을 때 macOS 전용 스킬을 적합한 것으로 취급할 수 있습니다. 에이전트는 `host=node`와 함께 `exec` 도구를 통해 이러한 스킬을 실행해야 합니다.

이것은 노드가 명령 지원을 보고하고 `system.run`을 통한 바이너리 프로브에 의존합니다. macOS 노드가 나중에 오프라인이 되면 스킬은 표시된 상태로 유지됩니다. 노드가 다시 연결될 때까지 호출이 실패할 수 있습니다.

## 스킬 감시자 (자동 새로 고침)

기본적으로 OpenClaw는 스킬 폴더를 감시하고 `SKILL.md` 파일이 변경될 때 스킬 스냅샷을 업데이트합니다. `skills.load` 아래에서 구성하십시오:

```json5
{
  skills: {
    load: {
      watch: true,
      watchDebounceMs: 250,
    },
  },
}
```

## 토큰 영향 (스킬 목록)

스킬이 적합한 경우 OpenClaw는 사용 가능한 스킬의 컴팩트 XML 목록을 시스템 프롬프트에 주입합니다 (`pi-coding-agent`의 `formatSkillsForPrompt`를 통해). 비용은 결정론적입니다:

- **기본 오버헤드 (≥1 스킬일 때만):** 195자.
- **스킬별:** 97자 + XML 이스케이핑된 `<name>`, `<description>`, `<location>` 값의 길이.

공식 (문자):

```
total = 195 + Σ (97 + len(name_escaped) + len(description_escaped) + len(location_escaped))
```

참고 사항:

- XML 이스케이핑은 `& < > " '`를 엔티티 (`&amp;`, `&lt;` 등)로 확장하여 길이를 증가시킵니다.
- 토큰 수는 모델 토크나이저에 따라 다릅니다. 대략적인 OpenAI 스타일 추정치는 ~4자/토큰이므로 **97자 ≈ 24 토큰** (실제 필드 길이 제외).

## 관리 스킬 수명 주기

OpenClaw는 설치의 일부로 기본 스킬 세트를 **번들된 스킬**로 제공합니다 (npm 패키지 또는 OpenClaw.app). `~/.openclaw/skills`는 로컬 재정의를 위해 존재합니다 (예: 번들된 복사본을 변경하지 않고 스킬을 고정/패치). 워크스페이스 스킬은 사용자 소유이며 이름 충돌 시 둘 다보다 우선합니다.

## 설정 레퍼런스

전체 설정 스키마는 [스킬 설정](/tools/skills-config)을 참조하십시오.

## 더 많은 스킬을 찾고 있나요?

[https://clawhub.ai](https://clawhub.ai)를 탐색하십시오.

---

## 관련 항목

- [스킬 만들기](/tools/creating-skills) — 사용자 지정 스킬 만들기
- [스킬 설정](/tools/skills-config) — 스킬 설정 레퍼런스
- [슬래시 명령](/tools/slash-commands) — 모든 사용 가능한 슬래시 명령
- [플러그인](/tools/plugin) — 플러그인 시스템 개요
