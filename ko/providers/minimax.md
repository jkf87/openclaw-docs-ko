---
summary: "OpenClaw에서 MiniMax 모델 사용"
read_when:
  - OpenClaw에서 MiniMax 모델을 원하는 경우
  - MiniMax 설정 안내가 필요한 경우
title: "MiniMax"
---

OpenClaw의 MiniMax 프로바이더는 기본적으로 **MiniMax M2.7**을 사용합니다.

MiniMax는 또한 다음을 제공합니다:

- T2A v2를 통한 번들 음성 합성
- `MiniMax-VL-01`을 통한 번들 이미지 이해
- `music-2.5+`를 통한 번들 음악 생성
- MiniMax Coding Plan 검색 API를 통한 번들 `web_search`

프로바이더 분리:

| 프로바이더 ID    | 인증    | 기능                                                            |
| ---------------- | ------- | --------------------------------------------------------------- |
| `minimax`        | API 키  | 텍스트, 이미지 생성, 이미지 이해, 음성, web search              |
| `minimax-portal` | OAuth   | 텍스트, 이미지 생성, 이미지 이해                                |

## 내장 카탈로그

| Model                    | 유형             | 설명                                     |
| ------------------------ | ---------------- | ---------------------------------------- |
| `MiniMax-M2.7`           | Chat (reasoning) | 기본 호스팅 reasoning 모델               |
| `MiniMax-M2.7-highspeed` | Chat (reasoning) | 더 빠른 M2.7 reasoning 티어              |
| `MiniMax-VL-01`          | Vision           | 이미지 이해 모델                         |
| `image-01`               | 이미지 생성      | Text-to-image 및 image-to-image 편집     |
| `music-2.5+`             | 음악 생성        | 기본 음악 모델                           |
| `music-2.5`              | 음악 생성        | 이전 음악 생성 티어                      |
| `music-2.0`              | 음악 생성        | 레거시 음악 생성 티어                    |
| `MiniMax-Hailuo-2.3`     | 비디오 생성      | Text-to-video 및 이미지 레퍼런스 흐름    |

## 시작하기

선호하는 인증 방식을 선택하고 설정 단계를 따르십시오.

