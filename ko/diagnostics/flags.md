---
summary: "대상 디버그 로그를 위한 진단 플래그"
read_when:
  - You need targeted debug logs without raising global logging levels
  - You need to capture subsystem-specific logs for support
title: "진단 플래그"
---

# 진단 플래그

진단 플래그를 사용하면 어디서나 상세 로깅을 켜지 않고도 대상 디버그 로그를 활성화할 수 있습니다. 플래그는 선택 사항이며 서브시스템이 확인하지 않으면 효과가 없습니다.

## 작동 방식

- 플래그는 문자열입니다 (대소문자 구분 없음).
- 구성 또는 환경 변수 재정의를 통해 플래그를 활성화할 수 있습니다.
- 와일드카드가 지원됩니다:
  - `telegram.*`는 `telegram.http`와 일치합니다
  - `*`는 모든 플래그를 활성화합니다

## 구성을 통해 활성화

```json
{
  "diagnostics": {
    "flags": ["telegram.http"]
  }
}
```

여러 플래그:

```json
{
  "diagnostics": {
    "flags": ["telegram.http", "gateway.*"]
  }
}
```

플래그를 변경한 후 게이트웨이를 다시 시작하십시오.

## 환경 변수 재정의 (일회성)

```bash
OPENCLAW_DIAGNOSTICS=telegram.http,telegram.payload
```

모든 플래그 비활성화:

```bash
OPENCLAW_DIAGNOSTICS=0
```

## 로그 위치

플래그는 표준 진단 로그 파일에 로그를 내보냅니다. 기본값:

```
/tmp/openclaw/openclaw-YYYY-MM-DD.log
```

`logging.file`을 설정한 경우 해당 경로를 사용하십시오. 로그는 JSONL입니다 (줄당 하나의 JSON 객체). `logging.redactSensitive`에 따라 수정이 적용됩니다.

## 로그 추출

최신 로그 파일 선택:

```bash
ls -t /tmp/openclaw/openclaw-*.log | head -n 1
```

Telegram HTTP 진단 필터링:

```bash
rg "telegram http error" /tmp/openclaw/openclaw-*.log
```

또는 재현하는 동안 테일:

```bash
tail -f /tmp/openclaw/openclaw-$(date +%F).log | rg "telegram http error"
```

원격 게이트웨이의 경우 `openclaw logs --follow`도 사용할 수 있습니다 ([/cli/logs](/cli/logs) 참조).

## 참고

- `logging.level`이 `warn`보다 높게 설정된 경우 이 로그가 억제될 수 있습니다. 기본값 `info`는 괜찮습니다.
- 플래그는 활성화된 상태로 유지해도 안전합니다. 특정 서브시스템의 로그 볼륨에만 영향을 미칩니다.
- 로그 대상, 수준 및 수정을 변경하려면 [/logging](/logging)을 사용하십시오.
