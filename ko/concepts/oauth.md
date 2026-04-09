---
summary: "OpenClaw의 OAuth: 토큰 교환, 저장, 멀티 계정 패턴"
read_when:
  - OpenClaw OAuth를 처음부터 끝까지 이해하려는 경우
  - 토큰 무효화 / 로그아웃 문제가 발생한 경우
  - Claude CLI 또는 OAuth 인증 흐름을 원하는 경우
  - 여러 계정 또는 프로필 라우팅을 원하는 경우
title: "OAuth"
---

# OAuth

OpenClaw는 이를 제공하는 프로바이더 (특히 **OpenAI Codex (ChatGPT OAuth)**)에 대한 OAuth를 통한 "구독 인증"을 지원합니다. Anthropic의 경우, 현실적인 분리는 다음과 같습니다:

- **Anthropic API 키**: 일반 Anthropic API 청구
- **Anthropic Claude CLI / OpenClaw 내 구독 인증**: Anthropic 직원이 이 사용이 다시 허용된다고 알려주었습니다

OpenAI Codex OAuth는 OpenClaw와 같은 외부 도구에서의 사용을 위해 명시적으로 지원됩니다. 이 페이지는 다음을 설명합니다:

프로덕션에서 Anthropic의 경우, API 키 인증이 더 안전한 권장 경로입니다.

- OAuth **토큰 교환** 작동 방식 (PKCE)
- 토큰이 **저장**되는 위치 (및 이유)
- **여러 계정** 처리 방법 (프로필 + 세션별 오버라이드)

OpenClaw는 자체 OAuth 또는 API 키 흐름을 제공하는 **프로바이더 플러그인**도 지원합니다. 다음을 통해 실행하십시오:

```bash
openclaw models auth login --provider <id>
```

## 토큰 싱크 (존재하는 이유)

OAuth 프로바이더는 일반적으로 로그인/새로 고침 흐름 중에 **새 리프레시 토큰**을 발행합니다. 일부 프로바이더 (또는 OAuth 클라이언트)는 동일한 사용자/앱에 대해 새 토큰이 발행될 때 이전 리프레시 토큰을 무효화할 수 있습니다.

실제 증상:

- OpenClaw와 Claude Code / Codex CLI를 통해 로그인 → 나중에 무작위로 로그아웃됩니다

이를 줄이기 위해 OpenClaw는 `auth-profiles.json`을 **토큰 싱크**로 처리합니다:

- 런타임이 **한 곳**에서 자격 증명을 읽습니다
- 여러 프로필을 유지하고 결정론적으로 라우팅할 수 있습니다
- Codex CLI와 같은 외부 CLI에서 자격 증명을 재사용할 때, OpenClaw는 출처와 함께 미러링하고 리프레시 토큰 자체를 순환하는 대신 해당 외부 소스를 다시 읽습니다

## 저장 (토큰이 있는 위치)

시크릿은 **에이전트별로** 저장됩니다:

