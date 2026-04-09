---
title: "Honcho 메모리"
summary: "Honcho 플러그인을 통한 AI 네이티브 크로스 세션 메모리"
read_when:
  - 세션 및 채널 간에 작동하는 영구 메모리를 원할 때
  - AI 기반 회상 및 사용자 모델링을 원할 때
---

# Honcho 메모리

[Honcho](https://honcho.dev)는 OpenClaw에 AI 네이티브 메모리를 추가합니다. 대화를 전용 서비스에 영속화하고 시간이 지남에 따라 사용자 및 에이전트 모델을 빌드하여, 에이전트가 워크스페이스 마크다운 파일을 넘어서는 크로스 세션 컨텍스트를 갖게 합니다.

## 제공하는 것

- **크로스 세션 메모리** -- 모든 턴 후 대화가 영속화되어 세션 재설정, 컴팩션, 채널 전환을 가로질러 컨텍스트가 유지됩니다.
- **사용자 모델링** -- Honcho는 각 사용자 (선호도, 사실, 의사소통 스타일)와 에이전트 (개성, 학습된 동작)에 대한 프로파일을 유지합니다.
- **시맨틱 검색** -- 현재 세션만이 아닌 과거 대화의 관찰에 걸쳐 검색합니다.
- **멀티 에이전트 인식** -- 부모 에이전트는 자동으로 생성된 서브 에이전트를 추적하며, 부모는 자식 세션의 관찰자로 추가됩니다.

## 사용 가능한 도구

Honcho는 에이전트가 대화 중에 사용할 수 있는 도구를 등록합니다:

**데이터 검색 (빠름, LLM 호출 없음):**

| 도구                        | 기능                                                    |
| --------------------------- | ------------------------------------------------------- |
| `honcho_context`            | 세션 간 전체 사용자 표현                                |
| `honcho_search_conclusions` | 저장된 결론에 대한 시맨틱 검색                          |
| `honcho_search_messages`    | 세션 간 메시지 검색 (발신자, 날짜로 필터링)             |
| `honcho_session`            | 현재 세션 히스토리 및 요약                              |

**Q&A (LLM 기반):**

| 도구         | 기능                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| `honcho_ask` | 사용자에 대해 질문합니다. 사실은 `depth='quick'`, 합성은 `'thorough'`          |

## 시작하기

플러그인을 설치하고 설정을 실행하십시오:

```bash
openclaw plugins install @honcho-ai/openclaw-honcho
openclaw honcho setup
openclaw gateway --force
```

설정 명령은 API 자격 증명을 입력 받고, 구성을 작성하며, 선택적으로 기존 워크스페이스 메모리 파일을 마이그레이션합니다.

<Info>
Honcho는 완전히 로컬 (자체 호스팅) 또는 `api.honcho.dev`의 관리형 API를 통해 실행될 수 있습니다. 자체 호스팅 옵션에는 외부 종속성이 필요하지 않습니다.
</Info>

## 구성

설정은 `plugins.entries["openclaw-honcho"].config` 아래에 있습니다:

```json5
{
  plugins: {
    entries: {
      "openclaw-honcho": {
        config: {
          apiKey: "your-api-key", // 자체 호스팅의 경우 생략
          workspaceId: "openclaw", // 메모리 격리
          baseUrl: "https://api.honcho.dev",
        },
      },
    },
  },
}
```

자체 호스팅 인스턴스의 경우, `baseUrl`을 로컬 서버 (예: `http://localhost:8000`)로 지정하고 API 키를 생략하십시오.

## 기존 메모리 마이그레이션

기존 워크스페이스 메모리 파일 (`USER.md`, `MEMORY.md`, `IDENTITY.md`, `memory/`, `canvas/`)이 있는 경우, `openclaw honcho setup`이 감지하여 마이그레이션을 제공합니다.

<Info>
마이그레이션은 비파괴적입니다 -- 파일이 Honcho에 업로드됩니다. 원본은 절대 삭제되거나 이동되지 않습니다.
</Info>

## 작동 방식

모든 AI 턴 후 대화가 Honcho에 영속화됩니다. 사용자와 에이전트 메시지 모두 관찰되어 Honcho가 시간이 지남에 따라 모델을 빌드하고 개선할 수 있습니다.

대화 중에 Honcho 도구는 `before_prompt_build` 단계에서 서비스를 쿼리하여 모델이 프롬프트를 보기 전에 관련 컨텍스트를 주입합니다. 이는 정확한 턴 경계와 관련 회상을 보장합니다.

## Honcho 대 내장 메모리

|                   | 내장 / QMD                   | Honcho                              |
| ----------------- | ---------------------------- | ----------------------------------- |
| **저장소**        | 워크스페이스 마크다운 파일   | 전용 서비스 (로컬 또는 호스팅)      |
| **크로스 세션**   | 메모리 파일을 통해           | 자동, 내장                          |
| **사용자 모델링** | 수동 (MEMORY.md에 씀)         | 자동 프로파일                       |
| **검색**          | 벡터 + 키워드 (하이브리드)   | 관찰에 대한 시맨틱                  |
| **멀티 에이전트** | 추적 안 됨                   | 부모/자식 인식                      |
| **종속성**        | 없음 (내장) 또는 QMD 바이너리 | 플러그인 설치                       |

Honcho와 내장 메모리 시스템은 함께 작동할 수 있습니다. QMD가 구성된 경우, Honcho의 크로스 세션 메모리와 함께 로컬 마크다운 파일을 검색하기 위한 추가 도구를 사용할 수 있습니다.

## CLI 명령어

```bash
openclaw honcho setup                        # API 키 구성 및 파일 마이그레이션
openclaw honcho status                       # 연결 상태 확인
openclaw honcho ask <question>               # 사용자에 대해 Honcho에 질문
openclaw honcho search <query> [-k N] [-d D] # 메모리에 대한 시맨틱 검색
```

## 추가 읽기

- [플러그인 소스 코드](https://github.com/plastic-labs/openclaw-honcho)
- [Honcho 문서](https://docs.honcho.dev)
- [Honcho OpenClaw 통합 가이드](https://docs.honcho.dev/v3/guides/integrations/openclaw)
- [메모리](/concepts/memory) -- OpenClaw 메모리 개요
- [컨텍스트 엔진](/concepts/context-engine) -- 플러그인 컨텍스트 엔진 작동 방식
