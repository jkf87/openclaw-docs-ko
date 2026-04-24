---
summary: "재사용 가능한 절차를 workspace skill로 캡처하는 실험적 기능. 리뷰, 승인, 격리(quarantine), 핫 skill 리프레시를 지원합니다"
title: "Skill workshop 플러그인"
read_when:
  - 수정 사항이나 재사용 가능한 절차를 workspace skill로 전환하길 원할 때
  - 절차적 skill 메모리를 구성할 때
  - skill_workshop 도구 동작을 디버깅할 때
  - 자동 skill 생성을 활성화할지 결정할 때
---

Skill Workshop은 **실험적** 기능입니다. 기본적으로 비활성화되어 있으며, 캡처
휴리스틱과 리뷰어 prompt는 릴리즈 간에 변경될 수 있고, 자동 쓰기는 pending 모드
출력을 먼저 검토한 후 신뢰할 수 있는 workspace에서만 사용해야 합니다.

Skill Workshop은 workspace skill을 위한 절차적 메모리입니다. 에이전트가 재사용
가능한 workflow, 사용자 수정 사항, 힘들게 얻은 수정 방법, 반복되는 함정을 다음
위치의 `SKILL.md` 파일로 전환할 수 있게 해줍니다.

```text
<workspace>/skills/<skill-name>/SKILL.md
```

이는 장기 메모리와 다릅니다.

- **메모리**는 사실, 선호도, 엔티티, 과거 컨텍스트를 저장합니다.
- **Skill**은 에이전트가 향후 작업에서 따라야 할 재사용 가능한 절차를 저장합니다.
- **Skill Workshop**은 유용한 턴을 지속성 있는 workspace skill로 연결하는 다리이며,
  안전성 검사와 선택적 승인 단계를 포함합니다.

Skill Workshop은 에이전트가 다음과 같은 절차를 학습할 때 유용합니다.

- 외부에서 가져온 애니메이션 GIF 자산을 검증하는 방법
- 스크린샷 자산을 교체하고 치수를 확인하는 방법
- 저장소 특화 QA 시나리오를 실행하는 방법
- 반복되는 프로바이더 실패를 디버깅하는 방법
- 오래된 로컬 workflow 노트를 수정하는 방법

다음과 같은 용도로는 의도되지 않았습니다.

- "사용자는 파란색을 좋아한다" 같은 사실
- 광범위한 자전적 메모리
- 원시 전사(transcript) 아카이빙
- 비밀, 자격 증명, 숨겨진 prompt 텍스트
- 반복되지 않을 일회성 지시

## 기본 상태

번들 플러그인은 **실험적**이며, `plugins.entries.skill-workshop`에서 명시적으로
활성화하지 않는 한 **기본적으로 비활성화**되어 있습니다.

플러그인 매니페스트는 `enabledByDefault: true`를 설정하지 않습니다. 플러그인
구성 스키마 내부의 `enabled: true` 기본값은 플러그인 항목이 이미 선택되어 로드된
후에만 적용됩니다.

실험적이라는 의미는 다음과 같습니다.

- 플러그인은 opt-in 테스트와 도그푸딩에 충분할 만큼 지원됩니다
- 제안 저장소, 리뷰어 임계값, 캡처 휴리스틱이 진화할 수 있습니다
- pending 승인이 권장되는 시작 모드입니다
- 자동 적용은 공유 환경이나 적대적 입력이 많은 환경이 아니라, 신뢰할 수 있는
  개인/workspace 설정용입니다

## 활성화

최소한의 안전한 구성:

```json5
{
  plugins: {
    entries: {
      "skill-workshop": {
        enabled: true,
        config: {
          autoCapture: true,
          approvalPolicy: "pending",
          reviewMode: "hybrid",
        },
      },
    },
  },
}
```

이 구성에서는 다음이 적용됩니다.

- `skill_workshop` 도구를 사용할 수 있습니다
- 명시적인 재사용 가능한 수정 사항이 pending 제안으로 큐에 등록됩니다
- 임계값 기반 리뷰어 패스가 skill 업데이트를 제안할 수 있습니다
- pending 제안이 적용되기 전까지는 skill 파일이 기록되지 않습니다

