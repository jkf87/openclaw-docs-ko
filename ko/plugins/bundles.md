---
summary: "Codex, Claude, Cursor 번들을 OpenClaw 플러그인으로 설치하고 사용합니다"
read_when:
  - Codex, Claude, 또는 Cursor 호환 번들을 설치하려고 할 때
  - OpenClaw가 번들 콘텐츠를 네이티브 기능으로 매핑하는 방법을 이해해야 할 때
  - 번들 감지 또는 누락된 기능을 디버깅할 때
title: "플러그인 번들"
---

# 플러그인 번들

OpenClaw는 세 가지 외부 에코시스템에서 플러그인을 설치할 수 있습니다: **Codex**, **Claude**,
**Cursor**. 이들을 **번들**이라고 합니다 — OpenClaw가 스킬, 훅, MCP 도구와 같은 네이티브 기능으로
매핑하는 콘텐츠 및 메타데이터 팩입니다.

<Info>
  번들은 네이티브 OpenClaw 플러그인과 **다릅니다**. 네이티브 플러그인은
  인프로세스로 실행되며 어떤 기능이든 등록할 수 있습니다. 번들은 선택적 기능 매핑과
  더 좁은 신뢰 경계를 가진 콘텐츠 팩입니다.
</Info>

## 번들이 존재하는 이유

유용한 플러그인 중 많은 것이 Codex, Claude, 또는 Cursor 형식으로 게시됩니다. 작성자가
네이티브 OpenClaw 플러그인으로 다시 작성해야 하는 요구사항 대신, OpenClaw는
이러한 형식을 감지하고 지원되는 콘텐츠를 네이티브 기능 세트로 매핑합니다. 즉,
Claude 명령 팩이나 Codex 스킬 번들을 설치하여 즉시 사용할 수 있습니다.

## 번들 설치하기

<Steps>
  <Step title="디렉토리, 아카이브, 또는 마켓플레이스에서 설치">
    ```bash
    # 로컬 디렉토리
    openclaw plugins install ./my-bundle

    # 아카이브
    openclaw plugins install ./my-bundle.tgz

    # Claude 마켓플레이스
    openclaw plugins marketplace list <marketplace-name>
    openclaw plugins install <plugin-name>@<marketplace-name>
    ```

  </Step>

  <Step title="감지 확인">
    ```bash
    openclaw plugins list
    openclaw plugins inspect <id>
    ```

    번들은 `codex`, `claude`, 또는 `cursor` 하위 유형과 함께 `Format: bundle`로 표시됩니다.

  </Step>

  <Step title="재시작 및 사용">
    ```bash
    openclaw gateway restart
    ```

    매핑된 기능(스킬, 훅, MCP 도구, LSP 기본값)은 다음 세션에서 사용 가능합니다.

  </Step>
</Steps>

## OpenClaw가 번들에서 매핑하는 항목

오늘날 모든 번들 기능이 OpenClaw에서 실행되지는 않습니다. 현재 작동하는 것과
감지되었지만 아직 연결되지 않은 것이 있습니다.

### 현재 지원됨

| 기능          | 매핑 방법                                                                                 | 적용 대상     |
| ------------- | ------------------------------------------------------------------------------------------- | -------------- |
| 스킬 콘텐츠   | 번들 스킬 루트가 일반 OpenClaw 스킬로 로드됨                                               | 모든 형식    |
| 명령어         | `commands/` 및 `.cursor/commands/`가 스킬 루트로 처리됨                                    | Claude, Cursor |
| 훅 팩         | OpenClaw 스타일 `HOOK.md` + `handler.ts` 레이아웃                                          | Codex          |
| MCP 도구      | 번들 MCP 구성이 내장 Pi 설정에 병합됨; 지원되는 stdio 및 HTTP 서버 로드                    | 모든 형식    |
| LSP 서버      | Claude `.lsp.json` 및 매니페스트에 선언된 `lspServers`가 내장 Pi LSP 기본값으로 병합됨     | Claude         |
| 설정          | Claude `settings.json`이 내장 Pi 기본값으로 임포트됨                                       | Claude         |

#### 스킬 콘텐츠

- 번들 스킬 루트는 일반 OpenClaw 스킬 루트로 로드됩니다
- Claude `commands` 루트는 추가 스킬 루트로 처리됩니다
- Cursor `.cursor/commands` 루트는 추가 스킬 루트로 처리됩니다

즉, Claude 마크다운 명령 파일은 일반 OpenClaw 스킬
로더를 통해 작동합니다. Cursor 명령 마크다운도 동일한 경로를 통해 작동합니다.

#### 훅 팩

