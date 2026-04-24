---
summary: "OpenClaw agent 세션 디버깅을 위한 비식별화된 trajectory 번들 내보내기"
read_when:
  - agent가 특정 방식으로 답변하거나 실패하거나 tools를 호출한 이유를 디버깅할 때
  - OpenClaw 세션의 지원(support) 번들을 내보낼 때
  - 프롬프트 컨텍스트, tool 호출, 런타임 오류 또는 사용량 메타데이터를 조사할 때
  - trajectory 캡처를 비활성화하거나 위치를 변경할 때
title: "Trajectory 번들"
---

Trajectory 캡처는 OpenClaw의 세션별 비행 기록 장치(flight recorder)입니다. 각 agent
실행에 대해 구조화된 타임라인을 기록한 다음, `/export-trajectory`가 현재 세션을
비식별화된 지원(support) 번들로 패키징합니다.

다음과 같은 질문에 답해야 할 때 사용하세요:

- 어떤 프롬프트, 시스템 프롬프트, 그리고 tools가 모델에 전송되었는가?
- 어떤 트랜스크립트 메시지와 tool 호출이 이 답변으로 이어졌는가?
- 실행이 타임아웃되었거나, 중단되었거나, 컴팩트되었거나, 프로바이더 오류를 겪었는가?
- 어떤 모델, plugins, skills, 런타임 설정이 활성화되어 있었는가?
- 프로바이더가 어떤 사용량 및 prompt-cache 메타데이터를 반환했는가?

## 빠른 시작

활성 세션에서 다음을 전송하세요:

```text
/export-trajectory
```

별칭:

```text
/trajectory
```

OpenClaw는 워크스페이스 아래에 번들을 기록합니다:

```text
.openclaw/trajectory-exports/openclaw-trajectory-<session>-<timestamp>/
```

상대 출력 디렉터리 이름을 선택할 수 있습니다:

```text
/export-trajectory bug-1234
```

커스텀 경로는 `.openclaw/trajectory-exports/` 내부에서 해석됩니다. 절대
경로와 `~` 경로는 거부됩니다.

## 접근 권한

Trajectory 내보내기는 오너(owner) 명령입니다. 송신자는 채널에 대한 일반적인 명령
인증 검사와 오너 검사를 통과해야 합니다.

## 기록되는 내용

Trajectory 캡처는 OpenClaw agent 실행에 대해 기본적으로 켜져 있습니다.

런타임 이벤트에는 다음이 포함됩니다:

- `session.started`
- `trace.metadata`
- `context.compiled`
- `prompt.submitted`
- `model.completed`
- `trace.artifacts`
- `session.ended`

트랜스크립트 이벤트도 활성 세션 브랜치에서 재구성됩니다:

- 사용자 메시지
- 어시스턴트 메시지
- tool 호출
- tool 결과
- 컴팩션(compaction)
- 모델 변경
- 레이블 및 커스텀 세션 항목

이벤트는 다음 스키마 마커와 함께 JSON Lines로 기록됩니다:

```json
{
  "traceSchema": "openclaw-trajectory",
  "schemaVersion": 1
}
```

## 번들 파일

내보내진 번들에는 다음 파일들이 포함될 수 있습니다:

| 파일                  | 내용                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `manifest.json`       | 번들 스키마, 소스 파일, 이벤트 수, 생성된 파일 목록                                                |
| `events.jsonl`        | 순서대로 정렬된 런타임 및 트랜스크립트 타임라인                                                    |
| `session-branch.json` | 비식별화된 활성 트랜스크립트 브랜치 및 세션 헤더                                                   |
| `metadata.json`       | OpenClaw 버전, OS/런타임, 모델, 구성 스냅샷, plugins, skills, 프롬프트 메타데이터                  |
| `artifacts.json`      | 최종 상태, 오류, 사용량, prompt cache, 컴팩션 횟수, 어시스턴트 텍스트, tool 메타데이터             |
| `prompts.json`        | 제출된 프롬프트 및 선택된 프롬프트 빌드 세부 정보                                                  |
| `system-prompt.txt`   | 캡처된 경우 최신 컴파일된 시스템 프롬프트                                                          |
| `tools.json`          | 캡처된 경우 모델에 전송된 tool 정의                                                                |

