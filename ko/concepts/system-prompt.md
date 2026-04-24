---
summary: "OpenClaw system prompt가 포함하는 내용과 조립되는 방식"
read_when:
  - system prompt 텍스트, 도구 리스트, 또는 시간/하트비트 섹션을 편집할 때
  - 워크스페이스 부트스트랩 또는 스킬 주입 동작을 변경할 때
title: "System prompt"
---

OpenClaw는 모든 agent 실행에 대해 맞춤형 system prompt를 빌드합니다. 이 prompt는 **OpenClaw가 소유(OpenClaw-owned)**하며, pi-coding-agent의 기본 prompt를 사용하지 않습니다.

prompt는 OpenClaw에 의해 조립되어 각 agent 실행에 주입됩니다.

provider 플러그인은 전체 OpenClaw 소유 prompt를 대체하지 않고도 캐시 인식(cache-aware) prompt 가이던스를 기여할 수 있습니다. provider 런타임은 다음을 수행할 수 있습니다:

- 작은 수의 명명된 코어 섹션(`interaction_style`, `tool_call_style`, `execution_bias`) 교체
- prompt 캐시 경계 위에 **stable prefix** 주입
- prompt 캐시 경계 아래에 **dynamic suffix** 주입

모델 패밀리별 튜닝에는 provider 소유 기여를 사용하십시오. 레거시 `before_prompt_build` prompt mutation은 호환성 또는 진정으로 전역적인 prompt 변경용으로만 유지하고, 일반적인 provider 동작에는 사용하지 마십시오.

OpenAI GPT-5 패밀리 오버레이는 코어 실행 규칙을 작게 유지하면서 페르소나 락칭, 간결한 출력, 도구 규율, 병렬 조회, 산출물 커버리지, 검증, 누락 컨텍스트, 터미널 도구 위생에 대한 모델별 가이던스를 추가합니다.

## 구조

prompt는 의도적으로 간결하며 고정된 섹션을 사용합니다:

- **Tooling**: 구조화된 도구 source-of-truth 리마인더와 런타임 tool-use 가이던스.
- **Execution Bias**: 간결한 follow-through 가이던스 — 실행 가능한 요청에 대해 턴 내에서 행동하고, 완료되거나 차단될 때까지 계속하며, 약한 도구 결과에서 복구하고, 가변 상태를 라이브로 확인하며, 마무리 전에 검증합니다.
- **Safety**: power-seeking 동작이나 감독을 우회하는 것을 피하라는 짧은 가드레일 리마인더.
- **Skills** (사용 가능할 때): 모델에게 필요 시 스킬 지침을 로드하는 방법을 알립니다.
- **OpenClaw Self-Update**: `config.schema.lookup`으로 구성을 안전하게 검사하고, `config.patch`로 구성을 패치하며, `config.apply`로 전체 구성을 교체하고, 명시적 사용자 요청이 있을 때만 `update.run`을 실행하는 방법. 소유자 전용 `gateway` 도구는 또한 `tools.exec.ask` / `tools.exec.security`를 재작성하는 것을 거부하며, 보호된 exec 경로로 정규화되는 레거시 `tools.bash.*` 별칭도 포함됩니다.
- **Workspace**: 작업 디렉터리(`agents.defaults.workspace`).
- **Documentation**: OpenClaw 문서의 로컬 경로(repo 또는 npm 패키지) 및 언제 읽어야 하는지.
- **Workspace Files (injected)**: 아래에 부트스트랩 파일이 포함되어 있음을 나타냄.
- **Sandbox** (활성화된 경우): 샌드박스 런타임, 샌드박스 경로, 그리고 elevated exec 사용 가능 여부를 나타냄.
- **Current Date & Time**: 사용자 로컬 시간, 타임존, 시간 형식.
- **Reply Tags**: 지원되는 provider에 대한 선택적 reply tag 구문.
- **Heartbeats**: 기본 agent에 대해 하트비트가 활성화된 경우의 하트비트 prompt 및 ack 동작.
- **Runtime**: 호스트, OS, node, 모델, repo 루트(감지된 경우), thinking 레벨 (한 줄).
- **Reasoning**: 현재 가시성 레벨 + /reasoning 토글 힌트.

Tooling 섹션에는 장시간 실행 작업에 대한 런타임 가이던스도 포함됩니다:

