---
summary: "에이전트 워크스페이스: 위치, 레이아웃, 백업 전략"
read_when:
  - 에이전트 워크스페이스 또는 파일 레이아웃을 설명해야 할 때
  - 에이전트 워크스페이스를 백업하거나 마이그레이션하려는 경우
title: "에이전트 워크스페이스"
---

# 에이전트 워크스페이스

워크스페이스는 에이전트의 홈입니다. 파일 도구 및 워크스페이스 컨텍스트에 사용되는 유일한 작업 디렉터리입니다. 비공개로 유지하고 메모리로 취급하십시오.

이는 구성, 자격 증명, 세션을 저장하는 `~/.openclaw/`와는 별개입니다.

**중요:** 워크스페이스는 **기본 cwd**이지, 하드 샌드박스가 아닙니다. 도구는 워크스페이스에 대해 상대 경로를 확인하지만, 샌드박싱이 활성화되지 않은 경우 절대 경로로 호스트의 다른 위치에도 액세스할 수 있습니다. 격리가 필요한 경우 [`agents.defaults.sandbox`](/gateway/sandboxing) (및/또는 에이전트별 샌드박스 구성)를 사용하십시오. 샌드박싱이 활성화되고 `workspaceAccess`가 `"rw"`가 아닌 경우, 도구는 호스트 워크스페이스가 아닌 `~/.openclaw/sandboxes` 아래의 샌드박스 워크스페이스에서 작동합니다.

## 기본 위치

- 기본값: `~/.openclaw/workspace`
- `OPENCLAW_PROFILE`이 설정되어 있고 `"default"`가 아닌 경우, 기본값은 `~/.openclaw/workspace-<profile>`이 됩니다.
- `~/.openclaw/openclaw.json`에서 오버라이드합니다:

```json5
{
  agent: {
    workspace: "~/.openclaw/workspace",
  },
}
```

`openclaw onboard`, `openclaw configure`, 또는 `openclaw setup`은 워크스페이스를 생성하고 부트스트랩 파일이 없으면 시드합니다. 샌드박스 시드 복사는 일반 워크스페이스 내 파일만 허용합니다; 소스 워크스페이스 외부로 확인되는 심볼릭 링크/하드 링크 별칭은 무시됩니다.

이미 직접 워크스페이스 파일을 관리하는 경우, 부트스트랩 파일 생성을 비활성화할 수 있습니다:

```json5
{ agent: { skipBootstrap: true } }
```

## 추가 워크스페이스 폴더

이전 설치에서 `~/openclaw`가 생성되었을 수 있습니다. 한 번에 하나의 워크스페이스만 활성화되기 때문에 여러 워크스페이스 디렉터리를 유지하면 혼란스러운 인증 또는 상태 드리프트가 발생할 수 있습니다.

**권장 사항:** 단일 활성 워크스페이스를 유지하십시오. 추가 폴더를 더 이상 사용하지 않는 경우, 보관하거나 휴지통으로 이동하십시오 (예: `trash ~/openclaw`). 여러 워크스페이스를 의도적으로 유지하는 경우, `agents.defaults.workspace`가 활성 워크스페이스를 가리키는지 확인하십시오.

`openclaw doctor`는 추가 워크스페이스 디렉터리를 감지하면 경고를 표시합니다.

## 워크스페이스 파일 맵 (각 파일의 의미)

OpenClaw가 워크스페이스 내에서 기대하는 표준 파일들입니다:

- `AGENTS.md`
  - 에이전트를 위한 운영 지침과 메모리 사용 방법.
  - 모든 세션 시작 시 로드됩니다.
  - 규칙, 우선순위, "행동 방식" 세부사항을 넣기 좋은 위치입니다.

- `SOUL.md`
  - 페르소나, 어조, 경계.
  - 모든 세션에서 로드됩니다.
  - 가이드: [SOUL.md 개성 가이드](/concepts/soul)

- `USER.md`
  - 사용자가 누구인지 및 호칭 방법.
  - 모든 세션에서 로드됩니다.

- `IDENTITY.md`
  - 에이전트의 이름, 분위기, 이모지.
  - 부트스트랩 의식 중에 생성/업데이트됩니다.

- `TOOLS.md`
  - 로컬 도구 및 규칙에 대한 메모.
  - 도구 가용성을 제어하지 않습니다; 지침일 뿐입니다.

- `HEARTBEAT.md`
  - 하트비트 실행을 위한 선택적 간단 체크리스트.
  - 토큰 소모를 피하기 위해 짧게 유지하십시오.

- `BOOT.md`
  - 내부 후크가 활성화된 경우 게이트웨이 재시작 시 실행되는 선택적 시작 체크리스트.
  - 짧게 유지하십시오; 아웃바운드 전송에는 메시지 도구를 사용하십시오.

- `BOOTSTRAP.md`
  - 최초 실행 의식.
  - 새 워크스페이스에만 생성됩니다.
  - 의식 완료 후 삭제하십시오.

- `memory/YYYY-MM-DD.md`
  - 일별 메모리 로그 (하루에 파일 하나).
  - 세션 시작 시 오늘과 어제 파일을 읽는 것이 권장됩니다.

- `MEMORY.md` (선택적)
  - 큐레이션된 장기 메모리.
  - 주 개인 세션에서만 로드하십시오 (공유/그룹 컨텍스트 제외).

워크플로우 및 자동 메모리 플러시는 [메모리](/concepts/memory)를 참조하십시오.