자동 쓰기는 신뢰할 수 있는 workspace에서만 사용하십시오.

```json5
{
  plugins: {
    entries: {
      "skill-workshop": {
        enabled: true,
        config: {
          autoCapture: true,
          approvalPolicy: "auto",
          reviewMode: "hybrid",
        },
      },
    },
  },
}
```

`approvalPolicy: "auto"`도 동일한 스캐너와 격리(quarantine) 경로를 사용합니다.
치명적인 발견 사항이 있는 제안은 적용하지 않습니다.

## 구성

| 키                   | 기본값      | 범위 / 값                                   | 의미                                                                            |
| -------------------- | ----------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| `enabled`            | `true`      | boolean                                     | 플러그인 항목이 로드된 후 플러그인을 활성화합니다.                              |
| `autoCapture`        | `true`      | boolean                                     | 성공한 에이전트 턴 후 캡처/리뷰를 활성화합니다.                                 |
| `approvalPolicy`     | `"pending"` | `"pending"`, `"auto"`                       | 제안을 큐에 넣거나 안전한 제안을 자동으로 기록합니다.                           |
| `reviewMode`         | `"hybrid"`  | `"off"`, `"heuristic"`, `"llm"`, `"hybrid"` | 명시적 수정 캡처, LLM 리뷰어, 둘 다, 또는 둘 다 아님 중에서 선택합니다.         |
| `reviewInterval`     | `15`        | `1..200`                                    | 이 수만큼의 성공한 턴 이후 리뷰어를 실행합니다.                                 |
| `reviewMinToolCalls` | `8`         | `1..500`                                    | 관측된 도구 호출이 이 수에 도달한 후 리뷰어를 실행합니다.                       |
| `reviewTimeoutMs`    | `45000`     | `5000..180000`                              | 내장 리뷰어 실행의 타임아웃.                                                    |
| `maxPending`         | `50`        | `1..200`                                    | workspace당 유지할 최대 pending/격리된 제안 수.                                 |
| `maxSkillBytes`      | `40000`     | `1024..200000`                              | 생성된 skill/지원 파일의 최대 크기.                                             |

권장 프로파일:

```json5
// 보수적: 명시적 도구 사용만, 자동 캡처 없음.
{
  autoCapture: false,
  approvalPolicy: "pending",
  reviewMode: "off",
}
```

```json5
// 리뷰 우선: 자동으로 캡처하되 승인 필요.
{
  autoCapture: true,
  approvalPolicy: "pending",
  reviewMode: "hybrid",
}
```

```json5
// 신뢰된 자동화: 안전한 제안을 즉시 기록.
{
  autoCapture: true,
  approvalPolicy: "auto",
  reviewMode: "hybrid",
}
```

```json5
// 저비용: 리뷰어 LLM 호출 없이, 명시적 수정 문구만 사용.
{
  autoCapture: true,
  approvalPolicy: "pending",
  reviewMode: "heuristic",
}
```

## 캡처 경로

Skill Workshop은 세 가지 캡처 경로를 가지고 있습니다.

### 도구 제안

모델은 재사용 가능한 절차를 보거나 사용자가 skill을 저장/업데이트하도록 요청할
때 `skill_workshop`을 직접 호출할 수 있습니다.

이 경로가 가장 명시적이며 `autoCapture: false`에서도 작동합니다.

### 휴리스틱 캡처

`autoCapture`가 활성화되어 있고 `reviewMode`가 `heuristic` 또는 `hybrid`일 때,
플러그인은 성공한 턴에서 명시적인 사용자 수정 문구를 스캔합니다.

- `next time`
- `from now on`
- `remember to`
- `make sure to`
- `always ... use/check/verify/record/save/prefer`
- `prefer ... when/for/instead/use`
- `when asked`

휴리스틱은 가장 최근에 매칭된 사용자 지시로부터 제안을 생성합니다. 일반적인
workflow에 대해 skill 이름을 선택하기 위해 주제 힌트를 사용합니다.

- 애니메이션 GIF 작업 -> `animated-gif-workflow`
- 스크린샷이나 자산 작업 -> `screenshot-asset-workflow`
- QA 또는 시나리오 작업 -> `qa-scenario-workflow`
- GitHub PR 작업 -> `github-pr-workflow`
- 폴백 -> `learned-workflows`

