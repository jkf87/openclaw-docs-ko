---
title: "코드 실행"
description: "code_execution -- xAI로 샌드박스 처리된 원격 Python 분석 실행"
---

# 코드 실행

`code_execution`은 xAI의 Responses API에서 샌드박스 처리된 원격 Python 분석을 실행합니다.
이것은 로컬 [`exec`](/tools/exec)와 다릅니다:

- `exec`는 귀하의 머신이나 노드에서 셸 명령을 실행합니다
- `code_execution`은 xAI의 원격 샌드박스에서 Python을 실행합니다

다음을 위해 `code_execution`을 사용합니다:

- 계산
- 표 작성
- 빠른 통계
- 차트 스타일 분석
- `x_search` 또는 `web_search`에서 반환된 데이터 분석

로컬 파일, 셸, 리포지토리, 또는 페어링된 디바이스가 필요한 경우 사용하지 **마십시오**. 그 경우에는 [`exec`](/tools/exec)를 사용하십시오.

## 설정

xAI API 키가 필요합니다. 다음 중 하나를 사용합니다:

- `XAI_API_KEY`
- `plugins.entries.xai.config.webSearch.apiKey`

예시:

```json5
{
  plugins: {
    entries: {
      xai: {
        config: {
          webSearch: {
            apiKey: "xai-...",
          },
          codeExecution: {
            enabled: true,
            model: "grok-4-1-fast",
            maxTurns: 2,
            timeoutSeconds: 30,
          },
        },
      },
    },
  },
}
```

## 사용 방법

자연스럽게 요청하되 분석 의도를 명확히 하십시오:

```text
Use code_execution to calculate the 7-day moving average for these numbers: ...
```

```text
Use x_search to find posts mentioning OpenClaw this week, then use code_execution to count them by day.
```

```text
Use web_search to gather the latest AI benchmark numbers, then use code_execution to compare percent changes.
```

도구는 내부적으로 단일 `task` 파라미터를 사용하므로 에이전트는 하나의 프롬프트에 전체 분석 요청과 인라인 데이터를 보내야 합니다.

## 제한 사항

- 이것은 원격 xAI 실행이며 로컬 프로세스 실행이 아닙니다.
- 지속적인 노트북이 아닌 임시 분석으로 취급해야 합니다.
- 로컬 파일이나 워크스페이스에 대한 접근을 가정하지 마십시오.
- 최신 X 데이터의 경우 먼저 [`x_search`](/tools/web#x_search)를 사용하십시오.

## 관련 항목

- [웹 도구](/tools/web)
- [Exec](/tools/exec)
- [xAI](/providers/xai)
