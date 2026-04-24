---
summary: "OpenClaw에서 fal 이미지 및 비디오 생성 설정"
title: "Fal"
read_when:
  - OpenClaw에서 fal 이미지 생성을 사용하고 싶을 때
  - FAL_KEY 인증 플로우가 필요할 때
  - image_generate 또는 video_generate의 fal 기본값이 필요할 때
---

OpenClaw에는 호스팅 이미지 및 비디오 생성을 위한 `fal` 프로바이더가 번들로 포함되어 있습니다.

| 속성     | 값                                                            |
| -------- | ------------------------------------------------------------- |
| 프로바이더 | `fal`                                                         |
| 인증     | `FAL_KEY` (기본 권장 키; `FAL_API_KEY`도 폴백(fallback)으로 동작) |
| API      | fal 모델 엔드포인트                                            |

## 시작하기

<Steps>
  <Step title="API 키 설정">
    ```bash
    openclaw onboard --auth-choice fal-api-key
    ```
  </Step>
  <Step title="기본 이미지 모델 설정">
    ```json5
    {
      agents: {
        defaults: {
          imageGenerationModel: {
            primary: "fal/fal-ai/flux/dev",
          },
        },
      },
    }
    ```
  </Step>
</Steps>

## 이미지 생성

번들된 `fal` 이미지 생성 프로바이더의 기본값은
`fal/fal-ai/flux/dev`입니다.

| 기능          | 값                         |
| -------------- | -------------------------- |
| 최대 이미지 수 | 요청당 4장                 |
| 편집 모드      | 활성화, 레퍼런스 이미지 1장 |
| 크기 오버라이드| 지원                       |
| 종횡비         | 지원                       |
| 해상도         | 지원                       |

<Warning>
fal 이미지 편집 엔드포인트는 `aspectRatio` 오버라이드를 **지원하지 않습니다.**
</Warning>

fal을 기본 이미지 프로바이더로 사용하려면 다음과 같이 설정합니다.

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "fal/fal-ai/flux/dev",
      },
    },
  },
}
```

## 비디오 생성

번들된 `fal` 비디오 생성 프로바이더의 기본값은
`fal/fal-ai/minimax/video-01-live`입니다.

| 기능    | 값                                                          |
| ------- | ----------------------------------------------------------- |
| 모드    | 텍스트-투-비디오, 단일 이미지 레퍼런스                      |
| 런타임  | 장시간 실행되는 작업을 위한 큐 기반 submit/status/result 플로우 |

<AccordionGroup>
  <Accordion title="사용 가능한 비디오 모델">
    **HeyGen video-agent:**

    - `fal/fal-ai/heygen/v2/video-agent`

    **Seedance 2.0:**

    - `fal/bytedance/seedance-2.0/fast/text-to-video`
    - `fal/bytedance/seedance-2.0/fast/image-to-video`
    - `fal/bytedance/seedance-2.0/text-to-video`
    - `fal/bytedance/seedance-2.0/image-to-video`

  </Accordion>

  <Accordion title="Seedance 2.0 설정 예시">
    ```json5
    {
      agents: {
        defaults: {
          videoGenerationModel: {
            primary: "fal/bytedance/seedance-2.0/fast/text-to-video",
          },
        },
      },
    }
    ```
  </Accordion>

  <Accordion title="HeyGen video-agent 설정 예시">
    ```json5
    {
      agents: {
        defaults: {
          videoGenerationModel: {
            primary: "fal/fal-ai/heygen/v2/video-agent",
          },
        },
      },
    }
    ```
  </Accordion>
</AccordionGroup>

<Tip>
최근에 추가된 항목을 포함해 사용 가능한 fal 모델 전체 목록을 보려면 `openclaw models list --provider fal`을 사용하세요.
</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="이미지 생성" href="/tools/image-generation" icon="image">
    공통 이미지 도구 파라미터와 프로바이더 선택.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    공통 비디오 도구 파라미터와 프로바이더 선택.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/config-agents#agent-defaults" icon="gear">
    이미지 및 비디오 모델 선택을 포함한 에이전트 기본값.
  </Card>
</CardGroup>