`manifest.json`은 해당 번들에 존재하는 파일들을 나열합니다. 세션이 해당
런타임 데이터를 캡처하지 않은 경우 일부 파일은 생략됩니다.

## 캡처 위치

기본적으로, 런타임 trajectory 이벤트는 세션 파일 옆에 기록됩니다:

```text
<session>.trajectory.jsonl
```

OpenClaw는 세션 옆에 best-effort 포인터 파일도 기록합니다:

```text
<session>.trajectory-path.json
```

전용 디렉터리에 런타임 trajectory 사이드카 파일을 저장하려면
`OPENCLAW_TRAJECTORY_DIR`을 설정하세요:

```bash
export OPENCLAW_TRAJECTORY_DIR=/var/lib/openclaw/trajectories
```

이 변수가 설정되면, OpenClaw는 해당 디렉터리에 세션 id별로 하나의 JSONL
파일을 기록합니다.

## 캡처 비활성화

OpenClaw를 시작하기 전에 `OPENCLAW_TRAJECTORY=0`을 설정하세요:

```bash
export OPENCLAW_TRAJECTORY=0
```

이는 런타임 trajectory 캡처를 비활성화합니다. `/export-trajectory`는 여전히
트랜스크립트 브랜치를 내보낼 수 있지만, 컴파일된 컨텍스트, 프로바이더
아티팩트, 프롬프트 메타데이터 같은 런타임 전용 파일은 누락될 수 있습니다.

## 프라이버시 및 제한

Trajectory 번들은 지원 및 디버깅용으로 설계되었으며, 공개 게시용이 아닙니다.
OpenClaw는 내보내기 파일을 작성하기 전에 민감한 값을 비식별화합니다:

- 자격 증명 및 알려진 secret 유사 payload 필드
- 이미지 데이터
- 로컬 상태 경로
- 워크스페이스 경로, `$WORKSPACE_DIR`로 치환됨
- 감지된 경우 홈 디렉터리 경로

내보내기 도구는 입력 크기도 제한합니다:

- 런타임 사이드카 파일: 50 MiB
- 세션 파일: 50 MiB
- 런타임 이벤트: 200,000
- 총 내보낸 이벤트: 250,000
- 개별 런타임 이벤트 라인은 256 KiB를 초과하면 잘립니다

팀 외부로 번들을 공유하기 전에 검토하세요. 비식별화는 best-effort이며
모든 애플리케이션별 secret을 알 수는 없습니다.

## 문제 해결

내보내기에 런타임 이벤트가 없는 경우:

- OpenClaw가 `OPENCLAW_TRAJECTORY=0` 없이 시작되었는지 확인하세요
- `OPENCLAW_TRAJECTORY_DIR`이 쓰기 가능한 디렉터리를 가리키는지 확인하세요
- 세션에서 다른 메시지를 실행한 다음 다시 내보내세요
- `manifest.json`에서 `runtimeEventCount`를 확인하세요

명령이 출력 경로를 거부하는 경우:

- `bug-1234`와 같은 상대 이름을 사용하세요
- `/tmp/...` 또는 `~/...`을 전달하지 마세요
- 내보내기를 `.openclaw/trajectory-exports/` 내부에 유지하세요

내보내기가 크기 오류로 실패하는 경우, 세션 또는 사이드카가 내보내기
안전 제한을 초과한 것입니다. 새 세션을 시작하거나 더 작은 재현을 내보내세요.

## 관련

- [Diffs](/tools/diffs)
- [세션 관리](/concepts/session)
- [Exec tool](/tools/exec)
