---
summary: "device flow를 사용하여 OpenClaw에서 GitHub Copilot에 로그인"
read_when:
  - GitHub Copilot을 모델 프로바이더로 사용하려는 경우
  - `openclaw models auth login-github-copilot` 플로우가 필요한 경우
title: "GitHub Copilot"
---

GitHub Copilot은 GitHub의 AI 코딩 어시스턴트입니다. GitHub 계정과 플랜에 따라 Copilot 모델에 대한 접근을 제공합니다. OpenClaw는 두 가지 방식으로 Copilot을 모델 프로바이더로 사용할 수 있습니다.

## OpenClaw에서 Copilot을 사용하는 두 가지 방법

<Tabs>
  <Tab title="내장 프로바이더 (github-copilot)">
    네이티브 device-login 플로우를 사용하여 GitHub 토큰을 얻고, OpenClaw 실행 시 이를 Copilot API 토큰으로 교환합니다. 이는 **기본값**이자 가장 간단한 경로로, VS Code가 필요 없습니다.

    <Steps>
      <Step title="로그인 명령 실행">
        ```bash
        openclaw models auth login-github-copilot
        ```

        URL 방문 및 일회용 코드 입력을 요청받습니다. 완료될 때까지 터미널을 열어두세요.
      </Step>
      <Step title="기본 모델 설정">
        ```bash
        openclaw models set github-copilot/claude-opus-4.7
        ```

        또는 설정 파일에서:

        ```json5
        {
          agents: {
            defaults: { model: { primary: "github-copilot/claude-opus-4.7" } },
          },
        }
        ```
      </Step>
    </Steps>

  </Tab>

  <Tab title="Copilot Proxy 플러그인 (copilot-proxy)">
    **Copilot Proxy** VS Code 확장을 로컬 브리지로 사용합니다. OpenClaw는 프록시의 `/v1` 엔드포인트와 통신하며, 거기에 설정한 모델 목록을 사용합니다.

    <Note>
    이미 VS Code에서 Copilot Proxy를 실행 중이거나 이를 통해 라우팅해야 하는 경우 이 방법을 선택하세요. 플러그인을 활성화하고 VS Code 확장을 계속 실행 상태로 유지해야 합니다.
    </Note>

  </Tab>
</Tabs>

## 선택적 플래그

| 플래그          | 설명                                                |
| --------------- | --------------------------------------------------- |
| `--yes`         | 확인 프롬프트 건너뛰기                              |
| `--set-default` | 프로바이더의 권장 기본 모델도 함께 적용             |

```bash
# 확인 건너뛰기
openclaw models auth login-github-copilot --yes

# 로그인과 기본 모델 설정을 한 번에
openclaw models auth login --provider github-copilot --method device --set-default
```

<AccordionGroup>
  <Accordion title="인터랙티브 TTY 필요">
    device-login 플로우는 인터랙티브 TTY가 필요합니다. 비인터랙티브 스크립트나 CI 파이프라인이 아닌 터미널에서 직접 실행하세요.
  </Accordion>

  <Accordion title="모델 가용성은 플랜에 따라 다름">
    Copilot 모델 가용성은 GitHub 플랜에 따라 달라집니다. 모델이 거부되면 다른 ID(예: `github-copilot/gpt-4.1`)를 시도하세요.
  </Accordion>

  <Accordion title="전송(transport) 선택">
    Claude 모델 ID는 자동으로 Anthropic Messages 전송을 사용합니다. GPT, o-series, Gemini 모델은 OpenAI Responses 전송을 유지합니다. OpenClaw는 모델 참조(ref)를 기반으로 올바른 전송을 선택합니다.
  </Accordion>

  <Accordion title="환경 변수 해석 순서">
    OpenClaw는 다음 우선순위에 따라 환경 변수에서 Copilot 인증을 해석합니다.

    | 우선순위 | 변수                  | 비고                                |
    | -------- | --------------------- | ----------------------------------- |
    | 1        | `COPILOT_GITHUB_TOKEN`| 최고 우선순위, Copilot 전용         |
    | 2        | `GH_TOKEN`            | GitHub CLI 토큰 (폴백)              |
    | 3        | `GITHUB_TOKEN`        | 표준 GitHub 토큰 (최저)             |

    여러 변수가 설정된 경우, OpenClaw는 가장 높은 우선순위의 변수를 사용합니다.
    device-login 플로우(`openclaw models auth login-github-copilot`)는 토큰을 인증 프로파일 저장소에 저장하며, 모든 환경 변수보다 우선합니다.

  </Accordion>

  <Accordion title="토큰 저장">
    로그인 시 GitHub 토큰을 인증 프로파일 저장소에 저장하고, OpenClaw 실행 시 이를 Copilot API 토큰으로 교환합니다. 토큰을 수동으로 관리할 필요가 없습니다.
  </Accordion>
</AccordionGroup>

<Warning>
인터랙티브 TTY가 필요합니다. 로그인 명령은 헤드리스 스크립트나 CI 작업이 아닌 터미널에서 직접 실행하세요.
</Warning>

## 메모리 검색 임베딩

GitHub Copilot은 [메모리 검색](/concepts/memory-search)용 임베딩 프로바이더로도 사용할 수 있습니다. Copilot 구독이 있고 로그인되어 있다면, OpenClaw는 별도의 API 키 없이 임베딩에 이를 사용할 수 있습니다.

### 자동 탐지

`memorySearch.provider`가 `"auto"`(기본값)일 때, GitHub Copilot은 우선순위 15에서 시도됩니다 — 로컬 임베딩 이후, 그리고 OpenAI 및 기타 유료 프로바이더 이전입니다. GitHub 토큰이 사용 가능하면, OpenClaw는 Copilot API에서 사용 가능한 임베딩 모델을 탐색하고 자동으로 최적의 모델을 선택합니다.

### 명시적 설정

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "github-copilot",
        // 선택: 자동 탐색된 모델을 재정의
        model: "text-embedding-3-small",
      },
    },
  },
}
```

### 동작 원리

1. OpenClaw가 GitHub 토큰을 해석합니다(환경 변수 또는 인증 프로파일에서).
2. 이를 단기 Copilot API 토큰으로 교환합니다.
3. Copilot `/models` 엔드포인트를 조회하여 사용 가능한 임베딩 모델을 탐색합니다.
4. 최적의 모델을 선택합니다(`text-embedding-3-small` 우선).
5. 임베딩 요청을 Copilot `/embeddings` 엔드포인트로 전송합니다.

모델 가용성은 GitHub 플랜에 따라 다릅니다. 사용 가능한 임베딩 모델이 없으면, OpenClaw는 Copilot을 건너뛰고 다음 프로바이더를 시도합니다.

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 선택" href="/concepts/model-providers" icon="layers">
    프로바이더 선택, 모델 참조, 페일오버 동작.
  </Card>
  <Card title="OAuth 및 인증" href="/gateway/authentication" icon="key">
    인증 세부 사항 및 자격 증명 재사용 규칙.
  </Card>
</CardGroup>
