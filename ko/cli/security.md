---
summary: "`openclaw security`에 대한 CLI 참조 (일반적인 보안 문제 감사 및 수정)"
read_when:
  - 구성/상태에 대한 빠른 보안 감사를 실행하려는 경우
  - 안전한 "수정" 제안 적용을 원하는 경우 (권한, 기본값 강화)
title: "security"
---

# `openclaw security`

보안 툴 (감사 + 선택적 수정).

관련:

- 보안 가이드: [보안](/gateway/security/)

## 감사

```bash
openclaw security audit
openclaw security audit --deep
openclaw security audit --deep --password <password>
openclaw security audit --deep --token <token>
openclaw security audit --fix
openclaw security audit --json
```

감사는 여러 DM 발신자가 주 세션을 공유하는 경우 경고하고 공유 받은 편지함에 대해 **보안 DM 모드**를 권장합니다: `session.dmScope="per-channel-peer"` (또는 멀티 계정 채널의 경우 `per-account-channel-peer`).
이것은 협력/공유 받은 편지함 강화를 위한 것입니다. 상호 신뢰할 수 없는/적대적인 운영자가 공유하는 단일 Gateway는 권장 설정이 아닙니다; 신뢰 경계를 별도의 게이트웨이 (또는 별도의 OS 사용자/호스트)로 분리하세요.
구성이 공유 사용자 수신을 시사하는 경우 (예: 열린 DM/그룹 정책, 구성된 그룹 대상, 또는 와일드카드 발신자 규칙) `security.trust_model.multi_user_heuristic`도 출력하고, OpenClaw는 기본적으로 개인 비서 신뢰 모델임을 알립니다.
의도적인 공유 사용자 설정의 경우 감사 지침은 모든 세션을 샌드박스화하고, 파일 시스템 액세스를 워크스페이스 범위로 유지하고, 해당 런타임에서 개인/사적 신원 또는 자격 증명을 제거하는 것입니다.
웹훅 수신에 대해 `hooks.token`이 Gateway 토큰을 재사용할 때, `hooks.token`이 짧을 때, `hooks.path="/"`일 때, `hooks.defaultSessionKey`가 설정되지 않을 때, `hooks.allowedAgentIds`가 제한 없을 때, 요청 `sessionKey` 재정의가 활성화될 때, 재정의가 `hooks.allowedSessionKeyPrefixes` 없이 활성화될 때도 경고합니다.
샌드박스 모드가 꺼진 상태에서 샌드박스 Docker 설정이 구성될 때, `gateway.nodes.denyCommands`가 효과 없는 패턴 유사/알 수 없는 항목을 사용할 때 (정확한 노드 명령 이름 매칭만, 셸 텍스트 필터링 아님), `gateway.nodes.allowCommands`가 위험한 노드 명령을 명시적으로 활성화할 때, 전역 `tools.profile="minimal"`이 에이전트 툴 프로필에 의해 재정의될 때, 열린 그룹이 샌드박스/워크스페이스 가드 없이 런타임/파일 시스템 툴을 노출할 때, 설치된 확장 플러그인 툴이 허용적인 툴 정책 하에 접근 가능할 때도 경고합니다.
`gateway.allowRealIpFallback=true` (프록시가 잘못 구성된 경우 헤더 스푸핑 위험)와 `discovery.mdns.mode="full"` (mDNS TXT 레코드를 통한 메타데이터 유출)도 플래그합니다.
샌드박스 브라우저가 `sandbox.browser.cdpSourceRange` 없이 Docker `bridge` 네트워크를 사용할 때도 경고합니다.
위험한 샌드박스 Docker 네트워크 모드 (`host` 및 `container:*` 네임스페이스 조인 포함)도 플래그합니다.
기존 샌드박스 브라우저 Docker 컨테이너에 누락/오래된 해시 레이블이 있을 때 (예: `openclaw.browserConfigEpoch`가 누락된 사전 마이그레이션 컨테이너) 경고하고 `openclaw sandbox recreate --browser --all`을 권장합니다.
npm 기반 플러그인/훅 설치 레코드가 고정되지 않거나 무결성 메타데이터가 누락되거나 현재 설치된 패키지 버전과 드리프트할 때도 경고합니다.
채널 허용 목록이 안정적인 ID 대신 변경 가능한 이름/이메일/태그에 의존할 때 경고합니다 (해당되는 경우 Discord, Slack, Google Chat, Microsoft Teams, Mattermost, IRC 범위).
`gateway.auth.mode="none"`이 공유 비밀 없이 Gateway HTTP API에 접근 가능하게 할 때 경고합니다 (`/tools/invoke` 및 활성화된 `/v1/*` 엔드포인트).
`dangerous`/`dangerously` 접두사가 붙은 설정은 명시적인 브레이크 글래스 운영자 재정의입니다; 하나를 활성화하는 것 자체는 보안 취약성 보고서가 아닙니다.
완전한 위험 매개변수 목록은 [보안](/gateway/security/)의 "안전하지 않거나 위험한 플래그 요약" 섹션을 참조하세요.

SecretRef 동작:

- `security audit`는 대상 경로에 대해 읽기 전용 모드에서 지원되는 SecretRef를 확인합니다.
- 현재 명령 경로에서 SecretRef를 사용할 수 없는 경우 감사는 계속되고 `secretDiagnostics`를 보고합니다 (충돌하는 대신).
- `--token`과 `--password`는 해당 명령 호출에 대한 딥 프로브 인증만 재정의합니다; 구성 또는 SecretRef 매핑을 다시 쓰지 않습니다.

## JSON 출력

CI/정책 확인에 `--json` 사용:

```bash
openclaw security audit --json | jq '.summary'
openclaw security audit --deep --json | jq '.findings[] | select(.severity=="critical") | .checkId'
```

`--fix`와 `--json`을 결합하면 출력에 수정 액션과 최종 보고서가 모두 포함됩니다:

```bash
openclaw security audit --fix --json | jq '{fix: .fix.ok, summary: .report.summary}'
```

## `--fix`가 변경하는 항목

`--fix`는 안전하고 결정론적인 수정을 적용합니다:

- 일반적인 `groupPolicy="open"`을 `groupPolicy="allowlist"`로 전환 (지원되는 채널의 계정 변형 포함)
- WhatsApp 그룹 정책이 `allowlist`로 전환될 때, 해당 목록이 존재하고 구성이 이미 `allowFrom`을 정의하지 않는 경우 저장된 `allowFrom` 파일에서 `groupAllowFrom`을 시드
- `logging.redactSensitive`를 `"off"`에서 `"tools"`로 설정
- 상태/구성 및 일반적인 민감한 파일에 대한 권한 강화 (`credentials/*.json`, `auth-profiles.json`, `sessions.json`, 세션 `*.jsonl`)
- `openclaw.json`에서 참조된 구성 포함 파일도 강화
- POSIX 호스트에서는 `chmod`, Windows에서는 `icacls` 리셋 사용

`--fix`는 다음을 하지 **않습니다**:

- 토큰/비밀번호/API 키 교체
- 툴 비활성화 (`gateway`, `cron`, `exec` 등)
- 게이트웨이 바인드/인증/네트워크 노출 선택 변경
- 플러그인/스킬 제거 또는 재작성
