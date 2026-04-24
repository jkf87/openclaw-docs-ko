---
summary: "모델 CLI: list, set, aliases, fallbacks, scan, status"
read_when:
  - 모델 CLI(models list/set/scan/aliases/fallbacks)를 추가하거나 수정할 때
  - 모델 폴백 동작 또는 선택 UX를 변경할 때
  - 모델 스캔 프로브(도구/이미지)를 업데이트할 때
title: "모델 CLI(Models CLI)"
---

Auth 프로파일 로테이션, 쿨다운, 그리고 그것이 폴백과 어떻게 상호작용하는지에
대해서는 [/concepts/model-failover](/concepts/model-failover)를 참고하세요.
프로바이더 개요와 예제: [/concepts/model-providers](/concepts/model-providers).

## 모델 선택 동작 방식

OpenClaw는 다음 순서로 모델을 선택합니다:

1. **Primary** 모델 (`agents.defaults.model.primary` 또는 `agents.defaults.model`).
2. `agents.defaults.model.fallbacks`의 **Fallbacks** (순서대로).
3. **프로바이더 auth 페일오버**는 다음 모델로 이동하기 전에 프로바이더 내부에서
   발생합니다.

관련:

- `agents.defaults.models`는 OpenClaw가 사용할 수 있는 모델의
  allowlist/카탈로그입니다 (alias 포함).
- `agents.defaults.imageModel`은 **primary 모델이 이미지를 받을 수 없을 때**에만
  사용됩니다.
- `agents.defaults.pdfModel`은 `pdf` 도구가 사용합니다. 생략되면 이 도구는
  `agents.defaults.imageModel`, 그 다음 해석된 세션/기본 모델로 폴백합니다.
- `agents.defaults.imageGenerationModel`은 공유 이미지 생성 기능이 사용합니다.
  생략되면 `image_generate`는 여전히 auth 기반 프로바이더 기본값을 추론할 수
  있습니다. 현재 기본 프로바이더를 먼저 시도한 뒤, 나머지 등록된 이미지 생성
  프로바이더를 provider-id 순서로 시도합니다. 특정 provider/model을 설정했다면
  해당 프로바이더의 auth/API 키도 설정하세요.
- `agents.defaults.musicGenerationModel`은 공유 음악 생성 기능이 사용합니다.
  생략되면 `music_generate`는 여전히 auth 기반 프로바이더 기본값을 추론할 수
  있습니다. 현재 기본 프로바이더를 먼저 시도한 뒤, 나머지 등록된 음악 생성
  프로바이더를 provider-id 순서로 시도합니다. 특정 provider/model을 설정했다면
  해당 프로바이더의 auth/API 키도 설정하세요.
- `agents.defaults.videoGenerationModel`은 공유 비디오 생성 기능이 사용합니다.
  생략되면 `video_generate`는 여전히 auth 기반 프로바이더 기본값을 추론할 수
  있습니다. 현재 기본 프로바이더를 먼저 시도한 뒤, 나머지 등록된 비디오 생성
  프로바이더를 provider-id 순서로 시도합니다. 특정 provider/model을 설정했다면
  해당 프로바이더의 auth/API 키도 설정하세요.
- 에이전트별 기본값은 `agents.list[].model`과 바인딩을 통해
  `agents.defaults.model`을 오버라이드할 수 있습니다
  ([/concepts/multi-agent](/concepts/multi-agent) 참고).

## 빠른 모델 정책

- primary는 사용 가능한 가장 강력한 최신 세대 모델로 설정하세요.
- 비용/지연에 민감한 작업과 낮은 리스크의 채팅에는 fallback을 사용하세요.
- 도구 활성 에이전트나 신뢰할 수 없는 입력에는 구형/약한 모델 티어를 피하세요.

## 온보딩 (권장)

config를 직접 편집하고 싶지 않다면 온보딩을 실행하세요:

```bash
openclaw onboard
```

**OpenAI Code (Codex) 구독**(OAuth)과 **Anthropic**(API 키 또는 Claude CLI)을
포함한 일반적인 프로바이더에 대해 모델 + auth를 설정할 수 있습니다.

## 설정 키 (개요)

