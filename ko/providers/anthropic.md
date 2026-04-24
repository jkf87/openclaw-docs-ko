---
summary: "OpenClaw에서 API 키 또는 Claude CLI를 통해 Anthropic Claude 사용"
read_when:
  - OpenClaw에서 Anthropic 모델을 사용하려는 경우
title: "Anthropic"
---

# Anthropic (Claude)

Anthropic은 **Claude** 모델 패밀리를 만듭니다. OpenClaw는 두 가지 인증 경로를 지원합니다.

- **API 키** — 사용량 기반 과금을 통한 직접 Anthropic API 접근 (`anthropic/*` 모델)
- **Claude CLI** — 동일 호스트의 기존 Claude CLI 로그인 재사용

<Warning>
Anthropic 측은 OpenClaw 스타일의 Claude CLI 사용이 다시 허용된다고 알려왔으므로, OpenClaw는 Anthropic이 새 정책을 발표하지 않는 한 Claude CLI 재사용 및 `claude -p` 사용을 승인된 것으로 취급합니다.

장기 운영되는 게이트웨이 호스트의 경우, Anthropic API 키가 여전히 가장 명확하고 예측 가능한 프로덕션 경로입니다.

Anthropic의 현재 공개 문서:

- [Claude Code CLI 레퍼런스](https://code.claude.com/docs/en/cli-reference)
- [Claude Agent SDK 개요](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Pro 또는 Max 플랜에서 Claude Code 사용](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan)
- [Team 또는 Enterprise 플랜에서 Claude Code 사용](https://support.anthropic.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan/)

</Warning>

## 시작하기

<Tabs>
  <Tab title="API 키">
    **적합한 경우:** 표준 API 접근 및 사용량 기반 과금.

    <Steps>
      <Step title="API 키 발급">
        [Anthropic Console](https://console.anthropic.com/)에서 API 키를 생성하세요.
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard
        # 선택: Anthropic API key
        ```

        또는 키를 직접 전달:

        ```bash
        openclaw onboard --anthropic-api-key "$ANTHROPIC_API_KEY"
        ```
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider anthropic
        ```
      </Step>
    </Steps>

    ### 설정 예시

    ```json5
    {
      env: { ANTHROPIC_API_KEY: "sk-ant-..." },
      agents: { defaults: { model: { primary: "anthropic/claude-opus-4-6" } } },
    }
    ```

  </Tab>

  <Tab title="Claude CLI">
    **적합한 경우:** 별도 API 키 없이 기존 Claude CLI 로그인을 재사용.

    <Steps>
      <Step title="Claude CLI 설치 및 로그인 상태 확인">
        다음으로 확인:

        ```bash
        claude --version
        ```
      </Step>
      <Step title="온보딩 실행">
        ```bash
        openclaw onboard
        # 선택: Claude CLI
        ```

        OpenClaw가 기존 Claude CLI 자격 증명을 감지하고 재사용합니다.
      </Step>
      <Step title="모델 사용 가능 여부 확인">
        ```bash
        openclaw models list --provider anthropic
        ```
      </Step>
    </Steps>

    <Note>
    Claude CLI 백엔드의 설정 및 런타임 세부 사항은 [CLI 백엔드](/gateway/cli-backends)에 있습니다.
    </Note>

    <Tip>
    가장 명확한 과금 경로를 원한다면 Anthropic API 키를 대신 사용하세요. OpenClaw는 [OpenAI Codex](/providers/openai), [Qwen Cloud](/providers/qwen), [MiniMax](/providers/minimax), [Z.AI / GLM](/providers/glm)의 구독 방식 옵션도 지원합니다.
    </Tip>

  </Tab>
</Tabs>

## Thinking 기본값 (Claude 4.6)

Claude 4.6 모델은 명시적인 thinking 레벨이 설정되지 않으면 OpenClaw에서 `adaptive` thinking을 기본값으로 사용합니다.

메시지별로 `/think:<level>`로 재정의하거나 모델 파라미터에서 설정:

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": {
          params: { thinking: "adaptive" },
        },
      },
    },
  },
}
```

<Note>
관련 Anthropic 문서:
- [Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
- [Extended thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
</Note>

## 프롬프트 캐싱

OpenClaw는 API 키 인증에 대해 Anthropic의 프롬프트 캐싱 기능을 지원합니다.

| 값                  | 캐시 지속시간  | 설명                                   |
| ------------------- | -------------- | -------------------------------------- |
| `"short"` (기본값)  | 5분            | API 키 인증에 대해 자동으로 적용       |
| `"long"`            | 1시간          | 확장 캐시                              |
| `"none"`            | 캐싱 없음      | 프롬프트 캐싱 비활성화                 |

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": {
          params: { cacheRetention: "long" },
        },
      },
    },
  },
}
```

