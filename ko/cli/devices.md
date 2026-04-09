---
summary: "`openclaw devices`에 대한 CLI 참조 (장치 페어링 + 토큰 순환/취소)"
read_when:
  - 장치 페어링 요청을 승인하는 경우
  - 장치 토큰을 순환하거나 취소해야 하는 경우
title: "devices"
---

# `openclaw devices`

장치 페어링 요청과 장치 범위 토큰을 관리합니다.

## 명령

### `openclaw devices list`

대기 중인 페어링 요청과 페어링된 장치를 나열합니다.

```
openclaw devices list
openclaw devices list --json
```

대기 중인 요청 출력에는 승인 전에 요청된 역할과 범위가 포함되어 있어 검토할 수 있습니다.

### `openclaw devices remove <deviceId>`

하나의 페어링된 장치 항목을 제거합니다.

페어링된 장치 토큰으로 인증할 때 비관리자 호출자는 **자신의** 장치 항목만 제거할 수 있습니다. 다른 장치를 제거하려면 `operator.admin`이 필요합니다.

```
openclaw devices remove <deviceId>
openclaw devices remove <deviceId> --json
```

### `openclaw devices clear --yes [--pending]`

페어링된 장치를 일괄 삭제합니다.

```
openclaw devices clear --yes
openclaw devices clear --yes --pending
openclaw devices clear --yes --pending --json
```

### `openclaw devices approve [requestId] [--latest]`

대기 중인 장치 페어링 요청을 승인합니다. `requestId`가 생략되면 OpenClaw는 자동으로 가장 최근 대기 중인 요청을 승인합니다.

참고: 장치가 변경된 인증 세부사항 (역할/범위/공개 키)으로 페어링을 재시도하면 OpenClaw는 이전 대기 항목을 대체하고 새 `requestId`를 발급합니다. 승인하기 직전에 `openclaw devices list`를 실행하여 현재 ID를 사용하세요.

```
openclaw devices approve
openclaw devices approve <requestId>
openclaw devices approve --latest
```

### `openclaw devices reject <requestId>`

대기 중인 장치 페어링 요청을 거부합니다.

```
openclaw devices reject <requestId>
```

### `openclaw devices rotate --device <id> --role <role> [--scope <scope...>]`

특정 역할에 대한 장치 토큰을 순환합니다 (선택적으로 범위 업데이트).
대상 역할은 해당 장치의 승인된 페어링 계약에 이미 존재해야 합니다. 순환은 새로운 미승인 역할을 생성할 수 없습니다.
`--scope`를 생략하면 나중에 저장된 순환 토큰으로 재연결할 때 해당 토큰의 캐시된 승인 범위를 재사용합니다. 명시적 `--scope` 값을 전달하면 향후 캐시 토큰 재연결에 대해 저장된 범위 세트가 됩니다.
비관리자 페어링 장치 호출자는 **자신의** 장치 토큰만 순환할 수 있습니다.
또한 명시적 `--scope` 값은 호출자 세션의 자체 운영자 범위 내에 있어야 합니다. 순환은 호출자가 이미 가진 것보다 더 넓은 운영자 토큰을 생성할 수 없습니다.

```
openclaw devices rotate --device <deviceId> --role operator --scope operator.read --scope operator.write
```

새 토큰 페이로드를 JSON으로 반환합니다.

### `openclaw devices revoke --device <id> --role <role>`

특정 역할에 대한 장치 토큰을 취소합니다.

비관리자 페어링 장치 호출자는 **자신의** 장치 토큰만 취소할 수 있습니다.
다른 장치의 토큰을 취소하려면 `operator.admin`이 필요합니다.

```
openclaw devices revoke --device <deviceId> --role node
```

취소 결과를 JSON으로 반환합니다.

## 일반 옵션

- `--url <url>`: Gateway WebSocket URL (구성된 경우 `gateway.remote.url`로 기본 설정).
- `--token <token>`: Gateway 토큰 (필요한 경우).
- `--password <password>`: Gateway 비밀번호 (비밀번호 인증).
- `--timeout <ms>`: RPC 타임아웃.
- `--json`: JSON 출력 (스크립팅에 권장).

참고: `--url`을 설정하면 CLI는 구성 또는 환경 자격 증명으로 폴백하지 않습니다. `--token` 또는 `--password`를 명시적으로 전달하세요. 명시적 자격 증명 누락은 오류입니다.

## 참고사항

- 토큰 순환은 새 토큰을 반환합니다 (민감함). 비밀처럼 취급하세요.
- 이 명령은 `operator.pairing` (또는 `operator.admin`) 범위가 필요합니다.
- 토큰 순환은 해당 장치에 대한 승인된 페어링 역할 세트와 승인된 범위 기준 내에 유지됩니다. 잘못된 캐시 토큰 항목은 새 순환 대상을 부여하지 않습니다.
- 페어링 장치 토큰 세션의 경우 교차 장치 관리는 관리자 전용입니다: 호출자에게 `operator.admin`이 없으면 `remove`, `rotate`, `revoke`는 자기 전용입니다.
- `devices clear`는 의도적으로 `--yes`로 차단됩니다.
- 로컬 루프백에서 페어링 범위를 사용할 수 없는 경우 (명시적 `--url`이 전달되지 않은 경우) list/approve는 로컬 페어링 폴백을 사용할 수 있습니다.
- `devices approve`는 `requestId`를 생략하거나 `--latest`를 전달할 때 자동으로 가장 최신 대기 중인 요청을 선택합니다.

## 토큰 드리프트 복구 체크리스트

Control UI 또는 다른 클라이언트가 `AUTH_TOKEN_MISMATCH` 또는 `AUTH_DEVICE_TOKEN_MISMATCH`로 계속 실패하는 경우 사용하세요.

1. 현재 게이트웨이 토큰 소스 확인:

```bash
openclaw config get gateway.auth.token
```

2. 페어링된 장치 나열 및 영향받은 장치 id 식별:

```bash
openclaw devices list
```

3. 영향받은 장치의 운영자 토큰 순환:

```bash
openclaw devices rotate --device <deviceId> --role operator
```

4. 순환으로 충분하지 않은 경우 오래된 페어링을 제거하고 다시 승인:

```bash
openclaw devices remove <deviceId>
openclaw devices list
openclaw devices approve <requestId>
```

5. 현재 공유 토큰/비밀번호로 클라이언트 연결 재시도.

참고사항:

- 일반 재연결 인증 우선순위는 명시적 공유 토큰/비밀번호 우선, 그 다음 명시적 `deviceToken`, 그 다음 저장된 장치 토큰, 그 다음 부트스트랩 토큰입니다.
- 신뢰할 수 있는 `AUTH_TOKEN_MISMATCH` 복구는 한 번의 제한된 재시도를 위해 공유 토큰과 저장된 장치 토큰을 함께 임시로 전송할 수 있습니다.

관련:

- [대시보드 인증 문제 해결](/web/dashboard#if-you-see-unauthorized-1008)
- [Gateway 문제 해결](/gateway/troubleshooting#dashboard-control-ui-connectivity)
