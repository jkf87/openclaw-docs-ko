---
summary: "OpenClaw에서 ComfyUI 워크플로 기반 이미지, 비디오, 음악 생성 설정"
title: "ComfyUI"
read_when:
  - 로컬 ComfyUI 워크플로를 OpenClaw와 함께 사용하고 싶을 때
  - Comfy Cloud로 이미지, 비디오 또는 음악 워크플로를 사용하고 싶을 때
  - 번들된 comfy 플러그인의 설정 키가 필요할 때
---

OpenClaw는 워크플로 기반 ComfyUI 실행을 위한 번들 `comfy` 플러그인을 제공합니다. 이 플러그인은 전적으로 워크플로 중심이므로, OpenClaw는 일반적인 `size`, `aspectRatio`, `resolution`, `durationSeconds` 또는 TTS 스타일 컨트롤을 여러분의 그래프에 매핑하려고 시도하지 않습니다.

| 속성            | 세부 사항                                                                        |
| --------------- | -------------------------------------------------------------------------------- |
| Provider        | `comfy`                                                                          |
| Models          | `comfy/workflow`                                                                 |
| 공유 표면(Surface) | `image_generate`, `video_generate`, `music_generate`                             |
| 인증            | 로컬 ComfyUI는 불필요. Comfy Cloud는 `COMFY_API_KEY` 또는 `COMFY_CLOUD_API_KEY` 필요 |
| API             | ComfyUI `/prompt` / `/history` / `/view` 및 Comfy Cloud `/api/*`                 |

## 지원 기능

- 워크플로 JSON으로부터 이미지 생성
- 참조 이미지 1장을 업로드한 이미지 편집
- 워크플로 JSON으로부터 비디오 생성
- 참조 이미지 1장으로 비디오 생성
- 공유 `music_generate` 도구를 통한 음악 또는 오디오 생성
- 설정된 노드 또는 일치하는 모든 출력 노드로부터 결과 다운로드

## 시작하기

자신의 기기에서 ComfyUI를 실행할지, Comfy Cloud를 사용할지 선택하세요.