<AccordionGroup>
  <Accordion title="에이전트별 캐시 재정의">
    모델 레벨 파라미터를 기본으로 사용한 다음, `agents.list[].params`를 통해 특정 에이전트를 재정의하세요.

    ```json5
    {
      agents: {
        defaults: {
          model: { primary: "anthropic/claude-opus-4-6" },
          models: {
            "anthropic/claude-opus-4-6": {
              params: { cacheRetention: "long" },
            },
          },
        },
        list: [
          { id: "research", default: true },
          { id: "alerts", params: { cacheRetention: "none" } },
        ],
      },
    }
    ```

    설정 병합 순서:

    1. `agents.defaults.models["provider/model"].params`
    2. `agents.list[].params` (일치하는 `id`, 키 단위로 재정의)

    이를 통해 한 에이전트는 장기 캐시를 유지하면서, 동일 모델의 다른 에이전트는 버스트성/저재사용 트래픽에 대해 캐싱을 비활성화할 수 있습니다.

  </Accordion>

  <Accordion title="Bedrock Claude 참고 사항">
    - Bedrock의 Anthropic Claude 모델(`amazon-bedrock/*anthropic.claude*`)은 구성된 경우 `cacheRetention` 패스스루(pass-through)를 허용합니다.
    - Bedrock의 Anthropic 외 모델은 런타임에서 강제로 `cacheRetention: "none"`으로 설정됩니다.
    - API 키 스마트 기본값도 명시적 값이 설정되지 않은 경우 Claude-on-Bedrock 참조에 대해 `cacheRetention: "short"`을 시드합니다.
  </Accordion>
</AccordionGroup>

## 고급 설정

