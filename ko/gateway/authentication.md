---
summary: "모델 인증(authentication): OAuth, API 키, Claude CLI 재사용 및 Anthropic setup-token"
read_when:
  - 모델 인증(auth) 또는 OAuth 만료 디버깅 시
  - 인증 또는 자격 증명 저장 문서화 시
title: "인증 (Authentication)"
---

# 인증 (모델 프로바이더)

<Note>
이 페이지는 **모델 프로바이더** 인증(API 키, OAuth, Claude CLI 재사용, Anthropic setup-token)을 다룹니다. **게이트웨이 연결** 인증(token, password, trusted-proxy)은 [구성](/gateway/configuration)과 [신뢰할 수 있는 프록시 인증](/gateway/trusted-proxy-auth)을 참조하십시오.
</Note>

OpenClaw는 모델 프로바이더에 대해 OAuth와 API 키를 지원합니다. 상시 가동되는 게이트웨이 호스트의 경우, API 키가 일반적으로 가장 예측 가능한 옵션입니다. 구독/OAuth 플로우도 프로바이더 계정 모델과 일치하면 지원됩니다.

전체 OAuth 플로우와 저장소 구조는 [/concepts/oauth](/concepts/oauth)를 참조하십시오.
SecretRef 기반 인증(`env`/`file`/`exec` 프로바이더)은 [시크릿 관리](/gateway/secrets)를 참조하십시오.
`models status --probe`에서 사용하는 자격 증명 적격성/이유 코드 규칙은 [Auth 자격 증명 시맨틱](/auth-credential-semantics)을 참조하십시오.

## 권장 설정 (API 키, 모든 프로바이더)

장기 실행 게이트웨이를 운영 중이라면, 선택한 프로바이더의 API 키로 시작하십시오.
특히 Anthropic의 경우 API 키 인증이 여전히 가장 예측 가능한 서버 설정이지만, OpenClaw는 로컬 Claude CLI 로그인 재사용도 지원합니다.

1. 프로바이더 콘솔에서 API 키를 생성합니다.
2. **게이트웨이 호스트**(즉, `openclaw gateway`를 실행하는 머신)에 키를 넣습니다.

```bash
export <PROVIDER>_API_KEY="..."
openclaw models status
```

3. 게이트웨이가 systemd/launchd 아래에서 실행되는 경우, 데몬이 읽을 수 있도록 키를 `~/.openclaw/.env`에 두는 것을 선호하십시오:

```bash
cat >> ~/.openclaw/.env <<'EOF'
<PROVIDER>_API_KEY=...
EOF
```

그런 다음 데몬을 재시작하고(또는 게이트웨이 프로세스를 재시작하고) 다시 확인하십시오:

```bash
openclaw models status
openclaw doctor
```

환경 변수를 직접 관리하고 싶지 않다면, 온보딩이 데몬 사용을 위해 API 키를 저장해 줄 수 있습니다: `openclaw onboard`.

환경 변수 상속(`env.shellEnv`, `~/.openclaw/.env`, systemd/launchd)에 대한 자세한 내용은 [도움말](/help/)을 참조하십시오.

## Anthropic: Claude CLI 및 토큰 호환성

Anthropic setup-token 인증은 OpenClaw에서 지원되는 토큰 경로로 계속 사용 가능합니다. Anthropic 측에서는 OpenClaw 방식의 Claude CLI 사용이 다시 허용된다고 전달해왔으므로, OpenClaw는 Anthropic이 새 정책을 발표하지 않는 한 이 통합에 대해 Claude CLI 재사용과 `claude -p` 사용을 승인된 것으로 취급합니다. 호스트에서 Claude CLI 재사용이 가능한 경우, 그것이 이제 선호되는 경로입니다.

장기 실행 게이트웨이 호스트의 경우, Anthropic API 키가 여전히 가장 예측 가능한 설정입니다. 동일 호스트에서 기존 Claude 로그인을 재사용하려면, 온보딩/configure에서 Anthropic Claude CLI 경로를 사용하십시오.

Claude CLI 재사용을 위한 권장 호스트 설정:

```bash
# 게이트웨이 호스트에서 실행
claude auth login
claude auth status --text
openclaw models auth login --provider anthropic --method cli --set-default
```

이는 2단계 설정입니다:

1. 게이트웨이 호스트에서 Claude Code 자체를 Anthropic에 로그인합니다.
2. OpenClaw에게 Anthropic 모델 선택을 로컬 `claude-cli` 백엔드로 전환하고 해당하는 OpenClaw auth 프로파일을 저장하도록 지시합니다.

`claude`가 `PATH`에 없으면, 먼저 Claude Code를 설치하거나 `agents.defaults.cliBackends.claude-cli.command`를 실제 바이너리 경로로 설정하십시오.

수동 토큰 입력(모든 프로바이더; `auth-profiles.json`에 기록하고 구성 업데이트):

```bash
openclaw models auth paste-token --provider openrouter
```

Auth 프로파일 refs도 정적 자격 증명에 대해 지원됩니다:

- `api_key` 자격 증명은 `keyRef: { source, provider, id }`를 사용할 수 있습니다
- `token` 자격 증명은 `tokenRef: { source, provider, id }`를 사용할 수 있습니다
- OAuth 모드 프로파일은 SecretRef 자격 증명을 지원하지 않습니다. `auth.profiles.<id>.mode`가 `"oauth"`로 설정된 경우, 해당 프로파일에 대한 SecretRef 기반 `keyRef`/`tokenRef` 입력은 거부됩니다.