- `agents.defaults.model.primary` 및 `agents.defaults.model.fallbacks`
- `agents.defaults.imageModel.primary` 및 `agents.defaults.imageModel.fallbacks`
- `agents.defaults.pdfModel.primary` 및 `agents.defaults.pdfModel.fallbacks`
- `agents.defaults.imageGenerationModel.primary` 및 `agents.defaults.imageGenerationModel.fallbacks`
- `agents.defaults.videoGenerationModel.primary` 및 `agents.defaults.videoGenerationModel.fallbacks`
- `agents.defaults.models` (allowlist + aliases + provider params)
- `models.providers` (`models.json`에 기록되는 커스텀 프로바이더)

모델 ref는 소문자로 정규화됩니다. `z.ai/*` 같은 프로바이더 alias는 `zai/*`로
정규화됩니다.

OpenCode를 포함한 프로바이더 설정 예제는
[/providers/opencode](/providers/opencode)에 있습니다.

### 안전한 allowlist 편집

`agents.defaults.models`를 수동으로 업데이트할 때는 추가(additive) 쓰기를
사용하세요:

```bash
openclaw config set agents.defaults.models '{"openai/gpt-5.4":{}}' --strict-json --merge
```

`openclaw config set`은 모델/프로바이더 맵이 실수로 덮어쓰기(clobber)되는
것으로부터 보호합니다. `agents.defaults.models`, `models.providers`, 또는
`models.providers.<id>.models`에 대한 일반 객체 할당은 기존 항목을 제거하는
경우 거부됩니다. 추가 변경에는 `--merge`를 사용하고, 제공된 값이 완전한
대상 값이 되어야 할 때만 `--replace`를 사용하세요.

대화형 프로바이더 설정과 `openclaw configure --section model`도
프로바이더 범위 선택을 기존 allowlist에 병합합니다. 그래서 Codex, Ollama,
또는 다른 프로바이더를 추가해도 관련 없는 모델 항목이 떨어지지 않습니다.

## "Model is not allowed" (그리고 왜 응답이 멈추는지)

`agents.defaults.models`가 설정되어 있으면, 그것이 `/model`과 세션 오버라이드에
대한 **allowlist**가 됩니다. 사용자가 그 allowlist에 없는 모델을 선택하면,
OpenClaw는 다음을 반환합니다:

```
Model "provider/model" is not allowed. Use /model to list available models.
```

이는 일반적인 응답이 생성되기 **전에** 발생하므로, 메시지가 "응답하지 않은"
것처럼 느껴질 수 있습니다. 해결 방법은 다음 중 하나입니다:

- 모델을 `agents.defaults.models`에 추가, 또는
- allowlist 비우기(`agents.defaults.models` 제거), 또는
- `/model list`에서 모델 선택.

allowlist config 예시:

```json5
{
  agent: {
    model: { primary: "anthropic/claude-sonnet-4-6" },
    models: {
      "anthropic/claude-sonnet-4-6": { alias: "Sonnet" },
      "anthropic/claude-opus-4-6": { alias: "Opus" },
    },
  },
}
```

## 채팅에서 모델 전환하기 (`/model`)

재시작 없이 현재 세션의 모델을 전환할 수 있습니다:

```
/model
/model list
/model 3
/model openai/gpt-5.4
/model status
```

참고 사항:

- `/model`(과 `/model list`)은 콤팩트한 번호 매김 피커입니다 (모델 패밀리 +
  사용 가능한 프로바이더).
- Discord에서는 `/model`과 `/models`가 프로바이더 및 모델 드롭다운과 Submit
  단계가 있는 대화형 피커를 엽니다.
- `/models add`는 기본적으로 사용 가능하며 `commands.modelsWrite=false`로
  비활성화할 수 있습니다.
- 활성화되면 `/models add <provider> <modelId>`가 가장 빠른 경로입니다; 단독
  `/models add`는 지원되는 곳에서 프로바이더 우선 가이드 플로우를 시작합니다.
- `/models add` 이후, 새 모델은 게이트웨이 재시작 없이 `/models`와 `/model`에서
  사용 가능해집니다.
- `/model <#>`는 해당 피커에서 선택합니다.
- `/model`은 새 세션 선택을 즉시 영속화합니다.
- 에이전트가 idle 상태라면, 다음 실행이 곧바로 새 모델을 사용합니다.
- 실행이 이미 활성이라면, OpenClaw는 live switch를 pending으로 표시하고
  clean retry point에서만 새 모델로 재시작합니다.
- 도구 활동이나 응답 출력이 이미 시작되었다면, pending switch는 이후 retry
  기회나 다음 사용자 턴까지 큐잉된 상태로 남을 수 있습니다.