<AccordionGroup>
  <Accordion title="Fast 모드">
    OpenClaw의 공유 `/fast` 토글은 직접 Anthropic 트래픽(API 키 및 `api.anthropic.com`에 대한 OAuth)을 지원합니다.

    | 명령어 | 매핑 |
    |---------|---------|
    | `/fast on` | `service_tier: "auto"` |
    | `/fast off` | `service_tier: "standard_only"` |

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "anthropic/claude-sonnet-4-6": {
              params: { fastMode: true },
            },
          },
        },
      },
    }
    ```

    <Note>
    - 직접 `api.anthropic.com` 요청에만 주입됩니다. 프록시 경로는 `service_tier`를 건드리지 않습니다.
    - 명시적인 `serviceTier` 또는 `service_tier` 파라미터는 둘 다 설정된 경우 `/fast`를 재정의합니다.
    - Priority Tier 용량이 없는 계정에서는 `service_tier: "auto"`가 `standard`로 해석될 수 있습니다.
    </Note>

  </Accordion>

  <Accordion title="미디어 이해 (이미지 및 PDF)">
    번들된 Anthropic 플러그인은 이미지 및 PDF 이해 기능을 등록합니다. OpenClaw는 구성된 Anthropic 인증으로부터 미디어 기능을 자동 해석하므로, 추가 설정이 필요하지 않습니다.

    | 속성           | 값                   |
    | -------------- | -------------------- |
    | 기본 모델      | `claude-opus-4-6`    |
    | 지원 입력      | 이미지, PDF 문서     |

    이미지 또는 PDF가 대화에 첨부되면, OpenClaw는 자동으로 Anthropic 미디어 이해 프로바이더를 통해 라우팅합니다.

  </Accordion>

  <Accordion title="1M 컨텍스트 윈도우 (베타)">
    Anthropic의 1M 컨텍스트 윈도우는 베타로 게이팅됩니다. 모델별로 활성화하세요.

    ```json5
    {
      agents: {
        defaults: {
          models: {
            "anthropic/claude-opus-4-6": {
              params: { context1m: true },
            },
          },
        },
      },
    }
    ```

    OpenClaw는 이를 요청 시 `anthropic-beta: context-1m-2025-08-07`로 매핑합니다.

    <Warning>
    Anthropic 자격 증명에 장기 컨텍스트(long-context) 접근이 필요합니다. 레거시 토큰 인증(`sk-ant-oat-*`)은 1M 컨텍스트 요청에서 거부됩니다 — OpenClaw는 경고를 기록하고 표준 컨텍스트 윈도우로 폴백합니다.
    </Warning>

  </Accordion>

  <Accordion title="Claude Opus 4.7 1M 컨텍스트">
    `anthropic/claude-opus-4.7` 및 그 `claude-cli` 변형은 기본적으로 1M 컨텍스트 윈도우를 가집니다 — `params.context1m: true`가 필요 없습니다.
  </Accordion>
</AccordionGroup>

## 문제 해결

<AccordionGroup>
  <Accordion title="401 오류 / 토큰이 갑자기 무효화됨">
    Anthropic 토큰 인증은 만료되거나 취소될 수 있습니다. 새 설정의 경우 Anthropic API 키를 대신 사용하세요.
  </Accordion>

  <Accordion title='"anthropic" 프로바이더에 대한 API 키를 찾을 수 없음'>
    Anthropic 인증은 **에이전트별**입니다 — 새 에이전트는 메인 에이전트의 키를 상속하지 않습니다. 해당 에이전트에 대해 온보딩을 다시 실행하거나(또는 게이트웨이 호스트에 API 키를 설정하세요), 그다음 `openclaw models status`로 확인하세요.
  </Accordion>

  <Accordion title='"anthropic:default" 프로파일에 대한 자격 증명을 찾을 수 없음'>
    `openclaw models status`를 실행하여 활성 인증 프로파일을 확인하세요. 온보딩을 다시 실행하거나, 해당 프로파일 경로에 대한 API 키를 설정하세요.
  </Accordion>

  <Accordion title="사용 가능한 인증 프로파일 없음 (모두 쿨다운 중)">
    `openclaw models status --json`에서 `auth.unusableProfiles`를 확인하세요. Anthropic 레이트 리밋 쿨다운은 모델 단위로 적용될 수 있으므로, 형제 Anthropic 모델은 여전히 사용 가능할 수 있습니다. 다른 Anthropic 프로파일을 추가하거나 쿨다운이 끝나기를 기다리세요.
  </Accordion>
</AccordionGroup>

<Note>
추가 도움말: [문제 해결](/help/troubleshooting) 및 [FAQ](/help/faq).
</Note>

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 선택, 모델 참조, 페일오버 동작.
  </Card>
  <Card title="CLI 백엔드" href="/gateway/cli-backends" icon="terminal">
    Claude CLI 백엔드 설정 및 런타임 세부 사항.
  </Card>
  <Card title="프롬프트 캐싱" href="/reference/prompt-caching" icon="database">
    프로바이더 전반에서 프롬프트 캐싱이 동작하는 방식.
  </Card>
  <Card title="OAuth 및 인증" href="/gateway/authentication" icon="key">
    인증 세부 사항 및 자격 증명 재사용 규칙.
  </Card>
</CardGroup>
