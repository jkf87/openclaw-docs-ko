---
summary: "구성된 Ollama 호스트를 통한 Ollama 웹 검색"
read_when:
  - web_search에 Ollama를 사용하려는 경우
  - 키 없는 web_search 프로바이더를 원하는 경우
  - Ollama 웹 검색 설정 안내가 필요한 경우
title: "Ollama 웹 검색"
---

# Ollama 웹 검색

OpenClaw는 번들된 `web_search` 프로바이더로 **Ollama 웹 검색**을 지원합니다.
Ollama의 실험적 웹 검색 API를 사용하여 제목, URL, 스니펫이 포함된 구조화된 결과를 반환합니다.

Ollama 모델 프로바이더와 달리 이 설정은 기본적으로 API 키가 필요하지 않습니다. 다음이 필요합니다:

- OpenClaw에서 접근 가능한 Ollama 호스트
- `ollama signin`

## 설정

<Steps>
  <Step title="Ollama 시작">
    Ollama가 설치되어 실행 중인지 확인합니다.
  </Step>
  <Step title="로그인">
    실행합니다:

    ```bash
    ollama signin
    ```

  </Step>
  <Step title="Ollama 웹 검색 선택">
    실행합니다:

    ```bash
    openclaw configure --section web
    ```

    그런 다음 **Ollama Web Search**를 프로바이더로 선택합니다.

  </Step>
</Steps>

모델에 Ollama를 이미 사용 중인 경우 Ollama 웹 검색은 동일한 구성된 호스트를 재사용합니다.

## 설정

```json5
{
  tools: {
    web: {
      search: {
        provider: "ollama",
      },
    },
  },
}
```

선택적 Ollama 호스트 재정의:

```json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: "http://ollama-host:11434",
      },
    },
  },
}
```

명시적 Ollama 기본 URL이 설정되지 않은 경우 OpenClaw는 `http://127.0.0.1:11434`를 사용합니다.

Ollama 호스트가 베어러 인증을 예상하는 경우 OpenClaw는 웹 검색 요청에도 `models.providers.ollama.apiKey` (또는 일치하는 환경 기반 프로바이더 인증)를 재사용합니다.

## 참고 사항

- 이 프로바이더에는 웹 검색 특정 API 키 필드가 필요하지 않습니다.
- Ollama 호스트가 인증으로 보호된 경우 OpenClaw는 사용 가능한 경우 일반 Ollama 프로바이더 API 키를 재사용합니다.
- OpenClaw는 설정 중 Ollama에 연결할 수 없거나 로그인되지 않은 경우 경고하지만 선택을 차단하지는 않습니다.
- 런타임 자동 감지는 우선순위가 높은 자격 증명이 있는 프로바이더가 설정되지 않은 경우 Ollama 웹 검색으로 폴백할 수 있습니다.
- 프로바이더는 Ollama의 실험적 `/api/experimental/web_search` 엔드포인트를 사용합니다.

## 관련 항목

- [웹 검색 개요](/tools/web) -- 모든 프로바이더 및 자동 감지
- [Ollama](/providers/ollama) -- Ollama 모델 설정 및 클라우드/로컬 모드
