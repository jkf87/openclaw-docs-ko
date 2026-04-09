---
title: "agent"
description: "`openclaw agent`에 대한 CLI 참조 (Gateway를 통해 하나의 에이전트 턴 실행)"
---

# `openclaw agent`

Gateway를 통해 에이전트 턴을 실행합니다 (내장형에는 `--local` 사용).
구성된 에이전트를 직접 대상으로 하려면 `--agent &lt;id&gt;`를 사용하세요.

최소 하나의 세션 선택자를 전달하세요:

- `--to &lt;dest&gt;`
- `--session-id &lt;id&gt;`
- `--agent &lt;id&gt;`

관련:

- 에이전트 전송 툴: [에이전트 전송](/tools/agent-send)

## 옵션

- `-m, --message &lt;text&gt;`: 필수 메시지 본문
- `-t, --to &lt;dest&gt;`: 세션 키를 파생하는 데 사용되는 수신자
- `--session-id &lt;id&gt;`: 명시적 세션 id
- `--agent &lt;id&gt;`: 에이전트 id; 라우팅 바인딩 재정의
- `--thinking &lt;off|minimal|low|medium|high|xhigh&gt;`: 에이전트 사고 수준
- `--verbose &lt;on|off&gt;`: 세션의 상세 수준 영구 저장
- `--channel &lt;channel&gt;`: 전달 채널; 메인 세션 채널을 사용하려면 생략
- `--reply-to &lt;target&gt;`: 전달 대상 재정의
- `--reply-channel &lt;channel&gt;`: 전달 채널 재정의
- `--reply-account &lt;id&gt;`: 전달 계정 재정의
- `--local`: 플러그인 레지스트리 사전 로드 후 내장 에이전트를 직접 실행
- `--deliver`: 선택된 채널/대상으로 응답 전송
- `--timeout &lt;seconds&gt;`: 에이전트 타임아웃 재정의 (기본값 600 또는 구성값)
- `--json`: JSON 출력

## 예시

```bash
openclaw agent --to +15555550123 --message "status update" --deliver
openclaw agent --agent ops --message "Summarize logs"
openclaw agent --session-id 1234 --message "Summarize inbox" --thinking medium
openclaw agent --to +15555550123 --message "Trace logs" --verbose on --json
openclaw agent --agent ops --message "Generate report" --deliver --reply-channel slack --reply-to "#reports"
openclaw agent --agent ops --message "Run locally" --local
```

## 참고사항

- Gateway 모드는 Gateway 요청이 실패하면 내장 에이전트로 폴백합니다. 내장 실행을 강제하려면 `--local`을 사용하세요.
- `--local`은 여전히 먼저 플러그인 레지스트리를 사전 로드하므로 플러그인 제공 프로바이더, 툴, 채널은 내장 실행 중에도 사용 가능합니다.
- `--channel`, `--reply-channel`, `--reply-account`는 세션 라우팅이 아닌 응답 전달에 영향을 줍니다.
- 이 명령이 `models.json` 재생성을 트리거할 때 SecretRef 관리 프로바이더 자격 증명은 확인된 비밀 평문이 아닌 비밀이 아닌 마커 (예: env var 이름, `secretref-env:ENV_VAR_NAME`, 또는 `secretref-managed`)로 유지됩니다.
- 마커 쓰기는 소스 권한적입니다: OpenClaw는 확인된 런타임 비밀 값이 아닌 활성 소스 구성 스냅샷의 마커를 유지합니다.
