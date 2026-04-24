---
summary: "에이전트 런타임, 워크스페이스 계약, 세션 부트스트랩"
read_when:
  - 에이전트 런타임, 워크스페이스 부트스트랩, 또는 세션 동작을 변경할 때
title: "에이전트 런타임(Agent runtime)"
---

OpenClaw는 **단일 임베디드 에이전트 런타임**을 실행합니다 — 게이트웨이당
하나의 에이전트 프로세스가 자체 워크스페이스, 부트스트랩 파일, 그리고 세션
저장소를 가집니다. 이 페이지는 해당 런타임 계약을 다룹니다: 워크스페이스에
무엇이 포함되어야 하는지, 어떤 파일이 주입되는지, 그리고 세션이 그에 대해
어떻게 부트스트랩되는지입니다.

## 워크스페이스 (필수)

OpenClaw는 단일 에이전트 워크스페이스 디렉터리(`agents.defaults.workspace`)를
도구와 컨텍스트를 위한 에이전트의 **유일한** 작업 디렉터리(`cwd`)로 사용합니다.

권장: `openclaw setup`을 사용해 `~/.openclaw/openclaw.json`이 없으면 생성하고
워크스페이스 파일을 초기화하세요.

전체 워크스페이스 레이아웃 + 백업 가이드: [에이전트 워크스페이스](/concepts/agent-workspace)

`agents.defaults.sandbox`가 활성화되면, 메인이 아닌 세션은
`agents.defaults.sandbox.workspaceRoot` 아래 세션별 워크스페이스로 이를
오버라이드할 수 있습니다
([게이트웨이 설정](/gateway/configuration) 참고).

## 부트스트랩 파일 (주입됨)

`agents.defaults.workspace` 내부에서 OpenClaw는 다음 사용자 편집 가능 파일을
기대합니다:

- `AGENTS.md` — 운영 지침 + "기억(memory)"
- `SOUL.md` — 페르소나, 경계, 톤
- `TOOLS.md` — 사용자가 관리하는 도구 메모 (예: `imsg`, `sag`, 관례)
- `BOOTSTRAP.md` — 1회성 첫 실행 의식(ritual) (완료 후 삭제됨)
- `IDENTITY.md` — 에이전트 이름/바이브/이모지
- `USER.md` — 사용자 프로필 + 선호 호칭

새 세션의 첫 턴에서 OpenClaw는 이 파일들의 내용을 에이전트 컨텍스트에 직접
주입합니다.

빈 파일은 건너뜁니다. 큰 파일은 마커와 함께 다듬어져 잘려나가 프롬프트를
가볍게 유지합니다 (전체 내용은 파일을 읽어주세요).

파일이 누락된 경우, OpenClaw는 단일 "missing file" 마커 라인을 주입하며
(`openclaw setup`이 안전한 기본 템플릿을 생성합니다).

`BOOTSTRAP.md`는 **완전히 새로운 워크스페이스**(다른 부트스트랩 파일이
하나도 없는 경우)에만 생성됩니다. 의식을 완료한 뒤 삭제했다면 이후 재시작
시에도 다시 생성되지 않아야 합니다.

부트스트랩 파일 생성을 전체적으로 비활성화하려면(사전 시드된 워크스페이스용)
다음과 같이 설정하세요:

```json5
{ agent: { skipBootstrap: true } }
```

## 내장 도구

코어 도구(read/exec/edit/write 및 관련 시스템 도구)는 도구 정책에 따라 항상
사용 가능합니다. `apply_patch`는 선택적이며 `tools.exec.applyPatch`로 게이트
됩니다. `TOOLS.md`는 어떤 도구가 존재하는지를 제어하지 **않습니다**; _당신이_
도구를 어떻게 사용하기를 원하는지에 대한 가이드입니다.

## 스킬(Skills)

OpenClaw는 다음 위치에서 스킬을 로드합니다 (우선순위가 높은 순):

- 워크스페이스: `<workspace>/skills`
- 프로젝트 에이전트 스킬: `<workspace>/.agents/skills`
- 개인 에이전트 스킬: `~/.agents/skills`
- 관리/로컬: `~/.openclaw/skills`
- 번들 (설치와 함께 제공됨)
- 추가 스킬 폴더: `skills.load.extraDirs`

