---
summary: "`openclaw sessions`에 대한 CLI 참조 (저장된 세션 목록 + 사용량)"
read_when:
  - 저장된 세션을 나열하고 최근 활동을 확인하려는 경우
title: "sessions"
---

# `openclaw sessions`

저장된 대화 세션을 나열합니다.

```bash
openclaw sessions
openclaw sessions --agent work
openclaw sessions --all-agents
openclaw sessions --active 120
openclaw sessions --verbose
openclaw sessions --json
```

범위 선택:

- 기본값: 구성된 기본 에이전트 저장소
- `--verbose`: 상세 로깅
- `--agent <id>`: 하나의 구성된 에이전트 저장소
- `--all-agents`: 구성된 모든 에이전트 저장소 합산
- `--store <path>`: 명시적 저장소 경로 (`--agent` 또는 `--all-agents`와 결합 불가)

`openclaw sessions --all-agents`는 구성된 에이전트 저장소를 읽습니다. Gateway 및 ACP
세션 검색은 더 광범위합니다: 기본 `agents/` 루트 또는 템플릿화된 `session.store` 루트 아래에서
발견된 디스크 전용 저장소도 포함합니다. 발견된 저장소는 에이전트 루트 내의 일반
`sessions.json` 파일로 확인되어야 합니다; 심볼릭 링크와 루트 밖 경로는 건너뜁니다.

JSON 예시:

`openclaw sessions --all-agents --json`:

```json
{
  "path": null,
  "stores": [
    { "agentId": "main", "path": "/home/user/.openclaw/agents/main/sessions/sessions.json" },
    { "agentId": "work", "path": "/home/user/.openclaw/agents/work/sessions/sessions.json" }
  ],
  "allAgents": true,
  "count": 2,
  "activeMinutes": null,
  "sessions": [
    { "agentId": "main", "key": "agent:main:main", "model": "gpt-5" },
    { "agentId": "work", "key": "agent:work:main", "model": "claude-opus-4-6" }
  ]
}
```

## 정리 유지보수

다음 쓰기 주기를 기다리는 대신 지금 유지보수를 실행합니다:

```bash
openclaw sessions cleanup --dry-run
openclaw sessions cleanup --agent work --dry-run
openclaw sessions cleanup --all-agents --dry-run
openclaw sessions cleanup --enforce
openclaw sessions cleanup --enforce --active-key "agent:main:telegram:direct:123"
openclaw sessions cleanup --json
```

`openclaw sessions cleanup`은 구성에서 `session.maintenance` 설정을 사용합니다:

- 범위 참고: `openclaw sessions cleanup`은 세션 저장소/트랜스크립트만 유지합니다. `cron.runLog.maxBytes` 및 `cron.runLog.keepLines`로 관리되는 크론 실행 로그 (`cron/runs/<jobId>.jsonl`)는 정리하지 않습니다. [크론 구성](/automation/cron-jobs#configuration)과 [크론 유지보수](/automation/cron-jobs#maintenance)에 설명되어 있습니다.

- `--dry-run`: 쓰기 없이 얼마나 많은 항목이 정리/제한될지 미리 봅니다.
  - 텍스트 모드에서 드라이 런은 세션별 액션 테이블 (`Action`, `Key`, `Age`, `Model`, `Flags`)을 출력하여 유지될 항목과 제거될 항목을 확인할 수 있습니다.
- `--enforce`: `session.maintenance.mode`가 `warn`이더라도 유지보수 적용.
- `--fix-missing`: 트랜스크립트 파일이 누락된 항목을 제거하며, 아직 일반적으로 만료/카운트 아웃되지 않더라도 제거.
- `--active-key <key>`: 디스크 예산 제거에서 특정 활성 키를 보호.
- `--agent <id>`: 하나의 구성된 에이전트 저장소에 대한 정리 실행.
- `--all-agents`: 구성된 모든 에이전트 저장소에 대한 정리 실행.
- `--store <path>`: 특정 `sessions.json` 파일에 대해 실행.
- `--json`: JSON 요약 출력. `--all-agents`와 함께 사용하면 출력에 저장소별 요약이 포함됩니다.

`openclaw sessions cleanup --all-agents --dry-run --json`:

```json
{
  "allAgents": true,
  "mode": "warn",
  "dryRun": true,
  "stores": [
    {
      "agentId": "main",
      "storePath": "/home/user/.openclaw/agents/main/sessions/sessions.json",
      "beforeCount": 120,
      "afterCount": 80,
      "pruned": 40,
      "capped": 0
    },
    {
      "agentId": "work",
      "storePath": "/home/user/.openclaw/agents/work/sessions/sessions.json",
      "beforeCount": 18,
      "afterCount": 18,
      "pruned": 0,
      "capped": 0
    }
  ]
}
```

관련:

- 세션 구성: [구성 참조](/gateway/configuration-reference#session)
