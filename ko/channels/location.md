---
summary: "채널을 통한 위치 메시지 처리 및 전송"
read_when:
  - 위치 메시지 처리 구성 시
  - 위치 데이터를 전송해야 하는 경우
title: "위치"
---

# 위치

OpenClaw는 지원되는 채널에서 인바운드 및 아웃바운드 위치 메시지를 처리합니다.

## 지원 채널

위치 메시지 지원은 채널마다 다릅니다:

| 채널      | 인바운드 | 아웃바운드 |
| --------- | -------- | ---------- |
| WhatsApp  | 예       | 예         |
| Telegram  | 예       | 예         |
| Signal    | 예       | 아니오     |
| iMessage  | 예       | 아니오     |

## 인바운드 위치 메시지

사용자가 위치를 공유하면 OpenClaw는 에이전트에게 다음 컨텍스트를 제공합니다:

- 위도 및 경도
- 선택 사항: 주소/장소 이름 (채널이 제공하는 경우)
- 선택 사항: 실시간 위치 공유 정보

에이전트는 이 정보를 도구 호출이나 응답에서 사용할 수 있습니다.

## 아웃바운드 위치 전송

### Telegram

```json5
{
  action: "send",
  channel: "telegram",
  to: "123456789",
  location: {
    latitude: 37.5665,
    longitude: 126.9780,
  },
}
```

실시간 위치 (기간 포함):

```json5
{
  action: "send",
  channel: "telegram",
  to: "123456789",
  location: {
    latitude: 37.5665,
    longitude: 126.9780,
    livePeriod: 3600,
  },
}
```

### WhatsApp

```json5
{
  action: "send",
  channel: "whatsapp",
  to: "+15555550100",
  location: {
    latitude: 37.5665,
    longitude: 126.9780,
    name: "서울 시청",
    address: "서울특별시 중구 세종대로 110",
  },
}
```

## 에이전트에서 위치 처리

에이전트는 메시지 도구를 통해 위치를 전송할 수 있습니다:

```
메시지 도구 사용: 사용자의 현재 위치 근처 식당 목록 제공 후 지도 위치 공유
```

## 구성

특별한 구성은 필요하지 않습니다. 위치 지원은 채널이 활성화되어 있고 위치 메시지를 지원하는 경우 자동으로 활성화됩니다.

위치 처리를 비활성화하려면 (Telegram의 경우):

```json5
{
  channels: {
    telegram: {
      actions: {
        sendLocation: false,
      },
    },
  },
}
```

## 관련 문서

- [WhatsApp](/channels/whatsapp)
- [Telegram](/channels/telegram)
- [채널 개요](/channels)