- `/model status`는 상세 뷰입니다 (auth 후보와, 설정된 경우 provider endpoint
  `baseUrl` + `api` mode).
- 모델 ref는 **첫 번째** `/`를 기준으로 분할하여 파싱됩니다. `/model <ref>`를
  입력할 때는 `provider/model`을 사용하세요.
- 모델 ID 자체에 `/`가 포함된 경우(OpenRouter 스타일), 프로바이더 프리픽스를
  포함해야 합니다 (예: `/model openrouter/moonshotai/kimi-k2`).
- 프로바이더를 생략하면, OpenClaw는 다음 순서로 입력을 해석합니다:
  1. alias 매치
  2. 해당 unprefixed 모델 id와 정확히 일치하는 유일한 configured-provider
  3. configured default provider로의 deprecated 폴백
     해당 provider가 더 이상 configured default model을 노출하지 않는다면,
     OpenClaw는 stale한 제거된 provider 기본값을 노출하지 않기 위해 첫 번째
     configured provider/model로 폴백합니다.

전체 명령 동작/설정: [슬래시 명령](/tools/slash-commands).

예시:

```text
/models add
/models add ollama glm-5.1:cloud
/models add lmstudio qwen/qwen3.5-9b
```

## CLI 명령

```bash
openclaw models list
openclaw models status
openclaw models set <provider/model>
openclaw models set-image <provider/model>

openclaw models aliases list
openclaw models aliases add <alias> <provider/model>
openclaw models aliases remove <alias>

openclaw models fallbacks list
openclaw models fallbacks add <provider/model>
openclaw models fallbacks remove <provider/model>
openclaw models fallbacks clear

openclaw models image-fallbacks list
openclaw models image-fallbacks add <provider/model>
openclaw models image-fallbacks remove <provider/model>
openclaw models image-fallbacks clear
```

`openclaw models`(서브커맨드 없음)는 `models status`의 단축키입니다.

### `models list`

기본적으로 설정된 모델을 보여줍니다. 유용한 플래그:

- `--all`: 전체 카탈로그
- `--local`: 로컬 프로바이더만
- `--provider <id>`: 프로바이더 id로 필터링, 예: `moonshot`; 대화형 피커의
  표시 레이블은 허용되지 않습니다
- `--plain`: 한 줄에 하나의 모델
- `--json`: 기계 판독 가능한 출력

`--all`은 auth가 설정되기 전에 번들된 provider-owned static catalog 행을
포함하므로, 디스커버리 전용 뷰에서는 일치하는 프로바이더 자격 증명을
추가하기 전까지 사용할 수 없는 모델까지 보여줄 수 있습니다.

### `models status`

해석된 primary 모델, fallbacks, 이미지 모델, 그리고 설정된 프로바이더의
auth 개요를 보여줍니다. 또한 auth store에서 발견된 프로파일의 OAuth 만료
상태를 노출합니다 (기본적으로 24시간 이내 경고). `--plain`은 해석된
primary 모델만 출력합니다.
OAuth 상태는 항상 표시됩니다 (그리고 `--json` 출력에 포함됨). 설정된
프로바이더에 자격 증명이 없으면, `models status`는 **Missing auth** 섹션을
출력합니다.
JSON은 `auth.oauth`(warn window + profiles)와 `auth.providers`(env 지원
자격 증명을 포함한 프로바이더별 effective auth)를 포함합니다. `auth.oauth`는
auth-store 프로파일 건강 상태만 해당합니다; env-only 프로바이더는 거기에
나타나지 않습니다.
자동화에는 `--check`를 사용하세요 (missing/expired일 때 exit `1`, expiring일
때 `2`).
라이브 auth 체크에는 `--probe`를 사용하세요; probe 행은 auth 프로파일,
env 자격 증명, 또는 `models.json`에서 올 수 있습니다.
명시적 `auth.order.<provider>`가 저장된 프로파일을 생략하면, probe는
해당 프로파일을 시도하는 대신 `excluded_by_auth_order`를 보고합니다.
auth는 존재하지만 해당 프로바이더에 대해 프로브 가능한 모델이 해석될 수
없으면, probe는 `status: no_model`을 보고합니다.

Auth 선택은 프로바이더/계정에 따라 다릅니다. 항상 켜져 있는 게이트웨이
호스트의 경우, API 키가 보통 가장 예측 가능합니다; Claude CLI 재사용과
기존 Anthropic OAuth/token 프로파일도 지원됩니다.