휴리스틱 캡처는 의도적으로 좁게 설계되었습니다. 일반적인 전사 요약이 아니라
명확한 수정과 반복 가능한 프로세스 노트를 위한 것입니다.

### LLM 리뷰어

`autoCapture`가 활성화되어 있고 `reviewMode`가 `llm` 또는 `hybrid`일 때,
플러그인은 임계값에 도달한 후 작고 내장된 리뷰어를 실행합니다.

리뷰어는 다음을 받습니다.

- 최근 전사 텍스트, 마지막 12,000자로 제한
- 최대 12개의 기존 workspace skill
- 각 기존 skill에서 최대 2,000자
- JSON 전용 지시

리뷰어에는 도구가 없습니다.

- `disableTools: true`
- `toolsAllow: []`
- `disableMessageTool: true`

리뷰어는 `{ "action": "none" }` 또는 하나의 제안을 반환합니다. `action` 필드는
`create`, `append`, `replace` 중 하나입니다 — 관련된 skill이 이미 존재하는 경우
`append`/`replace`를 선호하고, 적합한 기존 skill이 없는 경우에만 `create`를
사용하십시오.

`create` 예시:

```json
{
  "action": "create",
  "skillName": "media-asset-qa",
  "title": "Media Asset QA",
  "reason": "Reusable animated media acceptance workflow",
  "description": "Validate externally sourced animated media before product use.",
  "body": "## Workflow\n\n- Verify true animation.\n- Record attribution.\n- Store a local approved copy.\n- Verify in product UI before final reply."
}
```

`append`는 `section` + `body`를 추가합니다. `replace`는 지정된 skill에서
`oldText`를 `newText`로 교체합니다.

## 제안 라이프사이클

생성된 모든 업데이트는 다음 필드를 가진 제안이 됩니다.

- `id`
- `createdAt`
- `updatedAt`
- `workspaceDir`
- 선택적 `agentId`
- 선택적 `sessionId`
- `skillName`
- `title`
- `reason`
- `source`: `tool`, `agent_end`, 또는 `reviewer`
- `status`
- `change`
- 선택적 `scanFindings`
- 선택적 `quarantineReason`

제안 상태:

- `pending` - 승인 대기 중
- `applied` - `<workspace>/skills`에 기록됨
- `rejected` - 운영자/모델이 거부함
- `quarantined` - 치명적인 스캐너 발견으로 차단됨

상태는 Gateway state 디렉토리 아래 workspace별로 저장됩니다.

```text
<stateDir>/skill-workshop/<workspace-hash>.json
```

pending 및 격리된 제안은 skill 이름과 변경 페이로드로 중복 제거됩니다. 저장소는
`maxPending`까지 가장 최신의 pending/격리된 제안을 유지합니다.

## 도구 레퍼런스

플러그인은 하나의 에이전트 도구를 등록합니다.

```text
skill_workshop
```

### `status`

활성 workspace의 상태별 제안 수를 셉니다.

```json
{ "action": "status" }
```

결과 형태:

```json
{
  "workspaceDir": "/path/to/workspace",
  "pending": 1,
  "quarantined": 0,
  "applied": 3,
  "rejected": 0
}
```

### `list_pending`

pending 제안을 나열합니다.

```json
{ "action": "list_pending" }
```

다른 상태를 나열하려면:

```json
{ "action": "list_pending", "status": "applied" }
```

유효한 `status` 값:

- `pending`
- `applied`
- `rejected`
- `quarantined`

### `list_quarantine`

격리된 제안을 나열합니다.

```json
{ "action": "list_quarantine" }
```

자동 캡처가 아무것도 하지 않는 것처럼 보이고 로그에 `skill-workshop: quarantined <skill>`이
언급될 때 사용하십시오.

### `inspect`

id로 제안을 가져옵니다.

```json
{
  "action": "inspect",
  "id": "proposal-id"
}
```

### `suggest`

제안을 생성합니다. `approvalPolicy: "pending"`(기본값)인 경우, 기록 대신 큐에 넣습니다.