<Tabs>
  <Tab title="OAuth (Coding Plan)">
    **적합한 경우:** API 키 없이 OAuth를 통한 MiniMax Coding Plan으로 빠르게 설정.

    <Tabs>
      <Tab title="International">
        <Steps>
          <Step title="온보딩 실행">
            ```bash
            openclaw onboard --auth-choice minimax-global-oauth
            ```

            이것은 `api.minimax.io`에 대해 인증합니다.
          </Step>
          <Step title="모델 사용 가능 여부 확인">
            ```bash
            openclaw models list --provider minimax-portal
            ```
          </Step>
        </Steps>
      </Tab>
      <Tab title="China">
        <Steps>
          <Step title="온보딩 실행">
            ```bash
            openclaw onboard --auth-choice minimax-cn-oauth
            ```

            이것은 `api.minimaxi.com`에 대해 인증합니다.
          </Step>
          <Step title="모델 사용 가능 여부 확인">
            ```bash
            openclaw models list --provider minimax-portal
            ```
          </Step>
        </Steps>
      </Tab>
    </Tabs>

    <Note>
    OAuth 설정은 `minimax-portal` 프로바이더 ID를 사용합니다. Model 참조는 `minimax-portal/MiniMax-M2.7` 형식을 따릅니다.
    </Note>

    <Tip>
    MiniMax Coding Plan 추천 링크 (10% 할인): [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan?code=DbXJTRClnb&source=link)
    </Tip>

  </Tab>

  <Tab title="API key">
    **적합한 경우:** Anthropic 호환 API가 포함된 호스팅 MiniMax.

    <Tabs>
      <Tab title="International">
        <Steps>
          <Step title="온보딩 실행">
            ```bash
            openclaw onboard --auth-choice minimax-global-api
            ```

            이것은 `api.minimax.io`를 base URL로 구성합니다.
          </Step>
          <Step title="모델 사용 가능 여부 확인">
            ```bash
            openclaw models list --provider minimax
            ```
          </Step>
        </Steps>
      </Tab>
      <Tab title="China">
        <Steps>
          <Step title="온보딩 실행">
            ```bash
            openclaw onboard --auth-choice minimax-cn-api
            ```

            이것은 `api.minimaxi.com`을 base URL로 구성합니다.
          </Step>
          <Step title="모델 사용 가능 여부 확인">
            ```bash
            openclaw models list --provider minimax
            ```
          </Step>
        </Steps>
      </Tab>
    </Tabs>

    ### 구성 예시

    ```json5
    {
      env: { MINIMAX_API_KEY: "sk-..." },
      agents: { defaults: { model: { primary: "minimax/MiniMax-M2.7" } } },
      models: {
        mode: "merge",
        providers: {
          minimax: {
            baseUrl: "https://api.minimax.io/anthropic",
            apiKey: "${MINIMAX_API_KEY}",
            api: "anthropic-messages",
            models: [
              {
                id: "MiniMax-M2.7",
                name: "MiniMax M2.7",
                reasoning: true,
                input: ["text", "image"],
                cost: { input: 0.3, output: 1.2, cacheRead: 0.06, cacheWrite: 0.375 },
                contextWindow: 204800,
                maxTokens: 131072,
              },
              {
                id: "MiniMax-M2.7-highspeed",
                name: "MiniMax M2.7 Highspeed",
                reasoning: true,
                input: ["text", "image"],
                cost: { input: 0.6, output: 2.4, cacheRead: 0.06, cacheWrite: 0.375 },
                contextWindow: 204800,
                maxTokens: 131072,
              },
            ],
          },
        },
      },
    }
    ```

    <Warning>
    Anthropic 호환 streaming 경로에서 OpenClaw는 `thinking`을 명시적으로 설정하지 않는 한 기본적으로 MiniMax thinking을 비활성화합니다. MiniMax의 streaming 엔드포인트는 네이티브 Anthropic thinking 블록 대신 OpenAI 스타일 delta chunk에 `reasoning_content`를 내보내므로, 암묵적으로 활성화된 채로 두면 내부 reasoning이 노출된 출력으로 유출될 수 있습니다.
    </Warning>

    <Note>
    API 키 설정은 `minimax` 프로바이더 ID를 사용합니다. Model 참조는 `minimax/MiniMax-M2.7` 형식을 따릅니다.
    </Note>

  </Tab>
</Tabs>

## `openclaw configure`를 통한 구성

JSON을 편집하지 않고 MiniMax를 설정하려면 대화형 구성 마법사를 사용하십시오:

<Steps>
  <Step title="마법사 실행">
    ```bash
    openclaw configure
    ```
  </Step>
  <Step title="Model/auth 선택">
    메뉴에서 **Model/auth**를 선택하십시오.
  </Step>
  <Step title="MiniMax 인증 옵션 선택">
    사용 가능한 MiniMax 옵션 중 하나를 선택하십시오:

    | 인증 선택 | 설명 |
    | --- | --- |
    | `minimax-global-oauth` | International OAuth (Coding Plan) |
    | `minimax-cn-oauth` | China OAuth (Coding Plan) |
    | `minimax-global-api` | International API 키 |
    | `minimax-cn-api` | China API 키 |

  </Step>
  <Step title="기본 모델 선택">
    프롬프트가 표시되면 기본 모델을 선택하십시오.
  </Step>
</Steps>

## 기능

### 이미지 생성

MiniMax 플러그인은 `image_generate` 툴용으로 `image-01` 모델을 등록합니다. 다음을 지원합니다:

- 종횡비 제어가 포함된 **Text-to-image 생성**
- 종횡비 제어가 포함된 **Image-to-image 편집** (subject 레퍼런스)
- 요청당 최대 **9개의 출력 이미지**
- 편집 요청당 최대 **1개의 레퍼런스 이미지**
- 지원 종횡비: `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `3:4`, `9:16`, `21:9`

이미지 생성에 MiniMax를 사용하려면 이미지 생성 프로바이더로 설정하십시오:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: { primary: "minimax/image-01" },
    },
  },
}
```

