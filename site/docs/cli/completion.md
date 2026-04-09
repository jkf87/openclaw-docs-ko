---
title: "completion"
description: "`openclaw completion`에 대한 CLI 참조 (셸 자동완성 스크립트 생성/설치)"
---

# `openclaw completion`

셸 자동완성 스크립트를 생성하고 선택적으로 셸 프로파일에 설치합니다.

## 사용법

```bash
openclaw completion
openclaw completion --shell zsh
openclaw completion --install
openclaw completion --shell fish --install
openclaw completion --write-state
openclaw completion --shell bash --write-state
```

## 옵션

- `-s, --shell &lt;shell&gt;`: 셸 대상 (`zsh`, `bash`, `powershell`, `fish`; 기본값: `zsh`)
- `-i, --install`: 셸 프로파일에 소스 줄을 추가하여 자동완성 설치
- `--write-state`: stdout에 출력하지 않고 `$OPENCLAW_STATE_DIR/completions`에 자동완성 스크립트를 작성
- `-y, --yes`: 설치 확인 프롬프트 건너뛰기

## 참고사항

- `--install`은 셸 프로파일에 작은 "OpenClaw Completion" 블록을 작성하고 캐시된 스크립트를 가리킵니다.
- `--install` 또는 `--write-state` 없이 명령은 스크립트를 stdout으로 출력합니다.
- 자동완성 생성은 중첩된 하위 명령이 포함되도록 명령 트리를 즉시 로드합니다.