- 번들 훅 루트는 **오직** 일반 OpenClaw 훅-팩
  레이아웃을 사용할 때만 작동합니다. 현재 이것은 주로 Codex 호환 케이스입니다:
  - `HOOK.md`
  - `handler.ts` 또는 `handler.js`

#### Pi용 MCP

- 활성화된 번들은 MCP 서버 구성을 제공할 수 있습니다
- OpenClaw는 번들 MCP 구성을 효과적인 내장 Pi 설정에 `mcpServers`로 병합합니다
- OpenClaw는 stdio 서버를 실행하거나 HTTP 서버에 연결하여 내장 Pi 에이전트 턴 중에 지원되는 번들 MCP 도구를 노출합니다
- 프로젝트-로컬 Pi 설정은 번들 기본값 이후에도 적용되므로, 필요할 때 작업 공간 설정이 번들 MCP 항목을 재정의할 수 있습니다
- 번들 MCP 도구 카탈로그는 등록 전에 결정론적으로 정렬되므로, 업스트림 `listTools()` 순서 변경이 프롬프트 캐시 도구 블록을 교란하지 않습니다

##### 전송

MCP 서버는 stdio 또는 HTTP 전송을 사용할 수 있습니다:

**Stdio**는 자식 프로세스를 시작합니다:

```json
{
  "mcp": {
    "servers": {
      "my-server": {
        "command": "node",
        "args": ["server.js"],
        "env": { "PORT": "3000" }
      }
    }
  }
}
```

**HTTP**는 기본적으로 `sse`로, 또는 요청 시 `streamable-http`로 실행 중인 MCP 서버에 연결합니다:

```json
{
  "mcp": {
    "servers": {
      "my-server": {
        "url": "http://localhost:3100/mcp",
        "transport": "streamable-http",
        "headers": {
          "Authorization": "Bearer ${MY_SECRET_TOKEN}"
        },
        "connectionTimeoutMs": 30000
      }
    }
  }
}
```

- `transport`는 `"streamable-http"` 또는 `"sse"`로 설정할 수 있습니다; 생략하면 OpenClaw는 `sse`를 사용합니다
- `http:` 및 `https:` URL 스킴만 허용됩니다
- `headers` 값은 `${ENV_VAR}` 보간을 지원합니다
- `command`와 `url`이 모두 있는 서버 항목은 거부됩니다
- URL 자격 증명(사용자 정보 및 쿼리 매개변수)은 도구 설명 및 로그에서 제거됩니다
- `connectionTimeoutMs`는 stdio 및 HTTP 전송 모두에 대해 기본 30초 연결 타임아웃을 재정의합니다

##### 도구 이름 지정

OpenClaw는 번들 MCP 도구를 `serverName__toolName` 형식의 프로바이더 안전 이름으로 등록합니다.
예를 들어, `memory_search` 도구를 노출하는 `"vigil-harbor"` 서버는 `vigil-harbor__memory_search`로 등록됩니다.

- `A-Za-z0-9_-` 외의 문자는 `-`로 교체됩니다
- 서버 접두사는 30자로 제한됩니다
- 전체 도구 이름은 64자로 제한됩니다
- 빈 서버 이름은 `mcp`로 폴백됩니다
- 충돌하는 정제된 이름은 숫자 접미사로 구별됩니다
- 최종 노출된 도구 순서는 안전 이름으로 결정론적이어서 반복적인 Pi 턴 캐시가 안정적입니다

#### 내장 Pi 설정

- Claude `settings.json`은 번들이 활성화될 때 기본 내장 Pi 설정으로 임포트됩니다
- OpenClaw는 적용하기 전에 셸 재정의 키를 삭제합니다

삭제된 키:

- `shellPath`
- `shellCommandPrefix`

#### 내장 Pi LSP

- 활성화된 Claude 번들은 LSP 서버 구성을 제공할 수 있습니다
- OpenClaw는 `.lsp.json` 및 매니페스트에 선언된 `lspServers` 경로를 로드합니다
- 번들 LSP 구성은 효과적인 내장 Pi LSP 기본값으로 병합됩니다
- 오늘날 지원되는 stdio 기반 LSP 서버만 실행 가능합니다; 지원되지 않는
  전송은 `openclaw plugins inspect <id>`에 표시됩니다

### 감지되었지만 실행되지 않음

이들은 인식되고 진단에 표시되지만 OpenClaw가 실행하지 않습니다:

- Claude `agents`, `hooks.json` 자동화, `outputStyles`
- Cursor `.cursor/agents`, `.cursor/hooks.json`, `.cursor/rules`
- Codex 인라인/앱 메타데이터(기능 보고 외)

## 번들 형식

