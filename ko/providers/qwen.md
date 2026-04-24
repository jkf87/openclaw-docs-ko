---
summary: "OpenClaw의 번들 qwen 프로바이더를 통해 Qwen Cloud 사용"
read_when:
  - OpenClaw에서 Qwen을 사용하려는 경우
  - 이전에 Qwen OAuth를 사용한 경우
title: "Qwen"
---

<Warning>

**Qwen OAuth가 제거되었습니다.** `portal.qwen.ai` 엔드포인트를 사용하던 무료 티어 OAuth 통합
(`qwen-portal`)은 더 이상 사용할 수 없습니다.
배경은 [이슈 #49557](https://github.com/openclaw/openclaw/issues/49557)을
참조해 주십시오.

</Warning>

OpenClaw는 이제 Qwen을 표준 id `qwen`을 가진 1등급 번들 프로바이더로 취급합니다.
번들 프로바이더는 Qwen Cloud / Alibaba DashScope 및 Coding Plan 엔드포인트를
대상으로 하며, 레거시 `modelstudio` id는 호환 별칭으로 계속 작동합니다.

- 프로바이더: `qwen`
- 기본 환경 변수: `QWEN_API_KEY`
- 호환용으로도 허용: `MODELSTUDIO_API_KEY`, `DASHSCOPE_API_KEY`
- API 스타일: OpenAI 호환

<Tip>
`qwen3.6-plus`를 사용하고 싶다면 **Standard (종량제)** 엔드포인트를 선호해 주십시오.
Coding Plan 지원은 공개 카탈로그보다 뒤처질 수 있습니다.
</Tip>

## 시작하기

플랜 유형을 선택하고 설정 단계를 따라 진행해 주십시오.

<Tabs>
  <Tab title="Coding Plan (구독)">
    **적합한 경우:** Qwen Coding Plan을 통한 구독 기반 액세스.

    <Steps>
      <Step title="API 키 발급">
        [home.qwencloud.com/api-keys](https://home.qwencloud.com/api-keys)에서 API 키를 생성하거나 복사해 주십시오.
      </Step>
      <Step title="온보딩 실행">
        **글로벌** 엔드포인트의 경우:

        ```bash
        openclaw onboard --auth-choice qwen-api-key
        ```

        **중국** 엔드포인트의 경우:

        ```bash
        openclaw onboard --auth-choice qwen-api-key-cn
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "qwen/qwen3.5-plus" },
            },
          },
        }
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider qwen
        ```
      </Step>
    </Steps>

    <Note>
    레거시 `modelstudio-*` auth-choice id 및 `modelstudio/...` 모델 참조는 여전히
    호환 별칭으로 작동하지만, 새로운 설정 플로우에서는 표준
    `qwen-*` auth-choice id 및 `qwen/...` 모델 참조를 선호해 주십시오.
    </Note>

  </Tab>

  <Tab title="Standard (종량제)">
    **적합한 경우:** Standard Model Studio 엔드포인트를 통한 종량제 액세스. Coding Plan에서 사용할 수 없는 `qwen3.6-plus` 같은 모델 포함.

    <Steps>
      <Step title="API 키 발급">
        [home.qwencloud.com/api-keys](https://home.qwencloud.com/api-keys)에서 API 키를 생성하거나 복사해 주십시오.
      </Step>
      <Step title="온보딩 실행">
        **글로벌** 엔드포인트의 경우:

        ```bash
        openclaw onboard --auth-choice qwen-standard-api-key
        ```

        **중국** 엔드포인트의 경우:

        ```bash
        openclaw onboard --auth-choice qwen-standard-api-key-cn
        ```
      </Step>
      <Step title="기본 모델 설정">
        ```json5
        {
          agents: {
            defaults: {
              model: { primary: "qwen/qwen3.5-plus" },
            },
          },
        }
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider qwen
        ```
      </Step>
    </Steps>

    <Note>
    레거시 `modelstudio-*` auth-choice id 및 `modelstudio/...` 모델 참조는 여전히
    호환 별칭으로 작동하지만, 새로운 설정 플로우에서는 표준
    `qwen-*` auth-choice id 및 `qwen/...` 모델 참조를 선호해 주십시오.
    </Note>

  </Tab>
</Tabs>

## 플랜 유형 및 엔드포인트

| 플랜                       | 리전   | 인증 선택                   | 엔드포인트                                       |
| -------------------------- | ------ | -------------------------- | ------------------------------------------------ |
| Standard (종량제)          | 중국   | `qwen-standard-api-key-cn` | `dashscope.aliyuncs.com/compatible-mode/v1`      |
| Standard (종량제)          | 글로벌 | `qwen-standard-api-key`    | `dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| Coding Plan (구독)         | 중국   | `qwen-api-key-cn`          | `coding.dashscope.aliyuncs.com/v1`               |
| Coding Plan (구독)         | 글로벌 | `qwen-api-key`             | `coding-intl.dashscope.aliyuncs.com/v1`          |

프로바이더는 인증 선택에 따라 엔드포인트를 자동으로 선택합니다. 표준 선택은
`qwen-*` 패밀리를 사용합니다; `modelstudio-*`는 호환 전용으로만 유지됩니다.
구성에서 사용자 정의 `baseUrl`로 재정의할 수 있습니다.

<Tip>
**키 관리:** [home.qwencloud.com/api-keys](https://home.qwencloud.com/api-keys) |
**문서:** [docs.qwencloud.com](https://docs.qwencloud.com/developer-guides/getting-started/introduction)
</Tip>

## 내장 카탈로그

OpenClaw는 현재 다음의 번들 Qwen 카탈로그를 제공합니다. 구성된 카탈로그는
엔드포인트를 인식합니다: Coding Plan 구성은 Standard 엔드포인트에서만 작동하는 것으로
알려진 모델을 생략합니다.

| 모델 참조                   | 입력             | 컨텍스트   | 참고 사항                                           |
| --------------------------- | ---------------- | ---------- | --------------------------------------------------- |
| `qwen/qwen3.5-plus`         | 텍스트, 이미지    | 1,000,000 | 기본 모델                                            |
| `qwen/qwen3.6-plus`         | 텍스트, 이미지    | 1,000,000 | 이 모델이 필요한 경우 Standard 엔드포인트를 선호     |
| `qwen/qwen3-max-2026-01-23` | 텍스트           | 262,144   | Qwen Max 라인                                        |
| `qwen/qwen3-coder-next`     | 텍스트           | 262,144   | 코딩                                                  |
| `qwen/qwen3-coder-plus`     | 텍스트           | 1,000,000 | 코딩                                                  |
| `qwen/MiniMax-M2.5`         | 텍스트           | 1,000,000 | 추론 활성화                                           |
| `qwen/glm-5`                | 텍스트           | 202,752   | GLM                                                  |
| `qwen/glm-4.7`              | 텍스트           | 202,752   | GLM                                                  |
| `qwen/kimi-k2.5`            | 텍스트, 이미지    | 262,144   | Alibaba를 통한 Moonshot AI                            |

<Note>
번들 카탈로그에 모델이 포함되어 있더라도, 엔드포인트 및 청구 플랜에 따라
가용성이 달라질 수 있습니다.
</Note>

## 멀티모달 부가 기능

`qwen` 플러그인은 **Standard** DashScope 엔드포인트 (Coding Plan 엔드포인트 아님)
에서 멀티모달 기능도 제공합니다:

- **비디오 이해**: `qwen-vl-max-latest`를 통해
- **Wan 비디오 생성**: `wan2.6-t2v` (기본값), `wan2.6-i2v`, `wan2.6-r2v`, `wan2.6-r2v-flash`, `wan2.7-r2v`를 통해

Qwen을 기본 비디오 프로바이더로 사용하려면:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: { primary: "qwen/wan2.6-t2v" },
    },
  },
}
```

<Note>
공유 도구 파라미터, 프로바이더 선택, 페일오버 동작에 대해서는 [비디오 생성](/tools/video-generation)을 참조해 주십시오.
</Note>

## 고급 구성

<AccordionGroup>
  <Accordion title="이미지 및 비디오 이해">
    번들 Qwen 플러그인은 **Standard** DashScope 엔드포인트 (Coding Plan 엔드포인트 아님)
    에서 이미지와 비디오에 대한 미디어 이해를 등록합니다.

    | 속성          | 값                    |
    | ------------- | --------------------- |
    | 모델          | `qwen-vl-max-latest`  |
    | 지원 입력     | 이미지, 비디오         |

    미디어 이해는 구성된 Qwen 인증에서 자동으로 해결됩니다 — 추가 구성이
    필요하지 않습니다. 미디어 이해 지원을 위해서는 Standard (종량제)
    엔드포인트를 사용하고 있는지 확인해 주십시오.

  </Accordion>

  <Accordion title="Qwen 3.6 Plus 가용성">
    `qwen3.6-plus`는 Standard (종량제) Model Studio
    엔드포인트에서 사용할 수 있습니다:

    - 중국: `dashscope.aliyuncs.com/compatible-mode/v1`
    - 글로벌: `dashscope-intl.aliyuncs.com/compatible-mode/v1`

    Coding Plan 엔드포인트가 `qwen3.6-plus`에 대해 "unsupported model" 오류를
    반환하면 Coding Plan 엔드포인트/키 쌍 대신 Standard (종량제)로
    전환해 주십시오.

  </Accordion>

  <Accordion title="기능 계획">
    `qwen` 플러그인은 코딩/텍스트 모델만이 아닌 전체 Qwen Cloud 표면을 위한
    벤더 홈으로 자리 잡고 있습니다.

    - **텍스트/채팅 모델:** 현재 번들됨
    - **도구 호출, 구조화된 출력, 사고:** OpenAI 호환 전송에서 상속됨
    - **이미지 생성:** 프로바이더 플러그인 레이어에서 계획됨
    - **이미지/비디오 이해:** Standard 엔드포인트에서 현재 번들됨
    - **음성/오디오:** 프로바이더 플러그인 레이어에서 계획됨
    - **메모리 임베딩/재순위:** 임베딩 어댑터 표면을 통해 계획됨
    - **비디오 생성:** 공유 비디오 생성 기능을 통해 현재 번들됨

  </Accordion>

  <Accordion title="비디오 생성 세부 사항">
    비디오 생성의 경우 OpenClaw는 작업을 제출하기 전에 구성된 Qwen 리전을
    일치하는 DashScope AIGC 호스트에 매핑합니다:

    - 글로벌/국제: `https://dashscope-intl.aliyuncs.com`
    - 중국: `https://dashscope.aliyuncs.com`

    이는 Coding Plan 또는 Standard Qwen 호스트 중 하나를 가리키는 일반
    `models.providers.qwen.baseUrl`도 비디오 생성을 올바른 리전 DashScope 비디오
    엔드포인트에 유지한다는 뜻입니다.

    현재 번들된 Qwen 비디오 생성 제한:

    - 요청당 최대 **1**개 출력 비디오
    - 최대 **1**개 입력 이미지
    - 최대 **4**개 입력 비디오
    - 최대 **10초** 길이
    - `size`, `aspectRatio`, `resolution`, `audio`, `watermark` 지원
    - 참조 이미지/비디오 모드는 현재 **원격 http(s) URL**이 필요합니다. DashScope 비디오
      엔드포인트가 해당 참조에 대해 업로드된 로컬 버퍼를 허용하지 않으므로
      로컬 파일 경로는 사전에 거부됩니다.

  </Accordion>

  <Accordion title="스트리밍 사용 호환성">
    네이티브 Model Studio 엔드포인트는 공유 `openai-completions` 전송에서 스트리밍 사용
    호환성을 광고합니다. OpenClaw는 이제 엔드포인트 기능을 기반으로 하므로,
    동일한 네이티브 호스트를 대상으로 하는 DashScope 호환 커스텀 프로바이더 id가
    내장 `qwen` 프로바이더 id를 특별히 필요로 하는 대신 동일한 스트리밍 사용
    동작을 상속합니다.

    네이티브 스트리밍 사용 호환성은 Coding Plan 호스트와 Standard DashScope 호환
    호스트 모두에 적용됩니다:

    - `https://coding.dashscope.aliyuncs.com/v1`
    - `https://coding-intl.dashscope.aliyuncs.com/v1`
    - `https://dashscope.aliyuncs.com/compatible-mode/v1`
    - `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`

  </Accordion>

  <Accordion title="멀티모달 엔드포인트 리전">
    멀티모달 표면 (비디오 이해 및 Wan 비디오 생성)은 Coding Plan 엔드포인트가
    아닌 **Standard** DashScope 엔드포인트를 사용합니다:

    - 글로벌/국제 Standard 기본 URL: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
    - 중국 Standard 기본 URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`

  </Accordion>

  <Accordion title="환경 및 데몬 설정">
    Gateway가 데몬 (launchd/systemd)으로 실행되는 경우, 해당 프로세스에서
    `QWEN_API_KEY`를 사용할 수 있는지 확인해 주십시오 (예: `~/.openclaw/.env` 또는
    `env.shellEnv`를 통해).
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더, 모델 참조, 페일오버 동작 선택.
  </Card>
  <Card title="비디오 생성" href="/tools/video-generation" icon="video">
    공유 비디오 도구 파라미터 및 프로바이더 선택.
  </Card>
  <Card title="Alibaba (ModelStudio)" href="/providers/alibaba" icon="cloud">
    레거시 ModelStudio 프로바이더 및 마이그레이션 노트.
  </Card>
  <Card title="문제 해결" href="/help/troubleshooting" icon="wrench">
    일반 문제 해결 및 FAQ.
  </Card>
</CardGroup>
