---
summary: "어시스턴트 출력 전달/렌더링 지시어와 저장된 캔버스 렌더 구조"
read_when:
  - `[embed ...]`, `MEDIA:`, `[[reply_to]]` 같은 리치 출력 지시어를 다루는 경우
  - Control UI의 저장된 리치 블록 구조를 이해해야 하는 경우
title: "리치 출력 프로토콜"
---

# Rich Output Protocol

어시스턴트 출력에는 소수의 전달/렌더링 지시어가 포함될 수 있습니다:

- `MEDIA:` — 첨부 파일 전달
- `[[audio_as_voice]]` — 오디오 표시 힌트
- `[[reply_to_current]]` / `[[reply_to:<id>]]` — 회신 메타데이터
- `[embed ...]` — Control UI 리치 렌더링

이 지시어들은 서로 분리되어 있습니다. `MEDIA:`와 회신/음성 태그는 전달 메타데이터로 남고, `[embed ...]`는 웹 전용 리치 렌더 경로입니다.

## `[embed ...]`

`[embed ...]`는 Control UI용 유일한 에이전트 대상 리치 렌더 구문입니다.

자체 종료 예시:

```text
[embed ref="cv_123" title="Status" /]
```

규칙:

- `[view ...]`는 새 출력에서 더 이상 유효하지 않습니다.
- embed 숏코드는 어시스턴트 메시지 서페이스에서만 렌더됩니다.
- URL 기반 embed만 렌더됩니다. `ref="..."` 또는 `url="..."`를 사용하세요.
- 블록 형식의 인라인 HTML embed 숏코드는 렌더되지 않습니다.
- 웹 UI는 숏코드를 가시 텍스트에서 제거하고 embed를 인라인으로 렌더합니다.
- `MEDIA:`는 embed 별칭이 아니므로 리치 embed 렌더링에 사용하면 안 됩니다.

## 저장된 렌더 형태

정규화되어 저장되는 어시스턴트 콘텐츠 블록은 구조화된 `canvas` 항목입니다:

```json
{
  "type": "canvas",
  "preview": {
    "kind": "canvas",
    "surface": "assistant_message",
    "render": "url",
    "viewId": "cv_123",
    "url": "/__openclaw__/canvas/documents/cv_123/index.html",
    "title": "Status",
    "preferredHeight": 320
  }
}
```

저장/렌더되는 리치 블록은 이 `canvas` 형태를 직접 사용합니다. `present_view`는 인식되지 않습니다.
