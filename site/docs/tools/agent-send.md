---
title: "Agent Send"
description: "CLI에서 에이전트 턴을 실행하고 선택적으로 채널에 응답을 전달합니다"
---

# Agent Send

`openclaw agent`는 인바운드 채팅 메시지 없이 커맨드라인에서 단일 에이전트 턴을 실행합니다. 스크립트 워크플로우, 테스트, 프로그래밍 방식 전달에 활용할 수 있습니다.

## 빠른 시작

1. **간단한 에이전트 턴 실행**

   ```bash
       openclaw agent --message "What is the weather today?"
       ```
   
       이 명령은 게이트웨이를 통해 메시지를 전송하고 응답을 출력합니다.


  2. **특정 에이전트 또는 세션 지정**

   ```bash
       # 특정 에이전트 지정
       openclaw agent --agent ops --message "Summarize logs"
   
       # 전화번호 지정 (세션 키 파생)
       openclaw agent --to +15555550123 --message "Status update"
   
       # 기존 세션 재사용
       openclaw agent --session-id abc123 --message "Continue the task"
       ```


  3. **채널에 응답 전달**

   ```bash
       # WhatsApp에 전달 (기본 채널)
       openclaw agent --to +15555550123 --message "Report ready" --deliver
   
       # Slack에 전달
       openclaw agent --agent ops --message "Generate report" \
         --deliver --reply-channel slack --reply-to "#reports"
       ```


## 플래그

| 플래그                        | 설명                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| `--message \&lt;text\&gt;`          | 전송할 메시지 (필수)                                        |
| `--to \&lt;dest\&gt;`               | 대상에서 세션 키 파생 (전화번호, 채팅 id)                   |
| `--agent \&lt;id\&gt;`              | 설정된 에이전트 지정 (`main` 세션 사용)                     |
| `--session-id \&lt;id\&gt;`         | id로 기존 세션 재사용                                       |
| `--local`                     | 로컬 임베디드 런타임 강제 사용 (게이트웨이 우회)            |
| `--deliver`                   | 채팅 채널에 응답 전송                                       |
| `--channel \&lt;name\&gt;`          | 전달 채널 (whatsapp, telegram, discord, slack 등)           |
| `--reply-to \&lt;target\&gt;`       | 전달 대상 재정의                                            |
| `--reply-channel \&lt;name\&gt;`    | 전달 채널 재정의                                            |
| `--reply-account \&lt;id\&gt;`      | 전달 계정 id 재정의                                         |
| `--thinking \&lt;level\&gt;`        | 사고 수준 설정 (off, minimal, low, medium, high, xhigh)     |
| `--verbose \&lt;on\|full\|off\&gt;` | 상세 출력 수준 설정                                         |
| `--timeout \&lt;seconds\&gt;`       | 에이전트 타임아웃 재정의                                    |
| `--json`                      | 구조화된 JSON 출력                                          |

## 동작 방식

- 기본적으로 CLI는 **게이트웨이를 통해** 동작합니다. `--local`을 추가하면 현재 머신의 임베디드 런타임을 강제로 사용합니다.
- 게이트웨이에 연결할 수 없는 경우, CLI는 로컬 임베디드 실행으로 **폴백**합니다.
- 세션 선택: `--to`는 세션 키를 파생합니다 (그룹/채널 대상은 격리를 유지하고, 다이렉트 채팅은 `main`으로 통합됩니다).
- 사고 및 상세 출력 플래그는 세션 스토어에 저장됩니다.
- 출력: 기본적으로 일반 텍스트이며, 구조화된 페이로드와 메타데이터를 위해 `--json`을 사용합니다.

## 예시

```bash
# JSON 출력을 사용한 간단한 턴
openclaw agent --to +15555550123 --message "Trace logs" --verbose on --json

# 사고 수준을 포함한 턴
openclaw agent --session-id 1234 --message "Summarize inbox" --thinking medium

# 세션과 다른 채널에 전달
openclaw agent --agent ops --message "Alert" --deliver --reply-channel telegram --reply-to "@admin"
```

## 관련 항목

- [Agent CLI 레퍼런스](/cli/agent)
- [서브 에이전트](/tools/subagents) — 백그라운드 서브 에이전트 생성
- [세션](/concepts/session) — 세션 키 동작 방식
