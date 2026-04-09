---
title: "도구 호출 API"
description: "게이트웨이 HTTP 엔드포인트를 통해 단일 도구를 직접 호출"
---

# 도구 호출 (HTTP)

OpenClaw 게이트웨이는 단일 도구를 직접 호출하기 위한 간단한 HTTP 엔드포인트를 노출합니다. 항상 활성화되어 있으며 게이트웨이 인증과 도구 정책을 사용합니다. OpenAI 호환 `/v1/*` 표면과 마찬가지로 공유 시크릿 Bearer 인증은 전체 게이트웨이에 대한 신뢰할 수 있는 오퍼레이터 액세스로 처리됩니다.

- `POST /tools/invoke`
- 게이트웨이와 동일한 포트(WS + HTTP 멀티플렉스): `http://&lt;gateway-host&gt;:&lt;port&gt;/tools/invoke`

기본 최대 페이로드 크기는 2 MB입니다.

## 인증

게이트웨이 인증 구성을 사용합니다.

일반적인 HTTP 인증 경로:

- 공유 시크릿 인증(`gateway.auth.mode="token"` 또는 `"password"`):
  `Authorization: Bearer &lt;token-or-password&gt;`
- 신뢰할 수 있는 신원 인식 HTTP 인증(`gateway.auth.mode="trusted-proxy"`):
  구성된 신원 인식 프록시를 통해 라우팅하고 필요한 신원 헤더를 주입하게 합니다
- 프라이빗 인그레스 오픈 인증(`gateway.auth.mode="none"`):
  인증 헤더 불필요

참고:

- `gateway.auth.mode="token"`인 경우 `gateway.auth.token`(또는 `OPENCLAW_GATEWAY_TOKEN`)을 사용합니다.
- `gateway.auth.mode="password"`인 경우 `gateway.auth.password`(또는 `OPENCLAW_GATEWAY_PASSWORD`)를 사용합니다.
- `gateway.auth.mode="trusted-proxy"`인 경우 HTTP 요청은 구성된 비루프백 신뢰할 수 있는 프록시 소스에서 와야 합니다. 동일 호스트 루프백 프록시는 이 모드를 충족하지 않습니다.
- `gateway.auth.rateLimit`이 구성되고 너무 많은 인증 실패가 발생하면 엔드포인트는 `Retry-After`와 함께 `429`를 반환합니다.

## 보안 경계 (중요)

이 엔드포인트를 게이트웨이 인스턴스에 대한 **완전한 오퍼레이터 액세스** 표면으로 취급합니다.

- 여기서 HTTP Bearer 인증은 좁은 사용자별 범위 모델이 아닙니다.
- 이 엔드포인트에 유효한 게이트웨이 토큰/비밀번호는 소유자/오퍼레이터 자격 증명처럼 취급해야 합니다.
- 공유 시크릿 인증 모드(`token` 및 `password`)의 경우 발신자가 더 좁은 `x-openclaw-scopes` 헤더를 보내더라도 엔드포인트는 일반 전체 오퍼레이터 기본값을 복원합니다.
- 공유 시크릿 인증은 이 엔드포인트의 직접 도구 호출도 소유자-발신자 턴으로 처리합니다.
- 신뢰할 수 있는 신원 인식 HTTP 모드(예: 신뢰할 수 있는 프록시 인증 또는 프라이빗 인그레스의 `gateway.auth.mode="none"`)는 `x-openclaw-scopes`가 있는 경우 이를 준수하고 그렇지 않으면 일반 오퍼레이터 기본 범위 집합으로 폴백합니다.
- 이 엔드포인트는 루프백/tailnet/프라이빗 인그레스에만 유지합니다. 공개 인터넷에 직접 노출하지 마십시오.

인증 매트릭스:

- `gateway.auth.mode="token"` 또는 `"password"` + `Authorization: Bearer ...`
  - 공유 게이트웨이 오퍼레이터 시크릿 소유를 증명
  - 더 좁은 `x-openclaw-scopes` 무시
  - 전체 기본 오퍼레이터 범위 집합 복원:
    `operator.admin`, `operator.approvals`, `operator.pairing`,
    `operator.read`, `operator.talk.secrets`, `operator.write`
  - 이 엔드포인트의 직접 도구 호출을 소유자-발신자 턴으로 처리
- 신뢰할 수 있는 신원 인식 HTTP 모드(예: 신뢰할 수 있는 프록시 인증, 또는 프라이빗 인그레스의 `gateway.auth.mode="none"`)
  - 외부 신뢰할 수 있는 신원 또는 배포 경계를 인증
  - 헤더가 있는 경우 `x-openclaw-scopes` 준수
  - 헤더가 없는 경우 일반 오퍼레이터 기본 범위 집합으로 폴백
  - 발신자가 명시적으로 범위를 좁히고 `operator.admin`을 생략할 때만 소유자 의미 체계를 잃음

