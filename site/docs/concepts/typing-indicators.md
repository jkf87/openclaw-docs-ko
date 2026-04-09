---
title: "타이핑 표시기"
description: "OpenClaw가 타이핑 표시기를 표시하는 시기와 조정 방법"
---

# 타이핑 표시기

타이핑 표시기는 실행이 활성 상태인 동안 채팅 채널에 전송됩니다. `agents.defaults.typingMode`를 사용하여 타이핑이 **언제** 시작될지 제어하고 `typingIntervalSeconds`로 **얼마나 자주** 새로 고침되는지 제어하십시오.

## 기본값

`agents.defaults.typingMode`가 **설정되지 않은** 경우, OpenClaw는 레거시 동작을 유지합니다:

- **직접 채팅**: 모델 루프가 시작되면 즉시 타이핑이 시작됩니다.
- **멘션이 있는 그룹 채팅**: 즉시 타이핑이 시작됩니다.
- **멘션이 없는 그룹 채팅**: 메시지 텍스트가 스트리밍을 시작할 때만 타이핑이 시작됩니다.
- **하트비트 실행**: 타이핑이 비활성화됩니다.

## 모드

`agents.defaults.typingMode`를 다음 중 하나로 설정하십시오:

- `never` — 절대 타이핑 표시기 없음.
- `instant` — 나중에 실행이 자동 응답 토큰만 반환하더라도 **모델 루프가 시작되자마자** 타이핑 시작.
- `thinking` — **첫 번째 추론 델타**에서 타이핑 시작 (실행에 `reasoningLevel: "stream"` 필요).
- `message` — **첫 번째 비자동 응답 텍스트 델타**에서 타이핑 시작 (`NO_REPLY` 자동 응답 토큰 무시).

"얼마나 일찍 실행되는지" 순서:
`never` → `message` → `thinking` → `instant`

## 구성

```json5
{
  agent: {
    typingMode: "thinking",
    typingIntervalSeconds: 6,
  },
}
```

세션별로 모드 또는 케이던스를 오버라이드할 수 있습니다:

```json5
{
  session: {
    typingMode: "message",
    typingIntervalSeconds: 4,
  },
}
```

## 참고

- `message` 모드는 전체 페이로드가 정확한 자동 응답 토큰 (예: `NO_REPLY` / `no_reply`, 대소문자 구분 없이 매칭)인 경우 자동 응답 전용 응답에 대한 타이핑을 표시하지 않습니다.
- `thinking`은 실행이 추론을 스트리밍하는 경우에만 실행됩니다 (`reasoningLevel: "stream"`). 모델이 추론 델타를 내보내지 않으면 타이핑이 시작되지 않습니다.
- 하트비트는 모드에 관계없이 절대 타이핑을 표시하지 않습니다.
- `typingIntervalSeconds`는 시작 시간이 아닌 **새로 고침 케이던스**를 제어합니다. 기본값은 6초입니다.
