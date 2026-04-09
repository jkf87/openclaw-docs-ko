---
summary: "모델 인증: OAuth, API 키, Claude CLI 재사용, Anthropic setup-token"
read_when:
  - 모델 인증 또는 OAuth 만료 디버깅 시
  - 인증 또는 자격 증명 저장소 문서화 시
title: "인증"
---

# 인증 (모델 프로바이더)

<Note>
이 페이지는 **모델 프로바이더** 인증(API 키, OAuth, Claude CLI 재사용, Anthropic setup-token)을 다룹니다. **게이트웨이 연결** 인증(token, password, trusted-proxy)에 대해서는 [구성](/gateway/configuration) 및 [신뢰할 수 있는 프록시 인증](/gateway/trusted-proxy-auth)을 참조하십시오.
</Note>

OpenClaw는 모델 프로바이더에 대해 OAuth와 API 키를 지원합니다. 상시 실행 게이트웨이 호스트의 경우, API 키가 일반적으로 가장 예측 가능한 옵션입니다. 구독/OAuth 흐름도 프로바이더 계정 모델에 맞는 경우 지원됩니다.

전체 OAuth 흐름 및 저장소 레이아웃은 [/concepts/oauth](/concepts/oauth)를 참조하십시오.
SecretRef 기반 인증(`env`/`file`/`exec` 프로바이더)에 대해서는 [시크릿 관리](/gateway/secrets)를 참조하십시오.
`models status --probe`가 사용하는 자격 증명 적격성/이유 코드 규칙에 대해서는
[인증 자격 증명 시맨틱](/auth-credential-semantics)을 참조하십시오.

## 권장 설정 (API 키, 모든 프로바이더)

장기 실행 게이트웨이를 운영하는 경우, 선택한 프로바이더의 API 키로 시작하십시오.
Anthropic의 경우, API 키 인증이 여전히 가장 예측 가능한 서버 설정이지만, OpenClaw는 로컬 Claude CLI 로그인 재사용도 지원합니다.

1. 프로바이더 콘솔에서 API 키를 생성합니다.
2. **게이트웨이 호스트**(`openclaw gateway`를 실행하는 머신)에 넣습니다.

```bash
export <PROVIDER>_API_KEY="..."
openclaw models status
```

3. 게이트웨이가 systemd/launchd에서 실행되는 경우, 데몬이 읽을 수 있도록
   키를 `~/.openclaw/.env`에 넣는 것을 권장합니다:

```bash
cat >> ~/.openclaw/.env <<'EOF'
<PROVIDER>_API_KEY=...
EOF
```

그런 다음 데몬을 재시작(또는 게이트웨이 프로세스를 재시작)하고 다시 확인합니다:

```bash
openclaw models status
openclaw doctor
```

환경 변수를 직접 관리하고 싶지 않다면, 온보딩이 데몬 사용을 위한 API 키를 저장할 수 있습니다: `openclaw onboard`.

환경 상속(`env.shellEnv`, `~/.openclaw/.env`, systemd/launchd)에 대한 자세한 내용은 [도움말](/help)을 참조하십시오.

## Anthropic: Claude CLI 및 토큰 호환성

Anthropic setup-token 인증은 지원되는 토큰 경로로 OpenClaw에서 여전히 사용 가능합니다. Anthropic 직원은 OpenClaw 스타일의 Claude CLI 사용이 다시 허용된다고 밝혔으므로, OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 Claude CLI 재사용과 `claude -p` 사용을 이 통합에 대해 허가된 것으로 취급합니다. 호스트에서 Claude CLI 재사용이 가능한 경우, 이제 이것이 선호하는 경로입니다.

장기 실행 게이트웨이 호스트의 경우, Anthropic API 키가 여전히 가장 예측 가능한 설정입니다. 동일한 호스트의 기존 Claude 로그인을 재사용하려면, 온보딩/구성에서 Anthropic Claude CLI 경로를 사용하십시오.

수동 토큰 입력 (모든 프로바이더; `auth-profiles.json` 작성 + 구성 업데이트):

```bash
openclaw models auth paste-token --provider openrouter
```

정적 자격 증명에 대한 인증 프로파일 refs도 지원됩니다:

- `api_key` 자격 증명은 `keyRef: { source, provider, id }`를 사용할 수 있습니다
- `token` 자격 증명은 `tokenRef: { source, provider, id }`를 사용할 수 있습니다
- OAuth 모드 프로파일은 SecretRef 자격 증명을 지원하지 않습니다; `auth.profiles.<id>.mode`가 `"oauth"`로 설정된 경우, 해당 프로파일에 대한 SecretRef 기반 `keyRef`/`tokenRef` 입력이 거부됩니다.

자동화 친화적인 확인 (만료/누락 시 종료 `1`, 만료 예정 시 `2`):

```bash
openclaw models status --check
```

라이브 인증 프로브:

```bash
openclaw models status --probe
```