자동화 친화적 확인(만료/누락 시 exit `1`, 만료 임박 시 `2`):

```bash
openclaw models status --check
```

라이브 auth 프로브:

```bash
openclaw models status --probe
```

참고 사항:

- 프로브 행은 auth 프로파일, 환경 자격 증명 또는 `models.json`에서 올 수 있습니다.
- 명시적 `auth.order.<provider>`가 저장된 프로파일을 생략하면, 프로브는 해당 프로파일에 대해 시도하는 대신 `excluded_by_auth_order`로 보고합니다.
- auth는 존재하지만 OpenClaw가 해당 프로바이더에 대해 프로브 가능한 모델 후보를 해결할 수 없는 경우, 프로브는 `status: no_model`로 보고합니다.
- 속도 제한(rate-limit) 쿨다운은 모델별 범위로 적용될 수 있습니다. 한 모델에 대해 쿨다운 중인 프로파일이 동일 프로바이더의 형제 모델에는 여전히 사용 가능할 수 있습니다.

선택적 운영 스크립트(systemd/Termux)는 여기에 문서화되어 있습니다:
[Auth 모니터링 스크립트](/help/scripts#auth-monitoring-scripts)

## Anthropic 참고

Anthropic `claude-cli` 백엔드가 다시 지원됩니다.

- Anthropic 측에서는 이 OpenClaw 통합 경로가 다시 허용된다고 전달해왔습니다.
- 따라서 OpenClaw는 Anthropic이 새 정책을 발표하지 않는 한 Anthropic 기반 실행에 대해 Claude CLI 재사용 및 `claude -p` 사용을 승인된 것으로 취급합니다.
- Anthropic API 키는 장기 실행 게이트웨이 호스트와 명시적인 서버 측 과금 제어를 위해 여전히 가장 예측 가능한 선택지입니다.

## 모델 auth 상태 확인

```bash
openclaw models status
openclaw doctor
```

## API 키 로테이션 동작 (게이트웨이)

일부 프로바이더는 API 호출이 프로바이더 속도 제한에 걸렸을 때 대체 키로 요청을 재시도하는 것을 지원합니다.

- 우선순위 순서:
  - `OPENCLAW_LIVE_<PROVIDER>_KEY` (단일 오버라이드)
  - `<PROVIDER>_API_KEYS`
  - `<PROVIDER>_API_KEY`
  - `<PROVIDER>_API_KEY_*`
- Google 프로바이더는 추가 폴백으로 `GOOGLE_API_KEY`도 포함합니다.
- 동일한 키 목록은 사용 전에 중복 제거됩니다.
- OpenClaw는 속도 제한 오류(예: `429`, `rate_limit`, `quota`, `resource exhausted`, `Too many concurrent requests`, `ThrottlingException`, `concurrency limit reached`, 또는 `workers_ai ... quota limit exceeded`)에 대해서만 다음 키로 재시도합니다.
- 속도 제한이 아닌 오류는 대체 키로 재시도되지 않습니다.
- 모든 키가 실패하면, 마지막 시도의 최종 오류가 반환됩니다.

## 사용할 자격 증명 제어

### 세션별 (chat 명령)

현재 세션에 특정 프로바이더 자격 증명을 고정하려면 `/model <alias-or-id>@<profileId>`를 사용하십시오(프로파일 id 예시: `anthropic:default`, `anthropic:work`).

간결한 피커는 `/model`(또는 `/model list`)을 사용하고, 전체 뷰(후보 + 다음 auth 프로파일, 그리고 구성된 경우 프로바이더 엔드포인트 세부 정보 포함)는 `/model status`를 사용하십시오.

### 에이전트별 (CLI 오버라이드)

에이전트에 대한 명시적 auth 프로파일 순서 오버라이드를 설정합니다(해당 에이전트의 `auth-state.json`에 저장):

```bash
openclaw models auth order get --provider anthropic
openclaw models auth order set --provider anthropic anthropic:default
openclaw models auth order clear --provider anthropic
```

특정 에이전트를 대상으로 하려면 `--agent <id>`를 사용하고, 구성된 기본 에이전트를 사용하려면 생략하십시오.
순서 문제를 디버깅할 때, `openclaw models status --probe`는 생략된 저장 프로파일을 조용히 건너뛰는 대신 `excluded_by_auth_order`로 표시합니다.
쿨다운 문제를 디버깅할 때, 속도 제한 쿨다운은 전체 프로바이더 프로파일이 아닌 하나의 모델 id에 묶일 수 있다는 점을 기억하십시오.

## 문제 해결

### "No credentials found"

Anthropic 프로파일이 누락된 경우, **게이트웨이 호스트**에 Anthropic API 키를 구성하거나 Anthropic setup-token 경로를 설정한 다음 다시 확인하십시오:

```bash
openclaw models status
```

### 토큰 만료 임박/만료됨

만료 중인 프로파일을 확인하려면 `openclaw models status`를 실행하십시오. Anthropic 토큰 프로파일이 누락되었거나 만료된 경우, setup-token으로 해당 설정을 갱신하거나 Anthropic API 키로 마이그레이션하십시오.

## 관련

- [시크릿 관리](/gateway/secrets)
- [원격 접근](/gateway/remote)
- [Auth 저장소](/concepts/oauth)
