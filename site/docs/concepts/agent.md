---
title: "에이전트 런타임"
description: "에이전트 런타임, 워크스페이스 계약, 세션 부트스트랩"
---

# 에이전트 런타임

OpenClaw는 단일 임베디드 에이전트 런타임을 실행합니다.

## 워크스페이스 (필수)

OpenClaw는 단일 에이전트 워크스페이스 디렉터리(`agents.defaults.workspace`)를 도구 및 컨텍스트를 위한 에이전트의 **유일한** 작업 디렉터리(`cwd`)로 사용합니다.

권장 사항: `~/.openclaw/openclaw.json`이 없으면 생성하고 워크스페이스 파일을 초기화하려면 `openclaw setup`을 사용하십시오.

전체 워크스페이스 레이아웃 + 백업 가이드: [에이전트 워크스페이스](/concepts/agent-workspace)

`agents.defaults.sandbox`가 활성화된 경우, 비메인 세션은 `agents.defaults.sandbox.workspaceRoot` 아래의 세션별 워크스페이스로 이를 오버라이드할 수 있습니다 ([게이트웨이 구성](/gateway/configuration) 참조).

## 부트스트랩 파일 (주입됨)

`agents.defaults.workspace` 내에서 OpenClaw는 다음 사용자 편집 가능 파일들을 기대합니다:

- `AGENTS.md` — 운영 지침 + "메모리"
- `SOUL.md` — 페르소나, 경계, 어조
- `TOOLS.md` — 사용자 관리 도구 메모 (예: `imsg`, `sag`, 규칙)
- `BOOTSTRAP.md` — 최초 실행 의식 (완료 후 삭제)
- `IDENTITY.md` — 에이전트 이름/분위기/이모지
- `USER.md` — 사용자 프로파일 + 선호 호칭

새 세션의 첫 번째 턴에서 OpenClaw는 이 파일들의 내용을 에이전트 컨텍스트에 직접 주입합니다.

빈 파일은 건너뜁니다. 대용량 파일은 마커로 잘리고 잘라내어 프롬프트를 슬림하게 유지합니다 (전체 내용은 파일을 읽으십시오).

파일이 없으면 OpenClaw는 단일 "파일 누락" 마커 줄을 주입합니다 (`openclaw setup`은 안전한 기본 템플릿을 생성합니다).

`BOOTSTRAP.md`는 **완전히 새 워크스페이스** (다른 부트스트랩 파일이 없는 경우)에 대해서만 생성됩니다. 의식 완료 후 삭제하면 이후 재시작 시 재생성되지 않아야 합니다.

부트스트랩 파일 생성을 완전히 비활성화하려면 (미리 시드된 워크스페이스의 경우) 다음을 설정하십시오:

```json5
{ agent: { skipBootstrap: true } }
```

## 내장 도구

코어 도구 (read/exec/edit/write 및 관련 시스템 도구)는 도구 정책에 따라 항상 사용 가능합니다. `apply_patch`는 선택적이며 `tools.exec.applyPatch`로 게이트됩니다. `TOOLS.md`는 어떤 도구가 존재하는지를 제어하지 **않습니다**; _여러분_이 도구를 어떻게 사용하길 원하는지에 대한 지침입니다.

## 스킬

OpenClaw는 다음 위치에서 스킬을 로드합니다 (가장 높은 우선순위 순):

- 워크스페이스: `&lt;workspace&gt;/skills`
- 프로젝트 에이전트 스킬: `&lt;workspace&gt;/.agents/skills`
- 개인 에이전트 스킬: `~/.agents/skills`
- 관리형/로컬: `~/.openclaw/skills`
- 번들 (설치와 함께 제공)
- 추가 스킬 폴더: `skills.load.extraDirs`

스킬은 구성/환경 변수로 게이트될 수 있습니다 ([게이트웨이 구성](/gateway/configuration)의 `skills` 참조).