<Tabs>
  <Tab title="로컬(Local)">
    **적합한 경우:** 여러분의 기기 또는 LAN에서 자체 ComfyUI 인스턴스를 실행하는 경우.

    <Steps>
      <Step title="로컬 ComfyUI 실행">
        로컬 ComfyUI 인스턴스가 실행 중인지 확인하세요(기본값: `http://127.0.0.1:8188`).
      </Step>
      <Step title="워크플로 JSON 준비">
        ComfyUI 워크플로 JSON 파일을 내보내거나 생성하세요. 프롬프트 입력 노드와 OpenClaw가 읽어갈 출력 노드의 ID를 기록해두세요.
      </Step>
      <Step title="Provider 설정">
        `mode: "local"`로 설정하고 워크플로 파일을 가리키세요. 다음은 최소한의 이미지 예시입니다:

        ```json5
        {
          models: {
            providers: {
              comfy: {
                mode: "local",
                baseUrl: "http://127.0.0.1:8188",
                image: {
                  workflowPath: "./workflows/flux-api.json",
                  promptNodeId: "6",
                  outputNodeId: "9",
                },
              },
            },
          },
        }
        ```
      </Step>
      <Step title="기본 모델 설정">
        설정한 기능에 대해 OpenClaw가 `comfy/workflow` 모델을 사용하도록 지정하세요:

        ```json5
        {
          agents: {
            defaults: {
              imageGenerationModel: {
                primary: "comfy/workflow",
              },
            },
          },
        }
        ```
      </Step>
      <Step title="확인">
        ```bash
        openclaw models list --provider comfy
        ```
      </Step>
    </Steps>

  </Tab>

  <Tab title="Comfy Cloud">
    **적합한 경우:** 로컬 GPU 리소스를 관리하지 않고 Comfy Cloud에서 워크플로를 실행하는 경우.

    <Steps>
      <Step title="API 키 발급">
        [comfy.org](https://comfy.org)에서 가입한 후 계정 대시보드에서 API 키를 생성하세요.
      </Step>
      <Step title="API 키 설정">
        다음 중 한 가지 방법으로 키를 제공하세요:

        ```bash
        # 환경 변수 (권장)
        export COMFY_API_KEY="your-key"

        # 대체 환경 변수
        export COMFY_CLOUD_API_KEY="your-key"

        # 또는 설정 파일에 인라인으로
        openclaw config set models.providers.comfy.apiKey "your-key"
        ```
      </Step>
      <Step title="워크플로 JSON 준비">
        ComfyUI 워크플로 JSON 파일을 내보내거나 생성하세요. 프롬프트 입력 노드와 출력 노드의 ID를 기록해두세요.
      </Step>
      <Step title="Provider 설정">
        `mode: "cloud"`로 설정하고 워크플로 파일을 가리키세요:

        ```json5
        {
          models: {
            providers: {
              comfy: {
                mode: "cloud",
                image: {
                  workflowPath: "./workflows/flux-api.json",
                  promptNodeId: "6",
                  outputNodeId: "9",
                },
              },
            },
          },
        }
        ```

        <Tip>
        클라우드 모드에서 `baseUrl`의 기본값은 `https://cloud.comfy.org`입니다. 커스텀 클라우드 엔드포인트를 사용하는 경우에만 `baseUrl`을 설정하면 됩니다.
        </Tip>
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              imageGenerationModel: {
                primary: "comfy/workflow",
              },
            },
          },
        }
        ```
      </Step>
      <Step title="확인">
        ```bash
        openclaw models list --provider comfy
        ```
      </Step>
    </Steps>

  </Tab>
</Tabs>

## 설정

Comfy는 공유 최상위 연결 설정과 기능별 워크플로 섹션(`image`, `video`, `music`)을 지원합니다:

```json5
{
  models: {
    providers: {
      comfy: {
        mode: "local",
        baseUrl: "http://127.0.0.1:8188",
        image: {
          workflowPath: "./workflows/flux-api.json",
          promptNodeId: "6",
          outputNodeId: "9",
        },
        video: {
          workflowPath: "./workflows/video-api.json",
          promptNodeId: "12",
          outputNodeId: "21",
        },
        music: {
          workflowPath: "./workflows/music-api.json",
          promptNodeId: "3",
          outputNodeId: "18",
        },
      },
    },
  },
}
```

### 공유 키

| 키                    | 타입                   | 설명                                                                                 |
| --------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| `mode`                | `"local"` 또는 `"cloud"` | 연결 모드.                                                                           |
| `baseUrl`             | string                 | 로컬은 `http://127.0.0.1:8188`, 클라우드는 `https://cloud.comfy.org`가 기본값입니다. |
| `apiKey`              | string                 | 선택적 인라인 키. `COMFY_API_KEY` / `COMFY_CLOUD_API_KEY` 환경 변수의 대체입니다.    |
| `allowPrivateNetwork` | boolean                | 클라우드 모드에서 private/LAN `baseUrl`을 허용합니다.                                |

### 기능별 키

다음 키들은 `image`, `video`, `music` 섹션 내부에 적용됩니다:

| 키                           | 필수 여부 | 기본값   | 설명                                                                       |
| ---------------------------- | --------- | -------- | -------------------------------------------------------------------------- |
| `workflow` 또는 `workflowPath` | 예        | --       | ComfyUI 워크플로 JSON 파일의 경로.                                         |
| `promptNodeId`               | 예        | --       | 텍스트 프롬프트를 받는 노드 ID.                                            |
| `promptInputName`            | 아니오    | `"text"` | 프롬프트 노드의 입력 이름.                                                 |
| `outputNodeId`               | 아니오    | --       | 출력을 읽을 노드 ID. 생략하면 일치하는 모든 출력 노드가 사용됩니다.        |
| `pollIntervalMs`             | 아니오    | --       | 작업 완료를 위한 폴링 간격(밀리초).                                        |
| `timeoutMs`                  | 아니오    | --       | 워크플로 실행에 대한 타임아웃(밀리초).                                     |

`image` 및 `video` 섹션은 다음도 지원합니다:

