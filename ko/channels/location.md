---
summary: "인바운드 채널 위치 파싱 (Telegram/WhatsApp/Matrix) 및 컨텍스트 필드"
read_when:
  - 채널 위치 파싱을 추가하거나 수정할 때
  - 에이전트 프롬프트 또는 도구에서 위치 컨텍스트 필드를 사용할 때
title: "채널 위치 파싱"
---

OpenClaw는 채팅 채널에서 공유된 위치를 다음과 같이 정규화합니다:

- 인바운드 본문에 추가되는 간결한 좌표 텍스트, 그리고
- 자동 응답 컨텍스트 페이로드의 구조화된 필드. 채널이 제공하는 레이블, 주소, 캡션/코멘트는 사용자 본문에 인라인으로가 아니라 공유 신뢰할 수 없는 메타데이터 JSON 블록을 통해 프롬프트에 렌더링됩니다.

현재 지원되는 항목:

- **Telegram** (위치 핀 + 장소 + 라이브 위치)
- **WhatsApp** (locationMessage + liveLocationMessage)
- **Matrix** (`geo_uri`가 있는 `m.location`)

## 텍스트 포맷

위치는 대괄호 없이 친숙한 라인으로 렌더링됩니다:

- 핀:
  - `📍 48.858844, 2.294351 ±12m`
- 명명된 장소:
  - `📍 48.858844, 2.294351 ±12m`
- 라이브 공유:
  - `🛰 Live location: 48.858844, 2.294351 ±12m`

채널에 레이블, 주소 또는 캡션/코멘트가 포함된 경우 컨텍스트 페이로드에 보존되며 프롬프트에 펜스된 신뢰할 수 없는 JSON으로 표시됩니다:

````text
Location (untrusted metadata):
```json
{
  "latitude": 48.858844,
  "longitude": 2.294351,
  "name": "Eiffel Tower",
  "address": "Champ de Mars, Paris",
  "caption": "Meet here"
}
```
````

## 컨텍스트 필드

위치가 있는 경우 다음 필드가 `ctx`에 추가됩니다:

- `LocationLat` (숫자)
- `LocationLon` (숫자)
- `LocationAccuracy` (숫자, 미터; 선택)
- `LocationName` (문자열; 선택)
- `LocationAddress` (문자열; 선택)
- `LocationSource` (`pin | place | live`)
- `LocationIsLive` (불리언)
- `LocationCaption` (문자열; 선택)

프롬프트 렌더러는 `LocationName`, `LocationAddress`, `LocationCaption`을 신뢰할 수 없는 메타데이터로 취급하고 다른 채널 컨텍스트와 동일한 제한된 JSON 경로를 통해 직렬화합니다.

## 채널 참고 사항

- **Telegram**: 장소는 `LocationName/LocationAddress`로 매핑됩니다. 라이브 위치는 `live_period`를 사용합니다.
- **WhatsApp**: `locationMessage.comment`와 `liveLocationMessage.caption`이 `LocationCaption`을 채웁니다.
- **Matrix**: `geo_uri`는 핀 위치로 파싱됩니다. 고도는 무시되고 `LocationIsLive`는 항상 false입니다.

## 관련 문서

- [위치 명령 (노드)](/nodes/location-command)
- [카메라 캡처](/nodes/camera)
- [미디어 이해](/nodes/media-understanding)
