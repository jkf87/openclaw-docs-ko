---
summary: "조용한 최종 프리뷰 편집을 위한 수신자별 Matrix push rule"
read_when:
  - 셀프 호스팅 Synapse 또는 Tuwunel에 Matrix quiet 스트리밍을 설정할 때
  - 사용자가 모든 프리뷰 편집이 아닌 완료된 블록에 대해서만 알림을 받고자 할 때
title: "조용한 프리뷰를 위한 Matrix push rule"
---

`channels.matrix.streaming`이 `"quiet"`일 때, OpenClaw는 단일 프리뷰 이벤트를 제자리에서 편집하고 최종화된 편집을 커스텀 content 플래그로 표시합니다. Matrix 클라이언트는 사용자별 push rule이 해당 플래그와 일치할 때만 최종 편집에 대해 알림을 보냅니다. 이 페이지는 Matrix를 셀프 호스팅하며 각 수신자 계정에 해당 rule을 설치하려는 운영자를 위한 것입니다.

표준 Matrix 알림 동작만 원하시면 `streaming: "partial"`을 사용하거나 streaming을 끄십시오. [Matrix 채널 설정](/channels/matrix#streaming-previews)을 참조하세요.

## 사전 요구사항 (Prerequisites)

- recipient user = 알림을 받아야 하는 사람
- bot user = 응답을 보내는 OpenClaw Matrix 계정
- 아래 API 호출에는 recipient user의 access token을 사용합니다
- push rule의 `sender`를 bot user의 전체 MXID와 일치시킵니다
- recipient 계정에는 이미 정상 동작하는 pusher가 있어야 합니다. quiet 프리뷰 rule은 일반 Matrix push 전달이 정상일 때만 작동합니다

## 단계 (Steps)

<Steps>
  <Step title="조용한 프리뷰 구성">

```json5
{
  channels: {
    matrix: {
      streaming: "quiet",
    },
  },
}
```

  </Step>

  <Step title="수신자의 access token 획득">
    가능하다면 기존 클라이언트 세션 토큰을 재사용하세요. 새로 발급하려면:

```bash
curl -sS -X POST \
  "https://matrix.example.org/_matrix/client/v3/login" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "m.login.password",
    "identifier": { "type": "m.id.user", "user": "@alice:example.org" },
    "password": "REDACTED"
  }'
```

  </Step>

  <Step title="pusher 존재 확인">

```bash
curl -sS \
  -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  "https://matrix.example.org/_matrix/client/v3/pushers"
```

pusher가 반환되지 않으면 계속 진행하기 전에 이 계정의 일반 Matrix push 전달을 먼저 고칩니다.

  </Step>

  <Step title="override push rule 설치">
    OpenClaw는 최종화된 텍스트 전용 프리뷰 편집을 `content["com.openclaw.finalized_preview"] = true`로 표시합니다. 해당 마커와 bot MXID를 sender로 일치시키는 rule을 설치하세요:

```bash
curl -sS -X PUT \
  "https://matrix.example.org/_matrix/client/v3/pushrules/global/override/openclaw-finalized-preview-botname" \
  -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "conditions": [
      { "kind": "event_match", "key": "type", "pattern": "m.room.message" },
      {
        "kind": "event_property_is",
        "key": "content.m\\.relates_to.rel_type",
        "value": "m.replace"
      },
      {
        "kind": "event_property_is",
        "key": "content.com\\.openclaw\\.finalized_preview",
        "value": true
      },
      { "kind": "event_match", "key": "sender", "pattern": "@bot:example.org" }
    ],
    "actions": [
      "notify",
      { "set_tweak": "sound", "value": "default" },
      { "set_tweak": "highlight", "value": false }
    ]
  }'
```

    실행 전 교체할 값:

    - `https://matrix.example.org`: 귀하의 홈서버 베이스 URL
    - `$USER_ACCESS_TOKEN`: 수신자 사용자의 access token
    - `openclaw-finalized-preview-botname`: 수신자당 bot마다 고유한 rule ID (패턴: `openclaw-finalized-preview-<botname>`)
    - `@bot:example.org`: 수신자가 아닌, 귀하의 OpenClaw bot MXID

  </Step>

  <Step title="검증">

```bash
curl -sS \
  -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  "https://matrix.example.org/_matrix/client/v3/pushrules/global/override/openclaw-finalized-preview-botname"
```

그런 다음 스트리밍 응답을 테스트합니다. quiet 모드에서는 방에 조용한 드래프트 프리뷰가 표시되고 블록 또는 턴이 끝나면 한 번만 알림이 전송됩니다.

  </Step>
</Steps>

나중에 rule을 제거하려면 수신자의 token으로 동일한 rule URL에 `DELETE`를 보내세요.

## 멀티 bot 참고사항 (Multi-bot notes)

push rule은 `ruleId`로 키가 지정됩니다. 동일한 ID에 대해 `PUT`을 다시 실행하면 단일 rule이 업데이트됩니다. 동일한 수신자에게 알림을 보내는 여러 OpenClaw bot이 있는 경우, 서로 다른 sender 매치를 가진 bot당 하나의 rule을 생성하십시오.

새로운 사용자 정의 `override` rule은 기본 suppress rule보다 앞에 삽입되므로, 추가 순서 매개변수가 필요하지 않습니다. 이 rule은 제자리에서 최종화될 수 있는 텍스트 전용 프리뷰 편집에만 영향을 미칩니다. 미디어 폴백과 stale-preview 폴백은 일반 Matrix 전달을 사용합니다.

## 홈서버 참고사항 (Homeserver notes)

<AccordionGroup>
  <Accordion title="Synapse">
    특별한 `homeserver.yaml` 변경은 필요하지 않습니다. 일반 Matrix 알림이 이미 이 사용자에게 도달하고 있다면, 위의 수신자 token + `pushrules` 호출이 주된 설정 단계입니다.

    Synapse를 리버스 프록시 또는 worker 뒤에서 실행하는 경우, `/_matrix/client/.../pushrules/`가 Synapse에 올바르게 도달하는지 확인하십시오. push 전달은 메인 프로세스 또는 `synapse.app.pusher` / 구성된 pusher worker에서 처리됩니다. 이들이 정상인지 확인하십시오.

  </Accordion>

  <Accordion title="Tuwunel">
    Synapse와 동일한 흐름입니다. 최종화된 프리뷰 마커에 대해 Tuwunel 전용 구성은 필요하지 않습니다.

    사용자가 다른 디바이스에서 활성 상태일 때 알림이 사라진다면, `suppress_push_when_active`가 활성화되어 있는지 확인하세요. Tuwunel은 1.4.2 (2025년 9월)에서 이 옵션을 추가했으며, 이는 한 디바이스가 활성일 때 다른 디바이스로의 push를 의도적으로 억제할 수 있습니다.

  </Accordion>
</AccordionGroup>

## 관련 (Related)

- [Matrix 채널 설정](/channels/matrix)
- [Streaming 개념](/concepts/streaming)