## 요청 본문

```json
{
  "tool": "sessions_list",
  "action": "json",
  "args": {},
  "sessionKey": "main",
  "dryRun": false
}
```

필드:

- `tool` (문자열, 필수): 호출할 도구 이름.
- `action` (문자열, 선택 사항): 도구 스키마가 `action`을 지원하고 args 페이로드가 생략한 경우 args에 매핑됩니다.
- `args` (객체, 선택 사항): 도구별 인수.
- `sessionKey` (문자열, 선택 사항): 대상 세션 키. 생략하거나 `"main"`인 경우 게이트웨이는 구성된 메인 세션 키를 사용합니다(`session.mainKey` 및 기본 에이전트 또는 전역 범위의 `global` 준수).
- `dryRun` (불리언, 선택 사항): 향후 사용을 위해 예약됨; 현재는 무시됩니다.

## 정책 + 라우팅 동작

도구 가용성은 게이트웨이 에이전트에서 사용하는 것과 동일한 정책 체인을 통해 필터링됩니다:

- `tools.profile` / `tools.byProvider.profile`
- `tools.allow` / `tools.byProvider.allow`
- `agents.&lt;id&gt;.tools.allow` / `agents.&lt;id&gt;.tools.byProvider.allow`
- 그룹 정책(세션 키가 그룹 또는 채널에 매핑되는 경우)
- 서브에이전트 정책(서브에이전트 세션 키로 호출할 때)

도구가 정책에 의해 허용되지 않으면 엔드포인트는 **404**를 반환합니다.

중요 경계 참고 사항:

- Exec 승인은 오퍼레이터 가드레일이며 이 HTTP 엔드포인트의 별도 권한 부여 경계가 아닙니다. 게이트웨이 인증 + 도구 정책을 통해 도구에 접근할 수 있으면 `/tools/invoke`는 추가적인 호출당 승인 프롬프트를 추가하지 않습니다.
- 신뢰할 수 없는 발신자와 게이트웨이 Bearer 자격 증명을 공유하지 마십시오. 신뢰 경계 간에 분리가 필요한 경우 별도의 게이트웨이(가능하면 별도의 OS 사용자/호스트)를 실행합니다.

게이트웨이 HTTP는 기본적으로 하드 거부 목록도 적용합니다(세션 정책에서 도구가 허용되더라도):

- `exec` — 직접 명령 실행(RCE 표면)
- `spawn` — 임의 자식 프로세스 생성(RCE 표면)
- `shell` — 셸 명령 실행(RCE 표면)
- `fs_write` — 호스트에서 임의 파일 변경
- `fs_delete` — 호스트에서 임의 파일 삭제
- `fs_move` — 호스트에서 임의 파일 이동/이름 변경
- `apply_patch` — 패치 적용으로 임의 파일 재작성 가능
- `sessions_spawn` — 세션 오케스트레이션; 원격으로 에이전트 생성은 RCE
- `sessions_send` — 크로스 세션 메시지 주입
- `cron` — 영구 자동화 제어 플레인
- `gateway` — 게이트웨이 제어 플레인; HTTP를 통한 재구성 방지
- `nodes` — 노드 명령 릴레이로 페어링된 호스트에서 system.run에 접근 가능
- `whatsapp_login` — 터미널 QR 스캔이 필요한 대화형 설정; HTTP에서 중단

`gateway.tools`를 통해 이 거부 목록을 사용자 지정할 수 있습니다:

```json5
{
  gateway: {
    tools: {
      // HTTP /tools/invoke에서 추가로 차단할 도구
      deny: ["browser"],
      // 기본 거부 목록에서 도구 제거
      allow: ["gateway"],
    },
  },
}
```

그룹 정책이 컨텍스트를 해결하는 데 도움을 주기 위해 선택적으로 설정할 수 있습니다:

- `x-openclaw-message-channel: &lt;channel&gt;` (예: `slack`, `telegram`)
- `x-openclaw-account-id: &lt;accountId&gt;` (여러 계정이 있는 경우)

## 응답

- `200` → `{ ok: true, result }`
- `400` → `{ ok: false, error: { type, message } }` (잘못된 요청 또는 도구 입력 오류)
- `401` → 권한 없음
- `429` → 인증 속도 제한(`Retry-After` 설정)
- `404` → 도구를 사용할 수 없음(찾을 수 없거나 허용 목록에 없음)
- `405` → 메서드 허용 안됨
- `500` → `{ ok: false, error: { type, message } }` (예기치 않은 도구 실행 오류; 정제된 메시지)

## 예제

```bash
curl -sS http://127.0.0.1:18789/tools/invoke \
  -H 'Authorization: Bearer secret' \
  -H 'Content-Type: application/json' \
  -d '{
    "tool": "sessions_list",
    "action": "json",
    "args": {}
  }'
```
