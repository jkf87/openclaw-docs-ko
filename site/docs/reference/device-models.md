---
title: "기기 모델 데이터베이스"
description: "OpenClaw이 macOS 앱에서 친숙한 이름을 위해 Apple 기기 모델 식별자를 제공하는 방법."
---

# 기기 모델 데이터베이스 (친숙한 이름)

macOS 동반 앱은 Apple 모델 식별자(예: `iPad16,6`, `Mac16,6`)를 사람이 읽을 수 있는 이름에 매핑하여 **Instances** UI에 친숙한 Apple 기기 모델 이름을 표시합니다.

매핑은 JSON으로 제공됩니다:

- `apps/macos/Sources/OpenClaw/Resources/DeviceModels/`

## 데이터 소스

현재 MIT 라이선스 저장소에서 매핑을 제공합니다:

- `kyle-seongwoo-jun/apple-device-identifiers`

빌드를 결정적으로 유지하기 위해 JSON 파일은 특정 업스트림 커밋에 고정됩니다 (`apps/macos/Sources/OpenClaw/Resources/DeviceModels/NOTICE.md`에 기록됨).

## 데이터베이스 업데이트

1. 고정하려는 업스트림 커밋을 선택합니다 (iOS용 하나, macOS용 하나).
2. `apps/macos/Sources/OpenClaw/Resources/DeviceModels/NOTICE.md`에서 커밋 해시를 업데이트합니다.
3. 해당 커밋에 고정된 JSON 파일을 다시 다운로드합니다:

```bash
IOS_COMMIT="&lt;commit sha for ios-device-identifiers.json&gt;"
MAC_COMMIT="&lt;commit sha for mac-device-identifiers.json&gt;"

curl -fsSL "https://raw.githubusercontent.com/kyle-seongwoo-jun/apple-device-identifiers/${IOS_COMMIT}/ios-device-identifiers.json" \
  -o apps/macos/Sources/OpenClaw/Resources/DeviceModels/ios-device-identifiers.json

curl -fsSL "https://raw.githubusercontent.com/kyle-seongwoo-jun/apple-device-identifiers/${MAC_COMMIT}/mac-device-identifiers.json" \
  -o apps/macos/Sources/OpenClaw/Resources/DeviceModels/mac-device-identifiers.json
```

4. `apps/macos/Sources/OpenClaw/Resources/DeviceModels/LICENSE.apple-device-identifiers.txt`가 업스트림과 여전히 일치하는지 확인합니다 (업스트림 라이선스가 변경된 경우 교체하십시오).
5. macOS 앱이 깨끗하게 빌드되는지 확인합니다 (경고 없음):

```bash
swift build --package-path apps/macos
```
