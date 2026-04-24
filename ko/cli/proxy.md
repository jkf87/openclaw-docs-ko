---
summary: "`openclaw proxy`에 대한 CLI 참조, 로컬 디버그 proxy 및 캡처 인스펙터"
read_when:
  - 디버깅을 위해 OpenClaw 전송(transport) 트래픽을 로컬에서 캡처해야 하는 경우
  - 디버그 proxy 세션, blob, 또는 내장 쿼리 프리셋을 검사하려는 경우
title: "Proxy"
---

# `openclaw proxy`

로컬의 명시적 디버그 proxy를 실행하고 캡처된 트래픽을 검사합니다.

이 명령은 전송 계층 조사를 위한 디버깅 명령입니다. 로컬 proxy를 시작하고,
캡처를 활성화한 상태로 자식 명령을 실행하며, 캡처 세션을 나열하고,
일반적인 트래픽 패턴을 쿼리하고, 캡처된 blob을 읽고, 로컬 캡처 데이터를
삭제할 수 있습니다.

## 명령어

```bash
openclaw proxy start [--host <host>] [--port <port>]
openclaw proxy run [--host <host>] [--port <port>] -- <cmd...>
openclaw proxy coverage
openclaw proxy sessions [--limit <count>]
openclaw proxy query --preset <name> [--session <id>]
openclaw proxy blob --id <blobId>
openclaw proxy purge
```

## 쿼리 프리셋

`openclaw proxy query --preset <name>`은 다음을 허용합니다:

- `double-sends`
- `retry-storms`
- `cache-busting`
- `ws-duplicate-frames`
- `missing-ack`
- `error-bursts`

## 참고 사항

- `start`는 `--host`가 설정되지 않은 경우 기본값 `127.0.0.1`을 사용합니다.
- `run`은 로컬 디버그 proxy를 시작한 뒤 `--` 이후에 오는 명령을 실행합니다.
- 캡처는 로컬 디버깅 데이터입니다; 작업이 끝나면 `openclaw proxy purge`를 사용하십시오.

## 관련 항목

- [CLI 참조](/cli/)
- [신뢰된 proxy 인증](/gateway/trusted-proxy-auth)