```json
{
  "action": "suggest",
  "skillName": "animated-gif-workflow",
  "title": "Animated GIF Workflow",
  "reason": "User established reusable GIF validation rules.",
  "description": "Validate animated GIF assets before using them.",
  "body": "## Workflow\n\n- Verify the URL resolves to image/gif.\n- Confirm it has multiple frames.\n- Record attribution and license.\n- Avoid hotlinking when a local asset is needed."
}
```

<AccordionGroup>
  <Accordion title="안전한 쓰기 강제 (apply: true)">

```json
{
  "action": "suggest",
  "apply": true,
  "skillName": "animated-gif-workflow",
  "description": "Validate animated GIF assets before using them.",
  "body": "## Workflow\n\n- Verify true animation.\n- Record attribution."
}
```

  </Accordion>

  <Accordion title="auto 정책에서 pending 강제 (apply: false)">

```json
{
  "action": "suggest",
  "apply": false,
  "skillName": "screenshot-asset-workflow",
  "description": "Screenshot replacement workflow.",
  "body": "## Workflow\n\n- Verify dimensions.\n- Optimize the PNG.\n- Run the relevant gate."
}
```

  </Accordion>

  <Accordion title="지정된 섹션에 추가">

```json
{
  "action": "suggest",
  "skillName": "qa-scenario-workflow",
  "section": "Workflow",
  "description": "QA scenario workflow.",
  "body": "- For media QA, verify generated assets render and pass final assertions."
}
```

  </Accordion>

  <Accordion title="정확한 텍스트 교체">

```json
{
  "action": "suggest",
  "skillName": "github-pr-workflow",
  "oldText": "- Check the PR.",
  "newText": "- Check unresolved review threads, CI status, linked issues, and changed files before deciding."
}
```

  </Accordion>
</AccordionGroup>

### `apply`

pending 제안을 적용합니다.

```json
{
  "action": "apply",
  "id": "proposal-id"
}
```

`apply`는 격리된 제안을 거부합니다.

```text
quarantined proposal cannot be applied
```

### `reject`

제안을 rejected로 표시합니다.

```json
{
  "action": "reject",
  "id": "proposal-id"
}
```

### `write_support_file`

기존 또는 제안된 skill 디렉토리 내부에 지원 파일을 기록합니다.

허용되는 최상위 지원 디렉토리:

- `references/`
- `templates/`
- `scripts/`
- `assets/`

예시:

```json
{
  "action": "write_support_file",
  "skillName": "release-workflow",
  "relativePath": "references/checklist.md",
  "body": "# Release Checklist\n\n- Run release docs.\n- Verify changelog.\n"
}
```

지원 파일은 workspace 범위이며, 경로 검사를 거치고, `maxSkillBytes`에 의해 바이트
제한되며, 스캔되고, 원자적으로 기록됩니다.

## Skill 쓰기

Skill Workshop은 다음 위치에만 기록합니다.

```text
<workspace>/skills/<normalized-skill-name>/
```

Skill 이름은 정규화됩니다.

- 소문자로 변환
- `[a-z0-9_-]`가 아닌 연속 문자는 `-`가 됩니다
- 앞/뒤의 비영숫자 문자는 제거됩니다
- 최대 길이는 80자
- 최종 이름은 `[a-z0-9][a-z0-9_-]{1,79}`와 일치해야 합니다

`create`의 경우:

- skill이 존재하지 않으면, Skill Workshop은 새 `SKILL.md`를 기록합니다
- 이미 존재하면, Skill Workshop은 본문을 `## Workflow`에 추가합니다

`append`의 경우:

- skill이 존재하면, Skill Workshop은 요청된 섹션에 추가합니다
- 존재하지 않으면, Skill Workshop은 최소한의 skill을 만든 다음 추가합니다

`replace`의 경우:

- skill이 이미 존재해야 합니다
- `oldText`가 정확히 존재해야 합니다
- 첫 번째 정확한 일치만 교체됩니다

모든 쓰기는 원자적이며 메모리 내 skill 스냅샷을 즉시 리프레시하므로, 새롭거나
업데이트된 skill이 Gateway 재시작 없이 표시될 수 있습니다.

## 안전 모델

Skill Workshop은 생성된 `SKILL.md` 콘텐츠와 지원 파일에 대한 안전 스캐너를
가지고 있습니다.