- 미래 후속 작업(`check back later`, 리마인더, 반복 작업)에는 `exec` sleep 루프, `yieldMs` 지연 트릭, 또는 반복적인 `process` 폴링 대신 cron 사용
- 지금 시작되어 백그라운드에서 계속 실행되는 명령에만 `exec` / `process` 사용
- 자동 완료 wake가 활성화된 경우, 명령을 한 번 시작하고 출력이 발생하거나 실패했을 때 push 기반 wake 경로에 의존
- 실행 중인 명령을 검사해야 할 때 로그, 상태, 입력, 또는 개입에는 `process` 사용
- 작업이 더 큰 경우 `sessions_spawn`을 선호; sub-agent 완료는 push 기반이며 요청자에게 자동으로 다시 알림
- 완료를 기다리기 위해서만 `subagents list` / `sessions_list`를 루프로 폴링하지 말 것

실험적인 `update_plan` 도구가 활성화된 경우, Tooling은 또한 모델에게 사소하지 않은 다단계 작업에만 사용하고, 정확히 하나의 `in_progress` 단계만 유지하며, 업데이트 후 전체 계획을 반복하지 않도록 지시합니다.

system prompt 내의 Safety 가드레일은 권고적(advisory)입니다. 모델 동작을 안내하지만 정책을 강제하지는 않습니다. 하드 강제에는 도구 정책, exec 승인, 샌드박싱, 채널 allowlist를 사용하십시오; 운영자는 설계상 이를 비활성화할 수 있습니다.

네이티브 승인 카드/버튼이 있는 채널에서는, 런타임 prompt가 이제 agent에게 해당 네이티브 승인 UI를 우선 사용하도록 지시합니다. 도구 결과가 채팅 승인을 사용할 수 없거나 수동 승인이 유일한 경로라고 말할 때만 수동 `/approve` 명령을 포함해야 합니다.

## Prompt 모드

OpenClaw는 sub-agent를 위한 더 작은 system prompt를 렌더링할 수 있습니다. 런타임은 각 실행에 대해 `promptMode`를 설정합니다 (사용자에게 노출되는 구성이 아님):

- `full` (기본값): 위의 모든 섹션 포함.
- `minimal`: sub-agent에 사용됨; **Skills**, **Memory Recall**, **OpenClaw Self-Update**, **Model Aliases**, **User Identity**, **Reply Tags**, **Messaging**, **Silent Replies**, **Heartbeats**를 생략. Tooling, **Safety**, Workspace, Sandbox, Current Date & Time(알려진 경우), Runtime, 주입된 컨텍스트는 계속 사용 가능.
- `none`: 기본 identity 라인만 반환.

`promptMode=minimal`일 때, 추가로 주입된 prompt는 **Group Chat Context** 대신 **Subagent Context**로 라벨링됩니다.

## 워크스페이스 부트스트랩 주입

부트스트랩 파일은 트리밍되어 **Project Context** 아래에 추가되므로, 모델은 명시적 읽기 없이도 identity 및 프로파일 컨텍스트를 볼 수 있습니다:

- `AGENTS.md`
- `SOUL.md`
- `TOOLS.md`
- `IDENTITY.md`
- `USER.md`
- `HEARTBEAT.md`
- `BOOTSTRAP.md` (완전히 새 워크스페이스에서만)
- `MEMORY.md` 존재하는 경우

이 모든 파일은 파일별 게이트가 적용되지 않는 한 매 턴마다 **컨텍스트 창에 주입됩니다**. `HEARTBEAT.md`는 기본 agent에 대해 하트비트가 비활성화되어 있거나 `agents.defaults.heartbeat.includeSystemPromptSection`이 false인 일반 실행에서는 생략됩니다. 주입되는 파일을 간결하게 유지하십시오 — 특히 `MEMORY.md`는 시간이 지남에 따라 커질 수 있으며 예상치 못한 높은 컨텍스트 사용량과 더 빈번한 compaction을 초래할 수 있습니다.

> **참고:** `memory/*.md` 일일 파일은 일반 부트스트랩 Project Context의 **일부가 아닙니다**. 일반 턴에서는 `memory_search`와 `memory_get` 도구를 통해 필요 시 접근되므로, 모델이 명시적으로 읽지 않는 한 컨텍스트 창에 포함되지 않습니다. 단순한 `/new`와 `/reset` 턴은 예외입니다: 런타임이 해당 첫 턴에 대한 일회성 startup-context 블록으로 최근 일일 메모리를 앞에 추가할 수 있습니다.

