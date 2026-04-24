---
summary: "결정적인 OpenClaw QA 시나리오를 위한 합성 Slack 계열 채널 플러그인"
title: "QA 채널"
read_when:
  - 로컬 또는 CI 테스트 실행에 합성 QA 트랜스포트를 연결할 때
  - 번들된 qa-channel 구성 서피스가 필요할 때
  - 엔드 투 엔드 QA 자동화를 반복 작업할 때
---

`qa-channel`은 자동화된 OpenClaw QA를 위한 번들 합성 메시지 트랜스포트입니다.

프로덕션 채널이 아닙니다. 실제 트랜스포트가 사용하는 동일한 채널 플러그인
경계를 동일하게 검증하면서 상태를 결정적이고 완전히 검사 가능하게
유지하기 위해 존재합니다.

## 오늘의 기능

- Slack 계열 타겟 문법:
  - `dm:<user>`
  - `channel:<room>`
  - `thread:<room>/<thread>`
- 다음을 위한 HTTP 기반 합성 버스:
  - 인바운드 메시지 주입
  - 아웃바운드 트랜스크립트 캡처
  - 스레드 생성
  - 반응
  - 편집
  - 삭제
  - 검색 및 읽기 액션
- Markdown 보고서를 작성하는 번들된 호스트 측 셀프 체크 러너

## 구성

```json
{
  "channels": {
    "qa-channel": {
      "baseUrl": "http://127.0.0.1:43123",
      "botUserId": "openclaw",
      "botDisplayName": "OpenClaw QA",
      "allowFrom": ["*"],
      "pollTimeoutMs": 1000
    }
  }
}
```

지원되는 계정 키:

- `baseUrl`
- `botUserId`
- `botDisplayName`
- `pollTimeoutMs`
- `allowFrom`
- `defaultTo`
- `actions.messages`
- `actions.reactions`
- `actions.search`
- `actions.threads`

## 러너

현재 수직 슬라이스:

```bash
pnpm qa:e2e
```

이제 번들된 `qa-lab` 확장을 통해 라우팅됩니다. 인리포 QA 버스를 시작하고,
번들된 `qa-channel` 런타임 슬라이스를 부팅하며, 결정적인 셀프 체크를 실행하고,
`.artifacts/qa-e2e/` 아래에 Markdown 보고서를 작성합니다.

프라이빗 디버거 UI:

```bash
pnpm qa:lab:up
```

이 명령 하나가 QA 사이트를 빌드하고, Docker 기반 게이트웨이 + QA Lab
스택을 시작하며, QA Lab URL을 출력합니다. 해당 사이트에서 시나리오를 선택하고,
모델 레인을 선택하며, 개별 실행을 시작하고, 결과를 실시간으로 볼 수 있습니다.

전체 리포지토리 기반 QA 스위트:

```bash
pnpm openclaw qa suite
```

이는 출시된 Control UI 번들과는 별도로 로컬 URL에서 프라이빗 QA 디버거를
시작합니다.

## 범위

현재 범위는 의도적으로 좁게 설정되어 있습니다:

- 버스 + 플러그인 트랜스포트
- 스레드 라우팅 문법
- 채널 소유 메시지 액션
- Markdown 보고
- 실행 컨트롤이 있는 Docker 기반 QA 사이트

후속 작업에서 추가될 항목:

- 프로바이더/모델 매트릭스 실행
- 더 풍부한 시나리오 디스커버리
- 이후의 OpenClaw 네이티브 오케스트레이션

## 관련 문서

- [페어링](/channels/pairing)
- [그룹](/channels/groups)
- [채널 개요](/channels/)
