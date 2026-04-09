---
summary: "QA 채널 설정 - 테스트 및 품질 보증을 위한 채널"
read_when:
  - 테스트 또는 QA 목적으로 채널 설정 시
  - 에이전트 동작을 격리된 환경에서 테스트할 때
title: "QA 채널"
---

# QA 채널

QA 채널은 테스트 및 품질 보증 시나리오에서 사용됩니다. 실제 채팅 플랫폼에 연결하지 않고 에이전트 동작을 검증하는 데 사용할 수 있습니다.

## 사용 사례

- 실제 채팅 플랫폼에서 배포하기 전에 에이전트 동작 테스트
- 특정 메시지 유형 또는 엣지 케이스 검증
- 자동화된 회귀 테스트
- 개발 환경에서 에이전트 통합 테스트

## 설정

```json5
{
  channels: {
    qa: {
      enabled: true,
      dmPolicy: "open",
    },
  },
}
```

## CLI를 통한 테스트

게이트웨이가 실행 중인 상태에서 CLI를 사용하여 QA 채널로 메시지를 보냅니다:

```bash
openclaw message send --channel qa --target test-user --message "안녕하세요!"
```

응답 모니터링:

```bash
openclaw logs --follow
```

## 자동화된 테스트

스크립트에서 QA 채널 사용:

```bash
#!/bin/bash
# 에이전트 응답 테스트

openclaw message send --channel qa --target test-user \
  --message "현재 시간은 무엇입니까?" \
  --wait-reply

openclaw message send --channel qa --target test-user \
  --message "한국의 수도는 어디입니까?" \
  --wait-reply
```

## WebChat과의 차이점

WebChat UI는 인터랙티브 테스트를 위한 시각적 인터페이스를 제공합니다. QA 채널은 스크립팅 가능한 테스트 인터페이스로, 자동화된 테스트 및 CI/CD 파이프라인에 더 적합합니다.

## 구성 참조

- `channels.qa.enabled`: QA 채널 활성화/비활성화.
- `channels.qa.dmPolicy`: DM 접근 정책 (테스트 목적으로 `open` 권장).
- `channels.qa.allowFrom`: 허용된 테스트 사용자 ID 목록.

## 관련 문서

- [채널 개요](/channels/)
- [채널 라우팅](/channels/channel-routing)
- [게이트웨이 구성](/gateway/configuration)