플러그인은 텍스트 모델과 동일한 `MINIMAX_API_KEY` 또는 OAuth 인증을 사용합니다. MiniMax가 이미 설정되어 있으면 추가 구성이 필요하지 않습니다.

`minimax`와 `minimax-portal` 모두 동일한 `image-01` 모델로 `image_generate`를
등록합니다. API 키 설정은 `MINIMAX_API_KEY`를 사용하며, OAuth 설정은 번들
`minimax-portal` 인증 경로를 대신 사용할 수 있습니다.

온보딩 또는 API 키 설정이 명시적인 `models.providers.minimax` 항목을 작성하면,
OpenClaw는 `input: ["text", "image"]`로 `MiniMax-M2.7` 및
`MiniMax-M2.7-highspeed`를 구체화합니다.

내장 번들 MiniMax 텍스트 카탈로그 자체는 명시적 프로바이더 구성이 존재할
때까지 텍스트 전용 메타데이터로 유지됩니다. 이미지 이해는 플러그인 소유
`MiniMax-VL-01` 미디어 프로바이더를 통해 별도로 노출됩니다.

<Note>
공유 툴 파라미터, 프로바이더 선택, failover 동작은 [이미지 생성](/tools/image-generation)을 참조하십시오.
</Note>

### 음악 생성

번들 `minimax` 플러그인은 또한 공유 `music_generate` 툴을 통해 음악 생성을
등록합니다.

- 기본 음악 모델: `minimax/music-2.5+`
- `minimax/music-2.5`와 `minimax/music-2.0`도 지원
- 프롬프트 컨트롤: `lyrics`, `instrumental`, `durationSeconds`
- 출력 포맷: `mp3`
- 세션 기반 실행은 `action: "status"`를 포함한 공유 task/status 흐름을 통해 분리됩니다

MiniMax를 기본 음악 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      musicGenerationModel: {
        primary: "minimax/music-2.5+",
      },
    },
  },
}
```

<Note>
공유 툴 파라미터, 프로바이더 선택, failover 동작은 [음악 생성](/tools/music-generation)을 참조하십시오.
</Note>

### 비디오 생성

번들 `minimax` 플러그인은 또한 공유 `video_generate` 툴을 통해 비디오 생성을
등록합니다.

- 기본 비디오 모델: `minimax/MiniMax-Hailuo-2.3`
- 모드: text-to-video 및 단일 이미지 레퍼런스 흐름
- `aspectRatio`와 `resolution` 지원

MiniMax를 기본 비디오 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "minimax/MiniMax-Hailuo-2.3",
      },
    },
  },
}
```

<Note>
공유 툴 파라미터, 프로바이더 선택, failover 동작은 [비디오 생성](/tools/video-generation)을 참조하십시오.
</Note>

### 이미지 이해

MiniMax 플러그인은 이미지 이해를 텍스트 카탈로그와 별도로 등록합니다:

| 프로바이더 ID    | 기본 이미지 모델    |
| ---------------- | ------------------- |
| `minimax`        | `MiniMax-VL-01`     |
| `minimax-portal` | `MiniMax-VL-01`     |

이것이 번들 텍스트 프로바이더 카탈로그가 여전히 텍스트 전용 M2.7 chat 참조를
표시하더라도 자동 미디어 라우팅이 MiniMax 이미지 이해를 사용할 수 있는
이유입니다.

### Web search

MiniMax 플러그인은 또한 MiniMax Coding Plan 검색 API를 통해 `web_search`를
등록합니다.

