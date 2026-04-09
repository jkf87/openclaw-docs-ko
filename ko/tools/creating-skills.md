---
title: "스킬 생성"
summary: "SKILL.md로 커스텀 워크스페이스 스킬 개발 및 테스트"
read_when:
  - 워크스페이스에 새로운 커스텀 스킬을 생성하는 경우
  - SKILL.md 기반 스킬의 빠른 시작 워크플로우가 필요한 경우
---

# 스킬 생성

스킬은 에이전트에게 도구를 사용하는 방법과 시기를 가르칩니다. 각 스킬은 YAML 프론트매터와 마크다운 지침이 있는 `SKILL.md` 파일이 들어 있는 디렉토리입니다.

스킬이 로드되고 우선순위가 결정되는 방법에 대해서는 [스킬](/tools/skills)을 참조하십시오.

## 첫 번째 스킬 만들기

<Steps>
  <Step title="스킬 디렉토리 생성">
    스킬은 워크스페이스에 저장됩니다. 새 폴더를 생성합니다:

    ```bash
    mkdir -p ~/.openclaw/workspace/skills/hello-world
    ```

  </Step>

  <Step title="SKILL.md 작성">
    해당 디렉토리 안에 `SKILL.md`를 생성합니다. 프론트매터는 메타데이터를 정의하고, 마크다운 본문은 에이전트에 대한 지침을 담습니다.

    ```markdown
    ---
    name: hello_world
    description: A simple skill that says hello.
    ---

    # Hello World Skill

    When the user asks for a greeting, use the `echo` tool to say
    "Hello from your custom skill!".
    ```

  </Step>

  <Step title="도구 추가 (선택 사항)">
    프론트매터에서 커스텀 도구 스키마를 정의하거나 에이전트가 기존 시스템 도구(`exec` 또는 `browser` 등)를 사용하도록 지시할 수 있습니다. 스킬은 또한 플러그인 내부에서 문서화하는 도구와 함께 제공될 수 있습니다.

  </Step>

  <Step title="스킬 로드">
    OpenClaw가 스킬을 가져올 수 있도록 새 세션을 시작합니다:

    ```bash
    # 채팅에서
    /new

    # 또는 게이트웨이 재시작
    openclaw gateway restart
    ```

    스킬이 로드되었는지 확인합니다:

    ```bash
    openclaw skills list
    ```

  </Step>

  <Step title="테스트">
    스킬을 트리거해야 하는 메시지를 보냅니다:

    ```bash
    openclaw agent --message "give me a greeting"
    ```

    또는 에이전트와 채팅하여 인사를 요청합니다.

  </Step>
</Steps>

## 스킬 메타데이터 레퍼런스

YAML 프론트매터는 다음 필드를 지원합니다:

| 필드                                | 필수 여부 | 설명                                            |
| ----------------------------------- | --------- | ----------------------------------------------- |
| `name`                              | 예        | 고유 식별자 (snake_case)                         |
| `description`                       | 예        | 에이전트에게 표시되는 한 줄 설명                 |
| `metadata.openclaw.os`              | 아니오    | OS 필터 (`["darwin"]`, `["linux"]` 등)           |
| `metadata.openclaw.requires.bins`   | 아니오    | PATH에 있어야 하는 바이너리                      |
| `metadata.openclaw.requires.config` | 아니오    | 필수 설정 키                                     |

## 모범 사례

- **간결하게** — 모델에게 AI가 되는 방법이 아니라 _무엇을_ 해야 하는지 지침을 제공합니다
- **안전 우선** — 스킬이 `exec`를 사용하는 경우 프롬프트가 신뢰할 수 없는 입력으로 임의 명령 삽입을 허용하지 않도록 합니다
- **로컬 테스트** — 공유하기 전에 `openclaw agent --message "..."`로 테스트합니다
- **ClawHub 사용** — [ClawHub](https://clawhub.ai)에서 스킬을 탐색하고 기여합니다

## 스킬 저장 위치

| 위치                            | 우선순위 | 범위                     |
| ------------------------------- | -------- | ------------------------ |
| `\<workspace\>/skills/`         | 최고     | 에이전트별               |
| `\<workspace\>/.agents/skills/` | 높음     | 워크스페이스 에이전트별  |
| `~/.agents/skills/`             | 중간     | 공유 에이전트 프로파일   |
| `~/.openclaw/skills/`           | 중간     | 공유 (모든 에이전트)     |
| 번들 (OpenClaw와 함께 제공)     | 낮음     | 전역                     |
| `skills.load.extraDirs`         | 최저     | 커스텀 공유 폴더         |

## 관련 항목

- [스킬 레퍼런스](/tools/skills) — 로드, 우선순위, 게이팅 규칙
- [스킬 설정](/tools/skills-config) — `skills.*` 설정 스키마
- [ClawHub](/tools/clawhub) — 공개 스킬 레지스트리
- [플러그인 개발](/plugins/building-plugins) — 플러그인에 스킬 포함 가능