- `skills/` (선택적)
  - 워크스페이스별 스킬.
  - 해당 워크스페이스에서 가장 높은 우선순위의 스킬 위치.
  - 이름 충돌 시 프로젝트 에이전트 스킬, 개인 에이전트 스킬, 관리형 스킬, 번들 스킬, 및 `skills.load.extraDirs`보다 우선합니다.

- `canvas/` (선택적)
  - 노드 디스플레이용 Canvas UI 파일 (예: `canvas/index.html`).

부트스트랩 파일이 없으면 OpenClaw는 세션에 "파일 누락" 마커를 주입하고 계속 진행합니다. 대용량 부트스트랩 파일은 주입 시 잘립니다; `agents.defaults.bootstrapMaxChars` (기본값: 20000) 및 `agents.defaults.bootstrapTotalMaxChars` (기본값: 150000)으로 한도를 조정하십시오. `openclaw setup`은 기존 파일을 덮어쓰지 않고 누락된 기본값을 재생성할 수 있습니다.

## 워크스페이스에 없는 것

다음은 `~/.openclaw/` 아래에 있으며 워크스페이스 저장소에 커밋되어서는 안 됩니다:

- `~/.openclaw/openclaw.json` (구성)
- `~/.openclaw/agents/<agentId>/agent/auth-profiles.json` (모델 인증 프로파일: OAuth + API 키)
- `~/.openclaw/credentials/` (채널/프로바이더 상태 및 레거시 OAuth 가져오기 데이터)
- `~/.openclaw/agents/<agentId>/sessions/` (세션 트랜스크립트 + 메타데이터)
- `~/.openclaw/skills/` (관리형 스킬)

세션이나 구성을 마이그레이션해야 하는 경우, 별도로 복사하고 버전 관리에서 제외하십시오.

## Git 백업 (권장, 비공개)

워크스페이스를 개인 메모리로 취급하십시오. **비공개** git 저장소에 넣어 백업하고 복구 가능하게 유지하십시오.

게이트웨이가 실행되는 머신에서 다음 단계를 실행하십시오 (워크스페이스가 있는 위치).

### 1) 저장소 초기화

git이 설치되어 있으면, 새 워크스페이스는 자동으로 초기화됩니다. 이 워크스페이스가 아직 저장소가 아닌 경우 다음을 실행하십시오:

```bash
cd ~/.openclaw/workspace
git init
git add AGENTS.md SOUL.md TOOLS.md IDENTITY.md USER.md HEARTBEAT.md memory/
git commit -m "Add agent workspace"
```

### 2) 비공개 원격 추가 (초보자 친화적 옵션)

옵션 A: GitHub 웹 UI

1. GitHub에서 새 **비공개** 저장소를 생성합니다.
2. README로 초기화하지 마십시오 (병합 충돌 방지).
3. HTTPS 원격 URL을 복사합니다.
4. 원격을 추가하고 푸시합니다:

```bash
git branch -M main
git remote add origin <https-url>
git push -u origin main
```

옵션 B: GitHub CLI (`gh`)

```bash
gh auth login
gh repo create openclaw-workspace --private --source . --remote origin --push
```

옵션 C: GitLab 웹 UI

1. GitLab에서 새 **비공개** 저장소를 생성합니다.
2. README로 초기화하지 마십시오 (병합 충돌 방지).
3. HTTPS 원격 URL을 복사합니다.
4. 원격을 추가하고 푸시합니다:

```bash
git branch -M main
git remote add origin <https-url>
git push -u origin main
```

### 3) 지속적인 업데이트

```bash
git status
git add .
git commit -m "Update memory"
git push
```

## 시크릿 커밋 금지

비공개 저장소라도 워크스페이스에 시크릿 저장을 피하십시오:

- API 키, OAuth 토큰, 비밀번호, 또는 개인 자격 증명.
- `~/.openclaw/` 아래의 모든 것.
- 채팅의 원본 덤프나 민감한 첨부파일.

민감한 참조를 저장해야 하는 경우, 플레이스홀더를 사용하고 실제 시크릿은 다른 곳 (비밀번호 관리자, 환경 변수, 또는 `~/.openclaw/`)에 보관하십시오.

제안된 `.gitignore` 스타터:

```gitignore
.DS_Store
.env
**/*.key
**/*.pem
**/secrets*
```

## 워크스페이스를 새 머신으로 이전

1. 원하는 경로 (기본값 `~/.openclaw/workspace`)에 저장소를 클론합니다.
2. `~/.openclaw/openclaw.json`의 `agents.defaults.workspace`를 해당 경로로 설정합니다.
3. `openclaw setup --workspace <path>`를 실행하여 누락된 파일을 시드합니다.
4. 세션이 필요한 경우, 이전 머신에서 `~/.openclaw/agents/<agentId>/sessions/`를 별도로 복사합니다.

## 고급 참고사항

- 멀티 에이전트 라우팅은 에이전트별로 다른 워크스페이스를 사용할 수 있습니다. 라우팅 구성은 [채널 라우팅](/channels/channel-routing)을 참조하십시오.
- `agents.defaults.sandbox`가 활성화된 경우, 비메인 세션은 `agents.defaults.sandbox.workspaceRoot` 아래의 세션별 샌드박스 워크스페이스를 사용할 수 있습니다.

## 관련 항목

- [스탠딩 오더](/automation/standing-orders) — 워크스페이스 파일의 영구 지침
- [하트비트](/gateway/heartbeat) — HEARTBEAT.md 워크스페이스 파일
- [세션](/concepts/session) — 세션 저장 경로
- [샌드박싱](/gateway/sandboxing) — 샌드박스 환경에서의 워크스페이스 액세스