- 프로바이더 ID: `minimax`
- 구조화된 결과: 제목, URL, 스니펫, 관련 쿼리
- 선호 환경 변수: `MINIMAX_CODE_PLAN_KEY`
- 허용되는 환경 별칭: `MINIMAX_CODING_API_KEY`
- 호환성 fallback: coding-plan token을 이미 가리키는 경우 `MINIMAX_API_KEY`
- 리전 재사용: `plugins.entries.minimax.config.webSearch.region`, 그 다음 `MINIMAX_API_HOST`, 그 다음 MiniMax 프로바이더 base URL
- 검색은 프로바이더 ID `minimax`를 유지합니다; OAuth CN/global 설정은 `models.providers.minimax-portal.baseUrl`을 통해 여전히 간접적으로 리전을 조정할 수 있습니다

구성은 `plugins.entries.minimax.config.webSearch.*` 아래에 있습니다.

<Note>
전체 web search 구성 및 사용법은 [MiniMax Search](/tools/minimax-search)를 참조하십시오.
</Note>

## 고급 구성

<AccordionGroup>
  <Accordion title="구성 옵션">
    | 옵션 | 설명 |
    | --- | --- |
    | `models.providers.minimax.baseUrl` | `https://api.minimax.io/anthropic` (Anthropic 호환) 선호; `https://api.minimax.io/v1`은 OpenAI 호환 payload에 대해 선택 사항 |
    | `models.providers.minimax.api` | `anthropic-messages` 선호; `openai-completions`는 OpenAI 호환 payload에 대해 선택 사항 |
    | `models.providers.minimax.apiKey` | MiniMax API 키 (`MINIMAX_API_KEY`) |
    | `models.providers.minimax.models` | `id`, `name`, `reasoning`, `contextWindow`, `maxTokens`, `cost` 정의 |
    | `agents.defaults.models` | 허용 목록에 원하는 모델 별칭 지정 |
    | `models.mode` | 내장과 함께 MiniMax를 추가하려면 `merge` 유지 |
  </Accordion>

  <Accordion title="Thinking 기본값">
    `api: "anthropic-messages"`에서 OpenClaw는 params/config에 thinking이 이미 명시적으로 설정되지 않은 한 `thinking: { type: "disabled" }`를 주입합니다.

    이는 MiniMax의 streaming 엔드포인트가 OpenAI 스타일 delta chunk에 `reasoning_content`를 내보내서 내부 reasoning이 노출된 출력으로 유출되는 것을 방지합니다.

  </Accordion>

  <Accordion title="Fast mode">
    `/fast on` 또는 `params.fastMode: true`는 Anthropic 호환 stream 경로에서 `MiniMax-M2.7`을 `MiniMax-M2.7-highspeed`로 재작성합니다.
  </Accordion>

  <Accordion title="Fallback 예시">
    **적합한 경우:** 가장 강력한 최신 세대 모델을 primary로 유지하고 MiniMax M2.7로 failover. 아래 예시는 Opus를 구체적인 primary로 사용합니다; 선호하는 최신 세대 primary 모델로 교체하십시오.

    ```json5
    {
      env: { MINIMAX_API_KEY: "sk-..." },
      agents: {
        defaults: {
          models: {
            "anthropic/claude-opus-4-6": { alias: "primary" },
            "minimax/MiniMax-M2.7": { alias: "minimax" },
          },
          model: {
            primary: "anthropic/claude-opus-4-6",
            fallbacks: ["minimax/MiniMax-M2.7"],
          },
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="Coding Plan 사용 상세">
    - Coding Plan 사용량 API: `https://api.minimaxi.com/v1/api/openplatform/coding_plan/remains` (coding plan 키 필요).
    - OpenClaw는 MiniMax coding-plan 사용량을 다른 프로바이더에서 사용되는 동일한 `% left` 표시로 정규화합니다. MiniMax의 원시 `usage_percent` / `usagePercent` 필드는 소비 quota가 아니라 남은 quota이므로 OpenClaw는 이를 반전합니다. 카운트 기반 필드가 있으면 우선합니다.
    - API가 `model_remains`를 반환하면 OpenClaw는 chat-model 항목을 선호하고, 필요한 경우 `start_time` / `end_time`에서 window 라벨을 파생하며, coding-plan window를 구분하기 쉽도록 plan 라벨에 선택된 모델 이름을 포함합니다.
    - 사용량 스냅샷은 `minimax`, `minimax-cn`, `minimax-portal`을 동일한 MiniMax quota 표면으로 취급하며, Coding Plan 키 환경 변수로 fallback하기 전에 저장된 MiniMax OAuth를 선호합니다.
  </Accordion>
