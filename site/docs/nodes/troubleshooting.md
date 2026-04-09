---
title: "노드 문제 해결"
description: "노드 페어링, 포그라운드 요구 사항, 권한 및 도구 실패 문제 해결"
---

# 노드 문제 해결

노드가 상태에서 보이지만 노드 도구가 실패할 때 이 페이지를 사용하십시오.

## 명령 사다리

```bash
openclaw status
openclaw gateway status
openclaw logs --follow
openclaw doctor
openclaw channels status --probe
```

그런 다음 노드 특정 확인을 실행하십시오:

```bash
openclaw nodes status
openclaw nodes describe --node &lt;idOrNameOrIp&gt;
openclaw approvals get --node &lt;idOrNameOrIp&gt;
```

정상 신호:

- 노드가 연결되어 있고 `node` 역할로 페어링되어 있습니다.
- `nodes describe`에 호출하는 기능이 포함되어 있습니다.
- 실행 승인에 예상되는 모드/허용 목록이 표시됩니다.

## 포그라운드 요구 사항

`canvas.*`, `camera.*`, `screen.*`은 iOS/Android 노드에서 포그라운드 전용입니다.

빠른 확인 및 수정:

```bash
openclaw nodes describe --node &lt;idOrNameOrIp&gt;
openclaw nodes canvas snapshot --node &lt;idOrNameOrIp&gt;
openclaw logs --follow
```

`NODE_BACKGROUND_UNAVAILABLE`이 표시되면 노드 앱을 포그라운드로 가져와 다시 시도하십시오.

## 권한 매트릭스

| 기능                         | iOS                                       | Android                                       | macOS 노드 앱                | 일반적인 실패 코드             |
| ---------------------------- | ----------------------------------------- | --------------------------------------------- | ----------------------------- | ------------------------------ |
| `camera.snap`, `camera.clip` | 카메라 (+ 클립 오디오의 경우 마이크)       | 카메라 (+ 클립 오디오의 경우 마이크)           | 카메라 (+ 클립 오디오의 경우 마이크) | `*_PERMISSION_REQUIRED`        |
| `screen.record`              | 화면 녹화 (+ 선택적 마이크)               | 화면 캡처 프롬프트 (+ 선택적 마이크)           | 화면 녹화                     | `*_PERMISSION_REQUIRED`        |
| `location.get`               | 모드에 따라 사용 중 또는 항상            | 모드에 따라 포그라운드/백그라운드 위치        | 위치 권한                     | `LOCATION_PERMISSION_REQUIRED` |
| `system.run`                 | 해당 없음 (노드 호스트 경로)              | 해당 없음 (노드 호스트 경로)                  | 실행 승인 필요                | `SYSTEM_RUN_DENIED`            |

## 페어링 대 승인

이것은 서로 다른 게이트입니다:

1. **기기 페어링**: 이 노드가 게이트웨이에 연결할 수 있습니까?
2. **게이트웨이 노드 명령 정책**: RPC 명령 ID가 `gateway.nodes.allowCommands` / `denyCommands` 및 플랫폼 기본값에 의해 허용됩니까?
3. **실행 승인**: 이 노드가 로컬에서 특정 셸 명령을 실행할 수 있습니까?

빠른 확인:

```bash
openclaw devices list
openclaw nodes status
openclaw approvals get --node &lt;idOrNameOrIp&gt;
openclaw approvals allowlist add --node &lt;idOrNameOrIp&gt; "/usr/bin/uname"
```

페어링이 없으면 먼저 노드 기기를 승인하십시오.
`nodes describe`에 명령이 없으면 게이트웨이 노드 명령 정책과 노드가 연결 시 해당 명령을 실제로 선언했는지 확인하십시오.
페어링은 괜찮지만 `system.run`이 실패하면 해당 노드의 실행 승인/허용 목록을 수정하십시오.

노드 페어링은 ID/신뢰 게이트이며 명령별 승인 표면이 아닙니다. `system.run`의 경우 노드별 정책은 게이트웨이 페어링 레코드가 아닌 해당 노드의 실행 승인 파일(`openclaw approvals get --node ...`)에 있습니다.

승인 기반 `host=node` 실행의 경우, 게이트웨이는 또한 준비된 표준 `systemRunPlan`에 실행을 바인딩합니다. 이후 호출자가 승인된 실행이 전달되기 전에 명령/cwd 또는 세션 메타데이터를 변경하면 게이트웨이는 편집된 페이로드를 신뢰하는 대신 실행을 승인 불일치로 거부합니다.

## 일반적인 노드 오류 코드

- `NODE_BACKGROUND_UNAVAILABLE` → 앱이 백그라운드 상태입니다. 포그라운드로 가져오십시오.
- `CAMERA_DISABLED` → 노드 설정에서 카메라 토글이 비활성화되어 있습니다.
- `*_PERMISSION_REQUIRED` → OS 권한이 없거나 거부되었습니다.
- `LOCATION_DISABLED` → 위치 모드가 꺼져 있습니다.
- `LOCATION_PERMISSION_REQUIRED` → 요청된 위치 모드가 부여되지 않았습니다.
- `LOCATION_BACKGROUND_UNAVAILABLE` → 앱이 백그라운드 상태이지만 사용 중 권한만 있습니다.
- `SYSTEM_RUN_DENIED: approval required` → 실행 요청에 명시적 승인이 필요합니다.
- `SYSTEM_RUN_DENIED: allowlist miss` → 허용 목록 모드에서 명령이 차단되었습니다.
  허용 목록 모드에서 Windows 노드 호스트의 경우 `cmd.exe /c ...`와 같은 셸 래퍼 형식은 요청 흐름을 통해 승인되지 않는 한 허용 목록 미스로 처리됩니다.

## 빠른 복구 루프

```bash
openclaw nodes status
openclaw nodes describe --node &lt;idOrNameOrIp&gt;
openclaw approvals get --node &lt;idOrNameOrIp&gt;
openclaw logs --follow
```

여전히 막혀 있다면:

- 기기 페어링을 다시 승인하십시오.
- 노드 앱을 다시 열어 포그라운드로 가져오십시오.
- OS 권한을 다시 부여하십시오.
- 실행 승인 정책을 재생성/조정하십시오.

관련:

- [/nodes/index](/nodes/index)
- [/nodes/camera](/nodes/camera)
- [/nodes/location-command](/nodes/location-command)
- [/tools/exec-approvals](/tools/exec-approvals)
- [/gateway/pairing](/gateway/pairing)
