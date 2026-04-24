---
summary: "OpenClaw에서 Alibaba Model Studio Wan 영상 생성 사용하기"
title: "Alibaba Model Studio"
read_when:
  - OpenClaw에서 Alibaba Wan 영상 생성을 사용하고 싶을 때
  - 영상 생성을 위한 Model Studio 또는 DashScope API 키 설정이 필요할 때
---

OpenClaw는 Alibaba Model Studio / DashScope에서 Wan 모델을 사용하기 위한 번들
`alibaba` 영상 생성 프로바이더를 제공합니다.

- 프로바이더: `alibaba`
- 선호 인증: `MODELSTUDIO_API_KEY`
- 허용되는 추가 인증: `DASHSCOPE_API_KEY`, `QWEN_API_KEY`
- API: DashScope / Model Studio 비동기 영상 생성

## 시작하기

<Steps>
  <Step title="API 키 설정">
    ```bash
    openclaw onboard --auth-choice qwen-standard-api-key
    ```
  </Step>
  <Step title="기본 영상 모델 설정">
    ```json5
    {
      agents: {
        defaults: {
          videoGenerationModel: {
            primary: "alibaba/wan2.6-t2v",
          },
        },
      },
    }
    ```
  </Step>
  <Step title="프로바이더가 사용 가능한지 확인">
    ```bash
    openclaw models list --provider alibaba
    ```
  </Step>
</Steps>

<Note>
허용되는 인증 키(`MODELSTUDIO_API_KEY`, `DASHSCOPE_API_KEY`, `QWEN_API_KEY`) 중 어느 것이든 동작합니다. `qwen-standard-api-key` 온보딩 선택지는 공유 DashScope 자격증명을 구성합니다.
</Note>

## 내장 Wan 모델

번들 `alibaba` 프로바이더는 현재 다음을 등록합니다.

| 모델 ref                   | 모드                       |
| -------------------------- | -------------------------- |
| `alibaba/wan2.6-t2v`       | Text-to-video              |
| `alibaba/wan2.6-i2v`       | Image-to-video             |
| `alibaba/wan2.6-r2v`       | Reference-to-video         |
| `alibaba/wan2.6-r2v-flash` | Reference-to-video (고속)  |
| `alibaba/wan2.7-r2v`       | Reference-to-video         |

## 현재 제한

| 파라미터              | 제한                                                          |
| --------------------- | ------------------------------------------------------------- |
| 출력 영상             | 요청당 최대 **1**개                                           |
| 입력 이미지           | 최대 **1**개                                                  |
| 입력 영상             | 최대 **4**개                                                  |
| 길이                  | 최대 **10초**                                                 |
| 지원 컨트롤           | `size`, `aspectRatio`, `resolution`, `audio`, `watermark`     |
| 레퍼런스 이미지/영상  | 원격 `http(s)` URL만 지원                                     |

<Warning>
레퍼런스 이미지/영상 모드는 현재 **원격 http(s) URL**만 요구합니다. 레퍼런스 입력에는 로컬 파일 경로가 지원되지 않습니다.
</Warning>

## 고급 설정

<AccordionGroup>
  <Accordion title="Qwen과의 관계">
    번들 `qwen` 프로바이더 또한 Wan 영상 생성을 위해 Alibaba 호스팅 DashScope
    엔드포인트를 사용합니다. 다음과 같이 사용하세요.

    - 정식 Qwen 프로바이더 표면을 원하면 `qwen/...`
    - 벤더 직속 Wan 영상 표면을 원하면 `alibaba/...`

    자세한 내용은 [Qwen 프로바이더 문서](/providers/qwen)를 참고하세요.

  </Accordion>

  <Accordion title="인증 키 우선순위">
    OpenClaw는 다음 순서로 인증 키를 확인합니다.

    1. `MODELSTUDIO_API_KEY` (선호)
    2. `DASHSCOPE_API_KEY`
    3. `QWEN_API_KEY`

    이 중 어느 것이든 `alibaba` 프로바이더를 인증합니다.

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="영상 생성" href="/tools/video-generation" icon="video">
    공유 영상 도구 파라미터와 프로바이더 선택.
  </Card>
  <Card title="Qwen" href="/providers/qwen" icon="microchip">
    Qwen 프로바이더 설정과 DashScope 연동.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/config-agents#agent-defaults" icon="gear">
    에이전트 기본값과 모델 설정.
  </Card>
</CardGroup>