## 런타임 경계

임베디드 에이전트 런타임은 Pi 에이전트 코어 (모델, 도구, 프롬프트 파이프라인)를 기반으로 빌드됩니다. 세션 관리, 탐색, 도구 연결, 채널 전달은 해당 코어 위에 있는 OpenClaw 소유 레이어입니다.

## 세션

세션 트랜스크립트는 다음 위치에 JSONL로 저장됩니다:

- `~/.openclaw/agents/&lt;agentId&gt;/sessions/&lt;SessionId&gt;.jsonl`

세션 ID는 안정적이며 OpenClaw가 선택합니다. 다른 도구의 레거시 세션 폴더는 읽히지 않습니다.

## 스트리밍 중 조종

큐 모드가 `steer`일 때, 인바운드 메시지는 현재 실행에 주입됩니다. 큐에 대기 중인 조종은 **현재 어시스턴트 턴이 도구 호출 실행을 완료한 후**, 다음 LLM 호출 전에 전달됩니다. 조종은 더 이상 현재 어시스턴트 메시지의 나머지 도구 호출을 건너뛰지 않습니다; 대신 다음 모델 경계에서 큐에 대기 중인 메시지를 주입합니다.

큐 모드가 `followup` 또는 `collect`일 때, 인바운드 메시지는 현재 턴이 끝날 때까지 대기하며, 그런 다음 큐에 대기 중인 페이로드로 새로운 에이전트 턴이 시작됩니다. 모드 + 디바운스/상한 동작은 [큐](/concepts/queue)를 참조하십시오.

블록 스트리밍은 완료된 어시스턴트 블록을 완료되는 즉시 전송합니다; 기본적으로 **꺼져 있습니다** (`agents.defaults.blockStreamingDefault: "off"`). `agents.defaults.blockStreamingBreak` (`text_end` 대 `message_end`; 기본값 text_end)으로 경계를 조정하십시오. `agents.defaults.blockStreamingChunk` (기본값 800–1200자; 단락 구분 우선, 그 다음 줄바꿈; 문장 마지막)으로 소프트 블록 청킹을 제어하십시오. `agents.defaults.blockStreamingCoalesce`로 스트리밍된 청크를 병합하여 단일 줄 스팸을 줄이십시오 (전송 전 유휴 기반 병합). Telegram 이외의 채널은 블록 응답을 활성화하려면 명시적인 `*.blockStreaming: true`가 필요합니다. Verbose 도구 요약은 도구 시작 시 방출됩니다 (디바운스 없음); 제어 UI는 에이전트 이벤트를 통해 도구 출력을 스트리밍합니다. 자세한 내용: [스트리밍 + 청킹](/concepts/streaming).

## 모델 참조

구성의 모델 참조 (예: `agents.defaults.model` 및 `agents.defaults.models`)는 **첫 번째** `/`로 분할하여 파싱됩니다.

- 모델 구성 시 `provider/model`을 사용하십시오.
- 모델 ID 자체에 `/`가 포함된 경우 (OpenRouter 스타일), 프로바이더 접두사를 포함하십시오 (예: `openrouter/moonshotai/kimi-k2`).
- 프로바이더를 생략하면 OpenClaw는 먼저 별칭을 시도하고, 그 다음 해당 정확한 모델 ID에 대한 고유 구성 프로바이더 매칭을 시도하며, 그 후에 구성된 기본 프로바이더로 폴백합니다. 해당 프로바이더가 더 이상 구성된 기본 모델을 노출하지 않으면 OpenClaw는 낡은 제거된 프로바이더 기본값을 노출하는 대신 첫 번째 구성된 프로바이더/모델로 폴백합니다.

## 구성 (최소)

최소한 다음을 설정하십시오:

- `agents.defaults.workspace`
- `channels.whatsapp.allowFrom` (강력히 권장)

---

_다음: [그룹 채팅](/channels/group-messages)_ 🦞