- 인증 프로필 (OAuth + API 키 + 선택적 값 수준 참조): `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- 레거시 호환성 파일: `~/.openclaw/agents/<agentId>/agent/auth.json` (발견 시 정적 `api_key` 항목이 제거됨)

레거시 가져오기 전용 파일 (여전히 지원되지만 메인 저장소가 아님):

- `~/.openclaw/credentials/oauth.json` (첫 사용 시 `auth-profiles.json`으로 가져옴)

위의 모든 것은 `$OPENCLAW_STATE_DIR` (상태 디렉터리 오버라이드)도 지원합니다. 전체 참조: [/gateway/configuration](/gateway/configuration-reference#auth-storage)

정적 시크릿 참조 및 런타임 스냅샷 활성화 동작은 [시크릿 관리](/gateway/secrets)를 참조하십시오.

## Anthropic 레거시 토큰 호환성

<Warning>
Anthropic의 공개 Claude Code 문서에 따르면 직접 Claude Code 사용은 Claude 구독 한도 내에 있으며, Anthropic 직원이 OpenClaw 스타일 Claude CLI 사용이 다시 허용된다고 알려주었습니다. 따라서 OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 Claude CLI 재사용 및 `claude -p` 사용을 이 통합에서 허가된 것으로 처리합니다.

Anthropic의 현재 직접 Claude Code 플랜 문서는 [Pro 또는 Max 플랜으로 Claude Code 사용](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan) 및 [Team 또는 Enterprise 플랜으로 Claude Code 사용](https://support.anthropic.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan/)을 참조하십시오.

OpenClaw에서 다른 구독형 옵션을 원하면 [OpenAI Codex](/providers/openai), [Qwen Cloud Coding Plan](/providers/qwen), [MiniMax Coding Plan](/providers/minimax), [Z.AI / GLM Coding Plan](/providers/glm)을 참조하십시오.
</Warning>

OpenClaw는 Anthropic 설정 토큰을 지원되는 토큰 인증 경로로도 노출하지만, 이제 가능한 경우 Claude CLI 재사용 및 `claude -p`를 선호합니다.

## Anthropic Claude CLI 마이그레이션

OpenClaw는 Anthropic Claude CLI 재사용을 다시 지원합니다. 호스트에 로컬 Claude 로그인이 이미 있는 경우, 온보딩/구성이 직접 재사용할 수 있습니다.

## OAuth 교환 (로그인 작동 방식)

OpenClaw의 대화형 로그인 흐름은 `@mariozechner/pi-ai`에 구현되어 마법사/커맨드에 연결됩니다.

### Anthropic 설정 토큰

흐름 형태:

1. OpenClaw에서 Anthropic 설정 토큰 또는 붙여넣기 토큰 시작
2. OpenClaw가 결과 Anthropic 자격 증명을 인증 프로필에 저장
3. 모델 선택은 `anthropic/...`에 유지됨
4. 기존 Anthropic 인증 프로필은 롤백/순서 제어에 계속 사용 가능

### OpenAI Codex (ChatGPT OAuth)

OpenAI Codex OAuth는 OpenClaw 워크플로를 포함하여 Codex CLI 외부에서의 사용을 위해 명시적으로 지원됩니다.

흐름 형태 (PKCE):

1. PKCE verifier/challenge + 랜덤 `state` 생성
2. `https://auth.openai.com/oauth/authorize?...` 열기
3. `http://127.0.0.1:1455/auth/callback`에서 콜백 캡처 시도
4. 콜백을 바인딩할 수 없는 경우 (또는 원격/헤드리스인 경우), 리디렉션 URL/코드 붙여넣기
5. `https://auth.openai.com/oauth/token`에서 교환
6. 액세스 토큰에서 `accountId` 추출 및 `{ access, refresh, expires, accountId }` 저장

마법사 경로는 `openclaw onboard` → 인증 선택 `openai-codex`입니다.

## 새로 고침 + 만료

프로필은 `expires` 타임스탬프를 저장합니다.

런타임에서:

- `expires`가 미래인 경우 → 저장된 액세스 토큰 사용
- 만료된 경우 → 새로 고침 (파일 잠금 아래) 및 저장된 자격 증명 덮어쓰기
- 예외: 재사용된 외부 CLI 자격 증명은 외부에서 관리됩니다. OpenClaw는 CLI 인증 저장소를 다시 읽고 복사된 리프레시 토큰 자체를 사용하지 않습니다

새로 고침 흐름은 자동입니다. 일반적으로 토큰을 수동으로 관리할 필요가 없습니다.

## 여러 계정 (프로필) + 라우팅

두 가지 패턴:

### 1) 권장: 별도 에이전트

"personal"과 "work"가 절대 상호작용하지 않기를 원한다면, 격리된 에이전트 (별도 세션 + 자격 증명 + 워크스페이스)를 사용하십시오:

```bash
openclaw agents add work
openclaw agents add personal
```

그런 다음 에이전트별로 인증을 구성하고 (마법사) 올바른 에이전트로 채팅을 라우팅하십시오.

### 2) 고급: 하나의 에이전트에서 여러 프로필

`auth-profiles.json`은 동일한 프로바이더에 대한 여러 프로필 ID를 지원합니다.

사용할 프로필 선택:

- 구성 순서를 통해 전역으로 (`auth.order`)
- `/model ...@<profileId>`를 통해 세션별로

예시 (세션 오버라이드):

- `/model Opus@anthropic:work`

기존 프로필 ID를 확인하는 방법:

- `openclaw channels list --json` (`auth[]` 표시)

관련 문서:

- [/concepts/model-failover](/concepts/model-failover) (순환 + 쿨다운 규칙)
- [/tools/slash-commands](/tools/slash-commands) (커맨드 표면)

## 관련 항목

- [인증](/gateway/authentication) — 모델 프로바이더 인증 개요
- [시크릿](/gateway/secrets) — 자격 증명 저장 및 SecretRef
- [구성 참조](/gateway/configuration-reference#auth-storage) — 인증 구성 키
