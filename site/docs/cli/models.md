---
title: "models"
description: "`openclaw models`에 대한 CLI 참조 (status/list/set/scan, 별칭, 폴백, 인증)"
---

# `openclaw models`

모델 검색, 스캔, 구성 (기본 모델, 폴백, 인증 프로필).

관련:

- 프로바이더 + 모델: [모델](/providers/models)
- 프로바이더 인증 설정: [시작하기](/start/getting-started)

## 일반 명령

```bash
openclaw models status
openclaw models list
openclaw models set &lt;model-or-alias&gt;
openclaw models scan
```

`openclaw models status`는 확인된 기본/폴백과 인증 개요를 표시합니다.
프로바이더 사용 스냅샷을 사용할 수 있는 경우 OAuth/API 키 상태 섹션에는
프로바이더 사용 창과 할당량 스냅샷이 포함됩니다.
현재 사용 창 프로바이더: Anthropic, GitHub Copilot, Gemini CLI, OpenAI
Codex, MiniMax, Xiaomi, z.ai. 사용 인증은 가능한 경우 프로바이더별 훅에서 가져옵니다;
그렇지 않으면 OpenClaw는 인증 프로필, 환경, 또는 구성에서 일치하는 OAuth/API 키
자격 증명으로 폴백합니다.
`--json` 출력에서 `auth.providers`는 환경/구성/저장소 인식 프로바이더
개요이고, `auth.oauth`는 인증 저장소 프로필 상태만입니다.
각 구성된 프로바이더 프로필에 대한 라이브 인증 프로브를 실행하려면 `--probe`를 추가하세요.
프로브는 실제 요청입니다 (토큰을 소비하고 속도 제한을 트리거할 수 있습니다).
구성된 에이전트의 모델/인증 상태를 검사하려면 `--agent &lt;id&gt;`를 사용하세요. 생략하면
명령은 `OPENCLAW_AGENT_DIR`/`PI_CODING_AGENT_DIR`이 설정된 경우 이를 사용하고, 그렇지 않으면
구성된 기본 에이전트를 사용합니다.
프로브 행은 인증 프로필, 환경 자격 증명, 또는 `models.json`에서 가져올 수 있습니다.

참고사항:

- `models set &lt;model-or-alias&gt;`는 `provider/model` 또는 별칭을 허용합니다.
- 모델 참조는 **첫 번째** `/`를 기준으로 분리됩니다. 모델 ID에 `/`가 포함된 경우 (OpenRouter 스타일) 프로바이더 접두사를 포함하세요 (예: `openrouter/moonshotai/kimi-k2`).
- 프로바이더를 생략하면 OpenClaw는 입력을 별칭으로 먼저 확인하고, 그런 다음 해당 정확한 모델 id에 대한 고유한 구성된 프로바이더 일치로 확인하며, 그 다음에만 더 이상 사용되지 않는다는 경고와 함께 구성된 기본 프로바이더로 폴백합니다.
  해당 프로바이더가 더 이상 구성된 기본 모델을 노출하지 않으면 OpenClaw는 오래된 제거된 프로바이더 기본값을 표면화하는 대신 첫 번째 구성된 프로바이더/모델로 폴백합니다.
- `models status`는 비밀이 아닌 플레이스홀더 (예: `OPENAI_API_KEY`, `secretref-managed`, `minimax-oauth`, `oauth:chutes`, `ollama-local`)에 대해 인증 출력에서 `marker(&lt;value&gt;)`를 표시할 수 있습니다.

### `models status`

옵션:

- `--json`
- `--plain`
- `--check` (exit 1=만료됨/없음, 2=만료 예정)
- `--probe` (구성된 인증 프로필의 라이브 프로브)
- `--probe-provider &lt;name&gt;` (하나의 프로바이더 프로브)
- `--probe-profile &lt;id&gt;` (반복 또는 쉼표로 구분된 프로필 id)
- `--probe-timeout &lt;ms&gt;`
- `--probe-concurrency &lt;n&gt;`
- `--probe-max-tokens &lt;n&gt;`
- `--agent &lt;id&gt;` (구성된 에이전트 id; `OPENCLAW_AGENT_DIR`/`PI_CODING_AGENT_DIR` 재정의)

프로브 상태 버킷:

- `ok`
- `auth`
- `rate_limit`
- `billing`
- `timeout`
- `format`
- `unknown`
- `no_model`

예상할 프로브 세부 정보/이유 코드 경우:

- `excluded_by_auth_order`: 저장된 프로필이 존재하지만 명시적 `auth.order.&lt;provider&gt;`가 이를 생략하므로 프로브는 시도하는 대신 제외를 보고합니다.
- `missing_credential`, `invalid_expires`, `expired`, `unresolved_ref`: 프로필이 존재하지만 적격하지 않거나 확인 가능하지 않습니다.
- `no_model`: 프로바이더 인증이 존재하지만 OpenClaw가 해당 프로바이더에 대한 프로브 가능한 모델 후보를 확인할 수 없습니다.

## 별칭 + 폴백

```bash
openclaw models aliases list
openclaw models fallbacks list
```

## 인증 프로필

```bash
openclaw models auth add
openclaw models auth login --provider &lt;id&gt;
openclaw models auth setup-token --provider &lt;id&gt;
openclaw models auth paste-token
```

`models auth add`는 인터랙티브 인증 도우미입니다. 선택한 프로바이더에 따라 프로바이더 인증 흐름 (OAuth/API 키)을 시작하거나 수동 토큰 붙여넣기로 안내할 수 있습니다.

`models auth login`은 프로바이더 플러그인의 인증 흐름 (OAuth/API 키)을 실행합니다. 어떤 프로바이더가 설치되어 있는지 확인하려면 `openclaw plugins list`를 사용하세요.

예시:

```bash
openclaw models auth login --provider openai-codex --set-default
```

참고사항:

- `setup-token`과 `paste-token`은 토큰 인증 방법을 노출하는 프로바이더를 위한 일반 토큰 명령으로 유지됩니다.
- `setup-token`은 인터랙티브 TTY가 필요하며 프로바이더의 토큰 인증 방법을 실행합니다 (프로바이더가 `setup-token` 메서드를 노출하는 경우 해당 방법을 기본값으로 사용).
- `paste-token`은 다른 곳에서 생성된 또는 자동화에서 생성된 토큰 문자열을 허용합니다.
- `paste-token`은 `--provider`가 필요하고, 토큰 값을 프롬프트하며, `--profile-id`를 전달하지 않으면 기본 프로필 id `&lt;provider&gt;:manual`에 씁니다.
- `paste-token --expires-in &lt;duration&gt;`은 `365d` 또는 `12h`와 같은 상대 기간으로부터 절대 토큰 만료를 저장합니다.
- Anthropic 참고: Anthropic 직원들이 OpenClaw 스타일 Claude CLI 사용이 다시 허용된다고 알려줬으므로, OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 Claude CLI 재사용 및 `claude -p` 사용을 이 통합에 대해 허가된 것으로 처리합니다.
- Anthropic `setup-token` / `paste-token`은 지원되는 OpenClaw 토큰 경로로 남아 있지만, OpenClaw는 이제 사용 가능한 경우 Claude CLI 재사용 및 `claude -p`를 선호합니다.