예시 (Claude CLI):

```bash
claude auth login
openclaw models status
```

## 스캐닝 (OpenRouter 무료 모델)

`openclaw models scan`은 OpenRouter의 **무료 모델 카탈로그**를 검사하고,
선택적으로 모델의 도구 및 이미지 지원 여부를 프로브할 수 있습니다.

주요 플래그:

- `--no-probe`: 라이브 프로브 건너뛰기 (메타데이터만)
- `--min-params <b>`: 최소 파라미터 크기 (단위: 십억)
- `--max-age-days <days>`: 오래된 모델 건너뛰기
- `--provider <name>`: 프로바이더 프리픽스 필터
- `--max-candidates <n>`: fallback 리스트 크기
- `--set-default`: `agents.defaults.model.primary`를 첫 선택으로 설정
- `--set-image`: `agents.defaults.imageModel.primary`를 첫 이미지 선택으로 설정

프로빙에는 OpenRouter API 키가 필요합니다 (auth 프로파일 또는
`OPENROUTER_API_KEY`에서). 키가 없으면 `--no-probe`를 사용해 후보만 나열하세요.

스캔 결과는 다음 기준으로 순위가 매겨집니다:

1. 이미지 지원
2. 도구 지연 시간
3. 컨텍스트 크기
4. 파라미터 수

입력

- OpenRouter `/models` 리스트 (필터 `:free`)
- auth 프로파일 또는 `OPENROUTER_API_KEY`의 OpenRouter API 키 필요
  ([/environment](/help/environment) 참고)
- 선택적 필터: `--max-age-days`, `--min-params`, `--provider`, `--max-candidates`
- 프로브 컨트롤: `--timeout`, `--concurrency`

TTY에서 실행하면 fallbacks를 대화형으로 선택할 수 있습니다. 비대화형
모드에서는 기본값을 수락하려면 `--yes`를 전달하세요.

## 모델 레지스트리 (`models.json`)

`models.providers`의 커스텀 프로바이더는 에이전트 디렉터리 아래
`models.json`에 기록됩니다 (기본값 `~/.openclaw/agents/<agentId>/agent/models.json`).
이 파일은 `models.mode`가 `replace`로 설정되지 않는 한 기본적으로 병합됩니다.

일치하는 프로바이더 ID에 대한 병합 모드 우선순위:

- 에이전트 `models.json`에 이미 존재하는 비어 있지 않은 `baseUrl`이 이깁니다.
- 에이전트 `models.json`의 비어 있지 않은 `apiKey`는 해당 프로바이더가 현재
  config/auth-profile 컨텍스트에서 SecretRef 관리되지 않는 경우에만 이깁니다.
- SecretRef 관리 프로바이더의 `apiKey` 값은 해석된 secret을 영속화하는 대신
  source marker(환경 ref의 경우 `ENV_VAR_NAME`, 파일/exec ref의 경우
  `secretref-managed`)에서 갱신됩니다.
- SecretRef 관리 프로바이더의 헤더 값은 source marker(환경 ref의 경우
  `secretref-env:ENV_VAR_NAME`, 파일/exec ref의 경우 `secretref-managed`)에서
  갱신됩니다.
- 비어 있거나 누락된 에이전트 `apiKey`/`baseUrl`은 config `models.providers`로
  폴백합니다.
- 다른 프로바이더 필드는 config와 정규화된 카탈로그 데이터로부터 갱신됩니다.

Marker 영속화는 source-authoritative입니다: OpenClaw는 해석된 런타임 secret
값이 아니라 활성 source config 스냅샷(해석 이전)에서 marker를 작성합니다.
이는 `openclaw agent` 같은 명령 기반 경로를 포함해 OpenClaw가 `models.json`을
재생성할 때마다 적용됩니다.

## 관련 문서

- [모델 프로바이더](/concepts/model-providers) — 프로바이더 라우팅과 auth
- [모델 페일오버](/concepts/model-failover) — 폴백 체인
- [이미지 생성](/tools/image-generation) — 이미지 모델 설정
- [음악 생성](/tools/music-generation) — 음악 모델 설정
- [비디오 생성](/tools/video-generation) — 비디오 모델 설정
- [설정 레퍼런스](/gateway/config-agents#agent-defaults) — 모델 설정 키
