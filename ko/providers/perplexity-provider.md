---
summary: "Perplexity 웹 검색 프로바이더 설정 (API 키, 검색 모드, 필터링)"
title: "Perplexity"
read_when:
  - Perplexity를 웹 검색 프로바이더로 설정하고자 할 때
  - Perplexity API 키 또는 OpenRouter 프록시 설정이 필요할 때
---

# Perplexity (웹 검색 프로바이더)

Perplexity 플러그인은 Perplexity Search API 또는 OpenRouter를 통한 Perplexity Sonar를
이용한 웹 검색 기능을 제공합니다.

<Note>
이 페이지는 Perplexity **프로바이더** 설정을 다룹니다. Perplexity
**도구**(에이전트가 이를 사용하는 방법)에 대해서는 [Perplexity 도구](/tools/perplexity-search)를 참고하세요.
</Note>

| 속성        | 값                                                                     |
| ----------- | ---------------------------------------------------------------------- |
| 유형        | 웹 검색 프로바이더 (모델 프로바이더 아님)                               |
| 인증        | `PERPLEXITY_API_KEY` (직접) 또는 `OPENROUTER_API_KEY` (OpenRouter 경유) |
| 설정 경로   | `plugins.entries.perplexity.config.webSearch.apiKey`                   |

## 시작하기

<Steps>
  <Step title="API 키 설정">
    대화형 웹 검색 설정 플로우를 실행하세요.

    ```bash
    openclaw configure --section web
    ```

    또는 키를 직접 설정하세요.

    ```bash
    openclaw config set plugins.entries.perplexity.config.webSearch.apiKey "pplx-xxxxxxxxxxxx"
    ```

  </Step>
  <Step title="검색 시작">
    키가 설정되면 에이전트가 자동으로 Perplexity를 웹 검색에 사용합니다.
    추가 단계는 필요하지 않습니다.
  </Step>
</Steps>

## 검색 모드

플러그인은 API 키 prefix에 따라 전송(transport) 방식을 자동 선택합니다.

<Tabs>
  <Tab title="네이티브 Perplexity API (pplx-)">
    키가 `pplx-`로 시작하면, OpenClaw는 네이티브 Perplexity Search API를
    사용합니다. 이 전송 방식은 구조화된 결과를 반환하며 도메인, 언어, 날짜
    필터를 지원합니다(아래 필터링 옵션 참고).
  </Tab>
  <Tab title="OpenRouter / Sonar (sk-or-)">
    키가 `sk-or-`로 시작하면, OpenClaw는 OpenRouter를 통해 Perplexity Sonar
    모델로 라우팅합니다. 이 전송 방식은 인용이 포함된 AI 합성 답변을 반환합니다.
  </Tab>
</Tabs>

| 키 prefix  | 전송 방식                      | 기능                                               |
| ---------- | ------------------------------ | -------------------------------------------------- |
| `pplx-`    | 네이티브 Perplexity Search API | 구조화된 결과, 도메인/언어/날짜 필터                |
| `sk-or-`   | OpenRouter (Sonar)             | 인용이 포함된 AI 합성 답변                         |

## 네이티브 API 필터링

<Note>
필터링 옵션은 네이티브 Perplexity API(`pplx-` 키)를 사용할 때만
이용할 수 있습니다. OpenRouter/Sonar 검색은 이러한 파라미터를 지원하지 않습니다.
</Note>

네이티브 Perplexity API 사용 시 다음 필터를 지원합니다.

| 필터           | 설명                                    | 예시                                |
| -------------- | --------------------------------------- | ----------------------------------- |
| 국가           | 2자리 국가 코드                         | `us`, `de`, `jp`                    |
| 언어           | ISO 639-1 언어 코드                     | `en`, `fr`, `zh`                    |
| 날짜 범위      | 최근성 윈도우                           | `day`, `week`, `month`, `year`      |
| 도메인 필터    | 허용/차단 목록 (최대 20 도메인)         | `example.com`                       |
| 콘텐츠 예산    | 응답별 / 페이지별 토큰 제한             | `max_tokens`, `max_tokens_per_page` |

## 고급 설정

<AccordionGroup>
  <Accordion title="데몬 프로세스용 환경 변수">
    OpenClaw Gateway가 데몬(launchd/systemd)으로 실행되는 경우,
    `PERPLEXITY_API_KEY`가 해당 프로세스에서 사용 가능하도록 해야 합니다.

    <Warning>
    `~/.profile`에만 설정된 키는 해당 환경이 명시적으로 가져와지지 않는 한
    launchd/systemd 데몬에서 보이지 않습니다. 게이트웨이 프로세스가 키를 읽을 수
    있도록 `~/.openclaw/.env` 또는 `env.shellEnv`를 통해 키를 설정하세요.
    </Warning>

  </Accordion>

  <Accordion title="OpenRouter 프록시 설정">
    Perplexity 검색을 OpenRouter를 통해 라우팅하고자 하는 경우, 네이티브 Perplexity
    키 대신 `OPENROUTER_API_KEY`(prefix `sk-or-`)를 설정하세요.
    OpenClaw가 prefix를 감지하여 자동으로 Sonar 전송 방식으로 전환합니다.

    <Tip>
    OpenRouter 전송 방식은 이미 OpenRouter 계정이 있고 여러 프로바이더에
    걸쳐 청구를 통합하고자 하는 경우 유용합니다.
    </Tip>

  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Perplexity 검색 도구" href="/tools/perplexity-search" icon="magnifying-glass">
    에이전트가 Perplexity 검색을 호출하고 결과를 해석하는 방법.
  </Card>
  <Card title="설정 레퍼런스" href="/gateway/configuration-reference" icon="gear">
    플러그인 엔트리를 포함한 전체 설정 레퍼런스.
  </Card>
</CardGroup>