| 키                    | 필수 여부                           | 기본값    | 설명                                            |
| --------------------- | ----------------------------------- | --------- | ----------------------------------------------- |
| `inputImageNodeId`    | 예 (참조 이미지를 전달하는 경우)    | --        | 업로드된 참조 이미지를 받는 노드 ID.            |
| `inputImageInputName` | 아니오                              | `"image"` | 이미지 노드의 입력 이름.                        |

## 워크플로 세부 사항

<AccordionGroup>
  <Accordion title="이미지 워크플로">
    기본 이미지 모델을 `comfy/workflow`로 설정하세요:

    ```json5
    {
      agents: {
        defaults: {
          imageGenerationModel: {
            primary: "comfy/workflow",
          },
        },
      },
    }
    ```

    **참조 이미지 편집 예시:**

    업로드된 참조 이미지로 이미지 편집을 활성화하려면, 이미지 설정에 `inputImageNodeId`를 추가하세요:

    ```json5
    {
      models: {
        providers: {
          comfy: {
            image: {
              workflowPath: "./workflows/edit-api.json",
              promptNodeId: "6",
              inputImageNodeId: "7",
              inputImageInputName: "image",
              outputNodeId: "9",
            },
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="비디오 워크플로">
    기본 비디오 모델을 `comfy/workflow`로 설정하세요:

    ```json5
    {
      agents: {
        defaults: {
          videoGenerationModel: {
            primary: "comfy/workflow",
          },
        },
      },
    }
    ```

    Comfy 비디오 워크플로는 설정된 그래프를 통해 텍스트-투-비디오 및 이미지-투-비디오를 지원합니다.

    <Note>
    OpenClaw는 입력 비디오를 Comfy 워크플로에 전달하지 않습니다. 입력으로는 텍스트 프롬프트와 단일 참조 이미지만 지원됩니다.
    </Note>

  </Accordion>

  <Accordion title="음악 워크플로">
    번들된 플러그인은 워크플로로 정의된 오디오 또는 음악 출력을 위한 음악 생성 Provider를 등록하며, 공유 `music_generate` 도구를 통해 노출됩니다:

    ```text
    /tool music_generate prompt="Warm ambient synth loop with soft tape texture"
    ```

    `music` 설정 섹션을 사용하여 오디오 워크플로 JSON과 출력 노드를 지정하세요.

  </Accordion>

  <Accordion title="하위 호환성">
    기존의 최상위 레벨 이미지 설정(중첩된 `image` 섹션 없이)도 여전히 동작합니다:

    ```json5
    {
      models: {
        providers: {
          comfy: {
            workflowPath: "./workflows/flux-api.json",
            promptNodeId: "6",
            outputNodeId: "9",
          },
        },
      },
    }
    ```

    OpenClaw는 이러한 레거시 형태를 이미지 워크플로 설정으로 처리합니다. 즉시 마이그레이션할 필요는 없지만, 새로운 설정에는 중첩된 `image` / `video` / `music` 섹션을 권장합니다.

    <Tip>
    이미지 생성만 사용하는 경우, 레거시 플랫 설정과 새로운 중첩 `image` 섹션은 기능적으로 동등합니다.
    </Tip>

  </Accordion>

  <Accordion title="라이브 테스트">
    번들된 플러그인에 대한 옵트인 라이브 커버리지가 존재합니다:

    ```bash
    OPENCLAW_LIVE_TEST=1 COMFY_LIVE_TEST=1 pnpm test:live -- extensions/comfy/comfy.live.test.ts
    ```

    라이브 테스트는 일치하는 Comfy 워크플로 섹션이 설정되어 있지 않으면 개별 이미지, 비디오, 음악 케이스를 건너뜁니다.

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="이미지 생성" href="/tools/image-generation" icon="image">
    이미지 생성 도구 설정 및 사용법.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    비디오 생성 도구 설정 및 사용법.
  </Card>
  <Card title="음악 생성" href="/tools/music-generation" icon="music">
    음악 및 오디오 생성 도구 설정.
  </Card>
  <Card title="Provider 디렉토리" href="/providers/" icon="layers">
    모든 Provider 및 모델 참조에 대한 개요.
  </Card>
  <Card title="설정 참조" href="/gateway/config-agents#agent-defaults" icon="gear">
    에이전트 기본값을 포함한 전체 설정 참조.
  </Card>
</CardGroup>