치명적인 발견 사항은 제안을 격리합니다.

| 규칙 id                                | 차단되는 콘텐츠...                                                    |
| -------------------------------------- | --------------------------------------------------------------------- |
| `prompt-injection-ignore-instructions` | 에이전트에게 이전/상위 지시를 무시하도록 지시                         |
| `prompt-injection-system`              | 시스템 prompt, 개발자 메시지, 숨겨진 지시를 참조                      |
| `prompt-injection-tool`                | 도구 권한/승인 우회를 권장                                            |
| `shell-pipe-to-shell`                  | `curl`/`wget`을 `sh`, `bash`, `zsh`로 파이프하는 것을 포함            |
| `secret-exfiltration`                  | env/process env 데이터를 네트워크로 전송하려는 것처럼 보임            |

경고 수준 발견은 유지되지만 그 자체로 차단되지는 않습니다.

| 규칙 id              | 다음에 대해 경고...              |
| -------------------- | -------------------------------- |
| `destructive-delete` | 광범위한 `rm -rf` 스타일 명령    |
| `unsafe-permissions` | `chmod 777` 스타일 권한 사용     |

격리된 제안은:

- `scanFindings`를 유지합니다
- `quarantineReason`을 유지합니다
- `list_quarantine`에 나타납니다
- `apply`를 통해 적용할 수 없습니다

격리된 제안에서 복구하려면, 안전하지 않은 콘텐츠를 제거한 새 안전한 제안을
만드십시오. 저장소 JSON을 수동으로 편집하지 마십시오.

## Prompt 가이던스

활성화되면, Skill Workshop은 에이전트에게 지속적인 절차적 메모리를 위해
`skill_workshop`을 사용하도록 지시하는 짧은 prompt 섹션을 주입합니다.

가이던스는 다음을 강조합니다.

- 절차, 사실/선호도가 아님
- 사용자 수정
- 자명하지 않은 성공 절차
- 반복되는 함정
- append/replace를 통한 오래되거나/얕거나/잘못된 skill 수리
- 긴 도구 루프나 어려운 수정 후 재사용 가능한 절차 저장
- 짧고 명령적인 skill 텍스트
- 전사 덤프 없음

쓰기 모드 텍스트는 `approvalPolicy`에 따라 변경됩니다.

- pending 모드: 제안을 큐에 넣음. 명시적 승인 후에만 적용
- auto 모드: 명확히 재사용 가능할 때 안전한 workspace-skill 업데이트 적용

## 비용과 런타임 동작

휴리스틱 캡처는 모델을 호출하지 않습니다.

LLM 리뷰는 활성/기본 에이전트 모델에서 내장 실행을 사용합니다. 기본적으로 매
턴마다 실행되지 않도록 임계값 기반입니다.

리뷰어는:

- 사용 가능한 경우 구성된 프로바이더/모델 컨텍스트를 동일하게 사용합니다
- 런타임 에이전트 기본값으로 폴백합니다
- `reviewTimeoutMs`를 가집니다
- 가벼운 부트스트랩 컨텍스트를 사용합니다
- 도구가 없습니다
- 직접 아무것도 기록하지 않습니다
- 일반 스캐너와 승인/격리 경로를 거치는 제안만 방출할 수 있습니다

리뷰어가 실패하거나, 타임아웃되거나, 유효하지 않은 JSON을 반환하면, 플러그인은
경고/디버그 메시지를 로그에 남기고 해당 리뷰 패스를 건너뜁니다.

## 운영 패턴

사용자가 다음과 같이 말할 때 Skill Workshop을 사용하십시오.

- "next time, do X"
- "from now on, prefer Y"
- "make sure to verify Z"
- "save this as a workflow"
- "this took a while; remember the process"
- "update the local skill for this"

좋은 skill 텍스트:

```markdown
## Workflow

- Verify the GIF URL resolves to `image/gif`.
- Confirm the file has multiple frames.
- Record source URL, license, and attribution.
- Store a local copy when the asset will ship with the product.
- Verify the local asset renders in the target UI before final reply.
```

나쁜 skill 텍스트:

```markdown
The user asked about a GIF and I searched two websites. Then one was blocked by
Cloudflare. The final answer said to check attribution.
```