스킬은 config/env로 게이트될 수 있습니다
([게이트웨이 설정](/gateway/configuration)의 `skills` 참고).

## 런타임 경계

임베디드 에이전트 런타임은 Pi agent core(모델, 도구, 프롬프트 파이프라인)
위에 구축됩니다. 세션 관리, 디스커버리, 도구 연결, 채널 전송은 그 코어
위에서 OpenClaw가 소유하는 레이어입니다.

## 세션

세션 transcript는 다음 위치에 JSONL로 저장됩니다:

- `~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl`

세션 ID는 안정적이며 OpenClaw가 선택합니다.
다른 도구의 레거시 세션 폴더는 읽지 않습니다.

## 스트리밍 중 조향(Steering)

큐 모드가 `steer`일 때, 들어오는 메시지는 현재 실행에 주입됩니다. 큐잉된
조향은 **현재 어시스턴트 턴이 자신의 도구 호출 실행을 마친 뒤**, 다음 LLM
호출 전에 전달됩니다. 조향은 더 이상 현재 어시스턴트 메시지의 남은 도구
호출을 건너뛰지 않습니다; 대신 다음 모델 경계에서 큐잉된 메시지를 주입합니다.

큐 모드가 `followup` 또는 `collect`일 때, 들어오는 메시지는 현재 턴이
끝날 때까지 보류되다가, 큐잉된 페이로드로 새 에이전트 턴이 시작됩니다.
모드 + debounce/cap 동작은 [큐(Queue)](/concepts/queue)를 참고하세요.

블록 스트리밍은 완성된 어시스턴트 블록을 완료되는 즉시 전송합니다; 이는
**기본적으로 꺼져 있습니다**(`agents.defaults.blockStreamingDefault: "off"`).
경계는 `agents.defaults.blockStreamingBreak`로 조정합니다(`text_end` vs
`message_end`; 기본값은 text_end).
소프트 블록 청킹은 `agents.defaults.blockStreamingChunk`로 제어합니다(기본값
800–1200자; 문단 구분을 먼저, 그다음 개행, 문장은 마지막).
스트리밍된 청크는 `agents.defaults.blockStreamingCoalesce`로 병합(coalesce)
하여 단일 라인 스팸을 줄일 수 있습니다 (전송 전 유휴 기반 병합). Telegram이
아닌 채널은 블록 응답을 활성화하려면 명시적인 `*.blockStreaming: true`가
필요합니다.
장황한 도구 요약은 도구 시작 시 방출됩니다(debounce 없음); Control UI는
가능한 경우 에이전트 이벤트를 통해 도구 출력을 스트리밍합니다.
자세한 내용: [스트리밍 + 청킹](/concepts/streaming).

## 모델 ref

config의 모델 ref(예: `agents.defaults.model`, `agents.defaults.models`)는
**첫 번째** `/`를 기준으로 분할하여 파싱됩니다.

- 모델을 설정할 때는 `provider/model`을 사용하세요.
- 모델 ID 자체에 `/`가 포함된 경우(OpenRouter 스타일), 프로바이더 프리픽스를
  포함해야 합니다 (예: `openrouter/moonshotai/kimi-k2`).
- 프로바이더를 생략하면, OpenClaw는 먼저 alias를 시도하고, 그 다음 해당
  모델 id와 정확히 일치하는 유일한 configured-provider를 찾고, 그 다음에야
  configured default provider로 폴백합니다. 해당 provider가 더 이상
  configured default model을 노출하지 않는다면, OpenClaw는 stale한 제거된
  provider 기본값을 노출하지 않기 위해 첫 번째 configured provider/model로
  폴백합니다.

## 설정 (최소)

최소한 다음을 설정하세요:

- `agents.defaults.workspace`
- `channels.whatsapp.allowFrom` (강력히 권장)

---

_다음: [그룹 채팅](/channels/group-messages)_ 🦞

## 관련 문서

- [에이전트 워크스페이스](/concepts/agent-workspace)
- [멀티 에이전트 라우팅](/concepts/multi-agent)
- [세션 관리](/concepts/session)