</AccordionGroup>

## 참고 사항

- Model 참조는 인증 경로를 따릅니다:
  - API 키 설정: `minimax/<model>`
  - OAuth 설정: `minimax-portal/<model>`
- 기본 chat 모델: `MiniMax-M2.7`
- 대체 chat 모델: `MiniMax-M2.7-highspeed`
- 온보딩 및 직접 API 키 설정은 두 M2.7 변형 모두에 대해 `input: ["text", "image"]`로 명시적 모델 정의를 작성합니다
- 번들 프로바이더 카탈로그는 현재 명시적 MiniMax 프로바이더 구성이 존재할 때까지 chat 참조를 텍스트 전용 메타데이터로 노출합니다
- 정확한 비용 추적이 필요한 경우 `models.json`에서 가격 값을 업데이트하십시오
- `openclaw models list`로 현재 프로바이더 ID를 확인한 다음 `openclaw models set minimax/MiniMax-M2.7` 또는 `openclaw models set minimax-portal/MiniMax-M2.7`로 전환하십시오

<Tip>
MiniMax Coding Plan 추천 링크 (10% 할인): [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan?code=DbXJTRClnb&source=link)
</Tip>

<Note>
프로바이더 규칙은 [모델 프로바이더](/concepts/model-providers)를 참조하십시오.
</Note>

## 문제 해결

<AccordionGroup>
  <Accordion title='"Unknown model: minimax/MiniMax-M2.7"'>
    이는 보통 **MiniMax 프로바이더가 구성되지 않았음**을 의미합니다 (일치하는 프로바이더 항목이 없고 MiniMax 인증 프로필/환경 키가 발견되지 않음). 이 감지에 대한 수정은 **2026.1.12**에 있습니다. 다음과 같이 해결하십시오:

    - **2026.1.12**로 업그레이드 (또는 source `main`에서 실행) 후 gateway 재시작.
    - `openclaw configure`를 실행하고 **MiniMax** 인증 옵션을 선택하거나,
    - 일치하는 `models.providers.minimax` 또는 `models.providers.minimax-portal` 블록을 수동으로 추가하거나,
    - `MINIMAX_API_KEY`, `MINIMAX_OAUTH_TOKEN`, 또는 MiniMax 인증 프로필을 설정하여 일치하는 프로바이더가 주입될 수 있도록 합니다.

    Model ID는 **대소문자를 구분**하므로 주의하십시오:

    - API 키 경로: `minimax/MiniMax-M2.7` 또는 `minimax/MiniMax-M2.7-highspeed`
    - OAuth 경로: `minimax-portal/MiniMax-M2.7` 또는 `minimax-portal/MiniMax-M2.7-highspeed`

    그런 다음 다음을 다시 확인하십시오:

    ```bash
    openclaw models list
    ```

  </Accordion>
</AccordionGroup>

<Note>
추가 도움말: [문제 해결](/help/troubleshooting) 및 [FAQ](/help/faq).
</Note>

## 관련 항목

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, model 참조, failover 동작 선택.
  </Card>
  <Card title="이미지 생성" href="/tools/image-generation" icon="image">
    공유 이미지 툴 파라미터 및 프로바이더 선택.
  </Card>
  <Card title="음악 생성" href="/tools/music-generation" icon="music">
    공유 음악 툴 파라미터 및 프로바이더 선택.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    공유 비디오 툴 파라미터 및 프로바이더 선택.
  </Card>
  <Card title="MiniMax Search" href="/tools/minimax-search" icon="magnifying-glass">
    MiniMax Coding Plan을 통한 web search 구성.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반적인 문제 해결 및 FAQ.
  </Card>
</CardGroup>
