---
title: "위치 명령"
description: "노드에 대한 위치 명령 (location.get), 권한 모드, Android 포그라운드 동작"
---

# 위치 명령 (노드)

## TL;DR

- `location.get`은 노드 명령입니다 (`node.invoke`를 통해).
- 기본적으로 꺼져 있습니다.
- Android 앱 설정은 선택기를 사용합니다: 꺼짐 / 사용 중.
- 별도 토글: 정밀 위치.

## 선택기를 사용하는 이유 (스위치 대신)

OS 권한은 다중 레벨입니다. 앱 내에서 선택기를 노출할 수 있지만 실제 부여는 OS가 결정합니다.

- iOS/macOS는 시스템 프롬프트/설정에서 **사용 중** 또는 **항상**을 노출할 수 있습니다.
- Android 앱은 현재 포그라운드 위치만 지원합니다.
- 정밀 위치는 별도의 부여입니다 (iOS 14+ "정밀", Android "fine" vs "coarse").

UI의 선택기는 요청된 모드를 구동합니다. 실제 부여는 OS 설정에 있습니다.

## 설정 모델

노드 기기별:

- `location.enabledMode`: `off | whileUsing`
- `location.preciseEnabled`: bool

UI 동작:

- `whileUsing` 선택 시 포그라운드 권한을 요청합니다.
- OS가 요청된 수준을 거부하면 부여된 최고 수준으로 되돌아가고 상태를 표시합니다.

## 권한 매핑 (node.permissions)

선택 사항. macOS 노드는 권한 맵을 통해 `location`을 보고합니다. iOS/Android는 생략할 수 있습니다.

## 명령: `location.get`

`node.invoke`를 통해 호출됩니다.

매개변수 (제안):

```json
{
  "timeoutMs": 10000,
  "maxAgeMs": 15000,
  "desiredAccuracy": "coarse|balanced|precise"
}
```

응답 페이로드:

```json
{
  "lat": 48.20849,
  "lon": 16.37208,
  "accuracyMeters": 12.5,
  "altitudeMeters": 182.0,
  "speedMps": 0.0,
  "headingDeg": 270.0,
  "timestamp": "2026-01-03T12:34:56.000Z",
  "isPrecise": true,
  "source": "gps|wifi|cell|unknown"
}
```

오류 (안정적 코드):

- `LOCATION_DISABLED`: 선택기가 꺼져 있습니다.
- `LOCATION_PERMISSION_REQUIRED`: 요청된 모드에 대한 권한이 없습니다.
- `LOCATION_BACKGROUND_UNAVAILABLE`: 앱이 백그라운드 상태이지만 사용 중만 허용됩니다.
- `LOCATION_TIMEOUT`: 시간 내에 위치를 가져오지 못했습니다.
- `LOCATION_UNAVAILABLE`: 시스템 오류 / 프로바이더 없음.

## 백그라운드 동작

- Android 앱은 백그라운드 상태에서 `location.get`을 거부합니다.
- Android에서 위치를 요청할 때 OpenClaw를 열어 두십시오.
- 다른 노드 플랫폼은 다를 수 있습니다.

## 모델/도구 통합

- 도구 표면: `nodes` 도구가 `location_get` 액션을 추가합니다 (노드 필요).
- CLI: `openclaw nodes location get --node &lt;id&gt;`.
- 에이전트 지침: 사용자가 위치를 활성화하고 범위를 이해한 경우에만 호출하십시오.

## UX 문구 (제안)

- 꺼짐: "위치 공유가 비활성화되었습니다."
- 사용 중: "OpenClaw가 열려 있을 때만."
- 정밀: "정밀 GPS 위치를 사용합니다. 대략적인 위치를 공유하려면 토글을 끄십시오."