대용량 파일은 마커와 함께 잘립니다. 파일당 최대 크기는 `agents.defaults.bootstrapMaxChars`(기본값: 12000)로 제어됩니다. 파일 전반에 걸친 총 주입 부트스트랩 콘텐츠는 `agents.defaults.bootstrapTotalMaxChars`(기본값: 60000)에 의해 제한됩니다. 누락된 파일은 짧은 missing-file 마커를 주입합니다. 잘림이 발생하면, OpenClaw는 Project Context에 경고 블록을 주입할 수 있습니다; `agents.defaults.bootstrapPromptTruncationWarning`(`off`, `once`, `always`; 기본값: `once`)으로 제어하십시오.

sub-agent 세션은 `AGENTS.md`와 `TOOLS.md`만 주입합니다 (sub-agent 컨텍스트를 작게 유지하기 위해 다른 부트스트랩 파일은 필터링됨).

내부 훅은 `agent:bootstrap`을 통해 이 단계를 가로채어 주입된 부트스트랩 파일을 변경하거나 교체할 수 있습니다 (예: 대체 페르소나를 위해 `SOUL.md` 교체).

agent가 덜 일반적으로 들리게 만들고 싶다면, [SOUL.md 성격 가이드](/concepts/soul)부터 시작하십시오.

각 주입 파일이 얼마나 기여하는지(raw vs injected, truncation, 도구 스키마 오버헤드 포함)를 검사하려면 `/context list` 또는 `/context detail`을 사용하십시오. [Context](/concepts/context)를 참조하십시오.

## 시간 처리

system prompt는 사용자 타임존을 아는 경우 전용 **Current Date & Time** 섹션을 포함합니다. prompt 캐시를 안정적으로 유지하기 위해, 이제 **타임존**만 포함합니다 (동적 시계나 시간 형식은 없음).

agent가 현재 시간이 필요할 때는 `session_status`를 사용하십시오; 상태 카드에는 타임스탬프 줄이 포함됩니다. 동일한 도구는 선택적으로 세션별 모델 오버라이드를 설정할 수도 있습니다 (`model=default`는 이를 지움).

다음으로 구성하십시오:

- `agents.defaults.userTimezone`
- `agents.defaults.timeFormat` (`auto` | `12` | `24`)

전체 동작 세부사항은 [Date & Time](/date-time)을 참조하십시오.

## 스킬

eligible 스킬이 존재할 때, OpenClaw는 각 스킬의 **파일 경로**가 포함된 간결한 **available skills list**(`formatSkillsForPrompt`)를 주입합니다. prompt는 모델에게 나열된 위치(워크스페이스, managed, 또는 bundled)에서 `read`를 사용하여 SKILL.md를 로드하도록 지시합니다. eligible 스킬이 없으면, Skills 섹션은 생략됩니다.

eligibility는 스킬 메타데이터 게이트, 런타임 환경/구성 검사, 그리고 `agents.defaults.skills` 또는 `agents.list[].skills`가 구성된 경우 effective agent 스킬 allowlist를 포함합니다.

```
<available_skills>
  <skill>
    <name>...</name>
    <description>...</description>
    <location>...</location>
  </skill>
</available_skills>
```

이는 기본 prompt를 작게 유지하면서도 타겟팅된 스킬 사용을 가능하게 합니다.

스킬 리스트 예산은 스킬 서브시스템이 소유합니다:

- 전역 기본값: `skills.limits.maxSkillsPromptChars`
- agent별 오버라이드: `agents.list[].skillsLimits.maxSkillsPromptChars`

일반적인 경계가 있는 런타임 발췌는 다른 표면을 사용합니다:

- `agents.defaults.contextLimits.*`
- `agents.list[].contextLimits.*`

이 분리는 `memory_get`, 라이브 도구 결과, post-compaction AGENTS.md 새로고침과 같은 런타임 read/injection 크기 조정으로부터 스킬 크기 조정을 분리시킵니다.

## 문서

사용 가능한 경우, system prompt는 로컬 OpenClaw 문서 디렉터리(repo 워크스페이스의 `docs/` 또는 번들된 npm 패키지 문서)를 가리키는 **Documentation** 섹션을 포함하며, 공개 미러, 소스 repo, 커뮤니티 Discord, 그리고 스킬 탐색을 위한 ClawHub([https://clawhub.ai](https://clawhub.ai))도 언급합니다. prompt는 모델에게 OpenClaw 동작, 명령, 구성, 또는 아키텍처에 대해 로컬 문서를 먼저 참조하고, 가능할 때는 직접 `openclaw status`를 실행하도록(접근 권한이 없을 때만 사용자에게 요청) 지시합니다.

## 관련 문서

- [Agent 런타임](/concepts/agent)
- [Agent 워크스페이스](/concepts/agent-workspace)
- [Context 엔진](/concepts/context-engine)
