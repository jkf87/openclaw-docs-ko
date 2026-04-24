---
summary: "Nextcloud Talk 지원 상태, 기능 및 구성"
read_when:
  - Nextcloud Talk 채널 기능 작업 시
title: "Nextcloud Talk"
---

상태: 번들 플러그인 (webhook 봇). 다이렉트 메시지, 룸, 반응, 마크다운 메시지가 지원됩니다.

## 번들 플러그인

Nextcloud Talk은 현재 OpenClaw 릴리스에 번들 플러그인으로 포함되어 있으므로,
일반 패키지 빌드에서는 별도 설치가 필요하지 않습니다.

구버전 빌드이거나 Nextcloud Talk이 제외된 커스텀 설치를 사용 중인 경우
수동으로 설치하세요.

CLI(npm 레지스트리)를 통한 설치:

```bash
openclaw plugins install @openclaw/nextcloud-talk
```

로컬 체크아웃 (git 저장소에서 실행 시):

```bash
openclaw plugins install ./path/to/local/nextcloud-talk-plugin
```

자세한 내용: [플러그인](/tools/plugin)

## 빠른 설정 (초보자용)

1. Nextcloud Talk 플러그인이 사용 가능한지 확인합니다.
   - 현재 패키지된 OpenClaw 릴리스에는 이미 번들되어 있습니다.
   - 구버전/커스텀 설치는 위의 명령으로 수동 추가할 수 있습니다.
2. Nextcloud 서버에서 봇을 생성합니다:

   ```bash
   ./occ talk:bot:install "OpenClaw" "<shared-secret>" "<webhook-url>" --feature reaction
   ```

3. 대상 룸 설정에서 봇을 활성화합니다.
4. OpenClaw를 구성합니다:
   - 설정: `channels.nextcloud-talk.baseUrl` + `channels.nextcloud-talk.botSecret`
   - 또는 환경 변수: `NEXTCLOUD_TALK_BOT_SECRET` (기본 계정만)
5. 게이트웨이를 재시작합니다 (또는 설정을 마무리합니다).

최소 구성:

```json5
{
  channels: {
    "nextcloud-talk": {
      enabled: true,
      baseUrl: "https://cloud.example.com",
      botSecret: "shared-secret",
      dmPolicy: "pairing",
    },
  },
}
```

## 참고 사항

- 봇은 DM을 먼저 시작할 수 없습니다. 사용자가 먼저 봇에게 메시지를 보내야 합니다.
- webhook URL은 게이트웨이에서 접근 가능해야 하며, 프록시 뒤에 있다면 `webhookPublicUrl`을 설정하세요.
- 봇 API에서는 미디어 업로드가 지원되지 않습니다. 미디어는 URL로 전송됩니다.
- webhook 페이로드는 DM과 룸을 구분하지 않으므로, 룸 타입 조회를 활성화하려면 `apiUser` + `apiPassword`를 설정하세요 (그렇지 않으면 DM이 룸으로 처리됩니다).

## 접근 제어 (DM)

- 기본값: `channels.nextcloud-talk.dmPolicy = "pairing"`. 알 수 없는 발신자는 페어링 코드를 받습니다.
- 다음을 통해 승인:
  - `openclaw pairing list nextcloud-talk`
  - `openclaw pairing approve nextcloud-talk <CODE>`
- 공개 DM: `channels.nextcloud-talk.dmPolicy="open"`에 `channels.nextcloud-talk.allowFrom=["*"]`를 추가.
- `allowFrom`은 Nextcloud 사용자 ID만 매칭합니다. 표시 이름은 무시됩니다.

## 룸 (그룹)

- 기본값: `channels.nextcloud-talk.groupPolicy = "allowlist"` (멘션 게이팅).
- `channels.nextcloud-talk.rooms`로 룸 허용 목록을 지정:

```json5
{
  channels: {
    "nextcloud-talk": {
      rooms: {
        "room-token": { requireMention: true },
      },
    },
  },
}
```

- 룸을 허용하지 않으려면 허용 목록을 비우거나 `channels.nextcloud-talk.groupPolicy="disabled"`로 설정하세요.

## 기능

| 기능            | 상태          |
| --------------- | ------------- |
| 다이렉트 메시지 | 지원됨        |
| 룸              | 지원됨        |
| 스레드          | 지원 안 됨    |
| 미디어          | URL 전용      |
| 반응            | 지원됨        |
| 네이티브 명령   | 지원 안 됨    |

## 구성 참조 (Nextcloud Talk)

전체 구성: [구성](/gateway/configuration)

프로바이더 옵션:

- `channels.nextcloud-talk.enabled`: 채널 시작 활성화/비활성화.
- `channels.nextcloud-talk.baseUrl`: Nextcloud 인스턴스 URL.
- `channels.nextcloud-talk.botSecret`: 봇 공유 비밀.
- `channels.nextcloud-talk.botSecretFile`: 일반 파일 비밀 경로. 심볼릭 링크는 거부됩니다.
- `channels.nextcloud-talk.apiUser`: 룸 조회(DM 감지)용 API 사용자.
- `channels.nextcloud-talk.apiPassword`: 룸 조회용 API/앱 비밀번호.
- `channels.nextcloud-talk.apiPasswordFile`: API 비밀번호 파일 경로.
- `channels.nextcloud-talk.webhookPort`: webhook 리스너 포트 (기본값: 8788).
- `channels.nextcloud-talk.webhookHost`: webhook 호스트 (기본값: 0.0.0.0).
- `channels.nextcloud-talk.webhookPath`: webhook 경로 (기본값: /nextcloud-talk-webhook).
- `channels.nextcloud-talk.webhookPublicUrl`: 외부에서 접근 가능한 webhook URL.
- `channels.nextcloud-talk.dmPolicy`: `pairing | allowlist | open | disabled`.
- `channels.nextcloud-talk.allowFrom`: DM 허용 목록 (사용자 ID). `open`은 `"*"`가 필요합니다.
- `channels.nextcloud-talk.groupPolicy`: `allowlist | open | disabled`.
- `channels.nextcloud-talk.groupAllowFrom`: 그룹 허용 목록 (사용자 ID).
- `channels.nextcloud-talk.rooms`: 룸별 설정과 허용 목록.
- `channels.nextcloud-talk.historyLimit`: 그룹 히스토리 제한 (0은 비활성화).
- `channels.nextcloud-talk.dmHistoryLimit`: DM 히스토리 제한 (0은 비활성화).
- `channels.nextcloud-talk.dms`: DM별 재정의 (historyLimit).
- `channels.nextcloud-talk.textChunkLimit`: 아웃바운드 텍스트 청크 크기 (문자).
- `channels.nextcloud-talk.chunkMode`: `length` (기본값) 또는 `newline` — 길이 청크 전에 빈 줄(단락 경계)에서 분할.
- `channels.nextcloud-talk.blockStreaming`: 이 채널에서 블록 스트리밍 비활성화.
- `channels.nextcloud-talk.blockStreamingCoalesce`: 블록 스트리밍 병합 튜닝.
- `channels.nextcloud-talk.mediaMaxMb`: 인바운드 미디어 상한 (MB).

## 관련 문서

- [채널 개요](/channels/) — 지원되는 모든 채널
- [페어링](/channels/pairing) — DM 인증 및 페어링 플로우
- [그룹](/channels/groups) — 그룹 채팅 동작 및 멘션 게이팅
- [채널 라우팅](/channels/channel-routing) — 메시지의 세션 라우팅
- [보안](/gateway/security/) — 접근 모델 및 강화
