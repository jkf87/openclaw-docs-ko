---
title: "Perplexity (프로바이더)"
summary: "Perplexity 웹 검색 프로바이더 설정 (API 키, 검색 모드, 필터링)"
read_when:
  - Perplexity를 웹 검색 프로바이더로 구성하려는 경우
  - Perplexity API 키 또는 OpenRouter 프록시 설정이 필요한 경우
---

# Perplexity (웹 검색 프로바이더)

Perplexity 플러그인은 Perplexity Search API 또는 OpenRouter를 통한 Perplexity Sonar를 통해 웹 검색 기능을 제공합니다.

<Note>
이 페이지는 Perplexity **프로바이더** 설정을 다룹니다. Perplexity **도구** (에이전트가 이를 사용하는 방법)에 대해서는 [Perplexity 도구](/tools/perplexity-search)를 참조하십시오.
</Note>

- 유형: 웹 검색 프로바이더 (모델 프로바이더 아님)
- 인증: `PERPLEXITY_API_KEY` (직접) 또는 `OPENROUTER_API_KEY` (OpenRouter 경유)
- 구성 경로: `plugins.entries.perplexity.config.webSearch.apiKey`

## 빠른 시작

1. API 키 설정:

```bash
openclaw configure --section web
```

또는 직접 설정:

```bash
openclaw config set plugins.entries.perplexity.config.webSearch.apiKey "pplx-xxxxxxxxxxxx"
```

2. 구성되면 에이전트가 자동으로 웹 검색에 Perplexity를 사용합니다.

## 검색 모드

플러그인은 API 키 접두사에 따라 전송을 자동으로 선택합니다:

| 키 접두사  | 전송                        | 기능                                             |
| ---------- | --------------------------- | ------------------------------------------------ |
| `pplx-`    | 네이티브 Perplexity Search API | 구조화된 결과, 도메인/언어/날짜 필터             |
| `sk-or-`   | OpenRouter (Sonar)          | 인용이 포함된 AI 합성 답변                       |

## 네이티브 API 필터링

네이티브 Perplexity API (`pplx-` 키) 사용 시 검색은 다음을 지원합니다:

- **국가**: 2자리 국가 코드
- **언어**: ISO 639-1 언어 코드
- **날짜 범위**: 일, 주, 월, 년
- **도메인 필터**: 허용 목록/차단 목록 (최대 20개 도메인)
- **콘텐츠 예산**: `max_tokens`, `max_tokens_per_page`

## 환경 참고 사항

게이트웨이가 데몬(launchd/systemd)으로 실행되는 경우 해당 프로세스에서 `PERPLEXITY_API_KEY`를 사용할 수 있어야 합니다 (예: `~/.openclaw/.env` 또는 `env.shellEnv`를 통해).
