---
title: "OpenProse"
description: "OpenProse: OpenClaw의 .prose 워크플로, 슬래시 명령어, 상태"
---

# OpenProse

OpenProse는 AI 세션 오케스트레이션을 위한 이식 가능한 마크다운 우선 워크플로 형식입니다. OpenClaw에서는 OpenProse 스킬 팩과 `/prose` 슬래시 명령어를 설치하는 플러그인으로 제공됩니다. 프로그램은 `.prose` 파일에 존재하며 명시적 제어 플로로 여러 서브에이전트를 생성할 수 있습니다.

공식 사이트: [https://www.prose.md](https://www.prose.md)

## 무엇을 할 수 있습니까

- 명시적 병렬성을 갖춘 멀티에이전트 리서치 + 합성.
- 반복 가능한 승인 안전 워크플로 (코드 리뷰, 인시던트 분류, 콘텐츠 파이프라인).
- 지원되는 에이전트 런타임에서 실행할 수 있는 재사용 가능한 `.prose` 프로그램.

## 설치 + 활성화

번들 플러그인은 기본적으로 비활성화됩니다. OpenProse를 활성화하십시오:

```bash
openclaw plugins enable open-prose
```

플러그인 활성화 후 게이트웨이를 재시작하십시오.

개발/로컬 체크아웃: `openclaw plugins install ./path/to/local/open-prose-plugin`

관련 문서: [플러그인](/tools/plugin), [플러그인 매니페스트](/plugins/manifest), [스킬](/tools/skills).

## 슬래시 명령어

OpenProse는 `/prose`를 사용자 호출 가능한 스킬 명령어로 등록합니다. OpenProse VM 지침으로 라우팅되며 내부적으로 OpenClaw 도구를 사용합니다.

일반 명령어:

```
/prose help
/prose run &lt;file.prose&gt;
/prose run &lt;handle/slug&gt;
/prose run &lt;https://example.com/file.prose&gt;
/prose compile &lt;file.prose&gt;
/prose examples
/prose update
```

## 예시: 간단한 `.prose` 파일

```prose
# Research + synthesis with two agents running in parallel.

input topic: "What should we research?"

agent researcher:
  model: sonnet
  prompt: "You research thoroughly and cite sources."

agent writer:
  model: opus
  prompt: "You write a concise summary."

parallel:
  findings = session: researcher
    prompt: "Research {topic}."
  draft = session: writer
    prompt: "Summarize {topic}."

session "Merge the findings + draft into a final answer."
context: { findings, draft }
```

## 파일 위치

OpenProse는 워크스페이스의 `.prose/` 아래에 상태를 유지합니다:

```
.prose/
├── .env
├── runs/
│   └── {YYYYMMDD}-{HHMMSS}-{random}/
│       ├── program.prose
│       ├── state.md
│       ├── bindings/
│       └── agents/
└── agents/
```

사용자 수준의 영구 에이전트는 다음에 있습니다:

```
~/.prose/agents/
```

## 상태 모드

OpenProse는 여러 상태 백엔드를 지원합니다:

- **filesystem** (기본값): `.prose/runs/...`
- **in-context**: 소규모 프로그램용 일시적
- **sqlite** (실험적): `sqlite3` 바이너리 필요
- **postgres** (실험적): `psql` 및 연결 문자열 필요

참고:

- sqlite/postgres는 옵트인이며 실험적입니다.
- postgres 자격 증명은 서브에이전트 로그로 흐릅니다. 전용 최소 권한 DB를 사용하십시오.

## 원격 프로그램

`/prose run &lt;handle/slug&gt;`는 `https://p.prose.md/&lt;handle&gt;/&lt;slug&gt;`로 해결됩니다.
직접 URL은 그대로 가져옵니다. 이는 `web_fetch` 도구(또는 POST용 `exec`)를 사용합니다.

## OpenClaw 런타임 매핑

OpenProse 프로그램은 OpenClaw 프리미티브에 매핑됩니다:

| OpenProse 개념            | OpenClaw 도구    |
| ------------------------- | ---------------- |
| Spawn session / Task tool | `sessions_spawn` |
| File read/write           | `read` / `write` |
| Web fetch                 | `web_fetch`      |

도구 허용 목록이 이러한 도구를 차단하면 OpenProse 프로그램이 실패합니다. [스킬 구성](/tools/skills-config)을 참조하십시오.

## 보안 + 승인

`.prose` 파일을 코드처럼 취급하십시오. 실행 전에 검토하십시오. OpenClaw 도구 허용 목록과 승인 게이트를 사용하여 부작용을 제어하십시오.

결정론적, 승인 게이트 워크플로의 경우 [Lobster](/tools/lobster)와 비교하십시오.
