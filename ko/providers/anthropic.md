---
summary: "OpenClaw에서 API 키 또는 Claude CLI로 Anthropic Claude 사용"
read_when:
  - OpenClaw에서 Anthropic 모델을 사용하려는 경우
title: "Anthropic"
---

# Anthropic (Claude)

Anthropic은 **Claude** 모델 패밀리를 개발하며 API 및 Claude CLI를 통해 액세스를 제공합니다. OpenClaw에서는 Anthropic API 키와 Claude CLI 재사용이 모두 지원됩니다. 이미 구성된 기존 레거시 Anthropic 토큰 프로필은 런타임에서 계속 유효합니다.

<Warning>
Anthropic 직원들이 OpenClaw 스타일의 Claude CLI 사용이 다시 허용된다고 알려왔습니다. 따라서 OpenClaw는 Anthropic이 새로운 정책을 게시하지 않는 한 Claude CLI 재사용 및 `claude -p` 사용을 이 통합에서 승인된 것으로 취급합니다.

장기 운영 게이트웨이 호스트의 경우, Anthropic API 키가 여전히 가장 명확하고 예측 가능한 프로덕션 경로입니다. 호스트에서 이미 Claude CLI를 사용 중이라면, OpenClaw가 해당 로그인을 직접 재사용할 수 있습니다.

Anthropic의 현재 공개 문서:

- [Claude Code CLI 참조](https://code.claude.com/docs/en/cli-reference)
- [Claude Agent SDK 개요](https://platform.claude.com/docs/en/agent-sdk/overview)

- [Pro 또는 Max 플랜으로 Claude Code 사용하기](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan)
- [Team 또는 Enterprise 플랜으로 Claude Code 사용하기](https://support.anthropic.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan/)

가장 명확한 청구 경로를 원한다면 Anthropic API 키를 사용하십시오.
OpenClaw는 [OpenAI Codex](/providers/openai), [Qwen Cloud Coding Plan](/providers/qwen),
[MiniMax Coding Plan](/providers/minimax), [Z.AI / GLM Coding Plan](/providers/glm)을 포함한 다른 구독 방식 옵션도 지원합니다.
</Warning>

## 옵션 A: Anthropic API 키

**적합한 경우:** 표준 API 액세스 및 사용량 기반 청구.
Anthropic Console에서 API 키를 생성하십시오.

### CLI 설정

```bash
openclaw onboard
# 선택: Anthropic API key

# 또는 비대화형
openclaw onboard --anthropic-api-key "$ANTHROPIC_API_KEY"
```

### Anthropic 구성 스니펫

```json5
{
  env: { ANTHROPIC_API_KEY: "sk-ant-..." },
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-6" } } },
}
```

## 사고 기본값 (Claude 4.6)

- Anthropic Claude 4.6 모델은 사고 수준이 명시적으로 설정되지 않은 경우 OpenClaw에서 기본적으로 `adaptive` 사고를 사용합니다.
- 메시지별 (`/think:<level>`) 또는 모델 파라미터에서 재정의할 수 있습니다:
  `agents.defaults.models["anthropic/<model>"].params.thinking`.
- 관련 Anthropic 문서:
  - [적응형 사고](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
  - [확장된 사고](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)

## 빠른 모드 (Anthropic API)

OpenClaw의 공유 `/fast` 토글은 API 키 및 OAuth 인증 요청을 포함한 직접 공개 Anthropic 트래픽도 지원합니다.

- `/fast on`은 `service_tier: "auto"`로 매핑됩니다
- `/fast off`는 `service_tier: "standard_only"`로 매핑됩니다
- 구성 기본값:

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-sonnet-4-6": {
          params: { fastMode: true },
        },
      },
    },
  },
}
```

중요한 제한 사항:

- OpenClaw는 직접 `api.anthropic.com` 요청에만 Anthropic 서비스 티어를 주입합니다. `anthropic/*`를 프록시나 게이트웨이를 통해 라우팅하는 경우, `/fast`는 `service_tier`를 변경하지 않습니다.
- 명시적인 Anthropic `serviceTier` 또는 `service_tier` 모델 파라미터는 양쪽이 모두 설정된 경우 `/fast` 기본값을 재정의합니다.
- Anthropic은 응답의 `usage.service_tier`에서 유효 티어를 보고합니다. Priority Tier 용량이 없는 계정에서는 `service_tier: "auto"`가 `standard`로 처리될 수 있습니다.

## 프롬프트 캐싱 (Anthropic API)

OpenClaw는 Anthropic의 프롬프트 캐싱 기능을 지원합니다. 이 기능은 **API 전용**입니다; 레거시 Anthropic 토큰 인증은 캐시 설정을 준수하지 않습니다.

### 구성

모델 구성에서 `cacheRetention` 파라미터를 사용하십시오:

| 값      | 캐시 기간 | 설명                   |
| ------- | --------- | ---------------------- |
| `none`  | 캐싱 없음 | 프롬프트 캐싱 비활성화 |
| `short` | 5분       | API 키 인증 기본값     |
| `long`  | 1시간     | 확장 캐시              |

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": {
          params: { cacheRetention: "long" },
        },
      },
    },
  },
}
```

### 기본값

Anthropic API 키 인증을 사용하는 경우, OpenClaw는 모든 Anthropic 모델에 대해 자동으로 `cacheRetention: "short"` (5분 캐시)를 적용합니다. 구성에서 `cacheRetention`을 명시적으로 설정하여 이를 재정의할 수 있습니다.

### 에이전트별 cacheRetention 재정의

모델 수준 파라미터를 기준선으로 사용한 후 `agents.list[].params`를 통해 특정 에이전트를 재정의하십시오.

```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-opus-4-6" },
      models: {
        "anthropic/claude-opus-4-6": {
          params: { cacheRetention: "long" }, // 대부분의 에이전트 기준선
        },
      },
    },
    list: [
      { id: "research", default: true },
      { id: "alerts", params: { cacheRetention: "none" } }, // 이 에이전트만 재정의
    ],
  },
}
```

캐시 관련 파라미터의 구성 병합 순서:

1. `agents.defaults.models["provider/model"].params`
2. `agents.list[].params` (`id` 일치, 키별 재정의)

이를 통해 하나의 에이전트는 장기 캐시를 유지하고 동일 모델의 다른 에이전트는 급격한/낮은 재사용 트래픽에 대한 쓰기 비용을 줄이기 위해 캐싱을 비활성화할 수 있습니다.

### Bedrock Claude 참고 사항

- Bedrock의 Anthropic Claude 모델 (`amazon-bedrock/*anthropic.claude*`)은 구성된 경우 `cacheRetention` 전달을 허용합니다.
- Anthropic이 아닌 Bedrock 모델은 런타임에서 `cacheRetention: "none"`으로 강제 설정됩니다.
- Anthropic API 키 스마트 기본값도 명시적 값이 설정되지 않은 경우 Bedrock의 Claude 모델 참조에 대해 `cacheRetention: "short"`를 시드합니다.

## 1M 컨텍스트 창 (Anthropic 베타)

Anthropic의 1M 컨텍스트 창은 베타로 제한됩니다. OpenClaw에서 지원되는 Opus/Sonnet 모델에 대해 `params.context1m: true`로 모델별로 활성화하십시오.

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": {
          params: { context1m: true },
        },
      },
    },
  },
}
```

OpenClaw는 이를 Anthropic 요청의 `anthropic-beta: context-1m-2025-08-07`로 매핑합니다.

이는 해당 모델에 대해 `params.context1m`이 명시적으로 `true`로 설정된 경우에만 활성화됩니다.

요구 사항: Anthropic이 해당 자격 증명에서 긴 컨텍스트 사용을 허용해야 합니다.

참고: Anthropic은 현재 레거시 Anthropic 토큰 인증 (`sk-ant-oat-*`)을 사용하는 경우 `context-1m-*` 베타 요청을 거부합니다. 해당 레거시 인증 모드로 `context1m: true`를 구성하면, OpenClaw는 경고를 기록하고 필요한 OAuth 베타를 유지하면서 context1m 베타 헤더를 건너뜀으로써 표준 컨텍스트 창으로 폴백합니다.

## Claude CLI 백엔드

번들 Anthropic `claude-cli` 백엔드는 OpenClaw에서 지원됩니다.

- Anthropic 직원들이 이 사용이 다시 허용된다고 알려왔습니다.
- 따라서 OpenClaw는 Anthropic이 새로운 정책을 게시하지 않는 한 Claude CLI 재사용 및 `claude -p` 사용을 이 통합에서 승인된 것으로 취급합니다.
- Anthropic API 키는 항상 켜져 있는 게이트웨이 호스트와 명시적인 서버 측 청구 제어를 위한 가장 명확한 프로덕션 경로입니다.
- 설정 및 런타임 세부 정보는 [/gateway/cli-backends](/gateway/cli-backends)에 있습니다.

## 참고 사항

- Anthropic의 공개 Claude Code 문서는 `claude -p`와 같은 직접 CLI 사용을 여전히 문서화하고 있으며, Anthropic 직원들은 OpenClaw 스타일의 Claude CLI 사용이 다시 허용된다고 알려왔습니다. Anthropic이 새로운 정책 변경을 게시하지 않는 한 이 지침은 확정된 것으로 취급합니다.
- Anthropic 설정 토큰은 OpenClaw에서 지원되는 토큰 인증 경로로 계속 사용 가능하지만, OpenClaw는 이제 사용 가능한 경우 Claude CLI 재사용 및 `claude -p`를 선호합니다.
- 인증 세부 정보 + 재사용 규칙은 [/concepts/oauth](/concepts/oauth)에 있습니다.

## 문제 해결

**401 오류 / 토큰이 갑자기 유효하지 않음**

- Anthropic 토큰 인증은 만료되거나 취소될 수 있습니다.
- 새 설정의 경우 Anthropic API 키로 마이그레이션하십시오.

**프로바이더 "anthropic"에 대한 API 키를 찾을 수 없음**

- 인증은 **에이전트별**입니다. 새 에이전트는 메인 에이전트의 키를 상속하지 않습니다.
- 해당 에이전트의 온보딩을 다시 실행하거나, 게이트웨이 호스트에서 API 키를 구성한 후 `openclaw models status`로 확인하십시오.

**프로필 `anthropic:default`에 대한 자격 증명을 찾을 수 없음**

- `openclaw models status`를 실행하여 활성 인증 프로필을 확인하십시오.
- 온보딩을 다시 실행하거나, 해당 프로필 경로에 대한 API 키를 구성하십시오.

**사용 가능한 인증 프로필 없음 (모두 쿨다운/사용 불가)**

- `openclaw models status --json`에서 `auth.unusableProfiles`를 확인하십시오.
- Anthropic 속도 제한 쿨다운은 모델 범위일 수 있으므로, 현재 모델이 쿨다운 중이더라도 동일 Anthropic의 다른 모델은 여전히 사용 가능할 수 있습니다.
- 다른 Anthropic 프로필을 추가하거나 쿨다운이 끝날 때까지 기다리십시오.

자세한 내용: [/gateway/troubleshooting](/gateway/troubleshooting) 및 [/help/faq](/help/faq).