참고:

- 프로브 행은 인증 프로파일, 환경 자격 증명, 또는 `models.json`에서 올 수 있습니다.
- 명시적 `auth.order.<provider>`가 저장된 프로파일을 생략하는 경우, 프로브는 자동으로 건너뛰는 대신 해당 프로파일에 대해 `excluded_by_auth_order`를 보고합니다.
- 인증이 존재하지만 OpenClaw가 해당 프로바이더에 대한 프로브 가능한 모델 후보를 해석할 수 없는 경우, 프로브는 `status: no_model`을 보고합니다.
- 속도 제한 쿨다운은 모델 범위가 될 수 있습니다. 하나의 모델에 대해 쿨다운 중인 프로파일은 동일한 프로바이더의 형제 모델에 대해서는 여전히 사용 가능할 수 있습니다.

선택적 운영 스크립트(systemd/Termux)는 여기에 문서화되어 있습니다:
[인증 모니터링 스크립트](/help/scripts#auth-monitoring-scripts)

## Anthropic 참고

Anthropic `claude-cli` 백엔드가 다시 지원됩니다.

- Anthropic 직원은 이 OpenClaw 통합 경로가 다시 허용된다고 밝혔습니다.
- 따라서 OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 Claude CLI 재사용과 `claude -p` 사용을 Anthropic 기반 실행에 대해 허가된 것으로 취급합니다.
- Anthropic API 키는 장기 실행 게이트웨이 호스트와 명시적인 서버 측 청구 제어에 있어서 여전히 가장 예측 가능한 선택입니다.

## 모델 인증 상태 확인

```bash
openclaw models status
openclaw doctor
```

## API 키 순환 동작 (게이트웨이)

일부 프로바이더는 API 호출이 프로바이더 속도 제한에 부딪힐 때 대체 키로 요청을 재시도하는 것을 지원합니다.

- 우선순위 순서:
  - `OPENCLAW_LIVE_<PROVIDER>_KEY` (단일 재정의)
  - `<PROVIDER>_API_KEYS`
  - `<PROVIDER>_API_KEY`
  - `<PROVIDER>_API_KEY_*`
- Google 프로바이더는 추가 폴백으로 `GOOGLE_API_KEY`도 포함합니다.
- 동일한 키 목록은 사용 전에 중복이 제거됩니다.
- OpenClaw는 속도 제한 오류(예: `429`, `rate_limit`, `quota`, `resource exhausted`, `Too many concurrent requests`, `ThrottlingException`, `concurrency limit reached`, 또는 `workers_ai ... quota limit exceeded`)에 대해서만 다음 키로 재시도합니다.
- 속도 제한이 아닌 오류는 대체 키로 재시도되지 않습니다.
- 모든 키가 실패하면, 마지막 시도의 최종 오류가 반환됩니다.

## 사용할 자격 증명 제어

### 세션별 (chat 명령)

`/model <alias-or-id>@<profileId>`를 사용하여 현재 세션에 대한 특정 프로바이더 자격 증명을 고정합니다(예시 프로파일 ids: `anthropic:default`, `anthropic:work`).

`/model`(또는 `/model list`)을 사용하면 간단한 선택기가 표시되고, `/model status`를 사용하면 전체 뷰(후보 + 다음 인증 프로파일, 구성된 경우 프로바이더 엔드포인트 세부 정보 포함)가 표시됩니다.

### 에이전트별 (CLI 재정의)

에이전트에 대한 명시적 인증 프로파일 순서 재정의 설정(해당 에이전트의 `auth-state.json`에 저장):

```bash
openclaw models auth order get --provider anthropic
openclaw models auth order set --provider anthropic anthropic:default
openclaw models auth order clear --provider anthropic
```

특정 에이전트를 대상으로 하려면 `--agent <id>`를 사용하고, 구성된 기본 에이전트를 사용하려면 생략합니다.
순서 문제를 디버깅할 때, `openclaw models status --probe`는 생략된
저장된 프로파일을 자동으로 건너뛰는 대신 `excluded_by_auth_order`로 표시합니다.
쿨다운 문제를 디버깅할 때, 속도 제한 쿨다운이 전체 프로바이더 프로파일이 아닌
하나의 모델 id에 연결될 수 있다는 점을 기억하십시오.

## 문제 해결

### "No credentials found"

Anthropic 프로파일이 없는 경우, **게이트웨이 호스트**에서 Anthropic API 키를 구성하거나 Anthropic setup-token 경로를 설정한 후 다시 확인하십시오:

```bash
openclaw models status
```

### 토큰 만료 예정/만료됨

`openclaw models status`를 실행하여 어떤 프로파일이 만료되고 있는지 확인하십시오. Anthropic 토큰 프로파일이 없거나 만료된 경우, setup-token을 통해 해당 설정을 새로 고침하거나 Anthropic API 키로 마이그레이션하십시오.
