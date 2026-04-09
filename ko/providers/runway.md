---
title: "Runway"
summary: "OpenClaw에서 Runway 비디오 생성 설정"
read_when:
  - OpenClaw에서 Runway 비디오 생성을 사용하려는 경우
  - Runway API 키/환경 설정이 필요한 경우
  - Runway를 기본 비디오 프로바이더로 설정하려는 경우
---

# Runway

OpenClaw는 호스팅 비디오 생성을 위한 번들 `runway` 프로바이더를 제공합니다.

- 프로바이더 id: `runway`
- 인증: `RUNWAYML_API_SECRET` (표준) 또는 `RUNWAY_API_KEY`
- API: Runway 작업 기반 비디오 생성 (`GET /v1/tasks/{id}` 폴링)

## 빠른 시작

1. API 키 설정:

```bash
openclaw onboard --auth-choice runway-api-key
```

2. Runway를 기본 비디오 프로바이더로 설정:

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "runway/gen4.5"
```

3. 에이전트에게 비디오 생성을 요청하십시오. Runway가 자동으로 사용됩니다.

## 지원 모드

| 모드           | 모델               | 참조 입력               |
| -------------- | ------------------ | ----------------------- |
| 텍스트-투-비디오 | `gen4.5` (기본값)  | 없음                    |
| 이미지-투-비디오 | `gen4.5`           | 로컬 또는 원격 이미지 1개 |
| 비디오-투-비디오 | `gen4_aleph`       | 로컬 또는 원격 비디오 1개 |

- 로컬 이미지 및 비디오 참조는 데이터 URI를 통해 지원됩니다.
- 비디오-투-비디오는 현재 `runway/gen4_aleph`가 특별히 필요합니다.
- 텍스트 전용 실행은 현재 `16:9` 및 `9:16` 종횡비를 노출합니다.

## 구성

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "runway/gen4.5",
      },
    },
  },
}
```

## 관련

- [비디오 생성](/tools/video-generation) -- 공유 도구 파라미터, 프로바이더 선택 및 비동기 동작
- [구성 참조](/gateway/configuration-reference#agent-defaults)