나쁜 버전이 저장되면 안 되는 이유:

- 전사 형태임
- 명령형이 아님
- 잡음 섞인 일회성 세부사항을 포함함
- 다음 에이전트에게 무엇을 해야 하는지 알려주지 않음

## 디버깅

플러그인이 로드되었는지 확인합니다.

```bash
openclaw plugins list --enabled
```

에이전트/도구 컨텍스트에서 제안 수를 확인합니다.

```json
{ "action": "status" }
```

pending 제안을 확인합니다.

```json
{ "action": "list_pending" }
```

격리된 제안을 확인합니다.

```json
{ "action": "list_quarantine" }
```

일반적인 증상:

| 증상                                   | 가능한 원인                                                                             | 확인                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 도구를 사용할 수 없음                  | 플러그인 항목이 활성화되지 않음                                                         | `plugins.entries.skill-workshop.enabled` 및 `openclaw plugins list`  |
| 자동 제안이 나타나지 않음              | `autoCapture: false`, `reviewMode: "off"`, 또는 임계값 미달                             | 구성, 제안 상태, Gateway 로그                                        |
| 휴리스틱이 캡처하지 않음               | 사용자 문구가 수정 패턴과 일치하지 않음                                                 | 명시적 `skill_workshop.suggest` 사용 또는 LLM 리뷰어 활성화          |
| 리뷰어가 제안을 생성하지 않음          | 리뷰어가 `none`, 유효하지 않은 JSON을 반환했거나 타임아웃                               | Gateway 로그, `reviewTimeoutMs`, 임계값                              |
| 제안이 적용되지 않음                   | `approvalPolicy: "pending"`                                                             | `list_pending`, 그 후 `apply`                                        |
| 제안이 pending에서 사라짐              | 중복 제안 재사용, max pending 프루닝, 또는 적용/거부/격리됨                             | `status`, 상태 필터가 있는 `list_pending`, `list_quarantine`         |
| skill 파일이 존재하지만 모델이 놓침    | skill 스냅샷이 리프레시되지 않음 또는 skill 게이팅이 이를 제외함                        | `openclaw skills` 상태 및 workspace skill 적격성                     |

관련 로그:

- `skill-workshop: queued <skill>`
- `skill-workshop: applied <skill>`
- `skill-workshop: quarantined <skill>`
- `skill-workshop: heuristic capture skipped: ...`
- `skill-workshop: reviewer skipped: ...`
- `skill-workshop: reviewer found no update`

## QA 시나리오

저장소 기반 QA 시나리오:

- `qa/scenarios/plugins/skill-workshop-animated-gif-autocreate.md`
- `qa/scenarios/plugins/skill-workshop-pending-approval.md`
- `qa/scenarios/plugins/skill-workshop-reviewer-autonomous.md`

결정적 커버리지 실행:

```bash
pnpm openclaw qa suite \
  --scenario skill-workshop-animated-gif-autocreate \
  --scenario skill-workshop-pending-approval \
  --concurrency 1
```

리뷰어 커버리지 실행:

```bash
pnpm openclaw qa suite \
  --scenario skill-workshop-reviewer-autonomous \
  --concurrency 1
```

리뷰어 시나리오는 `reviewMode: "llm"`을 활성화하고 내장 리뷰어 패스를 실행하므로
의도적으로 분리되어 있습니다.

## 자동 적용을 활성화하면 안 되는 경우

다음 경우에는 `approvalPolicy: "auto"`를 피하십시오.

- workspace에 민감한 절차가 포함되어 있는 경우
- 에이전트가 신뢰할 수 없는 입력으로 작업하는 경우
- skill이 넓은 팀 간에 공유되는 경우
- 아직 prompt 또는 스캐너 규칙을 튜닝 중인 경우
- 모델이 적대적인 웹/이메일 콘텐츠를 자주 처리하는 경우

먼저 pending 모드를 사용하십시오. 해당 workspace에서 에이전트가 제안하는 skill의
종류를 검토한 후에만 auto 모드로 전환하십시오.

## 관련 문서

- [Skill](/tools/skills)
- [플러그인](/tools/plugin)
- [테스팅](/reference/test)