<AccordionGroup>
  <Accordion title="Codex 번들">
    마커: `.codex-plugin/plugin.json`

    선택적 콘텐츠: `skills/`, `hooks/`, `.mcp.json`, `.app.json`

    Codex 번들은 스킬 루트와 OpenClaw 스타일의 훅-팩 디렉토리(`HOOK.md` + `handler.ts`)를
    사용할 때 OpenClaw에 가장 잘 맞습니다.

  </Accordion>

  <Accordion title="Claude 번들">
    두 가지 감지 모드:

    - **매니페스트 기반:** `.claude-plugin/plugin.json`
    - **매니페스트 없음:** 기본 Claude 레이아웃(`skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json`, `.lsp.json`, `settings.json`)

    Claude 전용 동작:

    - `commands/`는 스킬 콘텐츠로 처리됩니다
    - `settings.json`은 내장 Pi 설정으로 임포트됩니다(셸 재정의 키는 삭제됩니다)
    - `.mcp.json`은 지원되는 stdio 도구를 내장 Pi에 노출합니다
    - `.lsp.json` 및 매니페스트에 선언된 `lspServers` 경로가 내장 Pi LSP 기본값으로 로드됩니다
    - `hooks/hooks.json`은 감지되지만 실행되지 않습니다
    - 매니페스트의 커스텀 구성 요소 경로는 추가적입니다(기본값을 대체하지 않고 확장합니다)

  </Accordion>

  <Accordion title="Cursor 번들">
    마커: `.cursor-plugin/plugin.json`

    선택적 콘텐츠: `skills/`, `.cursor/commands/`, `.cursor/agents/`, `.cursor/rules/`, `.cursor/hooks.json`, `.mcp.json`

    - `.cursor/commands/`는 스킬 콘텐츠로 처리됩니다
    - `.cursor/rules/`, `.cursor/agents/`, 및 `.cursor/hooks.json`은 감지만 됩니다

  </Accordion>
</AccordionGroup>

## 감지 우선순위

OpenClaw는 먼저 네이티브 플러그인 형식을 확인합니다:

1. `openclaw.plugin.json` 또는 `openclaw.extensions`가 있는 유효한 `package.json` — **네이티브 플러그인**으로 처리
2. 번들 마커(`.codex-plugin/`, `.claude-plugin/`, 또는 기본 Claude/Cursor 레이아웃) — **번들**로 처리

디렉토리에 둘 다 있는 경우, OpenClaw는 네이티브 경로를 사용합니다. 이렇게 하면
이중 형식 패키지가 번들로 부분 설치되는 것을 방지합니다.

## 보안

번들은 네이티브 플러그인보다 더 좁은 신뢰 경계를 가집니다:

- OpenClaw는 임의의 번들 런타임 모듈을 인프로세스로 로드하지 **않습니다**
- 스킬 및 훅-팩 경로는 플러그인 루트 내에 있어야 합니다(경계 검사됨)
- 설정 파일은 동일한 경계 검사로 읽힙니다
- 지원되는 stdio MCP 서버는 서브프로세스로 시작될 수 있습니다

이렇게 하면 번들이 기본적으로 더 안전하지만, 노출하는 기능에 대해 서드파티
번들을 신뢰할 수 있는 콘텐츠로 취급해야 합니다.

## 문제 해결

<AccordionGroup>
  <Accordion title="번들이 감지되었지만 기능이 실행되지 않음">
    `openclaw plugins inspect <id>`를 실행하십시오. 기능이 나열되었지만 연결되지 않은 것으로
    표시되면 이는 제품 제한입니다 — 설치 오류가 아닙니다.
  </Accordion>

  <Accordion title="Claude 명령 파일이 표시되지 않음">
    번들이 활성화되어 있고 마크다운 파일이 감지된 `commands/` 또는 `skills/` 루트 내에
    있는지 확인하십시오.
  </Accordion>

  <Accordion title="Claude 설정이 적용되지 않음">
    `settings.json`의 내장 Pi 설정만 지원됩니다. OpenClaw는
    번들 설정을 원시 구성 패치로 처리하지 않습니다.
  </Accordion>

  <Accordion title="Claude 훅이 실행되지 않음">
    `hooks/hooks.json`은 감지만 됩니다. 실행 가능한 훅이 필요하다면,
    OpenClaw 훅-팩 레이아웃을 사용하거나 네이티브 플러그인을 제공하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

- [플러그인 설치 및 구성](/tools/plugin)
- [플러그인 빌드하기](/plugins/building-plugins) — 네이티브 플러그인 만들기
- [플러그인 매니페스트](/plugins/manifest) — 네이티브 매니페스트 스키마
