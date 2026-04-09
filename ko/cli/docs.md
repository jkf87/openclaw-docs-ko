---
summary: "`openclaw docs`에 대한 CLI 참조 (라이브 문서 인덱스 검색)"
read_when:
  - 터미널에서 라이브 OpenClaw 문서를 검색하려는 경우
title: "docs"
---

# `openclaw docs`

라이브 문서 인덱스를 검색합니다.

인수:

- `[query...]`: 라이브 문서 인덱스에 전송할 검색어

예시:

```bash
openclaw docs
openclaw docs browser existing-session
openclaw docs sandbox allowHostControl
openclaw docs gateway token secretref
```

참고사항:

- 쿼리 없이 `openclaw docs`는 라이브 문서 검색 진입점을 엽니다.
- 여러 단어 쿼리는 하나의 검색 요청으로 전달됩니다.
